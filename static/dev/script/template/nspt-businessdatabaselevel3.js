/*
	* @Author: netstar.sjj
	* @Date: 2019-10-10 11:45:00
	*左侧tree  右侧 list+tab(多个list)
	* 上list 下tab(多个list)
*/
NetstarTemplate.templates.businessDataBaseLevel3 = (function(){
	/***************组件事件调用 start**************************** */
	function dialogBeforeHandler(data,templateId){
		data = typeof(data)=='object' ? data : {};
		var config = NetstarTemplate.templates.businessDataBaseLevel3.data[templateId].config;
		var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
		
		var operatorObject = controllerObj.operatorObject ? controllerObj.operatorObject : 'root';
		if(controllerObj.targetField){
			operatorObject = controllerObj.targetField;
		}
		var value;
		var currentOperatorGridConfig = {};
		if(operatorObject == 'root'){
			//按钮针对的是主表
			value = getSelectedDataByMainComponent(config.mainComponent);
			currentOperatorGridConfig = config.mainComponent;
		}else if(operatorObject == 'thisVo'){
			value = getSelectedDataByMainComponent(config.mainComponent);
			currentOperatorGridConfig = config.mainComponent;
		}else{
			if(operatorObject == config.level2Config.keyField){
				currentOperatorGridConfig = config.level2Config;
				value = getSelectedDataByMainComponent(config.level2Config);
			}else if(operatorObject == config.level3Config.keyField){
				currentOperatorGridConfig = config.level3Config;
				value = getSelectedDataByMainComponent(config.level3Config);
			}
		}
		if(controllerObj.requestSource == 'checkbox'){
			value = {
				selectedList:value
			};
		}
		if(typeof(value)=='undefined'){value = {};}
		data.value = value;
		data.config = config;
		data.btnOptionsConfig = {
			options:{
				idField:currentOperatorGridConfig.idField
			},
			descritute:{
				keyField:currentOperatorGridConfig.keyField,
				idField:currentOperatorGridConfig.idField
			}
		}
		return data;
	}
	//ajax前置回调
	function ajaxBeforeHandler(handlerObj,templateId){
		//是否有选中值有则处理，无则返回
		var config = NetstarTemplate.templates.businessDataBaseLevel3.data[templateId].config;
		handlerObj.config = config;
		return handlerObj;
	}
	//ajax后置回调
	function ajaxAfterHandler(res,templateId,plusData){
		plusData = typeof(plusData)=='object' ? plusData : {};
		var config = NetstarTemplate.templates.businessDataBaseLevel3.data[templateId].config;	
		var targetField = plusData.targetField ? plusData.targetField : 'root';
		if(targetField == 'root'){
			refreshByGridconfig(config.mainComponent,config.package);
		}else{
			var mainSelectedData = getSelectedDataByMainComponent(config.mainComponent);
			if(targetField == config.level2Config.keyField){
				//刷新第二级数据
				refreshGridDataByAjax(config.level2Config,mainSelectedData);
			}else if(targetField == config.level3Config.keyField){
				//刷新第三级数据
				var innerParams = getSelectedDataByMainComponent(config.level2Config,innerParams);
				refreshGridDataByAjax(config.level3Config,innerParams);
			}
		}
	}
	//跳转打开界面回调
	function loadPageHandler(){}
	//关闭打开界面回调
	function closePageHandler(){}
	/***************组件事件调用 end************************** */
	/****************事件调用 start**************************** */
	//根据当前grid的配置项和包名刷新
	function refreshByGridconfig(_gridConfig,packageName,paramJson){
		var templateConfig = NetstarTemplate.templates.configs[packageName];
		var mainComponent = templateConfig.mainComponent;
		NetStarGrid.refreshById(mainComponent.id,paramJson);
	}
	//根据入参刷新ajax
	function refreshGridDataByAjax(gridConfig,paramsData,paramJson){
		var ajaxConfig = $.extend(true,{},gridConfig.ajax);
		if($.isEmptyObject(ajaxConfig.data)){
			ajaxConfig.data = paramsData;
		}else{
			ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data,paramsData);
		}
		
		if(!$.isEmptyObject(paramJson)){
			$.each(paramJson,function(key,v){
				ajaxConfig.data[key] = v;
			})
		}
		ajaxConfig.plusData = {gridConfig:gridConfig};

		NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
			if(res.success){
				var rowsData = res[ajaxOptions.dataSrc];
				var _gridConfig = ajaxOptions.plusData.gridConfig;
				switch(_gridConfig.type){
					case 'blockList':
						NetstarBlockList.refreshDataById(_gridConfig.id,rowsData);
						break;
					default:
						NetstarTemplate.commonFunc.list.refresh(_gridConfig.id,rowsData);
						break;
				}
			}else{
				nsalert('返回值为false','error');
			}
		},true)
	}

	//第二级 list的重绘事件
	function drawHandlerByLevel2Grid(_vueData){
		var gridId = _vueData.$options.id;
		var displayMode = _vueData.ui.displayMode;
		var configs = {};
		switch(displayMode){
			case 'block':
				configs = NetstarBlockList.configs[gridId];
				break;
			default:
				configs = NetStarGrid.configs[gridId];
				break;
		}
		var gridConfig = configs.gridConfig;
		var packageName = gridConfig.package;
		var templateConfig = NetstarTemplate.templates.configs[packageName];
		var level3GirdConfig = {};
		if($.isEmptyObject(templateConfig.tabLevelConfig[3])){
			level3GirdConfig = templateConfig.level3Config;
		}

		//刷新值
		var rowsData = _vueData.rows;
		var originalRows = _vueData.originalRows;
		if($.isArray(rowsData)){
			var selectedIndex = -1;
			var startI=0;
			if(gridConfig.data.isServerMode == false){
				startI = _vueData.page.start;
			}
			for(var rowI=0; rowI<rowsData.length; rowI++){
				if(originalRows[rowI+startI]){
					//存在于原始数据中
					if(rowsData[rowI].netstarSelectedFlag){
						selectedIndex = rowI;
						break;
					}
				}
			}
			if(selectedIndex > -1){
				//存在选中行的值
				var innerParams = originalRows[selectedIndex+startI];
				var mainSelectedData = getSelectedDataByMainComponent(templateConfig.mainComponent);
				innerParams.root = mainSelectedData;
				refreshGridDataByAjax(level3GirdConfig,innerParams);
			}else{
				NetStarGrid.resetData([], level3GirdConfig.id);
			}
		}
	}
	function mainGridQuickqueryInit(gridConfig){
		var queryConfig = gridConfig.ui.query;
		queryConfig.queryForm[0].inputWidth = 60;
		queryConfig.queryForm[1].inputWidth = 80;
		var formJson = {
			form:queryConfig.queryForm,
			id:'query-'+gridConfig.id,
			formStyle:'pt-form-normal',
			plusClass:'pt-custom-query',
			isSetMore:false
		};
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
		NetstarComponent.formComponent.init(component2,formJson);
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
	//主表完成事件
	function completeHandlerByMainGrid(_configs){
		var gridConfig = _configs.gridConfig;
		setMainGridQueryTableHtml(gridConfig);
		mainGridQuickqueryInit(gridConfig);
	}

	//主表ajax完成事件
	function ajaxSuccessHandlerByMainGrid(resData){
		
	}
	//主表重绘事件
	function drawHandlerByMainGrid(_vueData){
		var gridId = _vueData.$options.id;
		var displayMode = _vueData.ui.displayMode;
		var configs = {};
		switch(displayMode){
			case 'block':
				configs = NetstarBlockList.configs[gridId];
				break;
			default:
				configs = NetStarGrid.configs[gridId];
				break;
		}
		var gridConfig = configs.gridConfig;
		var packageName = gridConfig.package;
		var templateConfig = NetstarTemplate.templates.configs[packageName];
		var level2GirdConfig = {};
		if($.isEmptyObject(templateConfig.tabLevelConfig[2])){
			level2GirdConfig = templateConfig.level2Config;
		}

		//刷新值
		var rowsData = _vueData.rows;
		var originalRows = _vueData.originalRows;
		if($.isArray(rowsData)){
			var selectedIndex = -1;
			var startI=0;
			if(gridConfig.data.isServerMode == false){
				startI = _vueData.page.start;
			}
			for(var rowI=0; rowI<rowsData.length; rowI++){
				if(originalRows[rowI+startI]){
					//存在于原始数据中
					if(rowsData[rowI].netstarSelectedFlag){
						selectedIndex = rowI;
						break;
					}
				}
			}
			if(selectedIndex > -1){
				//存在选中行的值
				refreshGridDataByAjax(level2GirdConfig,originalRows[selectedIndex+startI]);
			}else{
				NetStarGrid.resetData([], level2GirdConfig.id);
			}
		}
	}

	//获取主表选中值
	function getSelectedDataByMainComponent(_mainComponent){
		var value;
		switch(_mainComponent.type){
			case 'list':
				value = getSelectedDataByGridId(_mainComponent.id);
				break;
			case 'blockList':
				value = getSelectedDataByBlockGridId(_mainComponent.id);
				break;
		}
		return value;
	}

	//list表格获取选中值
	function getSelectedDataByGridId(gridId){
		var value;
		if(NetStarGrid.configs[gridId].gridConfig.ui.isCheckSelect){
			value = NetStarGrid.getCheckedData(gridId);
		}else{
			value = NetstarTemplate.commonFunc.list.getSelectedData(gridId);
			if($.isArray(value)){
				if(value.length == 1){
					value = value[0];
				}
			}else{
				value = {};
			}
		}
		return value;
	}
	//块状表格获取选中值
	function getSelectedDataByBlockGridId(gridId){
		var value = NetstarTemplate.commonFunc.blockList.getSelectedData(gridId);
		if($.isArray(value)){
			if(value.length == 1){
				value = value[0];
			}
		}else{
			value = {};
		}
		return value;
	}
	/****************事件调用 end**************************** */
	//组件初始化
	function initComponentInit(_config){
		if(_config.mainComponent.type == 'blockList'){
			_config.componentsConfig.blockList[_config.mainComponent.id].params.height = _config.templateCommonHeight;
			_config.componentsConfig.blockList[_config.mainComponent.id].params.completeHandler = completeHandlerByMainGrid;
			_config.componentsConfig.blockList[_config.mainComponent.id].params.query = NetStarUtils.getListQueryData(_config.mainComponent.field,{id:'query-'+_config.mainComponent.id,value:''});
			for(var listId in _config.componentsConfig.list){
				_config.componentsConfig.list[listId].params.height = parseFloat((_config.templateCommonHeight - 34)/2);
			}
		}else if(_config.mainComponent.type == 'list'){
			var defaultListUIConfig = {
				isShowHead:false,
				isOpenQuery:true,//是否开启查询
				isOpenAdvanceQuery:true,//是否开启高级查询
				callBackFuncByQuery:function(_gridConfig,packageName,paramJson){
					refreshByGridconfig(_gridConfig,packageName,paramJson);
				} 
			};
			NetStarUtils.setDefaultValues(_config.componentsConfig[_config.mainComponent.type][_config.mainComponent.id].params,defaultListUIConfig);
		}
		var defaultMainUIConfig = {
			drawHandler:drawHandlerByMainGrid,  
			ajaxSuccessHandler:ajaxSuccessHandlerByMainGrid,
		};
		NetStarUtils.setDefaultValues(_config.componentsConfig[_config.mainComponent.type][_config.mainComponent.id].params,defaultMainUIConfig);

		var defaultLevel2UIConfig = {
			drawHandler:drawHandlerByLevel2Grid
		};
		if($.isEmptyObject(_config.tabLevelConfig[2])){
			NetStarUtils.setDefaultValues(_config.componentsConfig[_config.level2Config.type][_config.level2Config.id].params,defaultLevel2UIConfig);
		}
		for(var componentType in _config.componentsConfig){
			var componentData = _config.componentsConfig[componentType];
			switch(componentType){
			  	case 'vo':
				  NetstarTemplate.commonFunc.vo.initVo(componentData,_config);
				  break;
			    case 'list':
					NetstarTemplate.commonFunc.list.initList(componentData,_config);
				  break;
			    case 'blockList':
				  	NetstarTemplate.commonFunc.blockList.initBlockList(componentData,_config);
				  break;
			    case 'btns':
				  	NetstarTemplate.commonFunc.btns.initBtns(componentData,_config);
				  break;
			}
		}
	}
	//初始化容器面板
	function initContainer(_config){
		/****************找到当前要填充内容的容器 start */
		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		/****************找到当前要填充内容的容器 end */
		var titleHtml = '';//标题
		if(_config.title){
			//定义了标题输出
			titleHtml = '<div class="pt-main-row">'
								+'<div class="pt-main-col">'
									+'<div class="pt-panel pt-panel-header">'
										+'<div class="pt-container">'
											+'<div class="pt-panel-row">'
												+'<div class="pt-panel-col">'
													+'<div class="pt-title pt-page-title"><h4>'+_config.title+'</h4></div>'
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>';
		}
		/***********循环components输出结构 start************************ */
		for(var componentI=0; componentI<_config.components.length; componentI++){
			var componentData = _config.components[componentI];//当前组件配置参数值
			var componentTitleStr = componentData.title ? componentData.title : '';
			var parentField = componentData.parent ? componentData.parent : 'root';
			var keyField = componentData.keyField;
			var componentClassStr = 'pt-components-'+componentData.type;
			componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
			var componentDisplayMode = componentData.params.displayMode ? componentData.params.displayMode : '';
			var componentDataType = componentData.type;
			/****************根据组件类型和id存储组件配置信息 start*************************** */
			if(componentDisplayMode == 'voList'){
				componentDataType = 'voList';
			}
			_config.componentsConfig[componentDataType][componentData.id] = componentData; //根据组件类型存储信息 
			/****************根据组件类型和id存储组件配置信息 end*************************** */
			/****************根据parent和keyField的定义找idFieldsNames start*************************** */
			switch(componentDataType){
				case 'vo':
				case 'list':
				case 'blockList':
				case 'voList':
					if(keyField == 'root'){
						//主数据
						componentData.isAjax = true;
						_config.mainComponent = componentData;
						_config.idFieldsNames['root'] = componentData.idField;//主键id
						_config.levelConfig[1][componentData.id] = componentData;
					}else if(parentField =='root' && keyField){
						//当前是个二级数据
						_config.idFieldsNames['root.'+keyField] = componentData.idField;
						_config.levelConfig[2][componentData.id] = componentData;
						_config.level2Config = componentData;
					}else{
						//当前父节点不是root是别的有意义的值 可能是个三级数据或者三级以上的数据 暂且按三级数据结构定义走
						_config.idFieldsNames['root.'+parentField+'.'+keyField] = componentData.idField;
						_config.levelConfig[3][componentData.id] = componentData;
						_config.level3Config = componentData;
					}
					break;
				case 'tab':
					var levelTabIndex = typeof(componentData.params.level)=='number' ? componentData.params.level : -1;
					if(_config.tabLevelConfig[levelTabIndex]){
						_config.tabLevelConfig[levelTabIndex] = componentData;
					}
					break;
			}
			/****************根据parent和keyField的定义找idFieldsNames end*************************** */
		}
		/***********循环components输出结构 end************************ */
		if($.isEmptyObject(_config.mainComponent)){
			nsalert('当前模板未定义主表','error');
			return;
		}
		_config.mode = _config.mainComponent.type.toLocaleLowerCase() + 'grid';
		/****************输出模板配置的自定义class start */
		var templateClassStr = _config.template.toLocaleLowerCase();
		if(_config.plusClass){
			//自定义了plusClass
			templateClassStr += ' '+_config.plusClass;
		}
		if(_config.mode){
			//当前模板展示模式  class的定义必须是全小写
			templateClassStr +=' '+_config.mode.toLocaleLowerCase();
		}
		/****************输出模板配置的自定义class end */
		var level2Html = '';
		var level3Html = '';
		if($.isEmptyObject(_config.tabLevelConfig[2])){
			//二级列表数据只有一个 不用以tab展示多个
			var level2BtnHtml = '';
			if(_config.btnKeyFieldJson[_config.level2Config.keyField]){
				level2BtnHtml = '<div class="pt-panel">'
									+'<div class="level2-component-btn" id="'+_config.btnKeyFieldJson[_config.level2Config.keyField].id+'"></div>'
								+'</div>'
			}
			level2Html = '<div class="pt-panel">'
							+level2BtnHtml
							+'<div class="pt-panel-container" id="'+_config.level2Config.id+'" ns-level="2"></div>'
						 +'</div>';
		}
		if($.isEmptyObject(_config.tabLevelConfig[3])){
			//三级列表数据只有一个 不用以tab展示多个
			var level3BtnHtml = '';
			if(_config.btnKeyFieldJson[_config.level3Config.keyField]){
				level3BtnHtml = '<div class="pt-panel">'
									+'<div class="level2-component-btn" id="'+_config.btnKeyFieldJson[_config.level3Config.keyField].id+'"></div>'
								+'</div>';
			}
			level3Html = '<div class="pt-panel">'
							+level3BtnHtml
							+'<div class="pt-panel-container" id="'+_config.level3Config.id+'" ns-level="3"></div>'
						 +'</div>';
		}
		var addPlusClass = '';
		var mainBtnHtml = '';
		var detailHtml = '';
		if(_config.btnKeyFieldJson){
			if(_config.btnKeyFieldJson.root){
				mainBtnHtml = '<div class="pt-panel"><div class="main-btns pt-components-btn" operatorobject="root" id="'+_config.btnKeyFieldJson.root.id+'"></div></div>';
			}
		}
		switch(_config.mainComponent.type){
			case 'list':
				addPlusClass = 'pt-col-auto';
				mainHtml = mainBtnHtml
							+'<div class="pt-panel">'
								+'<div class="pt-panel-container" id="'+_config.mainComponent.id+'" ns-level="1"></div>'
							+'</div>';
				if(level2Html){
					if(_config.level2Config.type == 'list'){
						mainHtml += level2Html;
						detailHtml = level3Html;
					}else{
						mainHtml += level3Html;
						detailHtml = level2Html;
					}
				}
				break;
			case 'blockList':
				mainHtml = mainBtnHtml
							+'<div class="pt-panel">'
								+'<div class="pt-panel-container" id="'+_config.mainComponent.id+'" ns-level="1"></div>'
							+'</div>';
				detailHtml = level2Html+level3Html;
				break;
		}
		var containerHtml = '<div class="pt-main-row">'
							+'<div class="pt-main-col '+addPlusClass+'" ns-position="left" component-type="'+_config.mainComponent.type.toLocaleLowerCase()+'">'
								+mainHtml
							+'</div>'
							+'<div class="pt-main-col '+addPlusClass+'" ns-position="right">'
								+detailHtml
							+'</div>'
						+'</div>';

		var html = '<div class="pt-main '+templateClassStr+'" id="'+_config.id+'" ns-package="'+_config.package+'">'
						+titleHtml+containerHtml
					+'</div>';
		if(_config.$container){
			_config.$container.html(html);
		}else{
			$container.prepend(html);//输出面板
		}
		initComponentInit(_config);
	}
	//设置默认值
	function setDefault(_config){
		//var commonHeight = _config.templateCommonHeight;//排除标签高度 底部高度 标题高度
		var defaultConfig = {
			level2Config:{},
			level3Config:{},
			levelConfig:{
				1:{},
				2:{},
				3:{}
			},//当前组件的定义按数据关系存储组件信息
			tabLevelConfig:{
				1:{},
				2:{},
				3:{}
			},//当前模板第二级第三级支持多个tab的输出
		};
		NetStarUtils.setDefaultValues(_config,defaultConfig);
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
	}
	function refreshByConfig(_config){
		initComponentInit(_config);
	}
	return{
		init:											init,								
		VERSION:										'0.0.1',						//版本号
		dialogBeforeHandler:							dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:								ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:								ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:								loadPageHandler,				//弹框初始化加载方法
		closePageHandler:								closePageHandler,				//弹框关闭方法
		refreshByConfig:								refreshByConfig,
		gridSelectedHandler:							function(){},
		getSelectedDataByGridId:						getSelectedDataByGridId,//list表格获取选中值
		getSelectedDataByBlockGridId:					getSelectedDataByBlockGridId,//块状表格获取选中值
		refreshByGridconfig:							refreshByGridconfig,//通过grid的配置项进行刷新
		refreshGridDataByAjax:							refreshGridDataByAjax,
	}
})(jQuery)