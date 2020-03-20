var pageProperty = {
    pageSourceObj:{},
	cachePageData:{},
	cachePageDataByPageId : {},
};
// 格式化保存数据 从pageProperty挪过来的功能
pageProperty.formatSaveData = function(_config){
	function dataHandle(data){
		if(typeof(data.field) == "string"){
			// 目的：为add ，edit ，delete 如果是dialog类型时定义默认值field值
			var fieldBase = data.field.replace("true",'{isColumn:false,type:"dialog"}');
		}
		for(var key in data){
			switch(typeof(data[key])){
				case 'string':
					switch(key){
						case 'col':
						case 'btns':
						case 'tableRowBtns':
						case 'isUseSort':
						case 'isSourceTree':
						case 'serviceComponent':
						case 'src':
						case 'column':
						// case 'params':
							try{
								data[key] = eval(data[key]);
							}catch(error){
								console.error(error.message);
							}
							break;
						case 'field':
							if(data[key].indexOf(".")>-1){
								data[key] = eval(data[key]);
								if(data[key]){
									var fieldById = {};
									for(var fieldI=0;fieldI<data[key].length;fieldI++){
										if(data[key][fieldI].id){
											fieldById[data[key][fieldI].id] = data[key][fieldI];
										}
									}
									if(!$.isEmptyObject(fieldById)){
										data.fieldById = fieldById;
									}
								}else{
									data[key] = [];
								}
							}
							break;
						case 'data':
						case 'modeParams':
						case 'params':
							if(data[key].length>0){
								data[key] = JSON.parse(data[key]);
							}
							break;
						case 'isCloseWindow':
						case 'isValidSave':
						case 'isSearch':
						case 'readonly':
						case 'isShowTitle':
						case 'isFormHidden':
						case 'isCopyObject':
						case 'isMainDbAction':
						case 'isHaveEditDeleteBtn':
						case 'isAllowAdd':
						case 'isHaveSaveAndAdd':
						case 'isUse':
						case 'isUseSave':
						case 'isUseSearchInput':
						case 'isUseQRInput':
						case 'isKeepSelected':
						case 'isSaveToTemplate':
							if(data[key] == 'true'){
								data[key] = true;
							}
							if(data[key] == 'false'){
								data[key] = false;
							}
							break;
						default:
							data[key] = data[key];
							break;
					}
					if(typeof(data[key])=='string'&&data[key] == ''){
						delete data[key];
					}
					break;
				case 'object':
					if($.isArray(data[key])){
						switch(key){
							case 'hide':
								data[key] = data[key];
								break;
							default:
								for(var index=0;index<data[key].length;index++){
									dataHandle(data[key][index]);
								}
								break;
						}
					}else{
						var isObj = true;
						switch(key){
							case 'add':
							case 'edit':
							case 'delete':
							case 'multiAdd':
								if(data[key].type == "dialog" && typeof(data[key].field) == "undefined"){
									data[key].field = fieldBase;
								}
								break;
							case 'saveData':
								if(typeof(data[key].ajax) == 'undefined'){
									delete data[key];
									isObj = false;
								}else{
									if(typeof(data[key].ajax.src) == 'undefined'){
										delete data[key];
										isObj = false;
									}
								}
								break;
							case 'ajax':
								if(typeof(data[key].src) == 'undefined' && typeof(data[key].url) == 'undefined'){
									delete data[key];
									isObj = false;
								}
								break;
						}
						if(isObj){
							dataHandle(data[key]);
						}
					}
					break;
			}
		}
	}
	dataHandle(_config);
}
// 显示页面

