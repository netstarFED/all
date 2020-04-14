/*
	* @Author: netstar.sjj
	* @Date: 2019-09-29 11:45:00
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.treeForm = (function(){
	/***************组件事件调用 start**************************** */
	function dialogBeforeHandler(data,templateId){
		data = typeof(data)=='object' ? data : {};
		var config = NetstarTemplate.templates.treeForm.data[templateId].config;
		var controllerObj = typeof(data.controllerObj)=='object' ? data.controllerObj : {};
		data.config = config;
		var requestSource = controllerObj.requestSource ? controllerObj.requestSource : 'selected';//默认读取选中行的操作，当前模板是单选
		var treeConfig = config.treeConfig;
		var treeId = treeConfig.id;
		switch(requestSource){
			case 'selected':
				data.value = NetstarTemplate.tree.getSelectedNodes(treeId);
				if($.isArray(data.value) && data.value.length > 0){
					data.value = data.value[0];
				}
				break;
			case 'checkbox':
				data.value = NetstarTemplate.tree.getCheckedNodes(treeId);
				break;
		}
		return data;
	}
	//ajax前置回调
	function ajaxBeforeHandler(handlerObj,templateId){
		//是否有选中值有则处理，无则返回
		var config = NetstarTemplate.templates.treeForm.data[templateId].config;
		handlerObj.config = config;
		return handlerObj;
	}
	//ajax后置回调
	function ajaxAfterHandler(res,templateId){
		var config = NetstarTemplate.templates.treeForm.data[templateId].config;	
	}
	//跳转打开界面回调
	function loadPageHandler(){}
	//关闭打开界面回调
	function closePageHandler(){}
	/***************组件事件调用 end************************** */
	//根据节点判断按钮是否处于禁用状态
	function isDisabledByTreeNode(treeNode,btnId,treeConfig,voId){
		var currentNodeIsAll = false;//当前选中节点是否是全部
		if(treeConfig.allfieldId){
			//存在全部的定义 
			if(treeNode[treeConfig.idField] == treeConfig.allfieldId){
				currentNodeIsAll = true;
			}
		}
		if(currentNodeIsAll){
			NetstarTemplate.commonFunc.vo.clearValues(voId);//先清空右侧vo
			$('#'+btnId+' button[type="button"]').attr('disabled',true);//先解除按钮的禁用状态
			$('#'+btnId+' button[defaultMode="addChild"]').removeAttr('disabled');//只可新增子级其他禁用
		}else{
			var childrenArr = treeNode.children;
			if(!$.isArray(childrenArr)){childrenArr = [];}
			if(childrenArr.length > 0){
				//还有子级不允许删除操作
				$('#'+btnId+' button[type="button"]').removeAttr('disabled');
				$('#'+btnId+' button[defaultMode="del"]').attr('disabled',true);//禁用删除按钮
			}else{
				$('#'+btnId+' button[type="button"]').removeAttr('disabled');
			}
		}
	}
	//树节点单击事件
	function treenodeClickHandler(data){
		var packageName = $(data.event.currentTarget).closest('.component-tree').attr('ns-template-package');
		var templateConfig = NetstarTemplate.templates.configs[packageName];//获取当前模板的配置参数
		var treeConfig = templateConfig.treeConfig;//树配置
		var currentNodeIsAll = false;//当前选中节点是否是全部
		if(treeConfig.allfieldId){
			//存在全部的定义 
			if(data.treeNode[treeConfig.idField] == treeConfig.allfieldId){
				currentNodeIsAll = true;
			}
		}
		if(currentNodeIsAll){
			NetstarTemplate.commonFunc.vo.clearValues(templateConfig.voConfig.id);//清空vo
			$('#'+templateConfig.btnId+' button[type="button"]').attr('disabled',true);//先解除按钮的禁用状态
			$('#'+templateConfig.btnId+' button[defaultMode="addChild"]').removeAttr('disabled');//只可新增子级其他禁用
		}else{
			var childrenArr = data.treeNode.children;
			if(!$.isArray(childrenArr)){childrenArr = [];}
			if(childrenArr.length > 0){
				//还有子级不允许删除操作
				$('#'+templateConfig.btnId+' button[type="button"]').removeAttr('disabled');
				$('#'+templateConfig.btnId+' button[defaultMode="del"]').attr('disabled',true);//禁用删除按钮
			}else{
				$('#'+templateConfig.btnId+' button[type="button"]').removeAttr('disabled');
			}
			NetstarTemplate.commonFunc.vo.clearValues(templateConfig.voConfig.id);
			NetstarTemplate.commonFunc.vo.fillValues(data.treeNode,templateConfig.voConfig.id);//给右侧vo赋值
		}
	}
	function getDataByTab(_tabComponents,_config){
		var tabListData = {};
		for(var tId in _tabComponents){
			var keyField = _tabComponents[tId].keyField;
			var tabType = _tabComponents[tId].type;
			if(_tabComponents[tId].params.displayMode == 'voList'){
				tabType = 'voList';
			}
			switch(tabType){
				case 'list':
				case 'blockList':
					tabListData[keyField] = NetstarTemplate.commonFunc.list.getData(_tabComponents[tId].id);
					break;
				case 'uploadCover':
					tabListData[keyField] = _config.uploadCoverArr;
					//图片上传
					break;
			}
		}
		return tabListData;
	}
	//按钮事件调用方法
	function buttonEventClickHandler(data,btnType){
		var packageName = $(data.event.currentTarget).closest('.component-btn').attr('ns-template-package');
		var templateConfig = NetstarTemplate.templates.configs[packageName];//获取当前模板的配置参数
		var treeConfig = templateConfig.treeConfig;
		var selectedNodes = NetstarTemplate.tree.getSelectedNodes(treeConfig.id);
		var voData = NetstarTemplate.commonFunc.vo.getData(templateConfig.voConfig.id,true);
		if(voData == false){
			//表单验证未通过
			return;
		}
		if(!$.isEmptyObject(templateConfig.tabConfig.components)){
			//获取整个tab的数据
			var tabListData = getDataByTab(templateConfig.tabConfig.components,templateConfig);
			$.each(tabListData,function(key,v){
				voData[key] = v;
			})
		}
		var ajaxConfig = {};
		switch(btnType){
			case 'edit':
				//树节点的修改操作
				ajaxConfig = $.extend(true,{},treeConfig.editAjax);
				ajaxConfig.data = voData;
				ajaxConfig.data.objectState = NSSAVEDATAFLAG.EDIT;
				ajaxConfig.data[treeConfig.idField] = selectedNodes[0][treeConfig.idField];
				break;
			case 'addBrothers':
				//添加同级
				ajaxConfig = $.extend(true,{},treeConfig.addAjax);
				ajaxConfig.data = {situation:1};
				ajaxConfig.data[treeConfig.fromField] = selectedNodes[0].id;
				ajaxConfig.data[treeConfig.textField] = '新增同级';
				ajaxConfig.data.objectState = NSSAVEDATAFLAG.ADD;
				//需要获取当前选中节点的父节点id才能添加同级
				//ajaxConfig.data[treeConfig.parentField] = selectedNodes[0][treeConfig.parentField];
				break;
			case 'addChild':
				//新增子级
				ajaxConfig = $.extend(true,{},treeConfig.addAjax);
				ajaxConfig.data = {situation:2};	
				ajaxConfig.data[treeConfig.fromField] = selectedNodes[0].id;
				ajaxConfig.data[treeConfig.textField] = '新增子级';
				ajaxConfig.data.objectState = NSSAVEDATAFLAG.ADD;
				//新增子级需要获取当前选中节点的节点id作为当前要新增节点的父节点id发送出去
				//ajaxConfig.data[treeConfig.parentField] = selectedNodes[0][treeConfig.idField]; 
				break;
			case 'copyAdd':
				//复制新增 新增的是同级节点
				ajaxConfig = $.extend(true,{},treeConfig.addAjax);
				ajaxConfig.data = {situation:1};	
				$.each(voData,function(key,value){
					ajaxConfig.data[key] = value;
				})
				ajaxConfig.data[treeConfig.fromField] = selectedNodes[0].id;
				ajaxConfig.data[treeConfig.textField] = '复制新增';
				ajaxConfig.data.objectState = NSSAVEDATAFLAG.ADD;
				//需要获取当前选中节点的父节点id才能添加同级
				//ajaxConfig.data[treeConfig.parentField] = selectedNodes[0][treeConfig.parentField];
				break;
			case 'del':
				//删除
				ajaxConfig = $.extend(true,{},treeConfig.deleteAjax);
				ajaxConfig.data = {};
				ajaxConfig.data[treeConfig.idField] = selectedNodes[0][treeConfig.idField];//删除只需要传送主键id即可
				ajaxConfig.data.objectState = NSSAVEDATAFLAG.DELETE;
				break;
		}
		ajaxConfig.plusData = {
			templateConfig:templateConfig, //模板配置
			treeId:treeConfig.treeId,//树id
			btnType:btnType,//操作类型
			selectedNodes:selectedNodes[0],//选中节点
			treeConfig:treeConfig,//树配置
		};

		function confirmHandler(){
			NetStarUtils.ajax(ajaxConfig, function(res,ajaxOptions){
				if(res.success){
					nsalert('操作成功','success');
					var plusData = ajaxOptions.plusData;
					var voConfig = plusData.templateConfig.voConfig;//获取vo配置 
					var treeId = plusData.treeId;
					var ztreeObj = $.fn.zTree.getZTreeObj(treeId);//树方法
					ztreeObj.setting.view.selectedMulti = false;//始终是单选
					var dataSrc = ajaxOptions.dataSrc ? ajaxOptions.dataSrc : 'data';
					var data = res[dataSrc];
					var treeNodes = plusData.selectedNodes;//当前选中的树节点
					var _treeConfig = plusData.treeConfig;//树配置
					//刷新树
					switch(plusData.btnType){
						case 'copyAdd':
						case 'addBrothers':
							//同级添加  添加之后应该和当前选中节点是同级的关系
							//根据id获取当前父节点的值
							var parentNodes = ztreeObj.getNodeByParam('id',treeNodes[_treeConfig.parentField],null);
							ztreeObj.addNodes(parentNodes,data);
							//清空vo
							NetstarTemplate.commonFunc.vo.clearValues(voConfig.id);
							var currentSelectedNode = ztreeObj.getNodeByParam('id',data[_treeConfig.idField],null);
							ztreeObj.selectNode(currentSelectedNode);//新添加的设置为选中状态
	
							NetstarTemplate.commonFunc.vo.fillValues(currentSelectedNode,voConfig.id);//给右侧vo赋值

							isDisabledByTreeNode(currentSelectedNode,plusData.templateConfig.btnId,_treeConfig,voConfig.id);//根据当前选中节点判断按钮状态
							break;
						case 'addChild':
							//添加子级
							var parentNodes = ztreeObj.getNodeByParam('id',treeNodes[_treeConfig.idField],null);
							ztreeObj.addNodes(parentNodes,data);
	
							NetstarTemplate.commonFunc.vo.clearValues(voConfig.id);
							var currentSelectedNode = ztreeObj.getNodeByParam('id',data[_treeConfig.idField],null);
							if($.isEmptyObject(currentSelectedNode)){
	
							}else{
								ztreeObj.selectNode(currentSelectedNode);//新添加的设置为选中状态
							}
	
							NetstarTemplate.commonFunc.vo.fillValues(currentSelectedNode,voConfig.id);//给右侧vo赋值

							isDisabledByTreeNode(currentSelectedNode,plusData.templateConfig.btnId,_treeConfig,voConfig.id);//根据当前选中节点判断按钮状态
							break;
						case 'edit':
							//修改
							var editNodes = ztreeObj.getNodeByParam('id',treeNodes[_treeConfig.idField],null);
							$.each(data,function(key,value){
								editNodes[key] = value;
							})
							ztreeObj.updateNode(editNodes);//更新节点

							isDisabledByTreeNode(editNodes,plusData.templateConfig.btnId,_treeConfig,voConfig.id);//根据当前选中节点判断按钮状态
							break;
						case 'del':
							//删除
							ztreeObj.removeNode(treeNodes);
							var parentNodes = ztreeObj.getNodeByParam('id',treeNodes[_treeConfig.parentField],null);
							if($.isEmptyObject(parentNodes)){
								var nodes = ztreeObj.getNodes();
								parentNodes = nodes[0];
							}
							ztreeObj.selectNode(parentNodes);//删除当前节点将其父节点设置为选中节点
	
							NetstarTemplate.commonFunc.vo.clearValues(voConfig.id);//先清空右侧vo
							
							NetstarTemplate.commonFunc.vo.fillValues(parentNodes,voConfig.id);//给右侧vo赋值

							isDisabledByTreeNode(parentNodes,plusData.templateConfig.btnId,_treeConfig,voConfig.id);//根据当前选中节点判断按钮状态
							break;
					}
				}else{
					//nsalert('返回值为false','error');
				}
			},true)
		}
		if(btnType == 'del'){
			nsconfirm('是否确认要删除',function(res){
				if(res){
					confirmHandler();
				}
			},'warning')
		}else{
			confirmHandler();
		}
	}
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
					for(var treeI in componentData){
						componentData[treeI].clickHandler = treenodeClickHandler;
						componentData[treeI].readonly = true;
					}
					NetstarTemplate.commonFunc.tree.init(componentData,_config);
					break;
				case 'voList':
					NetstarTemplate.commonFunc.voList.init(componentData,_config);
					break;
				case 'uploadCover':
					NetstarTemplate.commonFunc.uploadCover.init(componentData,_config);
					break;
			}
		}
		var btnJson = {
			id:_config.btnId,
			isShowTitle:false,
			pageId:_config.id,
			package:_config.package,
			btns:[
				{
					text:'保存',
					handler:function(data){
						buttonEventClickHandler(data,'edit');
					},
					defaultMode:'edit',
				},{
					text:'新增同级',
					handler:function(data){
						buttonEventClickHandler(data,'addBrothers');
					},
					defaultMode:'addBrothers',
				},{
					text:'新增子级',
					handler:function(data){
						buttonEventClickHandler(data,'addChild');
					},
					defaultMode:'addChild',
				},{
					text:'复制新增',
					handler:function(data){
						buttonEventClickHandler(data,'copyAdd');
					},
					defaultMode:'copyAdd',
				},{
					text:'删除',
					handler:function(data){
						buttonEventClickHandler(data,'del');
					},
					defaultMode:'del',
				}
			],
			callback:{
				  dialogBeforeHandler:(function(_config){
					 return function (data) {
						return dialogBeforeHandler(data,_config.id);
					 }
				  })(_config),
				  ajaxBeforeHandler:(function(_config){
					 return function (data) {
						return ajaxBeforeHandler(data,_config.id);
					 }
				  })(_config),
				  ajaxAfterHandler:(function(_config){
					 return function (data,plusData) {
						return ajaxAfterHandler(data,_config.id,plusData);
					 }
				  })(_config),
				  getOperateData:(function(_config){
					 return function () {
						var pageData = NetstarTemplate.getOperateData(_config);
						return pageData;
					 }
				  })(_config),
				  dataImportComplete:(function(_config){
					 return function (data) {
						refreshByConfig(_config);
					 }
				  })(_config),
				  refreshByConfig:(function(_config){
					 return function (data) {
						refreshByConfig(_config);
					 }
				  })(_config),
			}
		};
		for(var key in _config.componentsConfig.btns){
			var field = _config.componentsConfig.btns[key].field;
			var btns = NetstarTemplate.getBtnArrayByBtns(field);
			btnJson.btns = btnJson.btns.concat(btns);
		}
		vueButtonComponent.init(btnJson);

		if(!$.isEmptyObject(_config.tabConfig.components)){
			var tabUId = _config.tabConfig.id;
			$('#'+tabUId+' >li>a').on('click',function(ev){
				var $this = $(this);
				var $li = $this.closest('li');
				var id = $this.attr('ns-href-id');
				var $dom = $('#'+id).closest('.pt-tab-content');
				$li.addClass('current');
				$li.siblings().removeClass('current');
				$dom.addClass('current');
				$dom.siblings().removeClass('current');

				_config.tabConfig.activeIdByLi = id;

				if(_config.uploadCoverInit[id]){
					_config.uploadCoverInit[id].chooseImage();
				}
				
			})
			_config.tabConfig.activeIdByLi = $('#'+tabUId+' li.current a').attr('ns-href-id');
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
		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		var templateClassStr = '';
		if(_config.plusClass){
			templateClassStr = _config.plusClass;
		}
		var titleHtml = '';
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
		var treeHtml = '';
		var formHtml = '';
		for(var componentI=0; componentI<_config.components.length; componentI++){
			var componentData = _config.components[componentI];
			var componentTitleStr = componentData.title ? componentData.title : '';
			componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
			var componentDisplayMode = componentData.params.displayMode ? componentData.params.displayMode : '';
			var componentDataType = componentData.type;
			if(componentDisplayMode == 'voList'){
				componentDataType = 'voList';
			}
			_config.componentsConfig[componentDataType][componentData.id] = componentData;//根据类型和id存储组件信息

			var classStr = 'component-'+componentData.type;
			var attrPackage = 'ns-template-package="'+_config.package+'"';
			switch(componentData.type){
				case 'tree':
					componentData.treeId = 'tree-'+componentData.id;
					var treeHeight = _config.commonPanelHeight - 44;
					componentData.height = treeHeight;
					_config.treeConfig = componentData;
					_config.idFieldsNames['root'] = componentData.idField;//主键id
					treeHtml = '<div class="pt-panel">'
									+'<div class="pt-container">'
										+'<div class="'+classStr+'" id="'+componentData.id+'" '+attrPackage+'>'
											
										+'</div>'
									+'</div>'
								+'</div>';
					break;
				case 'vo':
					_config.voConfig = componentData;
					componentData.btnId = 'btn-'+componentData.id;
					_config.btnId = 'btn-'+componentData.id;
					var voHeight = _config.commonPanelHeight - 44;
					formHtml = '<div class="pt-panel">'
									+'<div class="pt-container">'
										+'<div class="component-btn" id="'+componentData.btnId+'" '+attrPackage+'></div>'
										+'<div class="'+classStr+'" id="'+componentData.id+'" '+attrPackage+' style="margin-top:10px;height:'+voHeight+'px;"></div>'
									+'</div>'
								+'</div>';
					break;
				case 'list':
					var defaultParams = {
						isPage:false,
						pageLengthDefault:5,//默认显示5条
						minPageLength:5,//显示5条
						isHaveEditDeleteBtn:true,//允许删除
						isAllowAdd:true,//允许添加
						isEditMode: true, //编辑模式
					};
					NetStarUtils.setDefaultValues(componentData.params,defaultParams);
					_config.tabConfig.components[componentData.id] = componentData;
					break;
				case 'uploadCover':
					_config.tabConfig.components[componentData.id] = componentData;
					break;
			}
		}
		var tabsHtml = '';
		if(!$.isEmptyObject(_config.tabConfig.components)){
			var attrPackage = 'ns-template-package="'+_config.package+'"';
			formHtml = '<div class="pt-panel">'
							+'<div class="pt-container">'
								+'<div class="component-btn" id="'+_config.voConfig.btnId+'" '+attrPackage+'></div>'
								+'<div class="component-vo" id="'+_config.voConfig.id+'" '+attrPackage+' style="margin-top:10px;"></div>'
							+'</div>'
						+'</div>';

			_config.tabConfig.id = 'tabs-'+_config.id;
			var componentsTabJson = _config.tabConfig.components;
			var listNum = 0;
			var tabLiHtml = '';
			var tabContentHtml = '';
			for(var listId in componentsTabJson){
				var listConfig = componentsTabJson[listId];
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
			var tabHtml = '<div class="pt-tab-components-tabs pt-tab pt-tab-noboder">'
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
			tabsHtml = '<div class="pt-panel">'
							+'<div class="pt-container">'
								+tabHtml
							+'</div>'
						+'</div>';
		}
		var html = '<div class="pt-main treeForm '+templateClassStr+' '+_config.mode+'" id="'+_config.id+'">'
						+titleHtml
						+'<div class="pt-container">'
							+'<div class="pt-main-row">'
								+'<div class="pt-main-col">'
									+treeHtml
								+'</div>'
								+'<div class="pt-main-col">'
									+formHtml
									+tabsHtml
								+'</div>'
							+'</div>'
						+'</div>'
					+'</div>';
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
	//设置默认值
	function setDefault(_config){
		var defaultConfig = {
			levelConfig:{},//等级数据存放
			mode:'',  //
			commonPanelHeight:$(window).outerHeight()-(NetstarTopValues.topNav.height) - 20,
		};
		if(_config.title){
			defaultConfig.commonPanelHeight -= 38;//减去标题的高
		}
		$.each(defaultConfig,function(key,value){
			_config[key] = value;
		})
		//NetStarUtils.setDefaultValues(_config,defaultConfig);
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