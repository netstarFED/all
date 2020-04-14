/*
	* @Author: netstar.sjj
	* @Date: 2019-09-29 11:45:00
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.statisticsList = (function(){
	/***************组件事件调用 start**************************** */
	function dialogBeforeHandler(data,templateId){
		data = typeof(data)=='object' ? data : {};
		var config = NetstarTemplate.templates.statisticsList.data[templateId].config;
		var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
		data.config = config;
		return data;
	}
	//ajax前置回调
	function ajaxBeforeHandler(handlerObj,templateId){
		//是否有选中值有则处理，无则返回
		var config = NetstarTemplate.templates.statisticsList.data[templateId].config;
		handlerObj.config = config;
		return handlerObj;
	}
	//ajax后置回调
	function ajaxAfterHandler(res,templateId){
		var config = NetstarTemplate.templates.statisticsList.data[templateId].config;	
	}
	//跳转打开界面回调
	function loadPageHandler(){}
	//关闭打开界面回调
	function closePageHandler(){}
	/***************组件事件调用 end************************** */
	function getDetailsData(innerParams,gridConfig){
		if($.isEmptyObject(innerParams)){
			return;
		}
		var ajaxConfig = $.extend(true,{},gridConfig.ajax);
		ajaxConfig.plusData = {
			gridConfig:gridConfig
		};
		if(!$.isEmptyObject(ajaxConfig.data)){
			ajaxConfig.data = NetStarUtils.getFormatParameterJSON(gridConfig.ajax.data,innerParams);
		}else{
			ajaxConfig.data = innerParams;
		}
		NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
			//获取ajax返回结果
			if(res.success){
				//调用ajax成功
				var resData = res[ajaxOptions.dataSrc];
				var gridArray = [];
				if($.isArray(resData)){
					gridArray = resData;
				}else{
					gridArray = resData[ajaxOptions.plusData.gridConfig.keyField];
				}
				if(!$.isArray(gridArray)){gridArray = [];}
				NetStarGrid.refreshDataById(ajaxOptions.plusData.gridConfig.id,gridArray);
			}else{
				NetStarGrid.refreshDataById(ajaxOptions.plusData.gridConfig.id,[]);
			}
		},true)
	}
	function ajaxSuccessHandlerByBlocklist(resData,_config){
		if($.isArray(resData)){
			var selectIndex = -1;
			for(var rowI=0; rowI<resData.length; rowI++){
				if(resData[rowI].netstarSelectedFlag){
					selectIndex = rowI;
					break;
				}
			}
			if(selectIndex > -1){
				getDetailsData(resData[selectIndex],_config.listGridConfig);
			}
		}
	}

	function getListGridAjaxByTreeBlock(innerParams,_config){
		if($.isEmptyObject(innerParams)){
			return;
		}
		for(var gid in config.componentsConfig.list){
			var listConfig = config.componentsConfig.list[gid];
			getDetailsData(innerParams,listConfig);
		}
	}
	
	function ajaxSuccessHandlerByTreeBlocklist(resData,_config){
		if($.isArray(resData)){
			var selectIndex = -1;
			for(var rowI=0; rowI<resData.length; rowI++){
				if(resData[rowI].netstarSelectedFlag){
					selectIndex = rowI;
					break;
				}
			}
			if(selectIndex > -1){
				getListGridAjaxByTreeBlock(resData[selectIndex],_config);
			}
		}
	}

	function drawHandlerByTreeListGrid(_vueData){
		var gridId = _vueData.$options.id;
		var grid = NetStarGrid.configs[gridId];
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
				if($.isEmptyObject(data)){
					return;
				}
				for(var gid in config.componentsConfig.list){
					var listConfig = config.componentsConfig.list[gid];
					if(listConfig.keyField != 'root'){
						getDetailsData(data,listConfig);
					}
				}
			}else{
				for(var gid in config.componentsConfig.list){
					var listConfig = config.componentsConfig.list[gid];
					if(listConfig.keyField !='root'){
						NetStarGrid.refreshDataById(listConfig.id,[]);
					}
				}
			}
		}
	}

	function drawHandlerByTreeBlocklist(_vueData){
		var gridId = _vueData.$options.id;
		var grid = NetstarBlockList.configs[gridId];
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
				getListGridAjaxByTreeBlock(data,config);
			}else{
				for(var gid in config.componentsConfig.list){
					var listConfig = config.componentsConfig.list[gid];
					NetStarGrid.refreshDataById(listConfig.id,[]);
				}
			}
		}
	}

	function drawHandlerByBlocklist(_vueData){
		var gridId = _vueData.$options.id;
		var grid = NetstarBlockList.configs[gridId];
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
				getDetailsData(data,config.listGridConfig);
			}else{
				var listConfig = config.listGridConfig;
				NetStarGrid.refreshDataById(listConfig.id,[]);
			}
		}
	}

	function drawHandlerByListLevel2(_vueData){
		var gridId = _vueData.$options.id;
		var grid = NetStarGrid.configs[gridId];
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
				for(var gid in config.componentsConfig.list){
					var listConfig = config.componentsConfig.list[gid];
					if(listConfig.keyField != 'root'){
						getDetailsData(data,listConfig);
					}
				}
			}else{
				for(var gid in config.componentsConfig.list){
					var listConfig = config.componentsConfig.list[gid];
					if(listConfig.keyField !='root'){
						NetStarGrid.refreshDataById(listConfig.id,[]);
					}
				}
			}
		}
	}


	function selectedHandlerByBlocklist(data,$data,vueObj,gridConfig){
		var config = NetstarTemplate.templates.configs[gridConfig.package];
		getDetailsData(data,config.listGridConfig);
	}

	function completeHandlerByGrid(_configs){
		var gridConfig = _configs.gridConfig;
		var queryConfig = gridConfig.ui.query ? gridConfig.ui.query : {};
		var isDateRanger = typeof(queryConfig.isDateRanger) == 'boolean' ? queryConfig.isDateRanger : false;
		var isYear = typeof(queryConfig.isYear) == 'boolean' ? queryConfig.isYear : false;
		var echartsConfig = typeof(queryConfig.echarts)=='object' ? queryConfig.echarts : {};
		var queryId = 'query-'+gridConfig.id;
		var echartsId = 'echarts-'+gridConfig.id;
		var startYear = 1900;
		var endYear = moment().format('YYYY');
		if(!$.isEmptyObject(queryConfig.dateRanger)){
			isDateRanger = true;
		}
		if(!$.isEmptyObject(queryConfig.year)){
			isYear = true;
			if(queryConfig.startYear){
				startYear = queryConfig.startYear;
			}
			if(queryConfig.endYear){
				endYear = queryConfig.endYear;
			}
		}
		var queryFormConfig = {
			id:queryId,
			formStyle:'pt-form-normal',
			plusClass:'pt-custom-query',
			isSetMore:false,
			form:[],
			completeHandler:function(){
				/*var buttonHtml = '<div class="pt-btn-group">'
								+'<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" containerid="'+queryId+'"><i class="icon-search"></i></button>'
							+'</div>';
				var $container = $('#'+queryId);
				$container.append(buttonHtml);
				$('button[containerid="'+queryId+'"]').off('click',customFilterRefreshBtnHandler);
				$('button[containerid="'+queryId+'"]').on('click',customFilterRefreshBtnHandler);*/
			}
		};
		
		function commonChangeHandlerByYear(callBackData){
			var formID = callBackData.config.formID;
			var gridId = formID.substring(6,formID.length);
			var paramsJson = {
				year:callBackData.value
			};
			var configs = NetStarGrid.configs[gridId];
			var advanceQueryParams = configs.gridConfig.advanceQueryParams;

			if(!$.isEmptyObject(advanceQueryParams)){
				for(var advanceQ in advanceQueryParams){
					paramsJson[advanceQ] = advanceQueryParams[advanceQ];
				}
			}
			paramsJson = nsServerTools.deleteEmptyData(paramsJson);
			var templeteConfig = NetstarTemplate.templates.configs[configs.gridConfig.package];
			var componentGridConfig = templeteConfig.componentsConfig.list[gridId];
			if(componentGridConfig.isAjax){
				NetStarGrid.refreshById(gridId,paramsJson);
			}else{
				getDetailsData(paramsJson,componentGridConfig);
			}
		}
		function commonChangeHandlerByTimer(callBackData){
			var formID = callBackData.config.formID;
			var gridId = formID.substring(6,formID.length);
			var paramsJson = {
				startTime:callBackData.value.startTimeStart,
				endTime:callBackData.value.startTimeEnd
			};
			var configs = NetStarGrid.configs[gridId];
			var advanceQueryParams = configs.gridConfig.advanceQueryParams;
			if(!$.isEmptyObject(advanceQueryParams)){
				for(var advanceQ in advanceQueryParams){
					paramsJson[advanceQ] = advanceQueryParams[advanceQ];
				}
			}
			paramsJson = nsServerTools.deleteEmptyData(paramsJson);
			if(!$.isEmptyObject(configs.gridConfig.ui.paramsData)){
				$.each(configs.gridConfig.ui.paramsData,function(k,v){
					if(typeof(paramsJson[k])=='undefined'){
						paramsJson[k] = v;
					}
				});
			}
			var templeteConfig = NetstarTemplate.templates.configs[configs.gridConfig.package];
			var componentGridConfig = templeteConfig.componentsConfig.list[gridId];
			if(componentGridConfig.isAjax){
				NetStarGrid.refreshById(gridId,paramsJson);
			}else{
				getDetailsData(paramsJson,componentGridConfig);
			}
		}
		if(isDateRanger){
			queryFormConfig.form.push({
				"id": "startTime",
				"englishName": "startTime",
				//"chineseName": "开始时间",
				"variableType": "date",
				"mindjetType": "date",
				"isSet": "是",
				"displayType": "all",
				"gid": "340701d9-4a61-025c-a6ef-1e943f5932a0",
				"voName": "wbsWbsVO",
				"className": "java.util.Date",
				"type": "dateRangePicker",
				//"label": "开始时间",
				"isDefaultDate": false,
				"ranges": true,
				"disabled": false,
				"hidden": false,
				"isDistinct": false,
				isRelativeTime:true,
				placeholder:'按时间查询',
				format: "YYYY-MM-DD",
				languageType: "zh",
				isShowHistoryBtn: false,
				formDisabled: false,
				commonChangeHandler:commonChangeHandlerByTimer,
			});
		}
		if(isYear){
			var yearArr = [];
			for(var yearI=startYear; yearI<=endYear; yearI++){
				yearArr.push({
					name:yearI.toString(),
					id:yearI
				});
			}
			queryFormConfig.form.push({
				id: "year",
				//"format":"{this:YYYY}",
				"variableType": "number",
				placeholder:'按年份查询',
				type:"select",
				textField:"name",
				valueField:"id",
				subdata:yearArr,
				commonChangeHandler:commonChangeHandlerByYear,
			});
		}
		var echartsHtml = '';
		if(!$.isEmptyObject(echartsConfig)){
			echartsHtml = '<div class="pt-panel-col text-right" id="'+echartsId+'"></div>';
		}

		var advanceQueryConfig = NetStarUtils.getListQueryData(gridConfig.columns,{id:gridConfig.id,value:''});
		var advanceQueryHtml = '';
		var advanceQueryArr = advanceQueryConfig.advanceForm;
		if(!$.isArray(advanceQueryArr)){
			advanceQueryArr = [];
		}
		if(advanceQueryArr.length > 0){
			advanceQueryHtml = '<div class="pt-panel-col text-right" id="advance-'+advanceQueryConfig.id+'"></div>';
		}

		if(queryFormConfig.form.length > 0){
			var quickqueryHtml = '<div class="pt-panel pt-grid-header">'
									+'<div class="pt-container">'
										+'<div class="pt-panel-row">'
											+'<div class="pt-panel-col" id="'+queryId+'">'
											+'</div>'
											+echartsHtml
											+advanceQueryHtml
										+'</div>'
									+'</div>'
								+'</div>';
			$('#'+gridConfig.id).prepend(quickqueryHtml);
			NetstarComponent.formComponent.show(queryFormConfig,{});
		}else if(echartsHtml){
			var quickqueryHtml = '<div class="pt-panel pt-grid-header">'
									+'<div class="pt-container">'
										+'<div class="pt-panel-row">'
											+echartsHtml
											+advanceQueryHtml
										+'</div>'
									+'</div>'
								+'</div>';
			$('#'+gridConfig.id).prepend(quickqueryHtml);
		}
		if($('#'+echartsId).length > 0){
			var btnJson = {
				id:echartsId,
				pageId:'btn-'+echartsId,
				btns:[
					{
						text:echartsConfig.title,
						handler:function(callBackData){
							//console.log(callBackData)
							var $button = $(callBackData.event.currentTarget);
							var gridId = $button.closest('.component-list').attr('id');
							var functionConfig = callBackData.data.functionConfig;
							var echartType = functionConfig.echartType;//弹出的图表类型
							var configs = NetStarGrid.configs[gridId];
							var gridConfig = configs.gridConfig;
							var gridDataArr = NetStarGrid.dataManager.getData(gridId);

							var dialogConfig = {
								id: 'echarts-dialog-component',
								title: '图表查看',
								templateName: 'PC',
								height:450,
								width : 800,
								shownHandler : function(_shownData){
									var echartId = 'echart-'+_shownData.config.bodyId;
									var html = '<div class="echart-panel" id="' + echartId + '" style="width:100%;height:300px;"></div>';
									$('#'+_shownData.config.bodyId).html(html);
									var columnByIdJson = gridConfig.columnById;
									var options = {};
									switch(echartType){
										case 'pie':
											var seriesDataArr = [];
											for(var colField in columnByIdJson){
												seriesDataArr.push({
													value:0,
													name:columnByIdJson[colField].title
												});
											}
											options = {
												title : {
													// text: '',
													// subtext: '',
													// x:'center'
												 },
												 tooltip : {
													trigger: 'item',
													formatter: "{b} : {c} ({d}%)"
													//formatter: "{a} <br/>{b} : {c} ({d}%)"
												 },
												 series : [
													 {
														//name: '',
														type: 'pie',
														radius : '55%',
														center: ['50%', '60%'],
														data:seriesDataArr,
														itemStyle: {
															emphasis: {
																shadowBlur: 10,
																shadowOffsetX: 0,
																shadowColor: 'rgba(0, 0, 0, 0.5)'
															}
														}
													}
												]
											};
											break;
										case 'bar':
											var dimensionsArr = ['product','业务量','开票金额','未开票金额','已开票应收金额','回款率'];
											var sourceArr = [];
											for(var rowI=0; rowI<gridDataArr.length; rowI++){
												var rowData = gridDataArr[rowI];
												sourceArr.push({
													product:rowI,
													businessAmount:rowData.businessAmount,
													invoicedAmount:rowData.invoicedAmount,
													notInvoicedAmount:rowData.notInvoicedAmount,
													invoicedAprAmount:rowData.invoicedAprAmount,
													backRate:rowData.backRate,
												});
											} 
											options = {
												legend: {},
												tooltip: {},
												dataset: {
													dimensions: dimensionsArr,
													source: sourceArr
												},
												xAxis: {type: 'category'},
												yAxis: {},
												series: [
													{type: 'bar'},
													{type: 'bar'},
													{type: 'bar'},
													{type: 'bar'},
													{type: 'bar'}
												]
											};
											break;
										case 'line':
											break;
									}
									
									var chartDom = echarts.init($('#'+echartId)[0]);
									chartDom.clear();
									chartDom.setOption(options)

								},
								hiddenHandler:function(){}
							};
							NetstarComponent.dialogComponent.init(dialogConfig);
						},
						functionConfig:{
							echartType:echartsConfig.type,
						}
					},
				]
			};
			vueButtonComponent.init(btnJson);
		}

		if($('#'+advanceQueryConfig.id).length > 0){
			var advancedQueryId = 'advance-'+advanceQueryConfig.id;
			var advancedQueryConfig = {
				id: advancedQueryId,
				title: '高级查询',
				getAjaxData: {
					panelId: advancedQueryId,
				},
				saveAjaxData: {
					panelId: advancedQueryId,
				},
				delAjaxData: {},
				form: advanceQueryArr,
				queryHandler: function (formJson, _config) {
					var formId = advancedQueryId;
					store.set(formId, formJson);
					for (var i = 0; i < advanceQueryArr.length; i++) {
						var fieldId = advanceQueryArr[i].id;
						if (formJson[fieldId]) {
							if (advanceQueryArr[i].type == 'business' && typeof (advanceQueryArr[i].outputFields) == "undefined") {
								switch (advanceQueryArr[i].selectMode) {
									case 'single':
										formJson[value] = formJson[value][advanceQueryArr[i].idField];
										break;
									case 'checkbox':
										formJson[value] = formJson[value][0][advanceQueryArr[i].idField];
										break;
								}
							}
						}
					}
					formJson = nsServerTools.deleteEmptyData(formJson);
					gridConfig.advanceQueryParams = formJson;
				},
			}
			NetstarComponent.advancedQuery.init(advancedQueryConfig);
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
				if(!$.isArray(rowsData)){
					rowsData = [];
				}
				var _gridConfig = ajaxOptions.plusData.gridConfig;
				if(_gridConfig.type == 'blockList'){
					NetstarBlockList.refreshDataById(_gridConfig.id,rowsData);
				}else{
					NetstarTemplate.commonFunc.list.refresh(_gridConfig.id,rowsData);
				}
			}else{
				nsalert('返回值为false','error');
			}
		},true)
	}

	function treenodeClickHandlerByLevel2(treeData){
		/*
			*config 			容器id
			*treeId 			节点值
			*treeNode 			当前节点数据
		*/
		var treeContainerId = treeData.config.id;
		var templateId = treeContainerId.substring(0,treeContainerId.indexOf('-tree'));
		var config = NetstarTemplate.templates.statisticsList.data[templateId].config;
		//刷新右侧grid数据
		getListGridAjaxByTreeBlock(treeData.treeNode,config);
	}

	function treenodeClickHandler(treeData){
		/*
			*config 			容器id
			*treeId 			节点值
			*treeNode 			当前节点数据
		*/
		var treeContainerId = treeData.config.id;
		var templateId = treeContainerId.substring(0,treeContainerId.indexOf('-tree'));
		var config = NetstarTemplate.templates.statisticsList.data[templateId].config;
		//刷新右侧grid数据
		refreshGridDataByAjax(config.mainComponent,treeData.treeNode);
	}

	//组件初始化
	function initComponent(_config){
		var mode = _config.mode;
		var componentGridHeight = 0;
		switch(mode){
			case 'business':
			case 'blockListByBusiness':
				//单列表模板
				componentGridHeight = _config.templateCommonHeight;
				var componentsJson = _config.componentsConfig.list;
				if($.isEmptyObject(componentsJson)){
					componentsJson = _config.componentsConfig.blockList;
				}
				for(var gId in componentsJson){
					componentsJson[gId].params = typeof(componentsJson[gId].params)=='object' ? componentsJson[gId].params : {};
					var defaultParams = {
						height:componentGridHeight-60,
					};
					$.each(defaultParams,function(key,value){
						componentsJson[gId].params[key] = value;
					});
				}
				break;
			case 'blockListByLevel2':
				//左侧块状表格右侧list表格 父与子的关系
				var blockJson = _config.componentsConfig.blockList;
				var listJson = _config.componentsConfig.list;
				for(var bId in blockJson){
					blockJson[bId].params = typeof(blockJson[bId].params)=='object' ? blockJson[bId].params : {};
					var defaultParams = {
						height:_config.templateCommonHeight - 20,
						selectedHandler:selectedHandlerByBlocklist,
						ajaxSuccessHandler:(function(_config){
							return function(resData){
								ajaxSuccessHandlerByBlocklist(resData,_config);
							}
						})(_config),
						drawHandler:drawHandlerByBlocklist
					};
					$.each(defaultParams,function(key,value){
						blockJson[bId].params[key] = value;
					});
				}
				for(var gId in listJson){
					listJson[gId].params = typeof(listJson[gId].params)=='object' ? listJson[gId].params : {};
					var defaultParams = {
						height:_config.templateCommonHeight - 20,
						minPageLength: 10,
						pageLengthDefault:10,
						isPage:true,
					};
					$.each(defaultParams,function(key,value){
						listJson[gId].params[key] = value;
					});
				}
				break;
			case 'listByLevel2':
				//两个list显示 同级关系
				var componentsJson = _config.componentsConfig.list;
				for(var gId in componentsJson){
					componentsJson[gId].params = typeof(componentsJson[gId].params)=='object' ? componentsJson[gId].params : {};
					var defaultParams = {
						height:parseFloat(_config.templateCommonHeight/2),
						selectedHandler:function(){},
						ajaxSuccessHandler:function(){},
						drawHandler:function(){},
						minPageLength: 10,
						pageLengthDefault:10,
						isPage:true,
						completeHandler:completeHandlerByGrid
					};
					componentsJson[gId].isAjax = false;
					if(componentsJson[gId].keyField == 'root'){
						componentsJson[gId].isAjax = true;
						defaultParams.drawHandler = drawHandlerByListLevel2;
					}
					$.each(defaultParams,function(key,value){
						componentsJson[gId].params[key] = value;
					});
				}
				break;
			case 'listByBrothersLevel2':
				//两个list显示 同级关系
				var componentsJson = _config.componentsConfig.list;
				for(var gId in componentsJson){
					componentsJson[gId].params = typeof(componentsJson[gId].params)=='object' ? componentsJson[gId].params : {};
					var defaultParams = {
						height:parseFloat(_config.templateCommonHeight/2),
						selectedHandler:function(){},
						ajaxSuccessHandler:function(){},
						drawHandler:function(){},
						minPageLength: 10,
						pageLengthDefault:10,
						isPage:true,
						completeHandler:completeHandlerByGrid
					};
					$.each(defaultParams,function(key,value){
						componentsJson[gId].params[key] = value;
					});
				}
				break;
			case 'treeByGrid':
				//左侧树右侧块状表格+两个list表格 list是同级关系 blocklist是list的父级
				var componentsJson = _config.componentsConfig.tree;
				for(var tId in componentsJson){
					componentsJson[tId].isSearch = false;
					componentsJson[tId].height = _config.templateCommonHeight;
					componentsJson[tId].clickHandler = treenodeClickHandler;
				}
				var blockListJson = _config.componentsConfig.blockList;
				for(var bId in blockListJson){
					_config.mainComponent = blockListJson[bId];
					blockListJson[bId].params = typeof(blockListJson[bId].params)=='object' ? blockListJson[bId].params : {};
					blockListJson[bId].isAjax = false;
					var defaultParams = {
						height:80,
						ajaxSuccessHandler:(function(_config){
							return function(resData){
								ajaxSuccessHandlerByTreeBlocklist(resData,_config);
							}
						})(_config),
						drawHandler:drawHandlerByTreeBlocklist
					};
					$.each(defaultParams,function(key,value){
						blockListJson[bId].params[key] = value;
					});
				}
				var listGridJson = _config.componentsConfig.list;
				for(var gId in listGridJson){
					listGridJson[gId].params = typeof(listGridJson[gId].params)=='object' ? listGridJson[gId].params : {};
					listGridJson[gId].isAjax = false;
					var listGridHeight = parseFloat(_config.templateCommonHeight-80-70)/2;
					if(_config.listGridLength == 3){
						listGridHeight = parseFloat(_config.templateCommonHeight)/3;
					}
					var defaultParams = {
						height:listGridHeight,
						//selectedHandler:selectedHandlerByBlocklist,
						ajaxSuccessHandler:(function(_config){
							return function(resData){
								
							}
						})(_config),
						//drawHandler:
					};
					$.each(defaultParams,function(key,value){
						listGridJson[gId].params[key] = value;
					});
				}
				break;
			case 'treeByListLevel2Grid':
				//左侧树右侧两个list list是同级关系
				var componentsJson = _config.componentsConfig.tree;
				for(var tId in componentsJson){
					componentsJson[tId].isSearch = false;
					componentsJson[tId].height = _config.templateCommonHeight;
					componentsJson[tId].clickHandler = treenodeClickHandlerByLevel2;
				}
				var listGridJson = _config.componentsConfig.list;
				for(var gId in listGridJson){
					listGridJson[gId].params = typeof(listGridJson[gId].params)=='object' ? listGridJson[gId].params : {};
					listGridJson[gId].isAjax = false;
					var defaultParams = {
						height:parseFloat(_config.templateCommonHeight-38)/2,
						//selectedHandler:selectedHandlerByBlocklist,
						ajaxSuccessHandler:(function(_config){
							return function(resData){
								
							}
						})(_config),
						//drawHandler:
					};
					$.each(defaultParams,function(key,value){
						listGridJson[gId].params[key] = value;
					});
				}
				break;
			case 'treeByListGrid':
				//左侧树右侧三个list表格 有两个list是同级关系 还有一个是这两个list的父级
				var componentsJson = _config.componentsConfig.tree;
				for(var tId in componentsJson){
					componentsJson[tId].isSearch = false;
					componentsJson[tId].height = _config.templateCommonHeight;
					componentsJson[tId].clickHandler = treenodeClickHandler;
				}
				var listGridJson = _config.componentsConfig.list;
				for(var gId in listGridJson){
					listGridJson[gId].params = typeof(listGridJson[gId].params)=='object' ? listGridJson[gId].params : {};
					listGridJson[gId].isAjax = false;
					var listGridHeight = parseFloat(_config.templateCommonHeight-38)/3;
					var defaultParams = {
						height:listGridHeight,
						//selectedHandler:selectedHandlerByBlocklist,
						ajaxSuccessHandler:(function(_config){
							return function(resData){
								
							}
						})(_config),
						//drawHandler:
					};
					if(listGridJson[gId].keyField == 'root'){
						_config.mainComponent = listGridJson[gId];
						defaultParams.drawHandler = drawHandlerByTreeListGrid;
					}
					$.each(defaultParams,function(key,value){
						listGridJson[gId].params[key] = value;
					});
				}
				break;
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
				case 'tree':
					NetstarTemplate.commonFunc.tree.init(componentData,_config);
					break;
				case 'countList':
					NetstarTemplate.commonFunc.countList.init(componentData,_config);
					break;
			}
		}
	}
	//初始化容器通过弹出框的形式
	function initComponentHtmlByDialog(html,_config){
		var dialogJson = {
			id:'dialog-'+_config.id,
			title: _config.title,
			templateName:'PC',
			width:1100,
			height:'auto',
			shownHandler:function(data){
				var $body = $('#'+data.config.bodyId);
				$body.html(html);
				initComponent(_config);//调用组件初始化

				//给底部绑定按钮
				var btnJson = {
					id:data.config.footerId,
					pageId:_config.id,
					package:_config.package,
					btns:[
						{
							text:'关闭',
							handler:function(){
								$('#'+data.config.dialogContainerId).remove();
							}
						}
					]
				 };
				 vueButtonComponent.init(btnJson);
			}
		};
		NetstarComponent.dialogComponent.init(dialogJson);
	}
	//初始化容器面板
	function initContainer(_config){
		var $container = $('container').not('hidden');
		if($container.length > 0){
			$container = $container.eq($container.length-1);
		}
		var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
		}
		var titleHtml = '';
		var componentsHtml = '';
		if(_config.title && _config.mode !='dialog'){
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
		var mainBtnHtml = '';
		var btnKeyFieldJsonByRoot = _config.btnKeyFieldJson.root ? _config.btnKeyFieldJson.root : {}; 
		var blockListGridConfig = {};
		var listGridConfig = {};
		var treeConfig = {};
		var listGridLength = 0;
		for(var componentI=0; componentI<_config.components.length; componentI++){
			var componentData = _config.components[componentI];
			//list的高度按5行计算
			if(typeof(componentData.params)!='object'){
				componentData.params = {};
			}
			componentData.isAjax = true;//调用ajax
			componentData.params.height = 28*5;
			var componentType = componentData.type;
			if(componentData.params.displayMode == 'countList'){
				componentType = 'countList';
				componentData.package = _config.package;
			}
			_config.componentsConfig[componentType][componentData.id] = componentData;//根据类型和id存储组件信息
			var componentClassStr = '';
			switch(componentData.type){
				case 'blockList':
					if(componentData.plusClass){
						componentClassStr = componentData.plusClass;
					}
					blockListGridConfig = componentData;
					break;
				case 'list':
					listGridLength++;
					componentData.params.completeHandler = completeHandlerByGrid;
					listGridConfig = componentData;
					break;
				case 'tree':
					treeConfig = componentData;
					break;
			}
			var classStr = 'component-'+componentType.toLocaleLowerCase();
			if(componentType == 'countList'){
				componentsHtml += '<div class="pt-panel">'
									+'<div class="pt-container">'
										+'<div class="scroll-panel nspanel layout-customertable '+classStr+' '+componentClassStr+'" id="'+componentData.id+'">'
											// +'<table class="table table-hover table-striped table-singlerow table-bordered table-sm scroll-table" id="'+componentData.id+'"></table>'
										+'</div>'
									+'</div>'
								+'</div>';
			}else{
				if(componentData.id == btnKeyFieldJsonByRoot.id){
					mainBtnHtml += '<div class="pt-panel">'
										+'<div class="pt-container">'
											+'<div class="'+classStr+' '+componentClassStr+'" id="'+componentData.id+'"></div>'
										+'</div>'
									+'</div>';
				}else{

					componentsHtml += '<div class="pt-panel">'
										+'<div class="pt-container">'
											+'<div class="'+classStr+' '+componentClassStr+'" id="'+componentData.id+'"></div>'
										+'</div>'
									+'</div>';
				}
			}
		}
		_config.listGridLength = listGridLength;
		var html = '';
		var modeStr = '';
		if(_config.mode){
			modeStr = _config.mode.toLocaleLowerCase();
		}
		switch(_config.mode){
			case 'blockListByLevel2':
				_config.blockListGridConfig = blockListGridConfig;
				_config.listGridConfig = listGridConfig;
				html = '<div class="pt-main statisticsList '+templateClassStr+' '+modeStr+'" id="'+_config.id+'">'
							+'<div class="pt-container">'
								+titleHtml
								+'<div class="pt-main-row">'
									+'<div class="pt-main-col">'
										+'<div class="pt-panel">'
											+'<div class="pt-container">'
												+'<div class="component-blocklist" id="'+blockListGridConfig.id+'"></div>'
											+'</div>'
										+'</div>'
									+'</div>'
									+'<div class="pt-main-col">'
										+'<div class="pt-panel">'
											+'<div class="pt-container">'
												+'<div class="component-list" id="'+listGridConfig.id+'"></div>'
											+'</div>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
				break;
			case 'treeByGrid':
			case 'treeByListGrid':
			case 'treeByListLevel2Grid':
				_config.treeConfig = treeConfig;
				html = '<div class="pt-main statisticsList '+templateClassStr+' '+modeStr+'" id="'+_config.id+'">'
							+'<div class="pt-container">'
								+titleHtml
								+'<div class="pt-main-row">'
									+'<div class="pt-main-col">'
										+'<div class="pt-panel">'
											+'<div class="pt-container">'
												+'<div class="component-blocklist" id="'+treeConfig.id+'"></div>'
											+'</div>'
										+'</div>'
									+'</div>'
									+'<div class="pt-main-col">'
										+mainBtnHtml
										+componentsHtml
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
				break;
			default:
				html = '<div class="pt-main statisticsList '+templateClassStr+' '+modeStr+'" id="'+_config.id+'">'
							+'<div class="pt-container">'
								+titleHtml
								+'<div class="pt-main-row">'
									+'<div class="pt-main-col">'
										+mainBtnHtml
										+componentsHtml
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
				break;
		}
		if(_config.$container){
			//templateCommonHeight
			var containerHeight = _config.$container.closest('.pt-modal-tab').css('max-height');
			containerHeight = Number(containerHeight.substring(0,containerHeight.indexOf('px')));
			_config.templateCommonHeight = containerHeight;
			_config.$container.html(html);
			initComponent(_config);
			//添加按钮
			var containerId = _config.$container.attr('id');
			var footerBtnId = containerId.substring(0,containerId.indexOf('-body')) + '-footer-group';
			var btnJson = {
				id:footerBtnId,
				pageId:'dialog-'+_config.id,
				btns:[
					{
						text:'关闭',
						handler:function(){
							$('#multitab-dialog-url-nsdialog-container').remove();
						}
					}
				]
			};
			vueButtonComponent.init(btnJson);
		}else{
			switch(_config.mode){
				case 'dialog':
					initComponentHtmlByDialog(html,_config);
					break;
				default:
					$container.html(html);
					initComponent(_config);
					break;
			}
		}
	}
	//设置默认值
	function setDefault(_config){
		var defaultConfig = {
			levelConfig:{},//等级数据存放
			//mode:'dialog',  //dialog
			commonPanelHeight:$(window).outerHeight()-(NetstarTopValues.topNav.height),
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
		gridSelectedHandler:							function(){}
	}
})(jQuery)
/******************** 表格模板 end ***********************/