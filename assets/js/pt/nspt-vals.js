nsVals.containerHeight = function () {
	var unavailableHeight = 132; //nav和userinfo高度 调整样式表后重写这个数值
	var windowHeight = $(window).height();
	return (windowHeight - unavailableHeight);
}
nsVals.layoutHeight = function () {
	var unavailableHeight = 117; //nav和userinfo高度 调整样式表后重写这个数值
	var windowHeight = $(window).height();
	return (windowHeight - unavailableHeight);
}
//转化字符串成为JSON对象 格式是"a:b,c:d"->{a:b,c:d},字符串中不需要引号和双引号
nsVals.convertOptions = function (optionsStr) {
	var options = {};
	var jsonStr = optionsStr;
	var jsonStrArr = jsonStr.split(',');
	if (jsonStr.indexOf(',') < 0) {
		jsonStrArr = [jsonStr];
	}
	for (var i = 0; i < jsonStrArr.length; i++) {
		var keyStr = jsonStrArr[i].substr(0, jsonStrArr[i].indexOf(":"));
		var valueStr = jsonStrArr[i].substr(jsonStrArr[i].indexOf(":") + 1, jsonStrArr[i].length);
		//去掉字符串中的引号、空格，转化数字和boolean
		keyStr = $.trim(keyStr);
		valueStr = valueStr.replace(/'/g, "");
		valueStr = valueStr.replace(/"/g, '');
		valueStr = $.trim(valueStr);
		if (valueStr == 'true') {
			valueStr = true;
		} else if (valueStr == 'false') {
			valueStr = false;
		} else if (/^[0-9]*$/.test(valueStr)) {
			valueStr = parseInt(valueStr);
		}
		options[keyStr] = valueStr;
	}
	return options;
}
//清除空字符串值
nsVals.clearEmptyString = function (obj) {
	$.each(obj, function (key, value) {
		if (value === '') {
			delete obj[key];
		}
	});
	return obj;
}
//清除Null值
nsVals.clearNull = function (obj) {
	$.each(obj, function (key, value) {
		if (value == null) {
			delete obj[key];
		}
	});
	return obj;
}
//过滤掉没有的表单字段id
nsVals.filterNull = function (obj, formID) {
	$.each(obj, function (key, value) {
		var config = nsForm.data[formID].formInput[key];
		if (typeof (config) == 'undefined') {
			delete obj[key];
		}
	})
	return obj;
}
//获取rules中的数值 ‘max：2, length:3’
nsVals.getRuleNumber = function (configStr, valueName) {
	var number;
	var validStr = configStr.substring(configStr.indexOf(valueName), configStr.length);

	var endIndexNum = validStr.indexOf(',')
	if (endIndexNum == -1) {
		endIndexNum = validStr.length;
	}
	number = validStr.substring(validStr.indexOf(':') + 1, endIndexNum);
	number = parseInt(number);
	return number;
}

//默认值为false  当且仅当传入对象是boolean值，且为true时，才为ture
nsVals.getDefaultFalse = function (value) {
	var returnBln = false;
	if (typeof (value) == 'boolean') {
		if (value == true) {
			returnBln = true;
		}
	}
	return returnBln;
}
//默认值为true 当且仅当传入对象是boolean值，且为false时，才为false
nsVals.getDefaultTrue = function (value) {
	var returnBln = true;
	if (typeof (value) == 'boolean') {
		if (value == false) {
			returnBln = false;
		}
	}
	return returnBln;
}
//默认值
nsVals.default = language.default;
//比较两个object对象包含的值是否相等
nsVals.isEqualObject = function (obj1, obj2) {
	//obj1和obj2必须是对象类型
	var isEqual = true;
	var obj1Length = 0;
	var obj2Length = 0;
	if (typeof (obj1) != 'object' || typeof (obj2) != 'object') {
		nsalert('nsVals.isEqualObject函数只用于比较object对象', 'error');
		if (debugerMode) {
			console.error('nsVals.isEqualObject函数只用于比较object对象');
			console.error(obj1);
			console.error(obj2);
		}
		return false;
	}
	//equalObject start--------------------------
	function equalObject(subObj1, subObj2) {
		if (typeof (subObj1) == 'undefined' || typeof (subObj2) == 'undefined') {
			return false;
		}
		switch (typeof (subObj1)) {
			case 'string':
			case 'number':
			case 'boolean':
				if (subObj1 != subObj2) {
					return false;
				}
				break;
			case 'function':
				//如果是function则不比较
				break;
			case 'object':
				//debugger
				if (subObj1 == null) {
					if (subObj2 != null) {
						return false;
					} else if (subObj2 == null) {
						//两个都是null 则相等
					}
				} else if ($.isArray(subObj1)) {
					//如果是数组
					if (!$.isArray(subObj2)) {
						//另一个不是数组
						return false;
					} else {
						//两个都是数组
						if (subObj1.length != subObj2.length) {
							//长度不同则不同
							return false;
						} else {
							//长度相同则比较所有的值
							for (var arrI = 0; arrI < subObj1.length; arrI++) {
								if (typeof (subObj1[arrI]) != typeof (subObj2[arrI])) {
									//如果类型不同则不同
									return false;
								} else {
									//类型相同比较值
									isEqual = equalObject(subObj1[arrI], subObj2[arrI]);
									if (isEqual == false) {
										return false;
									}
								}
							}
						}
					}
				} else {
					//如果不是数组，就是普通的object
					var subObj1Length = 0;
					var subObj2Length = 0;
					for (sub1I in subObj1) {
						subObj1Length++;
						if (typeof (subObj2[sub1I]) == 'undefined') {
							return false;
						} else {
							isEqual = equalObject(subObj1[sub1I], subObj2[sub1I]);
							if (isEqual == false) {
								return false;
							}
						}
					}
					for (sub2I in subObj2) {
						subObj2Length++;
					}
					if (subObj1Length != subObj2Length) {
						return false;
					}
				}
				break;
		}
		return true;
	}
	//equalObject end--------------------------
	for (i in obj1) {
		//如果obj2没有该对象则不相等
		if (typeof (obj2[i]) == 'undefined') {
			return false;
		}
		//如果obj2该对象类型不同则不相等
		if (typeof (obj1[i]) != typeof (obj2[i])) {
			return false;
		}
		//如果类型相同，则根据类型对比
		var isEqual = equalObject(obj1[i], obj2[i]);
		if (isEqual == false) {
			return false;
		}
	}
	return true;
}
//敏感字符串脱敏 15812115589->158****5589 如果小于8位，则前一半星号,如果很长，则前后四位显示，其它改变
nsVals.shieldString = function (str) {
	var strLength = str.length;
	var start = 0;
	var end = 0;
	if (strLength < 8) {
		start = 0;
		end = Math.ceil(strLength / 2);
	} else if (strLength >= 8) {
		start = strLength - 8;
		end = strLength - 4;
		if (start > 4) {
			start = 4;
		}
	}
	var startSubStr = str.substring(0, start);
	var endSubStr = str.substring(end, strLength);
	var replaceStr = '';
	for (var strI = start; strI < end; strI++) {
		replaceStr += '*';
	}
	str = startSubStr + replaceStr + endSubStr;
	return str;
}
//获取时间戳
nsVals.getTimeStamp = function () {
	return new Date().getTime();
}
//csv格式文字转成json数组  csvdata参数是字符串 convertOptions是参数，
nsVals.csv2jsonArray = function (csvdata, convertOptions) {
	var options = {
		line: '\n',   		//行分隔符
		separator: ',',		//数据分隔符
		keyName: 0,			//json name 所在行
		rowStart: 1,			//数据开始行
		rowEnd: 0,			//数据结束行（倒数）
		isAddDefaultIndex: false, //是否添加默认index字段（字段名为nsDefaultIndex）
	}
	if (typeof (convertOptions) == 'object') {
		for (option in convertOptions) {
			options[option] = convertOptions[option];
		}
	}

	var csv = csvdata;
	var csvArr = csv.split(options.line);
	var jsonArray = [];
	//keyname数组
	var keyNameArr = csvArr[options.keyName].split(options.separator);
	//去掉多余的数据
	if (options.rowStart > 0) {
		csvArr.splice(0, options.rowStart);  //去掉前面的
	}
	if (options.rowEnd > 0) {
		csvArr.splice(csvArr.length - options.rowEnd, options.rowEnd);  //去掉后面的
	}
	for (var rowI = 0; rowI < csvArr.length; rowI++) {
		if (csvArr[rowI] != '') {
			jsonArray[rowI] = {};
			if (options.isAddDefaultIndex) {
				jsonArray[rowI].nsDefaultIndex = rowI;
			}
			var dataArr = csvArr[rowI].split(options.separator);
			for (var dataI = 0; dataI < keyNameArr.length; dataI++) {
				jsonArray[rowI][keyNameArr[dataI]] = dataArr[dataI];
			}
		}
	}
	return jsonArray;
}
//csv格式文字转成数组  csvdata参数是字符串 convertOptions是参数
nsVals.csv2array = function (csvdata, convertOptions) {
	var options = {
		line: '\n',   		//行分隔符
		separator: ',',		//数据分隔符
		keyName: 0,			//json name 所在行
		rowStart: 1,			//数据开始行
		rowEnd: 0,			//数据结束行（倒数）
	}
	if (typeof (convertOptions) == 'object') {
		for (option in convertOptions) {
			options[option] = convertOptions[option];
		}
	}

	var csv = csvdata;
	var csvArr = csv.split(options.line);
	var resultArray = [];
	//keyname数组
	var keyNameArr = csvArr[options.keyName].split(options.separator);
	//去掉多余的数据
	if (options.rowStart > 0) {
		csvArr.splice(0, options.rowStart);  //去掉前面的
	}
	if (options.rowEnd > 0) {
		csvArr.splice(csvArr.length - options.rowEnd, options.rowEnd);  //去掉后面的
	}
	return {
		name: keyNameArr,
		data: csvArr
	};
}
//设置默认值，并使用配置值 defaultObj是默认值，configObj是配置值，返回配置对象

//读取服务器端标准格式数据的方法 ajax预定义
nsVals.ajax = function (config, callbackFunction, isNeedError) {
	/*** 	包含了对错误的基本处理 必须是返回格式是object 且{success:true}
	 * 		该方法只适用于非队列的ajax请求，不适用于队列情况
	 * config:object ajax擦书
	 * {
	 * 		url 		地址，		必填
	 * 		data 		参数，		选填 默认为空
	 * 		type 		GET、POST  	选填 默认为POST
	 * 		dataType 	返回值类型 	选填 默认为json
	 * 		plusData 	附加参数 	选填 默认为空
	 * 	}
	 * 	callbackFunction: funtion 	ajax完成后的回调函数, 返回的结果是服务器返回数据
	 *	isNeedError: boolean  		是否需要失败的回调, 默认为false, 只在成功的条件下回调
	 ***/
	if (typeof (isNeedError) != 'boolean') {
		isNeedError = false;
	}
	var baseAjax = {
		data: '',
		type: 'POST',
		dataType: 'json',
		cache: false,
		plusData: '',
		contentType: 'application/x-www-form-urlencoded',
	};
	//以baseAjax为默认值，使用新值就行赋值
	for (option in config) {
		baseAjax[option] = config[option];
	};
	//ajax header处理 把ajax中的header数据转化为ajax文件头 cy 20180711
	var ajaxConfig = $.extend(true, {}, baseAjax);

	if (ajaxConfig.header) {
		/******************* *sjj 20190422 添加去除包含汉字的字段值 start*****************/
		if(ajaxConfig.header.activityName){
			delete ajaxConfig.header.activityName;
		}
		if(ajaxConfig.header.processName){
			delete ajaxConfig.header.processName;
		}
		/******************* *sjj 20190422 添加去除包含汉字的字段值 end*****************/
		ajaxConfig.beforeSend = function (request) {
			$.each(ajaxConfig.header, function (key, value) {
				//ajaxConfig.header:object  {{data_auth_code: "1%2TESTCODE==/&;&"}, key:'value'}
				request.setRequestHeader(key, value);
			})
		}
	}
	//成功回调
	ajaxConfig.success = function (data, ajaxData) {
		if (data.success) {
			callbackFunction(data, this);
		} else {
			//success:false
			if (debugerMode) {
				if (typeof (data.msg) == 'undefined') {
					console.error('error.msg未定义');
				}
				console.error(data);
			}
			var errorMsg = data.msg;
			if (typeof (errorMsg) != 'string') {
				errorMsg = '服务器端未知错误';
			}
			nsalert(errorMsg, 'error');
			//失败的回调
			if (isNeedError) {
				callbackFunction(data, this);
			}
		}
	};
	//失败回调
	ajaxConfig.error = function (error) {
		//error的回调需要生成回调对象
		if (isNeedError) {
			callbackFunction({ success: false, error: error }, this);
		}
		//显示错误信息
		nsVals.defaultAjaxError(error);
	}
	$(document).ready(function(){
		$.ajax(ajaxConfig);
	})
	// $.ajax({
	// 	url: 		baseAjax.url,
	// 	data: 		baseAjax.data,
	// 	type: 		baseAjax.type,
	// 	cache: 		baseAjax.cache,
	// 	dataType: 	baseAjax.dataType,
	// 	plusData: 	baseAjax.plusData,
	// 	contentType:contentType,
	// 	//contentType: "application/json; charset=utf-8",
	// 	success:function(data,ajaxData){
	// 		if(data.success){
	// 			callbackFunction(data,this);
	// 		}else{

	// 			//success:false
	// 			if(debugerMode){
	// 				if(typeof(data.msg)=='undefined'){
	// 					console.error('error.msg未定义');
	// 				}
	// 				console.error(data);
	// 			}
	// 			var errorMsg = data.msg;
	// 			if(typeof(errorMsg)!='string'){
	// 				errorMsg = '服务器端未知错误';
	// 			}
	// 			nsalert(errorMsg,'error');
	// 			//失败的回调
	// 			if(isNeedError){
	// 				callbackFunction(data,this);
	// 			}
	// 		}
	// 	},
	// 	error:function(error){
	// 		//error的回调需要生成回调对象
	// 		if(isNeedError){
	// 			callbackFunction({success:false,error:error},this);
	// 		}
	// 		nsVals.defaultAjaxError(error);
	// 	}
	// })
}
var NSAJAXERRORINFO = {
	200: '返回数据成功，很可能是返回格式错误',
	400: 'HTTP 400 – 请求无效',
	401.1: 'HTTP 401.1 – 未授权：登录失败',
	401.2: 'HTTP 401.2 – 未授权：服务器配置问题导致登录失败',
	401.3: 'HTTP 401.3 – ACL 禁止访问资源',
	401.4: 'HTTP 401.4 – 未授权：授权被筛选器拒绝',
	401.5: 'HTTP 401.5 – 未授权：ISAPI 或 CGI 授权失败',
	403: 'HTTP 403 – 对 Internet 服务管理器 的访问仅限于 Localhost',
	403.1: 'HTTP 403.1 禁止访问：禁止可执行访问',
	403.2: 'HTTP 403.2 – 禁止访问：禁止读访问',
	403.3: 'HTTP 403.3 – 禁止访问：禁止写访问',
	403.4: 'HTTP 403.4 – 禁止访问：要求 SSL',
	403.5: 'HTTP 403.5 – 禁止访问：要求 SSL 128',
	403.6: 'HTTP 403.6 – 禁止访问：IP 地址被拒绝',
	403.7: 'HTTP 403.7 – 禁止访问：要求客户证书',
	403.8: 'HTTP 403.8 – 禁止访问：禁止站点访问',
	403.9: 'HTTP 403.9 – 禁止访问：连接的用户过多',
	403.10: 'HTTP 403.10 – 禁止访问：配置无效',
	403.11: 'HTTP 403.11 – 禁止访问：密码更改',
	403.12: 'HTTP 403.12 – 禁止访问：映射器拒绝访问',
	403.13: 'HTTP 403.13 – 禁止访问：客户证书已被吊销',
	403.15: 'HTTP 403.15 – 禁止访问：客户访问许可过多',
	403.16: 'HTTP 403.16 – 禁止访问：客户证书不可信或者无效',
	403.17: 'HTTP 403.17 – 禁止访问：客户证书已经到期或者尚未生效 HTTP',
	404: 'HTTP 404- 无法找到文件',
	405: 'HTTP 405 – 资源被禁止',
	406: 'HTTP 406 – 无法接受',
	407: 'HTTP 407 – 要求代理身份验证',
	410: 'HTTP 410 – 永远不可用',
	412: 'HTTP 412 – 先决条件失败',
	414: 'HTTP 414 – 请求 – URI 太长',
	500: 'HTTP 500 – 内部服务器错误',
	500.100: 'HTTP 500.100 – 内部服务器错误 – ASP 错误',
	500.12: 'HTTP 500-12 应用程序重新启动',
	500.13: 'HTTP 500-13 – 服务器太忙',
	500.14: 'HTTP 500-14 – 应用程序无效',
	500.15: 'HTTP 500-15 – 不允许请求 global.asa',
	501: 'Error 501 – 未实现',
	502: 'HTTP 502 – 网关错误'
}
//默认的ajax错误处理函数
nsVals.defaultAjaxError = function (error) {
	var errorinfo = error.msg;
	if (typeof (errorinfo) == 'string') {
		errorinfo = 'AJAX请求错误,' + errorinfo;
	} else {
		errorinfo = '';
		if (error.status) {
			errorinfo = 'AJAX请求错误，错误码：' + error.status
		} else {
			errorinfo = 'AJAX请求错误';
		}
	}
	nsalert(errorinfo, 'error');
	if (debugerMode) {
		console.error(this);
		console.error(error);
		// if(error.status == 200){
		// 	console.error('返回数据成功，很可能是返回格式错误');
		// }
		if (typeof (NSAJAXERRORINFO[error.status]) == "string") {
			console.error(NSAJAXERRORINFO[error.status]);
		} else {
			console.error(error.status + "错误");
		}
	}
}
/******ajax方法 
 *	包含了对错误的基本处理，返回格式可以是任意格式
 * 	如果包含{success:true}类型则应当使用nsVals.ajax方法
 *	默认情况下支队
 ***/
//默认赋值
nsVals.setDefaultValues = function (sourceJSON, defaultValuesJSON) {
	//本方法不返回值，而是直接修改sourceJSON
	//sourceJSON  当前设置
	//defaultValuesJSON 默认设置 
	if (typeof (sourceJSON) == 'undefined') {
		sourceJSON = {};
	}
	$.each(defaultValuesJSON, function (key, value) {
		if (typeof (sourceJSON[key]) == 'undefined') {
			switch (typeof (value)) {
				case 'undefined':
					break;
				case 'object':
					var emptyObject = {};
					if ($.isArray(value)) {
						emptyObject = [];
					}
					sourceJSON[key] = $.extend(true, emptyObject, value);
					break;
				default:
					sourceJSON[key] = value;
					break;
			}
		}
	})
}
//追加赋值
nsVals.extendJSON = function (sourceJSON, extendJSON) {
	$.each(extendJSON, function (key, value) {
		sourceJSON[key] = value;
	})
}
//加载用的html
nsVals.loadingHtml =
	'<div class="loading">'
	+ '<i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>'
	+ '<span>正在加载...</span>'
	+ '</div>'
//把'a=1&b=2格式化为json对象'
nsVals.getJsonFromEqualAnd = function (sourceStr) {
	//把'a=1&b=2'格式化为json对象{a:1,b:2}'
	var dataJson = {};
	var dataArray = sourceStr.split('&');
	for (var dataArrayI = 0; dataArrayI < dataArray.length; dataArrayI++) {
		var dataStr = dataArray[dataArrayI];
		dataStr = dataStr.replace(/_/g, '');
		var key = dataStr.substring(0, dataStr.indexOf('='));
		var value = dataStr.substring(dataStr.indexOf('=') + 1, dataStr.length);
		dataJson[key] = value;
	}
	return dataJson;
}
nsVals.getRootPath = function () {
	var protocolName = window.location.protocol;
	var hostName = window.location.host;
	var pathName = window.location.pathname;
	var projectName = pathName.substring(0, pathName.indexOf('/', 1))
	var rootPathStr = protocolName + '//' + hostName + projectName;
	return rootPathStr;
}
//判断是否有滚动条
nsVals.isScroll = function (el) {
	var elems = el ? [el] : [document.documentElement, document.body];
	var scrollX = false, scrollY = false;
	for (var i = 0; i < elems.length; i++) {
		var o = elems[i];
		// test horizontal
		var sl = o.scrollLeft;
		o.scrollLeft += (sl > 0) ? -1 : 1;
		o.scrollLeft !== sl && (scrollX = scrollX || true);
		o.scrollLeft = sl;
		// test vertical
		var st = o.scrollTop;
		o.scrollTop += (st > 0) ? -1 : 1;
		o.scrollTop !== st && (scrollY = scrollY || true);
		o.scrollTop = st;
	}
	// ret
	return {
		scrollX: scrollX,
		scrollY: scrollY
	};
};
//转换文本格式到html格式 转换 空格=>全角空格 回车=>P
nsVals.getHtmlByTxtUI = function () {
	var dialogConfig = {
		id: 'dialog-getHtmlByTxtUI',
		form: [
			{
				id: 'tagp',
				label: '段落转换标识',
				type: 'text'
			},
			{
				id: 'isBeforeTap',
				label: '标识位置',
				type: 'radio',
				subdata: [
					{
						value: 1,
						text: '前',
						isChecked: true,
					},
					{
						value: 0,
						text: '后'
					}
				]
			},
			{
				id: 'text',
				label: '待转换文本',
				type: 'textarea',
				height: 200
			},
			{
				id: 'html',
				label: '转换完成文本',
				type: 'textarea',
				height: 200
			}
		],
		btns: [
			{
				text: 'getHTML',
				handler: function (ev) {
					var formJson = nsdialog.getFormJson()
					var textStr = formJson.text;
					if (dialogConfig == '') {
						console.error('文本转换内容不能为空');
						return false;
					}
					var config = {
						text: textStr,
						isRepleaceBr: false,
						isClearBr: true,
						isClearSpace: true,
					}
					if (formJson.tagp != '') {
						config.tagP = formJson.tagp;
						console.log(formJson.isBeforeTap);
						config.isBeforeTap = formJson.isBeforeTap == '0';
					}
					var htmlStr = nsVals.getHtmlByTxt(config);

					nsForm.fillValues({ html: htmlStr }, 'dialog-getHtmlByTxtUI')
				}
			}
		]
	}
	nsdialog.initShow(dialogConfig);
}
nsVals.getHtmlByTxt = function (config) {
	var textStr = config.text;
	if (typeof (textStr) != 'string') {
		console.error('文本转换内容必须是string类型');
		return false;
	}
	if (textStr == '') {
		console.error('文本转换内容不能为空');
		return false;
	}
	//是否清除回车
	if (config.isClearBr) {
		textStr = textStr.replace(/\n/g, '');
	}
	//是否替换回车
	if (config.isClearSpace) {
		textStr = textStr.replace(/\n/g, '<br>');
	}
	//是否清除空格
	if (config.isClearSpace) {
		textStr = textStr.replace(/ /g, '');
		textStr = textStr.replace(/　/g, '');
	}
	//根据标识字符自动生成段落标签
	if (config.tagP) {
		var tagPRegexp = new RegExp(config.tagP);
		var isHaveTagP = tagPRegexp.test(tagPRegexp);
		var tagP = new RegExp(config.tagP, 'g');
		//根据参数判断插入位置是前还是后
		console.log(config.isBeforeTap);
		var replaceStr = config.isBeforeTap ? config.tagP + '</p><p>' : '</p><p>' + config.tagP;
		textStr = textStr.replace(tagP, replaceStr);
		if (textStr.indexOf(replaceStr) == 0) {
			textStr = textStr.replace(replaceStr, config.tagP);
		}
		if (isHaveTagP) {
			textStr = '<p>' + textStr + '</p>';
		}
	}
	return textStr;
}
//获取IE版本
nsVals.getIEBrowserVersion = function () {

	var userAgent = navigator.userAgent.toLowerCase();
	var browserVersion = '';
	var browserSystem = 'pc'
	//获取IE版本  return  {IE11,pc}
	if (userAgent.match(/msie ([\d.]+)/) != null) {
		//ie6--ie9                
		uaMatch = userAgent.match(/msie ([\d.]+)/);
		browserVersion = 'IE' + uaMatch[1];
	} else if (userAgent.match(/(trident)\/([\w.]+)/)) {
		//ie8--ie11   
		uaMatch = userAgent.match(/trident\/([\w.]+)/);
		switch (uaMatch[1]) {
			case "4.0":
				browserVersion = "IE8";
				break;
			case "5.0":
				browserVersion = "IE9";
				break;
			case "6.0":
				browserVersion = "IE10";
				break;
			case "7.0":
				browserVersion = "IE11";
				break;
			default:
				return false;
		}
	}

	var bIsIpad = userAgent.match(/ipad/i) == "ipad";
	var bIsIphoneOs = userAgent.match(/iphone os/i) == "iphone os";
	var bIsMidp = userAgent.match(/midp/i) == "midp";
	var bIsUc7 = userAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
	var bIsUc = userAgent.match(/ucweb/i) == "ucweb";
	var bIsAndroid = userAgent.match(/android/i) == "android";
	var bIsCE = userAgent.match(/windows ce/i) == "windows ce";
	var bIsWM = userAgent.match(/windows mobile/i) == "windows mobile";
	if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
		browserSystem = 'mobile';
		if (bIsIpad) {
			browserVersion = 'ipad';
		} else if (bIsIphoneOs) {
			browserVersion = 'iphone';
		} else if (bIsMidp) {
			browserVersion = 'midp';
		} else if (bIsUc7) {
			browserVersion = 'uc7';
		} else if (bIsUc) {
			browserVersion = 'ucweb';
		} else if (bIsAndroid) {
			browserVersion = 'android';
		} else if (bIsCE) {
			browserVersion = 'windowsce';
		} else if (bIsWM) {
			browserVersion = 'windowsmobile';
		}
	}

	if ($(window).width() < 767) {
		browserSystem = 'mobile';
	}

	//暂时处理
	if (browserSystem == 'mobile' && $(window).width() >= 767) { browserSystem = 'pc'; }
	return {
		browserVersion: browserVersion,
		browserSystem: browserSystem
	}
}

//如果是IE则在body添加IE版本的class
$(function () {
	var browser = nsVals.getIEBrowserVersion();
	if (browser) {
		//browser.browserSystem
		$('body').attr({ 'ns-browser': browser.browserVersion, 'ns-system': browser.browserSystem });
		nsVals.browser = browser;
	}
	nsVals.getDictAjax();
})

//获取url地址参数
nsVals.getUrlPara = function () {
	var url = document.location.toString();
	var paraStr = url.substr(url.indexOf('?') + 1);
	var paraArr = paraStr.split('&');
	var paraObj = {};
	for (var paraI = 0; paraI < paraArr.length; paraI++) {
		equalIndex = paraArr[paraI].indexOf('=');
		paraName = paraArr[paraI].substr(0, equalIndex);
		paraValue = paraArr[paraI].substr(equalIndex + 1);
		paraObj[paraName] = paraValue;
	}
	return paraObj;
}
//操作统一保存数据的标识 无操作0  新增1 修改2 删除-1
NSSAVEDATAFLAG = {
	NULL: 0,
	ADD: 1,
	DELETE: -1,
	EDIT: 2,
	VIEW: 3,
}
//选中标识
NSCHECKEDFLAG = {
	KEY: 'objectCheckState',
	VALUE: 1
}
//界面传参
NSROWAUTOPARAM = {
	workItemId: 'workItemId',//流程图的id
}
//页面部分html高度
NSPAGEPARTHEIGHT = {
	title: 40, //表格标题/搜索框高度
	footer: 40,//表格底部操作栏高度
	nav: 51,//页面顶部导航栏
	compact: 32,//表格行紧凑模式 高度32
	wide: 40 //宽松模式 高度40
}
nsVals.dictData = {};
/********************20180423 sjj 读取所有字典start************************************/
//获取字典
nsVals.getDictAjax = function () {
	var isContinue = true;
	if (typeof (nsUIConfig) == 'undefined') {
		isContinue = false;
		return false;
	}
	if (isContinue) {
		if (typeof (nsUIConfig.systemDictUrl) == 'undefined') {
			return false;
		}
	}
	//'/assets/json/dict/dicttype.json'
	var listAjax = {
		url: getRootPath() + nsUIConfig.systemDictUrl,
		data: {},
		type: 'GET',
		async: AJAXASYNC,
	}
	nsVals.ajax(listAjax, function (res) {
		var data = res.rows;
		var dictData = {};
		for (dataI = 0; dataI < data.length; dataI++) {
			var dictType = data[dataI].dictIsTree === 1 ? 'tree' : 'list';//类型
			dictData[data[dataI].dictName] = {
				type: dictType,
				subdata: [],
				jsondata: {},
			}
			for (var subI = 0; subI < data[dataI].dictValueList.length; subI++) {
				var subObj = {
					id: data[dataI].dictValueList[subI].dictKeyValue,
					value: data[dataI].dictValueList[subI].dictKeyName,
					parentId: data[dataI].dictValueList[subI].dictValueParentId,
				}
				// lyw 20190417 添加默认选中
				if(data[dataI].dictValueList[subI].dictValueIsDefault===1){
					subObj.selected = true;
				}
				dictData[data[dataI].dictName].subdata.push(subObj);
				dictData[data[dataI].dictName].jsondata[data[dataI].dictValueList[subI].dictKeyValue] = data[dataI].dictValueList[subI].dictKeyName;
			}
			if (dictType === 'tree') {
				var resConfig = {
					textField: 'value',
					valueField: 'id',
					parentIdField: 'parentId',
					idField: 'id',
					childIdField: 'children',
				}
				dictData[data[dataI].dictName].subdata = nsDataFormat.getTreeDataByRows(dictData[data[dataI].dictName].subdata, resConfig);
			}
		}
		nsVals.dictData = dictData;
	})
}
//正则替换字符串
nsVals.getTextByFieldFlag = function (contentStr, data) {
	/*
		*根据大括号匹配正则替换大括号中的值
		*contentStr 文本值
		*data 数据对象
		*例子：文件{name}
	*/
	//var match = /\{(.*?)\}/g.exec(contentStr);
	var match = /\{([^:]*?)\}/g.exec(contentStr);
	while (match != null) {
		contentStr = contentStr.replace(new RegExp('\\{' + match[1] + '\\}', 'g'), data[match[1]]);
		match = /\{(.*?)\}/g.exec(contentStr);
	}
	return contentStr;
}
//下载文件
nsVals.downloadFile = function (filename, data) {
	/** 
	 * filename 	string 生成的文件名  例如 'demo.xml'fileName+'.xmmap', 'data:application/xml;filename=exportData;' + base64data);
	 * data  		string 数据文本（可能是二进制文本） 例如 'data:application/xml;filename=exportData;base64,AASD3'
	 * 				如果需要转成base64 需要使用
	 **/
	var DownloadEvt = null
	var DownloadLink = document.createElement('a');
	if (DownloadLink) {
		document.body.appendChild(DownloadLink);
		DownloadLink.style = 'display: none';
		DownloadLink.download = filename;
		DownloadLink.href = data;
		if (document.createEvent) {
			if (DownloadEvt == null)
				DownloadEvt = document.createEvent('MouseEvents');
			DownloadEvt.initEvent('click', true, false);
			DownloadLink.dispatchEvent(DownloadEvt);
		}
		else if (document.createEventObject)
			DownloadLink.fireEvent('onclick');
		else if (typeof DownloadLink.onclick == 'function')
			DownloadLink.onclick();
		document.body.removeChild(DownloadLink);
	}
}
/*对数字文本形式的string(例如:86%)并进行数学计算********************/
nsVals.stringCalculate = function (numStr, calcStr) {
	var matchObj = numStr.match(/\d*/);
	if (matchObj[0] != '') {
		//数字部分
		var numberStr = matchObj[0];
		//文本部分
		var stringStr = numStr.substr(matchObj.index + matchObj[0].length, numStr.length - 1);
		//计算并拼接
		var resultStr = eval(numberStr + calcStr) + stringStr;
		return resultStr;
	} else {
		return false;
	}
}
/********************20180423 sjj 读取所有字典end**************************************/
//获取ajax配置参数 根据数据和ajax的配置设置，获取ajax
nsVals.getAjaxConfig = function (ajaxConfig, ajaxData, options) {
	/*****主要是处理ajax.data，并且把data转string，POST下指定了contentType = "application/json; charset=utf-8";
	 *ajaxConfig:object ajax配置参数
	 * {
	 *	src:string,
	 *	type:string,
	 *	data:object,  //原始的参数会以默认值形式和ajaxData混合并返回
	 *	dataFormat:string,  //传值对象 normal object id ids
	 *	matrixVariable:boolean //是否矩阵变量传值 默认false
	 *	isSendOutFields  是否要发送容器表单的值 boolean 
	 *	paramsType: combine  separator
	 * }
	 * ajaxData:object 要发送的ajax参数{name:''}
	 *options: object 其他配置参数
	 	* idField:主键id
	 	* keyField:数据来源
	 	*child:{
			idField:子表id
			keyField:子表key
	 	}
	 	*dialogBeforeConfig  {
			currentTable:'main/child'
			selectData:'',
			containerFormJson:{}
	 	}
	 */
	//regexp标签测试
	var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
	//添加原始配置中的ajax.data, 到新方法中
	var _ajaxConfig = $.extend(true, {}, ajaxConfig);
	var _ajaxData = $.extend(true, {}, ajaxData);//克隆大对象集合的data
	//返回data参数
	var returnAjaxData = {};
	var valueData = {};
	var containerFormJson = {};//容器面板中表单数据
	var isSendOutFields = typeof (_ajaxConfig.isSendOutFields) == 'boolean' ? _ajaxConfig.isSendOutFields : false;//默认不发送容器表单参数
	var matrixVariable = typeof (_ajaxConfig.matrixVariable) == 'boolean' ? _ajaxConfig.matrixVariable : false;
	var resourceTopageParams = {};//来源于topage的参数
	if (typeof (options) == 'object') {
		if (typeof (options.dialogBeforeConfig) == 'object') {
			valueData = options.dialogBeforeConfig.selectData;
			containerFormJson = options.dialogBeforeConfig.containerFormJson;
		}
		if (options.pageParam) {
			//参数来源处理
			if (!matrixVariable) {
				//正常参数处理
				if ($.isEmptyObject(_ajaxData)) {
					if (isSendOutFields) {
						//作为外部参数使用
					} else {
						_ajaxData = valueData;
					}
				}
				switch (_ajaxConfig.dataLevel) {
					case 'parent':
						//父元素
						if (options.keyField) {
							var pageParam = options.pageParam;
							pageParam[options.keyField] = _ajaxData;
							_ajaxData = pageParam;
						}
						break;
					case 'id':
						var id = options.pageParam[options.parentObj.idField];
						_ajaxData.id = id;
						resourceTopageParams = { id: id };
						break;
					case 'ids':
						var mainData = options.pageParam;
						var ids = '';
						if ($.isArray(mainData)) {
							for (var mainI = 0; mainI < mainData.length; mainI++) {
								ids += mainData[mainI][options.parentObj.idField] + ',';
							}
						} else {
							for (var main in mainData) {
								if (typeof (mainData[main]) == 'object') {
									ids += mainData[main][options.parentObj.idField] + ',';
								}
							}
						}
						ids = ids.substring(0, ids.lastIndexOf(','));
						_ajaxData.ids = ids;
						resourceTopageParams = { ids: ids };
						break;
					case 'child':
						//子元素
						//if(options.keyField){
						var pageParam = options.pageParam;
						if (typeof (pageParam) == 'object') {
							if (typeof (pageParam[0]) == 'object') {
								var childArr = [];
								for (var c in pageParam) {
									if (typeof (pageParam[c]) == 'object') {
										childArr.push(pageParam[c]);
									}
								}
								pageParam = childArr;
							}
						}
						_ajaxData[options.parentObj.keyField] = pageParam;
						if (typeof (_ajaxConfig.data) == 'object') {
							_ajaxData.data_auth_code = _ajaxConfig.data.data_auth_code;
						}
						//}
						break;
					case 'onlyChildIds':
						var childData = options.pageParam[options.parentObj.keyField];
						var ids = '';
						for (var childI = 0; childI < childData.length; childI++) {
							ids += childData[childI][options.idField] + ',';
						}
						ids = ids.substring(0, ids.lastIndexOf(','));
						_ajaxData.childIds = ids;
						break;
					case 'noone':
						//适用于大保存的不进行值处理
						break;
					case 'brothers':
					default:
						//同级
						var pageParams = $.extend(true,{},options.pageParam);
						delete pageParams.parentSourceParam;
						_ajaxData = $.extend(true,pageParams, _ajaxData);
						//topage传值批量操作
						if ($.isArray(pageParams)) {
							options.dialogBeforeConfig = {
								selectData: pageParams
							};
						}
						if(!$.isEmptyObject(valueData)){
							_ajaxData = $.extend(true,valueData, _ajaxData);
							//nsVals.extendJSON(_ajaxData,valueData);
						}
						break;
				}
			}
		}
	}

	//处理地址
	if (_ajaxConfig.src) {
		_ajaxConfig.url = _ajaxConfig.src;
		delete _ajaxConfig.src;
	}
	/*
	 * normal  		则只附加参数
	 * object 		则用对象名称包裹，返回标准对象格式
	 * id 			只使用id作为参数
	 * ids 			返回ids格式，用于批量操作主表
	 * childIds 	返回childIds格式，用于批量操作子表
	 */
	switch (_ajaxConfig.dataFormat) {
		case 'normal':
			returnAjaxData = $.extend(true, {}, _ajaxData);
			//2018sjj1024
			/*if (_ajaxConfig.contentType == "application/json; charset=utf-8") {
				returnAjaxData = JSON.stringify(returnAjaxData);
			}*/
			break;
		case 'ids':
			returnAjaxData = _ajaxData;
			var idsStr = '';
			if(_ajaxConfig.requestSource == 'checkbox'){
				//sjj 20190312 新模板中配置了多选 keyfield为selectedList
				if($.isArray(_ajaxData.selectedList)){
					idsStr = '';
					for(var selectI=0; selectI<_ajaxData.selectedList.length; selectI++){
						idsStr += _ajaxData.selectedList[selectI][options.idField] + ',';
					}
					delete returnAjaxData.selectedList;
				}else{
					//弹出框的下拉值
					if ($.isArray(valueData.selectedList)) {
						var selectedList = valueData.selectedList;
						for (var childI = 0; childI < selectedList.length; childI++) {
							idsStr += selectedList[childI][options.idField] + ',';
						}
					}
				}
			}else{
				//当前模式是单选模式
				//弹出框获取到的值应该是个vo
				if(!$.isEmptyObject(valueData)){
					idsStr = valueData[options.idField];
				}
			}
			if(idsStr.indexOf(',')>-1){
				idsStr = idsStr.substring(0, idsStr.lastIndexOf(','));
			}
			returnAjaxData.ids = idsStr;
			//如果是topage界面 sjj 20180921 传值方式id
			if (!$.isEmptyObject(resourceTopageParams)) {
				for (var resource in resourceTopageParams) {
					returnAjaxData[resource] = resourceTopageParams[resource];
				}
			}
			//returnAjaxData = $.extend(true,returnAjaxData,_ajaxData);
			if(_ajaxConfig.data){
				if (_ajaxConfig.data.data_auth_code) { returnAjaxData.data_auth_code = _ajaxConfig.data.data_auth_code; }
			}
			break;
		case 'childIds':
			//存在定义了子ids
			var returnAjaxData = $.extend(true, {}, _ajaxData);
			var currentOperator = options.dialogBeforeConfig.btnOptionsConfig.currentTable;//当前表是主表还是附表
			var pageData = options.dialogBeforeConfig.selectData;//弹框之前从界面获取到的值
			if (currentOperator === 'child') {
				//操作的是子表
				var childData = pageData[options.child.keyField];
				if (childData) {
					//子表存在选中值
					var idsStr = '';
					for (var childI = 0; childI < childData.length; childI++) {
						idsStr += childData[childI][options.child.idField] + ',';
					}
					idsStr = idsStr.substring(0, idsStr.lastIndexOf(','));
					returnAjaxData.childIds = idsStr;
				}
			}
			if (_ajaxConfig.data.data_auth_code) { returnAjaxData.data_auth_code = _ajaxConfig.data.data_auth_code; }
			break;
		case 'onlyChildIds':
			var onlyChildIdData = $.extend(true, {}, _ajaxData);
			if ($.isEmptyObject(onlyChildIdData)) {
				onlyChildIdData = options.dialogBeforeConfig.selectData;
			}
			//操作的是子表
			var childData = onlyChildIdData[options.child.keyField];
			if (childData) {
				//子表存在选中值
				var idsStr = '';
				for (var childI = 0; childI < childData.length; childI++) {
					idsStr += childData[childI][options.child.idField] + ',';
				}
				idsStr = idsStr.substring(0, idsStr.lastIndexOf(','));
				returnAjaxData.childIds = idsStr;
			}
			if (_ajaxConfig.data.data_auth_code) { returnAjaxData.data_auth_code = _ajaxConfig.data.data_auth_code; }
			break;
		case 'id':
			//只发送id
			var idData = _ajaxData;
			if ($.isEmptyObject(idData)) {
				idData = valueData;
			}
			if (NSROWAUTOPARAM) {
				//存在行数据传参 sjj20181107
				for (var field in NSROWAUTOPARAM) {
					if (idData[NSROWAUTOPARAM[field]]) {
						//存在此值
						returnAjaxData[NSROWAUTOPARAM[field]] = idData[NSROWAUTOPARAM[field]];
					}
				}
			}
			returnAjaxData.id = idData[options.idField];
			returnAjaxData = $.extend(true, returnAjaxData, _ajaxConfig.data);
			break;
		case 'list':
			var mainData = $.extend(true, {}, _ajaxData);
			if ($.isEmptyObject(mainData)) {
				mainData = options.dialogBeforeConfig.selectData;
			}
			//操作的是子表
			returnAjaxData[options.keyField] = mainData;
			break;
		case 'volist':
			returnAjaxData = _ajaxData;
			returnAjaxData[options.keyField] = options.dialogBeforeConfig.selectData;
			break;
		case 'custom':
			//sjj 20181029
			//ajaxDataParamFormat
			var objData = valueData;
			if (!$.isEmptyObject(_ajaxData)) {
				if (_ajaxData.mainList) {

				} else {
					objData.dialogForm = _ajaxData;
				}
			}
			if (_ajaxConfig.ajaxDataParamFormat) {
				var format = JSON.parse(_ajaxConfig.ajaxDataParamFormat);
				returnAjaxData = nsVals.getVariableJSON(format, objData, false);
			} else {
				returnAjaxData = objData;
			}
			break;
		case 'object':
		default:
			//完整业务对象 如果使用了{参数}则返回定制参数
			var isUseObject = true;
			var customAjaxData = {};
			var objData = _ajaxData;
			if($.isEmptyObject(objData)){
				 objData = valueData;
			}
			//不是通过topage传送的参数  存在同时会有界面值和通过dialog弹出值的
			if(options){
				if(typeof(options.pageParam)=='undefined'){
					if(_ajaxConfig.dataLevel == 'ids'){
						var pageData = options.dialogBeforeConfig.selectData;
						var idsStr = '';
						if (!$.isEmptyObject(pageData)) {
							if ($.isArray(pageData)) {
								for (var childI = 0; childI < pageData.length; childI++) {
									idsStr += pageData[childI][options.idField] + ',';
								}
							} else {
								idsStr = pageData[options.idField];
							}
						}
						idsStr = idsStr.substring(0, idsStr.lastIndexOf(','));
						if(idsStr){
							objData.ids = idsStr;
						}
					}
				}
			}
			for (var key in _ajaxConfig.data) {
				if (ajaxParameterRegExp.test(_ajaxConfig.data[key])) {
					isUseObject = false;
					break;
					//nsVals.getTextByFieldFlag //sjj 20190510修改
					//customAjaxData[key] = nsVals.getTextByFieldFlag(_ajaxConfig.data[key], objData);
					//if (customAjaxData[key] === 'undefined') {
						//customAjaxData[key] = '';
					//}
				} else {
					customAjaxData[key] = _ajaxConfig.data[key];
				}
			}
			if (isUseObject) {
				//完整业务对象
				returnAjaxData = $.extend(true,objData,_ajaxConfig.data);
			} else {
				//returnAjaxData = customAjaxData sjj 20190510  注释
				//定制返回数据{opportunityOwnerId.userId} {selectedList}
				returnAjaxData = nsVals.getVariableJSON(_ajaxConfig.data, objData);
				if($.isArray(returnAjaxData.ids)){
					var idsStr = '';
					for (var i = 0; i < returnAjaxData.ids.length; i++) {
						idsStr += returnAjaxData.ids[i][options.idField] + ',';
					}
					if(idsStr.indexOf(',')>-1){
						idsStr = idsStr.substring(0, idsStr.lastIndexOf(','));
					}
					returnAjaxData.ids = idsStr;
				}
			}
			break;
	}
	if (_ajaxConfig.isSendOutFields) {
		//需要发送额外参数
		switch (_ajaxConfig.paramsType) {
			case 'combineVariable':
				for (var out in containerFormJson) {
					returnAjaxData[out] = containerFormJson[out];
				}
				break;
			case 'matrixVariable':
				//矩阵变量
				var matrixVariableStr = '';
				var matrixParams = containerFormJson;
				if ($.isEmptyObject(matrixParams)) {
					matrixParams = valueData;
					//外部传值可能是通过当前界面选中值 匹配相关data配置参数通过矩阵传值
					if ($.isArray(valueData)) {
						matrixParams = valueData[0];
					}
				}
				var customAjaxData = {};
				for (var key in ajaxConfig.data) {
					if (ajaxParameterRegExp.test(ajaxConfig.data[key])) {
						customAjaxData[key] = nsVals.getTextByFieldFlag(ajaxConfig.data[key], matrixParams);
						if (customAjaxData[key] === 'undefined') {
							customAjaxData[key] = '';
						}
					} else {
						customAjaxData[key] = _ajaxConfig.data[key];
					}
				}
				for (var matrix in customAjaxData) {
					matrixVariableStr += '/;' + matrix + '=' + customAjaxData[matrix];
				}
				_ajaxConfig.url = _ajaxConfig.url + matrixVariableStr;
				returnAjaxData = $.extend(true, {}, _ajaxData);
				break;
			default:
				console.warn('paramsType:参数未定义');
				break;
		}
	}
	if (matrixVariable) {
		var matrixVariableStr = '';
		if (options.pageParam) {
			for (var variable in options.pageParam) {
				matrixVariableStr += ';' + variable + '=' + options.pageParam[variable];
			}
		}
		
	}
	if(typeof(_ajaxConfig.matrixVariable)=='string'){
		if(_ajaxConfig.matrixVariable != ''){
			_ajaxConfig.url = _ajaxConfig.url + _ajaxConfig.matrixVariable;
		}
	}

	returnAjaxData = nsServerTools.deleteEmptyData(returnAjaxData);
	_ajaxConfig.data = returnAjaxData;
	if (_ajaxConfig.type.toUpperCase() == 'GET') {
		//主要用于前端开发测试用
	} else {

		if(_ajaxConfig.contentType){
			if(_ajaxConfig.contentType == "application/json"){
				_ajaxConfig.contentType = "application/json; charset=utf-8";
			}
		}else{
			_ajaxConfig.contentType = "application/json; charset=utf-8";
		}
		if(_ajaxConfig.contentType == 'application/json; charset=utf-8'){
			_ajaxConfig.data = JSON.stringify(returnAjaxData);
		}
		/*switch (_ajaxConfig.dataFormat) {
			case 'id':
			case 'normal':
				break;
			case 'custom':
				//sjj20181029
				if (_ajaxConfig.contentType == 'application/json; charset=utf-8') {
					_ajaxConfig.data = JSON.stringify(returnAjaxData);
				}
				break;
			case 'object':
			case 'list':
			default:
				_ajaxConfig.data = JSON.stringify(returnAjaxData);
				_ajaxConfig.contentType = "application/json; charset=utf-8";
				break;
		}*/
	}
	return _ajaxConfig;
}

//根据身份证号获取详细信息
nsVals.getDetailInfoByIcd = function (codeIcd) {
	var sexMap = { 1: "男", 0: "女" };    //
	var linkJson = provinceSelect.data;
	if (nsValid.test(codeIcd, 'Icd')) {
		var codeLength = codeIcd.length;//身份证号15,18？
		var sexName = '';//性别2代表女1代表男3是未知
		var sexId = '3';//性别2代表女1代表男3是未知
		var city = '';//籍贯
		var cityCode = '';//编码
		var brithDate = '';//出生日
		var brithYear = '';//年份
		var brithmonth = '';//月份
		var birthDay = '';//日
		var age = '';//年龄
		var cYear = moment().year();
		var cMonth = moment().month() + 1;
		var cDate = moment().get('date');
		switch (codeLength) {
			case 15:
				//7、8出生年份两位 9、10出生月份 11、12出生日期  15性别（奇数男，偶数女）
				brithYear = '19' + codeIcd.substring(6, 8);
				brithmonth = codeIcd.substring(8, 10);
				birthDay = codeIcd.substring(10, 12);
				brithDate = brithYear + '-' + brithmonth + '-' + birthDay;
				//获取性别
				sexName = sexMap[codeIcd.substring(14, 15) % 2];
				break;
			case 18:
				//7,8,9,10出生年份 11、12出生月份 13,14出生日期  17性别（奇数男，偶数女）
				brithYear = codeIcd.substring(6, 10);
				brithmonth = codeIcd.substring(10, 12);
				birthDay = codeIcd.substring(12, 14);
				brithDate = brithYear + '-' + brithmonth + '-' + birthDay;
				//获取性别
				sexName = sexMap[codeIcd.substring(16, 17) % 2];
				break;
		}
		if (sexName === '男') {
			sexId = "1";
		} else if (sexName === '女') {
			sexId = "2";
		}
		//获取年龄
		age = cYear - brithYear - 1;
		if (brithmonth < cMonth || brithmonth == cMonth && birthDay <= cDate) {
			age++;
		}
		var cityData = linkJson[codeIcd.substring(0, 6)];
		var proJson = linkJson[cityData.city.code];
		city = proJson.pro.name + ',' + cityData.city.name + ',' + cityData.area.name;
		cityCode = { pro: proJson.pro, city: cityData.city, area: cityData.area };
		var json = {
			city: city,
			cityCode: cityCode,
			sexName: sexName,
			sexId: sexId,
			age: age,
			brithDate: brithDate,
			brithYear: brithYear,
			brithmonth: brithmonth,
			birthDay: birthDay
		}
		return json;
	}
}

//获取个人信息
nsVals.personInfoHtml = function (configObj, data) {
	var $container = configObj.$container;
	var fieldArray = configObj.field;
	var detailArray = [];//配置参数
	var physicalCodeJson = {};//体检编号
	// 所有字段遍历
	if (configObj.type == 1 || typeof (configObj.type) == 'undefined') {
		for (var fieldI = 0; fieldI < fieldArray.length; fieldI++) {
			var fieldData = fieldArray[fieldI];
			if (typeof (data[fieldData.id]) == 'undefined') { data[fieldData.id] = ''; }
			switch (fieldData.id) {
				case configObj.imageSrc:
				case configObj.name:
				case configObj.sex:
					break;
				case configObj.code:
					physicalCodeJson = fieldData;
					break;
				default:
					detailArray.push({
						label: fieldData.label,
						id: fieldData.id
					});
					break;
			}
		}
	} else if (configObj.type == 2) {
		// 如果需要根据websocket进行修改
		for (var key in configObj.field) {
			if (configObj.field.hasOwnProperty(key)) {
				var element = configObj.field[key];
				if (typeof (data[element.id]) == 'undefined') { data[element.id] = ''; }
				if (element.hasOwnProperty('label')) {
					if (key == 'code') {
						physicalCodeJson = element;
					} else {
						detailArray.push({
							label: element.label,
							id: element.id
						});
					}
				} else {
					switch (key) {
						case 'imageSrc':
							configObj.imageSrc = element.id;
							break;
						case 'name':
							configObj.name = element.id;
							break;
						case 'sex':
							configObj.sex = element.id;
							break;
					}
				}
			}
		}
	}
	//体检编号
	var codeHtml = '<div class="user-number-layout">'
		+ '<span class="user-number-label">' + physicalCodeJson.label + '：</span>'
		+ '<span class="user-number">'
		+ '<input type="text" name="" class="form-control" ns-type="code" id="' + physicalCodeJson.id + '" value="' + data[physicalCodeJson.id] + '">'
		+ '</span>'
		+ '</div>';
	//基本信息（姓名性别头像）
	var userNameStr = data[configObj.name] ? data[configObj.name] : '';
	var picUrl = data[configObj.imageSrc] ? data[configObj.imageSrc] : '';
	var hideImageClassStr = picUrl ? '' : 'hide';
	var imgHtml = '<img class="user-image" src="' + picUrl + '" class="' + hideImageClassStr + '" />';
	var nameHtml = '<span class="user-name">' + userNameStr + '</span>';
	var iconStr = '';
	var sexClassStr = '';
	switch (data[configObj.sex]) {
		case '1':
			iconStr = 'fa-mars';
			sexClassStr = 'user-sex-male';
			break;
		case '2':
			iconStr = 'fa-venus';
			sexClassStr = 'user-sex-female';
			break;
	}
	var sexHtml = '<span class="user-sex ' + sexClassStr + '"><i class="' + iconStr + '"></i></span>';

	var baseInfoHtml = '<div class="user-photo-layout">'
		+ '<div class="user-photo">'
		+ '<div class="user-photo-img">'
		+ imgHtml
		+ '</div>'
		+ '<div class="user-photo-text">'
		+ nameHtml + sexHtml
		+ '</div>'
		+ '</div>'
		+ '</div>';//输出基本信息
	var detailHtml = '<div class="user-info-list"><ul>'; //详细信息
	for (var detailI = 0; detailI < detailArray.length; detailI++) {
		var detailData = detailArray[detailI];
		detailHtml += '<li class="user-info-list-item">'
			+ '<label class="title">' + detailData.label + '：</label>'
			+ '<span class="content">' + data[detailData.id] + '</span>'
			+ '</li>';
	}
	detailHtml += '</ul></div>';
	var iconHtml = '';
	//存在图标字段的定义 
	if (typeof (configObj.isShowIcon) == 'boolean') {
		if (configObj.isShowIcon) {
			iconHtml = '<i class="icon-finish-check"></i>';
		}
	}
	$container.html(codeHtml + '<div class="user-info-body">' + iconHtml + baseInfoHtml + detailHtml + '</div>');
	$container.find('input[ns-type="code"]').on('keydown', function (ev) {
		// 只监听回车键，回车才请求
		if (ev.type == 'keydown') {
			if (ev.keyCode != '13') return;
		}
		var $this = $(this);
		var value = $.trim($this.val());
		if (typeof (configObj.changeHandler) == 'function') {
			return configObj.changeHandler({
				id: $this.attr('id'),
				value: value
			})
		}
	});
}
//阿拉伯数字转换为简写汉字
nsVals.Arabia_To_SimplifiedChinese = function (Num) {
	for (i = Num.length - 1; i >= 0; i--) {
		Num = Num.replace(",", "")//替换Num中的“,”
		Num = Num.replace(" ", "")//替换Num中的空格
	}
	if (isNaN(Num)) { //验证输入的字符是否为数字
		//alert("请检查小写金额是否正确");
		return;
	}
	//字符处理完毕后开始转换，采用前后两部分分别转换
	part = String(Num).split(".");
	newchar = "";
	//小数点前进行转化
	for (i = part[0].length - 1; i >= 0; i--) {
		if (part[0].length > 10) {
			//alert("位数过大，无法计算");
			return "";
		}//若数量超过拾亿单位，提示
		tmpnewchar = ""
		perchar = part[0].charAt(i);
		switch (perchar) {
			case "0": tmpnewchar = "零" + tmpnewchar; break;
			case "1": tmpnewchar = "一" + tmpnewchar; break;
			case "2": tmpnewchar = "二" + tmpnewchar; break;
			case "3": tmpnewchar = "三" + tmpnewchar; break;
			case "4": tmpnewchar = "四" + tmpnewchar; break;
			case "5": tmpnewchar = "五" + tmpnewchar; break;
			case "6": tmpnewchar = "六" + tmpnewchar; break;
			case "7": tmpnewchar = "七" + tmpnewchar; break;
			case "8": tmpnewchar = "八" + tmpnewchar; break;
			case "9": tmpnewchar = "九" + tmpnewchar; break;
		}
		switch (part[0].length - i - 1) {
			case 0: tmpnewchar = tmpnewchar; break;
			case 1: if (perchar != 0) tmpnewchar = tmpnewchar + "十"; break;
			case 2: if (perchar != 0) tmpnewchar = tmpnewchar + "百"; break;
			case 3: if (perchar != 0) tmpnewchar = tmpnewchar + "千"; break;
			case 4: tmpnewchar = tmpnewchar + "万"; break;
			case 5: if (perchar != 0) tmpnewchar = tmpnewchar + "十"; break;
			case 6: if (perchar != 0) tmpnewchar = tmpnewchar + "百"; break;
			case 7: if (perchar != 0) tmpnewchar = tmpnewchar + "千"; break;
			case 8: tmpnewchar = tmpnewchar + "亿"; break;
			case 9: tmpnewchar = tmpnewchar + "十"; break;
		}
		newchar = tmpnewchar + newchar;
	}
	//替换所有无用汉字，直到没有此类无用的数字为止
	while (newchar.search("零零") != -1 || newchar.search("零亿") != -1 || newchar.search("亿万") != -1 || newchar.search("零万") != -1) {
		newchar = newchar.replace("零亿", "亿");
		newchar = newchar.replace("亿万", "亿");
		newchar = newchar.replace("零万", "万");
		newchar = newchar.replace("零零", "零");
	}
	//替换以“一十”开头的，为“十”
	if (newchar.indexOf("一十") == 0) {
		newchar = newchar.substr(1);
	}
	//替换以“零”结尾的，为“”
	if (newchar.lastIndexOf("零") == newchar.length - 1) {
		newchar = newchar.substr(0, newchar.length - 1);
	}
	return newchar;
}
nsVals.getVariableJSON = function (variableJson, variableData, _isAllowEmpty, _emptyValue) {
	/***入参：
	 *	variableJson:object  			包含变量的输出格式 例如:{"id":"{cid}""};
	 * 	variableData:object  			当前数据，用于读取变量值
	 * 	_isAllowEmpty:boolean 			是否允许获取不到值时继续运行 默认为false 不允许为空
	 * 	_emptyValue: string/number 		空值时候赋值是什么 默认为'' 只有_isAllowEmpty为true时有用
	 * 
	 ***出参
	 * return JSON/Object  如果返回参数为false 则说明取值不成功
	 ***/

	var json = variableJson;
	var data = typeof(variableData)=='object' ? variableData : {};//sjj 20190613 防止出现undefind
	var isAllowEmpty = typeof (_isAllowEmpty) == 'boolean' ? false : true;  //默认为false 不允许空值
	var emptyValue = typeof (_emptyValue) == 'undefined' ? '' : _emptyValue;  //默认为false 不允许空值

	//最简单的情况
	// var json = {'id':'{cid}','otherId':1};
	// var data = {cid:1, name:'name'};

	//返回数据是两层 原始数据是一层
	// var json = {'id':'{id}','otherName':'other', child:{'cid':'{cid}'}};
	// var data = {id:1, name:'name', cid:'cid1234'};

	//返回数据是一层 原始数据是两层
	//var json = {'id':'{id}','otherName':'other', childId:'{children.cid}'};
	// var data = {id:1, name:'name', children:{'cid':'cid00001'}};
	//var data = {id:'demoDataId', name:'name', children:[{'cid':'cid00001', cname:'thiscname'}]};
	//var data = {id:'demoDataId', name:'name', children:['aaa','bbb']}; 这条报错

	//返回数据是一层 原始数据是三层
	// var json = {'id':'{id}','name':'{demoName}','otherName':'other', childName:'{children.cid.cname}',childId:'{children.cid.sid}'}; // lyw注
	//var data = {id:'demoDataId', name:'name', children:[{'cid':{sid:'thisSId'}, cname:'thiscname'}]};
	// var data = {id:'demoDataId', name:'demoName', children:[{'cid':[{sid:'thisSId'}], cname:'thiscname'}]}; // lyw注

	//返回数据是二层 原始数据是三层
	// var json = {'id':'{id}','otherName':'other', child:{'sid':'{children.cid.sid}'}};
	// var data = {id:'demoDataId', name:'name', children:[{'cid':[{sid:'thisSId'}], cname:'thiscname'}]};

	var isAllowEmpty = true;

	var resultJson = $.extend(true, {}, json);
	var markRegexp = /\{(.*?)\}/;
	var keyFieldArray = [];
	var keyFieldDepth = 0;

	var isGetResult = true; //是否没有错误获取到合法值
	function replaceVariable(_json, _keyField, _keyFieldDepth) {
		$.each(_json, function (key, value) {
			if (typeof (value) == 'string') {
				//如果是字符串则有可能是要替换的字符，其他类型不用处理
				if (markRegexp.test(value)) {

					//获取变量名
					var variableName = value.match(markRegexp)[1];
					var variableNameArray = variableName.split('.');
					var variableValue;
					if (variableNameArray.length == 1) {
						variableValue = data[variableName];
					} else {
						//如果是{child.childName}类型的则继续找值
						var valueData = data;
						for (var vvI = 0; vvI < variableNameArray.length; vvI++) {
							if (vvI < variableNameArray.length - 1) {
								//不是最后一层名字的情况下，找到对应的值
								valueData = valueData[variableNameArray[vvI]];
								if (typeof (valueData) == 'object') {
									//继续
									if ($.isArray(valueData)) {
										//如果是数组则区分如果只有一个，那就直接取值，如果不是则查找NSCHECKEDFLAG
										if (valueData.length == 1) {
											valueData = valueData[0];
										} else {
											var isSimpleArray = false;
											var checkedLength = 0;
											for (var chI = 0; chI < valueData.length; chI++) {
												//如果数组已经不是object 无法继续寻找值
												if (typeof (valueData[chI]) == 'object') {
													//数据是复杂对象 [{id:1, checked:true, name:'abc'},{...}]
													//查找NSCHECKEDFLAG
													if (valueData[chI][NSCHECKEDFLAG.KEY] == true) {
														valueData = valueData[chI];
														checkedLength++;
													}
												} else {
													//数据是简单对象 ['aaaa','bbbb']或者[]
													isSimpleArray = true;
													console.error('变量 {' + variableName + '} 不存在');
													isGetResult = false;
													return false;
												}

											}
											//如果是复杂对象，长度超过1，且checked找不到或者太多 则报错
											if (checkedLength != 1 && isSimpleArray == false) {
												console.error('变量 {' + variableName + '} 不存在');
												isGetResult = false;
												return false;
											}
										}
									} else {
										//本身就是object则不用处理
									}
								} else {
									console.error('变量 {' + variableName + '} 不存在');
									isGetResult = false;
									return false;
								}
							} else {
								variableValue = valueData[variableNameArray[vvI]];
							}
						}
					}

					//如果获取的值不存在，则看看是否允许空值，如果不允许则报错，如果允许则赋值为'';
					if (typeof (variableValue) == 'undefined') {
						if (isAllowEmpty) {
							variableValue = emptyValue;
						} else {
							console.error('变量 {' + variableName + '} 不存在');
							isGetResult = false;
							return false;
						}

					}

					if (_keyFieldDepth == 0) {
						//如果是第一层，直接读取就可以
						resultJson[key] = variableValue;
					} else {
						//如果是第二层或以上，需要按照深度拼接
						var currentObj = {};
						var keyFieldArray = _keyField.split('.');
						for (var roI = 0; roI < _keyFieldDepth; roI++) {
							currentObj = resultJson[keyFieldArray[roI + 1]];
						}
						currentObj[key] = variableValue;
					}
				}
			} else if (typeof (value) == 'object') {
				//如果是object 则可能继续进入替换
				replaceVariable(_json[key], _keyField + '.' + key, _keyFieldDepth + 1);
			} else {
				//其他类型不处理
			}

		})
	}
	replaceVariable(json, '', 0);
	//如果过程中出现错误则返回false
	if (isGetResult === false) {
		return false;
	}
	return resultJson
}
//根据出生日期计算年龄 相差月数和天数
nsVals.getAgeByBirthDate = function (value) {
	/*
		*value 当前值
	*/
	var currentDate = value ? value : '';//值不存在为空
	if (typeof (currentDate) == 'number') {
		//时间戳转换为日期类型
		currentDate = moment(currentDate).format('YYYY-MM-DD');
	}
	if (currentDate) {
		var strBirthdayArr = currentDate.split("-");
		var birthYear = strBirthdayArr[0];
		var birthMonth = strBirthdayArr[1];
		var birthDay = strBirthdayArr[2];

		var newDate = moment().format('YYYY-MM-DD');
		var strNewdayArr = newDate.split("-");
		var nowYear = strNewdayArr[0];
		var nowMonth = strNewdayArr[1];
		var nowDay = strNewdayArr[2];

		//获取年龄
		var returnAge = 0;
		var dayDiff = nowDay - birthDay;//日之差 
		var monthDiff = 0;//月之差  
		if (dayDiff < 0) {
			//如1959-05-05 2018-11-5
			monthDiff = -1;
			dayDiff = 30 + dayDiff;
		}
		monthDiff = monthDiff + (nowMonth - birthMonth);
		if (monthDiff < 0) {
			returnAge = -1;
			monthDiff = 12 + monthDiff;
		}
		returnAge = returnAge + (nowYear - birthYear);
		/*if(nowYear == birthYear){
			returnAge = 0;//同年 则为0岁  
		}else{
			var ageDiff = nowYear - birthYear ; //年之差  
			if(ageDiff > 0){
				if(nowMonth == birthMonth){ 
					if(dayDiff < 0){
						returnAge = ageDiff - 1;  
					}else{  
						returnAge = ageDiff;  
					}  
				}else{  
					if(monthDiff < 0){  
						returnAge = ageDiff - 1;
						monthDiff = 0;  
					}else{  
						returnAge = ageDiff;  
					}  
				}  
			}else{  
				returnAge = -1;//返回-1 表示出生日期输入错误 晚于今天  
			}
		}*/
		return {
			age: returnAge,
			day: dayDiff,
			month: monthDiff
		}
	} else {
		console.log(value)
		nsalert('值不合法' + value);
		return {};
	}
}
//根据年龄计算出生日期 相差月数和天数
nsVals.getBirthDateByAge = function (value, day, month) {
	/*
		*value 年龄
		*day 相差天数
		*month 相差月
	*/
	var age = Number(value);
	if (!isNaN(age)) {
		var newDate = moment().format('YYYY-MM-DD');
		var strNewdayArr = newDate.split("-");
		var nowYear = strNewdayArr[0];
		var nowMonth = strNewdayArr[1];
		var nowDay = strNewdayArr[2];
		var birthYear = nowYear - age;//出生年
		var day = nowDay - day;//出生日
		var month = nowMonth - month;//出生月
		if(month == 0){
			//月不允许出现0
			month = 12;
			birthYear = birthYear - 1;
		}
		return birthYear + '-' + month + '-' + day;
	} else {
		//非数值
		console.log(value)
		nsalert('值不合法' + value);
		return '';
	}
}
//动态加载引入的css和js文件
nsVals.batchImportCssScriptFile = function (_files) {
	/*
		*_files 格式:['/script/jquery.divbox.js','/css/pop_win.css'] 或 'css/pop_win.css'
	*/
	var files = typeof (_files) == 'string' ? [_files] : _files;
	if (!$.isArray(files)) { files = []; }
	for (var fileI = 0; fileI < files.length; fileI++) {
		//正则表达式/(^\s*)|(\s*$)/g 包含以空格、回车符等字符开头 或者 空格、回车符等字符结尾 的字符串，可过滤出所有空格、回车符的字符
		var fileName = files[fileI].replace(/(^\s*)|(\s*$)/g, "");
		var splitDotArr = fileName.split('.');//以.为分割数组
		var extName = splitDotArr[splitDotArr.length - 1].toLowerCase();//转换成小写
		var attrStr = '';
		var includePath = getRootPath() + fileName;
		if (extName == 'css') {
			//后缀名css
			attrStr = '<link type="text/css" rel="stylesheet" href="' + includePath + '" />';
		} else if (extName == 'js') {
			//后缀名js
			attrStr = '<script type="text/javascript" src="' + includePath + '"></script>';
		}
		console.log(attrStr)
		/*if($('[src="'+includePath+'"]').length == 0){
			
		} */
	}
}
//转换"{"a":1, b:31}"字符串成object 
nsVals.getJsonByString = function (jsonStr, isShowErrorInfo) {
	//isShowErrorInfo 是否显示错误提示信息
	var isShwoError = isShowErrorInfo ? isShowErrorInfo : true;
	switch (typeof (jsonStr)) {
		case 'string':
			//这是合法的 继续执行
			break;
		case 'object':
			//已经是object直接返回了该对象 以方便不知道是否已经转换情况下调用
			if (isShwoError) {
				if (debugerMode) {
					console.warn('nsVals.getJsonByString方法入参错误，传入参数无需处理');
					console.warn(jsonStr);
				}
			}
			return jsonStr;
			break;
		default:
			//其他的都不对
			if (isShwoError) {
				console.error('nsVals.getJsonByString方法入参必须是string类型，当前值：' + jsonStr + '，类型为' + typeof (jsonStr));
			}
			return false;
			break;
	}

	var json = {};
	var bracePatt = /\{(.*?)\}/; 	//{}的regExp
	var quotPatt = /\"(.*?)\"/;  	//双引号的regExp
	var numberPatt = /^[0-9\-\.]+$/ //是否数字的 -12.9 数字下划线和小数点
	//如果不是以{}开头和结尾的返回false
	if (jsonStr.search(bracePatt) == -1) {
		return false;
	}
	var baseStr = jsonStr.match(bracePatt);
	if (baseStr === null) {
		console.error('nsVals.getJsonByString 转换字符串"' + jsonStr + '"错误，必须以{}开头和结尾');
		return false;
	}
	baseStr = baseStr[1]
	var keyValueArray = baseStr.split(',')
	for (var kvArrayI = 0; kvArrayI < keyValueArray.length; kvArrayI++) {
		var keyValue = keyValueArray[kvArrayI].split(':');
		if (keyValue.length != 2) {
			console.error(jsonStr + '中的：' + keyValueArray[kvArrayI] + '格式错误，必须是key:value形式');
			return false;
		}

		var keyStr = keyValue[0],		//key
			valueStr = keyValue[1], 	//value
			returnKey = '', 			//返回key
			returnValue = '';   		//返回value
		//如果包含双引号则输出去掉双引号并指定为string
		var valueResult = valueStr.match(quotPatt);
		if (valueResult != null) {
			returnValue = valueResult[1];
		} else {
			//如果找不到双引号则判断是否数字
			if (numberPatt.test(valueStr)) {
				var toNumber = Number(valueStr);
				if (isNaN(toNumber)) {
					returnValue = null;
				} else {
					returnValue = toNumber;
				}
			} else {
				returnValue = valueStr;
			}
		}
		//如果可以key有双引号也干掉
		var keyResult = keyStr.match(quotPatt);
		if (keyResult != null) {
			returnKey = keyResult[1];
		} else {
			returnKey = keyStr;
		}
		//加入到返回结果中
		json[returnKey] = returnValue;
	}
	return json;
}
/***********暂时放置*************************/
//服务器端数据操作工具
var nsServerTools = {};
//对发送到服务器的数据进行加工 添加objectState
nsServerTools.getObjectStateFlag = function (serverData, resultData, idFieldKey) {
	//通过对两个数据的比较 返回数据状态
	//return 返回结果为 NSSAVEDATAFLAG.NULL NSSAVEDATAFLAG.ADD NSSAVEDATAFLAG.EDIT NSSAVEDATAFLAG.DELETE

	var isServer = !$.isEmptyObject(serverData);
	var isResult = !$.isEmptyObject(resultData);
	//如果是 {} 或者 undefined 都可以获取正确结果

	if (isServer == false && isResult) {
		//判断是否新增 如果source不存在 而result存在 则认为是新增
		return NSSAVEDATAFLAG.ADD;
	} if (isServer && isResult == false) {
		//判断是否删除 如果source存在 而result不存在 则认为是删除
		return NSSAVEDATAFLAG.DELETE;
	} else if (isServer && isResult) {
		//两边都有的情况下，判断result中的idField是否有值，如果没有值，则是没有在服务器端保存过的数据，状态为ADD
		if(typeof(resultData)=='object'){
			if(typeof(resultData[idFieldKey]) == 'undefined'){
				return NSSAVEDATAFLAG.ADD;
			}
		}
		//判断是否修改
		var isModify = false;
		var currentMergeData = $.extend(false, {}, serverData, resultData)
		for (key in currentMergeData) {
			var mergeDataType = typeof (currentMergeData[key]);
			switch (mergeDataType) {
				case 'object':
					break;
				case 'function':
				case 'undefined':
					//这三种的不用处理 undefined理论上不会出现,但是出现了需要报错
					if (debugerMode) {
						console.error('出现不可识别的数据');
						console.error(serverData);
						console.error(resultData);
						console.error(currentMergeData[key]);
					}
					break;
				case 'string':
				case 'number':
				case 'boolean':
					//这是简单的，需要比较
					var sourceValue = serverData[key];
					var resultValue = resultData[key];
					//如果任何一个类型不一样 则是修改
					if (typeof (sourceValue) != mergeDataType || typeof (resultValue) != mergeDataType) {
						return NSSAVEDATAFLAG.EDIT;
					} else {
						//类型全都一样，则比较值
						if (sourceValue != resultValue) {
							return NSSAVEDATAFLAG.EDIT;
						}
					}
					break;
			}
		}
	}

	//如果都执行完还没有被触发，则返回未修改
	return NSSAVEDATAFLAG.NULL;
}
nsServerTools.getObjectStateData = function (_serverAllData, _resultAllData, _idFieldNames) {
	console.log(_serverAllData);
	console.log(_resultAllData);
	console.log(_idFieldNames);
	console.log('原始数据输出结束-----------');
	var testI = 0;
	//根据idField返回list对应的obj
	function getListDatasById(listArr, idField) {
		var lists = {};
		if ($.isArray(listArr)) {
			for (var i = 0; i < listArr.length; i++) {
				var id = listArr[i][idField];
				if (id) {
					lists[id] = listArr[i];
				}
			}
		} else {
			//不是数组直接返回 {}
		}

		return lists;
	}
	//获取list 合并serverList 和 resultList
	function getMergeListForOutput(serverList, resultList, idField) {
		//如果没有则默认为空数组
		if (typeof (resultList) == 'undefined') {
			resultList = [];
		}
		if (typeof (serverList) == 'undefined') {
			serverList = [];
		}

		//serverList必然有id 整理成id为key的
		var mergeList = [];
		var mergeDatas = {};
		//resultList中有id的需要记录一下
		var resultDatas = {};
		for (var ri = 0; ri < resultList.length; ri++) {
			var rid = resultList[ri][idField];
			if (rid) {
				//只处理有id的 用id当key resultDatas 先不加标识也不加入到list中
				resultDatas[rid] = $.extend(true, {}, resultList[ri]);
			} else {
				//没id的直接加入到新数组中，只能是新增的
				var mergeData = $.extend(true, {}, resultList[ri]);
				mergeData.objectState = NSSAVEDATAFLAG.ADD;
				mergeList.push(mergeData);
			}
		}

		//serverList必然有id 整理成id为key的
		var serverDatas = {};
		for (var si = 0; si < serverList.length; si++) {
			var sid = serverList[si][idField];
			if (sid) {
				//有id的加入serverDatas备查
				serverDatas[sid] = serverList[si];
				if (typeof (resultDatas[sid]) == 'object') {
					//如果服务器端有，当前也有则是0或2，以resultList为准
					var mergeData = resultDatas[sid];
					mergeList.push(mergeData);
					serverDatas[sid] = resultDatas[sid]
				} else {
					//如果服务器端有，当前没有，则是删除
					mergeData = $.extend(true, {}, serverList[si]);
					mergeData.objectState = NSSAVEDATAFLAG.DELETE;
					mergeList.push(mergeData);
				}
			} else {
				//serverList没有id的字段报错
				if (debugerMode) {
					console.error('服务器端返回的list存在没有idField(' + idField + ')的字段')
					console.error(serverList);
					console.error(serverList[si]);
				}
			}
		}

		//resultList可能存在有id或者idField定义错误的，同时又是新增的, 比如批量新增的
		//这种写法是不规范的，成熟后酌情删除
		for (var mergeDataKey in resultDatas) {
			if (typeof (serverDatas[mergeDataKey]) == 'undefined') {
				//如果结果数据里有 而服务器端数据里没有 这就是一种不太规范的新增方式
				var mergeData = resultDatas[sid];
				mergeData.objectState = NSSAVEDATAFLAG.ADD;
				mergeList.push(mergeData);
			}
		}

		return mergeList;
	}
	//获取list 合并serverList 和 resultList
	function getMergeDatas(serverList, resultList, idField) {
		//如果没有则默认为空数组
		if (typeof (resultList) == 'undefined') {
			resultList = [];
		}
		if (typeof (serverList) == 'undefined') {
			serverList = [];
		}

		//serverList必然有id 整理成id为key的
		var mergeList = [];
		var mergeDatas = {};
		//resultList中有id的需要记录一下
		var resultDatas = {};
		for (var ri = 0; ri < resultList.length; ri++) {
			var rid = resultList[ri][idField];
			if (rid) {
				//只处理有id的 用id当key resultDatas 先不加标识也不加入到list中
				resultDatas[rid] = $.extend(true, {}, resultList[ri]);
			} else {
				//没id的直接加入到新数组中，只能是新增的
				var mergeData = $.extend(true, {}, resultList[ri]);
				mergeData.objectState = NSSAVEDATAFLAG.ADD;
				mergeList.push(mergeData);
			}
		}

		//serverList必然有id 整理成id为key的
		var serverDatas = {};
		for (var si = 0; si < serverList.length; si++) {
			var sid = serverList[si][idField];
			if (sid) {
				//有id的加入serverDatas备查
				serverDatas[sid] = serverList[si];
				if (typeof (resultDatas[sid]) == 'object') {
					//如果服务器端有，当前也有则是0或2，以resultList为准
					var mergeData = resultDatas[sid];
					mergeList.push(mergeData);
					serverDatas[sid] = resultDatas[sid]
				} else {
					//如果服务器端有，当前没有，则是删除
					mergeData = $.extend(true, {}, serverList[si]);
					mergeData.objectState = NSSAVEDATAFLAG.DELETE;
					mergeList.push(mergeData);
				}
			} else {
				//serverList没有id的字段报错
				if (debugerMode) {
					console.error('服务器端返回的list存在没有idField(' + idField + ')的字段')
					console.error(serverList);
					console.error(serverList[si]);
				}
			}
		}

		//resultList可能存在有id或者idField定义错误的，同时又是新增的, 比如批量新增的
		//这种写法是不规范的，成熟后酌情删除
		for (var mergeDataKey in resultDatas) {
			if (typeof (serverDatas[mergeDataKey]) == 'undefined') {
				//如果结果数据里有 而服务器端数据里没有 这就是一种不太规范的新增方式
				var mergeData = resultDatas[sid];
				mergeData.objectState = NSSAVEDATAFLAG.ADD;
				mergeList.push(mergeData);
			}
		}

		return mergeList;
	}
	//根据上级对象的值对下级对象赋值
	function setChildrenObjectState(_data, _saveFlag) {
		console.warn(_data)
		function setSaveFlag(data, _saveFlag) {
			if (typeof (data) == 'object' && data != null) {
				if ($.isArray(data)) {
					for (var di = 0; di < data.length; di++) {
						setSaveFlag(data[di], _saveFlag)
					}
				} else {
					if (typeof (data.objectState) == 'undefined') {
						data.objectState = _saveFlag;
					}
					for (var key in data) {
						if (typeof (data[key]) == 'object' && data[key] != null) {
							setSaveFlag(data[key], _saveFlag)
						}
					}
				}
			}
		}
		setSaveFlag(_data, _saveFlag);
	}
	//判断是否修改
	function runData(outputData, serverData, resultData, idFieldKey) {
		//获取状态值
		var objectState = nsServerTools.getObjectStateFlag(serverData, resultData, _idFieldNames[idFieldKey]);
		var mergeData = $.extend(true, {}, serverData, resultData);
		setData(outputData, mergeData, objectState,serverData,resultData);
		outputData.objectState = objectState;

		if (objectState == 0 || objectState == 2) {
			//0,2是修改或者未操作，本来存在server和result 则需要对下级继续比较
			for (var key in mergeData) {
				if (typeof (mergeData[key]) == 'object' && mergeData[key] != null) {
					//可能有list和VO两种情况
					if ($.isArray(mergeData[key]) == false) {
						//VO 则生成新的三个值，继续运行
						outputData[key] = {};
						//拼接下一步的idFieldkey
						var nextKey = idFieldKey + '.' + key;
						//如果存在则继续运行
						if (_idFieldNames[nextKey]) {
							runData
								(
								outputData[key],
								serverData[key],
								resultData[key],
								nextKey
								);
						} else {
							//如果配置了idFeild则执行，没配置则停止执行
						}
					} else {
						//是数组 则要先根据id找对应的数据
						var listIdField = idFieldKey + '.' + key;
						var listIdFieldKey = _idFieldNames[listIdField]
						if (listIdFieldKey) {
							//两个数组
							var serverKeyArray = serverData[key] ? serverData[key] : [];
							var resultKeyArray = resultData[key] ? resultData[key] : [];
							var allKeyArray = serverKeyArray.concat(resultKeyArray)
							//三个以id为key的object
							var serverListDatas = getListDatasById(serverKeyArray, listIdFieldKey);
							var resultListDatas = getListDatasById(resultKeyArray, listIdFieldKey);
							var allDatas = getListDatasById(allKeyArray, listIdFieldKey);


							//要输出的数组
							outputData[key] = [];
							//没有id的都是新增的 不存在于三个key object中
							for (var ri = 0; ri < resultKeyArray.length; ri++) {
								var rData = resultKeyArray[ri];
								if (typeof (rData[listIdFieldKey]) == 'undefined') {
									var outputNullIdData = {};
									runData
										(
										outputNullIdData,
										{},
										$.extend(true, {}, rData),
										listIdField
										);
									outputData[key].push(outputNullIdData);
								}
							}
							for (var dataKey in allDatas) {
								var outputKeyData = {};
								runData
									(
									outputKeyData,
									serverListDatas[dataKey],
									resultListDatas[dataKey],
									listIdField
									);
								outputData[key].push(outputKeyData);
							}
						}


					}
				}
			}
		} else {
			//-1 1 新增修改都是server或者result其中有一个不存在 则无法继续向下比较
			//不能继续执行了 所有新增和删除的对象 里面的
		}

	}
	//设置数据
	function setData(outputData, _data, _saveFlag,_serverData,_resultData) {
		for (var key in _data) {
			switch (typeof (_data[key])) {
				case 'boolean':
				case 'string':
				case 'number':
					//只有简单类型数据才是数据库中需要的
					if(_saveFlag == NSSAVEDATAFLAG.EDIT){
						if(typeof(_resultData)=='object'){
							//这句判断本身没作用，如果是edit或者null _resultData必然是object
							outputData[key] = _resultData[key];
						}
					}else{
						outputData[key] = _data[key];
					}
					break;
				case 'object':
					//如果是object 则只在删除和新增时候可以直接生成objectState, 如果是修改或者未修改，则需要继续循环
					outputData[key] = _data[key];

					if (_saveFlag == NSSAVEDATAFLAG.ADD || _saveFlag == NSSAVEDATAFLAG.DELETE) {
						setChildrenObjectState(outputData[key], NSSAVEDATAFLAG.ADD);
					}
					break;
				default:
					break;
			}
		}
	}
	var _outputData = {};
	runData(_outputData, _serverAllData, _resultAllData, 'root');

	console.log('数据计算完毕 --------------')
	console.log(_outputData);
	return _outputData;
}
nsServerTools.setObjectStateData = function (formatData, stateValues, formatDataKey, parentNode) {
	//传入object(数组，Json)，对这个对象进行深度遍历
	//默认将对象中的objectState修改为0，如果传入第二个参数则设置为传入值
	//如果对象中的objectState等于-1，则删除此对象(如果最外层objectState等于-1，则返回空对象)
	typeof stateValues == 'undefined' 
		? stateValues = 0 
		: typeof stateValues == 'string' 
			? stateValues = Number(stateValues) 
			: "";
    (function F(formatData, formatDataKey, parentNode) {
        if (formatData instanceof Array || formatData instanceof Object) {
            if (formatData instanceof Object) {
                if (typeof formatData.objectState != 'undefined') {
                    if (formatData.objectState == NSSAVEDATAFLAG.DELETE) {
                        if (typeof formatDataKey == 'undefined') {
                            formatData = {};
                            return formatData;
                        }
                        if (parentNode instanceof Array) {
                            parentNode.splice(formatDataKey, 1, {});
                        } else {
                            delete parentNode[formatDataKey];
                        }
                    } else {
                        formatData.objectState = stateValues;
                    }
                }
            }
            $.each(formatData, function (key, item) {
                if (typeof item == 'object') {
                    F(item, key, formatData);
                }
            });
        } else {
            formatData = {};
            nsalert('数据格式错误');
        }
    }(formatData, formatDataKey, parentNode));
    // console.log(formatData.regDiseaseVoList);
    //去除数组中的空对象
    removeArrayEmptyObj(formatData);
    return formatData;
}
function removeArrayEmptyObj(formatData) {
    if (formatData instanceof Array) {
        for (var i = 0; i < formatData.length; i++) {
            if (formatData[i] == "" || typeof (formatData[i]) == "undefined" || $.isEmptyObject(formatData[i])) {
                formatData.splice(i, 1);
                i = i - 1;
            }
        }
    }
    $.each(formatData, function (key, item) {
        if (typeof item == 'object' && !$.isEmptyObject(item)) {
            removeArrayEmptyObj(item);
        }
    });
}
/*var outputData = {
	"regOutVoList":{},
    "regId": "1278034570880484329",
    "topOrgId": "1",
    "orgId": "1",
    "orgCode": "0001",
    "arcId": "1278034507529717737",
    "regCode": "1809100263",
    "regIsGroup": 0,
    "regState": 7,
    "regDate": 1536537600000,
    "regName": "朱燕",
    "regPyCode": "zy",
    "regWbCode": "ra",
    "dictSex": "2",
    "regBirthday": 814118400000,
    "regAge": 22,
    "regAgeMonth": 11,
    "dictIdcardType": "0",
    "nsTemplateButton":'',
    "regIdcardNo": "632223199510200420",
    "customerName": "网星软件",
    "regEmpNo": "20010",
    "dictWorkType": "操作工",
    "regPhoneNo": "15520312231",
    "packageId": "1277014172550300649",
    "regPackageName": "苯",
    "regPeClassNames": "职业体检",
    "regIsRecheck": 0,
    "firstRegId": "1278034570880484329",
    "regTotalRecheckTimes": 0,
    "regRecheckTimes": 0,
    "regRecheckEndFlag": 0,
    "regDeptId": "1277556366000522217",
    "regDeptName": "内科",
    "regBy": "1278019906788393961",
    "regByName": "罗芳",
    "isVip": 0,
    "dictNation": "汉族",
    "regBirthPalce": "石家庄桥西区",
    "regNativePlace": "石家庄桥西区",
    "regAddress": "石家庄桥西区",
    "dictMarriage": "2",
    "dictPost": "总经理",
    "dictGrade": "4",
    "regPostcode": "050000",
    "regGuidePrintTimes": 0,
    "regIsUpload": 0,
    "regIsExport": 0,
    "regCheckOutState": 1,
    "regCheckOutBy": "1",
    "regCheckOutByName": "admin",
    "whenRegCheckOut": 1541401764000,
    "modifiedBy": "1",
    "modifiedByName": "管理员",
    "whenModified": 1539662014000,
    "regOcpVo": {
    	"regOutVoList":{},
    	"regOutVoArray":[],
        "regId": "1278034570880484329",
        "topOrgId": "1",
        "orgId": "1",
        "orgCode": "00010009",
        "regWhenJob": 1476979200000,
        "regWorkYears": 1,
        "regWorkMonths": 10,
        "regHazardYears": 1,
        "regHazardMonths": 10,
        "regHazardNames": "游离二氧化硅粉尘+噪声",
        "regOcpcNames": "在岗期间",
        "regHazardOcpcNames": "游离二氧化硅粉尘、噪声（在岗期间）",
        "regHazardVoList": [
            {
                "regHazardId": "1278034570880485353",
                "topOrgId": "1",
                "orgId": "1",
                "orgCode": "00010009",
                "regId": "1278034570880484329",
                "hazardId": "1277472745134752745",
                "hazardName": "游离二氧化硅粉尘",
                "hazardDisOrder": 73,
                "ocpcId": "1276091918517797865",
                "ocpcName": "在岗期间",
                "ocpcDisOrder": 2,
                "objectState": -1,
                "regOutVoList":{},
    			"regOutVoArray":[],
            },
            {
                "regHazardId": "1278034570880486377",
                "topOrgId": "1",
                "orgId": "1",
                "orgCode": "00010009",
                "regId": "1278034570880484329",
                "hazardId": "1277474025035006953",
                "hazardName": "噪声",
                "hazardDisOrder": 83,
                "ocpcId": "1276091918517797865",
                "ocpcName": "在岗期间",
                "ocpcDisOrder": 2,
                "objectState": 0,
                "regOutVoList":{},
    			"regOutVoArray":[],
            },
            {
                "regHazardId": "1278047953998578665",
                "topOrgId": "1",
                "orgId": "1",
                "orgCode": "0001",
                "regId": "1278034570880484329",
                "hazardId": "1277463888912188393",
                "hazardName": "苯",
                "hazardDisOrder": 25,
                "ocpcId": "1276918161777624041",
                "ocpcName": "应急健康检查",
                "ocpcDisOrder": 4,
                "objectState": 0
            }
        ],
        "regOcpCardVo": {
            "regId": "1278034570880484329",
            "topOrgId": "1",
            "orgId": "1",
            "orgCode": "00010009",
            "ocpCardPrintTimes": 0,
            "objectState": -1,
            "regOutVoList":{},
    		"regOutVoArray":[],
        },
        "objectState": 3
    },
    "regComboVoList": [
        {
            "regComboId": "1278034570880498665",
            "topOrgId": "1",
            "orgId": "1",
            "orgCode": "0001",
            "regId": "1278034570880484329",
            "comboId": "1276441022049551337",
            "comboName": "身高体重",
            "regSampleIsDone": 0,
            "regComboPeClassNames": "10+30+40",
            "regComboIsMerge": 0,
            "regComboIsEx": 0,
            "regComboState": 1,
            "regComboCheckBy": "1",
            "regComboCheckByName": "管理员",
            "whenRegComboCheck": 1536662736000,
            "regComboExecDeptId": "185667161001008",
            "regComboExecDeptName": "外科",
            "regComboUploadFlag": 0,
            "dictInputType": "1",
            "comboDisOrder": 3,
            "regItemVoList": [
                {
                    "regItemId": "1278034570880499689",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276441022049551337",
                    "comboName": "身高体重",
                    "itemId": "1276364457815049193",
                    "itemName": "身高",
                    "regItemFindings": "200",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "cm",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954226153",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276441022049551337",
                    "comboName": "身高体重",
                    "itemId": "1276364716586828777",
                    "itemName": "体重",
                    "regItemFindings": "200",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "kg",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954227177",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276441022049551337",
                    "comboName": "身高体重",
                    "itemId": "1276364869058167785",
                    "itemName": "体重指数",
                    "regItemFindings": "50.00",
                    "regItemIsEx": 0,
                    "regItemUpper": "24",
                    "regItemLower": "18.5",
                    "regItemRrs": "18.5-24",
                    "regItemUnit": "",
                    "objectState": 0
                }
            ],
            "regMedImgVoList": [],
            "itemClassId": "1273754066886853609",
            "objectState": 0
        },
        {
            "regComboId": "1278034571954228201",
            "topOrgId": "1",
            "orgId": "1",
            "orgCode": "0001",
            "regId": "1278034570880484329",
            "comboId": "1276445800200668137",
            "comboName": "血压",
            "regSampleIsDone": 0,
            "regComboPeClassNames": "10+30+40",
            "regComboIsMerge": 0,
            "regComboIsEx": 0,
            "regComboState": 1,
            "regComboCheckBy": "1",
            "regComboCheckByName": "管理员",
            "whenRegComboCheck": 1536637250000,
            "regComboExecDeptName": "内一科",
            "regComboUploadFlag": 0,
            "dictInputType": "1",
            "comboDisOrder": 2,
            "regItemVoList": [
                {
                    "regItemId": "1278034571954230249",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276445800200668137",
                    "comboName": "血压",
                    "itemId": "1276365480017265641",
                    "itemName": "收缩压",
                    "regItemFindings": "150",
                    "regItemResult": "↑",
                    "regItemIsEx": 1,
                    "regItemUpper": "140",
                    "regItemLower": "90",
                    "regItemRrs": "90-140",
                    "regItemUnit": "mmHg",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954229225",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276445800200668137",
                    "comboName": "血压",
                    "itemId": "1276365629267379177",
                    "itemName": "舒张压",
                    "regItemFindings": "91",
                    "regItemResult": "↑",
                    "regItemIsEx": 1,
                    "regItemUpper": "90",
                    "regItemLower": "60",
                    "regItemRrs": "60-90",
                    "regItemUnit": "mmHg",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954231273",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276445800200668137",
                    "comboName": "血压",
                    "itemId": "1276367126063481833",
                    "itemName": "脉搏",
                    "regItemFindings": "100",
                    "regItemResult": "",
                    "regItemIsEx": 0,
                    "regItemUpper": "110",
                    "regItemLower": "50",
                    "regItemRrs": "50-110",
                    "regItemUnit": "次/分",
                    "objectState": 0
                }
            ],
            "regMedImgVoList": [],
            "itemClassId": "1273754066886853609",
            "objectState": 0,
            "objectCheckState": 1
        },
        {
            "regComboId": "1278034571954232297",
            "topOrgId": "1",
            "orgId": "1",
            "orgCode": "0001",
            "regId": "1278034570880484329",
            "comboId": "1276446917965906921",
            "comboName": "内科常规检查",
            "regSampleIsDone": 0,
            "regComboPeClassNames": "10+30+40",
            "regComboIsMerge": 0,
            "regComboIsEx": 0,
            "regComboState": 1,
            "regComboCheckBy": "1278016393505145833",
            "regComboCheckByName": "校广录",
            "whenRegComboCheck": 1536562288000,
            "regComboExecDeptId": "1277556366000522217",
            "regComboExecDeptName": "内科",
            "regComboUploadFlag": 0,
            "dictInputType": "1",
            "comboDisOrder": 4,
            "regItemVoList": [
                {
                    "regItemId": "1278034571954233321",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276446917965906921",
                    "comboName": "内科常规检查",
                    "itemId": "1276368254566138857",
                    "itemName": "心脏听诊",
                    "regItemFindings": "目前未见异常",
                    "regItemResult": "目前未见异常",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954234345",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276446917965906921",
                    "comboName": "内科常规检查",
                    "itemId": "1276369475410592745",
                    "itemName": "肺部听诊",
                    "regItemFindings": "目前未见异常",
                    "regItemResult": "目前未见异常",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954235369",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276446917965906921",
                    "comboName": "内科常规检查",
                    "itemId": "1276369578489807849",
                    "itemName": "肝脏触诊",
                    "regItemFindings": "目前未见异常",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954236393",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276446917965906921",
                    "comboName": "内科常规检查",
                    "itemId": "1276369627881931753",
                    "itemName": "脾脏触诊",
                    "regItemFindings": "",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954237417",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276446917965906921",
                    "comboName": "内科常规检查",
                    "itemId": "1276369803975590889",
                    "itemName": "内科其他",
                    "regItemFindings": "目前未见异常",
                    "regItemResult": "目前未见异常",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                }
            ],
            "regMedImgVoList": [],
            "itemClassId": "1273753738321855465",
            "objectState": 0
        },
        {
            "regComboId": "1278034571954238441",
            "topOrgId": "1",
            "orgId": "1",
            "orgCode": "0001",
            "regId": "1278034570880484329",
            "comboId": "1276455892300071913",
            "comboName": "听力检测",
            "regSampleIsDone": 0,
            "regComboPeClassNames": "10+30+40",
            "regComboIsMerge": 0,
            "regComboIsEx": 0,
            "regComboState": 1,
            "regComboCheckBy": "1278016393505145833",
            "regComboCheckByName": "校广录",
            "whenRegComboCheck": 1536562288000,
            "regComboExecDeptId": "185667161001008",
            "regComboExecDeptName": "外科",
            "regComboUploadFlag": 0,
            "dictInputType": "1",
            "comboDisOrder": 9,
            "regItemVoList": [
                {
                    "regItemId": "1278034571954239465",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276455892300071913",
                    "comboName": "听力检测",
                    "itemId": "1276377325537068009",
                    "itemName": "听力右",
                    "regItemFindings": "5",
                    "regItemResult": "5",
                    "regItemIsEx": 0,
                    "regItemUpper": "5",
                    "regItemLower": "5",
                    "regItemRrs": "5-5",
                    "regItemUnit": "m",
                    "objectState": 0
                }
            ],
            "regMedImgVoList": [],
            "itemClassId": "1273567913340568553",
            "objectState": 0,
            "objectCheckState": 1
        },
        {
            "regComboId": "1278034571954240489",
            "topOrgId": "1",
            "orgId": "1",
            "orgCode": "0001",
            "regId": "1278034570880484329",
            "comboId": "1276455938470970345",
            "comboName": "纯音听阈测试",
            "regSampleIsDone": 0,
            "regComboPeClassNames": "10+30+40",
            "regComboIsMerge": 0,
            "regComboIsEx": 0,
            "regComboState": 1,
            "regComboCheckBy": "1278016393505145833",
            "regComboCheckByName": "校广录",
            "whenRegComboCheck": 1536562288000,
            "regComboExecDeptId": "185667161001009",
            "regComboExecDeptName": "五官科",
            "regComboUploadFlag": 0,
            "dictInputType": "2",
            "comboDisOrder": 10,
            "regItemVoList": [
                {
                    "regItemId": "1278034571954241513",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276455938470970345",
                    "comboName": "纯音听阈测试",
                    "itemId": "1276377165549536233",
                    "itemName": "纯音听阈测试",
                    "regItemFindings": "目前未见异常",
                    "regItemIsEx": 0,
                    "objectState": 0
                }
            ],
            "regMedImgVoList": [],
            "itemClassId": "1273567913340568553",
            "objectState": 0
        },
        {
            "regComboId": "1278034571954242537",
            "topOrgId": "1",
            "orgId": "1",
            "orgCode": "0001",
            "regId": "1278034570880484329",
            "comboId": "1276464632558519273",
            "comboName": "12导联心电图",
            "sampleTypeId": "1274419688033485801",
            "regSampleIsDone": 0,
            "regComboPeClassNames": "10+30+40",
            "regComboIsMerge": 0,
            "regComboIsEx": 0,
            "regComboState": 1,
            "regComboCheckBy": "1278016393505145833",
            "regComboCheckByName": "校广录",
            "whenRegComboCheck": 1536562288000,
            "regComboExecDeptId": "185667161001005",
            "regComboExecDeptName": "内科",
            "regComboUploadFlag": 0,
            "dictInputType": "1",
            "comboDisOrder": 18,
            "regItemVoList": [
                {
                    "regItemId": "1278034571954243561",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276464632558519273",
                    "comboName": "12导联心电图",
                    "itemId": "1276456304616932329",
                    "itemName": "12导连心电图",
                    "regItemFindings": "目前未见异常",
                    "regItemResult": "目前未见异常",
                    "regItemIsEx": 1,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                }
            ],
            "regMedImgVoList": [],
            "itemClassId": "1273753971323831273",
            "objectState": 0
        },
        {
            "regComboId": "1278034571954244585",
            "topOrgId": "1",
            "orgId": "1",
            "orgCode": "0001",
            "regId": "1278034570880484329",
            "comboId": "1276737158970868713",
            "comboName": "尿常规",
            "sampleTypeId": "1276465241370133481",
            "regSampleIsDone": 1,
            "regComboPeClassNames": "10+30+40",
            "regComboIsMerge": 0,
            "regComboIsEx": 0,
            "regComboState": 1,
            "regComboCheckBy": "1278016393505145833",
            "regComboCheckByName": "校广录",
            "whenRegComboCheck": 1536562288000,
            "regComboExecDeptId": "185667161001032",
            "regComboExecDeptName": "检验科",
            "regComboUploadFlag": 0,
            "dictInputType": "1",
            "comboDisOrder": 20,
            "regItemVoList": [
                {
                    "regItemId": "1278034571954245609",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276737158970868713",
                    "comboName": "尿常规",
                    "itemId": "1276830082735801321",
                    "itemName": "白细胞",
                    "regItemFindings": "-",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954246633",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276737158970868713",
                    "comboName": "尿常规",
                    "itemId": "1276830177225081833",
                    "itemName": "蛋白质",
                    "regItemFindings": "-",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954247657",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276737158970868713",
                    "comboName": "尿常规",
                    "itemId": "1276830225543463913",
                    "itemName": "尿胆原",
                    "regItemFindings": "-",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954248681",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276737158970868713",
                    "comboName": "尿常规",
                    "itemId": "1276830263124427753",
                    "itemName": "酮体",
                    "regItemFindings": "-",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954249705",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276737158970868713",
                    "comboName": "尿常规",
                    "itemId": "1276830545518527465",
                    "itemName": "潜血",
                    "regItemFindings": "-",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954250729",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276737158970868713",
                    "comboName": "尿常规",
                    "itemId": "1276830588468200425",
                    "itemName": "亚硝酸盐",
                    "regItemFindings": "-",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954251753",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276737158970868713",
                    "comboName": "尿常规",
                    "itemId": "1276830640007807977",
                    "itemName": "尿葡萄糖",
                    "regItemFindings": "-",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954252777",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276737158970868713",
                    "comboName": "尿常规",
                    "itemId": "1276830705506059241",
                    "itemName": "PH值",
                    "regItemFindings": "5.0",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954253801",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276737158970868713",
                    "comboName": "尿常规",
                    "itemId": "1276830760266892265",
                    "itemName": "比重",
                    "regItemFindings": "1.020",
                    "regItemIsEx": 0,
                    "regItemUpper": "1.025",
                    "regItemLower": "1.015",
                    "regItemRrs": "1.015-1.025",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954254825",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276737158970868713",
                    "comboName": "尿常规",
                    "itemId": "1276830914885714921",
                    "itemName": "维生素C",
                    "regItemFindings": "-",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954255849",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276737158970868713",
                    "comboName": "尿常规",
                    "itemId": "1276830954614162409",
                    "itemName": "胆红素",
                    "regItemFindings": "-",
                    "regItemIsEx": 0,
                    "regItemRrs": "",
                    "regItemUnit": "",
                    "objectState": 0
                }
            ],
            "regMedImgVoList": [],
            "itemClassId": "1276362888004502505",
            "objectState": 0
        },
        {
            "regComboId": "1278034571954256873",
            "topOrgId": "1",
            "orgId": "1",
            "orgCode": "0001",
            "regId": "1278034570880484329",
            "comboId": "1276907110826771433",
            "comboName": "血常规",
            "sampleTypeId": "2",
            "regSampleIsDone": 0,
            "regComboPeClassNames": "10+30+40",
            "regComboIsMerge": 0,
            "regComboIsEx": 0,
            "regComboState": 1,
            "regComboCheckBy": "1278016393505145833",
            "regComboCheckByName": "校广录",
            "whenRegComboCheck": 1536562288000,
            "regComboUploadFlag": 0,
            "dictInputType": "1",
            "comboDisOrder": 41,
            "regItemVoList": [
                {
                    "regItemId": "1278034571954257897",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276902425017451497",
                    "itemName": "白细胞数目",
                    "regItemFindings": "11",
                    "regItemResult": "↑",
                    "regItemIsEx": 1,
                    "regItemUpper": "9.5",
                    "regItemLower": "3.5",
                    "regItemRrs": "3.5-9.5",
                    "regItemUnit": "X10^9/L",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954258921",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276903651230614505",
                    "itemName": "红细胞数目",
                    "regItemFindings": "2",
                    "regItemResult": "↓",
                    "regItemIsEx": 1,
                    "regItemUpper": "5.8",
                    "regItemLower": "4.3",
                    "regItemRrs": "4.3-5.8",
                    "regItemUnit": "X10^12/L",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954259945",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276903712433898473",
                    "itemName": "血红蛋白",
                    "regItemFindings": "3",
                    "regItemIsEx": 1,
                    "regItemUpper": "175",
                    "regItemLower": "130",
                    "regItemRrs": "130-175",
                    "regItemUnit": "g/L",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954260969",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276903891748783081",
                    "itemName": "血小板数目",
                    "regItemFindings": "4",
                    "regItemIsEx": 1,
                    "regItemUpper": "300",
                    "regItemLower": "110",
                    "regItemRrs": "110-300",
                    "regItemUnit": "X10^9/L",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954261993",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276904519887750121",
                    "itemName": "中性粒细胞百分比",
                    "regItemFindings": "3",
                    "regItemIsEx": 1,
                    "regItemUpper": "75",
                    "regItemLower": "40",
                    "regItemRrs": "40-75",
                    "regItemUnit": "%",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954263017",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276904581091034089",
                    "itemName": "淋巴细胞数目",
                    "regItemFindings": "4",
                    "regItemIsEx": 1,
                    "regItemUpper": "3.2",
                    "regItemLower": "1.1",
                    "regItemRrs": "1.1-3.2",
                    "regItemUnit": "X10^9/L",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954264041",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276904643368059881",
                    "itemName": "淋巴细胞百分比",
                    "regItemFindings": "2",
                    "regItemIsEx": 1,
                    "regItemUpper": "50",
                    "regItemLower": "20",
                    "regItemRrs": "20-50",
                    "regItemUnit": "%",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954265065",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276904690612700137",
                    "itemName": "单核细胞数目",
                    "regItemFindings": "1",
                    "regItemIsEx": 1,
                    "regItemUpper": "0.6",
                    "regItemLower": "0.1",
                    "regItemRrs": "0.1-0.6",
                    "regItemUnit": "X10^9/L",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954266089",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276904813019268073",
                    "itemName": "嗜酸性粒细胞数目",
                    "regItemFindings": "1",
                    "regItemResult": "↑",
                    "regItemIsEx": 1,
                    "regItemUpper": "0.52",
                    "regItemLower": "0.02",
                    "regItemRrs": "0.02-0.52",
                    "regItemUnit": "X10^9/L",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954267113",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276904866706359273",
                    "itemName": "嗜酸性粒细胞百分比",
                    "regItemFindings": "2",
                    "regItemIsEx": 0,
                    "regItemUpper": "8",
                    "regItemLower": "0.4",
                    "regItemRrs": "0.4-8",
                    "regItemUnit": "X10^9/L",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954268137",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276904964416865257",
                    "itemName": "嗜碱性粒细胞数目",
                    "regItemFindings": "1",
                    "regItemIsEx": 1,
                    "regItemUpper": "0.06",
                    "regItemLower": "0",
                    "regItemRrs": "0-0.06",
                    "regItemUnit": "X10^9/L",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954269161",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276904999850345449",
                    "itemName": "嗜碱性粒细胞百分比",
                    "regItemFindings": "1",
                    "regItemIsEx": 0,
                    "regItemUpper": "1",
                    "regItemLower": "0",
                    "regItemRrs": "0-1",
                    "regItemUnit": "%",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954270185",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276905116888204265",
                    "itemName": "红细胞分布宽度变异系数",
                    "regItemFindings": "2",
                    "regItemIsEx": 1,
                    "regItemUpper": "16.5",
                    "regItemLower": "11.6",
                    "regItemRrs": "11.6-16.5",
                    "regItemUnit": "%",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954271209",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276905287613154281",
                    "itemName": "红细胞分布宽度标准差",
                    "regItemFindings": "1",
                    "regItemIsEx": 0,
                    "regItemUpper": "15",
                    "regItemLower": "0",
                    "regItemRrs": "0-15",
                    "regItemUnit": "fL",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954272233",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276905690266338281",
                    "itemName": "红细胞压积",
                    "regItemFindings": "1",
                    "regItemIsEx": 1,
                    "regItemUpper": "0.5",
                    "regItemLower": "0.4",
                    "regItemRrs": "0.4-0.5",
                    "regItemUnit": "%",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954273257",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276905884613608425",
                    "itemName": "平均红细胞体积",
                    "regItemFindings": "1",
                    "regItemIsEx": 1,
                    "regItemUpper": "100",
                    "regItemLower": "82",
                    "regItemRrs": "82-100",
                    "regItemUnit": "fL",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954274281",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276905954406826985",
                    "itemName": "平均红细胞血红蛋白含量",
                    "regItemFindings": "1",
                    "regItemIsEx": 1,
                    "regItemUpper": "34",
                    "regItemLower": "27",
                    "regItemRrs": "27-34",
                    "regItemUnit": "pg",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954275305",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276906028495012841",
                    "itemName": "平均红细胞血红蛋白浓度",
                    "regItemFindings": "1",
                    "regItemIsEx": 1,
                    "regItemUpper": "354",
                    "regItemLower": "316",
                    "regItemRrs": "316-354",
                    "regItemUnit": "g/L",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954276329",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276906121910551529",
                    "itemName": "中性粒细胞数目",
                    "regItemFindings": "1",
                    "regItemIsEx": 1,
                    "regItemUpper": "6.3",
                    "regItemLower": "1.8",
                    "regItemRrs": "1.8-6.3",
                    "regItemUnit": "X10^9/L",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954277353",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276906448328066025",
                    "itemName": "血小板压积",
                    "regItemFindings": "1",
                    "regItemIsEx": 1,
                    "regItemUpper": "0.39",
                    "regItemLower": "0.17",
                    "regItemRrs": "0.17-0.39",
                    "regItemUnit": "%",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954278377",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276906511678833641",
                    "itemName": "平均血小板体积",
                    "regItemFindings": "1",
                    "regItemIsEx": 1,
                    "regItemUpper": "13",
                    "regItemLower": "9",
                    "regItemRrs": "9-13",
                    "regItemUnit": "fL",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954279401",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276906796220417001",
                    "itemName": "单核细胞百分比",
                    "regItemFindings": "1",
                    "regItemIsEx": 1,
                    "regItemUpper": "10",
                    "regItemLower": "3",
                    "regItemRrs": "3-10",
                    "regItemUnit": "%",
                    "objectState": 0
                },
                {
                    "regItemId": "1278034571954280425",
                    "topOrgId": "1",
                    "orgId": "1",
                    "orgCode": "0001",
                    "regId": "1278034570880484329",
                    "regItemPeClassNames": "10+30+40",
                    "comboId": "1276907110826771433",
                    "comboName": "血常规",
                    "itemId": "1276907179546248169",
                    "itemName": "血小板分布宽度",
                    "regItemFindings": "1",
                    "regItemIsEx": 1,
                    "regItemUpper": "17",
                    "regItemLower": "9",
                    "regItemRrs": "9-17",
                    "regItemUnit": "fL",
                    "objectState": 0
                }
            ],
            "regMedImgVoList": [],
            "itemClassId": "1276362908405597161",
            "objectState": 0
        }
    ],
    "regPeClassVoList": [
        {
        	"regOutVoList":{},
    		"regOutVoArray":[],
            "regPeClassId": "1278034570880487401",
            "topOrgId": "1",
            "orgId": "1",
            "orgCode": "0001",
            "regId": "1278034570880484329",
            "dictStPeClass": "10",
            "peClassId": "1",
            "regDeptSum": "1、身高体重\r\n目前未见异常\r\n2、血压\r\n91mmHg↑\r\n45↓\r\n3、内科常规检查\r\n目前未见异常\r\n4、听力检测\r\n5、纯音听阈测试\r\n6、12导联心电图\r\n目前未见异常\r\n7、尿常规\r\n未见明显异常\r\n8、血常规\r\n11↑\r\n2↓\r\n3\r\n4\r\n1\r\n1",
            "regSum": "1、血压升高\r\n2、白细胞增多\r\n3、血小板压积:偏高",
            "regPropose": "1、连续三天复查血压，如持续高于140/90mmHg，请心内科门诊咨询、诊治。\r\n2、某些细菌感染（如扁桃体炎、肺炎等）可使白细胞增多，可服抗生素治疗，复查血液分析，如仍异常，建议到内科咨询或诊治。\r\n3、您血小板计数正常，因此此项指标高低无重要临床意义。",
            "regMainCheckState": 1,
            "regMainCheckBy": "1",
            "regMainCheckByName": "管理员",
            "whenRegMainCheck": 1539662014000,
            "regAuditBy": "1278022288347759593",
            "regAuditByName": "蒋国梅",
            "whenRegAudit": 1536563192000,
            "regReportPrintTimes": 0,
            "peClassName": "职业体检",
            "objectState": 0
        }
    ],
    "regDiseaseVoList": [
        {
            "diseaseId": "20",
            "diseaseName": "超重",
            "disOrder": 20,
            "regDiseaseComboVoList": [
                {
                    "comboId": "1276445800200668137",
                    "comboName": "血压",
                    "objectState": 1
                }
            ],
            "regDiseaseHcVo": {
                "dictHcOpt": "1",
                "objectState": -1
            },
            "regDiseaseOcpVo": {
                "regDiseaseOcpOptId": "30",
                "regDiseaseOcpOptName": "职业禁忌症",
                "objectState": 1
            },
            "regDiseasePeClassVoList": [
                {
                    "peClassId": "1",
                    "peClassName": "职业体检",
                    "dictStPeClass": "10",
                    "objectState": 1
                }
            ],
            "diseasePropose": "体重指数（ＢＭＩ）＞24为超重，超重是糖尿病、心血管病的重要危险因素，要认真纠正不良的生活方式，合理饮食，少食油炸、高脂类及高热量食品。加强体育锻炼，适当运动，减轻体重，控制体重适中。",
            "objectState": 1,
            "id": "",
            "regDiseaseOcpOptId": "60",
            "regDiseaseHazardNames": "",
            "regDiseaseOcpPropose": "",
            "regDiseaseRequirement": "",
            "regDiseaseTgtDiseaseNames": "",
            "nsTemplateButton": "",
            "regDiseaseReComboVoList": [
                {
                    "comboName": "身高体重",
                    "comboId": "1276441022049551337"
                },
                {
                    "comboName": "外科常规检查",
                    "comboId": "1276453477454709737"
                },
                {
                    "comboName": "皮肤科常规检查",
                    "comboId": "1276454441674867689"
                }
            ]
        },
        {
            "diseaseId": "1278856885318976489",
            "diseaseName": "耳病",
            "regDiseaseSeverity": "1",
            "disOrder": 1857,
            "regDiseaseComboVoList": [
                {
                    "comboId": "1276445800200668137",
                    "comboName": "血压",
                    "objectState": 1
                }
            ],
            "regDiseaseHcVo": {
                "dictHcOpt": "1",
                "objectState": 1
            },
            "regDiseaseOcpVo": {
                "regDiseaseOcpOptId": "30",
                "regDiseaseOcpOptName": "职业禁忌症",
                "objectState": 1,
                "regOutVoList":{},
    			"regOutVoArray":[],
                "regDiseaseHazardVoList": [
                    {
                        "hazardId": "1277463888912188393",
                        "hazardName": "苯",
                        "objectState":-1,
                        "regOutVoList":{},
    					"regOutVoArray":[],
                    },
                    {
                        "hazardId": "1277474025035006953",
                        "hazardName": "噪声",
                        "objectState":1,
                    }
                ],
                "regDiseaseHazardNames": "苯,噪声",
                "regDiseaseOcpPropose": "职业建议职业建议职业建议职业建议职业建议职业建议职业建议职业建议职业建议职业建议职业建议职业建议",
                "regDiseaseTgtDiseaseVoList": [
                    {
                        "tgtDiseaseId": "1277372577907475433",
                        "tgtDiseaseName": "中度贫血",
                        "tgtDiseaseFlag": 1
                    },
                    {
                        "tgtDiseaseId": "1277373898609918953",
                        "tgtDiseaseName": "多发性周围神经病",
                        "tgtDiseaseFlag": 1
                    },
                    {
                        "tgtDiseaseId": "1277373946928301033",
                        "tgtDiseaseName": "中枢神经系统器质性疾病",
                        "tgtDiseaseFlag": 1,
                        "objectState":-1,
                    }
                ],
                "regDiseaseTgtDiseaseNames": "中度贫血,多发性周围神经病,中枢神经系统器质性疾病"
            },
            "regDiseasePeClassVoList": [
                {
                    "peClassId": "1",
                    "peClassName": "职业体检",
                    "dictStPeClass": "10",
                    "objectState": 1
                },{
                    "peClassId": "2",
                    "peClassName": "从业体检",
                    "dictStPeClass": "20",
                    "objectState": -1
                }
            ],
            "objectState": 1,
            "id": "",
            "regDiseaseOcpOptId": "30",
            "regDiseaseHazardNames": "",
            "diseasePropose": "",
            "regDiseaseOcpPropose": "",
            "regDiseaseRequirement": "复查血常规",
            "regDiseaseTgtDiseaseNames": "",
            "nsTemplateButton": "",
            "hazardName": "苯,噪声",
            "tgtDiseaseName": "中度贫血,多发性周围神经病,中枢神经系统器质性疾病"
        }
    ],
    "objectState": 0
}*/
nsServerTools.deleteEmptyData = function(_outputData){
	var isValid = true;
	if (debugerMode) {
		if(typeof(_outputData)!='object'){
			//开发模式下进行值的验证如果值不是object类型，无法继续返回false
			isValid = false;
			console.warn('参数值类型不合法:');
			console.warn(_outputData);
		}
	}
	if(!isValid){
		//验证不通过直接返回
		return _outputData;
	}
	var outputData = $.extend(true,{},_outputData);
	function filterData(data){
		for(var key in data){
			var dataType = typeof(data[key]);
			switch(dataType){
				case 'object':
					break;
				case 'undefined':
					delete data[key];
					break;
				case 'string':
					if(data[key] === ''){
						delete data[key];
					}
					break;
				case 'number':
				case 'boolean':
					break;
			}
		}
		return data;
	}
	function runData(outputData){
		//验证模式通过
		filterData(outputData);//处理数据值
		for(var key in outputData){
			var data = outputData[key];
			if(typeof(data)=='object'){
				if($.isArray(data)){
					//数组处理
					if(data.length > 0){
						//数组长度大于0
						for(var dataI=0; dataI<data.length; dataI++){
							runData(data[dataI]);
						}
					}else{
						delete outputData[key];
					}
				}else{
					//对象处理
					if($.isEmptyObject(data)){
						//是个空对象
						delete outputData[key];
					}else{
						runData(data);
					}
				}
			}
		}
	}
	runData(outputData);
	return outputData;
}