// 显示页面
pageProperty.init = function(pageParams, callbackFunc){
	var rootPathStr = getRootPath();
	var lastStr = rootPathStr.substring(rootPathStr.lastIndexOf("/")+1);
	if(lastStr == "templateMindPages"){
		// var urlPara = nsVals.getUrlPara();
		// if(urlPara.singlePageMode == 'false'){
		// 	getRootPath = function(){
		// 		return rootPathStr.substring(0,rootPathStr.lastIndexOf("/"));
		// 	}
		// }
		$.getScript(getRootPath()+"/js/uiconfig.js");
	}
	//发送请求获取VO（思维导图）
	var mindAjax = {
		url:getRootPath()+"/templateMindMaps/json/" + pageParams.mindId,
		type:"GET",
		dataType:"json",
		dataSrc:'data',
		contentType:'application/x-www-form-urlencoded',
	}
	function isOnlyCodeFun(obj){
		var isOnlyCode = true;
		for(var key in obj){
			if(key != 'data_auth_code'){
				isOnlyCode = false;
			}
		}
		return isOnlyCode;
	}
	function formatData(voSourceJSON, isDetails){
		//获取VO名称
		var isNeedInit = true;
		var pageData = {};
		var voName = '';
		if(isDetails){
			voName = [];
			pageData.sourceJson = [];
			pageData.runObj = [];
			for(var i=0; i<voSourceJSON.length; i++){
				var jsonData = voSourceJSON[i];
				var _voName = '';
				for(var key in jsonData){
					_voName = key;
				}
				voName.push(_voName);
				//原始的VO（思维导图）生成的JSON
				pageData.sourceJson.push($.extend(true,{},jsonData[_voName]));
				//执行过的VO（思维导图）生成的JSON
				pageData.runObj.push(eval('{'+_voName+'=nsProject.init(jsonData[_voName])'+'}'));
			}
		}else{
			if($.isArray(voSourceJSON)){
				var xmmapJson = {};
				pageData.voName = [];
				for(var i=0; i<voSourceJSON.length; i++){
					var jsonData = voSourceJSON[i];
					for(var key in jsonData){
						voName = key;
					}
					pageData.voName.push(voName);
					//原始的VO（思维导图）生成的JSON
					pageData.sourceJson = $.extend(true,{},jsonData[voName]);
					//执行过的VO（思维导图）生成的JSON
					pageData.runObj = eval('{'+voName+'=nsProject.init(jsonData[voName])'+'}');
				}
				voSourceJSON = voSourceJSON[voSourceJSON.length-1];
			}else{
				for(key in voSourceJSON){
					//返回结果中的第一层的字符串就是名字
					voName = key;
				}
				pageData.voName = voName;
				//原始的VO（思维导图）生成的JSON
				pageData.sourceJson = $.extend(true,{},voSourceJSON[voName]);
				//执行过的VO（思维导图）生成的JSON
				pageData.runObj = eval('{'+voName+'=nsProject.init(voSourceJSON[voName])'+'}');
			}
		}
		//原始的页面配置参数
		pageData.sourceConfig = $.extend(true, {}, pageParams.pageConfig);
		//执行过的页面配置参数
		pageData.config = pageParams.pageConfig;
		
		//格式化参数，转换所需string到object等
		pageProperty.formatSaveData(pageParams.pageConfig);

		// 根据面板类型添加固定属性 uploadCover添加固定的ajax
		if($.isArray(pageParams.pageConfig.components)&&pageParams.pageConfig.components.length){
			var components = pageParams.pageConfig.components;
			for(var componentI=0; componentI<components.length; componentI++){
				if(components[componentI].type == "uploadCover"){
					// var url = voSourceJSON[voName].system.prefix.url;
					// if(typeof(voSourceJSON[voName].system.prefix.url)=='undefined'){
					// 	url = getRootPath();
					// }
					var url = getRootPath();
					//默认上传图片地址
					//url += '/attachment/upload';
					//files/upload  单文件上传
					url += '/files/uploadList';//批量上传
					components[componentI].ajax = {
						src: url,
						type:'POST',
					};
					components[componentI].readSrcAjax = {
						src:getRootPath()+'/files/images',
					};//读取图片路径
				}
			}
		}

		// 菜单功能点矩阵参数
		pageData.sourceFunctionPointObj = pageParams.functionPointObj;
		if(pageParams.functionPointObj){
			pageData.functionPointObj = JSON.parse(pageParams.functionPointObj);
			if(!$.isEmptyObject(pageData.functionPointObj)){
				pageData.config.matrixVars = $.extend(true,{},pageData.functionPointObj);
			}
		}

		// 弹出页面时当前页面参数
		pageData.sourceParamObj = pageParams.paramObj;
		if(pageParams.paramObj){
			//sjj 20190327 读取界面来源参
			if(NetstarTempValues[pageParams.paramObj]){
				var tempValueName = pageParams.paramObj;
				pageParams.paramObj = decodeURIComponent(pageParams.paramObj);
				pageData.paramObj = NetstarTempValues[tempValueName];
				delete NetstarTempValues[tempValueName];
			}else{
				pageParams.paramObj = decodeURIComponent(decodeURIComponent(pageParams.paramObj));
				pageData.paramObj = JSON.parse(pageParams.paramObj);
			}
			// 判断getValueAjax是否存在
			var isOnlyCode = isOnlyCodeFun(pageData.paramObj);
			if(isOnlyCode){
				// delete pageData.config.getValueAjax;
			}
			// 当前页面参数赋值给config
			// pageData.config.pageParam = pageData.paramObj;
		}else{
			// delete pageData.config.getValueAjax;
		}

		// 判断 paramObj/functionPointObj 都不为空时合并
		pageData.mergeParameters = {};
		if(!$.isEmptyObject(pageData.paramObj)){
			pageData.mergeParameters = pageData.paramObj;
		}
		if(!$.isEmptyObject(pageData.functionPointObj)){
			var functionPointObj = pageData.functionPointObj
			for(var key in functionPointObj){
				pageData.mergeParameters[key] = functionPointObj[key];
			}
		}
		if(!$.isEmptyObject(pageData.mergeParameters)){
			// 当前页面参数赋值给config
			pageData.config.pageParam = pageData.mergeParameters;
		}else{
			delete pageData.config.getValueAjax;
		}
		// 判断getValueAjax是否存在
		var isOnlyCode = isOnlyCodeFun(pageData.mergeParameters);
		if(isOnlyCode){
			delete pageData.config.getValueAjax;
		}
		
		// 权限码
		var data_auth_code = pageParams.data_auth_code; 
		// 判断页面的权限码不存在时 读取 当前页面参数的权限码
		if(pageParams.data_auth_code == ''){
			if(pageData.paramObj){
				if(typeof(pageData.paramObj.data_auth_code)=='string' && pageData.paramObj.data_auth_code != ''){
					data_auth_code = pageData.paramObj.data_auth_code;
				}
			}
		}
		pageData.config.data_auth_code = data_auth_code; //
		pageData.data_auth_code = data_auth_code; // 有用的权限码
		pageData.source_data_auth_code = pageParams.data_auth_code; // 原始的权限码
		
		//保存值用于查看信息
		// pageProperty.pageSourceObj = pageData;
		var package = pageData.config.package; // 包名
		pageProperty.pageSourceObj[package] = pageData;
		// 模板版本号 根据版本号设置模板配置中矩阵参数的传值方式
		var versionNumber = pageData.config.versionNumber;
		switch(versionNumber){
			case "1":
				// 处理矩阵参数
				if(typeof(pageData.config.pageParam)!="object"){
					pageData.config.pageParam = {};
				}
				if(pageData.config.data_auth_code != ''){
					pageData.config.pageParam.data_auth_code = pageData.config.data_auth_code;
				}
				delete pageData.config.matrixVars;
				delete pageData.config.data_auth_code;
				// 处理getValueAjaxpage
				if(typeof(pageData.config.getValueAjax)=="object"){
					if(typeof(pageData.config.getValueAjax.suffix)=="string"){
						pageData.config.getValueAjax.url += pageData.config.getValueAjax.suffix;
					}
				}
				pageData.config.pageInitCompleteHandler = function(config){
					var obj = {
						name : config.package,
						processId : config.pageParam.processId,
						activityId : config.pageParam.activityId,
						workitemId : config.pageParam.workItemId,
						activityName : config.pageParam.activityName,
						workflowType : config.pageParam.workflowType,
						templateConfig : config,
					}
					NetStarRabbitMQ.setTemplateSubscribe(obj);
				}
				break;
		}

		//执行快捷配置页面
		// pageProperty.setPagesConfigerData(pageParams.pageId);

		//完成回调
		if(typeof(callbackFunc)=='function'){
			callbackFunc(pageData);
		}
	}
	var entityNames = pageParams.mindName ? pageParams.mindName.split(',') : [];
	if($.isArray(pageParams.pageConfigList)){
		pageParams.sourcerPageConfig = pageParams.pageConfig;
		pageParams.sourcerPageConfigList = $.extend(true, [], pageParams.pageConfigList);
		var pageConfigList = [];
		var isPageConfig = true;
		for(var i=0; i<pageParams.pageConfigList.length; i++){
			if(pageParams.pageConfigList[i] === ''){
				// 表示该层级没有存数据
				continue;
			}
			var _config = JSON.parse(pageParams.pageConfigList[i]).config;
			isPageConfig = typeof(_config.isPageConfig) == "boolean" ? _config.isPageConfig : true;
			pageConfigList.push(_config);
			if(entityNames.length == 0){
				entityNames = _config.entityNameArr ? _config.entityNameArr : [];
			}
		}
		// 获取思维导图
		// 通过detiles获取vo/method
		var xmmapJsons = [];
		var voMapObj = {};
		var mindMapDetails = pageParams.mindMapDetails;
		console.log(mindMapDetails);
		for(var i=0; i<mindMapDetails.length; i++){
			var _mindMapDetails = mindMapDetails[i];
			var entityName = entityNames[i];
			var voMap = nsProjectPagesManager.pages.voList.voMapManager.getVoMapFormatArraysByRes(_mindMapDetails, entityName, true);
			// 通过获取的vo/method获取思维导图描述
			var xmmapJson = nsProjectPagesManager.pages.voList.voMapTable.getXmmapJsonByDetails(voMap);
			xmmapJsons.push(xmmapJson);
			for(var key in voMap){
				voMapObj[key] = $.isArray(voMapObj[key]) ? voMapObj[key].concat(voMap[key]) : voMap[key];
			}
		}
		if(!isPageConfig){
			var setConfig = pageProperty.getAllConfigByObjectState(pageConfigList, true);
			pageProperty.addFuncVoMapObj(voMapObj);
			console.log(setConfig);
			pageParams.pageConfig = pageProperty.getPageConfigBySetConfig(setConfig, voMapObj);
		}else{
			pageParams.pageConfig = pageConfigList[0];
		}
		formatData(xmmapJsons, true);
		return ;
	}
	var xmmapJson = pageParams.xmmapJson;
	if(typeof(xmmapJson)!='undefined'&&!$.isEmptyObject(xmmapJson)){
		formatData(xmmapJson);
	}else{
		NetStarUtils.ajax(mindAjax, function(res){
			var voSourceJSON = JSON.parse(res[mindAjax.dataSrc]);
			formatData(voSourceJSON);
		});
		//lxh 缓存机制 19/02/20
		/* if(!!NetstarCatchHandler.getCatch(pageParams.mindId)){
			formatData(NetstarCatchHandler.getCatch(pageParams.mindId));
		}else{
			nsVals.ajax(mindAjax, function(res){
				var voSourceJSON = JSON.parse(res[mindAjax.dataSrc]);
				NetstarCatchHandler.setCatch(pageParams.mindId,voSourceJSON);
				formatData(voSourceJSON);
				return ;
			});
		} */
	}
}
//缓存方法

