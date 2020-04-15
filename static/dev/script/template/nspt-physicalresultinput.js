/*
 * @Author: netstar.lyw
 * @Date: 2020-04-03
 * @LastEditors: netstar.lyw
 * @LastEditTime: 2020-04-13
 * @Desription: 体检登记模板
 * 此模板通过component的name配置设置容器位置  不是一个可多用的模板是单独为体检登记写的
 */
NetstarTemplate.templates.physicalResultInput = (function ($) {
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
                if(componentData.type == "switch"){
                    componentData.gridKeyField = componentData.gridKeyField ? componentData.gridKeyField : 'list';
                    componentData.imgKeyField = componentData.imgKeyField ? componentData.imgKeyField : 'list';
                }
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
            var templateConfig = NetstarTemplate.templates.physicalResultInput.data[templateId].config;
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
                templateConfig = NetstarTemplate.templates.physicalResultInput.data[templateId].config;
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
        // 项目信息
        project : {
            formField : [
                {
                    id : 'doctorId',
                    label : '检查医生',
                    type : 'select',
                    valueField : 'doctorId',
                    textField : 'doctorName',
                },{
                    id : 'doctorVal1',
                    label : '审查医生',
                    type : 'select',
                    valueField : 'doctorId',
                    textField : 'doctorName',
                },{
                    id : 'doctorVal2',
                    label : '小结医生',
                    type : 'select',
                    valueField : 'doctorId',
                    textField : 'doctorName',
                },{
                    id : 'doctorVal3',
                    label : '操作人',
                    type : 'select',
                    valueField : 'doctorId',
                    textField : 'doctorName',
                },{
                    label : '',
                    id : 'textarea',
                    type : 'textarea',
                    changeHandler : function(obj){
                        console.log(obj);
                    }
                }
            ],
            // 获取数据
            getData : function(componentConfig, isValid, config){
                var data = componentConfig.listData;
                return data;
            },
            // 设置数据
            setData : function(data, componentConfig, config){
                componentConfig.listData = data;
                // 根据数据获取列表配置
                componentConfig.listConfigs = this.getListConfig(data, componentConfig, config);
                // 获取html 设置容器
                var html = this.getHtml(componentConfig, config);
                var containerId = componentConfig.id;
                var $container = $('#' + containerId);
                $container.html(html);
                // 初始化配置按钮
                this.initBtns(componentConfig, config);
                // 初始化默认按钮
                this.initDefBtns(componentConfig, config);
            },
            // 清空数据
            clearData : function(componentConfig, config){
                var containerId = componentConfig.id;
                var $container = $('#' + containerId);
                $container.html('');
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            // 获取展开的html
            getPanelHtml : function(index, componentConfig, config){
                // 列表配置
                var listConfigs = componentConfig.listConfigs;
                // 面板配置
                var panelConfig = listConfigs[index];
                var html = '<div class="" id="'+ panelConfig.gridId +'">'
                                // 表格
                            + '</div>'
                            // 小结
                            + '<div class="" id="'+ panelConfig.summaryId +'">'
                                // 标题
                                + '<div class="">'
                                    + '小结'
                                + '</div>'
                                // 小结form
                                + '<div class="" id="'+ panelConfig.summaryFormId +'">'
                                + '</div>'
                                // 图片列表
                                + '<div class="" id="'+ panelConfig.summaryImagesId +'">'
                                + '</div>'
                            + '</div>'
                return html;
            },
            // 获取列表配置
            getListConfig : function(listData, componentConfig, config){
                // 
                var listConfigs = [];
                for(var i=0; i<listData.length; i++){
                    var data = listData[i];
                    listConfigs.push({
                        index : i,
                        title : data.comboName ? data.comboName : '项目名称' + (i==0 ? '' : i),
                        headerId : componentConfig.id +'-block-header-'+ i,
                        bodyId : componentConfig.id +'-block-body-'+ i,
                        blockId : componentConfig.id +'-block-'+ i,
                        btnsId : componentConfig.id +'-block-btn-'+ i,
                        defaultBtnsId : componentConfig.id +'-block-def-btn-'+ i,
                        gridId : componentConfig.id +'-block-grid-'+ i,
                        summaryId : componentConfig.id +'-block-summary-'+ i,
                        summaryFormId : componentConfig.id +'-block-summary-form-'+ i,
                        summaryImagesId : componentConfig.id +'-block-summary-images-'+ i,
                    })
                }
                return listConfigs;
            },
            // 获取html
            getHtml : function(componentConfig, config){
                // 列表配置
                var listConfigs = componentConfig.listConfigs;
                // html
                var html = '';
                for(var i=0; i<listConfigs.length; i++){
                    var dataConfig = listConfigs[i];
                    html += '<div class="" ns-index="'+ i +'" id="'+ dataConfig.blockId +'">'
                                // 头部
                                + '<div class="" id="'+ dataConfig.headerId +'">'
                                    // 标题
                                    + '<div class="">'+ dataConfig.title +'</div>'
                                    // 配置按钮
                                    + '<div class="" id="'+ dataConfig.btnsId +'"></div>'
                                    // 默认按钮
                                    + '<div class="" id="'+ dataConfig.defaultBtnsId +'"></div>'
                                + '</div>'
                                // 内容
                                + '<div class="" id="'+ dataConfig.bodyId +'">'
                                + '</div>'
                            + '</div>'
                }
                return html;
            },
            panel : {
                setGridDataByChange : function(newData, index, componentConfig, pageConfig){
                    // 面板数据
                    var panelData = componentConfig.listData[index];
                    var gridKeyField = componentConfig.gridKeyField;
                    panelData[gridKeyField] = newData;
                },
                initGrid : function(index, componentConfig, config){
                    // 列表配置
                    var listConfigs = componentConfig.listConfigs;
                    // 面板配置
                    var panelConfig = listConfigs[index];
                    // 面板数据
                    var panelData = componentConfig.listData[index];
                    // 表格数据
                    var dataSource = panelData[componentConfig.gridKeyField] ? panelData[componentConfig.gridKeyField] : [];
                    // 初始化表格
                    var gridConfig = {
                        id :            panelConfig.gridId,
                        type :          'list',
                        idField :       componentConfig.idField,
                        templateId :    config.id,
                        package :       config.package,
                        data:{
                            isSearch:true,
                            isPage:true,
                            primaryID:componentConfig.idField,
                            idField:componentConfig.idField,
                            dataSource : dataSource,
                        },
                        columns:$.extend(true, [], componentConfig.field),
                        ui:{
                            isAllowAdd : false,
                            isHaveEditDeleteBtn : false,
                            isEditMode : true,
                            selectMode : 'none',
                            pageLengthDefault : 5,
                            originalRowsChangeHandler : (function(index, componentConfig, pageConfig){
                                return function(newData){
                                    componentManage.project.panel.setGridDataByChange(newData, index, componentConfig, pageConfig);
                                }
                            })(index, componentConfig, config)
                        },
                        getPageDataFunc : (function(config){
                            return function(){
                                return dataManage.getPageData(config, false, false)
                            }
                        })(config)
                    };
                    NetStarGrid.init(gridConfig);
                },
                setFormDataByChange : function(fieldId, value, index, componentConfig, pageConfig){
                    // 面板数据
                    var panelData = componentConfig.listData[index];
                    panelData[fieldId] = value;
                },
                initForm : function(index, componentConfig, config){
                    // 列表配置
                    var listConfigs = componentConfig.listConfigs;
                    // 面板配置
                    var panelConfig = listConfigs[index];
                    // 面板数据
                    var panelData = componentConfig.listData[index];
                    // 获取医生下拉框
                    var doctorArr = panelData[componentConfig.doctorKeyField] ? panelData[componentConfig.doctorKeyField] : [];
                    var formField = componentManage.project.formField;
                    for(var i=0; i<formField.length; i++){
                        formField[i].subdata = doctorArr;
                        formField[i].commonChangeHandler = function(obj){
                            var value = typeof(obj.value) != "undefined" ? obj.value : '';
                            componentManage.project.panel.setFormDataByChange(obj.id, value, index, componentConfig, pageConfig);
                        };
                    }
                    // 初始化表单
                    var formConfig = {
                        id : panelConfig.summaryFormId,
                        isSetMore : false,
                        formStyle : 'pt-form-normal',
                        form : formField
                    }
                    NetstarComponent.formComponent.show(formConfig, panelData);
                },
                initImages : function(index, componentConfig, config){
                    // 列表配置
                    var listConfigs = componentConfig.listConfigs;
                    // 面板配置
                    var panelConfig = listConfigs[index];
                    // 面板数据
                    var panelData = componentConfig.listData[index];
                    // 图片数据
                    var imgList = panelData[componentConfig.imgKeyField] ? panelData[componentConfig.imgKeyField] : [];
                    var html = '<ul class="">'
                                    + '<li :class="[{active:data.showOnReport}]" v-for="(data, listI) in list" @click="switchSelect($event, listI, data)">'
                                        + '<img :src="(imgUrl+data.id)" />'
                                    + '</li>'
                                + '</ul>'
                    var summaryImagesId = panelConfig.summaryImagesId;
                    var $imgContainer = $('#' + summaryImagesId);
                    $imgContainer.html(html);
                    componentConfig.imgVue = new Vue({
                        el : '#' + summaryImagesId,
                        data : {
                            imgUrl : 'http://localhost:2000/sites/tj/static/images/user-photo.jpg?',
                            list : imgList
                        },
                        methods : {
                            switchSelect : function(ev, listI, data){
                                data.showOnReport = !data.showOnReport;
                            }
                        }
                    })
                },
            },
            // 打开面板
            openPanel : function(index, componentConfig, config){
                // 列表配置
                var listConfigs = componentConfig.listConfigs;
                // 面板配置
                var panelConfig = listConfigs[index];
                // 设置容器
                var html = this.getPanelHtml(index, componentConfig, config);
                var $panel = $('#' + panelConfig.bodyId);
                $panel.html(html);
                // 初始化表格
                this.panel.initGrid(index, componentConfig, config);
                // 初始化表单
                this.panel.initForm(index, componentConfig, config);
                // 初始化图片
                this.panel.initImages(index, componentConfig, config);
            },
            // 关闭面板
            closePanel : function(index, componentConfig, config){
                // 列表配置
                var listConfigs = componentConfig.listConfigs;
                var panelConfig = listConfigs[index];
                $('#' + panelConfig.bodyId).children().remove();
            },
            // 初始化配置按钮
            initBtns : function(componentConfig, config){
                // 列表配置
                var listConfigs = componentConfig.listConfigs;
                var btnsObj = {};
                if(config.btnKeyFieldJson[componentConfig.keyField]){
                    for(var i=0; i<listConfigs.length; i++){
                        btnsObj[listConfigs[i].btnsId] = config.btnKeyFieldJson[componentConfig.keyField];
                    }
                    NetstarTemplate.commonFunc.btns.initBtns(btnsObj, config);
                }
            },
            // 初始化默认按钮
            initDefBtns : function(componentConfig, config){
                var _this = this;
                // 列表配置
                var listConfigs = componentConfig.listConfigs;
                for(var i=0; i<listConfigs.length; i++){
                    var html = '<div class="pt-btn-group">'
                                    + '<button type="button" class="pt-btn pt-btn-default" ns-state="open" ns-index="'+ i +'">'
                                        + '<i class="icon icon-add"></i>'
                                    + '</button>'
                                + '</div>'
                    var $btnContainer = $('#' + listConfigs[i].defaultBtnsId);
                    $btnContainer.html(html);
                    // 设置事件;
                    var $btns = $btnContainer.find('button');
                    $btns.off('click');
                    $btns.on('click', function(ev){
                        var $this = $(this);
                        var nsState = $this.attr('ns-state');
                        var nsIndex = Number($this.attr('ns-index'));
                        var changeStateName = '';
                        var changeIcon = '';
                        switch(nsState){
                            case 'open':
                                // 打开
                                changeIcon = 'icon icon-arrow-down-o';
                                changeStateName = 'close';
                                _this.openPanel(nsIndex, componentConfig, config);
                                break;
                            case 'close':
                                // 关闭
                                changeIcon = 'icon icon-add';
                                changeStateName = 'open';
                                _this.closePanel(nsIndex, componentConfig, config);
                                break;
                        }
                        // 改变状态
                        $this.attr('ns-state', changeStateName);
                        $this.children('i').attr('class', changeIcon);
                    });
                }
            },
            // 初始化
            init : function(componentConfig, config){
                // 数据
                var listData = dataManage.getComponentsDataByPageData(config.serverData, componentConfig, config);
                componentConfig.listData = listData;
                // 根据数据获取列表配置
                componentConfig.listConfigs = this.getListConfig(listData, componentConfig, config);
                // 获取html 设置容器
                var html = this.getHtml(componentConfig, config);
                var containerId = componentConfig.id;
                var $container = $('#' + containerId);
                $container.html(html);
                // 初始化配置按钮
                this.initBtns(componentConfig, config);
                // 初始化默认按钮
                this.initDefBtns(componentConfig, config);
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
                html = '<div class="pt-main-row physicalResultInput-title">'
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
        getProject : function(config){
            var projectConfig = config.componentsByName.project;
            if(!projectConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ projectConfig.id +'">'
                        + '</div>'
            return html;
        },
        init : function(config){
            // title
            var titleHtml = panelManage.getTitle(config);
            // btns
            var btnsHtml = panelManage.getBtns(config);;
            // 项目信息
            var projectHtml = panelManage.getProject(config);
            // html
            var templateClassStr = '';
            if(config.plusClass){
                templateClassStr = config.plusClass;
            }
            var html = '<div class="pt-main physicalResultInput '+templateClassStr+'" id="'+config.id+'" ns-package="'+config.package+'">'
                            + '<div class="pt-container">'
                                + titleHtml
                                // 按钮
                                + '<div class="pt-main-col">'
                                    // 按钮
                                    + btnsHtml
                                + '</div>'
                                // left
                                + '<div class="pt-main-col">'
                                + '</div>'
                                // center
                                + '<div class="pt-main-col">'
                                    // 项目信息
                                    + projectHtml
                                + '</div>'
                                // right
                                + '<div class="pt-main-col">'
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
        // 获取数据通过data
        getComponentsDataByPageData : function(data, componentConfig, config){
            var data = typeof(data) == "object" ? data : {};
            var keyField = componentConfig.keyField;
            var _data = {};
            if(keyField != "root"){
                if(typeof(data[keyField]) == "object"){
                    _data = data[keyField];
                }else{
                    switch(componentConfig.name){
                        case 'project':
                            _data = [];
                            break;
                        default:
                            _data = {};
                            break;
                    }
                }
            }
            return _data;
        },
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
            if(typeof(config)=='string'){
               config = configManage.getConfig(config);
            }
            // 验证
            value = typeof(value)=='object' ? value : {};
            var data = config.serverData;
            // if(!$.isEmptyObject(value)){
                data = value;
            // }
            // 开始赋值
            var componentsByName = config.componentsByName;
            for(var keyName in componentsByName){
                // 按钮不需要获取
                if(keyName == "btns"){ continue; }
                // 没有该组件
                if(typeof(componentManage[keyName]) != "object"){ continue; }
                var componentConfig = componentsByName[keyName];
                var componentData = dataManage.getComponentsDataByPageData(data, componentConfig, config);
                componentManage[keyName].setData(componentData, componentConfig, config);
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