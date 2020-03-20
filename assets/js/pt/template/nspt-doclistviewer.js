/*
	*单据详情模板
	*sjj 20190214
	*主表  tab形式的详情表  标题  主表的检索  按钮
*/
/******************** 单据详情   start ***********************/
NetstarTemplate.templates.docListViewer = (function(){
	var config = {};//当前配置参数
	var originalConfig = {};//原始配置项
	var componentsConfig = {
		vo:[],
		list:[],
		tab:{
			vo:[],
			list:[]
		},
		blockList:[],
		btns:[]
	};//根据不同的type类型去存放配置参数
	var mainListManager = {
		data:{},//数据
		config:{},//相关参数
		quickquery:{
			queryMode:'quickSearch',// 检索模式  默认快速查询
			config:{},//配置参数
		},//快速查询
	};//主表信息管理数据
	var detailListManager = {
		config:[],//配置参数
		keyField:{},//详细表的数据源 list名字
		tab:{},//tab配置参数
	};//详细表管理数据
	var voManager = {
		config:[],//配置参数
	};//vo 配置管理数据
	var mainListPanleId;//主表面板id
	var detailListPanelId;//详情表面板id
	var componentConfig = {};//组件调用的配置参数
	var commonHeight = 0; //模板公用部分的高度
	var mainListHeight = 0;//主表的高度
	var detialListHeight = 0;//详情表的高度
	var paramsData = {};
	var mainDbActionConfig = {};//主表双击配置参数
	var mainDbActionArray = [];
	/***********************回调传参 start***************************************/
	//弹出框前置回调
	function dialogBeforeHandler(data,templateId){

		config = NetstarTemplate.templates.docListViewer.data[templateId].config;

		var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
		if(typeof(data.controllerObj)=='object'){
			if(typeof(config.pageParam)=='object'){
				data.controllerObj.func.config.defaultData = {data_auth_code:config.pageParam.data_auth_code};
			}
		}

		var gridConfig = config.mainDataConfig;
		var selectedData = getCurrentData(gridConfig.id);
		var primaryId = '';
		if(selectedData.selectedList.length > 0){
			if(!$.isEmptyObject(data.controllerObj)){
				if(data.controllerObj.requestSource != 'checkbox'){
					var voData = selectedData.selectedList[0];
					delete selectedData.selectedList;
					primaryId = voData[config.mainDataConfig.idField];
					nsVals.extendJSON(selectedData,voData);
				}else{
					primaryId = selectedData.selectedList[0][config.mainDataConfig.idField];
				}
			}
		}
		if($.isEmptyObject(selectedData)){
			selectedData = false;
		}
		selectedData.parentSourceParam = {
			package:config.package,
			id:primaryId,
			templateId:config.id,
		};
		data.value = selectedData;
		//sjj 20190618 如果按钮配置了isSendPageParams 为false 则不发送 界面来源参
		if(typeof(controllerObj.isSendPageParams)=='boolean'){
			if(controllerObj.isSendPageParams == false){
				data.value = {};
			}
		}
		data.btnOptionsConfig = {
			options:{
				idField:gridConfig.idField
			},
			descritute:{
				keyField:gridConfig.keyField,
				idField:gridConfig.idField
			}
		}
		data.config = config;
		return data;
	}
	//ajax前置回调
	function ajaxBeforeHandler(handlerObj,templateId){
		//是否有选中值有则处理，无则返回
		config = NetstarTemplate.templates.docListViewer.data[templateId].config;
		handlerObj.config = config;
		var gridConfig = config.mainDataConfig;
		if($.isEmptyObject(handlerObj.value)){
			var selectedData = getCurrentData(gridConfig.id);
			var primaryId = '';
			if(selectedData.selectedList.length > 0){
				if(!$.isEmptyObject(handlerObj.ajaxConfig)){
					if(handlerObj.ajaxConfig.defaultMode == 'toPage' || handlerObj.ajaxConfig.defaultMode == 'newtab'){
						//新界面打开
						if(handlerObj.ajaxConfig.requestSource != 'checkbox'){
							var voData = selectedData.selectedList[0];
							delete selectedData.selectedList;
							primaryId = voData[config.mainDataConfig.idField];
							nsVals.extendJSON(selectedData,voData);
						}
					}else{
						if(handlerObj.ajaxConfig.requestSource != 'checkbox'){
							var voData = selectedData.selectedList[0];
							delete selectedData.selectedList;
							primaryId = voData[config.mainDataConfig.idField];
							nsVals.extendJSON(selectedData,voData);
						}
					}
				}
			}
			if($.isEmptyObject(selectedData)){
				selectedData = false;
			}
			selectedData.parentSourceParam = {
				package:config.package,
				id:primaryId,
				templateId:config.id,
			};
			handlerObj.value = selectedData;
		}
		handlerObj.ajaxConfigOptions = {
			idField:gridConfig.idField,
			keyField:gridConfig.keyField,
			pageParam:config.pageParam,
			parentObj:config.parentObj,
		};
		handlerObj.config = config;
		return handlerObj;
	}
	//ajax后置回调
	function ajaxAfterHandler(res,templateId){
		config = NetstarTemplate.templates.docListViewer.data[templateId].config;
		detailListManager = config.detailListManager;
		var gridConfig = config.mainDataConfig;
		var gridId = gridConfig.id;
		if(!$.isEmptyObject(res)){
			if($.isArray(res)){
				//刷新主表
				NetStarGrid.resetData(res, gridId);	
			}else{
				//返回格式是vo
				switch(res.objectState){
					case NSSAVEDATAFLAG.DELETE:
						//删除
						//主表值删除数据 附表全部删除
						NetStarGrid.delRow(res,config.mainDataConfig.id);
						var keyFieldJson = detailListManager.keyField;
						for(var listId in keyFieldJson){
							NetStarGrid.resetData([], listId);
						}
						var resData = NetStarGrid.configs[config.mainDataConfig.id].vueConfig.data.rows;
						var selectedIndex = -1;
						for(var rowI=0; rowI<resData.length; rowI++){
							if(resData[rowI].netstarSelectedFlag){
								selectedIndex = rowI;
								break;
							}
						}
						if(selectedIndex > -1){
							getDetailsData(resData[selectedIndex],gridConfig);
						}	
						break;
					case NSSAVEDATAFLAG.EDIT:
						//修改
						break;
					case NSSAVEDATAFLAG.ADD:
						//添加
						NetStarGrid.addRow(res,gridId);
						var keyFieldJson = detailListManager.keyField;
						for(var listId in keyFieldJson){
							if($.isArray(res[keyFieldJson[listId]])){
								NetStarGrid.resetData(res[keyFieldJson[listId]], listId);
							}else{
								NetStarGrid.resetData([], listId);
							}
						}	
						break;
					case NSSAVEDATAFLAG.VIEW:
						//刷新
						NetStarGrid.refreshById(gridId);
						//sjj 20190515刷新了主表之后会执行主表的drawHandler事件，如果数据发生了变化就会去刷新子表数据
						break;
				}
			}
		}
	}
	//跳转打开界面回调
	function loadPageHandler(){

	}
	//关闭打开界面回调
	function closePageHandler(){}
	/***********************回调传参 end***************************************/
	function mainDbActionHandler(data){
		var functionConfig = mainDbActionConfig.functionConfig;
		var dataConfig = dialogBeforeHandler({controllerObj:functionConfig});
		var currentParams = dataConfig.value;
		var paramObj = $.extend(true,{},currentParams);
		var url = functionConfig.suffix;
		if(!$.isEmptyObject(paramObj)){
			paramObj = JSON.stringify(paramObj);
			var urlStr =  encodeURIComponent(encodeURIComponent(paramObj));
			url = url+'?templateparam='+urlStr;
		}
		switch(functionConfig.defaultMode){
			case 'toPage':
				NetstarUI.labelpageVm.loadPage(url,functionConfig.text);
				break;
			case 'confirm':
				break;
			case 'dialog':
				break;
		}
	}
	function componentsBtnPanelInit(_btnsArray){

		var btnsArray = $.extend(true,[],_btnsArray);

		if(!$.isEmptyObject(mainDbActionConfig)){
			//主表tableRowBtnS没有定义双击 判断btns是否有定义
			btnsArray[0].btns.push({
				text:mainDbActionConfig.btn.text,
				handler:mainDbActionHandler,
			});
		}

		for(var btnI=0; btnI<btnsArray.length; btnI++){
			var btnsData = $.extend(true,{},btnsArray[btnI]);
			var btnArray = NetstarTemplate.getBtnArrayByBtns(btnsData.btns);
			btnsData.callback = {
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
				closePageHandler:closePageHandler,
				dataImportComplete:(function(config){
					return function (data, _config) {
						NetstarTemplate.templates.docListViewer.refreshByConfig(config);
					}
				})(config),
			};
			btnsData.btns = btnArray;
			vueButtonComponent.init(btnsData);	
		}
	}


	//

	function componentsListPanelInit(listArray,customUi){
		for(var listI=0; listI<listArray.length; listI++){
			switch(listArray[listI].type){
				case 'blockList':
					componentBlockListInit(listArray[listI]);
					break;
				default:
					var listData = listArray[listI];
					var dataConfig = {};
					if(!$.isEmptyObject(listData.ajax)){
						if(typeof(listData.ajax.contentType)=='undefined'){
							listData.ajax.contentType = "application/json; charset=utf-8";
						}
						if(!$.isEmptyObject(paramsData)){
							//nsVals.extendJSON(listData.ajax.data,paramsData);
							var isUseObject = true;
							var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
							for(var key in listData.ajax.data){
								if (ajaxParameterRegExp.test(listData.ajax.data[key])) {
									isUseObject = false;
									break;
								}
							}
							listData.ajax.data = typeof(listData.ajax.data) == "object" ? listData.ajax.data : {};
							if(isUseObject){
								nsVals.extendJSON(listData.ajax.data,paramsData);
							}else{
								paramsData = NetStarUtils.getFormatParameterJSON(listData.ajax.data,paramsData);
								config.pageParam = paramsData;
								listData.ajax.data = paramsData;
							}
						}
						NetStarUtils.setDefaultValues(dataConfig,listData.ajax);
					}else{
						dataConfig.dataSource = [];
					}
					if(!$.isEmptyObject(listData.params)){
						if(listData.params.isServerMode){
							dataConfig.isServerMode = listData.params.isServerMode;
						}
					}
					dataConfig.idField = listData.idField;
					if(typeof(customUi.ajaxSuccessHandler)=='function'){
						dataConfig.ajaxSuccessHandler = customUi.ajaxSuccessHandler;
					}
					var gridConfig = {
						ui:customUi,
						data:dataConfig,
						columns:listData.field,
						id:listData.id,
					};
					var vueObj = NetStarGrid.init(gridConfig);
					break;
			}
		}
	}
	//blocklist块状表格初始化 sjj 20190529
	function componentBlockListInit(listData){	
		var customUi = {
			height:mainListHeight,
			isCheckSelect:true,
			selectMode:'single',
			completeHandler:mainListCompleteHandler,
			pageChangeAfterHandler:isLengthChangeAfterHandler,
			pageLengthChangeHandler:pageLengthChangeHandler,	
			rowdbClickHandler:rowDoubleSelectHandler,
			selectedHandler:rowSelectedHandler,
			defaultSelectedIndex:0,
			pageLengthDefault:10,
			isUseMessageState:false,
			ajaxSuccessHandler:function(resData){
				if($.isArray(resData)){
					var selectIndex = -1;
					for(var rowI=0; rowI<resData.length; rowI++){
						if(resData[rowI].netstarSelectedFlag){
							selectIndex = rowI;
							break;
						}
					}
					if(selectIndex > -1){
						getDetailsData(resData[selectIndex],config.mainDataConfig);
					}
				}
			}
		};
		if(!$.isEmptyObject(mainListManager.quickquery.config)){
			customUi.query = mainListManager.quickquery.config;
		}
		var dataConfig = {};
		if(!$.isEmptyObject(listData.ajax)){
			if(typeof(listData.ajax.contentType)=='undefined'){
				listData.ajax.contentType = "application/json; charset=utf-8";
			}
			if(!$.isEmptyObject(paramsData)){
				nsVals.extendJSON(listData.ajax.data,paramsData);
			}
			NetStarUtils.setDefaultValues(dataConfig,listData.ajax);
		}else{
			dataConfig.dataSource = [];
		}
		dataConfig.idField = listData.idField;
		if(typeof(customUi.ajaxSuccessHandler)=='function'){
			//定义了ajax完成之后的回调函数
			dataConfig.ajaxSuccessHandler = customUi.ajaxSuccessHandler;
		}
		var gridConfig = {
			ui:customUi,
			data:dataConfig,
			columns:listData.field,
			id:listData.id,
		};
		if(listData.listExpression){
			gridConfig.ui.listExpression = listData.listExpression;
		}
		gridConfig.ui.isHaveEditDeleteBtn = typeof(listData.isHaveEditDeleteBtn) == 'boolean' ? listData.isHaveEditDeleteBtn : false;
		gridConfig.ui.isCheckSelect = typeof(listData.isCheckSelect) == 'boolean' ? listData.isCheckSelect : false;
		var vueObj = NetstarBlockList.init(gridConfig);
	}
	function componentsBlockListPanelInit(listArray){
		for(var listI=0; listI<listArray.length; listI++){
			componentBlockListInit(listArray[listI]);
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
	//主表初始化完成事件
	function mainListCompleteHandler(){
		var gridConfig = mainListManager.config;
		var queryConfig = mainListManager.quickquery.config;
		function commonConfirmQueryHandler(_configObj){
			var formId = _configObj.formId;
			var gridId = _configObj.gridId;
			var formJson = NetstarComponent.getValues(formId);
			var currentData = getCurrentData(gridId);
			delete currentData.selectedList;
			if(formJson.filtermode == 'quickSearch'){
				if(formJson.filterstr){
					currentData.searchType = formJson.filtermode;
					currentData.keyword = formJson.filterstr;
				}
			}else{
				var queryConfig = NetstarComponent.config[formId].config[formJson.filtermode];
				if(!$.isEmptyObject(queryConfig)){
					if(formJson[formJson.filtermode]){
						if(queryConfig.type == 'business'){
							switch(queryConfig.selectMode){
								case 'single':
									currentData[formJson.filtermode] = formJson[formJson.filtermode][queryConfig.id];
									break;
								case 'checkbox':
									currentData[formJson.filtermode] = formJson[formJson.filtermode][0][queryConfig.id];
									break;
							}
						}else{
							currentData[formJson.filtermode] = formJson[formJson.filtermode];
						}
					}
					if(typeof(formJson[formJson.filtermode])=='number'){
						currentData[formJson.filtermode] = formJson[formJson.filtermode];
					}
					if(queryConfig.type == 'dateRangePicker'){
						var startDate = formJson.filtermode+'Start';
						var endDate = formJson.filtermode+'End';
						currentData[startDate] = formJson[startDate];
						currentData[endDate] = formJson[endDate];
					}
				}else{
					if(formJson.filterstr){
						currentData[formJson.filtermode] = formJson.filterstr;
					}
				}
			}
			NetStarGrid.configs[gridId].vueObj.page.start = 0;
			NetStarGrid.configs[gridId].vueObj.page.length = 10;
			NetStarGrid.refreshById(gridId,currentData);
		}
		function confirmQuickQueryHandler(ev){
			var $this = $(this);
			var containerid = $this.attr('containerid');
			var gridId = containerid.substring(6,containerid.length);
			commonConfirmQueryHandler({formId:containerid,gridId:gridId});
		}
		function quickqueryPanelInit(){
			var formJson = {
				id:queryConfig.id,
				formStyle:'pt-form-normal',
				plusClass:'pt-custom-query',
				isSetMore:false,
				form:queryConfig.queryForm
			};
			formJson.completeHandler = function(obj){
			var buttonHtml = '<div class="pt-btn-group">'
							+'<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" containerid="'+formJson.id+'"><i class="icon-search"></i></button>'
						+'</div>';
			var $container = $('#'+formJson.id);
			if($('button[containerid="'+formJson.id+'"]').length > 0){
				$('button[containerid="'+formJson.id+'"]').remove();
			}
			$container.append(buttonHtml);
			$('button[containerid="'+formJson.id+'"]').off('click',confirmQuickQueryHandler);
			$('button[containerid="'+formJson.id+'"]').on('click',confirmQuickQueryHandler);
		}
		var component2 = NetstarComponent.formComponent.getFormConfig(formJson);
		for(var component in component2.component){
			var elementConfig = component2.component[component];
			elementConfig.methods.inputEnter = function(event){
				if(elementConfig.isShowDialog&&typeof(elementConfig.returnData)=="object"&&typeof(elementConfig.returnData.documentEnterHandler)=='function'){
					elementConfig.returnData.documentEnterHandler();
				}else{
					var elementId = $(event.currentTarget).attr('id');
					this.blur();
					var formId = $(this.$el).closest('.pt-form-body').attr('id');
					elementId = elementId.substring(formId.length+1,elementId.length);
					formId = formId.substring(5,formId.length);
					var elementComponentConfig = NetstarComponent.config[formId].config[elementId];
					if(elementComponentConfig.type == 'businessSelect'){
						var vueConfig = NetstarComponent.config[formId].vueConfig[elementId];
						NetstarComponent.businessSelect.searchByEnter(elementComponentConfig, vueConfig, function(context, data){
							var plusData = data.plusData;
							var _config = context.config ? context.config : NetstarComponent.config[formId].config[plusData.componentId];
							var _vueConfig = context.vueConfig ? context.vueConfig : NetstarComponent.config[formId].vueConfig[plusData.formID];
							_vueConfig.loadingClass = '';
							if(data.success){
								var dataSrc = _config.search.dataSrc;
								var value = data[dataSrc];
								if($.isArray(value)&&value.length==1){
									_vueConfig.setValue(value); // 赋值
								}
								var gridId = formId.substring(6,formId.length);
								var templateId = gridId.substring(0,gridId.lastIndexOf('-list'));
								if(templateId){
									config = NetstarTemplate.templates.docListViewer.data[templateId].config;
								}
								commonConfirmQueryHandler({gridId:gridId,formId:formId});
							}
						});
					}else if(elementComponentConfig.type == 'business'){
						var vueConfig = NetstarComponent.config[formId].vueConfig[elementId];
						NetstarComponent.business.searchByEnter(elementComponentConfig, vueConfig, function(context, data){
							var plusData = data.plusData;
							var _config = context.config ? context.config : NetstarComponent.config[formId].config[plusData.componentId];
							var _vueConfig = context.vueConfig ? context.vueConfig : NetstarComponent.config[formId].vueConfig[plusData.formID];
							_vueConfig.loadingClass = '';
							if(data.success){
								var dataSrc = _config.search.dataSrc;
								var value = data[dataSrc];
								if($.isArray(value)&&value.length==1){
									_vueConfig.setValue(value); // 赋值
								}
								var gridId = formId.substring(6,formId.length);
								var templateId = gridId.substring(0,gridId.lastIndexOf('-list'));
								if(templateId){
									config = NetstarTemplate.templates.docListViewer.data[templateId].config;
								}
								commonConfirmQueryHandler({gridId:gridId,formId:formId});
							}
						});
					}else{
						var gridId = formId.substring(6,formId.length);
						var templateId = gridId.substring(0,gridId.lastIndexOf('-list'));
						if(templateId){
							config = NetstarTemplate.templates.docListViewer.data[templateId].config;
						}
						commonConfirmQueryHandler({gridId:gridId,formId:formId});
					}
					/*this.blur();
					var formId = $(this.$el).closest('.pt-form-body').attr('id');
					formId = formId.substring(5,formId.length);
					var gridId = formId.substring(6,formId.length);
					commonConfirmQueryHandler({formId:formId,gridId:gridId});*/
				}
			}
		}
		NetstarComponent.formComponent.init(component2,formJson);
		}
		function quickQueryHtml(){
			var contidionHtml = '<div class="pt-panel pt-grid-header">'		
									+'<div class="pt-container">'
										+'<div class="pt-panel-row">'
											+'<div class="pt-panel-col" id="'+queryConfig.id+'"></div>'
										+'</div>'
									+'</div>'
								+'</div>';
			$('#'+gridConfig.id).prepend(contidionHtml);
			quickqueryPanelInit();
		}
		if(!$.isEmptyObject(queryConfig)){
			quickQueryHtml();
		}
	}
	//切换详情表的tab
	function detailListTabHandler(ev){
		var $this = $(this);
		var $li = $this.closest('li');
		var id = $this.attr('ns-href-id');
		var $dom = $('#'+id).closest('.pt-tab-content');
		$li.addClass('current');
		$li.siblings().removeClass('current');
		$dom.addClass('current');
		$dom.siblings().removeClass('current')
	}
	//改变起始页
	function isLengthChangeAfterHandler(data){
		/*
			*tableId 表格id
		*/
		//公式  起码页 = 页码*显示条数
	}
	//改变行条数
	function pageLengthChangeHandler(data){
		/*
			*tableId 		表格id
			*pageLength		当前显示的条数
		*/
		currentQueryParams.count = data.pageLength;
		refreshTableData(data.gridId);
	}

	/*  参数来源

		* 触发行事件 
		* 底部按钮操作
	*/

	//处理ajax针对dataFormat  dataLevel 参数格式的数据
	function getAjaxConfig(ajaxConfig,ajaxData,_optionsConfig){
		var _ajaxConfig = $.extend(true, {}, ajaxConfig);
		var _ajaxData = $.extend(true,{},ajaxData);
		config = NetstarTemplate.templates.docListViewer.data[_optionsConfig.templateId].config;
		var gridConfig = config.mainDataConfig;//主表配置
		var panelData = getCurrentData(gridConfig.id);//面板参数
		var currentData = panelData;//当前要处理的值
		var paramsSource = 'panel';//默认参数来源于面板
		var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
		if(!$.isEmptyObject(_optionsConfig)){
			switch(_optionsConfig.source){
				case 'component':
					//行事件
					delete currentData.list;
					//currentData.vo = _ajaxData;
					nsVals.extendJSON(currentData,_ajaxData);
					paramsSource = 'component';
					break;
			}
		}
		var returnAjaxData = $.extend(true,{},currentData);
		//处理地址
		if (_ajaxConfig.src) {
			_ajaxConfig.url = _ajaxConfig.src;
			delete _ajaxConfig.src;
		}
		switch(_ajaxConfig.dataFormat){
			case 'normal':
				//判断当前是否定义了转换格式
				//if(_ajaxConfig.contentType == "application/json; charset=utf-8"){
					//returnAjaxData = JSON.stringify(returnAjaxData);
				//}
				break;
			case 'id':
				//入参格式是id则当前模板只有在操作主表行数据的时候才存在
				//且入参格式是当前模板的pageParam加上当前主表的主键id
				if(paramsSource == 'component'){
					returnAjaxData = $.extend(true,{},config.pageParam);
					returnAjaxData.id = _ajaxData[gridConfig.idField];
				}else{
					//当前配置参数无法进行转换
				}
				break;
			case 'ids':
				//ids只支持触发在底部按钮上
				returnAjaxData = $.extend(true,{},config.pageParam);
				if($.isArray(currentData.list)){
					var ids = [];
					for(var listI=0; listI<currentData.list.length; listI++){
						ids.push(currentData.list[listI][gridConfig.idField]);
					}
					returnAjaxData.ids = ids.join(',');
				}
				break;
			case 'object':
			default:
				//判断当前是否定义了传送部分参数的提取
				if(!$.isEmptyObject(_ajaxConfig.data)){
					returnAjaxData = nsVals.getVariableJSON(_ajaxConfig.data,returnAjaxData);
				}
				break;
		}

		//清空空值
		returnAjaxData = nsServerTools.deleteEmptyData(returnAjaxData);
		_ajaxConfig.data = returnAjaxData; //赋值data 
		//根据dataFormat 判断是否需要定义contentType
		if(_ajaxConfig.contentType){
			if(_ajaxConfig.contentType == "application/json"){
				_ajaxConfig.contentType = "application/json; charset=utf-8";
			}
		}else{
			//没有定义走默认
			_ajaxConfig.contentType = 'application/json; charset=utf-8';
		}
		/*switch(_ajaxConfig.dataFormat){	
			case 'id':
			case 'normal':
				break;
			case 'custom':
				break;
			case 'object':
			case 'list':
			default:
				//_ajaxConfig.data = JSON.stringify(returnAjaxData);
				_ajaxConfig.contentType = "application/json; charset=utf-8";
				break;
		}*/
		return _ajaxConfig; 
	}


	//获取详情表数据
	function getDetailsData(data,_gridConfig){
		// data
		if(typeof(data)=="undefined"||$.isEmptyObject(data)){
			// 主表没有选中数据 lyw 20190226
			return ;
		}
		if(!$.isEmptyObject(_gridConfig)){
			var templateId;
			switch(_gridConfig.type){
				case 'blockList':
					templateId = _gridConfig.id.substring(0,_gridConfig.id.lastIndexOf('-blockList'))
					break;
				case 'table':
				case 'list':
				case 'default':
					templateId = _gridConfig.id.substring(0,_gridConfig.id.lastIndexOf('-list'))
					break;
			}
			if(NetstarTemplate.templates.docListViewer.data[templateId].config.components.length > 1){
				detailListManager = NetstarTemplate.templates.docListViewer.data[templateId].config.detailListManager;
			}
		}
		if(!$.isEmptyObject(detailListManager.tab)){
			var ajaxOptions = getAjaxConfig(detailListManager.tab.ajax,data,{source:'component',templateId:templateId});
			NetStarUtils.ajax(ajaxOptions,function(res){
				//获取ajax返回结果
				if(res.success){
					//调用ajax成功
					var resData = res.data;
					//如果返回的不是数组，可能是空数组
					if($.isEmptyObject(resData)){
						resData = {};
					}
					var keyFieldJson = detailListManager.keyField;
					for(var gridId in keyFieldJson){
						if($.isArray(resData[keyFieldJson[gridId]])){
							NetStarGrid.resetData(resData[keyFieldJson[gridId]], gridId);
						}
					}
				}else{
					var keyFieldJson = detailListManager.keyField;
					for(var gridId in keyFieldJson){
						NetStarGrid.resetData([],gridId);
					}
				}
			},true)
		}
	}
	//行选中
	function rowSelectedHandler(data,rows, _vueData, gridConfig){
		//console.log(data)
		var templateId = gridConfig.id.substring(0,gridConfig.id.lastIndexOf('-list'));
		config = NetstarTemplate.templates.docListViewer.data[templateId].config;
		NetStarUtils.setBtnsDisabled(config.componentsConfig.btns,data);
		//getDetailsData(data,gridConfig);
	}
	//设置按钮是否禁用
	//行双击
	function rowDoubleSelectHandler(data){
		if(typeof(componentConfig.doubleClickHandler)=='function'){
			componentConfig.doubleClickHandler(data);
		}
	}
	//获取主表数据选中值
	function getSelectedData(gridId){
		/*
			*gridId string grid容器id
		*/
		var selectedData;
		if(NetStarGrid.configs[gridId].original.ui.isCheckSelect){
			selectedData = NetStarGrid.getCheckedData(gridId);
			if(selectedData.length == 0){
				selectedData = NetStarGrid.getSelectedData(gridId);
			}
		}else{
			selectedData = NetStarGrid.getSelectedData(gridId);
		}
		return selectedData;
	}
	//获取当前值
	function getCurrentData(_gridId){
		var gridConfig = mainListManager.config;
		if(_gridId){
			var templateId = _gridId.substring(0,_gridId.lastIndexOf('-list'));
			config = NetstarTemplate.templates.docListViewer.data[templateId].config;
			gridConfig = config.mainDataConfig;
			//判断是否存在参数
			if(!$.isEmptyObject(config.pageParam)){
				nsVals.extendJSON(paramsData,config.pageParam);
			}
			if(!$.isEmptyObject(config.sourceVoParams)){
				paramsData.sourceVoParams = config.sourceVoParams;
			}
		}
		if(!$.isEmptyObject(gridConfig.ajax.data)){
			nsVals.extendJSON(paramsData,gridConfig.ajax.data);
		}
		var gridData = getSelectedData(gridConfig.id);
		var returnData = $.extend(true,{},paramsData);
		if($.isArray(gridData)){
			returnData.selectedList = gridData;
		}
		if(voManager.config.length > 0){
			var voData = {};
			var voArray = voManager.config;
			for(var voI=0; voI<voArray.length; voI++){
				var id = voArray[voI].id;
				var voJson = NetstarComponent.getValues(id);
				if(voArray[voI].keyField){
					voData[voArray[voI].keyField] = voJson;
				}else{
					nsVals.extendJSON(voData,voJson);
				}
			}
			if(!$.isEmptyObject(voData)){
				returnData.queryVoParams = voData;
			}
		}
		return returnData;
	}
	function mainDbActionPanelInit(){
		//判断是否存在isMainDbAction 绑定在双击事件的按钮
		var tableRowBtnsArray = mainListManager.config.tableRowBtns;
		if($.isArray(tableRowBtnsArray)){
			for(var rowBtnI=0; rowBtnI<tableRowBtnsArray.length; rowBtnI++){
				var btnData = tableRowBtnsArray[rowBtnI];
				var functionConfig = btnData.functionConfig;
				var isMainDbAction = typeof(functionConfig.isMainDbAction)=='boolean' ? functionConfig.isMainDbAction : false;
				if(isMainDbAction){
					mainDbActionConfig = $.extend(true,{},btnData);
					break;
				}
			}
		}
	}

	//组件面板方法初始化
	function componentsPanelInit(){

		//判断是否存在isMainDbAction 绑定在双击事件的按钮
		mainDbActionPanelInit();

		if(componentsConfig.vo.length > 0){
			//存在vo面板
			componentsVoPanelInit(componentsConfig.vo);
		}

		if(componentsConfig.list.length > 0){
			//主表
			var isUseMessageState = false;
			if(paramsData.activeityId || paramsData.processId || paramsData.activityName){
				//如果当前界面存在流程id 或者存在活动id
				isUseMessageState = true;
			}
			var customUi = {
				height:mainListHeight,
				isCheckSelect:true,
				selectMode:'single',
				completeHandler:mainListCompleteHandler,
				pageChangeAfterHandler:isLengthChangeAfterHandler,
				pageLengthChangeHandler:pageLengthChangeHandler,	
				rowdbClickHandler:rowDoubleSelectHandler,
				selectedHandler:rowSelectedHandler,
				defaultSelectedIndex:0,//默认选中第一行
				pageLengthDefault:10,
				isUseMessageState:isUseMessageState,
				ajaxSuccessHandler:function(resData){	
					//ajax完成事件
				},
				//重绘事件
				drawHandler:function(_vueData){
					var gridId = _vueData.$options.id;
					var templateId = gridId.substring(0,gridId.lastIndexOf('-list'));
					config = NetstarTemplate.templates.docListViewer.data[templateId].config;
					var rowsData = _vueData.rows;
					var originalRows = _vueData.originalRows;
					var grid = NetStarGrid.configs[gridId];
					if($.isArray(rowsData)){
						var selectedIndex = -1;
						var startI=0;
						if(grid.gridConfig.data.isServerMode == false){
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
							var data = originalRows[selectedIndex+startI];
							var btnsArray = config.componentsConfig.btns;
							//查找按钮是否设置了禁用
							NetStarUtils.setBtnsDisabled(btnsArray,data);
							getDetailsData(originalRows[selectedIndex+startI],config.mainDataConfig);
						}else{
							var keyFieldJson = config.detailListManager.keyField;
							for(var listId in keyFieldJson){
								NetStarGrid.resetData([], listId);
							}
						}
						//需要判断按钮的来源来决定按钮是否应该处于禁用状态 sjj 20190423
						var isDisabled = false;
						if(rowsData.length == 0){
							//无数据 此时需要判断按钮的来源来决定按钮是否应该处于禁用状态 sjj 20190423 
							isDisabled = true;
						}
						NetStarUtils.setBtnsDisabledByRequestSource(config.componentsConfig.btns,isDisabled);
					}
				}
			};
			if(!$.isEmptyObject(mainListManager.quickquery.config)){
				customUi.query = mainListManager.quickquery.config;
			}
			componentsListPanelInit(componentsConfig.list,customUi);
		}	
		//componentsConfig.tab
		if(componentsConfig.tab.vo.length > 0){
			//存在vo面板
			componentsVoPanelInit(componentsConfig.tab.vo);
		}	
		if(componentsConfig.tab.list.length > 0){
			//详情表
			//存在list面板
			var customUi = {
				isCheckSelect:false,
				height:detialListHeight,
				pageLengthDefault:10,
				defaultSelectedIndex:0,//默认选中第一行
				selectMode:'single',
			};
			componentsListPanelInit(componentsConfig.tab.list,customUi);

			var $lis = $('#'+detailListPanelId+' ul.pt-tab-list-components-tabs > li');
			$lis.children('a').off('click',detailListTabHandler);
			$lis.children('a').on('click',detailListTabHandler);
		}	
		if(componentsConfig.btns.length > 0){
			//存在按钮
			componentsBtnPanelInit(componentsConfig.btns);
		}
		if(componentsConfig.blockList.length > 0){
			componentsBlockListPanelInit(componentsConfig.blockList);
		}
	}
	//初始化容器面板
	function initContainer(){
		var titleHtml = '';//标题
		var voHtml = '';//自定义vo
		var mainListHtml = '';//主表
		var detailListHtml = '';//详表
		var btnsHtml = '';//按钮
		var titleHeight = 0;
		var voHeight = 0;
		if(config.title){
			//定义了标题输出
			titleHeight = 20;
			var titleHtml = '<div class="pt-title pt-page-title"><h4>'+config.title+'</h4></div>';
			titleHtml = '<div class="pt-main-row doclistviewer-title">'
								+'<div class="pt-main-col">'
									+'<div class="pt-panel pt-panel-header">'
										+'<div class="pt-container">'
											+'<div class="pt-panel-row">'
												+'<div class="pt-panel-col">'
													+titleHtml
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>';
		}
		if(voManager.config.length > 0){
			//存在组件vo
			var voArray = voManager.config;
			for(var voI=0; voI<voArray.length; voI++){
				var voData = voArray[voI];
				var classStr = 'component-'+voData.type;//class名称
				var position = voData.position;
				var isPostionVo = true; //默认输出在vo层上
				if(position){
					//定义了位置
					classStr += ' '+position;
					if(position != 'query-vo'){
						//不是输出在vo层上
						isPostionVo = false;
					}
				}
				var html = '<div class="'+classStr+'" id="'+voData.id+'"></div>';
				voHtml += '<div class="pt-main-row doclistviewer-vo">'
								+'<div class="pt-main-col">'
									+NetstarTemplate.getPanelHtml(html)
								+'</div>'
							+'</div>';
				componentsConfig.vo.push({
					id:voData.id,
					form:voData.field
				});

				voHeight += 60;
			}
		}
		if(!$.isEmptyObject(mainListManager.config)){
			//存在主表
			var classStr = 'component-'+mainListManager.config.type;//class名称
			var position = mainListManager.config.position;
			if(position){
				classStr += ' '+position;
			}
			var html = '<div class="'+classStr+'" id="'+mainListManager.config.id+'"></div>';
			if(config.mode == 'horizontal'){
				mainListHtml = //'<div class="pt-main-row doclistviewer-list" id="'+mainListPanleId+'">'
										'<div class="pt-main-col limsreg-left">'
											+'<div class="pt-panel">'
												+'<div class="pt-container">'
													+html
												+'</div>'
											+'</div>'
										+'</div>'
									//+'</div>';
			}else{
				mainListHtml = '<div class="pt-main-row doclistviewer-list" id="'+mainListPanleId+'">'
									+'<div class="pt-main-col">'
										+'<div class="pt-panel">'
											+'<div class="pt-container">'
												+html
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>';
			}
		}
		if(!$.isEmptyObject(detailListManager.tab)){
			if(detailListManager.config.length > 0){
				//存在详情表信息
				var detailListArray = detailListManager.config;
				var tabLiHtml = '';
				var tabContentHtml = '';
				for(var listI=0; listI<detailListArray.length; listI++){
					var listData = detailListArray[listI];
					var classStr = 'component-'+listData.type+' pt-nav-item';//class名称
					var tabContainerId = listData.id;
					componentsConfig.tab.list.push($.extend(true,{},listData));
					if(listData.position){
						//定义了位置
						classStr += ' '+listData.position;
					}
					var activeClassStr = '';
					if(listI == 0){activeClassStr = 'current';}
					tabLiHtml += '<li class="'+classStr+' '+activeClassStr+'" ns-index="'+listI+'">'
									+'<a href="javascript:void(0);" ns-href-id="'+tabContainerId+'">'
										+listData.title
									+'</a>'
								+'</li>';
					tabContentHtml += '<div class="pt-tab-content '+activeClassStr+'">'
										+'<div class="pt-tab-components" id="'+tabContainerId+'"></div>'
									+'</div>';
				}
				var tabHtml = '<div class="pt-tab-components-tabs pt-tab">'
									+'<div class="pt-container">'
										+'<div class="pt-tab-header">'
											+'<div class="pt-nav">'
												+'<ul class="pt-tab-list-components-tabs">'
													+tabLiHtml
												+'</ul>'
											+'</div>'
										+'</div>'
										+'<div class="pt-tab-body">'
											+tabContentHtml
										+'</div>'
									+'</div>'
								+'</div>';
				var detailPtClassStr = '';
				var isHorizontal = false;
				var dId = '';
				if(config.mode == 'horizontal'){
					isHorizontal = true;
					detailPtClassStr = 'limsreg-right';
					dId = detailListPanelId;
				}
				var detailListHtml = '<div class="pt-main-col '+detailPtClassStr+'">'
											+'<div class="pt-panel">'
												+'<div class="pt-container">'
													+'<div calss="pt-panel-row">'
														+'<div class="pt-panel-col" id="'+dId+'">'
															+tabHtml
														+'</div>'
													+'</div>'
												+'</div>'
											+'</div>'
										+'</div>';
				if(isHorizontal == false){
					detailListHtml = '<div class="pt-main-row doclistviewer-detaillist" id="'+detailListPanelId+'">'
										+detailListHtml
									+'</div>';
				}
			}
		}
		if(componentsConfig.btns.length > 0){
			var btnsArray = componentsConfig.btns;
			var buttonHtml = '';
			for(var btnI=0; btnI<btnsArray.length; btnI++){
				var btnData = btnsArray[btnI];
				var classStr = 'component-btns';//class名称
				var containerClassStr = '';
				if(btnData.position){
					//定义了位置
					containerClassStr = btnData.position;
					if(btnData.position == 'footer-right'){
						containerClassStr = 'text-right';
					}
				}
				buttonHtml += '<div class="pt-panel-col '+containerClassStr+'">'
								+'<div class="'+classStr+'" id="'+btnData.id+'"></div>'
							+'</div>';
			}
			btnsHtml = '<div class="pt-main-row doclistviewer-btns">'
							+'<div class="pt-main-col">'
								+'<div class="pt-panel">'
									+'<div class="pt-container">'
										+'<div class="pt-panel-row">'
											+buttonHtml
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}
		var contentHtml = mainListHtml+detailListHtml;
		if(config.mode == 'horizontal'){
			contentHtml = '<div class="pt-main-row doclistviewer-list" id="'+mainListPanleId+'">'
								+contentHtml
							+'</div>';
		}
		var pageHtml = titleHtml + voHtml + contentHtml + btnsHtml;
		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		var modeClassStr = config.mode;
		if(config.$container){
			config.$container.html('<div class="pt-main doclistviewer '+modeClassStr+'" id="'+config.id+'">'+pageHtml+'</div>');//输出面板
		}else{
			$container.prepend('<div class="pt-main doclistviewer '+modeClassStr+'" id="'+config.id+'">'+pageHtml+'</div>');//输出面板
		}
		componentsPanelInit();//组件初始化
		/*if(!$.isEmptyObject(detailListManager.tab)){
			//绑定箭头
			nsUI.dragWindows({
				parentContainerId: config.id,
				ltContainerId:mainListPanleId,
				rbContainerId:detailListPanelId,  
				closePosition: "bottom"
			});
		}*/
	}
	//设置默认值
	function setDefault(){
		config.mode = typeof(config.mode)=='string' ? config.mode : 'vertical';//默认纵向排列
		if(config.mode == ''){
			config.mode = 'vertical';
		}
		mainListPanleId = 'mainlist-'+config.id;
		detailListPanelId = 'detaillist-'+config.id;
		for(var componentI=0; componentI<config.components.length; componentI++){
			var componentData = $.extend(true,{},config.components[componentI]);
			var containerId = config.id+'-'+componentData.type+'-'+componentI;//定义容器id
			componentData.id = containerId; 
			var isRoot = false;//是否是根节点
			if(componentData.hide){
				var type = 'table';
				if(componentData.type == 'vo'){
					type = 'form';
				}
				NetstarTemplate.setFieldHide(type,componentData.field,componentData.hide);
			}
			if(componentData.parent == 'root'){
				//当前组件是主表需要把主表配置参数存起来
				mainListManager.config = componentData;
				config.mainDataConfig = componentData;
				var tableColumnArray = mainListManager.config.field;
				var gridQueryPanelConfig = NetStarUtils.getListQueryData(tableColumnArray,{id:mainListManager.config.id,value:''});
				mainListManager.quickquery.config = gridQueryPanelConfig;

				componentsConfig.list.push(componentData);
				isRoot = true;
			}
			switch(componentData.type){
				case 'tab':
						//如果当前类型是tab，则要记录存放当前有哪些详情表
						if(typeof(componentData.field)=='string'){
							//当前field必须是字符串类型，并且是存在值的
							if(componentData.field != 'undefined'){
								//排除字符串定义的undefined
								detailListManager.tab = componentData;
							}
						}else{
							console.error('存在tab类型，但未定义field');
						}
					break;
				case 'vo':
					voManager.config.push(componentData);
					break;
				case 'list':
					if(!isRoot){
						//不是根节点
						detailListManager.keyField[containerId] = componentData.keyField;
						detailListManager.config.push(componentData);
					}
					break;
				case 'btns':
					componentsConfig.btns.push({
						id:containerId,
						pageId:config.id,
						package:config.package,
						isShowTitle:false,
						position:componentData.position,
						btns:componentData.field
					});
					break;
				case 'blockList':
					if(componentData.parent != 'root'){
						componentsConfig.blockList.push(componentData);
					}
			}
		}
	}
	function clearVals(){
		componentsConfig = {
			vo:[],
			list:[],
			tab:{
				vo:[],
				list:[]
			},
			blockList:[],
			btns:[]
		};//根据不同的type类型去存放配置参数
		mainListManager = {
			data:{},//数据
			config:{},//相关参数
			quickquery:{
				queryMode:'quickSearch',// 检索模式  默认快速查询
				config:{},//配置参数
			},//快速查询
		};//主表信息管理数据
		detailListManager = {
			config:[],//配置参数
			keyField:{},//详细表的数据源 list名字
			tab:{},//tab配置参数
		};//详细表管理数据
		voManager = {
			config:[],//配置参数
		};//vo 配置管理数据
		mainListPanleId;//主表面板id
		detailListPanelId;//详情表面板id
		componentConfig = {};//组件调用的配置参数
		commonHeight = 0; //模板公用部分的高度
		mainListHeight = 0;//主表的高度
		detialListHeight = 0;//详情表的高度
		paramsData = {};
	}
	//初始化
	function init(_config){
		config = _config;
		//第一次执行初始化模板
		if(typeof(NetstarTemplate.templates.docListViewer.data)=='undefined'){
			NetstarTemplate.templates.docListViewer.data = {};  
		}
		originalConfig = $.extend(true,{},config);//保存原始值
		//记录config
		NetstarTemplate.templates.docListViewer.data[config.id] = {
			original:originalConfig,
			config:config
		}
		clearVals();
		//判断是否存在参数
		if(!$.isEmptyObject(config.pageParam)){
			delete config.pageParam.parentSourceParam;
			nsVals.extendJSON(paramsData,config.pageParam);
		}
		if(!$.isEmptyObject(config.sourceVoParams)){
			paramsData.sourceVoParams = config.sourceVoParams;
		}

		var pageHeight = 0;
		for(var name in NetstarTopValues){
			pageHeight += NetstarTopValues[name].height;
		}
		if(config.title){
			//biaotigaodu
			pageHeight += 40;
		}
		setDefault();//设置默认值
		
		commonHeight = $(window).outerHeight()-pageHeight;
		if(voManager.config.length > 0){
			commonHeight -= 100;
		}
		var height = parseInt(commonHeight/2);
		mainListHeight = height;
		
		if(detailListManager.config.length == 0){
			mainListHeight = commonHeight;
		}
		detialListHeight = height - 50;
		if(config.mode == 'horizontal'){
			mainListHeight = commonHeight;
			detialListHeight = commonHeight - 30;
		}
		config.detailListManager = detailListManager;
		config.componentsConfig = componentsConfig;
		initContainer();//初始化容器面板
	}
	//可进行自定义调用方法
	function componentInit(_config,_componentConfig){
		mainListManager.quickquery.queryMode = 'componentSearch';//查询模式组件查询

		$('button[type="button"]').blur();//点击按钮应该失去焦点

		componentConfig = _componentConfig;
		config = $.extend(true,{},_config);

		var packageName = config.package.replace(/\./g, '-');
		config.id = 'nstemplate-layout-' + packageName.replace(/-/g, '-');
		setDefault();
		switch(componentConfig.componentClass){
			case 'list':
				componentsConfig.list[0].id = componentConfig.container;
				mainListManager.config.id = componentConfig.container;
				componentsPanelInit();
				break;
		}
	}
	//重置操作
	function resetData(templateId){
		/*
			*templateId  string  模板id
		*/
		var templatesConfig = NetstarTemplate.templates.docListViewer.data[templateId].original;
		var commonHeight = getContainerHeight(templatesConfig);
	}
	//刷新操作
	function refreshData(data,sourceData){
		/*
			* data object 接受参
				* idField 主键id 
				* package 包名
				templateId string
			*sourceData 来源data
		*/
		var config = NetstarTemplate.templates.docListViewer.data[data.templateId].config;
		var mainGridId = config.mainDataConfig.id;
		var rows = NetStarGrid.configs[mainGridId].vueObj.rows;
		var existEditIndex = -1;
		for(var rowI=0; rowI<rows.length; rowI++){
			if(rows[rowI][config.mainDataConfig.idField] == sourceData.id){
				existEditIndex = rowI;
				break;
			}
		}
		NetStarGrid.refreshById(mainGridId);
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
		getCurrentData:						getCurrentData,					//获取当前值
		refreshData:						refreshData,					//刷新
		componentsPanelInit:				componentsPanelInit,
		refreshByConfig:					function(_config){
			config = _config;
			setDefault();
			componentsConfig = config.componentsConfig;
			//判断是否存在参数
			paramsData = {};
			if(!$.isEmptyObject(config.pageParam)){
				delete config.pageParam.parentSourceParam;
				paramsData = config.pageParam;
			}  
			NetStarGrid.refreshById(config.mainDataConfig.id);
			//this.componentsPanelInit();//组件初始化
		}
	}
})(jQuery)
/******************** 单据详情 end ***********************/