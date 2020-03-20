/****
***表单表格模板包含form，table,button(导航上显示的按钮)
****
********/
/******************** 表单表格模板 start ***********************/
nsTemplate.templates.mobileForm = (function(){
	function templateInit(){
		nsTemplate.templates.mobileForm.data = {};  
		/* 保存在该对象上的数据分为四个：
		 * config(运行时参数)，
		 * original（原始配置参数）
		 */
	}
	var config = {};
	var serverData = {};
	//初始化方法
	function init(_config){
		config = _config;
		//第一次执行初始化模板
		if(typeof(nsTemplate.templates.mobileForm.data)=='undefined'){
			templateInit();
		}
		//记录config
		nsTemplate.templates.mobileForm.data[config.id] = {
			original:$.extend(true,{},config),
			config:config
		}
		//sjj20181023  crm手机端模板页
		formColumnInit(config);
	}
	//清空方法
	function clear(id){
		var config = nsTemplate.templates.mobileForm.data[id].config;
		nsForm.clearData(config.fullFormId);
	}

	/**********sjj 20181023 针对手机版模式写form结构 start*****************************/
	function formColumnInit(configObj){
		var optionsConfig = {
			source:"form",
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
				_config.config = config;
				return _config;
			},
			ajaxBeforeHandler:function(data){return data;},
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
		if(config.activityId){config.pageParam.activityId = config.activityId;}
		if(config.processId){config.pageParam.processId = config.processId;}
		if(config.processName){config.pageParam.processName = config.processName;}
		var isWholeReadonly = false;
		if(config.pageParam.data){
			isWholeReadonly = typeof(config.pageParam.data.readonly) == 'boolean' ?config.pageParam.data.readonly:false;
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
				nsTemplate.setFieldHide('form',formData.field,formData.hide);
				var modeClassStr = 'form-mode-'+formData.type;
				var formId = config.id + '-form-'+formI;
				formData.field.unshift({element:"label",label:formData.title});
				for(var fieldI=0; fieldI<formData.field.length; fieldI++){
					formData.field[fieldI].readonly = isWholeReadonly;
					formData.field[fieldI].acts = 'formlabel';
					if(formData.field[fieldI].type == 'date'){
						formData.field[fieldI].acts = 'date-label';
					}else if(formData.field[fieldI].type == 'datetime'){
						formData.field[fieldI].acts = 'datetime-label';
					}
				}
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
			var isAjax = false;
			for(var formId in config.formJson){
				var isMergeData = true;//合并值
				var isEXpandNode = $('#'+formId).attr('isshow');
				if(isEXpandNode == 'false'){
					isMergeData = false;
				}
				if(isMergeData == false){
					
				}else{
					var formJson = nsTemplate.getChargeDataByForm(formId);
					if(!formJson){
						isAjax = false;
						formJsonData = false;
						break;
					}
					var keyField = config.formJson[formId].obj.keyField;
					if(typeof(keyField)=='undefined'){
						formJsonData = $.extend(true,{},formJsonData,formJson);
					}else{
						formJsonData[keyField] = [formJson];
					}
				}
			}
			if(isAjax){
				if(config.form.length > 1){
					formJsonData = nsTemplate.getVoListData(formJsonData,config.form);
				}
			}
			return formJsonData;
		}
		//保存事件的触发
		function saveFormAjax(){
			//config.saveData.ajax
			var formJsonData = getCurrentData();
			if(!formJsonData){
				return;
			}
			//console.log(formJsonData);
			var paramsJson = $.extend(true,{},config.pageParam.data);
			if(formJsonData[config.parentIdField] == ''){
				delete formJsonData[config.parentIdField];
			}
			nsVals.extendJSON(paramsJson,formJsonData);
			var extraOptionsConfig = {idField:config.parentIdField,keyField:config.parentKeyField};
			var saveAjax = $.extend(true,{},config.saveData.ajax);
			//saveAjax.dataLevel = 'noone';
			if(config.isExistPageParam){
				if(paramsJson.editorType == 'add'){
					delete paramsJson[config.parentIdField];
					delete paramsJson.editorType;
				}
				//存在通过跳转url链接传参 需要配置额外参数 上下级关系的
				/*extraOptionsConfig = {
					pageParam:config.pageParam.data,
					keyField:config.parentKeyField
				}
				if(typeof(config.pageParam.vo)=='object'){
					extraOptionsConfig.parentObj = {
						idField:config.pageParam.vo.idField,
						keyField:config.pageParam.vo.keyField
					}
				}*/
				if(config.pageParam.dataLevel){
					saveAjax.dataLevel = config.pageParam.dataLevel;
				}
			}
			var idFieldNames = {root:config.parentIdField};
			paramsJson = nsServerTools.getObjectStateData(serverData,paramsJson,idFieldNames);
			if(config.isExistPageParam){
				delete paramsJson.readonly;
				if(config.pageParam.data.editorType == 'add'){
					paramsJson.objectState =1;
					for(var serverValue in paramsJson){
						if(typeof(paramsJson[serverValue])=='object'){
							delete paramsJson[serverValue];
						}
					}
				}
			}
			$('#'+config.id+'-savebtn button[type="button"]').attr('disabled',true);
			var listAjax = nsVals.getAjaxConfig(saveAjax,paramsJson,extraOptionsConfig);
			listAjax.plusData = config.pageParam;
			nsVals.ajax(listAjax, function(res,ajaxData){
				$('#'+config.id+'-savebtn button[type="button"]').removeAttr('disabled');
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
							/*if(url.indexOf('?')>0){
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
							}*/
							nsFrame.cacheUrlVRouter.counter--;
							var $backPageContainer = nsFrame.cacheUrlVRouter.container[nsFrame.cacheUrlVRouter.counter];
							$backPageContainer.children('nstemplate').remove();
							$('container').remove();
							$('body').append($backPageContainer);
							//nsFrame.loadPage(url);
						}else{
							nsalert('保存成功');
						}
					}else{
						nsalert('保存成功');
					}
				}else{
					nsalert('保存失败');
				}
			},true);
		}
		var contentHtml = getFormHtml();//获取form的html
		//存在保存配置的定义是否有nav按钮
		var formBtnArray = [];
		var btnHtml = '';
		if($.isArray(config.btns)){
			//btn是个数组并且长度大于0
			if(config.btns.length > 0){
				//主表中btns的处理
				nsTemplate.setBtnDataChargeHandler(config.btns,optionsConfig);
				var btnsArray = $.extend(true,[],config.btns);//克隆 
				btnsArray = nsTemplate.getBtnArrayByBtns(btnsArray);//得到按钮值
				formBtnArray = btnsArray;
				btnHtml = '<div class="form-save-btn nav-form" id="'+config.id+'-btns"></div>';
			}
		}
		var navHtml = '';
		var navBtnArray = [];
		if(config.saveData && !isWholeReadonly){
			if(config.saveData.save){
				navBtnArray.push({text:config.saveData.save.text,handler:saveFormAjax});
				navHtml = '<div class="form-save-btn nav-form" id="'+config.id+'-savebtn"></div>';
			}
		}
		var html = '<div class="form-column" id="'+config.fullFormId+'">'+contentHtml+btnHtml+navHtml+'</div>';
		html = nsTemplate.aroundRootHtml(html);//围加根html
		nsTemplate.appendHtml(html);//将html添加到页面
		if(!$.isEmptyObject(config.getValueAjax)){
			var pageParamObject = $.extend(true,{},config.pageParam.data);//界面跳转拿到的值
			if(pageParamObject.editorType){
				delete pageParamObject.editorType;
			}
			delete pageParamObject.readonly;
			var defaultAjax = $.extend(true,{},config.getValueAjax);//读取默认的配置
			var listAjax = nsVals.getAjaxConfig(defaultAjax,{},{idField:config.parentIdField,keyField:config.parentKeyField,pageParam:pageParamObject,parentObj:config.parentObj});
			nsVals.ajax(listAjax, function(res){
				if(res.success){
					var data = res.data;
					if(config.pageParam.data){
						if(config.pageParam.data.editorType == 'add'){
							delete data[config.parentIdField];
						}
					}
					delete data.objectState;
					serverData = data;
					for(var formId in config.formJson){
						var keyField = config.formJson[formId].obj.keyField;
						var isRoot = false;
						var fieldArray = config.formJson[formId].data.form;
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
						for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
							if(isRoot){
								fieldArray[fieldI].value = data[fieldArray[fieldI].id];
							}else{
								fieldArray[fieldI].value = data[keyField][fieldArray[fieldI].id];
							}
						}
						/*if(!isRoot){
							nsForm.fillValues(data[keyField],formId);
						}else{
							nsForm.fillValues(data,formId);
						}*/
						nsForm.init(config.formJson[formId].data);
					}
				}
			},true)
		}else{
			//初始化formInit
			for(var form in config.formJson){
				nsForm.init(config.formJson[form].data);
			}
		}
		//按钮存在初始化按钮
		if(formBtnArray.length > 0){
			var navJson = {
				id:config.id+'-btns',
				btns:[formBtnArray],
				isShowTitle:false,
			};
			nsNav.init(navJson);
		}
		if(navBtnArray.length > 0){
			var navJson = {
				id:config.id+'-savebtn',
				btns:[navBtnArray],
				isShowTitle:false,
			};
			nsNav.init(navJson);
		}
		var $container = $('#'+config.fullFormId);//获取容器
		var $button = $container.children('.form-mode-btn').find('button[type="button"]');//获取按钮容器
		$button.off('click',formBtnHandler);
		$button.on('click',formBtnHandler);
	}
	/**********sjj 20181023 针对手机版模式写form结构 end*****************************/
	return {
		init:								init,							//模板初始化调用
	}
})(jQuery)
/******************** 表单表格模板 end ***********************/