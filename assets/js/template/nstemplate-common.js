/* *
 * 网星模板页公共common.js
 * 此js中验证、设置默认值等都是针对所有模板的公共属性进行的操作
 * 初始化调用、公共方法
 * */
nsTemplate = {
	id: 'ns-template',
	handlerObj:{},//按钮
	data:{},
	templates: {
		'managerTable': {
			isLayout: true,
			data: {}
		}, //单个表格增删改查模板
		'managerMoreTable': {
			isLayout: true,
			data: {}
		}, //多个表格增删改查模板，可分为上下或左右等布局
		'managerTreeTable': {
			isLayout: true,
			data: {}
		}, //左侧树右侧表格增删改查模板
		'searchPage':{
			isLayout:true,
			data:{}
		},//搜索模板页面
		'managerTab':{
			isLayout:true,
			data:{}
		},//tab模板
		'simpleStats':{
			isLayout:true,
			data:{}
		},//简单统计模板
		'countCharttable':{
			isLayout:true,
			data:{}
		},//统计模板
		'managerForms':{
			isLayout:true,
			data:[]
		},//多表单模板
		'doubleTables':{
			isLayout:true,
			data:[]
		},//双表格主附表关联
		'formTable':{
			isLayout:true,
			data:[]
		},//表单表格模板
		'advanceSearch':{
			isLayout:true,
			data:[]
		},//高级查询模板
		'treeTable':{
			isLayout:true,
			data:[]
		},//目录树表格
		'tabFormList':{
			isLayout:true,
			data:[]
		},//tab form table
		'listFilter':{
			isLayout:true,
			data:[]
		},//列表过滤
		'singleTable':{
			isLayout:true,
			data:[]
		},//单表格
		'singleForm':{
			isLayout:true,
			data:[]
		},//单表单
		'mobileListfilter':{
			isLayout:false,
			data:[],
		},//手机端列表过滤 sjj20181022
		'treelist':{
			isLayout:false,
			data:[]
		},//左侧树右侧表格模板 sjj20181201
		'mobileForm':{
			isLayout:false,
			data:[]
		},//手机端表单模板 sjj20181205
		'businessDataBase':{
			isLayout:false,
			data:[]
		},
		'detailsDocBase':{
			isLayout:false,
			data:[]
		},
	}
};
//初始化模板
nsTemplate.init = function(config) {
	// console.log(config);
	//根据package生成一个id暂时性解决
	var packageName = config.package.replace(/\./g, '-');
	config.id = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
	var isValid = true;
	if(debugerMode){
		isValid = nsTemplate.validConfigByTemplate(config);
	}
	if(isValid == false){
		return false;
	}
	//公共属性设置默认值
	config = nsTemplate.setDefaultByTemplate(config);
	//找到模板并初始化
	var template = nsTemplate.templates[config.template];
	if(debugerMode){
		if(typeof(template)!='object'){
			var errorStr = '所指定的模板template:'+config.template+'不存在,请核实';
			nsalert(errorStr, 'error');
			console.error(errorStr);
			console.error(config)
			return;
		}else{
			if(typeof(template.init)!='function'){
				var errorStr = '所指定的模板template:'+config.template+'不完整，请核实是否引入相关js文件';
				nsalert(errorStr, 'error');
				console.error(errorStr);
				console.error(config)
				return; 
			}
		}
	}

	//添加data_auth_code权限码参数
	var dataAutoCode = config.data_auth_code;
	//var dataAutoCode = '000003333333';
	var dataAuthCodeObj = {
		data_auth_code:dataAutoCode
	};
	//sjj 20190415 如果config.PageParam存在 activityId activityName  processId processName
	if(dataAutoCode){
		if(!$.isEmptyObject(config.pageParam)){
			var pageSourceParams = ['activityId','activityName','processId','processName'];
			for(var pageI=0; pageI<pageSourceParams.length; pageI++){
				if(config.pageParam[pageSourceParams[pageI]]){
					dataAuthCodeObj[pageSourceParams[pageI]] = config.pageParam[pageSourceParams[pageI]];
				}
			}
		}
		//如果存在权限码参数的情况
		config.saveData.ajax.data = $.extend(true,config.saveData.ajax.data,dataAuthCodeObj);//saveData整体保存ajax添加请求参
		//读取默认ajax添加请求参
		if(!$.isEmptyObject(config.getValueAjax)){
			config.getValueAjax.data = $.extend(true,config.getValueAjax.data,dataAuthCodeObj);
			//ajax header添加data_auth_code 权限码 cy 20180711
			config.getValueAjax.header  = dataAuthCodeObj;
		}
		//给所有配置按钮添加权限码请求参
		function addDataAutoCodeByBtns(btnArray){
			for(var btnI=0; btnI<btnArray.length; btnI++){
				if(btnArray[btnI].functionConfig){
					btnArray[btnI].functionConfig.defaultData = $.extend(true,btnArray[btnI].functionConfig.defaultData,dataAuthCodeObj);
				}
			}
		}
		//导航栏按钮配置添加权限码请求参
		if(config.nav.field.length>0){addDataAutoCodeByBtns(config.nav.field);}
		//表格ajax配置
		function addDataAutoCodeByTable(){
			if(typeof(config.table)=='object'){
				if(typeof(config.table.ajax)=='object'){
					config.table.ajax.data = $.extend(true,config.table.ajax.data,dataAuthCodeObj);
					config.table.ajax.header  = dataAuthCodeObj;
				}
				if(typeof(config.table.main)=='object'){
					//主附表的表格
					config.table.main.ajax.data = $.extend(true,config.table.main.ajax.data,dataAuthCodeObj);
					config.table.main.ajax.header  = dataAuthCodeObj;
				}
				if(typeof(config.table.child)=='object'){
					//主附表的表格
					config.table.child.ajax.data = $.extend(true,config.table.child.ajax.data,dataAuthCodeObj);
					config.table.child.ajax.header  = dataAuthCodeObj;
				}
			}
		}
		addDataAutoCodeByTable();
		//form field字段type类型ajax请求的需要添加权限码参数
		function setDataAutoCodeByField(fieldArray){
			if(!$.isArray(fieldArray)){return;}
			for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
				if(fieldArray[fieldI].url){
					//存在url链接请求的
					if(typeof(fieldArray[fieldI].data)=='object'){
						fieldArray[fieldI].data = $.extend(true,fieldArray[fieldI].data,dataAuthCodeObj);
					}
				}
			}
		}
		function addDataAutoCodeByForm(){
			if(typeof(config.form)=='object'){
				setDataAutoCodeByField(config.form.field);
			}
		}
		addDataAutoCodeByForm();
		//配置
		function setDataAutoCodeByConfig(config){
			for(var key in config){
				if(typeof(config[key])=='object'){
					switch(key){
						case 'btns':
						case 'tableRowBtns':
							addDataAutoCodeByBtns(config[key]);
							break;
						case 'add':
						case 'edit':
						case 'delete':
							if(config[key].type=='dialog'){
								setDataAutoCodeByField(config[key].field);
							}
							break;
						default:
							setDataAutoCodeByConfig(config[key]);
							break;
					}
				}
			}
		}
		setDataAutoCodeByConfig(config);
	}
	//处理手机端form元素的单选多选类型定义 sjj 20190401
	var browser = nsVals.getIEBrowserVersion();
	if(browser.browserSystem == 'mobile'){
		if(config.form){
			//当前配置是form
			function setMobileFormField(fieldArray){
				for(var elementI=0; elementI<fieldArray.length; elementI++){
					switch(fieldArray[elementI].type){
						case 'select':
							fieldArray[elementI].type = 'radio';
							break;
						case 'select2':
							if(elementField[elementI].multiple){
								fieldArray[elementI].type = 'checkbox';
							}else{
								fieldArray[elementI].type = 'radio';
							}
							break;
					}
				}
			}
			if($.isArray(config.form)){
				for(var formI=0; formI<config.form.length; formI++){
					setMobileFormField(config.form[formI].field);
				}
			}else{
				setMobileFormField(config.form.field);
			}
		}
		if(!$.isEmptyObject(config.pageParam)){
			if(!$.isEmptyObject(config.pageParam.data)){
				var pageSourceParams = ['activityId','activityName','processId','processName'];
				for(var pageI=0; pageI<pageSourceParams.length; pageI++){
					if(config.pageParam[pageSourceParams[pageI]]){
						config.pageParam.data[pageSourceParams[pageI]] = config.pageParam[pageSourceParams[pageI]];
					}
				}
			}
		}
	}
	//处理界面传参
	if(!$.isEmptyObject(config.pageParam)){
		if(config.pageParam.package){
			var templateObj = eval(config.pageParam.package);
			config.pageParam = $.extend(true,config.pageParam,templateObj.pageParams);
			config.parentObj = templateObj.descritute;
			delete config.pageParam.package;
		}
	}
	template.init(config);
}

