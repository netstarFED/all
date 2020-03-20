nsTemplate.templates.singleTable = (function() {
	var originalTemplateConfig = {};
	var currentData = {}; 				//当前业务对象
	var currentList = []; 				//当前业务对象列表
	var currentListDatas = {}; 			//当前主表列表对象，用id（mianTableIdField）访问
	var config = {};
	var tableIdFeild = ''; //主表主键id
	var isContainerBlockTable = false;//默认不包含块状表格
	var containerBlockObj = {};//块状表格数据

	//regexp标签测试
	var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
	//layout初始完成后的回调函数集合
	var layoutAfterHandlerArray = [];
	//模板初始化
	function templateInit(){
		nsTemplate.templates.singleTable.data = {};
	}
	//配置文件验证
	function configValidate(_config){
		var isValid = true;
		//整体参数验证
		var validArr =
			[
				['saveData', 'object'], //通用保存数据方法的配置
				['table', 'object', true], //表格对象
			]
		isValid = nsDebuger.validOptions(validArr, _config);
		if (isValid == false) {
			return false;
		}
		isValid = nsTemplate.validConfigByTable(_config.table,{isMainTable:true});//验证表格
		if(isValid == false){return false;}
		return isValid;
	}

	var optionsConfig = {
		dialogBeforeHandler:dialogBeforeHandler,
		ajaxBeforeHandler:ajaxBeforeHandler,
		ajaxAfterHandler:ajaxAfterHandler,
		loadPageHandler:loadPageHandler,
		closePageHandler:closePageHandler
	};
	function refreshMainTableData(){
		//主表config定义
		var pageParamObject = $.extend(true,{},config.pageParam);//界面跳转拿到的值
		var defaultAjax = $.extend(true,{},config.table.ajax);//读取默认的配置
		var listAjax = nsVals.getAjaxConfig(defaultAjax,{},{idField:config.table.idField,keyField:config.table.keyField,pageParam:pageParamObject,parentObj:config.parentObj});
		nsVals.ajax(listAjax,function(res){
			if(res.success){
				var listData = res[config.table.ajax.dataSrc]; //数组对象
				//验证 dataSrc是否设置正确
				if(typeof(listData)=='undefined'){
					console.error('config.table.ajax.dataSrc : '+config.table.ajax.dataSrc+' 与返回数据不匹配');
					console.error(res);
					listData = [];
					//return false;
				}
				var dataSourceArray = [];
				for(var listI=0; listI<listData.length; listI++){
					dataSourceArray.push(listData[listI]);
				}
				if(config.table.displayMode==='block'){
					nsList.blockTable.data[config.fullTableId].dataConfig.dataSource = dataSourceArray;
					//nsList.blockTable.originalRowsData[config.fullTableId] = dataSourceArray;
					nsList.blockTable.getHtml(config.fullTableId,dataSourceArray);
				}else{
					baseDataTable.originalConfig[config.fullTableId].dataConfig.dataSource = dataSourceArray;
					baseDataTable.refreshByID(config.fullTableId);
					//20190116 订阅消息
					nsTemplate.setProcessDataByWorkItemId(config);
				}
			}
		},true);
		/*if(isContainerBlockTable){
			//还有组件表格
			var tableId = containerBlockObj.data.tableId;
			var dataConfig = nsList.blockTable.data[tableId].dataConfig;
			var listAjax = {
				url:dataConfig.src,
				type:dataConfig.type,
				data:dataConfig.data,
				plusData:{
					dataSrc:dataConfig.dataSrc
				}
			};
			nsVals.ajax(listAjax, function(res,ajaxData){
				if(res.success){
					var data = res[ajaxData.plusData.dataSrc];
					nsList.blockTable.originalRowsData[tableId] = $.extend(true,[],data);
					nsList.blockTable.data[tableId].dataConfig.dataSource = $.extend(true,[],data);
					nsList.blockTable.getHtml(tableId,data);
				}
			},true);
		}*/
	}
	//弹框调用前置方法
	function dialogBeforeHandler($btn){
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
		data.containerFormJson = {};
		var formId;
		var allParamData = {};//如果是自定义整体传参 mainList mainForm  mainVo
		if($btn.rowData){
			//如果是行内按钮则直接返回行的数据
			data.value = $btn.rowData;
			formId = data.tableId.substring(data.tableId.indexOf('-')+1,data.tableId.length)+'-customerform';
		}else{
			var selectedData = baseDataTable.getTableSelectData(config.fullTableId,false);//获取行选中数据
			if(selectedData){
				//delete selectedData.nsTemplateButton;
				data.value = selectedData;
			}else{
				data.value = false;
			}
			var navId = $btn.closest('.nav-form').attr('id');
			formId = navId.substring(0,navId.lastIndexOf('-'))+'-customerform';
		}
		if($('#'+formId).length > 0){
			//存在form
			data.containerFormJson = nsTemplate.getChargeDataByForm(formId);
		}

		//sjj20181029  ajaxDataParamSource
		if(typeof(data.controllerObj.ajaxDataParamSource)=='string'){
			if(data.controllerObj.ajaxDataParamSource == 'all'){
				allParamData = {
					mainList:data.value,
					mainVo:data.value,
					mainForm:data.containerFormJson
				};
				data.value = allParamData;
			}
		}

		data.btnOptionsConfig = {
			currentTable:'main',//当前操作是主表还是附表
			isOuterBtn:isOuterBtn,//是否是外部按钮
			descritute:{keyField:config.table.keyField,idField:config.table.idField}
		}

		return data;
	}
	//弹框ajax保存前置方法
	function ajaxBeforeHandler(handlerObj){
		//是否有选中值有则处理，无则返回
		handlerObj.config = config;
		handlerObj.ajaxConfigOptions = {
			idField:config.table.idField,
			keyField:config.table.keyField,
			pageParam:config.pageParam,
			parentObj:config.parentObj
		};
		return handlerObj;
	}
	//弹框ajax保存后置方法
	function ajaxAfterHandler(res){
		console.log(res);
		if(debugerMode){
			if(!$.isArray(res)){
				if(typeof(res.objectState)!='number'){
					console.error('服务器返回数据没有objectState属性，无法执行');
					nsalert('服务器返回数据没有objectState属性，无法执行', 'error');
					return false;
				}
			}
		}
		switch(res.objectState){
			case NSSAVEDATAFLAG.DELETE:
				//删除
				nsList.delById(config.fullTableId, res);
				break;
			case NSSAVEDATAFLAG.EDIT:
				//修改
				nsList.rowEdit(config.fullTableId, res, {isUseNotInputData:true});
				break;
			case NSSAVEDATAFLAG.ADD:
				//添加
				switch(config.table.displayMode){
					case 'block':
						nsList.blockTable.data[config.fullTableId].dataConfig.dataSource.unshift(res);
						nsList.blockTable.getHtml(config.fullTableId,nsList.blockTable.data[config.fullTableId].dataConfig.dataSource);
						break;
					case 'table':
					default:
						baseDataTable.originalConfig[config.fullTableId].dataConfig.dataSource.unshift(res);
						baseDataTable.refreshByID(config.fullTableId);
						break;
				}
				//nsList.rowEdit(config.fullTableId, res, {isUseNotInputData:true});
				break;
			case NSSAVEDATAFLAG.VIEW:
				//刷新
				refreshMainTableData();
				/*if(config.table.displayMode==='block'){
					var dataSourceArray = nsList.blockTable.originalRowsData[config.fullTableId];
					nsList.blockTable.getHtml(config.fullTableId,dataSourceArray);
				}else{
					baseDataTable.refreshByID(config.fullTableId);
				}*/
				break;
		}
		if($.isArray(res)){
			//刷新
			var listData = res;
			if(typeof(listData)=='undefined'){
				console.error('config.table.ajax.dataSrc : '+config.table.ajax.dataSrc+' 与返回数据不匹配');
				console.error(res);
				return false;
			}
			var dataSourceArray = [];
			for(var listI=0; listI<listData.length; listI++){
				dataSourceArray.push(listData[listI]);
			}
			if(config.table.displayMode==='block'){
				nsList.blockTable.data[config.fullTableId].dataConfig.dataSource = dataSourceArray;
				//nsList.blockTable.originalRowsData[config.fullTableId] = dataSourceArray;
				nsList.blockTable.getHtml(config.fullTableId,dataSourceArray);
			}else{
				baseDataTable.originalConfig[config.fullTableId].dataConfig.dataSource = dataSourceArray;
				baseDataTable.refreshByID(config.fullTableId);
			}
		}
		if(isContainerBlockTable){
			//还有组件表格
			var tableId = containerBlockObj.data.tableId;
			var dataConfig = nsList.blockTable.data[tableId].dataConfig;
			var listAjax = {
				url:dataConfig.src,
				type:dataConfig.type,
				data:dataConfig.data,
				plusData:{
					dataSrc:dataConfig.dataSrc
				}
			};
			nsVals.ajax(listAjax, function(res,ajaxData){
				if(res.success){
					var data = res[ajaxData.plusData.dataSrc];
					nsList.blockTable.originalRowsData[tableId] = $.extend(true,[],data);
					nsList.blockTable.data[tableId].dataConfig.dataSource = $.extend(true,[],data);
					nsList.blockTable.getHtml(tableId,data);
				}
			},true);
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
			config = nsTemplate.templates.singleTable.data[layoutId].config;
		}else{
			var layoutId = $btn.obj.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.singleTable.data[layoutId].config;
		}
		refreshMainTableData();
		if(isContainerBlockTable){
			//还有组件表格
			var tableId = containerBlockObj.data.tableId;
			var dataConfig = nsList.blockTable.data[tableId].dataConfig;
			var listAjax = {
				url:dataConfig.src,
				type:dataConfig.type,
				data:dataConfig.data,
				plusData:{
					dataSrc:dataConfig.dataSrc
				}
			};
			nsVals.ajax(listAjax, function(res,ajaxData){
				if(res.success){
					var data = res[ajaxData.plusData.dataSrc];
					nsList.blockTable.originalRowsData[tableId] = $.extend(true,[],data);
					nsList.blockTable.data[tableId].dataConfig.dataSource = $.extend(true,[],data);
					nsList.blockTable.getHtml(tableId,data);
				}
			},true);
		}
	}
	//设置默认值
	function setDefault(){
		config.layout = {
			tableId:"singleTable"
		}
		//表格配置
		config.table = nsTemplate.setDefalutByTable(config.table,optionsConfig,config);
		//追加配置参数
		var baseConfig = {
			browersystem: nsVals.browser.browserSystem, //浏览器类型
			mode: 'mode-' + config.mode, //浏览器类型
			fullTableId: 'table-' + config.id + '-singleTable', 	//完整的主表id
		}
		nsVals.extendJSON(config, baseConfig);
	}
	/******************表格自定义 add edit delete 按钮事件 start********************************/

	//刷新主表格 同时标识新的当前操作对象
	function refreshTable(dataSourceArray, actionConfig){
		//刷新表格
		var tableId = config.fullTableId;

		if(config.table.displayMode==='block'){
			nsList.blockTable.data[tableId].dataConfig.dataSource = dataSourceArray;
			//nsList.blockTable.originalRowsData[tableId] = dataSourceArray;
			nsList.blockTable.getHtml(tableId,dataSourceArray);
		}else{
			baseDataTable.originalConfig[tableId].dataConfig.dataSource = dataSourceArray;
			baseDataTable.refreshByID(tableId);
		}
	}
	//主对象(主表)新增方法
	function saveDataAddAjax(inputData,dialogObj){
		//添加到表格中的数据
		var addTableRowData = $.extend(true,{},inputData)
		//添加时间戳
		var timeStamp = new Date().getTime();
		addTableRowData.nsTempTimeStamp = timeStamp;
		addTableRowData[tableIdFeild] = '';//主键id值为空
		//添加行
		baseDataTable.addTableRowData(config.fullTableId,[addTableRowData]);
		//添加新增标识
		inputData.objectState = NSSAVEDATAFLAG.ADD;
		//获取发送参数
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax,inputData,{idField:config.table.idField,keyField:config.table.keyField,pageParam:config.pageParam,parentObj:config.parentObj}); 
		//标记时间戳用于返回数据后替换
		saveDataAjax.plusData = {nsTempTimeStamp:timeStamp,dialogObj:dialogObj};
		nsVals.ajax(saveDataAjax,function(res,ajaxObj){
			if(res.success){
				if(ajaxObj.plusData.dialogObj){
					ajaxObj.plusData.dialogObj.afterHandler();
				}else{
					nsdialog.hide();
				}
				//ajax.data中的时间戳
				var tempTimeStamp = ajaxObj.plusData.nsTempTimeStamp;
				//主表数据
				var singleTableData = baseDataTable.getAllTableData(config.fullTableId);
				var resMainData = res[config.saveData.ajax.dataSrc];
				delete resMainData.objectState;
				//resMainData = nsTemplate.getDataByObjectState(resMainData);
				//替换临时添加的数据
				for(var listI = 0;listI<singleTableData.length;listI++){
					var singleTableRowData = singleTableData[listI];
					//根据时间戳查询数据
					if(singleTableRowData.nsTempTimeStamp == tempTimeStamp){
						singleTableData[listI] = resMainData;
					}else{
						if(debugerMode){
							console.error('新增数据错误,表格数据已经有id')
						}	
					}
				}
				//刷新主表
				refreshTable(singleTableData,{isNeedAjax:false,selectedRow:0});
				//更新当前对象
				currentData = res[config.saveData.ajax.dataSrc];
				var isCloseWindow = config.table.add.isCloseWindow;
				if(isCloseWindow){
					nsFrame.popPageClose(); 
				}
			}else{
				var tableData = baseDataTable.table[config.fullTableId].data();
				var tempRowIndex = -1;
				for(var trI=0; trI<tableData.length; trI++){
					var rowData = tableData[trI];
					//根据时间戳找到数据
					if(rowData.nsTempTimeStamp == ajaxObj.plusData.nsTempTimeStamp){
						tempRowIndex = trI;
						break;
					}
				}
				//如果没找到停止执行
				if(tempRowIndex == -1){
					console.log('无法找到服务器返回数据对应结果');
					console.log(res);
					return false;
				}
				baseDataTable.table[config.fullTableId].row(tempRowIndex).remove().draw(false);
				baseDataTable.originalConfig[config.fullTableId].dataConfig.dataSource.splice(tempRowIndex,1);
			}
		},true)
	}
	//主对象(主表)修改方法
	function saveDataEditAjax(inputData, $tr){
		//数据先添加到表格中
		//nsList.rowEdit(config.fullTableId, inputData, {isUseNotInputData:true, queryMode:'tr', queryValue:$tr});
		//添加修改标识
		inputData.objectState = NSSAVEDATAFLAG.EDIT;
		//获取发送方法参数
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax,inputData,{idField:config.table.idField,keyField:config.table.keyField,pageParam:config.pageParam,parentObj:config.parentObj}); 
		saveDataAjax.plusData = {
			tableId: config.fullTableId, 		//tableId
			dataSrc: config.saveData.ajax.dataSrc,	//saveData的dataSrc 用于取数据
			$tr:$tr, 								//当前行
		};
		nsVals.ajax(saveDataAjax, function(res, ajaxObj){
			if(res.success){
				nsdialog.hide();
				//处理返回数据
				var tableId = ajaxObj.plusData.tableId;
				var dataSrc = ajaxObj.plusData.dataSrc;
				var $tr = ajaxObj.plusData.$tr;
				var resRowData = res[dataSrc];
				//主表数据
				delete resRowData.objectState;
				nsList.rowEdit(tableId, resRowData, {isUseNotInputData:true, queryMode:'tr', queryValue:$tr});
				var resMainData = res[config.saveData.ajax.dataSrc];
				//更新 当前对象
				currentData = res[config.saveData.ajax.dataSrc];
				var isCloseWindow = config.table.edit.isCloseWindow;
				if(isCloseWindow){
					nsFrame.popPageClose(); 
				}
			}
		},true)
	}
	//主对象(主表)删除方法
	function saveDataDeleteAjax(inputData, $tr){
		//添加修改标识
		inputData.objectState = NSSAVEDATAFLAG.DELETE;
		//删除无用的field字段
		$.each(inputData, function(key,value){
			if(key == 'id' && value ===''){
				delete inputData[key];
			}else if(key.indexOf('nsTemplate')==0){
				delete inputData[key];
			}
		})

		//获取发送方法参数
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax,inputData,{idField:config.table.idField,keyField:config.table.keyField,pageParam:config.pageParam,parentObj:config.parentObj}); 
		saveDataAjax.plusData = {
			tableId: config.fullTableId, 		//tableId
			idField: config.table.idField, 	//用于查找数据进行比对
			dataSrc: config.saveData.ajax.dataSrc,	//saveData的dataSrc 用于取数据
			$tr:$tr, 								//当前行
		};

		nsVals.ajax(saveDataAjax, function(res, ajaxObj){
			if(res.success){
				//处理返回数据
				var tableId = ajaxObj.plusData.tableId;
				var idField = ajaxObj.plusData.idField;
				var dataSrc = ajaxObj.plusData.dataSrc;
				var $tr = ajaxObj.plusData.$tr;
				var resRowData = res[dataSrc];
				//表数据
				delete resRowData.objectState;
				nsList.rowDelete(tableId, resRowData, {queryMode:'tr', queryValue:$tr});
				var isCloseWindow = config.table.delete.isCloseWindow;
				if(isCloseWindow){
					nsFrame.popPageClose(); 
				}
			}
		},true)
	}
	//设置表格的saveData的增删改查方法
	function setTableSaveDataAction(btnsArray,rowBtnsArray,formArray){
		layoutAfterHandlerArray = [];
		//主表的新增方法
		if(config.table.add){
			switch(config.table.add.type){
				case 'multi':
					//formArray = config.table.add.field;
					var fieldArray = $.extend(true,[],config.table.add.field);
					for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
						formArray.push(fieldArray[fieldI]);
					}
					break;
				case 'dialog':
					var textArr = ['新增','保存并新增'];
					if(config.table.add.dialogBtnText){
						textArr = config.table.add.dialogBtnText.split('/');
					}
					var textAddStr = textArr[0];
					var textSaveStr = textArr[1] ? textArr[1] : '保存并新增';
					var addBtnConfig = {
						text:textAddStr,
						handler:function(ev){
							//需要对dialog的新增按钮添加方法
							config.table.add.dialogConfig.btns[0].handler = function(){
									var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
									if(dialogValue){
										saveDataAddAjax(dialogValue);
										//nsdialog.hide();
									}
								}
							config.table.add.dialogConfig.isValidSave = true;
							var addDialogConfig = $.extend(true,{},config.table.add.dialogConfig);
							//添加保存并新增按钮
							var addSaveBtnConfig = {
								text:textSaveStr,
								handler:function(ev){
									var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
									if(dialogValue){
										saveDataAddAjax(dialogValue,{
											afterHandler:function(){
												var refreshConfig = $.extend(true,{},config.table.add.dialogConfig);
												nsdialog.refresh(refreshConfig,{});
											}
										});
									}
								},
								sourceType:'saveData'
							}
							addDialogConfig.btns.splice(1,0,addSaveBtnConfig);
							nsdialog.initShow(addDialogConfig);
						},
						sourceType:'saveData'
					}
					btnsArray.push(addBtnConfig);
					break;
				case 'component':
					//激活组件，绑定回调方法
					var serviceComponent = config.table.add.serviceComponent;
					var pageConfig = 
					{
						containerId: 'container-panel-'+config.id + '-singleTable',  //输出容器ID
						config:config,
						optionsConfig:optionsConfig,
						pageParam:config.pageParam
					};
					if(serviceComponent.type == 'table'){
						//自定义组件是个表格
						isContainerBlockTable = true;
						containerBlockObj.component = serviceComponent;
						containerBlockObj.data = {
							tableId:'block-table-'+pageConfig.containerId
						};
					}
					//自定义组件需要layout生成后执行，增加到回调数对象列表中
					layoutAfterHandlerArray.push({
						function:function(){
							if(serviceComponent.type == 'table'){
								serviceComponent.init(pageConfig, function(_config){
									containerBlockObj.data = _config;
								})	
							}else{
								serviceComponent.init(pageConfig, function(resData){
									saveDataAddAjax(resData);
								})
							}
						},
						level:1, //数字越小优先级越小
					}) 
					break;
			}
		}
		//主表的编辑方法
		var tableRowBtns = []; //要添加的表格行
		
		//主表的删除方法
		if(config.table.delete){
			switch(config.table.delete.type){
				case 'dialog':
					var editBtnConfig = {
						text:config.table.delete.text,
						handler:function(data){
							//需要对dialog的修改按钮添加方法
							var dialogConfig = config.table.delete.dialogConfig;
							dialogConfig.btns[0].handler = function(){
									var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
									if(dialogValue){
										var $tr = data.obj.parents('tr');
										saveDataEditAjax(dialogValue, $tr);
										//nsdialog.hide();
									}
								}
							for(var fieldI = 0; fieldI<dialogConfig.form.length; fieldI++){
								var fieldData = dialogConfig.form[fieldI];
								fieldData.value = data.rowData[fieldData.id];
							}
							dialogConfig.isValidSave = true;
							nsdialog.initShow(dialogConfig);
						},
						sourceType:'saveData'
					}
					tableRowBtns.unshift(editBtnConfig);
					break;
				case 'confirm':
					var deleteBtnConfig = {
						text:config.table.delete.text,
						handler:function(data){
							//需要对dialog的修改按钮添加方法
							var confirmTitle = config.table.delete.title;
							nsconfirm(confirmTitle, function(res){
								if(res){
									var $tr = data.obj.parents('tr');
									saveDataDeleteAjax(data.rowData, $tr);
								}
							},'warning')
						},
						sourceType:'saveData'
					}
					tableRowBtns.unshift(deleteBtnConfig);
					break;
			}
		}
		if(config.table.edit){
			switch(config.table.edit.type){
				case 'dialog':
					var editBtnConfig = {
						text:config.table.edit.text,
						handler:function(data){
							//需要对dialog的修改按钮添加方法
							var dialogConfig = config.table.edit.dialogConfig;
							dialogConfig.btns[0].handler = function(){
								var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
								if(dialogValue){
									var $tr = data.obj.parents('tr');
									saveDataEditAjax(dialogValue, $tr);
									//nsdialog.hide();
								}
							}
							var fieldArray = nsTemplate.getFormField(dialogConfig.form,data.rowData);
							for(var fieldI = 0; fieldI<fieldArray.length; fieldI++){
								var fieldData = fieldArray[fieldI];
								fieldData.value = data.rowData[fieldData.id];
							}
							var editDialogForm = $.extend(true,{},dialogConfig);
							editDialogForm.form = fieldArray;
							editDialogForm.isValidSave = true;
							nsdialog.initShow(editDialogForm);
						},
						sourceType:'saveData'
					}
					tableRowBtns.unshift(editBtnConfig);
					break;
			}
		}
		//把行按钮添加过去 倒序添加
		for(var btnI=0; btnI<tableRowBtns.length; btnI++){
			rowBtnsArray.push(tableRowBtns[btnI]);
		}		
	}
	/*******************表格自定义 add edit delete 按钮事件 end*****************************/
	//初始化方法
	function init(_config) {
		//第一次执行初始化模板
		if (typeof(nsTemplate.templates.singleTable.data) == 'undefined') {
			templateInit();
		}
		//验证配置参数 验证错误则不执行
		if (configValidate(_config) == false) {
			nsalert('配置文件验证失败', 'error');
			console.error('配置文件验证失败');
			console.error(_config);
			return false;
		}
		config = _config;
		originalTemplateConfig = $.extend(true, {}, _config); //原始配置参数

		//记录config
		nsTemplate.templates.singleTable.data[config.id] = {
			original: originalTemplateConfig,
			config: config
		}

		//设置默认值
		setDefault();
		//设置常用变量
		tableIdFeild = config.table.idField; //主表主键id
		currentData = {};	//当前业务对象
		//生成html
		var html = getLayoutHtml();
		//围加根html
		html = nsTemplate.aroundRootHtml(html);
		//将html添加到页面
		nsTemplate.appendHtml(html);
		//创建模板JSON对象
		createLayoutJson();
		//ctrl+shift+alt+D 绑定验证数据合法弹窗
		$(document).keydown(function(e){
			if(e.ctrlKey && e.shiftKey && e.altKey && e.which==68){
				//nsTemplate.validToolDialog(config);
				nsUI.templatevalidate.init(config);
			}else{

			}
		})
		// 模板回调 lyw 20181018
		if(typeof(config.completeHandler)=='function'){
			config.completeHandler(config);
		}
	}
	//创建模板JSON对象
	function createLayoutJson(){
		var layoutJson = eval(config.package + '={}');

		var tablePanelHeight = $(window).height()-NSPAGEPARTHEIGHT.nav-30;
		//表格高度  不包含标题栏(和搜索栏在同一行) 和表格底部操作栏
		var tableHeight = tablePanelHeight-NSPAGEPARTHEIGHT.title-NSPAGEPARTHEIGHT.footer;
		var tableRowHeight = NSPAGEPARTHEIGHT.wide;
		if(typeof(nsUIConfig)=='object'){
	      if(nsUIConfig.tableHeightMode == 'compact'){
	        tableRowHeight = NSPAGEPARTHEIGHT.compact;
	      }
	    }
		var pageLengthMenu = Math.floor(tableHeight / tableRowHeight)-1;
		var mainTableConfig = 
		{
			/*data:{
				src:			config.table.ajax.src,
				type: 			config.table.ajax.type, //GET POST
				dataSrc:		config.table.ajax.dataSrc,
				primaryID:		tableIdFeild,
				data:			listAjax.data, //参数对象{id:1,page:100}
				isServerMode:	config.table.ajax.isServerMode, //是否开启服务器模式
				isSearch:		true, //是否开启搜索功能
				isPage:			true, //是否开启分页
			},*/
			columns: config.table.field,
			ui: {
				pageLengthMenu: pageLengthMenu,
				isSingleSelect:false,
				isMulitSelect:true,
				pageChangeAfterHandler:function(obj){
					//sjj20190116  针对订阅消息
					nsTemplate.setRowStateByToPage({templateId:config.id,tableId:config.fullTableId});
				},
			}
		}
		//处理手机模板 block形态下单机事件问题 cy 20180903 start------------------
		if(config.table.params){
			if(config.table.params.displayMode == 'block'){
				config.table.displayMode = 'block';
			};
			if(config.table.params.clickHandler){
				mainTableConfig.ui.clickHandler = config.table.params.clickHandler;
			}
			if(config.table.params.selectMode){
				mainTableConfig.ui.selectMode = config.table.params.selectMode;
			}
		}
		//处理手机模板 block形态下单机事件问题 cy 20180903 end------------------
		if(config.table.displayMode === 'block'){
			mainTableConfig.ui.displayMode = 'block';
		}
		//补充主表table相关属性
		nsTemplate.setTableConfig(mainTableConfig);
		mainTableConfig.data.primaryKey = config.table.idField;
		//主表中btns的处理
		var tableBtnsArray = $.extend(true,[],config.table.btns);//克隆 
		tableBtnsArray = nsTemplate.getBtnArrayByBtns(tableBtnsArray);//得到按钮值
		//主表中tableRowBtns的按钮处理
		var tableRowsBtnArray = $.extend(true,[],config.table.tableRowBtns);//克隆 
		tableRowsBtnArray = nsTemplate.getBtnArrayByBtns(tableRowsBtnArray);//得到按钮值
		//主表中容器为mutli
		var tableFormContainerArray = [];
		//添加增删改查方法
		setTableSaveDataAction(tableBtnsArray,tableRowsBtnArray,tableFormContainerArray);
		//table单元格里自定义列按钮
		if(tableRowsBtnArray.length > 0){
			//转换成表格行内的按钮形式['tianjia':function(){},'shanchu':functionI(){}]
			var rowBtnsArray = [];
			for(var rowBtnI=0; rowBtnI<tableRowsBtnArray.length; rowBtnI++){
				var btns = $.extend(true,{},tableRowsBtnArray[rowBtnI]);
				var btnJson = {};
				btnJson[btns.text] = btns.handler;
				rowBtnsArray.push(btnJson);
			}
			var btnWidth = tableRowsBtnArray.length * 30 + 10;
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
			//如果最后一个是按钮删除重新赋值目的为了防止重复多次添加操作
			for(var tColumnI=0; tColumnI<mainTableConfig.columns.length; tColumnI++){
				if(mainTableConfig.columns[tColumnI].field == 'nsTemplateButton'){
					mainTableConfig.columns.splice(tColumnI,1);
				}
			}
			mainTableConfig.columns.push(customerBtnJson);
		}
		if(isContainerBlockTable == true){
			//含有自定义组件是表格 sjj20181213
			mainTableConfig.ui.pageLengthMenu = 5;
		}
		layoutJson['tableJson'] = mainTableConfig;
		//主表panel的container
		var tableTitleStr = config.table.title;
		if(typeof(tableTitleStr)!='string'){
			//无论是否有标题都要输出空格
			tableTitleStr = '&nbsp;';
		}
		var isSingleMode = true;
		if(tableFormContainerArray.length > 0){
			if(typeof(config.table.add.isSingleMode)=='boolean'){
				isSingleMode = config.table.add.isSingleMode;
			}
		}
		layoutJson.maincontainer = {
			title:tableTitleStr,
			btns:tableBtnsArray,
			isSingleMode:isSingleMode
		}
		if(tableFormContainerArray.length > 0){
			layoutJson.maincontainer.forms = tableFormContainerArray;
		}
		//layout的回调函数 level参数暂无处理
		function layoutAfterHandler(layoutData){
			for(var funcI = 0; funcI<layoutAfterHandlerArray.length; funcI++){
				var callbackObj = layoutAfterHandlerArray[funcI]
				callbackObj.function(layoutData);
			}
			refreshMainTableData();
		}

		// if(layoutJson.tableJson.ui.selectMode == 'none'){
		// 	delete layoutJson.tableJson.ui.isSingleSelect;
		// 	delete layoutJson.tableJson.ui.isMulitSelect;
		// }
		// 初始化之前执行的函数 lyw 20181031
		if(typeof(config.initBeforeHandler)=='function'){
			config.initBeforeHandler(config);
		}
		nsLayout.init(config.id, {afterHandler:layoutAfterHandler});
	}
	//获取Layout的html
	function getLayoutHtml() {
		//主表业务组件附加的class属性，属性值是组件类型
		var tablePanelClass = '';
		if(config.table.add){
			if(config.table.add.serviceComponent){
				tablePanelClass = ' class:' + config.table.add.serviceComponent.type;
			}
		}
		//主表layout
		var tableHtml = 
			'<panel '
				+ 'ns-id="singleTable" '
				+ 'ns-options="'
					+'col:12, '
					+ tablePanelClass
				+ '" '
				+ 'ns-container="maincontainer" '
				+ 'ns-config="table:tableJson">'
			+'</panel>';
		var optionsStr = 'templates:singleTable';
		if (config.mode) {
			optionsStr += ',mode:' + config.mode;
		}
		if (config.isShowHistoryBtn) {
			optionsStr += ',isShowHistoryBtn:true'
		} else {
			optionsStr += ',isShowHistoryBtn:false'
		}
		var layoutHtml = 
			'<layout id="' + config.id + '" ns-package="' + config.package + '" ns-options="' + optionsStr + '">' 
				+ tableHtml 
			+ '</layout>';
		return layoutHtml 
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