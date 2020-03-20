NetstarExcelImport = (function($){
    var configsById = {};
    // ajax管理
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isValid = true;
            if(config.type == 'common'){
                if($('#' + config.id).length == 0){
                    isValid = false;
                    console.error('导入id配置错误');
                    console.error(config);
                }
            }
            // 验证全局变量nsExcelImport是否存在 不存在错误
            if(isValid){
                isValid = typeof(nsExcelImport) == "object";
            }
            if(isValid){
                isValid = typeof(nsExcelImport.upload) == "object" && typeof(nsExcelImport.upload.url) == "string";
            }
            if(isValid){
                isValid = typeof(nsExcelImport.history) == "object" && typeof(nsExcelImport.history.url) == "string";
            }
            if(isValid){
                isValid = typeof(nsExcelImport.getTitle) == "object" && typeof(nsExcelImport.getTitle.url) == "string";
            }
            if(isValid){
                isValid = typeof(nsExcelImport.getExcelData) == "object" && typeof(nsExcelImport.getExcelData.url) == "string";
            }
            if(isValid){
                isValid = typeof(nsExcelImport.import) == "object" && typeof(nsExcelImport.import.url) == "string";
            }
            if(isValid){
                isValid = typeof(nsExcelImport.downloadById) == "object" && typeof(nsExcelImport.downloadById.url) == "string";
            }
            if(isValid){
                isValid = typeof(nsExcelImport.downloadByRecordId) == "object" && typeof(nsExcelImport.downloadByRecordId.url) == "string";
            }
            if(isValid){
                isValid = typeof(nsExcelImport.getExcelByPage) == "object" && typeof(nsExcelImport.getExcelByPage.url) == "string";
            }
            return isValid;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {   
                type :          'dialog',                    // 默认类型 弹框  其它类型：common
                title :         '导入标题',                   // 导入标题
                templateId :     '',

                downloadText :  '点击下载导入数据模板',
                recordId :      false,
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            var _nsExcelImport = $.extend(true, {}, nsExcelImport);
            for(var key in _nsExcelImport){
                _nsExcelImport[key].url = getRootPath() + _nsExcelImport[key].url;
                if(key == "import"){
                    _nsExcelImport[key].url += config.templateId + '/';
                }
                config[key] = _nsExcelImport[key];
            }
            config.saveTabData = {};
        },
        // 获取config
        getConfigById : function(id){
            return configsById[id] && configsById[id].config ? configsById[id].config : false;
        },
    }
    // 进度条管理
    var progress = {
        TEMPLATE : '<div class="pt-step">'
                        +'<ul>'
                            + '<li v-for="nav in navs" :class="[{current:nav.name==currentProgress},{complete:nav.isComplete}]">'
                                + '<span>{{nav.title}}</span>'
                            + '</li>'
                        + '</ul>'
                    +'</div>',
        getHtml : function(){
            var html = this.TEMPLATE;
            return html;
        },
        getNavsData : function(type){
            var completeArrObj = {
                upload : [false, false, false],
                import : [true, false, false],
                complete : [true, true, false],
            }
            var navs = [
                { title : "文档上传" , name : "upload" },
                { title : "云端导入" , name : "import" },
                { title : "完成" , name : "complete" },
            ];
            var completeArr = completeArrObj[type];
            for(var i=0; i<navs.length; i++){
                navs[i].isComplete = completeArr[i];
            }
            return navs;
        },
        getData : function(config){
            var navs = progress.getNavsData('upload');
            var data = {
                navs : navs,
                currentProgress : 'upload',
            };
            return data;
        },
        init : function(config){
            var html = progress.getHtml();
            var data = progress.getData(config);
            var progressId = config.proHeadId;
            var $progress = $('#' + progressId);
            // 插入html
            $progress.html(html);
            // vue初始化
            config.vue.progress = new Vue({
                el: '#' + progressId,
                data: data,
                watch: {
                },
                methods: {
                },
                mounted: function(){
                }
            });
        },
    }
    // 上传管理 导入容器
    var uploadManage = {
        columns : [
            {
                "field": 'fileName',
                "title": '导入名称',
                "width": 270
            },
            {
                "field": 'whenStart',
                "title": '导入时间',
                "width": 130,
                "formatHandler": {
                    "type": 'date',
                    "data": {'formatDate': 'YYYY-MM-DD HH:ss:mm'},
                }
            },
            {
                "field": 'finishTime',
                "title": '完成时间',
                "width": 130,
                "formatHandler": {
                    "type": 'date',
                    "data": {'formatDate': 'YYYY-MM-DD HH:ss:mm'},
                }
            },
            {
                "field": 'doneFlag',
                "title": '是否完成',
                "width": 108,
                "formatHandler": {
                    "type": 'dictionary',
                    "data": {
                        '1': '是',
                        '0': '否'
                    }
                }
            }
        ],
        getGridConfig : function(config){
            var columns = uploadManage.columns;
            var dataSource = $.extend(true, [], config.historyData);
            var ui = {
                selectMode : 'single',
                height : 220,
                dragWidth : false,
                isUseHotkey : false,
                pageLengthDefault : 5,
                // toPageMenu: toPageMenu,
                selectedHandler : function(rowData, $data, vueData, gridConfig){
                    var id = rowData.id;
                    config.recordId = id;
                    var $upload = $('#' + config.uploadId);
                    $upload.val('');
                    $upload.next().text('');
                    config.vue.btns.btnsConfig.start.disabled = false;
                }
            };
            var data = {
                dataSource : dataSource,
                tableID : config.bodyContent,
                idField : '',
            }
            var grid = {
                columns : columns,
                ui : ui,
                data : data,
            }
            return grid;
        },
        // 获取历史数据
        getHistoryData : function(config, callBackFunc){
            var historyAjax = $.extend(true, {}, config.history);
            historyAjax.plusData = {
                callBackFunc : callBackFunc,
                id : config.id,
            }
            historyAjax.data = {templateId : config.templateId};
            NetStarUtils.ajax(historyAjax, function(res, ajaxConfig){
                if(res.success){
                    var dataSrc = ajaxConfig.dataSrc;
                    var data = typeof(dataSrc) == "string" && $.isArray(res[dataSrc]) ? res[dataSrc] : res;
                    if(typeof(ajaxConfig.plusData.callBackFunc) == "function"){
                        var _config = configManage.getConfigById(ajaxConfig.plusData.id);
                        ajaxConfig.plusData.callBackFunc(data, _config);
                    }
                }
            });
        },
        getHtml : function(config){
            var html = '<div class="" id="' + config.bodyTop + '">'
                            + '<div class="text-link">'
                                // + '<a href="javascript:NetStarUtils.download({url:\'' + config.downloadById.url + '/' + config.templateId + '\',fileName:\'' + config.templateId + '.xlsx\'});" class="templateLink btn btn-white">'
                                + '<a href="' + config.downloadById.url + '/' + config.templateId + '" class="templateLink btn btn-white">'
                                    + '<i class="fa-download"></i>'
                                    + config.downloadText
                                + '</a>'
                            + '</div>'
                        + '</div>'
                        + '<div class="" id="' + config.bodyContent + '">'
                        +'</div>'
                        + '<div class="" id="' + config.bodyBottom + '">'
                            + '<form class="input-file">'
                                + '<input class="form-control" type="file" accept="text/xlsx" name="file" id="' + config.uploadId + '">'
                                + '<span class="file-name"></span>'
                            + '</form>'
                        +'</div>'
            return html;
        },
        setEvent : function($body, config){
            var $upload = $body.find('#' + config.uploadId);
            $upload.off('change');
            $upload.on('change', function(ev){
                var $this = $(this);
                var $span = $this.next();
                var val = ev.target.value;
                var valname = val.substring(val.lastIndexOf("\\")+1);
                $span.text(valname);
                config.recordId = false;
                config.vue.btns.btnsConfig.start.disabled = false;
            });
        },
        init : function(config){
            // 获取并插入html
            var html = uploadManage.getHtml(config);
            var containerId = config.proBodyId;
            var $container = $('#' + containerId);
            var $body = $(html);
            uploadManage.setEvent($body, config);
            $container.html($body);
            // 获取data
            uploadManage.getHistoryData(config, function(data, _config){
                config.historyData = data;
                var gridConfig = uploadManage.getGridConfig(config);
                NetStarGrid.init(gridConfig);
            });
        },
        show : function(config){
            uploadManage.init(config);
            // 改变进度条
            config.vue.progress.currentProgress = 'upload';
            config.vue.progress.navs = progress.getNavsData('upload');
            // 改变按钮
            config.vue.btns.btnsConfig = btnsManage.getBtnsData('upload', config);
        },
    }
    // 导入管理
    var importManage = {
        gridCheckedField : 'netstarCheckboxSelectedFlag',
        nav : {
            TEMPLATE : '<ul class="nav nav-tabs">'
                            + '<li v-for="nav in navs" :class="[{current:nav.name==currentName}]" @click="click($event,nav)">'
                                + '<a herf="#">'
                                    + '<span>' 
                                        + '{{nav.title}}'
                                        // + '<span class="pt-badge pt-badge-warning">{{nav.num}}</span>'
                                    + '</span>'
                                + '</a>'
                            + '</li>'
                        + '</ul>',
            getData : function(config){
                var navs = [];
                var sourceTitleData = config.sourceTitleData;
                for(var i=0; i<sourceTitleData.length; i++){
                    navs.push({
                        title : sourceTitleData[i].name,
                        name : sourceTitleData[i].name
                    });
                }
                var data = {
                    navs : navs,
                    currentName : config.showExcelName,
                }
                return data;
            },
            getHtml : function(){
                return this.TEMPLATE;
            },
            init : function(config){
                // 获取并插入html
                var html = this.getHtml(config);
                var containerId = config.bodyNavId;
                var $container = $('#' + containerId);
                $container.html(html);
                // 获取data
                var data = this.getData(config);
                // 初始化vue
                config.vue.importNavs = new Vue({
                    el: '#' + containerId,
                    data: data,
                    watch: {
                    },
                    methods: {
                        // upload
                        // 上传change事件 设置文件名
                        click : function(ev, nav){
                            var currentName = this.currentName;
                            var clickName = nav.name;
                            if(currentName === clickName){ return; }
                            this.currentName = clickName;
                            config.showExcelName = clickName;
                            importManage.refreshTable(config);
                        },
                    },
                    mounted: function(){
                    }
                });
            }
        },
        // 字段对应表
        getToField : function(rowData){
            var engToChi = {};
            var chiToEng = {};
            var id = "edit-";
            var num = 0;
            for(var key in rowData){
                chiToEng[key] = id + num;
                engToChi[id + num] = key;
                num ++
            }
            return {
                engToChi : engToChi,
                chiToEng : chiToEng,
            }
        },
        getImportData : function(config){
            var saveTabData = config.saveTabData;
            var importData = [];
            for(var key in saveTabData){
                var obj = {
                    name : key,
                    data : {},
                }
                var data = saveTabData[key];
                for(var index in data){
                    var _obj = $.extend(true, {}, data[index]);
                    if(_obj.isError){
                        var isError = false;
                        for(var name in _obj){
                            if(typeof(_obj[name]) == "object"){
                                isError = true;
                                break;
                            }
                        }
                        if(!isError){
                            delete _obj.isError;
                        }
                    }
                    obj.data[index] = data[index];
                }
                importData.push(obj);
            }
            return importData;
        },
        // 获取保存行数据 通过toField
        getSaveRow : function(data, tofield){
            var _data = {};
            for(var key in data){
                _data[tofield.engToChi[key]] = data[key];
            }
            return _data;
        },
        // 设置保存数据
        setSaveTabData : function(data, rowIndex, config){
            var saveTabData = config.saveTabData;
            var showExcelName = config.showExcelName;
            saveTabData[showExcelName] = typeof(saveTabData[showExcelName]) == "object" ? saveTabData[showExcelName] : {};
            saveTabData[showExcelName][rowIndex] = data;
        },
        updateData : function(data, rowIndex, config) {
            var updateDataAjax = $.extend(true, {}, config.update);
            updateDataAjax.url += config.recordId;
            var tableName = config.showExcelName;
            updateDataAjax.data = {
                editedRow: data,
                name: tableName,
                rowIndex: rowIndex
            };
            NetStarUtils.ajax(updateDataAjax, function(data){
                if(data.success){
                    nsalert('编辑成功');
                }
            });
        },
        getHtml : function(config){
            var html = '<div class="" id="' + config.bodyTop + '">'
                            + '<div class="" id="' + config.bodyNavId + '"></div>'
                            + '<div class="text-link">'
                                + '<a href="' + config.downloadByRecordId.url + '?recordId=' + config.recordId + '" class="templateLink btn btn-white">'
                                    + '<i class="fa-download"></i>'
                                    + '点击下载此次数据'
                                + '</a>'
                            + '</div>'
                            + '<div class="fixd-offside">'
                                + '<input type="checkbox" id="' + config.bodyError + '">'
                                + '<label class="checkbox-inline" for="' + config.bodyError + '">只显示错误信息</label>'
                            + '</div>'
                        + '</div>'
                        + '<div class="error-box hide" id="' + config.errorBoxId + '"></div>'
                        + '<div class="" id="' + config.bodyContent + '">'
                        +'</div>'
            return html;
        },
        // 弹框编辑
        editRow : function(config, editConfig){
            var rowData = editConfig.rowData;
            var gridId = editConfig.gridId;
            var rowIndex = editConfig.rowIndex;
            var form = [];
            var tofield = this.getToField(rowData);
            for(var key in rowData){
                if(key == "isError"){ continue; }
                var editCom = {
                    id : tofield.chiToEng[key],
                    type : 'text',
                    label : key,
                    value : rowData[key],
                }
                form.push(editCom);
            }
            var dialogConfig = {
                id:             config.id + '-edit',
                title:          '编辑',
                templateName:   'PC',
                width :         550,
                // height :        400,
                shownHandler:   function (data) {
                    var dialogBodyId = data.config.bodyId;
                    var footerIdGroup = data.config.footerIdGroup;
                    var formConfig = {
                        id: dialogBodyId,
                        templateName: 'form',
                        componentTemplateName: 'PC',
                        defaultComponentWidth:'50%',
                        form : form,
                    }
                    NetstarComponent.formComponent.show(formConfig);
                    var btnsHtmnl = '<div class="pt-btn-group">' 
                                        + '<button ns-type="confirm" class="pt-btn pt-btn-default">保存</button>'
                                        + '<button ns-type="close" class="pt-btn pt-btn-default">取消</button>'
                                    + '</div>';
                    var $btnsHtml = $(btnsHtmnl);
                    var $btns = $btnsHtml.children('button');
                    $btns.off('click');
                    $btns.on('click', function(){
                        var $this = $(this);
                        var nsType = $this.attr('ns-type');
                        switch(nsType){
                            case 'confirm':
                                var formData = NetstarComponent.getValues(dialogBodyId);
                                var data = importManage.getSaveRow(formData, tofield);
                                importManage.setSaveTabData(data, rowIndex, config);
                                var originalRows = $.extend(true, [], NetStarGrid.configs[config.bodyContent].vueConfig.data.originalRows);
                                originalRows[rowIndex] = data;
                                NetStarGrid.configs[config.bodyContent].vueConfig.data.originalRows = originalRows;
                                NetstarComponent.dialog[config.id + '-edit'].vueConfig.close();
                                importManage.updateData(data, rowIndex, config);
                                break;
                            case 'close':
                                NetstarComponent.dialog[config.id + '-edit'].vueConfig.close();
                                break;
                        }
                    });
                    $('#' + footerIdGroup).append($btnsHtml);
                },
            }
            NetstarComponent.dialogComponent.init(dialogConfig);
        },
        delRow : function(config, editConfig){
            var rowData = editConfig.rowData;
            var gridId = editConfig.gridId;
            var rowIndex = editConfig.rowIndex;
            var deleteData = $.extend(true, {}, config.deleteData);
            deleteData.url += config.recordId;
            var tableName = config.showExcelName;
            deleteData.data = {
                editedRow: rowData,
                name: tableName,
                rowIndex: rowIndex
            };
            deleteData.plusData = {
                gridId : gridId,
            }
            NetStarUtils.ajax(deleteData, function(data, _ajaxConfig){
                if(data.success){
                    NetStarGrid.refreshById(_ajaxConfig.plusData.gridId);
                    nsalert('删除成功');
                }
            });
        },
        getGridConfig : function(config){
            var titleData = config.titleData;
            var columns = $.isArray(titleData[config.showExcelName]) ? titleData[config.showExcelName] : [];
            var ui = {
                isEditMode : false,
                height : 270,
                isAllowAdd : false,
                // isHaveEditDeleteBtn : true,
                originalRowsChangeHandler : function(newRowsData, oldRowsData){
                    setTimeout(function(){
                        importManage.setTableEvent(config);
                    },0);
                },
                // 设置行显示数据
                setRowShowDataHandler : function(rowData){
                    if(rowData.deleted == 1){
                        rowData['NETSTAR-TRDISABLE'] = true;
                    }
                },
                tableRowBtns : [
                    {
                        text : '编辑',
                        handler: function (data) {
                            console.log(config);
                            console.log([data.rowData, data.gridId, data.rowIndex]);
                            importManage.editRow(config, data);
                        },
                    },
                    {
                        text : 'X',
                        handler: function (data) {
                            console.log([data.rowData, data.gridId, data.rowIndex]);
                            nsConfirm('确定删除吗？', function(isDelete){
                                if(isDelete){
                                    importManage.delRow(config, data);
                                }
                            })
                        },
                    }
                ],
            }
            if($('#' + config.bodyContent)){
                $('#' + config.bodyContent).children().remove();
            }
            var data = {
                // dataSource : dataSource,
                tableID : config.bodyContent,
                idField : '',
                isServerMode : true,
                src : config.getExcelByPage.url,
                dataSrc : config.getExcelByPage.dataSrc,
                data : { name : config.showExcelName, recordId : config.recordId, errorOnly : config.showExcelError }
            }
            var grid = {
                columns : columns,
                ui : ui,
                data : data,
            }
            return grid;
        },
        setDridData : function(config){
            var titleData = config.titleData;
            var _titleData = {};
            for(var i=0; i<titleData.length; i++){
                var name = titleData[i].name;
                var fields = titleData[i].fields
                var _fields = [];
                for(var j=0; j<fields.length; j++){
                    var obj = {
                        title : fields[j].name,
                        field : fields[j].name,
                        width : Number(fields[j].width),
                        editable : true,
                        columnType : 'func',
                        isEditByFunc : true,
                        styleObj : {
                        },
                        formatHandler : function(value, rowData, columnConfig){
                            if(value == null){
                                value = '';
                            }
                            if(typeof(value) == "object"){
                                return '<span class="pt-td-error" data-errormsg="' + value.errorMsg + '">' + value.value + '</span>';
                            }else{
                                return value;
                            }
                        },
                        valueFormatHandler : function(value, rowData, columnConfig){
                            if(value == null){
                                value = '';
                            }
                            if(typeof(value) == "object"){
                                return value.value;
                            }else{
                                return value;
                            }
                        },
                    }
                    _fields.push(obj);
                }
                _titleData[name] = _fields;

            }
            config.sourceTitleData = $.extend(true, [], titleData);
            config.titleData = _titleData;
            config.showExcelName = titleData[0] ? titleData[0].name : '';
        },
        getExcelTitle : function(config){
            var showExcel = config.titleData[config.showExcelName];
            return showExcel;
        },
        // 获取表题数据
        getTitleData : function(config, callBackFunc){
            var getTitle = $.extend(true, {}, config.getTitle);
            getTitle.plusData = {
                id : config.id,
                callBackFunc : callBackFunc,
            }
            // getTitle.data = {recordId : config.recordId};
            getTitle.data = {templateId : config.templateId};
            NetStarUtils.ajax(getTitle, function(res, ajaxConfig){
                if(res.success){
                    var dataSrc = ajaxConfig.dataSrc;
                    var data = typeof(dataSrc) == "string" && $.isArray(res[dataSrc]) ? res[dataSrc] : res;
                    if(typeof(ajaxConfig.plusData.callBackFunc) == "function"){
                        var _config = configManage.getConfigById(ajaxConfig.plusData.id);
                        ajaxConfig.plusData.callBackFunc(data, _config);
                    }
                }
            });
        },
        setEvent : function($body, config){
            var $selectError = $body.find('#' + config.bodyError);
            $selectError.off('change');
            $selectError.on('change', function(ev){
                var $this = $(this);
                var isCheck = $this.is(':checked');
                var $label = $this.next();
                config.showExcelError = isCheck;
                if(isCheck){
                    $label.addClass('checked');
                }else{
                    $label.removeClass('checked');
                }
                importManage.refreshTable(config);
            });
        },
        // 设置表格事件
        setTableEvent : function(config){
            var tableId = config.bodyContent;
            var $table = $('#' + tableId);
            var $errorTd = $table.find('.pt-td-error').closest('td');
            $errorTd.off('mouseover');
            $errorTd.on('mouseover', function(ev){
                ev.stopPropagation();
                var $this = $(this);
                var $errorSpan = $this.find('.pt-td-error');
                var $errorBox = $('#' + config.errorBoxId);
                var errorMsg = $errorSpan.data('errormsg');
                $errorBox.text(errorMsg);
                $errorBox.removeClass('hide');
                // 计算位置
                var offset = $this.offset();
                var top = offset.top;
                var left = offset.left;
                var height = $this.height();
                var width = $this.width();
                var widthBox = $errorBox.width();
                var _left = left - (widthBox-width)/2;
                $errorBox.attr('style', 'position:fixed;z-index:9999;top:'+ (top+height) +'px;left:'+ _left +'px;');
            });
            $errorTd.off('mouseout');
            $errorTd.on('mouseout', function(ev){
                var $this = $(this);
                var $errorBox = $('#' + config.errorBoxId);
                $errorBox.addClass('hide');
            });
        },
        refreshTable : function(config){
            var gridConfig = importManage.getGridConfig(config);
            NetStarGrid.init(gridConfig);
            importManage.setTableEvent(config);
        },
        init : function(_config){
            importManage.getTitleData(_config, function(data, config){
                config.titleData = data;
                config.showExcelError = false;
                var containerId = config.proBodyId;
                var $container = $('#' + containerId);
                // 获取并插入html
                var html = importManage.getHtml(config);
                var $body = $(html);
                importManage.setEvent($body, config);
                $container.html($body);
                importManage.setDridData(config);
                importManage.nav.init(config);
                var gridConfig = importManage.getGridConfig(config);
                NetStarGrid.init(gridConfig);
                importManage.setTableEvent(config);
            });
        },
        show : function(config){
            importManage.init(config);
            // 改变进度条
            config.vue.progress.currentProgress = 'import';
            config.vue.progress.navs = progress.getNavsData('import');
            // 改变按钮
            config.vue.btns.btnsConfig = btnsManage.getBtnsData('import', config);
        }
    }
    // 完成管理
    var completeManage = {
        TEMPLATE : '<template v-if="success">'
                        +'<div class="loading-data">'
                            + '<i class="icon-check-circle"></i><h4>导入成功</h4>'
                        + '</div>'
                        // + '<ul class="statistics">'
                        //     + '<li class="statistics-item" v-for="obj in list">'
                        //         + '<span>{{obj.num}}</span>'
                        //         + '<span>{{obj.title}}</span>'
                        //     + '</li>'
                        // + '</ul>'
                    + '</template>'
                    + '<template v-else>'
                        + '<div class="loading-data">'
                            + '<i class="icon-close-circle"></i><h4>导入失败</h4>'
                        + '</div>'
                    + '</template>',
        getHtml : function(){
            var html = this.TEMPLATE;
            return html;
        },
        getData : function(config, type){
            var success = true;
            switch(type){
                case 'uploadFail':
                case 'importFail':
                    success = false;
                    break;
                default:
                    break;
            };
            var data = {
                success : success,
            }
            return data;
        },
        init : function(config, type){
            var html = completeManage.getHtml();
            var data = completeManage.getData(config, type);
            var proBodyId = config.proBodyId;
            var $container = $('#' + proBodyId);
            // 插入html
            $container.html(html);
            // vue初始化
            config.vue.complete = new Vue({
                el: '#' + proBodyId,
                data: data,
            });
        },
        show : function(config, type){
            var success = true;
            this.init(config, type);
            switch(type){
                case 'complete':
                    // 改变进度条
                    config.vue.progress.navs = progress.getNavsData(type);
                    config.vue.progress.currentProgress = 'complete';
                    // 改变按钮
                    config.vue.btns.btnsConfig = btnsManage.getBtnsData(type, config);
                    break;
                case 'uploadFail':
                case 'importFail':
                    // 改变按钮
                    config.vue.btns.btnsConfig = btnsManage.getBtnsData(type, config);
                    break;
                default:
                    break;
            };
        },
    }
    // 按钮管理
    var btnsManage = {
        TEMPLATE : '<div class="pt-btn-group">'
                        + '<button v-for="btnConfig in btnsConfig" class="pt-btn pt-btn-default" :class="{hide:btnConfig.isHide}" :disabled="btnConfig.disabled" :ns-type="btnConfig.type" @click="click($event,btnConfig)">{{btnConfig.title}}</button>'
                    + '</div>',
        getHtml : function(){
            var html = this.TEMPLATE;
            return html;
        },
        getBtnsData : function(type, config){
            var btns = {
                start : { title:'开始导入', isHide:false, type:'start', disabled:true },
                confirm : { title:'确认导入', isHide:true, type:'confirm', disabled:false },
                returnStart : { title:'返回', isHide:true, type:'returnStart', disabled:false },
                returnConfirm : { title:'返回', isHide:true, type:'returnConfirm', disabled:false },
                complete : { title:'完成', isHide:true, type:'complete', disabled:false },
                cancel : { title:'取消', isHide:false, type:'cancel', disabled:false },
            };
            switch(type){
                case 'upload':
                    break;
                case 'import':
                    btns.start.isHide = true;
                    btns.confirm.isHide = false;
                    btns.returnStart.isHide = false;
                    break;
                case 'complete':
                    btns.start.isHide = true;
                    btns.complete.isHide = false;
                    break;
                case 'uploadFail':
                    btns.start.isHide = true;
                    btns.returnStart.isHide = false;
                    break;
                case 'importFail':
                    btns.start.isHide = true;
                    btns.returnConfirm.isHide = false;
                    break;
                default:
                    break;
            };
            if(config.type != "dialog"){
                btns.cancel.isHide = true;
            }
            return btns;
        },
        getData : function(config){
            var data = {
                btnsConfig : btnsManage.getBtnsData('upload', config),
            }
            return data;
        },
        startUploadByRecordId : function(config, callBackFunc){
            var recordId = config.recordId;
            var getExcelDataAjax = $.extend(true, {}, config.getExcelData);
            getExcelDataAjax.plusData = {
                callBackFunc : callBackFunc,
                id : config.id,
            }
            getExcelDataAjax.data = {recordId : recordId};
            getExcelDataAjax.beforeSend = function(){ setLoading(config); };
            NetStarUtils.ajax(getExcelDataAjax, function(res, ajaxConfig){
                var _config = configManage.getConfigById(ajaxConfig.plusData.id);
                if(res.success){
                    var dataSrc = ajaxConfig.dataSrc;
                    var data = typeof(dataSrc) == "string" && $.isArray(res[dataSrc]) ? res[dataSrc] : res;
                    if(typeof(ajaxConfig.plusData.callBackFunc) == "function"){
                        ajaxConfig.plusData.callBackFunc(res, data, _config);
                    }
                }else{
                    completeManage.show(_config, 'uploadFail');
                }
            }, true);
        },
        startUploadByFile : function(config, callBackFunc){
            var uploadId = config.uploadId;
            var $upload = $('#' + uploadId);
            var staicfile = $upload.prop('files')[0];
            var formData = new FormData();
            formData.append('file', staicfile);
            formData.append('templateId', config.templateId);
            // formData = '';
            var uploadAjax = $.extend(true, {}, config.upload);
            uploadAjax.data = formData;
            uploadAjax.beforeSend = function(){ setLoading(config); };
            uploadAjax.plusData = {
                callBackFunc : callBackFunc,
                id : config.id,
            }
            NetStarUtils.ajax(uploadAjax, function(res, ajaxConfig){
                var _config = configManage.getConfigById(ajaxConfig.plusData.id);
                if(res.success){
                    var dataSrc = ajaxConfig.dataSrc;
                    var data = typeof(dataSrc) == "string" && $.isArray(res[dataSrc]) ? res[dataSrc] : res;
                    if(typeof(ajaxConfig.plusData.callBackFunc) == "function"){
                        ajaxConfig.plusData.callBackFunc(res, data, _config);
                    }
                }else{
                    completeManage.show(_config, 'uploadFail');
                }
            }, true);
        },
        startUpload : function(config){
            function showImportData(res, data, _config){
                // _config.excelData = data;
                _config.recordId = res.id;
                importManage.show(_config);
            }
            if(config.recordId){
                btnsManage.startUploadByRecordId(config, showImportData);
            }else{
                btnsManage.startUploadByFile(config, showImportData);
            }
        },
        importData : function(config, callBackFunc){
            var data = importManage.getImportData(config);
            var importAjax = $.extend(true, {}, config.import);
            importAjax.url += config.recordId;
            importAjax.data = data;
            importAjax.plusData = {
                callBackFunc : callBackFunc,
                id : config.id,
            }
            importAjax.beforeSend = function(){
                setLoading(config);
            }
            NetStarUtils.ajax(importAjax, function(res, ajaxConfig){
                var _config = configManage.getConfigById(ajaxConfig.plusData.id);
                if(res.success){
                    var dataSrc = ajaxConfig.dataSrc;
                    var data = typeof(dataSrc) == "string" && $.isArray(res[dataSrc]) ? res[dataSrc] : res;
                    if(data.length > 0){
                        // 存在错误数据
                        _config.excelData = data;
                        completeManage.show(_config, 'importFail');
                    }else{
                        completeManage.show(_config, 'complete');
                    }
                }else{
                    _config.excelData = config.sourceExcelData;
                    completeManage.show(_config, 'importFail');
                }
            }, true);
        },
        init : function(config){
            var html = btnsManage.getHtml();
            var data = btnsManage.getData(config);
            var btnsId = config.btnsId;
            var $container = $('#' + btnsId);
            // 插入html
            $container.html(html);
            // vue初始化
            config.vue.btns = new Vue({
                el: '#' + btnsId,
                data: data,
                watch: {
                },
                methods: {
                    click : function($event, btnConfig){
                        switch (btnConfig.type) {
                            case 'start':
                                btnsManage.startUpload(config);
                                break;
                            case 'returnStart':
                                uploadManage.show(config);
                                break;
                            case 'confirm':
                                btnsManage.importData(config);
                                break;
                            case 'returnConfirm':
                                importManage.show(config);
                                break;
                            case 'complete':
                                if(typeof(config.completeHandler) == "function"){
                                    config.completeHandler(config.completeData, config);
                                }
                                if(config.type == "dialog"){
                                    NetstarComponent.dialog[config.id].vueConfig.close();
                                }
                                break;
                            case 'cancel':
                                NetstarComponent.dialog[config.id].vueConfig.close();
                                break;
                            default:
                                break;
                        }
                    }
                },
                mounted: function(){
                }
            });
        },
    }
    // 
    var container = {
        getHtml : function(config){
            var html = '<div class="pt-excel-import">'
                        + '<div class="pt-excel-import-header" id="' + config.proHeadId + '">'
                        + '</div>'
                        + '<div class="pt-excel-import-body pt-excel-import-ver2" id="' + config.proBodyId + '">'
                        +'</div>'
                    + '</div>'
            return html;
        },
        init : function(config){
            var html = container.getHtml(config);
            var containerId = config.bodyId;
            var $container = $('#' + containerId);
            $container.html(html);
            config.vue = {}
            // 初始化进度条
            progress.init(config);
            // 初始化内容
            uploadManage.init(config);
            // 初始化按钮
            btnsManage.init(config);
        },
        // 设置导入中 各面板id
        setConfigId : function(config, idConfig){
            var bodyId = idConfig.bodyId;
            config.bodyId = bodyId;
            config.proHeadId = bodyId + '-progress';
            config.proBodyId = bodyId + '-content';
            // config.importNavId = config.proBodyId + '-nav';
            // config.importBodyId = config.proBodyId + '-body';
            config.btnsId = idConfig.footerIdGroup;
            config.bodyTop = config.proBodyId + '-top';
            config.bodyContent = config.proBodyId + '-content';
            config.bodyBottom = config.proBodyId + '-bottom';
            config.uploadId = config.proBodyId + '-bottom-upload';
            config.bodyNavId = config.bodyTop + '-nav';
            config.bodyError = config.bodyTop + '-nav-error';
            config.errorBoxId = config.bodyContent + '-error';
        },
        // 设置面板容器
        setPanelDom : function(config, idConfig){
            var $container = $('#' +　config.id);
            var html = '<div class="">' + config.title + '</div>'
                        + '<div class="" id="' + idConfig.bodyId + '"></div>'
                        + '<div class="" id="' + idConfig.footerIdGroup + '"></div>'
            $container.html(html);
        },
        show : function(config){
            if(config.type == "dialog"){
                var dialogConfig = {
                    id:             config.id,
                    title:          config.title,
                    templateName:   'PC',
                    width :         700,
                    height :        510,
                    isAllowDrag :   false,
                    shownHandler:   function (data) {
                        container.setConfigId(config, data.config);
                        container.init(config);
                    },
                }
                NetstarComponent.dialogComponent.init(dialogConfig);
            }else{
                var idConfig = {
                    bodyId : config.id + '-body',
                    footerIdGroup : config.id + '-footer',
                }
                container.setPanelDom(config, idConfig);
                container.setConfigId(config, idConfig);
                container.init(config);
            }
        }
    }
    // 设置加载中
    function setLoading(config){
        var proBodyId = config.proBodyId;
        var $container = $('#' + proBodyId);
        $container.html('<div class="loading-data"><div class="pt-loading"></div></div>');
    }
    function init(config){
        var isPass = configManage.validConfig(config);
        if(!isPass){
            return;
        }
        configsById[config.id] = {
            source : $.extend(true, {}, config),
            config : config,
        };
        configManage.setConfig(config);
        container.show(config);
    }
    return {
        init : init,
        configsById : configsById,
    }
})(jQuery)
