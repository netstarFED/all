var NetstarExcelImportVer3 = (function($){
    var configs = {};
    // ajax管理
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isValid = true;
            // 验证全局变量nsExcelImport是否存在 不存在错误
            if(isValid){
                isValid = typeof(nsExcelImportVer3) == "object";
            }
            if(isValid){
                isValid = typeof(nsExcelImportVer3.upload) == "object" && typeof(nsExcelImportVer3.upload.url) == "string";
            }
            return isValid;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {   
                type :          'common',                     // 默认类型 导入  其它类型：详情details
                title :         '导入标题',                   // 导入标题
                templateId :     '',                          // 下载模板id
                downloadText :  '点击下载导入数据模板',
                currentType :   'download',
                updateTitle :   '重复导入，是否更新：',
                expression :    '',
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            var _nsImport = $.extend(true, {}, nsExcelImportVer3);
            for(var key in _nsImport){
                _nsImport[key].url = getRootPath() + _nsImport[key].url;
            }
            for(var key in _nsImport){
                config[key] = _nsImport[key];
            }
        },
        // 设置导入中 各面板id
        setConfigId : function(config, idConfig){
            var bodyId = idConfig.bodyId;
            config.bodyId = bodyId;
            config.footerId = idConfig.footerIdGroup;
            switch(config.type){
                case 'common':
                    config.headerId = bodyId + '-header';
                    config.containerBodyId = bodyId + '-container';
                    config.uploadInputId = bodyId + '-upload-input';
                    config.uploadTipsId = bodyId + '-upload-tips';
                    config.uploadRadioId = bodyId + '-upload-form';
                    break;
                case 'details':
                    config.formId = bodyId + '-form';
                    config.containerBodyId = bodyId + '-container';
                    config.downloadId = bodyId + '-container-download';
                    config.infosId = bodyId + '-container-infos';
                    break;
            }
        },
        // 获取config
        getConfig : function(id){
            return configs[id] && configs[id].config ? configs[id].config : false;
        },
    }
    // 
    var panelManage = {
        getTitleHtml : function(config){
            var currentType = config.currentType;
            var Ocurrent = 'current';
            var Tcurrent = '';
            var OCom = '';
            if(currentType == "upload"){
                Ocurrent = '';
                Tcurrent = 'current';
                OCom = 'complete';
            }
            var html = '<div class="import-heade" id="' + config.headerId + '">'
                            +'<div class="import-title '+ Ocurrent +' '+ OCom +'" ns-name="download">下载模板并填写</div>'
                            +'<div class="import-title '+ Tcurrent +'" ns-name="upload">上传导入文件</div>'
                        +'</div>';
            return html;
        },
        getBtnsHtml : function(config){
            var btnShow = {
                upload : {
                    prev : true,
                    next : false,
                    confirm : true,
                    close : true,
                },
                download : {
                    prev : false,
                    next : true,
                    confirm : false,
                    close : true,
                }
            }
            var hideClass = {};
            var btnShowObj = btnShow[config.currentType];
            for(var key in btnShowObj){
                if(!btnShowObj[key]){
                    hideClass[key] = 'hide';
                }else{
                    hideClass[key] = '';
                }
            }
            var html = '<div class="pt-btn-group">'
                            + '<button class="pt-btn pt-btn-default '+ hideClass.next +'" ns-name="next">下一步</button>'
                            + '<button class="pt-btn pt-btn-default '+ hideClass.prev +'" ns-name="prev">上一步</button>'
                            + '<button class="pt-btn pt-btn-default '+ hideClass.confirm +'" ns-name="confirm">确认导入</button>'
                            + '<button class="pt-btn pt-btn-default '+ hideClass.close +'" ns-name="close">关闭</button>'
                        + '</div>'
            return html;
        },
        getBodyHtml : function(config){
            var currentType = config.currentType;
            var html = '';
            switch(currentType){
                case 'download':
                    html = panelManage.getDownBodyHtml(config);
                    break;
                case 'upload':
                    html = panelManage.getUploadBodyHtml(config);
                    break;
            }
            return html;
        },
        getDownBodyHtml : function(config){
            var html = '<div class="import-content-operation">'
                            + '<label>' + config.downloadText + '</label>'
                            + '<button type="button" class="pt-btn pt-btn-default" ns-name="download">'
                                + '<a href="' + config.download.url + config.templateId + '" class="">'
                                    + '下载'
                                + '</a>'
                            + '</button>'
                        + '</div>'
                        + '<div class="import-nstructions">'
                            + '<div class="title">'
                                + '导入说明'
                            + '</div>'
                            + '<div class="import-nstructions-content">'
                                + config.expression
                            + '</div>'
                        + '</div>'
            return html;
        },
        getUploadBodyHtml : function(config){
            var html = '<div class="import-content-operation">'
                            + '<label>上传文件</label>'
                            + '<form class="input-file">'
                                + '<input class="" type="file" accept="text/xlsx" name="file" id="' + config.uploadInputId + '"></input>'
                                + '<span class="tips" id="' + config.uploadTipsId + '"></span>'
                            + '</form>'
                        + '</div>'
                        + '<div class="import-content-operation" id="' + config.uploadRadioId +'">'
                            
                        + '</div>'
            return html;
        },
        initBody : function(config){
            // body
            var bodyHtml = panelManage.getBodyHtml(config);
            var $containerBody = $('#' + config.containerBodyId);
            $containerBody.html(bodyHtml);
            switch(config.currentType){
                case 'download':
                    break;
                case 'upload':
                    // 表单
                    var formConfig = {
                        id : config.uploadRadioId,
                        isSetMore : false,
                        form : [
                            {
                                id : 'isUpdate',
                                label : config.updateTitle,
                                type : 'radio',
                                value : '0',
                                subdata : [
                                    { text : '更新', value : "0"},
                                    { text : '不更新', value : "1"},
                                ],
                            }
                        ],
                    }
                    NetstarComponent.formComponent.show(formConfig);
                    panelManage.setUploadEvent(config);
                    break;
            }
        },
        setUploadEvent : function(config){
            var $upload = $('#' + config.uploadInputId);
            $upload.off('change');
            $upload.on('change', function(ev){
                var $this = $(this);
                var $span = $this.next();
                var val = ev.target.value;
                var valname = val.substring(val.lastIndexOf("\\")+1);
                $span.text(valname);
            });
        },
        initBtnsEvent : function(config){
            var $btnContainer = $('#' + config.footerId);
            var $btns = $btnContainer.find('button');
            $btns.off('click');
            $btns.on('click', function(ev){
                var $this = $(this);
                var nsName = $this.attr('ns-name');
                switch(nsName){
                    case 'next':
                        config.currentType = 'upload';
                        panelManage.refreshByCurrentType(config);
                        break;
                    case 'prev':
                        config.currentType = 'download';
                        panelManage.refreshByCurrentType(config);
                        break;
                    case 'confirm':
                        var data = funcManage.getData(config);
                        if(!data){
                            nsAlert('导入失败，请检查是否上传文件', 'error');
                            consoel.log('导入失败，请检查是否上传文件');
                            return false;
                        }
                        if(typeof(config.confirmHandler) == "function"){
                            config.confirmHandler(data);
                        }
                        config.closeDialog();
                        break;
                    case 'close':
                        config.closeDialog();
                        break;
                }
            });
        },
        refreshByCurrentType : function(config){
            var currentType = config.currentType;
            var $header = $('#' + config.headerId);
            var $headerChild = $header.children();
            $headerChild.removeClass('current');
            $headerChild.removeClass('complete');
            $header.children('[ns-name="'+currentType+'"]').addClass('current');
            if(currentType == 'upload'){
                $header.children('[ns-name="download"]').addClass('complete');
            }
            panelManage.initBody(config);
            var btnShow = {
                upload : {
                    prev : true,
                    next : false,
                    confirm : true,
                    close : true,
                },
                download : {
                    prev : false,
                    next : true,
                    confirm : false,
                    close : true,
                }
            }
            var btnShowObj = btnShow[currentType];
            var $btns = $('#' + config.footerId).find('button');
            for(var i=0; i<$btns.length; i++){
                var $btn = $btns.eq(i);
                var nsName = $btn.attr('ns-name');
                if(btnShowObj[nsName]){
                    $btn.removeClass('hide');
                }else{
                    $btn.addClass('hide');
                }
            }
        },
        init : function(config){
            // 进度条
            var titleHtml = panelManage.getTitleHtml(config);
            var $container = config.$container;
            $container.append(titleHtml);
            // body
            var bodyHtml = '<div class="import-content" id="' + config.containerBodyId + '">'
                            + '</div>'
            $container.append(bodyHtml);
            panelManage.initBody(config);
            // 按钮
            var $btnContainer = $('#' + config.footerId);
            var btnsHtml = panelManage.getBtnsHtml(config);
            $btnContainer.html(btnsHtml);
            panelManage.initBtnsEvent(config);
        },
        showDialog : function(config, callBackFunc){
            var dialogConfig = {
                id:             config.id,
                title:          config.title,
                templateName:   'PC',
                width :         700,
                height :        510,
                isAllowDrag :   false,
                plusClass :     'import-card',
                shownHandler:   function (data) {
                    callBackFunc(data);
                },
            }
            NetstarComponent.dialogComponent.init(dialogConfig);
        },
    }
    // 方法管理
    var funcManage = {
        getData : function(config){
            var formId = config.uploadRadioId;
            var formVals = NetstarComponent.getValues(formId);
            var inputId = config.uploadInputId;
            var $upload = $('#' + inputId);
            var files = $upload.prop('files');
            if(files.length == 0){
                return false;
            }
            var staicfile = files[0];
            var formData = new FormData();
            formData.append('file', staicfile);
            formData.append('templateId', config.templateId);
            formData.append('isUpdate', formVals.isUpdate);
            return formData;
        },
    }
    // 详情面板
    var detailsManage = {
        getHtml : function(config){
            var html = '<div class="import-content-operation" id="' + config.formId + '">'
                        + '</div>'
                        + '<div class="import-nstructions" id="' + config.containerBodyId + '">'
                            + '<div class="title">'
                                + '导入详情'
                                + '<button type="button" title="下载错误数据文件" class="pt-btn pt-btn-link" id="' + config.downloadId + '">'
                                    + '<a href="' + config.downloadDetails.url + '/' + config.templateId + '" class="">下载错误数据文件</a>'
                                + '</button>'
                            + '</div>'
                            + '<div class="import-nstructions-content">'
                                + '<div class="import-nstructions-list" id="' + config.infosId + '">'
                                + '</div>'
                            + '</div>'
                        + '</div>'
            return html;
        },
        initInfos : function(config){
            var infos = config.infos;
            var newQuantity = typeof(infos.newQuantity) == "number" ? infos.newQuantity : 0;
            var updateQuantity = typeof(infos.updateQuantity) == "number" ? infos.updateQuantity : 0;
            var errorQuantity = typeof(infos.errorQuantity) == "number" ? infos.errorQuantity : 0;
            var html = '<ul>'
                            + '<li>新增数据：'+ newQuantity +'条</li>'
                            + '<li>更新数据：'+ updateQuantity +'条</li>'
                            + '<li>错误数据：'+ errorQuantity +'条</li>'
                        + '</ul>'
            var $infosContainer = $('#' + config.infosId);
            $infosContainer.html(html);
        },
        initBtn : function(config){
            var html = '<div class="pt-btn-group">'
                            + '<button class="pt-btn pt-btn-default" ns-name="close">关闭</button>'
                        + '</div>'
            var $btnContainer = $('#' + config.footerId);
            $btnContainer.html(html);
            var $btns = $btnContainer.find('button');
            $btns.off('click');
            $btns.on('click', function(ev){
                var $this = $(this);
                var nsName = $this.attr('ns-name');
                switch(nsName){
                    case 'close':
                        config.closeDialog();
                        break;
                }
            });
        },
        init : function(config){
            var html = detailsManage.getHtml(config);
            var $container = config.$container;
            $container.html(html);
            // 表单
            var formConfig = {
                id : config.formId,
                isSetMore : false,
                form : [
                    {
                        id : 'isUpdate',
                        label : config.updateTitle,
                        type : 'radio',
                        readonly : true,
                        subdata : [
                            { text : '更新', value : "0"},
                            { text : '不更新', value : "1"},
                        ],
                    }
                ],
            }
            NetstarComponent.formComponent.show(formConfig);
            // 详情信息
            detailsManage.initInfos(config);
            // 按钮
            detailsManage.initBtn(config);
        }
    }
    function init(config){
        var isPass = configManage.validConfig(config);
        if(!isPass){
            return;
        }
        configs[config.id] = {
            source : $.extend(true, {}, config),
            config : config,
        };
        configManage.setConfig(config);
        switch(config.type){
            case 'common':
                panelManage.showDialog(config, function(data){
                    configManage.setConfigId(config, data.config);
                    config.$container = $('#' + data.config.bodyId);
                    config.closeDialog = (function(_config){
                        return function(){
                            NetstarComponent.dialog[_config.id].vueConfig.close()
                        }
                    })(config)
                    panelManage.init(config);
                })
                break;
            case 'details':
                panelManage.showDialog(config, function(data){
                    configManage.setConfigId(config, data.config);
                    config.$container = $('#' + data.config.bodyId);
                    config.closeDialog = (function(_config){
                        return function(){
                            NetstarComponent.dialog[_config.id].vueConfig.close()
                        }
                    })(config)
                    detailsManage.init(config);
                })
                break;
        }
    }
    return {
        init : init,
        configs : configs,
    }
})(jQuery)