//围加模板html根标签
nsTemplate.aroundRootHtml = function(html) {
	//html = typeof(html) == 'string' ? html : '';
	html = '<nstemplate id="' + nsTemplate.id + '">' + html + '</nstemplate>';
	return html;
}

//将html添加到页面中
nsTemplate.appendHtml = function(html) {
	//找到容器，将html添加到前面
	var $container = $('container').not('.content').not('.hidden');
	if($('.nswindow .content').length > 0){
		$container = $('.nswindow .content:last');
	}
	$container.prepend(html);
}

//过滤隐藏列
nsTemplate.setFieldHide = function(ctrlType, field, arrHide) {
	if(!$.isArray(field)){field = [];}
	//表单隐藏列
	if (ctrlType == 'form') {
		for (var i = 0; i < field.length; i++) {
			if ($.inArray(field[i].id, arrHide) > -1) {
				field[i].type = 'hidden';
			}
		}
	} else if (ctrlType == 'formPlate') {
		for (var i = 0; i < field.length; i++) {
			if ($.inArray(field[i].id, arrHide) > -1) {
				field[i].type = 'hidden';
			}
		}
	} else if (ctrlType == 'table') { //表格隐藏列
		for (var i = 0; i < field.length; i++) {
			if ($.inArray(field[i].field, arrHide) > -1) {
				field[i].hidden = true;
			}
		}
	}
}

//获取对象的属性
nsTemplate.getObjValue = function(obj, key) {
	if (typeof(obj) == 'object') {
		return obj[key];
	}
	return undefined;
}

//执行对象中某属性函数
nsTemplate.runObjHandler = function(obj, key, paras) {
	var handler = nsTemplate.getObjValue(obj, key);
	if (typeof(handler) == 'function') {
		if (paras && paras.length > 0) {
			switch (paras.length) {
				case 1:
					handler(paras[0]);
					break;
				case 2:
					handler(paras[0], paras[1]);
					break;
				case 3:
					handler(paras[0], paras[1], paras[2]);
					break;
				case 4:
					handler(paras[0], paras[1], paras[2], paras[3]);
					break;
				default:
					handler(paras[0], paras[1], paras[2], paras[3], paras[4]);
					break;
			}
		} else {
			handler();
		}
	}
	return false;
}

//将-拆分的字符串改为驼峰命名
nsTemplate.camelCase = function(str) {
	if (typeof(str) == 'string') {
		str = str.replace(/-(\w)/g, function($0, $1) {
			return $1.toUpperCase();
		});
	}
	return str;
}

//生成全球最唯码
nsTemplate.newGuid = function(format, len) {
	len = typeof(len) == 'number' ? len : 32;
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
}

//对table表格自定义事件进行处理
nsTemplate.runObjColumnBtnHandler = function(tableRowBtns,columnBtnHandler) {
	var columnBtns = [];
	var columnBtnHandlers = [];
	for(var btnI=0; btnI<tableRowBtns.length; btnI++){
		if(!$.isEmptyObject(tableRowBtns[btnI].btn)){
			var btns = {};
			btns[tableRowBtns[btnI].btn.text] = columnBtnHandler;
			columnBtns.push(btns);
			columnBtnHandlers[btnI] = tableRowBtns[btnI];
		}else{
			var btns = {};
			btns[tableRowBtns[btnI].text] = columnBtnHandler;
			columnBtns.push(btns);
			columnBtnHandlers[btnI] = tableRowBtns[btnI];
		}
	}
	return [columnBtns,columnBtnHandlers];
}

