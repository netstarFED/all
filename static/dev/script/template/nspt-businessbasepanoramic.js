/*
	* @Author: netstar.sjj
	* @Date: 2019-10-10 11:45:00
	*左侧tree  右侧 list+tab(多个list)
	* 上list 下tab(多个list)
*/
NetstarTemplate.templates.businessbasePanoramic = (function(){
	//根据组件配置的readonlyExpression设置只读操作
	function setReadonlyByReadonlyExpression(_config,_compareData){
		var componentByBtns = _config.componentsConfig.btns;
		var tempalteParams = $.extend(true,{},_compareData);
		if(!$.isEmptyObject(_config.pageParam)){
		   tempalteParams.page = _config.pageParam;
		}
		for(btnId in componentByBtns){
		   var btnConfig = componentByBtns[btnId];
		   if(btnConfig.readonlyExpression){
			  var readonlyExpression = JSON.parse(btnConfig.readonlyExpression);
			  var expressionObj = {};
			  for(var expValue in readonlyExpression){
				 var valueExpression = readonlyExpression[expValue];
				 var currentReadonly = NetstarTemplate.commonFunc.getBooleanValueByExpression(tempalteParams,valueExpression);
				 var englishNameArr = expValue.split(',');
				 for(var nameI=0; nameI<englishNameArr.length; nameI++){
					//根据定义的按钮英文名字分别存储当前按钮所处的状态
					expressionObj[englishNameArr[nameI]] = currentReadonly;
				 }
			  }
			  if(!$.isEmptyObject(expressionObj)){
				 //存在要设置的只读
				 var fieldArray = btnConfig.field;
				 for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
					var fieldData = fieldArray[fieldI];
					var functionConfig = fieldData.functionConfig ? fieldData.functionConfig : {};
					var englishName = functionConfig.englishName;
					if(typeof(expressionObj[englishName])=='boolean'){
					   var isDisabled = expressionObj[englishName];
					   if(isDisabled){
						  $('button[ns-field="'+englishName+'"]').attr('disabled',true);
					   }else{
						  $('button[ns-field="'+englishName+'"]').removeAttr('disabled');
					   }
					}
				 }
			  }
		   }
		}
	}
	/***************组件事件调用 start**************************** */
	function dialogBeforeHandler(data,templateId){
		data = typeof(data)=='object' ? data : {};
		var config = NetstarTemplate.templates.businessbasePanoramic.data[templateId].config;
		var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
		
		var operatorObject = controllerObj.operatorObject ? controllerObj.operatorObject : 'root';
		if(controllerObj.targetField){
			operatorObject = controllerObj.targetField;
		}
		var value;

		var currentOperatorGridConfig = {};
		if(!$.isEmptyObject(data.rowData)){
			value = data.rowData;//行内按钮直接获取当前操作行的值
		}else{
			if(operatorObject == 'root'){
				//按钮针对的是主表
				value = getSelectedDataByGridId(config.mainComponent.id);
				currentOperatorGridConfig = config.mainComponent;
			}else if(operatorObject == 'thisVo'){
				value = getSelectedDataByGridId(config.mainComponent.id);
				currentOperatorGridConfig = config.mainComponent;
				var detailTabValue = getSelectedDataByGridId(config.tabConfig.activeId);
				$.extend(detailTabValue,function(key,v){
					value[key] = v;
				})
			}else{
				value = getSelectedDataByGridId(config.tabConfig.activeId);
				currentOperatorGridConfig = config.tabConfig.components[config.tabConfig.activeId];
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
		var config = NetstarTemplate.templates.businessbasePanoramic.data[templateId].config;
		handlerObj.config = config;
		return handlerObj;
	}
	//ajax后置回调
	function ajaxAfterHandler(res,templateId,plusData){
		plusData = typeof(plusData)=='object' ? plusData : {};
		var config = NetstarTemplate.templates.businessbasePanoramic.data[templateId].config;	
		var targetField = plusData.targetField ? plusData.targetField : 'root';
		if(targetField == 'root'){
			refreshByGridconfig(config.mainComponent,config.package);
		}else{
			var mainSelectedData = getSelectedDataByGridId(config.mainComponent.id);
			var currentGridConfig = config.tabConfig.components[config.tabConfig.activeId];
			refreshGridDataByAjax(currentGridConfig,mainSelectedData);
		}
	}
	//跳转打开界面回调
	function loadPageHandler(){}
	//关闭打开界面回调
	function closePageHandler(){}
	/***************组件事件调用 end************************** */
	/****************事件调用 start**************************** */
		/**
		 * 1.tab中ajax的请求参数是根据主表当前选中值
		 * 2.所有组件按钮配置都可能存在defaultMode为editorDialog
		 * 3.根据list的id获取选中值
		 * 4.如果当前是treegrid 右侧列表入参是左侧节点的值
		 * 5.子表的数据是根据当前主表行状态刷新的数据
		 * 6.当前子表选中的活动id
		 * 7.树的点击事件
		*/
	//根据当前grid的配置项和包名刷新
	function refreshByGridconfig(_gridConfig,packageName,paramJson, isUseExistAjaxData){
		paramJson = typeof(paramJson)=='undefined' ? {} : paramJson;
		isUseExistAjaxData = typeof(isUseExistAjaxData) == "boolean" ? isUseExistAjaxData : true;
		var templateConfig = NetstarTemplate.templates.configs[packageName];
		var mainComponent = templateConfig.mainComponent;
		var tabComponents = templateConfig.tabConfig.components;
		var uiConfig = {};
		if(NetStarGrid.configs[mainComponent.id]){
			uiConfig = NetStarGrid.configs[mainComponent.id].gridConfig.ui;
		}
		if(!$.isEmptyObject(uiConfig.paramsData)){
			$.each(uiConfig.paramsData,function(k,v){
				if(typeof(paramJson[k])=='undefined'){
					paramJson[k] = v;
				}
			});
		}
		if(_gridConfig.id == mainComponent.id){
			//刷新主表
			if(!$.isEmptyObject(templateConfig.pageParam)){
				var pageFieldArr = ['processId','activityId','activityName','workItemId','workflowType','acceptFileIds'];
				for(var paramI=0; paramI<pageFieldArr.length; paramI++){
					if(templateConfig.pageParam[pageFieldArr[paramI]]){
						paramJson[pageFieldArr[paramI]] = templateConfig.pageParam[pageFieldArr[paramI]];
					}
				}
			}
			switch(templateConfig.mode){
				case 'treegrid':
					var treeNode = NetstarTemplate.tree.getSelectedNodes(templateConfig.treeConfig.id)[0];
					var ajaxParams = {id:treeNode.id};
					refreshGridDataByAjax(mainComponent,ajaxParams,paramJson);
					break;
				case 'listgrid':
					/***lyw20200316 原因刷新时原来的搜索参数依然在start****/
					if(isUseExistAjaxData){
						var gridConfig = NetStarGrid.configs[_gridConfig.id].gridConfig;
						var gridAjaxData = gridConfig.data.data;
						if(typeof(gridAjaxData) == "object" && !$.isEmptyObject(gridAjaxData)){
							paramJson = $.extend(false, paramJson, gridAjaxData);
						}

					}
					/***lyw20200316 原因刷新时原来的搜索参数依然在end****/
					NetStarGrid.refreshById(_gridConfig.id,paramJson);
					break;
			}
		}else if(tabComponents[_gridConfig.id]){
			//子表的刷新
			var paramsData = getSelectedDataByGridId(mainComponent.id);
			refreshGridDataByAjax(tabComponents[_gridConfig.id],paramsData);
		}
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
				NetstarTemplate.commonFunc.list.refresh(_gridConfig.id,rowsData);
			}else{
				nsalert('返回值为false','error');
			}
		},true)
	}
	//主表ajax完成事件
	function ajaxSuccessHandlerByMainGrid(resData){
		
	}
	//主表重绘事件
	function drawHandlerByMainGrid(_vueData){
		var gridId = _vueData.$options.id;
		var gridConfig = NetStarGrid.configs[gridId].gridConfig;
		var packageName = gridConfig.package;
		var templateConfig = NetstarTemplate.templates.configs[packageName];
		var activeId = templateConfig.tabConfig.activeId;//当前活动的tab id
		var currentGridConfig = templateConfig.tabConfig.components[activeId];
		
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
			var currentSelectedData = {};
			if(selectedIndex > -1){
				//存在选中行的值
				currentSelectedData = originalRows[selectedIndex+startI];
				refreshGridDataByAjax(currentGridConfig,originalRows[selectedIndex+startI]);
			}else{
				var keyFieldJson = templateConfig.tabConfig.components;
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
			NetStarUtils.setBtnsDisabledByRequestSource(templateConfig.mainBtnArray,isDisabled);
			if(isDisabled){
				for(var btnType in templateConfig.btnKeyFieldJson){
					if(btnType != 'root'){
						$('#'+templateConfig.btnKeyFieldJson[btnType].id+' button').attr('disabled',true);
						$('#'+templateConfig.tabConfig.id+' >li').attr('disabled',true);
					}
				}
			}else{
				for(var btnType in templateConfig.btnKeyFieldJson){
					if(btnType != 'root'){
						$('#'+templateConfig.btnKeyFieldJson[btnType].id+' button').removeAttr('disabled');
						$('#'+templateConfig.tabConfig.id+' >li').removeAttr('disabled');
					}
				}
			}

			//sjj 20200206 判断是否设置了readonlyExpresion hiddenExpression表达式的逻辑处理
			setReadonlyByReadonlyExpression(templateConfig,currentSelectedData);
		}
	}
	function clickHandlerByTree(data){
		//var packageName = $('#'+data.treeId).closest('.businessbasepanoramic').attr('ns-package');
		//var templateConfig = NetstarTemplate.templates.configs[packageName];
		var treeNode = data.treeNode;
		var packageName = data.config.package;
		var templateConfig = NetstarTemplate.templates.configs[packageName];
		var queryId = 'query-'+templateConfig.mainComponent.id;
		var formJson = NetstarComponent.getValues(queryId,false);
		var queryJson = {};
		if(formJson.filtermode == 'quickSearch'){
			if(formJson.filterstr){
				queryJson = {
					keyword:formJson.filterstr
				};
			}
		}else{
			var queryConfig = NetstarComponent.config[queryId].config[formJson.filtermode];
			if(!$.isEmptyObject(queryConfig)){
				if(formJson[formJson.filtermode]){
					if(queryConfig.type == 'business' && typeof(queryConfig.outputFields) == "undefined"){
						switch(queryConfig.selectMode){
							case 'single':
								queryJson[formJson.filtermode] = formJson[formJson.filtermode][queryConfig.idField];
								break;
							case 'checkbox':
								queryJson[formJson.filtermode] = formJson[formJson.filtermode][0][queryConfig.idField];
								break;
						}
					}else{
						queryJson[formJson.filtermode] = formJson[formJson.filtermode];
					}
				}
				if(typeof(formJson[formJson.filtermode])=='number'){
					queryJson[formJson.filtermode] = formJson[formJson.filtermode];
				}
				if(queryConfig.type == 'dateRangePicker'){
					var startDate = formJson.filtermode+'Start';
					var endDate = formJson.filtermode+'End';
					queryJson[startDate] = formJson[startDate];
					queryJson[endDate] = formJson[endDate];
				}
			}else{
				if(formJson.filterstr){
					queryJson[formJson.filtermode] = formJson.filterstr;
				}
			}
		}
		refreshGridDataByAjax(templateConfig.mainComponent,{id:treeNode.id},queryJson);
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
	function initComponent(_config){
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
				case 'tree':
					if(_config.mode == 'treegrid'){
						NetstarTemplate.commonFunc.tree.init(componentData);
					}	
					break;
			}
		}
		//tab切换事件
		if(_config.isTab){
			var $lis = $('#'+_config.tabConfig.id+' > li');
			//切换tab
			function changeActiveTab(ev){
				var $this = $(this);
				var $li = $this.closest('li');
				var id = $this.attr('ns-href-id');
				var $dom = $('#'+id).closest('.pt-tab-content');
				$li.addClass('current');
				$li.siblings().removeClass('current');
				$dom.addClass('current');
				$dom.siblings().removeClass('current');

				//当前活动的id
				var packageName = $this.closest('.businessbasepanoramic').attr('ns-package');
				var templateConfig = NetstarTemplate.templates.configs[packageName];
				templateConfig.tabConfig.activeId = id.substring(3,id.length);
				//刷新当前tab的数据
				//先根据组件id获取当前tab的配置信息
				var currentGridConfig = templateConfig.tabConfig.components[templateConfig.tabConfig.activeId];
				var mainSelectedData = getSelectedDataByGridId(templateConfig.mainComponent.id);
				refreshGridDataByAjax(currentGridConfig,mainSelectedData);
			}
			var activeId = $('#'+_config.tabConfig.id+' > li.current').children('a').attr('ns-href-id');
			activeId = activeId.substring(3,activeId.length);
			_config.tabConfig.activeId = activeId;
			$lis.children('a').off('click',changeActiveTab);
			$lis.children('a').on('click',changeActiveTab);
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
		/****************输出模板配置的自定义class start */
		var templateClassStr = '';
		if(_config.plusClass){
			//自定义了plusClass
			templateClassStr = _config.plusClass;
		}
		if(_config.mode){
			//当前模板展示模式
			templateClassStr +=' '+_config.mode;
		}
		/****************输出模板配置的自定义class end */
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
			_config.componentsConfig[componentData.type][componentData.id] = componentData;//根据id和类型存储组件信息值
			if(typeof(componentData.params)!='object'){
				componentData.params = {};
			}
			componentData.package = _config.package;
			var isBtnCompoent = false;//当前是否是按钮组件
			switch(componentData.type){
				case 'btns':
					isBtnCompoent = true;
					var operatorObject = componentData.operatorObject ? componentData.operatorObject : 'root';
					if(operatorObject == 'root'){
						_config.mainBtnArray.push($.extend(true,{},componentData));
					}
					_config.btnsArray.push($.extend(true,{},componentData));
					break;
				case 'tree':
					componentData.isSearch = typeof(componentData.isSearch)=='boolean' ? componentData.isSearch : true;
					componentData.clickHandler = clickHandlerByTree;
					componentData.height = _config.treeHeight;
					_config.treeConfig = componentData;//组件类型为tree
					break;
				case 'list':
				case 'blockList':
					if(componentData.keyField != 'root'){
						//子表
						componentData.isAjax = false;
						var defaultParams = {
							height:_config.gridHeight
						};
						$.each(defaultParams,function(key,value){
							componentData.params[key] = value;
						});
					}else{
						if(_config.mode == 'listgrid'){
							componentData.isAjax = true;
						}
						var defaultParams = {
							ajaxSuccessHandler:ajaxSuccessHandlerByMainGrid,
							drawHandler:drawHandlerByMainGrid,
							height:_config.gridHeight,
							isOpenQuery:true,//是否开启查询
							isOpenAdvanceQuery:true,//是否开启高级查询
							callBackFuncByQuery:function(_gridConfig,packageName,paramJson){
								refreshByGridconfig(_gridConfig,packageName,paramJson, false);
							}   
						};
						$.each(defaultParams,function(key,value){
							componentData.params[key] = value;
						});
					}
					break;
			}

			if(!isBtnCompoent){
				//按钮组件不存在idField所以排除
				_config.idFieldsNames['root.'+componentData.idField] = componentData.idField;//主键id
			}

			var isRoot = false;//当前组件是不是主表 模板组件中只能存在一个主表 其他都以tab形式展现
			//找到主表存储主表信息
			if(componentData.keyField == 'root'){
				//当前组件为主表
				_config.mainComponent = componentData;
				isRoot = true;
			}/*else{
				if($.isEmptyObject(componentData.parent) && !isBtnCompoent){
					//当前组件没有定义parent则当前组件为主表
					_config.mainComponent = componentData;
					isRoot = true;
				}
			}*/
			if(!isRoot && !isBtnCompoent && componentData.type!='tree'){
				if(!$.isArray(_config.tabConfig.title)){
					_config.tabConfig.title = [];
				}
				var titleStr = componentData.title ? componentData.title : componentData.id;//如果没有定义标题，标题以id形式展示
				_config.tabConfig.components[componentData.id] = componentData;//存储tab中的组件信息
				_config.tabConfig.title.push({
					title:titleStr,
					id:componentData.id,
					keyField:componentData.keyField
				});
			}
		}
		/***********循环components输出结构 end************************ */
		var containerHtml = '';
		
		var listHtml = '<div class="pt-panel businessbasepanoramic-grid-component" component-type="list" id="'+_config.mainComponent.id+'"></div>';//主表输出
		
		var btnHtml = '';//主表按钮输出
		if(_config.btnKeyFieldJson['root']){
			var btnConfig = _config.btnKeyFieldJson['root'];
			btnHtml = '<div class="pt-panel" component-type="mainbtns">'
							+'<div class="nav-form" id="'+btnConfig.id+'"></div>'
						+'</div>';
		}
		
		var tabHtml = '';//tab输出
		/***************输出tab结构 start********************************* */
		if($.isArray(_config.tabConfig.title)){
			_config.tabConfig.id = 'ul-tab-'+_config.id;
			var titleArr = _config.tabConfig.title;
			var tabLiHtml = '';
			var tabContentHtml = '';
			for(var titleI=0; titleI<titleArr.length; titleI++){
				var titleData = titleArr[titleI];
				var componentData = _config.tabConfig.components[titleData.id];
				var titleStr = titleData.title;
				var activeClassStr = '';
				if(titleI == 0){activeClassStr = 'current';}
				var classStr = 'component-list pt-nav-item';//class名称
				var aid = 'li-'+titleData.id;
				tabLiHtml += '<li class="'+classStr+' '+activeClassStr+'" ns-index="'+titleI+'" component-type="'+componentData.type+'">'
									+'<a href="javascript:void(0);" ns-href-id="'+aid+'">'
										+titleStr
									+'</a>'
								+'</li>';
				var tabBtnHtml = '';
				var btnClass = '';
				if(_config.btnKeyFieldJson[titleData.keyField]){
					var tabBtnConfig = _config.btnKeyFieldJson[titleData.keyField];
					tabBtnHtml = '<div class="nav-form pt-panel" component-type="tabbtns" id="'+tabBtnConfig.id+'"></div>';
					btnClass = 'hasbtn';
				}else{
					console.warn('该tab下无按钮配置,keyField为：'+titleData.keyField);
				}
				tabContentHtml += '<div class="pt-tab-content '+activeClassStr+'">'
									+'<div class="pt-tab-components '+btnClass+'" id="'+aid+'">'
										+tabBtnHtml
										+'<div id="'+titleData.id+'"></div>'
									+'</div>'
								+'</div>';
			}
			tabHtml =  '<div class="pt-tab-components-tabs pt-tab pt-tab-noboder">'
							+'<div class="pt-container">'
								+'<div class="pt-tab-header">'
									+'<div class="pt-nav">'
										+'<ul class="pt-tab-list-components-tabs" id="'+_config.tabConfig.id+'">'
											+tabLiHtml
										+'</ul>'
									+'</div>'
								+'</div>'
								+'<div class="pt-tab-body">'
									+tabContentHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}
		/***************输出tab结构 end********************************* */
		switch(_config.mode){
			case 'listgrid':
				//上下结构
				containerHtml = '<div class="pt-container">'
								+titleHtml
								+'<div class="pt-main-row">'
									+'<div class="pt-main-col">'
										+btnHtml+listHtml
									+'</div>'
								+'</div>'
								+'<div class="pt-main-row">'
									+'<div class="pt-main-col">'
										+'<div class=""pt-panel>'
											+tabHtml
										+'</div>'
									+'</div>'
								+'</div>'
						+'</div>';
				break;
			case 'treegrid':
				//左右结构
				var treeHtml = '<div class="pt-panel">'
									+'<div class="pt-container">'
										+'<div class="layout-ztree businessdatabasepanoramic-tree-ztree" id="'+_config.treeConfig.id+'"></div>'
									+'</div>'
								+'</div>';
				containerHtml = '<div class="pt-container">'
								+titleHtml
								+'<div class="pt-main-row">'
									+'<div class="pt-main-col">'
										+treeHtml
									+'</div>' 
									+'<div class="pt-main-col">'
										+btnHtml+listHtml
										+'<div class="pt-panel">'
											+tabHtml
										+'</div>'
									+'</div>'
								+'</div>'
						+'</div>';
				break;
		}
		var html = '<div class="pt-main businessbasepanoramic '+templateClassStr+'" id="'+_config.id+'" ns-package="'+_config.package+'">'+containerHtml+'</div>';
		if(_config.$container){
			_config.$container.html(html);
		}else{
			$container.prepend(html);//输出面板
		}
	}
	//设置默认值
	function setDefault(_config){
		var defaultConfig = {
			mode:'listgrid',  //listgrid  treeGrid
			isTab:true,//子表是tab拼接的
		};
		if(typeof(_config.mode)=='undefined'){_config.mode = 'listgrid';}
		_config.isTab = true;
		_config.treeConfig = {};//树配置
		
		//计算表格的展示高度
		var commonHeight = _config.templateCommonHeight;//排除标签高度 底部高度 标题高度
		var gridHeight = 0;
		if(_config.btnKeyFieldJson['root']){
			//主表存在按钮
			commonHeight = commonHeight - 44;//按钮的高度为34
		}
		commonHeight = commonHeight - 58;//减去tab标题的高度
		_config.gridHeight = parseFloat(commonHeight/2);
		_config.treeHeight = commonHeight;
		_config.mainBtnArray = [];
		_config.btnsArray = [];
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
		initComponent(_config);
	}
	function refreshByConfig(_config){
		initComponent(_config);
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