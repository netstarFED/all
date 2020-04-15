/*
	*手机端流程管理界面
	* @Author: netstar.sjj
	* @Date: 2019-12-24 11:20:00
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.listMobile = (function(){
	function dialogBeforeHandler(data){
		var templateId = $('container').children('.listmobile').attr('id');
		var config = NetstarTemplate.templates.listMobile.data[templateId].config;
		var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
		var valueData = NetstarTemplate.getValueDataByValidateParams(config,controllerObj);
		if($.isArray(valueData)){
			if(controllerObj.requestSource == 'checkbox'){
				data.value = {
					selectedList:valueData
				}
			}else{
				data.value = valueData[0];
			}
		}else{
			data.value = valueData;
		}
		data.config = config;
		return data;
	}
	function ajaxBeforeHandler(data){
		return data;
	}
	function ajaxAfterHandler(data){
		var templateId = $('container').children('.listmobile').attr('id');
		var config = NetstarTemplate.templates.listMobile.data[templateId].config;
		data = typeof(data)=='undefined' ? {} : data;
		switch(data.objectState){
			case NSSAVEDATAFLAG.VIEW:
				break;
			case NSSAVEDATAFLAG.DELETE:
				//删除 清空界面值
				break;
			case NSSAVEDATAFLAG.EDIT:
				break;
			case NSSAVEDATAFLAG.ADD:
				break;
		}
	}
	function loadPageHandler(){

	}
	function closePageHandler(){

	}
	function getAjaxInnerParamsByAjaxData(sourceParam,ajaxData){
		var outputParams = {};
		if(!$.isEmptyObject(sourceParam)){
			//来源参存在
			var isUseObject = true;
			if(!$.isEmptyObject(ajaxData)){
				var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
				for(var key in ajaxData){
					if (ajaxParameterRegExp.test(ajaxData[key])) {
						isUseObject = false;
						break;
					}else{
						sourceParam[key] = ajaxData[key];
					}
				}
			}
			if(isUseObject){
				outputParams = sourceParam;
			}else{
				outputParams = NetStarUtils.getFormatParameterJSON(ajaxData,sourceParam);
			}
		}else{
			var isUseObject = true;
			if(!$.isEmptyObject(ajaxData)){
				var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
				for(var key in ajaxData){
					if (ajaxParameterRegExp.test(ajaxData[key])) {
						isUseObject = false;
						break;
					}
				}
			}
			if(isUseObject){
				outputParams = ajaxData;
			}
		}
		return outputParams;
	}
	function refreshListData(){

	}
	function getSelectedData(gridId){
		return NetstarBlockListM.getSelectedData(gridId);
	}
	function getPageData(config,isValid){
		var returnData;
		if(config.gridRowData){
			returnData = config.gridRowData;
		}else{
			if($('.mobile-menu-buttons').attr('ns-operator') =='inlinebtn'){
				returnData = config.gridRowData;
			}else{	
				returnData = getSelectedData(config.mainComponent.id);
			}
		}
		return returnData;
	}

	//根据配置参数的定义存储组件配置的定义
	function setComponentDataByConfig(_config){
		for(var componentI=0; componentI<_config.components.length; componentI++){
			var componentData = _config.components[componentI];
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
			if(typeof(_config.componentsConfig[componentDisplayMode])=='undefined'){
				_config.componentsConfig[componentDisplayMode] = {};
			}
			_config.componentsConfig[componentDisplayMode][componentData.id] = componentData; //根据组件类型存储信息 
			componentData.package = _config.package;
			var defaultShow = typeof(componentData.defaultShow)=='object' ? componentData.defaultShow : {};
			switch(componentDisplayMode){
				case 'vo':
					_config.voComponent = componentData;
					break;
				case 'tree':
					_config.treeComponent = componentData;
					break;
				case 'list':
				case 'blockList':
					if(componentKeyField == 'root'){
						componentData.isAjax = true;
						if(componentData.params.isAjax == false){
							componentData.isAjax = false;
						}
						if(!$.isEmptyObject(defaultShow)){
							componentData.isAjax = typeof(defaultShow.isAjax)== 'boolean' ? defaultShow.isAjax : componentData.isAjax;
						}else{
							if(componentData.params.placeholder){
								defaultShow = {isAjax:componentData.params.isAjax,placeholder:componentData.params.placeholder};
							}
						}
						_config.mainComponent = componentData;
					}else{
						componentData.isAjax = false;
						_config.tabConfig.listConfig[componentData.id] = componentData;
					}
					break;
				case 'btns':
					_config.mainBtnArray.push($.extend(true,{},componentData));
					break;
				case 'tab':
					_config.tabConfig.queryConfig = componentData;
					break;
				case 'inputSearchPanel':
					_config.inputSearchPanel = componentData;
					break;
			}
		}
		if($.isEmptyObject(_config.mainComponent)){
			//一种情况 配置参数出错
			config.tabConfig.queryConfig = {};
			config.tabConfig.listConfig = {};
			for(var i=0; i<_config.components.length; i++){
				var componentData = _config.components[i];
				componentData.package = _config.package;
				componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
				var defaultShow = typeof(componentData.defaultShow)=='object' ? componentData.defaultShow : {};
				if(componentData.type == 'blockList' || componentData.type == 'list'){
					componentData.isAjax = true;
					if(componentData.params.isAjax == false){
						componentData.isAjax = false;
					}
					if(!$.isEmptyObject(defaultShow)){
						componentData.isAjax = typeof(defaultShow.isAjax)== 'boolean' ? defaultShow.isAjax : componentData.isAjax;
					}
					_config.mainComponent = componentData;
					break;
				}
			}
		}
	}
	function btnsComponentInit(config){
		var mainBtnArray = config.mainBtnArray;
		if(mainBtnArray.length > 0){
			for(var btnI=0; btnI<mainBtnArray.length; btnI++){
				var btnData = mainBtnArray[btnI];
				var params = typeof(btnData.params)=='object' ? btnData.params : {};
				var btnEnglishnameByDbClick = params.dbclick ? params.dbclick : '';//通过双击事件的定义获取名字
				var btnEnglishnameByClick = params.click ? params.click : '';//通过单击事件的定义获取名字
				var btnEnglishnameByLongtap = params.longtap ? params.longtap : '';//通过长按事件的定义获取名字
				var inlineBtnArray = [];//统计行内按钮
				var outBtnArray = [];//外部按钮
				var fieldArray = $.extend(true,[],btnData.field);
				var btnByDbclick = {};//按钮绑定在双击事件上
				var btnByClick = {};//按钮绑定在单击事件上
				var btnByLongtap = {};//按钮绑定在长按事件上

				for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
					var fieldData = fieldArray[fieldI];
					var functionConfig = fieldData.functionConfig ? fieldData.functionConfig : {};
					var isInlineBtn = typeof(functionConfig.isMobileInlineBtn)=='boolean' ? functionConfig.isMobileInlineBtn : false;//默认不是行内按钮
					if(functionConfig.defaultMode == 'workflowSubmit'){
						isInlineBtn = true;
					}
					if(isInlineBtn){
						inlineBtnArray.push(fieldData);
					}else{
						outBtnArray.push(fieldData);
					}
					if(functionConfig.englishName == btnEnglishnameByDbClick){
						//双击事件
						btnByDbclick = fieldData;
						btnByDbclick.btnIndex = fieldI;
					}
					if(functionConfig.englishName == btnEnglishnameByClick){
						//单击事件
						btnByClick = fieldData;
						btnByClick.btnIndex = fieldI;
					}
					if(functionConfig.englishName == btnEnglishnameByLongtap){
						//长按事件
						btnByLongtap = fieldData;
						btnByLongtap.btnIndex = fieldI;
					}
				}
				
				config.btnByDbclick = btnByDbclick;
				config.btnByClick = btnByClick;
				config.btnByLongtap = btnByLongtap;
	
				nsTemplate.setBtnDataChargeHandler(inlineBtnArray,config.btnOptions,config);//给按钮绑定回调方法
				var inlineBtnFieldArray = nsTemplate.getBtnArrayByBtns(inlineBtnArray);//行内按钮
				if(inlineBtnArray.length > 0){
					//行内按钮
					config.inlineBtnArray = inlineBtnFieldArray;
				}
			}
		}
	}
	//初始化表格
	function gridInit(_config){
		var isInlineBtn = true;
		if(_config.mainBtnArray.length == 0){isInlineBtn = false;}
		var listConfig = _config.mainComponent;
		var gridConfig = {
			id:listConfig.id,
			type:listConfig.type,
			idField:listConfig.idField,
			templateId:_config.id,
			package:_config.package,
			isReadStore:false,
			isAjax:listConfig.isAjax,
			plusClass:listConfig.plusClass,
			data:{
				isSearch:true,
				isPage:true,
				primaryID:listConfig.idField,
				idField:listConfig.idField,
				data:{}
			},
			columns:$.extend(true,[],listConfig.field),
			ui:{
				listExpression:listConfig.listExpression,
				isHaveEditDeleteBtn:false,
				isHaveAddBtn:true,
				isEditMode:false,
				selectMode:'single',
				displayMode:'block',
				height:$(window).outerHeight() - 54,
				isHeader:false,
				isCheckSelect:false,
				isThead:false,
				//completeHandler:blockListCompleteHandler,
				isInlineBtn:isInlineBtn,
				isUseMessageState:true,
				moreBtnHandler:function(data,_grid){
					var templateId = _grid.gridConfig.templateId;
					var config = NetstarTemplate.templates.listMobile.data[templateId].config;
					config.gridRowData = $.extend(true,{},data);
					var id = 'nav-moblieButtons-' + templateId;
					var navHtml = '<div class="nav-form mobile-menu-buttons" nspanel="moblieButtons" id="'+id+'" ns-operator="inlinebtn"></div>';
					$('#' + id).remove();
					$('body').append(navHtml);
					var $container = $('#' + id);
					$container.off('click');
					$container.on('click', function (ev) {
						$(this).remove();
					});
					var navJson = {
						id: id,
						isShowTitle: false,
						btns: [
							[{
								hidden: true,
								subdata: config.inlineBtnArray
							}]
						]
					};
					nsNav.init(navJson);
				},
				selectedHandler:function(data,$data,_vueData,_gridConfig){
					var templateConfig = NetstarTemplate.templates.listMobile.data[_gridConfig.templateId].config;
					templateConfig.gridRowData = data;
					if(!$.isEmptyObject(templateConfig.btnByClick)){
						var btnConfig = templateConfig.btnByClick;
						btnConfig.btn.handler(btnConfig.btnIndex);
					}
				},
				rowdbClickHandler:function(data,$data,_vueData,_gridConfig){
					var templateConfig = NetstarTemplate.templates.listMobile.data[_gridConfig.templateId].config;
					templateConfig.gridRowData = data;
					if(!$.isEmptyObject(templateConfig.btnByDbclick)){
						var btnConfig = templateConfig.btnByDbclick;
						btnConfig.btn.handler(btnConfig.btnIndex);
					}
				},
				rowLongtapHandler:function(data,$data,_vueData,_gridConfig){
					var templateConfig = NetstarTemplate.templates.listMobile.data[_gridConfig.templateId].config;
					templateConfig.gridRowData = data;
					if(!$.isEmptyObject(templateConfig.btnByLongtap)){
						var btnConfig = templateConfig.btnByLongtap;
						btnConfig.btn.handler(btnConfig.btnIndex);
					}
				},
			}
		};
		if(!$.isEmptyObject(listConfig.defaultShow)){
			if(listConfig.defaultShow.placeholder){
				gridConfig.placeholder = listConfig.defaultShow.placeholder;
			}
		}
		//gridConfig.data.data = getAjaxInnerParamsByAjaxData(_config.pageParam,listConfig.ajax.data);
		listConfig.defaultParamsByAjax = getAjaxInnerParamsByAjaxData(_config.pageParam,listConfig.ajax.data); 
		if(listConfig.isAjax){
			var gridAjax = $.extend(true,{},listConfig.ajax);
			if(typeof(gridAjax)=="object"){
				if(typeof(gridAjax.contentType)=='undefined'){
					gridAjax.contentType = 'application/json; charset=utf-8';
				}
				nsVals.extendJSON(gridConfig.data,gridAjax);
				gridConfig.data.data = listConfig.defaultParamsByAjax;
			}	
		}else{
			gridConfig.data.dataSource = [];
		}
		var vueObj = NetstarBlockListM.init(gridConfig);
	}
	//设置当前界面发送值加上传送额外的界面来源参
	function setSendParamsByPageParamsData(sourceData,_config){
		if(!$.isEmptyObject(_config.pageParam)){
			var pageFieldArr = ['processId','activityId','activityName','workItemId','workflowType','acceptFileIds'];
			for(var paramI=0; paramI<pageFieldArr.length; paramI++){
			if(_config.pageParam[pageFieldArr[paramI]]){
				if(typeof(sourceData[pageFieldArr[paramI]])=='undefined'){
						sourceData[pageFieldArr[paramI]] = _config.pageParam[pageFieldArr[paramI]];
				}
			}
			}
		}
	}
	function refreshDataByAjax(innerparams,_btnConfig,_config){
		var listAjaxConfig = $.extend(true,{},_config.mainComponent.ajax);
		listAjaxConfig.data = _config.mainComponent.defaultParamsByAjax;
		if(!$.isEmptyObject(_btnConfig.ajax.data)){
			listAjaxConfig.data = NetStarUtils.getFormatParameterJSON(JSON.parse(_btnConfig.ajax.data),innerparams);
		}
		setSendParamsByPageParamsData(listAjaxConfig.data,_config);
		listAjaxConfig.plusData = {
			config:_config,
			currentConfig:_btnConfig
		};
		NetStarUtils.ajax(listAjaxConfig,function(res,ajaxOptions){
			if(res.success){
				//console.log(res)
				//console.log(res[ajaxOptions.dataSrc])
				var _templateConfig = ajaxOptions.plusData.config;
				var _currentConfig = ajaxOptions.plusData.currentConfig;
				if(typeof(_currentConfig.ajax.formatter)=='function'){
					res = _currentConfig.ajax.formatter(res,_templateConfig);
				}
				var resData = res[ajaxOptions.dataSrc];
				if(!$.isArray(resData)){resData = [];}
				if(resData.length == 0){
					var gridConfig = NetstarBlockListM.configs[_templateConfig.mainComponent.id].gridConfig;
					gridConfig.domParams.panelOfEmptyRows = {
						isShow:true,
						class:'tip-info',
						info:'没有找到匹配结果', 
					};
				}
				switch(_currentConfig.successOperate){
					case 'refresh':
						NetstarBlockListM.refreshDataById(_templateConfig.mainComponent.id,resData);
						break;
					default:
						NetstarBlockListM.refreshDataById(_templateConfig.mainComponent.id,resData);
						break;
					case 'add':
						var isNeedCustomField = true;
						if(_currentConfig.type == 'btn'){
							isNeedCustomField = false;
						}
						if(_currentConfig.type == 'text'){
							isNeedCustomField = false;
						}
						if(isNeedCustomField){
							//通过扫码设备类型返回的数据集
							for(var addI=0;addI<resData.length; addI++){
								resData[addI]['NETSTAR-SCANCODE'] = _currentConfig.name;
							}
							var gridRowsArr = NetstarBlockListM.dataManager.getData(_templateConfig.mainComponent.id);
							for(var r=0; r<gridRowsArr.length; r++){
								var rowData = gridRowsArr[r];
								if(rowData['NETSTAR-SCANCODE']){
									resData.push(rowData);
								}
							}
							NetstarBlockListM.refreshDataById(_templateConfig.mainComponent.id,resData);
						}else{
							NetstarBlockListM.dataManager.addRow(resData,_templateConfig.mainComponent.id,0);
						}
						break;
					case 'edit':
						break;
					case 'del':
						break;
				}
			}else{
				var msg = res.msg ? res.msg :'返回值false';
				nsalert(msg);
			}
		},true);
	}

	// 检索初始化
	function inputSearchPanelInit(_config){
		if(!$.isEmptyObject(_config.inputSearchPanel)){
			if(_config.inputSearchPanel.outputType == 'text'){
				//点击出检索条件
				function searchPanelInitHandler(ev){
					ev.preventDefault();
					ev.stopPropagation();
					var _templateConfig = ev.data.templateConfig;
					var $searchContainer = $(this);
					var id = $searchContainer.attr('id');
					$searchContainer.addClass('hide');
					$('#form-'+id).removeClass('hide');
					var $input = $('#'+_templateConfig.inputSearchPanel.inputId);
					$input.val('');
					$input.removeAttr('readonly');
					$input[0].focus();
				}

				var $searchPanel = $('#'+_config.inputSearchPanel.id);
				$searchPanel.off('click',searchPanelInitHandler);  //点击出下拉条件
				$searchPanel.on('click',{templateConfig:_config},searchPanelInitHandler);//点击出下拉条件

				var inputText = $('#'+_config.inputSearchPanel.inputId).val();
				var paramsData = {
					filter:_config.mainComponent.defaultParamsByAjax,
					input:{
						//qrCamera:qrCameraValue,
						text:inputText
					}
				};
				var honeywellScanConfig = _config.inputSearchPanel.searchQuery.honeywellScan;
				if(honeywellScanConfig && typeof(NetStarCordova) == "object"){
					NetStarCordova.honeywellScan.get(function(res){
						//成功之后
						//res.result 返回的码
						paramsData.input.honeywellScan = res.result;
						refreshDataByAjax(paramsData,honeywellScanConfig, _config);
					},$searchPanel);
				}
				


				var $searchBtns = $('#'+_config.inputSearchPanel.btnsId+' button[type="button"]');
				$searchBtns.off('click');
				$searchBtns.on('click',function(searchEvent){
					var $this = $(this);
					var searchNameStr = $this.attr('search-name');
					var packageName = $this.attr('ns-package');
					var templateConfig = NetstarTemplate.templates.configs[packageName];
					var searchQuery = templateConfig.inputSearchPanel.searchQuery;
					var btnConfig = searchQuery[searchNameStr];

					var qrCameraValue = '';
					if($('button[search-name="qrCamera"]').length == 1){
						qrCameraValue = $('button[search-name="qrCamera"]').attr('ns-value');
						if(typeof(qrCameraValue)=='undefined'){qrCameraValue = '';}
					}
					var inputText = $('#'+templateConfig.inputSearchPanel.inputId).val();
					var paramsData = {
						filter:templateConfig.mainComponent.defaultParamsByAjax,
						input:{
							qrCamera:qrCameraValue,
							text:inputText
						}
					};
					/** 扫码设备类型
					 * qrCamera:        二维码摄像头
					 * barcodeCamera:   条码摄像头
					 * barcodeScan:     蓝牙扫码枪
					 * honeywellScan:   霍尼韦尔扫码
					 * codeScan:        扫码 所有可用类型的扫码都会触发此
					 */
					switch(btnConfig.type){
						case 'codeScan':
							//扫码成功之后返回条形码，根据条形码作为入参去刷新表格
							/*NetstarCordova.codeScan.get(function(res){
								//成功之后
								//res.result 返回的码
								paramsData[searchNameStr] = res.result;
								refreshDataByAjax(paramsData,btnConfig,templateConfig);
							},$this);*/
							break;
						case 'qrCamera':
							NetstarQRScanner.init({
								type : "single",
								callBackFunc : (function(_paramsData, _btnConfig, _templateConfig){
									return function(QRSContents, ajaxRes, config){
										_paramsData.input.qrCamera = QRSContents.toString().slice(7);
										refreshDataByAjax(_paramsData, _btnConfig, _templateConfig);
									}
								})(paramsData, btnConfig, templateConfig),
							});
							break;
						case 'barcodeCamera':
							break;
						case 'barcodeScan':
							break;
						case 'honeywellScan':
							break;
						default:
							refreshDataByAjax(paramsData,btnConfig,templateConfig);
							break;
					}
					//console.log(templateConfig.mainComponent)
				})

				var $inputBtns = $('#'+_config.inputSearchPanel.inputBtnId+' button[type="button"]');
				$inputBtns.off('click');
				$inputBtns.on('click',{templateConfig:_config},function(btnEvent){
					btnEvent.stopPropagation();
					var $this = $(this);
					$this.blur();
					$('input[type="text"]').blur();
					var operatorType = $this.attr('nstype');
					var _templateConfig = btnEvent.data.templateConfig;
					switch(operatorType){
						case 'search':
							// 检索
							//console.log('search');
							//console.log(_templateConfig)
							//console.log(_templateConfig.inputSearchPanel.searchQuery)
							//console.log(_templateConfig.mainComponent)

							var qrCameraValue = '';
							if($('button[search-name="qrCamera"]').length == 1){
								qrCameraValue = $('button[search-name="qrCamera"]').attr('ns-value');
								if(typeof(qrCameraValue)=='undefined'){qrCameraValue = '';}
							}
							var inputText = $('#'+_templateConfig.inputSearchPanel.inputId).val();
							var paramsData = {
								filter:_templateConfig.mainComponent.defaultParamsByAjax,
								input:{
									qrCamera:qrCameraValue,
									text:inputText
								}
							};
							refreshDataByAjax(paramsData,_templateConfig.inputSearchPanel.searchQuery.text,_templateConfig);
							break;
						case 'cancel':
							//取消
							console.log('cancel');
							$('#form-'+_templateConfig.inputSearchPanel.id).addClass('hide');
							$('#'+_templateConfig.inputSearchPanel.id).removeClass('hide');
							break;
					}
				});

				var $inputSearch = $('#'+_config.inputSearchPanel.inputId);
				$inputSearch.on('keyup',{templateConfig:_config},function(inputEvent){
					var _templateConfig = inputEvent.data.templateConfig;
					if(inputEvent.keyCode == 13){
						//console.log(_templateConfig)
						//console.log(_templateConfig.inputSearchPanel.searchQuery)
						//console.log(_templateConfig.mainComponent)
						var qrCameraValue = '';
						if($('button[search-name="qrCamera"]').length == 1){
							qrCameraValue = $('button[search-name="qrCamera"]').attr('ns-value');
							if(typeof(qrCameraValue)=='undefined'){qrCameraValue = '';}
						}
						var paramsData = {
							filter:_templateConfig.mainComponent.defaultParamsByAjax,
							input:{
								qrCamera:qrCameraValue,
								text:$(this).val()
							}
						};
						refreshDataByAjax(paramsData,_templateConfig.inputSearchPanel.searchQuery.text,_templateConfig);
					}
				})
			}
		}
	}

	//组件初始化调用执行
	function initComponentInit(_config){
		btnsComponentInit(_config);//生成行内按钮
		gridInit(_config);//初始化表格
		inputSearchPanelInit(_config);//检索初始化

		if(!$.isEmptyObject(_config.voComponent)){
			var fieldArr = $.extend(true,[],_config.voComponent.field);
			for(var f=0; f<fieldArr.length; f++){
				var fieldData = fieldArr[f];
				fieldData.acts = 'formlabel';
				if(fieldData.type == 'date'){
					fieldData.acts = 'date-label';
				}else if(fieldData.type == 'datetime'){
					fieldData.acts = 'datetime-label';
				}
			}
			var formJson = {
				id:_config.voComponent.id,
				form:fieldArr,
				formSource:'staticData'
			};
			nsForm.init(formJson);
		}
	}
	//初始化输出容器面板
	function initContainer(_config){
		var mainComponent = _config.mainComponent;
		var inputSearchPanelHtml = '';
		var listClassStr = '';
		if(!$.isEmptyObject(_config.inputSearchPanel)){
			var searchInputPlaceholder = _config.inputSearchPanel.placeholder ? _config.inputSearchPanel.placeholder : '';
			var searchFieldArray = _config.inputSearchPanel.field;
			//循环判断field里面有没有定义type为text
			var outputType = '';
			var searchQuery = {};
			var btnsArray = [];
			for(var s=0; s<searchFieldArray.length; s++){
				var searchData = searchFieldArray[s];
				if(searchData.type == 'text'){
					outputType = 'text';
					searchInputPlaceholder = searchData.placeholder ? searchData.placeholder : '';
				}else{
					btnsArray.push(searchData);
				}
				searchQuery[searchData.name] = searchData;
			}
			_config.inputSearchPanel.searchQuery = searchQuery;
			_config.inputSearchPanel.outputType = outputType;
			switch(outputType){
				case 'text':
					_config.inputSearchPanel.btnsId = 'btns-'+_config.inputSearchPanel.id;
					_config.inputSearchPanel.inputId = 'input-'+_config.inputSearchPanel.id;
					_config.inputSearchPanel.inputBtnId = 'input-btn-'+_config.inputSearchPanel.id;
					var textArr = ['搜索','取消'];
					if(searchQuery.text.text){
						if(searchQuery.text.text.indexOf(',')>-1){
							textArr = searchQuery.text.text.split(',');
						}
					}
					var placeholder = searchQuery.text.placeholder ? searchQuery.text.placeholder : '';
					var formHtml = '<form action="javascript:return true;" role="form" aria-invalid="false" class="clearfix standard compactmode " onsubmit="return false;" novalidate="novalidate">'
									+'<div class="input-group">' 
										+'<span class="input-group-addon"><i class="fa-search"></i></span>' 
										+'<input class="form-control" readonly id="'+_config.inputSearchPanel.inputId+'" placeholder="'+placeholder+'" type="search">' 
										+'<div class="input-group-btn hidden" id="clearInput">' 
											+'<button class="btn btn-icon" type="button">' 
												+'<i class="fa-times-circle"></i>' 
											+'</button>' 
										+'</div>'
									+'</div>' 
									+'<div class="btn-group" id="'+_config.inputSearchPanel.inputBtnId+'">'
										+'<button class="btn btn-icon" nstype="search" type="button"><i class=""></i>'+textArr[0]+'</button>'
										+'<button class="btn btn-icon" nstype="cancel" type="button"><i class=""></i>'+textArr[1]+'</button>'
									+'</div>'
								+'</form>';
					var btnsHtml = '';
					for(var btnI=0; btnI<btnsArray.length; btnI++){
						var btnData = btnsArray[btnI];
						var contentHtml = '';
						if(btnData.text){
							contentHtml = btnData.text;
						}
						if(btnData.type == 'codeScan'){

						}else{
							btnsHtml += '<button type="button" search-name="'+btnData.name+'" ns-package="'+_config.package+'">'
											+contentHtml
										+'</button>';
						}
					}
					var outputBtnHtml = '';
					if(btnsHtml){
						outputBtnHtml = '<div id="'+_config.inputSearchPanel.btnsId+'" class="mobile-scanqrcode-button">'+btnsHtml+'</div>';
					}
					inputSearchPanelHtml = '<div class="row mobile-input-search" >'
												+'<div class="mobile-input-search-control" id="'+_config.inputSearchPanel.id+'" ns-type="focus-search" ns-grid="'+mainComponent.id+'">'
													+'<i class="fa-search"></i><span>'+searchInputPlaceholder+'</span>'
												+'</div>'
												+'<div class="mobile-input-search-control hide" id="form-'+_config.inputSearchPanel.id+'" ns-type="form-search" ns-grid="'+mainComponent.id+'">'
													+formHtml
												+'</div>'
												+outputBtnHtml
											+'</div>';
					break;
			}
		}else{
			listClassStr = 'no-query';
		}
		var voHtml = '';
		if(!$.isEmptyObject(_config.voComponent)){
			var classHideStr = '';
			if(_config.mainComponent.isAjax == false){
				classHideStr = 'hide';
			}
			voHtml = '<div id="'+_config.voComponent.id+'" component-type="vo" class="'+classHideStr+'"></div>'
		}
		var listHtml = '<div class="nspanel-container nspanel nspanel-container nspanel col-xs-12 col-sm-12 notree '+listClassStr+'" ns-panel="blockList">'
							+voHtml
							+'<div id="'+mainComponent.id+'" component-type="blockList"></div>'
						+'</div>';
		var containerHtml = inputSearchPanelHtml
							+'<div class="row layout-planes listmobile" id="'+_config.id+'" ns-package="'+_config.package+'">'
								+listHtml
							+'</div>';
		if($('#'+_config.id).length>0){
			$('#'+_config.id).remove();
		}
		nsTemplate.appendHtml(containerHtml);//输出容器
	}
	//设置默认参数
	function setDefault(_config){
		var defaultParams = {
			componentsConfig:{},
			treeComponent:{},
			voComponent:{},
			mainComponent:{},
			mainBtnArray:[],
			tabConfig:{
				id:"tab-"+_config.id,
				queryConfig:{},
				listConfig:{},
				templatesConfig:_config
			},
			inputSearchPanel:{},
			pageParam:{},
			inlineBtnArray:[],
			btnOptions:{
				source:'form',
				dialogBeforeHandler:dialogBeforeHandler,
				ajaxBeforeHandler:ajaxBeforeHandler,
				ajaxAfterHandler:ajaxAfterHandler,
				loadPageHandler:loadPageHandler,
				closePageHandler:closePageHandler,
			},
		};
		NetStarUtils.setDefaultValues(_config,defaultParams);
		if(_config.pageParam.prevPageUrl){
			//界面来源参里的值只作为ajax入参发送 如果里面定义了其他属性值需要从config.pageParam中移除
			_config.prevPageUrl = _config.pageParam.prevPageUrl;
			delete _config.pageParam.prevPageUrl;
		}
		if(typeof(_config.pageParam.readonly)=='boolean'){
			_config.readonly = _config.pageParam.readonly;
			delete _config.pageParam.readonly;
		}
		if(typeof(_config.pageParam.sourcePageConfig)=='object'){
			_config.sourcePageConfig = _config.pageParam.sourcePageConfig;
			delete _config.pageParam.sourcePageConfig;
		}
		if(typeof(_config.pageParam.data)=='object'){
			_config.pageParam = _config.pageParam.data;
			_config.prevPageUrl = _config.pageParam.url;
		}
	}
	//初始化调用
	function init(_config){
		/***************存储模板配置 start******************* */
		if(typeof(NetstarTemplate.templates.listMobile)=='undefined'){
			NetstarTemplate.templates.listMobile = {data:{}}
		}
		if(typeof(NetstarTemplate.templates.listMobile.data)=='undefined'){
			NetstarTemplate.templates.listMobile.data = {};
		}
		/***************存储模板配置 end******************* */
		if(NetstarTemplate.templates.listMobile.data[_config.id]){
			var config = NetstarTemplate.templates.listMobile.data[_config.id].config;
			NetstarTemplate.templates.configs[config.package] = config;
			//找到当前行数据进行修改操作
			var ajaxConfig = config.mainComponent.ajax;
			if($.isEmptyObject(ajaxConfig.data)){
				ajaxConfig.data = config.pageParam;
			}
			ajaxConfig.plusData = {
				idField:config.mainComponent.idField,
				gridRowData:config.gridRowData,
				gridId:config.mainComponent.id,
				configId : _config.id,
			};
			NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
				var rowsArray = [];
				if($.isArray(res.rows)){
					rowsArray = res.rows;
				}
				var _idField = ajaxOptions.plusData.idField;
				var currentGriddata = ajaxOptions.plusData.gridRowData;
				var gridId = ajaxOptions.plusData.gridId;
				var editRowIndex = -1;
				for(var rowI=0; rowI<rowsArray.length; rowI++){
					var rowData = rowsArray[rowI];
					if(rowData[_idField] == currentGriddata[_idField]){
						editRowIndex = rowI;
						break;
					}
				}
				if(editRowIndex > -1){
					NetstarBlockListM.configs[gridId].vueObj.originalRows[editRowIndex] = rowsArray[editRowIndex];
					NetstarBlockListM.configs[gridId].vueObj.rows[editRowIndex] = rowsArray[editRowIndex];
					NetstarBlockListM.configs[gridId].vueObj.rows[editRowIndex].netstarSelectedFlag = true;
					NetstarBlockListM.refreshDataById(gridId,rowsArray);
				}else{
					//不存在于数据当中
					var originalRowsArr = NetstarBlockListM.configs[gridId].vueObj.originalRows;
					var originalIndex = -1;
					for(var i=0; i<originalRowsArr.length; i++){
						var originalData = originalRowsArr[i];
						if(originalData[_idField] == currentGriddata[_idField]){
							originalIndex = rowI;
							break;
						}
					}
					if(originalIndex > -1){
						NetstarBlockListM.dataManager.delRow(originalRowsArr[originalIndex],gridId);
					}
				}
				var config = NetstarTemplate.templates.listMobile.data[ajaxOptions.plusData.configId].config;
				inputSearchPanelInit(config);
			},true)
		}else{
			NetstarTemplate.templates.listMobile.data[_config.id] = {
				original:$.extend(true,{},_config),
				config:_config
			};
			/******************************根据当前模板的id存储当前配置的定义参数 end */
			setDefault(_config);//设置默认参数
			setComponentDataByConfig(_config);//根据配置参数的定义存储组件配置的定义
			initContainer(_config);//初始化输出容器面板
			initComponentInit(_config);//组件初始化调用执行
		}
	}
	return{
		init:									init,								
		VERSION:								'0.0.1',
		dialogBeforeHandler:					dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:						ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:						ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:						loadPageHandler,				//打开
		closePageHandler:						closePageHandler,				//关闭
		refreshListData:						refreshListData,				//刷新数据
		getSelectedData:						getSelectedData,				//获取选中值
		getAjaxInnerParamsByAjaxData:			getAjaxInnerParamsByAjaxData,	//根据ajaxData转换入参值
		getPageData:							getPageData,					//获取界面值
	}
})(jQuery)
/******************** 表格模板 end ***********************/