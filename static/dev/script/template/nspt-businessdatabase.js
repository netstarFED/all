/*
 * @Desription: 文件说明
 * @Author: netstar.sjj
 * @Date: 2019-12-11 11:10:03
 * @LastEditTime: 2019-12-11 16:29:30
 * @descrition 基本业务模板  businessDataBase
 * 显示形式 
 * 1.左侧树+右侧表格(treeByListGrid) 
 * 2.单表格(grid) 
 * 3.左侧树+右侧主表格+tab多个表格(treeByTabGrid) 
 * 4.上表格+下tab的多个list(两级结构tabGrid) 
 * 5.支持弹出的形式 5.1弹出目录树  5.2弹出上述几种展现形式 5.3弹出块状表格
 */
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.businessDataBase = (function(){
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
	//点击按钮获取界面配置以及参数的回调方法
	function dialogBeforeHandler(data,templateId){
		var config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
		var isSendPageParams = typeof(controllerObj.isSendPageParams)=='boolean' ? controllerObj.isSendPageParams : true;//是否发送当前界面参数
		var requestSource = controllerObj.requestSource ? controllerObj.requestSource : 'selected';//默认读取选中行的操作，当前模板是单选
		if(isSendPageParams === false){
			data.value = {};
		}else{
			//根据当前按钮定义的类型获取值
			if(!$.isEmptyObject(data.rowData)){
				data.value = data.rowData;//行内按钮直接获取当前操作行的值
			}else{
				if(requestSource == 'checkbox'){
					var selectedData = NetStarGrid.getCheckedData(config.mainComponent.id);
					if(selectedData.length == 0){
						selectedData = NetStarGrid.getSelectedData(config.mainComponent.id);
					}
					data.value = {
						selectedList:selectedData,
					};
				}else{
					var selectedData = [];
					if(config.mainComponent.type == 'blockList'){
						selectedData = NetstarBlockList.getSelectedData(config.mainComponent.id);
					}else{
						selectedData = NetStarGrid.getSelectedData(config.mainComponent.id);
					}
					if(selectedData.length > 0){
						data.value = selectedData[0];
						NetstarTemplate.templates.businessDataBase.setSendParamsByPageParamsData(data.value,config);
					}
				}
			}
			NetstarTemplate.templates.businessDataBase.setSendPageParamsByTemplateConfig(config.pageParam,controllerObj.data,data.value);
		}
		data.btnOptionsConfig = {
			options:{
				idField:config.mainComponent.idField
			},
			descritute:{
				keyField:config.mainComponent.keyField,
				idField:config.mainComponent.idField
			}
		};
		data.config = config;
		return data;
	}
	//ajax执行之前的回调函数
	function ajaxBeforeHandler(handlerObj,templateId){
		var config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		handlerObj.config = config;
		var ajaxConfig = typeof(handlerObj.ajaxConfig)=='object' ? handlerObj.ajaxConfig : {};
		if($.isEmptyObject(handlerObj.value)){
			if(ajaxConfig.requestSource == 'checkbox'){
				var selectedData = NetStarGrid.getCheckedData(config.mainComponent.id);
				if(selectedData.length == 0){
					selectedData = NetStarGrid.getSelectedData(config.mainComponent.id);
				}
				handlerObj.value = {
					selectedList:selectedData,
				};
			}else{
				var selectedData = [];
				if(config.mainComponent.type == 'blockList'){
					selectedData = NetstarBlockList.getSelectedData(config.mainComponent.id);
				}else{
					selectedData = NetStarGrid.getSelectedData(config.mainComponent.id);
				}
				if(selectedData.length > 0){
					handlerObj.value = selectedData[0];
					NetstarTemplate.templates.businessDataBase.setSendParamsByPageParamsData(handlerObj.value,config);
				}
			}
			NetstarTemplate.templates.businessDataBase.setSendPageParamsByTemplateConfig(config.pageParam,ajaxConfig.data,handlerObj.value);
		}
		handlerObj.ajaxConfigOptions = {
			idField:config.mainComponent.idField,
			keyField:config.mainComponent.keyField,
			pageParam:config.pageParam,
		};
		return handlerObj;
	}
	//ajax完成之后对界面进行的操作
	function ajaxAfterHandler(res,templateId,plusData){
		plusData = typeof(plusData)=='object' ? plusData : {};
		var newData = $.extend(true,{},res);
		delete newData.objectState;
		var config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		if(plusData.isCloseWindow == true){
			NetstarUI.labelpageVm.closeByIndex(NetstarUI.labelpageVm.labelPageLength-1);
			if(plusData.isSetValueToSourcePage === true){
				var templateConfig = NetstarUI.labelpageVm.labelPagesArr[NetstarUI.labelpageVm.currentTab].config;
				if(NetstarTemplate.templates.processDocBase.aggregate){
					if(NetstarTemplate.templates.processDocBase.aggregate[templateConfig.package]){
						templateConfig = NetstarTemplate.templates.processDocBase.aggregate[templateConfig.package].config;
					}
				}
				if(!$.isEmptyObject(templateConfig)){
					var componentArray = templateConfig.components;
					switch(templateConfig.template){
						case 'processDocBase':
								for(var c=0; c<componentArray.length; c++){
									var componentData = componentArray[c];
									switch(componentData.type){
										case 'vo':
											NetstarComponent.fillValues(newData,componentData.id);
											break;
										case 'list':
											var listArray = [];
											if($.isArray(newData[componentData.keyField])){
												listArray = newData[componentData.keyField];
											}
											NetStarGrid.refreshDataById(componentData.id,listArray);
											break;
									}
								}
							break;
					}
				}
			}
		}else{
			//表格数据
			var gridId = config.mainComponent.id;
			switch(res.objectState){
				case NSSAVEDATAFLAG.DELETE:
					//删除
					NetStarGrid.delRow(res,gridId);
					break;
				case NSSAVEDATAFLAG.EDIT:
					//修改
					NetStarGrid.editRow(res,gridId);
					break;
				case NSSAVEDATAFLAG.ADD:
					//修改
					NetStarGrid.addRow(res,gridId);
					break;
				case NSSAVEDATAFLAG.VIEW:
					//刷新
					refreshByPackage(config,{},plusData);
					break;
			}
			if($.isArray(res)){
				refreshByPackage(config,{},plusData);
			}
		}
	}
	//刷新tab中的多个list数据
	function refreshTabListDataByAjax(tabConfig,data){
		var ajaxConfig = $.extend(true,{},tabConfig.queryConfig.ajax);
		if(typeof(data)=="undefined"||$.isEmptyObject(data)){
			return;
		}
		var templatesConfig = tabConfig.templatesConfig;
		var listConfig = templatesConfig.mainComponent;
		ajaxConfig = nsVals.getAjaxConfig(ajaxConfig,data,{idField:listConfig.idField});
		ajaxConfig.plusData = {
			listJson:tabConfig.listConfig
		};
		nsVals.ajax(ajaxConfig,function(res,ajaxData){
			if(res.success){
				//调用ajax成功
				var resData = res[ajaxData.dataSrc];
				//如果返回的不是数组，可能是空数组
				if($.isEmptyObject(resData)){
					resData = {};
				}
				var listJson = ajaxData.plusData.listJson;
				for(var gridId in listJson){
					var gridConfig = listJson[gridId];
					if($.isArray(resData[gridConfig.keyField])){
						NetStarGrid.resetData(resData[gridConfig.keyField], gridId);
					}else{
						NetStarGrid.resetData([], gridId);
					}
				}
			}else{
				for(var gridId in listJson){
					var gridConfig = listJson[gridId];
					NetStarGrid.resetData([], gridId);
				}
			}
		},true)
	}
	//主表ajax调用完成之后的回调操作
	function ajaxSuccessHandlerByMainGrid(rows,gridId){
		var grid = NetStarGrid.configs[gridId];
		if(typeof(grid)=='undefined'){
			grid = NetstarBlockList.configs[gridId];
		}
		var selectIds = grid.gridConfig.ui.selectIds;
		var idField = grid.gridConfig.idField;
		if(!$.isArray(selectIds)){
			selectIds = [];
		}
		if(selectIds.length > 0){
			for(var rowI=0; rowI<rows.length; rowI++){
				if(selectIds.indexOf(rows[rowI][idField])>-1){
					rows[rowI].netstarSelectedFlag = true;
				}else{
					rows[rowI].netstarSelectedFlag = false;
				}
			}
			delete grid.gridConfig.ui.selectIds;
		}
	}
	//重绘主表数据的回调
	function drawHandlerByMainGrid(_vueData){
		var gridId = _vueData.$options.id;
		var grid = NetStarGrid.configs[gridId];
		switch(_vueData.ui.displayMode){
			case 'block':
				grid = NetstarBlockList.configs[gridId];
				break;
		}
		var config = NetstarTemplate.templates.configs[grid.gridConfig.package];
		var rowsData = _vueData.rows;
		var originalRows = _vueData.originalRows;
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
				//查找按钮是否设置了禁用
				NetStarUtils.setBtnsDisabled(config.mainBtnArray,data);

				if(!$.isEmptyObject(config.tabConfig.queryConfig)){
					refreshTabListDataByAjax(config.tabConfig,data);
				}
			}else{
				if(!$.isEmptyObject(config.tabConfig.queryConfig)){
					for(var gridId in config.tabConfig.listConfig){
						NetStarGrid.resetData([], gridId);
					}
				}
			}
			//需要判断按钮的来源来决定按钮是否应该处于禁用状态 sjj 20190423
			var isDisabled = false;
			if(rowsData.length == 0){
				//无数据 此时需要判断按钮的来源来决定按钮是否应该处于禁用状态 sjj 20190423 
				isDisabled = true;
			}
			NetStarUtils.setBtnsDisabledByRequestSource(config.mainBtnArray,isDisabled);
		}
	}
	//主表初始化完成之后的操作
	function completeHandlerByMainGrid(_config){
		var mainComponent = _config.mainComponent;
		var configs = {};
		switch(mainComponent.type){
			case 'blockList':
				configs = NetstarBlockList.configs[mainComponent.id];
				break;
			case 'list':
				configs = NetStarGrid.configs[mainComponent.id];
				break;
		}
		if(!$.isEmptyObject(_config.componentByDialog)){
			//弹出的列表要支持上下键盘操作
			$(document).on('keyup',{templateConfig:_config},documentKeyupHandler);
		}
	}
	//有左侧树的时候右侧表格检索的回调事件
	function callBackFuncByQueryByMainGrid(_gridConfig,packageName,paramJson,_queryType){
		//vo的检索条件 加上左侧树节点的id和ajax默认的参数
		_queryType = typeof(_queryType)=='undefined' ? '' : _queryType;
		var templateConfig = NetstarTemplate.templates.configs[packageName];
		var treeComponent = templateConfig.treeComponent;
		if(_queryType == 'advance'){
			if(!$.isEmptyObject(treeComponent)){
				var treeNode = NetstarTemplate.tree.getSelectedNodes(treeComponent.id)[0];
				if(typeof(treeComponent.formatter)=='string'){
					var formatter = JSON.parse(treeComponent.formatter);
					var treeFormatterData = nsVals.getVariableJSON(formatter,treeNode);
					NetStarUtils.setDefaultValues(paramJson,treeFormatterData);
				}else if(typeof(treeComponent.formatter)=='object'){
					var formatter = treeComponent.formatter;
					var treeFormatterData = nsVals.getVariableJSON(formatter,treeNode);
					NetStarUtils.setDefaultValues(paramJson,treeFormatterData);
				}else{
					paramJson.id = treeNode.id;
				}
			}
			refreshGridDataByAjax(templateConfig.mainComponent,{},paramJson);
		}else{
			if(!$.isEmptyObject(treeComponent)){
				refreshGridByTree(_gridConfig);
			}else{
				refreshGridDataByAjax(templateConfig.mainComponent,{},paramJson);
			}
		}
	}
	//设置主表中UI参数的定义
	function setUIByMainGrid(_config,_customUI){
		var componentsConfig = _config.componentsConfig;
		var mainGridComponent = componentsConfig[_config.mainComponent.type][_config.mainComponent.id];
		var paramsData = typeof(_config.pageParam)=='object' ? _config.pageParam : {};
		var isOpenFormQuery = typeof(mainGridComponent.isOpenFormQuery) == "boolean" ? mainGridComponent.isOpenFormQuery : false;
		var isUseMessageState = false; 
		if(paramsData.activeityId || paramsData.processId || paramsData.activityName){
			//如果当前界面存在流程id 或者存在活动id
			isUseMessageState = true;
		}
		var defaultParams = {
			isUseMessageState:isUseMessageState,
			height:_config.availableHeight,
			pageLengthDefault:Math.floor((_config.availableHeight-34-26-29)/29),
			minPageLength:Math.floor((_config.availableHeight-34-26-29)/29),
			isPage:true,
			selectMode:'single',
			isCheckSelect:true,
			isAllowAdd:false,
			ajaxSuccessHandler:ajaxSuccessHandlerByMainGrid,
			drawHandler:drawHandlerByMainGrid,
			//title:mainGridComponent.title,//表格标题
			isOpenQuery:true,//是否开启查询
			isOpenAdvanceQuery:true,//是否开启高级查询
			isOpenFormQuery : isOpenFormQuery,
			completeHandler:function(){
				completeHandlerByMainGrid(_config);
			},
			paramsData:paramsData,
			//callBackFuncByQuery:function(_gridConfig,packageName,paramJson){}
		};
		if(!$.isEmptyObject(_config.treeComponent)){
			defaultParams.callBackFuncByQuery = callBackFuncByQueryByMainGrid;
		}
		if(mainGridComponent.params.isServerMode && !$.isEmptyObject(_config.treeComponent)){
			defaultParams.refreshGridHandler = refreshGridByTree;
		}
		if(mainGridComponent.params.displayMode =='treeGrid'){
			defaultParams.pageLengthDefault = 100000;
			defaultParams.isPage = false;
			defaultParams.isKeepSelected = true;
		}
		if(mainGridComponent.type == 'blockList'){
			defaultParams.isCheckSelect = false;
			defaultParams.listExpression = mainGridComponent.listExpression;
		}
		if(!$.isEmptyObject(_customUI)){
			$.each(_customUI,function(k,v){
				defaultParams[k] = v;
			});
		}
		NetStarUtils.setDefaultValues(mainGridComponent.params,defaultParams);
		if(mainGridComponent.isAjax == false){
			mainGridComponent.params.callBackFuncByQuery = callBackFuncByQueryByMainGrid;
		}
	}
	//设置tab中多个listUI参数的定义
	function setUIByTabGrid(_config){
		var componentsConfig = _config.componentsConfig;
		for(var gridId in componentsConfig.list){
			var gConfig = componentsConfig.list[gridId];
			var gHeight = parseInt((_config.availableHeight-45)/2);
			if(gConfig.id != _config.mainComponent.id){
				//排除主表
				var defaultParams = {
					height:gHeight,
					pageLengthDefault:10,
					minPageLength:10,
					delay:200,//设置滚轮滚动的延时
					isPage:true,
					selectMode:'single',
					isAllowAdd:false,
				};
				NetStarUtils.setDefaultValues(gConfig.params,defaultParams);
			}else{
				gConfig.params.height = gHeight;
				gConfig.params.pageLengthDefault = 10;
				gConfig.params.minPageLength = 10;
			}
		}
	}
	//刷新列表数据根据ajax
	function refreshGridDataByAjax(_componentConfig,paramsData,paramJson){
		var templateConfig = NetstarTemplate.templates.configs[_componentConfig.package];
		var ajaxConfig = $.extend(true,{},_componentConfig.ajax);
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

		if(_componentConfig.params.isServerMode){
			var listConfig = NetStarGrid.configs[_componentConfig.id];

			if(_componentConfig.type == 'blockList'){
				listConfig = NetstarBlockList.configs[_componentConfig.id];
			}
			var start = listConfig.vueObj.page.start;
			var length = listConfig.vueObj.domParams.pageLengthInput.value;
			ajaxConfig.data.start = start;
			ajaxConfig.data.length = length;
		}

		NetstarTemplate.templates.businessDataBase.setSendParamsByPageParamsData(ajaxConfig.data,templateConfig);

		ajaxConfig.plusData = {componentConfig:_componentConfig};

		NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
			if(res.success){
				var rowsData = res[ajaxOptions.dataSrc];
				if(!$.isArray(rowsData)){rowsData = [];}
				var _componentByConfig = ajaxOptions.plusData.componentConfig;
				NetStarGrid.configs[_componentByConfig.id].gridConfig.domParams.serverData = res;
				NetStarGrid.resetData(rowsData,_componentByConfig.id);
			}else{
				nsalert('返回值为false','error');
			}
		},true)
	}
	//根据选中节点数据和包名刷新列表
	function refreshGridByTreeDataAndPackage(treeNode,packageName){
		var templateConfig = NetstarTemplate.templates.configs[packageName];
		var treeComponent = templateConfig.treeComponent;
		var queryId = 'query-'+templateConfig.mainComponent.id;
		var formJson = NetstarComponent.getValues(queryId,false);
		var queryJson = {};
		if(formJson.filtermode == 'quickSearch'){
			if(formJson.filterstr){
				queryJson = {
					keyword:formJson.filterstr,
					quicklyQueryColumnValue:formJson.filterstr
				};
				var uiConfig = NetStarGrid.configs[templateConfig.mainComponent.id].gridConfig.ui;
				if(uiConfig.query.quickQueryFieldArr.length > 0){
					queryJson.quicklyQueryColumnNames = uiConfig.query.quickQueryFieldArr;
				}
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
		if(typeof(treeComponent.formatter)=='string'){
			var formatter = JSON.parse(treeComponent.formatter);
			var treeFormatterData = nsVals.getVariableJSON(formatter,treeNode);
			NetStarUtils.setDefaultValues(queryJson,treeFormatterData);
		}else if(typeof(treeComponent.formatter)=='object'){
			var formatter = treeComponent.formatter;
			var treeFormatterData = nsVals.getVariableJSON(formatter,treeNode);
			NetStarUtils.setDefaultValues(queryJson,treeFormatterData);
		}else{
			queryJson.id = treeNode.id;
		}
		refreshGridDataByAjax(templateConfig.mainComponent,{},queryJson);
	}
	//根据树的配置刷新列表数据
	function refreshGridByTree(_gridConfig){
		var packageName = _gridConfig.package;
		var templateConfig = NetstarTemplate.templates.configs[packageName];
		var treeNode = NetstarTemplate.tree.getSelectedNodes(templateConfig.treeComponent.id)[0];
		refreshGridByTreeDataAndPackage(treeNode,packageName);
	}
	//点击树节点执行的操作
	function clickHandlerByTree(data){
		/*
			*config 			容器id
			*treeId 			节点值
			*treeNode 			当前节点数据
		*/
		//此方法只是在获取节点刷新表格和分类数据
		var treeNode = data.treeNode;
		var packageName = data.config.package;
		NetStarGrid.configs[NetstarTemplate.templates.configs[packageName].mainComponent.id].vueObj.domParams.toPageInput.value = 1;
		refreshGridByTreeDataAndPackage(treeNode,packageName);
	}
	//设置树的参数
	function setParamsByTree(_config,_customUI){
		var componentsConfig = _config.componentsConfig;
		var treeComponent = componentsConfig.tree[_config.treeComponent.id];
		treeComponent.clickHandler = clickHandlerByTree;
		if(_config.treeComponent.params.readonly){
			treeComponent.readonly = _config.treeComponent.params.readonly;
		}
		if(_config.treeComponent.params.isSearch){
			treeComponent.isSearch = _config.treeComponent.params.isSearch;
		}
		treeComponent.height = _config.availableHeight;
		if(!$.isEmptyObject(_customUI)){
			$.each(_customUI,function(k,v){
				treeComponent[k] = v;
			});
		}
		var arr = ['ajax', 'deleteAjax', 'addAjax', 'editAjax', 'moveAjax', '', ''];
		for(var i=0; i<arr.length; i++){
			if(typeof(treeComponent[arr[i]])=='object'){
				if(typeof(treeComponent[arr[i]].url) == "string" && treeComponent[arr[i]].url.length>0 && treeComponent[arr[i]].url.indexOf('http')==-1){
					treeComponent[arr[i]].url = getRootPath() + treeComponent[arr[i]].url;
				}
			}
		}
	}
	
	//点击tab来回切换
	function changeTabInit(_componentConfig,_config){
		var $lis = $('#'+_config.tabConfig.id+' > li');
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
		$lis.children('a').off('click',detailListTabHandler);
		$lis.children('a').on('click',detailListTabHandler);
	}

	//组件调用初始化方法
	function initComponentInit(_config){
		var componentsConfig = _config.componentsConfig;
		//左侧树+右侧表格(treeByListGrid) 左侧树+右侧表格+右侧tab表格(treeByTabGrid)  单表格(grid) 单表格+tab表格(tabGrid)
		var availableHeight = 0;
		var titleHeight = 0;//标题高
		var rootBtnHeight = 0;//顶部按钮的高度
		if(_config.title){
			titleHeight = 28;
		}
		availableHeight = $(window).outerHeight()-35-30-titleHeight-34;//35是标签的高度 30是padding值
		/***lyw 20200317通过container计算容器高度start***/
		var $container = _config.$container;
		if($container){
			availableHeight = $container.height() - titleHeight - 20;
		}
		/***lyw 20200317通过container计算容器高度end****/
		var rootBtnConfig = _config.btnKeyFieldJson.root;
		if(!$.isEmptyObject(rootBtnConfig)){
			rootBtnHeight = 34;
			availableHeight = availableHeight - rootBtnHeight;
		}
		_config.availableHeight = availableHeight;
		setUIByMainGrid(_config);
		switch(_config.mode){
			case 'treeByListGrid':
				setParamsByTree(_config);
				componentsConfig[_config.mainComponent.type][_config.mainComponent.id].isAjax = false;
				break;
			case 'treeByTabGrid':
				setParamsByTree(_config);
				componentsConfig[_config.mainComponent.type][_config.mainComponent.id].isAjax = false;
				setUIByTabGrid(_config);
				break;
			case 'grid':
				break;
			case 'tabGrid':
				setUIByTabGrid(_config);
				break;
		}
		for(var componentType in componentsConfig){
		   var componentData = componentsConfig[componentType];
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
				case 'voList':
					NetstarTemplate.commonFunc.voList.init(componentData,_config);
					break;
				case 'btns':
					NetstarTemplate.commonFunc.btns.initBtns(componentData,_config);
					break;
				case 'tree':
					NetstarTemplate.commonFunc.tree.init(componentData,_config);
					break;
				case 'tab':
					changeTabInit(componentData,_config);
					break;
		   }
		}
	}
	//根据组件类型存储值
	function setComponentDataByConfig(config){
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
		}
		if($.isEmptyObject(config.mainComponent)){
			//一种情况 配置参数出错
			config.tabConfig.queryConfig = {};
			config.tabConfig.listConfig = {};
			for(var i=0; i<config.components.length; i++){
				var componentData = config.components[i];
				componentData.package = config.package;
				componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
				if(componentData.type == 'blockList' || componentData.type == 'list'){
					componentData.isAjax = true;
					config.mainComponent = config.components[i];
					break;
				}
			}
		}
		var isTab = false;
		var outputType = '';//输出结构的类型  左侧树+右侧表格(treeByListGrid) 左侧树+右侧表格+右侧tab表格(treeByTabGrid)  单表格(grid) 单表格+tab表格(tabGrid)
		if(!$.isEmptyObject(config.tabConfig.queryConfig)){
			isTab = true;
		}
		if(!$.isEmptyObject(config.treeComponent)){
			outputType = 'treeByListGrid';
			if(isTab){
				outputType = 'treeByTabGrid';
			}
		}else{
			if(isTab){
				outputType = 'tabGrid';
			}else{
				outputType = 'grid';
			}
		}
		config.mode = outputType;
	}
	//初始化组件容器
	function initContainer(config){
		var titleHtml = '';//标题
		var contentHtml = '';//内容
		if(config.title){
			//定义了标题输出
			titleHtml = '<div class="pt-main-row">'
								+'<div class="pt-main-col">'
									+'<div class="pt-panel pt-panel-header">'
										+'<div class="pt-container">'
											+'<div class="pt-panel-row">'
												+'<div class="pt-panel-col">'
													+'<div class="pt-title pt-page-title"><h4>'+config.title+'</h4></div>'
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>';
		}
		//如果定义了组件类型vo的，则作为当前模板的自定义查询条件
		var queryByVoHtml = '';//自定义的vo查询条件
		if(!$.isEmptyObject(config.componentsConfig.vo)){
			var componentsByVo = config.componentsConfig.vo;
			for(var voId in componentsByVo){
				var voData = componentsByVo[voId];
				var classStr = 'component-'+voData.type;
				if(voData.position){
					//定义了位置
					classStr += ' '+voData.position;
				}
				var html = '<div class="'+classStr+'" id="'+voData.id+'"></div>';
				queryByVoHtml += '<div class="pt-main-row businessdatabase-vo">'
								+'<div class="pt-main-col">'
									+NetstarTemplate.getPanelHtml(html)
								+'</div>'
							+'</div>';
			}
		}
		var tabHtml = '';//tab输出多个list
		if(!$.isEmptyObject(config.tabConfig.queryConfig)){
			var listNum = 0;
			var tabLiHtml = '';
			var tabContentHtml = '';
			for(var listId in config.tabConfig.listConfig){
				var listConfig = config.tabConfig.listConfig[listId];
				var titleStr = listConfig.title ? listConfig.title : '';
				var activeClassStr = '';
				if(listNum == 0){activeClassStr = 'current';}
				var classStr = 'component-list pt-nav-item';//class名称
				tabLiHtml += '<li class="'+classStr+' '+activeClassStr+'" ns-index="'+listNum+'">'
												+'<a href="javascript:void(0);" ns-href-id="'+listConfig.id+'">'
													+titleStr
												+'</a>'
											+'</li>';
				tabContentHtml += '<div class="pt-tab-content '+activeClassStr+'">'
									+'<div class="pt-tab-components" id="'+listConfig.id+'"></div>'
								+'</div>';
				listNum++;
			}
			//businessdatabase-treelist-detaillist
			tabHtml = '<div class="pt-main-row">'
						+'<div class="pt-main-col">'
							+'<div class="pt-panel">'
								+'<div class="pt-container">'
									+'<div calss="pt-panel-row">'
										+'<div class="pt-panel-col">'
											+'<div class="pt-tab-components-tabs pt-tab pt-tab-noboder">'
												+'<div class="pt-container">'
													+'<div class="pt-tab-header">'
														+'<div class="pt-nav">'
															+'<ul class="pt-tab-list-components-tabs" id="'+config.tabConfig.id+'">'
																+tabLiHtml
															+'</ul>'
														+'</div>'
													+'</div>'
													+'<div class="pt-tab-body">'
														+tabContentHtml
													+'</div>'
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>'
					+'</div>';
		}

		//如果组件树存在
		var treeHtml = '';//左侧树
		var isTree = false;
		if(!$.isEmptyObject(config.treeComponent)){
			treeHtml = '<div class="pt-main-col" id="'+config.treeComponent.id+'"></div>';
		}
		var mainGridHtml = '';//主grid输出
		if(!$.isEmptyObject(config.mainComponent)){
			mainGridHtml = '<div class="pt-panel businessdatabase-grid-component" id="'+config.mainComponent.id+'"></div>';
		}
		var mainBtnHtml = '';//按钮
		if(config.btnKeyFieldJson.root){
			var rootBtnConfig = config.btnKeyFieldJson.root;
			mainBtnHtml = '<div class="pt-panel button-panel-component">'
							+'<div class="pt-panel">'
								+'<div class="pt-container">'
									+'<div class="pt-panel-row">'
										+'<div class="pt-panel-col">'
											+'<div class="nav-form" id="'+rootBtnConfig.id+'"></div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}
		var outputType = config.mode;
		switch(outputType){
			case 'grid':
			case 'tabGrid':
				contentHtml = '<div class="pt-container">'
								+titleHtml
								+queryByVoHtml
								+'<div class="pt-main-row">'
									+'<div class="pt-main-col">'
										+mainBtnHtml+mainGridHtml
									+'</div>'
								+'</div>'
								+tabHtml
						+'</div>';
				break;
			case 'treeByListGrid':
			case 'treeByTabGrid':
				contentHtml = '<div class="pt-container">'
									+titleHtml
									+queryByVoHtml
									+'<div class="pt-main-row">'
										+treeHtml 
										+'<div class="pt-main-col">'
											+mainBtnHtml+mainGridHtml
											+tabHtml
										+'</div>'
									+'</div>'
							+'</div>';
				break;
		}
		var modeStr = outputType.toLocaleLowerCase();
		var $container = $('container').not('.hidden');
		// if($container.length > 0){
		// 	$container = $('container:last');
		// }
		if($container.length > 0){
			$container = $container.eq($container.length-1);
		}
		var templateClassStr = '';
		if(config.plusClass){
			templateClassStr = config.plusClass;
		}
		var html = '<div class="pt-main businessdatabase '+templateClassStr+'" id="'+config.id+'" pt-mode="'+modeStr+'" ns-package="'+config.package+'">'+contentHtml+'</div>';
		if(config.$container){
			config.$container.html(html);
		}else{
			$container.prepend(html);//输出面板
		}
	}
	//设置默认值
	function setDefault(_config){
		_config.tabConfig = {
			id:"tab-"+_config.id,
			queryConfig:{},
			listConfig:{},
			templatesConfig:_config
		};
		_config.mainBtnArray = [];
	}
	//初始化执行
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
	   setDefault(_config);//设置默认值
	   setComponentDataByConfig(_config);
	   initContainer(_config);//输出容器结构
	   initComponentInit(_config);
	}
	//获取界面参数
	function getPageData(_config,isValid){
		isValid = typeof(isValid)=='boolean' ? isValid : true;
		if(typeof(_config)=='string'){
		   _config = NetstarTemplate.templates.configs[_config];
		}
		var selectedData;
		var mainComponent = _config.mainComponent;
		var mainGridId = mainComponent.id;
		var configs = {};
		switch(mainComponent.type){
			case 'list':
				configs = NetStarGrid.configs[mainGridId];
				break;
			case 'blockList':
				configs = NetstarBlockList.configs[mainGridId];
				break;
		}
		if(configs.gridConfig.ui.displayMode == 'block'){
			selectedData = NetstarBlockList.getSelectedData(mainGridId);
		}else{
			selectedData = NetStarGrid.getSelectedData(mainGridId);
		}
		return selectedData;
	}
	//给组件赋值
	function initComponentByFillValues(){}
	//清空组件值
	function clearByAll(){}
	//获取选中列表数据的id
	function getIdsBySelectedData(gridId){
		//先获取当前行选中的值 
		var idsArray = [];
		var selectRowsData = NetStarGrid.getSelectedData(gridId);
		if($.isArray(selectRowsData)){
			if(selectRowsData.length > 0){
				var config = NetStarGrid.configs[gridId];
				var idField = config.gridConfig.data.idField;
				for(var s=0; s<selectRowsData.length; s++){
					idsArray.push(selectRowsData[s][idField]);
				}
			}
		}
		return idsArray;
	}
	//根据包名刷新
	function refreshByPackage(data,sourceData,outerConfig){
		/*
			*data object 接受参
				* idField 主键id
				*package 包名
				*templateId string
			*sourceData 来源data 
		*/
		if(typeof(outerConfig)!='object'){outerConfig = {};}
		var templateId = data.id;
		if(data.templateId){templateId = data.templateId;}
		var config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		var gridId = config.mainComponent.id;
		if(outerConfig.isKeepSelected){
			var idsArray = getIdsBySelectedData(gridId);
			NetStarGrid.configs[gridId].gridConfig.ui.selectIds = idsArray;
		}
		refreshByConfig(config);
	}
	//获取表格选中值
	function getSelectedDataByGridId(gridId){
		var value;
		if(NetStarGrid.configs[gridId].gridConfig.ui.isCheckSelect){
			value = NetStarGrid.getCheckedData(gridId);
			if(value.length == 0){
				value = NetstarTemplate.commonFunc.list.getSelectedData(gridId);
				if($.isArray(value)){
					if(value.length == 1){
						value = value[0];
					}
				}else{
					value = {};
				}
			}
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
	
	//关闭弹框要执行的函数方法
	function hiddenHandler(_config){
		$(document).off('keyup',documentKeyupHandler);
		if(_config){
			NetstarTemplate.hiddenDialogHandler(_config.config);//sjj 20190814 关闭弹框调用关闭快捷键
		}
	}
	function documentEnterHandler(_config){
		var gridConfig = $.extend(true,{},_config.mainComponent);
		var selectData = NetStarGrid.getSelectedData(gridConfig.id);
		if(typeof(selectData[0]) == "object" && selectData[0]['NETSTAR-TRDISABLE']){
			nsAlert('当前行数据禁用', 'warning');
			console.warn('当前行数据禁用');
			return false;
		}
		if(!$.isEmptyObject(_config.componentByDialog)){
			if(typeof(_config.componentByDialog.doubleClickHandler)=='function'){
				hiddenHandler(_config);
				_config.componentByDialog.doubleClickHandler(selectData);
			}
		}
	}
	//弹出业务组件支持上下切换选中事件
	function documentKeyupHandler(event){
		event.preventDefault();
		var templateConfig = event.data.templateConfig;
		var gridConfig = templateConfig.mainComponent;
		var $trs = $('#'+gridConfig.id+'-contenttable tbody');
		var $selectedTr = $trs.children('.selected');
		switch(event.keyCode){
			case 13:
				//回车
				documentEnterHandler(templateConfig);
				break;
			case 40:
				//下移
				if($selectedTr.next().attr('ns-rowindex')){
					//当前是行
					var gridConfig = NetStarGrid.configs[gridConfig.id].gridConfig;
					var rowIndex = $selectedTr.next().attr('ns-rowindex');
					rowIndex = parseInt(rowIndex);
					var rows = NetStarGrid.configs[gridConfig.id].vueObj.$data.rows;
					var rowData = rows[rowIndex];
					//单选只能有一个选中项，需要取消掉所有选中的
					for(var i=0; i<rows.length; i++){
						rows[i].netstarSelectedFlag = false;
					}
					rowData.netstarSelectedFlag = true;
					$selectedTr = $selectedTr.next();
				};
				break;
			case 38:
				//上移
				if($selectedTr.prev().attr('ns-rowindex')){
					var gridConfig = NetStarGrid.configs[gridConfig.id].gridConfig;
					var rowIndex = $selectedTr.prev().attr('ns-rowindex');
					rowIndex = parseInt(rowIndex);
					var rows = NetStarGrid.configs[gridConfig.id].vueObj.$data.rows;
					var rowData = rows[rowIndex];
					//单选只能有一个选中项，需要取消掉所有选中的
					for(var i=0; i<rows.length; i++){
						rows[i].netstarSelectedFlag = false;
					}
					rowData.netstarSelectedFlag = true;
					$selectedTr = $selectedTr.prev();
				};
				break;
			case 27:
				//ESC 关闭
				hiddenHandler(templateConfig);
				if(!$.isEmptyObject(templateConfig.componentByDialog)){
					if(typeof(templateConfig.componentByDialog.closeHandler)=='function'){
						templateConfig.componentByDialog.closeHandler();
					}
				}
				break;
		}
	}
	function showPageData(pageConfig, configObj, pageOperateData){
		var showConfig = $.extend(true,{},pageConfig);
		var functionConfig = configObj.data.functionConfig;
		var templateId = configObj.data.templateId;
		var templateConfig = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		var gridConfig = templateConfig.mainComponent;
		var idField = gridConfig.idField;
		switch(functionConfig.editorType){
			case 'add':
				delete showConfig.getValueAjax;
				showConfig.pageParam = {
					data_auth_code:pageConfig.pageParam.data_auth_code
				};
				if(!$.isEmptyObject(configObj.data.rowData)){
					$.each(configObj.data.rowData,function(key,value){
						showConfig.pageParam[key] = value;
					})
				}
				showConfig.pageParam.editorType = 'add';
				delete showConfig.pageParam.readonly;
				//delete showConfig.pageParam;
				break;
			case 'copyAdd':
				showConfig.pageParam = {
					data_auth_code:configObj.value.data_auth_code,
					copyParams:configObj.value,
				};
				showConfig.pageParam.editorType = 'copyAdd';
				if(!functionConfig.isUseAjaxByCopyAdd){
					delete showConfig.getValueAjax;
				}
				delete showConfig.pageParam.readonly;
				//delete showConfig.pageParam[idField];
				break;
			case 'edit':
				showConfig.pageParam = configObj.value;
				showConfig.pageParam.editorType = 'edit';
				delete showConfig.pageParam.readonly;
				break;
			case 'query':
				showConfig.pageParam = configObj.value;
				showConfig.pageParam.readonly = true;
				break;	
		}
		//showConfig.size = 'lg';
		//showConfig.form.defaultComponentWidth = '25%';
		showConfig.closeHandler = (function(){
			return function(){
				if(configObj.subUrl){
					$(document).on('keyup',{templateConfig:templateConfig},documentKeyupHandler);
				}
				var plusData = {
					isKeepSelected:false
				};
				if(configObj.data){
					if(configObj.data.functionConfig){
						if(configObj.data.functionConfig.editorType == 'edit'){
							plusData.isKeepSelected = true;
						}
					}
				}
				vueButtonComponent.unbindKeydownHandler(showConfig.package);
				vueButtonComponent.bindKeydownHandler(templateConfig.package);
				if(configObj.displayMode == 'tree'){
					NetstarTreeList.ztreeManager.ajaxByTree(NetstarTreeList.configs[configObj.treeId].treeConfig);
				}else{
					refreshByPackage(templateConfig,{},plusData);
				}
			}
		})(configObj);

		// 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 lyw 20190620 start ---
    	var formatValueData = functionConfig.formatValueData; 
		// 转化对象
		if(typeof(formatValueData) == "string" && formatValueData.length>0){
			 formatValueData = JSON.parse(formatValueData);
		}
		if(typeof(formatValueData) == "object"){
			pageOperateData = typeof(pageOperateData) == "object" ? pageOperateData : {};
			var valueData = NetStarUtils.getFormatParameterJSON(formatValueData, pageOperateData);
			if(valueData){
					if(typeof(showConfig.pageParam) != "object"){
						showConfig.pageParam = {};
					}
					// if(showConfig.pageParam.editorType !== "add"){ // 新增时不传值
						for(var key in valueData){
							showConfig.pageParam[key] = valueData[key];
						}
					// }
			}
	 	}
	 	// 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 lyw 20190620 end ---
		NetstarTemplate.init(showConfig);
	}
	function getAjaxToPage(configObj){
		var templateId;
		if(configObj.data.templateId){
			templateId = configObj.data.templateId;
		}else{
			templateId = $('#'+configObj.data.data.id).closest('.nav-form').attr('id');
			//var prefix = 'pagebtn-simple-';
			templateId = templateId.substring(0,templateId.indexOf('-btn'));
		}
		var templateConfig = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		if(configObj.data.rowData){
			configObj.value = configObj.data.rowData[0];
		}
		var componentBtnConfig = templateConfig.componentBtnConfig;
		configObj.data.functionConfig = componentBtnConfig[configObj.type];
		if($.isEmptyObject(configObj.data.functionConfig)){
			return false;
		}
		var url = configObj.data.functionConfig.url;
		if(configObj.value){
			var tempValueName = templateConfig.package + new Date().getTime();
			NetstarTempValues[tempValueName] = configObj.value;
    		var urlStr =  encodeURIComponent(encodeURIComponent(tempValueName));
			url = url+'?templateparam='+urlStr;
		}
		configObj.subUrl = true;//弹出页打开弹出页
		var pageConfig = {
			pageIidenti : url,
			url : url,
			config : configObj,
			callBackFunc : function(isSuccess, data, _pageConfig){
					if(isSuccess){
						var _config = _pageConfig.config;
						var _configStr = JSON.stringify(_config);
					
						// 获取页面操作数据 lyw 20190620 start ---
						var pageOperateData = {};
						if(typeof(_config.getOperateData) == "function"){
							pageOperateData = _config.getOperateData();
						}else{
							if(_config.templateId){
								if(NetstarTemplate.templates.businessDataBase.data){
									if(NetstarTemplate.templates.businessDataBase.data[_config.templateId]){
										pageOperateData = NetstarTemplate.getOperateData(NetstarTemplate.templates.businessDataBase.data[_config.templateId].config);
									}
								}
							}
						}
						var pageOperateDataStr = JSON.stringify(pageOperateData);
						// 获取页面操作数据 lyw 20190620 end ---
		
						var funcStr = 'NetstarTemplate.templates.businessDataBase.showPageData(pageConfig,' + _configStr + ',' + pageOperateDataStr + ')';
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
					}
			},
		}
		pageProperty.getAndCachePage(pageConfig);
	}
	//调用组件初始化
	function componentInit(_config,_componentConfig){
		$('button[type="button"]').blur();//按钮失去焦点

		var packageName = _config.package.replace(/\./g, '-');
		_config.id = 'component-nstemplate-layout-' + packageName.replace(/-/g, '-');
		
		NetstarTemplate.templates.configs[_config.package] = _config;
		NetstarTemplate.commonFunc.setTemplateParamsByConfig(_config);//存储模板配置参数
	   	NetstarTemplate.commonFunc.setDefault(_config);//设置默认值参数
	   	setDefault(_config);//设置默认值
		setComponentDataByConfig(_config);//根据组件类型设置值

		_config.componentByDialog = _componentConfig;//弹出的组件定义

		var componentBtnConfig = {};//业务组件的弹出按钮组
		for(var componentI=0;componentI<_config.components.length; componentI++){
			var componentData = _config.components[componentI];
			switch(componentData.type){
				case 'list':
					if(componentData.hide){
						NetstarTemplate.setFieldHide('table',componentData.field,componentData.hide);
					}
					_config.mainComponent = componentData;
					break;
				case 'btns':
					for(var btnI=0; btnI<componentData.field.length; btnI++){
						var btnData = componentData.field[btnI];
						//查找是否存在添加编辑操作 editorType add copyAdd edit  defaultMode editDialog
						if(typeof(btnData.functionConfig)=='object'){
							if(btnData.functionConfig.defaultMode == 'editorDialog'){
								var editorType = btnData.functionConfig.editorType;
								var editorNameArray = editorType.split(',');
								if(editorNameArray.length == 1){
									componentBtnConfig[editorType] = btnData.functionConfig;
								}else{
									function setBtnsByEditorDialog(editIndex){
										var btnJson = componentData.field[editIndex];
										var textNameArray = btnJson.btn.text.split(',');
										var editorNameArray = btnJson.functionConfig.editorType.split(',');
										for(var textI=textNameArray.length-1; textI>-1; textI--){
											var functionConfig = $.extend(true,{},btnJson.functionConfig);
											functionConfig.editorType = editorNameArray[textI];
											componentBtnConfig[functionConfig.editorType] = functionConfig;
										}
									}
									setBtnsByEditorDialog(btnI);
								}
							}
						}
					}
					break;
			}
		}
		_config.componentBtnConfig = componentBtnConfig;
		/************* 根据editorConfig判断是否需要排重 start*************/
		var displayMode;//展示模式
		var customUI = {
			hideValueOption:{},//根据排重字段隐藏行
			defaultValueOption:{},//设置默认选中行
			pageLengthDefault:10,
			minPageLength:10,
		};//自定义UI
		if(typeof(_componentConfig.editorConfig)=='object'){
			var editorConfig = _componentConfig.editorConfig;
			var isDistinct = typeof(editorConfig.isDistinct)=='boolean' ? editorConfig.isDistinct : false;
			if(isDistinct){
				//要排重
				var distinctJson = {};
				switch(editorConfig.formSource){
					case 'form':
						var listArray = editorConfig.value;
						if(!$.isArray(listArray)){
							listArray = [editorConfig.value];
						}
						distinctJson = {
							list:listArray,
							idField:_config.mainComponent.idField
						};
						break;
					case 'table':
						distinctJson = {
							list:editorConfig.gridConfig.gridData,
							idField:_config.mainComponent.idField
						};
						break;
				}
				if(editorConfig.distinctField){
					//自定义了排重字段
					distinctJson.idField = editorConfig.distinctField;
				}
				customUI.hideValueOption = distinctJson;
			}
			//20191016 新增逻辑 当前选择的值可以进行多选 对应lims优化 表单业务组件多选新增时原选择保留问题
			switch(editorConfig.formSource){
				case 'form':
					var listArray = editorConfig.value;
					if($.isArray(listArray)){
						if(listArray.length > 0){
							customUI.defaultValueOption = {
								value:listArray,
								idField:_config.mainComponent.idField
							};
						}
					}
					break;
			}
			if(editorConfig.displayMode){
				displayMode = editorConfig.displayMode;
			}
		}
		/************* 根据editorConfig判断是否需要排重 end*************/
		//设置选中模式
		switch(_componentConfig.selectMode){
			case 'single':
				customUI.selectMode = 'single';
				customUI.isCheckSelect = false;
				break;
			case 'checkbox':
				customUI.selectMode = 'multi';
				customUI.isCheckSelect = true;
				break;
			case 'multi':
				customUI.selectMode = 'multi';
				break;
			case 'noSelect':
				customUI.selectMode = 'none';
				break;
		}
		//根据类型输出
		switch(_componentConfig.componentClass){
			case 'list':
				customUI.rowdbClickHandler = function(data){
					if(typeof(_componentConfig.doubleClickHandler)=='function'){
						_componentConfig.doubleClickHandler(data);
					}
				};
				customUI.height = $('#'+_componentConfig.container).outerHeight() - 51;
				
				var defaultValue = '';
				if(!$.isEmptyObject(_config.pageParam)){
					if(_config.pageParam.keyword){
						defaultValue = _config.pageParam.keyword;
						delete _config.pageParam.keyword;
					}
					if(_config.pageParam.quicklyQueryColumnValue){
						defaultValue = _config.pageParam.quicklyQueryColumnValue;
						delete _config.pageParam.quicklyQueryColumnValue;
					}
				}

				if(displayMode == 'tree'){
					//展开目录树
					var queryConfig = NetStarUtils.getListQueryData(_config.mainComponent.field,{id:_componentConfig.container,value:defaultValue});
					//把业务组件的配置参数作为入参
					var treeComponentConfig = {
						container:_componentConfig.container,
						ajax:_config.mainComponent.ajax,
						pageParam:_config.pageParam,
						queryConfig:queryConfig,
						selectMode:_componentConfig.selectMode,
						editorConfig:_componentConfig.editorConfig,
						doubleClickHandler:_componentConfig.doubleClickHandler,
					};
					NetstarTreeList.init(treeComponentConfig);
				}else{
					if(displayMode == 'blockList'){
						customUI.displayMode = 'block';
						$('#'+_componentConfig.container).closest('.pt-business-dialog').addClass('blockListByBusiness');
					}
					customUI.quicklyQueryColumnValue = defaultValue;

					if(!$.isEmptyObject(_config.treeComponent)){
						_config.treeComponent.readonly = true;
						_config.treeComponent.isSearch = false;
						var html = '<div class="pt-main"><div class="pt-main-row">'
										+'<div class="pt-main-col">'
											+'<div class="" id="'+_config.treeComponent.id+'"></div>'
										+'</div>'
										+'<div class="pt-main-col" style="margin-left:30px;">'
											+'<div class="" id="'+_config.mainComponent.id+'"></div>'
										+'</div>'
									+'</div></div>';
						$('#'+_componentConfig.container).html(html);
						// $('#'+_componentConfig.container).closest('.pt-modal-content').css({'width':'900px'});
						setParamsByTree(_config,{height:customUI.height});
						NetstarTemplate.commonFunc.tree.init(_config.componentsConfig.tree,_config);
					}else{
						$('#'+_componentConfig.container).html('<div class="" id="'+_config.mainComponent.id+'"></div>');
					}
					setUIByMainGrid(_config,customUI);
					if(displayMode == 'blockList'){
						if(!$.isEmptyObject(_config.componentsConfig.blockList)){
							NetstarTemplate.commonFunc.blockList.initBlockList(_config.componentsConfig.blockList,_config);
						}else{
							NetstarTemplate.commonFunc.blockList.initBlockList(_config.componentsConfig.list,_config);
						}
					}else{
						NetstarTemplate.commonFunc.list.initList(_config.componentsConfig.list,_config);
					}
				}
				break;
			case 'select':
				break;
			default:
				nsalert('找不到对应组件');
				console.warn(_componentConfig);
				break;
		}
		var callbackFunc = {
			selectHandler:function(){
				var selectedData = [];
				if(displayMode == 'tree'){
					var ztreeObj = NetstarTreeList.configs[_componentConfig.container].treeConfig.ztreeObj;
					switch(_componentConfig.selectMode){
						case 'single':
							selectedData = ztreeObj.getSelectedNodes();
							break;
						case 'checkbox':
						case 'multi':
							selectedData = ztreeObj.getCheckedNodes();
							break;
					}
				}else{
					var tableId = _config.mainComponent.id;
					if(displayMode == 'blockList'){
						selectedData = NetstarBlockList.getSelectedData(tableId);
					}else{
						switch(_componentConfig.selectMode){
							case 'single':
								selectedData = NetStarGrid.getSelectedData(tableId);
								break;
							case 'checkbox':
							case 'multi':
								selectedData = NetStarGrid.getCheckedData(tableId);
								if(selectedData.length == 0){
									selectedData = NetStarGrid.getSelectedData(tableId);
								}
								break;
						}
					}
				}
				return selectedData;
			},
			selectedComplateHandler:(function(){
				return function(_ajaxData){
					//选中之后调用ajax的完成回调事件
					//详情表Grid上的业务组件的关联字段 cy 20190928 start -------------
					//疑问：这个没有设置不在客户端排重的参数么？  参数请添加 isUserClientUnique (服务器端数据唯一);
					if(displayMode == 'tree'){
						return;	
					}
					var distinctField = _componentConfig.editorConfig.distinctField;
					var distinctGridConfigs = NetStarGrid.configs[_ajaxData.gridId];
					var distinctGridRows = _ajaxData.originalRowData;
					//拼接已经选中的详表ids
					var distinctIds = [];
					for(var i=0; i < distinctGridRows.length; i++){
						var distinctId = distinctGridRows[i][distinctField];
						if(typeof(distinctId) == 'undefined'){
							console.error('业务组件 distinctField：'+distinctField+', 配置错误');
							console.error(distinctGridRows[i]);
							break;
						}
						distinctIds.push(distinctId);
					}
					var tableId = _config.mainComponent.id;
					var configs = NetStarGrid.configs[tableId];
					var rows = configs.vueObj.rows;
					var idField = configs.gridConfig.data.idField;

					for(var i=0; i<rows.length; i++){
						var cid = rows[i][idField];
						if(typeof(cid) == 'undefined'){
							console.error('业务组件指定的页面Grid表格idField：'+idField+'配置错误，当前数据中不包含上述字段');
							console.error(rows[i]);
							console.error(componentConfig);
							break;
						}
						if(distinctIds.indexOf(cid)>-1){
							//已经选中了
							rows[i]['NETSTAR-TRDISABLE'] = true;
							rows[i].netstarSelectedFlag = false;
							rows[i].netstarCheckboxSelectedFlag = false;
						}
					}
					//详情表Grid上的业务组件的关联字段 cy 20190928 end -------------


					// var existIndex = -1;
					// for(var i=0; i<rows.length; i++){
					// 	if(rows[i][idField] == _ajaxData.originalRowData[0][idField]){
					// 		existIndex = i;
					// 		break;
					// 	}
					// }
					// if(existIndex > -1){
					// 	//开启禁用状态 取消选中状态
					// 	rows[i]['NETSTAR-TRDISABLE'] = true;
					// 	rows[i].netstarSelectedFlag = false;
					// 	rows[i].netstarCheckboxSelectedFlag = false;
					// 	if(i<rows.length-1){
					// 		//设置下一条选中
					// 		rows[i+1].netstarSelectedFlag = true;
					// 	}
					// }
				}
			})(_componentConfig),
			hiddenHandler:hiddenHandler,
			documentEnterHandler:(function(){
				return function(){
					documentEnterHandler(_config);
				}
			})(_config),
			listConfig:_config.mainComponent,
		};
		if(componentBtnConfig.add){
			callbackFunc.addHandler = function(_func){
				//sjj 20190521 添加支持一个返回参，返回参是一个方法
				$(document).off('keyup',documentKeyupHandler);
				var tableId = _config.mainComponent.id;
				/*var formatValueData = {};
				if(_componentConfig.editorConfig.formatValueData){
					if(displayMode != 'tree'){
						var tableId = _config.mainComponent.id;
						if(displayMode == 'blockList'){
							selectedData = NetstarBlockList.getSelectedData(tableId);
						}else{
							selectedData = NetStarGrid.getSelectedData(tableId);
						}
					}
					var listSelectedData = {listSelected:selectedData[0]};
					formatValueData = NetStarUtils.getFormatParameterJSON(_componentConfig.editorConfig.formatValueData,listSelectedData);
				}*/
				getAjaxToPage({gridId:tableId,treeId:_componentConfig.container,templateId:_config.id,displayMode:displayMode,data:{gridId:tableId,templateId:_config.id},type:'add'});
			}
		}
		if(componentBtnConfig.edit){
			callbackFunc.queryHandler = function(){
				$(document).off('keyup',documentKeyupHandler);
				var tableId = _config.mainComponent.id;
				var selectedData = [];
				if(displayMode == 'tree'){
					var ztreeObj = NetstarTreeList.configs[_componentConfig.container].treeConfig.ztreeObj;
					switch(_componentConfig.selectMode){
						case 'single':
							selectedData = ztreeObj.getSelectedNodes();
							break;
						case 'checkbox':
						case 'multi':
							selectedData = ztreeObj.getCheckedNodes();
							break;
					}
				}else{
					var tableId = _config.mainComponent.id;
					if(displayMode == 'blockList'){
						selectedData = NetstarBlockList.getSelectedData(tableId);
					}else{
						selectedData = NetStarGrid.getSelectedData(tableId);
					}
				}
				if(selectedData.length > 0){
					componentBtnConfig.query = componentBtnConfig.edit;
					componentBtnConfig.query.editorType = 'query';
					getAjaxToPage({gridId:tableId,treeId:_componentConfig.container,templateId:_config.id,displayMode:displayMode,data:{gridId:tableId,templateId:_config.id,rowData:selectedData},type:'query',templateId:_config.id});	
				}else{
					nsalert('请选择要查看的数据','error');
				}
			}
		}
		return callbackFunc;
	}
	function closeHandler(){
		
	}
	function getCurrentData(_gridId){
		var configs = NetStarGrid.configs[_gridId];
		if(typeof(configs)=='undefined'){
			configs = NetstarBlockList.configs[_gridId];
		}
		var returnData = [];
		if(!$.isEmptyObject(configs)){
			var templateConfig = NetstarTemplate.templates.configs[configs.gridConfig.package];
			returnData = getPageData(templateConfig);
		}
		return returnData;
	}
	function refreshByConfig(_config){
		//根据当前模板类型去刷新
		switch(_config.mode){
			case 'treeByTabGrid':
			case 'treeByListGrid':
				//根据当前选中树节点去刷新
				var treeNode = NetstarTemplate.tree.getSelectedNodes(_config.treeComponent.id)[0];
				refreshGridByTreeDataAndPackage(treeNode,_config.package);
				break;
			case 'tabGrid':
			case 'grid':
				//刷新list
				if(_config.mainComponent.isAjax){
					NetStarGrid.refreshById(_config.mainComponent.id);
				}else{
					var paramsData = NetStarGrid.configs[_config.mainComponent.id].gridConfig.ui.paramsData;
					refreshGridDataByAjax(_config.mainComponent.id,{},paramsData);
				}
				break;
		}
	}
	return{
		init: init,
		gridSelectedHandler:function(){},
		getPageData:getPageData,
		getCurrentData:getCurrentData,
		initComponentByFillValues:initComponentByFillValues,
		clearByAll:clearByAll,
		dialogBeforeHandler:dialogBeforeHandler,
		ajaxBeforeHandler:ajaxBeforeHandler,
		ajaxAfterHandler:ajaxAfterHandler,
		refreshByPackage:refreshByPackage,
		getSelectedDataByGridId:getSelectedDataByGridId,
		getSelectedDataByBlockGridId:getSelectedDataByBlockGridId,
		refreshByGridconfig:function(_gridId,_packageName){
			refreshByPackage(NetstarTemplate.templates.configs[_packageName]);
		},
		componentInit:componentInit,
		showPageData:showPageData,					//获取弹出界面参数
		closeHandler:closeHandler,
		refreshByConfig:refreshByConfig,
		setSendParamsByPageParamsData:NetstarTemplate.commonFunc.setSendParamsByPageParamsData,
		setSendPageParamsByTemplateConfig:NetstarTemplate.commonFunc.setSendPageParamsByTemplateConfig,
		getRowDataByBusinessEditConfigAjax:function(sourceParam,_value){
			var editorConfig = sourceParam.businessEditConfig;
			var ajaxConfig = $.extend(true,{},editorConfig.getRowData);
			var selectedList = {selectedList:_value};
			if(!$.isEmptyObject(ajaxConfig.data)){
				ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data, selectedList);
			}
			var contentType = 'application/json';
			if(ajaxConfig.contentType){
				contentType = ajaxConfig.contentType;
			}
			ajaxConfig.plusData = {package:sourceParam.package,template:sourceParam.template};
			NetStarUtils.ajax(ajaxConfig,function (data,ajaxPlusData) {
					if(data.success){
						var value = data[ajaxPlusData.dataSrc];
						var packageName = ajaxPlusData.plusData.package;
						NetstarTemplate.templates[ajaxPlusData.plusData.template].fillValues(value,packageName);
					}else{
						nsalert('返回值有误','error');
					}
			});
		},
		showBusiessEditConfigBtns:function(config,obj,soureParam){
			var _this = this;
			var btnsTemplate = '<div class="pt-panel">'
									+ '<div class="pt-container">'
										+ '<div class="pt-panel-row">'
											+ '<div class="pt-panel-col">'
												+ '<div class="pt-btn-group" :class="btnsClass">'
													+ '<button class="pt-btn pt-btn-default" v-on:click="selected" v-if="isSelect">{{selectName}}</button>'
													+ '<button class="pt-btn pt-btn-default" v-on:click="selectedclose" v-if="isSelectClose">{{selectCloseName}}</button>'
												+ '</div>'
											+ '</div>'
											+ '<div class="pt-panel-col">'
												+ '<div class="pt-btn-group" :class="btnsClass">'
													+ '<button class="pt-btn pt-btn-default" v-on:click="add" v-if="isAdd">{{addName}}</button>'
													+ '<button class="pt-btn pt-btn-default" v-on:click="query" v-if="isQuery">{{queryName}}</button>'
													+ '<button class="pt-btn pt-btn-default" v-on:click="close" v-if="isClose">{{closeName}}</button>'
												+ '</div>'
											+ '</div>'
										+ '</div>'
									+ '</div>'
								+ '</div>';
			var containerId = obj.config.footerIdGroup;
			var dialogId = obj.config.id;
			$('#' + containerId).html(btnsTemplate);
			var data = NetstarComponent.business.dialog.getBtnsData(config);
			config.btnsVueConfig = new Vue({
					el : '#' + containerId,
					data : data,
					watch: {},
					methods:{
							selected : function(){
									var pageFuncs = config.returnData;
									var panelInitParams = config.sendOutData;
									var _value = pageFuncs.selectHandler();
									var value = '';
									if(typeof(_value)=="object"){
											if($.isArray(_value)){
													value = $.extend(true, [], _value);
													if(value.length==0){
															value = false;
													}
											}else{
													value = $.extend(true, {}, _value);
													if($.isEmptyObject(value)){
															value = false;
													}
											}
									}else{
											value = _value;
											if(value.length==0){
													value = false;
											}
									}
									if(value){
											// 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
											NetstarTemplate.templates.businessDataBase.getRowDataByBusinessEditConfigAjax(soureParam,value);
											NetstarComponent.dialog[dialogId].vueConfig.close();
									}else{
											nsAlert('没有选中value值', 'error');
											console.error('value设置错误');
											console.error(_value);
									}
							},
							selectedclose : function(){
									var pageFuncs = config.returnData;
									var panelInitParams = config.sendOutData;
									// 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
									var _value = pageFuncs.selectHandler();
									var value = '';
									if(typeof(_value)=="object"){
											if($.isArray(_value)){
													value = $.extend(true, [], _value);
													if(value.length==0){
															value = false;
													}
											}else{
													value = $.extend(true, {}, _value);
													if($.isEmptyObject(value)){
															value = false;
													}
											}
									}else{
											value = _value;
											if(value.length==0){
													value = false;
											}
									}
									if(value){
											NetstarTemplate.templates.businessDataBase.getRowDataByBusinessEditConfigAjax(soureParam,value);
											NetstarComponent.dialog[dialogId].vueConfig.close();
									}else{
											nsAlert('没有选中value值', 'error');
											console.error('value设置错误');
											console.error(_value);
									}
							},
							add : function(){
									var pageFuncs = config.returnData;
									pageFuncs.addHandler();
							},
							query : function(){
									var pageFuncs = config.returnData;
									pageFuncs.queryHandler();
							},
							close : function(){
									NetstarComponent.dialog[dialogId].vueConfig.close();
							}
					},
					mounted: function(){},
			});
		},
		showPageByBusinessEditConfig:function(pageConfig,soureParam){
			var businessEditConfig = soureParam.businessEditConfig;
			var dialogId = 'dialog-panel-businsseditConfig';
			 var dialogConfig = {
				id: dialogId,
				title: businessEditConfig.dialogTitle,
				templateName: 'PC',
				height:520,
				width : 700,
				isStore : true,
				plusClass : 'pt-business-dialog',
				shownHandler : function(obj){
				   var panelInitParams = {
					  pageParam:                  {},             
					  config:                     pageConfig,                     // 模板配置 通过请求的页面拿到的
					  componentConfig:{
							editorConfig:businessEditConfig,
							container:obj.config.bodyId,
							selectMode:             businessEditConfig.selectMode,     // 单选 多选 不能选 通过组件拿到（组件配置）
							componentClass :        'list',                         // 组件类别 默认list
							doubleClickHandler:function(_value){
								if(_value.length == 0){
									nsAlert('没有选中数据','warning');
									return false;
								}
								var value = '';
								if(typeof(_value)=="object"){
									if($.isArray(_value)){
										value = $.extend(true, [], _value);
									}else{
										value = $.extend(true, {}, _value);
									}
								}else{
									value = _value;
								}           
								// 显示弹框 传入的双击方法 （关闭弹框和刷新value/inputText）
								NetstarTemplate.templates.businessDataBase.getRowDataByBusinessEditConfigAjax(soureParam,value);
								//NetstarTemplate.templates[soureParam.template].fillValues(value,soureParam.package);
								NetstarComponent.dialog[obj.config.id].vueConfig.close();
							},
							closeHandler:            function(){
								NetstarComponent.dialog[obj.config.id].vueConfig.close();
							}
					  },
				  };
				  businessEditConfig.returnData = NetstarTemplate.componentInit(panelInitParams);
				  NetstarTemplate.templates.businessDataBase.showBusiessEditConfigBtns(businessEditConfig,obj,soureParam);
				},
				hiddenHandler : function(obj){
					$(document).off('keyup',documentKeyupHandler);
				},
			};
			NetstarComponent.dialogComponent.init(dialogConfig);
		},
		businessEditConfigClick:function(_sourceParams){
			var sourceAjaxConfig = _sourceParams.businessEditConfig.source;
			var ajaxConfig = {
				pageIidenti:sourceAjaxConfig.url,
				paramObj:{},
				config:{sourceParam:_sourceParams},
				url:sourceAjaxConfig.url,
				type:sourceAjaxConfig.type,
				data:sourceAjaxConfig.data,
				dataType:'text',
				plusData:{
					sourceParam:_sourceParams,
				},
				contentType:sourceAjaxConfig.contentType,
				callBackFunc:function(isSuccess,data,_pageConfig){
					if(isSuccess){
						var _configStrObj = _pageConfig.config.sourceParam;
						var _configStr = JSON.stringify(_configStrObj);
						var funcStr = 'NetstarTemplate.templates.businessDataBase.showPageByBusinessEditConfig(pageConfig,'+_configStr+')';
						var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
						var $container = nsPublic.getAppendContainer();
						var $containerPage = $(containerPage);
						$container.append($containerPage);
					}
				}
			};
			pageProperty.getAndCachePage(ajaxConfig);
		},//业务组件点击事件 在按钮上点击
	};
})(jQuery)
/******************** 表格模板 end ***********************/