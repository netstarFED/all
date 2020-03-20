/*
 * @Desription: 编辑器API管理器
 * @Author: netstar.cy
 * @Date: 2019-12-15 14:56:47
 * @LastEditTime: 2019-12-16 20:35:28
 */

const NetstarEditorApi = (function(){

    //AJAX方法 使用 ajax().then(f).catch(f)
    const ajax = function(_config, _ajaxData){
        return new Promise(function(resolve, reject){
            let Authorization = NetStarUtils.OAuthCode.get();
            if(!Authorization){
                if(typeof(NetstarHomePage) == "object" && typeof(NetstarHomePage.config) == "object" && typeof(NetstarHomePage.config.toLoginPage) == "function"){
                    NetstarHomePage.config.toLoginPage();
                }
            }
            let defaultConfig = {
                type:"POST",
                contentType:'application/json',
                headers:{ Authorization: Authorization},
            }
            let config = NetStarUtils.getDefaultValues(_config, defaultConfig);
            config.url = getRootPathUrl() + config.url;
            
            if(_ajaxData){
                config.data = _ajaxData;
            }
            
            //GET方法一般使用 application/x-www-form-urlencoded
            config.type = config.type.toLocaleUpperCase();
            if(config.type == 'GET' && typeof(_config.contentType)!= 'string' ){
                config.contentType = 'application/x-www-form-urlencoded';
            }
            
            //application/json 需要添加空对象或者转换为JSON字符串
            if(config.contentType == 'application/json'){
                if(typeof(config.data) == 'object'){
                    config.data = JSON.stringify(config.data);
                }else if(typeof(config.data) == 'undefined'){
                    config.data = '{}';
                }
            }
            config.success = function(res){
                if(res.success){
                    //可定义的结果格式化参数 返回值继续执行 formatter:function
                    if(typeof(this.formatter) == 'function'){
                        res = this.formatter(res);
                        if(typeof(res) == 'undefined'){
                            let errStr = this.url + '所定义的formatter没有返回值';
                            // nsalert(errStr, 'error');
                            console.error(errStr, this);
                        }
                    }
                    resolve(res);
                }else{
                    reject(res);
                }
            };
            config.error = function(error){
                reject(error);
            }
            $.ajax(config);
        })
    }

    //根据URLS初始化出所有方法
    //使用方式 api.controller.get({...}).then(function(res){...})
    const get = function(urls){
        let api = {};
        //根据urls 生成多个方法等待调用
        for(let i=0; i<urls.length; i++){
            
            let urlConfig = urls[i];
            urlConfig.index = i;  //补充index参数便于显示和定位
    
            let url = urlConfig.url;
            if(typeof(url)!='string'){
                let errStr = 'urls 第' + (i+1) + '个配置错误， url参数必填';
                // nsalert(errStr, 'error');
                console.error(errStr, urlConfig);
            }
            let name = urlConfig.name; //name非必填，如果没有则默认为url最后部分   "/formdatasources/controllerlist" => controllerlist
            if(typeof(name) == 'undefined'){
                name = url.substr(url.lastIndexOf('/')+1); //截取字符串 '/'
            }
            if(api[name]){
                //如果重名了就报错
                let errorIndex = api[name].config.index
                let errStr = 'urls 第' + (i+1) + '个配置错误， name 重复了, urls中第'+ ( errorIndex + 1) +'个已经使用该名称';
                // nsalert(errStr, 'error');
                console.error(errStr, '当前配置:', urlConfig, urls[errorIndex]);
            }
            api[name] = {
                config:urlConfig,
                get:function(ajaxData){
                    var _this = this;
                    return new Promise(function(resolve, reject){
                        NetstarEditorApi.ajax(_this.config, ajaxData).then(function(res){
                            // cb && cb(res);
                            resolve(res);
                        }, (function(thisConfig){
                            return function(res){
                                nsAlert('发送'+thisConfig.url+'失败', 'error');
                                console.error(thisConfig);
                                console.error(res);
                                if(typeof(reject) == "function"){
                                    reject(res)
                                }
                            }
                        })(_this.config))
                    })
                }
            }
        }
        return api;
    }

    return {
        get:get,
        ajax:ajax,
    }
})()