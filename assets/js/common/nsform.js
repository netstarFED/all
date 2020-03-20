
//获得面板表单的初始化对象,单独调用仅获得html和data不初始化
//return nsFormBase.initData(formJson);
nsForm.panelInitData = function(formJson) {
	formJson.formType = 'plane';
	formJson.formSource = 'form';
	formJson = nsForm.setDefault(formJson);
	return nsFormBase.initData(formJson);
}
//初始化面板类型表单
nsForm.panelInit = function(formJson){
	var data = nsForm.panelInitData(formJson);
	var html = '<form role="form" id="form-'+formJson.id+'" method="get" action="">'
				+data.html
			+'</form>';
	var $container = nsForm.getContainer(formJson.id);
	$container.html(html);
	nsFormBase.init(formJson);
}
//设定form的默认属性
nsForm.setDefault = function(formJson){
	var editListenerFieldsJson = {};//作为参数的关联检索条件
	var fieldById = {};
	if($.isArray(formJson.form)){
		for(var i=0; i<formJson.form.length; i++){
			fieldById[formJson.form[i].id] = formJson.form[i];
		}
	}
	var newFormArray = [];//定义个新form的数组  作用是将此数组作为form运行的数组
	//批量添加changeHandler事件
    function getChangeHandlerData(data){
    	/*changeHandlerData
			*readonly:{id:false,name:false}
			*disabled:{id:false,name:true}
			*value:{id:'3333',name:"ddd"}
			*hidden:{id:true,name:true}
		*/
    	var configObj = {};
    	//读取changeHandlerData
    	// 判断选择的是否存在若不寻在读取nsRestoreDefaultObj
    	if(data.config.changeHandlerData[data.value]){
    		configObj = data.config.changeHandlerData[data.value];
    	}else{
    		if(data.config.changeHandlerData.nsRestoreDefaultObj){
    			configObj = data.config.changeHandlerData.nsRestoreDefaultObj;
    		}
    	}
		if(!$.isEmptyObject(configObj)){
			//定义了changeHandlerData则继续
			var fullID = data.config.fullID;
			var formID = fullID.substring(fullID.indexOf('-')+1,data.config.fullID.length-data.config.id.length-1);
			// 判断表单中存在的字段id不存在的删除
			var formInput = nsForm.data[formID].formInput;
			for(var classType in configObj){
				// classType是readonly/disabled/value/hidden
				for(var fieldId in configObj[classType]){
					if(typeof(formInput[fieldId])=='undefined'){
						delete configObj[classType][fieldId];
					}
				}
			}
			//有定义
			var valueArray = [];
			var formData = nsForm.getFormJSON(formID,false);
			for(var attribute in configObj){
				for(var id in configObj[attribute]){
					if(id == data.config.id){
						continue;
					}
					var json = {id:id};
					json[attribute] = configObj[attribute][id];
					if(typeof(formData[id])!="undefined"){
						json.value = formData[id];
					}
					valueArray.push(json);
				}
			}
			nsForm.edit(valueArray,formID);
		}
    }
    //
	/* sjj 20181019 注释 原因不知道做什么用
		if(typeof(formJson.changeHandler)=='function'){
			for(arrI in formJson.form){
				if($.isArray(formJson.form[arrI])){
					for(arrII in formJson.form[arrI]){
						if(typeof(formJson.form[arrI][arrII].changeHandler)=='function'){
							//如果已经定义了changeHandler
						}else{
							formJson.form[arrI][arrII].changeHandler = formJson.changeHandler;
						}
						if(formJson.form[arrI][arrII].changeHandlerData){
							formJson.form[arrI][arrII].commonChangeHandler = getChangeHandlerData;
						}
					}
				}else{
					if(typeof(formJson.form[arrI][arrII].changeHandler)=='function'){
						//如果已经定义了changeHandler
					}else{
						formJson.form[arrI].changeHandler = formJson.changeHandler;
					}
					//添加主要集中处理changeHandlerData
					if(formJson.form[arrI].changeHandlerData){
						formJson.form[arrI].commonChangeHandler = getChangeHandlerData;	
					}
				}
			}
		}
	*/
	//附加勾选框
	function getAttachCheckboxSort(fieldData,index,subIndex){
		//记录下附加勾选附加到的位置
		var subIndex = Number(subIndex);
		if(subIndex == 0){return;}
		switch(fieldData.type){
			case 'attachCheckBox':
				var attachFieldId = '';
				if(index){
					index = Number(index);
					attachFieldId = formJson.form[index][subIndex-1].id;
				}else{
					attachFieldId = formJson.form[subIndex-1].id;
				}
				if(typeof(fieldData.isPrevFieldAttach)=='boolean'){
					//存在给指定id追加附加勾选
					if(fieldData.isPrevFieldAttach == true){
						fieldData.attachFieldId = attachFieldId;
					}
				}
				break;
		}
	}
	//作为参数的关联检索条件  editListenerFields sjj20181020
	function editListenerFieldHandler(fieldIds){
		var paramFieldsArray = fieldIds.editListenerFields.split(',');
		for(var paramI=0; paramI<paramFieldsArray.length; paramI++){
			editListenerFieldsJson[paramFieldsArray[paramI]] = fieldIds.id;
		}
	}
	for(arrI=0; arrI<formJson.form.length; arrI++){
		if($.isArray(formJson.form[arrI])){
			newFormArray[arrI] = [];
			for(arrII=0; arrII<formJson.form[arrI].length; arrII++){
				if(formJson.form[arrI][arrII].changeHandlerData){
					if(typeof(formJson.form[arrI][arrII].commonChangeHandler)=='function'){
						// formJson.form[arrI][arrII].originaChangeHandler = formJson.form[arrI][arrII].commonChangeHandler;
						// commonChangeHandler和changeHandlerData同时存在时处理 先执行changeHandlerData cy 20180821
						var originaChangeHandler = formJson.form[arrI][arrII].commonChangeHandler;
						formJson.form[arrI][arrII].commonChangeHandler = function(data){
							getChangeHandlerData(data);
							originaChangeHandler(data);
						}
					}else{
						formJson.form[arrI][arrII].commonChangeHandler = getChangeHandlerData;	
					}	
				}
				getAttachCheckboxSort(formJson.form[arrI][arrII],arrI,arrII);//附加勾选框的处理

				//组合组件 如果存在组合组件那么将要替换的组件输出到form
				if(typeof(formJson.form[arrI][arrII].subFields)=='object'){
					if(!$.isEmptyObject(formJson.form[arrI][arrII].subFields)){
						//存在组合组件的定义
						var jsonData = nsCombineComponent.getCombineInput(formJson.form[arrI][arrII]);
						if(typeof(jsonData)=='object'){
							if($.isArray(jsonData)){
								for(var valueI=0; valueI<jsonData.length; valueI++){
									newFormArray[arrI].push(jsonData[valueI]);
								}
							}else{
								newFormArray[arrI].push(jsonData);
							}
						}
					}
				}else{
					newFormArray[arrI].push(formJson.form[arrI][arrII]);
				}
				//作为参数的关联检索条件
				if(formJson.form[arrI][arrII].editListenerFields){
					editListenerFieldHandler(formJson.form[arrI][arrII]);
				}
			}
		}else{
			//添加主要集中处理changeHandlerData
			if(formJson.form[arrI].changeHandlerData){
				if(typeof(formJson.form[arrI].commonChangeHandler)=='function'){
					// formJson.form[arrI].originaChangeHandler = formJson.form[arrI].commonChangeHandler;
					// commonChangeHandler和changeHandlerData同时存在时处理 先执行changeHandlerData cy 20180821
					var originaChangeHandler = formJson.form[arrI].commonChangeHandler;
					formJson.form[arrI].commonChangeHandler = function(data){
						getChangeHandlerData(data);
						originaChangeHandler(data);
					}
				}else{
					formJson.form[arrI].commonChangeHandler = getChangeHandlerData;	
				}
			}
			getAttachCheckboxSort(formJson.form[arrI],arrI);//附加勾选框的处理
			//组合组件 如果存在组合组件那么将要替换的组件输出到form
			if(typeof(formJson.form[arrI].subFields)=='object'){
				if(!$.isEmptyObject(formJson.form[arrI].subFields)){
					var component = formJson.form[arrI];
					switch(component.type){
						case 'map':
							setNewFormArrayBySubFields(component);
							break;
						default:
							//存在组合组件的定义
							var jsonData = nsCombineComponent.getCombineInput(formJson.form[arrI]);
							if(typeof(jsonData)=='object'){
								if($.isArray(jsonData)){
									for(var valueI=0; valueI<jsonData.length; valueI++){
										newFormArray.push(jsonData[valueI]);
									}
								}else{
									newFormArray.push(jsonData);
								}
							}
							break;
					}
				}
			}else{
				var component = formJson.form[arrI];
				switch(component.type){
					case 'daterangepicker':
					case 'dateRangePicker':
						setNewFormArrayByStartEnd(component);
						break;
					default:
						newFormArray.push(formJson.form[arrI]);
						break;
				}
			}

			//作为参数的关联检索条件
			if(formJson.form[arrI].editListenerFields){
				editListenerFieldHandler(formJson.form[arrI]);
			}
		}
	}
	function setNewFormArrayBySubFields(_component){
		function mapRelChange(_value, _config){
            nsUI.mapInput.changeByRelField(_value, _config);
        }
        // 设置隐藏字段
        function getHideConfig(id, componentId){
            return {
                id : id,
                type : 'hidden',
                isSave : false,
                changeField : componentId,
				mindjetFieldPosition : _component.mindjetFieldPosition ? _component.mindjetFieldPosition : 'field',
                changeHandler : function(_value, _config){
                    mapRelChange(_value, _config)
                },
            }
        }
        // 设置显示字段
        function setShowConfig(changeFieldId, component){
            component.changeField = changeFieldId;
            component.isSave = false;
            var defaultChangeFunc = typeof(component.changeHandler)=="function"? component.changeHandler : function(){};
            component.changeHandler = function(_value, _config){
                mapRelChange(_value, _config);
                defaultChangeFunc(_value, _config);
            }
        }
		var subFields = _component.subFields;
		for(var key in subFields){
			if(typeof(fieldById[subFields[key]])!="object"){
				// 有可能配置了两个地图组件 关联同一个字段
				var isHave = false;
				for(var i=0; i< newFormArray.length; i++){
					if(subFields[key] === newFormArray[i].id){
						isHave = true;
					}
				}
				if(!isHave){
					var hideConfig = getHideConfig(subFields[key], _component.id);
					newFormArray.push(hideConfig);
				}
			}else{
				setShowConfig(_component.id, fieldById[subFields[key]])
			}
		}
		newFormArray.push(_component);
	}
	function setNewFormArrayByStartEnd(_component){
		function dateRangePickerRelChange(_value, _config){
            nsUI.daterangepickerInput.changeByRelField(_value, _config);
        }
        // 设置隐藏字段
        function getHideConfig(id, componentId){
            return {
                id : id,
                type : 'hidden',
                isSave : false,
				changeField : componentId,
				isWithoutFormJSON : true,
				mindjetFieldPosition : _component.mindjetFieldPosition ? _component.mindjetFieldPosition : 'field',
                changeHandler : function(_value, _config){
                    dateRangePickerRelChange(_value, _config)
                },
            }
        }
        // 设置显示字段
        function setShowConfig(changeFieldId, component){
            component.changeField = changeFieldId;
            component.isSave = false;
			component.isWithoutFormJSON = true;
            var defaultChangeFunc = typeof(component.changeHandler)=="function"? component.changeHandler : function(){};
            component.changeHandler = function(_value, _config){
                dateRangePickerRelChange(_value, _config);
                defaultChangeFunc(_value, _config);
            }
        }
		var subFields = {
			fieldStart :　_component.fieldStart ? _component.fieldStart : _component.id + 'Start',
			fieldEnd :　_component.fieldEnd ? _component.fieldEnd : _component.id + 'End',
		};
		for(var key in subFields){
			if(typeof(fieldById[subFields[key]])!="object"){
				// 有可能配置了两个日期组件 关联同一个字段
				var isHave = false;
				for(var i=0; i< newFormArray.length; i++){
					if(subFields[key] === newFormArray[i].id){
						isHave = true;
					}
				}
				if(!isHave){
					var hideConfig = getHideConfig(subFields[key], _component.id);
					newFormArray.push(hideConfig);
				}
			}else{
				setShowConfig(_component.id, fieldById[subFields[key]])
			}
		}
		newFormArray.push(_component);
	}
	//判断当前表单组件是否应当支持回车切换功能
	//return false/true 是否应当添加
	// function getIsAllowEnterSwitch(_componentConfig){
	function setAllowEnterSwitchArr(_componentConfig,AllowEnterSwitchArr){
		//类型为非操作类的组件 如html title hr label node br 有些在type属性上，有些则完全没有type属性
		switch(_componentConfig.type){
			case 'title':
			case 'html':
			case 'hr':
			case 'label':
			case 'node':
			case 'br':
				return false;
				break;
			case undefined:
				return false;
				break;
		}
		//类型合格但是属性不支持的组件也需要排除
		if(	
			_componentConfig.hidden == true ||  			//隐藏不能支持
			_componentConfig.readonly == true ||  			//只读不能支持
			_componentConfig.disabled == true ||  			//disable
			typeof(_componentConfig.id)=='undefined' 		//压根没id的
		){
			return false;
		}
		//上述两个条件都不满足则可以支持
		AllowEnterSwitchArr.push(_componentConfig);
		return true;
	}
	// 表单属性 isOnKeydown为true时（支持回车切换），则需要对每个组件添加属性
	// 1. isOnKeydown 是否支持回车跳转
	// 2. enterFocusField 跳转的目标字段
	formJson.isOnKeydown = typeof(formJson.isOnKeydown)=='boolean'?formJson.isOnKeydown:false;
	//表单有一维数组和二维数组两种情况，循环后将可以支持回车切换的组件添加到新数组以获得下一个组件
	if(formJson.isOnKeydown){
		var formArr = [];  // 支持回车切换的组件数组 
		for(var i=0;i<formJson.form.length;i++){
			if($.isArray(formJson.form[i])){
				for(var j=0;j<formJson.form[i].length;j++){
					setAllowEnterSwitchArr(formJson.form[i][j], formArr)
				}
			}else{
				setAllowEnterSwitchArr(formJson.form[i], formArr)
			}
		}
		// 
		for(var i=0; i<formArr.length-1; i++){
			if(typeof(formArr[i].isOnKeydown)!='boolean'){
				//除非特别指定，则添加属性标识支持回车切换
				formArr[i].isOnKeydown = true;
			}
			if(!formArr[i].enterFocusField){
				//如果不是最后，则是数组中的下一个字段
				formArr[i].enterFocusField = formArr[i+1].id;
			}
			if(formArr[i].isOnKeydown){
				formArr[i].isSetBlur = true;
				formArr[i].isSetFocus = true;
			}
		}
		// 最后一个失去焦点认为整个表单完成输入（失去焦点）回调 表单的blurHandler
		formArr[formArr.length-1].isOnKeydown = true;
		formArr[formArr.length-1].blurHandler = formJson.blurHandler;
	}

	/********************************* *sjj 20190417 添加手机端半屏模式下的排序功能***************************start */
	if(formJson.formSource == 'halfScreen' && !$.isEmptyObject(formJson.sortConfig)){
		if($.isArray(formJson.sortConfig.field)){
			var sortArray = [];
			var sortFieldArray = formJson.sortConfig.field;
			for(var sortI=0; sortI<sortFieldArray.length; sortI++){
				sortArray.push({
					orderField:sortFieldArray[sortI].value,
					orderType:sortFieldArray[sortI].default ? sortFieldArray[sortI].default : '',
					orderName:sortFieldArray[sortI].text,
					nsTemplateOrderSort:(sortI+1),
				});
			}
			var sortJson = {
				id:'nsTemplateOrderSort',
				type:'sortAtHalfScreen',
				label:'排序',
				textField:'orderName',
				valueField:'nsTemplateOrderSort',
				//outFields:'{"orderField":"{orderField}","orderType":"{orderType}"}',
				subdata:sortArray,
			};
			if(typeof(formJson.sortConfig.commonChangeHandler)=='function'){
				sortJson.commonChangeHandler = formJson.sortConfig.commonChangeHandler;
			}
			newFormArray.push(sortJson);
		}
	}
	/********************************* *sjj 20190417 添加手机端半屏模式下的排序功能***************************end */
	formJson.form = newFormArray;
	formJson.editListenerFieldData = editListenerFieldsJson;//存放当前form中所有作为入参的关联字段sjj20181020
	switch(formJson.formType){
		case 'plane':
			//面板表单默认连续排列
			//plane面板模式的form如果没有定义column,则默认设置为0 类宽度css class生成col-none，且添加冒号
			for(var i=0; i<formJson.form.length; i++){
				var config = formJson.form[i];
				if(typeof(config.column)=='undefined'){
					if(typeof(config.label)=='string'){
						config.label = config.label + '：';
					}
					config.column = 0;
				}
			}
			break;
		case 'table':
			//表格表单默认100%宽，多出来的tableWidth属性
			if(typeof(formJson.tableWidth)=='number'){
				formJson.tableWidth = formJson.tableWidth+'px';
			}else if(typeof(formJson.tableWidth)=='string'){
				//字符串就不改了
			}else if(typeof(formJson.tableWidth)=='undefined'){
				formJson.tableWidth = '100%';
			}
			break;
	}
	for(var i=0; i<newFormArray.length; i++){
		fieldById[newFormArray[i].id] = newFormArray[i];
	}
	nsFormBase.formInfo[formJson.id] = {
		fieldById : fieldById,
		formJson : formJson,
	}
	return formJson;
}
//初始化form的初始化对象
nsForm.formInitData = function(formJson){
	formJson.formType = 'form';
	// formJson.formSource = 'form';
	switch(formJson.formSource){
		case 'halfScreen':  // 半屏
		case 'fullScreen':  // 全屏
		case 'staticData':    // 功能
		case 'inlineScreen':      // 行内
			// 不变
			break;
		default:
			// 默认form
			formJson.formSource = 'form';
			break;
	}
	formJson.format = typeof(formJson.format) == 'undefined' ? 'standard' : formJson.format;
	formJson.fillbg = typeof(formJson.fillbg) == 'undefined' ? true : formJson.fillbg;
	var sizeStr = 'fullwidth';
	//是否默认紧凑模式的表格高度
	if(typeof(nsUIConfig)=='object'){
		if(nsUIConfig.formHeightMode == 'compact'){
			sizeStr = 'compactmode';
		}
	}
	formJson.size = typeof(formJson.size) == 'undefined' ? sizeStr : formJson.size;
	formJson.isUserControl = typeof(formJson.isUserControl) == 'boolean' ? formJson.isUserControl : false;//默认显示用户控制按钮
	formJson.isUserContidion = typeof(formJson.isUserContidion) == 'boolean' ? formJson.isUserContidion : false;
	formJson.isSingleMode = typeof(formJson.isSingleMode) == 'boolean' ? formJson.isSingleMode : false;//默认
	formJson.fieldMoreActtion = formJson.fieldMoreActtion ? formJson.fieldMoreActtion : '';
	formJson = nsForm.setDefault(formJson);
	return nsFormBase.initData(formJson);
}
// 组件设置value值 通过 NetstarMainPage.systemInfo(系统参数)
nsForm.setValueByValueExpression = function(componentConfig, formConfig){
	// 没有设置系统value
	if(typeof(componentConfig.valueExpression) != "string"){
		return;
	}
	/****** sjj 20190629 如果当前组件存在赋值的默认值则不应该读取系统默认参数 start****/
	var isReturn = false;//是否需要返回
	//需要判断值类型再决定是否读取默认参数
	switch(typeof(componentConfig.value)){
		case 'number':
			//当前有自定义的默认值 所以不需要读取系统参数直接return
			isReturn = true;
			break;
		case 'string':
			 //当前有自定义的默认值 所以不需要读取系统参数直接return
			if(componentConfig.value){
				isReturn = true;
			}
			break;
		case 'object':
			 //当前有自定义的默认值 所以不需要读取系统参数直接return
			if(!$.isEmptyObject(componentConfig.value)){
				isReturn = true;
			}
			break;
	}
	if(isReturn){
		return;
	}
	 /****** sjj 20190629 如果当前组件存在赋值的默认值则不应该读取系统默认参数 end****/
	// 系统参数对象
	var systemInfo = NetstarMainPage && typeof(NetstarMainPage.systemInfo) == "object" ? NetstarMainPage.systemInfo : {};
	var pageData = {};
	if(typeof(formConfig.getPageDataFunc) == "function"){
		pageData = formConfig.getPageDataFunc();
	}
	var valueExpression = {
		value : componentConfig.valueExpression,
	}
	var valObj = {
		page : pageData,
		systemInfo : systemInfo,
	}
	
	// 获得格式化系统参数对象
	var formatValObj = NetStarUtils.getFormatParameterJSON(valueExpression, valObj);
	var formatVal = formatValObj.value;
	if(formatVal){
		componentConfig.value = formatVal;
	}
}
nsForm.setChangeHandlerDataByType = function(components){
	for(var componentI=0; componentI<components.length; componentI++){
		var componentConfig = components[componentI];
		var componentType = componentConfig.type;
		if(typeof(componentConfig.changeHandlerData)=="object"){
			switch(componentType){
				case 'checkbox':
					for(var key in componentConfig.changeHandlerData){
						if(key.indexOf(',')>-1){
							var keyArr = key.split(',');
							keyArr.sort();
							var keyStr = keyArr.toString();
							if(keyStr != key){
								componentConfig.changeHandlerData[keyStr] = componentConfig.changeHandlerData[key];
								delete componentConfig.changeHandlerData[key];
							}
						}
					}
					break;
			}
		}
	}
}
nsForm.getValueByComponentConfig = function(config){
	var value = config.value;
	if(value === "" || typeof(value)==="undefined"){
		value = '';
		switch(config.type){
			case 'select':
			case 'radio':
			case 'checkbox':
				var subdata = config.subdata;
				if($.isArray(subdata)){
					for(var i=0; i<subdata.length; i++){
						if(subdata[i].isChecked){
							value += subdata[i][config.valueField]+',';
						}
					}
				}
				if(value.length > 0){
					value = value.substring(0, value.length-1);
				}
				break;
			default:
				break;
		}
	}
	return value;
}
nsForm.setFormComponentsByChangeHandlerData = function(components){
	var changeHandlerDataComponents = {};
	// 获得所有changeHandlerData组件
	for(var componentI=0; componentI<components.length; componentI++){
		var componentConfig = components[componentI];
		var componentType = componentConfig.type;
		var value = nsForm.getValueByComponentConfig(componentConfig);
		if(typeof(componentConfig.changeHandlerData)=="object"&&typeof(value)!="undefined"&&componentConfig.value!==""){
			var valueStr = "";
			// var value = componentConfig.value;
			switch(componentType){
				case 'business':
					// 业务组件暂不支持
					break;
				case 'checkbox':
				case 'radio':
				case 'select':
					var value2 = value;
					if(componentConfig.isObjectValue){
						// value是对象
						var valueField = typeof(componentConfig.valueField)=="string"?componentConfig.valueField:"value";
						if($.isArray(value)&&value.length>0){
							value2 = [];
							for(var valI=0; valI<value.length; valI++){
								value2.push(value[valI][valueField]);
							}
						}else{
							value2 = value[valueField];
						}
					}
					valueStr = value2;
					if($.isArray(value2)){
						value2.sort();
						valueStr = value2.toString();
					}
					break;
				default:
					valueStr = value;
					break;
			}
			if(valueStr!==""){
				var changeComponent = componentConfig.changeHandlerData[valueStr];
				if(typeof(changeComponent)=="object"){
					for(var stateName in changeComponent){
						for(var componentId in changeComponent[stateName]){
							if(typeof(changeHandlerDataComponents[componentId])!="object"){
								changeHandlerDataComponents[componentId] = {};
							}
							changeHandlerDataComponents[componentId][stateName] = changeComponent[stateName][componentId];
						}
					}
				}
			}
		}
	}
	// 通过获得的changeHandlerDataComponents设置组件
	for(var componentI=0; componentI<components.length; componentI++){
		var componentConfig = components[componentI];
		var componentId = componentConfig.id;
		if(typeof(changeHandlerDataComponents[componentId])=="object"){
			for(var stateName in changeHandlerDataComponents[componentId]){
				componentConfig[stateName] = changeHandlerDataComponents[componentId][stateName];
			}
		}
	}
}
nsForm.formatFormComponents = function(formConfig){
	var components = formConfig.form;
	for(var i=0; i<components.length; i++){
		// 获取value 通过系统参数
		nsForm.setValueByValueExpression(components[i], formConfig);
	}
	// 设置组件的changHandlerData通过组件类型
	nsForm.setChangeHandlerDataByType(components);
	// 根据changeHandlerData设置表单组件的状态
	// 注意：changeHandlerData有两个机制 1.初始化之前执行 2.change执行（只在checkbox，radio，select起作用）
	nsForm.setFormComponentsByChangeHandlerData(components);
}
nsForm.formatFormComponentsByType = function(components, config){
	for(var i=0; i<components.length; i++){
		switch(components[i].type){
			case 'business':
				nsUI.businessInput.formatConfig(components[i], config);
				break;
		}
	}
}
nsForm.setComponentValue = function(config, formEditData){
	var form = config.form;
	// 如果formEditData==object 表示设置value
	if(typeof(formEditData)=="object"){
		for(var comI=0;comI<form.length;comI++){
			var componentConfig = form[comI];
			if(typeof(formEditData[componentConfig.id])!="undefined"){
				var value = formEditData[componentConfig.id];
				// 业务组件value值处理
				switch(componentConfig.type){
					case 'business':
						if(typeof(value) != "undefined" && value !== '' && componentConfig.isReadOutputFields){
							value = nsUI.businessInput.getBusinessValueByVo(componentConfig, formEditData);
						}
						break;
				}
				componentConfig.value = value;
			}
		}
	}
}
nsForm.initByValues = function(formJson, vo){
	nsForm.formInit(formJson, false, vo);
}
//初始化form表单类型
nsForm.organizaData = {};
nsForm.formInit = function(formJson,formContainer, vo){
	nsForm.organizaData[formJson.id] = $.extend(true, {}, formJson);
	//formJson 表单配置参数，formContainer 非必填，指定表单的填充容器
	var storeId = 'nsForm-'+formJson.id;
	var storeData = store.get(storeId);//从本地缓存读取数据)
	if(storeData){
		for(var i=0; i<formJson.form.length; i++){
			var localStorageField = storeData[formJson.form[i].id];
			if (typeof(localStorageField) == 'object') {
				formJson.form[i].label = localStorageField.label;
				formJson.form[i].hidden = localStorageField.hidden;
				formJson.form[i].column = localStorageField.column;
				formJson.form[i].nsIndex = localStorageField.nsIndex;
			}
		}
		formJson.form.sort(function(a,b){
			return a.nsIndex - b.nsIndex
		});
	}
	//sjj20181120 针对缓存更多显示的处理
	var storeId = 'more-'+formJson.id;
	var storeMoreData = store.get(storeId);
	if(typeof(storeMoreData)=='object'){
		for(var formI=0; formI<formJson.form.length; formI++){
			var tempData = formJson.form[formI];
			if(storeMoreData[tempData.id]){
				tempData.stateSource = 'more';
			}
		}
	}
	// lyw 格式化表单组件
	nsForm.formatFormComponentsByType(formJson.form, formJson);
	// 根据vo设置value
	if(typeof(vo) == "object" && !$.isEmptyObject(vo)){
		nsForm.setComponentValue(formJson, vo);
	}
	nsForm.formatFormComponents(formJson);

	var data = nsForm.formInitData(formJson);
	var formID = formJson.id;
	var groupCls = "row row-close";
	var groupHrHtml = '<div class="col-xs-12 element-space"></div>';
	if(formJson.format=='standard'){
		groupCls = "row row-close";
		groupHrHtml = '<div class="col-xs-12 element-space"></div>';
	}else if(formJson.format=='close'){
		groupCls = "row row-close";
		groupHrHtml = '';
	}else if(formJson.format=='noline'){
		groupCls = "row";
		groupHrHtml = '';
	}
	if(formJson.fillbg){
		groupCls += ' fillbg';
	}
	if(formJson.plusClass){
		groupCls += ' '+formJson.plusClass;
	}
	var groupHtml = data.html;
	groupHtml = '<div class="'+groupCls+'">'+groupHtml+groupHrHtml+'</div>';
	var sizeCls = '';
	var width = '';
	var sizeStr='';
	//size属性值包含::standard:标准; compactmode:紧凑模式
	var sizeArr=$.trim(formJson.size).split(' ');
	for(var i=0;i<sizeArr.length;i++){
      var sizei=sizeArr[i];
      if(sizei!=null){
      	switch(sizei){
      		case 'fullwidth':
      		case 'readonly-view':
            case 'compactmode': 
      		case 'standard': 
	      		sizeStr += sizei+' ';
	      		break;
      		default:	
	      		if(debugerMode){
				console.error(sizei+'是未定义formJson.size属性值')
			     }
	      		break;
      	}      
      }
	}
	formJson.size=$.trim(sizeStr);
	if(formJson.size != ''){
		sizeCls = ' '+formJson.size;
	}else{
		width = ' style="max-width: '+formJson.width+';"';
	}
	var panelHtml = '';

	var userControlHtml = '';
	if(formJson.isUserControl){
		//如果允许用户自定义配置
		userControlHtml = '<button type="button" class="btn btn-white btn-icon" ns-type="form" ns-form="form-'+formJson.id+'"><i class="fa-cog"></i></button>';
	}
	var contidionHtml = '';
	if(formJson.isUserContidion){
		contidionHtml = '<div class="search-list">'
							+'<label>筛选条件：</label>'
							+'<ul class="search-link">'
							+'</ul>'
						+'</div>'
						+'<div class="search-expand">'
							+'<i class="fa-caret-up"></i>'
						+'</div>';
	}
	var panelClassStr = 'panel-form';
	/*if(formJson.isSingleMode){
		panelClassStr = 'form-wide-panel';
	}else{
		panelClassStr = 'panel-form';
	}*/

	var moreHtml = '';
	var expandMoreId = 'expand-'+formJson.id;
	if(data.data.moreFieldArr.length > 0){
		//存在展开更多字段
		var expandStr = formJson.fieldMoreTitle ? formJson.fieldMoreTitle : language.common.dialog.showMore;
		moreHtml = '<div id="'+expandMoreId+'" class="modal-expand-more" nstype="expand">'+expandStr+'<i class="fa-caret-up"></i></div>';
	}
	// 移动端添加的类名
	var mobileClassStr = formJson.formSource=='halfScreen'||
						formJson.formSource=='fullScreen'||
						formJson.formSource=='inlineScreen'||
						formJson.formSource=='staticData'?
						formJson.formSource.toLowerCase():'';
	// 移动端展开更多html处理
	// 行内模式更多
	moreHtml = formJson.formSource=='halfScreen'||formJson.formSource=='fullScreen'?'':moreHtml;
	var moreText = formJson.moreText ? formJson.moreText : '更多';
	// 行内更多
	if(formJson.formSource=='inlineScreen'&&data.data.moreFieldArr.length > 0){
		moreHtml = '<div class="mobile-expand-more">'+moreText+'</div>';
	}
	// 功能模式更多
	if(formJson.formSource=='staticData'){
		if(typeof(formJson.moreText)=="string" && formJson.moreText.length > 0){
			moreHtml = '<div class="mobile-expand-more">'+moreText+'<i class="fa fa-chevron-right"></i></div>';
		}
	}
	if(formContainer){
		panelHtml = userControlHtml+'<form role="form" class="clearfix panel-form '+sizeCls+'"  id="form-'+formJson.id+'" method="get" action="" '+width+' onSubmit="return false;">'
						+groupHtml
					+'</form>'+moreHtml;
	}else{
		 panelHtml = '<div class="panel panel-default '+panelClassStr+'">'
				+'<div class="panel-body">'
					+userControlHtml
					+'<form role="form" class="clearfix '+sizeCls+' '+mobileClassStr+'"  id="form-'+formJson.id+'" method="get" action="" '+width+' onSubmit="return false;">'
						+groupHtml
					+'</form>'
					+moreHtml
					+contidionHtml
				+'</div>'
			+'</div>';
	}
	var $container = nsForm.getContainer(formJson.id);
	//是否有指定的表单容器
	if(formContainer){
		//$("#"+formJson.id+" "+formContainer).html(panelHtml);
		formContainer.html(panelHtml);
	}else{
		$container.html(panelHtml);
	}
	nsFormBase.init(formJson);
	//表单用户自定义配置事件触发
	if(formJson.isUserControl){
		var $panelBody = $('#'+formJson.id).parent();
		var $button = $panelBody.find('[ns-form="form-'+formJson.id+'"]');
		$button.off('click');
		$button.on('click',function(ev){
			var formID = $(this).attr('ns-form');
			var preStr = 'form-';
			formID = formID.substring(preStr.length,formID.length);
			nsUI.formmanager.init(nsFormBase.form[formID]);
		});
	}
	//筛选条件
	if(formJson.isUserContidion){
		var data = nsForm.getFormData(formJson.id);
		for(var id in data){
			if(data[id].value === '' || data[id].text == '全部'){
				delete data[id];
			}
		}
		var liHtml = '';
		if(!$.isEmptyObject(data)){
			for(var contidion in data){
				liHtml += '<li ns-id="'+contidion+'">'+data[contidion].label+':'+data[contidion].text+'</li>';
			}
		}else{
			liHtml = '<li class="empty">暂无</li>';
		}
		var $panelBody = $('#'+formJson.id).parent();
		var $contidionlabels = $panelBody.find('.search-link');
		$contidionlabels.html(liHtml);
		var $contidion = $panelBody.find('.search-expand');
		$contidion.off('click');
		$contidion.on('click',function(ev){
			var $searchList = $(this).parent().children('.search-list');
			var $form = $(this).parent().children('form')
			if($searchList.hasClass('show')){
				$searchList.removeClass('show');
				$form.removeClass('hide');
				$(this).children('i').attr('class','fa-caret-up');
				//
			}else{
				$searchList.addClass('show');
				$form.addClass('hide');
				$(this).children('i').attr('class','fa-caret-down');
			}
		});
		$contidionlabels.children('li').not('.empty').off('click');
		$contidionlabels.children('li').not('.empty').on('click',function(ev){
			var $this = $(this);
			var nID = $this.attr('ns-id');
			delete data[nID];
			var fillvalues = {}
			fillvalues[nID] = '';
			nsForm.fillValues(fillvalues,formID);
			var $container = $this.closest('.search-link');
			var formJson = nsForm.getFormJSON(formID,false);
			var tableID = formID.substring(0,formID.lastIndexOf('-'));
			tableID = 'table-'+tableID+'-table';
			var tableParamData = baseDataTable.data[tableID].dataConfig.data;
			var paramObject = $.extend({},tableParamData,formJson);
			baseDataTable.reloadTableAJAX(tableID,paramObject);
			nsTemplate.templates.searchPage.refreshSearchHtml(formID,$container,data);
		});
	}
	//sjj 20180919 展开更多的事件触发
	$('#'+expandMoreId).on('click',function(event){
		event.stopPropagation();
		var $this = $(this);
		$this.toggleClass('open');
		var formId = $this.attr('id');
		var prefixStr = 'expand-';
		formId = formId.substring(prefixStr.length,formId.length);
		var fieldMoreActtion = nsFormBase.data[formId].config.fieldMoreActtion;
		var templateId = formId.substring(0,formId.lastIndexOf('-'));
		var showValueFormId = formId+'-hidden';
		switch(fieldMoreActtion){
			case 'showValue':
				$('#'+templateId).addClass('hide');
				$('#'+showValueFormId).parent().addClass('show');
				break;
			default:
				$('#'+templateId).removeClass('hide');
				$('#'+showValueFormId).parent().removeClass('show');
				var expandFieldArr = $.extend(true,[],nsFormBase.data[formId].moreFieldArr);
				var isExpand = false;
				if(!$this.hasClass('open')){
					isExpand = true;
				}
				for(var expandI=0; expandI<expandFieldArr.length; expandI++){
					expandFieldArr[expandI].value = $('#'+expandFieldArr[expandI].fullID).val();
					expandFieldArr[expandI].hidden = isExpand;
				}
				nsForm.edit(expandFieldArr,formId);
				break;
		}
	})
	//sjj20181116 如果存在更多模式
	if(formJson.fieldMoreActtion == 'showValue'){
		var showMoreFieldArray = $.extend(true,[],data.data.moreFieldArr);
		for(var moreI=0; moreI<showMoreFieldArray.length; moreI++){
			var isHidden = false;
			if(showMoreFieldArray[moreI].stateSource == 'more'){
				isHidden = true;
				delete showMoreFieldArray[moreI].stateSource;
			}
			showMoreFieldArray[moreI].hidden = isHidden;
			delete showMoreFieldArray[moreI].mindjetFieldPosition;
		}
		var showMoreFormJson = {
			id:			formJson.id+'-hidden',
			size:		"standard",
			format:		"standard",
			formSource: formJson.formSource,
			form:		showMoreFieldArray
		};
		var showMoreNavJson = {
			id:					formJson.id+'-nav',
			isShowTitle:		false,
			btns:				[
				[
					{
						text:'取消',
						isReturn:true,
						handler:function($dom){
							var formId = $dom.closest('.show-moreform-panel').attr('ns-templateid');
							var templateId = formId.substring(0,formId.lastIndexOf('-'));
							var showValueFormId = formId + '-hidden';
							$('#'+templateId).removeClass('hide');
							$('#'+showValueFormId).parent().removeClass('show');
						}
					},{
						text:'确认',
						isReturn:true,
						handler:function($dom){
							var formId = $dom.closest('.show-moreform-panel').attr('ns-templateid');
							var templateId = formId.substring(0,formId.lastIndexOf('-'));
							var showFormId = formId + '-hidden';
							var data = nsTemplate.getChargeDataByForm(showFormId);
							var editArray = [];
							var currentEditArray = [];
							var storeData = {};
							for(var value in data){
								var isEmptyValue = false;
								switch(typeof(data[value])){
									case 'number':
									case 'string':
										if(data[value]==''){
											isEmptyValue = true;
										}
									case 'array':
										if(data[value].length == 0){
											isEmptyValue = true;
										}
										break;
									case 'object':
										if($.isEmptyObject(data[value])){
											isEmptyValue = true;
										}
										break;
								}
								if(!isEmptyValue){
									//值不为空
									storeData[value] = true;
									editArray.push({
										id:value,
										hidden:false,
										value:data[value],
										stateSource:'more',//这个字段的来源是通过更多来显示
									});
									currentEditArray.push({
										id:value,
										hidden:true,
									});
								}
							}
							var storeId = 'more-'+formId;
							store.set(storeId,storeData);
							nsForm.edit(editArray,formId);
							nsForm.edit(currentEditArray,showFormId);
							$('#'+templateId).removeClass('hide');
							$('#'+showFormId).parent().removeClass('show');
						}
					}
				]
			]
		}
		var showMoreHtml = '<div class="show-moreform-panel" ns-templateid="'+formJson.id+'">'
								+'<div class="moreform-field" id="'+showMoreFormJson.id+'"></div>'
								+'<div class="moreform-btn nav-form" id="'+showMoreNavJson.id+'"></div>'
							+'</div>';
		$('body').append(showMoreHtml);
		nsForm.init(showMoreFormJson);
		nsNav.init(showMoreNavJson);
	}
	/***lyw 20190404 从form1移入开始**********/
	// lyw 移动端更多事件绑定 半屏模式
	var $more = $container.find('form').children().children('.form-td.more');
	if($more.length>0){
		if(formJson.isHadValueMore){
			$more.find('label').addClass('checked');
		}
		$more.off('click');
		$more.on('click', {formJson:formJson}, function(ev){
			var formJson = ev.data.formJson; // 表单配置
			var moreFieldArr = nsFormBase.data[formJson.id].moreFieldArr; // 更多字段数组
			// 半屏显示配置
			var config = {
				type:'more',
				id:'more',
				$this:$(this),
				$calRelPositionContainer:$(this),
				formJson:formJson,
				moreFieldArr:moreFieldArr,
			};
			var html = ''; // 更多字段的html
			for(var moreI=0; moreI<moreFieldArr.length; moreI++){
				moreFieldArr[moreI].hidden = false;
				html += nsComponent.getHTML(moreFieldArr[moreI], formJson);
			}
			// 半屏显示 点击按钮回调
			nsComponent.mobileHalfContainer.show(config, html, function(resConfig, isConfirm){
				var moreFieldArr = resConfig.moreFieldArr; // 更多字段数组
				resConfig.formJson.isHadValueMore = false; // 更多数组中的字段是否设置了value值
				for(var moreFieldI=0;moreFieldI<moreFieldArr.length;moreFieldI++){
					if(isConfirm){
						if(moreFieldArr[moreFieldI].value.length>0){
							resConfig.formJson.isHadValueMore = true; // value长度大于0时isHadValueMore=true，更多选中
							break;
						}
					}else{
						moreFieldArr[moreFieldI].value = ''; // 清除value
					}
				}
				resConfig.$this.find('label').removeClass('checked');
				if(resConfig.formJson.isHadValueMore){
					resConfig.$this.find('label').addClass('checked');
				}
				if(isConfirm){
					if(typeof(formJson.confirmHandler)=="function"){
						resConfig.formJson.confirmHandler(resConfig.formJson);
					}
				}else{
					if(typeof(resConfig.formJson.clearHandler)=="function"){
						resConfig.formJson.clearHandler(resConfig.formJson);
					}
				}
			});
			nsComponent.dataInit(nsFormBase.data[formJson.id].moreFields, formJson.id); // 初始化更多字段的方法
		});
	}
	// 行内更多事件 行内模式
	var $inlineMore = $container.find('form.inlinescreen').next('.mobile-expand-more');
	if($inlineMore.length>0){
		$inlineMore.off('click');
		$inlineMore.on('click', {formJson:formJson}, function(ev){
			var formJson = ev.data.formJson; // 表单配置
			var moreFieldArr = nsFormBase.data[formJson.id].moreFieldArr; // 更多字段数组
			var showMoreContainerArr = []; // 显示在more容器中的数组
			for(var fieldI=0;fieldI<moreFieldArr.length;fieldI++){
				if(moreFieldArr[fieldI].showState=='more'){
					showMoreContainerArr.push(moreFieldArr[fieldI]);
				}
			}
			// 全屏显示配置
			var config = {
				type:'more',
				id:'more',
				$this:$(this), // 点击的对象
				formJson:formJson, // 表单配置
				moreFieldArr:moreFieldArr, // 更多数组
				showMoreContainerArr:showMoreContainerArr, // 更多中显示的数组
				containerName:'more', // 容器名字
				btnNameArr:['取消','确定'], // 按钮名
			};
			var html = ''; // 更多字段的html
			for(var moreI=0; moreI<showMoreContainerArr.length; moreI++){
				html += nsComponent.getHTML(showMoreContainerArr[moreI], formJson);
			}
			// 半屏显示 点击按钮回调
			nsComponent.mobileFullContainer.show(config, html, function(resConfig, isConfirm){
				var showMoreContainerArr = resConfig.showMoreContainerArr; // 更多字段数组
				var moreFieldArr = resConfig.moreFieldArr;
				if(isConfirm){
					var html = '';
					for(var fieldI=0;fieldI<showMoreContainerArr.length;fieldI++){
						var value = typeof(showMoreContainerArr[fieldI].value) == "number" ?  showMoreContainerArr[fieldI].value.toString() : showMoreContainerArr[fieldI].value;
						if(value.length>0){
							showMoreContainerArr[fieldI].showState = 'form';
							html += nsComponent.getHTML(showMoreContainerArr[fieldI], formJson);
						}
					}
					resConfig.$this.prev().children('.row').append(html);
					resConfig.$this.prev().children('.row').children('.element-space').remove();
					resConfig.$this.prev().children('.row').append('<div class="col-xs-12 element-space"></div>');
					nsComponent.dataInit(nsFormBase.data[formJson.id].moreFields, formJson.id); // 初始化更多字段的方法
				}else{
					for(var fieldI=0;fieldI<showMoreContainerArr.length;fieldI++){
						if(showMoreContainerArr[fieldI].sourceValue != undefined){
							showMoreContainerArr[fieldI].value = showMoreContainerArr[fieldI].sourceValue;
						}
					}
				}
			});
			nsComponent.dataInit(nsFormBase.data[formJson.id].moreFields, formJson.id); // 初始化更多字段的方法
		});
	}
	// 功能模式更多事件
	var $funcMore = $container.find('form.staticdata').next('.mobile-expand-more');
	if($funcMore.length>0){
		$funcMore.off('click');
		$funcMore.on('click', {formJson:formJson}, function(ev){
			var formJson = ev.data.formJson; // 表单配置
			var formArr = formJson.form; // 表单数组
			// 全屏显示配置
			var config = {
				type:'staticdata',
				id:'staticdata',
				$this:$(this), // 点击的对象
				formJson:formJson, // 表单配置
				form:formArr, // 显示的数组
				containerName:'staticdata', // 容器名字
				// btnNameArr:['取消','删除','修改'], // 按钮名
				btnsType:'staticdata',
			};
			var html = ''; // 更多字段的html
			for(var moreI=0; moreI<formArr.length; moreI++){
				formArr[moreI].showState = 'fullScreen';
				html += nsComponent.getHTML(formArr[moreI], formJson);
			}
			// 半屏显示 点击按钮回调
			nsComponent.mobileFullContainer.show(config, html, function(resConfig, isConfirm){
				var formJson = resConfig.formJson;
				if(isConfirm){
					if(isConfirm == 'delete'){}
					switch(isConfirm){
						case 'delete':
							if(formJson.deleteHandle){
								var formData = nsForm.getFormJSON(formJson.id, false);
								formJson.deleteHandle(formData,formJson);
							}else{
								console.error('没有配置删除方法');
							}
							break;
						case 'modify':
							// if(){}
							break;
					}
				}else{
					// 取消不执行操作
				}
			});
		})
	}
	/***lyw 20190404 从form1移入结束**********/
	// lyw 添加帮助按钮
	nsForm.addHelpBtnToField(formJson);
}
// lyw 表单显示完成后插入帮助按钮
nsForm.addHelpBtnToField = function(formJson){
	if(typeof(formJson.helpConfig) == "object" &&
	 typeof(NetstarComponent) == "object" && 
	 typeof(NetstarComponent.dialogComponent) == "object" && 
	 typeof(NetStarUtils) == "object" && 
	 typeof(NetStarUtils.ajaxForText) == "function"
	){
		for(var key in formJson.helpConfig){
			var name = formJson.helpConfig[key].name;
			var labelForName = 'form-' + formJson.id + '-' + name;
			var $label = $('label[for="' + labelForName + '"]');
			if($label.children('[ns-type="ns-help"]').length == 0){
				var helpBtn = '<button type="button" class="btn btn-white btn-icon" ns-type="ns-help"><i class="fa-question-circle"></i></button>';
				var $help = $(helpBtn);
				$help.off('click');
				$help.on('click', formJson.helpConfig[key], function(ev){
					nsForm.helpDialog(ev.data);
				});
				$label.append($help);
			}
		}
	}
}
// 通过帮助按钮弹出帮助页面
nsForm.helpDialog = function(helpConfig){
	var ajaxConfig = {
		url:helpConfig.value,
		type:'GET',
		plusData : helpConfig,
	}
	NetStarUtils.ajaxForText(ajaxConfig, function(pageStr, _ajaxConfig){
		// var starStr = '<body>';
		var starStr = /\<body(.*?)\>/;
		var endStr = '</body>';
		if(!starStr.test(pageStr)){
			return;
		}
		var plusData = _ajaxConfig.plusData;
		var starStr = pageStr.match(starStr)[0];
        var bodyPage = pageStr.substring(pageStr.indexOf(starStr) + starStr.length, pageStr.indexOf(endStr));
        var dialogConfig = {
			id: 'netstar-help-panel',
			title: plusData.title,
			templateName: 'PC',
			height : 540,
			width : 700,
			zIndex : 1041,
			shownHandler : function(obj){
				var dialogBodyId = obj.config.bodyId;
				var $dialogBody = $('#' + dialogBodyId);
				$dialogBody.append(bodyPage);
			},
		}
		NetstarComponent.dialogComponent.init(dialogConfig);
	});
},
//设定弹框默认属性
nsForm.modalInitData = function(formJson){
	formJson.formType = 'modal';
	formJson.formSource = 'modal';
	formJson.title = typeof(formJson.title) == 'undefined' ? '' : formJson.title;
	formJson.size = typeof(formJson.size) == 'undefined' ? 'm' : formJson.size;
	formJson.note = typeof(formJson.note) == 'undefined' ? '' : formJson.note;
	formJson.form = $.isArray(formJson.form) ? formJson.form : [];
	formJson.btns = $.isArray(formJson.btns) ? formJson.btns : [];
	//弹框判断有两种显示：一种是一行多表单的，一种是单表单的
	var formArr = formJson.form;
	for(var i=0;i<formArr.length; i++){
		if($.isArray(formArr[i])){
			//如果是数组，则证明弹框是个form表单
			formJson.formType = 'form';
			formJson.formSource = 'form';
			break;
		}
	} 
	//是否是第二个弹出框
	formJson.isMoreDialog = typeof(formJson.isMoreDialog)=='boolean'?formJson.isMoreDialog:false;
	formJson = nsForm.setDefault(formJson);
	return nsFormBase.initData(formJson);
} 
//最大高度计算 cy 20180508
nsForm.getDialogMaxHeightString = function(){
	//获取弹出框最大高度的样式表属性字符串
	//返回值是样式表属性字符串 'max-height:466px;';
	var maxHeight = $(window).height();
	
	if(typeof(nsdialog.maxHeightEffectNumber)!='number'){
		var maxHeightParameter = {
			modalPaddingTop:30, 		//弹框整体的上边距
			modalPaddingBottom:30, 		//弹框整体的下边距
			contentPaddingTop:0, 		//modal-content 内容上边距 实际是16但是与title高度重合了
			contentPaddingBottom:16, 	//modal-content 内容下边距
			titleHeight:52, 			//modal-header 标题高度
			footerHeight:46, 			//modal-footer footer高度
			bodyPaddingTop:10, 			//modal-body上边距
			bodyPaddingBottom:10,		//modal-body下边距
		}
		var effectNum = 0;
		for(var key in maxHeightParameter){
			effectNum += maxHeightParameter[key]
		}
		nsdialog.maxHeightEffectNumber = effectNum;
	}
	maxHeight = maxHeight - nsdialog.maxHeightEffectNumber;
	//最小高度
	if(maxHeight<100){
		maxHeight = 100;
	}
	var styleAttrStr =  'max-height:'+maxHeight+'px;';
	return styleAttrStr;
}
//初始化弹框类型
nsForm.modalInit = function(_formJson){
	if($(".modal-backdrop").length>0){
		//是否有弹出框背景
		$(".modal-backdrop").remove();
	}
	var formJson = $.extend(true,{},_formJson);
	//分别存储为field field-more
	//配置
	function getFieldCodeByConfig(formFieldArray){
		if($.isArray(formFieldArray) == false ){
			return [[],[]];
		}
		var fieldArray = [];
		var fieldMoreArray = [];
		var isTwoArr = false; // 是否是二维数组
		// lyw 原来只把一维数组区分field/field-more，修改：一二维数组都可以
		function setArrByMind(fieObj){
			var mindjetFieldPosition = fieObj.mindjetFieldPosition ? fieObj.mindjetFieldPosition : 'field';
			switch(mindjetFieldPosition){
				case 'field':
					fieldArray.push(fieObj);
					break;
				case 'field-more':
					fieldMoreArray.push(fieObj);
					break;
			}
		}
		for(var fieldI=0; fieldI<formFieldArray.length; fieldI++){
			var fieldData = formFieldArray[fieldI];
			if($.isArray(fieldData)){
				isTwoArr = true;
				for(var fieldII=0;fieldII<fieldData.length;fieldII++){
					setArrByMind(fieldData[fieldII]);
				}
			}else{
				setArrByMind(fieldData);
			}
			// var mindjetFieldPosition = fieldData.mindjetFieldPosition ? fieldData.mindjetFieldPosition : 'field';
			// switch(mindjetFieldPosition){
			// 	case 'field':
			// 		fieldArray.push(fieldData);
			// 		break;
			// 	case 'field-more':
			// 		fieldMoreArray.push(fieldData);
			// 		break;
			// }
		}
		if(isTwoArr){
			if(fieldArray.length>0){
				fieldArray = [fieldArray];
			}
			if(fieldMoreArray.length>0){
				fieldMoreArray = [fieldMoreArray];
			}
			return [fieldArray,fieldMoreArray];
		}
		return [fieldArray,fieldMoreArray];
	}
	var formArray = getFieldCodeByConfig(formJson.form);
	//formJson.form = formArray[0];
	//_formJson.field = formArray[0];
	_formJson.fieldMore = formArray[1];
	// 重新排序form field在前 field-more在后边 lyw
	var originalForm = [];
	for(var fieI=0;fieI<formArray[0].length;fieI++){
		originalForm.push(formArray[0][fieI]);
	}
	for(var fieI=0;fieI<formArray[1].length;fieI++){
		originalForm.push(formArray[1][fieI]);
	}
	_formJson.originalForm = originalForm;
	_formJson.form = $.extend(true,[],originalForm);
	_formJson.field = $.extend(true,[],originalForm);
	// _formJson.originalForm = $.extend(true,[],_formJson.form);
	var data = nsForm.modalInitData(formJson);

	//设置是否回调函数仅用在取消，默认为false，全部触发
	formJson.isOnlyCancel = nsVals.getDefaultFalse(formJson.isOnlyCancel);
	formJson.isNotCancelHandler = false; //是否非取消操作
	//前置处理函数
	if(typeof(formJson.showHandler)=='function'){
		formJson.showHandler(formJson);
	}

	var titleHtml = '';
	var smallTitle = '';
	if(formJson.note){
		smallTitle = '<small> <i class="fa fa-angle-double-right"></i> '+formJson.note+' </small>';
	}

	var moreHtml = '';

	if(_formJson.fieldMore.length > 0){
		var expandStr = formJson.fieldMoreTitle ? formJson.fieldMoreTitle : language.common.dialog.showMore;
		var expandMoreId = 'expand-'+formJson.id;
		moreHtml = '<div class="modal-expand-more" nstype="expand" id="'+expandMoreId+'">'+expandStr+'<i class="fa-caret-up"></i></div>';
	}

	if(formJson.title !== ''){
		titleHtml = '<div class="modal-header">'
						+'<button type="button" class="close" data-dismiss="modal" aria-hidden="true" nstype="cancel">&times;</button>'
						+'<h4 class="modal-title">'+formJson.title+smallTitle+'</h4>'
					+'</div>';
	}
	var formTagHeaderHtml, formTagFooterHtml;
	var isOutForm = true;
	if(formJson.form.length==1){
		if(formJson.form[0].html){
			isOutForm = false;
		}
	}
	formJson.isOutForm = isOutForm;
	if(isOutForm){
		formTagHeaderHtml = '<form class="form-horizontal" role="form" id="form-'+formJson.id+'" method="get" action="" onsubmit="return false;">';
		formTagFooterHtml = '</form>';
	}else{
		//如果生成的标签中只有一个自定义标签，则不生form标签
		formTagHeaderHtml = '';
		formTagFooterHtml = '';
	}
	/* 生成按钮 */
	var btnsHtml = "";
	var btnHandlerArr = [];//按钮组件的事件
	var isMoreDialogAttr = ' ns-ismoredialog='+formJson.isMoreDialog;
	
	for(var btnID=0; btnID<formJson.btns.length; btnID++){
		// if(typeof(formJson.btns[btnID].handler)!='undefined'){
		// 	btnHandlerArr.push(formJson.btns[btnID]);
		// }
		btnsHtml += nsButton.getHtml(formJson.btns[btnID],"modal",btnID);
		if(typeof(formJson.btns[btnID].handler)=='function'){ 
			btnHandlerArr.push(formJson.btns[btnID].handler);
		}else{
			btnHandlerArr.push('');
		};
	}
	var contentStr = '';
	var modalBodyStr = 'modal-body';
	var rowStr = 'row-close';
	if(formJson.formSource == 'form'){
		contentStr = 'panel-form';
		modalBodyStr = 'panel-body';
		rowStr = '';
	}
	if(formJson.plusClass){
		rowStr += ' '+formJson.plusClass;
	}
	var isCancelBtnShow = nsVals.getDefaultTrue(formJson.isCancelBtnShow);
	if(isCancelBtnShow){
		btnsHtml += '<button type="button" class="btn btn-white" data-dismiss="modal"><i class="fa fa-ban"></i> '+language.netstarDialog.btns.cancelNoCancel[1]+'</button>'
	}
	
	var styleStr = '';
	//cy 20180508 最大高度
	//styleStr += nsForm.getDialogMaxHeightString();
	styleStr = 'style="'+styleStr+'"'


	var boxHtml = '<div id="'+formJson.id+'" class="modal fade modal-ns">'
					+'<div class="modal-dialog">'
						+'<div class="modal-content '+contentStr+'">'
							+titleHtml
							+'<div class="'+modalBodyStr+'" '+styleStr+'>'
								+formTagHeaderHtml
								+'<div class="row fillbg '+rowStr+'">'
									+data.html
								+'</div>'
								+formTagFooterHtml
								+moreHtml
							+'</div>'
							
							+'<div class="modal-footer" '+isMoreDialogAttr+'>'
								+ btnsHtml
							+'</div>'
						+'</div>'
					+'</div>'
				+'</div>';
	if(formJson.isMoreDialog == false){
		$("#placeholder-popupbox").html(boxHtml);
	}else{
		if($("#placeholder-popupbox-more").length==0){
			$('<div id="placeholder-popupbox-more"></div>').insertAfter("#placeholder-popupbox")
		}
		$("#placeholder-popupbox-more").html(boxHtml);
	}

	//保存按钮事件
	function getSaveBtnHandler(){
		var saveBtnHandler = [];
		for(var btnI=0; btnI < btnHandlerArr.length; btnI++){
			saveBtnHandler.push(btnHandlerArr[btnI]);
		}
		return saveBtnHandler;
	}
	if(formJson.isMoreDialog == false){
		nsDialog.formJson = _formJson;
		nsDialog.btnHandlerArr = getSaveBtnHandler();
		nsDialog.$btns = $("#"+formJson.id+' .modal-footer .btn');
	}else{
		nsDialog.moreFormJson = _formJson;
		nsDialog.moreBtnHandlerArr = getSaveBtnHandler();
		nsDialog.$morebtns = $("#"+formJson.id+' .modal-footer .btn');
	}
	//添加按钮事件
	for(var btnHandlerI = 0; btnHandlerI<btnHandlerArr.length; btnHandlerI++){
		var btnDom = $("#"+formJson.id+' .modal-footer .btn')[btnHandlerI];
		if(typeof(btnHandlerArr[btnHandlerI])=='function'){
			$(btnDom).on('click',function(){
				var isMore = $(this).closest('.modal-footer').attr('ns-ismoredialog');
				isMore = isMore=='true'?true:false;
				var btnHandlerIndexNum = parseInt($(this).attr('fid'));
				var handlerFunc;
				if(isMore){
					handlerFunc = nsDialog.moreBtnHandlerArr[btnHandlerIndexNum];
				}else{
					handlerFunc = nsDialog.btnHandlerArr[btnHandlerIndexNum];
				}
				handlerFunc();
			});
		}
	}

	var sizeStr = formJson.size;
	nsForm.modalShow("#"+formJson.id, sizeStr, formJson);
	nsFormBase.init(formJson);	
}
// 禁用弹框按钮
nsForm.modalBtnsDisabled = function(id, index, isDisabled){
	/*
	 * id : 		string 		弹框id
	 * index : 		string 		按钮索引 可以是多个用逗号隔开
	 * isDisabled : boolean 	是否只读
	 */
	if(typeof(id)!='string'||typeof(index)!='string'||typeof(isDisabled)!='boolean'){
		nsAlert('方法参数未配置完整','error');
		return false;
	}
	var $dialog = $('#'+id);
	if($dialog.length==0){
		nsAlert('弹框不存在','error');
		return false;
	}
	var $modalfooter = $dialog.find('.modal-footer');
	if(index.indexOf(',')>-1){
		var indexArr = index.split(',');
		for(var i=0;i<indexArr.length;i++){
			$modalfooter.find('button[fid="'+indexArr[i]+'"]').attr('disabled', isDisabled);
		}
	}else{
		$modalfooter.find('button[fid="'+index+'"]').attr('disabled', isDisabled);
	}
}
//第二次弹框
nsForm.modalInitMore = function(formJson){
	formJson.isMoreDialog = true;
	nsForm.modalInit(formJson);
}
popupBoxMore.initShow = nsForm.modalInitMore;
nsdialogMore.initShow = nsForm.modalInitMore;
nsForm.modalShow = function(domStr, domSize, formJson){
	var domSizeName = arguments[1] ? arguments[1] : "m";
	if(formJson.isMoreDialog == false){
		// nsDialog.modal = $(domStr).modal('show', {backdrop: 'static'});
		if(typeof(formJson.isBackdropFalse)=='boolean'){
			nsDialog.modal = $(domStr).modal({backdrop: formJson.isBackdropFalse});
			if(formJson.isBackdropFalse == false){
				//动态添加一个遮罩层class
				$(domStr).attr('backdrop',true);
			}
		}else{
			nsDialog.modal = $(domStr).modal('show', {backdrop: 'static'});
		}
	}else{
		nsDialog.moreModal = $(domStr).modal('show', {backdrop: false});
	}
	
	//弹框关闭事件处理 主要用于特定类型组件的销毁
	$('#'+formJson.id).on('hide.bs.modal', formJson, function (ev) {
		// 判断是否需要验证关闭是否保存若没保存不关闭弹框
		if($(ev.target).is($(this))){ // 判断是否是弹框容器
			if(formJson.isCloseConfirm != true){
				if(formJson.isValidSave){
					var dialogFormData = nsdialog.getFormJson(false);
					if(dialogFormData){
						var sourceFormData = formJson.sourceValues;
						var isSave = nsVals.isEqualObject(sourceFormData,dialogFormData); // 是否保存 默认是
						if(!isSave){
							nsConfirm("没有保存数据？确定关闭吗？",function(isClose){
								if(isClose){
									formJson.isCloseConfirm = true;
									if(!formJson.isBackdropFalse){
										$('#'+formJson.id).removeAttr('backdrop');//关闭弹框关闭遮罩层
									}
									nsForm.modalHide();
								}
							});
							return false;
						}
					}
				}else{
					if(!formJson.isBackdropFalse){
						$('#'+formJson.id).removeAttr('backdrop');//关闭弹框关闭遮罩层
					}
				}
			}
		}
		
		//完成之前的回调
		if(typeof(ev.data.hideBeforeHandler)=='function'){
			var resultData = nsdialog.getFormJson(false);
			var isClose = ev.data.hideBeforeHandler(resultData);
			if(typeof(isClose)=='boolean'){
				return isClose;
			}
		}
		//销毁必要的表单组件
		for(var cI = 0; cI<formJson.form.length; cI++){
			//UEditor必须销毁
			if(formJson.form[cI].type == 'ueditor'){
				formJson.form[cI].ueditor.destroy();
			}
		}
		//完成之后的回调
		if(typeof(ev.data.hideAfterHandler)=='function'){
			var resultData = nsdialog.getFormJson(false);
			ev.data.hideAfterHandler(resultData);
		}
	})
	//根据类别初始化表单中的组件
	function initDataInit(formJson){

		var isNeedInit = true;  //是否需要初始化组件
		if($.isArray(formJson.form) == false){
			//如果没有组件对象 则不需要初始化
			return ;
		}else{
			if(formJson.form.length == 0){
				//如果没有组件对象 则不需要初始化
				return ;
			}
		}
		
		//存在data的定义  主要过滤里面只有html的是不存在data
		var formInput = nsForm.data[formJson.id].formInput;
		for(var input in formInput){
			var cInput = formInput[input];
			switch(cInput.type){
				case 'webupload':
					nsWebuploader.init(cInput.uploadConfig);
					break;
				case 'upload':
					nsComponent.init.uploadObj(cInput);
					break;
				case 'flowchartviewer':
					if(cInput.$workflowContainer){
						cInput.$workflowContainer.children().remove();
					}
					nsUI.flowChartViewer.init(cInput);
					break;
			}
		}
		// lyw 添加帮助按钮
		nsForm.addHelpBtnToField(formJson);
	};
	//弹框完全显示出来后的回调函数 cy 20180315
	$('#'+formJson.id).on('shown.bs.modal', formJson, function (ev) {
		initDataInit(formJson);
		// lyw 弹框完全显示出来之后保存弹框的原始值 原因：点击弹框右上角关闭按钮时需要和原始值比较
		formJson.sourceValues = nsdialog.getFormJson(false);
		if(typeof(formJson.shownHandler)=='function'){
			formJson.shownHandler(formJson);
		}
	})
	
	if(typeof(formJson.hideHandler)=='function'){
		
		$('#'+formJson.id).on('hidden.bs.modal', formJson, function (ev) {
			if(typeof(ev.data.isOnlyCancel)=='boolean'){
				if(ev.data.isOnlyCancel == true){
					if(isCancelBtn == true){
						var resultData = nsdialog.getFormJson(false);
						ev.data.hideHandler(resultData, isCancelBtn);
					}
				}
			}else{
				var resultData = nsdialog.getFormJson(false);
				ev.data.hideHandler(resultData, isCancelBtn);
			}
			
		})
	}
	if(!$(domStr).hasClass("custom-width")){
		$(domStr).addClass("custom-width");
	}
	// 自定义层级高度 lyw 2018/08/29
	if(typeof(formJson.zIndex)!='undefined'){
		$(domStr).css('z-index',formJson.zIndex);
	}

	var widthStr = "600px";
	switch(domSizeName){
		case "s":
			widthStr = "400px";
			break;
		case "m":
			widthStr = "600px";
			break;
		case "b":
			widthStr = "800px";
			break;
		case "f":
			widthStr = "100%";
			break;
		default:
			widthStr = domSize;
			break;
	}
	//手机模式下全都是100% cy 20180914
	if(nsVals.browser){
		if(nsVals.browser.browserSystem == 'mobile'){
			widthStr = '100%';
		}
	}
	$(domStr+" .modal-dialog").attr("style","width:"+widthStr);
	// //取消按钮事件
	var isCancelBtn = false;
	$("#"+formJson.id+' [nstype="cancel"]').on('click', function(ev){
		isCancelBtn = true;
	});
	$("#"+formJson.id+' [data-dismiss="modal"]').on('click', function(ev){
		isCancelBtn = true;
	});
	//展开关闭更多功能
	//var domValueJson = {};
	$(domStr+" [nstype='expand']").on('click',function(ev){
		ev.stopPropagation();
		var $this = $(this);
		$this.toggleClass('open');
		var formId = $this.attr('id');
		var prefixStr = 'expand-';
		formId = formId.substring(prefixStr.length,formId.length);
		var expandFieldArr = $.extend(true,[],nsFormBase.data[formId].moreFieldArr);
		var isExpand = false;
		if(!$this.hasClass('open')){
			isExpand = true;
		}
		for(var expandI=0; expandI<expandFieldArr.length; expandI++){
			expandFieldArr[expandI].value = $('#'+expandFieldArr[expandI].fullID).val();
			expandFieldArr[expandI].hidden = isExpand;
		}
		nsForm.edit(expandFieldArr,formId);
		/*var $this = $(this);
		var formJson = $.extend(true,{},nsDialog.formJson);
		$this.toggleClass('open');
		var isClose = false;
		if($this.hasClass('open')){
			//打开
			formJson.form = formJson.originalForm;
			for(var formI=0; formI<formJson.form.length; formI++){
				formJson.form[formI].commonChangeHandler = function(configObj){
					domValueJson[configObj.id] = configObj.value;
				}
			}
		}else{
			isClose = true;
			formJson.form = formJson.field;
			for(var formI=0; formI<formJson.fieldMore.length; formI++){
				formJson.form.unshift({
					id:formJson.fieldMore[formI].id,
					type:'hidden'
				});
			}
		}
		var formData = nsForm.getFormJSON(formJson.id,false);
		domValueJson = $.extend(true,formData,domValueJson);
		nsForm.modalRefresh(formJson,domValueJson);*/
	});
}
//弹框隐藏
nsForm.modalHide = function(){
	nsDialog.formJson = undefined;
	if(nsDialog.modal){
		nsDialog.modal.modal('hide');
	}
}
//二次弹框隐藏
nsForm.moreModalHide = function(){
	nsDialog.moreFormJson = undefined;
	nsDialog.moreModal.modal('hide');
}
nsdialogMore.hide = nsForm.moreModalHide;
popupBoxMore.hide = nsForm.moreModalHide;
//弹框数据
nsForm.modalFormJson = function(isValid){
	if(typeof(isValid)!='boolean'){
		isValid = true;
	}
	if(nsDialog.formJson){
		return nsForm.getFormJSON(nsDialog.formJson.id, isValid);
	}
}
//弹框刷新
nsForm.modalRefresh = function(formJson,valueJson){
	var formId = formJson.id;
	var formData = valueJson;
	for(var valueI=0; valueI<formJson.form.length; valueI++){
		if(formData[formJson.form[valueI].id]){
			formJson.form[valueI].value = formData[formJson.form[valueI].id];
		}
	}
	var data = nsForm.modalInitData(formJson);
	var $form = $('#form-'+formJson.id);
	$form.children('.row').html(data.html);
	nsFormBase.init(formJson);
}
nsdialog.refresh = nsForm.modalRefresh;
//二次弹框数据
nsForm.moreModalFormJson = function(){
	if(nsDialog.moreFormJson){
		return nsForm.getFormJSON(nsDialog.moreFormJson.id);
	}
}
popupBoxMore.getFormJson = nsForm.moreModalFormJson;
//获得表格表单的初始化对象
nsForm.tableInitData = function(formJson){
	formJson.formType = 'table';
	formJson.formSource = 'table';
	formJson = nsForm.setDefault(formJson);
	return nsFormBase.initData(formJson);
}
nsForm.tableInit = function(formJson){
	var data = nsForm.tableInitData(formJson);
	
	var html = '';
	for(var i = 0; i<formJson.form[0].length; i++){
		var inputConfig = formJson.form[0][i];
		html += '<th ns-th-id="'+inputConfig.id+'"><div class="title">'+inputConfig.label+'</div></th>'
	}
	var style = '';
	style += 'width:'+formJson.tableWidth; //宽度
	style = 'style="'+style+'"';
	var cls = 'ns-form-table';
	if(formJson.noSelect){
		cls+=' no-select'
	}
	cls = 'class="'+cls+'"'

	html = 
		'<table '+cls+' '+style+'>'
			+'<thead>'
			+'<tr>' 
				+ html 
			+ '</tr>'
			+'</thead>'
			+'<tbody>'
			+'<tr>'
				+data.html
			+'</tr>'
			+'</tbody>'
		+'</table>'
	html = '<form role="form" id="form-'+formJson.id+'" method="'+formJson.formMethod+'" action="">'
				+html
			+'</form>'
	var $container = nsForm.getContainer(formJson.id);
	$container.html(html);
	//是否允许拖拽
	// if(formJson.dragWidth){

	// }
	nsFormBase.init(formJson);
}
//表格数据列拖拽改变宽度事件 回头要放到nstable.js里面去
nsForm.tableRresizeThHandler = function(ev){
	var $table = $(this).closest('.ns-form-table')
	var tableWidthNum = $table.width();
	var theads = $table.find('thead th');
	var thNumArr = [];
	for(var i=0; i<theads.length; i++){
		thWidthNum = theads.eq(i).width();
		thWidthNum = thWidthNum/tableWidthNum *100;
		thNumArr.push(thWidthNum);
		theads.eq(i).css('width',thWidthNum+'%');
	}
	var $cth = $(this).parent();
	var $nth = $cth.next();
	var thIndex =  $cth.index();
	var thNextIndex = thIndex+1;
	//$cth.css('width',($cth[0].clientWidth+1)+'px');
	var startX = ev.pageX;
	var startW = $cth[0].clientWidth+1;
	$(document).on('mousemove',function(moveev){
		ev.stopPropagation();
		var moveX = moveev.pageX;
		var moveWidth = (moveX-startX)/tableWidthNum *100;
		//console.log(moveWidth);
		var cthW = thNumArr[thIndex]+moveWidth;
		var nthW = thNumArr[thNextIndex]-moveWidth;
		$cth.css('width',cthW+'%');
		$nth.css('width',nthW+'%');
	});
	$(document).on('mouseup',function(upev){
		var endX = upev.pageX;
		var endWidth = (endX-startX)/tableWidthNum *100;
		thNumArr[thIndex] = thNumArr[thIndex]+endWidth;
		thNumArr[thNextIndex]= thNumArr[thNextIndex]-endWidth;
		$cth.css('width',thNumArr[thIndex]+'%');
		$nth.css('width',thNumArr[thNextIndex]+'%');
		$(document).off('mouseup');
		$(document).off('mousemove');
		if(ev.data){
			if(typeof(ev.data.returnHandler)=='function'){
				for(numI in thNumArr){
					thNumArr[numI] = thNumArr[numI].toFixed(2);
				}
				var returnData = {
					thWidth:thNumArr
				}
				ev.data.returnHandler(returnData);
			}
		}
		
	});
}
//表格拖拽改变宽度事件 回头要放到nstable.js里面去
nsForm.tableRresizeTableHandler = function(ev){
	var $table = $(this).closest('.ns-form-table');
	var startX = ev.pageX;
	var containerW = $(this).closest('.table-container').width();
	var startW = $table.width();
	$table.css('width',startW+'px');
	
	$(document).on('mousemove',function(moveev){
		ev.stopPropagation();
		var moveX = moveev.pageX;
		var moveWidth = (moveX-startX)+startW;
		$table.css('width',moveWidth+'px');
	});
	$(document).on('mouseup',function(upev){
		var endX = upev.pageX;
		var endWidth = (endX-startX)+startW;
		var widthType = 'px';
		$table.css('width',endWidth+'px');
		
		$(document).off('mouseup');
		$(document).off('mousemove');
		if(ev.data){
			if(typeof(ev.data.formJson)=='object'){
				//如果原始的宽度设置是百分比，则还原成百分比
				if(typeof(ev.data.formJson.tableWidth)=='string'){
					if(ev.data.formJson.tableWidth.indexOf('%')>-1){
						endWidth = (endWidth/containerW)*100;
						widthType = '%';
						$table.css('width',endWidth+'%');
					}
				}
			}
			if(typeof(ev.data.returnHandler)=='function'){
				var returnData = {
					tableWidth:{
						number:Number(endWidth.toFixed(2)),
						type:widthType
					}
				}
				ev.data.returnHandler(returnData);
			}
		}
		
	});
}         
//获取制定id的配置文件
nsForm.getFormConfig = function(formID){
	return nsFormBase.form[formID];
}
//获取id指定的对象，有验证
nsForm.getContainer = function(id){
	var $container = $('#'+id);
	if(debugerMode){
		if($container.length!=1){
			console.error('无法找到 id：'+id+'的DOM对象')
			return false;
		}
	}
	return $container;
}
//制定的ID获取配置参数
nsForm.getConfigById = function(id,formID){
	//返回配置文件
	//id:string (配置文件中的组件id)
	//formID:string(配置文件中的表单id)
	if(debugerMode){
		if(typeof(nsForm.data[formID])!='object'){
			if(typeof(nsForm.data[formID])!='object'){
				console.error('formID:'+formID+' 无法找到表单的配置参数');
				console.error(nsForm.data);
			}
		}else{
			if(typeof(nsForm.data[formID].formInput[id])!='object'){
				console.error('id:'+id+' 无法找到表单的配置参数');
				console.error(nsForm.data[formID]);
			}
		}
	}
	return nsForm.data[formID].formInput[id];
}
//通过组件的$对象，获取配置参数
nsForm.getConfigByDom = function($dom,componentID){
	//通过组件的$对象，获取配置参数, $dom应当包含ns-id属性
	//componentID选填，仅用于$对象不是ns-id原始对象的情况下
	//返回值是指定组件的配置参数 object
	var config;
	if(debugerMode){
		if(typeof($dom)!='object'){
			console.error('nsForm.getConfigByDom() 缺少基本参数 $dom，类型为 $() 对象');
		}else{
			if($dom.length==0){
				console.error('nsForm.getConfigByDom() $dom 无法找到');
			}
		}
	}
	var baseFormID = $dom[0].form.id.replace('form-','');
	var formJson = nsForm.getFormConfig(baseFormID);
	if(debugerMode){
		if(typeof(formJson)!='object'){
			console.error('nsForm.getConfigByDom() 无法根据当前对象找到form配置参数');
			console.error($dom);
		}
	}
	var baseComponentID;
	if(typeof(componentID)=='string'){
		baseComponentID = componentID;
	}else{
		baseComponentID = $dom.attr('ns-id');
		if(typeof(baseComponentID)=='undefined'){
			if(debugerMode){
				console.error('nsForm.getConfig() ns-id属性不存在，无法获取组件原始ID，请检查代码和参数，或指定组件ID')
				console.error($dom);
			}
		}
	}
	
	config = formJson.component[baseComponentID];
	if(debugerMode){
		if(typeof(config)!='object'){
			console.error('无法找到组件的配置参数，表单配置如下：');
			console.log(formJson)
		}
	}
	return config;
}
//显示隐藏状态的组件
nsForm.showByID = function(id,formID){
	//显示隐藏状态的组件
	//id:string (配置文件中的组件id)
	//formID:string(配置文件中的表单id)
	var config = nsForm.data[formID].formInput[id];
	var fullID = config.fullID;
	switch(config.type){
		case 'radio':
		case 'checkbox':
		case 'daterangeRadio':
			fullID = config.fullID + '-0';
			break;
		case 'provincelinkSelect':
			fullID = fullID + '-province';
			break;
		case 'label':
			$('label[for="'+fullID+'"]').removeClass('hidden');
			break;
	}
	if(nsForm.data[formID].formType == 'modal'){
		$('#'+fullID).closest('.form-group').removeClass('hidden');
	}else{
		$('#'+fullID).closest('.form-td').removeClass('hidden');
	}
}
//隐藏组件
nsForm.hideByID = function(id,formID){
	//隐藏组件
	//id:string (配置文件中的组件id)
	//formID:string(配置文件中的表单id)
	var config = nsForm.data[formID].formInput[id];
	var fullID = config.fullID;
	switch(config.type){
		case 'radio':
		case 'checkbox':
		case 'daterangeRadio':
			fullID = config.fullID + '-0';
			break;
		case 'label':
			$('label[for="'+fullID+'"]').addClass('hidden');
			break;	
		case 'provincelinkSelect':
			fullID = fullID + '-province';
			break;
	}
	if(nsForm.data[formID].formType == 'modal'){
		$('#'+fullID).closest('.form-group').addClass('hidden');
	}else{
		$('#'+fullID).closest('.form-td').addClass('hidden');
	}
}
nsForm.append = function(appendArr,formID,appendID){
	var appendHtml = '';
	var validateArr = [];
	var fillFormID = 'form-'+formID;
	for(var appendI = 0; appendI < appendArr.length; appendI ++){
		if(typeof(appendArr[appendI].id) == 'undefined'){
			if(typeof(appendArr[appendI].html)!='undefined'){
				appendHtml += appendArr[appendI].html;
			}
		}else{
			if($('#'+fillFormID+'-'+appendArr[appendI].id).length > 0){
				//已经存在的元素
				appendHtml += '';
			}else{
				var formJson = nsFormBase.data[formID].config;
				if(debugerMode){ //判断是否有这个表单配置参数
					if(typeof(formJson)!='object'){
						console.error('formID:'+formID+' 无法找到表单的配置参数');
					}
				}
				appendHtml += nsComponent.getHTML(appendArr[appendI],formJson);
				validateArr.push(appendArr[appendI]);
			}
		}
	}
	if(typeof(appendID) == 'undefined'){
		$('#'+fillFormID).children('.row').last().append(appendHtml);
	}else{
		$('#'+fillFormID+'-'+appendID).closest('.row.row-close.fillbg').append(appendHtml);
	}
	//是否有验证的对象
	if(validateArr.length>0){
		nsFormBase.validate(formID,validateArr);
	}
	//初始化select组件
	$('.form-item.select select').selectBoxIt().on('open', function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	});

	$('.form-item.selectplane select').selectBoxIt().on('open',function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	})
}
nsForm.delete = function(formID,deleteArr){
	if(typeof(deleteArr) == 'object'){
		for(var delI = 0; delI < deleteArr.length; delI ++){
			var delID = 'form-'+formID+'-'+deleteArr[delI];
			$('#'+delID).closest('.form-td').remove();
		}
	}
}
nsForm.selectAppend = function(formID,selectOptions){
	var selectID = selectOptions.id;
	var $select = $('#form-'+formID+'-'+selectID);
	var isDisabled = selectOptions.isDisabled ? selectOptions.isDisabled : false;
	var optionsArr = selectOptions.subdata;
	var optionStr = '';
	for(var optionI = 0; optionI < optionsArr.length; optionI ++){
		var selectedStr = optionsArr[optionI].selected ? 'selected':'';
		var optionStr = '<option value="'+optionsArr[optionI].value+'" '+selectedStr+'>'+optionsArr[optionI].text+'</option>';
	}
	$select.append(optionStr);
	if(isDisabled){
		$select.attr('disabled',true);
	}
	var $selectBoxOption = $select.selectBoxIt().data("selectBox-selectBoxIt");
	$selectBoxOption.refresh();
}
//将表单内容生成json  
nsForm.getFormData = function(formID){
	if($("#form-"+formID).length==0){
		nsalert('表单ID：'+formID+' 不存在','error');
		return false;
	}
	function getJson(){
		if(typeof(nsForm.data[formID])!='object'){
			return {};
		}
		var formArr = nsForm.data[formID].formInput;
		var formDataJson = {};
		for(var inputkey in formArr){
			var inputValue;
			var config = formArr[inputkey];
			var inputType = config.type;
			if(inputType == 'hidden' || config.hidden){

			}else{
				switch(inputType){
					case 'radio':
					case 'daterangeRadio':
						//单选
						inputValue = $.trim($('[name="'+config.fullID+'"]:checked').val());
						inputValue = typeof(inputValue) == 'string' ? inputValue : '';
						var textStr = $.trim($('[name="'+config.fullID+'"]:checked').prev().text());
						formDataJson[inputkey] = {
							value:inputValue,
							text:textStr,
							label:config.label,
							config:config
						};
						break;
					case 'checkbox':
						var $checkbox = $('[name="'+config.fullID+'"]:checked');
						var valuesStr = '';
						var textsStr = '';
						var subdata = [];
						$checkbox.each(function(key,value){
							var valueStr = $.trim($(value).val());
							var textStr = $.trim($(value).prev().text());
							valuesStr += valueStr + ',';
							textsStr += textStr + ',';
							subdata.push({id:valueStr,value:textStr});
						})
						valuesStr = valuesStr.substring(0,valuesStr.lastIndexOf(','));
						textsStr = textsStr.substring(0,textsStr.lastIndexOf(','));
						formDataJson[inputkey] = {
							value:valuesStr,
							text:textsStr,
							subdata:subdata,
							label:config.label,
							config:config,
						}
						break;
					case 'select':
						formDataJson[inputkey] = {
							value:$.trim($('#'+config.fullID).val()),
							text:$.trim($('#'+config.fullID).find('option:selected').text()),
							label:config.label,
							config:config
						}
						if(formDataJson[inputkey].value == ''){
							formDataJson[inputkey].text = '';
						}
						break;
					case 'select2':
						var selectArr = $('#'+config.fullID).select2("data");
						var ids = '';
						var texts = '';
						for(var i=0; i<selectArr.length; i++){
							ids += selectArr[i].id + ',';
							texts += selectArr[i].text + ',';
						}
						ids = ids.substring(0,ids.lastIndexOf(','));
						texts = texts.substring(0,texts.lastIndexOf(','));
						formDataJson[inputkey] = {
							value:ids,
							text:texts,
							label:config.label,
							config:config,
							subdata:selectArr
						}
						break;
					default:
						inputValue = $.trim($('#'+config.fullID).val());
						inputValue = typeof(inputValue) == 'undefined' ? '' : inputValue;
						formDataJson[inputkey] = {
							value:inputValue,
							text:inputValue,
							label:config.label,
							config:config
						};
						break;
				}
			}
		}
		return formDataJson;
	}
	return getJson();
}
nsForm.getFormJSONMobile = function(formID, isNeedValid, isForm){
	// isForm : 是否时表单获取值 默认是
	isForm = typeof(isForm) == "boolean" ? isForm : true;
	if(isForm && $("#form-"+formID).length==0){
		nsalert('表单ID：'+formID+' 不存在','error');
		return false;
	}
	if(typeof(isNeedValid)!='boolean'){
		isNeedValid = true;
	}
	var formJson = nsForm.data[formID];
	var formComponent = formJson.formInput; // 当前表单所有组件
	var formDataJson = {}; 	// 保存值
	var isPastValid = true; // 验证是否通过
	for(var componentId in formComponent){
		var value = '';
		var component = formComponent[componentId];
		var _isNeedValid = isNeedValid;
		var isContinue = false;
		if(component.hidden || component.type==="hidden"){
			_isNeedValid = false;
		}
		switch(component.type){
			case 'text':
			case 'textarea':
			case 'number':
				value = nsUI.textInput.getValue(component, _isNeedValid);
				break;
			case 'radio':
				value = nsUI.radioInput.getValue(component, _isNeedValid);
				break;
			case 'checkbox':
				value = nsUI.checkboxInput.getValue(component, _isNeedValid);
				break;
			case 'date':
				value = nsUI.dateInput.getValue(component, _isNeedValid);
				break;
			case 'datetime':
				value = nsUI.datetimeInput.getValue(component, _isNeedValid);
				break;
			case 'map':
				value = nsUI.mapInput.getValue(component, _isNeedValid);
				break;
			case 'daterangepicker':
				value = nsUI.daterangepickerInput.getValue(component, _isNeedValid);
				break;
			case 'hidden':
				//如果需要跳过该值，则不输出到formDataJson中 cy 20180823
				if(component.isWithoutFormJSON){
					//跳过该值
				}else{
					value = $.trim($('#'+component.fullID).val());
				}
				break;
			case 'provinceSelect':
				// 省市联动
				value = nsUI.provinceselectInput.getValueMobile(component, _isNeedValid);
				break;
			case 'sortAtHalfScreen':
				//sjj 20190417 手机端半屏模式下排序
				value = nsUI.sortAtHalfScreen.getValue(component,_isNeedValid);
				break;
			case 'uploadImage':
				value = nsUI.uploadImageInput.getValue(component, _isNeedValid);
				break;
			case 'adderSubtracter':
				value = nsUI.adderSubtracterInput.getValue(component, _isNeedValid);
				break;
			case 'business':
				value = nsUI.businessInput.getValue(component, _isNeedValid);
				break;
		}
		if(value===false){
			isPastValid = false;
		}else{
			switch(component.type){
				case 'daterangepicker':
					isContinue = true;
					for(var key in value){
						formDataJson[key] = value[key];
					}
					break;
				case 'radio':
				case 'checkbox':
					if(typeof(value) == "object" && typeof(component.outputFields) == "object" && !$.isEmptyObject(component.outputFields)){
						isContinue = true;
						for(var key in value){
							formDataJson[key] = value[key];
						}
					}
					break;
				case 'business':
                    if(component.isReadOutputFields && typeof(value) == "object"){
						isContinue = true;
                        for(var key in value){
                            formDataJson[key] = value[key];
                        }
                    }
					break;
			}
		}
		if(isContinue){
			continue;
		}
		formDataJson[componentId] = value;
	}
	if(isPastValid){
		return formDataJson;
	}else{
		nsalert(language.common.fromplane.validationFailure);
		return false;
	}
}
// 表单清空
nsForm.clearValues = function(formID, isClear){
    /**
     * formID       string          表单id
     * isClear      boolean         是否清空默认值 默认清空 true
     */
    isClear = typeof(isClear) == "boolean" ? isClear : true;
	var formConfig = nsForm.organizaData[formID];
	if(typeof(formConfig) != "object"){
		nsalert('表单ID：'+formID+' 不存在','error');
		return false;
	}
	// 清空原始容器
	$('#' + formID).children().remove();
	if(isClear){
		var formArr = formConfig.form;
		for(var i=0; i<formArr.length; i++){
			formArr[i].value = '';
		}
	}
	nsForm.init(formConfig);
}
//isNeedValid (boolean) 是否要验证，默认为true，需要验证
nsForm.getFormJSON = function(formID, isNeedValid, isForm){
	// isForm : 是否时表单获取值 默认是
	isForm = typeof(isForm) == "boolean" ? isForm : true;
	if(isForm && $("#form-"+formID).length==0){
		nsalert('表单ID：'+formID+' 不存在','error');
		return false;
	}
	// 这段花用于移动端转方法获取值 lyw 20181206
	var formJson = nsForm.data[formID];
	if(formJson){
		var formSource = formJson.formType;
		if(formSource == 'halfScreen'||
			formSource == 'fullScreen'||
			formSource == 'inlineScreen'||
			formSource == 'staticData'
		){
			var formDataJson = nsForm.getFormJSONMobile(formID, isNeedValid, isForm);
			if(formDataJson){
				return formDataJson;
			}else{
				return false;
			}
		}
	}

	if(typeof(isNeedValid)!='boolean'){
		isNeedValid = true;
	}
	
	function getFormValid(){
		var validBln = true;
		var errorArrID = [];
		//默认验证规则是否通过
		/*if($("#form-"+formID).valid()==false){
			validBln = false;
		}*/
		/*if(typeof(nsForm.data[formID])=='object'){
			var formArr = nsForm.data[formID].formInput;
			for(var inputkey in formArr){
				var config = formArr[inputkey];
				var inputType = config.type;
				if(inputType == 'personSelect' || inputType == 'personSelectSystem'){
					continue;
				}else{
					if($("#form-"+formID).valid()==false){
					validBln = false;
					}
				}
			}
		}*/
		if(nsForm.data[formID]){
			if(!$("#form-"+formID).valid()){validBln = false;}
		}
		var rulesJson = nsForm.rules[formID];
		for(var ruleI in rulesJson){
			var rules = rulesJson[ruleI];
			for(var errorI in rules){
				switch(errorI){
					case 'select':
					case 'select2':
						if($.trim($('#'+ruleI).val()) === ''){
							errorArrID.push(ruleI);
						}
						break;
					case 'uploadSingle':
						if($.trim($('#'+ruleI).text()) == language.datatable.fillStatus.required || $.trim($('#'+ruleI).text()) === ''){
							errorArrID.push(ruleI);
						}
						break;
					case 'radio':
					case 'checkbox':
					case 'daterangeRadio':
						if($('[name="'+ruleI+'"]').is(':checked')){
							var valueStr = $('[name="'+ruleI+'"]:checked').val();
							if(typeof(valueStr)=='string'){
								if(valueStr == ''){
									errorArrID.push(ruleI);
								}
							}
						}else{
							errorArrID.push(ruleI);
						}
						break;
					case 'min':
						var textVal = $('#'+ruleI).val();
						if(textVal < rules[errorI]){
							validBln = false;
						}
						break;
					/*default:
						if(rules[errorI] == false){
							//验证失败
							errorArrID.push(ruleI);
						}
						break;*/
				}
			}
		}
		if(errorArrID.length > 0){
			validBln = false;
			for(var index = 0; index < errorArrID.length; index ++){
				var $error = $('#'+errorArrID[index]);
				if($error.length == 0){
					$error = $('#'+errorArrID[index]+'-0');
				}
				if($error.parent().children().hasClass('has-error')){
					$error.parent().find('.has-error').remove();
				}
				$error.parent().append('<label class="has-error">'+language.datatable.fillStatus.required+'</label>');
			}
		}
		if(typeof(nsForm.data[formID])=='object'){
			var formArr = nsForm.data[formID].formInput;
			for(var inputkey in formArr){
				var config = formArr[inputkey];
				var inputType = config.type;
				switch(inputType){
					//人员选择器
					case 'personSelect':
						var isPSvalid = nsUI.personSelect.isValid(formArr[inputkey]);
						if(isPSvalid==false){
							validBln = false;
						}
						break;
					case 'personSelectSystem':
						var isPSvalid = nsUI.systemPerson.isValid(formArr[inputkey]);
						if(isPSvalid == false){
							validBln = false;
						}
						break;
					//dateTimeInput返回的值如果是false则是验证不通过
					case 'dateTimeInput':
						var isPSvalid = nsUI.dateTimeInput.getValue(config);
						if(isPSvalid === false){
							validBln = false;
						}
						break;
				}
			}
		}
		
		return validBln;
	}
	function getJson(){
		if(typeof(nsForm.data[formID])!='object'){
			return {};
		}
		var formArr = nsForm.data[formID].formInput;
		var formDataJson = {};
		for(var inputkey in formArr){
			function getFormValue(){
				var inputValue;
				var config = formArr[inputkey];
				var inputType = config.type;
				var $container = config.$container;
				switch(inputType){
					case 'selectText':
					case 'textSelect':
						//下拉框文本  //文本下拉框
						formDataJson[inputkey] = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
						var selectID = config.select.id;
						var textID = config.text.id;
						var formSelectID = 'form-'+formID+'-'+selectID;
						var selectvalue = $('#form-'+formID+' #'+formSelectID).val().trim();
						formDataJson[selectID] = selectvalue;
						var formTextID = 'form-'+formID+'-'+textID;
						var textvalue = $('#form-'+formID+' #'+formTextID).val().trim();
						formDataJson[textID] = textvalue;
						break;
					case 'selectDate':
						//下拉框日期组件
						var formPreID = 'form-'+formID+'-';
						//下拉条件
						var caseSelectID = config.caseSelect.id;
						var caseSelectvalue = $('#form-'+formID+' #'+formPreID+caseSelectID).val().trim();
						formDataJson[caseSelectID] = caseSelectvalue;
						//判断到底应该是显示了哪个
						if(config.text.hidden == false){
							config.selectDataType = 'text';
						}else if(config.date.hidden == false){
							config.selectDataType = 'date';
						}else if(config.daterange.hidden == false){
							config.selectDataType = 'daterange';
						}
						//根据显示的类型判断返回值  第二个组件的返回值
						var textID = config.text.id;
						var textvalue = '';
						var dateID = config.date.id;
						var datevalue = '';
						var dateRangeID = config.daterange.id;
						var daterangevalue = false;
						switch(config.selectDataType){
							case 'text':
								textvalue = $('#form-'+formID+' #'+formPreID+textID).val().trim();
								break;
							case 'date':
								datevalue = $('#form-'+formID+' #'+formPreID+dateID).val().trim();
								break;
							case 'daterange':
								//daterangevalue = $('#form-'+formID+' #'+formPreID+dateRangeID).children('span').text().trim();
								daterangevalue =  $.trim($('#form-'+formID+' #'+formPreID+dateRangeID).val());
						}
						if(daterangevalue){
							var daterangeStart = daterangevalue.substring(0,daterangevalue.indexOf(' '));
							var daterangeEnd = daterangevalue.substring(daterangevalue.lastIndexOf(' '),daterangevalue.length);
							formDataJson[dateID] = daterangeStart;
							formDataJson[dateRangeID] = daterangeEnd;
						}else{
							formDataJson[dateID] = datevalue;
							formDataJson[dateRangeID] = '';
						}
						formDataJson[textID] = textvalue;
						formDataJson[inputkey] = inputkey;
						break;
					case 'selectSelect':
						//下拉框下拉框组件
						var formPreID = 'form-'+formID+'-';
						var firstSelectID = config.firstSelect.id;
						var secondSelectID = config.secondSelect.id;
						var firstvalue = $('#form-'+formID+' #'+formPreID+firstSelectID).val().trim();
						var secondvalue = $('#form-'+formID+' #'+formPreID+secondSelectID).val().trim();
						formDataJson[firstSelectID] = firstvalue;
						formDataJson[secondSelectID] = secondvalue;
						formDataJson[inputkey] = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
						break;
					case 'radio':
					case 'daterangeRadio':
						//单选
						inputValue = $.trim($container.find('input[name="form-'+formID+'-'+inputkey+'"]:checked').val());
						inputValue = typeof(inputValue) == 'string' ? inputValue : '';
						formDataJson[inputkey] = inputValue;
						break;
					case 'checkbox':
						//复选
						var checkboxObj = $container.find('input[name="form-'+formID+'-'+inputkey+'"]');
						var $checkedbox = $container.find('input[name="form-'+formID+'-'+inputkey+'"]:checked');
						if(checkboxObj.length == 1){
							if($(checkboxObj).is(':checked')){
								inputValue = 1;
							}else{
								inputValue = 0;
							}
						}else{
							var inputStr = '';
							if(config.isInput){
								inputStr = $('#'+config.fullID+'-input').val();
							}
							if($checkedbox.length > 0){
								var chkArr = [];
								$checkedbox.each(function(ev){
									chkArr.push($(this).val());
								});
								if(inputStr){chkArr.push(inputStr);}
								inputValue = chkArr;
							}else{
								inputValue = inputStr;
							}
						}
						if(typeof(inputValue)=='undefined'){inputValue = '';}
						formDataJson[inputkey] = inputValue;
						break;
					case 'addSelectInput':
					case 'organizaSelect':
						//增删一体输入框
						inputValue = $('#'+config.fullHiddenID).val();
						formDataJson[inputkey] = inputValue;
						break;
					case 'treeSelect':
						//下拉框树
						inputValue = $.trim($container.find('input[type="text"]').attr('nodeId'));
						formDataJson[inputkey] = inputValue;
						//是否要传额外参数，必须有subdata，返回额外的字段
						if(config.outFields){
							var chargeField = JSON.parse(config.outFields);
							if(treeUI[config.fullID]){
								var treeNode = treeUI[config.fullID].treeNode;
								if(!$.isEmptyObject(treeNode)){
									if(typeof(treeNode)=='object'){
										for(field in chargeField){
											formDataJson[field] = nsVals.getTextByFieldFlag(chargeField[field],treeNode);
										}
									}
								}
							}
						}
						break;
					case 'datetime':
						//日期时间组件
						var $date = $('#'+config.fullID+'-date');
						var $timer = $('#'+config.fullID+'-time');
						var dateValue = $.trim($date.val());
						var timeValue = $.trim($timer.val());
						if(dateValue !== ''){
							//存在日期值的情况转换日期
							/*if($date.datepicker('getDate')){
								dateValue = $date.datepicker('getDate').getTime();
							}*/
							dateValue = moment(dateValue).format('YYYY-MM-DD');
						}
						if(timeValue !== ''){
							//存在时间值
							inputValue = dateValue +' '+timeValue;
						}else{
							inputValue = dateValue;
						}
						inputValue = typeof(inputValue) == 'undefined' ? '':inputValue;
						formDataJson[inputkey] = inputValue;
						break;
					case 'personSelect':
						inputValue = config.resultPersonArr;
						formDataJson[inputkey] = inputValue;
						break;
					case 'personSelectSystem':
						var id = 'form-'+formID+'-'+inputkey;
						inputValue = nsUI.systemPerson.getValue(id);
						formDataJson[inputkey] = inputValue;
						break;
					case 'provinceSelect':
					case 'provincelinkSelect':
						var tempElementID = 'form-'+formID+'-';
						var provinceID = tempElementID+inputkey+'-province';
						var cityID = tempElementID+inputkey+'-city';
						var areaID = tempElementID+inputkey+'-area';

						var valueJson = {};

						var provincecode = $.trim($('#'+provinceID).val());
						var provincevalue = $.trim($('#'+provinceID).find('option:selected').text());

						var citycode = $('#'+cityID).val();
						var cityvalue = $.trim($('#'+cityID).find('option:selected').text());
						cityvalue = typeof(cityvalue) == 'string' ? cityvalue : '';


						var areacode = $('#'+areaID).val();
						var areavalue = $.trim($('#'+areaID).find('option:selected').text());
						areavalue = typeof(areavalue) == 'string' ? areavalue : '';
						
						valueJson = {
							province:provincevalue,
							city:cityvalue,
							area:areavalue,
							provinceCode:provincecode,
							cityCode:citycode,
							areaCode:areacode,
						}
						formDataJson[inputkey] = valueJson;
						break;
					case 'uploadSingle':
						var tempElementID = 'form-'+formID+'-';
						var uploadId = tempElementID + inputkey;
						var valueArr = nsForm.dropzoneStr[uploadId];
						if($.isArray(valueArr)){
							valueArr = valueArr.join(',');
						}
						formDataJson[inputkey] = valueArr;
						break;
					case 'select2':
						inputValue = $.trim($('#form-'+formID+' #form-'+formID+'-'+inputkey).val());
						inputValue = typeof(inputValue) == 'undefined' ? '' : inputValue;
						/*if(inputValue){
							inputValue = inputValue.split(',');
						}*/
						formDataJson[inputkey] = inputValue;
						break;
					case 'scientificInput':
						var valueStr = $.trim($('#form-'+formID+' #form-'+formID+'-'+inputkey).val());
						var scientificNumber = $.trim($('#form-'+formID+' #form-'+formID+'-'+inputkey).parent().children('[ns-control="scientific"]').text());
						var valueJson = {
							value:valueStr,
							scientificNumber:scientificNumber
						};
						formDataJson[inputkey] = valueJson;
						break;
					case 'powerInput':
						var valueStr = $.trim($('#form-'+formID+' #form-'+formID+'-'+inputkey).val());
						var powerNumber = $.trim($('#form-'+formID+' #form-'+formID+'-'+inputkey).parent().children('[ns-control="power"]').text());
						var valueJson = {
							value:valueStr,
							powerNumber:powerNumber
						};
						formDataJson[inputkey] = valueJson;
						break;
					case 'modelSelector':
						//模型选择器
						var valueStr = $container.find('input[type="text"]').attr('ms-id');
						formDataJson[inputkey] = valueStr;
						break;
					case 'date':
						var $date = $container.find('input[type="text"]');
					    inputValue = $.trim($date.val());
					    inputValue = typeof(inputValue) == 'string' ? inputValue : '';
					    if(inputValue){
					    	if(config.readonly == false){
								//执行初始化datepicker()所以会存在datepicker('getDate')
								if(typeof(config.addvalue)=='object'){
									if(!$.isEmptyObject(config.value)){
										//存在自定义值 永久，长期
										inputValue = config.addvalue.id;
									}
								}else{
									/*if($date.datepicker('getDate')){
										inputValue = $date.datepicker('getDate').getTime();
									}*/
								}
							}
							inputValue = moment(inputValue).format('YYYY-MM-DD');
					    }
						formDataJson[inputkey] = inputValue;
						break;
					case 'ueditor':
						inputValue = nsForm.data[formID].formInput[inputkey].ueditor.getContent();
						formDataJson[inputkey] = inputValue;
						break;
					case 'uploadImage':
						var ID = 'form-'+formID+'-'+inputkey;
						var inputValue = nsForm[ID];
						formDataJson[inputkey] = inputValue;
						break;
					case 'photoImage':
						if(nsForm[config.fullID]){
							formDataJson[inputkey] = nsForm[config.fullID][config.valueField];
						}
						break;
					case 'hidden':
						//如果需要跳过该值，则不输出到formDataJson中 cy 20180823
						if(config.isWithoutFormJSON){
							//跳过该值
						}else{
							inputValue = $.trim($('#form-'+formID+' #form-'+formID+'-'+inputkey).val());
							formDataJson[inputkey] = inputValue;
						}
						break;
					case 'textarea':
					case 'colorpickerinput':
					case 'graphicsInput':
					case 'select':
					case 'password':
						inputValue = $.trim($('#form-'+formID+' #form-'+formID+'-'+inputkey).val());
						formDataJson[inputkey] = inputValue;
						break;
					case 'number':
						inputValue = $.trim($('#form-'+formID+' #form-'+formID+'-'+inputkey).val());
						if(inputValue){
							inputValue = Number(inputValue);
						}
						formDataJson[inputkey] = inputValue;
						break;
					case 'baidumap':   //lyw 20180507
						var tempElementID = 'form-'+formID+'-';
						var provinceID = tempElementID+inputkey+'-province';
						var cityID = tempElementID+inputkey+'-city';
						var areaID = tempElementID+inputkey+'-area';
						var longitudeID = tempElementID+inputkey+'-longitude';
						var latitudeID = tempElementID+inputkey+'-latitude';
						var addressID = tempElementID+inputkey+'-address';
						var valueJson = {};
						
						if($.isArray(config.subdata)){
							var subdataField = config.subdata[0];
						}else{
							var subdataField = config.subdata;
						}
						if($("#"+provinceID).length>0){
							//省市区信息
							var provincecode = $.trim($('#'+provinceID).val());
							var provincevalue = $.trim($('#'+provinceID).find('option:selected').text());

							var citycode = $('#'+cityID).val();
							var cityvalue = $.trim($('#'+cityID).find('option:selected').text());
							cityvalue = typeof(cityvalue) == 'string' ? cityvalue : '';


							var areacode = $('#'+areaID).val();
							var areavalue = $.trim($('#'+areaID).find('option:selected').text());
							areavalue = typeof(areavalue) == 'string' ? areavalue : '';

							valueJson[subdataField.province.nameField] = provincevalue;
							valueJson[subdataField.city.nameField] = cityvalue;
							valueJson[subdataField.area.nameField] = areavalue;
							valueJson[subdataField.province.codeField] = provincecode;
							valueJson[subdataField.city.codeField] = citycode;
							valueJson[subdataField.area.codeField] = areacode;
						}
						//经纬度
						if($('#'+longitudeID).length>0){
							var longitudevalue = $.trim($('#'+longitudeID).val());
							valueJson[subdataField.point.longitudeField] = longitudevalue;
						}
						if($('#'+latitudeID).length>0){
							var latitudevalue = $.trim($('#'+latitudeID).val());
							valueJson[subdataField.point.latitudeField] = latitudevalue;
						}
						//详细地址
						if($('#'+addressID).length>0){
							var addressvalue = $.trim($('#'+addressID).val());
							valueJson[subdataField.address.nameField] = addressvalue;
						}
						for(key in valueJson){
							formDataJson[key] = valueJson[key];
						}
						// formDataJson[inputkey] = valueJson;
						break;
					case 'codeMirror':
						var codeMirrorID = 'form-'+formID+'-'+inputkey;
						nsComponent.codeMirror[codeMirrorID].$editor.save();
						inputValue = $.trim($('#form-'+formID+' #form-'+formID+'-'+inputkey).val());
						formDataJson[inputkey] = inputValue;
						break;
					case 'numrange':
						var minNum = $("."+inputkey).find("#form-"+ formID +"-minNum").val();
						var maxNum = $("."+inputkey).find("#form-"+ formID +"-maxNum").val();
						inputValue = {
							"minNum":minNum == '' ? '' : minNum,
							"maxNum":maxNum == '' ? '' : maxNum
						}
						formDataJson[inputkey] = inputValue;
						break;
					case 'radiocheckstring':
						formDataJson[inputkey] = nsUI.radioCheckString.getValue(formID, inputkey);
						break;
					case 'multiselect':
						var multiID = 'multi-multiple-'+inputkey;
						formDataJson[inputkey] = nsMultiSelect.getSelectJson(multiID);
						break;
					case 'expression':
						var expressionData = config.printFields();
						for(var key in expressionData){
							var element = expressionData[key];
							formDataJson[key] = element;
						}
						break;
					case 'attachCheckBox':
						//附加勾选
						var isChecked = $('[name="'+config.fullID+'"]').is(':checked');
						var subdataArray = config.subdata;
						if(!$.isArray(subdataArray)){subdataArray = [];}
						if(subdataArray.length == 0){
							if(isChecked){
								formDataJson[inputkey] = 1;
							}else{
								formDataJson[inputkey] = 0;
							}
						}/*else{
							for(var chkI=0; chkI<subdataArray.length; chkI++){

							}
						}*/
						break;
					case 'projectSelect':
						var saveType = config.saveType;
						var saveData = config.saveData;
						switch(saveType){
							case 'array':
								formDataJson[inputkey] = typeof(saveData) == 'undefined' ? "" : saveData.array;
								break;
							case 'string':
								formDataJson[inputkey] = saveData.string;
								break;
						}
						break;
					case 'valuesInput':
						//多值输入框组件 一个组件获取多个字段值
						nsUI.valuesInput.getValue(config, formDataJson);
						break;
					case 'dateTimeInput':
						//返回结果为时间戳
						var value = nsUI.dateTimeInput.getValue(config);
						if(value === false){
							formDataJson[inputkey] = '';
						}else{
							formDataJson[inputkey] = value;
						}
						break;
					case "table":
						var tableSelectData = null;
						if(config.isSingleSelect){
							var tableSelectData = baseDataTable.getSingleRowSelectedData(config.id,false);
						}else{
							if(config.isMulitSelect){
								var tableSelectData = baseDataTable.getTableSelectData(config.id,false);
							}
						}
						if(tableSelectData != null){
							switch(config.dataFormat){
								case 'none':
									// 不获取表格数据
									break;
								case 'list':
									formDataJson[inputkey] = tableSelectData;
									break;
								case 'ids':
									var idField = config.idField;
									var idFieldStr = '';
									if(config.isSingleSelect){
										var idStr = tableSelectData[idField];
										if(idStr){
											idFieldStr += idStr + ',';
										}
									}else{
										if(config.isMulitSelect){
											for(var fieldI=0;fieldI<tableSelectData.length;fieldI++){
												var idStr = tableSelectData[fieldI][idField];
												if(idStr){
													idFieldStr += idStr + ',';
												}
											}
										}
									}
									if(idFieldStr.length==0){
										console.error('请检查idField配置是否有误');
										console.error('idField:'+idField);
									}else{
										idFieldStr = idFieldStr.substring(0,idFieldStr.length-1);
										formDataJson[inputkey] = idFieldStr;
									}
									break;
							}
						}
						break;
					case 'transactor':
						// 办理人 lyw 20180926
						if(config.value){
							var transactorValues = [];
							for(var i=0;i<config.value.length;i++){
								var valObj = {}; // 处理value中的{}只区id
								for(var attr in config.value[i]){
									if($.isArray(config.value[i][attr])){
										valObj[attr] = config.value[i][attr];
									}else{
										// if(typeof(config.value[i][attr])=='object'){
										// 	var valueField = config[config.value[i].type][attr].valueField;
										// 	valObj[attr] = config.value[i][attr][valueField];
										// }else{
											valObj[attr] = config.value[i][attr];
										// }
									}
								}
								transactorValues.push(valObj);
							}
							formDataJson[inputkey] = transactorValues;
						}
						break;
					default:
						inputValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
						if(inputValue){
							//存在值 保留全角空格 去除半角空格
	                        var vStr = '';
	                        var index = -1;
	                        var lastIndex = -1;
	                        for(var i=0; i<inputValue.length; i++){if(inputValue[i]!=' '){index = i; break;}}
	                        for(var j=inputValue.length-1; j>=0; j--){if(inputValue[j]!=' '){lastIndex = j; break;}}
	                        if(index != -1){
	                            if(lastIndex != -1){
	                                vStr = inputValue.substring(index,lastIndex+1);
	                            }else{
	                                vStr = inputValue.substring(index,inputValue.length);
	                            }
	                            formDataJson[inputkey] = vStr;
	                        }else{
	                            formDataJson[inputkey] = inputValue;
	                        }
	                    }else{
	                        formDataJson[inputkey] = inputValue;
	                    }
						break;
				}
				//valueFormat 保存格式 array/string/volist/custom sjj20181022
				var valueFormat = config.valueFormat ? config.valueFormat : 'string';
				if(formArr[inputkey].outFields){
					valueFormat = 'custom';
				}
				switch(valueFormat){
					case 'volist':
						//checkbox select2
						if($.isArray(config.subdata)){
							var value = formDataJson[inputkey];
							if($.isArray(value)){value = value.join(',');}
							var valueArray = [];
							var volistArray = $.extend(true,[],config.subdata);
							for(var valueI=0; valueI<volistArray.length; valueI++){
								if(value.indexOf(volistArray[valueI][config.valueField]) > -1){
									//volist 添加选中标识
									volistArray[valueI][NSCHECKEDFLAG.KEY] = NSCHECKEDFLAG.VALUE;
									valueArray.push(volistArray[valueI]);
								}
							}
							formDataJson[inputkey] = valueArray;
						}
						break;
					case 'object':
						break;
					case 'custom':
						//是否要传额外参数，必须有subdata，返回额外的字段
						var chargeField = JSON.parse(formArr[inputkey].outFields);
						if($.isArray(formArr[inputkey].subdata)){
							for(var subI=0; subI<formArr[inputkey].subdata.length; subI++){
								var cId = formArr[inputkey].subdata[subI][formArr[inputkey].valueField];
								var rowData = {};
								if(typeof(cId)=='number'){
									if(cId == Number(formDataJson[inputkey])){
										rowData = formArr[inputkey].subdata[subI];
									}
								}else{
									if(cId == formDataJson[inputkey]){
										rowData = formArr[inputkey].subdata[subI];
									}
								}
								if(!$.isEmptyObject(rowData)){
									if(formArr[inputkey].isArrayValue){
										if(!$.isArray(formDataJson[field])){
											formDataJson[field] = [];
										}
										var cJson = {};
										for(field in chargeField){
											cJson[field] = nsVals.getTextByFieldFlag(chargeField[field],rowData);
										}
										formDataJson[field].push(cJson);
									}else{
										for(field in chargeField){
											formDataJson[field] = nsVals.getTextByFieldFlag(chargeField[field],rowData);
										}
									}
								}
							}
						}
						break;
				}
			}
			if(formArr[inputkey].element){
				//element无值
			}else{
				switch(inputkey){
					case 'objectState':
					case 'objectCheckState':
					case 'start':
					case 'length':
						break;
					default:
						getFormValue();
						break;
				}
			}
		}
		return formDataJson;
	}
	//返回json,或者返回false，验证不通过
	if(isNeedValid){
		var isPastValid = getFormValid();
		if(isPastValid == false){
			nsalert(language.common.fromplane.validationFailure);
			return false;
		}else{
			return getJson();
		}
	}else{
		return getJson();
	}
}
nsForm.getAllFormData  = function(formID){
	return nsForm.getFormJSON(formID,false);
}
//作废
nsForm.destroy = function(formID){
	var $form = $('#form-'+formID);
	$form.children('.row-close').addClass('destroy');
}