//对按钮组事件进行处理
nsTemplate.runObjBtnHandler = function(btnArr,basefunc,subfunc){
	var origalTableBtns = {};
	var tableBtnArr = [];
	for(var btnI=0; btnI<btnArr.length; btnI++){
		if(typeof(btnArr[btnI].handler)=='function'){
			origalTableBtns[btnI] = {
				handler:btnArr[btnI].handler
			};
		}
		if(!$.isEmptyObject(btnArr[btnI])){
			if(!$.isEmptyObject(btnArr[btnI].btn)){
				origalTableBtns[btnI] = {
					handler:btnArr[btnI]
				};
				
			}
		}
		if($.isArray(btnArr[btnI].subdata)){
			origalTableBtns[btnI] = {};
			for(var subI=0; subI<btnArr[btnI].subdata.length; subI++){
				if(typeof(btnArr[btnI].subdata[subI].handler)=='function'){
					origalTableBtns[btnI][subI] = {
						handler:btnArr[btnI].subdata[subI].handler
					};
				}
				if(!$.isEmptyObject(btnArr[btnI].subdata[subI])){
					if(!$.isEmptyObject(btnArr[btnI].subdata[subI].btn)){
						origalTableBtns[btnI][subI] = {
							handler:btnArr[btnI].subdata[subI]
						};
					}
				}
			}
		}
	}
	for(var navI=0; navI<btnArr.length; navI++){
		if(typeof(btnArr[navI].handler)=='function'){
			var btns = {
				text:btnArr[navI].text,
				handler:basefunc,
				isReturn:true,
				isShowText:typeof(btnArr[navI].isShowText)=='boolean' ? btnArr[navI].isShowText : true,
				isShowIcon:typeof(btnArr[navI].isShowIcon)=='boolean' ? btnArr[navI].isShowIcon : true,
			}
			tableBtnArr.push(btns);
		}
		if(!$.isEmptyObject(btnArr[navI])){
			if(!$.isEmptyObject(btnArr[navI].btn)){
				var btns = {
					text:btnArr[navI].btn.text,
					handler:basefunc,
					isReturn:true,
					isShowText:typeof(btnArr[navI].btn.isShowText)=='boolean' ? btnArr[navI].btn.isShowText : true,
					isShowIcon:typeof(btnArr[navI].btn.isShowIcon)=='boolean' ? btnArr[navI].btn.isShowIcon : true,
				}
				tableBtnArr.push(btns);
			}
		}
		if($.isArray(btnArr[navI].subdata)){
			var sub = {text:btnArr[navI].text,subdata:[]};
			for(var subI=0; subI<btnArr[navI].subdata.length; subI++){
				if(typeof(btnArr[navI].subdata[subI].handler)=='function'){
					var btns = {
						text:btnArr[navI].subdata[subI].text,
						handler:subfunc,
						isReturn:true,
						isShowText:typeof(btnArr[navI].subdata[subI].isShowText)=='boolean' ? btnArr[navI].subdata[subI].isShowText : true,
						isShowIcon:typeof(btnArr[navI].subdata[subI].isShowIcon)=='boolean' ? btnArr[navI].subdata[subI].isShowIcon : true,
					}
					sub.subdata.push(btns);
				}
				if(!$.isEmptyObject(btnArr[navI].subdata[subI])){
					if(!$.isEmptyObject(btnArr[navI].subdata[subI].btn)){
						var btns = {
							text:btnArr[navI].subdata[subI].btn.text,
							handler:subfunc,
							isReturn:true,
							isShowText:typeof(btnArr[navI].subdata[subI].btn.isShowText)=='boolean' ? btnArr[navI].subdata[subI].btn.isShowText : true,
							isShowIcon:typeof(btnArr[navI].subdata[subI].btn.isShowIcon)=='boolean' ? btnArr[navI].subdata[subI].btn.isShowIcon : true,
						}
						sub.subdata.push(btns);
					}
				}
			}
			tableBtnArr.push(sub);
		}
	}
	return [tableBtnArr,origalTableBtns];
}
//根据表格列获取对应的表单，简单转换，依赖于inputType属性
nsTemplate.getFieldArrayByColumns = function(columns, rowData){
	var fieldArray = [];
	for(var columnIndex = 0; columnIndex < columns.length; columnIndex++){
		//nsfield-btns 是模板添加的字段过滤掉nsTemplateButton
		if(columns[columnIndex].field!='nsfield-btns' || columns[columnIndex].field!='nsTemplateButton'){
			var fieldObj = {};	
			fieldObj.id = columns[columnIndex].field;
			fieldObj.type = columns[columnIndex].inputType;
			fieldObj.label = columns[columnIndex].title;
			if(typeof(rowData)=='object'){
				fieldObj.value = rowData[columns[columnIndex].field];
			}
			fieldArray.push(fieldObj);
		}
	}
	return fieldArray;
}
//模板通用配置验证
nsTemplate.validConfigByTemplate = function(_config,options){
	//不使用debugger模式则直接返回成功
	if(debugerMode==false){
		return true;
	}
	//config传入错误
	if(typeof(_config)!='object'){
		console.error('nsTemplate.validConfigByCommon 待验证的数据有误, config:'+_config);
		console.error(_config);
		return false;
	}
	var isValid = true;
	//整体参数验证
	var validArr =
		[
			['template',				'string',	],		//标题
			['package',					'string',	],		//标题
			['id',						'string',	],		//标题
			['title',					'string',	],		//标题
			['beforeInitHandler',		'function'	],		//初始化完成之前回调函数
			['afterInitHandler',		'function'	],		//初始化完成之后回调函数
			['beforeSubmitHandler',		'function'	],		//form表单刷新表格数据之前的回调
			['isFormHidden',			'boolean'	],		//是否隐藏form
			['isShowTitle',				'boolean'	],		//是否显示标题
			['isReadOnly',				'boolean'	],		//template是否禁用
			['saveData',				'object'	],		//保存配置
			['getValueAjax',			'object'	],		//获取默认值的配置
			['mode',					'string'	],		//子模板  用来改变页面展现形式
			['extendColumnAttr',		'object'	],		//table列扩展属性
			['extendValid',				'array'		]		//保存的验证
		];
	var validAjaxArr =
		[

			['src',			'string',	true],		//地址
			['type',		'string'	],			//类型
			['dataSrc',		'string',	true],		//dataSrc
			//['data',		'object'	]			//发送参数
		]; 
	//如果有多余参数则提醒
	var validJson = {};
	for(var validArrI = 0; validArrI<validArr.length; validArrI++){
		validJson[validArr[validArrI][0]] = validArr[validArrI][1];
	}
	for(var key in _config){
		if(key === 'form' || key === 'tab' || key === 'table'){
			//不需要提示有误信息
		}else{
			if(typeof(validJson[key])=='undefined'){
				//console.warn('存在可能有误的config配置字段 '+key+':'+_config[key]);
			}
		}
	}
	isValid = nsDebuger.validOptions(validArr, _config);
	if(isValid == false){
		return false;
	}
	//处理ajax
	if(typeof(_config.saveData)=='object'){
		//那么ajax必填
		if(typeof(_config.saveData.ajax)=='object'){
			if(_config.saveData.ajax.src){
				var validSaveData = 
					[
						['ajax',	'object',	true],		//ajax必填
						['save',	'object'	]			//是否有保存按钮的定义
					]
				isValid = nsDebuger.validOptions($.extend(true, [], validSaveData), _config.saveData);
				if(isValid == false){
					return false;
				}
				isValid = nsDebuger.validOptions($.extend(true, [], validAjaxArr), _config.saveData.ajax);
				if(isValid == false){return false;}
			}
		}
	}
	if(typeof(_config.getValueAjax)=='object'){
		isValid = nsDebuger.validOptions($.extend(true, [], validAjaxArr), _config.getValueAjax);
	}
	return isValid;
}
//模板通用默认值验证
nsTemplate.setDefaultByTemplate = function(_config,options){
	var returnConfig = $.extend(true,{},_config);
	var defaultConfig = {
		title:							'',			//标题
		isShowTitle:					false,		//是否显示标题		
		isShowHistoryBtn:				false,		//是否显示历史记录按钮
		mode:							'',			//当前模式
		isFormHidden:					false,		//是否隐藏form显示
		nav:							{},			//导航按钮默认为空
		saveData:						{},			//保存ajax对象的配置
		getValueAjax:					{},			//默认读取对象的ajax配置默认为空
		browersystem:					nsVals.browser.browserSystem//浏览器pc mobile 
	};
	nsVals.setDefaultValues(returnConfig, defaultConfig);
	if(returnConfig.title){
		//如果标题存在
		returnConfig.isShowTitle = true;//那么默认显示标题
	}
	var saveDataAjax = {
		ajax:{
			dataFormat:'object',
			data:{}
		},
		save:{}
	};
	var navConfig = {field:[]};
	nsVals.setDefaultValues(returnConfig.saveData,saveDataAjax);
	nsVals.setDefaultValues(returnConfig.nav,navConfig);

	return returnConfig;
}
//模板保存增删改配置验证
nsTemplate.validConfigBySaveDataAction = function(_config){
	//savedata的增删改方法配置
	//如果add edit delete是定义的在验证是否合法，如果没有则添加 type:none
	var  validArr =
		[
			['type', 		'string' 	 	 ], 	//类型mutil component dialog custom 
			['field', 		'array' 		 ], 	//字段 不填默认为当前表格的字段转换为field
			['title', 		'string' 		 ], 	//标题 如果是dialog和confirm则需要，如果没有 则
			['serviceComponent',  'object'	 ], 	//业务组件
			['text', 		'string'	 	 ], 	//文本 用于confirm 或者dialog的按钮
		];
	//业务组件验证参数
	var componentValidArr = 
		[
			['data', 		'object'		 ], 	//业务组件数据
			['init', 		'function', true ], 	//业务组件初始化方法
			['type',  		'string', 	true ], 	//类型
			['setFocus', 	'function'	 	 ], 	//设置焦点方法 
		];
	var isValid = true;
	//处理增删改方法
	$.each(_config, function(key,value){
		switch(key){
			case 'add':
			case 'edit':
			case 'delete':
				isValid = nsDebuger.validOptions($.extend(true, [], validArr), _config[key]);
				if(isValid == false){
					return false;
				}else{
					//验证业务组件
					if(_config[key].serviceComponent){
						isValid = nsDebuger.validOptions($.extend(true, [], componentValidArr), _config[key].serviceComponent);
						if(isValid == false){
							return false;
						}
					}
				}
				break;
		}
	});
	return isValid;
}
//模板表格配置验证
nsTemplate.validConfigByTable = function(_config, options){
	/* options 是验证配置参数，有如下参数
	 * isMainTable:boolean  	//默认为false 是否主表，如果是主表不验证keyField
	 * isDefaultTable:boolean  	//默认为true 是否默认为表格，有则不验证type
	 */
	//不使用debugger模式则直接返回成功
	if(debugerMode==false){
		return true;
	}
	//config传入错误
	if(typeof(_config)!='object'){
		console.error('nsTemplate.validConfigByTable 待验证的数据有误, config:'+_config);
		console.error(_config);
		return false;
	}
	//默认的options参数
	if(typeof(options)!='object'){
		options = {
			isMainTable:false,
			isDefaultTable:true,
		}
	}else{
		if(typeof(options.isDefaultTable)!='boolean'){
			options.isDefaultTable = true
		}
		if(typeof(options.isMainTable)!='boolean'){
			options.isMainTable = false
		}
	}
	/********* 验证模板 start *********
	{
		type:'table', 																// 类型 table(包括table list tree) form table在本方法中不适用 
		keyField:'goodsPlatformCartypeVoList',   									// VO中key 非主表则必填
		idField:'id', 																// id的field
		field:nsProject.getFieldsByState(nscrm.alias,'goodsPlatformVo',true), 		// field字段配置 包含tableTab的名称和位置，需要单独处理
		title:'车型', 																// 表格的标题 输出到container的标题位置
		add:{ 																		// 整体保存或者独立保存 中的表格添加数据方法
			type:'single' 															// 其它可能的参数包括：multi component dialog custom common confirm
																					// 如果没有则该值为 none
			field:nsProject.getFieldsByState(nscrm.alias,'goodsPlatformVo'),
			serviceComponent:nscrm.parts.carinput, 									// 当且仅当 type:component 时使用，如果有该参数，则自动生成type:component
			title:'标题', 															// 弹出框dialog或者confirm形式时候的title
			text:'文本',															// 弹出框是按钮标题
			ajax:{}, 																// 如果ajax则不是调用savedata整体保存方法
		}
		edit:{
			// 与add相同
		},
		delete:{
			// 与add相同
		},
		btns:[], 																	// 表格上面的按钮，输出位置在container
		tableRowBtns:[], 															// 表格行上的按钮，输出位置在表格行上
		isUseSort:true 																// 是否排序 输出位置一般在表格行上，或者tree的项目上
	}
	********* 验证模板 end  ***********/
	var isValid = true;
	//整体参数验证
	var validArr =
		[
			['type', 			'string'	 	], 	//类型
			['keyField', 		'string'		], 	//key
			['idField', 		'string', 	true], 	//id字段
			['field', 			'array', 	true], 	//字段
			['title', 			'string' 		], 	//通用保存数据方法的配置
			['add', 			'object'	 	], 	//添加
			['edit', 			'object'	 	], 	//修改
			['delete', 			'object'	 	], 	//删除
			['isUseSort', 		'boolean'	 	], 	//排序
			['btns', 			'array'	 		], 	//表格container按钮
			['tableRowBtns',	'array'	 	 	], 	//表格行按钮
			['ajax',			'object'	 	], 	//ajax参数，有些表格没有此参数，来源于其他对象
			['hide', 			'array' 	 	], 	//隐藏值
			['dataReturnbtns',	'function'	 	], 	//表格行返回按钮
		]
	//如果没有默认表格属性则type必填
	if(options.isDefaultTable == false){
		validArr[0].push(true);
	}
	//如果不是主表则keyField必填
	if(options.isMainTable == false){
		validArr[1].push(true);
	}
	//如果有多余参数则提醒
	var validJson = {};
	for(var validArrI = 0; validArrI<validArr.length; validArrI++){
		validJson[validArr[validArrI][0]] = validArr[validArrI][1];
	}
	for(var key in _config){
		if(typeof(validJson[key])=='undefined'){
			console.warn('存在可能有误的config配置字段 '+key+':'+_config[key]);
		}
	}
	isValid = nsDebuger.validOptions(validArr, _config);
	if(isValid == false){
		return false;
	}
	//ajax验证参数
	var  validAjaxArr =
		[
			['src', 		'string', 	 true], 	//地址
			['type', 		'string' 		 ], 	//类型
			['dataSrc', 	'string', 	 true], 	//dataSrc
			['data',  		'object'	 	 ], 	//发送参数
			['isServerMode','boolean'	 	 ], 	//是否服务器端模式
		]
	//处理增删改方法
	isValid = nsTemplate.validConfigBySaveDataAction(_config);
	if(isValid == false){return false;}
	//处理ajax
	if(_config.ajax){
		isValid = nsDebuger.validOptions($.extend(true, [], validAjaxArr), _config.ajax);
	}
	return isValid;
}
//模板表格设置默认值
nsTemplate.setDefalutByTable = function(_config,options,pageConfig){
	/*
		*options{
			*dialogBeforeHandler	弹框调用前置方法
			*ajaxBeforeHandler		弹框ajax保存前置方法
			*ajaxAfterHandler		弹框ajax保存后置方法
			*source					来源是table  table和form的操作逻辑不一样所以要判断来源
			*operator				btns的操作对象输出是在container容器面板，tableRowBtns操作对象输出在行对象返回参不一样	
		*}
	*/
	var optionsConfig = $.extend(true,{},options);
	optionsConfig.source = 'table';
	var btnsOptionConfig = $.extend(true,{operator:'btns'},optionsConfig);
	var rowBtnsOptionConfig = $.extend(true,{operator:'rowBtns'},optionsConfig);
	//设置默认值
	var defaultConfig = {
		type:'table',
		title:'', 																// 表格的标题 默认为''
		isUseSort:false, 														// 默认没有排序
		add:{
			type:'none'
		},
		delete:{
			type:'none'
		},
		edit:{
			type:'none'
		},
		hide:[],
		btns:[],
		tableRowBtns:[],
		ajax:false,
		params:{
			displayMode:'table',
			isServerMode:false,//默认客户端读取数据
		}
	}
	//默认的整体参数
	var returnConfig = $.extend(true, {}, _config);
	nsVals.setDefaultValues(returnConfig, defaultConfig);
	//表格设置为隐藏值
	nsTemplate.setFieldHide('table', returnConfig.field, returnConfig.hide);
	returnConfig.btns = nsTemplate.setBtnDataChargeHandler(returnConfig.btns,btnsOptionConfig,pageConfig);
	returnConfig.tableRowBtns = nsTemplate.setBtnDataChargeHandler(returnConfig.tableRowBtns,rowBtnsOptionConfig,pageConfig);

	/***********处理isclosebtn*************/
	for(var btnI=0; btnI<returnConfig.tableRowBtns.length; btnI++){
		if(typeof(returnConfig.tableRowBtns[btnI].functionConfig)=='object'){
			if(typeof(returnConfig.tableRowBtns[btnI].functionConfig.isCloseBtn)=='boolean'){
				if(returnConfig.tableRowBtns[btnI].functionConfig.isCloseBtn == true){
					returnConfig.field.push({
						field:'nsTemplateButton',
						width:30,
						hidden:true,
						tabPosition:'after',
						formatHandler: {
							type: 'closebtn',
							data: {
								functionConfig:returnConfig.tableRowBtns[btnI].functionConfig,
								handler:optionsConfig
							}
						}
					});
				}
			}
		}
	}
	/****sjj 20180509添加tableRowBtns配置 ****/
	var defaultAjaxConfig = {
		type:'post', 			//默认POST传参
		data:{}, 				//默认传空对象
		isServerMode:false, 	//默认客户端模式
	}
	//默认ajax参数
	if(returnConfig.ajax){
		nsVals.setDefaultValues(returnConfig.ajax, defaultAjaxConfig);
	}
	//默认的增删改配置
	var defaultAjaxConfig = {
		type:'post', 			//默认POST传参
		data:{}, 				//默认传空对象
	}
	var defaultConfig = {
		title:'',
	}
	var defaultDialogTitle = language.template.defaultTitle; //默认的标题，在language文件中定义
	var defaultDialogText = language.template.defaultText; //默认的标题，在language文件中定义

	$.each(_config, function(key,value){
		switch(key){
			case 'add':
			case 'delete':
			case 'edit':
				//默认的ajax配置
				if(_config[key].ajax){
					//如果有ajax配置则添加默认值
					nsVals.setDefaultValues(returnConfig[key].ajax, defaultAjaxConfig);
				}
				//默认的field
				switch(returnConfig[key].type){
					case 'dialog':
						//如果定义了dialog又没有field则自动返回表格的field
						if(typeof(_config[key].field)=='undefined'){
							//returnConfig[key].field = $.extend(true, [], returnConfig.field);
							var formFieldArray = [];
							for(var fieldI = 0; fieldI<returnConfig.field.length; fieldI++){
								var fieldData = returnConfig.field[fieldI];
								formFieldArray.push({
									type:fieldData.inputType,
									id:fieldData.field,
									label:fieldData.title,
								})
							}
							returnConfig[key].field = formFieldArray;
						}
						//如果没有定义标题 则添加默认标题
						if(typeof(_config[key].title)=='undefined'){
							returnConfig[key].title = defaultDialogTitle[key];
						}

						//sjj 20180917 弹框确认按钮的定义
						var textStr = _config[key].dialogBtnText;//读取配置的值
						//如果没有定义标题 则添加默认标题
						if(typeof(_config[key].dialogBtnText)=='undefined'){
							returnConfig[key].dialogBtnText = defaultDialogText[key];
							textStr = defaultDialogText[key]; //没有定义值就读取默认 sjj20180917
						}
						if(typeof(_config[key].text)=='undefined'){
							returnConfig[key].text = defaultDialogText[key];
						}
						//sjj20180917 定义弹出框的宽度 
						var width = 's';//默认s
						switch(typeof(returnConfig[key].width)){
							case 'number':
								width = returnConfig[key].width + 'px';
								break;
							case 'string':
								if(returnConfig[key].width){
									//值存在不为空
									width = returnConfig[key].width;
								}
								break;
							default:
								break;
						}
						//生成dialog弹框
						var dialogConfig = 
						{
							id:'dialog-template',
							title:returnConfig[key].title,
							size:width,
							form: $.extend(true, [], returnConfig[key].field),
							btns:
							[
								{
									text:textStr,
								}
							]
						}
						returnConfig[key].dialogConfig = dialogConfig;
						break;
					case 'confirm':
						//如果没有定义标题 则添加默认标题
						if(typeof(_config[key].title)=='undefined'){
							returnConfig[key].title = defaultDialogTitle[key];
						}
						//如果没有定义标题 则添加默认标题
						if(typeof(_config[key].text)=='undefined'){
							returnConfig[key].text = defaultDialogText[key];
						}
						break;
				}
				break;
		}
	})
	return returnConfig;
}
//模板表格UI控制 
nsTemplate.setTableConfig = function(tabelConfig, options){
	//tableConfig 传入表格参数 {columns:{},ui:{},data:{}}
	/*options 配置参数
	 *	isUseDefault:boolean 默认为true，使用默认值会设置表格默认参数
	 * 		非默认参数包括：
	 * 			isSingleSelect: 是否单行选择
	 *			isServerMode：是否开启服务器端模式
	 *			所有的函数：如onSingleSelectHandler
	 */
	//options的默认参数
	if(typeof(options)=='undefined'){
		options = {
			isUseDefault:true
		}
	}
	options.isUseDefault = typeof(options.isUseDefault)=='boolean'?options.isUseDefault:true;
	//是否使用默认值
	if(options.isUseDefault){
		//data的默认值
		if(typeof(tabelConfig.data)!='object'){
			tabelConfig.data = {};
		}
		tabelConfig.data.isSearch = true; 			//是否开启搜索功能
													//isSearchVisible:false, //关闭搜索可见
		tabelConfig.data.isPage = true; 			//是否开启分页
		tabelConfig.data.dataSource = [];

		//ui的默认值
		if(typeof(tabelConfig.ui)!='object'){
			tabelConfig.ui = {};
		}
		if(typeof(tabelConfig.ui.isSingleSelect)!='boolean' || typeof(tabelConfig.ui.isMulitSelect)!='boolean'){
			tabelConfig.ui.isSingleSelect = true; 		//默认单行选择
			tabelConfig.ui.isMulitSelect = false; 
		}
		tabelConfig.ui.isUseTabs = true; 				//默认使用tabs
		tabelConfig.ui.isUseCleanLocalStorage = true; 	//默认开启菜单
	}
	//表格tab相关
	var tabelParameters =  nsList.getTableColumnAndTabsName(tabelConfig.columns);
	//返回值有效，能够识别表格的tab属性 执行更改
	if(tabelParameters.tabsName.length > 0 ){
		tabelConfig.columns = tabelParameters.columnArray;
		tabelConfig.ui.tabsName = tabelParameters.tabsName;
		tabelConfig.ui.isUseTabs = true;
		tabelConfig.ui.isUseCleanLocalStorage = true;
	}else{
		//如果开启了使用tab表格则显示控制组件
		if(tabelConfig.ui.isUseTabs){
			tabelConfig.ui.isUseCleanLocalStorage = true;
		}		
	}
}
//模板表单配置验证
nsTemplate.validConfigByForm = function(_config,options){
	//不使用debugger模式则直接返回成功
	if(debugerMode==false){
		return true;
	}
	//config传入错误
	if(typeof(_config)!='object'){
		console.error('nsTemplate.validConfigByForm 待验证的数据有误, config:'+_config);
		console.error(_config);
		return false;
	}
	var isValid = true;
	//整体参数验证
	var validArr =
		[
			['field',				'array',	true	],		//字段
			['hide',				'array'				],		//隐藏值
			['isUserControl',		'boolean'			],		//是否开启用户自定义配置
			['isUserContidion',		'boolean'			],		//是否开启筛选条件
			['btns',				'array'				],		//按钮配置
			['keyField',			'string'			],		//list
			['idField',				'string'			],		//id
			['add',					'object'			],		//添加
			['delete',				'object'			],		//编辑
			['edit',				'object'			],		//删除
		];
	//如果有多余参数则提醒
	var validJson = {};
	for(var validArrI = 0; validArrI<validArr.length; validArrI++){
		validJson[validArr[validArrI][0]] = validArr[validArrI][1];
	}
	for(var key in _config){
		if(typeof(validJson[key])=='undefined'){
			console.warn('存在可能有误的config配置字段 '+key+':'+_config[key]);
		}
	}
	isValid = nsDebuger.validOptions(validArr, _config);
	if(isValid == false){
		return false;
	}
	//处理增删改方法
	isValid = nsTemplate.validConfigBySaveDataAction(_config);
	return isValid;
}
//模板表单设置默认值
nsTemplate.setDefaultByForm = function(_config,options,pageConfig){
	//formConfig 传入表格参数 {field:{},hide:{},}
	/*
		*options{
			*dialogBeforeHandler	弹框调用前置方法
			*ajaxBeforeHandler		弹框ajax保存前置方法
			*ajaxAfterHandler		弹框ajax保存后置方法
		*}
	*/
	//options的默认参数
	if(typeof(options)=='undefined'){
		options = {
			isUseDefault:true
		}
	}
	var formConfig = $.extend(true,{},_config);
	var defaultConfig ={
		isUserControl:false,
		isUserContidion:false,
		hide:[],
		btns:[]
	}
	nsVals.setDefaultValues(formConfig,defaultConfig,pageConfig);
	nsTemplate.setFieldHide('form', formConfig.field, formConfig.hide);
	var defaultOptionConfig = {source:'form'};
	var optionsConfig = $.extend(true,options,defaultOptionConfig);
	nsTemplate.setBtnDataChargeHandler(formConfig.btns,optionsConfig);
	return formConfig;
}
//模板树配置验证
nsTemplate.validConfigByTree = function(_config){
	//不使用debugger模式则直接返回成功
	if(debugerMode==false){
		return true;
	}
	//config传入错误
	if(typeof(_config)!='object'){
		console.error('nsTemplate.validConfigByTree 待验证的数据有误, config:'+_config);
		console.error(_config);
		return false;
	}
	var isValid = true;
	//整体参数验证
	var validArr =
		[
			['src',				'string',	true	],				//请求ajax链接
			['type',			'string'			],				//请求方式 GET,POST
			['data',			'object'			],				//请求参数{}
			['dataSrc',			'string',	true	],				//数据源参
			['idField',			'string',	true	],				//id值
			['textField',		'string',	true	],				//value值
			['valueField',		'string',	true	],				//key值
			['childIdField',	'string'			],				//子元素字段
			['parentIdField',	'string'			],				//父元素字段
			['openState',		'object'			],				//展开层
			['btns',			'array'				],				//自定义按钮配置
			['column',			'number'			]				//列宽
		];
	//如果有多余参数则提醒
	var validJson = {};
	for(var validArrI = 0; validArrI<validArr.length; validArrI++){
		validJson[validArr[validArrI][0]] = validArr[validArrI][1];
	}
	for(var key in _config){
		if(typeof(validJson[key])=='undefined'){
			console.warn('存在可能有误的config配置字段 '+key+':'+_config[key]);
		}
	}
	isValid = nsDebuger.validOptions(validArr, _config);
	if(isValid == false){
		return false;
	}
	//处理增删改方法
	isValid = nsTemplate.validConfigBySaveDataAction(_config);
	if(isValid == false){return false;}
	return isValid;
}

