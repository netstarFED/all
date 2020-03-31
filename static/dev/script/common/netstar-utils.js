/*
 * @Desription: 文件说明
 * @Author: netstar.cy
 * @Date: 2018-11-28 09:32:47
 * @LastEditTime: 2019-12-25 11:30:08
 */
// "use strict";
//通用工具集合 NetStarUtils
var NetStarUtils = {};
var NsUtils = NetStarUtils; //简写  
var NetstarTempValues = {};//界面临时参数 sjj20190327
var NetstarTopValues = {
	topNav: {
		height: 102,
	},
	bottom: {
		height: 84
	},//底部
};
//根据默认值对当前值进行赋值并返回 cy 181128 
NetStarUtils.getDefaultValues = function (_sourceJSON, _defaultValuesJSON) {
	/**
	 * 	sourceJSON:object  			当前设置
	 * 	_defaultValuesJSON:object 	默认设置
	 **/
	var sourceJSON = $.extend(true, {}, _sourceJSON);
	if (typeof (sourceJSON) == 'undefined') {

		sourceJSON = {};
	}
	$.each(_defaultValuesJSON, function (key, value) {
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
	return sourceJSON
};
NetStarUtils.setDefaultValues = function (sourceJSON, _defaultValuesJSON) {
	/**
	 * 	sourceJSON:object  			当前设置
	 * 	_defaultValuesJSON:object 	默认设置
	 **/
	if (typeof (sourceJSON) == 'undefined') {
		sourceJSON = {};
	}
	$.each(_defaultValuesJSON, function (key, value) {
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
};
// 删除objectState 所有 lyw 10191212
NetStarUtils.deleteAllObjectState = function(object){
	function run(data){
		if(typeof(data) != "object"){
			return false;
		}
		if($.isArray(data)){
			for(var i=0; i<data.length; i++){
				if(typeof(data[i]) == "object"){
					run(data[i]);
				}
			}
		}else{
			delete data.objectState;
			for(var key in data){
				if(typeof(data[key]) == "object"){
					run(data[key]);
				}
			}
		}
	}
	run(object);
}


//对HTML字符串进行转义 从<p><b>为&lt;p&gt;&lt;b&gt;等
NetStarUtils.encodeHtml = function (str) {
	/**
	 * str:string html字符串 例如<p>
	 * return string 转义后的字符串
	 */
	//对\ & ' < > 空格(0x20)、0x00到0x20、0x7F-0xFF以及0x0100-0x2700的字符进行转义
	var REGX_HTML_ENCODE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;
	return (typeof str != "string") ? s :
		str.replace(REGX_HTML_ENCODE,
			function ($0) {
				var c = $0.charCodeAt(0), r = ["&#"];
				c = (c == 0x20) ? 0xA0 : c;
				r.push(c); r.push(";");
				return r.join("");
			});
};
//对HTML字符串进行转义 从<p><b>为&lt;p&gt;&lt;b&gt;等
NetStarUtils.decodeHtml = function (str) {
	/**
	 * str:string 转义后的字符串
	 * return string html字符串
	 */
	var HTML_DECODE = {
		"&lt;": "<",
		"&gt;": ">",
		"&amp;": "&",
		"&nbsp;": " ",
		"&quot;": "\"",
		"&copy;": "©"
		// Add more
	};
	var REGX_HTML_DECODE = /&\w+;|&#(\d+);/g;
	return (typeof s != "string") ? s :
		s.replace(REGX_HTML_DECODE,
			function ($0, $1) {
				var c = this.HTML_ENCODE[$0]; // 尝试查表
				if (c === undefined) {
					// Maybe is Entity Number
					if (!isNaN($1)) {
						c = String.fromCharCode(($1 == 160) ? 32 : $1);
					} else {
						// Not Entity Number
						c = $0;
					}
				}
				return c;
			});
};
//获取浏览器及操作系统版本 cy 201704
NetStarUtils.getBrowserVersion = function () {

	//如果不能访问到navigator 或者 window，则是运行环境有意屏蔽该对象，一般而言只有私有运行环境才会产生此问题，常见于手机环境下，如微信等
	if (typeof (navigator) == 'undefined' || typeof (window) == 'undefined') {
		return {
			browserVersion: 'unknown',
			browserSystem: 'moblie',
		}
	}

	//首先根据浏览器返回头判定
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
};
NetStarUtils.Browser = NetStarUtils.getBrowserVersion();
//获取用户语言 cy 201610
NetStarUtils.getUserLanguage = function () {
	/**
	 * @msg: 返回浏览器用户语言
	 * @param：-
	 * @return: string 例如 zh（简体中文）en（英文）
	 */
	var userLanguage = 'zh'; //默认简体中文
	if (navigator.userLanguage) {
		userLanguage = navigator.userLanguage.substring(0, 2).toLowerCase();
	} else {
		userLanguage = navigator.language.substring(0, 2).toLowerCase();
	}
	return userLanguage;
};
NetStarUtils.userLang = NetStarUtils.getUserLanguage();
NetStarUtils.getI18n = function (I18N) {
	/**
	 * @msg: 方法说明
	 * @param I18N:object {zh:{name:'简体中文', ...},en:{}}
	 * @return: i18n:object {name:'简体中文', ...}
	 */
	var i18n = I18N[NetStarUtils.userLang];
	if (debugerMode) {
		if (typeof (i18n) != 'object') {
			console.error('无法找到当前语言包：' + NetStarUtils.userLang);
			console.error(I18N);
		}
	}
	return i18n;
};

//获取当前项目所使用的VUEHTML 模板
NetStarUtils.getTemplate = function (templateConfig) {
	//临时这么写的，应当是写在 root page 上的变量
	var current = 'PC'
	return templateConfig[current];
};
NetStarUtils.getTemplateHtml = function (containerHtml, templateObj, _isUpperCase) {
	//在容器html中查找{{ ... }}标签， 并用模板对象中的对应key -> value进行替换  默认情况下标签和key都应当是大写，以便区分
	var patt = new RegExp("\{\{(.*?)\}\}", "g");
	var result;
	var html = containerHtml;
	//默认key和标签都应当使用大写
	var isUpperCase = typeof (_isUpperCase) == 'boolean' ? _isUpperCase : true;
	while ((result = patt.exec(html)) != null) {
		//是否要转换为大写 应当尽可能使用大写形式，便于日后代码阅读
		var subTemplateName = $.trim(result[1]);
		if (isUpperCase) {
			var subTemplateName = subTemplateName.toUpperCase();
		}
		//组件可能存在于container容器中，也可能只是一个VUE变量
		if (templateObj[subTemplateName]) {
			//如果是container标签，则进行替换
			html = html.replace(result[0], templateObj[subTemplateName]);
		}
	}
	return html;
};

//值转换方法类
NetStarUtils.valueConvertManager = {
	I18N: {
		zh: {
			defaultDateFormat: 'YYYY/MM/DD',
			errorDateValue: '时间格式错误',
			moneySymbol: '￥',
		},
		en: {
			defaultDateFormat: 'MM/DD/YYYY',
			errorDateValue: 'Invalid date',
			moneySymbol: '$',
		}
	},
	//根据时间戳获取日期 1544767009477 -> 2018/12/14
	getDateTimeStringByTimestamp: function (_value, options) {
		/**
		 * value: string/number 要转化为时间字符串的时间戳 例如：1544767009477
		 * options:{
		 * 		format:'YYYY/MM/DD'  //默认的格式 moment标准格式
		 * 		defaultFormat:'YYYY/MM/DD HH:mm:ss'
		 * }
		 */

		var i18n = NetStarUtils.getI18n(this.I18N);
		var isConvert = false;//默认不对值进行转换
		var value = _value;//默认值为空
		if(value===null){
			value = '';
		}
		switch (typeof (value)) {
			case 'string':
				if (value) {
					//值为字符串类型并且存在
					value = parseInt(value);
					if (isNaN(value)) {
						isConvert = false;
					} else {
						isConvert = true;
					}
				}
				break;
			case 'number':
				if (value != 0) {
					//值为数值类型但值为0 此处不应该 排除0 但因为存在获取类型值转换问题所以暂定方案需要过滤0
					isConvert = true;
				}else{
					//如果格式化结果是只要时间不要年月日，则为0也是正常赋值
					if(options.format == 'HH:mm:ss'){
						isConvert = true;  
					}else{
						isConvert = false;
					}
				}
				break;
			default:
				if (debugerMode) {
					console.error('时间戳转换的数据类型错误：' + typeof (value));
					console.error(value);
				}
				break;
		}
		if (isConvert) {
			//可以对值进行转换
			var defaultFormat = options.defaultFormat ? options.defaultFormat : i18n.defaultDateFormat;
			var format = options.format ? options.format : defaultFormat; //如果没有定义转换，则默认转换格式为年-月-日
			if (typeof (format) != 'string') {
				format = 'YYYY/MM/DD';
			}
			value = moment(value).format(format);
		} else {
			if(value === ''){
				// value是空时不处理 lyw
			}else{
				if (debugerMode) {
					console.error('时间戳转化失败：' + _value);
				}
				value = i18n.errorDateValue;
			}
		}
		return value;
	},
	//根据数字获取货币文本 21556.3 -> $21,556.30
	getMoneyStringByNumber: function (_value, options,isTotal) {
		/**
		 *  value: number 要转化为货币字符串的数字 21556.3
		 * 	options:{
		 * 		places:		//小数位数 默认2位
		 * 		symbol:		//标识符 默认$
		 * 		thousand:	//分隔符 默认
		 * 		decimal:	//小数点 默认显示小数点
		 * }
		 */
		var i18n = NetStarUtils.getI18n(this.I18N);
		if(_value === null || _value === ''){
			return '';
		}
		if(typeof(isTotal)!='boolean'){isTotal = false;}
		var number = _value || 0;
		var places = options.places;
		var symbol = options.symbol;
		var thousand = options.thousand;
		var decimal = options.decimal;

		if(isTotal){
			symbol = options.totalSymbol;
		}

		places = !isNaN(places = Math.abs(places)) ? places : 2;
		symbol = symbol !== undefined ? symbol : i18n.moneySymbol;
		thousand = thousand || ",";
		decimal = decimal || ".";
		var negative = number < 0 ? "-" : "",
			i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
			j = (j = i.length) > 3 ? j % 3 : 0;

		var returnValue = symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
		return returnValue
	},
	//根据数字获取格式化后的文本数字
	getFormatNumberStringByNumber: function (_value, options) {
		/**
		 *  value: number 要转化为格式化字符串的数字 21556.3
		 * 	options:{
		 * 		places:		//小数位数 默认3位
		 * 		thousand:	//分隔符 默认
		 * }
		 */
		var _options = $.extend(true, {}, options);
		_options.symbol = '';
		_options.decimal = '.';
		//console.log(_value);
		return this.getMoneyStringByNumber(_value, _options);
	},
	getDictionaryByDictionary: function (_value, options) {
		/**
		 *  value: number 要转化为格式化字符串的数字 21556.3
		 * 	options:{
				0:'nan',1:'nv'
		 * }
		 */
		/*  
		_value 当前值
		_format 字典值 如{'male':'1','female':'2'}
	 */
		var dictionaryValue = '';
		var isSingle = true; //默认读取单个字典
		if (typeof (_value) == 'string') {
			//是字符串类型并且还有逗号分割 认为要处理多个字典显示
			if (_value.indexOf(',') > -1) {
				isSingle = false;
			}
		}
		if (isSingle) {
			$.each(options, function (key, value) {
				if (key == _value) {
					//找到相对应的值终止查找
					dictionaryValue = value;
					return false;
				}
			});
			if (dictionaryValue) {
				var reg = /[switch]/;
				if (!reg.test(dictionaryValue)) {
					//如果字典值里面还有switch则输出标签
					dictionaryValue = '<label>' + dictionaryValue + '</label>';
				}
			}
		} else {
			var dataArray = _value.split(',');
			for (var dataI = 0; dataI < dataArray.length; dataI++) {
				dictionaryValue += '<label>' + options[dataArray[dataI]] + '</label>';
			}
		}
		return dictionaryValue;
	},//获取字典数据
};
//ajax通用方法
//读取服务器端标准格式数据的方法 ajax预定义
NetStarUtils.ajax = function (config, callbackFunction, isNeedError) {
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
		// contentType: 'application/x-www-form-urlencoded',
		contentType: 'application/json; charset=utf-8', // lyw 20190315 修改默认 服务器端修改
	};
	//以baseAjax为默认值，使用新值就行赋值
	for (var option in config) {
		baseAjax[option] = config[option];
	};
	//ajax header处理 把ajax中的header数据转化为ajax文件头 cy 20180711
	var ajaxConfig = $.extend(true, {}, baseAjax);
	function deleteEmpty(_obj){
		for(var key in _obj){
			if(typeof(_obj[key]) == "object"){
				deleteEmpty(_obj[key]);
			}
			if(_obj[key] == null){
				delete _obj[key];
			}
		}
	}
	//sjj 20190109 针对定义的contentType json格式数据的转化
	if (baseAjax.contentType == 'application/json; charset=utf-8' || baseAjax.contentType == 'application/json') {
		if (typeof (baseAjax.data) != 'object') {
			baseAjax.data = {};
		}
		deleteEmpty(baseAjax.data);
		ajaxConfig.data = JSON.stringify(baseAjax.data);
		ajaxConfig.type = "POST";
	}
	//读取 Authorization 并添加到headers 如果已经过期了则报错退出
	var authorization = NetStarUtils.OAuthCode.get();
	if(authorization == false && typeof(NetstarHomePage) == 'object'){
		NetStarUtils.OAuthCode.reLogin();
		return false;
	}
	if(authorization){
		if(typeof(ajaxConfig.headers) != 'object'){
			ajaxConfig.headers = {};
		}
		ajaxConfig.headers.Authorization = authorization;
	}
	if (ajaxConfig.header) {
		if(typeof(ajaxConfig.headers) != 'object'){
			ajaxConfig.headers = {};
		}
		$.each(function(key, value){
			ajaxConfig.headers[key] = value;
		})
	}
	//处理地址
	if (ajaxConfig.src) {
		ajaxConfig.url = ajaxConfig.src;
		delete ajaxConfig.src;
	}
	//sjj 20190624 矩阵传值的参数
	if(ajaxConfig.matrixVariable){
		ajaxConfig.url += ajaxConfig.matrixVariable;
	}
	//ajax配置错误问题
	if(typeof(ajaxConfig.url)!= 'string'){
		console.error('ajax配置错误, 找不到url:', ajaxConfig);
		return false;
	}
	if(ajaxConfig.url.indexOf('http') == -1){
		ajaxConfig.url = getRootPath() + ajaxConfig.url;
	}

	//如果使用GET方法，则在参数中添加token
	var _ajaxType = ajaxConfig.type.toUpperCase();
	if(_ajaxType == 'GET'){
		if(ajaxConfig.url.indexOf('Authorization') == -1){
			if(typeof(ajaxConfig.data) != 'object'){
				ajaxConfig.data = {};
			}
			ajaxConfig.data.Authorization = NetStarUtils.OAuthCode.get();
		}
	}
	if(ajaxConfig.url.indexOf('/middleware/') > -1){
		var staticPageRootPath = NetstarHomePage.config.staticPageRootPath;
		if(staticPageRootPath.indexOf('//localhost') > -1){
			staticPageRootPath = "https://qa.wangxingcloud.com/"
		}
		ajaxConfig.url = ajaxConfig.url.replace(getRootPath(), staticPageRootPath);
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
		NetStarUtils.defaultAjaxError(error);
	}
	/*********sjj 20191230 ajax超时******start*/
	var isReadTimeout = typeof(ajaxConfig.isReadTimeout)=='boolean' ? ajaxConfig.isReadTimeout : true;
	if(isReadTimeout){
		if(typeof(ajaxConfig.timeout)=='number'){
			
		}else{
			ajaxConfig.timeout = 30*1000;
		}
		ajaxConfig.plusData = typeof(ajaxConfig.plusData)=='object' ? ajaxConfig.plusData : {};
		ajaxConfig.plusData.callbackFunction = callbackFunction;
		ajaxConfig.plusData.url = ajaxConfig.url;
		ajaxConfig.complete  = function(XMLHttpRequest,status){
			if(status=='timeout'){
				//超时,status还有success,error等值的情况
				if(typeof(this.plusData.callbackFunction)=='function'){
					console.warn(this.plusData.url);
					this.plusData.callbackFunction({msg:'数据返回超时',success:false,plusData:this.plusData});
				}
	　　　　}
		}
		//ajaxConfig.timeout = 30*1000; 
	}
	/*********sjj 20191230 ajax超时******end*/
	$(document).ready(function () {
		$.ajax(ajaxConfig);
	})
};
var NSAJAXERRORINFO = {
	0: '服务器没有响应，错误代码 0',
	200: '返回数据成功，很可能是返回格式错误',
	400: 'HTTP 400 – 请求无效',
	401: 'HTTP 401 - 访问请求授权失败',
	401.1: 'HTTP 401.1 – 未授权：登录失败',
	401.2: 'HTTP 401.2 – 未授权：服务器配置问题导致登录失败',
	401.3: 'HTTP 401.3 – ACL 禁止访问资源',
	401.4: 'HTTP 401.4 – 未授权：授权被筛选器拒绝',
	401.5: 'HTTP 401.5 – 未授权：ISAPI 或 CGI 授权失败',
	403:   'HTTP 403 – 对 Internet 服务管理器 的访问仅限于 Localhost',
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
	413: 'HTTP 413 - 字段长度不够或文件大小超出范围',
	414: 'HTTP 414 – 请求 – URI 太长',
	500: 'HTTP 500 – 内部服务器错误',
	500.100: 'HTTP 500.100 – 内部服务器错误 – ASP 错误',
	500.12: 'HTTP 500-12 应用程序重新启动',
	500.13: 'HTTP 500-13 – 服务器太忙',
	500.14: 'HTTP 500-14 – 应用程序无效',
	500.15: 'HTTP 500-15 – 不允许请求 global.asa',
	501: 'Error 501 – 未实现',
	502: 'HTTP 502 – 网关错误'
};
//默认的ajax错误处理函数
NetStarUtils.defaultAjaxError = function (error) {
	//error:object $.ajax返回的error对象
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
};
//sjj 20190123 设置body的大小和皮肤
NetStarUtils.setBodySizeAndSkin = function (_rootPath) {
	var bodyManager = store.get('skin-config');
	if (bodyManager) {
		//存在缓存
		var cssLinkStr =  '';
		if(bodyManager.linkhref.indexOf('pt-common')>-1){
			cssLinkStr = 'pt-common.css?v=0.1';
		}else if(bodyManager.linkhref.indexOf('sap-common')>-1){
			cssLinkStr = 'sap-common.css?v=0.1';
		}else if(bodyManager.linkhref.indexOf('gjp-common')>-1){
			cssLinkStr = 'gjp-common.css?v=0.1';
		}else if(bodyManager.linkhref.indexOf('standard-common')>-1){
			cssLinkStr = 'standard-common.css?v=0.1';
		}
		var linkhref = _rootPath +'/assets/less/'+cssLinkStr;
		$('#body-link-skin-manager').attr('href',linkhref);
		$('body').attr('class', 'body-' + bodyManager.size);
		NetStarUtils.skinConfig = bodyManager;
	} else {
		var sizeClassStr = $('body').attr('class');
		var skinHref = $('#body-link-skin-manager').attr('href');
		store.set('skin-config', { size: sizeClassStr, linkhref: skinHref });
	}
};
//sjj 20190123 重新读取模板数据
NetStarUtils.resetTemplateData = function () {
	var $container = nsPublic.getAppendContainer();
	var classStr = $container.children('div').eq(0).attr('class');
	var templateId = '';
	if (classStr.indexOf('businessdatabase') > -1) {
		//基础模板
		templateId = $container.children('div').eq(0).attr('id');
		NetstarTemplate.templates.businessDataBase.resetData(templateId);
	}
};
var getRootPath = function () {
	var curWwwPath = window.document.location.href;
	var pathName = window.document.location.pathname;
	var pos = curWwwPath.indexOf(pathName);
	var localhostPaht = curWwwPath.substring(0, pos);
	var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
	return (localhostPaht + projectName);
};
/*sjj 20190307 读取列配置中开启检索的字段*/
NetStarUtils.getListQueryData = function (_columns, _configObj) {
	/** 
		*_columns array 列配置 
		*_configObj object 附加传参定义配置参数
			id string 容器id 
			*querySelectHandler  func  下拉选择检索条件回调方法
			value 默认值
	*/
	if (!$.isArray(_columns)) {
		return false;
	}
	var configObj = typeof (_configObj) == 'object' ? _configObj : {};
	var queryFieldArray = [
		{
			value: 'quickSearch',
			text: '快速查询',
			isChecked: true,
		}
	];		//快速查询 仅支持根据单字段查询
	var formFieldArray = [];		//表单展开检索  支持多条件查询
	var advanceFieldArray = [];		//高级检索  支持多条件查询
	var queryFormFieldArray = [];     //类型为下拉框的筛选条件
	var quickQueryFieldArr = [];	//支持快速查询的字段名称
	for (var colI = 0; colI < _columns.length; colI++) {
		var colData = _columns[colI];//当前列配置项
		//如果当前列配置项开启了搜索配置
		var searchable = typeof(colData.searchable) == 'boolean' ? colData.searchable : false;
		var isQuickQuery = typeof(colData.isQuickQuery) == 'boolean' ? colData.isQuickQuery : false;//是否支持快速查询
		if(searchable){
			var editConfig = $.extend(true, {}, colData.editConfig);//自定义列配置项
			var businessConfig = colData.businessConfig ? colData.businessConfig : {};//业务组件
			var titleStr = colData.title ? colData.title : colData.field;// 定义了标题读取标题没有定义读取field字段作为标题
			titleStr = '按' + titleStr + '查询';
			var queryJson = {
				value: colData.field,
				text: titleStr,
				searchType: 'text'
			};//快速查询 (生成检索条件的subdata值)
			var advanceJson = {
				id: colData.field,
				label: colData.title,
				type: 'text'
			};//高级检索(生成检索条件的定义列值)
			
			if(typeof(colData.isTreeNode)=='boolean'){
				if(colData.isTreeNode){
					queryJson.text = colData.chineseName;
					advanceJson.label = colData.chineseName;
				}
			}
			var advanceJsonEditConfig = $.extend(true, {}, editConfig);
			switch (editConfig.type) {
				case 'radio':
				case 'checkbox':
					editConfig.type = 'select';
					break;
				case 'number':
					editConfig.type = 'numberRange';
					advanceJsonEditConfig.type = 'numberRange';
					break;
				case 'date':
					editConfig.type = 'dateRangePicker';
					editConfig.isRelativeTime = true;
					advanceJsonEditConfig.type = 'dateRangePicker';
					advanceJsonEditConfig.isRelativeTime = true;
					break;
			}
			switch (editConfig.type) {
				case 'select':
				case 'date':
				case 'number':
				case 'provinceselect':
				case 'business':
				case 'dateRangePicker':
				case 'businessSelect':
				case 'valuesInput':
				case 'treeSelect':
				case 'numberRange':
					//select类型 需要存放的属性值
					queryJson.searchType = editConfig.type;
					editConfig.id = colData.field;
					advanceJsonEditConfig.id = colData.field;
					// advanceJson = editConfig;
					advanceJson = advanceJsonEditConfig;
					delete advanceJson.rules;
					var tempJson = $.extend(true, {}, editConfig);
					delete tempJson.label;
					tempJson.hidden = true;
					delete tempJson.rules;
					tempJson.inputWidth = 150;
					if(editConfig.type == "business"){
						tempJson.isNeedJumpNext = false;
					}
					queryFormFieldArray.push(tempJson);//默认隐藏带下拉条件的查询条件
					break;
				case 'textarea':
					queryJson.searchType = 'textarea';
					break;
			}
			if (colData.columnType == 'business' || colData.columnType == 'businessSelect') {
				queryJson.searchType = colData.type;
				advanceJson = businessConfig;
				var tempJson = $.extend(true, {}, businessConfig);
				delete tempJson.label;
				tempJson.hidden = true;
				delete tempJson.rules;
				tempJson.id = colData.field;
				tempJson.inputWidth = 150;
				queryFormFieldArray.push(tempJson);//默认隐藏带下拉条件的查询条件
			}
			queryFieldArray.push(queryJson);
			advanceFieldArray.push(advanceJson);
			formFieldArray.push(advanceJson);
		}
		if(isQuickQuery){
			quickQueryFieldArr.push(colData.field);
		}
	}
	queryFormFieldArray.unshift(
		{
			id: "filtermode",
			type: 'select',
			value: 'quickSearch',//检索值
			// isObjectValue:true,
			subdata: queryFieldArray,
			isHasClose: false,
			inputWidth:150,
			commonChangeHandler: function (data) {
				//根据所选筛选条件显示相对应的检索值
				var formId = data.config.formID;
				$('#form-' + formId + ' div.pt-form-group:not(":first")').addClass('hide');
				var currentElementId = 'form-' + formId + '-filterstr';
				if (data.value != 'quickSearch') {
					var queryConfig = NetstarComponent.config[formId].config[data.value];
					if (!$.isEmptyObject(queryConfig)) {
						switch (queryConfig.type) {
							case 'select':
							case 'date':
							case 'business':
							case 'provinceselect':
							case 'businessSelect':
							case 'valuesInput':
							case 'treeSelect':
							case 'numberRange':
								var id = 'form-'+formId+'-'+data.value;
								$('#' + id).closest('.pt-form-group').removeClass('hide');
								break;
							case 'dateRangePicker':
								var id = 'form-'+formId+'-'+data.value;
								$('label[for="'+id+'"]').closest('.pt-form-group').removeClass('hide');
								break;
						}
					}else{
						$('#' + currentElementId).closest('.pt-form-group').removeClass('hide');	
					}
				}else{
					$('#' + currentElementId).closest('.pt-form-group').removeClass('hide');
				}
				if (typeof (configObj.querySelectHandler) == 'function') {
					configObj.querySelectHandler(data);
				}	
			}
		},
		{
			id: "filterstr",
			type: 'text',
			value: configObj.value,
			inputWidth:150,
		}
	);

	var queryPanelConfig = {
		type: 'select',
		queryForm: queryFormFieldArray,
		advanceForm: advanceFieldArray,
		form : formFieldArray,
		quickQueryFieldArr:quickQueryFieldArr,
	};
	if (configObj.id) {
		//定义检索容器的id 
		queryPanelConfig.id = 'query-' + configObj.id;
	}
	return queryPanelConfig;
};
/*sjj 20190307 读取列配置中开启检索的字段*/
/*sjj 20190307 读取列配置中开启检索的字段*/
/***********sjj 20190311 读取正则匹配段落值 start***********************************/
NetStarUtils.parseFilters = function (exp) {
	var inSingle = false;
	var inDouble = false;
	var inTemplateString = false;
	var inRegex = false;
	var curly = 0;
	var square = 0;
	var paren = 0;
	var lastFilterIndex = 0;
	var c, prev, i, expression, filters;

	for (i = 0; i < exp.length; i++) {
		prev = c;
		c = exp.charCodeAt(i);
		if (inSingle) {
			if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
		} else if (inDouble) {
			if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
		} else if (inTemplateString) {
			if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
		} else if (inRegex) {
			if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
		} else if (
			c === 0x7C && // pipe
			exp.charCodeAt(i + 1) !== 0x7C &&
			exp.charCodeAt(i - 1) !== 0x7C &&
			!curly && !square && !paren
		) {
			if (expression === undefined) {
				// first filter, end of expression
				lastFilterIndex = i + 1;
				expression = exp.slice(0, i).trim();
			} else {
				pushFilter();
			}
		} else {
			switch (c) {
				case 0x22: inDouble = true; break         // "
				case 0x27: inSingle = true; break         // '
				case 0x60: inTemplateString = true; break // `
				case 0x28: paren++; break                 // (
				case 0x29: paren--; break                 // )
				case 0x5B: square++; break                // [
				case 0x5D: square--; break                // ]
				case 0x7B: curly++; break                 // {
				case 0x7D: curly--; break                 // }
			}
			if (c === 0x2f) { // /
				var j = i - 1;
				var p = (void 0);
				// find first non-whitespace prev char
				for (; j >= 0; j--) {
					p = exp.charAt(j);
					if (p !== ' ') { break }
				}
				if (!p || !validDivisionCharRE.test(p)) {
					inRegex = true;
				}
			}
		}
	}

	if (expression === undefined) {
		expression = exp.slice(0, i).trim();
	} else if (lastFilterIndex !== 0) {
		pushFilter();
	}

	function pushFilter() {
		(filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
		lastFilterIndex = i + 1;
	}

	if (filters) {
		for (i = 0; i < filters.length; i++) {
			expression = wrapFilter(expression, filters[i]);
		}
	}
	return expression;
}
NetStarUtils.getHtmlByRegular = function (data, text) {
	/*
		data object 匹配的数据值
		expression string 正则匹配的表达式
	*/
	var tokens = [];
	var tagRE = /\{\{((?:.|\n)+?)\}\}/g;
	var lastIndex = tagRE.lastIndex = 0;
	var match, index, tokenValue;
	var html = '';
	while ((match = tagRE.exec(text))) {
		index = match.index;
		// push text token
		if (index > lastIndex) {
			tokenValue = text.slice(lastIndex, index)
			tokens.push(tokenValue);
		}
		var exp = NetStarUtils.parseFilters(match[1].trim());
		if($.isArray(data[exp])){
			//当前是数组
		}else if(exp.indexOf('.')>-1){
			//读取到的里面包含.
			function getValue(ps){
				var top = data;
				for(var i = 0; i < ps.length-1; i++){
					if(!top[ps[i]]){
						top[ps[i]] = {};
					}
					top = top[ps[i]];
				}
				return top;
			}
			var expArray = exp.split('.');
			var listData = getValue(expArray);
			var listField = expArray[expArray.length - 1];
			var appenHtml = tokens[tokens.length-1];
			for(var listI=0; listI<listData.length; listI++){
				var expHtml = appenHtml;
				if(listI == listData.length-1){
					expHtml = '';
				}
				tokens.push(listData[listI][listField]+expHtml);
			}
		}else{
			var expStr = data[exp] ? data[exp] : '';
			tokens.push(expStr);
		}
		lastIndex = index+match[0].length;
	}
	if (lastIndex < text.length) {
		tokenValue = text.slice(lastIndex)
		tokens.push(tokenValue);
	}
	for (var i = 0; i < tokens.length; i++) { html += tokens[i]; }
	return html;
}
/***********sjj 20190311 读取正则匹配段落值 end***********************************/
NetStarUtils.setBtnsDisabled = function (btnsArray, data) {
	if(!$.isArray(btnsArray)){
		btnsArray = [];
	}
	//查找按钮是否设置了禁用
	for (var indexI = 0; indexI < btnsArray.length; indexI++) {
		var fieldArray = btnsArray[indexI].btns;
		if ($.isArray(btnsArray[indexI].field)) {
			//此处是个坑，因为模板存储字段值存在未统一问题
			fieldArray = btnsArray[indexI].field;
		}
		var containerId = btnsArray[indexI].id;
		var $buttons = $('#' + containerId + ' button');
		if ($.isArray(fieldArray)) {
			var indexArray = [];
			for (var btnI = 0; btnI < fieldArray.length; btnI++) {
				var functionConfig = fieldArray[btnI].functionConfig ? fieldArray[btnI].functionConfig : {};
				if (functionConfig.disabledExpression) {
					//定义了是否禁用表达式
					var isDisabled = NetStarUtils.disabledExpression(data, functionConfig.disabledExpression);
					if (isDisabled) {
						indexArray.push(btnI);
					}
				}
			}
			$.each($buttons, function (key, value) {
				var isDisabled = false;
				if (indexArray.indexOf(key) > -1) {
					isDisabled = true;
				}
				var btnConfig = typeof(fieldArray[key]) == "object" ? fieldArray[key].btn : {};
				if(typeof(btnConfig.alwaysDisabled) == "boolean"){
				}else{
					$(value).attr('disabled', isDisabled);
				}
			});
		}
	}
}
/**
 * rowData 当前行值
 * tdField 当前单元格字段值
 * styleExpression 样式设置
 */
NetStarUtils.getStyleByCompareValue = function(compareObject){
	var styleObject = {};//最后返回的样式
	var rowData = compareObject.rowData;//当前行数据
	var tdField = compareObject.tdField;//当前单元格字段
	var styleExpression = compareObject.styleExpress;//样式表达式
	var currentValue = rowData[tdField];//获取当前单元格的值
	for(var fieldI in styleExpression){
		var compareValue = fieldI;//要比较的表达式
		var style = styleExpression[fieldI];//表达式对应的样式
		var isContinue = true;//默认继续进循环
		switch(typeof(compareValue)){
			case 'number':
				//当前表达式只是简单的数值 如 {0:{color:'red'}}
				if(Number(currentValue) === compareValue){
					isContinue = false;
				}
				break;
			case 'string':
				//判断当前表达式
				/**
				 * 1. 普通的字符串 如{'123':{color:'red'}}
				 * 2. 验证大于小于等于的 如{'>=0':{color:'red'}}  {'<0':{color:'blue'}}
				 * 3. 根据某个字段值的验证决定 如{'{num}>10':{color:'red'}}
				 * 4. 根据加减乘除的结果决定 如{'{num}*{price}>27':{color:'red'}}
				 */
				//调用方法返回值格式return
				/*[
					{value:"{abc}", type:"variable"},
					{value:">=", type:"symbol"},
					{value:0, type:"number"},
					{value:"0", type:"string"},
				]*/
				var englishReg = /^[A-Za-z]+$/;  //只能输入26个英文字符
				var numberReg = /^[0-9]+$/; //只能输入数字
				var isSimpleFormat = false;
				if(englishReg.test(compareValue)){
					//普通的字符串格式 
					isSimpleFormat = true;
				}else if(numberReg.test(compareValue)){
					//普通的字符串格式
					isSimpleFormat = true;
				}
				if(isSimpleFormat){
					if(currentValue == compareValue){
						isContinue = false;
					}
				}else{
					//排除普通的可能性 走复杂的方法判断
					var formatArr = NetStarUtils.regExp.getRegExpLogical(compareValue);
					if(formatArr.length > 0){
						var resultFormatStr = '';
						if(formatArr[0].type == 'variable'){
							var regMath = /([+*\/-])/g;         // 数学运算符
							if(regMath.test(formatArr[0].value)){
								//含有运算符
								formatArr = NetStarUtils.regExp.getRegExpMath(compareValue);
							}
						}
						function compareByFormatArr(_formatArr){
							for(var i=0;i<_formatArr.length; i++){
								var formatData = _formatArr[i];
								switch(formatData.type){
									case 'symbol':
										if(i===0){
											resultFormatStr += currentValue+formatData.value;
										}else{
											resultFormatStr += formatData.value;
										}
										break;
									case 'number':
										resultFormatStr += formatData.value;
										break;
									case 'variable':
										var includeSysmbolType = formatData.includeSysmbolType ? formatData.includeSysmbolType : '';
										if(includeSysmbolType == 'logic'){
											//含有逻辑操作符
											var regLogical = NetStarUtils.regExp.getRegExpLogical(formatData.value);
											compareByFormatArr(regLogical)
										}else{
											var match = /\{([^:]*?)\}/g.exec(formatData.value);
											if(match != null){
												resultFormatStr += rowData[match[1]];
											}
										}
										break;
								}
							}
						}
						compareByFormatArr(formatArr);
						isContinue = !eval(resultFormatStr);
					}
				}
				break;
		}
		if(isContinue == false){
			//找到了对应的表达式 直接跳出循环体
			styleObject = style;
			break;
		}
	}
	return styleObject;
}
NetStarUtils.regExp = {
	 /**
	 *根据逻辑操作符 拆分str各个部分的类型和值，返回拆分结果数组
		* @param {*} str:string 要拆分的字符串
		* @param {*} regStrArray :string||array 正则字符串或数组(不传为默认逻辑正则字符串或数组)
		* @return [
		*  {
		*     type:"" // : string   string/number/variable/symbol
		*     value:""// : string   分离出来的值
		*  }
		* ] 
		* 
		*/
	getRegExpLogical: function (textstr, regStrArray) {
		var _this = this;
		var args = arguments.length;   // 传递参数的个数
		var regLogical = /(<=|>=|==|>|<)/g;   // 逻辑运算符
		if (args == 0) {                 // 未传参数
			console.error("未读取可用参数");
			return false;
		} else if (args == 1) {           // 传一个参数
			return _this.regExpDeal(arguments[0], regLogical);
		} else if (args == 2) {              // 传两个参数
			var argSecondType = Object.prototype.toString.call(arguments[1]);
			var repexStr = arguments[1];
			var repexDealStr = "";
			if (argSecondType == "[object String]") {
				repexDealStr = "("+repexStr.replace(/,/g, "|") + ")";
			} else if (argSecondType == "[object Array]") {
				repexDealStr = "(" + repexStr.join('|') + ")";
			} else {
				console.error("所传参数格式不正确");
				return false;
			}

			regLogical = new RegExp(repexDealStr, "g");
			//console.log("逻辑运算符正则表达式:",regLogical);
			return _this.regExpDeal(arguments[0], regLogical);
		} else {
			//console.error("参数个数错误");
			return false;
		}
	},

	/**
	 *根据数学运算符 拆分str各个部分的类型和值，返回拆分结果数组
		*@param {*} str:string 要拆分的字符串
		*@param {*} regStrArray : string||array 正则字符串或数组(不传为默认正则数学运算符字符串或数组) 
		* @return [
		*  {
		*     type:"" // : string   string/number/variable/symbol
		*     value:""// : string   分离出来的值
		*  }
		* ]
		*/
	getRegExpMath: function (str, regStrArray) {
		var _this = this;
		var args = arguments.length;   // 传递参数的个数
		var regMath = /([+*\/-])/g;         // 数学运算符
		var transferCodeList = ["$", "(", ")", "*", "+", ".", "[", "]", "?", "\\", "/", "^", "{", "}"]; // 转义字符
		if (args == 0) {                 // 未传参数
			console.error("未读取可用参数");
			return false;
		} else if (args == 1) {           // 传一个参数
			return _this.regExpDeal(arguments[0], regMath);
		} else if (args == 2) {              // 传两个参数
			var argSecondType = Object.prototype.toString.call(arguments[1]);
			var repexStr = arguments[1];
			var repexDealStr = "";
			if (argSecondType == "[object String]") {
				repexDealStr = repexStr.replace(/,/g, "");
			} else if (argSecondType == "[object Array]") {
				repexDealStr = repexStr.join('');
			} else {
				console.error("所传参数格式不正确");
				return false;
			}
			for (var i = 0; i < transferCodeList.length; i++) {
				if (repexDealStr.indexOf(transferCodeList[i]) != -1) {
					repexDealStr1 = repexDealStr.replace(transferCodeList[i], '\\' + transferCodeList[i]);
				}
			}
			repexDealStr = "([" + repexDealStr1 + "])";
			regMath = new RegExp(repexDealStr, "g");
			//console.log("数学运算符正则表达式:",regMath);
			return _this.regExpDeal(arguments[0], regMath);
		} else {
			//console.error("参数个数错误");
			return false;
		}
	},

	/**
	 *处理该功能核心方法
		*
		* @param {*} str   // string:  要处理的字符串
		* @param {*} reg       // regExp:  正则表达式
		* @return [
		*  {
		*     type:"" // : string   string/number/variable/symbol
		*     value:""// : string   分离出来的值
		*  }
		* ] 
		*/
	regExpDeal: function (str, reg) {
		var reg1 = /\{(.+?)\}/g;// {}中内容
		var reg2 = /\"(.*?)\"/g;// ""中内容
		var outputList = [];
		if (reg.test(str)) {
			reg.lastIndex = 0;
			var arrList = str.split(reg);     // 根据正则表达式将字符串分割成数组
			for(var i = 0;i<arrList.length;i++){
				if(arrList[i]==''||arrList[i]==null||typeof(arrList[i])==undefined){
					arrList.splice(i,1);
					i=i-1;
				}
			}
			//console.log("分割数组为:",arrList);
			for (var i = 0; i < arrList.length; i++) {
				var obj = {};
				if (reg.test(arrList[i])) { // 匹配 + - * /
					obj.value = arrList[i];
					obj.type = "symbol";
					reg.lastIndex = 0;
				} else if (reg1.test(arrList[i])) { // 匹配变量{}
					obj.value = arrList[i];
					obj.type = "variable";
					reg1.lastIndex = 0;
				} else if (reg2.test(arrList[i])) { // 匹配字符串""
					obj.value = String(arrList[i]).replace(/\"/g, "");
					obj.type = "string";
					reg2.lastIndex = 0;
				} else {
					obj.value = parseFloat(arrList[i]);
					obj.type = "number";
				}
				outputList.push(obj);
			}
		} else if (reg1.test(str)) {
			var obj = {};
			obj.value = str;
			obj.type = "variable";
			outputList.push(obj);
			reg1.lastIndex = 0;
		} else {
			var obj = {};
			obj.value = str;
			obj.type = "string";
			outputList.push(obj);
		}
		for(var p = 0; p < outputList.length; p++){
			if(outputList[p].type == 'variable'){
				if((/(<=|>=|==|>|<)/g).test(outputList[p].value)){
					outputList[p].includeSysmbolType = "logic";
				}else if((/([+*\/-])/g).test(outputList[p].value)){
					outputList[p].includeSysmbolType = "Math";
				}
			}
		}
		return outputList;
	}
}
//设置按钮是否禁用的表格式判断
NetStarUtils.disabledExpression = function (data, disabledExpression) {
	//data 当前作为判断依据的数据值
	//disabledExpression 当前要作为是否禁用的表达式
	//可能存在的可能性 >=(大于等于) <=(小于等于) ==（双等于） !=（不等于） >（大于） <（小于）
	//举例disabledExpression {{state}}==2
	var field = disabledExpression.substring(0, disabledExpression.lastIndexOf('}') + 1);	//以最后一个}作为结束符查找field字段名称
	var value;//定义读取值
	var compareValue = NetStarUtils.getHtmlByRegular(data, field);//要比较的值
	var compareAction;//比较方式
	var isDisabled = false;// 默认不禁用
	if (disabledExpression.indexOf('=') > -1) {
		//含有=号
		value = disabledExpression.substring(disabledExpression.lastIndexOf('=') + 1, disabledExpression.length);//以最后一个等于号作为结束符查找value值
		if (disabledExpression.indexOf('>') > -1) {
			compareAction = 'moreEqual';
		} else if (disabledExpression.indexOf('<') > -1) {
			compareAction = 'lessEqual';
		} else {
			compareAction = 'equal';
		}
	} else if (disabledExpression.indexOf('>') > -1) {
		//大于
		compareAction = 'more';
		value = disabledExpression.substring(disabledExpression.lastIndexOf('>') + 1, disabledExpression.length);//以最后一个等于号作为结束符查找value值
	} else if (disabledExpression.indexOf('<') > -1) {
		//小于
		compareAction = 'less';
		value = disabledExpression.substring(disabledExpression.lastIndexOf('<') + 1, disabledExpression.length);//以最后一个等于号作为结束符查找value值
	}
	switch (compareAction) {
		case 'equal':
			//等于
			if (value === compareValue) {
				isDisabled = true;
			}
			break;
		case 'moreEqual':
			//大于等于
			if (value >= compareValue) {
				isDisabled = true;
			}
			break;
		case 'lessEqual':
			if (value <= compareValue) {
				isDisabled = true;
			}
			//小于等于
			break;
		case 'more':
			if (value > compareValue) {
				isDisabled = true;
			}
			//大于
			break;
		case 'less':
			//小于
			if (value < compareValue) {
				isDisabled = true;
			}
			break;
	}
	return isDisabled;
}

//sjj 20190423 根据按钮的requestSource设置按钮是否禁用
NetStarUtils.setBtnsDisabledByRequestSource = function(btnsArray,_isDisabled){
	if(!$.isArray(btnsArray)){btnsArray = [];}
	//查找按钮是否设置了禁用
	for (var indexI = 0; indexI < btnsArray.length; indexI++) {
		var fieldArray = btnsArray[indexI].btns;
		if ($.isArray(btnsArray[indexI].field)) {
			//此处是个坑，因为模板存储字段值存在未统一问题
			fieldArray = btnsArray[indexI].field;
		}
		var containerId = btnsArray[indexI].id;
		var $requestSourceBtn = $('#'+containerId+' button').not('[defaultmode="editorDialog"]');
		var $editorDialogBtn = $('#'+containerId+' button[defaultmode="editorDialog"]');
		// if(_isDisabled){
		// 	$editorDialogBtn.attr('disabled',true);
		// 	$requestSourceBtn.attr('disabled',true);
		// }else{
		// 	$editorDialogBtn.removeAttr('disabled');
		// 	$requestSourceBtn.removeAttr('disabled');
		// }
		
		function setDisabled($btns, type){
			for(var i=0; i<$btns.length; i++){
				var $btn = $btns.eq(0);
				var fid = Number($btn.attr('fid'));
				if(isNaN(fid)){
					if(type == "or"){
						if(_isDisabled){
							$btn.attr('disabled',true);
						}else{
							$btn.removeAttr('disabled');
						}
					}else{
						$btn.removeAttr('disabled');
					}
					continue;
				}
				var btnConfig = typeof(fieldArray[fid]) == "object" && typeof(fieldArray[fid].btn) == "object" ? fieldArray[fid].btn : {};
				if(typeof(btnConfig.alwaysDisabled) == "boolean"){
					// 默认情况只读不修改
				}else{
					if(type == "or"){
						if(_isDisabled){
							$btn.attr('disabled',true);
						}else{
							$btn.removeAttr('disabled');
						}
					}else{
						$btn.removeAttr('disabled');
					}
				}
			}
		}
		setDisabled($editorDialogBtn, 'or');
		setDisabled($requestSourceBtn, 'or');
		//sjj 20190618 如果按钮配置了不发送参数则按钮可以不禁用isSendpageparams="false" 
		var $isNotSendParamsByBtns = $('#'+containerId+' button[requestsource="none"]');
		if($isNotSendParamsByBtns.length > 0){
			// $isNotSendParamsByBtns.removeAttr('disabled');
			setDisabled($isNotSendParamsByBtns);
		}
		$.each($editorDialogBtn,function(key,value){
			var $this = $(this);
			if($this.attr('title') == '新增'){
				// $this.removeAttr('disabled');
				setDisabled($this);
			}
		});
	}
}
//lxh 190326 根据数学表达式返回结果  例"(1*1.2)+((3*0.5)+1.5)-2/2"
NetStarUtils.getResultByExpression = function (expression) {

	//计算封装，将浮点数转为十进制计算
	var computeController = {
		add: function (arg) {
			var r1, r2, m;
			try {
				//获得小数位数
				r1 = this.toString().split(".")[1].length;
			} catch (e) {
				r1 = 0;
			}
			try {
				//获得小数位数
				r2 = arg.toString().split(".")[1].length;
			} catch (e) {
				r2 = 0;
			}
			m = Math.pow(10, Math.max(r1, r2));
			return (this * m + arg * m) / m;
		},
		sub: function (arg) {
			return this.add(-arg);
		},
		mul: function (arg) {
			var m = 0, s1 = this.toString(), s2 = arg.toString();
			try {
				//获得小数位数
				m += s1.split(".")[1].length;
			} catch (e) { }
			try {
				//获得小数位数
				m += s2.split(".")[1].length;
			} catch (e) { }
			//转为十进制计算后，要除以两个数的共同小数位数
			return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
		},
		div: function (arg) {
			var t1 = 0, t2 = 0, r1, r2;
			try {
				//获得小数位数
				t1 = this.toString().split(".")[1].length;
			} catch (e) { }
			try {
				//获得小数位数
				t2 = arg.toString().split(".")[1].length;
			} catch (e) { }
			r1 = Number(this.toString().replace(".", ""));
			r2 = Number(arg.toString().replace(".", ""));
			//转为十进制计算后，要乘以除数与被除数小数位数的差
			return (r1 / r2) * Math.pow(10, t2 - t1);
		},
		mod: function (arg) {
			var t1 = 0, t2 = 0, r1, r2;
			try {
				t1 = this.toString().split('.')[1].length;
			} catch (e) { }
			try {
				t2 = arg.toString().split('.')[1].length;
			} catch (e) { }
			//小数位数
			var digit = Math.pow(10, Math.abs(t1 - t2));
			if (digit == 1) { digit = Math.pow(10, t1); }
			//计算余数
			r1 = (this * digit).toString().split('.')[0];
			r2 = arg * digit;
			//小数点后数字，直接拼接上即可
			var decimals = (this * digit).toString().split('.')[1] ? (this * digit).toString().split('.')[1] : "";
			return (r1 % r2 + decimals) / digit;
		}
	};

	//运算符优先级
	var priority = {
		'+': 1,
		'-': 1,
		'*': 9,
		'/': 9,
		'%': 9
	};

	//计算方法
	var cal = {
		'+': function (a, b) {
			return computeController.add.call(a, b);
		},
		'-': function (a, b) {
			return computeController.add.call(a, -b);
		},
		'*': function (a, b) {
			return computeController.mul.call(a, b);
		},
		'/': function (a, b) {
			return computeController.div.call(a, b);
		},
		'%': function (a, b) {
			return computeController.mod.call(a, b);
		}
	};
	///[0-9]\d{0,}(\.\d+)?
	var numRegExp = new RegExp(/\d{1,}(\.\d+)?/);
	var operatorRegExp = new RegExp(/[\+\-\*\/\%\(\)]/);
	var matchRegExp = new RegExp(/\d{1,}(\.\d+)?|[\+\-\*\/\%\(\)]/, 'g');

	//例"(1*1.2)+((3*0.5)+1.5)-2/2"
	function getQueue(expression) {
		var exp = expression.replace(/\s/g, "").match(matchRegExp);
		var stack = [], queue = [];
		stack.fetch = function () {
			//取出栈顶但不删除
			return this[this.length - 1];
		};
		for (var index = 0; index < exp.length; index++) {
			var currentExp = exp[index];
			if (numRegExp.test(currentExp)) {
				//如果是数字，则入result
				queue.push(currentExp);
			} else if (stack.length === 0 || currentExp == '(') {
				//如果栈为空，则直接入栈 如果是左括号，则直接入栈
				stack.push(currentExp);
			} else if (currentExp == ')') {
				//如果是右括号，则需要把当前括号中的表达式入队列
				while (stack.fetch() != '(') {
					queue.push(stack.pop());
					if (stack.length === 0) {
						console.error("表达式缺少左括号");
						return [];
					}
				}
				stack.pop();
			} else if (operatorRegExp.test(currentExp)) {
				//遇到其他运算符：加减乘除：弹出所有优先级大于或者等于该运算符的栈顶元素入队列，然后将该运算符入栈
				while (priority[currentExp] <= priority[stack.fetch()]) {
					queue.push(stack.pop());
				}
				stack.push(currentExp);
			}
		}
		//如果栈中还有值，则全部入队列
		while (stack.length > 0) {
			if (stack.fetch() == '(') {
				console.error("表达式缺少右括号");
				return [];
			}
			queue.push(stack.pop());
		}

		return queue;
	}

	//计算
	function calQueue(queue) {
		if (queue.length === 0) return;
		var stack = [];
		for (var index = 0; index < queue.length; index++) {
			var item = queue[index];
			if (numRegExp.test(item)) {
				//如果是数字则入栈
				stack.push(item);
			} else {
				//如果是运算符，则出栈前两位，运算并将结果入栈
				var a = stack.pop();
				var b = stack.pop();
				stack.push(cal[item](b, a));
			}
		}

		if (stack.length == 1) {
			return stack.pop();
		}

		return null;
	}

	return calQueue(getQueue(expression));
};
//lxh 190327 根据文本格式化表达式获取结果  例：姓名：{{name}}
NetStarUtils.getResultByFormat = function (valueObj, formatStr) {
	var formatStrExp = new RegExp(/\{{2}(\w+)\}{2}/g);
	var formatStrArr = formatStr.match(formatStrExp);
	for (var index = 0; index < formatStrArr.length; index++) {
		var item = formatStrArr[index];
		formatStr = formatStr.replace(item, valueObj[item.replace('{{', '').replace('}}', '')]);
	}
	return formatStr;
}
/******lyw 获取格式化参数***********/
NetStarUtils.getFormatParameterJSON = function (variableJson, variableData, isShowError) {
	/***入参：
	 *	variableJson:object  			包含变量的输出格式 例如:{"id":"{cid}""};
	 * 	variableData:object  			当前数据，用于读取变量值
	 * 
	 ***出参
	 * return JSON/Object  如果返回参数为false 则说明取值不成功
	 ***/

	var json = variableJson;
	var data = variableData;
	isShowError = typeof(isShowError) == "boolean" ? isShowError : true;
	// 添加systemInfo相关参数
	if(typeof(data) == "object"){
		data.systemInfo = NetstarMainPage && typeof(NetstarMainPage.systemInfo) == "object" ? NetstarMainPage.systemInfo : {};
	}
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

	var resultJson = $.extend(true, {}, json);
	var markRegexp = /\{(.*?)\}/;
	var keyFieldArray = [];
	var keyFieldDepth = 0;
	var error = null;
	function getValue(_vals, _valArr, _index){
		var resVal = '';
		if($.isArray(_vals)){
			resVal = [];
			for(var i=0; i<_vals.length; i++){
				resVal[i] = _vals[i][_valArr[_index]];
				if(_index < _valArr.length-1){
					if(typeof(resVal[i]) == "object"){
						resVal = getValue(resVal[i], _valArr, _index+1);
					}else{
						resVal = error;
					}
				}
			}
		}else{
			resVal = _vals[_valArr[_index]];
			if(_index < _valArr.length-1){
				if(typeof(resVal) == "object"){
					resVal = getValue(resVal, _valArr, _index+1);
				}else{
					resVal = error;
				}
			}
		}
		return resVal;
	}
	function replaceVariable(_json, _keyField, _keyFieldDepth) {
		$.each(_json, function (key, value) {
			if (typeof (value) == 'string') {
				//如果是字符串则有可能是要替换的字符，其他类型不用处理
				if (markRegexp.test(value)) {

					//获取变量名
					var variableName = value.match(markRegexp)[1];
					var variableNameArray = variableName.split('.');
					var variableValue = getValue(data, variableNameArray, 0);
					if(variableValue == error || typeof (variableValue) == 'undefined'){
						variableValue = error;
						if(isShowError){
							console.error('变量 {' + variableName + '} 不存在');
						}
					}
					if($.isArray(variableValue)){
						// 数组中存在对象则表示返回数组
						var isObj = false;
						for(var i=0; i<variableValue.length; i++){
							if(typeof(variableValue[i]) == 'object'){
								isObj = true;
							}
						}
						// 判断是否存在undefined 或 null 如果存在一律改为 'null'
						for(var i=0; i<variableValue.length; i++){
							if(variableValue[i] == error || typeof (variableValue[i]) == 'undefined'){
								if(isObj){
									variableValue[i] = null;
								}else{
									variableValue[i] = 'null';
								}
							}
						}
						if(!isObj){
							variableValue = variableValue.toString();
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
	return resultJson
}
/******lyw base64*********/
NetStarUtils.Base64 = (function ($) {
	// private property
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	// public method for encoding
	var encode = function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = _utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
				_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
				_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
		}
		return output;
	}

	// public method for decoding
	var decode = function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = _utf8_decode(output);
		return output;
	}

	// private method for UTF-8 encoding
	var _utf8_encode = function (string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}
		return utftext;
	}

	// private method for UTF-8 decoding
	var _utf8_decode = function (utftext) {
		var string = "";
		var i = 0;
		var c = 0;
		var c1 = 0;
		var c2 = 0;
		while (i < utftext.length) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
	return {
		encode: encode,
		decode: decode,
	}
})(jQuery);
/******lyw cookie*********/
NetStarUtils.cookie = (function ($) {
	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch (e) { }
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path ? '; path=' + options.path : '',
				options.domain ? '; domain=' + options.domain : '',
				options.secure ? '; secure' : ''
			].join(''));
		}
		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};
	var config = cookie;

	config.defaults = {};

	var removeCookie = function (key, options) {
		if (cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !cookie(key);
	};
	return {
		get: cookie,
		set: cookie,
		remove: removeCookie,
	}
})(jQuery)
/******lyw ajax获取jsp页面text*********/
NetStarUtils.ajaxForText = function (config, callbackFunction, isNeedError) {
	/*** 
	 * 		该方法只适用于调取页面返回text格式
	 * config:object ajax
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
		type: 'GET',
		dataType: 'text',
		cache: false,
		plusData: '',
		contentType: 'application/x-www-form-urlencoded',
	};
	//以baseAjax为默认值，使用新值就行赋值
	for (var option in config) {
		baseAjax[option] = config[option];
	};
	//ajax header处理 把ajax中的header数据转化为ajax文件头 cy 20180711
	var ajaxConfig = $.extend(true, {}, baseAjax);

	//sjj 20190109 针对定义的contentType json格式数据的转化
	if (baseAjax.contentType == 'application/json; charset=utf-8' || baseAjax.contentType == 'application/json') {
		if (typeof (baseAjax.data) != 'object') {
			baseAjax.data = {};
		}
		ajaxConfig.data = JSON.stringify(baseAjax.data);
		ajaxConfig.type = "POST";
	}

    //sjj 20190408 针对读取到的src转换为url
	//处理地址
	if (ajaxConfig.src) {
		ajaxConfig.url = ajaxConfig.src;
		delete ajaxConfig.src;
	}
	//读取 Authorization 并添加到headers 如果已经过期了则报错退出
	var authorization = NetStarUtils.OAuthCode.get();
	if(authorization == false && typeof(NetstarHomePage) == 'object'){
		NetStarUtils.OAuthCode.reLogin();
		return false;
	}
	if(authorization){
		if(typeof(ajaxConfig.header) != 'object'){
			ajaxConfig.header = {};
		}
		ajaxConfig.header.Authorization = authorization;
	}
	if (ajaxConfig.header) {
		ajaxConfig.beforeSend = function (request) {
			$.each(ajaxConfig.header, function (key, value) {
				//ajaxConfig.header:object  {{data_auth_code: "1%2TESTCODE==/&;&"}, key:'value'}
				request.setRequestHeader(key, value);
			})
		}
	}
	if(ajaxConfig.url.indexOf('http') == -1){
		ajaxConfig.url = getRootPath() + ajaxConfig.url;
	}
	//成功回调
	ajaxConfig.success = function (data, ajaxData) {
		callbackFunction(data, this);
	};
	//失败回调
	ajaxConfig.error = function (error) {
		//error的回调需要生成回调对象
		if (isNeedError) {
			callbackFunction({ success: false, error: error }, this);
		}
		//显示错误信息
		NetStarUtils.defaultAjaxError(error);
	}
	$(document).ready(function () {
		$.ajax(ajaxConfig);
	})
}
/**lxh 190329 给dom设置属性，例 activityId="123" 设置为 ns-activiey-id="123" */
NetStarUtils.setDomAttrsCaseSensitive = function (jqDom, valueObj, _onlyThisAttrs) {
	var prefix = 'ns';	//前缀
	var keys = Object.keys(valueObj);	//要设置的所有的属性名称
	for (var index = 0; index < keys.length; index++) {
		var item = keys[index];
		if (typeof _onlyThisAttrs != 'undefined' && $.inArray(item, _onlyThisAttrs) != -1) {
			jqDom.attr(prefix + '-' + getLowerCase(item), valueObj[item]);
		} else {
			jqDom.attr(prefix + '-' + getLowerCase(item), valueObj[item]);
		}
	}

	function getLowerCase(str) {
		return str.replace(/[A-Z]/g, function (match, index) {
			return "-" + match.toLowerCase();
		})
	}
}
/**lxh 190329 拿到dom设置的属性，例设置属性为 ns-activiey-id="123" 拿到 activityId="123" */
NetStarUtils.getDomAttrsCaseSensitive = function (jqDom, _exceptAttrs) {
	var prefix = 'ns';	//前缀
	var noSaveArr = ['id', 'class'].concat(_exceptAttrs);	//不保存的属性
	var attrObj = {};	//返回的所有属性的对象
	var jqDomAttributes = jqDom.get(0).attributes;	//传进来的jq对象的所有属性
	for (var key in jqDomAttributes) {
		if (jqDomAttributes.hasOwnProperty(key)) {
			var element = jqDomAttributes[key];
			var name = element.name;	//属性名称
			var value = element.value;	//属性内容
			if ($.inArray(name, noSaveArr) == -1) {
				attrObj[getUpperCase(name)] = value;
			}
		}
	}

	function getUpperCase(str) {
		//替换str中的 -a 为 a
		return str.replace(/-[a-z]{1}/g, function (match, index) {
			var i = 0;
			if (index != str.indexOf('-')) {
				return str[index + 1].toUpperCase();
			} else {
				return match
			}
		}).replace(prefix + '-', '')
	}

	return attrObj;
}
//sjj 20190524
NetStarUtils.getVariableJSON = function(data,_paramsData){
	var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
	var ajaxData = {};
	var isUseObject = true;
	for(var key in data){
		if(ajaxParameterRegExp.test(data[key])){
			isUseObject = false;
			break;
		}else{
			ajaxData[key] = data[key];
		}
	}
	if(isUseObject){
		ajaxData
		nsVals.extendJSON(ajaxData,_paramsData);
	}else{
		ajaxData = nsVals.getVariableJSON(data,_paramsData);
	}
	return ajaxData;
}
//sjj 20190530 获取{{list.name}}
NetStarUtils.getListDataByExp = function(data,_exp){
	var expArr = _exp.split('.');
	var listData = $.extend(true,{},data);
	for(var i = 0; i < expArr.length-1; i++){
		if(!listData[expArr[i]]){
			listData[expArr[i]] = {};
		}
		listData = listData[expArr[i]];
	}
	return listData;
}


//根据表达是对值进行验证,获取验证结果 cy 20190613
NetStarUtils.getValidResultByExpression = function(validData, validConfig){
    /***
     *  return:boolean false    返回值是true(验证通过)/false(验证失败)
     *  validData:object        数据对象例如{vo1:{name:"老张", age:3},list:[{goodName:"货品名称1", price:3.2},{goodName:"货品名称2", price:2}]}
     *  validConfig:object      验证方式：msg:提示信息，rules:判断标准  例如：{msg:'a+b大于C是不合法的', rules:'{vo1.a}+{vo1.b}>{vo2.c}'}
     */
    var isValid = true;
    
    //如果需要对validData进行验证，而validData本身就不存在，则直接返回验证失败
    if(typeof(validData)!='object'){
        return false;
    }

    //对rules和msg进行合法性验证
    var rules = validConfig.rules;
    var msg = validConfig.msg;
    if(typeof(rules) != 'string'){
        console.error('验证参数配置错误 rules 没有填写');
        return false;
    }
    if(typeof(msg) != 'string'){
        console.error('验证参数配置错误 msg 没有填写');
        return false;
    }

    //对 SUM{list.number} 进行处理 list 必须是数组 把SUM{vo.name} => 25
    var sumPatt = new RegExp("SUM\{(.*?)\}","g");
    var isHaveSum = false;
    var sumExpressionStr = rules;

    var result;
    while ((result = sumPatt.exec(rules)) != null){
        isHaveSum = true;
        var vofieldExpStr = result[1];  //vo.name
        var voFieldExpArr = vofieldExpStr.split('.');
        var voFieldValue = $.extend(true, {}, validData);
        //这个只读取到倒数第二层，而不是最后一层，且该数据应该是数组
        for(var vfI = 0; vfI<voFieldExpArr.length - 1; vfI++ ){
            console.log(voFieldValue[voFieldExpArr[vfI]]);
            if( $.isArray( voFieldValue[voFieldExpArr[vfI]] ) ){
                //逐层从validData中读取值
                voFieldValue = voFieldValue[voFieldExpArr[vfI]];
            }else{
                //根据验证规则表达式 rules 获取值失败 直接退出
                console.error('表达式错误：' + rules);
                isGetValue = false;
                return false;
            }
        }
        if(voFieldValue.length <= 0){
            console.error('表达式获取值错误：' + rules);
            return false;
        }
        //voFieldValue 目前的类型是array 循环读取字段 把SUM{vo.name} => 25
        var sumNumber = 0;
        for(var sumI = 0; sumI<voFieldValue.length; sumI++){
            var thisSum = voFieldValue[sumI][voFieldExpArr[voFieldExpArr.length-1]];
            if(typeof(thisSum) == 'number'){
                sumNumber += thisSum;
            }
        }
        sumExpressionStr = sumExpressionStr.replace(result[0], sumNumber);
    }
    rules = sumExpressionStr;

    //对{vo.name}类型字段进行处理
    var rulesPatt = new RegExp("\{(.*?)\}","g");
    var isGetValue = true;
    var expressionStr = rules;
    
    var result;
    while ((result = rulesPatt.exec(rules)) != null){
        //如果获取值失败了则直接退出
        if(isGetValue == false){
            return false;
        }
        var vofieldExpStr = result[1];  //vo.name
        var voFieldExpArr = vofieldExpStr.split('.');
        var voFieldValue = validData;
        for(var vfI = 0; vfI<voFieldExpArr.length; vfI++ ){
            if(typeof(voFieldValue[voFieldExpArr[vfI]]) != 'undefined'){
                //逐层从validData中读取值
                voFieldValue = voFieldValue[voFieldExpArr[vfI]];
            }else{
				//根据验证规则表达式 rules 获取值失败 直接退出
				//sjj 20190614 如果是空值默认为0
				voFieldValue = 0;
               // console.error('表达式错误：' + rules);
               // isGetValue = false;
                //return false;
            }
        }

        expressionStr = expressionStr.replace(result[0], voFieldValue);
    }
    

    var evalResult = true;
    //临时使用eval作为计算工具
    try{
        evalResult = eval(expressionStr)
    }catch(err){
        console.log(err);
    }

    if(typeof(evalResult)=='boolean'){
        isValid = evalResult;
    }else{
        console.error('rules表达式：' + rules + '错误，计算结果：' + expressionStr + '无法获取值');
        return false;
    }
    return isValid;
}
//判断是否要对获取的页面值进行表达式验证 cy 20190613
NetStarUtils.getPageValidResult = function(validData, validConfig){
	var isValid = true; 
    if(typeof(validConfig) == 'string'){
        validConfig = JSON.parse(validConfig);
    }else if(typeof(validConfig)=='undefined'){
		isValid = true;
		validConfig = {};
	}
    //validConfig.pageData有参数则代表对validData要进行按照规则的验证
    if(typeof(validConfig.pageData) == 'object'){
        isValid = NetStarUtils.getValidResultByExpression(validData, validConfig.pageData);
        if(isValid == false){
        	nsalert( validConfig.pageData.msg , 'error');
        	return false;
        }
    }
    return isValid; 
}
//sjj 20910624 把树格式的数据拉平展示
NetStarUtils.getDataByFormatTreeData = function(rows,level){
	var treeRows = [];
	var expandLevel = Number(level) ? level : 0;
	function formatTreeData(array,levelIndex,isHasParent){
		if(!$.isArray(array)){return;}
		var isOpen = true;//是否显示
		var isExpand = true;//当前是父节点是否展开状态
		/*if(expandLevel>0){
			if(levelIndex < expandLevel){
				isOpen = true;
				isExpand = true;
			}
		}else{
			isOpen = true;
			isExpand = true;
		}*/
		for(var rowI=0; rowI<array.length; rowI++){
			array[rowI].netstarLevel = levelIndex;
			array[rowI].netstarOpen = isOpen;
			array[rowI].netstarExpand = isExpand;
			var isChildren = true;
			if(!$.isArray(array[rowI].children)){
				isChildren = false;
			}else{
				if(array[rowI].children.length == 0){
					isChildren = false;
				}
			}
			if(levelIndex > 0){
				if(isHasParent){
					//if(isChildren){
						
					//}
					if(levelIndex == 1 && !isChildren){

					}else{
						var marginLeft = 0;
						if(levelIndex == 1){
							marginLeft = 7.5;
						}else{
							if(isChildren){
								marginLeft = levelIndex*7.5;
							}else{
								marginLeft = (levelIndex-1)*7.5;
							}
						}
						array[rowI].netstarStyleObj = {
							//'margin-left':(levelIndex*15)+'px'
							'margin-left':marginLeft+'px'
						};
					}
				}
				//if($.isArray(array[rowI].children)){
					///if(array[rowI].children.length > 0){
						//array[rowI].netstarStyleObj = {
							//'margin-left':(levelIndex*15)+'px'
							//'margin-left':(levelIndex*7.5)+'px'
						//};
					//}
				//}
			}else{
				if(!isChildren){
					/*array[rowI].netstarStyleObj = {
						'margin-left':'-10px'
					};*/
				}else{
					array[rowI].netstarOpen = isOpen;
					//array[rowI].netstarExpand = false;
				}
			}
			treeRows.push(array[rowI]);
			var nIndex = array[rowI].netstarLevel + 1;
			if(isChildren){
				//if(array[rowI].children.length > 0){
					array[rowI].isParent = true;
					formatTreeData(array[rowI].children,nIndex,true);
				//}
			}else{
				array[rowI].isParent = false;
			}
		}
	}
	formatTreeData(rows,0,false);
	return treeRows;
}
//sjj 20191106 treeGrid 根据当前节点查找下一个父节点所在数据的下标
NetStarUtils.getParentIndexBySelectedIndex = function(rows,currentIndex,position){
	/**
	 * rows 所有列表数据
	 * currentIndex 当前行下标
	 * postion 向上找还是向下找
	 */
	var targetSelectedIndex = -1;
	if(position == 'after'){
		if(rows[currentIndex+1].isParent){
			targetSelectedIndex = currentIndex+1;
		}else{
			for(var i=(currentIndex+1); i<rows.length; i++){
				if(rows[i].parentId === rows[currentIndex].parentId){
					targetSelectedIndex = i;
					break;
				}
			}
		}
	}else if(position == 'before' && currentIndex > 0){
		if(rows[currentIndex-1].isParent){
			targetSelectedIndex = currentIndex-1;
		}else{
			for(var i=0; i<currentIndex; i++){
				if(rows[i].parentId == rows[currentIndex].parentId){
					targetSelectedIndex = i;
					break;
				}
			}
		}
	}
	return targetSelectedIndex;
}
//sjj 20190705
NetStarUtils.getDataByExpression = function(validData,validExpression){
	var rulesPatt = new RegExp("\{(.*?)\}","g");
	var expressionStr = validExpression;
	var result;
	while ((result = rulesPatt.exec(validExpression)) != null){
        var vofieldExpStr = result[1];  //vo.name
        var voFieldExpArr = vofieldExpStr.split('.');
        var voFieldValue = validData;
        for(var vfI = 0; vfI<voFieldExpArr.length; vfI++ ){
            if(typeof(voFieldValue[voFieldExpArr[vfI]]) != 'undefined'){
                //逐层从validData中读取值
                voFieldValue = voFieldValue[voFieldExpArr[vfI]];
            }else{
				//根据验证规则表达式 rules 获取值失败 直接退出
				//sjj 20190614 如果是空值默认为0
				voFieldValue = 0;
               // console.error('表达式错误：' + rules);
               // isGetValue = false;
                //return false;
            }
		}
		if(isNaN(voFieldValue)){voFieldValue = 0;}
		if(typeof(voFieldValue)!='number'){
			voFieldValue = 0;
		}
		expressionStr = expressionStr.replace(result[0], voFieldValue);
	}
	return eval(expressionStr);
}
NetStarUtils.loading = function(text){
	var $currentContainer = $('container:not(".hidden")');
	$currentContainer.append('<div class="pt-page-loading"><span class="loding-text">'+text+'</span></div>');
}
NetStarUtils.removeLoading = function(){
	$('.pt-page-loading').remove();
}
//sjj 20190723 解析html中需要转换的值 包含字典 从系统默认参数中读取转换参数
NetStarUtils.getResultHtmlByExpressionHtml = function(html,data,columnById){
	/**
	 * html  string 表达式的html
	 * data object 要转换的obect数据来源
	 * 如果dom元素上含有ns-dict 表示当前显示值是字典 需要根据当前值从字典值中查找
	 * 如果dom元素上含有ns-system 表示当前显示值是系统 需要根据当前系统登录进来存放的值中读取
	 */
	var $html = $(html);
	var resultHtml = html;
	function replaceHtmlByDomHtml(dom){
		var rex1 = /\{\{(.*?)\}\}/g;
		var rex2 = /\{\{(.*?)\}\}/;
		var html = dom.outerHTML;
		var strArr = html.match(rex1);
		if(!$.isEmptyObject(strArr)){
			var fieldName = strArr[0].match(rex2)[1];
			var valueData = data[fieldName];
			if(dom.getAttribute('ns-dict')){
				//存在自定义的字典属性
				var dictName = dom.getAttribute('ns-dict');
				valueData = nsVals.dictData[dictName].jsondata[valueData];
			}
			var isReplaceData = true;
			switch(typeof(valueData)){
				case 'object':
					if($.isEmptyObject(valueData)){
						isReplaceData = false;
					}
					break;
				case 'undefined':
					isReplaceData = false;
					break;
				case 'string':
					if(valueData == ''){
						isReplaceData = false;
					}
					break;
			}
			if(isReplaceData == false){
				resultHtml = resultHtml.replace(html,'');
			}else{
				if(columnById[fieldName]){
					valueData = NetstarBlockListM.dataManager.getValueByColumnType(valueData,data,columnById[fieldName]);
				}
				resultHtml = resultHtml.replace(strArr[0],valueData);
			}
		}
	}
	//递归方法查找dom元素
	function runDom($element){
		for(var domI=0; domI<$element.length; domI++){
			var currentDom = $element[domI];
			if(currentDom.children.length > 0){
				//还有子元素
				for(var childI=0; childI<currentDom.childNodes.length; childI++){
					var childDom = currentDom.childNodes[childI];
					if(childDom.nodeType == 3){
						//#text
					}else{
						if(childDom.children.length > 0){
							runDom($(childDom));
						}
						replaceHtmlByDomHtml(childDom);
					}
				}
			}else{
				replaceHtmlByDomHtml(currentDom);
			}
		}
	}
	runDom($html);
	return resultHtml;
}
NetStarUtils.getFilterByExpressionHtml = function(html){
	var $html = $(html);
	function replaceHtmlByDomHtml(dom){
		var rex1 = /\{\{(.*?)\}\}/g;
		var rex2 = /\{\{(.*?)\}\}/;
		var domHtml = dom.outerHTML;
		var strArr = domHtml.match(rex1);
		var fieldName = strArr[0].match(rex2)[1];
		if(dom.getAttribute('ns-dict')){
			//存在自定义的字典属性
			var dictName = dom.getAttribute('ns-dict');
			var valueData = '{{'+fieldName+' | dictData("'+dictName+'")}}';
			html = html.replace(strArr[0],valueData);
		}
	}
	//递归方法查找dom元素
	function runDom($element){
		for(var domI=0; domI<$element.length; domI++){
			var currentDom = $element[domI];
			if(currentDom.children.length > 0){
				//还有子元素
				for(var childI=0; childI<currentDom.childNodes.length; childI++){
					var childDom = currentDom.childNodes[childI];
					if(childDom.nodeType == 3){
						//#text
					}else{
						if(childDom.children.length > 0){
							runDom($(childDom));
						}
						replaceHtmlByDomHtml(childDom);
					}
				}
			}else{
				replaceHtmlByDomHtml(currentDom);
			}
		}
	}
	runDom($html);
	return html;
}


/**
 * 根据标签名从HTML或者文本中返回标签所包含的内容
 *
 * @param {string} tagName 标签名 例如<contianer> 
 * @param {*} resHtml
 * @returns
 */
NetStarUtils.getTagHtmlByRes = function(tagName, resHtml){

	/** 根据标签名从HTML或者文本中返回标签所包含的内容
	 * params:
	 * 	tagName:String  例如<contianer> 
	 * 	resHtml:String  ajax请求回来的HTML或者文本等
	 * return:
	 * 	string   标签中的内容
	 */
	var html = '';
	var startIndex = 0;
	var endIndex = resHtml.length;
	var startTag = '<'+tagName+'>';
	var endTag = '</'+tagName+'>';
	
	//使用indexOf而不适用正则表达式，主要是因为测试时使用indexOf比正则速度快
	var _start = resHtml.indexOf(startTag);
	var _end = resHtml.lastIndexOf(endTag);
	
	if(_start > -1){
		startIndex = _start;
	}
	if(_end > -1){
		endIndex = _end;
	}

	//没有找到标签就把全部内容返回，仅警示不处理
	if(_start == -1 && _end == -1){
		if(debuggerMode){
			console.warn('没有找到 <'+tagName+'>标签');
		}
	}else{
		html = resHtml.substring( startIndex+startTag.length, endIndex);
	}
	return html;
}
/**
 *读取静态资源文件 只能用来获取静态资源不能用来读取服务器端AJAX请求 cy 20190629
 *
 * @param {string} url
 * @param {function} callbackFunc 		完成后回调
 * @param {boolean} isClearComments  	是否清除掉注释 默认不删除
 */
NetStarUtils.getHtmlByUrl = function(url, callbackFunc, isClearComments){
	//默认不清除备注
	var _isClearComments = false;
	if(typeof(isClearComments) =='boolean'){
		_isClearComments = isClearComments;
	}
	$.ajax({
		url:url,
		type:'GET',
		success:function(resHtml){
			//清除html中的备注 <!--  --> 内容
			if(_isClearComments){
				var patt = new RegExp('\<\!\-\-(.*?)\-\-\>', 'g'); //去掉注释的内容
				resHtml = resHtml.replace(patt, '');
			}
			callbackFunc(resHtml);
		},
		error:function(error){
			//目前该方法只加载静态资源 所以错误信息不回调只报错
			NetStarUtils.defaultAjaxError(error);
		}
	})
}
//授权码管理器，目前前是简单处理为cookies保存，之后修改 cy 20190629
NetStarUtils.OAuthCode = {
	/**
	 * 用于控制登录范围和过期时间
	 * @returns 
	 * {
	 * 	expires: new Date(),
	 * 	path: 'http://localhost/erp'
	 * }
	 */
	getExpires:function(expireTime){
		var obj = {};
		var expiresDate = new Date();
		expiresDate.setTime(expiresDate.getTime() + expireTime);  
		obj.expires = expiresDate.getTime();

		var href = window.location.href;
		var path = href.substring(0, href.lastIndexOf('/'));
		obj.path = path;
		return obj
	},

	//保存授权码
	/* {
	 *	authorization:'',  				//string, 	token 
	 *	expireMinute:120,  				//number, 	超时时长，单位为分钟
	 *	loginTimeStamp:1567047626704, 	//number, 	仅在登录时候有值
	 * }
	 */
	set:function(authorObj){
		var _this = this;
		var code = authorObj.authorization;
		var expireTime = authorObj.expireMinute * 60 * 1000; //由分钟转化为毫秒
		var expires = this.getExpires(expireTime);  //过期时间和路径
		
		var currentDate = 		new Date();
		var currentTS = 		currentDate.getTime();
		var currentDateString = currentDate.toString();

		var oAuthInfo = 
		{
			code: 			code,
			lastOperate:	currentTS, 				//时间戳 最后一次操作时间
			expires: 		expires.expires, 		//时间戳 过期时间
			path:			expires.path, 			//path
			
			dateTimeLastOperate: 	currentDateString,
			dateTimeExpires: 		new Date(expires.expires).toString(),
		}

		//如果有登录时间戳，则保存
		if(authorObj.loginTimeStamp){
			var loginInfo = 
			{
				timeStamp:		authorObj.loginTimeStamp,
				date:			new Date(authorObj.loginTimeStamp).toString(),
				expireMinute: 	authorObj.expireMinute
			}
			store.set('NetstarLoginExpiresInfo', loginInfo);
			_this.saveTokenLog('login');
		}
		store.set('Authorization', oAuthInfo);
		$.cookie('Authorization', oAuthInfo.code);  //为兼容老页面中的token cy 20190928
	},
	isWaitingRefreshToken:false, 	//是否在等待刷新token，为了防止多次刷新，所以
	
	//定时刷新token
	refreshToken:function(){
		var _this = this;
		var url  = NetStarUtils.getUrl('system/refreshToken');
		_this.saveTokenLog('ready-to-refresh');
		$.ajax({
			cache: false,
			type: "POST",
			url: url,
			headers:{
				Authorization:NetStarUtils.OAuthCode.get(),
			},
			plusData:{this:_this},
			data: {},
			success: function(data, textStatus, request){
				var  token = request.getResponseHeader('Authorization');
				if(typeof(token)!='string'){
					var errorInfo = '刷新token失败，服务器返回数据中 header 不包含 Authorization';
					//nsalert(errorInfo, 'error'); //临时去掉提示 20191225
					console.error(errorInfo,request.getAllResponseHeaders());
					return;
				}
				var _this = this.plusData.this;
				var expiresInfo = _this.getExpiresInfo();
				var tokenInfo = {
					authorization: token,
					expireMinute: expiresInfo.expireMinute,
				}
				_this.set(tokenInfo);
				_this.saveTokenLog('success-to-refresh');
				// 登录即时器
				if(NetStarUtils.OAuthCode.loginTimer){
					clearTimeout(NetStarUtils.OAuthCode.loginTimer);
				}
				NetStarUtils.OAuthCode.loginTimer = setTimeout(function(){
					NetStarUtils.OAuthCode.reLoginDialog();
				}, expiresInfo.expireMinute*60*60*1000);
			},
			error:function(error){
				NetStarUtils.defaultAjaxError(error);
			},
			complete:function(){
				//重置是否等待刷新标识，等待下次刷新
				var _this = this.plusData.this;
				NetStarUtils.OAuthCode.isWaitingRefreshToken = false;
			}
			
		});
	},
	//保存刷新token的日志
	saveTokenLog:function(saveType){
		var currentDate = new Date();
		var saveInfo = {
			type:saveType,
			timeStamp:currentDate.getTime(),
			date:currentDate.toString(),
		}

		var logs = store.get('NetstarTokenLog');
		//没有则新建，有则限制长度，最长20条，防止超长
		if(typeof(log)!='object'){
			logs = [];
		}
		while(logs.length > 20){
			logs.splice(logs.length-1,1)
		}
		logs.unshift(saveInfo);
		store.set('NetstarTokenLog', logs);
	},
	//返回授权码
	get:function(){
		/*
		 * 验证是否需要获取token 若果NetstarHomePage.config.isNeedToken==true(需要)否则(不需要))
		 * 不需要登录时不需要获取token 获取假的token : default
		 * isNeedToken 存在登录页时配置在登录页上 否则配置在开始页面
		 */
		if(typeof(NetstarHomePage) == "object" && typeof(NetstarHomePage.config) == "object" && NetstarHomePage.config.isNeedToken === false){
			return 'default';
		}
		var _this = this;
		var oAuthInfo = store.get('Authorization'); 

		if(typeof(oAuthInfo) != 'object'){
			//不合法字符同样返回失败
			return false;
		}

		var currentTS = new Date().getTime();
		if(currentTS >  oAuthInfo.expires){
			//token超期
			console.error('用户登录凭证已经超期，请重新登录');
			return false;
		}
		
		//如果超时时间不足60分钟，则重新获取token 延迟2秒后刷新
		if((oAuthInfo.expires - currentTS )/1000/60 <= 60 && _this.isWaitingRefreshToken == false){
			_this.isWaitingRefreshToken = true;
			setTimeout(function(){
				_this.refreshToken();
			},2000)
		}
		
		//返回授权码则更新最后操作时间
		var lastOperateDate = new Date()
		var lastOperate = lastOperateDate.getTime();
		var dateTimeLastOperate = lastOperateDate.toString();

		oAuthInfo.lastOperate = lastOperate;
		oAuthInfo.dateTimeLastOperate = dateTimeLastOperate;
		store.set('Authorization', oAuthInfo);

		var code = oAuthInfo.code;
		return code
	},
	getExpiresInfo:function(){
		var expiresInfo = store.get('NetstarLoginExpiresInfo');
		return expiresInfo;
	},
	//获取储存的信息
	getStoreInfo:function(){
		var infoObj = store.get('Authorization');
		return infoObj
	},
	//清除授权信息，用于退出登录状态
	clear:function(){
		store.set('Authorization', 'false');
		$.removeCookie('Authorization');
	},
	//重新登录
	reLogin:function(){
		//先临时写成了跳转到登录页
		NetstarHomePage.config.toLoginPage();
	},
	signin : function(formData, callbackFunc){
		var _this = this;
		formData.login = 1;
		var urlParams = NetStarUtils.getUrlPara();
		if(typeof(urlParams)=='object'){
			$.each(urlParams, function(key,value){
				switch(key){
					case 'callback':
						//callback是一个json文本 需要decode 例如 %257B%2522customerId%2522:1310336379963573234%257D  => {"customerId":1310336379963573234}
						//曹雷登录需求  cy 20190826
						formData[key] = decodeURIComponent(value);
						break;
					default:
						break;
				}
			});
		}
		var _config = NetstarHomePage.config.loginConfig;
		$.ajax({
			type: "POST",
			dataType: 'json',
			url: _config.loginAjax.url, 
			data: formData,
			plusData:{
				callbackFunc : callbackFunc,
			},
			success: function (res) {
				 /**
				 * res:{
				 *  success:true,
				 *  data:'eyJ0eXA...'   //返回的data就是token
				 * }
				 */
				if (res.success) {
					//登录成功后请求用户消息并登录系统  
					if(typeof(res.data)!='string'){
						console.error('登录接口未返回授权码');
						return;
					}

					var cookieJson = {
						isSave: true,
						username: "username",
						remember: "remember"
					}
					NetstarLogin.loginPanel.checkCookie(cookieJson);
					var params = window.location.search.slice(1).split('&');
					var result = {};
					for (var i = 0; i < params.length; i++) {
						var idx = params[i].indexOf('=');
						if (idx > 0) {
							result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
						}
					}
					//window.top.location.href = "home" + window.location.search;
					
					var loginRes = res;
					NetstarLogin.loginRes = res;
					NetstarLogin.Authorization = NetstarLogin.loginRes.data;

					//保存授权码
					NetStarUtils.OAuthCode.set({
						authorization:      NetstarLogin.Authorization, 
						expireMinute:       _config.expireMinute,
						loginTimeStamp:     new Date().getTime(),
					});
					var plusData = this.plusData;
					if(typeof(plusData.callbackFunc) == "function"){
						plusData.callbackFunc();
					}
					// 登录即时器
					if(NetStarUtils.OAuthCode.loginTimer){
						clearTimeout(NetStarUtils.OAuthCode.loginTimer);
					}
					NetStarUtils.OAuthCode.loginTimer = setTimeout(function(){
						NetStarUtils.OAuthCode.reLoginDialog();
					}, _config.expireMinute*60*60*1000)
				} else {
					//不成功提示错误 如密码错误等
					nsalert(res.pwmsg);
				}
			},
			error: NetstarLogin.ajaxError,
		});
	},
	reLoginDialog : function(){
		var dialogConfig = {
			id: "netstar-re-login",
			width: 300,
			height: 172,
			title: '超时登录',
			templateName: 'PC',
			isAllowDrag : false,
			shownHandler: function (data) {
				var dialogBodyId = data.config.bodyId;
				var footerIdGroup = data.config.footerIdGroup;
				var html = '<div class="pt-btn-group">' 
								+ '<button class="pt-btn pt-btn-default" ns-type="signin">登录</button>'
								+ '<button class="pt-btn pt-btn-default" ns-type="close">取消</button>'
							+ '</div>';
				var $html = $(html);
				var $btns = $html.children('button');
				$btns.off('click');
				$btns.on('click', function(){
					var $this = $(this);
					var nsType = $this.attr('ns-type');
					switch(nsType){
						case 'signin':
							var formData = NetstarComponent.getValues(dialogBodyId);
							NetStarUtils.OAuthCode.signin(formData,function(){
								NetstarComponent.dialog["netstar-re-login"].vueConfig.close();
							});
							break;
						case 'close':
							NetstarComponent.dialog["netstar-re-login"].vueConfig.close();
							break;
					}
				});
				$('#' + footerIdGroup).append($html);
				var formJson = {
					id: dialogBodyId,
					templateName: 'form',
					componentTemplateName: 'PC',
					defaultComponentWidth:'100%',
					isSetMore : false,
					form : [
						{
							id : 'username',
							label : '用户名',
							type : 'text',
							rules : 'required',
						},{
							id : 'password',
							label : '密码',
							type : 'password',
							rules : 'required',
						}
					],
				};
				NetstarComponent.formComponent.show(formJson);
			},
		}
		NetstarComponent.dialogComponent.init(dialogConfig);
	}
}
NetStarUtils.getUrl = function(_url){
	var rootPath = getRootPath();
	//如果最后一个字符是'/' 则删除
	var lastCharacter = rootPath.substr(rootPath.length-1);
	if(lastCharacter == '/'){
		rootPath = rootPath.substr(0, rootPath.length-1)
	}
	//如果第一个字符是 '/' 也删除
	var url = _url;
	var firstCharacter = url.substr(0,1);
	if(firstCharacter == '/'){
		url = url.substr(1, rootPath.length)
	}

	//整理后重新拼接
	var allUrl = rootPath + '/' + url;
	return allUrl;
}
//list转tree lyw 20180426 移动位置 cy 20190629
NetStarUtils.convertToTree = function(rows,idField,parentIdField,childIdField){
	var idMap = {};
	for(var i = 0; i < rows.length; i++){
		idMap[rows[i][idField]] = rows[i];
	}
	var result = [];
	for(var i = 0; i < rows.length; i++){
		var row = rows[i];	
		if(row[parentIdField] && idMap[row[parentIdField]]){
			var parent = idMap[row[parentIdField]];
			if(!$.isArray(parent.children)){
				parent[childIdField] = [];
			}
			parent.isParent = true;
			parent[childIdField].push(row);
		}else{
			result.push(row);
		}
	}
	return result;
}
/**
 * 返回地址栏url中的的参数
 * @returns {param1:'', param2:123}
 */
NetStarUtils.getUrlPara = function () {
	
	var url = document.location.toString();
	var paraStr = url.substr(url.indexOf('?') + 1);
	var paraArr = paraStr.split('&');
	var paraObj = {};
	for (var paraI = 0; paraI < paraArr.length; paraI++) {
		var equalIndex = paraArr[paraI].indexOf('=');
		var paraName = paraArr[paraI].substr(0, equalIndex);
		var paraValue = paraArr[paraI].substr(equalIndex + 1);
		paraObj[paraName] = paraValue;
	}
	return paraObj;
}
NetStarUtils.getTreeDataByRows = function(resData, resConfig){
	var textField = resConfig.textField;
	var valueField = resConfig.valueField;
	var parentIdField = resConfig.parentIdField;
	var idField = resConfig.idField;
	var openState = resConfig.openState;
	var childIdField = resConfig.childIdField;
	var dataByIdObject = {};//根据id读取数据
	var dataByPidObject = {};//根据pid存放子元素id
	//排序从小到大
	resData.sort(function(a,b){
		return a[idField] - b[idField];
	});
	var tempRootId = -1;
	var parentIdTempObj = {};
	var idTempObj = {};
	
	var treeData = NetStarUtils.convertToTree(resData,idField,parentIdField,childIdField);
	if(openState){
		switch(openState.type){
			case 'level':
				//按层级关系
				getTreeOpenByLevel(openState.value);
				break;
			case 'id':
				//根据id值
				getTreeOpenById(openState.value);
				break;
			case 'field':
				//按字段值
				getTreeOpenByField(openState.value);
				break;
		}
	}
	function getTreeOpenByLevel(value){
		if(value[0] === -1){
			for(var levelI=0; levelI<resData.length; levelI++){
				resData[levelI].open = true;
			}
		}else{
			//树结构共有几层
			var totalTreeLevel = 0;
			var dataByLevelObject = {};	//按等级来存放数据
			for(var i=0; i<treeData.length; i++){
				//treeData[i].level = 0;
				if(dataByLevelObject[0]){
					dataByLevelObject[0].push(treeData[i]);
				}else{
					dataByLevelObject[0] = [];
					dataByLevelObject[0].push(treeData[i]);
				}
				if($.isArray(treeData[i].children)){
					getLevel(treeData[i].children,0);
				}
			}
			function getLevel(childData,total){
				total ++;
				for(var childI=0; childI<childData.length; childI++){
					//childData[childI].level = total;
					totalTreeLevel = total;
					if(dataByLevelObject[total]){
						dataByLevelObject[total].push(childData[childI]);
					}else{
						dataByLevelObject[total] = [];
						dataByLevelObject[total].push(childData[childI]);
					}
					if($.isArray(childData[childI].children)){
						getLevel(childData[childI].children,total);
					}
				}
			}
			for(var levelI=0; levelI<value.length; levelI++){
				if(levelI > totalTreeLevel){
					//给定的等级要大于目前总共有的等级
					continue;
				}
				var levelNumber = value[levelI];
				for(var nextI=0; nextI<levelNumber; nextI++){
					var cData = dataByLevelObject[nextI];
					for(var dataI=0; dataI<cData.length; dataI++){
						cData[dataI].open = true;
					}
				}
			}
		}
	}
	function getTreeOpenById(value){
		for(var idI=0; idI<resData.length; idI++){
			if(value.indexOf(resData[idI][idField])>-1){
				resData[idI].open = true;
			}
		}
	}
	function getTreeOpenByField(value){
		for(var idI=0; idI<resData.length; idI++){
			resData[idI].open = resData[idI][value[0]];
		}
	}
	return treeData;
}
//允许通过地址栏方式重新设定服务器端API地址 cy 190828
NetStarUtils.resetServerUrl = {
	//修改并保存数据 使用store是因为登录和使用可能来自不同的地址
	reset:function(_serverRootPath){
		var urlParas = NetStarUtils.getUrlPara();
		var isReset = false;
		if(typeof(urlParas) == 'object'){
			if(typeof(urlParas.nsserver) == 'string'){
				_serverRootPath = urlParas.nsserver;
				var lastChar = _serverRootPath.substr(_serverRootPath.length - 1);
				//常出现的错误输入 1. 缺少'/'，2.多了个'#'
				if(lastChar == '#' ){
					_serverRootPath = _serverRootPath.substr(0, _serverRootPath.length - 1);
					lastChar = _serverRootPath.substr(_serverRootPath.length - 1);
				}
				if(lastChar != '/'){
					_serverRootPath = _serverRootPath + '/';
				}
				
				isReset = true; 
				console.warn('服务器端API地址已修改为：' + _serverRootPath);

			}
		}
		var resetInfo = {
			url:_serverRootPath, 	//修改后的url
			isReset:isReset, 		//是否修改
		}
		
		store.set('NetstarResetServerInfo', resetInfo);
		return _serverRootPath;
	},
	//获取数据
	get:function(){
		//如果没有修改过则返回false
		var url = false;
		var resetInfo = store.get('NetstarResetServerInfo');
		if(typeof(resetInfo) == 'object'){
			if(resetInfo.isReset){
				url = resetInfo.url;
			}
		}
		return url;
	}
}
// 下载另存为
NetStarUtils.download = function(options){
    var defaults = {
        method: "GET",
        url: "",
        fileName: "",
        param: []
    };
    var options = $.extend(defaults, options);
	var authorization = NetStarUtils.OAuthCode.get();
	if(authorization == false){
		NetStarUtils.OAuthCode.reLogin();
		return false;
	}
    if (options.url && options.param) {
        var xhr = new XMLHttpRequest();
        var a = document.createElement('a'); // 转换完成，创建一个a标签用于下载
        a.download = options.fileName;
        xhr.open('get', options.url, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); // 设置请求头，必须在open后添加
        xhr.setRequestHeader('Authorization', authorization);
        xhr.responseType = 'blob'; // 返回类型blob  blob 存储着大量的二进制数据
        xhr.onload = function () {
            if (this.status === 200) {
                var blob = new Blob([this.response]); // 转成文本存储
                // let name = xhr.getResponseHeader('content-disposition');
                // let a = document.createElement('a'); // 转换完成，创建一个a标签用于下载
                a.download = options.fileName;
                a.href = window.URL.createObjectURL(blob); // 转成本地连接到blob文本
                //a.click();
				if (document.createEvent) {
					var evt = document.createEvent("MouseEvents"); 
					evt.initEvent('click', true, false);
					a.dispatchEvent(evt);
				}else if (document.createEventObject){
					a.fireEvent('onclick');
				}else if (typeof a.onclick == 'function'){
					a.onclick();
				}
            }
        }
        xhr.send(); // 发送ajax请求
    };
}
NetStarUtils.wrapUrl = function(urlPath) {
    function appendAuth() {
        var auth = 'Authorization=' + NetStarUtils.OAuthCode.get();
        if(urlPath.indexOf('?') > 0) {
            urlPath += '&';
        } else {
            urlPath += '?';
        }
        urlPath += auth;
    }
    if(!urlPath) {
        nsalert('错误的地址:' + urlPath);
        return urlPath;
    }
    var origin = location.origin;
    if(urlPath.startsWith(origin)) {
        return urlPath;
    }
    if(urlPath.startsWith('http')) {
        appendAuth();
        return urlPath;
    }
    //console.log(origin, urlPath);
	//var base = NetstarMainPage.systemInfo.context.weburl;
	var base = getRootPath();
    if(!base.endsWith('/')) {
        base = base + '/';
    }
    //console.log(base);
    if(urlPath.startsWith('/')) {
        urlPath = urlPath.substr(1);
    }
    if(!base.startsWith(origin)) {
        appendAuth();
    }
    //console.log(base, urlPath);
    return base +urlPath;
}

//sjj 20191021 根据当前时间-已知时间 计算相差多少天多少小时多少分多少秒
NetStarUtils.getDiffByTimeUnit = function(_timer){
	//var nowTimer = moment().format('YYYY-MM-DD HH:mm:ss');//当前日期的年月日 时分秒
	//var alreadyTimer =  moment(Number(_timer)).format('YYYY-MM-DD HH:mm:ss');
	var nowTime = moment(moment().unix()*1000);//获取unix时间戳 需要*1000
	var beforeTime =  moment(Number(_timer));   // 后台接口给的时间戳
	var diffDays = nowTime.diff(beforeTime,'days');//天数
	var diffHours = nowTime.diff(beforeTime,'hours');//小时
	var diffMinutes = nowTime.diff(beforeTime,'minutes');//分钟
	var diffSeconds = nowTime.diff(beforeTime,'seconds');//秒

	var returnData = '';
	if(diffDays > 1){
		returnData = diffDays+'天前';
	}else if(diffHours > 1){
		returnData = diffHours+'小时前';
		if(diffHours > 24){
			returnData = diffDays+'天前';
		}
	}else if(diffMinutes > 0){
		returnData = diffMinutes+'分钟前';
		if(diffMinutes > 60){
			//1小时60分钟
			returnData = diffHours+'小时前';
		}
	}else{
		returnData = '刚刚';
	}
	return returnData;
}
//cy 20191219 获取复制内容
NetStarUtils.getCopyByValue = function(value){
	//value:string 添加到剪贴板的字符串
	var $copyInput = $('<input type="text" value="'+value+'" style="opacity:0">');
	$('body').append($copyInput);
	$copyInput.select();
	var isSuccess = document.execCommand('copy');
	if(isSuccess == true){
		nsalert('复制成功', 'success');
	}
	$copyInput.remove();
 }
 NetStarUtils.getCopyById = function(domId){
	 //domId:string 添加到剪贴板的DOM节点ID
	var text = $('#'+domId).text();
	NetStarUtils.getCopyByValue(text);
 }

 //sjj 20191225 深度克隆
 NetStarUtils.deepCopy = function(obj){
    if (obj == null) { return null } 
    var result = Array.isArray(obj) ? [] : {}; 
    for (var key in obj) { 
        if (obj.hasOwnProperty(key)) { 
            if (typeof obj[key] === 'object') { 
            result[key] = NetStarUtils.deepCopy(obj[key]); // 如果是对象，再次调用该方法自身
            } else { 
            result[key] = obj[key]; 
            } 
        } 
    } 
    return result; 
}

//sjj 20200115 增加本地读取地址
NetStarUtils.getStaticUrl = function(){
	var staticurl = NetstarMainPage.systemInfo.context.staticurl;
	var pSuffix = staticurl.indexOf('/',staticurl.indexOf('//') + 2);
	if(pSuffix >-1){
		staticurl = staticurl.substring(0,pSuffix);
	}
	return staticurl;
}
//sjj 20200115 增加获取api地址
NetStarUtils.getAPIUrl = function(){
	return NetstarMainPage.systemInfo.context.weburl;
}
// lyw 20200210 通过ajax获取短链接的方法
NetStarUtils.getShortUrlWithToken = function(config){
	/**
	 * businessUrl : string
	 * tokenCode : string
	 * businessId : string
	 * callBackFunc : 回调方法
	 */
	var validArr = [
		['businessUrl', 	'string', 	true], 	//前置回调函数
		['tokenCode', 		'string', 	true], 	//成功回调函数
		['businessId', 		'string', 	false], 	//操作值
		['callBackFunc', 	'function', false],	//成功之后的回调函数
	]
	var isValid = nsDebuger.validOptions(validArr, config);
	if(!isValid){
		nsalert('获取短链接失败，请检查配置参数', 'error');
		return false;
	}
	var ajaxConfig = {
		url : getRootPath() + '/temptoken/tempTokens/genShortUrlWithToken?url='+config.businessUrl+"&tempTokenCode="+config.tokenCode,
		type : 'POST',
		contentType : 'application/json',
		data : {
			businessId : config.businessId
		},
		plusData : config,
	}
	NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
		var plusData = _ajaxConfig.plusData;
		if(typeof(plusData) == "object" && typeof(plusData.callBackFunc) == "function"){
			plusData.callBackFunc(res, _ajaxConfig);
		}                                                  
	});         
}
//支持base64Url的base64B编码
NetStarUtils.base64Safe = (function () {
    var BASE64_MAPPING = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
        'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
        'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
        'w', 'x', 'y', 'z', '0', '1', '2', '3',
        '4', '5', '6', '7', '8', '9', '+', '/'
    ];
    var URLSAFE_BASE64_MAPPING = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
        'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
        'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
        'w', 'x', 'y', 'z', '0', '1', '2', '3',
        '4', '5', '6', '7', '8', '9', '-', '_'
    ];

    var _toBinary = function (ascii) {
        var binary = [];
        while (ascii > 0) {
            var b = ascii % 2;
            ascii = Math.floor(ascii / 2);
            binary.push(b);
        }
        binary.reverse();
        return binary;
    };

    var _toDecimal = function (binary) {
        var dec = 0;
        var p = 0;
        for (var i = binary.length - 1; i >= 0; --i) {
            var b = binary[i];
            if (b == 1) {
                dec += Math.pow(2, p);
            }
            ++p;
        }
        return dec;
    };

    var _toUTF8Binary = function (c, binaryArray) {
        var mustLen = (8 - (c + 1)) + ((c - 1) * 6);
        var fatLen = binaryArray.length;
        var diff = mustLen - fatLen;
        while (--diff >= 0) {
            binaryArray.unshift(0);
        }
        var binary = [];
        var _c = c;
        while (--_c >= 0) {
            binary.push(1);
        }
        binary.push(0);
        var i = 0, len = 8 - (c + 1);
        for (; i < len; ++i) {
            binary.push(binaryArray[i]);
        }

        for (var j = 0; j < c - 1; ++j) {
            binary.push(1);
            binary.push(0);
            var sum = 6;
            while (--sum >= 0) {
                binary.push(binaryArray[i++]);
            }
        }
        return binary;
    };

    var _toBinaryArray = function (str) {
        var binaryArray = [];
        for (var i = 0, len = str.length; i < len; ++i) {
            var unicode = str.charCodeAt(i);
            var _tmpBinary = _toBinary(unicode);
            if (unicode < 0x80) {
                var _tmpdiff = 8 - _tmpBinary.length;
                while (--_tmpdiff >= 0) {
                    _tmpBinary.unshift(0);
                }
                binaryArray = binaryArray.concat(_tmpBinary);
            } else if (unicode >= 0x80 && unicode <= 0x7FF) {
                binaryArray = binaryArray.concat(_toUTF8Binary(2, _tmpBinary));
            } else if (unicode >= 0x800 && unicode <= 0xFFFF) {//UTF-8 3byte
                binaryArray = binaryArray.concat(_toUTF8Binary(3, _tmpBinary));
            } else if (unicode >= 0x10000 && unicode <= 0x1FFFFF) {//UTF-8 4byte
                binaryArray = binaryArray.concat(_toUTF8Binary(4, _tmpBinary));
            } else if (unicode >= 0x200000 && unicode <= 0x3FFFFFF) {//UTF-8 5byte
                binaryArray = binaryArray.concat(_toUTF8Binary(5, _tmpBinary));
            } else if (unicode >= 4000000 && unicode <= 0x7FFFFFFF) {//UTF-8 6byte
                binaryArray = binaryArray.concat(_toUTF8Binary(6, _tmpBinary));
            }
        }
        return binaryArray;
    };

    var _toUnicodeStr = function (binaryArray) {
        var unicode;
        var unicodeBinary = [];
        var str = "";
        for (var i = 0, len = binaryArray.length; i < len;) {
            if (binaryArray[i] == 0) {
                unicode = _toDecimal(binaryArray.slice(i, i + 8));
                str += String.fromCharCode(unicode);
                i += 8;
            } else {
                var sum = 0;
                while (i < len) {
                    if (binaryArray[i] == 1) {
                        ++sum;
                    } else {
                        break;
                    }
                    ++i;
                }
                unicodeBinary = unicodeBinary.concat(binaryArray.slice(i + 1, i + 8 - sum));
                i += 8 - sum;
                while (sum > 1) {
                    unicodeBinary = unicodeBinary.concat(binaryArray.slice(i + 2, i + 8));
                    i += 8;
                    --sum;
                }
                unicode = _toDecimal(unicodeBinary);
                str += String.fromCharCode(unicode);
                unicodeBinary = [];
            }
        }
        return str;
    };

    var _encode = function (str, url_safe) {
        var base64_Index = [];
        var binaryArray = _toBinaryArray(str);
        var dictionary = url_safe ? URLSAFE_BASE64_MAPPING : BASE64_MAPPING;

        var extra_Zero_Count = 0;
        for (var i = 0, len = binaryArray.length; i < len; i += 6) {
            var diff = (i + 6) - len;
            if (diff == 2) {
                extra_Zero_Count = 2;
            } else if (diff == 4) {
                extra_Zero_Count = 4;
            }
            var _tmpExtra_Zero_Count = extra_Zero_Count;
            while (--_tmpExtra_Zero_Count >= 0) {
                binaryArray.push(0);
            }
            base64_Index.push(_toDecimal(binaryArray.slice(i, i + 6)));
        }

        var base64 = '';
        for (var i = 0, len = base64_Index.length; i < len; ++i) {
            base64 += dictionary[base64_Index[i]];
        }

        for (var i = 0, len = extra_Zero_Count / 2; i < len; ++i) {
            base64 += '=';
        }
        return base64;
    };

    var _decode = function (_base64Str, url_safe) {
        var _len = _base64Str.length;
        var extra_Zero_Count = 0;
        var dictionary = url_safe ? URLSAFE_BASE64_MAPPING : BASE64_MAPPING;

        if (_base64Str.charAt(_len - 1) == '=') {
            if (_base64Str.charAt(_len - 2) == '=') {//两个等号说明补了4个0
                extra_Zero_Count = 4;
                _base64Str = _base64Str.substring(0, _len - 2);
            } else {//一个等号说明补了2个0
                extra_Zero_Count = 2;
                _base64Str = _base64Str.substring(0, _len - 1);
            }
        }

        var binaryArray = [];
        for (var i = 0, len = _base64Str.length; i < len; ++i) {
            var c = _base64Str.charAt(i);
            for (var j = 0, size = dictionary.length; j < size; ++j) {
                if (c == dictionary[j]) {
                    var _tmp = _toBinary(j);
                    /*不足6位的补0*/
                    var _tmpLen = _tmp.length;
                    if (6 - _tmpLen > 0) {
                        for (var k = 6 - _tmpLen; k > 0; --k) {
                            _tmp.unshift(0);
                        }
                    }
                    binaryArray = binaryArray.concat(_tmp);
                    break;
                }
            }
        }
        if (extra_Zero_Count > 0) {
            binaryArray = binaryArray.slice(0, binaryArray.length - extra_Zero_Count);
        }
        var str = _toUnicodeStr(binaryArray);
        return str;
    };

    var __BASE64 = {
        encode: function (str) {
            return _encode(str, false);
        },
        decode: function (base64Str) {
            return _decode(base64Str, false);
        },
        urlsafe_encode: function (str) {
            return _encode(str, true);
        },
        urlsafe_decode: function (base64Str) {
            return _decode(base64Str, true);
        }
    };

    return __BASE64;
})();
//根据身份证号获取详细信息
NetStarUtils.getDetailInfoByIcd = function (codeIcd) {
	var sexMap = { 1: "男", 0: "女" };    //
	// var linkJson = provinceSelect.data;
	var provinceInfoByCode = nsDataFormat.formatProvince.provinceInfoByCode;
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
		// var cityData = linkJson[codeIcd.substring(0, 6)];
		// var proJson = linkJson[cityData.city.code];
		// city = proJson.pro.name + ',' + cityData.city.name + ',' + cityData.area.name;
		// cityCode = { pro: proJson.pro, city: cityData.city, area: cityData.area };
		var areaInfos = provinceInfoByCode[codeIcd.substring(0, 6)];
		var area = areaInfos.name;
		var areaCode = areaInfos.code;
		var proCode = areaCode.substring(0, 2) + '0000';
		var cityCode = areaCode.substring(0, 4) + '00';
		var codes = { pro: proCode, city: cityCode, area: areaCode };
		var json = {
			city: area,
			cityCode: codes,
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

