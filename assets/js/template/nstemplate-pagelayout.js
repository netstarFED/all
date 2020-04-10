var pageProperty = {
	zTreeNodes: 		[], 	// 显示field state的树 , 根据思维导图获得
	zTreeNodesUrl: 		[],		// 显示controller 及后两级的树 ， 根据思维导图获得
	templateForm: 		{}, 	// 模板的配置参数 ， 根据模板维护设置的参数获得
	cachePageData: 	{},
	cachePageDataByPageId : {},
	vosByPackage : {},
};
pageProperty.pageSourceObj= {};
/******************选中行******************/
//获得思维导图数据 并生成 树
//获得模板配置参数
// lyw 20190905修改 页面配置
pageProperty.selectLine = function(rowData,isProduct){
	/*
		rowData 行数据
		isProduct 是否是产品配置
	*/
	// 处理行数据 清除空字符
	for(var key in rowData){
		if(typeof(rowData[key])!='undefined'){
			if(typeof(rowData[key])=='object'){
				if(rowData[key]==null){
					delete rowData[key];
				}
			}
			if(typeof(rowData[key])=='string'){
				if(rowData[key]==''){
					delete rowData[key];
				}
			}
		}
	}
	//获得模板配置参数
	var pagesAjax = {
		url:getRootPath()+"/templatePages/" + rowData.pageId,
		type:"GET",
		dataType:"json",
		contentType:'application/x-www-form-urlencoded',
	}
	NetStarUtils.ajax(pagesAjax,function(res){
		if (typeof(res.data)=="undefined" || typeof(res.data.templateForm) == "undefined") {
			nsalert("后台返回错误","error");
			console.error(res);
			return false;
		}else{
			pageProperty.sourcePageData = res.data;
			pageProperty.sourceData = res.data.templateForm;
			pageProperty.configerData = JSON.parse(pageProperty.sourceData);
			// getMindConfig();
			pageProperty.selectConfigBaseByIsVO(rowData, isProduct);
		}
	});
	function getMindConfig(){
		// 获取思维导图数据 如果选择多个获取的是拼接好的思维导图
		var ajaxLoadedNumber = 0; //判断两个ajax是否都执行完，都执行完后（即ajaxLoadedNumber == mindId.length）继续执行  
		var mindId = rowData.mindId;
		var mindIds = mindId.split(',');
		var ajaxLoadedLength = mindIds.length;
		pageProperty.xmmapJsonArr = [];
		for(var i=0; i<mindIds.length; i++){
			var mindMapsAjax = {
				url:getRootPath() +'/templateMindMaps/json/' + mindIds[i],
				type:"GET",
				dataType:"json",
				contentType:'application/x-www-form-urlencoded',
				plusData : {
					index : i,
				}
			}
			NetStarUtils.ajax(mindMapsAjax,function(res, _ajaxConfig){
				ajaxLoadedNumber++;
				var jsonData = JSON.parse(res.data);
				pageProperty.xmmapJsonArr[_ajaxConfig.plusData.index] = jsonData;
				if(ajaxLoadedNumber == ajaxLoadedLength){
					pageProperty.setXmmapGlobalObject(pageProperty.xmmapJsonArr);
					pageProperty.selectConfigBaseByIsVO(rowData,isProduct);
				}
			});
		}
	}
}
// 设置思维导图全局变量
pageProperty.setXmmapGlobalObject = function(xmmapJsonArr){
	var entityName = '';
	var xmmapJson = {};
	for(var i=0; i<xmmapJsonArr.length; i++){
		var jsonData = xmmapJsonArr[i];
		if(i === 0){
			for(var key in jsonData){
				entityName = key;
			}
			xmmapJson = jsonData;
		}else{
			for(var key in jsonData){
				for(var voKey in jsonData[key]){
					xmmapJson[entityName][voKey] = jsonData[key][voKey];
				}
			}
		}
	}
	pageProperty.xmmapJson = $.extend(true, {}, xmmapJson);
	for(key in xmmapJson){
		pageProperty.entityName = key;
		key = eval(key+'=xmmapJson[key]');
	}
}
pageProperty.selectLine2 = function(rowData,isProduct){
	/*
		rowData 行数据
		isProduct 是否是产品配置
	*/
	// 处理行数据 清除空字符
	for(var key in rowData){
		if(typeof(rowData[key])!='undefined'){
			if(typeof(rowData[key])=='object'){
				if(rowData[key]==null){
					delete rowData[key];
				}
			}
			if(typeof(rowData[key])=='string'){
				if(rowData[key]==''){
					delete rowData[key];
				}
			}
		}
	}
	var ajaxLoadedNumber = 0; //判断两个ajax是否都执行完，都执行完后（即ajaxLoadedNumber == 2）继续执行
	//获得思维导图数据
	var mindMapsAjax = {
		url:getRootPath() +'/templateMindMaps/json/' + rowData.mindId,
		type:"GET",
		dataType:"json",
		contentType:'application/x-www-form-urlencoded',
	}
	NetStarUtils.ajax(mindMapsAjax,function(res){
		ajaxLoadedNumber++;
		var jsonData = JSON.parse(res.data);
		pageProperty.xmmapJson = $.extend(true,{},jsonData);
		for(key in jsonData){
			pageProperty.entityName = key;
			key = eval(key+'=jsonData[key]');
		}
		if(ajaxLoadedNumber==2){
			pageProperty.selectConfigBaseByIsVO(rowData,isProduct);
		}
	});
	//获得模板配置参数
	var pagesAjax = {
		url:getRootPath()+"/templatePages/" + rowData.pageId,
		type:"GET",
		dataType:"json",
		contentType:'application/x-www-form-urlencoded',
	}
	NetStarUtils.ajax(pagesAjax,function(res){
		if (typeof(res.data)=="undefined" || typeof(res.data.templateForm) == "undefined") {
			nsalert("后台返回错误","error");
			console.error(res);
			return false;
		}else{
			pageProperty.sourceData = res.data.templateForm;
			pageProperty.configerData = JSON.parse(pageProperty.sourceData);
			ajaxLoadedNumber++;
			if(ajaxLoadedNumber==2){
				pageProperty.selectConfigBaseByIsVO(rowData,isProduct);
			}
		}
	});
}
pageProperty.getTemplateMindMapDetails = function(mindMapId,callBackFunc){
	// var ajaxData = {
	// 	url:getRootPath()+"/templateMindMapDetails/getList",
	// 	type:"POST",
	// 	dataType:"json",
	// 	// dataSrc:'rows',
	// 	data:{mindMapId:mindMapId},
	// 	contentType : 'application/x-www-form-urlencoded'
	// }
	// NetStarUtils.ajax(ajaxData,function(res){
	// 	pageProperty.mindMapDetails = res.rows;
	// 	if(typeof(callBackFunc)=='function'){
	// 		callBackFunc();
	// 	}
	// });

	// 获取思维导图数据 如果选择多个获取的是拼接好的思维导图
	var ajaxLoadedNumber = 0; //判断两个ajax是否都执行完，都执行完后（即ajaxLoadedNumber == mindId.length）继续执行 
	var mindIds = mindMapId.split(',');
	var ajaxLoadedLength = mindIds.length;
	pageProperty.mindMapDetailsArr = [];
	for(var i=0; i<mindIds.length; i++){
		var ajaxData = {
			url:getRootPath()+"/templateMindMapDetails/getList",
			type:"POST",
			dataType:"json",
			// dataSrc:'rows',
			data:{
				mindMapId : mindIds[i],
			},
			plusData : {
				index : i,
				mindMapId : mindIds[i],
			},
			contentType : 'application/x-www-form-urlencoded'
		}
		NetStarUtils.ajax(ajaxData,function(res, _ajaxConfig){
			ajaxLoadedNumber ++;
			pageProperty.mindMapDetailsArr[[_ajaxConfig.plusData.index]] = {
				details : res.rows,
				mindId : _ajaxConfig.plusData.mindMapId,
			};
			if(ajaxLoadedNumber === 1){
				pageProperty.mindMapDetails = res.rows;
			}else{
				pageProperty.mindMapDetails = pageProperty.mindMapDetails.concat(res.rows)
			}
			if(ajaxLoadedNumber === ajaxLoadedLength){
				if(typeof(callBackFunc)=='function'){
					callBackFunc();
				}
			}
		});
	}
}
// 通过detiles设置思维导图描述 vo/method 对象
pageProperty.setMindVOMethodByDetails = function(){
	// 所有details
	var mindMapDetailsArr = pageProperty.mindMapDetailsArr;
	// 实体名字
	// var entityName = '';
	// for(var i=0; i<mindMapDetailsArr.length; i++){
	// 	var mindId = mindMapDetailsArr[i].mindId;
	// 	var mindName = pageProperty.mindIdDict[mindId];
	// 	entityName += mindName + '_';
	// }
	// if(entityName.length > 0){ entityName = entityName.substring(0, entityName.length-1) }
	// pageProperty.entityName = entityName;
	// // 通过detiles获取vo/method
	// var mindMapDetails = pageProperty.mindMapDetails;
	// var voMapObj = nsProjectPagesManager.pages.voList.voMapManager.getVoMapFormatArraysByRes(mindMapDetails, entityName);
	// pageProperty.voMapObj = voMapObj;
	// 通过获取的vo/method获取思维导图描述
	// var xmmapJson = nsProjectPagesManager.pages.voList.voMapTable.getXmmapJsonByDetails(voMapObj);
	// 设置思维导图描述为全局变量
	// pageProperty.xmmapJson = $.extend(true, {}, xmmapJson);
	// for(key in xmmapJson){
	// 	key = eval(key+'=xmmapJson[key]');
	// }
	var entityNameArr = [];
	var voMapArr = [];
	var voMapObj = {};
	for(var i=0; i<mindMapDetailsArr.length; i++){
		var mindId = mindMapDetailsArr[i].mindId;
		var mindName = pageProperty.mindIdDict[mindId];
		var details = mindMapDetailsArr[i].details;
		entityNameArr.push(mindName);
		var voMap = nsProjectPagesManager.pages.voList.voMapManager.getVoMapFormatArraysByRes(details, mindName, true);
		voMapArr.push(voMap);
		for(var key in voMap){
			voMapObj[key] = $.isArray(voMapObj[key]) ? voMapObj[key].concat(voMap[key]) : voMap[key];
		}
	}
	pageProperty.voMapObj = voMapObj;
	pageProperty.entityNameArr = entityNameArr;
}
// 判断执行方法 全部配置/开发配置/产品配置
pageProperty.selectConfigBaseByIsVO = function(rowData,isProduct){
	var configerData = pageProperty.configerData; 	//配置的参数
	var configType = 'source';
	// 判断是否是vo模板
	if(configerData.isVO){
		// 是否产品配置
		if(isProduct){
			configType = 'productVo';
		}else{
			configType = 'programmerVo';
		}
	}else{
		// 是否产品配置
		if(isProduct){
			configType = 'none';
		}else{
			configType = 'source';
		}
	}
	pageProperty.isProduct = isProduct;
	switch(configType){
		case 'none':
			nsAlert('没有选择新模板','error');
			break;
		case 'source':
			pageProperty.getTreeObj(pageProperty.xmmapJson);
			pageProperty.produceConfigerPage(rowData);
			break;
		case 'productVo':
			pageProperty.getTemplateMindMapDetails(rowData.mindId,function(){
				// 通过detiles拼vo/method 通过vo/method拼思维导图
				pageProperty.setMindVOMethodByDetails();
				// pageProperty.voMapObj = nsProjectPagesManager.pages.voList.voMapManager.getVoMapFormatArraysByRes(pageProperty.mindMapDetails,pageProperty.entityName);
				if(pageProperty.voMapObj.vo.length == 0){
					nsAlert("选择的思维导图有误，只能选择来源：vo","error");
					return false;
				}
				pageProperty.voMapSelectTree = pageProperty.getTree.init(pageProperty.voMapObj);
				var productConfig = {
					formId:'page-formJson',
					tableId:'page-table',
					treeId:'page-formJson2',
					tableParentId:'page-table-body',
					parentId:'modal',
					xmmapJson:pageProperty.xmmapJson,
					templateAttr:pageProperty.configerData, // 模板配置
					voData:$.extend(true,{},rowData),
					voMapObj:pageProperty.voMapObj, // 思维导图数组集合
					voMapSelectTree:pageProperty.voMapSelectTree,
				}
				pagePropertyProduct.init(productConfig);
			});
			break;
		case 'programmerVo':
			pageProperty.getTemplateMindMapDetails(rowData.mindId,function(){
				// 通过detiles拼vo/method 通过vo/method拼思维导图
				pageProperty.setMindVOMethodByDetails();
				// pageProperty.voMapObj = nsProjectPagesManager.pages.voList.voMapManager.getVoMapFormatArraysByRes(pageProperty.mindMapDetails,pageProperty.entityName);
				if(pageProperty.voMapObj.vo.length == 0){
					nsAlert("选择的思维导图有误，只能选择来源：vo","error");
					return false;
				}
				pageProperty.addFuncVoMapObj(pageProperty.voMapObj);
				pageProperty.voMapSelectTree = pageProperty.getTree.init(pageProperty.voMapObj);
				var voConfig = {
					formId:'page-formJson',
					tableId:'page-table',
					treeId:'page-formJson2',
					tableParentId:'page-table-body',
					parentId:'modal',
					xmmapJson:pageProperty.xmmapJson,
					templateAttr:pageProperty.configerData, // 模板配置
					voData:$.extend(true,{},rowData),
					voMapObj:pageProperty.voMapObj, // 思维导图数组集合
					voMapSelectTree:pageProperty.voMapSelectTree,
				}
				pagePropertyVo.init(voConfig);
			});
			break;
	}
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
			id : 'nsWorkflowViewerById',
			chineseName : '流程监控ById',
			englishName : 'nsWorkflowViewerById',
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
			id : 'nsWorkflowSubmitClose',
			chineseName : '提交并关闭',
			englishName : 'nsWorkflowSubmitClose',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowMultiSubmit',
			chineseName : '批量提交',
			englishName : 'nsWorkflowMultiSubmit',
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
		},{
			category : 'method',
			id : 'nsWorkflowFindHandleRec',
			chineseName : '查看办理意见',
			englishName : 'nsWorkflowFindHandleRec',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},{
			category : 'method',
			id : 'nsWorkflowUnduComplete',
			chineseName : '取消结束',
			englishName : 'nsWorkflowUnduComplete',
			functionClass : 'list',
			voName : 'nsWorkflow',
			entityName : method[0].entityName,
		},
	]
	for(var i=0;i<workflowMethod.length;i++){
		method.push(workflowMethod[i]);
	}
}
// 生成树 根据ajax
pageProperty.getTree = {
	// 通过数组获得对象
	/*
	 * [{
	 * 	id:472098812198977,
	 * 	voName:'crmCustomerVo',
	 * 	entityName:'customer',
	 * 	englishName:'save',
	 * 	functionClass:'modal',
	 * }]
	 * 转化为
	 * {
	 * 	customer:{crmCustomerVo:{modal(有或没有):{englishName:'save',id:'472098812198977'}}}
	 * }
	 */
	getObjByArr:function(arr,type,functionClass){
		var listObj = {}
		functionClass = typeof(functionClass) == 'undefined' ? 'all' : functionClass;
		for(var indexI=0;indexI<arr.length;indexI++){
			var isTrue = this.isHaveNeedConfig(arr[indexI],type,functionClass);
			var obj = arr[indexI];
			if(isTrue){
				if(typeof(listObj[obj.entityName]) == 'undefined'){
					listObj[obj.entityName] = {};
				}
				if(typeof(listObj[obj.entityName][obj.voName]) == 'undefined'){
					listObj[obj.entityName][obj.voName] = {};
				}
				var voObj = listObj[obj.entityName][obj.voName];
				switch(type){
					case 'method':
						switch(functionClass){
							case 'all':
								if(typeof(voObj[obj.functionClass]) == 'undefined'){
									if(obj.functionClass == ''){
										obj.functionClass = 'modal';
									}
									voObj[obj.functionClass] = {};
								}
								voObj[obj.functionClass][obj.englishName] = {
									id:obj.id,
								};
								break;
							default:
								if(obj.functionClass == functionClass){
									voObj[obj.englishName] = {
										id:obj.id,
									};
								}
								break;
						}
						break;
					case 'state':
						voObj[obj.englishName] = {
							id:arr[indexI].gid,
						};
						break;
				}
			}
		}
		return listObj;
	},
	// 判断对象中是否有需要的参数
	isHaveNeedConfig:function(obj,type,functionClass){
		var needCon = ['entityName','gid','voName','englishName'];
		if(type == 'method'){
			var needCon = ['entityName','id','voName','englishName','functionClass'];
		}
		for(var index=0;index<needCon.length;index++){
			if(typeof(obj[needCon[index]]) == 'undefined'){
				return false;
			}
		}
		if(type == 'method'){
			if(functionClass!='all'){
				if(obj.functionClass != functionClass){ // 方法对象是否是需要打方法 modal/list
					return false;
				}
			}
		}
		return true;
	},
	// 获得下拉树格式数组
	// name id fullName open parent children
	getSelectTree:function(obj){
		var treeArr = [];
		function getTreeNodes(sourceTreeObj,_treeArr,parentName,parentFullName){
			if(typeof(sourceTreeObj)!="object" || $.isEmptyObject(sourceTreeObj)){
				console.error("生成树对象不正确");
				return false;
			}
			var index = 0;
			for(var key in sourceTreeObj){
				_treeArr[index] = {};
				_treeArr[index].open = true;
				_treeArr[index].name = key;
				_treeArr[index].id = key;
				_treeArr[index].parent = parentName;
				_treeArr[index].fullName = parentFullName + key;
				if(typeof(sourceTreeObj[key].id)=="undefined"){
					_treeArr[index].children = [];
					_treeArr[index].chkDisabled = true;
					getTreeNodes(sourceTreeObj[key],_treeArr[index].children,key,_treeArr[index].fullName+'.');
				}else{
					_treeArr[index].id = sourceTreeObj[key].id;
				}
				index++ ;
			}
		}
		getTreeNodes(obj,treeArr,-1,'');
		return treeArr;
	},
	init:function(list){
		var methodObj = this.getObjByArr(list.method,'method');
		var listObj = this.getObjByArr(list.method,'method','list');
		var modalObj = this.getObjByArr(list.method,'method','modal');
		var stateObj = this.getObjByArr(list.state,'state');
		var tree = {
			controller:this.getSelectTree(methodObj),
			list:this.getSelectTree(listObj),
			modal:this.getSelectTree(modalObj),
			state:this.getSelectTree(stateObj),
		}
		return tree;
	}
}
// 获得隐藏数组 根据状态 --- 选择不同状态 隐藏字段联动改变 获得新的隐藏数组
pageProperty.getAllAtateFieldsArr = function(stateArr){
	/*
	 * stateArr 状态数组
	 */
}
//根据模板配置参数生成表单，表格
pageProperty.produceConfigerPage = function(rowData){
	var configerData = pageProperty.configerData; 	//配置的参数

	configerData.common = typeof(configerData.common) == "string" ? configerData.common : 'common'; 	//页面基本样式
	pageProperty.configer = {};
	var configerTable = [];
	switch(configerData.common){
		case 'singleForm':
			pageProperty.configer.form = [
				{
					element: 	'label',
					label: 		'基本配置',
					width: 	 	'100%',
				},{
					label: 		'包名',
					type: 		'text',
					rules: 		"required",
					id: 		'base-package',
					column: 	6,
				},{
					label: 		'模板模式',
					type: 		'text',
					id: 		'base-mode',
					column: 	6,
				}
			];
		 	break;
		case 'singleTable':
			pageProperty.configer.form = [
				{
					element: 	'label',
					label: 		'基本配置',
					width: 	 	'100%',
				},{
					label: 		'包名',
					type: 		'text',
					rules: 		"required",
					id: 		'base-package',
					column: 	6,
				},{
					label: 		'模板模式',
					type: 		'select',
					id: 		'base-mode',
					column: 	6,
					textField: 	'name',
					valueField: 'id',
					subdata:[
						{
							id:'list-block-tags',
							name:'list-block-tags',
						},{
							id:'list-block-tags-vertical',
							name:'list-block-tags-vertical',
						}
					],
				}
			];
		 	break;
		case 'common':
			pageProperty.configer.form = [
				{
					element: 	'label',
					label: 		'基本配置',
					width: 	 	'100%',
				},{
					label: 		'包名',
					type: 		'text',
					id: 		'base-package',
					rules: "required",
					column: 	4,
				},{
					label: 		'标题',
					type: 		'text',
					id: 		'base-title',
					column: 	4,
				},{
					label: 		'模板模式',
					type: 		'select',
					id: 		'base-mode',
					column: 	4,
					textField: 	'name',
					valueField: 'id',
					subdata:[
						{
							id:'defaultLineNum',
							name:'defaultLineNum',
						}
					],
				},{
					element: 	'label',
					label: 		'表单配置',
					width: 	 	'100%',
				},{
					id: 'form-formSource',
					label:'表单模式',
					type:'select',
					textField:'name',
					valueField:'id',
					subdata:[
						{ id : 'halfScreen', name : '半屏模式' },
						{ id : 'fullScreen', name : '全屏模式' },
						{ id : 'inlineScreen', name : '行内模式' },
						{ id : 'staticData', name : '功能模式' },
					],
					column:6,
				},{
					label: 		'主键',
					type: 		'text',
					id: 		'form-idField',
					column: 	6,
				},{
					label: 		'voList',
					type: 		'text',
					id: 		'form-keyField',
					column: 	6,
				},
				// {
				// 	label: 		'表单-业务对象',
				// 	type: 		'tree-select',
				// 	id: 		'form-fieldObj',
				// 	fullnameField:"fullName",
				// 	subdata: 	pageProperty.zTreeNodes,
				// 	textField: 	"name",
				// 	valueField: "fullName",
				// 	column: 	4,
				// },
				{
					label: 		'状态类别',
					type: 		'tree-select',
					id: 		'form-fieldStr',
					fullnameField:"fullName",
					subdata: 	pageProperty.zTreeNodes,
					textField: 	"name",
					valueField: "fullName",
					column: 	6,
					clickCallback: function(data){
						var fieldStr = data.id;
						pageProperty.getHideSubdataByField(fieldStr,'form-hide','page-formJson');
					}
				},{
					label: 		'隐藏字段',
					type: 		'select2',
					id: 		'form-hide',
					column: 	6,
					textField:   'name',
					valueField: 'id', 
					multiple:true,
					maximumItem:100,
					subdata: 	[],
				},
				// {
				// 	label: 		'表单-style',
				// 	type: 		'radio',
				// 	id: 		'form-fieldIs',
				// 	subdata: 	[
				// 		{
				// 			id:'true',
				// 			name:'true'
				// 		},{
				// 			id:'false',
				// 			name:'false'
				// 		}
				// 	],
				// 	hidden:true,
				// 	value:'false',
				// 	textField: 	"name",
				// 	valueField: "id",
				// 	column: 	4,
				// }
			];
			break;
		case 'tree':
			pageProperty.configer.form = [
				{
					element: 	'label',
					label: 		'基本配置',
					width: 	 	'100%',
				},{
					label: 		'包名',
					type: 		'text',
					id: 		'base-package',
					rules: 		"required",
					column: 	6,
				},{
					label: 		'标题',
					type: 		'text',
					id: 		'base-title',
					column: 	6,
				},{
					label: 		'默认来源tree',
					type: 		'radio',
					id: 		'base-isSourceTree',
					column: 	6,
					textField: 	'name',
					valueField: 'id',
					value: 		'false',
					subdata: 	[
						{
							id:'true',
							name:'true',
						},{
							id:'false',
							name:'false'
						}
					],
				},{
					label: 		'选择配置',
					type: 		'select2',
					id: 		'base-base',
					textField: 	"name",
					valueField: "id",
					column: 	6,
					multiple: 	true,
					subdata:[
						{
							id:'table',
							name:'table'
						},{
							id:'form',
							name:'form',
						}
					],
					changeHandler:function(id,value){
						var isDefault = false;
						var defaultValue = {};
						var arrChange = [];
						if($.isArray(id)){
							arrChange.push(pageProperty.setBaseFormArray('table','表格','page-formJson2',false));
							arrChange.push(pageProperty.setBaseFormArray('form','表单','page-formJson2',false));
						}else{
							if(id == "table"){
								arrChange = pageProperty.setBaseFormArray('table','表格','page-formJson2',false);
							}
							if(id == "form"){
								arrChange = pageProperty.setBaseFormArray('form','表单','page-formJson2',false);
							}
						}
						var formJson = {
							id:"page-formJson2",
							size:"standard",
							format:"standard",
							fillbg:false,
							form:arrChange
						}
						if(pageProperty.$pageContainer.find("#page-formJson2").children().length > 0){
							isDefault = true;
							defaultValue = nsForm.getFormJSON("page-formJson2",false);
							//树结构默认值
							for(var key in defaultValue){
								switch(key){
									case 'table-ajax-src':
									case 'form-ajax-src':
									case 'form-fieldStr':
									case 'table-fieldStr':
										defaultValue[key] = {
											text:defaultValue[key],
											value:defaultValue[key]
										}
										break;
								}
							}
							pageProperty.$pageContainer.find("#page-formJson2").children().remove();
						}
						if(arrChange.length > 0){
							formPlane.formInit(formJson);
							if(isDefault){
								formPlane.fillValues(defaultValue,'page-formJson2');
							}
						}
					}
				},{
					element: 	'label',
					label: 		'目录树配置',
					width: 	 	'100%',
				},{
					label: 		'地址',
					type: 		'tree-select',
					id: 		'tree-src',
					rules: 		'required',
					fullnameField:"fullName",
					subdata: 	pageProperty.zTreeNodesUrl,
					textField: 	"name",
					valueField: "fullName",
					column: 	4,
				},{
					label: 		'类型',
					type: 		'radio',
					id: 		'tree-type',
					subdata: 	[
						{
							id:'GET',
							name:'GET'
						},{
							id:'POST',
							name:'POST'
						}
					],
					value:'POST',
					textField: 	"name",
					valueField: "id",
					column: 	4,
				},{
					label: 		'数据源',
					type: 		'text',
					id: 		'tree-dataSrc',
					column: 	4,
				},{
					label: 		'文本值',
					type: 		'text',
					id: 		'tree-textField',
					column: 	4,
				},{
					label: 		'主键',
					type: 		'text',
					id: 		'tree-idField',
					column: 	4,
				},{
					label: 		'字段id',
					type: 		'text',
					id: 		'tree-valueField',
					column: 	4,
				},{
					label: 		'父id',
					type: 		'text',
					id: 		'tree-parentIdField',
					column: 	4,
				},{
					label: 		'标题',
					type: 		'text',
					id: 		'tree-title',
					column: 	4,
				},{
					label: 		'列宽',
					type: 		'text',
					id: 		'tree-column',
					column: 	4,
				},{
					label: 		'请求参',
					type: 		'text',
					value: 		'{}',
					id: 		'tree-data',
					column: 	4,
				},{
					label: 		'传值方式',
					type: 		'input-select',
					id: 		'tree-dataFormat',
					column: 	4,
					selectConfig:{
						textField: 'name',
						valueField:'id',
						subdata: [
							{
								id:'ids',
								name:'ids'
							},{
								id:'id',
								name:'id'
							},{
								id:'normal',
								name:'normal'
							},{
								id:'object',
								name:'object'
							},{
								id:'onlyChildIds',
								name:'onlyChildIds'
							},{
								id:'list',
								name:'list'
							}
						],
					},
					
				},
				{
					element: 	'label',
					label: 		'树按钮配置',
					width: 	 	'100%',
				},
				{
					label: 		'外部按钮',
					type: 		'tree-select',
					id: 		'tree-btns-fieldStr',
					subdata: 	pageProperty.zTreeNodesUrl,
					isCheck:true,
					fullnameField:"fullName",
					textField: 	"name",
					valueField: "fullName",
					column: 	12,
				}
			];
			pageProperty.configer.add = pageProperty.setBaseArr('tree','add','目录树add');
			pageProperty.configer.edit = pageProperty.setBaseArr('tree','edit','目录树edit');
			pageProperty.configer.delete = pageProperty.setBaseArr('tree','delete','目录树delete');
			pageProperty.$pageContainer.find("#modal").append('<div class="col-sm-12" id="page-formJson2"></div>');
			break;
		case 'mainSchedule':
			//双表格基本配置
			pageProperty.configer.form = [
				{
					element: 	'label',
					label: 		'基本配置',
					width: 	 	'100%',
				},{
					label: 		'包名',
					type: 		'text',
					rules: 		"required",
					id: 		'base-package',
					column: 	4,
				},{
					label: 		'标题',
					type: 		'text',
					id: 		'base-title',
					column: 	4,
				},{
					label: 		'模板模式',
					type: 		'select',
					id: 		'base-mode',
					column: 	4,
					textField: 	'name',
					valueField: 'id',
					subdata:[
						{
							id:'horizontal',
							name:'horizontal',
						},{
							id:'block',
							name:'block',
						}
					],
				},{
					label: 		'modeParams',
					type: 		'textarea',
					id: 		'base-modeParams',
					column: 	4,
				}
			];
			break;
		case 'beseForm':
			pageProperty.configer.base = [
				{
					element: 	'label',
					label: 		'基本配置',
					width: 	 	'100%',
				},{
					label: 		'包名',
					type: 		'text',
					rules: 		"required",
					id: 		'base-package',
					column: 	4,
				},{
					label: 		'标题',
					type: 		'text',
					id: 		'base-title',
					column: 	4,
				},{
					label: 		'模板模式',
					type: 		'select',
					id: 		'base-mode',
					column: 	4,
					textField: 	'name',
					valueField: 'id',
					subdata:[
						{
							id:'horizontal',
							name:'horizontal',
						},{
							id:'defaultLineNum',
							name:'defaultLineNum',
						},{
							id:'horizontalLineNum',
							name:'horizontalLineNum',
						}
					],
				},
			]
			// pageProperty.configer.form = pageProperty.setBaseFormArray('form','表单','false',true);
			pageProperty.configer.form = [
				{
					element: 	'label',
					label: 		'表单配置',
					width: 	 	'100%',
				},{
					label: 		'标题',
					type: 		'text',
					id: 		'form-title',
					column: 	6,
				},{
					id: 'form-formSource',
					label:'表单模式',
					type:'select',
					textField:'name',
					valueField:'id',
					subdata:[
						{ id : 'halfScreen', name : '半屏模式' },
						{ id : 'fullScreen', name : '全屏模式' },
						{ id : 'inlineScreen', name : '行内模式' },
						{ id : 'staticData', name : '功能模式' },
					],
					column:6,
				},{
					label: 		'主键',
					type: 		'text',
					id: 		'form-idField',
					rules: 		"required",
					column: 	6,
				},
				{
					label: 		'voList',
					type: 		'text',
					id: 		'form-keyField',
					column: 	6,
				},
				{
					label: 		'状态类别',
					type: 		'tree-select',
					id: 		'form-fieldStr',
					subdata: 	pageProperty.zTreeNodes,
					rules: "required",
					fullnameField:"fullName",
					textField: 	"name",
					valueField: "fullName",
					column: 	6,
					clickCallback: function(data){
						var fieldStr = data.id;
						pageProperty.getHideSubdataByField(fieldStr,'form-hide','page-formJson');
					}
				},
				{
					label: 		'隐藏字段',
					type: 		'select2',
					id: 		'form-hide',
					column: 	6,
					textField:   'name',
					valueField: 'id', 
					multiple:true,
					maximumItem:100,
					subdata: 	[],
				},
				{
					element: 	'label',
					label: 		'表单按钮配置',
					width: 	 	'100%',
				},
				{
					label: 		'外部按钮',
					type: 		'tree-select',
					id: 		'form-btns-fieldStr',
					subdata: 	pageProperty.zTreeNodesUrl,
					isCheck:true,
					fullnameField:"fullName",
					textField: 	"name",
					valueField: "fullName",
					column: 	12,
				},
			];
			pageProperty.configer.add = pageProperty.setBaseArr('form','add','表单add');
			pageProperty.configer.edit = pageProperty.setBaseArr('form','edit','表单edit');
			pageProperty.configer.delete = pageProperty.setBaseArr('form','delete','表单delete');
			break;
	}
	if(configerData.table){
		switch(configerData.table){
			case'tableHide':
				break;
			case'tableArray':
				//配置页面表格
				pageProperty.generateTable(true,[]);
				break;
			case'tableArrayTab':
				//配置页面表格
				pageProperty.generateTable(false,[]);
				break;
			case 'tableObject':
				pageProperty.configer.table = pageProperty.setBaseFormArray('table','表格','page-formJson',false);
				break;
			case 'tableObjectDouble':
				pageProperty.configer.main = pageProperty.setBaseFormArray('main','主表','page-formJson',false);
				pageProperty.configer.child = pageProperty.setBaseFormArray('child','附表','page-formJson',false);
				break;
		}
	}
	if(configerData.saveData){
		pageProperty.ajaxConfigForm('saveData');
	}
	if(configerData.getValueAjax){
		pageProperty.ajaxConfigForm('getValueAjax');
	}
	pageProperty.formArray = [];
	for(var key in pageProperty.configer){
		for(var index=0;index<pageProperty.configer[key].length;index++){
			pageProperty.formArray.push(pageProperty.configer[key][index]);
		}
	}
	var formJson = {
		id:"page-formJson",
		size:"standard",
		format:"standard",
		fillbg:false,
		form:pageProperty.formArray
	}
	formPlane.formInit(formJson);
	pageProperty.getDefaultData(rowData);
	if(pageProperty.configerData.isVO){
		pageProperty.hideByID();
	}
}
// 合并两个数组
pageProperty.mergeTwoTable = function(_arr1,_arr2){
	var arr1 = $.extend(true,[],_arr1);
	var arr2 = $.extend(true,[],_arr2);
	for(index=0;index<arr2.length;index++){
		arr1.push(arr2[index]);
	}
	return arr1;
}
pageProperty.hideByID = function(){
	var configerData = pageProperty.configerData;
	var idArr = [];
	var treeArr = [];
	var labelArr = [];
	switch(configerData.template){
		case 'doubleTables':
			idArr = [
						'base-package',
						'main-ajax-src','main-ajax-type','main-ajax-data','main-ajax-dataSrc',
						'main-idField','main-keyField','child-keyField','child-idField',
						'child-ajax-dataSrc','main-btns-fieldStr','main-tableRowBtns-fieldStr',
						'child-tableRowBtns-fieldStr','child-btns-fieldStr','child-ajax-src','child-ajax-type',
						'child-ajax-data','saveData-type','saveData-src',
						'saveData-dataSrc','saveData-data'
					];
			labelArr = ['element3','element9'];
			hideID('page-formJson',idArr);
			hideLabel('page-formJson',labelArr);
			break;
		case 'singleTable':
			idArr = [
						'base-package',
						'table-ajax-src','table-ajax-type','table-ajax-data','table-ajax-dataSrc',
						'table-idField','table-keyField','table-btns-fieldStr',
						'table-tableRowBtns-fieldStr','saveData-type','saveData-src','saveData-dataSrc','saveData-data'
					];
			labelArr = ['element3'];
			hideID('page-formJson',idArr);
			hideLabel('page-formJson',labelArr);
			break;
		case 'singleForm':
			idArr = [
						'base-package',
						'saveData-type','saveData-src','saveData-dataSrc',
						'saveData-data','getValueAjax-type','getValueAjax-src','getValueAjax-dataSrc',
						'getValueAjax-data','form-idField','form-keyField'
					];
			hideID('page-formJson',idArr);
			break;
		case 'treeTable':
			idArr = [
						'base-package',
						'tree-src','tree-data','tree-dataSrc','tree-type','tree-idField',
						'tree-parentIdField','tree-textField','tree-valueField',
						'tree-btns-fieldStr','saveData-data','saveData-dataSrc',
						'saveData-src','saveData-type','base-base'
					];
			labelArr = ['element2'];
			hideID('page-formJson',idArr);
			hideLabel('page-formJson',labelArr);
			var formIdArr = [
								'form-ajax-data','form-ajax-dataSrc','form-ajax-src','form-ajax-type',
								'form-btns-fieldStr','form-tableRowBtns-fieldStr',
								'form-idField','form-keyField'
							];
			var tableIdArr = [
								'table-ajax-data','table-ajax-dataSrc','table-ajax-src','table-ajax-type',
								'table-btns-fieldStr','table-tableRowBtns-fieldStr',
								'table-idField','table-keyField'
							];
			if(pageProperty.readySaveData){
				// 判断显示的是表单或表格
				var readySaveData = pageProperty.readySaveData.base;
				if(readySaveData){
					if(readySaveData.indexOf(',')){
						treeArr = pageProperty.mergeTwoTable(formIdArr,tableIdArr);
					}else{
						if(readySaveData == 'form'){
							treeArr = formIdArr;
						}
						if(readySaveData == 'table'){
							treeArr = tableIdArr;
						}
					}
				}
				var labelArr2 = ['element2','element8'];
				hideID('page-formJson2',treeArr);
				hideLabel('page-formJson2',labelArr2);
			}
			break;
		case 'tabFormList':
			idArr = [
						'base-package',
						'form-idField','form-keyField',
						'saveData-data','saveData-dataSrc','saveData-src','saveData-type',
						'getValueAjax-src','getValueAjax-type','getValueAjax-dataSrc','getValueAjax-data',
					];
			hideID('page-formJson',idArr);
			break;
		case 'listFilter':
			idArr = [
						'base-package',
						'form-idField','form-keyField','form-btns-fieldStr',
						'table-idField','table-keyField','table-btns-fieldStr','table-tableRowBtns-fieldStr',
						'table-ajax-src','table-ajax-type','table-ajax-dataSrc','table-ajax-data',
						'saveData-data','saveData-dataSrc','saveData-src','saveData-type',
						'getValueAjax-src','getValueAjax-type','getValueAjax-dataSrc','getValueAjax-data',
					];
			labelArr = ['element2','element8'];
			hideID('page-formJson',idArr);
			hideLabel('page-formJson',labelArr);
			break;
	}
	function hideID(id,arr){
		for(index=0;index<arr.length;index++){
			nsForm.hideByID(arr[index],id);
		}
	}
	function hideLabel(id,arr){
		var $label = $('#'+id).find('label');
		for(var index=0;index<$label.length;index++){
			var forName = $label.eq(index).attr('for');
			var forNameArr = forName.split('-');
			var forStr = forNameArr[forNameArr.length-1];
			if(arr.indexOf(forStr) > -1){
				$label.eq(index).remove();
			}
		}
	}
}
// 根据选择的状态类别刷新隐藏字段的下拉框
pageProperty.getHideSubdataByField = function(fieldStr,hideID,formID){
	//fieldStr状态
	//hideID表单hide的id
	//form表单的id
    var subdataArray = [];
    if(fieldStr.indexOf(".")>-1){
    	var fieldStrArr = fieldStr.split('.');
    	if(fieldStrArr.length==3){
    		if(typeof(eval(fieldStrArr[0]+'.'+fieldStrArr[1]))=="undefined"){
    			console.log("vo不存在");
    			console.log(fieldStrArr[0]+'.'+fieldStrArr[1]+'.'+fieldStrArr[2]);
    			return false;
    		}
    		if(typeof(eval(fieldStrArr[0]+'.'+fieldStrArr[1]+'.'+'state.'+fieldStrArr[2]))=="undefined"){
    			console.log("状态不存在");
    			console.log(fieldStrArr[0]+'.'+fieldStrArr[1]+'.'+fieldStrArr[2]);
    			return false;
    		}
    		var fieldArray = nsProject.getFieldsByState(eval(fieldStrArr[0]+'.'+fieldStrArr[1]),fieldStrArr[2]);
    		for(var i = 0; i<fieldArray.length; i++){
    			if(typeof(fieldArray[i].html)!="string" && typeof(fieldArray[i].element)!="string"){
    				subdataArray.push({
	    				id:fieldArray[i].id,
	    				name:fieldArray[i].label,
	    			});
    			}
    		}
			var hideFieldConfig = {
				id:     	hideID,
				value:     	[],
				subdata:   	subdataArray,
			}
			nsForm.edit([hideFieldConfig],formID)
    	}else{
    		console.error("状态选择错误");
    	}
    }else{
    	console.error("状态选择错误");
    }
}
//配置页面表格
pageProperty.generateTable = function(isType,dataSourceArr){
	//isType是否有type值
	isType = typeof(isType) == "boolean" ? isType : false;
	var dataSource = typeof(dataSourceArr) == 'object' ? dataSourceArr : []; //是否有默认值（已经存储的值显示在表格，没有值显示空表格）

	// 新模板隐藏字段
	var isHideVo = false;
	if(pageProperty.configerData.isVO){
		isHideVo = true;
		isType = true;
	}

	var columnConfig = [ 
		{
			field : 'type',
			title : '类型',
			hidden:isType,
			width : 80,
			tabPosition : 0,
			orderable : true,
		},{
			field : 'keyField',
			title : 'voList',
			width : 120,
			tabPosition : 0,
			orderable : true,
			hidden:isHideVo,
		},{
			field : 'idField',
			title : '主键',
			width : 50,
			tabPosition : 0,
			orderable : true,
			hidden:isHideVo,
		},{
			field : 'params',
			title : 'params',
			width : 120,
			tabPosition : 0,
			orderable : true,
		},
		// {
		// 	field : 'tree-fieldObj', 			//nsProject.getFieldsByState()第一个参数
		// 	title : '表格-业务对象',
		// 	width : 100,				
		// },
		{
			field : 'tree-fieldStr',			//nsProject.getFieldsByState()第二个参数
			title : '状态类别',
			width : 200,
			tabPosition : 0,
			orderable : true,
		},
		{
			field : 'hide',			//nsProject.getFieldsByState()第二个参数
			title : '隐藏字段',
			width : 200,
			tabPosition : 0,
			orderable : true,
		},
		// {
		// 	field : 'tree-fieldIs',				//nsProject.getFieldsByState()第三个参数
		// 	title : '表格-style',
		// 	width : 100,
		// 	formatHandler:{
		// 		type:'dictionary',
		// 		data:
		// 		{
		// 			'true':'表格',
		// 			'false':'表单',
		// 		}
		// 	}
		// },
		{
			field : 'title',
			title : '标题',
			width : 120,
			tabPosition : 0,
			orderable : true,
		},{
			field : 'add',
			title : '新增',
			width : 50,
			tabPosition : 0,
			orderable : true,
			formatHandler:{
				type:'dictionary',
				data:
				{
					'[object Object]':'<i class="fa fa-check"></i>',
					'':'<i class="fa fa-close"></i>',
				}
			}
		},{
			field : 'edit',
			title : '修改',
			width : 50,
			tabPosition : 0,
			orderable : true,
			formatHandler:{
				type:'dictionary',
				data:
				{
					'[object Object]':'<i class="fa fa-check"></i>',
					'':'<i class="fa fa-close"></i>',
				}
			}
		},{
			field : 'delete',
			title : '删除',
			tabPosition : 0,
			width : 50,
			orderable : true,
			formatHandler:{
				type:'dictionary',
				data:
				{
					'[object Object]':'<i class="fa fa-check"></i>',
					'':'<i class="fa fa-close"></i>',
				}
			}
		},{
			field : 'multiAdd',
			title : '批量添加',
			tabPosition : 0,
			width : 50,
			orderable : true,
			formatHandler:{
				type:'dictionary',
				data:
				{
					'[object Object]':'<i class="fa fa-check"></i>',
					'':'<i class="fa fa-close"></i>',
				}
			}
		},{
			field : 'isUseSort',
			title : '是否排序',
			tabPosition : 0,
			width : 120,
			orderable : true,
		},
		// ,{
		// 	field : 'btns-fieldObj',
		// 	title : '表格上按钮-业务对象',
		// 	width : 120,
		// },
		{
			field : 'btns-fieldStr',
			title : '外部按钮',
			width : 200,
			tabPosition : 1,
			orderable : true,
			hidden:isHideVo,
		},
		// ,{
		// 	field : 'tableRowBtns-fieldObj',
		// 	title : '表格行按钮-业务对象',
		// 	width : 120,
		// },
		{
			field : 'tableRowBtns-fieldStr',
			title : '行内按钮',
			width : 200,
			tabPosition : 1,
			orderable : true,
			hidden:isHideVo,
		},{
			field:'',
			title:'操作',
			width : 200,
			tabPosition:'after',
			formatHandler:{
				type:'button',
				data:[
					{'修改':function(row){
							// addAndEdit(row,'edit');
							pageProperty.addAndEditTableInline(row,'edit',isType);
						}
					},
					{'删除':function(row){
							nsConfirm("确认要删除吗？",function(isdelete){
								if(isdelete){
									var trObj = row.obj.closest('tr');
									baseDataTable.delRowData('page-table',trObj);
								}
							},"success");
						}
					},
					{'新建':function(row){
							// addEditDeleteObj(row,'add');
							pageProperty.setColumnData(row,'add');
						}
					},
					{'修改推荐标准':function(row){
							// addEditDeleteObj(row,'edit');
							pageProperty.setColumnData(row,'edit');
						}
					},
					{'取消':function(row){
							// addEditDeleteObj(row,'delete');
							pageProperty.setColumnData(row,'delete');
						}
					},
					{'批量新增':function(row){
							pageProperty.setColumnData(row,'multiAdd');
						}
					},
					{'上移':function(row){
							// console.log(row);
							var tableData = baseDataTable.allTableData('page-table');
							if(row.rowIndexNumber==0){
								nsAlert("已经是第一个了","error");
							}else{
								var newPosition = row.rowIndexNumber;
								var newData = row.rowData;
								tableData[newPosition] = tableData[newPosition-1];
								tableData[newPosition-1] = newData;
								nsTable.originalConfig['page-table'].dataConfig.dataSource = tableData;
								nsTable.refreshByID("page-table");
							}
						}
					},
					{'下移':function(row){
							// console.log(row);
							var tableData = baseDataTable.allTableData('page-table');
							if(row.rowIndexNumber==tableData.length-1){
								nsAlert("已经是最后一个了","error");
							}else{
								var newPosition = row.rowIndexNumber;
								var newData = row.rowData;
								tableData[newPosition] = tableData[newPosition+1];
								tableData[newPosition+1] = newData;
								nsTable.originalConfig['page-table'].dataConfig.dataSource = tableData;
								nsTable.refreshByID("page-table");
							}
						}
					},
				]
			}
		}
	];
	var uiConfig = {
		pageLengthMenu: 5,			//显示5行
		isSingleSelect:true,		//是否开启单行选中
		isUseTabs:true,
		tabsName:['1','2'],
		$container:$('#page-table-body'), // 表格容器
	};
	var dataConfig = {
		tableID:		'page-table',
		dataSource: 	dataSource
	}
	var btnConfig = {
		selfBtn:[
			{
				text:'新增',
				handler:function(){
					pageProperty.addAndEditTableInline({},"add",isType);
				}
			}
		]
	}
	if(pageProperty.configerData.isVO){
		delete uiConfig.tabsName;
		delete uiConfig.isUseTabs;
		baseDataTable.init(dataConfig, columnConfig, uiConfig);
	}else{
		/*switch(pageProperty.configerData.template){
			case 'formTable':
			case 'tabFormList':
				columnConfig.splice(9,0,{
					field : 'multiAdd',
					title : '批量添加',
					tabPosition : 0,
					width : 50,
					orderable : true,
					formatHandler:{
						type:'dictionary',
						data:
						{
							'[object Object]':'<i class="fa fa-check"></i>',
							'':'<i class="fa fa-close"></i>',
						}
					}
				});
				columnConfig[columnConfig.length-1].formatHandler.data.splice(5,0,{
					'批量新增':function(row){
						pageProperty.setColumnData(row,'multiAdd');
					}
				});
				break;
		}*/
		baseDataTable.init(dataConfig, columnConfig, uiConfig, btnConfig);
	}
}
//ajax配置表单
pageProperty.ajaxConfigForm = function(ajaxName){
	// var isUrl = ajaxName == "getValueAjax" ? "" : "required"; //url是否必填
	pageProperty.configer[ajaxName] = [
		{
			element: 	'label',
			label: 		ajaxName+'的ajax配置',
			width: 	 	'100%',
		},{
			label: 		'地址',
			type: 		'tree-select',
			id: 		ajaxName+'-src',
			fullnameField:"fullName",
			// rules: isUrl,
			subdata: 	pageProperty.zTreeNodesUrl,
			textField: 	"name",
			valueField: "fullName",
			column: 	6,
		},{
			label: 		'请求方式',
			type: 		'radio',
			id: 		ajaxName+'-type',
			textField: 	'name',
			valueField: 'id',
			value: 'POST',
			subdata: 	[
				{
					id:'GET',
					name:'GET',
				},{
					id:'POST',
					name:'POST',
				}
			],
			column: 	6,
		},{
			label: 		'数据源',
			type: 		'text',
			value: 		'data',
			id: 		ajaxName+'-dataSrc',
			column: 	6,
		},{
			label: 		'请求参',
			type: 		'textarea',
			value: 		'{}',
			id: 		ajaxName+'-data',
			column: 	6,
		},{
			label: 		'传值方式',
			type: 		'input-select',
			id: 		ajaxName+'-dataFormat',
			column: 	6,
			selectConfig:{
				textField: 'name',
				valueField:'id',
				subdata: [
					{
						id:'ids',
						name:'ids'
					},{
						id:'id',
						name:'id'
					},{
						id:'normal',
						name:'normal'
					},{
						id:'object',
						name:'object'
					},{
						id:'onlyChildIds',
						name:'onlyChildIds'
					},{
						id:'list',
						name:'list'
					}
				],
			},
		},{
			label: 		'dataLevel',
			type: 		'select',
			id: 		ajaxName+'-dataLevel',
			column: 	6,
			textField: 'name',
			valueField:'id',
			// value:'noone',
			subdata: [
				{
					id:'parent',
					name:'parent'
				},{
					id:'child',
					name:'child'
				},{
					id:'brothers',
					name:'brothers'
				},{
					id:'onlyChildIds',
					name:'onlyChildIds'
				},{
					id:'id',
					name:'id'
				},{
					id:'ids',
					name:'ids'
				},{
					id:'noone',
					name:'noone'
				}
			],
		},
	]
	if(ajaxName == 'saveData'){
		pageProperty.configer[ajaxName].push(
			{
				label: 		'关闭弹框',
				type: 		'radio',
				id: 		ajaxName+'-isCloseWindow',
				column: 	6,
				textField: 'name',
				valueField:'id',
				value:'false',
				subdata: [
					{
						id:'true',
						name:'true'
					},{
						id:'false',
						name:'false'
					}
				],
			}
		);
	}
}
//配置表格方法
//新增/修改表格行
pageProperty.addAndEditTableInline = function(row,base,isType){
	//row修改时表格默认数据
	//base方法：新增/修改
	//isType是否有type值
	var baseByTitle = {
		add:"新增",
		edit:"修改",
	}
	var base = typeof(base) == "string" ? base : 'add'; //新增或修改
	isType = typeof(isType) == "boolean" ? isType : false; //类型是否选择
	// 新模板隐藏字段
	var isHideVo = false;
	if(pageProperty.configerData.isVO){
		isHideVo = true;
		isType = true;
	}
	var dialogFormArray = [
		{
			id:'type',
			label:'类型',
			type:'select',
			textField:'name',
			valueField:'id',
			hidden:isType,
			subdata:[
				{
					id:'table',
					name:'table'
				},{
					id:'form',
					name:'form'
				}
			],
			changeHandler:function(selectId){
				var edit = {
					id:'formSource'
				}
				if(selectId == 'form'){
					edit.hidden = false;
				}else{
					edit.hidden = true;
				}
				nsForm.edit([edit], 'plane-page');
			},
		},{
			id: 'formSource',
			label:'表单模式',
			type:'select',
			textField:'name',
			valueField:'id',
			subdata:[
				{ id : 'halfScreen', name : '半屏模式' },
				{ id : 'fullScreen', name : '全屏模式' },
				{ id : 'inlineScreen', name : '行内模式' },
				{ id : 'staticData', name : '功能模式' },
			],
			column:6,
		},{
			id:'keyField',
			label:'voList',
			type:'text',
			hidden:isHideVo,
		},{
			id:'idField',
			label:'主键',
			rules:'required',
			type:'text',
			hidden:isHideVo,
		},{
			id:'params',
			label:'params',
			type:'textarea',
		},
		// {
		// 	id:'tree-fieldObj',
		// 	label:'表格-业务对象',
		// 	rules:'required',
		// 	type:'tree-select',
		// 	fullnameField:"fullName",
		// 	textField:"name",
		// 	valueField:"fullName",
		// 	subdata:pageProperty.zTreeNodes
		// },
		{
			id:'tree-fieldStr',
			label:'状态类别',
			rules:'required',
			type:'tree-select',
			fullnameField:"fullName",
			// isCheckParent:true,
			textField:"name",
			valueField:"fullName",
			subdata:pageProperty.zTreeNodes,
			clickCallback: function(data){
				var fieldStr = data.id;
				pageProperty.getHideSubdataByField(fieldStr,'hide','plane-page');
			}
		},{
			label: 		'隐藏字段',
			type: 		'select2',
			id: 		'hide',
			column: 	6,
			textField:   'name',
			valueField: 'id', 
			multiple:true,
			maximumItem:100,
			subdata: 	[],
		},
		// {
		// 	id:'tree-fieldIs',
		// 	label:'表格-style',
		// 	rules:'required',
		// 	type:'radio',
		// 	textField:"name",
		// 	valueField:"id",
		// 	isHasClose:true,
		// 	subdata:[
		// 		{
		// 			id:'true',
		// 			name:'是',
		// 		},{
		// 			id:'false',
		// 			name:'否',
		// 		}
		// 	]
		// },
		{
			id:'title',
			label:'标题',
			type:'text'
		},{
			id:'isUseSort',
			label:'是否排序',
			type:'radio',
			textField:'name',
			valueField:'id',
			subdata:[
				{
					id:'true',
					name:'是'
				},{
					id:'false',
					name:'否'
				}
			],
		},
		// ,{
		// 	id:'btns-fieldObj',
		// 	label:'表格上按钮-业务对象',
		// 	type:'tree-select',
		// 	fullnameField:"fullName",
		// 	textField:"name",
		// 	valueField:"fullName",
		// 	subdata:pageProperty.zTreeNodesUrl
		// },
		// ,{
		// 	id:'tableRowBtns-fieldObj',
		// 	label:'表格行按钮-业务对象',
		// 	type:'tree-select',
		// 	fullnameField:"fullName",
		// 	textField:"name",
		// 	valueField:"fullName",
		// 	subdata:pageProperty.zTreeNodesUrl
		// },
	]
	if(!pageProperty.configerData.isVO){
		dialogFormArray.push({
			element: 	'label',
			label: 		'表格按钮配置',
			width: 	 	'100%',
		});
		dialogFormArray.push({
			id:'btns-fieldStr',
			label:'外部按钮',
			type:'tree-select',
			fullnameField:"fullName",
			// isCheckParent:true,
			isCheck:true,
			textField:"name",
			valueField:"fullName",
			subdata:pageProperty.zTreeNodesUrl,
		});
		dialogFormArray.push({
			id:'tableRowBtns-fieldStr',
			label:'行内按钮',
			type:'tree-select',
			fullnameField:"fullName",
			// isCheckParent:true,
			isCheck:true,
			textField:"name",
			valueField:"fullName",
			subdata:pageProperty.zTreeNodesUrl,
		});
	}
	if(base == 'edit'){
		var isHiddenFormSource = false;
		for(var valueI=0; valueI<dialogFormArray.length; valueI++){
			switch(dialogFormArray[valueI].id){
				case 'type':
					dialogFormArray[valueI].value = row.rowData[dialogFormArray[valueI].id];
					if(dialogFormArray[valueI].value != 'form'){
						isHiddenFormSource = true; 
					}
					break;
				case 'btns-fieldStr':
				case 'tableRowBtns-fieldStr':
					dialogFormArray[valueI].value = row.rowData[dialogFormArray[valueI].id];
					break;
				case 'tree-fieldStr':
					dialogFormArray[valueI].value = row.rowData[dialogFormArray[valueI].id];
					if(row.rowData[dialogFormArray[valueI].id].indexOf(".")>-1){
						//存在默认值
						var valueStr = row.rowData[dialogFormArray[valueI].id];
						var fieldStrArr = valueStr.split('.');//分割字符串用点
						if(fieldStrArr.length==3){
							//字段长度为3标明值正确
							var subdataArray = [];
				    		var fieldArray = nsProject.getFieldsByState(eval(fieldStrArr[0]+'.'+fieldStrArr[1]),fieldStrArr[2]);
				    		for(var i = 0; i<fieldArray.length; i++){
				    			if(typeof(fieldArray[i].html)!="string" && typeof(fieldArray[i].element)!="string"){
				    				subdataArray.push({
					    				id:fieldArray[i].id,
					    				name:fieldArray[i].label,
					    			});
				    			}
				    		}
				    		dialogFormArray[5].subdata = subdataArray;
				    	}else{
				    		console.error("状态选择错误");
				    	}
					}else{
						console.error("状态选择错误");
					}
					break;
				default:
					dialogFormArray[valueI].value = row.rowData[dialogFormArray[valueI].id];
					break;
			}
		}
		for(var valueI=0; valueI<dialogFormArray.length; valueI++){
			switch(dialogFormArray[valueI].id){
				case 'formSource':
					dialogFormArray[valueI].hidden = isHiddenFormSource;
					break;
			}
		}
	}
	var dialogJson = {
		id: 	"plane-page",
		title: 	baseByTitle[base],
		size: 	"m",
		form:dialogFormArray,
		btns:[
			{
				text: 		'确认',
				handler: 	function(){
					if(base == 'edit'){
						var dialogFormData = nsdialog.getFormJson("plane-page");
						if(dialogFormData){
							var dialogData = $.extend(true,{},dialogFormData);
							var origalTableData = $.extend(true,{},row);
							var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
							for(var key in origalData){
								if(typeof(dialogData[key])!='undefined'){
									if(dialogData[key] != origalData[key]){
										origalData[key] = dialogData[key];
									}
								}
							}
							baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
							nsdialog.hide();
						}
					}else{
						var dialogData = nsdialog.getFormJson("plane-page");
						if(dialogData){
							var rowsData = [dialogData];
							baseDataTable.addTableRowData('page-table',rowsData);
							nsdialog.hide();
						}
					}
				},
			}
		]
	}
	nsdialog.initShow(dialogJson);
}
//配置表格设置列数据方法
pageProperty.setColumnData = function(row,base){
	var baseByTitle = {
		add:"新增",
		edit:"修改",
		delete:"删除",
		multiAdd:"批量新增",
	}
	var typeDe = base == 'delete' ? 'confirm' : 'dialog';
	// 表单表格的批量新增需要配置chargeField
	var isChargeField = base == 'multiAdd' ? false : true;
	var dialogJson = {
		id: 	"plane-page",
		title: 	baseByTitle[base],
		size: 	"m",
		form:[
			{
				id:'type',
				label:'类型',
				type:'select',
				value: typeDe,
				subdata:[
					{
						value:'none',
						text:'none'
					},{
						value:'dialog',
						text:'dialog'
					},{
						value:'confirm',
						text:'confirm'
					},{
						value:'multi',
						text:'insertform'
					},{
						value:'component',
						text:'component'
					}
				],
				column: 	6,
			},{
				id: 'formSource',
				label:'表单模式',
				type:'select',
				textField:'name',
				valueField:'id',
				subdata:[
					{ id : 'halfScreen', name : '半屏模式' },
					{ id : 'fullScreen', name : '全屏模式' },
					{ id : 'inlineScreen', name : '行内模式' },
					{ id : 'staticData', name : '功能模式' },
				],
				column:6,
			},{
				id:'serviceComponent',
				label:'servicename',
				type:'text'
			},{
				label: 		'弹框宽度',
				id: 		'width',
				type: 		'input-select',
				selectConfig:{
					textField:			'text',
					valueField:			'id',
					subdata:			[
						{
							text:'s',
							id:'s'
						},{
							text:'m',
							id:'m'
						},{
							text:'b',
							id:'b'
						},{
							text:'f',
							id:'f'
						}
					]
				}
			},{
				id:'title',
				label:'标题',
				type:'text'
			},{
				id:'text',
				label:'文本',
				type:'text'
			},{
				id:'dialogBtnText',
				label:'dialogBtnText',
				type:'text'
			},{
				id:'chargeField',
				label:'chargeField',
				type:'textarea',
				hidden:isChargeField,
			},{
				element: 	'label',
				label: 		'表单配置',
				width: 	 	'100%',
			},
			// {
			// 	id:'tree-fieldObj',
			// 	label:'表单-业务对象',
			// 	type:'tree-select',
			// 	fullnameField:"fullName",
			// 	textField:"name",
			// 	valueField:"fullName",
			// 	subdata:pageProperty.zTreeNodes
			// },
			{
				id:'tree-fieldStr',
				label:'状态类别',
				type:'tree-select',
				fullnameField:"fullName",
				textField:"name",
				valueField:"fullName",
				subdata:pageProperty.zTreeNodes
			},
			// {
			// 	id:'tree-fieldIs',
			// 	label:'表单-style',
			// 	type:'radio',
			// 	textField:"name",
			// 	valueField:"id",
			// 	isHasClose:true,
			// 	subdata:[
			// 		{
			// 			id:'true',
			// 			name:'是',
			// 		},{
			// 			id:'false',
			// 			name:'否',
			// 		}
			// 	]
			// }
			// ,{
			// 	element: 	'label',
			// 	label: 		'ajax配置',
			// 	width: 	 	'100%',
			// },{
			// 	id:'ajax-src',
			// 	label:'src',
			// 	type:'text'
			// },{
			// 	id:'ajax-type',
			// 	label:'type',
			// 	type:'text'
			// },{
			// 	id:'ajax-dataSrc',
			// 	label:'dataSrc',
			// 	type:'text'
			// },{
			// 	id:'ajax-data',
			// 	label:'data',
			// 	type:'textarea'
			// },{
			// 	id:'ajax-isServerMode',
			// 	label:'isServerMode',
			// 	type:'text'
			// },
		],
		btns:[
			{
				text: 		'确认',
				handler: 	function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						for(var key in dialogData){
							if(dialogData[key] != ''){
							}else{
								delete dialogData[key];
							}
						}
						if(!$.isEmptyObject(dialogData)){
							/******保存前数据******/
							// console.log(row.rowData);
							row.rowData[base] = dialogData;
							/******正在保存数据******/
							// console.log(row.rowData);
							baseDataTable.table[row.tableId].row(row.obj.parents("tr")).data(row.rowData).draw(false);
							nsdialog.hide();
						}else{
							nsAlert('没有设置'+base,'error');
							row.rowData[base] = '';
							baseDataTable.table[row.tableId].row(row.obj.parents("tr")).data(row.rowData).draw(false);
							nsdialog.hide();
						}
						
					}
				},
			}
		]
	}
	nsdialog.initShow(dialogJson);
	//是否有值，用于修改
	if(typeof(row.rowData[base]) == 'object'){
		if(!$.isEmptyObject(row.rowData[base])){
			var formData = {};
			for(var key in row.rowData[base]){
				if(key == 'tree-fieldStr'){
					formData[key] = {
						value:row.rowData[base][key],
						text:row.rowData[base][key]
					}
				}else{
					formData[key] = row.rowData[base][key];
				}
			}
			// setDefaultTreeSelectData(formData,dialogJson.form);
			formPlane.fillValues(formData,'plane-page');
		}
	}
}
//保存表单，表格数据
pageProperty.getSaveData = function(rowData){
	// var rowData = baseDataTable.getSingleRowSelectedData("client-table"); 	//读取生成页面表格数据  判断是否选中表格
	if(rowData){
		pageProperty.setData = {
			isShowTitle:false,
			isFormHidden:false,
			template:pageProperty.configerData.template
		};
		if(pageProperty.$pageContainer.find("#page-formJson").children().length > 0){
			var formData = nsForm.getFormJSON("page-formJson");					//读取表单数据
			if(pageProperty.$pageContainer.find("#page-formJson2").children().length > 0){
				var formData2 = nsForm.getFormJSON("page-formJson2");			//读取树中表单，表格数据
				for(var key in formData2){
					formData[key] = formData2[key];
				}
			}
		}
		if(formData){
			//读取的表单数据
			pageProperty.saveFormOriginalData = $.extend(true,{},formData);
			formData = pageProperty.dataValida(formData);
			// if(!eval(formData.package)){
			// 	nsAlert("模板错误");
			// 	return false;
			// }
			//保存页面表单
			for(var key in formData){
				//删除表单中的空值
				if(formData[key] == ''){
					delete formData[key];
					continue;
				}
				//数据验证
				var keyArr = key.split("-");
				switch(keyArr[0]){
					case 'base':
						pageProperty.setData[keyArr[1]] = formData[key];
						break;
					case 'saveData':
						if(typeof(pageProperty.setData[keyArr[0]])!="object"){
							pageProperty.setData[keyArr[0]] = {};
							pageProperty.setData[keyArr[0]].ajax = {};
							pageProperty.setData[keyArr[0]].save = {
								text:'保存'
							};
						}
						if(keyArr[1]=="src"){
							var srcStr = formData[key];
							pageProperty.setData[keyArr[0]].ajax[keyArr[1]] = pageProperty.saveSrcData(srcStr);
						}else{
							pageProperty.setData[keyArr[0]].ajax[keyArr[1]] = formData[key];
						}
						break;
					case 'getValueAjax':
						if(typeof(pageProperty.setData[keyArr[0]])!="object"){
							pageProperty.setData[keyArr[0]] = {};
						}
						if(keyArr[1]=="src"){
							var srcStr = formData[key];
							pageProperty.setData[keyArr[0]][keyArr[1]] = pageProperty.saveSrcData(srcStr);
						}else{
							pageProperty.setData[keyArr[0]][keyArr[1]] = formData[key];
						}
						break;
					case 'form':
						// if(typeof(pageProperty.setData[keyArr[0]])!="object"){
						// 	pageProperty.setData[keyArr[0]] = {};
						// }
						// if(keyArr[1] == 'fieldObj' || keyArr[1] == 'fieldStr' || keyArr[1] == 'fieldIs'){
						// 	pageProperty.saveTreeData(formData,pageProperty.setData[keyArr[0]],keyArr[0]);
						// }else{
						// 	pageProperty.setData[keyArr[0]][keyArr[1]] = formData[key];
						// }
						// break;
					case 'table':
						if(typeof(pageProperty.setData[keyArr[0]])!="object"){
							pageProperty.setData[keyArr[0]] = {};
						}
						switch(keyArr[1]){
							case 'btns':
							case 'tableRowBtns':
								pageProperty.saveBtnsTreeData(formData,pageProperty.setData[keyArr[0]],keyArr[0]+'-'+keyArr[1]);
								break;
							case 'hide':
								pageProperty.setData[keyArr[0]][keyArr[1]] = formData[key].split(",");
								break;
							case 'fieldStr':
							// case 'fieldIs':
							// case 'fieldObj':
								var isTable = keyArr[0] == 'table' ? 'true' : 'false';
								pageProperty.saveTreeData(formData,pageProperty.setData[keyArr[0]],keyArr[0],isTable);
								break;
							// case 'field':
							// 	pageProperty.saveTreeData(formData,pageProperty.setData[keyArr[0]],keyArr[0]);
							// 	break;
							case 'ajax':
								if(typeof(pageProperty.setData[keyArr[0]][keyArr[1]]) != 'object'){
									pageProperty.setData[keyArr[0]][keyArr[1]] = {};
								}
								if(keyArr[2] == 'src'){
									var srcStr = formData[key];
									pageProperty.setData[keyArr[0]][keyArr[1]][keyArr[2]] = pageProperty.saveSrcData(srcStr);
								}else{
									pageProperty.setData[keyArr[0]][keyArr[1]][keyArr[2]] = formData[key];
								}
								break;
							case 'add':
							case 'edit':
							case 'delete':
							case 'multiAdd':
								if(typeof(pageProperty.setData[keyArr[0]][keyArr[1]]) != 'object'){
									pageProperty.setData[keyArr[0]][keyArr[1]] = {};
								}
								switch(keyArr[2]){
									// case 'fieldIs':
									// case 'fieldObj':
									case 'fieldStr':
										pageProperty.saveTreeData(formData,pageProperty.setData[keyArr[0]][keyArr[1]],keyArr[0]+'-'+keyArr[1],'{isColumn:false,type:"dialog"}');
										break;
									case 'ajax':
										if(typeof(pageProperty.setData[keyArr[0]][keyArr[1]][keyArr[2]]) != 'object'){
											pageProperty.setData[keyArr[0]][keyArr[1]][keyArr[2]] = {};
										}
										if([keyArr[3]] == 'src'){
											var srcStr = formData[key];
											pageProperty.setData[keyArr[0]][keyArr[1]][keyArr[2]][keyArr[3]] = pageProperty.saveSrcData(srcStr);
										}else{
											pageProperty.setData[keyArr[0]][keyArr[1]][keyArr[2]][keyArr[3]] = formData[key];
										}
										break;
									default:
										pageProperty.setData[keyArr[0]][keyArr[1]][keyArr[2]] = formData[key];
										break;
								}
								break;
							default:
								pageProperty.setData[keyArr[0]][keyArr[1]] = formData[key];
								break;
						}
						break;
					// case 'directoryTree':
					// 	if(typeof(pageProperty.setData.tree)!="object"){
					// 		pageProperty.setData.tree = {};
					// 	}
					// 	if(keyArr[1] == "src"){
					// 		pageProperty.setData.tree[keyArr[1]] = pageProperty.saveSrcData(formData[key]);
					// 	}else{
					// 		pageProperty.setData.tree[keyArr[1]] = formData[key];
					// 	}
						
					// 	break;
					// case 'directoryTreeNode':
					// 	if(typeof(pageProperty.setData.tree)!="object"){
					// 		pageProperty.setData.tree = {};
					// 	}
					// 	if(typeof(pageProperty.setData.tree.add)!="object"){
					// 		pageProperty.setData.tree.add = {};
					// 	}
					// 	if(keyArr[1] == 'fieldObj' || keyArr[1] == 'fieldStr' || keyArr[1] == 'fieldIs'){
					// 		pageProperty.saveTreeData(formData,pageProperty.setData.tree.add,keyArr[0]);
					// 	}else{
					// 		pageProperty.setData.tree.add[keyArr[1]] = formData[key];
					// 	}
					// 	break;
					case 'tree':
						if(typeof(pageProperty.setData.tree)!="object"){
							pageProperty.setData.tree = {};
						}
						switch(keyArr[1]){
							case 'btns':
								pageProperty.saveBtnsTreeData(formData,pageProperty.setData.tree,keyArr[0]+'-'+keyArr[1]);
								break;
							case 'add':
							case 'edit':
							case 'delete':
								if(typeof(pageProperty.setData.tree[keyArr[1]])!="object"){
									pageProperty.setData.tree[keyArr[1]] = {};
								}
								// if(keyArr[2] == 'fieldObj' || keyArr[2] == 'fieldStr'){
								if(keyArr[2] == 'fieldStr'){
									pageProperty.saveTreeData(formData,pageProperty.setData.tree[keyArr[1]],keyArr[0]+'-'+keyArr[1],'{isColumn:false,type:"dialog"}');
								}else{
									pageProperty.setData.tree[keyArr[1]][keyArr[2]] = formData[key];
								}
								break;
							default:
								if(keyArr[1] == "src"){
									pageProperty.setData.tree[keyArr[1]] = pageProperty.saveSrcData(formData[key]);
								}else{
									pageProperty.setData.tree[keyArr[1]] = formData[key];
								}
								break;
						}
						
						break;
					case 'main':
					case 'child':
						if(typeof(pageProperty.setData.table)!="object"){
							pageProperty.setData.table = {};
						}
						if(typeof(pageProperty.setData.table[keyArr[0]]) != 'object'){
							pageProperty.setData.table[keyArr[0]] = {};
						}
						switch(keyArr[1]){
							case 'btns':
							case 'tableRowBtns':
								pageProperty.saveBtnsTreeData(formData,pageProperty.setData.table[keyArr[0]],keyArr[0]+'-'+keyArr[1]);
								break;
							// case 'fieldIs':
							// case 'fieldObj':
							case 'hide':
								pageProperty.setData.table[keyArr[0]][keyArr[1]] = formData[key].split(",");
								break;
							case 'fieldStr':
								pageProperty.saveTreeData(formData,pageProperty.setData.table[keyArr[0]],keyArr[0],"true");
								break;
							case 'ajax':
								if(typeof(pageProperty.setData.table[keyArr[0]][keyArr[1]]) != 'object'){
									pageProperty.setData.table[keyArr[0]][keyArr[1]] = {};
								}
								if(keyArr[2] == 'src'){
									var srcStr = formData[key];
									pageProperty.setData.table[keyArr[0]][keyArr[1]][keyArr[2]] = pageProperty.saveSrcData(srcStr);
								}else{
									pageProperty.setData.table[keyArr[0]][keyArr[1]][keyArr[2]] = formData[key];
								}
								break;
							case 'add':
							case 'edit':
							case 'delete':
							case 'multiAdd':
								if(typeof(pageProperty.setData.table[keyArr[0]][keyArr[1]]) != 'object'){
									pageProperty.setData.table[keyArr[0]][keyArr[1]] = {};
								}
								switch(keyArr[2]){
									// case 'fieldIs':
									// case 'fieldObj':
									case 'fieldStr':
										pageProperty.saveTreeData(formData,pageProperty.setData.table[keyArr[0]][keyArr[1]],keyArr[0]+'-'+keyArr[1],'{isColumn:false,type:"dialog"}');
										break;
									case 'ajax':
										if(typeof(pageProperty.setData.table[keyArr[0]][keyArr[1]][keyArr[2]]) != 'object'){
											pageProperty.setData.table[keyArr[0]][keyArr[1]][keyArr[2]] = {};
										}
										if([keyArr[3]] == 'src'){
											var srcStr = formData[key];
											pageProperty.setData.table[keyArr[0]][keyArr[1]][keyArr[2]][keyArr[3]] = pageProperty.saveSrcData(srcStr);
										}else{
											pageProperty.setData.table[keyArr[0]][keyArr[1]][keyArr[2]][keyArr[3]] = formData[key];
										}
										break;
									default:
										pageProperty.setData.table[keyArr[0]][keyArr[1]][keyArr[2]] = formData[key];
										break;
								}
								break;
							default:
								pageProperty.setData.table[keyArr[0]][keyArr[1]] = formData[key];
								break;
						}
						break;
				}
			}
			if(typeof(pageProperty.setData.saveData)=="object"){
				if(typeof(pageProperty.setData.saveData.ajax.src) != "string"){
					delete pageProperty.setData.saveData;
				}
			}
			if(typeof(pageProperty.setData.getValueAjax)=="object"){
				if(typeof(pageProperty.setData.getValueAjax.src) != "string"){
					delete pageProperty.setData.getValueAjax;
				}
			}
			// 判断包名
			var modalPackage = pageProperty.setData.package;
			var modalPackageArr = modalPackage.split('.');
			var modalPackageName = '';
			for(index=0;index<modalPackageArr.length-1;index++){
				modalPackageName += modalPackageArr[index] + '.';
			}
			modalPackageName = modalPackageName.substring(0,modalPackageName.length-1);
			var modalPackageNameobj = eval(modalPackageName);
			if(typeof(modalPackageNameobj) != 'object'){
				nsAlert('包名不存在','error');
				console.error(pageProperty.setData.package);
				return false;
			}
			var isSave = true; //判断表格是否填写 默认是 执行保存 表格为空时 不保存
			//保存页面表格
			if(pageProperty.$pageContainer.find("#page-table").length > 0){ 									//读取页面配置表格数据
				var tableData = baseDataTable.allTableData('page-table');
				//读取的表格数据
				pageProperty.saveFormOriginalData = $.extend(true,{},tableData);
				if(tableData.length == 0){
					isSave = false;
				}
				//处理页面配置表格数据 
				//删除空字符串
				//根据tree-fieldObj，tree-fieldStr，tree-fieldIs处理field
				//根据ajax-* 处理 数组中 对象包含的对象中的 ajax 处理
				var tableDataArr = [];
				for(var index=0;index<tableData.length;index++){
					delete tableData[index][""]; //删除key值是‘’的值
					// tableData[index] = pageProperty.dataValida(tableData[index]);
					for(var key in tableData[index]){
						if(tableData[index][key] == ''){
							delete tableData[index][key]; 					 //删除第一层的空字
							continue;
						}
						if(typeof(tableData[index][key]) == 'object'){
							for(var secKey in tableData[index][key]){
								if(tableData[index][key][secKey] == ''){
									delete tableData[index][key][secKey];	 //删除第二层的空字符
								}else{
									if(secKey.indexOf('tree-') > -1){
										pageProperty.saveTreeData(tableData[index][key],tableData[index][key],'tree','{isColumn:false,type:"dialog"}');
									}
									if(secKey.indexOf('ajax-') > -1){
										if(typeof(tableData[index][key].ajax) != 'object'){
											tableData[index][key].ajax = {};
										}
										tableData[index][key].ajax[secKey.substring(5)] = tableData[index][key][secKey];
										delete tableData[index][key][secKey];
									}
								}
							}
							if(typeof(tableData[index][key].ajax) == "object"){
								if(typeof(tableData[index][key].ajax.url) != "string"){
									delete tableData[index][key].ajax;
								}
							}
						}
						//根据tree-fieldObj，tree-fieldStr，tree-fieldIs处理field
						if(key.indexOf('tree-') > -1){
							var isColumn = 'true';
							if(tableData[index].type == 'form'){
								isColumn = 'false';
							}
							pageProperty.saveTreeData(tableData[index],tableData[index],'tree',isColumn);
						}
						//根据btns-fieldObj,btns-fieldStr或tableRowBtns-fieldObj,tableRowBtns-fieldStr处理表格上或表格行的按钮
						if(key == 'btns-fieldStr'  || key == 'tableRowBtns-fieldStr'){
							var keyArr = key.split('-');
							pageProperty.saveBtnsTreeData(tableData[index],tableData[index],keyArr[0]);
						}
						if(key == 'hide'){
							if($.isArray(tableData[index].hide)){

							}else{
								tableData[index].hide = tableData[index].hide.split(",");
							}
						}
					}
					if(!$.isEmptyObject(tableData[index])){
						//判断是一维数组还是二维数组
						if(pageProperty.configerData.table == "tableArrayTab"){
							tableDataArr.push([tableData[index]]);
						}else{
							tableDataArr.push(tableData[index]);
						}
						
					}
				}
				if(tableDataArr.length>0){
					if(pageProperty.configerData.table == "tableArrayTab"){
						pageProperty.setData.tab = tableDataArr;
					}else{
						pageProperty.setData.table = tableDataArr;
					}
					
				}
			}

			// console.log('/*******************保存的数据**********************/');
			// console.log(pageProperty.setData);
			var pageConfig = {
				config:JSON.stringify(pageProperty.setData)
			};
			// rowData.pageConfig = JSON.stringify(pageConfig);
			rowData.pageConfig = pageConfig;
			// 保存
			if(isSave){
				/*$.ajax({
					url:getRootPath() + "/templateMindPages/save",
					type:"POST",
					dataType:"json",
					data:rowData,
					success:function(data){
						// console.log("*****保存页面*****");
						// console.log(data);
						if(data.success){
							nsAlert("保存成功");
						}else{
							nsAlert("保存失败");
						}
					}
				});*/
				return rowData;
			}else{
				nsAlert("没有设置表格",'error');
				return false;
			}
		}
	}
}
// 保存模板数据及思维导图 把思维导图保存到模板
pageProperty.saveDataToTemplate = function(configDate, category){
	/*
	 * type:temp/tempXmmap 保存模板或保存模板和思维导图
	 * saveData:,保存的数据
	 */
	var saveData = pageProperty.getSaveData(configDate.saveData);
	if(saveData){
		if(configDate.type == 'tempXmmap'){
			saveData.pageConfig.xmmapJson = JSON.stringify(pageProperty.xmmapJson);
		}else{
			saveData.pageConfig.xmmapJson = '{}';
		}
		saveData.pageConfig = JSON.stringify(saveData.pageConfig);
		var saveConfig = {
			type:'data',
			data:saveData,
		};
		pageProperty.ajax.save(saveConfig, category);
	}
}
// 获得模板配置参数的默认值 并赋值 表单 表格
pageProperty.getDefaultData = function(rowData){
	/*
	$.ajax({
		url:getRootPath()+"/templateMindPages/" + rowData.id,
		type:"GET",
		dataType:"json",
		success:function(data){
			if(data.data.pageConfig){
				var pageConfigOriginal = JSON.parse(JSON.parse(data.data.pageConfig).config);
				// console.log(pageConfigOriginal);
				pageProperty.readySaveData = $.extend(true,{},pageConfigOriginal);
				var pageConfig = pageProperty.readySaveData;

				var pageConfigDefaultForm = {};
				//树目录模板 表格and表单 处理
				if(typeof(pageConfig.base) != 'undefined'){
					if(pageConfig.base.indexOf(",")>0){
						var arrChange = [];
							arrChange.push(pageProperty.setBaseFormArray('table','表格','page-formJson2',false));
							arrChange.push(pageProperty.setBaseFormArray('form','表单','page-formJson2',false));
					}else{
						if(pageConfig.base == "table"){
							arrChange = pageProperty.setBaseFormArray('table','表格','page-formJson2',false);
						}else{
							arrChange = pageProperty.setBaseFormArray('form','表单','page-formJson2',false);
						}
					}
					if(arrChange.length > 0){
						var formJson = {
							id:"page-formJson2",
							size:"standard",
							format:"standard",
							fillbg:false,
							form:arrChange
						}
						formPlane.formInit(formJson);
						// 新的产品配置页面隐藏字段
						if(pageProperty.configerData.isVO){
							pageProperty.hideByID();
						}
					}
					
				}

				for(var keyfirst in pageConfig){
					if(!$.isArray(pageConfig[keyfirst])){
						//读取表单
						if(typeof(pageConfig[keyfirst]) == 'string'){
							if(pageConfig[keyfirst].indexOf(",")>-1){
								pageConfigDefaultForm['base-' + keyfirst]  = pageConfig[keyfirst].split(",");
							}else{
								pageConfigDefaultForm['base-' + keyfirst] = pageConfig[keyfirst];
							}
						}
						if(typeof(pageConfig[keyfirst]) == 'object'){
							switch(keyfirst){
								case 'saveData':
									for(var keythird in pageConfig[keyfirst].ajax){
										if(keythird == 'src'){
											var formfun = pageConfig[keyfirst].ajax.src;
											pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst + '-' + keythird);
										}else{
											pageConfigDefaultForm[keyfirst + '-' + keythird] = pageConfig[keyfirst].ajax[keythird];
										}
									}
								break;
								case 'getValueAjax':
									for(var keyseconed in pageConfig[keyfirst]){
										if(keyseconed == 'src'){
											var formfun = pageConfig[keyfirst].src;
											pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst + '-' + keyseconed);
										}else{
											pageConfigDefaultForm[keyfirst + '-' + keyseconed] = pageConfig[keyfirst][keyseconed];
										}
									}
								break;
								case 'form':
									// for(var keyseconed in pageConfig[keyfirst]){
									// 	if(keyseconed == "field"){
									// 		var formfun = pageConfig[keyfirst][keyseconed];
									// 		pageProperty.readyTreeData(formfun,pageConfigDefaultForm,keyfirst);
									// 	}else{
									// 		pageConfigDefaultForm[keyfirst + '-' + keyseconed] = pageConfig[keyfirst][keyseconed];
									// 	}
									// }
									for(var childKeyFirst in pageConfig[keyfirst]){
										switch(childKeyFirst){
											case 'ajax':
											case 'add':
											case 'edit':
											case 'delete':
											case 'multiAdd':
												for(var childKeySeconed in pageConfig[keyfirst][childKeyFirst]){
													switch(childKeySeconed){
														case 'src':
															var formfun = pageConfig[keyfirst][childKeyFirst][childKeySeconed];
															pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst + '-' + childKeySeconed);
															break;
														case 'field':
															var formfun = pageConfig[keyfirst][childKeyFirst][childKeySeconed];
															pageProperty.readyTreeData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst);
															break;
														case 'ajax':
															for(var childKeyThird in  pageConfig[keyfirst][childKeyFirst][childKeySeconed]){
																if(childKeyThird == 'src'){
																	var formfun = pageConfig[keyfirst][childKeyFirst][childKeySeconed][childKeyThird];
																	pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst + '-' + childKeySeconed+'-'+childKeyThird);		
																}else{
																	pageConfigDefaultForm[keyfirst+'-'+childKeyFirst+'-'+childKeySeconed+'-'+childKeyThird] = pageConfig[keyfirst][childKeyFirst][childKeySeconed][childKeyThird];
																}
															}
															break;
														default:
															pageConfigDefaultForm[keyfirst+'-'+childKeyFirst+'-'+childKeySeconed] = pageConfig[keyfirst][childKeyFirst][childKeySeconed];
															break;
													}
												}
											 	break;
											case 'btns':
												var formfun = pageConfig[keyfirst][childKeyFirst];
												pageProperty.readyBtnsTreeData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst);
											 	break;
											case 'field':
												var formfun = pageConfig[keyfirst][childKeyFirst];
												pageProperty.readyTreeData(formfun,pageConfigDefaultForm,keyfirst);
												if(typeof(pageConfig.base) != 'undefined'){
													pageProperty.getHideSubdataByField(pageConfigDefaultForm[keyfirst+'-fieldStr'].value,'form-hide','page-formJson2');
												}else{
													pageProperty.getHideSubdataByField(pageConfigDefaultForm[keyfirst+'-fieldStr'].value,'form-hide','page-formJson');
												}
											 	break;
											default:
												pageConfigDefaultForm[keyfirst+'-'+childKeyFirst] = pageConfig[keyfirst][childKeyFirst];
											 	break;
										}
									}
								break;
								case 'table':
									switch(pageProperty.configerData.table){
										case 'tableObjectDouble':
											for(var childKeyFirst in pageConfig.table){
												for(var childKeySeconed in pageConfig.table[childKeyFirst]){
													switch(childKeySeconed){
														case 'ajax':
														case 'add':
														case 'edit':
														case 'delete':
														case 'multiAdd':
															for(var childKeyThird in pageConfig.table[childKeyFirst][childKeySeconed]){
																switch(childKeyThird){
																	case 'src':
																		var formfun = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird];
																		pageProperty.readySrcData(formfun,pageConfigDefaultForm,childKeyFirst + '-' + childKeySeconed+'-'+childKeyThird);
																		break;
																	case 'field':
																		var formfun = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird];
																		pageProperty.readyTreeData(formfun,pageConfigDefaultForm,childKeyFirst + '-' + childKeySeconed);
																		break;
																	case 'ajax':
																		for(var childKeyFour in  pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird]){
																			if(childKeyFour == 'src'){
																				var formfun = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird][childKeyFour];
																				pageProperty.readySrcData(formfun,pageConfigDefaultForm,childKeyFirst + '-' + childKeySeconed+'-'+childKeyThird+'-'+childKeyFour);		
																			}else{
																				pageConfigDefaultForm[childKeyFirst+'-'+childKeySeconed+'-'+childKeyThird+'-'+childKeyFour] = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird][childKeyFour];
																			}
																		}
																		break;
																	default:
																		pageConfigDefaultForm[childKeyFirst+'-'+childKeySeconed+'-'+childKeyThird] = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird]
																		break;
																}
															}
														 	break;
														case 'btns':
														case 'tableRowBtns':
															var formfun = pageConfig.table[childKeyFirst][childKeySeconed];
															pageProperty.readyBtnsTreeData(formfun,pageConfigDefaultForm,childKeyFirst+'-'+childKeySeconed);
														 	break;
														case 'field':
															var formfun = pageConfig.table[childKeyFirst][childKeySeconed];
															pageProperty.readyTreeData(formfun,pageConfigDefaultForm,childKeyFirst);
															if(typeof(pageConfig.base) != 'undefined'){
																pageProperty.getHideSubdataByField(pageConfigDefaultForm[childKeyFirst+'-fieldStr'].value,childKeyFirst+'-hide','page-formJson2');
															}else{
																pageProperty.getHideSubdataByField(pageConfigDefaultForm[childKeyFirst+'-fieldStr'].value,childKeyFirst+'-hide','page-formJson');
															}
														 	break;
														default:
															pageConfigDefaultForm[childKeyFirst+'-'+childKeySeconed] = pageConfig.table[childKeyFirst][childKeySeconed];
														 	break;
													}
												}
											}
											break;
										case 'tableHide':
										case 'tableObject':
											for(var childKeyFirst in pageConfig.table){
												switch(childKeyFirst){
													case 'ajax':
													case 'add':
													case 'edit':
													case 'delete':
													case 'multiAdd':
														for(var childKeySeconed in pageConfig.table[childKeyFirst]){
															switch(childKeySeconed){
																case 'src':
																	var formfun = pageConfig.table[childKeyFirst][childKeySeconed];
																	pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst + '-' + childKeySeconed);
																	break;
																case 'field':
																	var formfun = pageConfig.table[childKeyFirst][childKeySeconed];
																	pageProperty.readyTreeData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst);
																	break;
																case 'ajax':
																	for(var childKeyThird in  pageConfig.table[childKeyFirst][childKeySeconed]){
																		if(childKeyThird == 'src'){
																			var formfun = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird];
																			pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst + '-' + childKeySeconed+'-'+childKeyThird);		
																		}else{
																			pageConfigDefaultForm[keyfirst+'-'+childKeyFirst+'-'+childKeySeconed+'-'+childKeyThird] = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird];
																		}
																	}
																	break;
																default:
																	pageConfigDefaultForm[keyfirst+'-'+childKeyFirst+'-'+childKeySeconed] = pageConfig.table[childKeyFirst][childKeySeconed];
																	break;
															}
														}
													 	break;
													case 'btns':
													case 'tableRowBtns':
														var formfun = pageConfig.table[childKeyFirst];
														pageProperty.readyBtnsTreeData(formfun,pageConfigDefaultForm,'table'+'-'+childKeyFirst);
													 	break;
													case 'field':
														var formfun = pageConfig.table[childKeyFirst];
														pageProperty.readyTreeData(formfun,pageConfigDefaultForm,keyfirst);
														if(typeof(pageConfig.base) != 'undefined'){
															pageProperty.getHideSubdataByField(pageConfigDefaultForm[keyfirst+'-fieldStr'].value,keyfirst+'-hide','page-formJson2');
														}else{
															pageProperty.getHideSubdataByField(pageConfigDefaultForm[keyfirst+'-fieldStr'].value,keyfirst+'-hide','page-formJson');
														}
													 	break;
													default:
														pageConfigDefaultForm[keyfirst+'-'+childKeyFirst] = pageConfig.table[childKeyFirst];
													 	break;
												}
											}
											break;
									}
									break;
								case 'tree':
									for(var keyseconed in pageConfig[keyfirst]){
										switch(keyseconed){
											case 'btns':
												var formfun = pageConfig[keyfirst][keyseconed];
												pageProperty.readyBtnsTreeData(formfun,pageConfigDefaultForm,'tree'+'-'+keyseconed);
												break;
											case 'add':
											case 'edit':
											case 'delete':
											case 'multiAdd':
												for(var thirdKey in pageConfig[keyfirst][keyseconed]){
													if(thirdKey == 'field'){
														pageProperty.readyTreeData(pageConfig[keyfirst][keyseconed][thirdKey],pageConfigDefaultForm,[keyfirst]+'-'+[keyseconed]);
													}else{
														// pageConfigDefaultForm['directoryTreeNode-' + thirdKey] = pageConfig[keyfirst][keyseconed][thirdKey];
														pageConfigDefaultForm[keyfirst+'-'+keyseconed + '-' + thirdKey] = pageConfig[keyfirst][keyseconed][thirdKey];
													}
												}
												break;
											case 'src':
												pageProperty.readySrcData(pageConfig[keyfirst][keyseconed],pageConfigDefaultForm,keyfirst + '-' + keyseconed);
											 	break;
											default:
												pageConfigDefaultForm[keyfirst + '-' + keyseconed] = pageConfig[keyfirst][keyseconed];
												break;
										}
										// if(keyseconed == "add"){
										// 	for(var thirdKey in pageConfig[keyfirst][keyseconed]){
										// 		if(thirdKey == 'field'){
										// 			pageProperty.readyTreeData(pageConfig[keyfirst][keyseconed][thirdKey],pageConfigDefaultForm,'directoryTreeNode');
										// 		}else{
										// 			pageConfigDefaultForm['directoryTreeNode-' + thirdKey] = pageConfig[keyfirst][keyseconed][thirdKey];
										// 		}
										// 	}
										// }else{
										// 	if(keyseconed == "src"){
										// 		pageProperty.readySrcData(pageConfig[keyfirst][keyseconed],pageConfigDefaultForm,'directoryTree-' + keyseconed);
										// 	}else{
										// 		pageConfigDefaultForm['directoryTree-' + keyseconed] = pageConfig[keyfirst][keyseconed];
										// 	}
											
										// }
									}
								break;
							}
						}
						formPlane.fillValues(pageConfigDefaultForm,'page-formJson');
						if(pageProperty.$pageContainer.find("#page-formJson2").children().length>0){
							formPlane.fillValues(pageConfigDefaultForm,'page-formJson2'); //仅用于树表格表单
						}
					}else{
						// if(){}
						//读取表格
							
						var pageConfigDefaultArray = [];
						for(var index=0;index<pageConfig[keyfirst].length;index++){
							if(pageProperty.configerData.table == "tableArrayTab"){
								var pageConfigTable = pageConfig[keyfirst][index][0];
							}else{
								var pageConfigTable = pageConfig[keyfirst][index];
							}
							// pageProperty.readyTableDataObj(pageConfigTable);
							for(var key in pageConfigTable){
								switch(key){
									case 'btns':
									case 'tableRowBtns':
										pageProperty.readyBtnsTreeDataShowTab(pageConfigTable[key],pageConfigTable,key);
										break;
									case 'field':
										pageProperty.readyTreeDataShowTab(pageConfigTable[key],pageConfigTable,'tree');
										break;
									case 'add':
									case 'edit':
									case 'delete':
										for(var secKey in pageConfigTable[key]){
											switch(secKey){
												case 'field':
													pageProperty.readyTreeDataShowTab(pageConfigTable[key][secKey],pageConfigTable[key],'tree');
													break;
												case 'ajax':
													for(var thirdKey in pageConfigTable[key][secKey]){
														pageConfigTable[key]['ajax-'+thirdKey] = pageConfigTable[key][secKey][thirdKey];
													}
													break;
											}
										}
								}
							}
							pageConfigDefaultArray.push(pageConfigTable);
						}

						switch(pageProperty.configerData.table){
							case 'tableArrayTab':
								pageProperty.generateTable(false,pageConfigDefaultArray);
								break;
							case 'tableArray':
								pageProperty.generateTable(true,pageConfigDefaultArray);
								break;
						}
					}
				}
			}
			
		}
	});
	*/
	var ajaxConfig = {
		contentType : 'application/x-www-form-urlencoded',
		url:getRootPath()+"/templateMindPages/" + rowData.id,
		type:"GET",
		dataType:"json",
		contentType:'application/x-www-form-urlencoded',
	}
	NetStarUtils.ajax(ajaxConfig, function(data){
		if(data.data.pageConfig){
			var pageConfigOriginal = JSON.parse(JSON.parse(data.data.pageConfig).config);
			// console.log('/*************************读取的数据*****************************/');
			// console.log(pageConfigOriginal);
			/*************************读取的数据*****************************/
			pageProperty.readySaveData = $.extend(true,{},pageConfigOriginal);
			var pageConfig = pageProperty.readySaveData;

			var pageConfigDefaultForm = {};
			//树目录模板 表格and表单 处理
			if(typeof(pageConfig.base) != 'undefined'){
				if(pageConfig.base.indexOf(",")>0){
					var arrChange = [];
						arrChange.push(pageProperty.setBaseFormArray('table','表格','page-formJson2',false));
						arrChange.push(pageProperty.setBaseFormArray('form','表单','page-formJson2',false));
				}else{
					if(pageConfig.base == "table"){
						arrChange = pageProperty.setBaseFormArray('table','表格','page-formJson2',false);
					}else{
						arrChange = pageProperty.setBaseFormArray('form','表单','page-formJson2',false);
					}
				}
				if(arrChange.length > 0){
					var formJson = {
						id:"page-formJson2",
						size:"standard",
						format:"standard",
						fillbg:false,
						form:arrChange
					}
					formPlane.formInit(formJson);
					// 新的产品配置页面隐藏字段
					if(pageProperty.configerData.isVO){
						pageProperty.hideByID();
					}
				}
				
			}

			for(var keyfirst in pageConfig){
				if(!$.isArray(pageConfig[keyfirst])){
					//读取表单
					if(typeof(pageConfig[keyfirst]) == 'string'){
						if(pageConfig[keyfirst].indexOf(",")>-1){
							pageConfigDefaultForm['base-' + keyfirst]  = pageConfig[keyfirst].split(",");
						}else{
							pageConfigDefaultForm['base-' + keyfirst] = pageConfig[keyfirst];
						}
					}
					if(typeof(pageConfig[keyfirst]) == 'object'){
						switch(keyfirst){
							case 'saveData':
								for(var keythird in pageConfig[keyfirst].ajax){
									if(keythird == 'src'){
										var formfun = pageConfig[keyfirst].ajax.src;
										pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst + '-' + keythird);
									}else{
										pageConfigDefaultForm[keyfirst + '-' + keythird] = pageConfig[keyfirst].ajax[keythird];
									}
								}
							break;
							case 'getValueAjax':
								for(var keyseconed in pageConfig[keyfirst]){
									if(keyseconed == 'src'){
										var formfun = pageConfig[keyfirst].src;
										pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst + '-' + keyseconed);
									}else{
										pageConfigDefaultForm[keyfirst + '-' + keyseconed] = pageConfig[keyfirst][keyseconed];
									}
								}
							break;
							case 'form':
								// for(var keyseconed in pageConfig[keyfirst]){
								// 	if(keyseconed == "field"){
								// 		var formfun = pageConfig[keyfirst][keyseconed];
								// 		pageProperty.readyTreeData(formfun,pageConfigDefaultForm,keyfirst);
								// 	}else{
								// 		pageConfigDefaultForm[keyfirst + '-' + keyseconed] = pageConfig[keyfirst][keyseconed];
								// 	}
								// }
								for(var childKeyFirst in pageConfig[keyfirst]){
									switch(childKeyFirst){
										case 'ajax':
										case 'add':
										case 'edit':
										case 'delete':
										case 'multiAdd':
											for(var childKeySeconed in pageConfig[keyfirst][childKeyFirst]){
												switch(childKeySeconed){
													case 'src':
														var formfun = pageConfig[keyfirst][childKeyFirst][childKeySeconed];
														pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst + '-' + childKeySeconed);
														break;
													case 'field':
														var formfun = pageConfig[keyfirst][childKeyFirst][childKeySeconed];
														pageProperty.readyTreeData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst);
														break;
													case 'ajax':
														for(var childKeyThird in  pageConfig[keyfirst][childKeyFirst][childKeySeconed]){
															if(childKeyThird == 'src'){
																var formfun = pageConfig[keyfirst][childKeyFirst][childKeySeconed][childKeyThird];
																pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst + '-' + childKeySeconed+'-'+childKeyThird);		
															}else{
																pageConfigDefaultForm[keyfirst+'-'+childKeyFirst+'-'+childKeySeconed+'-'+childKeyThird] = pageConfig[keyfirst][childKeyFirst][childKeySeconed][childKeyThird];
															}
														}
														break;
													default:
														pageConfigDefaultForm[keyfirst+'-'+childKeyFirst+'-'+childKeySeconed] = pageConfig[keyfirst][childKeyFirst][childKeySeconed];
														break;
												}
											}
											 break;
										case 'btns':
											var formfun = pageConfig[keyfirst][childKeyFirst];
											pageProperty.readyBtnsTreeData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst);
											 break;
										case 'field':
											var formfun = pageConfig[keyfirst][childKeyFirst];
											pageProperty.readyTreeData(formfun,pageConfigDefaultForm,keyfirst);
											if(typeof(pageConfig.base) != 'undefined'){
												pageProperty.getHideSubdataByField(pageConfigDefaultForm[keyfirst+'-fieldStr'].value,'form-hide','page-formJson2');
											}else{
												pageProperty.getHideSubdataByField(pageConfigDefaultForm[keyfirst+'-fieldStr'].value,'form-hide','page-formJson');
											}
											 break;
										default:
											pageConfigDefaultForm[keyfirst+'-'+childKeyFirst] = pageConfig[keyfirst][childKeyFirst];
											 break;
									}
								}
							break;
							case 'table':
								switch(pageProperty.configerData.table){
									case 'tableObjectDouble':
										for(var childKeyFirst in pageConfig.table){
											for(var childKeySeconed in pageConfig.table[childKeyFirst]){
												switch(childKeySeconed){
													case 'ajax':
													case 'add':
													case 'edit':
													case 'delete':
													case 'multiAdd':
														for(var childKeyThird in pageConfig.table[childKeyFirst][childKeySeconed]){
															switch(childKeyThird){
																case 'src':
																	var formfun = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird];
																	pageProperty.readySrcData(formfun,pageConfigDefaultForm,childKeyFirst + '-' + childKeySeconed+'-'+childKeyThird);
																	break;
																case 'field':
																	var formfun = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird];
																	pageProperty.readyTreeData(formfun,pageConfigDefaultForm,childKeyFirst + '-' + childKeySeconed);
																	break;
																case 'ajax':
																	for(var childKeyFour in  pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird]){
																		if(childKeyFour == 'src'){
																			var formfun = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird][childKeyFour];
																			pageProperty.readySrcData(formfun,pageConfigDefaultForm,childKeyFirst + '-' + childKeySeconed+'-'+childKeyThird+'-'+childKeyFour);		
																		}else{
																			pageConfigDefaultForm[childKeyFirst+'-'+childKeySeconed+'-'+childKeyThird+'-'+childKeyFour] = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird][childKeyFour];
																		}
																	}
																	break;
																default:
																	pageConfigDefaultForm[childKeyFirst+'-'+childKeySeconed+'-'+childKeyThird] = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird]
																	break;
															}
														}
														 break;
													case 'btns':
													case 'tableRowBtns':
														var formfun = pageConfig.table[childKeyFirst][childKeySeconed];
														pageProperty.readyBtnsTreeData(formfun,pageConfigDefaultForm,childKeyFirst+'-'+childKeySeconed);
														 break;
													case 'field':
														var formfun = pageConfig.table[childKeyFirst][childKeySeconed];
														pageProperty.readyTreeData(formfun,pageConfigDefaultForm,childKeyFirst);
														if(typeof(pageConfig.base) != 'undefined'){
															pageProperty.getHideSubdataByField(pageConfigDefaultForm[childKeyFirst+'-fieldStr'].value,childKeyFirst+'-hide','page-formJson2');
														}else{
															pageProperty.getHideSubdataByField(pageConfigDefaultForm[childKeyFirst+'-fieldStr'].value,childKeyFirst+'-hide','page-formJson');
														}
														 break;
													default:
														pageConfigDefaultForm[childKeyFirst+'-'+childKeySeconed] = pageConfig.table[childKeyFirst][childKeySeconed];
														 break;
												}
											}
										}
										break;
									case 'tableHide':
									case 'tableObject':
										for(var childKeyFirst in pageConfig.table){
											switch(childKeyFirst){
												case 'ajax':
												case 'add':
												case 'edit':
												case 'delete':
												case 'multiAdd':
													for(var childKeySeconed in pageConfig.table[childKeyFirst]){
														switch(childKeySeconed){
															case 'src':
																var formfun = pageConfig.table[childKeyFirst][childKeySeconed];
																pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst + '-' + childKeySeconed);
																break;
															case 'field':
																var formfun = pageConfig.table[childKeyFirst][childKeySeconed];
																pageProperty.readyTreeData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst);
																break;
															case 'ajax':
																for(var childKeyThird in  pageConfig.table[childKeyFirst][childKeySeconed]){
																	if(childKeyThird == 'src'){
																		var formfun = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird];
																		pageProperty.readySrcData(formfun,pageConfigDefaultForm,keyfirst+'-'+childKeyFirst + '-' + childKeySeconed+'-'+childKeyThird);		
																	}else{
																		pageConfigDefaultForm[keyfirst+'-'+childKeyFirst+'-'+childKeySeconed+'-'+childKeyThird] = pageConfig.table[childKeyFirst][childKeySeconed][childKeyThird];
																	}
																}
																break;
															default:
																pageConfigDefaultForm[keyfirst+'-'+childKeyFirst+'-'+childKeySeconed] = pageConfig.table[childKeyFirst][childKeySeconed];
																break;
														}
													}
													 break;
												case 'btns':
												case 'tableRowBtns':
													var formfun = pageConfig.table[childKeyFirst];
													pageProperty.readyBtnsTreeData(formfun,pageConfigDefaultForm,'table'+'-'+childKeyFirst);
													 break;
												case 'field':
													var formfun = pageConfig.table[childKeyFirst];
													pageProperty.readyTreeData(formfun,pageConfigDefaultForm,keyfirst);
													if(typeof(pageConfig.base) != 'undefined'){
														pageProperty.getHideSubdataByField(pageConfigDefaultForm[keyfirst+'-fieldStr'].value,keyfirst+'-hide','page-formJson2');
													}else{
														pageProperty.getHideSubdataByField(pageConfigDefaultForm[keyfirst+'-fieldStr'].value,keyfirst+'-hide','page-formJson');
													}
													 break;
												default:
													pageConfigDefaultForm[keyfirst+'-'+childKeyFirst] = pageConfig.table[childKeyFirst];
													 break;
											}
										}
										break;
								}
								break;
							case 'tree':
								for(var keyseconed in pageConfig[keyfirst]){
									switch(keyseconed){
										case 'btns':
											var formfun = pageConfig[keyfirst][keyseconed];
											pageProperty.readyBtnsTreeData(formfun,pageConfigDefaultForm,'tree'+'-'+keyseconed);
											break;
										case 'add':
										case 'edit':
										case 'delete':
										case 'multiAdd':
											for(var thirdKey in pageConfig[keyfirst][keyseconed]){
												if(thirdKey == 'field'){
													pageProperty.readyTreeData(pageConfig[keyfirst][keyseconed][thirdKey],pageConfigDefaultForm,[keyfirst]+'-'+[keyseconed]);
												}else{
													// pageConfigDefaultForm['directoryTreeNode-' + thirdKey] = pageConfig[keyfirst][keyseconed][thirdKey];
													pageConfigDefaultForm[keyfirst+'-'+keyseconed + '-' + thirdKey] = pageConfig[keyfirst][keyseconed][thirdKey];
												}
											}
											break;
										case 'src':
											pageProperty.readySrcData(pageConfig[keyfirst][keyseconed],pageConfigDefaultForm,keyfirst + '-' + keyseconed);
											 break;
										default:
											pageConfigDefaultForm[keyfirst + '-' + keyseconed] = pageConfig[keyfirst][keyseconed];
											break;
									}
									// if(keyseconed == "add"){
									// 	for(var thirdKey in pageConfig[keyfirst][keyseconed]){
									// 		if(thirdKey == 'field'){
									// 			pageProperty.readyTreeData(pageConfig[keyfirst][keyseconed][thirdKey],pageConfigDefaultForm,'directoryTreeNode');
									// 		}else{
									// 			pageConfigDefaultForm['directoryTreeNode-' + thirdKey] = pageConfig[keyfirst][keyseconed][thirdKey];
									// 		}
									// 	}
									// }else{
									// 	if(keyseconed == "src"){
									// 		pageProperty.readySrcData(pageConfig[keyfirst][keyseconed],pageConfigDefaultForm,'directoryTree-' + keyseconed);
									// 	}else{
									// 		pageConfigDefaultForm['directoryTree-' + keyseconed] = pageConfig[keyfirst][keyseconed];
									// 	}
										
									// }
								}
							break;
						}
					}
					formPlane.fillValues(pageConfigDefaultForm,'page-formJson');
					if(pageProperty.$pageContainer.find("#page-formJson2").children().length>0){
						formPlane.fillValues(pageConfigDefaultForm,'page-formJson2'); //仅用于树表格表单
					}
				}else{
					// if(){}
					//读取表格
						
					var pageConfigDefaultArray = [];
					for(var index=0;index<pageConfig[keyfirst].length;index++){
						if(pageProperty.configerData.table == "tableArrayTab"){
							var pageConfigTable = pageConfig[keyfirst][index][0];
						}else{
							var pageConfigTable = pageConfig[keyfirst][index];
						}
						// pageProperty.readyTableDataObj(pageConfigTable);
						for(var key in pageConfigTable){
							switch(key){
								case 'btns':
								case 'tableRowBtns':
									pageProperty.readyBtnsTreeDataShowTab(pageConfigTable[key],pageConfigTable,key);
									break;
								case 'field':
									pageProperty.readyTreeDataShowTab(pageConfigTable[key],pageConfigTable,'tree');
									break;
								case 'add':
								case 'edit':
								case 'delete':
									for(var secKey in pageConfigTable[key]){
										switch(secKey){
											case 'field':
												pageProperty.readyTreeDataShowTab(pageConfigTable[key][secKey],pageConfigTable[key],'tree');
												break;
											case 'ajax':
												for(var thirdKey in pageConfigTable[key][secKey]){
													pageConfigTable[key]['ajax-'+thirdKey] = pageConfigTable[key][secKey][thirdKey];
												}
												break;
										}
									}
							}
						}
						pageConfigDefaultArray.push(pageConfigTable);
					}

					switch(pageProperty.configerData.table){
						case 'tableArrayTab':
							pageProperty.generateTable(false,pageConfigDefaultArray);
							break;
						case 'tableArray':
							pageProperty.generateTable(true,pageConfigDefaultArray);
							break;
					}
				}
			}
		}
	});
}
//保存树数据 通过树存储的3个字符串转化成 nsProject.getFieldsByState('','',true/false) 格式
pageProperty.saveTreeData = function(formData,saveObj,prefix,isTable){
	//formData要处理的对象
	//saveObj保存的对象
	//prefix树对象值得key的前缀
	//true/false表单或表格
	prefix = typeof(prefix) =="string" ? prefix+'-' : '';
	var fieldStr = formData[prefix+"fieldStr"];
	if(typeof(fieldStr) =="string"){
		var fieldObj = fieldStr.substring(0,fieldStr.lastIndexOf("."));
		fieldStr = fieldStr.substring(fieldStr.lastIndexOf(".")+1);
		// saveObj.field = 'nsProject.getFieldsByState('+fieldObj+',"'+fieldStr+'",'+formData[prefix+"fieldIs"]+')';
		saveObj.field = 'nsProject.getFieldsByState('+fieldObj+',"'+fieldStr+'",'+isTable+')';
	}
	// delete formData[prefix+"fieldObj"];
	delete formData[prefix+"fieldStr"];
	// delete formData[prefix+"fieldIs"];
}
//读取树的默认值 nsProject.getFieldsByState('','',true/false) 转化为括号内的3个字符串 在表单显示
pageProperty.readyTreeData = function(readyData,defaultObj,prefix){
	//readyData读取的数据
	//defaultObj显示的对象
	//prefix树id的前缀
	prefix = typeof(prefix) =="string" ? prefix+'-' : '';
	readyData = readyData.substring(readyData.indexOf('(')+1,readyData.length-1);
	var readyDataArr = readyData.split(',');
	// defaultObj[prefix + "fieldObj"] = {
	// 									value:readyDataArr[0],
	// 									text:readyDataArr[0]
	// 								};
	defaultObj[prefix + "fieldStr"] = {
										value:readyDataArr[0]+'.'+readyDataArr[1].substring(1,readyDataArr[1].length-1),
										text:readyDataArr[0]+'.'+readyDataArr[1].substring(1,readyDataArr[1].length-1)
									};
	// defaultObj[prefix + 'fieldIs'] = readyDataArr[2];
	if(defaultObj.field){
		delete defaultObj.field;
	}
}
//读取树的默认值 nsProject.getFieldsByState('','',true/false) 转化为括号内的3个字符串 在表格显示
pageProperty.readyTreeDataShowTab = function(readyData,defaultObj,prefix){
	//readyData读取的数据
	//defaultObj显示的对象
	//prefix树id的前缀
	prefix = typeof(prefix) =="string" ? prefix+'-' : '';
	readyData = readyData.substring(readyData.indexOf('(')+1,readyData.length-1);
	var readyDataArr = readyData.split(',');
	// defaultObj[prefix + "fieldObj"] = readyDataArr[0];
	defaultObj[prefix + "fieldStr"] = readyDataArr[0]+'.'+readyDataArr[1].substring(1,readyDataArr[1].length-1);
	// defaultObj[prefix + 'fieldIs'] = readyDataArr[2];
	if(defaultObj.field){
		delete defaultObj.field;
	}
}
//保存src
pageProperty.saveSrcData = function(sourceSrc){
	//formData要处理的数据
	//saveObj保存的对象
	var sourceSrcArr = sourceSrc.split(".");
	var src = sourceSrcArr[0] + '.' + sourceSrcArr[1] + '.controller.' + sourceSrcArr[2] + '.' + sourceSrcArr[3] + '.func.config.url';
	return src;
}
//读取src
pageProperty.readySrcData = function(readySrc,defaultObj,key){
	//readySrc读取的数据
	//defaultObj显示的对象
	//key显示id
	var readySrcArr = readySrc.split('.');
	var showSrc = readySrcArr[0] + '.' + readySrcArr[1] + '.' + readySrcArr[3] + '.' + readySrcArr[4];
	defaultObj[key] = {
						value:showSrc,
						text:showSrc
					};
}
//保存按钮树数据 同过树存储的2个字符串转化成 nsProject.getFuncArrayByFuncNames(nserp.goods,'save.storeGoods') 格式
pageProperty.saveBtnsTreeData = function(formData,saveObj,prefix){
	//formData要处理的对象
	//saveObj保存的对象
	//prefix树对象值得key的前缀
	
	var prefixF = typeof(prefix) =="string" ? prefix +'-' : '';
	// var fieldObj = formData[prefixF+"fieldObj"];
	var fieldStr = formData[prefixF+"fieldStr"];
	var fieldStrArr = fieldStr.split(',');  //多选时逐个判断
	fieldStr = '';
	for(var index=0;index<fieldStrArr.length;index++){
		var fieldStrArrStr = fieldStrArr[index];
		var fieldStrArrStrArr = fieldStrArrStr.split('.'); //每个按钮处理，只有最后两个字符串
		fieldStr += fieldStrArrStrArr[2] +'.'+ fieldStrArrStrArr[3]  + ',';
		var fieldObj = fieldStrArrStrArr[0] +'.'+ fieldStrArrStrArr[1];
	}
	fieldStr = fieldStr.substring(0,fieldStr.length-1);
	if(prefix.indexOf("-")>-1){
		var prefixArr = prefix.split("-");
		saveObj[prefixArr[prefixArr.length-1]] = 'nsProject.getFuncArrayByFuncNames('+fieldObj+',"'+fieldStr+'")';
	}else{
		saveObj[prefix] = 'nsProject.getFuncArrayByFuncNames('+fieldObj+',"'+fieldStr+'")';
	}
	
	// delete formData[prefixF+"fieldObj"];
	delete formData[prefixF+"fieldStr"];
}
//读取按钮树数据 nsProject.getFuncArrayByFuncNames(nserp.goods,'save.storeGoods,save.storeGoods') 转化为 nserp.goods和nserp.goods.save.storeGoods,* 在表单显示
pageProperty.readyBtnsTreeData = function(readyData,defaultObj,prefix){
	//readyData读取的数据
	//defaultObj显示的对象
	//prefix树id的前缀
	var prefixF = typeof(prefix) =="string" ? prefix+'-' : '';
	readyData = readyData.substring(readyData.indexOf('(')+1,readyData.length-1);
	readyData = readyData.replace(/\'/g,'');
	readyData = readyData.replace(/\"/g,'');
	var readyDataArr = readyData.split(',');
	var fieldStr = '';
	for(var index=1;index<readyDataArr.length;index++){
		fieldStr += readyDataArr[0] +'.'+ readyDataArr[index] + ',';
	}
	fieldStr = fieldStr.substring(0,fieldStr.length-1);
	defaultObj[prefixF+'fieldStr'] = {
		text:fieldStr,
		value:fieldStr
	};
	// defaultObj[prefixF+'fieldObj'] = {
	// 	text:readyDataArr[0],
	// 	value:readyDataArr[0]
	// };
	if(defaultObj[prefix]){
		delete defaultObj[prefix];
	}
}
//读取按钮树数据 nsProject.getFuncArrayByFuncNames(nserp.goods,'save.storeGoods,save.storeGoods') 转化为 nserp.goods和nserp.goods.save.storeGoods,*  在表格显示
pageProperty.readyBtnsTreeDataShowTab = function(readyData,defaultObj,prefix){
	//readyData读取的数据
	//defaultObj显示的对象
	//prefix树id的前缀
	var prefixF = typeof(prefix) =="string" ? prefix+'-' : '';
	readyData = readyData.substring(readyData.indexOf('(')+1,readyData.length-1);
	readyData = readyData.replace(/\'/g,'');
	readyData = readyData.replace(/\"/g,'');
	var readyDataArr = readyData.split(',');
	var fieldStr = '';
	for(var index=1;index<readyDataArr.length;index++){
		fieldStr += readyDataArr[0] +'.'+ readyDataArr[index] + ',';
	}
	fieldStr = fieldStr.substring(0,fieldStr.length-1);
	defaultObj[prefixF+'fieldStr'] = fieldStr;
	// defaultObj[prefixF+'fieldObj'] = readyDataArr[0];
	if(defaultObj[prefix]){
		delete defaultObj[prefix];
	}
}
pageProperty.getSelectTreeData = function(_sourceJson){
	var sourceJson = {};

	return {};
}
//生成树
pageProperty.getTreeObj = function(sourceData,produceData,cutOffObj){
	pageProperty.getSelectTreeDataBySourceData(sourceData);
	return;
}
pageProperty.getSelectTreeDataBySourceData = function(_sourceJson){
	//_sourceJson json/object 页面基础数据，来源于导入的思维导图 或者 Vo接口
	if(typeof(_sourceJson)!='object'){
		console.error('页面基础数据 sourceJson 不存在');
		return false;
	}
	//第一层对象不是实体，只是名字
	var _objSourceJson;
	var sourceKey = '';
	for(key in _sourceJson){
		sourceKey = key; 	//名字 
		_objSourceJson = _sourceJson[key];
	}

	//需要输出的数据key
	var outputObjKey = [{key:'state',level:1}, {key:'controller',level:2}];
	var sourceJson = {}; //需要处理的sourceJson 数据
	// 获取有效业务对象
	function setVaildObj(){
		for(var objName in _objSourceJson){
			var isOutput = true;
			if(nsMindjetToJS.getTags().businessFilterToSystem.indexOf(objName)>-1){
				isOutput = false;
			}
			if(typeof(_objSourceJson[objName])!='object'){
				isOutput = false;
			}
			if(isOutput){
				sourceJson[objName] = {};
			}
		}
	}
	setVaildObj();
	//获取业务对象中有效属性
	function setVaildAttr(){
		$.each(sourceJson, function(objName, _objData){
			//根据属处对象的名字生成有效属性的对象
			for(var keyI = 0; keyI < outputObjKey.length; keyI++){
				var sourceObjName = outputObjKey[keyI].key;
				var sourceObjLevel = outputObjKey[keyI].level;
				var sourceObjData = getJsonByLevel(_objSourceJson[objName][sourceObjName], sourceObjLevel);
				//是否存在有效属性的对象
				if(typeof(sourceObjData)=='object'){
					//有效属性的对象是否为空 不为空时进行赋值
					if($.isEmptyObject(sourceObjData)==false){
						_objData[sourceObjName] = sourceObjData;
					}
				}
			}
			//业务对象中没有效属性的对象 时 删除对象
			if($.isEmptyObject(_objData)){
				delete _objData;
			}
		});
	}
	setVaildAttr();
	// console.log(sourceJson);
	var treeObj = {
		state:{},
		controller:{}
	};
	// 获取下拉树对象 的 有效业务对象
	// treeType树的类型state/controller
	function setSelectTreeVaildObj(treeType,_sourceJson,_treeTypeObj,level){
		for(var objName in _sourceJson){
			if(level==2){ //第二层选择是否是stste/controller == treeType
				if(objName != treeType){
					continue;
				}else{
					var afterTreeObj = _treeTypeObj;
				}
			}else{
				_treeTypeObj[objName] = {};
				var afterTreeObj = _treeTypeObj[objName];
			}
			// 判断是否为对象 确定是否继续循环
			if(typeof(_sourceJson[objName])=="object"){
				// 判断是否为空对象 确定是否继续循环
				if($.isEmptyObject(_sourceJson[objName])==false){
					setSelectTreeVaildObj(treeType,_sourceJson[objName],afterTreeObj,level+1)
				}
			}
		}
	}
	treeObj.state[sourceKey] = {};
	treeObj.controller[sourceKey] = {};
	setSelectTreeVaildObj("state",sourceJson,treeObj.state[sourceKey],1);
	setSelectTreeVaildObj("controller",sourceJson,treeObj.controller[sourceKey],1);
	// console.log(treeObj);
	// 生成树节点open，name，fullName，parentName
	function getTreeNodes(sourceTreeObj,_treeArr,parentName,parentFullName){
		if(typeof(sourceTreeObj)!="object" || $.isEmptyObject(sourceTreeObj)){
			console.error("生成树对象不正确");
			return false;
		}
		var index = 0;
		for(var key in sourceTreeObj){
			_treeArr[index] = {};
			_treeArr[index].open = true;
			_treeArr[index].name = key;
			_treeArr[index].parent = parentName;
			// 判断parentFullName是否是第一个，第一个没有传值，所以不存在点
			if(typeof(parentFullName)=="string"){
				_treeArr[index].fullName = parentFullName + "." + key;
			}else{
				_treeArr[index].fullName = key;
			}
			// 判断是否为对象/或空对象 确定是否继续循环
			if(typeof(sourceTreeObj[key])=="object" && !$.isEmptyObject(sourceTreeObj[key])){
				_treeArr[index].children = [];
				getTreeNodes(sourceTreeObj[key],_treeArr[index].children,key,_treeArr[index].fullName);
			}
			index++ ;
		}
	}
	getTreeNodes(treeObj.state,pageProperty.zTreeNodes,-1);
	getTreeNodes(treeObj.controller,pageProperty.zTreeNodesUrl,-1);
	// console.log(pageProperty.zTreeNodes);
	// 获得对象的某一层
	function getJsonByLevel(json, levelnum){
		if(typeof(json)!="object"){
			console.error('json对象不能为空');
			return false;
		}
		var returnJson = {};
		//var currentLevel = 0;
		function setValues(_returnJson, _json, _level){
			if(_level<levelnum){
				for(key in _json){
					if(typeof(_json[key])=='object'){
						_returnJson[key] = {};
						setValues(_returnJson[key], _json[key], _level+1 );
					}else{
						_returnJson[key] = _json[key];
						console.error('缺少下一层数据');
					}
				}
			}else{
				for(key in _json){
					if(typeof(_json[key])=='object'){
						_returnJson[key] = {};
					}else{
						_returnJson[key] = _json[key];
					}
				}
			}
		}
		setValues(returnJson, json, 1);
		// console.log(returnJson);
		return returnJson;
	}
	return {stateTree:pageProperty.zTreeNodes,controllerTree:pageProperty.zTreeNodesUrl};
}
//保存表格对象
pageProperty.saveTableDataObj = function(){}
//读取表格对象
pageProperty.readyTableDataObj = function(sourceObj){
	//sourceObj表格对象{}
	for(var key in sourceObj){
		switch(key){
			case 'field':
				pageProperty.readyTreeDataShowTab(sourceObj[key],sourceObj,'tree');
				break;
			case 'add':
			case 'edit':
			case 'delete':
				for(var secKey in sourceObj[key]){
					switch(secKey){
						case 'field':
							pageProperty.readyTreeDataShowTab(sourceObj[key][secKey],sourceObj[key],'tree');
							break;
						case 'ajax':
							for(var thirdKey in sourceObj[key][secKey]){
								sourceObj[key]['ajax-'+thirdKey] = sourceObj[key][secKey][thirdKey];
							}
							break;
					}
				}
		}
	}
}
//基本对象表单配置
pageProperty.setBaseFormArray = function(id,label,containerId,isVolist){
	//id前缀
	//label前缀
	//isTable是否是表格 树
	//isVolist是否有volist
	isVolist = typeof(isVolist) == "boolean" ? isVolist : false;
	var isSrc = pageProperty.configerData.common == "tree" ? '' : 'required'; //src是否必填 目录树模板表格ajax非必填
	var isParams = id=='child'||id=='table'?false:true;
	var isHiddenTitle = id=='main'||id=='child'?true:false; // 是否隐藏title 主附表表格隐藏
	var isHiddenFormSource = id=='form'?false:true; // 是否显示formSource
	var formArr = [
		{
			element: 	'label',
			label: 		label+'配置',
			width: 	 	'100%',
		},{
			label: 		'标题',
			type: 		'text',
			id: 		id+'-title',
			column: 	6,
			hidden: 	isHiddenTitle,
		},{
			id: id+'-formSource',
			label:'表单模式',
			type:'select',
			textField:'name',
			valueField:'id',
			hidden:isHiddenFormSource,
			subdata:[
				{ id : 'halfScreen', name : '半屏模式' },
				{ id : 'fullScreen', name : '全屏模式' },
				{ id : 'inlineScreen', name : '行内模式' },
				{ id : 'staticData', name : '功能模式' },
			],
			column:6,
		},{
			label: 		'主键',
			type: 		'text',
			id: 		id+'-idField',
			rules: 		"required",
			column: 	6,
		},{
			label: 		'voList',
			type: 		'text',
			id: 		id+'-keyField',
			hidden: isVolist,
			column: 	6,
		},{
			label: 		'params',
			type: 		'textarea',
			id: 		id+'-params',
			hidden: isParams,
			column: 	6,
		},
		// {
		// 	label: 		'业务对象',
		// 	type: 		'tree-select',
		// 	id: 		id+'-fieldObj',
		// 	subdata: 	pageProperty.zTreeNodes,
		// 	fullnameField:"fullName",
		// 	textField: 	"name",
		// 	hidden:true,
		// 	valueField: "fullName",
		// 	column: 	6,
		// },
		{
			label: 		'状态类别',
			type: 		'tree-select',
			id: 		id+'-fieldStr',
			subdata: 	pageProperty.zTreeNodes,
			rules: "required",
			fullnameField:"fullName",
			textField: 	"name",
			valueField: "fullName",
			column: 	6,
			clickCallback: function(data){
				var fieldStr = data.id;
				pageProperty.getHideSubdataByField(fieldStr,id+'-hide',containerId);
			}
		},{
			label: 		'隐藏字段',
			type: 		'select2',
			id: 		id+'-hide',
			column: 	6,
			textField:   'name',
			valueField: 'id', 
			multiple:true,
			maximumItem:100,
			subdata: 	[],
		},
		// {
		// 	label: 		'style',
		// 	type: 		'radio',
		// 	id: 		id+'-fieldIs',
		// 	subdata: 	[
		// 		{
		// 			id:'true',
		// 			name:'true'
		// 		},{
		// 			id:'false',
		// 			name:'false'
		// 		}
		// 	],
		// 	value:isTable,
		// 	textField: 	"name",
		// 	valueField: "id",
		// 	hidden:true,
		// 	column: 	6,
		// },
		{
			element: 	'label',
			label: 		label+'ajax配置',
			width: 	 	'100%',
		},{
			label: 		'地址',
			// rules: 		"required",
			rules: 		isSrc,
			type: 		'tree-select',
			id: 		id+'-ajax-src',
			fullnameField:"fullName",
			subdata: 	pageProperty.zTreeNodesUrl,
			textField: 	"name",
			valueField: "fullName",
			column: 	6,
		},{
			label: 		'请求方式',
			type: 		'radio',
			id: 		id+'-ajax-type',
			subdata:[
				{
					id:'GET',
					name:'GET'
				},{
					id:'POST',
					name:'POST'
				}
			],
			value:'POST',
			textField: 	"name",
			valueField: "id",
			column: 	6,
		},{
			label: 		'数据源',
			type: 		'text',
			value: 'rows',
			id: 		id+'-ajax-dataSrc',
			column: 	6,
		},{
			label: 		'请求参',
			type: 		'textarea',
			id: 		id+'-ajax-data',
			value:"{}",
			column: 	6,
		},{
			label: 		'传值方式',
			type: 		'input-select',
			id: 		id+'-ajax-dataFormat',
			column: 	6,
			selectConfig:{
				textField: 'name',
				valueField:'id',
				subdata: [
					{
						id:'ids',
						name:'ids'
					},{
						id:'id',
						name:'id'
					},{
						id:'normal',
						name:'normal'
					},{
						id:'object',
						name:'object'
					},{
						id:'onlyChildIds',
						name:'onlyChildIds'
					},{
						id:'list',
						name:'list'
					}
				],
			},
		},{
			label: 		'dataLevel',
			type: 		'select',
			id: 		id+'-ajax-dataLevel',
			column: 	6,
			textField: 'name',
			valueField:'id',
			// value:'noone',
			subdata: [
				{
					id:'parent',
					name:'parent'
				},{
					id:'child',
					name:'child'
				},{
					id:'brothers',
					name:'brothers'
				},{
					id:'onlyChildIds',
					name:'onlyChildIds'
				},{
					id:'id',
					name:'id'
				},{
					id:'ids',
					name:'ids'
				},{
					id:'noone',
					name:'noone'
				}
			],
		},{
			element: 	'label',
			label: 		label+'按钮配置',
			width: 	 	'100%',
		},
		// {
		// 	label: 		'表格上按钮-业务对象',
		// 	type: 		'tree-select',
		// 	id: 		id+'-btns-fieldObj',
		// 	subdata: 	pageProperty.zTreeNodesUrl,
		// 	fullnameField:"fullName",
		// 	textField: 	"name",
		// 	valueField: "fullName",
		// 	column: 	6,
		// }
		// ,{
		// 	label: 		'表格行按钮-业务对象',
		// 	type: 		'tree-select',
		// 	id: 		id+'-tableRowBtns-fieldObj',
		// 	subdata: 	pageProperty.zTreeNodesUrl,
		// 	fullnameField:"fullName",
		// 	textField: 	"name",
		// 	valueField: "fullName",
		// 	column: 	6,
		// },
		{
			label: 		'外部按钮',
			type: 		'tree-select',
			id: 		id+'-btns-fieldStr',
			subdata: 	pageProperty.zTreeNodesUrl,
			isCheck:true,
			fullnameField:"fullName",
			textField: 	"name",
			valueField: "fullName",
			column: 	12,
		},{
			label: 		'行内按钮',
			type: 		'tree-select',
			id: 		id+'-tableRowBtns-fieldStr',
			subdata: 	pageProperty.zTreeNodesUrl,
			isCheck:true,
			fullnameField:"fullName",
			textField: 	"name",
			valueField: "fullName",
			column: 	12,
		}
	];
	;
	setBaseArr('add',formArr);
	setBaseArr('edit',formArr);
	setBaseArr('delete',formArr);
	if(label == '附表'){
		setBaseArr('multiAdd',formArr,false);
	}
	function setBaseArr(base,formArr,isChargeField){
		var typeDe = base == "delete" ? "confirm" : "dialog";
		isChargeField = typeof(isChargeField)=='boolean' ? isChargeField : true;
		var baseArr = [
			{
				element: 	'label',
				label: 		label+base+'配置',
				width: 	 	'100%',
			},{
				label: 		'标题',
				type: 		'text',
				id: 		id+'-'+base+'-title',
				column: 	4,
			},{
				label: 		'类型',
				type: 		'select',
				id: 		id+'-'+base+'-type',
				value: typeDe,
				subdata:[
					{
						value:'none',
						text:'none'
					},{
						value:'dialog',
						text:'dialog'
					},{
						value:'confirm',
						text:'confirm'
					},{
						value:'multi',
						text:'insertform'
					},{
						value:'component',
						text:'component'
					}
				],
				column: 	4,
			},{
				id: id+'-'+base+'-formSource',
				label:'表单模式',
				type:'select',
				textField:'name',
				valueField:'id',
				subdata:[
					{ id : 'halfScreen', name : '半屏模式' },
					{ id : 'fullScreen', name : '全屏模式' },
					{ id : 'inlineScreen', name : '行内模式' },
					{ id : 'staticData', name : '功能模式' },
				],
				column:4,
			},{
				label: 		'文本',
				type: 		'text',
				id: 		id+'-'+base+'-text',
				column: 	4,
			},{
				id:     	id+'-'+base+'-dialogBtnText',
				label: 		'dialogBtnText',
				type: 		'text',
				column: 	4,
			},{
				label: 		'servicename',
				type: 		'text',
				id: 		id+'-'+base+'-serviceComponent',
				column: 	4,
			},
			// {
			// 	label: 		'业务对象',
			// 	type: 		'tree-select',
			// 	id: 		id+'-'+base+'-fieldObj',
			// 	fullnameField:"fullName",
			// 	subdata: 	pageProperty.zTreeNodes,
			// 	textField: 	"name",
			// 	valueField: "fullName",
			// 	hidden:true,
			// 	column: 	6,
			// },
			{
				label: 		'状态类别',
				type: 		'tree-select',
				id: 		id+'-'+base+'-fieldStr',
				fullnameField:"fullName",
				subdata: 	pageProperty.zTreeNodes,
				textField: 	"name",
				valueField: "fullName",
				column: 	4,
			},{
				id:id+'-'+base+'-chargeField',
				label:'chargeField',
				type:'textarea',
				hidden:isChargeField,
				column: 	4,
			},
			// {
			// 	label: 		'style',
			// 	type: 		'radio',
			// 	id: 		id+'-'+base+'-fieldIs',
			// 	subdata: 	[
			// 		{
			// 			id:'true',
			// 			name:'true'
			// 		},{
			// 			id:'false',
			// 			name:'false'
			// 		}
			// 	],
			// 	hidden:true,
			// 	value:'false',
			// 	textField: 	"name",
			// 	valueField: "id",
			// 	column: 	6,
			// }
			// ,{
			// 	element: 	'label',
			// 	label: 		label+base+'ajax配置',
			// 	width: 	 	'100%',
			// },{
			// 	label: 		'地址',
			// 	type: 		'tree-select',
			// 	id: 		id+'-'+base+'-ajax-src',
			// 	fullnameField:"fullName",
			// 	subdata: 	pageProperty.zTreeNodesUrl,
			// 	textField: 	"name",
			// 	valueField: "fullName",
			// 	column: 	6,
			// },{
			// 	label: 		'type',
			// 	type: 		'radio',
			// 	id: 		id+'-'+base+'-ajax-type',
			// 	subdata:[
			// 		{
			// 			id:'GET',
			// 			name:'GET'
			// 		},{
			// 			id:'POST',
			// 			name:'POST'
			// 		}
			// 	],
			// 	textField: 	"name",
			// 	valueField: "id",
			// 	column: 	6,
			// },{
			// 	label: 		'dataSrc',
			// 	type: 		'text',
			// 	id: 		id+'-'+base+'-ajax-dataSrc',
			// 	column: 	6,
			// },{
			// 	label: 		'data',
			// 	type: 		'textarea',
			// 	id: 		id+'-'+base+'-ajax-data',
			// 	column: 	6,
			// }
			{
				label: 		'关闭弹框',
				type: 		'radio',
				id: 		id+'-'+base+'-isCloseWindow',
				column: 	4,
				textField: 'name',
				valueField:'id',
				value:'false',
				subdata: [
					{
						id:'true',
						name:'true'
					},{
						id:'false',
						name:'false'
					}
				],
			},
		];
		for(var index=0;index<baseArr.length;index++){
			formArr.push(baseArr[index]);
		}
	}
	return formArr;
}
//设置add edit delete 的数组
pageProperty.setBaseArr = function(id,base,label){
	//id前缀
	//label前缀
	//base:add/edit/delete
	var typeDe = base == "delete" ? "confirm" : "dialog";
	var baseArr = [
			{
				element: 	'label',
				label: 		label+'配置',
				width: 	 	'100%',
			},{
				label: 		'标题',
				type: 		'text',
				id: 		id+'-'+base+'-title',
				column: 	4,
			},{
				label: 		'类型',
				type: 		'select',
				id: 		id+'-'+base+'-type',
				value: typeDe,
				subdata:[
					{
						value:'none',
						text:'none'
					},{
						value:'dialog',
						text:'dialog'
					},{
						value:'confirm',
						text:'confirm'
					},{
						value:'multi',
						text:'insertform'
					},{
						value:'component',
						text:'component'
					}
				],
				column: 	4,
			},{
				id: id+'-'+base+'-formSource',
				label:'表单模式',
				type:'select',
				textField:'name',
				valueField:'id',
				subdata:[
					{ id : 'halfScreen', name : '半屏模式' },
					{ id : 'fullScreen', name : '全屏模式' },
					{ id : 'inlineScreen', name : '行内模式' },
					{ id : 'staticData', name : '功能模式' },
				],
				column:4,
			},{
				label: 		'弹框宽度',
				id: 		id+'-'+base+'-width',
				type: 		'input-select',
				column: 	4,
				selectConfig:{
					textField:			'text',
					valueField:			'id',
					subdata:			[
						{
							text:'s',
							id:'s'
						},{
							text:'m',
							id:'m'
						},{
							text:'b',
							id:'b'
						},{
							text:'f',
							id:'f'
						}
					]
				}
			},{
				label: 		'文本',
				type: 		'text',
				id: 		id+'-'+base+'-text',
				column: 	4,
			},{
				label: 		'servicename',
				type: 		'text',
				id: 		id+'-'+base+'-serviceComponent',
				column: 	4,
			},
			// {
			// 	label: 		'业务对象',
			// 	type: 		'tree-select',
			// 	id: 		id+'-'+base+'-fieldObj',
			// 	fullnameField:"fullName",
			// 	subdata: 	pageProperty.zTreeNodes,
			// 	textField: 	"name",
			// 	valueField: "fullName",
			// 	column: 	4,
			// },
			{
				label: 		'状态类别',
				type: 		'tree-select',
				id: 		id+'-'+base+'-fieldStr',
				fullnameField:"fullName",
				subdata: 	pageProperty.zTreeNodes,
				textField: 	"name",
				valueField: "fullName",
				column: 	4,
			},
			// {
			// 	label: 		'style',
			// 	type: 		'radio',
			// 	id: 		id+'-'+base+'-fieldIs',
			// 	subdata: 	[
			// 		{
			// 			id:'true',
			// 			name:'true'
			// 		},{
			// 			id:'false',
			// 			name:'false'
			// 		}
			// 	],
			// 	hidden:true,
			// 	value:'false',
			// 	textField: 	"name",
			// 	valueField: "id",
			// 	column: 	4,
			// }
			{
				label: 		'关闭弹框',
				type: 		'radio',
				id: 		id+'-'+base+'-isCloseWindow',
				column: 	4,
				textField: 'name',
				valueField:'id',
				value:'false',
				subdata: [
					{
						id:'true',
						name:'true'
					},{
						id:'false',
						name:'false'
					}
				],
			},
		];
	return baseArr;
}
//数据验证
pageProperty.dataValida = function(data){
	var validaData = {};
	//生成对象
	for(var key in data){
		if(data[key] == ''){
			delete data[key];
			continue;
		}
		var keyArr = key.split("-");
		function objfun(index,obj){
			index++;
			if(index<keyArr.length-1){
				if(typeof(obj[keyArr[index]]) != "object"){
					obj[keyArr[index]] = {};
				}
				objfun(index,obj[keyArr[index]]);
			}else{
				obj[keyArr[index]] = data[key];
			}
		}
		objfun(-1,validaData);
	}
	//逐层验证
	function isDeletefun(obj){
		for(var key in obj){
			if(typeof(obj[key]) == 'object'){
				if(key=='ajax'){
					if(typeof(obj[key].src) == "undefined"){
						delete obj[key];
						continue;
					}
				}else{
				}
				isDeletefun(obj[key]);
			}
		}
	}
	isDeletefun(validaData);
	//生成对象
	var returnObj = {};
	function addObjfun(obj,str){
		str = typeof(str) == 'string' ? str:'';
		for(var key in obj){
			if(typeof(obj[key]) == "object"){
				addObjfun(obj[key],str+key+'-');
			}else{
				returnObj[str+key] = obj[key];
			}
		}
	}
	addObjfun(validaData);
	return returnObj;
	// console.log(validaData);
	// console.log(returnObj);
	// console.log(data);
}
// 显示页面
pageProperty.init = function(pageParams, callbackFunc, isNeedPageParams){
	var rootPathStr = getRootPath();
	// 默认true 新旧编辑器转换时false  isNeedPageParams:是否设置pageParams并且根据它删除getValueAjax
	isNeedPageParams = typeof(isNeedPageParams) == "boolean" ? isNeedPageParams : true;
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
		pageProperty.vosByPackage[pageParams.pageConfig.package] = {};
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
				pageProperty.vosByPackage[pageParams.pageConfig.package][_voName] = pageData.runObj[pageData.runObj.length-1];
			}
		}else{
			if($.isArray(voSourceJSON)){
				var xmmapJson = {};
				for(var i=0; i<voSourceJSON.length; i++){
					var jsonData = voSourceJSON[i];
					if(i === 0){
						for(var key in jsonData){
							voName = key;
						}
						xmmapJson = jsonData;
					}else{
						for(var key in jsonData){
							for(var voKey in jsonData[key]){
								xmmapJson[voName][voKey] = jsonData[key][voKey];
							}
						}
					}
				}
				voSourceJSON = xmmapJson;
			}else{
				for(key in voSourceJSON){
					//返回结果中的第一层的字符串就是名字
					voName = key;
				}
			}
			pageData.voName = voName;
			//原始的VO（思维导图）生成的JSON
			pageData.sourceJson = $.extend(true,{},voSourceJSON[voName]);
			//执行过的VO（思维导图）生成的JSON
			pageData.runObj = eval('{'+voName+'=nsProject.init(voSourceJSON[voName])'+'}');
			pageProperty.vosByPackage[pageParams.pageConfig.package][voName] = pageData.runObj;
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

		if(isNeedPageParams){
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
		var _sourcePageConfig = {};
		var isPageConfig = true;
		for(var i=0; i<pageParams.pageConfigList.length; i++){
			if(pageParams.pageConfigList[i] === ''){
				// 表示该层级没有存数据
				continue;
			}
			var _config = JSON.parse(pageParams.pageConfigList[i]).config;
			isPageConfig = typeof(_config.isPageConfig) == "boolean" ? _config.isPageConfig : true;
			if(isPageConfig){
				_sourcePageConfig = _config;
				if($.isArray(pageParams.serverConfigList) && pageParams.serverConfigList[i] > 0){
					_config = JSON.parse(pageParams.serverConfigList[i]);
					pageConfigList.push(_config);
				}
			}else{
				pageConfigList.push(_config);
			}
			if(entityNames.length == 0){
				entityNames = _config.entityNameArr ? _config.entityNameArr : [];
			}
		}
		// 获取思维导图
		// 通过detiles获取vo/method
		var xmmapJsons = [];
		var voMapObj = {};
		var mindMapDetails = pageParams.mindMapDetails;
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
			pageParams.pageConfig = pageProperty.getPageConfigBySetConfig(setConfig, voMapObj);
		}else{
			pageParams.pageConfig = _sourcePageConfig;
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
		serverConfigList : resParams.serverConfigList,
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
	if(authorization == false && typeof(NetstarHomePage) == "object"){
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
/**************************************************************取消选中行*******************************************************************/
//删除生成的表单和表格
pageProperty.uncheckInline = function(){
	var $pageFormJson = pageProperty.$pageContainer.find("#page-formJson");
	if(typeof($pageFormJson.children()) == "object"){
		$pageFormJson.children().remove();
	}
	var $pageTableBody = pageProperty.$pageContainer.find("#page-table-body");
	if(typeof($pageTableBody.children()) == "object"){
		$pageTableBody.children().remove();
	}
	var $pageFormJson2 = pageProperty.$pageContainer.find("#page-formJson2");
	if($pageFormJson2.length > 0){
		$pageFormJson2.remove();
	}
	pageProperty.$pageContainer.find("#page-formJson-btns").addClass("hide");
}
/****************点击保存*****************/
//获得表单表格数据 并处理表单表格数据 设置页面 （通用属性，表单表格属性，增删改的属性）
/**********************************************************配置main页面*******************************************************************/
pageProperty.configurationPage = function(category){
	var $pageContainer = $('body container').not('.hidden');
	pageProperty.$pageContainer = $pageContainer;
	pageProperty.$pageContainer.append(pageProperty.htmlData.searchAndPage);
	pageProperty.$pageContainer.append(pageProperty.htmlData.configPanel);
	pageProperty.rowDataSave = {};
	var editBtns = 
	[
		{
			text: 		'窗体',
			handler: 	function(){
				pageProperty.$pageContainer.find("#client-table").parents(".main-panel").removeClass("hide");
				pageProperty.$pageContainer.find("#page-formJson-btns").addClass("hide");
				pageProperty.$pageContainer.find("#page-formJson").children().remove();
				pageProperty.$pageContainer.find("#page-table-body").children().remove();
				var $pageFormJson2 = pageProperty.$pageContainer.find("#page-formJson2");
				if($pageFormJson2.length > 0){
					$pageFormJson2.remove();
				}
				pageProperty.$pageContainer.find("#form-select").removeClass("hide");
				pageProperty.pageGeneratingTable(category);
			}
		},{
			text: 		'保存',
			handler: 	function(){
				if(pageProperty.isProduct){
					pagePropertyProduct.saveData();
				}else{
					if(pageProperty.configerData.isVO){
						pagePropertyVo.saveData();
					}else{
						var configData = {
							type:'temp',
							saveData:pageProperty.rowDataSave,
						}
						pageProperty.saveDataToTemplate(configData, category);
					}
				}
			}
		},{
			text: 		'保存2',
			handler: 	function(){
				if(pageProperty.isProduct){
					pagePropertyProduct.saveData();
				}else{
					if(pageProperty.configerData.isVO){
						pagePropertyVo.saveData(true);
					}else{
						var configData = {
							type:'tempXmmap',
							saveData:pageProperty.rowDataSave,
						}
						pageProperty.saveDataToTemplate(configData, category);
					}
				}
			}
		},
		{
			text: 		'生成页面',
			handler: 	function(){
				var rowData = pageProperty.rowDataSave;
				if(rowData){
					// pageProperty.saveXmlJsonByEditor(rowData.mindId);
					pageProperty.ajax.generatePages(rowData);
				}
			}
		}
	]
	nsButton.initBtnsByContainerID('page-formJson-btns',editBtns);
	pageProperty.$pageContainer.find("#page-formJson-btns").addClass("hide");
	pageProperty.pageGeneratingTable(category);
	var formJson = 
		{
			id:  		"form-select",
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true,
			form:
			[
				{
					id: 				"mindId",
					label: 				"思维导图",
					type: 				"select2",
					textField: 			'name',
					valueField: 		'id', 
					url: 				getRootPath()+'/templateMindMaps/getList',
					dataSrc: 			"rows",
					data: 				{},
					method: 			'GET',
					column: 			4,
					changeHandler: 		function(id,value){
											// var formData = nsForm.getFormJSON("form-select");
											pageProperty.pageGeneratingTable(category)
										}
				},{
					id: 				"pageId",
					label: 				"模板",
					type: 				"select2",
					textField: 			'name',
					valueField: 		'id', 
					url: 				getRootPath()+'/templatePages/getList',
					dataSrc: 			"rows",
					data: 				{},
					method: 			'GET',
					column: 			4,
					changeHandler: 		function(id,value){
											// var formData = nsForm.getFormJSON("form-select");
											pageProperty.pageGeneratingTable(category)
										}
				},{
					id: 				"moduleId",
					label: 				"模块",
					type: 				"select2",
					textField: 			'moduleName',
					valueField: 		'id', 
					url: 				getRootPath()+'/modules/getList',
					dataSrc: 			"rows",
					data: 				{},
					method: 			'POST',
					contentType : 'application/json',
					column: 			4,
					changeHandler: 		function(id,value){
											// var formData = nsForm.getFormJSON("form-select");
											pageProperty.pageGeneratingTable(category)
										}
				}
			]
		};
	formPlane.formInit(formJson);
}
pageProperty.htmlData = {
	searchAndPage:'<div class="row form-content"><div class="col-sm-12" id="form-select"></div><div class="col-sm-12 main-panel"><div class="panel panel-default"><div class="panel-body" id="modal-show-table"></div></div></div></div>',
	configPanel:'<div class="row" id="modal"><div class="col-sm-12" id="page-formJson-btns"></div><div class="col-sm-12" id="page-formJson"></div><div class="col-sm-12 main-panel"><div class="panel panel-default"><div class="panel-body" id="page-table-body"></div></div></div></div>',
}
pageProperty.pageGeneratingTable = function(category){
	// category 是否是分类获取页面列表 默认不是
	var isCategory = typeof(category)!="undefined"?true:false;
	// 生成 mindId，pageId的表格显示字典
	var mindIdDict = {};
	var pageIdDict = {};
	var moduleIdDict = {};
	var executionOrder = 0;
	var mindSubdata = [];
	var editPageConfigArr = [
		{
			id:"id",
			label:"id",
			type:"hidden",
		},{
			id:"name",
			label:"名称",
			type:"text",
			rules:'required',
		},
		// {
		// 	id:"fileName",
		// 	label:"生成文件名称",
		// 	type:"text",
		// 	rules:'required',
		// 	// placeholder:'小写纯英文',
		// },
		{
			id:"mindId",
			label:"思维导图",
			type:"select2",
			textField:'name',
			valueField:'id', 
			rules:'required',
			isServiceMode:false,
			requestParams:'search',
			multiple:true,
			// url:getRootPath()+'/templateMindMaps/getList',
			// dataSrc:"rows",
			// data:{},
			// method:'GET',
		},{
			id:"pageId",
			label:"模板",
			type:"select",
			textField:'name',
			valueField:'id', 
			rules:'required',
			url:getRootPath()+'/templatePages/getList',
			dataSrc:"rows",
			data:{},
			method:'GET',
		},{
			id:"moduleId",
			label:"模块",
			type:"select2",
			textField:'moduleName',
			valueField:'id', 
			url:getRootPath()+'/modules/getList',
			dataSrc:"rows",
			data:{},
			contentType : 'application/json',
			method:'POST',
		}
	];
	var ajaxConfig = {
		url:getRootPath()+'/templateMindMaps/getList',
		type:"get",
		dataType:"json",
		contentType:'application/x-www-form-urlencoded',
	}
	NetStarUtils.ajax(ajaxConfig, function(data){
		if(data.success){
			executionOrder++;
			for(var index=0;index<data.rows.length;index++){
				mindIdDict[data.rows[index].id] = data.rows[index].name;
			}
			var subdataArr = [];
			var subdataSour = data.rows;
			for(var i=0; i<subdataSour.length; i++){
				var remark = subdataSour[i].remark;
				var remarkName = subdataSour[i].name;
				remarkName +=  ' ' +remark.split(' ')[0];
				subdataArr.push({
					id : subdataSour[i].id,
					name : remarkName,
				})
			}
			editPageConfigArr[2].subdata = subdataArr;
			mindSubdata = subdataArr;
			if(executionOrder == 3){
				showTablefun();
			}
		}
	})
	/*
	$.ajax({
		url:getRootPath()+'/templateMindMaps/getList',
		type:"get",
		dataType:"json",
		success:function(data){
			if(data.success){
				executionOrder++;
				for(var index=0;index<data.rows.length;index++){
					mindIdDict[data.rows[index].id] = data.rows[index].name;
				}
				var subdataArr = [];
				var subdataSour = data.rows;
				for(var i=0; i<subdataSour.length; i++){
					var remark = subdataSour[i].remark;
					var remarkName = subdataSour[i].name;
					remarkName +=  ' ' +remark.split(' ')[0];
					subdataArr.push({
						id : subdataSour[i].id,
						name : remarkName,
					})
				}
				editPageConfigArr[2].subdata = subdataArr;
				if(executionOrder == 2){
					showTablefun();
				}
			}
		}
	})
	*/
	var ajaxConfig2 = {
		url:getRootPath()+'/templatePages/getList',
		type:"get",
		dataType:"json",
		contentType:'application/x-www-form-urlencoded',
	}
	NetStarUtils.ajax(ajaxConfig2, function(data){
		if(data.success){
			executionOrder++;
			for(var index=0;index<data.rows.length;index++){
				pageIdDict[data.rows[index].id] = data.rows[index].name;
			}
			if(executionOrder == 3){
				showTablefun();
			}
		}
	});
	var ajaxConfig3 = {
		url:getRootPath()+'/modules/getList',
		type:"get",
		dataType:"json",
		contentType:'application/json',
	}
	NetStarUtils.ajax(ajaxConfig3, function(data){
		if(data.success){
			executionOrder++;
			for(var index=0;index<data.rows.length;index++){
				moduleIdDict[data.rows[index].id] = data.rows[index].moduleName;
			}
			if(executionOrder == 3){
				showTablefun();
			}
		}
	});
	/*
	$.ajax({
		url:getRootPath()+'/templatePages/getList',
		type:"get",
		dataType:"json",
		success:function(data){
			if(data.success){
				executionOrder++;
				for(var index=0;index<data.rows.length;index++){
					pageIdDict[data.rows[index].id] = data.rows[index].name;
				}
				if(executionOrder == 2){
					showTablefun();
				}
			}
		}
	})
	*/
	var columnBtnsObj = {
		edit : {
			name : '编辑',
			handler : function(data){
				var rowData = data.rowData;
				if(rowData.fileName.indexOf('.')>0){
					rowData.fileName = rowData.fileName.substring(0,rowData.fileName.indexOf('.'));
				}
				rowData.fileName = rowData.fileName
				var formArr = $.extend(true, [], editPageConfigArr);
				for(var formI=0; formI<formArr.length; formI++){
					if(typeof(rowData[formArr[formI].id])!="undefined"){
						formArr[formI].value = rowData[formArr[formI].id];
					}
				}
				var configS = {
					id: 	"plane-page",
					title: 	"编辑",
					size: 	"s",
					form: 	formArr,
					btns:[
						{
							text: 		'确认',
							handler: 	function(){
								var dialogData = nsdialog.getFormJson("plane-page");
								if(dialogData){
									pageProperty.ajax.edit(dialogData, category);
								}
							},
						}
					]
				}
				nsdialog.initShow(configS);
			}
		},
		dialogView : {
			name : '弹框预览模式',
			handler : function(data){
				var url = getRootPath() + "/templateMindPages/pageConfig/" + data.rowData.id;
				nsFrame.popPage(url);
			}
		},
		NewWindowView : {
			name : '新窗口预览',
			handler : function(data){
				var url = getRootPath() + "/templateMindPages/pageConfig/" + data.rowData.id;
				window.open(url,'_blank');
			}
		},
		tabView : {
			name : 'tab预览模式',
			handler : function(data){
				var url = "/templateMindPages/pageConfig/" + data.rowData.id;
				NetstarUI.labelpageVm.loadPage(url, data.rowData.name, true, {}, false);
			}
		},
		refresh : {
			name : '刷新',
			handler : function(dataJson){
				pageProperty.ajax.refresh(dataJson.rowData.id, category);
			}
		},
		form : {
			name : '表单',
			handler : function(dataJson){
				pageProperty.uncheckInline();
				pageProperty.$pageContainer.find("#form-select").addClass("hide");
				pageProperty.$pageContainer.find("#page-formJson-btns").removeClass("hide");
				pageProperty.$pageContainer.find("#client-table").parents(".main-panel").addClass("hide");
				tableDataName = '';
				// 删除文件名末尾的jsp
				if(dataJson.rowData.fileName){
					var fileNameArr = dataJson.rowData.fileName.split('.');
					dataJson.rowData.fileName = fileNameArr[0];
				}
				pageProperty.rowDataSave = $.extend(true,{},dataJson.rowData);
				pageProperty.selectLine(pageProperty.rowDataSave);
			}
		},
		code : {
			name : '代码',
			handler : function(dataJson){
				pageProperty.saveCodeMethod(dataJson.rowData, category);
			},
		},
		config : {
			name : '配置',
			handler : function(dataJson){
				pageProperty.uncheckInline();
				pageProperty.$pageContainer.find("#form-select").addClass("hide");
				pageProperty.$pageContainer.find("#page-formJson-btns").removeClass("hide");
				pageProperty.$pageContainer.find("#client-table").parents(".main-panel").addClass("hide");
				tableDataName = '';
				// 删除文件名末尾的jsp
				if(dataJson.rowData.fileName){
					var fileNameArr = dataJson.rowData.fileName.split('.');
					dataJson.rowData.fileName = fileNameArr[0];
				}
				pageProperty.rowDataSave = $.extend(true,{},dataJson.rowData);
				pageProperty.selectLine(pageProperty.rowDataSave,true);
			},
		},
		delete : {
			name : '删除',
			handler : function(data){
				var rowData = data.rowData;
				nsConfirm("确认要删除吗？",function(isdelete){
					if(isdelete){
						pageProperty.ajax.delete(rowData, category);
					}
				},"success");
			}
		},
		imports : {
			name : '替换表单',
			handler : function(data){
				var rowData = data.rowData;
				var configS = {
					id: 	"plane-page",
					title: 	"新增",
					size: 	"m",
					form:   [
						{
							type:'hidden',
							id:'id',
						},{
							html: '<div>'
									+ '<input id="plane-page-imports" accept="" type="file" class="pt-upload-control">'
								+ '</div>'
						}
					],
					btns:[
						{
							text: 		'确认',
							handler: 	function(){
								var $upload = $('#plane-page-imports');
								var files = $upload.prop('files');
								if(files.length === 0){
									return;
								}
								var formData = new FormData();
								for (var i = 0; i < files.length; i++) {
									var item = files[i];
									formData.append('pageFiles', item, item.name);
								}
								pageProperty.ajax.imports(formData, rowData.id);
							},
						}
					]
				}
				nsdialog.initShow(configS);
			}
		},
		dataSwitch : {
			name : '数据转换',
			handler : function(data){
				pageProperty.switchEditorData(data.rowData);
			}
		},
	}
	var columnBtnsCategory = {
		common : ['edit','dialogView','NewWindowView','refresh','form','code','config','delete'],
		category : ['edit','tabView','refresh','form','code','config','delete','imports','dataSwitch'],
	}
	function showTablefun(){
		pageProperty.mindIdDict = mindIdDict;
		var dataConfig = {
			tableID:				"client-table",
			dataSource: 			[],	
		}
		var columnBtnsType = columnBtnsCategory.common;
		if(isCategory){
			columnBtnsType = columnBtnsCategory.category;
		}
		var columnConfigBtns = [];
		for(var btnI=0;btnI<columnBtnsType.length;btnI++){
			var btnObj = columnBtnsObj[columnBtnsType[btnI]];
			var btnObjCon = {};
			btnObjCon[btnObj.name] = btnObj.handler;
			columnConfigBtns.push(btnObjCon);
		}
		var columnConfig = [
			{
				field : 'name',
				title : '名称',
				searchable:true,
				orderable:true,
			},
			// {
			// 	field : 'fileName',
			// 	title : '生成文件名称',
			// 	searchable: true,
			// },
			{
				field : 'mindId',
				title : '思维导图',
				searchable: true,
				formatHandler:{
					type:'dictionary',
					data:mindIdDict
				}
			},{
				field : 'pageId',
				title : '模板',
				searchable: true,
				formatHandler:{
					type:'dictionary',
					data:pageIdDict
				}
			},{
				field : 'moduleId',
				title : '模块',
				searchable: true,
				formatHandler:{
					type:'dictionary',
					data:moduleIdDict
				}
			},{
				field : 'whenModify',
				title : '时间',
				searchable: true,
				formatHandler:	{
					type:'date',
					data:
					{
						formatDate:'YYYY-MM-DD hh:mm:ss'
					}
				}
			},{
				field:'rootParentId',
				title:'操作',
				width:250,
				searchable:true,
				formatHandler:{
					type: 'button',
					data : columnConfigBtns,
				}
			},{//添加可以根据id检索
				field:'id',
				searchable:true,
				hidden:true,
			}
		]
		var uiConfig = {
			searchTitle: 		"字典查询",				//搜索框前面的文字，默认为检索
			searchPlaceholder: 	"中文名，英文名",			//搜索框提示文字，默认为可搜索的列名
			isSelectColumns: 	false, 					//是否开启列选择，默认为选择
			isAllowExport: 		false,					//是否允许导出数据，默认允许
			isSingleSelect: true,			 			//是否单选
		}
		var btnConfig = {
			selfBtn:[
				{
					text:'新增',
					handler:function(){
						var formArr = $.extend(true, [], editPageConfigArr);
						var configS = {
							id: 	"plane-page",
							title: 	"新增",
							size: 	"m",
							form:   formArr,
							btns:[
								{
									text: 		'确认',
									handler: 	function(){
										var dialogData = nsdialog.getFormJson("plane-page");
										// console.log(dialogData);
										if(dialogData){
											var configData = {
												type:'temp',
												data:dialogData,
											}
											pageProperty.ajax.save(configData, category);
										}
									},
								}
							]
						}
						nsdialog.initShow(configS);
					}
				},{
					text:'刷新',
					handler:function(){
						nsConfirm('您确定要全部刷新吗？', function(isTrue){
							if(isTrue){
								var ajaxData = {
									url:getRootPath()+"/templateMindPages/generateAll",
									type:"POST",
									dataType:"json",
								}
								NetStarUtils.ajax(ajaxData,function(res){
									nsAlert("刷新成功");
								});
							}
						},'warning');
						
					}
				},{
					text:'复制',
					handler:function(){
						var arr = $.isArray(baseDataTable.data["client-table"].dataConfig.dataSource) ? baseDataTable.data["client-table"].dataConfig.dataSource : [];
						var configS = {
							id: 	"plane-page",
							title: 	"新增",
							size: 	"m",
							form:   [
								{
									id:"id",
									label:"页面",
									type:"select2",
									rules:"required",
									subdata: arr,
									textField : 'name',
									valueField : 'id',
									isServiceMode:false,
									requestParams:'search',
								}
							],
							btns:[
								{
									text: 		'确认',
									handler: 	function(){
										var dialogData = nsdialog.getFormJson("plane-page");
										// console.log(dialogData);
										if(dialogData){
											pageProperty.ajax.copyPage(dialogData, category);
										}
									},
								}
							]
						}
						nsdialog.initShow(configS);
					}
				},{
					text:'同步权限',
					handler:function(){
						pageProperty.ajax.syncRightsAll();
					}
				},{
					text:'导入表单',
					handler:function(){
						var configS = {
							id: 	"plane-page",
							title: 	"导入表单",
							size: 	"m",
							form:   [
								{
									type:'hidden',
									id:'id',
								},{
									html: '<div>'
											+ '<input id="plane-page-imports" accept="" type="file" class="pt-upload-control">'
										+ '</div>'
								}
							],
							btns:[
								{
									text: 		'确认',
									handler: 	function(){
										var $upload = $('#plane-page-imports');
										var files = $upload.prop('files');
										if(files.length === 0){
											return;
										}
										var formData = new FormData();
										for (var i = 0; i < files.length; i++) {
											var item = files[i];
											formData.append('pageFiles', item, item.name);
										}
										pageProperty.ajax.imports(formData);
									},
								}
							]
						}
						nsdialog.initShow(configS);
					}
				},{
					text:'导出表单',
					handler:function(){
						var arr = $.isArray(baseDataTable.data["client-table"].dataConfig.dataSource) ? baseDataTable.data["client-table"].dataConfig.dataSource : [];
						var configS = {
							id: 	"plane-page",
							title: 	"导出表单",
							size: 	"m",
							form:   [
								{
									id:"id",
									label:"页面",
									type:"select2",
									rules:"required",
									subdata: arr,
									textField : 'name',
									valueField : 'id',
									isServiceMode:false,
									requestParams:'search',
									multiple : true,
								}
							],
							btns:[
								{
									text: 		'确认',
									handler: 	function(){
										var dialogData = nsdialog.getFormJson("plane-page");
										if(dialogData){
											pageProperty.ajax.exports(dialogData, category);
										}
									},
								}
							]
						}
						nsdialog.initShow(configS);
					}
				},{ 
					text:'清除缓存',
					handler:function(){
						var arr = $.isArray(baseDataTable.data["client-table"].dataConfig.dataSource) ? baseDataTable.data["client-table"].dataConfig.dataSource : [];
						var configS = {
							id: 	"plane-page",
							title: 	"导出表单",
							size: 	"m",
							form:   [
								{
									id:"pageId",
									label:"页面",
									type:"select2",
									subdata: arr,
									textField : 'name',
									valueField : 'id',
									isServiceMode:false,
									requestParams:'search',
									multiple : false,
								},{
									id:"mindId",
									label:"思维导图",
									type:"select2",
									subdata: mindSubdata,
									textField : 'name',
									valueField : 'id',
									isServiceMode:false,
									requestParams:'search',
									multiple : false,
								}
							],
							btns:[
								{
									text: 		'确认',
									handler: 	function(){
										var dialogData = nsdialog.getFormJson("plane-page");
										if(dialogData){
											pageProperty.ajax.clearCache(dialogData, category);
										}
									},
								}
							]
						}
						nsdialog.initShow(configS);
					}
				},{ 
					text:'清除所有缓存',
					handler:function(){
						nsConfirm('您确定要清除所有缓存吗？', function(isTrue){
							if(isTrue){
								pageProperty.ajax.clearAllCache();
							}
						},'warning');
					}
				}
			]
		}
		var urlStr = getRootPath() + '/templateMindPages/getList';		//数据源地址
		if(isCategory){
			urlStr = getRootPath() + '/templateMindPages/'+category+'/getList';
		}
		var ajaxConfig = {
			url: 		urlStr,		//数据源地址
			type:		"POST",			//GET POST
			data:		{},				//参数对象{id:1,page:100}
			dataSrc:	'rows',	
		}
		NetStarUtils.ajax(ajaxConfig, function(data, _ajaxConfig){
			if(data.success){
				var formdata = nsForm.getFormJSON("form-select");
				var tableData = $.extend(true,[],data.rows);
				// 文件名称添加jsp
				for(var index=0; index<tableData.length;index++){
					tableData[index].fileName = tableData[index].fileName + '.jsp';
				}
				// 是否有参数值 处理参数
				var ismindId = true; //是否有mindId
				var ispageId = true; //是否有pageId
				var ismoduleId = true; //是否有moduleId
				if(formdata.mindId == ""){
					ismindId = false;
				}else{
					// formdata.mindId = Number(formdata.mindId); //转为数字
				}
				if(formdata.pageId == ""){
					ispageId = false;
				}else{
					// formdata.pageId = Number(formdata.pageId); //转为数字
				}
				if(formdata.moduleId == ""){
					ismoduleId = false;
				}else{
					// formdata.pageId = Number(formdata.pageId); //转为数字
				}
				dataConfig.dataSource = [];
				// 获得表格显示数据
				for(var index=0;index<tableData.length;index++){
					var isTrue = true;
					if(ismindId){
						if(!(formdata.mindId.indexOf(tableData[index].mindId) > -1)){
							isTrue = false;
						}
					}
					if(ispageId){
						if(tableData[index].pageId != formdata.pageId){
							isTrue = false;
						}
					}
					if(ismoduleId){
						if(tableData[index].moduleId != formdata.moduleId){
							isTrue = false;
						}
					}
					if(isTrue){
						dataConfig.dataSource.push(tableData[index]);
					}
				}
				// if(ismindId && ispageId){
				// 	for(var index=0;index<tableData.length;index++){
				// 		if(formdata.mindId.indexOf(tableData[index].mindId) > -1  && tableData[index].pageId == formdata.pageId){
				// 			dataConfig.dataSource.push(tableData[index]);
				// 		}
				// 	}
				// }else{
				// 	if(ismindId){
				// 		for(var index=0;index<tableData.length;index++){
				// 			if(formdata.mindId.indexOf(tableData[index].mindId) > -1){
				// 				dataConfig.dataSource.push(tableData[index]);
				// 			}
				// 		}
				// 	}
				// 	if(ispageId){
				// 		for(var index=0;index<tableData.length;index++){
				// 			if(tableData[index].pageId == formdata.pageId){
				// 				dataConfig.dataSource.push(tableData[index]);
				// 			}
				// 		}
				// 	}
				// 	if(!ismindId && !ispageId){
				// 		dataConfig.dataSource = tableData;
				// 	}
				// }
				// 如果有表格则定义表格容器
				if($('#modal-show-table').children().length >0){
					// $('#modal-show-table').children().remove();
					uiConfig.$container = $('#modal-show-table');
				}else{
					// 如果没有表格
					// 插入表格容器
					$('#modal-show-table').append('<div class="table-responsive">'
									+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="client-table">'
									+'</table>'
								+'</div>');
				}
				// 插入表格容器
				/*$('#modal-show-table').append('<div class="table-responsive">'
								+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="client-table">'
								+'</table>'
							+'</div>');*/
				// 生成表格
				baseDataTable.init(dataConfig, columnConfig, uiConfig, btnConfig);
			}
		});
	}
}
pageProperty.getPageConfigByAjax = function(url, callBackFunc){
	// 不存在缓存读取缓存数据
	var ajaxConfig = {
		url: url,
		type: "GET",
		plusData: {
			callBackFunc : callBackFunc,
		},
		success: function(data){
			// ajax success
			if(data.success){
				var plusData = this.plusData;
				if(typeof(plusData.callBackFunc) == "function"){
					plusData.callBackFunc(data.data);
				}
			}
		}, 
		error:function(error){
			var plusData = this.plusData;
			if(typeof(plusData.callBackFunc) == "function"){
				plusData.callBackFunc(false, error, plusData);
			}
		}
	}
	//读取 Authorization 并添加到headers 如果已经过期了则报错退出
	var authorization = NetStarUtils.OAuthCode.get();
	if(authorization == false && typeof(NetstarHomePage) == "object"){
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
pageProperty.switchEditorData = function(config){
	var pageId = config.id;
	pageProperty.getPageConfigByAjax(getRootPath() + "/templateMindPages/pageConfig/" + pageId, function(config){
		pageProperty.init(config, function(resPageParams){
			console.log(resPageParams);
			var ajaxConfig = {
				data : { type:'state' },
				plusData : {
					pageParams : resPageParams,
					sourceFormId : pageId,
				}
			}
			NetstarEditorAjax.getList(ajaxConfig, function(resState, plusData){
				var pageParams = plusData.pageParams;
				var sourceFormId = plusData.sourceFormId;
				var _config = {
					sourceConfig : pageParams.sourceConfig,
					config : pageParams.config,
					allState : resState,
				};
				// 页面配置
				var pageConfig = pageProperty.editorDataSwitch.getPageConfig(_config);
				if(pageConfig){
					// 开始保存
					pageProperty.editorDataSwitch.startSavePageConfig(pageConfig, sourceFormId);
				}else{
					nsAlert('获取页面配置失败', 'error');
					console.error('获取页面配置失败');
				}
			});
		}, false);
	})
}
pageProperty.editorDataSwitch = {
	// nsProject.getFieldsByState(subjects.financeSubjectsVO,"subjectsList",{isColumn:true,isDialog:false,isMoreCol:false}) 获取voName/stateName
	getVoAndStateName : function(stateStr){
		var res = /nsProject\.getFieldsByState\((.*?)\)/;
		if(!res.test(stateStr)){
			return false;
		}
		var namesStr = stateStr.match(res)[1];
		var nameArr = namesStr.split(','); // 数组的0,1是需要的vo名，状态名
		var eVNames = nameArr[0].split('.'); // 实体与vo名
		var entityName = eVNames[0];
		var voName = eVNames[1];
		var stateName = nameArr[1]; // "状态名"
		stateName = stateName.substring(1, stateName.length-1);
		// 状态中可能包含更多等关键词
		var stateNameArr = stateName.split('.');
		stateName = stateNameArr[0];
		var stateType = stateNameArr[1] ? stateNameArr[1] : false;
		return {
			entityName : entityName,
			voName : voName,
			stateName : stateName,
			stateType : stateType,
		}
	},
	// 获取状态id
	getStateIdByVoName : function(allState, stateParams){
		// 通过vo名字保存状态 如果没有vo名字表示不是通过vo存储的状态
		var stateId = false;
		for(var i=0; i<allState.length; i++){
			var configStr = allState[i].config;
			var config = JSON.parse(configStr);
			var stateConfig = config.config;
			if(typeof(stateConfig) != "object"){
				continue;
			}
			var entityName = stateConfig.entityName;
			var voName = stateConfig.voName;
			var englishName = stateConfig.englishName;
			if(entityName == stateParams.entityName && voName == stateParams.voName && englishName == stateParams.stateName){
				stateId = allState[i].id;
				break;
			}
		}
		return stateId;
	},
	// 获取pageConfig
	getPageConfig : function(config){
		var sourceConfig = config.sourceConfig;
		var pageConfig = $.extend(true, {}, config.config);
		var allState = config.allState;
		var components = sourceConfig.components;
		// 找到状态
		for(var i=0; i<components.length; i++){
			var component = components[i];
			var type = component.type;
			if(type == "btns"){ continue; }
            if(typeof(component.field) == "undefined"){ continue; }
            if(component.type == "tab"){ continue; }
			// 通过vo名字保存状态 如果没有vo名字表示不是通过vo存储的状态
			var stateParams = pageProperty.editorDataSwitch.getVoAndStateName(component.field);
			if(!stateParams){
				console.error('状态配置错误');
				console.error(component.field);
				pageConfig = false;
				break;
			}
			var stateId = pageProperty.editorDataSwitch.getStateIdByVoName(allState, stateParams);
			if(stateId){
				pageConfig.components[i].nsStateType = stateParams.stateType;
				pageConfig.components[i].nsChildren = [stateId];
				// delete pageConfig.components[i].field;
			}else{
				pageConfig = false;
				break;
			}
		}
		// 处理getValueAjax/saveData
		if(typeof(pageConfig.getValueAjax) == "object"){
			if(pageConfig.getValueAjax.src){
				var getRootPathStr = getRootPath();
				pageConfig.getValueAjax.url = pageConfig.getValueAjax.src.replace(getRootPathStr, '');
				pageConfig.getValueAjax.isUseGetRootPath = true;
				pageConfig.getValueAjax.datasourceType = 'api';
			}
        }
        if(typeof(pageConfig.saveData) == "object" && typeof(pageConfig.saveData.ajax) == "object"){
			pageConfig.saveData = $.extend(false, pageConfig.saveData, pageConfig.saveData.ajax);
			delete pageConfig.saveData.ajax;
			if(pageConfig.saveData.src){
				var getRootPathStr = getRootPath();
				pageConfig.saveData.url = pageConfig.saveData.src.replace(getRootPathStr, '');
				pageConfig.saveData.isUseGetRootPath = true;
				pageConfig.saveData.datasourceType = 'api';
			}
        }
		return pageConfig;
	},
	// 获取元素
	getElements : function(pageConfig){
		var elements = {
			page : {},
			components : [],
			pageConfig : pageConfig,
		};
		var _pageConfig = {};
		for(var key in pageConfig){
			if(key == "components"){ continue; }
			_pageConfig[key] = pageConfig[key];
		}
		var components = pageConfig.components;
		var pageComponents = [];
		var pageConfigComponentLenth = 0;
		for(var i=0; i<components.length; i++){
			var component = components[i];
			var fields = component.field;
			// 按钮不需要状态处理
			if(component.type == "btns" || component.type == "tab" ||  component.type == "tree"){
				pageComponents.push(component);
				continue;
			}
			// 没有fields的面板component不需要状态处理
			if(typeof(fields) == "undefined"){
				pageComponents.push(component);
				continue;
			}
			// 需要状态处理的计为 false
			pageComponents.push(false);
			pageConfigComponentLenth ++;
			// type == "components"
			var componentConfig = {};
			for(var key in component){
				if(key == "field"){ continue; }
				if(key == "nsState"){ continue; }
				if(key == "nsChildren"){ continue; }
				componentConfig[key] = component[key];
			}
			// componentConfig.isDefaultState = false;
			var componentElement = {
				type : 'components',
				config : JSON.stringify(componentConfig),
			}
			if($.isArray(component.nsChildren)){
				componentElement.children = component.nsChildren;
			}
			if(component.nsId){
				componentElement.id = component.nsId;
			}
			elements.components.push(componentElement);
		}
		_pageConfig.components = pageComponents;
		// 页面名字
		var controlName = _pageConfig.title ? _pageConfig.title + ' ' : '';
		controlName += _pageConfig.package ? _pageConfig.package : '';
		var pageElement = {
			type : 'page',
			children : [],
			config : JSON.stringify(_pageConfig),
			controlName : controlName,
		}
		if(_pageConfig.nsId){
			pageElement.id = _pageConfig.nsId;
		}
		elements.page = pageElement;
		elements.pageConfig.pageConfigComponentLenth = pageConfigComponentLenth;
		return elements;
	},
	// 保存
	savePageConfig : function(pageConfig, sourceFormId){
		var elements = pageProperty.editorDataSwitch.getElements(pageConfig);
		pageProperty.editorDataSwitch.elements = elements;
		var components = elements.components;
		NetstarEditorAjax.savePageData(components, { sourceFormId: sourceFormId }, function(resData, plusData){
			var pageElement = pageProperty.editorDataSwitch.elements.page;
			var children = [];
			for(var i=0; i<resData.length; i++){
				children.push(resData[i].id);
			}
			pageElement.children = children;
			NetstarEditorAjax.savePageData([pageElement], { sourceFormId: plusData.sourceFormId }, function(resData, plusData){
				nsAlert('转换页面成功,开始记录转换信息');
				console.log(resData);
				console.log('转换页面成功,开始记录转换信息');
				var sourceFormId = plusData.sourceFormId;
				var formId = resData[0].id;
				var ajaxConfig = {
					url : getRootPath() + '/formdesigner/syncrelations/add',
					type : 'POST',
					contentType : 'application/x-www-form-urlencoded',
					data : {
						sourceFormId : sourceFormId,
						formId : formId,
					},
				}
				NetStarUtils.ajax(ajaxConfig, function(res){
					nsAlert('记录信息完成');
					console.log('记录信息完成');
				});
			})
		})
	},
	// 开始保存
	startSavePageConfig : function(pageConfig, sourceFormId){
		// 获取所有page找到该页面是否已经保存若保存沿用上次id
		NetstarEditorAjax.getList({
			data:{ type:'page' },
			plusData : {
				pageConfig : pageConfig,
				sourceFormId : sourceFormId,
			},
		}, function(pageList, plusData){
			var pageConfig = plusData.pageConfig;
			var sourceFormId = plusData.sourceFormId;
			var pageId = false;
			for(var i=0; i<pageList.length; i++){
				var _pageConfig = JSON.parse(pageList[i].config);
				if(_pageConfig.package === pageConfig.package){
					pageId = pageList[i].id;
					break;
				}
			}
			// 判断是否找到pageId,如果找到查询页面配置
			if(pageId){
				// NetstarEditorAjax.getPageData({ id:pageId }, (function(){
				// 		return function(resData){
				// 			console.log(resData);

				// 		}
				// 	})(pageConfig)
				// );
				NetstarEditorServer.getPageConfig({ id:pageId }, (function(currentPageConfig, sourceFormId){
					return function(resData){
						console.log(resData);
						// 根据类型为page和component添加id
						currentPageConfig.nsId = resData.nsId;
						var components = currentPageConfig.components;
						var resComponents = resData.components;
						for(var i=0; i<components.length; i++){
							var gid = components[i].gid;
							for(var j=0; j<resComponents.length; j++){
								if(gid == resComponents[j].gid){
									if(resComponents[j].nsId){
										components[i].nsId = resComponents[j].nsId;
									}
									break;
								}
							}
						}
						pageProperty.editorDataSwitch.savePageConfig(pageConfig, sourceFormId);
					}
				})(pageConfig, sourceFormId)
			)
			}else{
				pageProperty.editorDataSwitch.savePageConfig(pageConfig, sourceFormId);
			}
		})
	},
}
pageProperty.ajax = {}
// 导出表单
pageProperty.ajax.exports = function(dialogData){
	if(dialogData.id){
		var ajaxData = {
			url:getRootPath() + "/templateMindPages/exports",
			data : {
				ids : dialogData.id,
			},
			type:"GET",
			contentType : 'application/x-www-form-urlencoded',
			plusData : getRootPath() + "/templateMindPages/exports?ids=" + dialogData.id,
		}
		NetStarUtils.ajaxForText(ajaxData,function(res, _ajaxConfig){
			nsAlert("导出表单成功");
			NetStarUtils.download({ 
				url: _ajaxConfig.plusData, 
				fileName: moment().format('x'),
			});
			nsdialog.hide();
		});
	}
}
pageProperty.ajax.imports = function(formData, id){
	var url = getRootPath() + "/templateMindPages/imports";
	if(id){
		url += '/' + id;
	}
	if(formData){
		var ajaxData = {
			url:url,
			type:"POST",
            processData:false,
            contentType:false,
			data : formData,
		}
		NetStarUtils.ajax(ajaxData,function(res){
			nsAlert("替换表单成功");
			nsdialog.hide();
		});
	}
}
pageProperty.ajax.copyPage = function(dialogData, category){
	if(dialogData.id){
		var ajaxData = {
			url:getRootPath() + "/templateMindPages/copy/" + dialogData.id,
			type:"POST",
			dataType:"json",
		}
		NetStarUtils.ajax(ajaxData,function(res){
			nsAlert("复制成功");
			nsdialog.hide();
			pageProperty.pageGeneratingTable(category);
		});
	}
}
pageProperty.ajax.getPageByPageId = function(pageId, callBackFunc){
	var ajaxData = {
		url : getRootPath() + "/templateMindPages/pageConfig/" + pageId,
		type : "POST",
		plusData : {
			callBackFunc : callBackFunc,
			dataSrc : 'data',
		}
	}
	NetStarUtils.ajax(ajaxData,function(res, _ajaxData){
		var plusData = _ajaxData.plusData;
		if(typeof(plusData.callBackFunc)){
			plusData.callBackFunc(res, plusData);
		}
	}, true);
}
// 清缓存
pageProperty.ajax.clearCache = function(dialogData, category){
	var ajaxData = {
		url:getRootPath() + "/templateMindPages/clearCache",
		type:"GET",
		dataType:"json",
		contentType : 'application/x-www-form-urledcoded',
	}
	if(!$.isEmptyObject(dialogData)){
		ajaxData.data = dialogData;
	}
	console.log(ajaxData);
	NetStarUtils.ajax(ajaxData,function(res){
		nsAlert("清除成功");
		nsdialog.hide();
	});
}
// 清所有缓存
pageProperty.ajax.clearAllCache = function(){
	var ajaxData = {
		url:getRootPath() + "/templateMindPages/clearAllCache",
		type:"GET",
		dataType:"json",
		contentType : "application/x-www-form-urlencoded",
	}
	NetStarUtils.ajax(ajaxData,function(res){
		nsAlert("清除成功");
	});
}
// 验证页面新增/修改时的参数配置
// fileName只允许纯英文小写不允许大写
pageProperty.valiPageConfig = function(dialogData){
	var isTrue = true;
	for(var ajaxAttr in dialogData){
		switch(ajaxAttr){
			case 'fileName':
				// var englishRegExp = /^[a-z]+$/; // 由26个小写英文字母组成的字符串
				// var isOnlyEnglish = englishRegExp.test(dialogData[ajaxAttr]);
				// if(!isOnlyEnglish){
				// 	isTrue = false;
				// 	nsAlert('生成文件名称只能是小写英文，请检查是否错误','error');
				// 	console.error(dialogData);
				// }
				break;
			default:
				break;
		}
	}
	return isTrue;
}
// pageProperty.ajax.get = function(){}
pageProperty.ajax.save = function(configData, category){
	/*$.ajax({
		url:getRootPath() + "/templateMindPages/save",
		type:"POST",
		dataType:"json",
		data:dialogData,
		success:function(data){
			if(data.success){
				nsAlert("保存成功");
				nsdialog.hide();
				// var formData = nsForm.getFormJSON("form-select");
				pageProperty.pageGeneratingTable();
			}else{
				nsAlert("保存失败");
			}
		}
	});*/
	/*
	 * type:保存的类型 模板/模板数据
	 * data:保存的数据
	 */
	var isTrue = true;
	// 新增/修改摸板时验证文件名只有小写字母
	if(configData.type == 'temp'){
		isTrue = pageProperty.valiPageConfig(configData.data);
	}
	// var isTrue = pageProperty.valiPageConfig(dialogData);
	if(isTrue){
		var saveData = configData.data;
		var ajaxData = {
			url:getRootPath() + "/templateMindPages/save",
			type:"POST",
			dataType:"json",
			data:saveData,
			contentType : 'application/x-www-form-urlencoded',
		}
		NetStarUtils.ajax(ajaxData,function(res){
			nsAlert("保存成功");
			if(configData.type == 'temp'){
				nsdialog.hide();
				// var formData = nsForm.getFormJSON("form-select");
				pageProperty.pageGeneratingTable(category);
			}
		});
	}
}
pageProperty.ajax.delete = function(rowData, category){
	/*$.ajax({
		url:getRootPath()+"/templateMindPages/delete",
		type:"POST",
		dataType:"json",
		data:{id:rowData.id},
		success:function(data){
			if(data.success){
				nsAlert("删除成功");
				// var formData = nsForm.getFormJSON("form-select");
				pageProperty.pageGeneratingTable();
			}else{
				nsAlert("删除失败");
			}
		}
	});*/

	var ajaxData = {
		url:getRootPath()+"/templateMindPages/delete",
		type:"POST",
		dataType:"json",
		data:{id:rowData.id},
		contentType : 'application/x-www-form-urlencoded',
	}
	NetStarUtils.ajax(ajaxData,function(res){
		nsAlert("删除成功");
		pageProperty.pageGeneratingTable(category);
	});
}
pageProperty.ajax.edit = function(dialogData, category){
	/*$.ajax({
		url:getRootPath() + "/templateMindPages/save",
		type:"POST",
		dataType:"json",
		data:dialogData,
		success:function(data){
			if(data.success){
				nsAlert("修改成功");
				nsdialog.hide();
				// var formData = nsForm.getFormJSON("form-select");
				pageProperty.pageGeneratingTable();
			}else{
				nsAlert("修改失败");
			}
		}
	});*/
	var isTrue = pageProperty.valiPageConfig(dialogData);
	if(isTrue){
		var ajaxData = {
			url:getRootPath() + "/templateMindPages/save",
			type:"POST",
			dataType:"json",
			data:dialogData,
			contentType : 'application/x-www-form-urlencoded',
		}
		NetStarUtils.ajax(ajaxData,function(res){
			nsAlert("修改成功");
			nsdialog.hide();
			pageProperty.pageGeneratingTable(category);
		});
	}
}
pageProperty.ajax.refresh = function(id){
	/*$.ajax({
		url:getRootPath()+"/templateMindPages/generate/"+id,
		type:"POST",
		dataType:"json",
		success:function(data){
			if(data.success){
				nsAlert("刷新成功");
			}else{
				nsAlert("刷新失败");
			}
		}
	});*/

	var ajaxData = {
		url:getRootPath()+"/templateMindPages/generate/"+id,
		type:"POST",
		dataType:"json",
	}
	NetStarUtils.ajax(ajaxData,function(res){
		nsAlert("刷新成功");
	});
}
pageProperty.ajax.generatePages = function(rowData){
	/*$.ajax({
		url: getRootPath() + "/templateMindPages/generate/" + rowData.id,
		type:"POST",
		dataType:"json",
		success:function(data){
			if(data.success){
				nsAlert("生成页面成功");
			}else{
				nsAlert("生成页面失败");
			}

		}
	});*/
	var ajaxData = {
		url: getRootPath() + "/templateMindPages/generate/" + rowData.id,
		type:"POST",
		dataType:"json",
	}
	NetStarUtils.ajax(ajaxData,function(res){
		nsAlert("生成页面成功");
	});
}
pageProperty.ajax.saveXmlJson = function(xmlJosn){
	/*$.ajax({
		url:getRootPath()+"/templateMindMaps/save",
		type:"POST",
		dataType:"json",
		data:xmlJosn,
		success:function(data){
			if(data.success){
				nsAlert("思维导图保存成功");
			}else{
				nsAlert("思维导图保存失败");
			}
		}
	});*/
	var ajaxData = {
		url:getRootPath()+"/templateMindMaps/save",
		type:"POST",
		dataType:"json",
		data:xmlJosn,
		contentType : 'application/x-www-form-urlencoded',
	}
	NetStarUtils.ajax(ajaxData,function(res){
		nsAlert("思维导图保存成功");
	});
}
// 同步权限
pageProperty.ajax.syncRightsAll = function(){
	var ajaxData = {
		url: getRootPath() + "/templateMindPages/syncRightsAll",
		type: "POST",
	}
	nsConfirm('确认同步权限吗？', function(isConfirm){
		if(isConfirm){
			NetStarUtils.ajax(ajaxData,function(res){
				if(res.success){
					nsAlert("权限同步成功");
				}else{
					nsAlert("权限同步失败");
				}
			}, true);
		}else{

		}
	});
	
}
pageProperty.saveXmlJsonByEditor = function(mindId){
	/**
	 * $.ajax({
		url:getRootPath()+"/templateMindMaps/"+mindId,
		type:"GET",
		dataType:"json",
		success:function(data){
			if(data.success){
				if(data.data.xmlDict && data.data.jsonContent){
					var xmlDict = JSON.parse(data.data.xmlDict); // 编辑的信息
					var jsonContent = JSON.parse(data.data.jsonContent); // 思维导图数据
					var xmmapJson = pageProperty.getXmlJsonByEditor(xmlDict,jsonContent); // 编辑的信息刷新思维导图数据
					var parameterObj = {
						id:mindId,
						jsonContent:JSON.stringify(xmmapJson),
					}
					pageProperty.ajax.saveXmlJson(parameterObj); // 保存思维导图数据
				}
				nsAlert("思维导图刷新成功");
			}else{
				nsAlert("获取思维导图失败");
			}
		}
	 * });
	 */
	var ajaxConfig = {
		url:getRootPath()+"/templateMindMaps/"+mindId,
		type:"GET",
		dataType:"json",
		contentType:'application/x-www-form-urlencoded',
	}
	NetStarUtils.ajax(ajaxConfig, function(data, _ajaxConfig){
		if(data.success){
			if(data.data.xmlDict && data.data.jsonContent){
				var xmlDict = JSON.parse(data.data.xmlDict); // 编辑的信息
				var jsonContent = JSON.parse(data.data.jsonContent); // 思维导图数据
				var xmmapJson = pageProperty.getXmlJsonByEditor(xmlDict,jsonContent); // 编辑的信息刷新思维导图数据
				var parameterObj = {
					id:mindId,
					jsonContent:JSON.stringify(xmmapJson),
				}
				pageProperty.ajax.saveXmlJson(parameterObj); // 保存思维导图数据
			}
			nsAlert("思维导图刷新成功");
		}else{
			nsAlert("获取思维导图失败");
		}
	});
}
pageProperty.getXmlJsonByEditor = function(xmlDict,_jsonContent){
	var jsonContent = $.extend(true,{},_jsonContent);
	// 获得实体名
	var voName = '';
	for(var key in jsonContent){
		voName = key;
	}
	for(var bueinesName in xmlDict){
		if(jsonContent[voName][bueinesName]){
			var columns = jsonContent[voName][bueinesName].columns;
			var fields = jsonContent[voName][bueinesName].fields;
			// 判断显示 并 添加编辑的属性到思维导图
			selectAddEditorAttr(columns,fields,xmlDict[bueinesName]);
		}
	}
	// 判断显示 并 添加编辑的属性到思维导图
	function selectAddEditorAttr(columns,fields,ediObj){
		for(var name in ediObj){
			var formatData = ediObj[name].formatData;
			switch(formatData.position){
				case 'table':
					addEditorAttr(columns,formatData.table,name);
					break;
				case 'form':
					addEditorAttr(fields,formatData.form,name);
					break;
				case 'all':
					addEditorAttr(fields,formatData.form,name);
					addEditorAttr(columns,formatData.table,name);
				 	break;
			}
		}
	}
	// 添加
	function addEditorAttr(sourceObj,addObj,chineseName){
		for(var englishName in sourceObj){
			if(sourceObj[englishName].nsChineseName == chineseName){
				for(var attrKey in addObj){
					if(typeof(sourceObj[englishName][attrKey])=="undefined" || sourceObj[englishName][attrKey] != addObj[attrKey]){
						switch(attrKey){
							case 'label':
							case 'title':
								if(addObj[attrKey].length>0){
									sourceObj[englishName][attrKey] = addObj[attrKey];
								}
								break;
							default:
								sourceObj[englishName][attrKey] = addObj[attrKey];
								break;
						}
					}
				}
				break;
			}
		}
	}
	return jsonContent;
}
// 保存代码方法
pageProperty.saveCodeMethod = function(rowData, category){
	/*
	$.ajax({
		url: getRootPath()+'/templateMindPages/'+rowData.id,
		type:"GET",
		dataType:"json",
		success:function(data){
			if(data.success){
				var defaultData = data.data;
				codeDialogFun(defaultData);
			}
		}
	})
	*/
	var ajaxConfig = {
		url: getRootPath()+'/templateMindPages/'+rowData.id,
		type:"GET",
		dataType:"json",
		contentType:'application/x-www-form-urlencoded',
	};
	NetStarUtils.ajax(ajaxConfig, function(data, _ajaxConfig){
		if(data.success){
			var defaultData = data.data;
			if(typeof(defaultData) == "undefined"){
				var datas = data.rows;
				datas = datas.sort(function(a, b){
					return a.priorityLevel - b.priorityLevel;
				})
				defaultData = datas[datas.length - 1];
				var pageParams = '';
				for(var i=datas.length-1; i>-1; i--){
					if(pageParams.length > 0){
						break;
					}
					if(typeof(datas[i].pageParams) == "string" && datas[i].pageParams.length > 0){
						pageParams = datas[i].pageParams;
					}
				}
				defaultData.pageParams = pageParams;
			}
			codeDialogFun(defaultData);
		}
	});
	function codeDialogFun(defaultData){
		var config = {
			id: 	"plane-page",
			title: 	"编辑",
			size: 	"b",
			form:[
				{
					id:"id",
					label:"id",
					type:"hidden",
					value:defaultData.id
				},{
					id:"pageParams",
					label:"代码",
					type:"textarea",
					height:300,
					value:defaultData.pageParams
				}
			],
			btns:[
				{
					text: 		'确认',
					handler: 	function(){
						var dialogData = nsdialog.getFormJson("plane-page");
						if(dialogData){
							var configData = {
								type:'temp',
								data:dialogData,
							}
							pageProperty.ajax.save(configData, category);
						}
					},
				}
			]
		}
		nsdialog.initShow(config);
	}
}
// 格式化保存数据
pageProperty.formatSaveData = function(_config){
	var packageStr = false;
	if(pageProperty.vosByPackage[_config.package]){
		packageStr = _config.package;
	}
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
								try{
									var funcStr = data[key];
									var rex = /nsProject.getFuncArrayByXmmapFuncNames\((.*?)\,(.*?)\)/;
									if(rex.test(funcStr) && packageStr){
										var voNameStr = funcStr.match(rex)[1];
										funcStr = funcStr.replace(voNameStr, 'pageProperty.vosByPackage["' + packageStr + '"]');
										data[key] = eval(funcStr);
									}else{
										data[key] = eval(funcStr);
										var fieldById = {};
										for(var fieldI=0;fieldI<data[key].length;fieldI++){
											if(data[key][fieldI].id){
												fieldById[data[key][fieldI].id] = data[key][fieldI];
											}
										}
										if(!$.isEmptyObject(fieldById)){
											data.fieldById = fieldById;
										}
									}
									// data[key] = eval(data[key]);
									// var fieldById = {};
									// for(var fieldI=0;fieldI<data[key].length;fieldI++){
									// 	if(data[key][fieldI].id){
									// 		fieldById[data[key][fieldI].id] = data[key][fieldI];
									// 	}
									// }
									// if(!$.isEmptyObject(fieldById)){
									// 	data.fieldById = fieldById;
									// }
								}catch(error){
									console.error(error.message);
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
						case 'closeOrClear':
						case 'isUseSearchInput':
						case 'isUseQRInput':
						case 'isKeepSelected':
						case 'isSaveToTemplate':
						case 'isUseBtnPanelManager':
						case 'isOpenFormQuery':
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
// 不是弹框时添加事件 快捷键弹出配置表单表格
pageProperty.dialogConfigerPlane = function(templateMindPagePage,templateMindPageId){
	$("container").append('<div class="row" id="parameter" style="position: absolute;top: 50px;left: 160px;width: 800px;height: 600px;">'
							+'<div class="col-sm-12" id="page-formJson-btns"></div>'
							+'<div class="col-sm-12" id="page-formJson"></div>'
							+'<div class="col-sm-12 main-panel">'
								+'<div class="panel panel-default">'
									+'<div class="panel-body" id="page-table-body">'	
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>');
	pageProperty.selectLine(templateMindPagePage);
	var editBtns = [
		{
			text: 		'保存',
			handler: 	function(){
				pageProperty.saveData(templateMindPagePage);
			}
		},{
			text: 		'刷新',
			handler: 	function(){
				var ajaxConfig = {
					url:getRootPath()+"/templateMindPages/generate/"+templateMindPageId,
					type:"POST",
					dataType:"json",
				}
				NetStarUtils.ajax(ajaxConfig, function(data){
					if(data.success){
						window.location.href = window.location.href;
						nsAlert("刷新成功");
					}else{
						nsAlert("刷新失败");
					}
				});
				/*
				$.ajax({
					url:getRootPath()+"/templateMindPages/generate/"+templateMindPageId,
					type:"POST",
					dataType:"json",
					success:function(data){
						if(data.success){
							window.location.href = window.location.href;
							nsAlert("刷新成功");
						}else{
							nsAlert("刷新失败");
						}
					}
				});
				*/
			}
		}
	]
	nsButton.initBtnsByContainerID('page-formJson-btns',editBtns);
}
// 获取页面配置数据 生成配置弹框
pageProperty.setPagesConfigerData = function(templateMindPageId){
	if($("container > #ns-template").length > 0){
		function showBaseTableForm(event){
			if(event.altKey && event.ctrlKey && event.keyCode === 36){
				$.ajax({
					url:getRootPath()+'/templateMindPages/' + templateMindPageId,
					type:"get",
					dataType:"json",
					success:function(data){
						if(data.success){
							templateMindPagePage = data.data;
							pageProperty.dialogConfigerPlane(templateMindPagePage,templateMindPageId);
						}
					}
				})
			}
		}
		$(document).off('keyup',showBaseTableForm);
		$(document).on('keyup',showBaseTableForm);
	}
	/*$.ajax({
		url:getRootPath()+'/templateMindPages/' + templateMindPageId,
		type:"get",
		dataType:"json",
		success:function(data){
			if(data.success){
				templateMindPagePage = data.data;
				pageProperty.dialogConfigerPlane(templateMindPagePage,templateMindPageId);
			}
		}
	})*/
}
pageProperty.ajaxConfig = {
	// 思维导图列表
	mindMapsList:{
		url:'/templateMindMaps/getList',
		type:'GET',
		dataType:'json',
	},
	// 模板列表
	templateList:{
		url:'/templatePages/getList',
		type:'GET',
		dataType:'json',
	},
	// 页面配置列表
	pagesList:{
		url:'templateMindPages/getList',
		type:'POST',
		dataType:'json',
	},
	// 根据id查询思维导图
	mindMap:{
		url:'/templateMindMaps/json/',
		type:'GET',
		dataType:'json',
		id:'',
	},
	// 根据id获得页面模板配置
	template:{
		url:'/templatePages/',
		type:'GET',
		dataType:'json',
		id:'',
	},
	// 根据id获得页面参数配置
	page:{
		url:'/templateMindPages/',
		type:'GET',
		dataType:'json',
		id:'',
	},
	// 获得思维导图列表 根据思维导图id
	mindList:{
		url:'/templateMindMapDetails/getList',
		type:'POST',
		dataType:'json',
		data:{mindMapId:''},
	},
	// 保存页面参数配置
	savePage:{
		url:'/templateMindMapDetails/getList',
		type:'POST',
		dataType:'json',
		data:{},
	},
	// 根据id刷新/生成页面
	refresh:{
		url:getRootPath()+"/templateMindPages/generate/+id",
		type:"POST",
		dataType:"json",
	}
}
pageProperty.ajaxInit = {
	init:function(){
		var _this = this;
		var ajaxList = pageProperty.ajaxConfig;
		$.each(ajaxList, function(functionName, functionAjaxConfig){
			_this[functionName] = function(ajaxData, callBackFunc){
				var ajaxConfig = $.extend(true, {}, functionAjaxConfig);
				_this.ajaxCommon(ajaxConfig, ajaxData, callBackFunc);
			}
		})
	},
	ajaxCommon:function(ajaxConfig, ajaxData, callBackFunc){
		if(ajaxConfig.id){
			ajaxConfig.url += ajaxData.id;
			delete ajaxConfig.id;
		}
		if(ajaxConfig.data){
			ajaxConfig.data = ajaxData.data;
		}
		if(ajaxData.dataSrc){
			ajaxConfig.dataSrc = ajaxData.dataSrc;
		}
		NetStarUtils.ajax(ajaxConfig, function(res, resAjaxConfig){
			//回调
			//如果回调有dataSrc 则只回传dataSrc
			var returnRes = {};
			if(resAjaxConfig.dataSrc && resAjaxConfig.dataSrc !=''){
				returnRes = res[resAjaxConfig.dataSrc]
			}else{
				returnRes = res;
			}
			callBackFunc(returnRes);
		})
	},
}
pageProperty.table = {
	data:{
		tableID:"",
		dataSource:[],	
	},
	column:[
		{
			field : 'name',
			title : '名称',
			searchable:true,
			orderable:true,
		},{
			field : 'fileName',
			title : '生成文件名称',
			searchable: true,
		},{
			field : 'mindId',
			title : '思维导图',
			searchable: true,
			formatHandler:{
				type:'dictionary',
			}
		},{
			field : 'pageId',
			title : '模板',
			searchable: true,
			formatHandler:{
				type:'dictionary',
			}
		},{
			field : 'whenModify',
			title : '时间',
			searchable: true,
			formatHandler:	{
				type:'date',
				data:
				{
					formatDate:'YYYY-MM-DD hh:mm:ss'
				}
			}
		}
	],
	ui:{
		searchTitle: 		"字典查询",				//搜索框前面的文字，默认为检索
		searchPlaceholder: 	"中文名，英文名",			//搜索框提示文字，默认为可搜索的列名
		isSelectColumns: 	false, 					//是否开启列选择，默认为选择
		isAllowExport: 		false,					//是否允许导出数据，默认允许
		isSingleSelect: true,			 			//是否单选
	},
	btns:{
		selfBtn:[
			{
				text:'新增',
				handler:function(){},
			}
		]
	},
	refresh:function(tableData){
		this.data.dataSource = tableData;
	},
	init:function(config){

	}
}
pageProperty.form = {
}
pageProperty.show = {
	init:function(){
		pageProperty.ajaxInit.init();
		var executionOrder = 0;
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
					btnsStr += entityName + '.' + methodArr[index].englishName + ',';
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
		 * stateGid : gid
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
		pageExpression : '',
		isSaveToTemplate : false,
		// isHaveSaveAndAdd:true,
		getValueAjax:{},
		draftBox : {},
		isUseBtnPanelManager : false,
		params : {},
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
		if($.isEmptyObject(obj)){
			break;
		}
		obj = obj[type];
		for(var panelKey in obj){
			var panelVals = obj[panelKey];
			if(typeof(panelVals) == "object"){
				// 判断是否存在，不存在验证是否新增 如果不存在也不是新增则删除
				if($.isArray(runConfig[panelKey])){
					var __data = {};
					for(var i=0; i<runConfig[panelKey].length; i++){
						__data[runConfig[panelKey][i].gid] = runConfig[panelKey][i];
					}
					runConfig[panelKey] = __data;
				}
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
		if(!$.isArray(runConfig.index) && obj.index){
			runConfig.index = obj.index;
		}else{
			if($.isArray(obj.index)){
				runConfig.index = obj.index;
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
	if(!isCurrent && !$.isEmptyObject(runConfig)){
		var tableDataObj = typeof(runConfig.tableData) == "object" ? runConfig.tableData : runConfig.tab;
		var index = runConfig.index;
		if($.isArray(tableDataObj)){
			var _tableDataObj = {}
			for(var i=0; i<tableDataObj.length; i++){
				_tableDataObj[tableDataObj[i].gid] = tableDataObj[i]
			}
			if(type == "programmerConfig"){
				runConfig.tab = _tableDataObj;
			}else{
				runConfig.tableData = _tableDataObj;
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
			// if(programmerIndex){
				if(programmerIndex.indexOf(productConfig.tableData[i].gid) > -1){
					productConfigArr.push(productConfig.tableData[i]);
					productConfigIndex.push(productConfig.tableData[i].gid);
				}
			// }else{
			// 	productConfigArr.push(productConfig.tableData[i]);
			// 	productConfigIndex.push(productConfig.tableData[i].gid);
			// }
			
		}
		productConfig.index = productConfigIndex;
		productConfig.tableData = productConfigArr;
	}
	return {
		programmerConfig : programmerConfig,
		productConfig : productConfig,
	}
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
// 添加objectState
pageProperty.addObjectState = function(source, saveData){
	if($.isEmptyObject(source)){
		for(var key in saveData){
			switch(key){
				case 'form':
				case 'formData':
					saveData[key].objectState = NSSAVEDATAFLAG.EDIT;
					break;
				case 'tab':
				case 'tableData':
					for(var gid in saveData[key]){
						saveData[key][gid].objectState = NSSAVEDATAFLAG.EDIT;
					}
					break;
			}
		}
		return saveData;
	}
	for(var key in saveData){
		switch(key){
			case 'form':
			case 'formData':
				var isEdit = false;
				if(typeof(source[key]) != typeof(saveData[key])){
					isEdit = true;
				}else{
					for(var attr in saveData[key]){
						if(saveData[key][attr] != source[key][attr]){
							isEdit = true;
							break;
						}
					}
				}
				if(isEdit){
					saveData[key].objectState = NSSAVEDATAFLAG.EDIT;
				}else{
					saveData[key].objectState = NSSAVEDATAFLAG.NULL;
				}
				break;
			case 'tab':
			case 'tableData':
				for(var gid in saveData[key]){
					if(typeof(source[key]) != 'object' || typeof(source[key][gid]) != 'object'){
						saveData[key][gid].objectState = NSSAVEDATAFLAG.ADD;
						continue;
					}
					var isEdit = false;
					for(var attr in saveData[key][gid]){
						if(saveData[key][gid][attr] != source[key][gid][attr] && attr != 'objectState'){
							isEdit = true;
							break;
						}
					}
					if(isEdit){
						saveData[key][gid].objectState = NSSAVEDATAFLAG.EDIT;
					}else{
						saveData[key][gid].objectState = NSSAVEDATAFLAG.NULL;
					}
				}
				for(var gid in source[key]){
					if(typeof(saveData[key][gid]) != 'object'){
						saveData[key][gid] = $.extend(true, {}, source[key][gid]);
						saveData[key][gid].objectState = NSSAVEDATAFLAG.DELETE;
						continue;
					}
				}
				break;
		}
	}
	return saveData;
}
// 格式化保存数据  
pageProperty.formatAjaxSaveData = function(obj){
	var _obj = {};
	var indexArr = [];
	for(var key in obj){
		if(typeof(obj[key]) == "object"){
			_obj[key] = {};
			for(var _key in obj[key]){
				switch(_key){
					case 'tableData':
					case 'tab':
						if($.isArray(obj[key][_key])){
							_obj[key][_key] = {};
							for(var i=0; i<obj[key][_key].length; i++){
								_obj[key][_key][obj[key][_key][i].gid] = obj[key][_key][i];
								indexArr.push(obj[key][_key][i].gid);
							}
						}else{
							_obj[key][_key] = obj[key][_key];
						}
						break;
					case 'formData':
					case 'form':
					case 'index':
					default:
						_obj[key][_key] = obj[key][_key];
						break;
				}
			}
			if((key == 'programmerConfig' || key == "productConfig") && !$.isArray(_obj[key].index)){
				_obj[key].index = indexArr;
			}
		}else{
			_obj[key] = obj[key];
		}
	}
	return _obj;
}
// 配置页面编辑器      
var pagePropertyVo = (function($){
	var config = {};
	//通用方法
	var commonManager = {
		name:'', //vo的名字
		treeData:{
			list:[],
			modal:[],
			controller:[], //all
		},
		fields:{
			treeSelect:{
				type:'treeSelect',
				textField:'name',
				valueField:'id',
				fullnameField:"fullName",
				column:6,
			},
			dataInput:{
				label:'请求参',
				type:'textarea',
				column:6,
			},
			text:{
				label:'id',
				type:'text',
				column:6,
			},
			label:{
				element:'label',
				width:'100%',
			},
			select2:{
				type:'select2',
				textField:'name',
				valueField:'id',
				multiple:true,
				subdata:[
					{ id : 'form', name : '表单' },
					{ id : 'table', name : '表格' },
				],
				column:6,
			},
			select:{
				type:'select',
				textField:'name',
				valueField:'id',
				subdata:[
					{ id : 'form', name : 'form' },
					{ id : 'table', name : 'table' },
				],
				column:6,
			},
			formSource:{
				type:'select',
				textField:'name',
				valueField:'id',
				subdata:[
					{ id : 'halfScreen', name : '半屏模式' },
					{ id : 'fullScreen', name : '全屏模式' },
					{ id : 'inlineScreen', name : '行内模式' },
					{ id : 'staticData', name : '功能模式' },
				],
				column:6,
			},
			isTree:{
				type:'radio',
				textField:'name',
				valueField:'id',
				value:true,
				subdata:[
					{ id : 'true', name : 'true' },
					{ id : 'false', name : 'false' },
				],
				column:6,
			},
			voSelect:{
				type:'select',
				textField:'name',
				valueField:'id',
				subdata:[],
				column:6,
			},
		},
		form:{
			id: 		'', 		//初始化时赋值
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true, 
		},
		defaultConfig:{
			ajax:{},
			field:[],
			btns:'',
			tableRowBtns:'',
			idField:'id',
			keyField:'children',
			title:'',
			add:{ type : 'dialog' },
			edit:{ type : 'dialog' },
			delete:{ type : 'confirm' },
		},
		// 方法参数 从思维导图配置获取的
		methodParameter:{
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
		},
		// 生成 list树，modal树，全部的树
		getTree: function(_sourceJson){
			// console.warn(_sourceJson);
			// this.getVOJson(_sourceJson);
			//_sourceJson json/object 页面基础数据，来源于导入的思维导图 或者 Vo接口
			if(typeof(_sourceJson)!='object'){
				console.error('页面基础数据 sourceJson 不存在');
				return false;
			}
			//第一层对象不是实体，只是名字
			var _objSourceJson;
			var sourceKey = '';
			for(key in _sourceJson){
				sourceKey = key; 	//名字 
				_objSourceJson = _sourceJson[key];
			}
			//需要输出的数据key
			var outputObjKey = [{key:'controller',level:2}];
			var sourceJson = {}; //需要处理的sourceJson 数据
			// 获取有效业务对象
			function setVaildObj(){
				for(var objName in _objSourceJson){
					var isOutput = true;
					if(nsMindjetToJS.getTags().businessFilterToSystem.indexOf(objName)>-1){
						isOutput = false;
					}
					if(typeof(_objSourceJson[objName])!='object'){
						isOutput = false;
					}
					if(isOutput){
						sourceJson[objName] = {};
					}
				}
			}
			setVaildObj();
			//获取业务对象中有效属性
			function setVaildAttr(){
				$.each(sourceJson, function(objName, _objData){
					//根据属处对象的名字生成有效属性的对象
					for(var keyI = 0; keyI < outputObjKey.length; keyI++){
						var sourceObjName = outputObjKey[keyI].key;
						var sourceObjLevel = outputObjKey[keyI].level;
						var sourceObjData = getJsonByLevel(_objSourceJson[objName][sourceObjName], sourceObjLevel);
						//是否存在有效属性的对象
						if(typeof(sourceObjData)=='object'){
							//有效属性的对象是否为空 不为空时进行赋值
							if($.isEmptyObject(sourceObjData)==false){
								_objData[sourceObjName] = sourceObjData;
							}
						}
					}
					//业务对象中没有效属性的对象 时 删除对象
					if($.isEmptyObject(_objData)){
						delete _objData;
					}
				});
			}
			setVaildAttr();
			// console.log(sourceJson);
			var validBusinessObj = {
				list:{},
				modal:{},
				controller:{}
			};
			// 获取下拉树对象 的 有效业务对象
			// treeType树的类型list/modal
			function setSelectTreeVaildObj(treeType,_sourceJson,_treeTypeObj,level){
				for(var objName in _sourceJson){
					switch(level){
						case 2:
							if(objName == 'controller'){
								var afterTreeObj = _treeTypeObj;
							}else{
								continue;
							}
							break;
						case 3:
							//第三层选择是否是stste/controller == treeType
							if(treeType == 'all'){
								_treeTypeObj[objName] = {};
								var afterTreeObj = _treeTypeObj[objName];
							}else{
								if(treeType != objName){
									continue;
								}else{
									var afterTreeObj = _treeTypeObj;
								}
							}
							break;
						default:
							_treeTypeObj[objName] = {};
							var afterTreeObj = _treeTypeObj[objName];
							break;
					}
					// 判断是否为对象 确定是否继续循环
					if(typeof(_sourceJson[objName])=="object"){
						// 判断是否为空对象 确定是否继续循环
						if($.isEmptyObject(_sourceJson[objName])==false){
							setSelectTreeVaildObj(treeType,_sourceJson[objName],afterTreeObj,level+1)
						}
					}
				}
			}
			setSelectTreeVaildObj("list",sourceJson,validBusinessObj.list,1);
			deleteNotValidBusinessObj(2,validBusinessObj.list);
			setSelectTreeVaildObj("modal",sourceJson,validBusinessObj.modal,1);
			deleteNotValidBusinessObj(2,validBusinessObj.modal);
			setSelectTreeVaildObj("all",sourceJson,validBusinessObj.controller,1);
			deleteNotValidBusinessObj(3,validBusinessObj.controller);
			// console.log(validBusinessObj);
			// 生成树节点open，name，id，parentName
			function getTreeNodes(sourceTreeObj,_treeArr,parentName,parentFullName){
				if(typeof(sourceTreeObj)!="object" || $.isEmptyObject(sourceTreeObj)){
					console.error("生成树对象不正确");
					return false;
				}
				var index = 0;
				for(var key in sourceTreeObj){
					_treeArr[index] = {};
					_treeArr[index].open = true;
					_treeArr[index].name = key;
					_treeArr[index].parent = parentName;
					// 判断parentFullName是否是第一个，第一个没有传值，所以不存在点
					if(typeof(parentFullName)=="string"){
						_treeArr[index].id = parentFullName + "." + key;
					}else{
						_treeArr[index].id = key;
					}
					// 判断是否为对象/或空对象 确定是否继续循环
					if(typeof(sourceTreeObj[key])=="object" && !$.isEmptyObject(sourceTreeObj[key])){
						_treeArr[index].children = [];
						getTreeNodes(sourceTreeObj[key],_treeArr[index].children,key,_treeArr[index].id);
					}
					index++ ;
				}
			}
			var treeObj = {
				list:[],
				modal:[],
				controller:[]
			}
			for(key in treeObj){
				getTreeNodes(validBusinessObj[key],treeObj[key],-1);
			}
			// 获得对象的某一层
			function getJsonByLevel(json, levelnum){
				if(typeof(json)!="object"){
					console.error('json对象不能为空');
					return false;
				}
				var returnJson = {};
				//var currentLevel = 0;
				function setValues(_returnJson, _json, _level){
					if(_level<levelnum){
						for(key in _json){
							if(typeof(_json[key])=='object'){
								_returnJson[key] = {};
								setValues(_returnJson[key], _json[key], _level+1 );
							}else{
								_returnJson[key] = _json[key];
								console.error('缺少下一层数据');
							}
						}
					}else{
						for(key in _json){
							if(typeof(_json[key])=='object'){
								_returnJson[key] = {};
							}else{
								_returnJson[key] = _json[key];
							}
						}
					}
				}
				setValues(returnJson, json, 1);
				// console.log(returnJson);
				return returnJson;
			}
			// 删除没有有效业务对象的父对象
			function deleteNotValidBusinessObj(levelnum,_validBusinessObj){
				var deleteName = '';
				function deleteFun(_levelnum,obj){
					for(var key in obj){
						if(_levelnum == 1){
							deleteName = key;
						}
						if(_levelnum < levelnum){
							if($.isEmptyObject(obj[key])){
								delete _validBusinessObj[deleteName];
							}else{
								deleteFun(_levelnum+1,obj[key]);
							}
						}
					}
				}
				deleteFun(1,_validBusinessObj);
			}
			// console.warn(treeObj);
			return treeObj;
		},
		getVoSelect:function(){
			var voList = config.voMapObj.vo;
			var voSelect = [];
			for(var voI=0;voI<voList.length;voI++){
				voSelect.push({
					id:voList[voI].id,
					name:voList[voI].voName + '_' + voList[voI].entityName,
				});
			}
			return voSelect;
		},
		//初始化方法
		init:function(){
			//初始化表单（id）
			this.form.id = config.formId;
			this.voSelect = this.getVoSelect();
			this.pageDetailsList = [];
		},
		// 根据value配置设置表单的显示隐藏
		setFormHideByValue:function(formArr, valueObj, isStandardTemplate){
			// 在标准模板（standardTemplate）中如果模板名字是：businessDataBaseEditor（基本业务对象编辑）那么saveData显示其它情况下不显示配置
			isStandardTemplate = typeof(isStandardTemplate)=="boolean"?isStandardTemplate:false; // 是否是标准模板 默认不是
			if(isStandardTemplate){
				var isHide = true;
				if(valueObj.template == "businessDataBaseEditor" || valueObj.template == "businessDataBaseEditorMobile"){
					isHide = false;
				}
				for(index=0;index<formArr.length;index++){
					switch(formArr[index].id){
						case 'saveData-src':
						case 'saveData-data':
							formArr[index].hidden = isHide;
							break;
					}
				}
				// 标准模板不需要getValueAjax和saveData的label提示
				for(index=0;index<formArr.length;index++){
					if(formArr[index].element == "label"){
						formArr.splice(index,1);
					}
				}
			}
		},
		// 为form数组设置value
		defaultValueInFormArr:function(formArr, valueObj, isStandardTemplate){
			for(index=0;index<formArr.length;index++){
				if(valueObj[formArr[index].id]){
					formArr[index].value = valueObj[formArr[index].id];
				}
			}
		},
		// 根据voList获得voId并刷新voId输入框 隐藏域 values：地址下拉树 clickCallback点击回调函数的返回值
		setVoIdHideAreaByVoList:function(values,id){
			// 根据values获得vo的id
			var voId = commonManager.getVoIdByVoName(values);
			var idArr = id.split('-');
			var voID = '';
			for(var idI=3;idI<idArr.length-1;idI++){
				voID += idArr[idI] + '-';
			}
			voID += 'voId';
			var fieldConfig = {
				id:     	voID,
				value: 		'',
			}
			if(voId){
				fieldConfig.value = voId;
				nsForm.edit([fieldConfig],idArr[1]+'-'+idArr[2]);
			}else{
				nsForm.edit([fieldConfig],idArr[1]+'-'+idArr[2]);
				console.log(config.voMapObj.vo);
				console.log(values);
				nsAlert('没有找到vo','error');
			}
		},
		// 根据选择的地址获得voId并刷新voId输入框 隐藏域 values：地址下拉树 clickCallback点击回调函数的返回值
		setVoIdHideAreaBySrc:function(values){
			// 根据values获得vo的id
			var voId = commonManager.getVoIdByMethodId(values.id);
			if(voId){
				var treeId = values.treeId;
				var treeIdArr = treeId.split('-');
				var voID = '';
				for(var idI=3;idI<treeIdArr.length-2;idI++){
					voID += treeIdArr[idI] + '-';
				}
				voID += 'voId';
				var fieldConfig = {
					id:     	voID,
					value: 		voId,
				}
				nsForm.edit([fieldConfig],treeIdArr[1]+'-'+treeIdArr[2]);
			}else{
				nsAlert('没有找到vo');
			}
		},
		// 获得树 添加空选项
		getTreeAddNull:function(_treeData){
			var treeData = $.extend(true,[],_treeData);
			// 添加删除的空白
			var fullTreeArr = [{
				open:true,
				name:'无',
				id:'',
				parent:-1,
				fullName:'',
			}];
			for(var treI=0;treI<treeData.length;treI++){
				fullTreeArr.push(treeData[treI]);
			}
			return fullTreeArr;
		},
		// 获得模板编辑表单
		getForm:function(formAttr,isTree){
			var fieldsArray = [];
			//输出所有面板
			for(var panelI = 0; panelI<formAttr.panels.length; panelI++){
				var panelAttr = formAttr.panels[panelI];
				//输出标题
				var labelField = $.extend(true, {}, this.fields.label);
				labelField.label = panelAttr.label;
				fieldsArray.push(labelField);
				switch(panelAttr.type){
					case 'base':
						// 包名
						var packageField = $.extend(true, {}, this.fields.text);
						packageField.id = panelAttr.id;
						packageField.label = '包名';
						packageField.column = 6;
						packageField.required = true;
						fieldsArray.push(packageField);
						// 是否来源树
						if(panelAttr.isTree){
							var isTreeField = $.extend(true, {}, this.fields.isTree);
							isTreeField.id = 'isSourceTree';
							isTreeField.label = '是否来源树';
							isTreeField.column = 6;
							fieldsArray.push(isTreeField);
						}
						// 是否需要选择模板
						if(panelAttr.isSelectTemplate){
							var templateField = $.extend(true, {}, this.fields.select);
							templateField.id = 'template';
							templateField.label = '模板名字';
							templateField.column = 6;
							templateField.subdata = $.extend(true, [], standardTemplateManager.templateNameList);
							templateField.changeHandler = function(value){
								standardTemplateManager.positionName = value;
								// 当value是businessDataBaseEditor即：基本业务对象编辑时存在saveData配置其它情况不存在
								var isHideSaveData = true;
								if(value == "businessDataBaseEditor" || value == "businessDataBaseEditorMobile"){
									isHideSaveData = false;
								}
								var editArr = [
									{
										id : "saveData-src",
										hidden : isHideSaveData,
									},{
										id : "saveData-data",
										hidden : isHideSaveData,
									}
								];
								nsForm.edit(editArr,this.formID);
							};
							fieldsArray.push(templateField);
						}
						break;
					case 'table':
						panelAttr.tableType = typeof(panelAttr.tableType) == 'string'?panelAttr.tableType:'table';
						// 选择vo
						var tableVoField = $.extend(true, {}, this.fields.voSelect);
						tableVoField.id = panelAttr.id + '-voId';
						tableVoField.label = panelAttr.label + ' vo';
						tableVoField.subdata = this.voSelect;
						tableVoField.hidden = true;
						if(panelAttr.id == '' || panelAttr.tableType == 'child'){
							tableVoField.hidden = false;
						}
						fieldsArray.push(tableVoField);
						// 默认有ajax配置
						panelAttr.isAjax = typeof(panelAttr.isAjax) != 'undefined' ? panelAttr.isAjax : true;
						// type类型
						var tableTypeField = $.extend(true, {}, this.fields.select);
						tableTypeField.id = panelAttr.id + '-type';
						tableTypeField.label = panelAttr.label + ' 类型';
						if(panelAttr.isType){
							fieldsArray.push(tableTypeField);
						}
						// 表单模式
						var formFormSource = $.extend(true, {}, this.fields.formSource);
						formFormSource.id = panelAttr.id + '-formSource';
						formFormSource.label = panelAttr.label + ' 表单模式';
						if(panelAttr.isType){
							fieldsArray.push(formFormSource);
						}
						// 表格id
						var tableIdTextField = $.extend(true, {}, this.fields.text);
						tableIdTextField.id = panelAttr.id + '-idField';
						tableIdTextField.label = panelAttr.label + ' 主键';
						// 是否必填
						if(panelAttr.isRequired){
							tableIdTextField.rules = 'required';
						}
						fieldsArray.push(tableIdTextField);
						// 表格volist
						var tableVolistTextField = $.extend(true, {}, this.fields.text);
						tableVolistTextField.id = panelAttr.id + '-keyField';
						tableVolistTextField.label = panelAttr.label + ' voList';
						// 是否必填
						if(panelAttr.isRequired){
							// tableVolistTextField.rules = 'required';
						}
						// switch(panelAttr.tableType){
						// 	case 'child':
						// 		tableVolistTextField.changeHandler = function(values){
						// 			commonManager.setVoIdHideAreaByVoList(values,this.fullID);
						// 		};
						// 		break;
						// 	default:
						// 		break;
						// }
						fieldsArray.push(tableVolistTextField);
						// 表格主体
						var treeSelectField = $.extend(true, {}, this.fields.treeSelect);
						treeSelectField.id = panelAttr.id + '-src';
						treeSelectField.label = panelAttr.label + ' 地址';
						treeSelectField.subdata = commonManager.getTreeAddNull(this.treeData[panelAttr.dataType]);
						switch(panelAttr.tableType){
							case 'child':
								break;
							default:
								treeSelectField.clickCallback = function(values){
									commonManager.setVoIdHideAreaBySrc(values);
								};
								break;
						}
						// 是否必填
						if(panelAttr.isRequired){
							treeSelectField.rules = 'required';
						}
						if(panelAttr.isAjax){
							fieldsArray.push(treeSelectField);
						}
						//ajax的data参数
						var dataInputField = $.extend(true, {}, this.fields.dataInput);
						dataInputField.id = panelAttr.id + '-data';
						dataInputField.label = panelAttr.label + ' 传参';
						dataInputField.value = '{}';
						if(panelAttr.isAjax){
							fieldsArray.push(dataInputField);
						}
						//表格按钮
						var tableBtnsField = $.extend(true, {}, this.fields.treeSelect);
						tableBtnsField.id = panelAttr.id + '-btns';
						tableBtnsField.label = panelAttr.label + ' 外部按钮';
						tableBtnsField.subdata = this.treeData.controller;
						tableBtnsField.isCheck = true;
						fieldsArray.push(tableBtnsField);
						//表格行内按钮
						var tableRowBtnsField = $.extend(true, {}, this.fields.treeSelect);
						tableRowBtnsField.id = panelAttr.id + '-tableRowBtns';
						tableRowBtnsField.label = panelAttr.label + ' 行内按钮';
						tableRowBtnsField.subdata = this.treeData.controller;
						tableRowBtnsField.isCheck = true;
						fieldsArray.push(tableRowBtnsField);
						break;
					case 'saveData':
						// saveData配置
						var saveDataField = $.extend(true, {}, this.fields.treeSelect);
						saveDataField.id = panelAttr.id + '-src';
						saveDataField.label = panelAttr.label + ' 地址';
						saveDataField.subdata = commonManager.getTreeAddNull(this.treeData[panelAttr.dataType]);
						// 是否必填
						if(panelAttr.isRequired){
							saveDataField.rules = 'required';
						}
						fieldsArray.push(saveDataField);
						//ajax的data参数
						var saveDataDataInputField = $.extend(true, {}, this.fields.dataInput);
						saveDataDataInputField.id = panelAttr.id + '-data';
						saveDataDataInputField.label = panelAttr.label + ' 传参';
						saveDataDataInputField.value = '{}';
						fieldsArray.push(saveDataDataInputField);
						break;
					case 'getValueAjax':
						// getValueAjax配置
						var getValueAjaxField = $.extend(true, {}, this.fields.treeSelect);
						getValueAjaxField.id = panelAttr.id + '-src';
						getValueAjaxField.label = panelAttr.label + ' 地址';
						getValueAjaxField.column = 4;
						getValueAjaxField.subdata = commonManager.getTreeAddNull(this.treeData[panelAttr.dataType]);
						// 是否必填
						if(panelAttr.isRequired){
							getValueAjaxField.rules = 'required';
						}
						fieldsArray.push(getValueAjaxField);
						//ajax的data参数
						var getValueAjaxInputField = $.extend(true, {}, this.fields.dataInput);
						getValueAjaxInputField.id = panelAttr.id + '-data';
						getValueAjaxInputField.label = panelAttr.label + ' 传参';
						getValueAjaxInputField.value = '{}';
						getValueAjaxInputField.column = 4;
						fieldsArray.push(getValueAjaxInputField);
						//ajax的data参数
						var suffixInputField = $.extend(true, {}, this.fields.text);
						suffixInputField.id = panelAttr.id + '-suffix';
						suffixInputField.label = panelAttr.label + ' url后缀';
						suffixInputField.column = 4;
						fieldsArray.push(suffixInputField);
						break;
					case 'form':
						// 选择vo
						var formVoField = $.extend(true, {}, this.fields.voSelect);
						// var formVoField = $.extend(true, {}, this.fields.text);
						formVoField.id = panelAttr.id + '-voId';
						formVoField.label = panelAttr.label + ' vo';
						formVoField.subdata = this.voSelect;
						formVoField.hidden = true;
						if(panelAttr.id == ''){
							formVoField.hidden = false;
						}
						if(!panelAttr.isHaveAjax && panelAttr.isShowVoId){
							formVoField.hidden = false;
						}
						fieldsArray.push(formVoField);
						// 表单id
						var formIdTextField = $.extend(true, {}, this.fields.text);
						formIdTextField.id = panelAttr.id + '-idField';
						formIdTextField.label = panelAttr.label + ' 主键';
						// 是否必填
						if(panelAttr.isRequired){
							formIdTextField.rules = 'required';
						}
						fieldsArray.push(formIdTextField);
						// 表单formSource
						var formFormSource = $.extend(true, {}, this.fields.formSource);
						formFormSource.id = panelAttr.id + '-formSource';
						formFormSource.label = panelAttr.label + ' 表单模式';
						fieldsArray.push(formFormSource);
						// 表单volist
						var formVolistTextField = $.extend(true, {}, this.fields.text);
						formVolistTextField.id = panelAttr.id + '-keyField';
						formVolistTextField.label = panelAttr.label + ' voList';
						// 是否必填
						if(panelAttr.isRequired){
							// formVolistTextField.rules = 'required';
						}
						fieldsArray.push(formVolistTextField);
						// 表单主体
						var formSelectField = $.extend(true, {}, this.fields.treeSelect);
						formSelectField.id = panelAttr.id + '-src';
						formSelectField.label = panelAttr.label + ' 地址';
						formSelectField.subdata = commonManager.getTreeAddNull(this.treeData[panelAttr.dataType]);
						formSelectField.clickCallback = function(values){
							commonManager.setVoIdHideAreaBySrc(values);
						};
						// 是否必填
						if(panelAttr.isRequired){
							formSelectField.rules = 'required';
						}
						if(panelAttr.isHaveAjax){
							fieldsArray.push(formSelectField);
						}
						//ajax的data参数
						var formDataField = $.extend(true, {}, this.fields.dataInput);
						formDataField.id = panelAttr.id + '-data';
						formDataField.label = panelAttr.label + ' 传参';
						formDataField.value = '{}';
						if(panelAttr.isHaveAjax){
							fieldsArray.push(formDataField);
						}
						//表单按钮
						var formBtnsField = $.extend(true, {}, this.fields.treeSelect);
						formBtnsField.id = panelAttr.id + '-btns';
						formBtnsField.label = panelAttr.label + ' 外部';
						formBtnsField.subdata = this.treeData.controller;
						formBtnsField.isCheck = true;
						if(panelAttr.isHaveBtns){
							fieldsArray.push(formBtnsField);
						}
						break;
					case 'tree':
						// 选择vo
						var treeVoField = $.extend(true, {}, this.fields.voSelect);
						// var treeVoField = $.extend(true, {}, this.fields.text);
						treeVoField.id = panelAttr.id + '-voId';
						treeVoField.label = panelAttr.label + ' vo';
						treeVoField.subdata = this.voSelect;
						treeVoField.hidden = true;
						if(panelAttr.id == ''){
							treeVoField.hidden = false;
						}
						fieldsArray.push(treeVoField);
						// 树id
						var treeIdTextField = $.extend(true, {}, this.fields.text);
						treeIdTextField.id = panelAttr.id + '-idField';
						treeIdTextField.label = panelAttr.label + ' 主键';
						fieldsArray.push(treeIdTextField);
						// 树父节点
						var treeParentIdField = $.extend(true, {}, this.fields.text);
						treeParentIdField.id = panelAttr.id + '-parentIdField';
						treeParentIdField.label = panelAttr.label + ' 父id';
						fieldsArray.push(treeParentIdField);
						// 树textField
						var treeTextField = $.extend(true, {}, this.fields.text);
						treeTextField.id = panelAttr.id + '-textField';
						treeTextField.label = panelAttr.label + ' 文本值';
						fieldsArray.push(treeTextField);
						// 树valueField
						var treeValueField = $.extend(true, {}, this.fields.text);
						treeValueField.id = panelAttr.id + '-valueField';
						treeValueField.label = panelAttr.label + ' 字段id';
						fieldsArray.push(treeValueField);
						// 树src
						var treeSrcField = $.extend(true, {}, this.fields.treeSelect);
						treeSrcField.id = panelAttr.id + '-src';
						treeSrcField.label = panelAttr.label + ' 地址';
						treeSrcField.required = 'required';
						treeSrcField.subdata = commonManager.getTreeAddNull(this.treeData[panelAttr.dataType]);
						treeSrcField.clickCallback = function(values){
							commonManager.setVoIdHideAreaBySrc(values);
						};
						fieldsArray.push(treeSrcField);
						// 树data
						var treeDataField = $.extend(true, {}, this.fields.text);
						treeDataField.id = panelAttr.id + '-data';
						treeDataField.label = panelAttr.label + ' 传参';
						fieldsArray.push(treeDataField);
						// 树按钮
						var treeBtnsField = $.extend(true, {}, this.fields.treeSelect);
						treeBtnsField.id = panelAttr.id + '-btns';
						treeBtnsField.label = panelAttr.label + ' 外部按钮';
						treeBtnsField.subdata = this.treeData.controller;
						treeBtnsField.isCheck = true;
						fieldsArray.push(treeBtnsField);
						// 树表单或表格
						var treeConfigField = $.extend(true, {}, this.fields.select2);
						treeConfigField.id = panelAttr.id + '-config';
						treeConfigField.label = panelAttr.label + ' 配置类型';
						treeConfigField.changeHandler = function(id,value){
							treeTableManager.refreshTreeConfig(id);
						};
						fieldsArray.push(treeConfigField);
						break;
					case 'mobileForm':
						// 选择vo
						var formVoField = $.extend(true, {}, this.fields.voSelect);
						formVoField.id = panelAttr.id + '-voId';
						formVoField.label = panelAttr.label + ' vo';
						formVoField.subdata = this.voSelect;
						fieldsArray.push(formVoField);
						// type类型
						var formTypeField = $.extend(true, {}, this.fields.select);
						formTypeField.subdata = [
							{
								id: 'simple',
								name: 'simple',
							},{
								id: 'btn',
								name: 'btn',
							}
						]
						formTypeField.id = panelAttr.id + '-type';
						formTypeField.label = panelAttr.label + ' 类型';
						formTypeField.rules = 'required';
						fieldsArray.push(formTypeField);
						// 表单formSource
						var formFormSource = $.extend(true, {}, this.fields.formSource);
						formFormSource.id = panelAttr.id + '-formSource';
						formFormSource.label = panelAttr.label + ' 表单模式';
						fieldsArray.push(formFormSource);
						// 表单id
						var formIdTextField = $.extend(true, {}, this.fields.text);
						formIdTextField.id = panelAttr.id + '-idField';
						formIdTextField.label = panelAttr.label + ' 主键';
						fieldsArray.push(formIdTextField);
						// 表单volist
						var formVolistTextField = $.extend(true, {}, this.fields.text);
						formVolistTextField.id = panelAttr.id + '-keyField';
						formVolistTextField.label = panelAttr.label + ' voList';
						fieldsArray.push(formVolistTextField);
						// 表单isRoot
						var isRootRadioField = $.extend(true, {}, this.fields.isTree);
						isRootRadioField.id = panelAttr.id + '-isRoot';
						isRootRadioField.label = panelAttr.label + ' 是否作为根';
						fieldsArray.push(isRootRadioField);
						// 表单parentKeyField
						var parentKeyFieldTextField = $.extend(true, {}, this.fields.text);
						parentKeyFieldTextField.id = panelAttr.id + '-parentKeyField';
						parentKeyFieldTextField.label = panelAttr.label + ' 父volist';
						fieldsArray.push(parentKeyFieldTextField);
						break;
					case 'btns':
						//表单按钮
						var formBtnsField = $.extend(true, {}, this.fields.treeSelect);
						formBtnsField.id = 'btns';
						formBtnsField.label = panelAttr.label + ' 外部';
						formBtnsField.subdata = this.treeData.controller;
						formBtnsField.isCheck = true;
						fieldsArray.push(formBtnsField);
						break;
					case 'standard':
						var panelAttrIdStr = panelAttr.id;
						if(panelAttr.id!=""){
							panelAttrIdStr += "-";
						}
						// type类型
						var typeField = $.extend(true, {}, this.fields.select);
						typeField.id = panelAttrIdStr + 'type';
						typeField.label = panelAttr.label + ' 类型';
						typeField.rules = 'required';
						typeField.subdata = [
							{ id : 'vo', name : 'vo'},
							{ id : 'list', name : 'list'},
							{ id : 'tree', name : 'tree'},
							{ id : 'btns', name : 'btns'},
							{ id : 'class', name : 'class'},
							{ id : 'tab', name : 'tab'},
							{ id : 'uploadCover', name : 'uploadCover'},
							{ id : 'blockList', name : 'blockList'},
							{ id : 'customize', name : 'customize'},
							{ id : 'pie', name : 'pie'},
							{ id : 'line', name : 'line'},
							{ id : 'bar', name : 'bar'},
							{ id : 'resultinput', name : 'resultinput'},
							{ id : 'pdfList', name : 'pdfList'},
							{ id : 'recordList', name : 'recordList'},
						];
						typeField.changeHandler = function(value){
							if(value == ""){
								return;
							}
							var editArr = standardTemplateManager.type[value];
							nsForm.edit(editArr, this.formID);
						}
						fieldsArray.push(typeField);
						// params
						var paramsField = $.extend(true, {}, this.fields.dataInput);
						paramsField.id = panelAttrIdStr + 'params';
						paramsField.label = panelAttr.label + ' params';
						fieldsArray.push(paramsField);
						// vo
						var tableVoField = $.extend(true, {}, this.fields.voSelect);
						tableVoField.id = panelAttrIdStr + 'voId';
						tableVoField.label = panelAttr.label + ' vo';
						tableVoField.subdata = this.voSelect;
						fieldsArray.push(tableVoField);
						// field
						var fieldField = $.extend(true, {}, this.fields.text);
						fieldField.id = panelAttrIdStr + 'field';
						fieldField.label = panelAttr.label + ' field';
						fieldsArray.push(fieldField);
						// id
						var idFieldTextField = $.extend(true, {}, this.fields.text);
						idFieldTextField.id = panelAttrIdStr + 'idField';
						idFieldTextField.label = panelAttr.label + ' 主键';
						fieldsArray.push(idFieldTextField);
						// keyField
						var keyFieldTextField = $.extend(true, {}, this.fields.text);
						keyFieldTextField.id = panelAttrIdStr + 'keyField';
						keyFieldTextField.label = panelAttr.label + ' keyField';
						fieldsArray.push(keyFieldTextField);
						// textField
						var textFieldTextField = $.extend(true, {}, this.fields.text);
						textFieldTextField.id = panelAttrIdStr + 'textField';
						textFieldTextField.label = panelAttr.label + ' textField';
						fieldsArray.push(textFieldTextField);
						// valueField
						var valueFieldTextField = $.extend(true, {}, this.fields.text);
						valueFieldTextField.id = panelAttrIdStr + 'valueField';
						valueFieldTextField.label = panelAttr.label + ' valueField';
						fieldsArray.push(valueFieldTextField);
						// pidField
						var pidFieldTextField = $.extend(true, {}, this.fields.text);
						pidFieldTextField.id = panelAttrIdStr + 'pidField';
						pidFieldTextField.label = panelAttr.label + ' pidField';
						fieldsArray.push(pidFieldTextField);
						// childField
						var childFieldTextField = $.extend(true, {}, this.fields.text);
						childFieldTextField.id = panelAttrIdStr + 'childField';
						childFieldTextField.label = panelAttr.label + ' childField';
						fieldsArray.push(childFieldTextField);
						// parent
						var parentField = $.extend(true, {}, this.fields.text);
						parentField.id = panelAttrIdStr + 'parent';
						parentField.label = panelAttr.label + ' parent';
						fieldsArray.push(parentField);
						// position
						var positionField = $.extend(true, {}, this.fields.select);
						positionField.id = panelAttrIdStr + 'position';
						positionField.label = panelAttr.label + ' position';
						positionField.subdata = standardTemplateManager.position[standardTemplateManager.positionName];
						fieldsArray.push(positionField);
						// isSearch
						var isSearchField = $.extend(true, {}, this.fields.isTree);
						isSearchField.id = panelAttrIdStr + 'isSearch';
						isSearchField.label = panelAttr.label + ' isSearch';
						isSearchField.value = 'false';
						fieldsArray.push(isSearchField);
						// nameField
						var nameFieldField = $.extend(true, {}, this.fields.text);
						nameFieldField.id = panelAttrIdStr + 'nameField';
						nameFieldField.label = panelAttr.label + ' nameField';
						fieldsArray.push(nameFieldField);
						// fileField
						var fileFieldField = $.extend(true, {}, this.fields.text);
						fileFieldField.id = panelAttrIdStr + 'fileField';
						fileFieldField.label = panelAttr.label + ' fileField';
						fieldsArray.push(fileFieldField);
						// templatePanel
						var templatePanelField = $.extend(true, {}, this.fields.text);
						templatePanelField.id = panelAttrIdStr + 'templatePanel';
						templatePanelField.label = panelAttr.label + ' templatePanel';
						fieldsArray.push(templatePanelField);
						// 按钮
						var btnsField = $.extend(true, {}, this.fields.treeSelect);
						btnsField.id = panelAttrIdStr + 'btns';
						btnsField.label = panelAttr.label + ' 按钮';
						btnsField.subdata = this.treeData.controller;
						btnsField.isCheck = true;
						btnsField.hidden = true;
						fieldsArray.push(btnsField);
						// ajax-url
						var treeSelectField = $.extend(true, {}, this.fields.treeSelect);
						treeSelectField.id = 'ajax-src';
						treeSelectField.label = panelAttr.label + ' 地址';
						treeSelectField.subdata = commonManager.getTreeAddNull(this.treeData[panelAttr.dataType]);
						fieldsArray.push(treeSelectField);
						// ajax-url
						var treeAjaxUrlField = $.extend(true, {}, this.fields.text);
						treeAjaxUrlField.id = 'ajax-url';
						treeAjaxUrlField.label = panelAttr.label + ' 地址';
						fieldsArray.push(treeAjaxUrlField);
						// ajax的data参数
						var dataInputField = $.extend(true, {}, this.fields.dataInput);
						dataInputField.id = 'ajax-data';
						dataInputField.label = panelAttr.label + ' 传参';
						dataInputField.value = '{}';
						fieldsArray.push(dataInputField);
						// ajax-type
						var treeAjaxTypeField = $.extend(true, {}, this.fields.select);
						treeAjaxTypeField.id = 'ajax-type';
						treeAjaxTypeField.label = panelAttr.label + ' ajaxType';
						treeAjaxTypeField.subdata = [
							{id : 'GET', name : 'GET'},
							{id : 'POST', name : 'POST'},
						];
						fieldsArray.push(treeAjaxTypeField);
						// ajax-dataSrc
						var treeAjaxDataSrcField = $.extend(true, {}, this.fields.text);
						treeAjaxDataSrcField.id = 'ajax-dataSrc';
						treeAjaxDataSrcField.label = panelAttr.label + ' ajaxDataSrc';
						fieldsArray.push(treeAjaxDataSrcField);
						// ajax-contentType
						var treeAjaxContentTypeField = $.extend(true, {}, this.fields.text);
						treeAjaxContentTypeField.id = 'ajax-contentType';
						treeAjaxContentTypeField.label = panelAttr.label + ' ajaxContentType';
						fieldsArray.push(treeAjaxContentTypeField);
						// deleteAjax-url
						var deletetreeSelectField = $.extend(true, {}, this.fields.treeSelect);
						deletetreeSelectField.id = 'deleteAjax-src';
						deletetreeSelectField.label = panelAttr.label + ' delete地址';
						deletetreeSelectField.subdata = commonManager.getTreeAddNull(this.treeData[panelAttr.dataType]);
						fieldsArray.push(deletetreeSelectField);
						// deleteAjax-url
						var deleteAjaxUrlField = $.extend(true, {}, this.fields.text);
						deleteAjaxUrlField.id = 'deleteAjax-url';
						deleteAjaxUrlField.label = panelAttr.label + ' 删除地址';
						fieldsArray.push(deleteAjaxUrlField);
						// deleteAjax的data参数
						var deletedataInputField = $.extend(true, {}, this.fields.dataInput);
						deletedataInputField.id = 'deleteAjax-data';
						deletedataInputField.label = panelAttr.label + ' 删除传参';
						deletedataInputField.value = '{}';
						fieldsArray.push(deletedataInputField);
						// deleteAjax-type
						var deleteTypeField = $.extend(true, {}, this.fields.select);
						deleteTypeField.id = 'deleteAjax-type';
						deleteTypeField.label = panelAttr.label + ' 删除type';
						deleteTypeField.subdata = [
							{id : 'GET', name : 'GET'},
							{id : 'POST', name : 'POST'},
						];
						fieldsArray.push(deleteTypeField);
						// deleteAjax-dataSrc
						var deleteAjaxDataSrcField = $.extend(true, {}, this.fields.text);
						deleteAjaxDataSrcField.id = 'deleteAjax-dataSrc';
						deleteAjaxDataSrcField.label = panelAttr.label + ' 删除dataSrc';
						fieldsArray.push(deleteAjaxDataSrcField);
						// deleteAjax-contentType
						var deleteAjaxContentTypeField = $.extend(true, {}, this.fields.text);
						deleteAjaxContentTypeField.id = 'deleteAjax-contentType';
						deleteAjaxContentTypeField.label = panelAttr.label + ' 删除contentType';
						fieldsArray.push(deleteAjaxContentTypeField);

						// 树
						// parentField
						var parentField = $.extend(true, {}, this.fields.text);
						parentField.id = panelAttrIdStr + 'parentField';
						parentField.label = panelAttr.label + ' parent字段';
						parentField.value = '';
						fieldsArray.push(parentField);
						// sortField
						var sortField = $.extend(true, {}, this.fields.text);
						sortField.id = panelAttrIdStr + 'sortField';
						sortField.label = panelAttr.label + ' 排序字段';
						sortField.value = '';
						// fieldsArray.push(sortField);
						// fromField
						var fromFieldField = $.extend(true, {}, this.fields.text);
						fromFieldField.id = panelAttrIdStr + 'fromField';
						fromFieldField.label = panelAttr.label + ' fromField';
						fromFieldField.value = '';
						fieldsArray.push(fromFieldField);
						// level
						var levelField = $.extend(true, {}, this.fields.text);
						levelField.id = panelAttrIdStr + 'level';
						levelField.label = panelAttr.label + ' 展开层级';
						levelField.value = '0';
						fieldsArray.push(levelField);
						// unfieldId
						var unfieldIdField = $.extend(true, {}, this.fields.text);
						unfieldIdField.id = panelAttrIdStr + 'unfieldId';
						unfieldIdField.label = panelAttr.label + ' 未分类id';
						unfieldIdField.value = '-1';
						fieldsArray.push(unfieldIdField);
						// unfieldText
						var unfieldTextField = $.extend(true, {}, this.fields.text);
						unfieldTextField.id = panelAttrIdStr + 'unfieldText';
						unfieldTextField.label = panelAttr.label + ' 未分类name';
						unfieldTextField.value = '未分类';
						fieldsArray.push(unfieldTextField);
						// allfieldId
						var allfieldIdField = $.extend(true, {}, this.fields.text);
						allfieldIdField.id = panelAttrIdStr + 'allfieldId';
						allfieldIdField.label = panelAttr.label + ' 全部id';
						allfieldIdField.value = '';
						fieldsArray.push(allfieldIdField);
						// allfieldText
						var allfieldTextField = $.extend(true, {}, this.fields.text);
						allfieldTextField.id = panelAttrIdStr + 'allfieldText';
						allfieldTextField.label = panelAttr.label + ' 全部name';
						allfieldTextField.value = '全部';
						fieldsArray.push(allfieldTextField);
						// readonly
						var readonlyField = $.extend(true, {}, this.fields.isTree);
						readonlyField.id = panelAttrIdStr + 'readonly';
						readonlyField.label = panelAttr.label + ' readonly';
						readonlyField.value = 'false';
						fieldsArray.push(readonlyField);
						// isMultiple
						var isMultipleField = $.extend(true, {}, this.fields.isTree);
						isMultipleField.id = panelAttrIdStr + 'isMultiple';
						isMultipleField.label = panelAttr.label + ' 是否多选';
						isMultipleField.value = 'false';
						// fieldsArray.push(isMultipleField);
						// isAutoSave
						var isAutoSaveField = $.extend(true, {}, this.fields.isTree);
						isAutoSaveField.id = panelAttrIdStr + 'isAutoSave';
						isAutoSaveField.label = panelAttr.label + ' 是否自动保存';
						isAutoSaveField.value = 'false';
						// fieldsArray.push(isAutoSaveField);
						// isTurnTree
						var isTurnTreeField = $.extend(true, {}, this.fields.isTree);
						isTurnTreeField.id = panelAttrIdStr + 'isTurnTree';
						isTurnTreeField.label = panelAttr.label + ' 是否需要转化树';
						isTurnTreeField.value = 'true';
						// fieldsArray.push(isTurnTreeField);
						// addAjax-url
						var addAjaxUrlField = $.extend(true, {}, this.fields.text);
						addAjaxUrlField.id = 'addAjax-url';
						addAjaxUrlField.label = panelAttr.label + ' 新增地址';
						fieldsArray.push(addAjaxUrlField);
						// addAjax的data参数
						var addataInputField = $.extend(true, {}, this.fields.dataInput);
						addataInputField.id = 'addAjax-data';
						addataInputField.label = panelAttr.label + ' 新增传参';
						addataInputField.value = '{}';
						fieldsArray.push(addataInputField);
						// addAjax-type
						var addTypeField = $.extend(true, {}, this.fields.select);
						addTypeField.id = 'addAjax-type';
						addTypeField.label = panelAttr.label + ' 新增type';
						addTypeField.subdata = [
							{id : 'GET', name : 'GET'},
							{id : 'POST', name : 'POST'},
						];
						fieldsArray.push(addTypeField);
						// addAjax-dataSrc
						var addAjaxDataSrcField = $.extend(true, {}, this.fields.text);
						addAjaxDataSrcField.id = 'addAjax-dataSrc';
						addAjaxDataSrcField.label = panelAttr.label + ' 新增dataSrc';
						fieldsArray.push(addAjaxDataSrcField);
						// addAjax-contentType
						var addAjaxContentTypeField = $.extend(true, {}, this.fields.text);
						addAjaxContentTypeField.id = 'addAjax-contentType';
						addAjaxContentTypeField.label = panelAttr.label + ' 新增contentType';
						fieldsArray.push(addAjaxContentTypeField);

						// editAjax-url
						var editAjaxUrlField = $.extend(true, {}, this.fields.text);
						editAjaxUrlField.id = 'editAjax-url';
						editAjaxUrlField.label = panelAttr.label + ' 修改地址';
						fieldsArray.push(editAjaxUrlField);
						// editAjax的data参数
						var editAjaxdataInputField = $.extend(true, {}, this.fields.dataInput);
						editAjaxdataInputField.id = 'editAjax-data';
						editAjaxdataInputField.label = panelAttr.label + ' 修改传参';
						editAjaxdataInputField.value = '{}';
						fieldsArray.push(editAjaxdataInputField);
						// editAjax-type
						var editAjaxTypeField = $.extend(true, {}, this.fields.select);
						editAjaxTypeField.id = 'editAjax-type';
						editAjaxTypeField.label = panelAttr.label + ' 修改type';
						editAjaxTypeField.subdata = [
							{id : 'GET', name : 'GET'},
							{id : 'POST', name : 'POST'},
						];
						fieldsArray.push(editAjaxTypeField);
						// editAjax-dataSrc
						var editAjaxDataSrcField = $.extend(true, {}, this.fields.text);
						editAjaxDataSrcField.id = 'editAjax-dataSrc';
						editAjaxDataSrcField.label = panelAttr.label + ' 修改dataSrc';
						fieldsArray.push(editAjaxDataSrcField);
						// editAjax-contentType
						var editAjaxContentTypeField = $.extend(true, {}, this.fields.text);
						editAjaxContentTypeField.id = 'editAjax-contentType';
						editAjaxContentTypeField.label = panelAttr.label + ' 修改contentType';
						fieldsArray.push(editAjaxContentTypeField);

						// moveAjax-url
						var moveAjaxUrlField = $.extend(true, {}, this.fields.text);
						moveAjaxUrlField.id = 'moveAjax-url';
						moveAjaxUrlField.label = panelAttr.label + ' 移动地址';
						fieldsArray.push(moveAjaxUrlField);
						// moveAjax的data参数
						var moveAjaxdataInputField = $.extend(true, {}, this.fields.dataInput);
						moveAjaxdataInputField.id = 'moveAjax-data';
						moveAjaxdataInputField.label = panelAttr.label + ' 移动传参';
						moveAjaxdataInputField.value = '{}';
						fieldsArray.push(moveAjaxdataInputField);
						// moveAjax-type
						var moveAjaxTypeField = $.extend(true, {}, this.fields.select);
						moveAjaxTypeField.id = 'moveAjax-type';
						moveAjaxTypeField.label = panelAttr.label + ' 移动type';
						moveAjaxTypeField.subdata = [
							{id : 'GET', name : 'GET'},
							{id : 'POST', name : 'POST'},
						];
						fieldsArray.push(moveAjaxTypeField);
						// moveAjax-dataSrc
						var moveAjaxDataSrcField = $.extend(true, {}, this.fields.text);
						moveAjaxDataSrcField.id = 'moveAjax-dataSrc';
						moveAjaxDataSrcField.label = panelAttr.label + ' 移动dataSrc';
						fieldsArray.push(moveAjaxDataSrcField);
						// moveAjax-contentType
						var moveAjaxContentTypeField = $.extend(true, {}, this.fields.text);
						moveAjaxContentTypeField.id = 'moveAjax-contentType';
						moveAjaxContentTypeField.label = panelAttr.label + ' 移动contentType';
						fieldsArray.push(moveAjaxContentTypeField);

						// listExpression
						var listExpressionField = $.extend(true, {}, this.fields.dataInput);
						listExpressionField.id = 'listExpression';
						listExpressionField.label = panelAttr.label + ' listExpression';
						fieldsArray.push(listExpressionField);
						// formatter
						var formatterField = $.extend(true, {}, this.fields.dataInput);
						formatterField.id = 'formatter';
						formatterField.label = panelAttr.label + ' formatter';
						fieldsArray.push(formatterField);
						// imgIdField
						var imgIdFieldField = $.extend(true, {}, this.fields.text);
						imgIdFieldField.id = panelAttrIdStr + 'imgIdField';
						imgIdFieldField.label = panelAttr.label + ' imgIdField';
						imgIdFieldField.value = '';
						fieldsArray.push(imgIdFieldField);
						// billType
						var billTypeField = $.extend(true, {}, this.fields.text);
						billTypeField.id = panelAttrIdStr + 'billType';
						billTypeField.label = panelAttr.label + ' billType';
						billTypeField.value = '';
						// fieldsArray.push(billTypeField);
						// categories
						var categoriesField = $.extend(true, {}, this.fields.text);
						categoriesField.id = panelAttrIdStr + 'categories';
						categoriesField.label = panelAttr.label + ' categories';
						categoriesField.value = '';
						// fieldsArray.push(categoriesField);
						// imgNameField
						var imgNameFieldField = $.extend(true, {}, this.fields.text);
						imgNameFieldField.id = panelAttrIdStr + 'imgNameField';
						imgNameFieldField.label = panelAttr.label + ' imgNameField';
						imgNameFieldField.value = '';
						fieldsArray.push(imgNameFieldField);
						// operatorObject
						var operatorObjectField = $.extend(true, {}, this.fields.text);
						operatorObjectField.id = panelAttrIdStr + 'operatorObject';
						operatorObjectField.label = panelAttr.label + ' operatorObject';
						operatorObjectField.value = '';
						fieldsArray.push(operatorObjectField);
						// uploadAjaxData
						var uploadAjaxDataField = $.extend(true, {}, this.fields.dataInput);
						uploadAjaxDataField.id = 'uploadAjaxData';
						uploadAjaxDataField.label = panelAttr.label + ' uploadAjaxData';
						fieldsArray.push(uploadAjaxDataField);
						// isUseSearchInput
						var isUseSearchInput = $.extend(true, {}, this.fields.isTree);
						isUseSearchInput.id = panelAttrIdStr + 'isUseSearchInput';
						isUseSearchInput.label = panelAttr.label + ' 是否开启快速查询';
						isUseSearchInput.value = 'true';
						fieldsArray.push(isUseSearchInput);
						// searchInputPlaceholder
						var searchInputPlaceholder = $.extend(true, {}, this.fields.text);
						searchInputPlaceholder.id = 'searchInputPlaceholder';
						searchInputPlaceholder.label = panelAttr.label + ' 快速查询提示语';
						fieldsArray.push(searchInputPlaceholder);
						// isUseQRInput
						var isUseQRInput = $.extend(true, {}, this.fields.isTree);
						isUseQRInput.id = panelAttrIdStr + 'isUseQRInput';
						isUseQRInput.label = panelAttr.label + ' 是否使用二维码按钮';
						isUseQRInput.value = 'false';
						fieldsArray.push(isUseQRInput);

						// tableAjax-url
						var tableAjaxUrlField = $.extend(true, {}, this.fields.text);
						tableAjaxUrlField.id = 'tableAjax-url';
						tableAjaxUrlField.label = panelAttr.label + ' tableAjax地址';
						fieldsArray.push(tableAjaxUrlField);
						// tableAjax的data参数
						var addataInputField = $.extend(true, {}, this.fields.dataInput);
						addataInputField.id = 'tableAjax-data';
						addataInputField.label = panelAttr.label + ' tableAjax传参';
						addataInputField.value = '{}';
						fieldsArray.push(addataInputField);
						// tableAjax-type
						var addTypeField = $.extend(true, {}, this.fields.select);
						addTypeField.id = 'tableAjax-type';
						addTypeField.label = panelAttr.label + ' tableAjaxType';
						addTypeField.subdata = [
							{id : 'GET', name : 'GET'},
							{id : 'POST', name : 'POST'},
						];
						fieldsArray.push(addTypeField);
						// tableAjax-dataSrc
						var tableAjaxDataSrcField = $.extend(true, {}, this.fields.text);
						tableAjaxDataSrcField.id = 'tableAjax-dataSrc';
						tableAjaxDataSrcField.label = panelAttr.label + ' tableAjaxDataSrc';
						fieldsArray.push(tableAjaxDataSrcField);
						// tableAjax-contentType
						var tableAjaxContentTypeField = $.extend(true, {}, this.fields.text);
						tableAjaxContentTypeField.id = 'tableAjax-contentType';
						tableAjaxContentTypeField.label = panelAttr.label + ' tableAjaxContentType';
						fieldsArray.push(tableAjaxContentTypeField);

						// saveAjax-url
						var saveAjaxUrlField = $.extend(true, {}, this.fields.text);
						saveAjaxUrlField.id = 'saveAjax-url';
						saveAjaxUrlField.label = panelAttr.label + ' saveAjax地址';
						fieldsArray.push(saveAjaxUrlField);
						// saveAjax的data参数
						var addataInputField = $.extend(true, {}, this.fields.dataInput);
						addataInputField.id = 'saveAjax-data';
						addataInputField.label = panelAttr.label + ' saveAjax传参';
						addataInputField.value = '{}';
						fieldsArray.push(addataInputField);
						// saveAjax-type
						var addTypeField = $.extend(true, {}, this.fields.select);
						addTypeField.id = 'saveAjax-type';
						addTypeField.label = panelAttr.label + ' saveAjaxType';
						addTypeField.subdata = [
							{id : 'GET', name : 'GET'},
							{id : 'POST', name : 'POST'},
						];
						fieldsArray.push(addTypeField);
						// saveAjax-dataSrc
						var saveAjaxDataSrcField = $.extend(true, {}, this.fields.text);
						saveAjaxDataSrcField.id = 'saveAjax-dataSrc';
						saveAjaxDataSrcField.label = panelAttr.label + ' saveAjaxDataSrc';
						fieldsArray.push(saveAjaxDataSrcField);
						// saveAjax-contentType
						var saveAjaxContentTypeField = $.extend(true, {}, this.fields.text);
						saveAjaxContentTypeField.id = 'saveAjax-contentType';
						saveAjaxContentTypeField.label = panelAttr.label + ' saveAjaxContentType';
						fieldsArray.push(saveAjaxContentTypeField);
						
						// historyAjax-url
						var historyAjaxUrlField = $.extend(true, {}, this.fields.text);
						historyAjaxUrlField.id = 'historyAjax-url';
						historyAjaxUrlField.label = panelAttr.label + ' historyAjax地址';
						fieldsArray.push(historyAjaxUrlField);
						// historyAjax的data参数
						var addataInputField = $.extend(true, {}, this.fields.dataInput);
						addataInputField.id = 'historyAjax-data';
						addataInputField.label = panelAttr.label + ' historyAjax传参';
						addataInputField.value = '{}';
						fieldsArray.push(addataInputField);
						// historyAjax-type
						var addTypeField = $.extend(true, {}, this.fields.select);
						addTypeField.id = 'historyAjax-type';
						addTypeField.label = panelAttr.label + ' historyAjaxType';
						addTypeField.subdata = [
							{id : 'GET', name : 'GET'},
							{id : 'POST', name : 'POST'},
						];
						fieldsArray.push(addTypeField);
						// historyAjax-dataSrc
						var historyAjaxDataSrcField = $.extend(true, {}, this.fields.text);
						historyAjaxDataSrcField.id = 'historyAjax-dataSrc';
						historyAjaxDataSrcField.label = panelAttr.label + ' historyAjaxDataSrc';
						fieldsArray.push(historyAjaxDataSrcField);
						// historyAjax-contentType
						var historyAjaxContentTypeField = $.extend(true, {}, this.fields.text);
						historyAjaxContentTypeField.id = 'historyAjax-contentType';
						historyAjaxContentTypeField.label = panelAttr.label + ' historyAjaxContentType';
						fieldsArray.push(historyAjaxContentTypeField);
						
						// getListAjax-url
						var getListAjaxUrlField = $.extend(true, {}, this.fields.text);
						getListAjaxUrlField.id = 'getListAjax-url';
						getListAjaxUrlField.label = panelAttr.label + ' getListAjax地址';
						fieldsArray.push(getListAjaxUrlField);
						// getListAjax的data参数
						var addataInputField = $.extend(true, {}, this.fields.dataInput);
						addataInputField.id = 'getListAjax-data';
						addataInputField.label = panelAttr.label + ' getListAjax传参';
						addataInputField.value = '{}';
						fieldsArray.push(addataInputField);
						// getListAjax-type
						var addTypeField = $.extend(true, {}, this.fields.select);
						addTypeField.id = 'getListAjax-type';
						addTypeField.label = panelAttr.label + ' getListAjaxType';
						addTypeField.subdata = [
							{id : 'GET', name : 'GET'},
							{id : 'POST', name : 'POST'},
						];
						fieldsArray.push(addTypeField);
						// getListAjax-dataSrc
						var getListAjaxDataSrcField = $.extend(true, {}, this.fields.text);
						getListAjaxDataSrcField.id = 'getListAjax-dataSrc';
						getListAjaxDataSrcField.label = panelAttr.label + ' getListAjaxDataSrc';
						fieldsArray.push(getListAjaxDataSrcField);
						// getListAjax-contentType
						var getListAjaxContentTypeField = $.extend(true, {}, this.fields.text);
						getListAjaxContentTypeField.id = 'getListAjax-contentType';
						getListAjaxContentTypeField.label = panelAttr.label + ' getListAjaxContentType';
						fieldsArray.push(getListAjaxContentTypeField);
						
						// getRecordAjax-url
						var getRecordAjaxUrlField = $.extend(true, {}, this.fields.text);
						getRecordAjaxUrlField.id = 'getRecordAjax-url';
						getRecordAjaxUrlField.label = panelAttr.label + ' getRecordAjax地址';
						fieldsArray.push(getRecordAjaxUrlField);
						// getRecordAjax的data参数
						var addataInputField = $.extend(true, {}, this.fields.dataInput);
						addataInputField.id = 'getRecordAjax-data';
						addataInputField.label = panelAttr.label + ' getRecordAjax传参';
						addataInputField.value = '{}';
						fieldsArray.push(addataInputField);
						// getRecordAjax-type
						var addTypeField = $.extend(true, {}, this.fields.select);
						addTypeField.id = 'getRecordAjax-type';
						addTypeField.label = panelAttr.label + ' getRecordAjaxType';
						addTypeField.subdata = [
							{id : 'GET', name : 'GET'},
							{id : 'POST', name : 'POST'},
						];
						fieldsArray.push(addTypeField);
						// getRecordAjax-dataSrc
						var getRecordAjaxDataSrcField = $.extend(true, {}, this.fields.text);
						getRecordAjaxDataSrcField.id = 'getRecordAjax-dataSrc';
						getRecordAjaxDataSrcField.label = panelAttr.label + ' getRecordAjaxDataSrc';
						fieldsArray.push(getRecordAjaxDataSrcField);
						// getRecordAjax-contentType
						var getRecordAjaxContentTypeField = $.extend(true, {}, this.fields.text);
						getRecordAjaxContentTypeField.id = 'getRecordAjax-contentType';
						getRecordAjaxContentTypeField.label = panelAttr.label + ' getRecordAjaxContentType';
						fieldsArray.push(getRecordAjaxContentTypeField);
						break;
				}
			}
			if(isTree){
				this.formTree = $.extend(true,{},this.form);
				this.formTree.id = config.treeId;
				this.formTree.form = fieldsArray;
				return this.formTree;
			}
			this.form.form = fieldsArray;
			return this.form;
		},
		// data处理根据id判断是哪个ajax的data
		setAjaxData:function(idName,idValue,formatObj,keyStr){
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
		},
		// ajax保存配置方法
		ajaxSaveData:function(saveData, isSaveXmmapJson, isSaveRel){
			// 保存
			/*$.ajax({
				url:getRootPath() + "/templateMindPages/save",
				type:"POST",
				dataType:"json",
				data:saveData,
				success:function(data){
					if(data.success){
						nsAlert("保存成功");
					}else{
						nsAlert("保存失败");
					}
				}
			});*/ 
			isSaveRel = typeof(isSaveRel) == "boolean" ? isSaveRel : true; // 是否保存关联页面
			if(isSaveXmmapJson){
				saveData.pageConfig.xmmapJson = JSON.stringify(config.xmmapJson);
			}else{
				saveData.pageConfig.xmmapJson = '{}';
			}
			saveData.pageConfig = JSON.stringify(saveData.pageConfig);

			// 保存页面配置
			var savePage = {
				url:getRootPath() + "/templateMindPages/save",
				type:"POST",
				dataType:"json",
				data:saveData,
				contentType:'application/x-www-form-urlencoded',
			}
			NetStarUtils.ajax(savePage,function(res){
				if(isSaveRel){
					commonManager.ajaxSavePageDetailsList(saveData.id);
				}else{
					nsAlert('保存成功');
				}
			})
		},
		ajaxSavePageDetailsList:function(pageId){
			var pageDetailsList = commonManager.pageDetailsList;
			var pageDetailsArr = [];
			for(var indexI=0;indexI<pageDetailsList.length;indexI++){
				var detailId = pageDetailsList[indexI].detailId;
				if(typeof(detailId) == 'number'){
					pageDetailsArr.push({
						configName:pageDetailsList[indexI].configName,
						detailId:detailId,
					});
					continue;
				}
				if(detailId.indexOf(',')>-1){
					var detailIdArr = detailId.split(',');
					for(var indexJ=0;indexJ<detailIdArr.length;indexJ++){
						pageDetailsArr.push({
							configName:pageDetailsList[indexI].configName+'['+indexJ+']',
							detailId:isNaN(Number(detailIdArr[indexJ]))?Number(moment(new Date()).format('x')):Number(detailIdArr[indexJ]),
						});
					}
				}else{
					pageDetailsArr.push({
						configName:pageDetailsList[indexI].configName,
						detailId:isNaN(Number(detailId))?Number(moment(new Date()).format('x')):Number(detailId),
					});
				}
				// pageDetailsList[indexI].detailId = Number(pageDetailsList[indexI].detailId);
			}
			var pageDetailsArr = commonManager.validDetailsList(pageDetailsArr); // 验证有效的保存数据
			if(pageDetailsArr){
				var savePageDetailsData = {
					pageId:pageId,
					configs:pageDetailsArr,
				}
				// var savePageDetailsSrc = JSON.stringify(savePageDetailsData);
				var savePageDetailsSrc = savePageDetailsData;
				// 保存关联页面配置
				var savePageDetails = {
					url:getRootPath()+"/templateMindMapDetails/saveRel",
					type:"POST",
					dataType:"json",
					contentType:'application/json',
					data:savePageDetailsSrc,
				}
				NetStarUtils.ajax(savePageDetails,function(res){
					nsAlert("保存成功");
				})
			}
		},
		// 验证有效的关联页面的保存数据
		validDetailsList:function(arr){
			var list = [];
			for(var indexI=0;indexI<arr.length;indexI++){
				var obj = arr[indexI];
				if(typeof(obj.configName)=='string' && typeof(obj.detailId)=='number'){
					list.push(obj);
				}else{
					console.error('数据错误');
					console.error(obj);
				}
			}
			// 删除重复
			var resList = []; // 返回的
			for(var resI=0;resI<list.length;resI++){
				var detailIdI = list[resI].detailId;
				var isRep = false;
				for(var resJ=resI+1;resJ<list.length;resJ++){
					var detailIdJ = list[resJ].detailId;
					if(detailIdI == detailIdJ){
						isRep = true;
					}
				}
				if(!isRep){
					resList.push(list[resI]);
				}
			}
			return resList;
		},
		// 通过serverConfig设置配置参数
		setPageConfigData : function(){
			var serverConfig = config.serverConfig;
			var templateName = config.templateAttr.template;
			switch(templateName){
				case 'doubleTables':
				case 'singleForm':
				case 'singleTable':
				case 'listFilter':
					// 设置表单
					templateManager[templateName].setEditorForm(serverConfig.programmerConfig);
					break;
				case 'tabFormList':
				case 'formTable':
				case 'mobileForm':
				// case 'standardTemplate':
					if(serverConfig.programmerConfig){
						var defaultFormData = serverConfig.programmerConfig.form;
						var defaultTableData = serverConfig.programmerConfig.tab;
					}else{
						var defaultFormData = false;
						var defaultTableData = [];
					}
					// 设置表单
					templateManager[templateName].setEditorForm(defaultFormData);
					// 设置表格
					templateManager[templateName].setEditorTable.data.dataSource = defaultTableData;
					templateManager[templateName].setEditorTable.init();
					break;
				case 'standardTemplate':
					if(serverConfig.programmerConfig){
						var defaultFormData = serverConfig.programmerConfig.form;
						var defaultTableData = serverConfig.programmerConfig.tab;
					}else{
						var defaultFormData = false;
						var defaultTableData = [];
					}
					// 设置表单
					templateManager[templateName].setEditorForm(defaultFormData);
					// 设置表格
					templateManager[templateName].setEditorTable.data.dataSource = defaultTableData;
					templateManager[templateName].setEditorTable.init();
					break;
				case 'treeTable':
					if(typeof(templateManager[templateName].defaultConfig.form) == 'undefined'){
						templateManager[templateName].defaultConfig.form = templateManager[templateName].form;
					}
					if(typeof(templateManager[templateName].defaultConfig.table) == 'undefined'){
						templateManager[templateName].defaultConfig.table = templateManager[templateName].table;
					}
					// 设置form/table
					if($.isArray(serverConfig.programmerConfig)){
						// 设置表单
						var treeDef = serverConfig.programmerConfig[0];
						treeDef['tree-config'] = treeDef['tree-config'].split(',');
						templateManager[templateName].setEditorForm(treeDef);
						templateManager[templateName].readyData.tree = $.extend(true,[],treeDef['tree-config']);
						// 判断树配置（表单/表格）刷新出配置页面
						if(templateManager[templateName].readyData.tree){
							templateManager[templateName].readyData.refData = $.extend(true,{},serverConfig.programmerConfig[1]);
							templateManager[templateName].refreshTreeConfig(templateManager[templateName].readyData.tree);
						}
					}else{
						// 设置表单
						templateManager[templateName].setEditorForm(serverConfig.programmerConfig);
					}
					break;
			}
		},
		// ajax获取保存的配置
		ajaxGetSaveConfig:function(){
			var ajaxConfig = {
				url:getRootPath()+"/templateMindPages/" + config.voData.id,
				type:"GET",
				dataType:"json",
				contentType:'application/x-www-form-urlencoded',
			}
			NetStarUtils.ajax(ajaxConfig, function(data){
				config.isSavePageConfig = true; // 是否保存页面配置 最新存在层级关系的页面不保存
				if($.isArray(data.rows)){
					config.isSavePageConfig = false;
					// if(data.rows.length == 1 && data.rows[0].serverConfig && data.rows[0].serverConfig.length > 0){
					// 	data.data = data.rows[0];
					// 	var pageConfigArr = [data.rows[0].pageConfig ? data.rows[0].pageConfig : "{}"];
					// 	var prevServerConfig = pageProperty.getAllConfigByObjectState(pageConfigArr, false);
					// 	config.prevServerConfig = prevServerConfig;
					// }else{
						var pageConfigArr = [];
						// if(data.rows[0] && data.rows[0].serverConfig && data.rows[0].serverConfig.length > 0){
						// 	// data.data = data.rows[0];
						// 	pageConfigArr.push(data.rows[0].serverConfig);
						// }
						for(var i=0; i<data.rows.length; i++){
							if(data.rows[i].serverConfig && data.rows[i].serverConfig.length > 0){
								pageConfigArr.push(data.rows[i].serverConfig);
							}else{
								pageConfigArr.push(data.rows[i].pageConfig ? data.rows[i].pageConfig : "{}");
							}
						}
						var serverConfig = pageProperty.getAllConfigByObjectState(pageConfigArr, true);
						var prevServerConfig = pageProperty.getAllConfigByObjectState(pageConfigArr, false);
						config.serverConfig = serverConfig;
						config.prevServerConfig = prevServerConfig;
						commonManager.setPageConfigData();
						return;
					// }
					
				}
				// 字符串转化对象
				function swichObj(_switchObj){
					if(typeof(_switchObj)=='string'){
						_switchObj = JSON.parse(_switchObj);
						_switchObj = swichObj(_switchObj);
						return _switchObj;
					}else{
						return _switchObj;
					}
				}
				var templateName = config.templateAttr.template;
				var serverConfig = {};
				if(data.data.serverConfig){
					// 读取服务器配置设置默认
					serverConfig = JSON.parse(data.data.serverConfig);
					// templateManager[templateName].setValues(serverConfig);
				}
				if(typeof(data.data.pageConfig) == "string"){
					// 初始化模板默认配置
					var pageConfig = JSON.parse(data.data.pageConfig);
					pageConfig = swichObj(pageConfig);
					var pageConfigOriginal = JSON.parse(pageConfig.config);
					// console.log('/******模板配置******/');
					// console.log(pageConfigOriginal);
					if(pageConfigOriginal.template == templateName || templateName=="standardTemplate"){
						commonManager.refreshTemplateDefaultBySave(templateManager[templateName].defaultConfig,pageConfigOriginal);
					}else{
						config.serverConfig = {}; // 清空上一个模板的配置
					}
				}else{
					if($.isArray(data.data.pageConfig)){
						config.isSavePageConfig = false;
						var _serverConfig = pageProperty.getAllConfigByObjectState(data.data.pageConfig, true);
						var prevServerConfig = pageProperty.getAllConfigByObjectState(data.data.pageConfig, false);
						serverConfig = _serverConfig;
						config.prevServerConfig = prevServerConfig;
					}
				}
				config.serverConfig = serverConfig;
				commonManager.setPageConfigData();
			});
		},
		// 获取删除对象中的空值的对象
		getDeleteNullObj:function(object){
			var returnObj = {};
			for(var key in object){
				if(object[key] == ''){
				}else{
					returnObj[key] = object[key];
				}
			}
			return returnObj;
		},
		// 根据地址设置默认表格显示字段即field nsProject.getFieldsByState('','',true/false)
		getDefaultField:function(urlStr,isTable){
			var defaultField = '';
			var urlArr = urlStr.split('.');
			defaultField = 'nsProject.getFieldsByState('+urlArr[0]+'.'+urlArr[1]+',"defalut",'+isTable+')';
			return defaultField;
		},
		// 格式化form表单的默认值 例 ： 树的value是对象
		getFormatValues:function(sourceObj,formArr){
			var formValueConfig = {};
			for(index=0;index<formArr.length;index++){
				if(formArr[index].type == 'treeSelect'){
					if(sourceObj[formArr[index].id]){
						formValueConfig[formArr[index].id] = {
							text:sourceObj[formArr[index].id],
							value:sourceObj[formArr[index].id],
						}
					}
				}else{
					if(sourceObj[formArr[index].id]){
						formValueConfig[formArr[index].id] = sourceObj[formArr[index].id];
					}
				}
			}
			return formValueConfig;
		},
		// 验证包名是否存在
		validatePackageName:function(_packageName){
			if(_packageName){
				var packageArr = _packageName.split('.');
				var packageName = '';
				for(index=0;index<packageArr.length-1;index++){
					packageName += packageArr[index] + '.';
				}
				packageName = packageName.substring(0,packageName.length-1);
				try{
					var packageNameObj = eval(packageName);
					if(typeof(packageNameObj) != 'object'){
						nsAlert('包名不存在','error');
						console.error(_packageName);
						return false;
					}
				}catch(error){
					nsAlert('包名不存在','error');
					console.error(_packageName);
					console.error(error.message);
					return false;
				}
			}else{
				nsAlert('包名不存在','error');
				console.error(_packageName);
				return false;
			}
			return true;
		},
		// 根据已存模板数据刷新模板默认值
		refreshTemplateDefaultBySave:function(defaultCof,saveCof){
			for(key in defaultCof){
				// 模板第一层 不保存模板不符合当前模板配置的属性
				if(saveCof[key]){
					if(typeof(saveCof[key]) == 'string'){
						defaultCof[key] = saveCof[key];
					}else{
						// saveDef(defaultCof[key],saveCof[key],key);
						defaultCof[key] = saveCof[key];
					}
				}
			}
		},
		// 设置ajax配置通过方法id
		setAjaxConfigByMethodId:function(ajaxObj,methodId){
			var methodArr = config.voMapObj.method;
			var isTrue = false;
			for(var index=0;index<methodArr.length;index++){
				if(methodArr[index].id == methodId){
					isTrue = true;
					if(methodArr[index].entityName && methodArr[index].voName && methodArr[index].functionClass && methodArr[index].englishName){
						ajaxObj.src = methodArr[index].entityName+'.'+methodArr[index].voName+'.controller.'+methodArr[index].functionClass+'.'+methodArr[index].englishName+'.func.config.url';
						// var methodKeyNames = ['dataSrc','type','dataFormat','defaultMode','text','title','functionField'];
						var methodParameter = this.methodParameter;
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
		},
		// 获得按钮配置通过方法id
		getBtnConfigByMethodId:function(methodId){
			var methodArr = config.voMapObj.method;
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
						// voName = methodArr[index].voName;
						functionClass = methodArr[index].functionClass;
						btnsStr += methodArr[index].englishName + ',';
						// btnsStr += functionClass + '.' + methodArr[index].englishName + ',';
					}
				}
			}
			btnsStr = btnsStr.substring(0,btnsStr.length-1);
			if(btnsStr.length==0){
				return '';
			}
			return 'nsProject.getFuncArrayByXmmapFuncNames('+entityName+',"'+btnsStr+'")';
			// return 'nsProject.getFuncArrayByFuncNames('+entityName+'.'+voName+',"'+btnsStr+'")';
		},
		// 设置其他数据
		setOtherData:function(idName,idValue,formatObj){
			var idArr = idName.split('-');
			/*var obj = formatObj;
			for(index=0;index<idArr.length-1;index++){
				obj = obj[idArr[index]];
			}*/
			var obj = this.getConfigObj(idName,idValue,formatObj);
			obj[idArr[idArr.length-1]] = idValue;
		},
		// 获得vo的id 通过方法id
		getVoIdByMethodId:function(methodId){
			/*
			 * methodId 参照数据id
			 */
			/*var consultArr = consultName.split('.');
			return consultArr[0];*/
			var methodlist = config.voMapObj.method;
			for(var indexI=0;indexI<methodlist.length;indexI++){
				if(methodlist[indexI].id == methodId){
					return methodlist[indexI].voId;
				}
			}
			return false;
		},
		// 获得vo的id 通过vo的englishName
		getVoIdByVoName:function(voName){
			/*
			 * methodId 参照数据id
			 */
			/*var consultArr = consultName.split('.');
			return consultArr[0];*/
			var volist = config.voMapObj.vo;
			for(var indexI=0;indexI<volist.length;indexI++){
				if(volist[indexI].voName == voName){
					return volist[indexI].id;
				}
			}
			return false;
		},
		// 通过 ‘-’ 获得配置对象
		getConfigObj:function(idName,valueName,formatObj,savePageRel){
			var idArr = idName.split('-');
			var obj = formatObj;
			for(index=0;index<idArr.length-1;index++){
				// if(valueName==''){
				// 	delete obj[idArr[index]];
				// 	return false;
				// }
				obj = obj[idArr[index]];
				savePageRel.configName += idArr[index]+'.';
			}
			savePageRel.configName += idArr[idArr.length-1];
			return obj;
		},
		// 通过 ‘-’ 获得配置对象
		getConfigObj2:function(idName,valueName,formatObj){
			var idArr = idName.split('-');
			var obj = formatObj;
			for(index=0;index<idArr.length-1;index++){
				// if(valueName==''){
				// 	delete obj[idArr[index]];
				// 	return false;
				// }
				if(idArr[index] == 'base'){
					continue;
				}
				obj = obj[idArr[index]];
			}
			return obj;
		},
		// 格式化保存数据
		formatSaveData:function(sourceData,formatObj,configName,templateType,panelType){
			/*
			 * sourceData 准备格式化的原始数据
			 * formatObj 格式化的config
			 * configName 关联页面参数   模板路径
			 * templateType 模板名字
			 * panelType 面板名字
			 */
			formatObj = typeof(formatObj) == 'undefined' ? $.extend(true,{},this.defaultConfig) : formatObj;
			formatObj.ajax = typeof(formatObj.ajax)=="object" ? formatObj.ajax : {};
			switch(panelType){
				case 'tree':
					formatObj.addAjax = typeof(formatObj.addAjax)=="object" ? formatObj.addAjax : {};
					formatObj.deleteAjax = typeof(formatObj.deleteAjax)=="object" ? formatObj.deleteAjax : {};
					formatObj.editAjax = typeof(formatObj.editAjax)=="object" ? formatObj.editAjax : {};
					formatObj.moveAjax = typeof(formatObj.moveAjax)=="object" ? formatObj.moveAjax : {};
					break;
				case 'resultinput':
					formatObj.tableAjax = typeof(formatObj.tableAjax)=="object" ? formatObj.tableAjax : {};
					formatObj.saveAjax = typeof(formatObj.saveAjax)=="object" ? formatObj.saveAjax : {};
					formatObj.historyAjax = typeof(formatObj.historyAjax)=="object" ? formatObj.historyAjax : {};
					break;
				case 'pdfList':
					formatObj.getListAjax = typeof(formatObj.getListAjax)=="object" ? formatObj.getListAjax : {};
					break;
				case 'recordList':
					formatObj.tableAjax = typeof(formatObj.tableAjax)=="object" ? formatObj.tableAjax : {};
					formatObj.saveAjax = typeof(formatObj.saveAjax)=="object" ? formatObj.saveAjax : {};
					formatObj.historyAjax = typeof(formatObj.historyAjax)=="object" ? formatObj.historyAjax : {};
					formatObj.getListAjax = typeof(formatObj.getListAjax)=="object" ? formatObj.getListAjax : {};
					formatObj.getRecordAjax = typeof(formatObj.getRecordAjax)=="object" ? formatObj.getRecordAjax : {};
					break;
			}
			configName = typeof(configName) == 'undefined' ? '' : configName;
			for(var typeName in sourceData){
				// 保存关联页面的数据
				var savePageRel = {
					configName:configName,
				};
				var typeNameArr = typeName.split('-');
				var conObj = commonManager.getConfigObj(typeName,sourceData[typeName],formatObj,savePageRel);
				if(conObj){
					switch(typeNameArr[typeNameArr.length-1]){
						case 'src':
							var ajaxObj = {};
							var isBreak = false;
							switch(panelType){
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
							commonManager.setAjaxConfigByMethodId(ajaxObj,sourceData[typeName]);
							if(sourceData[typeName]!=''){
								savePageRel.detailId = sourceData[typeName];
							}
							break;
						case 'url':
							var ajaxObj = {};
							switch(panelType){
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
							conObj[typeNameArr[typeNameArr.length-1]] = commonManager.getBtnConfigByMethodId(sourceData[typeName]);
							if(conObj[typeNameArr[typeNameArr.length-1]] != ''){
								savePageRel.detailId = sourceData[typeName];
							}
							break;
						case 'dataSrc':
						case 'contentType':
							if(panelType == "tree" || panelType == "resultinput" || panelType == "pdfList" || panelType == "recordList"){
								commonManager.setAjaxData(typeName, sourceData[typeName], formatObj, typeNameArr[typeNameArr.length-1]);
							}
							break;
						case 'data':
							commonManager.setAjaxData(typeName, sourceData[typeName], formatObj, typeNameArr[typeNameArr.length-1]);
							break;
						case 'type':
							var isDefault = true;
							switch(panelType){
								case 'tree':
									if( typeNameArr[0] == "ajax" || 
										typeNameArr[0] == "addAjax" || 
										typeNameArr[0] == "deleteAjax" || 
										typeNameArr[0] == "editAjax" || 
										typeNameArr[0] == "moveAjax"
									){
										isDefault = false;
										commonManager.setAjaxData(typeName, sourceData[typeName], formatObj, typeNameArr[typeNameArr.length-1]);
									}
									break;
								case 'resultinput':
									if( typeNameArr[0] == "tableAjax" || 
										typeNameArr[0] == "saveAjax" || 
										typeNameArr[0] == "historyAjax"
									){
										isDefault = false;
										commonManager.setAjaxData(typeName, sourceData[typeName], formatObj, typeNameArr[typeNameArr.length-1]);
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
										commonManager.setAjaxData(typeName, sourceData[typeName], formatObj, typeNameArr[typeNameArr.length-1]);
									}
									break;
								case 'pdfList':
									if( typeNameArr[0] == "getListAjax" ){
										isDefault = false;
										commonManager.setAjaxData(typeName, sourceData[typeName], formatObj, typeNameArr[typeNameArr.length-1]);
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
							if(typeName=="field"&&templateType=="standardTemplate"&&panelType!="tab"){
							}else{
								conObj[typeNameArr[typeNameArr.length-1]] = sourceData[typeName];
							}
							break;
					}
					if(typeof(savePageRel.detailId)!=='undefined'){
						this.pageDetailsList.push(savePageRel);
					}
				}
			}
			// 删除空
			var formatObjRet = $.extend(true,{},formatObj)
			for(var key in formatObjRet){
				if(formatObjRet[key] === ''){
					delete formatObjRet[key];
				}
				if(typeof(formatObjRet[key])=='object'){
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
							case 'getValueAjax':
								if(formatObjRet && formatObjRet[key]){
									if(formatObjRet[key].src == ''||typeof(formatObjRet[key].src)=='undefined'){
										delete formatObjRet[key];
									}
								}
								break;
							case 'deleteAjax':
								if(formatObjRet && formatObjRet[key]){
									if(panelType=='tree'){
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
		},
		// 通过方法id返回方法中文名字
		getMethodChineseName:function(methodId){
			var methodArr = config.voMapObj.method;
			var methodIdArr = methodId.split(',');
			var methodName = '';
			for(var metI=0;metI<methodArr.length;metI++){
				for(var idI=0;idI<methodIdArr.length;idI++){
					if(methodArr[metI].id == methodIdArr[idI]){
						methodName += methodArr[metI].chineseName + ',';
					}
				}
			}
			if(methodName.length>0){
				methodName = methodName.substring(0,methodName.length-1);
			}
			return methodName;
		},
		// 通过getValueAjax或saveData设置 表单voId
		setFormVoIdByGetOrSave:function(saveData){
			if(saveData['getValueAjax-src'] == '' && saveData['saveData-src'] == ''){
				nsAlert('getValueAjax和saveData都不存在模板无意义，不可生成');
				console.error(saveData);
				return false;
			}else{
				if(saveData['getValueAjax-src'] != ''){
					var voId = commonManager.getVoIdByMethodId(saveData['getValueAjax-src']);
					if(saveData['saveData-src'] != ''){
						var voId2 = commonManager.getVoIdByMethodId(saveData['saveData-src']);
						if(voId != voId2){
							nsAlert('getValueAjax和saveData必须是同一个');
							console.error('getValueAjax:'+voId);
							console.error('saveData:'+voId2);
							return false;
						}
					}
				}else{
					var voId = commonManager.getVoIdByMethodId(saveData['saveData-src']);
				}
				saveData['form-voId'] = voId;
			}
			return true;
		},
		// listFilter/singleForm/singleTable/doubleTables
		getValues:function(){
			// 表单配置数据
			var formData = nsForm.getFormJSON(config.formId);
			var templateName = config.templateAttr.template; // 模板名字
			templateManager[templateName].formData = formData;
			// 保存数据
			var saveData = formData;
			// 验证包名
			if(saveData){
				var isTrue = true;
				switch(templateName){
					case 'listFilter':
						// if(saveData['saveData-src'] == ''){
						// 	nsAlert('saveData不存在模板无意义，不可生成');
						// 	console.error(saveData);
						// 	isTrue = false;
						// }else{
						// 	var voId = commonManager.getVoIdByMethodId(saveData['saveData-src']);
						// 	saveData['form-voId'] = voId;
						// }
						break;
					case 'singleForm':
						isTrue = commonManager.setFormVoIdByGetOrSave(saveData);
						break;
					case 'doubleTables':
					case 'singleTable':
						break;
				}
				if(isTrue){
					var isPackage = commonManager.validatePackageName(saveData.package);
					if(!isPackage){
						var saveData = false;
					}
				}else{
					var saveData = false;
				}
			}
			return saveData;
		},
		// 设置格式化数据
		getFormatData : function(sourceData, formatData, type){
			/*
			 * sourceData 	准备格式化的原始数据
			 * formatData 	格式化的config
			 * type			格式化数据类型 tree/resultinput/....
			 */
			formatData = typeof(formatData) == 'undefined' ? $.extend(true,{},this.defaultConfig) : formatData;
			formatData.ajax = typeof(formatData.ajax)=="object" ? formatData.ajax : {};
			switch(type){
				case 'tree':
					formatObj.addAjax = typeof(formatObj.addAjax)=="object" ? formatObj.addAjax : {};
					formatObj.deleteAjax = typeof(formatObj.deleteAjax)=="object" ? formatObj.deleteAjax : {};
					formatObj.editAjax = typeof(formatObj.editAjax)=="object" ? formatObj.editAjax : {};
					formatObj.moveAjax = typeof(formatObj.moveAjax)=="object" ? formatObj.moveAjax : {};
					break;
				case 'resultinput':
					formatObj.tableAjax = typeof(formatObj.tableAjax)=="object" ? formatObj.tableAjax : {};
					formatObj.saveAjax = typeof(formatObj.saveAjax)=="object" ? formatObj.saveAjax : {};
					formatObj.historyAjax = typeof(formatObj.historyAjax)=="object" ? formatObj.historyAjax : {};
					break;
				case 'pdfList':
					formatObj.getListAjax = typeof(formatObj.getListAjax)=="object" ? formatObj.getListAjax : {};
					break;
				case 'recordList':
					formatObj.tableAjax = typeof(formatObj.tableAjax)=="object" ? formatObj.tableAjax : {};
					formatObj.saveAjax = typeof(formatObj.saveAjax)=="object" ? formatObj.saveAjax : {};
					formatObj.historyAjax = typeof(formatObj.historyAjax)=="object" ? formatObj.historyAjax : {};
					formatObj.getListAjax = typeof(formatObj.getListAjax)=="object" ? formatObj.getListAjax : {};
					formatObj.getRecordAjax = typeof(formatObj.getRecordAjax)=="object" ? formatObj.getRecordAjax : {};
					break;
			}
			for(var typeName in sourceData){
				var typeNameArr = typeName.split('-');
				var conObj = commonManager.getConfigObj2(typeName,sourceData[typeName],formatData);
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
							commonManager.setAjaxConfigByMethodId(ajaxObj,sourceData[typeName]);
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
							conObj[typeNameArr[typeNameArr.length-1]] = commonManager.getBtnConfigByMethodId(sourceData[typeName]);
							break;
						case 'dataSrc':
						case 'contentType':
							if(type == "tree" || type == "resultinput" || type == "pdfList" || type == "recordList"){
								commonManager.setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
							}
							break;
						case 'data':
							commonManager.setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
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
										commonManager.setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
									}
									break;
								case 'resultinput':
									if( typeNameArr[0] == "tableAjax" || 
										typeNameArr[0] == "saveAjax" || 
										typeNameArr[0] == "historyAjax"
									){
										isDefault = false;
										commonManager.setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
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
										commonManager.setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
									}
									break;
								case 'pdfList':
									if( typeNameArr[0] == "getListAjax" ){
										isDefault = false;
										commonManager.setAjaxData(typeName, sourceData[typeName], formatData, typeNameArr[typeNameArr.length-1]);
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
			return formatData;
		},
	}
	// 主附表
	var doubleTablesManager = {
		// 主附表默认配置
		defaultConfig:{
			//col:"[6,6]",
			isFormHidden:false,
			isShowTitle:false,
			template:"doubleTables",
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:"保存",
				},
			},
			table:{
				main:{
					ajax:{},
					field:[],
					btns:'',
					tableRowBtns:'',
					idField:'voId',
					title:'',
					add:{ type : 'dialog' },
					edit:{ type : 'dialog' },
					delete:{ type : 'confirm' },
				},
				child:{
					ajax:{},
					field:[],
					btns:'',
					tableRowBtns:'',
					idField:'id',
					keyField:'children',
					title:'',
					add:{ type : 'dialog' },
					edit:{ type : 'dialog' },
					delete:{ type : 'confirm' },
				},
			},
		},
		// 获取值
		getValues:function(){
			// 表单配置数据
			var formData = nsForm.getFormJSON(config.formId);
			// console.log(/*****获取表单值*****/);
			this.formData = $.extend(true,{},formData);
			// 不处理未设置的字段 删除未设置字段
			// var formDataDelete = commonManager.getDeleteNullObj(formData);
			// 保存数据
			var saveData = formData;
			// 验证包名
			if(saveData){
				var isPackage = commonManager.validatePackageName(saveData.package);
				if(!isPackage){
					saveData = false;
				}
			}
			return saveData;
		},
		// 设置值
		setValues:function(defaultSourceObj){
			// console.log('/**读取到的默认值（原始未处理）**/');
			// 获取可以赋值的对象 树的value是对象
			var formValueConfig = commonManager.getFormatValues(defaultSourceObj.formConfig,this.formConfig.form);
			formPlane.fillValues(formValueConfig,config.formId);
		},
		// 保存值
		saveValues:function(isSaveXmmapJson){
			// 获取保存的原始数据数据(格式未处理)
			var saveSourceData = commonManager.getValues();
			if(saveSourceData){
				commonManager.pageDetailsList = [];
				this.saveSourceData = saveSourceData;
				// 格式化原始保存数据
				var saveData = commonManager.formatSaveData(saveSourceData,this.defaultConfig);
				// 根据保存数据的表格地址设置默认表格显示字段
				if(saveData.table.main.field){

				}else{
					saveData.table.main.field = [];
				}
				if(saveData.table.child.field){

				}else{
					saveData.table.child.field = [];
				}
				if(saveData.table.main.field.length == 0){
					saveData.table.main.field = commonManager.getDefaultField(saveData.table.main.ajax.src,true);
				}
				if(saveData.table.child.field.length == 0){
					saveData.table.child.field = commonManager.getDefaultField(saveData.table.child.ajax.src,true);
				}
				// voId数据
				var isTrue = true;
				var errorStr = '';
				if(saveData.table.main.voId){
					commonManager.pageDetailsList.push({
						configName:'main.vo',
						detailId:saveData.table.main.voId,
					});
				}else{
					isTrue = false;
					errorStr += '主表vo不存在,';
				}
				if(saveData.table.child.voId){
					commonManager.pageDetailsList.push({
						configName:'child.vo',
						detailId:saveData.table.child.voId,
					});
				}else{
					isTrue = false;
					errorStr += '附表vo不存在请检查voList';
				}
				if(isTrue){
					// 保存
					var pageConfig = {
						config:JSON.stringify(saveData)
					};
					// config.voData.pageConfig = JSON.stringify(pageConfig); // 模板数据
					config.voData.pageConfig = pageConfig; // 模板数据
					var serverConfig = {
						programmerConfig:this.formData, // 程序员配置
					};
					config.serverConfig.programmerConfig = serverConfig.programmerConfig;
					config.voData.serverConfig = JSON.stringify(config.serverConfig);
					commonManager.ajaxSaveData(config.voData);
				}else{
					nsAlert(errorStr);
				}
			}
		},
		//设置表单
		setEditorForm:function(valueObj){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本配置',
						id:'package',
					},
					{
						type:'table',
						label:'主表',
						id:'table-main',
						dataType:'list',
						isRequired:'true',
					},
					{
						type:'table',
						label:'附表',
						id:'table-child',
						dataType:'modal',
						isRequired:'true',
						tableType:'child',
					},
					{
						type:'saveData',
						label:'saveData',
						id:'saveData',
						dataType:'modal',
						isRequired:'true',
					}
				]
			};
			var formConfig = commonManager.getForm(formAttr);
			this.formConfig = formConfig;
			if(valueObj){
				commonManager.defaultValueInFormArr(this.formConfig.form,valueObj); // 设置默认值
			}
			formPlane.formInit(formConfig);
		},
		//初始化 入口方法
		init:function(){
			// ajax 查询默认值
			commonManager.ajaxGetSaveConfig();
		},
	}
	// 单表格
	var singleTableManager = {
		// 单表格默认配置
		defaultConfig:{
			//col:"[6,6]",
			isFormHidden:false,
			isShowTitle:false,
			template:"singleTable",
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:"保存",
				},
			},
			table:{
				ajax:{},
				field:[],
				btns:'',
				tableRowBtns:'',
				idField:'id',
				keyField:'volist',
				title:'',
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
		},
		// 获取值
		getValues:function(){
			// 表单配置数据
			var formData = nsForm.getFormJSON(config.formId);
			this.formData = formData;
			// 不处理未设置的字段 删除未设置字段
			// var formDataDelete = commonManager.getDeleteNullObj(formData);
			// 保存数据
			saveData = formData;
			// 验证包名
			if(saveData){
				var isPackage = commonManager.validatePackageName(saveData.package);
				if(!isPackage){
					saveData = false;
				}
			}
			return saveData;
		},
		// 设置默认值
		setValues:function(defaultSourceObj){
			// console.log('/**读取到的默认值（原始未处理）**/');
			// console.log(defaultSourceObj);
			// 获取可以赋值的对象 树的value是对象
			var formValueConfig = commonManager.getFormatValues(defaultSourceObj.formConfig,this.formConfig.form);
			formPlane.fillValues(formValueConfig,config.formId);
		},
		// 保存数据
		saveValues:function(isSaveXmmapJson){
			// 获取保存的原始数据数据(格式未处理)
			var saveSourceData = commonManager.getValues();
			if(saveSourceData){
				commonManager.pageDetailsList = [];
				this.saveSourceData = saveSourceData;
				// 格式化原始保存数据
				var saveData = commonManager.formatSaveData(saveSourceData,this.defaultConfig);
				// 根据保存数据的表格地址设置默认表格显示字段
				if(saveData.table.field.length == 0){
					saveData.table.field = commonManager.getDefaultField(saveData.table.ajax.src,true);
				}
				// voId数据
				var isTrue = true;
				if(saveData.table.voId){
					commonManager.pageDetailsList.push({
						configName:'vo',
						detailId:saveData.table.voId,
					});
				}else{
					isTrue = false;
				}
				if(isTrue){
					// 保存
					var pageConfig = {
						config:JSON.stringify(saveData)
					};
					// config.voData.pageConfig = JSON.stringify(pageConfig);
					config.voData.pageConfig = pageConfig;
					var serverConfig = {
						programmerConfig:this.formData, // 程序员配置
					};
					config.serverConfig.programmerConfig = serverConfig.programmerConfig;
					config.voData.serverConfig = JSON.stringify(config.serverConfig);
					commonManager.ajaxSaveData(config.voData,isSaveXmmapJson);
				}else{
					nsAlert('vo不存在');
				}
			}
		},
		// 设置表单
		setEditorForm:function(valueObj){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本配置',
						id:'package',
					},
					{
						type:'table',
						label:'表格',
						id:'table',
						dataType:'list',
						isRequired:true,
					},
					{
						type:'saveData',
						label:'saveData',
						id:'saveData',
						dataType:'modal',
						isRequired:'true',
					}
				]
			};
			var formConfig = commonManager.getForm(formAttr);
			this.formConfig = formConfig;
			if(valueObj){
				commonManager.defaultValueInFormArr(this.formConfig.form,valueObj); // 设置默认值
			}
			formPlane.formInit(formConfig);
		},
		// 初始化 入口方法
		init:function(){
			// ajax 查询默认值
			commonManager.ajaxGetSaveConfig();
		}
	}
	// 单表单
	var singleFormManager = {
		// 单表单默认配置
		defaultConfig:{
			isFormHidden:false,
			isShowTitle:false,
			template:"singleForm",
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:"保存",
				},
			},
			getValueAjax:{},
			form:{
				field:[],
				idField:'id',
				keyField:'goodsShopVo',
			},
		},
		// 获取值
		getValues:function(){
			// 表单配置数据
			var formData = nsForm.getFormJSON(config.formId);
			this.formData = formData;
			// 不处理未设置的字段 删除未设置字段
			// var formDataDelete = commonManager.getDeleteNullObj(formData);
			// 保存数据
			var saveData = formData;
			// 验证包名
			if(saveData){
				var isPackage = commonManager.validatePackageName(saveData.package);
				if(!isPackage){
					saveData = false;
				}
			}
			return saveData;
		},
		// 设置默认值
		setValues:function(defaultSourceObj){
			// console.log('/******读取到的默认值（原始未处理）******/');
			// console.log(defaultSourceObj);
			// 获取可以赋值的对象 树的value是对象
			var formValueConfig = commonManager.getFormatValues(defaultSourceObj.formConfig,this.formConfig.form);
			formPlane.fillValues(formValueConfig,config.formId);
		},
		// 保存数据
		saveValues:function(){
			// 获取保存的原始数据数据(格式未处理)
			var saveSourceData = commonManager.getValues();
			if(saveSourceData){
				commonManager.pageDetailsList = [];
				this.saveSourceData = saveSourceData;
				// 格式化原始保存数据
				var saveData = commonManager.formatSaveData(saveSourceData,this.defaultConfig);
				// 根据保存数据的表格地址设置默认表格显示字段
				if(saveData.form.field.length == 0){
					saveData.form.field = commonManager.getDefaultField(saveData.saveData.ajax.src,false);
				}
				// voId数据
				var isTrue = true;
				var errorStr = '';
				if(saveData.form.voId){
					commonManager.pageDetailsList.push({
						configName:'vo',
						detailId:saveData.form.voId,
					});
				}else{
					isTrue = false;
					errorStr = '表单vo不存在';
				}
				if(isTrue){
					// 保存
					var pageConfig = {
						config:JSON.stringify(saveData)
					};
					// config.voData.pageConfig = JSON.stringify(pageConfig);
					config.voData.pageConfig = pageConfig;
					var serverConfig = {
						programmerConfig:this.formData, // 程序员配置
					};
					config.serverConfig.programmerConfig = serverConfig.programmerConfig;
					config.voData.serverConfig = JSON.stringify(config.serverConfig);
					commonManager.ajaxSaveData(config.voData);
				}else{
					nsAlert(errorStr);
				}
			}
		},
		// 设置表单
		setEditorForm:function(valueObj){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本配置',
						id:'package',
					},
					{
						type:'form',
						label:'form',
						id:'form',
						isRequired:true,
						isHaveBtns:true,
					},
					{
						type:'saveData',
						label:'saveData',
						id:'saveData',
						dataType:'modal',
						isRequired:false,
					},
					{
						type:'getValueAjax',
						label:'getValueAjax',
						id:'getValueAjax',
						dataType:'modal',
						isRequired:false,
					}
				]
			};
			var formConfig = commonManager.getForm(formAttr);
			this.formConfig = formConfig;
			if(valueObj){
				commonManager.defaultValueInFormArr(this.formConfig.form,valueObj); // 设置默认值
			}
			formPlane.formInit(formConfig);
		},
		// 初始化 入口方法
		init:function(){
			// ajax 查询默认值
			commonManager.ajaxGetSaveConfig();
		},
	}
	// 目录树
	var treeTableManager = {
		// 读到的数据
		readyData:{
			tree:{},
			refData:{},
		},
		// 目录树默认配置
		defaultConfig:{
			isFormHidden:false,
			isShowTitle:false,
			template:"treeTable",
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:"保存",
				},
			},
			tree:{
				btns:'',
				src:'',
				data:"{}",
				type:"GET",
				dataSrc:"rows",
				column:"4",
				title:"",
				idField:"id",
				parentIdField:"parentId",
				textField:"catename",
				valueField:"cateid",
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
			table:{
				ajax:{},
				field:[],
				btns:'',
				tableRowBtns:'',
				idField:'id',
				keyField:'id',
				title:'',
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
			form:{
				ajax:{},
				field:[],
				btns:'',
				idField:'id',
				keyField:'id',
				title:'',
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
		},
		form:{
			ajax:{},
			field:[],
			btns:'',
			idField:'id',
			keyField:'id',
			title:'',
			add:{ type : 'dialog' },
			edit:{ type : 'dialog' },
			delete:{ type : 'confirm' },
		},
		table:{
			ajax:{},
			field:[],
			btns:'',
			tableRowBtns:'',
			idField:'id',
			keyField:'id',
			title:'',
			add:{ type : 'dialog' },
			edit:{ type : 'dialog' },
			delete:{ type : 'confirm' },
		},
		// 获取值
		getValues:function(){
			// 表单配置数据
			var formData = nsForm.getFormJSON(config.formId);
			this.formData = formData;
			// 不处理未设置的字段 删除未设置字段
			// var formDataDelete = commonManager.getDeleteNullObj(formData);
			// 保存树数据
			var saveData = formData;
			if($('#'+config.treeId).length>0){
				var formTreeData = nsForm.getFormJSON(config.treeId);
				this.formData = [formData,formTreeData];
				// var formTreeDataDelete = commonManager.getDeleteNullObj(formTreeData);
				if(saveData && formTreeData){
					for(var key in formTreeData){
						saveData[key] = formTreeData[key];
					}
				}
			}
			// 验证包名
			if(saveData){
				var isPackage = commonManager.validatePackageName(saveData.package);
				if(!isPackage){
					saveData = false;
				}
			}
			return saveData;
		},
		// 设置默认值
		setValues:function(defaultSourceObj){
			// console.log('/******读取到的默认值（原始未处理）******/');
			// console.log(defaultSourceObj);
			if($.isArray(defaultSourceObj.formConfig)){
				// 获取可以赋值的对象 树的value是对象
				var formValueConfig = commonManager.getFormatValues(defaultSourceObj.formConfig[0],this.formConfig.form);
				// 转化数组
				formValueConfig['tree-config'] = formValueConfig['tree-config'].split(',');
				this.readyData.tree = $.extend(true,{},formValueConfig);
				// 判断树配置（表单/表格）刷新出配置页面
				if(formValueConfig['tree-config']){
					this.readyData.refData = $.extend(true,{},defaultSourceObj.formConfig[1]);
					this.refreshTreeConfig(formValueConfig['tree-config']);
				}
				formPlane.fillValues(formValueConfig,config.formId);
			}else{
				// 获取可以赋值的对象 树的value是对象
				var formValueConfig = commonManager.getFormatValues(defaultSourceObj.formConfig,this.formConfig.form);
				formPlane.fillValues(formValueConfig,config.formId);
			}
		},
		// 保存数据
		saveValues:function(){
			// 获取保存的原始数据数据(格式未处理)
			var saveSourceData = this.getValues();
			if(saveSourceData){
				commonManager.pageDetailsList = [];
				this.saveSourceData = saveSourceData;
				// 格式化原始保存数据
				var saveData = commonManager.formatSaveData(saveSourceData,this.defaultConfig);
				if(typeof(saveData.tree.config)=='undefined'){
					delete saveData.form;
					delete saveData.table;
				}else{
					// 判断配置（表单/表格)
					switch(saveData.tree.config){
						case 'form':
							saveData.form.field = typeof(saveData.form.field) == 'undefined' ? [] : saveData.form.field;
							// 根据保存数据的表单地址设置默认表单显示字段
							if(saveData.form.field.length == 0){
								saveData.form.field = commonManager.getDefaultField(saveData.form.ajax.src,false);
							}
							delete saveData.table;
							break;
						case 'table':
							saveData.table.field = typeof(saveData.table.field) == 'undefined' ? [] : saveData.table.field;
							// 根据保存数据的表单地址设置默认表单显示字段
							if(saveData.table.field.length == 0){
								saveData.table.field = commonManager.getDefaultField(saveData.table.ajax.src,false);
							}
							delete saveData.form;
							break;
						default:
							saveData.form.field = typeof(saveData.form.field) == 'undefined' ? [] : saveData.form.field;
							// 根据保存数据的表单地址设置默认表单显示字段
							if(saveData.form.field.length == 0){
								saveData.form.field = commonManager.getDefaultField(saveData.form.ajax.src,false);
							}
							saveData.table.field = typeof(saveData.table.field) == 'undefined' ? [] : saveData.table.field;
							// 根据保存数据的表单地址设置默认表单显示字段
							if(saveData.table.field.length == 0){
								saveData.table.field = commonManager.getDefaultField(saveData.table.ajax.src,false);
							}
							break;
					}
				}
				
				// voId数据
				var isTrue = true;
				var errorStr = '';
				if(saveData.form){
					if(saveData.form.voId){
						commonManager.pageDetailsList.push({
							configName:'form.vo',
							detailId:saveData.form.voId,
						});
					}else{
						isTrue = false;
						errorStr += '表单vo不存在,';
					}
				}
				if(saveData.table){
					if(saveData.table.voId){
						commonManager.pageDetailsList.push({
							configName:'table.vo',
							detailId:saveData.table.voId,
						});
					}else{
						isTrue = false;
						errorStr += '表格vo不存在,';
					}
				}
				if(saveData.tree.voId){
					commonManager.pageDetailsList.push({
						configName:'tree.vo',
						detailId:saveData.tree.voId,
					});
				}else{
					isTrue = false;
					errorStr += '树vo不存在,';
				}
				if(isTrue){
					// 保存
					var pageConfig = {
						config:JSON.stringify(saveData)
					};
					// config.voData.pageConfig = JSON.stringify(pageConfig);
					config.voData.pageConfig = pageConfig;
					var serverConfig = {
						programmerConfig:this.formData, // 程序员配置
					};
					config.serverConfig.programmerConfig = serverConfig.programmerConfig;
					config.voData.serverConfig = JSON.stringify(config.serverConfig);
					commonManager.ajaxSaveData(config.voData);
				}else{
					nsAlert(errorStr);
				}
			}
		},
		// 设置表单
		setEditorForm:function(valueObj){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本配置',
						id:'package',
						isTree:true,
					},
					{
						type:'tree',
						label:'树',
						id:'tree',
						dataType:'list',
						isRequired:'true',
					},
					{
						type:'saveData',
						label:'saveData',
						id:'saveData',
						dataType:'modal',
						isRequired:'true',
					}
				]
			};
			var formConfig = commonManager.getForm(formAttr);
			this.formConfig = formConfig;
			if(valueObj){
				commonManager.defaultValueInFormArr(this.formConfig.form,valueObj); // 设置默认值
			}
			formPlane.formInit(formConfig);
		},
		// 刷新树配置（表单/表格）
		refreshTreeConfig:function(conId){
			// 清空容器
			if($('#'+config.treeId).length>0){
				var formData = nsForm.getFormJSON(config.treeId,false);
				this.readyData.refData = formData; // commonManager.getFormatValues(formData,this.formTypeConfig.form);
				$('#'+config.treeId).remove();
			}
			if(conId != '' && typeof(conId) != 'undefined'){
				// 插入容器
				$('#'+config.parentId).append('<div class="col-sm-12" id="'+config.treeId+'"></div>');
				var formAttr = {
					panels:[],
				}
				if($.isArray(conId)){
					for(var index=0;index<conId.length;index++){
						formAttr.panels.push(getTreeConfig(conId[index]));
					}
				}else{
					if(conId.indexOf(',')>0){
						var conIdArr = conId.split(',');
						for(var index=0;index<conIdArr.length;index++){
							formAttr.panels.push(getTreeConfig(conIdArr[index]));
						}
					}else{
						formAttr.panels.push(getTreeConfig(conId));
					}
				}
				function getTreeConfig(type){
					switch(type){
						case 'form':
							return {
								type:'form',
								label:'表单',
								id:'form',
								isRequired:true,
								isHaveAjax:true,
								dataType:'modal',
								isHaveBtns:true,
							}
							break;
						case 'table':
							return {
								type:'table',
								label:'表格',
								id:'table',
								dataType:'list',
								isRequired:'true',
							}
							break;
					}
				}
				var formConfig = commonManager.getForm(formAttr,true);
				// 如果有数据则赋默认值
				if(!$.isEmptyObject(this.readyData.refData)){
					// formPlane.fillValues(this.readyData.refData,config.treeId);
					for(index=0;index<formConfig.form.length;index++){
						if(this.readyData.refData[formConfig.form[index].id]){
							formConfig.form[index].value = this.readyData.refData[formConfig.form[index].id];
						}
					}
				}
				this.formTypeConfig = formConfig;
				formPlane.formInit(formConfig);
			}
		},
		// 初始化 入口方法
		init:function(){
			// ajax 查询默认值
			commonManager.ajaxGetSaveConfig();
		},
	}
	// tab表格
	var tabFormListManager = {
		// tab表格默认配置
		defaultConfig:{
			form:{
				field:[],
				idField:'id',
				keyField:'id',
			},
			getValueAjax:{},
			isFormHidden:false,
			isShowTitle:false,
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:'保存',
				},
			},
			tab:[], // 二维数组
			template:"tabFormList",
			title:"",
		},
		// 获取值
		getValues:function(){
			// 表单配置数据
			var formData = nsForm.getFormJSON(config.formId);
			this.formData = formData;
			// 不处理未设置的字段 删除未设置字段
			// var formDataDelete = commonManager.getDeleteNullObj(formData);
			// 保存表单数据
			var saveFormData = formData;
			var isTrue = commonManager.setFormVoIdByGetOrSave(saveFormData);
			if(isTrue){
				var tableData = baseDataTable.allTableData(config.tableId);
				this.tableData = tableData;
				var saveTableData = [];
				for(index=0;index<tableData.length;index++){
					var tableDataObj = tableData[index];
					delete tableDataObj.id;
					delete tableDataObj.handle;
					saveTableData.push(tableDataObj);
				}
				// 验证包名
				if(saveFormData){
					var isPackage = commonManager.validatePackageName(saveFormData.package);
					if(!isPackage){
						var saveData = false;
					}else{
						var saveData = {
							table:saveTableData,
							form:saveFormData,
						}
					}
				}
				return saveData;
			}else{
				return false;
			}
		},
		// 设置默认值
		setValues:function(defaultSourceObj){
			// console.log('/**读取到的默认值（原始未处理）**/');
			// console.log(defaultSourceObj);
			// 获取可以赋值的对象 树的value是对象
			var formValueConfig = commonManager.getFormatValues(defaultSourceObj.formConfig.form,this.formConfig.form);
			formPlane.fillValues(formValueConfig,config.formId);
			this.setEditorTable.data.dataSource = defaultSourceObj.formConfig.tab;
			this.setEditorTable.init();
		},
		// 保存数据
		saveValues:function(){
			// 获取保存的原始数据数据(格式未处理)
			var saveSourceData = this.getValues();
			if(saveSourceData){
				commonManager.pageDetailsList = [];
				this.saveSourceData = saveSourceData;
				// 格式化原始表单数据
				var saveData = commonManager.formatSaveData(saveSourceData.form,this.defaultConfig);
				var sourceTabs = $.extend(true,[],saveData.tab);
				saveData.tab = [];
				for(var indexI=0;indexI<saveSourceData.table.length;indexI++){
					var isHaveSave = false;
					for(var tabI=0;tabI<sourceTabs.length;tabI++){
						if(sourceTabs[tabI][0].gid == saveSourceData.table[indexI].gid){
							isHaveSave = true;
							var tabsData = commonManager.formatSaveData(saveSourceData.table[indexI],sourceTabs[tabI][0],'tab['+tabI+']');
							saveData.tab[indexI] = [tabsData];
						}
					}
					if(!isHaveSave){
						var tabsData = commonManager.formatSaveData(saveSourceData.table[indexI],commonManager.defaultConfig,'tab['+tabI+']');
						saveData.tab[indexI] = [tabsData];
					}
				}
				// 为模板赋默认配置
				if(saveData.form.field.length==0){
					// 根据保存数据的表格地址设置默认表格显示字段
					if(saveData.form.field.length == 0){
						saveData.form.field = commonManager.getDefaultField(saveData.saveData.ajax.src,false);
					}
				}
				// 表格默认配置
				for(index=0;index<saveData.tab.length;index++){
					if(typeof(saveData.tab[index][0].field) == 'undefined' || saveData.tab[index][0].field.length == 0){
						if(typeof(saveData.tab[index][0].field) != 'string'){
							saveData.tab[index][0].field = commonManager.getDefaultField(saveData.saveData.ajax.src,true);
						}
						if(typeof(saveData.tab[index][0].title)=='undefined' || saveData.tab[index][0].title==''){
							// saveData.tab[index][0].title = 'tab' + index;
							saveData.tab[index][0].title = '';
						}
					}
				}
				// voId数据
				var isTrue = true;
				var errorStr = '';
				if(saveData.form.voId){
					commonManager.pageDetailsList.push({
						configName:'form.vo',
						detailId:saveData.form.voId,
					});
				}else{
					isTrue = false;
					errorStr += '表单vo不存在,';
				}
				for(index=0;index<saveData.tab.length;index++){
					if(saveData.tab[index][0].voId){
						commonManager.pageDetailsList.push({
							configName:'tab['+index+']vo',
							detailId:saveData.tab[index][0].voId,
						});
					}else{
						isTrue = false;
						errorStr += 'tab表格vo不存在,';
					}
				}
				if(isTrue){
					// 保存
					var pageConfig = {
						config:JSON.stringify(saveData),
					};
					// config.voData.pageConfig = JSON.stringify(pageConfig);
					config.voData.pageConfig = pageConfig;
					var serverConfig = {
						programmerConfig:{
							form:this.formData,
							tab:this.tableData,
						}, // 程序员配置
					};
					config.serverConfig.programmerConfig = serverConfig.programmerConfig;
					config.voData.serverConfig = JSON.stringify(config.serverConfig);
					commonManager.ajaxSaveData(config.voData);
				}else{
					nsAlert(errorStr);
				}
			}
		},
		// 设置表单
		setEditorForm:function(valueObj){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本配置',
						id:'package',
					},
					{
						type:'form',
						label:'表单',
						id:'form',
						isRequired:'true',
						isHaveBtns:false,
					},
					{
						type:'saveData',
						label:'saveData',
						id:'saveData',
						dataType:'controller',
						isRequired:'true',
					},
					{
						type:'getValueAjax',
						label:'getValueAjax',
						id:'getValueAjax',
						dataType:'modal',
						isRequired:'true',
					}
				]
			};
			var formConfig = commonManager.getForm(formAttr);
			this.formConfig = formConfig;
			if(valueObj){
				commonManager.defaultValueInFormArr(this.formConfig.form,valueObj); // 设置默认值
			}
			formPlane.formInit(formConfig);
		},
		// 设置表格
		setEditorTable:{
			// 弹框配置
			dialog:{
				id: 	"plane-page",
				title: 	'',
				size: 	"m",
				form: 	[],
				btns:[
					{
						text: 		'确认',
						handler: 	function(){}
					}
				],
			},
			// 数据
			data:{
				tableID:		'',
				dataSource: 	[],
			},
			// 表格列配置
			column:[
				{
					field : 'voId',
					title : 'voId',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden:true,
				},{
					field : 'formSource',
					title : 'formSource',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden:true,
				},{
					field : 'type',
					title : '类型',
					width : 80,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'keyField',
					title : 'keyField',
					width : 120,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'idField',
					title : '主键',
					width : 50,
					tabPosition : 0,
					orderable : true,
				},
				{
					field : 'btns',
					title : '外部按钮',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:function(value, rowData){
						var methodName = commonManager.getMethodChineseName(value);
						return methodName;
					}
				},
				{
					field : 'tableRowBtns',
					title : '行内按钮',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:function(value, rowData){
						var methodName = commonManager.getMethodChineseName(value);
						return methodName;
					}
				},
			],
			// ui配置
			ui:{
				pageLengthMenu: 5,			//显示5行
				isSingleSelect:true,		//是否开启单行选中
				isUseTabs:true,
				tabsName:['1','2'],
			},
			// 表格上按钮
			btns:{
				selfBtn:[
					{
						text:'新增',
						handler:function(){
							tabFormListManager.setEditorTable.add();
						}
					}
				]
			},
			// 表格行按钮
			columnBtns:[
				{'修改':function(rowData){
						tabFormListManager.setEditorTable.edit(rowData);
					},
				},
				{'删除':function(rowData){
						tabFormListManager.setEditorTable.delete(rowData);
					},
				},
				{'上移':function(rowData){
						tabFormListManager.setEditorTable.moveUp(rowData);
					},
				},
				{'下移':function(rowData){
						tabFormListManager.setEditorTable.moveDown(rowData);
					},
				},
			],
			// 表格Html
			getTableHtml:function(){
				return '<div class="table-responsive">'
						+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+config.tableId+'">'
						+'</table>'
					+'</div>'
			},
			// 初始化方法
			init:function(){
				// 初始化表格id
				var dataConfig = $.extend(true,[],this.data);
				dataConfig.tableID = config.tableId;
				// 初始化容器
				// 表格存在初始化ui配置表格容器
				// 表格不存在在表格容器中插入表格
				var uiConfig = $.extend(true,[],this.ui);
				if($('#'+config.tableParentId).children().length>0 || typeof(baseDataTable.data[config.tableId]) == 'object'){
					uiConfig.$container = $('#'+config.tableParentId);
				}else{
					var tableHtml = this.getTableHtml();
					$('#'+config.tableParentId).append(tableHtml);
				}
				var columnConfig = $.extend(true,[],this.column);
				// 初始化列操作
				columnConfig.push({
					field:'handle',
					title:'操作',
					width : 200,
					tabPosition:'after',
					formatHandler:{
						type:'button',
						data:tabFormListManager.setEditorTable.columnBtns,
					}
				});
				var btnsConfig = $.extend(true,[],this.btns);
				// 初始化表格
				baseDataTable.init(dataConfig, columnConfig, uiConfig, btnsConfig);
			},
			// 表单数组
			getFormArr:function(){
				var formAttr = 
				{
					panels:[
						{
							type:'table',
							label:'',
							id:'',
							dataType:'list',
							isRequired:'true',
							isType:true,
							isAjax:false,
						}
					]
				};
				var formConfig = commonManager.getForm(formAttr);
				var formArr = formConfig.form;
				for(index=0;index<formArr.length;index++){
					if(formArr[index].id){
						formArr[index].id = formArr[index].id.substring(1);
					}
				}
				return formArr;
			},
			// 为表单赋初值
			defaultValue:function(arr,defdata){
				for(index=0;index<arr.length;index++){
					if(defdata[arr[index].id]){
						arr[index].value = defdata[arr[index].id];
					}
				}
			},
			// 表格新增
			add:function(){
				var formArr = this.getFormArr();
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = '新增';
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						dialogData.gid = nsTemplate.newGuid();
						var rowsData = [dialogData];
						baseDataTable.addTableRowData(config.tableId,rowsData);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			// 行修改
			edit:function(rowData){
				var formArr = this.getFormArr();
				this.defaultValue(formArr,rowData.rowData);
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = '修改';
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						var tableLineData = $.extend(true,{},dialogData);
						var origalTableData = $.extend(true,{},rowData);
						var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
						for(var key in origalData){
							if(typeof(tableLineData[key])!='undefined'){
								if(tableLineData[key] != origalData[key]){
									origalData[key] = tableLineData[key];
								}
							}
						}
						baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			// 行删除
			delete:function(rowData){
				nsConfirm("确认要删除吗？",function(isdelete){
					if(isdelete){
						var trObj = rowData.obj.closest('tr');
						baseDataTable.delRowData('page-table',trObj);
					}
				},"success");
			},
			// 上移
			moveUp:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==0){
					nsAlert("已经是第一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition-1];
					tableData[newPosition-1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
			// 下移
			moveDown:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==tableData.length-1){
					nsAlert("已经是最后一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition+1];
					tableData[newPosition+1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
		},
		// 初始化 入口方法
		init:function(){
			// ajax 查询默认值
			commonManager.ajaxGetSaveConfig();
		},
	}
	// 列表过滤
	var listFilterManager = {
		// 列表过滤默认配置
		defaultConfig:{
			isFormHidden:false,
			isShowTitle:false,
			title:"",
			mode:'',
			isSearch : '',
			template:"listFilter",
			package:"",
			getValueAjax:{},
			placeholder : '',
			saveData:{
				ajax:{},
				save:{
					text:'保存',
				},
			},
			form:{
				field:[],
				idField:'id',
				keyField:'id',
				btns:'',
				title:'',
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
			table:{
				ajax:{},
				field:[],
				btns:'',
				tableRowBtns:'',
				idField:'id',
				keyField:'volist',
				title:'',
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
		},
		// 获取值
		getValues:function(){
			// 表单配置数据
			var formData = nsForm.getFormJSON(config.formId);
			this.formData = formData;
			// 不处理未设置的字段 删除未设置字段
			// var formDataDelete = commonManager.getDeleteNullObj(formData);
			// 保存数据
			var saveData = formData;
			// if(saveData['getValueAjax-src'] == '' && saveData['saveData-src'] == ''){
			// 	nsAlert('getValueAjax和saveData都不存在模板无意义，不可生成');
			// 	console.error(saveData);
			// 	return false;
			// }else{
			// 	if(saveData['getValueAjax-src'] != ''){
			// 		var voId = commonManager.getVoIdByMethodId(saveData['getValueAjax-src']);
			// 		if(saveData['saveData-src'] != ''){
			// 			var voId2 = commonManager.getVoIdByMethodId(saveData['saveData-src']);
			// 			if(voId != voId2){
			// 				nsAlert('getValueAjax和saveData必须是同一个');
			// 				console.error('getValueAjax:'+voId);
			// 				console.error('saveData:'+voId2);
			// 				return false;
			// 			}
			// 		}
			// 	}else{
			// 		var voId = commonManager.getVoIdByMethodId(saveData['saveData-src']);
			// 	}
			// 	formData['form-voId'] = voId;
			// }
			// 验证包名
			if(saveData){
				var isTrue = commonManager.setFormVoIdByGetOrSave(saveData);
				if(isTrue){
					var isPackage = commonManager.validatePackageName(saveData.package);
					if(!isPackage){
						var saveData = false;
					}
				}else{
					var saveData = false;
				}
			}
			return saveData;
		},
		// 设置默认值
		setValues:function(defaultSourceObj){
			// console.log('/******读取到的默认值（原始未处理）******/');
			// console.log(defaultSourceObj);
			// 获取可以赋值的对象 树的value是对象
			var formValueConfig = commonManager.getFormatValues(defaultSourceObj.formConfig,this.formConfig.form);
			formPlane.fillValues(formValueConfig,config.formId);
		},
		// 保存数据
		saveValues:function(){
			// 获取保存的原始数据数据(格式未处理)
			var saveSourceData = commonManager.getValues();
			if(saveSourceData){
				commonManager.pageDetailsList = [];
				this.saveSourceData = saveSourceData;
				// 格式化原始表单数据
				var saveData = commonManager.formatSaveData(saveSourceData,this.defaultConfig);
				// 根据保存数据的表格地址设置默认 表格/表单 显示字段
				if(saveData.table.field.length == 0){
					saveData.table.field = commonManager.getDefaultField(saveData.table.ajax.src,true);
				}
				if(saveData.form.field.length == 0){
					saveData.form.field = commonManager.getDefaultField(saveData.table.ajax.src,false);
				}
				// voId数据
				var isTrue = true;
				var errorStr = '';
				if(saveData.form.voId){
					commonManager.pageDetailsList.push({
						configName:'form.vo',
						detailId:saveData.form.voId,
					});
				}else{
					isTrue = false;
					errorStr += '表单vo不存在,';
				}
				if(saveData.table.voId){
					commonManager.pageDetailsList.push({
						configName:'table.vo',
						detailId:saveData.table.voId,
					});
				}else{
					isTrue = false;
					errorStr += '表格vo不存在,';
				}
				if(isTrue){
					// 保存
					var pageConfig = {
						config:JSON.stringify(saveData)
					};
					// config.voData.pageConfig = JSON.stringify(pageConfig);
					config.voData.pageConfig = pageConfig;
					var serverConfig = {
						programmerConfig:this.formData, // 程序员配置
					};
					config.serverConfig.programmerConfig = serverConfig.programmerConfig;
					config.voData.serverConfig = JSON.stringify(config.serverConfig);
					commonManager.ajaxSaveData(config.voData);
				}else{
					nsAlert(errorStr);
				}
			}
		},
		// 设置表单
		setEditorForm:function(valueObj){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本配置',
						id:'package',
					},
					{
						type:'form',
						label:'表单',
						id:'form',
						dataType:'list',
						isRequired:true,
						isHaveBtns:true,
						isShowVoId:true,
					},
					{
						type:'table',
						label:'表格',
						id:'table',
						dataType:'list',
						isRequired:true,
					},
					{
						type:'saveData',
						label:'saveData',
						id:'saveData',
						dataType:'modal',
					},
					{
						type:'getValueAjax',
						label:'getValueAjax',
						id:'getValueAjax',
						dataType:'controller',
					}
				]
			};
			var formConfig = commonManager.getForm(formAttr);
			this.formConfig = formConfig;
			if(valueObj){
				commonManager.defaultValueInFormArr(this.formConfig.form,valueObj); // 设置默认值
			}
			formPlane.formInit(formConfig);
		},
		// 初始化 入口方法
		init:function(){
			// ajax 查询默认值
			commonManager.ajaxGetSaveConfig();
		},
	}
	// 表单表格
	var formTableManager = {
		// 表单表格默认配置
		defaultConfig:{
			form:{
				field:[],
				idField:'id',
				keyField:'id',
				btns:'',
			},
			getValueAjax:{},
			isFormHidden:false,
			isShowTitle:false,
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:'保存',
				},
			},
			table:[], // 一维数组
			template:"formTable",
			title:"",
		},
		// 获取值
		getValues:function(){
			// 表单配置数据
			var formData = nsForm.getFormJSON(config.formId);
			this.formData = formData;
			// 不处理未设置的字段 删除未设置字段
			// var formDataDelete = commonManager.getDeleteNullObj(formData);
			// 保存表单数据
			var saveFormData = formData;
			var isTrue = commonManager.setFormVoIdByGetOrSave(saveFormData);
			if(isTrue){
				var tableData = baseDataTable.allTableData(config.tableId);
				this.tableData = tableData;
				var saveTableData = [];
				for(index=0;index<tableData.length;index++){
					var tableDataObj = tableData[index];
					delete tableDataObj.id;
					delete tableDataObj.handle;
					saveTableData.push(tableDataObj);
				}
				// 验证包名
				if(saveFormData){
					var isPackage = commonManager.validatePackageName(saveFormData.package);
					if(!isPackage){
						var saveData = false;
					}else{
						var saveData = {
							table:saveTableData,
							form:saveFormData,
						}
					}
				}
				return saveData;
			}else{
				return false;
			}
		},
		// 设置默认值
		setValues:function(defaultSourceObj){
			// console.log('/**读取到的默认值（原始未处理）**/');
			// console.log(defaultSourceObj);
			// 获取可以赋值的对象 树的value是对象
			var formValueConfig = commonManager.getFormatValues(defaultSourceObj.formConfig.form,this.formConfig.form);
			formPlane.fillValues(formValueConfig,config.formId);
			this.setEditorTable.data.dataSource = defaultSourceObj.formConfig.table;
			this.setEditorTable.init();
		},
		// 保存数据
		saveValues:function(){
			// 获取保存的原始数据数据(格式未处理)
			var saveSourceData = this.getValues();
			if(saveSourceData){
				commonManager.pageDetailsList = [];
				this.saveSourceData = saveSourceData;
				// 格式化原始表单数据
				var saveData = commonManager.formatSaveData(saveSourceData.form,this.defaultConfig);
				var sourceTabs = $.extend(true,[],saveData.table);
				saveData.table = [];
				for(var indexI=0;indexI<saveSourceData.table.length;indexI++){
					var isHaveSave = false;
					for(var tabI=0;tabI<sourceTabs.length;tabI++){
						if(sourceTabs[tabI].gid == saveSourceData.table[indexI].gid){
							isHaveSave = true;
							var tabsData = commonManager.formatSaveData(saveSourceData.table[indexI],sourceTabs[tabI],'table['+indexI+']');
							saveData.table[indexI] = tabsData;
						}
					}
					if(!isHaveSave){
						var tabsData = commonManager.formatSaveData(saveSourceData.table[indexI],commonManager.defaultConfig,'table['+indexI+']');
						saveData.table[indexI] = tabsData;
					}
				}
				// 为模板赋默认配置
				if(saveData.form.field.length==0){
					// 根据保存数据的表格地址设置默认表格显示字段
					if(saveData.form.field.length == 0){
						if(saveData.saveData){
							saveData.form.field = commonManager.getDefaultField(saveData.saveData.ajax.src,false);
						}else{
							if(saveData.getValueAjax){
								saveData.form.field = commonManager.getDefaultField(saveData.getValueAjax.src,false);
							}
						}
					}
				}
				// 表格默认配置
				for(index=0;index<saveData.table.length;index++){
					if(typeof(saveData.table[index].field) == 'undefined' || saveData.table[index].field.length == 0){
						if(typeof(saveData.table[index].field) != 'string'){
							if(saveData.saveData){
								saveData.table[index].field = commonManager.getDefaultField(saveData.saveData.ajax.src,true);
							}else{
								if(saveData.getValueAjax){
									saveData.table[index].field = commonManager.getDefaultField(saveData.getValueAjax.src,true);
								}
							}
							// saveData.table[index].field = commonManager.getDefaultField(saveData.saveData.ajax.src,true);
						}
						if(typeof(saveData.table[index].title)=='undefined' || saveData.table[index].title==''){
							// saveData.table[index].title = 'table' + index;
							saveData.table[index].title = '';
						}
					}
				}
				// voId数据
				var isTrue = true;
				var errorStr = '';
				if(saveData.form.voId){
					commonManager.pageDetailsList.push({
						configName:'form.vo',
						detailId:saveData.form.voId,
					});
				}else{
					isTrue = false;
					errorStr += '表单vo不存在,';
				}
				for(index=0;index<saveData.table.length;index++){
					if(saveData.table[index].voId){
						commonManager.pageDetailsList.push({
							configName:'table['+index+']vo',
							detailId:saveData.table[index].voId,
						});
					}else{
						isTrue = false;
						errorStr += 'table表格vo不存在,';
					}
				}
				if(isTrue){
					// 保存
					var pageConfig = {
						config:JSON.stringify(saveData),
					};
					// config.voData.pageConfig = JSON.stringify(pageConfig);
					config.voData.pageConfig = pageConfig;
					var serverConfig = {
						programmerConfig:{
							form:this.formData,
							tab:this.tableData,
						}, // 程序员配置
					};
					config.serverConfig.programmerConfig = serverConfig.programmerConfig;
					config.voData.serverConfig = JSON.stringify(config.serverConfig);
					commonManager.ajaxSaveData(config.voData);
				}else{
					nsAlert(errorStr);
				}
			}
		},
		// 设置表单
		setEditorForm:function(valueObj){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本配置',
						id:'package',
					},
					{
						type:'form',
						label:'表单',
						id:'form',
						isRequired:false,
						isHaveBtns:true,
					},
					{
						type:'saveData',
						label:'saveData',
						id:'saveData',
						dataType:'controller',
						isRequired:false,
					},
					{
						type:'getValueAjax',
						label:'getValueAjax',
						id:'getValueAjax',
						dataType:'modal',
						isRequired:false,
					}
				]
			};
			var formConfig = commonManager.getForm(formAttr);
			this.formConfig = formConfig;
			if(valueObj){
				commonManager.defaultValueInFormArr(this.formConfig.form,valueObj); // 设置默认值
			}
			formPlane.formInit(formConfig);
		},
		// 设置表格
		setEditorTable:{
			// 弹框配置
			dialog:{
				id: 	"plane-page",
				title: 	'',
				size: 	"m",
				form: 	[],
				btns:[
					{
						text: 		'确认',
						handler: 	function(){}
					}
				],
			},
			// 数据
			data:{
				tableID:		'',
				dataSource: 	[],
			},
			// 表格列配置
			column:[
				{
					field : 'voId',
					title : 'voId',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden: true,
				},{
					field : 'formSource',
					title : 'formSource',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden:true,
				},{
					field : 'type',
					title : '类型',
					width : 80,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'keyField',
					title : 'keyField',
					width : 120,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'idField',
					title : '主键',
					width : 50,
					tabPosition : 0,
					orderable : true,
				},
				{
					field : 'btns',
					title : '外部按钮',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:function(value, rowData){
						var methodName = commonManager.getMethodChineseName(value);
						return methodName;
					}
				},
				{
					field : 'tableRowBtns',
					title : '行内按钮',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:function(value, rowData){
						var methodName = commonManager.getMethodChineseName(value);
						return methodName;
					}
				},
			],
			// ui配置
			ui:{
				pageLengthMenu: 5,			//显示5行
				isSingleSelect:true,		//是否开启单行选中
				isUseTabs:true,
				tabsName:['1','2'],
			},
			// 表格上按钮
			btns:{
				selfBtn:[
					{
						text:'新增',
						handler:function(){
							tabFormListManager.setEditorTable.add();
						}
					}
				]
			},
			// 表格行按钮
			columnBtns:[
				{'修改':function(rowData){
						tabFormListManager.setEditorTable.edit(rowData);
					},
				},
				{'删除':function(rowData){
						tabFormListManager.setEditorTable.delete(rowData);
					},
				},
				{'上移':function(rowData){
						tabFormListManager.setEditorTable.moveUp(rowData);
					},
				},
				{'下移':function(rowData){
						tabFormListManager.setEditorTable.moveDown(rowData);
					},
				},
			],
			// 表格Html
			getTableHtml:function(){
				return '<div class="table-responsive">'
						+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+config.tableId+'">'
						+'</table>'
					+'</div>'
			},
			// 初始化方法
			init:function(){
				// 初始化表格id
				var dataConfig = $.extend(true,[],this.data);
				dataConfig.tableID = config.tableId;
				// 初始化容器
				// 表格存在初始化ui配置表格容器
				// 表格不存在在表格容器中插入表格
				var uiConfig = $.extend(true,[],this.ui);
				if($('#'+config.tableParentId).children().length>0 || typeof(baseDataTable.data[config.tableId]) == 'object'){
					uiConfig.$container = $('#'+config.tableParentId);
				}else{
					var tableHtml = this.getTableHtml();
					$('#'+config.tableParentId).append(tableHtml);
				}
				var columnConfig = $.extend(true,[],this.column);
				// 初始化列操作
				columnConfig.push({
					field:'handle',
					title:'操作',
					width : 200,
					tabPosition:'after',
					formatHandler:{
						type:'button',
						data:tabFormListManager.setEditorTable.columnBtns,
					}
				});
				var btnsConfig = $.extend(true,[],this.btns);
				// 初始化表格
				baseDataTable.init(dataConfig, columnConfig, uiConfig, btnsConfig);
			},
			// 表单数组
			getFormArr:function(){
				var formAttr = 
				{
					panels:[
						{
							type:'table',
							label:'',
							id:'',
							dataType:'list',
							isRequired:'true',
							isType:true,
							isAjax:false,
						}
					]
				};
				var formConfig = commonManager.getForm(formAttr);
				var formArr = formConfig.form;
				for(index=0;index<formArr.length;index++){
					if(formArr[index].id){
						formArr[index].id = formArr[index].id.substring(1);
					}
				}
				return formArr;
			},
			// 为表单赋初值
			defaultValue:function(arr,defdata){
				for(index=0;index<arr.length;index++){
					if(defdata[arr[index].id]){
						arr[index].value = defdata[arr[index].id];
					}
				}
			},
			// 表格新增
			add:function(){
				var formArr = this.getFormArr();
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = '新增';
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						dialogData.gid = nsTemplate.newGuid();
						var rowsData = [dialogData];
						baseDataTable.addTableRowData(config.tableId,rowsData);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			// 行修改
			edit:function(rowData){
				var formArr = this.getFormArr();
				this.defaultValue(formArr,rowData.rowData);
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = '修改';
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						var tableLineData = $.extend(true,{},dialogData);
						var origalTableData = $.extend(true,{},rowData);
						var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
						for(var key in origalData){
							if(typeof(tableLineData[key])!='undefined'){
								if(tableLineData[key] != origalData[key]){
									origalData[key] = tableLineData[key];
								}
							}
						}
						baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			// 行删除
			delete:function(rowData){
				nsConfirm("确认要删除吗？",function(isdelete){
					if(isdelete){
						var trObj = rowData.obj.closest('tr');
						baseDataTable.delRowData('page-table',trObj);
					}
				},"success");
			},
			// 上移
			moveUp:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==0){
					nsAlert("已经是第一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition-1];
					tableData[newPosition-1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
			// 下移
			moveDown:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==tableData.length-1){
					nsAlert("已经是最后一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition+1];
					tableData[newPosition+1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
		},
		// 初始化 入口方法
		init:function(){
			// ajax 查询默认值
			commonManager.ajaxGetSaveConfig();
		},
	}
	// 移动端表单
	var mobileFormManager = {
		// 移动端表单默认配置
		defaultConfig:{
			title:"",
			package:"",
			mode:'',
			template:"mobileForm",
			isFormHidden:false,
			isShowTitle:false,
			btns:'',
			form:[], // 一维数组
			getValueAjax:{},
			saveData:{
				ajax:{},
				save:{
					text:'保存',
				},
			},
		},
		// 获取值
		getValues:function(){
			// 表单配置数据
			var formData = nsForm.getFormJSON(config.formId);
			this.formData = formData;
			// 不处理未设置的字段 删除未设置字段
			// var formDataDelete = commonManager.getDeleteNullObj(formData);
			// 保存表单数据
			var saveFormData = formData;
			var isTrue = commonManager.setFormVoIdByGetOrSave(saveFormData);
			if(isTrue){
				var tableData = baseDataTable.allTableData(config.tableId);
				this.tableData = tableData;
				var saveTableData = [];
				for(index=0;index<tableData.length;index++){
					var tableDataObj = tableData[index];
					delete tableDataObj.id;
					delete tableDataObj.handle;
					saveTableData.push(tableDataObj);
				}
				// 验证包名
				if(saveFormData){
					var isPackage = commonManager.validatePackageName(saveFormData.package);
					if(!isPackage){
						var saveData = false;
					}else{
						var saveData = {
							table:saveTableData,
							form:saveFormData,
						}
					}
				}
				return saveData;
			}else{
				return false;
			}
		},
		// 设置默认值
		setValues:function(defaultSourceObj){
			// console.log('/**读取到的默认值（原始未处理）**/');
			// console.log(defaultSourceObj);
			// 获取可以赋值的对象 树的value是对象
			var formValueConfig = commonManager.getFormatValues(defaultSourceObj.formConfig.form,this.formConfig.form);
			formPlane.fillValues(formValueConfig,config.formId);
			this.setEditorTable.data.dataSource = defaultSourceObj.formConfig.tab;
			this.setEditorTable.init();
		},
		// 保存数据
		saveValues:function(){
			// 获取保存的原始数据数据(格式未处理)
			var saveSourceData = this.getValues();
			if(saveSourceData){
				commonManager.pageDetailsList = [];
				this.saveSourceData = saveSourceData;
				// 格式化原始表单数据
				var saveData = commonManager.formatSaveData(saveSourceData.form,this.defaultConfig);
				var sourceforms = $.extend(true,[],saveData.form);
				saveData.form = [];
				for(var indexI=0;indexI<saveSourceData.table.length;indexI++){
					var isHaveSave = false;
					for(var formI=0;formI<sourceforms.length;formI++){
						if(sourceforms[formI].gid == saveSourceData.table[indexI].gid){
							isHaveSave = true;
							var tabsData = commonManager.formatSaveData(saveSourceData.table[indexI],sourceforms[formI],'form['+formI+']');
							saveData.form[indexI] = tabsData;
						}
					}
					if(!isHaveSave){
						var tabsData = commonManager.formatSaveData(saveSourceData.table[indexI],commonManager.defaultConfig,'form['+formI+']');
						saveData.form[indexI] = tabsData;
					}
				}
				// 表格默认配置
				for(index=0;index<saveData.form.length;index++){
					if(typeof(saveData.form[index].field) == 'undefined' || saveData.form[index].field.length == 0){
						if(typeof(saveData.form[index].field) != 'string'){
							saveData.form[index].field = commonManager.getDefaultField(saveData.saveData.ajax.src,true);
						}
						if(typeof(saveData.form[index].title)=='undefined' || saveData.form[index].title==''){
							saveData.form[index].title = '';
						}
					}
				}
				// voId数据
				var isTrue = true;
				var errorStr = '';
				for(index=0;index<saveData.form.length;index++){
					if(saveData.form[index].voId){
						commonManager.pageDetailsList.push({
							configName:'form['+index+']vo',
							detailId:saveData.form[index].voId,
						});
					}else{
						isTrue = false;
						errorStr += '表单vo不存在,';
					}
				}
				if(isTrue){
					// 保存
					var pageConfig = {
						config:JSON.stringify(saveData),
					};
					// config.voData.pageConfig = JSON.stringify(pageConfig);
					config.voData.pageConfig = pageConfig;
					var serverConfig = {
						programmerConfig:{
							form:this.formData,
							tab:this.tableData,
						}, // 程序员配置
					};
					config.serverConfig.programmerConfig = serverConfig.programmerConfig;
					config.voData.serverConfig = JSON.stringify(config.serverConfig);
					commonManager.ajaxSaveData(config.voData);
				}else{
					nsAlert(errorStr);
				}
			}
		},
		// 设置表单
		setEditorForm:function(valueObj){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本配置',
						id:'package',
					},{
						type:'btns',
						label:'按钮',
						id:'',
					},
					{
						type:'saveData',
						label:'saveData',
						id:'saveData',
						dataType:'controller',
						isRequired:true,
					},
					{
						type:'getValueAjax',
						label:'getValueAjax',
						id:'getValueAjax',
						dataType:'modal',
						isRequired:false,
					}
				]
			};
			var formConfig = commonManager.getForm(formAttr);
			this.formConfig = formConfig;
			if(valueObj){
				commonManager.defaultValueInFormArr(this.formConfig.form,valueObj); // 设置默认值
			}
			formPlane.formInit(formConfig);
		},
		// 设置表格
		setEditorTable:{
			// 弹框配置
			dialog:{
				id: 	"plane-page",
				title: 	'',
				size: 	"m",
				form: 	[],
				btns:[
					{
						text: 		'确认',
						handler: 	function(){}
					}
				],
			},
			// 数据
			data:{
				tableID:		'',
				dataSource: 	[],
			},
			// 表格列配置
			column:[
				{
					field : 'voId',
					title : 'voId',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden:true,
				},{
					field : 'formSource',
					title : 'formSource',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden:true,
				},{
					field : 'isRoot',
					title : 'isRoot',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden:true,
				},{
					field : 'type',
					title : '类型',
					width : 80,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'keyField',
					title : 'keyField',
					width : 120,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'idField',
					title : '主键',
					width : 50,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'parentKeyField',
					title : 'parentKeyField',
					width : 80,
					tabPosition : 0,
					orderable : true,
				}
			],
			// ui配置
			ui:{
				pageLengthMenu: 5,			//显示5行
				isSingleSelect:true,		//是否开启单行选中
				isUseTabs:true,
				tabsName:['1'],
			},
			// 表格上按钮
			btns:{
				selfBtn:[
					{
						text:'新增',
						handler:function(){
							mobileFormManager.setEditorTable.add();
						}
					}
				]
			},
			// 表格行按钮
			columnBtns:[
				{'修改':function(rowData){
						mobileFormManager.setEditorTable.edit(rowData);
					},
				},
				{'删除':function(rowData){
						mobileFormManager.setEditorTable.delete(rowData);
					},
				},
				{'上移':function(rowData){
						mobileFormManager.setEditorTable.moveUp(rowData);
					},
				},
				{'下移':function(rowData){
						mobileFormManager.setEditorTable.moveDown(rowData);
					},
				},
			],
			// 表格Html
			getTableHtml:function(){
				return '<div class="table-responsive">'
						+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+config.tableId+'">'
						+'</table>'
					+'</div>'
			},
			// 初始化方法
			init:function(){
				// 初始化表格id
				var dataConfig = $.extend(true,[],this.data);
				dataConfig.tableID = config.tableId;
				// 初始化容器
				// 表格存在初始化ui配置表格容器
				// 表格不存在在表格容器中插入表格
				var uiConfig = $.extend(true,[],this.ui);
				if($('#'+config.tableParentId).children().length>0 || typeof(baseDataTable.data[config.tableId]) == 'object'){
					uiConfig.$container = $('#'+config.tableParentId);
				}else{
					var tableHtml = this.getTableHtml();
					$('#'+config.tableParentId).append(tableHtml);
				}
				var columnConfig = $.extend(true,[],this.column);
				// 初始化列操作
				columnConfig.push({
					field:'handle',
					title:'操作',
					width : 200,
					tabPosition:'after',
					formatHandler:{
						type:'button',
						data:mobileFormManager.setEditorTable.columnBtns,
					}
				});
				var btnsConfig = $.extend(true,[],this.btns);
				// 初始化表格
				baseDataTable.init(dataConfig, columnConfig, uiConfig, btnsConfig);
			},
			// 表单数组
			getFormArr:function(){
				var formAttr = 
				{
					panels:[
						{
							type:'mobileForm',
							label:'',
							id:'',
						}
					]
				};
				var formConfig = commonManager.getForm(formAttr);
				var formArr = formConfig.form;
				for(index=0;index<formArr.length;index++){
					if(formArr[index].id){
						formArr[index].id = formArr[index].id.substring(1);
					}
				}
				return formArr;
			},
			// 为表单赋初值
			defaultValue:function(arr,defdata){
				for(index=0;index<arr.length;index++){
					if(defdata[arr[index].id]){
						arr[index].value = defdata[arr[index].id];
					}
				}
			},
			// 表格新增
			add:function(){
				var formArr = this.getFormArr();
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = '新增';
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						dialogData.gid = nsTemplate.newGuid();
						var rowsData = [dialogData];
						baseDataTable.addTableRowData(config.tableId,rowsData);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			// 行修改
			edit:function(rowData){
				var formArr = this.getFormArr();
				this.defaultValue(formArr,rowData.rowData);
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = '修改';
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						var tableLineData = $.extend(true,{},dialogData);
						var origalTableData = $.extend(true,{},rowData);
						var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
						for(var key in origalData){
							if(typeof(tableLineData[key])!='undefined'){
								if(tableLineData[key] != origalData[key]){
									origalData[key] = tableLineData[key];
								}
							}
						}
						baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			// 行删除
			delete:function(rowData){
				nsConfirm("确认要删除吗？",function(isdelete){
					if(isdelete){
						var trObj = rowData.obj.closest('tr');
						baseDataTable.delRowData('page-table',trObj);
					}
				},"success");
			},
			// 上移
			moveUp:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==0){
					nsAlert("已经是第一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition-1];
					tableData[newPosition-1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
			// 下移
			moveDown:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==tableData.length-1){
					nsAlert("已经是最后一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition+1];
					tableData[newPosition+1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
		},
		// 初始化 入口方法
		init:function(){
			// ajax 查询默认值
			commonManager.ajaxGetSaveConfig();
		},
	}
	// 新模板 组件运用的是vue新组件
	var standardTemplateManager = {
		templateNameList:[
			{ id : 'businessDataBase', name : '基本业务对象' },
			{ id : 'processDocBase', name : '基本单据处理' },
			{ id : 'processDocSecond', name : '二次单据处理' },
			{ id : 'docListViewer', name : '单据详情列表' },
			{ id : 'businessDataBaseEditor', name : '基本业务对象编辑' },
			{ id : 'businesslevellist3', name : '业务对象三级列表模板' },
			{ id : 'statisticsBase', name : '基本统计模板' },
			{ id : 'processDocBaseMobile', name : '二次单据处理(手机端)' },
			{ id : 'businessDataBaseMobile', name : '基本业务对象(手机端)' },
			{ id : 'docListViewerMobile', name : '单据详情列表(手机端)' },
			{ id : 'limsReg', name : 'lims登记' },
			{ id : 'processDocBaseLevel2', name : '单据两级数据模板' },
			{ id : 'limsResultInput', name : 'lims结果录入' },
			{ id : 'limsReport', name : 'lims报告' },
			{ id : 'statisticsList', name : '统计列表' },
			{ id : 'treeForm', name : '树表单模板' },
			{ id : 'businessbasePanoramic', name : '基本业务全景模板' },
			{ id : 'businessDataBaseLevel3', name : '基本业务对象三级模板' },
			{ id : 'workRecordSimple', name : '简单作业记录模板' },
			{ id : 'workRecordSimpleMobile', name : '简单作业记录模板(手机端)' },//sjj 20200106
			{ id : 'listMobile', name : '单列表专用模板(手机端)' },	//sjj 20200106
			{ id : 'businessDataBaseEditorMobile', name : '基本业务对象编辑(手机端)' },
			{ id : 'statisticalPlan', name : '统计计划' },
		],
		position:{
			businessDataBase:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			processDocBase:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			processDocSecond:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			docListViewer:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			businessDataBaseEditor:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			businesslevellist3:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			statisticsBase:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			processDocBaseMobile:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			businessDataBaseMobile:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			docListViewerMobile:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			limsReg:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			processDocBaseLevel2:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			limsResultInput:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			limsReport:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			statisticsList:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			treeForm:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			businessbasePanoramic:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			businessDataBaseLevel3:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			workRecordSimple:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			workRecordSimpleMobile:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],//sjj 20200106
			listMobile:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],//sjj 20200106
			businessDataBaseEditorMobile:[
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
			statisticalPlan : [
				{ id : 'body', name : 'body' },
				{ id : 'header-right', name : 'header-right' },
				{ id : 'header-body', name : 'header-body' },
				{ id : 'footer', name : 'footer' },
				{ id : 'footer-right', name : 'footer-right' }
			],
		},
		typeObj:{},
		type:{
			vo : [
				{ id : 'idField', hidden : false},
				{ id : 'parent', hidden : false},
				{ id : 'keyField', hidden : false},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : false},
				{ id : 'ajax-src', hidden : false},
				{ id : 'ajax-data', hidden : false},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : false},
				{ id : 'params', hidden : false},

				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'listExpression', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				// { id : 'billType', hidden : true, value : ''},
				// { id : 'categories', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},
				// { id : 'isMultiple', hidden : true, value : ''},
				// { id : 'isAutoSave', hidden : true, value : ''},
				// { id : 'isTurnTree', hidden : true, value : ''},
				// { id : 'saveAjax-data', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},

				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},

				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			list : [
				{ id : 'idField', hidden : false},
				{ id : 'parent', hidden : false},
				{ id : 'keyField', hidden : false},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : false},
				{ id : 'ajax-src', hidden : false},
				{ id : 'ajax-data', hidden : false},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : false},
				{ id : 'params', hidden : false},
				
				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'listExpression', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				// { id : 'billType', hidden : true, value : ''},
				// { id : 'categories', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},

				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			tree : [
				{ id : 'idField', hidden : false},
				{ id : 'textField', hidden : false},
				{ id : 'childField', hidden : false},
				{ id : 'params', hidden : false},
				{ id : 'parentField', hidden : false},
				{ id : 'fromField', hidden : false},
				{ id : 'level', hidden : false},
				{ id : 'readonly', hidden : false},
				{ id : 'formatter', hidden : false},

				{ id : 'ajax-url', hidden : false},
				{ id : 'ajax-dataSrc', hidden : false},
				{ id : 'ajax-data', hidden : false},
				{ id : 'ajax-contentType', hidden : false},
				{ id : 'ajax-type', hidden : false},

				{ id : 'addAjax-url', hidden : false},
				{ id : 'addAjax-dataSrc', hidden : false},
				{ id : 'addAjax-data', hidden : false},
				{ id : 'addAjax-contentType', hidden : false},
				{ id : 'addAjax-type', hidden : false},

				{ id : 'editAjax-url', hidden : false},
				{ id : 'editAjax-dataSrc', hidden : false},
				{ id : 'editAjax-data', hidden : false},
				{ id : 'editAjax-contentType', hidden : false},
				{ id : 'editAjax-type', hidden : false},

				{ id : 'deleteAjax-url', hidden : false},
				{ id : 'deleteAjax-dataSrc', hidden : false},
				{ id : 'deleteAjax-data', hidden : false},
				{ id : 'deleteAjax-contentType', hidden : false},
				{ id : 'deleteAjax-type', hidden : false},

				{ id : 'moveAjax-url', hidden : false},
				{ id : 'moveAjax-dataSrc', hidden : false},
				{ id : 'moveAjax-data', hidden : false},
				{ id : 'moveAjax-contentType', hidden : false},
				{ id : 'moveAjax-type', hidden : false},

				{ id : 'unfieldId', hidden : false},
				{ id : 'unfieldText', hidden : false},
				{ id : 'allfieldId', hidden : false},
				{ id : 'allfieldText', hidden : false},
				// { id : 'isMultiple', hidden : false},
				// { id : 'isAutoSave', hidden : false},
				// { id : 'isTurnTree', hidden : false},
				// { id : 'saveAjax-data', hidden : false},

				{ id : 'ajax-src', hidden : true, value : ''},
				// { id : 'ajax-data', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'parent', hidden : true, value : ''},
				{ id : 'keyField', hidden : true, value : ''},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : true, value : ''},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				// { id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'valueField', hidden : true, value:''},
				{ id : 'pidField', hidden : true, value:''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : true, value : ''},
				{ id : 'listExpression', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				// { id : 'billType', hidden : true, value : ''},
				// { id : 'categories', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			btns : [
				{ id : 'idField', hidden : true, value : ''},
				{ id : 'parent', hidden : true, value : ''},
				{ id : 'keyField', hidden : true, value : ''},
				{ id : 'btns', hidden : false},
				{ id : 'voId', hidden : true, value : ''},
				{ id : 'ajax-src', hidden : true, value : ''},
				{ id : 'ajax-data', hidden : true, value : ''},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : false},
				{ id : 'params', hidden : false},
				{ id : 'operatorObject', hidden : false},
				
				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'listExpression', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				// { id : 'billType', hidden : true, value : ''},
				// { id : 'categories', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			class : [
				{ id : 'idField', hidden : true, value : ''},
				{ id : 'parent', hidden : true, value : ''},
				{ id : 'keyField', hidden : true, value : ''},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : true, value : ''},
				{ id : 'ajax-src', hidden : false},
				{ id : 'ajax-data', hidden : false},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : false},
				{ id : 'params', hidden : false},
				
				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'listExpression', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				// { id : 'billType', hidden : true, value : ''},
				// { id : 'categories', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			tab : [
				{ id : 'idField', hidden : true, value : ''},
				{ id : 'parent', hidden : true, value : ''},
				{ id : 'keyField', hidden : true, value : ''},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : true, value : ''},
				{ id : 'ajax-src', hidden : false},
				{ id : 'ajax-data', hidden :  false},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : false},
				{ id : 'position', hidden : false},
				{ id : 'params', hidden : false},
				
				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'listExpression', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				// { id : 'billType', hidden : true, value : ''},
				// { id : 'categories', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			uploadCover : [
				{ id : 'idField', hidden : false},
				{ id : 'parent', hidden : false},
				{ id : 'keyField', hidden : false},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : true, value : ''},
				{ id : 'ajax-src', hidden : true, value : ''},
				{ id : 'ajax-data', hidden :  true, value : ''},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : true, value : ''},
				{ id : 'params', hidden : false},
				{ id : 'imgIdField', hidden : false},
				// { id : 'billType', hidden : false},
				// { id : 'categories', hidden : false},
				{ id : 'imgNameField', hidden : false},
				{ id : 'uploadAjaxData', hidden : false},
				
				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'listExpression', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			blockList : [
				{ id : 'idField', hidden : false},
				{ id : 'parent', hidden : false},
				{ id : 'keyField', hidden : false},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : false},
				{ id : 'ajax-src', hidden : false},
				{ id : 'ajax-data', hidden : false},
				{ id : 'deleteAjax-src', hidden : false},
				{ id : 'deleteAjax-data', hidden : false},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : false},
				{ id : 'params', hidden : false},
				{ id : 'listExpression', hidden : false},
				{ id : 'isUseSearchInput', hidden : false},
				{ id : 'searchInputPlaceholder', hidden : false},
				{ id : 'isUseQRInput', hidden : false},
				
				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				// { id : 'billType', hidden : true, value : ''},
				// { id : 'categories', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			customize : [
				{ id : 'idField', hidden : false},
				{ id : 'parent', hidden : false},
				{ id : 'keyField', hidden : false},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : false},
				{ id : 'ajax-src', hidden : false},
				{ id : 'ajax-data', hidden : false},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : false},
				{ id : 'params', hidden : false},
				{ id : 'listExpression', hidden : false},

				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			pie : [
				{ id : 'idField', hidden : false},
				{ id : 'parent', hidden : false},
				{ id : 'keyField', hidden : false},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : false},
				{ id : 'ajax-src', hidden : false},
				{ id : 'ajax-data', hidden : false},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : false},
				{ id : 'params', hidden : false},
				{ id : 'listExpression', hidden : false},

				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			line : [
				{ id : 'idField', hidden : false},
				{ id : 'parent', hidden : false},
				{ id : 'keyField', hidden : false},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : false},
				{ id : 'ajax-src', hidden : false},
				{ id : 'ajax-data', hidden : false},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : false},
				{ id : 'params', hidden : false},
				{ id : 'listExpression', hidden : false},

				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			bar : [
				{ id : 'idField', hidden : false},
				{ id : 'parent', hidden : false},
				{ id : 'keyField', hidden : false},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : false},
				{ id : 'ajax-src', hidden : false},
				{ id : 'ajax-data', hidden : false},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : false},
				{ id : 'params', hidden : false},
				{ id : 'listExpression', hidden : false},

				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},
			],
			resultinput : [
				{ id : 'idField', hidden : false},
				{ id : 'parent', hidden : true, value:''},
				{ id : 'keyField', hidden : true, value:''},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : true, value:''},
				{ id : 'ajax-src', hidden : true, value:''},
				{ id : 'ajax-data', hidden : true, value:''},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : true, value:''},
				{ id : 'params', hidden : false},
				{ id : 'listExpression', hidden : true, value:''},

				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : false},
				{ id : 'tableAjax-dataSrc', hidden : false},
				{ id : 'tableAjax-contentType', hidden : false},
				{ id : 'tableAjax-type', hidden : false},
				{ id : 'tableAjax-data', hidden : false},
				
				{ id : 'saveAjax-url', hidden : false},
				{ id : 'saveAjax-dataSrc', hidden : false},
				{ id : 'saveAjax-contentType', hidden : false},
				{ id : 'saveAjax-type', hidden : false},
				{ id : 'saveAjax-data', hidden : false},
				
				{ id : 'historyAjax-url', hidden : false},
				{ id : 'historyAjax-dataSrc', hidden : false},
				{ id : 'historyAjax-contentType', hidden : false},
				{ id : 'historyAjax-type', hidden : false},
				{ id : 'historyAjax-data', hidden : false},

				{ id : 'getListAjax-url', hidden : true, value : ''},
				{ id : 'getListAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getListAjax-contentType', hidden : true, value : ''},
				{ id : 'getListAjax-type', hidden : true, value : ''},
				{ id : 'getListAjax-data', hidden : true, value : ''},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				
				{ id : 'nameField', hidden : true, value : ''},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : true, value : ''},

			],
			pdfList : [
				{ id : 'idField', hidden : false},
				{ id : 'parent', hidden : true, value:''},
				{ id : 'keyField', hidden : true, value:''},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : false},
				{ id : 'ajax-src', hidden : true, value:''},
				{ id : 'ajax-data', hidden : true, value:''},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : true, value:''},
				{ id : 'params', hidden : false},
				{ id : 'listExpression', hidden : true, value:''},

				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},

				{ id : 'nameField', hidden : false},
				{ id : 'fileField', hidden : false},
				
				{ id : 'tableAjax-url', hidden : true, value : ''},
				{ id : 'tableAjax-dataSrc', hidden : true, value : ''},
				{ id : 'tableAjax-contentType', hidden : true, value : ''},
				{ id : 'tableAjax-type', hidden : true, value : ''},
				{ id : 'tableAjax-data', hidden : true, value : ''},
				
				{ id : 'saveAjax-url', hidden : true, value : ''},
				{ id : 'saveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'saveAjax-contentType', hidden : true, value : ''},
				{ id : 'saveAjax-type', hidden : true, value : ''},
				{ id : 'saveAjax-data', hidden : true, value : ''},
				
				{ id : 'historyAjax-url', hidden : true, value : ''},
				{ id : 'historyAjax-dataSrc', hidden : true, value : ''},
				{ id : 'historyAjax-contentType', hidden : true, value : ''},
				{ id : 'historyAjax-type', hidden : true, value : ''},
				{ id : 'historyAjax-data', hidden : true, value : ''},

				{ id : 'getListAjax-url', hidden : false},
				{ id : 'getListAjax-dataSrc', hidden : false},
				{ id : 'getListAjax-contentType', hidden : false},
				{ id : 'getListAjax-type', hidden : false},
				{ id : 'getListAjax-data', hidden : false},

				{ id : 'getRecordAjax-url', hidden : true, value : ''},
				{ id : 'getRecordAjax-dataSrc', hidden : true, value : ''},
				{ id : 'getRecordAjax-contentType', hidden : true, value : ''},
				{ id : 'getRecordAjax-type', hidden : true, value : ''},
				{ id : 'getRecordAjax-data', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : false},
			],
			recordList : [
				{ id : 'idField', hidden : false},
				{ id : 'parent', hidden : true, value:''},
				{ id : 'keyField', hidden : true, value:''},
				{ id : 'btns', hidden : true, value : ''},
				{ id : 'voId', hidden : false},
				{ id : 'ajax-src', hidden : true, value:''},
				{ id : 'ajax-data', hidden : true, value:''},
				{ id : 'deleteAjax-src', hidden : true, value:''},
				{ id : 'deleteAjax-data', hidden : true, value:''},
				{ id : 'textField', hidden : true, value : ''},
				{ id : 'valueField', hidden : true, value : ''},
				{ id : 'pidField', hidden : true, value : ''},
				{ id : 'childField', hidden : true, value : ''},
				{ id : 'isSearch', hidden : true, value : ''},
				{ id : 'field', hidden : true, value : ''},
				{ id : 'position', hidden : true, value:''},
				{ id : 'params', hidden : false},
				{ id : 'listExpression', hidden : true, value:''},

				{ id : 'parentField', hidden : true, value : ''},
				{ id : 'fromField', hidden : true, value : ''},
				{ id : 'level', hidden : true, value : ''},
				{ id : 'readonly', hidden : true, value : ''},
				{ id : 'formatter', hidden : true, value : ''},
				{ id : 'imgIdField', hidden : true, value : ''},
				{ id : 'imgNameField', hidden : true, value : ''},

				{ id : 'ajax-url', hidden : true, value : ''},
				{ id : 'ajax-dataSrc', hidden : true, value : ''},
				{ id : 'ajax-contentType', hidden : true, value : ''},
				{ id : 'ajax-type', hidden : true, value : ''},

				{ id : 'addAjax-url', hidden : true, value : ''},
				{ id : 'addAjax-dataSrc', hidden : true, value : ''},
				{ id : 'addAjax-data', hidden : true, value : ''},
				{ id : 'addAjax-contentType', hidden : true, value : ''},
				{ id : 'addAjax-type', hidden : true, value : ''},

				{ id : 'editAjax-url', hidden : true, value : ''},
				{ id : 'editAjax-dataSrc', hidden : true, value : ''},
				{ id : 'editAjax-data', hidden : true, value : ''},
				{ id : 'editAjax-contentType', hidden : true, value : ''},
				{ id : 'editAjax-type', hidden : true, value : ''},

				{ id : 'deleteAjax-url', hidden : true, value : ''},
				{ id : 'deleteAjax-dataSrc', hidden : true, value : ''},
				{ id : 'deleteAjax-contentType', hidden : true, value : ''},
				{ id : 'deleteAjax-type', hidden : true, value : ''},

				{ id : 'moveAjax-url', hidden : true, value : ''},
				{ id : 'moveAjax-dataSrc', hidden : true, value : ''},
				{ id : 'moveAjax-data', hidden : true, value : ''},
				{ id : 'moveAjax-contentType', hidden : true, value : ''},
				{ id : 'moveAjax-type', hidden : true, value : ''},
				{ id : 'operatorObject', hidden : true, value : ''},
				{ id : 'uploadAjaxData', hidden : true, value : ''},
				
				{ id : 'unfieldId', hidden : true, value : ''},
				{ id : 'unfieldText', hidden : true, value : ''},
				{ id : 'allfieldId', hidden : true, value : ''},
				{ id : 'allfieldText', hidden : true, value : ''},
				
				{ id : 'isUseSearchInput', hidden : true, value : ''},
				{ id : 'searchInputPlaceholder', hidden : true, value : ''},
				{ id : 'isUseQRInput', hidden : true, value : ''},
				
				{ id : 'tableAjax-url', hidden : false},
				{ id : 'tableAjax-dataSrc', hidden : false},
				{ id : 'tableAjax-contentType', hidden : false},
				{ id : 'tableAjax-type', hidden : false},
				{ id : 'tableAjax-data', hidden : false},
				
				{ id : 'saveAjax-url', hidden : false},
				{ id : 'saveAjax-dataSrc', hidden : false},
				{ id : 'saveAjax-contentType', hidden : false},
				{ id : 'saveAjax-type', hidden : false},
				{ id : 'saveAjax-data', hidden : false},
				
				{ id : 'historyAjax-url', hidden : false},
				{ id : 'historyAjax-dataSrc', hidden : false},
				{ id : 'historyAjax-contentType', hidden : false},
				{ id : 'historyAjax-type', hidden : false},
				{ id : 'historyAjax-data', hidden : false},

				{ id : 'getListAjax-url', hidden : false},
				{ id : 'getListAjax-dataSrc', hidden : false},
				{ id : 'getListAjax-contentType', hidden : false},
				{ id : 'getListAjax-type', hidden : false},
				{ id : 'getListAjax-data', hidden : false},

				{ id : 'getRecordAjax-url', hidden : false},
				{ id : 'getRecordAjax-dataSrc', hidden : false},
				{ id : 'getRecordAjax-contentType', hidden : false},
				{ id : 'getRecordAjax-type', hidden : false},
				{ id : 'getRecordAjax-data', hidden : false},

				{ id : 'nameField', hidden : false},
				{ id : 'fileField', hidden : true, value : ''},
				{ id : 'templatePanel', hidden : false},
			],
		},
		positionName:'processDocSecond',
		// 表单表格默认配置
		defaultConfig:{
			package: '',
			template: '',
			title: '',
			readonly: false,
			isShowTitle: false,
			isFormHidden: false,
			versionNumber: "1",
			mode:'',
			pushMessage : '',
			pageExpression : '',
			isUseBtnPanelManager : false,
			params : {},
			plusClass : '',
			isSaveToTemplate : false,
			// isHaveSaveAndAdd:true,
			getValueAjax:{},
			draftBox : {},
			saveData:{
				ajax:{},
			},
			components:[]
		},
		componentsConfig:{
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
		},
		helpConfig : {
			base : {
				package : {
					title : '包名',
					name : 'package',
					value : getRootPath() + '/htmlpage/help.html',
				},
				template : {
					title : '模板名字',
					name : 'template',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'getValueAjax-src' : {
					title : 'getValueAjax地址',
					name : 'getValueAjax-src',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'getValueAjax-data' : {
					title : 'getValueAjax传参',
					name : 'getValueAjax-data',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'getValueAjax-suffix' : {
					title : 'getValueAjax地址后缀',
					name : 'getValueAjax-suffix',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'saveData-src' : {
					title : 'saveData地址',
					name : 'saveData-src',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'saveData-data' : {
					title : 'saveData传参',
					name : 'saveData-data',
					value : getRootPath() + '/htmlpage/help.html',
				}
			},
			dialog : {
				type : {
					title : '类型',
					name : 'type',
					value : getRootPath() + '/htmlpage/help.html',
				},
				params : {
					title : 'params',
					name : 'params',
					value : getRootPath() + '/htmlpage/help.html',
				},
				voId : {
					title : 'vo',
					name : 'voId',
					value : getRootPath() + '/htmlpage/help.html',
				},
				field : {
					title : 'field',
					name : 'field',
					value : getRootPath() + '/htmlpage/help.html',
				},
				idField : {
					title : 'idField',
					name : 'idField',
					value : getRootPath() + '/htmlpage/help.html',
				},
				keyField : {
					title : 'keyField',
					name : 'keyField',
					value : getRootPath() + '/htmlpage/help.html',
				},
				textField : {
					title : 'textField',
					name : 'textField',
					value : getRootPath() + '/htmlpage/help.html',
				},
				valueField : {
					title : 'valueField',
					name : 'valueField',
					value : getRootPath() + '/htmlpage/help.html',
				},
				pidField : {
					title : 'pidField',
					name : 'pidField',
					value : getRootPath() + '/htmlpage/help.html',
				},
				childField : {
					title : 'childField',
					name : 'childField',
					value : getRootPath() + '/htmlpage/help.html',
				},
				parent : {
					title : 'parent',
					name : 'parent',
					value : getRootPath() + '/htmlpage/help.html',
				},
				position : {
					title : 'position',
					name : 'position',
					value : getRootPath() + '/htmlpage/help.html',
				},
				isSearch : {
					title : 'isSearch',
					name : 'isSearch',
					value : getRootPath() + '/htmlpage/help.html',
				},
				btns : {
					title : 'btns',
					name : 'btns',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'ajax-src' : {
					title : 'ajax-src',
					name : 'ajax-src',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'ajax-url' : {
					title : 'ajax-url',
					name : 'ajax-url',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'ajax-data' : {
					title : 'ajax-data',
					name : 'ajax-data',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'ajax-type' : {
					title : 'ajax-type',
					name : 'ajax-type',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'ajax-dataSrc' : {
					title : 'ajax-dataSrc',
					name : 'ajax-dataSrc',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'ajax-contentType' : {
					title : 'ajax-contentType',
					name : 'ajax-contentType',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'deleteAjax-src' : {
					title : 'deleteAjax-src',
					name : 'deleteAjax-src',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'deleteAjax-url' : {
					title : 'deleteAjax-url',
					name : 'deleteAjax-url',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'deleteAjax-data' : {
					title : 'deleteAjax-data',
					name : 'deleteAjax-data',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'deleteAjax-type' : {
					title : 'deleteAjax-type',
					name : 'deleteAjax-type',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'deleteAjax-dataSrc' : {
					title : 'deleteAjax-dataSrc',
					name : 'deleteAjax-dataSrc',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'deleteAjax-contentType' : {
					title : 'deleteAjax-contentType',
					name : 'deleteAjax-contentType',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'parentField' : {
					title : 'parentField',
					name : 'parentField',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'fromField' : {
					title : 'fromField',
					name : 'fromField',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'level' : {
					title : 'level',
					name : 'level',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'readonly' : {
					title : 'readonly',
					name : 'readonly',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'addAjax-url' : {
					title : 'addAjax-url',
					name : 'addAjax-url',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'addAjax-data' : {
					title : 'addAjax-data',
					name : 'addAjax-data',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'addAjax-type' : {
					title : 'addAjax-type',
					name : 'addAjax-type',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'addAjax-dataSrc' : {
					title : 'addAjax-dataSrc',
					name : 'addAjax-dataSrc',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'addAjax-contentType' : {
					title : 'addAjax-contentType',
					name : 'addAjax-contentType',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'editAjax-url' : {
					title : 'editAjax-url',
					name : 'editAjax-url',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'editAjax-data' : {
					title : 'editAjax-data',
					name : 'editAjax-data',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'editAjax-type' : {
					title : 'editAjax-type',
					name : 'editAjax-type',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'editAjax-dataSrc' : {
					title : 'editAjax-dataSrc',
					name : 'editAjax-dataSrc',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'editAjax-contentType' : {
					title : 'editAjax-contentType',
					name : 'editAjax-contentType',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'moveAjax-url' : {
					title : 'moveAjax-url',
					name : 'moveAjax-url',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'moveAjax-data' : {
					title : 'moveAjax-data',
					name : 'moveAjax-data',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'moveAjax-type' : {
					title : 'moveAjax-type',
					name : 'moveAjax-type',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'moveAjax-dataSrc' : {
					title : 'moveAjax-dataSrc',
					name : 'moveAjax-dataSrc',
					value : getRootPath() + '/htmlpage/help.html',
				},
				'moveAjax-contentType' : {
					title : 'moveAjax-contentType',
					name : 'moveAjax-contentType',
					value : getRootPath() + '/htmlpage/help.html',
				},
				listExpression : {
					title : 'listExpression',
					name : 'listExpression',
					value : getRootPath() + '/htmlpage/help.html',
				},
				formatter : {
					title : 'formatter',
					name : 'formatter',
					value : getRootPath() + '/htmlpage/help.html',
				},
				imgIdField : {
					title : 'imgIdField',
					name : 'imgIdField',
					value : getRootPath() + '/htmlpage/help.html',
				},
				billType : {
					title : 'billType',
					name : 'billType',
					value : getRootPath() + '/htmlpage/help.html',
				},
				categories : {
					title : 'categories',
					name : 'categories',
					value : getRootPath() + '/htmlpage/help.html',
				},
				imgNameField : {
					title : 'imgNameField',
					name : 'imgNameField',
					value : getRootPath() + '/htmlpage/help.html',
				},
			}
		},
		// 获取值
		getValues:function(){
			// 表单配置数据
			var formData = nsForm.getFormJSON(config.formId);
			this.formData = formData;
			// 保存表单数据
			var saveFormData = formData;
			// 保存表格数据
			var tableData = baseDataTable.allTableData(config.tableId);
			this.tableData = tableData;
			var saveTableData = [];
			for(index=0;index<tableData.length;index++){
				var tableDataObj = tableData[index];
				delete tableDataObj.id;
				delete tableDataObj.handle;
				saveTableData.push(tableDataObj);
			}
			// 验证包名
			if(saveFormData){
				var isPackage = commonManager.validatePackageName(saveFormData.package);
				if(!isPackage){
					var saveData = false;
				}else{
					var saveData = {
						table:saveTableData,
						form:saveFormData,
					}
				}
			}
			return saveData;
		},
		// 保存数据
		saveValues2:function(){
			// 获取保存的原始数据数据(格式未处理)
			var saveSourceData = this.getValues();
			if(saveSourceData){
				commonManager.pageDetailsList = [];
				this.saveSourceData = saveSourceData;
				// 格式化原始表单数据
				var saveData = commonManager.formatSaveData(saveSourceData.form, this.defaultConfig);
				var sourceTabs = $.extend(true,[],saveData.components);
				saveData.components = [];
				for(var indexI=0;indexI<saveSourceData.table.length;indexI++){
					var isHaveSave = false;
					for(var tabI=0;tabI<sourceTabs.length;tabI++){
						if(sourceTabs[tabI].gid == saveSourceData.table[indexI].gid){
							isHaveSave = true;
							var tabsData = commonManager.formatSaveData(saveSourceData.table[indexI],sourceTabs[tabI],'components['+indexI+']',"standardTemplate",sourceTabs[tabI].type);
							saveData.components[indexI] = tabsData;
						}
					}
					if(!isHaveSave){
						var tabsData = commonManager.formatSaveData(saveSourceData.table[indexI],this.componentsConfig,'components['+indexI+']', "standardTemplate",saveSourceData.table[indexI].type);
						saveData.components[indexI] = tabsData;
					}
				}
				// 验证vo是否改变 改变清空相关配置 不改变保存相关配置并保存到相关模板配置
				if(typeof(config.voData.serverConfig)=="string"){
					config.serverConfig = JSON.parse(config.voData.serverConfig);
				}
				// 表格默认配置
				for(index=0;index<saveData.components.length;index++){
					if( saveData.components[index].type=="vo"||
						saveData.components[index].type=="list"||
						saveData.components[index].type=="blockList"||
						saveData.components[index].type=="customize"||
						saveData.components[index].type=="pie"||
						saveData.components[index].type=="line"||
						saveData.components[index].type=="template"||
						saveData.components[index].type=="bar"
					){
						if(typeof(saveData.components[index].field) == 'undefined' || saveData.components[index].field.length == 0){
							if(saveData.getValueAjax && typeof(saveData.getValueAjax.src)=="string"){
								// var isForm = saveData.components[index].type=="vo"?false:true;
								var isForm = true;
								if( saveData.components[index].type=="vo"||
									saveData.components[index].type=="customize"||
									saveData.components[index].type=="pie"||
									saveData.components[index].type=="line"||
									saveData.components[index].type=="template"||
									saveData.components[index].type=="bar"
								){
									isForm = false;
								}
								saveData.components[index].field = commonManager.getDefaultField(saveData.getValueAjax.src,isForm);
							}
						}else{
							// 判断是改变vo 若改变重新设置状态 并删除产品配置的状态和隐藏字段及其它
							if(typeof(config.serverConfig.productConfig)=="object"){
								var productTableData = config.serverConfig.productConfig.tableData;
								for(produceTabI=0; produceTabI<productTableData.length; produceTabI++){
									if(productTableData[produceTabI].gid==saveData.components[index].gid){
										if(productTableData[produceTabI].type!=saveData.components[index].type){
											productTableData[produceTabI] = {
												type : saveData.components[index].type,
												gid : saveData.components[index].gid,
											}
										}else{
											if(productTableData[produceTabI].type=="vo"||productTableData[produceTabI].type=="list"){
												if(productTableData[produceTabI].voId!=saveData.components[index].voId){
													productTableData[produceTabI] = {
														type : saveData.components[index].type,
														gid : saveData.components[index].gid,
														voId : saveData.components[index].voId,
													}
													if(saveData.getValueAjax && typeof(saveData.getValueAjax.src)=="string"){
														// var isForm = saveData.components[index].type=="vo"?false:true;
														var isForm = true;
														if( saveData.components[index].type=="vo"||
															saveData.components[index].type=="customize"||
															saveData.components[index].type=="pie"||
															saveData.components[index].type=="line"||
															saveData.components[index].type=="template"||
															saveData.components[index].type=="bar"
														){
															isForm = false;
														}
														saveData.components[index].field = commonManager.getDefaultField(saveData.getValueAjax.src,isForm);
													}else{
														saveData.components[index].field = [];
													}
													delete saveData.components[index].hide;
												}
											}
										}
									}
								}
							}
						}
					}else{
						if(saveData.components[index].type=="btns"){
							if(typeof(saveData.components[index].btns)=="string"){
								saveData.components[index].field = saveData.components[index].btns;
								delete saveData.components[index].btns;
							}
						}
					}
				}
				// voId数据
				var isTrue = true;
				var errorStr = '';
				for(index=0;index<saveData.components.length;index++){
					if( saveData.components[index].type=="vo"||
						saveData.components[index].type=="list"||
						saveData.components[index].type=="blockList"||
						saveData.components[index].type=="customize"||
						saveData.components[index].type=="pie"||
						saveData.components[index].type=="line"||
						saveData.components[index].type=="template"||
						saveData.components[index].type=="bar"
					){
						if(saveData.components[index].voId){
							commonManager.pageDetailsList.push({
								configName:'components['+index+']vo',
								detailId:saveData.components[index].voId,
							});
						}else{
							isTrue = false;
							errorStr += 'components['+index+']vo不存在,';
						}
					}
				}
				console.log(saveData);
				console.log(commonManager.pageDetailsList);
				// 修改
				if(isTrue){
					// 保存
					var pageConfig = {
						config:JSON.stringify(saveData),
					};
					config.voData.pageConfig = pageConfig;
					var serverConfig = {
						programmerConfig:{
							form:this.formData,
							tab:this.tableData,
						}, // 程序员配置
					};
					config.serverConfig.programmerConfig = serverConfig.programmerConfig;
					console.log(config.serverConfig);
					config.voData.serverConfig = JSON.stringify(config.serverConfig);
					commonManager.ajaxSaveData(config.voData);
				}else{
					nsAlert(errorStr);
				}
			}
		},
		// 保存数据
		saveValues:function(){
			if(config.isSavePageConfig){
				standardTemplateManager.saveValues2();
				return;
			}
			// 获取保存的原始数据数据(格式未处理)
			var saveData = this.getValues();
			if(saveData){
				// voId数据
				var isTrue = true;
				var errorStr = '';
				for(index=0;index<saveData.table.length;index++){
					if( saveData.table[index].type=="vo"||
						saveData.table[index].type=="list"||
						saveData.table[index].type=="blockList"||
						saveData.table[index].type=="customize"||
						saveData.table[index].type=="pie"||
						saveData.table[index].type=="line"||
						saveData.table[index].type=="template"||
						saveData.table[index].type=="bar"
					){
						if(saveData.table[index].voId){
						}else{
							isTrue = false;
							errorStr += 'components['+index+']vo不存在,';
						}
					}
				}
				// 修改
				if(isTrue){
					var tableData = this.tableData;
					var tableDataObj = {};
					var tableDataIndex = [];
					for(var i=0; i<tableData.length; i++){
						tableDataObj[tableData[i].gid] = tableData[i];
						tableDataIndex.push(tableData[i].gid);
					}
					// 保存
					var programmerConfig = {
						form:this.formData,
						tab:tableDataObj,
						index : tableDataIndex,
					} // 程序员配置
					// 添加objectState
					programmerConfig = pageProperty.addObjectState(config.prevServerConfig.programmerConfig, programmerConfig);
					var pageConfig = $.extend(true, {}, config.serverConfig);
					pageConfig.programmerConfig = programmerConfig;
					pageConfig.entityNameArr = pageProperty.entityNameArr;
					pageConfig.isPageConfig = false;
					pageConfig = pageProperty.formatAjaxSaveData(pageConfig);
					console.log(pageConfig);
					config.serverConfig.productConfig = pageProperty.addObjectState(config.prevServerConfig.productConfig, config.serverConfig.productConfig);
					config.voData.pageConfig = { config : JSON.stringify(pageConfig)};
					config.voData.serverConfig = '';
					commonManager.ajaxSaveData(config.voData, false, false);
				}else{
					nsAlert(errorStr);
				}
			}
		},
		// 获取保存的原始配置数据
		// 根据原始配置数据
		// 设置表单
		setEditorForm:function(valueObj){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本配置',
						id:'package',
						isSelectTemplate:true,
					},
					{
						type:'getValueAjax',
						label:'getValueAjax',
						id:'getValueAjax',
						dataType:'controller',
						isRequired:false,
					},
					{
						type:'saveData',
						label:'saveData',
						id:'saveData',
						dataType:'controller',
						isRequired:false,
					}
				]
			};
			var formConfig = commonManager.getForm(formAttr);
			this.formConfig = formConfig;
			if(valueObj){
				commonManager.defaultValueInFormArr(this.formConfig.form,valueObj); // 设置默认值
				// 如果模板名字是：businessDataBaseEditor（基本业务对象编辑）那么saveData显示其它情况下不显示配置
				commonManager.setFormHideByValue(this.formConfig.form,valueObj,true); // 设置表单显示隐藏 
			}else{
				commonManager.setFormHideByValue(this.formConfig.form,{},true); // 设置表单显示隐藏 
			}
			formConfig.helpConfig = this.helpConfig.base;
			formPlane.formInit(formConfig);
		},
		// 设置表格
		setEditorTable:{
			// 弹框配置
			dialog:{
				id: 	"plane-page",
				title: 	'',
				size: 	"m",
				form: 	[],
				btns:[
					{
						text: 		'确认',
						handler: 	function(){}
					}
				],
			},
			// 数据
			data:{
				tableID:		'',
				dataSource: 	[],
			},
			// 表格列配置
			column:[
				{
					field : 'voId',
					title : 'voId',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden: true,
				},{
					field : 'type',
					title : '类型',
					width : 80,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'keyField',
					title : 'keyField',
					width : 120,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'idField',
					title : '主键',
					width : 50,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'position',
					title : 'position',
					width : 50,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'parent',
					title : 'parent',
					width : 50,
					tabPosition : 0,
					orderable : true,
				}
			],
			// ui配置
			ui:{
				pageLengthMenu: 10,			//显示5行
				isSingleSelect:true,		//是否开启单行选中
				isUseTabs:true,
				tabsName:['1'],
			},
			// 表格上按钮
			btns:{
				selfBtn:[
					{
						text:'新增',
						handler:function(){
							standardTemplateManager.setEditorTable.add();
						}
					}
				]
			},
			// 表格行按钮
			columnBtns:[
				{'修改':function(rowData){
						standardTemplateManager.setEditorTable.edit(rowData);
					},
				},
				{'删除':function(rowData){
						standardTemplateManager.setEditorTable.delete(rowData);
					},
				},
				{'上移':function(rowData){
						standardTemplateManager.setEditorTable.moveUp(rowData);
					},
				},
				{'下移':function(rowData){
						standardTemplateManager.setEditorTable.moveDown(rowData);
					},
				},
			],
			// 表格Html
			getTableHtml:function(){
				return '<div class="table-responsive">'
						+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+config.tableId+'">'
						+'</table>'
					+'</div>'
			},
			// 初始化方法
			init:function(){
				// 初始化表格id
				var dataConfig = $.extend(true,[],this.data);
				dataConfig.tableID = config.tableId;
				// 初始化容器
				// 表格存在初始化ui配置表格容器
				// 表格不存在在表格容器中插入表格
				var uiConfig = $.extend(true,[],this.ui);
				if($('#'+config.tableParentId).children().length>0 || typeof(baseDataTable.data[config.tableId]) == 'object'){
					uiConfig.$container = $('#'+config.tableParentId);
				}else{
					var tableHtml = this.getTableHtml();
					$('#'+config.tableParentId).append(tableHtml);
				}
				var columnConfig = $.extend(true,[],this.column);
				// 初始化列操作
				columnConfig.push({
					field:'handle',
					title:'操作',
					width : 200,
					tabPosition:'after',
					formatHandler:{
						type:'button',
						data:standardTemplateManager.setEditorTable.columnBtns,
					}
				});
				var btnsConfig = $.extend(true,[],this.btns);
				// 初始化表格
				baseDataTable.init(dataConfig, columnConfig, uiConfig, btnsConfig);

				this.dialog.helpConfig = standardTemplateManager.helpConfig.dialog;
			},
			// 表单数组
			getFormArr:function(){
				var formAttr = 
				{
					panels:[
						{
							type:'standard',
							label:'',
							id:'',
							dataType:'controller',
						}
					]
				};
				var formConfig = commonManager.getForm(formAttr);
				var formArr = formConfig.form;
				return formArr;
			},
			// 为表单赋初值
			defaultValue:function(arr,defdata){
				var type = defdata.type ? defdata.type : 'vo';
				var typeShowObj = standardTemplateManager.typeObj[type];
				for(index=0;index<arr.length;index++){
					if(defdata[arr[index].id] || defdata[arr[index].id] === ''){
						arr[index].value = defdata[arr[index].id];
					}
					if(typeof(typeShowObj[arr[index].id]) == 'boolean'){
						arr[index].hidden = typeShowObj[arr[index].id];
						if(arr[index].hidden == true){
							arr[index].value = '';
						}
					}
				}
			},
			// 表格新增
			add:function(){
				var formArr = this.getFormArr();
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = '新增';
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						dialogData.gid = nsTemplate.newGuid();
						var rowsData = [dialogData];
						baseDataTable.addTableRowData(config.tableId,rowsData);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			// 行修改
			edit:function(rowData){
				var formArr = this.getFormArr();
				this.defaultValue(formArr,rowData.rowData);
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = '修改';
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						var tableLineData = $.extend(true,{},dialogData);
						var origalTableData = $.extend(true,{},rowData);
						var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
						for(var key in tableLineData){
							if(typeof(origalData[key])=='undefined'){
								origalData[key] = tableLineData[key];
							}else{
								if(tableLineData[key] != origalData[key]){
									origalData[key] = tableLineData[key];
								}
							}
						}
						baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			// 行删除
			delete:function(rowData){
				nsConfirm("确认要删除吗？",function(isdelete){
					if(isdelete){
						var trObj = rowData.obj.closest('tr');
						baseDataTable.delRowData('page-table',trObj);
					}
				},"success");
			},
			// 上移
			moveUp:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==0){
					nsAlert("已经是第一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition-1];
					tableData[newPosition-1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
			// 下移
			moveDown:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==tableData.length-1){
					nsAlert("已经是最后一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition+1];
					tableData[newPosition+1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
		},
		// 初始化 入口方法
		init:function(){
			var typeObj = {};
			var typeArr = this.type;
			for(var key in typeArr){
				typeObj[key] = {};
				for(var i=0;i<typeArr[key].length;i++){
					typeObj[key][typeArr[key][i].id] = typeArr[key][i].hidden;
				}
			}
			this.typeObj = typeObj;
			// ajax 查询默认值
			commonManager.ajaxGetSaveConfig();
		},
	}
	// 关联调用
	var templateManager = {
		doubleTables:doubleTablesManager,
		singleTable:singleTableManager,
		singleForm:singleFormManager,
		treeTable:treeTableManager,
		tabFormList:tabFormListManager,
		listFilter:listFilterManager,
		formTable:formTableManager,
		mobileForm:mobileFormManager,
		standardTemplate:standardTemplateManager,
	}
	function init(_config){
		/***
		 *{
		 * 	formId: 		表单id
		 * 	tableId: 		表格id
		 * 	treeId: 
		 * 	tableParentId:
		 * 	parentId:
		 *  xmmapToJson: 	思维导图/sourceJSON
		 *  templateAttr: 	模板属性
		 *  voData: 		vo相关数据
		 *  voMapObj: 		思维导图数组集合
		 *  voMapSelectTree:生成树
		 *}
		 ***/
		config = _config;
		//通用方法整理数据
		commonManager.init();
		commonManager.treeData = config.voMapSelectTree;
		//根据模板类型显示编辑器
		var templateName = config.templateAttr.template;
		this.currentTemplateName = templateName;
		templateManager[templateName].init();
	}
	function saveData(isSaveXmmapJson){
		templateManager[config.templateAttr.template].saveValues(isSaveXmmapJson);
	}
	return {
		init:init,
		commonManager:commonManager,
		doubleTablesManager:doubleTablesManager,
		singleTableManager:singleTableManager,
		singleFormManager:singleFormManager,
		treeTableManager:treeTableManager,
		tabFormListManager:tabFormListManager,
		saveData:saveData,
		getConfig:function(){
			return config;
		},
	}
})(jQuery)
var pagePropertyProduct = (function($){
	//通用方法
	var commonManager = {
		name:'', //vo的名字
		fields:{
			label:{
				element:'label',
				width:'100%',
			},
			text:{
				type:'text',
				column:4,
			},
			select:{
				type:'select',
				textField:'name',
				valueField:'id',
				column:4,
			},
			radio:{
				type:'radio',
				textField:'name',
				valueField:'id',
				column:4,
				subdata:[
					{
						id:'base',
						name:'base',
					},{
						id:'more',
						name:'more',
					},
				],
			},
			select2:{
				type:'select2',
				textField:'name',
				valueField:'id',
				multiple:true,
				column:4,
			},
			selectType:{
				type:'select',
				textField:'name',
				valueField:'id',
				column:4,
				subdata:[
					{id:'none',name:'none'},
					{id:'dialog',name:'dialog'},
					{id:'confirm',name:'confirm'},
					{id:'multi',name:'insertform'},
					{id:'component',name:'component'},
				]
			},
			isCloseWindow:{
				type:'radio',
				textField:'name',
				valueField:'id',
				column:4,
				subdata:[
					{id:'true',name:'true'},
					{id:'false',name:'false'},
				]
			},
			textarea:{
				type:'textarea',
				column:4,
			},
			inputselect:{
				type: 					'input-select',
				column: 				4,
				selectConfig:				{
					textField:			'text',
					valueField:			'id',
					subdata:			[
						{
							text:'s',
							id:'s'
						},{
							text:'m',
							id:'m'
						},{
							text:'b',
							id:'b'
						},{
							text:'f',
							id:'f'
						}
					]
				}
			},
			formSource:{
				type:'select',
				textField:'name',
				valueField:'id',
				subdata:[
					{ id : 'halfScreen', name : '半屏模式' },
					{ id : 'fullScreen', name : '全屏模式' },
					{ id : 'inlineScreen', name : '行内模式' },
					{ id : 'staticData', name : '功能模式' },
				],
				column:4,
			},
			isTrue:{
				type:'radio',
				textField:'name',
				valueField:'id',
				column:6,
				subdata:[
					{
						id:'true',
						name:'true',
					},{
						id:'false',
						name:'false',
					},
				],
			},
			checkbox:{
				type:'checkbox',
				textField:'name',
				valueField:'id',
				column:4,
			}
		},
		form:{
			id: 		'', 		//初始化时赋值
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true, 
		},
		tableConfig:{
			ajax:{},
			field:[],
			btns:'',
			tableRowBtns:'',
			idField:'voId',
			title:'',
			add:{ type : 'dialog' },
			edit:{ type : 'dialog' },
			delete:{ type : 'confirm' },
		},
		// ajax获取保存的配置
		getSaveConfigByAjax:function(){
			var ajaxConfig = {
				url : getRootPath()+"/templateMindPages/" + config.voData.id,
				type:"GET",
				dataType:"json",
				contentType:'application/x-www-form-urlencoded',
			}
			NetStarUtils.ajax(ajaxConfig,function(res){
				config.isSavePageConfig = true; // 是否保存页面配置 最新存在层级关系的页面不保存
				// if($.isArray(res.rows)){
				// 	config.isSavePageConfig = false;
				// 	if(res.rows.length == 1 && res.rows[0].serverConfig && res.rows[0].serverConfig.length > 0){
				// 		res.data = res.rows[0];
				// 		var pageConfigArr = [res.rows[0].pageConfig ? res.rows[0].pageConfig : "{}"];
				// 		var prevServerConfig = pageProperty.getAllConfigByObjectState(pageConfigArr, false);
				// 		config.prevServerConfig = prevServerConfig;
				// 	}else{
				// 		var pageConfigArr = [];
				// 		for(var i=0; i<res.rows.length; i++){
				// 			pageConfigArr.push(res.rows[i].pageConfig ? res.rows[i].pageConfig : "{}");
				// 		}
				// 		var serverConfig = pageProperty.getAllConfigByObjectState(pageConfigArr, true);
				// 		var prevServerConfig = pageProperty.getAllConfigByObjectState(pageConfigArr, false);
				// 		config.serverConfig = serverConfig;
				// 		config.prevServerConfig = prevServerConfig;
				// 		// 初始化通用方法
				// 		commonManager.init();
				// 		// 初始化编辑配置
				// 		templateManager[config.templateAttr.template].init();
				// 		return;
				// 	}
				// }
				if($.isArray(res.rows)){
					config.isSavePageConfig = false;
					var pageConfigArr = [];
					for(var i=0; i<res.rows.length; i++){
						if(res.rows[i].serverConfig && res.rows[i].serverConfig.length > 0){
							pageConfigArr.push(res.rows[i].serverConfig);
						}else{
							pageConfigArr.push(res.rows[i].pageConfig ? res.rows[i].pageConfig : "{}");
						}
					}
					var serverConfig = pageProperty.getAllConfigByObjectState(pageConfigArr, true);
					var prevServerConfig = pageProperty.getAllConfigByObjectState(pageConfigArr, false);
					config.serverConfig = serverConfig;
					config.prevServerConfig = prevServerConfig;
					// 初始化通用方法
					commonManager.init();
					// 初始化编辑配置
					templateManager[config.templateAttr.template].init();
					return;
				}
				// res.data.pageConfig = [res.data.pageConfig];
				if(typeof(res.data.pageConfig) == "string"){
					// 字符串转化对象
					function swichObj(_switchObj){
						if(typeof(_switchObj)=='string'){
							_switchObj = JSON.parse(_switchObj);
							_switchObj = swichObj(_switchObj);
							return _switchObj;
						}else{
							return _switchObj;
						}
					}
					// 初始化模板默认配置
					var pageConfig = JSON.parse(res.data.pageConfig);
					pageConfig = swichObj(pageConfig);
					config.voData.pageConfig = pageConfig;
					var pageConfigOriginal = JSON.parse(pageConfig.config);
					// console.log('/******模板配置******/');
					// console.log(pageConfigOriginal);
					if(config.templateAttr.template == pageConfigOriginal.template || config.templateAttr.template == "standardTemplate"){
						templateManager[config.templateAttr.template].defaultConfig = pageConfigOriginal;
					}else{
						nsAlert('后台配置基本参数错误，可能是修改了模板，请检查','error');
						console.error(pageConfigOriginal);
						return false;
					}
					
				}else{
					if($.isArray(res.data.pageConfig) && res.data.pageConfig.length > 0){
						config.isSavePageConfig = false;
						var _serverConfig = pageProperty.getAllConfigByObjectState(res.data.pageConfig, true);
						var prevServerConfig = pageProperty.getAllConfigByObjectState(res.data.pageConfig, false);
						serverConfig = _serverConfig;
						config.prevServerConfig = prevServerConfig;
						config.serverConfig = serverConfig;
						// 初始化通用方法
						commonManager.init();
						// 初始化编辑配置
						templateManager[config.templateAttr.template].init();
						return;
					}else{
						if(res.data.serverConfig){
							// 模板表单配置
							var serverConfig = JSON.parse(res.data.serverConfig);
							config.serverConfig = serverConfig;
							// 初始化通用方法
							commonManager.init();
							// 初始化编辑配置
							templateManager[config.templateAttr.template].init();
						}else{
							nsAlert('后台未配置基本参数','error');
							console.error(res);
							return false;
						}
					}
				}
				if(res.data.serverConfig){
					// 模板表单配置
					var serverConfig = JSON.parse(res.data.serverConfig);
					config.serverConfig = serverConfig;
					// 初始化通用方法
					commonManager.init();
					// 初始化编辑配置
					templateManager[config.templateAttr.template].init();
				}else{
					nsAlert('后台未配置基本参数','error');
					console.error(res);
					return false;
				}
			})
		},
		// ajax保存配置方法
		ajaxSaveData:function(saveData){
			// 保存
			/*
			$.ajax({
				url:getRootPath() + "/templateMindPages/save",
				type:"POST",
				dataType:"json",
				data:saveData,
				success:function(data){
					if(data.success){
						nsAlert("保存成功");
					}else{
						nsAlert("保存失败");
					}
				}
			});
			*/
			var ajaxConfig = {
				url:getRootPath() + "/templateMindPages/save",
				type:"POST",
				dataType:"json",
				data:saveData,
				contentType : 'application/x-www-form-urlencoded',
			}
			NetStarUtils.ajax(ajaxConfig, function(data){
				if(data.success){
					nsAlert("保存成功");
				}else{
					nsAlert("保存失败");
				}
			});
		},
		// 为表单数组设置默认值
		setDefToForm:function(formArr,defObj){
			for(var indexI=0;indexI<formArr.length;indexI++){
				if(defObj[formArr[indexI].id]){
					formArr[indexI].value = defObj[formArr[indexI].id];
				}
			}
		},
		// 获取状态数组
		getStateList:function(voObj){
			var stateArr = [];
			var voAllStateArr = voObj.processData.states;
			for(var indexI=0;indexI<voAllStateArr.length;indexI++){
				var stateObj = {
					id:voAllStateArr[indexI].gid,
					name:voAllStateArr[indexI].chineseName,
				}
				stateArr.push(stateObj);
			}
			return stateArr;
		},
		// 获得状态中字段数组的列表
		getFieldsList:function(voObj){
			var fieldsList = {};
			var voAllStateArr = voObj.processData.states;
			for(var indexI=0;indexI<voAllStateArr.length;indexI++){
				if(voAllStateArr[indexI].field){
					// 表单
					fieldsList[voAllStateArr[indexI].gid] = getFields(voAllStateArr[indexI].field);
					if(voAllStateArr[indexI]['field-more']){
						var fieldsMoreArr = getFields(voAllStateArr[indexI]['field-more']);
						// 合并field和field-more
						for(var indexJ=0;indexJ<fieldsMoreArr.length;indexJ++){
							fieldsList[voAllStateArr[indexI].gid].push(fieldsMoreArr[indexJ]);
						}
					}
				}else{
					if(voAllStateArr[indexI].tabs){
						// 表格
						fieldsList[voAllStateArr[indexI].gid] = getFields(voAllStateArr[indexI].tabs);
					}else{
						// 没有
						fieldsList[voAllStateArr[indexI].gid] = [];
						console.error('状态为空，请检查状态配置');
						console.error(voAllStateArr[indexI]);
					}
				}
			}
			function getFields(souFieldsArr){
				var fieldsArr = []
				for(var indexI=0;indexI<souFieldsArr.length;indexI++){
					var fieldsObj = {
						id:souFieldsArr[indexI].gid,
						name:souFieldsArr[indexI].chineseName,
					}
					fieldsArr.push(fieldsObj);
				}
				return fieldsArr;
			}
			return fieldsList;
		},
		// 获得所有字段数组的列表 {gid:englishName}
		getFieldsObj:function(voObj){
			var fieldsObj = {};
			var voAllFieldsArr = voObj.processData.fields;
			for(var indexI=0;indexI<voAllFieldsArr.length;indexI++){
				fieldsObj[voAllFieldsArr[indexI].gid] = voAllFieldsArr[indexI].englishName;
			}
			return fieldsObj;
		},
		// 获得模板编辑表单
		getForm:function(formAttr,defObj,isDialog){
			var fieldsArray = [];
			//输出所有面板
			for(var panelI = 0; panelI<formAttr.panels.length; panelI++){
				var panelAttr = formAttr.panels[panelI];
				//输出标题
				var labelField = $.extend(true, {}, this.fields.label);
				labelField.label = panelAttr.label;
				fieldsArray.push(labelField);
				switch(panelAttr.type){
					case 'standardBase':
						// 标题
						var panelAttrIdStr = panelAttr.id;
						if(panelAttr.id!=""){
							panelAttrIdStr += '-';
						}
						var titleField = $.extend(true,{},this.fields.text);
						titleField.id = panelAttrIdStr + 'title';
						titleField.label = '标题';
						titleField.column = 6;
						fieldsArray.push(titleField);
						var readonlyField = $.extend(true,{},this.fields.isTrue);
						readonlyField.id = panelAttrIdStr + 'readonly';
						readonlyField.label = 'readonly';
						readonlyField.value = 'false';
						fieldsArray.push(readonlyField);
						var isShowTitleField = $.extend(true,{},this.fields.isTrue);
						isShowTitleField.id = panelAttrIdStr + 'isShowTitle';
						isShowTitleField.label = 'isShowTitle';
						isShowTitleField.value = 'true';
						fieldsArray.push(isShowTitleField);
						var isFormHiddenField = $.extend(true,{},this.fields.isTrue);
						isFormHiddenField.id = panelAttrIdStr + 'isFormHidden';
						isFormHiddenField.label = 'isFormHidden';
						isFormHiddenField.value = 'false';
						fieldsArray.push(isFormHiddenField);
						var isHaveSaveAndAddField = $.extend(true,{},this.fields.isTrue);
						isHaveSaveAndAddField.id = panelAttrIdStr + 'isHaveSaveAndAdd';
						isHaveSaveAndAddField.label = 'isHaveSaveAndAdd';
						isHaveSaveAndAddField.value = 'true';
						// fieldsArray.push(isHaveSaveAndAddField);
						var isHaveDraftBoxField = $.extend(true,{},this.fields.isTrue);
						isHaveDraftBoxField.id = panelAttrIdStr + 'draftBox-isUse';
						isHaveDraftBoxField.label = '是否显示草稿箱';
						isHaveDraftBoxField.value = 'false';
						fieldsArray.push(isHaveDraftBoxField);
						var isHaveDraftBoxSaveField = $.extend(true,{},this.fields.isTrue);
						isHaveDraftBoxSaveField.id = panelAttrIdStr + 'draftBox-isUseSave';
						isHaveDraftBoxSaveField.label = '是否显示草稿保存';
						isHaveDraftBoxSaveField.value = 'true';
						fieldsArray.push(isHaveDraftBoxSaveField);
						var draftBoxfieldsField = $.extend(true,{},this.fields.textarea);
						draftBoxfieldsField.id = panelAttrIdStr + 'draftBox-fields';
						draftBoxfieldsField.label = '草稿箱字段';
						draftBoxfieldsField.value = '';
						draftBoxfieldsField.column = 6;
						fieldsArray.push(draftBoxfieldsField);
						var draftBoxcloseOrClearField = $.extend(true,{},this.fields.isTrue);
						draftBoxcloseOrClearField.id = panelAttrIdStr + 'draftBox-closeOrClear';
						draftBoxcloseOrClearField.label = '草稿箱关闭或清除';
						draftBoxcloseOrClearField.value = 'true';
						draftBoxcloseOrClearField.column = 6;
						fieldsArray.push(draftBoxcloseOrClearField);
						var isSaveToTemplateField = $.extend(true,{},this.fields.isTrue);
						isSaveToTemplateField.id = panelAttrIdStr + 'isSaveToTemplate';
						isSaveToTemplateField.label = '是否保存为模板';
						isSaveToTemplateField.value = '';
						isSaveToTemplateField.column = 6;
						fieldsArray.push(isSaveToTemplateField);
						// plusClass
						var plusClassField = $.extend(true,{},this.fields.text);
						plusClassField.id = panelAttrIdStr + 'plusClass';
						plusClassField.label = 'plusClass';
						plusClassField.value = '';
						plusClassField.column = 6;
						fieldsArray.push(plusClassField);
						// mode
						var modeField = $.extend(true,{},this.fields.text);
						modeField.id = panelAttrIdStr + 'mode';
						modeField.label = '显示模式';
						modeField.value = '';
						modeField.column = 6;
						fieldsArray.push(modeField);
						// pushMessage
						var pushMessageField = $.extend(true,{},this.fields.textarea);
						pushMessageField.id = panelAttrIdStr + 'pushMessage';
						pushMessageField.label = '推送消息';
						pushMessageField.value = '';
						pushMessageField.column = 6;
						fieldsArray.push(pushMessageField);
						// pageExpression
						var pageExpressionField = $.extend(true,{},this.fields.textarea);
						pageExpressionField.id = panelAttrIdStr + 'pageExpression';
						pageExpressionField.label = '页面表达式';
						pageExpressionField.value = '';
						pageExpressionField.column = 6;
						fieldsArray.push(pageExpressionField);
						// isUseBtnPanelManager
						var isUseBtnPanelManagerField = $.extend(true,{},this.fields.isTrue);
						isUseBtnPanelManagerField.id = panelAttrIdStr + 'isUseBtnPanelManager';
						isUseBtnPanelManagerField.label = '是否使用按钮面板';
						isUseBtnPanelManagerField.value = '';
						isUseBtnPanelManagerField.column = 6;
						fieldsArray.push(isUseBtnPanelManagerField);
						// params
						var paramsField = $.extend(true,{},this.fields.textarea);
						paramsField.id = panelAttrIdStr + 'params';
						paramsField.label = 'params';
						paramsField.value = '';
						paramsField.column = 6;
						fieldsArray.push(paramsField);
						break;
					case 'base':
						var isMode = typeof(panelAttr.modeSub)=='object'; // 模板模式
						var isPageParam = typeof(panelAttr.isPageParam)=='boolean'?panelAttr.isPageParam:false; // modeparams
						// 标题
						var titleField = $.extend(true,{},this.fields.text);
						titleField.id = panelAttr.id + '-title';
						titleField.label = '标题';
						if(!isMode && !isPageParam){
							titleField.column = 12;
						}else{
							if(!isMode || !isPageParam){
								titleField.column = 6;
							}
						}
						fieldsArray.push(titleField);
						// 模板模式
						if(isMode){
							var modeField = $.extend(true,{},this.fields.select);
							modeField.id = panelAttr.id + '-mode';
							modeField.subdata = panelAttr.modeSub;
							modeField.label = '模板模式';
							if(!isPageParam){
								modeField.column = 6;
							}
							fieldsArray.push(modeField);
						}
						// pageParam
						if(isPageParam){
							var pageParamField = $.extend(true,{},this.fields.textarea);
							pageParamField.id = panelAttr.id + '-modeParams';
							pageParamField.label = 'modeParams';
							if(!isMode){
								pageParamField.column = 6;
							}
							fieldsArray.push(pageParamField);
						}
						if(panelAttr.templateName == 'listfilter'){
							// isSearch
							var isSearchField = $.extend(true,{},this.fields.isCloseWindow);
							isSearchField.id = panelAttr.id + '-isSearch';
							isSearchField.label = '是否搜索';
							fieldsArray.push(isSearchField);
							// placeholder
							var placeholderField = $.extend(true,{},this.fields.text);
							placeholderField.id = panelAttr.id + '-placeholder';
							placeholderField.label = 'placeholder';
							fieldsArray.push(placeholderField);
							// searchField
							var searchField = $.extend(true,{},this.fields.text);
							searchField.id = panelAttr.id + '-searchField';
							searchField.label = 'searchField';
							fieldsArray.push(searchField);
						}
						break;
					case 'form':
					case 'table':
						var isParams = typeof(panelAttr.isParams)=='boolean'?panelAttr.isParams:false; // isParams 主附表模板 附表参数
						if(typeof(panelAttr.voId)=='undefined'){
							nsAlert('没有选择vo');
							break;
						}
						var isHiddenTitle = typeof(panelAttr.isHiddenTitle)=='boolean'?panelAttr.isHiddenTitle:false;
						// 标题
						var tableTitleField = $.extend(true,{},this.fields.text);
						tableTitleField.id = panelAttr.id + '-title';
						tableTitleField.label = '标题';
						if(isHiddenTitle){
							tableTitleField.hidden = isHiddenTitle;
						}
						fieldsArray.push(tableTitleField);
						if(isParams){
							var colField = $.extend(true,{},this.fields.textarea);
							colField.id = panelAttr.id + '-params';
							colField.label = 'params';
							fieldsArray.push(colField);
						}
						// 状态类别
						var tableStateField = $.extend(true,{},this.fields.select);
						tableStateField.id = panelAttr.id + '-field';
						tableStateField.label = '状态类别';
						tableStateField.rules = 'required';
						// tableStateField.subdata = config.stateList;
						// tableStateField.subdata = this.stateInfo.states[panelAttr.voId];
						// 表单/表格显示状态不同
						switch(panelAttr.type){
							case 'form':
								tableStateField.subdata = this.stateInfo.formStates[panelAttr.voId];
								break;
							case 'table':
								tableStateField.subdata = this.stateInfo.states[panelAttr.voId];
								break;
						}
						tableStateField.changeHandler = function(id,value){
							if(id != ''){
								var formId = $(this)[0].id;
								var formIdArr = formId.split('-');
								var hideID = formId.substring(0,formId.lastIndexOf('-')+1) + 'hide';
								commonManager.refreshHide(id,hideID,isDialog); // 刷新隐藏字段
							}
						}
						fieldsArray.push(tableStateField);
						// 状态类别 显示的字段 field/field-more
						var stateClassField = $.extend(true,{},this.fields.radio);
						stateClassField.id = panelAttr.id + '-stateClass';
						stateClassField.label = '状态显示';
						stateClassField.value = 'more';
						fieldsArray.push(stateClassField);
						// 隐藏字段
						var tableHideField = $.extend(true,{},this.fields.select2);
						tableHideField.id = panelAttr.id + '-hide';
						tableHideField.label = '隐藏字段';
						tableHideField.maximumItem = 100;
						tableHideField.subdata = [];
						if(defObj && !$.isEmptyObject(defObj)){
							if(panelAttr.id == ''){
								// 弹框
								if(defObj.field != ''){
									// tableHideField.subdata = config.fieldsList[defObj.field];
									tableHideField.subdata = this.stateInfo.hideList[defObj.field];
								}
							}else{
								if(defObj[panelAttr.id + '-field'] != ''){
									// tableHideField.subdata = config.fieldsList[defObj[panelAttr.id + '-field']];
									tableHideField.subdata = this.stateInfo.hideList[defObj[panelAttr.id + '-field']];
								}
							}
						}
						fieldsArray.push(tableHideField);
						// 是否配置按钮
						if(panelAttr.isConBtns){
							var stateArr = this.stateInfo.formStates[panelAttr.voId];// 状态数组
							commonManager.setBtnFormConfig(panelAttr,'add',stateArr,fieldsArray);
							commonManager.setBtnFormConfig(panelAttr,'edit',stateArr,fieldsArray);
							commonManager.setBtnFormConfig(panelAttr,'delete',stateArr,fieldsArray);
						}
						break;
					case 'tree':
						// 标题
						var treeTitleField = $.extend(true,{},this.fields.text);
						treeTitleField.id = panelAttr.id + '-title';
						treeTitleField.label = '标题';
						treeTitleField.column = 6;
						fieldsArray.push(treeTitleField);
						// 列宽
						var treeColumnField = $.extend(true,{},this.fields.text);
						treeColumnField.id = panelAttr.id + '-column';
						treeColumnField.label = '列宽';
						treeColumnField.column = 6;
						fieldsArray.push(treeColumnField);
						// 配置按钮
						var stateArr = this.stateInfo.formStates[panelAttr.voId];// 状态数组
						commonManager.setBtnFormConfig(panelAttr,'add',stateArr,fieldsArray);
						commonManager.setBtnFormConfig(panelAttr,'edit',stateArr,fieldsArray);
						commonManager.setBtnFormConfig(panelAttr,'delete',stateArr,fieldsArray);
						break;
					case 'mobileForm':
						// 标题
						var tableTitleField = $.extend(true,{},this.fields.text);
						tableTitleField.id = panelAttr.id + '-title';
						tableTitleField.label = '标题';
						if(isHiddenTitle){
							tableTitleField.hidden = isHiddenTitle;
						}
						fieldsArray.push(tableTitleField);
						// 更多标题
						var fieldMoreTitleField = $.extend(true,{},this.fields.text);
						fieldMoreTitleField.id = panelAttr.id + '-fieldMoreTitle';
						fieldMoreTitleField.label = '更多标题';
						fieldsArray.push(fieldMoreTitleField);
						// 更多动作
						var fieldMoreActtionField = $.extend(true,{},this.fields.text);
						fieldMoreActtionField.id = panelAttr.id + '-fieldMoreActtion';
						fieldMoreActtionField.label = '更多动作';
						fieldsArray.push(fieldMoreActtionField);
						// 状态类别
						var tableStateField = $.extend(true,{},this.fields.select);
						tableStateField.id = panelAttr.id + '-field';
						tableStateField.label = '状态类别';
						tableStateField.rules = 'required';
						tableStateField.subdata = this.stateInfo.formStates[panelAttr.voId];
						tableStateField.changeHandler = function(id,value){
							if(id != ''){
								var formId = $(this)[0].id;
								var formIdArr = formId.split('-');
								var hideID = formId.substring(0,formId.lastIndexOf('-')+1) + 'hide';
								commonManager.refreshHide(id,hideID,isDialog); // 刷新隐藏字段
							}
						}
						fieldsArray.push(tableStateField);
						// 状态类别 显示的字段 field/field-more
						var stateClassField = $.extend(true,{},this.fields.radio);
						stateClassField.id = panelAttr.id + '-stateClass';
						stateClassField.label = '状态显示';
						stateClassField.value = 'more';
						fieldsArray.push(stateClassField);
						// 隐藏字段
						var tableHideField = $.extend(true,{},this.fields.select2);
						tableHideField.id = panelAttr.id + '-hide';
						tableHideField.label = '隐藏字段';
						tableHideField.maximumItem = 100;
						tableHideField.subdata = [];
						if(defObj && !$.isEmptyObject(defObj)){
							if(panelAttr.id == ''){
								// 弹框
								if(defObj.field != ''){
									// tableHideField.subdata = config.fieldsList[defObj.field];
									tableHideField.subdata = this.stateInfo.hideList[defObj.field];
								}
							}else{
								if(defObj[panelAttr.id + '-field'] != ''){
									// tableHideField.subdata = config.fieldsList[defObj[panelAttr.id + '-field']];
									tableHideField.subdata = this.stateInfo.hideList[defObj[panelAttr.id + '-field']];
								}
							}
						}
						fieldsArray.push(tableHideField);
						// moreText字段
						var moreTextField = $.extend(true,{},this.fields.text);
						moreTextField.id = panelAttr.id + '-moreText';
						moreTextField.label = 'moreText';
						moreTextField.value = '更多';
						fieldsArray.push(moreTextField);
						break;
					case 'standard':
						// title
						var titleField = $.extend(true,{},this.fields.text);
						titleField.id = 'title';
						titleField.label = 'title';
						fieldsArray.push(titleField);
						// plusClass
						var plusClassField = $.extend(true,{},this.fields.text);
						plusClassField.id = 'plusClass';
						plusClassField.label = 'plusClass';
						fieldsArray.push(plusClassField);
						// readonlyExpression
						var readonlyExpressionField = $.extend(true,{},this.fields.textarea);
						readonlyExpressionField.id = 'readonlyExpression';
						readonlyExpressionField.label = 'readonlyExpression';
						fieldsArray.push(readonlyExpressionField);
						// hiddenExpression
						var hiddenExpressionField = $.extend(true,{},this.fields.textarea);
						hiddenExpressionField.id = 'hiddenExpression';
						hiddenExpressionField.label = 'hiddenExpression';
						fieldsArray.push(hiddenExpressionField);
						if(panelAttr.stateType=="vo"){
							// defaultComponentWidth
							var defaultComponentWidthField = $.extend(true,{},this.fields.text);
							defaultComponentWidthField.id = 'defaultComponentWidth';
							defaultComponentWidthField.label = '表单默认宽度（百分比）';
							fieldsArray.push(defaultComponentWidthField);
							// formStyle
							var formStyleField = $.extend(true,{},this.fields.select);
							formStyleField.id = 'formStyle';
							formStyleField.label = 'formStyle';
							formStyleField.subdata = [
								{id : 'pt-form-normal', name : '没有边框边距'},
							]
							fieldsArray.push(formStyleField);
							// isSetMore
							var isSetMoreField = $.extend(true,{},this.fields.isTrue);
							isSetMoreField.id = 'isSetMore';
							isSetMoreField.label = 'isSetMore';
							fieldsArray.push(isSetMoreField);
							// 状态类别 显示的字段 field/field-more
							var stateClassField = $.extend(true,{},this.fields.radio);
							stateClassField.id = 'stateClass';
							stateClassField.label = '状态显示';
							stateClassField.value = 'more';
							fieldsArray.push(stateClassField);
						}
						if(panelAttr.stateType=="list" && 
							( panelAttr.templateName == "processDocBase" || panelAttr.templateName == "processDocSecond" || panelAttr.templateName == "businessDataBaseEditor" )
						){
							// isHaveEditDeleteBtn
							var isHaveEditDeleteBtnField = $.extend(true,{},this.fields.isTrue);
							isHaveEditDeleteBtnField.id = 'isHaveEditDeleteBtn';
							isHaveEditDeleteBtnField.label = '是否可删除';
							fieldsArray.push(isHaveEditDeleteBtnField);
							// isAllowAdd
							var isAllowAddField = $.extend(true,{},this.fields.isTrue);
							isAllowAddField.id = 'isAllowAdd';
							isAllowAddField.label = '是否允许添加';
							fieldsArray.push(isAllowAddField);
						}
						if(panelAttr.stateType=="blockList" && 
							( panelAttr.templateName == "processDocBaseLevel2")
						){
							// addRowPosition
							var addRowPositionField = $.extend(true,{},this.fields.radio);
							addRowPositionField.id = 'addRowPosition';
							addRowPositionField.label = '新增位置';
							addRowPositionField.subdata = [
								{ name:'end', id:'end' },
								{ name:'start', id:'start' },
							]
							fieldsArray.push(addRowPositionField);
						}
						if(panelAttr.stateType=="list"){
							// isOpenFormQuery
							var isOpenFormQueryField = $.extend(true,{},this.fields.isTrue);
							isOpenFormQueryField.id = 'isOpenFormQuery';
							isOpenFormQueryField.label = '是否展开查询';
							fieldsArray.push(isOpenFormQueryField);
						}
						// 状态/隐藏字段
						if( panelAttr.stateType=="vo"||
							panelAttr.stateType=="list"||
							panelAttr.stateType=="blockList"||
							panelAttr.stateType=="customize"||
							panelAttr.stateType=="pie"||
							panelAttr.stateType=="line"||
							panelAttr.stateType=="pdfList"||
							panelAttr.stateType=="recordList"||
							panelAttr.stateType=="bar"
						){
							// 状态类别
							var tableStateField = $.extend(true,{},this.fields.select);
							tableStateField.id = 'field';
							tableStateField.label = '状态类别';
							tableStateField.rules = 'required';
							// 表单/表格显示状态不同
							switch(panelAttr.stateType){
								case 'vo':
								case 'tree':
								case 'customize':
								case 'pie':
								case 'line':
								case 'bar':
									tableStateField.subdata = this.stateInfo.formStates[panelAttr.voId];
									break;
								case 'list':
								case 'blockList':
								case 'pdfList':
								case 'recordList':
									tableStateField.subdata = this.stateInfo.states[panelAttr.voId];
									break;
							}
							tableStateField.changeHandler = function(id,value){
								if(id != ''){
									var formId = $(this)[0].id;
									var formIdArr = formId.split('-');
									var hideID = formId.substring(0,formId.lastIndexOf('-')+1) + 'hide';
									commonManager.refreshHide(id,hideID,isDialog); // 刷新隐藏字段
								}
							}
							fieldsArray.push(tableStateField);
							// 隐藏字段
							var tableHideField = $.extend(true,{},this.fields.checkbox);
							tableHideField.id = 'hide';
							tableHideField.label = '隐藏字段';
							// tableHideField.maximumItem = 100;
							tableHideField.subdata = [];
							if(defObj && !$.isEmptyObject(defObj)){
								if(panelAttr.id == ''){
									// 弹框
									if(defObj.field != ''){
										tableHideField.subdata = this.stateInfo.hideList[defObj.field];
									}
								}else{
									if(defObj[panelAttr.id + '-field'] != ''){
										tableHideField.subdata = this.stateInfo.hideList[defObj[panelAttr.id + '-field']];
									}
								}
							}
							fieldsArray.push(tableHideField);
						}
						break;
				}
			}
			return fieldsArray;
		},
		// 设置新增/修改/删除/批量新增按钮配置
		setBtnFormConfig:function(panelAttr,type,stateArr,fieldsArray){
			/*
			 * panelAttr : 配置参数 （{id，label}）可不填
			 * type ：按钮类型
			 * stateArr: 状态下拉框
			 * fieldsArray : 生成数组的容器
			 */
			// 弹框调用时只显示一个所以type不需要 type:add/edit/delete
			// panelAttr 配置参数 若false即弹框弹出新增、修改、删除之一
			if(panelAttr && type){
				var isDialog = false;
				var idByType = panelAttr.id +'-'+type+'-';
			}else{
				var idByType = '';
				var isDialog = true;
			}
			if(panelAttr){
				// label
				var labelField = $.extend(true, {}, this.fields.label);
				labelField.label = panelAttr.label + ' ' + type;
				fieldsArray.push(labelField);
			}
			// 标题
			var titleField = $.extend(true,{},this.fields.text);
			titleField.id = idByType+ 'title';
			titleField.label = '标题';
			fieldsArray.push(titleField);
			// 类型
			var typeField = $.extend(true,{},this.fields.selectType);
			typeField.id = idByType+ 'type';
			typeField.label = '类型';
			switch(type){
				case 'add':
				case 'edit':
					typeField.value = 'dialog';
					break;
				case 'delete':
					typeField.value = 'confirm';
					break;
				case 'multiAdd':
					typeField.value = 'component';
					break;
			}
			typeField.changeHandler = function(selectId){
				var formId = $(this)[0].id;
				var formIdArr = formId.split('-');
				var hideID = formId.substring(0,formId.lastIndexOf('-')+1) + 'width';
				var editObj = {
					id:hideID
				}
				if(selectId=='dialog'){
					editObj.hidden = false;
				}else{
					editObj.hidden = true;
				}
				if(isDialog){
					nsForm.edit([editObj],'plane-page');
				}else{
					nsForm.edit([editObj],config.formId);
				}
			}
			fieldsArray.push(typeField);
			var formSourceField = $.extend(true,{},this.fields.formSource);
			formSourceField.id = idByType+ 'formSource';
			formSourceField.label = '表单模式';
			fieldsArray.push(formSourceField);

			var widthField = $.extend(true,{},this.fields.inputselect);
			widthField.id = idByType+ 'width';
			widthField.label = '弹框宽度';
			widthField.hidden = true;
			if(typeField.value == 'dialog'){
				widthField.hidden = false;
			}
			fieldsArray.push(widthField);
			// 文本
			var textField = $.extend(true,{},this.fields.text);
			textField.id = idByType+ 'text';
			textField.label = '文本';
			fieldsArray.push(textField);
			// dialogBtnText
			var dialogBtnTextField = $.extend(true,{},this.fields.text);
			dialogBtnTextField.id = idByType+ 'dialogBtnText';
			dialogBtnTextField.label = 'dialogBtnText';
			fieldsArray.push(dialogBtnTextField);
			// servicename
			var servicenameField = $.extend(true,{},this.fields.text);
			servicenameField.id = idByType+ 'serviceComponent';
			servicenameField.label = 'servicename';
			fieldsArray.push(servicenameField);
			// 状态类别
			var stateField = $.extend(true,{},this.fields.select);
			stateField.id = idByType+ 'field';
			stateField.label = '状态类别';
			// stateField.subdata = config.stateList;
			stateField.subdata = stateArr;
			fieldsArray.push(stateField);
			// 状态类别 显示的字段 field/field-more
			var stateClassField = $.extend(true,{},this.fields.radio);
			stateClassField.id = idByType + 'stateClass';
			stateClassField.label = '状态显示';
			stateClassField.value = 'more';
			fieldsArray.push(stateClassField);
			// 是否为二维数组 弹框多列显示
			var isMoreColField = $.extend(true,{},this.fields.isCloseWindow);
			isMoreColField.id = idByType + 'isMoreCol';
			isMoreColField.label = '多列显示';
			isMoreColField.value = 'false';
			fieldsArray.push(isMoreColField);
			if(type == 'multiAdd'){
				// chargeField
				var chargeField = $.extend(true,{},this.fields.textarea);
				chargeField.id = idByType+ 'chargeField';
				chargeField.label = 'chargeField';
				fieldsArray.push(chargeField);
			}
			// 关闭弹框
			var isCloseWindowField = $.extend(true,{},this.fields.isCloseWindow);
			isCloseWindowField.id = idByType+ 'isCloseWindow';
			isCloseWindowField.label = '关闭弹框';
			fieldsArray.push(isCloseWindowField);
		},
		// 刷新隐藏字段
		refreshHide:function(stateId,id,isDialog){
			// var subdata = config.fieldsList[stateId];
			var subdata = this.stateInfo.hideList[stateId];
			if(subdata){
				var hideFieldConfig = {
					id:     	id,
					value: 		[],
					subdata:   	subdata,
				}
				if(isDialog){
					nsForm.edit([hideFieldConfig],'plane-page');
				}else{
					nsForm.edit([hideFieldConfig],config.formId);
				}
			}else{
				nsAlert('选择状态为空');
			}
		},
		// 通过id获取vo
		getVoById:function(businessNameId){
			var voObjList = config.voMapObj.vo;
			for(var indexI=0;indexI<voObjList.length;indexI++){
				if(voObjList[indexI].id == businessNameId){
					return voObjList[indexI];
				}
			}
			return voObjList[0];
		},
		// 格式化对象 把（{***-****-****，***-****-*****}）转化为（{***：{****：{****：‘’，*****：‘’}}}）
		getFormatObj:function(sourceObj){
			var formatObj = {};
			for(var key in sourceObj){
				var keyArr = key.split('-');
				var obj = formatObj;
				for(var indexI=0;indexI<keyArr.length;indexI++){
					if(indexI == keyArr.length-1){
						obj[keyArr[indexI]] = sourceObj[key];
					}else{
						if(obj[keyArr[indexI]]){
							obj = obj[keyArr[indexI]];
						}else{
							obj[keyArr[indexI]] = {};
							obj = obj[keyArr[indexI]];
						}
					}
				}
			}
			return formatObj
		},
		// 获取field 通过状态的gid
		getFieldByStateGid:function(stateGid,stateClass,objName,isMoreCol){
			/*
			 * stateGid : gid
			 * stateClass : base / more
			 * objName : 根据其确定typeObj{ isColumn:true/false; isDialog:true/false; isMoreClo:true/false }
			 * isMoreCol : 是否为多列
			 */
			var isColumn = objName == 'table'||objName == 'child'||objName == 'main'||objName == 'list'||objName == 'blockList'? true : false;
			var isDialog = objName == 'add'||objName == 'edit'||objName == 'delete'||objName == 'multiAdd'? true : false;
			isMoreCol = typeof(isMoreCol)!='undefined' ? isMoreCol : false;
			var typeObj = '{isColumn:'+isColumn+',isDialog:'+isDialog+',isMoreCol:'+isMoreCol+'}';
			// var stateList = config.vo.processContent.states;
			var stateList = this.stateInfo.stateBase[stateGid];
			if(typeof(stateList)=="undefined"){
				console.error('该状态不存在：'+stateGid);
				console.error(this.stateInfo.stateBase);
			}else{
				var stateName = stateList.englishName;
				if(stateClass){
					stateName += '.'+stateClass;
				}
				if(stateList){
					return 'nsProject.getFieldsByState('+stateList.entityName+'.'+stateList.voName+',"'+stateName+'",'+typeObj+')';
				}
			}
			/*for(var indexI=0;indexI<stateList.length;indexI++){
				if(stateList[indexI].gid == stateGid){
					return 'nsProject.getFieldsByState('+stateList[indexI].entityName+'.'+stateList[indexI].voName+',"'+stateList[indexI].englishName+'",'+objName+')';
				}
			}*/
			return false;
		},
		// 获得隐藏的字段名 通过隐藏字段gid
		getFieldNameByFieldGid:function(fieldsGid){
			if($.isArray(fieldsGid)){
				var fieldsGidArr = fieldsGid;
			}else{
				fieldsGid = fieldsGid.toString();
				var fieldsGidArr = fieldsGid.split(',');
			}
			// var fieldsObj = config.fieldsObj;
			var fieldsObj = this.stateInfo.fields;
			var hideFields = [];
			for(var gidI=0;gidI<fieldsGidArr.length;gidI++){
				if(fieldsGidArr[gidI]){
					hideFields.push(fieldsObj[fieldsGidArr[gidI]]);
				}
			}
			return hideFields;
		},
		// 格式化保存数据
		formatSaveData:function(_formData,_templateConfig){
			var templateConfig = $.extend(true,{},_templateConfig);
			var formData = $.extend(true,{},_formData);
			var formatObj = this.getFormatObj(formData);
			function setObj(forObj,temObj,objName){
				for(var name in forObj){
					if(typeof(forObj[name])=='object'){
						switch(name){
							case 'base':
								for(var typeName in forObj[name]){
									temObj[typeName] = forObj[name][typeName];
								}
								break;
							default:
								if(temObj[name]){
								}else{
									temObj[name] = {};
								}
								setObj(forObj[name],temObj[name],name);
								break;
						}
					}else{
						if(forObj[name] == ''){
							if(temObj[name]){
								delete temObj[name];
							}
							continue;
						}
						if(name == 'field'){
							forObj[name] = commonManager.getFieldByStateGid(forObj[name],forObj.stateClass,objName,forObj.isMoreCol);
						}
						if(name == 'hide'){
							forObj[name] = commonManager.getFieldNameByFieldGid(forObj[name]);
						}
						if(name == 'stateClass'){
							continue;
						}
						if(name == 'isMoreCol'){
							continue;
						}
						if(forObj[name]){
							temObj[name] = forObj[name];
						}
					}
				}
			}
			setObj(formatObj,templateConfig,'');
			return templateConfig;
		},
		// 格式化tabs
		formatSaveTabsData:function(_tabObj,forTab){
			var tabObj = $.extend(true,{},_tabObj);
			delete tabObj.id;
			delete tabObj.handle;
			for(var keyName in tabObj){
				switch(keyName){
					case 'field':
						if(tabObj[keyName] == ''){
							break;
						}
						forTab[keyName] = commonManager.getFieldByStateGid(tabObj[keyName],tabObj.stateClass,tabObj.type);
						break;
					case 'hide':
						if(tabObj[keyName] == ''){
							delete forTab[keyName];
							break;
						}
						forTab[keyName] = commonManager.getFieldNameByFieldGid(tabObj[keyName]);
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
										forTab[keyName][key] = commonManager.getFieldByStateGid(tabObj[keyName][key],tabObj.stateClass,keyName,tabObj[keyName].isMoreCol);
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
		},
		// 获取值
		getValues:function(){
			var formData = nsForm.getFormJSON(config.formId);
			return formData;
		},
		saveValues2 : function(){
			var formData = this.getValues();
			if(formData){
				var tableData = baseDataTable.allTableData(config.tableId);
				var tableDataObj = {};
				var indexArr = [];
				for(var i=0; i<tableData.length; i++){
					tableDataObj[tableData[i].gid] = tableData[i];
					indexArr.push(tableData[i].gid);
				}
				var saveData = {
					formData:formData,
					tableData:tableDataObj,
					index : indexArr,
				}
				// 添加objectState
				saveData = pageProperty.addObjectState(config.prevServerConfig.productConfig, saveData);
				delete saveData.objectState;
				delete saveData.tableData.objectState;
				config.serverConfig.productConfig = saveData; // 产品人员配置
				config.serverConfig.entityNameArr = pageProperty.entityNameArr;
				config.serverConfig.isPageConfig = false;
				config.serverConfig = pageProperty.formatAjaxSaveData(config.serverConfig);
				config.serverConfig.programmerConfig = pageProperty.addObjectState(config.prevServerConfig.programmerConfig, config.serverConfig.programmerConfig);
				console.log(config.serverConfig);
				config.voData.pageConfig = JSON.stringify({ config : JSON.stringify(config.serverConfig)});
				config.voData.serverConfig = '';
				commonManager.ajaxSaveData(config.voData);
			}
		},
		// 保存数据
		saveValues:function(){
			if(!config.isSavePageConfig){
				this.saveValues2();
				return;
			}
			var formData = this.getValues();
			if(formData){
				var formatTemplateDate = commonManager.formatSaveData(formData,templateManager[config.templateAttr.template].defaultConfig);
				switch(config.templateAttr.template){
					case 'formTable':
					case 'tabFormList':
					case 'mobileForm':
					case 'standardTemplate':
						var tableData = baseDataTable.allTableData(config.tableId)
						// 判断是否是tab页
						if(config.templateAttr.template == 'tabFormList'){
							var isTabsPage = true;
							var sourTabs = formatTemplateDate.tab;
						}else{
							var isTabsPage = false;
							if(config.templateAttr.template == 'mobileForm'){
								var sourTabs = formatTemplateDate.form;
							}else{
								if(config.templateAttr.template == 'standardTemplate'){
									var sourTabs = formatTemplateDate.components;
								}else{
									var sourTabs = formatTemplateDate.table;
								}
							}
						}
						for(var tabI=0;tabI<tableData.length;tabI++){
							for(var souTabI=0;souTabI<sourTabs.length;souTabI++){
								if(isTabsPage){
									var sourTabsNumObj = sourTabs[souTabI][0];
								}else{
									var sourTabsNumObj = sourTabs[souTabI];
								}
								if(tableData[tabI].gid == sourTabsNumObj.gid){
									commonManager.formatSaveTabsData(tableData[tabI],sourTabsNumObj);
								}
							}
						}
						formData = {
							formData:formData,
							tableData:tableData,
						}
						break;
				}
				if(typeof(config.voData.pageConfig)=="string"){
					config.voData.pageConfig = JSON.parse(config.voData.pageConfig);
				}
				config.voData.pageConfig.config = JSON.stringify(formatTemplateDate);
				config.voData.pageConfig = JSON.stringify(config.voData.pageConfig);
				config.serverConfig.productConfig = formData; // 产品人员配置
				config.voData.serverConfig = JSON.stringify(config.serverConfig);
				commonManager.ajaxSaveData(config.voData);
			}
		},
		// 通过状态id返回状态中文名字
		getStateChineseName:function(stateId){
			// var stateArr = config.vo.processContent.states;
			var stateObj = this.stateInfo.stateBase;
			var stateName = '';
			if(stateObj[stateId]){
				stateName = stateObj[stateId].chineseName;
			}
			// for(var staI=0;staI<stateArr.length;staI++){
			// 	if(stateArr[staI].gid == stateId){
			// 		stateName = stateArr[staI].chineseName;
			// 	}
			// }
			return stateName;
		},
		getFieldChineseName:function(fieldsId){
			// var fieldArr = config.vo.processContent.fields;
			var fieldObj = this.stateInfo.fields;
			var stateName = '';
			if($.isArray(fieldsId)){
				var fieldsIdArr = fieldsId;
			}else{
				fieldsId = fieldsId.toString();
				var fieldsIdArr = fieldsId.split(',');
			}
			var fieldsName = '';
			for(var idI=0;idI<fieldsIdArr.length;idI++){
				if(fieldObj[fieldsIdArr[idI]]){
					fieldsName += fieldObj[fieldsIdArr[idI]] + ',';
				}
			}
			// for(var fieI=0;fieI<fieldArr.length;fieI++){
			// 	for(var idI=0;idI<fieldsIdArr.length;idI++){
			// 		if(fieldArr[fieI].gid == fieldsIdArr[idI]){
			// 			fieldsName += fieldArr[fieI].chineseName + ',';
			// 		}
			// 	}
			// }
			if(fieldsName.length>0){
				fieldsName = fieldsName.substring(0,fieldsName.length-1);
			}
			return fieldsName;
		},
		getStateInfoByVoList:function(){
			var voList = config.voMapObj.vo;
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
		},
		//初始化方法
		init:function(){
			//初始化表单（id）
			this.form.id = config.formId;
			this.stateTree = config.voMapSelectTree.state; // 状态树
			this.stateInfo = this.getStateInfoByVoList(); // 通过vo列表获得状态的基本信息； 隐藏字段 状态列表
			return ;
			config.vo = commonManager.getVoById(config.serverConfig.voId);
			if(config.vo){
				// 初始化状态列表
				/*
				 * [{id:'',name:''}]
				 */
				config.stateList = commonManager.getStateList(config.vo);//获得状态名列表
				// 初始化字段列表 通过状态分类
				/*
				 * {***：[{id:'',name:''}]}
				 */
				config.fieldsList = commonManager.getFieldsList(config.vo);//获得状态中字段数组的列表
				// 初始化字段列表
				/*
				 * {gid:englishName}
				 */
				config.fieldsObj = commonManager.getFieldsObj(config.vo);//获得vo中所有字段列表
			}else{
				nsAlert('获取vo失败');
				console.error(config.vo);
			}
		},
	}
	// 主附表
	var doubleTablesManager = {
		// 主附表默认配置
		defaultConfig:{
			//col:"[6,6]",
			isFormHidden:false,
			isShowTitle:false,
			template:"doubleTables",
			title:'',
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:"保存",
				},
			},
			table:{
				main:{
					ajax:{},
					field:[],
					btns:'',
					tableRowBtns:'',
					idField:'voId',
					title:'',
					add:{ type : 'dialog' },
					edit:{ type : 'dialog' },
					delete:{ type : 'confirm' },
				},
				child:{
					ajax:{},
					field:[],
					btns:'',
					tableRowBtns:'',
					idField:'id',
					keyField:'children',
					title:'',
					add:{ type : 'dialog' },
					edit:{ type : 'dialog' },
					delete:{ type : 'confirm' },
				},
			},
		},
		modeSub:[
			{
				id:'horizontal',
				name:'horizontal',
			},{
				id:'block',
				name:'block',
			}
		],
		// 获取值
		/*getValues:function(){
			var formData = nsForm.getFormJSON(config.formId);
			return formData;
		},*/
		// 设置默认值
		// setValues:function(){
			
		// },
		// 保存数据
		/*saveValues:function(){
			var formData = this.getValues();
			var formatTemplateDate = commonManager.formatSaveData(formData,this.defaultConfig);
			// 保存
			var pageConfig = {
				config:JSON.stringify(formatTemplateDate)
			};
			config.voData.pageConfig = JSON.stringify(pageConfig);
			config.serverConfig.productConfig = formData; // 产品人员配置
			config.voData.serverConfig = JSON.stringify(config.serverConfig);
			commonManager.ajaxSaveData(config.voData);
		},*/
		// 获取表单
		setEditorForm:function(){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本',
						id:'base',
						// isColumn:true,
						modeSub:doubleTablesManager.modeSub,
						isModeParams:true,
					},
					{
						type:'table',
						label:'主表',
						id:'table-main',
						isConBtns:true,
						isHiddenTitle:true,
						voId:doubleTablesManager.defaultConfig.table.main.voId,
					},
					{
						type:'table',
						label:'附表',
						id:'table-child',
						isHiddenTitle:true,
						isConBtns:true,
						voId:doubleTablesManager.defaultConfig.table.child.voId,
						isParams:true,
					},
				]
			};
			if(config.serverConfig.productConfig){
				var productConfig = config.serverConfig.productConfig;
				var editorForm = commonManager.getForm(formAttr,productConfig);
				commonManager.setDefToForm(editorForm,productConfig);
			}else{
				var editorForm = commonManager.getForm(formAttr);
			}
			this.formJson.form = editorForm;
			formPlane.formInit(this.formJson);
		},
		init:function(){
			this.formJson = commonManager.form;
			this.setEditorForm();
		}
	}
	// 单表格
	var singleTableManager = {
		// 单表格默认配置
		defaultConfig:{
			isFormHidden:false,
			isShowTitle:false,
			template:"singleTable",
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:"保存",
				},
			},
			table:{
				ajax:{},
				field:[],
				btns:'',
				tableRowBtns:'',
				idField:'id',
				keyField:'volist',
				title:'',
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
		},
		// 获取表单
		setEditorForm:function(){
			var formAttr = 
			{
				panels:[
					// {
					// 	type:'base',
					// 	label:'基本',
					// 	id:'base',
					// 	isColumn:false,
					// 	isMode:true,
					// },
					{
						type:'table',
						label:'表格',
						id:'table',
						isConBtns:true,
						voId:singleTableManager.defaultConfig.table.voId,
					},
				]
			};
			if(config.serverConfig.productConfig){
				var productConfig = config.serverConfig.productConfig;
				var editorForm = commonManager.getForm(formAttr,productConfig);
				commonManager.setDefToForm(editorForm,productConfig);
			}else{
				var editorForm = commonManager.getForm(formAttr);
			}
			this.formJson.form = editorForm;
			formPlane.formInit(this.formJson);
		},
		init:function(){
			this.formJson = commonManager.form;
			this.setEditorForm();
		}
	}
	// 单表单
	var singleFormManager = {
		// 单表单默认配置
		defaultConfig:{
			isFormHidden:false,
			isShowTitle:false,
			template:"singleForm",
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:"保存",
				},
			},
			getValueAjax:{},
			form:{
				field:[],
				idField:'id',
				keyField:'goodsShopVo',
			},
		},
		// 获取表单
		setEditorForm:function(){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本',
						id:'base',
						isColumn:false,
						isMode:true,
					},
					{
						type:'form',
						label:'表单',
						id:'form',
						isConBtns:false,
						voId:singleFormManager.defaultConfig.form.voId,
					},
				]
			};
			if(config.serverConfig.productConfig){
				var productConfig = config.serverConfig.productConfig;
				var editorForm = commonManager.getForm(formAttr,productConfig);
				commonManager.setDefToForm(editorForm,productConfig);
			}else{
				var editorForm = commonManager.getForm(formAttr);
			}
			this.formJson.form = editorForm;
			formPlane.formInit(this.formJson);
		},
		init:function(){
			this.formJson = commonManager.form;
			this.setEditorForm();
		}
	}
	// 目录树
	var treeTableManager = {
		// 目录树默认配置
		defaultConfig:{
			isFormHidden:false,
			isShowTitle:false,
			template:"treeTable",
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:"保存",
				},
			},
			tree:{
				btns:'',
				src:'',
				data:"{}",
				type:"GET",
				dataSrc:"rows",
				column:"4",
				title:"",
				idField:"id",
				parentIdField:"parentId",
				textField:"catename",
				valueField:"cateid",
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
			table:{
				ajax:{},
				field:[],
				btns:'',
				tableRowBtns:'',
				idField:'id',
				keyField:'id',
				title:'',
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
			form:{
				ajax:{},
				field:[],
				btns:'',
				idField:'id',
				keyField:'id',
				title:'',
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
		},
		form:{
			type:'form',
			label:'表单',
			id:'form',
			isConBtns:true,	
		},
		table:{
			type:'table',
			label:'表格',
			id:'table',
			isConBtns:true,	
		},
		// 获取表单
		setEditorForm:function(){

			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本',
						id:'base',
						isColumn:false,
						isMode:false,
						isTree:true,
					},
					{
						type:'tree',
						label:'树',
						id:'tree',
						voId:treeTableManager.defaultConfig.tree.voId,
					},
				]
			};
			var defaultConfig = this.defaultConfig;
			switch(defaultConfig.tree.config){
				case 'form':
					this.form.voId = treeTableManager.defaultConfig.form.voId;
					formAttr.panels.push(this.form);
					break;
				case 'table':
					this.table.voId = treeTableManager.defaultConfig.table.voId;
					formAttr.panels.push(this.table);
					break;
				default:
					this.form.voId = treeTableManager.defaultConfig.form.voId;
					formAttr.panels.push(this.form);
					this.table.voId = treeTableManager.defaultConfig.table.voId;
					formAttr.panels.push(this.table);
					break;
			}
			if(config.serverConfig.productConfig){
				var productConfig = config.serverConfig.productConfig;
				var editorForm = commonManager.getForm(formAttr,productConfig);
				commonManager.setDefToForm(editorForm,productConfig);
			}else{
				var editorForm = commonManager.getForm(formAttr);
			}
			this.formJson.form = editorForm;
			formPlane.formInit(this.formJson);
		},
		init:function(){
			this.formJson = commonManager.form;
			this.setEditorForm();
		}
	}
	// tab表格
	var tabFormListManager = {
		// tab表格默认配置
		defaultConfig:{
			form:{
				field:[],
				idField:'id',
				keyField:'id',
			},
			getValueAjax:{},
			isFormHidden:false,
			isShowTitle:false,
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:'保存',
				},
			},
			tab:[], // 二维数组
			template:"tabFormList",
			title:"",
		},
		// 设置表格
		setEditorTable:{
			// 弹框配置
			dialog:{
				id: 	"plane-page",
				title: 	'',
				size: 	"m",
				form: 	[],
				btns:[
					{
						text: 		'确认',
						handler: 	function(){}
					}
				],
			},
			// 数据
			data:{
				tableID:		'',
				dataSource: 	[],
			},
			// 表格列配置
			column:[
				{
					field : 'voId',
					title : 'voId',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden:true,
				},{
					field : 'type',
					title : '类型',
					width : 80,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'title',
					title : 'tab标题',
					width : 200,
					tabPosition : 0,
					orderable : true,
				},
				{
					field : 'field',
					title : '状态类别',
					width : 200,
					tabPosition : 0,
					orderable : true,
					formatHandler:function(value, rowData){
						var stateName = commonManager.getStateChineseName(value);
						return stateName;
					}
				},
				{
					field : 'hide',
					title : '隐藏字段',
					width : 200,
					tabPosition : 0,
					orderable : true,
					formatHandler:function(value, rowData){
						var fieldName = commonManager.getFieldChineseName(value);
						return fieldName;
					}
				},
				{
					field : 'params',
					title : 'params',
					width : 200,
					tabPosition : 0,
					orderable : true,
				},
				{
					field : 'add',
					title : '新增',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:{
						type:'dictionary',
						data:
						{
							'[object Object]':'<i class="fa fa-check"></i>',
							'':'<i class="fa fa-close"></i>',
						}
					}
				},
				{
					field : 'edit',
					title : '修改',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:{
						type:'dictionary',
						data:
						{
							'[object Object]':'<i class="fa fa-check"></i>',
							'':'<i class="fa fa-close"></i>',
						}
					}
				},
				{
					field : 'delete',
					title : '删除',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:{
						type:'dictionary',
						data:
						{
							'[object Object]':'<i class="fa fa-check"></i>',
							'':'<i class="fa fa-close"></i>',
						}
					}
				},
				{
					field : 'multiAdd',
					title : '批量新增',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:{
						type:'dictionary',
						data:
						{
							'[object Object]':'<i class="fa fa-check"></i>',
							'':'<i class="fa fa-close"></i>',
						}
					}
				},
			],
			// ui配置
			ui:{
				pageLengthMenu: 5,			//显示5行
				isSingleSelect:true,		//是否开启单行选中
				isUseTabs:true,
				tabsName:['1','2'],
			},
			// 表格行按钮
			columnBtns:[
				{'修改':function(rowData){
						tabFormListManager.setEditorTable.edit(rowData);
					},
				},
				{'新增按钮':function(rowData){
						var obj = {
							type:'add',
							rowData:rowData,
							title:'新增',
						}
						tabFormListManager.setEditorTable.btnFun(obj);
					},
				},
				{'修改按钮':function(rowData){
						var obj = {
							type:'edit',
							rowData:rowData,
							title:'修改',
						}
						tabFormListManager.setEditorTable.btnFun(obj);
					},
				},
				{'删除按钮':function(rowData){
						var obj = {
							type:'delete',
							rowData:rowData,
							title:'删除',
						}
						tabFormListManager.setEditorTable.btnFun(obj);
					},
				},
				{'批量新增按钮':function(rowData){
						var obj = {
							type:'multiAdd',
							rowData:rowData,
							title:'批量新增',
						}
						tabFormListManager.setEditorTable.btnFun(obj);
					},
				},
				{'上移':function(rowData){
						tabFormListManager.setEditorTable.moveUp(rowData);
					},
				},
				{'下移':function(rowData){
						tabFormListManager.setEditorTable.moveDown(rowData);
					},
				},
			],
			// 表格Html
			getTableHtml:function(){
				return '<div class="table-responsive">'
						+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+config.tableId+'">'
						+'</table>'
					+'</div>'
			},
			// 刷新行数据
			refreshLineData:function(source,save){
				var origalTableData = $.extend(true,{},source);
				var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
				for(var key in origalData){
					if(typeof(save[key])!='undefined'){
						if(save[key] != origalData[key]){
							origalData[key] = save[key];
						}
					}
				}
				baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
			},
			// 初始化方法
			init:function(){
				// 初始化表格id
				var dataConfig = $.extend(true,[],this.data);
				dataConfig.tableID = config.tableId;
				// 初始化容器
				// 表格存在初始化ui配置表格容器
				// 表格不存在在表格容器中插入表格
				var uiConfig = $.extend(true,[],this.ui);
				if($('#'+config.tableParentId).children().length>0 || typeof(baseDataTable.data[config.tableId]) == 'object'){
					uiConfig.$container = $('#'+config.tableParentId);
				}else{
					var tableHtml = this.getTableHtml();
					$('#'+config.tableParentId).append(tableHtml);
				}
				var columnConfig = $.extend(true,[],this.column);
				// 初始化列操作
				columnConfig.push({
					field:'handle',
					title:'操作',
					width : 200,
					tabPosition:'after',
					formatHandler:{
						type:'button',
						data:tabFormListManager.setEditorTable.columnBtns,
					}
				});
				// 初始化表格
				baseDataTable.init(dataConfig, columnConfig, uiConfig);
			},
			// 表单数组
			getFormArr:function(defdata){
				var formAttr = 
				{
					panels:[
						{
							type:'table',
							label:'',
							id:'',
							isConBtns:false,
							voId:defdata.voId,
							isParams:true,
						}
					]
				}; 
				var formArr = commonManager.getForm(formAttr,defdata,true);
				for(index=0;index<formArr.length;index++){
					if(formArr[index].id){
						formArr[index].id = formArr[index].id.substring(1);
					}
				}
				return formArr;
			},
			// 为表单赋初值
			defaultValue:function(arr,defdata){
				for(index=0;index<arr.length;index++){
					if(defdata[arr[index].id]){
						arr[index].value = defdata[arr[index].id];
					}
				}
			},
			// 行修改
			edit:function(rowData){
				var formArr = this.getFormArr(rowData.rowData);
				this.defaultValue(formArr,rowData.rowData);
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = '修改';
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						var tableLineData = $.extend(true,{},dialogData);
						tabFormListManager.setEditorTable.refreshLineData(rowData,tableLineData);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			btnFun:function(obj){
				var formArr = [];
				var statesArr = commonManager.stateInfo.formStates[obj.rowData.rowData.voId];
				commonManager.setBtnFormConfig(false,obj.type,statesArr,formArr);
				var addData = obj.rowData.rowData[obj.type];
				this.defaultValue(formArr,addData);
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = obj.title;
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						var tableLineData = {};
						tableLineData[obj.type] = $.extend(true,{},dialogData);
						if(dialogData.type==''){
							tableLineData[obj.type] = '';
						}
						tabFormListManager.setEditorTable.refreshLineData(obj.rowData,tableLineData);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			// 上移
			moveUp:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==0){
					nsAlert("已经是第一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition-1];
					tableData[newPosition-1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
			// 下移
			moveDown:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==tableData.length-1){
					nsAlert("已经是最后一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition+1];
					tableData[newPosition+1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
		},
		// 获取表单
		setEditorForm:function(){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本',
						id:'base',
						isColumn:false,
						isMode:true,
					},
					{
						type:'form',
						label:'表单',
						id:'form',
						isConBtns:false,
						voId:tabFormListManager.defaultConfig.form.voId,
					},
				]
			};
			if(config.serverConfig.productConfig){
				var productConfig = config.serverConfig.productConfig;
				if(typeof(productConfig.formData)=='object'){
					productConfig = productConfig.formData;
				}
				var editorForm = commonManager.getForm(formAttr,productConfig);
				commonManager.setDefToForm(editorForm,productConfig);
			}else{
				var editorForm = commonManager.getForm(formAttr);
			}
			this.formJson.form = editorForm;
			formPlane.formInit(this.formJson);
		},
		init:function(){
			this.formJson = commonManager.form;
			this.setEditorForm();
			var defaultConfig = this.defaultConfig;
			var tableDataSource = [];
			var tab = defaultConfig.tab;
			if(typeof(config.serverConfig.productConfig) == 'undefined'){
				// 产品没有保存过时根据tab显示表格
				for(var tabI=0;tabI<tab.length;tabI++){
					var tabObj = tab[tabI][0];
					tableDataSource.push({
						gid:tabObj.gid,
						type:tabObj.type,
						title:tabObj.title,
						voId:tabObj.voId,
					});
				}
			}else{
				productConfigTab = config.serverConfig.productConfig.tableData;
				for(var tabI=0;tabI<tab.length;tabI++){
					var isHaveSet = false;
					var tabObj = tab[tabI][0];
					for(var productTabI=0;productTabI<productConfigTab.length;productTabI++){
						if(tabObj.gid == productConfigTab[productTabI].gid){
							isHaveSet = true;
							productConfigTab[productTabI].type = tabObj.type;
							productConfigTab[productTabI].voId = tabObj.voId;
							tableDataSource.push(productConfigTab[productTabI]);
						}
					}
					if(!isHaveSet){
						tableDataSource.push({
							gid:tabObj.gid,
							type:tabObj.type,
							title:tabObj.title,
							voId:tabObj.voId,
						});
					}
				}
			}
			this.setEditorTable.data.dataSource = tableDataSource;
			this.setEditorTable.init();
		}
	}
	// 列表过滤
	var listFilterManager = {
		// 列表过滤默认配置
		defaultConfig:{
			isFormHidden:false,
			isShowTitle:false,
			title:"列表过滤模板",
			mode:'',
			template:"listFilter",
			package:"",
			getValueAjax:{},
			isSearch : '',
			saveData:{
				ajax:{},
				save:{
					text:'保存',
				},
			},
			form:{
				field:[],
				idField:'id',
				keyField:'id',
				btns:'',
				title:'',
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
			table:{
				ajax:{},
				field:[],
				btns:'',
				tableRowBtns:'',
				idField:'id',
				keyField:'volist',
				title:'',
				add:{ type : 'dialog' },
				edit:{ type : 'dialog' },
				delete:{ type : 'confirm' },
			},
		},
		modeSub:[
			{
				id:'horizontal',
				name:'horizontal',
			},{
				id:'mobile-crm-search',
				name:'mobile-crm-search',
			}
		],
		// 获取表单
		setEditorForm:function(){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本',
						id:'base',
						templateName:'listfilter',
						// isColumn:false,
						// isMode:true,
						modeSub:listFilterManager.modeSub,
					},
					{
						type:'form',
						label:'表单',
						id:'form',
						isConBtns:true,
						voId:listFilterManager.defaultConfig.form.voId,
					},
					{
						type:'table',
						label:'表格',
						id:'table',
						isConBtns:true,
						isParams:true,
						voId:listFilterManager.defaultConfig.table.voId,
					},
				]
			};
			if(config.serverConfig.productConfig){
				var productConfig = config.serverConfig.productConfig;
				var editorForm = commonManager.getForm(formAttr,productConfig); 
				commonManager.setDefToForm(editorForm,productConfig);
			}else{
				var editorForm = commonManager.getForm(formAttr);
			}
			this.formJson.form = editorForm;
			formPlane.formInit(this.formJson);
		},
		init:function(){
			this.formJson = commonManager.form;
			this.setEditorForm();
		}
	}
	// 表单表格
	var formTableManager = {
		// 表单表格默认配置
		defaultConfig:{
			form:{
				field:[],
				idField:'id',
				keyField:'id',
			},
			getValueAjax:{},
			isFormHidden:false,
			isShowTitle:false,
			package:"",
			saveData:{
				ajax:{},
				save:{
					text:'保存',
				},
			},
			table:[], // 一维数组
			template:"formTable",
			title:"",
		},
		// 设置表格
		setEditorTable:{
			// 弹框配置
			dialog:{
				id: 	"plane-page",
				title: 	'',
				size: 	"m",
				form: 	[],
				btns:[
					{
						text: 		'确认',
						handler: 	function(){}
					}
				],
			},
			// 数据
			data:{
				tableID:		'',
				dataSource: 	[],
			},
			// 表格列配置
			column:[
				{
					field : 'voId',
					title : 'voId',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden:true,
				},{
					field : 'type',
					title : '类型',
					width : 80,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'title',
					title : 'tab标题',
					width : 200,
					tabPosition : 0,
					orderable : true,
				},
				{
					field : 'field',
					title : '状态类别',
					width : 200,
					tabPosition : 0,
					orderable : true,
					formatHandler:function(value, rowData){
						var stateName = commonManager.getStateChineseName(value);
						return stateName;
					}
				},
				{
					field : 'hide',
					title : '隐藏字段',
					width : 200,
					tabPosition : 0,
					orderable : true,
					formatHandler:function(value, rowData){
						var fieldName = commonManager.getFieldChineseName(value);
						return fieldName;
					}
				},
				{
					field : 'params',
					title : 'params',
					width : 200,
					tabPosition : 0,
					orderable : true,
				},
				{
					field : 'add',
					title : '新增',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:{
						type:'dictionary',
						data:
						{
							'[object Object]':'<i class="fa fa-check"></i>',
							'':'<i class="fa fa-close"></i>',
						}
					}
				},
				{
					field : 'edit',
					title : '修改',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:{
						type:'dictionary',
						data:
						{
							'[object Object]':'<i class="fa fa-check"></i>',
							'':'<i class="fa fa-close"></i>',
						}
					}
				},
				{
					field : 'delete',
					title : '删除',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:{
						type:'dictionary',
						data:
						{
							'[object Object]':'<i class="fa fa-check"></i>',
							'':'<i class="fa fa-close"></i>',
						}
					}
				},
				{
					field : 'multiAdd',
					title : '批量新增',
					width : 200,
					tabPosition : 1,
					orderable : true,
					formatHandler:{
						type:'dictionary',
						data:
						{
							'[object Object]':'<i class="fa fa-check"></i>',
							'':'<i class="fa fa-close"></i>',
						}
					}
				},
			],
			// ui配置
			ui:{
				pageLengthMenu: 5,			//显示5行
				isSingleSelect:true,		//是否开启单行选中
				isUseTabs:true,
				tabsName:['1','2'],
			},
			// 表格行按钮
			columnBtns:[
				{'修改':function(rowData){
						formTableManager.setEditorTable.edit(rowData);
					},
				},
				{'新增按钮':function(rowData){
						var obj = {
							type:'add',
							rowData:rowData,
							title:'新增',
						}
						formTableManager.setEditorTable.btnFun(obj);
					},
				},
				{'修改按钮':function(rowData){
						var obj = {
							type:'edit',
							rowData:rowData,
							title:'修改',
						}
						formTableManager.setEditorTable.btnFun(obj);
					},
				},
				{'删除按钮':function(rowData){
						var obj = {
							type:'delete',
							rowData:rowData,
							title:'删除',
						}
						formTableManager.setEditorTable.btnFun(obj);
					},
				},
				{'批量新增按钮':function(rowData){
						var obj = {
							type:'multiAdd',
							rowData:rowData,
							title:'批量新增',
						}
						formTableManager.setEditorTable.btnFun(obj);
					},
				},
				{'上移':function(rowData){
						formTableManager.setEditorTable.moveUp(rowData);
					},
				},
				{'下移':function(rowData){
						formTableManager.setEditorTable.moveDown(rowData);
					},
				},
			],
			// 表格Html
			getTableHtml:function(){
				return '<div class="table-responsive">'
						+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+config.tableId+'">'
						+'</table>'
					+'</div>'
			},
			// 刷新行数据
			refreshLineData:function(source,save){
				var origalTableData = $.extend(true,{},source);
				var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
				for(var key in origalData){
					if(typeof(save[key])!='undefined'){
						if(save[key] != origalData[key]){
							origalData[key] = save[key];
						}
					}
				}
				baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
			},
			// 初始化方法
			init:function(){
				// 初始化表格id
				var dataConfig = $.extend(true,[],this.data);
				dataConfig.tableID = config.tableId;
				// 初始化容器
				// 表格存在初始化ui配置表格容器
				// 表格不存在在表格容器中插入表格
				var uiConfig = $.extend(true,[],this.ui);
				if($('#'+config.tableParentId).children().length>0 || typeof(baseDataTable.data[config.tableId]) == 'object'){
					uiConfig.$container = $('#'+config.tableParentId);
				}else{
					var tableHtml = this.getTableHtml();
					$('#'+config.tableParentId).append(tableHtml);
				}
				var columnConfig = $.extend(true,[],this.column);
				// 初始化列操作
				columnConfig.push({
					field:'handle',
					title:'操作',
					width : 200,
					tabPosition:'after',
					formatHandler:{
						type:'button',
						data:formTableManager.setEditorTable.columnBtns,
					}
				});
				// 初始化表格
				baseDataTable.init(dataConfig, columnConfig, uiConfig);
			},
			// 表单数组
			getFormArr:function(rowData){
				var formAttr = 
				{
					panels:[
						{
							type:'table',
							label:'',
							id:'',
							isConBtns:false,
							voId:rowData.voId,
							isParams:true,
						}
					]
				}; 
				var formArr = commonManager.getForm(formAttr,rowData,true);
				for(index=0;index<formArr.length;index++){
					if(formArr[index].id){
						formArr[index].id = formArr[index].id.substring(1);
					}
				}
				return formArr;
			},
			// 为表单赋初值
			defaultValue:function(arr,defdata){
				for(index=0;index<arr.length;index++){
					if(defdata[arr[index].id]){
						arr[index].value = defdata[arr[index].id];
					}
				}
			},
			// 行修改
			edit:function(rowData){
				if(rowData.rowData.voId){
					var formArr = this.getFormArr(rowData.rowData);
					this.defaultValue(formArr,rowData.rowData);
					var dialogConfig = $.extend(true,{},this.dialog);
					dialogConfig.form = formArr;
					dialogConfig.title = '修改';
					dialogConfig.btns[0].handler = function(){
						var dialogData = nsdialog.getFormJson("plane-page");
						if(dialogData){
							var tableLineData = $.extend(true,{},dialogData);
							tabFormListManager.setEditorTable.refreshLineData(rowData,tableLineData);
							nsdialog.hide();
						}
					};
					nsdialog.initShow(dialogConfig);
				}
			},
			btnFun:function(obj){
				var formArr = [];
				var statesArr = commonManager.stateInfo.formStates[obj.rowData.rowData.voId];
				commonManager.setBtnFormConfig(false,obj.type,statesArr,formArr);
				var addData = obj.rowData.rowData[obj.type];
				this.defaultValue(formArr,addData);
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = obj.title;
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						var tableLineData = {};
						tableLineData[obj.type] = $.extend(true,{},dialogData);
						if(dialogData.type==''){
							tableLineData[obj.type] = '';
						}
						tabFormListManager.setEditorTable.refreshLineData(obj.rowData,tableLineData);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			// 上移
			moveUp:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==0){
					nsAlert("已经是第一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition-1];
					tableData[newPosition-1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
			// 下移
			moveDown:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==tableData.length-1){
					nsAlert("已经是最后一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition+1];
					tableData[newPosition+1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
		},
		// 获取表单
		setEditorForm:function(){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本',
						id:'base',
						isColumn:false,
						isMode:true,
					},
					{
						type:'form',
						label:'表单',
						id:'form',
						isConBtns:false,
						voId:formTableManager.defaultConfig.form.voId,
					},
				]
			};
			if(config.serverConfig.productConfig){
				var productConfig = config.serverConfig.productConfig;
				if(typeof(productConfig.formData)=='object'){
					productConfig = productConfig.formData;
				}
				var editorForm = commonManager.getForm(formAttr,productConfig);
				commonManager.setDefToForm(editorForm,productConfig);
			}else{
				var editorForm = commonManager.getForm(formAttr);
			}
			this.formJson.form = editorForm;
			formPlane.formInit(this.formJson);
		},
		init:function(){
			this.formJson = commonManager.form;
			this.setEditorForm();
			var defaultConfig = this.defaultConfig;
			var tableDataSource = [];
			var tab = defaultConfig.table;
			if(typeof(config.serverConfig.productConfig) == 'undefined'){
				// 产品没有保存过时根据tab显示表格
				for(var tabI=0;tabI<tab.length;tabI++){
					var tabObj = tab[tabI];
					tableDataSource.push({
						gid:tabObj.gid,
						type:tabObj.type,
						title:tabObj.title,
						voId:tabObj.voId,
					});
				}
			}else{
				productConfigTab = config.serverConfig.productConfig.tableData;
				for(var tabI=0;tabI<tab.length;tabI++){
					var isHaveSet = false;
					var tabObj = tab[tabI];
					for(var productTabI=0;productTabI<productConfigTab.length;productTabI++){
						if(tabObj.gid == productConfigTab[productTabI].gid){
							isHaveSet = true;
							productConfigTab[productTabI].type = tabObj.type;
							productConfigTab[productTabI].voId = tabObj.voId;
							tableDataSource.push(productConfigTab[productTabI]);
						}
					}
					if(!isHaveSet){
						tableDataSource.push({
							gid:tabObj.gid,
							type:tabObj.type,
							title:tabObj.title,
							voId:tabObj.voId,
						});
					}
				}
			}
			this.setEditorTable.data.dataSource = tableDataSource;
			this.setEditorTable.init();
		}
	}
	// 移动端表单
	var mobileFormManager = {
		// 移动端表单默认配置
		defaultConfig:{
			title:"",
			package:"",
			template:"mobileForm",
			isFormHidden:false,
			isShowTitle:false,
			mode:'',
			btns:'',
			form:[], // 一维数组
			getValueAjax:{},
			saveData:{
				ajax:{},
				save:{
					text:'保存',
				},
			},
		},
		modeSub:[
			{
				id:'form-column',
				name:'form-column',
			}
		],
		// 设置表格
		setEditorTable:{
			// 弹框配置
			dialog:{
				id: 	"plane-page",
				title: 	'',
				size: 	"m",
				form: 	[],
				btns:[
					{
						text: 		'确认',
						handler: 	function(){}
					}
				],
			},
			// 数据
			data:{
				tableID:		'',
				dataSource: 	[],
			},
			// 表格列配置
			column:[
				{
					field : 'voId',
					title : 'voId',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden:true,
				},{
					field : 'type',
					title : '类型',
					width : 80,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'title',
					title : '标题',
					width : 200,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'fieldMoreTitle',
					title : '更多标题',
					width : 200,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'fieldMoreActtion',
					title : '更多动作',
					width : 200,
					tabPosition : 0,
					orderable : true,
				},
				{
					field : 'field',
					title : '状态类别',
					width : 200,
					tabPosition : 0,
					orderable : true,
					formatHandler:function(value, rowData){
						var stateName = commonManager.getStateChineseName(value);
						return stateName;
					}
				},
				{
					field : 'hide',
					title : '隐藏字段',
					width : 200,
					tabPosition : 0,
					orderable : true,
					formatHandler:function(value, rowData){
						var fieldName = commonManager.getFieldChineseName(value);
						return fieldName;
					}
				},
			],
			// ui配置
			ui:{
				pageLengthMenu: 5,			//显示5行
				isSingleSelect:true,		//是否开启单行选中
				isUseTabs:true,
				tabsName:['1'],
			},
			// 表格行按钮
			columnBtns:[
				{'修改':function(rowData){
						mobileFormManager.setEditorTable.edit(rowData);
					},
				},
				{'上移':function(rowData){
						mobileFormManager.setEditorTable.moveUp(rowData);
					},
				},
				{'下移':function(rowData){
						mobileFormManager.setEditorTable.moveDown(rowData);
					},
				},
			],
			// 表格Html
			getTableHtml:function(){
				return '<div class="table-responsive">'
						+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+config.tableId+'">'
						+'</table>'
					+'</div>'
			},
			// 刷新行数据
			refreshLineData:function(source,save){
				var origalTableData = $.extend(true,{},source);
				var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
				for(var key in origalData){
					if(typeof(save[key])!='undefined'){
						if(save[key] != origalData[key]){
							origalData[key] = save[key];
						}
					}
				}
				baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
			},
			// 初始化方法
			init:function(){
				// 初始化表格id
				var dataConfig = $.extend(true,[],this.data);
				dataConfig.tableID = config.tableId;
				// 初始化容器
				// 表格存在初始化ui配置表格容器
				// 表格不存在在表格容器中插入表格
				var uiConfig = $.extend(true,[],this.ui);
				if($('#'+config.tableParentId).children().length>0 || typeof(baseDataTable.data[config.tableId]) == 'object'){
					uiConfig.$container = $('#'+config.tableParentId);
				}else{
					var tableHtml = this.getTableHtml();
					$('#'+config.tableParentId).append(tableHtml);
				}
				var columnConfig = $.extend(true,[],this.column);
				// 初始化列操作
				columnConfig.push({
					field:'handle',
					title:'操作',
					width : 200,
					tabPosition:'after',
					formatHandler:{
						type:'button',
						data:mobileFormManager.setEditorTable.columnBtns,
					}
				});
				// 初始化表格
				baseDataTable.init(dataConfig, columnConfig, uiConfig);
			},
			// 表单数组
			getFormArr:function(rowData){
				var formAttr = 
				{
					panels:[
						{
							type:'mobileForm',
							label:'',
							id:'',
							voId:rowData.voId,
						}
					]
				}; 
				var formArr = commonManager.getForm(formAttr,rowData,true);
				for(index=0;index<formArr.length;index++){
					if(formArr[index].id){
						formArr[index].id = formArr[index].id.substring(1);
					}
				}
				return formArr;
			},
			// 为表单赋初值
			defaultValue:function(arr,defdata){
				for(index=0;index<arr.length;index++){
					if(defdata[arr[index].id]){
						arr[index].value = defdata[arr[index].id];
					}
				}
			},
			// 行修改
			edit:function(rowData){
				if(rowData.rowData.voId){
					var formArr = this.getFormArr(rowData.rowData);
					this.defaultValue(formArr,rowData.rowData);
					var dialogConfig = $.extend(true,{},this.dialog);
					dialogConfig.form = formArr;
					dialogConfig.title = '修改';
					dialogConfig.btns[0].handler = function(){
						var dialogData = nsdialog.getFormJson("plane-page");
						if(dialogData){
							var tableLineData = $.extend(true,{},dialogData);
							tabFormListManager.setEditorTable.refreshLineData(rowData,tableLineData);
							nsdialog.hide();
						}
					};
					nsdialog.initShow(dialogConfig);
				}
			},
			// 上移
			moveUp:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==0){
					nsAlert("已经是第一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition-1];
					tableData[newPosition-1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
			// 下移
			moveDown:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==tableData.length-1){
					nsAlert("已经是最后一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition+1];
					tableData[newPosition+1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
		},
		// 获取表单
		setEditorForm:function(){
			var formAttr = 
			{
				panels:[
					{
						type:'base',
						label:'基本',
						id:'base',
						isColumn:false,
						isMode:true,
						isPageParam:true,
						modeSub:mobileFormManager.modeSub,
					},
				]
			};
			if(config.serverConfig.productConfig){
				var productConfig = config.serverConfig.productConfig;
				if(typeof(productConfig.formData)=='object'){
					productConfig = productConfig.formData;
				}
				var editorForm = commonManager.getForm(formAttr,productConfig);
				commonManager.setDefToForm(editorForm,productConfig);
			}else{
				var editorForm = commonManager.getForm(formAttr);
			}
			this.formJson.form = editorForm;
			formPlane.formInit(this.formJson);
		},
		init:function(){
			this.formJson = commonManager.form;
			this.setEditorForm();
			var defaultConfig = this.defaultConfig;
			var tableDataSource = [];
			var forms = defaultConfig.form;
			if(typeof(config.serverConfig.productConfig) == 'undefined'){
				// 产品没有保存过时根据tab显示表格
				for(var formI=0;formI<forms.length;formI++){
					var formObj = forms[formI];
					tableDataSource.push({
						gid:formObj.gid,
						type:formObj.type,
						title:formObj.title,
						voId:formObj.voId,
					});
				}
			}else{
				productConfigTab = config.serverConfig.productConfig.tableData;
				for(var formI=0;formI<forms.length;formI++){
					var isHaveSet = false;
					var formObj = forms[formI];
					for(var productTabI=0;productTabI<productConfigTab.length;productTabI++){
						if(formObj.gid == productConfigTab[productTabI].gid){
							isHaveSet = true;
							productConfigTab[productTabI].type = formObj.type;
							productConfigTab[productTabI].voId = formObj.voId;
							tableDataSource.push(productConfigTab[productTabI]);
						}
					}
					if(!isHaveSet){
						tableDataSource.push({
							gid:formObj.gid,
							type:formObj.type,
							title:formObj.title,
							voId:formObj.voId,
						});
					}
				}
			}
			this.setEditorTable.data.dataSource = tableDataSource;
			this.setEditorTable.init();
		}
	}
	// 新模板 组件运用的是vue新组件
	var standardTemplateManager = {
		// 新模板默认配置
		defaultConfig:{
			package: '',
			template: '',
			title: '',
			readonly: false,
			isShowTitle: false,
			isFormHidden: false,
			getValueAjax:{},
			versionNumber: "1",
			// isHaveSaveAndAdd:true,
			components:[],
			draftBox :{
			},
		},
		// 设置表格
		setEditorTable:{
			// 弹框配置
			dialog:{
				id: 	"plane-page",
				title: 	'',
				size: 	"m",
				form: 	[],
				btns:[
					{
						text: 		'确认',
						handler: 	function(){}
					}
				],
			},
			// 数据
			data:{
				tableID:		'',
				dataSource: 	[],
			},
			// 表格列配置
			column:[
				{
					field : 'voId',
					title : 'voId',
					width : 80,
					tabPosition : 0,
					orderable : true,
					hidden:true,
				},{
					field : 'type',
					title : '类型',
					width : 80,
					tabPosition : 0,
					orderable : true,
				},
				{
					field : 'field',
					title : '状态类别',
					width : 200,
					tabPosition : 0,
					orderable : true,
					formatHandler:function(value, rowData){
						var stateName = commonManager.getStateChineseName(value);
						return stateName;
					}
				},
				{
					field : 'hide',
					title : '隐藏字段',
					width : 200,
					tabPosition : 0,
					orderable : true,
					formatHandler:function(value, rowData){
						var fieldName = commonManager.getFieldChineseName(value);
						return fieldName;
					}
				},{
					field : 'defaultComponentWidth',
					title : '表单默认宽度（百分比）',
					width : 80,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'formStyle',
					title : 'formStyle',
					width : 80,
					tabPosition : 0,
					orderable : true,
				},{
					field : 'isSetMore',
					title : 'isSetMore',
					width : 80,
					tabPosition : 0,
					orderable : true,
				},
			],
			// ui配置
			ui:{
				pageLengthMenu: 10,			//显示5行
				isSingleSelect:true,		//是否开启单行选中
				isUseTabs:true,
				tabsName:['1'],
			},
			// 表格行按钮
			columnBtns:[
				{'修改':function(rowData){
						standardTemplateManager.setEditorTable.edit(rowData);
					},
				},
				{'上移':function(rowData){
						standardTemplateManager.setEditorTable.moveUp(rowData);
					},
				},
				{'下移':function(rowData){
						standardTemplateManager.setEditorTable.moveDown(rowData);
					},
				},
			],
			// 表格Html
			getTableHtml:function(){
				return '<div class="table-responsive">'
						+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+config.tableId+'">'
						+'</table>'
					+'</div>'
			},
			// 刷新行数据
			refreshLineData:function(source,save){
				var origalTableData = $.extend(true,{},source);
				var origalData = baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data();
				// for(var key in origalData){
				// 	if(typeof(save[key])!='undefined'){
				// 		if(save[key] != origalData[key]){
				// 			origalData[key] = save[key];
				// 		}
				// 	}
				// }
				for(var key in save){
					if(typeof(origalData[key])=='undefined'){
						origalData[key] = save[key];
					}else{
						if(save[key] != origalData[key]){
							origalData[key] = save[key];
						}
					}
				}
				baseDataTable.table[origalTableData.tableId].row(origalTableData.obj.parents("tr")).data(origalData).draw(false);
			},
			// 初始化方法
			init:function(){
				// 初始化表格id
				var dataConfig = $.extend(true,[],this.data);
				dataConfig.tableID = config.tableId;
				// 初始化容器
				// 表格存在初始化ui配置表格容器
				// 表格不存在在表格容器中插入表格
				var uiConfig = $.extend(true,[],this.ui);
				if($('#'+config.tableParentId).children().length>0 || typeof(baseDataTable.data[config.tableId]) == 'object'){
					uiConfig.$container = $('#'+config.tableParentId);
				}else{
					var tableHtml = this.getTableHtml();
					$('#'+config.tableParentId).append(tableHtml);
				}
				var columnConfig = $.extend(true,[],this.column);
				// 初始化列操作
				columnConfig.push({
					field:'handle',
					title:'操作',
					width : 200,
					tabPosition:'after',
					formatHandler:{
						type:'button',
						data:standardTemplateManager.setEditorTable.columnBtns,
					}
				});
				// 初始化表格
				baseDataTable.init(dataConfig, columnConfig, uiConfig);
			},
			// 表单数组
			getFormArr:function(defdata){
				var stateType = defdata.type;
				var voId = defdata.voId ? defdata.voId : '';
				var templateName = standardTemplateManager.defaultConfig.template ? standardTemplateManager.defaultConfig.template : '';
				var formAttr = 
				{
					panels:[
						{
							type:'standard',
							label:'',
							id:'',
							voId:voId,
							stateType:stateType,
							templateName:templateName,
						}
					]
				};
				var formArr = commonManager.getForm(formAttr,defdata,true);
				return formArr;
			},
			// 为表单赋初值
			defaultValue:function(arr,defdata){
				for(index=0;index<arr.length;index++){
					if(defdata[arr[index].id]){
						arr[index].value = defdata[arr[index].id];
					}
				}
			},
			// 行修改
			edit:function(rowData){
				var formArr = this.getFormArr(rowData.rowData);
				this.defaultValue(formArr,rowData.rowData);
				var dialogConfig = $.extend(true,{},this.dialog);
				dialogConfig.form = formArr;
				dialogConfig.title = '修改';
				dialogConfig.btns[0].handler = function(){
					var dialogData = nsdialog.getFormJson("plane-page");
					if(dialogData){
						var tableLineData = $.extend(true,{},dialogData);
						standardTemplateManager.setEditorTable.refreshLineData(rowData,tableLineData);
						nsdialog.hide();
					}
				};
				nsdialog.initShow(dialogConfig);
			},
			// 上移
			moveUp:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==0){
					nsAlert("已经是第一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition-1];
					tableData[newPosition-1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
			// 下移
			moveDown:function(rowData){
				var tableData = baseDataTable.allTableData(config.tableId);
				if(rowData.rowIndexNumber==tableData.length-1){
					nsAlert("已经是最后一个了","error");
				}else{
					var newPosition = rowData.rowIndexNumber;
					var newData = rowData.rowData;
					tableData[newPosition] = tableData[newPosition+1];
					tableData[newPosition+1] = newData;
					nsTable.originalConfig[config.tableId].dataConfig.dataSource = tableData;
					nsTable.refreshByID(config.tableId);
				}
			},
		},
		// 获取表单
		setEditorForm:function(){
			var formAttr = 
			{
				panels:[
					{
						type:'standardBase',
						label:'基本',
						id:'base',
					},
				]
			};
			if(config.serverConfig.productConfig){
				var productConfig = config.serverConfig.productConfig;
				if(typeof(productConfig.formData)=='object'){
					productConfig = productConfig.formData;
				}
				var editorForm = commonManager.getForm(formAttr,productConfig);
				commonManager.setDefToForm(editorForm,productConfig);
			}else{
				var editorForm = commonManager.getForm(formAttr);
			}
			this.formJson.form = editorForm;
			formPlane.formInit(this.formJson);
		},
		init:function(){
			this.formJson = commonManager.form;
			this.setEditorForm();
			var defaultConfig = this.defaultConfig;
			var tableDataSource = [];
			var tab = defaultConfig.components;
			if(!config.isSavePageConfig){
				tab = config.serverConfig.programmerConfig.tab;
			}
			if(config.serverConfig.programmerConfig && config.serverConfig.programmerConfig.form && config.serverConfig.programmerConfig.form.template){
				defaultConfig.template = config.serverConfig.programmerConfig.form.template;
			}
			if(typeof(config.serverConfig.productConfig) == 'undefined' || $.isEmptyObject(config.serverConfig.productConfig)){
				// 产品没有保存过时根据tab显示表格
				for(var tabI=0;tabI<tab.length;tabI++){
					var tabObj = tab[tabI];
					tableDataSource.push({
						gid:tabObj.gid,
						type:tabObj.type,
						voId:tabObj.voId,
					});
				}
			}else{
				productConfigTab = config.serverConfig.productConfig.tableData;
				for(var tabI=0;tabI<tab.length;tabI++){
					var isHaveSet = false;
					var tabObj = tab[tabI];
					for(var productTabI=0;productTabI<productConfigTab.length;productTabI++){
						if(tabObj.gid == productConfigTab[productTabI].gid){
							isHaveSet = true;
							productConfigTab[productTabI].type = tabObj.type;
							productConfigTab[productTabI].voId = tabObj.voId;
							tableDataSource.push(productConfigTab[productTabI]);
						}
					}
					if(!isHaveSet){
						tableDataSource.push({
							gid:tabObj.gid,
							type:tabObj.type,
							voId:tabObj.voId,
						});
					}
				}
			}
			this.setEditorTable.data.dataSource = tableDataSource;
			this.setEditorTable.init();
		}
	}
	// 关联调用
	var templateManager = {
		doubleTables:doubleTablesManager,
		singleTable:singleTableManager,
		singleForm:singleFormManager,
		tabFormList:tabFormListManager,
		listFilter:listFilterManager,
		formTable:formTableManager,
		treeTable:treeTableManager,
		mobileForm:mobileFormManager,
		standardTemplate:standardTemplateManager,
	}
	function init(_config){
		/***
		 *{
		 * 	formId: 		表单id
		 * 	tableId: 		表格id
		 * 	treeId:  		树模板form/table表单id
		 * 	tableParentId: 	table表格容器id
		 * 	parentId: 		整体编辑器id
		 *  xmmapToJson: 	思维导图/sourceJSON
		 *  templateAttr: 	模板属性
		 *  voData: 		vo相关数据
		 *  voMapObj:       思维导图数组集合
		 *}
		 ***/
		config = _config;
		//根据模板类型显示编辑器
		var templateName = config.templateAttr.template;
		this.currentTemplateName = templateName;
		commonManager.getSaveConfigByAjax();
	}
	function saveData(){
		// templateManager[config.templateAttr.template].saveValues();
		commonManager.saveValues();
	}
	return {
		init:init,
		commonManager:commonManager,
		doubleTablesManager:doubleTablesManager,
		saveData:saveData,
		getConfig:function(){
			return config;
		}
	}
})(jQuery)