pageProperty.getPageHtml = function(resParams){
	var pageConfig = resParams.pageConfig;
	if(typeof(pageConfig) == 'string'){
		pageConfig = JSON.parse(pageConfig);
	}
	var mindmapJson = resParams.mindmapJson;
	if(typeof(mindmapJson) == 'string'){
		mindmapJson = JSON.parse(mindmapJson);
	}
	var pageParams = {
		pageId:resParams.pageId, 		//页面id
		mindId:resParams.mindId, 	//思维导图id
		// pageConfig:pageConfig.config,
		pageConfig:{},
		functionPointObj:resParams.functionPointObj, 	//菜单功能点矩阵参数
		paramObj:resParams.paramObj, 	//弹出页面时当前页面参数
		data_auth_code:resParams.data_auth_code,
		xmmapJson : mindmapJson,

		pageConfigList : resParams.pageConfigList,
		mindMapDetails : resParams.mindMapDetails,
		mindName : resParams.mindName,
	}
	var pageParamsStr = JSON.stringify(pageParams);
	var html = '<container>\r\n'
					+ '<script type="text/javascript">\r\n'
						+ '$(function(){\r\n'
							+ 'var pageParams = ' + pageParamsStr + '\r\n'
							+ 'pageProperty.init(pageParams, function(pageConfig){\r\n'
									+ (resParams.pageParams ? resParams.pageParams : '') + '\r\n'
									+ 'NetstarTemplate.init(pageConfig.config);\r\n'
							+ '})\r\n'
						+ '})\r\n'
					+ '</script>\r\n'
				+ '</container>';

	return html;
}
// VoMapObjz中新增方法 工作流相关方法
pageProperty.addFuncVoMapObj = function(sourceVoMapObj){
	var method = sourceVoMapObj.method;
	// 工作流相关按钮
	var workflowMethod = [
		{
			category : 'method',
			id : 'nsWorkflowViewer',
			chineseName : '流程监控',
			englishName : 'nsWorkflowViewer',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowSubmit',
			chineseName : '提交',
			englishName : 'nsWorkflowSubmit',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowReject',
			chineseName : '驳回',
			englishName : 'nsWorkflowReject',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowCancelSign',
			chineseName : '取消签收',
			englishName : 'nsWorkflowCancelSign',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowWithdraw',
			chineseName : '撤回',
			englishName : 'nsWorkflowWithdraw',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowRollback',
			chineseName : '回退',
			englishName : 'nsWorkflowRollback',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowRebook',
			chineseName : '改签',
			englishName : 'nsWorkflowRebook',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowTrunTo',
			chineseName : '转办',
			englishName : 'nsWorkflowTrunTo',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowHasten',
			chineseName : '催办',
			englishName : 'nsWorkflowHasten',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowEmergency',
			chineseName : '应急',
			englishName : 'nsWorkflowEmergency',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowComplete',
			chineseName : '签收',
			englishName : 'nsWorkflowComplete',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowForWard',
			chineseName : '提交',
			englishName : 'nsWorkflowForWard',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowSubmitAllBatch',
			chineseName : '提交所有批次',
			englishName : 'nsWorkflowSubmitAllBatch',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		}
	]
	for(var i=0;i<workflowMethod.length;i++){
		method.push(workflowMethod[i]);
	}
}
// 获取并缓存页面
pageProperty.getAndCachePage = function(pageConfig){
	var pageIidenti = pageConfig.pageIidenti;
	var cachePageData = pageProperty.cachePageData;
	// isCachePage : 是否缓存页面 默认true
	var isCachePage = typeof(pageConfig.isCachePage) == "boolean" ? pageConfig.isCachePage : true;
	// 是否存在缓存
	var isHaveCache = false;
	if(typeof(cachePageData[pageIidenti]) == 'object' && isCachePage){
		// 判断缓存页面是否需要更新
		if(!cachePageData[pageIidenti].isUpdate){
			isHaveCache = true;
		}
	}
	// 存在缓存读取缓存数据
	if(isHaveCache){
		if(typeof(pageConfig.callBackFunc)=="function"){
			var pageData = cachePageData[pageIidenti].pageData;
			if(typeof(pageConfig.paramObj) == "string"){
				pageData.paramObj = pageConfig.paramObj;
			}
			var pageHtml = pageProperty.getPageHtml(pageData);
			pageConfig.callBackFunc(true, pageHtml, pageConfig);
		}
		return;
	}
	// 不存在缓存读取缓存数据
	var ajaxConfig = {
		url: pageConfig.url,
		type: "GET",
		plusData: {
			pageIidenti : pageIidenti,
			pageConfig : pageConfig,
			isCachePage : isCachePage,
		},
		success: function(data){
			// ajax success
			var plusData = this.plusData;
			var _pageConfig = plusData.pageConfig;
			var _isCachePage = plusData.isCachePage;
			var _pageIidenti = plusData.pageIidenti;
			var _cachePageData = pageProperty.cachePageData;
			var _cachePageDataByPageId = pageProperty.cachePageDataByPageId;
			// 返回值是对象时存下pageId
			var pageId = false;
			var cacheObj = {
				isUpdate : false,
				url : _pageConfig.url,
				pageIidenti : _pageIidenti,
				pageData : data,
			}
			if(typeof(data)=="object"){
				if(data.success){
					var pageHtml = pageProperty.getPageHtml(data.data);
					pageId = data.data.pageId;
					cacheObj.pageId = pageId;
					cacheObj.pageData = data.data;
				}else{
					if(typeof(_pageConfig.callBackFunc) == "function"){
						_pageConfig.callBackFunc(false, data, _pageConfig);
					}
					return false;
				}
			}else{
				var pageHtml = data;
			}
			if(pageId && _isCachePage){
				_cachePageData[_pageIidenti] = cacheObj;
				_cachePageDataByPageId[pageId] = _cachePageData[_pageIidenti];
			}
			if(typeof(_pageConfig.callBackFunc) == "function"){
				_pageConfig.callBackFunc(true, pageHtml, _pageConfig);
			}
		}, 
		error:function(error){
			var plusData = this.plusData;
			var _pageConfig = plusData.pageConfig;
			if(typeof(_pageConfig.callBackFunc) == "function"){
				_pageConfig.callBackFunc(false, error, _pageConfig);
			}
		}
	}
	//读取 Authorization 并添加到headers 如果已经过期了则报错退出
	var authorization = NetStarUtils.OAuthCode.get();
	if(authorization == false){
		NetStarUtils.OAuthCode.reLogin();
		return false;
	}
	if(authorization){
		if(typeof(ajaxConfig.headers) != 'object'){
			ajaxConfig.headers = {};
		}
		ajaxConfig.headers.Authorization = authorization;
	}
	$.ajax(ajaxConfig);
}
// 获取缓存数据
pageProperty.getCacheData = function(){
	var cachePageData = pageProperty.cachePageData;
	var cacheData = {};
	for(var key in cachePageData){
		if(!cachePageData[key].isUpdate){
			cacheData[key] = cachePageData[key];
		}
	}
	return cacheData;
}
// 通过缓存数据格式化缓存页面
pageProperty.setCachePageByCacheData = function(cacheData){
	if(typeof(cacheData)!="object"){
		return;
	}
	pageProperty.cachePageData = cacheData;
	var cachePageData = pageProperty.cachePageData;
	for(var key in cachePageData){
		var pageId = cachePageData[key].pageId;
		var mindId = cachePageData[key].mindId;
		var cachePageDataByPageId = pageProperty.cachePageDataByPageId;
		var cachePageDataByMindId = pageProperty.cachePageDataByMindId;
		cachePageDataByPageId[pageId] = cachePageData[key];
		// 根据思维导图
		if(typeof(cachePageDataByMindId[mindId]) != "object"){
			cachePageDataByMindId[mindId] = {};
		}
		cachePageDataByMindId[mindId][pageId] = cachePageData[key];
	}
}
// 通过表单表格配置获取页面配置
pageProperty.getPageConfigBySetConfig = function (setConfig, voMapObj){
	// 方法参数 从思维导图配置获取的
	var methodParameter = {
		dataSrc : 'string',
		type : 'string',
		dataFormat : 'string',
		dataLevel : 'string',
		componentName : 'string',
		webSocketUrl : 'string',
		btnType : 'string',
		textField : 'string',
		valueField : 'string',
		isCloseWindow : 'boolean',
		requestSource : 'string',
		editorType : 'string',
		isMainDbAction : 'boolean',
		isCopyObject : 'boolean',
		isAlwaysNewTab : 'boolean',
		isEditMode : 'boolean',
		keyField : 'string',
		isInlineBtn : 'boolean',
		disabledExpression: 'string',
		contentType : 'string',
		isHaveSaveAndAdd : 'boolean',
		parameterFormat : 'string',
		isReadonly : 'boolean',
		successMsg : 'string',
		successOperate : 'string',
		draftFields : 'string',
		btnsConfig : 'string',
		matrixVariable : 'string',
		listName : 'string',
		callbackAjax : 'string',
		isSendPageParams : 'boolean',
	}
	// 获取状态
	var getStateList = function(){
		var voList = voMapObj.vo;
		var hideList = {};
		var stateInfo = {
			hideList:{},//不同状态的隐藏字段
			stateBase:{},//状态对应的所有信息
			states:{},//不同vo下的状态
			fields:{},//所有字段（{gid:chineseName}）
			formStates:{},//不同vo下的表单状态
		};
		for(var voI=0;voI<voList.length;voI++){
			var voAllStateArr = voList[voI].processData.states;
			stateInfo.states[voList[voI].id] = [];
			stateInfo.formStates[voList[voI].id] = [];
			for(var indexI=0;indexI<voAllStateArr.length;indexI++){
				var stateSub = {
					id:voAllStateArr[indexI].gid,
					name:voAllStateArr[indexI].chineseName,
				}
				stateInfo.states[voList[voI].id].push(stateSub);
				stateInfo.stateBase[voAllStateArr[indexI].gid] = voAllStateArr[indexI];
				if(voAllStateArr[indexI].field){
					// 表单
					stateInfo.hideList[voAllStateArr[indexI].gid] = getFields(voAllStateArr[indexI].field);
					if(voAllStateArr[indexI]['field-more']){
						var fieldsMoreArr = getFields(voAllStateArr[indexI]['field-more']);
						// 合并field和field-more
						for(var indexJ=0;indexJ<fieldsMoreArr.length;indexJ++){
							stateInfo.hideList[voAllStateArr[indexI].gid].push(fieldsMoreArr[indexJ]);
						}
					}
					stateInfo.formStates[voList[voI].id].push(stateSub);
				}else{
					if(voAllStateArr[indexI].tabs){
						// 表格
						stateInfo.hideList[voAllStateArr[indexI].gid] = getFields(voAllStateArr[indexI].tabs);
					}else{
						// 没有
						stateInfo.hideList[voAllStateArr[indexI].gid] = [];
						console.error('状态为空，请检查状态配置');
						console.error(voAllStateArr[indexI]);
					}
				}
			}
		}
		function getFields(souFieldsArr){
			var fieldsArr = []
			for(var indexI=0;indexI<souFieldsArr.length;indexI++){
				var fieldsObj = {
					id:souFieldsArr[indexI].gid,
					name:souFieldsArr[indexI].chineseName,
					english:souFieldsArr[indexI].englishName,
				}
				fieldsArr.push(fieldsObj);
			}
			return fieldsArr;
		}
		for(var stateGid in stateInfo.hideList){
			for(var fieI=0;fieI<stateInfo.hideList[stateGid].length;fieI++){
				stateInfo.fields[stateInfo.hideList[stateGid][fieI].id] = stateInfo.hideList[stateGid][fieI].english;
			}
		}
		return stateInfo;
	}
	// 通过**-** 获取**{**}
	var getObject = function(idName, formatData){
		var idArr = idName.split('-');
		var obj = formatData;
		for(index=0;index<idArr.length-1;index++){
			if(idArr[index] == 'base'){
				continue;
			}
			obj = obj[idArr[index]];
		}
		return obj;
	}
	// 设置ajax配置通过方法id
	var setAjaxConfigByMethodId = function(ajaxObj, methodId){
		var methodArr = voMapObj.method;
		var isTrue = false;
		for(var index=0;index<methodArr.length;index++){
			if(methodArr[index].id == methodId){
				isTrue = true;
				if(methodArr[index].entityName && methodArr[index].voName && methodArr[index].functionClass && methodArr[index].englishName){
					ajaxObj.src = methodArr[index].entityName+'.'+methodArr[index].voName+'.controller.'+methodArr[index].functionClass+'.'+methodArr[index].englishName+'.func.config.url';
					// var methodKeyNames = ['dataSrc','type','dataFormat','defaultMode','text','title','functionField'];
					for(var dataName in methodParameter){
						if(typeof(methodArr[index][dataName])!="undefined"){
							ajaxObj[dataName] = methodArr[index][dataName];
						}
					}
				}
				break;
			}
		}
		if(!isTrue){
			for(var key in ajaxObj){
				ajaxObj[key] = '';
			}
		}
	}
	// 获得按钮配置通过方法id
	var getBtnConfigByMethodId = function(methodId){
		var methodArr = voMapObj.method;
		var entityName = '';
		var voName = '';
		var functionClass = '';
		var englishNameArr = [];
		var methodIdArr = methodId.split(',');
		var btnsStr = '';
		for(var index=0;index<methodArr.length;index++){
			for(var indexI=0;indexI<methodIdArr.length;indexI++){
				if(methodArr[index].id == methodIdArr[indexI]){
					entityName = methodArr[index].entityName;
					functionClass = methodArr[index].functionClass;
					btnsStr += methodArr[index].englishName + ',';
				}
			}
		}
		btnsStr = btnsStr.substring(0,btnsStr.length-1);
		if(btnsStr.length==0){
			return '';
		}
		return 'nsProject.getFuncArrayByXmmapFuncNames('+entityName+',"'+btnsStr+'")';
	}
	// data处理根据id判断是哪个ajax的data
	var setAjaxData = function(idName, idValue, formatObj, keyStr){
		/***
		* formatObj 格式化对象 即 保存的对象
		* idValue 表单配置的value值
		* idName 表单配置的id
		**/
		var idArr = idName.split('-');
		keyStr = typeof(keyStr) == 'string' ? keyStr : 'data';
		switch(idArr[0]){
			case 'tree':
			case 'getValueAjax':
				formatObj[idArr[0]][keyStr] = idValue;
				break;
			case 'deleteAjax':
			case 'saveAjax':
			case 'addAjax':
			case 'moveAjax':
			case 'editAjax':
			case 'tableAjax':
			case 'historyAjax':
			case 'getListAjax':
			case 'getRecordAjax':
				formatObj[idArr[0]][keyStr] = idValue;
				break;
			default:
				switch(idArr.length){
					case 2:
						if(idArr[0]=="ajax"){
							formatObj[idArr[0]][keyStr] = idValue;
						}else{
							formatObj[idArr[0]].ajax[keyStr] = idValue;
						}
						break;
					case 3:
						formatObj[idArr[0]][idArr[1]].ajax[keyStr] = idValue;
						break;
				}
				break;
		}
	}
	// 获取格式化数据
	var getFormatData = function(sourceData, formatData, type){
		/*
		 * sourceData 	准备格式化的原始数据
		 * formatData 	格式化的config
		 * type			格式化数据类型 tree/resultinput/....
		 */
		formatData = typeof(formatData) == 'undefined' ? $.extend(true,{},this.defaultConfig) : formatData;
		formatData.ajax = typeof(formatData.ajax)=="object" ? formatData.ajax : {};
		switch(type){
			case 'tree':
				formatData.addAjax = typeof(formatData.addAjax)=="object" ? formatData.addAjax : {};
				formatData.deleteAjax = typeof(formatData.deleteAjax)=="object" ? formatData.deleteAjax : {};
				formatData.editAjax = typeof(formatData.editAjax)=="object" ? formatData.editAjax : {};
				formatData.moveAjax = typeof(formatData.moveAjax)=="object" ? formatData.moveAjax : {};
				break;
			case 'resultinput':
				formatData.tableAjax = typeof(formatData.tableAjax)=="object" ? formatData.tableAjax : {};
				formatData.saveAjax = typeof(formatData.saveAjax)=="object" ? formatData.saveAjax : {};
				formatData.historyAjax = typeof(formatData.historyAjax)=="object" ? formatData.historyAjax : {};
				break;
			case 'pdfList':
				formatData.getListAjax = typeof(formatData.getListAjax)=="object" ? formatData.getListAjax : {};
				break;
			case 'recordList':
				formatData.tableAjax = typeof(formatData.tableAjax)=="object" ? formatData.tableAjax : {};
				formatData.saveAjax = typeof(formatData.saveAjax)=="object" ? formatData.saveAjax : {};
				formatData.historyAjax = typeof(formatData.historyAjax)=="object" ? formatData.historyAjax : {};
				formatData.getListAjax = typeof(formatData.getListAjax)=="object" ? formatData.getListAjax : {};
				formatData.getRecordAjax = typeof(formatData.getRecordAjax)=="object" ? formatData.getRecordAjax : {};
				break;
		}
		for(var typeName in sourceData){
			var typeNameArr = typeName.split('-');
			var conObj = getObject(typeName, formatData);
			if(conObj){
				switch(typeNameArr[typeNameArr.length-1]){
					case 'src':
						var ajaxObj = {};
						var isBreak = false;
						switch(type){
							case 'blockList':
								if(typeNameArr[0] == "deleteAjax"){
									if(typeof(conObj.deleteAjax)=="undefined"){
										conObj.deleteAjax = {}
									}
									ajaxObj = conObj.deleteAjax;
								}else{
									if(conObj.ajax){
										ajaxObj = conObj.ajax;
									}else{
										ajaxObj = conObj;
									}
								}
								break;
							case 'tree':
								if(typeNameArr[0] == "addAjax" || 
									typeNameArr[0] == "deleteAjax" || 
									typeNameArr[0] == "editAjax" || 
									typeNameArr[0] == "moveAjax"
								){
									ajaxObj = conObj;
									isBreak = true;
								}else{
									if(conObj.ajax){
										ajaxObj = conObj.ajax;
									}else{
										ajaxObj = conObj;
									}
								}
								break;
							case 'resultinput':
								if(typeNameArr[0] == "tableAjax" || 
									typeNameArr[0] == "saveAjax" || 
									typeNameArr[0] == "historyAjax"
								){
									ajaxObj = conObj;
									isBreak = true;
								}else{
									if(conObj.ajax){
										ajaxObj = conObj.ajax;
									}else{
										ajaxObj = conObj;
									}
								}
								break;
							case 'recordList':
								if(typeNameArr[0] == "tableAjax" || 
									typeNameArr[0] == "saveAjax" || 
									typeNameArr[0] == "getListAjax" || 
									typeNameArr[0] == "getRecordAjax" || 
									typeNameArr[0] == "historyAjax"
								){
									ajaxObj = conObj;
									isBreak = true;
								}else{
									if(conObj.ajax){
										ajaxObj = conObj.ajax;
									}else{
										ajaxObj = conObj;
									}
								}
								break;
							case 'pdfList':
								if( typeNameArr[0] == "getListAjax" ){
									ajaxObj = conObj;
									isBreak = true;
								}else{
									if(conObj.ajax){
										ajaxObj = conObj.ajax;
									}else{
										ajaxObj = conObj;
									}
								}
								break;
							default:
								if(conObj.ajax){
									ajaxObj = conObj.ajax;
								}else{
									ajaxObj = conObj;
								}
								break;
						}
						if(isBreak){
							break;
						}
						setAjaxConfigByMethodId(ajaxObj,sourceData[typeName]);
						break;
					case 'url':
						var ajaxObj = {};
						switch(type){
							case 'tree':
								if( typeNameArr[0] == "ajax" || 
									typeNameArr[0] == "addAjax" || 
									typeNameArr[0] == "deleteAjax" || 
									typeNameArr[0] == "editAjax" || 
									typeNameArr[0] == "moveAjax"
								){
									ajaxObj = conObj;
									ajaxObj.url = sourceData[typeName];
								}
								break;
							case 'resultinput':
								if( typeNameArr[0] == "tableAjax" || 
									typeNameArr[0] == "saveAjax" || 
									typeNameArr[0] == "historyAjax"
								){
									ajaxObj = conObj;
									ajaxObj.url = sourceData[typeName];
								}
								break;
							case 'recordList':
								if(typeNameArr[0] == "tableAjax" || 
									typeNameArr[0] == "saveAjax" || 
									typeNameArr[0] == "getListAjax" || 
									typeNameArr[0] == "getRecordAjax" || 
									typeNameArr[0] == "historyAjax"
								){
									ajaxObj = conObj;
									ajaxObj.url = sourceData[typeName];
								}
								break;
							case 'pdfList':
								if( typeNameArr[0] == "getListAjax" ){
									ajaxObj = conObj;
									ajaxObj.url = sourceData[typeName];
								}
								break;
						}
						break;
					case 'btns':
					case 'tableRowBtns':
						conObj[typeNameArr[typeNameArr.length-1]] = getBtnConfigByMethodId(sourceData[typeName]);
						break;
					case 'dataSrc':
					case 'contentType':
						if(type == "tree" || type == "resultinput" || type == "pdfList" || type == "recordList"){
							setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
						}
						break;
					case 'data':
						setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
						break;
					case 'type':
						var isDefault = true;
						switch(type){
							case 'tree':
								if( typeNameArr[0] == "ajax" || 
									typeNameArr[0] == "addAjax" || 
									typeNameArr[0] == "deleteAjax" || 
									typeNameArr[0] == "editAjax" || 
									typeNameArr[0] == "moveAjax"
								){
									isDefault = false;
									setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
								}
								break;
							case 'resultinput':
								if( typeNameArr[0] == "tableAjax" || 
									typeNameArr[0] == "saveAjax" || 
									typeNameArr[0] == "historyAjax"
								){
									isDefault = false;
									setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
								}
								break;
							case 'recordList':
								if(typeNameArr[0] == "tableAjax" || 
									typeNameArr[0] == "saveAjax" || 
									typeNameArr[0] == "getListAjax" || 
									typeNameArr[0] == "getRecordAjax" || 
									typeNameArr[0] == "historyAjax"
								){
									isDefault = false;
									setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
								}
								break;
							case 'pdfList':
								if( typeNameArr[0] == "getListAjax" ){
									isDefault = false;
									setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
								}
								break;
						}
						if(isDefault){
							if(typeNameArr[0] == 'type'){
								conObj[typeNameArr[typeNameArr.length-1]] = sourceData[typeName];
							}
						}
						break;
					default:
						if(typeName=="field"&&type!="tab"){
						}else{
							conObj[typeNameArr[typeNameArr.length-1]] = sourceData[typeName];
						}
						break;
				}
			}
		}
		// 删除空
		var formatObjRet = $.extend(true, {}, formatData)
		for(var key in formatObjRet){
			if(formatObjRet[key] === ''){
				delete formatObjRet[key];
			}
			if(typeof(formatObjRet[key])=='object'){
				if($.isArray(formatObjRet[key])){
					continue;
				}
				if($.isEmptyObject(formatObjRet[key])){
					delete formatObjRet[key];
				}else{
					for(var name in formatObjRet[key]){
						if(typeof(formatObjRet[key][name])=='string'&&formatObjRet[key][name] == ''){
							delete formatObjRet[key][name];
						}
					}
					if($.isEmptyObject(formatObjRet[key])){
						delete formatObjRet[key];
					}
					switch(key){
						case 'saveData':
							if(formatObjRet[key].ajax.src == ''||typeof(formatObjRet[key].ajax.src)=='undefined'){
								delete formatObjRet[key];
							}
							break;
						// case 'saveAjax':
						case 'ajax':
						case 'getValueAjax':
							if(formatObjRet && formatObjRet[key]){
								if((formatObjRet[key].src == ''||typeof(formatObjRet[key].src)=='undefined') && (formatObjRet[key].url == ''||typeof(formatObjRet[key].url)=='undefined')){
									delete formatObjRet[key];
								}
							}
							break;
						case 'deleteAjax':
							if(formatObjRet && formatObjRet[key]){
								if(type=='tree'){
									if(formatObjRet[key].url == ''||typeof(formatObjRet[key].url)=='undefined'){
										delete formatObjRet[key];
									}
								}else{
									if(formatObjRet[key].src == ''||typeof(formatObjRet[key].src)=='undefined'){
										delete formatObjRet[key];
									}
								}
							}
							break;
						case 'addAjax':
						case 'editAjax':
						case 'moveAjax':
						case 'tableAjax':
						case 'historyAjax':
						case 'getListAjax':
						case 'getRecordAjax':
							if(formatObjRet && formatObjRet[key]){
								if(formatObjRet[key].url == ''||typeof(formatObjRet[key].url)=='undefined'){
									delete formatObjRet[key];
								}
							}
							break;
						case 'saveAjax':
							if(formatObjRet && formatObjRet[key]){
								if((formatObjRet[key].src == ''||typeof(formatObjRet[key].src)=='undefined') && (formatObjRet[key].url == ''||typeof(formatObjRet[key].url)=='undefined')){
									delete formatObjRet[key];
								}
							}
							break;
					}
				}
			}
		}
		return formatObjRet;
	}
	// 获取field 通过状态的gid
	var getFieldByStateGid = function(stateGid,stateClass,objName,isMoreCol){
		/*
		 * stateGid : gidk
		 * stateClass : base / more
		 * objName : 根据其确定typeObj{ isColumn:true/false; isDialog:true/false; isMoreClo:true/false }
		 * isMoreCol : 是否为多列
		 */
		var isColumn = objName == 'table'||objName == 'child'||objName == 'main'||objName == 'list'||objName == 'blockList'? true : false;
		var isDialog = objName == 'add'||objName == 'edit'||objName == 'delete'||objName == 'multiAdd'? true : false;
		isMoreCol = typeof(isMoreCol)!='undefined' ? isMoreCol : false;
		var typeObj = '{isColumn:'+isColumn+',isDialog:'+isDialog+',isMoreCol:'+isMoreCol+'}';
		// var stateList = config.vo.processContent.states;
		var stateList = stateInfo.stateBase[stateGid];
		if(typeof(stateList)=="undefined"){
			console.error('该状态不存在：'+stateGid);
			console.error(stateInfo.stateBase);
		}else{
			var stateName = stateList.englishName;
			if(stateClass){
				stateName += '.'+stateClass;
			}
			if(stateList){
				return 'nsProject.getFieldsByState('+stateList.entityName+'.'+stateList.voName+',"'+stateName+'",'+typeObj+')';
			}
		}
		return false;
	}
	// 获得隐藏的字段名 通过隐藏字段gid
	var getFieldNameByFieldGid = function(fieldsGid){
		if($.isArray(fieldsGid)){
			var fieldsGidArr = fieldsGid;
		}else{
			fieldsGid = fieldsGid.toString();
			var fieldsGidArr = fieldsGid.split(',');
		}
		// var fieldsObj = config.fieldsObj;
		var fieldsObj = stateInfo.fields;
		var hideFields = [];
		for(var gidI=0;gidI<fieldsGidArr.length;gidI++){
			if(fieldsGidArr[gidI]){
				hideFields.push(fieldsObj[fieldsGidArr[gidI]]);
			}
		}
		return hideFields;
	}
	// 格式化tabs
	var formatTabsData = function(_tabObj, forTab){
		var tabObj = $.extend(true, {}, _tabObj);
		delete tabObj.id;
		delete tabObj.handle;
		for(var keyName in tabObj){
			switch(keyName){
				case 'field':
					if(tabObj[keyName] == ''){
						break;
					}
					forTab[keyName] = getFieldByStateGid(tabObj[keyName],tabObj.stateClass,tabObj.type);
					break;
				case 'hide':
					if(tabObj[keyName] == ''){
						delete forTab[keyName];
						break;
					}
					forTab[keyName] = getFieldNameByFieldGid(tabObj[keyName]);
					break;
				case 'add':
				case 'edit':
				case 'delete':
				case 'multiAdd':
					if(typeof(forTab[keyName]) == 'undefined'){
						forTab[keyName] = {};
					}
					if(tabObj[keyName] == ''){
						delete forTab[keyName];
						break;
					}
					for(var key in tabObj[keyName]){
						if(tabObj[keyName][key]==''){
							delete forTab[keyName][key];
						}else{
							switch(key){
								case 'field':
									forTab[keyName][key] = getFieldByStateGid(tabObj[keyName][key],tabObj.stateClass,keyName,tabObj[keyName].isMoreCol);
									break;
								case 'stateClass':
								case 'isMoreCol':
									break;
								default:
									forTab[keyName][key] = tabObj[keyName][key];
									break;
							}
						}
					}
					if($.isEmptyObject(forTab[keyName])){
						delete forTab[keyName];
					}
					break;
				default:
					if(tabObj[keyName] == ''){
						delete forTab[keyName];
						break;
					}
					forTab[keyName] = tabObj[keyName];
					break;
			}
		}
	}
	// 页面配置格式
	var formatData = {
		package: '',
		template: '',
		title: '',
		readonly: false,
		isShowTitle: false,
		isFormHidden: false,
		versionNumber: "1",
		mode:'',
		pushMessage : '',
		plusClass : '',
		isSaveToTemplate : false,
		// isHaveSaveAndAdd:true,
		getValueAjax:{},
		draftBox : {},
		saveData:{
			ajax:{},
		},
		components:[]
	};
	// 页面组件配置格式
	var componentsConfig = {
		type: '',
		position: '',
		field:[],
		ajax:{},
		deleteAjax:{},
		saveAjax:{},
		addAjax:{},
		moveAjax:{},
		editAjax:{},
		tableAjax:{},
		historyAjax:{},
		getListAjax:{},
		getRecordAjax:{},
	}
	var stateInfo = getStateList();
	var programmerConfig = setConfig.programmerConfig;
	var productConfig = setConfig.productConfig;
	formatData = getFormatData(programmerConfig.form, formatData);
	for(var i=0; i<programmerConfig.tab.length; i++){
		var tabObj = programmerConfig.tab[i];
		var formatComponent = $.extend(true, {}, componentsConfig);
		var tabsData = getFormatData(tabObj, formatComponent, tabObj.type);
		if(tabsData.type=="btns"){
			if(typeof(tabsData.btns)=="string"){
				tabsData.field = tabsData.btns;
				delete tabsData.btns;
			}
		}
		formatData.components[i] = tabsData;
	}
	formatData.draftBox = typeof(formatData.draftBox) == "object" ? formatData.draftBox : {};
	formatData = getFormatData(productConfig.formData, formatData);
	for(var i=0; i<productConfig.tableData.length; i++){
		var tabObj = productConfig.tableData[i];
		formatTabsData(tabObj, formatData.components[i]);
	}
	return formatData;
}
// 删除objectState
pageProperty.delObjectState = function(obj){
	function runing(_obj){
		for(var key in _obj){
			if($.isArray(_obj[key])){ 
				// 组件排序
				continue;
			}
			if(typeof(_obj[key]) == "object"){
				runing(_obj[key]);
			}else{
				delete _obj.objectState;
				continue;
			}
		}
	}
	runing(obj);
}
// 通过objectState获取当前配置参数
pageProperty.getConfigByObjectState = function(arr, type, isCurrent){
	// type : programmerConfig / productConfig
	// isCurrent 表示上一级
	var allConfig = typeof(arr[0]) == "string" ? JSON.parse(arr[0]) : arr[0];
	if(typeof(allConfig.config) == "string"){
		allConfig = JSON.parse(allConfig.config);
	}
	var runConfig = allConfig[type];
	// 逐层合并
	var num = isCurrent ? 0 : 1;
	for(var i=1; i<arr.length-num; i++){
		var obj = typeof(arr[i]) == "string" ? JSON.parse(arr[i]) : arr[i];
		if(typeof(obj.config) == "string"){
			obj = JSON.parse(obj.config);
		}
		obj = obj[type];
		for(var panelKey in obj){
			var panelVals = obj[panelKey];
			if(typeof(panelVals) == "object"){
				// 判断是否存在，不存在验证是否新增 如果不存在也不是新增则删除
				for(var gidKey in panelVals){
					if(typeof(panelVals[gidKey]) == "object"){
						switch(panelVals[gidKey].objectState){
							case NSSAVEDATAFLAG.EDIT:
								runConfig[panelKey][gidKey] = panelVals[gidKey];
								break;
							case NSSAVEDATAFLAG.ADD:
								if(typeof(runConfig[panelKey]) != "object"){
									runConfig[panelKey] = {};
								}
								runConfig[panelKey][gidKey] = panelVals[gidKey];
								runConfig.index = obj.index;
								break;
							case NSSAVEDATAFLAG.DELETE:
								delete runConfig[panelKey][gidKey];
								break;
							default:
								break;
						}
					}else{
						switch(panelVals.objectState){
							case NSSAVEDATAFLAG.EDIT:
								runConfig[panelKey] = panelVals;
								break;
							case NSSAVEDATAFLAG.ADD:
								if(typeof(runConfig[panelKey]) != "object"){
									runConfig[panelKey] = {};
								}
								runConfig[panelKey] = panelVals;
								break;
							case NSSAVEDATAFLAG.DELETE:
								delete runConfig[panelKey];
								break;
							default:
								break;
						}
						break;
					}
				}
			}else{
				switch(panelVals.objectState){
					case NSSAVEDATAFLAG.EDIT:
						runConfig[panelKey] = panelVals;
						break;
					default:
						break;
				}
			}
		}
	}
	if(!$.isEmptyObject){
		var index = runConfig.index;
		var obj = runConfig[type];
		for(var gid in obj){
			if(index.indexOf(gid) == -1){
				index.push(gid);
			}
		}
	}
	if(!isCurrent && arr.length == 1){
		runConfig = {};
	}
	if(isCurrent && !$.isEmptyObject(runConfig)){
		var tableDataObj = typeof(runConfig.tableData) == "object" ? runConfig.tableData : runConfig.tab;
		var index = runConfig.index;
		if($.isArray(tableDataObj)){
			index = [];
			for(var i=0; i<tableDataObj.length; i++){
				index.push(tableDataObj[i].gid);
			}
			runConfig.index = index;
		}else{
			var tableData = [];
			for(var i=0; i<index.length; i++){
				tableData.push(tableDataObj[index[i]]);
			}
			// runConfig.sourceTable = tableDataObj;
			if(type == "programmerConfig"){
				runConfig.tab = tableData;
			}else{
				runConfig.tableData = tableData;
			}
		}
	}
	pageProperty.delObjectState(runConfig);
	return runConfig;
}
// 通过objectState获取当前配置参数 所有
pageProperty.getAllConfigByObjectState = function(arr, isCurrent){
	if(arr.length == 1 && arr[0] === "{}"){
		return {
			programmerConfig : {},
			productConfig : {},
		}
	}
	var programmerConfig = pageProperty.getConfigByObjectState(arr, 'programmerConfig', isCurrent);
	var productConfig = pageProperty.getConfigByObjectState(arr, 'productConfig', isCurrent);
	if($.isArray(productConfig.tableData) && productConfig.tableData.length > 0){
		// 通过programmerConfig修改productConfig 原因：programmerConfig删除了表格后productConfig之前配置的关于该行的配置也没有用
		var programmerIndex = programmerConfig.index;
		var productConfigArr = [];
		var productConfigIndex = [];
		for(var i=0; i<productConfig.tableData.length; i++){
			if(programmerIndex.indexOf(productConfig.tableData[i].gid) > -1){
				productConfigArr.push(productConfig.tableData[i]);
				productConfigIndex.push(productConfig.tableData[i].gid);
			}
		}
		productConfig.index = productConfigIndex;
		productConfig.tableData = productConfigArr;
	}
	return {
		programmerConfig : programmerConfig,
		productConfig : productConfig,
	}
}
pageProperty.pageSourceObj = {};