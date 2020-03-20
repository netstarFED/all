/*
	*手机端流程管理界面
	* @Author: netstar.sjj
	* @Date: 2019-12-24 11:20:00
*/
/******************** 表格模板 start ***********************/
NetstarTemplate.templates.workRecordSimpleMobile = (function(){
	function dialogBeforeHandler(data){
		var templateId = $('container').children('.workrecordsimplemobile').attr('id');
		var templateConfig = NetstarTemplate.templates.workRecordSimpleMobile.data[templateId].config;
		data.config = templateConfig;
		data.value = getPageData(templateConfig);
		return data;
	}
	function ajaxBeforeHandler(handlerObj,templateId){
		return handlerObj;
	}
	function ajaxAfterHandler(){}
	function loadPageHandler(){}
	function closePageHandler(){}
	function refreshListData(){}
	function getSelectedData(){}
	function getAjaxInnerParamsByAjaxData(){}
	function getPageData(_config,isValid){
		isValid = typeof(isValid)=='boolean' ? isValid : true;
		var returnData = {};
		if(_config.tabConfig.activeId == _config.voComponent.id){
			//操作的vo
			var voData = nsForm.getValues(_config.voComponent.id,isValid);
			if(voData){
				returnData = nsServerTools.getObjectStateData(_config.serverDataByVo,voData,_config.idFieldsNamesByVo);
			}else{
				return false;
			}
		}else{
			var workrecordObject = _config.workrecordObject;
			var originalGridData = _config.pageDataByList;
			var gridJson = {};
			for(var vId in workrecordObject){
				var workrecordData = workrecordObject[vId];
				var voData = nsForm.getValues(workrecordData.id);
				gridJson[workrecordData.data.workMethodRowId] = voData;
			}
			var workRecordRowListArr = originalGridData.workRecordRowList;
			if(!$.isArray(workRecordRowListArr)){workRecordRowListArr = [];}
			for(var rowI=0; rowI<workRecordRowListArr.length; rowI++){
				var rowData = workRecordRowListArr[rowI];
				var workRecordColListArr = rowData.workRecordColList;
				if(!$.isArray(workRecordColListArr)){workRecordColListArr = [];}
				var valueJson = gridJson[rowData.workMethodRowId] ? gridJson[rowData.workMethodRowId] : {};
				for(var colI=0; colI<workRecordColListArr.length; colI++){
					var colData = workRecordColListArr[colI];
					for(var valueI in valueJson){
					if(valueI.indexOf('-')>-1){
						var compareId = valueI.substring(valueI.lastIndexOf('-')+1,valueI.length);
						if(compareId == colData.workMethodColId){
							colData.data = valueJson[valueI];
						}
					}
					}
				}
			}
			returnData = nsServerTools.getObjectStateData(_config.serverDataByList, originalGridData, _config.idFieldsNames);
		}
		if(!$.isEmptyObject(_config.pageParam)){
			//按照标准处理流程，应该提供额外配置参数处理processId，
			//正常情况下不应当在大保存中处理这种逻辑，由于此情况特殊,特此记录 cy
			//工作流id 流程图id  如果界面来源参不为空 判断是否含有流程图id
			var pageFieldArr = ['processId','activityId','activityName','workItemId','workflowType','acceptFileIds'];
			for(var paramI=0; paramI<pageFieldArr.length; paramI++){
			   if(_config.pageParam[pageFieldArr[paramI]]){
				  returnData[pageFieldArr[paramI]] = _config.pageParam[pageFieldArr[paramI]];
			   }
			}
		}
		return returnData;
	}
	function initBtn(_config){
		var btnConfig = _config.mainBtnComponent;
		var fieldArray = $.extend(true,[],btnConfig.field);
		nsTemplate.setBtnDataChargeHandler(fieldArray,_config.btnOptions,_config);//给按钮绑定回调方法
		var formatFieldArray = nsTemplate.getBtnArrayByBtns(fieldArray);//得到按钮值
		var btnJson = {
			id:btnConfig.id,
			btns:[formatFieldArray],
			isShowTitle:false,
		};
		nsNav.init(btnJson);

		var voBtnConfig = _config.voBtnComponent;
		var fieldArray = $.extend(true,[],voBtnConfig.field);
		nsTemplate.setBtnDataChargeHandler(fieldArray,_config.btnOptions,_config);//给按钮绑定回调方法
		var formatFieldArray = nsTemplate.getBtnArrayByBtns(fieldArray);//得到按钮值
		var btnVoJson = {
			id:voBtnConfig.id,
			btns:[formatFieldArray],
			isShowTitle:false,
		};
		nsNav.init(btnVoJson);
	}
	function initVo(_config){
		var voComponent = _config.voComponent;
		for(var fieldI=0; fieldI<voComponent.field.length; fieldI++){
			var fieldData = voComponent.field[fieldI];
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
		var voAjaxConfig = $.extend(true,{},voComponent.ajax);
		if($.isEmptyObject(voAjaxConfig)){
			nsalert('vo中ajax没有定义','error');
			return;
		}
		if(!$.isEmptyObject(_config.pageParam)){
			if(!$.isEmptyObject(voAjaxConfig.data)){
				voAjaxConfig.data = NetStarUtils.getFormatParameterJSON(voAjaxConfig.data,_config.pageParam);
			}else{
				voAjaxConfig.data = _config.pageParam;
			}
		}
		voAjaxConfig.plusData = {
			packageName:_config.package,
			templateId:_config.id
		};
		NetStarUtils.ajax(voAjaxConfig,function(res,ajaxPlusData){
			if(res.success){
				var voData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : {};
				var templateConfig = NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName];
				templateConfig.serverDataByVo = voData;
				var voConfig = templateConfig.voComponent;
				var fieldArray = $.extend(true,[],voConfig.field);
				for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
					var fieldData = fieldArray[fieldI];
					fieldData.acts = 'formlabel';
					if(fieldData.type == 'date'){
						fieldData.acts = 'date-label';
					}else if(fieldData.type == 'datetime'){
						fieldData.acts = 'datetime-label';
					}
					if(voData[fieldData.id]){
						fieldData.value = voData[fieldData.id];
					}
					if(typeof(voData[fieldData.id])=='number'){
						fieldData.value = voData[fieldData.id];
					}
					if(fieldData.setValueExpression && !$.isEmptyObject(templateConfig.pageParam)){
						//表达式
						fieldData.value = NetStarUtils.getDataByExpression(templateConfig.pageParam,fieldData.setValueExpression);
					}
				}
				var formJson = {
					id:voConfig.id,
					form:fieldArray,
					formSource:'inlineScreen',
					fieldMoreActtion:voConfig.fieldMoreActtion,
					fieldMoreTitle:voConfig.fieldMoreTitle,
					moreText:voConfig.moreText,
					getPageDataFunc:function(){
						return templateConfig.pageParam;
					},
				};
				if(voConfig.isStaticData){
					formJson.formSource = 'staticData';
				}
				nsForm.init(formJson);
			}else{
				var msg = res.msg ? res.msg : '返回值false';
				nsalert(msg,'error');
			}
		},true);
	}
	function setWorkRecordRowData(resData,templateConfig){
		var titleArray = ['序号','确认事项'];
      var rowObject = {};
	  var rowArray = resData.workRecordRowList; //读取行数据
	  var workrecordId = templateConfig.mainComponent.id;
      if(!$.isArray(rowArray)){
        rowArray = [];
	  }
	  if(rowArray.length > 0){
		/****************读取第一行第一列作为输出的标题头 start***************************** */
		var columnDataFieldArray = rowArray[0].workRecordColList;//读取第一行的列数据作为标题列
		if(!$.isArray(columnDataFieldArray)){columnDataFieldArray = [];}
		for(var columnI=0; columnI<columnDataFieldArray.length; columnI++){
		   titleArray.push(columnDataFieldArray[columnI].colName);
		}
		/****************读取第一行第一列作为输出的标题头 end***************************** */

		/****************循环行和列输出 start***************************** */
		for(var rowI=0; rowI<rowArray.length; rowI++){
		   var rowData = $.extend(true,{},rowArray[rowI]);
		   rowObject[rowI] = {
			  id:workrecordId+'-'+rowI,
			  field:[],
			  data:rowData,
		   };
		   var colArray = rowData.workRecordColList;
		   if(!$.isArray(colArray)){colArray = [];}
		   var currentRowArray = [
			  {
				 id:'rowNo-'+rowI,
				 type:'text',
				 readonly:true,
				 value:rowData.rowNo,
				 //label:'序号',
				 width:'3%',
				 formSource:'staticData',
			  },{
				 id:'workName-'+rowI,
				 type:'text',
				 readonly:true,
				 value:rowData.workName,
				 //label:'确认事项',
				 formSource:'staticData',
				 width:'90%',
			  }
		   ];
		   for(var colI=0; colI<colArray.length; colI++){
			  var colData = colArray[colI];
			  var needInput = Number(colData.needInput);
			  var isEditMode = needInput == 0 ? true : false;//值为0不可编辑，值为1可编辑
			  var dataDefine = typeof(colData.dataDefine)=='string' ? colData.dataDefine : '';
			  var valueId = 'value-'+rowI+'-'+colI;
			  var valueJson = {
				 type:'text',
				 readonly:isEditMode,
				 value:typeof(colData.data)=='undefined' ? '' : colData.data,
			  };
			  if(dataDefine){
				 valueJson = JSON.parse(dataDefine);
				 valueJson.readonly = isEditMode;
				 if(typeof(valueJson.value)=='undefined'){
					valueJson.value = typeof(colData.data)=='undefined' ? '' : colData.data;
				 }
			  }
			  valueJson.id = 'id-'+colData.workMethodColId,
			  valueJson.label = colData.colName;
			  if(!isEditMode){
				 //当前类型为可编辑的时候绑定commonChangeHandler事件
				 valueJson.commonChangeHandler = function(_vueData){
					//var formID = _vueData.config.formID;
					//var templatePackageName = _vueData.config.package;
					//var _templateConfig = NetstarTemplate.templates.configs[templatePackageName];
				 }
			  }
			  switch(valueJson.type){
				  case 'select':
					valueJson.type = 'radio';
					break;
				case 'select2':
					if(valueJson.multiple){
						valueJson.type = 'checkbox';
					}else{
						valueJson.type = 'radio';
					}
					break;
			  }
			  if(valueJson.ajaxConfig){
				  valueJson.url = valueJson.ajaxConfig.url;
				  valueJson.contentType = valueJson.ajaxConfig.contentType;
				  valueJson.dataSrc = valueJson.ajaxConfig.dataSrc;
				  valueJson.method = valueJson.ajaxConfig.type;
			  }
			  currentRowArray.push(valueJson);
		   }
		   rowObject[rowI].field = currentRowArray;
		}
		/****************循环行和列输出 end***************************** */
		for(var rowId in rowObject){
		   var rowVo = rowObject[rowId];
		   $('#'+workrecordId).append('<div id="'+rowVo.id+'" class="component-workrecord" pt-displaymode="list"></div>');
		}
		for(var rowId in rowObject){
		   var rowVo = rowObject[rowId];
		   var formConfig = {
			  id: rowVo.id,
			  formStyle: 'pt-form-workrecordsimple',
			  plusClass: 'pt-custom-workrecordsimple',
			  formSource:'inlineScreen',
			  form: rowVo.field,
		   };
		   nsForm.init(formConfig);
		}
		templateConfig.workrecordObject = rowObject;
	 }else{
		console.warn('返回数据为空');
	 }
	}
	function initBlockList(_config){
		var gridAjaxConfig = $.extend(true,{},_config.mainComponent.ajax);
		if(!$.isEmptyObject(_config.pageParam)){
			if(!$.isEmptyObject(gridAjaxConfig.data)){
				gridAjaxConfig.data = NetStarUtils.getFormatParameterJSON(gridAjaxConfig.data,_config.pageParam);
			}else{
				gridAjaxConfig.data = _config.pageParam;
			}
		}
		gridAjaxConfig.plusData = {
			packageName:_config.package,
			templateId:_config.id
		};
		NetStarUtils.ajax(gridAjaxConfig,function(res,ajaxPlusData){
			if(res.success){
				var resData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : {};
				NetStarUtils.deleteAllObjectState(resData);//删除服务端返回的数据状态
				var templateConfig = NetstarTemplate.templates.configs[ajaxPlusData.plusData.packageName];
				templateConfig.serverDataByList = resData;//服务端返回的原始数据
				templateConfig.pageDataByList = NetStarUtils.deepCopy(resData);//克隆服务端返回的原始数据
				setWorkRecordRowData(templateConfig.pageDataByList,templateConfig);
			}else{
				var msg = res.msg ? res.msg : '返回值false';
				nsalert(msg,'error');
			}
		},true);
	}
	function initContainer(_config){
		if($('container .workrecordsimplemobile').length > 0){
			$('container .workrecordsimplemobile').remove();
		}
		var containerHtml = '<div class="row layout-planes workrecordsimplemobile" id="'+_config.id+'" ns-package="'+_config.package+'"></div>';
		nsTemplate.appendHtml(containerHtml);//输出容器
		var $container = $('#'+_config.id);
		var voTitle = _config.voComponent.title ? _config.voComponent.title : '作业内容';
		var listTitle = _config.mainComponent.title ? _config.mainComponent.title : '确认事项';
		var html = '<div class="col-xs-12 col-sm-12 nspanel" nstype="tab">'
						+'<div class="layout-main">'
							+'<ul class="nav nav-tabs nav-tabs-line" id="'+_config.tabConfig.id+'">'
								+'<li class="active" ns-componentId="'+_config.voComponent.id+'">'
									+'<a href="#'+_config.voComponent.id+'" data-toggle="tab">'+voTitle+'</a>'
								+'</li>'
								+'<li class="" ns-componentId="'+_config.mainComponent.id+'">'
									+'<a href="#'+_config.mainComponent.id+'" data-toggle="tab">'+listTitle+'</a>'
								+'</li>'
							+'</ul>'
						+'</div>'
					+'</div>'
					+'<div class="nspanel-container col-xs-12 col-sm-12 nspanel">'
						+'<div id="'+_config.voComponent.id+'" component-type="vo"></div>'
						+'<div id="'+_config.mainComponent.id+'" component-type="blocklist" class="hide"></div>'
					+'</div>';
		if(!_config.readonly){
			html += '<footer>'
						+'<div class="btn-group nav-form" id="'+_config.voBtnComponent.id+'" ns-operatorid="'+_config.voComponent.id+'" ns-package="'+_config.package+'"></div>'
						+'<div class="btn-group nav-form hide" id="'+_config.mainBtnComponent.id+'" ns-operatorid="'+_config.mainComponent.id+'" ns-package="'+_config.package+'"></div>'
					+'</footer>';
		}
		$container.html(html);
		_config.tabConfig.activeId = _config.voComponent.id;
		$('#'+_config.tabConfig.id+' >li').on('click',function(ev){
			var $li = $(this);
			var panelId = $li.attr('ns-componentid');
			var $panel = $('div[id="'+panelId+'"]');
			$panel.removeClass('hide');
			$('div[ns-operatorid="'+panelId+'"]').removeClass('hide');
			$panel.siblings().addClass('hide');
			$('div[ns-operatorid="'+panelId+'"]').siblings().addClass('hide');
			var templateConfig = NetstarTemplate.templates.configs[$('div[ns-operatorid="'+panelId+'"]').attr('ns-package')];
			templateConfig.tabConfig.activeId = panelId;
		});
		initVo(_config);
		initBlockList(_config);
		initBtn(_config);
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
						}
						_config.mainComponent = componentData;
					}else{
						componentData.isAjax = false;
						_config.tabConfig.listConfig[componentData.id] = componentData;
					}
					break;
				case 'vo':
					if(componentKeyField == 'root'){
						_config.voComponent = componentData;
					}
					break;
				case 'btns':
					if(componentData.operatorObject == 'vo'){
						_config.voBtnComponent = componentData;
					}else{
						_config.mainBtnComponent = componentData;
					}
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
	}
	//设置默认值
	function setDefault(_config){
		//当前模板 vo和list两个单独的ajax请求获取到服务端返回数据
		var defaultParams = {
			componentsConfig:{},
			treeComponent:{},
			mainComponent:{},
			voComponent:{},
			mainBtnArray:[],
			mainBtnComponent:{},
			voBtnComponent:{},
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
			readonly:false,
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
		_config.serverData = {};
		_config.serverDataByVo = {};
		_config.serverDataByList = {};
		_config.pageDataByList = {};
		_config.mainBtnArray = [];
		_config.mode = '';
		_config.idFieldsNames = {
			'root':'id',
			'root.workRecordRowList':'workMethodRowId',
			'root.workRecordRowList.workRecordColList':'workMethodColId'
		};
	}
	function init(_config){
		if(typeof(NetstarTemplate.templates[_config.template].data)=='undefined'){
			NetstarTemplate.templates[_config.template].data = {};  
		}
		var originalConfig = $.extend(true,{},_config);//保存原始值
		//记录config
		NetstarTemplate.templates[_config.template].data[_config.id] = {
			original:originalConfig,
			config:_config
		};
		setDefault(_config);
		setComponentDataByConfig(_config);//根据配置参数的定义存储组件配置的定义
		_config.idFieldsNamesByVo = {root:_config.voComponent.id};
		initContainer(_config);//初始化输出容器面板
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