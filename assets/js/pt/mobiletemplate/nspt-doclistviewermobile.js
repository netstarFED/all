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
		refreshListData(config.mainConfig.id,config.pageParam);
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
		if($('.mobile-menu-buttons').attr('ns-operator') =='inlinebtn'){
			returnData = config.gridRowData;
		}else{	
			returnData = getSelectedData(config.mainConfig.id);
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
		var originalConfig = $.extend(true,{},_config);//保存原始值
		var config = _config;
		//记录config
		NetstarTemplate.templates.docListViewerMobile.data[_config.id] = {
			original:originalConfig,
			config:config
		};
		/******************************根据当前模板的id存储当前配置的定义参数 end */
		function setDefault(){
			var defaultConfig = {
				idFieldsNames:{},
				componentsConfig:{
					tree:{},
					vo:{},
					blockList:{},
					btns:{},
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
				if($.isEmptyObject(config.pageParam.data)){
					config.prevPageUrl = config.pageParam.url;
					delete config.pageParam.url;
					delete config.pageParam.data;
				}else{
					config.pageParam = config.pageParam.data;
					config.prevPageUrl = config.pageParam.url;
				}
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
								NetstarBlockListM.refreshById(config.mainConfig.id,formJson);
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
					$('#'+_grid.gridConfig.id).parent().addClass('no-query');
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
						selectMode:'none',
						displayMode:'block',
						height:$(window).outerHeight() - 54,
						isHeader:false,
						isCheckSelect:false,
						isThead:false,
						completeHandler:blockListCompleteHandler,
						isInlineBtn:config.isInlineBtn,
						isUseMessageState:false,
						moreBtnHandler:function(data,_grid){
							var templateId = _grid.gridConfig.templateId;
							var config = NetstarTemplate.templates.docListViewerMobile.data[templateId].config;
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
							//console.log(data)
						}
					}
				};
				if(config.pageParam.activeityId || config.pageParam.processId || config.pageParam.activityName){
					//如果当前界面存在流程id 或者存在活动id
					gridConfig.ui.isUseMessageState = true;
				}
				NetstarTemplate.quickQueryByMobileTemplate(listConfig);
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
				if(config.templateType == 'blockList'){
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

				var fieldArray = $.extend(true,[],btnConfig.field);

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
				}
				
				
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
				}
				for(var btnI=0; btnI<outBtnFieldArray.length; btnI++){
					outBtnFieldArray[btnI].btnCls = 'btn btn-info';
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
		setDefault();//设置默认值
		initContainer();//初始化容器输出
		initPanelInit();
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
	}
})(jQuery)
/******************** 表格模板 end ***********************/