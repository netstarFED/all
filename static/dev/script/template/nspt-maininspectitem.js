/*
 * @Author: netstar.lyw
 * @Date: 2020-04-03
 * @LastEditors: netstar.lyw
 * @LastEditTime: 2020-04-03
 * @Desription: 体检登记模板
 * 此模板通过component的name配置设置容器位置  不是一个可多用的模板是单独为体检登记写的
 */
NetstarTemplate.templates.physicalsReport = (function ($) {
    var configs = {};
    // config管理
    var configManage = {
        // 验证
        validConfig : function(config){
            //如果开启了debugerMode
            var isValid = true;
            if(debugerMode){
               //验证配置参数是否合法
               isValid = NetstarTemplate.commonFunc.validateByConfig(config);
            }
            if(!isValid){
                isValid = false;
                nsalert('配置文件验证失败', 'error');
                console.error('配置文件验证失败');
                console.error(config);
            }
            return isValid
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                defaultComponentWidth : '33%',
                serverData : {},
                pageData : {},
                closeValidSaveTime : 500,
                title : '',
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置配置
        setConfig : function(config){
            // 设置关闭是否保存方法
            if(config.closeValidSaveTime > -1){
                config.beforeCloseHandler = baseFuncManage.closePageBeforeHandler;
            }
            // 设置各组件配置 通过name
            var components = config.components;
            var componentsByName = {};
            for(var componentI=0; componentI<components.length; componentI++){
                var componentData = components[componentI];
                // keyField
                var componentKeyField = componentData.keyField ? componentData.keyField : 'root';
                // parent
                var parentField = componentData.parent ? componentData.parent : 'root';
                // params 暂时无用
                componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
                // 组件id
                var componentId = componentData.id;
                if(typeof(componentId) == "undefined"){
                    componentId = config.id + '-' + componentData.name + '-' + componentI;//定义容器id
                }
                componentData.id = componentId;
                componentData.package = config.package;
                componentData.parentField = config.parentField;
                componentData.componentKeyField = config.componentKeyField;
                // 这里配置无用 其它模板有配置所以配置  根据组件类型存储信息
                if(config.componentsConfig[componentData.type]){
                    config.componentsConfig[componentData.type][componentData.id] = componentData; 
                }
                // 名字
                var componentName = componentData.name;
                componentsByName[componentName] = componentData;
			}
            config.componentsByName = componentsByName;
        },
        getConfig : function(package){
            var _configs = configs[package];
            if(_configs){
                return _configs.config;
            }else{
                return false;
            }
        }
    }
    // 基础方法管理
    var baseFuncManage = {
        //此方法获取到当前模板页的配置定义和当前界面操作值
        dialogBeforeHandler : function(data,templateId){
            var templateConfig = NetstarTemplate.templates.physicalsReport.data[templateId].config;
            data.config = templateConfig;
            data.value = dataManage.getPageData(templateConfig);
            return data;
        },
        //此方法是在调用ajax执行之前的回调
        ajaxBeforeHandler : function(handlerObj,templateId){
            return handlerObj;
        },
        //此方法是在调用ajax完成之后需要对当前界面执行的逻辑
        ajaxAfterHandler : function(data,templateId,ajaxPlusData){
            var templateConfig = {};
            if(templateId){
                templateConfig = NetstarTemplate.templates.physicalsReport.data[templateId].config;
            }else{
                if(NetstarUI.labelpageVm.labelPagesArr[NetstarUI.labelpageVm.currentTab]){
                    var packageName = NetstarUI.labelpageVm.labelPagesArr[1].config.package;
                    templateConfig = NetstarTemplate.templates.configs[packageName];
                }
            }

            if(typeof(ajaxPlusData)=='undefined'){
                ajaxPlusData = {};
            }
            // templateConfig.pageInitDefaultData = getPageData(templateConfig, false, false); // 页面初始化数据改变
            if(templateConfig.closeValidSaveTime > -1){
                setTimeout(function(){
                    templateConfig.pageInitDefaultData = dataManage.getPageData(templateConfig, false, false); // 页面初始化数据改变
                }, templateConfig.closeValidSaveTime);
            }
            if(ajaxPlusData.isCloseWindow === true){
                //如果按钮上配置了关闭当前界面直接执行关闭操作
                NetstarUI.labelpageVm.removeCurrent();
            }else{
                if(!$.isArray(data)){
                    //返回值是对象 可以根据返回状态去处理界面逻辑
                    switch(data.objectState){
                        case NSSAVEDATAFLAG.DELETE:
                        //删除
                        templateConfig.serverData = {};
                        clearByAll(templateConfig);
                        break;
                        case NSSAVEDATAFLAG.EDIT:
                        //修改
                        templateConfig.serverData = nsServerTools.setObjectStateData(data);//改变服务端数据值，删除ojbectState为-1的数据
                        NetStarUtils.deleteAllObjectState(templateConfig.serverData);//删除objectState状态值
                        templateConfig.pageData = NetStarUtils.deepCopy(templateConfig.serverData);
                        clearByAll(templateConfig);
                        initComponentByFillValues(templateConfig);
                        break;
                        case NSSAVEDATAFLAG.ADD:
                        //新增
                        templateConfig.serverData = {};
                        clearByAll(templateConfig);
                        break;
                        case NSSAVEDATAFLAG.VIEW:
                        //刷新
                        templateConfig.serverData = nsServerTools.setObjectStateData(data);//改变服务端数据值，删除ojbectState为-1的数据
                        NetStarUtils.deleteAllObjectState(templateConfig.serverData);//删除objectState状态值
                        templateConfig.pageData = NetStarUtils.deepCopy(templateConfig.serverData);
                        clearByAll(templateConfig);
                        initComponentByFillValues(templateConfig);
                        break;
                    }
                }else{
                    //返回值是数组 没法根据objectState去处理逻辑
                }
            }
        },
        loadPageHandler : function(){   
        },
        closePageHandler : function(){

        },
        closePageBeforeHandler : function(package){
            var templateConfig = configManage.getConfig(package);
            if(!templateConfig){
                return false;
            }
            function delUndefinedNull(obj){
                if($.isArray(obj)){
                for(var i=0; i<obj.length; i++){
                    delUndefinedNull(obj[i]);
                }
                }else{
                for(var key in obj){
                    if(typeof(obj[key]) == "object"){
                        delUndefinedNull(obj[key]);
                    }else{
                        if(obj[key] === '' || obj[key] === undefined){
                            delete obj[key];
                        }
                    }
                }
                }
            }
            var pageData = dataManage.getPageData(package, false, false);
            delUndefinedNull(pageData)
            var pageInitDefaultData = templateConfig.pageInitDefaultData ? templateConfig.pageInitDefaultData : templateConfig.serverData;
            delUndefinedNull(pageInitDefaultData)
            return {
                getPageData : pageData,
                serverData : pageInitDefaultData,
            }
        }
    }
    // 组件管理
    var componentManage = {
        // 按钮
        btns : {
            init : function(componentConfig, config){
                var btnConfig = config.componentsByName.btns;
                var btnsObj = {};
                btnsObj[btnConfig.id] = btnConfig;
                NetstarTemplate.commonFunc.btns.initBtns(btnsObj, config);
            }
        },
        // 个人信息
        personal : {
            // 获取数据
            getData : function(componentConfig, isValid, config){

            },
            // 设置数据
            setData : function(data, componentConfig, config){
                
            },
            // 清空数据
            clearData : function(componentConfig, config){
                
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            //html
            html:function(componentConfig,config){
                var id = componentConfig.id + '-personal-search';
                var inputId = componentConfig.id + '-input';
                var html = 
                    '<div id = "'+ id + '">'
                        +'<div class="pt-panel">'
                            +'<div class="search-box">'
                            +'<input type="text" class="pt-form-control" id="'+ inputId + '" placeholder="体检编号" @blur.prevent=\'searchNo()\'>'
                            +'</div>'
                        +'</div>'
                        +'<div class="pt-panel">'
                            +'<div class="user-photo">'
                                +'<img src="../saas/static/images/user-photo.jpg" alt="">'
                            +'</div>'
                            +'<div class="user-photo-eidt">'
                            +' <div class="pt-btn-group">'
                                    +'<button class="pt-btn pt-btn-default" @click="clickUpload()">'
                                        +'<i class="icon icon-image"></i>'
                                    +'</button>'
                                    +'<button class="pt-btn pt-btn-default" @click=\'clickPhoto()\'>'
                                        +'<i class="icon icon-id"></i>'
                                    +'</button>'
                                    +'<button class="pt-btn pt-btn-default">'
                                        +'<i class="icon icon-camera"></i>'
                                    +'</button>'
                                +'</div>'
                        + '</div>'
                        +'</div>'
                        +'<div class="pt-panel">'
                        +'<div class="queue">'
                            +'<div class="pt-btn-group">'
                               +' <button class="pt-btn pt-btn-default"><i class="icon icon-arrow-left-o"></i><span>上一位</span></button>'
                                +'<button class="pt-btn pt-btn-default"><span>下一位</span><i class="icon icon-arrow-right-o"></i></button>'
                            +'</div>'
                        +'</div>'
                    +'</div>'
                + '</div>';

                componentConfig.searchId = id;
                componentConfig.inputId = inputId;
                return html;
            },
            // 初始化
            init :function(componentConfig, config){
                var id = componentConfig.id;
                var $container = $('#' + id);
                var html = this.html(componentConfig,config)
                $container.html(html)
            }
        },
        //疾病列表
        diseaseList : {   
            // 获取数据
            getData : function(componentConfig, isValid, config){
                
            },
            // 设置数据
            setData : function(data, componentConfig, config){
                // header
             
            },
            // 清空数据
            clearData : function(componentConfig, config){
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            // 获取header的html
            getHeaderHtml : function(componentConfig){

            },
            getHeaderShowData : function(data, componentConfig){

            },
            // 初始化header
            initHeader : function(componentConfig, data, config){

            },
            // 初始化表单
            initForm : function(componentConfig, data, config){

            },
            // 初始化
            init : function(componentConfig, config){
                console.log(config);


            }
        },
        //项目小结
        bieflyItem : {
            // 获取数据
            getData : function(componentConfig, isValid, config){

            },
            // 设置数据
            setData : function(data, componentConfig, config){

            },
            // 清空数据
            clearData : function(componentConfig, config){

            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            //项目小结的html
            html:function(componentConfig,config){
                var id = componentConfig.id + '-body-item'
                var html = 
                '<div class="pt-panel">'
                    +'<div class="pt-panel-header">'
                        +'<div class="title">'
                            +'<span>项目小结</span>'
                        +'</div>'
                    +'</div>'
                    +'<div class="pt-panel-body" id = "'+ id +'">'
                        +'<div class="block-list block-list-vertical">'
                            +'<div class="block-list-group">'
                                +'<div class="block-list-item">'
                                    +'<div class="block-list-content">'
                                        +'<div class="list-body" v-for = "list in ">'
                                            +'<div class="list-text">'
                                                +'<span>眼底动脉硬化</span>'
                                            +'</div>'
                                            +'<div class="list-text text-gray">'
                                               +'<span>收缩压：146mmhg</span><span>舒张压：97mmhg</span>'
                                            +'</div>'
                                        +'</div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                        +'</div>'
                    +'</div>'
                +'</div>';
                componentConfig.bodyId = id
                return html;
            },
            //获取到表格的数据
            getRowsData:function(){

            },
            //获取到vue的data
            getVmData:function(componentConfig,config){
                var originalRows = [];
                var data = {
                    rows:this.getRowsData()
                }
                return data;
            },
            //初始化
            init: function(componentConfig, config){  
                debugger
                var id = componentConfig.id;
                var $container = $('#' + id);
                var html = this.html(componentConfig,config);
                $container.html(html);
                var data = this.getVmData(componentConfig,config)
                var itemVm = new Vue({
                    el:"#" + componentConfig.bodyId,
                    data:data
                })
                componentConfig.itemVm = itemVm
            }
        },
        // 结论信息
        conclusion : {
            // 获取数据
            getData : function(componentConfig, isValid, config){

            },
            // 设置数据
            setData : function(data, componentConfig, config){


            },
            // 清空数据
            clearData : function(componentConfig, config){
                
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            //获取html
            getHtml:function(componentConfig){     
               
            },
            // 初始化
            init : function(componentConfig, config){  

            }
        },
        init : function(config){
            var componentsByName = config.componentsByName;
            for(var keyName in componentsByName){
                var componentConfig = componentsByName[keyName];
                if(typeof(componentManage[componentConfig.name]) == "object"){
                    componentManage[componentConfig.name].init(componentConfig, config);
                }else{
                    console.error('没有找到组件方法');
                    console.error(componentConfig);
                }
            }
            if(config.closeValidSaveTime > -1){
               setTimeout(function(){
                config.pageInitDefaultData = dataManage.getPageData(config, false, false);
               }, config.closeValidSaveTime);
            }
        }
    }
    // 整体面板管理
    var panelManage = {
        getTitle : function(config){
            var html = '';
            if(config.title){
                //定义了标题输出
                html = '<div class="pt-main-row physicalsreport-title">'
                            +'<div class="pt-main-col">'
                                +'<div class="pt-panel pt-panel-header">'
                                    +'<div class="pt-container">'
                                        +'<div class="pt-panel-row">'
                                            +'<div class="pt-panel-col">'
                                                +'<div class="pt-title pt-page-title"><h4>'+config.title+'</h4></div>'
                                            +'</div>'
                                        +'</div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                        +'</div>';
            }
            return html;
        },
        getBtns : function(config){
            var btnConfig = config.componentsByName.btns;
            if(!btnConfig){
                return '';
            }
            var html = '<div class="pt-panel">'
                            +'<div class="pt-container">'
                                +'<div class="pt-panel-row">'
                                    +'<div class="pt-panel-col">'
                                        +'<div class="main-btns pt-components-btn" id="'+btnConfig.id+'"></div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                        +'</div>';
            return html;
        },
        // 疾病列表
        getPersonal : function(config){
            var personalConfig = config.componentsByName.personal;
            if(!personalConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ personalConfig.id +'">'
                        + '</div>'
            return html;
        },
        getDiseaseList : function(config){
            var registerConfig = config.componentsByName.diseaseList;
            if(!registerConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ getDiseaseList.id +'">'
                        + '</div>'
            return html;
        },
        getProject : function(config){
            var projectConfig = config.componentsByName.project;
            if(!projectConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ projectConfig.id +'">'
                        + '</div>'
            return html;
        },
        getCost : function(config){
            var costConfig = config.componentsByName.cost;
            if(!costConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ costConfig.id +'">'
                        + '</div>'
            return html;
        },
        //获取到项目小结的组件方法
        getBieflyItem : function(config){
            var bieflyItemConfig = config.componentsByName.bieflyItem;
            if(!bieflyItemConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ bieflyItemConfig.id +'">'
                        + '</div>'
            return html;
        },
        //结论信息
        getConclusion : function(config){
            var conclusionConfig = config.componentsByName.conclusion;
            if(!conclusionConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ conclusionConfig.id +'">'
                        + '</div>'
            return html;
        },
        init : function(config){
            // title
            var titleHtml = panelManage.getTitle(config);
            // btns
            var btnsHtml = panelManage.getBtns(config);
            // 疾病列表
            var personalHtml = panelManage.getPersonal(config);
            // 疾病列表
            var diseaseListHtml = panelManage.getDiseaseList(config);
            // 项目小结
            var bieflyItemHtml = panelManage.getBieflyItem(config);
            //结论信息
            var conclusionHtml = panelManage.getConclusion(config);
            // html
            var templateClassStr = '';
            if(config.plusClass){
                templateClassStr = config.plusClass;
            }
            var html = '<div class="pt-main physicalsreport '+templateClassStr+'" id="'+config.id+'" ns-package="'+config.package+'">'
                            + '<div class="pt-container">'
                                + titleHtml
                                // 按钮
                                + '<div class="pt-main-row">'
                                    + '<div class="pt-main-col">'
                                        // 按钮
                                        + btnsHtml
                                    + '</div>'
                                + '</div>'
                                // left
                                + '<div class="pt-main-row">'
                                    + '<div class="pt-main-col">'
                                        // 个人信息
                                        + personalHtml
                                        // 费用信息
                                      //  + costHtml
                                    + '</div>'
                                    // center
                                    + '<div class="pt-main-col">'
                                        // 疾病列表
                                        + diseaseListHtml
                                        // 结论信息
                                        + conclusionHtml
                                    + '</div>'
                                    // right
                                    + '<div class="pt-main-col">'
                                        // 项目信息
                                        + bieflyItemHtml
                                    + '</div>'
                                + '</div>'
                            + '</div>'
                        + '</div>';
            
            // 容器
            var $container = $('container').not('.hidden');
            if($container.length > 0){
                $container = $container.eq($container.length - 1);
            }
            if(config.$container){
                $container = config.$container;
            }
            $container.append(html);
        }
    }
    // 页面方法管理
    var dataManage = {
        getComponentsData : function(config, isValid){
            var data = {};
            var componentsByName = config.componentsByName;
            for(var keyName in componentsByName){
                // 按钮不需要获取
                if(keyName == "btns"){ continue; }
                // 没有该组件
                if(typeof(componentManage[keyName]) != "object"){ continue; }
                var componentConfig = componentsByName[keyName];
                var componentData = componentManage[keyName].getData(componentConfig, isValid, config);
                if(componentData == undefined){
                    continue;
                }
                if(!componentData){
                    data = false;
                    break;
                }
                var keyField = componentConfig.keyField;
                if(keyField == "root"){
                    $.each(componentData, function(key, value){
                        data[key] = value;
                    });
                }else{
                    data[keyField] = componentData;
                }
            }
            return data;
        },
        //获取界面数据
        getPageData : function(config, isValid, isSetObjectState){
            /**
             * config object 当前配置项 某些条件下存在不传配置项传值为包名的情况（具体条件暂不清楚）
             * isValid 是否验证 默认true验证
             * isSetObjectState 是否需要比较设置状态值 默认true
            */
            isValid = typeof(isValid)=='boolean' ? isValid : true;
            isSetObjectState = typeof(isSetObjectState)=='boolean' ? isSetObjectState : true;
            if(typeof(config)=='string'){
               config = configManage.getConfig(config);
            }
            var pageData = dataManage.getComponentsData(config, isValid);
            if(pageData === false){
               return false;
            }
            var returnData = pageData;
            if(isSetObjectState){
               returnData = nsServerTools.getObjectStateData(config.serverData, pageData, config.idFieldsNames);
            }
            NetstarTemplate.commonFunc.setSendParamsByPageParamsData(returnData, config);
            return returnData;
        },
        // 设置页面数据
        setPageData : function(value, config){
            // 验证
            value = typeof(value)=='object' ? value : {};
            var data = config.serverData;
            if(!$.isEmptyObject(value)){
                data = value;
            }
            if($.isEmptyObject(data)){
               nsalert('无返回值', 'warning');
               console.error('无返回值');
               return false;
            }
            // 开始赋值
            var componentsByName = config.componentsByName;
            for(var keyName in componentsByName){
                // 按钮不需要获取
                if(componentsByName == "btns"){ continue; }
                // 没有该组件
                if(typeof(componentManage[componentsByName]) != "object"){ continue; }
                var componentConfig = componentsByName[keyName];
                var componentData = {};
                var keyField = componentConfig.keyField;
                if(keyField == "root"){
                    componentData = data;
                }else{
                    componentData = data[keyField];
                }
                componentManage[componentsByName].setData(componentData, componentConfig, config);
            }
        },
        // 清空页面数据
        clearPageData : function(config){
            var componentsByName = config.componentsByName;
            for(var keyName in componentsByName){
                // 按钮不需要获取
                if(keyName == "btns"){ continue; }
                // 没有该组件
                if(typeof(componentManage[keyName]) != "object"){ continue; }
                var componentConfig = componentsByName[keyName];
                componentManage[keyName].clearData(componentConfig, config);
            }
        },
    }
    // 初始化
    function init(config){
        var isPass = configManage.validConfig(config);
        if(!isPass){
            return false;
        }
        // 存储模板配置参数
        NetstarTemplate.commonFunc.setTemplateParamsByConfig(config);
        configs[config.package] = {
            sourse : $.extend(true, {}, config),
            config : config,
        }
        // 设置模板通用参数默认值
        NetstarTemplate.commonFunc.setDefault(config);
        // 设置config
        configManage.setConfig(config);
        // 初始化容器
        panelManage.init(config);
        if(!$.isEmptyObject(config.getValueAjax)){
            //当前界面存在此定义则先请求根据返回值去初始化各个组件调用
            var getValueAjaxConfig = $.extend(true, {}, config.getValueAjax);
            if(!$.isEmptyObject(config.pageParam)){
               if(!$.isEmptyObject(getValueAjaxConfig.data)){
                  getValueAjaxConfig.data = NetStarUtils.getFormatParameterJSON(getValueAjaxConfig.data, config.pageParam);
               }else{
                  getValueAjaxConfig.data = config.pageParam;
               }
            }
            getValueAjaxConfig.plusData = {
               packageName:config.package,
               templateId:config.id
            };
            NetStarUtils.ajax(getValueAjaxConfig,function(res,ajaxPlusData){
                var templateConfig = configManage.getConfig(ajaxPlusData.plusData.packageName);
               if(res.success){
                  var resData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : {};
                  NetStarUtils.deleteAllObjectState(resData);//删除服务端返回的数据状态
                  templateConfig.serverData = resData;//服务端返回的原始数据
                  templateConfig.pageData = NetStarUtils.deepCopy(resData);//克隆服务端返回的原始数据
                  componentManage.init(templateConfig);//组件化分别调用
               }else{
                  nsalert('返回值false','error');
                  componentManage.init(templateConfig);//组件化分别调用
               }
            },true);
         }else{
            componentManage.init(config);
        }
    }
    return {
        getConfig : configManage.getConfig,
        init : init,
        dialogBeforeHandler : baseFuncManage.dialogBeforeHandler,
        ajaxBeforeHandler : baseFuncManage.ajaxBeforeHandler,
        ajaxAfterHandler : baseFuncManage.ajaxAfterHandler,
        // 获取页面数据
        getPageData : dataManage.getPageData,
        // 设置页面数据
        setPageData : dataManage.setPageData,
        // 清空页面数据
        clearPageData : dataManage.clearPageData,
    };
})(jQuery);