NetstarTemplate.draft = (function(){
    var configByPackPage = {};
    // 设置草稿箱默认配置
    var DRAFTBOX = {
        isUse       : true,         // boolean 是否设置草稿箱 默认true 
        fields      : '',           // 草稿箱列表 显示字段
        idField     : '',        //draftId
        // // 通过包名获取草稿箱列表 的ajax配置
        // getListByPackage:{
        //     url : getRootPath() + '/public/static/assets/json/template/draft-getlist.json',
        //     type : 'POST',
        //     dataSrc : 'data',
        // },
        // // 通过id删除草稿数据 的ajax配置
        // deleteById:{
        //     url : getRootPath() + '/public/static/assets/json/template/draft-save.json',
        //     type : 'POST',
        // },
        // // 通过id删除草稿数据 的ajax配置
        // deleteByIds:{
        //     url : getRootPath() + '/public/static/assets/json/template/draft-save.json',
        //     type : 'POST',
        // },
        // // 通过id获取一条草稿数据 的ajax配置
        // getDataById:{
        //     url:'http://',
        //     type:'POST',
        // },
        // // 保存单条草稿 的ajax配置
        // saveData:{
        //     url : getRootPath() + '/public/static/assets/json/template/draft-save.json',
        //     type : 'POST',
        // }
    }
    // ajax获取草稿箱数据
    function getListByPackage(config, callBackFunc){
        var plusData = $.extend(true, {}, config.draftBox.getListByPackage);
        var _package = config.package;
        var packageArr = _package.split('.');
        if(!isNaN(Number(packageArr[packageArr.length-1]))){
            _package = _package.substring(0, _package.lastIndexOf(packageArr[packageArr.length-1])-1);
        }
        plusData.package = config.package;
        var ajaxConfig = {
            url : plusData.url,
            type : plusData.type,
            plusData : plusData,
            data : {
                formName : _package,
            }
        };
        if(plusData.contentType){
            ajaxConfig.contentType = plusData.contentType;
        }
        plusData.dataSrc = typeof(plusData.dataSrc) == 'string' ? plusData.dataSrc : 'rows';
        plusData.callBackFunc = callBackFunc;
        NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            if(res.success){
                var plusData = _ajaxConfig.plusData;
                var data = res[plusData.dataSrc];
                var _config = configByPackPage[plusData.package];
                if(typeof(plusData.callBackFunc)=="function"){
                    plusData.callBackFunc(data, _config);
                }
            }else{
                nsAlert('获取草稿列表失败');
                console.error(res);
                console.error(_ajaxConfig);
            }
        })
    }
    // config设置
    var configManager = {
        // 获取默认的草稿字段
        getDefaultFields : function(config){
            var fields = '';
            var components = config.components;
            for(var i=0; i<components.length; i++){
                if(components[i].type == 'vo'){
                    var field = components[i].field;
                    for(var fieldI=0; fieldI<field.length; fieldI++){
                        fields += field[fieldI].id + ',';
                    }
                }
            }
            if(fields.length > 0){
                fields = fields.substring(0, fields.length-1);
            }
            return fields;
        },
        // 获取格式获得草稿箱字段
        getFormatFields : function(config){
            var fields = config.draftBox.fields;
            var components = config.components;
            var formatFields = {};
            var fieldArr = fields.split(',');
            var templateType = 'PC';
            if(config.template == "processDocBaseMobile"){
                templateType = "MOBILE";
            }
            for(var i=0; i<fieldArr.length; i++){
                if(fieldArr[i].indexOf('.') == -1){
                    formatFields[fieldArr[i]] = '';
                    continue;
                }
                var fieldArrList = fieldArr[i].split('.');
                if(typeof(formatFields[fieldArrList[0]]) != 'object'){
                    formatFields[fieldArrList[0]] = {
                        nsType : 'list',
                        fields : {},
                    };
                }
                formatFields[fieldArrList[0]].fields[fieldArrList[1]] = '';
            }
            for(var i=0; i<components.length; i++){
                var type = components[i].type;
                var component = components[i];
                switch(type){
                    case 'vo':
                        var componentField = component.field;
                        for(var fieldI=0; fieldI<componentField.length; fieldI++){
                            var fieldId = componentField[fieldI].id;
                            var isSet = typeof(formatFields[fieldId]) == "object" || formatFields[fieldId] === ""; // 是否设置配置
                            if(typeof(formatFields[fieldId]) == "object"){
                                if(formatFields[fieldId].config.type != "hidden" && !formatFields[fieldId].config.hidden){
                                    isSet = false;
                                }
                            }

                            if(isSet){
                                formatFields[fieldId] = {
                                    nsType : 'vo',
                                    id : fieldId,
                                    name : componentField[fieldI].label,
                                    config : componentField[fieldI],
                                    containerId : component.id,
                                    templateType : templateType,
                                };
                            }
                        }
                        break;
                    case 'list':
                        var keyField = component.keyField;
                        if(typeof(formatFields[keyField]) != "object"){
                            break;
                        }
                        var formatFieldsList = formatFields[keyField].fields;
                        var componentField = component.field;
                        for(var fieldI=0; fieldI<componentField.length; fieldI++){
                            var fieldId = componentField[fieldI].field;
                            if(formatFieldsList[fieldId] === ''){
                                formatFieldsList[fieldId] = {
                                    nsType : 'list',
                                    id : fieldId,
                                    name : componentField[fieldI].title,
                                    config : componentField[fieldI],
                                    containerId : component.id,
                                    templateType : templateType,
                                };
                            }
                        }
                        break;
                }
            }
            // 删除格式化数据中 ‘’ 表示表格中没有配置这一项 暂时不写

            return formatFields;
        },
        // 设置模板的草稿箱配置
        setConfig : function(config){
            if(typeof(config.draftBox) != 'object'){
                config.draftBox = {
                    isUse : false,
                };
            }
            if(!config.draftBox.isUse){
                // 设置false 不设置草稿箱 返回
                return;
            }
            config.draftBox.isShowAllBtns = config.draftBox.isShowAllBtns ? config.draftBox.isShowAllBtns : false;
            if(config.draftBox.isShowAllBtns){
                config.draftBox.isSaveBtn = true; // 默认不显示保存草稿按钮
                config.draftBox.isDraftsBtn = true; //  默认显示草稿箱
            }
            config.draftBox.isSaveBtn = config.draftBox.isSaveBtn ? config.draftBox.isSaveBtn : false; // 默认不显示保存草稿按钮
            config.draftBox.isDraftsBtn = config.draftBox.isDraftsBtn ? config.draftBox.isDraftsBtn : true; //  默认显示草稿箱
            if(typeof(nsDraft) == "object"){
                var _nsDraft = $.extend(true, {}, nsDraft);
                for(var key in _nsDraft){
                    DRAFTBOX[key] = _nsDraft[key];
                }
            }else{
                console.error('没有配置nsDraft');
            }
            // 格式化默认值
            for(var key in DRAFTBOX){
                if(typeof(DRAFTBOX[key]) == "object"){
                    if(typeof(DRAFTBOX[key].url) == "string"){
                        DRAFTBOX[key].url = getRootPath() + DRAFTBOX[key].url;
                    }
                }
            }
            var keyArr = ['getListByPackage', 'deleteById', 'deleteByIds', 'getDataById', 'saveData'];
            for(var i=0; i<keyArr.length; i++){
                if(typeof(DRAFTBOX[keyArr[i]]) != "object"){
                    // 默认配置不完整 不设置草稿箱 返回
                    console.error('默认配置不完整,不设置草稿箱');
                    console.error(DRAFTBOX);
                    return;
                }
            }
            configByPackPage[config.package] = config;
            nsVals.setDefaultValues(config.draftBox, DRAFTBOX);
            var draftBox = config.draftBox;
            // 设置field 没有设置默认 vo中的所有字段
            draftBox.fields = draftBox.fields === '' ? configManager.getDefaultFields(config) : draftBox.fields;
            // 通过fields 获取格式化的fields
            draftBox.formatFields = configManager.getFormatFields(config);
        }
    } 
    // 按钮管理器
    var btnManager = {
        html : '<div class="btn-group">'
                    + '<div class="pt-btn-group">'
                        + '<button class="pt-btn pt-btn-default" :class="{hide:!isSaveBtn}" :disabled="disabled" @click="save">保存草稿</button>'
                        + '<button class="pt-btn pt-btn-default" :class="{hide:!isDraftsBtn}" :disabled="disabled" @click="show">草稿箱</button>'
                    + '</div>'
                + '</div>',
        getData : function(config){
            var data = {
                disabled : false,
                isSaveBtn : config.draftBox.isSaveBtn, // 是否显示保存草稿按钮
                isDraftsBtn : config.draftBox.isDraftsBtn, // 是否显示草稿箱按钮
            };
            return data;
        },
        // 设置草稿箱按钮状态
        setBtnState : function(config, isDisabled){
             config.draftBox.btnsVue.disabled = isDisabled;
        },
        // 通过字段配置获取value值的显示数据
        getShowDataByFieldConfig : function(value, fieldConfig, voData){
            var showData = '';
            function getVoShowData(component){
                var str = '';
                switch(component.type){
                    case 'radio':
                    case 'select':
                    case 'checkbox':
                        var subdata = component.subdata;
                        if(!$.isArray(subdata)){
                            str = value;
                            break;
                        }
                        var valueField = component.valueField;
                        var textField = component.textField;
                        if($.isArray(value)){
                            for(var i=0; i<value.length; i++){
                                str += value[textField] + ',';
                            }
                            break;
                        }
                        value = value.toString();
                        var valArr = value.split(',');
                        for(var i=0; i<valArr.length; i++){
                            for(var subI=0; subI<subdata.length; subI++){
                                if(valArr[i] === subdata[subI][valueField]){
                                    str += subdata[subI][textField] + ',';
                                }
                            }
                        }
                        break;
                    case 'business':
                        var textField = component.textField;
                        value = NetstarComponent.commonFunc.getBusinessValueByVo(component, voData);
                        if($.isArray(value)){
                            for(var i=0; i<value.length; i++){
                                str +=  value[i][textField] + ',';
                            }
                        }else{
                            str =  value[textField];
                        }
                        break;
                    case 'provinceselect':
                        str = NetstarComponent.provinceselectTab.getNameByVal(value);
                        break;
                    case 'date':
                        var format = component.format ? component.format : nsVals.default.dateFormat;
                        if(format.indexOf(' ') > -1){
                            var formatArr = format.split(' ');
                            formatArr[0] = formatArr[0].toUpperCase();
                            formatArr[1] = formatArr[1].replace(/M|S/g, function(a){return a.toLowerCase()});
                            format = formatArr[0] + ' ' + formatArr[1];
                        }else{
                            format = format.toUpperCase();
                        }
                        str = moment(value).format(format);
                        break;
                    default:
                        str = value;
                        break;
                }
                if(str.length > 0 && str[str.length-1] === ','){
                    str = str.substring(0, str.length-1);
                }
                return str;
            }
            function getListShowData(component){
                var str = '';
                if(typeof(component.editConfig) != "object"){
                    str = value;
                }else{
                    str = getVoShowData(component.editConfig);
                }
                return str;
            }
            switch(fieldConfig.nsType){
                case 'vo':
                    var containerId = fieldConfig.containerId;
                    var componentId = fieldConfig.id;
                    if(fieldConfig.templateType == "PC"){
                        var voComponent = NetstarComponent.config[containerId].config[componentId];
                    }else{
                        var voComponent = nsForm.data[containerId].formInput[componentId];
                    }
                    showData = getVoShowData(voComponent);
                    break;
                case 'list':   
                    var containerId = fieldConfig.containerId;
                    var fieldId = fieldConfig.id;
                    var listComponent = NetStarGrid.configs[containerId].gridConfig.columnById[fieldId];
                    if(fieldConfig.templateType == "PC"){
                        var listComponent = NetStarGrid.configs[containerId].gridConfig.columnById[fieldId];
                    }else{
                        var listComponent = NetstarBlockListM.configs[containerId].gridConfig.columnById[fieldId];
                    }
                    showData = getListShowData(listComponent);
                    break;
            }
            return showData;
        },
        // 通过格式化的draftBox.field-->formatFields,获取保存的字段数据
        getDraftfieldsJson : function(draftBox, pageData){
            var _this = this;
            var formatFields = draftBox.formatFields;
            var draftfieldsJson = {}; // 格式 {"urgency":{"nsType":"vo","value":"1"},"child":{"nsType":"list","fields":{"code":"商品编号,ILCE-7RM2"}}}
            for(var key in pageData){
                if(pageData[key] === ''){
                    continue;
                }
                if(!formatFields[key]){
                    continue;
                }
                var formatField = formatFields[key];
                switch(formatField.nsType){
                    case 'vo':
                        // draftfieldsJson[key] = pageData[key];
                        draftfieldsJson[key] = _this.getShowDataByFieldConfig(pageData[key], formatField, pageData);
                        break;
                    case 'list':
                        if(!$.isArray(pageData[key])){
                            break;
                        }
                        var formatListFields = formatField.fields;
                        var pageDataArr = pageData[key];
                        for(var listKey in formatListFields){
                            var fieldValues = '';
                            for(var i=0; i<pageDataArr.length; i++){
                                if(pageDataArr[i][listKey]){
                                    // fieldValues += pageDataArr[i][listKey] + ',';
                                    fieldValues += _this.getShowDataByFieldConfig(pageDataArr[i][listKey], formatListFields[listKey], pageDataArr[i]) + ',';
                                }
                            }
                            if(fieldValues.length > 0){
                                fieldValues = fieldValues.substring(0, fieldValues.length-1);
                                var keyName = key + '-' + listKey;
                                draftfieldsJson[keyName] = fieldValues;
                            }
                        }
                        break;
                }
            }
            draftfieldsJson = JSON.stringify(draftfieldsJson); 
            return draftfieldsJson;
        },
        // 格式化页面树数据
        getFormatPageData : function(pageData, config){
            var components = config.components;
            var _components = {};
            var delcomponents = {};
            for(var i=0; i<components.length; i++){
                switch(components[i].type){
                    case 'vo':
                        var fields = components[i].field;
                        for(var j=0; j<fields.length; j++){
                            var field = fields[j];
                            if(field.readonly || field.disabled || field.hidden || field.type == "hidden"){}else{
                                _components[field.id] = field;
                            }
                        }
                        break;
                }
            }
            for(var i=0; i<components.length; i++){
                switch(components[i].type){
                    case 'vo':
                        var fields = components[i].field;
                        for(var j=0; j<fields.length; j++){
                            var field = fields[j];
                            if(!_components[field.id]){
                                delcomponents[field.id] = field;
                            }
                        }
                        break;
                }
            }
            for(var key in pageData){
                if(delcomponents[key]){
                    delete pageData[key];
                }
            }
            return pageData;
        },
        // 保存草稿
        save : function(config, callBackFunc){
            var _this = this;
            var pageData = NetstarTemplate.templates[config.template].getPageData(config.package, false, false);
            // pageData = btnManager.getFormatPageData(pageData, config);
            var draftfieldsJson = _this.getDraftfieldsJson(config.draftBox, pageData);
            var _package = config.package;
            var packageArr = _package.split('.');
            if(!isNaN(Number(packageArr[packageArr.length-1]))){
                _package = _package.substring(0, _package.lastIndexOf(packageArr[packageArr.length-1])-1);
            } 
            var saveData = {
                formName        : _package,               // 包名
                draftJson       : JSON.stringify(pageData),                     // 页面数据 （和保存数据格式形同，调用保存时获取数据方法）
                draftfieldsJson : draftfieldsJson,       // 显示字段
            }
            if(typeof(config.draftBox.useDraftId)!="undefined"){
                saveData.draftId = config.draftBox.useDraftId;
                for(var key in config.draftBox.draftInfo){
                    saveData[key] = config.draftBox.draftInfo[key];
                }
            }
            saveData.objectState = typeof(saveData.draftId) == "undefined" ? NSSAVEDATAFLAG.ADD : NSSAVEDATAFLAG.EDIT;
            var ajaxConfig = $.extend(true, {}, config.draftBox.saveData);
            ajaxConfig.data = saveData;
            // btnManager.setBtnState(config, true);
            ajaxConfig.plusData = {
                callBackFunc : callBackFunc,
                saveData : saveData,
            }
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                var plusData = _ajaxConfig.plusData;
                if(res.success){
                    var _config = configByPackPage[plusData.saveData.formName];
                    delete _config.draftBox.useDraftId;
                    nsAlert('保存成功');
                }else{
                    nsAlert('保存失败');
                }
                if(typeof(plusData.callBackFunc) == "function"){
                    var obj = {
                        ajaxConfig : _ajaxConfig,
                        data : res,
                    }
                    plusData.callBackFunc(obj);
                }
                // btnManager.setBtnState(config, false);
            },true)
        },
        show : function(config){
            getListByPackage(config, function(data, _config){
                draftManager.init(data, _config);
            })
        },
        getHtml : function(id){
            return '<div class="btn-group" id="' + id +'">'
                        + '<div class="pt-btn-group">'
                            + '<button class="pt-btn pt-btn-default" :class="{hide:!isSaveBtn}" :disabled="disabled" @click="save">保存草稿</button>'
                            + '<button class="pt-btn pt-btn-default" :class="{hide:!isDraftsBtn}" :disabled="disabled" @click="show">草稿箱</button>'
                        + '</div>'
                    + '</div>'
        },
        init : function(config){
            if(config.draftBox.isUse == false){
                // 设置false 不设置草稿箱 返回
                return;
            }
            var containerFooterId = config.containerFooterId;
            var containerFooterBtnsId = config.containerFooterId + '-draft';
            var data = btnManager.getData(config);
            // var html = btnManager.html;
            var html = btnManager.getHtml(containerFooterBtnsId);
            $('#' + containerFooterId).append(html);
            config.draftBox.btnsVue = new Vue({
                el: '#' + containerFooterBtnsId,
                data: data,
                methods : {
                    save : function(){
                        btnManager.save(config);
                    },
                    show : function(){
                        btnManager.show(config);
                    },
                }
            });

        }
    }
    // 草稿箱管理器
    var draftManager = {
        // 草稿箱keyField
        draftIdName : 'draftId',
        voFieldWidth : 100,
        listFieldWidth : 200,
        btnHtml : '<div class="btn-group">'
                    + '<div class="pt-btn-group">'
                        + '<button class="pt-btn pt-btn-default" ns-type="delete">批量删除</button>'
                        + '<button class="pt-btn pt-btn-default" ns-type="close">关闭</button>'
                    + '</div>'
                + '</div>',
        // 列配置
        columns : [
            {
                field : 'userName',
                title : '创建人'
            },{
                field : 'whenCreated',
                title : '创建时间',
                columnType: 'date',
                formatHandler: {
                    type: 'date',
                    data: {
                        formatDate: 'YYYY-MM-DD HH:mm:ss'
                    }
                },
            }
            // ,{
            //     field : 'draftfieldsJson',
            //     title : '页面配置',
            //     width : 300,
            // }
        ],
        // 获取格式化数据 通过content获取contentStr 设置正在显示的数据为只读
        getFormatData2 : function(data, config){
            var formatFields = config.draftBox.formatFields;
            function getContentStr(content){
                var str = '';
                for(var key in content){
                    if(content[key] === ''){
                        continue;
                    }
                    if(!formatFields[key]){
                        continue;
                    }
                    var formatField = formatFields[key];
                    switch(formatField.nsType){
                        case 'vo':
                            str += formatField.name + ':' + content[key] + ';';
                            break;
                        case 'list':
                            if(!$.isArray(content[key])){
                                break;
                            }
                            var conStr = '';
                            for(var listKey in formatField){
                                if(listKey == 'nsType'){
                                    continue;
                                }
                                var contentArr = content[key];
                                for(var i=0; i<contentArr.length; i++){
                                    if(contentArr[i][listKey]){
                                        conStr += contentArr[i][listKey] + ',';
                                    }
                                }
                                if(conStr.length > 0){
                                    conStr = formatField[listKey] + conStr + ';';
                                    str += conStr;
                                }
                            }
                            break;
                    }
                }
                return str;
            }
            // 没有用了 用于格式化显示
            // for(var i=0; i<data.length; i++){
            //     var dataObj = data[i];
            //     var content = JSON.parse(dataObj.content);
            //     var contentStr = getContentStr(content);
            //     dataObj.contentStr = contentStr;
            // }
            var draftId = config.draftBox.useDraftId;
            this.setDataByReadonlyId(data, draftId, this.draftIdName);
            return data;
        },
        // 获取格式化数据和列配置
        getFormatData : function(data, config){
            for(var i=0; i<data.length; i++){
                var dataObj = data[i];
                var draftfieldsJson = JSON.parse(dataObj.draftfieldsJson);
                for(var key in draftfieldsJson){
                    dataObj[key] = draftfieldsJson[key];
                }
            }
            var draftId = config.draftBox.useDraftId;
            this.setDataByReadonlyId(data, draftId, this.draftIdName);
            return data;
        },
        getFormatColumns : function(config){
            var _this = this;
            var columns = $.extend(true, [], this.columns);
            var formatFields = config.draftBox.formatFields;
            for(var key in formatFields){
                var formatField = formatFields[key];
                var obj = {};
                switch(formatField.nsType){
                    case 'vo':
                        obj = {
                            field : key,
                            title : formatField.name,
                            width : _this.voFieldWidth,
                        }
                        break;
                    case 'list':
                        var formatListFields = formatField.fields;
                        for(var listKey in formatListFields){
                            obj = {
                                field : key + '-' + listKey,
                                title : formatListFields[listKey].name,
                                width : _this.listFieldWidth,
                            }
                        }
                        break;
                }
                columns.push(obj);
            }
            return columns;
        },
        // 设置数据只读 通过只读id
        setDataByReadonlyId : function(data, draftId, idField){
            for(var i=0; i<data.length; i++){
                if(data[i][idField] == draftId && typeof(draftId) != "undefined"){
                    data[i]['NETSTAR-TRDISABLE'] = true;
                }else{
                    data[i]['NETSTAR-TRDISABLE'] = false;
                }
            }
        },
        // 通过id 删除数据 ajax
        deleteById : function(config, id){
            var ajaxConfig = $.extend(true, {}, config.draftBox.deleteById);
            ajaxConfig.data = {
                id : id,
                objectState : NSSAVEDATAFLAG.DELETE,
            };
            ajaxConfig.plusData = {
                package : config.package,
            }
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                if(res.success){
                    var plusData = _ajaxConfig.plusData;
                    var _config = configByPackPage[plusData.package];
                    draftManager.refreshByAjax(_config)
                    nsAlert('删除成功');
                }else{
                    nsAlert('删除失败');
                }
            })
        },
        // 通过ids 删除数据 ajax
        deleteByIds : function(config, rowsData){
            var ids = '';
            var idField = this.draftIdName;
            for(var i=0; i<rowsData.length; i++){
                ids += rowsData[i][idField] + ',';
            }
            ids = ids.substring(0, ids.length-1);
            var ajaxConfig = $.extend(true, {}, config.draftBox.deleteByIds);
            ajaxConfig.data = {
                ids : ids,
                objectState : NSSAVEDATAFLAG.DELETE,
            };
            ajaxConfig.plusData = {
                package : config.package,
            }
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                if(res.success){
                    var plusData = _ajaxConfig.plusData;
                    var _config = configByPackPage[plusData.package];
                    draftManager.refreshByAjax(_config)
                    nsAlert('删除成功');
                }else{
                    nsAlert('删除失败');
                }
            })
        },
        // 使用数据 模板赋值 记录config.draftBox.useDraftId
        useDataToPage : function(data, config){
            config.draftBox.useDraftId = data[this.draftIdName];
            NetstarTemplate.templates[config.template].setValueByDraft(data, config.package);
        },
        // 通过行数据设置页面
        useDataByRowData : function(rowData, config){
            var _this = this;
            var idField = _this.draftIdName;
            // var content = JSON.parse(rowData.content);
            var draftId = rowData[idField];
            // content[idField] = draftId;
            // _this.useDataToPage(content, config);
            // _this.readonlyById(config, draftId);
            var ajaxConfig = $.extend(true, {}, config.draftBox.getDataById);
            ajaxConfig.data = {
                id : draftId,
            };
            var dataSrc = typeof(ajaxConfig.dataSrc) == "string" ? ajaxConfig.dataSrc : 'data';
            ajaxConfig.plusData = {
                package : config.package,
                dataSrc : dataSrc,
                draftId : draftId,
                draftIdName : idField,
                draftManager:_this
            }
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                if(res.success){
                    var plusData = _ajaxConfig.plusData;
                    var _dataSrc = plusData.dataSrc;
                    var _draftId = plusData.draftId;
                    var _draftIdName = plusData.draftIdName;
                    var package = plusData.package;
                    var _config = configByPackPage[package];
                    var data = res[_dataSrc];
                    if(typeof(data) == "object"){
                        var draftJson = data.draftJson;
                        draftJson = JSON.parse(draftJson);
                        draftJson[_draftIdName] = _draftId;
                        draftManager.useDataToPage(draftJson, _config);
                        _config.draftBox.draftInfo = {
                            whenCreated : data.whenCreated,
                            createdById : data.createdById,
                        };
                        //区分mobile和pc根据模版名字
                        var isMobile = false;
                        switch(_config.template){
                            case 'processDocBaseMobile':
                                isMobile = true;
                                break;
                        }
                        if(isMobile){
                            plusData.draftManager.refreshUseRowDataByMobile(_config,_draftId);
                        }else{
                            plusData.draftManager.refreshUseRowDataByPC(_config,_draftId);
                        }
                    }else{
                        nsAlert('后台返会值错误');
                        console.error(res);
                        console.error(_ajaxConfig);
                    }
                }else{
                    nsAlert('获取草稿数据失败');
                    console.error(res);
                    console.error(_ajaxConfig);
                }
            }, true)
        },
        //sjj 20190717 通过行数据设置值调用ajax完成之后的操作方法
        refreshUseRowDataByPC:function(_config,_draftId){
            draftManager.readonlyById(_config, _draftId);
            draftManager.closeDialogEvent(_config.draftBox.showConfig.dialogId);
        },
        refreshUseRowDataByMobile:function(_config,_draftId){
            draftManager.setReadonlyById(_config,_draftId);
            $('.mobilewindow-fullscreen').remove();
        },
        // 获取行按钮配置
        getTableRowsBtns : function(config){
            var _this = this;
            var btns = [
                {
                    text: 'X',
					handler: function (data){
                        nsConfirm('确定删除？', function(isDelete){
                            if(isDelete){
                                var gridConfig = NetStarGrid.configs[config.draftBox.showConfig.tableId].gridConfig;
                                _this.deleteById(config, data.rowData[gridConfig.data.idField]);
                            }
                        }, 'warning');
                        
					},
					html: '<span>删除</span>'
                },{
                    text: '使用',
					handler: function (data){
                        _this.useDataByRowData(data.rowData, config);
					},
					html: '<span>使用</span>'
                }
            ]
            return btns;
        },
        // 通过id设置表格只读
        readonlyById : function(config, id){
            var tabConfigs = NetStarGrid.configs[config.draftBox.showConfig.tableId];
            var gridConfig = tabConfigs.gridConfig;
            var originalRows = $.extend(true, [], tabConfigs.vueConfig.data.originalRows);
            var idField = gridConfig.data.idField;
            this.setDataByReadonlyId(originalRows, id, idField);
            tabConfigs.vueConfig.data.originalRows = originalRows;
        },
        // 通过id设置表格只读
        setReadonlyById : function(config, id){
            var gridId = 'draf-grid-'+config.id;
            var tabConfigs = NetstarBlockListM.configs[gridId];
            var gridConfig = tabConfigs.gridConfig;
            var originalRows = $.extend(true, [], tabConfigs.vueConfig.data.originalRows);
            var idField = gridConfig.data.idField;
            this.setDataByReadonlyId(originalRows, id, idField);
            tabConfigs.vueConfig.data.originalRows = originalRows;
        },
        // 通过ajax刷新表格
        refreshByAjax : function(config){
            getListByPackage(config, function(data, _config){
                _config.draftBox.showConfig.resData = data;
                var resData = $.extend(true, [], config.draftBox.showConfig.resData);
                var refreshData = draftManager.getFormatData(resData, config);
                NetStarGrid.configs[_config.draftBox.showConfig.tableId].vueConfig.data.originalRows = refreshData;
            })
        },
        // 批量删除事件
        deleteEvent : function(tableId, config){
            var _this = this;
            var rowsData = NetStarGrid.getCheckedData(tableId);
            if(rowsData.length > 0){
                nsConfirm('确定删除？', function(isDelete){
                    if(isDelete){
                        _this.deleteByIds(config, rowsData);
                    }
                }, 'warning');
            }else{  
                nsAlert('没有选中数据', 'warning');
                console.warn('没有选中数据');
                console.warn(config);
            }
        },
        // 关闭弹框事件
        closeDialogEvent : function(dialogId){
            NetstarComponent.dialog[dialogId].vueConfig.close();
        },
        // 显示表格
        show : function(config, dialogConfig){
            var _this = this;
            var bodyId = dialogConfig.bodyId; // 显示表格容器Id
            var footerIdGroup = dialogConfig.footerIdGroup; // 显示表格容器Id
            config.draftBox.showConfig.tableId = bodyId;
            config.draftBox.showConfig.tableBtnId = footerIdGroup;
            var resData = $.extend(true, [], config.draftBox.showConfig.resData);
            var gridConfig = {
                id: bodyId,
                columns : _this.getFormatColumns(config),
                data : {
                    idField : _this.draftIdName,
                    dataSource : _this.getFormatData(resData, config),
                },
                ui : {
                    tableRowBtns        : _this.getTableRowsBtns(config),           // 行内按钮
                    isCheckSelect       : true,                                     // 是否多选   
                    rowdbClickHandler   : function(rowData, vueDataData, vueData, gridConfig){
                        _this.useDataByRowData(rowData, config);
                    },                    
                }
            };
            NetStarGrid.init(gridConfig);
            // 生成按钮
            var btnHtml = _this.btnHtml;
            var $btnContainer = $('#' + footerIdGroup);
            var $btnContent = $(btnHtml);
            var $buttons = $btnContent.find('button');
            $buttons.off('click');
            $buttons.on('click', function(ev){
                var $button = $(ev.currentTarget);
                var nsType = $button.attr('ns-type');
                switch(nsType){
                    case 'delete':
                        _this.deleteEvent(bodyId, config);
                        break;
                    case 'close':
                        _this.closeDialogEvent(dialogConfig.id);
                        break;
                }
            });
            $btnContainer.append($btnContent);
        },
        // 初始化草稿箱
        init : function(resData, config){
            var _this = this;
            config.draftBox.showConfig = {};
            config.draftBox.showConfig.resData = resData;
            var id = 'draft-' + config.package.replace(/\./g, '-') + '-dialog'
            config.draftBox.showConfig.dialogId = id;
            var dialogConfig = {
                id: id,
                title: '草稿箱列表',
                templateName: 'PC',
                width: 700,
                height: 500,
                shownHandler : function(obj){
                    var dialogConfig = obj.config;
                    _this.show(config, dialogConfig);
                },
            }
            NetstarComponent.dialogComponent.init(dialogConfig);
        },
    }
    return {
        setBtns             : btnManager.init,              // 设置草稿箱按钮
        setConfig           : configManager.setConfig,      // 设置模板的config 添加相关常量
        configByPackPage    : configByPackPage,             // 所有config 通过packpage存储
        configManager       : configManager,
        btnManager          : btnManager,
        draftManager        : draftManager,
        getListByPackage    : getListByPackage,
    }
})(jQuery)