//设置按钮数据的转换方法
nsTemplate.setBtnDataChargeHandler = function(btnData,options,pageConfig){
	//目前支持设置的是按钮的前后置方法
	/*
		*
		* options {
		* 	source:''//form,table,
		* 	keyField:'root.aa.aa',
		*	currentData:{},
		* 	callback:{delete:function, edit:function, add:function, refresh:function} objectState
		* }
	*/

	var handlerObj = {};
	var dropdownObj = {};
	var commonBtn = {
		dialogBeforeHandler:function($dom){
			return options.dialogBeforeHandler($dom);
		},
		//ajax发送之前的处理函数
		ajaxBeforeHandler:function(_data){
			return options.ajaxBeforeHandler(_data);
		},
		//ajax发送之后的处理函数
		ajaxAfterHandler:function(res,plusData){
			return options.ajaxAfterHandler(res,plusData);
		},
		//初始化弹框加载界面
		loadPageHandler:function(data){
			return options.loadPageHandler(data);
		},
		//关闭弹框界面
		closePageHandler:function(data){
			return options.closePageHandler(data);
		},
	};
	if(typeof(pageConfig)=='object'){
		nsTemplate.handlerObj[pageConfig.id] = commonBtn;
	}
	//根据来源是form,table决定调用公用事件方法
	var commonHandler = function(){};
	function commonTableRowBtnsHandler(data){
		delete data.rowData['nsTemplateButton'];
		var nIndex = data.buttonIndex;
		commonBtn.getFuncConfigHandler = function(data){
			var nsIndex = data.buttonIndex;
			return handlerObj[nsIndex].functionConfig;
		};//方法请求之前的处理函数
		handlerObj[nIndex].handler(commonBtn,data)
	}
	function commonTableBtnsHandler($dom){
		var nIndex;
		//模板打印处理 lxh 1121 begin
		if(!($dom instanceof jQuery)){
			$dom = $dom.$dom;
		}
		//模板打印处理 lxh 1121 end
		nIndex = Number($dom.attr('customerindex'));
		if($dom.is('li')){
			nIndex = $dom.children('a').attr('optionid');
		}
		commonBtn.getFuncConfigHandler = function($btn){
			var nsIndex = Number($btn.attr('customerindex'));
			if($dom.is('li')){
				nsIndex = $dom.children('a').attr('optionid');
			}
			return handlerObj[nsIndex].functionConfig;
		};//方法请求之前的处理函数	
		handlerObj[nIndex].handler(commonBtn,$dom)
	}
	function dropdownCommonHandler($dom){
		var nSubIndex = Number($dom.children('a').attr('optionid'));
		var nIndex = Number($dom.children('a').attr('fid'));
		var functionConfig = dropdownObj[nIndex][nSubIndex].functionConfig;
		var json = {
			$dom:$dom,
			functionConfig:functionConfig
		};
		dropdownObj[nIndex][nSubIndex].handler({
			dialogBeforeHandler:function($dom){
				return options.dialogBeforeHandler($dom);
			},
			//ajax发送之前的处理函数
			ajaxBeforeHandler:function(_data){
				return options.ajaxBeforeHandler(_data);
			},
			//ajax发送之后的处理函数
			ajaxAfterHandler:function(res){
				return options.ajaxAfterHandler(res);
			},
			//初始化弹框加载界面
			loadPageHandler:function(data){
				return options.loadPageHandler(data);
			},
			//关闭弹框界面
			closePageHandler:function(data){
				return options.closePageHandler(data);
			}
		},json)
	}
	switch(options.source){
		case 'form':
			commonHandler = commonTableBtnsHandler;
			break;
		case 'table':
			if(options.operator == 'btns'){
				commonHandler = commonTableBtnsHandler;
			}else if(options.operator == 'rowBtns'){
				commonHandler = commonTableRowBtnsHandler;
			}
			break;
	}
	//根据来源定义事件回调方法
	for(var btnI=0; btnI<btnData.length; btnI++){
		dropdownObj[btnI] = {};
		if(typeof(btnData[btnI].btn)=='object'){
			var btnObj  = $.extend(true,{},btnData[btnI].btn);
			handlerObj[btnI] = {
				handler:btnObj.handler,
				functionConfig:btnData[btnI].functionConfig
			};
			btnData[btnI].btn.handler = commonHandler;
			//sjj20181119 针对下拉按钮
			if($.isArray(btnData[btnI].btn.subdata)){
				for(var dropI=0; dropI<btnData[btnI].btn.subdata.length; dropI++){
					var btnObj = $.extend(true,{},btnData[btnI].btn.subdata[dropI]);
					dropdownObj[btnI][dropI] = {
						handler:btnObj.handler,
						functionConfig:btnObj
					}
					btnData[btnI].btn.subdata[dropI].handler = dropdownCommonHandler;
				}
			}
		}
	}
	return btnData;
}
//得到button数组值
nsTemplate.getBtnArrayByBtns = function(btnData,options){
	/*
		*btnData 传送进来的数据格式[btn:{text:'',handler:function(){}}]
		*转换后返回格式[{text:'',handler:function(){}}]
		*options 来源
	*/
	var returnArray = [];
	for(var btnI=0; btnI<btnData.length; btnI++){
		var btn = $.extend(true,{},btnData[btnI]);
		var functionConfig = btn.functionConfig ? btn.functionConfig : "";
		var isCloseBtn = false;//针对块状表格关闭按钮事件的处理转移
		if(typeof(btn.btn)=='object'){
			if(typeof(btn.functionConfig)=='object'){
				if(typeof(btn.functionConfig.isCloseBtn)=='boolean'){
					isCloseBtn = btn.functionConfig.isCloseBtn;
				}
			}
			btn = btn.btn;
		}
		btn.index = {
			customerIndex:btnI,
			iconCls:'<i class="icon-all-o"></i>'
		};
		switch(btn.text){
			case '红冲申请':
				btn.index.iconCls = '<i class="icon-file-badge-o"></i>';
				break;
			case '作废':
				btn.index.iconCls = '<i class="icon-close-circle-o"></i>';
				break;
			case '提交':
				btn.index.iconCls = '<i class="icon-check-circle-o"></i>';
				break;
			case '编辑':
				btn.index.iconCls = '<i class="icon-edit-o"></i>';
				break;
			case '回退':
				btn.index.iconCls = '<i class="icon-arrow-left-alt-o"></i>';
				break;
			case '保存':
				btn.index.iconCls = '<i class="icon-save"></i>';
				break;
			case '查看详情':
				btn.index.iconCls = '<i class="icon-eye-o"></i>';
				break;
			case '销售记录':
				btn.index.iconCls = '<i class="icon-order-search-o"></i>';
				break;
			case '驳回':
				btn.index.iconCls = '<i class="icon-allot-o"></i>';
				break;
			case '签收':
				btn.index.iconCls = '<i class="icon-register"></i>';
				break;
			case '保存草稿':
				btn.index.iconCls = '<i class="icon-time-out-o"></i>';
				break;
			case '草稿箱':
				btn.index.iconCls = '<i class="icon-inbox"></i>';
				break;
			case '库存状况查询':
				btn.index.iconCls = '<i class="icon-warehouse-o"></i>';
				break;
			case '回执登记':
				btn.index.iconCls = '<i class="icon-file-o"></i>';
				break;
			case '删除':
				btn.index.iconCls = '<i class="icon-trash-o"></i>';
				break;
		}
		//模板打印按钮处理  lxh 1120
		if(functionConfig.length != 0 && functionConfig.defaultMode == 'templatePrint'){
			btn.dropdownType = 'ajaxShowIndex';
			btn.clickShow = functionConfig.clickShow;
			btn.callbackAjax = functionConfig.callbackAjax;
			btn.textField = functionConfig.textField;
			btn.valueField = functionConfig.valueField;
			btn.ajaxConfig = {
				url:functionConfig.url,
				data:functionConfig.ajaxData,
				dataSrc:functionConfig.dataSrc,
				type:"GET",
			}
		}
		if(!isCloseBtn){
			returnArray.push(btn);
		}
	}
	return returnArray;
}
//转换form值问题
nsTemplate.getChargeDataByForm = function(formId,isValid){
	var validBool = typeof(isValid)=='boolean'?isValid:true;//默认为真进行验证
	var jsonData = nsForm.getFormJSON(formId,validBool);
	if(jsonData){
		var formData = nsForm.getFormData(formId);
		var formInput = nsForm.data[formId].formInput;
		for(var data in jsonData){
			if(typeof(formInput[data]) != 'undefined'){
				switch(formInput[data].type){
					case 'datetime':
					case 'date':
						if(jsonData[data]){
							jsonData[data] = moment(jsonData[data]).format('x');
							jsonData[data] = Number(jsonData[data]);
							//jsonData[data] = new Date(jsonData[data]).getTime();
						}
						break;
					case 'daterangeRadio':
						var value = Number(jsonData[data]);
						var dateStr = '';
						//.format('YYYY-MM-DD')
						var startDate = '';
						var endDate = '';
						switch(value){
							case 0:
								dateStr = '';
								break;
							case 1:
								//今天
								var days = moment().format('YYYY-MM-DD');
								startDate = days + ' 00:00:00';
								startDate = moment(startDate).format('x');
								endDate = days + ' 23:59:59';
								endDate = moment(endDate).format('x');
								break;
							case 2:
								//本周
								startDate = moment().day(1).format('YYYY-MM-DD');
								startDate = startDate + ' 00:00:00';
								startDate = moment(startDate).format('x');
								endDate = moment().day(7).format('YYYY-MM-DD');
								endDate = endDate + ' 23:59:59';
								endDate = moment(endDate).format('x');
								//dateStr = startDate + ',' + endDate;
								break;
							case 3:
								if(formInput[data].rangeType === 'after'){
									//下周
									startDate = moment().day(8).format('YYYY-MM-DD');
									endDate = moment().day(15).format('YYYY-MM-DD');
									startDate = startDate + ' 00:00:00';
									endDate = endDate + ' 23:59:59';
									startDate = moment(startDate).format('x');
									endDate = moment(endDate).format('x');
								}else{
									//上周
									startDate = moment().day(-6).format('YYYY-MM-DD');
									startDate = startDate + ' 00:00:00';
									startDate = moment(startDate).format('x');
									endDate = moment().day(0).format('YYYY-MM-DD');
									endDate = endDate + ' 23:59:59';
									endDate = moment(endDate).format('x');
								}
								//dateStr = startDate + ',' + endDate;
								break;
							case 4:
								//本月
								startDate = moment().startOf('month').format('YYYY-MM-DD');
								startDate = startDate + ' 00:00:00';
								startDate = moment(startDate).format('x');
								endDate = moment().endOf('month').format('YYYY-MM-DD');
								endDate = endDate + ' 23:59:59';
								endDate = moment(endDate).format('x');
								//dateStr = startDate + ',' + endDate;
								break;
							case 5:
								if(formInput[data].rangeType === 'after'){
									//下月
									var currentYear  = moment().year();
									var nextMonth = moment().add(1,'month').format('M');
									if(nextMonth == 1){currentYear = currentYear + 1;}
									nextMonth = nextMonth < 10 ? '0'+nextMonth:nextMonth;  
									var days = moment(currentYear+'-'+nextMonth,"YYYY-MM").daysInMonth();
									startDate = currentYear + '-' + nextMonth + '-01 00:00:00';
									startDate = moment(startDate).format('x');
									endDate = currentYear + '-' + nextMonth + '-' + days+' 23:59:59';
									endDate = moment(endDate).format('x');
								}else{
									//上月
									var currentYear  = moment().year();
									var prevMonth = moment().subtract(1,'month').format('M');
									if(prevMonth == 12){currentYear = currentYear - 1;}
									prevMonth = prevMonth < 10 ? '0'+prevMonth:prevMonth; 
									var days = moment(currentYear+'-'+prevMonth,"YYYY-MM").daysInMonth(); 
									startDate = currentYear + '-' + prevMonth + '-01 00:00:00';
									startDate = moment(startDate).format('x');
									endDate = currentYear + '-' + prevMonth + '-' + days+' 23:59:59';
									endDate = moment(endDate).format('x');
								}
								//dateStr = startDate + ',' + endDate;
								break;
							case 6:
								//自定义时间段
								var value = $('#form-'+formId+'-'+data+'-isInput-daterange').val();
								if(value){
									value = value.split('-');
									startDate = moment(value[0]).format('YYYY-MM-DD');
									startDate = startDate + ' 00:00:00';
									startDate = moment(startDate).format('x');
									endDate = moment(value[1]).format('YYYY-MM-DD');
									endDate = endDate + ' 23:59:59';
									endDate = moment(endDate).format('x');
									//dateStr = startDate + ',' + endDate;
								}
								break;
						}
						jsonData[data] = '';
						var startId = data + 'Start';
						var endId = data + 'End';
						jsonData[startId] = startDate;
						jsonData[endId] = endDate;
						//日期区间按钮
						break;
					case 'checkbox':
						//数组转换成字符串
						if($.isArray(jsonData[data])){
							var idsStr = '';
							for(var checkI=0; checkI<jsonData[data].length; checkI++){
								idsStr += jsonData[data][checkI] + ',';
							}
							idsStr = idsStr.substring(0,idsStr.lastIndexOf(','));
							jsonData[data] = idsStr;
						}
						break;
					case 'select':
					case 'select2':
						//nsMindjetValueField
						//nsMindjetFieldName  mindjetFieldName
						if(formInput[data].nsMindjetFieldName){
							//定义了冗余字段值
							jsonData[formInput[data].nsMindjetFieldName] = formData[data].text;
						}
						if(formInput[data].mindjetFieldName){
							//定义了冗余字段值
							jsonData[formInput[data].mindjetFieldName] = formData[data].text;
						}
						break;
					case 'provincelinkSelect':
					case 'provinceSelect':
						var linkData = jsonData[data];
						//优先读取区域的code,如果没有就读取市的，最后读取省的
						if(linkData.areaCode){
							jsonData[data] = linkData.areaCode;
						}else if(linkData.cityCode){
							jsonData[data] = linkData.cityCode;
						}else{
							jsonData[data] = linkData.provinceCode;
						}
						break;
					case 'sortAtHalfScreen':
						//sjj 20190417 手机端半屏模式下的获取值
						var sortData = $.extend(true,{},jsonData[data]);
						delete jsonData[data];
						nsVals.extendJSON(jsonData,sortData);
						break;
				}
				if(typeof(jsonData[data])=='object'){
					jsonData[data] = JSON.stringify(jsonData[data]);
				}
				//存在传送其他变量属性值ids = '{"id":"{id}"}' 
				//isArrayValue 是否返回数组类型 值为boolean类型 
				if(formInput[data].outFields){
					var chargeField = JSON.parse(formInput[data].outFields);
					if($.isArray(formInput[data].subdata)){
						for(var subI=0; subI<formInput[data].subdata.length; subI++){
							var cId = formInput[data].subdata[subI][formInput[data].valueField];
							var rowData = {};
							if(typeof(cId)=='number'){
								if(cId == Number(jsonData[data])){
									rowData = formInput[data].subdata[subI];
								}
							}else{
								if(cId == jsonData[data]){
									rowData = formInput[data].subdata[subI];
								}
							}
							if(!$.isEmptyObject(rowData)){
								if(formInput[data].isArrayValue){
									if(!$.isArray(jsonData[field])){
										jsonData[field] = [];
									}
									var cJson = {};
									for(field in chargeField){
										cJson[field] = nsVals.getTextByFieldFlag(chargeField[field],rowData);
									}
									jsonData[field].push(cJson);
								}else{
									for(field in chargeField){
										jsonData[field] = nsVals.getTextByFieldFlag(chargeField[field],rowData);
									}
								}
							}
						}
					}
				}
				//sjj 20190404 如果自定义 了排序字段 需要提交的时候清空自定义值
				if(data == 'nsTemplateOrderSort'){
					if(typeof(jsonData[data])=='string'){
						delete jsonData[data];
					}
				}
			}
		}
	}
	//sjj 20181025 针对转subdata的chargeField值为空的处理
	for(var data in jsonData){
		if(jsonData[data]=='请选择'){
			delete jsonData[data];
		}
	}
	return jsonData;
}
//转form中ajax请求参数的data
nsTemplate.getFormField = function(fieldArr,fieldValue){
	var formFieldArray = $.extend(true,[],fieldArr);
	for(var fieldI = 0; fieldI<formFieldArray.length; fieldI++){
		//是否是ajax请求 需要转data参数
		if(formFieldArray[fieldI].url){
			//存在url链接
			function getSelectAjaxData(_params){
				var data = $.extend(true,{},_params);
				for(var param in data){
					if(data[param].indexOf('.')==-1){ // lyw 加判断条件 临时 select从页面获取data参数还不知道怎么做
						data[param] = nsVals.getTextByFieldFlag(data[param],fieldValue);
					}
					if(data[param] === 'undefined'){data[param] = '';}
				}
				return data;
			}
			formFieldArray[fieldI].data = typeof(formFieldArray[fieldI].data)=='object' ? formFieldArray[fieldI].data : {};
			formFieldArray[fieldI].data = getSelectAjaxData(formFieldArray[fieldI].data);
		}
	}
	return formFieldArray;
}
//处理objectState
nsTemplate.getDataByObjectState = function(data){
	/*
		*删除标识为-1的数据
		*删除objectState标识
		*返回新的集合
	*/
	var listData = $.extend(true,[],data);
	var newDataArray = [];
	for(var i=0; i<listData.length; i++){
		if(listData[i].objectState != NSSAVEDATAFLAG.DELETE){
			//状态不等于-1则追加追加数据并且清除objectState字段
			delete listData[i].objectState;
			if(listData[i].objectCheckState){
				delete listData[i].objectCheckState;
			}
			if(listData[i].objecChecked){
				delete listData[i].objecChecked;
			}
			newDataArray.push(listData[i]);
		}
	}
	return newDataArray;
}
nsTemplate.getEachObjectByObjectState = function(data){
	var listData = $.extend(true,[],data);
	var newDataArray = [];
	function getEachArray(childData){
		var children = [];
		for(var i=0; i<childData.length; i++){
			if(childData[i].objectState != NSSAVEDATAFLAG.DELETE){
				//状态不等于-1则追加追加数据并且清除objectState字段
				delete childData[i].objectState;
				if(childData[i].objecCheckState){
					delete childData[i].objecCheckState;
				}
				if(childData[i].objecChecked){
					delete childData[i].objecChecked;
				}
				children.push(childData[i]);
			}
			for(var obj in childData[i]){
				if($.isArray(childData[i][obj])){
					children = getEachArray(childData[i][obj]);
				}
			}
		}
		return children;
	}
	newDataArray = getEachArray(listData);
}
nsTemplate.getVoListData = function(valueData,_treeVoData){
	/*
		*valueData 当前要赋值的数据
		*treeVoData 要转化的树结构数据 
	*/
	var outputData = {};
	var treeVoData = nsDataFormat.convertToTree(_treeVoData,'keyField','parentKeyField','children');
	function runData(nodeArray,parentFieldKey){
		if(!$.isArray(nodeArray)){
			//如果递归的不是数组直接return
			return;
		}
		for(var nodeI=0; nodeI<nodeArray.length; nodeI++){
			var nodeData = nodeArray[nodeI];//当前节点的值
			var isRoot = false;//默认不作为根节点的添加
			var parentKeyField = nodeData.parentKeyField;//节点父元素vo
			var keyField = nodeData.keyField;//节点的vo
			var nextParentFieldKey = parentKeyField;//下一个节点的parentKeyField 是当前节点的keyField
			if(parentFieldKey){
				nextParentFieldKey = parentFieldKey + '.' + parentKeyField;
			}
			//没有定义父节点vo,或者定义了空值都是根节点
			switch(typeof(parentKeyField)){
				case 'undefined':
					isRoot = true;
					break;
				case 'string':
					if(parentKeyField == ''){
						isRoot = true;
					}
			}
			if(isRoot){
				//如果是根节点直接克隆赋值
				outputData = $.extend(true,outputData,valueData[keyField]);
			}else{
				var idFieldNamesArray = nextParentFieldKey.split('.');
				if(idFieldNamesArray.length == 1){
					//第二层结构
					outputData[keyField] = valueData[keyField];
				}else{
					var currentKey = nextParentFieldKey + '.'+keyField;
					var ps = currentKey.split('.');
					var top = outputData;
					for(var i = 1; i < ps.length; i++){
						if(!top[ps[i]]){
							top[ps[i]] = {};
						}
						if(i == ps.length - 1){
							top[ps[i]] = valueData[keyField];
						}
						top = top[ps[i]];
					}
				}
			}
			if($.isArray(nodeData.children)){
				runData(nodeData.children,nextParentFieldKey);
			}
		}
	}
	runData(treeVoData);
	return outputData;
}

