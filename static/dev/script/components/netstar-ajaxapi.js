/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-10-18 14:20:50
 * @LastEditTime: 2019-10-20 22:22:55
 * @LastEditors: Please set LastEditors
 */
var NetstarConfigPanel = {}
NetstarConfigPanel.ajaxApi = (function($){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
            }
            if(isPass){
                if($('#' + config.id).length == 0){
                    isPass = false;
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                filterIsReadonly : false,
                treeTextField : 'text',
                treeValueField : 'value',
                treeEditorField : 'url',
                treeOutputFields : {},
                treeChildren :     'children',     // 树数据子级名
                treeParentId :     'parentId',     // 树数据pId
                data : {},
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            config.$container = $('#' + config.id);
            // 需要的id
            // 数据原配置容器id
            config.idManage = {
                dataSourceId : config.id + '-datasource',
                dataSourceFormId : config.id + '-datasource-form',
                filterId : config.id + '-filter',
                filterFormId : config.id + '-filter-form',
                previewId : config.id + '-preview',
                previewFormId : config.id + '-preview-form',
            };
            if(typeof(config.data) == "object" && typeof(config.data.data) == "object"){
                config.data.data = JSON.stringify(config.data.data);
            }
        },
        // 获取
        getConfig : function(id){
            var _configs = configs[id];
            if(_configs){
                return _configs.config;
            }else{
                return false;
            }
        },
    }
    // 数据源管理
    var dataSourceManage = {
        // 获取表单字段配置
        getFormFieldsConfig : function(config, values){
            var datasourceTypeVal = 'static';
            if(values && values.datasourceType == "api"){
                datasourceTypeVal = "api";
            }
            // 数据源类型
            var dataSourceType = {
                id : 'datasourceType',
                label : '数据源类型',
                type : 'select',
                value : datasourceTypeVal,
                rules : 'required',
                subdata : [
                    { text : '静态数据', value : 'static' },
                    { text : 'API', value : 'api' },
                ],
                changeHandlerData : {
                    api : {
                        hidden : {
                            staticdata : true,
                            url : false,
                            type : false,
                            data : false,
                            dataSrc : false,
                            contentType : false,
                            isUseGetRootPath : false,
                        }
                    },
                    static : {
                        hidden : {
                            staticdata : false,
                            url : true,
                            type : true,
                            data : true,
                            dataSrc : true,
                            contentType : true,
                            isUseGetRootPath : true,
                        }
                    },
                    nsRestoreDefaultObj : {
                        hidden : {
                            staticdata : false,
                            url : true,
                            type : true,
                            data : true,
                            dataSrc : true,
                            contentType : true,
                            isUseGetRootPath : true,
                        }
                    },
                },
                changeHandler : function(obj){
                    var value = obj.value;
                    var editArr = [
                        {
                            id : 'staticdata',
                            rules : 'required',
                        },{
                            id : 'url',
                            rules : '',
                        }
                    ];
                    switch(value){
                        case 'api':
                            editArr[0].rules = '';
                            editArr[1].rules = 'required';
                            break;
                        default:
                            break;
                    }
                    NetstarComponent.editComponents(editArr, config.idManage.dataSourceFormId);
                },
            }
            // 静态数据配置
            var staticdata = {
                id : 'staticdata',
                label : '',
                type : 'textarea',
                inputHeight : 300,
                isHasClose : true,
                btns : [
                    {
                        name : '配置',
                        handler : function(obj){
                            var comValue = obj.vueComponent.getValue(false);
                            var value = [];
                            if(comValue){
                                try {
                                    value = JSON.parse(comValue);
                                    if(!$.isArray(value)){
                                        value = [];
                                    }
                                }catch(error) {
                                    nsAlert('editConfig配置错误','error');
                                    console.error('editConfig配置错误');
                                    console.error(error);
                                    console.error(value);
                                }
                            }
                            var listConfig = {
                                id : config.id + '-api-staticdata',
                                value : value,
                                confirmHandler : function(data, _listConfig){
                                    if(!data){
                                        nsAlert('保存数据失败，请检查配置', 'error');
                                        console.error('保存数据失败，请检查配置');
                                        return true;
                                    }
                                    if($.isEmptyObject(data)){
                                        nsAlert('没有要保存的数据', 'warning');
                                        console.error('没有要保存的数据');
                                        return true;
                                    }
                                    var str = JSON.stringify(data);
                                    obj.vueComponent.setValue(str);
                                    NetstarComponent.dialog[_listConfig.id].vueConfig.close();
                                }
                            }
                            NetstarConfigPanel.list.init(listConfig);
                        },
                    }
                ]
            }
            // 地址
            var url = {
                id : 'url',
                label : '地址',
                type : 'treeInput',
                editorField : config.treeEditorField,
                textField : config.treeTextField,
                valueField : config.treeValueField,
                outputFields : config.treeOutputFields,
                children :          config.treeChildren,     // 树数据子级名
                parentId :          config.treeParentId,     // 树数据pId
                subdata : config.apiData,
            }
            // 所以字段配置
            var fieldsConfig = [
                dataSourceType,staticdata,url,
                {
                    id : 'data',
                    label : '传参',
                    type : 'textarea',
                    value : '{}',
                },
                {
                    id : 'dataSrc',
                    label : '出参',
                    type : 'selectInput',
                    subdata : [
                        { text : "rows", value : "rows" },
                        { text : "data", value : "data" },
                    ]
                },
                {
                    id : 'type',
                    label : '发送方式',
                    type : 'radio',
                    value : 'POST',
                    subdata : [
                        { text : 'POST', value : 'POST' },
                        { text : 'GET', value : 'GET' },
                    ],
                },
                {
                    id : 'contentType',
                    label : '传参类型',
                    type : 'select',
                    value : 'application/json',
                    subdata : [
                        { text : 'application/x-www-form-urlencoded', value : 'application/x-www-form-urlencoded' },
                        { text : 'application/json', value : 'application/json' },
                    ]
                },
                {
                    id : 'isUseGetRootPath',
                    label : '使用getRootPath',
                    type : 'radio',
                    value : 'true',
                    subdata : [
                        { text : 'true', value : 'true' },
                        { text : 'false', value : 'false' },
                    ],
                },
            ]
            return fieldsConfig;
        },
        // 获取表单配置
        getFormConfig : function(config, values){
            // 字段配置
            var formFieldsConfig = this.getFormFieldsConfig(config, values);
            var formConfig = {
                id : config.idManage.dataSourceFormId,
                isSetMore : false,
                defaultComponentWidth : '100%',
                form : formFieldsConfig,
            }
            return formConfig;
        },
        // 显示
        show : function(config){
            var formConfig = this.getFormConfig(config, config.data);
            NetstarComponent.formComponent.show(formConfig, config.data);
        } 
    }
    // 数据过滤
    var filterManage = {
        // 获取表单字段配置
        getFormFieldsConfig : function(config){
            // 所以字段配置
            var fieldsConfig = [
                {
                    id : 'filterType',
                    label : '',
                    type : 'radio',
                    subdata : [
                        { text : '方法', value : 'func' },
                        { text : '表达式', value : 'expression' },
                    ],
                    changeHandler : function(obj){
                        var edit = {
                            id : 'filterData',
                            disabled : true,
                            rules : ''
                        }
                        if(obj.value !== ''){
                            edit.disabled = false;
                            edit.rules = 'required';
                        }
                        NetstarComponent.editComponents([edit], config.idManage.filterFormId);
                    }
                },
                {
                    id : 'filterData',
                    label : '',
                    type : 'textarea',
                }
            ]
            return fieldsConfig;
        },
        // 获取表单配置
        getFormConfig : function(config){
            // 字段配置
            var formFieldsConfig = this.getFormFieldsConfig(config);
            var formConfig = {
                id : config.idManage.filterFormId,
                isSetMore : false,
                defaultComponentWidth : '100%',
                form : formFieldsConfig,
            }
            return formConfig;
        },
        refreshByReadonly : function(readonly, config){
            var idManage = config.idManage;
            var filterFormId = idManage.filterFormId;
            config.filterIsReadonly = readonly;
            if(readonly){
                NetstarComponent.clearValues(filterFormId, true);
                NetstarComponent.setFormDisabled(filterFormId);
            }else{
                NetstarComponent.cancelFormDisabled(filterFormId);
            }
        },
        // 显示
        show : function(config){
            var formConfig = this.getFormConfig(config);
            NetstarComponent.formComponent.show(formConfig, config.data);
        }  
    }
    // 预览管理
    var previewManage = {
        // 获取表单字段配置
        getFormFieldsConfig : function(config){
            // 所以字段配置
            var fieldsConfig = [
                {
                    id : 'previewData',
                    label : '',
                    type : 'textarea',
                }
            ]
            return fieldsConfig;
        },
        // 获取表单配置
        getFormConfig : function(config){
            // 字段配置
            var formFieldsConfig = this.getFormFieldsConfig(config);
            var formConfig = {
                id : config.idManage.previewFormId,
                isSetMore : false,
                defaultComponentWidth : '100%',
                form : formFieldsConfig,
            }
            return formConfig;
        },
        // 获取静态预览数据
        getPreviewDataByVal : function(data, plusConfig, callBackFunc){
            if(!data){
                callBackFunc('', plusConfig)
                return false;
            }
            function filterDataFunc(resData, _data, _callBackFunc, _plusData){
                var _resData = resData
                switch(_data.filterType){
                    case 'expression':
                        var filterData = JSON.parse(_data.filterData);
                        _resData = NetStarUtils.getFormatParameterJSON(filterData, resData);
                        break;
                    case 'func':
                        var filterData = 'funcname=' + _data.filterData;
                        var funcname = eval(filterData);
                        _resData = funcname(_resData);
                        break;
                }
                if(typeof(_callBackFunc) == "function"){
                   _callBackFunc(JSON.stringify(_resData), _plusData)
                }
            }
            switch(data.datasourceType){
                case 'static':
                    var resData = JSON.parse(data.staticdata);
                    filterDataFunc(resData, data, callBackFunc, plusConfig)
                    break;
                case 'api':
                    var ajaxConfig = $.extend(true, {}, data);
                    ajaxConfig.plusData = {
                        plusConfig : plusConfig,
                        data : data,
                        callBackFunc : filterDataFunc,
                        setData : callBackFunc,
                    }
                    if(ajaxConfig.isUseGetRootPath){
                        ajaxConfig.url = getRootPath() + ajaxConfig.url;
                    }
                    NetStarUtils.ajax(ajaxConfig, function(resData, _ajaxConfig){
                        var plusData = _ajaxConfig.plusData;
                        // var _config = configManage.getConfig(plusData.id);
                        var _data = plusData.data;
                        var dataSrc = _data.dataSrc;
                        if(resData){
                            if(typeof(resData[dataSrc]) == "undefined"){
                                nsAlert('返回参数错误', 'error');
                                console.error('返回参数错误');
                                console.error(resData);
                                // console.error(_config);
                                resData = {};
                            }else{
                                resData = resData[dataSrc];
                            }
                            if(typeof(plusData.callBackFunc) == "function"){
                                plusData.callBackFunc(resData, _data, plusData.setData, plusData.plusConfig);
                            }
                        }
                    })
                    break;
            }
        },
        // 刷新
        refresh : function(config){
            var data = dataManage.getData(config);
            this.getPreviewDataByVal(data, {id : config.id }, function(resData, plusData){
                var _config = configManage.getConfig(plusData.id);
                var previewFormId = _config.idManage.previewFormId;
                var values = {
                    previewData : resData,
                }
                NetstarComponent.fillValues(values, previewFormId);
            });
            return;
            if(!data){
                var previewFormId = config.idManage.previewFormId;
                var values = {
                    previewData : '',
                }
                NetstarComponent.fillValues(values, previewFormId);
                return false;
            }
            function filterDataFunc(resData, _data, _config){
                var _resData = resData
                switch(_data.filterType){
                    case 'expression':
                        var filterData = JSON.parse(_data.filterData);
                        _resData = NetStarUtils.getFormatParameterJSON(filterData, resData);
                        break;
                    case 'func':
                        var filterData = 'funcname=' + _data.filterData;
                        var funcname = eval(filterData);
                        _resData = funcname(_resData);
                        break;
                }
                var previewFormId = _config.idManage.previewFormId;
                var values = {
                    previewData : JSON.stringify(_resData),
                }
                NetstarComponent.fillValues(values, previewFormId);
            }
            switch(data.datasourceType){
                case 'static':
                    var resData = JSON.parse(data.staticdata);
                    filterDataFunc(resData, data, config)
                    break;
                case 'api':
                    var ajaxConfig = $.extend(true, {}, data);
                    ajaxConfig.plusData = {
                        id : config.id,
                        data : data,
                        callBackFunc : filterDataFunc
                    }
                    if(ajaxConfig.isUseGetRootPath){
                        ajaxConfig.url = getRootPath() + ajaxConfig.url;
                    }
                    NetStarUtils.ajax(ajaxConfig, function(resData, _ajaxConfig){
                        var plusData = _ajaxConfig.plusData;
                        var _config = configManage.getConfig(plusData.id);
                        var _data = plusData.data;
                        var dataSrc = _data.dataSrc;
                        if(resData){
                            if(typeof(resData[dataSrc]) == "undefined"){
                                nsAlert('返回参数错误', 'error');
                                console.error('返回参数错误');
                                console.error(resData);
                                console.error(_config);
                                resData = {};
                            }else{
                                resData = resData[dataSrc];
                            }
                            if(typeof(plusData.callBackFunc) == "function"){
                                plusData.callBackFunc(resData, _data, _config);
                            }
                        }
                    })
                    break;
            }
        },
        // 显示
        show : function(config){
            var formConfig = this.getFormConfig(config);
            NetstarComponent.formComponent.show(formConfig);
        }  
    }
    // 数据管理
    var dataManage = {
        // 设置数据源数据
        setDataSourceData : function(){},
        // 设置数据过滤数据
        setFilterData : function(){},
        // 设置预览数据
        setPreviewData : function(){},
        // 设置数据
        setData : function(){},
        // 获取数据源数据
        getDataSourceData : function(dataSourceFormId, config){
            var data = NetstarComponent.getValues(dataSourceFormId);
            if(data){
                var _data = {};
                switch(data.datasourceType){
                    case 'static':
                        _data.datasourceType = data.datasourceType;
                        _data.staticdata = data.staticdata;
                        try {
                            JSON.parse(_data.staticdata);
                        } catch (error) {
                            _data = false;
                            nsAlert('静态数据配置错误，请检查静态数据是否是标准的JSON格式','error');
                            console.error('静态数据配置错误，请检查静态数据是否是标准的JSON格式');
                            console.error(error);
                            console.error(config);
                        }
                        break;
                    case 'api':
                        _data.datasourceType = data.datasourceType;
                        _data.url = data.url;
                        _data.type = data.type;
                        _data.data = data.data;
                        _data.dataSrc = data.dataSrc;
                        _data.contentType = data.contentType;
                        _data.isUseGetRootPath = data.isUseGetRootPath == "false" ? false : true;
                        try {
                            _data.data = _data.data === '' ? '' : JSON.parse(_data.data);
                        } catch (error) {
                            _data = false;
                            nsAlert('入参配置错误，请检查入参是否是标准的JSON格式','error');
                            console.error('入参配置错误，请检查入参是否是标准的JSON格式');
                            console.error(error);
                            console.error(config);
                        }
                        break;
                }
                data = _data;
            }
            return data;
        },
        // 获取数据过滤数据
        getFilterData : function(filterFormId, config){
            var data = NetstarComponent.getValues(filterFormId);
            // 判断过滤器是否只读 只读状态直接保存 没有过滤条件
            if(config.filterIsReadonly){
                return data;
            }
            // 验证数据是否合法
            switch(data.filterType){
                case 'expression':
                    // 表达式
                    try{
                        JSON.parse(data.filterData);
                    }catch(error){
                        nsAlert('过滤器表达式配置错误，请检查是否是标准的JSON格式', 'error');
                        console.error('过滤器表达式配置错误，请检查是否是标准的JSON格式');
                        console.error(config);
                        data = false;
                    }
                    break;
                case 'func':
                    // 表达式
                    try{
                        var filterDataStr = 'funcname=' + data.filterData;
                        var filterFunc = eval(filterDataStr);
                        if(typeof(filterFunc) != "function"){
                            nsAlert('过滤器方法配置错误，请检查是否是一个方法结构', 'error');
                            console.error('过滤器方法配置错误，请检查是否是一个方法结构');
                            console.error(config);
                            data = false;
                        }
                    } catch (error){
                        nsAlert('过滤器方法配置错误，请检查是否是一个方法结构', 'error');
                        console.error('过滤器方法配置错误，请检查是否是一个方法结构');
                        console.error(error);
                        console.error(config);
                        data = false;
                    }
                    break;
            }
            return data;
        },
        // 获取预览数据
        getPreviewData : function(previewFormId, config){
            var data = NetstarComponent.getValues(previewFormId);
            return data;
        },
        // 获取数据
        getData : function(config){
            var sourceData = this.getSourceData(config);
            if(sourceData){
                var data = $.extend(true, sourceData.dataSource, sourceData.filter);
                if(data.datasourceType == "api"){
                    data.src = data.url;
                }
                return data;
            }else{
                return false;
            }
        },
        // 获取原始数据 从面板获取到的数据
        getSourceData : function(config){
            var idManage = config.idManage;
            var dataSourceFormId = idManage.dataSourceFormId;
            var filterFormId = idManage.filterFormId;
            var previewFormId = idManage.previewFormId;
            var dataSourceData = this.getDataSourceData(dataSourceFormId, config);
            var filterData = this.getFilterData(filterFormId, config);
            var previewData = this.getPreviewData(previewFormId, config);
            if(dataSourceData && filterData && previewData){
                return {
                    dataSource : dataSourceData,
                    filter : filterData,
                    preview : previewData,
                }
            }
            return false;
        },
    }
    // 面板布局管理
    var panelManage = {
        getHtml : function(config){
            var html =  '<div class="pt-modal-form">'
                            + '<div class="pt-modal-form-block" id="' + config.idManage.dataSourceId + '">'
                                + '<div class="pt-modal-form-block-header">'
                                    + '<span class="title">数据源<span>'
                                            + '</div>'
                                + '<div class="" id="' + config.idManage.dataSourceFormId + '"></div>'
                                + '</div>'
                            + '<div class="pt-modal-form-block" id="' + config.idManage.filterId + '">'
                                + '<div class="pt-modal-form-block-header">'
                                    + '<span class="title checkbox active" ns-name="datafilter-readonly-switch">数据过滤器<span>'
                                            + '</div>'
                                + '<div class="" id="' + config.idManage.filterFormId + '"></div>'
                                + '</div>'
                            + '<div class="pt-modal-form-block" id="' + config.idManage.previewId + '">'
                                + '<div class="pt-modal-form-block-header">'
                                    + '<span class="title">数据响应结果<span>'
                                    + '<div class="pt-btn-group">'
                                            + '<button class="pt-btn pt-btn-default pt-btn-icon" ns-name="refresh-preview"><i class="icon-return"></i></button>'
                                    + '</div>'
                                + '</div>'
                                + '<div class="" id="' + config.idManage.previewFormId + '"></div>'
                            + '</div>'
                        + '</div>';
            return html;
        },
        // 设置事件
        setEvent : function($html, config){
            var idManage = config.idManage;
            var $filter = $html.find('#' + idManage.filterId);
            var $preview = $html.find('#' + idManage.previewId);
            // 设置数据过滤切换事件
            var $switch = $filter.find('[ns-name="datafilter-readonly-switch"]');
            $switch.off('click');
            $switch.on('click', function(ev){
                var $this = $(this);
                if($this.hasClass('active')){
                    // 正在编辑状态 点击只读
                    $this.removeClass('active');
                    filterManage.refreshByReadonly(true, config);
                }else{
                    // 正在只读状态 点击编辑
                    $this.addClass('active');
                    filterManage.refreshByReadonly(false, config);
                }
            });
            // 设置刷新数据响应结果
            var $refresh = $preview.find('[ns-name="refresh-preview"]');
            $refresh.off('click');
            $refresh.on('click', function(ev){
                previewManage.refresh(config);
            });
        },
        show : function(config){
            var html = this.getHtml(config);
            var $html = $(html);
            this.setEvent($html, config);
            var $container = config.$container;
            // 插入容器
            $container.html($html);
            // 显示数据源
            dataSourceManage.show(config);
            // 显示过滤
            filterManage.show(config);
            // 显示预览
            previewManage.show(config);
        },
    }
    function getPreviewDataByVal(data, plusConfig, callBackFunc){
        // 这里的验证是对来自外来的数据验证
        switch(data.datasourceType){
            case "static":
                if(typeof(data.staticdata) !== "string" || data.staticdata === ''){
                    data = false;
                }
                break;
            case "api":
                if(typeof(data.url) !== "string" || data.url === ''){
                    data = false;
                }
                break;
            default:
                data = false;
                break;
        }
        previewManage.getPreviewDataByVal(data, plusConfig, callBackFunc);
    }
    function getData(id){
        var config = configManage.getConfig(id);
        if(config){
            var data = dataManage.getData(config);
            return data;
        }else{
            nsAlert('获取数据失败没有找到config','error');
            console.error('获取数据失败没有找到config');
            console.error(id);
            return false;
        }
    }
    function init(config){
        // 验证配置是否通过
        var isPass = configManage.validConfig(config);
        if(!isPass){
            return isPass;
        }
        // 定义config
        configs[config.id] = {
            source : $.extend(true, {}, config),
            config : config,
        };
        // 设置config
        configManage.setConfig(config);
        panelManage.show(config);
    }
    return {
        show : init,
        init : init,
        getData : getData,
        getPreviewDataByVal : getPreviewDataByVal,
    }
})(jQuery)
NetstarConfigPanel.list = (function(){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
            }
            if(isPass && config.type == "common"){
                if($('#' + config.id).length == 0){
                    isPass = false;
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                type : 'dialog',
                title : '编辑标题',
                columnName : 'subdata',
                value : [],
                gridIdField : 'value',
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            // 列配置
            var columnName = config.columnName;
            var columns = config.columns;
            var isReadColName = false;
            var columnObj = {};
            if(!$.isArray(columns)){
                if(staticManage.columns[columnName]){
                    isReadColName = true;
                    columns = staticManage.columns[columnName];
                }
            }
            if(!$.isArray(columns)){
                columns = [];
            }
            for(var i=0; i<columns.length; i++){
                columnObj[columns[i].field] = columns[i];
            }
            config.isReadColName = isReadColName;
            config.columns = columns;
            config.columnObj = columnObj;
            dataManage.formatValue(config.value, config);

        },
        // 获取
        getConfig : function(id){
            var _configs = configs[id];
            if(_configs){
                return _configs.config;
            }else{
                return false;
            }
        },
    }
    // 静态配置管理
    var staticManage = {
        columns : {
            subdata : [
                {
                    field : 'value',
                    title : '数据',
                    width : 153,
                    editable : true,
                },{
                    field : 'text',
                    title : '显示',
                    width : 153,
                    editable : true,
                },{
                    field : 'isChecked',
                    title : '默认选中',
                    width : 153,
                    variableType : 'boolean',
                    editable : true,
                    columnType : 'subdataText',
                    editConfig : {
                        type : 'radio',
                        valueField : 'value',
                        textField : 'text',
                        subdata : [
                            { value : 'true', text : '是' },
                            { value : 'false', text : '否' },
                        ]
                    }
                },{
                    field : 'isDisabled',
                    title : '只读',
                    width : 153,
                    variableType : 'boolean',
                    editable : true,
                    columnType : 'subdataText',
                    editConfig : {
                        type : 'radio',
                        valueField : 'value',
                        textField : 'text',
                        subdata : [
                            { value : 'true', text : '是' },
                            { value : 'false', text : '否' },
                        ]
                    }
                }
            ]
        }
    }
    // 面板管理
    var panelManage = {
        // 设置common类型面板框架
        setCommonContainer : function(config){
            var ids = config.ids;
            var html = '<div class="" id="' + ids.headId + '">'+ config.title +'</div>'
                        + '<div class="" id="' + ids.bodyId + '"></div>'
                        + '<div class="" id="' + ids.footerId + '"></div>';
            var $container = $('#' + config.id);
            $container.html(html);
        },
        // 初始化表格
        initGrid : function(config){
            var gridId = config.ids.bodyId;
            // 列配置
            var columns = config.columns;
            // ui
            var ui = {
                selectMode : 'none',
                isEditMode : true,
                // height : 220,
                // dragWidth : false,
                // isUseHotkey : false,
                pageLengthDefault : 10,
                isHaveEditDeleteBtn : true,
            };
            var data = {
                dataSource : config.value,
                tableID : gridId,
                idField : config.gridIdField,
            }
            var gridConfig = {
                columns : columns,
                ui : ui,
                data : data,
            }
            NetStarGrid.init(gridConfig);
        },
        // initBtns
        initBtns : function(config){
            var cancelClass = '';
            if(config.type == "common"){
                cancelClass = 'hide';
            }
            var html = '<div class="pt-btn-group">'
                            + '<button class="pt-btn pt-btn-default" ns-name="confirm">确定</button>'
                            + '<button class="pt-btn pt-btn-default '+ cancelClass +'" ns-name="cancel">取消</button>'
                        + '</div>'
            var $footer = $('#' + config.ids.footerId);
            $footer.html(html);
            var $btns = $footer.find('button');
            $btns.off('click');
            $btns.on('click', function(ev){
                var $this = $(this);
                var nsName = $this.attr('ns-name');
                switch(nsName){
                    case 'confirm':
                        var gridId = config.ids.bodyId;
                        var gridData = NetStarGrid.dataManager.getData(gridId);
                        dataManage.formatSaveData(gridData, config);
                        console.log(gridData);
                        if(typeof(config.confirmHandler) == "function"){
                            config.confirmHandler(gridData, config);
                        }
                        break;
                    case 'cancel':
                        NetstarComponent.dialog[config.id].vueConfig.close()
                        break;
                }
            });
        },
        // 初始化
        init : function(config){
            /********表格******/
            panelManage.initGrid(config);
            /********按钮******/
            panelManage.initBtns(config);
        },
        // 设置需要的容器id
        setPanelIds : function(obj, config){
            config.ids = {
                headId : obj.headId,
                bodyId : obj.bodyId,
                footerId : obj.footerIdGroup,
                // tableId : obj.bodyId + '-table',
            }
        },
        // 显示 根据类型
        show : function(config){
            switch(config.type){
                case 'common':
                    var obj = {
                        headId : config.id + '-head',
                        bodyId : config.id + '-body',
                        footerIdGroup : config.id + '-footer',
                    }
                    panelManage.setPanelIds(obj, config);
                    panelManage.setCommonContainer(config);
                    panelManage.init(config);
                    break;
                case 'dialog':
                    var dialogConfig = {
                        id:             config.id,
                        title:          config.title,
                        templateName:   'PC',
                        width :         700,
                        height :        500,
                        shownHandler:   function (data) {
                            panelManage.setPanelIds(data.config, config);
                            panelManage.init(config);
                        },
                    }
                    NetstarComponent.dialogComponent.init(dialogConfig);
                    break;
            }
        },
    }
    // 数据管理
    var dataManage = {
        formatValue : function(value, config){
            var columnObj = config.columnObj;
            for(var i=0; i<value.length; i++){
                for(var key in value[i]){
                    var columnConfig = columnObj[key];
                    switch(columnConfig.variableType){
                        case 'boolean':
                            if(typeof(value[i][key]) == "boolean"){
                                value[i][key] = value[i][key].toString();
                            }
                            break;
                    }
                }
            }
        },
        formatSaveData : function(saveData, config){
            var columnObj = config.columnObj;
            for(var i=0; i<saveData.length; i++){
                for(var key in saveData[i]){
                    var columnConfig = columnObj[key];
                    switch(columnConfig.variableType){
                        case 'boolean':
                            if(saveData[i][key] == "true"){
                                saveData[i][key] = true;
                            }
                            if(saveData[i][key] == "false"){
                                saveData[i][key] = false;
                            }
                            break;
                    }
                }
            }
        },
    }
    function init(config){
        // 验证配置是否通过
        var isPass = configManage.validConfig(config);
        if(!isPass){
            return isPass;
        }
        // 定义config
        configs[config.id] = {
            source : $.extend(true, {}, config),
            config : config,
        };
        // 设置config
        configManage.setConfig(config);
        panelManage.show(config);
    }
    return {
        init : init,
    }
})()
