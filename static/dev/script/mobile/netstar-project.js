var nsProject = (function() {
//--------------------------------项目处理组件 start--------------------------------
var projectObj = {};  //整体配置参数
var defalutConfig = {};		//默认配置对象
var nstemplate = {
		screenWidth:$(window).width(),    //屏幕宽
		screenHeight:$(window).height(),	//屏幕高
		menuWidth:240,  //菜单宽
		paddingTwo:30,	//内容显示区域外边距
		labelWidth:100,	//标题栏宽度
		scrollbar:17,	//滚动条看度
		tableDefWidth :30, //表格字段列默认宽度
		tableMinWidth :20,//表格字段列最小宽度
		tableMaxWidth: 150//表格字段列最大宽度
	};
defalutConfig.ajax = {
	type:'GET',
}
//设置默认值
function setDefault(projectObj){
	//设置默认的属性
	if(typeof(projectObj.system)=='undefined'){
		projectObj.system = {};
	}
	//系统默认前缀
	if(typeof(projectObj.system.prefix)=='undefined'){
		projectObj.system.prefix = {};
	}
	//url默认前缀
	if(typeof(projectObj.system.prefix.url)=='undefined'){
		// var protocolName = window.location.protocol;
		// var hostName = window.location.host;
		// var pathName = window.location.pathname;
		// var projectName = pathName.substring(0, pathName.indexOf('/',1))
		// projectObj.system.prefix.url = protocolName + '//' + hostName+projectName;
		projectObj.system.prefix.url = getRootPath();
	}
	//默认字典地址
	projectObj.system.prefix.dict = projectObj.system.prefix.url + '/basDictController/getDictByTableName';
	//默认上传图片地址
	projectObj.system.prefix.uploadSrc = projectObj.system.prefix.url + '/attachment/upload';
	// 
	function setUrlBySuffix(_fieldConfig, _type){
		switch(_type){
			case 'text':
				if(typeof(_fieldConfig.remoteAjax)=="string" && _fieldConfig.remoteAjax.indexOf('http:') == -1){
					_fieldConfig.remoteAjax = projectObj.system.prefix.url + _fieldConfig.remoteAjax;
				}
				break;
			//数据处理
			case 'tree-select':
			case 'checkbox':
			case 'radio':
				if(_fieldConfig.suffix){
					_fieldConfig.url = projectObj.system.prefix.url + _fieldConfig.suffix;
				}
				break;
			case 'business':
				if(typeof(_fieldConfig.source)=="object"){
					if(_fieldConfig.source.suffix){
						_fieldConfig.source.url = projectObj.system.prefix.url + _fieldConfig.source.suffix;
					}
				}
				if(typeof(_fieldConfig.search)=="object"){
					if(_fieldConfig.search.suffix){
						_fieldConfig.search.url = projectObj.system.prefix.url + _fieldConfig.search.suffix;
					}
				}
				if(typeof(_fieldConfig.subdataAjax)=="object"){
					if(_fieldConfig.subdataAjax.suffix){
						_fieldConfig.subdataAjax.url = projectObj.system.prefix.url + _fieldConfig.subdataAjax.suffix;
					}
				}
				if(typeof(_fieldConfig.getRowData)=="object"){
					if(_fieldConfig.getRowData.suffix){
						_fieldConfig.getRowData.url = projectObj.system.prefix.url + _fieldConfig.getRowData.suffix;
					}
				}
				break;
			case 'photoImage':
			case 'uploadImage':
			case 'upload':
				if(_fieldConfig.suffix){
					_fieldConfig.url = projectObj.system.prefix.url + _fieldConfig.suffix;
				}else{
					_fieldConfig.url = projectObj.system.prefix.uploadSrc;
				}
				break;
			case 'data':
				_fieldConfig.url = projectObj.system.prefix.dict;
				_fieldConfig.method = 'POST';
				_fieldConfig.data = {tableName:_fieldConfig.urlDictArguments};
				break;
			case 'select2':
			case 'select':
				if(typeof(_fieldConfig.subdata)=='undefined'){
					if(typeof(_fieldConfig.suffix) == 'undefined'){
						_fieldConfig.subdata = [];
						if(debugerMode){
							console.error(_fieldConfig.label+'('+_fieldConfig.id+')字段：'+'的subdata和suffix都未定义未定义，默认空数组');
							console.error(_fieldConfig);
						}
						break;
					}
					_fieldConfig.url = projectObj.system.prefix.url + _fieldConfig.suffix;
					_fieldConfig.method = typeof(_fieldConfig.method) == 'string'?_fieldConfig.method:'post';
					_fieldConfig.dataSrc = typeof(_fieldConfig.dataSrc) == 'string'?_fieldConfig.dataSrc:'rows';
				}
				break;
			case 'uploadSingle':
				_fieldConfig.uploadSrc = projectObj.system.prefix.uploadSrc;
				_fieldConfig.method = 'POST';
				break;
			case 'expression':
				var urlType = typeof(_fieldConfig.urlType)=='string'?_fieldConfig.urlType:'items';
				_fieldConfig.listAjax = {
					url: getRootPath() + '/items/getItemList',
					type: 'POST',
					data: {},
					dataSrc: 'rows'
				};
				switch(urlType){
					case 'items':
						_fieldConfig.listAjax.url = getRootPath() + '/items/getItemList';
						_fieldConfig.listAjaxFields = [
							{ name: 'itemId', idField: true, search: false },
							{ name: 'itemCode', title: '项目代码', search: true },
							{ name: 'itemName', title: '项目名称', search: true },
							{ name: 'itemPyItem', search: true },
							{ name: 'itemWbItem', search: true }
						];
						break;
					case 'pfItems':
						_fieldConfig.listAjax.url = getRootPath() + '/pfItems/getPfItemListOfSelect';
						_fieldConfig.listAjaxFields = [
							{ name: 'pfItemId', idField: true, search: false },
							{ name: 'pfItemName', title: '项目名称', search: true },
							{ name: 'pfItemPyItem', search: true },
							{ name: 'pfItemWbItem', search: true }
						];
						break;
				}
				_fieldConfig.assistBtnWords = ['+', '-', '*', '/', '(', ')', '=', '<>', '>', '<', '>=', '<=', 'and', 'or', '清空'];
				_fieldConfig.dataSource = [];
				break;
			case 'input-select':
				if(typeof(_fieldConfig.saveAjax)=='object'){
					if(typeof(_fieldConfig.saveAjax.suffix)=='string'){
						_fieldConfig.saveAjax.url = getRootPath() + _fieldConfig.saveAjax.suffix;
					}
				}
				if(typeof(_fieldConfig.selectConfig)=='object'){
					if(typeof(_fieldConfig.selectConfig.suffix)=='string'){
						_fieldConfig.selectConfig.url = getRootPath() + _fieldConfig.selectConfig.suffix;
					}
				}
				break
		}
	}
	//修改需要重新赋值的属性
	for(businessName in projectObj){
		if(businessName == 'system' || businessName == 'pages' || businessName == 'default'){
			//系统设置的对象
		}else{
			//业务对象 默认值处理 字典
			for(var fieldId in projectObj[businessName].fields){
				var fieldConfig = projectObj[businessName].fields[fieldId];
				setUrlBySuffix(fieldConfig, fieldConfig.mindjetType);
				// switch(fieldConfig.mindjetType){
				// 	//数据处理
				// 	case 'tree-select':
				// 	case 'checkbox':
				// 	case 'radio':
				// 		if(fieldConfig.suffix){
				// 			fieldConfig.url = projectObj.system.prefix.url + fieldConfig.suffix;
				// 		}
				// 		break;
				// 	case 'business':
				// 		if(typeof(fieldConfig.source)=="object"){
				// 			if(fieldConfig.source.suffix){
				// 				fieldConfig.source.url = projectObj.system.prefix.url + fieldConfig.source.suffix;
				// 			}
				// 		}
				// 		if(typeof(fieldConfig.search)=="object"){
				// 			if(fieldConfig.search.suffix){
				// 				fieldConfig.search.url = projectObj.system.prefix.url + fieldConfig.search.suffix;
				// 			}
				// 		}
				// 		if(typeof(fieldConfig.subdataAjax)=="object"){
				// 			if(fieldConfig.subdataAjax.suffix){
				// 				fieldConfig.subdataAjax.url = projectObj.system.prefix.url + fieldConfig.subdataAjax.suffix;
				// 			}
				// 		}
				// 		if(typeof(fieldConfig.getRowData)=="object"){
				// 			if(fieldConfig.getRowData.suffix){
				// 				fieldConfig.getRowData.url = projectObj.system.prefix.url + fieldConfig.getRowData.suffix;
				// 			}
				// 		}
				// 		break;
				// 	case 'photoImage':
				// 	case 'uploadImage':
				// 	case 'upload':
				// 		if(fieldConfig.suffix){
				// 			fieldConfig.url = projectObj.system.prefix.url + fieldConfig.suffix;
				// 		}else{
				// 			fieldConfig.url = projectObj.system.prefix.uploadSrc;
				// 		}
				// 		break;
				// 	case 'data':
				// 		fieldConfig.url = projectObj.system.prefix.dict;
				// 		fieldConfig.method = 'POST';
				// 		fieldConfig.data = {tableName:fieldConfig.urlDictArguments};
				// 		break;
				// 	case 'select2':
				// 	case 'select':
				// 		if(typeof(fieldConfig.subdata)=='undefined'){
				// 			if(typeof(fieldConfig.suffix) == 'undefined'){
				// 				fieldConfig.subdata = [];
				// 				if(debugerMode){
				// 					console.error(fieldConfig.label+'('+fieldConfig.id+')字段：'+'的subdata和suffix都未定义未定义，默认空数组');
				// 					console.error(fieldConfig);
				// 				}
				// 				break;
				// 			}
				// 			fieldConfig.url = projectObj.system.prefix.url + fieldConfig.suffix;
				// 			fieldConfig.method = typeof(fieldConfig.method) == 'string'?fieldConfig.method:'post';
				// 			fieldConfig.dataSrc = typeof(fieldConfig.dataSrc) == 'string'?fieldConfig.dataSrc:'rows';
				// 		}
				// 		break;
				// 	case 'uploadSingle':
				// 		fieldConfig.uploadSrc = projectObj.system.prefix.uploadSrc;
				// 		fieldConfig.method = 'POST';
				// 		break;
				// 	case 'expression':
				// 		var urlType = typeof(fieldConfig.urlType)=='string'?fieldConfig.urlType:'items';
				// 		fieldConfig.listAjax = {
				// 			url: getRootPath() + '/items/getItemList',
				// 			type: 'POST',
				// 			data: {},
				// 			dataSrc: 'rows'
				// 		};
				// 		switch(urlType){
				// 			case 'items':
				// 				fieldConfig.listAjax.url = getRootPath() + '/items/getItemList';
				// 				fieldConfig.listAjaxFields = [
				// 					{ name: 'itemId', idField: true, search: false },
				// 					{ name: 'itemCode', title: '项目代码', search: true },
				// 					{ name: 'itemName', title: '项目名称', search: true },
				// 					{ name: 'itemPyItem', search: true },
				// 					{ name: 'itemWbItem', search: true }
				// 				];
				// 				break;
				// 			case 'pfItems':
				// 				fieldConfig.listAjax.url = getRootPath() + '/pfItems/getPfItemListOfSelect';
				// 				fieldConfig.listAjaxFields = [
				// 					{ name: 'pfItemId', idField: true, search: false },
				// 					{ name: 'pfItemName', title: '项目名称', search: true },
				// 					{ name: 'pfItemPyItem', search: true },
				// 					{ name: 'pfItemWbItem', search: true }
				// 				];
				// 				break;
				// 		}
				// 		fieldConfig.assistBtnWords = ['+', '-', '*', '/', '(', ')', '=', '<>', '>', '<', '>=', '<=', 'and', 'or', '清空'];
				// 		fieldConfig.dataSource = [];
				// 		break;
				// 	case 'input-select':
				// 		if(typeof(fieldConfig.saveAjax)=='object'){
				// 			if(typeof(fieldConfig.saveAjax.suffix)=='string'){
				// 				fieldConfig.saveAjax.url = getRootPath() + fieldConfig.saveAjax.suffix;
				// 			}
				// 		}
				// 		if(typeof(fieldConfig.selectConfig)=='object'){
				// 			if(typeof(fieldConfig.selectConfig.suffix)=='string'){
				// 				fieldConfig.selectConfig.url = getRootPath() + fieldConfig.selectConfig.suffix;
				// 			}
				// 		}
				// 		break
				// }
			}
			// 设置表格的 editConfig 如果没有根据表单配置/默认生成
			for(var columnId in projectObj[businessName].columns){
				var columnConfig = projectObj[businessName].columns[columnId];
				var isSetDef = false; // 是否设置默认表单配置
				if(typeof(columnConfig.editConfig)!="object"){
					isSetDef = true;
					var fieldId = columnConfig.field;
					if($.isArray(projectObj[businessName].field)){
						var fields = projectObj[businessName].field;
						for(var fieldI=0; fieldI<fields.length; fieldI++){
							if(fields[fieldI].id == fieldId){
								isSetDef = false;
								columnConfig.editConfig = $.extend(true, {}, fields[fieldI]);
								delete columnConfig.editConfig.id;
							}
						}
					}
				}
				if(isSetDef){
					var formType = "text";
					switch(columnConfig.variableType){
						case "number":
							formType = 'number';
							break;
						case "date":
							formType = 'date';
							break;
					}
					var defaultFieldConfig = { 
						type:formType, 
						formSource:'table', 
						templateName:'PC',
						variableType: columnConfig.variableType,
					};
					columnConfig.editConfig = defaultFieldConfig;
				}
			}
			// 表格默认值处理
			for(var columnId in projectObj[businessName].columns){
				var columnConfig = projectObj[businessName].columns[columnId];
				// 处理formatHandler的默认值
				if(typeof(columnConfig.columnType)!='undefined'){
					switch(columnConfig.columnType){
						case 'upload':
							columnConfig.formatHandler.data.uploadSrc = projectObj.system.prefix.uploadSrc;
							break;
						case 'href':
							if(columnConfig.formatHandler.data.url && columnConfig.formatHandler.data.url.indexOf('http') == -1){
								columnConfig.formatHandler.data.url = projectObj.system.prefix.url + columnConfig.formatHandler.data.url;
							}
							break;
					}
				}
				if(typeof(columnConfig.editConfig)=="object"){
					setUrlBySuffix(columnConfig.editConfig, columnConfig.editConfig.mindjetType);
				}
			}
			//方法 默认值处理 ajax默认参数
			for(var controllerClassKey in projectObj[businessName].controller){
				for(var controllerKey in projectObj[businessName].controller[controllerClassKey]){
					var controllerObj = projectObj[businessName].controller[controllerClassKey][controllerKey];
					//默认的ajax参数
					for(var ajaxKey in projectObj.default.ajax){
						if(typeof(controllerObj[ajaxKey])=='undefined'){
							controllerObj[ajaxKey] = projectObj.default.ajax[ajaxKey]
						}
					}
				}
			}
			// 设置状态的edit 
			if(typeof(projectObj[businessName].state)!="object"){
				// vo没有状态
				continue;
			}
			for(var stateName in projectObj[businessName].state){
				for(var stateType in projectObj[businessName].state[stateName]){
					var stateFields = projectObj[businessName].state[stateName][stateType];
					for(var fieldId in stateFields){
						// 判断字段中是否有edit
						var fieldEdit = stateFields[fieldId].edit;
						if(typeof(fieldEdit)!="object"){
							continue;
						}
						// 判断edit中是否有form配置 格式化
						if(typeof(fieldEdit.form)=="object"){
							setUrlBySuffix(fieldEdit.form, fieldEdit.form.mindjetType);
						}
						// 判断edit中是否有table配置 格式化editConfig 没有editConfig设置form或默认
						if(typeof(fieldEdit.table)=="object"){
							if(typeof(fieldEdit.table.editConfig)=="object"){
								setUrlBySuffix(fieldEdit.table.editConfig, fieldEdit.table.editConfig.mindjetType);
							}else{
								if(typeof(fieldEdit.form)=="object"){
									fieldEdit.table.editConfig = $.extend(true, {}, fieldEdit.form);
								}else{
									var formType = "text";
									switch(fieldEdit.table.variableType){
										case "number":
											formType = 'number';
											break;
										case "date":
											formType = 'date';
											break;
									}
									var defaultFieldConfig = { 
										type:formType, 
										formSource:'table', 
										templateName:'PC',
										variableType: fieldEdit.table.variableType,
									};
									fieldEdit.table.editConfig = defaultFieldConfig;
								}
							}
						}
					}
				}
			}
		}
	}
}
//初始化方法
function init(_projectObj){
	if(debugerMode){
		if(typeof(_projectObj)!='object'){
			console.error('参数必须是object，当前类型是'+typeof(_projectObj),'error')
			console.error(_projectObj);
			return;
		}
	}
	projectObj = $.extend(true, {}, _projectObj);
	setDefault(projectObj);
	var nsWorkflowVo = {
		controller : {
			list : {
				nsWorkflowViewer : {
					text : '流程监控',
					defaultMode : 'workflowViewer',
				},
				nsWorkflowSubmit : {
					text : '提交',
					defaultMode : 'workflowSubmit',
					workflowType : 'submit',
				},
				nsWorkflowReject : {
					text : '驳回',
					defaultMode : 'workflowSubmit',
					workflowType : 'reject',
				},
				nsWorkflowCancelSign : {
					text : '取消签收',
					defaultMode : 'workflowSubmit',
					workflowType : 'cancelSign',
				},
				nsWorkflowWithdraw : {
					text : '撤回',
					defaultMode : 'workflowSubmit',
					workflowType : 'withdraw',
				},
				nsWorkflowRollback : {
					text : '回退',
					defaultMode : 'workflowSubmit',
					workflowType : 'rollback',
				},
				nsWorkflowRebook : {
					text : '改签',
					defaultMode : 'workflowSubmit',
					workflowType : 'rebook',
				},
				nsWorkflowTrunTo : {
					text : '转办',
					defaultMode : 'workflowSubmit',
					workflowType : 'turnTo',
				},
				nsWorkflowHasten : {
					text : '催办',
					defaultMode : 'workflowSubmit',
					workflowType : 'hasten',
				},
				nsWorkflowEmergency : {
					text : '应急',
					defaultMode : 'workflowSubmit',
					workflowType : 'emergency',
				},
				nsWorkflowComplete : {
					text : '签收',
					defaultMode : 'workflowSubmit',
					workflowType : 'complete',
				},
				nsWorkflowForWard : {
					text : '提交',
					defaultMode : 'workflowSubmit',
					workflowType : 'forWard',
				},
				nsWorkflowSubmitAllBatch : {
					text : '提交所有批次',
					defaultMode : 'workflowSubmit',
					workflowType : 'submitAllBatch',
				},
			}
		}
	}
	projectObj.nsWorkflowVo = nsWorkflowVo;
	$.each(projectObj, function(businessKey,businessValue){
		//根据controller的类型处理基本方法，如果存在controller则根据默认类型进行初始化
		if(businessValue.controller){
			//第一层是controller的分类：new edit query等
			$.each(businessValue.controller, function(classKey,classValue){
				//第二层是具体的controller
				$.each(classValue, function(controllerKey,controllerValue){
					//初始化方法
					initFunction(businessValue, controllerValue);
				});
			})
			
		}
	})
	// $.each(projectObj, function(key,value){
	// 	if(value.field){
	// 		initField(key, value.field);
	// 	}
	// 	if(value.controller){
	// 		if(debugerMode){
	// 			$.each(value.controller,function(keyf,valuef){
	// 				initController(valuef);
	// 			})
	// 		}
	// 		initFunction(value);
	// 	}
	// })
	return projectObj;
}
//ajax通用方法
var ajaxCommon = function (ajaxConfig, handlerObj){
	//ajaxConfig 业务里包含的配置对象
	//handlerObj 有两个，{beforeHandler:f(), afterHandler:f(),value:{}}一个是前置，一个是后置
	//判断handlerObj是否合法
	if(debugerMode){
		if(handlerObj){
			//判断传入参数对象是否合法
			/*$.each(handlerObj, function(key,value){
				if(key!='beforeHandler' && key!='afterHandler' && key!='value'&& key!='successFun' && key!='$btnDom'){
					console.error('回调对象错误:' + key + '，\r\n必须是beforeHandler/afterHandler/value/successFun/$btnDom');
				}
			})*/
			var validArr =
			[
				['beforeHandler', 			'function', 	true], 	//前置回调函数
				['afterHandler', 			'function', 	true], 	//成功回调函数
				['value', 					'object', 		true], 	//操作值
				['successFun', 				'function', 		],	//成功之后的回调函数
				['dialogBeforeHandler', 	'object', 			],	//弹框之前的配置参数
			]
			var isValid = nsDebuger.validOptions(validArr, handlerObj);
			if(isValid === false){return false;}
			//如果需要入参而没有传入则不合法
			if(ajaxConfig.data){
				if(typeof(handlerObj.value)!='object'){
					console.error('调用ajax:'+ajaxConfig.url+' 时未传入必须的参数');
				}
			}
		}
	}
	//克隆配置对象
	var runningConfig = $.extend(true,{},ajaxConfig);

	if(handlerObj.controllerObj){
		//定义了权限码参数
		if(handlerObj.controllerObj.defaultData){
			runningConfig.data = $.extend(true,runningConfig.data,handlerObj.controllerObj.defaultData);
		}
		if(handlerObj.controllerObj.isAjaxDialog){
			runningConfig = handlerObj.controllerObj;
		}
	}
	/*runningConfig.data = handlerObj.value;*/
	runningConfig.successMsg = runningConfig.successMsg ? runningConfig.successMsg : '操作成功';
	//前置回调函数
	if(handlerObj.beforeHandler){
		handlerObj.ajaxConfig = runningConfig;
		handlerObj = handlerObj.beforeHandler(handlerObj);
	}
	var ajaxConfigOptions = handlerObj.ajaxConfigOptions ? handlerObj.ajaxConfigOptions : {};
	ajaxConfigOptions.dialogBeforeConfig = handlerObj.dialogBeforeConfig;
	var listAjax = nsVals.getAjaxConfig(runningConfig,handlerObj.value,ajaxConfigOptions);
	listAjax.plusData = runningConfig;
	//处理权限码加到ajaxheader
	if(typeof(listAjax.data)=='object'){
		if(typeof(listAjax.data.data_auth_code) == 'string'){
			if(typeof(listAjax.header)!='object'){
				listAjax.header = {};
			}
			listAjax.header.data_auth_code = listAjax.data.data_auth_code;
		}
	}

	nsVals.ajax(listAjax,function(res,plusData){
			if(handlerObj.$disabledBtn){
				handlerObj.$disabledBtn.removeAttr('disabled');
			}
			//dialog成功回调
			if(typeof(handlerObj.successFun) == 'function'){
				var enterHandler = typeof(handlerObj.successFun) == 'function'?handlerObj.successFun:{};
				//res.success:ajax成功状态
				//handlerObj.$btnDom:按钮节点
				handlerObj.successFun(res.success,handlerObj.$btnDom);
			}
			if(res.success == false){
				//这里添加错误信息处理
				return false;
			}
			//弹出服务器端返回的msg提示 cy 20180712
			if(res.msg){
				nsalert(res.msg,'success');
			}
			
			//后置回调函数 后置回调函数的返回值暂无处理，但是必须回传 以后补充方法
			if(handlerObj.afterHandler){
				if(runningConfig.dataSrc){
					/**lxh 添加plusData */
					handlerObj.afterHandler(res[runningConfig.dataSrc],plusData.plusData);
				}else{
					handlerObj.afterHandler(res);
				}
				if(plusData.plusData.isCloseWindow){
					nsFrame.popPageClose(); 
				}
			}
		},true
	)
}
//初始化方法
function initFunction(businessObj, controllerObj){
	//businessObj 业务对象
	//controllerObj 方法对象

	//判断是否是非ajax方法，如果是非ajax方法则直接生成function绑定事件
	var noAjaxModeName = ['excelImport'];
	// var isAjaxFunction = true;
	if(noAjaxModeName.indexOf(controllerObj.defaultMode) > -1){
		// isAjaxFunction = false;
		var noAjaxConfig = $.extend(true, {}, controllerObj);
		controllerObj.func = {
			config:noAjaxConfig,
			function:function(){
				/*console.log(controllerObj);
				console.log(noAjaxConfig);*/
				excelImport.init(noAjaxConfig.templateId);
			},
		}
		return;
	}
	//验证
	if(debugerMode){
		if(typeof(controllerObj.suffix)!='string'){
			// console.error('controller:'+controllerObj.suffix+'未定义接口方法');
		}
		var optionsArr = [
			['suffix','string',false],  		//controller地址 必填
			['afterHandler','function'], 		//前置处理函数
			['beforeHandler','function'], 		//后置处理函数
			['data','object'], 					//发送数据定义
			['type','string'], 					//ajax类型，GET POST
			['dataSrc','string'],				//返回值字段名
			['dataType','string'],				//发送数据类型
		];
			nsDebuger.validOptions(optionsArr,controllerObj);
		}
	//参数
	var ajaxConfig = $.extend(true, {}, controllerObj);
	//参数---url
	if(typeof(controllerObj.suffix)=='string'){
		ajaxConfig.url = projectObj.system.prefix.url + controllerObj.suffix;
	}
	// 判断是否存在callbackUrl 如果有转化成完整的地址 lyw
	if(typeof(ajaxConfig.callbackUrl)=='string'){
		ajaxConfig.callbackUrl = projectObj.system.prefix.url + controllerObj.callbackUrl;
	}
	if(controllerObj.getSuffix){
		//弹框之前调用ajax请求链接
		ajaxConfig.getUrl = projectObj.system.prefix.url + controllerObj.getSuffix;
	}

	delete controllerObj.suffix;

	//通用基本方法
	var ajaxFunc = function(handlerObj){
		if(typeof(handlerObj)=='undefined'){
			handlerObj = {};
		}
		//ajaxCommon(this.config, handlerObj);
		/********sjj20180601 前置处理值*******************/
		/********sjj20180601 前置处理值********************/
		var ajaxHandler = {
			beforeHandler:			typeof(handlerObj.beforeHandler)=='function' ? handlerObj.beforeHandler : handlerObj.ajaxBeforeHandler,
			afterHandler:			typeof(handlerObj.afterHandler)=='function' ? handlerObj.afterHandler : handlerObj.ajaxAfterHandler,
			value:					handlerObj.value ? handlerObj.value : {},
			successFun:				handlerObj.successFun,
			dialogBeforeConfig:		typeof(handlerObj.dialogBeforeHandler)=='object' ? handlerObj.dialogBeforeHandler : {},
			controllerObj:			handlerObj.controllerObj,
			$disabledBtn:handlerObj.$disabledBtn,
		}
		/***************sjj 20190410 针对按钮文本的转换根据数据值调用对应的ajax start************************************************* */
		function setAjaxConfig(valueData){
			if(ajaxConfig.text.indexOf('{')>-1){
				var formatConfig = JSON.parse(ajaxConfig.text);
				switch(formatConfig.formatHandler.type){
						case 'changeBtn':
							$.each(formatConfig.formatHandler.data,function(value,keyConfig){
								if (value == valueData[formatConfig.field]){
										if(keyConfig.ajax){
											nsVals.extendJSON(ajaxConfig,keyConfig.ajax);
										}
								}
						});
							break;
				}
			}
		}
		if(!$.isEmptyObject(ajaxHandler.value)){
			setAjaxConfig(ajaxHandler.value);
		}else{
			if(ajaxHandler.dialogBeforeConfig.selectData){
				setAjaxConfig(ajaxHandler.dialogBeforeConfig.selectData);
			}
		}
		/***************sjj 20190410 针对按钮文本的转换根据数据值调用对应的ajax start************************************************* */
		ajaxCommon(ajaxConfig,ajaxHandler);
	};
	//生成基本方法对象
	controllerObj.func = {
		config:ajaxConfig,
		function:ajaxFunc,
	};
//--------------------------------------------------wxk公共弹窗------------------------------------------------------------		
   	
    if(typeof(controllerObj.defaultMode)=='string'){
    	var defaultModeName = controllerObj.defaultMode;
    	//显示字段
    	var functionField = controllerObj.functionField;
    	//rowData取值方式
    	controllerObj.sourceMode = 'selectedRow';
    	if(defaultModeName.indexOf('tablebtn')>-1){
    	controllerObj.sourceMode = 'tablebtn';
    	}
    	//defaultMode类型
    	var dataUserModeKey = [
    		'dialog','valueDialog','confirm','toPage','loadPage','changePage','ajaxDialog','component','print','custom','templatePrint','workflowViewer','workflowSubmit','newtab','tel','email'
    	];
    	var defaultModeArray=defaultModeName.split(',');
    	for(var mi = 0;mi<defaultModeArray.length;mi++){
    		if(dataUserModeKey.indexOf(defaultModeArray[mi]) >-1){
    			//defaultMode指定类型
    			controllerObj.userMode = defaultModeArray[mi];
    		}
    	}
    	//根据是否包含tablebtn获取方法数据
    	// controllerObj.getFunctionData = function(controllerObj,config){
    	// 	//判断defaultMode中是否包含tablebtn
	    // 	var rowData = null;
	    // 	switch(controllerObj.sourceMode){
	    // 		case "selectedRow":  //(这里为什么表格上部按钮为tableID;表格行按钮为tableId)
	    // 			var tableConfig=baseDataTable.data[config.tableID];
			  //   	//表格是否开启多选
			  //   	var isMulitSelect = tableConfig.dataConfig.isMulitSelect;
			  //   	var isids=controllerObj.dataFormat == 'ids'?true:false;
	    // 			//if(isMulitSelect && isids){     //?
	    // 			if(isMulitSelect){
	    // 				//多选
	    // 				rowData = baseDataTable.getTableSelectData(config.tableID);     
	    // 			}else{
	    // 				//单选
	    // 				rowData = baseDataTable.getSingleRowSelectedData(config.tableID);
	    // 			}
	    // 			break;
	    // 		case "tablebtn":
	    // 			rowData = config.rowData;
	    // 			break;
	    // 	}
	    // 	return rowData;
		 // }
    	switch(controllerObj.userMode){
			case 'dialog':
				controllerObj.func.dialog = function(callBack,Obj){
					var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
					}
					var configJson = $.extend(true,{},Obj);
					//configJson.dialogForm = getDialogForm(businessObj.fields,functionField);
					configJson.controllerObj = functionConfigObj;
					dialogCommon(callBack,configJson);
				}
				break;
			//修改弹窗
			case 'valueDialog':
				controllerObj.func.valueDialog = function(callBack,Obj){	
					var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
					}							//id:?
					var configJson = $.extend(true,{},Obj);
					//获取表格行数据
					//configJson.rowObj = controllerObj.getFunctionData(controllerObj,configJson);
					configJson.controllerObj = functionConfigObj;
					dialogCommon(callBack,configJson);
					/*if(configJson.rowData){
						dialogCommon(callBack,configJson);
					}*/
				}
				break;
			//ajax弹框
			case 'ajaxDialog':
				controllerObj.func.ajaxDialog = function(callBack,Obj){	
					var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
					}						
					var configJson = $.extend(true,{},Obj);
					configJson.controllerObj = functionConfigObj;
					ajaxDialogCommon(callBack,configJson);
				}
				break;
			//确认弹窗
			case 'confirm':
				controllerObj.func.confirm = function(callBack,Obj){
					var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
					}	
					//var configJson = $.extend(true,{},Obj);
					//configJson.controllerObj = functionConfigObj;
					callBack.controllerObj = functionConfigObj;
    				confirmCommon(callBack,Obj);
				}
				break;
			case 'custom':
				//sjj20181030 自定义按钮
				var urlStr = '{{NETSATRGETROOTPATH}}';
				if(controllerObj.text && controllerObj.text.indexOf(urlStr) > -1){
					controllerObj.text = controllerObj.text.replace(urlStr, projectObj.system.prefix.url);
				}
						
				controllerObj.func.custom = function(callBack,Obj){
					var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
					}	
					//var configJson = $.extend(true,{},Obj);
					//configJson.controllerObj = functionConfigObj;
					callBack.controllerObj = functionConfigObj;
    			customCommon(callBack,Obj);
				}
				break;
    		case 'toPage':
    			//跳转界面sjj20180517 btn tablerowbtn
    			controllerObj.func.toPage = function(callback,Obj){
    				$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
    				var functionConfigObj = controllerObj;
    				if(typeof(callback.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
					}
    				var configJson = $.extend(true,{},Obj);
    				configJson.controllerObj = functionConfigObj;
    				toPageCommon(callback,configJson);
    			}
    			break;
    		case 'newtab':
    			//sjj 20190227 添加支持打开新标签页方法
    			controllerObj.func.newtab = function(callback,Obj){
    				$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
    				var functionConfigObj = controllerObj;
    				if(typeof(callback.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
					}
    				var configJson = $.extend(true,{},Obj);
    				configJson.controllerObj = functionConfigObj;
    				newTabCommon(callback,configJson);
    			}
    			break;
    		case 'loadPage':
    			//在当前窗口打开新界面
    			controllerObj.func.loadPage = function(callback,Obj){
    				$('[type="button"]').blur();
    				var functionConfigObj = controllerObj;
    				if(typeof(callback.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
					}
    				//var configJson = $.extend(true,{},Obj);
					//	configJson.controllerObj = functionConfigObj;
						callback.controllerObj = functionConfigObj;
    				loadPageCommon(callback,Obj);
    			}
    			break;
    		case 'changePage':
    			//跳转界面sjj20180606 btn tablerowbtn
    			controllerObj.func.changePage = function(callback,obj){
    				var functionConfigObj = controllerObj;
    				if(typeof(callback.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callback.getFuncConfigHandler(obj);
					}
    				var configJson = $.extend(true,{},obj);
    				configJson.controllerObj = functionConfigObj;
    				changePageCommon(callback,configJson);
    			}
    			break;
    		case 'component':
    			//自定义组件sjj20180802 
    			controllerObj.func.component = function(callBack,obj){
    				var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
					}
    				var configJson = $.extend(true,{},obj);
    				configJson.controllerObj = functionConfigObj;
    				changeComponentCommon(callBack,configJson);
    			}
    			break;
    		case 'print':
    			//自定义组件sjj 20180928
    			controllerObj.func.print = function(callBack,obj){
    				var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
					}
    				var configJson = $.extend(true,{},obj);
    				configJson.controllerObj = functionConfigObj;
    				printCommon(callBack,configJson);
    			}
				 break;	
			case 'templatePrint':
				 //模板打印 lxh 20181116
    			controllerObj.func.templatePrint = function(callBack,obj){
    				var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
					}
    				var configJson = $.extend(true,{},obj);
					 configJson.controllerObj = functionConfigObj;
    				templatePrint(callBack,configJson);
    			}
    			break;
			case 'workflowViewer':
				 //工作流 流程监控
    			controllerObj.func.workflowViewer = function(callBack,obj){
    				var configJson = $.extend(true,{},obj);
    				workflowViewer(callBack,configJson);
    			}
    			break;
			case 'workflowSubmit':
				 //工作流
    			controllerObj.func.workflowSubmit = function(callBack,obj){
    				var functionConfigObj = controllerObj;
    				var configJson = $.extend(true,{},obj);
					 configJson.controllerObj = functionConfigObj;
    				workflowSubmit(callBack,configJson);
    			}
					break;
				case 'tel':
				case 'email':
					break;
    	}
	 }
	//发送websocket
	function wsConnect(callBack,configJson,dataType){
		//dataType array 或者 object
		var $btn = $(configJson[0]);
		$btn.controllerObj = {};
		var handlerObj = {};
		handlerObj = callBack.ajaxBeforeHandler(handlerObj);
		var funcConfig = callBack.getFuncConfigHandler($btn);
		var fullFormId = handlerObj.config.fullFormId;
		var fullTableId = handlerObj.config.fullTableId;
		var webSocketUrl = funcConfig.webSocketUrl || "";
		//如果没有链接
		if(typeof funcConfig.ws == 'undefined' || funcConfig.ws.readyState !== 1){
			funcConfig.ws = nschat.websocket.wsConnect(function name() {  },function (res) {
				//这里接收返回数据
				/**
				 * res = [{ business:[{},{}],msg:"",..... }]
				 */
				res = res[0];
				if(res.success == 'true'){
					var callbackAjax = res.callbackAjax;
					if(typeof callbackAjax != 'undefined' && $.trim(callbackAjax).length > 0){
						var ajaxConfig = {
							url:callbackAjax,
							type:funcConfig.type,
							data:res,
							dataSrc:'data'
						};
						var ajax = nsVals.getAjaxConfig(ajaxConfig);
						nsVals.ajax(ajax,function(res){
							if(res.success){
								switch(dataType){
									case 'array':
										//修改table
										var dataSource = baseDataTable.originalConfig[fullTableId].dataConfig.dataSource;
										var $dataTable = $('#' + fullTableId);
										$.each(res[ajaxConfig.dataSrc].business,function(index,item){
											$.each(dataSource,function(idx,itm){
												if(itm.regReportId == item.regReportId){
													dataSource[idx] = item;
													/* var $tr = $dataTable.find('tr').eq(idx);
													$dataTable.row($tr).data(item).draw(false); */
												}
											});
										});
										baseDataTable.refreshByID(fullTableId);
										break;
									case 'object':
										nsForm.fillValues(res[ajaxConfig.dataSrc],fullFormId);
										console.log('修改form');
										break;
								}

							}
						});
					}
				}else{
					return nsalert(res.msg,'error');
				}
			},webSocketUrl,function(event){
				nsalert("连接出错", 'error');
				nsUI.confirm.show({
					title:'打印出错',
					content:'<div class="print-alert"><h4><i class=""></i><span>设备连接错误，不能打印</span></h4><p>请点击确认下载安装最新版网星通</p></div>',
					width:500,
					state:'error',
					handler:function (state) {
						if(state){
							var a = document.createElement('a');
							a.href = getRootPath() + '/新建文本文档.exe';
							a.download = '网星通';
							a.click();
						}else{
							console.log('点击取消');
						}
					}
				});
			});
		}
	}
	//模板打印
	function templatePrint(callBack,configJson){
		/**
		 * type 
		 * print  	打印
		 * preview 	预览
		 * printAjax 	打印有回调
		 * previewAjax	打印预览有回调
		 */
		var $btn = $(configJson[0]);
		$btn.controllerObj = {};
		//拿到当前模板的配置
		var handlerObj = {};
		handlerObj = callBack.ajaxBeforeHandler(handlerObj);
		var pageConfig = callBack.dialogBeforeHandler($btn);//拿到当前模板选择的数据
		var funcConfig = callBack.getFuncConfigHandler($btn);//拿到当前按钮的配置
		var templateId = $btn.attr('templateId');//拿到要打印的模板的id
		//如果按钮上有templateId的话往下执行
		if(!pageConfig.value){return nsalert('请选择一行','error');}
		if(typeof templateId != 'undefined'){
			//公共数据
			var callbackAjax = funcConfig.callbackAjax ? getRootPath() + funcConfig.callbackAjax : "";
			var listName = funcConfig.listName || "";
			//判断打印表格还是表单，表格是数组，表单是对象
			switch($.type(pageConfig.value)){
				case 'array':
						wsConnect(callBack,configJson,'array');
						//如果有规定需要传的字段字段
						var sendMsg = [];
						if(typeof funcConfig.requiredFields != 'undefined'){
							var requiredFields = funcConfig.requiredFields.split(',');
							$.each(pageConfig.value,function(index,item){
								var requiredObj = {};
								$.each(requiredFields,function(idx,itm){
									requiredObj[itm] = item[itm];
									requiredObj.templateId = templateId;
								});
								sendMsg.push(requiredObj);
							});
						}else{
							//没有规定要传的特定字段则发送选中的全部数据
							sendMsg = pageConfig.value;
						}
						//发送数据
						switch (funcConfig.btnType) {
							case 'print':
							nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
								break;
							case 'preview':
							nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
								break;
							case 'printAjax':
							nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
								break;
							case 'previewAjax':
							nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
								break;
							default:
								break;
						}
					break;
				case 'object':
						wsConnect(callBack,configJson,'object');
						//如果有规定需要传的字段字段
						var sendMsg = {};
						if(typeof funcConfig.requiredFields != 'undefined'){
							var requiredFields = funcConfig.requiredFields.split(',');
							for (var key in requiredFields) {
								if (requiredFields.hasOwnProperty(key)) {
									var element = requiredFields[key];
									if($.inArray(key,requiredFields)){
										sendMsg[key] = element;
									}
								}
							}
						}else{
							//没有规定要传的特定字段则发送选中的全部数据
							sendMsg = pageConfig.value;
						}
						//发送数据
						switch (funcConfig.btnType) {
							case 'print':
							nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
								break;
							case 'preview':
							nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
								break;
							case 'printAjax':
							nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
								break;
							case 'previewAjax':
							nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
								break;
							default:
								break;
						}
					break;
			}
		}else{
			return nsalert('该模板没有id，请检查配置','error');
		}
	 }
    //获取弹窗显示字段
    function getDialogForm(businessObj,functionField){
    	if(debugerMode){
			var parametersArr = [
			[businessObj,'object',true],
			[functionField,'object',true],
			]
			var isVaild = nsDebuger.validParameter(parametersArr);
			if(isVaild == false){
				return;
			}
			if(typeof(businessObj.fields)!='object'){
				console.error('无法在指定业务对象中找到字段属性');
				console.error(businessObj)
				return;
			}
		}
		var dialogForm = [];
		for(ffi in functionField){
			if(typeof(businessObj.fields[ffi]) == 'object'){
				// lyw 读取字典
				switch(businessObj.fields[ffi].mindjetType){
					case 'dict':
						if(typeof(nsVals.dictData[businessObj.fields[ffi].dictArguments])=='undefined'){
							console.error('无法找到字典数据:'+businessObj.fields[ffi].dictArguments)
						}else{
							businessObj.fields[ffi].subdata = nsVals.dictData[businessObj.fields[ffi].dictArguments].subdata;
						}
						break;
				}
				var dialogFormField = $.extend(true,{},businessObj.fields[ffi]);
				dialogFormField.mindjetIndex = functionField[ffi].mindjetIndex;
				dialogForm.push(dialogFormField);
			}
		}
		dialogForm.sort(function(a,b){
			return a.mindjetIndex - b.mindjetIndex;
		})
		return dialogForm;
    }
    //确认弹窗
    function confirmCommon(callback,obj){
		/*
		 * normal  	则只附加参数
		 * object 	则用对象名称包裹，返回标准对象格式
		 * id 		只使用id作为参数
		 * ids 		返回ids格式，用于批量操作
		 */
		callback.obj = obj;
		var confirmdata;
		var controllerObj = callback.controllerObj;
		//dialog的前置回调
		if(typeof(callback.dialogBeforeHandler)=='function'){
			//加验证
			confirmdata = callback.dialogBeforeHandler(callback);
		}
		if(confirmdata.value === false){
			var infoMsgStr = controllerObj.noSelectInfoMsg ? controllerObj.noSelectInfoMsg:'请选择要处理的数据';
			nsalert(infoMsgStr,'error');
			console.error(infoMsgStr);
			return false;
		}
		var $disabledBtn = $(obj);
		$disabledBtn.attr('disabled',true);
		//确认弹窗提示信息
		var ajaxObj = {
			//value:confirmdata.value,
			dialogBeforeHandler:{
				btnOptionsConfig:confirmdata.btnOptionsConfig,
				selectData:confirmdata.value,
				containerFormJson:confirmdata.containerFormJson
			},
			controllerObj:controllerObj.func.config,
			$disabledBtn:$disabledBtn
		}
		/***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
		if(typeof(callback.ajaxBeforeHandler)=='function'){
			ajaxObj.beforeHandler = function(data){
				return callback.ajaxBeforeHandler(data);
			};
		}
		if(typeof(callback.ajaxAfterHandler)=='function'){
			/**lxh 添加plusData */
			ajaxObj.afterHandler = function(data,plusData){
				return callback.ajaxAfterHandler(data,plusData);
			};
		}
		nsconfirm(controllerObj.title,function(isDelete){
			if(isDelete){
				controllerObj.func.function(ajaxObj);
			}
		},'warning')
    }

    //sjj20181030 自定义按钮
    function customCommon(callback,obj){
    	/*
		 * normal  	则只附加参数
		 * object 	则用对象名称包裹，返回标准对象格式
		 * id 		只使用id作为参数
		 * ids 		返回ids格式，用于批量操作
		 */
		callback.obj = obj;
		var confirmdata;
		var controllerObj = callback.controllerObj;
		//dialog的前置回调
		if(typeof(callback.dialogBeforeHandler)=='function'){
			//加验证
			confirmdata = callback.dialogBeforeHandler(callback);
		}
		if(confirmdata.value === false){
			var infoMsgStr = controllerObj.noSelectInfoMsg ? controllerObj.noSelectInfoMsg:'请选择要处理的数据';
			nsalert(infoMsgStr,'error');
			console.error(infoMsgStr);
			return false;
		}
		var $disabledBtn = $(obj);
		$disabledBtn.attr('disabled',true);
		//确认弹窗提示信息
		var ajaxObj = {
			//value:confirmdata.value,
			dialogBeforeHandler:{
				btnOptionsConfig:confirmdata.btnOptionsConfig,
				selectData:confirmdata.value,
				containerFormJson:confirmdata.containerFormJson
			},
			controllerObj:controllerObj.func.config,
			$disabledBtn:$disabledBtn
		}
		/***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
		if(typeof(callback.ajaxBeforeHandler)=='function'){
			ajaxObj.beforeHandler = function(data){
				return callback.ajaxBeforeHandler(data);
			};
		}
		if(typeof(callback.ajaxAfterHandler)=='function'){
			ajaxObj.afterHandler = function(data){
				return callback.ajaxAfterHandler(data);
			};
		}
		controllerObj.func.function(ajaxObj);
    }

    //公用弹框内容调用
    function dialogContent(callback,obj){
		var fieldValue = typeof(obj.value)=='object' ? obj.value : {};
		var controllerObj = obj.controllerObj;
		var functionField = obj.controllerObj.functionField;
		var dialogField = [];
		//如果指定functionField的情况下显示functionField下字段
		if(typeof(functionField)=='object'){
			dialogField = getDialogForm(businessObj,functionField);
		}else{ 
			if(typeof(functionField)=='string'&&functionField.indexOf('nsProject.getFieldsByState')==0){
				// 通过状态获取字段
				dialogField = eval(functionField);
			}else{
				//否则显示全部字段
				dialogField = getDialogForm(businessObj,fieldValue);
			}
		}
		//调整表单form中的下拉框data参数 
		function getSelectData(fieldArr,fieldValue){
			var newFieldArr = fieldArr;
			if($.isEmptyObject(fieldValue)){
				if(!$.isEmptyObject(obj.currentData)){
					fieldValue = obj.currentData;
				}
			}
			for(var fieldI = 0; fieldI<fieldArr.length; fieldI++){
				//是否是ajax请求 需要转data参数
				if(fieldArr[fieldI].url){
					//存在url链接
					function getSelectAjaxData(_params){
						if(controllerObj.func.config.defaultData.data_auth_code){
							//存在权限码参数
							_params.data_auth_code = controllerObj.func.config.defaultData.data_auth_code;
						}
						var data = $.extend(true,{},_params);
						if(fieldArr[fieldI].dataFormat == 'ids'){
							if($.isArray(fieldValue)){
								var ids = [];
								for(var dataI=0; dataI<fieldValue.length; dataI++){
									ids.push(fieldValue[dataI][obj.options.idField]);
								}
								ids = ids.join(',');
								data.ids = ids;
							}else{
								data.ids = fieldValue[obj.options.idField];
							}
						}else{
							for(var param in data){
								if(typeof(data[param])=='string'&&
									(data[param].indexOf('this.')>-1||data[param].indexOf('page.')>-1||data[param].indexOf('search')>-1)
								){

								}else{
									data[param] = nsVals.getTextByFieldFlag(data[param],fieldValue);
								}
								if(data[param] === 'undefined'){data[param] = '';}
							}
						}
						return data;
					}
					fieldArr[fieldI].data = typeof(fieldArr[fieldI].data)=='object' ? fieldArr[fieldI].data : {};
					fieldArr[fieldI].data = getSelectAjaxData(fieldArr[fieldI].data);
				}
			}
			return newFieldArr;
		}
		dialogField = getSelectData(dialogField,fieldValue);
		if(fieldValue && dialogField){
			//如果存在form并且存在默认值的情况
			for(var formI = 0; formI<dialogField.length;formI++){
				dialogField[formI].value = fieldValue[dialogField[formI].id];
			}
		}
		/****sjj 20180531 添加支持事件回调 start***/
		/*changeHandlerData
			*readonly:{id:false,name:false}
			*disabled:{id:false,name:true}
			*value:{id:'3333',name:"ddd"}
			*hidden:{id:true,name:true}
		*/

		var dialogJson = {
			id:'dialogCommon',//typeof(obj.config.dialogId) == 'undefined'?'dialogCommon':obj.config.dialogId,
			title: typeof(controllerObj.title) =='string'?controllerObj.title:'表单维护',
			size:'m',
			form:dialogField,
			isEnterHandler:true,//控制是否绑定回车事件
			btns:[{
				text:typeof(controllerObj.btnText) =='string'?controllerObj.btnText:'确认',
				isReturn:true,
				handler:function($btnDom,callbackFun){
					//$btnDom:按钮节点
					//callbackFun:ajax方法回调
					var jsonData = nsTemplate.getChargeDataByForm('dialogCommon');
					if(jsonData){
						var handlerJson = {};

						handlerJson.value = jsonData;//formJsonFormat(jsonData,dialogForm);
						handlerJson.controllerObj = controllerObj.func.config;
						//by cy 20180508
						//function和ajax的前后置回调
						if(typeof(callback.ajaxBeforeHandler)=='function'){
							handlerJson.beforeHandler = function(data){
								return callback.ajaxBeforeHandler(data);
							};
						}
						if(typeof(callback.ajaxAfterHandler)=='function'){
							handlerJson.afterHandler = function(data){
								//判断返回值 只有success为true才可以关闭弹框
								if(typeof(data)=='undefined'){
									nsalert('返回值不能为undefined');
								}
								nsdialog.hide();
								return callback.ajaxAfterHandler(data);
								/*if(data.success){
									
								}else{
									//返回失败
									if(data.msg){
										//存在错误返回信息
									}
								}*/
							};
						}
						if(typeof(callbackFun) == 'function'){
							handlerJson.successFun = callbackFun;
							handlerJson.$btnDom=$btnDom;
						}

						/***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
						handlerJson.dialogBeforeHandler = {
							btnOptionsConfig:obj.btnOptionsConfig,
							selectData:obj.value,
							containerFormJson:obj.containerFormJson
						}
						controllerObj.func.function(handlerJson);
					}
				}
			}]
		}
		nsdialog.initShow(dialogJson);
    }
    
	//dialog和valueDialog公用弹窗
	function dialogCommon(callback,obj){
		//obj.value
		/* 	callback:object 回调函数对象 {ajaxBeforeHandler:funtion(){return}}
		 * 		{
		 *			dialogBeforeHandler:funtion(dialogFormJson){return dialogFormJson;}  	//弹出框弹出之前调用的回调参数 传递参数是弹框的配置参数
		 * 			ajaxBeforeHandler:funtion(ajaxConfig){return ajaxConfig;} 				//ajax调用前的回调参数，传递参数是ajax的所有参数
		 * 			ajaxAfterHandler:funtion(res){return res} 								//ajax调用后的回调参数，传递参数是服务器返回结果
		 * 		}
			obj:object 注：此参数在任何情况下不允许传入 已经在框架初始化时赋值完成
		 */
		//by cy 20180508
		//dialog的前置回调
		if(typeof(callback.dialogBeforeHandler)=='function'){
			//加验证
			obj = callback.dialogBeforeHandler(obj);
		}
		var controllerObj=obj.controllerObj;
		if(controllerObj.userMode === 'valueDialog'){
			//如果当前弹框是valueDialog判断是否有返回值如果返回值为false，则提示必须有需要操作的值
			if(obj.value === false){
				var infoMsgStr = controllerObj.noSelectInfoMsg ? controllerObj.noSelectInfoMsg:'请选择要处理的数据';
				nsalert(infoMsgStr,'error');
				return false;
			}
		}
		dialogContent(callback,obj);
	}
	
    //ajax弹框
    function ajaxDialogCommon(callback,obj){
    	//dialog的前置回调
		if(typeof(callback.dialogBeforeHandler)=='function'){
			//加验证
			obj = callback.dialogBeforeHandler(obj);
		}
		var controllerObj = obj.controllerObj;
		var getListAjax = {
			url:controllerObj.func.config.getUrl,
			dataSrc:controllerObj.func.config.getDataSrc,
			type:controllerObj.func.config.getType,
			dataFormat:controllerObj.func.config.getDataFormat,
			data:controllerObj.func.config.getData,
			isAjaxDialog:true,//调用弹框调用ajax
		}
		getListAjax.data = $.extend(true,getListAjax.data,controllerObj.func.config.defaultData);
		var handlerJson = {
			controllerObj:getListAjax,
			value:obj.value,
			beforeHandler:callback.ajaxBeforeHandler,
			afterHandler:function(data){
				obj.value = data;
				dialogContent(callback,obj);
			}
		}
		controllerObj.func.function(handlerJson);
		}
		
		function getPageConfig(backCount){
			var keys = Object.keys(nsFrame.containerPageData);
			if(keys.length > backCount){
				//根据时间戳倒序排序
				keys.sort(function(a,b){
					return nsFrame.containerPageData[b].timeStamp - nsFrame.containerPageData[a].timeStamp;
				});
				return nsFrame.containerPageData[keys[backCount]];
			}
			return null;
		}
    function loadPageCommon(callback,obj){
    	var url = callback.controllerObj.func.config.url;
		var paramObj = $.extend(true,{},callback.controllerObj.func.config.defaultData);
		//	var callback = callback.ajaxBeforeHandler(callback);
		var configObj = callback.dialogBeforeHandler(callback);
		var historyPageConfig = getPageConfig(0);
		var callBackUrl = window.location.href;
		if(historyPageConfig){
			 callBackUrl = historyPageConfig.url;
		}
		var pageSourceParam = configObj.value ? configObj.value : {};
		if(callback.controllerObj.func.config.parameterFormat){
			var parameterFormat = JSON.parse(callback.controllerObj.func.config.parameterFormat);
			if(!$.isEmptyObject(pageSourceParam)){
				var chargeData = nsVals.getVariableJSON(parameterFormat,pageSourceParam);
				if(chargeData.editortype){
					delete chargeData.editortype;
				}
				nsVals.extendJSON(pageSourceParam,chargeData);
			}
		}
		var jsonData = {
			data:pageSourceParam,//接受到的参数
			url:callBackUrl,//回传的url
		}
		if(url){
			//var pageParam = JSON.stringify(jsonData);
			//pageParam = encodeURIComponent(encodeURIComponent(pageParam));
			var tempValueName = configObj.config.package + new Date().getTime();
			if(typeof(NetstarTempValues)=='undefined'){NetstarTempValues = {};}
			NetstarTempValues[tempValueName] = jsonData;
		//	var url = url+'?templateparam='+pageParam;;
			url = url+'?templateparam=' + encodeURIComponent(tempValueName);
			if(nsVals.browser.browserSystem == 'mobile'){
				nsFrame.loadPageVRouter(url);
				/*var urlStr = url.substring(getRootPath().length,url.length);
				var pushUrl = getRootPath()+'/mobilehome#'+urlStr;
				window.history.pushState('forward',null,pushUrl);
				nsFrame.cacheUrlVRouter.counter ++;
				nsFrame.cacheUrlVRouter.urlObject[nsFrame.cacheUrlVRouter.counter] = url;*/
			}else{
				nsFrame.loadPage(url);
			}
		}else{
			console.warn(obj.controllerObj.func);
			nsalert('不存在url，无法跳转');
		}
    }

    //添加支持打开新标签页的方法
    function newTabCommon(callBack,obj){
    	var url = obj.controllerObj.func.config.suffix;
    	obj = callBack.dialogBeforeHandler(obj);
    	var value = obj.value;
    	if(typeof(value.parentSourceParam)=='object'){
    		value.parentSourceParam.isEditMode = obj.controllerObj.isEditMode;
    	}
    	if(!$.isEmptyObject(value)){
    		value = JSON.stringify(value);
    		var urlStr =  encodeURIComponent(encodeURIComponent(value));
			url = url+'?templateparam='+urlStr;
    	} 
    	//var isAlwaysNewTab = typeObj(obj.controllerObj.func.config.isAlwaysNewTab)=='boolean' ? obj.controllerObj.func.config.isAlwaysNewTab : false;
    	NetstarUI.labelpageVm.loadPage(url,obj.controllerObj.title);
    }

	//topage弹出界面 sjj20180518
	function toPageCommon(callback,obj){
		var url = obj.controllerObj.func.config.url;
		var paramObj = $.extend(true,{},obj.controllerObj.func.config.defaultData);
		var callback = callback.ajaxBeforeHandler(callback);
		obj = callback.dialogBeforeHandler(obj);
		var configObj = callback.config;
		var value = obj.value;
		if(value){
			var templateObj = eval(configObj.package);
			templateObj.pageParams = value;
			templateObj.descritute = obj.btnOptionsConfig.descritute;
			paramObj.package = configObj.package;
		}
		/*if(obj.rowData){
			var rowData = $.extend(true,{},obj.rowData);
			var templateObj = eval(configObj.package);
			templateObj.pageParams = rowData;
			console.log(templateObj)
			paramObj.template = configObj.package;
			//paramObj = $.extend(true,paramObj,rowData);
		}*/
		if(!$.isEmptyObject(paramObj)){
			paramObj = JSON.stringify(paramObj);
			var urlStr =  encodeURIComponent(encodeURIComponent(paramObj));
			url = url+'?templateparam='+urlStr;
		}
		//nsFrame.popPage(url);
		var config = {
			url:url,
			loadedHandler:function(){
				return callback.loadPageHandler(obj);
			},
			closeHandler:function(){
				return callback.closePageHandler(obj);
			}
		}
		if(obj.controllerObj.width){
			config.width = obj.controllerObj.width;
		}
		if(obj.controllerObj.height){
			config.height = obj.controllerObj.height;
		}
		if(obj.controllerObj.title){
			config.title = obj.controllerObj.title;
		}
		nsFrame.popPageConfig(config);
		//跳转链接
	}
	//changePage 跳转界面 sjj20180606
	function changePageCommon(callback,obj){
		var url = obj.controllerObj.func.config.url;
		var paramObj = obj.controllerObj.func.config.defaultData;
		var callback = callback.ajaxBeforeHandler(callback);
		obj = callback.dialogBeforeHandler(obj);
		var configObj = callback.config;
		var value = obj.value;
		if(value){
			var templateObj = eval(configObj.package);
			templateObj.pageParams = value;
			paramObj.package = configObj.package;
		}
		/*if(obj.rowData){
			var rowData = $.extend(true,{},obj.rowData);
			var templateObj = eval(configObj.package);
			templateObj.pageParams = rowData;
			//paramObj = $.extend(true,paramObj,rowData);
		}*/
		if(!$.isEmptyObject(paramObj)){
			paramObj = JSON.stringify(paramObj);
			var urlStr =  encodeURIComponent(encodeURIComponent(paramObj));
			url = url+'?templateparam='+urlStr;
		}
		window.location.href = url;
	}
	//自定义组件调用
	function changeComponentCommon(callBack,obj){
		var controllerObj = obj.controllerObj;
		var funcObj = eval(controllerObj.componentName);
		function componentCompleteHandler(data){
			var value = {ids:data.value.join(',')};
			var completeAjax = controllerObj.func.config;
			completeAjax.data = $.extend(true,completeAjax.data,controllerObj.func.config.defaultData);
			var handlerJson = {
				controllerObj:completeAjax,
				value:value,
				beforeHandler:callBack.ajaxBeforeHandler,
				afterHandler:function(data){
					callBack.ajaxAfterHandler(data);
				}
			}
			controllerObj.func.function(handlerJson);
		}
		var pageConfig = {
			callback:callBack,
			obj:obj
		};
		funcObj.init({},componentCompleteHandler,pageConfig);
	}
	//打印  sjj 20180928
	function printCommon(callBack,obj){
		nschat.websocket.wsConnect(function(){
			obj = callback.dialogBeforeHandler(obj);
			var idField = obj.btnOptionsConfig.descritute.idField;
			var id = obj.value[idField];
			var jsonData = {
				id:'1279797681833092073',
				command:'报表打印'
			}
			if(obj.controllerObj.data){
				if(obj.controllerObj.data.id){
					var match = /\{([^:]*?)\}/g.exec(obj.controllerObj.data.id);
					jsonData.id = match[1];
				}
			}
			var businessId = {};
			businessId[idField] = id;
			jsonData.businessId = businessId;
			var jsonString = JSON.stringify(jsonData);
			nschat.websocket.send(jsonString);
		},function(){},'127.0.0.1:8888/Chat')
		/*nschat.websocket.wsConnect(function(){
		  nschat.websocket.send('{"command":"报表模板编辑","id":12345664}');
		},function(){});*/
	}
	//工作流监控弹框
	function workflowViewer(callBack, obj){
		var rowData = obj.rowData;
		var id = callBack.data.id;
		if(typeof(rowData)=='undefined'){
			var dialogConfig = callBack.dialogBeforeHandler({});
			rowData = dialogConfig.value;
			if(typeof(rowData)=='object'){
				if($.isArray(rowData.selectedList)){
					rowData = rowData.selectedList[0];
				}
			}
		}
		if(typeof(rowData)!='object'){rowData = {}};
		var workitemId = rowData.workItemId;
		if(typeof(workitemId)!='undefined'){
			// nsUI.flowChartViewer.dialog.show(workitemId);
			var flowChartViewerConfig = {
				id : id + '-' + workitemId,
				workitemId : workitemId,
				title : '流程监控',
				attrs : {},
			}
			nsUI.flowChartViewer.tab.init(flowChartViewerConfig);
		}else{
			console.error('没有找到workitemId');
			console.error(rowData);
		}
		return;
	}
	//工作流按钮配置
	function workflowSubmit(callBack, obj){
		var rowData = obj.rowData;
		if(typeof(rowData)=='undefined'){
			var dialogConfig = callBack.dialogBeforeHandler({});
			rowData = dialogConfig.value;
			if(typeof(rowData)=='object'){
				if($.isArray(rowData.selectedList)){
					rowData = rowData.selectedList[0];
				}
			}
		}
		if(typeof(rowData)!='object'){rowData = {}};
		var workitemId = rowData.workItemId;
		if(typeof(workitemId)!='undefined'){
			var controllerObj = obj.controllerObj;
			var workflowType = controllerObj.workflowType;
			// var operationFunc = nsEngine.operation().workitemId(workitemId).build();
			if(workflowType == 'submitAllBatch'){
				var operationFunc = nsEngine.operation().workitemId(workitemId).submitAllBatch(true).build();
				workflowType = 'submit';
			}else{
				var operationFunc = nsEngine.operation().workitemId(workitemId).build();
			}
			if(typeof(operationFunc[workflowType])=="function"){
				operationFunc[workflowType](function(resp){
					nsAlert(controllerObj.text+'成功', 'success');
					// console.log(resp);
					if(nsVals.browser.browserSystem == 'mobile'){
							//sjj 20190415 
							//ns-primaryid
							$('div[ns-primaryid="'+rowData[obj.idField]+'"] div.block-tags-content').attr('disabled',true);
							$('div[ns-primaryid="'+rowData[obj.idField]+'"]').find('button[type="button"]').attr('disabled',true);
					}else{
						var $tr = obj.obj.parents("tr");
						$tr.find('button').attr('disabled',true);
					}
				},function(resp){
					nsAlert(controllerObj.text+'失败', 'error');
					console.error(resp);
				});
			}else{
				console.error(workflowType+'方法不存在');
				console.error(operationFunc);
			}
		}else{
			console.error('没有找到workitemId');
			console.error(rowData);
		}
		return;
	}
	//--------------------------------------------------wxk公共弹窗------------------------------------------------------------
}

/*根据不同参数获取容器显示资源内容
* parameter:  base;more;query_select;query_text;base_table;more_table;
*/
function getFieldsByState(businessObj, stateName, TypeObj){
	//businessObj 	object 		业务对象，必须有field字段
	//stateName 	string 		状态名，支持二级状态名称
	//TypeObj 		boolean/object 	
	/*
	 * TypeObj={
	 *  isColumn:true/false,是否返回column，默认返回field 表格/表单
	 *  isDialog: 是否为弹框 默认false
	 *  isMoreCol:表单是否返回二维数组 弹框有效 为了多列显示 isDialog:true时有用
	 * }
	*/
	if(debugerMode){
		var parametersArr = [
			[businessObj,'object',true],
			[stateName,'string',true],
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		//对
		if(typeof(businessObj.fields)!='object'){
			console.error('无法在指定业务对象中找到字段属性');
			console.error(businessObj)
			return;
		}
		if(typeof(businessObj.state)!='object'){
			console.error('无法在指定业务对象中找到状态属性');
			console.error(businessObj)
			return;
		}
	}
	//isColumn默认值是false 返回field的字段
	//if(typeof(isColumn)!='boolean'){
		//isColumn = false;
	//}
	
	switch (typeof(TypeObj)){
		case 'boolean':
			TypeObj ={
				isColumn : TypeObj,
				isDialog : false,
				isMoreCol : false,
			}
			break;			
		case 'undefined':
			TypeObj ={
				isColumn : false,
				isDialog : false,
				isMoreCol : false,
			}
			break;
		case 'object':
			var defaultTypeConfig = {
				isColumn : false,
				isDialog : false,
				isMoreCol : false,
			}
			nsVals.setDefaultValues(TypeObj, defaultTypeConfig);
			break;
	}
	//判断应该输出哪个对象 field还是columns
	var fieldType = 'fields';
	if(TypeObj.isColumn){
		fieldType = 'columns';
	}
	// 判断是否为弹框
	var isDialog = TypeObj.isDialog;
	// 判断是否多列
	var isMoreCol = TypeObj.isMoreCol;

	//拆分状态
	var stateNameStr = '';
	var stateClassStr = 'more';  //默认为more
	if(stateName.indexOf('.')==-1){
		stateNameStr = stateName;
		if(typeof(businessObj.state[stateNameStr].tabs) == "object"){
			stateClassStr = 'tabs';
		}
	}else{
		var stateNameArray = stateName.split('.');
		stateNameStr = stateNameArray[0];
		stateClassStr = stateNameArray[1];
		// 判断是否选择错误
		switch(stateClassStr){
			case 'base':
			case 'more':
				if(typeof(businessObj.state[stateNameStr].field) != "object" && typeof(businessObj.state[stateNameStr]['field-more']) != "object"){
					stateClassStr = 'tabs';
				}
				break;
			case 'tabs':
				// 这种情况不存在 因为 模板配置选择时不提供选择tabs
				if(typeof(businessObj.state[stateNameStr].tabs) != "object"){
					stateClassStr = 'more';
				}
				break;
		}
	}
	//确认状态对象存在
	if(debugerMode){
		if(typeof(businessObj.state[stateNameStr])!='object'){
			console.error('业务对象下没有指定的状态：'+stateNameStr);
			console.error(businessObj);
			return;
		}
	}
	
	//修改查询条件
	var searchStateName = [];
	var searchFieldType = [];
	var searchFieldClass = [];  //'fieldBusiness','fieldControl','fieldVisual'
	switch(stateClassStr){
		case 'tabs':
			//基本字段
			searchStateName = ['tabs'];
			break;
		case 'base':
			//基本字段
			searchStateName = ['field','field-sever'];
			break;
		case 'more':
			//更多字段 返回全部
			searchStateName = ['field', 'field-more','field-sever'];
			break;
		case 'query_select':
			//操作字段中的所有select类的组件
			searchStateName = ['field', 'field-more','field-sever'];
			searchFieldType = ['select','checkbox','select2','radio'];
			searchFieldClass = ['fieldControl'];
			break;
		case 'query_text':
			//操作字段中所有的文本组件
			searchStateName = ['field', 'field-more','field-sever'];
			searchFieldType = ['text'];
			searchFieldClass = ['fieldControl'];
			break;
	}
	var fieldsArray = [];
	//先根据state名字查找
	for(var ssnI = 0; ssnI<searchStateName.length; ssnI++){
		var isPush = true;  //是否应该返回相应字段
		var stateType = searchStateName[ssnI]; // 状态类型 tabs/field/field-more
		var stateData = businessObj.state[stateNameStr][stateType];
		for(var fieldKey in stateData){

			//根据类型判断
			if(searchFieldType.length>0){
				var isSetType = searchFieldType.indexOf(businessObj.fields[fieldKey].type)>-1;
				isPush = isSetType;
			}else{
				//没定义类型则全都可以
				isPush = true;
			}
			if(isPush == false){
				continue;
			}

			//根据mindjet数据描述的类型判断 如果定义了特定类型，则包含该类型则类型
			if(searchFieldClass.length>0){
				var isSetClass = searchFieldClass.indexOf(businessObj.fields[fieldKey].mindjetClass)>-1;
				isPush = isSetClass;
			}else{
				//没定义类型则全都可以
				isPush = true;
			}
			if(isPush == false){
				continue;
			}
			if(typeof(businessObj[fieldType][fieldKey])!='object' && typeof(stateData[fieldKey].edit)!='object'){
				if(debugerMode){
					console.error('状态字段：'+fieldKey+'不存在');
				}
				continue;
			}else{
				// 状态字段是否编辑 若编辑了则读取编辑数据 否则从 fields/columns 中获得
				if(typeof(stateData[fieldKey].edit)=='object'){
					var stateFieldKey = '';
					if(fieldType=='fields'){
						stateFieldKey = 'form';
					}
					if(fieldType=='columns'){
						stateFieldKey = 'table';
					}
					if(stateData[fieldKey].edit[stateFieldKey]){
						var fieldConfig = $.extend(true, {}, stateData[fieldKey].edit[stateFieldKey]);
					}else{
						// console.error('状态字段：'+fieldKey+'状态编辑的fields字段错误','error');
						var fieldConfig = $.extend(true, {}, businessObj[fieldType][fieldKey]);
						// continue;
					}
				}else{
					var fieldConfig = $.extend(true, {}, businessObj[fieldType][fieldKey]);
				}
				fieldConfig["mindjetIndexState"] = stateData[fieldKey]["mindjetIndexState"];
				//根据原始类型处理数据
				switch(fieldType){
					case 'fields':
						// 通过原始类型判断表单配置 （字典）
						switch(fieldConfig.mindjetType){
							case 'dict':
								if(typeof(nsVals.dictData[fieldConfig.dictArguments])=='undefined'){
									console.error('无法找到字典数据:'+fieldConfig.dictArguments)
								}else{
									fieldConfig.subdata = nsVals.dictData[fieldConfig.dictArguments].subdata;
								}
							break;
						}
						// 通过 状态类型（stateType）判断表单显示样式 只有field/field-more
						if(stateType=='field'||stateType=='field-more'||stateType=='field-sever'){
							fieldConfig.mindjetFieldPosition = stateType;
						}
						break
					case 'columns':
						// 字典处理
						switch(fieldConfig.mindjetType){
							case 'dict':
								if(typeof(nsVals.dictData[fieldConfig.dictArguments])=='undefined'){
									console.error('无法找到字典数据:'+fieldConfig.dictArguments)
								}else{
									fieldConfig.formatHandler = {
										type:'dictionary',
										data:nsVals.dictData[fieldConfig.dictArguments].jsondata
									}
									fieldConfig.columnType = "dictionary";
								}
								if(typeof(fieldConfig.editConfig)=="object"){
									if(typeof(nsVals.dictData[fieldConfig.editConfig.dictArguments])=='undefined'){
										console.error('无法找到字典数据:'+fieldConfig.editConfig.dictArguments)
									}else{
										fieldConfig.editConfig.subdata = nsVals.dictData[fieldConfig.editConfig.dictArguments].subdata;
									}
								}
								break;
						}
						//对列表里的字典类型的特殊处理，把显示字段换成冗余字段
						if(fieldConfig.mindjetType == 'data' && typeof(fieldConfig.redundant) == "undefined"){//专门为crm添加
							fieldConfig.hidden = true;
							var dictNameField = $.extend(true, {}, fieldConfig);
							dictNameField.field = dictNameField.field + 'DictName';
							fieldsArray.push(dictNameField);
						}
						if(typeof(fieldConfig.redundant) == "string"){ //自定义冗余字段
							fieldConfig = $.extend(true, {}, businessObj[fieldType][fieldConfig.redundant]);
						}
						if(stateType == 'tabs'){
							fieldConfig["mindjetTabName"] = stateData[fieldKey]["mindjetTabName"];
							fieldConfig.mindjetTabNamePosition = stateData[fieldKey]["mindjetTabNamePosition"]; // 识别的tab位置字段
							// fieldConfig.tabPosition = stateData[fieldKey]["mindjetTabNamePosition"]; // 曾经识别不知道为什么改了 sjj配置识别字段 lyw注
						}
						// 宽度处理
						if(typeof(fieldConfig.width) == 'undefined'){
							fieldConfig.width = 200;
						}
						break
				}
				fieldsArray.push(fieldConfig);
			}
		}	
	}
	//根据生成顺序排序
	fieldsArray.sort(function(a,b){
		return a.mindjetIndexState - b.mindjetIndexState;
	})
	// 弹框是否多列
	if(!TypeObj.isColumn){
		if(isDialog){
			if(isMoreCol){
				fieldsArray = [fieldsArray];
			}
		}
	}
	// console.log(fieldsArray);
	//lyw  2018/04/23    //20140411 删除 原因 如果在配置模板时配置隐藏字段则会出错 暂时删除等待解决
	// if(fieldType == 'fields'&& TypeObj.type=="form"){
	// 	//列宽对照
	// 	var columnArr = {
	// 		1:[1,1,2,6],
	// 		2:[2,2,4,6],
	// 		3:[3,4,6,12],
	// 		4:[4,4,6,12],
	// 		6:[6,6,6,12],
	// 		8:[8,8,12,12],
	// 		9:[9,9,12,12],
	// 		12:[12,12,12,12],
	// 	};
	// 	var fieldsGroupArray = [[]]; //生成的二维数组
	// 	var fieldsGroupArrayIndex = 0; //数组下标
	// 	var fieldsColumnLengthArr = [0,0,0,0]; //相加后的数组
	// 	//列相加
	// 	function fieldsColumnLengthFun(_fieldsColumnLengthArr,_columnForm){
	// 		for(var i=0;i<_fieldsColumnLengthArr.length;i++){
	// 			if($.isArray(columnArr[_columnForm])){
	// 				_fieldsColumnLengthArr[i] += columnArr[_columnForm][i];
	// 			}else{
	// 				_fieldsColumnLengthArr[i] += _columnForm;
	// 			}
	// 		}
	// 		return _fieldsColumnLengthArr;
	// 	}
	// 	//返回要插入的div ---计算列宽
	// 	function columnLengthToClass(_fieldsColumnLengthArr){
	// 		var fieldsColumnLast = [];
	// 		var formClassString = '';
	// 		for(var i=0;i<_fieldsColumnLengthArr.length;i++){
	// 			fieldsColumnLast[i] = 12-_fieldsColumnLengthArr[i]%12;
	// 			var str = '';
	// 			switch(i){
	// 				case 0:
	// 					str = 'lg';
	// 					break;
	// 				case 1:
	// 					str = 'md';
	// 					break;
	// 				case 2:
	// 					str = 'sm';
	// 					break;
	// 				case 3:
	// 					str = 'xs';
	// 					break;
	// 			}
	// 			if(fieldsColumnLast[i] == 12){
	// 				formClassString += ' hidden-' + str;
	// 			}else{
	// 				formClassString += ' col-' + str + '-' + fieldsColumnLast[i];
	// 			}
	// 		}

	// 		return '<div class="'+formClassString+' form-td"><div class="form-group"></div></div>';
	// 	}
		
	// 	function endAddHtml(_fieldsColumnLengthArr,columnForm){
	// 		var endColumnLengthArrUp = $.extend(true,[],_fieldsColumnLengthArr);
	// 		var endColumnLengthArr = fieldsColumnLengthFun(endColumnLengthArrUp,columnForm);
	// 		var fieldsColumnLast = [];
	// 		var formClassString = '';
	// 		for(var i=0;i<endColumnLengthArr.length;i++){
	// 			if(endColumnLengthArr[i]%12<columnArr[columnForm][i]){
	// 				fieldsColumnLast[i] = 12-_fieldsColumnLengthArr[i]%12;
	// 				fieldsColumnLengthArr[i] = 0;
	// 			}else{
	// 				fieldsColumnLast[i] = 12;
	// 				fieldsColumnLengthArr[i] = _fieldsColumnLengthArr[i];
	// 			}
	// 			var str = '';
	// 			switch(i){
	// 				case 0:
	// 					str = 'lg';
	// 					break;
	// 				case 1:
	// 					str = 'md';
	// 					break;
	// 				case 2:
	// 					str = 'sm';
	// 					break;
	// 				case 3:
	// 					str = 'xs';
	// 					break;
	// 			}
	// 			if(fieldsColumnLast[i] == 12){
	// 				formClassString += ' hidden-' + str;
	// 			}else{
	// 				formClassString += ' col-' + str + '-' + fieldsColumnLast[i];
	// 			}
	// 		}
	// 		return '<div class="'+formClassString+' form-td"><div class="form-group"></div></div>';
	// 	}
	// 	var starHiddenNum = 0;
	// 	// 判断前几个是hidden
	// 	for(var i=0; i<fieldsArray.length; i++){
	// 		if(fieldsArray[i].type == "hidden"){
	// 			starHiddenNum = i+1;
	// 		}else{
	// 			break;
	// 		}
	// 	}
	// 	for(var i=0; i<fieldsArray.length; i++){
	// 		if(fieldsArray[i].type == "hidden"){
	// 			fieldsGroupArray[fieldsGroupArrayIndex].push(fieldsArray[i]);
	// 		}else{
	// 			if(typeof(fieldsArray[i].column) == "undefined"){
	// 				var columnForm = 3;
	// 			}else{
	// 				var columnForm = parseInt(fieldsArray[i].column);
	// 			}
	// 			if((fieldsArray[i].column == 12 || fieldsArray[i].element == "label" || i==fieldsArray.length-1) && i>starHiddenNum){
	// 				if(i==fieldsArray.length-1){
	// 					var formClassString = endAddHtml(fieldsColumnLengthArr,columnForm)
	// 					fieldsGroupArray[fieldsGroupArrayIndex].push({html:formClassString});
	// 					fieldsGroupArray[fieldsGroupArrayIndex].push(fieldsArray[i]);
	// 					fieldsColumnLengthArr = fieldsColumnLengthFun(fieldsColumnLengthArr,columnForm);
	// 					var formClassStringEnd = columnLengthToClass(fieldsColumnLengthArr);
	// 					// fieldsGroupArray[fieldsGroupArrayIndex].push(fieldsArray[i]);
	// 					fieldsGroupArray[fieldsGroupArrayIndex].push({html:formClassStringEnd});
	// 				}else{
	// 					var formClassString = columnLengthToClass(fieldsColumnLengthArr);
	// 					fieldsGroupArray[fieldsGroupArrayIndex].push({html:formClassString});
	// 					fieldsGroupArray[fieldsGroupArrayIndex].push(fieldsArray[i]);
	// 					fieldsGroupArray.push([]);
	// 					fieldsGroupArrayIndex++;
	// 					fieldsColumnLengthArr = [0,0,0,0];
	// 				}
	// 			}else{
	// 				if(fieldsArray[i].element == "label"){
	// 				}else{
	// 					fieldsColumnLengthArr = fieldsColumnLengthFun(fieldsColumnLengthArr,columnForm);
	// 				}
	// 				fieldsGroupArray[fieldsGroupArrayIndex].push(fieldsArray[i]);
	// 			}
	// 		}
			
	// 	}
	// 	//20180519
	// 	var fieldsArrayEnd = [];
	// 	for(var index=0;index<fieldsGroupArray.length;index++){
	// 		for(var indexSec=0;indexSec<fieldsGroupArray[index].length;indexSec++){
	// 			fieldsArrayEnd.push(fieldsGroupArray[index][indexSec]);
	// 		}
	// 	}
	// 	return fieldsArrayEnd;
	// }
	return fieldsArray;
}
/*
*根据状态数组获取所有状态字段
*
*/
function getFieldsByStateArray(businessObj, stateNameArray, typeObj){
	//businessObj 	object 		业务对象，必须有field字段
	//stateNameArray 	array 		状态名，支持二级状态名称
	//isColumn 		boolean 	是否返回column，默认返回field
	if(debugerMode){
		var parametersArr = [
		[businessObj,'object',true],
		[stateNameArray,'object',true],
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		//对
		if(typeof(businessObj.fields)!='object'){
			console.error('无法在指定业务对象中找到字段属性');
			console.error(businessObj)
			return;
		}
		if(typeof(businessObj.state)!='object'){
			console.error('无法在指定业务对象中找到状态属性');
			console.error(businessObj)
			return;
		}
	}
	//isColumn默认值是false 返回field的字段
	switch (typeof(typeObj)){
		case 'boolean':
			typeObj ={
				isColumn : TypeObj,
				type : 'form'
			}
			break;			
		case 'undefined':
			typeObj ={
				isColumn : false,
				type : 'form'
			}
			break;
		case 'object':
			var defaultTypeConfig = {
				isColumn:false,
				type:'form'
			}
			nsVals.setDefaultValues(typeObj, defaultTypeConfig);
			break;
	}
	
	var fieldsArray = [];
	if($.isArray(stateNameArray)){
		for(var si =0;si<stateNameArray.length;si++){
			fieldsArray=fieldsArray.concat(getFieldsByState(businessObj,stateNameArray[si],typeObj));
			console.log('--------------------');
			console.log(fieldsArray);
		}
		//去重
		fieldsArray = uniqueArray(fieldsArray,typeObj);
	}
	return fieldsArray;
}
//数组去重
function uniqueArray(arr,typeObj){
	var res = [];
	var json = {};
	var flag = typeObj.isColumn?'field':'id';
	for(var i = 0; i < arr.length; i++){
		if(!json[arr[i][flag]]){
			res.push(arr[i]);
			json[arr[i][flag]] = 1;
		}
	}
	return res;
}
//获取字段定义，不区分状态	，可以带字段分类
function getFieldsByClass(businessObj, classIndex, isColumn){
	// businessObj 	object 			业务对象，必须包含fields字段
	// classIndex   number [0-4] 	业务对象分类，选填，如果不填则返回全部
	// 								可用值有0-4，0：业务字段； 1：操作字段，2：显示字段，3：默认自定义字段（尚未使用），4：操作和显示字段
	// isColumn 	boolean  		是否返回column，默认返回field
	if(debugerMode){
		var parametersArr = [
			[businessObj,'object',true],
			[classIndex,'number',false],
			[isColumn,'boolean',false],
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		if(typeof(businessObj.fields)!='object'){
			console.error('无法在指定业务对象中找到字段属性');
			console.error(businessObj)
			return;
		}
	}
	
	//isColumn默认值是false 返回field的字段
	if(typeof(isColumn)!='boolean'){
		isColumn = false;
	}
	//class默认值是false 返回field的字段
	if(typeof(classIndex)!='number'){
		classIndex = -1;
	}
	var fieldsArray = [];
	for(fieldKey in businessObj.fields){
		var isPush = false;
		switch(classIndex){
			case -1:
				//-1是默认值，全部返回
				isPush = true;
				break;
			case 0:
				//业务字段
				if(businessObj.fields[fieldKey].mindjetClass == 'fieldBusiness'){
					isPush = true;
				}
				break;
			case 1:
				//操作字段
				if(businessObj.fields[fieldKey].mindjetClass == 'fieldControl'){
					isPush = true;
				}
				break;
			case 2:
				//显示字段
				if(businessObj.fields[fieldKey].mindjetClass == 'fieldVisual'){
					isPush = true;
				}
				break;
			case 3:
				console.error('暂时不能使用的参数：'+classIndex+' 合法值为0,1,2,4');
				//暂时不用
				break;
			case 4:
				//显示字段
				if(businessObj.fields[fieldKey].mindjetClass == 'fieldControl' || businessObj.fields[fieldKey].mindjetClass == 'fieldVisual'){
					isPush = true;
				}
				break;
			default:
				console.error('不能识别的参数：'+classIndex+' 合法值为0-4')
				break;
		}
		if(isPush){
			if(isColumn){
				//返回column
				var fieldConfig = $.extend(true, {}, businessObj.columns[fieldKey]);
			}else{
				//返回field
				var fieldConfig = $.extend(true, {}, businessObj.fields[fieldKey]);
			}
			
			fieldsArray.push(fieldConfig);
		}
	}
	fieldsArray.sort(function(a,b){
		return a.mindjetIndex - b.mindjetIndex;
	})
	return fieldsArray;
}

//格式化一些表单字段显示
function formJsonFormat(jsonData,formField){
		var newFormJson = {};
		if(jsonData){
			$.each(jsonData,function(key,value){
				for(var fi=0;fi<formField.length;fi++){
					if(formField[fi].id == key){
						switch(formField[fi].type){
							case 'datetime':
							case 'date':
								newFormJson[key] = Date.parse(value);
								break;
							case 'provinceSelect':
								var locationName ={};
								locationName['province'] = value.province;
								locationName['city'] = value.city;
								locationName['area'] = value.area;
								var locationCode = '';
								if(value.areaCode != ''){
									locationCode = value.areaCode;
								}else{
									if(value.cityCode){
										locationCode = value.cityCode;
									}else{
										locationCode = value.provinceCode;
									}
								}
								newFormJson['locationName'] = JSON.stringify(locationName);
								newFormJson['locationCode'] = locationCode;
								break;
							default:
								newFormJson[key] = value;
								break;
						}
					}
				}
			})
			return newFormJson;
		}
}
//解析Mindjet保存的xml
function getXML(url){
	//解析Mindjet保存的xml url是上传后的xml文件地址
	//console.log(url);
}
/*
*根据方法名称获取按钮数组
*businessObj:业务对象
*functions:方法名称字符串 如果有多个方法则中间用','隔开
*/
function getFuncArrayByFuncNames(businessObj,funcNameStr){
	if(debugerMode){
		var parametersArr = [
			[businessObj,'object',true],
			[funcNameStr,'string',true]
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		if(typeof(businessObj.controller)!='object'){
			console.error('无法在指定业务对象中找到方法属性');
			console.error(businessObj)
			return;
		}
		if(funcNameStr == ''){
			console.error('第二个参数不能为空字符串');
			console.error(funcNameStr);
			return;
		}
	}
	//按钮数组
	var funcObjStrArray = [],
	funcObjArray=[];
	funcNameArray = funcNameStr.split(',');
	for(var fi = 0;fi<funcNameArray.length;fi++){
		var funObjNameArr=funcNameArray[fi].split('.');
		var funcAttr = {
	        controller:businessObj.controller,  //controller对象
	        functionClass: funObjNameArr[0],	//
	        functionName:funObjNameArr[1]       //,
	        //defaultMode:businessObj.controller[funObjNameArr[0]][funObjNameArr[1]].defaultMode,
	    }
		funcObjStrArray.push(funcAttr);
	}
	funcObjArray=getFuncArrayByFuncObjArray(funcObjStrArray);
	return funcObjArray;
};
/*
*根据方法名称获取按钮数组
*xmmapJson:思维导图对象
*funcNameStr:方法名称字符串 如果有多个方法则中间用','隔开
*/
function getFuncArrayByXmmapFuncNames(xmmapJson,funcNameStr){
	if(debugerMode){
		var parametersArr = [
			[xmmapJson,'object',true],
			[funcNameStr,'string',true]
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		if($.isEmptyObject(xmmapJson)){
			console.error('思维导图对象为空');
			console.error(xmmapJson)
			return;
		}
		if(funcNameStr == ''){
			console.error('第二个参数不能为空字符串');
			console.error(funcNameStr);
			return;
		}
	}
	// 按钮数组
	var funcObjStrArray = [],
	funcObjArray=[];
	funcNameArray = funcNameStr.split(',');
	var businessFilterToSystem = nsMindjetToJS.getTags().businessFilterToSystem; // 业务对象同级中需要过滤掉的系统参数
	// 在方法中查询方法返回方法属性
	function getFuncAttrByFun(funcObj){
		var funcAttr = false;
		for(var funcClass in funcObj){
			// funcClass : list / modal
			if(typeof(funcObj[funcClass])=='object'){
				for(var funcName in funcObj[funcClass]){
					if(funcNameArray.indexOf(funcName) > -1){
						funcAttrObj = {
							controller: funcObj,  //controller对象
							functionClass: funcClass,	//
							functionName: funcName       //,
						}
						if(!funcAttr){
							funcAttr = [];
						}
						funcAttr.push(funcAttrObj);
					}
				}
			}
		}
		return funcAttr;
	}
	for(var businessName in xmmapJson){
		if(businessFilterToSystem.indexOf(businessName)==-1){
			var businessObj = xmmapJson[businessName];
			// 判断是否存在方法
			if(typeof(businessObj.controller) == 'object'){
				// 存在方法时根据方法名字查找方法
				var funcAttr = getFuncAttrByFun(businessObj.controller);
				if(funcAttr){
					for(var funcI=0;funcI<funcAttr.length;funcI++){
						funcObjStrArray.push(funcAttr[funcI]);
					}
				}
			}
		}
	}
	funcObjArray=getFuncArrayByFuncObjArray(funcObjStrArray);
	return funcObjArray;

	for(var fi = 0;fi<funcNameArray.length;fi++){
		var funObjNameArr=funcNameArray[fi].split('.');
		var funcAttr = {
	        controller:businessObj.controller,  //controller对象
	        functionClass: funObjNameArr[0],	//
	        functionName:funObjNameArr[1]       //,
	        //defaultMode:businessObj.controller[funObjNameArr[0]][funObjNameArr[1]].defaultMode,
	    }
		funcObjStrArray.push(funcAttr);
	}
	funcObjArray=getFuncArrayByFuncObjArray(funcObjStrArray);
	return funcObjArray;
};
/*
*根据方法数组获取按钮数组
*funcObjStrArray:[business.controller....,business.controller....]
*/
function getFuncArrayByFuncObjArray(funcObjStrArray){
	var btnArray = [];
	var funcObj = {};   //方法对象
	var btnObj= {};		//按钮对象
	if(funcObjStrArray.length>0){
		for(var fi = 0;fi<funcObjStrArray.length;fi++){
			btnObj=getFuncObj(funcObjStrArray[fi]);
			btnArray.push(btnObj);
		}
		return btnArray;
	}else{
		return btnArray;
	}
}
//sjj20181119 针对下拉选项的按钮添加事件
function dropdownBtnLoadPage(_callback,_configObj){
	var configObj = $.extend(true,{},_configObj);
	configObj = _callback.dialogBeforeHandler(configObj);
	var dialogParam = configObj.dialogParam;
	var funconfig = configObj.functionConfig;
	var jsonData = {
		keyField:funconfig.relateKeyField,//跳转界面要显示的vo
		dataLevel:funconfig.dataLevel,//topage跳转关系parent,child,brothers
		data:dialogParam.value,//接受到的参数
		vo:{
			keyField:dialogParam.vo.keyField,
			idField:dialogParam.vo.idField
		},//vo结构
		url:window.location.href,//回传的url
	}
	if(funconfig.url){
		var pageParam = JSON.stringify(jsonData);
		pageParam = encodeURIComponent(encodeURIComponent(pageParam));
		var url = getRootPath()+funconfig.url+'?templateparam='+pageParam;;
		nsFrame.loadPage(url);
	}else{
		console.warn(funconfig);
		nsalert('不存在url，无法跳转');
	}
}
/*
*根据方法获取按钮function对象
*funcObj:controller下具体方法对象
*/
function getFuncObj(funcObj){
	if(debugerMode){
		var parametersArr = [
			[funcObj,'objectNotEmpty',true]
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		var optionsArr = [
			['controller','object',true],  			//controller对象
			['functionClass','string',true], 		// 基本方法对象名称
			['functionName','string',true] 			//具体方法对象名称
			//['defaultMode','string',true] 		//
			]
		nsDebuger.validOptions(optionsArr,funcObj);
		var controller = funcObj.controller;
		var functionClass =funcObj.functionClass;
		var functionName = funcObj.functionName;
		var funObjParent = controller[functionClass];
		var parametersArr = [
			[funObjParent,'objectNotEmpty',true, '基本方法对象名称:'+functionClass+'不存在']
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		var funObjChild = controller[functionClass][functionName];
		var parametersArr = [
			[funObjChild,'objectNotEmpty',true,'具体方法对象名称:'+functionName+'不存在']
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		if(typeof(controller[functionClass][functionName].func)!='object'){
			console.error('无法在指定业务对象中找到方法属性');
			console.error(controller[functionClass][functionName].func)
			return;
		}
	}
	
	//var defaultMode = funcObj.defaultMode;
	var controller = funcObj.controller;
	var functionClass =funcObj.functionClass;//基本方法对象
	var functionName = funcObj.functionName;//具体方法对象
	var functionObj = {};					//按钮方法
	var func = controller[functionClass][functionName]['func'];
	var userMode = controller[functionClass][functionName].userMode;

	var btnObj = {};						//按钮对象
	//判断是否设置defaultMode 如果没有就取ajax方法
	if(typeof(userMode)=='string'){
		functionObj = func[userMode];
	}else{
		functionObj = func['function'];
	}
	//判断按钮名称如果没有设置就取默认(这里需要添加按钮默认显示)
	btnName = typeof(func.config['text']) == 'string' ? func.config['text'] : '按钮默认展现形式';
	//按钮对象
	btnObj = {
		functionConfig:$.extend(true,{},func.config),
		btn:{
			text:btnName,
			isReturn:true,
			handler:functionObj
		}
	}	
	//sjj20181119 如果是下拉选择按钮则存在subdata需要处理的情况
	if($.isArray(func.config.subdata)){
		var dropArray = $.extend(true,[],func.config.subdata);
		for(var dropI=0; dropI<dropArray.length; dropI++){
			var dropData = dropArray[dropI];
			var commonHandler;
			switch(dropData.defaultMode){
				case 'loadPage':
					commonHandler = dropdownBtnLoadPage;
					break;
				case 'toPage':
					commonHandler = toPageCommon;
					break;
				case 'dialog':
				case 'valueDialog':
					commonHandler = dialogCommon;
					break;
				case 'confirm':
					commonHandler = confirmCommon;
					break;
				default:
					commonHandler = customCommon;
					break;
			}
			dropData.handler = commonHandler;
		}
		btnObj.btn.subdata = dropArray;
	}
	return btnObj;
}
/*
*跨业务对象获取对象下的方法按钮
*parentBusiness:总业务对象
*funcNameStr:子业务对象加方法名 
*/
function getFuncArrayFromDefaultObj(parentBusiness,funcNameStr){
	if(debugerMode){
		var parametersArr = [
			[parentBusiness,'object',true],
			[funcNameStr,'string',true]
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		if(funcNameStr == ''){
			console.error('第二个参数不能为空字符串');
			console.error(funcNameStr);
			return;
		}
		var funcNameArray = funcNameStr.split(',');
		for(var i = 0;i<funcNameArray.length;i++){
			var funcNamei=funcNameArray[i];
			var businessObj=funcNamei.substring(0,funcNamei.indexOf('.',1));
			if(debugerMode){
				var parametersArr = [
					[parentBusiness[businessObj],'objectNotEmpty',true,'业务对象:'+businessObj+'不存在']
				]
				var isVaild = nsDebuger.validParameter(parametersArr);
				if(isVaild == false){
					return;
				}
			}
		}
	}
	//按钮数组
	var functions = [];
	var funcNameArray = funcNameStr.split(',');
	for(var i = 0;i<funcNameArray.length;i++){
		var funcNamei=funcNameArray[i];
		//业务对象名称
		var businessObj=funcNamei.substring(0,funcNamei.indexOf('.',1));
		//方法名称
		var funcNameStr=funcNamei.substring(funcNamei.indexOf('.',1)+1);
		//业务对象
		var businessObj = parentBusiness[businessObj];
		functionArray=getFuncArrayByFuncNames(businessObj,funcNameStr);
		functions=functions.concat(functionArray);
	}
	return functions;
}
//**************************************以上是格式化表单和表格字段******************************
/*********************20180320sjj 追加自定义业务组件逻辑代码添加 start**********************/
function partInit(_projectObj,serviceComponent){
	_projectObj.parts = {};
	for(var component in serviceComponent){
		_projectObj.parts[component] = serviceComponent[component];
	}
}
/*********************20180320sjj 追加自定义业务组件逻辑代码添加 end**********************/
//实例
return {
	init:init,
	getXML:getXML,
	getFields:getFieldsByState,
	getFieldsByState:getFieldsByState,
	getFieldsByClass:getFieldsByClass,
	ajaxCommon:ajaxCommon,
	formJsonFormat:formJsonFormat,
	partInit:partInit,
	getFieldsByStateArray:getFieldsByStateArray,
	getFuncArrayByFuncNames:getFuncArrayByFuncNames,
	getFuncArrayByXmmapFuncNames:getFuncArrayByXmmapFuncNames,
	getFuncArrayFromDefaultObj:getFuncArrayFromDefaultObj
	//getDataSource:getDataSource
}
//--------------------------------项目处理组件 end  --------------------------------
})(jQuery)