nsTemplate.componentInit = function(_config){
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
	var template = nsTemplate.templates[_config.config.template];
	var configObj = $.extend(true,{},_config.config);
	configObj.pageParam = _config.pageParam;
	var handler = template.componentInit(configObj,_config.componentConfig);
	return handler;
}
//根据工作流id存放json格式的数据
nsTemplate.getTableDataByTableId = function(tableId){
	/*
		*	tableId string	表格id 
	*/
	var tableData = nsTable.getAllTableData(tableId);
	var returnData = {};
	for(var rowI=0; rowI<tableData.length; rowI++){
		var rowData = tableData[rowI];
		if(rowData[NSROWAUTOPARAM.workItemId]){
			//存在工作流id
			returnData[rowData[NSROWAUTOPARAM.workItemId]] = rowData;
		}
	}
	return returnData;
}
//根据工作流id给模板存放数据
nsTemplate.setProcessDataByWorkItemId = function(templateConfig){
	/*
		*templateConfig object 模板参数
	*/	
	var mainData = {};//主表数据
	switch(templateConfig.template){
		case 'doubleTables':
			//双表格
			var tableId = 'table-'+templateConfig.id+'-main';
			mainData = {
				type:'list',
				data:nsTemplate.getTableDataByTableId(tableId),
				id:tableId
			};
			break;
		case 'singleTable':
			//单表格
			var tableId = 'table-' + templateConfig.id + '-singleTable';
			mainData = {
				type:'list',
				data:nsTemplate.getTableDataByTableId(tableId),
				id:tableId
			};
			break;
		case 'listFilter':
			//列表查询
			var tableId = 'table-' + templateConfig.id + '-table';
			mainData = {
				type:'list',
				data:nsTemplate.getTableDataByTableId(tableId),
				id:tableId
			};
			break;
		case 'singleForm':
		case 'tabFormList':
		case 'formTable':
			//单表单  tab形式的多表格单表单 单表单多表格
			var formId = templateConfig.id + '-form';
			mainData = {
				type:'vo',
				data:nsTemplate.getChargeDataByForm(formId,false),
				id:formId
			};
			break;
	}
	/*
		*mainData object 要存储的值
		*{
			*type string 类型
			*data object 当前主表的数据值
			*id string  当前主表的id
		}*
	*/
	nsTemplate.data[templateConfig.id] = mainData;
	nsTemplate.setStateByWorkItemId({templateConfig:templateConfig,title:'我是标题',btn:{text:'关闭',handler:function(){}}});
}

