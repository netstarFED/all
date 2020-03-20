/**
 * 调试工具 cy 20190524
 */

var debugerMode = true; //是否开启调试模式，如果关闭，则不对配置参数等基本问题进行验证，可以提高js执行速度，一般不需要关闭
var nsDebuger = {};
nsDebuger.state = true;
nsDebuger.ver = '1.2.2' //20190524 cy
nsDebuger.navCustomConfigValid = function(config){
	var componentsArr = config.btns;
	nsDebuger.ArrTwoValid(componentsArr,'nav',config.id);
}
nsDebuger.formCustomConfigValid = function(config){
	var componentsArr = config.form;
	nsDebuger.ArrTwoValid(componentsArr,'form',config.id);
}
nsDebuger.ArrTwoValid = function(componentsArr,typeName,objName){validOptions
	for(var arr1 = 0; arr1<componentsArr.length; arr1++){
		for(var arr2 = 0; arr2<componentsArr[arr1].length; arr2++){
			var currentConfigData = componentsArr[arr1][arr2];
			if(typeName=='nav'){
				if(typeof(currentConfigData.id)=='undefined'||typeof(currentConfigData.text)=='undefined'||typeof(currentConfigData.handler)=='undefined'||typeof(currentConfigData.configShow)=='undefined'||typeof(currentConfigData.required)=='undefined'){
					nsalert(typeName+":"+objName+"参数不完整 第"+arr1+"组 / 第"+arr2+"个",'error');
				}
			}else if(typeName=='form'){
				//暂无规则
			}
		}
	}
}
//测试代码执行
nsDebuger.runCode = function(){
	var outHtml = $("#form-demo-code-outputHTML").val(); 
	nsdialog.hide();
	setTimeout(function(){
		var ctimer = new Date();
		var runTimer = ctimer.getTime();
		$('container .page-title.nav-form').after(outHtml);
		var ctimer2 = new Date();
		var runTimer2 = ctimer2.getTime();
		var runTimerLong = runTimer2-runTimer;
		ctimer = undefined;
		ctimer2 = undefined;

		nsalert("代码执行完毕 执行时间"+runTimerLong+'毫秒','success')
	},500);
}
//测试代码弹框
nsDebuger.codeDialog = function(title,codeDomID,isRunCode){
	//title 		标题
	//codeDomID 	页面上显示代码的容器id
	//isRunCode 	是否显示执行代码按钮
	nsDebuger.demoDialog({
		title:title,
		codeDomID:codeDomID,
		isRunCode:isRunCode
	})
}
//专门用于执行js的
nsDebuger.jsDialog = function(jscode){
	var options = {
		code:jscode,
		codeType:'js'
	}
	nsDebuger.demoDialog(options);
}
//给script的id，则调用此方法
nsDebuger.jsDomDialog = function(scriptID,isAutoGetFunction){
	var options = {
		codeDomID:scriptID,
		codeType:'js',
		isAutoGetFunction:true
	}
	if(typeof(isAutoGetFunction)=='boolean'){
		options.isAutoGetFunction = isAutoGetFunction;
	}
	nsDebuger.demoDialog(options);
}
nsDebuger.demoDialog = function(options){
	
	//options.title 		标题
	//options.codeDomID 	页面上显示代码的容器id
	//options.code  		字符串，要用来展示的代码 和 codeDomID 是互斥的，优先执行code
	//options.isRunCode 	是否显示执行代码按钮
	//options.codeType 		代码类型 html css js

	//如果options的类型是string，则认为是代码
	if(typeof(options)=='string'){
		options = {
			code:options,
			codeType:'html'
		}
	}

	//默认是测试代码
	var title = '';
	if(typeof(options.title)!='string'){
		title = '测试代码';
	}else{
		if(options.title==''){
			title = '测试代码';
		}else{
			title = options.title;
		}
	}

	//默认有执行按钮
	var isRunCode = nsVals.getDefaultTrue(options.isRunCode);

	//要执行的代码，优先执行code属性
	var codeStr = ''
	if(typeof(options.code)=='string'){
		codeStr = options.code;
	}else{
		if(typeof(options.codeDomID)=='string'){
			codeStr = $('#'+options.codeDomID).html();
			if(options.isAutoGetFunction){
				console.log(codeStr);
				var functionName = codeStr.substring(codeStr.indexOf('function ')+9,codeStr.indexOf('{'))
				functionName = $.trim(functionName);
				console.log(functionName)
				codeStr +=functionName+'\r';
			}
		}
	}

	//要指定的代码类型 javascript css html
	var codeType = 'html';
	if(typeof(options.codeType)=='string'){
		codeType = options.codeType;
	}
	switch(codeType){
		case 'html':
			//如果是html则不用加特殊的东西
			break;
		case 'js':
			codeStr = '<script type="text/javascript">'+codeStr+'</script>'
			break;
	}

	var configCodeDemo = {
		id: 	"demo-code",
		title: 	title,
		size: 	"b",
		form:[
			{
				id: 		'outputHTML',
				label: 		'代码示例',
				type: 		'textarea',
				height: 	'300px',
				placeholder:'',
				value: 		codeStr
			}
		]
	}
	var btns = 
		[
			{
				text: 		'执行代码',
				handler: 	nsDebuger.runCode,
			}
		]
	if(isRunCode){
		configCodeDemo.btns = btns;
	}
	nsdialog.initShow(configCodeDemo);
}
//用于文档中的代码执行
$(document).ready(function(){
	if(debugerMode != true){
		return;
	}
	//直接运行的阿娜妞
	var runCodeHtml = 
		'<button type="button" class="btn btn-white">'
			+'<i class="fa-code"></i>'
			+'<span>运行代码</span>'
		+'</button>';
	var $runCodeBtn = $(runCodeHtml);

	//弹框修改的按钮
	var editCodeHtml = 
		'<button type="button" class="btn btn-white">'
			+'<i class="fa-edit"></i>'
			+'<span>修改代码</span>'
		+'</button>';
	var $editCodeBtn = $(editCodeHtml);

	var $btnContainer = $('<div class="btns-container"></div>');
	$btnContainer.append($editCodeBtn);
	$btnContainer.append($runCodeBtn);
	

	$('[ns-data-format="code"]').after($btnContainer);

	function getCode($codeContainer){
		var preHtml = $codeContainer.html();
		//截取不需要的html代码
		var codeHtml = preHtml.replace(/\<div class="btns-container"(.*)\<\/div>/, '');
		return codeHtml;
	}
	//运行代码 
	$runCodeBtn.on('click',function(ev){
		var $pre = $(this).closest('.btns-container').prev();
		codeHtml = getCode($pre);
		nsDebuger.runDemoCode(codeHtml); //指定代码
	})
	//弹框修改代码后运行
	$editCodeBtn.on('click', function(ev){
		var $pre = $(this).closest('.btns-container').prev();
		codeHtml = getCode($pre);
		$pre.attr('contenteditable','true');
		$pre.focus();

		$pre.off('blur');
		$pre.on('blur', function(blurEvent){
			$(this).removeAttr('contenteditable');
			$(this).off('blur');
		})
	})

});
//执行代码斌显示执行时间
nsDebuger.runDemoCode = function(code){
	var isSuccess = false;
	var runTimeNumber = new Date().getTime();
	try{
		isSuccess = true;
		eval(code);
		runTimeNumber = new Date().getTime() - runTimeNumber;
	}catch(err){
		isSuccess = false;
		nsalert('代码执行错误','error');
		console.error('代码执行错误');
		console.error(err);
	}finally{
		if(isSuccess){
			nsalert('代码执行时间：'+runTimeNumber+' 毫秒', 'info');
		}
	}
}
//验证config中的是否数据类型是否合法
//返回值ture为合法 false非法
nsDebuger.validOptions = function(optionsArr, config){
	// 举例：
	// optionArr = [
	// 		['readonly','boolean',true,''],
	//		参数，类型，是否必填(默认非必填)，	不满足情况下的提示语句	
	// ]
	if(typeof(config)!='object'){
		console.error('验证对象配置错误，\r\n nsDebuger.validOptions(optionsArr, config)中的config只能是object或者json对象');
		console.error(config);
		return false;
	}
	if($.isArray(optionsArr)=='false'){
		console.error('验证参数配置错误，\r\n nsDebuger.validOptions(optionsArr, config)中的optionsArr只能是二维数组');
		console.error(optionsArr);
		return false;
	}
	for(var i=0; i<optionsArr.length; i++){
		if(typeof(optionsArr[i])!='object'){
			console.error('验证参数配置第'+(i+1)+'个有错误');
			console.error(optionsArr)
			console.error(optionsArr[i])
		}
		//给第三个参数加上默认值false
		if(typeof(optionsArr[i][2])=='undefined'){
			optionsArr[i][2] = false;
		}
		//给第四个参数传过去label的名字
		if(typeof(optionsArr[i][3])=='undefined'){
			optionsArr[i][3] = optionsArr[i][0];
		}
		//第四个参数是输出对象，输出对象是config
		optionsArr[i][4] = config;
		
		optionsArr[i][0] = config[optionsArr[i][0]];
	}
	var isValid = nsDebuger.validParameter(optionsArr,true);
	return isValid;
}
//验证参数类型及说明
var NSVALIDTYPE = {
	UNDERFINED:'undefined',
	STRING:'string',
	NUMBER:'number',
	OBJECT:'object',
	FUNCTION:'function',
	ARRAY:'array',
	NULL:'null',
	ANY:'ANY',
	OBJECTNOTEMPTY:'objectNotEmpty',
}
//验证参数是否必须及类型
nsDebuger.validParameter = function(parametersArr,isFromValidOptions){
	//isFromValidOptions是否是从validOptions来的，如果是，则显示显示错误有一点区别
	//可以验证的类型包括 undefined string number object function array null any (任何值都以，只要不是未定义)
	// 举例：
	// parametersArr = [
	// 		[readonly,'boolean',true,'',validObj],
	//		参数，类型，是否必填(默认非必填)，	不满足情况下的附加提示语句（默认无）, 验证对象（输出用，默认无）
	// ]
	// return boolean 是否验证成功
	if($.isArray(parametersArr)){
		var isConfigValid = true;
		for(var pI=0; pI<parametersArr.length; pI++){
			//第二个参数是类型，字符串
			if(typeof(parametersArr[pI][1])!='string'){
				console.error('类型错误：'+parametersArr[pI][1]+', 必须是string');
				isConfigValid = false;
			}
			//第三个参数是非必填，必须是boolean
			if(typeof(parametersArr[pI][2])!='undefined'){
				if(typeof(parametersArr[pI][2])!='boolean'){
					console.error('是否必填参数错误：'+parametersArr[pI][2]+', 必须是boolean');
					isConfigValid = false;
				}
			}
			//第四个参数是非必填，必须是string
			if(typeof(parametersArr[pI][3])!='undefined'){
				if(typeof(parametersArr[pI][3])!='string'){
					console.error('反馈信息参数错误：'+parametersArr[pI][3]+', 必须是string');
					console.error(parametersArr);
					console.error(parametersArr[pI]);
					isConfigValid = false;
				}
			}
		}
		if(isConfigValid == false){
			return false;
		}
	}else{
		console.error('验证数组错误，只能是array对象，举例：[readonly,"boolean",true,""]');
		console.error(parametersArr);
		return false;
	}

	var isValid = true;
	for(var i=0; i<parametersArr.length; i++){
		var parameter = parametersArr[i][0]; //参数
		var type = parametersArr[i][1]; //类型
		var isRequired = false; //是否必填
		if(typeof(parametersArr[i][2]) == 'boolean'){
			if(parametersArr[i][2] == true){
				isRequired = true;
			}
		}
		var info = '';  //反馈信息
		if(typeof(parametersArr[i][3]) == 'string'){
			info = parametersArr[i][3];
		}
		var validObj = false; //输出对象
		if(typeof(parametersArr[i][4])!='undefined'){
			validObj = parametersArr[i][4];
		}
		//验证类型是否合法
		function validType(){
			var typeArr =  type.split(' ');
			var isTypeValid = false;
			var currentType;
			for(var typeI = 0; typeI<typeArr.length; typeI++){
				switch(typeArr[typeI]){
					case 'undefined':
					case 'number':
					case 'string':
					case 'boolean':
					case 'function':
					case 'object':
						if(typeof(parameter)==typeArr[typeI]){
							isTypeValid = true;
						}
						break;
					case 'array':
						if($.isArray(parameter)==true){
							isTypeValid = true;
						}
						break;
					case 'null':
						if(typeof(parameter)!='undefined'){
							if(parameter==null){
								isTypeValid = true;
							}
						}
						break;
					case 'any':
						//任何类型都可以
						if(typeof(parameter)!='undefined'){
							isTypeValid = true;
						}
						break;
					case 'objectNotEmpty':
						//非空的object对象
						if(typeof(parameter)=='object'){
							if($.isEmptyObject(parameter)==false){
								isTypeValid = true;
							}
						}
						break;
				}
			}
			if(isTypeValid == false){
				var parameterStr = parameter;
				if(isFromValidOptions){
					parameterStr = parametersArr[i][3];
				}
				console.error('参数类型错误，'+parameterStr+'的类型应当是：'+type+',当前值是：');
				console.error(parameter);
				if(validObj){
					console.error(validObj);
				}
				isValid = false;
			}
		}
		if(isRequired){
			//如果是必填，先验证
			if(typeof(parameter)=='undefined'){
				console.error(info+' 必填');
				if(validObj){
					console.error(validObj);
				}
				isValid = false;
			}else{
				validType();
			}
		}else{
			if(typeof(parameter)=='undefined'){
				//非必填没填也是对的
			}else{
				//非必填的，填了才要验证
				validType();
			}
		}
	}
	return isValid;
}
//debugerMode下的错误提示信息
nsDebuger.errorInfo = function(infoStr){
	/*传入参数不特定，如果第一个参数是文本，则使用nsalert error提示，所有参数都输出到console.error 
	 * 提示信息中的换行使用 \n
	 * 调试模式关闭则不执行
	 */
	if(debugerMode == false){
		return;
	}
	for(var key in arguments){
		if(key == 0){
			if(typeof(arguments[key])=='string'){
				var alertStr = arguments[key];
				alertStr = alertStr.replace(/\n/g, '<br>');
				nsalert(alertStr, 'error');
			}
		}
		console.error(arguments[key])
    }
}
//表单组件专用报错信息 cy 2018906
nsDebuger.componentFieldErrorInfo = function(componentConfig, options){
	/***
	 * componentConfig:object 表单组件配置
	 * options:{
	 * 	field:错误字段
	 * 	fieldType:该字段应当的数据类型
	 * 	info: 提示显示  换行符号为\n
	 * }
	 */
	if(debugerMode == false){ //调试模式关闭则不执行
		return;
	}
	var config = componentConfig, 			//组件配置文件
		errorField = options.field, 		//错误字段
		errorInfo = options.info, 			//错误信息
		successType = options.fieldType; 	//正确的类型

	var typeInfoStr = '错误';
	var typeStr = typeof(config[errorField]);
	if(typeStr=='object'){
		if($.isArray(config[errorField])){
			typeStr = 'array';
		}
	}
	if(typeStr == successType){
		typeInfoStr = '类型正确';
	}else{
		typeInfoStr = '类型错误, 正确值:'+successType
	}


	var errorInfoStr = '';
	errorInfoStr += '\r\n';
	errorInfoStr += '配置错误: ';
	errorInfoStr += config.id+'.'+errorField;
	errorInfoStr += ' [表单组件:'+config.label+'/'+config.id+']'

	errorInfoStr += '\r\n';
	errorInfoStr += '当前配置: '+config[errorField];
	errorInfoStr += ' [类型:'+ typeStr +' / '+typeInfoStr+')]';

	errorInfoStr += '\r\n';
	errorInfoStr += '提示信息: ';
	errorInfoStr += errorInfo;


	nsDebuger.errorInfo(errorInfoStr, config);
}
//获取XML字符串
nsDebuger.getXML = function(url, returnType, callbackFunc){
	//url:string 
	//returnType:string 		返回类型可以返回xml或者string
	//callbackFunc:function 	回调函数，返回参数为returnType指定的格式
	
	var url = url;
	$.ajax({
		url:url,
		type:'GET',
		dataType:returnType,
		success:function(res){
			//返回结果XML：<shapes name="mxGraph.flowchart"><shape name="Annotation 1" ....></shape></shapes>
			switch(returnType){
				case 'text':
					var text = JSON.stringify(res);
					text = text.replace(/\\r\\n/g,'');
					text = text.replace(/\\"/g, '"');
					callbackFunc(text);
					break;
				case 'xml':
				default:
					callbackFunc(res);
					break;
			}
					
		},
		error:nsVals.defaultAjaxError
	})
}