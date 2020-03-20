//支持多个组件 valuesInput/dateTimeInput

//多值格式化输入组件 cy 20180829
nsUI.valuesInput = {
	ver:'0.9.1', //版本号 cy 20180910
	i18n:{
		en:{
			errorFormat:'errorFormat',
			errorFormatField:'errorFormatField',
		},
		zh:{
			errorFormat:'FORMAT参数错误',
			errorFormatField:'FORMAT中字段配置错误'
		}
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(config, formJson){
		var i18n = this.i18n[languagePackage.userLang];
		var _this = this;
		/*** config:object 	组件配置
		 * {
		 * 		id: 'valuesInputExtends',
		 * 		label: 		'标准(有值)',
		 * 		value: 		'',
		 * 		format: 	'{this:YY}/{valuesInputHaveValue1:MM}-{valuesInput2:YY}/{valuesInput3:MM}',
		 * 		column: 	3,
		 * 		type: 		'valuesInput',
		 * }
		 * formJson:object 表单配置
		 */

		var relatedValues = {};
		var outputValueStr = '';  		//输出值的字符串
		var outputMaskStr = ''; 		//格式化后的mask字符串 99/99-99/99
		var placeholderStr = ''; 		//占位符字符串，用于取值 **/**-**/**
		var valueFields = [];

		//获取前缀字符串
		function getPrefixStr(_componentValue, _valueType, _maskStr, _config){
			/* prefixWord:string 	前缀字符，如'0'
			 * _valueStr:string 	当前值
			 * _maskStr:string 		格式化目标形式 如'MM','9999'等
			 */
			 var valueStr = '';
			 var prefixStr = '';
			 //根据类型决定没值的时候显示什么
			 switch(_maskStr){
			 	case 'MM':
			 		//两个数字的月份
			 		if(_valueType == 'number' || _valueType == 'string'){
			 			//如果长度短了才补充
			 			valueStr = _componentValue.toString();
						if(valueStr.length < _maskStr.length){
							for(var psI = 0; psI<(_maskStr.length - valueStr.length); psI++){
								prefixStr += '0';
							}
						}
			 		}else{
			 			valueStr = '';
			 			prefixStr = '01';
			 		}
			 		break;
			 	case 'YY':
			 		//两个数字的年份
			 		if(_valueType == 'number' || _valueType == 'string'){
			 			//如果长度短了才补充
			 			valueStr = _componentValue.toString();
						if(valueStr.length < _maskStr.length){
							for(var psI = 0; psI<(_maskStr.length - valueStr.length); psI++){
								prefixStr += '0';
							}
						}
			 		}else{
			 			valueStr = '';
			 			prefixStr = '00';
			 		}
			 		break;
			 	case 'YYYY':
			 		//四个数字的年份
			 		if(_valueType == 'number' || _valueType == 'string'){
			 			//如果长度短了才补充
			 			valueStr = _componentValue.toString();
						if(valueStr.length < _maskStr.length){
							// if(debugerMode){
							// 	console.error('valuesInput组件的值 '+valueStr+' 不合法:'+valueStr+',格式是'+_maskStr);
							// 	console.error(_config);
							// }
							valueStr = '';
			 				prefixStr = '1970';
						}
			 		}else{
			 			valueStr = '';
			 			prefixStr = '1970';
			 		}
			 		break;
			 	default:
			 		//转换为文本
			 		if(_valueType == 'number'){
			 			valueStr = _componentValue.toString();
					//文字的直接输出
			 		}else if(_valueType == 'string'){
			 			valueStr = _componentValue;
			 		}else{
			 			valueStr = '';
			 		}
			 		//补充前缀 
			 		if(valueStr.length < _maskStr.length){
			 			var prefixStrUnit = _maskStr.substr(1,1);
			 			switch(prefixStrUnit){
			 				case '9':
			 					prefixStrUnit = '0';
			 					break;
			 				case 'a':
			 					prefixStrUnit = 'S';
			 					break;
			 				case '*':
			 					prefixStrUnit = 'A';
			 					break;

			 			}
						for(var psI = 0; psI<(_maskStr.length - valueStr.length); psI++){
							prefixStr += prefixStrUnit = prefixStrUnit;
						}
					}
			 		break;
			 }
			
			return prefixStr + valueStr;
		}

		//获取输出的value字符串
		function getValueStr(_maskFieldName, _maskFormatStr, _originalStr){
			// _maskFieldName:string 	示例：fieldName 例如：componentId
			// _maskFormatStr:string	示例：fieldMaskField  例如：MM
			// _originalStr:string 		示例："{componentId:MM}"
			
			//获取字段对应值值
			var valueStr = '';
			if(typeof(formJson.component[_maskFieldName])!='object'){
				//在表单配置中找不到该对象
				if(debugerMode){
					var errorStr = '多值输入组件format参数:{'+_originalStr+'}错误，无法找到对应字段'+_maskFieldName;
					nsalert(errorStr,'error');
					console.error(errorStr);
					console.error(config);
					console.error(formJson);
				}
				return false;
			}else{
				//找到并标识对应组件
				var relatedComponentConfig = formJson.component[_maskFieldName];
				relatedComponentConfig.isWithoutFormJSON = true; //打上标识，用于禁止getFormJSON获取值
				var componentValue = relatedComponentConfig.value;
				var valueType = typeof(relatedComponentConfig.value);
				valueStr = getPrefixStr(componentValue, valueType, _maskFormatStr, relatedComponentConfig);
			}
			return valueStr;
		}

		//获取输出的mask字符串
		function getMaskStr(_maskFieldName, _maskFormatStr, _originalStr){
			var maskStr = '';
			var maskStrLength = _maskFormatStr.length;
			switch(_maskFormatStr){
				case 'YY':
					maskStr = '99';
					break;
				case 'MM':
					maskStr = '99';
					break;
				case 'YYYY':
					maskStr = 'y';
					break;
				default:
					//maskInput的原始属性
					maskStr = _maskFormatStr;
					break;
			}
			return maskStr;
		}

		//获取占位符 ** 格式化有多长显示多长 MM会返回**
		function getPlaceholderStr(_maskFormatStr, _originalStr){
			// var placeholderUnitStr = '';
			// for(var i = 0; i<_maskFormatStr.length; i++){
			// 	placeholderUnitStr += '*'
			// }
			return _maskFormatStr
		}
		//获取用于获取值的字符串 年**月** 使用*为通配符
		function getValueFormatStr(formatStr){
			//如果不是字符串返回''
			if(typeof(formatStr)!='string'){
				return '';
			}
			//如果字不能识别， 无法执行替换操作
			var isReplaced = false; //是否成功替换的标识
			var resultStr = formatStr.replace(/\{(.*?)\}/g, 
				//先找到{field:MM}来进行替换
				function(replaceStr){
					isReplaced = true;
					//提取冒号到后大括号之间的字符串 MM 
					var maskStr = replaceStr.match(/\:(.*?)\}/);
					maskStr = maskStr[1]; // 实际值是 MM
					maskStr = maskStr.replace(/./g, '*');
					return maskStr;
				});
			if(isReplaced === false ){
				return '';
			}else{
				return resultStr
			}
		}

		var isHaveFormatError = false;
		var isHaveFieldError = false; 					//是否有field字段配置错误，如果有则是致命错误，不需要继续执行
		//对配置字符串进行处理
		if(typeof(config.format)!='string'){
			//format参数错误			
			if(debugerMode){
				var errorStr = config.label+'('+config.id +') 配置错误 多值输入组件必须配置format参数';
				console.error(errorStr);
				nsalert(errorStr, 'error');
				console.error(config);
			}
			outputValueStr = '';  //配置format格式错误
			outputMaskStr  = '';
			placeholderStr = i18n.errorFormat; 
			isHaveFormatError = true;
		}else{
			outputValueStr = config.format;  	//输出值的字符串
			outputMaskStr = config.format; 		//格式化后的mask字符串 99/99-99/99
			placeholderStr = config.format; 	//占位符字符串，用于取值 **/**-**/**
			//循环查找{fieldId:YY}
			var patt = new RegExp("\{(.*?)\}","g"); 	//取出
			
			while ((result = patt.exec(config.format)) != null)  {
				var configValueStr = result[1];  	//示例："componentId:MM"
				var originalStr = result[0]; 		//示例："{componentId:MM}"
				var configValueArr = configValueStr.split(':');
				//匹配值出问题了，格式不是{a:b},一般而言是因为找不到':'
				if(configValueArr.length!=2){
					if(debugerMode){
						console.error('多值输入组件format参数配置错误:'+configValueStr+'，格式应该为{field:MM}类型');
						console.error(config.format);
						console.error(config);
					}
					isHaveFormatError = true;
				}else{
					var maskFieldName = configValueArr[0]; 				//fieldName 例如：componentId
					var maskFormatStr = configValueArr[1];				//fieldMaskField  例如：MM
					
					//this指当前
					if(maskFieldName == 'this'){
						maskFieldName = config.id;
					}
					//获取value
					var valueStr = getValueStr(maskFieldName, maskFormatStr, originalStr);
					if(valueStr === false){
						//无法找到关联field
						isHaveFieldError = true;
					}else{
						outputValueStr = outputValueStr.replace(originalStr, valueStr); //替换字段为新的值
					}

					//保留关联字段
					var relatedConfig = {};
					for(var key in formJson.component[maskFieldName]){
						switch(key){
							case 'id':
							case 'value':
								relatedConfig[key] = formJson.component[maskFieldName][key];
								break;
							default:
								//其他不需要
								break;
						}
					}
					valueFields.push(relatedConfig);

					//获取mask
					var maskStr = getMaskStr(maskFieldName, maskFormatStr, originalStr);
					outputMaskStr = outputMaskStr.replace(originalStr, maskStr);

					//生成占位符
					var placeholderUnitStr = getPlaceholderStr(maskFormatStr, originalStr);
					placeholderStr = placeholderStr.replace(originalStr, placeholderUnitStr);
				}
			}
			
			if(isHaveFieldError){
				//如果有字段配置错误
				outputValueStr = '';  	//配置字段错误
				outputMaskStr  = ''; 		
				placeholderStr = i18n.errorFormatField;
			}else if(isHaveFormatError){
				//format格式化参数错误
				outputValueStr = '';  	//配置format格式错误
				outputMaskStr  = ''; 		
				placeholderStr = i18n.errorFormat;
			}else{
				//如果全部值都是空的，就输出value为空
				var isAllEmpty = true;
				for(var i = 0; i<valueFields.length; i++){
					var componentConfig = valueFields[i];
					if(typeof(componentConfig)=='object'){
						switch(typeof(componentConfig.value)){
							case 'number':
								isAllEmpty = false;
								break;
							case 'string':
								if(componentConfig.value !=''){
									isAllEmpty = false
								}
								break;
							default:
								break;
						}
					}else{
						outputValueStr = 'error';
					}
				}
				
				if(isAllEmpty){
					outputValueStr = '';
				}
			}
		}

		var isHaveError = false;  //有任何错误则为true isHaveFieldError、isHaveFormatError都包含 用于输出错误显示
		if(isHaveFormatError || isHaveFieldError){
			isHaveError = true;
		}

		//输出到config参数
		config.formatMask = outputMaskStr;  		//输入的maskInput格式化值

		config.valuesMask = getValueFormatStr(config.format);//用于值替换的字符串
		config.outputValueStr = outputValueStr; 	//显示的value

		config.valueFields = valueFields; 		//关联的field 以便后续操作
		config.placeholder = placeholderStr; 	//占位符字符串 **/**-**/**
		config.isHaveError = isHaveError; 		//是否有错误

		//有错时需要清空关联字段和格式化字符串
		if(isHaveError){
			config.valueFields = [];
			config.formatMask = '';
		}
	},
	//初始化
	init:function(config){
		var $input = $('#'+config.fullID);
		config.$input = $input;
		if(config.formatMask != ''){
			$input.inputmask(config.formatMask);
		}
		config.$input.on('blur', {_config:config, _this:this}, function(blurEvent){
			var _this = blurEvent.data._this;
			var _config = blurEvent.data._config;
			var value = _this.getValue(_config,{});
			var json = {
				value:value,
				config:_config
			};
			if(typeof(_config.commonChangeHandler)=='function'){
				_config.commonChangeHandler(json);
			}
		})
	},
	//获取值
	getValue:function(config, formDataJson){
		var inputValueStr = config.$input.val();
		
		//没有输入的情况下
		if(inputValueStr == '' || inputValueStr == 'error'){
			for(var i = 0; i<config.valueFields.length; i++){
				formDataJson[config.valueFields[i].id] = '';
			}
		}else{
		//有输入值的情况下
			var patt = new RegExp("[\*]+","g"); 	//根据*分隔符取出值
			var unitValues = [];
			while ((result = patt.exec(config.valuesMask)) != null){
				var unitValue = inputValueStr.substr(result.index, result[0].length);
				unhandledIndex = result.index+result[0].length;
				unitValues.push(unitValue)
			}

			//保存到formJson中
			for(var i = 0; i<config.valueFields.length; i++){
				var componentConfig = config.valueFields[i];
				var componentValue = unitValues[i];
				if(/\_/.test(componentValue)){
					componentValue = componentValue.replace(/\_/g, '');
				}
				
				formDataJson[componentConfig.id] = componentValue;
			}
		}
	},
	//赋值
	fillValue:function(config, values){
		console.log(config);
		console.log(values);
	}
}
//日期格式化输入组件  cy 20180831
nsUI.dateTimeInput = {
	ver:'0.9.0', //版本号 cy 20180831
	i18n:{ //语言配置文件
		en:{
			formatError:'Format parameter error',
			valueError:'value error',
			getValueError:'Failed to get value',
			uncompletedInput:'uncompleted input',
			validStartDate:'Not earlier than',
			validEndDate:'Not later than',
			timeForat:'MM/DD/YYYY HH:mm:ss',
		},
		zh:{
			formatError:'FORMAT格式化参数错误',
			valueError:'value只能是数字',
			getValueError:'获取值失败 有未输入完的值',
			uncompletedInput:'未完成输入',
			validStartDate:'不能早于',
			validEndDate:'不能晚于',
			timeForat:'YYYY/MM/DD HH:mm:ss',
		}
	},
	//设置错误配置 用于输出HTML时候使用
	setErrorConfig:function(_config, _ErrorName){
		var i18n = this.i18n[languagePackage.userLang];
		_config.placeholder = i18n[_ErrorName];
		_config.outputValueStr = '';
		_config.formatMask = '';
		_config.isHaveError = true;
	},
	//默认值 默认为YYYY/MM/DD 如果isUseTime 为 true 则该值为YYYY/MM/DD HH:mm:ss
	setDefault:function(_config){
		var _this = this;
		//默认配置的format YYYY/MM/DD HH:mm:ss
		if(typeof(_config.format)!='string'){
			_config.format = 'YYYY/MM/DD';
			if(_config.isUseTime){
				_config.format += ' HH:mm:ss';
			}
		}else{
			//定义了format 且包含Hms则无法使用isUseTime
			if(_config.isUseTime){
				var isHaveHms = _config.format.search(/[Hhms]/) == -1;
				if(isHaveHms){
					delete _config.isUseTime;
					if(debugerMode){
						console.error('定义format且包含hms后，isUseTime被忽略');
						console.error(console.error);
					}
				}else{
					_config.format += ' HH:mm:ss';
				}
			}else{
				//不用改
			}
		}

		//开始时间和结束时间的时间戳
		function getValidTimeStamp(validDateStr){
			var timeStamp = -1;
			var validDateJson = {};
			//如果是object类型则肯定是 calaulate
			var validDateType = '';
			if(typeof(validDateStr)=='object'){
				validDateStr = 'calaulate';
				validDateJson = validDateStr;
			}else if(typeof(validDateStr)=='string'){
				//如果是string则需要判断是否需要转成object
				if( validDateStr.search(/operate/) >-1){
					var validJson = nsVals.getJsonByString(validDateStr);
					console.warn(validJson);
					if(validJson!=false){
						validDateStr = 'calaulate';
						validDateJson = validJson;
					}else{
						return false;
					}
					
				}
			}
			
			switch(validDateStr){
				case 'today':
					//今天 1536768000000
					var todayStr = moment().format('YYYY/MM/DD');
					var todayTimeStampStr = moment(todayStr, 'YYYY/MM/DD').format('x');
					timeStamp = parseInt(todayTimeStampStr);
					break;
				case 'now':
					//现在 1536824204867
					timeStamp = new Date().getTime();
					break;
				case 'calaulate':
					console.log(validDateJson);
					var operateTypeStr = validDateJson.operate;
					
					function getObjectValue(keyStr, valueNum, _operateObj){
						if(typeof(valueNum)!='number'){
							return false
						}
						switch(keyStr){
							case 'years':
							case 'Y':
							case 'quarters': //季度
							case 'Q':
							case 'months':
							case 'M':
							case 'weeks':
							case 'W':
							case 'days':
							case 'd':
							case 'hours':
							case 'h':
							case 'minutes':
							case 'm':
							case 'seconds':
							case 's':
							case 'milliseconds':
							case 'ms':
								//这些都是合法的
								_operateObj[keyStr] = valueNum;
								break;
							default:
								//识别不了的 只有operate是合法的
								if(keyStr!='operate'){
									return false;
								}
								break;
						}
						return _operateObj;
					}
					var operateObj = {};
					$.each(validDateJson, function(key,value){
						var operateResultObj = getObjectValue(key,value, operateObj)
						if(operateResultObj === false){
							return false;
						}
					});
					console.warn(operateObj);
					var timeStampStr = '';
					switch(operateTypeStr){
						case 'add':
						case '+':
							timeStampStr = moment().add(operateObj).format('x');
							break;
						case 'subtract':
						case '-':
							timeStampStr = moment().subtract(operateObj).format('x');
							break;
						default:
							//只能识别加减
							return false;
							break;
					}
					if(timeStampStr == 'Invalid date'){
						timeStamp = false;
					}else{
						timeStamp = parseInt(timeStampStr);
					}
					break;
					
				default:
					//举例：2010/09/09 格式是YYYY/MM/DD HH:mm:ss 
					var timeStampStr = moment(_config.validStartDate, 'YYYY/MM/DD HH:mm:ss').format('x');
					if(timeStampStr == 'Invalid date'){
						timeStamp = false;
					}else{
						timeStamp = parseInt(timeStampStr);
					}
					
					break;
			}
			console.log(timeStamp)
			console.log(_config.label+':'+moment(timeStamp).format('YYYY/MM/DD HH:mm:ss'))
			return timeStamp;
		}
		//有效的开始时间
		if(typeof(_config.validStartDate)=='string'){
			var timeStamp = getValidTimeStamp(_config.validStartDate);
			if(timeStamp !== false){
				_config.validStartTimeStamp = timeStamp;
			}
		}
		//有效的结束时间
		if(typeof(_config.validEndDate)=='string'){
			var validEndTimeStamp = moment(_config.validEndDate, 'YYYY/MM/DD HH:mm:ss').format('x');
			if(validEndTimeStamp != 'Invalid date'){
				validEndTimeStamp = parseInt(validEndTimeStamp);
				_config.validEndTimeStamp = validEndTimeStamp;
			}
		}
	},
	//返回maskformat 例如：y/m/d
	getMaskFormatStr:function(_config){
		var formatStr = '';
		switch(typeof(_config.format)){
			case 'string':
				formatStr = _config.format;
				var originalFormatStr = _config.format;
				var startPositionIndex = 0; //开始位置
				var patt = new RegExp("[ymdhmsYMDHMS]+","g"); 	//取出有效字符串
				while ((result = patt.exec(originalFormatStr)) != null)  {
					var currentForamtStr = result[0];
					var resetFormatStr = '';
					switch(currentForamtStr){
						case 'YYYY':
							resetFormatStr = 'y';
							break;
						case 'YY':
							resetFormatStr = '99';
							break;
						case 'MM':
							resetFormatStr = 'm';
							break;
						case 'DD':
							resetFormatStr = 'd';
							break;
						case 'HH':
							resetFormatStr = 'h';
							break;
						case 'mm':
						case 'MM':
							resetFormatStr = 'm';
							break;
						case 'SS':
						case 'ss':
							resetFormatStr = 's';
							break;
					}
					var replacePatt = new RegExp(currentForamtStr);
					formatStr = formatStr.replace(replacePatt, resetFormatStr)
				}
				break;
			default:
				//格式化参数错误
				this.setErrorConfig(_config, 'formatError')
				nsDebuger.componentFieldErrorInfo(_config, {
					field:'format', 
					fieldType:'string', 
					info:'format参数格式是string, 举例："YYYY/MM/DD"'
				});
				return false;
				break;
		}
		return formatStr;
	},
	//返回格式化后日期字符串 1983/09/36
	getValueStr:function(_config){
		var valueStr = '';
		switch(typeof(_config.value)){
			case 'string':
				if(_config.value == ''){
					valueStr = '';
				}else{
					this.setErrorConfig(_config, 'valueError')
					nsDebuger.componentFieldErrorInfo(_config, {
						field:'value', 
						fieldType:'number', 
						info:'value应当是时间戳, 举例：1536579643264'
					});
					return false;
				}
				break;
			case 'number':
				valueStr = moment(_config.value).format(_config.format);
				break;
			case 'undefined':
				valueStr = '';
				break;
			default:
				this.setErrorConfig(_config, 'valueError')
				nsDebuger.componentFieldErrorInfo(_config, {
					field:'value', 
					fieldType:'number', 
					info:'value应当是时间戳, 举例：1536579643264'
				});
				return false;
				break;
		}
		return valueStr;
	},
	getMomentStr:function(_config){
		//var momentStr = '';
		return _config.format;
	},
	//获取placeholder,把YMD等可输入内容替换为_
	getPlaceholderStr:function(_config, formatMomentStr){
		//如果定义了placeholder则优先显示
		if(typeof(_config.placeholder)=='string'){
			if(_config.placeholder != ''){
				return _config.placeholder;
			}
		}
		var placeholderStr = formatMomentStr;
		placeholderStr = placeholderStr.replace(/[ymdhmsYMDHMS]/g, '_')
		return placeholderStr;
	},
	//用于返回必要属性 用于输出HTML
	setConfig:function(config){
		var i18n = this.i18n[languagePackage.userLang];
		var _this = this;
		_this.setDefault(config);

		var formatMaskStr 	= '',
			formatMomentStr	= '',
			placeholderStr 	= '',
			valueStr 		= '',
			isHaveError 	= false

		//设置 placeholder 和 outputValueStr 属性
		formatMomentStr = _this.getMomentStr(config);
		placeholderStr = _this.getPlaceholderStr(config, formatMomentStr);
		//format是必须是文本，如果没有则设置为默认值
		formatMaskStr = _this.getMaskFormatStr(config);  //返回的是y/m/d类型的
		if(formatMaskStr === false){
			return;
		}

		//value可以是''或者时间戳
		var valueStr = _this.getValueStr(config);
		if(valueStr === false){
			return;
		}
		
		//输出到config参数
		config.formatMask = formatMaskStr;  	//输入的maskInput格式化值
		config.placeholder = placeholderStr; 	//
		config.outputValueStr = valueStr; 		//字符串格式的时间戳 1996年09月12日
		config.formatMoment = formatMomentStr; 	//获取时间用的 例如 YYYY/MM/D
		config.isHaveError = isHaveError; 		//是否有错误
	},
	//初始化
	init:function(config){
		var $input = $('#'+config.fullID);
		config.$input = $input;
		if(config.formatMask != ''){
			$input.inputmask(config.formatMask);
		}
		config.$input.on('blur', {_config:config, _this:this}, function(blurEvent){
			var _this = blurEvent.data._this;
			var _config = blurEvent.data._config;
			var value = _this.getValue(_config);
			var json = {
				value:value,
				config:_config
			};
			if(typeof(_config.commonChangeHandler)=='function'){
				_config.commonChangeHandler(json);
			}
		})
	},
	//设置焦点
	setFocus:function(_config){
		_config.$input.focus();
	},
	//显示警告状态
	setErrorState:function(_config, errorInfoStr){
		var i18n = this.i18n[languagePackage.userLang];
		nsalert(_config.label+'('+_config.id+')'+i18n.getValueError,'error');
		if(_config.$input.hasClass('warning')){
			_config.$input.removeClass('warning');
		}
		_config.$input.addClass('warning');

		if(typeof(errorInfoStr)=='string'){
			_config.$input.parent().append('<div class="error-state-info">'+errorInfoStr+'</div>');
		}
		
		_config.$input.one(
			'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', 
			{$input:_config.$input}, 
			function(ev){
				ev.data.$input.removeClass('warning');
				_config.$input.parent().children('div.error-state-info').remove();
		});
	},
	//获取值
	getValue:function(config){
		var i18n = this.i18n[languagePackage.userLang];
		var inputStr = config.$input.val();
		var returnTimeStamp = -1;
		if(inputStr != ''){
			
			//检查是否有未输入完成的值
			if(inputStr.search(/_/)>-1){
				this.setErrorState(config, i18n.uncompletedInput);
				return false;
			}
			inputStr = moment(inputStr, config.format).format('x');
			if(inputStr != 'Invalid date'){
				returnTimeStamp = parseInt(inputStr);
				//判断是否使用当前时期的结束时间 23:59:59
				if(config.isUseDayEnd){
					returnTimeStamp += 86399000;
				}
				//判断区间
				if(typeof(config.validStartTimeStamp)=='number'){
					if(returnTimeStamp < config.validStartTimeStamp){
						var timeStr = moment(config.validStartTimeStamp).format(i18n.timeForat);
						this.setErrorState(config, i18n.validStartDate + timeStr);
						//提示信息类似于 不早于2018/08/08
						return false;
					}
				}
				if(typeof(config.validEndTimeStamp)=='number'){
					if(returnTimeStamp > config.validEndTimeStamp){
						var timeStr = moment(config.validEndTimeStamp).format(i18n.timeForat);
						this.setErrorState(config, i18n.validEndDate + timeStr);
						return false;
					}
				}
			}else{
				return false;
			}
		}else{
			returnTimeStamp = '';
		}
		return returnTimeStamp;
	}
}