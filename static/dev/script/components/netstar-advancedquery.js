// 高级查询
NetstarComponent.advancedQuery = (function(){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            // if(!$.isArray(config.form) || config.form.length == 0){
            //     nsAlert('高级查询表单配置错误，不能正常显示显示', 'error');
            //     console.error('高级查询表单配置错误，不能正常显示显示');
            //     isPass = false;
            // }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                title: '高级查询',
                getAjax : {},
                delAjax : {},
                saveAjax : {},
                form : [],
                getAjaxData: {},
                saveAjaxData: {},
                delAjaxData: {},
                valueField : 'id',
                textField : 'name',
                nameField : 'name',
                termField : 'content',
                typeField : 'type',
                isHaveOutForm : false,
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            config.dialogId = config.id + '-dialog';
            config.dropdownPanelId = config.id + '-dropdown';
            config.formId = config.id + '-form';
            config.btnsId = config.id + '-btns';
            config.$container = $('#' + config.id);
            if(typeof(nsAdvancedQuery) == "object"){
                var _nsAdvancedQuery = $.extend(true, {}, nsAdvancedQuery);
                for(var key in _nsAdvancedQuery){
                    if(typeof(_nsAdvancedQuery[key]) == "object"){
                        if(typeof(_nsAdvancedQuery[key].url) == "string"){
                            _nsAdvancedQuery[key].url = getRootPath() + _nsAdvancedQuery[key].url;
                        }
                    }
                }
                for(var key in _nsAdvancedQuery){
                    config[key] = _nsAdvancedQuery[key];
                }
                if(!$.isEmptyObject(config.getAjaxData) && typeof(config.getAjax) == "object"){
                    config.getAjax.data = config.getAjaxData;
                }
                if(!$.isEmptyObject(config.saveAjaxData) && typeof(config.saveAjax) == "object"){
                    config.saveAjax.data = config.saveAjaxData;
                }
                if(!$.isEmptyObject(config.delAjaxData) && typeof(config.delAjax) == "object"){
                    config.delAjax.data = config.delAjaxData;
                }
            }else{
                console.error('没有配置nsAdvancedQuery');
            }
            // 处理form
            var form = config.form;
            // 弹框内的查询条件
            var inForm = [];
            // 弹框外的查询条件
            var outForm = [];
            // 是否有弹框外的查询条件
            var isHaveOutForm = false;
            for(var i=0; i<form.length; i++){
                if(form[i].isAloneQuery){
                    isHaveOutForm = true;
                    outForm.push(form[i]);
                }else{
                    inForm.push(form[i]);
                }
            }
            config.inForm = inForm;
            config.outForm = outForm;
            config.isHaveOutForm = isHaveOutForm;
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
    // dialog
    var dialogManage = {
        configs : {
           query : {
                width: '60%',
                height: "50%",
                title: '高级查询',
                templateName: 'PC',
                plusClass: 'pt-common-query',
           },
           save : {
                width: '50%',
                height: "50%",
                title: '保存筛选条件',
                templateName: 'PC',
                plusClass: 'pt-netstar-advancedquery-save',
           },
        },
        TEMPLATE : {
            query : function(config){
                var html = '<div class="common-query-conditions" id="' + config.queryListId + '"></div>'
                            + '<div class="" id="' + config.queryTermId + '"></div>'
                return html;
            },
            save : function(config){
                var html = '';
                return html;
            },
        },
        // 获取config
        getConfig : function(config, type){
            var dialogConfig = $.extend(true, {}, dialogManage.configs[type]);
            dialogConfig.id = config.dialogId + '-' + type;
            switch(type){
                case 'query':
                    break;
                case 'save':
                    dialogConfig.width = '400px';
                    dialogConfig.height = '250px';
                    break;
            }
            return dialogConfig;
        },
        // 设置config
        setConfig : function(config, type, bodyId){
            switch(type){
                case 'query':
                    config.queryListId = bodyId + '-list';
                    config.queryListRadioId = bodyId + '-list-radio';
                    config.queryTermId = bodyId + '-term';
                    break;
                case 'save':
                    config.saveTermId = bodyId;
                    break;
            }
        },
        // 初始化弹框body中的内容
        initBody : function(config, type, bodyId){
            var template = dialogManage.TEMPLATE[type](config);
            var $dialogBody = $('#' + bodyId);
            $dialogBody.html(template);
            switch(type){
                case 'query':
                    panelManage.queryList.show(config);
                    panelManage.queryForm.show(config);
                    break;
                case 'save':
                    panelManage.saveForm.show(config);
                    break;
            }
        },
        // 初始化弹框footer中的内容
        initFooter : function(config, type, footerId){
            switch(type){
                case 'query':
                    config.queryBtnsId = footerId;
                    panelManage.queryBtns.show(config);
                    break;
                case 'save':
                    config.saveBtnsId = footerId;
                    panelManage.saveBtns.show(config);
                    break;
            }
        },
        // 显示
        show : function(config, type){
            type = type ? type : 'query';
            var dialogConfig = dialogManage.getConfig(config, type);
            dialogConfig.shownHandler = function(data){
                var dialogBodyId = data.config.bodyId;
                var footerIdGroup = data.config.footerIdGroup;
                dialogManage.setConfig(config, type, dialogBodyId);
                dialogManage.initBody(config, type, dialogBodyId);
                dialogManage.initFooter(config, type, footerIdGroup);
            }
            NetstarComponent.dialogComponent.init(dialogConfig);
        },
    }
    // panel
    var panelManage = {
        // 弹框列表
        queryList : {
            TEMPLATE : 
                        // '<ul>'
                        //     + '<li class="" :class="[{active:obj.isActive}]" v-for="(obj,index) in list" @click="selectTerm($event,obj,index)">'
                        //         + '<span class="">{{obj[textField]}}</span>'
                        //         + '<div class="pt-btn-group">'
                        //             + '<button class="btn btn-default" @click="deleteTerm($event,obj,index)"><i class="fa-trash"></i></button>'
                        //         + '</div>'
                        //     + '</li>'
                        // + '</ul>'
                        '<div class="pt-radio" :class="{\'no-data\':list.length==0}">'
                            + '<div class="pt-radio-group">'
                                + '<div class="pt-radio-inline" :class="[{selectd:selectValue.indexOf(obj[valueField])>-1}]" v-for="(obj,index) in list">'
                                    + '<input type="radio" class="" :id="obj.fillId" :name="id" v-model="selectValue" :value="obj[valueField]">'
                                    + '<label class="pt-radio-inline left" :for="obj.fillId" :class="[selectValue.indexOf(obj[valueField])>-1?\'checked\':\'\']" @click="selectTerm($event,obj,index)">{{obj[textField]}}</label>'
                                    + '<button class="btn btn-default btn-icon" @click="deleteTerm($event,obj,index)"><i class="icon-trash-o"></i></button>'
                                + '</div>'
                            + '</div>'
                        + '</div>',
            getShowList : function(list, config){
                var queryListRadioId = config.queryListRadioId;
                var _list = $.extend(true, [], list);
                for(var i=0; i<_list.length; i++){
                    _list[i].fillId = queryListRadioId + '-' + i;
                }
                return _list;
            },
            getData : function(config){
                var list = config.list;
                var originalList = $.extend(true, [], list);
                var showList = this.getShowList(originalList, config);
                var selectValue = '';
                if(list.length > 0){
                    selectValue = list[0][config.valueField];
                }
                var data = {
                    textField : config.textField,
                    valueField : config.valueField,
                    selectValue : selectValue,
                    originalList : originalList,
                    list : showList,
                    id : config.queryListRadioId,
                }
                return data;
            },
            show : function(config){
                var _this = this;
                var html = this.TEMPLATE;
                var containerId = config.queryListId;
                var $container = $('#' + containerId);
                $container.html(html);
                var vueData = this.getData(config);
                config.vueListPanel = new Vue({
                    el: '#' + containerId,
                    data: vueData,
                    watch: {
                        originalList : function(value){
                            this.list = _this.getShowList(value, config);
                            if(this.list.length > 0){
                                this.selectValue = this.list[0][config.valueField];
                            }
                        }
                    },
                    methods:{
                        ajax : function(){
                            dataManage.getDataByAjax(config, function(listData, _config){
                                _config.vueListPanel.originalList = $.extend(true, [], listData);
                                _config.list = listData;
                                var queryFormVals = panelManage.queryForm.getValues(_config);
                                NetstarComponent.fillValues(queryFormVals, config.queryTermId, true);
                            })
                        },
                        deleteTerm : function(ev, term, index){
                            ev.stopImmediatePropagation();
                            nsConfirm('确定删除' + term[config.nameField] + '吗？', function(isDel){
                                if(isDel){
                                    dataManage.delDataByAjax(config, term, function(_config){
                                        _config.vueListPanel.ajax();
                                    })
                                }
                            })
                        },
                        selectTerm : function(ev, term, index){
                            var values = term[config.termField];
                            if(typeof(values) == "string"){
                                values = JSON.parse(values);
                            }
                            var queryTermId = config.queryTermId;
                            if(NetstarComponent.config[queryTermId]){
                                NetstarComponent.fillValues(values, queryTermId, true);
                            }
                        },
                        getSelect : function(){
                            var list = this.list;
                            var data = false;
                            var selectValue = this.selectValue;
                            for(var i=0; i<list.length; i++){
                                if(list[i][config.valueField] === selectValue){
                                    data = list[i];
                                    break;
                                }
                            }
                            return data;
                        }
                    },
                    mounted:function(){
                    }
                });
            },
        },
        // 查询表单
        queryForm : {
            getValues : function(config){
                var list = config.list;
                var values = {};
                if(list.length > 0){
                    values = list[0][config.termField];
                    if(typeof(values) == "string"){
                        values = JSON.parse(values);
                    }
                }
                return values;
            },
            show : function(config){
                var values = this.getValues(config);
                var formConfig = {
                    id : config.queryTermId,
                    defaultComponentWidth : '50%',
                    form : config.inForm,
                }
                NetstarComponent.formComponent.show(formConfig, values);
            },
        },
        // 按钮
        queryBtns : {
            TEMPLATE : '<div class="pt-btn-group">'
                            + '<button class="pt-btn pt-btn-default" ns-type="new"><span>新建查询条件</span></button>'
                            + '<button class="pt-btn pt-btn-default" ns-type="edit"><span>修改当前查询条件</span></button>'
                            + '<button class="pt-btn pt-btn-default" ns-type="query"><span>查询</span></button>'
                            + '<button class="pt-btn pt-btn-default" ns-type="close"><span>关闭</span></button>'
                            + '<button class="pt-btn pt-btn-default" ns-type="reset"><span>重置</span></button>'
                        + '</div>',
            getTermValues : function(config, isAdd){
                var vueListPanel = config.vueListPanel;
                var selectData = vueListPanel.getSelect();
                var formId = config.queryTermId;
                var values = NetstarComponent.getValues(formId);
                values = JSON.stringify(values);
                var data = {};
                data[config.termField] = values;
                if(!isAdd && selectData){
                    // data[config.valueField] = selectData[config.valueField];
                    // data[config.textField] = selectData[config.textField];
                    // data[config.nameField] = selectData[config.nameField];
                    // data[config.typeField] = selectData[config.typeField];
                    // console.log(selectData);
                    for(var key in selectData){
                        if(typeof(data[key]) == "undefined"){
                            data[key] = selectData[key];
                        }
                    }
                }
                if(typeof(data[config.typeField]) == "undefined"){
                    data[config.typeField] = '2';
                }
                return data;
            },
            setEvent : function($html, config){
                var _this = this;
                var $btns = $html.find('button');
                $btns.off('click');
                $btns.on('click', function(ev){
                    var $this = $(this);
                    var nsType = $this.attr('ns-type');
                    switch(nsType){
                        case 'new':
                            var termValues = _this.getTermValues(config, true);
                            config.termValuesData = termValues;
                            dialogManage.show(config, 'save');
                            break;
                        case 'edit':
                            var termValues = _this.getTermValues(config, false);
                            config.termValuesData = termValues;
                            dialogManage.show(config, 'save');
                            break;
                        case 'query':
                            var formId = config.queryTermId;
                            var values = NetstarComponent.getValues(formId);
                            var queryVals = funcManage.getValues(values, config);
                            config.value = queryVals;
                            if(typeof(config.queryHandler) == 'function'){
                                config.queryHandler(queryVals, config);
                            }
                            NetstarComponent.dialog[config.dialogId + '-query'].vueConfig.close();
                            break;
                        case 'close':
                            NetstarComponent.dialog[config.dialogId + '-query'].vueConfig.close();
                            break;
                        case 'reset':
                            var formId = config.queryTermId;
                            NetstarComponent.clearValues(formId, false);
                            break;
                    }
                });
            },
            show : function(config){
                var _this = this;
                var html = this.TEMPLATE;
                var containerId = config.queryBtnsId;
                var $container = $('#' + containerId);
                var $html = $(html);
                this.setEvent($html, config);
                $container.html($html);
            },
        },
        // 查询条件名称表单
        saveForm : {
            getValues : function(config){
                var values = config.termValuesData;
                return values;
            },
            show : function(config){
                var values = this.getValues(config);
                var formConfig = {
                    id : config.saveTermId,
                    isSetMore : false,
                    defaultComponentWidth:'100%',
                    form : [
                        {
                            id : config.nameField,
                            label : '名称',
                            type : 'text',
                            rules : 'required maxlength=20',
                        },{
                            id : config.typeField,
                            label : '公有',
                            type : 'radio',
                            rules : 'required',
                            subdata : [
                                { text : '是', value : '1' },
                                { text : '否', value : '2' },
                            ]
                        }
                    ],
                }
                NetstarComponent.formComponent.show(formConfig, values);
            },
        },
        // 查询条件名称弹框按钮
        saveBtns : {
            TEMPLATE : '<div class="pt-btn-group">'
                            + '<button class="pt-btn pt-btn-default" ns-type="save"><span>保存</span></button>'
                            + '<button class="pt-btn pt-btn-default" ns-type="close"><span>取消</span></button>'
                        + '</div>',
            getSaveData : function(config){
                var formId = config.saveTermId;
                var values = NetstarComponent.getValues(formId);
                if(values){
                    var data = config.termValuesData ? config.termValuesData : {};
                    for(var key in values){
                        data[key] = values[key];
                    }
                    return data;
                }else{
                    return false;
                }
            },
            setEvent : function($html, config){
                var _this = this;
                var $btns = $html.find('button');
                $btns.off('click');
                $btns.on('click', function(ev){
                    var $this = $(this);
                    var nsType = $this.attr('ns-type');
                    switch(nsType){
                        case 'save':
                            var saveData = _this.getSaveData(config);
                            if(saveData){
                                dataManage.saveDataByAjax(config, saveData, function(data, _config){
                                    NetstarComponent.dialog[_config.dialogId + '-save'].vueConfig.close();
                                    var vueListPanel = config.vueListPanel;
                                    vueListPanel.ajax();
                                })
                            }
                            break;
                        case 'close':
                            NetstarComponent.dialog[config.dialogId + '-save'].vueConfig.close();
                            break;
                    }
                });
            },
            show : function(config){
                var _this = this;
                var html = this.TEMPLATE;
                var containerId = config.saveBtnsId;
                var $container = $('#' + containerId);
                var $html = $(html);
                this.setEvent($html, config);
                $container.html($html);
            },
        },
        // 初始化按钮/显示在外侧的条件
        btnsAndForm : {
            getHtml : function(config){
                var html = '<div class="pt-search-pro">'
                                + '<div class="pt-search-pro-form" id="'+ config.formId +'"></div>'
                                + '<div class="pt-search-pro-btn" id="'+ config.btnsId +'"></div>'
                            + '</div>'
                return html;
            },
            getOutForm : function(config){
                var resForm = [];
                var outForm = config.outForm;
                for(var i=0; i<outForm.length; i++){
                    var component = $.extend(true, {}, outForm[i]);
                    component.label = '';
                    component.isStartToChange = false;
                    component.changeHandler = function(obj){
                        var values = config.value;
                        var queryVals = funcManage.getValues(values, config);
                        config.value = queryVals;
                        if(typeof(config.queryHandler) == 'function'){
                            config.queryHandler(queryVals, config);
                        }
                    }
                    resForm.push(component);
                }
                return resForm;
            },
            showForm : function(config){
                var form = panelManage.btnsAndForm.getOutForm(config);
                var formConfig = {
                    id : config.formId,
                    isSetMore : false,
                    defaultComponentWidth:'100%',
                    formStyle: 'pt-form-normal',
                    form : form,
                }
                NetstarComponent.formComponent.show(formConfig);
            },
            show : function(config){
                var html = this.getHtml(config);
                var $container = config.$container;
                $container.html(html);
                var $formContainer = $('#' + config.formId);
                var $btnContainer = $('#' + config.btnsId);
                config.$formContainer = $formContainer;
                config.$btnContainer = $btnContainer;
                // 显示表单
                if(config.isHaveOutForm){
                    panelManage.btnsAndForm.showForm(config);
                }
                // 显示按钮
                panelManage.btns.show(config);
            },
        },
        // 初始化按钮
        btns : {
            // 获取html
            getHtml : function(config){
                var html = '<div class="pt-btn-dropdown pt-btn-dropdown-senior pt-btn">'
                                + '<div class="pt-btn-group pt-btn-group-compact">'
                                    + '<button class="pt-btn pt-btn-default" @click="dialog"><span>高级查询</span></button>'
                                    + '<button class="pt-btn pt-btn-default pt-btn-icon" @click="triggerDropdown" :id="dropdownBtnId"><i class="icon-arrow-down-o"></i></button>'
                                + '</div>'
                                + '<div class="pt-btn-dropdown-panel" :class="[{hide:!isShow},{\'no-data\':list.length==0}]" :id="dropdownId">'
                                    + '<div class="pt-btn-group">'
                                        + '<button class="pt-btn pt-btn-default" v-for="(obj,index) in list" @click="selectTerm($event,obj,index)"><span>{{obj[textField]}}</span></button>'
                                    + '</div>'
                                + '</div>'
                            + '</div>'
                return html;
            },
            getData : function(config){
                var data = {
                    list : [],
                    textField : 'name',
                    isShow : false,
                    dropdownId : config.id + '-dropdown-panel',
                    dropdownBtnId : config.id + '-dropdown-btn',
                }
                return data;
            },
            // 显示
            show : function(config){
                var html = this.getHtml(config);
                var $container = config.$btnContainer;
                // var $html = $(html);
                // this.setEvent($html, config);
                $container.html(html);
                var vueData = this.getData(config);
                config.vueBtnsPanel = new Vue({
                    el: '#' + config.id,
                    data: vueData,
                    watch: {
                        isShow : function(value){
                            var __this = this;
                            if(!value){
                                $(document).off('click', __this.documentClose);
                            }else{
                                // 添加点击任意位置关闭
                                var obj = {
                                    relId : __this.dropdownBtnId,
                                    containerId : __this.dropdownId,
                                    parentName : '#' + config.id,
                                    func : function(){
                                        __this.close();
                                    }
                                }
                                $(document).on('click', obj, __this.documentClose);
                            }
                        }
                    },
                    methods:{
                        ajax : function(){
                            dataManage.getDataByAjax(config, function(listData, _config){
                                _config.vueBtnsPanel.list = $.extend(true, [], listData);
                                _config.list = listData;
                                _config.vueBtnsPanel.open();
                            })
                        },
                        close : function(){
                            this.isShow = false;
                        },
                        open : function(){
                            this.isShow = true;
                        },
                        dialog : function(ev){
                            this.close();
                            dataManage.getDataByAjax(config, function(listData, _config){
                                _config.list = listData;
                                dialogManage.show(_config, 'query');
                            })
                        },
                        triggerDropdown : function(ev){
                            if(!this.isShow){
                                this.ajax();
                            }else{
                                this.isShow = false;
                            }
                        },
                        selectTerm : function(ev, term, index){
                            this.close();
                            var values = term[config.termField];
                            if(typeof(values) == "string"){
                                values = JSON.parse(values);
                            }
                            var queryVals = funcManage.getValues(values, config);
                            config.value = queryVals;
                            if(typeof(config.queryHandler) == 'function'){
                                config.queryHandler(queryVals, config);
                            }
                        },
                        documentClose : function(ev){
                            NetstarComponent.commonFunc.clickAnyWhereToFunc(ev);
                        },
                    },
                    mounted:function(){
                        var __this = this;
                        // 添加点击任意位置关闭
                        var obj = {
                            relId : __this.dropdownBtnId,
                            containerId : __this.dropdownId,
                            parentName : '#' + config.id,
                            func : function(){
                                __this.close();
                            }
                        }
                        $(document).on('click', obj, __this.documentClose);
                    }
                });
            },
        },
    }
    // 数据
    var dataManage = {
        getDataByAjax : function(config, callBackFunc){
            var getAjax = $.extend(true, {}, config.getAjax);
            getAjax.plusData = {
                configId : config.id,
                callBackFunc : callBackFunc,
            }
            NetStarUtils.ajax(getAjax, function(data, _ajaxConfig){
                var plusData = _ajaxConfig.plusData;
                var _config = configManage.getConfig(plusData.configId);
                if(data.success){
                    var list = data[_config.getAjax.dataSrc];
                    if(typeof(plusData.callBackFunc) == "function"){
                        plusData.callBackFunc(list, _config);
                    }
                }
            });
        },
        saveDataByAjax : function(config, saveData, callBackFunc){
            var saveAjax = $.extend(true, {}, config.saveAjax);
            saveAjax.plusData = {
                configId : config.id,
                callBackFunc : callBackFunc,
            }
            saveAjax.data = typeof(saveAjax.data) == "object" ? saveAjax.data : {};
            saveAjax.data = $.extend(true, saveAjax.data, saveData);
            saveAjax.data.objectState = 1;
            if(saveAjax.data[config.valueField]){
                saveAjax.data.objectState = 2;
            }
            NetStarUtils.ajax(saveAjax, function(data, _ajaxConfig){
                var plusData = _ajaxConfig.plusData;
                var _config = configManage.getConfig(plusData.configId);
                if(data.success){
                    if(typeof(plusData.callBackFunc) == "function"){
                        plusData.callBackFunc(data, _config);
                    }
                }
            });
        },
        delDataByAjax : function(config, delTerm, callBackFunc){
            var delAjax = $.extend(true, {}, config.delAjax);
            delAjax.plusData = {
                configId : config.id,
                callBackFunc : callBackFunc,
            }
            delAjax.data = typeof(delAjax.data) == "object" ? delAjax.data : {};
            delAjax.data[config.valueField] = delTerm[config.valueField];
            NetStarUtils.ajax(delAjax, function(data, _ajaxConfig){
                var plusData = _ajaxConfig.plusData;
                var _config = configManage.getConfig(plusData.configId);
                if(data.success){
                    nsAlert('删除成功');
                    if(typeof(plusData.callBackFunc) == "function"){
                        plusData.callBackFunc(_config);
                    }
                }else{
                    nsAlert('删除失败');
                }
            });
        },
    }
    // 方法 
    var funcManage = {
        getValues : function(values, config){
            var resVals = values;
            if(config.isHaveOutForm){
                var formId = config.formId;
                var outVals = NetstarComponent.getValues(formId, false);
                resVals = $.extend(true, values, outVals);
            }
            return resVals;
        }
    }
    // 
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
        panelManage.btnsAndForm.show(config);
    }
    return {
        configs : configs,
        init : init,
    }
})(jQuery)