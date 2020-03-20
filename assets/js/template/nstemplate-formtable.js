/****
***表单表格模板包含form，table,button(导航上显示的按钮)
****
********/
/******************** 表单表格模板 start ***********************/
nsTemplate.templates.formTable = (function(){
	function templateInit(){
		nsTemplate.templates.formTable.data = {};  
		/* 保存在该对象上的数据分为四个：
		 * config(运行时参数)，
		 * original（原始配置参数）
		 */
	}
	var config = {};
	var templateData = {};
	var templateURL = ''; // 如果是toPage页面 toPage页面的地址
	var newFormFieldArray = [];//form表单数组值mindjetFieldPosition
	var formFieldSeverArray = [];//根据field-sever 创建 一个新的form表单mindjetFieldPosition
	var formFieldMoreArray = [];//根据field-more 展示更多mindjetFieldPosition
	var tableJsonObj = {};// 存放table表格的主键id和别名字段
	var tableAliasData = {};//根据下标存放table别名
	var customerComponentObj = {};//自定义组件如快速录入 ，增查删改一体等组件
	var titleArray = [];//标题存放
	var currentDataObject = {
		objectState:NSSAVEDATAFLAG.NULL
	};//所有业务对象 保存类型为object
	//弹框调用前置方法
	function dialogBeforeHandler($btn){
		var data = $btn;
		var isOuterBtn = false;//是否外部按钮
		var currentOperator = '';//当前操作是主表还是附表
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
			var tableObj = tableJsonObj[$btn.tableId];
			idField = tableObj.primaryIdField;
			keyField = tableObj.aliasField;
			formId = data.tableId.substring(data.tableId.indexOf('-')+1,data.tableId.length)+'-customerform';
			//当前点击的是table表格行内按钮则给当前行添加选中标记
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
			descritute:{keyField:keyField,idField:idField},
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
		if(typeof(data)!='object'){data = {};}
		if(data.componentSource == 'dialog'){
			currentDataObject[data.componentKeyField] = data.data;
		}else{
			delete data.objectState;
			currentDataObject = data;
			for(var data in currentDataObject){
				if($.isArray(currentDataObject[data])){
					currentDataObject[data] = nsTemplate.getDataByObjectState(currentDataObject[data]);
				}
			}
			nsForm.fillValues(currentDataObject,config.fullFormId);
			for(var alias in tableAliasData){
				var tableId = tableAliasData[alias].tableId;
				var aliasField = tableAliasData[alias].aliasField;
				currentDataObject[aliasField] = nsTemplate.getDataByObjectState(currentDataObject[aliasField]);
				baseDataTable.originalConfig[tableId].dataConfig.dataSource = currentDataObject[aliasField];
				baseDataTable.refreshByID(tableId);
			}
		}
	}
	//弹框初始化加载界面
	function loadPageHandler(data){
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
			config = nsTemplate.templates.formTable.data[layoutId].config;
		}else{
			var layoutId = $btn.obj.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.formTable.data[layoutId].config;
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
		tableAliasData = {};
		templateURL = ''; // topage页面地址初始化
		newFormFieldArray = [];//form表单数组值mindjetFieldPosition 初始化
		formFieldSeverArray = [];//根据field-sever 创建 一个新的form表单mindjetFieldPosition 初始化
		formFieldMoreArray = [];//根据field-more 展示更多mindjetFieldPosition 初始化
		//第一次执行初始化模板
		if(typeof(nsTemplate.templates.formTable.data)=='undefined'){
			templateInit();
		}
		//清除掉执行过的代码 cy 20180903
		titleArray = [];
		//记录config
		nsTemplate.templates.formTable.data[config.id] = {
			original:$.extend(true,{},config),
			config:config
		}
		templateData = nsTemplate.templates.formTable.data[config.id];
		//验证
		function configValidate(){
			var isValid = true;
			var validArr = 
			[
				['form','object',true],						//form表单的配置
				['table','array',true],						//table表格的配置
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

		var templateFormTableObj = eval(config.package + '={}'); //包名转换
		//设置默认值
		function setDefault(){
			//layout的默认配置参数
			config = nsTemplate.setDefaultByTemplate(config);//默认值设置
			var layoutConfig = {
				navId:									'nav',
				tableId:								'table',
				formId:									'form',
				fullFormId:								config.id+'-'+'form',
				fullTableId:							'table-'+config.id+'-'+'table',
				fullTitleId:							config.id+'-templateTitle',
				navJson:								'navJson',
				tableJson:								'tableJson',
				formJson:								'formJson',
				tableContainerJson:						'tableContainerJson'
			}
			nsVals.setDefaultValues(config,layoutConfig);
			titleArray.push({title:config.title,id:config.fullFormId});
			//如果save存在则添加整体保存按钮
			config.form = nsTemplate.setDefaultByForm(config.form,optionConfig);
			config.isReadAjax = true;//默认支持读取ajax
			if($.isEmptyObject(config.getValueAjax)){
				//如果没有给默认读值的ajax
				config.isReadAjax = false;
			}
			switch(config.mode){
				case 'defaultLineNum':
					config.tablePageLengthMenu = 15;
					break;
			}
		}
		function formContainerAddHandler(){

		}
		function formContainerSaveHandler(){}
		function formContainerEditHandler(){}
		function formContainerEditSaveHandler(){}
		function formContainerDelHandler(){}
		function formContainerConfirmDelHandler(){}
		//form字段值处理
		function filterFormFieldData(){
			//form数据
			var formFieldArray = config.form.field;
			var fieldArray = $.extend(true,[],formFieldArray);
			if(config.form.title){
				//title不为空
				var titleObject = {
					element:'label',
					label:config.form.title
				}
				newFormFieldArray.unshift(titleObject);//把标题放在第一个
			}
			for(var formI=0; formI<fieldArray.length; formI++){
				fieldArray[formI].commonChangeHandler = formCommonChangeHandler;
				switch(fieldArray[formI].mindjetFieldPosition){
					case 'field-sever':
						formFieldSeverArray.push(fieldArray[formI]);
						break;
					case 'field':
						newFormFieldArray.push(fieldArray[formI]);
						break;
					case 'field-more':
						fieldArray[formI].hidden = true;
						formFieldMoreArray.push(fieldArray[formI]);
						newFormFieldArray.push(fieldArray[formI]);
						break;
				}
			}
			/***********获取主id的字段值和数据来源 start*****************/
			/***********获取主id的字段值和数据来源 end*****************/
			templateFormTableObj[config.formJson] = {
				isUserControl:			config.form.isUserControl,//是否开启用户自定义配置
				isUserContidion:		config.form.isUserContidion,//是否查看筛选条件
				form:					newFormFieldArray
			};
			if(formFieldSeverArray.length > 0){
				templateFormTableObj['severform'] = {
					form:formFieldSeverArray
				}
			}
			//form container容器面板
			var btnArray = $.extend(true,[],config.form.btns);
			var formContainerArray = [];
			btnArray = nsTemplate.getBtnArrayByBtns(btnArray);//得到按钮值
			if(config.saveData.save){
				if(config.saveData.save.text){
					btnArray.unshift({
						text:config.saveData.save.text,
						handler:getSaveDataAjax
					})
				}
			}
			var isSingleMode = true;
			if(config.form.add){
				var addText = config.form.add.text ? config.form.add.text : '新增';
				if(typeof(config.form.add.isSingleMode)=='boolean'){isSingleMode = config.form.add.isSingleMode;}
				switch(config.form.add.type){
					case 'dialog':
						btnArray.unshift({
							text:addText,
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
						/*btnArray.unshift({
							text:addText,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerSaveHandler
						})*/
						break;
				}
			}
			if(config.form.edit){
				var editText = config.form.edit.text ? config.form.edit.text : '编辑';
				switch(config.form.edit.type){
					case 'dialog':
						btnArray.unshift({
							text:editText,
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
							text:editText,
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
				var delText = config.form.delete.text ? config.form.delete.text : '删除';
				switch(config.form.delete.type){
					case 'dialog':
						btnArray.unshift({
							text:delText,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerDelHandler
						});
						break;
					case 'confirm':
						btnArray.unshift({
							text:delText,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerConfirmDelHandler
						});
						break;
				}
			}
			templateFormTableObj['formContainer'] = {
				btns:btnArray,
				isSingleMode:isSingleMode
			}
			if(formContainerArray.length>0){
				templateFormTableObj['formContainer'].forms = formContainerArray;
			}
		}
		//table字段值处理
		function filterTableFieldData(){
			for(var tableI=0; tableI<config.table.length; tableI++){
				var tableId = config.fullTableId+tableI;
				var tableJson = config.tableJson + tableI;
				var containerJson = config.tableContainerJson + tableI;
				config.table[tableI] = nsTemplate.setDefalutByTable(config.table[tableI],optionConfig);
				tableAliasData[tableI] = {
					aliasField:config.table[tableI].keyField,
					tableId:tableId,
				};
				tableJsonObj[tableId] = {
					index:tableI,
					tableId:tableId,
					primaryIdField:config.table[tableI].idField,
					flagField:config.table[tableI].flagField,
					aliasField:config.table[tableI].keyField,// config.table[tableI].field[0].mindjetVOName,
					displayMode:config.table[tableI].params.displayMode
				};
				currentDataObject[config.table[tableI].keyField] = [];
				// 表格行数
				var tablePageLengthMenu = 5;
				if(config.tablePageLengthMenu){
					tablePageLengthMenu = config.tablePageLengthMenu;
				}
				var tableConfig = {
					columns:config.table[tableI].field,
					ui:{
						pageLengthMenu:					tablePageLengthMenu, 			//可选页面数  auto是自动计算  all是全部
						isSingleSelect:					true,
						onSingleSelectHandler:			tableRowSelectedHandler,
						onUnsingleSelectHandler:		tableRowCancelSelectedtHandler,
						isUseTabs:						true,							//是否使用tabs状态
						displayMode:					config.table[tableI].params.displayMode
					}
				}

				//如果是手机版且displayMode是block则补充 cy 2018.08.24 start -------
				//支持block模式下的表格设置 selectMode 为none
				if(config.table[tableI].params.selectMode == 'none' && tableConfig.ui.displayMode == 'block'){
					tableConfig.ui.selectMode = 'none'; 
					if(typeof(tableConfig.ui.isSingleSelect)!='undefined'){
						delete tableConfig.ui.isSingleSelect;
					}
					if(typeof(tableConfig.ui.isMulitSelect)!='undefined'){
						delete tableConfig.ui.isMulitSelect;
					}
				}
				//在手机端且显示模式为block状态下 支持clickHandler方法 ------------------------
				if(config.browersystem == 'mobile' && tableConfig.ui.displayMode == 'block'){
					//支持clickHandler
					if(typeof(config.table[tableI].params.clickHandler)=='function'){
						tableConfig.ui.clickHandler = config.table[tableI].params.clickHandler;
					}
				}else{
					//不满足则提示配置错误
					if(debugerMode){
						if(typeof(config.table[tableI].params.clickHandler)=='function'){
							console.warn('params.clickHandler只支持手机模式下的block列表');
						}
					}
				}
				//cy 2018.08.24 end -------------------------------------------------------------

				nsTemplate.setTableConfig(tableConfig,optionConfig);
				var titleId = tableId.substring(tableId.indexOf('-')+1,tableId.length);
				titleArray.push({title:config.table[tableI].title,id:titleId});
				var columnFieldArray = tableConfig.columns;
				for(var colFieldI=0; colFieldI<columnFieldArray.length; colFieldI++){
					if(typeof(columnFieldArray[colFieldI].width)!='number'){
						columnFieldArray[colFieldI].width = 120;
					}
				}
				//存在编辑和删除按钮
				var tableRowBtns = $.extend(true,[],config.table[tableI].tableRowBtns);
				tableRowBtns = nsTemplate.getBtnArrayByBtns(tableRowBtns);//得到按钮值 
				if(config.table[tableI].edit){
					var editType = typeof(config.table[tableI].edit.type)=='string' ? config.table[tableI].edit.type:'dialog';
					var editTextStr = config.table[tableI].edit.text ? config.table[tableI].edit.text : '编辑';
					switch(editType){
						case 'dialog':
							tableRowBtns.push({
								text:editTextStr,
								isReturn:true,
								handler:customerTableEditBtnHandler
							});
							tableJsonObj[tableId].editTitle = config.table[tableI].edit.title;
							tableJsonObj[tableId].editField = config.table[tableI].edit.field;
							tableJsonObj[tableId].editBtn = config.table[tableI].edit;
							break;
					}
				}
				//如果delete存在table行添加删除操作按钮
				if(config.table[tableI].delete){
					var delType = typeof(config.table[tableI].delete.type)=='string'?config.table[tableI].delete.type:'dialog';
					var delTextStr = config.table[tableI].delete.text ? config.table[tableI].delete.text : '删除';
					switch(delType){
						case 'dialog':
							tableRowBtns.push({
								text:delTextStr,
								isReturn:true,
								handler:customerTableDelDialogBtnHandler
							});
							tableJsonObj[tableId].delBtn = config.table[tableI].delete;
							break;
						case 'confirm':
							tableRowBtns.push({
								text:delTextStr,
								isReturn:true,
								handler:customerTableDelBtnHandler
							});
							tableJsonObj[tableId].delField = config.table[tableI].delete.title;
							break;
					}
				}
				function tableRowsBtnData(){
					//转换成表格行内的按钮形式['tianjia':function(){},'shanchu':functionI(){}]
					//如果没有按钮，则此列不用添加 cy 20180905 start--------
					if(tableRowBtns.length == 0){
						return;
					}
					//如果没有按钮，则此列不用添加 cy 20180905 end  --------
					var rowBtnsArray = [];
					for(var rowBtnI=0; rowBtnI<tableRowBtns.length; rowBtnI++){
						var btns = $.extend(true,{},tableRowBtns[rowBtnI]);
						var btnJson = {};
						btnJson[btns.text] = btns.handler;
						rowBtnsArray.push(btnJson);
					}
					var btnWidth = tableRowBtns.length * 30 + 10;
					var customerBtnJson = {
						field:'nsTemplateButton',
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
					if(typeof(config.table[tableI].dataReturnbtns)=='function'){
						customerBtnJson.formatHandler.data.dataReturn = config.table[tableI].dataReturnbtns;
					}
					//如果最后一个是按钮删除重新赋值目的为了防止重复多次添加操作
					for(var columnI=0; columnI<columnFieldArray.length; columnI++){
						if(columnFieldArray[columnI].field == 'nsTemplateButton'){
							columnFieldArray.splice(columnI,1);
						}
					}
					columnFieldArray.push(customerBtnJson);
				}
				tableRowsBtnData();//行配置列按钮事件
				templateFormTableObj[tableJson] = tableConfig;
				//console.log(tableConfig);
				//存在自定义的uiconfig配置
				/*if(typeof(config.table[tableI].ui)=='object'){
					for(var ui in config.table[tableI].ui){
						templateFormTableObj[tableJson].ui[ui] = config.table[tableI].ui[ui];
					}
					tableJsonObj[tableId].displayMode = typeof(config.table[tableI].ui.displayMode)=='string' ? config.table[tableI].ui.displayMode : 'table';
				}*/
				//容器面板
				var containerBtnArr = $.extend(true,[],config.table[tableI].btns);
				containerBtnArr = nsTemplate.getBtnArrayByBtns(containerBtnArr);//得到按钮值 
				//add,edit,delete
				templateFormTableObj[containerJson] = {};
				var contianerFormArray = [];
				var isSingleMode = true;
				if(config.table[tableI].add){
					var addTextStr = config.table[tableI].add.text ? config.table[tableI].add.text : '新增';
					switch(config.table[tableI].add.type){
						case 'multi':
							/*containerBtnArr.push({
								text:addTextStr,
								isReturn:true,
								handler:tableBtnAddAliasHanlder
							});*/
							if(typeof(config.table[tableI].add.isSingleMode)=='boolean'){
								isSingleMode = config.table[tableI].add.isSingleMode;
							}
							contianerFormArray = config.table[tableI].add.field;
							/*templateFormTableObj[containerJson] = {
								title:typeof(config.table[tableI].title)=='string'?config.table[tableI].title:'',
								//formSize:'compactmode',//form size设置
								formType:'single',//mutli
								btns:containerBtnArr,
								forms:config.table[tableI].add.field
							}*/
							break;
						case 'dialog':
							containerBtnArr.push({
								text:addTextStr,
								isReturn:true,
								handler:tableBtnAddDialogHanlder
							});
							tableJsonObj[tableId].addBtn = config.table[tableI].add;
							break;
						case 'component':
							if(typeof(config.table[tableI].add.serviceComponent.init)=='function'){
								//是个object并且有数据值存在
								customerComponentObj[tableId] = {
									containerId:			'container-panel-'+config.id+'-'+config.tableId+tableI,
									tableID:				tableId,
									cId:					'control-btn-servicecomponent-'+tableId,
									data:					config.table[tableI].add.serviceComponent.data,
									init:					config.table[tableI].add.serviceComponent.init,
									componentType:			'add',
									operator:				'add',
								}
							}
							break;
					}
				}
				//批量添加
				if(config.table[tableI].multiAdd){
					switch(config.table[tableI].multiAdd.type){
						case 'component':
							customerComponentObj[tableId] = {
									containerId:		'container-panel-'+config.id+'-'+config.tableId+tableI,
									init:				config.table[tableI].multiAdd.serviceComponent.init,
									operator:			'multiAdd',
									tableID:			tableId,
									optionConfig:		optionConfig
							}
							tableJsonObj[tableId].chargeField = config.table[tableI].multiAdd.chargeField;
							break;
					}
				}
				function tableBtnData(){
					var btnGroupArr = nsTemplate.runObjBtnHandler(containerBtnArr,tableLevelBtnHandler,tableLevelTwoBtnHandler);
					containerBtnArr = btnGroupArr[0];
					tableJsonObj[tableId].tableBtnHandler = btnGroupArr[1];
				}
				//if(containerBtnArr.length > 0){tableBtnData();}//table表格按钮
				templateFormTableObj[containerJson] = {
					//title:typeof(config.table[tableI].title)=='string'?config.table[tableI].title:'',
					//formSize:'compactmode',//form size设置
					//formType:typeof(config.table[tableI].plusFieldType)=='string'?config.table[tableI].plusFieldType:'single',//mutli
					btns:containerBtnArr,
					isSingleMode:isSingleMode,
					//forms:contianerFormArray
				}
				if(contianerFormArray.length >0){
					templateFormTableObj[containerJson].forms = contianerFormArray;
				}
				if(config.browersystem === 'pc'){
					templateFormTableObj[containerJson].title = typeof(config.table[tableI].title)=='string'?config.table[tableI].title:'';
				}
			}
		}
		//读取html页面输出
		function getHtml(){
			//var navHtml = '';
			//navHtml = '<nav ns-id="'+config.navId+'" ns-config="'+config.navJson+'" ns-options="border:left,class:nav-form,templates:formTable"></nav>';
			var titleHtml = '';
			if(config.isShowTitle){
				//标题设置为显示
				titleHtml = '<panel ns-id="templateTitle"></panel>'; 
			}
			var isShowHistoryBtn = config.isShowHistoryBtn;
			var tableHtml = '';
			for(var tableI=0; tableI<config.table.length; tableI++){
				tableHtml += '<panel ns-id="'+config.tableId+tableI+'" ns-container="'+config.tableContainerJson+tableI+'" ns-options="col:12" ns-config="table:'+config.tableJson+tableI+'"></panel>';
			}
			var optionsStr = 'templates:formTable,isShowHistoryBtn:'+isShowHistoryBtn;
			if (config.mode) {
				optionsStr += ',mode:mode-' + config.mode;
			}
			var severformHtml = '';//severform
			if(formFieldSeverArray.length > 0){
				severformHtml = '<panel ns-id="severform" ns-options="col:12" ns-config="form:severform"></panel>';				
			}
			//ns-config="form:'+config.formJson+'" 
			var html = '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="'+optionsStr+'">'
							+titleHtml
							+'<panel ns-id="'+config.formId+'" ns-options="col:12" ns-container="formContainer"></panel>'
							+tableHtml
							+severformHtml
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
					currentDataObject = res[config.getValueAjax.dataSrc];  		//数组对象
					currentDataObject.objectState = NSSAVEDATAFLAG.EDIT;
					//给当前检索值赋值
					var formJson = $.extend(true,{},templateFormTableObj.formJson);
					formJson.id = config.fullFormId;
					var formData = {};
					for(var formI=0; formI<formJson.form.length; formI++){
						formJson.form[formI].value = currentDataObject[formJson.form[formI].id];
					}
					nsForm.init(formJson);
					//nsForm.fillValues(formData,config.fullFormId);
					for(var alias in tableAliasData){
						var tableId = tableAliasData[alias].tableId;
						var aliasField = tableAliasData[alias].aliasField;
						if(!$.isArray(currentDataObject[aliasField])){
							currentDataObject[aliasField] = [];
						}
						nsList.refresh(tableId,currentDataObject[aliasField]);
					}
					//20190116 订阅消息
					nsTemplate.setProcessDataByWorkItemId(config);
					if(config.isHaveUrl){
						// 如果有地址 是topage时 初始化 nsFrame.autoSaveData
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
			var formDataFields = nsForm.getFormJSON(config.fullFormId,false);
			for(var fieldKey in formDataFields){
				if(typeof(formSourceData[fieldKey])=='undefined'){
					formSourceData[fieldKey] = '';
				}
			}
			nsFrame.autoSaveData[templateURL].forms[config.fullFormId] = formSourceData;
			if(typeof(nsFrame.autoSaveData[templateURL].tables)=='undefined'){
				nsFrame.autoSaveData[templateURL].tables = {};
			}
			for(var alias in tableAliasData){
				var tableId = tableAliasData[alias].tableId;
				var aliasField = tableAliasData[alias].aliasField;
				nsFrame.autoSaveData[templateURL].tables[tableId] = $.extend(true,[],currentDataObject[aliasField]);
			}
			nsFrame.autoSaveData[templateURL].handler = function(){
				getSaveDataAjax(true); // 保存后关闭
			};
		}
		function tableBtnAddDialogHanlder(dom){
			var navId = dom.closest('.nav-form').attr('id');
			navId = navId.substring(0,navId.lastIndexOf('-'));
			var tableId = 'table-'+navId;
			var addDialogId = 'add-'+tableId+'-dialog';
			var formConfigForm = $.extend(true,[],tableJsonObj[tableId].addBtn.field);
			for(var formI=0;formI<formConfigForm.length;formI++){
				if(typeof(formConfigForm[formI].data)=='object'){
					// nsVals.setFormatDataBySouData(formConfigForm[formI].data,currentDataObject);
					var formatData = nsVals.getVariableJSON(formConfigForm[formI].data,currentDataObject);
					if(formatData){
						formConfigForm[formI].data = formatData;
					}else{
						console.error('组件data配置错误');
						console.error(formConfigForm[formI]);
					}
				}
			}
			var isValidForm = true;
			//弹框确认保存事件
			function tableAddDialogConfirmHandler(){
				var inputData = nsTemplate.getChargeDataByForm(addDialogId);//获取form数据
				if(inputData===false){isValidForm = false; return;}//验证不通过直接return
				var addData = $.extend(true,{},inputData);//行数据和修改的合并，已修改后的为准
				//var originalDataSource = baseDataTable.originalConfig[tableId].dataConfig.dataSource;
				//originalDataSource.unshift(addData);
				var dataArray = $.extend(true,[],currentDataObject[tableJsonObj[tableId].aliasField]);
				var newDataArray = [];
				for(var i=0; i<dataArray.length; i++){
					if(dataArray[i].objectState != NSSAVEDATAFLAG.DELETE){
						newDataArray.push(dataArray[i]);
					}
				}
				baseDataTable.originalConfig[tableId].dataConfig.dataSource = newDataArray;
				baseDataTable.originalConfig[tableId].dataConfig.dataSource.unshift(addData);
				baseDataTable.refreshByID(tableId);

				inputData.objectState = NSSAVEDATAFLAG.ADD;
				var timeStamp = new Date().getTime();
				inputData.nsTempTimeStamp = timeStamp;
				if(typeof(currentDataObject[tableJsonObj[tableId].aliasField])=='undefined'){
					currentDataObject[tableJsonObj[tableId].aliasField] = [];
				}
				currentDataObject[tableJsonObj[tableId].aliasField].push(inputData);
			}
			var textArr = ['新增','保存并新增'];
			if(tableJsonObj[tableId].addBtn.dialogBtnText){
				textArr = tableJsonObj[tableId].addBtn.dialogBtnText.split('/');
			}
			var textAddStr = textArr[0];
			var textSaveStr = textArr[1] ? textArr[1] : '保存并新增';
			var size = tableJsonObj[tableId].addBtn.width;
			var originalAddDialogConfig = {
				id: addDialogId,
				title: tableJsonObj[tableId].addBtn.title,
				size: size,
				// form: tableJsonObj[tableId].addBtn.field,
				form: formConfigForm,
				btns: 
				[
					{
						text: textAddStr,
						handler: function(){
							tableAddDialogConfirmHandler();
							if(isValidForm){
								nsdialog.hide();//关闭弹框
							}
						}
					},{
						text:textSaveStr,
						handler:function(){
							tableAddDialogConfirmHandler();
							if(isValidForm){
								var refreshConfig = $.extend(true,{},originalAddDialogConfig);
								nsdialog.refresh(refreshConfig,{});
							}
						}
					}
				]
			}
			originalAddDialogConfig.isValidSave = true;
			var addDialogConfig = $.extend(true,{},originalAddDialogConfig);
			nsdialog.initShow(addDialogConfig);//弹框调用
		}
		//自定义table行编辑按钮的事件触发
		function customerTableEditBtnHandler(data){
			var editFieldArray = $.extend(true,[],tableJsonObj[data.tableId].editField);
			var rowData = data.rowData;
			var editDialogId = 'edit-'+data.tableId+'-dialog';
			for(var editI=0; editI<editFieldArray.length; editI++){
				editFieldArray[editI].value = rowData[editFieldArray[editI].id];
				if(typeof(editFieldArray[editI].data)=='object'){
					// nsVals.setFormatDataBySouData(formConfigForm[formI].data,currentDataObject);
					var formatData = nsVals.getVariableJSON(editFieldArray[editI].data,currentDataObject);
					if(formatData){
						editFieldArray[editI].data = formatData;
					}else{
						console.error('组件data配置错误');
						console.error(editFieldArray[editI]);
					}
				}
			}
			function editTableRowDialog(){
				//赋默认值
				//弹框确认保存事件
				function tableRowEditDialogConfirmHandler(){
					var inputData = nsTemplate.getChargeDataByForm(editDialogId);//获取form数据
					if(inputData===false){return;}//验证不通过直接return
					var $tr = data.obj.parents('tr');
					var rowData = $.extend(true,{},data.rowData);
					rowData = $.extend(true,rowData,inputData);
					rowData.objectState = NSSAVEDATAFLAG.EDIT;//当前操作标识是修改
					var idField = tableJsonObj[data.tableId].primaryIdField;
					var dataSrcField = tableJsonObj[data.tableId].aliasField;
					if(rowData[idField]){
						if(rowData.objectState == NSSAVEDATAFLAG.ADD){
							//
						}else{
							rowData.objectState = NSSAVEDATAFLAG.EDIT;//当前操作标识是修改
						}
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
				var size = tableJsonObj[data.tableId].editBtn.size;
				var editConfirmStr = tableJsonObj[data.tableId].editBtn.dialogBtnText;
				var editDialog = {
					id: editDialogId,
					title: tableJsonObj[data.tableId].editTitle,
					size: size,
					form: editFieldArray,
					btns: 
					[
						{
							text: editConfirmStr,
							handler: function(){
								tableRowEditDialogConfirmHandler();
							}
						}
					]
				}
				editDialog.isValidSave = true;
				nsdialog.initShow(editDialog);//弹框调用
			}
			editTableRowDialog();//调用弹框执行
		}
		//自定义table行删除按钮的事件触发
		function customerTableDelDialogBtnHandler(data){
			var delFieldArray = tableJsonObj[data.tableId].delBtn.field;
			var rowData = data.rowData;
			var delDialogId = 'del-'+data.tableId+'-dialog';
			for(var delI=0; delI<delFieldArray.length; delI++){
				delFieldArray[delI].value = rowData[delFieldArray[delI].id];
			}
			function delTableRowDialog(){
				//赋默认值
				//弹框确认保存事件
				function tableRowDelDialogConfirmHandler(){
					var inputData = nsTemplate.getChargeDataByForm(delDialogId);//获取form数据
					if(inputData===false){return;}//验证不通过直接return
					var delRowData = $.extend(true,{},data.rowData);
					var $tr = data.obj.parents('tr');
					var idField = tableJsonObj[data.tableId].primaryIdField;
					var dataSrcField = tableJsonObj[data.tableId].aliasField;
					var deleteFlagIndex = -1;
					for(var delI=0; delI<currentDataObject[dataSrcField].length; delI++){
						if(delRowData[idField]){
							if(currentDataObject[dataSrcField][delI][idField] === delRowData[idField]){
								currentDataObject[dataSrcField][delI].objectState = NSSAVEDATAFLAG.DELETE;
							}
						}else{
							var tempObj = $.extend(true,{},currentDataObject[dataSrcField][delI]);
							delete tempObj.objectState;
							delete delRowData.objectState;
							delete tempObj.nsTempTimeStamp;
							delete delRowData.nsTempTimeStamp;
							if(isObjectValueEqual(tempObj,delRowData)){
								deleteFlagIndex = delI;
								//delete currentDataObject[dataSrcField][delI];
							}
						}
					}
					if(deleteFlagIndex > -1){
						currentDataObject[dataSrcField].splice(deleteFlagIndex,1);
					}
					nsList.rowDelete(data.tableId,delRowData,{queryMode:'tr', queryValue:$tr});
					nsdialog.hide();//关闭弹框
				}
				var delDialog = {
					id: delDialogId,
					title: tableJsonObj[data.tableId].delBtn.title,
					size: 'm',
					form: delFieldArray,
					btns: 
					[
						{
							text: '确认',
							handler: function(){
								tableRowDelDialogConfirmHandler();
							}
						}
					]
				}
				delDialog.isValidSave = true;
				nsdialog.initShow(delDialog);//弹框调用
			}
			delTableRowDialog();//调用弹框执行
		}
		function customerTableDelBtnHandler(data){
			var delText = tableJsonObj[data.tableId].delField;
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
					var idField = tableJsonObj[data.tableId].primaryIdField;
					var dataSrcField = tableJsonObj[data.tableId].aliasField;
					var deleteFlagIndex = -1;
					for(var delI=0; delI<currentDataObject[dataSrcField].length; delI++){
						if(delRowData[idField]){
							if(currentDataObject[dataSrcField][delI][idField] === delRowData[idField]){
								currentDataObject[dataSrcField][delI].objectState = NSSAVEDATAFLAG.DELETE;
							}
						}else{
							var tempObj = $.extend(true,{},currentDataObject[dataSrcField][delI]);
							delete tempObj.objectState;
							delete delRowData.objectState;
							delete tempObj.nsTempTimeStamp;
							delete delRowData.nsTempTimeStamp;
							if(isObjectValueEqual(tempObj,delRowData)){
								deleteFlagIndex = delI;
								//delete currentDataObject[dataSrcField][delI];
							}
						}
					}
					if(deleteFlagIndex > -1){
						currentDataObject[dataSrcField].splice(deleteFlagIndex,1);
					}
					nsList.rowDelete(data.tableId,delRowData,{queryMode:'tr', queryValue:$tr});
				}
			}
		}
		//table表格添加别名
		function tableBtnAddAliasHanlder(dom){
			var navId = dom.closest('.nav-form').attr('id');
			var id = navId.substring(0,navId.lastIndexOf('-'));
			var formId = id+'-customerform';
			var tableId = 'table-'+id;
			var jsonData = nsTemplate.getChargeDataByForm(formId);
			if(jsonData){
				var rowData = $.extend(true,{},jsonData);
				nsForm.clearData(formId);
				//添加新增标识
				rowData.objectState = NSSAVEDATAFLAG.ADD;
				//添加时间戳
				var timeStamp = new Date().getTime();
				rowData.nsTempTimeStamp = timeStamp;
				nsList.add(tableId,rowData);
			}
		}
		function initLayout(){
			function layoutAfterHandler(){
				serviceComponentInit();//调用自定义组件
				var titleHtml = '';
				var $title = $('#'+config.fullTitleId);
				switch(config.browersystem){
					case 'pc':
						titleHtml = '<div class="templateTitle">'+config.title+'</div>';
						$title.html(titleHtml);
						break;
					case 'mobile':
						titleHtml = '<div class="layout-main layout-main-card">'
										+'<ul id="tab-'+config.fullTitleId+'" class="nav nav-tabs nav-tabs-line">';
						for(var titleI=0; titleI<titleArray.length; titleI++){
							var classStr = titleI === 0 ? 'active' : '';
							var hrefId = 'tab-li-'+titleI;
							titleHtml += '<li class="'+classStr+'" ns-id="'+titleArray[titleI].id+'">'
											+'<a href="'+hrefId+'" data-toggle="tab">'+titleArray[titleI].title+'</a>'
										+'</li>';
						}
						titleHtml += '</ul></div>';
						$title.html(titleHtml);

						//footer-nav
						$('#container-panel-'+config.fullFormId).addClass('footer-nav');
						var $ul = $('#tab-'+config.fullTitleId);
						var currentContainerId = 'container-container-panel-'+titleArray[0].id;
						$('#'+currentContainerId).siblings().addClass('hide');
						$title.removeClass('hide');
						$ul.children('li').on('click',function(ev){
							var $this = $(this);
							var containerId = 'container-container-panel-'+$this.attr('ns-id');
							$('#'+containerId).removeClass('hide');
							$('#'+containerId).siblings().addClass('hide');
							$title.removeClass('hide');
						})
						break;
				}
				if(config.isFormHidden == true){
					//隐藏
					$('#'+config.id+'-form').hide();
				}
				templateURL = $('#'+config.id).parents().parents().attr('ns-pageurl');
				// 如果有地址说明是topage页面
				if(templateURL){
					config.isHaveUrl = true;
				}else{
					config.isHaveUrl = false;
				}
				//创建模板Json对象
				if(config.isReadAjax){
					refreshInitAjaxData();
				}else{
					currentDataObject = {
						objectState:NSSAVEDATAFLAG.ADD
					}
					var formJson = $.extend(true,{},templateFormTableObj.formJson);
					formJson.id = config.fullFormId;
					nsForm.init(formJson);
				}
				//存在form字段field-more
				if(formFieldMoreArray.length > 0){
					//存在展开更多的form
					/*var html = '<div class="modal-expand-more" nstype="expand">展开更多<i class="fa-caret-up"></i></div>';
					$('#form-'+config.fullFormId).after(html);
					$('[nstype="expand"]').click(function(ev){
						var editArray = formFieldMoreArray;
						
					});*/
				}
			}
			nsLayout.init(config.id,{afterHandler:layoutAfterHandler});
		}
		//调用保存ajax
		function getSaveDataAjax(isClose){
			// isClose : topage页面点击关闭按钮时 保存后关闭topage页面
			isClose = typeof(isClose)=='boolean'?isClose:false;
			var formJson = nsTemplate.getChargeDataByForm(config.fullFormId);//读取form数据并验证
			if(formFieldSeverArray.length > 0){
				//存在mindjetFieldPosition 定义为field-sever 独立的一个form表单
				var severformId = config.id + '-severform';
				var severFieldJson = nsTemplate.getChargeDataByForm(severformId);//读取form数据并验证
				for(var sever in severFieldJson){
					formJson[sever] = severFieldJson[sever];
				}
			}
			if(formJson){
				//验证通过继续执行
				//不用直接作为搜索条件需要转换一下key value
				var wholeParameterData = $.extend(true,{},currentDataObject);
				for(var value in formJson){
					wholeParameterData[value] = formJson[value];
				}
				if(typeof(config.pageParam)=='object'){
					$.each(config.pageParam,function(key,value){
						if(key == 'activeityId' || key == 'processId' || key == 'processName'){
							wholeParameterData[key] = value;
						}
					})
				}
				//var wholeParameterData = $.extend(true,currentDataObject,formJson);
				// cy 181215 start 添加页面参数（流程参数） 并且根据idField是否有有效值判断objectState ----
				/*if(typeof(config.pageParam) == 'object'){
					$.each(config.pageParam, function(key, value){
						//把页面参数 追加到整体参数上 当前仅追加了三个 activeityId processId processName
						wholeParameterData[key] = value;
					})
				}*/
				if(typeof(config.form.idField)=='string'){
					var voId = wholeParameterData[config.form.idField];
					if(typeof(voId) == 'undefined'){
						//没有id则是新增
						wholeParameterData.objectState = NSSAVEDATAFLAG.ADD;
					}else if(typeof(voId) == 'string'){
						//有id但是是""，仍然是空
						if(voId == ''){
							wholeParameterData.objectState = NSSAVEDATAFLAG.ADD;
						}else{
							wholeParameterData.objectState = NSSAVEDATAFLAG.EDIT;
						}
					}else{
						//有id则是修改
						wholeParameterData.objectState = NSSAVEDATAFLAG.EDIT;
					}
				}
				// cy 181215 end ----
				var listAjax = nsVals.getAjaxConfig(config.saveData.ajax,wholeParameterData,{idField:config.form.idField});

				nsVals.ajax(listAjax, function(res){
					// //保存ajax成功执行之后的操作
					// nsalert('保存成功');
					// refreshSaveDataAjax(res[config.saveData.ajax.dataSrc]);
					//保存ajax成功执行之后的操作
					nsalert('保存成功');
					var isCloseWindow = config.saveData.ajax.isCloseWindow; // lyw 关闭窗口 20180830
					// isClose topage弹框关闭按钮 关闭 topage弹框
					if(isCloseWindow || isClose){
						nsFrame.popPageClose(); 
					}else{
						refreshSaveDataAjax(res[config.saveData.ajax.dataSrc]);
						if(config.isHaveUrl){
							initNsFrameAutoSaveData();
						}
					}
				});
			}
		}
		//刷新保存数据
		function refreshSaveDataAjax(data){
			if(typeof(data)!='object'){data = {};}
			delete data.objectState;
			currentDataObject = data;
			for(var data in currentDataObject){
				if($.isArray(currentDataObject[data])){
					currentDataObject[data] = nsTemplate.getDataByObjectState(currentDataObject[data]);
				}
			}
			nsForm.fillValues(currentDataObject,config.fullFormId);
			for(var alias in tableAliasData){
				var tableId = tableAliasData[alias].tableId;
				var aliasField = tableAliasData[alias].aliasField;
				currentDataObject[aliasField] = nsTemplate.getDataByObjectState(currentDataObject[aliasField]);
				baseDataTable.originalConfig[tableId].dataConfig.dataSource = currentDataObject[aliasField];
				baseDataTable.refreshByID(tableId);
			}
		}
		//表格行选中事件
		function tableRowSelectedHandler(selectData){
			var rowData = baseDataTable.table[selectData.tableID].row(selectData.obj).data();
		}
		//表格行取消选中事件
		function tableRowCancelSelectedtHandler(selectData){}
		//form组件改变值回调方法
		function formCommonChangeHandler(runObj){
			// 根据type转化value值
			var value = runObj.value;
			var type = runObj.type;
			switch(type){
				case 'date':
				case 'datetime':
					if(value){
						value = Number(moment(value).format('x'))
					}
					break;
			}
			//如果定义了返回事件
			currentDataObject[runObj.id] = value;
		}
		//table按钮触发绑在了container的btn按钮
		function tableLevelBtnHandler(dom){
			var buttonIndex = dom.attr('fid');
			var tableId = dom.closest('.nav-form').attr('id');
			tableId = 'table-'+tableId.substring(0,tableId.lastIndexOf('-'));
			var runHandler = tableJsonObj[tableId].tableBtnHandler[buttonIndex];
			runHandler.handler(tableJsonObj[tableId]);
		}
		//table按钮触发绑在了container的btn按钮
		function tableLevelTwoBtnHandler(dom){
			var buttonIndex = dom.attr('fid');
			var subIndex = dom.attr('optionid');
			var tableId = dom.closest('.nav-form').attr('id');
			tableId = 'table-'+tableId.substring(0,tableId.lastIndexOf('-'));
			var runHandler = tableJsonObj[tableId].tableBtnHandler[buttonIndex][subIndex];
			runHandler.handler(tableJsonObj[tableId]);
		}
		//自定义组件
		function serviceComponentInit(){
			for(var customer in customerComponentObj){
				var functionHandler;
				switch(customerComponentObj[customer].operator){
					case 'add':
						functionHandler = addComponentCompleteHandler;
						break;
					case 'multiAdd':
						functionHandler = multiAddComponentCompleteHandler;
						break;
				}
				customerComponentObj[customer].init(customerComponentObj[customer],functionHandler);
			}
		}
		//根据具体的id字段找所属的数据源
		function getFullFieldByID(idField){
			var fullId;
			for(var formI=0; formI<newFormFieldArray.length; formI++){
				if(newFormFieldArray[formI].mindjetFieldName === idField){
					fullId = newFormFieldArray[formI].id;
				}
			}
			return fullId;
		}
		//快速录入组件完成回调事件
		function addComponentCompleteHandler(data){
			console.log(data)
		}
		//批量新增
		function multiAddComponentCompleteHandler(data,obj){
			if(obj.type=='all'){
				ajaxAfterHandler(obj.data);
				return false;
			}
			var array = $.extend(true,[],data.array);
			var tableId = obj.tableId;
			var originalDataSource = baseDataTable.originalConfig[tableId].dataConfig.dataSource;
			var obj = tableJsonObj[tableId];
			var rowArray = [];
			if(!$.isArray(currentDataObject[obj.aliasField])){
				currentDataObject[obj.aliasField] = [];
			}
			function isExistDataByIdField(id){
				//根据id判断是否已经存在于数据中
				var isExist = false;//默认不存在
				for(var idI=0; idI<currentDataObject[obj.aliasField].length; idI++){
					var existData = currentDataObject[obj.aliasField][idI];
					if(existData[obj.primaryIdField] === id){
						//存在
						isExist = true;
						break;//终止循环
					}
				}
				return isExist;
			}
			if(obj.chargeField){
				//存在转字段
				var chargeField = eval('('+obj.chargeField+')');
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
			for(var arrayI=0; arrayI<rowArray.length; arrayI++){
				var inputData = $.extend(true,{},rowArray[arrayI]);
				//是否已经存在
				var isExist = false;
				if(typeof(inputData[obj.primaryIdField])=='undefined'){
					isExist = false;
				}else{
					isExist = isExistDataByIdField(inputData[obj.primaryIdField]);
				}
				if(!isExist){
					//不存在进行添加
					inputData.objectState = NSSAVEDATAFLAG.ADD;
					var timeStamp = new Date().getTime();
					rowArray[arrayI].nsTempTimeStamp = timeStamp;
					inputData.nsTempTimeStamp = timeStamp;
					originalDataSource.unshift(rowArray[arrayI]);
					currentDataObject[obj.aliasField].push(inputData);
				}
			}
			baseDataTable.refreshByID(tableId);
		}
		setDefault();//默认值处理
		filterFormFieldData();//form值数据处理
		filterTableFieldData();//table数据处理
		var html = getHtml();//获取html
		//围加根html
		html = nsTemplate.aroundRootHtml(html);
		//将html添加到页面
		nsTemplate.appendHtml(html);
		initLayout();
		
		// 模板回调 lyw 20181018
		if(typeof(config.completeHandler)=='function'){
			config.completeHandler(config);
		}
	}
	//刷新方法
	function refresh(id,data){
		//添加刷新，新增刷新，删除刷新
		var config = nsTemplate.templates.formTable.data[id].config;
	}	
	//清空方法
	function clear(id){
		var config = nsTemplate.templates.formTable.data[id].config;
		nsForm.clearData(config.fullFormId);
		baseDataTable.clearData(config.fullTableId);
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
/******************** 表单表格模板 end ***********************/