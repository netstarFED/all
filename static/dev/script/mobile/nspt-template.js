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
		listMobile:{
			data:{}
		},//列表模板（手机端）
		businessDataBaseEditorMobile:{

		},//手机端基础数据编辑模版
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
				['dataSrc', 'string', true],			//dataSrc
				['data', 'object']			//发送参数
			];
		if (!$.isEmptyObject(_config.getValueAjax)) {
			//值不为空进行ajax配置参数的验证
			isValid = nsDebuger.validOptions($.extend(true, [], validAjaxArr), _config.getValueAjax);
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
				config.pageParam[key] = pageOperateData[key];
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


		template.init(config);
		if(config.template == 'docListViewerMobile' && typeof(NetstarTemplate.templates.configs[config.package]) == "object"){
		}else{
			NetstarTemplate.templates.configs[config.package] = config;
		}
		this.templateInitComplete(config);
		if(typeof(NetStarRabbitMQ) == "object" && NetStarRabbitMQ.device === 'app'){
			// console.log(12342)
			if(setTitle){
				setTitle.controller.insertHtml();
			}
		}
		/*if(NetStarUtils.Browser.browserSystem == 'pc'){
			//sjj 20190606 执行订阅方法
			NetStarRabbitMQ.subscribe({
				target : '/exchange/deviceresult/'+NetstarMainPage.config.nsTopOrgId+'.#.deviceresult.new',
				unitId : 'NetStarRabbitMQdeviceresult',
				content : {},
				callbackHandler : function(subscribeInfo){
					var $currentContainer = $('container:not(".hidden")');
					var pageConfig = $.extend(true,{},config);
					if($currentContainer.children('.pt-main').hasClass('businessdatabase')){
						var templateId = $currentContainer.children('.pt-main').attr('id');
						pageConfig = NetstarTemplate.templates.businessDataBase.data[templateId].config;
					}
					NetstarTemplate.setDataByPatientId(pageConfig.package,JSON.parse(subscribeInfo.body));
					//rabbitMQPatientIdFunc(subscribeInfo);
				}
			});
			//20190717 订阅消息 刷新ajax
			NetStarRabbitMQ.subscribe({
				target : '/exchange/alarmRefreshPage/'+NetstarMainPage.config.nsTopOrgId+'.#',
				unitId : 'NetStarRabbitMQalarmRefreshPage',
				content : {},
				callbackHandler : function(subscribeInfo){
					var $currentContainer = $('container:not(".hidden")');
					var pageConfig = $.extend(true,{},config);
					if($currentContainer.children('.pt-main').hasClass('businessdatabase')){
						var templateId = $currentContainer.children('.pt-main').attr('id');
						pageConfig = NetstarTemplate.templates.businessDataBase.data[templateId].config;
					}
					if(pageConfig.template == 'businessDataBase'){
						NetstarTemplate.templates.businessDataBase.ajaxAfterHandler({objectState:NSSAVEDATAFLAG.VIEW},pageConfig.id);
					}
					//rabbitMQPatientIdFunc(subscribeInfo);
				}
			});
		}*/
	},//模板调用初始化
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
			nsVals.extendJSON(gridConfig.data,gridAjax);
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
			paramObj:{},
			type:'GET',
			config:{paramObj:paramObj},
			callBackFunc:function(isSuccess,data,_pageConfig){
				if(isSuccess){
					var _config = _pageConfig.config.paramObj;
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
				}
			}
			//dataType:'html',
			//context:{
				//config:paramObj
			//}
		};
		pageProperty.getAndCachePage(ajaxConfig);
		/*NetStarUtils.ajaxForText(ajaxConfig,function(data,_this){
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
		});*/
	},
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
		//先找到模板名 config.template
		var template = NetstarTemplate.templates[_config.config.template];
		var configObj = $.extend(true, {}, _config.config);
		if(typeof(configObj.pageParam)=='undefined'){
			configObj.pageParam = {};
		}
		if(typeof(_config.pageParam)=='undefined'){
			_config.pageParam = {};
		}
		nsVals.extendJSON(configObj.pageParam, _config.pageParam);
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
			btnConfig.isSendPageParams = typeof(functionConfig.isSendPageParams)=='boolean' ? functionConfig.isSendPageParams : true;
			btnConfig.isOperatorMain = typeof(functionConfig.isOperatorMain)=='boolean' ? functionConfig.isOperatorMain : false;
			var isCloseBtn = false;//针对块状表格关闭按钮事件的处理转移
			if (typeof (functionConfig.isCloseBtn) == 'boolean') {
				isCloseBtn = functionConfig.isCloseBtn;
			}
			btnConfig.index = {
				customerIndex: btnI
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
					field[i].type = 'hidden';
					field[i].hidden = true;
				}
			}
		} else if (ctrlType == 'formPlate') {
			for (var i = 0; i < field.length; i++) {
				if ($.inArray(field[i].id, arrHide) > -1) {
					field[i].type = 'hidden';
					field[i].hidden = true;
				}
			}
		} else if (ctrlType == 'table') { //表格隐藏列
			for (var i = 0; i < field.length; i++) {
				if ($.inArray(field[i].field, arrHide) > -1) {
					field[i].hidden = true;
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
					var mainListConfig = NetstarTemplate.templates.docListViewer.data[templateId].config.mainDataConfig;
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
						var gridId = config.mainDataConfig.id;
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
				break;
			case 'docListViewer':
				var packageName = pagePackageName.replace(/\./g, '-');
				var templateId = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
				if (NetstarTemplate.templates.docListViewer.data) {
					//主详表  单据详情模板
					var config = NetstarTemplate.templates.docListViewer.data[templateId].config;
					if (!$.isEmptyObject(config)) {
						//存在单据详情模板的配置项
						var gridId = config.mainDataConfig.id;
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
				var gridId = config.mainDataConfig.id;
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
						var gridId = config.mainDataConfig.id;
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
	refreshByPackage: function (data, sourceData) {
		/*
			*data object 接受参
				* idField 主键id
				* package 包名
				* templateId string
			*sourceData 来源data 
		*/
		var packPackageName = data.package;
		switch (NetstarTemplate.templates.configs[packPackageName].template) {
			case 'businessDataBase':
				var config = NetstarTemplate.templates.businessDataBase.data[data.templateId].config;
				NetstarTemplate.templates.businessDataBase.refreshData(config.componentsConfig.list[0].id);
				break;
			case 'docListViewer':
				NetstarTemplate.templates.docListViewer.refreshData(data, sourceData);
				break;
			case 'businesslevellist3':
				NetstarTemplate.templates.businesslevellist3.refreshData(data, sourceData);
				break;
		}
	},
	// 获取页面操作数据 lyw 20190620
	getOperateData : function(_config){
		var components = _config.components;
		var pageData = {};
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
					var listSelectedData = NetStarGrid.getSelectedData(components[key].id);
					var listCheckedData = NetStarGrid.getCheckedData(components[key].id);
					pageData[keyFieldName + 'Selected'] = listSelectedData;
					pageData[keyFieldName + 'Checked'] = listCheckedData;
					break;
				case "tree":
					var treeId = 'tree-' + components[key].id;
					var listSelectedData = NetstarTemplate.tree.getSelectedNodes(treeId);
					var listCheckedData = NetstarTemplate.tree.getCheckedNodes(treeId);
					pageData[keyFieldName + 'Selected'] = listSelectedData;
					pageData[keyFieldName + 'Checked'] = listCheckedData;
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
			case 'listMobile':
				value = NetstarTemplate.templates.listMobile.getPageData(_config,isValid);
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
				var validateParams = {};
				if(controllerObj.validateParams){
					validateParams = JSON.parse(controllerObj.validateParams); //验证提示语  
				}else{
					if(!$.isEmptyObject(chargeData)){
						$.each(chargeData,function(key,v){
							value[key] = v;
						});
					}
				}
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
	quickQueryByMobileTemplate:function(_listConfig, pageConfig){
		var isUseQRInput = _listConfig.isUseQRInput;
		var isUseSearchInput = _listConfig.isUseSearchInput;
		if(isUseQRInput == 'true'){
			isUseQRInput = true;
		}else if(isUseQRInput == 'false'){
			isUseQRInput = false;
		}
		if(isUseSearchInput == 'true'){
			isUseSearchInput = true;
		}else if(isUseSearchInput == 'false'){
			isUseSearchInput = false;
		}
		var searchInputPlaceholder = _listConfig.searchInputPlaceholder ? _listConfig.searchInputPlaceholder : '';
		if(isUseSearchInput){
			var searchInputId = 'search-'+_listConfig.id;
			var scandHtml = '';
			if(isUseQRInput){
				scandHtml = '<div class="mobile-scanqrcode-button">'
								+'<button type="button" id="btn-mobile-scanqrcode-button"><i class="icon-qrcode"></i></button>'
							+'</div>';
			}
			var html = '<div class="row mobile-input-search" >'
							+'<div class="mobile-input-search-control" id="search-'+_listConfig.id+'" ns-grid="'+_listConfig.id+'">'
								+'<i class="fa-search"></i><span>'+searchInputPlaceholder+'</span>'
							+'</div>'
							+scandHtml
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

				var $confirmBtn = $('#btn-'+gridId+' button[nstype="confirm"]');
				var $cancelBtn = $('#btn-'+gridId+' button[nstype="cancel"]');
				$confirmBtn.on('click',function(ev){
					ev.stopPropagation();
					var $btn = $(this);
					$btn.blur();
					$('input[type="text"]').blur();
					var nstype = $btn.attr('nstype');
					var currentGridId = $btn.parent().attr('ns-grid');
					var inputValue = $inputContainer.val();
					var gridConfig = NetstarBlockListM.configs[currentGridId].gridConfig;
					var ajaxData = gridConfig.data.data;
					// ajaxData.keyword = inputValue;
					/****lyw 搜索参数 star*****/
					var searchField = 'keyword';
					if(typeof(_listConfig.searchConfig) == "object"){
						if(typeof(_listConfig.searchConfig.searchField) == "string" && _listConfig.searchConfig.searchField.length > 0){
							searchField = _listConfig.searchConfig.searchField;
						}
					}	
					ajaxData[searchField] = inputValue;
					/****lyw 搜索参数 end*****/
					var templateConfig = NetstarTemplate.templates.configs[gridConfig.package];
					var templateType = templateConfig.templateType;
					if(templateType == 'treeBlocklist'){
						NetstarTemplate.templates.businessDataBaseMobile.refreshListByTreeNode(templateConfig,ajaxData);
					}else{
						var isAjax = typeof(gridConfig.isAjax)=='boolean' ? gridConfig.isAjax : true;
						if(isAjax){
							NetstarBlockListM.refreshById(currentGridId,ajaxData);
						}else{
							NetstarTemplate.templates.docListViewerMobile.refreshListDataByAjax(templateConfig,ajaxData);
						}
					}
				});
				$cancelBtn.on('click',function(ev){
					ev.stopPropagation();
					var $btn = $(this);
					$btn.blur();
					$('input[type="text"]').blur();
					var nstype = $btn.attr('nstype');
					var currentGridId = $btn.parent().attr('ns-grid');
					var cancelHtml = '<div class="mobile-input-search-control">'
											+'<i class="fa-search"></i><span>'+searchInputPlaceholder+'</span>'
										+'</div>'
										//+'<div class="mobile-scanqrcode-button">'
											//+'<button type="button"><i class="icon-qrcode"></i></button>'
										//+'</div>';
					$('#search-'+gridId).html(cancelHtml);
					$('#'+searchInputId).on('click',quickQueryClickHandler);
					//$('#btn-mobile-scanqrcode-button').off('click',scandqrcodeHandler);
					//$('#btn-mobile-scanqrcode-button').on('click',scandqrcodeHandler);
				});
				$inputContainer.on('keyup',function(e){
					switch(e.keyCode) {
					   case 13:
							var $currentInput = $(this);
							var inputValue = $currentInput.val();
							var gridConfig = NetstarBlockListM.configs[gridId].gridConfig;
							var ajaxData = gridConfig.data.data;
							ajaxData.keyword = inputValue;
							var templateConfig = NetstarTemplate.templates.configs[gridConfig.package];
							var templateType = templateConfig.templateType;
							if(templateType == 'treeBlocklist'){
								NetstarTemplate.templates.businessDataBaseMobile.refreshListByTreeNode(templateConfig,ajaxData);
							}else{
								var isAjax = typeof(gridConfig.isAjax)=='boolean' ? gridConfig.isAjax : true;
								if(isAjax){
									NetstarBlockListM.refreshById(gridId,ajaxData);
								}else{
									NetstarTemplate.templates.docListViewerMobile.refreshListDataByAjax(templateConfig,ajaxData);
								}
								//NetstarBlockListM.refreshById(gridId,ajaxData);
							}
							//NetstarBlockListM.refreshById(gridId,ajaxData);
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
					$(this).addClass('hidden');
					$inputContainer.val('');
					$inputContainer.focus();
					var ajaxData = NetstarBlockListM.configs[gridId].gridConfig.data.data;
					delete ajaxData.keyword;
					var gridConfig = NetstarBlockListM.configs[gridId].gridConfig;
					var templateConfig = NetstarTemplate.templates.configs[gridConfig.package];
					var templateType = templateConfig.templateType;
					if(templateType == 'treeBlocklist'){
						NetstarTemplate.templates.businessDataBaseMobile.refreshListByTreeNode(templateConfig,ajaxData);
					}else{
						var isAjax = typeof(gridConfig.isAjax)=='boolean' ? gridConfig.isAjax : true;
						if(isAjax){
							NetstarBlockListM.refreshById(gridId,ajaxData);
						}else{
							NetstarTemplate.templates.docListViewerMobile.refreshListDataByAjax(templateConfig,ajaxData);
						}
						//NetstarBlockListM.refreshById(gridId,ajaxData);
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
				ev.preventDefault();
				ev.stopPropagation();
				var $searchContainer = $(this);
				$searchContainer.blur();
				var gridId = $searchContainer.attr('ns-grid');
				initSearch(gridId,$searchContainer);
				$('#'+searchInputId).off();
			}
			function scandqrcodeHandler(ev){
				ev.preventDefault();
				//ev.stopPropagation();
				var $this = $(this);
				switch(_listConfig.scandSource){
					case 'lims':
						// 扫码 lyw 20191114
						NetstarQRScanner.init({
							type : "multi",
							ajax : _listConfig.ajax,
							successHandler : function(res){
								if(res.success){
									var scandArr = [];
									if($.isArray(res.data)){
										scandArr = res.data;
									}else{
										if(!$.isEmptyObject(res.data)){
											scandArr = [res.data];
										}
									}
									var blockListData = NetstarBlockListM.dataManager.getData(_listConfig.id);
									for(var s=scandArr.length-1; s>-1; s--){
										blockListData.unshift(scandArr[s]);
									}
									NetstarBlockListM.refreshDataById(_listConfig.id,blockListData);
								}else{
									var msg = res.msg ? res.msg : '返回值有误';
									nsalert(msg,'error');
								}
							},
							callBackFunc : function(QRSContents, ajaxRes, config){
								console.log(QRSContents);
								console.log(ajaxRes);
								console.log(config);
							},
						});
						break;
					case 'getPage':
					// case 'getToDoList':
						// 样品确认
						// 扫码 lyw 20191115
						NetstarQRScanner.init({
							type : "multi",
							// ajax : _listConfig.ajax,
							callBackFunc : function(QRSContents, ajaxRes, config){
								// console.log(QRSContents);
								// console.log(ajaxRes);
								// console.log(config);
								if(QRSContents.length == 0){
									return false;
								}
								var ajaxConfig = $.extend(true, {}, _listConfig.ajax);
								
								ajaxConfig.data = typeof(ajaxConfig.data) == "object" ? ajaxConfig.data : {};
								ajaxConfig.data.ids = QRSContents.toString();
								console.log(QRSContents);
								if(typeof(pageConfig) == "object" && typeof(pageConfig.pageParam) == "object"){
									ajaxConfig.data = $.extend(false, ajaxConfig.data, pageConfig.pageParam);
								}
								NetStarUtils.ajax(ajaxConfig,function(res){
									if(res.success){
										var scandArr = [];
										if($.isArray(res.rows)){
											scandArr = res.rows;
										}else{
											if(!$.isEmptyObject(res.rows)){
												scandArr = [res.rows];
											}
										}
										var blockListData = NetstarBlockListM.dataManager.getData(_listConfig.id);
										for(var s=scandArr.length-1; s>-1; s--){
											blockListData.unshift(scandArr[s]);
										}
										nsalert('刷新成功');
										NetstarBlockListM.refreshDataById(_listConfig.id,blockListData);
									}else{
										var msg = res.msg ? res.msg : '返回值有误';
										nsalert(msg,'error');
									}
								},true)
							},
						});
						break;
					case 'getToDoList':
						// 样品确认
						// 扫码 lyw 20191115
						NetstarQRScanner.init({
							type : "multi",
							// ajax : _listConfig.ajax,
							callBackFunc : function(QRSContents, ajaxRes, config){
								// console.log(QRSContents);
								// console.log(ajaxRes);
								// console.log(config);
								if(QRSContents.length == 0){
									return false;
								}
								var ajaxConfig = $.extend(true, {}, _listConfig.ajax);
								
								ajaxConfig.data = typeof(ajaxConfig.data) == "object" ? ajaxConfig.data : {};
								// ajaxConfig.data.sampleCodes = QRSContents.toString();    // 发参从ids改为sampleCodes  zjw提出
								var tempQRSContents = [];
								for(var i = 0,len = QRSContents.length; i < len; i++){
									var str = QRSContents[i].slice(7);
									tempQRSContents.push(str);
								}
								ajaxConfig.data.sampleCode = tempQRSContents.toString();    // 发参从ids改为sampleCodes 改回去 whx提出
								console.log(tempQRSContents);
								if(typeof(pageConfig) == "object" && typeof(pageConfig.pageParam) == "object"){
									ajaxConfig.data = $.extend(false, ajaxConfig.data, pageConfig.pageParam);
								}
								NetStarUtils.ajax(ajaxConfig,function(res){
									if(res.success){
										var scandArr = [];
										if($.isArray(res.rows)){
											scandArr = res.rows;
										}else{
											if(!$.isEmptyObject(res.rows)){
												scandArr = [res.rows];
											}
										}
										var blockListData = scandArr;
										// var blockListData = NetstarBlockListM.dataManager.getData(_listConfig.id);
										// for(var s=scandArr.length-1; s>-1; s--){
										// 	blockListData.unshift(scandArr[s]);
										// }
										nsalert('刷新成功');
										NetstarBlockListM.refreshDataById(_listConfig.id,blockListData);
									}else{
										var msg = res.msg ? res.msg : '返回值有误';
										nsalert(msg,'error');
									}
								},true)
							},
						});
						break;
					case 'scanner':
						// 样品确认
						// 扫码 lyw 20191115
						NetstarQRScanner.init({
							type : "multi",
							// ajax : _listConfig.ajax,
							callBackFunc : function(QRSContents, ajaxRes, config){
								// console.log(QRSContents);
								// console.log(ajaxRes);
								// console.log(config);
								if(QRSContents.length == 0){
									return false;
								}
								var ajaxConfig = $.extend(true, {}, _listConfig.scannerAjax);
								
								ajaxConfig.data = typeof(ajaxConfig.data) == "object" ? ajaxConfig.data : {};
								// ajaxConfig.data.sampleCodes = QRSContents.toString();    // 发参从ids改为sampleCodes  zjw提出
								ajaxConfig.data[ajaxConfig.scannerField] = QRSContents.toString();    // 发参从ids改为sampleCodes 改回去 whx提出
								console.log(QRSContents);
								if(typeof(pageConfig) == "object" && typeof(pageConfig.pageParam) == "object"){
									ajaxConfig.data = $.extend(false, ajaxConfig.data, pageConfig.pageParam);
								}
								NetStarUtils.ajax(ajaxConfig,function(res){
									if(res.success){
										// var scandArr = [];
										// if($.isArray(res.rows)){
										// 	scandArr = res.rows;
										// }else{
										// 	if(!$.isEmptyObject(res.rows)){
										// 		scandArr = [res.rows];
										// 	}
										// }
										// var blockListData = scandArr;
										// var blockListData = NetstarBlockListM.dataManager.getData(_listConfig.id);
										// for(var s=scandArr.length-1; s>-1; s--){
										// 	blockListData.unshift(scandArr[s]);
										// }
										nsalert('刷新成功');
										NetstarBlockListM.refreshById(_listConfig.id);
									}else{
										var msg = res.msg ? res.msg : '返回值有误';
										nsalert(msg,'error');
									}
								},true)
							},
						});
						break;
					default:
						var ajaxParameter = {
							plusData:{
								callbackFunc:function(plusData,resData){
									wx.scanQRCode({
										desc: 'scanQRCode desc',
										needResult: 1, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
										scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是条形码（一维码），默认二者都有
										success: function(res) {
											// 回调
											var resultStr = res.resultStr;
											var ajaxConfig = {
												url:getRootPath()+'/taskExecutionController/v2/stockingByGoodsId',
												type:'get',
												data:{
													goodsId:resultStr
												},
												contentType:'application/x-www-form-urlencoded',
												//contentType:'application/json; charset=utf-8'
											};
											nsVals.ajax(ajaxConfig,function(res){
												if(res.success){
													NetstarBlockListM.refreshById(_listConfig.id);
												}else{
													alert('获取失败');
												}
											},true)
										},
										error: function(res) {
											if (res.errMsg.indexOf('function_not_exist') > 0) {
												alert('版本过低请升级')
											}
										}
									});
								}
							}
						};
						nsComponent.getWXPermit(ajaxParameter);
						break;
				}
				// 以下代码是之前的已经废弃
				if(_listConfig.scandSource == 'lims'){
					// var ajax = $.extend(true,{},_listConfig.ajax);
					// NetStarUtils.ajax(ajax,function(res){
					// 	if(res.success){
					// 		var scandArr = [];
					// 		if($.isArray(res.data)){
					// 			scandArr = res.data;
					// 		}else{
					// 			if(!$.isEmptyObject(res.data)){
					// 				scandArr = [res.data];
					// 			}
					// 		}
					// 		var blockListData = NetstarBlockListM.dataManager.getData(_listConfig.id);
					// 		for(var s=scandArr.length-1; s>-1; s--){
					// 			blockListData.unshift(scandArr[s]);
					// 		}
					// 		NetstarBlockListM.refreshDataById(_listConfig.id,blockListData);
					// 	}else{
					// 		var msg = res.msg ? res.msg : '返回值有误';
					// 		nsalert(msg,'error');
					// 	}
					// },true)
					// console.log(ajax)
					/*var scandArr = [
						{
							"keyId":202,
							"hazardClassName":"接触有害化学因素作业人员",
							"hazardCode":"Systems Architect2",
							"hazardName":"新添加1",
							"hazardYear":"8",
							"disorder":"1",
							"hazardDesc":"",
							"hasYearMonth":"2016-05-03",
							"deffect":"早期可引起神经衰弱症候群，如继续接触,环境未改善...氧化镉烟雾，发生以呼吸系统表现为主的急性中毒",
							"remark":"s2"
						  },
							{
							"keyId":303,
							"hazardClassName":"接触有害化学因素作业人员",
							"hazardCode":"Systems Architect3",
							"hazardName":"新添加2",
							"hazardYear":"7",
							"disorder":"2",
							"hazardDesc":"",
							"hasYearMonth":"2013-09-21",
							"deffect":"电工作业属于特殊工种危险作业。上岗前和在岗期间都...治知识培训，加强个人安全防护，按监护周期体检",
							"remark":"2"
						  }
					];
					var blockListData = NetstarBlockListM.dataManager.getData(_listConfig.id);
					for(var s=scandArr.length-1; s>-1; s--){
						blockListData.unshift(scandArr[s]);
					}
					NetstarBlockListM.refreshDataById(_listConfig.id,blockListData);*/
				}else{
					var ajaxParameter = {
						plusData:{
							callbackFunc:function(plusData,resData){
								wx.scanQRCode({
									desc: 'scanQRCode desc',
									needResult: 1, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
									scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是条形码（一维码），默认二者都有
									success: function(res) {
										// 回调
										var resultStr = res.resultStr;
										var ajaxConfig = {
											url:getRootPath()+'/taskExecutionController/v2/stockingByGoodsId',
											type:'get',
											data:{
												goodsId:resultStr
											},
											contentType:'application/x-www-form-urlencoded',
											//contentType:'application/json; charset=utf-8'
										};
										nsVals.ajax(ajaxConfig,function(res){
											if(res.success){
												NetstarBlockListM.refreshById(_listConfig.id);
											}else{
												alert('获取失败');
											}
										},true)
									},
									error: function(res) {
										if (res.errMsg.indexOf('function_not_exist') > 0) {
											alert('版本过低请升级')
										}
									}
								});
							}
						}
					};
					// nsComponent.getWXPermit(ajaxParameter);
				}
			}
			$('#'+searchInputId).on('click',quickQueryClickHandler);
			$('#btn-mobile-scanqrcode-button').on('click',scandqrcodeHandler);
		}
	}
};
/******************** 模板 end ***********************/