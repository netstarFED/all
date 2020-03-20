//NetstarLogin 登录页面对象 
var NetstarLogin = (function () {

    var config = {};
    var loginRes = {};
    var res = ''
    //初始化
    function init(_config){
        /**
         * containerEl:string   整体登录容器 例如'#loginPanel',
         * usernameEl: string   用户名 例如 "#username"
         * passwordEl: string   密码 例如 "#password"
         * msgEl:string         提示信息容器 例如 "#pwmsg"
         * loginAjax:{
         *      url:'',
         *      ...
         * }
         * getLoginProperty:{        该请求必须用token当header
         *      url:'',
         * }
         * styleEl:'#loginStyle' //登录专用的CSS 
         */
        config = getDefault(_config);
        //如果登录信息没有过期，直接跳转，不需要登录
        var authCode = NetStarUtils.OAuthCode.get();
        if(authCode != false){
            //登录信息没有过期 不需要登录
            toHomePage(authCode);
        }
        //初始化欢迎界面
        loginPanel.init();
        resetLoginFormByUrl(config);
    }

    
    
    //默认值
    function getDefault(_config){
        var returnConfig = $.extend(true, {}, _config);
        //默认的静态资源路径
        var staticRootPath = ''
        switch(_config.userMode){
            case 'user':
                //用户模式
                staticPath = _config.rootPath + 'dist/';
                break;
            case 'dev':
                //开发模式
                staticPath = _config.rootPath + 'assets/';
                break;
        }
        _config.staticRootPath = staticRootPath;
        return returnConfig;
    }
    /**
     * 调用首页加载，需要使用getLoginProperty 方法所返回的结果
     */
    function toHomePage(authCode){

        //跳转页面 没有参数加 ? 有则加 &
        var mainPageUrl = config.mainPage.url;
        var urlParamsStr = 'form=login&source=' + encodeURI( window.location.href );
        if(mainPageUrl.indexOf('?') == -1){
            mainPageUrl = mainPageUrl + '?' + urlParamsStr;
        }else{
            mainPageUrl = mainPageUrl + '&' + urlParamsStr;
        }
        if(config.mainPage && config.mainPage.beforeHandler){
            //如果有前置回调方法则等待前置回调方法执行完以后再执行跳转 cy.20200227
            config.mainPage.beforeHandler(authCode, function(){
                window.location.href = mainPageUrl;
            })
        }else{
            window.location.href = mainPageUrl;
        }
        
        
    }


    //登录面板
    var loginPanel = {
        config:{},
        loginInfo:{
            //保存登录页config到本地存储，以方便之后调用
            save:function(_config){
                var storeConfigStr = JSON.stringify(config);
                store.set('NetstarLoginConfig', storeConfigStr);
            },
            //清除登录页config的本地存储
            clear:function(){
                store.remove('NetstarLoginConfig');
            }
        },
        //初始化面板
        init:function(){
            var _this = this;
            this.loginInfo.save();
            this.initImages();
            $(document).on('keyup',this.enterEvent);
            _this.remember.get();
            $(config.submitBtnEl).on('click', function(ev){
                _this.submit();
            });
            _this.initWxChatUrl(config);
            _this.loginByScan(config);
        },
        //发送loginSubmit
        submit:function () {
            var _this = this;

            var username = $(config.usernameEl).val();
            var password = $(config.passwordEl).val();
            var verificationCode = $(config.verificationCodeEl).val();
            if(username == '' || typeof(username)!='string'){
                $(config.msgEl).html("用户名必填！");
                $(config.msgEl).removeClass('hide');
                return;
            }
            if(password == '' || typeof(password)!='string'){
                $(config.msgEl).html("密码必填！");
                $(config.msgEl).removeClass('hide');
                return;
            }

            var passwordMD5 = hex_md5(password);
            var ajaxData = {
                login: 1,
                username: username,
                password: passwordMD5,
                verificationCode: verificationCode
            };
            //添加orgname cy 191108 start -----
            if(config.orgnameEl){
            	ajaxData.orgName = $(config.orgnameEl).val();
            }
            //orgName可选择使用 cy 191108 end   -----
            
            var urlParams = NetStarUtils.getUrlPara();
            if(typeof(urlParams)=='object'){
                $.each(urlParams, function(key,value){
                    switch(key){
                        case 'callback':
                            //callback是一个json文本 需要decode 例如 %257B%2522customerId%2522:1310336379963573234%257D  => {"customerId":1310336379963573234}
                            //曹雷登录需求  cy 20190826
                            ajaxData[key] = decodeURIComponent(value);
                            break;
                        default:
                            break;
                    }
                });
            }
            
            $.ajax({
                type: "POST",
                dataType: 'json',
                url: config.loginAjax.url,  
                data: ajaxData,
                success: function (res) {
                     /**
                     * res:{
                     *  success:true,
                     *  data:'eyJ0eXA...'   //返回的data就是token
                     * }
                     */
                    if(typeof(res.data) == 'object'){
                        if(res.data.success == false){
                            
                            if(res.data.passwordExpired == true){
                                var html = '<div class="ns-confirm-container warning" id="nsconfirm-modal-default-login" tabindex="-1"><div class="confirm-body"><div class="confirm-content">初次登陆或密码超期，是否重置密码？</div></div><div class="confirm-footer"><div class="btn-group"><button type="button" class="btn btn-success" ns-confirm-type="confirm" fid="0"><i class="fa-check"></i><span>确定</span></button><button type="button" class="btn btn-white" ns-confirm-type="cancel" fid="1"><i class="fa-ban"></i><span>取消</span></button></div></div><div class="confrim-bg"></div></div>';
                                if($('#nsconfirm-modal-default-login').length == 1){
                                    $('#nsconfirm-modal-default-login').remove();
                                }
                                $('body').append(html);
                                $('#nsconfirm-modal-default-login button[type="button"]').on('click',function(ev){
                                    var nsType = $(this).attr('ns-confirm-type');
                                    switch(nsType){
                                        case 'confirm':
                                            $('#nsconfirm-modal-default-login').remove();
                                            var editPasswordHtml = '<div id="edit-userpassword-nsdialog-container" ns-type="pt-modal" ns-index="1" ns-top="true"><div class="pt-modal"><div class="pt-container"><div id="dialog-edit-userpassword" class="pt-modal-content" style="width: 500px; margin-left: -250px; height: 250px; max-height: 789px; left: 720px; top: 0px;"><div class="pt-modal-header"><div class="pt-title"><h4>修改密码</h4></div><div class="pt-close"><button type="button" class="pt-btn pt-btn-icon pt-btn-circle"><i class="icon-close"></i></button></div><div id="dialog-edit-userpassword-header" class="pt-modal-header-content"></div></div><div id="dialog-edit-userpassword-body" class="pt-modal-body" style="height: 158px; max-height: 597px;"><div class="pt-form  pt-form-vertical pt-form-inline" style="min-height: 148px;"><div class="pt-form-header"></div><div id="form-dialog-edit-userpassword-body" class="pt-form-body"><form id="form-edit-userpassword-nsdialog-container" novalidate="novalidate" autocomplete="off" onkeydown="if(event.keyCode==13){return false;}" onsubmit="return false"><div ns-type="field" class="field"><div ns-field="account" class="pt-form-group fg-text " style="width: 100%;"><label for="form-dialog-edit-userpassword-body-account" class="pt-control-label disabled">用户名</label><div class="pt-text disabled pt-input-group pt-text-assistant"><input type="text" placeholder="" value="'+username+'" disabled="disabled" id="form-dialog-edit-userpassword-body-account" class="pt-form-control"><div class="pt-input-group-btn pt-input-group-btn-group"><button class="pt-btn pt-btn-default pt-btn-icon pt-input-clear hide"><i class="icon-close"></i></button></div><div class="pt-text-assistant-btns hide"><div class="pt-btn-group"></div></div></div></div><div ns-field="originalPwd" class="pt-form-group fg-password pt-form-required" style="width: 100%;"><label for="form-dialog-edit-userpassword-body-originalPwd" class="pt-control-label">现有密码</label><div class="pt-password pt-input-group"><input type="password" placeholder="" id="form-dialog-edit-userpassword-body-originalPwd" class="pt-form-control" required><div class="pt-input-group-btn pt-input-group-btn-group"><button class="pt-btn pt-btn-default pt-btn-icon pt-input-clear hide"><i class="icon-close"></i></button></div></div></div><div ns-field="pwd" class="pt-form-group fg-password pt-form-required" style="width: 100%;"><label for="form-dialog-edit-userpassword-body-pwd" class="pt-control-label">新密码</label><div class="pt-password pt-input-group"><input type="password" required placeholder="" id="form-dialog-edit-userpassword-body-pwd" class="pt-form-control"><div class="pt-input-group-btn pt-input-group-btn-group"><button class="pt-btn pt-btn-default pt-btn-icon pt-input-clear hide"><i class="icon-close"></i></button></div></div></div><div ns-field="pwd2" class="pt-form-group fg-password pt-form-required" style="width: 100%;"><label for="form-dialog-edit-userpassword-body-pwd2" class="pt-control-label">重复密码</label><div class="pt-password pt-input-group"><input type="password" required placeholder="" id="form-dialog-edit-userpassword-body-pwd2" class="pt-form-control"><div class="pt-input-group-btn pt-input-group-btn-group"><button class="pt-btn pt-btn-default pt-btn-icon pt-input-clear hide"><i class="icon-close"></i></button></div></div></div></div><div ns-type="field-more" ns-formid="dialog-edit-userpassword-body" class="field-more hide aequilate"></div></form></div><div class="pt-form-footer"></div></div></div><div id="dialog-edit-userpassword-footer" class="pt-modal-footer text-right"><div class="pt-window-control"></div><div id="dialog-edit-userpassword-footer-group" class="pt-btn-group-container"><div class="pt-btn-group"><button class="pt-btn pt-btn-default" ns-type="confirm">确认</button><button class="pt-btn pt-btn-default" ns-type="cancel">取消</button></div></div></div></div></div><div class="pt-modal-bg"></div></div></div>';
                                            if($('#edit-userpassword-nsdialog-container').length == 1){
                                                $('#edit-userpassword-nsdialog-container').remove();
                                            }
                                            $('body').append(editPasswordHtml);
                                            var $btns = $('#edit-userpassword-nsdialog-container').find('button');
                                            $btns.off('click');
                                            $btns.on('click', function(){
                                                var $this = $(this);
                                                var nsType = $this.attr('ns-type');
                                                switch(nsType){
                                                    case "confirm":
                                                        if($('#form-edit-userpassword-nsdialog-container').valid()){
                                                            var formdata = {
                                                                originalPwd:hex_md5($('#form-dialog-edit-userpassword-body-originalPwd').val()),
                                                                pwd:hex_md5($('#form-dialog-edit-userpassword-body-pwd').val()),
                                                                pwd2:hex_md5($('#form-dialog-edit-userpassword-body-pwd2').val()),
                                                                account:username,
                                                                orgname:$(config.orgnameEl).val()
                                                            };
                                                            if (formdata.pwd2 == formdata.pwd) {
                                                                var ajaxConfig = {
                                                                    url: serverRootPath + "/system/changepwd",
                                                                    data: formdata,
                                                                    type: "GET",
                                                                    dataType: "json",
                                                                    contentType : 'application/x-www-form-urlencoded',
                                                                    success:function(data,_ajaxConfig){
                                                                        if (data.success) {
                                                                            nsalert('密码修改成功');
                                                                            $('#edit-userpassword-nsdialog-container').remove();
                                                                        } else {
                                                                            nsalert(data.msg, 'error');
                                                                        }
                                                                    },
                                                                    error:function(){
                                                                        nsalert('未知错误', 'error');
                                                                    }
                                                                };
                                                                $.ajax(ajaxConfig);
                                                            } else {
                                                                nsalert("新密码不一致");
                                                            }
                                                        }
                                                        break;
                                                    case "cancel":
                                                        $('#edit-userpassword-nsdialog-container').remove();
                                                        break;
                                                    default:
                                                        $('#edit-userpassword-nsdialog-container').remove();
                                                        break;
                                                }
                                            });
                                            break;
                                        case 'cancel':
                                            $('#nsconfirm-modal-default-login').remove();
                                            break;
                                    }
                                })
                                return;
                            }else{
                                console.error('登录失败', res.data);
                                res.success = false;
                            }
                            
                        }
                    }
                    if (res.success || (typeof(res.data) == 'object' && res.data.success)) {
                        
                        if(typeof(res.data)=='object'){
                            res = {
                                success:true,
                                data:res.data.token,
                            }
                        }
                        //登录成功后请求用户消息并登录系统  
                        if(typeof(res.data)!='string'){
                            //sjj 20200114 添加密码超期, 请重置密码的需求逻辑
                            var passwordExpired = false;
                            if(typeof(res.data)=='object'){
                                if(typeof(res.data.passwordExpired)=='boolean'){
                                    passwordExpired = res.data.passwordExpired;
                                }
                            }
                            if(!passwordExpired){
                             /*    console.error('登录接口未返回授权码');
                                return; */
                            }else{
                                
                            }
                        }

                        _this.remember.set();

                        //保存授权码
                        loginRes = res;
                        NetstarLogin.loginRes = res;
                        NetstarLogin.Authorization = NetstarLogin.loginRes.data;

                        
                        NetStarUtils.OAuthCode.set({
                            authorization:      NetstarLogin.Authorization, 
                            expireMinute:       config.expireMinute,
                            loginTimeStamp:     new Date().getTime(),
                        });
                        NetstarLogin.toHomePage(NetstarLogin.Authorization);
                        //loginPanel.getLoginProperty(res); //获取登录信息
                        //$(config.msgEl).addClass('hide');

                    } else {
                        //不成功提示错误 如密码错误等
                        if(typeof(res.data) == 'object'){
                            $(config.msgEl).html(res.data.msg);
                        }else{
                            $(config.msgEl).html(res.pwmsg);
                        }
                        
                        $(config.msgEl).removeClass('hide');
                        var verificationCode = res.data.verificationCode
                        if(typeof(verificationCode) == 'string'){
                            $(config.verificationHidden).removeClass('hide');
                        }
                        //$(config.orgnameEl).val();
                        var userName = $(config.usernameEl).val();
                        var orgNameVal = $(config.orgnameEl).val();
                        var orgName = encodeURIComponent(orgNameVal)
                        var random = Math.random() * 100
                        var verificationImgUrl = serverRootPath + '/system/verificationCode?'+ "orgName=" + orgName +"&"+ "username=" +userName + "&" + random;
                        console.log(verificationImgUrl)
                        var htmlImg='<img class="verification-img-size" src="'+ verificationImgUrl+'">'
                        $(config.verificationImgEl).html(htmlImg)
                    }
                },
                error: ajaxError
            });
        },
        //绑定回车事件
        enterEvent: function(event) {
            if (event.keyCode == 13) {
                loginPanel.submit();
            }
        },
        getScanCodeUrl:function(){
            var regUrls =  {
                'https://qa.wangxingcloud.com/':'https://qa.wangxingcloud.com/',
                'https://wangxingcloud.com/':'https://wangxingcloud.com/',
            }
            var logonUrl = window.location.protocol + '//' + window.location.host;
            if(regUrls[logonUrl] ){
                return logonUrl;
            }else{
                return 'https://qa.wangxingcloud.com/'; 
            }
        },
        initWxChatUrl:function(_config){
            if(_config.wxChatEl){
                $(_config.wxChatEl).attr('href','javascript:NetstarLogin.loginPanel.toWxChatUrl();');
            }
            if(_config.wxChatEl){
                $(_config.qyWxChatEl).attr('href','javascript:NetstarLogin.loginPanel.toQyWxChat();');
            }
        },
        toWxChatUrl:function(){
            console.log('toWxChatUrl');

            var _this = this;
            if(typeof(config.wxChatAjax)!='object'){
                return;
            }
            $.ajax({
                url:config.wxChatAjax.url,
                type: "GET",
                data:{
                    domain:_this.getScanCodeUrl(),
                },
                dataType: 'text',
                success:function(res){
                    var wxChaturl = res;
                    window.open(wxChaturl,"_blank"); 
                },
                error: function(){
                    nsalert('获取微信登录码失败')
                    console.log('获取微信登录码失败')
                },
            })
        },
        //q企业微信
        toQyWxChat: function(){
            var _this = this;
            if(typeof(config.qyWxChatAjax)!='object'){
                return;
            }
            $.ajax({
                url:config.qyWxChatAjax.url,
                type:'GET',
                data:{
                    domain:_this.getScanCodeUrl(),
                },
                dataType:'text',
                success:function(res){
                    var entWxChatUrl = res;
                    window.open(entWxChatUrl,"_blank");  
                },
                error: function(data){
                    nsalert('获取企业微信登录码失败');
                    console.log('获取企业微信登录码失败');


                }
            })
            
        },
        //初始化图片
        initImages:function(){
            //添加背景图 <div id="loginPanel" class="page-login common-top-right" style="background-image:url(http://nscloud.applinzi.com/images/erp/bg.png)">
            //添加LOGO  <img src="http://nscloud.applinzi.com/images/erp/logo.png" alt="LOGO">
            var bgImage = config.images.bg;
            var logoImage = config.images.logo;
            $(config.containerEl).attr('style', "background-image:url("+bgImage+")");
            $(config.containerEl + ' .logo img').attr('src', logoImage);
        },
        //清除面板
        clear:function(){
            /**
             * 清除登录页面 清除页面上的style  body中的html等
             * 包括  config.styleEl config.containerEl
             */
            var $loginContainer= $(config.containerEl);
            var $loginStyle = $(config.styleEl);
            $loginContainer.remove();
            $loginStyle.remove();
        },
        //读取和记录用户名和组织名称 cy 191108
        remember:{
            //如果勾选则保存，如果没勾选则清除
            set:function(){
                var isRemember = $('#remember').prop("checked");
                if(isRemember){
                    var orgName = $(config.orgnameEl).val();
                    var userName = $(config.usernameEl).val();
                    var loginRemember = {
                        orgName:orgName,
                        userName:userName,
                        remember:true,
                    }
                    store.set('NetstarLoginRemember', loginRemember );
                }else{
                    //如果不保存，也需要记录点了不保存
                    store.set('NetstarLoginRemember', {remember:false});
                }
            },
            //显示到页面输入框里
            get:function(){
                var loginRemember = store.get('NetstarLoginRemember');
                if(typeof(loginRemember)!= 'object'){
                    loginRemember = {};
                }
                var urlParams = NetStarUtils.getUrlPara();
                var orgValues = config.orgValues;

                //优先使用url传进来的参数
                var urlOrgName = '';
                if(urlParams.orgname && orgValues){
                    if(orgValues[urlParams.orgname]){
                        urlOrgName = orgValues[urlParams.orgname];
                    }
                }
                
                //如果选择了记录则读取
                if(loginRemember.remember){

                    //读取url中的组织名称 用户名 密码 优先使用url传进来的参数 cy 191113
                    if(urlOrgName!=''){
                        //如果url传进来的orgName跟本地存储的不一样则清空userName
                        if(loginRemember.orgName != urlOrgName){
                            loginRemember.userName = '';
                        }
                        loginRemember.orgName = urlOrgName;
                    }
                    if(urlParams.username){
                        loginRemember.userName = urlParams.username;
                    }
                    if(urlParams.password){
                        loginRemember.password = urlParams.password;
                    }

                    $(config.orgnameEl).val(loginRemember.orgName);
                    $(config.usernameEl).val(loginRemember.userName);
                    if(loginRemember.password){
                        $(config.passwordEl).val(loginRemember.password);
                    }

                }else{
                    $('#remember').prop("checked", false);
                    //读取url中的组织名称 用户名 密码 cy 191113
                    if(urlOrgName != ''){
                        $(config.orgnameEl).val(urlOrgName);
                    }
                    if(urlParams.username){
                        $(config.usernameEl).val(urlParams.username);
                    }
                    if(urlParams.password){
                        $(config.passwordEl).val(urlParams.password);
                    }
                }
            }
        },
        
        //如果页面是来自于微信登录跳转 url会添加 code 和 state 参数
        ///workweixin/workWeixinUserEmps/login?authCode=xxx&state=xxx 返回token
        loginByScan:function(_config){
            var loginUrlParams = NetStarUtils.getUrlPara();
            //微信获取token登录
            if(loginUrlParams.code && loginUrlParams.state){             
                $.ajax({
                    url:serverRootPath + 'workweixin/weChatLogin/login',
                    data:{
                        code:loginUrlParams.code,
                        state:loginUrlParams.state
                    },
                    type:'GET',
                    success:function(res){
                        if(res.success == false){
                            nsalert('扫码获取token失败', 'error');
                            console.error('扫码获取token失败',error);
                            return;
                        }
                        loginRes = res;
                        NetstarLogin.loginRes = res;
                        NetstarLogin.Authorization = NetstarLogin.loginRes.data.token;
                        
                        NetStarUtils.OAuthCode.set({
                            authorization:      NetstarLogin.Authorization, 
                            expireMinute:       config.expireMinute,
                            loginTimeStamp:     new Date().getTime(),
                        });
                        NetstarLogin.toHomePage(NetstarLogin.Authorization);
                    },
                    error:function(error){
                        nsalert('扫码获取token失败', 'error');
                        console.error('扫码获取token失败:', error);
                    }
                })
            }
            //企业微信获取token登录
            if(loginUrlParams.auth_code && loginUrlParams.state){
                $.ajax({
                    url:serverRootPath + 'workweixin/workWeixinUserEmps/login',
                    data:{
                        authCode:loginUrlParams.auth_code,
                        state:loginUrlParams.state
                    },
                    type:'GET',
                    success:function(res){
                        if(res.success == false){
                            nsalert('扫码获取token失败', 'error');
                            console.error('扫码获取token失败','error');
                            return;
                        }
                        loginRes = res;
                        NetstarLogin.loginRes = res;
                        NetstarLogin.Authorization = NetstarLogin.loginRes.data.token;
                        
                        NetStarUtils.OAuthCode.set({
                            authorization:      NetstarLogin.Authorization, 
                            expireMinute:       config.expireMinute,
                            loginTimeStamp:     new Date().getTime(),
                        });
                        NetstarLogin.toHomePage(NetstarLogin.Authorization);
                    },
                    error:function(error){
                        nsalert('扫码获取token失败', 'error');
                        console.error('扫码获取token失败:','error');
                    }
                })
            }
            
        }
    }
    var mainPage = {
        BODYCLASS:'body-page-body skin-autoservice frame-standard',
        init:function(html){
            //更换body class 并插入内容
            $('body').attr('class',this.BODYCLASS);
            $('body').html(html);
        }
    }
    /**
     * 获取静态资源
     */
    var staticManager = {
        staticSource:{}, //
        //获取静态资源加载列表
        staticSourceAjax:function(callbackFunc){
            var _this = this;
            $.ajax({
                type: "GET",
                dataType: 'json',
                url: config.staticSourceAjax.url,
                success:function(res){
                    _this.staticSource = res;
                    //加载最基础的静态资源列表
                    if(typeof(callbackFunc)=='function'){
                        callbackFunc(res);
                    }
                },
                error:ajaxError
            })
        },
        /****** 根据环境获取文件
         * Preload              预加载文件 
         * Disabled             已经停用
         * PC_base_1            基础版 
         * PC_template_1        PC模板第一版 
         * MOBILE_template_1    手机模板第一版 
         * PC_editor_1          编辑器第一版 
         * PC_template_2        PC模板第二版
         */
        getStaticSourceByEnv:function(envType){
            var _this = this;
            var staticSource = {
                style:[],
                script:[]
            }
            var ENVType = envType.toUpperCase();  //转成大写后比较
            var sourceArray = _this.staticSource.source
            for(var i=0; i<sourceArray.length; i++){
                var staticObj = sourceArray[i];
                if(staticObj.evnVersion == ENVType){
                    switch(staticObj.type){
                        case "style":
                            staticSource.style.push(staticObj);
                            break;
                        case "script":
                            staticSource.script.push(staticObj);
                            break;
                    }
                    
                }
            }
            return staticSource;
        },
        //转换为插入标签 批量
        getTagsByStaticSource:function(staticSource){
            var _this = this;
            var tagsHtml = '';
            for(var si=0; si<staticSource.script.length; si++){
                var tagHtml  = _this.getScriptTagHtmlByObj(staticSource.script[si]);
                tagsHtml += tagHtml;
            }
            for(var ci=0; ci<staticSource.style.length; ci++){
                var tagHtml  = _this.getStyleTagHtmlByObj(staticSource.style[ci]);
                tagsHtml += tagHtml;
            }
            return tagsHtml;
        },
        //转换为插入SCRIPT标签 单独一条
        getScriptTagHtmlByObj:function(tagObj){
            var src = config.rootPath + config.sourcePath + tagObj.fileName;
            var tagHtml = '<script  type="text/javascript" src="'+src+'?v='+tagObj.version+'"></script>';

            return tagHtml;
        },
        //转换为插入LINK CSS标签 单独一条
        getStyleTagHtmlByObj:function(tagObj){
            var src = config.rootPath + config.sourcePath + tagObj.fileName;
            var tagHtml = '<link rel="stylesheet" href="'+src+'?v='+tagObj.version+'"/>';
            return tagHtml;
        },
        
    }

    //AJAX 错误回调方法 和回调信息
    function ajaxError(error){
        //ajax错误，根据默认错误信息提示错误
        console.error(error);
        var errorInfo = '';
        //优先使用服务器端返回的错误信息
        if(error.responseJSON){
            if(typeof(error.responseJSON.msg) == 'string'){
                errorInfo = error.responseJSON.msg;
            }
        }

        //未返回服务器定义的错误信息，则使用错误代码
        if(errorInfo == ''){
            if (typeof (NSAJAXERRORINFO[error.status]) == "string") {
                errorInfo = NSAJAXERRORINFO[error.status];
            } else {
                errorInfo = '请求错误，错误代码：' + error.status + "。";
            }
        }
        

        $(config.msgEl).html(errorInfo);
        $(config.msgEl).removeClass('hide');
    }

    //根据login页面的url入参执行登录表单赋值 例如  http://localhost:2001/?orgname=a&username=a&password=a
    function resetLoginFormByUrl(){
        var urlParas  = NetStarUtils.getUrlPara();
        var loginObj = {};
        if(urlParas.orgname){
            var orgNameStr = decodeURI(urlParas.orgname);
            //如果有简写的能匹配则使用简写的
            if(config.orgValues[orgname]){
                orgNameStr = config.orgValues[orgname]
            }
            loginObj.orgname = orgNameStr;
        }
        if(urlParas.username){
            loginObj.username = decodeURI(urlParas.username);
        }
        if(urlParas.password){
            loginObj.password = decodeURI(urlParas.password);
        }
        if($.isEmptyObject(loginObj) == false){
            setTimeout(function(){

                console.log('urlParas',urlParas, config);
                if(loginObj.orgname){
                    $(config.orgnameEl).val(loginObj.orgname);
                }
                if(loginObj.username){
                    $(config.usernameEl).val(loginObj.username);
                }
                if(loginObj.password){
                    $(config.passwordEl).val(loginObj.password);
                }
            },100)
        }
    }

    
	return {
        init:init,
        loginPanel:loginPanel,
        staticManager:staticManager,
        ajaxError:ajaxError,
        toHomePage:toHomePage,
	}
})(jQuery);

