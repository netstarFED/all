/****
***下拉树  标题 表格 分类信息
****
********/
/******************** 表单表格模板 start ***********************/
NetstarTemplate.templates.businessDataBase = (function(){
	var config = {};//当前配置参数
	var originalConfig = {};//原始配置项
	var commonPanelHeight = 0;//公用高度
	var componentSource = '';//组件调用来源
	var componentsConfig = {
		vo:[],					//form
		list:[],				//table
		tab:{					//tab
			vo:[],
			list:[]
		},
		btns:[],				//btn
		class:[],				//div
		tree:[],				//tree
		tableRowBtns:[],		//行内按钮
		originalRowBtns:{}
	};//根据不同的type类型去存放配置参数
	var currentQueryParams = {
		count:0,//页码条数
		first:0,//起始页码
		queryParams:{
			parid: "-1",//当前查询的节点id 
			isfilter: false, //快速查询 默认false
			isshowstop: "0",//自定义过滤值
			filtermode: "quickSearch",//快速查询模式 默认快速查询
			filterstr: ""//查询值
		},//查询条件
	};//当前查询参数
	var gridSearchType = 'quickSearch';
	var componentConfig = {};//组件相关配置参数
	var currentTableId = '';//表格id 
	var gridQueryPanelConfig = {};//list的查询面板配置
	var componentBtnConfig = {};
	//清空值
	function clearVals(){
		componentsConfig = {
			vo:[],					//form
			list:[],				//table
			tab:{					//tab
				vo:[],
				list:[]
			},
			btns:[],				//btn
			class:[],				//div
			tree:[],				//tree
			tableRowBtns:[],		//行内按钮
			originalRowBtns:{},
		};//根据不同的type类型去存放配置参数
		currentQueryParams = {
			count:0,//页码条数
			first:0,//起始页码
			queryParams:{
				parid: "-1",//当前查询的节点id 
				isfilter: false, //快速查询 默认false
				isshowstop: "0",//自定义过滤值
				filtermode: "quickSearch",//快速查询模式 默认快速查询
				filterstr: ""//查询值
			},//查询条件
		};//当前查询参数
		gridSearchType = 'quickSearch';
	}
	/************按钮回调函数 start************************/
	//弹出框前置回调
	function dialogBeforeHandler(data,templateId){
		config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		var componentsConfig = config.componentsConfig;
		currentTableId = componentsConfig.list[0].id;
		var requestSource;
		var controllerObj = {};
		if(typeof(data.controllerObj)=='object'){
			controllerObj = data.controllerObj;
			if(typeof(config.pageParam)=='object'){
				data.controllerObj.func.config.defaultData = {data_auth_code:config.pageParam.data_auth_code};
			}
			requestSource = data.controllerObj.requestSource;
		}
		if(!$.isEmptyObject(data.rowData)){
			data.value = data.rowData;
			data.value.parentSourceParam = {
				package:config.package,
				id:componentsConfig.list[0].data.primaryID,
				templateId:config.id,
			};
		}else{
			var selectedData = getSelectedData(currentTableId,false);
			if(selectedData.length > 0){
				if(requestSource == 'checkbox'){
					data.value = {
						selectedList:selectedData,
					};
				}else{
					data.value = selectedData[0];
				}
				data.value.parentSourceParam = {
					package:config.package,
					id:componentsConfig.list[0].data.primaryID,
					templateId:config.id,
				};
			}else{
				data.value = false;
			}
		}
		//sjj 20190618 如果按钮配置了isSendPageParams 为false 则不发送 界面来源参
		if(typeof(controllerObj.isSendPageParams)=='boolean'){
			if(controllerObj.isSendPageParams == false){
				data.value = {};
			}
		}
		data.btnOptionsConfig = {
			options:{
				idField:componentsConfig.list[0].data.primaryID
			},
			descritute:{
				keyField:componentsConfig.list[0].keyField,
				idField:componentsConfig.list[0].data.primaryID
			}
		}
		data.config = config;
		return data;
	}
	//ajax前置回调
	function ajaxBeforeHandler(handlerObj,templateId){
		config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		//是否有选中值有则处理，无则返回
		var componentsConfig = config.componentsConfig;
		if($.isEmptyObject(handlerObj.value)){
			var selectedData = getSelectedData(componentsConfig.list[0].id,false);
			if(handlerObj.ajaxConfig.requestSource == 'checkbox'){
				handlerObj.value = {
					selectedList:selectedData,
					parentSourceParam:{
						package:config.package,
						id:componentsConfig.list[0].data.primaryID,
						templateId:config.id,
					}
				}
			}else{
				if(selectedData.length > 0){
					handlerObj.value = selectedData[0];
					handlerObj.value.parentSourceParam = {
						package:config.package,
						id:componentsConfig.list[0].data.primaryID,
						templateId:config.id,
					};
				}
			}
		}
		//是否有选中值有则处理，无则返回
		handlerObj.config = config;
		handlerObj.ajaxConfigOptions = {
			idField:componentsConfig.list[0].idField,
			keyField:componentsConfig.list[0].keyField,
			pageParam:config.pageParam,
			parentObj:config.parentObj
		};
		return handlerObj;
	}
	//ajax执行完成之后的回调
	function ajaxAfterHandler(res,templateId,plusData){
		var newData = $.extend(true,{},res);
		delete newData.objectState;
		config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		componentsConfig = config.componentsConfig;
		if(componentsConfig.tree.length > 0){
			
		}
		if(componentsConfig.list.length > 0){
			//表格数据
			var gridId = componentsConfig.list[0].id;
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
					refreshByPackage({templateId:templateId},{},plusData);
					break;
			}
			if($.isArray(res)){
				refreshByPackage({templateId:templateId},{},plusData);
			}
		}	
	}
	//topage打开新页面的回调
	function loadPageHandler(data){
		return data;
	}
	//关闭弹出页面的回调
	function closePageHandler(){
		
	}
	function closeHandler(){
		refreshTableData(currentTableId);
	}
	/************按钮回调函数 end************************/
	function getSelectedData(tableId){
		var selectedData;
		if(NetStarGrid.configs[tableId].original.ui.isCheckSelect){
			selectedData = NetStarGrid.getCheckedData(tableId);
			if(selectedData.length == 0){
				selectedData = NetStarGrid.getSelectedData(tableId);
			}
		}else{
			selectedData = NetStarGrid.getSelectedData(tableId);
		}
		return selectedData;
	}
	//表格刷新
	function refreshTableData(tableId,_paramData,plusData){
		if(typeof(plusData)!='object'){plusData = {};}
		var templateId = tableId.substring(0,tableId.lastIndexOf('-list'));
		var listGrid;
		if(NetStarGrid.configs[tableId]){
			listGrid = NetStarGrid.configs[tableId];
		}else{
			templateId = tableId.substring(0,tableId.lastIndexOf('-block'));
			listGrid = NetstarBlockList.configs[tableId];
		}
		//if(gridSearchType == 'quickSearch'){
			if(NetstarTemplate.templates.businessDataBase.data[templateId]){
				config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
			}
		//}
		var paramJson = {};
		if(!$.isEmptyObject(_paramData)){
			paramJson = _paramData;
		}else{
			switch(config.paramMode){
				case 'list':
					if(currentQueryParams.queryParams.filterstr){
						paramJson[currentQueryParams.queryParams.filtermode] = currentQueryParams.queryParams.filterstr;
					}
					if(currentQueryParams.queryParams.filtermode == 'quickSearch'){
						if(gridSearchType){
							paramJson.searchType = gridSearchType;
						}
						if(currentQueryParams.queryParams.filterstr){
							paramJson.keyword = currentQueryParams.queryParams.filterstr;
						}
						delete paramJson.quickSearch;
					}
					break;
				default:
					paramJson = $.extend(true,{},currentQueryParams);
					break;
			}
		}
		if(!$.isEmptyObject(config.pageParam)){
			delete config.pageParam.value;
			nsVals.extendJSON(paramJson,config.pageParam);
		}
		if(config.componentsConfig.list.length > 0){
			if(!$.isEmptyObject(config.componentsConfig.list[0].data.data)){
				for(var params in config.componentsConfig.list[0].data.data){
					if(paramJson[params]){
						//参数存在于当前获取的数据值中
					}else{
						if(typeof(paramJson[params])=='number'){

						}else{
							if(params != 'keyword'){
								paramJson[params] = config.componentsConfig.list[0].data.data[params];
							}
						}
					}
				}
				//nsVals.extendJSON(paramJson,config.componentsConfig.list[0].data.data)
			}
		}
		if(config.componentsConfig.tree.length > 0){
			var treeJsonConfig = $.extend(true,{},config.componentsConfig.tree[0]);
			var treeId = treeJsonConfig.id;
			var treeArray = NetstarTemplate.tree.getSelectedNodes(treeId);
			if(treeArray.length > 0){
				if(treeArray.length == 1){
					var treeJson = treeArray[0];
					if(typeof(treeJsonConfig.formatter)=='string'){
						var formatter = JSON.parse(treeJsonConfig.formatter);
						treeJson = nsVals.getVariableJSON(formatter,treeArray[0]);
					}else if(typeof(treeJsonConfig.formatter)=='object'){
						var formatter = treeJsonConfig.formatter;
						treeJson = nsVals.getVariableJSON(formatter,treeArray[0]);
					}
					nsVals.extendJSON(paramJson,treeJson);
				}
			}
		}
		//值为空不可传值
		for(var value in paramJson){
			if(paramJson[value] === ''){
				delete paramJson[value];
			}
		}

		var isKeepSelected = typeof(plusData.isKeepSelected)=='boolean' ? plusData.isKeepSelected : false;
		if(isKeepSelected == false){
			listGrid.vueObj.page.start = 0;
			listGrid.vueObj.page.length = 10;
		}
		delete paramJson.searchType;

		NetStarGrid.refreshById(tableId,paramJson);

		//if(idsArray.length >0){
		//	setTimeout(function(){
			//	NetStarGrid.setRowSelectedById(idsArray, tableId, true);
			//},0)
		//}
	}

	function getIdsBySelectedData(gridId){
		//先获取当前行选中的值 
		var idsArray = [];
		var selectRowsData = getSelectedData(gridId);
		if($.isArray(selectRowsData)){
			if(selectRowsData.length > 0){
				var config = NetStarGrid.configs[gridId];
				var idField = config.gridConfig.data.idField;
				for(var s=0; s<selectRowsData.length; s++){
					idsArray.push(selectRowsData[s][idField]);
				}
				//NetStarGrid.setRowSelectedById(idsArray, gridId, true);
			}
		}
		return idsArray;
	}

	//当前面板公用高度
	function setContainerHeight(config){
		var pageHeight = 0;
		for(var name in NetstarTopValues){
			pageHeight += NetstarTopValues[name].height;
		}
		if(config.title){
			//biaotigaodu
			pageHeight = pageHeight + 48;
		}
		commonPanelHeight = $(window).outerHeight()-pageHeight;
	}
	function getClassAjax(data){
		/*
			*containerId	容器id
			*param			参数
		*/
		var containerId = data.containerId;
		var listAjax = $.extend(true,{},componentsConfig.class[0].ajax);
		listAjax.data = typeof(listAjax.data)=='object' ? listAjax.data : {};
		listAjax.url = listAjax.src;
		listAjax.plusData = {
			dataSrc:componentsConfig.class[0].ajax.dataSrc,
			containerId:containerId
		};
		if(typeof(data.param)=='object'){
			for(var param in data){
				listAjax.data[param] = data.param;
			}
		}
		delete listAjax.src;
		nsVals.ajax(listAjax,function(res,ajaxData){
			if(res.success){
				var data = res[ajaxData.plusData.dataSrc];
				if($.isArray(data)){
					var classStr = '';
					for(var i=0; i<data.length; i++){
						classStr += '\\'+data[i];
					}
					$('#'+ajaxData.plusData.containerId).html(classStr);
				}
			}
		},true)
	}
	//树节点单击事件
	function treenodeClickHandler(data){
		/*
			*config 			容器id
			*treeId 			节点值
			*treeNode 			当前节点数据
		*/
		//此方法只是在获取节点刷新表格和分类数据
		var containerId = data.config.containerId;
		var templateId = containerId.substring(0,containerId.indexOf('-tree'));
		//var templateId = data.treeId.substring(5,data.treeId.lastIndexOf('-tree'));
		config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		componentsConfig = config.componentsConfig;
		var tableId = componentsConfig.list[0].id;
		currentQueryParams.queryParams.isfilter = false;
		//var classJson = {
			//containerId:componentsConfig.class[0].containerId,
			//id:data.id
		//};
		//getClassAjax(classJson);
		refreshTableData(tableId);
	}
	//树面板组件初始化调用
	function treePanelInit(){
		var treeConfig = componentsConfig.tree[0];
		var isSearch = typeof(treeConfig.isSearch)=='boolean' ? treeConfig.isSearch : true;
		var treePanelId = treeConfig.id;
		var treeBtnId = 'btn-'+treePanelId;
		var searchPanelId = 'search-'+treePanelId;
		treeConfig.clickHandler = treenodeClickHandler;
		//输出树容器
		var height = commonPanelHeight;
		var treeHeight = commonPanelHeight;
		if(treeConfig.title){
			treeHeight -= 21;
		} 
		if(treeConfig.isSearch){
			treeHeight -= 24;
		}
		treeConfig.height = treeHeight + 5 - 50; //5是边距
		function getTreeHtml(){
			var ztreeHtml = '<div class="pt-tree">'
								+'<div class="pt-container">'
									+'<div class="businessdatabase-tree-ztree layout-ztree" style="height:'+height+'px;" id="'+treePanelId+'"></div>'
								+'</div>'
							+'</div>';
			//var btnHtml = '<div class="businessdatabase-tree-btn nav-form" id="'+treeBtnId+'"></div>';
			return NetstarTemplate.getPanelHtml(ztreeHtml);
		}
		var treeHtml = getTreeHtml(treeConfig);
		$('#'+treeConfig.containerId).html(treeHtml);//输出树容器
		// lyw 格式化树中的ajax
		var arr = ['ajax', 'deleteAjax', 'addAjax', 'editAjax', 'moveAjax', '', ''];
		for(var i=0; i<arr.length; i++){
			 if(typeof(treeConfig[arr[i]])=='object'){
				  if(typeof(treeConfig[arr[i]].url) == "string" && treeConfig[arr[i]].url.length>0 && treeConfig[arr[i]].url.indexOf('http')==-1){
						treeConfig[arr[i]].url = getRootPath() + treeConfig[arr[i]].url;
				  }
			 }
		}
		NetstarTemplate.tree.init(treeConfig);
		//treeSelectorUI.treePlane.init(treeConfig);//节点树实例化调用
		/*var navJson = {
			id:treeBtnId,
			pagerId:'page-'+treeBtnId,
			isShowTitle:false,
			btns:treeBtn
		};*/
		//vueButtonComponent.init(navJson);
	}
	//编辑行
	function rowEditHandler(data){
		getAjaxToPage({data:data,type:'edit'});
	}
	//改变起始页
	function isLengthChangeAfterHandler(data){
		/*
			*tableId 表格id
		*/
		//公式  起码页 = 页码*显示条数
		currentQueryParams.first = nsTable.data[data.gridId].currentPage * nsTable.data[data.gridId].currentLength;
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
	//行双击
	function rowDoubleSelectHandler(data){
		if(typeof(componentConfig.doubleClickHandler)=='function'){
			componentConfig.doubleClickHandler(data);
		}
	}
	function setTableHtml(tableConfig){
		var contidionHtml = '';
		var quickqueryHtml = '';
		if(tableConfig.ui.query){
			quickqueryHtml = '<div class="pt-panel-col" id="'+tableConfig.ui.query.id+'">'
								
							+'</div>';
			switch(tableConfig.ui.query.type){
				case 'select':
					quickqueryHtml += '<div class="pt-panel-col text-right" id="advance-'+tableConfig.ui.query.id+'"></div>';
					break;
			}
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
	function confirmQuickQueryHandler(_configObj){
		currentQueryParams.queryParams.isfilter = true;
		var formId = _configObj.formId;
		var gridId = _configObj.gridId;
		var formJson = NetstarComponent.getValues(formId);
		currentQueryParams.queryParams.isfilter = true;
		currentQueryParams.queryParams.filtermode = formJson.filtermode;
		currentQueryParams.queryParams.filterstr = '';
		if(formJson.filterstr){
			currentQueryParams.queryParams.filterstr = formJson.filterstr;
		}else{
			currentQueryParams.queryParams.filterstr = formJson[formJson.filtermode];
		}
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
								currentQueryParams.queryParams.filterstr = formJson[formJson.filtermode][queryConfig.idField];
								break;
							case 'checkbox':
								paramJson[formJson.filtermode] = formJson[formJson.filtermode][0][queryConfig.idField];
								currentQueryParams.queryParams.filterstr = formJson[formJson.filtermode][0][queryConfig.idField];
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
		if(typeof(config.pageParam)=='object'){
			delete config.pageParam.keyword;
			delete config.pageParam.parentSourceParam;
			for(var originalData in config.pageParam){
				if(paramJson[originalData]){

				}else{
					if(paramJson[originalData] == 0){

					}else{
						paramJson[originalData] = config.pageParam[originalData];
					}
				}
			}
			//nsVals.extendJSON(paramJson,config.pageParam);
		}
		delete paramJson.searchType;
		refreshTableData(gridId,paramJson);
	}
	function customFilterRefreshBtnHandler(event){
		var $this = $(this);
		var containerId = $this.attr('containerid');
		var prefix = 'query-';
		var gridId = containerId.substring(prefix.length,containerId.length);
		var templateId = gridId.substring(0,gridId.lastIndexOf('-list'));
		if(templateId){
			if(NetstarTemplate.templates.businessDataBase.data[templateId]){
				config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
			}
		}
		confirmQuickQueryHandler({gridId:gridId,formId:'query-'+gridId});
	}
	function tableQuickqueryInit(queryConfig){
		if(componentsConfig.vo.length > 0){return;}
		var formJson = {
			id:queryConfig.id,
			formStyle:'pt-form-normal',
			plusClass:'pt-custom-query',
			isSetMore:false
		};
		switch(queryConfig.type){
			case 'select':
				formJson.form = queryConfig.queryForm;
				var btnJson = {
					id:'advance-'+queryConfig.id,
					pageId:config.id,
					btns:[{
						text:'高级查询',
						handler:function(_data){
							var dialogCommon = {
								id:'advance-dialog-form',
								title: '高级查询',
								templateName: 'PC',
								height:'auto',
								shownHandler:function(data){
									//清空快速查询
									var advanceQueryAtStore = store.get('dialog-advance-dialog-form-body');
									var advanceFormArray = $.extend(true,[],queryConfig.advanceForm);
									var formConfig = {
										id: data.config.bodyId,
										templateName: 'form',
										componentTemplateName: 'PC',
										defaultComponentWidth:'50%',
										form:advanceFormArray,
										//isSetMore:false,
										completeHandler:function(data){
											var gridId = queryConfig.id.substring(6,queryConfig.id.length);
											var dataConfig = data.config;
											var id = dataConfig.id;
											var footerId = id.substring(0,id.length-5)+'-footer-group';
											var btnJson = {
												id:footerId,
												pageId:id,
												btns:[
													{
														text:'重置',
														handler:function(){
															NetstarComponent.clearValues('dialog-advance-dialog-form-body',false);
															store.set('dialog-advance-dialog-form-body',{});
														}
													},
													{
														text:'查询',
														handler:function(){
															var formJson = NetstarComponent.getValues('dialog-advance-dialog-form-body');
															store.set('dialog-advance-dialog-form-body',formJson);
															var queryConfig = NetstarComponent.config['dialog-advance-dialog-form-body'].config;
															for(var value in queryConfig){
																if(formJson[value]){
																	if(queryConfig[value].type=='business'){
																		switch(queryConfig[value].selectMode){
																			case 'single':
																				formJson[value] = formJson[value][queryConfig[value].idField];
																				break;
																			case 'checkbox':
																				formJson[value] = formJson[value][0][queryConfig[value].idField];
																				break;
																		}
																	}
																}
															}
															if(!$.isEmptyObject(config.pageParam)){
																nsVals.extendJSON(formJson,config.pageParam);
															}
															formJson = nsServerTools.deleteEmptyData(formJson);
															NetStarGrid.refreshById(gridId,formJson);
															NetstarComponent.dialog['advance-dialog-form'].vueConfig.close();
															$('#form-'+queryConfig.id+'-filterstr').val('');
														}
													},{
														text:'关闭',
														handler:function(){
															NetstarComponent.dialog['advance-dialog-form'].vueConfig.close();
														}
													}
												]
											}
											vueButtonComponent.init(btnJson);
										}
									};
									var component = NetstarComponent.formComponent.getFormConfig(formConfig,advanceQueryAtStore);
									NetstarComponent.formComponent.init(component, formConfig);
								}
								/*form:queryConfig.advanceForm,
								btns:[{
									text:'确认',
									handler:function(){}
								}]*/
							}
							NetstarComponent.dialogComponent.init(dialogCommon);
						}
					}]
				}
				vueButtonComponent.init(btnJson);
				break;
			case 'form':
				formJson.form = queryConfig.form;
				break;
		}
		formJson.completeHandler = function(obj){
			var buttonHtml = '<div class="pt-btn-group">'
							+'<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" containerid="'+formJson.id+'"><i class="icon-search"></i></button>'
						+'</div>';
			var $container = $('#'+formJson.id);
			$container.append(buttonHtml);
			$('button[containerid="'+formJson.id+'"]').off('click',customFilterRefreshBtnHandler);
			$('button[containerid="'+formJson.id+'"]').on('click',customFilterRefreshBtnHandler);
		}
		formJson.getPageDataFunc = function(){return config.pageParam}
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
									config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
								}
								confirmQuickQueryHandler({gridId:gridId,formId:formId});
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
									config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
								}
								confirmQuickQueryHandler({gridId:gridId,formId:formId});
							}
						});
					}else{
						var gridId = formId.substring(6,formId.length);
						var templateId = gridId.substring(0,gridId.lastIndexOf('-list'));
						if(templateId){
							config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
						}
						confirmQuickQueryHandler({gridId:gridId,formId:formId});
					}
				}
			}
		}
		NetstarComponent.formComponent.init(component2,formJson);
	}
	function setGridQueryPanelData(_config){
		if(_config.ui.query){
			if(_config.ui.query.value){
			//	_config.data.data.searchType = gridSearchType;
				//_config.data.data.keyword = _config.ui.query.value;
			}
		}
		var tableColumnArray = _config.columns;
		var gridQueryPanelConfig = {};
		if(_config.ui.customForm){
			//自定义了表单检索
			gridQueryPanelConfig = {
				id:'query-'+_config.id,
				type:'form',
				form:_config.ui.customForm,
			};
		}else{
			//自定义的列配置 开启了列检索
			if(_config.data.isSearch){
				var defaultValue = '';
				if(_config.ui.query){
					if(_config.ui.query.value){
						defaultValue = _config.ui.query.value;
					}
				}
				gridQueryPanelConfig = NetStarUtils.getListQueryData(tableColumnArray,{id:_config.id,value:defaultValue});
			}
		}
		_config.ui.query = gridQueryPanelConfig;
	}
	//关闭弹框要执行的函数方法
	function hiddenHandler(_config){
		$(document).off('keyup',documentKeyupHandler);
		NetstarTemplate.hiddenDialogHandler(_config.config);//sjj 20190814 关闭弹框调用关闭快捷键
	}
	function documentEnterHandler(){
		var gridConfig = $.extend(true,{},componentsConfig.list[0]);
		var selectData = getSelectedData(gridConfig.id);
		if(typeof(componentConfig.doubleClickHandler)=='function'){
			hiddenHandler();
			componentConfig.doubleClickHandler(selectData);
		}
	}
	function documentKeyupHandler(event){
		event.preventDefault();
		var gridConfig = event.data.grid;
		var $trs = $('#'+gridConfig.id+'-contenttable tbody');
		var $selectedTr = $trs.children('.selected');
		switch(event.keyCode){
			case 13:
				//回车
				documentEnterHandler();
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
				hiddenHandler();
				if(typeof(componentConfig.closeHandler)=='function'){
					componentConfig.closeHandler();
				}
				break;
		}
	}

	function refreshTabListDataByAjax(tabConfig,data){
			var ajaxConfig = $.extend(true,{},tabConfig.queryConfig.ajax);
			if(typeof(data)=="undefined"||$.isEmptyObject(data)){
				return ;
			}
			var templatesConfig = tabConfig.templatesConfig;
			var listConfig = templatesConfig.componentsConfig.list[0];
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

	//grid组件初始化调用
	function gridPanelInit(_customUI,isForm){
		var gridConfig = $.extend(true,{},componentsConfig.list[0]);
		if(config.pageParam){
			if(config.pageParam.keyword){
				gridConfig.ui.query = {
					value:config.pageParam.keyword
				};
			}
		}
		if(gridConfig.type == 'list'){
			gridConfig.data.ajaxSuccessHandler = ajaxSuccessHandler;
		}

		setGridQueryPanelData(gridConfig);
		gridConfig.ui.height = commonPanelHeight;
		if(gridConfig.ui.selectMode != 'none'){
			gridConfig.ui.defaultSelectedIndex = 0;//默认选中第一行
		}
		if(!$.isEmptyObject(config.tabConfig.queryConfig)){
			gridConfig.ui.height = parseInt(commonPanelHeight/2);
			//gridConfig.ui.selectedHandler = tabDetailSelectHandler;
		}
		gridConfig.ui.pageLengthDefault = 10;
		if(gridConfig.ui.displayMode == 'treeGrid'){
			gridConfig.ui.isPage = false;
			gridConfig.ui.pageLengthDefault = 100000;
		}//tree展现的格式不支持分页
		if(componentsConfig.tableRowBtns.length > 0){
			gridConfig.ui.tableRowBtns = componentsConfig.tableRowBtns;
		}
		currentTableId = gridConfig.id;
		gridConfig.ui.completeHandler = function(){
			setTableHtml(gridConfig);
			tableQuickqueryInit(gridConfig.ui.query);
			if(componentSource == 'component'){
				$(document).on('keyup',{grid:gridConfig},documentKeyupHandler);
			}
		};
		if(_customUI){
			nsVals.extendJSON(gridConfig.ui,_customUI)
		}
		switch(componentsConfig.list[0].type){
			case 'blockList':
				var vueObj = NetstarBlockList.init(gridConfig);		
				break;
			default:
				var vueObj = NetStarGrid.init(gridConfig);
				break;
		}
	}
	function showPageData(pageConfig, configObj, pageOperateData){
		var showConfig = $.extend(true,{},pageConfig);
		var functionConfig = configObj.data.functionConfig;
		var gridConfig = $.extend(true,{},componentsConfig.list[0]);
		var idField = gridConfig.data.primaryID;
		switch(functionConfig.editorType){
			case 'add':
				delete showConfig.getValueAjax;
				showConfig.pageParam = {
					data_auth_code:pageConfig.pageParam.data_auth_code
				};
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
					$(document).on('keyup',{grid:config.componentsConfig.list[0]},documentKeyupHandler);
				}else{
					gridSearchType = 'quickSearch';
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
				vueButtonComponent.bindKeydownHandler(NetstarTemplate.templates.businessDataBase.data[configObj.templateId].config.package);
				refreshByPackage({templateId:configObj.templateId},{},plusData);
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
				 	for(var key in valueData){
						showConfig.pageParam[key] = valueData[key];
				 }
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
		if(configObj.data.rowData){
			configObj.value = configObj.data.rowData[0];
		}
		configObj.data.functionConfig = componentBtnConfig[templateId][configObj.type];
		if($.isEmptyObject(configObj.data.functionConfig)){
			return false;
		}
		var url = configObj.data.functionConfig.url;
		if(configObj.value){
			var tempValueName = config.package + new Date().getTime();
			NetstarTempValues[tempValueName] = configObj.value;
    		var urlStr =  encodeURIComponent(encodeURIComponent(tempValueName));
			url = url+'?templateparam='+urlStr;
		}
		configObj.subUrl = true;//弹出页打开弹出页
		var ajaxConfig = {
			url:url,
			type:'GET',
			dataType:'html',
			context:{
				config:configObj
			},
			success:function(data){
				var _config = this.config;
				var _configStr = JSON.stringify(_config);
				
				// 获取页面操作数据 lyw 20190620 start ---
				var pageOperateData = {};
				if(typeof(_config.getOperateData) == "function"){
					pageOperateData = _config.getOperateData();
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
			}
		};
		$.ajax(ajaxConfig);
	}

	function editDialogToPage(_data){
		var data = $.extend(true,{},_data);
		var navId = '';
		if(_data.data.id){
			navId = $('#'+_data.data.id).closest('.nav-form').attr('id');
		}else{
			navId = $(data.event.currentTarget).closest('.nav-form').attr('id');
		}
		var templateId = navId.substring(0,navId.lastIndexOf('-btns'));
		//currentTableId = templateId +'-list-0';
		config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		currentTableId = config.componentsConfig.list[0].id;
		var selectdGridArray = getSelectedData(currentTableId);
		var functionConfig = data.data.functionConfig;
		if(selectdGridArray.length > 0){
			data.value = selectdGridArray[0];
		}else{
			if(functionConfig.editorType == 'copyAdd' || functionConfig.editorType == 'edit'){
				nsalert('请先选中要编辑的值');
				return false;
			}else{
				data.value = {};
			}
		}
		data.gridId = currentTableId;
		data.templateId = templateId;
		data.subUrl = false;
		if(typeof(config.pageParam)=='object'){
			nsVals.extendJSON(data.value,config.pageParam);
		}
		if(typeof(functionConfig.data)=='string'){
			var ajaxParamData = JSON.parse(functionConfig.data);
			nsVals.extendJSON(data.value,ajaxParamData);
		}
		componentsConfig = config.componentsConfig;
		var url = functionConfig.url;
		if(data.value){
			var tempValueName = config.package + new Date().getTime();
			NetstarTempValues[tempValueName] = data.value;
    		var urlStr = encodeURIComponent(encodeURIComponent(tempValueName));
			url = url+'?templateparam='+urlStr;
		}
		var pageConfig = {
			pageIidenti : functionConfig.url,
			paramObj : urlStr,
			url : url,
			config : data,
         callBackFunc : function(isSuccess, data, _pageConfig){
				if(isSuccess){
					var _config = _pageConfig.config;
					var _configStr = JSON.stringify(_config);
				
					// 获取页面操作数据 lyw 20190620 start ---
					var pageOperateData = {};
					if(typeof(_config.getOperateData) == "function"){
						pageOperateData = _config.getOperateData();
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
		var ajaxConfig = {
			url:url,
			type:'GET',
			// dataType:'html',
			context:{
				config:data
			},
			success:function(data){
            if(typeof(data) == "object"){
               data = pageProperty.getPageHtml(data.data);
            }
				var _config = this.config;
				var _configStr = JSON.stringify(_config);
				var funcStr = 'NetstarTemplate.templates.businessDataBase.showPageData(pageConfig,'+_configStr+')';
				//var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
				var starStr = '<container>';
				var endStr = '</container>';
				var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
				var exp = /NetstarTemplate\.init\((.*?)\)/;
				var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
				containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
				var $container = nsPublic.getAppendContainer();
				$container.append(containerPage);
			}
		};
		// $.ajax(ajaxConfig);

	}


	function tableAddBtnHandler(data){
		getAjaxToPage({data:data,type:'add'});
	}
	function buttonInit(navJson){
		vueButtonComponent.init(navJson);
	}
	function tableRowBtnsHandler(dataObj){
		var buttonIndex = dataObj.buttonIndex;
		var templateId = dataObj.gridId.substring(0,dataObj.gridId.lastIndexOf('-list'));
		if(dataObj.gridId.indexOf('-block')>-1){
			templateId = dataObj.gridId.substring(0,dataObj.gridId.lastIndexOf('-block'));
		}
		if(NetstarTemplate.templates.businessDataBase.data[templateId]){
			componentsConfig = NetstarTemplate.templates.businessDataBase.data[templateId].config.componentsConfig;
		}
		var handler = componentsConfig.originalRowBtns[dataObj.gridId][buttonIndex].btn.handler;
		var callbackFunc = {
			dialogBeforeHandler:(function(templateId){
				return function (data) {
				  return dialogBeforeHandler(data,templateId);
				}
			 })(templateId),
			ajaxBeforeHandler:(function(_pageParams){
				return function (data) {
				  data.value = _pageParams.rowData;
				  return ajaxBeforeHandler(data,_pageParams.templateId);
				}
			 })({templateId:templateId,rowData:dataObj.rowData}),
			ajaxAfterHandler:(function(templateId){
				return function (data,plusData) {
				  return ajaxAfterHandler(data,templateId,plusData);
				}
			 })(templateId),
		}
		nsVals.extendJSON(dataObj,callbackFunc);
		handler(dataObj,{$dom:dataObj.$btn,rowData:dataObj.rowData});
	}
	//tableRowBtns
	function setGridRowBtns(){
		var tableRowBtns = [];
		var componentBtnArray = componentsConfig.btns;
		for(var btnI=0; btnI<componentBtnArray.length; btnI++){
			var btnData = componentBtnArray[btnI];
			if($.isArray(btnData.field)){
				for(var btnI=0; btnI<btnData.field.length; btnI++){
					//查找是否存在添加编辑操作 editorType add copyAdd edit  defaultMode editDialog
					if(typeof(btnData.field[btnI].functionConfig)=='object'){
						var isInlineBtn = typeof(btnData.field[btnI].functionConfig.isInlineBtn) == 'boolean' ? btnData.field[btnI].functionConfig.isInlineBtn : false;
						if(isInlineBtn){
							//行内按钮
							tableRowBtns.push(btnData.field[btnI]);
							btnData.field.splice(btnI,1);
							btnI--;
						}
					}
				}
			}
		}
		var originalRowBtns = $.extend(true,[],tableRowBtns);
		for(var rowBtnI=0; rowBtnI<tableRowBtns.length; rowBtnI++){
			var btnJson = $.extend(true,{},tableRowBtns[rowBtnI].btn);
			tableRowBtns[rowBtnI].btn.handler = (function(){
				return function(data){
					tableRowBtnsHandler(data);
				}
			 })()
		}
		tableRowBtns = NetstarTemplate.getBtnArrayByBtns(tableRowBtns);//得到按钮值
		componentsConfig.tableRowBtns = tableRowBtns;
		if(componentsConfig.list.length > 0){
			componentsConfig.originalRowBtns[componentsConfig.list[0].id] = originalRowBtns;
		}else{
			nsalert('模板配置错误，需配置list', 'error');
			console.error('模板配置错误，需配置list');
		}
	}
	//刷新list
	//自定义查询vo
	function voCommonChangeHandler(data){
		var paramJson = NetstarComponent.getValues(data.config.formID);
		var templateId = data.config.formID.substring(0,data.config.formID.lastIndexOf('-vo'));
		if(NetstarTemplate.templates.businessDataBase.data[templateId]){
			config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
		}
		var gridId = config.componentsConfig.list[0].id;
		if(typeof(config.pageParam)=='object'){
			nsVals.extendJSON(paramJson,config.pageParam);
		}
		var listGrid;
		if(NetStarGrid.configs[gridId]){
			listGrid = NetStarGrid.configs[gridId];
		}else{
			listGrid = NetstarBlockList.configs[gridId];
		}
		listGrid.vueObj.page.start = 0;
		listGrid.vueObj.page.length = 10;
		NetStarGrid.refreshById(gridId,paramJson);
	}
	function voPanelInit(){
		var voArray = $.extend(true,[],componentsConfig.vo);
		for(var voI=0; voI<voArray.length; voI++){
			var voData = voArray[voI];
			for(var fieldI=0; fieldI<voData.field.length; fieldI++){
				voData.field[fieldI].commonChangeHandler = voCommonChangeHandler;
			}
			var formJson = {
				id:voData.id,
				form:voData.field,
				isSetMore:false,
				formStyle:voData.formStyle,
				plusClass:'pt-custom-query',
			};
			var component2 = NetstarComponent.formComponent.getFormConfig(formJson);
			NetstarComponent.formComponent.init(component2,formJson);
		}
	}

	//按钮组件初始化调用
	function btnPanelInit(){
		//针对界面去显示按钮  当前界面要显示的按钮 和从其他界面要调用显示的按钮
		/*
			* source   			是否来源于当前界面 current  common 
			* containerId		容器id
		*/

		componentBtnConfig[config.id] = {};
		for(var btnI=0; btnI<componentsConfig.btns.length; btnI++){
			var btnData = componentsConfig.btns[btnI];
			var btnArray = [];
			if($.isArray(btnData.field)){

				var editorNsIndex = -1;
				var editorNsIndexArray = [];
				for(var btnI=0; btnI<btnData.field.length; btnI++){
					//查找是否存在添加编辑操作 editorType add copyAdd edit  defaultMode editDialog
					if(typeof(btnData.field[btnI].functionConfig)=='object'){
						if(btnData.field[btnI].functionConfig.defaultMode == 'editorDialog'){
							var editorType = btnData.field[btnI].functionConfig.editorType;
							if(editorType){
								var editorNameArray = editorType.split(',');
								if(editorNameArray.length == 1){
									componentBtnConfig[config.id][editorType] = btnData.field[btnI].functionConfig;
									btnData.field[btnI].btn.handler = editDialogToPage;
									btnData.field[btnI].btn.functionConfig = btnData.field[btnI].functionConfig;
									if(btnData.field[btnI].btn.text == '编辑'){
										btnData.field[btnI].btn.functionConfig.shortcutKey = 'Ctrl+E';
									}
								}else{
									editorNsIndex = btnI;
									editorNsIndexArray.push(btnI);
									//break;
								}
							}
						}
					}
				}

				var tableBtnsArray = $.extend(true,[],btnData.field);//克隆 
				if(editorNsIndex > -1){
					tableBtnsArray.splice(editorNsIndex,1);
					btnArray = NetstarTemplate.getBtnArrayByBtns(tableBtnsArray);//得到按钮值
					var btnJson = btnData.field[editorNsIndex];
					var textNameArray = btnJson.btn.text.split(',');
					var editorNameArray = btnJson.functionConfig.editorType.split(',');
					for(var textI=textNameArray.length-1; textI>-1; textI--){
						var functionConfig = $.extend(true,{},btnJson.functionConfig);
						functionConfig.editorType = editorNameArray[textI];
						componentBtnConfig[config.id][functionConfig.editorType] = functionConfig;
						var shortcutKey = '';
						switch(textNameArray[textI]){
							case '新增':
								shortcutKey = 'Ctrl+O';
								break;
							case '复制新增':
								shortcutKey = 'Ctrl+C';
								break;
							case '编辑':
								shortcutKey = 'Ctrl+E';
								break;
						}
						btnArray.unshift({
							text:textNameArray[textI],
							shortcutKey:shortcutKey,
							handler:editDialogToPage,
							functionConfig:functionConfig,
							defaultMode:functionConfig.defaultMode,
							functionClass:functionConfig.functionClass,
							isCloseWindow:functionConfig.isCloseWindow,
							requestSource:functionConfig.requestSource,
							isMainDbAction:functionConfig.isMainDbAction,
							isSendPageParams:typeof(functionConfig.isSendPageParams)=='boolean'?functionConfig.isSendPageParams:true,//sjj 20190618 是否发送页面参数
						});
					}
				}else{
					btnArray = NetstarTemplate.getBtnArrayByBtns(tableBtnsArray);//得到按钮值
				}
			}
			var navJson = {
				id:btnData.containerId,
				pagerId:config.id,
				package:config.package,
				isShowTitle:false,
				btns:btnArray,
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
						return function (data,plusData) {
						  return ajaxAfterHandler(data,config.id,plusData);
						}
					 })(config),
					loadPageHandler:loadPageHandler,
					closePageHandler:closePageHandler,
					getOperateData:(function(config){
						return function () {
							var pageData = NetstarTemplate.getOperateData(config);
							return pageData;
						}
					})(config),
					dataImportComplete:(function(config){
						return function (data, _config) {
							refreshByConfig(config);
						}
					})(config),
				}
			};
			buttonInit(navJson);
		}
	}
	//分类组件初始化调用
	function classPanelInit(){
		var classJson = componentsConfig.class[0];
		var classId = 'class-'+classJson.containerId;
		var classHtml = '<div class="pt-title text-danger">'
							+'<h6>'+classJson.title+'</h6>'
							+'<span class="class-content" id="'+classId+'"></span>'
						+'</div>';
		var html = 	NetstarTemplate.getPanelHtml(classHtml);		
		$('#'+classJson.containerId).html(html);
		getClassAjax({containerId:classId});
	}
	function ajaxSuccessHandler(rows,gridId){
		//selectIds
		var grid = NetStarGrid.configs[gridId];
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
			//console.log(grid.gridConfig.ui.selectIds)
			delete grid.gridConfig.ui.selectIds;
		}
	}
	function drawHandler(_vueData){
		var gridId = _vueData.$options.id;
		var templateId = '';
		switch(_vueData.ui.displayMode){
			case 'block':
				templateId = gridId.substring(0,gridId.lastIndexOf('-block'));
				break;
			default:
				templateId = gridId.substring(0,gridId.lastIndexOf('-list'));
				break;
		}
		config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
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
				//查找按钮是否设置了禁用
				NetStarUtils.setBtnsDisabled(config.componentsConfig.btns,data);

				if(!$.isEmptyObject(config.tabConfig.queryConfig)){
					refreshTabListDataByAjax(config.tabConfig,data);
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


	function tabDetailListInit(listJson){
		for(var listId in listJson){
			var listConfig = listJson[listId];
			var gridConfig = {
				id:listId,
				type:listConfig.type,
				idField:listConfig.idField,
				templateId:config.id,
				package:config.package,
				isReadStore:false,
				data:{
					isSearch:true,
					isPage:true,
					primaryID:listConfig.idField,
					idField:listConfig.idField,
					dataSource:[]
				},
				columns:$.extend(true,[],listConfig.field), 
				ui:{
					isHaveEditDeleteBtn:false,
					isHaveAddBtn:true,
					isEditMode:false,
					selectMode:'single',
					height:parseInt(commonPanelHeight/2) - 80,
					isHeader:false,
					isCheckSelect:false,
					isThead:true,
				}
			};
			var vueObj = NetStarGrid.init(gridConfig);
		}
	}

	//组件调用初始化
	function initPanel(isForm){
		if(componentsConfig.tree.length > 0){
			treePanelInit();
		}
		if(componentsConfig.class.length > 0){
			classPanelInit();
		}
		if(componentsConfig.list.length > 0){
			gridPanelInit({
				drawHandler:function(_vueData){
					//NetStarUtils.disabledExpression
					drawHandler(_vueData);
				},
			},isForm);
		}
		if(componentsConfig.vo.length > 0){
			voPanelInit();
		}
		if(componentsConfig.btns.length > 0){
			btnPanelInit();
		}

		if(!$.isEmptyObject(config.tabConfig.listConfig)){
				var detailListPanelId = config.tabConfig.id;
				var $lis = $('#tab-'+detailListPanelId+' > li');
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
				tabDetailListInit(config.tabConfig.listConfig);
		}

	}
	//输出html元素
	function initContainer(){
		var bodyTitleHtml = '';
		var treeHtml = '';
		var classHtml = '';
		var listHtml = '';
		var btnHtml = '';
		var voHtml = '';
		if(config.title){
			//定义了标题输出
			var titleHtml = '<div class="pt-title pt-page-title"><h4>'+config.title+'</h4></div>';
			bodyTitleHtml = '<div class="pt-main-row">'
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
		if(componentsConfig.vo.length > 0){
			var voArray = componentsConfig.vo;
			for(var voI=0; voI<voArray.length; voI++){
				var voData = voArray[voI];
				var classStr = 'component-'+voData.type;//class名称
				if(voData.position){
					//定义了位置
					classStr += ' '+voData.position;
				}
				var html = '<div class="'+classStr+'" id="'+voData.id+'"></div>';
				voHtml += '<div class="pt-main-row businessdatabase-vo">'
								+'<div class="pt-main-col">'
									+NetstarTemplate.getPanelHtml(html)
								+'</div>'
							+'</div>';
			}
		}
		if(componentsConfig.tree.length > 0){
			//树容器
			treeHtml = '<div class="pt-main-col" id="'+componentsConfig.tree[0].containerId+'"></div>';
		}
		if(componentsConfig.class.length > 0){
			//分类容器
			classHtml = '<div class="pt-panel" id="'+componentsConfig.class[0].containerId+'"></div>';
		}
		if(componentsConfig.list.length > 0){
			//表格容器
			listHtml = '<div class="pt-panel businessdatabase-grid-component" id="'+componentsConfig.list[0].id+'"></div>'
		}
		
		var detailListHtml = '';
		var isTab = false;
		if(!$.isEmptyObject(config.tabConfig.queryConfig)){
			isTab = true;
			//含有tab的处理
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
			var tabHtml = '<div class="pt-tab-components-tabs pt-tab">'
									+'<div class="pt-container">'
										+'<div class="pt-tab-header">'
											+'<div class="pt-nav">'
												+'<ul class="pt-tab-list-components-tabs" id="tab-'+config.tabConfig.id+'">'
													+tabLiHtml
												+'</ul>'
											+'</div>'
										+'</div>'
										+'<div class="pt-tab-body">'
											+tabContentHtml
										+'</div>'
									+'</div>'
								+'</div>';
				detailListHtml = '<div class="pt-main-row businessdatabase-treelist-detaillist" id="tree-detaillist-'+config.tabConfig.id+'">'
									+'<div class="pt-main-col">'
										+'<div class="pt-panel">'
											+'<div class="pt-container">'
												+'<div calss="pt-panel-row">'
													+'<div class="pt-panel-col">'
														+tabHtml
													+'</div>'
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>';
		}

		if(componentsConfig.btns.length > 0){
			//按钮
			var html = '';
			for(var btnI=0; btnI<componentsConfig.btns.length; btnI++){
				var classStr = 'nav-form';
				if(componentsConfig.btns[btnI].position){
					classStr += ' '+componentsConfig.btns[btnI].position;
				}
				html += '<div class="nav-form" id="'+componentsConfig.btns[btnI].containerId+'"></div>';
			}
			btnHtml = '<div class="pt-panel button-panel-component">'
							+'<div class="pt-panel">'
								+'<div class="pt-container">'
									+'<div class="pt-panel-row">'
										+'<div class="pt-panel-col">'
											+html
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
			if(detailListHtml){
				detailListHtml += '<div class="pt-panel-row">'
														+'<div class="pt-panel-col">'
															+html
														+'</div>'
													+'</div>'
			}
		}
		var bodyHtml = '';
		if(isTab == false){
			bodyHtml = '<div class="pt-container">'
									+bodyTitleHtml
									+voHtml
									+'<div class="pt-main-row">'
										+treeHtml 
										+'<div class="pt-main-col">'
											+classHtml+listHtml
											+btnHtml
										+'</div>'
									+'</div>'
							+'</div>';
		}else{

			if(treeHtml){
				bodyHtml = '<div class="pt-container">'
												+bodyTitleHtml
												+voHtml
												+'<div class="pt-main-row">'
													+treeHtml 
													+'<div class="pt-main-col">'
														+classHtml+listHtml
														+detailListHtml+btnHtml
													+'</div>'
												+'</div>'
										+'</div>';
			}else{
					bodyHtml = '<div class="pt-container">'
													+bodyTitleHtml
													+voHtml
													+'<div class="pt-main-row">'
														+treeHtml 
														+'<div class="pt-main-col">'
															+classHtml+listHtml
														+'</div>'
													+'</div>'
													+detailListHtml
											+'</div>';
			}
		}
		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		var templateClassStr = '';
		if(config.plusClass){
			templateClassStr = config.plusClass;
		}
		var html = '<div class="pt-main businessdatabase '+templateClassStr+'" id="'+config.id+'">'+bodyHtml+'</div>';
		if(config.$container){
			config.$container.html(html);
		}else{
			$container.prepend(html);//输出面板
		}
	}
	//设置默认值
	function setDefault(){
		config.tabConfig = {
			id:"tree-detaillist-"+config.id,
			queryConfig:{},
			listConfig:{},
			templatesConfig:config
		};
		var isTab = false;
		for(var componentI=0; componentI<config.components.length; componentI++){
			if(config.components[componentI].type == 'tab'){
				isTab = true;
				break;
			}
		}

		for(var componentI=0; componentI<config.components.length; componentI++){
			var componentData = config.components[componentI];
			var containerId = config.id+'-'+componentData.type+'-'+componentI;//定义容器id 
			var json = $.extend(true,{},componentData);
			json.containerId = containerId;
			var type = componentData.type;
			var componentKeyField = componentData.keyField ? componentData.keyField : '';
			if(componentKeyField == 'root'){componentKeyField = '';}
			switch(componentData.type){
				case 'tree':
					json.id = 'tree-'+containerId;
					//NetStarUtils.setDefaultValues(json,componentData.ajax);
					//json.url = componentData.ajax.src;
					//delete json.src;
					//delete json.ajax;
					//json.type = componentData.ajax.type;
					componentsConfig[type].push(json);
					break;
				case 'list':
				case 'blockList':
					if(isTab == false){
						type = 'list';
						var dataConfig = {
							isSearch:true,
							isPage:true,
							primaryID:componentData.idField,
							idField:componentData.idField,
							data:{}
						};
						if(!$.isEmptyObject(componentData.params)){
							if(componentData.params.isServerMode){
								dataConfig.isServerMode = componentData.params.isServerMode;
							}
						}
						//var gridAjax = $.extend(true,{},componentData.ajax);
						var gridAjax = componentData.ajax;
						if(typeof(gridAjax)=="object"){
							if(typeof(gridAjax.contentType)=='undefined'){
								gridAjax.contentType = 'application/json; charset=utf-8';
							}
							nsVals.extendJSON(dataConfig,gridAjax);
						}
						if(typeof(config.pageParam)=='object'){
							var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
							var _ajaxConfig = componentData.ajax; 
							var isUseObject = true;
							for(var key in _ajaxConfig.data){
								if (ajaxParameterRegExp.test(_ajaxConfig.data[key])) {
									isUseObject = false;
									break;
								}
							}
							if(isUseObject){
								delete config.pageParam.parentSourceParam;
								nsVals.extendJSON(dataConfig.data,config.pageParam);
							}else{
								config.pageParam = NetStarUtils.getFormatParameterJSON(dataConfig.data,config.pageParam);
								//nsVals.extendJSON(dataConfig.data,customAjaxData);
								dataConfig.data = config.pageParam;
							}
							if(config.pageParam.data_auth_code){
								dataConfig.data.data_auth_code = config.pageParam.data_auth_code;
								currentQueryParams.data_auth_code = config.pageParam.data_auth_code;
							}
						}
						if(config.data_auth_code){
							dataConfig.data.data_auth_code = config.data_auth_code;
							currentQueryParams.data_auth_code = config.data_auth_code;
						}
						var isCheckSelect = true;
						if(componentData.type == 'blockList'){
							isCheckSelect = false;
						}
						json = {
							type:componentData.type,
							data:dataConfig,
							columns:componentData.field,
							plusClass:componentData.plusClass,
							ui:{
								pageChangeAfterHandler:isLengthChangeAfterHandler,
								pageLengthChangeHandler:pageLengthChangeHandler,	
								//rowdbClickHandler:rowDoubleSelectHandler,
								//tableRowBtns:[],
								selectMode:'single',
								isCheckSelect:true,
								listExpression:componentData.listExpression,
								isHaveEditDeleteBtn:typeof(componentData.isHaveEditDeleteBtn)=='boolean' ? componentData.isHaveEditDeleteBtn : false,
								isCheckSelect:typeof(componentData.isCheckSelect)=='boolean' ? componentData.isCheckSelect : isCheckSelect,
							},
							id:containerId,
							keyField:componentData.keyField,
							idField:componentData.idField,
						};
						if(!$.isEmptyObject(componentData.params)){
							nsVals.extendJSON(json.ui,componentData.params);
						}
						currentQueryParams.count = 10;
						componentsConfig[type].push(json);
					}else{
						if(componentKeyField){
							config.tabConfig.listConfig[componentData.id] = json;
						}else{
							var dataConfig = {
								isSearch:true,
								isPage:true,
								primaryID:componentData.idField,
								idField:componentData.idField,
								data:{}
							};
							if(!$.isEmptyObject(componentData.params)){
								if(componentData.params.isServerMode){
									dataConfig.isServerMode = componentData.params.isServerMode;
								}
							}
							//var gridAjax = $.extend(true,{},componentData.ajax);
							var gridAjax = componentData.ajax;
							if(typeof(gridAjax)=="object"){
								if(typeof(gridAjax.contentType)=='undefined'){
									gridAjax.contentType = 'application/json; charset=utf-8';
								}
								nsVals.extendJSON(dataConfig,gridAjax);
							}
							if(typeof(config.pageParam)=='object'){
								var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
								var _ajaxConfig = componentData.ajax; 
								var isUseObject = true;
								for(var key in _ajaxConfig.data){
									if (ajaxParameterRegExp.test(_ajaxConfig.data[key])) {
										isUseObject = false;
										break;
									}
								}
								if(isUseObject){
									delete config.pageParam.parentSourceParam;
									nsVals.extendJSON(dataConfig.data,config.pageParam);
								}else{
									config.pageParam = NetStarUtils.getFormatParameterJSON(dataConfig.data,config.pageParam);
									//nsVals.extendJSON(dataConfig.data,customAjaxData);
									dataConfig.data = config.pageParam;
								}
								if(config.pageParam.data_auth_code){
									dataConfig.data.data_auth_code = config.pageParam.data_auth_code;
									currentQueryParams.data_auth_code = config.pageParam.data_auth_code;
								}
							}
							if(config.data_auth_code){
								dataConfig.data.data_auth_code = config.data_auth_code;
								currentQueryParams.data_auth_code = config.data_auth_code;
							}
							var isCheckSelect = true;
							if(componentData.type == 'blockList'){
								isCheckSelect = false;
							}
							json = {
								type:componentData.type,
								data:dataConfig,
								columns:componentData.field,
								plusClass:componentData.plusClass,
								ui:{
									pageChangeAfterHandler:isLengthChangeAfterHandler,
									pageLengthChangeHandler:pageLengthChangeHandler,	
									//rowdbClickHandler:rowDoubleSelectHandler,
									//tableRowBtns:[],
									selectMode:'single',
									isCheckSelect:true,
									listExpression:componentData.listExpression,
									isHaveEditDeleteBtn:typeof(componentData.isHaveEditDeleteBtn)=='boolean' ? componentData.isHaveEditDeleteBtn : false,
									isCheckSelect:typeof(componentData.isCheckSelect)=='boolean' ? componentData.isCheckSelect : isCheckSelect,
								},
								id:containerId,
								keyField:componentData.keyField,
								idField:componentData.idField,
							};
							if(!$.isEmptyObject(componentData.params)){
								nsVals.extendJSON(json.ui,componentData.params);
							}
							currentQueryParams.count = 10;
							componentsConfig.list.push(json);
						}
					}
					break;
				case 'btns':
					componentsConfig[type].push(json);
					break;
				case 'tab':
					if(componentData.field){
						config.tabConfig.queryConfig = componentData;
					}
					break;
			}
		}
		setGridRowBtns();
	}
	//模板初始化调用
	function init(_config){
		config = _config;
		config.paramMode = config.paramMode ? config.paramMode : 'list';
		//第一次执行初始化模板
		if(typeof(NetstarTemplate.templates.businessDataBase.data)=='undefined'){
			NetstarTemplate.templates.businessDataBase.data = {};  
		}
		originalConfig = $.extend(true,{},config);//保存原始值
		//记录config
		NetstarTemplate.templates.businessDataBase.data[config.id] = {
			original:originalConfig,
			config:config
		};
		clearVals();//清空默认值
		
		setDefault();//设置默认值
		config.componentsConfig = componentsConfig;
		config.currentQueryParams = currentQueryParams;
		setContainerHeight(config);//设置容器高度
		//如果定义了class
		if(componentsConfig.class.length > 0){
			commonPanelHeight -= 24;
		}
		initContainer();//初始化容器面板
		initPanel();//组件初始化调用
	}
	function setComponentBtnConfig(btnsArray){
		var tableBtnsArray = $.extend(true,[],btnsArray);//克隆 
		var btnArray = NetstarTemplate.getBtnArrayByBtns(tableBtnsArray);//得到按钮值
		var nIndex = -1;
		for(var btnI=0; btnI<btnArray.length; btnI++){
			if(btnArray[btnI].text == '新增'){
				nIndex = btnI;
				break;
			}
		}
		componentBtnConfig[config.id] = {};
		if(nIndex > -1){
			//定义了新增
			componentBtnConfig[config.id].add = btnsArray[nIndex].functionConfig;
		}
	}
	//组件调用初始化
	function componentInit(_config,_componentConfig){
		/*
			{
				config:config,
				componentConfig:{
					container: 	'#' + bodyId,                   // 容器 （id或class）通过组件拿到（组件配置）
					selectMode: 	componentConfig.selectMode,     // radio checkbox noSelect 单选 多选 不能选 通过组件拿到（组件配置）
					componentClass :	'list',                         // 组件类别 默认list
					doubleClickHandler:	function(value){                // 显示弹框 传入的双击方法 （关闭弹框和刷新value/inputText）
						console.log(value);
						vueComponent.setValue(value);
						_this.close('#'+containerId, vueComponent);
					},
					editorConfig:{
						gridConfig:{
							gridConfig:{},
							gridData:[]
						}
					}
				}
			}
		*/
		clearVals();
		$('button[type="button"]').blur();

		componentSource = 'component';
		componentConfig = _componentConfig;
		config = $.extend(true,{},_config);

		var packageName = config.package.replace(/\./g, '-');
		config.id = 'component-nstemplate-layout-' + packageName.replace(/-/g, '-');
		config.paramMode = config.paramMode ? config.paramMode : 'list';
		componentBtnConfig[config.id] = {};
		
		if(typeof(NetstarTemplate.templates.businessDataBase.data)=='undefined'){
			NetstarTemplate.templates.businessDataBase.data = {};  
		}
		originalConfig = $.extend(true,{},config);//保存原始值
		//记录config
		NetstarTemplate.templates.businessDataBase.data[config.id] = {
			original:originalConfig,
			config:config
		};
		
		if(!$.isArray(config.components)){
			config.components = [];
			if(config.table){

				if(config.table.hide){
					NetstarTemplate.setFieldHide('table',config.table.field,config.table.hide);
				}
				config.components = [
					{
						type:'list',
						keyField:config.table.keyField,
						idField:config.table.idField,
						field:config.table.field,
						ajax:config.table.ajax,
						params:config.table.params
					}
				];
				if(typeof(config.components[0].ajax.contentType)=='undefined'){
					config.components[0].ajax.contentType = 'application/json; charset=utf-8';
				}
			}
		}
		var existIndex = -1;
		for(var componentI=0;componentI<config.components.length; componentI++){
			var componentData = config.components[componentI];
			switch(componentData.type){
				case 'list':
					delete componentData.edit;
					delete componentData.tableRowBtns;
					if(componentData.hide){
						NetstarTemplate.setFieldHide('table',componentData.field,componentData.hide);
					}
					break;
				case 'btns':
					var editorNsIndex = -1;
					for(var btnI=0; btnI<componentData.field.length; btnI++){
						var btnData = componentData.field[btnI];
						//查找是否存在添加编辑操作 editorType add copyAdd edit  defaultMode editDialog
						if(typeof(btnData.functionConfig)=='object'){
							if(btnData.functionConfig.defaultMode == 'editorDialog'){
								var editorType = btnData.functionConfig.editorType;
								var editorNameArray = editorType.split(',');
								if(editorNameArray.length == 1){
									componentBtnConfig[config.id][editorType] = btnData.functionConfig;
								}else{
									editorNsIndex = btnI;
									function setBtnsByEditorDialog(editIndex){
										var btnJson = componentData.field[editIndex];
										var textNameArray = btnJson.btn.text.split(',');
										var editorNameArray = btnJson.functionConfig.editorType.split(',');
										for(var textI=textNameArray.length-1; textI>-1; textI--){
											var functionConfig = $.extend(true,{},btnJson.functionConfig);
											functionConfig.editorType = editorNameArray[textI];
											componentBtnConfig[config.id][functionConfig.editorType] = functionConfig;
										}
									}
									setBtnsByEditorDialog(btnI);
									//break;
								}
							}
						}
					}
					/*if(editorNsIndex > -1){
						var btnJson = componentData.field[editorNsIndex];
						var textNameArray = btnJson.btn.text.split(',');
						var editorNameArray = btnJson.functionConfig.editorType.split(',');
						for(var textI=textNameArray.length-1; textI>-1; textI--){
							var functionConfig = $.extend(true,{},btnJson.functionConfig);
							functionConfig.editorType = editorNameArray[textI];
							componentBtnConfig[config.id][functionConfig.editorType] = functionConfig;
						}
					}*/
					break;
			}
		}
		setDefault();
		//setComponentBtnConfig(config.table.btns);

		/*************sjj 20190301 根据editorConfig判断是否需要排重 start*************/
		if(typeof(componentConfig.editorConfig)=='object'){
			var editorConfig = componentConfig.editorConfig;
			var isDistinct = typeof(editorConfig.isDistinct)=='boolean' ? editorConfig.isDistinct : false;
			var customUI = {
				hideValueOption:{}
			};
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
							idField:componentsConfig.list[0].idField
						};
						break;
					case 'table':
						distinctJson = {
							list:editorConfig.gridConfig.gridData,
							idField:componentsConfig.list[0].idField
						};
						break;
				}
				if(editorConfig.distinctField){
					//自定义了排重字段
					distinctJson.idField = editorConfig.distinctField;
				}
				customUI.hideValueOption = distinctJson;
			}
		}
		/*************sjj 20190301 根据editConfig 判断是否需要排重 end*************/
		switch(componentConfig.componentClass){
			case 'list':
				//列表
				//gridSearchType = 'accurate';
				componentsConfig.list[0].id = componentConfig.container;
				//需要判断当前行选中模式 isSingleSelect   isMulitSelect
				switch(componentConfig.selectMode){
					case 'single':
						componentsConfig.list[0].ui.selectMode = 'single';
						componentsConfig.list[0].ui.isCheckSelect = false;
						break;
					case 'checkbox':
						componentsConfig.list[0].ui.selectMode = 'checkbox';
						componentsConfig.list[0].ui.isCheckSelect = true;
						break;
					case 'multi':
						componentsConfig.list[0].ui.selectMode = 'multi';
						break;
					case 'noSelect':
						componentsConfig.list[0].ui.selectMode = 'none';
						break;
				}
				//tableConfig.containerId = componentConfig.container;
				//自动带过来需要查询的值
				//sjj 删除带按钮
				componentsConfig.list[0].ui.minPageLength = 10;
				customUI.tableRowBtns = [];
				componentsConfig.list[0].ui.rowdbClickHandler = rowDoubleSelectHandler;
				gridPanelInit(customUI,true);
				break;
			case 'select':
				break;
			default:
				nsalert('找不到对应组件');
				console.warn(data);
				break;
		}
		config.componentsConfig = $.extend(true,{},componentsConfig);
		config.componentsConfig.tree = [];
		var callbackFunc = {
			selectHandler:function(){
				var tableId = componentConfig.container;
				var selectData = getSelectedData(tableId);
				return selectData;
			},
			selectedComplateHandler:(function(){
				return function(_ajaxData){
					//选中之后调用ajax的完成回调事件
					//_ajaxData object 
					// _ ajaxData originalRowsData
					//_ajaxData rowData
					//gridId
					var configs = NetStarGrid.configs[componentConfig.container];
					var rows = configs.vueObj.rows;
					var idField = configs.gridConfig.data.idField;
					var existIndex = -1;
					for(var i=0; i<rows.length; i++){
						if(rows[i][idField] == _ajaxData.originalRowData[0][idField]){
							existIndex = i;
							break;
						}
					}
					if(existIndex > -1){
						//开启禁用状态 取消选中状态
						rows[i]['NETSTAR-TRDISABLE'] = true;
						rows[i].netstarSelectedFlag = false;
						rows[i].netstarCheckboxSelectedFlag = false;
						if(i<rows.length-1){
							//设置下一条选中
							rows[i+1].netstarSelectedFlag = true;
						}
					}
				}
			})(componentConfig),
			hiddenHandler:hiddenHandler,
			documentEnterHandler:documentEnterHandler,
			listConfig:componentsConfig.list[0],
		};
		if(componentBtnConfig[config.id].add){
			callbackFunc.addHandler = function(_func){
				//sjj 20190521 添加支持一个返回参，返回参是一个方法
				$(document).off('keyup',documentKeyupHandler);
				var tableId = componentConfig.container;
				getAjaxToPage({gridId:tableId,templateId:config.id,data:{gridId:tableId,templateId:config.id},type:'add'});
				//console.log('add');
			}
		}
		if(componentBtnConfig[config.id].edit){
			callbackFunc.queryHandler = function(){
				$(document).off('keyup',documentKeyupHandler);
				var tableId = componentConfig.container;
				var selectedData = getSelectedData(tableId);
				componentBtnConfig[config.id].query = componentBtnConfig[config.id].edit;
				componentBtnConfig[config.id].query.editorType = 'query';
				getAjaxToPage({gridId:tableId,templateId:config.id,data:{gridId:tableId,templateId:config.id,rowData:selectedData},type:'query',templateId:config.id});
				//console.log('query')
			}
		}
		return callbackFunc;
	}
	function resetData(templateId){
		/*
			*templateId  string  模板id
		*/
		var templatesConfig = NetstarTemplate.templates.businessDataBase.data[templateId].original;
	}
	function getCurrentData(_gridId){
		var gridConfig = config.componentsConfig.list[0];
		if(_gridId){
			var templateId = _gridId.substring(0,_gridId.lastIndexOf('-list'));
			if(_gridId.indexOf('-block')>-1){
				templateId = _gridId.substring(0,_gridId.lastIndexOf('-block'));
			}
			config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
			gridConfig = config.componentsConfig.list[0];
			//判断是否存在参数
			if(!$.isEmptyObject(config.pageParam)){
				nsVals.extendJSON(paramsData,config.pageParam);
			}
			if(!$.isEmptyObject(config.sourceVoParams)){
				paramsData.sourceVoParams = config.sourceVoParams;
			}
		}
		var gridData = getSelectedData(gridConfig.id);
		return gridData;
	}
	function refreshByConfig(_config){
		config = _config;
		setDefault();
		componentsConfig = config.componentsConfig;
		NetStarGrid.refreshById(config.componentsConfig.list[0].id);
		//initPanel(false);
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
		var config = NetstarTemplate.templates.businessDataBase.data[data.templateId].config;
		componentsConfig = config.componentsConfig;
		var gridId = config.componentsConfig.list[0].id;
		if(outerConfig.isKeepSelected){
			var idsArray = getIdsBySelectedData(gridId);
			NetStarGrid.configs[gridId].gridConfig.ui.selectIds = idsArray;
			NetStarGrid.refreshById(gridId);
		}else{
			refreshTableData(gridId);
		}
	}
	return {
		init:								init,							//模板初始化调用
		componentInit:						componentInit,					//调用某个组件初始化
		dialogBeforeHandler:				dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:					ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:					ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:					loadPageHandler,				//弹框初始化加载方法
		closePageHandler:					closePageHandler,				//弹框关闭方法
		showPageData:						showPageData,					//获取弹出界面参数
		closeHandler:						closeHandler,					//关闭弹框回调方法
		refreshData:						refreshTableData,//刷新
		getCurrentData:						getCurrentData,					//获取当前值
		refreshByConfig:				refreshByConfig,
		refreshByPackage:				refreshByPackage,
		VERSION:							'0.5.1',						//版本号
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
					
				},
			};
			NetstarComponent.dialogComponent.init(dialogConfig);
		},
		businessEditConfigClick:function(_sourceParams){
			var sourceAjaxConfig = _sourceParams.businessEditConfig.source;
			var ajaxConfig = {
				url:sourceAjaxConfig.url,
				type:sourceAjaxConfig.type,
				data:sourceAjaxConfig.data,
				dataType:'text',
				plusData:{
					sourceParam:_sourceParams,
				},
				contentType:sourceAjaxConfig.contentType,
			};
			NetStarUtils.ajaxForText(ajaxConfig, function(data, _ajaxConfig){
				var _configStrObj = _ajaxConfig.plusData.sourceParam;
				var _configStr = JSON.stringify(_configStrObj);
				var funcStr = 'NetstarTemplate.templates.businessDataBase.showPageByBusinessEditConfig(pageConfig,'+_configStr+')';
				var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
				var $container = nsPublic.getAppendContainer();
				var $containerPage = $(containerPage);
				$container.append($containerPage);
      });
		},//业务组件点击事件 在按钮上点击
	}
})(jQuery)
/******************** 表单表格模板 end ***********************/