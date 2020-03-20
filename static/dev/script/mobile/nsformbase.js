var nsFormBase = {};
nsFormBase.data = {};
nsFormBase.form = {};
nsFormBase.formInfo = {};
//设置默认值
nsFormBase.setDefault = function(formJson){
	if(typeof(formJson.formSize)!='string'){
		formJson.formSize = '';
	}
	//来源类型默认为form  其它包含dialog(modal)
	if(typeof(formJson.formSource)!='string'){
		formJson.formSource = 'form';
	}
	//默认的发送方法是get
	if(typeof(formJson.formMethod)!='string'){
		formJson.formMethod = 'get';
	}
	return formJson;
}
//获取表单的HTML和数据对象
//return {html,data}
nsFormBase.initData = function(formJson){
	if(debugerMode){
		//form必须是数组
		if($.isArray(formJson.form)==false){
			console.error('配置参数不包含form数组')
			console.error(formJson);
			return false;
		}
		//ID必有
		if(typeof(formJson.id)=='undefined'){
			console.error('配置参数必须指定id');
			console.error(formJson);
			return false;
		}
	}
	formJson = nsFormBase.setDefault(formJson);
	var html = '';
	var data = {
		validateArr:[], //验证组件是必然有的，所以先初始化了
		moreFieldArr:[],//sjj20180919 是否存在展示更多的字段
		moreFields:{}, // 更多字段以type为key值生成的对像 用于移动端更多字段生成表单时表单方法初始化调用 lyw20181105
		fieldById : {}, // lyw 20190410 根据id生成对象 
	}

	formJson.component = {}; //储存组件信息
	var isSetMoreBtn = false; // 是否已经设置了更多
	function componentInit(config){
		//是否存在field-more sjj 20180919
		if(config.mindjetFieldPosition == 'field-more'){
			// 半屏/全屏/行内 不隐藏字段
			if(formJson.formSource != 'halfScreen'&&formJson.formSource != 'fullScreen'&&formJson.formSource != 'inlineScreen'&&formJson.formSource != 'staticData'){
				config.hidden = true;
			}
			data.moreFieldArr.push(config);//保存field-more的字段属性
		}
		//兼容老版本不规范的命名 以及处理特殊情况
		config = nsComponent.setIrregularCharge(config,formJson);
		config = nsComponent.setDefault(config, formJson); //设置默认值
		if(config.mindjetFieldPosition == 'field-more'){
			switch(formJson.formSource){
				case 'halfScreen':  // 半屏
					if(!isSetMoreBtn){
						html += '<div class="form-td more">'
								+ '<div class="form-group">'
									+ '<label class="control-label radio-label" for="form-more">'
										+ '更多'
									+ '</label>'
								+ '</div>'
							+ '</div>'
						isSetMoreBtn = true;
					}
					break;
				case 'fullScreen':  // 全屏
					break;
				case 'inlineScreen':  	// 行内
					var value = typeof(config.value) == 'number' ? config.value.toString() : config.value;
					if(value.length>0){
						// 有value值时显示
						config.showState = 'form'; // 显示位置 form中
						html += nsComponent.getHTML(config, formJson);
					}else{
						config.showState = 'more'; // 显示位置
					}
					break;
				case 'staticData':    // 功能
					config.isOper = typeof(config.isOper)!='boolean'?true:config.isOper;
					if(!config.isOper){
						html += nsComponent.getHTML(config, formJson);
					}
					break;
				default:
					html += nsComponent.getHTML(config, formJson);
					break;
			}
		}else{
			html += nsComponent.getHTML(config, formJson);
		}
		
		//验证规则
		data.validateArr.push(config);
		// 通过类型对数据分组
		setDataGroupByType(config, data)
		//修改事件数组
		if(typeof(config.changeHandler)!='undefined'){
			//非text-btn类型的组件有函数，集中处理，以change为标准
			if(typeof(data.changeHandlerArr)=='undefined'){
				data.changeHandlerArr = [];
			}
			data.changeHandlerArr.push(config);
		}
	}
	//根据类型处理数据 通过类型对数据分组
	function setDataGroupByType(config, setObj){
		//处理数组型数据
		function setArrayData(arrConfig){
			if(typeof(setObj[arrConfig.type])=='undefined'){
				setObj[arrConfig.type] = [];
			}
			setObj[arrConfig.type].push(arrConfig);
		}
		//处理对象型数据 只能是以一个
		function setObjectData(objConfig){
			if(typeof(setObj[objConfig.type])=='undefined'){
				setObj[objConfig.type] = {};
			}
			setObj[objConfig.type][config.id] = objConfig;
		}
		//根据类型处理数据
		switch(config.type){

			//数组型的 同类型件填充到一个数组中 例如 data.text = [{id:'name', lable:'姓名'},{id:'sex',label:'性别'}]
			case 'text':
			case 'password':
			case 'number':
			case 'textarea':
			case 'select': 					//select
			case 'select2': 				//select2
			case 'typeahead': 				//typeahead
			case 'typeaheadtemplate': 		//typeaheadtemplate lyw
			case 'date': 					//日期
			case 'datetime': 				//日期时间
			case 'radio': 					//单选组
			case 'daterangeRadio':			//单选日期区间按钮
			case 'checkbox':				//多选组
			case 'attachCheckBox':			//附加勾选
			case 'daterange': 				//日期区间
			case 'daterangepicker': 		//日期区间 lyw 20190417
			case 'textBtn':					//textBtn
			case 'provinceSelect':			//省市区 
			case 'provincelinkSelect': 		//省市区
			case 'hidden':
			case 'textSelect':
			case 'selectText':
			case 'selectDate':
			case 'selectSelect':
			case 'table':
			case 'inputSelect':
			case 'personSelectSystem':
			case 'scientificInput':
			case 'powerInput':
			case 'modelSelector':
			case 'organizaSelect':
			case 'ueditor':
			case 'colorpickerinput':
			case 'uploadImage': 	
			case 'graphicsInput':
			case 'timer':
			case 'baidumap': 		//lyw 20180507
			case 'map': 		//lyw 20190410
			case 'codeMirror':
			case 'photoImage':
			case 'numrange':
			case 'projectSelect':
			case 'transactor':
			case 'flowchartviewer':
			case 'datemobile':
			case 'adderSubtracter':
			case 'business':
				setArrayData(config); 
				break;
			//对象型的  同类型件填充到一个对象中 例如 setObj.treeSelect = {name:{id:'name', lable:'姓名'},sex:{id:'sex',label:'性别'}};
			case 'treeSelect': 		//树型下拉选择
			case 'uploadSingle': 	//单独上传组件
			case 'personSelect': 	//person-select
			case 'valuesInput': 	//多值输入组件
			case 'dateTimeInput': 	//日期格式化输入组件
			case 'sortAtHalfScreen':
				setObjectData(config);
				break;
			//其它特殊类型
			case 'upload': 			//带表格的上传组件 这个组件只能有一个 并且带一个表
				setObj.uploadObj = config;
				if(typeof(setObj.tableArr)=='undefined'){
					setObj.tableArr = [];
				}
				setObj.tableArr.push(config);
				break;
			case 'webupload':
				//大文件断点续传
				setObj.webupload = config;
				if(typeof(setObj.tableArr)=='undefined'){
					setObj.tableArr = [];
				}
				setObj.tableArr.push(config);
				break;
			case 'expression':
				//规则内容
				setObj.expression = config;
				if(typeof(setObj.tableArr)=='undefined'){
					setObj.tableArr = [];
				}
				setObj.tableArr.push(config);
				break;
			case 'addSelectInput':
				setObj.addSelectInput = config;
				//增查一体输入框
				break;
			case 'multiselect':
				//支持左右多选组件
				setObj.multiselect = config;
				break;

			case 'title': 	//标题 	不处理
			case 'html': 	//html 	不处理
			case 'label': 	//label 不处理
			case 'note':
			case 'hr':
			case 'br':
			case 'changeHandler': //changer事件处理器 不处理
				//这里都是不处理的
				break;

			default:
				if(debugerMode){
					console.error('不能识别的组件类型：'+config.type);
					console.error(config);
				}
				
				break;
		}
	}
	formJson.sortObj = {};
	//按照组件id保存到formJson.component;
	var indexObj = {
		element:1,
		html:1,
		other:1,
	}
	function setComponentById(_formJson, _config){
		//按照id保存
		if(typeof(_config.id)!='undefined'){
			//id不能重复
			if(debugerMode){
				if(typeof(_formJson.component[_config.id])!='undefined'){
					console.error('字段配置参数出现重复ID：'+_config.id);
					console.error(_config);
					console.error(_formJson);
				}
			}
			
			_formJson.component[_config.id] = _config;
		}else{
			//没有ID
			var componentId = '';
			//title等element元素
			if(typeof(_config.element)=='string'){
				componentId = _config.element;
				componentId = componentId + indexObj.element;
				indexObj.element ++;
			}else if(typeof(_config.html)=='string'){
				componentId = 'html';
				componentId = componentId + indexObj.html;
				indexObj.html ++;
			}else{
				componentId = 'other';
				componentId = componentId + indexObj.other;
				indexObj.other ++;
			}
			_formJson.component[componentId] = _config;
		}
	}
	// 初始化changeHandler
	function initChangeHandler(fieldConfig){
		if(typeof(fieldConfig.relationField)=='string'){
			function editFieldCon(fieldConfig){
				var relationField = fieldConfig.relationField;
				var relationFieldArr = relationField.split(',');
				var editArr = [];
				for(var index=0; index<relationFieldArr.length; index++){
					editArr.push({id:relationFieldArr[index]});
				}
				nsForm.edit(editArr,formJson.id);
			}
			if(typeof(fieldConfig.changeHandler)=='function'){
				var sourceChangeHandler = fieldConfig.changeHandler;
				fieldConfig.changeHandler = function(value,text,selectJson,configSubdata){
					editFieldCon(fieldConfig);
					sourceChangeHandler(value,text,selectJson,configSubdata);
				}
			}else{
				fieldConfig.changeHandler = function(value,text,selectJson,configSubdata){
					editFieldCon(fieldConfig);
				}
			}
		}
		//sjj20181020  form中所有作为入参的关联字段
		if(!$.isEmptyObject(formJson.editListenerFieldData[fieldConfig.id])){
			function editComponentHandler(data){
				var editArr = [{id:formJson.editListenerFieldData[fieldConfig.id]}];
				nsForm.edit(editArr,formJson.id);
			}
			if(typeof(fieldConfig.commonChangeHandler)=='function'){
				var sourceChangeHandler = fieldConfig.commonChangeHandler;
				fieldConfig.commonChangeHandler = function(data){
					editComponentHandler(data);
					sourceChangeHandler(data);
				}
			}else{
				fieldConfig.commonChangeHandler = function(data){
					editComponentHandler(data);
				}
			}
		}
	}
	//循环初始化
	for(var i=0; i<formJson.form.length; i++){
		if($.isArray(formJson.form[i])){
			for(var arrI = 0; arrI<formJson.form[i].length; arrI++){	
				if(typeof(formJson.form[i][arrI]) == 'undefined'){
					if(debugerMode){
						//nsalert('配置参数：'+formJson.form[i][arrI]);
						console.log('配置参数：'+formJson.form[i][arrI]);
						break;
					}
				}
				setComponentById(formJson, formJson.form[i][arrI]);
				initChangeHandler(formJson.form[i][arrI]);
			}
		}else{
			setComponentById(formJson, formJson.form[i]);
			initChangeHandler(formJson.form[i]);
		}		
	}
	$.each(formJson.component, function(id, componentConfig){
		componentInit(componentConfig);
	})
	// 根据moreFieldArr长度判断是否有更多字段
	// 如果有更多字段 根据类型分组更多字段配置
	if(data.moreFieldArr.length>0){
		var isHadValueMore = false; // 判断更多配置的字段中是否有value值 用于移动端更多的label标签的样式设置
		for(var fieldI=0;fieldI<data.moreFieldArr.length;fieldI++){
			setDataGroupByType(data.moreFieldArr[fieldI], data.moreFields);
			if(data.moreFieldArr[fieldI].value.length>0){
				isHadValueMore = true;
			}
		}
		formJson.isHadValueMore = isHadValueMore;
	}
	delete formJson.sortObj;
	//储存数据对象 保存基础配置数据和当前数据
	//data.config = formJson;
	nsFormBase.form[formJson.id] = formJson;
	nsFormBase.data[formJson.id] = data;
	// 生成根据id存储的对象 lyw
	var form = formJson.form;
	for(var i=0; i<form.length; i++){
		data.fieldById[form[i].id] = form[i];
	}
	//返回HTML和数据
	var returnObj = {
		html:html,
		data:data
	};
	return returnObj;
}
//初始化表单上的组件 必须在页面已经有了HTML数据之后调用
nsFormBase.init = function(formJson){
	var data = nsFormBase.data[formJson.id];
	data.$container = $("#"+formJson.id);
	data.$form = $("#form-"+formJson.id);
	data.config = formJson;
	var isError = true;
	if(data.$container.length!=1 || data.$form.length!=1 ){
		if(formJson.isOutForm == true){
			nsalert('表单初始化对象错误','error');
		}
	}else{
		var data = nsFormBase.data[formJson.id];
		nsComponent.dataInit(data, formJson.id);
	}
}



