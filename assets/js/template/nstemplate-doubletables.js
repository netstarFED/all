/******************** 主附表关联模板 start  cy 20180508 ***********************/
nsTemplate.templates.doubleTables = (function() {
	var originalTemplateConfig = {};
	var currentData = {}; 				//当前业务对象
	var currentList = []; 				//当前业务对象列表
	var currentListDatas = {}; 			//当前主表列表对象，用id（mianTableIdField）访问

	var currentChildData = {}; 			//当前子表操作对象
	var currentChildList = []; 			//当前子表列表
	var currentChildListDatas = {}; 	//当前子表列表

	var config = {};

	var mainTableKey = ''; //主表key
	var mainTableIdFeild = ''; //主表主键id
	var childTableKey = ''; //子表key
	var childTableIdFeild = ''; //子表主键id
	var childTableParentIdFeild = ''; //子表的父键id 一般不用

	//regexp标签测试
	var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
	//layout初始完成后的回调函数集合
	var layoutAfterHandlerArray = [];
	var optionsConfig = {
		dialogBeforeHandler:dialogBeforeHandler,
		ajaxBeforeHandler:ajaxBeforeHandler,
		ajaxAfterHandler:ajaxAfterHandler,
		loadPageHandler:loadPageHandler,
		closePageHandler:closePageHandler,
		delChildBtnHandler:delChildBtnHandler
	};
	//删除子表自定义的按钮 针对blocktable左上角的关闭图标添加事件
	function delChildBtnHandler(jsonData,configObj){
		var closeBtnAjax = configObj.functionConfig;
		var handler = configObj.handler;
		var obj = handler.dialogBeforeHandler(jsonData,'DELETE');
		var paramsObj = $.extend(true,{},obj.value);
		var optionsObj = {
			dialogBeforeHandler:{
				btnOptionsConfig:obj.btnOptionsConfig,
				selectData:paramsObj,
				containerFormJson:obj.containerFormJson
			},
			pageParam:config.pageParam
		};
		optionsObj = handler.ajaxBeforeHandler(optionsObj);
		var listAjax = nsVals.getAjaxConfig(closeBtnAjax,paramsObj,optionsObj);
		listAjax.plusData = {
			delChildBtnHandler:handler.delChildBtnHandler,
			dataSrc:closeBtnAjax.dataSrc
		};
		nsVals.ajax(listAjax,function(res,ajaxData){
			var resData = res;
			if(typeof(ajaxData.dataSrc)=='string'){
				resData = res[ajaxData.dataSrc];
			}
			delete resData.objectState;
			var idField = config.table.main.idField;
			//主表对应行刷新数据
			nsList.rowEdit(config.fullMainTableId, resData, {isUseNotInputData:true, queryMode:'field', queryValue:idField});
			//刷新子表
			var childArrayData = nsTemplate.getDataByObjectState(resData[config.table.child.keyField]);
			nsList.blockTable.data[config.fullChildTableId].dataConfig.dataSource = childArrayData;
			nsList.blockTable.getHtml(config.fullChildTableId,childArrayData);
			//更新 当前对象
			currentData = resData;
			currentData[config.table.child.keyField] = childArrayData;
			nsTable.setSelectRows(config.fullMainTableId,currentData[mainTableIdFeild]);
		});
	}
	//弹框调用前置方法
	function dialogBeforeHandler($btn,operatorFlag){
		/*
			*$btn 行内按钮和外部按钮
			    *外部按钮是个dom对象元素
			    *行内按钮是object对象（应用在table行按钮）
		*/
		var btnFlagField = 'objectCheckState';//存在字段标记，不存在默认读取选中标记
		if(operatorFlag){
			//如果存在自定义的flag标识  必须是DELETE EDIT ADD 
			switch(operatorFlag){
				case 'DELETE':
				case 'EDIT':
				case 'ADD':
					btnFlagField = operatorFlag;
					break;
			}
		}
		var data = $btn;
		var isOuterBtn = false;//是否外部按钮
		var currentOperator = '';//当前操作是主表还是附表
		var idField = config.table.main.idField;
		var keyField = config.table.main.keyField;
		if($btn[0]){
			//外部按钮
			isOuterBtn = true;
		}
		var allParamData = {
			mainList:[],	//主表list
			mainVo:{},//当前vo
			mainForm:{},//主表表单
			childList:[],//子表list
			childForm:{}//子表表单
		}//sjj20181030
		//主表选中
		function selectedHandler(tableId,configObj){
			var selectData;	//返回值
			switch(tableId){
				case config.fullMainTableId:
					//主表
					currentOperator = 'main';
					if(isOuterBtn){
						selectData = baseDataTable.getSingleRowSelectedData(config.fullMainTableId,false);//获取主表行选中数据	
					}else{
						//行内按钮
						selectData = configObj.data;
					}
					break;
				case config.fullChildTableId:
					//附表
					currentOperator = 'child';
					idField = config.table.child.idField;
					keyField = config.table.child.keyField;
					if(isOuterBtn){
						switch(config.table.child.params.displayMode){
							case 'table':
								selectData = baseDataTable.getTableSelectData(config.fullChildTableId,false);//获取子表行选中数据
								break;
							case 'block':
								selectData = nsList.blockTable.rowData[config.fullChildTableId].data;
								break;
						}
					}else{
						//行内按钮
						selectData = configObj.data;
					}
					break;
			}
			if(selectData){
				//有选中值存在
				switch(currentOperator){
					case 'main':
						//主表
						allParamData.mainList = [$.extend(true,{},selectData)];
						var childData = [];//获取子表行选中数据
						switch(config.table.child.params.displayMode){
							case 'table':
								childData = baseDataTable.getTableSelectData(config.fullChildTableId,false);//获取子表行选中数据
								break;
							case 'block':
								childData = nsList.blockTable.rowData[config.fullChildTableId].data;
								break;
						}
						if(childData){
							for(var checkI=0; checkI<childData.length; checkI++){
								if(btnFlagField == 'objectCheckState'){
									childData[checkI].objectCheckState = 1;
								}else{
									childData[checkI].objectState = NSSAVEDATAFLAG[btnFlagField];
								}
							}
							selectData[childTableKey] = childData;
							allParamData.childList = childData;
							allParamData.mainVo = selectData;
						}
						break;
					case 'child':
						//子表
						var childData = [];
						if($.isArray(selectData)){
							childData = $.extend(true,[],selectData);
						}else{
							childData.push($.extend(true,{},selectData));
						}
						var childTableData = currentData;
						for(var checkI=0; checkI<childData.length; checkI++){
							if(btnFlagField == 'objectCheckState'){
								childData[checkI].objectCheckState = 1;
							}else{
								childData[checkI].objectState = NSSAVEDATAFLAG[btnFlagField];
							}
						}
						childTableData[childTableKey] = childData;
						selectData = childTableData;
						allParamData.childList = childData;
						allParamData.mainVo = childTableData;
						allParamData.mainList = childTableData;
						break;
				}
				delete selectData.nsTemplateButton;//删除不需要存储的字段
			}else{
				if($btn.controllerObj.defaultMode == 'toPage'){
					selectData = currentData;
				}else{
					selectData = false;
				}
			}
			return selectData;
		}
		data.containerFormJson = {};
		var formId;
		//附表选中
		if(isOuterBtn){
			//外部按钮
			//当前按钮操作是主表还是附表
			var navId = $btn.closest('.nav-form').attr('id');
			var containerId = navId.substring(0,navId.lastIndexOf('-'));
			var tableId = 'table-'+containerId;
			formId = containerId+'-customerform';
			data.value = selectedHandler(tableId);
		}else{
			//行内按钮
			//直接返回当前行的数据
			formId = data.tableId.substring(data.tableId.indexOf('-')+1,data.tableId.length)+'-customerform';
			data.value = selectedHandler($btn.tableId,{data:$.extend(true,{},$btn.rowData)});
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
		//sjj20181029  ajaxDataParamSource
		if(typeof(data.controllerObj)=='object'){
			if(typeof(data.controllerObj.ajaxDataParamSource)=='string'){
				if(data.controllerObj.ajaxDataParamSource == 'all'){
					//value值为整个界面所有可获取的值
					var mainFormId = config.fullMainTableId.substring(config.fullMainTableId.indexOf('-')+1,config.fullMainTableId.length)+'-customerform';
					var childFormId = config.fullChildTableId.substring(config.fullChildTableId.indexOf('-')+1,config.fullChildTableId.length)+'-customerform';
					if($('#'+mainFormId).length > 0){
						allParamData.mainForm = nsTemplate.getChargeDataByForm(mainFormId,false);
					}
					if($('#'+childFormId).length > 0){
						allParamData.childForm = nsTemplate.getChargeDataByForm(childFormId,false);
					}
					data.value = allParamData;
				}
			}
		}
		return data;
	}
	//弹框ajax保存前置方法
	function ajaxBeforeHandler(handlerObj){
		//格式化函数需要添加下面的属性，目前只添加了一个主附表模板
		handlerObj.config = config;
		handlerObj.ajaxConfigOptions = {
			idField:config.table.main.idField,
			child:{
				idField:childTableIdFeild,
				keyField:childTableKey,
				pageParam:config.pageParam
			},
			pageParam:config.pageParam,
			parentObj:config.parentObj
		};
		return handlerObj;
	}
	//弹框ajax保存后置方法
	function ajaxAfterHandler(res,obj){
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
		var plusObj = typeof(obj)=='object' ? obj : {};
		switch(res.objectState){
			case NSSAVEDATAFLAG.DELETE:
				//删除
				//主表值删除数据 附表全部删除
				if(plusObj.tableId == config.fullChildTableId){
					refreshChildTable(res[childTableKey]);
				}else{
					nsList.delById(config.fullMainTableId, res);
					refreshChildTable([]);
				}
				break;
			case NSSAVEDATAFLAG.EDIT:
				//修改
				delete res.objectState;
				nsList.rowEdit(config.fullMainTableId, res, {isUseNotInputData:true});
				refreshChildTable(res[childTableKey]);
				break;
			case NSSAVEDATAFLAG.ADD:
				//添加
				delete res.objectState;
				nsList.rowEdit(config.fullMainTableId, res, {isUseNotInputData:true});
				refreshChildTable(res[childTableKey]);
				break;
			case NSSAVEDATAFLAG.VIEW:
				//刷新
				getMainTableData({});
				//baseDataTable.reloadTableAJAX(config.fullMainTableId);
				//refreshChildTable[res[childTableKey]];
				break;
		}
		//sjj20181030 如果返回值是数组直接刷新表格
		if($.isArray(res)){
			//刷新
			refreshMainTableData(res);
		}
	}
	//sjj20181030 刷新主表数据
	function refreshMainTableData(data){
		var listData = data;
		//验证 dataSrc是否设置正确
		if(typeof(listData)=='undefined'){
			console.error('config.table.main.ajax.dataSrc : '+config.table.main.ajax.dataSrc+' 与返回数据不匹配');
			console.error(res);
			return false;
		}
		listData = nsTemplate.getDataByObjectState(listData);
		//验证 返回数据与config的设置
		if(listData.length > 0){
			if(debugerMode){
				//主表返回数据验证 只验证了第一条
				if(typeof(listData[0])=='object'){
					//挨个查找字段是否与返回数据匹配
					var errorFieldName = '';
					for(var fieldI = 0; fieldI < config.table.main.field.length; fieldI++ ){
						var fieldName = config.table.main.field[fieldI].field;
						if(typeof(listData[0][fieldName])=='undefined'){
							if(fieldName.indexOf('nsTemplate')==0){
								//系统添加字段，不需要验证
							}else{
								errorFieldName += ' '+fieldName;
							}
						}
					}
					// lyw 20180717
					// if(errorFieldName!= '' ){
					// 	console.error('主表field定义与模板配置不符，无法找到如下字段: '+errorFieldName);
					// 	console.error(res);
					// }
					//验证idField是否存在
					if(typeof(listData[0][mainTableIdFeild])=='undefined'){
						console.error('主表idField: '+mainTableIdFeild+'定义错误，无法找到该字段');
						console.error(res);
					}
				}else{
					console.error('返回数据错误');
					console.error(res);
				}
			}
		}
		
		var listDatas = {}; //键值对对象
		//保存到配置文件和当前列表对象
		nsTemplate.templates.doubleTables.data[config.id].list = listData;
		nsTemplate.templates.doubleTables.data[config.id].listDatas = listDatas;
		currentList = listData;
		currentListDatas = listDatas;
		//生成表格用数据
		var dataSourceArray = [];
		for (var listI = 0; listI < listData.length; listI++) {
			listDatas[listData[listI][mainTableIdFeild]] = listData[listI];
			dataSourceArray.push(listData[listI]);
		}
		//刷新主表后选中第一行，并刷新子表
		var actionConfig = {
			isNeedAjax:true,
			selectedRow:0,
		}
		refreshMainTable(dataSourceArray);
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
		if($btn[0]){
			//外部按钮
			isOuterBtn = true;
		}
		if(isOuterBtn){
			var layoutId = $btn.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.doubleTables.data[layoutId].config;
		}else{
			var layoutId = $btn.obj.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.doubleTables.data[layoutId].config;
		}
		//设置默认值
		setDefault();
		//设置标题
		//setTitle();
		//设置常用变量
		mainTableIdFeild = config.table.main.idField; //主表主键id
		childTableKey = config.table.child.keyField; //子表key
		childTableIdFeild = config.table.child.idField; //子表主键id
		childTableParentIdFeild = config.table.child.parentIdField; //子表的父键id 一般不用
		getMainTableData({});
	}
	//清除变量
	function clearVals(){
		originalTemplateConfig = {};
		currentData = {}; 				//当前业务对象
		currentList = []; 				//当前业务对象列表
		currentListDatas = {}; 			//当前主表列表对象，用id（mianTableIdField）访问

		currentChildData = {}; 			//当前子表操作对象
		currentChildList = []; 			//当前子表列表
		currentChildListDatas = {}; 	//当前子表列表

		config = {};

		mainTableKey = ''; //主表key
		mainTableIdFeild = ''; //主表主键id
		childTableKey = ''; //子表key
		childTableIdFeild = ''; //子表主键id
		childTableParentIdFeild = ''; //子表的父键id 一般不用

		//regexp标签测试
		ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
		//layout初始完成后的回调函数集合
		layoutAfterHandlerArray = [];
	}
	//模板初始化
	function templateInit() {
		nsTemplate.templates.doubleTables.data = {};
		/* 保存在该对象上的数据分为四个：
		 * config(运行时参数)，
		 * original（原始配置参数），
		 * list（主列表），
		 * operationData（当前操作对象）
		 */
	}
	//配置文件验证
	function configValidate(_config) {
		var isValid = true;

		//整体参数验证
		var validArr =
			[
				['template', 'string', true], //模板
				['package', 'string', true], //包名
				['size', 'string'], //尺寸
				['nav', 'object'], //头部
				['saveData', 'object'], //通用保存数据方法的配置
				['table', 'object', true], //表格对象
				['col', 'array'], //两个表格的排列方式，默认为[12,12] 上下两个表格
			]
		isValid = nsDebuger.validOptions(validArr, _config);
		if (isValid == false) {
			return false;
		}
		//col验证
		if($.isArray(config.col)){
			if(config.col.length!=2){
				console.error('config.col必须是2个,且相加为12');
				return false;
			}else{
				if((config.col[0]+config.col[1])!=12){
					console.error('config.col必须是2个,且相加为12');
					return false;
				}
			}
		}
		//tabel对象配置参数
		var validArr =
			[
				['main', 'object', true], //主表
				['child', 'object', true], //附表
				['flagField', 'string'], //操作标识字段，默认objectState
			]
		isValid = nsDebuger.validOptions(validArr, _config.table);
		if (isValid == false) {
			return false;
		}

		//主表配置验证
		isValid = nsTemplate.validConfigByTable(_config.table.main, {isMainTable:true});
		if (isValid == false) {
			return false;
		}
		//子表配置验证
		isValid = nsTemplate.validConfigByTable(_config.table.child, {isMainTable:false});
		if (isValid == false) {
			return false;
		}

		//主表添加用途的业务组件验证
		var validArr = [
			['init', 'function', true], //业务组件初始化函数
		]
		if(_config.table.main.addComponent){
			isValid = nsDebuger.validOptions(validArr, _config.table.main.addComponent);
			if (isValid == false) {
				return false;
			}
		}
		//子表添加用途的业务组件验证
		var validArr = [
			['init', 'function', true], //业务组件初始化函数
		]
		if(_config.table.child.addComponent){
			isValid = nsDebuger.validOptions(validArr, _config.table.child.addComponent);
			if (isValid == false) {
				return false;
			}
		}
		validArr = [];
		return isValid;
	}
	//获取和设置标题 默认为菜单
	function setTitle() {
		var navId = config.id + '-' + config.layout.navId;
		if (config.title != 'unnamed') {
			$('#' + navId).children('.nav-title').html(config.title);
			return;
		}
		//独立页面获取标题
		function setTitleByURLPara(data) {
			var urlCurrentPageID = nsVals.getUrlPara().currentPageID;
			urlCurrentPageID = urlCurrentPageID.substr(1, urlCurrentPageID.length - 2)
			var urlPageIDArray = urlCurrentPageID.split(',');
			for (var i = 0; i < urlPageIDArray.length; i++) {
				urlPageIDArray[i] = parseInt(urlPageIDArray[i]);
			}
			var titleName = data[urlPageIDArray[0]].children[urlPageIDArray[1]].name;
			var subTitleName = data[urlPageIDArray[0]].name;
			var titleHtml = titleName + '<small>' + subTitleName + '</small>';
			$('#' + navId).children('.nav-title').html(titleHtml);
		}
		//异步加载页面获取标题
		function getTitleByMenu() {
			//临时写的，不完整 cy 2018320
			var titleHtml = $('#main-menu').children('li.opened').children('ul').children('li.opened').children('a').children('span').html();
			setTimeout(function() {
				$('#' + navId).children('.nav-title').html(titleHtml);
			}, 50)
		}
		if (mainmenu.dataGetReady) {
			getTitleByMenu();
		} else {
			mainmenu.loadedHandler = function(res) {
				setTitleByURLPara(res);
			};
		}
	}
	//设置默认值
	function setDefault() {
		config = nsTemplate.setDefaultByTemplate(config);//默认值设置
		//layout的默认配置参数
		config.layout = {
			//layout中主表子表配置参数 id 和json配置对象
			mainTableId:		'main', //主表id
			mainTableJson:		'mainTableJson',
			childTableId:		'child',
			childTableJson:		'childTableJson',
		};
		config.fullTitleId = config.id+'-templateTitle';
		//横向和纵向布局
		config.isTableAutoHeight = false;
		config.modeParams = typeof(config.modeParams)=='object' ? config.modeParams : {};
		switch(config.mode){
			case 'horizontal':
				//modeParams = '{"leftCol":4}'
				config.col = [6,6];
				if(config.modeParams.leftCol){
					//定义了
					var rightCol = 12-config.modeParams.leftCol;
					config.col = [config.modeParams.leftCol,rightCol];
				}
				config.isTableAutoHeight = true;
				break;
			case 'block':
				config.col = [12,12];
				config.tableMainPageLengthMenu = 10;
				break;
			default:
				config.col = [12,12];
				break;
		}
		/*if(typeof(config.col)=='undefined'){
			config.col = [12,12]
			config.isTableAutoHeight = false;
		}else{
			config.isTableAutoHeight = true;	
		}*/
		//表格配置
		config.table.main = nsTemplate.setDefalutByTable(config.table.main,optionsConfig);
		config.table.child = nsTemplate.setDefalutByTable(config.table.child,optionsConfig);
		//col默认值

		//追加配置参数
		var baseConfig = {
			browersystem: nsVals.browser.browserSystem, //浏览器类型
			mode: 'mode-' + config.mode, //子模版名字
			fullMainTableId: 'table-' + config.id + '-main', 	//完整的主表id
			fullChildTableId: 'table-' + config.id + '-child' 	//子表表格id
		}
		nsVals.extendJSON(config, baseConfig);
	}
	//设置主表的saveData的增删改查方法
	function setMainTableSaveDataAction(btnsArray,rowBtnsArray,formArray){
		//主表的新增方法
		if(config.table.main.add){
			switch(config.table.main.add.type){
				case 'dialog':
					var textArr = ['新增','保存并新增'];
					if(config.table.main.add.dialogBtnText){
						textArr = config.table.main.add.dialogBtnText.split('/');
					}
					var textAddStr = textArr[0];
					var textSaveStr = textArr[1] ? textArr[1] : '保存并新增';
					var addBtnConfig = {
						text:textAddStr,
						handler:function(ev){
							//需要对dialog的新增按钮添加方法
							config.table.main.add.dialogConfig.btns[0].handler = function(){
								var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
								if(dialogValue){
									saveDataMainAddAjax(dialogValue);
									//nsdialog.hide();
								}
							}
							config.table.main.add.dialogConfig.isValidSave = true;

							var addDialogConfig = $.extend(true,{},config.table.main.add.dialogConfig);
							//添加保存并新增按钮
							var addSaveBtnConfig = {
								text:textSaveStr,
								handler:function(ev){
									var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
									if(dialogValue){
										saveDataMainAddAjax(dialogValue,{
											afterHandler:function(){
												var refreshConfig = $.extend(true,{},config.table.main.add.dialogConfig);
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
					var serviceComponent = config.table.main.add.serviceComponent;
					var pageConfig = 
					{
						containerId: 	'container-panel-'+config.id + '-main',  //输出容器ID
						data_auth_code:config.data_auth_code,
						pageParam:config.pageParam
					}
					//自定义组件需要layout生成后执行，增加到回调数对象列表中
					layoutAfterHandlerArray.push({
						function:function(){
							serviceComponent.init(pageConfig, function(resData){
								saveDataMainAddAjax(resData);
							})
						},
						level:1, //数字越小优先级越小
					}) 
					break;
				case 'multi':
					var fieldArray = $.extend(true,[],config.table.main.add.field);
					for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
						formArray.push(fieldArray[fieldI]);
					}
					break;
			}
		}
		//主表的编辑方法
		var mainTableRowBtns = []; //要添加的表格行

		//主表的删除方法
		if(config.table.main.delete){
			switch(config.table.main.delete.type){
				case 'dialog':
					var editBtnConfig = {
						text:config.table.main.delete.text,
						handler:function(data){
							//需要对dialog的修改按钮添加方法
							var dialogConfig = config.table.main.delete.dialogConfig;
							dialogConfig.btns[0].handler = function(){
									var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
									if(dialogValue){
										var $tr = data.obj.parents('tr');
										saveDataMainEditAjax(dialogValue, $tr);
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
					mainTableRowBtns.unshift(editBtnConfig);
					break;
				case 'confirm':
					var deleteBtnConfig = {
						text:config.table.main.delete.text,
						handler:function(data){
							//需要对dialog的删除按钮添加方法
							var confirmTitle = nsVals.getTextByFieldFlag(config.table.main.delete.title,data.rowData);
							nsconfirm(confirmTitle, function(res){
								if(res){
									var $tr = data.obj.parents('tr');
									saveDataMainDeleteAjax(data.rowData, $tr);
								}
							},'warning')
						},
						sourceType:'saveData'
					}
					mainTableRowBtns.unshift(deleteBtnConfig);
					break;
			}
		}
		if(config.table.main.edit){
			switch(config.table.main.edit.type){
				case 'dialog':
					var editBtnConfig = {
						text:config.table.main.edit.text,
						handler:function(data){
							//需要对dialog的修改按钮添加方法
							var dialogConfig = config.table.main.edit.dialogConfig;
							dialogConfig.btns[0].handler = function(){
								var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
								if(dialogValue){
									var $tr = data.obj.parents('tr');
									saveDataMainEditAjax(dialogValue, $tr);
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
					mainTableRowBtns.unshift(editBtnConfig);
					break;
			}
		}
		//把行按钮添加过去 倒序添加
		for(var btnI=0; btnI<mainTableRowBtns.length; btnI++){
			rowBtnsArray.push(mainTableRowBtns[btnI]);
		}		
	}
	//主表选中事件
	function mainTableSelectHandler(selectData) {
		console.warn(selectData)
		//selectData是主表选中事件返回的参数 obj是行 tableID是表格id
		var rowData = baseDataTable.table[selectData.tableID].row(selectData.obj[0]).data();
		var selectData = currentListDatas[rowData[mainTableIdFeild]];
		getModalData(selectData, 'onlyChild');
		//sjj 20180912 选中数据子表才可进行操作
		var containerId = 'container-panel-'+config.id+'-child';
		var btnId = config.id+'-btns';
		var $btn = $('#'+config.id+'-btns button');
		if($btn.length > 0){
			//禁用按钮
			nsButton.setAllDisable(btnId,false);
		}
		var $component = $('#'+containerId).children('.service-component');
		if($component.length > 0){
			//存在自定义组件
			$component.find('input[type="text"]').removeAttr('readonly');
			if($component.hasClass('quicktyping')){
				//快速录入组件
				if(config.table.child.add.serviceComponent){
					if(typeof(config.table.child.add.serviceComponent.refresh)=='function'){
						var pageConfig = {
							containerId:containerId,
							currentData:rowData,
							data_auth_code:config.data_auth_code,
							pageParam:config.pageParam
						};
						config.table.child.add.serviceComponent.refresh(pageConfig,function(resData){
							saveDataChildAddAjax(resData);
						});
					}else{
						nsUI.quicktyping.setFocus();
					}
				}
			}
		}
	}
	//主表取消选中事件
	function mainTableCancelSelectHandler(selectData) {
		console.warn(selectData)
		currentData = false;
		refreshChildTable([]);
		//sjj 20180912 取消主表选中子表事件不可进行操作
		//container-panel-nstemplate-layout-nserp-sale-doubleTables-child
		var containerId = 'container-panel-'+config.id+'-child';
		var btnId = config.id+'-btns';
		var $btn = $('#'+config.id+'-btns button');
		if($btn.length > 0){
			//禁用按钮
			nsButton.setAllDisable(btnId,true);
		}
		var $component = $('#'+containerId).children('.service-component');
		if($component.length > 0){
			//存在自定义组件
			$component.find('input[type="text"]').off('focus');
			$component.find('input[type="text"]').attr('readonly',true);
		}
	}
	

	//设置子表的默认saveData方法
	function setChildTableSaveDataAction(btnsArray,rowBtnsArray,formArray){
		//子表的新增方法
		if(config.table.child.add){
			switch(config.table.child.add.type){
				case 'dialog':
					var textArr = ['新增','保存并新增'];
					if(config.table.child.add.dialogBtnText){
						textArr = config.table.child.add.dialogBtnText.split('/');
					}
					var textAddStr = textArr[0];
					var textSaveStr = textArr[1] ? textArr[1] : '保存并新增';

					var addChildBtnConfig = {
						text:textAddStr,
						handler:function(ev){
							//sjj20181029 如果主表不存在选中行数据，子表不可进行新增操作 
							var selectedRowData = baseDataTable.getSingleRowSelectedData(config.fullMainTableId);
							var isReturn = true;
							if(selectedRowData){
								//值存在的前提
								isReturn = false;
							}
							if(isReturn){return false;}
							//需要对dialog的新增按钮添加方法
							config.table.child.add.dialogConfig.btns[0].handler = function(){
									var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
									if(dialogValue){
										saveDataChildAddAjax(dialogValue);
										//nsdialog.hide();
									}
								}
							config.table.child.add.dialogConfig.isValidSave = true;	
							// console.log(currentData);
							var dialogConfig = $.extend(true,{},config.table.child.add.dialogConfig);
							for(var formI=0;formI<dialogConfig.form.length;formI++){
								var formConfig = dialogConfig.form[formI];
								if(typeof(formConfig.data)=='object'){
									var formatData = nsVals.getVariableJSON(formConfig.data,currentData);
									if(formatData){
										formConfig.data = formatData;
									}else{
										console.error('组件data配置错误');
										console.error(formConfig);
									}
								}
							}
							//
							//添加保存并新增按钮
							var addSaveBtnConfig = {
								text:textSaveStr,
								handler:function(ev){
									var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
									if(dialogValue){
										saveDataChildAddAjax(dialogValue,{
											afterHandler:function(){
												var refreshConfig = $.extend(true,{},config.table.child.add.dialogConfig);
												nsdialog.refresh(refreshConfig,{});
											}
										});
									}
								},
								sourceType:'saveData'
							}
							dialogConfig.btns.splice(1,0,addSaveBtnConfig);
							nsdialog.initShow(dialogConfig);
						}
					}
					btnsArray.unshift(addChildBtnConfig);
					break;
				case 'component':
					//激活组件，绑定回调方法
					var serviceComponent = config.table.child.add.serviceComponent;
					var pageConfig = 
					{
						containerId: 	'container-panel-'+config.id + '-child',  //输出容器ID
						data_auth_code:config.data_auth_code,
						pageParam:config.pageParam
					}
					//自定义组件需要layout生成后执行，增加到回调数对象列表中
					layoutAfterHandlerArray.push({
						function:function(){
							serviceComponent.init(pageConfig, function(resData){
								saveDataChildAddAjax(resData);
							})
						},
						level:1, //数字越小优先级越小
					}) 
					break;
				case 'multi':
					var fieldArray = $.extend(true,[],config.table.child.add.field);
					for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
						formArray.push(fieldArray[fieldI]);
					}
					break;
			}
		}
		/********sjj 20180810 批量添加操作**************/
		if(config.table.child.multiAdd){
			switch(config.table.child.multiAdd.type){
				case 'component':
					//激活组件，绑定回调方法
					var serviceComponent = config.table.child.multiAdd.serviceComponent;
					var pageConfig = 
					{
						containerId: 	'container-panel-'+config.id + '-child',  //输出容器ID
						data_auth_code:config.data_auth_code,
						pageParam:config.pageParam
					}
					//自定义组件需要layout生成后执行，增加到回调数对象列表中
					layoutAfterHandlerArray.push({
						function:function(){
							serviceComponent.init(pageConfig, function(resData){
								saveDataChildMultiAddAjax(resData);
							})
						},
						level:1, //数字越小优先级越小
					}) 
					break;
			}
		}
		//子表的编辑方法
		var childTableRowBtns = []; //要添加的表格行
		//子表的删除方法
		if(config.table.child.delete){
			switch(config.table.child.delete.type){
				case 'dialog':
					var editBtnConfig = {
						text:config.table.child.delete.text,
						handler:function(data){
							//需要对dialog的修改按钮添加方法
							var dialogConfig = config.table.child.delete.dialogConfig;
							dialogConfig.btns[0].handler = function(){
									var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
									if(dialogValue){
										var $tr = data.obj.parents('tr');
										saveDataChildEditAjax(dialogValue, $tr);
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
					childTableRowBtns.unshift(editBtnConfig);
					break;
				case 'confirm':
					var deleteBtnConfig = {
						text:config.table.child.delete.text,
						handler:function(data){
							console.log(data);
							//需要对dialog的修改按钮添加方法
							var confirmTitle = config.table.child.delete.title;
							nsconfirm(confirmTitle, function(res){
								if(res){
									var $tr = data.obj.parents('tr');
									saveDataChildDeleteAjax(data.rowData, $tr);
								}
							},'warning')
						},
						sourceType:'saveData'
					}
					childTableRowBtns.unshift(deleteBtnConfig);
					break;
			}
		}
		//子表的编辑方法
		if(config.table.child.edit){
			switch(config.table.child.edit.type){
				case 'dialog':
					var editBtnConfig = {
						text:config.table.child.edit.text,
						handler:function(data){
							//需要对dialog的修改按钮添加方法
							var dialogConfig = $.extend(true,{},config.table.child.edit.dialogConfig);
							dialogConfig.btns[0].handler = function(){
									var dialogValue = nsTemplate.getChargeDataByForm('dialog-template');
									if(dialogValue){
										var $tr = data.obj.parents('tr');
										saveDataChildEditAjax(dialogValue, $tr);
										//nsdialog.hide();
									}
								}
							for(var fieldI = 0; fieldI<dialogConfig.form.length; fieldI++){
								var fieldData = dialogConfig.form[fieldI];
								fieldData.value = data.rowData[fieldData.id];
								if(typeof(fieldData.data)=='object'){
									var formatData = nsVals.getVariableJSON(fieldData.data,currentData);
									if(formatData){
										fieldData.data = formatData;
									}else{
										console.error('组件data配置错误');
										console.error(fieldData);
									}
								}
							}
							dialogConfig.isValidSave = true;
							nsdialog.initShow(dialogConfig);
						},
						sourceType:'saveData'
					}
					childTableRowBtns.unshift(editBtnConfig);
					break;
			}
		}
		//把行按钮添加过去 倒序添加
		for(var btnI=0; btnI<childTableRowBtns.length; btnI++){
			rowBtnsArray.push(childTableRowBtns[btnI]);
		}		
	}
	//获取Layout的html
	function getLayoutHtml() {
		//主表业务组件附加的class属性，属性值是组件类型
		var mainTablePanelClass = '';
		if(config.table.main.add){
			if(config.table.main.add.serviceComponent){
				mainTablePanelClass = ' class:' + config.table.main.add.serviceComponent.type;
			}
		}
		var titleHtml = '';
		if(config.isShowTitle){
			//标题设置为显示
			titleHtml = '<panel ns-id="templateTitle"></panel>'; 
		}
		var colArray = config.col;
		var mainTableOptionStr = colArray[0];
		var childTableOptionStr = colArray[1];
		//主表layout
		var mainTableHtml = 
			'<panel '
				+ 'ns-id="' + config.layout.mainTableId +'" '
				+ 'ns-options="'
					+'col:'+mainTableOptionStr+', '
					+ mainTablePanelClass
				+ '" '
				+ 'ns-container="maincontainer" '
				+ 'ns-config="table:' + config.layout.mainTableJson + '">'
			+'</panel>';
		//子表业务组件附加的class属性，属性值是组件类型
		var childTablePanelClass = '';
		if(config.table.child.addComponent){
			childTablePanelClass = ' class:' + config.table.child.addComponent.type;
		}
		//子表layout
		var childTableHtml = 
			'<panel '
				+ 'ns-id="' + config.layout.childTableId +'" '
				+ 'ns-options="'
					+'col:'+childTableOptionStr+', '
					+ childTablePanelClass
				+ '" '
				+ 'ns-container="childcontainer" '
				+ 'ns-config="table:' + config.layout.childTableJson + '">'
			+'</panel>';
		var optionsStr = 'templates:doubleTables';
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
				+titleHtml
				+ mainTableHtml 
				+ childTableHtml
			+ '</layout>';
		return layoutHtml 
	}
	//子表选中事件
	function childTableSelectHandler(selectData) {
		//selectData是主表选中事件返回的参数 obj是行 tableID是表格id
		var rowData = {};
		switch(config.table.child.params.displayMode){
			case 'table':
				rowData = baseDataTable.table[selectData.tableID].row(selectData.obj[0]).data();
				break;
			case 'block':
				var nsIndex = selectData.obj.attr('nsindex');
				// rowData = nsList.blockTable.originalRowsData[selectData.tableID][nsIndex];
				rowData = nsList.blockTable.data[selectData.tableID].dataConfig.dataSource[nsIndex];
				break;
		}
		currentChildData = currentData[childTableKey][rowData.nsChildIndex];
		//控制是否选中标签
		for (var childI = 0; childI < currentData[childTableKey].length; childI++) {
			//id相等则添加标识
			if (currentData[childTableKey][childI][childTableIdFeild] == rowData[childTableIdFeild]) {
				currentData[childTableKey][childI][NSCHECKEDFLAG.KEY] = NSCHECKEDFLAG.VALUE;
			}else{
			//不相等则删除标识
				if(currentData[childTableKey][childI][NSCHECKEDFLAG.KEY]!='undefined'){
					delete currentData[childTableKey][childI][NSCHECKEDFLAG.KEY];
				}
			}
		}
	}
	//子表取消选中事件
	function childTableCancelSelectHandler(selectData) {
		//控制是否选中标签
		for (var childI = 0; childI < currentData[childTableKey].length; childI++) {
			if(currentData[childTableKey][childI][NSCHECKEDFLAG.KEY]!='undefined'){
				delete currentData[childTableKey][childI][NSCHECKEDFLAG.KEY];
			}
		}
	}
	//创建模板JSON对象
	function createLayoutJson() {
		var layoutJson = eval(config.package + '={}');
		var mainPageLengthMenu = 5;
		var childPageLengthMenu = 10;
		if(config.tableMainPageLengthMenu){
			mainPageLengthMenu = config.tableMainPageLengthMenu;
		}
		if(config.isTableAutoHeight){
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
			mainPageLengthMenu = pageLengthMenu;
			childPageLengthMenu = pageLengthMenu;
		}else{
			//表格高度  不包含标题栏(和搜索栏在同一行) 和表格底部操作栏
			var tableRowHeight = NSPAGEPARTHEIGHT.wide;
			if(typeof(nsUIConfig)=='object'){
				if(nsUIConfig.tableHeightMode == 'compact'){
					tableRowHeight = NSPAGEPARTHEIGHT.compact;
				}
			}
			var tableHeight = NSPAGEPARTHEIGHT.nav+30+NSPAGEPARTHEIGHT.title+NSPAGEPARTHEIGHT.footer;
			tableHeight = tableHeight + tableRowHeight*5 + 160 ;
			var windowHeight = $(window).height();
			var pageLengthMenu = Math.floor((windowHeight-tableHeight)/tableRowHeight)-1;
			childPageLengthMenu = pageLengthMenu;
		}
		//主表config定义
		var mainTableConfig = 
		{
			columns: config.table.main.field,
			ui: {
				pageLengthMenu: mainPageLengthMenu,
				onSingleSelectHandler: mainTableSelectHandler,
				onUnsingleSelectHandler: mainTableCancelSelectHandler,
				displayMode:config.table.main.params.displayMode,
				pageChangeAfterHandler:function(obj){
					//点击翻页主表取消行选中子表信息清空
					refreshChildTable([]);
					var $trObj = baseDataTable.container[config.fullMainTableId].tableObj.children('tbody').children('tr');
					$trObj.removeClass('selected');
					//sjj20190116  针对订阅消息
					nsTemplate.setRowStateByToPage({templateId:config.id,tableId:config.fullMainTableId});
				},
			}
		}
		//补充主表tab相关属性
		nsTemplate.setTableConfig(mainTableConfig);
		mainTableConfig.data.primaryKey = config.table.main.idField;
		//主表中btns的处理
		var mainTableBtnsArray = $.extend(true,[],config.table.main.btns);//克隆 
		mainTableBtnsArray = nsTemplate.getBtnArrayByBtns(mainTableBtnsArray);//得到按钮值
		//主表中tableRowBtns的按钮处理
		var mainTableRowsBtnArray = $.extend(true,[],config.table.main.tableRowBtns);//克隆 
		mainTableRowsBtnArray = nsTemplate.getBtnArrayByBtns(mainTableRowsBtnArray);//得到按钮值
		var mainTableFormArray = [];//form元素
		//添加增删改查方法
		setMainTableSaveDataAction(mainTableBtnsArray,mainTableRowsBtnArray,mainTableFormArray);
		//table单元格里自定义列按钮
		if(mainTableRowsBtnArray.length > 0){
			//转换成表格行内的按钮形式['tianjia':function(){},'shanchu':functionI(){}]
			var rowBtnsArray = [];
			for(var rowBtnI=0; rowBtnI<mainTableRowsBtnArray.length; rowBtnI++){
				var btns = $.extend(true,{},mainTableRowsBtnArray[rowBtnI]);
				var btnJson = {};
				btnJson[btns.text] = btns.handler;
				rowBtnsArray.push(btnJson);
			}
			var btnWidth = mainTableRowsBtnArray.length * 30 + 10;
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
		layoutJson[config.layout.mainTableJson] = mainTableConfig;

		//子表config定义
		var childTableConfig = {
			columns: config.table.child.field,
			ui: {
				pageLengthMenu: childPageLengthMenu,
				isSingleSelect:false,
				isMulitSelect:true,
				onSingleSelectHandler: childTableSelectHandler,
				onUnsingleSelectHandler: childTableCancelSelectHandler,
				displayMode:config.table.child.params.displayMode
			}
		}
		//补充子表tab相关属性
		nsTemplate.setTableConfig(childTableConfig);
		childTableConfig.data.primaryKey = config.table.child.idField;
		//子表中btns的处理
		var childTableBtnsArray = $.extend(true,[],config.table.child.btns);//克隆 
		childTableBtnsArray = nsTemplate.getBtnArrayByBtns(childTableBtnsArray);//得到按钮值
		var childTableFormArray = [];//form元素
		//子表中tableRowBtns的按钮处理
		var childTableRowsBtnArray = $.extend(true,[],config.table.child.tableRowBtns);//克隆 
		childTableRowsBtnArray = nsTemplate.getBtnArrayByBtns(childTableRowsBtnArray);//得到按钮值
		setChildTableSaveDataAction(childTableBtnsArray,childTableRowsBtnArray,childTableFormArray);
		//table单元格里自定义列按钮
		if(childTableRowsBtnArray.length > 0){
			//转换成表格行内的按钮形式['tianjia':function(){},'shanchu':functionI(){}]
			var rowBtnsArray = [];
			for(var rowBtnI=0; rowBtnI<childTableRowsBtnArray.length; rowBtnI++){
				var btns = $.extend(true,{},childTableRowsBtnArray[rowBtnI]);
				var btnJson = {};
				btnJson[btns.text] = btns.handler;
				rowBtnsArray.push(btnJson);
			}
			var btnWidth = childTableRowsBtnArray.length * 30 + 10;
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
			for(var tColumnI=0; tColumnI<childTableConfig.columns.length; tColumnI++){
				if(childTableConfig.columns[tColumnI].field == 'nsTemplateButton'){
					childTableConfig.columns.splice(tColumnI,1);
				}
			}
			childTableConfig.columns.push(customerBtnJson);
		}
		layoutJson[config.layout.childTableJson] = childTableConfig;
		//主表panel的container
		var mainTableTitleStr = config.table.main.title;
		if(typeof(mainTableTitleStr)!='string'){
			//无论是否有标题都要输出空格
			mainTableTitleStr = '&nbsp;';
		}
		layoutJson.maincontainer = {
			//title:mainTableTitleStr,
			btns:mainTableBtnsArray,
			isSingleMode:true,
		}
		if(mainTableFormArray.length > 0){
			layoutJson.maincontainer.forms = mainTableFormArray;
			layoutJson.maincontainer.isSingleMode = typeof(config.table.main.add.isSingleMode)=='boolean'?config.table.main.add.isSingleMode:true;
		}
		//子表panel的container
		var childTableTitleStr = config.table.child.title;
		if(typeof(childTableTitleStr)!='string'){
			//无论是否有标题都要输出空格
			childTableTitleStr = '&nbsp;';
		}
		layoutJson.childcontainer = {
			//title:childTableTitleStr,
			btns:childTableBtnsArray,
			isSingleMode:true,
		}
		if(childTableFormArray.length > 0){
			layoutJson.childcontainer.forms = childTableFormArray;
			layoutJson.maincontainer.isSingleMode = typeof(config.table.child.add.isSingleMode)=='boolean'?config.table.child.add.isSingleMode:true;
		}
		layoutJson.config = config;
		//layout的回调函数 level参数暂无处理
		function layoutAfterHandler(layoutData){
			for(var funcI = 0; funcI<layoutAfterHandlerArray.length; funcI++){
				var callbackObj = layoutAfterHandlerArray[funcI]
				callbackObj.function(layoutData);
			}

			//测试用 要删除
			$('#'+config.fullMainTableId).children('tbody').children('tr').eq(0).addClass('tr-disabled');
		}
		// 模板初始化前置回调 cy 20181117
		if(typeof(config.beforeInitHandler)=='function'){
			config.beforeInitHandler(config);
		}

		nsLayout.init(config.id, {afterHandler:layoutAfterHandler});
		
		// 模板回调 lyw 20181018
		if(typeof(config.completeHandler)=='function'){
			config.completeHandler(config);
		}
		
		$('#'+config.fullTitleId).html('<div class="templateTitle">'+config.title+'</div>');
	}
	//初始化方法
	function init(_config) {
		//第一次执行初始化模板
		if (typeof(nsTemplate.templates.doubleTables.data) == 'undefined') {
			templateInit();
		}
		clearVals();
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
		nsTemplate.templates.doubleTables.data[config.id] = {
			original: originalTemplateConfig,
			config: config
		}

		//设置默认值
		setDefault();
		//设置标题
		//setTitle();
		//设置常用变量
		mainTableIdFeild = config.table.main.idField; //主表主键id
		childTableKey = config.table.child.keyField; //子表key
		childTableIdFeild = config.table.child.idField; //子表主键id
		childTableParentIdFeild = config.table.child.parentIdField; //子表的父键id 一般不用
		
		//生成html
		var html = getLayoutHtml();
		//围加根html
		html = nsTemplate.aroundRootHtml(html);
		//将html添加到页面
		nsTemplate.appendHtml(html);
		//创建模板JSON对象
		createLayoutJson();
		//刷新主表数据 没有附加参数
		getMainTableData({});
		currentData = {};
		currentData[config.table.mainField] = {};
		currentData[config.table.childField] = {};
		
		// 模板回调 lyw 20181018
		if(typeof(config.completeHandler)=='function'){
			config.completeHandler(config);
		}
	}
	//统一保存接口发送ajax
	function saveDataAjax(callbackFunction) {
		var configAjax = $.extend(true, {}, config.saveData.ajax);
		configAjax.url = configAjax.src;
		delete configAjax.src;
		//var ajaxData = $.extend(true, configAjax.data, currentData);

		//获取发送参数
		configAjax = nsVals.getAjaxConfig(configAjax,currentData,{idField:mainTableIdFeild,pageParam:config.pageParam}); 

		nsVals.ajax(configAjax, function(res) {
			saveDataRefresh(res);
			callbackFunction(res);
			var isCloseWindow = config.saveData.ajax.isCloseWindow;
			if(isCloseWindow){
				nsFrame.popPageClose(); 
			}
		});
	}
	//获取发送saveData的ajax
	function getSaveDataAjax(ajaxData){
		var saveDataAjax = $.extend(true, {}, config.saveData.ajax);
		var saveDataAjaxData = $.extend(true, saveDataAjax.data, ajaxData);
		if(config.saveData.ajax.type.toUpperCase() == 'GET'){
			//主要用于前端开发测试用
			saveDataAjax.data = saveDataAjaxData;
		}else{
			saveDataAjax.data = JSON.stringify(saveDataAjaxData);
			saveDataAjax.contentType = "application/json; charset=utf-8";
		}
		saveDataAjax.url = saveDataAjax.src;
		delete saveDataAjax.src;
		
		return saveDataAjax;
	}
	//主对象(主表)新增方法
	function saveDataMainAddAjax(inputData,dialogObj){

		nsList.rowAddForTempData({
			tableId:config.fullMainTableId, 	//表格id
			inputData:inputData, 				//新输入的值
			idField:mainTableIdFeild,  			//idField
			isSaveData:true, 					//是大对象保存
			keyField:'',  						//
			currentData:{}, 					//当前数据
			ajax:config.saveData.ajax, 			//ajax配置参数
			pageParam:config.pageParam,
			afterHandler:function(isAddSuccess,res){ 	//回调函数
				if(isAddSuccess){
					//主表添加成功之后删除objectState标识
					delete res.objectState;
					currentData = res;
					//如果子表数据未返回则视为空数组
					if(typeof(currentData[config.childTableKey])=='undefined'){
						currentData[childTableKey] = [];
					}
					currentListDatas[res[mainTableIdFeild]] = currentData;//sjj20180606新增一条主数据
					//刷新子表
					currentData[childTableKey] = nsTemplate.getDataByObjectState(currentData[childTableKey]);
					refreshChildTable(currentData[childTableKey]);
					if(dialogObj){
						dialogObj.afterHandler();
					}else{
						nsdialog.hide();
					}
					var isCloseWindow = config.table.main.add.isCloseWindow;
					if(isCloseWindow){
						nsFrame.popPageClose(); 
					}

					//sjj 20180912 选中数据子表才可进行操作
					var containerId = 'container-panel-'+config.id+'-child';
					var btnId = config.id+'-btns';
					var $btn = $('#'+config.id+'-btns button');
					if($btn.length > 0){
						//禁用按钮
						nsButton.setAllDisable(btnId,false);
					}
					var $component = $('#'+containerId).children('.service-component');
					if($component.length > 0){
						//存在自定义组件
						$component.find('input[type="text"]').removeAttr('readonly');
						if($component.hasClass('quicktyping')){
							//快速录入组件
							if(config.table.child.add.serviceComponent){
								if(typeof(config.table.child.add.serviceComponent.refresh)=='function'){
									var pageConfig = {
										containerId:containerId,
										currentData:currentData,
										data_auth_code:config.data_auth_code,
										pageParam:config.pageParam
									};
									config.table.child.add.serviceComponent.refresh(pageConfig,function(resData){
										saveDataChildAddAjax(resData);
									});
								}else{
									nsUI.quicktyping.setFocus();
								}
							}
						}
					}
				}
			},
		});
		
	}
	//主对象(主表)修改方法
	function saveDataMainEditAjax(inputData, $tr){
		//数据先添加到表格中
		//nsList.rowEdit(config.fullMainTableId, inputData, {isUseNotInputData:true, queryMode:'tr', queryValue:$tr});
		//添加修改标识
		inputData.objectState = NSSAVEDATAFLAG.EDIT;
		//获取发送方法参数
		/*var saveDataAjax = getSaveDataAjax(inputData);
		saveDataAjax.plusData = {
			tableId: config.fullMainTableId, 		//tableId
			dataSrc: config.saveData.ajax.dataSrc,	//saveData的dataSrc 用于取数据
			$tr:$tr, 								//当前行
		};*/
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax,inputData,{idField:mainTableIdFeild,pageParam:config.pageParam});
		saveDataAjax.plusData = {
			tableId: config.fullMainTableId, 		//tableId
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
				//主表添加成功之后删除objectState标识
				delete resRowData.objectState;
				//主表数据
				nsList.rowEdit(tableId, resRowData, {isUseNotInputData:true, queryMode:'tr', queryValue:$tr});
				//更新 当前对象
				currentData = res[dataSrc];
				currentData[childTableKey] = nsTemplate.getDataByObjectState(currentData[childTableKey]);
				var isCloseWindow = config.table.main.edit.isCloseWindow;
				if(isCloseWindow){
					nsFrame.popPageClose(); 
				}
			}	
		},true)
	}
	//主对象(主表)删除方法
	function saveDataMainDeleteAjax(inputData, $tr){
		//添加修改标识
		inputData.objectState = NSSAVEDATAFLAG.DELETE;
		

		//获取发送方法参数
		//var saveDataAjax = getSaveDataAjax(inputData);
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax,inputData,{idField:mainTableIdFeild,pageParam:config.pageParam});
		saveDataAjax.plusData = {
			tableId: config.fullMainTableId, 		//tableId
			idField: config.table.main.idField, 	//用于查找数据进行比对
			dataSrc: config.saveData.ajax.dataSrc,	//saveData的dataSrc 用于取数据
			$tr:$tr, 								//当前行
		};

		nsVals.ajax(saveDataAjax, function(res, ajaxObj){
			//处理返回数据
			var tableId = ajaxObj.plusData.tableId;
			var idField = ajaxObj.plusData.idField;
			var dataSrc = ajaxObj.plusData.dataSrc;
			var $tr = ajaxObj.plusData.$tr;
			var resRowData = res[dataSrc];
			//主表添加成功之后删除objectState标识
			delete resRowData.objectState;
			//如果当前删除行是选中行，则应当刷新子表
			var isSelectedRow = false;
			var selectedRowData = baseDataTable.getSingleRowSelectedData(tableId, false);
			if(selectedRowData){
				//值存在的前提
				//如果选中行和返回数据id相同，则需要在删除主表以后进一步处理
				if(selectedRowData[idField] == resRowData[idField]){
					isSelectedRow = true;
				}
			}
			currentData = {};
			//主表数据
			nsList.rowDelete(tableId, resRowData, {queryMode:'tr', queryValue:$tr});
			//从原始表格数据值删除数据 sjj start
			var originalMainArray = nsTable.originalConfig[tableId].dataConfig.dataSource;
			if(!$.isArray(originalMainArray)){originalMainArray = [];}
			var delMainIndex = -1;
			for(var i=0; i<originalMainArray.length; i++){
				if(originalMainArray[i][idField] = resRowData[idField]){
					//删除
					delMainIndex = i;
					break;
				}
			}
			if(delMainIndex != -1){
				originalMainArray.splice(delMainIndex,1);
			}
			//从原始表格数据值删除数据 sjj end
			//是否需要刷新子表 
			if(isSelectedRow){
				//如果需要则置空
				refreshChildTable([]);
			}else{
				if(originalMainArray.length > 0){
					nsTable.setSelectRows(tableId,originalMainArray[0][idField]);//设置选中行
				}
			}
			var isCloseWindow = config.table.main.delete.isCloseWindow;
			if(isCloseWindow){
				nsFrame.popPageClose(); 
			}
		})
	}
	//列表对象(子表)新增方法
	function saveDataChildAddAjax(inputData,dialogObj){
		//inputData 是输入数据 {name:'abc',number:3}
		var ajaxMainData = $.extend(true, {}, currentData);
		nsList.rowAddForTempData({
			tableId:config.fullChildTableId, 	//表格id
			inputData:inputData, 				//新输入的值
			idField:childTableIdFeild,  		//idField
			isSaveData:true, 					//是大对象保存
			keyField:childTableKey,  			//子表VOlist的name
			
			parentType:'list', 				//上级对象的类型 list(table等类型的数组)/modal（单一对象） 
			parentContainerId:config.fullMainTableId, //上级对象容器id 
			parentIdField:mainTableIdFeild, 	//上级对象容器idField
			pageParam:config.pageParam,
			currentData:ajaxMainData, 			//当前数据
			ajax:config.saveData.ajax, 			//ajax配置参数
			afterHandler:function(isAddSuccess,res){ 		//回调函数
				if(isAddSuccess){
					currentData = res;
					currentData[childTableKey] = nsTemplate.getDataByObjectState(currentData[childTableKey]);
					nsList.selectFirstRow(config.fullChildTableId);
					nsList.rowEdit(config.fullMainTableId, currentData, {isUseNotInputData:true, queryMode:'field', queryValue:config.table.main.idField});
					//nsTable.setSelectRows(config.fullMainTableId,currentData[mainTableIdFeild]);
					if(dialogObj){
						dialogObj.afterHandler();
					}else{
						nsdialog.hide();
					}
					var isCloseWindow = config.table.child.add.isCloseWindow;
					if(isCloseWindow){
						nsFrame.popPageClose(); 
					}
				}else{
					//如果存在失败返回信息目前仅支持单行数据的
					if(res){
						//根据返回失败的主键id定位到失败行并精确到页码 失败行用选中来定位
						var originalConfig = nsTable.originalConfig[config.fullChildTableId];
						var rowsData = originalConfig.dataConfig.dataSource;//总数据
						var selectedIndex = -1;//默认不存在
						for(var rowI=0; rowI<rowsData.length; rowI++){
							if(rowsData[rowI][childTableIdFeild] == res.childId){
								selectedIndex = rowI;//存在失败的下标
							}
						}
						if(selectedIndex == -1){
							console.error('无法定位到服务器返回数据对应的结果，主键id不存在');
							console.error(res);
							return false;
						}
						//根据返回下标计算该数据存在第几页
						var pageLengthMenu = originalConfig.uiConfig.pageLengthMenu;//每页显示条数
						var rowsLength = rowsData.length;//总条数
						var page = Math.ceil(selectedIndex);//根据行下标获取到该数据存在于第几页
						nsTable.table[config.fullChildTableId].page(page).draw(false);//跳转到该页码
						if(typeof(res.childId)=='string'){
							res.childId = [res.childId];
						}
						//nsTable.setSelectRows(config.fullChildTableId,res.childId);//设置选中行
					}else{
						console.error('无法定位到服务器返回数据对应的结果，主键id不存在');
						console.error(res);
						return false;
					}
					/*var colorObj = {};
					colorObj[childId] = 'selected';
					//colorObj[childId] = 'msg-'+res.state;
					nsTable.originalConfig[config.fullChildTableId].uiConfig.addColorByPrimaryId = {
						rowColor:colorObj
					}
					nsTable.refreshByID(config.fullChildTableId);*/
				}
			},
		});
	}
	//批量添加
	function saveDataChildMultiAddAjax(data){
		var array = $.extend(true,[],data.array);
		var ajaxMainData = $.extend(true, {}, currentData);
		nsList.rowMultiAddForTempData({
			tableId:config.fullChildTableId, 	//表格id
			inputData:data.array, 				//新输入的值
			idField:childTableIdFeild,  		//idField
			chargeField:config.table.child.multiAdd.chargeField,  	//chargeField
			isSaveData:true, 					//是大对象保存
			keyField:childTableKey,  			//子表VOlist的name
			
			parentType:'list', 				//上级对象的类型 list(table等类型的数组)/modal（单一对象） 
			parentContainerId:config.fullMainTableId, //上级对象容器id 
			parentIdField:mainTableIdFeild, 	//上级对象容器idField

			currentData:ajaxMainData, 			//当前数据
			ajax:config.saveData.ajax, 			//ajax配置参数
			afterHandler:function(res){ 		//回调函数
				currentData = res;
				currentData[childTableKey] = nsTemplate.getDataByObjectState(currentData[childTableKey]);
				//主表对应行刷新数据
				nsList.rowEdit(config.fullMainTableId, currentData, {isUseNotInputData:true, queryMode:'field', queryValue:config.table.main.idField});
				nsList.selectFirstRow(config.fullChildTableId);
				//nsTable.setSelectRows(config.fullMainTableId,currentData[config.table.main.idField]);
				var isCloseWindow = config.table.child.multiAdd.isCloseWindow;
				if(isCloseWindow){
					nsFrame.popPageClose(); 
				}
			},
		});
	}
	//列表对象(子表)修改方法
	function saveDataChildEditAjax(inputData,$tr){
		//处理新输入的数据
		var childData = baseDataTable.table[config.fullChildTableId].row($tr).data();
		nsList.clearDataTableRowData(childData);
		ajaxChildData = $.extend(true, childData, inputData);
		//添加修改标识
		ajaxChildData.objectState = NSSAVEDATAFLAG.EDIT;
		
		//主表数据添加objectState:NULL
		var ajaxData = $.extend(true, {}, currentData);
		ajaxData.objectState = NSSAVEDATAFLAG.NULL;
		
		
		//处理子表对象，添加objectState
		var childTableDataArray = ajaxData[config.table.child.keyField];
		var childTableIdFeild = config.table.child.idField;
		var isHaveField = false;
		for(var rowI = 0; rowI<childTableDataArray.length; rowI++){
			if(childTableDataArray[rowI][childTableIdFeild] == ajaxChildData[childTableIdFeild]){
				isHaveField = true;
				//正在修改的字段
				childTableDataArray[rowI] = ajaxChildData;
			}else{
				//没有发生改动的字段
				nsList.clearDataTableRowData(childTableDataArray[rowI]);
				childTableDataArray[rowI].objectState = NSSAVEDATAFLAG.NULL;
			}
		}
		if(!isHaveField){
			console.error('根据主键id没有找到要修改的数据');
			console.error(childTableDataArray);
			console.error(ajaxChildData);
		}
		//发送ajax
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax, ajaxData,{pageParam:config.pageParam});
		saveDataAjax.plusData = config;
		nsVals.ajax(saveDataAjax, function(res, ajaxObj){
			if(res.success){
				nsdialog.hide();
				//处理返回数据
				var _config = ajaxObj.plusData;
				var mainTableData = baseDataTable.table[config.fullMainTableId].data();
				var idField = _config.table.main.idField;
				var resData = res[_config.saveData.ajax.dataSrc];
				//主表对应行刷新数据
				nsList.rowEdit(config.fullMainTableId, resData, {isUseNotInputData:true, queryMode:'field', queryValue:idField});
				//刷新子表
				refreshChildTable(resData[config.table.child.keyField]);
				//更新 当前对象
				currentData = resData;
				currentData[_config.table.child.keyField] = nsTemplate.getDataByObjectState(resData[_config.table.child.keyField]);
				//nsTable.setSelectRows(config.fullMainTableId,currentData[mainTableIdFeild]);
				var isCloseWindow = config.table.child.edit.isCloseWindow;
				if(isCloseWindow){
					nsFrame.popPageClose(); 
				}
			}
		},true)
	}
	//列表对象(子表)删除方法
	function saveDataChildDeleteAjax(inputData, $tr){
		//添加删除标识
		nsList.clearDataTableRowData(inputData);
		var ajaxChildData = $.extend(true, {}, inputData);
		ajaxChildData.objectState = NSSAVEDATAFLAG.DELETE;
		//主表对象
		var ajaxData = $.extend(true, {}, currentData);
		ajaxData.objectState = NSSAVEDATAFLAG.NULL;
		
		//处理子表对象，添加objectState
		var childTableDataArray = ajaxData[config.table.child.keyField];
		var childTableIdFeild = config.table.child.idField;
		for(var rowI = 0; rowI<childTableDataArray.length; rowI++){
			if(childTableDataArray[rowI][childTableIdFeild] == ajaxChildData[childTableIdFeild]){
				//正在修改的字段
				childTableDataArray[rowI] = ajaxChildData;
			}else{
				//没有发生改动的字段
				nsList.clearDataTableRowData(childTableDataArray[rowI]);
				childTableDataArray[rowI].objectState = NSSAVEDATAFLAG.NULL;
			}
		}


		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax, ajaxData,{pageParam:config.pageParam});
		saveDataAjax.plusData = config;
		nsVals.ajax(saveDataAjax, function(res, ajaxObj){
			//处理返回数据
			var _config = ajaxObj.plusData;
			var mainTableData = baseDataTable.table[config.fullMainTableId].data();
			var idField = _config.table.main.idField;
			var resData = res[_config.saveData.ajax.dataSrc];
			//主表对应行刷新数据
			nsList.rowEdit(config.fullMainTableId, resData, {isUseNotInputData:true, queryMode:'field', queryValue:idField});
			//刷新子表
			refreshChildTable(resData[config.table.child.keyField]);
			//更新 当前对象
			currentData = resData;
			currentData[_config.table.child.keyField] = nsTemplate.getDataByObjectState(resData[_config.table.child.keyField]);
			//nsTable.setSelectRows(config.fullMainTableId,currentData[mainTableIdFeild]);
			var isCloseWindow = config.table.child.delete.isCloseWindow;
			if(isCloseWindow){
				nsFrame.popPageClose(); 
			}
		})
	}
	//清除无用的数据
	function setClearData(inputData){
		//删除无用的field字段
		$.each(inputData, function(key,value){
			if(key == 'id' && value ===''){
				delete inputData[key];
			}else if(key.indexOf('nsTemplate')==0){
				delete inputData[key];
			}
		})
	}
	function saveDataRefresh(res) {
		var $tbody = $('#' + config.fullMainTableId).children('tbody');
		if (currentData[config.table.mainField].id == res.modal[config.table.mainField].id) {
			var dataSource = baseDataTable.table[config.fullMainTableId].data();

			console.log(dataSource);

			for (var dsI = 0; dsI < dataSource.length; dsI++) {
				if (dataSource[dsI].id == res.modal[config.table.mainField].id) {
					console.log(dataSource[dsI]);
					for (var key in baseDataTable.table[config.fullMainTableId].data()[dsI]) {
						baseDataTable.table[config.fullMainTableId].data()[dsI][key] = res.modal[config.table.mainField][key];
					}
					baseDataTable.table[config.fullMainTableId].row($tbody.children('tr')[dsI]).data(res.modal[config.table.mainField]).draw(false);
				}
			}
			console.warn(baseDataTable.table[config.fullMainTableId].data());
			//baseDataTable.table[mainTableId].row($cTr).data(rowData).draw(false);
		} else {
			if (debugerMode) {
				console.error(
					'发送对象和返回对象数据id不一样\r\n 发送数据id：' +
					currentData[config.table.mainField].id + '\r\n 返回数据id：' +
					res.modal[config.table.mainField].id
				);
			}
		}
		// currentData = res.modal;
		// var fullMainTableId = config.fullMainTableId;
		// var $tbody = $('#'+fullMainTableId).children('tbody')
		// var $currentRow = $tbody.children('tr.selected');
		// if($currentRow.length == 0){
		// 	$currentRow = $tbody.children('tr')[0];
		// }
		// if($currentRow.length == 0){
		// 	console.error('找不到数据')
		// }
		// //console.log(baseDataTable.table[mainTableId].row($cTr).data);
		// console.log($currentRow.length);
		//baseDataTable.table[mainTableId].row($cTr).data(rowData).draw(false);
	}
	//刷新主表，更新整体数据
	function getMainTableData(ajaxPlusData) {
		//ajaxPlusData 是附加的ajax data参数
		/*var listAjaxData = getFormatAjaxData(ajaxPlusData, config.table.main.ajax);
		var listAjax = {
			url: config.table.main.ajax.src,
			type: config.table.main.ajax.type,
			data: listAjaxData
		}*/
		var listAjax = nsVals.getAjaxConfig(config.table.main.ajax,ajaxPlusData,{idField:mainTableIdFeild,keyField:config.table.main.keyField,pageParam:config.pageParam});
		nsVals.ajax(listAjax, function(res) {
			
			var listData = res[config.table.main.ajax.dataSrc]; //数组对象
			refreshMainTableData(listData);
			
		})
	}
	//刷新主表格 同时标识新的当前操作对象
	function refreshMainTable(dataSourceArray, actionConfig){
		//刷新表格
		var mainTableId = config.fullMainTableId;
		/*
		baseDataTable.originalConfig[mainTableId].dataConfig.dataSource = dataSourceArray;
		baseDataTable.refreshByID(mainTableId);*/
		nsList.refresh(mainTableId,dataSourceArray);

		
		//20190116 订阅消息
		nsTemplate.setProcessDataByWorkItemId(config);
		//子表动作参数 
		if(typeof(actionConfig)!='object'){
			var actionConfig = {
				isNeedAjax:true, 	//是否重新获取数据
				selectedRow:0, 		
			}
		}
		//获取选中行数据
		var selectedRowData = baseDataTable.getSingleRowSelectedData(mainTableId, false);
		//没有选中值，则选中第一行
		if (selectedRowData == null && dataSourceArray.length > 0) {
			$('#' + mainTableId).children('tbody').children('tr').eq(actionConfig.selectedRow).addClass('selected');
			selectedRowData = dataSourceArray[0];
		}
		//如果不是空表格就刷新下面的子表
		if (dataSourceArray.length > 0) {
			currentData = currentListDatas[selectedRowData[mainTableIdFeild]];
			//如果需要查询数据再填充
			if(actionConfig.isNeedAjax){
				getModalData(currentData, 'onlyChild');
			}else{
				//不需要查询，直接填充子表
				var childTableDataArray = currentData[childTableKey];
				//没返回子表数据则插入空数组
				if($.isArray(childTableDataArray)==false){
					childTableDataArray = [];
				}
				refreshChildTable(childTableDataArray);
			}
			//sjj 20180913 子表自定义组件是否存在刷新方法
			var containerId = 'container-panel-'+config.id+'-child';
			if(config.table.child.add.serviceComponent){
				if(typeof(config.table.child.add.serviceComponent.refresh)=='function'){
					var pageConfig = {
						containerId:containerId,
						currentData:currentData,
						data_auth_code:config.data_auth_code,
						pageParam:config.pageParam
					}
					config.table.child.add.serviceComponent.refresh(pageConfig,function(resData){
						saveDataChildAddAjax(resData);
					})
				}
			}
		} else {
			//空表格
			currentData = false
		}
	}
	//获取服务端业务对象数据
	function getModalData(_currentData, sourceType) {
		// _currentData 业务对象
		// sourceType   操作类型 只刷新子表 'onlyChild', 全部刷新 'all', 默认是all
		/*var modalAjaxData = getFormatAjaxData(_currentData, config.table.child.ajax);
		var modalAjax = {
			url: config.table.child.ajax.src,
			type: config.table.child.ajax.type,
			data: modalAjaxData
		}*/
		var modalAjax = nsVals.getAjaxConfig(config.table.child.ajax,_currentData,{idField:mainTableIdFeild,pageParam:config.pageParam});
		nsVals.ajax(modalAjax, function(res) {

			currentData = res[config.table.child.ajax.dataSrc];
			//判断config.table.child.keyField是否配置错误
			if(debugerMode){
				if(typeof(currentData[childTableKey])=='undefined'){
					console.error('config.table.child.keyField配置错误：'+childTableKey);
					console.error('服务器返回数据如下：');
					console.error(res);
				}
			}
			//是否只需要刷新子表格，默认全刷
			switch (sourceType) {
				case 'onlyChild':
					//只刷新子列表的情况
					var dataSourceArray = currentData[childTableKey];
					refreshChildTable(dataSourceArray);
					break;
				case 'all':
				default:
					//主表子表都刷
					refreshByCurrentData();
					break;
			}
		});
	}
	//刷新子表格
	function refreshChildTable(dataSourceArray) {
		//添加索引标识
		var selectedId = -1;
		for(var childI=0; childI<dataSourceArray.length; childI++){
			if(dataSourceArray[childI].objectCheckState){
				selectedId = dataSourceArray[childI][childTableIdFeild];
			}
		}
		dataSourceArray = nsTemplate.getDataByObjectState(dataSourceArray);
		if(!$.isArray(dataSourceArray)){dataSourceArray = [];}
		for (var dsI = 0; dsI < dataSourceArray.length; dsI++) {
			dataSourceArray[dsI].nsTemplateChildIndex = dsI;
		}
		//刷新列表
		var childTableId = config.fullChildTableId;
		nsList.refresh(childTableId,dataSourceArray);
		if(selectedId != -1){
			nsTable.setSelectRows(childTableId,selectedId);
		}
		/*baseDataTable.originalConfig[childTableId].dataConfig.dataSource = dataSourceArray;
		baseDataTable.refreshByID(childTableId);*/
	}
	//根据业务对象刷新
	function refreshByCurrentData(_currentData) {
		//刷新主表中对应的数据 如果没有指定数据，则使用当前数据
		if(typeof(_currentData)=='undefined'){
			_currentData = currentData;
		}
		//刷新主表单条数据（id相同的）
		var mainTableData = baseDataTable.table[config.fullMainTableId].data();
		for(var rowI = 0; rowI<mainTableData.length; rowI++){
			if(mainTableData[rowI][mainTableIdFeild] == _currentData[mainTableIdFeild]){
				var $tr = $('#'+config.fullMainTableId).children('tbody').children('tr').eq(rowI);
				var trDataObj = _currentData;
				baseDataTable.table[config.fullMainTableId].row($tr[0]).data(trDataObj).draw(false);
			}
		}
		//刷新子表
		var dataSourceArray = _currentData[childTableKey];
		refreshChildTable(dataSourceArray);
	}
	//刷新整体数据
	function refreshData(id) {
		var config = nsTemplate.templates.doubleTables.data[id].config;
		var mainTableAjax = {
			url: config.table.main.ajax.src,
			type: config.table.main.ajax.type,
			data: config.table.main.ajax.data
		}
		nsVals.ajax(mainTableAjax, mainTableSuccessFuntion); //初始化操作是先读取主表中的值
		// 主表数据ajax请求完成的处理数据
		function mainTableSuccessFuntion(data) {
			var dataSourceArray = [];
			var rowsData = data[config.table.main.ajax.dataSrc];
			nsTemplate.templates.doubleTables.data[id].list = rowsData; //保存操作对象列表

			for (var dataI = 0; dataI < rowsData.length; dataI++) {
				dataSourceArray.push(rowsData[dataI][config.table.mainField]);
				if (rowsData[dataI][config.table.mainField][config.table.primaryID] === config.table.defaultPid) {
					currentData[config.table.mainField] = rowsData[dataI][config.table.mainField];
				}
			}
			if ($.isEmptyObject(currentData[config.table.mainField])) {
				currentData[config.table.mainField] = rowsData[0][config.table.mainField]; //默认条件读取第一条数据
			}
			nsTemplate.templates.doubleTables.data[id].data = currentData[config.table.mainField];
			//处理子表ajax的data参数，如果子表ajax定义了data，则将该data与主表当前数据合并，如果定义了特定对象
			// var childrenAjaxData = $.extend(true, {}, currentData);
			// if(typeof(childrenAjaxData[config.table.childField])!='undefined'){
			// 	delete childrenAjaxData[config.table.childField];
			// }
			//如果设定了dataFormat
			childrenAjaxData = getFormatAjaxData(currentData, config.table.child.ajax);

			// config.searchContidionObject = searchChildTableObject;
			var mainTableId = config.fullMainTableId;
			// var childTableId = config.fullChildTableId;
			/*baseDataTable.originalConfig[mainTableId].dataConfig.dataSource = dataSourceArray;
			baseDataTable.refreshByID(mainTableId);*/
			nsList.refresh(mainTableId,dataSourceArray);
			// var childParams = $.extend({},childAjaxData, config.table.child.ajax.data);
			// console.log(childParams);
			var childTableAjax = {
				url: config.table.child.ajax.src,
				type: config.table.child.ajax.type,
				data: childrenAjaxData
			}
			nsVals.ajax(childTableAjax, childTableSuccessFuntion); //初始化操作是先读取附表中的值
			function childTableSuccessFuntion(res) {
				var childrenData = res[config.table.child.ajax.dataSrc][config.table.childField];
				var childTableId = config.fullChildTableId;
				currentData[config.table.childField] = childrenData;
				nsList.refresh(childTableId,childrenData);
				/*baseDataTable.originalConfig[childTableId].dataConfig.dataSource = childrenData;
				baseDataTable.refreshByID(childTableId);*/
			}
		}
	}
	//获取服务器端 业务对象数据
	function getServerObjectData(dataObj) {
		//dataObj用当前的业务对象获取服务端的对应业务对象，必须是主对象有id的
		if (debugerMode) {
			if (typeof(dataObj[mainTableIdFeild]) == 'undefined') {
				console.error('getServerObjectData方法，只能用于刷新数据，当前业务对象没有主键id：' + mainTableIdFeild)
			}
		}
		var childrenTableAjax = getAjaxConfig(dataObj, config.table.child.ajax)
		console.log(childrenTableAjax);
		nsVals.ajax(childrenTableAjax, function(res) {
			if (debugerMode) {
				if (typeof(res[config.table.child.ajax.dataSrc]) != 'object') {

				}
			}
		});

	}
	//刷新业务对象
	function refresh(id, data, type) {
		var config = nsTemplate.templates.doubleTables.data[id].config;
		var tableData = data;
		var tableConfig = config.table;
		var childConfig = tableConfig.child;
		var mainConfig = tableConfig.main;
		var searchContidionObject = {}; //检索条件
		var mainTableId = config.fullMainTableId;
		var childTableId = config.fullChildTableId;
		var rowData = tableData.modal[tableConfig.mainField];
		var mainTableDataArray = baseDataTable.getAllTableData(mainTableId);
		var childTableDataArray = baseDataTable.getAllTableData(childTableId);
		//modal  代表主附表刷新
		//rows   刷新主表，附表根据主表参数去刷
		var mainTableByIDIsExist = isExistMainTableByID();
		switch (rowData[tableConfig.flagField]) {
			case 'add':
				//添加
				if (mainTableByIDIsExist) {
					nsalert('该数据已存在', 'warning');
					console.log(rowData)
					return false;
				}
				baseDataTable.addTableRowData(mainTableId, [rowData]);
				break;
			case 'update':
				//修改
				if (mainTableByIDIsExist == false) {
					nsalert('该数据不存在', 'warning');
					console.log(rowData)
					return false;
				}
				var $cTr = nsTemplate.templates.doubleTables.data[id].config.$cTr;
				baseDataTable.table[mainTableId].row($cTr).data(rowData).draw(false);
				break;
			case 'delete':
				//删除
				//判断返回的id在当前表的
				if (mainTableByIDIsExist == false) {
					nsalert('该数据不存在', 'warning');
					console.log(rowData)
					return false;
				}
				baseDataTable.delSelectedRowdata(mainTableId);
				break;
		}
		//判断当前记录是否存在表数据中
		function isExistMainTableByID() {
			var isExistByID = false;
			for (var mainI = 0; mainI < mainTableDataArray.length; mainI++) {
				if (mainTableDataArray[mainI][tableConfig.primaryID] === rowData[tableConfig.primaryID]) {
					isExistByID = true;
				}
			}
			return isExistByID;
		}
	}
	//获取发出的ajax配置
	function getAjaxConfig(dataObj, sourceAjaxConfig) {
		var ajaxData = getFormatAjaxData(dataObj, sourceAjaxConfig);
		var ajaxConfig = {};
		for (key in sourceAjaxConfig) {
			switch (key) {
				case 'dataFormat':
				case 'dataSrc':
				case 'isServerMode':
					//不带过去的参数
					break;
				case 'src':
					ajaxConfig.url = sourceAjaxConfig.src;
					break;
				default:
					//复制的参数 如type等
					ajaxConfig[key] = sourceAjaxConfig[key];
					break;
			}
		}
		return ajaxConfig;
	}
	//格式化发出的ajax的data参数
	function getFormatAjaxData(dataObj, sourceAjaxConfig) {
		//dataObj 当前数据
		//sourceAjaxConfig 等待格式化的ajax配置文件 

		//保留config中的data参数
		var ajaxData = $.extend(true, {}, sourceAjaxConfig.data)
		//返回data参数
		var returnAjaxData = {};
		/*
		 * normal  	则只附加参数
		 * object 	则用对象名称包裹，返回标准对象格式
		 * id 		只使用id作为参数
		 * ids 		返回ids格式，用于批量操作
		 */
		switch (sourceAjaxConfig.dataFormat) {
			case 'normal':
				returnAjaxData = ajaxData;
				if (returnAjaxData[config.table.flagField]) {
					delete returnAjaxData[config.saveData.flagField];
				}
				break;
			case 'object':
				//完整业务对象
				returnAjaxData = $.extend(true, ajaxData, dataObj);
				break;
			case 'ids':
				break;
			case 'id':
				//只发送id
				returnAjaxData = {
					id: dataObj[mainTableIdFeild]
				}
				returnAjaxData = $.extend(true, returnAjaxData, ajaxData);
				break;
			default:
				//完整业务对象 如果使用了{参数}则返回定制参数
				var isUseObject = true;
				var customAjaxData = {};
				for(var key in ajaxData){
					//是{参数}
					if(ajaxParameterRegExp.test(ajaxData[key])){
						isUseObject = false;
						var keyValue = dataObj[ajaxData[key].substring(1,ajaxData[key].length-1)];
						customAjaxData[key] = keyValue;
					}else{
						customAjaxData[key] = ajaxData[key];
					}
				}
				if(isUseObject){
					//完整业务对象
					returnAjaxData = $.extend(true, ajaxData, dataObj);
				}else{
					//定制返回数据
					returnAjaxData = customAjaxData;
				}
				break;
		}
		return returnAjaxData;
	}
	return {
		init:								init,
		refreshData:						refreshData,
		refresh:							refresh,
		getFormatAjaxData:					getFormatAjaxData,
		dialogBeforeHandler:				dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:					ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:					ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:					loadPageHandler,				//弹框初始化加载方法
		closePageHandler:					closePageHandler,				//弹框关闭方法
	}
})(jQuery)