// 页面显示pageConfig初始化  
// 字段添加默认配置
// 方法添加运行方法
var NetstarProject = (function(){
    var configs = {};
    // 字段管理
    var fieldManager = {
        setFormField : function(fieldConfig, type){
            var netStarRootPathStr = getRootPath();
            switch(fieldConfig.mindjetType){
                case 'dict':
                    if(typeof(nsVals.dictData[fieldConfig.dictArguments])=='undefined'){
                        console.error('无法找到字典数据:'+fieldConfig.dictArguments)
                    }else{
                        fieldConfig.subdata = nsVals.dictData[fieldConfig.dictArguments].subdata;
                    }
                break;
            }
            switch(type){
                case 'text':
                    if(typeof(fieldConfig.remoteAjax)=="string" && fieldConfig.remoteAjax.indexOf('http:') == -1){
                        fieldConfig.remoteAjax = netStarRootPathStr + fieldConfig.remoteAjax;
                    }
                    break;
                //数据处理
                case 'tree-select':
                case 'treeSelect':
                case 'checkbox':
                case 'radio':
                    if(fieldConfig.suffix){
                        fieldConfig.url = netStarRootPathStr + fieldConfig.suffix;
                    }
                    break;
                case 'business':
                case 'businessSelect':
                    if(typeof(fieldConfig.source)=="object"){
                        if(fieldConfig.source.suffix){
                            if(fieldConfig.source.suffix.indexOf(',') > -1 && type == 'business'){
                                var suffixArr = fieldConfig.source.suffix.split(',');
                                var urlStr = '';
                                for(var i=0; i<suffixArr.length; i++){
                                    urlStr += netStarRootPathStr + suffixArr[i] + ',';
                                }
                                urlStr = urlStr.substring(0, urlStr.length-1);
                                fieldConfig.source.url = urlStr;
                            }else{
                                fieldConfig.source.url = netStarRootPathStr + fieldConfig.source.suffix;
                            }
                        }
                    }
                    if(typeof(fieldConfig.search)=="object"){
                        if(fieldConfig.search.suffix){
                            fieldConfig.search.url = netStarRootPathStr + fieldConfig.search.suffix;
                        }
                    }
                    if(typeof(fieldConfig.subdataAjax)=="object"){
                        if(fieldConfig.subdataAjax.suffix){
                            fieldConfig.subdataAjax.url = netStarRootPathStr + fieldConfig.subdataAjax.suffix;
                        }
                    }
                    if(typeof(fieldConfig.getRowData)=="object"){
                        if(fieldConfig.getRowData.suffix){
                            fieldConfig.getRowData.url = netStarRootPathStr + fieldConfig.getRowData.suffix;
                        }
                    }
                    if(typeof(fieldConfig.getFormData)=="object"){
                        if(fieldConfig.getFormData.suffix){
                            fieldConfig.getFormData.url = netStarRootPathStr + fieldConfig.getFormData.suffix;
                        }
                    }
                    break;
                case 'photoImage':
                case 'uploadImage':
                // case 'upload':
                    if(fieldConfig.suffix){
                        fieldConfig.url = netStarRootPathStr + fieldConfig.suffix;
                    }else{
                        fieldConfig.url = netStarRootPathStr + '/files/uploadList';
                    }
                    fieldConfig.previewUrl = netStarRootPathStr + '/files/images/';
                    fieldConfig.getFileAjax = {
                        url : netStarRootPathStr + '/files/getListByIds',
                        type : 'GET',
                    }
                    break;
                case 'cubesInput':
                    if(typeof(fieldConfig.getAjax) == "object"){
                        if(fieldConfig.getAjax.suffix){
                            fieldConfig.getAjax.url = netStarRootPathStr + fieldConfig.getAjax.suffix;
                        }
                    }
                    if(typeof(fieldConfig.saveAjax) == "object"){
                        if(fieldConfig.saveAjax.suffix){
                            fieldConfig.saveAjax.url = netStarRootPathStr + fieldConfig.saveAjax.suffix;
                        }
                    }
                    break;
                case 'standardInput':
                    if(typeof(fieldConfig.ajax) == "object"){
                        if(fieldConfig.ajax.suffix){
                            fieldConfig.ajax.url = netStarRootPathStr + fieldConfig.ajax.suffix;
                        }
                    }
                    if(typeof(fieldConfig.subdataAjax) == "object"){
                        if(fieldConfig.subdataAjax.suffix){
                            fieldConfig.subdataAjax.url = netStarRootPathStr + fieldConfig.subdataAjax.suffix;
                        }
                    }
                    break;
                case 'listSelectInput':
                    if(fieldConfig.suffix){
                        fieldConfig.url = netStarRootPathStr + fieldConfig.suffix;
                    }else{
                        fieldConfig.url = projectObj.system.prefix.uploadSrc;
                    }
                    if(typeof(fieldConfig.selectAjax) == "object"){
                        if(fieldConfig.selectAjax.suffix){
                            fieldConfig.selectAjax.url = netStarRootPathStr + fieldConfig.selectAjax.suffix;
                        }
                    }
                    break;
                case 'upload':
                case 'uploadImage':
                    fieldConfig.ajax = {
                        url : netStarRootPathStr + '/files/uploadList',
                    }
                    fieldConfig.editAjax = {
                        url : netStarRootPathStr + '/files/rename',
                    }
                    fieldConfig.downloadAjax = {
                        url : netStarRootPathStr + '/files/download/',
                    }
                    fieldConfig.getFileAjax = {
                        url : netStarRootPathStr + '/files/getListByIds',
                        type : 'GET',
                    }
                    fieldConfig.previewAjax = {
                        url : netStarRootPathStr + '/files/pdf/',
                        type : 'GET',
                    }
                    fieldConfig.previewImagesAjax = {
                        url : netStarRootPathStr + '/files/images/',
                        type : 'GET',
                    }
                    if(typeof(fieldConfig.produceFileAjax) == "object" && typeof(fieldConfig.produceFileAjax.suffix) == "string"){
                        fieldConfig.produceFileAjax.url = netStarRootPathStr + fieldConfig.produceFileAjax.suffix;
                    }
                    break;
                case 'data':
                    fieldConfig.url = projectObj.system.prefix.dict;
                    fieldConfig.method = 'POST';
                    fieldConfig.data = {tableName:fieldConfig.urlDictArguments};
                    break;
                case 'select2':
                case 'select':
                    if(typeof(fieldConfig.subdata)=='undefined'){
                        if(typeof(fieldConfig.suffix) == 'undefined'){
                            fieldConfig.subdata = [];
                            if(debugerMode){
                                console.error(fieldConfig.label+'('+fieldConfig.id+')字段：'+'的subdata和suffix都未定义未定义，默认空数组');
                                console.error(fieldConfig);
                            }
                            break;
                        }
                        fieldConfig.url = netStarRootPathStr + fieldConfig.suffix;
                        fieldConfig.method = typeof(fieldConfig.method) == 'string'?fieldConfig.method:'post';
                        fieldConfig.dataSrc = typeof(fieldConfig.dataSrc) == 'string'?fieldConfig.dataSrc:'rows';
                    }
                    if(fieldConfig.linkUrlSuffix && fieldConfig.linkUrlSuffix.length > 0){
                        fieldConfig.linkUrl = netStarRootPathStr + fieldConfig.linkUrlSuffix;
                    }
                    break;
                case 'uploadSingle':
                    fieldConfig.uploadSrc = projectObj.system.prefix.uploadSrc;
                    fieldConfig.method = 'POST';
                    break;
                case 'expression':
                    var urlType = typeof(fieldConfig.urlType)=='string'?fieldConfig.urlType:'items';
                    fieldConfig.listAjax = {
                        url: getRootPath() + '/items/getItemList',
                        type: 'POST',
                        data: {},
                        dataSrc: 'rows'
                    };
                    switch(urlType){
                        case 'items':
                            fieldConfig.listAjax.url = getRootPath() + '/items/getItemList';
                            fieldConfig.listAjaxFields = [
                                { name: 'itemId', idField: true, search: false },
                                { name: 'itemCode', title: '项目代码', search: true },
                                { name: 'itemName', title: '项目名称', search: true },
                                { name: 'itemPyItem', search: true },
                                { name: 'itemWbItem', search: true }
                            ];
                            break;
                        case 'pfItems':
                            fieldConfig.listAjax.url = getRootPath() + '/pfItems/getPfItemListOfSelect';
                            fieldConfig.listAjaxFields = [
                                { name: 'pfItemId', idField: true, search: false },
                                { name: 'pfItemName', title: '项目名称', search: true },
                                { name: 'pfItemPyItem', search: true },
                                { name: 'pfItemWbItem', search: true }
                            ];
                            break;
                    }
                    fieldConfig.assistBtnWords = ['+', '-', '*', '/', '(', ')', '=', '<>', '>', '<', '>=', '<=', 'and', 'or', '清空'];
                    fieldConfig.dataSource = [];
                    break;
                case 'input-select':
                    if(typeof(fieldConfig.saveAjax)=='object'){
                        if(typeof(fieldConfig.saveAjax.suffix)=='string'){
                            fieldConfig.saveAjax.url = getRootPath() + fieldConfig.saveAjax.suffix;
                        }
                    }
                    if(typeof(fieldConfig.selectConfig)=='object'){
                        if(typeof(fieldConfig.selectConfig.suffix)=='string'){
                            fieldConfig.selectConfig.url = getRootPath() + fieldConfig.selectConfig.suffix;
                        }
                    }
                    break;
            }
        },
        setTableField : function(fieldConfig, type){
            var netStarRootPathStr = getRootPath();
            switch(type){
                case 'upload':
                    fieldConfig.formatHandler.data.uploadSrc = netStarRootPathStr;
                    break;
                case 'href':
                    if(fieldConfig.formatHandler.data.url && fieldConfig.formatHandler.data.url.indexOf('http') == -1){
                        fieldConfig.formatHandler.data.url = netStarRootPathStr + fieldConfig.formatHandler.data.url;
                    }
                    break;
            }
            switch(fieldConfig.mindjetType){
                case 'dict':
                    if(typeof(nsVals.dictData[fieldConfig.dictArguments])=='undefined'){
                        console.error('无法找到字典数据:'+fieldConfig.dictArguments)
                    }else{
                        fieldConfig.formatHandler = {
                            type:'dictionary',
                            data:nsVals.dictData[fieldConfig.dictArguments].jsondata
                        }
                        fieldConfig.columnType = "dictionary";
                    }
                    if(typeof(fieldConfig.editConfig)=="object"){
                        if(typeof(nsVals.dictData[fieldConfig.editConfig.dictArguments])=='undefined'){
                            console.error('无法找到字典数据:'+fieldConfig.editConfig.dictArguments)
                        }else{
                            fieldConfig.editConfig.subdata = nsVals.dictData[fieldConfig.editConfig.dictArguments].subdata;
                        }
                    }
                    break;
            }
            if(typeof(fieldConfig.editConfig)=="object"){
                fieldManager.setFormField(fieldConfig.editConfig, fieldConfig.editConfig.type);
            }
        },
        init : function(fields, type){
            switch(type){
                case 'vo':
                    for(var i=0; i<fields.length; i++){
                        var field = fields[i];
                        var fieldType = field.type;
                        if(typeof(fieldType) != "string"){
                            // 不存在表单配置
                            fieldType = "text";
                            field.type = fieldType;
                            if(typeof(field.nsSource) == "object"){
                                if(typeof(field.label) == "undefined"){
                                    field.label = field.nsSource.chineseName ? field.nsSource.chineseName : '';
                                }
                                if(typeof(field.id) == "undefined"){
                                    field.id = field.nsSource.englishName ? field.nsSource.englishName : '';
                                }
                            }
                        }else{
                            // 存在表单配置 
                        }
                        fieldManager.setFormField(field, fieldType);
                    }
                    break;
                default:
                    // list blockList
                    for(var i=0; i<fields.length; i++){
                        var field = fields[i];
                        var fieldType = field.columnType;
                        fieldManager.setTableField(field, fieldType);
                    }
                    break;
            }
        },
    }
    // 方法管理
    var funcManage = {
        getConfig : function(sourceConfig){
            var netStarRootPathStr = getRootPath();
            var config = $.extend(true, {}, sourceConfig);
            //参数---url
            if(typeof(sourceConfig.suffix)=='string'){
                config.url = netStarRootPathStr + sourceConfig.suffix;
            }
            // 判断是否存在callbackAjax 如果有转化成完整的地址 lyw
            if(typeof(sourceConfig.callbackAjax)=='string'){
                config.callbackAjax = netStarRootPathStr + sourceConfig.callbackAjax;
            }
            if(sourceConfig.getSuffix){
                //弹框之前调用ajax请求链接
                config.getUrl = netStarRootPathStr + sourceConfig.getSuffix;
            }
            if(typeof(sourceConfig.uploadAjax)=="object"){
                config.uploadAjax.url = netStarRootPathStr + sourceConfig.uploadAjax.suffix;
            }
            if(typeof(sourceConfig.importAjax)=="object"){
                config.importAjax.url = netStarRootPathStr + sourceConfig.importAjax.suffix;
            }
            if(typeof(sourceConfig.getPanelDataAjax)=="object"){
                config.getPanelDataAjax.url = netStarRootPathStr + sourceConfig.getPanelDataAjax.suffix;
            }
            if(typeof(sourceConfig.beforeAjax)=="object"){
                config.beforeAjax.url = netStarRootPathStr + sourceConfig.beforeAjax.suffix;
            }
            if(typeof(sourceConfig.getUrl) == "string"){
                if(sourceConfig.getUrl.indexOf('http') == -1){
                    config.getUrl = netStarRootPathStr + sourceConfig.getUrl;
                }
            }
            delete config.suffix;
            return config;
        },
        ajaxCommon : function(ajaxConfig, handlerObj){
            //ajaxConfig 业务里包含的配置对象
            //handlerObj 有两个，{beforeHandler:f(), afterHandler:f(),value:{}}一个是前置，一个是后置
            //判断handlerObj是否合法
            if(debugerMode){
                if(handlerObj){
                    //判断传入参数对象是否合法
                    /*$.each(handlerObj, function(key,value){
                        if(key!='beforeHandler' && key!='afterHandler' && key!='value'&& key!='successFun' && key!='$btnDom'){
                            console.error('回调对象错误:' + key + '，\r\n必须是beforeHandler/afterHandler/value/successFun/$btnDom');
                        }
                    })*/
                    var validArr =
                    [
                        ['beforeHandler', 			'function', 	true], 	//前置回调函数
                        ['afterHandler', 			'function', 	true], 	//成功回调函数
                        ['value', 					'object', 		true], 	//操作值
                        ['successFun', 				'function', 		],	//成功之后的回调函数
                        ['dialogBeforeHandler', 	'object', 			],	//弹框之前的配置参数
                    ]
                    var isValid = nsDebuger.validOptions(validArr, handlerObj);
                    if(isValid === false){return false;}
                    //如果需要入参而没有传入则不合法
                    if(ajaxConfig.data){
                        if(typeof(handlerObj.value)!='object'){
                            console.error('调用ajax:'+ajaxConfig.url+' 时未传入必须的参数');
                        }
                    }
                }
            }
        
            //克隆配置对象
            var runningConfig = $.extend(true,{},ajaxConfig);
        
            if(handlerObj.controllerObj){
                //定义了权限码参数
                if(handlerObj.controllerObj.defaultData){
                    runningConfig.data = $.extend(true,runningConfig.data,handlerObj.controllerObj.defaultData);
                }
                if(handlerObj.controllerObj.isAjaxDialog){
                    runningConfig = handlerObj.controllerObj;
                }
            }
            /*runningConfig.data = handlerObj.value;*/
            runningConfig.successMsg = runningConfig.successMsg ? runningConfig.successMsg : '操作成功';
            //前置回调函数
            if(handlerObj.beforeHandler){
                var innerValue = {};
                if(!$.isEmptyObject(handlerObj.value)){innerValue = handlerObj.value;}
                handlerObj.ajaxConfig = runningConfig;
                handlerObj = handlerObj.beforeHandler(handlerObj);
                if(!$.isEmptyObject(handlerObj.value)){
                    if(!$.isArray(handlerObj.value)){
                        $.each(innerValue,function(key,value){
                            handlerObj.value[key] = value;
                        })
                    }
                }
            }
            var ajaxConfigOptions = handlerObj.ajaxConfigOptions ? handlerObj.ajaxConfigOptions : {};
            ajaxConfigOptions.dialogBeforeConfig = handlerObj.dialogBeforeConfig;
            var listAjax = nsVals.getAjaxConfig(runningConfig,handlerObj.value,ajaxConfigOptions);
            listAjax.plusData = runningConfig;
            //sjj 20190606  是否有矩阵传值参数
            if(runningConfig.matrixVariable){
                //listAjax.url = listAjax.url + runningConfig.matrixVariable;
            }
            //处理权限码加到ajaxheader
            if(typeof(listAjax.data)=='object'){
                if(typeof(listAjax.data.data_auth_code) == 'string'){
                    if(typeof(listAjax.header)!='object'){
                        listAjax.header = {};
                    }
                    listAjax.header.data_auth_code = listAjax.data.data_auth_code;
                }
            }
        
            nsVals.ajax(listAjax,function(res,plusData){
                    //dialog成功回调
                    if(handlerObj.$btnDom){
                        handlerObj.$btnDom.removeAttr('disabled');
                    }
                    if(typeof(handlerObj.successFun) == 'function'){
                        var enterHandler = typeof(handlerObj.successFun) == 'function'?handlerObj.successFun:{};
                        //res.success:ajax成功状态
                        //handlerObj.$btnDom:按钮节点
                        handlerObj.successFun(res.success,handlerObj.$btnDom);
                    }
                    if(res.success == false){
                        //这里添加错误信息处理
                        return false;
                    }
                    //弹出服务器端返回的msg提示 cy 20180712
                    if(res.msg){
                        nsalert(res.msg,'success');
                    }else{
                        //sjj 20190521 如果自定义配置中定义了successMsg返回值，则读取定义的返回值提示语
                        if(plusData.plusData.successMsg){
                            nsalert(plusData.plusData.successMsg,'success');
                        }
                    }
                    //sjj 20190521判断是否自定义了操作标识
                    var returnObjectState;
                    switch(plusData.plusData.successOperate){
                        case 'refresh':
                            returnObjectState = NSSAVEDATAFLAG.VIEW;
                            break;
                        case 'delete':
                            returnObjectState = NSSAVEDATAFLAG.DELETE;
                            break;
                        case 'edit':
                            returnObjectState = NSSAVEDATAFLAG.EDIT;
                            break;
                        case 'add':
                            returnObjectState = NSSAVEDATAFLAG.ADD;
                            break;
                    }
                    //sjj 20190524 如果
                    if(typeof(plusData.plusData.objectState)=='number'){
                        returnObjectState = plusData.plusData.objectState;
                    }
                    //后置回调函数 后置回调函数的返回值暂无处理，但是必须回传 以后补充方法
                    if(handlerObj.afterHandler){
                        if(runningConfig.dataSrc){
                            /**lxh 添加plusData */
                            if(typeof(returnObjectState)!='undefined'){
                                data = res[runningConfig.dataSrc] ? res[runningConfig.dataSrc] : {};
                                data.objectState = returnObjectState;
                            }else{
                                data = res[runningConfig.dataSrc] ? res[runningConfig.dataSrc] : {};
                            }
                            handlerObj.afterHandler(data,plusData.plusData);
                        }else{
                            if(typeof(returnObjectState)!='undefined'){
                                res.objectState = returnObjectState;
                            }
                            handlerObj.afterHandler(res);
                        }
                        if(plusData.plusData.isCloseWindow){
                            // lyw 20190910 如果需要在模板里边加关闭方法
                            // nsFrame.popPageClose(); 
                            // NetstarUI.labelpageVm.closeByIndex(NetstarUI.labelpageVm.labelPageLength-1);
                        }
                    }
                },true
            )
        },
        // 获取通用方法
        getCommonFunc : function(ajaxConfig){
            var ajaxFunc = function(handlerObj){
                if(typeof(handlerObj)=='undefined'){
                    handlerObj = {};
                }
                //ajaxCommon(this.config, handlerObj);
                /********sjj20180601 前置处理值*******************/
                /********sjj20180601 前置处理值********************/
                var ajaxHandler = {
                    beforeHandler:			typeof(handlerObj.beforeHandler)=='function' ? handlerObj.beforeHandler : handlerObj.ajaxBeforeHandler,
                    afterHandler:			typeof(handlerObj.afterHandler)=='function' ? handlerObj.afterHandler : handlerObj.ajaxAfterHandler,
                    value:					handlerObj.value ? handlerObj.value : {},
                    successFun:				handlerObj.successFun,
                    dialogBeforeConfig:		typeof(handlerObj.dialogBeforeHandler)=='object' ? handlerObj.dialogBeforeHandler : {},
                    controllerObj:			handlerObj.controllerObj,
                    $btnDom:						handlerObj.$btnDom,
                    ajaxConfigOptions:	typeof(handlerObj.ajaxConfigOptions)=='object' ? handlerObj.ajaxConfigOptions : {}
                }
        
            /***************sjj 20190410 针对按钮文本的转换根据数据值调用对应的ajax start************************************************* */
                function setAjaxConfig(valueData){
                    if(typeof(ajaxConfig.text) == "string"){
                        if(ajaxConfig.text.indexOf('{')>-1){
                            var formatConfig = JSON.parse(ajaxConfig.text);
                            switch(formatConfig.formatHandler.type){
                                    case 'changeBtn':
                                        $.each(formatConfig.formatHandler.data,function(value,keyConfig){
                                            if (value == valueData[formatConfig.field]){
                                                    if(keyConfig.ajax){
                                                        nsVals.extendJSON(ajaxConfig,keyConfig.ajax);
                                                    }
                                            }
                                    });
                                        break;
                            }
                        }
                    }else{
                        console.error('没有配置text');
                        console.error(ajaxConfig);
                    }
                }
                if(!$.isEmptyObject(ajaxHandler.value)){
                    setAjaxConfig(ajaxHandler.value);
                }else{
                    if(ajaxHandler.dialogBeforeConfig.selectData){
                        setAjaxConfig(ajaxHandler.dialogBeforeConfig.selectData);
                    }
                }
                /***************sjj 20190410 针对按钮文本的转换根据数据值调用对应的ajax start************************************************* */
        
                funcManage.ajaxCommon(ajaxConfig,ajaxHandler);
            };
            return ajaxFunc;
        },
        // 通过defaultMode获取方法
        setFuncByDefaultMode : function(controllerObj){
            if(typeof(controllerObj.defaultMode)=='string'){
                var defaultModeName = controllerObj.defaultMode;
                //显示字段
                var functionField = controllerObj.functionField;
                //rowData取值方式
                controllerObj.sourceMode = 'selectedRow';
                if(defaultModeName.indexOf('tablebtn')>-1){
                    controllerObj.sourceMode = 'tablebtn';
                }
                //defaultMode类型
                var dataUserModeKey = [
                    'dialog','valueDialog','confirm','toPage','loadPage','changePage','ajaxDialog','component','print','custom','templatePrint','workflowViewer','workflowSubmit','newtab','viewerDialog','successMessage','dataImport','excelImportVer2','multiDialog','ajaxAndSend','business','previewFile','ajaxNewtab','download','addInfoDialog'
                ];
                var defaultModeArray=defaultModeName.split(',');
                for(var mi = 0;mi<defaultModeArray.length;mi++){
                    if(dataUserModeKey.indexOf(defaultModeArray[mi]) >-1){
                        //defaultMode指定类型
                        controllerObj.userMode = defaultModeArray[mi];
                    }
                }
                switch(controllerObj.userMode){
                    case 'dialog':
                        controllerObj.func.dialog = function(callBack,Obj){
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
                            }
                            var configJson = $.extend(true,{},Obj);
                            //configJson.dialogForm = getDialogForm(businessObj.fields,functionField);
                            configJson.controllerObj = functionConfigObj;
                            configJson.event = callBack.event;
                            dialogCommon(callBack,configJson);
                        }
                        break;
                    //修改弹窗
                    case 'valueDialog':
                        controllerObj.func.valueDialog = function(callBack,Obj){	
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
                            }							//id:?
                            var configJson = $.extend(true,{},Obj);
                            //获取表格行数据
                            //configJson.rowObj = controllerObj.getFunctionData(controllerObj,configJson);
                            configJson.controllerObj = functionConfigObj;
                            configJson.event = callBack.event;
                            dialogCommon(callBack,configJson);
                            /*if(configJson.rowData){
                                dialogCommon(callBack,configJson);
                            }*/
                        }
                        break;
                    //ajax弹框
                    case 'ajaxDialog':
                        controllerObj.func.ajaxDialog = function(callBack,Obj){	
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
                            }						
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            ajaxDialogCommon(callBack,configJson);
                        }
                        break;
                    //确认弹窗
                    case 'confirm':
                        controllerObj.func.confirm = function(callBack,Obj){
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
                            }	
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            confirmCommon(callBack,configJson);
                        }
                        break;
                    case 'custom':
                        //sjj20181030 自定义按钮
                        controllerObj.func.custom = function(callBack,Obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
                            }	
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            configJson.event = callBack.event;
                            callBack.controllerObj = functionConfigObj;
                            customCommon(callBack,configJson);
                        }
                        break;
                    case 'toPage':
                        //跳转界面sjj20180517 btn tablerowbtn
                        controllerObj.func.toPage = function(callback,Obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            if(typeof(callback.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
                            }
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            toPageCommon(callback,configJson);
                        }
                        break;
                    case 'newtab':
                        //sjj 20190227 添加支持打开新标签页方法
                        controllerObj.func.newtab = function(callback,Obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            if(typeof(callback.getFuncConfigHandler)=='function'){
                                    functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
                                }
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            newTabCommon(callback,configJson);
                        }
                            break;
                    case 'ajaxNewtab':
                        //sjj 20191108 添加支持ajax执行完成之后的跳转界面并进行赋值操作 
                        controllerObj.func.ajaxNewtab = function(callback,Obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = controllerObj;
                            callback.controllerObj = controllerObj;
                            ajaxNewtabCommon(callback,configJson);
                        }
                        break;
                        case 'multiDialog':
                            //sjj 20190815 多url链接拼接成的tab弹出界面
                            controllerObj.func.multiDialog = function(callback,obj){
                                $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                                var functionConfigObj = controllerObj;
                                var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            multiDialogCommon(callback,configJson);
                            }
                            break;
                        case 'viewerDialog':
                            //sjj 20190403 添加仅支持查看页弹框
                            controllerObj.func.viewerDialog = function(callBack,obj){
                                $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                                var functionConfigObj = controllerObj;
                                var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            viewerDialogCommon(callBack,configJson);
                            }
                            break;
                    case 'loadPage':
                        //在当前窗口打开新界面
                        controllerObj.func.loadPage = function(callback,Obj){
                            $('[type="button"]').blur();
                            var functionConfigObj = controllerObj;
                            if(typeof(callback.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
                            }
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            loadPageCommon(callback,configJson);
                        }
                        break;
                    case 'changePage':
                        //跳转界面sjj20180606 btn tablerowbtn
                        controllerObj.func.changePage = function(callback,obj){
                            var functionConfigObj = controllerObj;
                            if(typeof(callback.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callback.getFuncConfigHandler(obj);
                            }
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            changePageCommon(callback,configJson);
                        }
                        break;
                    case 'component':
                        //自定义组件sjj20180802 
                        controllerObj.func.component = function(callBack,obj){
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
                            }
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            changeComponentCommon(callBack,configJson);
                        }
                        break;
                    case 'print':
                        //自定义组件sjj 20180928
                        controllerObj.func.print = function(callBack,obj){
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
                            }
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            printCommon(callBack,configJson);
                        }
                         break;	
                    case 'templatePrint':
                         //模板打印 lxh 20181116
                        controllerObj.func.templatePrint = function(callBack,obj){
                            // 添加打印中loading
                            NetStarUtils.loading('正在处理中');
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
                            }
                            var configJson = $.extend(true,{},obj);
                             configJson.controllerObj = functionConfigObj;
                             callBack.controllerObj = functionConfigObj;
                            templatePrint(callBack,configJson);
                        }
                        break;
                    case 'workflowViewer':
                         //工作流 流程监控
                        controllerObj.func.workflowViewer = function(callBack,obj){
                            var configJson = $.extend(true,{},obj);
                            workflowViewer(callBack,configJson);
                        }
                        break;
                    case 'workflowSubmit':
                         //工作流
                        controllerObj.func.workflowSubmit = function(callBack,obj){
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                             configJson.controllerObj = functionConfigObj;
                            workflowSubmit(callBack,configJson);
                        }
                            break;
                                break;
                    case 'successMessage':
                            //sjj 20190524 按钮类型为successMessage
                            controllerObj.func.successMessage = function(callBack,obj){
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                             configJson.controllerObj = functionConfigObj;
                             successMessage(callBack,configJson);
                        }
                            break;
                    case 'excelImportVer2':
                            // lyw 表格数据导入
                            controllerObj.func.excelImportVer2 = function(callBack,obj){
                                var functionConfigObj = controllerObj;
                                var configJson = $.extend(true,{},obj);
                                configJson.controllerObj = functionConfigObj;
                                excelImportVer2(callBack,configJson);
                            }
                            break;
                    case 'ajaxAndSend':
                            //sjj 20190929生成报告控件可以设置模板名称可以设置业务id，调用两个方法1、根据模板名称获取模板2、根据模板id和业务id打印templateName，deptId，bllCateCode，languageName	  
                            controllerObj.func.ajaxAndSend = function(callBack,obj){
                                $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            ajaxAndSendCommon(callBack,configJson);
                            }
                            break;
                    case 'business':
                        //sjj 20190929生成报告控件可以设置模板名称可以设置业务id，调用两个方法1、根据模板名称获取模板2、根据模板id和业务id打印templateName，deptId，bllCateCode，languageName	  
                        controllerObj.func.business = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            businessInit(callBack, configJson);
                        }
                        break;
                    case 'previewFile':
                        //sjj 20190929生成报告控件可以设置模板名称可以设置业务id，调用两个方法1、根据模板名称获取模板2、根据模板id和业务id打印templateName，deptId，bllCateCode，languageName	  
                        controllerObj.func.previewFile = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            previewFileInit(callBack, configJson);
                        }
                        break;
                    case 'download':
                        //sjj 20191126 文件下载
                        controllerObj.func.download = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            callBack.controllerObj = functionConfigObj;
                            downloadFileInit(callBack, configJson);
                        }
                        break;
                    case 'addInfoDialog':
                        //sjj 20191203 在当前模板弹出添加页面 
                        controllerObj.func.addInfoDialog = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            callBack.controllerObj = functionConfigObj;
                            addInfoDialogInit(callBack, configJson);
                        }
                        break;
                }
             }
            //发送websocket
            function wsConnect(callBack,configJson,dataType){
                //dataType array 或者 object
                //var $btn = $(configJson[0]);
                //$btn.controllerObj = {};
                //var handlerObj = {};
                var handlerObj = callBack.ajaxBeforeHandler(callBack);
                var funcConfig = configJson.controllerObj;
                var fullFormId = handlerObj.config.fullFormId;
                var fullTableId = handlerObj.config.fullTableId;
                var webSocketUrl = funcConfig.webSocketUrl || "";
                //如果没有链接
                if(typeof funcConfig.ws == 'undefined' || funcConfig.ws.readyState !== 1){
                    funcConfig.ws = nschat.websocket.wsConnect(function name() {  },function (res) {
                        //这里接收返回数据
                        /**
                         * res = [{ business:[{},{}],msg:"",..... }]
                         */
                        res = res[0];
                        if(res.excute){
                            NetStarUtils.removeLoading();
                      }
                        if(res.success == 'true'){
                            var callbackAjax = res.callbackAjax;
                            if(typeof callbackAjax != 'undefined' && $.trim(callbackAjax).length > 0){
                                var ajaxConfig = {
                                    url:callbackAjax,
                                    type:funcConfig.type,
                                    data:res,
                                    dataSrc:'data'
                                };
                                var ajax = nsVals.getAjaxConfig(ajaxConfig);
                                nsVals.ajax(ajax,function(res){
                                    if(res.success){
                                        switch(dataType){
                                            case 'array':
                                                //修改table
                                                var dataSource = baseDataTable.originalConfig[fullTableId].dataConfig.dataSource;
                                                var $dataTable = $('#' + fullTableId);
                                                $.each(res[ajaxConfig.dataSrc].business,function(index,item){
                                                    $.each(dataSource,function(idx,itm){
                                                        if(itm.regReportId == item.regReportId){
                                                            dataSource[idx] = item;
                                                            /* var $tr = $dataTable.find('tr').eq(idx);
                                                            $dataTable.row($tr).data(item).draw(false); */
                                                        }
                                                    });
                                                });
                                                baseDataTable.refreshByID(fullTableId);
                                                break;
                                            case 'object':
                                                nsForm.fillValues(res[ajaxConfig.dataSrc],fullFormId);
                                                console.log('修改form');
                                                break;
                                        }
        
                                    }
                                });
                            }
                        }else{
                            return nsalert(res.msg,'error');
                        }
                    },webSocketUrl,function(event){
                        nsalert("连接出错", 'error');
                        NetStarUtils.removeLoading();
                        // NetstarUI.confirm.show({
                        // 	title:'打印出错',
                        // 	content:'<div class="print-alert"><h4><i class=""></i><span>设备连接错误，不能打印</span></h4><p>请点击确认下载安装最新版网星通</p></div>',
                        // 	width:500,
                        // 	state:'error',
                        // 	handler:function (state) {
                        // 		if(state){
                        // 			var a = document.createElement('a');
                        // 			a.href = getRootPath() + '/files/download/10010';
                        // 			a.download = '网星通';
                        // 			a.click();
                        // 		}else{
                        // 			console.log('点击取消');
                        // 		}
                        // 	}
                        // });
                        NetstarHomePage.systemInfo.netstarDownload({
                            text : '“网星通”是物联网终端程序，负责和各种硬件设备互联互通。如使用打印、扫描枪、身份证阅读器、仪器接口、仪器数据采集等功能需要安装托盘程序“网星通”，请点击下载',
                            netstarWidth : 600,
                            netstarHeight : 450,
                        })
                    });
                }
            }
            //模板打印
            function templatePrint(callBack,configJson){
                /**
                 * type 
                 * print  	打印
                 * preview 	预览
                 * printAjax 	打印有回调
                 * previewAjax	打印预览有回调
                 */
            //	var $btn = $(configJson[0]);
                //$btn.controllerObj = {};
                //拿到当前模板的配置
                //var handlerObj = {};
                //handlerObj = callBack.ajaxBeforeHandler(handlerObj);
                var pageConfig = callBack.dialogBeforeHandler(callBack);//拿到当前模板选择的数据
                //var funcConfig = callBack.getFuncConfigHandler(configJson);//拿到当前按钮的配置
                var funcConfig = configJson.controllerObj;
                //var templateId = $btn.attr('templateId');//拿到要打印的模板的id
                var templateId = '';
                if(configJson.controllerObj.ajaxData){
                    templateId = configJson.controllerObj.ajaxData.templateId;
                }
                //如果按钮上有templateId的话往下执行
                if(!pageConfig.value){return nsalert('请选择一行','error');}
                if(typeof templateId != 'undefined'){
                    //公共数据
                    var callbackAjax = funcConfig.callbackAjax ? getRootPath() + funcConfig.callbackAjax : "";
                    var listName = funcConfig.listName || "";
                    //判断打印表格还是表单，表格是数组，表单是对象
                    switch($.type(pageConfig.value)){
                        case 'array':
                                wsConnect(callBack,configJson,'array');
                                //如果有规定需要传的字段字段
                                var sendMsg = [];
                                if(typeof funcConfig.requiredFields != 'undefined'){
                                    var requiredFields = funcConfig.requiredFields.split(',');
                                    $.each(pageConfig.value,function(index,item){
                                        var requiredObj = {};
                                        $.each(requiredFields,function(idx,itm){
                                            requiredObj[itm] = item[itm];
                                            requiredObj.templateId = templateId;
                                        });
                                        sendMsg.push(requiredObj);
                                    });
                                }else{
                                    //没有规定要传的特定字段则发送选中的全部数据
                                    sendMsg = pageConfig.value;
                                }
                                //发送数据
                                if(NetStarRabbitMQ.linkSuccess){
                                    //NetStarUtils.loading('正在打印，请稍候...');
                                }
                                switch (funcConfig.btnType) {
                                    case 'print':
                                    nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
                                        break;
                                    case 'preview':
                                    nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
                                        break;
                                    case 'printAjax':
                                    nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
                                        break;
                                    case 'previewAjax':
                                    nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
                                        break;
                                    default:
                                        break;
                                }
                            break;
                        case 'object':
                                wsConnect(callBack,configJson,'object');
                                //如果有规定需要传的字段字段
                                var sendMsg = {};
                                if(typeof funcConfig.requiredFields != 'undefined'){
                                    var requiredFields = funcConfig.requiredFields.split(',');
                                    for (var key in requiredFields) {
                                        if (requiredFields.hasOwnProperty(key)) {
                                            var element = requiredFields[key];
                                            if($.inArray(key,requiredFields)){
                                                sendMsg[key] = element;
                                            }
                                        }
                                    }
                                }else{
                                    //没有规定要传的特定字段则发送选中的全部数据
                                    sendMsg = pageConfig.value;
                                }
                                //发送数据
                                if(NetStarRabbitMQ.linkSuccess){
                                    //NetStarUtils.loading('正在打印，请稍候...');
                                }
                                switch (funcConfig.btnType) {
                                    case 'print':
                                    nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
                                        break;
                                    case 'preview':
                                    nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
                                        break;
                                    case 'printAjax':
                                    nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
                                        break;
                                    case 'previewAjax':
                                    nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
                                        break;
                                    default:
                                        break;
                                }
                            break;
                    }
                }else{
                    return nsalert('该模板没有id，请检查配置','error');
                }
             }
            //获取弹窗显示字段
            function getDialogForm(businessObj,functionField){
                if(debugerMode){
                    var parametersArr = [
                    [businessObj,'object',true],
                    [functionField,'object',true],
                    ]
                    var isVaild = nsDebuger.validParameter(parametersArr);
                    if(isVaild == false){
                        return;
                    }
                    if(typeof(businessObj.fields)!='object'){
                        console.error('无法在指定业务对象中找到字段属性');
                        console.error(businessObj)
                        return;
                    }
                }
                var dialogForm = [];
                for(ffi in functionField){
                    if(typeof(businessObj.fields[ffi]) == 'object'){
                        // lyw 读取字典
                        switch(businessObj.fields[ffi].mindjetType){
                            case 'dict':
                                if(typeof(nsVals.dictData[businessObj.fields[ffi].dictArguments])=='undefined'){
                                    console.error('无法找到字典数据:'+businessObj.fields[ffi].dictArguments)
                                }else{
                                    businessObj.fields[ffi].subdata = nsVals.dictData[businessObj.fields[ffi].dictArguments].subdata;
                                }
                                break;
                        }
                        var dialogFormField = $.extend(true,{},businessObj.fields[ffi]);
                        dialogFormField.mindjetIndex = functionField[ffi].mindjetIndex;
                        dialogForm.push(dialogFormField);
                    }
                }
                dialogForm.sort(function(a,b){
                    return a.mindjetIndex - b.mindjetIndex;
                })
                return dialogForm;
            }
            //确认弹窗
            function confirmCommon(callback,configJson){
                /*
                 * normal  	则只附加参数
                 * object 	则用对象名称包裹，返回标准对象格式
                 * id 		只使用id作为参数
                 * ids 		返回ids格式，用于批量操作
                 */
                var confirmdata;
                var controllerObj = configJson.controllerObj;
                callback.controllerObj = controllerObj;
                //dialog的前置回调
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    //加验证
                    confirmdata = callback.dialogBeforeHandler(callback);
                }
                if(confirmdata.value === false){
                    var infoMsgStr = controllerObj.noSelectInfoMsg ? controllerObj.noSelectInfoMsg:'请选择要处理的数据';
                    nsalert(infoMsgStr,'error');
                    console.error(infoMsgStr);
                    return false;
                }
                //确认弹窗提示信息
                var ajaxObj = {
                    //value:confirmdata.value,
                    dialogBeforeHandler:{
                        btnOptionsConfig:confirmdata.btnOptionsConfig,
                        //selectData:confirmdata.value,
                        containerFormJson:confirmdata.containerFormJson
                    },
                    controllerObj:controllerObj.func.config,
                    value:confirmdata.value,
                }
                if(callback.event){
                    if(callback.event.target.nodeName == 'BODY'){
                        if(callback.data.id){
                            ajaxObj.$btnDom = $('#'+callback.data.id);
                            ajaxObj.$btnDom.attr('disabled',true);
                        }
                    }else{
                        ajaxObj.$btnDom = $(callback.event.currentTarget);
                        ajaxObj.$btnDom.attr('disabled',true);
                    }
                }
                /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                if(typeof(callback.ajaxBeforeHandler)=='function'){
                    ajaxObj.beforeHandler = function(data){
                        return callback.ajaxBeforeHandler(data);
                    };
                }
                if(typeof(callback.ajaxAfterHandler)=='function'){
                    /**lxh 添加plusData */
                    ajaxObj.afterHandler = function(data,plusData){
                        return callback.ajaxAfterHandler(data,plusData);
                    };
                }
                nsconfirm(controllerObj.title,function(isDelete){
                    if(isDelete){
                        controllerObj.func.function(ajaxObj);
                    }else{
                        if(ajaxObj.$btnDom){
                            ajaxObj.$btnDom.removeAttr('disabled');
                        }
                    }
                },'warning')
            }
        
            //sjj20181030 自定义按钮
            function customCommon(callback,configJson){
                /*
                 * normal  	则只附加参数
                 * object 	则用对象名称包裹，返回标准对象格式
                 * id 		只使用id作为参数
                 * ids 		返回ids格式，用于批量操作
                 */
                var $btnDom;
                if(callback.event){
                    if(callback.event){
                        if(callback.event.target.nodeName == 'BODY'){
                            if(callback.data.id){
                                $btnDom = $('#'+callback.data.id);
                                $btnDom.attr('disabled',true);
                            }
                        }else{
                            $btnDom = $(callback.event.currentTarget);
                            $btnDom.attr('disabled',true);
                        }
                    }
                }
                var confirmdata;
                var controllerObj = configJson.controllerObj;
                //dialog的前置回调
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    //加验证
                    confirmdata = callback.dialogBeforeHandler(configJson);
                }
                if(confirmdata){
                    if($.isEmptyObject(confirmdata.value)){
                        if($btnDom){
                            $btnDom.removeAttr('disabled');
                        }
                        return;
                    }
                }
                //确认弹窗提示信息
                var ajaxObj = {
                    //value:confirmdata.value,
                    dialogBeforeHandler:{
                        btnOptionsConfig:confirmdata.btnOptionsConfig,
                        //selectData:confirmdata.value,
                        containerFormJson:confirmdata.containerFormJson,
                    },
                    controllerObj:controllerObj.func.config,
                    value:confirmdata.value,
                };
                if($btnDom){
                    ajaxObj.$btnDom = $btnDom;
                }
                // 处理{id:"{id}"} 191020 cy
                var _controllerObj = ajaxObj.controllerObj;
                if(!$.isEmptyObject(_controllerObj.ajaxData)){
                    _controllerObj.data = NetStarUtils.getFormatParameterJSON(_controllerObj.ajaxData, ajaxObj.value);
                }
                if(confirmdata.optionsConfig){
                    ajaxObj.ajaxConfigOptions = {idField:confirmdata.optionsConfig.idField};
                }
                /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                if(typeof(callback.ajaxBeforeHandler)=='function'){
                    ajaxObj.beforeHandler = function(data){
                        return callback.ajaxBeforeHandler(data);
                    };
                }
                if(typeof(callback.ajaxAfterHandler)=='function'){
                    ajaxObj.afterHandler = function(data,plusData){
                        return callback.ajaxAfterHandler(data,plusData);
                    };
                }
                controllerObj.func.function(ajaxObj);
            }
        
            //公用弹框内容调用 旧弹框
            function dialogContentOld(callback,obj){
                var fieldValue = typeof(obj.value)=='object' ? obj.value : {};
                var controllerObj = obj.controllerObj;
                var functionField = obj.controllerObj.functionField;
                var dialogField = [];
                //如果指定functionField的情况下显示functionField下字段
                if(typeof(functionField)=='object'){
                    dialogField = getDialogForm(businessObj,functionField);
                }else{ 
                    if(typeof(functionField)=='string'&&functionField.indexOf('nsProject.getFieldsByState')==0){
                        // 通过状态获取字段
                        dialogField = eval(functionField);
                    }else{
                        //否则显示全部字段
                        dialogField = getDialogForm(businessObj,fieldValue);
                    }
                }
                //调整表单form中的下拉框data参数 
                function getSelectData(fieldArr,fieldValue){
                    var newFieldArr = fieldArr;
                    if($.isEmptyObject(fieldValue)){
                        if(!$.isEmptyObject(obj.currentData)){
                            fieldValue = obj.currentData;
                        }
                    }
                    for(var fieldI = 0; fieldI<fieldArr.length; fieldI++){
                        //是否是ajax请求 需要转data参数
                        if(fieldArr[fieldI].url){
                            //存在url链接
                            function getSelectAjaxData(_params){
                                var data = $.extend(true,{},_params);
                                if(fieldArr[fieldI].dataFormat == 'ids'){
                                    if($.isArray(fieldValue)){
                                        var ids = [];
                                        for(var dataI=0; dataI<fieldValue.length; dataI++){
                                            ids.push(fieldValue[dataI][obj.options.idField]);
                                        }
                                        ids = ids.join(',');
                                        data.ids = ids;
                                    }else{
                                        data.ids = fieldValue[obj.options.idField];
                                    }
                                }else{
                                    for(var param in data){
                                        if(typeof(data[param])=='string'&&
                                            (data[param].indexOf('this.')>-1||data[param].indexOf('page.')>-1||data[param].indexOf('search')>-1)
                                        ){
        
                                        }else{
                                            data[param] = nsVals.getTextByFieldFlag(data[param],fieldValue);
                                        }
                                        if(data[param] === 'undefined'){data[param] = '';}
                                    }
                                }
                                return data;
                            }
                            fieldArr[fieldI].data = typeof(fieldArr[fieldI].data)=='object' ? fieldArr[fieldI].data : {};
                            fieldArr[fieldI].data = getSelectAjaxData(fieldArr[fieldI].data);
                        }
                    }
                    return newFieldArr;
                }
                dialogField = getSelectData(dialogField,fieldValue);
                if(fieldValue && dialogField){
                    //如果存在form并且存在默认值的情况
                    for(var formI = 0; formI<dialogField.length;formI++){
                        if(dialogField[formI].voField){
                            dialogField[formI].id = dialogField[formI].voField;
                        }
                        dialogField[formI].value = fieldValue[dialogField[formI].id];
                    }
                }
                /****sjj 20180531 添加支持事件回调 start***/
                /*changeHandlerData
                    *readonly:{id:false,name:false}
                    *disabled:{id:false,name:true}
                    *value:{id:'3333',name:"ddd"}
                    *hidden:{id:true,name:true}
                */
        
                var dialogJson = {
                    id:'dialogCommon',//typeof(obj.config.dialogId) == 'undefined'?'dialogCommon':obj.config.dialogId,
                    title: typeof(controllerObj.title) =='string'?controllerObj.title:'表单维护',
                    size:'m',
                    form:dialogField,
                    isEnterHandler:true,//控制是否绑定回车事件
                    btns:[{
                        text:typeof(controllerObj.btnText) =='string'?controllerObj.btnText:'确认',
                        isReturn:true,
                        handler:function($btnDom,callbackFun){
                            //$btnDom:按钮节点
                            //callbackFun:ajax方法回调
                            var jsonData = nsTemplate.getChargeDataByForm('dialogCommon');
                            if(jsonData){
                                var handlerJson = {};
        
                                handlerJson.value = jsonData;//formJsonFormat(jsonData,dialogForm);
                                handlerJson.controllerObj = controllerObj.func.config;
                                //by cy 20180508
                                //function和ajax的前后置回调
                                if(typeof(callback.ajaxBeforeHandler)=='function'){
                                    handlerJson.beforeHandler = function(data){
                                        return callback.ajaxBeforeHandler(data);
                                    };
                                }
                                if(typeof(callback.ajaxAfterHandler)=='function'){
                                    handlerJson.afterHandler = function(data){
                                        //判断返回值 只有success为true才可以关闭弹框
                                        if(typeof(data)=='undefined'){
                                            nsalert('返回值不能为undefined');
                                        }
                                        nsdialog.hide();
                                        return callback.ajaxAfterHandler(data);
                                        /*if(data.success){
                                            
                                        }else{
                                            //返回失败
                                            if(data.msg){
                                                //存在错误返回信息
                                            }
                                        }*/
                                    };
                                }
                                if(typeof(callbackFun) == 'function'){
                                    handlerJson.successFun = callbackFun;
                                    handlerJson.$btnDom=$btnDom;
                                }
        
                                /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                                handlerJson.dialogBeforeHandler = {
                                    btnOptionsConfig:obj.btnOptionsConfig,
                                    selectData:obj.value,
                                    containerFormJson:obj.containerFormJson
                                }
                                controllerObj.func.function(handlerJson);
                            }
                        }
                    }]
                }
                nsdialog.initShow(dialogJson);
            }
            //dialog和valueDialog公用弹窗
            function dialogCommon(callback,obj){
                //obj.value
                /* 	callback:object 回调函数对象 {ajaxBeforeHandler:funtion(){return}}
                 * 		{
                 *			dialogBeforeHandler:funtion(dialogFormJson){return dialogFormJson;}  	//弹出框弹出之前调用的回调参数 传递参数是弹框的配置参数
                 * 			ajaxBeforeHandler:funtion(ajaxConfig){return ajaxConfig;} 				//ajax调用前的回调参数，传递参数是ajax的所有参数
                 * 			ajaxAfterHandler:funtion(res){return res} 								//ajax调用后的回调参数，传递参数是服务器返回结果
                 * 		}
                    obj:object 注：此参数在任何情况下不允许传入 已经在框架初始化时赋值完成
                 */
                //by cy 20180508
                //dialog的前置回调
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    //加验证
                    obj = callback.dialogBeforeHandler(obj);
                }
                var controllerObj=obj.controllerObj;
                if(controllerObj.userMode === 'valueDialog'){
                    //如果当前弹框是valueDialog判断是否有返回值如果返回值为false，则提示必须有需要操作的值
                    if(obj.value === false){
                        var infoMsgStr = controllerObj.noSelectInfoMsg ? controllerObj.noSelectInfoMsg:'请选择要处理的数据';
                        nsalert(infoMsgStr,'error');
                        return false;
                    }
                }
            dialogContent(callback,obj);
            }
            
            //公用弹框内容调用
            function dialogContent(callback,obj){
                    var fieldValue = typeof(obj.value)=='object' ? obj.value : {};
                    var controllerObj = obj.controllerObj ? obj.controllerObj : {};
                    var functionField = obj.controllerObj.functionField;
                    var dialogField = [];
                    //如果指定functionField的情况下显示functionField下字段
                    if(typeof(functionField)=='object'){
                        dialogField = getDialogForm(businessObj,functionField);
                    }else{ 
                        if(typeof(functionField)=='string'&&functionField.indexOf('nsProject.getFieldsByState')==0){
                            // 通过状态获取字段
                            dialogField = eval(functionField);
                        }else{
                            //否则显示全部字段
                            dialogField = getDialogForm(businessObj,fieldValue);
                        }
                    }
                    //调整表单form中的下拉框data参数 
                    function getSelectData(fieldArr,fieldValue){
                        var newFieldArr = fieldArr;
                        if($.isEmptyObject(fieldValue)){
                            if(!$.isEmptyObject(obj.currentData)){
                                fieldValue = obj.currentData;
                            }
                        }
                        for(var fieldI = 0; fieldI<fieldArr.length; fieldI++){
                            //是否是ajax请求 需要转data参数
                            if(fieldArr[fieldI].url){
                                //存在url链接
                                function getSelectAjaxData(_params){
                                    var data = $.extend(true,{},_params);
                                    if(fieldArr[fieldI].dataFormat == 'ids'){
                                        if($.isArray(fieldValue)){
                                            var ids = [];
                                            for(var dataI=0; dataI<fieldValue.length; dataI++){
                                                ids.push(fieldValue[dataI][obj.options.idField]);
                                            }
                                            ids = ids.join(',');
                                            data.ids = ids;
                                        }else{
                                            data.ids = fieldValue[obj.options.idField];
                                        }
                                    }else{
                                        for(var param in data){
                                            if(typeof(data[param])=='string'&&
                                                (data[param].indexOf('this.')>-1||data[param].indexOf('page.')>-1||data[param].indexOf('search')>-1)
                                            ){
            
                                            }else{
                                                data[param] = nsVals.getTextByFieldFlag(data[param],fieldValue);
                                            }
                                            if(data[param] === 'undefined'){data[param] = '';}
                                        }
                                    }
                                    return data;
                                }
                                fieldArr[fieldI].data = typeof(fieldArr[fieldI].data)=='object' ? fieldArr[fieldI].data : {};
                                fieldArr[fieldI].data = getSelectAjaxData(fieldArr[fieldI].data);
                            }
                        }
                        return newFieldArr;
                    }
                    if(obj.controllerObj.defaultMode == 'valueDialog'){
                        dialogField = getSelectData(dialogField,fieldValue);
                        if(fieldValue && dialogField){
                            //sjj 20191014 start格式化参数
                            if(obj.controllerObj.parameterFormat){
                                var parameterFormat = obj.controllerObj.parameterFormat;
                                fieldValue = NetStarUtils.getFormatParameterJSON(JSON.parse(parameterFormat),fieldValue);
                            }
                            //sjj 20191014 end 格式化参数
                            //如果存在form并且存在默认值的情况
                            for(var formI = 0; formI<dialogField.length;formI++){
                                if(dialogField[formI].voField){
                                    dialogField[formI].id = dialogField[formI].voField;
                                }
                                dialogField[formI].value = fieldValue[dialogField[formI].id];
                            }
                        }
                    }
                    /****sjj 20180531 添加支持事件回调 start***/
                    /*changeHandlerData
                        *readonly:{id:false,name:false}
                        *disabled:{id:false,name:true}
                        *value:{id:'3333',name:"ddd"}
                        *hidden:{id:true,name:true}
                    */
                        // 判断是否有旧组件
                        var isOld = false;
                        for(var fieldI=0; fieldI<dialogField.length; fieldI++){
                            if(typeof(NetstarComponent[dialogField[fieldI].type])=="undefined"){
                                isOld = true;
                                break;
                            }
                        }
                        if(isOld){
                            dialogContentOld(callback,obj);
                            return;
                        }
                    var dialogJson = {
                        id:'dialogCommon',//typeof(obj.config.dialogId) == 'undefined'?'dialogCommon':obj.config.dialogId,
                        title: typeof(controllerObj.title) =='string'?controllerObj.title:'表单维护',
                        templateName:'PC',
                        shownHandler:function(data){
                            var formConfig = {
                                id: data.config.bodyId,
                                templateName: 'form',
                                componentTemplateName: 'PC',
                                defaultComponentWidth:'50%',
                                form:dialogField,
                                isSetMore:typeof(controllerObj.isSetMore) =='boolean'?controllerObj.isSetMore:false,
                                completeHandler:function(data){
                                    var dataConfig = data.config;
                                    var id = dataConfig.id;
                                    var footerId = id.substring(0,id.length-5)+'-footer-group';
                                    var btnJson = {
                                        id:footerId,
                                        pageId:id,
                                        btns:[
                                            {
                                                text:typeof(controllerObj.btnText) =='string'?controllerObj.btnText:'确认',
                                                handler:function(){
                                                    var jsonData = NetstarComponent.getValues('dialog-dialogCommon-body');
                                                    if(jsonData){
                                                        var handlerJson = {};
            
                                                        handlerJson.value = jsonData;//formJsonFormat(jsonData,dialogForm);
                                                        handlerJson.controllerObj = controllerObj.func.config;
                                                        //by cy 20180508
                                                        //function和ajax的前后置回调
                                                        if(typeof(callback.ajaxBeforeHandler)=='function'){
                                                            handlerJson.beforeHandler = function(data){
                                                                return callback.ajaxBeforeHandler(data);
                                                            };
                                                        }
                                                        if(typeof(callback.ajaxAfterHandler)=='function'){
                                                            handlerJson.afterHandler = function(data){
                                                                //判断返回值 只有success为true才可以关闭弹框
                                                                if(typeof(data)=='undefined'){
                                                                    nsalert('返回值不能为undefined');
                                                                }
                                                                NetstarComponent.dialog['dialogCommon'].vueConfig.close();
                                                                return callback.ajaxAfterHandler(data);
                                                                /*if(data.success){
                                                                    
                                                                }else{
                                                                    //返回失败
                                                                    if(data.msg){
                                                                        //存在错误返回信息
                                                                    }
                                                                }*/
                                                            };
                                                        }
                                                        /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                                                        handlerJson.dialogBeforeHandler = {
                                                            btnOptionsConfig:obj.btnOptionsConfig,
                                                            selectData:obj.value,
                                                            containerFormJson:obj.containerFormJson
                                                        }
                                                        controllerObj.func.function(handlerJson);
                                                    }
                                                }
                                            },{
                                                text:'关闭',
                                                handler:function(){
                                                    NetstarComponent.dialog['dialogCommon'].vueConfig.close();
                                                }
                                            }
                                        ]
                                    };
                                    //sjj 20190516 如果配置了getDataByAjax需要调用里面的配置
                                    if(!$.isEmptyObject(controllerObj.getDataByAjax)){
                                        btnJson.btns.unshift({
                                            text:controllerObj.getDataByAjax.btnText,
                                            handler:function(){
                                                //fieldValue
                                                var getDataByAjax  = $.extend(true,{},controllerObj.getDataByAjax);
                                                getDataByAjax.data = fieldValue;
                                                getDataByAjax.plusData = {dataSrc:controllerObj.getDataByAjax.dataSrc};
                                                NetStarUtils.ajax(getDataByAjax,function(res,ajaxData){
                                                    if(res.success){
                                                        NetstarComponent.fillValues(res[ajaxData.plusData.dataSrc],'dialog-dialogCommon-body');
                                                    }
                                                },true)
                                            }
                                        });
                                    }
                                    vueButtonComponent.init(btnJson);
                                },
                                // lyw 20191025 返回页面数据
                                getPageDataFunc : (function(pageValue){
                                    return function(){
                                        return pageValue;
                                    }
                                })(fieldValue)
                            };
                            NetstarComponent.formComponent.show(formConfig, fieldValue);
                            
                            //sjj 20191206 添加tipContent  tipClass :  默认 warn error success info 
                            if(controllerObj.tipContent){
                                var tipClassStr = controllerObj.tipClass;
                                $('#'+data.config.bodyId).prepend('<div class="tip-content"><span class="'+tipClassStr+'">'+controllerObj.tipContent+'</span></div>');
                            }
                        }
                    };
                    if(typeof(controllerObj.width) !=='undefined' && controllerObj.width!==""){
                        dialogJson.width = controllerObj.width;
                    }
                    if(typeof(controllerObj.height) !=='undefined' && controllerObj.height!==""){
                        dialogJson.height = controllerObj.height;
                    }
                    NetstarComponent.dialogComponent.init(dialogJson);
            
                }
            //ajax弹框
            function ajaxDialogCommon(callback,obj){
                //dialog的前置回调
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    //加验证
                    obj = callback.dialogBeforeHandler(obj);
                }
                var controllerObj = obj.controllerObj;
                var getListAjax = {
                    url:controllerObj.func.config.getUrl,
                    dataSrc:controllerObj.func.config.getDataSrc,
                    type:controllerObj.func.config.getType,
                    dataFormat:controllerObj.func.config.getDataFormat,
                    data:controllerObj.func.config.getData,
                    isAjaxDialog:true,//调用弹框调用ajax
                    contentType:controllerObj.func.config.getContentType,
                }
                getListAjax.data = $.extend(true,getListAjax.data,controllerObj.func.config.defaultData);
                var handlerJson = {
                    controllerObj:getListAjax,
                    value:obj.value,
                    beforeHandler:callback.ajaxBeforeHandler,
                    afterHandler:function(data){
                        obj.value = data;
                        dialogContent(callback,obj);
                    }
                }
                controllerObj.func.function(handlerJson);
            }
            function getPageConfig(backCount){
                var keys = Object.keys(nsFrame.containerPageData);
                if(keys.length > backCount){
                    //根据时间戳倒序排序
                    keys.sort(function(a,b){
                        return nsFrame.containerPageData[b].timeStamp - nsFrame.containerPageData[a].timeStamp;
                    });
                    return nsFrame.containerPageData[keys[backCount]];
                }
                return null;
            }
            function loadPageCommon(callback,obj){
                var url = obj.controllerObj.func.config.url;
                var paramObj = $.extend(true,{},obj.controllerObj.func.config.defaultData);
                var callback = callback.ajaxBeforeHandler(callback);
                var configObj = callback.dialogBeforeHandler(obj);
                var historyPageConfig = getPageConfig(0);
                var callBackUrl = window.location.href;
                if(historyPageConfig){
                    callBackUrl = historyPageConfig.url;
                }
                var jsonData = {
                    data:configObj.value,//接受到的参数
                    url:callBackUrl,//回传的url
                }
                if(typeof(NetstarTempValues)=='undefined'){NetstarTempValues = {};}
                var tempValueName = configObj.config.package + new Date().getTime();
                NetstarTempValues[tempValueName] = jsonData;
                if(url){
                    var url = url+'?templateparam='+encodeURIComponent(tempValueName);
                    if(NetStarUtils.Browser.browserSystem == 'mobile'){
                        nsFrame.loadPageVRouter(url);
                    }else{
                        nsFrame.loadPage(url);
                    }
                }else{
                    console.warn(obj.controllerObj.func);
                    nsalert('不存在url，无法跳转');
                }
            }
            //sjj 20190929 生成报告控件 先发送url链接请求然后根据请求返回参连接websocket
            function ajaxAndSendCommon(callBack,obj){
                var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
                callBack.controllerObj = functionConfig;
                var data = callBack.dialogBeforeHandler(callBack);//获取模板参数
                var templateConfig = data.config;
                //console.log(data.value)
                //var webSocketBody = '{"command":"报表打印","templateId":"a.b.c","listName":"dd","business":{"id":"{id}","reportTemplateId":"{reportTemplateId}"}}';
            
                var callbackAjax = functionConfig.callbackAjax ? getRootPath() + functionConfig.callbackAjax : "";
                if(functionConfig.url){
                    var ajaxConfig = {
                        url:functionConfig.url,
                        type:functionConfig.type,
                        contentType:functionConfig.contentType,
                        dataSrc:functionConfig.dataSrc,
                        plusData:{
                            webSocketBody:functionConfig.webSocketBody,
                            packageName:templateConfig.package,
                            ajaxAfterHandler:callBack.ajaxAfterHandler,
                            valueData:data.value,
                            callbackAjax:callbackAjax
                        },
                        //data:{
                            //templateName:templateConfig.package,
                            //deptId:NetstarMainPage.systemInfo.user.deptId,
                            //bllCateCode:'',
                            //languageName:'',
                        //}
                    };
                    ajaxConfig.data = NetStarUtils.getFormatParameterJSON(functionConfig.data,data.value);
                    NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
                        if(res.success){
                            var webSocketBody = ajaxOptions.plusData.webSocketBody;
                            var ptTemplateConfig = NetstarTemplate.templates.configs[ajaxOptions.plusData.packageName];
                            var ptTemplateValueData = ajaxOptions.plusData.valueData;
                            var resData = res[ajaxOptions.dataSrc];
                            webSocketBody = JSON.parse(webSocketBody);
                            if(webSocketBody.business){
                                webSocketBody.business = JSON.stringify(NetStarUtils.getFormatParameterJSON(webSocketBody.business,resData));
                            }else if(webSocketBody.fileId){
                                //cy 191026 修改 根据lyw截图
                                //webSocketBody.fileId = resData.fileId; 
                            }
                            var formatJson = {};
                            for(var formatI in webSocketBody){
                                switch(formatI){
                                    case 'command':
                                        break;
                                    case 'templateId':
                                        break;
                                    case 'listName':
                                        break;
                                    default:
                                        formatJson[formatI] = webSocketBody[formatI];
                                        break;
                                }
                            }
                            for(var paramsData in formatJson){
                                var valueData = {};
                                //cy 191026 修改 根据lyw截图
                                valueData[paramsData] = formatJson[paramsData];
                                // webSocketBody[paramsData] = NetStarUtils.getFormatParameterJSON(valueData,resData);
                                valueData = NetStarUtils.getFormatParameterJSON(valueData,resData);
                                webSocketBody[paramsData] = valueData[paramsData];
                            }
                            if(ajaxOptions.plusData.callbackAjax){
                                webSocketBody.callbackAjax = ajaxOptions.plusData.callbackAjax;
                            }
                            nschat.websocket.wsConnect(function(){
                                nschat.websocket.send(JSON.stringify(webSocketBody));
                            },function(){},'127.0.0.1:8888/Chat')
                            //链接websocket
                            //nschat.websocket.send(jsonString);
                            //nschat.websocket.send(JSON.stringify(webSocketBody));
                        }else{
                            nsalert('返回值为false','error');
                        }
                    },true)
                }else{
                    var webSocketBody = functionConfig.webSocketBody;
                    webSocketBody = JSON.parse(webSocketBody);
                    if(webSocketBody.business){
                        webSocketBody.business = JSON.stringify(NetStarUtils.getFormatParameterJSON(webSocketBody.business,data.value));
                    }else if(webSocketBody.fileId){
                        webSocketBody.fileId = data.value.fileId;
                    }
                    var formatJson = {};
                    for(var formatI in webSocketBody){
                        switch(formatI){
                            case 'command':
                                break;
                            case 'templateId':
                                break;
                            case 'listName':
                                break;
                            default:
                                formatJson[formatI] = webSocketBody[formatI];
                                break;
                        }
                    }
                    for(var paramsData in formatJson){
                        var valueData = {};
                        valueData[paramsData] = formatJson[paramsData];
                        webSocketBody[paramsData] = NetStarUtils.getFormatParameterJSON(valueData,data.value);
                    }
                    if(callbackAjax){
                        webSocketBody.callbackAjax = callbackAjax;
                    }
                    nschat.websocket.wsConnect(function(){
                        nschat.websocket.send(JSON.stringify(webSocketBody));
                        },function(){},'127.0.0.1:8888/Chat')
                }
            }
            //添加支持打开新标签页的方法
            function newTabCommon(callBack,obj){
                callBack.controllerObj = obj.controllerObj;
                var url = obj.controllerObj.func.config.suffix;
                obj = callBack.dialogBeforeHandler(callBack);
                var value = obj.value;
                if(value == false){
                    return;
                }
                if(typeof(value.parentSourceParam)=='object'){
                    value.parentSourceParam.isEditMode = obj.controllerObj.isEditMode;
                }
                var isContinue = true;
                if(!$.isEmptyObject(value)){
                        //sjj 20190926 判断url链接是否自带配置参数editModel
                        if(url.indexOf('?')>-1){
                            var search = url.substring(url.indexOf('?')+1,url.length);
                            var paramsObj = search.split('&');
                            var resultObject = {};
                            for (var i = 0; i < paramsObj.length; i++){
                                idx = paramsObj[i].indexOf('=');
                                if (idx > 0){
                                    resultObject[paramsObj[i].substring(0, idx)] = paramsObj[i].substring(idx + 1);
                                }
                            }
                            if(typeof(value)!='object'){value = {};}
                            $.each(resultObject, function (key, text) {
                                value[key] = text;
                         });
                         url = url.substring(0,url.indexOf('?'));
                        }
        
                    var tempValueName = obj.config.package + new Date().getTime();
                        NetstarTempValues[tempValueName] = value;
                        if(obj.controllerObj.func.config.parameterFormat){
                            var parameterFormat = JSON.parse(obj.controllerObj.func.config.parameterFormat);
                            var chargeData = nsVals.getVariableJSON(parameterFormat,NetstarTempValues[tempValueName]);
                            switch(obj.controllerObj.func.config.parameterFormatType){
                                case 'cover': // 覆盖
                                    NetstarTempValues[tempValueName] = chargeData;
                                    break;
                                default:
                                    // 添加
                                    nsVals.extendJSON(NetstarTempValues[tempValueName],chargeData);
                                    break;
                            }
                        }
                        //sjj 20190418 是否配置了isCopyObject
                        if(obj.controllerObj.func.config.isCopyObject){
                            for(var value in NetstarTempValues[tempValueName]){
                                if(typeof(NetstarTempValues[tempValueName][value])=='object'){
                                    delete NetstarTempValues[tempValueName][value];
                                }
                            }
                        }
                        url = url+'?templateparam=' + encodeURIComponent(tempValueName);
                 } 
                    // 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 lyw 20190620 start ---
                    var defaultPageData = {};
                    var formatValueData = obj.controllerObj.formatValueData; 
                    // 转化对象
                    if(typeof(formatValueData) == "string" && formatValueData.length>0){
                        formatValueData = JSON.parse(formatValueData);
                    }
                    if(typeof(formatValueData) == "object"){
                        var pageOperateData = {};
                        if(typeof(NetstarTemplate.getOperateData) == "function"){
                            pageOperateData = NetstarTemplate.getOperateData(obj.config);
                        }
                        defaultPageData = NetStarUtils.getFormatParameterJSON(formatValueData, pageOperateData);
                    }
                    // 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 lyw 20190620 end ---
                    var isAlwaysNewTab = typeof(obj.controllerObj.func.config.isAlwaysNewTab)=='boolean' ? obj.controllerObj.func.config.isAlwaysNewTab : true;
                    
                    var validStr = '';
                    if(obj.controllerObj.validateParams){
                        var validateParams = JSON.parse(obj.controllerObj.validateParams);
                        for(var valid in validateParams){
                            switch(typeof(value[valid])){
                                case 'string':
                                    if(value[valid] == ''){
                                        isContinue = false;
                                    }
                                    break;
                                case 'object':
                                    if($.isEmptyObject(value[valid])){
                                        isContinue = false;
                                    }
                                    break;
                                case 'undefined':
                                    isContinue = false;
                                    break;
                            }
                            if(isContinue == false){
                                validStr += validateParams[valid]+';';
                                break;
                            }
                        }
                    }
                    if(isContinue){
                        var titleStr = obj.controllerObj.title;
                        //添加对标题的判断，标题必填，不然之后会报错 cy 191119
                        if(typeof(titleStr)!='string'){
                            console.error('方法标题(title)必填',controllerObj);
                            titleStr = '未定义标题';
                        }
                        if(!$.isEmptyObject(value)){
                            titleStr = NetStarUtils.getHtmlByRegular(value,titleStr);
                        }
                        NetstarUI.labelpageVm.loadPage(url,titleStr, isAlwaysNewTab, defaultPageData);
                    }else{
                        nsalert(validStr,'warning');
                    }
                }
                function viewerDialogCommon(callBack,obj){
                    var url = obj.controllerObj.func.config.url;
                    var pageObj = callBack.dialogBeforeHandler(obj);
                    pageObj.value = typeof(pageObj.value) == 'object' ? pageObj.value : {};
                    pageObj.value.readonly = true;
                    var tempValueName = pageObj.config.package + new Date().getTime();
                    NetstarTempValues[tempValueName] = pageObj.value;
                    url = url+'?templateparam=' + encodeURIComponent(tempValueName);
                    var ajaxConfig = {
                            //url:url,
                            //type:'GET',
                            plusData:{value:pageObj.value},
                            pageIidenti : url,
                            paramObj : pageObj.value,
                            url : url,
                            callBackFunc:function(isSuccess, data, _pageConfig){
                                    if(isSuccess){
                                    var _config = _pageConfig.config;
                                    var _configStr = JSON.stringify(_config);
                                    var valueJson = {value:_pageConfig.plusData.value};
                                    var pageOperateDataStr = JSON.stringify(valueJson);
                                    var funcStr = 'nsProject.showPageData(pageConfig,' +pageOperateDataStr + ',' +  _configStr + ')';
                                    var starStr = '<container>';
                                    var endStr = '</container>';
                                    var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
                                    var exp = /NetstarTemplate\.init\((.*?)\)/;
                                    var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                                    containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
                                    var $container = nsPublic.getAppendContainer();
                                    $container.append(containerPage);
                                    }
                            }
                    };
                    pageProperty.getAndCachePage(ajaxConfig);
                    /*NetStarUtils.ajaxForText(ajaxConfig,function(data,ajaxOptions){
                            var _config = ajaxOptions.plusData.config;
                            var valueJson = {value:_config.value};
                            var _configStr = JSON.stringify(valueJson);
                            var funcStr = 'nsProject.showPageData(pageConfig,'+_configStr+')';
                            //var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
                            var starStr = '<container>';
                            var endStr = '</container>';
                            var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
                            var exp = /NetstarTemplate\.init\((.*?)\)/;
                            var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                            containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
                            var $container = nsPublic.getAppendContainer();
                            $container.append(containerPage);
                    });*/
                    /*var ajaxConfig = {
                        url:url,
                        type:'GET',
                        dataType:'html',
                        context:{
                            config:pageObj
                        },
                        success:function(data){
                            var _config = this.config;
                            var valueJson = {value:_config.value};
                            var _configStr = JSON.stringify(valueJson);
                            var funcStr = 'nsProject.showPageData(pageConfig,'+_configStr+')';
                            //var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
                            var starStr = '<container>';
                            var endStr = '</container>';
                            var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
                            var exp = /NetstarTemplate\.init\((.*?)\)/;
                            var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                            containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
                            var $container = nsPublic.getAppendContainer();
                            $container.append(containerPage);
                        }
                    };
                    $.ajax(ajaxConfig);*/
                }
                //sjj 20190815 mutliDialog 多个url链接拼接成一个tab页面
                function multiDialogCommon(callback,obj){
                    var pageDataObj = callback.dialogBeforeHandler(obj);
                    pageDataObj.value = typeof(pageDataObj.value) == 'object' ? pageDataObj.value : {};
                    var titleArr = [];
                    if(obj.controllerObj.title){
                        titleArr = obj.controllerObj.title.split(',');
                    }
                    var urlArr = [];
                    if(obj.controllerObj.func.config.url){
                        urlArr = obj.controllerObj.func.config.url.split(',');
                    }
                    var titleStr = obj.controllerObj.tabTitles ? obj.controllerObj.tabTitles : '多tab页面';
                    var controllerObj = obj.controllerObj ? obj.controllerObj : {};
                    if(controllerObj.parameterFormat){
                        var parameterFormat = controllerObj.parameterFormat;
                        pageDataObj.value = NetStarUtils.getFormatParameterJSON(JSON.parse(parameterFormat),pageDataObj.value);
                    }
                    var dialogCommon = {
                        id:'multitab-dialog-url',
                        title: titleStr,
                        templateName: 'PC',
                        height:'auto',
                        width:1170,
                        plusClass:'multiDialog',
                        shownHandler:function(data){
                                var $dialog = $('#'+data.config.dialogId);
                                var $dialogBody = $('#'+data.config.bodyId);
                                var ulId = data.config.bodyId + '-ul';
                                $dialog.addClass('pt-modal-content-lg');
                                $dialogBody.addClass('pt-modal-tab');
                                var tabContentId = data.config.bodyId+'-container';
                                var liHtml = '';
                                var tabContentHtml = '';
                                for(var titleI=0; titleI<titleArr.length; titleI++){
                                        var classStr = titleI === 0 ? 'current' : '';
                                     // var contentClassStr = titleI === 0 ? '' : 'hide';
                                        var id = data.config.bodyId +'-li-'+titleI;
                                        liHtml += '<li class="pt-nav-item '+classStr+'" id="'+id+'">'
                                                                +'<a href="javascript:void(0);" ns-url="'+urlArr[titleI]+'">'+titleArr[titleI]+'</a>'
                                                        +'</li>';
                                        //tabContentHtml += '<div id="'+id+'"></div>';
                                }
                                var headerHtml = 
                                   '<div class="pt-tab-header">\
                                      <div class="pt-nav">\
                                         <ul id="'+ulId+'">'
                                             + liHtml
                                         +'</ul>\
                                      </div>\
                                   </div>';
                                if(titleArr.length == 0){
                                    $dialog.addClass('pt-modal-notab');
                                }
                                $('#'+data.config.headId).append(headerHtml);
        
                                //sjj 20191206 添加tipContent  tipClass :  默认 warn error success info 
                                var tipContentHtml = '';
                                if(controllerObj.tipContent){
                                    var tipClassStr = controllerObj.tipClass;
                                    tipContentHtml.prepend('<div class="tip-content"><span class="'+tipClassStr+'">'+controllerObj.tipContent+'</span></div>');
                                }
        
                                var html = tipContentHtml+'<div class="pt-othertab">'
                                                +'<div class="pt-container">'
                                                        // +'<div class="pt-othertab-header">'
                                                        // 		+'<div class="pt-nav">'
                                                        // 				+'<ul id="'+ulId+'">'
                                                        // 						+liHtml
                                                        // 				+'</ul>'
                                                        // 		+'</div>'
                                                        // +'</div>'
                                                        +'<div class="pt-othertab-body">'
                                                                +'<div class="pt-othertab-content">'
                                                                        +'<div id="'+tabContentId+'"></div>'
                                                                +'</div>'
                                                        +'</div>'
                                                        +'<div class="pt-othertab-footer"></div>'
                                                +'</div>'
                                        +'</div>';
                                $dialogBody.html(html);
                                function getConfigByUrl(url){
                                        var pageObj = {
                                                containerId:tabContentId,
                                                pageParam:pageDataObj.value,
                                        };
                                        var tempValueName = pageDataObj.config.package + new Date().getTime();
                                        NetstarTempValues[tempValueName] = pageDataObj.value;
                                        url = url+'?templateparam=' + encodeURIComponent(tempValueName);
                                        
                                        var ajaxConfig = {
                                                //url:url,
                                                //type:'GET',
                                                plusData:{pageObj:pageObj},
                                                pageIidenti : url,
                                                paramObj : pageDataObj.value,
                                                url : url,
                                                callBackFunc:function(isSuccess, data, _pageConfig){
                                                        if(isSuccess){
                                                            var _config = _pageConfig.plusData.pageObj;
                                                            var _configStr = JSON.stringify(_config);
                                                            var funcStr = 'NetstarTemplate.getConfigByAjaxUrl(pageConfig,'+_configStr+')';
                                                            var starStr = '<container>';
                                                            var endStr = '</container>';
                                                            var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
                                                            var exp = /NetstarTemplate\.init\((.*?)\)/;
                                                            var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                                                            containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
                                                            var $container = nsPublic.getAppendContainer();
                                                            $container.append(containerPage);
                                                        }
                                                }
                                        };
                                        pageProperty.getAndCachePage(ajaxConfig);
                                        /*
                                        var ajaxConfig = {
                                                url:url,
                                                type:'GET',
                                                dataType:'html',
                                                context:{
                                                        config:pageObj
                                                },
                                        };
                                        NetStarUtils.ajaxForText(ajaxConfig,function(data,_this){
                                                var _config = _this.config;
                                                var _configStr = JSON.stringify(_config);
                                                var funcStr = 'NetstarTemplate.getConfigByAjaxUrl(pageConfig,'+_configStr+')';
                                                var starStr = '<container>';
                                                var endStr = '</container>';
                                                var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
                                                var exp = /NetstarTemplate\.init\((.*?)\)/;
                                                var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                                                containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
                                                var $container = $('container');
                                                $container.append(containerPage);
                                        });*/
                                }
                                $('#'+ulId+' li > a').on('click',function(ev){
                                        var $this = $(this);
                                        var url = $this.attr('ns-url');
                                        var id = $this.closest('li').attr('id');
                                        $this.closest('li').addClass('current');
                                        $this.closest('li').siblings().removeClass('current');
                                        getConfigByUrl(url);
                                });
                            getConfigByUrl(urlArr[0]);
                        }
                };
                NetstarComponent.dialogComponent.init(dialogCommon);
                }
            //topage弹出界面 sjj20180518
            function toPageCommon(callback,obj){
                var url = obj.controllerObj.func.config.url;
                var paramObj = $.extend(true,{},obj.controllerObj.func.config.defaultData);
                var callback = callback.ajaxBeforeHandler(callback);
                obj = callback.dialogBeforeHandler(obj);
                var configObj = callback.config;
                var value = obj.value;
                if(value){
                    var templateObj = eval(configObj.package);
                    templateObj.pageParams = value;
                    templateObj.descritute = obj.btnOptionsConfig.descritute;
                    paramObj.package = configObj.package;
                }
                /*if(obj.rowData){
                    var rowData = $.extend(true,{},obj.rowData);
                    var templateObj = eval(configObj.package);
                    templateObj.pageParams = rowData;
                    console.log(templateObj)
                    paramObj.template = configObj.package;
                    //paramObj = $.extend(true,paramObj,rowData);
                }*/
                if(!$.isEmptyObject(paramObj)){
                    paramObj = JSON.stringify(paramObj);
                    var urlStr =  encodeURIComponent(encodeURIComponent(paramObj));
                    url = url+'?templateparam='+urlStr;
                }
                //nsFrame.popPage(url);
                var config = {
                    url:url,
                    loadedHandler:function(){
                        return callback.loadPageHandler(obj);
                    },
                    closeHandler:function(){
                        return callback.closePageHandler(obj);
                    }
                }
                if(obj.controllerObj.width){
                    config.width = obj.controllerObj.width;
                }
                if(obj.controllerObj.height){
                    config.height = obj.controllerObj.height;
                }
                if(obj.controllerObj.title){
                    config.title = obj.controllerObj.title;
                }
                nsFrame.popPageConfig(config);
                //跳转链接
            }
            //changePage 跳转界面 sjj20180606
            function changePageCommon(callback,obj){
                var url = obj.controllerObj.func.config.url;
                var paramObj = obj.controllerObj.func.config.defaultData;
                var callback = callback.ajaxBeforeHandler(callback);
                obj = callback.dialogBeforeHandler(obj);
                var configObj = callback.config;
                var value = obj.value;
                if(value){
                    var templateObj = eval(configObj.package);
                    templateObj.pageParams = value;
                    paramObj.package = configObj.package;
                }
                /*if(obj.rowData){
                    var rowData = $.extend(true,{},obj.rowData);
                    var templateObj = eval(configObj.package);
                    templateObj.pageParams = rowData;
                    //paramObj = $.extend(true,paramObj,rowData);
                }*/
                if(!$.isEmptyObject(paramObj)){
                    paramObj = JSON.stringify(paramObj);
                    var urlStr =  encodeURIComponent(encodeURIComponent(paramObj));
                    url = url+'?templateparam='+urlStr;
                }
                window.location.href = url;
            }
            //自定义组件调用
            function changeComponentCommon(callBack,obj){
                var controllerObj = obj.controllerObj;
                var funcObj = eval(controllerObj.componentName);
                function componentCompleteHandler(data){
                    var value = {ids:data.value.join(',')};
                    var completeAjax = controllerObj.func.config;
                    completeAjax.data = $.extend(true,completeAjax.data,controllerObj.func.config.defaultData);
                    var handlerJson = {
                        controllerObj:completeAjax,
                        value:value,
                        beforeHandler:callBack.ajaxBeforeHandler,
                        afterHandler:function(data){
                            callBack.ajaxAfterHandler(data);
                        }
                    }
                    controllerObj.func.function(handlerJson);
                }
                var pageConfig = {
                    callback:callBack,
                    obj:obj
                };
                funcObj.init({},componentCompleteHandler,pageConfig);
            }
            //打印  sjj 20180928
            function printCommon(callBack,obj){
                nschat.websocket.wsConnect(function(){
                    obj = callback.dialogBeforeHandler(obj);
                    var idField = obj.btnOptionsConfig.descritute.idField;
                    var id = obj.value[idField];
                    var jsonData = {
                        id:'1279797681833092073',
                        command:'报表打印'
                    }
                    if(obj.controllerObj.data){
                        if(obj.controllerObj.data.id){
                            var match = /\{([^:]*?)\}/g.exec(obj.controllerObj.data.id);
                            jsonData.id = match[1];
                        }
                    }
                    var businessId = {};
                    businessId[idField] = id;
                    jsonData.businessId = businessId;
                    var jsonString = JSON.stringify(jsonData);
                    nschat.websocket.send(jsonString);
                },function(){},'127.0.0.1:8888/Chat')
                /*nschat.websocket.wsConnect(function(){
                  nschat.websocket.send('{"command":"报表模板编辑","id":12345664}');
                },function(){});*/
            }
            //工作流监控弹框
            function workflowViewer(callBack, obj){
                var rowData = obj.rowData;
                var id = callBack.data.id;
                if(typeof(rowData)=='undefined'){
                    var dialogConfig = callBack.dialogBeforeHandler(callBack);
                    rowData = dialogConfig.value;
                    if(typeof(rowData)=='object'){
                        if($.isArray(rowData.selectedList)){
                            rowData = rowData.selectedList[0];
                        }
                    }
                }
                if(typeof(rowData)!='object'){rowData = {}};
                var workitemId = rowData.workItemId;
                if(typeof(workitemId)!='undefined'){
                    // nsUI.flowChartViewer.dialog.show(workitemId);
                    var flowChartViewerConfig = {
                        id : id + '-' + workitemId,
                        workitemId : workitemId,
                        title : '流程监控',
                        attrs : {},
                    }
                    NetstarUI.flowChartViewer.tab.init(flowChartViewerConfig);
                }else{
                    console.error('没有找到workitemId');
                    console.error(rowData);
                }
                return;
            }
            //工作流按钮配置
            function workflowSubmit(callBack, obj){
                var rowData = obj.rowData;
                // 查看办理意见不识别workitemId识别instanceIds(郑天祥,董超) 所以特殊处理   
                var controllerObj = obj.controllerObj;
                var workflowType = controllerObj.workflowType;
                if(typeof(rowData)=='undefined'){
                    var dialogConfig = callBack.dialogBeforeHandler(callBack);
                    rowData = dialogConfig.value;
                    // if(typeof(rowData)=='object'){
                    // 	if($.isArray(rowData.selectedList)){
                    // 		rowData = rowData.selectedList[0];
                    // 	}
                    // }
                }
                if(typeof(rowData)!='object'){rowData = {}};
                switch(workflowType){
                    case 'findHandleRec':
                        if($.isArray(rowData.selectedList)){
                            rowData = rowData.selectedList[0];
                        }
                        var instanceIds = rowData.instanceIds;
                        if(typeof(instanceIds)!='undefined'){
                            var operationFunc = nsEngine.operation().instanceIds(instanceIds).submitAllBatch(true).build();
                            if(typeof(operationFunc[workflowType])=="function"){
                                operationFunc[workflowType]();
                            }else{
                                console.error(workflowType+'方法不存在');
                                console.error(operationFunc);
                            }
                        }else{
                            console.error('没有找到instanceIds');
                            console.error(rowData);
                        }
                        break;
                    default:
                        var workitemId = rowData.workItemId;
                        if($.isArray(rowData.selectedList)){
                            if(workflowType == "multiSubmit"){
                                workitemId = [];
                                for(var i=0; i<rowData.selectedList.length; i++){
                                    if(rowData.selectedList[i].workItemId){
                                        workitemId.push(rowData.selectedList[i].workItemId);
                                    }
                                }
                                if(workitemId.length == 0){
                                    workitemId = undefined;
                                }
                            }else{
                                rowData = rowData.selectedList[0];
                                workitemId = rowData.workItemId;
                            }
                        }
                        // var workitemId = rowData.workItemId;
                        if(typeof(workitemId)!='undefined'){
                            switch(workflowType){
                                case 'submitAllBatch':
                                    var operationFunc = nsEngine.operation().workitemId(workitemId).submitAllBatch(true).build();
                                    workflowType = 'submit';
                                    break;
                                case 'multiSubmit':
                                    var operationFunc = nsEngine.operation().workitemIds(workitemId).build();
                                    break;
                                default:
                                    var operationFunc = nsEngine.operation().workitemId(workitemId).build();
                                    break;
                            }
                            if(typeof(operationFunc[workflowType])=="function"){
                                operationFunc[workflowType](function(resp){
                                    nsAlert(controllerObj.text+'成功', 'success');
                                    if(callBack){
                                        if(typeof(callBack.ajaxAfterHandler)=='function'){
                                            callBack.ajaxAfterHandler({});
                                        }
                                    }
                                    // console.log(resp);
                                    // var $tr = obj.obj.parents("tr");
                                    // $tr.find('button').attr('disabled',true);
                                },function(resp){
                                    nsAlert(controllerObj.text+'失败', 'error');
                                    console.error(resp);
                                });
                            }else{
                                console.error(workflowType+'方法不存在');
                                console.error(operationFunc);
                            }
                        }else{
                            console.error('没有找到workitemId');
                            console.error(rowData);
                        }
                        break;
                }
                return;
            }
            //sjj 20190524 defaultMode successMessage
            function successMessage(callback,obj){
                    var titleStr = obj.controllerObj.title ? obj.controllerObj.title : '请选择对本单据的处理,按 《《Esc》》键放弃本次处理';
                    var controllerObj = obj.controllerObj;
                    //dialog的前置回调
                    var dialogBeforeConfigData = {};
                    if(typeof(callback.dialogBeforeHandler)=='function'){
                        //加验证
                        dialogBeforeConfigData = callback.dialogBeforeHandler(obj);
                    }
                    //确认弹窗提示信息
                    var ajaxObj = {
                        dialogBeforeHandler:{
                            btnOptionsConfig:dialogBeforeConfigData.btnOptionsConfig,
                        },
                        value:dialogBeforeConfigData.value,
                        controllerObj:controllerObj.func.config,
                        templateConfig:dialogBeforeConfigData.config
                    };
                    if(typeof(ajaxObj.value)!='object'){
                        ajaxObj.value = {};
                    }
                    /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                    if(typeof(callback.ajaxBeforeHandler)=='function'){
                        ajaxObj.beforeHandler = function(data){
                            return callback.ajaxBeforeHandler(data);
                        };
                    }
                    if(typeof(callback.ajaxAfterHandler)=='function'){
                        ajaxObj.afterHandler = function(data,ajaxData){
                            NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
                            return callback.ajaxAfterHandler(data,ajaxData);
                        };
                    }
                    //btnsConfig
                    var btnsArray = [];
                    if(!$.isArray(controllerObj.btnsConfig)){
                        btnsArray = [
                            {
                                text:'保存',
                                handler:function(){
                                    //nsconfirm('是否确认保存？',function(isDelete){
                                        //if(isDelete){
                                            //获取界面值
                                            var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
                                            if(ajaxValue){
                                                ajaxObj.value = ajaxValue;
                                                ajaxObj.value.saveParam = NSSAVEDATAFLAG.ADD;
                                                ajaxObj.objectState = NSSAVEDATAFLAG.VIEW;
                                                ajaxObj.controllerObj.clickBtnType = 'isUseSave'; // lyw 20190614
                                                controllerObj.func.function(ajaxObj);
                                            }else{
                                                nsalert('请填写数据','warning');
                                            }
                                    //	}
                                    //},'warning')
                                }
                            },{
                                text:'保存|提交',
                                handler:function(){
                                    //nsconfirm('是否确认保存并提交？',function(isDelete){
                                        //if(isDelete){
                                            var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
                                            if(ajaxValue){
                                                ajaxObj.value = ajaxValue;
                                                ajaxObj.value.saveParam = NSSAVEDATAFLAG.EDIT;
                                                ajaxObj.objectState = NSSAVEDATAFLAG.DELETE;
                                                ajaxObj.controllerObj.clickBtnType = 'isUseSaveSubmit'; // lyw 20190614
                                                controllerObj.func.function(ajaxObj);
                                            }else{
                                                nsalert('请填写数据','warning');
                                            }
                                    //	}
                                    //},'warning')
                                }
                            },{
                                text:'保存草稿',
                                handler:function(){
                                    //isUser true isSaveBtn
                                    dialogBeforeConfigData.config.draftBox.isUse = true;
                                    function func(){
                                        //关闭当前弹出框
                                        NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
                                    }
                                    NetstarTemplate.draft.btnManager.save(dialogBeforeConfigData.config,func);
                                }
                            }
                        ]
                    }else{
                        for(var btnI=0; btnI<controllerObj.btnsConfig.length; btnI++){
                            switch(controllerObj.btnsConfig[btnI]){
                                case 'isUseSave':
                                    btnsArray.push({
                                        text:'保存',
                                        handler:function(_btnConfig){
                                            //nsconfirm('是否确认保存？',function(isDelete){
                                                //if(isDelete){
                                                    var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
                                                    
                                                    if(ajaxValue == false){
        
                                                        //获取数据被表单字段验证拦截了 返回为false
                                                        nsalert('请填写数据','warning');
        
                                                    }else{
        
                                                        //保存之前 根据表达式验证整体页面录入数据是否合法 cy 2019.06.13 start------
                                                        var validData = $.extend(true, {}, ajaxValue);
                                                        var validConfig = ajaxObj.controllerObj.validateParams;  //该值可能是string 方法内部转换
                                                        var isValid = NetStarUtils.getPageValidResult(validData, validConfig);
                                                        //保存之前验证整体页面录入数据是否合法 cy 2019.06.13 end  ------
        
                                                        if(isValid == false){
                                                            //验证失败不执行
                                                        }else{
                                                            $(_btnConfig.event.currentTarget).attr('disabled',true);//按钮禁用
                                                            ajaxObj.value = ajaxValue;
                                                            ajaxObj.value.saveParam = NSSAVEDATAFLAG.ADD;
                                                            ajaxObj.objectState = NSSAVEDATAFLAG.VIEW;
                                                            ajaxObj.controllerObj.clickBtnType = 'isUseSave'; // lyw 20190614
                                                            ajaxObj.$btnDom = $(_btnConfig.event.currentTarget);
                                                            ajaxObj.successFun = function(msg,$btnDom){
                                                                $btnDom.removeAttr('disabled');
                                                            }
                                                            controllerObj.func.function(ajaxObj);
                                                        }
                                                    }
                                                    
                                                    
        
                                            //	}
                                            //},'warning')
                                        }
                                    });
                                    break;
                                case 'isUseSaveSubmit':
                                btnsArray.push({
                                    text:'保存|提交',
                                    handler:function(){
                                        //nsconfirm('是否确认保存并提交？',function(isDelete){
                                            //if(isDelete){
                                                var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
                                                if(ajaxValue){
                                                    ajaxObj.value = ajaxValue;
                                                    ajaxObj.value.saveParam = NSSAVEDATAFLAG.EDIT;
                                                    ajaxObj.objectState = NSSAVEDATAFLAG.DELETE;
                                                    ajaxObj.controllerObj.clickBtnType = 'isUseSaveSubmit'; // lyw 20190614
                                                    controllerObj.func.function(ajaxObj);
                                                }else{
                                                    nsalert('请填写数据','warning');
                                                }
                                        //	}
                                        //},'warning')
                                    }
                                })
                                    break;
                                case 'isUseDraft':
                                    btnsArray.push({
                                        text:'保存草稿',
                                        handler:function(){
                                            //isUser true isSaveBtn
                                            dialogBeforeConfigData.config.draftBox.isUse = true;
                                            function func(){
                                                //关闭当前弹出框
                                                NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
                                            }
                                            NetstarTemplate.draft.btnManager.save(dialogBeforeConfigData.config,func);
                                        }
                                    });
                                    break;
                            }
                        }
                    }
                    btnsArray.push({
                            text:'废弃退出',
                            handler:function(){
                                    //关闭当前弹出框
                                    NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
                                    NetstarUI.labelpageVm.removeCurrent();
                                    //刷新界面
                            }
                    });
                    var dialogCommon = {
                        id:'btn-dialog-panel',
                        title: '保存提示',
                        templateName: 'PC',
                        height:120,
                        plusClass:'pt-confirm',
                        shownHandler:function(data){
                                var html = '<p class=""><i class="icon-info"></i>'+titleStr+'</p>';
                                $('#'+data.config.bodyId).html(html);
                                var btnJson = {
                                        id:data.config.footerIdGroup,
                                        pageId:'btn-'+data.config.footerIdGroup,
                                        btns:btnsArray,
                                };
                                vueButtonComponent.init(btnJson);
                        }
                    }
                    NetstarComponent.dialogComponent.init(dialogCommon);
            }
            // lyw 表格导入
            function excelImportVer2(callback,obj){
                var controllerObj = obj.controllerObj;
                var importConfig = {
                    type : 'dialog',
                    id : callback.data.id + '-import',
                    title : controllerObj.title,
                    templateId : controllerObj.templateId,
                }
                if(typeof(callback.dataImportComplete) == "function"){
                    importConfig.completeHandler = callback.dataImportComplete;
                }
                
                NetstarExcelImport.init(importConfig);
            }
            // lyw 业务组件
            function businessInit(callback,obj){
                var controllerObj = obj.controllerObj;
                var btnConfig = callback.data;
                var sourceBtnConfig = controllerObj.func.config;
                nsProject.businessBtnManage.configs = typeof(nsProject.businessBtnManage.configs) == "object" ? nsProject.businessBtnManage.configs : {};
                nsProject.businessBtnManage.configs[btnConfig.id] = {
                    callback : callback,
                    controller : controllerObj,
                };
                var pageConfig = {
                    pageIidenti : sourceBtnConfig.url,
                    url : sourceBtnConfig.url,
                    plusData:{
                        btnId : btnConfig.id,
                    },
                    contentType:sourceBtnConfig.contentType,
                    callBackFunc : function(isSuccess, data, _pageConfig){
                        if(isSuccess){
                            var plusData = _pageConfig.plusData;
                            var businessBtn = nsProject.businessBtnManage.configs[plusData.btnId];
                            var _configStr = JSON.stringify(plusData);
                            var funcStr = 'nsProject.businessBtnManage.dialog(pageConfig, '+_configStr+')';
                            var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
                            var $container = nsPublic.getAppendContainer();
                            var $containerPage = $(containerPage);
                            businessBtn.$containerPage = $containerPage;
                            $container.append($containerPage);
                        }
                    },
                }
                pageProperty.getAndCachePage(pageConfig);
            }
            // 通过ids获取文件信息
            function getFileByIds(ids, config, callBackFunc){
                var ajaxConfig = {
                    url : getRootPath() + '/files/getListByIds',
                    data : {
                        ids : ids,
                        hasContent: false,
                    },
                    type : 'GET',
                    //cy 191026 修改 根据lyw截图
                    contentType:'application/x-www-form-urlencoded',
                    plusData : {
                        callBackFunc : callBackFunc,
                        config: config,
                    },
                }
                NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                    if(res.success){
                        var plusData = _ajaxConfig.plusData;
                        var _config = plusData.config;
                        if(typeof(res.rows) != "object"){
                            nsAlert('获取文件返回值错误','error');
                            console.error('获取文件返回值错误');
                            console.error(res);
                            console.error(_config);
                            return false;
                        }
                        if(typeof(plusData.callBackFunc) == "function"){
                            plusData.callBackFunc(res.rows, _config);
                        }
                    }else{
                        // nsalert("获取文件失败");
                        console.error(res.msg, 'error');
                    }
                })
            }
            function previewFileShow(files, config){
                var _files = [];
                for(var i=0; i<files.length; i++){
                    var contentType = files[i].contentType;
                    var suffix = contentType.substring(contentType.lastIndexOf('/')+1);
                    //cy 191026 修改 根据lyw截图
                    if(files[i].suffix){
                        suffix = files[i].suffix;
                    }
        
                    var fileObj = {
                        id : files[i].id,
                        originalName : files[i].originalName,
                        suffix : suffix,
                    };
                    _files.push(fileObj);
                }
                NetstarUI.pdfDialog.dialog({
                    url:        '',
                    zoomFit:    'width',
                    isDownload: true,             //是否有下载
                    urlArr :  	_files,
                    pdfUrlPrefix : getRootPath() + '/files/pdf/',
                    imgUrlPrefix : getRootPath() + '/files/images/',
                });
            }
            // 文件预览
            function previewFileInit(callback,obj){
                var pageData = {};
                // if(typeof(callback.getOperateData) == "function"){
                // 	operateData = callback.getOperateData();
                // }else{
                // 	if(typeof(callback.dialogBeforeHandler) == "function"){
                // 		var befData = callback.dialogBeforeHandler(callback);
                // 		if(befData &&　befData.config){
        
                // 		}
                // 	}
                // }
                if(typeof(callback.dialogBeforeHandler) == "function"){
                    var befData = callback.dialogBeforeHandler(callback);
                    if(befData){
                        pageData = befData.value;
                    }
                }
                var controllerObj = obj.controllerObj;
                var btnConfig = controllerObj.func.config;
                var data = NetStarUtils.getFormatParameterJSON(btnConfig.data, pageData);
                if(btnConfig.url.length == 0){
                    nsAlert('没有配置地址信息', 'error');
                    console.error('没有配置地址信息');
                    return false;
                }
                var ajaxConfig = {
                    url : btnConfig.url,
                    type : btnConfig.type ? btnConfig.type : 'POST',
                    contentType : btnConfig.contentType ? btnConfig.contentType : 'application/x-www-form-urlencoded',
                    data : data,
                    plusData : {
                        config : btnConfig,
                    },
                }
                NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                    var plusData = _ajaxConfig.plusData;
                    var _config = plusData.config;
                    var dataSrc = _config.dataSrc;
                    var data = res[dataSrc] ? res[dataSrc] : {};
        
                    if(!$.isArray(data)){
                        data = [data];
                    }
        
                    var fileFields = _config.fileFields;
                    // 通过fileFields获取data中的文件id
                    var ids = [];
        
                    var fileFieldsArr = fileFields.split(',');
                    for(var listI=0; listI<data.length; listI++){
                        var _data = data[listI];
                        for(var i=0; i<fileFieldsArr.length; i++){
                            if(typeof(_data[fileFieldsArr[i]]) != "undefined" && _data[fileFieldsArr[i]]){
                                ids.push(_data[fileFieldsArr[i]]);
                            }
                        }
                    }
        
                    if(ids.length == 0){
                        nsAlert('没有对应的附件', 'warning');
                        console.warn('没有对应的附件');
                        console.warn(res);
                        return false;
                    }
                    getFileByIds(ids.toString(), _config, function(resData, __config){
                        previewFileShow(resData, __config);
                    });
                });
            }
        
            //文件下载
            function downloadFileInit(callback,obj){
                var controllerObj = obj.controllerObj;
                var ajaxData = controllerObj.ajaxData; //{bllId:'',bllType:'',hasContent:false}
                var ajaxConfigByBll = {
                    url:getRootPath()+'/files/getListByBll',
                    type:'POST',
                    dataSrc:'data',
                    data:ajaxData,
                    contentType:'application/x-www-form-urlencoded',
                };
                NetStarUtils.ajax(ajaxConfigByBll,function(res){
                    if(res.success){
                        var fileListArr = [];
                        if($.isArray(res.rows)){
                            fileListArr = res.rows;
                        }
                        var idsArr = [];
                        for(var idI=0; idI<fileListArr.length; idI++){
                            idsArr.push(fileListArr[idI].id);
                        }
                        var fileListIdsAjaxConfig = {
                            url : getRootPath() + '/files/getListByIds',
                            data : {
                                ids : idsArr.join(','),
                                hasContent : false,
                            },
                            type : 'GET',
                            contentType:'application/x-www-form-urlencoded',
                         };
                         NetStarUtils.ajax(fileListIdsAjaxConfig,function(resData,ajaxOptions){
                            if(resData.success){
                                var filesArray = [];
                                if($.isArray(resData.rows)){
                                    filesArray = resData.rows;
                                }
                                if(filesArray.length == 1){
                                    var downloadFileName = filesArray[0].originalName;
                                    var fileId = filesArray[0].id;
                                    var downloadFileUrl = getRootPath()+'/files/download/'+ fileId;
                                    NetStarUtils.download({
                                        url: downloadFileUrl,
                                        fileName: downloadFileName,
                                    });
                                }
                            }else{
                               var msg = resData.msg ? resData.msg : '返回值为false';
                               nsalert(msg,'error');
                            }
                         },true)
                    }else{
                        var msg = res.msg ? res.msg : '返回值为false';
                        nsalert(msg,'error');
                    }
                },true)
            }
        
            function addInfoDialogInit(callback,obj){
                var packageName = $('#'+callback.data.id).closest('.btn-group').attr('ns-tempalte-package');
                if(packageName){
                    var addInfoDialogConfig = NetstarTemplate.templates.configs[packageName];
                    var currentFunctionConfig = obj.controllerObj.func.config;
                    var presuffix = currentFunctionConfig.suffix;
                    var currentDefaultMode = currentFunctionConfig.defaultMode;
                    if(addInfoDialogConfig.template == 'processDocBase'){
                        NetstarTemplate.templates.processDocBase.utils.getOtherPageConfig(presuffix, currentDefaultMode, {keyField: currentFunctionConfig.keyField,package: addInfoDialogConfig.package.replace(/-/g, '.')}, currentFunctionConfig);
            
                    }
                }
            }
        
        
            function ajaxNewtabCommon(callback,obj){
                var dataJson = {};
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
                }
                var value = dataJson.value;//获取value值
                var controllerObj = obj.controllerObj.func.config;//获取按钮配置项
                if(value == false){
                    if(controllerObj.noSelectInfoMsg){
                        //定义了弹出的提示语
                        nsalert(controllerObj.noSelectInfoMsg,'error');
                        console.error(infoMsgStr);
                    }
                    return false;
                }
                var isUseConfirm = typeof(controllerObj.isUseConfirm)=='boolean' ? controllerObj.isUseConfirm : true;//默认弹出框
                if(callback.event){
                    if(callback.event.target.nodeName == 'BODY'){
                        if(callback.data.id){
                            var $btnDom = $('#'+callback.data.id);
                            $btnDom.attr('disabled',true);
                        }
                    }else{
                        var $btnDom = $(callback.event.currentTarget);
                        $btnDom.attr('disabled',true);
                    }
                }
                function getAjaxHandler(){
                    var ajaxConfig = $.extend(true,{},obj.controllerObj.beforeAjax);
                    ajaxConfig.data = typeof(ajaxConfig.data)=='object' ? ajaxConfig.data : {};
                    if(controllerObj.dataFormat == 'id'){
                        if(dataJson.btnOptionsConfig){
                            if(dataJson.btnOptionsConfig.options){
                                if(dataJson.btnOptionsConfig.options.idField){
                                    var idField = dataJson.btnOptionsConfig.options.idField;
                                    ajaxConfig.data[idField] = value[idField];
                                }
                            }
                        }
                    }else{
                        if($.isEmptyObject(ajaxConfig.data)){
                            ajaxConfig.data = value;
                        }else{
                            ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data,value);
                        }
                    }
                    ajaxConfig.plusData = {
                        btnFunctionConfig:controllerObj,
                        packageName:dataJson.config.package,
                    };
                    NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
                        $('#'+callback.data.id).removeAttr('disabled');
                        if(res.success){
                            var resData = res[ajaxOptions.dataSrc];
                            var btnFunctionConfig = ajaxOptions.plusData.btnFunctionConfig;
                            var titleStr = btnFunctionConfig.title;
                            var url = btnFunctionConfig.url;
                            var tempValueName = ajaxOptions.plusData.packageName + new Date().getTime();
                            NetstarTempValues[tempValueName] = {templateDataByAjax:resData};
                            url = url+'?templateparam=' + encodeURIComponent(tempValueName);
                            NetstarUI.labelpageVm.loadPage(url,titleStr,true);
                        }
                    },true);
                }
                if(isUseConfirm){
                    nsconfirm(controllerObj.beforeTitle,function(isDelete){
                        if(isDelete){
                            getAjaxHandler();
                        }else{
                            if($('#'+callback.data.id).length == 1){
                                $('#'+callback.data.id).removeAttr('disabled');
                            }
                        }
                    },'warning')
                }else{
                    getAjaxHandler();
                }
            }
        },
        init : function(btns){
            for(var i=0; i<btns.length; i++){
                var currentBtnConfig = btns[i];
                var sourceBtnConfig = $.extend(true, {}, currentBtnConfig.functionConfig);
                var btnConfig = funcManage.getConfig(sourceBtnConfig);
                var commonFunc = funcManage.getCommonFunc(btnConfig);
                sourceBtnConfig.func = {
                    config:btnConfig,
                    function:commonFunc,
                };
                funcManage.setFuncByDefaultMode(sourceBtnConfig);
                var userMode = sourceBtnConfig.userMode;
                if(typeof(userMode) == "string"){
                    currentBtnConfig.btn.handler = sourceBtnConfig.func[userMode];
                }else{
                    currentBtnConfig.btn.handler = sourceBtnConfig.func.function;
                }
            }
        },
    }
    // config
    var configManage = {
        validate : function(config){
            if(typeof(config) != "object"){ 
                console.error('config配置错误'); 
                nsAlert('config配置错误', 'error'); 
                return false; 
            };
            if(typeof(config.package) != "string"){ 
                console.error('config未配置package'); 
                nsAlert('config未配置package', 'error'); 
                return false; 
            }
            if(!$.isArray(config.components)){
                console.error('config配置components必须是数组,请检查配置是否正确');
                nsAlert('config配置components必须是数组,请检查配置是否正确', 'error');
                return false; 
            }
            var components = config.components;
            for(var i=0; i<components.length; i++){
                if(components[i] === false){
                    console.error('config配置错误，请检查是否权限问题');
                    nsAlert('config配置错误，请检查是否权限问题', 'error');
                    return false;
                }
            }
            return true;
        },
    }

    function init(config){
        // 验证
        var isPass = configManage.validate(config);
        if(!isPass){
            return false;
        }
        configs[config.package] = {
            source : $.extend(true, {}, config),
            config : config,
        }
        var components = config.components;
        for(var i=0; i<components.length; i++){
            var comType = components[i].type;
            var fields = components[i].field;
            // 没有fields的面板component不需要状态处理
            if(typeof(fields) == "undefined"){
                continue;
            }
            switch(comType){
                case 'btns':
                    funcManage.init(fields);
                    break;
                default:
                    // fieldManager.init(fields, comType);
                    break;
            }
        }
        return config;
    }
    return {
        configs : configs,
        init : init,
    }
})()