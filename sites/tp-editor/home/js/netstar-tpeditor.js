// tab面板
NetstarTPEditor.tabPanel = (function(){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
                nsAlert('tab面板配置错误，id必须配置', 'error');
                console.error('tab面板配置错误，id必须配置:', config);
            }
            if(isPass){
                if($('#' + config.id).length == 0){
                    isPass = false;
                    nsAlert('tab面板id配置错误', 'error');
                    console.error('tab面板id配置错误:', config);
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                panelClass : '',
                isDefaultShow : false, // 初始化时默认是否显示
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            config.panelId = config.id + '-tab';
            config.headerId = config.id + '-tab-header';
            config.bodyId = config.id + '-tab-body';
            config.prevId = config.id + '-tab-body-prev';
            config.footerId = config.id + '-tab-footer';
            var showPanelName = '';
            // tab中的id
            var tab = config.tab;
            var tabIds = {};
            for(var i=0; i<tab.length; i++){
                tabIds[tab[i].value] = config.bodyId + '-' + tab[i].value;
                if(tab[i].isSelected){
                    showPanelName = tab[i].value;
                }
            }
            config.showPanelName = showPanelName;
            config.tabPanelIds = tabIds;
            // 显示隐藏
            config.panelIsShow = config.isDefaultShow;
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
    // 面板管理
    var panelManage = {
        // 获取tab页
        getTabTitle : function(config){
            var html = '<ul class="nav">';
            var tabArr = config.tab;
            for(var i=0; i<tabArr.length; i++){
                var classStr = '';
                if(tabArr[i].isSelected){
                    classStr = 'current';
                }
                html += '<li class="nav-item ' + classStr + '" ns-tab-name="'+ tabArr[i].value +'">'
                            + '<a href="#"><span>'+ tabArr[i].text +'</span></a>'
                        + '</li>';
            }
            html += '</ul>';
            return html;
        },
        // 获取面板
        getTabPanel : function(config){
            var html = '';
            var tabArr = config.tab;
            var bodyId = config.bodyId;
            var panelClass = config.panelClass;
            var panelTitle = typeof(config.panelTitle) == "object" ? config.panelTitle : {};
            for(var i=0; i<tabArr.length; i++){
                var titleHtml = '';
                if(panelTitle[tabArr[i].value]){
                    titleHtml = panelTitle[tabArr[i].value];
                }
                var panelClassStr = '';
                if(panelClass[tabArr[i].value]){
                    panelClassStr = panelClass[tabArr[i].value];
                }
                var classStr = '';
                if(tabArr[i].isSelected){
                    classStr = 'current';
                }
                html += '<div class="tabs-content ' + classStr + '"  ns-tab-name="'+ tabArr[i].value +'">'
                            + '<div class="panel">'
                                + '<div class="title">'
                                    + titleHtml
                                + '</div>'
                                + '<div class="'+ panelClassStr +'" id="' + config.tabPanelIds[tabArr[i].value] + '">'
                                + '</div>'
                            + '</div>'
                        + '</div>'
            }
            return html;
        },
        // 获取按钮
        getFooterPanel : function(config){
            var btns = $.isArray(config.btns) ? config.btns : [];
            var html = '';
            for(var i=0; i<btns.length; i++){
                html += '<button class="btn btn-info" ns-btn-index="' + i + '">'
                            + '<span>' + btns[i].text + '</span>'
                        + '</button>'
            }
            if(html.length > 0){
                html = '<div class="btn-group">'
                            + html
                        + '</div>'
            }
            return html;
        },
        // 获取tab页之前的panel
        getTabPrevPanel : function(config){
            var html = '';
            if(!config.ishaveTabPrev){
                return html;
            }
            var prevConfig = config.prevConfig;
            var type = prevConfig.type;
            switch(type){
                case 'btn':
                    var buttonHtml = '';
                    var btns = prevConfig.btns;
                    for(var i=0; i<btns.length; i++){
                        buttonHtml += '<button class="btn btn-info" ns-index="' + i + '">'
                                            + '<span>' + btns[i].text + '</span>'
                                        + '</button>'
                    }
                    html = '<div class="btn-group">'
                                + buttonHtml
                            + '</div>'
                    break;
            }
            return html;
        },
        // 获取面板html
        getHtml : function(config){
            var headerHtml = panelManage.getTabTitle(config);
            var bodyHtml = panelManage.getTabPanel(config);
            var footerHtml = panelManage.getFooterPanel(config);
            var prevHtml = panelManage.getTabPrevPanel(config);
            var prevClass = 'hide';
            if(prevHtml.length > 0){
                prevClass = '';
            }
            var html = '<div class="tabs" id="' + config.panelId + '">'
                            + '<div class="tabs-header" id="' + config.headerId + '">'
                                + headerHtml
                            + '</div>'
                            + '<div class="tabs-prev '+ prevClass +'" id="' + config.prevId + '">'
                                + prevHtml
                            + '</div>'
                            + '<div class="tabs-body" id="' + config.bodyId + '">'
                                + bodyHtml
                            + '</div>'
                            + '<div class="tabs-footer" id="' + config.footerId + '">'
                                + footerHtml
                            + '</div>'
                        + '</div>'
            return html;
        },
        switchTabPanel : function(nsTabName, config, isEvent, plusData){
            var headerId = config.headerId;
            var bodyId = config.bodyId;
            var $body = $('#' + bodyId);
            var $header = $('#' + headerId);
            var $tabPanels = $body.children();
            var $tabTitles = $header.find('li');
            var $this = $header.find('[ns-tab-name="'+ nsTabName +'"]');
            var $thisBody = $body.find('[ns-tab-name="'+ nsTabName +'"]');
            if(config.showPanelName != nsTabName){
                config.prevShowPanelName = config.showPanelName;
            }
            config.showPanelName = nsTabName;
            $tabPanels.removeClass('current');
            $tabTitles.removeClass('current');
            $this.addClass('current');
            $thisBody.addClass('current');
            // 刷新面板数据
            if(typeof(config.switchTabHandler) == "function"){
                var obj = {
                    isEvent : isEvent,
                    name : nsTabName,
                    config : config,
                }
                if(typeof(plusData) == "object"){
                    obj.plusData = plusData;
                }
                config.switchTabHandler(obj);
            }
        },
        // 设置面板事件
        setEvent : function(config){
            var headerId = config.headerId;
            var bodyId = config.bodyId;
            var prevId = config.prevId;
            var footerId = config.footerId;
            var $header = $('#' + headerId);
            var $body = $('#' + bodyId);
            var $prev = $('#' + prevId);
            var $footer = $('#' + footerId);
            var $tabTitles = $header.find('li');
            var $tabPanels = $body.children();
            var $btns = $footer.find('button');
            // tab事件
            $tabTitles.off('click');
            $tabTitles.on('click', function(ev){
                var $this = $(this);
                var nsTabName = $this.attr('ns-tab-name');
                panelManage.switchTabPanel(nsTabName, config, true);
                // if(config.showPanelName != nsTabName){
                //     config.prevShowPanelName = config.showPanelName;
                // }
                // config.showPanelName = nsTabName;
                // $tabPanels.removeClass('current');
                // $tabTitles.removeClass('current');
                // $this.addClass('current');
                // $body.children('[ns-tab-name="'+ nsTabName +'"]').addClass('current');
                // // 刷新面板数据
                // // panelManage.refreshPanel(nsTabName, config);
                // if(typeof(config.switchTabHandler) == "function"){
                //     var obj = {
                //         name : nsTabName,
                //         config : config,
                //     }
                //     config.switchTabHandler(obj);
                // }
            });
            // 帮助事件
            // 按钮事件
            $btns.off('click');
            $btns.on('click', function(ev){
                var $this = $(this);
                var nsIndex = Number($this.attr('ns-btn-index'));
                var btns = config.btns;
                if(typeof(btns[nsIndex].handler) == "function"){
                    btns[nsIndex].handler(config);
                }
            });
            if(config.ishaveTabPrev){
                var prevConfig = config.prevConfig;
                var type = prevConfig.type;
                if(type == "btn"){
                    var $prevBtns = $prev.find('button');
                    $prevBtns.off('click');
                    $prevBtns.on('click', function(ev){
                        var $this = $(this);
                        var nsIndex = Number($this.attr('ns-index'));
                        var btns = prevConfig.btns;
                        if(typeof(btns[nsIndex].handler) == "function"){
                            btns[nsIndex].handler(config);
                        }
                    });
                }
            }
        },
        // 显示面板
        show : function(id){
            var config = configManage.getConfig(id);
            if(!config){
                console.error('没有找到面板配置,id:'+id);
                return false;
            }
            if(!config.panelIsShow){
                config.panelIsShow = true;
                $('#' + id).removeClass('close');
                $('#' + id).addClass('show');
            }
        },
        // 隐藏面板
        hide : function(id){
            var config = configManage.getConfig(id);
            if(!config){
                console.error('没有找到面板配置,id:'+id);
                return false;
            }
            if(config.panelIsShow){
                config.panelIsShow = false;
                $('#' + id).removeClass('show');
                $('#' + id).addClass('close');
            }
        },
        // 初始化
        init : function(config){
            // 获取html
            var html = panelManage.getHtml(config);
            var $html = $(html);
            // 容器
            var $container = $('#' + config.id);
            if(!config.isDefaultShow){
                $container.addClass('close');
            }else{
                $container.addClass('show');
            }
            // 插入容器
            $container.append($html);
            // 设置事件
            panelManage.setEvent(config);
            if(typeof(config.completeHandler) == "function"){
                config.completeHandler(config);
            }
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
        // 
        panelManage.init(config);
    }
    return {
        configs : configs,
        init : init,
        show: panelManage.show,
        hide: panelManage.hide,
        switchTabPanel : panelManage.switchTabPanel,
        getConfig : configManage.getConfig,
    }
})()
// var NetstarTPEditor = {};
// 操作/数据/专业模式/预览模式tab页
NetstarTPEditor.attrPanel = (function(){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
                nsAlert('属性面板配置错误，id必须配置', 'error');
                console.error('属性面板配置错误，id必须配置:', config);
            }
            if(isPass){
                if($('#' + config.id).length == 0){
                    isPass = false;
                    nsAlert('属性面板id配置错误', 'error');
                    console.error('属性面板id配置错误:', config);
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                isDefaultShow : false, // 初始化时默认是否显示
                allAttrs : {},
                otherAttrs : {},
                changeSelectData : [],
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            config.tabPanels = {};
            // 显示隐藏
            config.panelIsShow = config.isDefaultShow;
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
    // 面板管理
    var panelManage = {
        tab : [
            { text : "操作属性", value: "operator", isSelected: true },
            { text : "数值属性", value: "data" },
            { text : "专业模式", value: "major" },
            { text : "预览", value: "preview" },
        ],
        // 初始化表单 通过form :[],formId:'',value:{}
        initForm : function(formArr, formId, value, config){
            // 设置NetstarComponent.ajaxApi组件的方法
            for(var i=0; i<formArr.length; i++){
                if(formArr[i].type == "ajaxApi" || formArr[i].type == "ajaxEditor"){
                    formArr[i].treeTextField = 'chnName';
                    formArr[i].treeValueField = 'id';
                    formArr[i].treeEditorField = 'url';
                    // formArr[i].zIndex = 2001;
                    formArr[i].subdata = $.isArray(NetstarTPEditor.controllerData) ? NetstarTPEditor.controllerData : [];
                    if(typeof(value[formArr[i].id]) == "string" && value[formArr[i].id].length){
                        value[formArr[i].id] = JSON.parse(value[formArr[i].id]);
                    }
                }
                formArr[i].id = formArr[i].id.replace(/\./g, '-');
                if(formArr[i].id == "type" || formArr[i].id == "defaultMode" || formArr[i].id == "columnType"){
                    formArr[i].isStartToChange = false;
                    formArr[i].isChangeJump = false;
                    formArr[i].changeHandler = (function(_config, typeStr){
                        return function(obj){
                            var allAttrs = _config.allAttrs;
                            var valueStr = obj.value;
                            if(typeof(allAttrs[valueStr]) != "object"){
                                console.error('配置有误，该类型不存在配置参数，如需要qq');
                                return true;
                            }
                            var attrsValue = _config.value;
                            attrsValue[typeStr] = valueStr;
                            NetstarTPEditor.attrPanel.set(allAttrs[valueStr].attrArr, attrsValue, _config.id);
                        }
                    })(config, formArr[i].id)
                }
                if(formArr[i].id == "nsStateId"){
                    formArr[i].type = "select";
                    formArr[i].subdata = config.stateSubdata;
                    formArr[i].isStartToChange = false;
                    formArr[i].changeHandler = function(obj){
                        var textStr = obj.text;
                        var editArr = [
                            {
                                id : 'nsStateName',
                                value : textStr,
                            }
                        ]
                        NetstarComponent.editComponents(editArr, obj.config.formID);
                        delete config.value.nsState;
                    }
                }
                if(formArr[i].id == "functionField"){
                    formArr[i].type = "select";
                    formArr[i].subdata = config.stateSubdata;
                }
                if(formArr[i].id == "changeHandlerData"){
                    formArr[i].type = "textarea";
                    formArr[i].isHasClose = true;
                    formArr[i].btns = [
                        {
                            name : '配置',
                            handler : function(obj){
                                var changeData = {};
                                var comValue = obj.vueComponent.getValue(false);
                                if(comValue){
                                    try {
                                        changeData = JSON.parse(comValue);
                                        if(typeof(changeData) != "object"){
                                            changeData = {};
                                        }
                                    }catch(error) {
                                        nsAlert('changeHandlerData配置错误','error');
                                        console.error('changeHandlerData配置错误');
                                        console.error(error);
                                        console.error(comValue);
                                    }
                                }
                                var changeConfig = {
                                    id : obj.component.id,
                                    component : obj.component,
                                    vueComponent : obj.vueComponent,
                                    data : changeData,
                                    changeSelectData : config.changeSelectData,
                                    confirmHandler : function(data, _changeConfig){
                                        var str = '';
                                        if(typeof(data) == "object"){
                                            str = JSON.stringify(data);
                                        }
                                        obj.vueComponent.setValue(str);
                                    }
                                }
                                NetstarTPEditor.changeHandlerData.init(changeConfig);
                            },
                        }
                    ];
                }
                if(formArr[i].id == "editConfig"){
                    formArr[i].type = "textarea";
                    formArr[i].isHasClose = true;
                    formArr[i].btns = [
                        {
                            name : '配置',
                            handler : function(obj){
                                var otherAttrs = config.otherAttrs;
                                if($.isEmptyObject(otherAttrs)){
                                    console.error('配置缺失');
                                    nsAlert('配置缺失', 'warning');
                                    return;
                                }
                                var formAttrs = otherAttrs.types.form;
                                if(typeof(formAttrs) == "undefined" || $.isEmptyObject(formAttrs)){
                                    console.error('配置缺失');
                                    nsAlert('配置缺失', 'warning');
                                    return;
                                }
                                var textAttrConfig = $.extend(true, {}, formAttrs.text.attrArr);
                                var editConfig = {};
                                var comValue = obj.vueComponent.getValue(false);
                                if(comValue){
                                    try {
                                        editConfig = JSON.parse(comValue);
                                        if(typeof(editConfig) != "object"){
                                            editConfig = {};
                                        }
                                    }catch(error) {
                                        nsAlert('editConfig配置错误','error');
                                        console.error('editConfig配置错误');
                                        console.error(error);
                                        console.error(comValue);
                                    }
                                }
                                if(typeof(editConfig.type) == "string" && typeof(formAttrs[editConfig.type]) == "object"){
                                    textAttrConfig = $.extend(true, {}, formAttrs[editConfig.type].attrArr);
                                }
                                var dialogId = obj.component.id + '-form-dialog';
                                var dialogText = obj.component.label;
                                var dialogConfig = {
                                    id : dialogId,
                                    title : dialogText,
                                    defaultFooterHeight : 20,
                                    width : '60%',
                                    height : '80%',
                                    shownHandler : function(dialogObj){
                                        var objConfig = dialogObj.config;
                                        var bodyId = objConfig.bodyId;
                                        var footerIdGroup = objConfig.footerIdGroup;
                                        var attrConfig = {
                                            id : bodyId,
                                            attrs : textAttrConfig,
                                            allAttrs : formAttrs,
                                            value : editConfig,
                                            isDefaultShow : true,
                                            formatAttrs : function(attrs){
                                                for(var i=0; i<attrs.operator.length; i++){
                                                    if(attrs.operator[i].id == "id"){
                                                        attrs.operator[i].rules = '';
                                                        attrs.operator[i].hidden = true;
                                                        break;
                                                    }
                                                }
                                            },
                                            confirmHandler : function(value){
                                                if(!value){
                                                    nsAlert('保存数据失败，请检查配置', 'error');
                                                    console.error('保存数据失败，请检查配置');
                                                    return true;
                                                }
                                                if($.isEmptyObject(value)){
                                                    nsAlert('没有要保存的数据', 'warning');
                                                    console.error('没有要保存的数据');
                                                    return true;
                                                }
                                                console.log(value);
                                                var str = JSON.stringify(value);
                                                obj.vueComponent.setValue(str);
                                                NetstarComponent.dialog[dialogId].vueConfig.close()
                                            }
                                        }
                                        NetstarTPEditor.attrPanel.init(attrConfig);
                                    }
                                }
                                NetstarComponent.dialogComponent.init(dialogConfig);
                            },
                        }
                    ];
                }
                // 通过配置changeHandlerVals 参数改变value值
                /**
                 * changeHandlerVals : {"submit" : {text : "ddd",},"submit" : {text : "ddd",}}
                 */
                if(typeof(formArr[i].changeHandlerVals) == "object" && !$.isEmptyObject(formArr[i].changeHandlerVals)){
                    formArr[i].tabPanelIds = config.tabPanelIds;
                    formArr[i].commonChangeHandler = function(obj){
                        var componentConfig = obj.config;
                        var value = obj.value;
                        var changeHandlerVals = componentConfig.changeHandlerVals;
                        var changeVal = changeHandlerVals[value];
                        if(typeof(changeVal) == "object"){
                            if(componentConfig.tabPanelIds.operator){
                                NetstarComponent.fillValues(changeVal, componentConfig.tabPanelIds.operator);
                            }
                            if(componentConfig.tabPanelIds.data){
                                NetstarComponent.fillValues(changeVal, componentConfig.tabPanelIds.data);
                            }
                        }
                    }
                }
            }
            var formConfig = {
                id : formId,
                form : formArr,
                isSetMore : false,
                defaultComponentWidth : '100%',
            }
            // 判断是否已经存在该面板 删除
            if($('#'+formId).children().length > 0){
                $('#'+formId).children().remove();
                var $container = $('container');
                if($container.length > 0){
                    var $selecPanel = $container.children('.pt-select-panel');
                    if($selecPanel.length > 0){
                        $selecPanel.remove();
                    }
                }
            }
            NetstarComponent.formComponent.show(formConfig, value);
        },
        // 设置数组(即表单字段)
        setFormFields : function(formArr, config){
            // 为数组(即表单字段添加change事件)
            for(var i=0; i<formArr.length; i++){
            }
        },
        refreshPanel : function(panelName, config){
            if(typeof(config.tabPanels[panelName]) != "object"){
                // 面板为空 不用刷新面板
                console.warn(panelName+'面板不存在');
                console.warn(config);
                return false;
            }
            var prevShowPanelName = config.prevShowPanelName;
            var isVal = false;
            switch(prevShowPanelName){
                case 'operator':
                case 'data':
                    isVal = true;
                    var value = dataManage.getValueByType('attrs', config, false);
                    // panelManage.setMValue(value, config);
                    // panelManage.setODValue(value, config);
                    config.value = value;
                    break;
                case 'major':
                    isVal = true;
                    var value = dataManage.getValueByType('model', config, false);
                    // panelManage.setMValue(value, config);
                    // panelManage.setODValue(value, config);
                    config.value = value;
                    break;
            }
            if(!isVal){ return; }
            switch(panelName){
                case 'operator':
                case 'data':
                    panelManage.setODValue(value, config);
                    break;
                case 'major':
                    panelManage.setMValue(value, config);
                    break;
            }
        },
        // 显示面板
        show : function(id){
            NetstarTPEditor.tabPanel.show(id);
        },
        // 隐藏面板
        hide : function(id){
            NetstarTPEditor.tabPanel.hide(id);
        },
        // 设置面板
        set : function(_attrs, value, id, allAttrs, setConfigAttrs){
            var config = configManage.getConfig(id);
            if(!config){
                console.error('没有找到面板配置,id:'+id);
                return false;
            }
            // 存在value初始化专业模式 ，不存在按照{}初始化
            var value = typeof(value) == "object" ? value : {};
            // 操作属性
            var operatorAttrs = [];
            // 数值属性
            var dataAttrs = [];
            // 存在属性配置初始化操作属性/数值属性 面板
            if(typeof(_attrs) == "object"){
                var attrs = $.extend(true, {}, _attrs);
                if(typeof(config.formatAttrs) == "function"){
                    config.formatAttrs(attrs);
                }
                operatorAttrs = $.isArray(attrs.operator) ? attrs.operator : [];
                dataAttrs = $.isArray(attrs.data) ? attrs.data : [];
                config.attrs = attrs;
            }
            // 设置allAttrs
            if(typeof(allAttrs) == "object"){
                config.allAttrs = allAttrs;
            }
            // 设置setConfigAttrs
            if(typeof(setConfigAttrs) == "object"){
                for(var key in setConfigAttrs){
                    config[key] = setConfigAttrs[key];
                }
            }
            var isSet = false;
            // 操作属性面板
            if(operatorAttrs.length > 0){
                var operatorConfig = {
                    name : 'operator',
                    attrs : operatorAttrs,
                    config : config,
                    value : value,
                }
                isSet = true;
                panelManage.initPanel(operatorConfig);
            }
            // 数值属性面板
            if(dataAttrs.length > 0){
                var dataConfig = {
                    name : 'data',
                    attrs : dataAttrs,
                    config : config,
                    value : value,
                }
                isSet = true;
                panelManage.initPanel(dataConfig);
            }
            // 专业模式面板
            if(isSet){
                var tabConfig = NetstarTPEditor.tabPanel.getConfig(config.id);
                var $container = $('#' + tabConfig.id);
                var conHeight = $container.height();
                var $header = $('#' + tabConfig.headerId);
                var $footer = $('#' + tabConfig.footerId);
                var majorHeight = conHeight - $header.height() - $footer.height() - 30;

                var formArr = [
                    {
                        id : "majorvalue",
                        label: '',
                        type: 'expressionEditor',
                        inputHeight:majorHeight,
                        changeHandler : function(obj){
                        }
                    }
                ]
                var majorValue = {
                    majorvalue : JSON.stringify(value, null, 4),
                }
                var majorConfig = {
                    name : 'major',
                    attrs : formArr,
                    config : config,
                    value : majorValue,
                }
                panelManage.initPanel(majorConfig);
            }
            config.isSet = isSet;
            config.sourceValue = $.extend(true, {}, value);
            config.value = value;
        },
        // 用于changeHandlerData
        setChangeSelectData : function(fields, id){
            var config = configManage.getConfig(id);
            if(!config){
                console.error('没有找到面板配置,id:'+id);
                return false;
            }
            config.changeSelectData = fields;
        },
        // 清空面板配置
        clearSet : function(id){
            var config = configManage.getConfig(id);
            if(!config){
                console.error('没有找到面板配置,id:'+id);
                return false;
            }
            delete config.tabPanels.operator;
            delete config.tabPanels.data;
            delete config.tabPanels.major;
            var tabPanelIds = config.tabPanelIds; // 面板id
            $('#' + tabPanelIds.operator).children().remove();
            $('#' + tabPanelIds.data).children().remove();
            $('#' + tabPanelIds.major).children().remove();
            panelManage.set({}, {}, id)
        },
        // 初始化面板通过面板配置
        initPanel : function(panelConfig){
            var name = panelConfig.name;        // 面板名字
            var attrs = panelConfig.attrs;      // 面板属性
            var config = panelConfig.config;    // 整体配置
            var initVal = panelConfig.value;    // 整体配置
            var panelId = config.tabPanelIds[name]; // 面板id
            // 数据 id : '{id}'
            var panelData = dataManage.getPanelDataByArr(attrs);
            // 字段配置 id : {}
            var fields = dataManage.getPanelFieldsConfigByArr(attrs);
            config.tabPanels[name] = {
                id : panelId,
                attrs : attrs,
                fields : fields,
                format : panelData,
            }
            var value = dataManage.getPanelValueByValue(initVal, name, config);
            // 删除空值
            // for(){}
            panelManage.initForm(attrs, panelId, value, config);
        },
        // 设置 操作属性面板/数值属性面板 通过value
        setODValue : function(value, config){
            // 操作属性面板
            var operatorConfig = config.tabPanels.operator;
            var operatorPanelId = operatorConfig.id;
            var operatorValue = dataManage.getPanelValueByValue(value, 'operator', config);
            NetstarComponent.fillValues(operatorValue, operatorPanelId);
            // 数值属性面板
            var dataConfig = config.tabPanels.data;
            if(dataConfig){
                var dataPanelId = dataConfig.id;
                var dataValue = dataManage.getPanelValueByValue(value, 'data', config);
                NetstarComponent.fillValues(dataValue, dataPanelId);
            }
        },
        // 设置 专业模式面板 通过value
        setMValue : function(value, config){
            var majorId = config.tabPanelIds.major;
            var majorValue = {
                majorvalue : JSON.stringify(value, null, 4),
            }
            NetstarComponent.fillValues(majorValue, majorId);
        },
        // 初始化
        init : function(config){
            // 关闭
            var btnHtml = '<div class="btn-group">'
                                + '<button class="btn btn-icon btn-close">'
                                    + '<i class="icon-close"></i>'
                                + '</button>'
                            + '</div>'
            // 容器
            var $container = $('#' + config.id);
            var $btnGroup = $(btnHtml);
            var $btn = $btnGroup.find('button');
            $btn.off('click');
            $btn.on('click', function(ev){
                if(typeof(config.closeHandler) == "function"){
                    config.closeHandler();
                }
            });
            $container.append($btnGroup);
            // tab面板初始化
            var tabConfig = {
                id : config.id,
                tab : panelManage.tab,
                isDefaultShow : config.isDefaultShow,
                panelTitle : {
                    operator : '<i class="fa-question-circle"></i>',
                },
                btns : [
                    {
                        text : '确认',
                        handler : function(tabConfig){
                            var value = dataManage.get(config.id);
                            if(typeof(config.confirmHandler) == "function"){
                                config.confirmHandler(value, config);
                            }
                        }
                    }
                ],
                completeHandler : function(tabConfig){
                    config.showPanelName = tabConfig.showPanelName;
                    config.tabPanelIds = tabConfig.tabPanelIds;
                    panelManage.set(config.attrs, config.value, config.id);
                },
                switchTabHandler : function(obj){
                    if(config.showPanelName != obj.name){
                        config.prevShowPanelName = config.showPanelName;
                    }
                    config.showPanelName = obj.name;
                    panelManage.refreshPanel(obj.name, config);
                },
            }
            NetstarTPEditor.tabPanel.init(tabConfig);
        }
    }
    // 数据管理
    var dataManage = {
        // 设置字段value值
        setFieldValue : function(config){
            // 当前value值
            var currentValue = config.value;
            var fieldId = config.id;
            var fieldValue = config.fieldValue;
            var fieldConfig = config.fieldConfig;
            function run(obj, arr, index){
                if(index == arr.length - 1){
                    var isDelete = false;
                    // 通过字段配置转化value
                    var variableType = fieldConfig.variableType;
                    switch(variableType){
                        case 'object':
                            if(fieldValue === ''){
                                isDelete = true;
                                break;
                            }
                            fieldValue = typeof(fieldValue) == "string" ? JSON.parse(fieldValue) : fieldValue;
                            break;
                        case 'boolean':
                            // if(fieldValue == "true"){
                            //     fieldValue = true;
                            // }else{
                            //     if(fieldValue == "false"){
                            //         fieldValue = false;
                            //     }else{
                            //         isDelete = true;
                            //     }
                            // }
                            switch(fieldValue){
                                case 1:
                                case '1':
                                    fieldValue = true;
                                    break;
                                case '':
                                    fieldValue = false;
                                    break;
                            }
                            break;
                        default:  
                            break;
                    }
                    if(isDelete){
                        delete obj[arr[index]];
                        return false;
                    }
                    obj[arr[index]] = fieldValue;
                }else{
                    if(typeof(obj[arr[index]]) != "object"){
                        obj[arr[index]] = {};
                    }
                    run(obj[arr[index]], arr, index + 1)
                }
            }
            // 操作属性/数值属性
            var fieldIdArr = fieldId.split('-');
            run(currentValue, fieldIdArr, 0);
        },
        // 设置面板value
        setPanelValue : function(panelName, value, config, isValidate){
            isValidate = typeof(isValidate) == "boolean" ? isValidate : true;
            var tabPanel = config.tabPanels[panelName];
            if(typeof(tabPanel) != "object"){
                return false;
            }
            var fields = tabPanel.fields;
            var panelId = tabPanel.id;
            var panelValue = NetstarComponent.getValues(panelId, isValidate);
            if(panelValue == false){
                return false;
            }
            for(var fieldId in panelValue){
                var _fieldId = fieldId.replace(/\-/g, '.');
                var fieldConfig = fields[fieldId];
                if(typeof(fieldConfig) == "undefined"){
                    fieldConfig = fields[_fieldId];
                }
                var obj = {
                    id : fieldId,
                    fieldValue : panelValue[fieldId],
                    fieldConfig : fieldConfig,
                    value : value,
                };
                dataManage.setFieldValue(obj);
            }
            return value;
        },
        // 获取value通过面板
        getValueByType : function(type, config, isValidate){
            isValidate = typeof(isValidate) == "boolean" ? isValidate : true;
            var currentValue = config.value;
            var value = currentValue;
            switch(type){
                case 'attrs':
                    // 操作属性/数值属性
                    value = dataManage.setPanelValue('operator', currentValue, config, isValidate);
                    if(!value){ break; }
                    if($.isArray(config.attrs.data) && config.attrs.data.length > 0){
                        value = dataManage.setPanelValue('data', currentValue, config, isValidate);
                    }
                    break;
                case 'model':
                    var majorId = config.tabPanels.major.id;
                    var panelValue = NetstarComponent.getValues(majorId, isValidate);
                    var valueData = JSON.parse(panelValue.majorvalue);
                    value = valueData;
                    break;
            }
            return value;
        },
        // 通过专业模式数据获取面板value
        getPanelValueByValue : function(inValue, panelName, config){
            var tabPanel = config.tabPanels[panelName];
            var fields = tabPanel.fields;
            var format = tabPanel.format;
            var _inValue = $.extend(true, {}, inValue);
            var _value = NetStarUtils.getFormatParameterJSON(format, _inValue, false);
            var value = dataManage.getFormatPanelValue(_value, fields);
            // 如果
            return value;
        },
        // 格式化value通过字段配置  value指面板赋值   variableType判断面板数据转换
        getFormatPanelValue : function(value, fields){
            var panelValue = {};
            for(var fieldId in value){
                if(value[fieldId] === null){
                    // panelValue[fieldId] = '';
                    continue;
                }
                // switch(fieldId){
                //     case 'saveData':
                //     case 'getValueAjax':
                //         if(typeof(value[fieldId]) == "object" && typeof(value[fieldId].data) == "object"){
                //             value[fieldId].data = JSON.stringify(value[fieldId].data);
                //         }
                //         break;
                // }
                var fieldConfig = fields[fieldId];
                var variableType = fieldConfig.variableType;
                switch(variableType){
                    case 'object':
                        // if(fieldId != 'getValueAjax' && fieldId != 'saveData'){
                        //     panelValue[fieldId] = JSON.stringify(value[fieldId]);
                        // }else{
                        //     panelValue[fieldId] = value[fieldId];
                        // }
                        if(fieldConfig.type == "ajaxEditor"){
                            if(typeof(value[fieldId]) == "object" && typeof(value[fieldId].data) == "object"){
                                // value[fieldId].data = JSON.stringify(value[fieldId].data);
                            }
                            panelValue[fieldId] = value[fieldId];
                        }else{
                            panelValue[fieldId] = JSON.stringify(value[fieldId]);
                        }
                        break;
                    case 'boolean':
                        var _value = '';
                        if(value[fieldId] === true){
                            _value = 1;
                        }
                        panelValue[fieldId] = _value;
                        break;
                    default:
                        panelValue[fieldId] = value[fieldId];
                        break;
                }
            }
            return panelValue;
        },
        // 获取面板字段配置
        getPanelFieldsConfigByArr : function(arr){
            var fields = {};
            for(var i=0; i<arr.length; i++){
                fields[arr[i].id.replace(/\./g, '-')] = arr[i];
            }
            return fields;
        },
        // 获取面板数据通过数组
        getPanelDataByArr : function(arr){
            var value = {};
            for(var i=0; i<arr.length; i++){
                value[arr[i].id.replace(/\./g, '-')] = '{' + arr[i].id.replace(/\-/g, '.') + '}';
            }
            return value;
        },
        // 获取面板数据
        get : function(id){
            var config = configManage.getConfig(id);
            if(!config){
                console.error('没有找到面板配置,id:'+id);
                return false;
            }
            var value = {};
            if(!config.isSet){
                return value;
            }
            var type = 'attrs';
            if(config.showPanelName == 'major'){
                type = 'model';
            }else{
                if(config.showPanelName == 'preview'){
                    if(config.prevShowPanelName == 'major'){
                        type = 'model';
                    }
                }
            }
            value = dataManage.getValueByType(type, config);
            // 删除空属性 空对象
            for(var key in value){
                if(value[key] === ''){
                    delete value[key];
                    continue;
                }
                if(typeof(value[key]) == 'object' && $.isEmptyObject(value[key])){
                    delete value[key];
                    continue;
                }
            }
            return value;
        },
    }
    // 通用方法管理
    var commonManage = {}
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
        // 
        panelManage.init(config);
    }
    return {
        configs : configs,
        init : init,
        clearSet : panelManage.clearSet,
        set : panelManage.set,
        show: panelManage.show,
        hide: panelManage.hide,
        getConfig : configManage.getConfig,
        setChangeSelectData : panelManage.setChangeSelectData,
    }
})()
// 添加/已添加/数据源 tab页
NetstarTPEditor.componentListPanel = (function(){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
                nsAlert('组件列表面板配置错误，id必须配置', 'error');
                console.error('组件列表面板配置错误，id必须配置:', config);
            }
            if(isPass){
                if($('#' + config.id).length == 0){
                    isPass = false;
                    nsAlert('组件列表面板id配置错误', 'error');
                    console.error('组件列表面板id配置错误:', config);
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                isDefaultShow : false, // 初始化时默认是否显示
                // showComponentName : 'list-1', // panel btns form grid
                showComponentName : 'panel', // panel btns form grid
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            // tab中的id
            config.tabPanels = {};
            // 显示隐藏
            config.panelIsShow = config.isDefaultShow;
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
    // 面板管理
    var panelManage = {
        tab : [
            { text : "添加", value: "add", isSelected: true },
            { text : "已添加", value: "added" },
            { text : "数据源", value: "datasource" },
        ],
        // 初始化表单 通过form :[],formId:'',value:{}
        initForm : function(formArr, formId, value){
            var formConfig = {
                id : formId,
                form : formArr,
                isSetMore : false,
                defaultComponentWidth : '100%',
            }
            // 判断是否已经存在该面板 删除
            if($('#'+formId).children().length > 0){
                $('#'+formId).children().remove();
            }
            NetstarComponent.formComponent.show(formConfig, value);
        },
        // 设置数组(即表单字段)
        setFormFields : function(formArr, config){
            // 为数组(即表单字段添加change事件)
            for(var i=0; i<formArr.length; i++){
            }
        },
        refreshPanel : function(panelName, config){
            if(typeof(config.tabPanels[panelName]) != "object"){
                // 面板为空 不用刷新面板
                console.warn(panelName+'面板不存在');
                console.warn(config);
                return false;
            }
        },
        // 显示面板
        show : function(id){
            NetstarTPEditor.tabPanel.show(id);
        },
        // 隐藏面板
        hide : function(id){
            NetstarTPEditor.tabPanel.hide(id);
        },
        // 设置面板
        set : function(attrs, value, id){
            var config = configManage.getConfig(id);
            if(!config){
                console.error('没有找到面板配置,id:'+id);
                return false;
            }
            // 判断属性配置是否存在如果不存在面板设置错误
            if(typeof(attrs) != "object"){
                console.error('属性值配置错误');
                return false;
            }
            if(typeof(value) != "object" || $.isEmptyObject(value)){
                return false;
            }
            // 存在value初始化专业模式 ，不存在按照{}初始化
            var value = typeof(value) == "object" ? value : {};
            value.types = typeof(value.types) == "object" ? value.types : {};
            value.typeArr = typeof(value.typeArr) == "object" ? value.typeArr : {};
            // 初始化添加面板
            config.attrs = attrs;
            config.value = value;
            var panelConfig = {
                name : config.showPanelName,
                config : config,
            }
            panelManage.initPanel(panelConfig);
        },
        // 获取添加面板的html
        getAddHtml(attrArr, config){
            var html = '';
            for(var i=0; i<attrArr.length; i++){
                var attr = attrArr[i];
                html += '<li class="nav-item" ns-name="' + attr.name + '" ns-component-type="' + attr.componentType + '">' 
                            + '<a href="javascript:void(0);">'
                                + '<i></i>'
                                + '<span ns-en-name="' + attr.enName + '">' + attr.chnName + '</span>'
                            + '</a>'
                        + '</li>'
            }
            html = '<ul>'
                        + html
                    + '</ul>'
            return html;
        },
        // 获取已添加html
        getAddedHtml : function(valArr, config){
            var html = '';
            for(var i=0; i<valArr.length; i++){
                var val = valArr[i];
                var classStr = '';
                if(val.isEditing){
                    classStr = 'current';
                }
                html += '<li class="list-item ' + classStr + '" draggable="true" ns-name="' + val.name + '" ns-component-type="' + val.componentType + '" ns-panel-type="' + val.panelType + '" ns-index="' + val.index + '">' 
                            + '<div class="list-content">'
                                + '<div class="text">'
                                    + '<span>' + val.chnName + '</span>'
                                    + '<span>' + val.enName + '</span>'
                                + '</div>'
                            + '</div>'
                            + '<div class="list-after">' 
                                + '<div class="list-type-mark">'
                                    + '<i class="fa-font"></i>'
                                + '</div>'
                                + '<div class="btn-group">'
                                    + '<button class="btn btn-default btn-icon" ns-name="delete">'
                                        + '<i class="fa fa-trash"></i>'
                                    + '</button>'
                                + '</div>'
                            + '</div>'
                        + '</li>'
            }
            html = '<div class="list-body">'
                        +'<ul class="row">'
                            + html
                        + '</ul>'
                    + '</div>'
            return html;
        },
        getDatasourceListHtml : function(list, config){
            var html = '';
            for(var i=0; i<list.length; i++){
                var val = list[i];
                html += '<li class="list-item" ns-id="' + val.id + '" ns-index="' + i + '">' 
                            + '<div class="list-content">'
                                + '<div class="text">'
                                    + '<span>' + (val.chnName ? val.chnName : '') + '</span>'
                                    + '<span>' + (val.enName ? val.enName : '') + '</span>'
                                + '</div>'
                            + '</div>'
                            + '<div class="list-after">'
                                + '<div class="btn-group">'
                                    + '<button class="btn btn-default btn-icon" ns-name="add">'
                                        + '<i class="icon icon-add"></i>'
                                    + '</button>'
                                + '</div>'
                            + '</div>'
                        + '</li>'
            }
            html = '<div class="list-body">'
                        +'<ul class="row">'
                            + html
                        + '</ul>'
                    + '</div>'
            return html;
        },
        initDatasourceListPanel : function(list, panelId, config){
            var html = panelManage.getDatasourceListHtml(list, config);
            var $container = $('#' + panelId);
            $container.html(html);
            // 添加列表点击事件
            var $lis = $container.find('li');
            $lis.off('click');
            $lis.on('click', function(ev){
                var $this = $(this);
                var nsIndex = Number($this.attr('ns-index'));
                // var operatorDatasourceVo = config.operatorDatasourceVo;
                var operatorDatasourceList = config.operatorDatasourceList;
                var operatorDatasourceType = config.operatorDatasourceType;
                // var datasourceVal = operatorDatasourceVo.children[nsIndex];
                var datasourceVal = operatorDatasourceList[nsIndex];
                var attrsByType = config.attrs.types[operatorDatasourceType];
                var type = '';
                var value = {};
                switch(operatorDatasourceType){
                    case 'btns':
                        type = 'custom';
                        value.englishName = datasourceVal.enName;
                        value.chineseName = datasourceVal.chnName;
                        value.text = datasourceVal.chnName;
                        value.defaultMode = type;
                        break;
                    case 'grid':
                        type = 'grid';
                        value.englishName = datasourceVal.enName;
                        value.chineseName = datasourceVal.chnName;
                        value.title = datasourceVal.chnName;
                        value.field = datasourceVal.enName;
                        value.componentType = type;
                        value.nsSource = datasourceVal.original;
                        break;
                    case 'form':
                        type = 'text';
                        value.englishName = datasourceVal.enName;
                        value.chineseName = datasourceVal.chnName;
                        value.id = datasourceVal.enName;
                        value.label = datasourceVal.chnName;
                        value.type = type;
                        value.nsSource = datasourceVal.original;
                        break;
                }
                var attr = $.extend(true, {}, attrsByType[type]);
                attr.value = value;
                // 设置点击参数
                var showComponentName = config.showComponentName;
                var showPanelName = config.showPanelName;
                var selectConfig = {
                    componentName : showComponentName,
                    panelName : showPanelName,
                    attr : attr,
                    index : -2,
                };
                config.selectConfig = selectConfig;
                if(typeof(config.clickNodeHandler) == "function"){
                    config.clickNodeHandler(attr, config);
                }
            });
            // 添加添加事件
            var $add = $lis.children('.list-after').find('button');
            $add.off('click');
            $add.on('click', function(ev){
                ev.stopImmediatePropagation(); // 阻止列表点击事件
                var $this = $(this);
                var $li = $this.closest('li');
                var nsIndex = Number($li.attr('ns-index'));
                var nsName = $this.attr('ns-name');
                var operatorDatasourceList = config.operatorDatasourceList;
                var operatorDatasourceType = config.operatorDatasourceType;
                var datasourceVal = operatorDatasourceList[nsIndex];
                var attrsByType = config.attrs.types[operatorDatasourceType];
                var type = '';
                var value = {};
                switch(operatorDatasourceType){
                    case 'btns':
                        type = 'custom';
                        value.englishName = datasourceVal.enName;
                        value.chineseName = datasourceVal.chnName;
                        value.text = datasourceVal.chnName;
                        value.defaultMode = type;
                        break;
                    case 'grid':
                        type = 'grid';
                        value.englishName = datasourceVal.enName;
                        value.chineseName = datasourceVal.chnName;
                        value.title = datasourceVal.chnName;
                        value.field = datasourceVal.enName;
                        value.componentType = type;
                        value.nsSource = datasourceVal.original;
                        break;
                    case 'form':
                        type = 'text';
                        value.englishName = datasourceVal.enName;
                        value.chineseName = datasourceVal.chnName;
                        value.id = datasourceVal.enName;
                        value.label = datasourceVal.chnName;
                        value.type = type;
                        value.nsSource = datasourceVal.original;
                        break;
                }
                var attr = $.extend(true, {}, attrsByType[type]);
                attr.value = value;
                switch(nsName){
                    case 'add':
                        if(typeof(config.addNodeHandler) == "function"){
                            config.addNodeHandler(attr, config);
                        }
                        break;
                }
            });
        },
        // 获取数据源
        initDatasourcePanel : function(config){
            var panelId = config.tabPanelIds.datasource;
            var controllersData = NetstarTPEditor.controllersData;
            var showComponentName = config.showComponentName; // 当前显示组件名字 panel,form,grid,btns
            var values = config.value;
            var panelConfig = values.types.panel[showComponentName];
            // var panelIndex = panelConfig.index;
            var childrenType = panelConfig.childrenType; // btns grid form
            // showAttrs = values.types[childrenType][panelIndex];
            // showAttrArr = values.typeArr[childrenType][panelIndex];
            var datasourceTreeId = panelId + '-tree';
            var datasourceTreePanelId = panelId + '-tree-panel';
            var html = '<div class="" id="' + datasourceTreeId + '"></div>'
                        + '<div class="list list-normal" id="' + datasourceTreePanelId + '"></div>';
            $('#' + panelId).html(html);
            var formConfig = {
                id : datasourceTreeId,
                isSetMore : false,
                defaultComponentWidth : '100%',
                form : [
                    {
                        id : 'vo',
                        label : '',
                        type : 'select',
                        subdata : [],
                        textField : 'chnName',
                        valueField : 'id',
                        placeholder : 'vo选择',
                        isStartToChange : false,
                        changeHandler : function(obj){
                            var value = obj.value;
                            if(value){
                                var valueObj = {};
                                var comConfig = obj.config;
                                var valueField = comConfig.valueField;
                                var subdata = controllersData[comConfig.controllersDataName];
                                for(var i=0; i<subdata.length; i++){
                                    if(subdata[i][valueField] == value){
                                        valueObj = subdata[i];
                                        break;
                                    }
                                }
                                var listData = valueObj.children;
                                config.operatorDatasourceVo = valueObj;
                                var name = NetstarComponent.getValues(datasourceTreeId).name;
                                if(name.length > 0){
                                    listData = dataManage.getDatasourceDataByName(name, listData);
                                }
                                config.operatorDatasourceList = listData;
                                panelManage.initDatasourceListPanel(listData, datasourceTreePanelId, config);
                            }
                        },
                    },{
                        id : 'name',
                        label : "",
                        type : 'text',
                        placeholder : '搜索',
                        isStartToChange : false,
                        changeHandler : function(obj){
                            var value = obj.value;
                            var operatorDatasourceVo = config.operatorDatasourceVo;
                            if(operatorDatasourceVo){
                                var listData = operatorDatasourceVo.children;
                                var list = dataManage.getDatasourceDataByName(value, listData);
                                config.operatorDatasourceList = list;
                                panelManage.initDatasourceListPanel(list, datasourceTreePanelId, config);
                            }
                        }
                    }
                ]
            }
            if(childrenType == 'btns'){
                // formConfig.form[0].subdataList = controllersData.methodListByVo;
                formConfig.form[0].subdata = controllersData.methodVoSubdata;
                formConfig.form[0].controllersDataName = 'methodListByVo';
            }else{
                // formConfig.form[0].subdataList = controllersData.fieldListByVo;
                formConfig.form[0].subdata = controllersData.fieldVoSubdata;
                formConfig.form[0].controllersDataName = 'fieldListByVo';
            }
            config.operatorDatasourceType = childrenType;
            NetstarComponent.formComponent.show(formConfig);
        },
        // 点击面板节点事件方法
        clickNodeEventFunc : function(panelName, nodeName, configId){
            var config = configManage.getConfig(configId);
            if(!config){
                console.error('没有找到面板配置,id:'+configId);
                return false;
            }
            var tabPanel = config.tabPanels[panelName];
            var attrs = tabPanel.attrs;
            var attr = attrs[nodeName];
            if(panelName == "added"){ 
                for(var key in attrs){
                    attrs[key].isEditing = false;
                }
                attr.isEditing = true;
                // 已添加设置选中
                var $container = config.tabPanels[panelName].$container;
                var $li = $container.find('li');
                $li.removeClass('current');
                $li.eq(attr.index).addClass('current');
            }
            // 设置点击参数
            var showComponentName = config.showComponentName;
            var showPanelName = config.showPanelName;
            var selectConfig = {
                componentName : showComponentName,
                panelName : showPanelName,
                attr : attr,
                index : attr.index,
            };
            if(panelName == 'add'){
                selectConfig.index = -1;
            }
            config.selectConfig = selectConfig;
            if(typeof(config.clickNodeHandler) == "function"){
                config.clickNodeHandler(attr, config);
            }
        },
        setPanelEvent : function(panelName, config){
            var $container = config.tabPanels[panelName].$container;
            var $li = $container.find('li');
            $li.off('click');
            $li.on('click', function(ev){
                var $this = $(this);
                var tabPanel = config.tabPanels[panelName];
                var attrs = tabPanel.attrs;
                var nsComponentType = $this.attr('ns-component-type');
                var nsName = $this.attr('ns-name');
                panelManage.clickNodeEventFunc(panelName, nsName, config.id);
                return;
                var attr = attrs[nsName];
                if(panelName == "added"){ 
                    for(var key in attrs){
                        attrs[key].isEditing = false;
                    }
                    attr.isEditing = true;
                }
                // 设置点击参数
                var showComponentName = config.showComponentName;
                var showPanelName = config.showPanelName;
                var selectConfig = {
                    componentName : showComponentName,
                    panelName : showPanelName,
                    attr : attr,
                    index : attr.index,
                };
                if(panelName == 'add'){
                    selectConfig.index = -1;
                }
                config.selectConfig = selectConfig;
                if(typeof(config.clickNodeHandler) == "function"){
                    config.clickNodeHandler(attr, config);
                }
            })
            if(panelName != "added"){ return true; }
            // 删除事件
            var $clear = $li.find('button');
            $clear.off('click');
            $clear.on('click', function(ev){
                ev.stopPropagation();
                var $this = $(this);
                var nsName = $this.attr('ns-name');
                if(nsName != "delete"){
                    return true;
                }
                var $thisLi = $this.closest('li');
                var tabPanel = config.tabPanels[panelName];
                var attrs = tabPanel.attrs;
                var nsComponentType = $thisLi.attr('ns-component-type');
                var nsName = $thisLi.attr('ns-name');
                var nsPanelType = $thisLi.attr('ns-panel-type');
                var attr = attrs[nsName];
                var delConfig = {
                    index : attr.index,
                    panelType : nsPanelType,
                    componentType : nsComponentType,
                    config : config,
                }
                var pageConfig = dataManage.getRefreshConfigByDI(delConfig);
                var value = dataManage.getValueByPageConfig(pageConfig, config);
                panelManage.set(config.attrs, value, config.id);
                if(typeof(config.clearNodeHandler) == "function"){
                    config.clearNodeHandler(attr, config);
                }
            });
            // 拖拽事件
            var $parent = $li.parent();
            // 拖拽结束即松开鼠标时触发
            $parent.off('drop');
            $parent.on('drop', function(ev){
                var originalEvent = ev.originalEvent;
                var startStr = originalEvent.dataTransfer.getData("start");
                var start = JSON.parse(startStr);
                var $target = $(ev.target);
                var $tarLi = ev.target.tagName == "LI" ? $target : $target.closest('li');
                if($tarLi.length == 0){ return true; }
                var nsName = $tarLi.attr('ns-name');
                var nsComponentType = $tarLi.attr('ns-component-type');
                var nsPanelType = $tarLi.attr('ns-panel-type');
                var nsIndex = Number($tarLi.attr('ns-index'));
                if(start.index === nsIndex){
                    return true;
                }
                var end = {
                    name : nsName,
                    index : nsIndex,
                    panelType : nsPanelType,
                    componentType : nsComponentType,
                }
                // 插入位置 之前/之后
                var seat = 'after';
                var height = $tarLi.height();
                var pageY = $tarLi.offset().top;
                var centerHeightY = pageY + height/2;
                var mousePageY = originalEvent.pageY;
                if(mousePageY < centerHeightY){
                    seat = 'before';
                }
                var refConfig = {
                    seat : seat,
                    start : start,
                    end : end,
                    config : config,
                    componentType : start.componentType,
                }
                var pageConfig = dataManage.getRefreshConfigBySE(refConfig);
                var value = dataManage.getValueByPageConfig(pageConfig, config);
                panelManage.set(config.attrs, value, config.id);
                if(typeof(config.dropHandler) == "function"){
                    config.dropHandler(config);
                }
            });
            $parent.off('dragover');
            $parent.on('dragover', function(ev){
                ev.preventDefault();
            });
            // 开始拖拽时触发
            $li.off('dragstart');
            $li.on('dragstart', function(ev){
                var $this = $(this);
                var originalEvent = ev.originalEvent;
                var nsName = $this.attr('ns-name');
                var nsComponentType = $this.attr('ns-component-type');
                var nsPanelType = $this.attr('ns-panel-type');
                var nsIndex = Number($this.attr('ns-index'));
                var nsObj = {
                    name : nsName,
                    index : nsIndex,
                    panelType : nsPanelType,
                    componentType : nsComponentType,
                }
                var nsObjStr = JSON.stringify(nsObj);
                originalEvent.dataTransfer.setData("start", nsObjStr);
            });
        },
        // 初始化面板通过面板配置
        initPanel : function(panelConfig){
            var name = panelConfig.name;        // 面板名字
            var config = panelConfig.config;    // 整体配置
            var showComponentName = config.showComponentName; // 当前显示组件名字 panel,form,grid,btns
            var showAttrs = {};
            var showAttrArr = [];
            var panelId = config.tabPanelIds[name];
            var html = '';
            var isRunPanelEvent = true;
            switch(name){
                case 'add':
                    var attrs = config.attrs;
                    var values = config.value;
                    if(showComponentName == 'panel'){
                        showAttrs = attrs.types[showComponentName];
                        showAttrArr = attrs.typeArr[showComponentName];
                    }else{
                        var _panelConfig = values.types.panel[showComponentName];
                        var childrenType = _panelConfig.childrenType;
                        showAttrs = attrs.types[childrenType];
                        showAttrArr = attrs.typeArr[childrenType];
                        if(_panelConfig.panelType == "tree"){
                            showAttrArr = undefined;
                        }
                    }
                    if(typeof(showAttrArr) != "undefined"){
                        html = panelManage.getAddHtml(showAttrArr, config);
                    }
                    break;
                case 'added':
                    var values = config.value;
                    if(showComponentName == 'panel'){
                        showAttrs = values.types[showComponentName];
                        showAttrArr = values.typeArr[showComponentName];
                    }else{
                        var _panelConfig = values.types.panel[showComponentName];
                        var panelIndex = _panelConfig.index;
                        var childrenType = _panelConfig.childrenType;
                        showAttrs = values.types[childrenType][panelIndex];
                        showAttrArr = values.typeArr[childrenType][panelIndex];
                    }
                    if(typeof(showAttrArr) != "undefined"){
                        html = panelManage.getAddedHtml(showAttrArr, config);
                    }
                    break;
                case 'datasource':
                    isRunPanelEvent = false;
                    var values = config.value;
                    if(showComponentName == 'panel'){
                        // 不存在数据源
                        var panelId = config.tabPanelIds.datasource;
                        $('#' + panelId).html('');
                    }else{
                        // 字段/方法
                        if(NetstarTPEditor.controllersData){
                            panelManage.initDatasourcePanel(config);
                        }
                    }
                    break;
            }
            if(!isRunPanelEvent){
                return true;
            }
            var $container = $('#' + panelId);
            $container.html(html);
            config.tabPanels[name] = {
                id : panelId,
                $container : $container,
                attrs : showAttrs,
                attrArr : showAttrArr,
            }
            panelManage.setPanelEvent(name, config);
        },
        // 刷新面板配置 通过pageConfig
        refreshByPageConfig : function(pageConfig, config, showComponentName){
            config.pageConfig = pageConfig;
            config.value = dataManage.getValueByPageConfig(pageConfig, config);
            // config.showComponentName = 'panel';
            if(typeof(showComponentName) == "string"){
                config.showComponentName = showComponentName;
            }else{
                config.showComponentName = 'panel';
            }
            var panelConfig = {
                name : config.showPanelName,
                config : config,
            }
            panelManage.initPanel(panelConfig);
        },
        // 刷新面板数据通过pageConfig
        refreshValueByPageConfig : function(pageConfig, config){
            config.pageConfig = pageConfig;
            config.value = dataManage.getValueByPageConfig(pageConfig, config);
        },
        // 刷新面板 通过showComponentName
        refreshByComName : function(componentName, config){
            config.showComponentName = componentName;
            var panelConfig = {
                name : config.showPanelName,
                config : config,
            }
            panelManage.initPanel(panelConfig);
        },
        // 初始化
        init : function(config){
            if(typeof(config.pageConfig) == "object" && !$.isEmptyObject(config.pageConfig)){
                config.value = dataManage.getValueByPageConfig(config.pageConfig, config);
            }
            // 关闭
            var btnHtml = '<div class="btn-group">'
                                + '<button class="btn btn-icon btn-close">'
                                    + '<i class="icon-close"></i>'
                                + '</button>'
                            + '</div>'
            // 容器
            var $container = $('#' + config.id);
            var $btnGroup = $(btnHtml);
            var $btn = $btnGroup.find('button');
            $btn.off('click');
            $btn.on('click', function(ev){
                if(typeof(config.closeHandler) == "function"){
                    config.closeHandler();
                }
            });
            $container.append($btnGroup);
            // tab面板初始化
            var tabConfig = {
                id : config.id,
                tab : panelManage.tab,
                isDefaultShow : config.isDefaultShow,
                panelTitle : {
                    added : '已添加',
                },
                panelClass : {
                    add : 'nav',
                    added : 'list list-normal',
                },
                completeHandler : function(tabConfig){
                    config.showPanelName = tabConfig.showPanelName;
                    config.tabPanelIds = tabConfig.tabPanelIds;
                    panelManage.set(config.attrs, config.value, config.id);
                },
                switchTabHandler : function(obj){
                    if(config.showPanelName != obj.name){
                        config.prevShowPanelName = config.showPanelName;
                    }
                    config.showPanelName = obj.name;
                    if(!config.value){
                        return false;
                    }
                    var panelConfig = {
                        name : config.showPanelName,
                        config : config,
                    }
                    panelManage.initPanel(panelConfig);
                    // 已添加移除选中
                    var $container = config.tabPanels.added && config.tabPanels.added.$container ? config.tabPanels.added.$container : false;
                    if($container){
                        var $li = $container.find('li');
                        $li.removeClass('current');
                    }
                },
                // btns : [
                //     {
                //         text : '',
                //         handler : function(){
                //             console.log('ssss');
                //         }
                //     }
                // ]
            }
            NetstarTPEditor.tabPanel.init(tabConfig);
        }
    }
    // 数据管理
    var dataManage = {
        chnNameToPanelType : {
            list : '表格',
            tree : '树',
            vo : '表单',
            btns : '按钮',
            bar : '柱形图',
            tab : 'tab',
            customize : '自定义',
            line : '线形图',
            pie : '饼状图',
            pdfList : 'pdf列表',
            uploadCover : '上传图片',
            resultinput : '结果录入',
            recordList : '记录列表',
            blocklist : '块状表格',
        },
        // 数据源搜索
        getDatasourceDataByName : function(name, listData){
            var arr = [];
            for(var i=0; i<listData.length; i++){
                if(typeof(listData[i].chnName) == "string" && listData[i].chnName.indexOf(name) != -1){
                    arr.push(listData[i]);
                    continue;
                }
                if(typeof(listData[i].enName) == "string" && listData[i].enName.indexOf(name) != -1){
                    arr.push(listData[i]);
                    continue;
                }
                if(typeof(listData[i].id) == "string" && listData[i].id.indexOf(name) != -1){
                    arr.push(listData[i]);
                    continue;
                }
            }
            return arr;
        },
        // 获取没有使用的数据源
        getNoUseDatasourceDataByName : function(useList, listData){
            // var 
        },
        // 获取panel的value
        getPanelValue : function(component, index){
            var componentType = 'panel';
            var type = component.type;
            var chnNameToType = dataManage.chnNameToPanelType;
            var chnType = chnNameToType[type] ? chnNameToType[type] : type;
            var chnName = chnType + '-' + index;
            var name = type + '-' + index;
            var enName = name;
            var fullName = 'panel-' + type + '-' + index;
            var panelType = type;
            var childrenType = 'grid';
            if(type == "vo"){ childrenType = 'form'; }
            if(type == "btns"){ childrenType = 'btns'; }
            // 是否正在编辑
            var isEditing = typeof(component.nsIsEditing) == "boolean" ? component.nsIsEditing : false;
            delete component.nsIsEditing;
            var panelConfig = {
                index : index,
                chnName: chnName,
                enName: enName,
                componentType: componentType,
                name: name,
                fullName: fullName,
                childrenType : childrenType,
                panelType : panelType,
                value : component,
                isEditing : isEditing,
            }
            return panelConfig;
        },
        // componentClass组件类别
        getFieldValue : function(component, componentClass, index, attrs){
            var componentType = '';
            var type = '';
            var chnName = '';
            var name = '';
            var enName = '';
            var fullName = '';
            // 是否正在编辑
            var isEditing = typeof(component.nsIsEditing) == "boolean" ? component.nsIsEditing : false;
            delete component.nsIsEditing;
            var attrsByType = {};
            switch(componentClass){
                case 'form':
                    componentType = 'form';
                    type = component.type;
                    chnName = component.label;
                    enName = component.id;
                    attrsByType = attrs[type] ? attrs[type] : attrs.text;
                    break;
                case 'grid':
                    componentType = 'grid';
                    type = component.columnType ? component.columnType : 'grid';
                    chnName = component.title;
                    enName = component.field;
                    attrsByType = attrs[type] ? attrs[type] : attrs.grid;
                    break;
                case 'btns':
                    componentType = 'btns';
                    type = component.defaultMode ? component.defaultMode : 'custom';
                    enName = 'btns-' + index;
                    chnName = component.text ? component.text : enName;
                    attrsByType = attrs[type] ? attrs[type] : attrs.custom;
                    break;
            }
            name = enName;
            fullName = componentClass + '-' + enName;
            var panelType = type;
            var config = {
                index : index,
                chnName: chnName,
                enName: enName,
                componentType: componentType,
                name: name,
                fullName: fullName,
                panelType : panelType,
                value : component,
                isEditing : isEditing,
                attrArr : attrsByType.attrArr,
            }
            return config;
        },
        // 获取value之前格式化pageConfig  添加面板是为设置field
        formatPageConfig : function(pageConfig){
            var components = pageConfig.components;
            for(var i=0; i<components.length; i++){
                var type = components[i].type;
                switch(type){
                    case 'vo':
                    case 'list':
                    case 'blockList':
                    case 'customize':
                    case 'pie':
                    case 'line':
                    case 'pdfList':
                    case 'recordList':
                    case 'bar':
                        components[i].field = $.isArray(components[i].field) ? components[i].field : [];
                        break;
                }
            }
        },
        // 通过pageConfig获取value
        getValueByPageConfig : function(pageConfig, config){
            var value = {
                typeArr : {},
                types : {}
            }
            var attrs = config.attrs.types;
            var panel = {};
            var panelArr = [];
            var btns = {};
            var btnsArr = [];
            var form = {};
            var formArr = [];
            var grid = {};
            var gridArr = [];
            var template = {};
            var templateArr = [];
            dataManage.formatPageConfig(pageConfig);
            var templateConfig = {
                chnName: "模板配置",
                enName: "template",
                componentType: "template",
                name: "template",
                fullName: "template-template",
                panelType : "template",
                value : pageConfig,
                attrArr : attrs.template.template.attrArr,
            }
            template = templateConfig;
            templateArr.push(templateConfig);
            var components = pageConfig.components;
            for(var i=0; i<components.length; i++){
                var component = components[i];
                var panelType = component.type;
                // 面板的value
                var panelValue = dataManage.getPanelValue(component, i);
                /***lyw 暂时添加代码 qq修改配置后删除 start***/
                switch(panelType){
                    case 'blockList':
                        panelType = 'blocklist';
                        break;
                    default:
                        break;
                }
                /***lyw 暂时添加代码 qq修改配置后删除 end ****/
                panelValue.attrArr = attrs.panel[panelType].attrArr;
                var panelName = panelValue.name;
                panel[panelName] = panelValue;
                panelArr.push(panelValue);
                // 判断是否存在field  按钮/表单/表格
                var fields = component.field;
                if(!$.isArray(fields)){ continue; }
                var componentClass = panelType == "vo" ? 'form' : panelType == "btns" ? 'btns' : "grid";
                var fieldObj = {};
                var fieldArr = [];
                switch(componentClass){
                    case 'form':
                        form[i] = {};
                        formArr[i] = [];
                        fieldObj = form[i];
                        fieldArr = formArr[i];
                        break;
                    case 'grid':
                        grid[i] = {};
                        gridArr[i] = [];
                        fieldObj = grid[i];
                        fieldArr = gridArr[i];
                        break;
                    case 'btns':
                        btns[i] = {};
                        btnsArr[i] = [];
                        fieldObj = btns[i];
                        fieldArr = btnsArr[i];
                        break;
                }
                for(var fieldI=0; fieldI<fields.length; fieldI++){
                    var field = fields[fieldI];
                    var fieldValue = dataManage.getFieldValue(field, componentClass, fieldI, attrs[componentClass]);
                    fieldObj[fieldValue.name] = fieldValue;
                    fieldArr.push(fieldValue);
                }
            }
            value.typeArr.panel = panelArr;
            value.typeArr.btns = btnsArr;
            value.typeArr.form = formArr;
            value.typeArr.grid = gridArr;
            value.typeArr.template = templateArr;
            value.types.panel = panel;
            value.types.btns = btns;
            value.types.form = form;
            value.types.grid = grid;
            value.types.template = template;
            return value;
        },
        // 通过开始结束位置获取重新排序的数组 并 根据数组前后改变更新选中config
        getNewArrBySEIndex : function(config){
            var arr = config.arr;
            var start = config.start;
            var end = config.end;
            var seat = config.seat;
            var _arr = [];
            var selectConfig = config.config.selectConfig;
            var sourceIndex = -1;
            if(typeof(selectConfig) == "object"){
                var sourceIndex = selectConfig.index;
            }
            for(var i=0; i<arr.length; i++){
                if(i === start){
                    continue;
                }
                if(i === end){
                    if(seat == "before"){
                        _arr.push(arr[start]);
                        _arr.push(arr[i]);
                        if(sourceIndex == start){
                            selectConfig.index = _arr.length - 2;
                        }
                        if(sourceIndex == end){
                            selectConfig.index = _arr.length - 1;
                        }
                    }else{
                        _arr.push(arr[i]);
                        _arr.push(arr[start]);
                        if(sourceIndex == start){
                            selectConfig.index = _arr.length - 1;
                        }
                        if(sourceIndex == end){
                            selectConfig.index = _arr.length - 2;
                        }
                    }
                    continue;
                }
                _arr.push(arr[i]);
                if(sourceIndex == i){
                    selectConfig.index = _arr.length - 1;
                }
            }
            return _arr;
        },
        // 获取通过开始结束位置获取到的pageConfig
        getRefreshConfigBySE : function(refConfig){
            var seat = refConfig.seat;
            var start = refConfig.start;
            var end = refConfig.end;
            var config = refConfig.config;
            var componentType = refConfig.componentType;
            var sourcePageConfig = config.pageConfig;
            var pageConfig = sourcePageConfig;
            var obj = {
                seat : seat,
                start : start.index,
                end : end.index,
            }
            // 当前编辑面板属性
            var tabPanel = config.tabPanels[config.showPanelName];
            var attrArr = tabPanel.attrArr;
            // 编辑的组件
            var components = [];
            // 组件位置
            var componentsIndexObj = pageConfig;
            // 组件名
            var componentsName = 'components';
            switch(componentType){
                case 'panel':
                    var components = pageConfig.components;
                    // 记录是否正在编辑
                    for(var i=0; i<components.length; i++){
                        components[i].nsIsEditing = attrArr[i].isEditing;
                    }
                    break;
                case 'form':
                case 'grid':
                case 'btns':
                    var panels = pageConfig.components;
                    var panelsVal = config.value.types.panel[config.showComponentName];
                    var panelIndex = panelsVal.index;
                    var components = panels[panelIndex].field;
                    var componentsIndexObj = pageConfig.components[panelIndex];
                    var componentsName = 'field';
                    // 记录是否正在编辑
                    for(var i=0; i<components.length; i++){
                        components[i].nsIsEditing = attrArr[i].isEditing;
                    }
                    break;
            }
            obj.arr = components;
            obj.config = config;
            components = dataManage.getNewArrBySEIndex(obj);
            componentsIndexObj[componentsName] = components;
            return pageConfig;
        },
        // 获取通过删除位置获取到的pageConfig
        getRefreshConfigByDI : function(delConfig){
            console.log(delConfig);
            var config = delConfig.config;
            var componentType = delConfig.componentType;
            var index = delConfig.index;
            var showComponentName = config.showComponentName;
            var value = config.value;
            var pageConfig = config.pageConfig;
            if(showComponentName == 'panel'){
                pageConfig.components.splice(index,1);
            }else{
                var panelVal = value.types.panel[showComponentName];
                var panelIndex = panelVal.index;
                pageConfig.components[panelIndex].field.splice(index,1);
            }
            return pageConfig;
        },
        // 获取当前操作配置
        getCurrentOperatorConfig : function(config){
            var selectConfig = config.selectConfig;
            if(typeof(selectConfig) != "object"){
                console.error('当前没有操作数据');
                console.error(config);
                return false;
            }
            var componentName = selectConfig.componentName;
            var panelName = selectConfig.panelName;
            var value = config.value;
            var type = 'template';
            var index = -1;
            var panelIndex = -1;
            switch(componentName){
                case 'template':
                    type = 'template';
                    break;
                case 'panel':
                    type = 'panel';
                    index = selectConfig.index;
                    break;
                default:
                    type = 'field';
                    index = selectConfig.index;
                    var panelVal = value.types.panel[componentName];
                    panelIndex = panelVal.index;
                    break;
            }
            return {
                type : type,
                panelIndex : panelIndex,
                index : index,
            }
        },
        // 格式化当前操作数据
        formatCurrentOperatorData : function(config, data, callBackFunc){
            var currentOperatorConfig = dataManage.getCurrentOperatorConfig(config);
            if(!currentOperatorConfig){
                return false;
            }
            var type = currentOperatorConfig.type;
            switch(type){
                case 'template':
                    break;
                case 'panel':
                    switch(data.type){
                        case 'btns':
                        case 'vo':
                        case 'list':
                            if(!$.isArray(data.field)){
                                data.field = [];
                            }
                            break;
                    }
                    for(var key in data){
                        if(typeof(data[key]) == "object"){
                            if(data[key].datasourceType == "static"){
                                delete data[key];
                            }
                        }
                    }
                    var nsStateId = data.nsStateId;
                    var nsStateName = data.nsStateName;
                    var nsState = data.nsState;
                    // 判断是否发送ajax 如果发送表示使用状态的field
                    var isSendAjax = true;
                    if(typeof(nsStateId) == "undefined" || nsStateId === ''){
                        isSendAjax = false;
                    }
                    if(typeof(nsState) == "object"){
                        if(typeof(nsStateId) != "undefined" && nsStateId !== ''){
                            if(nsState.id === nsStateId){
                                isSendAjax = false;
                            }
                        }
                        if(nsStateName){
                            // 使用配置名
                            if(typeof(nsState.config.config) != "object"){
                                nsState.config.config = {};
                            }
                            nsState.config.config.chineseName = nsStateName;
                            nsState.config.config.name = nsStateName;
                        }
                    }
                    if(isSendAjax){
                        var ajaxConfig = {
                            data : {
                                id : nsStateId,
                            },
                            plusData : {
                                config : config,
                                operatorData : data,
                                operatorCallBackFunc : callBackFunc,
                            },
                            callBackFunc : function(resData, plusData){
                                var operatorData = plusData.operatorData;
                                var _config = plusData.config;
                                if($.isArray(resData) && resData.length == 1){
                                    NetstarEditorServer.setComponentPanelConfig(resData, operatorData);
                                }else{
                                    console.error('获取状态错误');
                                    console.error(resData);
                                }
                                console.log(operatorData);
                                if(typeof(plusData.operatorCallBackFunc) == "function"){
                                    plusData.operatorCallBackFunc(operatorData, _config);
                                }
                            }
                        }
                        NetstarEditorAjax.getById(ajaxConfig);
                        return;
                    }
                    break;
                case 'field':
                    break;
            }
            if(typeof(callBackFunc) == "function"){
                callBackFunc(data, config);
            }
        },
        // 获取当前操作数据
        setCurrentOperatorData : function(config, data, callBackFunc){
            var currentOperatorConfig = dataManage.getCurrentOperatorConfig(config);
            if(!currentOperatorConfig){
                return false;
            }
            var selectConfig = config.selectConfig;
            var type = currentOperatorConfig.type;
            var index = currentOperatorConfig.index;
            var panelIndex = currentOperatorConfig.panelIndex;
            var pageConfig = config.pageConfig;
            var components = false;
            switch(type){
                case 'template':
                    config.pageConfig = data;
                    break;
                case 'panel':
                    components = pageConfig.components;
                    switch(data.type){
                        case 'btns':
                        case 'vo':
                        case 'list':
                            if(!$.isArray(data.field)){
                                data.field = [];
                            }
                            break;
                    }
                    for(var key in data){
                        if(typeof(data[key]) == "object"){
                            if(data[key].datasourceType == "static"){
                                delete data[key];
                            }
                        }
                    }
                    break;
                case 'field':
                    if(!$.isArray(pageConfig.components[panelIndex].field)){
                        pageConfig.components[panelIndex].field = [];
                    }
                    components = pageConfig.components[panelIndex].field;
                    break;
            }
            if(components){
                if(index == -1 || index == -2){
                    // 已经添加 表示selectConfig中位置
                    selectConfig.index = components.length;
                    components.push(data);
                }else{
                    components[index] = data;
                }
            }
            if(typeof(callBackFunc) == "function"){
                callBackFunc(config);
            }
        },
        // 添加字段或按钮  通过数据源(controler)
        addFieldData : function(value, attr, config, callBackFunc){
            var showPanelName = config.showPanelName;
            var showComponentName = config.showComponentName;
            if(showPanelName != "datasource"){
                console.error('只有datasource可以直接添加字段');
                return false;
            }
            var componentType = attr.componentType;
            switch(componentType){
                case 'template':
                case 'panel':
                    break;
                default:
                    type = 'field';
                    var panelVal = config.value.types.panel[showComponentName];
                    var panelIndex = panelVal.index;
                    var pageConfig = config.pageConfig;
                    if(!$.isArray(pageConfig.components[panelIndex].field)){
                        pageConfig.components[panelIndex].field = [];
                    }
                    var components = pageConfig.components[panelIndex].field;
                    components.push(value);
                    if(typeof(callBackFunc) == "function"){
                        callBackFunc(config);
                    }
                    break;
            }
        },
        // 获取当前数据结构，面包屑
        getBreadData : function(pageConfig){
            var rootNode = {
                id : 'template',
                name : '页面',
                type : 'template',
            }
            var children = [];
            var components = pageConfig.components;
            for(var i=0; i<components.length; i++){
                var panelVal = dataManage.getPanelValue(components[i], i);
                var node = {
                    id : panelVal.name,
                    name : panelVal.chnName,
                    type : panelVal.panelType,
                }
                children.push(node);
            }
            rootNode.children = children;
            return [rootNode];
        },
        getPageConfig : function(id){
            var config = configManage.getConfig(id);
            if(!config){
                console.error('没有找到面板配置,id:'+id);
                return false;
            }
            var pageConfig = config.pageConfig;
            return pageConfig;
        }
    }
    // 初始化
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
        // 
        panelManage.init(config);
    }
    return {
        configs : configs,
        init : init,
        set : panelManage.set,
        show: panelManage.show,
        hide: panelManage.hide,
        getConfig : configManage.getConfig,
        refreshByPageConfig : panelManage.refreshByPageConfig,
        refreshByComName : panelManage.refreshByComName,
        setCurrentOperatorData : dataManage.setCurrentOperatorData,
        getBreadData : dataManage.getBreadData,
        getPageConfig : dataManage.getPageConfig,
        formatCurrentOperatorData : dataManage.formatCurrentOperatorData,
        addFieldData : dataManage.addFieldData,
        refreshValueByPageConfig : panelManage.refreshValueByPageConfig,
        clickNodeEventFunc : panelManage.clickNodeEventFunc,
    }
})()

// new
NetstarTPEditor.selectPageList = (function(){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
                nsAlert('组件列表面板配置错误，id必须配置', 'error');
                console.error('组件列表面板配置错误，id必须配置:', config);
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                isDefaultShow : false, // 初始化时默认是否显示
                // showComponentName : 'list-1', // panel btns form grid
                showComponentName : 'panel', // panel btns form grid
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            // tab中的id
            config.tabPanels = {};
            // 显示隐藏
            config.panelIsShow = config.isDefaultShow;
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
    // 面板
    var panelManage = {
        template : {
            footer : '',
        },
        // 显示dialog弹框
        showDialog : function(config){
            var dialogConfig = {
                id: config.id,
                width: '70%',
                height: "70%",
                title: '弹框标题',
                templateName: 'PC',
                // zIndex : 2002,
                shownHandler: (function(_config){
                    return function(dialogConfig){
                        _config.ids = {
                            headId : dialogConfig.config.headId,
                            bodyId : dialogConfig.config.bodyId,
                            footerId : dialogConfig.config.footerIdGroup,
                        }
                        panelManage.init(_config);
                    }
                })(config),
            }
            NetstarComponent.dialogComponent.init(dialogConfig);
        },
        // 设置当前选中页面的controlerIds
        setControlerIds : function(config){
            var ids = config.ids;
            var currentIndex = config.currentIndex;
            var pageLength = config.pageLength;
            var currentPageNum = config.currentPageNum;
            var pageList = config.pageList;
            var currentPage = pageList[currentPageNum-1][currentIndex-1];
            var currentPageConfig = currentPage.config;
            if(currentPageConfig){
                var nsControllerIds = currentPageConfig.nsControllerIds ? currentPageConfig.nsControllerIds : '';
                var controllerFormId = ids.controllerId;
                if(nsControllerIds){
                    var vals = {
                        controller : nsControllerIds,
                    }
                    NetstarComponent.fillValues(vals, controllerFormId);
                }else{
                    NetstarComponent.clearValues(controllerFormId)
                }
            }
            
        },
        getBodyHtml : function(config){
            var ids = config.ids;
            var html = '<div class="panel">'
                            + '<div class="list list-link list-normal">'
                                + '<div class="list-header" id="' + ids.selectHeader + '"></div>'
                                + '<div class="list-body" id="' + ids.selectBody + '">'
                                    + '<div class="list-body-search" id="' + ids.selectBodySearch + '"></div>'
                                    + '<div class="list-body-list" id="' + ids.selectBodyList + '"></div>'
                                +'</div>'
                                + '<div class="list-footer" id="' + ids.selectFooter + '"></div>'
                            + '</div>'
                        + '</div>'
            if(config.isController){
                html =  '<div id="' + ids.controllerId + '"></div>' + html;
            }
            return html;
        },
        setPageEvent : function(config){
            var ids = config.ids;
            var selectBodyId = ids.selectBody;
            var $lis = $('#' + selectBodyId).find('li');
            var $btns = $lis.find('button');
            $lis.off('click');
            $lis.on('click', function(ev){
                var $this = $(this);
                var disabled = $this.attr('disabled');
                if(disabled == 'disabled'){
                    return false;
                }
                var nsIndex = $this.attr('ns-index');
                $lis.removeClass('current');
                $this.addClass('current');
                config.currentIndex = Number(nsIndex);
                // 设置当前页面选中的controlers
                panelManage.setControlerIds(config);
            });
            $btns.off('click');
            $btns.on('click', function(ev){
                ev.stopPropagation();
                var $this = $(this);
                var delId = '';
                var $li = $this.closest('li');
                var disabled = $li.attr('disabled');
                if(disabled == 'disabled'){
                    return false;
                }
                var nsIndex = $li.attr('ns-index');
                var pageList = config.pageList[config.currentPageNum - 1];
                var pageData = pageList[Number(nsIndex)-1];
                var delId = pageData.id;
                nsConfirm('确认要删除'+pageData.chnName+'吗？',function(isdelete){
                    if(isdelete){
                        funcManage.delete(delId, function(){
                            // $li.attr('disabled', 'disabled');
                            // if($li.hasClass('current')){
                            //     var $next = panelManage.getNextDom($li);
                            //     if($next){
                            //         if($next.attr('disabled') == "disabled"){
                            //             $li.removeClass('current');
                            //             $next.addClass('current');
                            //             config.currentIndex = Number($next.attr('ns-index'));
                            //         }else{
                            //             $li.removeClass('current');
                            //             config.currentIndex = 0;
                            //         }
                            //     }else{
                            //         $li.removeClass('current');
                            //         config.currentIndex = 0;
                            //     }
                            // }
                            dataManage.getPageListData(config, function(pageListAll, _config){
                                _config.sourcePageListAll = _config.pageListAll;
                                _config.pageListAll = pageListAll;
                                panelManage.refreshPanel(_config);
                            });
                        });
                    }
                },"success");
            });
        },
        getNextDom : function($li){
            var $next = false;
            var type = 'next';
            function func($dom){
                if($dom.length > 0){
                    if($dom.attr('disabled') == "disabled"){
                        func($dom[type]());
                    }else{
                        $next = $dom;
                    }
                }else{
                    if(type == 'next'){
                        type = 'prev';
                        func($li[type]());
                    }
                }
            }
            func($li[type]());
            return $next;
        },
        setPageNumEvent : function(config){
            var ids = config.ids;
            var selectFooterId = ids.selectFooter;
            var $spans = $('#' + selectFooterId).find('span');
            $spans.off('click');
            $spans.on('click', function(ev){
                var $this = $(this);
                var nsType = $this.attr('ns-type');
                $spans.removeClass('current');
                $this.addClass('current');
                var isRefresh = true;
                switch(nsType){
                    case 'num':
                        var nsIndex = Number($this.text());
                        if(config.currentPageNum == nsIndex){
                            isRefresh = false;
                        }else{
                            config.currentPageNum = nsIndex;
                        }
                        break;
                    case 'prev':
                        var currentPageNum = config.currentPageNum;
                        if(currentPageNum == 1){
                            isRefresh = false;
                        }else{
                            config.currentPageNum = currentPageNum - 1;
                        }
                        break;
                    case 'next':
                        var currentPageNum = config.currentPageNum;
                        if(currentPageNum == config.pageNum){
                            isRefresh = false;
                        }else{
                            config.currentPageNum = currentPageNum + 1;
                        }
                        break;
                }
                if(isRefresh){
                    panelManage.initPageList(config);
                }
            });
        },
        getPageNumHtml : function(config){
            var pageNum = config.pageNum;
            var html = '';
            for(var i=0; i<pageNum; i++){
                html += '<span class="pages-item" ns-type="num">' + (i + 1) + '</span>';
                        
            }
            html =  '<div class="pages">'
                        +'<span class="pages-item" ns-type="prev"><i class="icon icon-arrow-left-o"></i></span>'
                            + html
                        + '<span class="pages-item" ns-type="next"><i class="icon icon-arrow-right-o"></i></span>'
                    +'</div>'
            return html;
        },
        getPageListHtml : function(config){
            var pageList = config.pageList[config.currentPageNum - 1];
            var html = '';
            for(var i=0; i<pageList.length; i++){
                var classStr = i == config.currentIndex-1 ? 'current' : '';
                var btnHtml = '';
                if(config.type == 'page'){
                    btnHtml = '<div class="list-after btn-group">'
                                    + '<button class="btn btn-icon" ns-name="delete">'
                                        + '<i class="icon-close"></i>'
                                    + '</div>'
                                + '</button>';
                }
                html += '<li class="list-item col-lg-3 col-xs-4 ' + classStr + '" ns-index="'+ (i + 1) +'">'
                            + '<div class="list-before">'
                                + '<div class="media">'
                                    + '<img src="../static/images/svg-01.svg">'
                                    + '<a href="#" class="help">'
                                        + '<i class="fa-question-circle"></i>'
                                    + '</a>'
                                + '</div>'
                            + '</div>'
                            + '<div class="list-content">'
                                + '<div class="title">'
                                    + '<span class="tags">'
                                        + '<i class="fa-tv"></i>'
                                    + '</span>'
                                    + '<span>'+ pageList[i].chnName +'</span>'
                                + '</div>' 
                                + '<div class="subtitle">'
                                    + '<span>'+ pageList[i].enName +'</span>'
                                + '</div>'
                                + '<div class="text">'
                                    + '<span></span>'
                                + '</div>'
                            + '</div>'
                            + btnHtml
                        + '</div>'
            }
            html = '<ul>'
                        +  html
                    + '</ul>'
            return html;
        },
        // 刷新面板
        refreshPanel : function(config){
            var pageList = dataManage.getPagingData(config);
            config.pageList = pageList;
            config.pageNum = pageList.length;
            if(config.currentPageNum > config.pageNum){
                config.currentPageNum = config.pageNum;
            }
            var ids = config.ids;
            // 展示列表
            panelManage.initPageList(config);
            // 页码
            var pageNumHtml = panelManage.getPageNumHtml(config);
            var $pageNumContainer = $('#' + ids.selectFooter);
            $pageNumContainer.html(pageNumHtml);
            panelManage.setPageNumEvent(config);
            // footer
            var footerId = ids.footerId;
            $('#' + footerId).html('');
            panelManage.initFooter(config);
        },
        // 刷新面板
        refreshPanelByList : function(list, config){
            var pageList = dataManage.getPagingDataByList(list, config);
            config.pageList = pageList;
            config.pageNum = pageList.length;
            config.currentPageNum = 1;
            var ids = config.ids;
            // 展示列表
            panelManage.initPageList(config);
            // 页码
            var pageNumHtml = panelManage.getPageNumHtml(config);
            var $pageNumContainer = $('#' + ids.selectFooter);
            $pageNumContainer.html(pageNumHtml);
            panelManage.setPageNumEvent(config);
            // footer
            var footerId = ids.footerId;
            $('#' + footerId).html('');
            panelManage.initFooter(config);
        },
        initPageList : function(config){
            var ids = config.ids;
            config.currentIndex = 1;
            var pageListHtml = panelManage.getPageListHtml(config);
            var $pageListContainer = $('#' + ids.selectBodyList);
            $pageListContainer.html(pageListHtml);
            panelManage.setPageEvent(config);
        },
        initPageNumList : function(config){
            var ids = config.ids;
            var pageNumHtml = panelManage.getPageNumHtml(config);
            var $pageNumContainer = $('#' + ids.selectFooter);
            $pageNumContainer.html(pageNumHtml);
            panelManage.setPageNumEvent(config);
        },
        initSearch : function(config){
            var ids = config.ids;
            var formConfig = {
                id : ids.selectBodySearch,
                defaultComponentWidth : '100%',
                isSetMore : false,
                form : [
                    {
                        id : 'searchname',
                        label : '',
                        type : 'text',
                        btns : [
                            {
                                name : '搜索',
                                handler : function(){
                                    var formData = NetstarComponent.getValues(ids.selectBodySearch);
                                    var searchname = formData.searchname;
                                    var list = dataManage.getSearchDataByText(searchname, config);
                                    panelManage.refreshPanelByList(list, config);
                                }
                            }
                        ],
                        changeHandler : function() {
                            var formData = NetstarComponent.getValues(ids.selectBodySearch);
                            var searchname = formData.searchname;
                            var list = dataManage.getSearchDataByText(searchname, config);
                            panelManage.refreshPanelByList(list, config);
                        }
                    }
                ]
            }
            NetstarComponent.formComponent.show(formConfig);
        },
        // 初始化body
        initBody : function(config){
            var ids = config.ids;
            var bodyId = ids.bodyId;
            var html = panelManage.getBodyHtml(config);
            $('#' + bodyId).html(html);
            // controller
            if(config.isController){
                var headerFormConfig = {
                    id : ids.controllerId,
                    defaultComponentWidth : '100%',
                    isSetMore : false,
                    form : [
                        {
                            id : 'controller',
                            label : '',
                            type : 'select',
                            selectMode : 'multi',
                            subdata : config.controllerData,
                        }
                    ]
                }
                NetstarComponent.formComponent.show(headerFormConfig);
            }
            // 展示样式选择按钮
            var showBtnsConfig = {
                id : ids.selectHeader,
                btnGroups : [
                    {
                        type : 'switch',
                        btns : [
                            {
                                id : '01',
                                text : '',
                                icon : '<i class="fa-th-list"></i>',
                                handler : function(ev, data){
                                },
                            },{
                                id : '02',
                                text : '',
                                icon : '<i class="fa-th-large"></i>',
                                handler : function(ev, data){
                                },
                            },
                        ]
                    },
                ]
            }
            NetstarEditorBase.btns.init(showBtnsConfig);
            // 搜索
            panelManage.initSearch(config);
            // 展示列表
            panelManage.initPageList(config);
            // 页码
            var pageNumHtml = panelManage.getPageNumHtml(config);
            var $pageNumContainer = $('#' + ids.selectFooter);
            $pageNumContainer.html(pageNumHtml);
            panelManage.setPageNumEvent(config);

        },
        // 初始化footer
        initFooter : function(config){
            var ids = config.ids;
            var footerId = ids.footerId;
            var footerBtnsConfig = {
                id : footerId,
                btnGroups : [
                    {
                        type : 'normal',
                        btns : [
                            {
                                id : 'close',  // 组件列表面板 显示隐藏
                                text : '取消',
                                isUseState : false,
                                handler : function(ev, data){
                                    console.error(ev);
                                    NetstarComponent.dialog[config.id].vueConfig.close();
                                },
                            },
                            {
                                id : 'confirm',  // 组件列表面板 显示隐藏
                                text : '确定',
                                isUseState : false,
                                handler : function(ev, data){
                                    var currentPageNumIndex = config.currentPageNum - 1;
                                    var currentIndex = config.currentIndex - 1;
                                    if(currentIndex == -1){
                                        nsAlert('没有选中页面','warning');
                                        console.warn('没有选中页面');
                                        return false;
                                    }
                                    var pageList = config.pageList;
                                    var selectData = pageList[currentPageNumIndex][currentIndex];
                                    var isGetController = false;
                                    config.nsControllerIds = false;
                                    if(config.isController){
                                        var controllerFormData = NetstarComponent.getValues(config.ids.controllerId);
                                        if(controllerFormData.controller){
                                            isGetController = true;
                                            config.nsControllerIds = controllerFormData.controller;
                                            NetstarTPEditor.api.controller.get({ids : controllerFormData.controller}).then(function(res){
                                                if(typeof(config.confirmHandler) == "function"){
                                                    config.confirmHandler(selectData, res, config);
                                                }
                                            })
                                        }
                                    }
                                    if(!isGetController){
                                        if(typeof(config.confirmHandler) == "function"){
                                            config.confirmHandler(selectData, false, config);
                                        }
                                    }
                                },
                            },
                        ]
                    },
                ]
            }
            NetstarEditorBase.btns.init(footerBtnsConfig);
        },
        // 初始化
        init : function(config){
            var ids = config.ids;
            var headId = ids.headId;
            var bodyId = ids.bodyId;
            var footerId = ids.footerId;
            var controllerId = bodyId + '-controller';
            var selectHeader = bodyId + '-select-header';
            var selectBody = bodyId + '-select-body';
            var selectBodySearch = bodyId + '-select-body-search';
            var selectBodyList = bodyId + '-select-body-list';
            var selectFooter = bodyId + '-select-footer';
            ids.controllerId = controllerId;
            ids.selectHeader = selectHeader;
            ids.selectBody = selectBody;
            ids.selectBodySearch = selectBodySearch;
            ids.selectBodyList = selectBodyList;
            ids.selectFooter = selectFooter;
            // 
            var pageList = dataManage.getPagingData(config);
            config.pageList = pageList;
            config.pageNum = pageList.length;
            config.currentPageNum = 1;
            config.isController = $.isArray(config.controllerData) && config.controllerData.length > 0 ? true : false;

            // header
            // body
            panelManage.initBody(config);
            // footer
            panelManage.initFooter(config);
        }
    }
    // 数据
    var dataManage = {
        // 获取分页数据
        getPagingData : function(config){
            var pageListAll = config.pageListAll;
            var pageList = [];
            var pageLength = config.pageLength;
            var arr = [];
            for(var i=0; i<pageListAll.length; i++){
                if(i%pageLength == 0 && i != 0){
                    pageList.push(arr);
                    arr = [];
                }
                arr.push(pageListAll[i]);
            }
            if(arr.length > 0){
                pageList.push(arr);
            }
            return pageList;
        },
        // 获取分页数据
        getPagingDataByList : function(list, config){
            var pageList = [];
            var pageLength = config.pageLength;
            var arr = [];
            for(var i=0; i<list.length; i++){
                if(i%pageLength == 0 && i != 0){
                    pageList.push(arr);
                    arr = [];
                }
                arr.push(list[i]);
            }
            pageList.push(arr);
            return pageList;
        },
        // 获取数据通过type
        getPageListData : function(config, callBackFunc){
            switch(config.type){
                case 'page':
                    NetstarTPEditor.api.pageList.get({start:1, length:1000, type:'page'}).then((function(_config, _callBackFunc){
                        return function(pageListAll){
                            if(typeof(_callBackFunc) == "function"){
                                _callBackFunc(pageListAll, _config);
                            }
                        }
                    })(config, callBackFunc))
                    break;
            }
        },
        // 获取搜索数据
        getSearchDataByText : function(text, config){
            var pageListAll = config.pageListAll;
            if(text === ''){
                return pageListAll;
            }
            var list = [];
            for(var i=0; i<pageListAll.length; i++){
                var pageData = pageListAll[i];
                if(typeof(pageData.id) == "string" && pageData.id.indexOf(text) > -1){
                    list.push(pageData);
                    continue;
                }
                if(typeof(pageData.enName) == "string" && pageData.enName.indexOf(text) > -1){
                    list.push(pageData);
                    continue;
                }
                if(typeof(pageData.chnName) == "string" && pageData.chnName.indexOf(text) > -1){
                    list.push(pageData);
                    continue;
                }
            }
            return list;
        }

    }
    var funcManage = {
        delete : function(deleteId, callBackFunc){
            var ajaxConfig = {
                url : getRootPath() + '/formdesigner/formControls/delById',
                type : 'POST',
                data : {
                    id : deleteId,
                },
                contentType : 'application/x-www-form-urlencoded',
                plusData : {
                    callBackFunc : callBackFunc
                }
            }
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                if(res.success){
                    nsAlert('删除成功');
                    if(typeof(_ajaxConfig.plusData.callBackFunc) == "function"){
                        _ajaxConfig.plusData.callBackFunc()
                    }
                }
            });
        }
    }
    // 初始化
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
        // 
        panelManage.showDialog(config);
    }
    return {
        init : init,
        configs : configs,
        getConfig : configManage.getConfig,
    }
})()