nsTemplate.setStateByWorkItemId = function(filterData){
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
	*/
	var templateConfig = filterData.templateConfig;
	var templateId;
	if(templateConfig.id){
		templateId = templateConfig.id;
	}else{
		var packageName = config.package.replace(/\./g, '-');
		templateId = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
	}
	var data = nsTemplate.data[templateConfig.id];
	/*
		*data object 要存储的值
		*{
			*type string 类型
			*data object 当前主表的数据值
			*id string  当前主表的id
		}*
	*/
	var isExistWorkItemId = false;//默认不存在
	if(!$.isEmptyObject(data.data) && $('[nsid="'+templateId+'"]').length == 1){
		//数据值不为空
		switch(data.type){
			case 'vo':
				//直接设置form表单状态
				var titleHtml = '';
				if(filterData.title){
					titleHtml = '<h5>'+filterData.title+'</h5>';
				}
				var btnHtml = '';
				if(filterData.btn){
					btnHtml = '<button type="button" class="btn btn-default">'+filterData.btn.text+'</button>';
				}
				var html = '<div class="dialog-template-state">'+titleHtml+btnHtml+'</div>';
				$('[nsid="'+templateId+'"]').append(html);
				$('[nsid="'+templateId+'"]').addClass('template-disabled');
				if(data.data[filterData.workItemId]){
					//存在工作流id
					isExistWorkItemId = true;
					$('[nsid="'+data.id+'"]').addClass(filterData.state);
				}else{
					//找不到工作流id
				}
				break;
			case 'list':
				//找到数据
				if(data.data[filterData.workItemId] && $('#'+data.id).length == 1){
					//存在数据值
					isExistWorkItemId = true;
					data.data[filterData.workItemId].nsTemplateState = filterData.state;
					nsTemplate.setRowStateByToPage({templateId:templateId,tableId:data.id});
				}
				break;
		}
	}
	return isExistWorkItemId;
	/*var rowsData = nsTable.getAllTableData(tableId);//获取表格所有行数据
	var currentPage = nsTable.data[tableId].currentPage;//获取当前页码
	for(var rowI=0; rowI<rowsData.length; rowI++){
		var rData = rowsData[rowI];
		if(filterFunc(rData)){
			//当前值存在
			rData.nsTemplateState = 'tr-disabled';
		}
	}*/
}//设置list只读模式

nsTemplate.setRowStateByToPage = function(configObj){
	/*
		*configObj object 配置参数
		*{
			*tableId string 表格id
			*templateId string 模板id
		*}
	*/
	var tableId = configObj.tableId;
	var templateId = configObj.templateId;
	var mainData = nsTemplate.data[templateId];
	var $trs = nsTable.container[tableId].trObj;
	$.each($trs,function(key,value){
		//获取当前对象的数据值 如果当前数据值还有状态属性则动态添加样式
		var $tr = $(value);
		var data = baseDataTable.table[tableId].row($tr).data();
		if(mainData.data[data[NSROWAUTOPARAM.workItemId]]){
			if(mainData.data[data[NSROWAUTOPARAM.workItemId]].nsTemplateState){
				$tr.addClass(mainData.data[data[NSROWAUTOPARAM.workItemId]].nsTemplateState);
			}
		}
	})
}//列表翻页获取数据设置只读

nsForm.getValues = nsTemplate.getChargeDataByForm;