nsForm.clearData = function(formID){
	var formData = nsForm.data[formID].formInput;
	for(var inputID in formData){
		var currentKeyID = formData[inputID].fullID;
		var currentType = formData[inputID].type;
		switch(currentType){
			// 清空selece默认值与select2一样 20180621 lyw
			case "select":
				var id = "";
				var value = "";
				if(formData[inputID].rules){
					value = language.datatable.fillStatus.required;
				}else{
					value = "";
				}
				var textField = formData[inputID].textField;
				var valueField = formData[inputID].valueField;
				var defaultSelected = formData[inputID].value; 
				var selectElementID = currentKeyID + 'SelectBoxItText';
				$('#'+currentKeyID).val(id);
				$('#'+currentKeyID).closest('div').find('#'+selectElementID).text(value);
				$('#'+currentKeyID).closest('div').find('#'+selectElementID).attr('data-val',id);
				break;
			case "selectText":
				$('#'+currentKeyID+'CompareType').val('');
				var selectElementID = currentKeyID + 'CompareTypeSelectBoxItText';
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).text("选填");
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).attr('data-val','');
				$('#'+currentKeyID+'DefaultValue1').val('');
				break;
			case "selectSelect":
				$('#'+currentKeyID+'CompareType').val('');
				var selectElementID = currentKeyID + 'CompareTypeSelectBoxItText';
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).text("选填");
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).attr('data-val','');
				
				$('#'+currentKeyID+'DefaultValue1').val('');
				var selectElementID = currentKeyID + 'DefaultValue1SelectBoxItText';
				$('#'+currentKeyID+'DefaultValue1').closest('div').find('#'+selectElementID).text("选填");
				$('#'+currentKeyID+'DefaultValue1').closest('div').find('#'+selectElementID).attr('data-val','');
				
				break;
			case "selectDate":
				$('#'+currentKeyID+'CompareType').val('');
				var selectElementID = currentKeyID + 'CompareTypeSelectBoxItText';
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).text("选填");
				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).attr('data-val','');
				$('#'+currentKeyID+'DefaultValue1Temp').val('');
				$('#'+currentKeyID+'DefaultValue1').val('');
				$('#'+currentKeyID+'DefaultValue2').val('');
				break;
			case "select2":
			//case "select":
			// 清空selece默认值与select2一样 20180621 lyw
				formPlane.selectTwoDom[currentKeyID].val('').trigger("change");
				break;
			case "datetime":
				$('#'+currentKeyID+'-date').val('');
				$('#'+currentKeyID+'-time').val('');
				break;
			case "radio":
			case "checkbox":
			case 'daterangeRadio':
				$('input[name="'+currentKeyID+'"]').removeClass('checked');
				$('input[name="'+currentKeyID+'"]').parent().children('.has-error').remove();
				$('input[name="'+currentKeyID+'"]').closest('div').children('label').removeClass('checked');
				if($('input[name="'+currentKeyID+'"]').length > 0){
					$('input[name="'+currentKeyID+'"]')[0].checked = false;
				}
				for(var checkI = 0; checkI < $('input[name="'+currentKeyID+'"]').length;  checkI++){
					$('input[name="'+currentKeyID+'"]')[checkI].checked = false;
				}

				break;
			case "uploadSingle":
				$('#'+currentKeyID).html('');
				var uploadFile = nsForm.dropzoneGetFile[currentKeyID];
				var $uploadFileDom = nsForm.dropzoneFileJson[currentKeyID];
				if(!$.isEmptyObject(uploadFile)){
					for(var fileI in uploadFile){
						$uploadFileDom.removeFile(uploadFile[fileI]);
					}
				}
				break;
			case "treeSelect":
				$('#'+currentKeyID).val('');
				$('#'+currentKeyID).attr('value','');
				$('#'+currentKeyID).attr('nodeid','');
				break;
			case "inputSelect":
				nsUI.inputSelect.clearValue($('#'+currentKeyID));
				break;
			case 'organizaSelect':
				$('#'+currentKeyID).val('');
				$('#'+currentKeyID).parent().children('input[type="hidden"]').val('');
				break;
			default:
				$('#'+currentKeyID).val('');
				break;
		}
	}
}
nsForm.resetData = function(formID){
	var formData = nsForm.data[formID].formInput;
	for(var inputID in formData){
		var currentKeyID = formData[inputID].fullID;
		if(formData[inputID].type == 'select'){
			var id = "";
			var value = "";
			if(formData[inputID].rules){
				value = language.datatable.fillStatus.required;
			}else{
				value = language.datatable.fillStatus.optional;
			}
			var textField = formData[inputID].textField;
			var valueField = formData[inputID].valueField;
			var defaultSelected = formData[inputID].value; 
			var subdata = formData[inputID].subdata;
			for(var selectI in subdata){
				var textSelect = 'text';
				if(typeof(textField)=='undefined'){
					textSelect = 'text';
				}else{
					textSelect = textField;
				}
				var valueSelect = 'id';
				if(typeof(valueField)=='undefined'){
					valueSelect = 'id';
				}else{
					valueSelect = valueField;
				}
				if(subdata[selectI].selected){
					id = subdata[selectI][valueSelect];
					value = subdata[selectI][textSelect];
				}else if(typeof(defaultSelected)!='undefined'){
					if(subdata[selectI][valueSelect] == defaultSelected){
						id = subdata[selectI][valueSelect];
						value = subdata[selectI][textSelect];
					}
				}
			}
			var selectElementID = currentKeyID + 'SelectBoxItText';
			$('#'+currentKeyID).val(id);
			$('#'+currentKeyID).closest('div').find('#'+selectElementID).text(value);
			$('#'+currentKeyID).closest('div').find('#'+selectElementID).attr('data-val',id);
		}else if(formData[inputID].type == 'radio' || formData[inputID].type == 'checkbox'){
			$('input[name="'+currentKeyID+'"]').removeAttr('checked');
		}else{
			if(typeof(formData[inputID].value)!='undefined'){
				$('#'+currentKeyID).val(formData[inputID].value);
			}else{
				$('#'+currentKeyID).val('');
			}
		}
	}
}
nsForm.uploadTable = function(uploadJson){
	var tableArr = [];
	tableArr.push(uploadJson);
	popupBox.initTable(tableArr);
	formPlane.commonUpload(uploadJson);
}
nsForm.commonUpload = function(uploadJson){	
	var i = 1;
	var btnI = 0;
	$example_dropzone_filetable = $('#'+uploadJson.id);
	formPlane.dropzoneGetFile = {};
	formPlane.dropzoneGetFile['advancedDropzone'] = {};
	formPlane.dropzoneFile = {};
	formPlane.dropzoneFile['advancedDropzone'] = {};
	var uploadMaxFileLength = uploadJson.isAllowFiles ? Number(uploadJson.isAllowFiles):1;
	example_dropzone = $("#advancedDropzone").dropzone({
		url: uploadJson.uploadsrc,
		maxFiles:uploadMaxFileLength,
		dictMaxFilesExceeded:language.netstarDialog.upload.dictMaxFilesExceeded,
		addRemoveLinks:true,//添加移除文件
		dictInvalidFileType:language.netstarDialog.upload.formatNotSupported,
		dictResponseError:language.netstarDialog.upload.dictResponseError,
		dictInvalidFileType:language.netstarDialog.upload.nameTypeNotMatch,
		autoProcessQueue:true,//不自动上传
		init:function(){
			var dropzoneObj = this;
			formPlane.dropzoneFile['advancedDropzone'] = dropzoneObj;
		},
		addedfile: function(file)
		{
			if(i == 1)
			{
				$example_dropzone_filetable.find('tbody').html('');
			}
			
			var size = parseInt(file.size/1024, 10);
			size = size < 1024 ? (size + " KB") : (parseInt(size/1024, 10) + " MB");
			var	$el = $('<tr>\
							<th class="text-center">'+(i++)+'</th>\
							<td>'+file.name+'</td>\
							<td><div class="progress progress-striped"><div class="progress-bar progress-bar-warning"></div></div></td>\
							<td>'+size+'</td>\
							<td>Uploading...</td>\
						</tr>');
			
			$example_dropzone_filetable.find('tbody').append($el);
			file.fileEntryTd = $el;
			file.progressBar = $el.find('.progress-bar');
		},
		//一个文件被移除时发生
		removedfile:function(file){
			btnI--;
			if(btnI<0){
				btnI = 0;
				formPlane.dropzoneGetFile['advancedDropzone'] = {};
			}
		},
		uploadprogress: function(file, progress, bytesSent)
		{
			file.progressBar.width(progress + '%');
		},
		
		success: function(file,data)
		{
			file.fileEntryTd.find('td:last').html('<span class="text-success">上传成功</span>');
			file.progressBar.removeClass('progress-bar-warning').addClass('progress-bar-success');
			var btnHtml = '<td class="td-button">'
							+'<button type="button" class="btn btn-warning  btn-icon" fid="'+btnI+'" nstype="file-upload">'
								+'<i class="fa-trash"></i>'
							+'</button>'
						+'</td>';
			file.fileEntryTd.find('td:last').after(btnHtml);
			if(typeof(uploadJson.changeHandler)!='undefined'){
				var uploadFunc = uploadJson.changeHandler;
				uploadFunc(data,file);
			}
			formPlane.dropzoneGetFile['advancedDropzone'][btnI] = file;
			btnI++;
			file.fileEntryTd.find('button[nstype="file-upload"]').on('click',function(){
				var delFid = $(this).attr('fid');
				var removeFile = formPlane.dropzoneGetFile['advancedDropzone'][delFid];
				if(removeFile){
					formPlane.dropzoneFile['advancedDropzone'].removeFile(removeFile);
				}
			});
		},
		
		error: function(file,errorMessage)
		{
			file.fileEntryTd.find('td:last').closest('tr').remove();
			this.removeFile(file);
			//file.fileEntryTd.find('td:last').html('<span class="text-danger">失败</span>');
			//file.progressBar.removeClass('progress-bar-warning').addClass('progress-bar-red');
			nsalert(errorMessage);
		}
	});
	$("#advancedDropzone").css({
		minHeight: 200
	});
}
//多文件上传
nsForm.moreUpload = function(isBoolean){
	var isDropzone = typeof(isBoolean) == 'boolean' ? isBoolean : true;
	if(!isDropzone){
		$('#advancedDropzone').parent().addClass('upload-disabled');
	}else{
		$('#advancedDropzone').parent().removeClass('upload-disabled');
	}
}
//对formJSON进行批量赋值
nsForm.resetValues = function(valueJson,formJson){
	for(var formArrI = 0; formArrI<formJson.form.length; formArrI++){
		//是否存在subFields字段 用于组合组件的赋值
		function subFieldsSetValues(fieldsObj){
			if(typeof(fieldsObj)=='object'){
				if(!$.isEmptyObject(fieldsObj)){
					for(var value in fieldsObj){
						var isSetValue = false;
						//因为0会当做不存在处理所以需要判断是否是数值类型
						if(typeof(valueJson[fieldsObj[value].id])=='number'){
							isSetValue = true;
						}else if(valueJson[fieldsObj[value].id]){
							isSetValue = true;
						}
						if(isSetValue){
							//值存在进行赋值
							fieldsObj[value].value = valueJson[fieldsObj[value].id];
						}
					}
				}
			}
		}
		if($.isArray(formJson.form[formArrI])){
			//如果是个数组
			for(var componentI = 0; componentI<formJson.form[formArrI].length; componentI++){
				if(typeof(valueJson[formJson.form[formArrI][componentI].id])!='undefined'){
					formJson.form[formArrI][componentI].value = valueJson[formJson.form[formArrI][componentI].id];
				}
				//是否存在subFields字段 用于组合组件的赋值
				subFieldsSetValues(formJson.form[formArrI][componentI].subFields);
			}
		}else{
			if(typeof(valueJson[formJson.form[formArrI].id])!='undefined'){
				formJson.form[formArrI].value = valueJson[formJson.form[formArrI].id];
			}
			//是否存在subFields字段 用于组合组件的赋值
			subFieldsSetValues(formJson.form[formArrI].subFields);
		}
	}
	return formJson;
}
//第三个参数可选   
nsForm.editAll = function(attr,formId,fieldArray){
	//如果没有设置任何属性就不做处理
	if(!attr){
		return;
	}
	var inputs = nsForm.data[formId].formInput;
	var editArray = [];
	var idArray;
	if(!fieldArray){
		idArray = [];
		for(var key in inputs){
			idArray.push(key);
		}
	}else{
		idArray=fieldArray;
	}
	for(var i = 0;i<idArray.length;i++){
		var id = idArray[i];
		if(id in inputs){
			var toValue = $.extend({id:id},attr,true);
			editArray.push(toValue);
		}
	}
	if(editArray.length >0){
		nsForm.edit(editArray,formId);
	}
}
//整个表单设置只读
//{{readonly:true/false}, formid,['chargetype','KpRadio','fileUpload']}
nsForm.setFormReadonly = function(attr,formID,fieldArray){
	//如果没有设置任何属性就不做处理
	if(!attr){
		return;
	}
	var inputs = nsForm.data[formID].formInput;
	var editArray = [];
	var idArray;
	//该组件类型传输的时候是否数组，如果是数组，则新建数组传过去，如果不是，则新建obj传过去
	var data = nsFormBase.data[formID];
	if(!$.isArray(fieldArray)){
		idArray = [];
		for(var key in inputs){
			idArray.push(key);
		}
	}else{
		idArray=fieldArray;
	}
	for(var i = 0;i<idArray.length;i++){
		var id = idArray[i];
		if(id in inputs){
			var toValue = $.extend({id:id},{type:inputs[id].type},{container:inputs[id].$container},attr,true);
			editArray.push(toValue);
		}
	}
	for(var i=0;i<editArray.length; i++){
		setAttribute(editArray[i]);
	}
	function setAttribute(fieldJson){
		var type = fieldJson.type;
		var value = fieldJson.readonly;
		var $container = fieldJson.container;
		var id = fieldJson.id;
		switch(type){
			case 'text':
			case 'number':
			case 'textarea':
			case 'textBtn':
			case 'powerInput':
			case 'scientificInput':
			case 'treeSelect':
			case 'personSelect':
			case 'addSelectInput':
			case 'organizaSelect':
			case 'inputSelect':
			case 'colorpickerinput':
			case 'personSelectSystem':
				$container.find('[nstype="'+type+'"]').attr('readonly',value);
				break;
			case 'select':
			case 'select2':
				$container.find('[nstype="'+type+'"]').attr('disabled',value);
				break;
			case 'checkbox':
			case 'radio':
			case 'daterangeRadio':
				if(value){
					$container.find('.form-item').children('label').addClass('disabled');
					$container.find('input[type="'+type+'"]').removeAttr('disabled',value);
				}else{
					$container.find('.form-item').children('label').removeClass('disabled');
					$container.find('input[type="'+type+'"]').removeAttr('disabled');
				}
				break;
			case 'date':
			case 'daterange':
				$container.find('[nstype="'+type+'"]').attr('readonly',value);
				break;
			case 'datetime':
				$container.find('input[type="text"]').attr('readonly',value);
				$container.find('.timepicker').attr('disabled',value);
				break;
			case 'uploadSingle':
				$container.find('[nstype="'+type+'"]').attr('readonly',value);
				$container.find('.input-group-addon').attr('readonly',value);
				break;
			case 'provinceSelect':
			case 'provincelinkSelect':
				var proselectID = 'form-'+formID+'-'+id+'-province';
				var cityselectID = 'form-'+formID+'-'+id+'-city';
				var areaSelectID = 'form-'+formID+'-'+id+'-area';
				var $pro = $('#'+proselectID);
				var $city = $('#'+cityselectID);
				var $area = $('#'+areaSelectID);
				$pro.attr('disabled',value);
				$city.attr('disabled',value);
				$area.attr('disabled',value);
				break;
			default:
				if(debugerMode){
					console.error('不能识别的组件类型：'+type);
					console.error(fieldJson);
				}
				break;
		}
		if($.isArray(data[type])){
			for(var i=0; i<data[type].length; i++){
				if(data[type][i].id == id){
					data[type][i].readonly = value;
				}
			}
		}else{
			if(!$.isEmptyObject(data[type])){
				if(data[type].type == 'addSelectInput' && data[type].id == id){
					data[type].readonly = value;
				}
				if(id in data[type]){
					data[type][id].readonly = value;
				}
			}
		}
	}
	nsComponent.dataInit(data,formID);
}
//单独设置只读
nsForm.setReadonly = function(fieldJson,formID){
	var inputs = nsForm.data[formID].formInput;
}

//第二个参数可选  
nsForm.setFormEditable= function(formId,fieldArray){
	nsForm.editAll({readonly:false},formId,fieldArray);
}
//第二个参数可选
// nsComponent.emptyForm = function(formId,fieldArray){
// 	nscomponent.editAll({value:''},formId,fieldArray);
// }