// changeHandlerData 
NetstarTPEditor.changeHandlerData = (function(){
    var configs = {};
    // var config = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
                nsAlert('组件列表面板配置错误，id必须配置', 'error');
                console.error('组件列表面板配置错误，id必须配置:', config);
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            var data = config.data;
            var arr = panelManage.tabs;
            for(var i=0; i<arr.length; i++){
                if(typeof(data[arr[i].value]) != "object"){
                    data[arr[i].value] = {};
                }
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
    // tab面板管理
    var panelManage = {
        otherClassName : 'nsRestoreDefaultObj',
        tabs : [
            { text : "readonly", value: "readonly", isSelected: true },
            { text : "hidden", value: "hidden" },
            { text : "disabled", value: "disabled" },
            { text : "value", value: "value" },
        ],
        footerHtml : '<div class="btn-group">'
                        + '<button class="btn btn-info" ns-name="confirm">'
                            + '<span>确认</span>'
                        + '</button>'
                        + '<button class="btn btn-info" ns-name="close">'
                            + '<span>取消</span>'
                        + '</button>'
                    + '</div>',
        formArr : [
            {
                id : "className",
                type : "text",
                label : "值",
            },{
                id : "className2",
                type : "checkbox",
                label : "其它",
                subdata : [
                    {
                        value : "1",
                        name : '',
                    }
                ],
            },{
                id : "select",
                type : "checkbox",
                label : "选择",
            }
        ],
        getFormConfig : function(bodyId, config){
            var formArr = panelManage.formArr;
            formArr[0].changeHandler = function(obj){
                var value = obj.value;
                var editObj = {
                    id:'className2',
                }
                if(value.length > 0){
                    editObj.hidden = true;
                    editObj.value = '';
                }else{
                    editObj.hidden = false;
                }
                NetstarComponent.editComponents([editObj], bodyId);
            }
            formArr[1].changeHandler = function(obj){
                var value = obj.value;
                var editObj = {
                    id:'className',
                }
                if(value == 1){
                    editObj.hidden = true;
                    editObj.value = '';
                }else{
                    editObj.hidden = false;
                }
                NetstarComponent.editComponents([editObj], bodyId);
            }
            formArr[2].subdata = config.changeSelectData;
            var formConfig = {
                id : bodyId,
                isSetMore : false,
                defaultComponentWidth : '100%',
                form : formArr,
            }
            return formConfig;
        },
        initDialog : function(dialogConfig){
            var _dialogConfig = {
                id : dialogConfig.dialogId,
                title : dialogConfig.title,
                shownHandler : function(obj){
                    var objConfig = obj.config;
                    var bodyId = objConfig.bodyId;
                    var footerIdGroup = objConfig.footerIdGroup;
                    // 表单
                    var formConfig = panelManage.getFormConfig(bodyId, dialogConfig.config);
                    var formVal = $.extend(true, {}, dialogConfig.value);
                    
                    var className = formVal.className;
                    if(className == panelManage.otherClassName){
                        formVal.className2 = '1';
                        formVal.className = '';
                    }
                    NetstarComponent.formComponent.show(formConfig, formVal);
                    // 按钮
                    var btnsConfig = {
                        id : footerIdGroup,
                        confirmHandler : function(){
                            var formValue = NetstarComponent.getValues(bodyId);
                            funcManage.edit(dialogConfig.type, formValue, dialogConfig.value, dialogConfig.config, function(){
                                panelManage.tableInit(dialogConfig.config);
                                NetstarComponent.dialog[dialogConfig.dialogId].vueConfig.close();
                            });
                        },
                        closeHandler : function(){
                            NetstarComponent.dialog[dialogConfig.dialogId].vueConfig.close()
                        },
                    }
                    panelManage.btnsInit(btnsConfig);
                }
            }
            NetstarComponent.dialogComponent.init(_dialogConfig);
        },
        addInit : function(config){
            var dialogConfig = {
                dialogId : 'changehandlerdata-edit',
                title : '新增',
                type : "add",
                value : {},
                config : config,
            }
            panelManage.initDialog(dialogConfig);
        },
        editInit : function(value, config){
            var dialogConfig = {
                dialogId : 'changehandlerdata-edit',
                title : '编辑',
                type : "edit",
                value : value,
                config : config,
            }
            panelManage.initDialog(dialogConfig);
        },
        // 按钮初始化
        btnsInit : function(config){
            var id = config.id;
            var $footerContainer = $('#' + id);
            var footerHtml = panelManage.footerHtml;
            var $footer = $(footerHtml);
            var $btns = $footer.children('button');
            $btns.off('click');
            $btns.on('click', function(ev){
                var $this = $(this);
                var nsName = $this.attr('ns-name');
                switch(nsName){
                    case 'confirm':
                        config.confirmHandler();
                        break;
                    case 'close':
                        config.closeHandler();
                        break;
                }
            });
            $footerContainer.append($footer);
        },
        // table 表格的点击事件
        tableEvent:function($table, config){
            var $btns = $table.find('button');
            $btns.off('click');
            $btns.on('click', function(ev){
                var $this = $(this);
                var nsType = $this.attr('ns-type');
                var $thisTr = $this.closest('tr');
                var nsName = $thisTr.attr('ns-name');

                var $td = $thisTr.children().eq(1);
                var $span = $td.children('span');
                var valueNameArr = [];
                if($span.length == 0){
                }else{
                    for(var index=0; index<$span.length; index++){
                        valueNameArr.push($span.eq(index).attr('ns-name'));
                    }
                }
                var lineData = {
                    className: nsName,
                    select: valueNameArr.toString(),
                }
                switch(nsType){
                    case 'edit':
                        panelManage.editInit(lineData, config);
                        break;
                    case 'delete':
                        funcManage.del(lineData, config);
                        break;
                }
            });
        },
        tableInit : function(config){
            var name = config.showPanelName;
            var tableContainerId = config.tabPanelIds[name];
            var $tableContainer = $('#' + tableContainerId);
			// 获得显示数据列表
            var changeHandlerData = config.data;
            var nameData = changeHandlerData[name];
			var lineHtml = '';
			if($.isEmptyObject(nameData)){
				lineHtml = '<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty">没有数据</td></tr>'
			}else{
				for(var className in nameData){
					var showClassName = className;
					if(className == panelManage.otherClassName){
						showClassName = '其它';
					}
					var onelineHtml = '';
					if($.isEmptyObject(nameData[className])){
						onelineHtml = '<tr ns-name="'+className+'">'
                                            +'<td>'+showClassName+'</td>'
                                            +'<td></td>'
                                            +'<td class="td-btn">'
                                                +'<button class="btn btn-white btn-icon" ns-type="edit"><i class="fa fa-edit"></i>'
                                                +'</button>'
                                                +'<button class="btn btn-white btn-icon" ns-type="delete"><i class="fa fa-trash"></i>'
                                                +'</button>'
                                            +'</td>'
                                        +'</tr>'
				  	}else{
					    var conHtml = '';
						for(conName in nameData[className]){
							if(name == "value"){
								conHtml += '<span>'+conName+':' + nameData[className][conName]+'</span>';
							}else{
								if(nameData[className][conName]){
									conHtml += '<span ns-name="'+conName+'">'+conName+'</span>';
								}
							}
						}
						onelineHtml = '<tr ns-name="'+className+'">'
										+'<td>'+showClassName+'</td>'
										+'<td>'+conHtml+'</td>'
										+'<td class="td-btn">'
											+'<button class="btn btn-white btn-icon" ns-type="edit"><i class="fa fa-edit"></i>'
											+'</button>'
											+'<button class="btn btn-white btn-icon" ns-type="delete"><i class="fa fa-trash"></i>'
											+'</button>'
										+'</td>'
									+'</tr>'
					}
					lineHtml += onelineHtml;
				}
            }
            var tableHtml = '<table class="table table-bordered changehandlertable">'
                                +'<thead>'
                                    +'<tr>'
                                        +'<th>值</th>'
                                        +'<th>设置</th>'
                                        +'<th class="row-control">操作</th>'
                                    +'</tr>'
                                +'</thead>'
                                +'<tbody>'
                                    + lineHtml  
                                +'</tbody>'
                            +'</table>';
            var $table = $(tableHtml);
            panelManage.tableEvent($table, config)
			$tableContainer.html($table);
        },
        // tab面板初始化
        tabInit : function(config){
            var tabConfig = {
                id : config.containerId,
                tab : panelManage.tabs,
                isDefaultShow : true,
                ishaveTabPrev : true,
                panelTitle : {},
                prevConfig : {
                    type : 'btn',
                    btns : [
                        {
                            text : '新增',
                            handler : function(obj){
                                panelManage.addInit(config);
                            }
                        }
                    ]
                },
                completeHandler : function(tabConfig){
                    config.showPanelName = tabConfig.showPanelName;
                    config.tabPanelIds = tabConfig.tabPanelIds;
                    panelManage.tableInit(config);
                },
                switchTabHandler : function(obj){
                    console.log(obj);
                    var currentName = config.showPanelName;
                    if(currentName != obj.name){
                        config.prevShowPanelName = currentName;
                    }else{
                        if(obj.isEvent){
                            return true;
                        }
                    }
                    // 保存当前数据
                    config.showPanelName = obj.name;
                    panelManage.tableInit(config);
                },
            }
            NetstarTPEditor.tabPanel.init(tabConfig);
        },
        // 按钮初始化
        footerInit : function(config){
            var footerId = config.footerId;
            // 按钮
            var btnsConfig = {
                id : footerId,
                confirmHandler : function(){
                    var value = config.data;
                    if(typeof(config.confirmHandler) == "function"){
                        for(var key in value){
                            if($.isEmptyObject(value[key])){
                                delete value[key];
                            }
                        }
                        if($.isEmptyObject(value)){
                            value = '';
                        }
                        config.confirmHandler(value, config);
                    }
                    NetstarComponent.dialog['changehandlerdata'].vueConfig.close()
                },
                closeHandler : function(){
                    NetstarComponent.dialog['changehandlerdata'].vueConfig.close()
                },
            }
            panelManage.btnsInit(btnsConfig);
        },
        init : function(config){
            panelManage.tabInit(config);
            panelManage.footerInit(config);
        }
    }
    // 方法管理
    var funcManage = {
        getEditData : function(type, dialogData, sourceData, config){
            var className = '';
            if(dialogData.className.length>0){
                className = dialogData.className;
            }else{
                if(dialogData.className2 == '1'){
                    className = panelManage.otherClassName;
                }
            }
            if(className == ''){
                nsAlert('没有填写：值/其它','error');
                return false;
            }
            // 恢复默认状态可以选择typeName为空其他不可以
            if(className != panelManage.otherClassName){
                if(dialogData.typeName==''){
                    nsAlert('没有选择changHandler/选择字段','error');
                    console.error('没有选择changHandler/选择字段');
                    return false;
                }
            }
            if(type=='add'){
                if(typeof(config.data[config.showPanelName][className])=='object'){
                    nsAlert('值重复','error');
                    console.error('值重复');
                    return false;
                }
            }else{
                if(className != sourceData.className){
                    if(typeof(config.data[config.showPanelName][className])=='object'){
                        nsAlert('值重复','error');
                        console.error('值重复');
                        return false;
                    }else{
                        delete config.data[config.showPanelName][sourceData.className];
                    }
                }
            }
            return {
                className : className,
                select : dialogData.select,
            }
        },
        edit : function(type, dialogData, sourceData, config, callBackFunc){
            var editData = funcManage.getEditData(type, dialogData, sourceData, config);
            if(!editData){
                return false;
            }
            var className = editData.className;
            var select = editData.select.split(',');
            config.data[config.showPanelName][className] = {};
            var changeHandlerDataClassName = config.data[config.showPanelName][className];
            for(index=0;index<select.length;index++){
                changeHandlerDataClassName[select[index]] = true;
            }
            var changeSelectData = config.changeSelectData;
            for(var i=0; i<changeSelectData.length; i++){
                var fieldId = changeSelectData[i].value;
                if(!changeHandlerDataClassName[fieldId]){
                    changeHandlerDataClassName[fieldId] = false;
                }
            }
            if(typeof(callBackFunc) == "function"){
                callBackFunc();
            }
        },
        del : function(value, config){
            nsConfirm("确认要删除吗？",function(isdelete){
				if(isdelete){
					delete config.data[config.showPanelName][value.className];
                    panelManage.tableInit(config);
				}
			},"success");
        },
    }
    // 初始化
    function init(config){
        // config = _config;
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
        var dialogConfig = {
            id : 'changehandlerdata',
            title : "changeHandler",
            shownHandler : function(obj){
                console.log(obj);
                var objConfig = obj.config;
                var bodyId = objConfig.bodyId;
                var footerIdGroup = objConfig.footerIdGroup;
                config.containerId = bodyId;
                config.footerId = footerIdGroup;
                config.dialogId = bodyId + '-dialog';
                panelManage.init(config);
            }
        }
        NetstarComponent.dialogComponent.init(dialogConfig);
    }
    return {
        init : init,
    }
})()
