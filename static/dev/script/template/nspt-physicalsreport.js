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
            // 初始化
            init : function(componentConfig, config){
                
            }
        },
        // 登记信息
        register : {
            // 获取数据
            getData : function(componentConfig, isValid, config){
                // header
                var headerData = componentConfig.headerVueObj.data;
                // boder
                var formValue = NetstarComponent.getValues(componentConfig.bodyId, isValid);
                if(!formValue){
                    return formValue;
                }
                formValue = $.extend(false, formValue, headerData);
                return formValue;
            },
            // 设置数据
            setData : function(data, componentConfig, config){
                // header
                var headerValue = {
                    time : data.time,
                    orderNo : data.orderNo,
                    type : data.type,
                }
                componentConfig.headerVueObj.data = headerValue;
                // boder
                NetstarComponent.fillValues(data, componentConfig.bodyId);
            },
            // 清空数据
            clearData : function(componentConfig, config){
                // header
                componentConfig.headerVueObj.data = [];
                // boder
                NetstarComponent.clearValues(componentConfig.bodyId);
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            // 获取header的html
            getHeaderHtml : function(componentConfig){
                var html = '<div class="title">体检登记</div>'
                                + '<div class="pt-panel-header-right">'
                                    + '<span>预约时间：{{showData.time}}</span>'
                                    + '<span>订单编号：{{showData.orderNo}}</span>'
                                    + '<div class="switch">'
                                        + '<div class="switch-item" v-on:click="btnCutaways" :class="{\'current\': showData.type==0}">'
                                            + '<span>个人</span>'
                                        + '</div>'
                                        + '<div class="switch-item" v-on:click="btnCutawaysBack" :class="{\'current\': showData.type==1}">'
                                            + '<span>单位</span>'
                                        + '</div>'
                                    + '</div>'
                                    + '<div class="checkbox-box" v-on:click="btnChecked" :class="{\'checked\': ischecked==true}">'
                                        + '<span>预约</span>'
                                    + '</div>'
                                + '</div>'
                            + '</div>'
                return html;
            },
            getHeaderShowData : function(data, componentConfig){
                var time = '';
                if(data.time){
                    time = moment(data.time).format('YYYY-MM-DD')
                }
                var showData = {
                    time : time,
                    orderNo : data.orderNo,
                    type : data.type,
                };
                return showData;
            },
            // 初始化header
            initHeader : function(componentConfig, data, config){
                var _this = this;
                var headerId = componentConfig.headerId;
                var $header = $('#' + headerId);
                var html = this.getHeaderHtml(componentConfig);
                $header.html(html);
                var value = {
                    time : data.time,
                    orderNo : data.orderNo,
                    type : data.type,
                }
                var showData = this.getHeaderShowData(value, componentConfig);
                var vueObj = new Vue({
                    el:'#' + headerId,
                    data:{
                        data : value,
                        showData : showData,
                        ischecked: true, //预约勾选
                    },
                    watch : {
                        data : function(newData, oldValue){
                            this.showData = _this.getHeaderShowData(newData, componentConfig);
                        }
                    },
                    methods:{
                        //体检登记  单位个人切换
                        btnCutaways: function () {
                            var _this = this;
                            _this.isbtnCutaways = 0
                        },
                        btnCutawaysBack: function () {
                            var _this = this;
                            _this.isbtnCutaways = 1
                        },
                        //体检登记 预约勾选
                        btnChecked: function () {
                            var _this = this;
                            console.log(_this);
                            if (_this.ischecked) {
                                _this.ischecked = false;
                            } else {
                                _this.ischecked = true;
                            }
                        },
                    }
                })
                componentConfig.headerVueObj = vueObj;
            },
            // 初始化表单
            initForm : function(componentConfig, data, config){
                var formConfig = {
                    id: componentConfig.bodyId,
                    defaultComponentWidth: "33%",
                    isSetMore: false,
                    form : componentConfig.field,
                }
                NetstarComponent.formComponent.show(formConfig, data);
            },
            // 初始化
            init : function(componentConfig, config){
                console.log(componentConfig);
                var id = componentConfig.id;
                var headerId = id + '-header';
                var bodyId = id + '-body';
                // 添加容器
                var html = '<div class="pt-panel-header" id="'+ headerId +'"></div>'
                            + '<div id="'+ bodyId +'"></div>'
                var $container = $('#' + id);
                componentConfig.headerId = headerId;
                componentConfig.bodyId = bodyId;
                $container.html(html);
                // 数据
                var data = typeof(config.serverData) == "object" ? config.serverData : {};
                // 初始化header
                this.initHeader(componentConfig, data);
                // 初始化表单
                this.initForm(componentConfig, data)
            }
        },
        // 项目信息
        project : {
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
            // 初始化
            init : function(componentConfig, config){
                
            }
        },
        // 费用信息
        cost : {
            // 获取数据
            getData : function(componentConfig, isValid, config){
                var vueObj = componentConfig.vueObj;
                var originalRows = vueObj.originalRows;
                return originalRows;
            },
            // 设置数据
            setData : function(data, componentConfig, config){
                var vueObj = componentConfig.vueObj;
                vueObj.originalRows = data;
            },
            // 清空数据
            clearData : function(componentConfig, config){
                var vueObj = componentConfig.vueObj;
                vueObj.originalRows = [];
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            blockList : {
                TEMPLATE : '<div class="price-block" v-for="(row, index) in rows">'
                            + '<div class="price-block-header">'
                                + '<span class="price-type" :class="row[\'NETSTAR-HEADER-CLASS\']">公费</span>'
                                + '<span>20200325354688</span>'
                            + '</div>'
                            + '<div class="price-block-body">'
                                + '<ul>'
                                    + '<li>'
                                        + '<label for="">标准价格：</label>'
                                        + '<span>￥{{row.biaozhun}}</span>'
                                    + '</li>'
                                    + '<li>'
                                        + '<label for="">优惠券：</label>'
                                        + '<span>￥{{row.youhui}}</span>'
                                    + '</li>'
                                    + '<li>'
                                        + '<label for="">实收金额：</label>'
                                        + '<span><b>￥{{row.shishou}}</b></span>'
                                    + '</li>'
                                + '</ul>'
                            + '</div>'
                        + '</div>',
                getRows : function(originalRows){
                    var rows = [];
                    for(var i=0; i<originalRows.length; i++){
                        var originalRow = originalRows[i];
                        var classStr = '';
                        switch(originalRow.type){
                            case 0:
                                classStr = 'price-type-public';
                                break;
                            case 1:
                                classStr = 'price-type-own';
                                break;
                        }
                        var row = {
                            biaozhun : originalRow.biaozhun,
                            youhui : originalRow.youhui,
                            shishou : originalRow.shishou,
                            'NETSTAR-HEADER-CLASS' : classStr,
                        }
                        rows.push(row);
                    }
                    return rows;
                },
                getVueData : function(blockConfig, config){
                    var originalRows = [];
                    if(typeof(config.serverData) == "object" && $.isArray(config.serverData[blockConfig.keyField])){
                        originalRows = config.serverData[blockConfig.keyField];
                    }
                    var rows = this.getRows(originalRows);
                    var data = {
                        originalRows : originalRows,
                        rows : rows,
                    };
                    return data;
                },
                init : function(blockConfig, config){
                    var _this = this;
                    var containerId = blockConfig.id;
                    var $container = $('#' + containerId);
                    $container.append(_this.TEMPLATE);
                    var data = _this.getVueData(blockConfig, config);
                    blockConfig.vueObj = new Vue({
                        el: '#' + containerId,
                        data: data,
                        watch: {
                            originalRows : function(value, oldValue) {
                                this.rows = _this.getRows(value);
                            }
                        },
                        methods: {
                        },
                        mounted: function(){
                        }
                    });
                },
            },
            // 初始化
            init : function(componentConfig, config){
                this.blockList.init(componentConfig, config);
            }
        },
        // 优惠信息
        discount : {
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
            // 初始化
            init : function(componentConfig, config){
                
            }
        },
        // 危害信息
        harm : {
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
        // 个人信息
        getPersonal : function(config){
            var personalConfig = config.componentsByName.personal;
            if(!personalConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ personalConfig.id +'">'
                        + '</div>'
            return html;
        },
        getRegister : function(config){
            var registerConfig = config.componentsByName.register;
            if(!registerConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ registerConfig.id +'">'
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
        getDiscount : function(config){
            var discountConfig = config.componentsByName.discount;
            if(!discountConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ discountConfig.id +'">'
                        + '</div>'
            return html;
        },
        getHarm : function(config){
            var harmConfig = config.componentsByName.harm;
            if(!harmConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ harmConfig.id +'">'
                        + '</div>'
            return html;
        },
        init : function(config){
            // title
            var titleHtml = panelManage.getTitle(config);
            // btns
            var btnsHtml = panelManage.getBtns(config);
            // 个人信息
            var personalHtml = panelManage.getPersonal(config);
            // 登记信息
            var registerHtml = panelManage.getRegister(config);
            // 项目信息
            var projectHtml = panelManage.getProject(config);
            // 费用信息
            var costHtml = panelManage.getCost(config);
            // 优惠信息
            var discountHtml = panelManage.getDiscount(config);
            // 危害信息
            var harmHtml = panelManage.getHarm(config);
            // html
            var templateClassStr = '';
            if(config.plusClass){
                templateClassStr = config.plusClass;
            }
            var html = '<div class="pt-main physicalsreport '+templateClassStr+'" id="'+config.id+'" ns-package="'+config.package+'">'
                            + '<div class="pt-container">'
                                + titleHtml
                                // 按钮
                                + '<div class="pt-main-col">'
                                    // 按钮
                                    + btnsHtml
                                + '</div>'
                                // left
                                + '<div class="pt-main-col">'
                                    // 个人信息
                                    + personalHtml
                                    // 费用信息
                                    + costHtml
                                    // 优惠信息
                                    + discountHtml
                                + '</div>'
                                // center
                                + '<div class="pt-main-col">'
                                    // 登记信息
                                    + registerHtml
                                    // 危害信息
                                    + harmHtml
                                + '</div>'
                                // right
                                + '<div class="pt-main-col">'
                                    // 项目信息
                                    + projectHtml
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