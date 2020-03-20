/****
***表单表格模板包含form，table,button(导航上显示的按钮)
****
********/
/******************** 表单表格模板 start ***********************/
NetstarTemplate.templates.doubleTables = (function(){
	var config = {};//当前配置参数
	var originalConfig = {};//原始配置项
	var optionsConfig = {
		dialogBeforeHandler:dialogBeforeHandler,
		ajaxBeforeHandler:ajaxBeforeHandler,
		ajaxAfterHandler:ajaxAfterHandler,
		loadPageHandler:loadPageHandler,
		closePageHandler:closePageHandler
	};
	var componentsConfig = {
		vo:[],
		list:[],
		tab:{
			vo:[],
			list:[]
		},
		btns:[]
	};//根据不同的type类型去存放配置参数
	/***********************回调传参 start***************************************/
	//弹出框前置回调
	function dialogBeforeHandler(){

	}
	//ajax前置回调
	function ajaxBeforeHandler(){

	}
	//ajax后置回调
	function ajaxAfterHandler(){

	}
	//跳转打开界面回调
	function loadPageHandler(){

	}
	//关闭打开界面回调
	function closePageHandler(){

	}
	/***********************回调传参 end***************************************/
	function componentsBtnPanelInit(btnsArray){
		for(var btnI=0; btnI<btnsArray.length; btnI++){
			vueButtonComponent.init(btnsArray[btnI]);	
		}
	}
	function componentsListPanelInit(listArray,customUi){
		for(var listI=0; listI<listArray.length; listI++){
			var listData = listArray[listI];
			var dataConfig = {};
			NetStarUtils.setDefaultValues(dataConfig,listData.ajax);
			dataConfig.idField = listData.idField;
			var gridConfig = {
				ui:customUi,
				data:dataConfig,
				columns:listData.field,
				id:listData.id,
			};
			var vueObj = NetStarGrid.init(gridConfig);
		}
	}
	function componentsVoPanelInit(voArray){
		for(var voI=0; voI<voArray.length; voI++){
			var voData = voArray[voI];
			voData.isSetMore = false;
			var component = NetstarComponent.formComponent.getFormConfig(voData);
			if(component){
				NetstarComponent.formComponent.init(component,voData);
			}
		}
	}
	//组件面板方法初始化
	function componentsPanelInit(){
		if(componentsConfig.vo.length > 0){
			//存在vo面板
			componentsVoPanelInit(componentsConfig.vo);
		}
		if(componentsConfig.list.length > 0){
			var customUi = {
				isCheckSelect:true,
			}
			componentsListPanelInit(componentsConfig.list,customUi);
		}	
		//componentsConfig.tab
		if(componentsConfig.tab.vo.length > 0){
			//存在vo面板
			componentsVoPanelInit(componentsConfig.tab.vo);
		}	
		if(componentsConfig.tab.list.length > 0){
			//存在list面板
			var customUi = {
				isCheckSelect:false,
			}
			componentsListPanelInit(componentsConfig.tab.list,customUi);
		}	
		if(componentsConfig.btns.length > 0){
			//存在按钮
			componentsBtnPanelInit(componentsConfig.btns);
		}
	}
	//初始化容器面板
	function initContainer(){

		//config.components 循环输出容器 和触发事件
		var pageHtml = '';//容器内容输出
		for(var componentI=0; componentI<config.components.length; componentI++){
			var componentData = config.components[componentI];
			var classStr = 'component-'+componentData.type;//class名称
			var containerId = config.id+'-'+componentData.type+'-'+componentI;//定义容器id 
			if(componentData.position){
				//定义了位置
				classStr += ' '+componentData.position;
			}
			var html = '<div class="'+classStr+'" id="'+containerId+'">'
			pageHtml += NetstarTemplate.getPanelHtml(html);
			var configData = $.extend(true,{},componentData);
			configData.id = containerId;
			switch(componentData.type){
				case 'vo':
					configData.form = componentData.field;
					delete configData.field;
					componentsConfig.vo.push(configData);
					break;
				case 'list':
					componentsConfig.list.push(configData);
					break;
				case 'tab':
					var liHtml = '';
					var tabContentHtml = '';
					var tabClassStr = classStr + ' '+'pt-nav-item';
					for(var fieldI=0; fieldI<componentData.field.length; fieldI++){
						var tabComponentData = componentData.field[fieldI];
						var tabContainerId = containerId+'-tab-'+fieldI;
						var configData = $.extend(true,{},tabComponentData);
						configData.id = tabContainerId;
						switch(tabComponentData.type){
							case 'vo':
								configData.form = tabComponentData.field;
								delete configData.field;
								componentsConfig.tab.vo.push(configData);
								break;
							case 'list':
								componentsConfig.tab.list.push(configData);
								break;
						}
						var activeClassStr = '';
						if(fieldI == 0){activeClassStr = 'current';}
						liHtml += '<li class="'+tabClassStr+' '+activeClassStr+'" ns-index="'+fieldI+'">'
									+'<a href="javascript:void(0);" ns-href="'+tabContainerId+'" data-toggle="tab">'+tabComponentData.title+'</a>'
								+'</li>';
						tabContentHtml += '<div class="pt-tab-content '+activeClassStr+'">'
											+'<div class="pt-tab-compoents" id="'+tabContainerId+'"></div>'
										+'</div>';
					}
                    pageHtml += '<div class="pt-tab-'+classStr+' pt-tab">'
                                    +'<div class="pt-container">'
                                        +'<div class="pt-tab-header">'
                                            +'<div class="pt-nav">'
                                            +'<ul class="pt-tab-list-'+classStr+'" id="tab-'+tabContainerId+'">'
                                                +liHtml
                                            +'</ul>'
                                            +'</div>'
                                        +'</div>'
                                        +'<div class="pt-tab-body">'
                                            +tabContentHtml
                                        +'</div>'
                                    +'</div>'
								+'</div>';
					break;
				case 'btns':
					componentsConfig.btns.push({
						id:containerId,
						pageId:config.id,
						isShowTitle:false,
						btns:componentData.field
					});
					break;
			}
			pageHtml += '</div>';
		}
		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		$container.prepend('<div class="pt-main doubletables" id="'+config.id+'">'+pageHtml+'</div>');//输出面板
		componentsPanelInit();
	}
	//初始化
	function init(_config){
		config = _config;
		//第一次执行初始化模板
		if(typeof(NetstarTemplate.templates.doubleTables.data)=='undefined'){
			NetstarTemplate.templates.doubleTables.data = {};  
		}
		originalConfig = $.extend(true,{},config);//保存原始值
		//记录config
		NetstarTemplate.templates.doubleTables.data[config.id] = {
			original:originalConfig,
			config:config
		}
		initContainer();//初始化容器面板
	}
	//可进行自定义调用方法
	function componentInit(){

	}
	//重置操作
	function resetData(templateId){
		/*
			*templateId  string  模板id
		*/
		var templatesConfig = NetstarTemplate.templates.businessDataBase.data[templateId].original;
		var commonHeight = getContainerHeight(templatesConfig);
	}
	return {
		init:								init,							//模板初始化调用
		componentInit:						componentInit,					//调用某个组件初始化
		dialogBeforeHandler:				dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:					ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:					ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:					loadPageHandler,				//弹框初始化加载方法
		closePageHandler:					closePageHandler,				//弹框关闭方法
		VERSION:							'0.5.1',						//版本号
		resetData:							resetData,						//重新设置读取值
	}
})(jQuery)
/******************** 表单表格模板 end ***********************/