//将数据填充到表单中
nsFormBase.setValues = function(valueJson,formID){
	//清除null值并批量赋值
	//valueJson 必填，格式是{id:value},举例：{'name':'cy',age:'23'}
	//formID 必填
	if(debugerMode){
		var parametersArr = 
		[
			[valueJson,'object',true],
			[formID,'string',true]
		]
		nsDebuger.validParameter(parametersArr);
	}
	var json = nsVals.clearNull(valueJson);
	json = nsFormBase.filterValues(json,formID);

	$.each(json,function(id,value){
		nsComponent.setValue(id,formID,value);
	});
}
//过滤值
nsFormBase.filterValues = function(json,formID){
	var valueJson = {};
	$.each(json,function(key,value){
		var config = nsForm.data[formID].formInput[key];
		if(typeof(config) != 'undefined'){
			// 业务组件value值处理
			switch(config.type){
				case 'business':
					if(typeof(value) != "undefined" && value !== '' && config.isReadOutputFields){
						value = nsUI.businessInput.getBusinessValueByVo(config, json);
					}
					break;
			}
			valueJson[key] = value;
		}
	})
	return valueJson;
}
//回车快捷键功能
nsFormBase.shortcutKey = function(data){
	//console.log(data);
	var key = data.config.shortcutKey;
	//如果仅设置为ture，没有配置参数，则全部组件顺序使用，第一个组件默认获得焦点
	if(typeof(key)!='boolean' && typeof(key)!='object'){
		return false;
	}else if(typeof(key)=='boolean'){
		if(key==false){
			return false;
		}else{
			//如果配置参数为true则全部使用默认
			key = {
				isUsed:true,
				first:data.config.form[0]
			}
			data.config.shortcutKey = key;
		}
	}
	//console.log(key);
	if(typeof(key)=='boolean'){
		if(key==true){

		}
	}
}
//表单验证
nsFormBase.validate = function(formID,formInputArr){
	if($.isArray(formInputArr)){
		if(formInputArr.length > 0){
			var formInput = {};
			for(var formInputI = 0; formInputI<formInputArr.length; formInputI++){
				var formInputID = formInputArr[formInputI].id;
				var formInputValue = formInputArr[formInputI];
				formInput[formInputID] = formInputValue;
			}
			nsForm.data[formID] = {id:formID,formInput:formInput, formType:nsFormBase.form[formID].formSource};
			var rules = nsComponent.getRules(formID,formInputArr);
			var validateObj = $("#form-"+formID).validate(rules);
			nsForm.rules[formID] = rules.rules; //验证规则
		}
	}
}