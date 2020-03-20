/*
	*手机端流程管理界面
	* @Author: netstar.sjj
	* @Date: 2019-07-02 11:20:00
	* 数据关系 {id:'333',saleList:[{saleId:'33',price:33,customerList:[{customerId:'333'}]}]} 
	*此模板页是个可操作新增编辑的模板页
	*存在新增编辑则此模板按钮逻辑要根据dataSet要求去发送入参
	*所有模板都可能会有一个参数pageParam 界面来源参 
	*界面来源参里的值只作为ajax入参发送 如果里面定义了其他特殊指定的属性值需要从config.pageParam中移除 
	*以tab形式展示 或者并列往下依次排放 两种支持模式 或者指定类型显示tab
	*当前模板是否是只读模式 ，只读模式的定义方式有两种 通过模板配置readonly  界面之间传值决定的只读模式 如从列表页跳转到此界面作为一个查看界面（config.pageParam.readonly）
	*如果当前存在getValueAjax 则会ajax请求将服务端返回值赋值到界面数据上 将返回值定义个参数名称：serverData
	
		 * 当前模板的主子表逻辑关系 参数名称:idFieldsNames 存储格式：{root:'id',root.salelist:'saleId'}存储目的：按钮方法逻辑入参格式参考dataSet发参逻辑
		 * 当前模板哪个是主表 主表的配置项 参数名称：mainConfig 存储格式：{idField:'',keyField:'',id:''}存储目的：按钮方法逻辑上可以配置只发送主表相关配置项
		 * 根据类型存放对应的配置参数 参数名称：componentsConfig 存储格式:{vo:{}, blockList:{}} 存储目的：赋值
		 * 来源url,即上个界面的url链接是什么 参数名称：prevPageUrl,存储格式：string ,存储目的：如果涉及到返回到上一个界面时会用到 
		 * 默认当前模板以tab形式展现 参数名称 isTab:true,存储目的：只是更清晰知道当前模板的输出格式
		 * 按钮涉及到获取值的回调 ajax的前置和后置回调执行 如果是加载页的形式方法执行参数属性btnOptions放置到config属性定义上
		 * 此模板是在手机上使用暂不支持行内放置按钮
		 * 按钮如果有超出一个以上的按钮 则默认展示第一个按钮，其他按钮都放到更多里面 配置参数 config.moreBtnsArray
		 
	*底部btn按钮 第一个展示出来，其他按钮都放置到更多里面点击显示
	*sourcePageConfig
	* list新增需要存在添加按钮 添加按钮的配置项需要从list的field字段中查找有没有editConfig.type=='business'的类型，
		*如果有，可以存在多个list的情况，需要添加按钮的执行参数从此字段中读取，为方便将此配置相关参数存于config.componentsConfig.blockList中 参数名字businessConfig
	*获取界面值是否进行验证 根据按钮上配置的requestSource判断 如果值为thisVo则进行验证否则获取值不验证
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.processDocBaseMobile = (function(){
	function dialogBeforeHandler(data){
		var templateId = $('container').children('.processdocbasetab').attr('id');
		var config = NetstarTemplate.templates.processDocBaseMobile.data[templateId].config;
		data.value = NetstarTemplate.getValueDataByValidateParams(config,data.controllerObj);
		data.config = config;

		if(data.controllerObj){
			if(data.controllerObj.defaultMode == 'loadPage'){
				config.pageParam.sourcePageConfig = {
					valueData:getPageData(config,false),
				}
			}
		}
		return data;
	}
	function ajaxBeforeHandler(data){
		return data;
	}
	function ajaxAfterHandler(data,plusData){
		var templateId = $('container').children('.processdocbasetab').attr('id');
		var config = NetstarTemplate.templates.processDocBaseMobile.data[templateId].config;
		if(typeof(data)=='undefined'){
			data = {};
		}
		switch(data.objectState){
			case NSSAVEDATAFLAG.VIEW:
				break;
			case NSSAVEDATAFLAG.DELETE:
				//删除 清空界面值
				clearPageData(config);
				break;
			case NSSAVEDATAFLAG.EDIT:
				break;
			case NSSAVEDATAFLAG.ADD:
				break;
		}
		if(!$.isEmptyObject(plusData)){
			if(plusData.requestSource == 'thisVo'){
				var _currentConfig = NetstarTemplate.draft.configByPackPage[config.package];
				if(_currentConfig && _currentConfig.draftBox){
					delete _currentConfig.draftBox.useDraftId;
				}
			}
			var isCloseWindow = typeof(plusData.isCloseWindow)=='boolean' ? plusData.isCloseWindow : false;
			if(isCloseWindow){
				window.history.back();
			}
		}
	}
	function loadPageHandler(data){
		return data;
	}
	function closePageHandler(){

	}
	//获取值
	function getPageData(_value,_isValid){
		var _config = {};
		if(typeof(_value)=='string'){
			_config = NetstarTemplate.templates.configs[_value];
		}else{
			_config = _value;
		}
		_isValid = typeof(_isValid)=='boolean' ? _isValid : false;
		//NetstarBlockListM.dataManager.getData
		var componentConfig = _config.componentsConfig;
		var data = {};
		//获取到vo的数据值
		function getVoData(voJson){
			var voData = {};
			var isContinue = true;
			for(var voId in voJson){
				var data = nsForm.getFormJSON(voId,_isValid);
				var voConfig = voJson[voId];
				if(data){
					var isRoot = true;
					if(voConfig.keyField){
						if(voConfig.keyField != 'root'){
							isRoot = false;
						}
					}
					if(isRoot){
						nsVals.extendJSON(voData,data);
					}else{
						voData[voConfig.keyField] = data;//定义了keyField
					}
				}else{
					isContinue = false;//验证未通过返回值为false，终止for循环
					break;
				}
			}
			if(isContinue == false){
				voData = false;
			}
			return voData;
		}
		//获取到list的数据值
		function getListData(listJson){
			var listData = {};
			for(var listId in listJson){
				var data = NetstarBlockListM.dataManager.getData(listId);
				var listConfig = listJson[listId];
				if(listConfig.keyField){
					listData[listConfig.keyField] = data;
				}
			}
			return listData;
		}
		var isValid = true;
		for(var component in componentConfig){
			var componentConfig = _config.componentsConfig[component];
			var isContinue = true;
			switch(component){
				case 'vo':
					var voData = getVoData(componentConfig);
					if(voData){
						nsVals.extendJSON(data,voData);
					}else{
						isContinue = false;
					}
					break;
				case 'blockList':
					var listData = getListData(componentConfig);
					nsVals.extendJSON(data,listData);
					break;
			}
			if(isContinue == false){
				isValid = false;
				break;
			}
		}
		if(isValid == false){
			data = false;
		}
		if(data == false){
			return false;
		}else{
			var pageData = nsServerTools.getObjectStateData(_config.serverData, data, _config.idFieldsNames);
			NetStarUtils.setDefaultValues(pageData,_config.pageParam);
			return pageData;
		}
	}
	//清空界面值 恢复初始化状态
	function clearPageData(_config){
		function clearVoData(voJson){
			for(var id in voJson){
				nsForm.clearValues(id,false);
			}
		}
		function clearBlockList(listJson){
			for(var listId in listJson){
				NetstarBlockListM.refreshDataById(listId,[])
			}
		}
		for(var component in _config.componentsConfig){
			var componentConfig = _config.componentsConfig[component];
			switch(component){
				case 'vo':
					clearVoData(componentConfig);
					break;
				case 'blockList':
					clearBlockList(componentConfig);
					break;
			}
		}
	}
	//初始化
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
		if(typeof(NetstarTemplate.templates.processDocBaseMobile.data)=='undefined'){
			NetstarTemplate.templates.processDocBaseMobile.data = {};  
		}
		var originalConfig = $.extend(true,{},_config);//保存原始值
		var config = _config;
		//记录config
		NetstarTemplate.templates.processDocBaseMobile.data[_config.id] = {
			original:originalConfig,
			config:config
		};
		/******************************根据当前模板的id存储当前配置的定义参数 end */
		function setDefault(){
			var defaultConfig = {
				idFieldsNames:{},
				componentsConfig:{
					vo:{},
					blockList:{},
					btns:{},
				},
				mainConfig:{},
				pageParam:{},
				isTab:true,
				tabFieldArray:[],
				readonly:false,
				serverData:{},
				btnOptions:{
					source:'form',
					dialogBeforeHandler:dialogBeforeHandler,
					ajaxBeforeHandler:ajaxBeforeHandler,
					ajaxAfterHandler:ajaxAfterHandler,
					loadPageHandler:loadPageHandler,
					closePageHandler:closePageHandler,
				},
				moreBtnsArray:[],
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
			NetstarTemplate.draft.setConfig(config); // 设置草稿箱相关参数
		}
		//切换tab展示
		function changeTabHandler(ev){
			var $li = $(this).closest('li');
			var panelId = $li.attr('ns-componentid');
			var $panel = $('div[id="'+panelId+'"]').parent();
			$panel.removeClass('hide');
			$panel.siblings().not(":first").addClass('hide');
			$('footer').removeClass('hide');
		}
		function initContainer(){
			/***************先循环组件找到是否定义了tab start******************************** */
			var isTab = false;
			var tabFieldArray = [];
			var tabIndex = -1;
			for(var componentsI=0; componentsI<config.components.length; componentsI++){
				if(config.components[componentsI].type == 'tab'){
					isTab = true;
					if(config.components[componentsI].field){
						tabFieldArray = config.components[componentsI].field.split(',');
					}
					tabIndex = componentsI;
					break;
				}
			}
			config.isTab = isTab;
			config.tabFieldArray = tabFieldArray;
			if(tabIndex > -1){
				//找到之后从组件删除，把要输出的tab组件定义放置到config的tabFieldArray属性上
				config.components.splice(tabIndex,1);
			}
			/***************先循环组件找到是否定义了tab end******************************** */
			//开始循环component组件的输出
			var html = '';
			var liHtml = '';
			var btnHtml = '';
			for(var componentI=0; componentI<config.components.length; componentI++){
				var componentData = config.components[componentI];
				if(componentData.parent == 'root' && componentData.keyField == 'root'){
					//根
					config.mainConfig = componentData;
					config.idFieldsNames.root = componentData.idField;
				}else{
					if(componentData.keyField){
						config.idFieldsNames['root.'+componentData.keyField] = componentData.idField;
					}
				}
				var isBtn = false;
				var blockListBtnHtml = '';
				switch(componentData.type){
					case 'vo':
						for(var elementI=0; elementI<componentData.field.length; elementI++){
							var fieldData = componentData.field[elementI];
							switch(fieldData.type){
								case 'select':
									fieldData.type = 'radio';
									break;
								case 'select2':
									if(fieldData.multiple){
										fieldData.type = 'checkbox';
									}else{
										fieldData.type = 'radio';
									}
									break;
							}
						}
						config.componentsConfig.vo[componentData.id] = componentData;
						break;
					case 'blockList':
						if(!config.readonly){
							var btnId = componentData.id + '-addbtn-container';
							blockListBtnHtml = '<div nsgirdcontainer="grid-body-addbtn" ns-templateid="'+config.id+'" class="pt-grid-body-addbtn" id="'+btnId+'" ns-componentid="'+componentData.id+'">'
													+'<button \
														type="button" \
														title="添加" \
														ns-index="0" \
														class="pt-btn pt-btn-default">\
															<span>添加</span>\
													</button>'
												+'</div>';
						}
						config.componentsConfig.blockList[componentData.id] = componentData;
						break;
					case 'btns':
						isBtn = true;
						config.componentsConfig.btns[componentData.id] = componentData;
						break;
				}
				var classStr = '';
				if(componentData.plusClass){
					classStr += componentData.plusClass;
				}
				var panelClassStr = componentI === 0 ? '':' hide';
				if(!isBtn){
					html += '<div class="nspanel-container col-xs-12 col-sm-12 nspanel '+panelClassStr+'" ns-tab="'+componentI+'">'
								+blockListBtnHtml
								+'<div id="'+componentData.id+'" class="'+classStr+'" component-type="'+componentData.type+'"></div>'
							+'</div>';
					if(config.tabFieldArray.indexOf(componentData.keyField)>-1 || componentData.keyField === ''){
						//输出形式tab
						var currentLiClassStr = componentI === 0 ? ' active' : '';
						liHtml += '<li class="'+currentLiClassStr+'" ns-componentId="'+componentData.id+'">'
										+'<a href="#'+componentData.id+'" data-toggle="tab">'+componentData.title+'</a>'
									+'</li>';
					}
				}else{
					btnHtml = '<div class="btn-group nav-form" id="'+componentData.id+'" ns-templateid="'+config.id+'"></div>';
				}
			}
			if($('container .processdocbasetab').length > 0){
				$('container .processdocbasetab').remove();
			}
			var containerHtml = '<div class="row layout-planes processdocbasetab" id="'+config.id+'" ns-package="'+config.package+'"></div>';
			nsTemplate.appendHtml(containerHtml);//输出容器
			var $container = $('#'+config.id);
			if(config.isTab){
				var ulHtml = '<div class="col-xs-12 col-sm-12 nspanel" nstype="tab">'
								+'<div class="layout-main">'
									+'<ul class="nav nav-tabs nav-tabs-line">'
										+liHtml
									+'</ul>'
								+'</div>'
							+'</div>';
				$container.html(ulHtml+html);
			}else{
				$container.html(html);
			}
			if(btnHtml){
				$container.append('<footer>'+btnHtml+'</footer>');
			}
			//ul li的单击切换tab事件
			$container.find('div[nstype="tab"] ul > li > a').on('click',changeTabHandler);
		}
		function voInit(voJson){
			var readonly = config.readonly;
			for(var voId in voJson){
				var voConfig = voJson[voId];
				var voData = {};
				if(!$.isEmptyObject(config.serverData)){
					voData = config.serverData;
					if(voConfig.keyField){
						if(voConfig.keyField != 'root'){
							voData = config.serverData[voConfig.keyField];
						}
					}
				}
				/****************跳转界面之后返回到当前界面要显示之前编写的信息 start********************** */
				var valueData = config.sourcePageConfig.valueData;
				if(!$.isEmptyObject(valueData)){
					voData = valueData;
					if(voConfig.keyField){
						if(voConfig.keyField != 'root'){
							voData = valueData[voConfig.keyField];
						}
					}
				}
				/***********跳转界面之后返回到当前界面要显示之前编写的信息 end*************************** */
				function outputFieldsCommonChangeHandler(config){
					console.log(config)
				}
				for(var fieldI=0; fieldI<voConfig.field.length; fieldI++){
					var fieldData = voConfig.field[fieldI];
					fieldData.readonly = readonly;
					fieldData.acts = 'formlabel';
					if(fieldData.type == 'date'){
						fieldData.acts = 'date-label';
					}else if(fieldData.type == 'datetime'){
						fieldData.acts = 'datetime-label';
					}
					if(voData[fieldData.id]){
						//fieldData.value = voData[fieldData.id];
					}
					if(typeof(voData[fieldData.id])=='number'){
						//fieldData.value = voData[fieldData.id];
					}
					if(fieldData.setValueExpression && !$.isEmptyObject(config.pageParam)){
						//表达式
						//fieldData.value = NetStarUtils.getDataByExpression(config.pageParam,fieldData.setValueExpression);
					}
					
					//是否定义了outputFields字段
					if(fieldData.outputFields){
						//fieldData.commonChangeHandler = outputFieldsCommonChangeHandler;
					}
				}
				var formJson = {
					id:voId,
					form:$.extend(true,[],voConfig.field),
					formSource:'inlineScreen',
					fieldMoreActtion:voConfig.fieldMoreActtion,
					fieldMoreTitle:voConfig.fieldMoreTitle,
					moreText:voConfig.moreText,
					getPageDataFunc:function(){
						return voData;
					},
				};
				nsForm.initByValues(formJson,voData);
			}
		}
		function blockListInit(listJson){
			var readonly = config.readonly;
			for(var listId in listJson){
				var listConfig = listJson[listId];
				var listDataArray = {};
				if(!$.isEmptyObject(config.serverData)){
					listDataArray = config.serverData;
					if(listConfig.keyField){
						if(listConfig.keyField != 'root'){
							listDataArray = config.serverData[listConfig.keyField];
						}
					}
				}
				if(!$.isArray(listDataArray)){listDataArray = [];}
				var listIds = [];
				for(var listI=0; listI<listDataArray.length; listI++){
					listIds.push(listDataArray[listI][listConfig.idField]); 
				}
				if(config.sourcePageConfig){
					var valueData = config.sourcePageConfig.valueData;
					if(!$.isEmptyObject(valueData)){
						var valueArray = valueData[listConfig.keyField];
						if($.isArray(valueArray)){
							if(valueArray.length > 0){
								for(var valueI=0; valueI<valueArray.length; valueI++){
									if(listIds.indexOf(valueArray[valueI][listConfig.idField]) == -1){
										listDataArray.unshift(valueArray[valueI]);
									}
								}
							}
						}
					}
				}
				//读取有没有editConfig.type == 'business'
				var businessConfig = {};
				for(var fieldI=0; fieldI<listConfig.field.length; fieldI++){
					var fieldData = listConfig.field[fieldI];
					var editConfig = typeof(fieldData.editConfig)=='object' ? fieldData.editConfig : {};
					if(editConfig.type == 'business'){
						businessConfig = editConfig;
						break;
					}
				}
				listConfig.businessConfig = businessConfig;
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
						dataSource:listDataArray,
					},
					columns:$.extend(true,[],listConfig.field),
					ui:{
						listExpression:listConfig.listExpression,
						isHaveEditDeleteBtn:false,
						isHaveAddBtn:!readonly,
						isEditMode:!readonly,
						selectMode:'single',
						displayMode:'block',
						height:$(window).outerHeight() - 60,
						isHeader:false,
						isCheckSelect:false,
						isThead:false,
					}
				};
				var vueObj = NetstarBlockListM.init(gridConfig);	
				
				$('#'+listId+'-addbtn-container button').on('click',function(ev){
					var $this = $(this);
					var $dom = $this.closest('[nsgirdcontainer="grid-body-addbtn"]');
					var templateId = $dom.attr('ns-templateid');
					var gridId = $dom.attr('ns-componentid');
					var config = NetstarTemplate.templates.processDocBaseMobile.data[templateId].config;
					var businessConfig = config.componentsConfig.blockList[gridId].businessConfig;
					if(!$.isEmptyObject(businessConfig)){
						//跳转界面传送参数
						var tempValueName = config.package + new Date().getTime();
						if(typeof(NetstarTempValues)=='undefined'){NetstarTempValues = {};}//界面的pageParam参数
						var pageData = NetstarTemplate.templates.processDocBaseMobile.getPageData(config,false);
						businessConfig.pageParam = pageData;
						NetstarTempValues[tempValueName] = {
							sourcePageConfig:{
								config:config,
								gridId:gridId,
								businessConfig:businessConfig,
								keyField:config.componentsConfig.blockList[gridId].keyField,
								data:pageData
							}
						};
						/*if(!$.isEmptyObject(pageData)){
							nsVals.extendJSON(NetstarTempValues[tempValueName],pageData);
						}*/
						var url = businessConfig.source.url+'?templateparam=' + encodeURIComponent(tempValueName);
						nsFrame.loadPageVRouter(url);
					}else{
						nsalert('不存在要添加的业务组件','warning');
					}
				});
			}
		}
		//更多按钮的处理
		function moreBtnsHandler(dom){
			var templateId = dom.closest('.nav-form').attr('ns-templateid');
			var config = NetstarTemplate.templates.processDocBaseMobile.data[templateId].config;
			var moreBtnsArray = $.extend(true,[],config.moreBtnsArray);
			var id = 'nav-moblieButtons-' + templateId;
			var navHtml = '<div class="nav-form mobile-menu-buttons" nspanel="moblieButtons" id="' + id + '" ns-package="'+config.package+'"></div>';
			$('#' + id).remove();
			$('body').append(navHtml);
			var $container = $('#' + id);
			$container.off('click');
			$container.on('click', function (ev) {
				$(this).remove();
			});

			if(!$.isEmptyObject(config.draftBox)){
				if(config.draftBox.isUse){
					moreBtnsArray.push({
						text:'保存草稿',
						isReturn:true,
						index:{
							iconCls:'<i class="icon-time-out-o"></i>'
						},
						handler:function(ev){
							var package = $(ev).closest('.mobile-menu-buttons').attr('ns-package');
							var config = NetstarTemplate.templates.configs[package];
							NetstarTemplate.draft.btnManager.save(config);
						}
					},{
						text:'草稿箱',
						isReturn:true,
						index:{
							iconCls:'<i class="icon-inbox"></i>'
						},
						handler:function(ev){
							var package = $(ev).closest('.mobile-menu-buttons').attr('ns-package');
							var config = NetstarTemplate.templates.configs[package];
							NetstarTemplate.draft.getListByPackage(config,function(data,_config){
								if(!$.isArray(data)){data = [];}
								var columnsArray = NetstarTemplate.draft.draftManager.getFormatColumns(_config);
								var dataSource = NetstarTemplate.draft.draftManager.getFormatData(data,_config);
								var idField = NetstarTemplate.draft.draftManager.draftIdName;
								var drafGridId = 'draf-grid-'+_config.id;
								var gridConfig = {
									id:drafGridId,
									columns:columnsArray,
									data:{
										idField:idField,
										dataSource:dataSource,
									},
									ui:{
										selectMode:"none",
										isInlineBtn:true,
										moreBtnHandler:function(data,_grid){
											var id = 'nav-moblieButtons-' + _grid.gridConfig.id;
											var navHtml = '<div class="nav-form mobile-menu-buttons" nspanel="moblieButtons" style="z-index:999 !important" id="' + id + '"></div>';
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
														subdata: [
															{
																text:'使用',
																isReturn:true,
																index:{
																	iconCls:'<i class="icon-all-o"></i>'
																},
																handler:function(ev){
																	NetstarTemplate.draft.draftManager.useDataByRowData(data,_config);	
																}
															},{
																text:'删除',
																isReturn:true,
																index:{
																	iconCls:'<i class="icon-trash-o"></i>'
																},
																handler:function(ev){
																	nsConfirm('确定删除',function(isDelete){
																		if(isDelete){
																			var ajaxConfig = $.extend(true, {}, _config.draftBox.deleteById);
																			ajaxConfig.data = {
																				id : data[idField],
																				objectState : NSSAVEDATAFLAG.DELETE,
																			};
																			ajaxConfig.plusData = {
																				package : _config.package,
																			}
																			NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
																				if(res.success){
																					nsAlert('删除成功');
																					var plusData = _ajaxConfig.plusData;
																					var templateConfig = NetstarTemplate.templates.configs[plusData.package];
																					NetstarTemplate.draft.getListByPackage(templateConfig,function(data,_templateConfig){
																						var resData = $.extend(true,[],data);
																						var refreshData = NetstarTemplate.draft.draftManager.getFormatData(resData, _templateConfig);
																						NetstarBlockListM.refreshDataById(drafGridId,refreshData);
																						//NetstarBlockListM.configs[drafGridId].vueConfig.data.originalRows = refreshData;
																						//$('.mobilewindow-fullscreen').remove();
																					})
																				}else{
																					nsAlert('删除失败');
																				}
																			})
																		}
																	},'warning');
																}
															}
														]
													}]
												]
											};
											nsNav.init(navJson);
										},
										listExpression:'<div class="block-list-item"><div class="block-list-item-text"><span class="title">{{customerId}}</span></div><div class="block-list-item-text text-left"><span>{{customerContacterId}}</span></div><div class="block-list-item-text text-left"><span>{{warehouseId}}</span></div><div class="block-list-item-text text-left"><span>{{whenSale}}</span></div></div>'               
									}
								};
								//给当前容器追加元素
								var appendHtml = '<div class="mobilewindow-fullscreen">'
													+'<div class="row layout-planes businessdatabasem" \
														\id="draf-'+_config.id+'" source-package="'+_config.package+'">'
														+'<div class="nspanel-container nspanel col-xs-12 col-sm-12 notree no-query no-outbtns" ns-panel="blockList">'
															+'<div id="'+drafGridId+'" component-type="blockList">'
															+'</div>'
														+'</div>'
													+'</div>'
												+'</div>';
								$('container').append(appendHtml);
								var vueObj = NetstarBlockListM.init(gridConfig);
							});
						}
					});
				}
			}

			var navJson = {
				id: id,
				isShowTitle: false,
				btns: [
					[{
						hidden: true,
						subdata: moreBtnsArray
					}]
				]
			};
			nsNav.init(navJson);
		}
		function btnInit(btnJson){
			for(var btnId in btnJson){
				var btnConfig = btnJson[btnId];
				var fieldArray = $.extend(true,[],btnConfig.field);
				nsTemplate.setBtnDataChargeHandler(fieldArray,config.btnOptions,config);//给按钮绑定回调方法
				var formatFieldArray = nsTemplate.getBtnArrayByBtns(fieldArray);//得到按钮值
				//按要求 界面只显示一个按钮 其他按钮通过点击更多按钮来展示
				var btnJson = {
					id:btnId,
					btns:[],
					isShowTitle:false,
				};
				for(var i=0; i<formatFieldArray.length; i++){
					formatFieldArray[i].btnCls = 'btn btn-info';
				}
				if(formatFieldArray.length > 1){
					btnJson.btns = [[formatFieldArray[0],{
						text:'更多',
						handler:moreBtnsHandler,
						isReturn:true,
						btnCls:'btn btn-info'
					}]];
					config.moreBtnsArray = $.extend(true,[],formatFieldArray);
					config.moreBtnsArray[0].configShow = false;
					//config.moreBtnsArray.splice(0,1);//把排除第一个的其余按钮存放起来
				}else{
					btnJson.btns = [formatFieldArray];
				}
				nsNav.init(btnJson);
			}
		}
		function initPanelInit(config){
			for(var component in config.componentsConfig){
				var componentConfig = config.componentsConfig[component];
				switch(component){
					case 'vo':
						voInit(componentConfig);
						break;
					case 'blockList':
						blockListInit(componentConfig);
						break;
					case 'btns':
						if($.isEmptyObject(componentConfig)){
							$('#'+config.id).addClass('no-outbtns');
						}
						btnInit(componentConfig);
						break;
				}
			}
		}
		setDefault();//设置默认值
		initContainer();//初始化容器输出
		function initPanelInitByGetValueAjax(){
			var ajaxConfig = $.extend(true, {}, config.getValueAjax);
			ajaxConfig.plusData = {templateConfig:config};
			var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
			var isUseObject = true;
			for (var key in ajaxConfig.data) {
				if (ajaxParameterRegExp.test(ajaxConfig.data[key])) {
				isUseObject = false;
				break;
				}
			}
			var ajaxData = {};
			if (isUseObject) {
				ajaxData = config.pageParam;
			} else {
				ajaxData = nsVals.getVariableJSON(ajaxConfig.data, config.pageParam);
			}
			//ajaxConfig.url = ajaxConfig.src;
			//delete ajaxConfig.src;
			ajaxConfig = nsVals.getAjaxConfig(ajaxConfig,ajaxData,{idField:config.idFieldsNames.root});
			nsVals.ajax(ajaxConfig,function(res,ajaxOptions){
				if(res.success){
					config.serverData = res[ajaxOptions.dataSrc] ? res[ajaxOptions.dataSrc] : {};
					initPanelInit(config);
				}
			},true);
		}
		//根据getValueAjax请求返回值 初始化界面
		if(!$.isEmptyObject(config.getValueAjax)){
			initPanelInitByGetValueAjax();
		}else{
			//界面不存在getValueAjax的请求 直接初始化界面
			initPanelInit(config);//组件初始化
		}
	}
	function fillValueByVo(voJson,data){
		for(var id in voJson){
			var voConfig = voJson[id];
			var valueData;
			if(voConfig.keyField){
				if(voConfig.keyField !='root'){
					valueData = data[voConfig.keyField];
				}else{
					valueData = data;
				}
			}else{
				valueData = data;
			}
			if(!$.isEmptyObject(valueData)){
				nsForm.fillValues(valueData,id);
			}else{
				nsForm.clearValues(id,false);
			}
		}
	}
	function fillValueByList(listJson,data){
		for(var id in listJson){
			var listConfig = listJson[id];
			var valueData = [];
			if(listConfig.keyField){
				valueData = data[listConfig.keyField];
			}
			if(!$.isArray(valueData)){
				valueData = [];
			}
			NetstarBlockListM.refreshDataById(id,valueData);
		}
	}
	function refreshComponentsData(data,_package){
		data = typeof(data)=='object' ? data :{};
		var config = NetstarTemplate.templates.configs[_package];
		for(var component in config.componentsConfig){
			var componentConfig = config.componentsConfig[component];
			switch(component){
				case 'vo':
					fillValueByVo(componentConfig,data);
					break;
				case 'blockList':
					fillValueByList(componentConfig,data);
					break;
			}
		}
	}
	//根据草稿箱设置数据
	function setValueByDraft(data, _package){
		refreshComponentsData(data, _package);
	}
	return{
		init:									init,								
		VERSION:								'0.0.1',
		dialogBeforeHandler:					dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:						ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:						ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:						loadPageHandler,
		closePageHandler:						closePageHandler,
		getPageData:							getPageData,
		setValueByDraft:						setValueByDraft,
		refreshComponentsData:					refreshComponentsData,
	}
})(jQuery)
/******************** 表格模板 end ***********************/