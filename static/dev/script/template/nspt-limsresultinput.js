/*
	*3级数据联动 块状表格（主表） 详情表（块状表格+list表格
	* @Author: netstar.sjj
	* @Date: 2019-06-19 10:45:00
	* 数据关系 {id:'333',saleList:[{saleId:'33',price:33,customerList:[{customerId:'333'}]}]} 
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.limsResultInput = (function(){
	/***************组件事件调用 start**************************** */
	function dialogBeforeHandler(data,templateId){
		$(document).off('keydown');
		data = typeof(data)=='object' ? data : {};
		var config = NetstarTemplate.templates.limsResultInput.data[templateId].config;
		var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
		var operatorObject = 'detail';//默认操作的是主表
		if(data.event){
			if($(data.event.currentTarget).length > 0){
				var operatormain = $(data.event.currentTarget).attr('isoperatormain');
				if(operatormain == 'true'){
					operatorObject = 'main';
				}
			}
		}
		data.value = {};
		var idField = config.mainComponent.idField;
		var keyField = config.mainComponent.keyField;
		if(typeof(config.levelConfig[2])=='undefined'){
			operatorObject = 'main';
		}
		switch(operatorObject){
			case 'detail':
				idField = config.levelConfig[2].idField;
				keyField = config.levelConfig[2].keyField;
				data.value = getDetailsSelectedData(config);
				break;
			case 'main':
				data.value = getMainListSelectedData(config);
				break;
			//case 'resultinput':
				//sjj 20191125
				//data.value = NetstarUI.resultTable.getCurrentData(_templateConfig.levelConfig[3].id);
				//break;
		}

		if(!$.isEmptyObject(config.pageParam)){
			var pageFieldArr = ['processId','activityId','activityName','workItemId','workflowType','acceptFileIds'];
			for(var paramI=0; paramI<pageFieldArr.length; paramI++){
			   if(config.pageParam[pageFieldArr[paramI]]){
					data.value[pageFieldArr[paramI]] = config.pageParam[pageFieldArr[paramI]];
			   }
			}
		}

		var tdDataByResultinput;
		if(controllerObj.targetField == 'selectedListByTdData'){
			//sjj 20191125 添加支持获取右侧结果录入表格选中单元格的获取值方式
			tdDataByResultinput = NetstarUI.resultTable.getCurrentData(config.levelConfig[3].id);
		}
		if(typeof(tdDataByResultinput)=='boolean'){
			data.value = false;
		}else{
			data.value.parentSourceParam = {
				package:config.package,
				id:idField,
				templateId:config.id,
			};
			if(!$.isEmptyObject(tdDataByResultinput)){
				data.value.selectedListByTdData = tdDataByResultinput;
			}
		}
		data.btnOptionsConfig = {
			options:{
				idField:idField
			},
			descritute:{
				keyField:keyField,
				idField:idField
			}
		};
		data.config = config;
		return data;
	}
	//ajax前置回调
	function ajaxBeforeHandler(handlerObj,templateId){
		$(document).off('keydown');
		//是否有选中值有则处理，无则返回
		var config = NetstarTemplate.templates.limsResultInput.data[templateId].config;
		handlerObj.config = config;
		var gridConfig = config.mainComponent;
		if(config.levelConfig[2]){
			gridConfig = config.levelConfig[2];
		}
		if($.isEmptyObject(handlerObj.value)){
			handlerObj.value = getDetailsSelectedData(config);
		}
		handlerObj.ajaxConfigOptions = {
			idField:gridConfig.idField,
			keyField:gridConfig.keyField,
			pageParam:config.pageParam,
		};
		handlerObj.config = config;
		return handlerObj;
	}
	function refreshData(data){
		/**data object 接受参
				* idField 主键id
				*package 包名
				*templateId string*/
		var config = NetstarTemplate.templates.limsResultInput.data[data.templateId].config;
		var data = getMainListSelectedData(config);
		refreshListAjaxByData(config.levelConfig[2].ajax,data,config.levelConfig[2]);
	}
	//ajax后置回调
	function ajaxAfterHandler(res,templateId,plusData){
		NetstarUI.resultTable.initShortkey();
		var config = NetstarTemplate.templates.limsResultInput.data[templateId].config;
		var gridConfig = config.mainComponent;
		var gridId = gridConfig.id;
		plusData = typeof(plusData)=='object' ? plusData : {};
		if(plusData.targetField == 'selectedListByTdData'){
			NetstarUI.resultTable.init(NetstarUI.resultTable.config);
		}else{
			NetStarGrid.refreshById(gridId);
		}
		
		/*var level2Config = config.levelConfig[2];
		switch(res.objectState){
			case NSSAVEDATAFLAG.DELETE:
				//删除
				NetStarGrid.delRow(res,level2Config.id);
				break;
			case NSSAVEDATAFLAG.EDIT:
				//修改
				NetStarGrid.editRow(res,level2Config.id);
				break;
			case NSSAVEDATAFLAG.ADD:
				//添加
				NetStarGrid.addRow(res,level2Config.id);
				break;
			case NSSAVEDATAFLAG.VIEW:
				//刷新
				var data = getMainListSelectedData(config);
				refreshListAjaxByData(level2Config.ajax,data,level2Config);
				break;
		}*/
	}
	//跳转打开界面回调
	function loadPageHandler(){}
	//关闭打开界面回调
	function closePageHandler(){}
	//获取主表选中行数据
	function getMainListSelectedData(_config){
		var mainListId = _config.mainComponent.id;
		var data = [];
		switch(_config.mainComponent.type){
			case 'blockList':
				data = NetstarBlockList.getSelectedData(mainListId);
				break;
			case 'list':
				data = NetStarGrid.getSelectedData(mainListId);
				break;
		}
		return data[0] ? data[0] : {};
	}
	//获取子表数据选中行数据
	function getDetailsSelectedData(_config){
		var level2ListId = _config.levelConfig[2].id;
		var levelListSelectedData = [];
		var returnSelectedData = {};
		switch(_config.levelConfig[2].type){
			case 'blockList':
				levelListSelectedData = NetstarBlockList.getSelectedData(level2ListId);
				break;
			case 'list':
				levelListSelectedData = NetStarGrid.getSelectedData(level2ListId);
				break;
		}
		if($.isArray(levelListSelectedData)){
			if(levelListSelectedData.length > 0){
				returnSelectedData = levelListSelectedData[0];
				var level3ListSelectedData = [];
				var level3ListId = _config.levelConfig[3].id;
				switch(_config.levelConfig[3].type){
					case 'blockList':
						level3ListSelectedData = NetstarBlockList.getSelectedData(level3ListId);
						break;
					case 'list':
						level3ListSelectedData = NetStarGrid.getSelectedData(level3ListId);
						break;
				}
				if($.isArray(level3ListSelectedData)){
					if(level3ListSelectedData.length > 0){
						returnSelectedData[_config.levelConfig[3].keyField] = level3ListSelectedData;
					}
				}
			}
		}
		return returnSelectedData;
	}
	//获取整体参数
	function getWholeData(_config){
		return getDetailsSelectedData(_config);
	}
	// 主表设置按钮只读
	function setMainBtnsDisabled(data, gridConfig){
		// lyw 设置主表按钮是否只读   根据NETSTAR-TRDISABLE(行只读)(获得消息后行设置了只读按钮禁用了，选中其他行时需要取消禁用)
		var config = NetstarTemplate.templates.configs[gridConfig.package];
		var rootConfig = config.mainComponent;
		var isDisabled = false;
		if(data['NETSTAR-TRDISABLE']){
			// 行没有只读取消按钮禁用
			isDisabled = true;
		}
		var rootBtnId = '';  // 主表按钮容器id
		var components = config.components;
		for(var i=0; i<components.length; i++){
			var component = components[i];
			if(component.type == "btns" && component.operatorObject == 'root'){
				rootBtnId = component.id;
				break;
			}
		}
		var $btns = $('#' + rootBtnId).find('button');
		for(var i=0; i<$btns.length; i++){
			$btns.eq(i).attr('disabled', isDisabled);
		}
	}
	//结果录入初始化
	function resultInputByInit(componentConfig,paramsData){
		var resultTableConfig = {
			id:componentConfig.id,
			//id:'resultTableContainer',
			pageParam:paramsData,
			//containerID:'resultTableContainer',
			isUseAutoWindowHeight:false,
			isUseControlPanel:true,
			isUseSettingWidthSize:false, //是否使用设置宽度尺寸，如果不使用则匹配屏幕
			isUseSettingHeightSize:true, //是否使用设置高度，不使用则全部默认为30像素一行

			isUseSettingIndex:true,
			setAutoIndex:'h',
			//isAllReadonly:true, 		 //是否全部设为只读
			//isShowHistory:false, 		//是否显示历史记录
			//unUseSettingStyle:['border','background','align','font'], 
			//unUseSettingStyle 不使用的样式表对象类，只有这四类，写上了就不起作用
			tableAjax:componentConfig.tableAjax,
			saveTimer:2,
			timer:500,
			saveAjax:componentConfig.saveAjax,
			historyAjax:componentConfig.historyAjax,
			default:{
				urlPrefix:getRootPath(), 		//url前缀
				inputLength:12, 				//输入框默认长度
				selectLength:8, 				//下拉框默认长度
				checkboxajax:{ 					//系统数据多选组件相关配置项
					isNumberID:false, 				//id是否是数字
					isMultiSelect:true, 			//更多下拉框是否多选
					type:'GET', 					//ajax type
					dataSrc:'rows', 					//ajax datascr
					field:{							//数据配置
						id:'id', 					//id
						name:'name', 			 	//名称
						py:'py', 					//拼音简拼
						wb:'wb', 					//五笔简拼
					},
					data:{
						methodIds:paramsData.methodIds,
					},
					show:['name']
				},
				uploadAjax:{
					src:getRootPath()+"/files/upload",//上传图片的路径
					dataSrc:"data",//数据源
					field:{//数据配置
						name:"name",//名称
						id:"id",//id
					},
					downLoadAjax:{
						src:getRootPath()+'/files/download',
						id:'id'
					},
				},
				uploadSaveAjax:{
					src:"http://ui-pc:8888/NPE/File/upload",//保存图片的路径
					dataSrc:"rows",//数据源
					field:{//数据配置
						id:"id",//id
						smallThumb:"smallThumb",//小缩略图
						bigThumb:"bigThumb",//大缩略图
						title:"title"//标题
					}
				},
				uploadAllAjax:{
					src:getRootPath()+"/files/uploadList",//上传图片的路径
					dataSrc:"rows",//数据源
					field:{//数据配置
						name:"name",//名称
						id:"id",//id
					},
				},
				uploadAllSaveAjax:{
					src:getRootPath()+"/files/commit",//保存图片的路径
					dataSrc:"rows",//数据源
					field:{//数据配置
						id:"id",//id
						smallThumb:"smallThumb",//小缩略图
						bigThumb:"bigThumb",//大缩略图
						title:"title"//标题
					}
				},
				uploadDelAjax:{
					src:getRootPath() + '/files/delById',
				},
				datestring:{
					//format:'MM月DD日'
					format:'HH时mm分'
				}
			},
			callback:{
				notesFunc:function(data){
					console.log(data)
					var dialogCommon = {
						id:'notes-list-dialog',
						title: '批注列表',
						templateName: 'PC',
						width:600,
						height:'auto',
						shownHandler:function(_showDialogConfig){
							var columnsArr = [
								{
									"englishName": "comment",
									"className": "java.lang.String",
									"gid": "cf82bd65-4fbd-f00d-a7b8-7ca69423c0dc",
									"variableType": "string",
									"chineseName": "批注",
									"isHaveChineseName": true,
									"id": "comment",
									"label": "批注",
									"type": "text",
									"field": "comment",
									"title": "批注",
									"editConfig": {
										"type": "text",
										"formSource": "table",
										"templateName": "PC",
										"variableType": "string"
									},
									"mindjetIndexState": 0,
									"width": 200
								},
								{
									"englishName": "commentBy",
									"chineseName": "批注人",
									"variableType": "string",
									"field": "commentBy",
									"title": "批注人",
									"mindjetType": "select",
									"isSet": "是",
									"displayType": "all",
									"gid": "e43ff384-fa5c-8439-6851-f0996219f802",
									"voName": "detectiondataDetectionTestDataCommentVO",
									"editConfig": {
										"id": "commentBy",
										"englishName": "commentBy",
										"chineseName": "批注人",
										"variableType": "string",
										"mindjetType": "select",
										"isSet": "是",
										"displayType": "all",
										"gid": "e43ff384-fa5c-8439-6851-f0996219f802",
										"voName": "detectiondataDetectionTestDataCommentVO",
										"className": "java.lang.Long",
										"type": "select",
										"label": "批注人",
										"textField": "userName",
										"valueField": "id",
										"isObjectValue": false,
										"selectMode": "single",
										"method": "POST",
										"dataSrc": "rows",
										"suffix": "/system/users/getList",
										"url": "/system/users/getList"
									},
									"mindjetIndexState": 1,
									"width": 200
								},
								{
									"englishName": "whenComment",
									"chineseName": "批注时间",
									"variableType": "date",
									"field": "whenComment",
									"title": "批注时间",
									"mindjetType": "date",
									"isSet": "是",
									"displayType": "all",
									"gid": "ed256d2a-db29-a6de-286d-9db5065ef884",
									"voName": "detectiondataDetectionTestDataCommentVO",
									"editConfig": {
										"id": "whenComment",
										"englishName": "whenComment",
										"chineseName": "批注时间",
										"variableType": "date",
										"mindjetType": "date",
										"isSet": "是",
										"displayType": "all",
										"gid": "ed256d2a-db29-a6de-286d-9db5065ef884",
										"voName": "detectiondataDetectionTestDataCommentVO",
										"className": "java.util.Date",
										"type": "date",
										"label": "批注时间"
									},
									"formatHandler": {
										"type": "date",
										"data": {
											"formatDate": "YYYY-MM-DD HH:mm:ss"
										}
									},
									"width": 150,
									"columnType": "datetime",
									"mindjetIndexState": 2
								}
							];
							var gridConfig = {
								id: _showDialogConfig.config.bodyId,
								columns:columnsArr,
								data:{
									src: getRootPath() + "/sample/detection/comment/getCommentByTestDataId",
									contentType: "application/json",
									dataSrc: "rows",
									idField: "id",
									type: "POST",
									isPage: true,
									isSearch: true,
									isServerMode: false,
									primaryID: "id",
									data:{
										testDataId:data.data.id
									}
								},
								ui:{
									height:400,
									selectMode: "single",
									rowdbClickHandler:function(rowData){
										
									},
									paramsData:{testDataId:data.data.id},
									//title:'',//表格标题
									isOpenQuery:true,//是否开启查询
									isOpenAdvanceQuery:true,//是否开启高级查询
								}
							};
							NetStarGrid.init(gridConfig);
						},
						hiddenHandler:function(){
							var closeAjaxConfig = {
								url:getRootPath()+'/sample/detection/comment/getCommentStatus',
								data:{
									testDataId:data.data.id
								},
								contentType: "application/json",
								dataSrc: "data",
								type: "POST",
							};
							NetStarUtils.ajax(closeAjaxConfig,function(res){
								if(res.success){
									NetstarUI.resultTable.notesChangeState(data.data.id,res.data.status);
								}else{
									var msg = res.msg ? res.msg : '操作失败';
									nsalert(msg,'error');
								}
							},true);
						}
					};
					NetstarComponent.dialogComponent.init(dialogCommon);
				}
			},
			//缓存相关配置
			/*cache:{
				//列表
				cacheListKeyName:'taskGroupName',
				cachelistAjax:{
					url:getRootPath() + '/assets/json/resultmanager/cachelist.json',
					type:'get',
					data:{
						state:0,
						activityId:21355
					},
					dataSrc:'rows',
				},
				//数据
				cacheDataAjax:{
					//缓存ajax地址
					url:getRootPath() + '/assets/json/resultmanager/tabledata.json',
					//读取cachelistAjax的返回结果里的数据作为参数发出去
					dataNames:{
						recordId: 			'recordId',
						taskIds: 			'taskIds',
						recordTemplateId: 	'recordTemplateId'
					}
				},
				//固定缓存项
				cacheDataPlusAjax:[
					{
						url:getRootPath() + '/assets/json/project-list.json',
						type:'get',
						data:{
							state:0,
							activityId:1
						}
					},{
						url:getRootPath() + '/assets/json/project-list.json',
						type:'get',
						data:{
							state:0,
							activityId:2
						}
					}
				]	
			}*/
		}
		//sjj 20191021添加readonly setAutoIndex=“v”属性
		if(!$.isEmptyObject(componentConfig.params)){
			$.each(componentConfig.params,function(key,value){
				resultTableConfig[key] = value;
			});
		}
		if(typeof(resultTableConfig.readonly)=='boolean'){
			resultTableConfig.isAllReadonly = resultTableConfig.readonly;
		}
		NetstarUI.resultTable.init(resultTableConfig);
	}
	function refreshListAjaxByData(_listConfig,_data,componentConfig){
		var ajaxConfig = $.extend(true,{},_listConfig);
		var ajaxOptions = {
				url:ajaxConfig.src,       //地址
				data:ajaxConfig.data,     //参数
				type:ajaxConfig.type, 
				contentType:ajaxConfig.contentType, 
				plusData:{
					dataSrc:ajaxConfig.dataSrc,
					componentConfig:componentConfig
				},
		};
		if(!$.isEmptyObject(ajaxOptions.data)){
			//存在自定义值 需要区分是默认配置值如{dataauth:3}还是{"saleId":"{saleId}"}
			//如果是存在自定义要转换的参数
			var isUseObject = true;
			var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
			for(var key in ajaxOptions.data){
				if (ajaxParameterRegExp.test(ajaxOptions.data[key])) {
					isUseObject = false;
					break;
				}
			}
			if(isUseObject){
				ajaxOptions.data = _data;
			}else{
				ajaxOptions.data = NetStarUtils.getFormatParameterJSON(ajaxOptions.data,_data);
			}
		}else{
			ajaxOptions.data = _data;
		}
		NetStarUtils.ajax(ajaxOptions, function(res, _ajaxOptions){
			if(res.success){
				//成功
				var resData = res[_ajaxOptions.plusData.dataSrc];
				var listArray = [];
				if(!$.isArray(resData)){
					listArray = resData[_ajaxOptions.plusData.componentConfig.keyField];
				}else{
					listArray = resData;
				}
				if(!$.isArray(listArray)){
					listArray = [];
				}
				if(listArray.length > 0){
					listArray[0].netstarSelectedFlag = true;						
					switch(_ajaxOptions.plusData.componentConfig.type){
						case 'blockList':
							NetstarBlockList.refreshDataById(_ajaxOptions.plusData.componentConfig.id,listArray);
							break;
						case 'list':
							NetStarGrid.refreshDataById(_ajaxOptions.plusData.componentConfig.id,listArray);
							break;
					}
					if(_ajaxOptions.plusData.componentConfig.level === 2){
						//刷新的是第二级
						var templateConfig = NetstarTemplate.templates.limsResultInput.data[_ajaxOptions.plusData.componentConfig.templateId].config;
						var level3Config = templateConfig.levelConfig[3];
						switch(level3Config.type){
							case 'resultinput':
								var paramsConfig = $.extend(true,{},templateConfig.pageParam);
								$.each(listArray[0],function(key,value){
									paramsConfig[key] = value;
								})
								resultInputByInit(level3Config,paramsConfig);
								break;
						}
					}
				}else{
					switch(_ajaxOptions.plusData.componentConfig.type){
						case 'blockList':
							NetstarBlockList.refreshDataById(_ajaxOptions.plusData.componentConfig.id,[]);
							break;
						case 'list':
							NetStarGrid.refreshDataById(_ajaxOptions.plusData.componentConfig.id,[]);
							break;
					}
					if(_ajaxOptions.plusData.componentConfig.level === 2){
						var templateConfig = NetstarTemplate.templates.limsResultInput.data[_ajaxOptions.plusData.componentConfig.templateId].config;
						switch(templateConfig.levelConfig[3].type){
							case 'blockList':
								NetstarBlockList.refreshDataById(templateConfig.levelConfig[3].id,[]);
								break;
							case 'list':
								NetStarGrid.refreshDataById(templateConfig.levelConfig[3].id,[]);
								break;
						}
					}
				}
			}else{
				nsalert(res.msg,'warning');
			}
		},true);
	}
	function mainGridSelectedHandler(data,_rows,_vueData,gridConfig){
		//刷新二级数据
		var templateConfig = NetstarTemplate.templates.configs[gridConfig.package];
		if(templateConfig.levelConfig[2]){
			var componentConfig = templateConfig.levelConfig[2];
			refreshListAjaxByData(componentConfig.ajax,data,componentConfig);
		}else{
			var level3Config = templateConfig.levelConfig[3];
			switch(level3Config.type){
				case 'resultinput':
					var paramsConfig = $.extend(true,{},templateConfig.pageParam);
					$.each(data,function(key,value){
						paramsConfig[key] = value;
					})
					resultInputByInit(level3Config,paramsConfig);
					break;
			}
		}
		var footerId = 'footer-'+templateConfig.id;
		if($('#'+footerId).length > 0){
			NetstarComponent.clearValues(footerId,false);
			NetstarComponent.fillValues(data,footerId);
		}
		//var componentConfig = NetstarTemplate.templates.configs[gridConfig.package].levelConfig[2];
		//refreshListAjaxByData(componentConfig.ajax,data,componentConfig);
		// lyw 设置主表按钮是否只读   根据NETSTAR-TRDISABLE(行只读)(获得消息后行设置了只读按钮禁用了，选中其他行时需要取消禁用)
		setMainBtnsDisabled(data, gridConfig);
	}
	function mainGridAjaxSuccessHandler(resData,_gridId){
		var templateId =_gridId.substring(0,_gridId.lastIndexOf('-blockList'));
		if(templateId == ''){
			templateId = _gridId.substring(0,_gridId.lastIndexOf('-list'));
		}
		var templateConfig = NetstarTemplate.templates.limsResultInput.data[templateId].config;
		if(templateConfig.levelConfig[2]){
			var componentConfig = templateConfig.levelConfig[2];
			var listAjax = componentConfig.ajax;
			if($.isArray(resData)){
				var selectIndex = -1;
				for(var rowI=0; rowI<resData.length; rowI++){
					if(resData[rowI].netstarSelectedFlag){
						selectIndex = rowI;
						break;
					}
				}
				if(selectIndex > -1){
					refreshListAjaxByData(listAjax,resData[selectIndex],componentConfig);
				}
			}
		}else{
			var level3Config = templateConfig.levelConfig[3];
			if($.isArray(resData)){
				var selectIndex = -1;
				for(var rowI=0; rowI<resData.length; rowI++){
					if(resData[rowI].netstarSelectedFlag){
						selectIndex = rowI;
						break;
					}
				}
				if(selectIndex > -1){
					switch(level3Config.type){
						case 'resultinput':
							var paramsConfig = $.extend(true,{},templateConfig.pageParam);
							$.each(resData[selectIndex],function(key,value){
								paramsConfig[key] = value;
							})
							resultInputByInit(level3Config,paramsConfig);
							break;
					}
				}
			}
		}
	}
	function mainGridDrawHandler(){

	}
	function setMainGridQueryTableHtml(gridConfig){
		var contidionHtml = '';
		var quickqueryHtml = '';
		var id = 'query-'+gridConfig.id;
		if(gridConfig.ui.query){
			quickqueryHtml = '<div class="pt-panel-col" id="'+id+'">'
								
							+'</div>';
		}
		if(quickqueryHtml){
			contidionHtml = '<div class="pt-container">'
								+'<div class="pt-panel-row">'
									+quickqueryHtml
								+'</div>'
							+'</div>';
		}
		contidionHtml = '<div class="pt-panel pt-grid-header">'		
							+contidionHtml
						+'</div>';
		$('#'+gridConfig.id).prepend(contidionHtml);
	}
	function mainGridQuickqueryInit(gridConfig){
		var queryConfig = gridConfig.ui.query;
	//	queryConfig.queryForm[0].inputWidth = 120;
	//	queryConfig.queryForm[1].inputWidth = 120;
		var voWidth = parseFloat(($('#query-'+gridConfig.id).outerWidth()-100)/2);
		//queryConfig.queryForm[0].inputWidth = voWidth;
		//queryConfig.queryForm[1].inputWidth = voWidth;
		if(!$.isArray(queryConfig.queryForm)){
			queryConfig.queryForm = [];
		}
		for(var queryI=0; queryI<queryConfig.queryForm.length; queryI++){
			queryConfig.queryForm[queryI].inputWidth = voWidth;	
			if(queryConfig.queryForm[queryI].type == 'select'){
				queryConfig.queryForm[queryI].inputWidth = voWidth - 45;	
			}
		}
		var formJson = {
			form:queryConfig.queryForm,
			id:'query-'+gridConfig.id,
			formStyle:'pt-form-normal',
			plusClass:'pt-custom-query',
			isSetMore:false
		};
		function confirmQuickQueryHandler(_configObj){
			var formId = _configObj.formId;
			var gridId = _configObj.gridId;
			var packageName = NetstarBlockList.configs[gridId].gridConfig.package;
			var config = NetstarTemplate.templates.configs[packageName];
			var mainConfig = config.mainComponent;
			var formJson = NetstarComponent.getValues(formId);
			var paramJson = {};
			if(formJson.filtermode == 'quickSearch'){
				if(formJson.filterstr){
					paramJson = {
						searchType:formJson.filtermode,
						keyword:formJson.filterstr
					};
				}
			}else{
				var queryConfig = NetstarComponent.config[formId].config[formJson.filtermode];
				if(!$.isEmptyObject(queryConfig)){
					if(formJson[formJson.filtermode]){
						if(queryConfig.type == 'business'){	
							switch(queryConfig.selectMode){
								case 'single':
									paramJson[formJson.filtermode] = formJson[formJson.filtermode][queryConfig.idField];
									break;
								case 'checkbox':
									paramJson[formJson.filtermode] = formJson[formJson.filtermode][0][queryConfig.idField];
									break;
							}
						}else{
							paramJson[formJson.filtermode] = formJson[formJson.filtermode];
						}
					}
					if(typeof(formJson[formJson.filtermode])=='number'){
						paramJson[formJson.filtermode] = formJson[formJson.filtermode];
					}
					if(queryConfig.type == 'dateRangePicker'){
						var startDate = formJson.filtermode+'Start';
						var endDate = formJson.filtermode+'End';
						paramJson[startDate] = formJson[startDate];
						paramJson[endDate] = formJson[endDate];
					}
				}else{
					if(formJson.filterstr){
						paramJson[formJson.filtermode] = formJson.filterstr;
					}
				}
			}
			if(!$.isEmptyObject(config.pageParam)){
				for(var valueI in config.pageParam){
					if(typeof(paramJson[valueI])=='number'){

					}else if(paramJson[valueI]){

					}else{
						paramJson[valueI] = config.pageParam[valueI];
					}
				}
			}
			NetStarGrid.refreshById(mainConfig.id,paramJson);
		}
		function customFilterRefreshBtnHandler(event){
			var $this = $(this);
			var package = $this.attr('ns-package');
			var config = NetstarTemplate.templates.configs[package];
			var mainConfig = config.mainComponent;
			var formId = 'query-'+mainConfig.id;
			var formJson = NetstarComponent.getValues(formId);
			var paramJson = {};
			if(formJson.filtermode == 'quickSearch'){
				if(formJson.filterstr){
					paramJson = {
						searchType:formJson.filtermode,
						keyword:formJson.filterstr
					};
				}
			}else{
				var queryConfig = NetstarComponent.config[formId].config[formJson.filtermode];
				if(!$.isEmptyObject(queryConfig)){
					if(formJson[formJson.filtermode]){
						if(queryConfig.type == 'business'){	
							switch(queryConfig.selectMode){
								case 'single':
									paramJson[formJson.filtermode] = formJson[formJson.filtermode][queryConfig.idField];
									break;
								case 'checkbox':
									paramJson[formJson.filtermode] = formJson[formJson.filtermode][0][queryConfig.idField];
									break;
							}
						}else{
							paramJson[formJson.filtermode] = formJson[formJson.filtermode];
						}
					}
					if(typeof(formJson[formJson.filtermode])=='number'){
						paramJson[formJson.filtermode] = formJson[formJson.filtermode];
					}
					if(queryConfig.type == 'dateRangePicker'){
						var startDate = formJson.filtermode+'Start';
						var endDate = formJson.filtermode+'End';
						paramJson[startDate] = formJson[startDate];
						paramJson[endDate] = formJson[endDate];
					}
				}else{
					if(formJson.filterstr){
						paramJson[formJson.filtermode] = formJson.filterstr;
					}
				}
			}
			if(!$.isEmptyObject(config.pageParam)){
				for(var valueI in config.pageParam){
					if(typeof(paramJson[valueI])=='number'){

					}else if(paramJson[valueI]){

					}else{
						paramJson[valueI] = config.pageParam[valueI];
					}
				}
			}
			NetStarGrid.refreshById(mainConfig.id,paramJson);
		}
		formJson.completeHandler = function(obj){
			var buttonHtml = '<div class="pt-btn-group">'
							+'<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" ns-package="'+gridConfig.package+'" containerid="'+formJson.id+'"><i class="icon-search"></i></button>'
						+'</div>';
			var $container = $('#'+formJson.id);
			$container.append(buttonHtml);
			$('button[containerid="'+formJson.id+'"]').off('click',customFilterRefreshBtnHandler);
			$('button[containerid="'+formJson.id+'"]').on('click',customFilterRefreshBtnHandler);
		}
		var component2 = NetstarComponent.formComponent.getFormConfig(formJson);
		for(var component in component2.component){
			var elementConfig = component2.component[component];
			elementConfig.methods.inputEnter = function(event){
				if(elementConfig.isShowDialog&&typeof(elementConfig.returnData)=="object"&&typeof(elementConfig.returnData.documentEnterHandler)=='function'){
					elementConfig.returnData.documentEnterHandler();
				}else{
					event.stopImmediatePropagation();
					var elementId = $(event.currentTarget).attr('id');
					this.blur();
					var formId = $(this.$el).closest('.pt-form-body').attr('id');
					elementId = elementId.substring(formId.length+1,elementId.length);
					formId = formId.substring(5,formId.length);

					var elementComponentConfig = NetstarComponent.config[formId].config[elementId];
					if(elementComponentConfig.type == 'businessSelect'){
						var vueConfig = NetstarComponent.config[formId].vueConfig[elementId];
						NetstarComponent.businessSelect.searchByEnter(elementComponentConfig, vueConfig, function(context, data){
							var plusData = data.plusData;
							var _config = context.config ? context.config : NetstarComponent.config[formId].config[plusData.componentId];
							var _vueConfig = context.vueConfig ? context.vueConfig : NetstarComponent.config[formId].vueConfig[plusData.formID];
							_vueConfig.loadingClass = '';
							if(data.success){
								var dataSrc = _config.search.dataSrc;
								var value = data[dataSrc];
								if($.isArray(value)&&value.length==1){
									_vueConfig.setValue(value); // 赋值
								}
								var gridId = formId.substring(6,formId.length);
								var templateId = gridId.substring(0,gridId.lastIndexOf('-list'));
								if(templateId){
									config = NetstarTemplate.templates.limsResultInput.data[templateId].config;
								}
								confirmQuickQueryHandler({gridId:gridId,formId:formId});
							}
						});
					}else if(elementComponentConfig.type == 'business'){
						var vueConfig = NetstarComponent.config[formId].vueConfig[elementId];
						NetstarComponent.business.searchByEnter(elementComponentConfig, vueConfig, function(context, data){
							var plusData = data.plusData;
							var _config = context.config ? context.config : NetstarComponent.config[formId].config[plusData.componentId];
							var _vueConfig = context.vueConfig ? context.vueConfig : NetstarComponent.config[formId].vueConfig[plusData.formID];
							_vueConfig.loadingClass = '';
							if(data.success){
								var dataSrc = _config.search.dataSrc;
								var value = data[dataSrc];
								if($.isArray(value)&&value.length==1){
									_vueConfig.setValue(value); // 赋值
								}
								var gridId = formId.substring(6,formId.length);
								var templateId = gridId.substring(0,gridId.lastIndexOf('-list'));
								if(templateId){
									config = NetstarTemplate.templates.limsResultInput.data[templateId].config;
								}
								confirmQuickQueryHandler({gridId:gridId,formId:formId});
							}
						});
					}else{
						var gridId = formId.substring(6,formId.length);
						var templateId = gridId.substring(0,gridId.lastIndexOf('-list'));
						if(templateId){
							config = NetstarTemplate.templates.limsResultInput.data[templateId].config;
						}
						confirmQuickQueryHandler({gridId:gridId,formId:formId});
					}
				}
			}
		}
		NetstarComponent.formComponent.init(component2,formJson);
	}
	function mainGridCompleteHandler(_configs){
		var gridConfig = _configs.gridConfig;
		setMainGridQueryTableHtml(gridConfig);
		mainGridQuickqueryInit(gridConfig);
	}
	function gridLevel2SelectHandler(data,_rows,_vueData,gridConfig){
		//刷新三级数据
		var componentConfig = NetstarTemplate.templates.configs[gridConfig.package].levelConfig[3];
		refreshListAjaxByData(componentConfig.ajax,data,componentConfig);
	}
	function gridLevel2DrawHandler(){

	}
	function gridLevel2CompleteHandler(){

	}
	/***************组件事件调用 end************************** */
	//组件初始化
	function initComponent(_config){
		for(var componentType in _config.componentsConfig){
			var componentData = _config.componentsConfig[componentType];
			switch(componentType){
			   case 'vo':
				  NetstarTemplate.commonFunc.vo.initVo(componentData,_config);
				  break;
			   case 'list':
				   	
					/*if(componentData[_config.levelConfig[2].id]){
						//list是第二层
						componentData[_config.levelConfig[2].id].params = {
							height:parseInt(_config.commonPanelHeight/2)
						};
					}else if(componentData[_config.levelConfig[3].id]){
							//list是第三层
						var gridHeight = _config.commonPanelHeight - 34;
						if(_config.mode == 'listgrid'){
							gridHeight = parseInt(_config.commonPanelHeight/2);
						}
						componentData[_config.levelConfig[3].id].params = {
							height:gridHeight
						};
					}*/
					NetstarTemplate.commonFunc.list.initList(componentData,_config);
				  break;
			   case 'blockList':
					/*if(componentData[_config.levelConfig[2].id]){
						//list是第二层
						var gridHeight = 34;
						if(_config.mode == 'listgrid'){
							gridHeight = _config.commonPanelHeight;
						}
						componentData[_config.levelConfig[2].id].params = {
							height:gridHeight,
							selectedHandler:gridLevel2SelectHandler,
							drawHandler:gridLevel2DrawHandler,
							completeHandler:gridLevel2CompleteHandler
						};
					}else if(componentData[_config.levelConfig[3].id]){
						
					}*/
				  	NetstarTemplate.commonFunc.blockList.initBlockList(componentData,_config);
				  break;
			   case 'btns':
					_config.btnKeyFieldJson.root.outBtns.push({
						btn:{
							text:'设置检测人',
							handler:function(data){
								data = data.dialogBeforeHandler(data);
								var _obj = data.value;
								var _templateConfig = data.config;
								var dialogConfig = {
									id : 'dialog-test-people-list',
									title : '设置检测人',
									templateName : 'PC',
									height:600,
									width:1000,
									shownHandler : function(_showConfig){
										var deptId;
										if(NetstarHomePage.config){
											if(NetstarHomePage.config.systemInfo.userInfo){
												deptId = NetstarHomePage.config.systemInfo.userInfo.deptId;
											}
										}
									   var componentList = {
											id:_showConfig.config.bodyId,
											type:'list',
											idField:'id',
											data:{
												isSearch:false,
												isPage:true,
												primaryID:'id',
												idField:'id',
												src:getRootPath()+"/workLoadDetails/getListByRecordId",
												contentType: "application/x-www-form-urlencoded",
												//contentType: "application/json; charset=utf-8",
												data: {recordId: _obj.id},
												dataFormat: "object",
												dataSrc: "rows",
												type: "POST",
											},
											columns:[
												{
													"englishName": "testRecordId",
													"className": "java.lang.Long",
													"gid": "9c700831-dac6-c3d2-bcd5-f1a45d6dea0c",
													"variableType": "string",
													"chineseName": "检测记录表id",
													"isHaveChineseName": true,
													"id": "testRecordId",
													"label": "检测记录表id",
													"type": "text",
													"field": "testRecordId",
													"title": "检测记录表id",
													"editConfig": {
														"type": "text",
														"formSource": "table",
														"templateName": "PC",
														"variableType": "string"
													},
													"mindjetIndexState": 0,
													"width": 200,
													"hidden": true
												},
												{
													"englishName": "id",
													"className": "java.lang.Long",
													"gid": "a3af63ef-59be-a72b-c0e4-51c3786cfa3e",
													"variableType": "string",
													"chineseName": "id",
													"isHaveChineseName": false,
													"id": "id",
													"label": "id",
													"type": "text",
													"field": "id",
													"title": "id",
													"editConfig": {
														"type": "text",
														"formSource": "table",
														"templateName": "PC",
														"variableType": "string"
													},
													"mindjetIndexState": 1,
													"width": 200,
													"hidden": true
												},
												{
													"englishName": "itemReportName",
													"chineseName": "项目id",
													"variableType": "string",
													"field": "itemReportName",
													"title": "检测项目",
													"mindjetType": "select",
													"isSet": "是",
													"displayType": "all",
													"gid": "b5a6a108-2b9f-dc26-c166-082856cbbedc",
													"voName": "sampleWorkLoadDetailVO",
													"editConfig": {
														"id": "itemReportName",
														"englishName": "id",
														"chineseName": "项目id",
														"variableType": "string",
														"mindjetType": "select",
														"isSet": "是",
														"displayType": "all",
														"gid": "b5a6a108-2b9f-dc26-c166-082856cbbedc",
														"voName": "sampleWorkLoadDetailVO",
														"type": "text",
														"label": "检测项目",
														"disabled": false,
														"hidden": false,
													},
													"editable": false,
													"hidden": false,
													"orderable": true,
													"searchable": false,
													"tooltip": false,
													"isDefaultSubdataText": true,
													"mindjetIndexState": 2,
													"width": 200
												},
												{
													"englishName": "preTreat",
													"chineseName": "预处理",
													"variableType": "string",
													"field": "preTreat",
													"title": "预处理",
													"mindjetType": "select",
													"isSet": "是",
													"displayType": "all",
													"gid": "f7f3ff21-6b5c-7a07-bf32-57dca021ac6b",
													"voName": "sampleWorkLoadDetailVO",
													"editConfig": {
														"id": "preTreat",
														"englishName": "preTreat",
														"chineseName": "预处理",
														//"rules":"required",
														"variableType": "string",
														"mindjetType": "select",
														"isSet": "是",
														"displayType": "all",
														"gid": "f7f3ff21-6b5c-7a07-bf32-57dca021ac6b",
														"voName": "sampleWorkLoadDetailVO",
														"className": "java.lang.String",
														"type": "select",
														"label": "预处理",
														"textField": "userName",
														"valueField": "id",
														"isObjectValue": false,
														"selectMode": "checkbox",
														"method": "POST",
														"dataSrc": "rows",
														"disabled": false,
														"hidden": false,
														"isDistinct": false,
														"suffix": "/system/users/getTestDeptUserList",
														"data":{},
														"url": getRootPath()+"/system/users/getTestDeptUserList",
														blurHandler:function(_dConfig){
															var rowIndex = Number(_dConfig.rowIndex);
															var gridId = _dConfig.formID;
															if(rowIndex == 0){
																//判断其他行是否有值没有则赋值
																var grid = NetStarGrid.configs[gridId];
																var originalRows = NetStarGrid.configs[gridId].vueObj.originalRows;
																if(originalRows.length > 1){
																	for(var i=1; i<originalRows.length; i++){
																		var oData = originalRows[i];
																		var cValue = typeof(oData[_dConfig.id])=='undefined' ? '' : oData[_dConfig.id];
																		if(cValue == ''){
																			oData[_dConfig.id] = originalRows[0][_dConfig.id];
																		}
																	}
																	NetStarGrid.refreshDataById(gridId,originalRows);
																}
															}
														}
														//"rules": "required",
														//"placeholder":"必填",
													},
													"editable": true,
													"hidden": false,
													"orderable": true,
													"searchable": false,
													"tooltip": false,
													"isDefaultSubdataText": true,
													"mindjetIndexState": 3,
													"width": 200
												},
												{
													"englishName": "mainTester",
													"chineseName": "主要检测人",
													"variableType": "string",
													"field": "mainTester",
													"title": "主实验人",
													"mindjetType": "select",
													"isSet": "是",
													"displayType": "all",
													"gid": "2131647c-e5df-9412-039c-ccfc21d9ff47",
													"voName": "sampleWorkLoadDetailVO",
													"editConfig": {
														"id": "mainTester",
														"englishName": "mainTester",
														"chineseName": "主要检测人",
														"variableType": "string",
														"mindjetType": "select",
														"isSet": "是",
														"displayType": "all",
														"gid": "2131647c-e5df-9412-039c-ccfc21d9ff47",
														"voName": "sampleWorkLoadDetailVO",
														"className": "java.lang.String",
														"type": "select",
														"label": "主实验人",
														"textField": "userName",
														"valueField": "id",
														"isObjectValue": false,
														"selectMode": "checkbox",
														"method": "POST",
														"dataSrc": "rows",
														"disabled": false,
														"hidden": false,
														"isDistinct": false,
														"suffix": "/system/users/getTestDeptUserList",
														"data":{},
														"url": getRootPath()+"/system/users/getTestDeptUserList",
														"rules": "required",
														blurHandler:function(_dConfig){
															var rowIndex = Number(_dConfig.rowIndex);
															var gridId = _dConfig.formID;
															if(rowIndex == 0){
																//判断其他行是否有值没有则赋值
																var grid = NetStarGrid.configs[gridId];
																var originalRows = NetStarGrid.configs[gridId].vueObj.originalRows;
																if(originalRows.length > 1){
																	for(var i=1; i<originalRows.length; i++){
																		var oData = originalRows[i];
																		var cValue = typeof(oData[_dConfig.id])=='undefined' ? '' : oData[_dConfig.id];
																		if(cValue == ''){
																			oData[_dConfig.id] = originalRows[0][_dConfig.id];
																		}
																	}
																	NetStarGrid.refreshDataById(gridId,originalRows);
																}
															}
														}
													},
													"editable": true,
													"hidden": false,
													"orderable": true,
													"searchable": false,
													"tooltip": false,
													"isDefaultSubdataText": true,
													"mindjetIndexState": 4,
													"width": 200
												},
												{
													"englishName": "assistant",
													"chineseName": "辅助检测人",
													"variableType": "string",
													"field": "assistant",
													"title": "辅实验人",
													"mindjetType": "select",
													"isSet": "是",
													"displayType": "all",
													"gid": "9de215d8-46ee-47a2-761c-f7711e9e98c4",
													"voName": "sampleWorkLoadDetailVO",
													"editConfig": {
														"id": "assistant",
														"englishName": "assistant",
														"chineseName": "辅助检测人",
														"variableType": "string",
														"mindjetType": "select",
														"isSet": "是",
														"displayType": "all",
														"gid": "9de215d8-46ee-47a2-761c-f7711e9e98c4",
														"voName": "sampleWorkLoadDetailVO",
														"className": "java.lang.String",
														"type": "select",
														"label": "辅实验人",
														"textField": "userName",
														"valueField": "id",
														"isObjectValue": false,
														"selectMode": "checkbox",
														"method": "POST",
														"dataSrc": "rows",
														"disabled": false,
														"hidden": false,
														"isDistinct": false,
														"suffix": "/system/users/getTestDeptUserList",
														"data":{},
														"url": getRootPath()+"/system/users/getTestDeptUserList",
														//"rules": "required",
														blurHandler:function(_dConfig){
															var rowIndex = Number(_dConfig.rowIndex);
															var gridId = _dConfig.formID;
															if(rowIndex == 0){
																//判断其他行是否有值没有则赋值
																var grid = NetStarGrid.configs[gridId];
																var originalRows = NetStarGrid.configs[gridId].vueObj.originalRows;
																if(originalRows.length > 1){
																	for(var i=1; i<originalRows.length; i++){
																		var oData = originalRows[i];
																		var cValue = typeof(oData[_dConfig.id])=='undefined' ? '' : oData[_dConfig.id];
																		if(cValue == ''){
																			oData[_dConfig.id] = originalRows[0][_dConfig.id];
																		}
																	}
																	NetStarGrid.refreshDataById(gridId,originalRows);
																}
															}
														}
													},
													"editable": true,
													"hidden": false,
													"orderable": true,
													"searchable": false,
													"tooltip": false,
													"isDefaultSubdataText": true,
													"mindjetIndexState": 5,
													"width": 200
												},
												{
													"englishName": "recorder",
													"chineseName": "记录人",
													"variableType": "string",
													"field": "recorder",
													"title": "记录人",
													"mindjetType": "select",
													"isSet": "是",
													"displayType": "all",
													"gid": "8928c578-dfb6-34b3-d930-73a78e305d61",
													"voName": "sampleWorkLoadDetailVO",
													"editConfig": {
														"id": "recorder",
														"englishName": "recorder",
														"chineseName": "记录人",
														"variableType": "string",
														"mindjetType": "select",
														"isSet": "是",
														"displayType": "all",
														"gid": "8928c578-dfb6-34b3-d930-73a78e305d61",
														"voName": "sampleWorkLoadDetailVO",
														"className": "java.lang.String",
														"type": "select",
														"label": "记录人",
														"textField": "userName",
														"valueField": "id",
														"isObjectValue": false,
														"selectMode": "checkbox",
														"method": "POST",
														"dataSrc": "rows",
														"disabled": false,
														"hidden": false,
														"isDistinct": false,
														"suffix": "/system/users/getTestDeptUserList",
														"data":{},
														"url": getRootPath()+"/system/users/getTestDeptUserList",
														//"rules": "required",
														blurHandler:function(_dConfig){
															var rowIndex = Number(_dConfig.rowIndex);
															var gridId = _dConfig.formID;
															if(rowIndex == 0){
																//判断其他行是否有值没有则赋值
																var grid = NetStarGrid.configs[gridId];
																var originalRows = NetStarGrid.configs[gridId].vueObj.originalRows;
																if(originalRows.length > 1){
																	for(var i=1; i<originalRows.length; i++){
																		var oData = originalRows[i];
																		var cValue = typeof(oData[_dConfig.id])=='undefined' ? '' : oData[_dConfig.id];
																		if(cValue == ''){
																			oData[_dConfig.id] = originalRows[0][_dConfig.id];
																		}
																	}
																	NetStarGrid.refreshDataById(gridId,originalRows);
																}
															}
														}
													},
													"editable": true,
													"hidden": false,
													"orderable": true,
													"searchable": false,
													"tooltip": false,
													"isDefaultSubdataText": true,
													"mindjetIndexState": 6,
													"width": 200
												},{
													"englishName":"whenTransact",
													"chineseName":"记录时间",
													"variableType":"date",
													"field":"whenTransact",
													"title":"记录时间",
													"mindjetType":"date",
													"isSet":"是",
													"displayType":"all",
													"gid":"05103123-5da3-16b1-fa35-6afc297c7d52",
													"voName":"sampleWorkLoadDetailVO",
													"isDefaultDate":true,
													"editConfig":{
														"id":"whenTransact",
														"englishName":"whenTransact",
														"chineseName":"记录时间",
														"variableType":"date",
														"mindjetType":"date",
														"isSet":"是",
														"displayType":"all",
														"gid":"05103123-5da3-16b1-fa35-6afc297c7d52",
														"voName":"sampleWorkLoadDetailVO",
														"className":"java.util.Date",
														"type":"date",
														"label":"记录时间",
														"isDefaultDate":true,
														"ranges":false,
														"disabled":false,
														"hidden":false,
														"isDistinct":false,
														"rules": "required",
													},
													"editable":true,
													"hidden":false,
													"orderable":true,
													"searchable":true,
													"tooltip":false,
													"isDefaultSubdataText":true,
													"width":100,
													"formatHandler":{
														"type":"date",
														"data":{"formatDate":"YYYY-MM-DD","isDefaultDate":true}
													},
													"columnType":"date",
													"mindjetIndexState":7,
													"isAllowUserAction":true,
													"isNeedRowData":false
												}
											],
											ui:{
												isHaveEditDeleteBtn:false,
												isEditMode:true,
												selectMode:'single',
												defaultSelectedIndex:0,
												isAllowAdd:false,
												isPage:false,
											}
									   };
									   NetStarGrid.init(componentList);
									   //输出按钮
									   var btnConfig = {
										  id:_showConfig.config.footerIdGroup,
										  isShowTitle:false,
										  btns:[
											 {
												text:'保存',
												handler:function(data){
													var mainGridConfigManager = NetStarGrid.configs['dialog-dialog-test-people-list-body'];
													var mainGridConfig = mainGridConfigManager.gridConfig;
													var columns = mainGridConfig.columns;
													var verifyRuleObj = {};
													var verifyResult = true;
													var hasRequired = {
														required: false,
														info: []
													};
													var legalMsg = '';
													for (var index = 0; index < columns.length; index++) {
													   var item = columns[index];
													   if (typeof item.editConfig != 'undefined') {
														  if (typeof item.editConfig.rules != 'undefined' && item.editConfig.rules.indexOf('required') != -1) {
															 hasRequired.required = true;
															 hasRequired.info.push({
																id: item.editConfig.id,
																name: item.editConfig.label
															 })
															 verifyRuleObj[item.editConfig.id] = {
																keyField: item.editConfig.id,
																rules: item.editConfig.rules,
																type: item.editConfig.type,
																name: item.editConfig.label
															 };
														  }
													   }
													}
													var listArr = NetStarGrid.dataManager.getData('dialog-dialog-test-people-list-body');
													for (var index = 0; index < listArr.length; index++) {
														var item = listArr[index];
														var isContinue = true;
														for(var verifyI in verifyRuleObj){  //sjj 20191202
														   if(typeof(item[verifyI])=='undefined'){
															  //终止循环
															  isContinue = false;
															  var islegal = NetstarComponent.validatValue(verifyRuleObj[verifyI]);
															  if(islegal.validatInfo.indexOf(',') != -1){
																 islegal.validatInfo = islegal.validatInfo.substr(0, islegal.validatInfo.length - 1);
															  }
															  if(islegal.validatInfo == ''){
																islegal.validatInfo = '必填';
															  }
															  if(legalMsg.indexOf(key) == -1){
																 //(' + key + ')
																 legalMsg = verifyRuleObj[verifyI].name + ': ' + islegal.validatInfo + ',';
															  }
															  verifyResult = false;
															  break;
														   }
														}
														if(isContinue){
														   for (var key in item) {
															  if (item.hasOwnProperty(key) && typeof verifyRuleObj[key] != 'undefined') {
																 var value = item[key];
																 var element = verifyRuleObj[key];
																 element.value = value;
																 var islegal = NetstarComponent.validatValue(element);
																 if (!islegal.isTrue) {
																	if (islegal.validatInfo.indexOf(',') != -1) {
																	   islegal.validatInfo = islegal.validatInfo.substr(0, islegal.validatInfo.length - 1);
																	}
																	if(islegal.validatInfo == ''){
																		islegal.validatInfo = '必填';
																	}
																	if (legalMsg.indexOf(key) == -1) {
																	   legalMsg = element.name + ': ' + islegal.validatInfo + ',';
																	}
																	verifyResult = false;
																 }
															  }
														   }
														}
													}
													if(!verifyResult) {
														legalMsg = legalMsg.substr(0, legalMsg.length - 1);
														nsalert(legalMsg, 'error');
														return false;
													}
													var saveAjaxConfig = {
														url:getRootPath()+"/workLoadDetails/save",
														contentType: "application/json",
														data: {
															loadDetailVOList:listArr,
															testRecordId: _obj.id,
															objectstate:2
														},
														dataFormat: "object",
														dataSrc: "data",
														type: "POST",
													};
													NetStarUtils.ajax(saveAjaxConfig,function(res){
														if(res.success){
															nsalert('设置检测人成功','success');
															NetstarComponent.dialog['dialog-test-people-list'].vueConfig.close();//关闭弹出框
														}
													},true);
												}
											 },{
												text:'取消',
												handler:function(data){
												    NetstarComponent.dialog['dialog-test-people-list'].vueConfig.close();//关闭弹出框
												}
											 }
										  ]
									   };
									   vueButtonComponent.init(btnConfig);
									}
								};
								NetstarComponent.dialogComponent.init(dialogConfig);
							}
						},
						functionConfig:{
							englishName:'workLoadDetailsSave',
						}
					},{
						btn:{
							text:'设置平行样',
							handler:function(data){
								data = data.dialogBeforeHandler(data);
								var _obj = data.value;
								var _templateConfig = data.config;
								if (!_obj) {
									nsalert("请选择记录");
									return;
								}
								var _node = NetstarUI.resultTable.getCurrentData(_templateConfig.levelConfig[3].id);
								if (_node && _node.data.sampleItemId) {
									var ajaxConfig = {
										url:getRootPath() + '/sample/accept/sampleItems/getSampleItemBySampleIdAndRecordId',
										data: {
											sampleId: _node.data.sampleId,
											testRecordId: _node.data.recordId
										},
										type: "post",
									};
									NetStarUtils.ajax(ajaxConfig,function(res){
										if(res.success){
											var _itemArr = res.rows;
											if(!$.isArray(_itemArr)){
												_itemArr = [];
											}
											var _sampleItemIds="";
											for(var i=0;i<_itemArr.length;i++){
												_sampleItemIds = _sampleItemIds + _itemArr[i].id  + ",";
											}
											if(_sampleItemIds != ""){
												_sampleItemIds = _sampleItemIds.substring(0,_sampleItemIds.length-1);
											}
											var dialogCommon = {
												id:'parallelNumberDiv',
												title: '设置平行样',
												templateName: 'PC',
												height:'auto',
												width:'500px',
												shownHandler:function(data){
													var fieldArray =  [{
														id: "sampleItemIds",
														label: "项目名称",
														type: 'select',
														rules: 'required',
														selectMode: 'multi',
														width: '100%',
														maximumItem: 20,
														textField: "itemReportName",
														valueField: "id",
														rules: 'required',
														subdata: _itemArr,
														value:_sampleItemIds
													},
														{
															id: 'parallelNumber',
															label: '平行样数量',
															width: '100%',
															type: 'text',
															rules: 'required positiveInteger',
															column: 12
														}
													];
													var formConfig = {
														id: data.config.bodyId,
														templateName: 'form',
														componentTemplateName: 'PC',
														defaultComponentWidth:'50%',
														form:fieldArray,
													};
													NetstarComponent.formComponent.show(formConfig);
													var btnJson = {
														id:data.config.footerIdGroup,
														//pageId:id,
														btns:[
															{
																text:'保存',
																handler:function(){
																	var _jsonData = NetstarComponent.getValues('dialog-parallelNumberDiv-body');
																	if (_jsonData) {
																		var ajaxConfig = {
																			url: getRootPath() + '/sample/detection/testData/saveParallelNumber',
																			data: _jsonData,
																			type: "post",
																		};
																		NetStarUtils.ajax(ajaxConfig,function(res){
																			if(res.success){
																				nsalert('设置平行样成功');
																				//刷新操作
																				NetstarComponent.dialog['parallelNumberDiv'].vueConfig.close();
																				NetstarUI.resultTable.init(NetstarUI.resultTable.config);
																				//NetstarTemplate.templates.limsResultInput.ajaxAfterHandler({},_templateConfig.id);	
																			}else{
																				if (res.msg) {
																					nsalert(res.msg);
																				} else {
																					nsalert("设置平行样失败");
																				}
																			}
																		},true);
																	}
																}
															},{
																text:'关闭',
																handler:function(){
																	NetstarComponent.dialog['parallelNumberDiv'].vueConfig.close();
																}
															}
														]
													};
													vueButtonComponent.init(btnJson);
												}
											};
											NetstarComponent.dialogComponent.init(dialogCommon);
											
										}
									},true)
								} else {
									nsalert("请选择方法数据单元格！");
									return;
								}
							}
						},
						functionConfig:{
							englishName:'getSampleItemBySampleIdAndRecordId',
						}
					},{
						btn:{
							text:'设置矩阵样条件',
							handler:function(data){
								data = data.dialogBeforeHandler(data);
								var _obj = data.value;
								var _templateConfig = data.config;
								if (!_obj) {
									nsalert("请选择记录", 'error');
									return;
								}
								var _node = NetstarUI.resultTable.getCurrentData(_templateConfig.levelConfig[3].id);
								if (_node && _node.data) {
									var ajaxConfig = {
										url:getRootPath() + '/dataNodeMatrixConditions/getByRecordIdMatrixList',
										data: {
											gridId: _node.data.gridId,
											recordId: _node.data.recordId
										},
										type: "post",
										//contentType:'application/json'
									};
									var matrixArr = [];
									
									NetStarUtils.ajax(ajaxConfig,function(res){
										if(res.success){
											// nsalert('获取矩阵样关系成功');
											window.resultInputMatrixServerData = $.extend(true, [], res.rows); //用于比较objectState的服务器端返回值
											matrixArr = res.rows;
											NetstarComponent.dialogComponent.init(dialogCommon);
											//刷新操作
											//NetstarTemplate.templates.limsResultInput.ajaxAfterHandler({},_templateConfig.id);
										}
									});
									//设置矩阵样条件弹框 start ------
									var dialogCommon = {
										id:'parallelNumberDiv',
										title: '设置矩阵样条件',
										templateName: 'PC',
										height:'500px',
										shownHandler:function(data){

											var columns =  [
											{
												title : '',
												field : 'id',
												hidden : true
											}, {
												field : 'recordId',
												title : 'recordId',
												hidden:true,
												searchable : true
											}, {
												field : 'gridId',
												title : 'gridId',
												hidden:true,
												searchable : true
											}, {
												field : 'dataNodeId',
												title : 'dataNodeId',
												hidden:true,
												searchable : true
											},{
												field : 'nodeName',
												title : '节点名称',
												width:100,
												searchable : true
											},{
												field : 'matrixConditions',
												title : '矩阵关系',
												width:300,
												searchable : true,
												editable:true,
												editConfig:{
													type:'text',
												}
											}
											];

											var gridConfig = {
												id: data.config.bodyId,
												columns:columns,
												data:{
													idField:'id',
													dataSource:matrixArr,
												},
												ui:{
													isEditMode:true,
													isAllowAdd:false,
													/*
													tableRowBtns:[{
														text:'启用',
														handler:function(data){
															var _row = data.rowData;
															debugger;
															var startAjaxConfig = {
																url:getRootPath() + '/sample/detection/testData/startMatrixConditions',
																data: {
																	recordId: _row.recordId,
																	id: _row.id,
																	gridId:_row.gridId,
																	dataNodeId : _row.dataNodeId,
																	matrixConditions : _row.matrixConditions
																},
																type: "post",
																contentType:'application/json'
															};
															NetStarUtils.ajax(startAjaxConfig,function(res){
																if(res.success){
																	nsalert('启动成功');
																	//刷新操作
																	//NetstarTemplate.templates.limsResultInput.ajaxAfterHandler({},_templateConfig.id);
																}
															});
														}
													},{
														text:'停用',
														handler:function(){
															var _row = data.rowData;
															debugger;
															var startAjaxConfig = {
																url:getRootPath() + '/sample/detection/testData/stopMatrixConditions',
																data: {
																	recordId: _row.recordId,
																	id: _row.id,
																	gridId:_row.gridId,
																	dataNodeId : _row.dataNodeId,
																	matrixConditions : _row.matrixConditions
																},
																type: "post",
																contentType:'application/json'
															};
															NetStarUtils.ajax(startAjaxConfig,function(res){
																if(res.success){
																	nsalert('停用成功');
																	//刷新操作
																	//NetstarTemplate.templates.limsResultInput.ajaxAfterHandler({},_templateConfig.id);
																}
															});
														}
													}]
													*/
												}
											};
											NetStarGrid.init(gridConfig);


											var btnJson = {
												id:data.config.footerIdGroup,
												//pageId:id,
												btns:[
													{
														text:'保存',
														handler:function(){
															// var _jsonData = NetstarComponent.getValues('dialog-parallelNumberDiv-body');
															var _jsonData = NetStarGrid.dataManager.getData('dialog-parallelNumberDiv-body');
															var serverData = {id:1, list:window.resultInputMatrixServerData}
															for(var i = 0; i<serverData.list.length; i++){
																delete serverData.list[i].objectState;
															}
															var pageData = {id:1, list:$.extend(true, [], _jsonData)}
															for(var i = 0; i<pageData.list.length; i++){
																delete pageData.list[i].objectState;
															}
															// pageData = {id:1, list:pageData};
															var saveData = nsServerTools.getObjectStateData(serverData, pageData, {root:'id', 'root.list':'id'});
															var _saveData = saveData.list;
															//换了个VO 保存 所以把名字改了 这种操作不规范临时处理 cy
															for(var i=0; i < saveData.list.length; i++){
																var listData = saveData.list[i];
																if(typeof(listData.nodeId)=='string'){
																	listData.dataNodeId = listData.nodeId;
																}
															}
															if (_jsonData) {
																var ajaxConfig = {
																	url: getRootPath() + '/sample/detection/testData/saveMatrixList',
																	data: _saveData,
																	type: "post",
																};
																NetStarUtils.ajax(ajaxConfig,function(res){
																	if(res.success){
																		nsalert('设置矩阵样条件成功');
																		//刷新操作
																		NetstarUI.resultTable.init(NetstarUI.resultTable.config);
																		//NetstarTemplate.templates.limsResultInput.ajaxAfterHandler({},_templateConfig.id);	
																	}else{
																		if (res.msg) {
																			nsalert(res.msg);
																		} else {
																			nsalert("设置矩阵样失败");
																		}
																	}
																},true);
															}
														}
													},{
														text:'关闭',
														handler:function(){
															NetstarComponent.dialog['parallelNumberDiv'].vueConfig.close();
														}
													}
												]
											};
											vueButtonComponent.init(btnJson);
										}
									};
									
									//设置矩阵样条件弹框 end ------

								} else {
									nsalert("请选择方法数据单元格");
									return;
								}
							}
						},
						functionConfig:{
							englishName:'dataNodeMatrixConditions',
						}
					},
					{
						btn:{
							text:'获取仪器设备',
							handler:function(ev){
								//设置矩阵样条件弹框 start ------
								var dialogCommon = {
									id:'parallelNumberDiv',
									title: '选择仪器',
									templateName: 'PC',
									width:600,
									height:'auto',
									shownHandler:function(data){

										
										var columns =  [
											{
												"id": "id",
												"label": "id",
												"type": "text",
												"field": "id",
												"title": "id",
												"hidden":true,
												"width": 200
											},
											{
												"field": "deviceName",
												"title": "设备名称",
												"orderable": true,
												"searchable": true,
												"width": 106,
											},
											{
												"variableType": "string",
												"field": "deviceNo",
												"title": "设备检号",
												"hidden": false,
												"orderable": true,
												"searchable": true,
												"width": 106,
											},
											{
												"field": "model",
												"title": "规格型号",
												"width": 200
											},
											{
												"field": "cost",
												"title": "原价值",
												"width": 200
											},
											{
												"field": "manufacturerName",
												"title": "制造厂商",
												"width": 200
											},
											{
												"field": "whenBuy",
												"title": "购入日期",
												"orderable": true,
												"searchable": false,
												"width": 100,
												"formatHandler": {
													"type": "date",
													"data": {
														"formatDate": "YYYY-MM-DD",
														"isDefaultDate": true
													}
												},
												"columnType": "date",
											},
											{
												"field": "whenUse",
												"title": "启用日期",
												"editable": false,
												"hidden": false,
												"orderable": true,
												"searchable": false,
												"width": 100,
												"formatHandler": {
													"type": "date",
													"data": {
														"formatDate": "YYYY-MM-DD",
														"isDefaultDate": true
													}
												},
												"columnType": "date",
											},
											{
												"field": "deviceType",
												"title": "设备类型",
												"dictArguments": "deviceType",
												"orderable": true,
												"isDefaultSubdataText": true,
												"width": 82,
												"formatHandler": {
													"type": "dictionary",
													"data": {
														"0": "铁路",
														"1": "公路",
														"2": "建筑"
													}
												},
												"columnType": "dictionary"
											}
										];
										var gridConfig = {
											id: data.config.bodyId,
											columns:columns,
											data:{
												src: getRootPath() + "/equipment/deviceBases/getList",
												contentType: "application/json",
												dataSrc: "rows",
												idField: "id",
												type: "POST",
												isPage: true,
												isSearch: true,
												isServerMode: false,
												primaryID: "id"
											},
											ui:{
												height:400,
												selectMode: "single",
												rowdbClickHandler:function(rowData){
													var eqId = rowData.id;
													NetstarUI.resultTable.cloudInstrument.registerInstrument(eqId);
													NetstarComponent.dialog['parallelNumberDiv'].vueConfig.close();

												},
												//title:'',//表格标题
												isOpenQuery:true,//是否开启查询
   												isOpenAdvanceQuery:true,//是否开启高级查询
											}
										};
										NetStarGrid.init(gridConfig);

										var gridId = data.config.bodyId;
										var btnJson = {
											id:data.config.footerIdGroup,
											//pageId:id,
											btns:[
												{
													text:'获取数据',
													handler:function(){
														var selectData = NetStarGrid.getSelectedData(gridId);
														var eqId = selectData[0].id;
														NetstarUI.resultTable.cloudInstrument.registerInstrument(eqId);
														NetstarComponent.dialog['parallelNumberDiv'].vueConfig.close();
													}
												},{
													text:'关闭',
													handler:function(){
														NetstarComponent.dialog['parallelNumberDiv'].vueConfig.close();
													}
												}
											]
										};
										vueButtonComponent.init(btnJson);
									}
								};
								NetstarComponent.dialogComponent.init(dialogCommon);
								//设置矩阵样条件弹框 end ------
							}
						},
						functionConfig:{
							englishName:'equipmentDeviceBases'
						}
					}
					);
				  	NetstarTemplate.commonFunc.btns.initBtns(componentData,_config);
				  break;
			}
		}
		if(!$.isEmptyObject(_config.btnKeyFieldJson)){
			for(var btnId in _config.btnKeyFieldJson){	
				if(_config.btnKeyFieldJson[btnId].inlineBtns.length > 0){
					vueButtonComponent.init({
						id:_config.btnKeyFieldJson[btnId].id,
						btns:_config.btnKeyFieldJson[btnId].inlineBtns,
						package:_config.package,
					});
				}
			}
		}
		
		if(!$.isEmptyObject(_config.footerForm)){
			setTimeout(function(){
				footerFormByInit(_config.footerForm,_config);
			},500)
		}
	}

	function footerFormByInit(_footerForm,_config){
		var footerId = 'footer-'+_config.id;
		function confirmQueryHandler(ev){
			var $this =$(this);
			var saveAjax = $.extend(true,{},_footerForm.saveAjax);
			var ajaxData = NetstarComponent.getValues(footerId);
			if(!$.isEmptyObject(saveAjax.data)){
				var rootValue = getMainListSelectedData(_config);
				var outAjaxData = NetStarUtils.getFormatParameterJSON(saveAjax.data,{root:rootValue});
				$.each(outAjaxData,function(k,v){
					ajaxData[k] = v;
				})
			}
			saveAjax.data = ajaxData;
			NetStarUtils.ajax(saveAjax,function(res){
				if(res.success){
					console.log(res);
					$this.closest('.suspension-edit-box').addClass('expand');
					var rootValue = getMainListSelectedData(_config);
					rootValue.reportRemark = res.data.reportRemark;
					NetStarGrid.dataManager.editRow(rootValue,_config.mainComponent.id);
				}else{
					var msg = res.msg ? res.msg : '操作失败';
					nsalert(msg,'error');
				}
			},true);
		}
		var rootValue = getMainListSelectedData(_config);
		var formFieldArr = $.extend(true,[],_footerForm.fields);
		var formReaonly = typeof(_footerForm.readonly)=='boolean' ? _footerForm.readonly : false;
		for(var f=0; f<formFieldArr.length; f++){
			formFieldArr[f].readonly = formReaonly;
		}
		var formConfig = {
			id: footerId,
			formStyle: 'pt-form-normal',
			//plusClass: 'pt-custom-query',
			isSetMore: false,
			form: formFieldArr,
			completeHandler: function () {
				if(formReaonly == false){
					var btnHtml = '<div class="pt-btn-group pt-btn-group-compact text-right">' +
									'<button type="button" class="pt-btn pt-btn-default" nstype="refresh" containerid="' + footerId + '">保存</button>' +
								'</div>';
					$('#'+footerId).append(btnHtml);
					$('button[containerid="' + footerId + '"]').off('click',confirmQueryHandler);
					$('button[containerid="' + footerId + '"]').on('click',confirmQueryHandler);
				}
			}
		};
		NetstarComponent.formComponent.show(formConfig, rootValue);
		
		$('#expand-footer-'+_config.id).on('click',function(ev){
			$(this).closest('.suspension-edit-box').toggleClass('expand');
		})
	}

	//初始化容器面板
	function initContainer(_config){
		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
		}

		var footerHtml = '';
		if(!$.isEmptyObject(_config.params)){
			if(!$.isEmptyObject(_config.params.footerForm)){
				_config.footerForm = _config.params.footerForm;
				footerHtml = '<div class="suspension-edit-box">' +
								'<div id="footer-'+_config.id+'" class="expand-modal-footer">' +
								//'<div class="pt-form  pt-form-vertical pt-form-inline">' +
									//'<div class="pt-form-body" id="footer-'+_config.id+'">' +
								
									//'</div>' +
								'</div>' +
								'<div class="back-to-left">' +
									'<a href="javascript:void(0);" id="expand-footer-'+_config.id+'"><i class="icon-arrow-left-o"></i></a>' +
								'</div>' +
							'</div>';
			}
		}

		var html = '<div class="pt-main limsresultinput '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
                     +'<div class="pt-container">'
						+'<div class="pt-main-row">'
							+'<div class="pt-main-col pt-col-auto" ns-position="left">'
								
							+'</div>'
							+'<div class="pt-main-col" ns-position="right">'
								
							+'</div>'
						+'</div>'
					+'</div>'
				  +'</div>';
	 	$container.prepend(html);//输出面板
		var btnsHtml = '';//按钮输出
		var mainBtnHtml = '';//主表按钮
		var resultinputWidth = 0;
		var resultinputHeight = _config.commonPanelHeight;
		var resultInputPanelHeight = 0;
		if($('#netstar-main-page').length >0){
			//resultinputWidth = $(window).outerWidth()-$('#netstar-main-page').offset().left - 350;
			resultInputPanelHeight =  $(window).outerWidth()-$('#netstar-main-page').offset().left-$('div[ns-position="left"]').outerWidth()-100;
		}else{
			//resultinputWidth = $(window).outerWidth()-350;
		}
		for(var componentsI=0; componentsI<_config.components.length; componentsI++){
			var componentData = _config.components[componentsI];
			componentData.templateId = _config.id;
			componentData.package = _config.package;
			var operatorObject = componentData.operatorObject ? componentData.operatorObject : '';
			switch(componentData.type){
				case 'btns':
					if(operatorObject == '' || operatorObject=='root'){
						mainBtnHtml = '<div class="nav-form main-btns" id="'+componentData.id+'"></div>';
						_config.mainBtnComponent = componentData;
					}else{
						btnsHtml = '<div class="nav-form" id="'+componentData.id+'"></div>';
					}
					break;
				case 'list':
				case 'blockList':
					if(componentData.parent == 'root'){
						//主表
						componentData.isAjax = true;
						componentData.level = 1;
						componentData.params = {
							selectedHandler:mainGridSelectedHandler,
							ajaxSuccessHandler:mainGridAjaxSuccessHandler,
							drawHandler:mainGridDrawHandler,
						};
						if(componentData.type == 'blockList'){
							var defaultParams = {
								isPage:false,
								pageLengthDefault:10000000,
								height:_config.commonPanelHeight,
								completeHandler:mainGridCompleteHandler,
								query:NetStarUtils.getListQueryData(componentData.field,{id:'query-'+componentData.id,value:''}),
							};
							NetStarUtils.setDefaultValues(componentData.params,defaultParams);
						}else{
							var defaultParams = {
								height:_config.commonPanelHeight,
							};
							NetStarUtils.setDefaultValues(componentData.params,defaultParams);
						}
						_config.mainComponent = componentData;
					}else{
						if(componentData.keyField){
							componentData.level = 2;
							_config.levelConfig[2] = componentData;
						}
					}
					break;
				case 'resultinput':
					componentData.level = 3;
					_config.levelConfig[3] = componentData;
					break;
			}
			if(typeof(_config.componentsConfig[componentData.type])=='undefined'){
				_config.componentsConfig[componentData.type] = {};
			}
			_config.componentsConfig[componentData.type][componentData.id] = componentData;
		}
		var positionLeftHtml = '';
		var positionRightHtml = '';
		switch(_config.mode){
			case 'blockgrid':
				positionLeftHtml =  '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.mainComponent.id+'" ns-level="1">'
										+'</div>'
									+'</div>'
									+'<div class="pt-panel">'
											+'<div class="pt-panel-container">'
												+'<div class="pt-panel-row">'
													+'<div class="pt-panel-col">'
														+'<div class="pt-panel">'
																+'<div class="pt-panel-container">'
																	+'<div class="pt-panel-row">'
																		+'<div class="pt-panel-col">'
																			+mainBtnHtml
																		+'</div>'
																	+'</div>'
																+'</div>'
														+'</div>'
													+'</div>'
												+'</div>'
											+'</div>'
									+'</div>';
				positionRightHtml = '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.levelConfig[2].id+'" ns-level="2">'
										+'</div>'
										+'<div class="pt-panel-container" id="'+_config.levelConfig[3].id+'" ns-level="3">'
										+'</div>'
										+'<div class="pt-panel">'
												+'<div class="pt-panel-container">'
													+'<div class="pt-panel-row">'
														+'<div class="pt-panel-col">'
															+btnsHtml
														+'</div>'
													+'</div>'
												+'</div>'
										+'</div>'
									+'</div>'
				break;
			case 'listgrid':	
				positionLeftHtml = '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.mainComponent.id+'" ns-level="1" style="width:350px;"></div>'
									+'</div>'
									//+'<div class="pt-panel">'
										//+'<div class="pt-panel-container" id="'+_config.levelConfig[2].id+'" ns-level="2" style="width:350px;"></div>'
									//+'</div>';'+_config.levelConfig[3].id+'resultTableContainer
				positionRightHtml = '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.levelConfig[3].id+'" ns-level="3" style="height:'+resultinputHeight+'px;"></div>'
									+'</div>';
				var btnHtml = '<div class="pt-main-row">'
									+'<div class="pt-main-col">'
										+'<div class="pt-panel">'
											+'<div class="pt-panel-container">'
												+'<div class="pt-panel-row">'
													+'<div class="pt-panel-col">'
														+'<div class="nav-form" id="'+_config.mainBtnComponent.id+'"></div>'
													+'</div>'
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>';
				$('#'+_config.id).children('.pt-container').prepend(btnHtml);
				break;
		}
		var $positionLeft = $('#'+_config.id+' div[ns-position="left"]');
		var $positionRight = $('#'+_config.id+' div[ns-position="right"]');
		$positionLeft.html(positionLeftHtml);
		$positionRight.html(positionRightHtml+footerHtml);

		_config.expandId = 'expand-'+_config.id;
		$positionLeft.prepend('<div class="result-control"><a href="javascript:void(0);" id="'+_config.expandId+'"></a></div>');

		$('#'+_config.expandId).on('click',function(ev){
			$(this).closest('div[ns-position="left"]').toggleClass('collapsed');
		})

	}
	//设置默认值
	function setDefault(_config){
		var defaultConfig = {
			levelConfig:{},//等级数据存放
			mode:'listGrid',  //listGrid ,treeGrid,blockGrid
			//commonPanelHeight:$(window).outerHeight()-(NetstarTopValues.topNav.height+54),
		};
		NetStarUtils.setDefaultValues(_config,defaultConfig);
		var commonHeight = 0;
		for(var attrName in NetstarTopValues){
			//标签35+按钮的34
			commonHeight += NetstarTopValues[attrName].height;
		}
		_config.commonPanelHeight = $(window).outerHeight()-20-commonHeight;//减去上下边距的20减去标签的高度减去按钮的高度
	
	}
	function init(_config){
		//如果开启了debugerMode
		var isValid = true;
		if(debugerMode){
		   //验证配置参数是否合法
		   isValid = NetstarTemplate.commonFunc.validateByConfig(_config);
		}
		if(!isValid){
		   nsalert('配置文件验证失败', 'error');
		   console.error('配置文件验证失败');
		   console.error(_config);
		   return false;
		}
		NetstarTemplate.commonFunc.setTemplateParamsByConfig(_config);//存储模板配置参数
		NetstarTemplate.commonFunc.setDefault(_config);//设置默认值参数
		setDefault(_config);
		initContainer(_config);
		initComponent(_config);
	}
	function refreshByConfig(_config){
		initComponent(_config);
	}
	return{
		init:											init,								
		VERSION:										'0.0.1',						//版本号
		dialogBeforeHandler:							dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:								ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:								ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:								loadPageHandler,				//弹框初始化加载方法
		closePageHandler:								closePageHandler,				//弹框关闭方法
		getMainListSelectedData:						getMainListSelectedData,		//获取主表选中行数据
		getDetailsSelectedData:							getDetailsSelectedData,			//获取子表数据选中行数据
		getWholeData:									getWholeData,					//获取整体参数
		refreshByConfig:								refreshByConfig,
		gridSelectedHandler:							function(){}
	}
})(jQuery)
/******************** 表格模板 end ***********************/