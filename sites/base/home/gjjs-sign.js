/**
 * 回调方法，第一个 msg 为提示信息，第二个 status 说明如下：
 *
 * >0 签章服务器失败类型
 * 0 成功
 * <0 签章辅助服务失败类型
 * -1 取文件失败
 * -2 签章失败后，删除待签章文件也失败
 * -3 推送待签章文件失败
 */
var signHelper = (function () {
    var config = {
        //本地Ukey服务地址
        ukey: {
            http: 'http://127.0.0.1:16888?data=',
            https: 'https://127.0.0.1:18666?data='
        },
        //签章服务器地址
        server: 'http://10.10.1.234:31001/PDFCloudSign/servlet',
        //删除签章文件
        deleteUrl: getRootPath() + '/signatureHelper/delFiles',
        //推送文件的请求，返回值必须在包含 {data:{fileIds:'', fileNames:''}} 结构
        pushUrl: '',
        pushParams: function (params) {
            return {ids: params}
        },
        //拉取文件的请求
        pullUrl: '',
        pullParams: function (params, pushResp) {
            return {fileIds: pushResp.data.fileIds}
        },
        signState: "1",//1公章 2个人签名
        ishttps: false
    };

    /**
     * 检查是否插入KEY
     */
    function checkUKey(success, failure) {
        simpleServer(113, 0, undefined, success, failure)
    }

    /**
     * 检查Key口令
     */
    function verifyUKey(success, failure) {
        simpleServer(113, 1, undefined, success, failure)
    }

    /**
     * 清理印章缓存，清理后才会从后台重新获取
     */
    function clearSign(success, failure) {
        simpleServer(101, 4, undefined, success, failure)
    }

    /**
     * 生成签章命令
     */
    function signCmd(sign) {
        if (sign.type == 'pos') {
            var cmd = 'SealByXYPos:' + sign.x + ',' + sign.y + ',' + sign.page + ',' + sign.coordPos + ';';
            if (sign.rotate != 0) {
                cmd += ';' + sign.rotate + ';';
            }
            return cmd;
        } else if (sign.type == 'keyword') {
            var cmd = 'SealByKeyWord:' + NetStarUtils.Base64.encode(sign.keyword + ',' + sign.page + ',' + sign.x + ',' + sign.y + ',0') + ';';
            if (sign.rotate != 0) {
                cmd += ';' + sign.rotate + ';';
            }
            return cmd;
        } else if (sign.type == 'mu') {
            return 'MuPageSeal:' + sign.y + ';'
        }
    }

    /**
     * 坐标方式签章
     */
    function sign(params, options, success, failure) {
        options = $.extend({}, config, options);
        //必须插入key
        checkUKey(function () {
            //校验key密码正确
            verifyUKey(function () {
                //先把 pdf 放到签章服务器，返回值必须在包含 {data:{fileIds:'', fileNames:''}} 结构
                $.ajax({
                    type: 'get',
                    async: false,
                    url: options.pushUrl,
                    data: options.pushParams(params),
                    headers: {
                        Authorization: NetStarUtils.OAuthCode.get()
                    },
                    success: function (pushResp) {
                        if (pushResp.success) {
                            var fileNames = pushResp.data.fileNames;
                            //当文件名为空时，说明文件都已经签过了，不需要再签，因此直接按成功即可
                            if(!fileNames || fileNames == '') {
                                success('已经签章过了', 0);
                                return;
                            }
                            //签章
                            signFile(fileNames, options.signCmd, options,
                                //成功时
                                function (msg, status) {
                                    //取文件
                                    $.ajax({
                                        type: 'get',
                                        async: false,
                                        url: options.pullUrl,
                                        data: options.pullParams(params, pushResp),
                                        headers: {
                                            Authorization: NetStarUtils.OAuthCode.get()
                                        },
                                        success: function (pullResp) {
                                            if (pullResp.success) {
                                                success('签章成功', 0)
                                            } else {
                                                failure(pullResp.msg, -1, _params, _pushResp, pullResp)
                                            }
                                        }
                                    })
                                },
                                //失败时
                                function (msg, status, pdfs, signCmd) {
                                    $.ajax({
                                        type: 'get',
                                        async: false,
                                        url: options.deleteUrl,
                                        data: {
                                            ids: pushResp.data.fileIds
                                        },
                                        headers: {
                                            Authorization: NetStarUtils.OAuthCode.get()
                                        },
                                        success: function (delResp) {
                                            failure(msg, -2, params, pushResp, delResp)
                                        }
                                    });
                                }
                            );
                        } else {
                            failure(pushResp.msg, -3)
                        }
                    }
                })
            }, failure)
        }, failure)
    }

    /**
     * 签章
     *
     * @param pdfs 待签章文件名字符串（逗号隔开）
     * @param signCmd 签章命令
     * @param options 签章配置
     */
    function signFile(pdfs, signCmd, options, success, failure) {
        var params = '&signfile=' + pdfs + '&signCmd=' + signCmd;
        simpleServer(
            101,
            17,
            [options.server, options.signState + "" , '1', params],
            function (msg, status) {
                success(msg, status, pdfs, signCmd)
            },
            function (msg, status) {
                failure(msg, status, pdfs, signCmd)
            }
        )
    }

    /**
     * 简单封装处理成功和失败
     */
    function simpleServer(commond, code, params, success, failure) {
        params = params == undefined ? [''] : params;
        esaLinkServer(
            commond,
            code,
            params,
            function (status, msg) {
                if (status == 0) {
                    if (typeof success == 'function') {
                        success(msg, status)
                    }
                } else {
                    if (typeof failure == 'function') {
                        failure(msg, status)
                    }
                }
            },
            {},
            config.ishttps
        )
    }

    function esaLinkServer(commond, code, params, fuc, retparam, ishttps) {
        var inputdata = {
            command: commond,
            code: code,
            parameter: params
        };
        var data = JSON.stringify(inputdata);
        data = NetStarUtils.Base64.encode(data);
        if (data.length > 2048) {
            fuc(
                -1,
                '当前参数长度为:' +
                data.length +
                ', 超出了最大值 2048，请减少一次批量签章的文件数量',
                inputdata
            );
            return
        }
        var urldata = ishttps ? config.ukey.https : config.ukey.http;
        urldata = urldata + data;
        $.ajax({
            type: 'get',
            async: false,
            url: urldata,
            dataType: 'jsonp',
            jsonp: 'callback',
            //传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(默认为:callback)
            jsonpCallback: 'success_jsonpCallback',
            //自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名
            success: function (json) {
                fuc(json.error, json['msg'], json['parameter'], retparam)
            }
        })
    }

    return {
        checkUKey: checkUKey,
        verifyUKey: verifyUKey,
        clearSign: clearSign,
        sign: sign,
        signCmd: signCmd,
        signFile: function (pdfs, signCmd, options, success, failure) {
            checkUKey(function () {
                verifyUKey(function () {
                    var o = $.extend({}, config, options);
                    signFile(pdfs, signCmd, o, success, failure)
                }, failure)
            }, failure)
        }
    }
})();

