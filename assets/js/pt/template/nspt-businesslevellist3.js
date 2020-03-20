/*
	*3级数据联动 块状表格（主表） 详情表（块状表格+list表格
	* @Author: netstar.sjj
	* @Date: 2019-06-19 10:45:00
	* 数据关系 {id:'333',saleList:[{saleId:'33',price:33,customerList:[{customerId:'333'}]}]} 
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.businesslevellist3 = (function(){
	var config;
	function dialogBeforeHandler(data,templateId){
		data = typeof(data)=='object' ? data : {};
		var config = NetstarTemplate.templates.businesslevellist3.data[templateId].config;
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
		var idField = config.mainListConfig.idField;
		var keyField = config.mainListConfig.keyField;
		switch(operatorObject){
			case 'detail':
				idField = config.levelConfig[2].idField;
				keyField = config.levelConfig[2].keyField;
				data.value = getDetailsSelectedData(config);
				break;
			case 'main':
				data.value = getMainListSelectedData(config);
				break;
		}
		data.value.parentSourceParam = {
			package:config.package,
			id:idField,
			templateId:config.id,
		};
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
		//是否有选中值有则处理，无则返回
		var config = NetstarTemplate.templates.businesslevellist3.data[templateId].config;
		handlerObj.config = config;
		var gridConfig = config.levelConfig[2];
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
		var config = NetstarTemplate.templates.businesslevellist3.data[data.templateId].config;
		var data = getMainListSelectedData(config);
		refreshListAjaxByData(config.levelConfig[2].ajax,data,config.levelConfig[2]);
	}
	//ajax后置回调
	function ajaxAfterHandler(res,templateId){
		var config = NetstarTemplate.templates.businesslevellist3.data[templateId].config;
		var gridConfig = config.mainListConfig;
		var gridId = gridConfig.id;
		NetStarGrid.refreshById(gridId);
		var level2Config = config.levelConfig[2];
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
		}
	}
	//跳转打开界面回调
	function loadPageHandler(){}
	//关闭打开界面回调
	function closePageHandler(){}
	//获取主表选中行数据
	function getMainListSelectedData(_config){
		var mainListId = _config.mainListConfig.id;
		var data = [];
		switch(_config.mainListConfig.type){
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
	
	//刷新list数据
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
			//获取ajax返回结果
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
						var templateConfig = NetstarTemplate.templates.businesslevellist3.data[_ajaxOptions.plusData.componentConfig.templateId].config;
						refreshListAjaxByData(templateConfig.levelConfig[3].ajax,listArray[0],templateConfig.levelConfig[3]);
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
						var templateConfig = NetstarTemplate.templates.businesslevellist3.data[_ajaxOptions.plusData.componentConfig.templateId].config;
						NetStarGrid.refreshDataById(templateConfig.levelConfig[3].id,[]);
					}
				}
			}else{
				nsalert(res.msg,'warning');
			}
		},true);
	}
	//list单击行事件
	function listSelectedHandler(data,_rows,_vueData,gridConfig){
		var listAjax = {};
		var refreshId = '';
		var level = gridConfig.level + 1;
		if(NetstarTemplate.templates.configs[gridConfig.package].levelConfig[level]){
			//存在下级数据
			var componentConfig = NetstarTemplate.templates.configs[gridConfig.package].levelConfig[level];
			listAjax = componentConfig.ajax;
			refreshListAjaxByData(listAjax,data,componentConfig);
		}
		// lyw 设置主表按钮是否只读   根据NETSTAR-TRDISABLE(行只读)(获得消息后行设置了只读按钮禁用了，选中其他行时需要取消禁用)
		setMainBtnsDisabled(data, gridConfig);
	}
	//list的回调执行事件
	function listDrawHandler(_vueData){
	
	}
	
	//初始化list完成事件
	function listCompleteHandler(_configs){}
	//ajax完成事件
	function listAjaxSuccessHandler(resData){
		var componentConfig = config.levelConfig[2];
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
	}
	// 主表设置按钮只读
	function setMainBtnsDisabled(data, gridConfig){
		// lyw 设置主表按钮是否只读   根据NETSTAR-TRDISABLE(行只读)(获得消息后行设置了只读按钮禁用了，选中其他行时需要取消禁用)
		var config = NetstarTemplate.templates.configs[gridConfig.package];
		var rootConfig = config.levelConfig[gridConfig.level];
		if(rootConfig.parent == "root"){
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
	}
	function tableQuickqueryInit(gridConfig){
		var queryConfig = gridConfig.ui.query;
		queryConfig.queryForm[0].inputWidth = 60;
		queryConfig.queryForm[1].inputWidth = 60;
		var formJson = {
			form:queryConfig.queryForm,
			id:'query-'+gridConfig.id,
			formStyle:'pt-form-normal',
			plusClass:'pt-custom-query',
			isSetMore:false
		};
		function customFilterRefreshBtnHandler(){}
		formJson.completeHandler = function(obj){
			var buttonHtml = '<div class="pt-btn-group">'
							+'<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" containerid="'+formJson.id+'"><i class="icon-search"></i></button>'
						+'</div>';
			var $container = $('#'+formJson.id);
			$container.append(buttonHtml);
			$('button[containerid="'+formJson.id+'"]').off('click',customFilterRefreshBtnHandler);
			$('button[containerid="'+formJson.id+'"]').on('click',customFilterRefreshBtnHandler);
		}
		var component2 = NetstarComponent.formComponent.getFormConfig(formJson);
		NetstarComponent.formComponent.init(component2,formJson);
	}
	function setTableHtml(tableConfig){
		var contidionHtml = '';
		var quickqueryHtml = '';
		var id = 'query-'+tableConfig.id;
		if(tableConfig.ui.query){
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
		$('#'+tableConfig.id).prepend(contidionHtml);
	}
	//面板容器组件事件初始化
	function initPanelInit(config){
		var pageHeight = NetstarTopValues.topNav.height + 54;
		var commonPanelHeight = $(window).outerHeight()-pageHeight;
		for(var listId in config.componentsConfig.list){
			var listConfig = config.componentsConfig.list[listId];
			var gridConfig = {
				id:listId,
				type:listConfig.type,
				plusClass:listConfig.plusClass,
				idField:listConfig.idField,
				level:listConfig.level,
				templateId:config.id,
				package:config.package,
				data:{
					isSearch:true,
					isPage:true,
					primaryID:listConfig.idField,
					idField:listConfig.idField,
				},
				columns:$.extend(true,[],listConfig.field),
				ui:{
					listExpression:listConfig.listExpression,
					isHaveEditDeleteBtn:false,
					selectMode:'single',
					selectedHandler:listSelectedHandler,
					drawHandler:listDrawHandler,
					completeHandler:listCompleteHandler,
				}
			};
			//是否定义了其他ui配置参数
			if(!$.isEmptyObject(listConfig.params)){
				if(listConfig.params.isServerMode){
					gridConfig.data.isServerMode = componentData.params.isServerMode;
				}
			}
			//grid配置项转换存储ajax
			var listAjax = $.extend(true,{},listConfig.ajax);
			if(typeof(listAjax)=="object"){
				if(typeof(listAjax.contentType)=='undefined'){
					listAjax.contentType = 'application/json; charset=utf-8';
				}
				nsVals.extendJSON(gridConfig.data,listAjax);
			}
			if(!$.isEmptyObject(config.pageParam)){
				delete config.pageParam.parentSourceParam;
				nsVals.extendJSON(listAjax.data,config.pageParam);
			}
			if(listConfig.id === config.mainListConfig.id){
				//主表
				gridConfig.ui.height = commonPanelHeight-10;
				gridConfig.ui.isHeader = false;
				gridConfig.ui.isCheckSelect = false;	
				gridConfig.ui.defaultSelectedIndex = 0;//默认选中第一行
				gridConfig.data.ajaxSuccessHandler = listAjaxSuccessHandler;
				gridConfig.ui.query =  NetStarUtils.getListQueryData(gridConfig.columns,{id:'query-'+listConfig.id,value:''});
				gridConfig.ui.completeHandler = function(){
					setTableHtml(gridConfig);
					tableQuickqueryInit(gridConfig);
				};
			}else{
				//子表数据都是根据主表当前选中数据进行实时刷新操作
				delete gridConfig.data.src;
				gridConfig.data.dataSource = [];
				if(listConfig.type=='blockList'){
					gridConfig.ui.height = 34;
					gridConfig.ui.iconClass = {
						'id':{
							'0':'icon-file-o',
							'1':'icon-product-o',
							'2':'icon-file-check-o',
						}
					}
				}else{
					gridConfig.ui.height = commonPanelHeight-34;
				}
			}
			switch(listConfig.type){
				case 'blockList':
					gridConfig.ui.isThead = false;
					var vueObj = NetstarBlockList.init(gridConfig);		
					break;
				case 'list':
					var vueObj = NetStarGrid.init(gridConfig);
					break;
			}
		}
		//按钮初始化
		for(var btnId in config.componentsConfig.btns){
			var btnsConfig = config.componentsConfig.btns[btnId];
			var btnFieldArray = $.extend(true,[],btnsConfig.field);
			if(btnsConfig.operatorObject == '' || btnsConfig.operatorObject == 'root'){
				for(var fieldI=0; fieldI<btnFieldArray.length; fieldI++){
					if(btnFieldArray[fieldI].functionConfig){
						btnFieldArray[fieldI].functionConfig.isOperatorMain = true;
					}
				}
			}
			btnFieldArray = NetstarTemplate.getBtnArrayByBtns(btnFieldArray);//得到按钮值
			var navJson = {
				id:btnId,
				pagerId:'page-'+btnId,
				isShowTitle:false,
				btns:btnFieldArray,
				callback:{
					dialogBeforeHandler:(function(config){
						return function (data) {
							return dialogBeforeHandler(data,config.id);
						}
						})(config),
					ajaxBeforeHandler:(function(config){
						return function (data) {
							return ajaxBeforeHandler(data,config.id);
						}
						})(config),
					ajaxAfterHandler:(function(config){
						return function (data) {
							return ajaxAfterHandler(data,config.id);
						}
						})(config),
					loadPageHandler:loadPageHandler,
					closePageHandler:closePageHandler
				},
			};
			vueButtonComponent.init(navJson);
		}
	}
	//初始化调用
	function init(_config){
		if(debugerMode){
			//验证
			function validateByConfig(config){
				var isValid = true;
				var validArr = 
				[
					['template','string',true],
					['title','string'],
					['components','array',true]
				];
				isValid = nsDebuger.validOptions(validArr,config);//验证当前模板的配置参数
				return isValid;
			}
			if(!validateByConfig(_config)){
				nsalert('配置文件验证失败', 'error');
				console.error('配置文件验证失败');
				console.error(_config);
				return false;
			}
		}
		if(typeof(NetstarTemplate.templates.businesslevellist3.data)=='undefined'){
			NetstarTemplate.templates.businesslevellist3.data = {};  
		}
		var originalConfig = $.extend(true,{},_config);//保存原始值
		config = _config;
		//var config = _config;
		//记录config
		NetstarTemplate.templates.businesslevellist3.data[_config.id] = {
			original:originalConfig,
			config:config
		};
		//设置默认值
		function setDefault(){
			var defaultConfig = {
				mainListConfig:{},//主表配置参数值
				idFieldsNames:{},//当前模板keyfield和idField对应关系的映射 如{'root':'id','root.salelist':'saleId','root.saleList.customerList':'customerId'}
				componentsConfig:{
					list:{},
					btns:{},
				},//根据当前容器的id存储组件信息
				levelConfig:{},//等级数据存放
			};
			nsVals.extendJSON(config,defaultConfig);
		}
		//面板容器初始化
		function initContainer(){
			var rootListHtml = '';//主表list输出
			var listLevel2Html = '';//第二级list输出
			var listLevel3Html = '';//第三极list输出
			var btnsHtml = '';//按钮输出
			var mainBtnsHtml = '';//主按钮 
			for(var componentsI=0; componentsI<config.components.length; componentsI++){
				var componentData = config.components[componentsI];
				componentData.templateId = config.id;
				switch(componentData.type){
					case 'btns':
						config.componentsConfig.btns[componentData.id] = componentData;
						if(componentData.operatorObject == '' || componentData.operatorObject=='root'){
								mainBtnsHtml = '<div class="pt-panel">'
															+'<div class="pt-panel-container">'
																+'<div class="pt-panel-row">'
																	+'<div class="pt-panel-col">'
																		+'<div class="nav-form main-btns" id="'+componentData.id+'"></div>'
																	+'</div>'
																+'</div>'
															+'</div>'
													+'</div>';
						}else{
							btnsHtml = '<div class="pt-panel">'
														+'<div class="pt-panel-container">'
															+'<div class="pt-panel-row">'
																+'<div class="pt-panel-col">'
																	+'<div class="nav-form" id="'+componentData.id+'"></div>'
																+'</div>'
															+'</div>'
														+'</div>'
												+'</div>';
						}
						break;
					case 'list':
					case 'blockList':
						config.componentsConfig.list[componentData.id] = componentData;
						if(componentData.parent){
							//定义了根节点
							if(componentData.parent == 'root'){
								config.mainListConfig = componentData;//给主表赋值
								config.idFieldsNames.root = componentData.idField;
								config.componentsConfig.list[componentData.id].level = 1;
								config.levelConfig[1] = componentData;
								rootListHtml = '<div class="pt-panel">'
																+'<div class="pt-panel-container" id="'+componentData.id+'" ns-level="1">'
																+'</div>'
															+'</div>';
							}else{
								config.idFieldsNames['root.'+componentData.parent+'.'+componentData.keyField] = componentData.idField;
								config.componentsConfig.list[componentData.id].level = 3;
								config.levelConfig[3] = componentData;
								listLevel3Html = //'<div class="pt-panel">'
																'<div class="pt-panel-container" id="'+componentData.id+'" ns-level="3">'
																+'</div>';
															//+'</div>';
							}
						}else{
							//没有定义根说明是第二级list
							config.idFieldsNames['root.'+componentData.keyField] = componentData.idField;
							config.componentsConfig.list[componentData.id].level = 2;
							config.levelConfig[2] = componentData;
							listLevel2Html = '<div class="pt-panel">'
																+'<div class="pt-panel-container" id="'+componentData.id+'" ns-level="2">'
																+'</div>';
															+'</div>';
						}
						break;
				}
			}
			var bodyHtml = '<div class="pt-container">'
						+'<div class="pt-main-row">'
							+'<div class="pt-main-col">'
								+rootListHtml
								+mainBtnsHtml
							+'</div>' 
							+'<div class="pt-main-col">'
								+listLevel2Html+listLevel3Html+btnsHtml
							+'</div>'
						+'</div>'
					+'</div>';
			var $container = $('container');
			if($container.length > 0){
				$container = $('container:last');
			}
			$container.prepend('<div class="pt-main businesslevellist3" id="'+config.id+'">'+bodyHtml+'</div>');//输出面板
		}
		
		setDefault();//设置默认值
		initContainer();//面板容器初始化
		initPanelInit(config);//面板容器组件事件初始化
	}
	function refreshByConfig(_config){
		config = _config;
		initPanelInit(config);
	}
	return{
		init:									init,								
		VERSION:								'0.0.1',						//版本号
		dialogBeforeHandler:					dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:						ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:						ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:						loadPageHandler,				//弹框初始化加载方法
		closePageHandler:						closePageHandler,				//弹框关闭方法
		getMainListSelectedData:				getMainListSelectedData,				//获取主表选中行数据
		getDetailsSelectedData:					getDetailsSelectedData,				//获取子表数据选中行数据
		getWholeData:							getWholeData,				//获取整体参数
		refreshData:							refreshData,
		refreshByConfig:						refreshByConfig,
	}
})(jQuery)
/******************** 表格模板 end ***********************/