/**
 * @Desription: 主界面组件
 * @Author: netstar.cy
 * @Date: 2019-06-29 11:00:00
 */
"use strict"; 
var NetstarMainPage = {};
var NetstarHomePage = {
    //主页初始化方法
    init:function(_config){
        var _this = this;
        var config = _config;
        this.config = config;
        
        //载入登录属性
        if(config.getLoginProperty){
            this.getLoginProperty(config.getLoginProperty, function(res){
                //获取后的回调 
                var defalutServerUrl = window.location.origin;
                if(typeof(NetstarHomePage.config) == "object" && typeof(NetstarHomePage.config.pageOrigin) == "string"){
                    if(NetstarHomePage.config.pageOrigin.length > 0){
                        defalutServerUrl = NetstarHomePage.config.pageOrigin;
                    }
                }
                NetstarHomePage.defaultServerUrl = defalutServerUrl;
                //重建getRootPath
                window.getRootPath = function () {
                    return NetstarHomePage.loginProperty.data.context.weburl;
                }
                /*****lyw 切换静态页 将服务端页面地址改为gjjs目录下静态页 start******/
                var mainPageUrls = typeof(NetstarHomePage.config.mainPageUrls) == "object" ? NetstarHomePage.config.mainPageUrls : {};
                var _mainPageUrls = {};
                for(var key in mainPageUrls){
                    _mainPageUrls[getRootPath() + key] = defalutServerUrl + mainPageUrls[key];
                }
                NetstarHomePage.config.mainPageUrls = _mainPageUrls;
                /*****lyw 切换静态页 将服务端页面地址改为gjjs目录下静态页 end******/
                // 保存消息连接配置
                NetstarHomePage.setLink(NetstarHomePage.config);
                nsVals.getDictAjax();
                NetstarHomePage.getWaitingDetailsByAjax(function(){
                    NetstarHomePage.showMainMeuns();
                });
                
            });
        }
    },
    showMainMeuns : function(){
        var tokenStr = sessionStorage.getItem('Authorization');
        var nsHealth = {};
        nsHealth.customerCRM = {};
        nsHealth.customerCRM.view = {
            customerCRM: {
                init: function () {
                    var _this = this;
                    var searchInputConfig = {
                        containerId: "customerSearchBar",
                        placeholder: "客户名称/联系人名称/手机",
                        defaultValue: "",
                        type: "search",
                        label: "<i class='fa-search'></i>",
                        showSearchHis: false,
                        btns: [
                            {
                                text: "取消",
                                iconClass: "",
                                btnType: "",
                                handler: function (res) {
                                    $('#customerSearchBar').empty();
                                    $('#customerSearchBar').append(defaultInputText);
                                    $('#customerSearchBar').on('click', function () {
                                        nsUI.mobileSearch.init(searchInputConfig);
                                        $('#customerSearchBar').find('input').select();
                                        $('#customerSearchBar').off();
                                    });
                                }
                            }
                        ],
                        handler: function (res) {
                            console.log(res);
                            nsalert('res');
                        }
                    }
                },
                setValue: function (data) {
                    NetstarHomePage.config.menuData = data;
                    $('#mobile-loading').remove();
                    var _this = this;
                    if ($.isEmptyObject(data)){
                        $("#customerCRM").append('<span id="emptyData" class="card-text">暂无数据</span>');
                        return;
                    }
                    //$('#emptyData').remove();
                    var crmData = data;
                    //下方菜单栏
                    var $customerMenu = $('#customerMenu');
                    $customerMenu.children().remove();
                    $.each(crmData, function (index, item) {
                        var blockStr = '<div class="card">' +
                            '<div class="card-header"><div class="title">' + item.menuName + '</div></div>' +
                            '<nav class="nav-grid grid-4"></nav>' +
                            '</div>';
                        $customerMenu.append(blockStr);
                        if (typeof item.children != 'undefined' && item.children.length > 0) {
                            var cardItemsStr = '';
                            var $cardItems = $('.nav-grid:last');
                            var mainPageUrls = NetstarHomePage.config.mainPageUrls;
                            $.each(item.children, function (idx, itm) {
                                // var url = getRootPath() + itm.menuUrl;
                                var url = getRootPath() + itm.url;
                                /*****lyw 切换静态页 将服务端页面地址改为gjjs目录下静态页 start******/
                                for(var resUrl in mainPageUrls){
                                    var replaceUrl = mainPageUrls[resUrl] + '?';
                                    if(url.indexOf(resUrl) === 0){
                                        var _resUrl = resUrl;
                                        if(url.indexOf(';') == resUrl.length){
                                            replaceUrl += 'NETSTAR-URL-TYPE=F;'; // 分号
                                            _resUrl += ';';
                                        }else{
                                            if(url.indexOf('?') == resUrl.length){
                                                replaceUrl += 'NETSTAR-URL-TYPE=W;'; // 问号
                                                _resUrl += '?';
                                            }else{
                                                replaceUrl += 'NETSTAR-URL-TYPE=N;'; // 空 什么都没有
                                            }
                                        }
                                        
                                        url = url.replace(_resUrl, replaceUrl);
                                        break;
                                    }
                                }
                                /*****lyw 切换静态页 将服务端页面地址改为gjjs目录下静态页 end******/

                                itm.singlePageMode = true;//临时强制更改为true,使用单页面模式
                                //sjj 20191202 输出待办数量
                                var workitemCount = 0;
                                if(url.indexOf(';')>-1){
                                    var search = url.substring(url.indexOf(';')+1,url.length);
                                    var paramsObj = search.split(';');
                                    var resultObject = {};
                                    for (var i = 0; i < paramsObj.length; i++){
                                        var idx = paramsObj[i].indexOf('=');
                                        if (idx > 0){
                                            resultObject[paramsObj[i].substring(0, idx)] = paramsObj[i].substring(idx + 1);
                                        }
                                    }
                                    if(resultObject.activityName){
                                        if(NetstarHomePage.waitingDetailsProperty[resultObject.activityName]){
                                            workitemCount = NetstarHomePage.waitingDetailsProperty[resultObject.activityName].workitemCount;
                                        }
                                    }
                                }
                                workitemCount = typeof(workitemCount)=='number' ? workitemCount : 0;
                                var workitemCountHtml = '';
                                if(workitemCount > 0){
                                    workitemCountHtml = '<span class="badge badge-danger">'+workitemCount+'</span>';
                                }
                                //添加对static 静态文件地址的支持 cy 20200327
                                var urlStaticIndex = url.indexOf('static:');
                                console.log(urlStaticIndex);
                                if(typeof(NetStarRabbitMQ) == "object" && NetStarRabbitMQ.device === 'app'){
                                    // console.log(12342)
                                    setTitle.controller.insertHtml("main");
                                }
                                if(urlStaticIndex > -1){
                                // console.log(urlStaticIndex);

                                    if(window.location.protocol == 'file:'){
                                        url = NetstarHomePage.config.pageOrigin + "/" + url.substr(urlStaticIndex+7);
                                    }else{
                                        url = window.location.protocol + '//' + window.location.host + url.substr(urlStaticIndex+7);
                                    }
                                }
                                
                                cardItemsStr += (itm.singlePageMode ? cardItemsStr = '<a class="nav-item" href="javascript:nsFrame.loadPageVRouter(\'' + url + '\');">' : cardItemsStr = '<a class="nav-item" href="' + url + '">') +
                                    '<div ns-parentIndex="' + index + '" ns-currentIndex="' + idx + '" class="card-item">' +
                                    '<i class="' + itm.icon + '"></i>' +
                                    '<span>' + itm.menuName + '</span>' +
                                    workitemCountHtml+
                                    '</div></a>';
                            });
                            $cardItems.append(cardItemsStr);
                        }
                    })
                },
                getValue: function () { }
            }
        }
        nsHealth.customerCRM.pageConfig = {
            ajaxConfigField: "customerConfig",
            customerConfig: {
                customerCRM: {
                    parentNodeName: "root",
                    panelId: 'customerCRM',
                    ajax: {
                        url: getRootPath() + '/system/menus/getUserMenu',
                        type: "GET",
                        // data: {"usedOnPcOrPhone":1},
                        data: {
                            isPc : false
                        },
                        headers : {
                            Authorization:tokenStr
                        },
                        dataSrc: "rows"
                    }
                }
            }
        }
        fillDataWithConfig.fillValue(nsHealth.customerCRM.view, nsHealth.customerCRM.pageConfig);
        nsFrame.listenVRouter();
    },
    /**
     * 登录成功调用获取用户数据的方法，该方法必须发送header：token
     * token 是登录成功后返回的
     */
    getLoginProperty:function(_ajaxConfig, callbackFunc){
        var _this = this;
        var ajaxConfig = 
        {
            url: _ajaxConfig.url, 
            type: "GET",
            dataType: 'json',
            contentType:'application/x-www-form-urlencoded',
        }
        NetStarUtils.ajax(ajaxConfig, function(res){
            if(res.success){
                NetstarHomePage.loginProperty = res;
                NetstarMainPage.systemInfo = res.data;  //sjj 20191114 和pc同步
                if(typeof(callbackFunc) == 'function'){
                    callbackFunc(res);
                }
            }else{
                $('#mobile-loading').remove()
            }
        }, true)
    },
    /**
     * sjj 20191202 添加读取待办详情列表
     */
    getWaitingDetailsByAjax:function(cb){
        var detailsAjaxConfig = {
            url: getRootPath()+'/nsEngine/waitingList/details', 
            type: "GET",
            dataType: 'json',
            contentType:'application/x-www-form-urlencoded',
        };
        NetStarUtils.ajax(detailsAjaxConfig,function(res){
            if(res.success){
                var nameMap = {};
                var resData = res.rows;
                for(var i = 0; i < resData.length; i++){
                    var row = resData[i];
                    var name = row.activityName;
                    if(!nameMap[name]){
                        nameMap[name] = {
                            activityName: name,
                            activityId: row.activityId,
                            processId: row.processId,
                            workitemCount: 0,
                            formUrl: row.formUrl,
                            processName:row.processName,
                            latestTime:row.latestTime,
                            rows: []
                        };
                    } else {
                        //有重复的activityName时
                        delete nameMap[name].activityId;
                        delete nameMap[name].processId;
                    }
                    if(!nameMap[name].formUrl && row.formUrl) {
                        nameMap[name].formUrl = row.formUrl;
                    }
                    nameMap[name].rows.push(row);
                    nameMap[name].workitemCount += row.workitemCount;
                }
                NetstarHomePage.waitingDetailsProperty = nameMap;
                if (typeof NetStarRabbitMQ != 'undefined') {
                    NetStarRabbitMQ.connectBySaveConfig(resData);
                }
                cb && cb();
            }else{
                $('#mobile-loading').remove()
            }
        },true)
    },
    // 获取代办数量
    getWaitByMenu : function(waitingData){
        var menuData = NetstarHomePage.config.menuData;
        var waitNum = {};
        $.each(menuData, function (index, item) {
            if (typeof item.children != 'undefined' && item.children.length > 0) {
                $.each(item.children, function (idx, itm) {
                    var url = getRootPath() + itm.url;
                    var workitemCount = 0;
                    if(url.indexOf(';')>-1){
                        var search = url.substring(url.indexOf(';')+1, url.length);
                        var paramsObj = search.split(';');
                        var resultObject = {};
                        for (var i = 0; i < paramsObj.length; i++){
                            var idx = paramsObj[i].indexOf('=');
                            if (idx > 0){
                                resultObject[paramsObj[i].substring(0, idx)] = paramsObj[i].substring(idx + 1);
                            }
                        }
                        if(resultObject.activityName){
                            if(waitingData[resultObject.activityName]){
                                workitemCount = waitingData[resultObject.activityName].workitemCount;
                                waitNum[resultObject.activityName] = workitemCount;
                            }
                        }
                    }
                });
            }
        })
        return waitNum;
    },
    // 判断待办页是否变化
    getIsWaitChange : function(source, list){
        var sourceWaitNum = NetstarHomePage.getWaitByMenu(source);
        var currentWaitNum = NetstarHomePage.getWaitByMenu(list);
        var isChange = false;
        // 判断长度
        var sourceLength = 0;
        var currentLength = 0;
        for(var key in sourceWaitNum){ sourceLength ++; }
        for(var key in currentWaitNum){ currentLength ++; }
        if(sourceLength !== currentLength){
            isChange = true;
        }
        if(isChange){
            return isChange;
        }
        for(var key in sourceWaitNum){ 
            if(sourceWaitNum[key] != currentWaitNum[key]){
                isChange = true;
                break;
            }
        }
        return isChange;
    },
    refreshWaitingDetailsByAjax:function(callBackFunc){
        var detailsAjaxConfig = {
            url: getRootPath()+'/nsEngine/waitingList/details', 
            type: "GET",
            dataType: 'json',
            plusData : {
                callBackFunc : callBackFunc,
            },
            contentType:'application/x-www-form-urlencoded',
        };
        NetStarUtils.ajax(detailsAjaxConfig,function(res, ajaxConfig){
            if(res.success){
                var nameMap = {};
                var resData = res.rows;
                for(var i = 0; i < resData.length; i++){
                    var row = resData[i];
                    var name = row.activityName;
                    if(!nameMap[name]){
                        nameMap[name] = {
                            activityName: name,
                            activityId: row.activityId,
                            processId: row.processId,
                            workitemCount: 0,
                            formUrl: row.formUrl,
                            processName:row.processName,
                            latestTime:row.latestTime,
                            rows: []
                        };
                    } else {
                        //有重复的activityName时
                        delete nameMap[name].activityId;
                        delete nameMap[name].processId;
                    }
                    if(!nameMap[name].formUrl && row.formUrl) {
                        nameMap[name].formUrl = row.formUrl;
                    }
                    nameMap[name].rows.push(row);
                    nameMap[name].workitemCount += row.workitemCount;
                }
                var sourceWaitingDetailsProperty = NetstarHomePage.waitingDetailsProperty;
                NetstarHomePage.waitingDetailsProperty = nameMap;
                NetstarHomePage.showMainMeuns();
                var isChange = NetstarHomePage.getIsWaitChange(sourceWaitingDetailsProperty, nameMap);
                if(typeof(ajaxConfig.plusData.callBackFunc) == "function"){
                    ajaxConfig.plusData.callBackFunc(isChange);
                }
            }else{
                $('#mobile-loading').remove()
            }
        },true)
    },
    // 消息连接配置
    setLink : function(config){
        // mq工作流消息联通 默认联通
        config.isLinkWorkflow = typeof(config.isLinkWorkflow)=="boolean" ? config.isLinkWorkflow : true;
        var authorization = NetStarUtils.OAuthCode.get();
        
        /******************NetStarRabbitMQ start********************** */
        if(config.isLinkWorkflow){
            var rabbitMQConfig = {
                ws: NetstarMainPage.systemInfo.context.rabbitmq.wsAddresses,
                toekn: authorization,
                vhost: NetstarMainPage.systemInfo.context.rabbitmq.virtualHost,
                content: {
                    'auto-delete': true,
                    durable: false
                },
                toporgId: $.trim(NetstarMainPage.systemInfo.user.topOrgId),
                userId: $.trim(NetstarMainPage.systemInfo.user.userId),
            };
            NetStarRabbitMQ.device = config.device ? config.device : 'mobile';
            NetStarRabbitMQ.saveRabbitMQLinkConfig(rabbitMQConfig);
        }
        /**************NetStarRabbitMQ end************************** */
    },
}


