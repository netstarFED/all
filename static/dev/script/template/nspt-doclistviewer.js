/*
 * @Desription: 文件说明
 * @Author: netstar.sjj
 * @Date: 2019-12-12 17:54:15
 * @LastEditTime: 2019-12-13 18:20:30
 * @descrition 单据详表  docListViewer
 * 显示模式
 * 1.两个list加一个blockList 其中一个list为主数据，另一个list和blockList为同级结构的数据（expandlist）
 * 2.纵向展示 两个list 并列展示,适用于上表格+下tab中多个list表格 （vertical） 
 * 3.横向展示 两个list 左右输出(horizontal)
 * 4.单表格 只输出一个list或者blockList的表格(grid)
 */
/******************** 单据详表   start ***********************/
NetstarTemplate.templates.docListViewer = (function(){
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
		var config = NetstarTemplate.templates.docListViewer.data[templateId].config;
		var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
		var isSendPageParams = typeof(controllerObj.isSendPageParams)=='boolean' ? controllerObj.isSendPageParams : true;//是否发送当前界面参数
		var requestSource = controllerObj.requestSource ? controllerObj.requestSource : 'selected';//默认读取选中行的操作，当前模板是单选
		if($.isEmptyObject(controllerObj)){
			//当这个配置属性为空的时候 来源可能是自定义的不是配置的
			requestSource = 'checkbox';
		}
		//需要判断当前按钮的操作对象 
		var operatorObject = controllerObj.targetField ? controllerObj.targetField : 'root';
		var mainComponent = config.mainComponent;
		if(isSendPageParams === false){
			data.value = {};
		}else{
			//根据当前按钮定义的类型获取值
			if(!$.isEmptyObject(data.rowData)){
				data.value = data.rowData;//行内按钮直接获取当前操作行的值
				NetstarTemplate.templates.docListViewer.setSendParamsByPageParamsData(data.value,config);
			}else{
				if(operatorObject == 'root'){
					var selectedDataByMain = NetStarGrid.getSelectedData(mainComponent.id);//主表选中值
					var checkboxedDataByMain = NetStarGrid.getCheckedData(mainComponent.id);//主表勾选值
					switch(requestSource){
						case 'thisVo':
							if(selectedDataByMain.length == 0){
								data.value = false;
							}else{
								data.value = selectedDataByMain[0];
								if(!$.isEmptyObject(config.tabConfig.listConfig)){
									for(var detailId in config.tabConfig.listConfig){
										var gridComponent = config.tabConfig.listConfig[detailId];
										var detailValue = NetStarGrid.getSelectedData(gridComponent.id);
										if($.isArray(detailValue)){
											data.value[gridComponent.keyField] = detailValue;
										}
									}
								}
							}
							break;
						case 'selected':
							if(selectedDataByMain.length == 0){
								data.value = false;
							}else{
								data.value = selectedDataByMain[0];
								NetstarTemplate.templates.docListViewer.setSendParamsByPageParamsData(data.value,config);
							}
							break;
						case 'checkbox':
							if(checkboxedDataByMain.length == 0){
								data.value = false;
								if(selectedDataByMain.length == 1){
									data.value = {
										selectedList:selectedDataByMain
									}
								}
							}else{
								data.value = {
									selectedList:checkboxedDataByMain
								};
							}
							break;
					}
				}else{
					//根据operatorObject获取值
					if(!$.isEmptyObject(config.tabConfig.listConfig)){
						var currentOperatorGrid = {};
						for(var detailId in config.tabConfig.listConfig){
							var gridComponent = config.tabConfig.listConfig[detailId];
							if(gridComponent.keyField == operatorObject){
								currentOperatorGrid = gridComponent;
								break;
							}
						}
						if(!$.isEmptyObject(currentOperatorGrid)){
							var currentSelectedByGrid = NetStarGrid.getSelectedData(currentOperatorGrid.id);
							if(requestSource == 'checkbox'){
								data.value = {
									selectedList:NetStarGrid.getCheckedData(currentOperatorGrid.id),
								};
							}else{
								if(currentSelectedByGrid.length == 1){
									data.value = currentSelectedByGrid[0];
									NetstarTemplate.templates.docListViewer.setSendParamsByPageParamsData(data.value,config);
								}
							}
						}
					}
				}
			}
			NetstarTemplate.templates.docListViewer.setSendPageParamsByTemplateConfig(config.pageParam,controllerObj.data,data.value);
		}
		data.btnOptionsConfig = {
			options:{
				idField:mainComponent.idField
			},
			descritute:{
				keyField:mainComponent.keyField,
				idField:mainComponent.idField
			}
		}
		data.config = config;
		return data;
	}
	//ajax执行之前的回调函数
	function ajaxBeforeHandler(handlerObj,templateId){
		var config = NetstarTemplate.templates.docListViewer.data[templateId].config;
		handlerObj.config = config;
		handlerObj.ajaxConfigOptions = {
			idField:config.mainComponent.idField,
			keyField:config.mainComponent.keyField,
			pageParam:config.pageParam,
		};
		var ajaxConfig = typeof(handlerObj.ajaxConfig)=='object' ? handlerObj.ajaxConfig : {};
		var requestSource = ajaxConfig.requestSource ? ajaxConfig.requestSource : 'selected';
		var selectedDataByMain = {};
		if(config.mainComponent.type == 'blockList'){
			selectedDataByMain = NetstarBlockList.getSelectedData(config.mainComponent.id);
		}else{
			selectedDataByMain = NetStarGrid.getSelectedData(config.mainComponent.id);
		}
		if($.isEmptyObject(handlerObj.value)){
			if(requestSource == 'checkbox'){
				var selectedData = NetStarGrid.getCheckedData(config.mainComponent.id);
				if(selectedData.length == 0){
					if(selectedDataByMain.length == 1){
						handlerObj.value = {
							selectedList:selectedDataByMain
						}
					}
				}else{
					handlerObj.value = {
						selectedList:selectedData,
					};
				}
			}else{
				if(selectedDataByMain.length > 0){
					handlerObj.value = selectedDataByMain[0];
					NetstarTemplate.templates.docListViewer.setSendParamsByPageParamsData(handlerObj.value,config);
				}
			}
			NetstarTemplate.templates.docListViewer.setSendPageParamsByTemplateConfig(config.pageParam,ajaxConfig.data,handlerObj.value);
		}
		return handlerObj;
	}
	//ajax完成之后对界面进行的操作
	function ajaxAfterHandler(res,templateId,plusData){
		var config = NetstarTemplate.templates.docListViewer.data[templateId].config;
		plusData = typeof(plusData)=='object' ? plusData : {};
		var newData = $.extend(true,{},res);
		delete newData.objectState;
		var mainComponent = config.mainComponent;
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
			if($.isArray(res)){
				//刷新主表
				NetStarGrid.resetData(res,mainComponent.id);	
			}else{
				switch(res.objectState){
					case NSSAVEDATAFLAG.DELETE:
						//删除
						//主表值删除数据  
						NetStarGrid.delRow(res,config.mainComponent.id);
						//如果当前有子表 则应该根据当前主表选中值去刷新子表数据
						if(!$.isEmptyObject(config.tabConfig.queryConfig)){
							var selectedData = NetStarGrid.getSelectedData(config.mainComponent.id);
							if(selectedData.length == 1){
								refreshGridDataByConfig(config,selectedData[0]);
							}
						}
						break;
					case NSSAVEDATAFLAG.EDIT:
						//修改
						// 添加编辑后修改编辑行数据 原来此方法没有，这里什么都没有执行 lyw 20200409 修改bug：修改后行数据没有刷新
						NetStarGrid.editRow(res, config.mainComponent.id);
						break;
					case NSSAVEDATAFLAG.ADD:
						//添加
						NetStarGrid.addRow(res,config.mainComponent.id);	
						break;
					case NSSAVEDATAFLAG.VIEW:
						//刷新
						var selectedData = NetStarGrid.getSelectedData(config.mainComponent.id);
						if($.isArray(selectedData)){
							if(selectedData.length == 1){
								var gridConfig = NetStarGrid.configs[config.mainComponent.id].gridConfig;
								var idField = gridConfig.data.idField;
								var gridArr = NetStarGrid.dataManager.getData(config.mainComponent.id);
								var defaultSelectedIndex = -1;
								for(var i=0; i<gridArr.length; i++){
									if(gridArr[i][idField] == selectedData[0][idField]){
										defaultSelectedIndex = i;
										break;
									}
								}
								if(defaultSelectedIndex > -1){
									gridConfig.ui.defaultSelectedIndex = defaultSelectedIndex;
								}
							}
						}
						if(config.mainComponent.isAjax){
							NetStarGrid.refreshById(config.mainComponent.id);
						}else{
							var paramsData = NetStarGrid.configs[templateConfig.mainComponent.id].gridConfig.ui.paramsData;
							refreshGridDataByAjax(templateConfig.mainComponent,{},paramsData,refreshGridByData);
						}
						//sjj 20190515刷新了主表之后会执行主表的drawHandler事件，如果数据发生了变化就会去刷新子表数据
						break;
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
	//刷新列表数据根据ajax
	function refreshGridDataByAjax(_componentConfig,paramsData,paramJson,_callBackFunc){
		var templateConfig = NetstarTemplate.templates.configs[_componentConfig.package];
		var ajaxConfig = $.extend(true,{},_componentConfig.ajax);
		ajaxConfig.data = typeof(ajaxConfig.data)=='object' ? ajaxConfig.data : {};
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

		NetstarTemplate.templates.docListViewer.setSendParamsByPageParamsData(ajaxConfig.data,templateConfig);

		ajaxConfig.plusData = {componentConfig:_componentConfig,callBackFunc:_callBackFunc};

		NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
			if(res.success){
				var resData = res[ajaxOptions.dataSrc] ? res[ajaxOptions.dataSrc] : {};
				var _componentByConfig = ajaxOptions.plusData.componentConfig;
				var templateConfig = NetstarTemplate.templates.configs[_componentByConfig.package];
				if(typeof(ajaxOptions.plusData.callBackFunc)=='function'){
					ajaxOptions.plusData.callBackFunc(templateConfig.mainComponent,resData);
				}else{
					if(!$.isEmptyObject(templateConfig.tabConfig.listConfig)){
						for(var gid in templateConfig.tabConfig.listConfig){
							var gJson = templateConfig.tabConfig.listConfig[gid];
							var displayMode = 'table';
							if(gJson.type == 'blockList'){
								displayMode = 'block';
							}
							var gridArray = resData[gJson.keyField];
							if(!$.isArray(gridArray)){gridArray = [];}
							if(gridArray.length > 0){
								$('a[ns-href-id="'+gJson.id+'"]').children('span').html(gridArray.length);
							}else{
								$('a[ns-href-id="'+gJson.id+'"]').children('span').html('');
							}
							NetStarGrid.resetData(gridArray,gJson.id,displayMode);
						}
					}
				}
			}else{
				nsalert('返回值为false','error');
			}
		},true)
	}
	function refreshGridDataByConfig(_config,_innerParams){
		if($.isEmptyObject(_innerParams)){
			//没有入参子表数据为空
			if(!$.isEmptyObject(_config.tabConfig.listConfig)){
				for(var gid in _config.tabConfig.listConfig){
					var gJson = _config.tabConfig.listConfig[gid];
					var displayMode = 'table';
					if(gJson.type == 'blockList'){
						displayMode = 'block';
					}
					NetStarGrid.resetData([],gJson.id,displayMode);
				}
			}
		}else{
			if(!$.isEmptyObject(_config.tabConfig.queryConfig)){
				refreshGridDataByAjax(_config.tabConfig.queryConfig,_innerParams);
			}else{
				if(!$.isEmptyObject(_config.detailBlockListConfig)){
					refreshGridDataByAjax(_config.detailBlockListConfig,_innerParams);
				}
			}
		}
	}
	function drawHandlerByMainGrid(_vueData){
		var gridId = _vueData.$options.id;
		var grid = {};
		switch(_vueData.ui.displayMode){
			case 'block':
				grid = NetstarBlockList.configs[gridId];
				break;
			default:
				grid = NetStarGrid.configs[gridId];
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
			var currentSelectedData = {};
			if(selectedIndex > -1){
				//存在选中行的值
				var data = originalRows[selectedIndex+startI];
				currentSelectedData = originalRows[selectedIndex+startI];
				//查找按钮是否设置了禁用
				NetStarUtils.setBtnsDisabled(config.mainBtnArray,data);
				refreshGridDataByConfig(config,data);
			}else{
				refreshGridDataByConfig(config,{});
			}
			//需要判断按钮的来源来决定按钮是否应该处于禁用状态 sjj 20190423
			var isDisabled = false;
			if(rowsData.length == 0){
				//无数据 此时需要判断按钮的来源来决定按钮是否应该处于禁用状态 sjj 20190423 
				isDisabled = true;
			}
			NetStarUtils.setBtnsDisabledByRequestSource(config.mainBtnArray,isDisabled);

			//sjj 20200206 判断是否设置了readonlyExpresion hiddenExpression表达式的逻辑处理
			setReadonlyByReadonlyExpression(config,currentSelectedData);
		}
	}
	function refreshGridByData(_gridConfig,_data){
		if(!$.isArray(_data)){_data = [];}
		NetStarGrid.resetData(_data,_gridConfig.id);
	}
	function callBackFuncByQueryByMainGrid(_gridConfig,packageName,paramJson,_queryType){
		_queryType = typeof(_queryType)=='undefined' ? '' : _queryType;
		var templateConfig = NetstarTemplate.templates.configs[packageName];
		if(_queryType == 'advance'){
			refreshGridDataByAjax(templateConfig.mainComponent,{},paramJson,refreshGridByData);
		}else{
			refreshGridDataByAjax(templateConfig.mainComponent,{},paramJson,refreshGridByData);
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
			ajaxSuccessHandler:function(rows,gridId){},
			drawHandler:drawHandlerByMainGrid,
			//title:mainGridComponent.title,//表格标题
			isOpenQuery:true,//是否开启查询
			isOpenAdvanceQuery:true,//是否开启高级查询
			isOpenFormQuery : isOpenFormQuery,
			completeHandler:function(){
				
			},
			paramsData:paramsData,
			//callBackFuncByQuery:function(_gridConfig,packageName,paramJson){}
		};
		if(mainGridComponent.params.displayMode =='treeGrid'){
			defaultParams.pageLengthDefault = 100000;
			defaultParams.isPage = false;
			defaultParams.isKeepSelected = true;
		}
		if(mainGridComponent.type == 'blockList'){
			defaultParams.isCheckSelect = false;
			defaultParams.listExpression = mainGridComponent.listExpression;
		}
		if(mainGridComponent.isAjax == false){
			defaultParams.callBackFuncByQuery = callBackFuncByQueryByMainGrid;
		}
		if(!$.isEmptyObject(_customUI)){
			$.each(_customUI,function(k,v){
				defaultParams[k] = v;
			});
		}
		NetStarUtils.setDefaultValues(mainGridComponent.params,defaultParams);
	}
	//调用各个组件初始化
	function initComponentInit(_config){
		var componentsConfig = _config.componentsConfig;
		var availableHeight = 0;
		var titleHeight = 0;//标题高
		var rootBtnHeight = 0;//顶部按钮的高度
		if(_config.title){
			titleHeight = 28;
		}
		availableHeight = $(window).outerHeight()-35-30-titleHeight;//35是标签的高度 30是padding值
		var rootBtnConfig = _config.btnKeyFieldJson.root;
		if(!$.isEmptyObject(rootBtnConfig)){
			rootBtnHeight = 34;
			availableHeight = availableHeight - rootBtnHeight;
		}
		_config.availableHeight = availableHeight;
		setUIByMainGrid(_config);
		var modeStr = _config.mode.toLocaleLowerCase();
		if(modeStr == 'expandlist'){
			var tabBtnHeight = 0;
			if(!$.isEmptyObject(_config.btnKeyFieldJson[_config.detailListConfig.keyField])){
				tabBtnHeight = 34;
			}
			var defaultUIConfig = {
				delay:500,//设定延时0.5秒
				pageLengthDefault:10,
				minPageLength:10,
				height:parseFloat((_config.availableHeight-tabBtnHeight)/2),
			}; 
			$.each(defaultUIConfig,function(k,v){
				componentsConfig[_config.mainComponent.type][_config.mainComponent.id].params[k] = v;
			})
			var defaultParamsByUI = {
				pageLengthDefault:10,
				minPageLength:10,
				height:parseFloat((_config.availableHeight-tabBtnHeight)/2),
				isPage:true,
				selectMode:'single',
				isCheckSelect:true,
			};
			NetStarUtils.setDefaultValues(componentsConfig.list[_config.detailListConfig.id].params,defaultParamsByUI);

			var defaultParamsBlcokByUI = {
				isCheckSelect:false,
				height:_config.availableHeight,
				isPage:false,
				selectMode:'single',
				listExpression:componentsConfig.blockList[_config.detailBlockListConfig.id].listExpression
			};
			NetStarUtils.setDefaultValues(componentsConfig.blockList[_config.detailBlockListConfig.id].params,defaultParamsBlcokByUI);
		}else{
			if(!$.isEmptyObject(_config.tabConfig.listConfig)){
				//存在子表
				var defaultUIConfig = {
					delay:500,//设定延时0.5秒
					pageLengthDefault:10,
					minPageLength:10,
					height:parseFloat((_config.availableHeight - 50)/2),
				}; 
				$.each(defaultUIConfig,function(k,v){
					componentsConfig[_config.mainComponent.type][_config.mainComponent.id].params[k] = v;
				})
				for(var gJson in _config.tabConfig.listConfig){
					var gConfig = _config.tabConfig.listConfig[gJson];
					var defaultParamsByUI = {
						pageLengthDefault:10,
						minPageLength:10,
						height:parseFloat((_config.availableHeight - 50)/2),
						isPage:true,
						selectMode:'single',
					};
					NetStarUtils.setDefaultValues(gConfig.params,defaultParamsByUI);
				}
			}
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
	//输出容器
	function initContainer(config){
		var titleHtml = '';
		if(config.title){
			//定义了标题
			titleHtml = '<div class="pt-main-row doclistviewer-title">'
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
		var modeStr = config.mode.toLocaleLowerCase();
		var contentHtml = ''; 
		var mainBtnHtml = '';
		if(config.btnKeyFieldJson['root']){
			var bId = config.btnKeyFieldJson['root'].id;
			mainBtnHtml = '<div class="pt-main-row">'
							+'<div class="pt-main-col">'
								+'<div class="pt-panel">'
									+'<div class="pt-container">'
										+'<div class="pt-panel-row">'
											+'<div class="pt-panel-col">'
												+'<div class="nav-form main-btns" id="'+bId+'"></div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
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
													+'<span class="pt-tab-value"></span>'
												+'</a>'
											+'</li>';
				tabContentHtml += '<div class="pt-tab-content '+activeClassStr+'">'
									+'<div class="pt-tab-components" id="'+listConfig.id+'"></div>'
								+'</div>';
				listNum++;
			}
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

		switch(modeStr){
			case 'expandlist':
				//左侧两个list 右侧blocklist 不存在tab 子表一个list，一个blockList 分别是两个ajax 入参为主表的id
				config.detailListConfig = {};
				config.detailBlockListConfig = {};

				for(var gid in config.componentsConfig.list){
					var gJson = config.componentsConfig.list[gid];
					if(gJson.id != config.mainComponent.id){
						config.detailListConfig = gJson;
						break;
					}
				}
				for(var gid in config.componentsConfig.blockList){
					var gJson = config.componentsConfig.blockList[gid];
					config.detailBlockListConfig = gJson;
				}
				var listBtnHtml = '';
				if(config.btnKeyFieldJson[config.detailListConfig.keyField]){
					var listBtnConfig = config.btnKeyFieldJson[config.detailListConfig.keyField];
					listBtnHtml = '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+listBtnConfig.id+'"></div>'
									+'</div>';
				}
				var blockBtnHtml = '';
				if(config.btnKeyFieldJson[config.detailBlockListConfig.keyField]){
					var blockBtnConfig = config.btnKeyFieldJson[config.detailBlockListConfig.keyField];
					blockBtnHtml = '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+blockBtnConfig.id+'"></div>'
									+'</div>';
				}
				contentHtml = '<div class="pt-container">'
								+mainBtnHtml
								+'<div class="pt-main-row">'
									+'<div class="pt-main-col" ns-position="left">'
										+'<div class="pt-panel">'
											+'<div class="pt-panel-container" id="'+config.mainComponent.id+'"></div>'
										+'</div>'
										+listBtnHtml
										+'<div class="pt-panel">'
											+'<div class="pt-panel-container" id="'+config.detailListConfig.id+'"></div>'
										+'</div>'
									+'</div>'
									+'<div class="pt-main-col pt-col-auto  pt-col-fixed" ns-position="right">'
										+blockBtnHtml
										+'<div class="pt-panel">'
											+'<div class="pt-panel-container" id="'+config.detailBlockListConfig.id+'"></div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>';
				break;
			case 'horizontal':
				//左侧块状表格 右侧list 
				var classStr = 'component-'+config.mainComponent.type.toLocaleLowerCase();
				var mainGridHtml = '<div class="pt-main-col limsreg-left">'
									+'<div class="pt-panel">'
										+'<div class="pt-container">'
											+'<div class="'+classStr+'" id="'+config.mainComponent.id+'"></div>'
										+'</div>'
									+'</div>'
								+'</div>';
				var detailContentHtml = '';
				if(tabHtml){
					//左侧块状表格 右侧tab多个list
					detailContentHtml = tabHtml;
				}else{
					//这种模式下只能有一个子表
					config.detailGridConfig = {};
					for(var gid in config.tabConfig.listConfig){
						var gJson = config.tabConfig.listConfig[gid];
						if(gJson.id != config.mainComponent.id){
							config.detailGridConfig = gJson;
							break;
						}
					}
					detailContentHtml = '<div class="component-list" id="'+config.detailGridConfig.id+'"></div>';
				}
				var detailListHtml = '<div class="pt-main-col limsreg-right">'
										+'<div class="pt-panel">'
											+'<div class="pt-container">'
												+detailContentHtml
											+'</div>'
										+'</div>'
									+'</div>';
				contentHtml = titleHtml + mainBtnHtml + '<div class="pt-main-row">'+mainGridHtml+detailListHtml+'</div>';
				break;
			case 'vertical':
				//并列展示
				var classStr = 'component-'+config.mainComponent.type.toLocaleLowerCase();
				var mainGridHtml = '<div class="pt-main-row">'
										+'<div class="pt-main-col">'
											+'<div class="pt-panel">'
												+'<div class="pt-container">'
													+'<div class="'+classStr+'" id="'+config.mainComponent.id+'"></div>'
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>';
				contentHtml = titleHtml + mainBtnHtml + mainGridHtml + tabHtml;
				break;
		}

		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		var templateClassStr = '';
		if(config.plusClass){
			templateClassStr = config.plusClass;
		}
		var html = '<div class="pt-main doclistviewer '+templateClassStr+'" id="'+config.id+'" pt-mode="'+modeStr+'" ns-package="'+config.package+'">'+contentHtml+'</div>';
		if(config.$container){
			config.$container.html(html);
		}else{
			$container.prepend(html);//输出面板
		}
	}
	//设置默认参
	function setDefault(_config){
		_config.tabConfig = {
			id:"tab-"+_config.id,
			queryConfig:{},
			listConfig:{},
			templatesConfig:_config
		};
		_config.mainBtnArray = [];
		if(typeof(_config.mode)=='undefined'){_config.mode = 'vertical';}
		if(_config.mode == 'listgrid'){_config.mode = '';}
	}
	//初始化
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
		NetstarTemplate.commonFunc.setComponentDataByConfig(_config);
		if($.isEmptyObject(_config.mainComponent)){
			_config.tabConfig.queryConfig = {};
			_config.tabConfig.listConfig = {};
			//一种情况 配置参数出错
			for(var i=0; i<_config.components.length; i++){
				var componentData = _config.components[i];
				componentData.package = _config.package;
				componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
				if(componentData.type == 'blockList' || componentData.type == 'list'){
					componentData.isAjax = true;
					_config.mainComponent = _config.components[i];
					break;
				}
			}
		}
		initContainer(_config);//输出容器结构
		initComponentInit(_config);
	}
	function componentInit(){}
	function refreshByGridconfig(_gridId,_packageName){
		refreshByPackage(NetstarTemplate.templates.configs[_packageName]);
	}
	function refreshData(data,sourceData){
		refreshByPackage(data,sourceData);
	}
	function refreshByConfig(_config,isKeepCurrentState){
		isKeepCurrentState = typeof(isKeepCurrentState)=='boolean' ? isKeepCurrentState : true;
		var currentGridJson = {
			page:NetStarGrid.configs[_config.mainComponent.id].vueObj.domParams.toPageInput.value-1,//当前页码
			selectedData:NetStarGrid.getSelectedData(_config.mainComponent.id),//当前选中值
			checkedData:NetStarGrid.getCheckedData(_config.mainComponent.id),//当前勾选值
		};
		if(_config.mainComponent.isAjax){
			NetStarGrid.refreshById(_config.mainComponent.id);
		}else{
			var paramsData = NetStarGrid.configs[_config.mainComponent.id].gridConfig.ui.paramsData;
			refreshGridDataByAjax(_config.mainComponent,{},paramsData,refreshGridByData);
		}
		if(isKeepCurrentState){
			var selectedIds = [];
			var checkedIds = [];
			if(_config.mainComponent.idField){
				for(s=0; s<currentGridJson.selectedData.length; s++){
					if(currentGridJson.selectedData[s][_config.mainComponent.idField]){
						selectedIds.push(currentGridJson.selectedData[s][_config.mainComponent.idField]);
					}
				}
				for(c=0; c<currentGridJson.checkedData.length; c++){
					if(currentGridJson.checkedData[c][_config.mainComponent.idField]){
						checkedIds.push(currentGridJson.checkedData[c][_config.mainComponent.idField]);
					}
				}
				setTimeout(function(){
					var gridConfig = NetStarGrid.configs[_config.mainComponent.id].gridConfig;
					var vueData = NetStarGrid.configs[_config.mainComponent.id].vueObj;
					NetStarGrid.dataManager.toPageByNumber(currentGridJson.page,gridConfig,vueData);//保持操作前的页
					var rows = NetStarGrid.configs[_config.mainComponent.id].vueObj.rows;
					for(var i=0; i<rows.length; i++){
						var rData = rows[i];
						rData.netstarCheckboxSelectedFlag = false;
						rData.netstarSelectedFlag = false;
						if(checkedIds.indexOf(rData[_config.mainComponent.idField])>-1){
							rData.netstarCheckboxSelectedFlag = true;
						}
						if(selectedIds.indexOf(rData[_config.mainComponent.idField])>-1){
							rData.netstarSelectedFlag = true;
						}
					}
				},1000);
			}else{
				console.warn('缺少主键状态');
			}
		}
	}
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
		var config = NetstarTemplate.templates.docListViewer.data[templateId].config;
		var gridId = config.mainComponent.id;
		refreshByConfig(config);
	}
	return{
		init:init,
		dialogBeforeHandler:dialogBeforeHandler,
		ajaxBeforeHandler:ajaxBeforeHandler,
		ajaxAfterHandler:ajaxAfterHandler,
		refreshByConfig:refreshByConfig,
		refreshByGridconfig:refreshByGridconfig,
		refreshData:refreshData,
		componentInit:componentInit,
		refreshByPackage:refreshByPackage,
		gridSelectedHandler:function(){},
		setSendParamsByPageParamsData:NetstarTemplate.commonFunc.setSendParamsByPageParamsData,
		setSendPageParamsByTemplateConfig:NetstarTemplate.commonFunc.setSendPageParamsByTemplateConfig,
	}
})(jQuery)
/******************** 单据详表 end ***********************/