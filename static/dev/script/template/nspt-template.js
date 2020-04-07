/*
 * @Desription: 文件说明
 * @Author: netstar.cy
 * @Date: 2019-10-22 14:41:56
 * @LastEditTime: 2019-10-22 14:41:56
 */
/******************** 模板 start ***********************/
//配置模板
var NetstarTemplate = {
	templates: {
		configs: {},
		businessDataBase: {
			data: {}
		},//基础数据模板
		processDocBase: {
			data: {}
		},//流程管理界面
		processDocSecond: {
			data: {}
		},//二次加工处理界面
		docListViewer: {
			data: {}
		},//主详表
		businesslevellist3:{
			data:{}
		},//3级业务单据模板
		statisticsBase:{
			data:{}
		},//基本统计模版
		processDocBaseMobile:{

		},//手机端流程管理界面
		businessDataBaseMobile:{

		},//手机端基础数据模版
		limsReg:{

		},//lims登记
		limsReport:{

		},//lims报告
		processDocBaseLevel2:{

		},//单据两级数据模板
		limsResultInput:{

		},//lims结果录入
	},//模板定义
	//获取模板公用的高度
	getContainerCommonHeight: function () {
		var headHeight = $('.pt-header').outerHeight();//头部 菜单栏
		var topNavHeight = $('.pt-tabbar').outerHeight(); //导航栏
		var buttonHeight = 60;
		return headHeight + topNavHeight + buttonHeight;
	},
	getVoDataByConfig: function () {
		/*
			components [{
				type:'vo',
				keyField:'regItemVoList',
				idField:'regItemId'
			},{
				type:'list',
				keyField:'',
				idField:''
			}]
		*/
	},//获取keyField idField
	validConfigByTemplate: function (_config, options) {
		//不使用debugger模式则直接返回成功
		if (debugerMode == false) {
			return true;
		}
		//config传入错误
		if (typeof (_config) != 'object') {
			console.error('NetstarTemplate.validConfigByCommon 待验证的数据有误, config:' + _config);
			console.error(_config);
			return false;
		}
		var isValid = true;
		//整体参数验证
		var validArr =
			[
				['template', 'string',],		//模板名
				['package', 'string',],		//包名
				['title', 'string',],		//标题
				['components', 'array',],		//组件调用
				['btns', 'array'],		//按钮
				['readonly', 'boolean'],		//是否只读
				['getValueAjax', 'object'],		//初始化界面调用ajax请求
			];
		isValid = nsDebuger.validOptions(validArr, _config);
		if (isValid == false) { return false; }
		var validAjaxArr =
			[

				['src', 'string', true],			//地址
				['type', 'string'],			//类型
				['dataSrc', 'string'],			//dataSrc
				['data', 'object']			//发送参数
			];
		if (!$.isEmptyObject(_config.getValueAjax)) {
			//值不为空进行ajax配置参数的验证
			isValid = nsDebuger.validOptions($.extend(true, [], validAjaxArr), _config.getValueAjax);
			if(typeof(_config.getValueAjax.dataSrc)=='undefined'){
				_config.getValueAjax.dataSrc = 'data';
			}
		}
		return isValid;
	},//模板配置参数的验证
	getPageParamDataAuthCode: function (config) {
		return config.pageParam;
	},
	setComponentProperty: function (config) {
		//给所有配置按钮添加权限码请求参
		function addDataAutoCodeByBtns(btnArray, dataAuthCodeObj) {
			for (var btnI = 0; btnI < btnArray.length; btnI++) {
				if (btnArray[btnI].functionConfig) {
					btnArray[btnI].functionConfig.defaultData = $.extend(true, btnArray[btnI].functionConfig.defaultData, dataAuthCodeObj);
					btnArray[btnI].functionConfig.data = $.extend(true, btnArray[btnI].functionConfig.data, dataAuthCodeObj);
				}
			}
		}

		//sjj for循环给每个组件设置id 设置隐藏值
		for (var componentI = 0; componentI < config.components.length; componentI++) {
			var componentData = config.components[componentI];
			var containerId = config.id + '-' + componentData.type + '-' + componentI;//定义容器id
			if (componentData.hide) {
				//存在隐藏属性字段 需要设置字段隐藏属性
				var type = 'table';
				switch(componentData.type){
					case 'list':
					case 'block':
						type = 'table';
						break;
					case 'vo':
					case 'customize':
					case 'pie':
					case 'line':
					case 'bar':
						type = 'form';
						break;
					default:
						type = 'table';
						break;
				}
				NetstarTemplate.setFieldHide(type, componentData.field, componentData.hide);
			}
			//根据组件类型设置不同属性配置项
			switch (componentData.type) {
				case 'btns':
					//给按钮属性的ajax绑定权限码参数
					if (config.data_auth_code) {
						addDataAutoCodeByBtns(componentData.field, { data_auth_code: config.data_auth_code });
					} else if (typeof (config.pageParam) == 'object') {
						if (config.pageParam.data_auth_code) {
							addDataAutoCodeByBtns(componentData.field, { data_auth_code: config.pageParam.data_auth_code });
						}
					}
					break;
				case 'form':
					//给vo添加方法回调
					componentData.getPageDataFunc = getPageParamDataAuthCode(config);
					break;
			}
			config.components[componentI].id = containerId;//设置容器id
		}
	},//设置组件属性值
	init: function (_config, pageOperateData) {
		// pageOperateData : 当前页面的操作数据 用于newtab按钮 ；lyw 20190620
		var config = $.extend(true, {}, _config);
		if(typeof(pageOperateData) == "object"){
			config.pageParam = typeof(config.pageParam) == "object" ? config.pageParam : {};
			for(var key in pageOperateData){
				if(config.pageParam[key]){
				}else{
					config.pageParam[key] = pageOperateData[key];
				}
			}
		}
		//sjj 20191030 因为是根据包名存储的数据值
		if(!$.isEmptyObject(config.pageParam)){
			if(config.pageParam.packageSuffix){
				config.package = config.package+config.pageParam.packageSuffix.replace(/(\/|\:|\-)/g, '.');
			}
		}
		var packageName = config.package.replace(/\./g, '-');
		config.id = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
		var isValid = true;
		if (debugerMode) {
			isValid = NetstarTemplate.validConfigByTemplate(config);
		}
		if (isValid == false) {
			return false;
		}
		//找到模板并初始化
		var template = NetstarTemplate.templates[config.template];
		if (debugerMode) {
			if (typeof (template) != 'object') {
				var errorStr = '所指定的模板template:' + config.template + '不存在,请核实';
				nsalert(errorStr, 'error');
				console.error(errorStr);
				console.error(config)
				return;
			} else {
				if (typeof (template.init) != 'function') {
					var errorStr = '所指定的模板template:' + config.template + '不完整，请核实是否引入相关js文件';
					nsalert(errorStr, 'error');
					console.error(errorStr);
					console.error(config)
					return;
				}
			}
		}
		this.setDataAuthCode(config);//设置权限码
		this.setComponentProperty(config);//设置组件属性配置

		//sjj 手机端跳转界面直接传参	20190708
		if(typeof(NetstarTemplateValueData)=='object'){
			if(NetstarTemplateValueData[_config.package]){
				if($.isEmptyObject(config.pageParam)){
					config.pageParam = {};
				}
				config.pageParam.sourcePageConfig = NetstarTemplateValueData[_config.package].sourcePageConfig;
				delete NetstarTemplateValueData;
			}
		}
		if(NetStarUtils.Browser.browserSystem == 'pc'){
			vueButtonComponent.unbindShortcutKeyByAll();//sjj 20190801 按钮存在快捷键   初始化模版的时候清空所有快捷键的配置
			config.clearShortcutKeyByCloseHandler = function(packageName,index,labelPagesArr){
				vueButtonComponent.unbindKeydownHandler(packageName);
				if(index > 1){
					if(labelPagesArr[index-1].config){
						vueButtonComponent.bindKeydownHandler(labelPagesArr[index-1].config.package);
					}
				}else if(index == 1){
					if(labelPagesArr.length > 2){
						if(labelPagesArr[index+1].config){
							vueButtonComponent.bindKeydownHandler(labelPagesArr[index+1].config.package);
						}
					}
				}
			}	//sjj 20190801 关闭当前模版页的时候清空当前模版页的所有快捷键的配置 恢复上一个页面的快捷键
		}
		if($('#netstar-main-page').length>0){
			var mainPageOffset = $('#netstar-main-page').offset();
			NetstarTopValues = {
				topNav: {
					height: mainPageOffset.top,
				},
				bottom: {
					height: 34
				},//底部
			}
		}
		/*if(NetstarHomePage.config.mainMenus.menuType == 'left'){
			NetstarTopValues = {
				topNav: {
					height: 48,
				},
				bottom: {
					height: 84
				},//底部
			}
		}*/
		NetstarTemplate.templates.configs[config.package] = config;
		NetstarTemplate.setBtnsDisableByWorkflowType(config);
		template.init(config);
		this.templateInitComplete(config);

		if(NetStarUtils.Browser.browserSystem == 'pc'){
			if(config.template == 'businessDataBase'){
				//sjj 20190606 执行订阅方法
				/*NetStarRabbitMQ.subscribe({
					target : '/exchange/monitor/'+NetstarMainPage.config.nsTopOrgId+'.#',
					unitId : 'NetStarRabbitMQdmonitor',
					content : {},
					callbackHandler : function(subscribeInfo){
						var $currentContainer = $('container:not(".hidden")');
						var pageConfig = config;
						if($currentContainer.children('.pt-main').hasClass('businessdatabase')){
							var templateId = $currentContainer.children('.pt-main').attr('id');
							pageConfig = NetstarTemplate.templates.businessDataBase.data[templateId].config;
						}
						NetstarTemplate.refreshRabbitMQByBusinessDataBase(pageConfig.package,JSON.parse(subscribeInfo.body));
						//rabbitMQPatientIdFunc(subscribeInfo);
					}
				});*/
			}
		}
	},//模板调用初始化
	componentInit: function (_config) {
		/*
			{
				config:pageConfig.config,
				pageParam:{value:inputText},
				componentConfig:{
					container: 	'#' + bodyId,                   // 容器 （id或class）通过组件拿到（组件配置）
					selectMode: 	componentConfig.selectMode,     // 单选 多选 不能选 通过组件拿到（组件配置）
					componentClass :	'list',                         // 组件类别 默认list
					doubleClickHandler:	function(value){                // 显示弹框 传入的双击方法 （关闭弹框和刷新value/inputText）
						console.log(value);
						vueComponent.setValue(value);
						_this.close('#'+containerId, vueComponent);
					},
				}
			}
		*/
		vueButtonComponent.unbindShortcutKeyByAll();
		//先找到模板名 config.template
		var template = NetstarTemplate.templates[_config.config.template];
		var configObj = $.extend(true, {}, _config.config);
		if(typeof(configObj.pageParam)=='undefined'){
			configObj.pageParam = {};
		}
		if(typeof(_config.pageParam)=='undefined'){
			_config.pageParam = {};
		}
		configObj.pageParam = NetStarUtils.getDefaultValues(configObj.pageParam,_config.pageParam);
		var handler = template.componentInit(configObj, _config.componentConfig);
		return handler;
	},//调用组件某一部分的初始化
	setDataAuthCode: function (config) {
		//添加data_auth_code权限码参数
		var dataAuthCode = config.data_auth_code;
		if (typeof (config.pageParam) == 'object') {
			dataAuthCode = config.pageParam.data_auth_code;
		}
		if (dataAuthCode) {
			var dataAuthCodeObj = {
				data_auth_code: dataAuthCode
			}
			//如果存在权限码参数的情况
			if (config.saveData) {
				if (config.saveData.ajax) {
					config.saveData.ajax.data = $.extend(true, config.saveData.ajax.data, dataAuthCodeObj);//saveData整体保存ajax添加请求参
				}
			}
			//读取默认ajax添加请求参
			if (!$.isEmptyObject(config.getValueAjax)) {
				config.getValueAjax.data = $.extend(true, config.getValueAjax.data, dataAuthCodeObj);
				//ajax header添加data_auth_code 权限码 cy 20180711
				config.getValueAjax.header = dataAuthCodeObj;
			}
		}
	},//针对来源参数的处理
	getBtnArrayByBtns: function (_btnArray) {
		/*
			*_btnArray 传送进来的数据格式[btn:{text:'',handler:function(){}}]
			*转换后返回格式[{text:'',handler:function(){}}]
		*/
		var returnArray = [];
		var btnArray = $.extend(true, [], _btnArray);
		for (var btnI = 0; btnI < btnArray.length; btnI++) {
			var btnConfig = {};
			if (btnArray[btnI].btn) {
				btnConfig = btnArray[btnI].btn;
			} else {
				btnConfig = btnArray[btnI];
			}
			btnConfig.functionConfig = btnArray[btnI].functionConfig ? btnArray[btnI].functionConfig : {};
			var functionConfig = btnConfig.functionConfig;
			btnConfig.defaultMode = functionConfig.defaultMode;
			btnConfig.isCloseWindow = functionConfig.isCloseWindow;
			btnConfig.functionClass = functionConfig.functionClass;
			btnConfig.requestSource = functionConfig.requestSource;
			btnConfig.isMainDbAction = functionConfig.isMainDbAction;
			btnConfig.shortcutKey = functionConfig.shortcutKey;
			btnConfig.isSendPageParams = typeof(functionConfig.isSendPageParams)=='boolean' ? functionConfig.isSendPageParams : true;
			btnConfig.isOperatorMain = typeof(functionConfig.isOperatorMain)=='boolean' ? functionConfig.isOperatorMain : false;
			var isCloseBtn = false;//针对块状表格关闭按钮事件的处理转移
			if (typeof (functionConfig.isCloseBtn) == 'boolean') {
				isCloseBtn = functionConfig.isCloseBtn;
			}
			btnConfig.index = {
				customerIndex: btnI
			}
			//sjj 20190923 针对btn下拉分组事件
			switch(btnConfig.dropdownType){
				case 'memoryDropdown':
				case 'memoryDropdownShow':
					btnConfig.subdata = this.getBtnArrayByBtns(btnConfig.subdata);
					break;
			}
			//模板打印按钮处理  lxh 1120
			if (functionConfig.length != 0 && functionConfig.defaultMode == 'templatePrint') {
				btnConfig.dropdownType = 'ajaxShowIndex';
				btnConfig.clickShow = functionConfig.clickShow;
				btnConfig.callbackAjax = functionConfig.callbackAjax;
				btnConfig.textField = functionConfig.textField;
				btnConfig.valueField = functionConfig.valueField;
				btnConfig.ajaxConfig = {
					url: functionConfig.url,
					data: functionConfig.ajaxData,
					dataSrc: functionConfig.dataSrc,
					type: "GET",
				}
			}
			if (!isCloseBtn) {
				returnArray.push(btnConfig);
			}
		}
		return returnArray;
	},//针对按钮进行过滤处理
	getChargeDataByForm: function (formId, isValid) {
		var formJson = NetstarComponent.getValues(formId, isValid);
		return formJson;
	},//获取表单值
	//公用的面板输出
	getPanelHtml: function (contentHtml) {
		/*
			*contentHtml string 要填充的html
		*/
		return '<div class="pt-panel">'
			+ '<div class="pt-container">'
			+ '<div class="pt-panel-row">'
			+ '<div class="pt-panel-col">'
			+ contentHtml
			+ '</div>'
			+ '</div>'
			+ '</div>'
			+ '</div>';
	},
	newGuid: function (format, len) {
		len = typeof (len) == 'number' ? len : 32;
		var guid = "";
		for (var i = 1; i <= len; i++) {
			var n = Math.floor(Math.random() * 16.0).toString(16);
			guid += n;
			if (format != 'N2') {
				if ((i == 8) || (i == 12) || (i == 16) || (i == 20)) {
					guid += "-";
				}
			}
		}
		return guid;
	},//生成Gid (全球最唯码)
	//获取表格Grid的默认配置参数
	getGridConfig: function (_pageComponetsConfig, _options) {
		/**
		 * 入参(pageComponetsConfig, options)：
		 * 	pageComponetsConfig:object 页面上相对的配置项
		 * 	举例：{
		 * 		type: 			"list",
		 * 		containerId: 	"table-plane-nstemplate-layout-nsVue-graps-product",
		 * 		idField: 		"id",
		 * 		keyField: 		"list",
		 * 		parent: 		"root",
		 * 		field: 			[{...}],
		 * 		plusClass:		"pt-form-normal",
		 * 		position: 		"header-right",
		 * 		title: 			"这里是标题文字（暂时都不支持）"
		 * 
		 * 		ajax:{
		 * 			contentType:	"application/json; charset=utf-8",
		 * 			data: 			{id:"desId"},
		 * 			url: 			"http://localhost/ui/public/static/assets/json/project-list.json"，
		 * 			dataSrc: 		"rows",
		 * 			type: 			"GET",
		 * 		},
		 * 		
		 * 		value:[{...}]
		 * 	}
		 * 
		 * 	options:object  选项，用于控制默认的返回结果 默认返回列表模式
		 * 	举例：{
		 * 		mode:"list",  //edit：编辑模式， list：列表模式
		 * 	}
		 * 
		 * 返回参数
		 * return gridConfig:object 格式化好的grid组件参数
		 * {
		 * 		ui:{}, 
		 * 		columns:[],
		 * 		data:{}, 
		 * }
		 **/

		if (debugerMode) {
			if (typeof (pageComponetsConfig) != 'object') {
				console.error('pageComponetsConfig：object 页面组件参数未定义或类型错误，NetstarTemplate.getGridConfig方法错误');
				return;
			}
		}

		if (typeof (options) == 'undefined') {
			var options =
			{
				mode: 'list'
			}
		}

		//获取ajax.contentType 默认是json, 支持简写方式json/data/default
		function getContentType(_contentType) {
			//_contentType:string 
			var contentType = '';
			if (typeof (_contentType) != 'string') {
				contentType = 'application/json; charset=utf-8';
			} else {
				//简写方式
				switch (_contentType) {
					//复杂参数
					case 'json':
						contentType = 'application/json; charset=utf-8';
						break;
					//需要上传数据
					case 'data':
						contentType = 'multipart/form-data';
						break;
					//默认的普通表单
					case 'default':
						contentType = 'application/x-www-form-urlencoded';
						break;
					default:
						contentType = _contentType;
						break;
				}
			}
			return contentType;
		}
		//获取默认Grid配置
		function getDefaultConfig(_pageComponetsConfig) {
			var pageComponetsConfig = _pageComponetsConfig;
			var config = {
				data: {},
				columns: [],
				ui: {},
			};

			//如果是ajax的则直接设置 不设置该属性则代表当前grid的数据来源于其他
			if (typeof (pageComponetsConfig.ajax) == 'object') {
				config.data = pageComponetsConfig.ajax;
				//默认使用 'application/json; charset=utf-8';
				config.data.contentType = getContentType(pageComponetsConfig.ajax.contentType);
			} else if ($.isArray(pageComponetsConfig.value)) {
				//通过value直接赋值的
				config.data.dataSource = pageComponetsConfig.value;
			} else {
				//没有给定数据则是空表格 
				config.data.dataSource = [];
			}

			//读取列配置
			config.columns = pageComponetsConfig.field;
			//相关配置
			config.id = pageComponetsConfig.containerId;  	//容器
			if (pageComponetsConfig.title) {
				config.title = pageComponetsConfig.title; 		//标题
			}

			//模板里的分页参数统一标准
			config.ui.pageLengthMenu = [
				5, 10, 15,
				20, 25, 30,
				35, 40, 45,
				50, 100, 200,
				500, 1000, 2000
			]
			config.data.idField = pageComponetsConfig.idField;
			return config;
		}
		//根据类型设置
		function setConfigByOptions(config, options) {
			switch (options.mode) {
				case 'list':
					config.ui.isEditMode = false;

					config.ui.pageLengthDefault = 20;
					config.ui.minPageLength = 20;
					config.ui.isPreferContainerHeight = true;

					config.ui.selectMode = 'single';
					break;
				case 'edit':
					config.ui.isEditMode = true;
					config.ui.isHaveEditDeleteBtn = true;
					config.ui.isPage = false;
					config.ui.isCheckSelect = false;

					config.ui.minPageLength = 10;
					config.ui.isPreferContainerHeight = true;

					config.ui.selectMode = 'single';
					break;
			}
		}
		//获取默认值
		var gridConfig = getDefaultConfig();
		//根据类型设定详细 主要是options.mode  list（列表模式）/editor（编辑模式）
		setConfigByOptions(gridConfig, _options);

		return gridConfig;
	},
	//设置字段隐藏
	setFieldHide: function (ctrlType, field, arrHide) {
		if (!$.isArray(field)) { field = []; }
		//表单隐藏列
		if (ctrlType == 'form') {
			for (var i = 0; i < field.length; i++) {
				if ($.inArray(field[i].id, arrHide) > -1) {
					// field[i].type = 'hidden'; lyw删除 不能修改type值 问题select时subdata设置selected
					field[i].hidden = true;
					field[i].isAllowUserAction = false;
				}else{
					field[i].isAllowUserAction = true;
				}
			}
		} else if (ctrlType == 'formPlate') {
			for (var i = 0; i < field.length; i++) {
				if ($.inArray(field[i].id, arrHide) > -1) {
					field[i].type = 'hidden';
					field[i].hidden = true;
					field[i].isAllowUserAction = false;
				}else{
					field[i].isAllowUserAction = true;
				}
			}
		} else if (ctrlType == 'table') { //表格隐藏列
			for (var i = 0; i < field.length; i++) {
				if ($.inArray(field[i].field, arrHide) > -1) {
					field[i].hidden = true;
					field[i].isAllowUserAction = false;
				}else{
					field[i].isAllowUserAction = true;
				}
			}
		}
	},

	//根据工作流id给模板存放数据
	setProcessDataByWorkItemId: function (templateConfig) {
		/*
			templateConfig object 模板参数
		*/
		NetstarTemplate.setStateByWorkItemId({ templateConfig: templateConfig, title: '我是标题', btn: { text: '关闭', handler: {} } });
	},
	//根据工作流id设置状态
	setStateByWorkItemId: function (filterData) {
		/*
			*filterData:object
			*{
				* 	templateConfig: object  	模板配置项
				* 	workItemId: 	string 		工作流id
				* 	state: 			string 		状态
				* 	title: 			string 		标题
				* 	btn: 			object 		按钮
				*{
					* {
						text string 文本值
						handler 按钮调用方法
					*}
				*}
			*}
			'emergency-message',//应急
			'normal-message',//普通
			'again-message',//重办
			'suspend-message',//挂起
		*/
		var templateConfig = filterData.templateConfig;//模板配置项
		var templateId = templateConfig.id;//模板容器id
		var templatePackage = templateConfig.package;//模板容器id
		var isExistWorkItemId = false;//默认不存在
		var workItemId = filterData.workItemId;
		//var currentTemplateData = {};//当前模板的数据值
		//判断当前模板数据值 是否存在和当前要比对的workItemId 值相等的数据
		function setGridRowState(gridId, state, _config) {
			var rowsArray = NetStarGrid.configs[gridId].vueObj.rows;
			var config = typeof (_config) == 'object' ? _config : {};
			var workItemIdIndex = -1;
			for (var rowI = 0; rowI < rowsArray.length; rowI++) {
				if (rowsArray[rowI][NSROWAUTOPARAM.workItemId] == workItemId) {
					workItemIdIndex = rowI;
				}
			}
			if (workItemIdIndex > -1) {
				isExistWorkItemId = true;

				//存在当前行值
				//var $container = $('#' + gridId + '-contenttable tbody tr[ns-rowindex="' + workItemIdIndex + '"]');
				//$container.addClass(state); //找到行下标给其添加对应的状态属性值
			}
			/*switch (state) {
				case 'tr-disabled':
					//禁用状态 当前界面所有按钮处于禁用状态
					if ($.isArray(config.componentsConfig.btns)) {
						for (var btnI = 0; btnI < config.componentsConfig.btns.length; btnI++) {
							var btnId = config.componentsConfig.btns[btnI].id;
							$('#' + btnId + ' button').attr('disabled', true);
						}
					}
					break;
			}*/
		}

		if (workItemId) {
			//存在工作流id
			switch (templateConfig.template) {
				case 'businessDataBase':
					//基础数据模板
					var gridId = NetstarTemplate.templates.businessDataBase.data[templateId].config.componentsConfig.list[0].id;
					setGridRowState(gridId, filterData.state, NetstarTemplate.templates.businessDataBase.data[templateId].config);
					break;
				case 'docListViewer':
					var mainListConfig = NetstarTemplate.templates.docListViewer.data[templateId].config.mainComponent;
					setGridRowState(mainListConfig.id, filterData.state, NetstarTemplate.templates.docListViewer.data[templateId].config);
					//单据详情模板
					break;
				case 'processDocSecond':
					//流程管理二次单据模板
					var currentConfig = NetstarTemplate.templates.processDocSecond.aggregate[templatePackage].config;
					currentConfig.setTemplateState(filterData.state);
					break;
				case 'processDocBase':
					//流程管理基础单据模板
					var currentConfig = NetstarTemplate.templates.processDocBase.aggregate[templatePackage].config;
					currentConfig.setTemplateState(filterData.state);
					break;
				case 'limsResultInput':
					//结果录入
					var currentConfig = NetstarTemplate.templates.configs[templatePackage];
					var gridConfig = currentConfig.mainComponent;
					NetStarGrid.refreshById(gridConfig.id);
					break;
			}
		}
		return isExistWorkItemId;
	},
	templateInitComplete: function (config) {
		typeof config.pageInitCompleteHandler != 'undefined' && config.pageInitCompleteHandler(config);
		/**做缓存处理 lxh 2019/02/18 */
		// NetstarCatchHandler.preload();
	},
	//sjj 20190314
	//根据字段和值获取表格数据
	getMainTableDataByFieldAndValue: function (pagePackageName, fieldKey, fieldValue) {
		//pagePackageName 包名
		//fieldKey 字段名
		//fieldvalue 字段值
		var data = {};//获取值
		switch (NetstarTemplate.templates.configs[pagePackageName].template) {
			case 'businessDataBase':
				var packageName = pagePackageName.replace(/\./g, '-');
				var templateId = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
				break;
			case 'docListViewer':
				var packageName = pagePackageName.replace(/\./g, '-');
				var templateId = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
				if (NetstarTemplate.templates.docListViewer.data) {
					//主详表  单据详情模板
					var config = NetstarTemplate.templates.docListViewer.data[templateId].config;
					if (!$.isEmptyObject(config)) {
						//存在单据详情模板的配置项
						var gridId = config.mainComponent.id;
						data = NetStarGrid.getDataByFieldAndValue(gridId, fieldKey, fieldValue);
					}
				}
				break;
		}
		return data;
	},
	//根据工作流id设置禁用
	setDisableByWorkItemId: function (pagePackageName, workItemId, isDisabled, workitemState) {
		//isDisabled  是否禁用
		//pagePackageName 包名
		//workItemId 工作流id
		switch (NetstarTemplate.templates.configs[pagePackageName].template) {
			case 'businessDataBase':
				var packageName = pagePackageName.replace(/\./g, '-');
				var templateId = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
				if (NetstarTemplate.templates.businessDataBase.data) {
					//主详表  单据详情模板
					var config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
					if (!$.isEmptyObject(config)) {
						//存在单据详情模板的配置项
						// var gridId = config.componentsConfig.list[0].id;
						var gridId = config.mainComponent.id;
						var data = NetStarGrid.getDataByFieldAndValue(gridId, 'workItemId', workItemId);
						if (!$.isEmptyObject(data)) {
							// data.hasSuspend = isDisabled;
							data['NETSTAR-TRDISABLE'] = isDisabled;
							NetStarGrid.setDataByFieldAndValue(gridId, 'workItemId', workItemId, data);
							//按钮的处理
							var btnsArray = config.componentsConfig.btns;
							for (var btnI = 0; btnI < btnsArray.length; btnI++) {
								$('#' + btnsArray[btnI].id + ' button').prop('disabled', true)
							}
						}
					}
				}
				break;
			case 'docListViewer':
				var packageName = pagePackageName.replace(/\./g, '-');
				var templateId = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
				if (NetstarTemplate.templates.docListViewer.data) {
					//主详表  单据详情模板
					var config = NetstarTemplate.templates.docListViewer.data[templateId].config;
					if (!$.isEmptyObject(config)) {
						//存在单据详情模板的配置项
						var gridId = config.mainComponent.id;
						var data = NetStarGrid.getDataByFieldAndValue(gridId, 'workItemId', workItemId);
						if (!$.isEmptyObject(data)) {
							// data.hasSuspend = isDisabled;
							data['NETSTAR-TRDISABLE'] = isDisabled;
							NetStarGrid.setDataByFieldAndValue(gridId, 'workItemId', workItemId, data);
							//按钮的处理
							var btnsArray = config.componentsConfig.btns;
							for (var btnI = 0; btnI < btnsArray.length; btnI++) {
								$('#' + btnsArray[btnI].id + ' button').attr('disabled', isDisabled);
							}
						}
					}
				}
				break;
			case 'processDocBase':
				//lxh 模版只读
				if (typeof NetstarTemplate.templates.processDocBase.aggregate != 'undefined') {
					var config = NetstarTemplate.templates.processDocBase.aggregate[pagePackageName].config;
					if (typeof config != 'undefined' && !$.isEmptyObject(config)) {
						//存在单据详情模板的配置项
						config.templateDisabled(config, isDisabled, true, workitemState);
					}
				}
				break;
			case 'businesslevellist3':
				// lyw
				var config = NetstarTemplate.templates.configs[pagePackageName];
				var mainId = '';   // 主表id
				var mainType = '';   // 主表类型
				var mainBtnId = '';   // 主表按钮容器id
				var components = config.components;
				for(var i=0; i<components.length; i++){
					var component = components[i];
					if(component.type != "btns" && component.parent == 'root'){
						mainId = component.id;
						mainType = component.type;
						continue;
					}
					if(component.type == "btns" && component.operatorObject == "root"){
						mainBtnId = component.id;
						continue;
					}
				}
				switch(mainType){
					case 'list':
						var data = NetStarGrid.getDataByFieldAndValue(mainId, 'workItemId', workItemId);
						if (!$.isEmptyObject(data)) {
							data['NETSTAR-TRDISABLE'] = isDisabled;
							NetStarGrid.setDataByFieldAndValue(mainId, 'workItemId', workItemId, data);
						}
						break;
					case 'blockList':
						var data = NetstarBlockList.getDataByFieldAndValue(mainId, 'workItemId', workItemId);
						if (!$.isEmptyObject(data)) {
							data['NETSTAR-TRDISABLE'] = isDisabled;
							NetstarBlockList.setDataByFieldAndValue(mainId, 'workItemId', data);
						}
						break;
				}
				// 设置只读按钮
				if(data.netstarSelectedFlag){
					// 选中
					// 按钮的处理
					var $btns = $('#' + mainBtnId).find('button');
					for(var i=0; i<$btns.length; i++){
						$btns.eq(i).attr('disabled', isDisabled);
					}
				}
				break;
		}
	},
	// 设置状态 通过参数 lyw
	setState : function(stateConfig){
		NetstarTemplate.aa = stateConfig;
		console.log(stateConfig);
		/**
		 * stateConfig {}
		 *  attrs : {} 行参数 用于docListViewer模板
		 *  workItemState : 工作项状态
		 * 	pagePackage : 包名
		 * 	templateConfig : 模板配置
		 * 	workItemId : 工作项id
		 */
		// 根据状态判断待办
		var stateTypes = {
			0 : false,
			1 : false,
			2 : true,
			3 : true,
			4 : false,
			5 : false,
			16 : false,
			32 : false,
			128 : false,
		}
		var templateConfig = stateConfig.templateConfig;  // 模板配置
		if(typeof(templateConfig) != 'object'){
			// 传参错误
			console.error('设置状态传参错误');
			console.error(stateConfig);
			return false;
		}
		switch(templateConfig.template){
			case 'processDocBase':
				// 默认状态
				var state = 'normal-message';
				if(!stateTypes[stateConfig.workItemState]){
					// 不是待办 禁用
					state = 'state-disabled-message';
				}
				//lxh 模版状态
				if (typeof NetstarTemplate.templates.processDocBase.aggregate != 'undefined') {
					var config = NetstarTemplate.templates.processDocBase.aggregate[stateConfig.pagePackage].config;
					if (typeof config != 'undefined' && !$.isEmptyObject(config)) {
						//存在单据详情模板的配置项
						config.setTemplateState(state);
					}
				}
				break;
			case 'docListViewer':
				var packageName = stateConfig.pagePackage.replace(/\./g, '-');
				var templateId = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
				if(typeof(NetstarTemplate.templates.docListViewer.data) != 'object'){
					return;
				}
				//主详表  单据详情模板
				var config = NetstarTemplate.templates.docListViewer.data[templateId].config;
				if (typeof(config) != 'object' || $.isEmptyObject(config)) {
					return;
				}
				//存在单据详情模板的配置项
				var gridId = config.mainComponent.id;
				var data = NetStarGrid.getDataByFieldAndValue(gridId, 'workItemId', stateConfig.workItemId);
				if ($.isEmptyObject(data)) {
					return;
				}

				var attrs = stateConfig.attrs;
				for(var key in attrs){
					if(key == "workItemId"){
						if(typeof(data[key]) != "undefined"){
							data[key] = attrs[key];
						}
					}else{
						data[key] = attrs[key];
					}
				}

				data['netstar-workItemState'] = stateConfig.workItemState;
				NetStarGrid.setDataByFieldAndValue(gridId, 'workItemId', stateConfig.workItemId, data);
				break;
			case 'businesslevellist3':
				var packageName = stateConfig.pagePackage.replace(/\./g, '-');
				var templateId = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
				if(typeof(NetstarTemplate.templates.businesslevellist3.data) != 'object'){
					return;
				}
				//主详表  单据详情模板
				var config = NetstarTemplate.templates.businesslevellist3.data[templateId].config;
				if (typeof(config) != 'object' || $.isEmptyObject(config)) {
					return;
				}
				// 块状表格
				//存在单据详情模板的配置项
				var mainComponent = config.mainComponent
				var gridId = config.mainComponent.id;
				// 普通表格
				var mainTypeFunc = NetStarGrid;
				if(mainComponent.type == "blockList"){
					mainTypeFunc = NetstarBlockList;
				}
				var data = mainTypeFunc.getDataByFieldAndValue(gridId, 'workItemId', stateConfig.workItemId);
				if ($.isEmptyObject(data)) {
					return;
				}

				var attrs = stateConfig.attrs;
				for(var key in attrs){
					if(key == "workItemId"){
						if(typeof(data[key]) != "undefined"){
							data[key] = attrs[key];
						}
					}else{
						data[key] = attrs[key];
					}
				}
				data['netstar-workItemState'] = stateConfig.workItemState;
				mainTypeFunc.setDataByFieldAndValue(gridId, 'workItemId', stateConfig.workItemId, data);
				break;
		}
	},
	//根据工作流id设置状态
	setStateByWorkItemId: function (pagePackageName, workItemId, state) {
		switch (NetstarTemplate.templates.configs[pagePackageName].template) {
			case 'businessDataBase':
				var packageName = pagePackageName.replace(/\./g, '-');
				var templateId = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
				break;
			case 'docListViewer':
				var packageName = pagePackageName.replace(/\./g, '-');
				var templateId = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
				if (NetstarTemplate.templates.docListViewer.data) {
					//主详表  单据详情模板
					var config = NetstarTemplate.templates.docListViewer.data[templateId].config;
					if (!$.isEmptyObject(config)) {
						//存在单据详情模板的配置项
						var gridId = config.mainComponent.id;
						var data = NetStarGrid.getDataByFieldAndValue(gridId, 'workItemId', workItemId);
						if (!$.isEmptyObject(data)) {
							switch (state) {
								case 'suspend-message':
									//挂起
									data.hasSuspend = true;
									data['NETSTAR-TRDISABLE'] = true;
									break;
								case 'emergency-message':
									data.hasEmergency = true;
									//应急
									break;
								case 'again-message':
									//重办
									data.hasRollback = true;
									break;
								case 'normal-message':
									// 待办
									data.normalstate = true;
									break;
							}

							NetStarGrid.setDataByFieldAndValue(gridId, 'workItemId', workItemId, data);
						}
					}
				}
				break;
			case 'processDocBase':
				//lxh 模版状态
				if (typeof NetstarTemplate.templates.processDocBase.aggregate != 'undefined') {
					var config = NetstarTemplate.templates.processDocBase.aggregate[pagePackageName];
					if (typeof config != 'undefined' && !$.isEmptyObject(config)) {
						//存在单据详情模板的配置项
						config.setTemplateState(state);
					}
				}
				break;
		}
	},
	refreshRabbitMQByBusinessDataBase:function(pagePackageName,_data){
		var pageConfig = NetstarTemplate.templates.configs[pagePackageName];
		if(pageConfig.template == 'businessDataBase'){
			switch(_data.messageType){
				case 1:
					//刷新界面
					NetstarTemplate.templates.businessDataBase.ajaxAfterHandler({objectState:NSSAVEDATAFLAG.VIEW},pageConfig.id);
					break;
				case 2:
					//更新设备状态并实时变更颜色
					var listConfig = pageConfig.componentsConfig.list[0];
					var gridId = listConfig.id;
					if(listConfig.type == 'blockList'){
						NetstarBlockList.setDataByRowId(gridId, 'bedId', _data.data);
					}
					break;
				case 3:
					//设置检测数据
					//存在单据详情模板的配置项
					var listConfig = pageConfig.componentsConfig.list[0];
					var gridId = listConfig.id;
					if(listConfig.type == 'blockList'){
						NetstarBlockList.setDataByFieldAndValue(gridId, 'patientId', _data.data);
					}
					break;
			}
		}
	},
	//根据patientId 修改行数据
	setDataByPatientId:function(pagePackageName,_data){
		switch (NetstarTemplate.templates.configs[pagePackageName].template) {
			case 'businessDataBase':
				var packageName = pagePackageName.replace(/\./g, '-');
				var templateId = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
				if (NetstarTemplate.templates.businessDataBase.data) {
					//主详表  单据详情模板
					var config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
					if (!$.isEmptyObject(config)) {
						//存在单据详情模板的配置项
						var listConfig = config.componentsConfig.list[0];
						var gridId = listConfig.id;
						switch(listConfig.type){
							case 'list':
								NetStarGrid.setDataByFieldAndValue(gridId, 'patientId', _data);
								break;
							case 'blockList':
								NetstarBlockList.setDataByFieldAndValue(gridId, 'patientId', _data);
								break;
						}
					}
				}
				break;
		}
	},
	//根据包名刷新模板数据
	refreshByPackage: function (data, sourceData,outerConfig) {
		/*
			*data object 接受参
				* idField 主键id
				*package 包名
				*templateId string
			*sourceData 来源data 
		*/
		if(typeof(outerConfig)!='object'){
			outerConfig = {};
		}
		var packPackageName = data.package;
		var templateName;
		if(typeof(packPackageName)=='undefined'){
			var currentTab = NetstarUI.labelpageVm.currentTab;
			if(NetstarUI.labelpageVm.labelPagesArr[currentTab].config){
                packPackageName = NetstarUI.labelpageVm.labelPagesArr[currentTab].config.package;
                var config = NetstarTemplate.templates.configs[packPackageName];
				// data.id = NetstarUI.labelpageVm.labelPagesArr[currentTab].config.id;
				data.id = config.id;
			}
		}
		if(NetstarTemplate.templates.configs[packPackageName]){
			templateName = NetstarTemplate.templates.configs[packPackageName].template;
		}else{
			for(var c in NetstarTemplate.templates.configs){
				if(NetstarTemplate.templates.configs[c].package.indexOf(packPackageName)>-1){
					templateName = NetstarTemplate.templates.configs[c].template;
					data.package = NetstarTemplate.templates.configs[c].package;
					data.templateId = NetstarTemplate.templates.configs[c].id;
					break;
				}
			}
		}
		switch (templateName) {
			case 'businessDataBase':
				NetstarTemplate.templates.businessDataBase.refreshByPackage(data,sourceData,outerConfig);
				//var config = NetstarTemplate.templates.businessDataBase.data[data.templateId].config;
				//NetstarTemplate.templates.businessDataBase.refreshData(config.componentsConfig.list[0].id);
				break;
			case 'docListViewer':
				NetstarTemplate.templates.docListViewer.refreshData(data, sourceData);
				break;
			case 'businesslevellist3':
				NetstarTemplate.templates.businesslevellist3.refreshData(data, sourceData);
				break;
			case 'limsReg':
				NetstarTemplate.templates.limsReg.refreshByPackage(data);
				break;
			case 'limsReport':
				NetstarTemplate.templates.limsReport.refreshByPackage(data);
				break;
		}
	},
	// 获取页面操作数据 lyw 20190620
	getOperateData : function(_config){
		var components = _config.components;
		var pageData = {};
		// var formNum = 0;//sjj 20191001
		var num = {
			list : 0,
			vo : 0,
			tree : 0,
		};
		for(var key in components){
			var keyFieldName = components[key].keyField;
			if(typeof(keyFieldName) =="undefined"){
				keyFieldName = components[key].type;
				if(num[components[key].type] > 0){
					var formNum = num[components[key].type]; // 当前该类型面板个数
					keyFieldName += formNum;
				}
				num[components[key].type] ++;
			}
			switch(components[key].type){
				case "vo":
					var voData = NetstarComponent.getValues(components[key].id, false);
					if(voData){
						pageData[keyFieldName] = voData;
					}
					break;
				case "list":
					var displayMode = '';
					if(components[key].params){
						if(components[key].params.displayMode == 'block'){
							displayMode = 'block';
						}
					}
					if(displayMode == 'block'){
						var blockListId = components[key].id;
						var listSelectedData = NetstarBlockList.getSelectedData(blockListId);
						pageData[keyFieldName + 'Selected'] = listSelectedData;
					}else{
						var gridConfig = NetStarGrid.configs[components[key].id];
						if (typeof (gridConfig) != 'object') {
							break;
						}
						var listSelectedData = NetStarGrid.getSelectedData(components[key].id);
						var listCheckedData = NetStarGrid.getCheckedData(components[key].id);
						pageData[keyFieldName + 'Selected'] = listSelectedData;
						pageData[keyFieldName + 'Checked'] = listCheckedData;
					}
					break;
				case "tree":
					var treeId = 'tree-' + components[key].id;
					switch(_config.template){
						case "businessbasePanoramic":
							treeId = components[key].id;
							break;
						case 'businessDataBase':
							if($('#'+treeId).length == 0){
								treeId = components[key].id;
							}
							break;
					}
					var listSelectedData = NetstarTemplate.tree.getSelectedNodes(treeId);
					var listCheckedData = NetstarTemplate.tree.getCheckedNodes(treeId);
					pageData[keyFieldName + 'Selected'] = listSelectedData;
					pageData[keyFieldName + 'Checked'] = listCheckedData;
					break;
				case "blockList":
					var blockListId = components[key].id;
					var listSelectedData = NetstarBlockList.getSelectedData(blockListId);
					pageData[keyFieldName + 'Selected'] = listSelectedData;
					// pageData[keyFieldName + 'Checked'] = listCheckedData;
					break;
			}
		}
		return pageData;
	},
	// 根据包名刷新模板数据  没有原始值，主要步骤：根据包名获取config，找到模板，调用模板刷新
	refreshByPackageWithoutData: function(package){
		var config = NetstarTemplate.templates.configs[package];
		if(typeof(config) != "object"){
			nsAlert('根据' + package + '没有发现页面配置');
			console.error('根据' + package + '没有发现页面配置');
			return;
		}
		var template = config.template;
		switch(template){
			case 'docListViewer':
				NetstarTemplate.templates.docListViewer.refreshByConfig(config);
				break;
			case 'businessDataBase':
				NetstarTemplate.templates.businessDataBase.refreshByConfig(config);
				break;
			case 'businesslevellist3':
				NetstarTemplate.templates.businesslevellist3.refreshByConfig(config);
				break;
		}
		// 刷新消息
		var navArr = NetstarUI.labelpageVm.labelPagesArr;
		var pageParams = {};
		for(var i=0; i<navArr.length; i++){
			var navObj = navArr[i];
			if(typeof(navObj.config) == "object" && navObj.config.package == package){
				pageParams = navObj.attrs;
				break;
			}
		}
		if(!$.isEmptyObject(pageParams)){
			NetStarRabbitMQ.refreshInfoRemind(pageParams);
		}
	},
	getTemplateData:function(_config,isValid){
		var value = {};
		switch(_config.template){
			case 'processDocBaseMobile':
				value = NetstarTemplate.templates.processDocBaseMobile.getPageData(_config,isValid);
				break;
			case 'businessDataBaseMobile':
				value = NetstarTemplate.templates.businessDataBaseMobile.getPageData(_config,isValid);
				break;
			case 'docListViewerMobile':
				value = NetstarTemplate.templates.docListViewerMobile.getPageData(_config,isValid);
				break;
		}
		return value;
	},
	getValueDataByValidateParams:function(config,controllerObj){
		controllerObj = typeof(controllerObj)=='object' ? controllerObj : {};
		if(controllerObj.isSendPageParams == false){
			//不发送界面参数直接返回空
			value = {};
		}else{
			var isValid = false;//是否对整体界面获取值进行验证
			if(controllerObj.requestSource == 'thisVo'){
				isValid = true;
			}
			var isParameterFormat = false;
			if(controllerObj.parameterFormat){
				//如果配置了参数格式化 
				//参数格式化 parameterForamt:{"customerId":"{customerVo.customerId}","goodsShopId":"{saleDetailVoList.goodsShopId}",'saleWarehouseId':"{saleWarehouseId}"}
				isValid = false; 
				isParameterFormat =true;
			}
			value = NetstarTemplate.getTemplateData(config,isValid);//获取界面的值
			if(isParameterFormat){
				//配置了参数格式化
				var parameterFormat = JSON.parse(controllerObj.parameterFormat);//转换的数据参数
				var chargeData = NetStarUtils.getFormatParameterJSON(parameterFormat,value);//获取到转换的数据值
				var validateParams = JSON.parse(controllerObj.validateParams); //验证提示语  
				var validateStrArray = [];//验证提示语
				var formatData = chargeData;
				if(chargeData == false){
					//转值失败
					formatData = {};
				}
				for(var validId in validateParams){
					var validStr = formatData[validId];//获取值
					var validMsg = validateParams[validId];
					//判断值是否存在
					var isPush = false;
					switch(typeof(validStr)){
						case 'string':
							if(validStr == ''){
								isPush = true;
							}
							break;
						case 'number':
							if(isNaN(validStr)){
								isPush = true;
							}
							break;
						case 'object':
							if($.isEmptyObject(validStr)){
								isPush = true;
							}
							break;
						case 'undefined':
							isPush = true;
							break;
						default:
							break;
					}
					if(isPush){
						validateStrArray.push(validMsg);
					} 
				}
				if(validateStrArray.length > 0){
					value = false;
					nsalert(validateStrArray.join(' '),'warning');
				}else{
					value = chargeData;
				}
			}else{
				//没有参数格式化是否配置了validateParams  1.{"customerId":"客户必填","saleWarehouseId":"货位必填","goodsShopId":"货品必填"}  2.(SUM({NUM*PRICE})) 验证值的表达式
				if(value){
					var isValid = NetStarUtils.getPageValidResult(value,controllerObj.validateParams);
					if(isValid == false){
					   //验证失败不执行
					   value = false;
					}
				 }
			}
		}
		return value;
	},
	getAjaxInnerParamsByAjaxData:function(sourceParam,ajaxData){
		var outputParams = {};
		if(!$.isEmptyObject(sourceParam)){
			//来源参存在
			var isUseObject = true;
			if(!$.isEmptyObject(ajaxData)){
				var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
				for(var key in ajaxData){
					if (ajaxParameterRegExp.test(ajaxData[key])) {
						isUseObject = false;
						break;
					}
				}
			}
			if(isUseObject){
				outputParams = sourceParam;
			}else{
				outputParams = NetStarUtils.getFormatParameterJSON(ajaxData,sourceParam);
			}
		}
		return outputParams;
	},
	quickQueryByMobileTemplate:function(_listConfig){
		var isUseQRInput = _listConfig.isUseQRInput;
		var isUseSearchInput = _listConfig.isUseSearchInput;
		var searchInputPlaceholder = _listConfig.searchInputPlaceholder ? _listConfig.searchInputPlaceholder : '';
		if(isUseSearchInput){
			var searchInputId = 'search-'+_listConfig.id;
			var searchAttr = 'has-tree';
			if($('#'+_listConfig.id).parent().hasClass('notree')){
				searchAttr = 'no-tree';
			}
			var html = '<div class="row mobile-input-search" id="search-'+_listConfig.id+'" ns-grid="'+_listConfig.id+'" search-type="'+searchAttr+'">'
							+'<div class="mobile-input-search-control">'
								+'<i class="fa-search"></i><span>'+searchInputPlaceholder+'</span>'
							+'</div>'
						+'</div>';
			if($('.mobile-input-search').length > 0){
				$('.mobile-input-search').remove();
			}
			$('container').prepend(html);
			//事件触发
			function initSearchEvent(jsonData){
				var inputId = jsonData.inputId;
				var gridId = jsonData.gridId;
				var $inputContainer = $('#'+inputId);
				$inputContainer.select();
				$('#btn-'+gridId+' button[type="button"]').on('click',function(ev){
					ev.stopPropagation();
					var $btn = $(this);
					$btn.blur();
					$('input[type="text"]').blur();
					var nstype = $btn.attr('nstype');
					var currentGridId = $btn.parent().attr('ns-grid');
					function confirmHandler(){
						var inputValue = $inputContainer.val();
						var ajaxData = NetstarBlockListM.configs[currentGridId].gridConfig.data.data;
						ajaxData.keyword = inputValue;
						if(typeof(NetstarBlockListM.configs[currentGridId].gridConfig.data.src)=='undefined'){
							var packageName = $('#'+currentGridId).closest('div[ns-package]').attr('ns-package');
							NetstarTemplate.templates.businessDataBaseMobile.refreshListByTreeNode(NetstarTemplate.templates.configs[packageName],ajaxData);
						}else{
							NetstarBlockListM.refreshById(currentGridId,ajaxData);
						}
					}
					switch(nstype){
						case 'confirm':
							confirmHandler();
							break;
						case 'cancel':
							var cancelHtml = '<div class="mobile-input-search-control">'
												+'<i class="fa-search"></i><span>'+searchInputPlaceholder+'</span>'
											+'</div>';
							$('#search-'+gridId).html(cancelHtml);
							$('#'+searchInputId).on('click',quickQueryClickHandler);
							break;
					}
				});
				$inputContainer.on('keyup',function(e){
					switch(e.keyCode) {
					   case 13:
							var $currentInput = $(this);
							var inputValue = $currentInput.val();
							var ajaxData = NetstarBlockListM.configs[gridId].gridConfig.data.data;
							ajaxData.keyword = inputValue;
							if(typeof(NetstarBlockListM.configs[gridId].gridConfig.data.src)=='undefined'){
								var packageName = $('#'+gridId).closest('div[ns-package]').attr('ns-package');
								NetstarTemplate.templates.businessDataBaseMobile.refreshListByTreeNode(NetstarTemplate.templates.configs[packageName],ajaxData);
							}else{
								NetstarBlockListM.refreshById(gridId,ajaxData);
							}
							break;
					   default:
							var $currentInput = $(this);
							var inputValue = $currentInput.val();
							if (inputValue.length > 0) {
								$('#clearInput').removeClass('hidden');
							} else {
								$('#clearInput').addClass('hidden');
							}
							break;
					}
				});
				$('#clearInput button[type="button"]').on('click',function(clearevent){
					clearevent.stopPropagation();
					$(this).parent().addClass('hidden');
					$inputContainer.val('');
					$inputContainer.focus();
					var ajaxData = NetstarBlockListM.configs[gridId].gridConfig.data.data;
					delete ajaxData.keyword;
					if(typeof(NetstarBlockListM.configs[gridId].gridConfig.data.src)=='undefined'){
						var packageName = $('#'+gridId).closest('div[ns-package]').attr('ns-package');
						NetstarTemplate.templates.businessDataBaseMobile.refreshListByTreeNode(NetstarTemplate.templates.configs[packageName],ajaxData);
					}else{
						NetstarBlockListM.refreshById(gridId,ajaxData);
					}
				});
			}
			//查询输出
			function initSearch(_gridId,_$container){
				var inputId = 'input-'+_gridId;
				var formHtml = '<form action="javascript:return true;" role="form" aria-invalid="false" class="clearfix  standard compactmode " onsubmit="return false;" novalidate="novalidate">'
								+'<div class="input-group">' 
									+'<span class="input-group-addon"><i class="fa-search"></i></span>' 
									+'<input class="form-control" id="'+inputId+'" placeholder="' + searchInputPlaceholder + '" type="search">' 
									+'<div class="input-group-btn hidden" id="clearInput">' 
										+'<button class="btn btn-icon" type="button">' 
											+'<i class="fa-times-circle"></i>' 
										+'</button>' 
									+'</div>'
								+'</div>' 
								+'<div class="btn-group" ns-grid="'+_gridId+'" id="btn-'+_gridId+'">'
									+'<button class="btn btn-icon" nstype="confirm" type="button"><i class=""></i>确定</button>'
									+'<button class="btn btn-icon" nstype="cancel" type="button"><i class=""></i>取消</button>'
								+'</div>'
							+'</form>';
				_$container.html(formHtml);
				initSearchEvent({inputId:inputId,gridId:_gridId});
			}
			//查询初始化
			function quickQueryClickHandler(ev){
				var $searchContainer = $(this);
				$searchContainer.blur();
				var gridId = $searchContainer.attr('ns-grid');
				initSearch(gridId,$searchContainer);
				$('#'+searchInputId).off();
			}
			$('#'+searchInputId).on('click',quickQueryClickHandler);
		}
	},
	showPageDataByMobile:function(pageConfig,configObj){
		////console.log(pageConfig)
		///console.log(configObj)
		/*var listExpression = '<div class="block-list-item ">'
								+'<div class="block-list-item-text"><span class="title">{{customerName}}</span></div>'
								+'<div class="block-list-item-text text-left"><span>{{lineCode}}</span></div>'
								+'<div class="block-list-item-text text-left">'
									+'<span>{{startStation}}</span>'
									+'<i class="fa fa-arrow-right"></i>'
									+'<span>{{endStation}}</span>'
								+'</div>'
								+'<div class="block-list-item-text text-left">'
									+'<span>{{startCity}}</span>'
									+'<i class="fa fa-arrow-right"></i>'
									+'<span>{{endCity}}</span>'
								+'</div>'
								+'<div class="block-list-item-text text-left">'
									+'<span>{{whenStart}}</span>'
									+'<i class="fa fa-arrow-right"></i>'
									+'<span>{{whenEnd}}</span>'
								+'</div>'
								+'<div class="block-list-item-text text-left"><span>{{remark}}</span></div>'
							+'</div>';*/
		var gridId = 'grid-'+configObj.componentConfig.config.formID;
		var listConfig = {};
		for(var i=0; i<pageConfig.components.length; i++){
			if(pageConfig.components[i].type == 'blockList'){
				listConfig = pageConfig.components[i];
				break;
			}
		}
		var gridConfig = {
			id:gridId,
			columns:$.extend(true,[],listConfig.field),
			data:{
				idField:listConfig.idField,
			},
			ui:{
				selectMode:"single",
				listExpression:listConfig.listExpression,
			}
		};
		var gridAjax = listConfig.ajax;
		if(typeof(gridAjax)=="object"){
			if(typeof(gridAjax.contentType)=='undefined'){
				gridAjax.contentType = 'application/json; charset=utf-8';
			}
			gridConfig.data = NetStarUtils.getDefaultValues(gridConfig.data,gridAjax);
			gridConfig.data.data ={};
		}
		var btnId = 'btn-'+gridId;
		//给当前容器追加元素
		var appendHtml = '<div class="mobilewindow-fullscreen">'
							+'<div class="row layout-planes businessdatabasem">'
								+'<div class="nspanel-container nspanel col-xs-12 col-sm-12 notree no-query no-outbtns" ns-panel="blockList">'
									+'<div id="'+gridId+'" component-type="blockList">'
									+'</div>'
								+'</div>'
								+'<div class="btn-group" id="'+btnId+'" ns-gridid="'+gridId+'"><button class="btn btn-default" nstype="cancel"><span>清除</span></button><button class="btn btn-info" nstype="confirm"><span>确认</span></button></div>'
							+'</div>'
						+'</div>';
		$('container').append(appendHtml);
		var vueObj = NetstarBlockListM.init(gridConfig);
		
		$('#'+btnId+' button').on('click',function(ev){
			var $this = $(this);
			var nstype = $this.attr('nstype');
			var gridId = $this.parent().attr('ns-gridid');
			var formInputData = nsForm.data[configObj.componentConfig.config.formID].formInput[configObj.componentConfig.config.id];
			switch(nstype){
				case 'cancel':
					$('.mobilewindow-fullscreen').prev().remove();
					$('.mobilewindow-fullscreen').remove();
					nsUI.businessInput.setValue(formInputData,[]);
					break;
				case 'confirm':
					var selectedData = NetstarBlockListM.getSelectedData(gridId);
					$('.mobilewindow-fullscreen').prev().remove();
					$('.mobilewindow-fullscreen').remove();	
					nsUI.businessInput.setValue(formInputData,selectedData);
					break;
			}
		})
	},
	componentInitByMobile:function(paramObj){
		var ajaxConfig = {
			url:paramObj.componentConfig.config.source.url,
			type:'GET',
			dataType:'html',
			context:{
				config:paramObj
			}
		};
		NetStarUtils.ajaxForText(ajaxConfig,function(data,_this){
			var _config = _this.config;
			var container = _config.componentConfig.config.$container;
			var _configStr = JSON.stringify(_config);
			var funcStr = 'NetstarTemplate.showPageDataByMobile(pageConfig,' + _configStr + ')';
			var starStr = '<container>';
			var endStr = '</container>';
			var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
			var exp = /NetstarTemplate\.init\((.*?)\)/;
			var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
			containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
			var $container = $('container');
			$container.append(containerPage);
		});
	},
	commonFunc:{
		//验证
		validateByConfig:function(_config){
			var isValid = true;
			var validArr = 
			[
			   ['template','string',true],
			   ['title','string'],
			   ['components','array',true]
			];
			isValid = nsDebuger.validOptions(validArr,_config);//验证当前模板的配置参数
			//可以根据不同模板补充对应的验证方法
			return isValid;
		},
		//存储模板配置参数
		setTemplateParamsByConfig:function(_config){
			if(typeof(NetstarTemplate.templates[_config.template].data)=='undefined'){
				NetstarTemplate.templates[_config.template].data = {};  
			}
			var originalConfig = $.extend(true,{},_config);//保存原始值
			//记录config
			NetstarTemplate.templates[_config.template].data[_config.id] = {
				original:originalConfig,
				config:_config
			};
		},
		//根据按钮字段分类行内按钮和行外按钮
		getClassBtnsByBtnFieldArray:function(fieldArray){
			var classBtnJson = {
				inlineBtns:[],
				outBtns:[],
				templateBtns:[],
			 };
			 for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
				var fieldData = fieldArray[fieldI];
				var functionConfig = fieldData.functionConfig;
				var isInlineBtn = false;//默认行外按钮
				if(typeof(functionConfig)=='object'){
				   isInlineBtn = typeof(functionConfig.isInlineBtn) == 'boolean' ? functionConfig.isInlineBtn : false;
				}else{
					functionConfig = {};
				}
				if(isInlineBtn){
				   //行内按钮
				   classBtnJson.inlineBtns.push(fieldData);
				}else{
					if(functionConfig.TemplateButton){
						classBtnJson.templateBtns.push(fieldData);
					}else{
						classBtnJson.outBtns.push(fieldData);
					}
				}
			 }
			 return classBtnJson;
		},
		//循环输出按钮配置了operatorObject的按钮keyField和id
		getKeyFieldBtnsByComponents:function(_config){
			var btnKeyFieldJson = {};
			for(var i=0; i<_config.components.length;i++){
			   var componentData = _config.components[i];
			   switch(componentData.type){
				  case 'btns':
					var operatorObject = componentData.operatorObject ? componentData.operatorObject : 'root';
					btnKeyFieldJson[operatorObject] = componentData;
					var classBtnJson = this.getClassBtnsByBtnFieldArray(componentData.field);
					btnKeyFieldJson[operatorObject].inlineBtns = classBtnJson.inlineBtns;
					btnKeyFieldJson[operatorObject].outBtns = classBtnJson.outBtns;
					btnKeyFieldJson[operatorObject].templateBtns = classBtnJson.templateBtns;
					break;
			   }
			}
			return btnKeyFieldJson;
		},
		//设置默认值
		setDefault:function(_config){
			/**
			 * editModel  0 自己获取  默认值
			 * editModel 1 新增，自己创建空vo；不发ajax
			 * editModel 2  自己获取，只读
			 */
			var defaultConfig = {
				keyFieldNames:{},//{root: "root", saleDetailVoList: "root.saleDetailVoList"}
				idFieldsNames:{},//当前模板keyfield和idField对应关系的映射 如{'root':'id','root.salelist':'saleId','root.saleList.customerList':'customerId'}
				readonly:false,//默认整体模板不是只读
				isTab:false,//是否tab输出
				pageParam:{},//界面来源参
				parentSourceParam:{},//从某个界面进入当前界面，存储上一个界面的信息，方便关闭当前页面的时候刷新上一个界面信息
				mainComponent:{},//主信息
				mainVoComponent:{},//vo的主信息
				btnKeyFieldJson:{},//按钮keyfield
				serverData:{},//服务端数据
				detailLeftComponent:{},//横向排列 左侧组件
				isUseBtnPanelManager:false,//是否使用按钮面板配置
				componentIndexArrByVoList:{},
				componentsConfig:{
				   vo:{},
				   list:{},
				   btns:{},
				   tab:{},
				   blockList:{},
				   tree:{},
				   voList:{},
				   uploadCover:{},
				   countList:{},
				},//根据当前容器的id存储组件信息
				editModel:0,//默认自己获取
				uploadCoverArr:[],
				uploadCoverInit:{},
				tabConfig:{
					id:"tab-"+_config.id,
					queryConfig:{},
					listConfig:{},
					templatesConfig:_config,
					components:{},//组件有哪些
				  	field:'',//哪些keyfield字段要输出显示成tab形式
				},
				mainBtnArray:[],
				voByRightHeight:0,
				addInfoDialogData:{},//通过按钮类型defaultMode:addInfoDialog获取到的参数
			 };
			 NetStarUtils.setDefaultValues(_config,defaultConfig);
			 if(!$.isEmptyObject(_config.pageParam)){
				if(typeof(_config.pageParam.readonly)=='boolean'){
				   _config.readonly = _config.pageParam.readonly;
				   delete _config.pageParam.readonly;
				}
				if(_config.pageParam.editModel){
					_config.editModel = _config.pageParam.editModel;
					delete _config.pageParam.editModel;
				}
				switch(_config.editModel){
					case '2':
						_config.readonly = true;
						break;
					case '0':
						break;
					case '1':
						delete _config.getValueAjax;
						break;
				}
				if(!$.isEmptyObject(_config.pageParam.parentSourceParam)){
				   _config.parentSourceParam = _config.pageParam.parentSourceParam;
				   delete _config.pageParam.parentSourceParam;
				}
			 }
			 
			 var pageHeight = 0;
			 for(var name in NetstarTopValues){
				 pageHeight += NetstarTopValues[name].height;
			 }
			 if(_config.title){
				//标题高度
				pageHeight += 38;
			 }
		   	_config.templateCommonHeight = $(window).outerHeight() - pageHeight;
			//循环输出按钮配置了operatorObject的按钮下标和id
			_config.btnKeyFieldJson = this.getKeyFieldBtnsByComponents(_config);
			if(_config.pageExpression){
				_config.levelExpression = NetstarTemplate.getLevelByPageExpression(_config);// 页面表达式
			}
		},
		//获取page.data page.list.id
		getLevelDataByExpression:function(data,expression){
			var expressionArr = expression.split('.');
			var valueData = $.extend(true,{},data);
			for(var i = 0; i < expressionArr.length; i++){
				if(!valueData[expressionArr[i]]){
					valueData[expressionArr[i]] = {};
				}
				valueData = valueData[expressionArr[i]];
			}
			return valueData;
		},
		getBooleanValueByExpression:function(valueData,expression){
			//sjj 20190929
			//举例 expression {{hasRollback}}==false && {{hasEmergency}}==false
			//先解析表达式中的参数转换
			var rex1 = /\{\{(.*?)\}\}/g;
			var rex2 = /\{\{(.*?)\}\}/;
			var booleanValue = false;//默认返回false
			var listExpression = expression;
			if(rex2.test(expression)){
				var strArr = expression.match(rex1);
				for(var expI=0; expI<strArr.length; expI++){
					var field = strArr[expI].match(rex2)[1];
					var replaceValue;
					if(field.indexOf('.')>-1){
						replaceValue = this.getLevelDataByExpression(valueData,field);	
					}else{
						replaceValue = valueData[field];
					}
					if($.isEmptyObject(replaceValue)){
						replaceValue = null;
					}
					listExpression = listExpression.replace(strArr[expI], replaceValue);
				}
				try{
					booleanValue = eval(listExpression);
				}
			   	catch(listExpression){
					console.log(listExpression);
				}
			}
			return booleanValue;
		},//通过表达式获取当前面板或具体内容是否设置只读或者隐藏 
		vo:{
			//初始化vo  格式{'id':{field:[],type:}}
			initVo:function(_voComponents,_config){
				var serverData = typeof(_config.serverData)=='object' ? _config.serverData : {};
				var readonly = typeof(_config.readonly)=='boolean' ? _config.readonly : false;
				for(var voI in _voComponents){
					var id = voI;
					var componentData = _voComponents[voI];
					var fieldArray = $.extend(true,[],componentData.field);
					var componentReadonly = readonly;
					var expressionObj = {};
					if(componentData.readonlyExpression){
						//是否只读
						var tempalteParams = $.extend(true,{},serverData);
						if(!$.isEmptyObject(_config.pageParam)){
							tempalteParams.page = _config.pageParam;
						}
						//componentReadonly = NetstarTemplate.commonFunc.getBooleanValueByExpression(serverData,componentData.readonlyExpression);
						var readonlyExpression = JSON.parse(componentData.readonlyExpression);
						for(var expValue in readonlyExpression){
							var valueExpression = readonlyExpression[expValue];
							var currentReadonly = NetstarTemplate.commonFunc.getBooleanValueByExpression(tempalteParams,valueExpression);
							var englishNameArr = expValue.split(',');
							for(var nameI=0; nameI<englishNameArr.length; nameI++){
								expressionObj[englishNameArr[nameI]] = currentReadonly;
							}
						}
					}
					for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
					   	fieldArray[fieldI].readonly = componentReadonly;
						if(typeof(expressionObj[fieldArray[fieldI].id])=='boolean'){
							fieldArray[fieldI].readonly = expressionObj[fieldArray[fieldI].id];
						}
					   /*var fieldData = fieldArray[fieldI];
					   if(typeof(_config.serverData[fieldData.id])=='number'){
						   fieldData.value = _config.serverData[fieldData.id];
					   }else if(_config.serverData[fieldData.id]){
						   fieldData.value = _config.serverData[fieldData.id];
					   }*/
					}
					var formJson = {
						id:id,
						form:fieldArray,
						packageName:_config.package,
					    isSetMore:typeof(componentData.isSetMore)=='boolean' ? componentData.isSetMore : false,
					    getPageDataFunc:function(){
						  return _config.pageParam
					   }
					};
					if(typeof(componentData.blurHandler)=='function'){
						formJson.blurHandler = componentData.blurHandler;
					}
					if(typeof(componentData.completeHandler)=='function'){
						formJson.completeHandler = componentData.completeHandler;
					}
					if(typeof(componentData.getPageDataFunc)=='function'){
						formJson.getPageDataFunc = componentData.getPageDataFunc;
					}
					if(componentData.formStyle){
						formJson.formStyle = componentData.formStyle;
					}
					if(componentData.plusClass){
					   formJson.plusClass = componentData.plusClass;
					}
					if(typeof(componentData.height)=='number'){
						formJson.height = componentData.height;
					}
					if(componentData.defaultComponentWidth){
						formJson.defaultComponentWidth = componentData.defaultComponentWidth;
					}
					var isRootData = true; 
					if(componentData.parent){
						if(componentData.parent != 'root'){
							isRootData = false;
						}
					}
					var vKeyField = componentData.keyField ? componentData.keyField : 'root';
					if(vKeyField == 'root'){
						isRootData = true;
					}else{
						isRootData = false;
					}
					if(isRootData){
						NetstarComponent.formComponent.show(formJson,serverData);
					}else{
						var fillValues = serverData[componentData.parent];
						if($.isArray(serverData[componentData.parent])){
							fillValues = serverData[componentData.parent];
							if(fillValues.length > 0){
								fillValues = fillValues[0];
							}
						}else{
							if(typeof(componentData.parent) == "string" && componentData.parent != 'root'){
								fillValues = serverData[componentData.parent][vKeyField];
							}else{
								fillValues = serverData[vKeyField];
							}
						}
						NetstarComponent.formComponent.show(formJson,fillValues);
					}
					if(componentData.hiddenExpression){
						//隐藏表达式
						var isHide = NetstarTemplate.commonFunc.getBooleanValueByExpression(serverData,componentData.hiddenExpression);
						if(isHide){
							$('#'+componentData.id).addClass('hide');
						}
					}
					if(!$.isEmptyObject(componentData.params)){
						if(componentData.params.hideForm){
							//隐藏vo
							$('#'+componentData.id).parent().removeClass('current');
							$('#'+componentData.id).parent().addClass('hide');
							$('#'+componentData.id).parent().next().addClass('current');

							var liId = $('#'+componentData.id).attr('ns-tab');
							$('#'+liId).removeClass('current');
							$('#'+liId).addClass('hide');
							$('#'+liId).next().addClass('current');

							/*if(_config.serverData.fileId){
								var url = getRootPath()+'/files/pdf/'+_config.serverData.fileId+'?Authorization='+NetStarUtils.OAuthCode.get();
								//console.log(tabContentId)
								NetstarUI.pdfViewer.init({
								   id:componentData.id,
								   url:        url,
								   zoomFit:    'width',
								   isDownload: true,             //是否有下载
								});
							 }else{
								nsalert('fileId不存在无法生成pdf','error');
							 }*/
						}
					}
					//var component2 = NetstarComponent.formComponent.getFormConfig(formJson);
					//NetstarComponent.formComponent.init(component2,formJson);
				}
			},
			//赋值
			fillValues:function(data,voId){
				NetstarComponent.fillValues(data,voId);
			},
			//清空
			clearValues:function(voId,isClear){
				NetstarComponent.clearValues(voId,isClear);
			},
			//获取值
			getData:function(voId,valid){
				return NetstarComponent.getValues(voId,valid);
			}
		},
		list:{
			//初始化list
			initList:function(_listComponents,_config){
				var templateName = _config.template;
				var readonly = typeof(_config.readonly)=='boolean' ? _config.readonly : false;
				var serverData = typeof(_config.serverData)=='object' ? _config.serverData : {};
				for(var listI in _listComponents){
					var gridId = listI;
					var componentData = _listComponents[listI];
					var gridConfig = {
						id:gridId,
						type:componentData.type,
						idField:componentData.idField,
						templateId:_config.id,
						package:_config.package,
						plusClass:componentData.plusClass,
						// isReadStore:false,
						data:{
							isSearch:true,
							isPage:true,
							primaryID:componentData.idField,
							idField:componentData.idField,
						},
						columns:$.extend(true,[],componentData.field),
						ui:{
							isHaveEditDeleteBtn:false,
							isEditMode:false,
							selectMode:'single',
							defaultSelectedIndex:0,
						}
					};
					if(componentData.getPageDataFunc){
						gridConfig.getPageDataFunc = componentData.getPageDataFunc;
					}
					if(componentData.selectMode){
						gridConfig.ui.selectMode = componentData.selectMode;
					}
					if(typeof(componentData.isHaveEditDeleteBtn)=='boolean'){
						gridConfig.ui.isHaveEditDeleteBtn = componentData.isHaveEditDeleteBtn;
					}
					if(typeof(componentData.isEditMode)=='boolean'){
						gridConfig.ui.isEditMode = componentData.isEditMode;
					}
					if(typeof(componentData.componentHeight)=='number'){
						gridConfig.ui.height = componentData.componentHeight;
					}
					if(typeof(componentData.originalRowsChangeHandler)=='function'){
						gridConfig.ui.originalRowsChangeHandler = componentData.originalRowsChangeHandler;
					}
					if(!$.isEmptyObject(componentData.params)){
						for(var paramsI in componentData.params){
							if(paramsI == 'isServerMode'){
								gridConfig.data[paramsI] = componentData.params[paramsI];
							}else{
								gridConfig.ui[paramsI] = componentData.params[paramsI];
							}
						}
					}
					var componentReadonly = readonly;
					if(componentData.readonlyExpression){
						componentReadonly = NetstarTemplate.commonFunc.getBooleanValueByExpression(serverData,componentData.readonlyExpression);
					}
					if(templateName == 'limsReg'){
						//gridConfig.ui.height = 550;
						if(_config.tabConfig.field.indexOf(componentData.keyField)>-1){
							gridConfig.ui.isEditMode = !componentReadonly;
							gridConfig.ui.isHaveEditDeleteBtn = !componentReadonly;
							//gridConfig.ui.height -= 30;
						}
					}
					if(typeof(gridConfig.ui.ajaxSuccessHandler)=='function'){
						gridConfig.data.ajaxSuccessHandler = gridConfig.ui.ajaxSuccessHandler;
					}
					if(componentData.selectMode == 'none'){

					}else{
						if(typeof(gridConfig.ui.selectedHandler)!='function'){
							if(!gridConfig.ui.isEditMode){
								gridConfig.ui.selectedHandler = (function(_componentData){
									return function(data,$data,_vueData,_gridConfig){
										NetstarTemplate.templates[templateName].gridSelectedHandler(data, $data, _vueData, _gridConfig, _componentData);
									}
								})(componentData)
							}
						}
					}
					if(gridConfig.ui.isEditMode){
						//编辑模式下循环列，如果列中有业务组件需要绑定获取当前界面参的方法
						for(var c=0; c<gridConfig.columns.length; c++){
							var columnData = gridConfig.columns[c];
							switch(columnData.mindjetType){
								case 'business':
									if(!$.isEmptyObject(columnData.editConfig)){
										columnData.editConfig.getTemplateValueFunc = (function(_config){
											return function(){
												if(typeof(NetstarTemplate.templates[_config.template].getPageData)=='function'){
													return NetstarTemplate.templates[_config.template].getPageData(_config, false);
												}
											}
										})(_config)
									}
									break;
							}
						}
						if($.isArray(serverData[componentData.keyField])){
							gridConfig.data.dataSource = serverData[componentData.keyField];
						}else{
							if($.isArray(serverData[componentData.parent])){
								if(serverData[componentData.parent].length > 0){
									gridConfig.data.dataSource = serverData[componentData.parent][0][componentData.keyField];
								}	
							}
						}
						if(!$.isArray(gridConfig.data.dataSource)){
							gridConfig.data.dataSource = [];
						}
					}else{
						if(componentData.isAjax){
							var ajaxParams = $.extend(true,{},componentData.ajax);
							ajaxParams.data = typeof(ajaxParams.data)=='object' ? ajaxParams.data : {};
							var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
							var isUseObject = true;
							for(var key in ajaxParams.data){
								if(ajaxParameterRegExp.test(ajaxParams.data[key])){
									isUseObject = false;
									break;
								}
							}
							var pageParamJson = _config.pageParam;
							if(isUseObject){
								if(!$.isEmptyObject(pageParamJson)){
									ajaxParams.data = NetStarUtils.getDefaultValues(ajaxParams.data,pageParamJson);
								}
							}else{
								ajaxParams.data = NetStarUtils.getFormatParameterJSON(ajaxParams.data,pageParamJson);
							}
							gridConfig.ui.paramsData = ajaxParams.data;
							NetStarUtils.setDefaultValues(gridConfig.data,ajaxParams);
						}else{
							if($.isArray(serverData[componentData.keyField])){
								gridConfig.data.dataSource = serverData[componentData.keyField];
							}else{
								if($.isArray(serverData[componentData.parent])){
									if(serverData[componentData.parent].length > 0){
										gridConfig.data.dataSource = serverData[componentData.parent][0][componentData.keyField];
									}	
								}
							}
							if(!$.isArray(gridConfig.data.dataSource)){
								gridConfig.data.dataSource = [];
							}
						}
					}
					if(typeof(componentData.listDrawHandler)=='function'){
						gridConfig.ui.drawHandler = componentData.listDrawHandler;
					}
					if(!$.isEmptyObject(_config.btnKeyFieldJson)){
						var operatorObject = componentData.keyField ? componentData.keyField : 'root';
						if(_config.btnKeyFieldJson[operatorObject]){
							var tableRowBtns = _config.btnKeyFieldJson[operatorObject].inlineBtns;
							if(tableRowBtns.length > 0){
								function tableRowBtnsHandler(dataObj,currentParams){
									var btnData = currentParams.originalBtnData;
									var handler = btnData.handler;
									var packageName = currentParams.packageName;
									var templateId = NetstarTemplate.templates.configs[packageName].id;
									/*var templateId = dataObj.gridId.substring(0,dataObj.gridId.lastIndexOf('-list'));
									if(dataObj.gridId.indexOf('-block')>-1){
										templateId = dataObj.gridId.substring(0,dataObj.gridId.lastIndexOf('-block'));
									}*/
									dataObj.dialogBeforeHandler = (function(_pageParams){
										return function (data) {
											var templateNameStr = NetstarTemplate.templates.configs[_pageParams.packageName].template;
											return NetstarTemplate.templates[templateNameStr].dialogBeforeHandler(data,_pageParams.templateId);
										}
									})({templateId:templateId,packageName:packageName})
									dataObj.ajaxBeforeHandler = (function(_pageParams){
										return function (data) {
											data.value = _pageParams.rowData;
											var templateNameStr = NetstarTemplate.templates.configs[_pageParams.packageName].template;
											return NetstarTemplate.templates[templateNameStr].ajaxBeforeHandler(data,_pageParams.templateId);
										}
									})({templateId:templateId,rowData:dataObj.rowData,packageName:packageName})
									dataObj.ajaxAfterHandler = (function(_pageParams){
										return function (data,plusData) {
											var templateNameStr = NetstarTemplate.templates.configs[_pageParams.packageName].template;
											return NetstarTemplate.templates[templateNameStr].ajaxAfterHandler(data,_pageParams.templateId,plusData);
										}
									})({templateId:templateId,packageName:packageName})
									handler(dataObj,{$dom:dataObj.$btn,rowData:dataObj.rowData});
								}
								for(var btnI=0; btnI<tableRowBtns.length; btnI++){
									var originalBtnData = $.extend(true,{},tableRowBtns[btnI].btn);
									var currentParams = {packageName:_config.package,originalBtnData:originalBtnData};
									tableRowBtns[btnI].btn.handler = (function(currentParams){
										return function(data){
											tableRowBtnsHandler(data,currentParams);
										}
									})(currentParams)
								}
								gridConfig.ui.tableRowBtns = NetstarTemplate.getBtnArrayByBtns(tableRowBtns);
							}
						}
					}
					var vueObj = NetStarGrid.init(gridConfig);
					if(componentData.hiddenExpression){
						var isHide = NetstarTemplate.commonFunc.getBooleanValueByExpression(serverData,componentData.hiddenExpression);
						if(isHide){
							$('#'+componentData.id).addClass('hide');
						}
					}
					
					if(!$.isEmptyObject(_config.serverData)){
						if($.isArray(_config.serverData.contrastInfoVOList)){
						   NetstarComponent.setHistoryByTableID(_config.serverData.contrastInfoVOList, _config.serverData[componentData.keyField], componentData.idField, componentData.keyField, gridId);NetstarComponent.setHistoryByTableID(_config.serverData.contrastInfoVOList, _config.serverData[componentData.keyField], componentData.idField, gridId);
						}
						if($.isArray(_config.serverData.contrastObjectInfoVOList)){
						   NetstarComponent.setRowsHistoryByTableID(_config.serverData.contrastObjectInfoVOList, _config.serverData[componentData.keyField], componentData.idField, componentData.keyField, gridId);NetstarComponent.setHistoryByTableID(_config.serverData.contrastInfoVOList, _config.serverData[componentData.keyField], componentData.idField, componentData.keyField, gridId);
						}
					 }
				}
			},
			//添加行
			addRows:function(){

			},
			//删除行
			delRows:function(){

			},
			//修改行
			editRows:function(){

			},
			//刷新列表
			refresh:function(listId,dataArray){
				NetStarGrid.refreshDataById(listId,dataArray);
			},
			//获取值
			getData:function(listId,valid){
				valid = typeof(valid)=='boolean' ? valid : false;
				return NetStarGrid.dataManager.getData(listId,valid);
			},
			//获取选中值
			getSelectedData:function(gridId){
				return NetStarGrid.getSelectedData(gridId);
			}
		},
		blockList:{
			//初始化list
			initBlockList:function(_listComponents,_config){
				var templateName = _config.template;
				var readonly = typeof(_config.readonly)=='boolean' ? _config.readonly : false;
				var serverData = typeof(_config.serverData) ? _config.serverData : {};
				for(var listI in _listComponents){
					var gridId = listI;
					var componentData = _listComponents[listI];
					var gridConfig = {
						id:gridId,
						type:componentData.type,
						idField:componentData.idField,
						templateId:_config.id,
						package:_config.package,
						plusClass:componentData.plusClass,
						isReadStore:false,
						data:{
							isSearch:true,
							isPage:true,
							primaryID:componentData.idField,
							idField:componentData.idField,
						},
						columns:$.extend(true,[],componentData.field),
						ui:{
							isHaveEditDeleteBtn:false,
							isEditMode:false,
							selectMode:'single',
							defaultSelectedIndex:0,
							listExpression:componentData.listExpression,
							displayMode:'block',
						}
					};
					if(typeof(componentData.componentHeight)=='number'){
						gridConfig.ui.height = componentData.componentHeight;
					}
					if(componentData.isAjax){
						var ajaxParams = $.extend(true,{},componentData.ajax);
						if(!$.isEmptyObject(_config.pageParam)){
							ajaxParams.data = _config.pageParam;
						}
						NetStarUtils.setDefaultValues(gridConfig.data,ajaxParams);
					}else{
						if($.isArray(componentData.dataSource)){
							gridConfig.data.dataSource = componentData.dataSource;
						}
					}
					if(!$.isEmptyObject(componentData.params)){
						for(var paramsI in componentData.params){
							gridConfig.ui[paramsI] = componentData.params[paramsI];
						}
					}
					if(typeof(gridConfig.ui.ajaxSuccessHandler)=='function'){
						gridConfig.data.ajaxSuccessHandler = gridConfig.ui.ajaxSuccessHandler;
					}	
					if(typeof(gridConfig.ui.selectedHandler)!='function'){
						gridConfig.ui.selectedHandler = function(data,$data,_vueData,_gridConfig){
							NetstarTemplate.templates[templateName].gridSelectedHandler(data,$data,_vueData,_gridConfig);
						}
					}
					if(!$.isEmptyObject(_config.btnKeyFieldJson)){
						if(_config.btnKeyFieldJson[componentData.keyField]){
							var tableRowBtns = _config.btnKeyFieldJson[componentData.keyField].inlineBtns;
							if(tableRowBtns.length > 0){
								function tableRowBtnsHandler(dataObj,currentParams){
									var btnData = currentParams.originalBtnData;
									var handler = btnData.handler;
									var packageName = currentParams.packageName;
									var templateId = NetstarTemplate.templates.configs[packageName].id;
									/*var templateId = dataObj.gridId.substring(0,dataObj.gridId.lastIndexOf('-list'));
									if(dataObj.gridId.indexOf('-block')>-1){
										templateId = dataObj.gridId.substring(0,dataObj.gridId.lastIndexOf('-block'));
									}*/
									dataObj.dialogBeforeHandler = (function(_pageParams){
										return function (data) {
											var templateNameStr = NetstarTemplate.templates.configs[_pageParams.packageName].template;
											return NetstarTemplate.templates[templateNameStr].dialogBeforeHandler(data,_pageParams.templateId);
										}
									})({templateId:templateId,packageName:packageName})
									dataObj.ajaxBeforeHandler = (function(_pageParams){
										return function (data) {
											data.value = _pageParams.rowData;
											var templateNameStr = NetstarTemplate.templates.configs[_pageParams.packageName].template;
											return NetstarTemplate.templates[templateNameStr].ajaxBeforeHandler(data,_pageParams.templateId);
										}
									})({templateId:templateId,rowData:dataObj.rowData,packageName:packageName})
									dataObj.ajaxAfterHandler = (function(_pageParams){
										return function (data,plusData) {
											var templateNameStr = NetstarTemplate.templates.configs[_pageParams.packageName].template;
											return NetstarTemplate.templates[templateNameStr].ajaxAfterHandler(data,_pageParams.templateId,plusData);
										}
									})({templateId:templateId,packageName:packageName})
									handler(dataObj,{$dom:dataObj.$btn,rowData:dataObj.rowData});
								}
								for(var btnI=0; btnI<tableRowBtns.length; btnI++){
									var originalBtnData = $.extend(true,{},tableRowBtns[btnI].btn);
									var currentParams = {packageName:_config.package,originalBtnData:originalBtnData};
									tableRowBtns[btnI].btn.handler = (function(currentParams){
										return function(data){
											tableRowBtnsHandler(data,currentParams);
										}
									})(currentParams)
								}
								if(!readonly){
									// 不是只读 
									gridConfig.ui.tableRowBtns = NetstarTemplate.getBtnArrayByBtns(tableRowBtns);
								}
							}
						}
					}
					var componentReadonly = readonly;
					if(componentData.readonlyExpression){
						componentReadonly = NetstarTemplate.commonFunc.getBooleanValueByExpression(serverData,componentData.readonlyExpression);
					}
					if(componentReadonly){
						delete gridConfig.ui.tableRowBtns;
					}
					if($.isArray(serverData[componentData.keyField])){
						gridConfig.data.dataSource = serverData[componentData.keyField];
					}
					var vueObj = NetstarBlockList.init(gridConfig);

					if(componentData.hiddenExpression){
						var isHide = NetstarTemplate.commonFunc.getBooleanValueByExpression(serverData,componentData.hiddenExpression);
						if(isHide){
							$('#'+componentData.id).addClass('hide');
						}
					}
				}
			},
			//添加行
			addRows:function(){

			},
			//删除行
			delRows:function(){

			},
			//修改行
			editRows:function(){

			},
			//刷新列表
			refresh:function(gridId,dataArray){
				NetstarBlockList.refreshDataById(gridId,dataArray);
			},
			///获取值
			getData:function(){

			},
			//获取选中值
			getSelectedData:function(gridId){
				return NetstarBlockList.getSelectedData(gridId);
			}
		},
		btns:{
			showPageData:function(pageConfig, configObj, pageOperateData){
				//configObj:{gridConfig:currentGridConfig,controllerObj:functionConfig,templateName:templateName,value:value,package:configObj.package}
				var controllerObj = configObj.controllerObj;
				switch(controllerObj.editorType){
					case 'add':
						//新增 不需要发送ajax
						delete pageConfig.getValueAjax;
						pageConfig.pageParam = {};
						break;
					case 'copyAdd':
						pageConfig.pageParam = {
							copyParams:$.extend(true,{},configObj.value),
						};
						pageConfig.pageParam.editorType = 'copyAdd';
						if(!controllerObj.isUseAjaxByCopyAdd){
							delete pageConfig.getValueAjax;
						}
						delete pageConfig.pageParam.readonly;
						break;
					case 'edit':
						pageConfig.pageParam = configObj.value;
						pageConfig.pageParam.editorType = 'edit';
						delete pageConfig.pageParam.readonly;
						break;
					case 'query':
						pageConfig.pageParam = configObj.value;
						pageConfig.pageParam.readonly = true;
						break;	
				}
				// 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 start ---
				var formatValueData = controllerObj.formatValueData; 
				// 转化对象
				if(typeof(formatValueData) == "string" && formatValueData.length>0){
					 formatValueData = JSON.parse(formatValueData);
				}
				if(typeof(formatValueData) == "object"){
					pageOperateData = typeof(pageOperateData) == "object" ? pageOperateData : {};
					if($.isEmptyObject(pageOperateData)){
						pageOperateData = configObj.value;
					}
					var valueData = NetStarUtils.getFormatParameterJSON(formatValueData, pageOperateData);
					if(valueData){
							if(typeof(pageConfig.pageParam) != "object"){
								pageConfig.pageParam = {};
							}
							for(var key in valueData){
								pageConfig.pageParam[key] = valueData[key];
							}
					}
				}
				// 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 end ---
				pageConfig.closeHandler = (function(){
					//根据当前模板去刷新
					return function(){
						NetstarTemplate.templates[configObj.templateName].refreshByGridconfig(configObj.gridConfig,configObj.package);
					}
				})(configObj);
				NetstarTemplate.init(pageConfig);
			},
			editorDialogShowByBtnHandler:function(data){
				//console.log(data);
				var ajaxBeforeData = data.dialogBeforeHandler(data);//通过模板回调获取到模板的配置参数
				var tempalteConfig = ajaxBeforeData.config;
				var functionConfig = data.data.functionConfig;//按钮上的方法配置参数
				var operatorObject = functionConfig.operatorObject;//判断当前操作的是哪个组件（根据keyField）
				var value = {};
				var templateName = tempalteConfig.template;//模板名字
				var currentGridConfig = {};//当前组件的配置
				switch(templateName){
					case 'businessbasePanoramic':
						//基本业务全景模板
						if(operatorObject == 'root'){
							//获取模板主数据
							currentGridConfig = tempalteConfig.mainComponent;
						}else{
							//根据keyField获取数据
							var tabComponents = tempalteConfig.components;
							for(var gid in tabComponents){
								if(tabComponents[gid].keyField == operatorObject){
									currentGridConfig = tabComponents[gid];
									break;//终止循环
								}
							}
						}
						break;
					case 'businessDataBaseLevel3':
						//基本业务全景模板
						if(operatorObject == 'root'){
							//获取模板主数据
							currentGridConfig = tempalteConfig.mainComponent;
						}else{
							//根据keyField获取数据
							if(tempalteConfig.level2Config.keyField == operatorObject){
								currentGridConfig = tempalteConfig.level2Config;
							}
							if(tempalteConfig.level3Config.keyField == operatorObject){
								currentGridConfig = tempalteConfig.level3Config;
							}
						}
						break;
					case 'businessDataBase':
						//基本业务对象模板
						currentGridConfig = tempalteConfig.mainComponent;
						break;
				}
				if(currentGridConfig){
					//存在grid配置
					var gridId = currentGridConfig.id;
					if(currentGridConfig.type == 'list'){
						value = NetstarTemplate.templates[templateName].getSelectedDataByGridId(gridId);
					}else if(currentGridConfig.type == 'blockList'){
						value = NetstarTemplate.templates[templateName].getSelectedDataByBlockGridId(gridId);
					}
					if($.isArray(value)){value = value[0];}
					if(functionConfig.editorType == 'copyAdd'){
						//复制新增不传送id
						//delete value[currentGridConfig.idField];
					}
				}
				var isContinue = true;
				if($.isEmptyObject(value)){
					//值为空并且当前模式是复制新增或者编辑状态下
					if(functionConfig.editorType == 'copyAdd' || functionConfig.editorType == 'edit'){
						nsalert('请先选中要编辑的值');
						isContinue = false;
					}
				}
				if(isContinue){
					//继续 开始请求ajax弹出页面
					if(!$.isEmptyObject(tempalteConfig.pageParam)){
						NetStarUtils.setDefaultValues(value,tempalteConfig.pageParam);//把界面来源参传入
					}
					var url = functionConfig.url;
					//判断url链接是否自带配置参数editModel
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
					if(!$.isEmptyObject(value)){
						var tempValueName = tempalteConfig.package + new Date().getTime();
						NetstarTempValues[tempValueName] = value;
						var urlStr = encodeURIComponent(encodeURIComponent(tempValueName));
						url = url+'?templateparam='+urlStr;
					}
					var configObj  = {
						gridConfig:currentGridConfig,
						controllerObj:functionConfig,
						templateName:templateName,
						value:value,
						package:tempalteConfig.package,
					};
					
					configObj.getOperateData = function(){
						var operateData = NetstarTemplate.getOperateData(tempalteConfig);
						// return NetstarTemplate.templates[templateName].getSelectedDataByGridId(tempalteConfig.mainComponent.id);
						return operateData;
					}
					var pageConfig = {
						pageIidenti : url,
						paramObj : urlStr,
						url : url,
						config : configObj,
						callBackFunc : function(isSuccess, data, _pageConfig){
							if(isSuccess){
								var _config = _pageConfig.config;
								var _configStr = JSON.stringify(_config);
							
								// 获取页面操作数据 start ---
								var pageOperateData = {};
								if(typeof(_config.getOperateData) == "function"){
									pageOperateData = _config.getOperateData();
								}
								var pageOperateDataStr = JSON.stringify(pageOperateData);
								// 获取页面操作数据 end ---
				
								var funcStr = 'NetstarTemplate.commonFunc.btns.showPageData(pageConfig,' + _configStr + ',' + pageOperateDataStr + ')';
								//var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
								var starStr = '<container>';
								var endStr = '</container>';
								var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
								var exp = /NetstarTemplate\.init\((.*?)\)/;
								var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
								containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
								var $container = nsPublic.getAppendContainer();
								$container.append(containerPage);
							}else{
								nsalert(data.msg,'error');
							}
						},
					}
					pageProperty.getAndCachePage(pageConfig);
				}
			},//按钮defaultMode为editorDialog的事件触发
			//初始化btn
			initBtns:function(_btnComponents,_config,isStore){
				var readonly = typeof(_config.readonly)=='boolean' ? _config.readonly : false;
				var serverData = typeof(_config.serverData) ? _config.serverData : {};
				var tempalteParams = $.extend(true,{},serverData);
				if(!$.isEmptyObject(_config.pageParam)){
					tempalteParams.page = _config.pageParam;
				}
				isStore = typeof(isStore)=='boolean' ? isStore : true;
				for(var btnI in _btnComponents){
					var id = btnI;
					var componentData = _btnComponents[btnI];
					var operatorObject = componentData.operatorObject ? componentData.operatorObject : 'root';
					var classBtnJson = _config.btnKeyFieldJson[operatorObject];
					var btnFieldArray = componentData.field;
					if(!$.isEmptyObject(classBtnJson)){
					   btnFieldArray = classBtnJson.outBtns;
					   if(classBtnJson.templateBtns){
						   var templateBtnsArr = classBtnJson.templateBtns;
						   for(var t=0; t<templateBtnsArr.length; t++){
							   templateBtnsArr[t].btn.handler = NetstarTemplate.templates[_config.template].templateBtnsHandler;
							   btnFieldArray.push(templateBtnsArr[t]);
						   }
					   }
					}
					if(isStore){
						NetstarBtnPanelManager.setBtnDataEnglishNameByBtnField(btnFieldArray,id);//根据按钮配置字段获取根据englistname存储按钮信息的操作
						var storeBtnFieldArray = store.get('dialog-'+id);
						if($.isArray(storeBtnFieldArray)){
							if(storeBtnFieldArray.length > 0){
								NetstarBtnPanelManager.setStoreDataByEnglishName(storeBtnFieldArray,id);
								btnFieldArray = storeBtnFieldArray;
							}
						}
					}

					if(componentData.operatorObject == 'root' || $.isEmptyObject(componentData.operatorObject)){
						//如果定义了按钮输出在主表或者没有定义 则默认都按当前按钮操作数据是主表处理
						for(var i=0;i<btnFieldArray.length; i++){
							if(btnFieldArray[i].functionConfig){
								btnFieldArray[i].functionConfig.isOperatorMain = true;
							}
						}
					}
					
					//循环读取btnFieldArray 原因如果里面定义了defaultMode='editorDialog'则需要根据此类型进行拆分按钮
					//原因如果里面定义了defaultMode='editorDialog' 可以输出新增，复制新增，编辑三个按钮
					
					var editorDialogIndex = -1;//defaultMode为editorDialog并且输出类型editorType长度大于1
					for(var btnJ=0; btnJ<btnFieldArray.length; btnJ++){
						var functionConfig = btnFieldArray[btnJ].functionConfig ? btnFieldArray[btnJ].functionConfig : {};
						var baseConfig = btnFieldArray[btnJ].btn;
						var editorType = functionConfig.editorType;//当前按钮输出类型 add,copyAdd,edit
						functionConfig.operatorObject = componentData.operatorObject ? componentData.operatorObject : 'root';//按钮操作对象
						switch(functionConfig.defaultMode){
							case 'editorDialog':
								if(editorType){
									//定义了当前按钮的类型和输出类型 需要判断当前类型输出的长度
									var editorTypeArr = editorType.split(',');//以逗号为分割 输出数组格式
									if(editorTypeArr.length == 1){
										//当前此类型只输出一种类型 则只需要绑定此按钮的调用方法即可
										//根据当前输出类型绑定快捷键
										var shortcutKey;
										switch(editorType){
											case 'add':
												shortcutKey = 'Ctrl+O';
												break;
											case 'copyAdd':
												shortcutKey = 'Ctrl+C';
												break;
											case 'edit':
												shortcutKey = 'Ctrl+E';
												break;
										}
										if(shortcutKey){
											//只有当类型为add,copyAdd,edit才会绑定快捷键
											functionConfig.shortcutKey = shortcutKey;
										}
										baseConfig.handler = NetstarTemplate.commonFunc.btns.editorDialogShowByBtnHandler; //绑定调用方法
									}else{
										//当前输出类型为两种以上记录下此下标
										editorDialogIndex = btnJ;
									}
								}
								break;
						}
					}
					
					if(editorDialogIndex > -1){
						//defaultMode为editorDialog并且输出类型editorType长度大于1
						var editorDialogBtnData = btnFieldArray[editorDialogIndex];//输出当前按钮的配置
						var baseConfig = editorDialogBtnData.btn;
						var functionConfig = editorDialogBtnData.functionConfig;
						var editorType = functionConfig.editorType;
						var textArr = baseConfig.text.split(',');//以逗号为分割 输出数组格式
						var editorDialogBtnArr = [];
						for(var textI=0; textI<textArr.length; textI++){
							var editorDialogJson = {
								functionConfig:$.extend(true,{},functionConfig),
							};
							var shortcutKey = '';
							var currentEditorType = '';
							switch(textArr[textI]){
								case '新增':
									shortcutKey = 'Ctrl+O';
									currentEditorType = 'add';
									break;
								case '复制新增':
									shortcutKey = 'Ctrl+C';
									currentEditorType = 'copyAdd';
									break;
								case '编辑':
									shortcutKey = 'Ctrl+E';
									currentEditorType = 'edit';
									break;
							};
							editorDialogJson.functionConfig.shortcutKey = shortcutKey;
							editorDialogJson.functionConfig.editorType = currentEditorType;
							editorDialogJson.btn = {
								text:textArr[textI],
								handler:NetstarTemplate.commonFunc.btns.editorDialogShowByBtnHandler, //绑定调用方法
							}
							editorDialogBtnArr.push(editorDialogJson);
						}
						if(editorDialogBtnArr.length > 0){
							var editorDialogBtnLength = editorDialogBtnArr.length;
							btnFieldArray.splice(editorDialogIndex,1,editorDialogBtnArr[editorDialogBtnLength-1]);//移除数组的第editorDialogIndex个元素，并在数组第editorDialogIndex个位置添加新元素:
							for(var e=editorDialogBtnLength-2; e>=0; e--){
								btnFieldArray.splice(editorDialogIndex,0,editorDialogBtnArr[e]);//从第editorDialogIndex个元素开始添加
							}
						}
					}
					/*****************循环读取btnFieldArray end********************************************** */
					var fieldArray = NetstarTemplate.getBtnArrayByBtns(btnFieldArray);//得到按钮值
					var componentReadonly = readonly;
					var expressionObj = {};
					if(componentData.readonlyExpression){
						//定义了只读表达式 
						//举例{"save,saveAndSubmit":"{{page.saveParams}}==true","createAcceptBill,price":"{{id}}==undefined"}
						var readonlyExpression = JSON.parse(componentData.readonlyExpression);
						for(var expValue in readonlyExpression){
							var valueExpression = readonlyExpression[expValue];
							var currentReadonly = NetstarTemplate.commonFunc.getBooleanValueByExpression(tempalteParams,valueExpression);
							var englishNameArr = expValue.split(',');
							for(var nameI=0; nameI<englishNameArr.length; nameI++){
								//根据定义的按钮英文名字分别存储当前按钮所处的状态
								expressionObj[englishNameArr[nameI]] = currentReadonly;
							}
						}
					} 
					for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
						var fieldData = fieldArray[fieldI];
						/**lyw 如果按钮设置了只读则不必读取表达式参数和页面只读参数start**/
						if(fieldData.disabled){
							continue;
						}
						/**lyw 如果按钮设置了只读则不必读取表达式参数和页面只读参数end**/
						fieldData.disabled = componentReadonly;
						if(typeof(expressionObj[fieldData.functionConfig.englishName])=='boolean'){
							//如果自定义了按钮的英文名字设置是否禁用
							fieldData.disabled = expressionObj[fieldData.functionConfig.englishName];
						}
						if($.isArray(fieldData.subdata)){
							for(var s=0; s<fieldData.subdata.length; s++){
								fieldData.subdata[s].disabled = componentReadonly;
								if(fieldData.subdata[s].functionConfig){
									var englishName = fieldData.subdata[s].functionConfig.englishName;	
									if(typeof(expressionObj[englishName])=='boolean'){
										//如果自定义了按钮的英文名字设置是否禁用
										fieldData.subdata[s].disabled = expressionObj[englishName];
									}
								}
							}
						}
					}
					if(_config.isUseBtnPanelManager){
						//当前模板允许使用按钮配置模板
						fieldArray.push({
							text:'更多',
							handler:function(data){
								var $this = $(data.event.currentTarget);
								var btnID = $this.closest('.nav-form').attr('id');
								var templateConfig = {};
								if(typeof(data.dialogBeforeHandler)=='function'){
									templateConfig = data.dialogBeforeHandler(data).config;
								}else{
									if($this.closest('div[ns-template-package]').length > 0){
										var packageName = $this.closest('div[ns-template-package]').attr('ns-template-package');
										var _templateConfig = NetstarTemplate.templates.configs[packageName];
										templateConfig = NetstarTemplate.templates.limsReg.data[_templateConfig.id].config;
									}
								}
								var btnPanelManagerConfig = {
									package:templateConfig.package,//包名
									containerId:btnID,//按钮容器id
									//field:templateConfig.componentsConfig.btns[btnID].field,//按钮字段
									field:templateConfig.btnKeyFieldJson.root.outBtns,//按钮字段
									readonlyExpression:templateConfig.btnKeyFieldJson.root.readonlyExpression,
									hiddenExpression:templateConfig.btnKeyFieldJson.root.readonlyExpression,
								};
								NetstarBtnPanelManager.init(btnPanelManagerConfig,true);
							}
						});
					}
					var btnJson = {
					   id:id,
					   isShowTitle:false,
					   pageId:_config.id,
					   package:_config.package,
					   btns:fieldArray,
					   callback:{
							 dialogBeforeHandler:(function(_config){
								return function (data) {
								   return NetstarTemplate.templates[_config.template].dialogBeforeHandler(data,_config.id);
								}
							 })(_config),
							 ajaxBeforeHandler:(function(_config){
								return function (data) {
								   return NetstarTemplate.templates[_config.template].ajaxBeforeHandler(data,_config.id);
								}
							 })(_config),
							 ajaxAfterHandler:(function(_config){
								return function (data,plusData) {
								   return NetstarTemplate.templates[_config.template].ajaxAfterHandler(data,_config.id,plusData);
								}
							 })(_config),
							 getOperateData:(function(_config){
								return function () {
								   var pageData = NetstarTemplate.getOperateData(_config);
								   return pageData;
								}
							 })(_config),
							 dataImportComplete:(function(_config){
								return function (data) {
									NetstarTemplate.templates[_config.template].refreshByConfig(_config);
								}
							 })(_config),
							 refreshByConfig:(function(_config){
								return function (data) {
									NetstarTemplate.templates[_config.template].refreshByConfig(_config);
								}
							 })(_config),
					   }
					};
					vueButtonComponent.init(btnJson);

					if(componentData.hiddenExpression){
						var hiddenExpression = JSON.parse(componentData.hiddenExpression);
						for(var expValue in hiddenExpression){
							var valueExpression = hiddenExpression[expValue];
							var currentHidden = NetstarTemplate.commonFunc.getBooleanValueByExpression(tempalteParams,valueExpression);
							var englishNameArr = expValue.split(',');
							if(currentHidden){
								for(var nameI=0; nameI<englishNameArr.length; nameI++){
									//根据定义的按钮英文名字分别存储当前按钮所处的状态
									$('button[ns-field="'+englishNameArr[nameI]+'"]').addClass('hide');
								}
							}
						}
					}
				}
			}
		},
		tree:{
			init:function(_treeComponents,_config){
				for(var treeId in _treeComponents){
					var treeConfig = _treeComponents[treeId];
					NetstarTemplate.tree.init(treeConfig);
				}
			}
		},
		voList:{
			init:function(_componentData,_config){
				var pageData = typeof(_config.pageData)=='object' ? _config.pageData : {};
				for(var voId in _componentData){
					var componentConfigByVo = _componentData[voId];
					var voJson = {
						id:componentConfigByVo.id,
						templateName: 'form',
						componentTemplateName: 'PC',
						isSetMore:false,
						form:[],
					};
					_config.componentIndexArrByVoList[componentConfigByVo.id] = [];
					if(componentConfigByVo.defaultComponentWidth){
						voJson.defaultComponentWidth = componentConfigByVo.defaultComponentWidth;
					}
					var fillValusData = [];
					var parentField = componentConfigByVo.parent ? componentConfigByVo.parent : 'root';
					var keyField = componentConfigByVo.keyField;
					if(keyField == 'root'){
						fillValusData = pageData;
					}else{
						if(parentField == 'root'){
							if($.isArray(pageData[keyField])){
								fillValusData = pageData[keyField];
							}
						}
					}
					if(typeof(fillValusData)=='undefined'){fillValusData = [];}
					var titleFieldConfig = {};
					var valueFieldConfig = {};
					for(var fieldI=0; fieldI<componentConfigByVo.field.length; fieldI++){
						var fieldData = componentConfigByVo.field[fieldI];
						var isTitle = typeof(fieldData.isTitle)=='boolean' ? fieldData.isTitle : false;
						var isValue = typeof(fieldData.isValue)=='boolean' ? fieldData.isValue : false;
						if(isTitle){
							titleFieldConfig = fieldData;
						}
						if(isValue){
							valueFieldConfig = fieldData;
						}
					}
					if(fillValusData.length > 0 && !$.isEmptyObject(titleFieldConfig) && !$.isEmptyObject(valueFieldConfig)){
						var valueJsonData = {};
						for(var i=0; i<fillValusData.length; i++){
							var fieldJson = $.extend(true,{},valueFieldConfig.editConfig);
							fieldJson.id = valueFieldConfig.field+'-'+fillValusData[i][componentConfigByVo.idField];
							fieldJson.label = fillValusData[i][titleFieldConfig.field];
							valueJsonData[fieldJson.id] = fillValusData[i][valueFieldConfig.field];
							fieldJson.package = _config.package;
							fieldJson.voListByIdStr = fillValusData[i][componentConfigByVo.idField];
							fieldJson.originalId = valueFieldConfig.field;
							if(!$.isEmptyObject(fieldJson.data)){
								var formatJsonData = {this:fillValusData[i],page:pageData};
								fieldJson.data = NetStarUtils.getFormatParameterJSON(fieldJson.data,formatJsonData);
							}
							if(!$.isEmptyObject(fieldJson.outputFields)){
								var newOutputFields = {};
								for(var outI in fieldJson.outputFields){
									var newOutFieldName = outI+'-'+fillValusData[i][componentConfigByVo.idField];
									newOutputFields[newOutFieldName] = fieldJson.outputFields[outI];
									_config.componentIndexArrByVoList[componentConfigByVo.id].push(newOutFieldName);
								}
								fieldJson.outputFields = newOutputFields;
							}
							voJson.form.push(fieldJson);
						}
						/*if(componentConfigByVo.title){
							voJson.form.unshift({
								type:'label',
								label:componentConfigByVo.title
							});
						}*/
						$('#' + componentConfigByVo.id).children().remove();   // lyw 刷新时调的初始化方法，导致出现两个表单，删除上次初始化 nspt-processdocsecond模板出现问题 20191221
						NetstarComponent.formComponent.show(voJson,valueJsonData);
					}
				}
			},
		},
		uploadCover:{
			init:function(_componentData,_config){
				for(var uploadId in _componentData){
					var uploadCoverData = _componentData[uploadId];
					console.log(uploadCoverData);
					uploadCoverData.uploadBtnId = uploadCoverData.id + '-clickToUpload';
					var imgUpload = {
						alreadyHave: 0,
						limitType: "image/gif,image/jpeg,image/bmp,image/png".split(','),
						templateHtml: '<div class="pt-upload">\
									   <div class="pt-upload-header">\
										  <!-- 上传按钮 -->\
										  <div class="pt-btn-group">\
											 <button id="'+uploadCoverData.uploadBtnId+'" class="pt-btn pt-btn-default pt-btn-icon pt-btn-lg">\
												<input style="width:100%;" class="pt-upload-control" accept="image/gif, image/jpeg, image/bmp, image/png" multiple="multiple" type="file" name="file" multiple="multiple">\
												<i class="icon-add"></i>\
											 </button>\
										  </div>\
										  <!-- title -->\
										  <div class="pt-title">\
											 <span>图片上传</span>\
											 <small>图片大小不能超过500kb。图片格式必须为jpg，gif，png，bmp</small>\
										  </div>\
									   </div>\
									   <!-- 图片列表 -->\
									   <div class="pt-media-list">\
									   </div>\
									</div>',
						mediaItem: '<div class="pt-media-item">\
										  <!-- 图片 -->\
										  <!-- 设为封面 favorite -->\
										  <div class="pt-media-image">\
												<a href="#">\
												   <img alt="">\
												</a>\
												<div class="pt-media-edit">\
												   <div class="pt-btn-group">\
													  <button class="pt-btn pt-btn-icon deleteCoverImg" title="删除">\
															<i class="icon-trash"></i>\
													  </button>\
												   </div>\
												</div>\
										  </div>\
									   </div>',
						//上传界面构建
						buildUploadCover: function () {
							var $uploadMain = $(this.templateHtml);
							this.uploadConfig = uploadCoverData;
							this.$container = $('#' + this.uploadConfig.id);
							this.$container.html($uploadMain);
						},
						//上传
						chooseImage: function () {
							var _this = this;
							//图片上传
							var $filePicker = $('#' + _this.uploadConfig.uploadBtnId).find('input[type="file"]');
							$filePicker.on('change',function (e) {
							   var files = $filePicker.prop('files');
							   _this.uploadFiles(files); //上传成功之后再显示图片
							   $filePicker.val("");
							});
						},
						//压缩图片
						imageCompressor: function (files, cb) {
						
						},
						//验证图片
						validFiles: function (files) {
						   var len = files.length;
						   if (len == 0) return false;
						   for (var i = 0; i < len; i++) {
							  var item = files[i];
							  //图片大小限制
							  if ((item.size / 1024) > 500) {
								 nsalert('图片大小不能超过500kb');
								 return false;
							  }
							  //图片类型限制
							  if ($.inArray(item.type, this.limitType) == -1) {
								 nsalert('图片格式必须为jpg,gif,png,bmp');
								 return false;
							  }
						   }
						   return true;
						},
						//显示图片
						showTheFiles: function (files, noCount) {
							this.$container.find('.pt-media-list').html('');
							var imagesArr = _config.uploadCoverArr;
							var uploadConfig = this.uploadConfig;
							for (var i = 0, len = imagesArr.length; i < len; i++) {
								var $mediaItem = $(this.mediaItem);
								var imageData = imagesArr[i];
								var fileId = imageData[uploadConfig.imgIdField];

								$mediaItem.find('.deleteCoverImg').attr('ns-index', i);
								$mediaItem.find('.setAsCover').attr('ns-index', i);
								$mediaItem.find('.renameCoverImg').attr('ns-index', i);
					
								$mediaItem.find('.deleteCoverImg').attr('ns-fileid', fileId);
								$mediaItem.find('.setAsCover').attr('ns-fileid', fileId);
								$mediaItem.find('.renameCoverImg').attr('ns-fileid', fileId);
					
								//图片处理
								var name = imageData.name.substr(0, imageData.name.lastIndexOf('.'));
					
								var url = uploadConfig.readSrcAjax.src+'/'+fileId;
								$mediaItem.find('.pt-media-image img').attr('src', url);
								$mediaItem.find('.pt-media-title span').text(name);
								$('#'+uploadConfig.id).find('.pt-media-list').append($mediaItem);
							}
							this.addEvent();
						},
						//上传图片
						uploadFiles: function(files){
							var formData = new FormData();
							for (var i = 0, len = files.length; i < len; i++) {
							   var item = files[i];
							   formData.append('files',item,item.name);
							}
							if(this.uploadConfig.uploadAjaxData){
								var uploadAjaxData = JSON.parse(this.uploadConfig.uploadAjaxData);
								for(var data in uploadAjaxData){
								   formData.append(data,uploadAjaxData[data]);
								}
							}
							// 发送ajax
							var uploadAjaxConfig = $.extend(true,{},this.uploadConfig.ajax);
							uploadAjaxConfig.processData = false;
							uploadAjaxConfig.contentType = false;
							formData.append('visibilityLevel',2);
							formData.append('categories',['image:0.1']);
							uploadAjaxConfig.data = formData;
							uploadAjaxConfig.plusData = {
								originalFiles:files,
								_vueObj:this,
							};
							NetStarUtils.ajax(uploadAjaxConfig, function (res,ajaxData) {
							if (res.success) {
								nsalert("上传成功");
								var ajaxPlusData = ajaxData.plusData._vueObj;
								for(var fileI=0; fileI<res.rows.length; fileI++){
									var idJson = {};
									idJson[ajaxPlusData.uploadConfig.imgIdField] = res.rows[fileI].id;
									var imgJson = {
										name:res.rows[fileI].originalName
									};
									imgJson[ajaxPlusData.uploadConfig.imgIdField] = res.rows[fileI].id;
									_config.uploadCoverArr.push(imgJson);
								}
								ajaxPlusData.showTheFiles(files,false);
							} else {
								nsalert("上传失败");
								nsalert(res.msg, 'error');
							}
							});
						},
						//图片质量选择事件
						selectQualityEvent: function () {
						   
						},
						//添加事件
						addEvent: function (files) {
							var _this = this;
						    _this.$container.find('.deleteCoverImg').off('click');
							_this.$container.find('.deleteCoverImg').on('click', function (e) {
								var $this = $(this);
								var index = $this.attr('ns-index');
								var fileId = $this.attr('ns-fileid');
								var sourceServer = $this.attr('ns-server');
								$this.parents('.pt-media-item').remove();
								//删除fileId
								var fileIdIndex = -1;
								for(var fileI=0; fileI<_config.uploadCoverArr.length; fileI++){
									if(_config.uploadCoverArr[fileI][_this.uploadConfig.imgIdField] == fileId){
										fileIdIndex = fileI;
										break;
									}
								}
								if(fileIdIndex > -1){
									_config.uploadCoverArr.splice(fileIdIndex,1);
								}
							});
							//文件重命名操作
							_this.$container.find('.renameCoverImg').off('click');
							_this.$container.find('.renameCoverImg').on('click', function (e) {
								_this.$container.find('.renameCoverImg').addClass('hidden');
								var $this = $(this);
								var index = $this.attr('ns-index');
								var $span = $this.parents('.pt-media-title').find('span');
								var beforeName = $span.text();
								$span.addClass('hidden');
								var $editContainer = $('<div class="pt-upload-edit">\
														<input type="text" class="pt-form-control" value="'+ beforeName + '" />\
														<div class="pt-btn-group">\
														<button class="pt-btn pt-btn-default pt-btn-icon cancle"><i class="icon-close"></i></button>\
														<button class="pt-btn pt-btn-default pt-btn-icon confirm"><i class="icon-check"></i></button>\
														</div>\
													</div>')
								$editContainer.insertAfter($span);
								$editContainer.find('button.cancle').on('click', function () {
									$editContainer.remove();
									$span.removeClass('hidden');
									_this.$container.find('.renameCoverImg').removeClass('hidden');
								})
								$editContainer.find('button.confirm').on('click', function () {
									var afterName = $editContainer.find('input').val();
									$span.text(afterName);
									$span.removeClass('hidden');
									$editContainer.remove();
				
									_this.$container.find('.renameCoverImg').removeClass('hidden');
								})
							});
						},
						//根据file对象获取url
						getObjectURL: function (file) {
							var url = null;
							/* window.URL = window.URL || window.webkitURL;*/

							if (window.createObjcectURL != undefined) {
								url = window.createOjcectURL(file);
							} else if (window.URL != undefined) {
								url = window.URL.createObjectURL(file);
							} else if (window.webkitURL != undefined) {
								url = window.webkitURL.createObjectURL(file);
							}
						   return url;
						}
					};
					_config.uploadCoverInit[uploadCoverData.id] = imgUpload;
					imgUpload.buildUploadCover();
				}
			}
		},
		countList:{
			init:function(_componentData,_config){
				for(var countListI in _componentData){
					var countListConfig = _componentData[countListI];
					var countConfig = $.extend(true,{},countListConfig);
					if(!$.isEmptyObject(countListConfig.params)){
						NetStarUtils.setDefaultValues(countConfig,countListConfig.params);
					}
					NetstarUI.countList.init(countConfig);
				}
			}
		},
		setSendParamsByPageParamsData:function(sourceData,_config){
			//按照标准处理流程，应该提供额外配置参数处理processId，
			//正常情况下不应当在大保存中处理这种逻辑，由于此情况特殊,特此记录 cy
			//工作流id 流程图id  如果界面来源参不为空 判断是否含有流程图id
			if(!$.isEmptyObject(_config.pageParam)){
				var pageFieldArr = ['processId','activityId','activityName','workItemId','workflowType','acceptFileIds','instanceIds'];
				for(var paramI=0; paramI<pageFieldArr.length; paramI++){
				   if(_config.pageParam[pageFieldArr[paramI]]){
					   if(typeof(sourceData[pageFieldArr[paramI]])=='undefined'){
							sourceData[pageFieldArr[paramI]] = _config.pageParam[pageFieldArr[paramI]];
					   }
				   }
				}
			}
		},
		//sjj 20200116 列表要支持传送page.的参数，不改变原来逻辑的前提之下，增加新的公用方法去支持这种传参
		setSendPageParamsByTemplateConfig:function(_pageParams,_ajaxData,_sendData){
			//判断ajaxData中是否存在{{page.}}的定义 举例_ajaxData:{"id":"{selectedList.id}","cid":"{page.id}"}
			if(!$.isEmptyObject(_ajaxData) && !$.isEmptyObject(_pageParams)){
				var isExistPageParam = false;//默认不存在
				var ajaxParameterRegExp = /\{?\}/;
				for(var paramI in _ajaxData){
					if(ajaxParameterRegExp.test(_ajaxData[paramI])){
						var match = /\{([^:]*?)\}/g.exec(_ajaxData[paramI]);
						if(match != null){
							var matchArr = match[1].split('.');
							if(matchArr[0] == 'page'){
								isExistPageParam = true;
								break;
							}
						}
					}
				}
				if(isExistPageParam){
					_sendData = typeof(_sendData)=='object' ? _sendData : {};
					_sendData.page = _pageParams;
				}
			}
		},
		setComponentDataByConfig:function(config){
			var listNum = 0;
			for(var componentI=0; componentI<config.components.length; componentI++){
				var componentData = config.components[componentI];
				var componentKeyField = componentData.keyField ? componentData.keyField : 'root';
				var parentField = componentData.parent ? componentData.parent : 'root';
				componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
				var componentDisplayMode = componentData.type;
				if(componentData.params.displayMode == 'voList'){
					componentDisplayMode = componentData.params.displayMode; 
				}
				if(typeof(componentData.id)=='undefined'){
					componentData.id = config.id + '-' + componentData.type + '-' + componentI;//定义容器id
				}
				config.componentsConfig[componentDisplayMode][componentData.id] = componentData; //根据组件类型存储信息 
				componentData.package = config.package;
				switch(componentDisplayMode){
					case 'tree':
						config.treeComponent = componentData;
						break;
					case 'list':
					case 'blockList':
						if(componentKeyField == 'root'){
							componentData.isAjax = true;
							if(componentData.params.isAjax == false){
								componentData.isAjax = false;
							}
							config.mainComponent = componentData;
						}else{
					listNum++;
							componentData.isAjax = false;
							config.tabConfig.listConfig[componentData.id] = componentData;
						}
						break;
					case 'btns':
						config.mainBtnArray.push($.extend(true,{},componentData));
						break;
					case 'tab':
						config.tabConfig.queryConfig = componentData;
						break;
				}
				if(componentKeyField == 'root'){
					//主数据
					if(componentData.type == 'btns'){
					   
					}else if(componentData.type == 'tabs'){
		
					}else{
						config.idFieldsNames['root'] = componentData.idField;//主键id
					}
				 }else if(parentField =='root' && componentKeyField){
					//当前是个二级数据
					config.idFieldsNames['root.'+componentKeyField] = componentData.idField;
				 }else{
					//当前父节点不是root是别的有意义的值 可能是个三级数据或者三级以上的数据 暂且按三级数据结构定义走
					config.idFieldsNames['root.'+parentField+'.'+componentKeyField] = componentData.idField;
				}
			}
			config.tabConfig.listNum = listNum;
		},
		setPageDataByBtns:function(_btnComponents,_config){
			if(!$.isEmptyObject(_btnComponents)){
				var fieldArray = _btnComponents.field;
				if(!$.isArray(fieldArray)){
					fieldArray = [];
				}
				for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
					var fieldData = fieldArray[fieldI];
					var functionConfig = fieldData.functionConfig ? fieldData.functionConfig : {};
					var displayMode = functionConfig.displayMode;
					var keyField = functionConfig.keyField;
					switch(displayMode){
						case 'addInfoDialog':
							if(keyField){
								_config.addInfoDialogData[keyField] = _config.serverData[keyField];
							}
							break;
					}
				}
			}
		},
		addInfoDialogInitByBtn:function(dialogPageConfig, extraData,_btnConfig){
			/**
			 * dialogPageConfig object 当前弹出模板页的配置项
			 * extraData object 依赖于从哪个模板按钮配置弹出的信息{keyField:keyField,package:package}
			 * _btnConfig object 当前按钮配置值
			*/
			dialogPageConfig.pageParam = typeof(dialogPageConfig.pageParam)=='object' ? dialogPageConfig.pageParam : {};
			/************弹出的模板页是当前按钮对应模板的一部分 根据keyField和idfield配置 idFieldsNames start*********/
			var pageConfig = NetstarTemplate.templates.configs[extraData.package];
			var pageIdFieldsNames = pageConfig.idFieldsNames;
			for(var componentI=0; componentI<dialogPageConfig.components.length; componentI++){
				var componentData = dialogPageConfig.components[componentI];
				if(componentData.keyField == extraData.keyField){
					pageIdFieldsNames['root.'+componentData.keyField] = componentData.idField;
					break;
				}
			}
			/************弹出的模板页是当前按钮对应模板的一部分 根据keyField和idfield配置 idFieldsNames end*********/
			var pageData = {};
			if(typeof(NetstarTemplate.templates[pageConfig.template].getPageData)=='function'){
				//模板存在获取界面值的方法
				pageData = NetstarTemplate.templates[pageConfig.template].getPageData(pageConfig,false);
			}
			/***** 获取当前页面参数 根据formatValueData : {"aa":"{page.customer.aa}"}  start******/
			// 需要格式化的formatValueData : '{"bb":{"aa":"{page.customer.aa}"}}'
			var formatValueData = _btnConfig.formatValueData; 
			// 转化对象
			if(typeof(formatValueData) == "string" && formatValueData.length>0){
				formatValueData = JSON.parse(formatValueData);
			}
			if(typeof(formatValueData) == "object"){
				var valueData = {};
				for(var key in formatValueData){
					valueData[key] = NetStarUtils.getFormatParameterJSON(formatValueData[key],pageData);
				}
				if(valueData){
					for(var key in valueData){
						for(var fieldKey in valueData[key]){
							if(valueData[key][fieldKey]){
								dialogPageConfig.pageParam[key] = typeof(dialogPageConfig.pageParam[key]) == "object" ? dialogPageConfig.pageParam[key] : {};
								dialogPageConfig.pageParam[key][fieldKey] = valueData[key][fieldKey];
							}
						}
					}
				}
			}
			/***** 获取当前页面参数 根据formatValueData : {"aa":"{page.customer.aa}"}   end******/
			/***** 读取按钮配置 star *****/
			var defaultReadBtnConfig = {
				isHaveSaveAndAdd : false,//默认没有保存并新增按钮
				getDataByAjax : {},
			};
			NetStarUtils.setDefaultValues(dialogPageConfig,defaultReadBtnConfig);
			//如果当前按钮配置属性上配置了isHaveSaveAndAdd和getDataByAjax 则从按钮配置属性上读取否则读取默认defaultReadBtnConfig的配置
			if(typeof(_btnConfig.isHaveSaveAndAdd)=='boolean'){
				dialogPageConfig.isHaveSaveAndAdd = _btnConfig.isHaveSaveAndAdd;
			}
			if(!$.isEmptyObject(_btnConfig.getDataByAjax)){
				dialogPageConfig.getDataByAjax = _btnConfig.getDataByAjax;
			}
			/***** 读取按钮配置  end *****/
			//通过界面参数获取弹出框的默认值
			if(pageConfig.addInfoDialogData[extraData.keyField]){
				dialogPageConfig.pageParam[extraData.keyField] = pageConfig.addInfoDialogData[extraData.keyField];
			}

			dialogPageConfig.size = 'md';
            dialogPageConfig.closeHandler = function (data) {
				if(data[extraData.keyField]){
					pageConfig.addInfoDialogData[extraData.keyField] = data[extraData.keyField];
				}
              	NetstarTemplate.hiddenDialogHandler(dialogPageConfig);//关闭弹框调用关闭快捷键
			};
			NetstarTemplate.init(dialogPageConfig);
		}
	},
	//根据模板定义的keyfield赋值
	setValueByKeyField:function(value,data,controllerObj){
		//获取界面值
		var templatePageData = data.dialogBeforeHandler(data);
		var tempalteConfig = templatePageData.config;
		if(typeof(NetstarTemplate.templates[tempalteConfig.template].fillValues)=='function'){
			NetstarTemplate.templates[tempalteConfig.template].fillValues(value,tempalteConfig,controllerObj);
		}
	},
	//根据模板定义的keyfield新增值
	addValueByKeyField:function(value,data,controllerObj){
		//获取界面值
		var templatePageData = data.dialogBeforeHandler(data);
		var tempalteConfig = templatePageData.config;
		if(typeof(NetstarTemplate.templates[tempalteConfig.template].addValues)=='function'){
			NetstarTemplate.templates[tempalteConfig.template].addValues(value,tempalteConfig,controllerObj);
		}
	},
	//弹框关闭公用调用事件
	hiddenDialogHandler:function(_config){
		//关闭当前使用的快捷键 放开当前显示界面的快捷键操作
		if(!$.isEmptyObject(_config)){
			vueButtonComponent.unbindKeydownHandler(_config.package);
		}
		var $container = $('container:not(".hidden")').last();
		var packageName = '';
		if($container.children('div[ns-tempalte-package]').length > 0){
			packageName = $container.children('div[ns-tempalte-package]').attr('ns-tempalte-package');
		}else if($container.parent().attr('ns-template-package')){
			packageName = $container.parent().attr('ns-template-package');
		}else{
			packageName = NetstarUI.labelpageVm.labelPagesArr[NetstarUI.labelpageVm.currentTab].config.package;
		}
		if(packageName){
			vueButtonComponent.bindKeydownHandler(packageName);
		}
	},
	getConfigByAjaxUrl:function(_config,pageConfig){
		var containerId = pageConfig.containerId;
		var $container = $('div[id="'+pageConfig.containerId+'"]');
		_config.$container = $container;
		
		var btnConfig = typeof(pageConfig.btnConfig) == "object" ? pageConfig.btnConfig : {};
		var package = btnConfig.package;
		var currentTemplateConfig = NetstarTemplate.templates.configs[package];
		if(typeof(currentTemplateConfig) == "object"){
			_config.closeHandler = (function(templateConfig){
				return function(resData){
					var templateName = templateConfig.template;
					var template = NetstarTemplate.templates[templateName];
					if(typeof(template) != "object"){
						return false
					}
					template.ajaxAfterHandler(resData, templateConfig.id, btnConfig.config);
				}
			})(currentTemplateConfig)
		}
		NetstarTemplate.init(_config);
	},
	getLevelByPageExpression:function(_templateConfig){
		function formatExpression(_exp,level){
			var valueField = _exp.substring(_exp.indexOf('(')+1,_exp.lastIndexOf(')'));
			var valueFieldArr = valueField.split('.');
			var fieldKey = valueFieldArr[valueFieldArr.length-1];
			var type = '';
			if(_exp.indexOf('SUM')>-1){
				type = 'sum';
			}
			return {
				type:type,
				keyField:valueField.substring(0,valueField.lastIndexOf('.')),
				fieldKey:fieldKey,
				level:level
			}
		}
		var pageExpression = _templateConfig.pageExpression;
		var levelExpression = {0:{},1:{},2:{}};
		//{"feeTotal":"SUM(root.quoteSampleVOS.quoteTotal)","quoteSampleVOS":{"quoteTotal":"SUM(quoteSampleVOS.quoteDetailVOS.quoteTotal)"}}
		//{feeTotal:{type:'sum',value:'root.quoteSampleVOS.quoteTotal'}}
		//{quoteTotal:{type:'sum',keyField:'quoteSampleVOS',value:'quoteSampleVOS.quoteDetailVOS.quoteTotal'}}
		if(pageExpression){
			var expression = JSON.parse(pageExpression);
			for(expI in expression){
				if(typeof(expression[expI])=='object'){
					for(var secondExp in expression[expI]){
						var valueJson = formatExpression(expression[expI][secondExp],1);
						levelExpression[1][expI] = valueJson;
					}
				}else{
					var valueJson = formatExpression(expression[expI],0);
					levelExpression[0][expI] = valueJson;
				}
			}
		}
		return levelExpression;
	},
	// 根据页面参数workflowType:1/2(已办/完结)判断非工作流按钮只读,
	// 工作流按钮:defaultMode:workflowViewer/workflowViewerById/workflowSubmit
	setBtnsDisableByWorkflowType : function(config){
		var pageParam = typeof(config.pageParam) == "object" ? config.pageParam : {};
		var components = $.isArray(config.components) ? config.components : [];
		switch(pageParam.workflowType){
			case '1':
			case '2':
				for(var componentI=0; componentI<components.length; componentI++){
					var component = components[componentI];
					if(component.type == "btns"){
						var fields = component.field;
						for(var fieldI=0; fieldI<fields.length; fieldI++){
							var field = fields[fieldI];
							var functionConfig = typeof(field.functionConfig) == "object" ? field.functionConfig : {};
							switch(functionConfig.defaultMode){
								case 'workflowViewer':
								case 'workflowViewerById':
								case 'workflowSubmit':
									break;
								default:
									var disabledByWorkflow = typeof(functionConfig.disabledByWorkflow) == "boolean" ? functionConfig.disabledByWorkflow : true;
									if(disabledByWorkflow){
										field.btn.disabled = true;
										field.btn.alwaysDisabled = true;
									}
									break;
							}
						}
					}
				}
				break;
			default:
				break;
		}
	},
};
/******************** 模板 end ***********************/