//针对当前流程的配置代码
//TODO 由于测试 ukey 只有公章，因此 signState 都配置的 1，后续需要修改前 3 个为 2
var reportSignConfig = {
    "报告编制":{
        deleteUrl: getRootPath() + '/signatureHelper/delFiles',
        pushUrl: getRootPath() + '/test/Report/getWaitingSignFile',
        pushParams: function(params) {
            return {ids: params, signType: 1};
        },
        pullUrl: getRootPath() + '/test/Report/updateSignStateByFileIds',
        pullParams: function(params, pushResp) {
            return {fileIds: pushResp.data.fileIds, signType: 1};
        },
        signState: "1",
        signCmd: 'SealByKeyWord:57yW5Yi277yaLDIsNDAsMA==:,,;'
    },
    "报告审核":{
        deleteUrl: getRootPath() + '/signatureHelper/delFiles',
        pushUrl: getRootPath() + '/test/Report/getWaitingSignFile',
        pushParams: function(params) {
            return {ids: params, signType: 2};
        },
        pullUrl: getRootPath() + '/test/Report/updateSignStateByFileIds',
        pullParams: function(params, pushResp) {
            return {fileIds: pushResp.data.fileIds, signType: 2};
        },
        signState: "1",
        signCmd: 'SealByKeyWord:5a6h5qC477yaLDIsNTAsMA==:,,;'
    },
    "报告批准":{
        pushUrl: getRootPath() + '/test/Report/getWaitingSignFile',
        deleteUrl: getRootPath() + '/signatureHelper/delFiles',
        pushParams: function(params) {
            return {ids: params, signType: 3};
        },
        pullUrl: getRootPath() + '/test/Report/updateSignStateByFileIds',
        pullParams: function(params, pushResp) {
            return {fileIds: pushResp.data.fileIds, signType: 3};
        },
        signState: "1",
        signCmd: 'SealByKeyWord:5om55YeG77yaLDIsNjAsMA==:,,;'
    },
    "报告打印归档":{
        deleteUrl: getRootPath() + '/signatureHelper/delFiles',
        pushUrl: getRootPath() + '/test/Report/getWaitingSignFile',
        pushParams: function(params) {
            return {ids: params, signType: 4};
        },
        pullUrl: getRootPath() + '/test/Report/updateSignStateByFileIds',
        pullParams: function(params, pushResp) {
            return {fileIds: pushResp.data.fileIds, signType: 4};
        },
        signState: "1",
        signCmd: 'SealByKeyWord:56m26Zmi5pyJLDEsLDMw;SealByKeyWord:562+IOWPkSDml6Ug5pyfLDIsMTEwLDUw;MuPageSeal:400;0;'
    }
};

//测试代码 - 1316544185033034738,1311712431650637810
/*
signHelper.sign(
    '1316544185033034738',
    reportSignConfig['报告编制'],
    function(){
        console.log(arguments);
    },
    function(msg,state){
        console.log(arguments);
    }
);
*/

//测试代码
/*signHelper.sign(
    '1316544185033034738,1311712431650637810',
    {
        pushUrl: getRootPath() + '/test/Report/getWaitingSignFile',
        pushParams: function(params) {
            return {ids: params, signType: '报告编制'};
        },
        pullUrl: getRootPath() + '/test/Report/updateSignStateByFileIds',
        pullParams: function(params, pushResp) {
            return {fileIds: pushResp.data.fileIds, signType: '报告编制'};
        },
        signs: [
            {
                type: 'pos',
                x: 100,
                y: 300,
                page: 1
            },
            {
                type: 'keyword',
                keyword: '审核人',
                x: 0,
                y: 0,
                page: 0
            },
            {
                type: 'mu',
                y: 100
            }
        ]
    },
    function(){
        console.log(arguments);
    },
    function(){
        console.log(arguments);
    }
);*/
// window.open(NetStarUtils.wrapUrl('/files/pdf/1316623353091458034'));
// window.open(NetStarUtils.wrapUrl('/files/pdf/1316695470961066994'));
