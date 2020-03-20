// 获得格式化的rules： 拆分rules值 转化为可用状态 {reg："max"，compareNum：2}
nsComponent.getFormatRules = function(ruleStr){
	//ruleStr:string 	组件验证规则 config.rules中的一个验证规则 
	// 					举例：config.rules = 'max=2 required'调用此方法两次
	var compareArr = [];
	if(ruleStr.indexOf('=') > -1){
		//含有=号的
		//minlength min max maxlength precison range rangelength
		var compareNum = ruleStr.substring(ruleStr.lastIndexOf('=')+1,ruleStr.length);
		ruleStr = ruleStr.substring(0,ruleStr.lastIndexOf('='));
		compareArr.push(compareNum);
		if(compareNum.indexOf('[')>-1){
			// 包含[] 例 rangelength=[1,3]
			compareNum = compareNum.substring(compareNum.indexOf('[')+1,compareNum.indexOf(']'));
			compareNum = compareNum.split(',');
			compareArr = compareArr;
		}
	}
	return {
		ruleName:ruleStr, // 规则
		compareArr:compareArr, // 比较值  数组
	}
}
// 验证报错信息
nsComponent.validateMsg = {
	required: "必填",
	remote: "验证未通过",
	email: "电子邮件",
	url: "有效网址",
	date: "不合法",
	dateISO: "有效日期 (YYYY-MM-DD)",
	number: "仅限数字",
	money: "仅限数字",
	positiveInteger:"正整数",
	integer:"整数",
	digits: "只能是数字",
	equalTo: "两次输入不同",
	maxlength: $.validator.format("最多 {0} 个字符"),
	minlength: $.validator.format("最少 {0} 个字符"),
	rangelength: $.validator.format("长度在 {0} 到 {1} 之间"),
	range: $.validator.format("范围在 {0} 到 {1} 之间"),
	max: $.validator.format("不大于 {0} 的数值"),
	min: $.validator.format("不小于 {0} 的数值"),
	ismobile:'手机号有误',
	mobile:'手机号有误',
	isphone:'座机号有误',
	phone:'座机号有误',
	bankno:'银行卡号有误',
	postalcode:'邮政编码有误',
	tablename:'表名不合法',
	year:'年份有误',
	month:'月份有误',
	Icd:'身份证号有误',
	precision:$.validator.format("小数 {0} 位"), // 小数位数
	radio:'必填',
	checkbox:'必填',
	negative:'只能是负数',
	nonnegativeInteger:'只能是非负整数',
}
// 验证value是否合法 
nsComponent.getIsValidate = function(value, ruleStr, formID){
	/*
	 * value : 表单的value值
	 * ruleStr : rules的配置值 如 max=0 ；required
	 * formID : 表单容器id
	 */
	var isPass = false; // 是否合法
	var debugerMatch = false; // 不能识别的rules 时 debugerMatch：true --> isPass=false 不合法
	var regStr; // 验证正则
	var formatRules = nsComponent.getFormatRules(ruleStr);
	var ruleName = formatRules.ruleName; // 规则名称
	var compareArr = formatRules.compareArr; // 若有 = 等号后边值 数组 没有比较值为空数组
	if(ruleName!='required' && ruleName!='radio' && ruleName!='checkbox'){
		if(value.length==0){
			return true;
		}
	}
	switch(ruleName){
		case 'ismobile':
		case 'mobile':
			//手机号验证
			regStr=/^(13[0-9]|14[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])\d{8}$/;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'isphone':
		case 'phone':
			//固定电话验证
			regStr = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;//d*$;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'postalcode':
			//邮政编码验证
			regStr = /^[0-9]\d{5}$/;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'tablename':
			//只能输入26个英文字母和下划线
			regStr = /^[a-zA-Z_]*$/;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'year':
			//年份验证
			regStr = /(19[\d][\d]|20[\d][\d])$/;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'month':
			//月份验证
			regStr=/^(0?[1-9]|1[0-2])$/;
			if(regStr.test(value)){
				isPass = true;
			}
			break;
		case 'bankno':
			//银行卡号验证
			isPass = nsValid.bankno(value);
			break;
		case 'Icd':
			//身份证号验证
			isPass = nsValid.Icd(value);
			break;
		case 'positiveInteger':
		    //正整数验证
		    var g = /^[1-9]*[1-9][0-9]*$/;
		    if(g.test(value)){
		    	isPass = true;
		    }
		    break;
		case 'nonnegativeInteger':
		    //非负整数验证
		    var g = /^([1-9]\d*|[0]{1,1})$/;
		    if(g.test(value)){
		    	isPass = true;
		    }
		    break;
		case 'integer':
		     //整数验证
		     /*var reg = /^-?[1-9]*[1-9][0-9]*$/;*/
		     var reg = /^-?\d+$/;
		     if(reg.test(value)){
		     	isPass = true;
		     }
		     break;	
		case 'max':
			var compareNum = compareArr[0];
			if(Number(value) <= compareNum){
				isPass = true;
			}
			break;
		case 'min':
			var compareNum = compareArr[0];
			if(compareNum <= Number(value)){
				isPass = true;
			}
			break;
		case 'minlength':
			var compareNum = compareArr[0];
			if(compareNum <= value.length){
				isPass = true;
			}
			break;
		case 'maxlength':
			var compareNum = compareArr[0];
			if(value.length <= compareNum){
				isPass = true;
			}
			break;
		case 'negative':
			//负数验证
			if(Number(value) <= 0){
				isPass = true;
			}
			break;
		case 'email':
		     //邮箱验证
		     var reg = /^([a-zA-Z0-9\._-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
		     if(reg.test(value)){
		     	isPass = true;
		     }
		     break;
		case 'required':
		case 'radio':
		case 'checkbox':
			// 必填
			if(typeof(value)=='number'){
				isPass = true;
			}else{
				if(value.length>0){
					isPass = true;
				}
			}
			break;
		case 'number':
		case 'money':
			// 数字
			var reg = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
			isPass = reg.test(value);
			// if($.isNumeric(value)){
			// 	isPass = true;
			// }
			break;
		case 'dateISO':
			// 有效日期 (YYYY-MM-DD)
			var reg = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
			isPass = reg.test(value);
			break;
		case 'remote':
			// 验证未通过
			
			break;
		case 'url':
			// url
			var reg = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
			isPass = reg.test(value);
			break;
		case 'date':
			// date
			var reg = /Invalid|NaN/;
			isPass = !reg.test(new Date(value).toString());
			break;
		case 'digits':
			// 只能是数字
			var reg = /^\d+$/;
			isPass = reg.test(value);
			break;
		case 'equalTo':
			var compareStr = compareArr[0];
			// 两次输入不同
			var compareConfig = nsForm.data[formID].formInput[compareStr];
			var compareContainer = compareConfig.$input;
			var fieldVal = compareContainer.val();
			if($.trim(fieldVal)==$.trim(value)){
				isPass = true;
			}
			break;
		case 'rangelength':
			// 长度在 {0} 到 {1} 之间
			if(value.length>=compareArr[0] && value.length<=compareArr[1]){
				isPass = true;
			}
			break;
		case 'range':
			// 范围在 {0} 到 {1} 之间
			if(Number(value)>=compareArr[0] && Number(value)<=compareArr[1]){
				isPass = true;
			}
			break;
		case 'precision':
			var compareNum = compareArr[0];
			// 小数 {0} 位
			isPass = nsValid.precision(value,Number(compareNum));
			break;
		default:
			debugerMatch = true;
			break;
	}
	if(debugerMode){
		if(debugerMatch){
			nsAlert('( '+ruleName+' ) 规则参数错误');
			isPass = false;
		}
	}
	return isPass;
}
// 显示组件（验证未通过等）状态，输出提示信息
nsComponent.showState = function(options){
	/*options:object
	 *{
	 * 	alertStr:string 	使用alert方式展示的信息，没有则不执行
	 *  popStr:string		表单组件右上角显示的提示信息，如"必填"
	 *  stateType:string 	状态类型 'warning/error/info/success'  添加在$container和$popContainer上，
	 *  $container:object(jquery DOM) 	组件容器 用于找到pop信息的parent
	 *  $input:object(jquery DOM) 		组件容器 用于显示状态 
	 *}
	 * 组件对应提示信息HTML：
	 * <div class="nscomponentstate-warning">必填</div> nscomponentstate-error/info/success
	 * 追加到$container里(append)
	 * 
	 **/
	if(debugerMode){
		optionArr = 
		[
			['alertStr',		'string',true],
			['popStr', 			'string',false],
			['stateType', 		'string',false],
			['$container', 		'object',true],
			['$input', 			'object',true]
		]
		var isValid = nsDebuger.validOptions(optionArr, options);
		if(isValid == false){
			return false;
		}
	}
	var alertStr 		= options.alertStr; 	
	var popStr 			= options.popStr;
	var stateType 		= typeof(options.stateType)=='string'?options.stateType:'warning';
	var $container 		= options.$container;
	var $input 			= options.$input;
	
	// 如果定义了alertStr则执行
	if(typeof(alertStr) == 'string'){
		// nsalert(alertStr, stateType); // alert提示
	}
	
	// 删除原来的警告状态添加新的警告状态
	var htmlClass = 'nscomponentstate-'+stateType;
	if($input.hasClass(stateType)){
		$input.removeClass(stateType);
		$container.children('.' + htmlClass).remove();
	}
	var $state = $('<div class="'+htmlClass+'">'+popStr+'</div>');
	$input.addClass(stateType);
	// 插入提示的错误信息
	$container.append($state);
	$input.one(
		'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
		options, 
		function(ev){
			var _options = ev.data;
			_options.$input.removeClass(_options.stateType);
			_options.$container.children('div.nscomponentstate-'+_options.stateType).remove();
	});
	var setTime = setTimeout(function(){ 
		$input.removeClass(stateType);
		$container.children('div.nscomponentstate-'+stateType).remove();
		clearTimeout(setTime);
	}, 1000);
}
// 移除组件（验证通过）状态 现在没有用 修改验证时（验证不消失）
nsComponent.removeState = function(options){
	var stateType 		= typeof(options.stateType)=='string'?options.stateType:'warning';
	var $container 		= options.$container;
	var $input 			= options.$input;
	$input.removeClass(stateType);
	$container.children('div.nscomponentstate-'+stateType).remove();
	clearTimeout(setTime);
}
// 获得字段的获得焦点方法
nsComponent.getFieldFocusMethod = function(formId,fieldId){
	/*
	 * formId : 表单id
	 * fieldId : 字段id
	 */
	var allFieldConfigObj = nsForm.data[formId].formInput; // 当前表单中所有字段配置
	var fieldConfig = allFieldConfigObj[fieldId];
	if(fieldConfig){
		return function(){
			fieldConfig.focus();
		}
	}
}
// 获取config的value
nsComponent.getValue = function(config){
	//获取组件的value null和undefined转为空格
	//返回值是string/object 返回value
	//日期组件默认为今天
	var returnValue = '';
	//value可以是数字，字符串，function，null(object), undefined
	if(typeof(config.value)=='function'){
		returnValue = config.value();
		if(debugerMode){
			if(typeof(returnValue)=='undefined'){
				console.warn(language.common.nscomponent.part.returnValueEmpty)
				console.warn(config.value);
			}
		}
		if(typeof(returnValue)=='undefined'){
			returnValue = '';
		}
	}else if(typeof(config.value)=='object'){
		if(config.value==null){
			returnValue = '';
		}else if($.isEmptyObject(config.value)){
			returnValue = '';
		}else{
			returnValue = config.value;
		}
	}else if(typeof(config.value)=='number'){
		returnValue = config.value.toString();
	}else if(typeof(config.value)=='string'){
		returnValue = config.value;
	}

	//特殊控件默认值处理
	switch(config.type){
		case 'date':
			//如果是日期控件,默认值为今天
			var formatStr = typeof(config.format)=='string'?config.format:nsVals.default.momentDate;
			formatStr = formatStr.toUpperCase();
			//判断是否设置默认日期显示(默认为true 显示)
			config.isDefaultDate = typeof(config.isDefaultDate)=='boolean'?config.isDefaultDate:true;
			if(config.value===''){
				if(config.isDefaultDate){
					returnValue = moment().format(formatStr);
				}
			}else if(typeof(config.value)=='function'){
				returnValue = config.value();
			}else{
				returnValue = config.value;
				returnValue = moment(config.value).format(formatStr);
				if(debugerMode){
					if(returnValue=='Invalid date'){
						console.error(language.common.nscomponent.part.invalidDate+nsVals.default.momentDate)
						console.error(config.value);
					};
				}
			}
			break;
		case 'datetime':
			// 时间控件格式
			var formatStr = typeof(config.format)=='string'?config.format:nsVals.default.momentDataTime;
			// 日期格式大写 时间格式没有限制
			var formatStrArr = formatStr.split(' ');
			formatStrArr[0] = formatStrArr[0].toUpperCase();
			if(formatStrArr.length==2){
				formatStr = formatStrArr[0] + ' ' + formatStrArr[1];
			}else{
				formatStr = formatStrArr[0];
			}
			if(config.value){
				returnValue = moment(config.value).format(formatStr);
				if(debugerMode){
					if(returnValue=='Invalid date'){
						console.error(language.common.nscomponent.part.invalidDate+nsVals.default.momentDataTime);
						console.error(config.value);
					};
				}
			}
			break;
		case 'checkbox':
			// 复选框如果subdata只有一个并且value值是1 设置value
			if(config.subdata.length==1&&returnValue=='1'){
				returnValue = config.subdata[0][config.valueField];
			}
			// value是数组模式 返回选中的value
			if(config.isObjectValue && $.isArray(returnValue)){
				// returnValue = returnValue[0][config.valueField];
				var souReturnValue = [];
				for(var i=0;i<returnValue.length;i++){
					souReturnValue.push(returnValue[i][config.valueField]);
				}
				returnValue = souReturnValue;
			}
			break;
		case 'radio':
			// value是数组模式 返回选中的value
			if(config.isObjectValue && $.isArray(returnValue)){
				returnValue = returnValue[0][config.valueField];
			}
			break;
	}
	return returnValue;
}
// input类型的通用属性
nsComponent.getDefalutAttr = function(config){
	var readonlyStr = config.readonly? ' readonly="readonly"':'';
	var html = 
		'id="'+config.fullID+'"'
		+ ' nstype="'+config.type+'"'
		+ ' ns-id="'+config.id+'"'
		+ readonlyStr
	return html;
}
// 组件加载中代码
nsComponent.getLoadingHtml = function(){
	var html =  
		'<div class="input-loading">'
			+'<i class="fa fa-circle-o-notch fa-spin fa-fw"></i>'
		+'</div>'
	return html;
}
// 设置config的data参数 设置formatData和sourceData 并格式化data
// 主要用于关联字段配置
nsComponent.setConfigData = function(_config){
	/*
	 * _config : 字段配置
	 */
	if(_config.isInit){
		// 已经初始化
		if(typeof(_config.getAjaxRelevantParameter)=='function'){
			var formData = _config.getAjaxRelevantParameter();
			for(var dataAttr in _config.formatData){
				// 判断是否有关联参数 false 表示直接传的值不是通过其他字段获得的
				if(_config.formatData[dataAttr]){
					// 关联属性赋值
					_config.data[dataAttr] = formData[_config.formatData[dataAttr]];
					if(_config.data[dataAttr]==''){
						delete _config.data[dataAttr];
					}
				}
			}
		}
	}else{
		// 未初始化
		if(typeof(_config.getAllFieldConfig)=='function'){
			// sourceData/formatData 可能在修改在修改弹框时将data查询的参数进行了处理 所以第一次初始化时不是 {this.***} 格式 因为已经进行了赋值
			if(typeof(_config.sourceData)=='undefined'){
				_config.sourceData = $.extend(true,{},_config.data); // 原始的data
			}
			if(typeof(_config.formatData)=='undefined'){
				_config.formatData = $.extend(true,{},_config.data); // 格式化的data
			}
			if(!$.isEmptyObject(_config.data)){
				var markRegexp = /\{(.*?)\}/; // 验证data值是否是‘{***}’样式
				// 通过关联字段的id获得关联data属性值
				function getValueByRelFieldId(fieldId){
					var allFieldConfig = _config.getAllFieldConfig();
					var fieldObj = allFieldConfig[fieldId]; // 获得关联字段配置对象
					// 没有找到关联字段
					if($.isEmptyObject(fieldObj)){
						return false;
					}
					// 关联字段的value
					var valueStr = '';
					if(typeof(fieldObj.value)=='string'){
						valueStr = fieldObj.value;
					}else{
						// 没有value并且有subdata时查询是否设置selected
						if(typeof(fieldObj.subdata)=='object'){
							for(var indexI=0;indexI<fieldObj.subdata.length;indexI++){
								if(fieldObj.subdata[indexI].selected){
									valueStr = fieldObj.subdata[indexI][fieldObj.valueField];
								}
							}
						}
					}
					return valueStr;
				}
				// 格式化data数据 关联关系的字段记录对应的字段id，不是关联关系的记为false
				for(var dataAttr in _config.data){
					var dataVal = _config.data[dataAttr];
					var isHaveRel = markRegexp.test(dataVal); // 是否有关联关系，如果‘{**}’格式则有关联关系
					if(isHaveRel){
						var relField = dataVal.match(markRegexp)[1];
						// 判断是否存在点/‘.’,存在认为关联字段定义正确否则定义错误
						if(relField.indexOf('.')>-1){
							var relFieldArr = relField.split('.');
							var relType = relFieldArr[0];
							var relFieldId = relFieldArr[1];
							_config.formatData[dataAttr] = relFieldId;
							switch(relType){
								case 'this':
									// 参数在当前表单数组上
									var dataAttrVal = getValueByRelFieldId(relFieldId);
									if(dataAttrVal===false){
										console.error(_config.data[dataAttr]);
										console.error('没有找到该字段对应的关联字段，请检查配置是否正确');
									}else{
										_config.data[dataAttr] = dataAttrVal;
										if(_config.data[dataAttr]==''){
											delete _config.data[dataAttr];
										}
									}
									break;
								case 'page':
									// 参数在当前页面上
									break;
								default:
									// 不能识别
									console.error('关联参数格式错误，应该是this.**/page.**格式，此参数将删除');
									delete dataAttr[dataAttr];
									break;
							}
						}else{
							switch(relField){
								case 'search':
									// 搜索字段
									_config.formatData[dataAttr] = 'searchField';
									break;
							}
						}
					}else{
						if(typeof(_config.formatData[dataAttr])=='undefined'){
							_config.formatData[dataAttr] = false; // 不是和关联属性是设置为false
						}
					}
				}
			}
		}
	}
}
// 格式化ajax的data参数 保留原始值/应用值/格式化获得参照值
nsComponent.formatAjaxData = function(config, components){
	/*
	 * config  		object 		组件配置
	 * components 	object 		表单所有组件配置
	 *
	 * 处理data值
	 * 处理格式是{id:'{this.id}',name:'page.name',age:'{search}'}
	 * this 	表示在当前组件字段中获取
	 * page 	表示通过页面数据获取
	 * search 	表示用于搜索的字段
	 *
	 * {id:'{this.id}',name:'page.name',age:'{search}',tel:1522659}
	 * 处理结果
	 * data： 			应用值(ajax发送的值)		{id:'',name:'',age:'',tel:1522659}
	 * sourceData: 		原始值						{id:'{this.id}',name:'page.name',age:'{search}',tel:1522659}
	 * formatData: 		格式化获得参照值			{id:id,name:name,age:searchField,tel:false}
	 *
	 * 单独保存搜索请求时发送的key值 保存字段 searchKeyName
	 */
	if(typeof(config)!=='object'||typeof(components)!=='object'){
		console.error('调用错误，config/components必填');
		return false;
	}
	var data = {};
	var sourceData = {};
	var formatData = {};
	// 判断是否初始化若已经初始化 修改组件
	if(config.isInit){
		data = config.ajaxConfig.data;
		sourceData = config.ajaxConfig.sourceData;
		formatData = config.ajaxConfig.formatData;
	}else{
        config.isInit = true;
		sourceData = $.extend(true,{},config.ajaxConfig.data);
		data = config.ajaxConfig.data;
		var markRegexp = /\{(.*?)\}/; // 验证data值是否是‘{***}’样式
		// 格式化data数据 关联关系的字段记录对应的字段id，不是关联关系的记为false
		for(var dataAttr in data){
			var dataVal = data[dataAttr];
			var isHaveRel = markRegexp.test(dataVal); // 是否有关联关系，如果‘{**}’格式则有关联关系
			if(isHaveRel){
				var relField = dataVal.match(markRegexp)[1];
				// 判断是否存在点/‘.’,存在认为关联字段定义正确否则定义错误
				if(relField.indexOf('.')>-1){
					var relFieldArr = relField.split('.');
					var relType = relFieldArr[0];
					var relFieldId = relFieldArr[1];
					data[dataAttr] = '';
					switch(relType){
						case 'this':
                            if(relFieldArr.length>2){
                                for(var i=2;i<relFieldArr.length;i++){
                                    relFieldId +='.' + relFieldArr[i];
                                }
                            }
                            formatData[dataAttr] = {
                                type : relType,
                                field : relFieldId
                            };
							break;
						case 'page':
							// 参数在当前页面上
                            if(relFieldArr.length>2){
                                for(var i=2;i<relFieldArr.length;i++){
                                    relFieldId +='.' + relFieldArr[i];
                                }
                            }
							// formatData[dataAttr] = relFieldId;
                            formatData[dataAttr] = {
                                type : relType,
                                field : relFieldId
                            };
							break;
						default:
							// 不能识别
							console.error('关联参数格式错误，应该是this.**/page.**格式，此参数将删除');
							console.error(relField);
							console.error(config);
							formatData[dataAttr] = false; // 不是和关联属性是设置为false
							break;
					}
				}else{
					switch(relField){
						case 'search':
							// 搜索字段
							data[dataAttr] = '';
							// formatData[dataAttr] = 'searchField';
							config.searchKeyName = dataAttr;
                            formatData[dataAttr] = {
                                type : relField,
                                field : 'searchField'
                            };
							break;
					}
				}
			}else{
				if(typeof(formatData[dataAttr])=='undefined'){
					formatData[dataAttr] = false; // 不是和关联属性是设置为false
				}
			}
		}
		config.ajaxConfig.sourceData = sourceData;
		config.ajaxConfig.formatData = formatData;
	}
    // var components = config.components;
	for(var dataKey in formatData){
		if(formatData[dataKey]!=false){
            var dataType = formatData[dataKey].type;
            var fieldId = formatData[dataKey].field;
			switch(dataType){
				case 'search':
				case 'searchField':
					// 搜索字段
					data[dataKey] = typeof(data[dataKey])=='string'?data[dataKey]:'';
					break;
                case 'page':
                    // var fieldId = formatData[dataKey];
                    var fieldIdArr = fieldId.split('.');
                    var formID = config.formID;
                    var formConfig = nsForm.organizaData[formID];
                    if(typeof(formConfig)!='object'){
						console.error('表单不存在');
						console.error(formID);
						console.error(config);
						break;
                    }
                    if(typeof(formConfig.getPageDataFunc)!="function"){
                        console.error('表单获取页面数据方法getPageDataFunc不存在');
						console.error(formConfig);
						console.error(config);
						break;
                    }
                    var pageData = formConfig.getPageDataFunc();
                    var value = '';
                    if(fieldIdArr.length>0){
                        if(typeof(pageData[fieldIdArr[0]])!="undefined"){
                            value = pageData[fieldIdArr[0]];
                            if(fieldIdArr.length>1){
                                if($.isArray(pageData[fieldIdArr[0]])){
                                    var valueStr = '';
                                    for(var i=0; i<pageData[fieldIdArr[0]].length; i++){
                                        valueStr += pageData[fieldIdArr[0]][i][fieldIdArr[1]] + ',';
                                    }
                                    if(valueStr.length>0){
                                        valueStr = valueStr.substring(0,valueStr.length-1);
                                    }
                                    value = valueStr;
                                }else{
                                    if(typeof(pageData[fieldIdArr[0]])=="object"){
                                        value = pageData[fieldIdArr[0]][fieldIdArr[1]];
                                    }else{
                                        console.error('配置错误');
                                        console.error(fieldId);
                                        console.error(fieldId);
                                        break;
                                    }
                                }
                            }
                        }
                    }  
                    data[dataKey] = value;
                    break;
				default:
                    // var fieldId = formatData[dataKey];
                    var isObjVal = false;
                    if(fieldId.indexOf('.')>-1){
                        isObjVal = true;
                        var fieldIdArr = fieldId.split('.');
                        fieldId = fieldIdArr[0];
                        var fieldIdName = fieldIdArr[1];
                    }
					if(typeof(components[fieldId])!='object'){
						console.error('关联的参数字段不存在');
						console.error(fieldId);
						console.error(config);
						break;
                    }
                    var value = components[fieldId].value;
                    if(!value){
                        isObjVal = false;
                    }
                    if(isObjVal){
                        var valStr = '';
                        if($.isArray(value)){
                            for(var i=0;i<value.length;i++){
                                if(value[i][fieldIdName]){
                                    valStr += value[i][fieldIdName] + ',';
                                }else{
                                    console.error('value之中没有待用字段'+fieldIdName);
                                    console.error(value);
                                    console.error(components[fieldId]);
                                    console.error(config);
                                }
                            }
                            if(valStr.length>0){
                                valStr = valStr.substring(0, valStr.length-1);
                            }
                        }else{
                            if(typeof(value)=='object'){
                                if(value[fieldIdName]){
                                    valStr = value[fieldIdName];
                                }else{
                                    console.error('value之中没有待用字段'+fieldIdName);
                                    console.error(value);
                                    console.error(components[fieldId]);
                                    console.error(config);
                                }
                            }else{
                                console.error('value值格式错误，应该是对象类型');
                                console.error(value);
                                console.error(components[fieldId]);
                                console.error(config);
                            }
                        }
                        data[dataKey] = valStr;
                    }else{
                        data[dataKey] = value;
                    }
					break;
			}
            // if((typeof(data[dataKey])=="string"&&data[dataKey].length===0)||(typeof(data[dataKey])=="object"&&$.isEmptyObject(data[dataKey]))){
            //     delete data[dataKey];
            //     config.ajaxConfig.isErrorGetValue = true; // lyw 20190315 关联表达式取值错误
            // }
		}
	}
	config.ajaxConfig.data = data;
}
// 格式化ajax的data参数 保留原始值/应用值/格式化获得参照值
nsComponent.formatAjaxData2 = function(config, components){
	/*
	 * config  		object 		组件配置
	 * components 	object 		表单所有组件配置
	 *
	 * 处理data值
	 * 处理格式是{id:'{this.id}',name:'page.name',age:'{search}'}
	 * this 	表示在当前组件字段中获取
	 * page 	表示通过页面数据获取
	 * search 	表示用于搜索的字段
	 *
	 * {id:'{this.id}',name:'page.name',age:'{search}',tel:1522659}
	 * 处理结果
	 * data： 			应用值(ajax发送的值)		{id:'',name:'',age:'',tel:1522659}
	 * sourceData: 		原始值						{id:'{this.id}',name:'page.name',age:'{search}',tel:1522659}
	 * formatData: 		格式化获得参照值			{id:id,name:name,age:searchField,tel:false}
	 *
	 * 单独保存搜索请求时发送的key值 保存字段 searchKeyName
	 */
	if(typeof(config)!=='object'||typeof(components)!=='object'){
		console.error('调用错误，config/components必填');
		return false;
	}
	var data = {};
	var sourceData = {};
	var formatData = {};
	// 判断是否初始化若果已经初始化 修改组件
	if(config.isInit){
		data = config.ajaxConfig.data;
		sourceData = config.ajaxConfig.sourceData;
		formatData = config.ajaxConfig.formatData;
	}else{
		sourceData = $.extend(true,{},config.ajaxConfig.data);
		data = config.ajaxConfig.data;
		var markRegexp = /\{(.*?)\}/; // 验证data值是否是‘{***}’样式
		// 格式化data数据 关联关系的字段记录对应的字段id，不是关联关系的记为false
		for(var dataAttr in data){
			var dataVal = data[dataAttr];
			var isHaveRel = markRegexp.test(dataVal); // 是否有关联关系，如果‘{**}’格式则有关联关系
			if(isHaveRel){
				var relField = dataVal.match(markRegexp)[1];
				// 判断是否存在点/‘.’,存在认为关联字段定义正确否则定义错误
				if(relField.indexOf('.')>-1){
					var relFieldArr = relField.split('.');
					var relType = relFieldArr[0];
					var relFieldId = relFieldArr[1];
					data[dataAttr] = '';
					switch(relType){
						case 'this':
							formatData[dataAttr] = relFieldId;
							break;
						case 'page':
							// 参数在当前页面上
							formatData[dataAttr] = relFieldId;
							break;
						default:
							// 不能识别
							console.error('关联参数格式错误，应该是this.**/page.**格式，此参数将删除');
							console.error(relField);
							console.error(config);
							formatData[dataAttr] = false; // 不是和关联属性是设置为false
							break;
					}
				}else{
					switch(relField){
						case 'search':
							// 搜索字段
							data[dataAttr] = '';
							formatData[dataAttr] = 'searchField';
							config.searchKeyName = dataAttr;
							break;
					}
				}
			}else{
				if(typeof(formatData[dataAttr])=='undefined'){
					formatData[dataAttr] = false; // 不是和关联属性是设置为false
				}
			}
		}
		config.ajaxConfig.sourceData = sourceData;
		config.ajaxConfig.formatData = formatData;
		config.isInit = true;
	}
	// var components = config.components;
	for(var dataKey in formatData){
		if(formatData[dataKey]!=false){
			switch(formatData[dataKey]){
				case 'searchField':
					// 搜索字段
					data[dataKey] = typeof(data[dataKey])=='string'?data[dataKey]:'';
					break;
				default:
					var fieldId = formatData[dataKey];
					if(typeof(components[fieldId])!='object'){
						console.error('关联的参数字段不存在');
						console.error(fieldId);
						console.error(config);
						break;
					}
					data[dataKey] = components[fieldId].value;
					break;
			}
		}
	}
	config.ajaxConfig.data = data;
}
// 移除提示错误信息容器
nsComponent.removeError = function($dom){
	var type = $dom.attr('nstype');
	var valueStr = '';
	switch(type){
		case 'uploadSingle':
			valueStr = $.trim($dom.text());
			break;
		case 'select':
		case 'select2':
		case 'typeahead':
		case 'typeaheadtemplate':
		case 'selectProvince':
			valueStr = $.trim($dom.val());
			break;
	}
	if(valueStr !==''){
		if($dom.parent().children('label.has-error').length == 1){
			$dom.parent().children('label.has-error').remove();
		}
	}
}
// 获取移动端组件的按钮的html 默认按钮【取消/确认】
nsComponent.getMobileBtns = function(btnConfig){
	/*
	 * isHide : 是否隐藏 默认false
	 * nameArr : 按钮名字 默认['清除','确认']
	 */
	if(typeof(btnConfig)=='undefined'){
		btnConfig = {
			isHide:false,
			nameArr:['清除','确认']
		}
	}
	if(btnConfig==true){ // 兼容开始只配置了isHide
		btnConfig = {
			isHide:true,
			nameArr:['清除','确认']
		}
	}
	var hideClass = btnConfig.isHide==true ? 'hide' : '';
	var nameArr = $.isArray(btnConfig.nameArr)?btnConfig.nameArr:['清除','确认'];
	var btnHtml = '<div class="btn-group '+hideClass+'">';
	for(var i=0;i<nameArr.length;i++){
		var btnClass = '';
		switch(nameArr[i]){
			case '清除':
				btnClass = 'btn-default';
				break;
			default:
				btnClass = 'btn-info';
				break;
		}
		btnHtml += '<button class="btn '+btnClass+'">'
					+ '<span>'+nameArr[i]+'</span>'
				+ '</button>'
	}
	btnHtml += '</div>';
	return btnHtml;
}
//组件获取subData的通用方法
nsComponent.getAjaxSubdata = function(componentConfig, components, callbackFunc){
	/** cy 20181025
	 * ajaxConfig 		ajax配置参数
	 * componentConfig 	组件的config, 其中componentConfig.ajaxConfig 是{url, type, data, contentType}
	 * components 		表单所有色组件配置
	 * callbackFunc 	完成时候的回调 成功返回ajax中dataSrc数组，错误回调空数组[]  
	 * 
	 * return callbackFunc返回时候的参数是包含了subdata的组件config
	 **/
	// 格式化ajax的data数据
	nsComponent.formatAjaxData(componentConfig, components);
	// application/json 则需要使用 JSON.stringify
	var ajaxConfig = componentConfig.ajaxConfig;
	var ajaxData = ajaxConfig.data;
	var contentType = ajaxConfig.contentType;
	// 如果data数据存在对象的value值设置contentType==application/json
	if(contentType!='application/json'){
		for(var dataKey in ajaxData){
			if(typeof(ajaxData[dataKey])=='object'){
				contentType = 'application/json';
				break;
			}
		}
	}
	if(contentType){
		if(contentType == 'application/json' && typeof(ajaxConfig.data)=='object'){
			// ajaxData = JSON.stringify(ajaxConfig.data);
		}
	}
	// var ajaxType = contentType == 'application/json'? 'POST' : componentConfig.ajaxConfig.type;
	var ajaxType = componentConfig.ajaxConfig.type;
	var _ajaxConfig = {
		url: 		componentConfig.ajaxConfig.url,
		type: 		ajaxType,
		data: 		ajaxData,
		plusData: 	{ 
			formID : componentConfig.formID, 
			componentId : componentConfig.id,
			callbackFunc : callbackFunc 
		},
		dataType: 	'json',
	}
	if(contentType == 'application/json'){
		_ajaxConfig.contentType = contentType;
	}
	NetStarUtils.ajax(_ajaxConfig, function(res, ajaxData){
		var formID = ajaxData.plusData.formID;
		var componentId = ajaxData.plusData.componentId;
		var callbackFunc = ajaxData.plusData.callbackFunc;
		var _componentConfig = nsForm.data[formID].formInput[componentId];
		_componentConfig.ajaxLoading = false;
		if(res.success){
			var subdata;
			if(typeof(_componentConfig.ajaxConfig.dataSrc)=='string'){
				subdata = res[_componentConfig.ajaxConfig.dataSrc];
			}else{
				subdata = res;
			}
			//是否获取数据成功
			var isGetSubdata  = true;
			if($.isArray(subdata)){
				_componentConfig.subdata = subdata;
			}else{
				if(typeof(subdata) != 'undefined'){
					//既不是数组也不是underfined则认为是错误
					isGetSubdata = false;
					if(debugerMode){
						console.error('获取组件subdata数据失败');
						console.error(_componentConfig);
					}
				}else{
					//没有返回值的时候（undifined）可能是合法的
					_componentConfig.subdata = [];
				}
			}
			if(typeof(callbackFunc)=='function'){
				callbackFunc(_componentConfig, isGetSubdata);
			}
		}else{
			nsalert(language.common.nscomponent.part.radioAjaxError,'error');
			// 移除正在加载
			if(typeof(callbackFunc)=='function'){
				callbackFunc(_componentConfig, false, res.error);
			}
			if(debugerMode){
				console.log(res.error);
				console.log(_componentConfig);
			}
		}
	}, true);
}
// 获取标签html代码（移动端）
nsComponent.getTagHtml = function(tagConfig){
	/*
	 * tagConfig 	: object 			必填  			获取标签的配置参数 若不是object返回空字符串 报错
	 * {
	 * 	 type 		: string  			选填			标签类型 默认类型show(展示) 其它 acts(功能)
	 * 	 text 		: string/number 	必填			标签内容 若为空返回空字符串 报错
	 * 	 acts 		: string 			选填			如果是功能类型，标签的功能作用
	 * 	 seat 		：string			选填 			位置，标签位于表单的什么位置
	 * 	 isShowText : boolean 			选填 			是否显示text ，默认显示（只在个别功能类型中有作用）
	 * 	 iconsName 	: string 			选填 			图标名字 ，只有在功能类型icons有用
	 * }
	 */
	// 验证tagConfig类型
	if(typeof(tagConfig)!='object'){
		console.error('获取标签的配置参数错误，tagConfig必填');
		return '';
	}
	// 验证text是否存在 不存在时返回空字符串
	var text = tagConfig.text;
	if(typeof(text)=='undefined'||typeof(text)=='object'||text==''){
		console.error('获取标签的配置参数错误，text必填并且类型是字符串或数字');
		return '';
	}
	// 类型 默认show
	var type = typeof(tagConfig.type)=='string'?tagConfig.type:'show';
	// 返回的标签html
	var html = '';
	if(type == 'show'){
		// 展示类型
		html = '<span class="show-text">'+text+'</span>';
		return html;
	}
	if(type == 'acts'){
		// 功能类型 acts必填 默认是label(标签)
		var acts = typeof(tagConfig.acts)=='string'?tagConfig.acts:'label';
		// 标签位置 默认空
		var seat = typeof(tagConfig.seat)=='string'?tagConfig.seat:'';
		// 标签样式
		var tagClass = seat;
		// 是否显示text
		var isShowText = typeof(tagConfig.isShowText)=='boolean'?tagConfig.isShowText:true;
		// 根据功能类型生成html
		switch(acts){
			case 'label':
				// 标签 返回简单的<span>标签
				tagClass += "show-text";
				html = '<span class="'+tagClass+'">'+text+'</span>';
				break;
			case 'title':
				// 标签 返回简单的<span>标签
				tagClass += "show-title";
				html = '<span class="'+tagClass+'">'+text+'</span>';
				break;
			case 'formlabel':
				// 表单标签 返回包括label属性的标签
				tagClass += "show-text";
				html = '<span class="'+tagClass+'">'+ text +'</span>';
				break;
			case 'tel':
				// 电话号
				var textStr = isShowText ? text : '';
				tagClass += "show-tel";
				html = '<a  class="'+tagClass+'" href="tel:'+text+'">'+textStr+'</a>';
				break;
			case 'link':
				// 一个普通连接
				tagClass += "show-link";
				html = '<a  class="'+tagClass+'" href="'+text+'">'+text+'</a>';
				break;
			case 'block':
				// 一个块元素
				tagClass += "show-block";
				// text中存在“，”间隔表示是多选 功能模式块状态时多选应分开显示
				var textArr = text.split(',');
				for(var i=0;i<textArr.length;i++){
					html += '<span  class="'+tagClass+'">'+textArr[i]+'</span>';
				}
				break;
			case 'baidu':
				// 一个普通连接
				var textStr = isShowText ? text : '';
				tagClass += "show-link";
				html = '<a  class="'+tagClass+'" href="www.baidu.com">'+textStr+'</a>';
				break;
			case 'baiduMapByName':
				// 百度地图
				tagClass += "show-link";
				html = '<a  class="'+tagClass+'" href="http://api.map.baidu.com/geocoder?address='+ encodeURIComponent(text)+'&output=html&src=webapp.baidu.openAPIdemo" target="_blank"><i class="icon-map-mark-o"></i>'+text+'</a>';
				break;
			case 'doubt':
				// 问号
				tagClass += "show-link";
				html = '<span class="'+tagClass+'"><i class="icon-help-circle-o"></i>'+ text +'</span>';
				break;
			case 'icons':
				// 一个图标链接
				var textStr = isShowText ? text : '';
				tagClass += "show-link";
				var iconsName = typeof(tagConfig.iconsName)=='string'?tagConfig.iconsName:'';
				html = '<a  class="'+tagClass+' '+iconsName+'" href="'+text+'">'+textStr+'</a>';
				break;
			case 'date':
			case 'date-label':
				// 一个日期
				tagClass += "show-date";
				html = '<div class="'+tagClass+'">'
							+ '<div class="show-mask"></div>'
							+ '<input class="show-input" type="date" value="'+text+'">'
						+ '</div>';
				break;
			case 'datetime':
			case 'datetime-label':
				// 一个时间
				tagClass += "show-datetime";
				html = '<div class="'+tagClass+'">'
							+ '<div class="show-mask"></div>'
							+ '<input class="show-input" type="datetime-local" value="'+text+'">'
							// + '<input class="show-input" type="datetime" value="'+text+'">'
						+ '</div>';
				break;
			case 'qqMapByName':
				// 腾讯地图
				tagClass += "show-link";
				var config = tagConfig.config;
				html = '<span  class="'+tagClass+'" onclick="nsComponent.showQQMap(\''+text+'\',\''+config.formID+'\',\''+config.id+'\',\''+config.type+'\')"><i class="icon-map-mark-o"></i>'+text+'</span>';
				break;
		}
		return html;
	}
}
nsComponent.showQQMap = function(name, formID, componentId, type){
	var component = nsForm.data[formID].formInput[componentId];
	switch(type){
		case 'map':
			nsUI.mapInput.mapManager.init(component);
			break;
		default:
			var value = {
				address : name,
				code : '',
				longitude : '',
				latitude : '',
			}
			nsUI.mapInput.mapManager.actsQQMap(component, value);
			break;
	}
}
// 获取微信权限许可
nsComponent.getWXPermit = function(ajaxParameter){
	ajaxParameter = typeof(ajaxParameter) == "object" ? ajaxParameter : {};
	var data = {
		appId : 1,
		url : window.location.href,
	};
	if(typeof(ajaxParameter.appId) !== "undefined"){
		data.appId = ajaxParameter.appId;
	}
	var ajaxConfig = {
		url : getRootPath() + '/openApp/getWeChatSignature',
		type : 'POST',
		data : JSON.stringify(data),
		contentType : 'application/json',
	}
	if(typeof(ajaxParameter.plusData) !== "undefined"){
		ajaxConfig.plusData = ajaxParameter.plusData;
	}
	nsVals.ajax(ajaxConfig, function(res, ajaxData){
		if(res.success || typeof(res.data) != "object"){
			var plusData = ajaxData.plusData;
			var wxData = res.data;
			var jsApiList = ['getLocation'];
			if($.isArray(plusData.jsApiList)){
				jsApiList = plusData.jsApiList;
			}
			var wxConfig = {
				beta: 			true,				// 必须这么写，否则wx.invoke调用形式的jsapi会有问题
				debug: 			false, 				// 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: 			wxData.corpId, 		// 必填，企业微信的corpID
				timestamp: 		wxData.timestamp, 	// 必填，生成签名的时间戳
				nonceStr: 		wxData.noncestr, 	// 必填，生成签名的随机串
				signature: 		wxData.signature,	// 必填，签名，见 附录-JS-SDK使用权限签名算法
				jsApiList: 		jsApiList, 			// 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
			}
			wx.config(wxConfig);
			wx.ready(function(){
				if(typeof(plusData.callbackFunc) == "function"){
					plusData.callbackFunc(plusData, res.data);
				}
			});
		}else{
			nsAlert('微信权限获取失败');
			console.error('微信权限获取失败');
		}
	})
}
nsComponent.allEditInput = {
}
nsForm.tableData = {}
// 初始化组件
nsComponent.initComponentByInline = function(components){
	// 制造nsForm.data/nsFormBase.data/nsForm.organizaData
	var defaultFormSource = 'fullScreen';
	var formJson = {};
	for(var i=0; i<components.length; i++){
		var component = components[i];
		var formID = component.formID;
		var $container = component.$container;
		if(!formID || !($container && $container.length == 1)){
			console.error('formID/$container没有配置，请配置完整，前端配置');
			console.error(component);
			continue;
		}
		// 设置默认值
		formJson = !$.isEmptyObject(formJson) ? formJson : {
			id : formID,
			formSource : component.formSource ? component.formSource : defaultFormSource,
			form : [],
		};
		// nsForm.organizaData
		nsForm.organizaData[formID] = typeof(nsForm.organizaData[formID]) == "object" ? nsForm.organizaData[formID] : {
			form : [],
			id : formID,
			formSource : formJson.formSource,
		}
		nsForm.organizaData[formID].form.push($.extend(true, [], component));
		// component
		nsComponent.setDefault(component, formJson);
		// nsForm.data
		nsForm.data[formID] = typeof(nsForm.data[formID]) == "object" ? nsForm.data[formID] : {
			formInput : {},
			id : formID,
			formType : formJson.formSource,
		}
		nsForm.data[formID].formInput[component.id] = component;
		// nsFormBase.data
		nsFormBase.data[formID] = typeof(nsFormBase.data[formID]) == "object" ? nsFormBase.data[formID] : {
			config : formJson,
			fieldById : {},
			validateArr : [],
		}
		nsFormBase.data[formID].fieldById[component.id] = component;
		nsFormBase.data[formID].validateArr.push(component);
		nsFormBase.data[formID][component.type] = typeof(nsFormBase.data[formID][component.type]) == "object" ? nsFormBase.data[formID][component.type] : [];
		nsFormBase.data[formID][component.type].push(component);
		formJson.form.push(component);
		var html = nsComponent.getHTML(component, formJson);
		$container.append(html);
		var _components = {};
		_components[component.type] = [component];
		nsComponent.dataInit(_components, formID);
	}
}
nsComponent.setFormJsonByTable = function(formJson){
	var _components = formJson.components;
	var id = formJson.id;
	var components = [];
	var $table = $('#' + id);
	for(var i=0; i<_components.length; i++){
		var component = _components[i];
		var el = component.el;
		if($table.find(el) == 0){
			continue;
		}
		var $el = $table.find(el);
		for(var j=0; j<$el.length; j++){
			var _component = $.extend(true, {}, component);
			_component.id += '-' + j;
			components.push(_component);
			$el.eq(j).attr('ns-id', _component.id);
		}
	}
	formJson.form = components;
}
// 初始化组件
nsComponent.initComponentByTable = function(formJson){
	// 制造nsForm.data/nsFormBase.data/nsForm.organizaData
	// 验证id容器是否存在 不存在不可生成 报错
	var id = formJson.id;
	var $table = $('#' + id);
	if($table.length == 0){
		nsAlert('list初始化表单组件错误，id对象不存在', 'error');
		console.error('list初始化表单组件错误，id对象不存在');
		console.error(formJson);
		return;
	}
	// 设置nsForm.tableData 表格数据
	nsForm.tableData[id] = {
		organiza : $.extend(true, {}, formJson),
		config : formJson,
	}
	// 初始化出应用于表单结构的配置
	nsComponent.setFormJsonByTable(formJson);

	// 设置nsForm.organizaData
	nsForm.organizaData[id] = typeof(nsForm.organizaData[id]) == "object" ? nsForm.organizaData[id] : $.extend(true, {}, formJson);
	// 设置nsForm.data
	nsForm.data[id] = typeof(nsForm.data[id]) == "object" ? nsForm.data[id] : {
		formInput : {},
		id : id,
		formType : formJson.formSource,
	}
	// 设置nsFormBase.data
	nsFormBase.data[id] = typeof(nsFormBase.data[id]) == "object" ? nsFormBase.data[id] : {
		config : formJson,
		fieldById : {},
		validateArr : [],
	}
	// 设置formJson默认值
	formJson.formSource = typeof(formJson.formSource) == "string" ? formJson.formSource : 'fullScreen';

	// 为每个组件添加默认值
	var components = formJson.form;
	for(var i=0; i<components.length; i++){
		var component = components[i];
		// 设置组件默认值
		nsComponent.setDefault(component, formJson);
		if(typeof(component.changeHandler) == "function"){
			var _changehandler = component.changeHandler;
			component.changeHandler = function(val, config){
				var config = $.extend(true, {}, config);
				config.sourceId = config.id;
				config.id = config.id.substring(0, config.id.lastIndexOf('-'));
				_changehandler(val, config)
			}
		}
		if(typeof(component.commonChangeHandler) == "function"){
			var _commonChangeHandler = component.commonChangeHandler;
			component.commonChangeHandler = function(obj){
				var obj = $.extend(true, {}, obj);
				obj.sourceId = obj.id;
				obj.id = obj.id.substring(0, obj.id.lastIndexOf('-'));
				obj.config.id = obj.id;
				obj.config.sourceId = obj.sourceId;
				_commonChangeHandler(obj)
			}
		}
		// 记录表单组件
		nsForm.data[id].formInput[component.id] = component;
		nsFormBase.data[id].fieldById[component.id] = component;
		nsFormBase.data[id].validateArr.push(component);
		nsFormBase.data[id][component.type] = typeof(nsFormBase.data[id][component.type]) == "object" ? nsFormBase.data[id][component.type] : [];
		nsFormBase.data[id][component.type].push(component);
		// 生成表单组件
		var $container = $table.find(component.el + '[ns-id="' + component.id + '"]');
		var html = nsComponent.getHTML(component, formJson);
		$container.append(html);
		var _components = {};
		_components[component.type] = [component];
		nsComponent.dataInit(_components, id);
	}
}
nsForm.getFormJSONByTable = function(tableId, validata){
	var dataAll = nsForm.getFormJSON(tableId, validata, false);
	if(dataAll === false){
		return dataAll
	}
	var tableData = [];
	var tableObj = {};
	var max = 0;
	for(var key in dataAll){
		var id = key.substring(0, key.lastIndexOf('-'));
		var num = key.substring(key.lastIndexOf('-')+1);
		tableObj[num] = typeof(tableObj[num]) == "object" ? tableObj[num] : {};
		tableObj[num][id] = dataAll[key];
		var _num = Number(num);
		if(_num > max){
			max = _num;
		}
	}
	if(!$.isEmptyObject(tableObj)){
		for(var i=0; i<(max+1); i++){
			tableData[i] = tableObj[i.toString()];
		}
	}
	return tableData;
}
nsComponent.getOutputValueObjBySubdata = function(value, config){
	if(value === ''){
		return value;
	}
	var valSub = [];
	var outputFields = config.outputFields;
	var outputVal = {};
	if(typeof(value) == "object" && config.isObjectValue){
		valSub = value;
	}else{
		var valArr = [];
		if($.isArray(value)){
			valArr = value;
		}else{
			valArr = value.split(',');
		}
		var subdata = config.subdata;
		var valueField = config.valueField;
		for(var i=0; i<valArr.length; i++){
			for(var j=0; j<subdata.length; j++){
				if(subdata[j][valueField] == valArr[i]){
					valSub.push(subdata[j]);
					break;
				}
			}
		}
	}
	outputVal = NetStarUtils.getFormatParameterJSON(outputFields, valSub);
	outputVal[config.id] = value;
	return outputVal;
}
nsComponent.validatValue = function(validatConfig){
    /*
     * value : 表单的value值
     * rules : rules的配置值 如 max=0 ；required
     * type : 类型
     */
    var isTrue = true;
    var validatInfo = '';
    if(typeof(validatConfig.type)=="undefined"){
        console.warn('验证调取错误，没有发送type值，无法验证, 返回默认true');
        console.warn(validatConfig);
        return {
            isTrue:isTrue,
            validatInfo:validatInfo,
        };
	}
	var value = typeof(validatConfig.value)=="undefined"?'':validatConfig.value;
	var validateMsg = nsComponent.validateMsg; // rules验证报错信息
    if(typeof(validatConfig.rules)=="string"&&validatConfig.rules.length>0){
		var rules = validatConfig.rules;
		switch(validatConfig.type){
			case 'text':
			case 'number':
			case 'uploadImage':
			case 'adderSubtracter':
				var rulesArr = rules.split(' '); // rules之间以‘ ’分开 ，生成数组逐个验证
				for(var i=0;i<rulesArr.length;i++){
					var errorKey = rulesArr[i];
					var formatRules = nsComponent.getFormatRules(errorKey); // 格式化 rules 值
					errorKey = formatRules.ruleName; // 规则名称
					var errorVal = formatRules.compareArr; // 若有 = 等号后边值
					isTrue = nsComponent.getIsValidate(value, rulesArr[i]); // 是否合法
					if(!isTrue){
						var errorInfo = validateMsg[errorKey];
						if(typeof(errorInfo)=='function'){
							validatInfo = errorInfo(errorVal);
						}else{
							validatInfo = errorInfo;
						}
						break;
					}
				}
				break;
			case 'radio':
			case 'checkbox':
				var rulesArr = rules.split(' '); // rules之间以‘ ’分开 ，生成数组逐个验证
				if(rulesArr.indexOf(validatConfig.type)>-1){
					errorKey = validatConfig.type;
					isTrue = nsComponent.getIsValidate(value, validatConfig.type); // 是否合法
				}
				if(!isTrue){
					validatInfo = validateMsg[errorKey];
				}
				break;
			case 'map':
			case 'date':
			case 'datetime':
			case 'business':
				var rulesArr = rules.split(' '); // rules之间以‘ ’分开 ，生成数组逐个验证
				if(rulesArr.indexOf('required')>-1){
					errorKey = 'required';
					isTrue = nsComponent.getIsValidate(value, 'required'); // 是否合法
				}
				if(!isTrue){
					validatInfo = validateMsg[errorKey];
				}
				break;
			case 'daterangepicker':
				if(typeof(value)!="object"){
					break;
				}
				for(var key in value){
					if(value[key] === ''){
						nullNum ++;
					}
				}
				if(rules.indexOf('required')>-1){
					errorKey = 'required';
					if(nullNum == 2){
						isTrue = false;
						validatInfo = validateMsg[errorKey];
					}
				}
				break;
		}
    }
    return {
        isTrue:isTrue,
        validatInfo:validatInfo,
    };
}
// 设置移动端半屏容器
nsComponent.mobileHalfContainer = {
	i18n:{},  //当前语言集
	I18N:{
		zh:{
			confirm:'确认',
			cancel:'清除'
		},
		en:{
			confirm:'confirm',
			cancel:'cancel'
		}
	},
	isInit:false,
	init:function(){
		// 销毁之前生成的
		this.destroy();
		this.i18n = this.I18N[languagePackage.userLang];
	},
	destroy:function(){
		this.isInit = false;
		this.i18n = {};
		if(this.$container){
			this.$container.remove();
		}
		this.removeUnScroll();
	},
	show:function(config, html, callbackFunc){
		if(this.isInit == false){
			this.init();
		}
		//初始化整体容器和组件容器 按钮组件
		//this.$container , this.$componentContainer , this.$btnCancel , this.$btnConfirm
		this.$container = this.getContainer(config);
		// 初始按钮
		this.initBtns(config, callbackFunc);
		this.$contentContainer.append(this.$btns);
		this.$componentContainer.append(html);
		var $pageContainer = $('body');
		if(config.$calRelPositionContainer){
			var $pageContainer2 = config.$calRelPositionContainer.parents('container');
			if($pageContainer2.length > 0){
				$pageContainer = $pageContainer2;
			}
		}
		$pageContainer.append(this.$container);
		this.$pageContainer = $pageContainer;
		this.$pageContainerContent = this.getPageContainerContent();
		this.unScroll();
	},
	getPageContainerContent : function(){
		var $pageContainer = this.$pageContainer;
		var $containerContent = $pageContainer;
		var $nstemplate = $pageContainer.children('nstemplate');
		if($nstemplate.length == 1){
			var $childrens = $nstemplate.children();
			for(var i=0; i<$childrens.length; i++){
				var $children = $($childrens[i]);
				var position = $children.css('position');
				if(position != "fixed" && position != "absolute"){
					$containerContent = $children;
					break;
				}
			}
		}
		return $containerContent
	},
	hide:function(){
		if(this.$container){
			this.$container.remove();
		}
		this.removeUnScroll();
	},
	refresh:function(){
	},
	removeUnScroll : function(){
		var styleStr = this.sourceStyleStr;
		if(this.$pageContainerContent){
			this.$pageContainerContent.attr('style', styleStr);
		}
		if(typeof(this.documentScrollTop) == "number"){
			$(document).scrollTop(this.documentScrollTop);
		}
	},
	unScroll:function(){
		var _this = this;
		var styleStr = this.$pageContainerContent.attr('style');
		styleStr = styleStr ? styleStr : '';
		_this.sourceStyleStr = styleStr;
		if(styleStr.length > 0){
			if(styleStr[styleStr.length-1] != ';'){
				styleStr += ';';
			}
		}
		var top = $(document).scrollTop();
		styleStr = styleStr + 'position:fixed;left:0;right:0;bottom:0;top:-' + top + 'px;';
		this.documentScrollTop = top;
		this.$pageContainerContent.attr('style', styleStr);
	},
	initEvent:function(config, callbackFunc){
		var btnEventType = 'click';
		var hideEventType = 'mousedown';
		if(nsVals.browser.browserSystem == 'mobile'){
			btnEventType = 'click';
			hideEventType = 'touchstart';
		}else{
			btnEventType = 'click';
			hideEventType = 'mousedown';
		}
		// 取消 
		this.$btnCancel.off(btnEventType);
		this.$btnCancel.on(btnEventType, {config:config,callbackFunc:callbackFunc}, function(ev){
			var config = ev.data.config;
			var callbackFunc = ev.data.callbackFunc;
			callbackFunc(config, false);
			nsComponent.mobileHalfContainer.hide();
		});
		// 确认
		this.$btnConfirm.off(btnEventType);
		this.$btnConfirm.on(btnEventType, {config:config,callbackFunc:callbackFunc}, function(ev){
			var config = ev.data.config;
			var callbackFunc = ev.data.callbackFunc;
			callbackFunc(config, true);
			nsComponent.mobileHalfContainer.hide();
		});
		// 容器的点击事件
		this.$container.off(hideEventType);
		this.$container.on(hideEventType, {config:config,callbackFunc:callbackFunc}, function(ev){
			ev.stopPropagation();
			var evTargetClass = $(ev.target).attr('class');
			var config = ev.data.config;
			var callbackFunc = ev.data.callbackFunc;
			if(evTargetClass == 'mobilewindow-halfscreen-before' || evTargetClass == 'mobilewindow-halfscreen-after'){
				nsComponent.mobileHalfContainer.hide();
				ev.preventDefault();
			}
		});
	},
	// 初始化按钮
	initBtns:function(config, callbackFunc){
		var i18n = this.i18n;
		var btnNameArr = $.isArray(config.btnNameArr)?config.btnNameArr:[i18n.cancel,i18n.confirm];
		var $btns = $(nsComponent.getMobileBtns({
				isHide:false,
				nameArr:btnNameArr
			}));
		this.$btns = $btns;
		//取消按钮
		this.$btnCancel = $btns.children().eq(0);
		//确认按钮
		this.$btnConfirm = $btns.children().eq(1);
		// 初始化按钮方法
		this.initEvent(config, callbackFunc);
	},
	// 获得容器
	getContainer:function(config){
		//是否有提示标题
		var tooltipsHtml = '';
		if(config.tooltips){
			tooltipsHtml = '<span class="form-tooltips">'+config.tooltips+'</span>';
		}
		// 计算位置
		var $calRelPositionContainer = config.$calRelPositionContainer; // 计算相对位置的容器
		var offsetFormTd = $calRelPositionContainer.offset();
		var offsetTop = offsetFormTd.top;
		var labelHeight = $calRelPositionContainer.innerHeight();
		var containerTop = offsetTop+labelHeight;
		var scrollTop = $(window).scrollTop();
		containerTop -= scrollTop;
		var containerHtml = 
				'<div class="mobilewindow-halfscreen">'
					// + tooltipsHtml
				+'</div>';
		//整体容器
		var $container = $(containerHtml);
		// 内容容器 （除此之外还有： before容器 ，after容器）
		this.$contentContainer = this.getContentContainer();
		//组件容器
		this.$componentContainer = this.getComponentContainer(config);
		// before容器
		this.$beforeContainer = this.getBeforeContainer(containerTop);
		// after容器
		this.$afterContainer = this.getAfterContainer();
		// 整体容器中 插入before容器
		$container.append(this.$beforeContainer);
		// 组件容器中插入提示信息
		this.$componentContainer.append(tooltipsHtml);
		// 在内容容器中插入组件容器
		this.$contentContainer.append(this.$componentContainer);
		// 整体容器中 插入内容容器
		$container.append(this.$contentContainer);
		// 整体容器中 插入after容器
		$container.append(this.$afterContainer);
		return $container;
	},
	// 获取before容器
	getBeforeContainer:function(containerTop){
		var beforeHtml = '<div class="mobilewindow-halfscreen-before" style="height:'+containerTop+'px;">';
						+'</div>'
		var $beforeContainer = $(beforeHtml);
		return $beforeContainer;
	},
	// 获取after容器
	getAfterContainer:function(){
		var afterHtml = '<div class="mobilewindow-halfscreen-after">';
						+'</div>'
		var $afterContainer = $(afterHtml);
		return $afterContainer;
	},
	// 获取主内容容器
	getContentContainer:function(){
		var containerHtml = '<div class="mobilewindow-halfscreen-content">'
							+'</div>';
		var $container = $(containerHtml);
		return $container;
	},
	getComponentContainer:function(config){
		var containerHtml = '<form class="mobilewindow-halfscreen-container '+config.type+'" ns-id="'+config.id+'" onsubmit="javascript:return false;" action>'
							+'</form>'
		var $container = $(containerHtml);
		return $container;
	}
}
// 设置移动端全屏容器
nsComponent.mobileFullContainer = {
	i18n:{},  //当前语言集
	I18N:{
		zh:{
			confirm:'确认',
			cancel:'取消',
			clear:'清除',
			modify:'修改',
		},
		en:{
			confirm:'confirm',
			cancel:'cancel',
			clear:'clear',
			modify:'modify',
		}
	},
	isInit:false,
	containers:{},
	init:function(config){
		// 设置默认值
		this.setDefault(config);
		// 销毁之前生成的
		this.destroy(config.containerName);
		this.i18n = this.I18N[languagePackage.userLang];
		// 生成当前操作的对象 即 装所有容器相关参数的对象
		this.containers[config.containerName] = {};
	},
	destroy:function(containerName){
		this.isInit = false;
		this.i18n = {};
		if(containerName){
			if(this.containers[containerName]){
				this.containers[containerName].$container.remove();
			}
		}
	},
	setDefault:function(config){
		// 设置全屏模式容器名字，默认component
		config.containerName = typeof(config.containerName)=='string'?config.containerName:'component';
		// 按钮类型 默认common 其它值staticdata  search
		// common表示通用按钮 清除/确定按钮
		// staticdata表示功能模式时全屏框按钮配置
		// search表示radio/checkbox组件全屏弹框时按钮类型
		config.btnsType = typeof(config.btnsType)=='string'?config.btnsType:'common';
	},
	getPageContainer : function(config){
		var $pageContainer = $('body');
		switch(config.containerName){
			case 'more':
				var $container = config.$this.parents('container');
				if($container.length > 0){
					$pageContainer = $container;
				}
				break;
			case 'component':
				var $container = config.$container.parents('container');
				if($container.length > 0){
					$pageContainer = $container;
				}
				break;
		}
		return $pageContainer;
	},
	show:function(config, html, callbackFunc){
		if(this.isInit == false){
			this.init(config);
		}
		var container = this.containers[config.containerName]; // 显示的所有参数的容器
		//初始化整体容器和组件容器 按钮组件
		//container.$container , container.$componentContainer , container.$btnCancel , container.$btnConfirm
		container.$container = this.getContainer(config);
		// 初始按钮
		this.initBtns(config, callbackFunc);
		container.$container.append(container.$btns);
		this.containers[config.containerName].$componentContainer.append(html);
		var $pageContainer = this.getPageContainer(config);
		$pageContainer.append(container.$container);
	},
	hide:function(config){
		var container = this.containers[config.containerName]; // 显示的所有参数的容器
		if(container.$container){
			container.$container.addClass('hide');
		}
	},
	refresh:function(){
	},
	initEvent:function(config, callbackFunc){
		var container = this.containers[config.containerName]; // 显示的所有参数的容器
		var pointType = 'tap';
		if(nsVals.browser.browserSystem == 'pc'){
			pointType = 'click';
		}
		pointType = 'click';
		if(container.$btnClear){
			// 清除
			container.$btnClear.off(pointType);
			container.$btnClear.on(pointType, {config:config,callbackFunc:callbackFunc}, function(ev){
				var config = ev.data.config;
				var callbackFunc = ev.data.callbackFunc;
				callbackFunc(config, false);
				// 根据按钮类型设置是否需要关闭弹框  三个按钮时不用关闭
				switch(config.btnsType){
					case 'common':
						nsComponent.mobileFullContainer.hide(config);
						break;
					case 'staticdata':
					case 'search':
						// 不关闭
						break;
				}
			});
		}
		if(container.$btnConfirm){
			// 确认
			container.$btnConfirm.off(pointType);
			container.$btnConfirm.on(pointType, {config:config,callbackFunc:callbackFunc}, function(ev){
				var config = ev.data.config;
				var callbackFunc = ev.data.callbackFunc;
				callbackFunc(config, true);
				nsComponent.mobileFullContainer.hide(config);
			});
		}
		if(container.$btnModify){
			// 修改
			container.$btnModify.off(pointType);
			container.$btnModify.on(pointType, {config:config,callbackFunc:callbackFunc}, function(ev){
				var config = ev.data.config;
				var callbackFunc = ev.data.callbackFunc;
				callbackFunc(config, 'modify');
			});
		}
		if(container.$btnCancel){
			// 取消
			container.$btnCancel.off(pointType);
			container.$btnCancel.on(pointType, {config:config,callbackFunc:callbackFunc}, function(ev){
				var config = ev.data.config;
				var callbackFunc = ev.data.callbackFunc;
				callbackFunc(config, 'cancel');
				nsComponent.mobileFullContainer.hide(config);
			});
		}
	},
	// 初始化按钮
	initBtns:function(config, callbackFunc){
		var container = this.containers[config.containerName]; // 显示的所有参数的容器
		var i18n = this.i18n;
		var btnNameArr = $.isArray(config.btnNameArr)?config.btnNameArr:[i18n.cancel,i18n.confirm];
		// 根据按钮类型显示按钮
		switch(config.btnsType){
			case 'common':
				btnNameArr = [i18n.clear,i18n.confirm];
				break;
			case 'staticdata':
				// btnNameArr = [i18n.cancel,i18n.clear,i18n.modify];
				btnNameArr = [i18n.cancel];
				break;
			case 'search':
				btnNameArr = [i18n.cancel,i18n.clear,i18n.confirm];
				break;
		}
		var $btns = $(nsComponent.getMobileBtns({
				isHide:false,
				nameArr:btnNameArr
			}));
		container.$btns = $btns;
		// 根据类型命名按钮
		switch(config.btnsType){
			case 'common':
				/*只有两个按钮时表示只有清除和确认按钮*/
				//清除按钮
				container.$btnClear = $btns.children().eq(0);
				//确认按钮
				container.$btnConfirm = $btns.children().eq(1);
				break;
			case 'staticdata':
				/*有三个按钮时表示取消/清除/修改按钮*/
				//取消按钮
				container.$btnCancel = $btns.children().eq(0);
				//清除按钮
				// container.$btnClear = $btns.children().eq(1);
				//修改按钮
				// container.$btnModify = $btns.children().eq(2);
				break;
			case 'search':
				/*有三个按钮时表示取消/清除/确认按钮*/
				//取消按钮
				container.$btnCancel = $btns.children().eq(0);
				//清除按钮
				container.$btnClear = $btns.children().eq(1);
				//修改按钮
				container.$btnConfirm = $btns.children().eq(2);
				break;
		}
		// 初始化按钮方法
		this.initEvent(config, callbackFunc);
	},
	// 获得容器
	getContainer:function(config){
		var container = this.containers[config.containerName]; // 显示的所有参数的容器
		//是否有提示标题
		var tooltipsHtml = '';
		if(config.tooltips){
			tooltipsHtml = '<span class="form-tooltips">'+config.tooltips+'</span>';
		}
		var containerHtml = 
				'<div class="mobilewindow-fullscreen" name="'+config.containerName+'">'
					+ tooltipsHtml
				+'</div>';
		//整体容器
		var $container = $(containerHtml);
		//组件容器
		container.$componentContainer = this.getComponentContainer(config);
		$container.append(container.$componentContainer);
		return $container;
	},
	getComponentContainer:function(config){
		var containerHtml = '<form class="mobilewindow-fullscreen-container '+config.type+' " ns-id="'+config.id+'" onsubmit="javascript:return false;" action></form>'
		var $container = $(containerHtml);
		return $container;
	}
}
// text textarea
/*
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 text 必填
 * placeholder : input提示信息 // 表单根据rules生成 通过：nsComponent.getPlaceHolder(config)  // 此位置已经设置
 * isInputMask : 执行inputMask组件 值为true时，format必填
 * isOnKeydown : 是否设置快捷键切换焦点
 * isUseHtmlInput : 是否支持快捷键插入html代码
 * readonly : 只读
 * rules : 规则 都支持
 */
nsUI.textInput = {
	ver:'10.12', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			isInputMask:false, // 执行inputMask组件 值为true时，format必填
			isOnKeydown:false, // 是否设置快捷键切换焦点
			isUseHtmlInput:false, // 是否支持快捷键插入html代码
			readonly:false, // 只读
		}
		nsVals.setDefaultValues(_config, defaultConfig);
		// 根据isOnKeydown（是否设置快捷键）设置isSetBlur isSetFocus
		if(_config.isOnKeydown){
			_config.isSetBlur = typeof(_config.isSetBlur)=='boolean'?_config.isSetBlur:true;
			_config.isSetFocus = typeof(_config.isSetFocus)=='boolean'?_config.isSetFocus:true;
		}
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(_config){
		// var i18n = this.i18n[languagePackage.userLang];
		var _this = this;
		_this.setDefault(_config);  // 设置config的默认配置
		var cls = 'form-control';
		// 判断显示类型
		if(typeof(_config.formatType)=='string'){
			switch(_config.formatType){
				case 'string':
				case 'number':
				case 'date':
				case 'money':
					cls += ' '+_config.formatType;
					break;
				default:
					if(debugerMode){
						console.warn(_config.formatType+language.common.nscomponent.part.formatType);
					}
					break;
			}
		}
		if(_config.type == "number"){
			_config.rules = 'number ' + _config.rules;
		}
		_config.cls = cls;
	},
	// 获取文本值的html代码
	getContentHtml:function(_config){
		var content = _config.value;
		var html = '';
		if((typeof(content)!='string' && typeof(content)!='number')||content==''){
			return html;
		}
		var tagConfig = {
			type:'acts',
			text:content,
			acts:_config.acts,
			config : _config
		}
		if(_config.seat){
			tagConfig.seat = _config.seat;
		}
		if(_config.isShowText){
			tagConfig.isShowText = _config.isShowText;
		}
		if(_config.iconsName){
			tagConfig.iconsName = _config.iconsName;
		}
		html = nsComponent.getTagHtml(tagConfig);
		return html;
	},
	getHtml:function(_config){
		html = '';
		switch(_config.formSource){
			case 'staticData': 		// 功能
				html = nsUI.textInput.getContentHtml(_config);
				break;
			case 'halfScreen':  	// 半屏
			case 'fullScreen':  	// 全屏
			case 'inlineScreen':   	// 行内
				this.setConfig(_config);
				if(_config.type == 'textarea'){
					var heightStr = '';
					if (typeof(_config.height) == 'string') {
						if (_config.height.indexOf('px') > -1) {
							heightStr = 'style="height: ' + _config.height + ';"';
						} else {
							heightStr = 'style="height: ' + _config.height + 'px;"';
						}
					} else if (typeof(_config.height) == 'number') {
						heightStr = 'style="height: ' + _config.height + 'px;"';
					}
					html = '<textarea class="form-control" ' 
						+ nsComponent.getDefalutAttr(_config) 
						+ ' name="' + _config.fullID + '"' 
						+ ' id="' + _config.fullID + '"' 
						+ ' placeholder="' + _config.placeholder + '"' 
						+ heightStr 
						+ ' >'
						+ nsComponent.getValue(_config,false)
						+ '</textarea>';
				}else{
					html = '<input class="'+_config.cls+'" '
						+nsComponent.getDefalutAttr(_config)
						+' name="'+_config.fullID +'"'
						+' id="'+_config.fullID+'"'
						+' placeholder="'+_config.placeholder+'"'
						+' type="text"'
						+' value="'+nsComponent.getValue(_config)+'">';
				}
				break;
			default: 				// pc
				this.setConfig(_config);
				if(_config.type == 'textarea'){
					var heightStr = '';
					if (typeof(_config.height) == 'string') {
						if (_config.height.indexOf('px') > -1) {
							heightStr = 'style="height: ' + _config.height + ';"';
						} else {
							heightStr = 'style="height: ' + _config.height + 'px;"';
						}
					} else if (typeof(_config.height) == 'number') {
						heightStr = 'style="height: ' + _config.height + 'px;"';
					}
					html = '<textarea class="form-control" ' 
						+ nsComponent.getDefalutAttr(_config) 
						+ ' name="' + _config.fullID + '"' 
						+ ' id="' + _config.fullID + '"' 
						+ ' placeholder="' + _config.placeholder + '"' 
						+ heightStr 
						+ ' >'
						+ nsComponent.getValue(_config,false)
						+ '</textarea>';
				}else{
					html = '<input class="'+_config.cls+'" '
						+nsComponent.getDefalutAttr(_config)
						+' name="'+_config.fullID +'"'
						+' id="'+_config.fullID+'"'
						+' placeholder="'+_config.placeholder+'"'
						+' type="' + _config.type + '"'
						+' value="'+nsComponent.getValue(_config)+'">';
				}
				break;
		}
		return html;
	},
	//初始化
	init:function(config,formJson){
		switch(config.formSource){
			case 'halfScreen':  // 半屏
			case 'fullScreen':  // 全屏
			case 'inlineScreen':  	// 行内
			case 'staticData':    // 功能
				// 移动端记录jQuery对象
				var $label = $('label[for="'+config.fullID+'"]');
				config.$label = $label;
				config.$formGroup = config.$label.parent(); // label对象的父对象
				config.$container = config.$label.closest('.form-td');
				config.$formItem = config.$formGroup.children('.form-item');
				config.$input = config.$formItem.children('input');
				if(config.$input.length == 0){
					config.$input = config.$formItem.children('textarea');
				}
				nsUI.textInput.initMobile(config);
				break;
			default:
				// pc端初始化
				var $dom = $('[name="'+config.fullID+'"]');
				nsComponent.init.setCommonAttr($dom,config);
				nsUI.textInput.initPc(config,formJson);
				break;
		}
	},
	// 初始化pc模式
	initPc:function(config,formJson){
		var $input = $('#'+config.fullID);
		config.$input = $input;

		// $input.on('keyup keydown',function(event){
		// 	event.stopPropagation();
		// });

		//执行inputMask组件 默认不支持
		if(config.isInputMask){
			var formatStr = config.format.toUpperCase();
			//格式化数据的字符串
			var maskString = formatStr.replace(/[A-Z]/g,'9');
			$input.inputmask(maskString);
		}
		// 切换焦点
		if(typeof(formJson)=='object' && typeof(config.enterFocusField)=='string'){
			// 表单
			config.switchFocus = nsComponent.getFieldFocusMethod(formJson.id,config.enterFocusField);
		}
		// 是否支持快捷键 下一个获得焦点 默认不支持
		if(config.isOnKeydown){
			this.setSwitchShortcutKey(config,formJson);
		}
		//判断是否支持快捷键插入html 默认不支持
		if(config.isUseHtmlInput){
			//支持快捷键插入html
			nsUI.htmlInput.init(config, 'form');
		}
		if(typeof(config.changeHandler)=='function'){
			var eventStr = 'change';
			if(config.onKeyChange){
				//onKeyChange:true的情况下，则按键按下就触发change时间
				eventStr = 'change keyup'
			}
			$input.on(eventStr, function(ev){
				config.changeHandler($(this).val(),$(this),ev);
			});	
		}
		//模拟一个公用的事件回调
		if(typeof(config.commonChangeHandler)=='function'){
			var eventStr = 'change';
			if(config.onKeyChange){
				//onKeyChange:true的情况下，则按键按下就触发change时间
				eventStr = 'change keyup'
			}
			$input.on(eventStr, function(ev){
				var $this = $(this);
				var obj = {
					value:$.trim($this.val()),
					dom:$this,
					type:'text',
					id:config.id,
					config:config
				}
				config.commonChangeHandler(obj);
			});	
		}
		//失去焦点
		if(config.isSetBlur){
			this.setBlur(config);
		}
		// 设置焦点
		if(config.isSetFocus){
			this.setFocus(config);
		}
		// 失去焦点
		config.blur = function(){
			config.$input.blur();
		}
		// 获得焦点
		config.focus = function(){
			config.$input.focus();
		}
	},
	// 初始化移动端
	initMobile:function(config){
		// formSource 表单类型标识
		var formSource = config.formSource;
		// 半屏模式添加选中标记
		if(formSource == 'halfScreen'){
			// 判断是否存在默认值 存在选中 添加显示样式
			if(config.$formItem.children().length>0){
				config.$formGroup.addClass('checked');
			}
		}
		// 功能模式 如果没有value值 隐藏该项配置标签
		if(formSource == 'staticData'){
			// 判断是否存在默认值 不存在选中 隐藏
			if(config.$formItem.children().length == 0){
				config.$formGroup.addClass('hidden');
			}
		}
		// 只读模式不用初始化方法
		if(config.readonly==true){
			return;
		}
		if(config.formSource == 'inlineScreen'||config.formSource == 'fullScreen'){
			// 行内模式 添加chang事件用于修改config.value
			var $input = config.$input;
			if($input.length == 1){
				if(!$.isArray(nsComponent.allEditInput[config.formID])){
					nsComponent.allEditInput[config.formID] = [];
				}
				for(var i=0; i<nsComponent.allEditInput[config.formID].length; i++){
					if(config.id == nsComponent.allEditInput[config.formID][i].id){
						nsComponent.allEditInput[config.formID][i].del = true;
					}
				}
				nsComponent.allEditInput[config.formID].push({
					id : config.id,
					$input : $input,
					del : false,
				});
			}
			$input.off('change');
			$input.on('change', { config:config }, function(ev){
				var $this = $(this);
				var _config = ev.data.config;
				var val = nsUI.textInput.getValueMobile(_config, false);
				var sourceVal = _config.value;
				_config.value = val;
				if(_config.value != sourceVal){
					if(typeof(_config.changeHandler)=='function'){
						_config.changeHandler(val, _config);
					}
					if(typeof(_config.commonChangeHandler)=='function'){
						var obj = {
							value:$.trim(val),
							dom:_config.$formItem,
							type:'text',
							id:config.id,
							config:config
						}
						_config.commonChangeHandler(obj);
					}
				}
			});
			$input.off('focus');
			$input.on('focus', function(ev){
				config.sourceValue = config.value;
			});
			$input.off('blur');
			$input.on('blur', function(ev){
				nsUI.textInput.getValue(config);
			});
			if(config.type == 'textarea'){
				$input.off('keyup');
				$input.on('keyup', function(ev){
					this.style.height = 'auto';
					this.scrollTop = 0; //防抖动
					this.style.height = this.scrollHeight + 'px';
				});
			}else{
				$input.off('keyup');
				$input.on('keyup', function(ev){
					switch(ev.keyCode){
						case 13:
							var index = -1;
							var _arr = nsComponent.allEditInput[config.formID];
							var arr = [];
							for(var i=0; i<_arr.length; i++){
								if(!_arr[i].del){
									arr.push(_arr[i]);
								}
							}
							for(var i=0; i<arr.length; i++){
								if(arr[i].id == config.id){
									index = i;
									break;
								}
							}
							index ++;
							if(index == arr.length){
								index --;
							}
							arr[index].$input.focus();
							break;
					}
				});
			}
			if(config.formSource == 'inlineScreen'){
				// 行内模式添加删除事件
				if(config.$formGroup.children('.form-btn').length>0){
					var $button = config.$formGroup.children('.form-btn').children();
					$button.off('click');
					$button.on('click', {config:config}, function(ev){
						var $focus = $(':focus');
						var $this = $(this)
						if(!$focus.is($this)){
							return;
						}
						var config = ev.data.config;
						config.showState = 'more'; // 改变字段显示位置
						$(this).closest('.form-td[mindjetfieldposition="field-more"]').remove();
						for(var i=0; i<nsComponent.allEditInput[config.formID].length; i++){
							if(config.id == nsComponent.allEditInput[config.formID][i].id){
								nsComponent.allEditInput[config.formID][i].del = true;
							}
						}
					});
				}
			}
		}
	},
	textBtn:function(config){
		var $input = $('#'+config.fullID);
		var $inputBtn = $input.closest('div').find('button');
		$inputBtn.off('click');
		$inputBtn.on('click',function(ev){
			var fID = Number($(ev.target).closest('button').attr('fid'));
			if(typeof(fID) == 'number'){
				var btnArr = config.btns;
				if(typeof(btnArr[fID].handler) == 'function'){
					var btnFunc = btnArr[fID].handler;
					var returnObj = {
						value:$('#'+config.fullID).val(),
						dom:$(this)
					}
					btnFunc(returnObj);
				}
			}else{
				
			}
		});
		//输入助手按钮 2018.2.22by张青
		if($.isArray(config.assistant)){
			nsComponent.init.assistantBtnInit(config);
		}
	},
	//设置焦点
	setFocus:function(_config){
		// config.$input.focus();
	},
	// 设置失去焦点
	setBlur:function(_config){
		var _this = this;
		_config.$input.off('blur',  _this.setBlurHandler);
		_config.$input.on('blur', {_config:_config,_this:_this}, _this.setBlurHandler);
	},
	// 设置失去焦点的方法
	setBlurHandler:function(event){
		var _config = event.data._config;
		var _this = event.data._this;
		_this.getValue(_config);
	},
	// 设置切换表单快捷键
	setSwitchShortcutKey:function(_config){
		var _this = this;
		_config.$input.off('keydown', _this.switchShortcutKeyHandler);
		_config.$input.on('keydown', {_config:_config}, _this.switchShortcutKeyHandler);
	},
	// 切换表单方法
	switchShortcutKeyHandler:function(event){
		var _config = event.data._config; // 当前字段配置
		var allFieldConfigObj = nsForm.data[formJson.id].formInput; // 当前表单中所有字段配置
		if(event.keyCode == 13){
			if(typeof(_config.switchFocus)=='function'){
				// 存在切换方法
				_config.switchFocus();
			}else{
				_config.blur();
			}
			// 如果有失去焦点配置方法 执行 失去焦点方法
			if(typeof(_config.blurHandler)=='function'){
				_config.blurHandler(formJson);
			}
		}
	},
	// 验证数据
	validate:function(_config, inputValueStr){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			var rulesArr = _config.rules.split(' '); // rules之间以‘ ’分开 ，生成数组逐个验证
			for(var i=0;i<rulesArr.length;i++){
				var errorKey = rulesArr[i];
				var formatRules = nsComponent.getFormatRules(errorKey); // 格式化 rules 值
				errorKey = formatRules.ruleName; // 规则名称
				if(errorKey === 'remote'){
					if(typeof(inputValueStr)=="string"&&inputValueStr.length>0){
						// 排重
						var isSendAjax = true;
						if(_config.sourceValue == inputValueStr){
							isSendAjax = false;
						}
						if(isSendAjax){
							var ajaxData = {};
							ajaxData[_config.id] = inputValueStr;
							ajaxData = JSON.stringify(ajaxData);
							var ajaxConfig = {
								url : _config.remoteAjax,
								type : 'POST',
								data : ajaxData,
								contentType : 'application/json',
								plusData : {
									config : _config,
								},
							}
							NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
								if(res.success){
									var data = res.data;
									if(data.validateResult){
										// var obj = {
										// 	stateType:'warning',
										// 	$container:config.$input.parent(),
										// 	$input:config.$input,
										// }
										// nsComponent.removeState(obj);
										return; 
									}
									var plusData = _ajaxConfig.plusData;
									var config = plusData.config;
									var errorConfig = {
										alertStr:config.label+i18n.getValueError,
										popStr:data.validateMsg,
										stateType:'warning',
										$container:config.$input.parent(),
										$input:config.$input,
									}
									// 显示组件（验证未通过等）状态，输出提示信息
									nsComponent.showState(errorConfig);
								}
							})
						}
						
					}
				}else{
					var errorVal = formatRules.compareArr; // 若有 = 等号后边值
					var isLegal = nsComponent.getIsValidate(inputValueStr,rulesArr[i],_config.formID); // 是否合法
					if(!isLegal){
						var errorInfo = validateMsg[errorKey];
						var errorInfoStr = '';
						if(typeof(errorInfo)=='function'){
							// $.validator.format(***) 格式
							errorInfoStr = errorInfo(errorVal);
						}else{
							errorInfoStr = errorInfo;
						}
						var errorConfig = {
							alertStr:_config.label+i18n.getValueError,
							popStr:errorInfoStr,
							stateType:'warning',
							$container:_config.$input.parent(),
							$input:_config.$input,
						}
						// 显示组件（验证未通过等）状态，输出提示信息
						nsComponent.showState(errorConfig);
						return false;
					}
				}
			}
			// var obj = {
			// 	stateType:'warning',
			// 	$container:_config.$input.parent(),
			// 	$input:_config.$input,
			// }
			// nsComponent.removeState(obj);
		}
		return true;
	},
	getValueMobile:function(_config, isValid){
		var inputValueStr = '';
		inputValueStr = $.trim(_config.$input.val());
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config,inputValueStr);
		if(isTrue){
			return inputValueStr;
		}else{
			return false;
		}
	},
	//获取值
	getValue:function(_config, isValid){
		var inputValueStr = '';
		if( _config.formSource == 'halfScreen' ||  // 半屏
			_config.formSource == 'fullScreen' ||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    // 功能
		){
			inputValueStr = _config.value;
		}else{
			inputValueStr = $.trim(_config.$input.val());
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config,inputValueStr);
		if(isTrue){
			return inputValueStr;
		}else{
			return false;
		}
	},
	// 赋值
	setValue:function(_config,value){
		if( _config.formSource == 'halfScreen' 		||  // 半屏
			_config.formSource == 'fullScreen' 		||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    	// 功能
		){
			_config.value = value;
			nsForm.edit([_config],_config.formID);
		}else{
			_config.$input.val(value);
		}
	},
}
// radio
/*
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 radio 必填
 * placeholder : input提示信息 // 表单根据rules生成 通过：nsComponent.getPlaceHolder(config)  // 此位置已经设置
 * isOnKeydown : 是否设置快捷键切换焦点
 * readonly : 只读
 * rules : 规则 radio 在表单中配置也可以是required 到此位置转化成了radio
 * textField : subdata显示值 // 表单默认：text
 * valueField : subdata获取值 // 表单默认：value
 * subdata : array 数组中对象属性 ‘textField’ ‘valueField’ isChecked:是否选中 isDisabled:只读 isInput:
 * 没有subdata有url即ajax发送返回值生成选项
 * url : 地址
 * dataSrc : 数据源
 * method : ajax方式
 * isObjectValue : true/false value的类型 默认ids即false 用于返回值时获得什么类型 如果与value有冲突时删除value值
 */
nsUI.radioInput = {
	ver:'1.1.0', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			isOnKeydown:false,
			isHasClose:false,
			readonly:false,
			textField:'text',
			valueField:'value',
			isObjectValue:false,
			value:'',
			// isOper:true, // 是否允许操作 功能模式
			searchName:'',
			searchMode:'none',
			ajaxLoading:false,
			subdata : [],
			clearValue : false,
		}
		nsVals.setDefaultValues(_config, defaultConfig);
		if(_config.disabled){
			_config.readonly = _config.disabled;
		}
		if(_config.formSource == "halfScreen"){
			// 半屏模式不可以搜索
			_config.searchMode = 'none';
		}
	},
	// 验证config 验证在设置完config之后
	validConfig:function(_config, formJson){
		// 只有移动端可以存在搜索框isHaveSearch==true
		var formSource = _config.formSource;
		if(formSource!='halfScreen'&&formSource!='fullScreen'&&formSource!='inlineScreen'&&formSource!='staticData'){
			if(_config.searchMode!='none'){
				console.error('只有移动端可以存在搜索框_config.searchMode=none');
				console.error(_config);
				return false;
			}
		}
		// 验证 如果组件不是ajax请求列表不能设置搜索
		if(typeof(_config.url)=='undefined' && _config.searchMode!='none' && _config.isHaveUrl !== true){
			console.error('只有ajax调用情况下才可以设置搜索功能');
			console.error(_config);
			return false;
		}
		// 配置的value值是否与isObjectValue规定要配置的值一致
		if(_config.value!=''){
			if( (_config.isObjectValue==true && typeof(_config.value)!='object')||
				(_config.isObjectValue==false && typeof(_config.value)=='object')
			){
				console.error('配置的value值与isObjectValue规定要配置的值不一致');
				console.error(_config);
				return false;
			}
		}
		/*****textFieldId 对应的字段配置******/
		if(_config.textFieldId){
			// 表单所有字段配置
			var configJson = formJson.component;
			var contentFieldConfig = configJson[_config.textFieldId];
			if(typeof(contentFieldConfig)!='object'){
				console.error('显示字段配置错误textFieldId：'+contentId);
				console.error(_config);
				console.error(configJson);
				return false;
			}
			_config.contentFieldConfig = contentFieldConfig;
		}
		/*******判断参数是否配置正确******/
		// if(!_config.isObjectValue){
		// 	if(_config.searchMode!='none' && typeof(_config.textFieldId)!='string'){
		// 		console.error('字段配置错误，无法正确显示值');
		// 		console.error(_config);
		// 		return false;
		// 	}
		// }
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(_config, formJson){
		this.setDefault(_config); // 设置config的默认值
		var configUrl = _config.url;
		if(typeof(configUrl)=='function'){
			configUrl = _config.url();	//如果url链接是个function
		}
		_config.configUrl = configUrl;
		// 判断是否有搜索框
		switch(_config.searchMode){
			case 'client':
			case 'server':
				// 设置默认搜索参数
				if(!_config.isInit){
					var isHaveSearchKey = false;
					_config.ajaxConfig = typeof(_config.ajaxConfig)=='object'?_config.ajaxConfig:{};
					_config.ajaxConfig.data = typeof(_config.ajaxConfig.data)=='object'?_config.ajaxConfig.data:{};
					for(var key in _config.ajaxConfig.data){
						if(_config.ajaxConfig.data[key]=='{search}'){
							isHaveSearchKey = true;
						}
					}
					if(!isHaveSearchKey){
						_config.ajaxConfig.data.keyword = '{search}';
					}
				}
				// 搜索框代码
				_config.searchBeforeHtml = '<div class="mobile-input-search-control">'
												+ '<i class="fa-search"></i>'
												+ '<span>'+_config.searchName+'</span>'
											+ '</div>'
				_config.searchAfterHtml = '<div class="input-group">'
												+ '<span class="input-group-addon">'
													+ '<i class="fa-search"></i>'
												+ '</span>'
												+ '<input class="form-control" placeholder="'+_config.searchName+'" type="search">'
												+ '<div class="input-group-btn hidden" id="clearInput">'
													+ '<button class="btn btn-icon">'
														+ '<i class="fa-times-circle"></i>'
													+ '</button>'
												+ '</div>'
											+ '</div>'
											+ '<div class="btn-group">'
												+ '<button class="btn btn-icon">'
													+ '<i class=""></i>'
													+ '取消'
												+ '</button>'
											+ '</div>'
				break;
		}
		if(_config.configUrl){
			// ajax调用时配置当前表单所有字段的配置 原因：为了格式化data中有关联参数的情况
			// _config.components = formJson.component;
		}
		// 判断value值是否需要转化
		if(typeof(_config.value)=='object'){
			if($.isEmptyObject(_config.value)){

			}
			if(!$.isArray(_config.value)){
				_config.value = [_config.value];
			}
		}
		// isSendAjax 是否需要发送ajax请求
		if(typeof(_config.url)=='undefined'){
			_config.isSendAjax = false;
			_config.ajaxLoading = false;
			_config.isNeedAjax = false;// 是否需要ajax
		}else{
			_config.isNeedAjax = true;// 是否需要ajax
			if(!_config.isObjectValue){
				if(typeof(_config.textFieldId)!='string'){
					_config.isSendAjax = true;
					_config.ajaxLoading = true;
				}else{
					_config.isSendAjax = false;
					_config.ajaxLoading = false;
				}
			}else{
				_config.isSendAjax = false;
				_config.ajaxLoading = false;
			}
		}
        // 格式化outputFields
        if(typeof(_config.outputFields) == "string" && _config.outputFields.length > 0){
            _config.outputFields = JSON.parse(_config.outputFields);
        }
	},
	// 获取value对应的list值 用于保存isObjectValue=true的情况
	getValueList:function(_config, valueId){
		var valueList = [];
		for(var i=0;i<_config.subdata.length;i++){
			if(_config.subdata[i][_config.valueField]==valueId){
				valueList.push(_config.subdata[i]);
				break;
			}
		}
		if(valueList.length==0){
			valueList = '';
		}
		return valueList;
	},
	// 获取文本值
	getContent:function(_config, value){
		/*
		 * _config 	: object 	组件配置
		 * value 	: string 	当前value值
		 *
		 * typeof(value)=="object" 		表示 通过给定的value返回text值
		 * typeof(value)!="undefined" 	表示 通过给定的value查询text值
		 * typeof(value)=="undefined" 	表示根据 _config.value 获取text值
		 */
		var text = '';
		if(_config.clearValue){
			return text;
		}
		if(typeof(value)=="object"){
			if($.isArray(value)){
				for(var valI=0;valI<value.length;valI++){
					text += value[valI][_config.textField] + ',';
				}
				text = text.substring(0,text.length-1);
			}else{
				text = value[_config.textField];
			}
			return text;
		}
		if(typeof(value)=="undefined"){
			value = _config.value;
			if(typeof(value)=="undefined"||value===""){
				// 是否存在选中值
				var isHaveVal = false;
				for(var i=0;i<_config.subdata.length;i++){
					if(_config.subdata[i][_config.valueField] === value && value === ''){
						isHaveVal = true;
						break;
					}
				}
				if(!isHaveVal){
					for(var i=0;i<_config.subdata.length;i++){
						if(_config.subdata[i].isChecked || _config.subdata[i].selected){
							value = _config.subdata[i][_config.valueField];
							break;
						}
					}
				}
			}
			_config.value = value;
		}
		// value是对象时表示value中包含了value和text 直接返回text值 不需要查询
		if(typeof(value)=='object'){
			return value[_config.textField];
		}
		// 查询选中值text
		for(var i=0;i<_config.subdata.length;i++){
			if(_config.subdata[i][_config.valueField]==value){
				text = _config.subdata[i][_config.textField];
				break;
			}
		}
		if(typeof(text)=='undefined'){
			nsAlert('设置的value不存在','error');
		}
		return text;
	},
	// 获取文本值的html代码
	getContentHtml:function(_config, content){
		// var content = this.getContent(_config);
		// 判断是否设置content 不需要经过subdata获得content
		// 行内模式有搜索框时content是给出的 不经过subdata 因为content是通过隐藏字段的value值获得的
		content = typeof(content)=='undefined'?this.getContent(_config):content;
		var html = '';
		if(content){
			switch(_config.formSource){
				case 'halfScreen':  	// 半屏
				case 'fullScreen':  	// 全屏
				case 'inlineScreen':   	// 行内
					var tagConfig = {
						type:'show',
						text:content,
						config : _config
					}
					html = nsComponent.getTagHtml(tagConfig);
					break;
				case 'staticData': 		// 功能
					var tagConfig = {
						type:'acts',
						text:content,
						acts:_config.acts,
						config : _config
					}
					if(_config.seat){
						tagConfig.seat = _config.seat;
					}
					if(_config.isShowText){
						tagConfig.isShowText = _config.isShowText;
					}
					if(_config.iconsName){
						tagConfig.iconsName = _config.iconsName;
					}
					html = nsComponent.getTagHtml(tagConfig);
					break;
				default: 				// pc
					break;
			}
		}
		return html;
	},
	// subdata生成的html
	getOptionsHtml:function(_config){
		var html = '';
		var valueStr = this.getShowValue(_config);
		for(var radioI = 0; radioI<_config.subdata.length; radioI++){
			var text = _config.subdata[radioI][_config.textField];
			var value = _config.subdata[radioI][_config.valueField];
			// textField/valueField不存在不显示
			if(typeof(text)=="undefined" || typeof(value)=="undefined"){
				console.error('选项配置错误---'+radioI);
				console.error(_config.subdata[radioI]);
				console.error(_config);
				continue;
			}
			var isInput = _config.subdata[radioI].isInput ? 'daterange' : 'radio';

			var checkedAttr = value == valueStr ? 'checked' : '';
			var disabledAttr = _config.subdata[radioI].isDisabled ? 'disabled':'';
			if(_config.readonly == true){
				disabledAttr = 'disabled';
			}
			var msgStr = _config.subdata[radioI].msg ? 'data-toggle="tooltip" title="'+_config.subdata[radioI].msg+'"':'';	
			html += 
				'<label class="radio-inline '+disabledAttr+' '+checkedAttr+'" for="'+ _config.fullID + '-' + radioI +'" '+msgStr+'>'
					+text
				+'</label>'
				+'<input id="'+ _config.fullID +'-'+radioI+'"'
					+'name="'+_config.fullID+'"'
					+' ns-id="'+_config.id+'"'
					+' ns-operator="'+isInput+'"'
					+' nstype="'+_config.type+'" type="radio" '
					+checkedAttr+' '+disabledAttr+' class= "radio-options '+checkedAttr+'" '
					+' value="'+value+'" >'
		}
		//是否开启清空操作
		if(_config.isHasClose){
			var isDisabledStr = '';
			if(_config.readonly == true){
				isDisabledStr = 'disabled';
			}
			html += 
				'<label class="radio-clear '+isDisabledStr+'" for="'+ _config.fullID + '-' + _config.subdata.length +'">'
					+'清空'
				+'</label>'
				+'<input id="'+ _config.fullID + '-' + _config.subdata.length+'"'
					+'name="'+_config.fullID+'"'
					+' ns-id="'+_config.id+'"'
					+' ns-operator="radio"'
					+' nstype="'+_config.type+'" type="radio" '
					+' value="" '+isDisabledStr+' class="radio-options">';
		}
		return html;
	},
	// 移动端获取选择列表
	getMobileListHtml:function(_config){
		var html = this.getOptionsHtml(_config);
		// 移动端 全屏模式下将所有列表包装在一个整体的div中
		var formSource = _config.formSource;
		var listClass = _config.type+'-list';
		if(_config.searchMode=='client'||_config.searchMode=='server'){
			listClass += ' list-search';
		}
		html =  '<div class="'+listClass+'" name="'+ _config.fullID +'-list">'
					+ html
				+ '</div>';
		// 如果组件是全屏模式并且isHaveSearch（是否允许异步搜索）是true
		// 设置搜索框
		if(_config.searchMode != 'none'){
			html = '<div class="mobile-input-search" name="'+ _config.fullID +'-search">'
						+ _config.searchBeforeHtml
					+ '</div>'
					+ html;
		}
		return html;
	},
	// 获得字段html
	getHtml:function(_config, formJson){
		// 获取html
		// pc ：html是选择列表
		// modile : html是回显的text标签 
		// 移动端/pc判断通过formSource属性识别 （halfScreen/fullScreen/inlineScreen/staticData指移动端，其它表示pc端）
		// configUrl ：指通过发送ajax请求返回的数据生成代码
		this.setConfig(_config, formJson);
		var isTrue = this.validConfig(_config, formJson); // 验证config配置是否
		if(isTrue == false){
			return '';
		}
		var html = '';
		if(_config.configUrl){
			// 如果存在url链接
			// 判断是否发送ajax请求
			if(_config.isSendAjax==false){
				var content = '';
				// 判断当前 组件是否设置内容值 若没有通过textFieldId对应的组件获得
				var value = _config.value;
				if(_config.isObjectValue){
					if(typeof(value)=='object'){
						var valObj = value[0];
						content = valObj[_config.textField];
						if(typeof(content)=='undefined'){
							console.error('属性textField配置错误');
							console.error(_config.textField);
							console.error(_config);
						}
					}else{
						content = '';
					}
				}else{
					content = _config.contentFieldConfig.value;
					content = typeof(content) == 'undefined'?'':content;
				}
				html = this.getContentHtml(_config, content);
				return html;
			}else{
				html = nsComponent.getLoadingHtml();
				html = '<div id="'+_config.fullID+'-loading">'+html+'</div>';
				nsComponent.getAjaxSubdata(_config, formJson.component, function(resConfig, isSuccess, errorInfo){
					if(isSuccess){
						// 成功后 补全html元素 初始化方法 
						switch(resConfig.formSource){
							case 'halfScreen':
							case 'fullScreen':
							case 'inlineScreen':
							case 'staticData':
								$('#'+resConfig.fullID+'-loading').parent().html(nsUI.radioInput.getContentHtml(resConfig));//填充元素
								break;
							default:
								$('#'+resConfig.fullID+'-loading').parent().html(nsUI.radioInput.getOptionsHtml(resConfig)); 	//填充元素										 			//触发事件
								break;
						}
						nsUI.radioInput.init(resConfig); //触发事件
					}else{
						// 移除正在加载 旋转圈
						$('#'+resConfig.fullID+'-loading').remove();
						resConfig.subdata = [];
						nsUI.radioInput.init(resConfig); //触发事件
					}
				});
			}
			
		}else{
			//不存在的情况直接赋值读取数据
			if($.isArray(_config.subdata)){
				switch(_config.formSource){
					case 'halfScreen':  	// 半屏
					case 'fullScreen':  	// 全屏
					case 'inlineScreen':   	// 行内
					case 'staticData': 		// 功能
						html = nsUI.radioInput.getContentHtml(_config);
						break;
					default: 				// pc
						html = nsUI.radioInput.getOptionsHtml(_config);
						break;
				}
			}
		}
		return html;
	},
	// 初始化pc模式
	initPc:function(config,formJson){
		var $input = $('[name="'+config.fullID+'"]');
		config.$input = $input;
		
		if(config.readonly == false){
			var $labelInput = $input.parent().find('[ns-operator="daterange"]');
			var $label = $labelInput.prev();
			var $div = $label.parent();
			var labelID = config.fullID + '-isInput-daterange';
			$input.off('change');
			$input.on('change',{config:config},function(ev){
				var $this = $(this);
				var config = ev.data.config;
				var $input = config.$input;
				var $checkedRadio = $input.filter(':checked');
				// if($checkedRadio.length==0){
				// 	for(var i=0;i<$input.length;i++){
				// 		if($input.eq(i).is(':checked')){
				// 			$checkedRadio = $input.eq(i);
				// 		}
				// 	}
				// }
				var value = $checkedRadio.val();
				var operatorType = $this.attr('ns-operator');
				if(operatorType == 'radio'){
					if($('#'+labelID).length > 0){
						$('#'+labelID).remove();
					}
					$input.parent().children('label').removeClass('checked')
					$checkedRadio.prev().addClass('checked');
				}
				$this.parent().children('label.has-error').remove();
				// var config = nsForm.getConfigByDom($this);
				if(typeof(config.changeHandler)=='function'){
					config.changeHandler(value,$this);
				}
				//模拟一个公用的事件回调
				if(typeof(config.commonChangeHandler)=='function'){
					var obj = {
						value:value,
						dom:$this,
						type:'radio',
						id:config.id,
						config:config
					}
					config.commonChangeHandler(obj);
				}
			})
			// 切换焦点
			if(typeof(config.enterFocusField)=='string'){
				// 表单
				config.switchFocus = nsComponent.getFieldFocusMethod(config.formID,config.enterFocusField);
			}
			// 是否支持快捷键 下一个获得焦点 默认不支持
			if(config.isOnKeydown){
				this.setSwitchShortcutKey(config);
			}
			var options = {
				"locale": {
					"format": language.common.nscomponent.daterangepicker.localeformat,
					"separator": "-",
					"applyLabel": language.common.nscomponent.daterangepicker.applyLabel,
					"cancelLabel":language.common.nscomponent.daterangepicker.cancelLabel,
					"fromLabel": language.common.nscomponent.daterangepicker.fromLabel,
					"toLabel":language.common.nscomponent.daterangepicker.toLabel,
					"customRangeLabel":language.common.nscomponent.daterangepicker.customRangeLabel,
					"daysOfWeek": language.date.daysOfWeek,
					"monthNames": language.date.monthNames,
					"firstDay": 1
				},
				"alwaysShowCalendars": true,
				"opens": "center",
				"buttonClasses": "btn",
			}
			$label.daterangepicker(options, function(start, end, label){
				var startStr = start.format(language.date.rangeFormat);
				var endStr = end.format(language.date.rangeFormat);
				var value = startStr + '/' + endStr;
				if($('#'+labelID).length > 0){$('#'+labelID).remove();}
				$div.append('<input type="text" class="form-control radioInput" id="'+labelID+'" value="'+value+'" />');
				$('#'+labelID).value(value);
				$div.children('label').removeClass('checked');
				$label.addClass('checked');
				$('#'+labelID).daterangepicker(options,function(start,end,label){});
				//模拟一个公用的事件回调
				if(typeof(config.commonChangeHandler)=='function'){
					var obj = {
						value:value,
						dom:$labelInput,
						type:'radio',
						id:config.id,
						config:config
					}
					config.commonChangeHandler(obj);
				}
			});
			//失去焦点
			if(config.isSetBlur){
				this.setBlur(config);
			}
			// 设置焦点
			if(config.isSetFocus){
				this.setFocus(config);
			}
			// 失去焦点
			config.blur = function(){
				config.$input.parent().blur();
			}
			// 获得焦点
			config.focus = function(){
				config.$input.parent().focus();
			}
			return config;
		}else{
			$input.off('change');
		}
	},
	// 初始化移动端
	initMobile:function(config){
		var _this = this;
		// formSource 表单类型标识
		var formSource = config.formSource;
		// 半屏模式添加选中标记
		if(formSource == 'halfScreen'){
			// 判断是否存在默认值 存在选中 添加显示样式
			if(config.$formItem.children().length>0){
				config.$formGroup.addClass('checked');
			}
		}
		// 功能模式 如果没有value值 隐藏该项配置标签
		if(formSource == 'staticData'){
			// 判断是否存在默认值 不存在选中 隐藏
			if(config.$formItem.children().length == 0){
				config.$formGroup.addClass('hidden');
			}
		}
		// 只读模式不用初始化方法
		if(config.readonly==true){
			return;
		}
		// 选择生成容器方法名
		var containerFuncName = false;
		switch(formSource){
			case 'halfScreen':  	// 半屏
				containerFuncName = 'mobileHalfContainer';
				config.$calRelPositionContainer = config.$container; // 计算相对位置的容器 用于显示半屏容器
				break;
			case 'fullScreen':  	// 全屏
				containerFuncName = 'mobileFullContainer';
				break;
			case 'inlineScreen': 	// 行内
				containerFuncName = 'mobileFullContainer';
				// 行内模式添加删除事件
				if(config.$formGroup.children('.form-btn').length>0){
					var $button = config.$formGroup.children('.form-btn').children();
					$button.off('click');
					$button.on('click', {config:config}, function(ev){
						ev.stopImmediatePropagation();
						var config = ev.data.config;
						config.showState = 'more'; // 改变字段显示位置
						$(this).closest('.form-td[mindjetfieldposition="field-more"]').remove();
					});
				}
				break;
			case 'staticData':    	// 功能
				break;
		}
		if(containerFuncName != false){ 
			// 点击label 弹出弹框 显示radio选项
			config.$formGroup.off('click');
			config.$formGroup.on('click', {config:config}, function(ev){
				var config = ev.data.config;
				config.oldValue = _this.getShowValue(config);
				nsUI.radioInput.showContainer(config, containerFuncName);
			})
		}
		if(typeof(config.oldValue)!='undefined'&&config.oldValue!==config.value){
			if(typeof(config.changeHandler)=='function'){
				config.changeHandler(config.value, config);
			}
			if(typeof(config.commonChangeHandler)=='function'){
				var obj = {
					value:config.value,
					dom:config.$formItem,
					type:'radio',
					id:config.id,
					config:config
				}
				config.commonChangeHandler(obj);
			}
			delete config.oldValue;
		}
	},
	// 获取configValue
	getConfigValue : function(config){
		var oldValue = config.value;
		if(oldValue === '' || typeof(oldValue) == "undefined"){
			var subdata = config.subdata;
			if($.isArray(subdata)){
				for(var i=0; i<subdata.length; i++){
					if(subdata[i].isChecked || subdata[i].selected){
						oldValue = subdata[i][config.valueField];
					}
				}
			}
		}
		return oldValue
	},
	// 显示半屏/全屏容器
	showContainer:function(config, containerFuncName){
		function initContainer(radioHtml){
			config.clearValue = false; 
			nsComponent[containerFuncName].show(config, radioHtml, function(resConfig, isSuccess){
				if(isSuccess == true){
					// 确认
					nsUI.radioInput.confirmHandler(resConfig);
					return;
				}
				if(isSuccess == false){
					// 清除
					if(resConfig.ajaxConfig && resConfig.ajaxConfig.data){
						var searchKeyName = resConfig.searchKeyName;
						delete resConfig.ajaxConfig.data[searchKeyName];
					}
					nsUI.radioInput.clearHandler(resConfig);
					return;
				}
				if(isSuccess == 'cancel'){
					// 取消
					nsUI.radioInput.cancelHandler(resConfig);
					return;
				}
			})
			nsUI.radioInput.initRadio(config);
		}
		// 判断是否存在搜索 存在搜索点击先调取ajax
		 var radioHtml = '';
		if(!config.isSendAjax && config.isNeedAjax){
			// 需要发送ajax并且没有发送呢
			if(config.searchMode != 'none'){
				config.btnsType = 'search';
			}
			var components = nsFormBase.data[config.formID].config.component;
			nsComponent.getAjaxSubdata(config, components, function(resConfig, isSuccess, errorInfo){
				if(isSuccess){
					radioHtml = nsUI.radioInput.getMobileListHtml(resConfig);
					initContainer(radioHtml);
				}else{
					console.error('ajax请求错误');
					console.error(resConfig);
				}
			});
		}else{
			radioHtml = nsUI.radioInput.getMobileListHtml(config);
			initContainer(radioHtml);
		}
	},
	// 初始化
	init:function(config,formJson){
		if(config.ajaxLoading){
			// 正在加载 不用执行
			return;
		}
		switch(config.formSource){
			case 'halfScreen':  // 半屏
			case 'fullScreen':  // 全屏
			case 'inlineScreen':  	// 行内
			case 'staticData':    // 功能
				// 移动端记录jQuery对象
				var $label = $('label[for="'+config.fullID+'"]');
				config.$label = $label;
				config.$formGroup = config.$label.parent(); // label对象的父对象
				config.$container = config.$label.closest('.form-td');
				config.$formItem = config.$formGroup.children('.form-item');
				nsUI.radioInput.initMobile(config);
				break;
			default:
				// pc端初始化
				var $dom = $('[name="'+config.fullID+'"]');
				nsComponent.init.setCommonAttr($dom,config);
				nsUI.radioInput.initPc(config,formJson);
				break;
		}
	},
	// 刷新选项列表
	refreshCheckList:function(_config){
		_config.sourceValue = _config.value;
		_config.value='';
		var components = nsFormBase.data[_config.formID].config.component;
		nsComponent.getAjaxSubdata(_config, components, function(resConfig, isSuccess, errorInfo){
			if(isSuccess){
				var html = nsUI.radioInput.getOptionsHtml(resConfig);
				var $listContainer = $('[name="'+resConfig.fullID+'-list"]');
				$listContainer.html(html);
				nsUI.radioInput.setMobileListEvent(resConfig);
			}else{
				console.error('ajax刷新错误');
				console.error(resConfig);
			}
		});
	},
	// 设置移动端选项列表事件
	setMobileListEvent:function(config){
		var $input = $('[name="'+config.fullID+'"]');
		config.$input = $input;
		var $label = $input.prev();
		// 选项label添加点击事件 设置选中取消样式
		$label.off('click');
		$label.on('click', {config:config}, function(ev){
			var $this = $(this);
			var config = ev.data.config;
			var $input = config.$input;
			if($this.hasClass('checked')){
				$this.removeClass('checked');
			}else{
				$input.prev().removeClass('checked');
				$this.addClass('checked');
			}
		});
	},
	// 获取搜索的jQuery对象
	getSearchJQObj:function(config, type){
		/*
		 * config : 组件配置
		 * type : 搜索显示样式 before(开始显示样式)/after(点击后显示样式)
		 */
		if(type == 'before'){
			// 开始搜所框容器对象的事件添加
			var $searchBefore = $(config.searchBeforeHtml);
			// 搜索框点击切换搜索事件 获取焦段事件
			$searchBefore.off('click');
			$searchBefore.on('click', {config:config}, function(ev){
				var _config = ev.data.config;
				var $searchContainer = _config.$searchContainer;
				var $searchAfter = nsUI.radioInput.getSearchJQObj(_config, 'after');
				$searchContainer.html($searchAfter);
				$searchContainer.find('input').focus();
			});
			return $searchBefore;
		}
		if(type == 'after'){
			// 点击搜所框之后容器对象的事件添加
			var $searchAfter = $(config.searchAfterHtml);
			var $btn = $searchAfter.eq(1);
			var $inputContainer = $searchAfter.eq(0);
			var $search = $searchAfter.children('.input-group-addon');
			// 搜索
			$search.off('click');
			$search.on('click', function(ev){
				config.$searchContainer.find('input').focus();
				var searchValue = config.$searchContainer.find('input').val();
				var searchKeyName = config.searchKeyName;
				if(searchValue){
					if(typeof(config.ajaxConfig)=="object"){
						config.ajaxConfig.data[searchKeyName] = searchValue;
					}
					nsUI.radioInput.refreshCheckList(config);
				}
			});
			// 取消按钮事件
			$btn.children('button').off('click');
			$btn.children('button').on('click', {config:config}, function(ev){
				var _config = ev.data.config;
				var $searchContainer = _config.$searchContainer;
				var $searchBefore = nsUI.radioInput.getSearchJQObj(_config, 'before');
				$searchContainer.html($searchBefore);
				var searchValueName = _config.$searchContainer.attr('contentId');
				var searchKeyName = _config.searchKeyName;
				delete _config.ajaxConfig.data[searchKeyName];
				nsUI.radioInput.refreshCheckList(_config);
			});
			// input的keyup事件
			$inputContainer.children('input').off('keyup');
			$inputContainer.children('input').on('keyup', function(ev){
				var val = $(this).val();
				if(val.length>0){
					$inputContainer.children('.input-group-btn').removeClass('hidden');
				}else{
					$inputContainer.children('.input-group-btn').addClass('hidden');
				}
			});
			// input中的清除按钮
			$inputContainer.children('.input-group-btn').children('button').off('click');
			$inputContainer.children('.input-group-btn').children('button').on('click', function(ev){
				$inputContainer.children('input').val('');
			});
			return $searchAfter;
		}
	},
	// 移动端初始化单选事件
	initRadio:function(config){
		// 只读模式不添加事件
		if(config.readonly==true){
			return;
		}
		this.setMobileListEvent(config);
		// 是否存在搜索框
		if(config.searchMode == 'none'){
			return;
		}
		// 存在搜索框
		var $searchContainer = $('[name="'+config.fullID+'-search"]'); // 搜索框容器
		config.$searchContainer = $searchContainer;
		var $search = $searchContainer.children('.mobile-input-search-control');
		// 搜索框点击切换搜索事件 获取焦段事件
		$search.off('click');
		$search.on('click', {config:config}, function(ev){
			var _config = ev.data.config;
			var $searchContainer = _config.$searchContainer;
			var $searchAfter = nsUI.radioInput.getSearchJQObj(_config, 'after');
			$searchContainer.html($searchAfter);
			$searchContainer.find('input').focus();
		});
		var containerName = config.containerName;
		var fullContainer = nsComponent.mobileFullContainer.containers[containerName];
		fullContainer.$container.off('keyup');
		fullContainer.$container.on('keyup', {config:config}, function(ev){
			var keyCode = ev.keyCode;
			if(keyCode==13){
				var _config = ev.data.config;
				_config.$searchContainer.find('input').focus();
				var searchValue = _config.$searchContainer.find('input').val();
				var searchKeyName = _config.searchKeyName;
				if(searchValue){
					// _config.data[searchKeyName] = searchValue;
					if(typeof(_config.ajaxConfig)=="object"){
						_config.ajaxConfig.data[searchKeyName] = searchValue;
					}
					nsUI.radioInput.refreshCheckList(_config);
				}
			}
		});
		$(document).off('keydown');
		$(document).on('keydown',function(event){
			switch(event.keyCode){
				case 13:return false;break;
			}
		});
	},
	// 取消
	cancelHandler:function(_config){
		if(_config.sourceValue){
			// 搜索过或者清除过才会有这个值 
			_config.value = _config.sourceValue;
			delete _config.sourceValue;
		}
	},
	// 清除
	clearHandler:function(_config){
		// 根据按钮类型判断清除执行的操作
		if(_config.btnsType=='search'){
			// 清空列表选中值
			_config.sourceValue = typeof(_config.sourceValue)=='undefined'?_config.value:_config.sourceValue;
			_config.value = '';
			var html = nsUI.radioInput.getOptionsHtml(_config);
			var $listContainer = $('[name="'+_config.fullID+'-list"]');
			$listContainer.html(html);
			nsUI.radioInput.setMobileListEvent(_config);
		}else{
			_config.value = '';
			_config.clearValue = true;
			var edit = [_config];
			// 是否存在搜索框
			// 存在搜索框 说明有与它关联的字段配置 设置关联配置的value
			if(_config.contentFieldConfig){
				var contentConfig = _config.contentFieldConfig;
				contentConfig.value = '';
				edit.push(contentConfig);
			}
			// 删除原始值 搜索过才会有这个值
			delete _config.sourceValue;
			var urlStr = _config.url;
			if(_config.searchMode == "server" || _config.searchMode == "client"){
				nsForm.edit(edit, _config.formID);
			}else{
				delete _config.url;
				_config.isHaveUrl = true;
				nsForm.edit(edit, _config.formID);
				_config.url = urlStr;
				delete _config.isHaveUrl;
			}
		}
	},
	// 确认
	confirmHandler:function(_config){
		// 删除原始值 搜索过才会有这个值
		delete _config.sourceValue;
		// 刷新value
		var value = this.getOptionsValue(_config, false);
		if(_config.isObjectValue){
			// _config.value = {};
			// _config.value[_config.valueField] = value;
			// _config.value[_config.textField] = this.getContent(_config, value);
			_config.value = this.getValueList(_config, value);
		}else{
			_config.value = value;
		}
		var urlStr = _config.url;
		delete _config.url;
		var edit = [_config];
		// 是否存在搜索框
		// 存在搜索框 说明有与它关联的字段配置 设置关联配置的value
		if(_config.contentFieldConfig){
			var text = this.getContent(_config, value);
			var contentConfig = _config.contentFieldConfig;
			contentConfig.value = text;
			edit.push(contentConfig);
		}
		_config.isHaveUrl = true;
		nsForm.edit(edit, _config.formID);
		_config.url = urlStr;
		delete _config.isHaveUrl;
	},
	// 设置焦点
	setFocus:function(_config){
		_config.$input.parent().attr('tabindex','0');
		// _config.$input.parent().focus();
	},
	// 设置失去焦点
	setBlur:function(_config){
		var _this = this;
		_config.$input.parent().off('blur',  _this.setBlurHandler);
		_config.$input.parent().on('blur', {_config:_config,_this:_this}, _this.setBlurHandler);
	},
	// 设置失去焦点的方法
	setBlurHandler:function(event){
		var _config = event.data._config;
		var _this = event.data._this;
		var inputValueStr = '';
		_this.getValue(_config);
	},
	// 设置切换字段快捷键
	setSwitchShortcutKey:function(_config){
		var _this = this;
		// _config.$input.parent().attr('tabindex','0');
		_config.$input.parent().off('keydown', _this.switchShortcutKeyHandler)
		_config.$input.parent().on('keydown', {_config:_config}, _this.switchShortcutKeyHandler)
	},
	// 切换字段方法
	switchShortcutKeyHandler:function(event){
		var _config = event.data._config; // 当前字段配置
		// var $labelList = _config.$input.parent().children('label'); // 字段中所有选项的jQuery对象
		var $input = _config.$input; // 字段中所有选项的jQuery对象
		var checkedIndex = 0; // 选中的位置
		var isHaveChecked = false; // 是否存在选中
		for(var i=0;i<$input.length;i++){
			if($input.eq(i).is(':checked')){
				checkedIndex = i;
				isHaveChecked = true;
				break;
			}
		}
		if($input.eq(checkedIndex).prev().is($('.radio-clear'))){
			checkedIndex = 0;
			isHaveChecked = false;
		}
		switch(event.keyCode){
			// 回车
			case 13:
				if(typeof(_config.switchFocus)=='function'){
					// 存在切换方法
					_config.switchFocus();
				}else{
					_config.blur();
				}
				// 如果有失去焦点配置方法 执行 失去焦点方法
				if(typeof(_config.blurHandler)=='function'){
					_config.blurHandler(formJson);
				}
				break;
			// 左
			case 37:
			// 上
			case 38:
				var isRemove = false; // 第一个选中时不在上移
				if(checkedIndex==0 || !isHaveChecked){
				}else{
					isRemove = true;
					checkedIndex = checkedIndex-1;
				}
				if(isRemove){
					// $input.removeAttr('checked');
					$input.eq(checkedIndex).attr('checked',true);
					$input.prev().removeClass('checked');
					$input.eq(checkedIndex).prev().addClass('checked');
					//$input.eq(checkedIndex).change();
				}
				break;
			// 右
			case 39:
			// 下
			case 40:
				// $input.removeAttr('checked');
				var isClose = false; // 是否是关闭按钮
				if(checkedIndex==$input.length-1 || !isHaveChecked){
				}else{
					checkedIndex = checkedIndex+1;
				}
				$input.eq(checkedIndex).attr('checked',true);
				$input.prev().removeClass('checked');
				$input.eq(checkedIndex).prev().addClass('checked');
				// $input.eq(checkedIndex).change();
				break;
		}
	},
	// 验证数据 设置报错信息
	validate:function(_config, inputValueStr){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			// 单选只支持必填 radio 
			var isLegal = true;
			var errorKey = '';
			if(_config.rules.indexOf('radio')>-1){
				errorKey = 'radio';
				isLegal = nsComponent.getIsValidate(inputValueStr,'radio'); // 是否合法
			}
			if(!isLegal){
				var errorInfoStr = validateMsg[errorKey];
				var errorConfig = {}; // 提示信息配置
				if( _config.formSource == 'halfScreen' ||  // 半屏
					_config.formSource == 'fullScreen' ||  // 全屏
					_config.formSource == 'inlineScreen' 	||  // 行内
					_config.formSource == 'staticData' 	    // 功能
					){
					errorConfig = {
						$container:_config.$label.next('.form-item'),
						$input:_config.$label,
						popStr:errorInfoStr,
						alertStr:_config.label+i18n.getValueError,
					}
				}else{
					var errorConfig = {
						alertStr:_config.label+i18n.getValueError,
						popStr:errorInfoStr,
						stateType:'warning',
						$container:_config.$input.parent(),
						$input:_config.$input.parent(),
					}
				}
				nsComponent.showState(errorConfig);
				return false;
			}
		}
		return true;
	},
	// 获取选项值
	getOptionsValue:function(_config, isValid){
		var inputValueStr = '';
		for(var i=0;i<_config.$input.length;i++){
			if(_config.$input.eq(i).is(':checked')){
				inputValueStr = _config.$input.eq(i).val();
				break;
			}
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config, inputValueStr);
		if(isTrue){
			return inputValueStr;
		}else{
			return false;
		}
	},
	getShowValue : function(_config){
		var value = _config.value;
		if(typeof(value)=="undefined"||value===""){
			// 是否存在选中值
			var isHaveVal = false;
			for(var i=0;i<_config.subdata.length;i++){
				if(_config.subdata[i][_config.valueField] === value && value === ''){
					isHaveVal = true;
					break;
				}
			}
		if(!isHaveVal){
				for(var i=0;i<_config.subdata.length;i++){
					if(_config.subdata[i].isChecked || _config.subdata[i].selected){
						value = _config.subdata[i][_config.valueField];
						break;
					}
				}
			}
		}
		return value;
	},
	//获取值
	getValue:function(_config, isValid){
		if(_config.ajaxLoading){
			// 正在加载 不用执行
			return;
		}
		var inputValueStr = '';
		if( _config.formSource == 'halfScreen' ||  // 半屏
			_config.formSource == 'fullScreen' ||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    // 功能
		){
			inputValueStr = _config.value;
		}else{
			for(var i=0;i<_config.$input.length;i++){
				if(_config.$input.eq(i).is(':checked')){
					inputValueStr = _config.$input.eq(i).val();
					break;
				}
			}
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			var value = inputValueStr;
			if(typeof(_config.outputFields) == "object" && !$.isEmptyObject(_config.outputFields)){
				value = nsComponent.getOutputValueObjBySubdata(value, _config);
			}
			return value;
			// return inputValueStr;
		}
		var isTrue = this.validate(_config, inputValueStr);
		if(isTrue){
			var value = inputValueStr;
			if(typeof(_config.outputFields) == "object" && !$.isEmptyObject(_config.outputFields)){
				value = nsComponent.getOutputValueObjBySubdata(value, _config);
			}
			return value;
		}else{
			return false;
		}
	},
	// 赋值
	setValue:function(_config,value){
		if( _config.formSource == 'halfScreen' 		||  // 半屏
			_config.formSource == 'fullScreen' 		||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    	// 功能
		){
			_config.value = value;
			nsForm.edit([_config],_config.formID);
			if(typeof(_config.changeHandler) == "function"){
				_config.changeHandler(value, _config);
			}
			if(typeof(_config.commonChangeHandler) == "function"){
				var obj = {
					value:value,
					dom:_config.$formItem,
					type:'radio',
					id:_config.id,
					config:_config
				}
				_config.commonChangeHandler(obj);
			}
		}else{
			var $radio = _config.$input;
			$radio.removeAttr('checked');
			$radio.parent().children('label').removeClass('checked');
			if($.isArray(_config.subdata)){
				for(var radioI=0; radioI<_config.subdata.length; radioI++){
					if(_config.subdata[radioI][_config.valueField] == value){
						$radio.eq(radioI).attr('checked',true);
						$radio.eq(radioI).prev().addClass('checked');
					}
				}
			}
		}
	},
}
// date
/*
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 date 必填
 * placeholder : input提示信息 // 表单根据rules生成 通过：nsComponent.getPlaceHolder(config)  // 此位置已经设置
 * isOnKeydown : 是否设置快捷键切换焦点
 * readonly : 只读
 * rules : 规则 required 必填
 * daysOfWeekDisabled : 字符串或数组格式 根据周几设置只读 默认''即不设置只读
 * daysOfWeekHighlighted : 目前没有用
 * todayBtn : 目前没有用
 * clearBtn : 目前没有用
 * format : 默认日期格式
 * startView : 开始视图 0(日)/1(月->日)/2(年->月->日)
 * addvalue : 日期底部按钮 配置 {value:''，id:''}
 */
nsUI.dateInput = {
	ver:'10.12', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			isOnKeydown:false, // 是否切换
			daysOfWeekDisabled:'',
			daysOfWeekHighlighted:false,
			todayBtn:false,
			clearBtn:false,
			format:nsVals.default.dateFormat,
			startView:0,
			//addvalue:{},
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(_config){
		this.setDefault(_config); // 设置config的默认值
		if(_config.isDefaultDate && ( _config.value === '' || typeof(_config.value) == "undefined" )){
			_config.value = Number(moment().format('x'));
		}
	},
	getContent:function(_config){
		var value = _config.value;
		if(typeof(value)=='undefined'){
			return false;
		}
		if(value==''){
			return false;
		}
		if(typeof(value)!='number'){
			console.error('日期设置的value值类型错误');
			console.error(value);
			console.error(_config);
			return false;
		}
		var content = moment(value).format('YYYY-MM-DD');
		return content;
	},
	// 获取文本值的html代码
	getContentHtml:function(_config){
		var content = this.getContent(_config);
		var html = '';
		if(content==false){
			return html;
		}
		// 默认功能模式是date
		_config.acts = typeof(_config.acts) != 'string' ? 'date' : _config.acts;
		var tagConfig = {
			type:'acts',
			text:content,
			acts:_config.acts,
			config : _config
		}
		if(_config.seat){
			tagConfig.seat = _config.seat;
		}
		if(_config.isShowText){
			tagConfig.isShowText = _config.isShowText;
		}
		if(_config.iconsName){
			tagConfig.iconsName = _config.iconsName;
		}
		html = nsComponent.getTagHtml(tagConfig);
		return html;
	},
	// 获得字段html
	getHtml:function(_config){
		html = '';
		this.setConfig(_config);
		switch(_config.formSource){
			case 'staticData': 		// 功能
				html = nsUI.dateInput.getContentHtml(_config);
				break;
			case 'halfScreen':  	// 半屏
			case 'fullScreen':  	// 全屏
			case 'inlineScreen':   	// 行内
				var value = this.getContent(_config);
				value = value==false?'':value;
				html = '<input class="form-control" '
						+nsComponent.getDefalutAttr(_config)
						+' name="'+_config.fullID +'"'
						+' id="'+_config.fullID+'"'
						+' placeholder="'+_config.placeholder+'"'
						+' type="date"'
						+' value="'+value+'">';
				break;
			default: 				// pc
				var html = 
					'<div class="input-group">'
						+'<input class="form-control datepicker" '
							+nsComponent.getDefalutAttr(_config)
							+' name="'+_config.fullID+'"'
							+' placeholder="'+_config.placeholder+'"'
							+' type="text"'
							+' value="'+nsComponent.getValue(_config)+'"'
						+'>'
						+'<div class="input-group-addon">'
							+'<a href="javascript:void(0);"><i class="fa-calendar"></i></a>'
						+'</div>'
					+'</div>';
				break;
		}
		return html;
	},
	// 初始化pc模式
	initPc:function(config,formJson){
		this.setDefault(config); // 设置config的默认值
		var $input = $('#'+config.fullID);
		config.$input = $input;
		var datePickerOption = 
		{
			autoclose:true,
			todayHighlight:true,
			firstDay:1,
			maxViewMode:2,
			enableOnReadonly:false,
			format:config.format.toLowerCase(), // 日期格式; 转化字母大小写
			daysOfWeekDisabled:config.daysOfWeekDisabled,
			startView:config.startView,
		}
		/*************************sjj 20190614 start */
			//startView: 2, maxViewMode: 2,minViewMode:2, sjj 只选择年的配置参数20190614
			//startView: 2, maxViewMode: 1,minViewMode:1, sjj 只选择月的配置参数 20190614
			if(typeof(config.maxViewMode)=='number'){
				datePickerOption.maxViewMode = config.maxViewMode;
			}
			if(typeof(config.minViewMode)=='number'){
				datePickerOption.minViewMode = config.minViewMode;
			}
		/*************************sjj 20190614 end */
		if(!$.isEmptyObject(config.addvalue)){
			datePickerOption.autovalue = config.addvalue
		}
		$input.datepicker(datePickerOption).on('changeDate',{config:config},function(ev){
			var currentConfig = ev.data.config;
			if(typeof(currentConfig.changeHandler)=='function'){
				var changeDateVal = $(this).val().trim();
				var returnObj = {
					id: currentConfig.id,
					value: $(this).val().trim()
				};
				currentConfig.changeHandler(returnObj);
			}
			//模拟一个公用的事件回调
			if(typeof(currentConfig.commonChangeHandler)=='function'){
				var obj = {
					value:$(this).val().trim(),
					dom:$(this),
					type:'date',
					id:currentConfig.id,
					config:currentConfig
				}
				currentConfig.commonChangeHandler(obj);
			}
		})
		$input.next().on('click',function(ev){
			$input.datepicker('show');
		})
		// 切换焦点
		if(typeof(formJson)=='object' && typeof(config.enterFocusField)=='string'){
			// 表单
			config.switchFocus = nsComponent.getFieldFocusMethod(formJson.id,config.enterFocusField);
		}
		// 是否支持快捷键 下一个获得焦点 默认不支持
		if(config.isOnKeydown){
			this.setSwitchShortcutKey(config);
		}
		// 设置失去焦点
		this.setBlur(config);
		// 设置焦点
		this.setFocus(config);
		// 失去焦点
		config.blur = function(){
			config.$input.blur();
		}
		// 获得焦点
		config.focus = function(){
			config.$input.focus();
		}
	},
	// 初始化移动端
	initMobile:function(config){
		// formSource 表单类型标识
		var formSource = config.formSource;
		// 功能模式 如果没有value值 隐藏该项配置标签
		if(formSource == 'staticData'){
			// 判断是否存在默认值 不存在选中 隐藏
			if(config.$formItem.children().length == 0){
				config.$formGroup.addClass('hidden');
			}
		}
		// 只读模式不用初始化方法
		if(config.readonly==true){
			return;
		}
		// 行内模式添加change事件
		if(formSource == 'inlineScreen' || formSource == 'fullScreen'){
			var $input = config.$input;
			$input.off('change');
			$input.on('change', {config:config}, function(ev){
				var _config = ev.data.config;
				var $this = $(this);
				var oldValue = _config.value;
				var value = nsUI.dateInput.getValueMobile(_config);
				if(value){
					value = parseInt(moment(value).format('x'));
					_config.value = value;
				}
				if(oldValue!=_config.value){
					if(typeof(_config.changeHandler)=='function'){
						_config.changeHandler(value, _config);
					}
					if(typeof(_config.commonChangeHandler)=='function'){
						var obj = {
							value:_config.value,
							dom:_config.$formItem,
							type:'date',
							id:_config.id,
							config:_config
						}
						_config.commonChangeHandler(obj);
					}
				}
			})
			if(config.formSource == 'inlineScreen'){
				// 行内模式添加删除事件
				if(config.$formGroup.children('.form-btn').length>0){
					var $button = config.$formGroup.children('.form-btn').children();
					$button.off('click');
					$button.on('click', {config:config}, function(ev){
						ev.stopImmediatePropagation();
						var config = ev.data.config;
						config.showState = 'more'; // 改变字段显示位置
						$(this).closest('.form-td[mindjetfieldposition="field-more"]').remove();
					});
				}
			}
		}
	},
	//初始化
	init:function(config,formJson){
		switch(config.formSource){
			case 'halfScreen':  // 半屏
			case 'fullScreen':  // 全屏
			case 'inlineScreen':  	// 行内
			case 'staticData':    // 功能
				// 移动端记录jQuery对象
				var $label = $('label[for="'+config.fullID+'"]');
				config.$label = $label;
				config.$formGroup = config.$label.parent(); // label对象的父对象
				config.$container = config.$label.closest('.form-td');
				config.$formItem = config.$formGroup.children('.form-item');
				config.$input = config.$formGroup.children('.form-item').children('input');
				nsUI.dateInput.initMobile(config);
				break;
			default:
				// pc端初始化
				var $dom = $('[name="'+config.fullID+'"]');
				nsComponent.init.setCommonAttr($dom,config);
				nsUI.dateInput.initPc(config,formJson);
				break;
		}
	},
	//设置焦点
	setFocus:function(_config){

		// _config.$input.focus();
		// _config.$input[0].selectionStart = 0; // 设置光标开始位置
		// _config.$input[0].selectionEnd = _config.$input.val().length; // 设置光标结束位置
	},
	// 设置失去焦点
	setBlur:function(_config){
		var _this = this;
		_config.$input.off('blur',  _this.setBlurHandler);
		_config.$input.on('blur', {_config:_config,_this:_this}, _this.setBlurHandler);
	},
	// 设置失去焦点的方法
	setBlurHandler:function(event){
		var _config = event.data._config;
		var _this = event.data._this;
		_this.getValue(_config);
	},
	// 设置切换字段快捷键
	setSwitchShortcutKey:function(_config,formJson){
		var _this = this;
		_config.$input.off('keydown', _this.switchShortcutKeyHandler);
		_config.$input.on('keydown', {_config:_config,formJson:formJson}, _this.switchShortcutKeyHandler);
	},
	// 切换字段方法
	switchShortcutKeyHandler:function(event){
		var _config = event.data._config; // 当前字段配置
		var formJson = event.data.formJson; // 当前表单配置
		if(event.keyCode == 13){
			if($('div.datepicker').length==0){
				if(typeof(_config.switchFocus)=='function'){
					// 存在切换方法
					_config.switchFocus();
				}else{
					_config.blur();
				}
				// 如果有失去焦点配置方法 执行 失去焦点方法
				if(typeof(_config.blurHandler)=='function'){
					_config.blurHandler(formJson);
				}
			}
		}
	},
	// 验证数据
	validate:function(_config, inputValueStr){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			// 单选只支持必填 radio 
			var isLegal = true;
			var errorKey = '';
			if(_config.rules.indexOf('required')>-1){
				errorKey = 'required';
				isLegal = nsComponent.getIsValidate(inputValueStr,errorKey); // 是否合法
			}
			if(!isLegal){
				var errorInfoStr = validateMsg[errorKey];
				var errorConfig = {
					alertStr:_config.label+i18n.getValueError,
					popStr:errorInfoStr,
					stateType:'warning',
					$container:_config.$input.parent(),
					$input:_config.$input,
				}
				nsComponent.showState(errorConfig);
				return false;
			}
		}
		return true;
	},
	// 移动端获取value值
	getValueMobile:function(_config, isValid){
		var inputValueStr = '';
		inputValueStr = $.trim(_config.$input.val());
		inputValueStr = typeof(inputValueStr) == 'string' ? inputValueStr : '';
		if(inputValueStr){
			if(_config.readonly == false){
				//执行初始化datepicker()所以会存在datepicker('getDate')
				if(typeof(_config.addvalue)=='object'){
					if(!$.isEmptyObject(_config.value)){
						//存在自定义值 永久，长期
						inputValueStr = _config.addvalue.id;
					}
				}else{
					// inputValueStr = $date.datepicker('getDate').getTime();
				}
			}
			inputValueStr = moment(inputValueStr).format('YYYY-MM-DD');
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config, inputValueStr);
		if(isTrue){
			return inputValueStr;
		}else{
			return false;
		}
	},
	//获取值
	getValue:function(_config, isValid){
		var inputValueStr = '';
		if( _config.formSource == 'halfScreen' ||  // 半屏
			_config.formSource == 'fullScreen' ||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    // 功能
		){
			inputValueStr = _config.value;
		}else{
			inputValueStr = $.trim(_config.$input.val());
			inputValueStr = typeof(inputValueStr) == 'string' ? inputValueStr : '';
			if(inputValueStr){
				if(_config.readonly == false){
					//执行初始化datepicker()所以会存在datepicker('getDate')
					if(typeof(_config.addvalue)=='object'){
						if(!$.isEmptyObject(_config.value)){
							//存在自定义值 永久，长期
							inputValueStr = _config.addvalue.id;
						}
					}else{
						var $date = _config.$input;
						inputValueStr = $date.datepicker('getDate').getTime();
					}
				}
				inputValueStr = moment(inputValueStr).format('YYYY-MM-DD');
			}
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config, inputValueStr);
		if(isTrue){
			return inputValueStr;
		}else{
			return false;
		}
	},
	// 赋值
	setValue:function(_config,value){
		if( _config.formSource == 'halfScreen' 		||  // 半屏
			_config.formSource == 'fullScreen' 		||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    	// 功能
		){
			_config.value = value;
			nsForm.edit([_config],_config.formID);
		}else{
			var regu = /^[-+]?\d*$/;
			if(regu.test(value)){
				if(value == ''){
					value = _config.isDefaultDate == false ? '':nsComponent.formatDate(value);
				}else{
					value = nsComponent.formatDate(value);
				}
			}
			_config.$input.val(value);
			_config.$input.datepicker('update');
		}
	},
}
// datetime
/*
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 datetime 必填
 * placeholder : input提示信息 // 表单根据rules生成 通过：nsComponent.getPlaceHolder(config)  // 此位置已经设置
 * isOnKeydown : 是否设置快捷键切换焦点
 * readonly : 只读
 * rules : 规则 required 必填
 * format : 日期格式
 * showSeconds : 时间格式 是否显示秒
 */
nsUI.datetimeInput = {
	ver:'10.12', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			isOnKeydown:false, // 是否切换
			format:'YYYY-MM-DD HH:mm', // 日期时间格式
			showSeconds:false,
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(_config){
		this.setDefault(_config); // 设置config的默认值
		_config.showContentId = _config.fullID + '-content';
        // 格式化format
        var formatStr = $.trim(_config.format);
        if(formatStr.indexOf(' ') > -1){
            var formatArr = formatStr.split(' ');
            formatArr[0] = formatArr[0].toUpperCase();
            formatArr[1] = formatArr[1].replace(/M|S/g, function(a){return a.toLowerCase()});
            formatStr = formatArr[0] + ' ' + formatArr[1];
        }else{
            formatStr = formatStr.toUpperCase();
        }
        _config.format = formatStr;
	},
	getContent:function(_config){
		var value = _config.value;
		if(typeof(value)=='undefined'){
			return false;
		}
		if(value==''){
			return false;
		}
		if(typeof(value)!='number'){
			console.error('日期设置的value值类型错误');
			console.error(value);
			console.error(_config);
			return false;
		}
		// var formatStr = 'YYYY-MM-DDThh:mm';
		var content = moment(value).format(_config.format);
		return content;
	},
	getContentDatetimeVal : function(_config, content){
		if(content === ''){
			return '';
		}
		var value = _config.value;
		var formatStr = _config.format.replace(' ', 'T');
		return moment(value).format(formatStr);
	},
	// 获取文本值的html代码
	getContentHtml:function(_config){
		var content = this.getContent(_config);
		var html = '';
		if(content==false){
			return html;
		}
		// 默认功能模式是date
		_config.acts = (typeof(content)!='string' && typeof(content)!='number') ? 'datetime' : _config.acts;
		var tagConfig = {
			type:'acts',
			text:content,
			acts:_config.acts,
			config : _config
		}
		if(_config.seat){
			tagConfig.seat = _config.seat;
		}
		if(_config.isShowText){
			tagConfig.isShowText = _config.isShowText;
		}
		if(_config.iconsName){
			tagConfig.iconsName = _config.iconsName;
		}
		html = nsComponent.getTagHtml(tagConfig);
		return html;
	},
	// 获得html需要的配置参数
	getHtmlParameter:function(_config){
		var datetimerValue = nsComponent.getValue(_config);
		var dateValue = '';
		var timeValue = '';
		if(datetimerValue){
			dateValue = datetimerValue.split(' ')[0];
			timeValue = datetimerValue.split(' ')[1];
			timeValue = typeof(timeValue) == 'undefined' ? '' : timeValue;
		}
		var readonlyStr = _config.readonly ? 'readonly' : '';
		if(_config.readonly == false){
			//是否禁止输入
			if(_config.disabledInput == true){
				readonlyStr = 'readonly';
			}
		}
		// 生成html需要的参数
		var htmlParameter = {
			dateID : _config.fullID + '-date',
			timeID : _config.fullID + '-time',
			datetimerDefaultValue : nsComponent.formatDate('',language.date.format),
			dateValue : dateValue,
			timeValue : timeValue,
			readonlyStr : readonlyStr,
		}
		return htmlParameter;
	},
	// 获得字段html
	getHtml:function(_config){
		html = '';
		this.setConfig(_config);
		switch(_config.formSource){
			case 'staticData': 		// 功能
				html = nsUI.datetimeInput.getContentHtml(_config);
				break;
			case 'halfScreen':  	// 半屏
			case 'fullScreen':  	// 全屏
			case 'inlineScreen':   	// 行内
				var value = this.getContent(_config);
				value = value==false?'':value;
				var datetimeVal = this.getContentDatetimeVal(_config, value);
				html = '<input class="form-control" '
							+nsComponent.getDefalutAttr(_config)
							+' name="'+_config.fullID +'"'
							+' id="'+_config.fullID+'"'
							+' placeholder="'+_config.placeholder+'"'
							+' type="datetime-local"'
							+' value="'+datetimeVal+'">'
						+ '<div class="datetime-show-content" id="' + _config.showContentId + '">' + value + '</div>';
				break;
			default: 				// pc
				var htmlParameter = this.getHtmlParameter(_config);
				var html = '<input id="'+htmlParameter.dateID+'"'
								+' name="'+htmlParameter.dateID+'"'
								+' ns-id="'+_config.id+'"'
								+' nstype="'+_config.type+'"'
								+' type="text" class="form-control datepicker"'
								+' value="'+htmlParameter.dateValue+'"  '+htmlParameter.readonlyStr
							+' />'
							+'<input id="'+htmlParameter.timeID+'"'
								+' name="'+htmlParameter.timeID+'"'
								+' ns-id="'+_config.id+'"'
								+' nstype="'+_config.type+'"'
								+' type="text" class="form-control timepicker"'
								+' value="'+htmlParameter.timeValue+'"  '+htmlParameter.readonlyStr
							+' />'; 
				break;
		}
		return html;
	},
	// 初始化pc模式
	initPc:function(config,formJson){
		var $inputDate = $('#'+config.fullID+'-date');
		var $inputTime = $('#'+config.fullID+'-time');
		config.$inputDate = $inputDate; // 日期
		config.$inputTime = $inputTime; // 时间
		config.$input = $inputTime.parent().children(); // 日期时间input
		$inputTime.attr('seconds',config.showSeconds);
		$inputTime.attr('disabled',config.readonly);
		config.$inputDate.datepicker({
			format:config.format.split(' ')[0].toLowerCase(),
			autoclose:true,
			todayHighlight:true,
			maxViewMode:2,
			enableOnReadonly:false
		}).on('changeDate', function(ev){
			var changeDateTimeID = config.fullID;
			var changeDateID = $(this).attr('id'); //dateID
			var getTimerID = config.fullID+'-time';
			var getTimervalue = $('#'+getTimerID).val().trim();
			var changeHandler = config.changeHandler;
			var changeDateVal = $(this).val().trim();
			var datetimervalue = changeDateVal + ' ' + getTimervalue;
			if(typeof(changeHandler)=='function'){
				var returnObj = {};
				returnObj.datevalue = changeDateVal;
				returnObj.dateID = changeDateID;
				returnObj.timeValue = getTimervalue;
				returnObj.timeID = getTimerID;
				returnObj.datetimerID = changeDateTimeID;
				returnObj.datetimervalue = datetimervalue;
				changeHandler(returnObj);
			}
			//模拟一个公用的事件回调
			if(typeof(config.commonChangeHandler)=='function'){
				var obj = {
					value:datetimervalue,
					dom:$(this),
					type:'datetime',
					id:config.id,
					datevalue:changeDateVal,
					dateID:changeDateID,
					timeValue:getTimervalue,
					timeID:getTimerID,
					config:config
				}
				config.commonChangeHandler(obj);
			}
		});
		$inputTime.timepicker({
			minuteStep: 1,//分钟间隔
			template: 'dropdown',//是否可选择 false,modal为只读
			showSeconds:config.showSeconds,//是否显示秒
			secondStep:1,//秒间隔
			showMeridian:false,//24小时制  true为12小时制
			defaultTime: false,  //默认时间
			showInputs:false,
		}).on('hide.timepicker',function(ev){
			var changeDateTimeID = config.fullID;
			var currentTimeID = $(this).attr('id');
			var changeHandler = config.changeHandler;
			var getDateID = config.fullID + '-date';
			var getDatevalue = $('#'+getDateID).val().trim();
			var changeDateVal = $(this).val().trim();
			var datetimervalue = getDatevalue + ' ' + changeDateVal;
			if(typeof(changeHandler)=='function'){
				var returnObj = {};
				returnObj.datevalue = getDatevalue;
				returnObj.dateID = getDateID;
				returnObj.timeValue = changeDateVal;
				returnObj.timeID = currentTimeID;
				returnObj.datetimerID = changeDateTimeID;
				returnObj.datetimervalue = datetimervalue;
				changeHandler(returnObj);
			}
			//模拟一个公用的事件回调
			if(typeof(config.commonChangeHandler)=='function'){
				var obj = {
					value:datetimervalue,
					dom:$(this),
					type:'datetime',
					id:config.id,
					datevalue:getDatevalue,
					dateID:getDateID,
					timeValue:changeDateVal,
					timeID:currentTimeID,
					config:config
				}
				config.commonChangeHandler(obj);
			}
		}).on('changeTime.timepicker',function(ev){
			var timeStr = ev.time.hours;
			if(Number(ev.time.minutes) < 10){
				timeStr += ':0'+ev.time.minutes;
			}else{
				timeStr +=':'+ev.time.minutes;
			}
			var isShowseconds = $(this).attr('seconds');
			if(isShowseconds == 'true'){
				if(Number(ev.time.seconds) < 10){
					timeStr += ':0'+ev.time.seconds;
				}else{
					timeStr += ':'+ev.time.seconds;
				}
			}
			$(this).val(timeStr);
		});
		// 切换焦点
		if(typeof(formJson)=='object' && typeof(config.enterFocusField)=='string'){
			// 表单
			config.switchFocus = nsComponent.getFieldFocusMethod(formJson.id,config.enterFocusField);
		}
		// 是否支持快捷键 下一个获得焦点 默认不支持
		if(config.isOnKeydown){
			this.setSwitchShortcutKey(config);
		}
		this.setBlur(config); // 设置失去焦点方法
		// 设置焦点
		this.setFocus(config);
		// 失去焦点
		config.blur = function(){
			config.$inputTime.blur();
		}
		// 获得焦点
		config.focus = function(){
			config.$inputDate.focus();
		}
	},
	// 初始化移动端
	initMobile:function(config){
		var _this = this;
		// formSource 表单类型标识
		var formSource = config.formSource;
		// 功能模式 如果没有value值 隐藏该项配置标签
		if(formSource == 'staticData'){
			// 判断是否存在默认值 不存在选中 隐藏
			if(config.$formItem.children().length == 0){
				config.$formGroup.addClass('hidden');
			}
		}
		// 只读模式不用初始化方法
		if(config.readonly==true){
			return;
		}
		// 行内模式添加change事件
		if(formSource == 'inlineScreen'){
			var $input = config.$input;
			$input.off('change');
			$input.on('change', {config:config}, function(ev){
				var _config = ev.data.config;
				var $this = $(this);
				var oldValue = _config.value;
				var value = $this.val();
				if(value){
					value = value.replace('T', ' ');
					value = parseInt(moment(value).format('x'));
					_config.value = value;
					var formatDatetime = _this.getContent(_config);
					_config.$showContent.text(formatDatetime);
				}
				if(oldValue!=_config.value){
					if(typeof(_config.changeHandler)=='function'){
						_config.changeHandler(value, _config);
					}
					if(typeof(_config.commonChangeHandler)=='function'){
						var obj = {
							value:_config.value,
							dom:_config.$formItem,
							type:'datetime',
							id:_config.id,
							config:_config
						}
						_config.commonChangeHandler(obj);
					}
				}
			})
			var $showContent = config.$showContent;
			$showContent.off('click');
			$showContent.on('click', function(ev){
				$input.trigger('focus');
				$input.trigger('click');
			});
			// 行内模式添加删除事件
			if(config.$formGroup.children('.form-btn').length>0){
				var $button = config.$formGroup.children('.form-btn').children();
				$button.off('click');
				$button.on('click', {config:config}, function(ev){
					ev.stopImmediatePropagation();
					var config = ev.data.config;
					config.showState = 'more'; // 改变字段显示位置
					$(this).closest('.form-td[mindjetfieldposition="field-more"]').remove();
				});
			}
		}
	},
	//初始化
	init:function(config,formJson){
		switch(config.formSource){
			case 'halfScreen':  // 半屏
			case 'fullScreen':  // 全屏
			case 'inlineScreen':  	// 行内
			case 'staticData':    // 功能
				// 移动端记录jQuery对象
				var $label = $('label[for="'+config.fullID+'"]');
				config.$label = $label;
				config.$formGroup = config.$label.parent(); // label对象的父对象
				config.$container = config.$label.closest('.form-td');
				config.$formItem = config.$formGroup.children('.form-item');
				config.$input = config.$formGroup.children('.form-item').children('input');
				config.$showContent = config.$formGroup.children('.form-item').children('div');
				nsUI.datetimeInput.initMobile(config);
				break;
			default:
				// pc端初始化
				var $dom = $('[name="'+config.fullID+'"]');
				nsComponent.init.setCommonAttr($dom,config);
				nsUI.datetimeInput.initPc(config,formJson);
				break;
		}
	},
	//设置焦点
	setFocus:function(_config){
		// _config.$inputDate.focus();
	},
	// 设置失去焦点
	setBlur:function(_config,type){
		var _this = this;
		// _config.$inputDate.off('blur',  _this.setBlurHandler);
		// _config.$inputDate.on('blur', {_config:_config,_this:_this}, _this.setBlurHandler);
		_config.$inputTime.off('blur',  _this.setBlurHandler);
		_config.$inputTime.on('blur', {_config:_config,_this:_this}, _this.setBlurHandler);
	},
	// 设置失去焦点的方法
	setBlurHandler:function(event){
		var _config = event.data._config;
		var _this = event.data._this;
		_this.getValue(_config);
	},
	// 设置切换字段快捷键
	setSwitchShortcutKey:function(_config){
		var _this = this;
		_config.$inputDate.off('keydown',_this.switchShortcutKeyHandler);
		_config.$inputDate.on('keydown', {_config:_config,type:'date'}, _this.switchShortcutKeyHandler);
		_config.$inputTime.off('keydown',_this.switchShortcutKeyHandler);
		_config.$inputTime.on('keydown', {_config:_config,type:'time'}, _this.switchShortcutKeyHandler);
	},
	// 切换字段方法
	switchShortcutKeyHandler:function(event){
		var _config = event.data._config; // 当前字段配置
		var type = event.data.type; // 当前表单配置
		if(event.keyCode == 13){
			var $input = '';
			switch(type){
				case 'date':
					if($('div.datepicker').length==0){
						_config.$inputTime.focus();
					}
					break;
				case 'time':
					var $input = _config.$inputTime;
					$input.timepicker('hideWidget');
					if(typeof(_config.switchFocus)=='function'){
						// 存在切换方法
						_config.switchFocus();
					}else{
						_config.blur();
					}
					// 如果有失去焦点配置方法 执行 失去焦点方法
					if(typeof(_config.blurHandler)=='function'){
						_config.blurHandler(formJson);
					}
					break;
			}
		}
	},
	// 验证数据
	validate:function(_config, inputValueStr){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			// 只支持必填
			var isLegal = true;
			var errorKey = '';
			if(_config.rules.indexOf('required')>-1){
				errorKey = 'required';
				isLegal = nsComponent.getIsValidate(inputValueStr,errorKey); // 是否合法
			}
			if(!isLegal){
				var errorInfoStr = validateMsg[errorKey];
				var errorConfig = {
					alertStr:_config.label+i18n.getValueError,
					popStr:errorInfoStr,
					stateType:'warning',
					$container:_config.$input.parent(),
					$input:_config.$input,
				}
				nsComponent.showState(errorConfig);
				return false;
			}
		}
		return true;
	},
	//获取值
	getValue:function(_config, isValid){
		var inputValueStr = '';
		if( _config.formSource == 'halfScreen' ||  // 半屏
			_config.formSource == 'fullScreen' ||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    // 功能
		){
			inputValueStr = _config.value;
		}else{
			var dateValue = $.trim(_config.$inputDate.val());
			var timeValue = $.trim(_config.$inputTime.val());
			if(dateValue !== ''){
				//存在日期值的情况转换日期
				dateValue = _config.$inputDate.datepicker('getDate').getTime();
				dateValue = moment(dateValue).format('YYYY-MM-DD');
			}
			if(timeValue !== ''){
				//存在时间值
				inputValueStr = dateValue +' '+timeValue;
			}else{
				inputValueStr = dateValue;
			}
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config, inputValueStr);
		if(isTrue){
			return inputValueStr;
		}else{
			return false;
		}
	},
	// 赋值
	setValue:function(_config,value){
		if( _config.formSource == 'halfScreen' 		||  // 半屏
			_config.formSource == 'fullScreen' 		||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    	// 功能
		){
			_config.value = value;
			nsForm.edit([_config],_config.formID);
		}else{
			var valStr = value;
			if(typeof(value) == 'number'){
				if(config.format){
					valStr = nsComponent.formatDate(value,'YYYY-MM-DD HH:mm');
				}else{
					valStr = nsComponent.formatDate(value,'YYYY-MM-DD HH:mm:ss');
				}
			}
			var dateStr = valStr.split(' ')[0];
			var timeStr = valStr.split(' ')[1];
			timeStr = typeof(timeStr) == 'undefined' ? '' : timeStr;
			_config.$inputDate.val(dateStr);
			_config.$inputTime.val(timeStr);
			_config.$inputDate.datepicker('update');
			_config.$inputTime.timepicker('setTime',timeStr);
			_config.$inputTime.timepicker('updateWidget');
		}
	},
}
// daterangeRadio
/*
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 datetime 必填
 * placeholder : input提示信息 // 表单根据rules生成 通过：nsComponent.getPlaceHolder(config)  // 此位置已经设置
 * isOnKeydown : 是否设置快捷键切换焦点
 * readonly : 只读
 * rules : 规则 required 必填
 * rangeType : 选项显示下周/下月 还是 上周/上月 ---> after/before
 */
nsUI.daterangeRadioInput = {
	ver:'10.12', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			isOnKeydown:false, // 是否切换
			rangeType:'before',
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(_config){
		this.setDefault(_config); // 设置config的默认值
	},
	// 获得字段html
	getHtml:function(_config){
		this.setConfig(_config);
		var rangeArray = language.date.beforeRange;
		if(_config.rangeType === 'after'){
			rangeArray = language.date.afterRange;
		}
		var html = '';
		for(var rangeI=0; rangeI<rangeArray.length; rangeI++){
			var isInputClassStr = rangeI === rangeArray.length-1 ? 'isInput=true' : '';
			var checkedAttr = rangeI===0 ? 'checked' : '';
			html += '<label class="radio-inline '+checkedAttr+'" for="'+_config.fullID+'-'+rangeI+'">'
						+rangeArray[rangeI]
					+'</label>'
					+'<input id="'+_config.fullID+'-'+rangeI+'"'
					+'name="'+_config.fullID+'"'
					+' ns-id="'+_config.id+'"'
					+isInputClassStr
					+' nstype="'+_config.type+'" type="radio" '
					+checkedAttr
					+' class= "radio-options" '
					+' value="'+rangeI+'" >';
		}
		return html;
	},
	//初始化
	init:function(config, formJson){
		this.setDefault(config); // 设置config的默认值
		var $input = $('[name="'+config.fullID+'"]');
		config.$input = $input;
		var rangeArray = language.date.beforeRange;
		if(config.rangeType === 'after'){
			rangeArray = language.date.afterRange;
		}
		var customDateInputID = config.fullID + '-' + (rangeArray.length-1);
		var $dateInput = $('#'+customDateInputID);
		var $container = $dateInput.parent();
		var $customDateLabel = $dateInput.prev();
		var labelID = config.fullID + '-isInput-daterange';
		$input.off('change');
		$input.on('change', {config:config}, function(ev){
			var $this = $(this);
			var nameStr = $this.attr('name');
			var id = $this.attr('id');
			$this.parent().children('label').removeClass('checked');
			$('label[for="'+id+'"]').toggleClass('checked');
			var config = ev.data.config;
			var value = $this.val();
			var config = nsForm.getConfigByDom($this);
			var isInput = $this.attr('isInput');
			if(typeof(isInput)=='undefined'){
				$('#'+labelID).remove();
			}
			if(typeof(config.changeHandler)=='function'){
				config.changeHandler(value,$this);
			}
			//模拟一个公用的事件回调
			if(typeof(config.commonChangeHandler)=='function'){
				var obj = {
					value:value,
					dom:$this,
					type:'daterangeRadio',
					id:config.id,
					config:config
				}
				config.commonChangeHandler(obj);
			}
		})
		var options = {
			"locale": {
				"format": language.common.nscomponent.daterangepicker.localeformat,
				"separator": "-",
				"applyLabel": language.common.nscomponent.daterangepicker.applyLabel,
				"cancelLabel":language.common.nscomponent.daterangepicker.cancelLabel,
				"fromLabel": language.common.nscomponent.daterangepicker.fromLabel,
				"toLabel":language.common.nscomponent.daterangepicker.toLabel,
				"customRangeLabel":language.common.nscomponent.daterangepicker.customRangeLabel,
				"daysOfWeek": language.date.daysOfWeek,
				"monthNames": language.date.monthNames,
				"firstDay": 1
			},
			"alwaysShowCalendars": true,
			"opens": "center",
			"buttonClasses": "btn",
		}
		$customDateLabel.daterangepicker(options, function(start, end, label){
			var startStr = start.format(language.date.rangeFormat);
			var endStr = end.format(language.date.rangeFormat);
			startStr = startStr.replace(/\-/g,'/');
			endStr = endStr.replace(/\-/g,'/');
			var value = startStr + '-' + endStr;
			if($('#'+labelID).length > 0){$('#'+labelID).remove();}
			$container.append('<input type="text" class="form-control radioInput" id="'+labelID+'" value="'+value+'" />');
			$container.children('label').removeClass('checked');
			$customDateLabel.addClass('checked');
			$('#'+labelID).daterangepicker(options,function(start,end,label){
				var startStr = start.format(language.date.rangeFormat);
				var endStr = end.format(language.date.rangeFormat);
				startStr = startStr.replace(/\-/g,'/');
				endStr = endStr.replace(/\-/g,'/');
				var value = startStr + '-' + endStr;
				//模拟一个公用的事件回调
				if(typeof(config.commonChangeHandler)=='function'){
					var obj = {
						value:value,
						dom:$dateInput,
						type:'daterangeRadio',
						id:config.id,
						config:config
					}
					config.commonChangeHandler(obj);
				}
			});
			$('#'+labelID).val(value);
			//模拟一个公用的事件回调
			if(typeof(config.commonChangeHandler)=='function'){
				var obj = {
					value:value,
					dom:$dateInput,
					type:'daterangeRadio',
					id:config.id,
					config:config
				}
				config.commonChangeHandler(obj);
			}
		});
		// 切换焦点
		if(typeof(formJson)=='object' && typeof(config.enterFocusField)=='string'){
			// 表单
			config.switchFocus = nsComponent.getFieldFocusMethod(formJson.id,config.enterFocusField);
		}
		// 是否支持快捷键 下一个获得焦点 默认不支持
		if(config.isOnKeydown){
			this.setSwitchShortcutKey(config);
		}
		this.setBlur(config);
		// 设置焦点
		this.setFocus(config);
		// 失去焦点
		config.blur = function(){
			config.$input.parent().blur();
		}
		// 获得焦点
		config.focus = function(){
			config.$input.parent().focus();
		}
	},
	// 设置change方法
	setChangeHandler:function(_config, $changeInput){
		var value = $changeInput.val();
		var isInput = $changeInput.attr('isInput');
		var labelID = _config.fullID + '-isInput-daterange';
		if(typeof(isInput)=='undefined'){
			$('#'+labelID).remove();
		}
		if(typeof(_config.changeHandler)=='function'){
			_config.changeHandler(value,$changeInput);
		}
		//模拟一个公用的事件回调
		if(typeof(_config.commonChangeHandler)=='function'){
			var obj = {
				value:value,
				dom:$changeInput,
				type:'daterangeRadio',
				id:_config.id,
				config:_config
			}
			_config.commonChangeHandler(obj);
		}
	},
	// 设置焦点
	setFocus:function(_config){
		_config.$input.parent().attr('tabindex','0');
		// _config.$input.parent().focus();
	},
	// 设置失去焦点
	setBlur:function(_config){
		var _this = this;
		_config.$input.parent().off('blur',  _this.setBlurHandler);
		_config.$input.parent().on('blur', {_config:_config,_this:_this}, _this.setBlurHandler);
	},
	// 设置失去焦点的方法
	setBlurHandler:function(event){
		var _config = event.data._config;
		var _this = event.data._this;
		_this.getValue(_config);
	},
	// 设置切换字段快捷键
	setSwitchShortcutKey:function(_config){
		var _this = this;
		// _config.$input.parent().attr('tabindex','0');
		_config.$input.parent().off('keydown', _this.switchShortcutKeyHandler)
		_config.$input.parent().on('keydown', {_config:_config}, _this.switchShortcutKeyHandler)
	},
	// 切换字段方法
	switchShortcutKeyHandler:function(event){
		var _config = event.data._config; // 当前字段配置
		// var $labelList = _config.$input.parent().children('label'); // 字段中所有选项的jQuery对象
		var $input = _config.$input;
		var checkedIndex = 0; // 选中的位置
		var isHaveChecked = false; // 是否存在选中
		for(var i=0;i<$input.length;i++){
			if($input.eq(i).is(':checked')){
				checkedIndex = i;
				isHaveChecked = true;
				break;
			}
		}
		if($input.eq(checkedIndex).prev().is($('.radio-clear'))){
			checkedIndex = 0;
			isHaveChecked = false;
		}
		switch(event.keyCode){
			// 回车
			case 13:
				if(typeof(_config.switchFocus)=='function'){
					// 存在切换方法
					_config.switchFocus();
				}else{
					_config.blur();
				}
				// 如果有失去焦点配置方法 执行 失去焦点方法
				if(typeof(_config.blurHandler)=='function'){
					_config.blurHandler(formJson);
				}
				break;
			// 左
			case 37:
			// 上
			case 38:
				var isRemove = false; // 第一个选中时不在上移
				if(checkedIndex==0 || !isHaveChecked){
				}else{
					isRemove = true;
					checkedIndex = checkedIndex-1;
				}
				if(isRemove){
					$input.removeAttr('checked');
					$input.eq(checkedIndex).attr('checked',true);
					$input.eq(checkedIndex).change();
				}
				break;
			// 右
			case 39:
			// 下
			case 40:
				var isRemove = true; // 是否是关闭按钮
				if(checkedIndex==$input.length-1 || !isHaveChecked){
					if(isHaveChecked){
						isRemove = false;
					}
				}else{
					checkedIndex = checkedIndex+1;
				}
				if(isRemove){
					$input.removeAttr('checked');
					$input.eq(checkedIndex).attr('checked',true);
					$input.eq(checkedIndex).change();
				}
				break;
		}
	},
	// 验证数据
	validate:function(_config, inputValueStr){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			// 只支持必填
			var isLegal = true;
			var errorKey = '';
			if(_config.rules.indexOf('required')>-1){
				errorKey = 'required';
				isLegal = nsComponent.getIsValidate(inputValueStr,errorKey); // 是否合法
			}
			if(!isLegal){
				var errorInfoStr = validateMsg[errorKey];
				var errorConfig = {
					alertStr:_config.label+i18n.getValueError,
					popStr:errorInfoStr,
					stateType:'warning',
					$container:_config.$input.parent(),
					$input:_config.$input.parent(),
				}
				nsComponent.showState(errorConfig);
				return false;
			}
		}
		return true;
	},
	//获取值
	getValue:function(_config, isValid){
		var $input = _config.$input;
		var checkedIndex = 0;
		for(var i=0;i<$input.length;i++){
			if($input.eq(i).is(':checked')){
				checkedIndex = i;
				break;
			}
		}
		var inputValueStr = $.trim($input.eq(checkedIndex).val());
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config, inputValueStr);
		if(isTrue){
			return inputValueStr;
		}else{
			return false;
		}
	},
	// 赋值
	setValue:function(_config,value){
		var $input = _config.$input;
		for(var i=0;i<$input.length;i++){
			if($input.eq(i).val() == value){
				$input.prev().removeClass('checked');
				$input.removeAttr('checked');
				$input.eq(i).prev().addClass('checked');
				$input.eq(i).attr('checked',true);
				break;
			}
		}
	},
}
// checkbox
/*
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 checkbox 必填
 * placeholder : input提示信息 // 表单根据rules生成 通过：nsComponent.getPlaceHolder(config)  // 此位置已经设置
 * isOnKeydown : 是否设置快捷键切换焦点
 * readonly : 只读
 * rules : 规则 checkbox 在表单中配置也可以是required 到此位置转化成了checkbox
 * textField : subdata显示值 // 表单默认：text
 * valueField : subdata获取值 // 表单默认：value
 * subdata : array 数组中对象属性 ‘textField’ ‘valueField’ isChecked:是否选中 isDisabled:只读 isInput:   / switch时也必填
 * 没有subdata有url即ajax发送返回值生成选项
 * url : 地址
 * dataSrc : 数据源
 * method : ajax方式
 * displayClass : 多选样式 checkbox/switch
 */
nsUI.checkboxInput = {
	ver:'1.1.0', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 失去焦点是否验证
	isValid:true,
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			isOnKeydown:false,
			readonly:false,
			displayClass:'checkbox', // checkbox/switch
			textField:'text',
			valueField:'value',
			searchName:'',
			searchMode:'none',
			isObjectValue:false,
			ajaxLoading:false,
			listExpression:'',

		}
		nsVals.setDefaultValues(_config, defaultConfig);// 设置listExpression（表达式的默认值）
        if(_config.listExpression === ''){
            _config.isListExpression = false;
        }else{
			_config.isListExpression = true;
		}
	},
	// 验证config 验证在设置完config之后
	validConfig:function(_config, formJson){
		// 只有移动端可以存在搜索框isHaveSearch==true
		var formSource = _config.formSource;
		if(formSource!='halfScreen'&&formSource!='fullScreen'&&formSource!='inlineScreen'&&formSource!='staticData'){
			if(_config.searchMode!='none'){
				console.error('只有移动端可以存在搜索框_config.searchMode=none');
				console.error(_config);
				return false;
			}
		}
		// 验证 如果组件不是ajax请求列表不能设置搜索
		if(typeof(_config.url)=='undefined' && _config.searchMode!='none'){
			console.error('只有ajax调用情况下才可以设置搜索功能');
			console.error(_config);
			return false;
		}
		// 配置的value值是否与isObjectValue规定要配置的值一致
		if(_config.value!=''){
			var isError = false;
			if(_config.isObjectValue==true && typeof(_config.value)!='object'){
				isError = true;
			}
			if(_config.isObjectValue==false && typeof(_config.value)=='object'){
				if($.isArray(_config.value)&&_config.value.length>0){
					isError = typeof(_config.value[0])=='object'?true:false;
				}
			}
			if(isError){
				console.error('配置的value值与isObjectValue规定要配置的值不一致');
				console.error(_config);
				return false;
			}
		}
		/*****textFieldId 对应的字段配置******/
		if(_config.textFieldId){
			// 表单所有字段配置
			var configJson = formJson.component;
			var contentFieldConfig = configJson[_config.textFieldId];
			if(typeof(contentFieldConfig)!='object'){
				console.error('显示字段配置错误textFieldId：'+contentId);
				console.error(_config);
				console.error(configJson);
				return false;
			}
			_config.contentFieldConfig = contentFieldConfig;
		}
		/*******判断参数是否配置正确******/
		if(!_config.isObjectValue){
			if(_config.searchMode!='none' && typeof(_config.textFieldId)!='string'){
				console.error('字段配置错误，无法正确显示值');
				console.error(_config);
				return false;
			}
		}
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(_config){
		this.setDefault(_config); // 设置config的默认值
		var configUrl = _config.url;
		if(typeof(configUrl)=='function'){
			configUrl = _config.url();	//如果url链接是个function
		}
		_config.configUrl = configUrl;
		// 判断是否有搜索框
		switch(_config.searchMode){
			case 'client':
			case 'server':
				// 设置默认搜索参数
				if(!_config.isInit){
					var isHaveSearchKey = false;
					_config.ajaxConfig = typeof(_config.ajaxConfig)=='object'?_config.ajaxConfig:{};
					_config.ajaxConfig.data = typeof(_config.ajaxConfig.data)=='object'?_config.ajaxConfig.data:{};
					for(var key in _config.ajaxConfig.data){
						if(_config.ajaxConfig.data[key]=='{search}'){
							isHaveSearchKey = true;
						}
					}
					if(!isHaveSearchKey){
						_config.ajaxConfig.data.keyword = '{search}';
					}
				}
				// 搜索框代码
				_config.searchBeforeHtml = '<div class="mobile-input-search-control">'
												+ '<i class="fa-search"></i>'
												+ '<span>'+_config.searchName+'</span>'
											+ '</div>'
				_config.searchAfterHtml = '<div class="input-group">'
												+ '<span class="input-group-addon">'
													+ '<i class="fa-search"></i>'
												+ '</span>'
												+ '<input class="form-control" placeholder="'+_config.searchName+'" type="search">'
												+ '<div class="input-group-btn hidden" id="clearInput">'
													+ '<button class="btn btn-icon">'
														+ '<i class="fa-times-circle"></i>'
													+ '</button>'
												+ '</div>'
											+ '</div>'
											+ '<div class="btn-group">'
												+ '<button class="btn btn-icon">'
													+ '<i class=""></i>'
													+ '取消'
												+ '</button>'
											+ '</div>'
				break;
		}
		if(_config.configUrl){
			// ajax调用时配置当前表单所有字段的配置 原因：为了格式化data中有关联参数的情况
			// _config.components = formJson.component;
		}
		// 判断value值是否需要转化
		if(typeof(_config.value)=='object'){
			if($.isEmptyObject(_config.value)){

			}
			if(!$.isArray(_config.value)){
				_config.value = [_config.value];
			}
		}
		// isSendAjax 是否需要发送ajax请求
		if(typeof(_config.url)=='undefined'){
			_config.isSendAjax = false;
			_config.ajaxLoading = false;
			_config.isNeedAjax = false;// 是否需要ajax
		}else{
			_config.isNeedAjax = true;// 是否需要ajax
			if(!_config.isObjectValue){
				if(typeof(_config.textFieldId)!='string'){
					_config.isSendAjax = true;
					_config.ajaxLoading = true;
				}else{
					_config.isSendAjax = false;
					_config.ajaxLoading = false;
				}
			}else{
				_config.isSendAjax = false;
				_config.ajaxLoading = false;
			}
		}
        // 格式化outputFields
        if(typeof(_config.outputFields) == "string" && _config.outputFields.length > 0){
            _config.outputFields = JSON.parse(_config.outputFields);
        }
	},
	// 获取value对应的list值 用于保存isObjectValue=true的情况
	getValueList:function(_config, values){
		var valueList = [];
		// var values = valueIds.split(',');
		for(var valI=0;valI<values.length;valI++){
			for(var i=0;i<_config.subdata.length;i++){
				if(_config.subdata[i][_config.valueField]==values[valI]){
					valueList.push(_config.subdata[i]);
					break;
				}
			}
		}
		if(valueList.length==0){
			valueList = '';
		}
		return valueList;
	},
	// 获取文本值 数组 value值存在是返回value对应的文本值 否则返回的是选中的value数组
	getContent:function(_config, value){
		/*
		 * _config 	: object 	组件配置
		 * value 	: string 	当前value值
		 *
		 * typeof(value)=="object" 		表示 通过给定的value返回text值
		 * typeof(value)=="object" 		表示 通过给定的value返回text值
		 * 								$.isArray(value) = true 		表示 多选
		 * 								判断value每一项是否是对象 如果是对象 根据value返回text值
		 * 								如果不是对象表示 通过给定的value返回text值
		 * typeof(value)!="undefined" 	表示 通过给定的value查询text值
		 * typeof(value)=="undefined" 	表示根据 _config.value 获取text值
		 * typeof(value)!="undefined" 	表示 通过给定的value查询text值
		 * typeof(value)=="undefined" 	表示根据 _config.value 获取text值
		 */
		var text = '';
		if(typeof(value)=="string" && value.indexOf(',')){
			value = value.split(',');
		}
		if(typeof(value)=="string"){
			for(var i=0;i<_config.subdata.length;i++){
				if(_config.subdata[i][_config.valueField]==value){
					text = _config.subdata[i][_config.textField];
					break;
				}
			}
			return text;
		}
		if(typeof(value)=="object"){
			if($.isArray(value)){
				for(var i=0;i<value.length;i++){
					if(typeof(value[i])=="object"){
						text += value[i][_config.textField];
					}else{
						for(var j=0;j<_config.subdata.length;j++){
							if(_config.subdata[j][_config.valueField]==value[i]){
								text += _config.subdata[j][_config.textField] + ',';
								break;
							}
						}
						text = text.substring(0,text.length-1);
					}
				}
			}else{
				return value[_config.textField];
			}
		}
		if(typeof(_config.value)=='object'){
			if($.isArray(_config.value)){
				value = $.extend(true,[],_config.value);
			}else{
				value = $.extend(true,{},_config.value);
			}
		}else{
			value = _config.value;
		}
		// 通过isChecked选中的value值
		// isObjectValue==true 表示value存储的数据包括text文本是对象模式
		// isObjectValue==false 表示只保存value值
		var checkedValue = [];
		for(var i=0;i<_config.subdata.length;i++){
			if(_config.subdata[i].isChecked){
				var checkedVal = _config.subdata[i][_config.valueField];
				var checkedTex = _config.subdata[i][_config.TextField];
				var checkedObj = {};
				checkedObj[_config.valueField] = checkedVal;
				checkedObj[_config.TextField] = checkedTex;
				checkedValue.push(checkedObj);
				break;
			}
		}
		// 如果value不是数组改成数组模式进行处理
		if(!$.isArray(value)){
			var sourValue = value;
			value = [];
			if(sourValue == ''){
			}else{
				value.push(sourValue);
			}
		}
		// 格式化value值 value没有保存text值 重新设置value
		var formatValue = [];
		for(var valI=0;valI<value.length;valI++){
			if(typeof(value[valI])!='object'){
				var valueVal = value[valI];
				var valueText = '';
				var isHave = false;
				for(var i=0;i<_config.subdata.length;i++){
					if(_config.subdata[i][_config.valueField]==valueVal){
						isHave = true;
						valueText = _config.subdata[i][_config.textField];
						break;
					}
				}
				if(isHave){
					var valObj = {};
					valObj[_config.valueField] = valueVal;
					valObj[_config.textField] = valueText;
					formatValue.push(valObj);
				}else{
					console.error('value值设置错误');
					console.error(value);
					console.error(_config);
				}
				

			}
		}
		// 合并value值
		for(var checkI=0;checkI<checkedValue.length;checkI++){
			var isNotHave = true; // 是否不存在在value中
			var checkVal = checkedValue[checkI][_config.valueField];
			for(var valI=0;valI<formatValue.length;valI++){
				var valueVal = formatValue[valI][_config.valueField];
				if(checkVal == valueVal){
					isNotHave = false;
					break;
				}
			}
			if(isNotHave){
				formatValue.push(checkedValue[checkI]);
			}
		}
		var contentArr = [];
		// 查询选中值text
		for(var valI=0;valI<formatValue.length;valI++){
			var valueText = formatValue[valI][_config.textField];
			var valueVal = formatValue[valI][_config.valueField];
			// text += valueText + ',';
			var conObj = {
				text:valueText,
				value:valueVal,
			};
			contentArr.push(conObj);
		}
		// return text;
		return contentArr;
	},
	// 获取文本值的html代码
	getContentHtml:function(_config, content){
		// var content = this.getContent(_config);
		// 判断是否设置content 不需要经过subdata获得content
		// 行内模式有搜索框时content是给出的 不经过subdata 因为content是通过隐藏字段的value值获得的
		// content的模式 [{text:'',value:''}]
		content = typeof(content)=='undefined'?this.getContent(_config):content;
		content = (typeof(content)=='string' || typeof(content)=='number')?[{text:content}]:content;
		var html = '';
		if($.isArray(content)&&content.length>0){
			// 获取text值
			var text = '';
			for(var i=0;i<content.length;i++){
				text += content[i].text + ',';
			}
			text = text.substring(0,text.length-1);
			switch(_config.formSource){
				case 'halfScreen':  	// 半屏
				case 'fullScreen':  	// 全屏
					var tagConfig = {
						type:'show',
						text:text,
						config : _config
					}
					html = nsComponent.getTagHtml(tagConfig);
					break;
				case 'inlineScreen':   	// 行内
					for(var i=0;i<content.length;i++){
						var value = content[i].value;
						var text = content[i].text;
						html += '<div class="show-content">'
									+ '<span class="show-text" value="'+value+'">'
										+ text
									+ '</span>'
									+ '<div class="show-btn">'
										+ '<button class="btn btn-icon">'
											+ '<i class="fa-times-circle"></i>'
										+ '</button>'
									+ '</div>'
								+'</div>'
					}
					break;
				case 'staticData': 		// 功能
					var tagConfig = {
						type:'acts',
						text:text,
						acts:_config.acts,
						config : _config
					}
					if(_config.seat){
						tagConfig.seat = _config.seat;
					}
					if(_config.isShowText){
						tagConfig.isShowText = _config.isShowText;
					}
					if(_config.iconsName){
						tagConfig.iconsName = _config.iconsName;
					}
					html = nsComponent.getTagHtml(tagConfig);
					break;
				default: 				// pc
					break;
			}
		}
		return html;
	},
	// subdata生成的html
	getOptionsHtml:function(_config){
		var html = '';
		var valueStr = nsComponent.getValue(_config);
		for(var checkboxI = 0; checkboxI<_config.subdata.length; checkboxI++){
			var text = _config.subdata[checkboxI][_config.textField];
			var value = _config.subdata[checkboxI][_config.valueField];
			// textField/valueField不存在不显示
			if(typeof(text)=="undefined" || typeof(value)=="undefined"){
				console.error('选项配置错误---'+checkboxI);
				console.error(_config.subdata[checkboxI]);
				console.error(_config);
				continue;
			}
			var checkedAttr = '';
			var valueText = typeof(value)=='number'?value.toString():value;
			if($.isArray(valueStr)){
				// 是数组，有多个选中项
				if(valueStr.length > 0){
					if($.inArray(valueText,valueStr) > -1||$.inArray(value,valueStr) > -1){
						// 在数组中存在此元素
						checkedAttr = 'checked';
					}
				}
			}else if(typeof(valueStr) == 'string' || typeof(valueStr)=='number'){
				// 默认值是个字符串
				if(valueStr === ''){
					checkedAttr = _config.subdata[checkboxI].isChecked ? 'checked':'';
				}else{
					checkedAttr = valueText == valueStr||value == valueStr ? 'checked' : '';
				}
			}else{
				checkedAttr = _config.subdata[checkboxI].isChecked ? 'checked':'';
			}
			var disabledAttr = _config.subdata[checkboxI].isDisabled ? 'disabled':'';
			if(_config.readonly == true){
				disabledAttr = 'disabled';
			}
			//lyw _config.displayClass 默认checkbox-inline样式 特殊：switch-inline
			var labelHtml = '<label class="'+_config.displayClass+'-inline '+disabledAttr+' '+checkedAttr+'" for="'+ _config.fullID + '-' + checkboxI +'">'
								+ text
							+'</label>';
			if(_config.isListExpression){
				labelHtml = _config.listExpression;
				for(var key in _config.subdata[checkboxI]){
					labelHtml = labelHtml.replace('{{' + key + '}}', _config.subdata[checkboxI][key]);
				}
				var $labelHtml = $(labelHtml);
				$labelHtml.addClass(_config.displayClass);
				$labelHtml.addClass(disabledAttr);
				$labelHtml.addClass(checkedAttr);
				$labelHtml.attr('for', _config.fullID + '-' + checkboxI);
				labelHtml = $labelHtml.prop('outerHTML');
			}
			html += labelHtml
					+'<input id="'+ _config.fullID +'-'+checkboxI+'"'
						+'name="'+_config.fullID+'"'
						+' ns-id="'+_config.id+'"'
						+' nstype="'+_config.type+'" type="checkbox" '
						+checkedAttr+' '+disabledAttr+'  class="checkbox-options '+checkedAttr+'" '
						+' value="'+value+'" >';	
		}
		if(_config.isInput){
			html += '<input type="text" class="checkbox-input form-control" id="'+_config.fullID+'-input" />';
		}
		return html;
	},
	// 移动端获取选择列表
	getMobileListHtml:function(_config){
		var html = this.getOptionsHtml(_config);
		// 移动端 全屏模式下将所有列表包装在一个整体的div中
		var formSource = _config.formSource;
		var listClass = _config.type+'-list';
		if(_config.searchMode=='client'||_config.searchMode=='server'){
			listClass += ' list-search';
		}
		html =  '<div class="'+listClass+'" name="'+ _config.fullID +'-list">'
					+ html
				+ '</div>';
		// 如果组件是全屏模式并且isHaveSearch（是否允许异步搜索）是true
		// 设置搜索框
		if(_config.searchMode != 'none'){
			html = '<div class="mobile-input-search" name="'+ _config.fullID +'-search">'
						+ _config.searchBeforeHtml
					+ '</div>'
					+ html;
		}
		return html;
	},
	// 获得字段html
	getHtml:function(_config, formJson){
		this.setConfig(_config, formJson);
		var isTrue = this.validConfig(_config, formJson); // 验证config配置是否
		if(isTrue == false){
			return '';
		}
		// this.setConfig(_config);
		var html = '';
		if(_config.configUrl){
			//如果存在url链接
			// 判断是否发送ajax请求
			if(_config.isSendAjax==false){
				var content = '';
				// 判断当前 组件是否设置内容值 若没有通过textFieldId对应的组件获得
				var value = _config.value;
				if(_config.isObjectValue){
					if($.isArray(value)){
						for(var valI=0;valI<value.length;valI++){
							var valObj = value[valI];
							if(typeof(valObj[_config.textField])=='undefined'){
								console.error('属性textField配置错误');
								console.error(_config.textField);
								console.error(_config);
							}else{
								content += valObj[_config.textField] + ',';
							}
						}
						content = content.substring(0,content.length-1);
					}else{
						content = '';
					}
				}else{
					content = _config.contentFieldConfig.value;
					content = typeof(content) == 'undefined'?'':content;
				}
				html = this.getContentHtml(_config, content);
				return html;
			}else{
				html = nsComponent.getLoadingHtml();
				html = '<div id="'+_config.fullID+'-loading">'+html+'</div>';
				nsComponent.getAjaxSubdata(_config, formJson.component, function(resConfig, isSuccess, errorInfo){
					if(isSuccess){
						// 成功后 补全html元素 初始化方法 
						switch(resConfig.formSource){
							case 'halfScreen':
							case 'fullScreen':
							case 'inlineScreen':
							case 'staticData':
								$('#'+resConfig.fullID+'-loading').parent().html(nsUI.checkboxInput.getContentHtml(resConfig));//填充元素
								break;
							default:
								$('#'+resConfig.fullID+'-loading').parent().html(nsUI.checkboxInput.getOptionsHtml(resConfig)); 	//填充元素										 			//触发事件
								break;
						}
						nsUI.checkboxInput.init(resConfig); //触发事件
					}else{
						// 移除正在加载 旋转圈
						$('#'+resConfig.fullID+'-loading').remove();
						resConfig.subdata = [];
						nsUI.radioInput.init(resConfig); //触发事件
					}
				});
			}
		}else{
			//不存在的情况直接赋值读取数据
			if($.isArray(_config.subdata)){
				switch(_config.formSource){
					case 'halfScreen':  	// 半屏
					case 'fullScreen':  	// 全屏
					case 'inlineScreen':   	// 行内
					case 'staticData': 		// 功能
						html = nsUI.checkboxInput.getContentHtml(_config);
						break;
					default: 				// pc
						html = nsUI.checkboxInput.getOptionsHtml(_config);
						break;
				}
			}
		}
		return html;
	},
	// 初始化pc
	initPc:function(config){
		var $input = $('[name="'+config.fullID+'"]');
		config.$input = $input;
		if(config.readonly == false){
			$input.off('change');
			$input.on('change', {config:config}, function(ev){
				$(this).prev().toggleClass('checked');
				var config = ev.data.config;
				var value = $(this).val();
				$(this).parent().children('label.has-error').remove();
				var config = ev.data.config;
				// switch changhandler事件 判断如果复选框只有一个选项 认为是switch 选中状态为1不选中为0 和getFormJSON的判断一样 lyw
				if(config.subdata){
					if(config.subdata.length==1){
						var isChecked = $(this).is(':checked');
						if(isChecked){
							value = 1;
						}else{
							value = 0;
						}
					}
				}
				if(typeof(config.changeHandler)=='function'){
					config.changeHandler(value,$(this));
				}
				//模拟一个公用的事件回调
				if(typeof(config.commonChangeHandler)=='function'){
					var obj = {
						value:value,
						dom:$(this),
						type:'checkbox',
						id:config.id,
						config:config
					}
					config.commonChangeHandler(obj);
				}
			})
			// 切换焦点
			if(typeof(config.enterFocusField)=='string'){
				// 表单
				config.switchFocus = nsComponent.getFieldFocusMethod(config.formID,config.enterFocusField);
			}
			// 是否支持快捷键 下一个获得焦点 默认不支持
			if(config.isOnKeydown){
				this.setSwitchShortcutKey(config);
			}
			if(config.isInput){
				var $textInput = $('#'+config.fullID+'-input');
				$textInput.on('mousedown',function(ev){
					nsUI.checkboxInput.isValid = false;
				})
				$textInput.on('focus',function(ev){
					nsUI.checkboxInput.isValid = true;
				})
				$textInput.on('blur',{_this:this,_config:config},function(ev){
					var _this = ev.data._this;
					var _config = ev.data._config;
					var isHaveFocus = nsUI.checkboxInput.isValid;
					if(isHaveFocus){
						_this.getValue(_config);
					}
				})
				config.$input.parent().on('mousedown',function(ev){
					nsUI.checkboxInput.isValid = false;
				})
				config.$input.parent().on('focus',function(ev){
					nsUI.checkboxInput.isValid = true;
				})
				$textInput.on('change',{config:config}, function(ev){
					var $this = $(this);
					var valSrc= $.trim($this.val());
					var config = ev.data.config;
					if(typeof(config.changeHandler)=='function'){
						config.changeHandler(valSrc,$this,ev);
					}
					if(typeof(config.commonChangeHandler)=='function'){
						var obj = {
							value:valSrc,
							dom:$this,
							type:'text',
							id:config.id,
							config:config
						}
						config.commonChangeHandler(obj);
					}
				});
			}
			//失去焦点
			if(config.isSetBlur){
				this.setBlur(config);
			}
			// 设置焦点
			if(config.isSetFocus){
				this.setFocus(config);
			}
			// 失去焦点
			config.blur = function(){
				config.$input.parent().blur();
			}
			// 获得焦点
			config.focus = function(){
				config.$input.parent().focus();
			}
			return config;
		}else{
			$input.off('change');
		}
	},
	// 初始化移动端
	initMobile:function(config){
		// formSource 表单类型标识
		var formSource = config.formSource;
		// 半屏模式添加选中标记
		if(formSource == 'halfScreen'){
			// 判断是否存在默认值 存在选中 添加显示样式
			if(config.$formItem.children().length>0){
				config.$formGroup.addClass('checked');
			}
		}
		// 功能模式 如果没有value值 隐藏该项配置标签
		if(formSource == 'staticData'){
			// 判断是否存在默认值 存在选中 添加显示样式
			if(config.$formItem.children().length == 0){
				config.$formGroup.addClass('hidden');
			}
		}
		// 只读模式不用初始化方法
		if(config.readonly==true){
			return;
		}
		// 选择生成容器方法名
		var containerFuncName = false;
		switch(formSource){
			case 'halfScreen':  	// 半屏
				containerFuncName = 'mobileHalfContainer';
				config.$calRelPositionContainer = config.$container; // 计算相对位置的容器 用于显示半屏容器
				break;
			case 'fullScreen':  	// 全屏
				containerFuncName = 'mobileFullContainer';
				break;
			case 'inlineScreen': 	// 行内
				containerFuncName = 'mobileFullContainer';
				// 行内模式添加删除事件
				if(config.$formGroup.children('.form-btn').length>0){
					var $button = config.$formGroup.children('.form-btn').children();
					$button.off('click');
					$button.on('click', {config:config}, function(ev){
						ev.stopImmediatePropagation();
						var config = ev.data.config;
						config.showState = 'more'; // 改变字段显示位置
						$(this).closest('.form-td[mindjetfieldposition="field-more"]').remove();
					});
				}
				// 添加value列表删除按钮事件
				var $actsList = config.$formItem.children();
				if($actsList.length==0){
					break;
				}
				var $button = $actsList.children('.show-btn').children('button');
				$button.off('click');
				$button.on('click', {config:config}, function(ev){
					ev.stopImmediatePropagation();
					var $this = $(this);
					var $spanContent = $this.parent().prev(); // 内容的html容器
					var value = $spanContent.attr('value');
					var _config = ev.data.config; // 组件配置
					var conValue = _config.value; // 组件的value值
					if(!$.isArray(conValue)){
						if(conValue==value){
							_config.value = '';
						}
					}else{
						for(var i=0;i<conValue.length;i++){
							var isThis = false; // 是否是当前点中的value值
							if(typeof(conValue[i])=='object'){
								if(conValue[i][_config.valueField] == value){
									isThis = true;
								}
							}else{
								if(conValue[i] == value){
									isThis = true;
								}
							}
							if(isThis){
								conValue.splice(i,1);
							}
						}
					}
					nsForm.edit([_config], _config.formID);
				});
				break;
			case 'staticData':    	// 功能
				break;
		}
		if(containerFuncName != false){ 
			// 点击label 弹出弹框 显示选项
			config.$formGroup.off('click');
			config.$formGroup.on('click', {config:config}, function(ev){
				var config = ev.data.config;
				config.oldValue = config.value;
				nsUI.checkboxInput.showContainer(config, containerFuncName);
			})
		}
		if(typeof(config.oldValue)!='undefined'&&config.oldValue!=config.value){
			function changeFunc(){
				if(typeof(config.changeHandler)=='function'){
					config.changeHandler(config.value, config);
				}
				if(typeof(config.commonChangeHandler)=='function'){
					var obj = {
						value:config.value,
						dom:config.$formItem,
						type:'checkbox',
						id:config.id,
						config:config
					}
					config.commonChangeHandler(obj);
				}
			}
			if(config.oldValue.length!=config.value.length){
				changeFunc();
			}else{
				for(var i=0;i<config.oldValue.length;i++){
					var isHave = false;
					for(var j=0;j<config.value.length;j++){
						if(config.value[j] == config.oldValue[i]){
							isHave = true;
							break;
						}
					}
					if(!isHave){
						changeFunc();
						break;
					}
				}
			}
			delete config.oldValue;
		}
	},
	// 显示半屏/全屏容器
	showContainer:function(config, containerFuncName){
		function initContainer(_checkboxHtml){
			nsComponent[containerFuncName].show(config, _checkboxHtml, function(resConfig, isSuccess){
				if(isSuccess == true){
					// 确认
					nsUI.checkboxInput.confirmHandler(resConfig);
					return;
				}
				if(isSuccess == false){
					// 清除
					nsUI.checkboxInput.clearHandler(resConfig);
					return;
				}
				if(isSuccess == 'cancel'){
					// 取消
					nsUI.checkboxInput.cancelHandler(resConfig);
					return;
				}
			})
			nsUI.checkboxInput.initCheckbox(config);
		}
		// 判断是否存在搜索 存在搜索点击先调取ajax
		var checkboxHtml = '';
		if(!config.isSendAjax && config.isNeedAjax){
			// 需要发送ajax并且没有发送呢
			if(config.searchMode != 'none'){
				config.btnsType = 'search';
			}
			var components = nsFormBase.data[config.formID].config.component;
			nsComponent.getAjaxSubdata(config, components, function(resConfig, isSuccess, errorInfo){
				if(isSuccess){
					checkboxHtml = nsUI.checkboxInput.getMobileListHtml(resConfig);
					initContainer(checkboxHtml);
				}else{
					console.error('ajax请求错误');
					console.error(resConfig);
				}
			});
		}else{
			checkboxHtml = nsUI.checkboxInput.getMobileListHtml(config);
			initContainer(checkboxHtml);
		}
	},
	// 初始化
	init:function(config,formJson){
		if(config.ajaxLoading){
			// 正在加载
			if(config.formSource!="halfScreen"&&config.formSource!="fullScreen"&&config.formSource!="inlineScreen"&&config.formSource!="staticData"){
				var $dom = $('[name="'+config.fullID+'"]');
				nsComponent.init.setCommonAttr($dom,config);
			}
			return;
		}
		switch(config.formSource){
			case 'halfScreen':  // 半屏
			case 'fullScreen':  // 全屏
			case 'inlineScreen':  	// 行内
			case 'staticData':    // 功能
				// 移动端记录jQuery对象
				var $label = $('label[for="'+config.fullID+'"]');
				config.$label = $label;
				config.$formGroup = config.$label.parent(); // label对象的父对象
				config.$container = config.$label.closest('.form-td');
				config.$formItem = config.$formGroup.children('.form-item');
				nsUI.checkboxInput.initMobile(config);
				break;
			default:
				// pc端初始化
				var $dom = $('[for="'+config.fullID+'"]');
				nsComponent.init.setCommonAttr($dom,config);
				nsUI.checkboxInput.initPc(config,formJson);
				break;
		}
	},
	// 刷新选项列表
	refreshCheckList:function(_config){
		_config.sourceValue = _config.value;
		_config.value='';
		var components = nsFormBase.data[_config.formID].config.component;
		nsComponent.getAjaxSubdata(_config, components, function(resConfig, isSuccess, errorInfo){
			if(isSuccess){
				var html = nsUI.checkboxInput.getOptionsHtml(resConfig);
				var $listContainer = $('[name="'+resConfig.fullID+'-list"]');
				$listContainer.html(html);
				nsUI.checkboxInput.setMobileListEvent(resConfig);
			}else{
				console.error('ajax刷新错误');
				console.error(resConfig);
			}
		});
	},
	// 设置移动端选项列表事件
	setMobileListEvent:function(config){
		var $input = $('[name="'+config.fullID+'"]');
		config.$input = $input;
		var $label = $input.prev();
		$label.off('click');
		$label.on('click', {config:config}, function(ev){
			var $this = $(this);
			var config = ev.data.config;
			var $input = config.$input;
			if($this.hasClass('checked')){
				$this.removeClass('checked');
			}else{
				$this.addClass('checked');
			}
		});
	},
	// 获取搜索的jQuery对象
	getSearchJQObj:function(config, type){
		/*
		 * config : 组件配置
		 * type : 搜索显示样式 before(开始显示样式)/after(点击后显示样式)
		 */
		if(type == 'before'){
			// 开始搜所框容器对象的事件添加
			var $searchBefore = $(config.searchBeforeHtml);
			// 搜索框点击切换搜索事件 获取焦段事件
			$searchBefore.off('click');
			$searchBefore.on('click', {config:config}, function(ev){
				var _config = ev.data.config;
				var $searchContainer = _config.$searchContainer;
				var $searchAfter = nsUI.checkboxInput.getSearchJQObj(_config, 'after');
				$searchContainer.html($searchAfter);
				$searchContainer.find('input').focus();
			});
			return $searchBefore;
		}
		if(type == 'after'){
			// 点击搜所框之后容器对象的事件添加
			var $searchAfter = $(config.searchAfterHtml);
			var $btn = $searchAfter.eq(1);
			var $inputContainer = $searchAfter.eq(0);
			// 取消按钮事件
			$btn.children('button').off('click');
			$btn.children('button').on('click', {config:config}, function(ev){
				var _config = ev.data.config;
				var $searchContainer = _config.$searchContainer;
				var $searchBefore = nsUI.checkboxInput.getSearchJQObj(_config, 'before');
				$searchContainer.html($searchBefore);
				var searchValueName = _config.$searchContainer.attr('contentId');
				var searchKeyName = _config.searchKeyName;
				delete _config.ajaxConfig.data[searchKeyName];
				nsUI.checkboxInput.refreshCheckList(_config);
			});
			// input的keyup事件
			$inputContainer.children('input').off('keyup');
			$inputContainer.children('input').on('keyup', function(ev){
				var val = $(this).val();
				if(val.length>0){
					$inputContainer.children('.input-group-btn').removeClass('hidden');
				}else{
					$inputContainer.children('.input-group-btn').addClass('hidden');
				}
			});
			// input中的清除按钮
			$inputContainer.children('.input-group-btn').children('button').off('click');
			$inputContainer.children('.input-group-btn').children('button').on('click', function(ev){
				$inputContainer.children('input').val('');
			});
			return $searchAfter;
		}
	},
	// 移动端初始化单选事件
	initCheckbox:function(config){
		if(config.readonly==true){
			return;
		}
		this.setMobileListEvent(config);
		// 是否存在搜索框
		if(config.searchMode == 'none'){
			return;
		}
		// 存在搜索框
		var $searchContainer = $('[name="'+config.fullID+'-search"]'); // 搜索框容器
		config.$searchContainer = $searchContainer;
		var $search = $searchContainer.children('.mobile-input-search-control');
		// 搜索框点击切换搜索事件 获取焦段事件
		$search.off('click');
		$search.on('click', {config:config}, function(ev){
			var _config = ev.data.config;
			var $searchContainer = _config.$searchContainer;
			var $searchAfter = nsUI.checkboxInput.getSearchJQObj(_config, 'after');
			$searchContainer.html($searchAfter);
			$searchContainer.find('input').focus();
		});
		var containerName = config.containerName;
		var fullContainer = nsComponent.mobileFullContainer.containers[containerName];
		fullContainer.$container.off('keyup');
		fullContainer.$container.on('keyup', {config:config}, function(ev){
			var keyCode = ev.keyCode;
			if(keyCode==13){
				var _config = ev.data.config;
				_config.$searchContainer.find('input').focus();
				var searchValue = _config.$searchContainer.find('input').val();
				var searchKeyName = _config.searchKeyName;
				if(searchValue){
					// _config.data[searchKeyName] = searchValue;
					if(typeof(_config.ajaxConfig)=="object"){
						_config.ajaxConfig.data[searchKeyName] = searchValue;
					}
					nsUI.checkboxInput.refreshCheckList(_config);
				}
			}
		});
		$(document).off('keydown');
		$(document).on('keydown',function(event){
			switch(event.keyCode){
				case 13:return false;break;
			}
		});
	},
	// 取消
	cancelHandler:function(_config){
		if(_config.sourceValue){
			// 搜索过或者清除过才会有这个值 
			_config.value = _config.sourceValue;
			delete _config.sourceValue;
		}
	},
	// 清除
	clearHandler:function(_config){
		// 根据按钮类型判断清除执行的操作
		if(_config.btnsType=='search'){
			// 清空列表选中值
			_config.sourceValue = typeof(_config.sourceValue)=='undefined'?_config.value:_config.sourceValue;
			_config.value = '';
			var html = nsUI.checkboxInput.getOptionsHtml(_config);
			var $listContainer = $('[name="'+_config.fullID+'-list"]');
			$listContainer.html(html);
			nsUI.checkboxInput.setMobileListEvent(_config);
		}else{
			_config.value = '';
			var edit = [_config];
			// 是否存在搜索框
			// 存在搜索框 说明有与它关联的字段配置 设置关联配置的value
			if(_config.contentFieldConfig){
				var contentConfig = _config.contentFieldConfig;
				contentConfig.value = '';
				edit.push(contentConfig);
			}
			// 删除原始值 搜索过才会有这个值
			delete _config.sourceValue;
			nsForm.edit(edit, _config.formID);
		}
	},
	// 确认
	confirmHandler:function(_config){
		// 删除原始值 搜索过才会有这个值
		delete _config.sourceValue;
		// 刷新value
		var value = this.getOptionsValue(_config);
		if(_config.isObjectValue){
			if(!$.isArray(value)){
				value = [value];
			}
			_config.value = this.getValueList(_config, value);
		}else{
			_config.value = value;
		}
		var edit = [_config];
		// 是否存在搜索框
		// 存在搜索框 说明有与它关联的字段配置 设置关联配置的value
		if(_config.contentFieldConfig){
			var text = this.getContent(_config, value);
			var contentConfig = _config.contentFieldConfig;
			contentConfig.value = text;
			edit.push(contentConfig);
		}
		nsForm.edit(edit, _config.formID);
	},
	// 设置焦点
	setFocus:function(_config){
		_config.$input.parent().attr('tabindex','0');
		// _config.$input.parent().focus();
	},
	// 设置失去焦点
	setBlur:function(_config){
		var _this = this;
		_config.$input.parent().off('blur',  _this.setBlurHandler);
		_config.$input.parent().on('blur', {_config:_config,_this:_this}, _this.setBlurHandler);
	},
	// 设置失去焦点的方法
	setBlurHandler:function(event){
		var _config = event.data._config;
		var _this = event.data._this;
		var isHaveFocus = nsUI.checkboxInput.isValid;
		if(isHaveFocus){
			_this.getValue(_config);
		}
	},
	// 设置切换字段快捷键
	setSwitchShortcutKey:function(_config){
		var _this = this;
		// _config.$input.parent().attr('tabindex','0');
		_config.$input.parent().off('keydown', _this.switchShortcutKeyHandler)
		_config.$input.parent().on('keydown', {_config:_config}, _this.switchShortcutKeyHandler)
	},
	// 切换字段方法
	switchShortcutKeyHandler:function(event){
		var _config = event.data._config; // 当前字段配置
		// var $labelList = _config.$input.parent().children('label'); // 字段中所有选项的jQuery对象
		var $input = _config.$input; // 字段中所有选项的jQuery对象
		var checkedIndex = 0; // 选中的位置
		var isHaveChecked = false; // 是否存在选中
		for(var i=0;i<$input.length;i++){
			if($input.eq(i).is(':checked')){
				checkedIndex = i;
				isHaveChecked = true;
				break;
			}
		}
		switch(event.keyCode){
			// 回车
			case 13:
				if(typeof(_config.switchFocus)=='function'){
					// 存在切换方法
					_config.switchFocus();
				}else{
					_config.blur();
				}
				// 如果有失去焦点配置方法 执行 失去焦点方法
				if(typeof(_config.blurHandler)=='function'){
					_config.blurHandler(formJson);
				}
				break;
			// 左
			case 37:
			// 上
			case 38:
				var isRemove = false; // 第一个选中时不在上移
				if(checkedIndex==0){
					$input.removeAttr('checked');
					$input.prev().removeClass('checked');
				}else{
					isRemove = true;
					checkedIndex = checkedIndex-1;
				}
				if(isRemove){
					$input.removeAttr('checked');
					$input.prev().removeClass('checked');
					$input.eq(checkedIndex).attr('checked',true);
					$input.eq(checkedIndex).prev().addClass('checked');
					// $input.eq(checkedIndex).change();
				}
				break;
			// 右
			case 39:
			// 下
			case 40:
				var isRemove = true;
				if(checkedIndex==$input.length-1 || !isHaveChecked){
					if(checkedIndex==$input.length-1){
						isRemove = false;
						var $childrenInput = _config.$input.parent().children('input');
						if($childrenInput.length>$input.length){
							$input.removeAttr('checked');
							$input.prev().removeClass('checked');
							nsUI.checkboxInput.isValid = false;
							$childrenInput.eq(checkedIndex+1).focus();
						}
					}
					if(!isHaveChecked){
						isRemove = true;
					}
				}else{
					checkedIndex = checkedIndex+1;
				}
				if(isRemove){
					$input.removeAttr('checked');
					$input.prev().removeClass('checked');
					$input.eq(checkedIndex).attr('checked',true);
					$input.eq(checkedIndex).prev().addClass('checked');
					// $input.eq(checkedIndex).change();
				}
				break;
		}
	},
	// 验证数据 设置报错信息
	validate:function(_config, inputValueStr){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			// 单选只支持必填 radio 
			var isLegal = true;
			var errorKey = '';
			if(_config.rules.indexOf('checkbox')>-1){
				errorKey = 'checkbox';
				isLegal = nsComponent.getIsValidate(inputValueStr,errorKey); // 是否合法
			}
			if(!isLegal){
				var errorInfoStr = validateMsg[errorKey];
				var errorConfig = {
					alertStr:_config.label+i18n.getValueError,
					popStr:errorInfoStr,
					stateType:'warning',
					$container:_config.$input.parent(),
					$input:_config.$input.parent(),
				}
				nsComponent.showState(errorConfig);
				return false;
			}
		}
		return true;
	},
	// 获取选项值
	getOptionsValue:function(_config, isValid){
		var inputValueStr = '';
		var checkboxObj = _config.$input;
		if(checkboxObj.length == 1){
			// if($(checkboxObj).is(':checked')){
			var $label = checkboxObj.eq(0).prev();
			if($label.hasClass('checked')){
				inputValueStr = 1;
			}else{
				inputValueStr = 0;
			}
		}else{
			var inputStr = '';
			if(_config.isInput){
				inputStr = $('#'+_config.fullID+'-input').val();
			}
			var chkArr = [];
			for(var i=0;i<checkboxObj.length;i++){
				// if(checkboxObj.eq(i).is(':checked')){
				var $label = checkboxObj.eq(i).prev();
				if($label.hasClass('checked')){
					chkArr.push(checkboxObj.eq(i).val());
				}
			}
			if(chkArr.length>0){
				inputValueStr = chkArr;
			}
			if(inputStr){
				if(inputValueStr==''){
					inputValueStr = inputStr;
				}else{
					inputValueStr.push(inputStr);
				}
			}
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config, inputValueStr);
		if(isTrue){
			return inputValueStr;
		}else{
			return false;
		}
	},
	//获取值
	getValue:function(_config, isValid){
		var inputValueStr = '';
		if( _config.formSource == 'halfScreen' ||  // 半屏
			_config.formSource == 'fullScreen' ||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    // 功能
		){
			inputValueStr = _config.value ? _config.value : '';
		}else{
			var checkboxObj = _config.$input;
			if(checkboxObj.length == 1){
				if($(checkboxObj).is(':checked')){
					inputValueStr = 1;
				}else{
					inputValueStr = 0;
				}
			}else{
				var inputStr = '';
				if(_config.isInput){
					inputStr = $('#'+_config.fullID+'-input').val();
				}
				var chkArr = [];
				for(var i=0;i<checkboxObj.length;i++){
					if(checkboxObj.eq(i).is(':checked')){
						chkArr.push(checkboxObj.eq(i).val());
					}
				}
				if(chkArr.length>0){
					inputValueStr = chkArr;
				}
				if(inputStr){
					if(inputValueStr==''){
						inputValueStr = inputStr;
					}else{
						inputValueStr.push(inputStr);
					}
				}
			}
		}
		
		if(isValid == false){
			// 不验证时直接返回表单数据
			var value = inputValueStr;
			if(typeof(_config.outputFields) == "object" && !$.isEmptyObject(_config.outputFields)){
				value = nsComponent.getOutputValueObjBySubdata(value, _config);
			}
			return value;
			// return inputValueStr;
		}
		var isTrue = this.validate(_config, inputValueStr);
		if(isTrue){
			var value = inputValueStr;
			if(typeof(_config.outputFields) == "object" && !$.isEmptyObject(_config.outputFields)){
				value = nsComponent.getOutputValueObjBySubdata(value, _config);
			}
			return value;
		}else{
			return false;
		}
	},
	// 赋值
	setValue:function(_config, value){
		if( _config.formSource == 'halfScreen' 		||  // 半屏
			_config.formSource == 'fullScreen' 		||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    	// 功能
		){
			_config.value = value;
			nsForm.edit([_config],_config.formID);
			if(typeof(_config.changeHandler) == "function"){
				_config.changeHandler(value, _config);
			}
			if(typeof(_config.commonChangeHandler) == "function"){
				var obj = {
					value:value,
					dom:_config.$formItem,
					type:'checkbox',
					id:_config.id,
					config:_config
				}
				_config.commonChangeHandler(obj);
			}
		}else{
			var checkboxData = _config.subdata;
			_config.$input.removeAttr("checked");
			_config.$input.prev().removeClass("checked");
			if($.isArray(checkboxData)){
				for(var chkI = 0; chkI<checkboxData.length; chkI++){
					if(typeof(value)=='string' || typeof(value)=='number'){
						if(checkboxData[chkI][_config.valueField] == value){
							_config.$input.eq(chkI).attr('checked',true);
							_config.$input.eq(chkI).prev().addClass('checked');
						}
					}else if($.isArray(value)){
						//默认值是个数组
						for(var i=0; i<value.length; i++){
							if(checkboxData[chkI][_config.valueField] == value[i]){
								_config.$input.eq(chkI).attr('checked',true);
								_config.$input.eq(chkI).prev().addClass('checked');
							}
						}
					}
				}
			}
		}
	},
}
// select
/*
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 select 必填
 * placeholder : input提示信息 // 表单根据rules生成 通过：nsComponent.getPlaceHolder(config)  // 此位置已经设置
 * isOnKeydown : 是否设置快捷键切换焦点
 * readonly : 只读
 * rules : 规则 checkbox 在表单中配置也可以是required 到此位置转化成了checkbox
 * textField : subdata显示值 // 表单默认：text
 * valueField : subdata获取值 // 表单默认：value
 * subdata : array 数组中对象属性 ‘textField’ ‘valueField’ isChecked:是否选中 isDisabled:只读
 * 没有subdata有url即ajax发送返回值生成选项
 * url : 地址
 * dataSrc : 数据源
 * method : ajax方式
 */
nsUI.selectInput = {
	ver:'10.22', //版本号 lyw 20181022
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			isOnKeydown:false,
			readonly:false,
			textField:'text',
			valueField:'value',
			method:'GET',
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(_config, formJson){
		// formJson : 表单全部配置
		this.setDefault(_config); // 设置config的默认值
		var configUrl = _config.url;
		if(typeof(configUrl)=='function'){
			configUrl = _config.url();	//如果url链接是个function
		}
		_config.configUrl = configUrl;
		// _config.getAjaxRelevantParameter : 获得ajax的相关参数 
		// 默认根据formJson（表单配置）获得表单数据
		if(typeof(formJson)!='undefined' && typeof(_config.getAjaxRelevantParameter)!='function'){
			_config.getAjaxRelevantParameter = function(){
				var formData = nsForm.getFormJSON(formJson.id,false);
				return formData;
			}
		}
		// _config.getAllFieldConfig : 获得所有字段配置 
		// 默认根据formJson（表单配置）获得所有字段配置 
		if(typeof(formJson)!='undefined' && typeof(_config.getAllFieldConfig)!='function'){
			_config.getAllFieldConfig = function(){
				var formArr = formJson.form;
				var allFieldConfig = {};
				for(var indexI=0;indexI<formArr.length;indexI++){
					if($.isArray(formArr[indexI])){
						for(var indexJ=0;indexJ<formArr[indexI].length;indexJ++){
							allFieldConfig[formArr[indexI][indexJ].id] = formArr[indexI][indexJ];
						}
					}else{
						allFieldConfig[formArr[indexI].id] = formArr[indexI];
					}
				}
				return allFieldConfig;
			}
		}
	},
	// 获得字段html
	getHtml:function(_config,formJson){
		// formJson : 表单全部配置
		this.setConfig(_config,formJson);
		var html = '';
		var loaddingHtml = ''
		_config.ajaxLoading = false;
		if(_config.configUrl){
			loaddingHtml = nsComponent.getLoadingHtml();
			//如果config.ajaxLoading是true，则先不执行动作监听
			_config.ajaxLoading = true;
			nsComponent.setConfigData(_config);
			var ajaxData = {
				url:_config.configUrl, //请求的数据链接
				type:_config.method,
				data:_config.data,
				dataType:'json',
				context:_config,
				success:function(data){
					config = this;
					if(data.success){
						var subdata;
						if(typeof(config.dataSrc)!='string'){
							subdata = data;
						}else{
							subdata = data[config.dataSrc];
						}
						if(!$.isArray(subdata)){
							subdata = [];
						}
						config.subdata = subdata;
						$('#'+config.fullID).parent().children('.input-loading').remove();
						$('#'+config.fullID).append(nsUI.selectInput.getOptionsHtml(config));
						// nsComponent.init.selectBoxIt(config);
						nsUI.selectInput.init(config,formJson);
						if(config.isInit){
							// 已经初始化
							if(typeof(config.relationField)=='string'){
								// 存在关联关系
								// 判断value值是否存在
								var sourceValue = config.value;
								var isHaveValue = false;
								for(var subI=0;subI<subdata.length;subI++){
									if(subdata[subI][config.valueField]==sourceValue){
										isHaveValue = true;
									}
								}
								if(!isHaveValue){
									// value值不存在 刷新关联字段
									var relationField = config.relationField;
									var relationFieldArr = relationField.split(',');
									var editArr = [];
									for(var index=0; index<relationFieldArr.length; index++){
										editArr.push({id:relationFieldArr[index]});
									}
									nsForm.edit(editArr,formJson.id);
								}
							}
						}
						config.isInit = true; // 是否已经初始化
					}else{
						nsalert(data.msg,'error');
					}
				},
				error: function (error) {
					nsalert(language.common.nscomponent.part.selectajaxError,'error');
					if(debugerMode){
						console.log(error);
						console.log(this);
						console.error(_config);
					}
				}
			}
			// lyw 20180815
			if(_config.contentType){
				if(_config.contentType == 'application/json'){
					ajaxData.contentType = 'application/json';
					ajaxData.data = JSON.stringify(ajaxData.data);
				}
			}
			$.ajax(ajaxData);
		}else{
			//本地模式
			if($.isArray(_config.subdata)){
				html += nsUI.selectInput.getOptionsHtml(_config);
			}else{
				if(debugerMode){
					console.error(language.common.nscomponent.part.subdataArray)
					console.error(_config);
				}
			}
		}
		var readonlyStr = _config.readonly ? 'disabled="disabled"' : '';
		html = 
			'<select class="form-control" id="'+_config.fullID+'" ns-id="'+_config.id+'" nstype="'+_config.type+'" '+readonlyStr+'>'
				+'<option value="">'+_config.placeholder+'</option>'
				+html
			+'</select>'
			+loaddingHtml;
		return html;
	},
	// subdata生成的html
	getOptionsHtml:function(_config){
		var html = '';
		var defaultStr = nsComponent.getValue(_config);
		for(var i=0; i<_config.subdata.length; i++){
			valueStr    = _config.subdata[i][_config.valueField];
			textStr     = _config.subdata[i][_config.textField];
			if(defaultStr === ''){
				selectStr = _config.subdata[i].selected ? 'selected' : ''; 
			}else{
				selectStr = valueStr == defaultStr?'selected':'';
			}
			disabledStr = _config.subdata[i].isDisabled?" disabled ":"";
			html += 
				'<option value="'+valueStr+'" '+selectStr+' '+disabledStr+'>'
					+textStr
				+'</option>';
		}
		return html;
	},
	// 初始化
	init:function(config,formJson){
		var id = config.fullID;
		config.$input = $('#'+id);
		config.$input.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar('update');
		});
		var selectBoxOption = config.$input.selectBoxIt().data("selectBox-selectBoxIt");
		selectBoxOption.refresh();
		function selectChangeHandler(ev){
			var $select = $(ev.target);
			// var config = nsForm.getConfigByDom($select);
			var config = ev.data.config;
			var value = $select.val();
			var text = $.trim($select.find('option:selected').text());
			var selectJson = {};
			for(var i=0; i< config.subdata.length; i++){
				if(config.subdata[i][config.valueField] == value){
					selectJson = config.subdata[i];
				}
			}
			if(typeof(config.changeHandler)=='function'){
				config.changeHandler(value,text,selectJson,config.subdata);
			}
			//模拟一个公用的事件回调
			if(typeof(config.commonChangeHandler)=='function'){
				var obj = {
					value:$select.val(),
					dom:$select,
					type:'select',
					id:config.id,
					text:text,
					selectJson:selectJson,
					subdata:config.subdata,
					config:config
				}
				config.commonChangeHandler(obj);
			}
			nsComponent.removeError($select);
		}
		config.$input.off('change',selectChangeHandler);
		config.$input.on('change',{config:config},selectChangeHandler);
		// 切换焦点
		if(typeof(formJson)=='object' && typeof(config.enterFocusField)=='string'){
			// 表单
			config.switchFocus = nsComponent.getFieldFocusMethod(formJson.id,config.enterFocusField);
		}
		// 是否支持快捷键 下一个获得焦点 默认不支持
		if(config.isOnKeydown){
			this.setSwitchShortcutKey(config);
		}
		// 设置失去焦点
		this.setBlur(config);
		// 设置焦点
		this.setFocus(config);
		// 设置点击
		this.setClick(config);
		// 失去焦点
		config.blur = function(){
			config.$input.parent().blur();
		}
		// 获得焦点
		config.focus = function(){
			config.$input.parent().focus();
		}
	},
	// 设置点击
	setClick:function(_config){
		function setClickHandler(ev){
			$(this).focus();
		}
		_config.$input.parent().off('click',setClickHandler);
		_config.$input.parent().on('click',setClickHandler)
	},
	// 设置焦点
	setFocus:function(_config){
		_config.$input.parent().attr('tabindex','0');
		// _config.$input.parent().focus();
		var _this = this;
		_config.$input.parent().off('focus',  _this.setFocusHandler);
		_config.$input.parent().on('focus', {_config:_config,_this:_this}, _this.setFocusHandler);
	},
	setFocusHandler:function(event){
		var _config = event.data._config;
		var _this = event.data._this;
		var $spanContainer = _config.$input.next('span'); // 下拉框span容器
		$spanContainer.attr('aria-expanded','true');
		$spanContainer.children('span').addClass('selectboxit-open');
		$spanContainer.children('ul').css('display','block');
	},
	// 设置失去焦点
	setBlur:function(_config){
		var _this = this;
		_config.$input.parent().off('blur',  _this.setBlurHandler);
		_config.$input.parent().on('blur', {_config:_config,_this:_this}, _this.setBlurHandler);
	},
	// 设置失去焦点的方法
	setBlurHandler:function(event){
		var _config = event.data._config;
		var _this = event.data._this;
		_config.$input.next('span').attr('aria-expanded','false');
		_config.$input.next('span').children('span').removeClass('selectboxit-open');
		_config.$input.next('span').children('ul').css('display','none');
		// 失去焦点执行changHandler
		if(typeof(_config.changeHandler)=='function'){
			_config.$input.change();
		}
		_this.getValue(_config);
	},
	// 设置切换字段快捷键
	setSwitchShortcutKey:function(_config){
		var _this = this;
		_config.$input.parent().off('keydown', _this.switchShortcutKeyHandler)
		_config.$input.parent().on('keydown', {_config:_config}, _this.switchShortcutKeyHandler)
	},
	// 切换字段方法
	switchShortcutKeyHandler:function(event){
		var _config = event.data._config; // 当前字段配置
		var $select = _config.$input; // <select>
		var $spanContainer = $select.next('span'); // 下拉框span容器
		var $spanContent = $spanContainer.children('span').children('span.selectboxit-text'); // 下拉框选择后显示的容器
		var $ul = $spanContainer.children('ul');
		var $li = $spanContainer.children('ul').children('li');
		switch(event.keyCode){
			// 回车
			case 13:
				if($ul.css('display') == 'none'){
					if(typeof(_config.switchFocus)=='function'){
						// 存在切换方法
						_config.switchFocus();
					}else{
						_config.blur();
					}
					// 如果有失去焦点配置方法 执行 失去焦点方法
					if(typeof(_config.blurHandler)=='function'){
						_config.blurHandler(formJson);
					}
				}else{
					var dataVal = '';
					var dataText = '';
					for(var i=0;i<$li.length;i++){
						if($li.eq(i).hasClass('selectboxit-focus')){
							dataVal = $li.eq(i).attr('data-val');
							dataText = $li.eq(i).text();
							$li.removeClass('selectboxit-focus');
							$li.removeClass('selectboxit-selected');
							$li.eq(i).addClass('selectboxit-selected');
							$spanContent.attr('data-val',dataVal);
							$spanContent.text(dataText);
							$select.children('option').removeAttr('selected');
							$select.children('option').eq(i).attr('selected',true);
							break;
						}
					}
					$ul.css('display','none');
				}
				break;
			// 左
			case 37:
			// 上
			case 38:
				var checkedIndex = 0;
				for(var i=0;i<$li.length;i++){
					if($li.eq(i).hasClass('selectboxit-focus')){
						checkedIndex = i;
						break;
					}
				}
				$li.removeClass('selectboxit-focus');
				if(checkedIndex==0){
				}else{
					$li.eq(checkedIndex-1).addClass('selectboxit-focus');
				}
				break;
			// 右
			case 39:
			// 下
			case 40:
				var checkedIndex = 0;
				var isHaveChecked = false;
				for(var i=0;i<$li.length;i++){
					if($li.eq(i).hasClass('selectboxit-focus')){
						checkedIndex = i;
						isHaveChecked = true;
						break;
					}
				}
				$li.removeClass('selectboxit-focus');
				if(checkedIndex==$li.length-1 || !isHaveChecked){
					if(!isHaveChecked){
						$li.eq(checkedIndex).addClass('selectboxit-focus');
					}
				}else{
					$li.eq(checkedIndex+1).addClass('selectboxit-focus');
				}
				break;
		}
	},
	// 验证数据 设置报错信息
	validate:function(_config, inputValueStr){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			// 单选只支持必填 radio 
			var isLegal = true;
			var errorKey = '';
			if(_config.rules.indexOf('checkbox')>-1){
				errorKey = 'checkbox';
				isLegal = nsComponent.getIsValidate(inputValueStr,errorKey); // 是否合法
			}
			if(!isLegal){
				var errorInfoStr = validateMsg[errorKey];
				var errorConfig = {
					alertStr:_config.label+i18n.getValueError,
					popStr:errorInfoStr,
					stateType:'warning',
					$container:_config.$input.parent(),
					$input:_config.$input.parent(),
				}
				nsComponent.showState(errorConfig);
				return false;
			}
		}
		return true;
	},
	//获取值
	getValue:function(_config, isValid){
	},
	// 赋值
	setValue:function(_config, value){}
}
// map
/*
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 text 必填
 * placeholder : input提示信息 // 表单根据rules生成 通过：nsComponent.getPlaceHolder(config)  // 此位置已经设置
 * readonly : 只读
 * rules : 规则 都支持
 */
nsUI.mapInput = {
	ver:'10.12', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
            label :             '',             // label
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            hidden:             false,          // 是否隐藏
			mapType:            'qq',           // 地图类型 腾讯/百度地图 qq/baidu
			referer: 			'OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77', // 您的应用名
            mapKey :            '2WPBZ-7QQWX-PZY4W-TZKNS-6OSYO-NMBYJ', // key
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(config){
		// var i18n = this.i18n[languagePackage.userLang];
		var _this = this;
		_this.setDefault(config);  // 设置config的默认配置
		config.mapType = 'qq';
        if(typeof(config.subFields)!="object"){
            config.subFields = {};
        }
        config.subFields.address = config.id;
        // 根据subFields 设置config
        var subFieldsKey = {
            code : 'isCode',
            address : 'isAddress',
            longitude : 'isLongitude',
            latitude : 'isLatitude',
        }
        var subFields = config.subFields;
        var fieldShow = {
            source : {},
            is : {},
        };
        for(var subKey in subFieldsKey){
            var _subKey = subFieldsKey[subKey];
            if(typeof(subFields[subKey]) == "string"){
                fieldShow.source[subKey] = true;
                fieldShow.is[_subKey] = true;
            }else{
                fieldShow.source[subKey] = false;
                fieldShow.is[_subKey] = false;
            }
        }
        config.fieldShow = fieldShow;
        // 设置value
        function getComponentValue(componentId){
            var comVal = '';
            var _config = nsFormBase.formInfo[config.formID].fieldById[componentId];
            if(typeof(_config)=="object"){
                comVal = _config.value;
            }
            return comVal;
        }
        // 设置value值
        var value = {};
        for(var subKey in subFields){
            var fieldId = subFields[subKey];
            value[subKey] = getComponentValue(fieldId);
        }
        // 格式化value
        for(var subKey in subFieldsKey){
            value[subKey] = typeof(value[subKey])=="undefined" ? '' : value[subKey];
        }
		config.value = value;
		if(config.formSource === 'staticData'){
			if(typeof(config.acts)!="string"){
				config.acts = 'map';
				config.readonly = true;
			}
		}
	},
	// 获取文本值的html代码
	getContentHtml:function(_config){
		var content = _config.value.address;
		var html = '';
		if((typeof(content)!='string' && typeof(content)!='number')||content==''){
			return html;
		}
		var tagConfig = {
			type:'acts',
			text:content,
			acts:_config.acts,
			config : _config
		}
		if(_config.seat){
			tagConfig.seat = _config.seat;
		}
		if(_config.isShowText){
			tagConfig.isShowText = _config.isShowText;
		}
		if(_config.iconsName){
			tagConfig.iconsName = _config.iconsName;
		}
		html = nsComponent.getTagHtml(tagConfig);
		return html;
	},
	getHtml:function(_config){
		html = '';
		this.setConfig(_config);
		if(_config.formSource=='staticData' && _config.acts !== 'map'){
			html = nsUI.mapInput.getContentHtml(_config);
		}else{
			var contentHtml = '<textarea class="form-control" ' 
								+ nsComponent.getDefalutAttr(_config) 
								+ ' name="' + _config.fullID + '"' 
								+ ' id="' + _config.fullID + '"' 
								+ ' placeholder="' + _config.placeholder + '"' 
								+ ' >'
								+ _config.value.address
								+ '</textarea>';
			if(_config.readonly==true||_config.disabled==true){
				contentHtml = '<div class="form-control" '  
								+ ' name="' + _config.fullID + '"' 
								+ ' id="' + _config.fullID + '"'
								+ ' >'
								+ _config.value.address
								+ '</div>';
			}
			html = 	'<div class="input-group">'
						+ contentHtml
						+ '<div class="input-group-btn">'
							+ '<button type="button" class="btn btn-white btn-icon">'
								+ '<i class="icon-map-mark-o"></i>'
							+ '</button>'
						+ '</div>'
					+ '</div>';
		}
		return html;
	},
	//初始化
	init:function(config,formJson){
		switch(config.formSource){
			case 'halfScreen':  // 半屏
			case 'fullScreen':  // 全屏
			case 'inlineScreen':  	// 行内
			case 'staticData':    // 功能
				// 移动端记录jQuery对象
				var $label = $('label[for="'+config.fullID+'"]');
				config.$label = $label;
				config.$formGroup = config.$label.parent(); // label对象的父对象
				config.$container = config.$label.closest('.form-td');
				config.$formItem = config.$formGroup.children('.form-item');
				// config.$input = config.$formItem.find('input');
				config.$input = config.$formItem.find('textarea');
				config.$content = config.$formItem.find('#' + config.fullID);
				config.$button = config.$formItem.find('button');
				nsUI.mapInput.initMobile(config);
				break;
			default:
				// pc端初始化
				break;
		}
	},
	// 初始化pc模式 没有用
	initPc:function(config,formJson){
	},
	// 初始化移动端
	initMobile:function(config){
		var _this = this;
		// formSource 表单类型标识
		var formSource = config.formSource;
		if(formSource == 'inlineScreen' || formSource == 'fullScreen' || formSource == 'staticData'){
			var $input = config.$input;
			var $button = config.$button;
			// 只读模式不用初始化 change blur
			if(config.readonly!==true && config.disabled!==true){
				// 行内模式 添加chang事件用于修改config.value
				$input.off('change');
				$input.on('change', function(ev){
					var $this = $(this);
					var valStr = nsUI.mapInput.getValueMobile(config, false);
					var sourceVal = config.value;
					var value = $.extend(true, {}, sourceVal);
					if(valStr === ''){
						_this.clearObj(value);
					}else{
						value.address = valStr;
					}
					_this.setConfigValue(config, value);
					var isChange = _this.getIsChange(value, sourceVal);
					if(isChange){
						_this.change(config);
					}
				});
				$input.off('blur');
				$input.on('blur', function(ev){
					_this.getValue(config);
				})
				if(config.formSource == 'inlineScreen'){
					// 行内模式添加删除事件
					if(config.$formGroup.children('.form-btn').length>0){
						var $button = config.$formGroup.children('.form-btn').children();
						$button.off('click');
						$button.on('click', {config:config}, function(ev){
							ev.stopImmediatePropagation();
							var config = ev.data.config;
							config.showState = 'more'; // 改变字段显示位置
							$(this).closest('.form-td[mindjetfieldposition="field-more"]').remove();
						});
					}
				}
			}
			$button.off('click');
			$button.on('click', function(ev){
				_this.mapManager.init(config);
			});

		}
	},
	getIsChange : function(value, sourceVal){
		var isChange = false;
		for(var key in value){
			if(value[key]!==sourceVal[key]){
				isChange = true;
				continue;
			}
		}
		return isChange;
	},
	change : function(config){
		var value = config.value;
		if(typeof(config.changeHandler)=='function'){
			config.changeHandler(value, config);
		}
		if(typeof(config.commonChangeHandler)=='function'){
			var obj = {
				value:value,
				dom:config.$formItem,
				type:'text',
				id:config.id,
				config:config
			}
			config.changeHandler(obj);
		}
	},
	mapManager : {
		showBaiduMap : function(positionInfo, config){},
		showQQMap : function(positionInfo, config){
			var _this = this;
			var mapManagerObj = config.mapManagerObj;
			var mapBodyId = mapManagerObj.mapBodyId;
			mapManagerObj.mapSourceData = positionInfo;
			// 腾讯地图
			var type = positionInfo.type;
			var marker = ''; // 地图标记
			var map = new qq.maps.Map(document.getElementById(mapBodyId), {
				center: new qq.maps.LatLng(39.916527,116.397128),      // 地图的中心地理坐标。
				zoom : 15,
			});
			//地址和经纬度之间进行转换服务
			geocoder = new qq.maps.Geocoder();
			mapManagerObj.geocoder = geocoder;
			mapManagerObj.map = map;
			//设置服务请求成功的回调函数
			geocoder.setComplete(function(result) {
				if(typeof(marker)=="object"){
					marker.setMap(null); 
				}
				map.setCenter(result.detail.location);
				marker = new qq.maps.Marker({
					map: map,
					position: result.detail.location
				});
				// 设置选中地址数据
				var lat = result.detail.location.lat;
				var lng = result.detail.location.lng;
				getAddressByPoint(lat, lng);
			});
			//若服务请求失败，则运行以下函数
			geocoder.setError(function() {
				alert("出错了，请输入正确的地址！！！");
			});
			function getAddressByPoint(lat, lng){
				var data={
					location:   lat + ',' + lng,
					key:        "2WPBZ-7QQWX-PZY4W-TZKNS-6OSYO-NMBYJ",
					get_poi:    0,
				}
				var url="http://apis.map.qq.com/ws/geocoder/v1/?";
				data.output="jsonp";
				$.ajax({
					type:           "GET",
					dataType:       'jsonp',
					data:           data,
					jsonp:          "callback",
					jsonpCallback:  "QQmap",
					url:            url,
					success:        function(data){
						// 点击的数据
						mapManagerObj.mapSelectedData = _this.getValueByQQMapDataInfo(data);
						_this.setInfoToMap(mapManagerObj.$content, mapManagerObj.mapSelectedData);
					},
					error : function(err){
						alert("服务端错误，请刷新浏览器后重试");
						console.log(err);
					}
				})
			}
			//点击 只读状态 不设置点击
			if(config.readonly===true || config.disabled===true){
			}else{
				qq.maps.event.addListener(map, 'click', function(ev) {
					if(typeof(marker)=="object"){
						marker.setMap(null); 
					}
					marker = new qq.maps.Marker({
						map: map,
						position:ev.latLng, 
					});
					var lat = ev.latLng.getLat();
					var lng = ev.latLng.getLng();
					getAddressByPoint(lat, lng);
				});
			}
			switch(type){
				case 'point':
					var longitude = positionInfo.longitude;
					var latitude = positionInfo.latitude;
					var latLng = new qq.maps.LatLng(latitude, longitude);
					geocoder.getAddress(latLng);
					break;
				case 'address':
					var address = positionInfo.address;
					geocoder.getLocation(address);
					break;
				case 'none':
					// var geolocation = new qq.maps.Geolocation(config.mapKey, config.referer);
					// geolocation.getLocation(function(position){
					// 	var latitude = position.lat;
					// 	var longitude = position.lng;
					// 	var latLng = new qq.maps.LatLng(latitude, longitude);
					// 	geocoder.getAddress(latLng);
					// },function(){
					// 	nsAlert('定位失败');
					// 	console.log('定位失败');
					// },{
					// 	timeout: 8000,
					// })
					_this.setPositionByWX(config);
					break;
			}
			// 内容
			_this.setInfoToMap(mapManagerObj.$content, positionInfo.value);
		},
		// 获取微信信息
		setPositionByWX : function(config){
			var plusData = {
				formID : config.formID,
				componentId : config.id,
				jsApiList : ['getLocation'],
				callbackFunc : function(_plusData, resData){
					var formID = _plusData.formID;
					var componentId = _plusData.componentId;
					var component = nsForm.data[formID].formInput[componentId];
					var geocoder = component.mapManagerObj.geocoder;
					wx.getLocation({
						type : 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
						success : function (res) {
							var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
							var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
							var latLng = new qq.maps.LatLng(latitude, longitude);
							geocoder.getAddress(latLng);
						},
						fail : function(res){
							// nsAlert('error');
							// nsAlert(res.errMsg, 'error');
							nsAlert('定位失败，请检查是否打开定位', 'error');
							console.error(res.errMsg);
						},
					});
				}
			}
			var ajaxParameter = {
				plusData : plusData
			};
			nsComponent.getWXPermit(ajaxParameter);
		},
		// 通过地图中获取到的详细信息获得 value
		getValueByQQMapDataInfo : function(mapDataInfo){
			var result = mapDataInfo.result;
			var code = result.ad_info.adcode;
			var address = result.address;
			var latitude = result.location.lat;
			var longitude = result.location.lng;
			var addressObj = {
				code : code,
				address: address,
				longitude: longitude,
				latitude: latitude,
			};
			return addressObj;
		},
		// 设置信息
		setInfoToMap : function($content, value){
			var _this = this;
			var text = _this.getShowTextByValue(value);
			var $contentList = $content.children();
			var textName = {
				codeStr : '区域地址：',
				address : '详细地址：',
				longitude : '经度：',
				latitude : '纬度：',
			}
			for(var listI=0; listI<$contentList.length; listI++){
				var $con = $($contentList[listI]);
				var nsType = $con.attr('ns-type');
				nsType = nsType === 'code' ? 'codeStr' : nsType;
				var str = text[nsType];
				if(str || str === 0){
					str = textName[nsType] + str;
				}
				$con.text(str);
			}
		},
		getIsReadonly : function(config){
			var isReadonly = false;
			if(config.readonly || config.disabled){
				isReadonly = true;
			}else{
				if(config.formSource == "staticData"){
					isReadonly = true;
				}
			}
			return isReadonly;
		},
		// 设置地图容器
		setContainer : function(config){
			var fullID = config.fullID;
			var mapId = fullID + '-map';
			var mapBodyId = mapId + '-body';
			var mapContentId = mapId + '-content';
			var mapSearchId = mapId + '-search';
			// 默认显示确认类型confirm 只读时显示 到这去 类型 goto
			var confirmHtml = '<button class="btn btn-default" ns-type="confirm"><span>确认</span></button>';
			var searchHtml = '<div class="mobile-input-search" id="' + mapSearchId + '">'
								+ '<div class="input-group">'
									+ '<input class="form-control" type="text">'
								+ '</div>'
								+ '<div class="btn-group">'
									+ '<button class="btn btn-icon" ns-type="search">搜索</button>'
								+ '</div>'
							+ '</div>';
			var isReadonly = this.getIsReadonly(config);
			if(isReadonly){
				confirmHtml = '';
				searchHtml = '';
			}
			var html = '<div class="mobilewindow-fullscreen" id="' + mapId + '">'
							+ searchHtml
							+ '<div class="ns-map-container" id="' + mapBodyId + '"></div>'
							+ '<div class="map-position" id="' + mapContentId + '">'
								+ '<span ns-type="code"></span>'
								+ '<span ns-type="address"></span>'
								+ '<span ns-type="longitude"></span>'
								+ '<span ns-type="latitude"></span>'
							+ '</div>'
							+ '<div class="btn-group">'
								+ '<button class="btn btn-default" ns-type="return"><span>返回</span></button>'
								+ '<button class="btn btn-info" ns-type="goto"><span>到这去</span></button>'
								+ confirmHtml
							+ '</div>'
						+ '</div>';
			$('body').append(html);
			var $container = $('#' + mapId);
			config.mapManagerObj = {
				$container : $container,
				$mapBody : $container.children('#'+mapBodyId),
				$content : $container.children('#'+mapContentId),
				$buttons : $container.find('button'),
				mapSelectedData : {},
				mapContainerId : mapId,
				mapBodyId : mapBodyId,
				mapContentId : mapContentId,
			}
			if(config.readonly !=true && config.disabled != true){
				var $search = $container.children('#'+mapSearchId);
				config.mapManagerObj.$search = $search;
				config.mapManagerObj.$inputSearch = $search.find('input');
				config.mapManagerObj.$buttonSearch = $search.find('button');
			}
		},
		// 设置事件方法
		setEvent : function(config){
			var _this = this;
			var mapManagerObj = config.mapManagerObj;
			var $buttons = mapManagerObj.$buttons;
			var $container = mapManagerObj.$container;
			$buttons.off('click');
			$buttons.on('click', function(ev){
				var $this = $(this);
				var nsType = $this.attr('ns-type');
				switch(nsType){
					case 'return':
						$container.remove();
						break;
					case 'confirm':
						var mapSelectedData = mapManagerObj.mapSelectedData;
						if(!$.isEmptyObject(mapSelectedData)){
							nsUI.mapInput.setConfigValue(config, mapSelectedData);
						}else{
							nsAlert('您没有选择地址', 'warning');
							console.error('您没有选择地址');
						}
						$container.remove();
						break;
					case 'goto':
						var hrefStr = '';
						var mapSourceData = mapManagerObj.mapSourceData;
						var type = mapSourceData.type;
						if(!$.isEmptyObject(mapManagerObj.mapSelectedData)){
							type = 'selected';
							var mapSelectedData = mapManagerObj.mapSelectedData;
						}
						switch(type){
							case 'selected':
								var longitude = mapSelectedData.longitude;
								var latitude = mapSelectedData.latitude;
								var address = mapSelectedData.address;
								hrefStr = 'to=' + address + '&tocoord=' + latitude + ',' + longitude;
								break;
							case 'point':
								var longitude = mapSourceData.longitude;
								var latitude = mapSourceData.latitude;
								var address = mapSourceData.value.address;
								if(typeof(address) == "string" && address.length > 0){
									hrefStr = 'to=' + address + '&tocoord=' + latitude + ',' + longitude;
								}else{
									nsAlert('没有要去的地址的详细地址名，无法定位位置', 'warning');
								}
								break;
							case 'address':
								var address = mapSourceData.address;
								hrefStr = 'to=' + address;
								break;
							case 'none':
								nsAlert('没有要去的地址', 'warning');
								break;
						}
						if(hrefStr.length > 0){
							hrefStr = 'https://apis.map.qq.com/uri/v1/routeplan?type=drive&' + hrefStr + '&policy=1&referer=' + config.referer;
							window.open(hrefStr);
						}
						break;
				}
			});
			if(config.readonly !=true && config.disabled != true){
				var $inputSearch = mapManagerObj.$inputSearch;
				var $buttonSearch = mapManagerObj.$buttonSearch;
				$buttonSearch.off('click');
				$buttonSearch.on('click', function(ev){
					var address = $inputSearch.val();
					if(address === ''){
						return;
					}
					mapManagerObj.geocoder.getLocation(address);
				});
			}
		},
		// 通过value获取code/name
		getNameByVal: function(value){
			var provinceNameByCode = nsDataFormat.formatProvince.provinceNameByCode;
			var name = provinceNameByCode[value] ? provinceNameByCode[value] : "";
			return name;
		},
		// 通过config的value值获取显示值
		getShowTextByValue : function(value){
			var obj = {
				code : '',
				codeStr : '',
				address : '',
				longitude : '',
				latitude : '',
			}
			if(typeof(value)!="object"){
			}else{
				var code = value.code;
				var name = this.getNameByVal(code);
				code = name === '' ? '' : code;
				obj.code = code;
				obj.codeStr = name;
				obj.address = value.address ? value.address : '';
				obj.longitude = value.longitude ? value.longitude : '';
				obj.latitude = value.latitude ? value.latitude : '';
			}
			return obj;
		},
		// 获取位置信息
		getPositionInfoByValue : function(value, firstComponent){
			var _this = this;
			var addressStr = '';
			var type = 'address';
			if(typeof(value)!="object"){
			}else{
				firstComponent = firstComponent ? firstComponent : 'code';
				switch(firstComponent){
					case 'code':
						if(value.code!==''){
							addressStr = _this.getNameByVal(value.code);
						}else{
							if(value.address!==''){
								addressStr = value.address;
							}else{
								if(value.longitude!==''&&value.latitude!==''){
									type = 'point';
									var longitude = value.longitude;
									var latitude = value.latitude;
								}else{
									type = 'none';
								} 
							}
						}
						break;
					case 'address':
						if(value.address!==''){
							addressStr = value.address;
						}else{
							if(value.code!==''){
								addressStr = _this.getNameByVal(value.code);
							}else{
								if(value.longitude!==''&&value.latitude!==''){
									type = 'point';
									var longitude = value.longitude;
									var latitude = value.latitude;
								}else{
									type = 'none';
								} 
							}
						}
						break;
					case 'point':
						if(value.longitude!==''&&value.latitude!==''){
							type = 'point';
							var longitude = value.longitude;
							var latitude = value.latitude;
						}else{
							if(value.address!==''){
								addressStr = value.address;
							}else{
								if(value.code!==''){
									addressStr = _this.getNameByVal(value.code);
								}
							}
							if(addressStr === ''){
								type = 'none';
							}
						}
						break;
				}
			}
			var positionInfo = {
				type : type,
				value : value,
			};
			if(type == 'address'){
				positionInfo.address = addressStr;
			}else{
				positionInfo.longitude = longitude;
				positionInfo.latitude = latitude;
			}
			return positionInfo;
		},
		// 地图初始化
		actsQQMap : function(config, value){
			var _this = this;
			_this.setContainer(config);
			_this.setEvent(config);
			var positionInfo = _this.getPositionInfoByValue(value);
			_this.showQQMap(positionInfo, config);
		},
		// 地图初始化
		init : function(config){
			var _this = this;
			_this.setContainer(config);
			_this.setEvent(config);
			var mapType = config.mapType;
			var positionInfo = _this.getPositionInfoByValue(config.value);
			switch(mapType){
				case 'baidu':
					_this.showBaiduMap(positionInfo, config);
					break;
				case 'qq':
					_this.showQQMap(positionInfo, config);	
					break;
			}
		},
	},
	// 验证数据
	validate:function(_config, inputValueStr){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			var rulesArr = _config.rules.split(' '); // rules之间以‘ ’分开 ，生成数组逐个验证
			for(var i=0;i<rulesArr.length;i++){
				var errorKey = rulesArr[i];
				var formatRules = nsComponent.getFormatRules(errorKey); // 格式化 rules 值
				errorKey = formatRules.ruleName; // 规则名称
				var errorVal = formatRules.compareArr; // 若有 = 等号后边值
				var isLegal = nsComponent.getIsValidate(inputValueStr,rulesArr[i],_config.formID); // 是否合法
				if(!isLegal){
					var errorInfo = validateMsg[errorKey];
					var errorInfoStr = '';
					if(typeof(errorInfo)=='function'){
						// $.validator.format(***) 格式
						errorInfoStr = errorInfo(errorVal);
					}else{
						errorInfoStr = errorInfo;
					}
					var errorConfig = {
						alertStr:_config.label+i18n.getValueError,
						popStr:errorInfoStr,
						stateType:'warning',
						$container:_config.$input.parent(),
						$input:_config.$input,
					}
					// 显示组件（验证未通过等）状态，输出提示信息
					nsComponent.showState(errorConfig);
					return false;
				}
			}
		}
		return true;
	},
	getValueMobile:function(_config, isValid){
		var inputValueStr = '';
		inputValueStr = $.trim(_config.$input.val());
		if(_config.disabled==true || _config.readonly==true){
			inputValueStr = $.trim(_config.$content.text());
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config,inputValueStr);
		if(isTrue){
			return inputValueStr;
		}else{
			return false;
		}
	},
	// 清空对象
	clearObj : function(obj){
		for(var key in obj){
			obj[key] = '';
		}
	},
	//获取值 现在没有用
	getValue:function(_config, isValid){
		if( _config.formSource == 'halfScreen' ||  // 半屏
			_config.formSource == 'fullScreen' ||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    // 功能
		){
			return this.getValueMobile(_config, isValid);
		}else{
		}
	},
	// 赋值 现在没有用
	setValue:function(config, value){
		var _this = this;
		if( config.formSource == 'halfScreen' 		||  // 半屏
			config.formSource == 'fullScreen' 		||  // 全屏
			config.formSource == 'inlineScreen' 	||  // 行内
			config.formSource == 'staticData' 	    	// 功能
		){
			var valueObj = value; 
			if(typeof(value)=="string"){
				var valueObj = config.value;
				valueObj.address = value;
			}
			_this.setConfigValue(config, valueObj);
		}else{
			
		}
	},
	// 设置config的value
	setConfigValue : function(config, value){
		var sourceVal = config.value;
		config.value = value;
		// var address = value.address;
		// config.$input.val(address);
		var isChange = false;
		for(var key in value){
			if(value[key]!==sourceVal[key]){
				isChange = true;
				continue;
			}
		}
		if(isChange){
			this.change(config);
			this.setComponentShowValue(config);
		}
	},
	// 设置组件显示值
	setComponentShowValue : function(config){
		var subFields = config.subFields;
		var value = config.value;
		var components = nsFormBase.data[config.formID].fieldById;
		for(var key in subFields){
			if(typeof(components[subFields[key]])=="object"){
				if(subFields[key]!==config.id){
					components[subFields[key]].value = value[key];
				}
				if(typeof(components[subFields[key]].$input)=="object"){
					components[subFields[key]].$input.val(value[key]);
				}
			}
		}
	},
	// 关联字段变化
	changeByRelField : function(value, config){
		var components = nsFormBase.data[config.formID].fieldById;
		var component = components[config.changeField];
		if(typeof(component)!="object"){
			return;
		}
		var componentValue = $.extend(true, {}, component.value);
		var subFields = component.subFields;
		var keyName = '';
		for(var key in subFields){
			if(config.id === subFields[key]){
				keyName = key;
				continue;
			}
		}
		if(componentValue[keyName] !== value){
			componentValue[keyName] = value;
			this.setConfigValue(component, componentValue);
		}
	},
}
//sortAtHalfScreen sjj 20190417 半屏模式的排序
/*
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 text 必填
 * placeholder : input提示信息 // 表单根据rules生成 通过：nsComponent.getPlaceHolder(config)  // 此位置已经设置
 * readonly : 只读
 * rules : 规则 都支持
 */
nsUI.sortAtHalfScreen = {
	ver:'1.1.0', //版本号 
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	//获取值
	getValue:function(_config){
		return _config.value;
	},
	//设置值
	setValue:function(){

	},
	getOptionsValue:function(_config){
		var inputValueJson = '';
		for(var i=0;i<_config.$input.length;i++){
			if(_config.$input.eq(i).is(':checked')){
				inputValueStr = _config.$input.eq(i).val();
				var id = _config.$input.eq(i).attr('id');
				var orderType = $('label[for="'+id+'"]').attr('sort');
				var orderField = _config.$input.eq(i).attr('ns-orderid');
				inputValueJson = {
					orderField:orderField,
					orderType:orderType
				};
				break;
			}
		}
		return inputValueJson;
	},
	//确认事件
	confirmHandler:function(_config){
		// 刷新value
		var value = this.getOptionsValue(_config);
		_config.value = value;
		var editArray = [_config];
		nsForm.edit(editArray, _config.formID);
	},
	//清空事件
	clearHandler:function(_config){
		_config.value = '';
		var editArray = [_config];
		nsForm.edit(editArray, _config.formID);
	},
	//取消事件
	cancelHandler:function(_config){

	},
	// 设置移动端选项列表事件
	setMobileListEvent:function(config){
		var $input = $('[name="'+config.fullID+'"]');
		config.$input = $input;
		var $label = $input.prev();
		// 选项label添加点击事件 设置选中取消样式
		$label.off('click');
		$label.on('click', {config:config}, function(ev){
			var $this = $(this);
			var config = ev.data.config;
			var $input = config.$input;
			var sortType = $this.attr('sort');
			var sortAttr = '';
			switch(sortType){
				case 'asc':
					sortAttr = 'desc';
					break;
				case 'desc':
					sortAttr = 'asc';
					break;
				default:
					sortAttr = 'asc';
					break;
			}
			$this.siblings('label').removeAttr('sort');
			$this.attr('sort',sortAttr);
		});
	},
	// 移动端初始化单选事件
	initSort:function(config){
		nsUI.sortAtHalfScreen.setMobileListEvent(config);
	},
	// 获取value对应的list值 用于保存isObjectValue=true的情况
	getValueList:function(_config, valueId){
		var valueList = [];
		for(var i=0;i<_config.subdata.length;i++){
			if(_config.subdata[i][_config.valueField]==valueId){
				valueList.push(_config.subdata[i]);
				break;
			}
		}
		if(valueList.length==0){
			valueList = '';
		}
		return valueList;
	},
	// 获取文本值
	getContent:function(_config, value){
		/*
		 * _config 	: object 	组件配置
		 * value 	: string 	当前value值
		 *
		 * typeof(value)=="object" 		表示 通过给定的value返回text值
		 * typeof(value)!="undefined" 	表示 通过给定的value查询text值
		 * typeof(value)=="undefined" 	表示根据 _config.value 获取text值
		 */
		var text = '';
		value = _config.value;
		// 查询选中值text
		for(var i=0;i<_config.subdata.length;i++){
			if(_config.subdata[i].orderType){
				text = _config.subdata[i][_config.textField];
				break;
			}
		}
		return text;
	},
	getContentHtml:function(_config, content){
		// var content = this.getContent(_config);
		// 判断是否设置content 不需要经过subdata获得content
		// 行内模式有搜索框时content是给出的 不经过subdata 因为content是通过隐藏字段的value值获得的
		content = typeof(content)=='undefined'?this.getContent(_config):content;
		var html = '';
		if(content){
			var tagConfig = {
				type:'show',
				text:content,
				config : _config
			}
			html = nsComponent.getTagHtml(tagConfig);
		}
		return html;
	},
	// 获得字段html
	getHtml:function(_config, formJson){
		// 获取html
		// pc ：html是选择列表
		// modile : html是回显的text标签 
		// 移动端/pc判断通过formSource属性识别 （halfScreen/fullScreen/inlineScreen/staticData指移动端，其它表示pc端）
		// configUrl ：指通过发送ajax请求返回的数据生成代码
		var html = '';
		if($.isArray(_config.subdata)){
			html = nsUI.sortAtHalfScreen.getContentHtml(_config);
		}
	},
	getOptionsHtml:function(_config){
		var html = '';
		var valueStr = nsComponent.getValue(_config);
		var isDefault = false;
		if(!$.isEmptyObject(valueStr)){
			isDefault = true;
		}
		for(var sortI = 0; sortI<_config.subdata.length; sortI++){
			var text = _config.subdata[sortI][_config.textField];
			var value = _config.subdata[sortI][_config.valueField];
			// textField/valueField不存在不显示
			if(typeof(text)=="undefined" || typeof(value)=="undefined"){
				console.error('选项配置错误---'+sortI);
				console.error(_config.subdata[sortI]);
				console.error(_config);
				continue;
			}
			var sortAttr = _config.subdata[sortI].orderType;
			if(isDefault){
				if(_config.subdata[sortI].orderField == valueStr.orderField){
					sortAttr = valueStr.orderType;
				}
			}
			html += 
				'<label class="sort-halfscreen-inline" sort="'+sortAttr+'" ns-orderid="'+_config.subdata[sortI].orderField+'" for="'+ _config.fullID + '-' + sortI +'">'
					+text
				+'</label>'
				+'<input id="'+ _config.fullID +'-'+sortI+'"'
					+'name="'+_config.fullID+'"'
					+' ns-id="'+_config.id+'"'
					+' ns-orderid="'+_config.subdata[sortI].orderField+'"'
					+' nstype="'+_config.type+'" type="radio" class= "radio-options" '
					+' value="'+value+'" >'
		}
		return html;
	},
	getMobileListHtml:function(_config){
		var html = this.getOptionsHtml(_config);
		var listClass = _config.type+'-list';
		html =  '<div class="'+listClass+'" name="'+ _config.fullID +'-list">'
					+ html
				+ '</div>';
		return html;
	},
	showContainer:function(config){
		function initContainer(sortHtml){
			nsComponent['mobileHalfContainer'].show(config, sortHtml, function(resConfig, isSuccess){
				if(isSuccess == true){
					// 确认
					nsUI.sortAtHalfScreen.confirmHandler(resConfig);
					return;
				}
				if(isSuccess == false){
					// 清除
					nsUI.sortAtHalfScreen.clearHandler(resConfig);
					return;
				}
				if(isSuccess == 'cancel'){
					// 取消
					nsUI.sortAtHalfScreen.cancelHandler(resConfig);
					return;
				}
			})
			nsUI.sortAtHalfScreen.initSort(config);
		}
		var html = nsUI.sortAtHalfScreen.getMobileListHtml(config);
		initContainer(html);
	},
	initMobile:function(config){
		// 判断是否存在默认值 存在选中 添加显示样式
		config.$calRelPositionContainer = config.$container; // 计算相对位置的容器 用于显示半屏容器
		// 点击label 弹出弹框 显示radio选项
		config.$formGroup.off('click');
		config.$formGroup.on('click', {config:config}, function(ev){
			var config = ev.data.config;
			config.oldValue = config.value;
			nsUI.sortAtHalfScreen.showContainer(config);
		})
		if(typeof(config.oldValue)!='undefined'&&config.oldValue!=config.value){
			if(typeof(config.changeHandler)=='function'){
				config.changeHandler(config.value, config);
			}
			if(typeof(config.commonChangeHandler)=='function'){
				var obj = {
					value:config.value,
					dom:config.$formItem,
					type:'sortAtHalfScreen',
					id:config.id,
					config:config
				}
				config.commonChangeHandler(obj);
			}
		}
	},
	init:function(config,formJson){
		// 移动端记录jQuery对象
		var $label = $('label[for="'+config.fullID+'"]');
		config.$label = $label;
		config.$formGroup = config.$label.parent(); // label对象的父对象
		config.$container = config.$label.closest('.form-td');
		config.$formItem = config.$formGroup.children('.form-item');
		this.initMobile(config);
	}
}

// dateRangePicker
/*
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 text 必填
 * placeholder : input提示信息 // 表单根据rules生成 通过：nsComponent.getPlaceHolder(config)  // 此位置已经设置
 * readonly : 只读
 * rules : 规则 都支持
 */
nsUI.daterangepickerInput = {
	ver:'10.12', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			isOnKeydown:false, // 是否切换
			daysOfWeekDisabled:'',
			daysOfWeekHighlighted:false,
			todayBtn:false,
			clearBtn:false,
			format:nsVals.default.dateFormat.toUpperCase(),
			startView:0,
			//addvalue:{},
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(config){
		this.setDefault(config); // 设置config的默认值
        config.fieldStart = typeof(config.fieldStart) == "string" ? config.fieldStart : config.id + 'Start';
        config.fieldEnd = typeof(config.fieldEnd) == "string" ? config.fieldEnd : config.id + 'End';
		// 获取格式化日期
        // function getFormatDate(dateVal){
		// 	dateVal = typeof(dateVal)=="undefined" ? '' : dateVal;
        //     if(typeof(dateVal)!='number'){
        //         dateVal = '';
        //     }else{
        //         dateVal = moment(dateVal).format(config.format);
        //     }
        //     return dateVal;
        // }
        function getComponentValue(componentId){
            var comVal = '';
            var _config = nsFormBase.formInfo[config.formID].fieldById[componentId];
            if(typeof(_config)=="object"){
                comVal = _config.value;
            }
            return comVal;
        }
        // 设置value值
        if(config.value === ""){
            config.value = {};
        }
        if(typeof(config.value)=="object"){
            var fieldStart = getComponentValue(config.fieldStart);
            var fieldEnd = getComponentValue(config.fieldEnd);
            config.value.fieldStart = fieldStart;
            config.value.fieldEnd = fieldEnd;
        }else{
            config.value = {
                fieldStart : config.value,
                fieldEnd : ''
            };
        }
	},
	getContent:function(value, _config){
		if(typeof(value)=='undefined'){
			return false;
		}
		if(value==''){
			return false;
		}
		if(typeof(value)!='number'){
			console.error('日期设置的value值类型错误');
			console.error(value);
			console.error(_config);
			return false;
		}
		var content = moment(value).format('YYYY-MM-DD');
		return content;
	},
	// 获取文本值的html代码
	getContentHtml:function(_config){
		var value = _config.value;
		var fieldStart = value.fieldStart;
		var fieldEnd = value.fieldEnd;
		fieldStart = this.getContent(fieldStart);
		fieldEnd = this.getContent(fieldEnd);
		var content = '';
		if(fieldStart){
			content = fieldStart;
		}
		if(fieldEnd){
			if(fieldStart){
				content += '-' + fieldEnd;
			}else{
				content = fieldEnd;
			}
		}
		if(content === ''){
			content = false;
		}
		var html = '';
		if(content==false){
			return html;
		}
		// 默认功能模式是date
		_config.acts = typeof(_config.acts) != 'string' ? 'date' : _config.acts;
		var tagConfig = {
			type:'acts',
			text:content,
			acts:_config.acts,
			config : _config
		}
		if(_config.seat){
			tagConfig.seat = _config.seat;
		}
		if(_config.isShowText){
			tagConfig.isShowText = _config.isShowText;
		}
		if(_config.iconsName){
			tagConfig.iconsName = _config.iconsName;
		}
		html = nsComponent.getTagHtml(tagConfig);
		return html;
	},
	// 获取输入框html
	getInputHtml : function(config){
		var value = config.value;
		var fieldStart = this.getContent(value.fieldStart, config);
		var fieldEnd = this.getContent(value.fieldEnd, config);
		fieldStart = fieldStart == false ? '' : moment(fieldStart).format(config.format);
		fieldEnd = fieldEnd == false ? '' : moment(fieldEnd).format(config.format);
		html = 	'<i class="icon-calendar-o"></i>'
				+ '<input class="form-control" name="'+config.fullID +'"" type="date" value="'+fieldStart+'" ns-type="start">'
				+ '<span class="pt-date-to">到</span>'
				+ '<i class="icon-calendar-o"></i>'
				+ '<input class="form-control" name="'+config.fullID +'" type="date" value="'+fieldEnd+'" ns-type="end">';
		return html;
	},
	// 获得字段html
	getHtml:function(_config){
		html = '';
		this.setConfig(_config);
		switch(_config.formSource){
			case 'staticData': 		// 功能
				html = nsUI.daterangepickerInput.getContentHtml(_config);
				break;
			case 'halfScreen':  	// 半屏
				break;
			case 'fullScreen':  	// 全屏
				html = this.getInputHtml(_config);
				break;
			case 'inlineScreen':   	// 行内
				html = this.getInputHtml(_config);
				break;
			default: 	// pc
				break;
		}
		return html;
	},
	// 初始化pc模式
	initPc:function(config,formJson){},
	// 初始化移动端
	initMobile:function(config){
		var _this = this;
		// formSource 表单类型标识
		var formSource = config.formSource;
		// 功能模式 如果没有value值 隐藏该项配置标签
		if(formSource == 'staticData'){
			// 判断是否存在默认值 不存在选中 隐藏
			if(config.$formItem.children().length == 0){
				config.$formGroup.addClass('hidden');
			}
		}
		// 只读模式不用初始化方法
		if(config.readonly==true){
			return;
		}
		// 行内模式添加change事件
		if(formSource !== 'staticData'){
			var $input = config.$input;
			$input.off('change');
			$input.on('change', function(ev){
				var $this = $(this);
				var valStr = $this.val();
				var nsType = $this.attr('ns-type');
				var oldValue = config.value;
				if(valStr !== ''){
					valStr = Number(moment(valStr).format('x'));
				}
				if(nsType == 'start'){
					config.value.fieldStart = valStr;
				}else{
					config.value.fieldEnd = valStr;
				}
				if(config.value.fieldStart && config.value.fieldEnd == config.value.fieldStart){
					config.value.fieldEnd = Number(moment(moment(config.value.fieldEnd).format('YYYY-MM-DD') + ' 23:56:56').format('x'));
				}
				_this.change(config);
				_this.setComponentShowValue(config);
				if(nsType == 'start'){
				}else{
					_this.getValue(config);
				}
			})
			config.$input.off('blur');
			config.$input.on('blur', function(ev){
				_this.getValue(config);
			});
			if(config.formSource == 'inlineScreen'){
				// 行内模式添加删除事件
				if(config.$formGroup.children('.form-btn').length>0){
					var $button = config.$formGroup.children('.form-btn').children();
					$button.off('click');
					$button.on('click', {config:config}, function(ev){
						ev.stopImmediatePropagation();
						var config = ev.data.config;
						config.showState = 'more'; // 改变字段显示位置
						$(this).closest('.form-td[mindjetfieldposition="field-more"]').remove();
					});
				}
			}
		}
		// 半屏
		if(formSource == 'halfScreen'){
			var $formGroup = config.$formGroup;
			$formGroup.off('click');
			$formGroup.on('click', function(ev){
				_this.showContainer(config);
			});
		}
	},
	// 显示半屏容器
	showContainer:function(config){
		var _this = this;
		function initContainer(_html){
			nsComponent.mobileHalfContainer.show(config, _html, function(resConfig, isSuccess){
				if(isSuccess == true){
					// 确认
					_this.confirmHandler(resConfig);
					return;
				}
				if(isSuccess == false){
					// 清除
					_this.clearHandler(resConfig);
					return;
				}
			})
			_this.initHalf(config);
		}
		html = this.getInputHtml(config);
		initContainer(html);
	},
	// 清除
	clearHandler : function(config){
		var value = {
			fieldStart : '',
			fieldEnd : ''
		}
		this.setConfigValue(config, value);
	},
	// 确认
	confirmHandler : function(config){
		var fieldStart = config.$inputStart.val();
		var fieldEnd = config.$inputEnd.val();
		var value = {
			fieldStart : fieldStart === '' ? '' : Number(moment(fieldStart).format('x')),
			fieldEnd : fieldEnd === '' ? '' : Number(moment(fieldEnd).format('x')),
		}
		this.setConfigValue(config, value);
	},
	initHalf : function(config){
		var name = config.fullID;
		config.$inputStart = $('input[name="' + name + '"][ns-type="start"]');
		config.$inputEnd = $('input[name="' + name + '"][ns-type="end"]');
		config.$input = $('input[name="' + name + '"]');
		this.initMobile(config);
	},
	//初始化
	init:function(config,formJson){
		switch(config.formSource){
			case 'halfScreen':  // 半屏
			case 'fullScreen':  // 全屏
			case 'inlineScreen':  	// 行内
			case 'staticData':    // 功能
				// 移动端记录jQuery对象
				var $label = $('label[for="'+config.fullID+'"]');
				config.$label = $label;
				config.$formGroup = config.$label.parent(); // label对象的父对象
				config.$container = config.$label.closest('.form-td');
				config.$formItem = config.$formGroup.children('.form-item');
				config.$input = config.$formItem.children('input');
				config.$inputEnd = config.$input;
				if(config.formSource == 'halfScreen'){
					config.$calRelPositionContainer = config.$container; // 计算相对位置的容器 用于显示半屏容器
				}
				this.initMobile(config);
				break;
			default:
				break;
		}
	},
	// 验证数据
	validate:function(_config, value){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			// 单选只支持必填 radio 
			var isLegal = true;
			var errorKey = '';
			var errorInfoStr = '';
			var nullNum = 0;
			for(var key in value){
				if(value[key] === ''){
					nullNum ++;
				}
			}
			if(_config.rules.indexOf('required')>-1){
				errorKey = 'required';
				// isLegal = nsComponent.getIsValidate(inputValueStr,errorKey); // 是否合法
				if(nullNum == 2){
					isLegal = false;
					errorInfoStr = validateMsg[errorKey];
				}
			}
			// if(nullNum === 0){
			// 	if(value[_config.fieldStart] > value[_config.fieldEnd]){
			// 		isLegal = false;
			// 		errorInfoStr = '开始日期大于结束日期';
			// 	}
			// }
			if(!isLegal){
				var errorConfig = {
					alertStr:_config.label+i18n.getValueError,
					popStr:errorInfoStr,
					stateType:'warning',
					$container:_config.$inputEnd.parent(),
					$input:_config.$inputEnd,
				}
				nsComponent.showState(errorConfig);
				return false;
			}
		}
		return true;
	},
	validateVal : function(_config, value){
		var i18n = this.i18n[languagePackage.userLang];
		var isLegal = true;
		var errorInfoStr = '';
		var nullNum = 0;
		for(var key in value){
			if(value[key] === ''){
				nullNum ++;
			}
		}
		if(nullNum === 0){
			if(value[_config.fieldStart] > value[_config.fieldEnd]){
				isLegal = false;
				errorInfoStr = '开始日期大于结束日期';
			}
		}
		if(!isLegal){
			var errorConfig = {
				alertStr:_config.label+i18n.getValueError,
				popStr:errorInfoStr,
				stateType:'warning',
				$container:_config.$inputEnd.parent(),
				$input:_config.$inputEnd,
			}
			nsComponent.showState(errorConfig);
			return isLegal;
		}
		return isLegal;
	},
	// 移动端获取value值
	getValueMobile:function(_config, isValid){
		var inputValueStr = '';
		inputValueStr = $.trim(_config.$input.val());
		inputValueStr = typeof(inputValueStr) == 'string' ? inputValueStr : '';
		if(inputValueStr){
			if(_config.readonly == false){
				//执行初始化datepicker()所以会存在datepicker('getDate')
				if(typeof(_config.addvalue)=='object'){
					if(!$.isEmptyObject(_config.value)){
						//存在自定义值 永久，长期
						inputValueStr = _config.addvalue.id;
					}
				}else{
					inputValueStr = $date.datepicker('getDate').getTime();
				}
			}
			inputValueStr = moment(inputValueStr).format('YYYY-MM-DD');
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config, inputValueStr);
		if(isTrue){
			return inputValueStr;
		}else{
			return false;
		}
	},
	//获取值
	getValue:function(config, isValid){
		if( config.formSource == 'halfScreen' ||  // 半屏
			config.formSource == 'fullScreen' ||  // 全屏
			config.formSource == 'inlineScreen' 	||  // 行内
			config.formSource == 'staticData' 	    // 功能
		){
		}else{
			return;
		}
		var configValue = config.value;
		var value = {};
		for(var key in configValue){
			value[config[key]] = configValue[key];
		}
		var isPass = this.validateVal(config, value);
		if(!isPass){
			return false;
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			return value;
		}
		var isTrue = this.validate(config, value);
		if(isTrue){
			return value;
		}else{
			return false;
		}
	},
	// 赋值
	setValue:function(_config,value){
		if( _config.formSource == 'halfScreen' 		||  // 半屏
			_config.formSource == 'fullScreen' 		||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    	// 功能
		){
			_config.value = value;
			nsForm.edit([_config],_config.formID);
		}else{
			var regu = /^[-+]?\d*$/;
			if(regu.test(value)){
				if(value == ''){
					value = _config.isDefaultDate == false ? '':nsComponent.formatDate(value);
				}else{
					value = nsComponent.formatDate(value);
				}
			}
			_config.$input.val(value);
			_config.$input.datepicker('update');
		}
	},
	change : function(config){
		var value = config.value;
		if(typeof(config.changeHandler)=='function'){
			config.changeHandler(value, config);
		}
		if(typeof(config.commonChangeHandler)=='function'){
			var obj = {
				value:value,
				dom:config.$formItem,
				type:'text',
				id:config.id,
				config:config
			}
			config.commonChangeHandler(obj);
		}
	},
	// 设置config的value
	setConfigValue : function(config, value){
		var sourceVal = config.value;
		config.value = value;
		var isChange = false;
		for(var key in value){
			if(value[key]!==sourceVal[key]){
				isChange = true;
				continue;
			}
		}
		if(isChange){
			this.change(config);
			this.setComponentShowValue(config);
		}
	},
	// 设置组件显示值
	setComponentShowValue : function(config){
		var subFields = {
			fieldStart : config.fieldStart,
			fieldEnd : config.fieldEnd,
		};
		var value = config.value;
		var components = nsFormBase.data[config.formID].fieldById;
		for(var key in subFields){
			if(typeof(components[subFields[key]])=="object"){
				if(subFields[key]!==config.id){
					components[subFields[key]].value = value[key];
				}
				if(typeof(components[subFields[key]].$input)=="object"){
					components[subFields[key]].$input.val(value[key]);
				}
			}
		}
		var $input = config.$input;
		if(value.fieldStart){
			$input.eq(0).val(moment(value.fieldStart).format(config.format));
		}else{
			$input.eq(0).val('');
		}
		if(value.fieldEnd){
			$input.eq(1).val(moment(value.fieldEnd).format(config.format));
		}else{
			$input.eq(1).val('');
		}
	},
	// 关联字段变化
	changeByRelField : function(value, config){
		var components = nsFormBase.data[config.formID].fieldById;
		var component = components[config.changeField];
		if(typeof(component)!="object"){
			return;
		}
		var componentValue = $.extend(true, {}, component.value);
		var subFields = {
			fieldStart : component.fieldStart,
			fieldEnd : component.fieldEnd,
		};
		var keyName = '';
		for(var key in subFields){
			if(config.id === subFields[key]){
				keyName = key;
				continue;
			}
		}
		if(componentValue[keyName] !== value){
			componentValue[keyName] = value;
			this.setConfigValue(component, componentValue);
		}
	},
}
// provinceselect
/*
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 provinceselect 必填
 * 手机端只存在静态数据
 */
nsUI.provinceselectInput = {
	ver:'10.12', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			isInputMask:false, // 执行inputMask组件 值为true时，format必填
			isOnKeydown:false, // 是否设置快捷键切换焦点
			isUseHtmlInput:false, // 是否支持快捷键插入html代码
			readonly:false, // 只读
		}
		nsVals.setDefaultValues(_config, defaultConfig);
		// 根据isOnKeydown（是否设置快捷键）设置isSetBlur isSetFocus
		if(_config.isOnKeydown){
			_config.isSetBlur = typeof(_config.isSetBlur)=='boolean'?_config.isSetBlur:true;
			_config.isSetFocus = typeof(_config.isSetFocus)=='boolean'?_config.isSetFocus:true;
		}
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(_config){
		// var i18n = this.i18n[languagePackage.userLang];
		var _this = this;
		_this.setDefault(_config);  // 设置config的默认配置
		var cls = 'form-control';
		// 判断显示类型
		if(typeof(_config.formatType)=='string'){
			switch(_config.formatType){
				case 'string':
				case 'number':
				case 'date':
				case 'money':
					cls += ' '+_config.formatType;
					break;
				default:
					if(debugerMode){
						console.warn(_config.formatType+language.common.nscomponent.part.formatType);
					}
					break;
			}
		}
		_config.cls = cls;
	},
	// 通过code获得显示值
	getAddressByCode : function(code){
		var provinceNameByCode = nsDataFormat.formatProvince.provinceNameByCode;
		var name = provinceNameByCode[code] ? provinceNameByCode[code] : "";
		return name;
	},
	// 获取文本值的html代码   将value的code码
	getContentHtml:function(_config){
		var content = this.getAddressByCode(_config.value);
		var html = '';
		if((typeof(content)!='string' && typeof(content)!='number')||content==''){
			return html;
		}
		var tagConfig = {
			type:'acts',
			text:content,
			acts:_config.acts,
			config : _config
		}
		if(_config.seat){
			tagConfig.seat = _config.seat;
		}
		if(_config.isShowText){
			tagConfig.isShowText = _config.isShowText;
		}
		if(_config.iconsName){
			tagConfig.iconsName = _config.iconsName;
		}
		html = nsComponent.getTagHtml(tagConfig);
		return html;
	},
	getHtml:function(_config){
		html = '';
		switch(_config.formSource){
			case 'staticData': 		// 功能
			case 'halfScreen':  	// 半屏
			case 'fullScreen':  	// 全屏
			case 'inlineScreen':   	// 行内
				html = nsUI.provinceselectInput.getContentHtml(_config);
				break;
			default:
				break;
		}
		return html;
	},
	// 初始化移动端
	initMobile:function(config){
		// 只存在静态数据
		// 判断是否存在默认值 不存在选中 隐藏
		var $label = $('label[for="'+config.fullID+'"]');
		config.$label = $label;
		config.$formGroup = config.$label.parent(); // label对象的父对象
		config.$container = config.$label.closest('.form-td');
		config.$formItem = config.$formGroup.children('.form-item');
		if(config.$formItem.children().length == 0){
			config.$formGroup.addClass('hidden');
		}
	},
	// 验证数据
	validate:function(_config, inputValueStr){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			var rulesArr = _config.rules.split(' '); // rules之间以‘ ’分开 ，生成数组逐个验证
			for(var i=0;i<rulesArr.length;i++){
				var errorKey = rulesArr[i];
				var formatRules = nsComponent.getFormatRules(errorKey); // 格式化 rules 值
				errorKey = formatRules.ruleName; // 规则名称
				if(errorKey === 'remote'){
					if(typeof(inputValueStr)=="string"&&inputValueStr.length>0){
						// 排重
						var isSendAjax = true;
						if(_config.sourceValue == inputValueStr){
							isSendAjax = false;
						}
						if(isSendAjax){
							var ajaxData = {};
							ajaxData[_config.id] = inputValueStr;
							ajaxData = JSON.stringify(ajaxData);
							var ajaxConfig = {
								url : _config.remoteAjax,
								type : 'POST',
								data : ajaxData,
								contentType : 'application/json',
								plusData : {
									config : _config,
								},
							}
							NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
								if(res.success){
									var data = res.data;
									if(data.validateResult){
										// var obj = {
										// 	stateType:'warning',
										// 	$container:config.$input.parent(),
										// 	$input:config.$input,
										// }
										// nsComponent.removeState(obj);
										return; 
									}
									var plusData = _ajaxConfig.plusData;
									var config = plusData.config;
									var errorConfig = {
										alertStr:config.label+i18n.getValueError,
										popStr:data.validateMsg,
										stateType:'warning',
										$container:config.$input.parent(),
										$input:config.$input,
									}
									// 显示组件（验证未通过等）状态，输出提示信息
									nsComponent.showState(errorConfig);
								}
							})
						}
						
					}
				}else{
					var errorVal = formatRules.compareArr; // 若有 = 等号后边值
					var isLegal = nsComponent.getIsValidate(inputValueStr,rulesArr[i],_config.formID); // 是否合法
					if(!isLegal){
						var errorInfo = validateMsg[errorKey];
						var errorInfoStr = '';
						if(typeof(errorInfo)=='function'){
							// $.validator.format(***) 格式
							errorInfoStr = errorInfo(errorVal);
						}else{
							errorInfoStr = errorInfo;
						}
						var errorConfig = {
							alertStr:_config.label+i18n.getValueError,
							popStr:errorInfoStr,
							stateType:'warning',
							$container:_config.$input.parent(),
							$input:_config.$input,
						}
						// 显示组件（验证未通过等）状态，输出提示信息
						nsComponent.showState(errorConfig);
						return false;
					}
				}
			}
		}
		return true;
	},
	getValueMobile:function(_config, isValid){
		return _config.value ? _config.value : '';
	},
	// 赋值
	setValue:function(_config,value){
		if( _config.formSource == 'halfScreen' 		||  // 半屏
			_config.formSource == 'fullScreen' 		||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    	// 功能
		){
			_config.value = value;
			nsForm.edit([_config], _config.formID);
		}else{
		}
	},
}
// upload 
/**
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 upload 必填
 * 手机端只存在行内模式
 */
nsUI.uploadImageInput = {
	ver:'10.12', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			readonly:false, // 只读
			accept : 'image/gif, image/jpeg, image/bmp, image/png',
			isMultiple : false, // 是否多选
			textField : 'text',
			valueField : 'value',
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(config){
		var _this = this;
		_this.setDefault(config);  // 设置config的默认配置
		var cls = 'form-control';
		config.cls = cls;
		config.showFileId = config.fullID + '-file';
		config.showImgPreviewId = config.fullID + '-file-preview';
		config.valueFiles = [];

        config.ajax = typeof(config.ajax) == "object" ? config.ajax : {};
        config.ajax.type = typeof(config.ajax.type) == "string" ? config.ajax.type : 'GET';
		config.ajax.dataSrc = typeof(config.ajax.dataSrc) == "string" ? config.ajax.dataSrc : 'rows';
		
        config.getFileAjax = typeof(config.getFileAjax) == "object" ? config.getFileAjax : {};
        config.getFileAjax.type = typeof(config.getFileAjax.type) == "string" ? config.getFileAjax.type : 'GET';
        config.getFileAjax.dataSrc = typeof(config.getFileAjax.dataSrc) == "string" ? config.getFileAjax.dataSrc : 'rows';
        config.getFileAjax.contentType = typeof(config.getFileAjax.contentType) == "string" ? config.getFileAjax.contentType : 'application/x-www-form-urlencoded';
	},
	// 获取文本值的html代码 静态数据获取 该类型不存在静态模式 该方法不存在
	getContentHtml:function(_config){
		var html = '';
		return html;
	},
	// 设置全屏图片
	setFullImg : function(config, src){
		var html = '<div class="uploadimage-view" id="' + config.showImgPreviewId + '">'
						+ '<img class="" src="' + src + '">'
						// 按钮
						+ '<div class="form-btn">'
							+ '<button class="btn btn-icon"><i class="icon-close"></i></button>'
						+ '</div>'
					+ '</div>'
		var $html = $(html);
		var $close = $html.find('button');
		$close.off('click');
		$close.on('click', function(ev){
			$('#' + config.showImgPreviewId).remove()
		});
		var $container = $('body');
		var _$container = config.$input.closest('container');
		if(_$container.length > 0){
			$container = _$container
		}
		$container.append($html);
	},
	// 设置value的html
	setValueListByValue : function(config){
		var _this = this;
		var valueHtml = '';
		if(!$.isArray(config.valueFiles)){
			return valueHtml;
		}
		var valueField = config.valueField;
		var textField = config.textField;
		var valueFiles = config.valueFiles;
		var previewUrl = config.previewUrl;
		var closeHtml = '<button class="btn btn-icon btn-danger" ns-type="close"><i class="icon-close"></i></button>';
		if(config.readonly){
			closeHtml = '';
		}
		for(var i=0; i<valueFiles.length; i++){
			var valObj = valueFiles[i];
			valueHtml += '<li ns-index="' + i + '" class="uploadimage-item">'
							// 内容
							+ '<div class="uploadimage-image" ns-type="img">'
								+ '<img class="" src="' + previewUrl + valObj[valueField] + '">'
								// + '<span></span>'
							+ '</div>'
							// 按钮
                            + closeHtml
						+ '</li>';
		}
		var $li = $(valueHtml);
		var $close = $li.find('button');
		var $imgContainer = $li.find('[ns-type="img"]');
		$close.off('click');
		$close.on('click', function(ev){
			var $this = $(this);
			var nsType = $this.attr('ns-type');
			var $thisLi = $this.closest('li');
			var nsIndex = Number($thisLi.attr('ns-index'));
			switch(nsType){
				case 'close':
					valueFiles[nsIndex].isDeleted = true;
					$thisLi.remove();
					_this.change(config);
					break;
			}
		});
		$imgContainer.off('click');
		$imgContainer.on('click', function(ev){
			var $this = $(this);
			var $img = $this.children('img');
			var src = $img.attr('src');
			_this.setFullImg(config, src);
		});
		var $valueContainer = $('#' + config.showFileId);
		$valueContainer.append($li);
	},
	// 获取移动端html
	getMobileHtml : function(_config){
		this.setConfig(_config);
		var input = '<input class="'+_config.cls+'" '
					+ nsComponent.getDefalutAttr(_config)
					+ ' name="'+_config.fullID +'"'
					+ ' id="'+_config.fullID+'"'
					+ ' type="file"'
					+ ' accept="' + _config.accept + '"'
					+ '>';
		// var valueHtml = this.getHtmlByValue(_config);
        html = '<div class="uploadimage-box">'
                +input
            + '</div>'
            + '<ul id="' + _config.showFileId + '" class="uploadimage-group">'
                // + valueHtml
            + '</ul>'
		return html;
	},
	// 获取pc的html
	getPcHtml : function(_config){
		var classStr = nsComponent.part.getFormColumnSize();
		classStr += ' form-td upload-area';
		var value = getValue();
		var imageHtml = '';
		if (!$.isEmptyObject(value)) {
			imageHtml = '<div class="upload-image-box">' +
				'<img src="' + value[config.textField] + '" alt="图片" id="' + config.fullID + '-image" ns-id="' + value[config.valueField] + '" /><i class="fa fa-close"></i>'; +
			'</div>'
		} else {
			imageHtml = '<label class="upload-image-intro">' + config.label + '</label>' +
				'<div class="upload-image-box">' +
				'<img alt="图片" id="' + config.fullID + '-image" class="hide" /><i class="fa fa-close hide"></i>' +
				'</div>'
		}
		var readonly = config.readonly ? 'readonly' : '';
		var html = '<div id="' + config.fullID + '" class="upload-image upload-image-user ' + readonly + '">' +
			'<div ns-imgId="' + config.fullID + '" class="upload-image-show" ns-id="' + config.id + '">' +
			imageHtml +
			'</div>' +
			'</div>';
		html = '<div ' + getClassStyle(classStr) + '>' +
			html +
			'</div>';
		return html;
	},
	getHtml:function(config){
		var html = '';
		switch(config.formSource){
			case 'inlineScreen':   	// 行内
				html = this.getMobileHtml(config);
				if(typeof(config.value) == "string" && config.value.length > 0){
					this.getFileByIds(config.value, config, function(resData, plusData){
						var _config = nsForm.data[plusData.formId].formInput[plusData.componentId];
						_config.valueFiles = resData;
						nsUI.uploadImageInput.setValueListByValue(_config);
					})
				}
				break;
			case 'halfScreen':  // 半屏
			case 'fullScreen':  // 全屏
			case 'staticData':    // 功能
				break;
			default: // pc
				html = this.getPcHtml(config);
				break;
		}
		return html;
	},
    // 上传文件
    uploadFile : function(files, config, callBackFunc){
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
            var item = files[i];
            formData.append('files', item, item.name);
        }
        if(config.uploadAjaxData && !$.isEmptyObject(config.uploadAjaxData)){
            for(var key in config.uploadAjaxData){
                formData.append(key, config.uploadAjaxData[key]);
            }
        }
        // 发送ajax
        var ajaxConfig = {
            url : config.ajax.url,
            // processData : false,
            // contentType : false,
			// data : formData,
			type : config.ajax.type,
            plusData : {
                originalFiles : files,
                componentId : config.id,
                formId : config.formID,
                callBackFunc : callBackFunc,
            },
		}
		NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            if(res.success){
                nsalert("上传成功");
                var plusData = _ajaxConfig.plusData;
				var _config = nsForm.data[plusData.formId].formInput[plusData.componentId];
                if(typeof(plusData.callBackFunc) == "function"){
                    plusData.callBackFunc(res[_config.ajax.dataSrc], plusData);
                }
            }else{
                nsalert("上传失败");
                nsalert(res.msg, 'error');
            }
        });
	},
    // 通过ids获取file
    getFileByIds : function(ids, config, callBackFunc){
        var ajaxConfig = {
            url : config.getFileAjax.url,
            data : {
                ids : ids,
                hasContent : false,
            },
            contentType : config.getFileAjax.contentType,
            type : config.getFileAjax.type,
            plusData : {
                componentId : config.id,
                formId : config.formID,
                callBackFunc : callBackFunc,
            },
        }
        NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            if(res.success){
                var plusData = _ajaxConfig.plusData;
                var _config = nsForm.data[plusData.formId].formInput[plusData.componentId];
                if(typeof(res[_config.getFileAjax.dataSrc]) != "object"){
                    nsAlert('获取文件返回值错误','error');
                    console.error('获取文件返回值错误');
                    console.error(res);
                    console.error(_config);
                    return false;
                }
                if(typeof(plusData.callBackFunc) == "function"){
                    plusData.callBackFunc(res[_config.getFileAjax.dataSrc], plusData);
                }
            }else{
                // nsalert("获取文件失败");
                console.error(res.msg, 'error');
            }
        })
    },
	//初始化
	init:function(config,formJson){
		switch(config.formSource){
			case 'inlineScreen':  	// 行内
				// 移动端记录jQuery对象
				var $label = $('label[for="'+config.fullID+'"]');
				config.$label = $label;
				config.$formGroup = config.$label.parent(); // label对象的父对象
				config.$container = config.$label.closest('.form-td');
				config.$formItem = config.$formGroup.children('.form-item');
				config.$input = $('#' + config.fullID);
				nsUI.uploadImageInput.initMobile(config);
				break;
		}
	},
	// 初始化pc模式 不存在
	initPc:function(config,formJson){},
	// 刷新图片列表
	refreshImageListContainer : function(config){},
	// change
	change : function(config){
		var _this = this;
		// _this.refreshImageListContainer(config);
		var value = _this.getValue(config);
		if(typeof(config.changeHandler)=='function'){
			config.changeHandler(value, config);
		}
		if(typeof(config.commonChangeHandler)=='function'){
			var obj = {
				value:value,
				dom:config.$formItem,
				type:config.type,
				id:config.id,
				config:config
			}
			config.changeHandler(obj);
		}
	},
	// 初始化移动端
	initMobile:function(config){
		var _this = this;
		// formSource 表单类型标识
		var formSource = config.formSource;
		// 只读模式不用初始化方法
		if(config.readonly==true){
			return;
		}
		if(formSource == 'inlineScreen'){
			// 行内模式 添加chang事件用于修改config.value
			var $input = config.$input;
			$input.off('change');
			$input.on('change', { config:config }, function(ev){
				nsAlert('upload');
				var $this = $(this);
				var files = $this.prop('files');
				_this.uploadFile(files, config, function(resData, plusData){
					var _config = nsForm.data[plusData.formId].formInput[plusData.componentId];
					if(_config.isMultiple){
						// 多选
						_config.valueFiles = _config.valueFiles.concat(resData);
					}else{
						// 单选
						_config.valueFiles = resData;
					}
					_this.setValueListByValue(_config);
					nsUI.uploadImageInput.change(_config);
				});
				$this.val('');
			});
			if(config.formSource == 'inlineScreen'){
				// 行内模式添加删除事件
				if(config.$formGroup.children('.form-btn').length>0){
					var $button = config.$formGroup.children('.form-btn').children();
					$button.off('click');
					$button.on('click', {config:config}, function(ev){
						var $focus = $(':focus');
						var $this = $(this)
						if(!$focus.is($this)){
							return;
						}
						var config = ev.data.config;
						config.showState = 'more'; // 改变字段显示位置
						$(this).closest('.form-td[mindjetfieldposition="field-more"]').remove();
						for(var i=0; i<nsComponent.allEditInput[config.formID].length; i++){
							if(config.id == nsComponent.allEditInput[config.formID][i].id){
								nsComponent.allEditInput[config.formID][i].del = true;
							}
						}
					});
				}
			}
		}
	},
	//设置焦点
	setFocus:function(_config){},
	// 设置失去焦点
	setBlur:function(_config){},
	// 设置失去焦点的方法
	setBlurHandler:function(event){},
	// 设置切换表单快捷键
	setSwitchShortcutKey:function(_config){},
	// 切换表单方法
	switchShortcutKeyHandler:function(event){},
	// 验证数据
	validate:function(_config, value){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			var rulesArr = _config.rules.split(' '); // rules之间以‘ ’分开 ，生成数组逐个验证
			for(var i=0;i<rulesArr.length;i++){
				var errorKey = rulesArr[i];
				var formatRules = nsComponent.getFormatRules(errorKey); // 格式化 rules 值
				errorKey = formatRules.ruleName; // 规则名称
				var errorVal = formatRules.compareArr; // 若有 = 等号后边值
				var isLegal = nsComponent.getIsValidate(value, rulesArr[i], _config.formID); // 是否合法
				if(!isLegal){
					var errorInfo = validateMsg[errorKey];
					var errorInfoStr = '';
					if(typeof(errorInfo)=='function'){
						// $.validator.format(***) 格式
						errorInfoStr = errorInfo(errorVal);
					}else{
						errorInfoStr = errorInfo;
					}
					var errorConfig = {
						alertStr:_config.label+i18n.getValueError,
						popStr:errorInfoStr,
						stateType:'warning',
						$container:_config.$input.parent(),
						$input:_config.$input,
					}
					// 显示组件（验证未通过等）状态，输出提示信息
					nsComponent.showState(errorConfig);
					return false;
				}
			}
		}
		return true;
	},
	getValueMobile:function(_config, isValid){
		var inputValueStr = '';
		inputValueStr = $.trim(_config.$input.val());
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config,inputValueStr);
		if(isTrue){
			return inputValueStr;
		}else{
			return false;
		}
	},
	//获取值
	getValue:function(_config, isValid){
		var valueFiles = _config.valueFiles;
		var value = '';
		if($.isArray(valueFiles)){
			var valueField = _config.valueField
			for(var i=0; i<valueFiles.length; i++){
				if(!valueFiles[i].isDeleted){
					value += valueFiles[i][valueField] + ',';
				}
			}
			if(value.length > 0){
				value = value.substring(0, value.length-1);
			}
		}
		var isTrue = this.validate(_config, value);
		if(isTrue){
			return value;
		}else{
			return false;
		}
	},
	// 赋值
	setValue:function(_config,value){
		if( _config.formSource == 'halfScreen' 		||  // 半屏
			_config.formSource == 'fullScreen' 		||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    	// 功能
		){
			_config.value = value;
			nsForm.edit([_config], _config.formID);
		}else{
		}
	},
}
// 加减数字组件
/**
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 upload 必填
 * 手机端只存在行内模式
 */
nsUI.adderSubtracterInput = {
	ver:'10.12', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			readonly:false, // 只读
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	},
	setConfig:function(config){
		var value = config.value;
		value = Number(value);
		if(isNaN(value)){
			nsAlert(config.id + '设置value值错误', 'error');
			console.error(config.id + '设置value值错误');
			console.error(config);
		}
		value = isNaN(value) ? 0 : value;
		config.value = value;
	},
	// 获取文本值的html代码 静态数据
	getContentHtml:function(_config){
		var content = _config.value;
		var html = '';
		if((typeof(content)!='string' && typeof(content)!='number')||content==''){
			return html;
		}
		var tagConfig = {
			type:'acts',
			text:content,
			acts:_config.acts,
			config : _config
		}
		if(_config.seat){
			tagConfig.seat = _config.seat;
		}
		if(_config.isShowText){
			tagConfig.isShowText = _config.isShowText;
		}
		if(_config.iconsName){
			tagConfig.iconsName = _config.iconsName;
		}
		html = nsComponent.getTagHtml(tagConfig);
		return html;
	},
	getHtml:function(config){
		var html = '';
		switch(config.formSource){
			case 'staticData': 		// 功能
				html = nsUI.textInput.getContentHtml(config);
				break;
			case 'halfScreen':  	// 半屏
			case 'fullScreen':  	// 全屏
			case 'inlineScreen':   	// 行内
			default: 				// pc
				this.setConfig(config);
                html = '<div class="input-group">'
                            +'<div class="input-group-btn minus">' 
                                + '<button class="btn btn-icon"><i class="icon-minus"></i></button>' 
                            + '</div>'
                            + '<input class="form-control" type="text" value="' + nsComponent.getValue(config) + '" id="' + config.fullID + '">'
                            + '<div class="input-group-btn add">' 
                                + '<button class="btn btn-icon"><i class="icon-add"></i></button>' 
                            + '</div>'
                        + '</div>'
				break;
		}
		return html;
	},
	//初始化
	init:function(config,formJson){
		switch(config.formSource){
			case 'halfScreen':  // 半屏
			case 'fullScreen':  // 全屏
			case 'inlineScreen':  	// 行内
			case 'staticData':    // 功能
				// 移动端记录jQuery对象
				var $label = $('label[for="'+config.fullID+'"]');
				config.$label = $label;
				config.$input = $('#' + config.fullID);
				config.$formGroup = $label.parent(); // label对象的父对象
				config.$container = $label.closest('.form-td');
				config.$formItem = config.$formGroup.children('.form-item');
				config.$add = config.$formItem.find('.input-group-btn.add').children('button');
				config.$reduce = config.$formItem.find('.input-group-btn.minus').children('button');
				nsUI.adderSubtracterInput.initMobile(config);
				break;
			default:
				// pc端初始化
				break;
		}
	},
	// 初始化移动端
	initMobile:function(config){
		// formSource 表单类型标识
		var formSource = config.formSource;
		// 半屏模式添加选中标记
		if(formSource == 'halfScreen'){
			// 判断是否存在默认值 存在选中 添加显示样式
			if(config.$formItem.children().length>0){
				config.$formGroup.addClass('checked');
			}
		}
		// 功能模式 如果没有value值 隐藏该项配置标签
		if(formSource == 'staticData'){
			// 判断是否存在默认值 不存在选中 隐藏
			if(config.$formItem.children().length == 0){
				config.$formGroup.addClass('hidden');
			}
		}
		// 只读模式不用初始化方法
		if(config.readonly==true){
			return;
		}
		if(formSource == 'inlineScreen' || formSource == 'fullScreen'){
			// 行内模式 添加chang事件用于修改config.value
			var $input = config.$input;
			var $add = config.$add;
			var $reduce = config.$reduce;
			if($input.length == 1){
				if(!$.isArray(nsComponent.allEditInput[config.formID])){
					nsComponent.allEditInput[config.formID] = [];
				}
				for(var i=0; i<nsComponent.allEditInput[config.formID].length; i++){
					if(config.id == nsComponent.allEditInput[config.formID][i].id){
						nsComponent.allEditInput[config.formID][i].del = true;
					}
				}
				nsComponent.allEditInput[config.formID].push({
					id : config.id,
					$input : $input,
					del : false,
				});
			}
			$input.off('change');
			$input.on('change', { config:config }, function(ev){
				var _config = ev.data.config;
				var sourceVal = _config.value;
				var val = nsUI.adderSubtracterInput.getValueMobile(_config, false);
				// if(val === false){ 
				// 	// 输入值错误 变回去 不执行changeHandler commonChangeHandler
				// 	_config.$input.val(sourceVal);
				// 	return;
				// }
				_config.value = val;
				// if(_config.value !== sourceVal){
					if(typeof(_config.changeHandler)=='function'){
						_config.changeHandler(val, _config);
					}
					if(typeof(_config.commonChangeHandler)=='function'){
						var obj = {
							value:val,
							dom:_config.$formItem,
							type:'adderSubtracter',
							id:config.id,
							config:config
						}
						_config.commonChangeHandler(obj);
					}
				// }
			});
			$input.off('focus');
			$input.on('focus', function(ev){
				config.sourceValue = config.value;
			});
			$input.off('blur');
			$input.on('blur', function(ev){
				nsUI.adderSubtracterInput.getValue(config);
			});
			if(config.formSource == 'inlineScreen'){
				// 行内模式添加删除事件
				if(config.$formGroup.children('.form-btn').length>0){
					var $button = config.$formGroup.children('.form-btn').children();
					$button.off('click');
					$button.on('click', {config:config}, function(ev){
						var $focus = $(':focus');
						var $this = $(this)
						if(!$focus.is($this)){
							return;
						}
						var config = ev.data.config;
						config.showState = 'more'; // 改变字段显示位置
						$(this).closest('.form-td[mindjetfieldposition="field-more"]').remove();
						for(var i=0; i<nsComponent.allEditInput[config.formID].length; i++){
							if(config.id == nsComponent.allEditInput[config.formID][i].id){
								nsComponent.allEditInput[config.formID][i].del = true;
							}
						}
					});
				}
			}
			$add.off('click');
			$add.on('click', { config:config }, function(ev){
				var _config = ev.data.config;
				var value = _config.value + 1;
				nsUI.adderSubtracterInput.setValueMobile(_config, value);
			});
			$reduce.off('click');
			$reduce.on('click', { config:config }, function(ev){
				var _config = ev.data.config;
				var value = _config.value - 1;
				nsUI.adderSubtracterInput.setValueMobile(_config, value);
			});
		}
	},
	//设置焦点
	setFocus:function(_config){
		// config.$input.focus();
	},
	// 设置失去焦点
	setBlur:function(_config){
		var _this = this;
		_config.$input.off('blur',  _this.setBlurHandler);
		_config.$input.on('blur', {_config:_config,_this:_this}, _this.setBlurHandler);
	},
	// 设置失去焦点的方法
	setBlurHandler:function(event){
		var _config = event.data._config;
		var _this = event.data._this;
		_this.getValue(_config);
	},
	// 设置切换表单快捷键
	setSwitchShortcutKey:function(_config){
		var _this = this;
		_config.$input.off('keydown', _this.switchShortcutKeyHandler);
		_config.$input.on('keydown', {_config:_config}, _this.switchShortcutKeyHandler);
	},
	// 切换表单方法
	switchShortcutKeyHandler:function(event){
		var _config = event.data._config; // 当前字段配置
		var allFieldConfigObj = nsForm.data[formJson.id].formInput; // 当前表单中所有字段配置
		if(event.keyCode == 13){
			if(typeof(_config.switchFocus)=='function'){
				// 存在切换方法
				_config.switchFocus();
			}else{
				_config.blur();
			}
			// 如果有失去焦点配置方法 执行 失去焦点方法
			if(typeof(_config.blurHandler)=='function'){
				_config.blurHandler(formJson);
			}
		}
	},
	// 验证数据 规则
	validate:function(_config, inputValueStr){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			var rulesArr = _config.rules.split(' '); // rules之间以‘ ’分开 ，生成数组逐个验证
			for(var i=0;i<rulesArr.length;i++){
				var errorKey = rulesArr[i];
				var formatRules = nsComponent.getFormatRules(errorKey); // 格式化 rules 值
				errorKey = formatRules.ruleName; // 规则名称
				if(errorKey === 'remote'){
					if(typeof(inputValueStr)=="string"&&inputValueStr.length>0){
						// 排重
						var isSendAjax = true;
						if(_config.sourceValue == inputValueStr){
							isSendAjax = false;
						}
						if(isSendAjax){
							var ajaxData = {};
							ajaxData[_config.id] = inputValueStr;
							ajaxData = JSON.stringify(ajaxData);
							var ajaxConfig = {
								url : _config.remoteAjax,
								type : 'POST',
								data : ajaxData,
								contentType : 'application/json',
								plusData : {
									config : _config,
								},
							}
							NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
								if(res.success){
									var data = res.data;
									if(data.validateResult){
										// var obj = {
										// 	stateType:'warning',
										// 	$container:config.$input.parent(),
										// 	$input:config.$input,
										// }
										// nsComponent.removeState(obj);
										return; 
									}
									var plusData = _ajaxConfig.plusData;
									var config = plusData.config;
									var errorConfig = {
										alertStr:config.label+i18n.getValueError,
										popStr:data.validateMsg,
										stateType:'warning',
										$container:config.$input.parent(),
										$input:config.$input,
									}
									// 显示组件（验证未通过等）状态，输出提示信息
									nsComponent.showState(errorConfig);
								}
							})
						}
						
					}
				}else{
					var errorVal = formatRules.compareArr; // 若有 = 等号后边值
					var isLegal = nsComponent.getIsValidate(inputValueStr,rulesArr[i],_config.formID); // 是否合法
					if(!isLegal){
						var errorInfo = validateMsg[errorKey];
						var errorInfoStr = '';
						if(typeof(errorInfo)=='function'){
							// $.validator.format(***) 格式
							errorInfoStr = errorInfo(errorVal);
						}else{
							errorInfoStr = errorInfo;
						}
						var errorConfig = {
							alertStr:_config.label+i18n.getValueError,
							popStr:errorInfoStr,
							stateType:'warning',
							$container:_config.$input.parent(),
							$input:_config.$input,
						}
						// 显示组件（验证未通过等）状态，输出提示信息
						nsComponent.showState(errorConfig);
						return false;
					}
				}
			}
			// var obj = {
			// 	stateType:'warning',
			// 	$container:_config.$input.parent(),
			// 	$input:_config.$input,
			// }
			// nsComponent.removeState(obj);
		}
		return true;
	},
	// 验证数据 合法
	validateLegal : function(config, value, isValid){
		// value = Number(value);
		if(!isNaN(Number(value))){
			value = Number(value);
		}
		// 验证是否是数字 不是数字返回false
		// if(isNaN(value)){
		// 	return false;
		// }
		if(isValid == false){
			// 不验证时直接返回表单数据
			return value;
		}
		var isTrue = this.validate(config, value);
		if(isTrue){
			return value;
		}else{
			return false;
		}
	},
	getValueMobile:function(config, isValid){
		var inputValueStr = '';
		inputValueStr = $.trim(config.$input.val());
		return nsUI.adderSubtracterInput.validateLegal(config, inputValueStr, isValid);
	},
	setValueMobile:function(config, value){
		var sourceVal = config.value;
		var val = nsUI.adderSubtracterInput.validateLegal(config, value, true);
		if(val === false){ 
			// 输入值错误 变回去 不执行changeHandler commonChangeHandler
			return;
		}
		config.$input.val(val);
		config.value = val;
		if(config.value != sourceVal){
			if(typeof(config.changeHandler)=='function'){
				config.changeHandler(val, config);
			}
			if(typeof(config.commonChangeHandler)=='function'){
				var obj = {
					value:val,
					dom:config.$formItem,
					type:'adderSubtracter',
					id:config.id,
					config:config
				}
				config.commonChangeHandler(obj);
			}
		}
	},
	//获取值
	getValue:function(_config, isValid){
		var value = '';
		if( _config.formSource == 'halfScreen' ||  // 半屏
			_config.formSource == 'fullScreen' ||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    // 功能
		){
			value = _config.value;
		}else{
			value = $.trim(_config.$input.val());
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			return value;
		}
		var isTrue = this.validate(_config, value);
		if(isTrue){
			return value;
		}else{
			return false;
		}
	},
	// 赋值
	setValue:function(_config,value){
		if( _config.formSource == 'halfScreen' 		||  // 半屏
			_config.formSource == 'fullScreen' 		||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    	// 功能
		){
			_config.value = value;
			nsForm.edit([_config], _config.formID);
		}else{
			_config.$input.val(value);
		}
	},
}
// 业务组件
/**
 * config/_config字段配置参数
 * id : 字段id 必填
 * fullID : 字段生成容器id input标签id // 此位置必填 表单：根据id默认生成
 * type : 字段类型 business 必填
 * 手机端只存在行内模式
 */
nsUI.businessInput = {
	ver:'10.12', //版本号 lyw 20181012
	i18n:{
		en:{
		},
		zh:{
			getValueError:'获取值失败',
		}
	},
	// 设置config的默认配置
	setDefault:function(_config){
		var defaultConfig = {
			readonly:false, // 只读
			textField : 'text',
			valueField : 'value',
			isMultiple : false,
			url : '',
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	},
	//获取html之前生成转换为maskInput所需的参数
	setConfig:function(_config){
		// var i18n = this.i18n[languagePackage.userLang];
		var _this = this;
		_this.setDefault(_config);  // 设置config的默认配置
		var cls = 'form-control';
		_config.cls = cls;
		if(typeof(_config.value) == "object"){
			if(!$.isArray(_config.value)){
				_config.value = [_config.value];
			}
		}else{
			if(_config.value !== ''){
				console.error('value值错误，业务组件的value值只可以是vo对象(列表)');
				console.error(_config);
			}
			_config.value = '';
		}
		if(_config.isMultiple && _config.value.length > 1){
			console.error('value值错误，单选时数组长度大于1');
			console.error(_config);
		}
	},
    formatConfig : function(config, formConfig){
        if(typeof(config.outputFields) == "string"){
            // outputFields输出的不是所有的字段 不包括当前id 对应的value值
            config.outputFields = JSON.parse(config.outputFields);
        }
        if(typeof(config.outputFields) == "object" &&　!$.isEmptyObject(config.outputFields)){
            // 格式化outputFields
            config.outputFields = nsUI.businessInput.getFormatOutputFields(config.outputFields);
            config.isReadOutputFields = true;
        }

    },
	// 获取文本值的html代码
	getContentHtml:function(_config){
		var content = this.getValStr(_config);
		var html = '';
		if((typeof(content)!='string' && typeof(content)!='number')||content==''){
			return html;
		}
		var tagConfig = {
			type:'acts',
			text:content,
			acts:_config.acts,
			config : _config
		}
		if(_config.seat){
			tagConfig.seat = _config.seat;
		}
		if(_config.isShowText){
			tagConfig.isShowText = _config.isShowText;
		}
		if(_config.iconsName){
			tagConfig.iconsName = _config.iconsName;
		}
		html = nsComponent.getTagHtml(tagConfig);
		return html;
	},
	// 获取value的html
	getValStr : function(_config){
		var value = _config.value;
		var textField = _config.textField;
		var valStr = '';
		if(value.length > 0){
			for(var i=0; i<value.length; i++){
				valStr += value[i][textField] + ',';
			}
			if(valStr.length > 0){
				valStr = valStr.substring(0, valStr.length-1);
			}	
		}
		return valStr;
	},
	getHtml:function(_config){
		html = '';
		switch(_config.formSource){
			case 'staticData': 		// 功能
				this.setConfig(_config);
				html = nsUI.businessInput.getContentHtml(_config);
				break;
			case 'halfScreen':  	// 半屏
				break;
			case 'fullScreen':  	// 全屏
			case 'inlineScreen':   	// 行内
				this.setConfig(_config);
				var valStr = this.getValStr(_config);;
				html = '<div class="form-control" id="' + _config.fullID + '">'+ valStr + '</div>';
				break;
			default: 				// pc
				break;
		}
		return html;
	},
	//初始化
	init:function(config,formJson){
		switch(config.formSource){
			case 'halfScreen':  // 半屏
				break;
			case 'fullScreen':  // 全屏
			case 'inlineScreen':  	// 行内
			case 'staticData':    // 功能
				// 移动端记录jQuery对象
				var $label = $('label[for="'+config.fullID+'"]');
				config.$label = $label;
				config.$formGroup = config.$label.parent(); // label对象的父对象
				config.$container = config.$label.closest('.form-td');
				config.$formItem = config.$formGroup.children('.form-item');
				config.$content = $('#' + config.fullID);
				nsUI.businessInput.initMobile(config);
				break;
			default:
				// pc端初始化
				break;
		}
	},
	// 初始化pc模式
	initPc:function(config,formJson){},
	// 初始化移动端
	initMobile:function(config){
		// formSource 表单类型标识
		var formSource = config.formSource;
		// 半屏模式添加选中标记
		if(formSource == 'halfScreen'){
			// 判断是否存在默认值 存在选中 添加显示样式
			// if(config.$formItem.children().length>0){
			// 	config.$formGroup.addClass('checked');
			// }
			return;
		}
		// 功能模式 如果没有value值 隐藏该项配置标签
		if(formSource == 'staticData'){
			// 判断是否存在默认值 不存在选中 隐藏
			if(config.$formItem.children().length == 0){
				config.$formGroup.addClass('hidden');
			}
		}
		// 只读模式不用初始化方法
		if(config.readonly==true){
			return;
		}
		if(formSource == 'inlineScreen' || formSource == 'fullScreen'){
			// 行内模式 添加chang事件用于修改config.value
			var $content = config.$content;
			$content.off('click');
			$content.on('click', { config:config }, function(ev){
				var _config = ev.data.config;
				_config.oldValue = _config.value;
				var valStr = nsUI.businessInput.getValStr(_config);
				var selectMode = 'single';
				if(_config.isMultiple){
					selectMode = 'multi';
				}
				var paramObj = {
					url : config.url,
					pageParam : {
						value : valStr,
					},
					componentConfig : {
						config : _config,
						selectMode : selectMode,
						clickHandler : function(value){
							nsUI.businessInput.setValue(config, value);
						},
					}
				}
				NetstarTemplate.componentInitByMobile(paramObj);
			});
			if(config.formSource == 'inlineScreen'){
				// 行内模式添加删除事件
				if(config.$formGroup.children('.form-btn').length>0){
					var $button = config.$formGroup.children('.form-btn').children();
					$button.off('click');
					$button.on('click', {config:config}, function(ev){
						var $focus = $(':focus');
						var $this = $(this)
						if(!$focus.is($this)){
							return;
						}
						var config = ev.data.config;
						config.showState = 'more'; // 改变字段显示位置
						$(this).closest('.form-td[mindjetfieldposition="field-more"]').remove();
					});
				}
			}
			if(typeof(config.oldValue)!='undefined' && config.oldValue!=config.value){
				function changeFunc(){
					if(typeof(config.changeHandler)=='function'){
						config.changeHandler(config.value, config);
					}
					if(typeof(config.commonChangeHandler)=='function'){
						var obj = {
							value:config.value,
							dom:config.$formItem,
							type:'business',
							id:config.id,
							config:config
						}
						config.commonChangeHandler(obj);
					}
				}
				if(config.oldValue.length != config.value.length){
					changeFunc();
				}else{
					for(var i=0; i<config.oldValue.length; i++){
						var isHave = false;
						for(var j=0;j<config.value.length;j++){
							if(config.value[j] == config.oldValue[i]){
								isHave = true;
								break;
							}
						}
						if(!isHave){
							changeFunc();
							break;
						}
					}
				}
			}
		}
	},
	//设置焦点
	setFocus:function(_config){},
	// 设置失去焦点
	setBlur:function(_config){},
	// 设置失去焦点的方法
	setBlurHandler:function(event){},
	// 设置切换表单快捷键
	setSwitchShortcutKey:function(_config){},
	// 切换表单方法
	switchShortcutKeyHandler:function(event){},
    // 通过vo（表单设置的默认值）获得业务组件value值
    getBusinessValueByVo : function(component, vo){
        var componentId = component.id;
        var outputFields = component.outputFields;
        var idField = component.idField;
        if(typeof(vo[componentId]) == "undefined" || vo[componentId] === ''){
            return '';
        }
        var value = typeof(vo[componentId]) == "object" ? vo[componentId] : {};
        if(!$.isArray(value)){
            value = [value];
        }
        function addNone(key){
            for(var i=0; i<value.length; i++){
                value[i][key] = '';
            }
        }
        function setData(key, val){
            var valArr = val.split(',');
            for(var i=0; i<valArr.length; i++){
                value[i] = typeof(value[i]) == "object" ? value[i] : {};
                value[i][key] = valArr[i];
            }
        }
        var idStr = vo[componentId];
        setData(idField, idStr);
        for(var key in outputFields){
            if(!vo[key]){
                addNone(key);
                console.error('获取vo数据中没有' + key + '字段');
                console.error(outputFields);
                console.error(vo);
                console.error(component);
            }else{
                setData(key, vo[key]);
            }
        }
        return value;
    },
    // 获取格式化后的outputFields
    getFormatOutputFields : function(outputFields){
        var souOutputFields = outputFields;
        if(typeof(souOutputFields) == "string" && souOutputFields.length > 0){
            souOutputFields = JSON.parse(souOutputFields);
        }
        souOutputFields = typeof(souOutputFields) == "object" ? souOutputFields : {};
        var outputFields = {};
        var rex = /\{(.*?)\}/; // 验证data值是否是‘{***}’样式
        for(var key in souOutputFields){
            var fieldName = souOutputFields[key];
            var isRex = rex.test(fieldName);
            if(isRex){
                fieldName = fieldName.match(rex)[1];
                outputFields[key] = fieldName;
            }
        }
        return outputFields;
    },
    // 通过原始的value（对象）获取输出value
    getBusinessValueByValObj : function(valObjArr, component){
        var componentId = component.id;
        var outputFields = $.extend(true, {}, component.outputFields);
        var idField = component.idField;
        outputFields[componentId] = idField;
        var value = {};
        for(var key in outputFields){
            value[key] = '';
        }
        for(var i=0; i<valObjArr.length; i++){
            var valObj = valObjArr[i];
            for(var key in outputFields){
                if(valObj[outputFields[key]]){
                    value[key] += valObj[outputFields[key]] + ',';
                }
            }
        }
        for(var key in value){
            if(value[key].length > 0){
                value[key] = value[key].substring(0, value[key].length-1);
            }
        }
        return value;
    },
	// 验证数据
	validate:function(_config, inputValueStr){
		if(typeof(_config.rules)=='string'&&_config.rules.length>0){
			var i18n = this.i18n[languagePackage.userLang];
			var validateMsg = nsComponent.validateMsg; // rules验证报错信息
			// 单选只支持必填 radio 
			var isLegal = true;
			var errorKey = '';
			if(_config.rules.indexOf('required')>-1){
				errorKey = 'required';
				isLegal = nsComponent.getIsValidate(inputValueStr,errorKey); // 是否合法
			}
			if(!isLegal){
				var errorInfoStr = validateMsg[errorKey];
				var errorConfig = {
					alertStr:_config.label+i18n.getValueError,
					popStr:errorInfoStr,
					stateType:'warning',
					$container:_config.$content.parent(),
					$input:_config.$content.parent(),
				}
				nsComponent.showState(errorConfig);
				return false;
			}
		}
		return true;
	},
	//获取值
	getValue:function(_config, isValid){
		var inputValueStr = '';
		if( _config.formSource == 'halfScreen' ||  // 半屏
			_config.formSource == 'fullScreen' ||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    // 功能
		){
			inputValueStr = _config.value;
		}else{
		}
		if(isValid == false){
			// 不验证时直接返回表单数据
			return inputValueStr;
		}
		var isTrue = this.validate(_config, inputValueStr);
		if(isTrue){
			var value = inputValueStr;
			if(_config.isReadOutputFields && typeof(value) == 'object'){
				value = $.isArray(value) ? value : [value];
				value = nsUI.businessInput.getBusinessValueByValObj(value, _config);
			}
			return value;
		}else{
			return false;
		}
	},
	// 赋值
	setValue:function(_config,value){
		if( _config.formSource == 'halfScreen' 		||  // 半屏
			_config.formSource == 'fullScreen' 		||  // 全屏
			_config.formSource == 'inlineScreen' 	||  // 行内
			_config.formSource == 'staticData' 	    	// 功能
		){
			_config.value = value;
			nsForm.edit([_config],_config.formID);
		}else{
			_config.$input.val(value);
		}
	},
}