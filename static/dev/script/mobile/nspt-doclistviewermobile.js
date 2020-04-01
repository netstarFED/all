/*
	*手机端流程管理界面
	* @Author: netstar.sjj
	* @Date: 2019-07-02 11:20:00
	* 左侧树 右侧表格  树可以不配置
	*根据左侧树刷新右侧表格数据
	*当前模板是树表格 还是表格 配置参数 config.templateType:treeBlocklist/blockList
	*此模板作为查询模板使用
	*config.pageParam 界面来源参作为查询条件的一个固定入参
	*config.queryConfig.ajax 查询ajax的配置参数
	*config.queryConfig.field 查询条件
	*config.isInlineBtn 是否行内按钮 默认false
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.docListViewerMobile = (function(){
	var pageN = 0;
	function scrollHandler(ev){
		ev.preventDefault();
		var isContinue = true;
		if($('.mobilewindow-halfscreen').length == 1){
			if(!$('.mobilewindow-halfscreen').hasClass('hide')){
				isContinue = false;
			}
		}
		if(isContinue){
			var range = 0; //距下边界长度/单位px
			var totalheight = 0;
			var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
			// nsalert(srollPos+"");
			totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
			if (($("div[ns-panel='blockList']>.nsgrid.nsgrid-block").height() - range) <= totalheight) {
				//ajax请求
				if($('container').children('div.doclistviewermobile').length == 1){
					var packageName = $('container').children('div.doclistviewermobile').attr('ns-package');
					var templateConfig = NetstarTemplate.templates.configs[packageName];
					var gridConfig = NetstarBlockListM.configs[templateConfig.mainConfig.id].gridConfig;
					var pageLength = gridConfig.ui.pageLengthDefault !=undefined ? gridConfig.ui.pageLengthDefault : "6";

					// var pageLength = "200";
				
					pageN++; ///页码0  页码1  页码2  页码3 页码4 页码5
					var startPage = pageN * pageLength;
					var blockTableId = templateConfig.mainConfig.id;
					if(gridConfig.data.isServerMode == false){
						var html = '<div class="list-no-data no-data"></div>';
                        $('#' + blockTableId).children('.list-no-data').remove();
                        $('#' + blockTableId).append(html);
                        return false
					}
					var recordsTotal = Number(gridConfig.domParams.serverData.total);
					if(recordsTotal < startPage){
                        var html = '<div class="list-no-data no-data"></div>';
                        $('#' + blockTableId).children('.list-no-data').remove();
                        $('#' + blockTableId).append(html);
                        return false;
					}
					var gridConfig = NetstarBlockListM.configs[blockTableId].gridConfig;
					var ajaxConfig = $.extend(true,{},templateConfig.mainConfig.ajax);
					ajaxConfig.data = gridConfig.data.data;
					ajaxConfig.data.start = startPage;
					NetStarUtils.ajax(ajaxConfig,function(res,ajaxPlusOptions){
						if(res.success){
							var resData = res[ajaxPlusOptions.dataSrc];
							//console.log(resData)
							if(!$.isArray(resData)){
								resData = [];
							}
							NetstarBlockListM.dataManager.addRow(resData,blockTableId);
						}
					},true);
				}
			}
		}
	}
	function dialogBeforeHandler(data){
		var templateId = $('container').children('.doclistviewermobile').attr('id');
		var config = NetstarTemplate.templates.docListViewerMobile.data[templateId].config;
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
		var templateId = $('container').children('.doclistviewermobile').attr('id');
		var config = NetstarTemplate.templates.docListViewerMobile.data[templateId].config;
		var blockTableId = config.mainConfig.id;
		var gridConfig = NetstarBlockListM.configs[blockTableId].gridConfig;
		var ajaxData = gridConfig.data.data;
		// refreshListData(config.mainConfig.id,config.pageParam);
		refreshListData(config.mainConfig.id, ajaxData);
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
	//处理ajax的入参通过ajax的data参数
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
					}
				}
			}
			if(isUseObject){
				outputParams = sourceParam;
			}else{
				outputParams = NetStarUtils.getFormatParameterJSON(ajaxData,sourceParam);
			}
		}else{
			outputParams = NetStarUtils.getFormatParameterJSON(ajaxData,sourceParam);
		}
		return outputParams;
	}
	function refreshListData(gridId,data){
		NetstarBlockListM.refreshById(gridId,data);
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
				returnData = getSelectedData(config.mainConfig.id);
			}
		}
		return returnData;
	}
	
	function init(_config){
		/******************************验证定义的参数是否合法 start */
		if(debugerMode){
			//验证
			function validateByConfig(config){
				var isValid = true;
				var validArr = 
				[
					['template','string',true],
					['title','string'],
					['components','array',true]
				];
				isValid = nsDebuger.validOptions(validArr,config);//验证当前模板的配置参数
				return isValid;
			}
			if(!validateByConfig(_config)){
				nsalert('配置文件验证失败', 'error');
				console.error('配置文件验证失败');
				console.error(_config);
				return false;
			}
		}
		/******************************验证定义的参数是否合法 end */
		/******************************根据当前模板的id存储当前配置的定义参数 start */
		if(typeof(NetstarTemplate.templates.docListViewerMobile.data)=='undefined'){
			NetstarTemplate.templates.docListViewerMobile.data = {};  
		}
		function setDefault(){
			var defaultConfig = {
				idFieldsNames:{},
				componentsConfig:{
					tree:{},
					vo:{},
					blockList:{},
					btns:{},
					list:{},
				},
				queryConfig:{
					field:[],
					ajax:{}
				},
				mainConfig:{},
				pageParam:{},
				templateType:'',
				serverData:{},
				btnOptions:{
					source:'form',
					dialogBeforeHandler:dialogBeforeHandler,
					ajaxBeforeHandler:ajaxBeforeHandler,
					ajaxAfterHandler:ajaxAfterHandler,
					loadPageHandler:loadPageHandler,
					closePageHandler:closePageHandler,
				},
				isInlineBtn:false,
				sourcePageConfig:{}
			};
			NetStarUtils.setDefaultValues(config, defaultConfig);
			if(config.pageParam.prevPageUrl){
				//界面来源参里的值只作为ajax入参发送 如果里面定义了其他属性值需要从config.pageParam中移除
				config.prevPageUrl = config.pageParam.prevPageUrl;
				delete config.pageParam.prevPageUrl;
			}
			if(typeof(config.pageParam.readonly)=='boolean'){
				config.readonly = config.pageParam.readonly;
				delete config.pageParam.readonly;
			}
			if(typeof(config.pageParam.sourcePageConfig)=='object'){
				config.sourcePageConfig = config.pageParam.sourcePageConfig;
				delete config.pageParam.sourcePageConfig;
			}
			if(typeof(config.pageParam.data)=='object'){
				config.pageParam = config.pageParam.data;
				config.prevPageUrl = config.pageParam.url;
			}
		}
		function initContainer(){
			var templateType = 'blockList';
			var html = '';
			var ajaxConfig = {};
			var blockListId = '';
			/*******先判断按钮是否需要显示到行内 start */
			var isInlineBtns = false;
			for(var i=0; i<config.components.length; i++){
				var componentData = config.components[i];
				var isContinue = true;
				switch(componentData.type){
					case 'btns':
						for(var fieldI=0; fieldI<componentData.field.length; fieldI++){
							var functionConfig = componentData.field[fieldI].functionConfig ? componentData.field[fieldI].functionConfig : {};
							var isInlineBtn = typeof(functionConfig.isMobileInlineBtn)=='boolean' ? functionConfig.isMobileInlineBtn : false;
							if(isInlineBtn){
								isContinue = false;
								break;
							}
						}
						break;
				}
				if(!isContinue){
					isInlineBtns =true;
					break;
				}
			}
			/*******先判断按钮是否需要显示到行内 end */
			config.isInlineBtn = isInlineBtns;
			for(var componentI=0; componentI<config.components.length; componentI++){
				var componentData = config.components[componentI];
				componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
				var panelClassStr = '';
				var classStr = componentData.plusClass ? componentData.plusClass : '';
				switch(componentData.type){
					case 'tree':
						panelClassStr += 'col-xs-4 col-sm-4';
						templateType = 'treeBlocklist';
						break;
					case 'blockList':
						panelClassStr += 'col-xs-8 col-sm-8';
						ajaxConfig = componentData.ajax;
						blockListId = componentData.id;
						componentData.isAjax = typeof(componentData.isAjax)=='boolean' ? componentData.isAjax : true;
						if(typeof(componentData.params.isAjax)=='boolean'){
							componentData.isAjax = componentData.params.isAjax;
						}
						break;
					case 'btns':
						panelClassStr += 'col-xs-12 col-sm-12';
						if(classStr){
							classStr += ' nav-form';
						}else{
							classStr = 'nav-form';
						}
						break;
				}
				config.componentsConfig[componentData.type][componentData.id] = componentData;
				html += '<div class="nspanel-container nspanel '+panelClassStr+'" ns-panel="'+componentData.type+'">'
							+'<div id="'+componentData.id+'" class="'+classStr+'" component-type="'+componentData.type+'"></div>'
						+'</div>';
			}
			if(templateType == 'blockList'){
				var listDom = $(html);
				listDom[0].className = 'nspanel-container nspanel col-xs-12 col-sm-12 notree';
				var html = '';
				for(var domI=0; domI<$(listDom).length; domI++){
					html += $(listDom)[domI].outerHTML;
				}
			}else{
				//如果当前模板是treeBLocklist 则表明此列表数据是根据节点树作为查询条件
				config.queryConfig.ajax = ajaxConfig;
			}
			config.mainConfig = config.componentsConfig.blockList[blockListId];
			config.templateType = templateType;
			var containerHtml = '<div class="row layout-planes doclistviewermobile" id="'+config.id+'" ns-package="'+config.package+'">'+html+'</div>';
			if($('#'+config.id).length>0){
				$('#'+config.id).remove();
			}
			nsTemplate.appendHtml(containerHtml);//输出容器
		}
		function blockListComponentInit(listJson){
			function blockListCompleteHandler(_grid){
				var queryConfig = _grid.gridConfig.ui.query;
				if(!$.isEmptyObject(queryConfig)){
					if(queryConfig.queryForm){
						var html = '<div class="mobile-crm-search-form" id="'+queryConfig.id+'" templateid="'+_grid.gridConfig.templateId+'"></div>';
						if($('.mobile-crm-search-form').length > 0){
							$('.mobile-crm-search-form').remove();
						}
						$(_grid.gridConfig.el).closest('.doclistviewermobile').before(html);
						for(var fieldI=0; fieldI<queryConfig.queryForm.length; fieldI++){
							queryConfig.queryForm[fieldI].commonChangeHandler = function(obj){
								var templateId = $('#'+obj.config.formID).attr('templateid');
								var config = NetstarTemplate.templates.docListViewerMobile.data[templateId].config;
								var formJson = nsForm.getFormJSON(obj.config.formID,false);
								for(var data in formJson){
									if(typeof(formJson[data])=='string'){
										if(formJson[data]==''){
											delete formJson[data];
										}
									}
								}
								NetStarUtils.setDefaultValues(formJson,config.pageParam);
								if($('#input-'+config.mainConfig.id).length == 1){
									if($('#input-'+config.mainConfig.id).val()){
										formJson.keyword = $('#input-'+config.mainConfig.id).val();
									}else{
										delete formJson.keyword;
									}
								}else{
									delete formJson.keyword;
								}
								if(config.mainConfig.isAjax){
									var data = $.extend(true, {}, config.mainConfig.ajax.data);
									data = $.extend(false, data, formJson);
									NetstarBlockListM.refreshById(config.mainConfig.id,data);
								}else{
									refreshListDataByAjax(config,formJson);
								}
							}
						}
						var formJson = {
							id:queryConfig.id,
							form:queryConfig.queryForm,
							formSource:'halfScreen'
						};
						nsForm.init(formJson);
					}
				}else{
					if($('#'+_grid.gridConfig.templateId).prev().hasClass('mobile-input-search')){

					}else{
						$('#'+_grid.gridConfig.id).parent().addClass('no-query');
					}
				}
			}
			for(var listId in listJson){
				var listConfig = listJson[listId];
				var gridConfig = {
					id:listId,
					type:listConfig.type,
					idField:listConfig.idField,
					templateId:config.id,
					package:config.package,
					isReadStore:false,
					isAjax:listConfig.isAjax,
					data:{
						isSearch:true,
						isPage:true,
						primaryID:listConfig.idField,
						idField:listConfig.idField,
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
						completeHandler:blockListCompleteHandler,
						isInlineBtn:config.isInlineBtn,
						isUseMessageState:true,
						moreBtnHandler:function(data,_grid){
							var templateId = _grid.gridConfig.templateId;
							
							var config = NetstarTemplate.templates.docListViewerMobile.data[templateId].config;
							config.gridRowData = $.extend(true,{},data);
							
							//通过按钮中转的变量 cy 20200330
							NetstarTemplate.templates.configs[config.package].gridRowData = $.extend(true,{},data);

							var id = 'nav-moblieButtons-' + templateId;
							var navHtml = '<div class="nav-form mobile-menu-buttons" nspanel="moblieButtons" id="'+id+'" ns-operator="inlinebtn"></div>';
							$('#' + id).remove();
							$('body').append(navHtml);
							var $container = $('#' + id);
							$container.off('click');
							$container.on('click', function (ev) {
								$(this).remove();
							});
							var inlineBtnConfigs = config.inlineBtnConfigs;
							var inlineBtnArray = config.inlineBtnArray;
							for(var i=0; i<inlineBtnConfigs.length; i++){
								var inlineBtnConfig = inlineBtnConfigs[i];
								var functionConfig = inlineBtnConfig.functionConfig;
								if(typeof(functionConfig) == "object" && typeof(functionConfig.text) == "string"){
									if(functionConfig.text.indexOf('{') == 0){
										var textObj = JSON.parse(functionConfig.text);
										var followStateField = textObj.field;
										var formatHandlerData = textObj.formatHandler.data;
										var followStateVal = data[followStateField];
										var btnConfig = formatHandlerData[followStateVal];
										if(btnConfig){
											inlineBtnArray[i].text = btnConfig.text;
											inlineBtnArray[i].index.iconCls = btnConfig.icon;
										}
									}

								}
							}
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
							var templateConfig = NetstarTemplate.templates.docListViewerMobile.data[_gridConfig.templateId].config;
							templateConfig.gridRowData = data;
							if(!$.isEmptyObject(templateConfig.btnByClick)){
								var btnConfig = templateConfig.btnByClick;
								btnConfig.btn.handler(btnConfig.btnIndex);
							}
						},
						rowdbClickHandler:function(data,$data,_vueData,_gridConfig){
							var templateConfig = NetstarTemplate.templates.docListViewerMobile.data[_gridConfig.templateId].config;
							templateConfig.gridRowData = data;
							if(!$.isEmptyObject(templateConfig.btnByDbclick)){
								var btnConfig = templateConfig.btnByDbclick;
								btnConfig.btn.handler(btnConfig.btnIndex);
							}
						},
						rowLongtapHandler:function(data,$data,_vueData,_gridConfig){
							var templateConfig = NetstarTemplate.templates.docListViewerMobile.data[_gridConfig.templateId].config;
							templateConfig.gridRowData = data;
							if(!$.isEmptyObject(templateConfig.btnByLongtap)){
								var btnConfig = templateConfig.btnByLongtap;
								btnConfig.btn.handler(btnConfig.btnIndex);
							}
						}
					}
				};
				if(!$.isEmptyObject(listConfig.params)){
					$.each(listConfig.params,function(k,v){
						if(k == 'isServerMode'){
							gridConfig.data[k] = v;
						}else{
							gridConfig.ui[k] = v;
						}
					})
				}
				NetstarTemplate.quickQueryByMobileTemplate(listConfig,config);
				function setGridQueryPanelData(){
					var queryFormFieldArray = [];
					for(var columnI=0; columnI<gridConfig.columns.length; columnI++){
						var colData = gridConfig.columns[columnI];//当前列配置项
						//如果当前列配置项开启了搜索配置
						var searchable = typeof (colData.searchable) == 'boolean' ? colData.searchable : false;
						if (searchable){
							var editConfig = $.extend(true, {}, colData.editConfig);//自定义列配置项
							var titleStr = colData.title ? colData.title : colData.field;
							switch (editConfig.type) {
								case 'select':
									editConfig.type = 'radio';
									break;
								case 'date':
									editConfig.type = 'dateRangePicker';
								default:
									//editConfig.type = 'text';
									break;
							}
							switch(editConfig.type){
								case 'radio':
								case 'checkbox':
								case 'dateRangePicker':
									queryFormFieldArray.push({
										id:colData.field,
										label:colData.title,
										type:editConfig.type,
										subdata:editConfig.subdata,
										textField:editConfig.textField,
										valueField:editConfig.valueField,
										url:editConfig.url,
										method:editConfig.method,
										dataSrc:editConfig.dataSrc,
									});
									break;
							}
						}
					}
					var gridQueryPanelConfig = {};
					if(queryFormFieldArray.length > 0){
						gridQueryPanelConfig = {
							id:'query-'+listId,
							type: 'select',
							queryForm: queryFormFieldArray,
						};
					}
					gridConfig.ui.query = gridQueryPanelConfig;
				}
				setGridQueryPanelData();
				if(!$.isEmptyObject(gridConfig.ui.query)){
					//还有查询条件
					gridConfig.ui.height -=50;
				}
				
				if(gridConfig.data.isServerMode){
					gridConfig.ui.pageLengthDefault = Math.ceil(gridConfig.ui.height/135)+1;
					
				}else{
					// gridConfig.domParams.serverData.total = 
					// console.log(123)
				}
				if(config.templateType == 'blockList' && listConfig.isAjax){
					var gridAjax = listConfig.ajax;
					if(typeof(gridAjax)=="object"){
						if(typeof(gridAjax.contentType)=='undefined'){
							gridAjax.contentType = 'application/json; charset=utf-8';
						}
						nsVals.extendJSON(gridConfig.data,gridAjax);
						gridConfig.data.data = getAjaxInnerParamsByAjaxData(config.pageParam,gridAjax.data);
					}	
				}else{
					gridConfig.data.dataSource = [];
				}
				var vueObj = NetstarBlockListM.init(gridConfig);
			}
			if(config.mainConfig.isAjax == false){
				NetstarBlockListM.refreshDataById(config.mainConfig.id,[]);
				//refreshListDataByAjax(config);
			}else{
				$(document).on('scroll',scrollHandler);
			}
		}
		function treeComponentInit(treeJson){
			//树节点单击事件
			function treeNodeClickHandler(data){
				var package = data.config.package;
				var templateId = data.config.templateId;
				var templateConfig = NetstarTemplate.templates.businessDataBaseMobile.data[templateId].config;
				var ajaxConfig = $.extend(true,{},templateConfig.queryConfig.ajax);
				ajaxConfig.data = getAjaxInnerParamsByAjaxData(templateConfig.pageParam,ajaxConfig.data);
				var treeParams = data.treeNode;
				if(typeof(data.config.formatter)=='string'){
					treeParams = NetStarUtils.getFormatParameterJSON(JSON.parse(data.config.formatter),data.treeNode);
				}else if(typeof(data.config.formatter)=='object'){
					treeParams = NetStarUtils.getFormatParameterJSON(data.config.formatter,data.treeNode);
				}
				nsVals.extendJSON(ajaxConfig.data,treeParams);
				ajaxConfig.plusData = {
					gridId:templateConfig.mainConfig.id
				};
				NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
					if(res.success){
						refreshListData(res[ajaxOptions.dataSrc],ajaxOptions.plusData.gridId);
					}
				},true);
			}
			for(var treeId in treeJson){
				var treeConfig = treeJson[treeId];
				treeConfig.id = treeId;
				treeConfig.clickHandler = treeNodeClickHandler;
				treeConfig.templateId = config.id;
				treeConfig.templatePackage = config.package;
				NetstarTemplate.tree.init(treeConfig);
			}
		}
		function btnsComponentInit(btnsJson){
			for(var btnId in btnsJson){
				var btnConfig = btnsJson[btnId];
				var inlineBtnArray = [];//统计行内按钮
				var outBtnArray = [];//外部按钮

				var params = {};
				if(!$.isEmptyObject(btnConfig.params)){
					params = btnConfig.params;
				}
				var btnEnglishnameByDbClick = params.dbclick ? params.dbclick : '';//通过双击事件的定义获取名字
				var btnEnglishnameByClick = params.click ? params.click : '';//通过单击事件的定义获取名字
				var btnEnglishnameByLongtap = params.longtap ? params.longtap : '';//通过长按事件的定义获取名字

				var fieldArray = $.extend(true,[],btnConfig.field);

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

				nsTemplate.setBtnDataChargeHandler(outBtnArray,config.btnOptions,config);//给按钮绑定回调方法

				nsTemplate.setBtnDataChargeHandler(inlineBtnArray,config.btnOptions,config);//给按钮绑定回调方法

				var outBtnFieldArray = nsTemplate.getBtnArrayByBtns(outBtnArray);//得到外部按钮

				var inlineBtnFieldArray = nsTemplate.getBtnArrayByBtns(inlineBtnArray);//行内按钮
	
				if(inlineBtnArray.length == fieldArray.length){
					//当前按钮全部为行内按钮
					$('#'+btnId).parent().prev().addClass('no-outbtns');
					$('#'+btnId).parent().remove();
				}
				if(inlineBtnArray.length > 0){
					//行内按钮
					config.inlineBtnArray = inlineBtnFieldArray;
					config.inlineBtnConfigs = inlineBtnArray;
				}

				if(outBtnFieldArray.length > 0){
					nsNav.init({
						id:btnId,
						isShowTitle:false,
						btns:[outBtnFieldArray]
					});
				}
			}
		}
		function initPanelInit(){
			for(var componentType in config.componentsConfig){
				var componentConfig = config.componentsConfig[componentType];
				switch(componentType){
					case 'vo':
						break;
					case 'blockList':
						blockListComponentInit(componentConfig);
						break;
					case 'tree':
						treeComponentInit(componentConfig);
						break;
					case 'btns':
						btnsComponentInit(componentConfig);
						break;
				}
			}
		}
		$(document).off('scroll',scrollHandler);
		if(NetstarTemplate.templates.docListViewerMobile.data[_config.id]){
			var config = NetstarTemplate.templates.docListViewerMobile.data[_config.id].config;
			NetstarTemplate.templates.configs[config.package] = config;
			NetstarTemplate.quickQueryByMobileTemplate(config.mainConfig,config);
			var _grid = NetstarBlockListM.configs[config.mainConfig.id];
			var queryConfig = _grid.gridConfig.ui.query;
			if(!$.isEmptyObject(queryConfig)){
				if(queryConfig.queryForm){
					var html = '<div class="mobile-crm-search-form" id="'+queryConfig.id+'" templateid="'+_grid.gridConfig.templateId+'"></div>';
					if($('.mobile-crm-search-form').length > 0){
						$('.mobile-crm-search-form').remove();
					}
					$(_grid.gridConfig.el).closest('.doclistviewermobile').before(html);
					for(var fieldI=0; fieldI<queryConfig.queryForm.length; fieldI++){
						queryConfig.queryForm[fieldI].commonChangeHandler = function(obj){
							var templateId = $('#'+obj.config.formID).attr('templateid');
							var config = NetstarTemplate.templates.docListViewerMobile.data[templateId].config;
							var formJson = nsForm.getFormJSON(obj.config.formID,false);
							for(var data in formJson){
								if(typeof(formJson[data])=='string'){
									if(formJson[data]==''){
										delete formJson[data];
									}
								}
							}
							NetStarUtils.setDefaultValues(formJson,config.pageParam);
							if($('#input-'+config.mainConfig.id).length == 1){
								if($('#input-'+config.mainConfig.id).val()){
									formJson.keyword = $('#input-'+config.mainConfig.id).val();
								}else{
									delete formJson.keyword;
								}
							}else{
								delete formJson.keyword;
							}
							if(config.mainConfig.isAjax){
								NetstarBlockListM.refreshById(config.mainConfig.id,formJson);
							}else{
								refreshListDataByAjax(config,formJson);
							}
						}
					}
					var formJson = {
						id:queryConfig.id,
						form:queryConfig.queryForm,
						formSource:'halfScreen'
					};
					nsForm.init(formJson);
				}
			}else{
				if($('#'+_grid.gridConfig.templateId).prev().hasClass('mobile-input-search')){

				}else{
					$('#'+_grid.gridConfig.id).parent().addClass('no-query');
				}
			}
			for(var componentType in config.componentsConfig){
				var componentConfig = config.componentsConfig[componentType];
				switch(componentType){
					case 'vo':
						break;
					case 'blockList':
						// blockListComponentInit(componentConfig, config);
						if(config.mainConfig.isAjax == false){
						}else{
							$(document).on('scroll',scrollHandler);
						}
						break;
					case 'tree':
						break;
					case 'btns':
						btnsComponentInit(componentConfig, config);
						break;
				}
			}
			//找到当前行数据进行修改操作
			// var ajaxConfig = config.mainConfig.ajax;
			// if($.isEmptyObject(ajaxConfig.data)){
			// 	ajaxConfig.data = config.pageParam;
			// }
			var blockTableId = config.mainConfig.id;
			var gridConfig = NetstarBlockListM.configs[blockTableId].gridConfig;
			var ajaxConfig = $.extend(true,{},config.mainConfig.ajax);
			ajaxConfig.data = gridConfig.data.data;
			ajaxConfig.plusData = {
				idField:config.mainConfig.idField,
				gridRowData:config.gridRowData,
				gridId:config.mainConfig.id
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
				if(currentGriddata){
					for(var rowI=0; rowI<rowsArray.length; rowI++){
						var rowData = rowsArray[rowI];
						if(rowData[_idField] == currentGriddata[_idField]){
							editRowIndex = rowI;
							break;
						}
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
					if(currentGriddata){
						for(var i=0; i<originalRowsArr.length; i++){
							var originalData = originalRowsArr[i];
							if(originalData[_idField] == currentGriddata[_idField]){
								originalIndex = rowI;
								break;
							}
						}
					}
					if(originalIndex > -1){
						NetstarBlockListM.dataManager.delRow(originalRowsArr[originalIndex],gridId);
					}
				}
			},true)
		}else{
			var originalConfig = $.extend(true,{},_config);//保存原始值
			var config = _config;
			//记录config
			NetstarTemplate.templates.docListViewerMobile.data[_config.id] = {
				original:originalConfig,
				config:config
			};
			/******************************根据当前模板的id存储当前配置的定义参数 end */
			setDefault();//设置默认值
			initContainer();//初始化容器输出
			initPanelInit();
		}
	}
	function refreshListDataByAjax(config,innerParams){
		var ajaxConfig = $.extend(true,{},config.mainConfig.ajax);
		if(typeof(ajaxConfig.contentType)=='undefined'){
			ajaxConfig.contentType = 'application/json; charset=utf-8';
		}
		if(!$.isEmptyObject(innerParams)){
			ajaxConfig.data = innerParams;
		}else{
			ajaxConfig.data = getAjaxInnerParamsByAjaxData(config.pageParam,ajaxConfig.data);
		}
		ajaxConfig.plusData = {config:config};
		NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
			if(res.success){
				var dataSrc = ajaxOptions.dataSrc;
				var templateConfig = ajaxOptions.plusData.config;
				var resArr = [];
				if(dataSrc.indexOf('.')>-1){
					var formatData = NetStarUtils.getListDataByExp(res,dataSrc);
					var cSrc = dataSrc.substring(dataSrc.lastIndexOf('.')+1,dataSrc.length);
					if(formatData[cSrc]){
						resArr = formatData[cSrc];
					}
				}else{
					if($.isArray(res[dataSrc])){
						resArr = res[dataSrc];
					}
				}
				NetstarBlockListM.refreshDataById(templateConfig.mainConfig.id,resArr);
			}
		},true);
	}
	function componentInit(_config){
		var btnIndex = -1;
		for(var i=0; i<_config.components.length; i++){
			var componentData = config.components[i];
			var isContinue = true;
			switch(componentData.type){
				case 'btns':
					isContinue = false;
					break;
			}
			if(!isContinue){
				btnIndex = i;
				break;
			}
		}
		if(btnIndex > -1){
			//把当前组件的按钮移除，替换掉组件需要显示的按钮组
			_config.components.splice(btnIndex,1);
		}
		_config.components.push({
			type:'btns',
			field:[
				{
					btns:{
						text:'选中',
						handler:function(){

						}
					},
					functionConfig:{}
				}
			]
		});
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
		componentInit:							componentInit,					//组件初始化调用
		getPageData:							getPageData,					//获取当前模版值
		refreshListDataByAjax:					refreshListDataByAjax,
	}
})(jQuery)
/******************** 表格模板 end ***********************/