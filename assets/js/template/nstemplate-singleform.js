/****
***表单表格模板包含form，table,button(导航上显示的按钮)
****
********/
/******************** 表单表格模板 start ***********************/
nsTemplate.templates.singleForm = (function(){
	function templateInit(){
		nsTemplate.templates.singleForm.data = {};  
		/* 保存在该对象上的数据分为四个：
		 * config(运行时参数)，
		 * original（原始配置参数）
		 */
	}
	var config = {};
	var templateData = {};
	var newFormFieldArray = [];//form表单数组值
	var customerComponentObj = {};//自定义组件如快速录入 ，增查删改一体等组件
	var currentDataObject = {
		objectState:NSSAVEDATAFLAG.NULL
	};//所有业务对象 保存类型为object
	//弹框调用前置方法
	function dialogBeforeHandler($btn){
		var data = $btn;
		data.value = currentDataObject;
		data.btnOptionsConfig = {
			descritute:{keyField:config.form.keyField,idField:config.form.idField}
		}
		data.containerFormJson = {};
		var formId;
		var allParamData = {
			mainList:currentDataObject,
			mainVo:currentDataObject,
		};//如果是自定义整体传参 mainList mainForm  searchForm  mainVo
		if($btn[0]){
			//外部按钮
			var navId = $btn.closest('.nav-form').attr('id');
			formId = navId.substring(0,navId.lastIndexOf('-'))+'-customerform';
		}else{
			formId = data.tableId.substring(data.tableId.indexOf('-')+1,data.tableId.length)+'-customerform';
		}
		if($('#'+formId).length > 0){
			//存在form
			data.containerFormJson = nsTemplate.getChargeDataByForm(formId);
			allParamData.mainForm = data.containerFormJson;
		}
		//sjj20181029  ajaxDataParamSource
		if(typeof(data.controllerObj.ajaxDataParamSource)=='string'){
			if(data.controllerObj.ajaxDataParamSource == 'all'){
				allParamData.searchForm = nsTemplate.getChargeDataByForm(config.fullFormId);
				data.value = allParamData;
			}
		}
		return data;
	}
	//弹框ajax保存前置方法
	function ajaxBeforeHandler(handlerObj){
		handlerObj.config = config;
		handlerObj.ajaxConfigOptions = {
			idField:config.form.idField,
			keyField:config.form.keyField,
			pageParam:config.pageParam,
			parentObj:config.parentObj
		};
		return handlerObj;
	}
	//弹框ajax保存后置方法
	function ajaxAfterHandler(data){
		return data;
	}
	//弹框初始化加载界面
	function loadPageHandler(data){
		return data;
	}
	//关闭弹框界面
	function closePageHandler($btn){
		/*
			*$btn 行内按钮和外部按钮
			    *外部按钮是个dom对象元素
			    *行内按钮是object对象（应用在table行按钮）
		*/
		var data = $btn;
		var isOuterBtn = false;//是否外部按钮
		var templateId = '';//模板id
		if($btn[0]){
			//外部按钮
			isOuterBtn = true;
		}
		if(isOuterBtn){
			var layoutId = $btn.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.singleForm.data[layoutId].config;
		}else{
			var layoutId = $btn.obj.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.singleForm.data[layoutId].config;
		}
		if(config.isReadAjax){
			refreshInitAjaxData();
		}
	}
	var optionConfig = {
		dialogBeforeHandler:dialogBeforeHandler,
		ajaxBeforeHandler:ajaxBeforeHandler,
		ajaxAfterHandler:ajaxAfterHandler,
		loadPageHandler:loadPageHandler,
		closePageHandler:closePageHandler
	}
	//初始化方法
	function init(_config){
		config = _config;
		//第一次执行初始化模板
		if(typeof(nsTemplate.templates.singleForm.data)=='undefined'){
			templateInit();
		}
		//记录config
		nsTemplate.templates.singleForm.data[config.id] = {
			original:$.extend(true,{},config),
			config:config
		}

		//sjj20181023  crm手机端模板页
		if(config.mode == 'form-column'){
			formColumnInit(config);
			return false;
		}
		templateData = nsTemplate.templates.singleForm.data[config.id];
		//验证
		function configValidate(){
			var isValid = true;
			var validArr = 
			[
				['form','object',true],						//form表单的配置
			];
			isValid = nsDebuger.validOptions(validArr,config);
			if(isValid == false){return false;}
			isValid = nsTemplate.validConfigByForm(config.form);
			if(isValid == false){return false;}
			return isValid;
		}
		if(debugerMode){
			if(!configValidate()){
		 		return false;
		 	}
		}
		var templateSingleFormObj = eval(config.package + '={}'); //包名转换
		//刷新默认值
		function refreshInitAjaxData(){
			var pageParamObject = $.extend(true,{},config.pageParam);//界面跳转拿到的值
			var defaultAjax = $.extend(true,{},config.getValueAjax);//读取默认的配置
			var listAjax = nsVals.getAjaxConfig(defaultAjax,{},{idField:config.form.idField,keyField:config.form.keyField,pageParam:pageParamObject,parentObj:config.parentObj});
			nsVals.ajax(listAjax, function(res){
				if(res.success){
					currentDataObject = res[config.getValueAjax.dataSrc];  		//数组对象
					currentDataObject.objectState = NSSAVEDATAFLAG.EDIT;
					//给当前检索值赋值
					var formData = {};
					for(var formI=0; formI<newFormFieldArray.length; formI++){
						formData[newFormFieldArray[formI].id] = currentDataObject[newFormFieldArray[formI].id];
					}
					nsForm.fillValues(formData,config.fullFormId);
					// lyw 20181217 完成后回调
					if(typeof(config.completeHandler)=='function'){
						config.completeHandler(config);
					}
				}
			},true)
		}
		//刷新保存数据
		function refreshSaveDataAjax(data){
			currentDataObject = data;
			nsForm.fillValues(currentDataObject,config.fullFormId);
		}
		//调用保存ajax
		function getSaveDataAjax(){
			var formJson = nsTemplate.getChargeDataByForm(config.fullFormId);//读取form数据并验证
			if(formJson){
				//验证通过继续执行
				//不用直接作为搜索条件需要转换一下key value
				var wholeParameterData = $.extend(true,currentDataObject,formJson);
				var listAjax = nsVals.getAjaxConfig(config.saveData.ajax,wholeParameterData,{parentObj:config.parentObj,keyField:config.form.keyField,idField:config.form.idField,pageParam:config.pageParam});
				nsVals.ajax(listAjax, function(res){
					//保存ajax成功执行之后的操作
					nsalert('保存成功');
					var isCloseWindow = config.saveData.ajax.isCloseWindow; // lyw 关闭窗口 20180711
					if(isCloseWindow){
						nsFrame.popPageClose(); 
					}
					refreshSaveDataAjax(res[config.saveData.ajax.dataSrc]);
				});
			}
		}

		//自定义组件
		function serviceComponentInit(){
			for(var customer in customerComponentObj){
				customerComponentObj[customer].init(customerComponentObj[customer],nsQuicktyCompleteHandler);
			}
		}

		function formContainerEditSaveHandler(){}
		function formContainerSaveHandler(){}
		//快速录入组件完成回调事件
		function nsQuicktyCompleteHandler(data){
			console.log(data)
		}
		function formContainerAddHandler(){
			var addDialogId = 'add-'+config.fullFormId+'-dialog';
			//弹框确认保存事件
			function addFormDialogConfirmHandler(){
				var inputData = nsTemplate.getChargeDataByForm(addDialogId);//获取form数据
				if(inputData===false){return;}//验证不通过直接return
				var addData = $.extend(true,{},inputData);//行数据和修改的合并，已修改后的为准
				inputData.objectState = NSSAVEDATAFLAG.ADD;
				//getSaveDataAjax();
				nsdialog.hide();//关闭弹框
			}
			var addFieldArray = $.extend(true,[],config.form.add.field);
			var addDialog = {
				id: addDialogId,
				title: config.form.add.title,
				size: 'm',
				form: addFieldArray,
				btns: 
				[
					{
						text: '确认',
						handler: function(){
							addFormDialogConfirmHandler();
						}
					}
				]
			}
			addDialog.isValidSave = true;
			nsdialog.initShow(addDialog);//弹框调用
		}
		function formContainerEditHandler(){
			var editFieldArray = $.extend(true,[],config.form.edit.field);
			var editDialogId = 'edit-'+config.fullFormId+'-dialog';
			function editFormDialog(){
				//赋默认值
				//弹框确认保存事件
				function editDialogConfirmHandler(){
					var inputData = nsTemplate.getChargeDataByForm(editDialogId);//获取form数据
					if(inputData===false){return;}//验证不通过直接return
					inputData.objectState = NSSAVEDATAFLAG.EDIT;//当前操作标识是修改
					nsdialog.hide();//关闭弹框
				}
				var editDialog = {
					id: editDialogId,
					title: config.form.edit.title,
					size: 'm',
					form: editFieldArray,
					btns: 
					[
						{
							text: '确认',
							handler: function(){
								editDialogConfirmHandler();
							}
						}
					]
				}
				editDialog.isValidSave = true;
				nsdialog.initShow(editDialog);//弹框调用
			}
			editFormDialog();//调用弹框执行
		}
		function formContainerDelHandler(){
			var delFieldArray = $.extend(true,[],config.form.delete.field);
			var delDialogId = 'del-'+config.fullFormId+'-dialog';
			function delFormDialog(){
				//赋默认值
				//弹框确认保存事件
				function delDialogConfirmHandler(){
					var inputData = nsTemplate.getChargeDataByForm(delDialogId);//获取form数据
					if(inputData===false){return;}//验证不通过直接return
					var delRowData = $.extend(true,{},inputData);
					delRowData.objectState = NSSAVEDATAFLAG.DELETE;
					nsdialog.hide();//关闭弹框
				}
				var delDialog = {
					id: delDialogId,
					title: config.form.delete.title,
					size: 'm',
					form: delFieldArray,
					btns: 
					[
						{
							text: '确认',
							handler: function(){
								delDialogConfirmHandler();
							}
						}
					]
				}
				delDialog.isValidSave = true;
				nsdialog.initShow(delDialog);//弹框调用
			}
			delFormDialog();//调用弹框执行
		}
		function formContainerConfirmDelHandler(){
			var delText = config.form.delete.field;
			var contentStr = delText;
			contentStr = nsVals.getTextByFieldFlag(contentStr,currentDataObject);
			nsConfirm(contentStr,delConfirmHandler);//弹出删除提示框
			function delConfirmHandler(result){
				//删除事件触发
				if(result){
					//如果为真则是确认事件
					
				}
			}
		}
		//设置默认值
		function setDefault(){
			//layout的默认配置参数
			config = nsTemplate.setDefaultByTemplate(config);//默认值设置
			var layoutConfig = {
				formId:									'form',
				fullFormId:								config.id+'-'+'form',
				fullTitleId:							config.id+'-templateTitle',
			}
			nsVals.setDefaultValues(config,layoutConfig);
			config.form = nsTemplate.setDefaultByForm(config.form,optionConfig);
			config.isReadAjax = true;//默认支持读取ajax
			if($.isEmptyObject(config.getValueAjax)){
				//如果没有给默认读值的ajax
				config.isReadAjax = false;
			}
		}
		//form字段值处理
		//form组件改变值回调方法
		function formCommonChangeHandler(runObj){
			//如果定义了返回事件
			currentDataObject[runObj.id] = runObj.value;
		}
		function filterFormFieldData(){
			//form数据
			var formFieldArray = config.form.field;
			newFormFieldArray = $.extend(true,[],formFieldArray);
			if(config.form.title){
				//title不为空
				var titleObject = {
					element:'label',
					label:config.form.title
				}
				newFormFieldArray.splice(0,0,titleObject);//把标题放在第一个
			}
			for(var formI=0; formI<newFormFieldArray.length; formI++){
				newFormFieldArray[formI].commonChangeHandler = formCommonChangeHandler;
			}
			/***********获取主id的字段值和数据来源 start*****************/
			/***********获取主id的字段值和数据来源 end*****************/
			templateSingleFormObj.formJson = {
				isUserControl:			config.form.isUserControl,//是否开启用户自定义配置
				isUserContidion:		config.form.isUserContidion,//是否查看筛选条件
				form:					newFormFieldArray
			};
			//form container容器面板
			var btnArray = $.extend(true,[],config.form.btns);
			var formContainerArray = [];
			btnArray = nsTemplate.getBtnArrayByBtns(btnArray);//得到按钮值
			if(!$.isEmptyObject(config.saveData.save)){
				btnArray.unshift({
					text:config.saveData.save.text,
					handler:getSaveDataAjax
				})
			}

			var isSingleMode = true;
			if(config.form.add){
				var addStr = config.form.add.text ? config.form.add.text : '新增';
				if(typeof(config.form.add.isSingleMode)=='boolean'){isSingleMode = config.form.add.isSingleMode;}
				switch(config.form.add.type){
					case 'dialog':
						btnArray.unshift({
							text:addStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerAddHandler
						});
						break;
					case 'component':
						customerComponentObj[config.fullFormId] = {
							containerId:			'container-panel-'+config.id+'-'+config.formId,
							cId:					'control-btn-servicecomponent-'+config.fullFormId,
							data:					config.form.add.serviceComponent.data,
							init:					config.form.add.serviceComponent.init,
							componentType:			config.form.add.serviceComponent.type,
							source:					'form',
							operator:				'add',
						}
						break;
					case 'multi':
						formContainerArray = config.form.add.field;
						/*btnArray.unshift({
							text:addStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerSaveHandler
						})*/
						break;
				}
			}
			if(config.form.edit){
				var editStr = config.form.edit.text ? config.form.edit.text : '编辑';
				switch(config.form.edit.type){
					case 'dialog':
						btnArray.unshift({
							text:editStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerEditHandler
						});
						break;
					case 'component':
						customerComponentObj[config.fullFormId] = {
							containerId:			'container-panel-'+config.id+'-'+config.formId,
							cId:					'control-btn-servicecomponent-'+config.fullFormId,
							data:					config.form.edit.serviceComponent.data,
							init:					config.form.edit.serviceComponent.init,
							componentType:			config.form.edit.serviceComponent.type,
							source:					'form',
							operator:				'edit',
						}
						break;
					case 'multi':
						formContainerArray = config.form.edit.field;
						btnArray.unshift({
							text:editStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerEditSaveHandler
						})
						break;
				}
			}
			//delete
			if(config.form.delete){
				var delStr = config.form.delete.text ? config.form.delete.text : '删除';
				switch(config.form.delete.type){
					case 'dialog':
						btnArray.unshift({
							text:delStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerDelHandler
						});
						break;
					case 'confirm':
						btnArray.unshift({
							text:delStr,
							isReturn:true,
							isShowText:false,
							isShowIcon:true,
							handler:formContainerConfirmDelHandler
						});
						break;
				}
			}
			templateSingleFormObj['formContainer'] = {
				btns:btnArray,
				isSingleMode:isSingleMode
			}
			if(formContainerArray.length > 0){
				templateSingleFormObj['formContainer'].forms = formContainerArray;
			}
		}
		//读取html页面输出
		function getHtml(){
			var titleHtml = '';
			if(config.isShowTitle){
				//标题设置为显示
				titleHtml = '<panel ns-id="templateTitle"></panel>'; 
			}
			var isShowHistoryBtn = config.isShowHistoryBtn;
			var html = '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="templates:formTable,isShowHistoryBtn:'+isShowHistoryBtn+'">'
							+titleHtml
							+'<panel ns-id="'+config.formId+'" ns-options="col:12" ns-config="form:formJson" ns-container="formContainer"></panel>'
						+'</layout>';
			return html;
		}
		function initLayout(){
			function layoutAfterHandler(){
				serviceComponentInit();//调用自定义组件
				$('#'+config.fullTitleId).html('<div class="templateTitle">'+config.title+'</div>');
				//创建模板Json对象
				if(config.isReadAjax){
					refreshInitAjaxData();
				}else{
					currentDataObject = {objectState:NSSAVEDATAFLAG.ADD};
				}
			}
			nsLayout.init(config.id,{afterHandler:layoutAfterHandler});
		}
		setDefault();//默认值处理
		filterFormFieldData();//form值数据处理
		var html = getHtml();//获取html
		//围加根html
		html = nsTemplate.aroundRootHtml(html);
		//将html添加到页面
		nsTemplate.appendHtml(html);
		initLayout();
		
		// 模板回调 lyw 20181018 有getValueAjax时ajax完成过后回调 没有getValueAjax时初始化完成后回调
		if(typeof(config.getValueAjax)!='object'||$.isEmptyObject(config.getValueAjax)){
			if(typeof(config.completeHandler)=='function'){
				config.completeHandler(config);
			}
		}
	}
	//清空方法
	function clear(id){
		var config = nsTemplate.templates.singleForm.data[id].config;
		nsForm.clearData(config.fullFormId);
	}
	/**********sjj 20181023 针对手机版模式写form结构 start*****************************/
	function formColumnInit(configObj){
		var optionsConfig = {
			dialogBeforeHandler:function(_config){
				var valueJson = getCurrentData();
				_config.dialogParam = {
					value:valueJson,
					vo:{
						keyField:config.parentKeyField,
						idField:config.parentIdField
					}
				}
				_config.value = valueJson;
				return _config;
			},
			ajaxBeforeHandler:function(){},
			ajaxAfterHandler:function(){},
		}
		var config = $.extend(true,{},configObj);
		config.fullFormId = config.id +'-form';
		config.formJson = {};
		config.isExistPageParam = false;//是否存在页面传参默认不存在
		//页面传参接收到的格式{keyField:'',data:{},dataLevel:'',url:''}
		if(typeof(config.pageParam)=='undefined'){
			config.pageParam = {};
		}else if(!$.isEmptyObject(config.pageParam)){
			config.isExistPageParam = true;
		}
		//获取form的html
		function getFormHtml(){
			var formHtml = '';
			config.formJson = {};
			config.isCustomKeyField = false;//默认不指定显示的keyField
			if(config.isExistPageParam){
				//如果页面传参存在参数值 判断当前keyField是否存在，如果相等则显示对应的form反之则不显示
				if(config.pageParam.keyField){
					config.isCustomKeyField = true;
				}
			}
			for(var formI=0; formI<config.form.length; formI++){
				var formData = config.form[formI];
				var modeClassStr = 'form-mode-'+formData.type;
				var formId = config.id + '-form-'+formI;
				var btnId = formId + '-btns';
				formData.field.unshift({element:"label",label:formData.title});
				function getHtmlByPageParam(){
					switch(formData.type){
						case 'btn':
							var title = '新增'+formData.title;
							formHtml += '<div class="'+modeClassStr+'">'
											+'<button type="button" class="btn" isShow=true ns-type="add" ns-index="'+formI+'">'
												+'<i class="fa fa-plus"></i>'
												+'<span>'+title+'</span>'
												+'</button>'
												+'<button type="button" class="btn btn-delete" isShow=false ns-type="del">'
													+'<span>删除</span>'
												+'</button>'
											+'<div class="panel-form" id="'+formId+'" isShow="false"></div>'
										+'</div>';
							/*for(var fieldI=0; fieldI<formData.field.length; fieldI++){
								formData.field[fieldI].hidden = true;
							}*/
							break;
						case 'simple':
						default:
							formHtml = '<div class="'+modeClassStr+'">'
											+'<div class="panel-form" id="'+formId+'"></div>'
										+'</div>';
							break;
					}
					config.formJson[formId] = {
						obj:formData,
						data:{
							id:formId,
							form:formData.field,
							formSource:formData.formSource,
							type:formData.type,
							fieldMoreActtion:formData.fieldMoreActtion,
							fieldMoreTitle:formData.fieldMoreTitle
						}
					};
				}
				if(config.isCustomKeyField){
					//如果页面传参存在参数值 判断当前keyField是否存在，如果相等则显示对应的form反之则不显示
					if(config.pageParam.keyField.indexOf(formData.keyField)>-1){
						//当前表单的volis和页面传参对应的值相等
						getHtmlByPageParam();
					}
				}else{
					//不存在页面传参则全部显示
					getHtmlByPageParam();
				}
				if($.isArray(formData.btns)){
					//btn是个数组并且长度大于0
					if(formData.btns.length > 0){
						//主表中btns的处理
						nsTemplate.setBtnDataChargeHandler(formData.btns,optionsConfig);
						var btnsArray = $.extend(true,[],formData.btns);//克隆 
						btnsArray = nsTemplate.getBtnArrayByBtns(btnsArray);//得到按钮值
						config.formJson[formId].btnJson = {
							id:btnId,
							isShowTitle:false,
							btns:[btnsArray]
						};
						formHtml += '<div class="form-btns nav-form" id="'+btnId+'"></div>';
					}
				}
				//查找根vo
				if(formData.parentKeyField == undefined){
					config.parentKeyField = formData.keyField;
					config.parentIdField = formData.idField;
				}else if(formData.parentKeyField == ''){
					config.parentKeyField = formData.keyField;
					config.parentIdField = formData.idField;
				}
			}
			return formHtml;
		}
		//form分组按钮调用事件的触发
		function formBtnHandler(event){
			var $this = $(this);
			var formId = $this.parent().children('.panel-form').attr('id');
			var isShow = $this.attr('isShow');
			var type = $this.attr('ns-type');
			var hidden = true;
			if(isShow == 'true'){
				hidden = false;
			}
			$this.attr('isShow',hidden);
			$this.siblings().attr('isShow',!hidden);
			switch(type){
				case 'del':
					$("#"+formId).attr('isShow',hidden);
					break;
				case 'add':
					$("#"+formId).attr('isShow',!hidden);
					break;
			}
			/*switch(type){
				case 'del':
					hidden = true;
					break;
			}
			var fieldArray = $.extend(true,[],config.formJson[formId].data.form);
			for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
				fieldArray[fieldI].hidden = hidden;
			}
			nsForm.edit(fieldArray,formId);*/
		}
		function getCurrentData(){
			var formJsonData = false;
			var isAjax = true;
			for(var formId in config.formJson){
				var formJson = nsTemplate.getChargeDataByForm(formId);
				if(!formJson){
					isAjax = false;
					break;
				}
				var keyField = config.formJson[formId].obj.keyField;
				formJsonData[keyField] = formJson;
			}
			if(isAjax){
				formJsonData = nsTemplate.getVoListData(formJsonData,config.form);
			}
			return formJsonData;
		}
		//保存事件的触发
		function saveFormAjax(){
			//config.saveData.ajax
			formJsonData = getCurrentData();
			if(!formJsonData){
				return;
			}
			//console.log(formJsonData);
			var paramsJson = $.extend(true,{},formJsonData);
			var extraOptionsConfig = {};
			var saveAjax = $.extend(true,{},config.saveData.ajax);
			if(config.isExistPageParam){
				//存在通过跳转url链接传参 需要配置额外参数 上下级关系的
				extraOptionsConfig = {
					pageParam:config.pageParam.data,
					keyField:config.parentKeyField
				}
				if(typeof(config.pageParam.vo)=='object'){
					extraOptionsConfig.parentObj = {
						idField:config.pageParam.vo.idField,
						keyField:config.pageParam.vo.keyField
					}
				}
				saveAjax.dataLevel = config.pageParam.dataLevel;
			}
			var listAjax = nsVals.getAjaxConfig(saveAjax,paramsJson,extraOptionsConfig);
			listAjax.plusData = config.pageParam;
			console.log(listAjax)
			nsVals.ajax(listAjax, function(res,ajaxData){
				//保存ajax成功执行之后的操作
				if(res.success){
					var data = res.data;
					if(data){
						//返回成功并且存在值
						for(var formId in config.formJson){
							var keyField = config.formJson[formId].obj.keyField;
							var isRoot = false;
							//没有定义父节点vo,或者定义了空值都是根节点
							switch(typeof(config.formJson[formId].obj.parentKeyField)){
								case 'undefined':
									isRoot = true;
									break;
								case 'string':
									if(config.formJson[formId].obj.parentKeyField == ''){
										isRoot = true;
									}
							}
							if(!isRoot){
								nsForm.fillValues(data[keyField],formId);
							}else{
								nsForm.fillValues(data,formId);
							}
						}
					}
					if(typeof(ajaxData.plusData)=='object'){
						if(ajaxData.plusData.url){
							//存在跳转链接
							var jsonData = {
								dataLevel:'parent',//topage跳转关系parent,child,brothers
								data:res.data,//接受到的参数
								vo:{
									keyField:config.parentKeyField
								},//vo结构
							}
							var pageParam = JSON.stringify(jsonData);
							pageParam = encodeURIComponent(encodeURIComponent(pageParam));
							var url = ajaxData.plusData.url;
							if(url.indexOf('?')>0){
								var search = url.substring(url.indexOf('?'),url.length);
								url = url.substring(0,url.indexOf('?'));
								var params = search.slice(1).split('&');
								var resultStr = '';
								for (var i = 0; i < params.length; i++){
									var idx = params[i].indexOf('=');
									var name = params[i].substring(0, idx);
									var value = params[i].substring(idx + 1);
									if(i==0){resultStr += '?';}else{
										resultStr += '&';
									}
									if (idx > 0){
										resultStr = resultStr+name+'='+encodeURIComponent(encodeURIComponent(value));
									}
								}
								url = url + resultStr + '&templateparam='+pageParam;
							}else{
								url = url + '?templateparam='+pageParam;
							}
							nsFrame.loadPage(url);
						}else{
							nsalert('保存成功');
						}
					}else{
						nsalert('保存成功');
					}
				}else{
					nsalert('保存失败');
				}
			});
		}
		var contentHtml = getFormHtml();//获取form的html
		var navHtml = '';//导航按钮
		var navJson = {
			id:config.id+'-nav',
			btns:[],
			isShowTitle:false,
		};
		//存在保存配置的定义是否有nav按钮
		if(config.saveData){
			if(config.saveData.save){
				navHtml = '<div class="nav-form" id="'+navJson.id+'"></div>';
				var btnArray = {text:config.saveData.save.text,handler:saveFormAjax};
				navJson.btns = [[btnArray]]
			}
		}
		var html = '<div class="'+config.mode+'" id="'+config.fullFormId+'">'+navHtml+contentHtml+'</div>';
		html = nsTemplate.aroundRootHtml(html);//围加根html
		nsTemplate.appendHtml(html);//将html添加到页面
		//初始化formInit
		for(var form in config.formJson){
			nsForm.init(config.formJson[form].data);
			if(config.formJson[form].btnJson){
				nsNav.init(config.formJson[form].btnJson);
			}
		}
		if(!$.isEmptyObject(config.getValueAjax)){
			var pageParamObject = $.extend(true,{},config.pageParam.data);//界面跳转拿到的值
			var defaultAjax = $.extend(true,{},config.getValueAjax);//读取默认的配置
			var listAjax = nsVals.getAjaxConfig(defaultAjax,{},{idField:config.form.idField,keyField:config.form.keyField,pageParam:pageParamObject,parentObj:config.parentObj});
			nsVals.ajax(listAjax, function(res){
				if(res.success){
					for(var formId in config.formJson){
						var keyField = config.formJson[formId].obj.keyField;
						var isRoot = false;
						//没有定义父节点vo,或者定义了空值都是根节点
						switch(typeof(config.formJson[formId].obj.parentKeyField)){
							case 'undefined':
								isRoot = true;
								break;
							case 'string':
								if(config.formJson[formId].obj.parentKeyField == ''){
									isRoot = true;
								}
						}
						if(!isRoot){
							nsForm.fillValues(data[keyField],formId);
						}else{
							nsForm.fillValues(data,formId);
						}
					}
				}
			},true)
		}
		//按钮存在初始化按钮
		if(navJson.btns.length > 0){nsNav.init(navJson);}
		var $container = $('#'+config.fullFormId);//获取容器
		var $button = $container.children('.form-mode-btn').find('button[type="button"]');//获取按钮容器
		$button.off('click',formBtnHandler);
		$button.on('click',formBtnHandler);
	}
	/**********sjj 20181023 针对手机版模式写form结构 end*****************************/
	return {
		init:								init,							//模板初始化调用
		dialogBeforeHandler:				dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:					ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:					ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:					loadPageHandler,				//弹框初始化加载方法
		closePageHandler:					closePageHandler,				//弹框关闭方法
	}
})(jQuery)
/******************** 表单表格模板 end ***********************/