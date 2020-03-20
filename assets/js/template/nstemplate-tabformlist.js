/****
***表单表格模板包含form，table,button(导航上显示的按钮)
****
********/
/******************** tab form list模板 start ***********************/
nsTemplate.templates.tabFormList = (function(){
	function templateInit(){
		nsTemplate.templates.tabFormList.data = {};  
		/* 保存在该对象上的数据分为四个：
		 * config(运行时参数)，
		 * original（原始配置参数）
		 */
	}
	var config = {};
	var templateData = {};
	var currentDataObject = {
		objectState:NSSAVEDATAFLAG.NULL,//默认状态是不操作
	};//所有业务对象 保存类型为object
	var tableParameter = {};  //表格配置参数	
	var tabListData = {};  //存放tab数据
	var templateURL = '';
	//弹框调用前置方法
	function dialogBeforeHandler($btn){
		/*
			*$btn 行内按钮和外部按钮
			    *外部按钮是个dom对象元素
			    *行内按钮是object对象（应用在table行按钮）
		*/
		var data = $btn;
		var isOuterBtn = false;//是否外部按钮
		var currentOperator = '';
		var idField = config.form.idField;
		var keyField = config.form.keyField;
		if($btn[0]){
			//外部按钮
			isOuterBtn = true;
		}
		data.containerFormJson = {};
		var formId;
		var allParamData = {};//如果是自定义整体传参 mainList mainForm mainVo childList childForm
		if(isOuterBtn){
			currentOperator = 'main';
			var navId = $btn.closest('.nav-form').attr('id');
			formId = navId.substring(0,navId.lastIndexOf('-'))+'-customerform';
		}else{
			//行内按钮
			currentOperator = 'child';
			var tableObj = tableParameter[$btn.tableId];
			idField = tableObj.primaryIdField;
			keyField = tableObj.aliasField;
			formId = data.tableId.substring(data.tableId.indexOf('-')+1,data.tableId.length)+'-customerform';
			//当前点击的是table表格行内按钮则给当前行添加选中标记
			if(!$.isArray(currentDataObject[keyField])){
				currentDataObject[keyField] = [];
			}
			for(var tableI=0; tableI<currentDataObject[keyField].length; tableI++){
				if(currentDataObject[keyField][tableI][idField] == data.rowData[idField]){
					currentDataObject[keyField][tableI].objectCheckState = 1;
				}
			}
		}
		if($('#'+formId).length > 0){
			//存在form
			data.containerFormJson = nsTemplate.getChargeDataByForm(formId);
		}
		data.btnOptionsConfig = {
			currentTable:currentOperator,//当前操作是主表还是附表
			isOuterBtn:isOuterBtn,//是否是外部按钮
			descritute:{keyField:keyField,idField:idField}
		}
		data.value = currentDataObject;

		//sjj20181029  ajaxDataParamSource
		if(typeof(data.controllerObj.ajaxDataParamSource)=='string'){
			if(data.controllerObj.ajaxDataParamSource == 'all'){
				allParamData = {
					mainList:currentDataObject,
					mainVo:currentDataObject,
					mainForm:data.containerFormJson,
				};
				data.value = allParamData;
			}
		}
		return data;
	}
	//弹框ajax保存前置方法
	function ajaxBeforeHandler(handlerObj){
		handlerObj.config = config;
		if($.isEmptyObject(handlerObj.dialogBeforeConfig)){
			//弹出框定义值为空表示此操作不是通过dialog和confirm弹出的这时候需要传送值
			handlerObj.dialogBeforeConfig = {
				value:currentDataObject
			}
		}
		handlerObj.ajaxConfigOptions = {
			idField:config.form.idField,
			keyField:config.form.keyField,
			pageParam:config.pageParam,
			parentObj:config.parentObj
		};
		return handlerObj;
	}
	//弹框ajax保存后置方法
	function ajaxAfterHandler(data){
		for(var value in data){
			if(typeof(data[value])=='object'){
				if($.isArray(data[value])){
					data[value] = nsTemplate.getDataByObjectState(data[value]);
				}else{
					delete data[value].objectCheckState;
					delete data[value].objectState;
				}
			}
		}
		nsTemplate.templates.tabFormList.refreshByAjaxResData(data);
		/*if(typeof(data)=='undefined'){data = {};}
		currentDataObject = data;
		for(var data in currentDataObject){
			if($.isArray(currentDataObject[data])){
				currentDataObject[data] = nsTemplate.getDataByObjectState(currentDataObject[data]);
			}
		}*/
		//changeTabList(currentActiveTab);//当前活动tab数据
		//changeTabTitle(currentActiveTab);
	}
	//弹框初始化加载界面
	function loadPageHandler(data){
		/*
			*$btn 行内按钮和外部按钮
			    *外部按钮是个dom对象元素
			    *行内按钮是object对象（应用在table行按钮）
		*/
		var data = $btn;
		var isOuterBtn = false;//是否外部按钮
		if($btn[0]){
			//外部按钮
			isOuterBtn = true;
		}
		var tableId = '';
		var formId = '';
		if(isOuterBtn){
			var navId = $btn.closest('.nav-form').attr('id');
			var containerId = navId.substring(0,navId.lastIndexOf('-'));
			tableId = 'table-'+containerId;
			formId = 'form-'+containerId;
		}else{
			tableId = data.tableId;
		}
		return data;
	}
	//关闭弹框界面
	function closePageHandler($btn){
		/*
			*$btn 行内按钮和外部按钮
			    *外部按钮是个dom对象元素
			    *行内按钮是object对象（应用在table行按钮）
		*/
		var data = $btn;
		var isOuterBtn = false;//是否外部按钮
		var templateId = '';//模板id
		if($btn[0]){
			//外部按钮
			isOuterBtn = true;
		}
		if(isOuterBtn){
			var layoutId = $btn.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.tabFormList.data[layoutId].config;
		}else{
			var layoutId = $btn.obj.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.tabFormList.data[layoutId].config;
		}
		if(config.isReadAjax){
			refreshInitAjaxData();
		}
	}
	var optionConfig = {
		dialogBeforeHandler:dialogBeforeHandler,
		ajaxBeforeHandler:ajaxBeforeHandler,
		ajaxAfterHandler:ajaxAfterHandler,
		loadPageHandler:loadPageHandler,
		closePageHandler:closePageHandler
	}
	//初始化方法
	function init(_config){
		config = _config;
		tabListData = {};
		//第一次执行初始化模板
		if(typeof(nsTemplate.templates.tabFormList.data)=='undefined'){
			templateInit();
		}
		//记录config
		nsTemplate.templates.tabFormList.data[config.id] = {
			original:$.extend(true,{},config),
			config:config
		}
		templateData = nsTemplate.templates.tabFormList.data[config.id];
		//验证
		function configValidate(){
			var isValid = true;
			var validArr = 
			[
				['form','object',true],						//form表单的配置
				['tab','array',true],						//tab列表的配置
				['nav','object'],							//导航按钮的配置
			];
			isValid = nsDebuger.validOptions(validArr,config);
			if(isValid == false){return false;}
			isValid = nsTemplate.validConfigByForm(config.form);
			if(isValid == false){return false;}
			return isValid;
		}
		if(debugerMode){
			if(!configValidate()){
		 		return false;
		 	}
		}

		var templateTabFormListObj = eval(config.package + '={}'); //包名转换

		var customerComponentObj = {};//form的自定义组件

		var newFormFieldArray = [];//form表单数组值
		var formMainIdObject = {
			id:config.form.idField,
			dataSrc:config.form.keyField
		};//存放form表单主id和所在索引下标
		var tabListHtml = '';	//list html输出

		var currentActiveTab = 'tab-0';
		var $liList;
		//设置默认值
		function setDefault(){
			config = nsTemplate.setDefaultByTemplate(config);//默认值设置
			//layout的默认配置参数
			var layoutConfig = {
				navId:									'nav',
				tableId:								'table',
				formId:									'form',
				fullFormId:								config.id+'-form',
				fullTabId:								config.id+'-tabs',
				fullTitleId:							config.id+'-templateTitle',
				navJson:								'navJson',
				tableJson:								'tableJson',
				formJson:								'formJson',
				tableContainerJson:						'tableContainerJson'
			}
			nsVals.setDefaultValues(config,layoutConfig);
			config.form = nsTemplate.setDefaultByForm(config.form,optionConfig);
			config.isReadAjax = true;//默认支持读取ajax
			if($.isEmptyObject(config.getValueAjax)){
				//如果没有给默认读值的ajax
				config.isReadAjax = false;
			}
		}
		function formContainerAddHandler(){}
		function formContainerSaveHandler(){}
		function formContainerEditHandler(){}
		function formContainerEditSaveHandler(){}
		function formContainerDelHandler(){}
		function formContainerConfirmDelHandler(){}
		//form字段值处理
		function filterFormFieldData(){
			//form数据
			var formFieldArray = config.form.field;
			newFormFieldArray = $.extend(true,[],formFieldArray);
			if(config.form.title){
				//title不为空
				var titleObject = {
					element:'label',
					label:config.form.title
				}
				newFormFieldArray.splice(0,0,titleObject);//把标题放在第一个
			}
			for(var formI=0; formI<newFormFieldArray.length; formI++){
				newFormFieldArray[formI].commonChangeHandler = formCommonChangeHandler;
			}
			/***********获取主id的字段值和数据来源 start*****************/
			/***********获取主id的字段值和数据来源 end*****************/
			//循环field数组，获取对应的数据源和值对象
			templateTabFormListObj[config.formJson] = {
				isUserControl:			config.form.isUserControl,//是否开启用户自定义配置
				isUserContidion:		config.form.isUserContidion,//是否查看筛选条件
				form:					newFormFieldArray
			};
			var btnArray = $.extend(true,[],config.form.btns);
			btnArray = nsTemplate.getBtnArrayByBtns(btnArray);//得到按钮值
			var formContainerArray = [];
			//如果save存在则添加整体保存按钮
			if(!$.isEmptyObject(config.saveData.save)){
				btnArray.unshift({
					text:config.saveData.save.text,
					handler:getSaveDataAjax
				})
			}
			var isSingleMode = true;
			if(config.form.add){
				var addStr = config.form.add.text ? config.form.add.text : '新增';
				switch(config.form.add.type){
					case 'dialog':
						btnArray.unshift({
							text:addStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerAddHandler
						});
						break;
					case 'component':
						customerComponentObj[config.fullFormId] = {
							containerId:			'container-panel-'+config.id+'-'+config.formId,
							cId:					'control-btn-servicecomponent-'+config.fullFormId,
							data:					config.form.add.serviceComponent.data,
							init:					config.form.add.serviceComponent.init,
							componentType:			config.form.add.serviceComponent.type,
							source:					'form',
							operator:				'add',
						}
						break;
					case 'multi':
						formContainerArray = config.form.add.field;
						if(typeof(config.form.add.isSingleMode)=='boolean'){
							isSingleMode = config.form.add.isSingleMode;
						}
						/*btnArray.unshift({
							text:addStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerSaveHandler
						})*/
						break;
				}
			}
			if(config.form.edit){
				var editStr = config.form.edit.text ? config.form.edit.text : '编辑';
				switch(config.form.edit.type){
					case 'dialog':
						btnArray.unshift({
							text:editStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerEditHandler
						});
						break;
					case 'component':
						customerComponentObj[config.fullFormId] = {
							containerId:			'container-panel-'+config.id+'-'+config.formId,
							cId:					'control-btn-servicecomponent-'+config.fullFormId,
							data:					config.form.edit.serviceComponent.data,
							init:					config.form.edit.serviceComponent.init,
							componentType:			config.form.edit.serviceComponent.type,
							source:					'form',
							operator:				'edit',
						}
						break;
					case 'multi':
						formContainerArray = config.form.edit.field;
						btnArray.unshift({
							text:editStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerEditSaveHandler
						})
						break;
				}
			}
			//delete
			if(config.form.delete){
				var delStr = config.form.delete.text ? config.form.delete.text : '删除';
				switch(config.form.delete.type){
					case 'dialog':
						btnArray.unshift({
							text:delStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerDelHandler
						});
						break;
					case 'confirm':
						btnArray.unshift({
							text:delStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerConfirmDelHandler
						});
						break;
				}
			}
			templateTabFormListObj['formContainer'] = {
				btns:btnArray,
				isSingleMode:isSingleMode
			}
			if(formContainerArray.length>0){
				templateTabFormListObj['formContainer'].forms = formContainerArray;
			}
		}
		//list列表
		function filterListData(){
			var tabHtml = '';
			var panelHtml = '';
			for(var tabI=0; tabI<config.tab.length; tabI++){
				var tabId = 'tab-'+tabI;
				tabListData[tabId] = [];
				var listData = config.tab[tabI];
				for(var listI=0; listI<listData.length; listI++){
					//是否定义了当前活动tab
					var isActive = typeof(listData[listI].isActive)=='boolean' ? listData[listI].isActive : false;
					if(isActive){currentActiveTab = tabId;}
					//判断当前类型
					var panelId = tabId+'-'+listI+'-'+listData[listI].type;
					var containerJson = config.tableContainerJson+tabI+listI;
					var tableId = 'table-'+config.id+'-'+panelId;
					var panelClassStr = 'variablelist '+tabId;
					switch(listData[listI].type){
						case 'table':
						case 'treetable':
						case 'blocktable':
							//存放table参数
							listData[listI] = nsTemplate.setDefalutByTable(listData[listI],optionConfig);
							tableParameter[tableId] = {
								tableId:tableId,
								primaryIdField:listData[listI].idField,
								flagField:listData[listI].flagField,
								aliasField:typeof(listData[listI].keyField)=='string'?listData[listI].keyField:listData[listI].field[0].mindjetVOName,
								tabIndex:tabI
							}
							currentDataObject[tableParameter[tableId].aliasField] = [];
							var displayMode = 'table';
							if(listData[listI].type === 'treetable'){
								displayMode = 'tree'; 
							}else if(listData[listI].type === 'blocktable'){
								displayMode = 'block';
							}
							displayMode = listData[listI].params.displayMode;
							function tableData(listData){
								var columnFieldArray = $.extend(true,[],listData.field);
								for(var colFieldI=0; colFieldI<columnFieldArray.length; colFieldI++){
									if(typeof(columnFieldArray[colFieldI].width)!='number'){
										columnFieldArray[colFieldI].width = 120;
									}
								}
								var tableConfig = {
									columns:columnFieldArray,
									ui:{
										pageLengthMenu:					5, 			//可选页面数  auto是自动计算  all是全部
										isSingleSelect:					true,
										displayMode:					displayMode,
									}
								}
								if(displayMode === 'tree'){
									tableConfig.ui.tree = listData.ajax;
								}
								nsTemplate.setTableConfig(tableConfig);
								tableConfig.data.tableID = tableId;
								tabListData[tabId].push({
									id:config.id+'-'+panelId,
									type:'table',
									index:tabI,
									subIndex:listI,
									data:tableConfig.data,
									columns:tableConfig.columns,
									ui:tableConfig.ui
								});
								var tableRowBtns = $.extend(true,[],listData.tableRowBtns);
								tableRowBtns = nsTemplate.getBtnArrayByBtns(tableRowBtns);//得到按钮值
								if(listData.edit){
									//类型是否是弹框
									var editType = typeof(listData.edit.type)=='string'?listData.edit.type:'dialog';
									var editStr = listData.edit.text ? listData.edit.text : '编辑';
									switch(editType){
										case 'dialog':
											tableRowBtns.push({
												text:editStr,
												isReturn:true,
												handler:customerTableEditBtnHandler
											});
											tableParameter[tableId].editTitle = listData.edit.title;
											tableParameter[tableId].editField = listData.edit.field;
											tableParameter[tableId].editBtn = listData.edit;
											break;
									}
								}
								//如果delete存在table行添加删除操作按钮
								if(listData.delete){
									var delType = listData.delete.type;
									var delStr = listData.delete.text ? listData.delete.text : '删除';
									switch(delType){
										case 'confirm':
											tableRowBtns.push({
												text:delStr,
												isReturn:true,
												handler:customerTableDelBtnHandler
											});
											tableParameter[tableId].delField = listData.delete.title;
											break;
										case 'dialog':
											tableRowBtns.push({
												text:delStr,
												isReturn:true,
												handler:customerTableDelDialogBtnHandler
											});
											tableParameter[tableId].delTitle = listData.delete.title;
											tableParameter[tableId].delField = listData.delete.field;
											break;
									}
								}
								function tableRowsBtnData(){
									/*var columnBtnArr =  nsTemplate.runObjColumnBtnHandler(tableRowBtns,tableRowBtnHandler);
									var columnBtns = columnBtnArr[0];
									tableParameter[tableId].tableRowBtnHandler = columnBtnArr[1];*/
									var rowBtnsArray = [];
									for(var rowBtnI=0; rowBtnI<tableRowBtns.length; rowBtnI++){
										var btns = $.extend(true,{},tableRowBtns[rowBtnI]);
										var btnJson = {};
										btnJson[btns.text] = btns.handler;
										rowBtnsArray.push(btnJson);
									}
									var btnWidth = tableRowBtns.length * 30 + 10;
									var customerBtnJson = {
										field:'nsFieldButton',
										title: '操作',
										width:btnWidth,
										tabPosition:'after',
										formatHandler: {
											type: 'button',
											data: {
												subdata:rowBtnsArray
											}
										}
									};
									if(typeof(listData.dataReturnbtns)=='function'){
										customerBtnJson.formatHandler.data.dataReturn = listData.dataReturnbtns;
									}
									//如果最后一个是按钮删除重新赋值目的为了防止重复多次添加操作
									for(var columnI=0; columnI<tableConfig.columns.length; columnI++){
										if(tableConfig.columns[columnI].field == 'nsFieldButton'){
											tableConfig.columns.splice(columnI,1);
										}
									}
									tableConfig.columns.push(customerBtnJson);
								}
								if(tableRowBtns.length > 0){
									tableRowsBtnData();//行配置列按钮事件
								}
							}
							tableData(listData[listI]);
							//存在自定义的uiconfig配置
							if(typeof(listData[listI].ui)=='object'){
								for(var ui in listData[listI].ui){
									tabListData[tabId][listI].ui[ui] = listData[listI].ui[ui];
								}
							}
							var containerBtnArr = $.extend(true,[],listData[listI].btns);
							containerBtnArr = nsTemplate.getBtnArrayByBtns(containerBtnArr);//得到按钮值 
							templateTabFormListObj[containerJson] = {};
							//判断当前定义的类型 add,edit,delete
							if(listData[listI].add){
								var addStr = listData[listI].add.text ? listData[listI].add.text : '新增';
								switch(listData[listI].add.type){
									case 'component':
										//存在自定义组件
										if(typeof(listData[listI].add.serviceComponent.init)=='function'){
											panelClassStr +=' '+listData[listI].add.serviceComponent.type;
											//是个object并且有数据值存在
											var customComponentObj = {
												pageConfig:{
													containerId:			'container-panel-'+config.id+'-'+panelId,
													tableID:				panelId,
													source:					listData[listI].add.type,
													type:					listData[listI].add.serviceComponent.type,
													positon:				listI,
													operator:				'add',//默认操作是添加
												},
												otherConfig:{
													containerId:			'container-panel-'+config.id+'-'+panelId,//要填充的容器面板id
													cId:					'control-btn-servicecomponent-'+'tabs-tab'+tabI,//生成的元素id
													init:					listData[listI].add.serviceComponent.init,
													data:					listData[listI].add.serviceComponent.data,
													config:					config,
													tableParameter:			tableParameter
												}
											}
											tabListData[tabId][listI].customComponentObj = customComponentObj;
										}
										break;
									case 'multi':
										/*containerBtnArr.push({
											text:addStr,
											isReturn:true,
											handler:tableBtnAddAliasHanlder
										});*/
										templateTabFormListObj[containerJson] = {
											//formSize:'compactmode',//form size设置
											//formType:'mutli',//mutli
											btns:containerBtnArr,
											forms:$.extend(true,[],listData[listI].add.field),
											isSingleMode:typeof(listData[listI].add.isSingleMode)=='boolean'?listData[listI].add.isSingleMode:true
										}
										break;
									case 'dialog':
										containerBtnArr.push({
											text:addStr,
											isReturn:true,
											handler:customerTableAddBtnHanlder
										});
										tableParameter[tableId].addTitle = listData[listI].add.title;
										tableParameter[tableId].addField = listData[listI].add.field;
										tableParameter[tableId].addBtn = listData[listI].add;
										break;
								}
							}
							if(listData[listI].multiAdd){
								switch(listData[listI].multiAdd.type){
									case 'component':
										//存在自定义组件
										if(typeof(listData[listI].multiAdd.serviceComponent.init)=='function'){
											panelClassStr +=' '+listData[listI].multiAdd.serviceComponent.type;
											//是个object并且有数据值存在
											var customComponentObj = {
												pageConfig:{
													containerId:			'container-panel-'+config.id+'-'+panelId,
													tableID:				panelId,
													source:					listData[listI].multiAdd.type,
													type:					listData[listI].multiAdd.serviceComponent.type,
													positon:				listI,
													operator:				'multiAdd',//默认操作是添加
												},
												otherConfig:{
													containerId:			'container-panel-'+config.id+'-'+panelId,//要填充的容器面板id
													cId:					'control-btn-servicecomponent-'+'tabs-tab'+tabI,//生成的元素id
													init:					listData[listI].multiAdd.serviceComponent.init,
													data:					listData[listI].multiAdd.serviceComponent.data,
													config:					config,
													tableParameter:			tableParameter
												}
											}
											tabListData[tabId][listI].customComponentObj = customComponentObj;
											tableParameter[tableId].multiAdd = listData[listI].multiAdd;
										}
										break;
								}
							}
							function tableBtnData(){
								var btnGroupArr = nsTemplate.runObjBtnHandler(containerBtnArr,tableLevelBtnHandler,tableLevelTwoBtnHandler);
								containerBtnArr = btnGroupArr[0];
								tableParameter[tableId].tableBtnHandler = btnGroupArr[1];
							}
							if(containerBtnArr.length > 0){
								//tableBtnData();//table表格按钮
								templateTabFormListObj[containerJson].btns = containerBtnArr;
							}
							break;
						case 'form':
							listData[listI] = nsTemplate.setDefaultByForm(listData[listI]);
							var tabFormArray = $.extend(true,[],listData[listI].field);
							for(var formI=0; formI<tabFormArray.length; formI++){
								tabFormArray[formI].commonChangeHandler = tabFormCommonChangeHandler;
							}
							tabListData[tabId].push({
								id:config.id+'-'+panelId,
								type:'form',
								form:tabFormArray,
								keyField:listData[listI].keyField,
							});
							templateTabFormListObj[containerJson] = {};
							break;
					}
					panelHtml += '<panel ns-id="'+panelId+'" ns-options="col:12,class:'+panelClassStr+'" ns-container="'+containerJson+'"></panel>';
				}
				//输出tab
				tabHtml += '<tab ns-id="'+tabId+'" ns-options="title:'+listData[0].title+'"></tab>';
			}
			tabListHtml = '<tabs ns-id="tabs" ns-options="col:12" ns-config="nstabs:tabs">'+tabHtml+'</tabs>'+panelHtml;
			templateTabFormListObj.tabs = {
				defaultTab:currentActiveTab,
				isFixedWidth:true,//是否固定宽度
				changeTabCallback:changeTabCallback
			}
		}
		//读取html页面输出
		function getHtml(){
			var titleHtml = '';
			if(config.isShowTitle){
				//标题设置为显示
				titleHtml = '<panel ns-id="templateTitle"></panel>'; 
			}
			//navHtml = '<nav ns-id="'+config.navId+'" ns-config="'+config.navJson+'" ns-options="border:left,class:nav-form,templates:tabFormList"></nav>';
			var isShowHistoryBtn = config.isShowHistoryBtn;
			var html = '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="templates:tabFormList,isShowHistoryBtn:'+isShowHistoryBtn+'">'
							+titleHtml
							+'<panel ns-id="'+config.formId+'" ns-options="col:12" ns-config="form:'+config.formJson+'" ns-container="formContainer"></panel>'
							+tabListHtml
						+'</layout>';
			return html;
		}
		//刷新默认值
		function refreshInitAjaxData(){
			var pageParamObject = $.extend(true,{},config.pageParam);//界面跳转拿到的值
			var defaultAjax = $.extend(true,{},config.getValueAjax);//读取默认的配置
			var listAjax = nsVals.getAjaxConfig(defaultAjax,{},{idField:config.form.idField,keyField:config.form.keyField,pageParam:pageParamObject,parentObj:config.parentObj});
			nsVals.ajax(listAjax, function(res){
				if(res.success){
					/**
					 * cy20180615 原先的赋值过程
					 * currentDataObject = res[config.getValueAjax.dataSrc];  		//数组对象
					 * currentDataObject.objectState = NSSAVEDATAFLAG.EDIT;
					 * //给当前检索值赋值
					 * var formData = {};
					 * for(var formI=0; formI<newFormFieldArray.length; formI++){
					 * 	formData[newFormFieldArray[formI].id] = currentDataObject[newFormFieldArray[formI].id];
					 * 	switch(newFormFieldArray[formI].type){
					 * 		case 'province-select':
					 *   	case 'provinceSelect':
					 * 		case 'provincelinkSelect':
					 * 			formData[newFormFieldArray[formI].id] = JSON.parse(currentDataObject[newFormFieldArray[formI].id]);
					 * 			break;
					 * 	}
					 * }
					 * nsForm.fillValues(formData,config.fullFormId);
					 * changeTabList(currentActiveTab);//当前活动tab数据
					 **/ 
					refreshByAjaxResData(res[config.getValueAjax.dataSrc]);
					if(config.isHaveUrl){
						initNsFrameAutoSaveData();
					}
				}
			},true)
		}
		// 如果有地址 是topage时 初始化 nsFrame.autoSaveData
		function initNsFrameAutoSaveData(){
			if(typeof(nsFrame.autoSaveData[templateURL])=='undefined'){
				nsFrame.autoSaveData[templateURL] = {};
			}
			// 拆分表单/表格数据分别保存forms/tables中并且以其id作为key值
			// nsFrame.autoSaveData[templateURL].forms = $.extend(true,{},currentDataObject);
			if(typeof(nsFrame.autoSaveData[templateURL].forms)=='undefined'){
				nsFrame.autoSaveData[templateURL].forms = {};
			}
			var formSourceData = {};
			// 从currentDataObject中查询表单数据
			for(var key in currentDataObject){
				if(typeof(currentDataObject[key])!='object' && key!='objectState'){
					formSourceData[key] = currentDataObject[key];
				}
			}
			// 补充没有的字段根据表单字段添加 默认是 ‘’
			var formDataFields = nsTemplate.getChargeDataByForm(config.fullFormId,false);
			for(var fieldKey in formDataFields){
				if(typeof(formSourceData[fieldKey])=='undefined'){
					formSourceData[fieldKey] = '';
				}
			}
			nsFrame.autoSaveData[templateURL].forms[config.fullFormId] = formSourceData;
			if(typeof(nsFrame.autoSaveData[templateURL].tables)=='undefined'){
				nsFrame.autoSaveData[templateURL].tables = {};
			}
			var tabConfigData = config.tab;
			for(var i=0;i<tabConfigData.length;i++){
				var tabConfigObj = tabConfigData[i][0];
				var tabContentObj = tabListData['tab-'+i][0];
				switch(tabConfigObj.type){
					case 'table':
						nsFrame.autoSaveData[templateURL].tables[tabContentObj.data.tableID] = $.extend(true,[],currentDataObject[tabConfigObj.keyField]);
						break;
					case 'form':
						nsFrame.autoSaveData[templateURL].forms[tabContentObj.id] = $.extend(true,{},currentDataObject[tabConfigObj.keyField]);
						break;
				}
			}
			nsFrame.autoSaveData[templateURL].handler = function(){
				getSaveDataAjax(true); // 保存后关闭
				
			};
		}
		//刷新默认值 - 赋值到页面 cy20180615 需要暴露赋值过程到外边
		function refreshByAjaxResData(resData){
			if(typeof(resData)=='undefined'){resData = {};}
			delete resData.objectState;
			//resData 服务器返回的业务对象值
			currentDataObject = resData;  				//数组对象
			//给当前检索值赋值
			var formData = {};
			var editFormFieldArray = $.extend(true,[],newFormFieldArray);
			for(var formI=0; formI<newFormFieldArray.length; formI++){
				editFormFieldArray[formI].value = currentDataObject[newFormFieldArray[formI].id];
				formData[newFormFieldArray[formI].id] = currentDataObject[newFormFieldArray[formI].id];
				// 如果 为undefined 读取默认值 lyw20180621
				if(typeof(formData[newFormFieldArray[formI].id]) == "undefined"){
					var originalValue = nsTemplate.templates.tabFormList.data[config.id].original.form.field[formI].value;
					formData[newFormFieldArray[formI].id] = originalValue;
					editFormFieldArray[formI].value = originalValue;
				}
			}
			for(var data in currentDataObject){
				if($.isArray(currentDataObject[data])){
					currentDataObject[data] = nsTemplate.getDataByObjectState(currentDataObject[data]);
				}
			}
			// 如果resData为空时清空表单，赋初始值为默认值 lyw20180621
			if($.isEmptyObject(resData)){
				nsForm.clearData(config.fullFormId);
			}
			currentDataObject.objectState = NSSAVEDATAFLAG.EDIT;
			//nsForm.fillValues(formData,config.fullFormId);
			nsForm.edit(editFormFieldArray,config.fullFormId);
			changeTabList(currentActiveTab);//当前活动tab数据
			changeTabTitle(currentActiveTab);
		}
		this.refreshByAjaxResData = refreshByAjaxResData;
		//切换tab方法调用事件
		function changeTabCallback(event,data){
			currentActiveTab = data.tabID;
			changeTabList(data.tabID);
			changeTabTitle(data.tabID);
		}
		function changeTabList(tabId){
			var currentListData = $.extend(true,[],tabListData[tabId]);
			var customComponentArr = [];
			for(var dataI=0; dataI<currentListData.length; dataI++){
				var $dom = $('#container-container-panel-'+currentListData[dataI].id);
				var notClassStr = '.'+tabId; 
				$dom.removeClass('hide').siblings('.variablelist').not(notClassStr).addClass('hide');
				switch(currentListData[dataI].type){
					case 'form':
								/*id:config.id+'-'+panelId,
								type:'form',
								form:listData[listI].field*/
						var valueJson = currentDataObject;
						if(typeof(currentDataObject[currentListData[dataI].keyField])=='object'){
							valueJson = currentDataObject[currentListData[dataI].keyField];
						}
						for(var valueI=0; valueI<currentListData[dataI].form.length; valueI++){
							currentListData[dataI].form[valueI].value = valueJson[currentListData[dataI].form[valueI].id];
						}
						nsForm.init(currentListData[dataI]);
						break;
					case 'table':
						var tableObj = $.extend(true,{},currentListData[dataI]);
						var tableId = 'table-'+tableObj.id;
						tableObj.ui.$container = $('#'+tableObj.id);
						tableObj.ui.containerHeight = 0;
						if(nsTable.table[tableId]){
							baseDataTable.destroy(tableId,true);
						}
						if(!$.isArray(currentDataObject[tableParameter[tableId].aliasField])){
							currentDataObject[tableParameter[tableId].aliasField] = [];
						}

						var dataArray = currentDataObject[tableParameter[tableId].aliasField];
						var dataSourceArray = [];
						for(var i=0; i<dataArray.length; i++){
							if(dataArray[i].objectState === NSSAVEDATAFLAG.DELETE){
								//有删除标识
							}else{
								dataSourceArray.push(dataArray[i]);
							}
						}
						tableObj.data.dataSource = dataSourceArray;
						nsList.init(tableObj.data,tableObj.columns,tableObj.ui);
						break;
				}
				//是否存在自定义组件
				if(!$.isEmptyObject(currentListData[dataI].customComponentObj)){
					customComponentArr.push(currentListData[dataI].customComponentObj);
				}
			}
			if(customComponentArr.length > 0){
				serviceComponentInit(customComponentArr);
			}
			//20190116 订阅消息
			nsTemplate.setProcessDataByWorkItemId(config);
		}
		function changeTabTitle(){
			var currentListData = $.extend(true,[],tabListData[currentActiveTab]);
			for(var table in tableParameter){
				var tableId = tableParameter[table].tableId;
				var tableArray = currentDataObject[tableParameter[tableId].aliasField];
				var tabIndex = tableParameter[table].tabIndex;
				if(!$.isArray(tableArray)){
					tableArray = [];
				}
				var tableLength = tableArray.length;
				if(tableArray.length > 0){
					var html = '<span class="tips">'+tableLength+'</span>';
					if(tableLength===0){
						html = '<span class="tips empty">0</span>';
					}	
					var $container = $($liList[tabIndex]);
					$container.children('a').children('.tips').remove();
					$container.children('a').append(html);	
				}
			}
			/*if(currentListData[0].type == 'table'){
				var tableId = 'table-'+currentListData[0].id;
				var displayMode = nsList.data[tableId].uiConfig.displayMode;
				var tableLength = 0;
				if(!$.isArray(currentDataObject[tableParameter[tableId].aliasField])){
					currentDataObject[tableParameter[tableId].aliasField] = [];
				}
				var html = '<span class="tips">'+tableLength+'</span>';
				if(tableLength===0){
					html = '<span class="tips empty">0</span>';
				}	
				var $container = $($liList[currentListData[0].index]);
				$container.children('a').children('.tips').remove();
				$container.children('a').append(html);			
			}*/
		}
		/*********table 按钮相关事件执行 start********************/
		//添加
		function tableBtnAddAliasHanlder(dom){
			var buttonIndex = dom.attr('fid');
			var tableId = dom.closest('.nav-form').attr('id');//按钮容器的id
			tableId = 'table-'+tableId.substring(0,tableId.lastIndexOf('-'));
			var data = tableParameter[tableId];
			var id = data.tableId.substring(data.tableId.indexOf('-')+1,data.tableId.length);
			var formId = id+'-customerform';
			var jsonData = nsTemplate.getChargeDataByForm(formId);
			if(jsonData){
				var rowData = $.extend(true,{},jsonData);
				nsForm.clearData(formId);
				//添加新增标识
				rowData.objectState = NSSAVEDATAFLAG.ADD;
				//添加时间戳
				var timeStamp = new Date().getTime();
				rowData.nsTempTimeStamp = timeStamp;
				nsList.add(data.tableId,rowData);
				changeTabTitle();
			}
		}
		//添加
		function customerTableAddBtnHanlder(dom){
			var buttonIndex = dom.attr('fid');
			var tableId = dom.closest('.nav-form').attr('id');//按钮容器的id
			tableId = 'table-'+tableId.substring(0,tableId.lastIndexOf('-'));
			var data = tableParameter[tableId];
			var addDialogId = "adddialog-"+data.tableId;
			function addDialogTableSaveHandler(){
				var inputData = nsTemplate.getChargeDataByForm(addDialogId);
				if(inputData){
					//添加到表格中的数据
					/*var addRowData = $.extend(true,{},inputData);
					var originalDataSource = baseDataTable.originalConfig[data.tableId].dataConfig.dataSource;
					originalDataSource.unshift(addRowData);
					baseDataTable.refreshByID(data.tableId);*/
					var timeStamp = new Date().getTime();
					inputData.nsTempTimeStamp = timeStamp;
					inputData.objectState = NSSAVEDATAFLAG.ADD;
					currentDataObject[data.aliasField].unshift(inputData);
					baseDataTable.originalConfig[data.tableId].dataConfig.dataSource = currentDataObject[data.aliasField];
					baseDataTable.refreshByID(data.tableId);
					//nsdialog.hide();
				}
			}
			var addFieldArray = nsTemplate.getFormField(data.addField,currentDataObject);
			var textArr = ['新增','保存并新增'];
			if(tableParameter[tableId].addBtn.dialogBtnText){
				textArr = tableParameter[tableId].addBtn.dialogBtnText.split('/');
			}
			var textAddStr = textArr[0];
			var textSaveStr = textArr[1] ? textArr[1] : '保存并新增';
			var size = tableParameter[tableId].addBtn.dialogConfig.size;
			var originalTableConfig = {
				id: 	addDialogId,
				title: 	data.addTitle,
				size: 	size,
				fillbg:false,
				form:addFieldArray,
				btns:[
					{
						text:textAddStr,
						handler:function(){
							addDialogTableSaveHandler();
							nsdialog.hide();
						}
					},{
						text:textSaveStr,
						handler:function(){
							addDialogTableSaveHandler();
							var refreshConfig = $.extend(true,{},originalTableConfig);
							nsdialog.refresh(refreshConfig,{});
						}
					}
				]
			};		
			originalTableConfig.isValidSave = true;
			var tableAddDialog = $.extend(true,{},originalTableConfig);
			nsdialog.initShow(tableAddDialog);
		}


		//编辑
		function customerTableEditBtnHandler(data){
			var editFieldArray = nsTemplate.getFormField(tableParameter[data.tableId].editField,currentDataObject);
			var rowData = data.rowData;
			var editDialogId = 'edit-'+data.tableId+'-dialog';
			var nsMindjetValueField = {};
			function editCommonChangeHandler(runObj){
				if(runObj.config.nsMindjetValueField){
					//如果存在自定义关联字段属性 并且是select
					nsMindjetValueField[runObj.config.nsMindjetValueField] = runObj.text;
				}
			}
			for(var editI=0; editI<editFieldArray.length; editI++){
				editFieldArray[editI].value = rowData[editFieldArray[editI].id];
				editFieldArray[editI].commonChangeHandler = editCommonChangeHandler;
			}
			function editTableRowDialog(){
				//弹框确认保存事件
				function tableRowEditDialogConfirmHandler(data){
					var inputData = nsTemplate.getChargeDataByForm(editDialogId);//获取form数据
					if(inputData===false){return;}//验证不通过直接return
					//inputData = $.extend(true,{},inputData,nsMindjetValueField);
					var $tr = data.obj.parents('tr');
					var cData = $.extend(true,{},data.rowData);
					var rowData = $.extend(true,cData,inputData);
					var idField = tableParameter[data.tableId].primaryIdField;
					var dataSrcField = tableParameter[data.tableId].aliasField;
					if(rowData[idField]){
						rowData.objectState = NSSAVEDATAFLAG.EDIT;//当前操作标识是修改
					}else{
						rowData.objectState = NSSAVEDATAFLAG.ADD;//当前操作标识是添加
					}
					for(var editI=0; editI<currentDataObject[dataSrcField].length; editI++){
						if(currentDataObject[dataSrcField][editI][idField] && rowData[idField]){
							if(currentDataObject[dataSrcField][editI][idField] === rowData[idField]){
								currentDataObject[dataSrcField][editI] = rowData;
							}
						}else{
							if(currentDataObject[dataSrcField][editI].nsTempTimeStamp === rowData.nsTempTimeStamp){
								currentDataObject[dataSrcField][editI] = rowData;
							}
						}
					}
					nsList.rowEdit(data.tableId,inputData,{isUseNotInputData:true, queryMode:'tr', queryValue:$tr});
					nsdialog.hide();//关闭弹框
				}
				var size = tableParameter[data.tableId].editBtn.dialogConfig.size;
				var editTextStr = tableParameter[data.tableId].editBtn.dialogBtnText;
				var editDialog = {
					id: editDialogId,
					title: tableParameter[data.tableId].editTitle,
					size: size,
					form: editFieldArray,
					btns: 
					[
						{
							text: editTextStr,
							handler: function(){
								tableRowEditDialogConfirmHandler(data);
							}
						}
					]
				}
				editDialog.isValidSave = true;
				nsdialog.initShow(editDialog);//弹框调用
			}
			editTableRowDialog();//调用弹框执行
		}
		//删除 dialog
		function customerTableDelDialogBtnHandler(data){
			var delFieldArray = tableParameter[data.tableId].delField;
			var rowData = data.rowData;
			var delDialogId = 'del-'+data.tableId+'-dialog';
			function delDialog(){
				//弹框确认保存事件
				function delConfirmHandler(data){
					var inputData = nsTemplate.getChargeDataByForm(delDialogId);//获取form数据
					if(inputData===false){return;}//验证不通过直接return
					var delRowData = $.extend(true,{},data.rowData);
					var $tr = data.obj.parents('tr');
					var idField = tableParameter[data.tableId].primaryIdField;
					var dataSrcField = tableParameter[data.tableId].aliasField;
					for(var delI=0; delI<currentDataObject[dataSrcField].length; delI++){
						if(delRowData[idField]){
							if(currentDataObject[dataSrcField][delI][idField] === delRowData[idField]){
								currentDataObject[dataSrcField][delI].objectState = NSSAVEDATAFLAG.DELETE;
							}
						}else{
							var currentDelData = $.extend(true,{},currentDataObject[dataSrcField][delI]);
							delete currentDelData.objectState;
							if(isObjectValueEqual(currentDelData,delRowData)){
								delete currentDataObject[dataSrcField].splice(delI,1);
							}
						}
					}
					nsList.rowDelete(data.tableId,delRowData,{queryMode:'tr', queryValue:$tr});
					nsdialog.hide();//关闭弹框
				}
				var delDialog = {
					id: delDialogId,
					title: tableParameter[data.tableId].delTitle,
					size: 'm',
					form: delFieldArray,
					btns: 
					[
						{
							text: '确认',
							handler: function(){
								delConfirmHandler(data);
							}
						}
					]
				}
				delDialog.isValidSave = true;
				nsdialog.initShow(delDialog);//弹框调用
			}
			delDialog();//调用弹框执行
		}
		//删除
		function customerTableDelBtnHandler(data){
			var delText = tableParameter[data.tableId].delField;
			var contentStr = delText;
			contentStr = nsVals.getTextByFieldFlag(contentStr,data.rowData);
			nsConfirm(contentStr,delConfirmHandler,'warning');//弹出删除提示框
			var cData = data;
			function delConfirmHandler(result){
				//删除事件触发
				var data = cData;
				if(result){
					//如果为真则是确认事件
					var delRowData = $.extend(true,{},data.rowData);
					var $tr = data.obj.parents('tr');
					var idField = tableParameter[data.tableId].primaryIdField;
					var dataSrcField = tableParameter[data.tableId].aliasField;
					for(var delI=0; delI<currentDataObject[dataSrcField].length; delI++){
						if(delRowData[idField]){
							if(currentDataObject[dataSrcField][delI][idField] === delRowData[idField]){
								currentDataObject[dataSrcField][delI].objectState = NSSAVEDATAFLAG.DELETE;
							}
						}else{
							var currentDelData = $.extend(true,{},currentDataObject[dataSrcField][delI]);
							delete currentDelData.objectState;
							if(isObjectValueEqual(currentDelData,delRowData)){
								delete currentDataObject[dataSrcField].splice(delI,1);
							}
						}
					}
					nsList.rowDelete(data.tableId,delRowData,{queryMode:'tr', queryValue:$tr});
				}
			}
		}
		function tableRowBtnHandler(data){
			var runHandler = tableParameter[data.tableId].tableRowBtnHandler[data.buttonIndex];
			runHandler.handler(data);
		}
		function tableLevelBtnHandler(dom){
			var buttonIndex = dom.attr('fid');
			var tableId = dom.closest('.nav-form').attr('id');//按钮容器的id
			tableId = 'table-'+tableId.substring(0,tableId.lastIndexOf('-'));
			var runHandler = tableParameter[tableId].tableBtnHandler[buttonIndex];
			runHandler.handler(tableParameter[tableId]);
		}
		function tableLevelTwoBtnHandler(dom){
			var buttonIndex = dom.attr('fid');
			var subIndex = dom.attr('optionid');
			var tableId = dom.closest('.nav-form').attr('id');
			tableId = 'table-'+tableId.substring(0,tableId.lastIndexOf('-'));
			var runHandler = tableParameter[tableId].tableBtnHandler[buttonIndex][subIndex];
			runHandler.handler(tableParameter[tableId]);
		}
		/*********table 按钮相关事件执行 end********************/
		//自定义组件事件执行
		function serviceComponentInit(customArr){	
			//
			function nsQuicktyCompleteHandler(){}
			function commonAddCompleteHanlder(data){
				var customData = tabListData[currentActiveTab][0];
				var containerId = customData.id;
				var rowData = $.extend(true,{},data);
				if($.isArray(customData.operatorData)){
					rowData = $.extend(true,[],data);
				}
				switch(customData.type){
					case 'table':
						var tableId = 'table-'+containerId;
						//可能要添加多个数据
						if($.isArray(rowData)){
							for(var rowI=0; rowI<rowData.length; rowI++){
								rowData[rowI].objectState = NSSAVEDATAFLAG.ADD;
								//添加时间戳
								var timeStamp = new Date().getTime() + '-'+rowI;
								rowData[rowI].nsTempTimeStamp = timeStamp;
								currentDataObject[tableParameter[tableId].aliasField].push(rowData[rowI]);
							}
						}else{
							//添加新增标识
							rowData.objectState = NSSAVEDATAFLAG.ADD;
							//添加时间戳
							var timeStamp = new Date().getTime();
							rowData.nsTempTimeStamp = timeStamp;
							currentDataObject[tableParameter[tableId].aliasField].push(rowData);
						}
						nsList.add(tableId,rowData);
						changeTabTitle();
						break;
					case 'form':
						break;
				}
			}
			function commonMultiAddCompleteHanlder(data){
				var obj = tabListData[currentActiveTab][0];
				var array = $.extend(true,[],data.array);
				var tableId = 'table-'+obj.id;
				var originalDataSource = baseDataTable.originalConfig[tableId].dataConfig.dataSource;
				var chargeField = tableParameter[tableId].multiAdd.chargeField;
				var rowArray = [];
				if(!$.isArray(currentDataObject[tableParameter[tableId].aliasField])){
					currentDataObject[tableParameter[tableId].aliasField] = [];
				}
				function isExistDataByIdField(id){
					//根据id判断是否已经存在于数据中
					var isExist = false;//默认不存在
					for(var idI=0; idI<currentDataObject[tableParameter[tableId].aliasField].length; idI++){
						var existData = currentDataObject[tableParameter[tableId].aliasField][idI];
						if(existData[tableParameter[tableId].primaryIdField] === id){
							//存在
							isExist = true;
							break;//终止循环
						}
					}
					return isExist;
				}
				if(chargeField){
					//存在转字段
					var chargeField = eval('('+chargeField+')');
					for(var dataI=0; dataI<array.length; dataI++){
						var rowData = $.extend(true,{},array[dataI]);
						var rowJson = {};
						for(field in chargeField){
							rowJson[field] = nsVals.getTextByFieldFlag(chargeField[field],rowData);
						}
						rowArray.push(rowJson);
					}
				}else{
					rowArray = array;
				}
				originalDataSource = rowArray;
				for(var arrayI=0; arrayI<rowArray.length; arrayI++){
					var inputData = $.extend(true,{},rowArray[arrayI]);
					//如果存在id，则是通过查询检索出来的数据需要添加删除标识
					//addDelFlag(id);
					//是否已经存在
					var isExist = isExistDataByIdField(inputData[tableParameter[tableId].primaryIdField]);
					if(!isExist){
						//不存在进行添加
						inputData.objectState = NSSAVEDATAFLAG.ADD;
						currentDataObject[tableParameter[tableId].aliasField].push(inputData);
					}
				}
				if(rowArray.length == 0){
					//判断当前列表显示的数据是否存在
					for(var idI=0; idI<currentDataObject[tableParameter[tableId].aliasField].length; idI++){
						var existData = currentDataObject[tableParameter[tableId].aliasField][idI];
						existData.objectState = NSSAVEDATAFLAG.DELETE;
						break;
					}
				}
				//添加数据的时候要走的逻辑
				/*
						*1.多数据添加，其中不存在的数据可能是查询检索出的如果删除需要标记删除标识
						2
					**/
				var nweDataSourceArray = [];
				for(var rowI=0; rowI<originalDataSource.length; rowI++){
					if(originalDataSource[rowI].objectState != -1){
						nweDataSourceArray.push(originalDataSource[rowI]);
					}
				}
				baseDataTable.originalConfig[tableId].dataConfig.dataSource = nweDataSourceArray;
				baseDataTable.refreshByID(tableId);
			}
			for(var customI=0; customI<customArr.length; customI++){
				switch(customArr[customI].pageConfig.operator){
					case 'add':
						customArr[customI].otherConfig.init(customArr[customI].otherConfig,commonAddCompleteHanlder);
						break;
					case 'multiAdd':
						customArr[customI].otherConfig.init(customArr[customI].otherConfig,commonMultiAddCompleteHanlder);
						break;
				}
			}
			//form 的自定义组件
			for(var customer in customerComponentObj){
				customerComponentObj[customer].init(customerComponentObj[customer],nsQuicktyCompleteHandler);
			}
		}
		function tabFormCommonChangeHandler(runObj){
			if(typeof(currentDataObject[tabListData[currentActiveTab][0].keyField])!='object'){
				currentDataObject[tabListData[currentActiveTab][0].keyField] = {};
			}
			currentDataObject[tabListData[currentActiveTab][0].keyField][runObj.id] = runObj.value;
		}
		//form组件改变值回调方法
		function formCommonChangeHandler(runObj){
			currentDataObject[runObj.id] = runObj.value;
		}
		//整体调用保存事件
		function getSaveDataAjax(isClose){
			// isClose : topage页面点击关闭按钮时 保存后关闭topage页面
			isClose = typeof(isClose)=='boolean'?isClose:false;
			var formJson = nsTemplate.getChargeDataByForm(config.fullFormId);//读取form数据并验证
			if(formJson){
				//验证通过
				for(var input in formJson){
					currentDataObject[input] = formJson[input];
				}
				var isContinue = true;
				for(var tab in tabListData){
					var tabArray = tabListData[tab];
					for(var tabI=0; tabI<tabArray.length; tabI++){
						switch(tabArray[tabI].type){
							case 'form':
								if($('#form-'+tabArray[tabI].id).length > 0){
									var formJson = nsTemplate.getChargeDataByForm(tabArray[tabI].id);
									if(!formJson){
										isContinue = false;
										return false;
									}
									currentDataObject[tabArray[tabI].keyField] = formJson;
								}
								break;
						}
					}
				}
				if(!isContinue){return false;}
				var wholeParameterData = $.extend(true,{},currentDataObject);
				var listAjax = nsVals.getAjaxConfig(config.saveData.ajax,wholeParameterData,{idField:config.form.idField});
				listAjax.plusData = {
					dataSrc:config.saveData.ajax.dataSrc,
					isCloseWindow:config.saveData.ajax.isCloseWindow
				}
				nsVals.ajax(listAjax, function(res,ajaxData){
					//保存ajax成功执行之后的操作
					if(res.success){
						nsalert('保存成功');
						var dataSrc = ajaxData.plusData.dataSrc;
						var isCloseWindow = ajaxData.plusData.isCloseWindow; // 配置模板配置的保存按钮 关闭 topage弹框
						//isClose topage弹框关闭按钮 关闭 topage弹框
						if(isCloseWindow || isClose){
							nsFrame.popPageClose(); 
						}else{
							refreshSaveDataAjax(res[dataSrc]);
							if(config.isHaveUrl){
								initNsFrameAutoSaveData();
							}
						}
					}
				},true);
			}
		}
		//刷新保存数据
		function refreshSaveDataAjax(data){
			if(typeof(data)=='undefined'){data = {};}
			delete data.objectState;
			currentDataObject = data;
			currentDataObject.objectState = NSSAVEDATAFLAG.EDIT;
			for(var data in currentDataObject){
				if($.isArray(currentDataObject[data])){
					currentDataObject[data] = nsTemplate.getDataByObjectState(currentDataObject[data]);
				}
			}
			var formArray = $.extend(true,[],newFormFieldArray);
			for(var formI=0; formI<formArray.length; formI++){
				formArray[formI].value = currentDataObject[formArray[formI].id];
			}
			nsForm.edit(formArray,config.fullFormId);
			changeTabList(currentActiveTab);//当前活动tab数据
			changeTabTitle(currentActiveTab);
		}
		function initLayout(){
			nsLayout.init(config.id);
			$('#'+config.fullTitleId).html('<div class="templateTitle">'+config.title+'</div>');
			if(config.isFormHidden == true){
				//隐藏
				$('#'+config.id+'-form').hide();
			}
			//tab中别名list的总数据
			$liList = $('#tabs-'+config.fullTabId+' > li');
			for(var tab in tabListData){
				var tabArr = tabListData[tab];
				var $li = $($liList[tabArr[0].index]);
				if(tabArr[0].type == 'table'){
					var tableId = 'table-'+tabArr[0].id;
					var aliasField = tableParameter[tableId].aliasField;
					var dataLength = 0;
					if($.isArray(currentDataObject[aliasField])){
						dataLength = currentDataObject[aliasField].length;
					}
					var html = '<span class="tips">'+dataLength+'</span>';
					if(dataLength===0){
						html = '<span class="tips empty">0</span>';
					}
					$li.children('a').append(html);
				}
			}
			templateURL = $('#'+config.id).parents().parents().attr('ns-pageurl');
			// 如果有地址说明是topage页面
			if(templateURL){
				config.isHaveUrl = true;
			}else{
				config.isHaveUrl = false;
			}
		}
		//调用执行
		setDefault();//默认值处理
		filterFormFieldData();//form值数据处理
		filterListData();//list数据
		var html = getHtml();//获取html
		//围加根html
		html = nsTemplate.aroundRootHtml(html);
		//将html添加到页面
		nsTemplate.appendHtml(html);
		//创建模板Json对象
		initLayout();
		if(config.isReadAjax){
			refreshInitAjaxData();
		}else{
			currentDataObject = {
				objectState:NSSAVEDATAFLAG.ADD
			}
			changeTabList(currentActiveTab);//当前活动tab数据
			changeTabTitle(currentActiveTab);
		}
		
		// 模板回调 lyw 20181018
		if(typeof(config.completeHandler)=='function'){
			config.completeHandler(config);
		}
	}
	return {
		init:								init,							//模板初始化调用
		dialogBeforeHandler:				dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:					ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:					ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:					loadPageHandler,				//弹框初始化加载方法
		closePageHandler:					closePageHandler,				//弹框关闭方法
	}
})(jQuery)
/********************  tab form list end ***********************/