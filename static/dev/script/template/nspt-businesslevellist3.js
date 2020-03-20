/*
	*3级数据联动 块状表格（主表） 详情表（块状表格+list表格
	* @Author: netstar.sjj
	* @Date: 2019-06-19 10:45:00
	* 数据关系 {id:'333',saleList:[{saleId:'33',price:33,customerList:[{customerId:'333'}]}]} 
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.businesslevellist3 = (function(){
	/***************组件事件调用 start**************************** */
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
		var idField = config.mainComponent.idField;
		var keyField = config.mainComponent.keyField;
		switch(operatorObject){
			case 'detail':
				idField = config.levelConfig[2].idField;
				keyField = config.levelConfig[2].keyField;
				data.value = getDetailsSelectedData(config,controllerObj);
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
		var gridConfig = config.mainComponent;
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
		var mainListId = _config.mainComponent.id;
		var data = [];
		switch(_config.mainComponent.type){
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
	function getDetailsSelectedData(_config,controllerObj){
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
				var isWhole = false;
				if(controllerObj){
					if(controllerObj.requestSource == 'thisVo'){
						isWhole = true;
					}
				}
				if(isWhole){
					level3ListSelectedData = NetStarGrid.dataManager.getData(level3ListId);
				}else{
					switch(_config.levelConfig[3].type){
						case 'blockList':
							level3ListSelectedData = NetstarBlockList.getSelectedData(level3ListId);
							break;
						case 'list':
							level3ListSelectedData = NetStarGrid.getSelectedData(level3ListId);
							break;
					}
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
	// 主表设置按钮只读
	function setMainBtnsDisabled(data, gridConfig){
		// lyw 设置主表按钮是否只读   根据NETSTAR-TRDISABLE(行只读)(获得消息后行设置了只读按钮禁用了，选中其他行时需要取消禁用)
		var config = NetstarTemplate.templates.configs[gridConfig.package];
		var rootConfig = config.mainComponent;
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
						switch(templateConfig.levelConfig[3].type){
							case 'blockList':
								NetstarBlockList.refreshDataById(templateConfig.levelConfig[3].id,[]);
								break;
							case 'list':
								NetStarGrid.refreshDataById(templateConfig.levelConfig[3].id,[]);
								break;
						}
					}
				}
			}else{
				nsalert(res.msg,'warning');
			}
		},true);
	}
	function mainGridSelectedHandler(data,_rows,_vueData,gridConfig){
		//刷新二级数据
		var componentConfig = NetstarTemplate.templates.configs[gridConfig.package].levelConfig[2];
		refreshListAjaxByData(componentConfig.ajax,data,componentConfig);
		// lyw 设置主表按钮是否只读   根据NETSTAR-TRDISABLE(行只读)(获得消息后行设置了只读按钮禁用了，选中其他行时需要取消禁用)
		setMainBtnsDisabled(data, gridConfig);
	}
	function mainGridAjaxSuccessHandler(resData,_gridId){
		var templateId =_gridId.substring(0,_gridId.lastIndexOf('-blockList'));
		if(templateId == ''){
			templateId = _gridId.substring(0,_gridId.lastIndexOf('-list'));
		}
		var templateConfig = NetstarTemplate.templates.businesslevellist3.data[templateId].config;
		var componentConfig = templateConfig.levelConfig[2];
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
	function mainGridDrawHandler(){

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
	function mainGridQuickqueryInit(gridConfig){
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
						//searchType:formJson.filtermode,
						keyword:formJson.filterstr,
						quicklyQueryColumnValue:formJson.filterstr,
					};
					if(mainConfig.params){
						if(mainConfig.params.query){
							if(mainConfig.params.query.quickQueryFieldArr.length > 0){
								paramJson.quicklyQueryColumnNames = mainConfig.params.query.quickQueryFieldArr;
							}
						}
					}
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
	function mainGridCompleteHandler(_configs){
		var gridConfig = _configs.gridConfig;
		setMainGridQueryTableHtml(gridConfig);
		mainGridQuickqueryInit(gridConfig);
	}
	function gridLevel2SelectHandler(data,_rows,_vueData,gridConfig){
		//刷新三级数据
		var componentConfig = NetstarTemplate.templates.configs[gridConfig.package].levelConfig[3];
		refreshListAjaxByData(componentConfig.ajax,data,componentConfig);
	}
	function gridLevel2DrawHandler(){

	}
	function gridLevel2CompleteHandler(){

	}
	/***************组件事件调用 end************************** */
	//组件初始化
	function initComponent(_config){
		for(var componentType in _config.componentsConfig){
			var componentData = _config.componentsConfig[componentType];
			switch(componentType){
			   case 'vo':
				  NetstarTemplate.commonFunc.vo.initVo(componentData,_config);
				  break;
			   case 'list':
					if(componentData[_config.levelConfig[2].id]){
						//list是第二层
						componentData[_config.levelConfig[2].id].params = {
							selectedHandler:gridLevel2SelectHandler, // lyw 20190925 二级面板是list时选中行刷新三级模板（之前没有）
							height:parseFloat((_config.commonPanelHeight - 50)/2),
						};
					}else if(componentData[_config.levelConfig[3].id]){
							//list是第三层
						var gridHeight = _config.commonPanelHeight - 34;
						if(_config.mode == 'listgrid'){
							gridHeight = parseInt(_config.commonPanelHeight/2);
						}
						componentData[_config.levelConfig[3].id].params = {
							height:gridHeight
						};
					}
					NetstarTemplate.commonFunc.list.initList(componentData,_config);
				  break;
			   case 'blockList':
					if(componentData[_config.levelConfig[2].id]){
						//list是第二层
						var gridHeight = 34;
						if(_config.mode == 'listgrid'){
							gridHeight = _config.commonPanelHeight;
						}
						componentData[_config.levelConfig[2].id].params = {
							height:gridHeight,
							selectedHandler:gridLevel2SelectHandler,
							drawHandler:gridLevel2DrawHandler,
							completeHandler:gridLevel2CompleteHandler
						};
					}else if(componentData[_config.levelConfig[3].id]){
						componentData[_config.levelConfig[3].id].params.height = parseFloat((_config.commonPanelHeight - 50)/2);
					}
				  	NetstarTemplate.commonFunc.blockList.initBlockList(componentData,_config);
				  break;
			   case 'btns':
				  	NetstarTemplate.commonFunc.btns.initBtns(componentData,_config);
				  break;
			}
		}
		if(!$.isEmptyObject(_config.btnKeyFieldJson)){
			for(var btnId in _config.btnKeyFieldJson){	
				if(_config.btnKeyFieldJson[btnId].inlineBtns.length > 0){
					vueButtonComponent.init({
						id:_config.btnKeyFieldJson[btnId].id,
						btns:_config.btnKeyFieldJson[btnId].inlineBtns,
						package:_config.package,
					});
				}
			}
		}
	}
	//初始化容器面板
	function initContainer(_config){
		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
		}
		var addPlusClass = '';
		if(_config.mode == 'listgrid'){
			addPlusClass = 'pt-col-auto';
		}
		var html = '<div class="pt-main businesslevellist3 '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
                     +'<div class="pt-container">'
						+'<div class="pt-main-row">'
							+'<div class="pt-main-col '+addPlusClass+'" ns-position="left">'
								
							+'</div>'
							+'<div class="pt-main-col '+addPlusClass+'" ns-position="right">'
								
							+'</div>'
						+'</div>'
					+'</div>'
				  +'</div>';
	 	$container.prepend(html);//输出面板
		var btnsHtml = '';//按钮输出
		var mainBtnHtml = '';//主表按钮
		for(var componentsI=0; componentsI<_config.components.length; componentsI++){
			var componentData = _config.components[componentsI];
			componentData.templateId = _config.id;
			componentData.package = _config.package;
			var operatorObject = componentData.operatorObject ? componentData.operatorObject : '';
			if(typeof(componentData.params)!='object'){
				componentData.params = {};
			}
			switch(componentData.type){
				case 'btns':
					if(operatorObject == '' || operatorObject=='root'){
						mainBtnHtml = '<div class="nav-form main-btns" id="'+componentData.id+'"></div>';
						_config.mainBtnComponent = componentData;
					}else{
						btnsHtml = '<div class="nav-form" id="'+componentData.id+'"></div>';
					}
					break;
				case 'list':
				case 'blockList':
					if(componentData.parent == 'root'){
						//主表
						componentData.isAjax = true;
						componentData.level = 1;
						componentData.params = {
							selectedHandler:mainGridSelectedHandler,
							ajaxSuccessHandler:mainGridAjaxSuccessHandler,
							drawHandler:mainGridDrawHandler,
							isUseMessageState:true,//开启接受工作流消息
						};
						if(componentData.type == 'blockList'){
							var defaultParams = {
								isPage:false,
								pageLengthDefault:10000000,
								height:_config.commonPanelHeight-10,
								completeHandler:mainGridCompleteHandler,
								query:NetStarUtils.getListQueryData(componentData.field,{id:'query-'+componentData.id,value:''}),
							};
							NetStarUtils.setDefaultValues(componentData.params,defaultParams);
						}else{
							var defaultParams = {
								height:parseFloat(_config.commonPanelHeight/2),
							};
							NetStarUtils.setDefaultValues(componentData.params,defaultParams);
						}
						_config.mainComponent = componentData;
					}

					if(componentData.keyField && componentData.parent){
						if(componentData.parent != 'root'){
							componentData.level = 3;
							_config.levelConfig[3] = componentData;
						}else{
							componentData.level = 2;
							_config.levelConfig[2] = componentData;
						}
					}else{
						componentData.level = 2;
						_config.levelConfig[2] = componentData;
					}
					break;
			}
			_config.componentsConfig[componentData.type][componentData.id] = componentData;
		}
		var positionLeftHtml = '';
		var positionRightHtml = '';
		switch(_config.mode){
			case 'blockgrid':
				positionLeftHtml =  '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.mainComponent.id+'" ns-level="1">'
										+'</div>'
									+'</div>'
									+'<div class="pt-panel">'
											+'<div class="pt-panel-container">'
												+'<div class="pt-panel-row">'
													+'<div class="pt-panel-col">'
														+'<div class="pt-panel">'
																+'<div class="pt-panel-container">'
																	+'<div class="pt-panel-row">'
																		+'<div class="pt-panel-col">'
																			+mainBtnHtml
																		+'</div>'
																	+'</div>'
																+'</div>'
														+'</div>'
													+'</div>'
												+'</div>'
											+'</div>'
									+'</div>';
				positionRightHtml = '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.levelConfig[2].id+'" ns-level="2">'
										+'</div>'
										+'<div class="pt-panel-container" id="'+_config.levelConfig[3].id+'" ns-level="3">'
										+'</div>'
										+'<div class="pt-panel">'
												+'<div class="pt-panel-container">'
													+'<div class="pt-panel-row">'
														+'<div class="pt-panel-col">'
															+btnsHtml
														+'</div>'
													+'</div>'
												+'</div>'
										+'</div>'
									+'</div>'
				break;
			case 'listgrid':	
				var detailBtnHtml = '';
				if(_config.btnKeyFieldJson[_config.levelConfig[2].keyField]){
					detailBtnHtml = '<div class="pt-panel-col text-right">'
										+'<div class="nav-form" id="'+_config.btnKeyFieldJson[_config.levelConfig[2].keyField].id+'"></div>'
									+'</div>';
				}
				positionLeftHtml = '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.mainComponent.id+'" ns-level="1"></div>'
										+'<div class="pt-panel-container" id="'+_config.levelConfig[3].id+'" ns-level="3"></div>'
									+'</div>';
				positionRightHtml = '<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.levelConfig[2].id+'" ns-level="2"></div>'
									+'</div>';
				
				if(_config.levelConfig[2].type == 'list'){
					positionLeftHtml = '<div class="pt-panel">'
											+'<div class="pt-panel-container" id="'+_config.mainComponent.id+'" ns-level="1"></div>'
											+'<div class="pt-panel-container" id="'+_config.levelConfig[2].id+'" ns-level="2"></div>'
										+'</div>';
					positionRightHtml = '<div class="pt-panel">'
											+'<div class="pt-panel-container" id="'+_config.levelConfig[3].id+'" ns-level="3"></div>'
										+'</div>';
				}
				var btnHtml = '<div class="pt-main-row">'
									+'<div class="pt-main-col">'
										+'<div class="pt-panel">'
											+'<div class="pt-panel-container">'
												+'<div class="pt-panel-row">'
													+'<div class="pt-panel-col">'
														+'<div class="nav-form main-btns" id="'+_config.mainBtnComponent.id+'"></div>'
													+'</div>'
													+detailBtnHtml
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>';
				$('#'+_config.id).children('.pt-container').append(btnHtml);
				break;
		}
		if(_config.levelConfig[2].type == 'list'){
			var $positionRight = $('#'+_config.id+' div[ns-position="right"]');
			$positionRight.remove();
			//第二级是list
			var $positionLeft = $('#'+_config.id+' div[ns-position="left"]');
			var level1Html = '<div class="pt-panel">'
								+'<div class="pt-panel-container" id="'+_config.mainComponent.id+'" ns-level="1"></div>'
							+'</div>';
			$positionLeft.html(level1Html);

			var detailHtml = '<div class="pt-main-row">'
								+'<div class="pt-main-col pt-col-auto" ns-position="left">'
									+'<div class="pt-panel">'
										+'<div class="pt-panel-container" id="'+_config.levelConfig[2].id+'" ns-level="2"></div>'
									+'</div>'
								+'</div>'
								+'<div class="pt-main-col pt-col-auto" ns-position="right">'
									+positionRightHtml
								+'</div>'
							+'</div>';
			$positionLeft.parent().after(detailHtml);

			$positionLeft.removeClass('pt-col-auto');
			$positionLeft.removeAttr('ns-position');

		}else{
			var $positionLeft = $('#'+_config.id+' div[ns-position="left"]');
			var $positionRight = $('#'+_config.id+' div[ns-position="right"]');
			$positionLeft.html(positionLeftHtml);
			$positionRight.html(positionRightHtml);
		}
	}
	//设置默认值
	function setDefault(_config){
		var defaultConfig = {
			levelConfig:{},//等级数据存放
			mode:'blockgrid',  //listGrid ,treeGrid
			//commonPanelHeight:$(window).outerHeight()-(NetstarTopValues.topNav.height+54),
		};
		NetStarUtils.setDefaultValues(_config,defaultConfig);
		var commonPanelHeight = 0;
		for(var heightI in NetstarTopValues){
			commonPanelHeight += NetstarTopValues[heightI].height;
		}
		_config.commonPanelHeight = $(window).outerHeight()-commonPanelHeight - 20;//减去标签的高度减去上下边距的20
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
		getMainListSelectedData:						getMainListSelectedData,		//获取主表选中行数据
		getDetailsSelectedData:							getDetailsSelectedData,			//获取子表数据选中行数据
		getWholeData:									getWholeData,					//获取整体参数
		refreshByConfig:								refreshByConfig,
		gridSelectedHandler:							function(){},
		refreshData:									refreshData,
	}
})(jQuery)
/******************** 表格模板 end ***********************/