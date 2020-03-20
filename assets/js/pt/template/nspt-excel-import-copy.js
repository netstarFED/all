NetstarExcelImport2 = (function($){
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
            if(isValid){
                if(typeof(config.uploadAjax) != "object" || typeof(config.uploadAjax.url) != "string"){
                    isValid = false;
                    console.error('导入配置错误,uploadAjax配置不完整');
                    console.error(config);
                }
            }
            if(isValid){
                if(typeof(config.importAjax) != "object" || typeof(config.importAjax.url) != "string"){
                    isValid = false;
                    console.error('导入配置错误,importAjax配置不完整');
                    console.error(config);
                }
            }
            return isValid;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {   
                type :          'dialog',                    // 默认类型 弹框  其它类型：common
                title :         '导入标题',                   // 导入标题
                columns :       [],                          // 导入返回数据显示tab页显示的列配置
                successField :  'successData',               // 导入返回 成功数据
                repeatField :   'repeatData',                // 导入返回 重复数据
                failField :     'failData',                  // 导入返回 失败数据
            }
            nsVals.setDefaultValues(config, defaultConfig);
            if(typeof(config.importDefaultShow) != "string"){
                config.importDefaultShow = config.successField;  // 导入默认显示的tab页
            }
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            config.uploadAjax.dataSrc = typeof(config.uploadAjax.dataSrc) == "string" ? config.uploadAjax.dataSrc : 'rows';
            config.uploadAjax.type = typeof(config.uploadAjax.type) == "string" ? config.uploadAjax.type : 'GET';
            config.importAjax.dataSrc = typeof(config.importAjax.dataSrc) == "string" ? config.importAjax.dataSrc : 'rows';
            config.importAjax.type = typeof(config.importAjax.type) == "string" ? config.importAjax.type : 'GET';
            config.importAjax.contentType = typeof(config.importAjax.contentType) == "string" ? config.importAjax.contentType : 'application/json';
            if(typeof(config.completeHandler) != "function"){
                config.completeHandler = function(){}
            }
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
        TEMPLATE : '<div class="pt-excel-import-body">'
                        // 上传
                        + '<div class="text-link">'
                            + '<a :href="downloadUrl">'
                                + '<i class="fa-download"></i>'
                                + '点击下载导入数据模板'
                            + '</a>'
                        + '</div>'
                        + '<div class="pt-import-content-tips">'
                            + '<p>将要导入的数据填充到数据导入模板文件中 注意事项：</p>'
                            + '<p>注意事项：</p>'
                            + '<p>1）模板中的表头不可更改，表头行不可删除；</p>'
                            + '<p>2）除必填的列以外，不需要的列可以删除；</p>'
                            + '<p>3）单次导入的数据不超过1000条。</p>'
                        + '</div>'
                        + '<form class="input-file">'
                            + '<input class="form-control" type="file" accept="text/xlsx" name="file" :id="id" @change="setFileName">'
                            + '<span class="file-name">'
                                + '{{fileName}}'
                            + '</span>'
                        + '</form>'
                    + '</div>',
        getData : function(config){
            var importNavs = [
                { title : "成功" , name : "successData" },
                { title : "重复" , name : "repeatData" },
                { title : "错误" , name : "failData" },
            ];
            var data = {
                downloadUrl : config.url,
                id : config.uploadId,
                fileName : '',
            }
            return data;
        },
        getHtml : function(){
            return this.TEMPLATE;
        },
        init : function(config){
            // 获取并插入html
            var html = uploadManage.getHtml(config);
            var containerId = config.proBodyId;
            var $container = $('#' + containerId);
            $container.html(html);
            // 获取data
            var data = uploadManage.getData(config);
            // 初始化vue
            config.vue.upload = new Vue({
                el: '#' + containerId,
                data: data,
                watch: {
                },
                methods: {
                    // upload
                    // 上传change事件 设置文件名
                    setFileName : function(ev){
                        var val = ev.target.value;
                        var valname = val.substring(val.lastIndexOf("\\")+1);
                        this.fileName = valname;
                        config.vue.btns.btnsConfig.start.disabled = false;
                    },
                },
                mounted: function(){
                }
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
                                        + '<span class="pt-badge pt-badge-warning">{{nav.num}}</span>'
                                    + '</span>'
                                + '</a>'
                            + '</li>'
                        + '</ul>',
            getData : function(config){
                var navs = [
                    { title : "成功" , name : config.successField, num : config.importData[config.successField].length },
                    { title : "重复" , name : config.repeatField, num : config.importData[config.repeatField].length },
                    { title : "错误" , name : config.failField, num : config.importData[config.failField].length },
                ];
                var data = {
                    navs : navs,
                    currentName : config.importDefaultShow,
                }
                return data;
            },
            getHtml : function(){
                return this.TEMPLATE;
            },
            init : function(config){
                // 获取并插入html
                var html = this.getHtml(config);
                var containerId = config.importNavId;
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
                            config.gridData[currentName] = {
                                selectData : NetStarGrid.getCheckedData(config.importBodyId),
                                rows : $.extend(true, [], NetStarGrid.configs[config.importBodyId].vueConfig.data.rows)
                            };
                            var tableData = $.extend(true, [], config.importData[nav.name]);
                            if(nav.name == config.failField){
                                for(var i=0; i<tableData.length; i++){
                                    tableData[i]["NETSTAR-TRDISABLE"] = true;
                                }
                            }
                            if(typeof(config.gridData[nav.name]) == "object"){
                                var tableRows = config.gridData[nav.name].rows;
                                for(var i=0; i<tableRows.length; i++){
                                    tableData[i][importManage.gridCheckedField] = typeof(tableRows[i][importManage.gridCheckedField]) == "boolean" ? tableRows[i][importManage.gridCheckedField] : false;
                                }
                            }
                            NetStarGrid.configs[config.importBodyId].vueConfig.data.originalRows = $.isArray(tableData) ? tableData : [];
                            this.currentName = nav.name;
                        },
                    },
                    mounted: function(){
                    }
                });
            }
        },
        getImportData : function(config){
            var currentName = config.vue.importNavs.currentName;
            config.gridData[currentName] = {
                selectData : NetStarGrid.getCheckedData(config.importBodyId),
                rows : $.extend(true, [], NetStarGrid.configs[config.importBodyId].vueConfig.data.rows),
            };
            var gridData = config.gridData;
            var importData = [];
            for(var key in gridData){
                if(gridData[key] && $.isArray(gridData[key].selectData)){
                    importData = importData.concat(gridData[key].selectData);
                }
            }
            // 删除数据中表格添加的显示样式字段
            for(var i=0; i<importData.length; i++){
                delete importData[i][importManage.gridCheckedField];
            }
            return importData;
        },
        getHtml : function(config){
            var html = '<div class="" id="' + config.importNavId + '">'
                        + '</div>'
                        + '<div class="" id="' + config.importBodyId + '">'
                        +'</div>'
            return html;
        },
        getGridConfig : function(config){
            var columns = config.columns;
            var ui = {
                isCheckSelect : true,
                height : 220,
                completeHandler : function(){
                    config.gridData[config.importDefaultShow] = {
                        selectData : [],
                        rows : NetStarGrid.configs[config.importBodyId].vueConfig.data.rows
                    }
                }
            }
            var dataSource = $.extend(true, [], config.importData[config.importDefaultShow]);
            if(config.importDefaultShow == config.successField){
                for(var i=0; i<dataSource.length; i++){
                    dataSource[i][importManage.gridCheckedField] = true;
                }
            }
            var data = {
                dataSource : dataSource,
                tableID : config.importBodyId,
                idField : '',
            }
            var grid = {
                columns : columns,
                ui : ui,
                data : data,
            }
            return grid;
        },
        init : function(config){
            config.gridData = {};
            var containerId = config.proBodyId;
            var $container = $('#' + containerId);
            // 获取并插入html
            var html = importManage.getHtml(config);
            $container.html(html);
            importManage.nav.init(config);
            var gridConfig = importManage.getGridConfig(config);
            NetStarGrid.init(gridConfig);
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
                        + '<ul class="statistics">'
                            + '<li class="statistics-item" v-for="obj in list">'
                                + '<span>{{obj.num}}</span>'
                                + '<span>{{obj.title}}</span>'
                            + '</li>'
                        + '</ul>'
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
            var completeData = config.completeData;
            var list = [
                { title:'成功数据', num:0, name:config.successField },
                { title:'重复数据', num:0, name:config.repeatField  },
                { title:'错误数据', num:0, name:config.failField },
                { title:'导入数据', num:0, name:config.successField }
            ];
            if(completeData){
                for(var i=0; i<list.length; i++){
                    if($.isArray(completeData[list[i].name])){
                        list[i].num = completeData[list[i].name].length;
                    }
                }
            }
            var data = {
                list : list,
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
        startUpload : function(config){
            var uploadId = config.uploadId;
            var $upload = $('#' + uploadId);
            var staicfile = $upload.prop('files')[0];
            var formData = new FormData();
            formData.append("Interfacetype",1);
            formData.append("file",staicfile);
            formData = '';
            var ajaxConfig = {
                url: 		 config.uploadAjax.url,
                type: 		 config.uploadAjax.type,
                // contentType: config.uploadAjax.contentType,
                // processData: false,
                data:   	 formData,
                beforeSend:function(){
                    console.warn(this)
                    setLoading(config);
                },
                plusData : {
                    id : config.id,
                }
            }
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                var _config = configManage.getConfigById(_ajaxConfig.plusData.id);
                if(!_config){
                    return;
                }
                if(res.success){
                    var dataSrc = _config.uploadAjax.dataSrc;
                    var resData = res;
                    if(typeof(dataSrc) == "string"){
                        resData = res[dataSrc];
                    }
                    _config.importData = resData;
                    importManage.show(_config);
                }else{
                    completeManage.show(_config, 'uploadFail')
                }
            }, true);
        },
        importData : function(config){
            var data = importManage.getImportData(config);
            if(data.length == 0){
                nsalert("没有要导入的数据");
            }else{
                var ajaxConfig = {
                    url: 		 config.importAjax.url,
                    type: 		 config.importAjax.type,
                    contentType: config.importAjax.contentType,
                    data:   	 {
                        data : data,
                    },
                    beforeSend:function(){
                        setLoading(config);
                    },
                    plusData : {
                        id : config.id,
                    }
                }
                NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                    var _config = configManage.getConfigById(_ajaxConfig.plusData.id);
                    if(!_config){
                        return;
                    }
                    if(res.success){
                        var dataSrc = _config.importAjax.dataSrc;
                        var resData = res;
                        if(typeof(dataSrc) == "string"){
                            resData = res[dataSrc];
                        }
                        _config.completeData = resData;
                        completeManage.show(_config, 'complete');
                    }else{
                        completeManage.show(_config, 'importFail')
                    }
                }, true);
            }
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
                        + '<div class="pt-excel-import-body" id="' + config.proBodyId + '">'
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
            config.importNavId = config.proBodyId + '-nav';
            config.importBodyId = config.proBodyId + '-body';
            config.btnsId = idConfig.footerIdGroup;
            config.uploadId = config.proBodyId + '-upload';
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
                    width :         600,
                    height :        460,
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
