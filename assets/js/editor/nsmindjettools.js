//mindjetXML文件转成js的json字符串
var nsMindjetToJS = (function(){
	var dictData = {};
	//原始Mindjet XML文件中有意义的标签
	var tags = {
		vaildTextStartStr: 		"<ap:OneTopic>",  	//有效文本开始
		vaildTextEndStr: 		"</ap:OneTopic>",  	//有效文本结束
		replaceStringArray:[
			//带命名空间的XML无法被js处理，删除命名空间的冒号,转化为普通XML标签
			{	
				source:'ap:', 
				target:'ap' 
			},
			{	
				source:'cor:', 
				target:'cor' 
			},
			//格式化中文标点为英文,
			{
				source:'：', 
				target:':' 
			},
			{
				source:'，', 
				target:',' 
			},
			{
				source:'？', 
				target:'?' 
			},
			{
				source:'多选',
				target:'multiple:true',
			},
			{
				source:'接口文档',
				target:'interfaceDoc',
			},
			{
				source:'冗余字段:',
				target:'redundant:',
			},
			{
				source:'冗余字段',
				target:'redundant:true',
			},
			{
				source:'设置行状态',
				target:'rowState:true',
			},
			{
				source:'传value值',
				target:'valuetype:valuename',
			},
			{
				source:'设置对错符号',
				target:'isChangeRightMark:1',
			},
			{
				source:'显示input',
				target:'isShowInput:true',
			},
			{
				source:'表格超链接',
				target:'isTableHref:true',
			},
			{
				source:'显示符号',
				target:'isShowMark:true',
			},
			{
				source:'只显示在表单',
				target:'mindjetTargetType:form',
			},
			{
				source:'只显示在表格',
				target:'mindjetTargetType:table',
			},
			{
				source:'不显示',
				target:'mindjetTargetType:null',
			},
			{
				source:'表单标题',
				target:'element:label',
			},
			{
				source:'type:label',
				target:'element:label',
			},
			{
				source:'label加宽',
				target:'plusClass:width140',
			},
			{
				source:'label超宽',
				target:'plusClass:width200',
			},
			{
				source:'表单文字加强',
				target:'plusClass:strongtext',
			},
			{
				source:'数值类型保留小数',
				target:'numberDecimal',
			},
			{
				source:'货币类型保留小数',
				target:'moneyDecimal',
			},
			{
				source:'参数类型:数字',
				target:'ajaxDataType:number',
			},
			{
				source:'输入正数',
				target:'type:正数',
			},
			{
				source:'输入数字',
				target:'type:数字',
			},
			{
				source:'输入年份',
				target:'type:年份',
			},
			{
				source:'输入月份',
				target:'type:月份',
			},
			{
				source:'输入邮箱',
				target:'type:邮箱',
			},
			{
				source:'输入网址',
				target:'type:网址',
			},
			{
				source:'输入座机',
				target:'type:座机',
			},
			{
				source:'输入正整数',
				target:'type:正整数',
			},
			{
				source:'输入非负整数',
				target:'type:非负整数',
			},
			{
				source:'输入整数',
				target:'type:整数',
			},
			{
				source:'输入负数',
				target:'type:负数',
			},
			{
				source:'输入手机号',
				target:'type:手机号',
			},
			{
				source:'输入身份证号',
				target:'type:身份证号',
			},
			{
				source:'输入银行卡号',
				target:'type:银行卡号',
			},
			{
				source:'输入邮政编码',
				target:'type:邮政编码',
			},
			{
				source:'输入邮编',
				target:'type:邮编',
			},
			{
				source:'输入信用卡号码',
				target:'type:信用卡号码',
			},
			{
				source:'可查可选可输输入框',
				target:'type:可查可选可输',
			}
		],
		projectPrefixStr: '::', //项目名称前缀
		businessFilterToSystem: ['system','default','pages'], 			//业务对象同级中需要过滤掉的系统参数
		fieldPrefixStr: 	['field','基本字段','数据描述','数据'], 				//字段识别标识，必须以这个开头
		functionPrefixStr: 	['base','function','基本方法','方法'], 				//方法识别标识，必须以这个开头
		statePrefixStr: 	['state','状态'], 							//状态识别标识，必须以这个开头
		functionFieldPrefixStr: 	['functionField','展示字段'],  		//function的展示字段标识，必须以这个开头
		functionDataPrefixStr: 		['data','入参'],  		//function的展示字段标识，必须以这个开头
		subDataTypeValue: 	['select', 'select2', 'radio', 'checkbox' ], //有subdata的标签
		getTagTypeByParentType:{  //根据上级决定当前类型的
			root: 			['business', 		'业务对象'],
			field: 			['fieldClass', 		'字段分类'],
			fieldClass: 	['fieldData', 		'字段数据'],
			fieldData: 		['fieldAttr', 		'字段属性'],
			fieldAttr: 		['fieldSubdata',	'字段附属值'],
			function: 		['functionClass', 	'方法分类'],
			functionClass: 	['functionData', 	'方法数据'],
			functionData: 	['functionAttr', 	'方法属性'],
			functionAttr: 	['functionField', 	'方法字段'],
			state: 			['stateClass', 		'状态类别'],
			stateClass: 	['stateFieldClass', '状态字段分类'],
			stateFieldClass:['stateFieldData', 	'状态字段数据'],
			project: 		['projectClass', 	'分类'],
			projectClass: 	['projectData', 	'数据'],
			projectData: 	['projectAttr', 	'属性'],
		},
		getTagDescByType:{  //根据类型写上描述
			field: 			'基本字段',
			function: 		'基本方法',
			info: 			'注释',
			system: 		'系统参数',
			default: 		'系统默认值',
			pages: 			'页面参数',
		},
		fieldDataAttr:{  //field字段的替换，没有使用字典，防止跟定义字段有冲突
			'长度':'fieldlength',
			'是否排序':'orderable',
			'是否搜索':'searchable',
			'字典':'字典?',
			'文本':'text',
			// '数字':'text',
			'是':true,
			'否':false,
			'true':true,
			'false':false,
		},
		fiedDataValid:{   //表单组件验证
			text:{
				id:'string',
				rules:'string',
				placeholder:'string',
				type:'string',
				label:'string',
				fieldLength:'number'
			},
			date:{
				id:'string',
				addvalue:'object',
				type:'string',
				label:'string',
				fieldLength:'number',
				rules:'string',
				format:'string',
				isDefaultDate:'boolean'
			},
			datetime:{
				id:'string',
				type:'string',
				label:'string',
				fieldLength:'number',
				format:'string',
				rules:'string',
			},
			time:{
				id:'string',
				type:'string',
				label:'string',
				fieldLength:'number',
				format:'string',
				rules:'string'
			},
			select:{
				id:'string',
				filltag:'boolean',
				rules:'string',
				type:'string',
				label:'string',
				fieldLength:'number',
				textField:'string',
				valueField:'string',
				subdata:'object',
				isCloseSearch:'number'
			},
			select2:{
				id:'string',
				rules:'string',
				type:'string',
				label:'string',
				fieldLength:'number',
				textField:'string',
				valueField:'string',
				url:'string',
				name:'string',
				dataSrc:'string',
				method:'string',
				subdata:'object'
			},
			textarea:{
				id:'string',
				type:'string',
				label:'string',
				rules:'string',
				fieldLength:'number'
			},
			hidden:{
				id:'string',
				type:'string',
				value:'string',
				fieldLength:'number',
				label:'string'
			},
			radio:{
				id:'string',
				rules:'string',
				type:'string',
				subdata:'object',
				textField:'string',
				valueField:'string',
				fieldLength:'number',
				label:'string'
			},
			'provincelink-select':{
				id:'string',
				rules:'string',
				type:'string',
				fieldLength:'number',
				label:'string'
			},
			checkbox:{
				id:'string',
				label:'string',
				type:'string',
				rules:'string',
				textField:'string',
				valueField:'string',
				subdata:'object',
				url:'string',
				method:'string',
				data:'object'
			},
			switch:{
				id:'string',
				label:'string',
				type:'string',
				rules:'string',
				textField:'string',
				valueField:'string',
				subdata:'object',
				url:'string',
				method:'string',
				data:'object'
			},
			'add-select-input':{ //可查可选可输
				id:'string',
				label:'string',
				type:'string',
				rules:'string',
			},
			uploadImage:{
				id:'string',
				label:'string',
				type:'string',
				rules:'string',
				textField:'string',
				valueField:'string',
			},
			daterangepicker:{ //日期区间
				id:'string',
				type:'string',
				label:'string',
				rules:'string'
			},
			'upload-single':{
				id:'string',
				label:'string',
				type:'string',
				rules:'string',
				textField:'string',
				valueField:'string',
			},
			'uploadSingle':{
				id:'string',
				label:'string',
				type:'string',
				rules:'string',
				textField:'string',
				valueField:'string',
			},
			'tree-select':{
				id:'string',
				rules:'string',
				type:'string',
				label:'string',
				textField:'string',
				valueField:'string',
				url:'string',
				name:'string',
				dataSrc:'string',
				method:'string',
				subdata:'object'
			},
			'treeSelect':{
				id:'string',
				rules:'string',
				type:'string',
				label:'string',
				textField:'string',
				valueField:'string',
				url:'string',
				name:'string',
				dataSrc:'string',
				method:'string',
				subdata:'object'
			},
			colorpickerinput:{
				id:'string',
				label:'string',
				type:'string',
				rules:'string',
			},
			graphicsInput:{
				id:'string',
				label:'string',
				type:'string',
				rules:'string',
			},
			ueditor:{
				id:'string',
				label:'string',
				type:'string',
				rules:'string',
			},
			number:{
				id:'string',
				label:'string',
				type:'string',
				rules:'string',
			},
			daterangeRadio:{},
			expression:{
				id:'string',
				label:'string',
				type:'string',
				rules:'string',
				expressionField:'string',
				expressionField1:'string',
			},
			table:{
				id:'string',
				label:'string',
				type:'string',
				src:'',
				column:'',
			},
			'input-select':{
				id:'string',
				label:'string',
				type:'string',
				column:'',
			},
		},
		redundantField:{
			suffix:'DictName'
		}
	}
	//模板设置
	var nstemplate = {
		screenWidth:$(window).width(),    //屏幕宽
		screenHeight:$(window).height(),	//屏幕高
		menuWidth:240,  //菜单宽
		paddingTwo:30,	//内容显示区域外边距
		labelWidth:100,	//标题栏宽度
		scrollbar:17,	//滚动条看度
		tableDefWidth :30, //表格字段列默认宽度
		tableMinWidth :20,//表格字段列最小宽度
		tableMaxWidth: 300//表格字段列最大宽度
	};
	var defaultValue = {
		formColumn:4,  //默认的表单 column
		columnWidth:100, //默认的表格宽度
	}
	var formatXMLJson = {}; //格式化XML的JSON结果
	var sourceJSJson = {}; 	//用于导出JS的JSON
	var errorLogArray = [];  //错误
	//初始化入口方法
	function init(text, callbackHandler){
		formatXMLJson = {};
		sourceJSJson = {};
		errorLogArray = [];
		// dictData = nsMindjetToJSTools.dictData;
		dictData = nsMindjetToJSTools.defaultDict;
		//text 是upload file 对象中的原始文本
		//转换MindJet XML文本对象为可用的DOM XML对象
		var mindjetXMLStr = getXMLByText(text);
		//初步处理，识别要用的数据
		formatXMLJson = getJsonByXML(mindjetXMLStr);
		//设置formatXMLJson的默认的系统属性
		setSystemDefaultAttr();
		//获取可用于保存为JS的json对象
		sourceJSJson = getSourceJSJson(formatXMLJson);
		//暴露数据结果用于其他操作
		this.formatXMLJson = formatXMLJson;
		this.sourceJSJson = sourceJSJson;
		this.xmlContent = text;
		//nsProject.init(sourceJSJson[formatXMLJson.englishName]);
		if(typeof(callbackHandler)=='function'){
			callbackHandler({
				formatXMLJson:this.formatXMLJson,
				sourceJSJson: this.sourceJSJson,
			});
		}
	}
	//获取格式化结果 暂时不要用这个方法，有问题
	function getResult(xmlText){
		/** 
		 * 	入参：xmlText 思维导图XML文件的text
		 * 	result:{
		 * 		formatXMLJson:{},  带有parent和属性描述的对象 不是JSON
		 * 		sourceJSJson:{},   可以保存到数据库的JSON文件
		 * 	 }
		 **/
		init(xmlText, function(result){
			return {
				formatXMLJson: result.formatXMLJson,
				sourceJSJson:  result.sourceJSJson,
			}
		});
		
	}
	//VO导入使用的入口方法
	function initByVoSource(voJson){
		formatXMLJson = voJson;
		//设置formatXMLJson的默认的系统属性
		setSystemDefaultAttr();
		//获取可用于保存为JS的json对象
		sourceJSJson = getSourceJSJson(formatXMLJson);
		//暴露数据结果用于其他操作
		this.formatXMLJson = formatXMLJson;
		this.sourceJSJson = sourceJSJson;
		//this.xmlContent = text;
	}
	//原始文本初步处理
	function getXMLByText(xmlTextStr){
		//xmlTextStr 原始文本
		//return 截取有效文本，并完成替换后的文本

		//截取所需要的文本，位于XML的<ap:OneTopic>标签内，仅一个该标签
		var startIndex = xmlTextStr.indexOf(tags.vaildTextStartStr) + tags.vaildTextStartStr.length;
		var endIndex = xmlTextStr.indexOf(tags.vaildTextEndStr);
		var usableXMLTextStr = xmlTextStr.substring(startIndex, endIndex);
		//字符串替换操作
		for(var rsI = 0; rsI<tags.replaceStringArray.length; rsI++){
			var replaceRep = new RegExp(tags.replaceStringArray[rsI].source, 'g');
			usableXMLTextStr = usableXMLTextStr.replace(replaceRep, tags.replaceStringArray[rsI].target);
		}
		return usableXMLTextStr;
	}
	//返回mindjet的文本
	function getXMLTextByDom($xmlDom){
		var text = $xmlDom.children("apText").attr("PlainText");
		text = $.trim(text);
		return text;
	}
	//返回中英文名称{chinese:'', english:''}
	function getNameByDom($xmlDom, callNumber){
		var textStr = getXMLTextByDom($xmlDom)  	//读取文本
		var patternIsChinese = /[\u4e00-\u9fa5]/g; 	//是否中文的正则表达式
		var patternIsUpperCaseLetter = /[A-Z]/g; 	//是否大写的正则表达式
		var nameObj = {
			error:false  //用于返回的名称对象,默认没有出错
		};
		
		//如果是两行的，则认为必须是一行中文一行英文，不进行字典翻译，默认第一行是中文
		if(textStr.indexOf('\n')>0){
			//有回车判断一下那个是中文
			var textStrArray = textStr.split('\n');
			//超出两个就是有问题
			if(textStrArray.length>2){
				setErrorLog($xmlDom,'不支持两行以上文字:'+textStr);
			}
			//只处理头两个
			//去掉前后两端空格
			textStrArray[0] = $.trim(textStrArray[0]);
			textStrArray[1] = $.trim(textStrArray[1]); 
			var firstIsChinese = patternIsChinese.test(textStrArray[0]);  //第一行是否中文
			var secondIsChinese = patternIsChinese.test(textStrArray[1]); //第二行是否中文
			//如果第一行是中文则看看第二行是不是英文，如果是，就把第二行设为英文，如果都不是则报错
			if(firstIsChinese){
				if(!secondIsChinese){
					nameObj.chinese = textStrArray[0];
					nameObj.english = getLowerCaseLetter(textStrArray[1]);
					// nameObj.english = textStrArray[1];
				}else{
					setErrorLog($xmlDom,'两行都有中文，无法找到英文名称:'+textStr);
					nameObj.chinese = textStrArray[0];
					nameObj.english = 'unname_'+ callNumber;
					nameObj.error = true;
				}
			}else{
				nameObj.chinese = textStrArray[1];
				nameObj.english = getLowerCaseLetter(textStrArray[0]);
				// nameObj.english = textStrArray[0];
			}
			return nameObj;
		}
		//获取字典对应的英文名
		function getEnglishWord(){
			var englishStr = '';
			if(typeof(dictData[textStr])=='string'){
				englishStr = dictData[textStr];
			}else{
				setErrorLog($xmlDom,'字典缺失:'+textStr+' @ unname'+callNumber, 'dict-error');
				englishStr = 'unname'+ callNumber;
				nameObj.error = true;
			}
			return englishStr
		}
		//首字母小写 --- 大写：转换小写并报错 --lyw
		function getLowerCaseLetter(_textStr){
			var textStrEnglishFirst = _textStr.substring(0,1);
			var isUpperCaseLetter = patternIsUpperCaseLetter.test(textStrEnglishFirst);
			if(isUpperCaseLetter){
				setErrorLog($xmlDom,'不是驼峰格式：'+_textStr, 'letter-warn');
				_textStr = _textStr.replace(_textStr,function(word) {   
					return word.substring(0,1).toLowerCase() +  word.substring(1);   
				});
			}
			return _textStr;
		}
		//只有一行文字则先判断是否key:value类型的，只翻译前面
		if(textStr.indexOf(':')>-1){
			textStr = textStr.split(':')[0];
		}
		//没回车看看是不是中文
		if(patternIsChinese.test(textStr)){
			//如果是中文 需要对照字典获取英文名称
			nameObj.chinese = textStr;
			nameObj.english = getEnglishWord();
		}else{
			//如果是英文，则中英文全是这个
			nameObj.chinese = textStr;
			nameObj.english = getLowerCaseLetter(textStr);
			// nameObj.english = textStr;
		}

		return nameObj;
	}
	//获取节点属性
	function getAttrByDom($xmlDom, xmlJson, levelNum, indexNum, outputSourceJson){
		//$xmlDom: 	当前要解析的XML节点
		//xmlJson: 	用来处理当前节点的object，一般是父对象
		//levelNum: 第几层
		//indexNUm: 执行次数
		//outputSourceJson: 最外层的object
		var text = getXMLTextByDom($xmlDom); //文本
		var nameStr = text;
		var type = ''; //当前数据类型
		if(indexNum == 1){

			//第一次执行，所以当前为根 
			if(text.indexOf('::')==0){
				//如果以"::项目名称"开头，截取项目名称
				var projectNameStartIndex = text.indexOf(tags.projectPrefixStr)+2;
				var projectNameEndIndex = text.indexOf('\n');
				if(projectNameEndIndex == -1){
					projectNameEndIndex = text.length;
				}
				var projectName = text.substring(projectNameStartIndex, projectNameEndIndex);

				outputSourceJson.englishName = projectName;
				outputSourceJson.chineseName = text;
			}else{
				//根就是项目
				var nameObj = getNameByDom($xmlDom, indexNum);
				outputSourceJson.englishName = nameObj.english;
				outputSourceJson.chineseName = nameObj.chinese;
			}
			type = 'root';
			typeDesc = '根';
			nameStr = outputSourceJson.englishName;
		}else{
			if(typeof(xmlJson._nsproperty)!='object'){
				//不能处理的数据
				var errorStr = '无法识别的数据:'+text+' @'+indexNum+ ' 位于第'+levelNum+'层';
				console.error(errorStr);
				setErrorLog($xmlDom,errorStr, 'mindjet-error');
				return false;
			}
			var parentType = xmlJson._nsproperty.type; //父元素的数据类型
			if(typeof(tags.getTagTypeByParentType[parentType])=='object'){
				//如果是根据上级就可以决定当前类型的节点，则直接处理
				type = tags.getTagTypeByParentType[parentType][0];
				typeDesc = tags.getTagTypeByParentType[parentType][1];
			}else{
				//不能根据上级决定当前的信息
				var textArray = text.split('\n');
				if(parentType == 'business'){
					for(var textI = 0; textI<textArray.length; textI++){
						if(tags.fieldPrefixStr.indexOf(textArray[textI])>-1){
							//包含如下'field','基本字段','数据描述'，则认为是field
							type = 'field';
							break;
						}
						if(tags.functionPrefixStr.indexOf(textArray[textI])>-1){
							//包含如下['base','function','基本方法']，则认为是function
							type = 'function';
							break;
						}
						if(tags.statePrefixStr.indexOf(textArray[textI])>-1){
							//包含如下['state','状态']，则认为是state
							type = 'state';
							break;
						}
					}
				}else{
					type = 'info';
				}
				//读取类型备注
				typeDesc = tags.getTagDescByType[type];
			}
		}

		var property = {
			name:nameStr, 					//名字
			type:type, 						//类型：root(根),业务对象，数据描述（基本数据），数据分类，字段，基本方法
			typeDesc:typeDesc,				//描述
			text:text, 						//文本
			level: levelNum, 				//层级
			index: indexNum, 				//执行顺序
			parent:xmlJson, 				//父对象
		}
		//生成键值对数据对象
		function setKeyValueAttr(_text, _property){
			var textArr = _text.split(':');
			var textKeyStr = textArr[0];

			var textValueStr = '';

			for(var index=1;index<textArr.length;index++){
				textValueStr += textArr[index] + ":";
			}
			textValueStr = textValueStr.substring(0,textValueStr.length-1);
			if(_property.type == 'fieldAttr'){
				if(tags.fieldDataAttr[textKeyStr]){
					textKeyStr = tags.fieldDataAttr[textKeyStr];
				}
				if(tags.fieldDataAttr[textValueStr]){
					textValueStr = tags.fieldDataAttr[textValueStr];
				}
			}
			switch(textKeyStr){
				case 'isCloseBtn':
				case 'isCloseWindow':
				case 'isSendOutFields':
					if(textValueStr == 'true'){
						textValueStr = true;
					}else{
						if(textValueStr == 'false'){
							textValueStr = false;
						}else{
							console.error('isCloseBtn:'+textValueStr);
							setErrorLog(_text,'isCloseBtn类型错误', 'isCloseBtn-error');
						}
					}
					break;
			}
			_property.name = textKeyStr;
			_property.key = textKeyStr;
			_property.value = textValueStr;
		}
		//键值对类型的数据
		switch(type){
			case 'fieldAttr':
				var isHaveKeyValue = text.indexOf(':')>-1; //是否是key value 格式
				if(isHaveKeyValue){
					setKeyValueAttr(text, property);
				}else{
					//fieldAttr里如果没有:，则认为是手工指定的id
					property.name = text;
					property.key = 'id';
					property.value = text;
				}
				break;
			case 'functionAttr':
				//方法属性识别了两个特殊的展示字段和参数 functionField data
				var isHaveKeyValue = text.indexOf(':')>-1; //是否是key value 格式
				if(isHaveKeyValue){
					setKeyValueAttr(text, property);
				}else{
					//如果是方法所属的展示字段 识别方式为 展示字段 functionField
					if(tags.functionFieldPrefixStr.indexOf(text)>-1){
						property.name = text;
						property.key = 'functionField';
						property.value = {};
					//如果是data 识别方式为 data 参数
					}else if(tags.functionDataPrefixStr.indexOf(text)>-1){
						property.name = text;
						property.key = 'data';
						property.value = {};
					}else{
						//fieldAttr里如果没有:，则认为是url
						if(xmlJson.url){
							var errorStr = '方法属性识别出错，不是键值对方式的默认为url，当前值：'+text+'，无法设置为url';
							console.error(errorStr);
							console.error(xmlJson);
							setErrorLog($xmlDom,errorStr, 'mindjet-error');
						}else{
							property.name = text;
							property.key = 'url';
							property.value = text;
						}
					}
					
				}
				break;
			case 'projectData':
			case 'projectAttr':
				var isHaveKeyValue = text.indexOf(':')>-1; //是否是key value 格式
				if(isHaveKeyValue){
					setKeyValueAttr(text, property);
				}else{
					property.key = property.name;
					property.value = {};
				}
				break;
			case 'fieldSubdata':
				var isHaveKeyValue = text.indexOf(':')>-1; //是否是key value 格式  ---lyw
				if(isHaveKeyValue){
					setKeyValueAttr(text, property);
				}else{
					property.key = property.name;
					property.value = {};
				}
				break;
			default:
				break;
		}
		//根据类型查字典转换名字
		switch(type){
			case 'fieldAttr':
			case 'functionAttr':
			case 'info':
			case 'fieldSubdata':
				//fieldAttr / info/ fieldSubdata /functionAttr不需要转换中英文
				break;

			case 'field':
			case 'function':
			case 'state':
				property.name = type;
				property.chineseName = type; 				//中文名称
				property.englishName = property.typeDesc; 	//英文名称
				break;

			default:
				var nameObj = getNameByDom($xmlDom, indexNum); //获取名字 indexNum是当前索引值，用于无法找到英文名称的异常处理
				property.name = nameObj.english;
				property.chineseName = nameObj.chinese; 	//中文名称
				property.englishName = nameObj.english; 	//英文名称
				if(property.key){
					property.key = property.name;
				}
						
				//业务对象同级还有三个系统对象
				if(type=='business'){
					if(tags.businessFilterToSystem.indexOf(property.name)>-1){
						property.type = 'project',
						property.typeDesc = tags.getTagDescByType[property.name]; 		//描述
						property.chineseName = tags.getTagDescByType[property.name]; 	//中文名称
						property.englishName = property.name; 							//英文名称						
					}
				}
				break;

		}
		return property;
	}
	//转换XML到有效的JSON数据，清除无用属性标签
	function getJsonByXML(xmlTextStr){
		var xml = $.parseXML(xmlTextStr);
		$xml = $(xml);
		var indexNum = 0;
		var level = 0;
		var fieldArray = []
		//递归循环获取对象
		function getObject($xmlDom, xmlJson, levelNum){
			/*	$xmlDom 	xml的DOM节点对象
			 *	xmlJson 	同步生成的相关JSON对象
			 *	levelNum 	当前层级
			 */
			indexNum ++; //索引
			var property = getAttrByDom($xmlDom, xmlJson, levelNum, indexNum, outputSourceJson);			
			
			var json = {};
			switch(property.type){
				case 'fieldAttr':
				case 'functionAttr':
				case 'projectData':
				case 'projectAttr':
					json._nsproperty = property;
					//如果是value是对象则传递当前对象，有下一级
					if(typeof(property.value)=='object'){
						xmlJson[property.key] = json;
					}else{
						//不是对象
						if(property.key == "data"){
							// xmlJson[property.key] = JSON.parse(property.value);
							xmlJson[property.key] = nsMindjetToJSTools.getDataObj(property.value);
							if(typeof(xmlJson[property.key]) == "string"){
								xmlJson[property.key] = {};
								setErrorLog(property, property.key+'配置类型为对象', 'data-error');
							}
						}else{
							xmlJson[property.key] = property.value;
						}
						if(typeof(xmlJson._nsproperty._attribute)!='object'){
							xmlJson._nsproperty._attribute = {};
						}
						xmlJson._nsproperty._attribute[property.key] = json;
					}
					
					break;
				case 'fieldSubdata':
					//如果是subdata字段则将属性添加到field字段的subdata里面
					if(typeof(xmlJson._nsproperty.parent.subdata)!='object'){
						xmlJson._nsproperty.parent.subdata = [];
						xmlJson._nsproperty.parent._nsproperty.subdata = [];
					}
					//'select select2 radio checkbox 默认值为value 和 text
					//如果有：号，text是冒号前边，value是：号后边   ---lyw 
					if(property.text.indexOf(":")>0){
						xmlJson._nsproperty.parent.subdata.push({
							value: property.value, 
							text:property.name
						});
					}else{
						xmlJson._nsproperty.parent.subdata.push({
							value: xmlJson._nsproperty.parent.subdata.length, 
							text:property.name
						});
					}
					// xmlJson._nsproperty.parent.subdata.push({
					// 	value: xmlJson._nsproperty.parent.subdata.length, 
					// 	text:property.text
					// });
					xmlJson._nsproperty.parent._nsproperty.subdata.push(property);
					break;
				default:
					//默认是上下级的关系
					xmlJson[property.name] = json;
					json._nsproperty = property;
					break;
			}
			
			//是否有下级目录是第一层判断
			var isHaveChildren = $xmlDom.children().children('apTopic').length > 0;
			//如果有下一层，还要看是否

			//如果存在下级对象则继续执行递归操作
			if(isHaveChildren){
				for(var i = 0; i< $xmlDom.children().children('apTopic').length; i++){
					getObject(
						$xmlDom.children().children('apTopic').eq(i), 
						json,
						levelNum+1
					);
				}
			}else{
				//没有下一级暂不处理
			}
		}
		var outputSourceJson = {};
		getObject($xml.children('apTopic'), outputSourceJson, level);
		return outputSourceJson;
	}
	function setSystemDefaultAttr(){
		var projectJson = formatXMLJson[formatXMLJson.englishName];
		//三个默认配置参数 
		for(var stI = 0; stI<tags.businessFilterToSystem.length; stI++){
			if(typeof(projectJson[tags.businessFilterToSystem[stI]])!='object'){
				var systemObj = {};
				systemObj._nsproperty = {
					englishName:tags.businessFilterToSystem[stI],
					chineseName:tags.getTagDescByType[tags.businessFilterToSystem[stI]],
					text:tags.businessFilterToSystem[stI],
					name:tags.getTagDescByType[tags.businessFilterToSystem[stI]],
					type:tags.businessFilterToSystem[stI],
					typeDesc:tags.getTagDescByType[tags.businessFilterToSystem[stI]],
					index:100000+stI,
					level:2,
				}
				projectJson[tags.businessFilterToSystem[stI]] = systemObj;
			}
		}
		//前缀
		if(typeof(projectJson.system.prefix)!='object'){
			projectJson.system.prefix = {};
		}
		//rootPath //这个对象要在项目初始化时候重新生成
		if(typeof(projectJson.system.prefix.root)!='string'){
			projectJson.system.prefix.root = nsVals.getRootPath();
		}
		//字典路径
		if(typeof(projectJson.system.prefix.dict)!='string'){
			projectJson.system.prefix.dict = '/basDictController/getDictByTableName?tableName=';
		}
		//user 使用者信息
		if(typeof(projectJson.system.user)!='object'){
			projectJson.system.user = {};
		}
		//ajax默认配置 dataSrc:'rows'
		if(typeof(projectJson.default.ajax)!='object'){
			projectJson.default.ajax = {
				dataSrc:'rows',
				type:'POST',
				dataType:'json',
				defaultData:{}
			};
		}else{
			if(typeof(projectJson.default.ajax.dataSrc)!='string'){
				projectJson.default.ajax.dataSrc = 'rows';
			}
		}
		//默认的页面对象 根据业务对象建立分类
		for(bueinessObjKey in projectJson){
			if(bueinessObjKey == '_nsproperty'){
				continue;
			}
			if(typeof(projectJson[bueinessObjKey]._nsproperty)!='object'){
				//没有初始化的业务对象
			}else{
				if(projectJson[bueinessObjKey]._nsproperty.type == 'business'){
					if(typeof(projectJson.pages[bueinessObjKey])!='object'){
						projectJson.pages[bueinessObjKey] = {};
					}
				}
			}
			
		}
	}
	//清理无用属性，获取可导出的项目对象
	function getSourceJSJson(sourceObj){
		var jsJson = {};
		jsJson[sourceObj.englishName] = {};
		var fields = {};
		
		function setCloneAttr(_sourceObj, _cloneObj){
			for(key in _sourceObj){
				//_nsproperty不需要复制
				if(key=='_nsproperty'){
					continue;
				}
				//复制有需要的对象
				if(typeof(_sourceObj[key])=='object'){
					if(typeof(_sourceObj[key]._nsproperty)=='object'){
						//有属性的原件需要处理
						switch(_sourceObj[key]._nsproperty.type){
							case 'functionData':
								if(typeof(_sourceObj[key].suffix)!="undefined"&&_sourceObj[key].suffix!=""){
									_sourceObj[key].url = _sourceObj[key].suffix;
								}
								if(typeof(_sourceObj[key].defaultMode)!="undefined"&&_sourceObj[key].defaultMode=="excelImport"){
									_cloneObj[key] = {};
									setCloneAttr(_sourceObj[key], _cloneObj[key]);
								}else{
									if(typeof(_sourceObj[key].url)=="undefined"||_sourceObj[key].url==""){
										console.error('无法找到有效URL的方法');
										console.error(_sourceObj[key]);
									}else{
										_cloneObj[key] = {};
										setCloneAttr(_sourceObj[key], _cloneObj[key]);
									}
								}
								break;
							case 'field':
								//field需要转成数组
								//_cloneObj.field = [];
								_cloneObj.fieldDatas = {};
								setCloneAttr(_sourceObj[key], _cloneObj);
								break;
							case 'fieldClass':
								//fieldClass略过
								setCloneAttr(_sourceObj[key], _cloneObj);
								break;
							case 'fieldData':
								//fieldData 插入到field里，然后继续循环
								var cloneFieldData = {
									id:key,
									index:_sourceObj[key]._nsproperty.index,
									name:_sourceObj[key]._nsproperty.chineseName,
									_sourceObj:_sourceObj[key],
									//fieldOriginalClass:_sourceObj[key]._nsproperty.parent._nsproperty.name, //field原始分类
								};
								_cloneObj.fieldDatas[key] = cloneFieldData;
								setCloneAttr(_sourceObj[key], cloneFieldData);
								break;
							case 'function':
								//转成base
								_cloneObj.controller = {};
								setCloneAttr(_sourceObj[key], _cloneObj.controller);
								break;
							case 'stateFieldClass':
								if(key.indexOf("tab") == 0){
									if(typeof(_cloneObj.tabs) != "object"){
										_cloneObj.tabs = {};
									}
									setCloneAttr(_sourceObj[key], _cloneObj.tabs);
								}else{
									_cloneObj[key] = {};
									setCloneAttr(_sourceObj[key], _cloneObj[key]);
								}
								break;
							case 'stateFieldData':
								if(typeof(_cloneObj[key]) == "object"){
									setErrorLog(_sourceObj[key], _sourceObj._nsproperty.parent._nsproperty.chineseName+'的'+key+'状态字段重复', 'state-error');
									break;
								}
								_cloneObj[key] = {};
								_cloneObj[key]["mindjetIndexState"] = _sourceObj[key]._nsproperty.index;
								//判断状态类别下（field层）只有中文时 处理tab页 （mindjetTabName:'基础信息',mindjetTabNamePosition:556,）
								if(_sourceObj._nsproperty.englishName.indexOf("tab") == 0){
									_cloneObj[key]["mindjetTabName"] = _sourceObj._nsproperty.chineseName;
									_cloneObj[key]["mindjetTabNamePosition"] = _sourceObj._nsproperty.index;
								}
								break;
							case 'functionField':
								_cloneObj[key] = {};
								_cloneObj[key]["mindjetIndex"] = _sourceObj[key]._nsproperty.index;
								break;
							default:
								_cloneObj[key] = {};
								setCloneAttr(_sourceObj[key], _cloneObj[key]);
								break;
						}
					}else{
						//不需要继续循环的类型
						var isArray = $.isArray( _sourceObj[key]);
						if(isArray){
							_cloneObj[key] = $.extend(true, [], _sourceObj[key])
						}else{
							_cloneObj[key] = $.extend(true, {}, _sourceObj[key])
						}
					}
					
				}else{
					//如果是url则判断是否是真的URL，包含http则认为是url，不是则认为是后缀 suffix
					var isUrlSuffix = false 
					if(key == 'url'){
						if(typeof(_sourceObj[key])=='string'){
							if(_sourceObj[key].indexOf('http')==0){
								//完整合法的url字符串
							}else{
								isUrlSuffix = true;
							}
						}
					}
					if(isUrlSuffix){
						var sourceUrl = _sourceObj.url;
						if(sourceUrl.indexOf(' ')>-1){
							sourceUrl = sourceUrl.replace(/ /g, '')
						}
						_cloneObj.suffix = sourceUrl;
					}else{
						_cloneObj[key] = _sourceObj[key];
					}
				}
			}
		}
		setCloneAttr(sourceObj[sourceObj.englishName], jsJson[sourceObj.englishName]);
		
		for(businessKey in jsJson[sourceObj.englishName]){
			//根据fieldData初始化fields 和 columns对象 表单组件和表格头
			if(jsJson[sourceObj.englishName][businessKey].fieldDatas){
				var businessObj = jsJson[sourceObj.englishName][businessKey];
				setFieldData(businessObj);
				delete jsJson[sourceObj.englishName][businessKey].fieldDatas;
			}
			//初始化function的分类等属性
			if(jsJson[sourceObj.englishName][businessKey].controller){
				var businessObj = jsJson[sourceObj.englishName][businessKey];
				setFunctionAttr(businessObj);
			}
		}
		deleteEmptyObject(jsJson);
		//配置品牌的 ---可查可选可输
		for(var keyfirst in jsJson){
			for(var keysecond in jsJson[keyfirst]){
				if(jsJson[keyfirst][keysecond]){
					for(var keythird in jsJson[keyfirst][keysecond]){
						if(jsJson[keyfirst][keysecond][keythird]){
							for(var keyfourth in jsJson[keyfirst][keysecond][keythird]){
								if(jsJson[keyfirst][keysecond][keythird][keyfourth]["type"] == "add-select-input"){ //找到可查可选可输的对象
									var addSelectInput = jsJson[keyfirst][keysecond][keythird][keyfourth];
									//判断是否有列表方法，新增方法，显示字段
									if(typeof(addSelectInput["列表方法"]) == "undefined" || typeof(addSelectInput["新增方法"]) == "undefined" || typeof(addSelectInput["显示字段"]) == "undefined"){
										console.error(addSelectInput);
										console.error("可查可选可输--表单未输入：列表方法 或 新增方法 或 显示字段");
									}else{
										var listBaseArr = addSelectInput["列表方法"].split("/");
										var addBaseArr = addSelectInput["新增方法"].split("/");
										var visibleArr = addSelectInput["显示字段"].split("/");
										//查找地址 //返回地址和对象名
										function getAddress(arrayAddress){
											for(var keyFirst in sourceObj){
												if(typeof(sourceObj[keyFirst])=="object"){
													for(var keySecond in sourceObj[keyFirst]){
														if(keySecond!="_nsproperty" && sourceObj[keyFirst][keySecond]["_nsproperty"].chineseName == arrayAddress[0]){
															if(arrayAddress.length == 3){
																for(var keyThird in sourceObj[keyFirst][keySecond].function){
																	if(keyThird!="_nsproperty" && sourceObj[keyFirst][keySecond]["function"][keyThird]["_nsproperty"].chineseName == arrayAddress[1]){
																		for(var keyFourth in sourceObj[keyFirst][keySecond].function[keyThird]){
																			if(keyFourth!="_nsproperty" && sourceObj[keyFirst][keySecond]["function"][keyThird][keyFourth]["_nsproperty"].chineseName == arrayAddress[2]){
																				// console.log(sourceObj[keyFirst][keySecond]["function"][keyThird][keyFourth]["url"]);
																				return [sourceObj[keyFirst][keySecond]["_nsproperty"].englishName,sourceObj[keyFirst][keySecond]["function"][keyThird][keyFourth]["url"]];
																			}
																		}
																	}
																}
															}else{
																if(arrayAddress.length == 2){
																	for(var keyThird in sourceObj[keyFirst][keySecond].state){
																		if(keyThird!="_nsproperty" && sourceObj[keyFirst][keySecond]["state"][keyThird]["_nsproperty"].chineseName == arrayAddress[1]){
																			var vidibleArray = [];
																			for(var keyFourth in sourceObj[keyFirst][keySecond]["state"][keyThird].field){
																				if(keyFourth!="_nsproperty"){
																					var keyFourthName = keyFourth.replace(".","-");
																					vidibleArray.push(keyFourthName);
																				}
																			}
																			// console.log([sourceObj[keyFirst][keySecond]["_nsproperty"].englishName,vidibleArray]);
																			return [sourceObj[keyFirst][keySecond]["_nsproperty"].englishName,vidibleArray];
																		}
																	}
																}else{
																	console.error("地址填写错误");
																}
															}
														}
													}
												}
											}
										}
										var listBase = getAddress(listBaseArr)[1];
										var addBase = getAddress(addBaseArr)[1];
										var visible = getAddress(visibleArr)[1];
										var visibleObj = getAddress(visibleArr)[0];
										var localDataConfig = [];
										var visibleIndex = 1;
										//根据找到的数组 和 对象名 查找对应的列名
										for(var index=0;index<visible.length;index++){
											if(typeof(jsJson[keyfirst][visibleObj].columns[visible[index]]) == "object"){
												if(jsJson[keyfirst][visibleObj].columns[visible[index]].mindjetType){
													if(jsJson[keyfirst][visibleObj].columns[visible[index]].mindjetType == "number"){
														var setType = "number";
													}else{
														var setType = "string";
													}
												}else{
													var setType = "string";
												}
												var localDataConfigOBJ = {
													key:jsJson[keyfirst][visibleObj].columns[visible[index]].field,
													title:jsJson[keyfirst][visibleObj].columns[visible[index]].title,
													type:setType,
													visible:visibleIndex++,
												};
												if(jsJson[keyfirst][visibleObj].columns[visible[index]].width){
													localDataConfigOBJ.width = jsJson[keyfirst][visibleObj].columns[visible[index]].width;
												}
												localDataConfig.push(localDataConfigOBJ);
											}
										}
										// console.log(localDataConfig);
										// addSelectInput.type = "add-select-input";
										
										addSelectInput.localDataAjax = listBase;
										addSelectInput.localDataAjaxType = 'get';
										addSelectInput.addAjax = addBase;
										addSelectInput.addAjaxType = 'get';
										addSelectInput.localDataConfig = localDataConfig;
										addSelectInput.listHandler = function(data){console.log(data)};
										delete addSelectInput["列表方法"];
										delete addSelectInput["新增方法"];
										delete addSelectInput["显示字段"];
									}
								}
							}
						}
					}
				}
			}
		}
		if(errorLogArray.length>0){
			console.log(errorLogArray);
		}
		return jsJson;
	}
	//循环删除空对象 （基本方法中的空对象）
	function deleteEmptyObject(jsJson){
		for(var firstKey in jsJson){
			for(var secondKey in jsJson[firstKey]){
				for(var thirdKey in jsJson[firstKey][secondKey]){
					if(thirdKey == "controller"){
						for(var fourKey in jsJson[firstKey][secondKey][thirdKey]){
							if($.isEmptyObject(jsJson[firstKey][secondKey][thirdKey][fourKey])){
								delete jsJson[firstKey][secondKey][thirdKey][fourKey];
							}
						}
					}
				}
			}
		}
	}
	//处理fields对象
	function setFieldData(businessObj){
		var projectJson = formatXMLJson[formatXMLJson.englishName];
		var fieldDatas = businessObj.fieldDatas;
		businessObj.fields = {};
		businessObj.columns = {};
		for(fieldKey in fieldDatas){
			var fieldData = fieldDatas[fieldKey];

			//判断显示位置或不显示
			fieldData.mindjetTargetType = typeof(fieldData.mindjetTargetType) == "string" ? fieldData.mindjetTargetType : "all";
			//设置参数类型的默认值 --- text文本
			fieldData.ajaxDataType = typeof(fieldData.ajaxDataType) == "string" ? fieldData.ajaxDataType : "text";

			var typeStr = fieldData.type;
			fieldData.mindjetType = typeStr;  //原始类型
			fieldData.mindjetClass = fieldData._sourceObj._nsproperty.parent._nsproperty.englishName;  //字段所属分类 业务字段 操作字段

			if(typeof(typeStr)!='string'){
				//如果没有定义类型判断是否为表单标题 即：element:label
				if(typeof(fieldData.element) == "string"){
					fieldData.mindjetTargetType = 'form';
				}else{
					//如果没有定义类型，则默认为text，加上提醒
					fieldData.type = 'text';
					fieldData.mindjetType = '';
					setErrorLog(fieldData, fieldData.name+'的类型设置为默认:text', 'type-warn');
				}
			}else{
				//是字符串，则看看是否合法可用
				//去掉两头的空格
				if($.trim(typeStr)!=typeStr){
					fieldData.type = $.trim(typeStr);
					typeStr = fieldData.type;
				}
				//如果type == '--' 或者  '-' 就代表跳过该字段
				if(fieldData.type == '--' || fieldData.type == '-'){
					continue;
				}
				//nsMindjetToJSTools.formTypeDict 是要转中英文的
				if(typeof(nsMindjetToJSTools.formTypeDict[typeStr])=='string'){
					//type:正数时 根据type设置type和rules
					if(nsMindjetToJSTools.formTypeDict[typeStr].indexOf(".")>-1){
						var typeRulesArr = nsMindjetToJSTools.formTypeDict[typeStr].split(".");
						fieldData.type = typeRulesArr[0];
						if(typeof(fieldData.rules)=="string"){
							fieldData.rules = fieldData.rules + " "+typeRulesArr[1];
						}else{
							fieldData.rules = typeRulesArr[1];
						}
						//用于表格 设置小数位数和货币类型等 设置表格的formatType
						switch(typeRulesArr[1]){
							case 'number':
								fieldData.inputColumnsType = typeRulesArr[1];
								break;
						}
						//用于表格 设置小数位数和货币类型等 设置表格的formatType
						if(typeRulesArr[2]){
							switch(typeRulesArr[2]){
								case 'money':
									fieldData.inputColumnsType = typeRulesArr[2];
									break;
							}
						}
					}else{
						fieldData.type = nsMindjetToJSTools.formTypeDict[typeStr];
						typeStr = fieldData.type;
					}
				}
				//处理字典?***
				if(typeStr.indexOf('字典?')>-1){
					fieldData.mindjetType = 'dict';
					var dictArguments = typeStr.substr(typeStr.indexOf('字典?')+3, typeStr.length);
					typeStr = 'select';
					fieldData.type = 'select';
					if(fieldData.multiple){
						typeStr = 'select2';
						fieldData.type = 'select2';
					}
					if(fieldData.userType){
						switch(fieldData.userType){
							case 'radio':
								typeStr = 'radio';
								fieldData.type = 'radio';
								break;
							case 'checkbox':
								typeStr = 'checkbox';
								fieldData.type = 'checkbox';
								break;
							case 'select2':
								typeStr = 'select2';
								fieldData.type = 'select2';
								break;
						}
					}
					fieldData.dictArguments = dictArguments;
					fieldData.textField = 'value';
					fieldData.valueField = 'id';
					delete fieldData.subdata;
					//console.warn(formatXMLJson)
					//console.log(fieldData);
					if(dictArguments == ''){
						setErrorLog(fieldData, fieldData.name+' 未设置字典参数', 'type-error');
					}
				}
				//处理数据?***
				if(typeStr.indexOf('数据?')>-1){
					fieldData.mindjetType = 'data';
					//是否数据类型的没有参数
					var dictArguments = typeStr.substr(typeStr.indexOf('数据?')+3, typeStr.length);
					typeStr = 'select';
					fieldData.type = 'select';
					if(fieldData.multiple){
						typeStr = 'select2';
						fieldData.type = 'select2';
					}
					fieldData.dataSrc = 'rows';
					fieldData.urlSuffix = projectJson.system.prefix.dict;
					fieldData.urlDictArguments = dictArguments;
					//url参数是临时参数 真正项目初始化时候要更新
					//fieldData.url = projectJson.system.prefix.root + fieldData.urlSuffix + dictArguments;
					fieldData.url = '/NPE/uiTest/getJson';
					fieldData.data = {keyName:'DICT_DEMO_DATA'};
					fieldData.method = 'post';
					fieldData.textField = 'name';
					fieldData.valueField = 'name';
					if(fieldData.valuetype == "valuename"){
						fieldData.textField = 'name';
						fieldData.valueField = 'value';
					}
					delete fieldData.subdata;
					//console.warn(formatXMLJson)
					//console.log(fieldData);
					if(dictArguments == ''){
						setErrorLog(fieldData, fieldData.name+' 未设置数据参数', 'type-error');
					}
				}

			}
			typeStr = fieldData.type;
			//调用tags的验证对象验证对象是否正确
			if(typeof(tags.fiedDataValid[typeStr])!='object'){
				//无法识别的类型
				if(typeof(fieldData.element) == "string"){

				}else{
					var errorInfoStr = fieldData.name+' 类型无法识别:'+typeStr;
					console.error(errorInfoStr)
					setErrorLog(fieldData, errorInfoStr, 'type-error');
				}
				
			}else{
				for(attrKey in fieldData){
					if(attrKey == '_sourceObj' || attrKey == 'type'){
						//这两个字段不需要处理
						continue;
					}else{
						// lyw 20180702 设置的true/false转化成boolean值
						if(fieldData[attrKey] == 'false'){
							fieldData[attrKey] = false;
						}
						if(fieldData[attrKey] == 'true'){
							fieldData[attrKey] = true;
						}
						if(tags.fiedDataValid[typeStr][attrKey]){
							if(tags.fiedDataValid[typeStr][attrKey] == typeof(fieldData[attrKey])){
								//console.log(attrKey + ":" +fieldData[attrKey]);
								//判断rules是中文时---转换nsMindjetToJSTools.getStandardFromChinese
								if(attrKey == "rules"){
									var patternIsChinese = /[\u4e00-\u9fa5]/g; 	//是否中文的正则表达式
									var rulesIsChinese = patternIsChinese.test(fieldData[attrKey]);
									if(rulesIsChinese){
										//console.log(fieldData[attrKey]);
										var rulesText = nsMindjetToJSTools.getStandardFromChinese(fieldData[attrKey],nsMindjetToJSTools.rulesDict);
										fieldData[attrKey] = rulesText.success;
										//console.log(fieldData[attrKey]);
										if(rulesText.error.length != 0){
											setErrorLog(fieldData, fieldData.name+'的rules设置了未知文字：'+rulesText.error, 'rules-warn');
										}
									}
								}
								//字段类型正确
								continue;
							}else{
								//字段类型不正确，但是如果是数字文本，则要看看文本能否转成数字
								if(tags.fiedDataValid[typeStr][attrKey] == 'number'){
									//处理程序读进来的字段都是文本，所以需要把文本处理成数字
									var patternIsNumber = /^[0-9]*$/;  //是否数字
									var isNumberString = patternIsNumber.test(fieldData[attrKey]);
									if(isNumberString){
										fieldData[attrKey] = parseFloat(fieldData[attrKey]);
									}
									continue;
								}else{
									//类型错误
									var errorInfoStr = fieldData.name+' '+attrKey+':'+fieldData[attrKey]+'类型错误，应当是'+tags.fiedDataValid[typeStr][attrKey];
									console.error(errorInfoStr);
									setErrorLog(fieldData, errorInfoStr, 'field-error');
								}
							}
						}else{
							switch(attrKey){
								case 'rules':
									nsAlert(typeStr + ":不能设置" + attrKey + "属性。","error");
									console.log(fieldData);
								 	break;
							}
							
						}
					}
				}
			}
			//基本数据验证完成 console.log(fieldData);
			//delete fieldData._sourceObj;

			switch(fieldData.mindjetTargetType){
				case 'table':
					businessObj.columns[fieldData.id] = getColumnByField(fieldData,businessObj,projectJson);
					break;
				case 'form':
					businessObj.fields[fieldData.id] = getFieldByField(fieldData,businessObj);
					break;
				case 'all':
					businessObj.columns[fieldData.id] = getColumnByField(fieldData,businessObj,projectJson);
					businessObj.fields[fieldData.id] = getFieldByField(fieldData,businessObj);
					break;
				default:
					break;
			}
		}
	}
	//获取column字段
	function getColumnByField(_fieldData,_businessObj,_projectJson){
		var columnData = {
			field: 			_fieldData.id,
			title:  		_fieldData.name,
			inputType:  	_fieldData.type,
			searchable: 	false,
			orderable: 		false,
			mindjetIndex: 	_fieldData.index, 	   //原始顺序
			mindjetType: 	_fieldData.mindjetType, //原始类型
			mindjetTargetType:_fieldData.mindjetTargetType,
			ajaxDataType: 	_fieldData.ajaxDataType,
			nsChineseName: _fieldData.nsChineseName,
			nsVariableType: _fieldData.nsVariableType,
		}
		if(_fieldData.searchable){
			columnData.searchable = _fieldData.searchable;
		}
		if(_fieldData.orderable){
			columnData.orderable = _fieldData.orderable;
		}
		if(_fieldData.cellColor){
			columnData.cellColor = _fieldData.cellColor;
		}
		if(_fieldData.rowColor){
			columnData.rowColor = _fieldData.rowColor;
		}
		// formatHandler data配置
		if(_fieldData.columnFormatData){
			columnData.columnFormatData = _fieldData.columnFormatData; // multithumb
		}
		// formatHandler data配置
		if(_fieldData.tableHidden){
			if(_fieldData.tableHidden == 'true'){
				columnData.hidden = true;
			}
			if(_fieldData.tableHidden == 'false'){
				columnData.hidden = false;
			}
			if(typeof(_fieldData.tableHidden) == 'boolean'){
				columnData.hidden = _fieldData.tableHidden;
			}
		}
		$.each(_fieldData, function(fieldName, fieldValue){
			switch(fieldName){
				//转换为数字的属性
				case 'width':
					if(typeof(fieldValue)=='string'){
						columnData.width = parseInt(fieldValue);
					}else{
						columnData.width = getTableFieldWidth(_fieldData.width);
					}
					break;
				case 'fieldlength':
					columnData.width = getTableFieldWidth(parseInt(_fieldData.fieldlength));
					break;
				case 'tooltip':
					if(typeof(_fieldData.tooltip) == 'boolean'){
						columnData.tooltip = _fieldData.tooltip;
					}else{
						setErrorLog(_fieldData, _fieldData.name+'的tooltip设置了未知文字：'+_fieldData.tooltip, 'tooltip-warn');
					}
					break;
				case 'rowColor':
				case 'cellColor':
					columnData[fieldName] = JSON.parse(columnData[fieldName]);
					break;
				default:
					break;
			}
		})
		//设置width默认值
		if(!columnData.width){
			columnData.width = getTableFieldWidth();
		}
		//判断默认值
		function setDefault(){
			_projectJson.system.rowState = typeof(_projectJson.system.rowState) == "object" ? _projectJson.system.rowState : {};
			//如果设置了 _fieldData 中设置了 inputColumnsType 属性 columnData.inputColumnsType 设置为 _fieldData.inputColumnsType ; 没有设置 columnData.inputColumnsType 根据 columnData.inputType 设置
			if(typeof(_fieldData.inputColumnsType) == "string"){
				columnData.inputColumnsType = _fieldData.inputColumnsType;
			}else{
				//在表格中的表单  //通过‘显示input’中英文替换得到 isShowInput:true
				if(_fieldData.isShowInput){
					switch(columnData.inputType){
						case "upload-single":
							columnData.inputColumnsType = "upload";
							break;
						case "text":
							columnData.inputColumnsType = "input";
							break;
						case "datetime":
						case "date":
							columnData.inputColumnsType = "formatDate";
							break;
						case "select":
							columnData.inputColumnsType = "selectbase";
							break;
						case "checkbox":
							columnData.inputColumnsType = "checkbox";
							break;
						case "switch":
							columnData.inputColumnsType = "switchInput";
							break;
						case "radio":
							columnData.inputColumnsType = "radio";
							break;
					}
				}else{
					//默认的属性值 radio select checkbox select2 默认显示时 设置的formatHandler的type：stringReplace
					switch(columnData.inputType){
						case 'radio':
						case 'checkbox':
						case 'select':
						case 'select2':
							columnData.inputColumnsType = "stringReplace";
							break;
						case 'switch':
							columnData.inputColumnsType = "switch";
							break;
						case 'uploadImage':
							columnData.inputColumnsType = "image";
							break;
						case 'provincelinkselect':
							columnData.inputColumnsType = "codeToName";
							break;
						case 'provinceselect':
							columnData.inputColumnsType = "codeToName";
							break;
						case 'provincelink-select':
							columnData.inputColumnsType = "codeToName";
							break;
						case 'number':
							columnData.inputColumnsType = "number";
							break;
						default:
							break;
					}
				}

				//设置字典，mindjetType = “data”，dictArguments = **；
				// formatHandler:{type:'dictionary',data:nsVals.dictData.[dictArguments].jsondata}
				if(_fieldData.mindjetType=="dict"){
					columnData.dictArguments = _fieldData.dictArguments;
					// columnData.inputColumnsType = "dictionary";
				}
				//设置行状态  //通过‘设置行状态’中英文替换得到 rowState:true
				if(_fieldData.rowState){
					columnData.inputColumnsType = "columnState";
				}
				//数字类型-保留小数位数  //通过‘数值类型保留小数：4’中英文替换得到 numberDecimal:4
				if(_fieldData.numberDecimal){
					columnData.inputColumnsType = "number";
					columnData.numberDecimal = parseInt(_fieldData.numberDecimal);
				}
				//货币类型-保留小数位数  //通过‘货币类型保留小数：4’中英文替换得到 moneyDecimal:4
				if(_fieldData.moneyDecimal){
					columnData.inputColumnsType = "money";
					columnData.numberDecimal = parseInt(_fieldData.moneyDecimal);
				}
				//在表格中的超链接  //通过‘表格超链接’中英文替换得到 isTableHref:true
				if(_fieldData.isTableHref){
					columnData.inputColumnsType = "href";
				}
				//表格中的符号转化  //通过‘显示符号’中英文替换得到 isShowMark:true
				if(_fieldData.isShowMark){
					columnData.inputColumnsType = "dictionary";
				}
			}
		}
		setDefault();
		//不同类型对应的formatHandler
		var columnTypeData = nsMindjetToJSTools.columnTypeData;
		//需要根据类型处理的column对象
		switch(columnData.inputColumnsType){
			case 'stringReplace':
				//格式化radio select
				if($.isArray(_fieldData.subdata)){
					var formatDate = {};
					for(var subdataI = 0; subdataI<_fieldData.subdata.length; subdataI++){
						var formatDataValue = _fieldData.subdata[subdataI].value;
						formatDate[formatDataValue] = _fieldData.subdata[subdataI].text;
					}
					columnData.formatHandler = $.extend(true,{},columnTypeData.stringReplace);
					columnData.formatHandler.data = {formatDate:formatDate};
				}
				break;
			case 'columnState':
				if(!$.isEmptyObject(_projectJson.system.rowState)){
					if(typeof(_projectJson.system.rowState._nsproperty) == "object"){
						delete _projectJson.system.rowState._nsproperty;
					}
					columnData.formatHandler = $.extend(true,{},columnTypeData.columnState);
					columnData.formatHandler.data = _projectJson.system.rowState;
				}
				break;
			case 'money':
				columnData.formatType = $.extend(true,{},columnTypeData[columnData.inputColumnsType]);
				if(typeof(columnData.numberDecimal) == "number"){
					var stringZero = '';
					for(i=0;i<columnData.numberDecimal;i++){
						stringZero += "0";
					}
					columnData.formatType.format = ",." + stringZero;
				}else{
					columnData.formatType.format = ",.00";
				}
				break;
			case 'number':
				columnData.formatType = $.extend(true,{},columnTypeData[columnData.inputColumnsType]);
				if(typeof(columnData.numberDecimal) == "number"){
					var stringZero = '';
					for(i=0;i<columnData.numberDecimal;i++){
						stringZero += "0";
					}
					columnData.formatType.format = ",." + stringZero;
				}else{
					columnData.formatType.format = ",.00";
				}
				break;
			case 'radio':
			case 'checkbox':
			case 'selectbase':
				columnData.formatHandler = $.extend(true,{},columnTypeData[columnData.inputColumnsType]);
				columnData.formatHandler.data[0].subdata = _fieldData.subdata;
				break;
			case 'href':
			case 'upload':
			case 'input':
			case 'dictionary':
			case 'formatDate':
			case 'image':
			case 'switch':
			case 'codeToName':
			case 'thumb':
			case 'switchInput':
				columnData.formatHandler = $.extend(true,{},columnTypeData[columnData.inputColumnsType]);
				break;
			case 'date':
				columnData.width = 86;
			case 'datetime':
				if(columnData.inputColumnsType == 'datetime'){
					columnData.width = 134;
				}
				columnData.formatHandler = $.extend(true,{},columnTypeData[columnData.inputColumnsType]);
				if(typeof(_fieldData.isDefaultDate)!='undefined'){
					columnData.formatHandler.data.isDefaultDate = _fieldData.isDefaultDate;
				}
				break;
			case 'multithumb':
				columnData.formatHandler = $.extend(true,{},columnTypeData[columnData.inputColumnsType]);
				columnData.formatHandler.data.voName = typeof(columnData.columnFormatData)=='string'?columnData.columnFormatData:'';
				break;
			default:
				break;
		}
		//lyw 处理冗余字段
		if(typeof(_fieldData.redundant) == "boolean"){
			if(_fieldData.redundant){
				_fieldData.redundant = _fieldData.id+tags.redundantField.suffix;
			}
		}
		if(typeof(_fieldData.redundant) == "string" && _fieldData.redundant.length > 0){
			var columnDataRed = {
				field:_fieldData.redundant,
				title:columnData.title,
			}
			if(typeof(columnData.width) == "number"){
				columnDataRed.width = columnData.width;
			}
			_businessObj.columns[_fieldData.redundant] = columnDataRed;
			columnData.hidden = true;
			columnData.redundant = _fieldData.redundant;
		}
		return columnData;
	}
	//获取field字段
	function getFieldByField(_fieldData,_businessObj){
		//标题框处理
		if(typeof(_fieldData.element) == "string"){
			// _fieldData.label = _fieldData.name;
			if(typeof(_fieldData.label)!='string'){
				_fieldData.label = _fieldData.name;
			}
			_fieldData.mindjetIndex = _fieldData.index;
			_fieldData.width = '100%';
			delete _fieldData.type;
			delete _fieldData.index;
			delete _fieldData._sourceObj;
			delete _fieldData.name;
			return _fieldData;
		}
		//需要根据类型处理的field对象
		switch(_fieldData.type){
			case 'provincelink-select':
				// 省市联动 默认column：6
				if(typeof(_fieldData.column)=="undefined"){
					_fieldData.column = 6;
				}
				break;
			case 'checkbox':
				//多选，没有subdata，label包含是否/isOnlyShowOneCheckbox
				if(!_fieldData.subdata){
					if(_fieldData.name.indexOf("是否") > -1){ //当有是否字样时 设置默认属性isOnlyShowOneCheckbox = true；
						_fieldData.isOnlyShowOneCheckbox = true;
					}
					if(_fieldData.isOnlyShowOneCheckbox){
						_fieldData.subdata = [
							{
								text:'',
								value:'1'
							}
						];
					}
				}
				break;
			case 'switch':
				//多选，显示一个选项，特殊样式（label的class是：switch-inline）
				_fieldData.type = "checkbox";
				_fieldData.isOnlyShowOneCheckbox = true;
				_fieldData.displayClass = "switch";
				_fieldData.subdata = [
					{
						text:'',
						value:'1'
					}
				];
				break;
			case 'radio':
				//radio默认选中第一个
				/*if(typeof(_fieldData.value)=='undefined'){
					if($.isArray(_fieldData.subdata)){
						_fieldData.value = _fieldData.subdata[0].value;
					}
				}else{
					if(typeof(_fieldData.value)=='string'){
						var fieldDataValue = parseInt(_fieldData.value);
						if(isNaN(fieldDataValue)){
							if($.isArray(_fieldData.subdata)){
								fieldDataValue = _fieldData.subdata[0].value;
							}else{
								delete _fieldData.value;
								var errorInfoStr = _fieldData.name+' 的value：'+attrKey+':'+_fieldData[attrKey]+'类型错误，应当是'+tags.fiedDataValid[typeStr][attrKey];
								console.error(errorInfoStr);
								setErrorLog(_fieldData, errorInfoStr, 'field-error');
							}
						}else{
							_fieldData.value = fieldDataValue;
						}
					}
				}*/
				break;
			case  'textarea':
				if(typeof(_fieldData.column)=='undefined'){
					_fieldData.column = 12;
				}
				break;
			// case 'uploadImage':
			// 	_fieldData.textField = "imgurl";
			// 	_fieldData.valueField = "id";
				// _fieldData.url = getRootPath() + '/File/upload';
				// _fieldData.changeHandler = function(data){
				// 	// console.log(data);
				// 	return {
				// 		id:'0001',
				// 		imgurl:'http://ui-pc:8888/NPE/image/login/pe.png'
				// 	}
				// }
			// 	break;
			// case 'upload-single':
			// 	_fieldData.textField = "name";
			// 	_fieldData.valueField = "id";
				// _fieldData.supportFormat = '.doc,image/*,.xls';
				// _fieldData.uploadSrc = getRootPath() + '/File/upload';
				// _fieldData.changeHandler = function(data){
				// 	// console.log(data);
				// 	return {
				// 		id:'0001',
				// 		name:'1111.doc'
				// 	}
				// }
			// 	break;
			// case 'uploadSingle':
			// 	_fieldData.textField = "name";
			// 	_fieldData.valueField = "id";
				// _fieldData.supportFormat = '.doc,image/*,.xls';
				// _fieldData.uploadSrc = getRootPath() + '/File/upload';
				// _fieldData.changeHandler = function(data){
				// 	// console.log(data);
				// 	return {
				// 		id:'0001',
				// 		name:'1111.doc'
				// 	}
				// }
				// break;
			case 'graphicsInput':
				_fieldData.max = typeof(_fieldData.max) == "string" || typeof(_fieldData.max) == "number" ? _fieldData.max : 5;
				_fieldData.step = typeof(_fieldData.step) == "string" || typeof(_fieldData.step) == "number" ? _fieldData.step : 0.5;
				break;
			case 'table':
				_fieldData.pageLengthMenu = typeof(_fieldData.pageLengthMenu) == "string" || typeof(_fieldData.pageLengthMenu) == "number" ? _fieldData.pageLengthMenu : 5;
				_fieldData.columnConfig = typeof(_fieldData.columnConfig) == "string"? _fieldData.columnConfig : '[]';
				_fieldData.isPage = typeof(_fieldData.isPage) == "boolean"? _fieldData.isPage : true;
				break;
			default:
				break;
		}
		//field字段类型转换
		$.each(_fieldData, function(fieldName, fieldValue){
			switch(fieldName){
				//字符串转对象
				case 'saveAjax':
				case 'selectConfig':
					fieldValue = JSON.parse(fieldValue);
					_fieldData[fieldName] = fieldValue;
					//如果是url则判断是否是真的URL，包含http则认为是url，不是则认为是后缀 suffix
					var fieldValueUrl = _fieldData[fieldName].url;
					if(fieldValueUrl){
						var isUrlSuffix = false;
						if(typeof(fieldValueUrl)=='string'){
							if(fieldValueUrl.indexOf('http')==0){
								//完整合法的url字符串
							}else{
								isUrlSuffix = true;
							}
						}
						if(isUrlSuffix){
							if(fieldValueUrl.indexOf(' ')>-1){
								fieldValueUrl = fieldValueUrl.replace(/ /g, '')
							}
							_fieldData[fieldName].suffix = fieldValueUrl;
						}
					}
					
					break;
				//转换为数字的属性
				case 'column':
				case 'pageLengthMenu':
					if(typeof(fieldValue)!='number'){
						_fieldData[fieldName] = parseInt(fieldValue);
					}
					break;
				//字符串转数组
				case 'columnConfig':
					fieldValue = eval(fieldValue);
					_fieldData.columnConfig = fieldValue;
					break;
				case 'name':
					var labelIsChinese = /[\u4e00-\u9fa5]/;
					var labelLength = 0;
					for(i=0;i<fieldValue.length;i++){
					    if(labelIsChinese.test(fieldValue[i])){
					        labelLength += 2;
					    }else{
					        labelLength++;
					    }
					}
					if(typeof(_fieldData.plusClass)!="string"){
						if(labelLength<=14){

						}else{
							if(labelLength>=14 && labelLength<=20){
								_fieldData.plusClass = "width:140";
								_fieldData.plusClassIsWithCol = true;
							}else{
								if(labelLength>20){
									_fieldData.plusClass = "width:200";
									_fieldData.plusClassIsWithCol = true;
								}
							}
						}
					}else{
						if(typeof(_fieldData.plusClassIsWithCol)!="string"){
							if(_fieldData.plusClass != "strongtext"){
								_fieldData.plusClassIsWithCol = true;
							}
						}
					}
					break;
			}
		})
		var formData = _fieldData;
		formData.mindjetIndex = _fieldData.index;
		if(typeof(formData.label)!='string'){
			formData.label = _fieldData.name;
		}
		delete formData.index;
		delete formData._sourceObj;
		delete formData.name;
		delete formData.width;
		delete formData.rowState;
		return formData;
	}
	//处理controller对象 属性处理
	function setFunctionAttr(businessObj){
		$.each(businessObj.controller, function(classKey,classValue){

			$.each(businessObj.controller[classKey], function(functionKey, functionValue){
				var functionAttr = businessObj.controller[classKey][functionKey];
				functionAttr.functionClass = classKey;
			})
			
		})
	}
	//根据设定的文字大小返回表格列宽度 fieldlength是字的长度
	function getTableFieldWidth(fieldlength){
		//字段长度
		var width = 0;
		if(fieldlength){
			var fieldWidth = fieldlength*12 + 10;
			/**
			*tableMinWidth:表格字段列最小宽度
			*tableMaxWidth:表格字段列最大宽度
			*tableDefWidth:表格字段列默认宽度
			*/
			if(fieldWidth<=nstemplate.tableMinWidth){
				width = nstemplate.tableDefWidth;
			}else if(fieldWidth > nstemplate.tableMaxWidth){
				width = nstemplate.tableMaxWidth;
			}else{
				width = fieldWidth;
			}
			return width;
		}else{
			//没有定义宽度，也没有定义
			width = defaultValue.columnWidth;
		}
		return width;
	}
	//错误日志
	function setErrorLog($xmlDom, info, type){
		if(typeof(type)!='string'){
			type = 'error';
		}
		errorLogArray.push({
			errorXML:$xmlDom,
			info:info,
			type:type
		});
	}
	//外部接口
	return {
		init:init, 						//初始化方法
		getResult:getResult, 			//获取值，包含对init调用 返回值为{formatJSON:{}, sourceJSON:{}}
		initByVoSource:initByVoSource, 	//vo接口返回数据的初始化方法
		getErrorLogArray:function(){
			return errorLogArray;
		},
		getTags:function(){
			return tags;
		},
		getTableFieldWidth:getTableFieldWidth,
	}
})(jQuery);

//处理对象的工具
var nsMindjetToJSTools = {}

//默认的字典
nsMindjetToJSTools.defaultDict = {
	'数据描述':'field',
	'业务字段':'field_business',
	'操作字段':'field_control',
	'显示字段':'field_visual',
	'业务数据':'field_business',
	'操作数据':'field_control',
	'显示数据':'field_visual',
	'展示字段':'field_visual',
	'长度':'fieldlength',
	'保存':'save',
	'业务':'business',
	'查询':'query',
	'新增':'new',
	'修改':'modify',
	'删除':'delete',
}
//验证规则字典
nsMindjetToJSTools.rulesDict = {
	'必填':'required',
	'排重':'required',
	'数字':'number',
	'年份':'year',
	'月份':'month',
	'邮箱':'email',
	'网址':'url',
	'只能是数字':'digits',
	'座机号':'isphone',
	'座机':'isphone',
	'正整数':'positiveInteger',
	'非负整数':'nonnegativeInteger',
	'非负数':'nonnegative',
	'正数':'positiveInteger',
	'负数':'negative',
	'整数':'integer',
	'手机号':'ismobile',
	'身份证号':'Icd',
	'银行卡号':'bankno',
	'两次输入不同':'equalTo',
	'后缀':'extension',
	'表名':'tablename',
	'邮政编码':'postalcode',
	'邮编':'postalcode',
	'验证未通过':'remote',
	'信用卡号码':'rcreditcard',
	'合法数字':'precision',
	'最小长度':'minlength',
	'最大长度':'maxlength',
	'最大值':'max',
	'最小值':'min',
	'小数位数':'precision',
	'equalTo':'equalTo',
}
//表单type字典
nsMindjetToJSTools.formTypeDict = {
	'文本域':'textarea',
	'省市联动':'provincelink-select',
	'省市区':'provincelink-select',
	'省市区选择器':'provincelink-select',
	'日期':'date',
	'时间':'datetime',
	'可查可选可输':'add-select-input',
	'日期区间':'daterangepicker',
	'上传文件':'upload-single',
	'颜色选择器':'colorpickerinput',
	'星级评分':'graphicsInput',
	'文本编辑器':'ueditor',
	'正数':'text.positiveInteger',
	'数字':'text.number',
	'年份':'text.year',
	'月份':'text.month',
	'邮箱':'text.email',
	'网址':'text.url',
	'只能是数字':'text.digits',
	'座机号':'text.isphone',
	'座机':'text.isphone',
	'正整数':'text.positiveInteger',
	'非负整数':'text.nonnegativeInteger',
	'非负数':'text.nonnegative',
	'金额':'text.precision=2.money',
	'整数':'text.integer',
	'手机号':'text.ismobile',
	'身份证号':'text.Icd',
	'银行卡号':'text.bankno',
	'两次输入不同':'text.equalTo',
	'表名':'text.tablename',
	'邮政编码':'text.postalcode',
	'邮编':'text.postalcode',
	'信用卡号码':'text.rcreditcard',
}
//表单type验证规则 ''代表没有特殊验证
nsMindjetToJSTools.formTypeVaildDict = {
	'text':'',
	'textarea':'',
	'provincelink-select':'',
	'date':'',
	'datetime':'',
	'hidden':'',
	'select2':'',
	'select':{subdata:'array'},
	'radio':{subdata:'array'},
	'time':'',
}
//表格中转化的符号
nsMindjetToJSTools.columnShowMark = {
	'是':'<i class="fa fa-check"></i>',
	'否':'<i class="fa fa-close"></i>',
	'1':'<i class="fa fa-check"></i>',
	'0':'<i class="fa fa-close"></i>',
}
//表格中formatHandler/formatType 设置
nsMindjetToJSTools.columnTypeData = {
	switchInput:{
		type:'checkbox',
		data:
			[
				{
					textField:'name',
					valueField:'id',
					isSwitch:true,
					checkedFlag:'1',
					uncheckedFlag:'0',
				}
			]
	},
	// 缩略图
	thumb:{
		type:'thumb',
	},
	// 多张缩略图
	multithumb:{
		type:'multithumb',
		data:{
			voName:''
		}
	},
	image:{
		type:'image',
	},
	// 省市区 code码转化成名字
	codeToName:{
		type:'codeToName',
	},
	columnState:{
		type:'columnState',
	},
	number:{
		type:'number',
	},
	money:{
		type:'money',
	},
	href:{
		type:'href',
		data:[
			{
				handler:function(obj){console.log(obj);}
			}
		]
	},
	upload:{
		type:'upload',
		data:{
			isShowButton :true,//是否显示上传按钮
			isShowContent:true,//是否显示内容
			uploadSrc:getRootPath() + '/File/upload',//上传文件路径
			supportFormat:'.docx,.xls',//支持上传的类型
			isContentFile:{
				isLookFile:true,//是否可以查看上传文件
				isDeleteFile:true,
			}
		}
	},
	input:{
		type:'input',
	},
	formatDate:{
		type:'formatDate',
		data:[{}]
	},
	selectbase:{
		type:'selectbase',
		data:[
			{
				textField:'text',
				valueField:'value',
				// subdata:_fieldData.subdata
			}
		]
	},
	checkbox:{
		type:'checkbox',
		data:[
			{
				textField:'text',
				valueField:'value',
				// subdata:_fieldData.subdata
			}
		]
	},
	radio:{
		type:'radio',
		data:[
			{
				textField:'text',
				valueField:'value',
				// subdata:_fieldData.subdata
			}
		]
	},
	date:{
		type:'date',
		data:{formatDate:'YYYY-MM-DD'}
	},
	datetime:{
		type:'date',
		data:{formatDate:'YYYY-MM-DD HH:mm:ss'}
	},
	stringReplace:{
		type:'stringReplace',
	},
	dictionary:{
		type:'dictionary',
		data:nsMindjetToJSTools.columnShowMark
	},
	switch:{
		type:'dictionary',
		data:{
			"0":'<i class="switch-inline"></i>',
			"1":'<i class="switch-inline checked"></i>'
		}
	},
	textFieldReplace:{
		type:'textFieldReplace',
		data:{}
	},
	htmlRender:{
		type:'htmlRender',
		data:{}
	}
}
//时间字典
nsMindjetToJSTools.timeTypeDict = {
	// '今天':currentMonthDay(),
	// '今年':currentHoursMinutesSeconds(),
	// '时间':currentyearmonthday()
}
//data验证转化
nsMindjetToJSTools.getDataObj = function(data){
	//{"id":"{id}"}   
	// var isJsonStr = /\{([^:]*?)\}/;
	var isJsonStr = /\{*?\}/;
	if(isJsonStr.test(data)){
		data = JSON.parse(data);
		/*for(var key in data){
			if(typeof(data[key]) == "string"){
				data[key] = nsMindjetToJSTools.getDataObj(data[key]);
			}
		}*/
	}
	return data;
}
//错误列表
nsMindjetToJSTools.errorDataTable = function(tableId){
	var dataArray = nsMindjetToJS.getErrorLogArray();
	if($.isArray(dataArray)){
		var errorData = []; //未设置对象数据，定义
		for(var edI = 0; edI<dataArray.length; edI++){
			errorData.push({
				"info":dataArray[edI].info,
				"type":dataArray[edI].type,
			})
		}
		var dataConfig = {
					tableID:				tableId,
					dataSource: 			errorData
				}
		var columnConfig = [
			{
				field:"type",
				title:"错误类型",
				width:120
			},{
				field:"info",
				title:"错误描述"
			}
		];
		var uiConfig = {
			pageLengthMenu: 10,
			//isSingleSelect:true,
			//isAllowExport:true,
		}
		var btnConfig = {
			title:'错误日志（'+dataArray.length+'）',
		}
		baseDataTable.init(dataConfig, columnConfig, uiConfig, btnConfig);
	}
}
//业务对象列表，支持查看表格、表单、对象树
nsMindjetToJSTools.businessDataTable = function(tableId){
	//当表格数据为system，default，pages时显示树图标
	//当表格内容为其它时显示表格，表单图标
	function converButtonHandler(columnValue,row,meta,formatData){
		var returnArr = [true,true,true]; //定义默认全部显示
		var customerData = row.englishName;
		// if(customerData!="system"&&customerData!="default"&&customerData!="pages"){
		// 	returnArr[2] = false;	//不显示树图标
		// }else 
		if(customerData=="system"||customerData=="default"||customerData=="pages"){
			returnArr[0] = false;	//不显示表格图标
			returnArr[1] = false;	//不显示表单图标
		}
		if(customerData.indexOf('.')>-1){
			returnArr[2] = false;
		}
		return returnArr;
	}
	var customerDataArray = [];

	var bueinessObjs = nsMindjetToJS.formatXMLJson[nsMindjetToJS.formatXMLJson.englishName];
	for(var bueinessName in bueinessObjs){
		switch(bueinessName){
			case 'system':
			case 'default':
			case 'pages':
				customerDataArray.push({
					englishName:bueinessName,
					chineseName:bueinessObjs[bueinessName]._nsproperty.chineseName,
					type:'系统'
				});
				break;
			case '_nsproperty':
				break;
			default:
				customerDataArray.push({
					englishName:bueinessName,
					chineseName:bueinessObjs[bueinessName]._nsproperty.chineseName,
					type:'业务对象'
				});
				break;
		}
	}

	for(var dI = 0; dI<customerDataArray.length; dI++){
		if(customerDataArray[dI].type == '业务对象'){
			var englishName = customerDataArray[dI].englishName;
			var chineseName = customerDataArray[dI].chineseName;
			if(bueinessObjs[customerDataArray[dI].englishName].state){
				var stateObj = bueinessObjs[customerDataArray[dI].englishName].state;
				for(state in stateObj){
					if(state == '_nsproperty'){
						continue;
					}
					var stateEnglishName = englishName + '.'+ stateObj[state]._nsproperty.englishName;
					var stateChineseName = chineseName + ' / '+ stateObj[state]._nsproperty.chineseName;
					customerDataArray.push({
						englishName:stateEnglishName,
						chineseName:stateChineseName,
						type:'业务状态'
					});
				}

			}
		}
	}
	var dataConfig = {
		tableID:		tableId,
		dataSource: 	customerDataArray
	}
	var columnConfig = [
		{
			field : 'englishName',
			title : '英文名',
		},{
			field : 'chineseName',
			title : '中文名',
		},{
			field : 'type',
			title : '类型',
			width : 80,
		},{
			title:'查看',
			formatHandler:{
				type:'button',
				data:{
					dataReturn:converButtonHandler,
					subdata:[
								{
									'表格':function(data){
										//表格预览
										nsMindjetToJSTools.demoTableDialog(data.rowData);
									}
								},{
									'表单':function(data){
										//表单预览
										nsMindjetToJSTools.demoFormDialog(data.rowData);
									}
								},{
									'下级单位':function(data){
										// console.log(data);
										var customerData = data.rowData.englishName;
										nsMindjetToJSTools.dataTreeDialog(customerData);
									}
								}
							]
				}
			}
		}
	];
	var uiConfig = {
		pageLengthMenu: 10,
		//isSingleSelect:true,
		//isAllowExport:true,
		//isOpenCheck:true,
	}
	var btnConfig = {
		title:'生成对象（'+customerDataArray.length+'）'
	}
	baseDataTable.init(dataConfig, columnConfig, uiConfig, btnConfig);
}
//获取业务对象树形结构数据并弹框展示
nsMindjetToJSTools.dataTreeDialog = function(bueinessName){
	//定义变量判断customer是否存在
	var customerBool = true;
	//循环找到customer对象
	for(var firstKey in nsMindjetToJS.sourceJSJson){
		for(var secondKey in nsMindjetToJS.sourceJSJson[firstKey]){
			console.log(secondKey);
			if(secondKey == bueinessName){
				customerBool = false;
				var customerData = {	//定义树对象
					"success":true,
					"list":[]
				};
				customerData.list.push({
					"name":secondKey,
					"open":true 		//默认全部打开
				});
				if(typeof(nsMindjetToJS.sourceJSJson[firstKey][secondKey]) == "object"){//nsMindjetToJS.formatXMLJson[firstKey][secondKey]
					var customerDataList = {};
					var customerJsonData = {};
					if(nsMindjetToJS.formatXMLJson[firstKey][secondKey]["_nsproperty"]["typeDesc"] == "业务对象" && secondKey!="default" && secondKey!="pages" && secondKey!="system"){
						customerData.list[0]["children"] = [];
						customerData.list[0]["children"].push({
							"name":"controller",
							// "open":true
						});
						customerDataList = customerData.list[0]["children"][0];
						customerJsonData = nsMindjetToJS.sourceJSJson[firstKey][secondKey]["controller"];
					}else{
						customerDataList = customerData.list[0];
						customerJsonData = nsMindjetToJS.sourceJSJson[firstKey][secondKey];
					}
					// treeDataFun(customerData.list[0],nsMindjetToJS.sourceJSJson[firstKey][secondKey]);
					treeDataFun(customerDataList,customerJsonData);
				}
				//变换成tree要求的json的data //循环递归找到所有元素
				function treeDataFun(treeData,jsonData){
					var x = 0;
					treeData["children"] = [];
					for(var index in jsonData){
						//判断是否为业务对象--若是业务对象只显示controller--
						treeData["children"].push({
							"name":index,
							// "open":true
						});
						if(typeof(jsonData[index]) == "object"){
							treeDataFun(treeData["children"][x++],jsonData[index]);
						}else{
							treeData["children"][x]["children"] = [];
							treeData["children"][x++]["children"].push({
								"name":jsonData[index],
								// "open":true
							});
						}
					}
				}
				//定义空白弹框
				var config = {
					id: 	"plane-viewTable",
					title: 	"当前业务对象数据",
					size: 	"s",
					form: 	[
						{
							html:'<div id="dialogTree"></div>'
						}
					]
				}
				popupBox.initShow(config);
				//定义tree对象
				var zTreeObj;
				setting = {
					view: {
						selectedMulti: false
					}
				};
				//添加ztree类
				$("#plane-viewTable .modal-body").children().addClass("ztree");
				//插入树对象到弹框
				// zTreeObj = $.fn.zTree.init($("#plane-viewTable .modal-body").children(), setting, customerData.list);
				zTreeObj = $.fn.zTree.init($("#dialogTree"), setting, customerData.list);
				// $("#plane-viewTable .modal-body").height($("#plane-viewTable .modal-body").children(".ztree").height()+20);
			}
		}
	}
	if(customerBool){ 		//若没有找到customer，弹出空白弹框
		var config = {
			id: 	"plane-viewState",
			title: 	"空白弹框",
			form: [
				{
					note:'未找到'+bueinessName+'数据',
				}
			]
		}
		nsdialog.initShow(config);
	}
}
//生成当前业务对象的表格对象 预览
nsMindjetToJSTools.demoTableDialog = function(rowData){
	var projectJson = nsMindjetToJS.sourceJSJson[nsMindjetToJS.formatXMLJson.englishName];
	//bueinessName没有点就是业务
	var bueinessName = rowData.englishName;
	var field = [];
	if(bueinessName.indexOf('.')==-1){
		field = [];
		for(key in  projectJson[bueinessName].columns){
			field.push(projectJson[bueinessName].columns[key]);
		}
		field.sort(function(a,b){
			return a.mindjetIndex - b.mindjetIndex;
		})
		//field = $.extend(true, [], projectJson[bueinessName].newField.tableField);
	}else{
		console.warn(bueinessName);
		var stateBueinessName = bueinessName.substring(0, bueinessName.indexOf('.'));
		var stateName = bueinessName.substring(bueinessName.indexOf('.')+1, bueinessName.length);
		var stateFieldObj = projectJson[stateBueinessName].state[stateName];
		// console.log(stateFieldObj);
	}
	var fieldDemoData = nsMindjetToJSTools.getDemoTableData(field);
	var config = {
		id: 	"plane-viewTable",
		title: 	bueinessName + '表格模拟数据 （'+field.length+'）',
		size: 	"b",
		form:[
				{
					id: 		'damo-table',
					type: 		'table',
					dataSource: fieldDemoData.rows,
					isColumnsCounter: true,
					isSearch:true,
					isPage:true,
					dragWidth:true,
					isMulitSelect: true,
					scrollX:true,
					pageLengthMenu: 6,
					column: field
				}
			],
		btns:[
			{
				text:'保存模拟数据',
				handler:function(){console.log('abcde')}
			}
		]
	}
	popupBox.initShow(config);
	return false;
	$.ajax({
		url : getRootPath() + '/uiTest/get',
		async : true,
		data : {
			keyName:'DICT_ROWS'
		},
		type : "post",
		dataType: "json",
		success : function(data){
			if(data.success){
				var rowsDataJson = JSON.parse(data.model.valueName);	//获得rows对象数据
				//定义表格并显示
				var columnConfig = [];
				//获得newField数据中tableField数据   循环两层查找
				for(var firstKey in nsMindjetXML.objectJsonEnd){
					for(var secondKey in nsMindjetXML.objectJsonEnd[firstKey]){
						if(secondKey == bueinessName){
							for(var thirdKey in nsMindjetXML.objectJsonEnd[firstKey][secondKey]){
								if(thirdKey == "newField"){	
									var tableFieldArray = nsMindjetXML.objectJsonEnd[firstKey][secondKey]["newField"]["tableField"];
									for(var tableFieldIndex in tableFieldArray){
										tableFieldArray[tableFieldIndex]["width"] = 100;
									}
									columnConfig = tableFieldArray;
								}
							}
						}
					}
				}
				if(columnConfig.length == 0){ //如果未找到customer返回未找到
					var config = {
						id: 	"plane-viewState",
						title: 	"空白弹框",
						form: [
							{
								note:'未找到'+bueinessName+'数据',
							}
						]
					}
					nsdialog.initShow(config);
				}else{
					var config = {
						id: 	"plane-viewTable",
						title: 	"field数据表格",
						size: 	"b",
						form:[
								{
									id: 		'damo-table',
									type: 		'table',
									dataSource: rowsDataJson.rows,
									isColumnsCounter: true,
									isSearch:true,
									isPage:true,
									dragWidth:true,
									isMulitSelect: true,
									scrollX:true,
									pageLengthMenu: 6,
									column: columnConfig
								}
							]
					}
					popupBox.initShow(config);
				}
			}else{
				nsalert(data.msg);
			}
		}
	})
}
//对象生成字符串
nsMindjetToJSTools.objectToString = function(){
	if(nsMindjetToJS.sourceJSJson){
		console.log(JSON.stringify(nsMindjetToJS.sourceJSJson,null,4));
	}else{
		nsAlert("没有生成思维导图对象",'error');
	}
}
//生成当前业务对象的表单对象 预览
nsMindjetToJSTools.demoFormDialog = function(rowData){
	var type = rowData.type;
	var bueinessName = rowData.englishName;
	var projectJson = nsProject.init(nsMindjetToJS.sourceJSJson[nsMindjetToJS.formatXMLJson.englishName]);
	var field = [];
	if(bueinessName.indexOf('.') == -1){
		bueinessName = bueinessName;
		for(key in projectJson[bueinessName].fields){
			field.push(projectJson[bueinessName].fields[key]);
		}
	}else{
		var bueinessNameArray = bueinessName.split('.');
		var bueinessObjName = bueinessNameArray[0];
		var bueinessStateName = bueinessNameArray[1];
		var base = bueinessStateName + '.base';
		var more = bueinessStateName + '.more';
		field=nsProject.getFieldsByState(projectJson[bueinessObjName],more,false);
	}
	field.sort(function(a,b){
		return a.mindjetIndex - b.mindjetIndex;
	})
	console.log('field:-----------------');
	console.log(field);
	var config = {
		id: 	"plane-viewForm",
		// title: 	bueinessName + '表单模拟数据 （'+field.length+'）',
		title: 	'aaa',
		size: 	"m",
		form: field,
		btns:[
			{
				text:'保存模拟数据',
				handler:function(){console.log('abcde')}
			}
		]
	}
	popupBox.initShow(config);
	return false;
	$.ajax({
		url : getRootPath() + '/uiTest/get',
		async : true,
		data : {
			keyName:'DICT_ROWS'
		},
		type : "post",
		dataType: "json",
		success : function(data){
			if(data.success){
				var rowsDataJson = JSON.parse(data.model.valueName);	//获得rows对象数据
				//定义表格并显示
				var columnConfig = [];
				//获得newField数据中tableField数据   循环两层查找
				for(var firstKey in nsMindjetXML.objectJsonEnd){
					for(var secondKey in nsMindjetXML.objectJsonEnd[firstKey]){
						if(secondKey == bueinessName){
							for(var thirdKey in nsMindjetXML.objectJsonEnd[firstKey][secondKey]){
								if(thirdKey == "newField"){	
									var tableFieldArray = nsMindjetXML.objectJsonEnd[firstKey][secondKey]["newField"]["tableField"];
									for(var tableFieldIndex in tableFieldArray){
										tableFieldArray[tableFieldIndex]["width"] = 100;
									}
									columnConfig = tableFieldArray;
								}
							}
						}
					}
				}
				if(columnConfig.length == 0){ //如果未找到customer返回未找到
					var config = {
						id: 	"plane-viewState",
						title: 	"空白弹框",
						form: [
							{
								note:'未找到'+bueinessName+'数据',
							}
						]
					}
					nsdialog.initShow(config);
				}else{
					var config = {
						id: 	"plane-viewTable",
						title: 	"field数据表格",
						size: 	"b",
						form:[
								{
									id: 		'damo-table',
									type: 		'table',
									dataSource: rowsDataJson.rows,
									isColumnsCounter: true,
									isSearch:true,
									isPage:true,
									dragWidth:true,
									isMulitSelect: true,
									scrollX:true,
									pageLengthMenu: 6,
									column: columnConfig
								}
							]
					}
					popupBox.initShow(config);
				}
			}else{
				nsalert(data.msg);
			}
		}
	})
}
//生成demoTable虚拟数据
//制造rows数据，20条,保存数据到Map使用
nsMindjetToJSTools.getDemoTableData = function(field){
	var fieldData = field;
	var rowsData = {		//定义rows数据
		"total":20,			//表格条数
		"success":true,
		"rows":[]
	};
	var indexRowsData = 1;
	var number = 1;
	for(var i=0; i<rowsData.total; i++){
		var fieldRowsData = {}; 	//定义rowsData.rows中每一条对象
		for(var fdI = 0; fdI<fieldData.length; fdI++){
			var fieldKey = fieldData[fdI]["field"]; 	//获得field数组对象中id值
			var fieldName = fieldData[fdI]["title"];	//获得field数组对象中name值
			var rowIndexStr = indexRowsData<10?'_0'+indexRowsData:'_'+indexRowsData;
			switch(fieldData[fdI].inputColumnsType){
				case 'dictionary':
				case 'switch':
					if(i<10){
						fieldRowsData[fieldKey] = '1';
					}else{
						fieldRowsData[fieldKey] = '0';
					}
					break;
				case 'stringReplace':
					if(i<10){
						fieldRowsData[fieldKey] = '1';
					}else{
						fieldRowsData[fieldKey] = '0';
					}
					break;
				case 'date':
					break;
				case 'datetime':
					break;
				case 'formatDate':
					break;
				default:
					if(fieldData[fdI].mindjetType&&fieldData[fdI].mindjetType.indexOf("数字")>-1){
						fieldRowsData[fieldKey] = number++;
					}else{
						fieldRowsData[fieldKey] = fieldName + rowIndexStr;
					}
					// fieldRowsData[fieldKey] = fieldName + rowIndexStr;
					break;
			}
			//lyw  设置行状态
			if(fieldData[fdI]["formatHandler"] && fieldData[fdI]["formatHandler"].type == "columnState"){
				fieldRowsData["expedited"] = 1;
				fieldRowsData["goback"] = false;
				fieldRowsData["reminders"] = false;
				fieldRowsData["overdue"] = false;
				fieldRowsData["destroy"] = false;
				fieldRowsData["quality"] = false;
				fieldRowsData["recheck"] = true;
			}
		}
		rowsData.rows.push(fieldRowsData);
		indexRowsData++;
	}
	return rowsData;
	//遍历nsMindjetXML.objectJsonEnd对象找到field
	//赋值modalData.modal对象使field中对象的id值对应name值
	//制造20条通过rowsData.total确定条数
	var indexRowsData = 1;	//name值+indexRowsData(客户1，客户2，客户3，客户4......)
	for(var firstIndex in nsMindjetXML.objectJsonEnd){
		for(var secondIndex in nsMindjetXML.objectJsonEnd[firstIndex]){
			//找到field数据
			if(typeof nsMindjetXML.objectJsonEnd[firstIndex][secondIndex]["field"] == "object"){
				var fieldData = nsMindjetXML.objectJsonEnd[firstIndex][secondIndex]["field"];
				//循环获得20条
				for(var i=0;i<rowsData["total"];i++){
					var fieldRowsData = {}; 	//定义rowsData.rows中每一条对象
					for(var threeIndex in fieldData){
						var fieldKey = fieldData[threeIndex]["id"]; 	//获得field数组对象中id值
						var fieldName = fieldData[threeIndex]["name"];	//获得field数组对象中name值
						//赋值fieldRowsData对象
						//（第一条{id值:name值1,id值:name值1...}）
						//（第二条{id值:name值2,id值:name值2...}）
						fieldRowsData[fieldKey] = fieldName + indexRowsData;
					}
					rowsData.rows.push(fieldRowsData);
					indexRowsData++;
				}
			}
		}
	}
	var rowsDataString = JSON.stringify(rowsData);
	var jsonDataRows = {							//定义要保存的数据
		keyName:'DICT_ROWS',
		valueName:rowsDataString
	};
	nsMindjetXML.saveDictData(jsonDataRows);		//保存数据
}
//查询字典
nsMindjetToJSTools.getStandardFromChinese = function(valueText,dictObj){ //valueText：属性值,valueObject：属性对象
  
	valueText = $.trim(valueText); 				//去掉valueText前后空格
	valueText = valueText.replace(/[、 ]/g, ',') 	//判断valueText中是否包含“，”或“ ”或“、” 统一为逗号
	var valueTextArr = valueText.split(","); 		//拆分字符串

	var patternIsChinese = /[\u4e00-\u9fa5]/g; 	//是否中文的正则表达式

	var outputStr = '';
	var errorStr = '';
	for(vtI = 0; vtI<valueTextArr.length; vtI++){
		var cStr = valueTextArr[vtI];
		if(cStr.match(/[:=]/)){
			var originalStr = cStr.replace(/[:]/g, '=') 	//处理 '最大值：5'转为 '最大值=5'
			var replaceStr = originalStr.substring(0, originalStr.indexOf('='));
			if(patternIsChinese.test(replaceStr)){ // 规则是中文
				if(typeof(dictObj[replaceStr])=='string'){
					var dictStr = dictObj[replaceStr];
					cStr = originalStr.replace(new RegExp(replaceStr), dictStr);
				}else{	
					cStr = '';
					errorStr += ' '+originalStr;
				}
			}else{
				// 规则是英文
				cStr = originalStr;
			}
		}else{
			if(typeof(dictObj[cStr])=='string'){
				cStr = dictObj[cStr];
			}else{
				var isString = true;
				for(var key in dictObj){
					if(cStr == dictObj[key]){
						isString = false;
						cStr = cStr;
					}
				}
				if(isString){
					errorStr += ' '+cStr;
					cStr = '';
				}
				// errorStr += ' '+cStr;
				// cStr = '';		
			}
		}
		if(!outputStr.match(cStr)){
			outputStr += ' '+cStr;
		}
	}
	outputStr = $.trim(outputStr);
	errorStr = $.trim(errorStr);
	return {
		"success":outputStr,
		"error":errorStr
	}
}
//获取命名规范字典数据
nsMindjetToJSTools.getDictData = function(dictUrlConfig){
	//获取驼峰命名字符串， 将a_a 转为aA
	var humpNameReg = /_(\w)/g;
	//去除无效字符只识别英文字母大小写和数字
	var noVaildStringReg = /[^(\w)]/g;
	//获取驼峰字符串， return string
	function getHumpNameStr(str){
		str = str.replace(noVaildStringReg, '');
		str = str.replace(humpNameReg, function(str0,str1){
			return str1.toUpperCase();
		})
		return str;
	}
	//合并
	this.dictData = $.extend(true, {}, nsMindjetToJSTools.defaultDict);

	$.each(this.dictData, function(key,value){
		nsMindjetToJSTools.dictData[key] = getHumpNameStr(value);
	})
	if(typeof(dictUrlConfig) == 'object'){
		//如果是传入参数则使用
	}else{
		//默认读取的url
		var keyNameStr = 'DICTSAVE_DICTIONARIES';
		if(typeof(dictUrlConfig) == 'string'){
			keyNameStr = dictUrlConfig;
		}
		var dictUrlConfig = {
			url : getRootPath() + '/templateDicts/getList',
			data : {
				keyName:keyNameStr
			},
			type : "post",
		}
	}
	nsVals.ajax(dictUrlConfig, function(res){
		//console.log(res.rows);
		var nameReg = /_(\w)/g;
		for(var dictI = 0; dictI<res.rows.length; dictI++){

			var wordData =  res.rows[dictI];
			if(typeof(nsMindjetToJSTools.dictData[wordData.zhName])!='object'){
				nsMindjetToJSTools.dictData[wordData.zhName] = getHumpNameStr(wordData.enName);
			}else{
				setErrorLog(wordData, '字典有重复字段：'+wordData.zhName);
			}
		}
		nsalert('字典初始化完成，共有'+res.rows.length+'条', 'success');
	})
}
//覆盖字典
nsMindjetToJSTools.coverDictionary = function(){
	var xlsxFileText = $("#form-import-xlsx-file").val();
	if(xlsxFileText != ""){
		nsMindjetToJSTools.saveDictionary("true");
	}else{
		nsalert("你还没有选择Excel文件");
	}
}
//保存字典
nsMindjetToJSTools.saveDictionary = function(state){		//state用于添加字典没有数据时不显示"保存成功"
	xlsxFileJsonString = JSON.stringify(nsMindjetToJSTools.englishDictionary);
	var jsonDataXlsx = {									//定义要保存的数据
		keyName:'DICTSAVE_DICTIONARIES',
		valueName:xlsxFileJsonString
	}
	$.ajax({
		url : getRootPath() + '/uiTest/save',
		async : true,
		data : jsonDataXlsx,
		type : "post",
		dataType: "json",
		success : function(data){
			if(data.success){
				if(state){
					nsalert("保存成功");
				}
			}else{
				nsalert(data.msg);
			}
		}
	});
}
//添加字典
nsMindjetToJSTools.addDictionary = function(){
	$.ajax({
		url : getRootPath() + '/uiTest/get',
		async : true,
		data : {
			keyName:'DICTSAVE_DICTIONARIES'
		},
		type : "post",
		dataType: "json",
		success : function(data){
			if(data.success){
				// console.log(data.model.valueName);nsMindjetToJSTools.englishDictionary
				var addState = true;		//addState用于添加字典没有数据时不显示"保存成功"
				var jsonData = JSON.parse(data.model.valueName);
				if($("#form-import-xlsx-file").val() != ""){
					for(var index=0;index<nsMindjetToJSTools.englishDictionary.rows.length;index++){
						var validation = true;		//用于判断中文翻译是否已存在
						for(var indexI=0;indexI<jsonData.rows.length;indexI++){
							if(jsonData.rows[indexI].name == nsMindjetToJSTools.englishDictionary.rows[index].name){
								validation = false;
								addState = false;
								nsalert(jsonData.rows[indexI].name+"英文已存在");
								break;
							}
						}
						if(validation){
							jsonData.rows.push(nsMindjetToJSTools.englishDictionary.rows[index]);
						}
					}
				}else{
					addState = false;
					nsalert("你还没有选择Excel文件");
				}
				nsMindjetToJSTools.englishDictionary = jsonData;
				nsMindjetToJSTools.saveDictionary(addState);
			}else{
				nsalert(data.msg);
			}
		}
	})
}
//增加词条
nsMindjetToJSTools.confirmToAdd = function(){
	$.ajax({
		url : getRootPath() + '/uiTest/get',
		async : true,
		data : {
			keyName:'DICTSAVE_DICTIONARIES'
		},
		type : "post",
		dataType: "json",
		success : function(data){
			if(data.success){
				// console.log(data.model.valueName);nsMindjetToJSTools.englishDictionary
				var addState = true;		//addState用于添加字典没有数据时不显示"保存成功"
				var jsonData = JSON.parse(data.model.valueName);
				var chinese = $("#form-plane-dialog-chinese").val();
				var english = $("#form-plane-dialog-english").val();
				if(chinese!="" && english!=""){
					var validation = true;
					for(var indexI=0;indexI<jsonData.rows.length;indexI++){
						if(jsonData.rows[indexI].name == chinese){
							validation = false;
							addState = false;
							nsalert(chinese+"英文已存在");
							break;
						}
					}
					if(validation){
						jsonData.rows.push({
							"name":chinese,
							"value":english
						});
					}
				}else{
					addState = false;
					nsalert("没有填写中文名称和英文名称");
				}
				nsMindjetToJSTools.englishDictionary = jsonData;
				nsMindjetToJSTools.saveDictionary(addState);
				nsdialog.hide();
			}else{
				nsalert(data.msg);
			}
		}
	})
}
//添加词条弹框
nsMindjetToJSTools.addEntry = function(){
	var configEmpty = {
		id: 	"plane-dialog",
		title: 	"添加字典词条",
		size: 	"s",
		form:[
				{
					id: 			'chinese',
					label: 			'中文名称',
					type: 			'text',
					column: 		6
				},{
					id: 			'english',
					label: 			'英文名称',
					type: 			'text',
					column: 		6
				}
		],
		btns:[
			{
				text: 		'添加',
				handler: 	'nsMindjetToJSTools.confirmToAdd',
			}
		]
	}
	popupBox.initShow(configEmpty);
}
//错误列表
// nsMindjetToJSTools.errorDataTable = function(){
// 	var dataArray = nsMindjetToJS.getErrorLogArray();
// 	if($.isArray(dataArray)){
// 		var errorData = []; //未设置对象数据，定义
// 		for(var edI = 0; edI<dataArray.length; edI++){
// 			errorData.push({
// 				"info":dataArray[edI].info,
// 				"type":dataArray[edI].type,
// 			})
// 		}
// 		var dataConfig = {
// 					tableID:				"errorDataTable",
// 					dataSource: 			errorData
// 				}
// 		var columnConfig = [
// 			{
// 				field:"type",
// 				title:"错误类型",
// 				width:120
// 			},{
// 				field:"info",
// 				title:"错误描述"
// 			}
// 		];
// 		var uiConfig = {
// 			pageLengthMenu: 10,
// 			//isSingleSelect:true,
// 			//isAllowExport:true,
// 		}
// 		var btnConfig = {
// 			title:'错误日志（'+dataArray.length+'）',
// 		}
// 		baseDataTable.init(dataConfig, columnConfig, uiConfig, btnConfig);
// 	}
// }
// //业务对象列表，支持查看表格、表单、对象树
// nsMindjetToJSTools.businessDataTable = function(){
// 	//当表格数据为system，default，pages时显示树图标
// 	//当表格内容为其它时显示表格，表单，树图标
// 	function converButtonHandler(columnValue,row,meta,formatData){
// 		var returnArr = [true,true,true]; //定义默认全部显示
// 		var customerData = row.englishName;
// 		// if(customerData!="system"&&customerData!="default"&&customerData!="pages"){
// 		// 	returnArr[2] = false;	//不显示树图标
// 		// }else 
// 		if(customerData=="system"||customerData=="default"||customerData=="pages"){
// 			returnArr[0] = false;	//不显示表格图标
// 			returnArr[1] = false;	//不显示表单图标
// 		}
// 		return returnArr;
// 	}
// 	var businessArray = [];
// 	var systemArray = [];
// 	//基本对象没有表格表单
// 	var businessObjs = nsMindjetToJS.formatXMLJson[nsMindjetToJS.formatXMLJson.englishName];
// 	//根据对象生成数组  有三个主要列 englishName  chineseName type
// 	for(var bueinessName in businessObjs){
// 		switch(bueinessName){
// 			case 'system':
// 			case 'default':
// 			case 'pages':
// 				systemArray.push({
// 					englishName:bueinessName,
// 					chineseName:businessObjs[bueinessName]._nsproperty.chineseName,
// 					type:'系统'
// 				});
// 				break;
// 			case '_nsproperty':
// 				break;
// 			default:
// 				businessArray.push({
// 					englishName:bueinessName,
// 					chineseName:businessObjs[bueinessName]._nsproperty.chineseName,
// 					type:'业务对象'
// 				});
// 				break;
// 		}
// 	}
	
// 	//状态英文名称和中文名称 格式是 customer.normal  客户/普通客户
// 	for(var dI = 0; dI<businessArray.length; dI++){
// 		if(businessArray[dI].type == '业务对象'){
// 			var englishName = businessArray[dI].englishName;
// 			var chineseName = businessArray[dI].chineseName;
// 			if(businessObjs[businessArray[dI].englishName].state){
// 				var stateObj = businessObjs[businessArray[dI].englishName].state;
// 				for(state in stateObj){
// 					if(state == '_nsproperty'){
// 						continue;
// 					}
// 					var stateEnglishName = englishName + '.'+ stateObj[state]._nsproperty.englishName;
// 					var stateChineseName = chineseName + ' / '+ stateObj[state]._nsproperty.chineseName;
// 					businessArray.push({
// 						englishName:stateEnglishName,
// 						chineseName:stateChineseName,
// 						type:'业务状态'
// 					});
// 				}

// 			}
// 		}
// 	}
// 	//对数组排序
// 	businessArray.sort(function(a,b){
// 		return a.englishName.localeCompare(b.englishName);
// 	})
// 	var dataArray = businessArray.concat(systemArray)

// 	var dataConfig = {
// 		tableID:		"customerDataTable",
// 		dataSource: 	dataArray
// 	}
// 	var columnConfig = [
// 		{
// 			field : 'englishName',
// 			title : '英文名',
// 		},{
// 			field : 'chineseName',
// 			title : '中文名',
// 		},{
// 			field : 'type',
// 			title : '类型',
// 			width : 80,
// 		},{
// 			title:'查看',
// 			width : 100,
// 			formatHandler:{
// 				type:'button',
// 				data:{
// 					dataReturn:converButtonHandler,
// 					subdata:[
// 								{
// 									'表格':function(data){
// 										//表格预览
// 										nsMindjetToJSTools.demoTableDialog(data.rowData);
// 									}
// 								},{
// 									'表单':function(data){
// 										//表单预览
// 										nsMindjetToJSTools.demoFormDialog(data.rowData);
// 									}
// 								},{
// 									'下级单位':function(data){
// 										// console.log(data);
// 										var customerData = data.rowData.englishName;
// 										nsMindjetToJSTools.dataTreeDialog(customerData);
// 									}
// 								}
// 							]
// 				}
// 			}
// 		}
// 	];
// 	var uiConfig = {
// 		pageLengthMenu: 10,
// 	}
// 	var btnConfig = {
// 		title:'生成对象（'+dataArray.length+'）'
// 	}
// 	baseDataTable.init(dataConfig, columnConfig, uiConfig, btnConfig);
// }
//查询弹框
nsMindjetToJSTools.querymodal = function(){
	var configEmpty = {
		id: 	"plane-dialog",
		title: 	"添加字典词条",
		size: 	"s",
		form:[
				{
					id: 			'text',
					label: 			'查询字段',
					type: 			'text',
				},{
					html:'<p id="form-plane-dialog-queryData">查询结果：<b></b></p>'
				}
		],
		btns:[
			{
				text: 		'查询',
				handler: 	'nsMindjetToJSTools.queryDictionary',
			}
		]
	}
	popupBox.initShow(configEmpty);
}
//查询字典---输入中英文 返回 英中文
nsMindjetToJSTools.queryDictionary = function(){
	var queryDictionaryObj = nsMindjetToJSTools.dictData;
	var textString = nsdialog.getFormJson().text;
	var patternIsChinese = /[\u4e00-\u9fa5]/g; 	//是否中文的正则表达式
	var outcomeData = "";
	if(patternIsChinese.test(textString)){
		for(var key in queryDictionaryObj){
			if(key == textString){
				outcomeData += queryDictionaryObj[key] + " ";
			}
		}
	}else{
		for(var key in queryDictionaryObj){
			if(queryDictionaryObj[key] == textString){
				outcomeData += key + " ";
			}
		}
	}
	if(outcomeData == ""){
		outcomeData = "没有找到对应值";
	}
	$("#form-plane-dialog-queryData").children("b").text(outcomeData);
}

// formatXMLJson 转化为xml
nsMindjetToJSTools.getMindjetXMLByJson = function(_formatXMLJson){
	// start 是 xml 开始内容
	// end 是 xml 结束内容
	var XMLSTRING = {
		start: 		'<?xml version="1.0" encoding="UTF-8" standalone="no"?><ap:Map xmlns:ap="http://schemas.mindjet.com/MindManager/Application/2003" xmlns:cor="http://schemas.mindjet.com/MindManager/Core/2003" xmlns:pri="http://schemas.mindjet.com/MindManager/Primitive/2003" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://schemas.mindjet.com/MindManager/Application/2003 http://schemas.mindjet.com/MindManager/Application/2003 http://schemas.mindjet.com/MindManager/Core/2003 http://schemas.mindjet.com/MindManager/Core/2003 http://schemas.mindjet.com/MindManager/Delta/2003 http://schemas.mindjet.com/MindManager/Delta/2003 http://schemas.mindjet.com/MindManager/Primitive/2003 http://schemas.mindjet.com/MindManager/Primitive/2003"><cor:Custom Index="0" Uri="http://schemas.mindjet.com/MindManager/UpdateCompatibility/2004" cst0:UpdatedCategories="true" cst0:UpdatedVisibilityStyle="true" cst0:UpdatedDuration="true" cst0:UpdatedGanttViewProperties="true" cst0:UpdatedNamedView="true" cst0:UpdatedTextLabelSetIds="true" xmlns:cst0="http://schemas.mindjet.com/MindManager/UpdateCompatibility/2004"/><ap:OneTopic>', 
		end: 		'</ap:OneTopic><ap:StyleGroup><ap:RootTopicDefaultsGroup><ap:DefaultColor FillColor="fff4f4f4" LineColor="ff333333"/><ap:DefaultText TextAlignment="urn:mindjet:Center" TextCapitalization="urn:mindjet:SentenceStyle" VerticalTextAlignment="urn:mindjet:Top" PlainText="Central Topic"><ap:Font Color="ff1e1e1e" Size="14." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:RoundedRectangle" LeftMargin="4." RightMargin="4." TopMargin="2.5" BottomMargin="2.5" VerticalLeftMargin="2.5" VerticalRightMargin="2.5" VerticalTopMargin="2.5" VerticalBottomMargin="2.5" VerticalSubTopicShape="urn:mindjet:RoundedRectangle"/><ap:DefaultLabelFloatingTopicShape LabelFloatingTopicShape="urn:mindjet:None" LeftMargin="0." RightMargin="0." TopMargin="0." BottomMargin="0." VerticalLeftMargin="2.5" VerticalRightMargin="2.5" VerticalTopMargin="2.5" VerticalBottomMargin="2.5" VerticalLabelFloatingTopicShape="urn:mindjet:None"/><ap:DefaultCalloutFloatingTopicShape CalloutFloatingTopicShape="urn:mindjet:None" VerticalCalloutFloatingTopicShape="urn:mindjet:None" LeftMargin="0." RightMargin="0." TopMargin="0." BottomMargin="0." VerticalLeftMargin="2.5" VerticalRightMargin="2.5" VerticalTopMargin="2.5" VerticalBottomMargin="2.5"/><ap:DefaultTopicLayout TopicLayoutHorizontalAlignment="urn:mindjet:Center" TopicLayoutVerticalAlignment="urn:mindjet:Center" TopicTextAndImagePosition="urn:mindjet:TextRightImageLeft" TopicWidthControl="urn:mindjet:AutoWidth" Width="80." MinimumHeight="5." Padding="2."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Center" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:LeftAndRight" SubTopicsShape="urn:mindjet:Vertical" SubTopicsShapeWidthFactor="1." SubTopicsVerticalAlignment="urn:mindjet:Middle" SubTopicsVerticalGrowthDirection="urn:mindjet:UpAndDown" DistanceFromParent="30." VerticalDistanceFromParent="10." DistanceBetweenSiblings="7." VerticalDistanceBetweenSiblings="1." SubTopicsDepth="1" SubTopicsAlignmentDualVertical="urn:mindjet:Bottom" SubTopicsTreeConnectionPoint="urn:mindjet:Inside" VerticalSubTopicsConnectionStyle="urn:mindjet:RoundedElbow" VerticalSubTopicsConnectionPoint="urn:mindjet:Outside" VerticalSubTopicsTreeConnectionPoint="urn:mindjet:Inside"/><ap:DefaultSubTopicsVisibility Hidden="false"/></ap:RootTopicDefaultsGroup><ap:RootSubTopicDefaultsGroup Level="0"><ap:DefaultColor FillColor="ffeef4fa" LineColor="ff3170af"/><ap:DefaultText TextAlignment="urn:mindjet:Left" TextCapitalization="urn:mindjet:None" PlainText="Main Topic"><ap:Font Color="ff0f252d" Size="12." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:RoundedRectangle" LeftMargin="5." RightMargin="5." TopMargin="2." BottomMargin="2." VerticalLeftMargin="2." VerticalRightMargin="2." VerticalTopMargin="2." VerticalBottomMargin="2." VerticalSubTopicShape="urn:mindjet:RoundedRectangle"/><ap:DefaultTopicLayout Width="66.800003051757813" Padding="2."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Center" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" SubTopicsVerticalAlignment="urn:mindjet:Middle" SubTopicsVerticalGrowthDirection="urn:mindjet:AutomaticVertical" DistanceFromParent="2." VerticalDistanceFromParent="10." DistanceBetweenSiblings="3.4000000953674316" VerticalDistanceBetweenSiblings="1." SubTopicsAlignmentDualVertical="urn:mindjet:Bottom" VerticalSubTopicsConnectionStyle="urn:mindjet:RoundedElbow" VerticalSubTopicsConnectionPoint="urn:mindjet:Outside"/><ap:DefaultSubTopicsVisibility Hidden="false"/></ap:RootSubTopicDefaultsGroup><ap:RootSubTopicDefaultsGroup Level="1"><ap:DefaultColor FillColor="ffedf6f0" LineColor="ff6ebb89"/><ap:DefaultText TextAlignment="urn:mindjet:Left" TextCapitalization="urn:mindjet:None" PlainText="Subtopic"><ap:Font Color="ff112b21" Size="10." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:RoundedRectangle" LeftMargin="3." RightMargin="3." TopMargin="0.5" BottomMargin="0.5" VerticalLeftMargin="1." VerticalRightMargin="1." VerticalTopMargin="1." VerticalBottomMargin="1." VerticalSubTopicShape="urn:mindjet:RoundedRectangle"/><ap:DefaultTopicLayout Width="60.700000762939453" Padding="1."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Center" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" DistanceFromParent="2." VerticalDistanceFromParent="10." DistanceBetweenSiblings="3.4000000953674316" VerticalDistanceBetweenSiblings="1." SubTopicsAlignmentDualVertical="urn:mindjet:Bottom" VerticalSubTopicsConnectionStyle="urn:mindjet:RoundedElbow" VerticalSubTopicsConnectionPoint="urn:mindjet:Outside"/><ap:DefaultSubTopicsVisibility Hidden="false"/></ap:RootSubTopicDefaultsGroup><ap:RootSubTopicDefaultsGroup Level="2"><ap:DefaultColor FillColor="00000000" LineColor="ff999999"/><ap:DefaultText TextAlignment="urn:mindjet:Left" TextCapitalization="urn:mindjet:None" PlainText="Subtopic"><ap:Font Color="ff141414" Size="9." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:Line" LeftMargin="0.20000000298023224" RightMargin="0.20000000298023224" TopMargin="0.20000000298023224" BottomMargin="0.20000000298023224" VerticalLeftMargin="1." VerticalRightMargin="1." VerticalTopMargin="1." VerticalBottomMargin="1." VerticalSubTopicShape="urn:mindjet:RoundedRectangle"/><ap:DefaultTopicLayout Width="66.800003051757813"/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Center" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" DistanceFromParent="2." VerticalDistanceFromParent="10." DistanceBetweenSiblings="3." VerticalDistanceBetweenSiblings="1." SubTopicsAlignmentDualVertical="urn:mindjet:Bottom" VerticalSubTopicsConnectionStyle="urn:mindjet:RoundedElbow" VerticalSubTopicsConnectionPoint="urn:mindjet:Outside"/></ap:RootSubTopicDefaultsGroup><ap:CalloutTopicDefaultsGroup><ap:DefaultColor FillColor="fff4f3eb" LineColor="ffc4a224"/><ap:DefaultText TextAlignment="urn:mindjet:Left" TextCapitalization="urn:mindjet:None" PlainText="Callout"><ap:Font Color="ff332b09" Size="10." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultCalloutFloatingTopicShape CalloutFloatingTopicShape="urn:mindjet:RoundedRectangleBalloon" LeftMargin="2." RightMargin="2." TopMargin="2." BottomMargin="2."/><ap:DefaultTopicLayout Width="61." Padding="2."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Center" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" SubTopicsVerticalAlignment="urn:mindjet:Middle" SubTopicsVerticalGrowthDirection="urn:mindjet:AutomaticVertical" DistanceFromParent="2." VerticalDistanceFromParent="10." DistanceBetweenSiblings="3." VerticalDistanceBetweenSiblings="1." SubTopicsAlignmentDualVertical="urn:mindjet:Center"/><ap:DefaultSubTopicsVisibility Hidden="false"/></ap:CalloutTopicDefaultsGroup><ap:CalloutSubTopicDefaultsGroup Level="0"><ap:DefaultColor FillColor="00000000" LineColor="ffc4a224"/><ap:DefaultText TextAlignment="urn:mindjet:Left" TextCapitalization="urn:mindjet:None" PlainText="Subtopic"><ap:Font Color="ff252217" Size="9." Name="Segoe UI" Bold="false"/></ap:DefaultText><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:Line" LeftMargin="4." RightMargin="4." TopMargin="0.20000000298023224" BottomMargin="0.20000000298023224"/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Center" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" SubTopicsVerticalAlignment="urn:mindjet:Middle" SubTopicsVerticalGrowthDirection="urn:mindjet:AutomaticVertical" DistanceFromParent="2." VerticalDistanceFromParent="10." DistanceBetweenSiblings="3." VerticalDistanceBetweenSiblings="1." SubTopicsAlignmentDualVertical="urn:mindjet:Center"/><ap:DefaultSubTopicsVisibility Hidden="false"/></ap:CalloutSubTopicDefaultsGroup><ap:LabelTopicDefaultsGroup><ap:DefaultColor FillColor="fff8f8f8" LineColor="ff333333"/><ap:DefaultText TextAlignment="urn:mindjet:Left" TextCapitalization="urn:mindjet:None" PlainText="Floating Topic"><ap:Font Color="ff333333" Size="12." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultLabelFloatingTopicShape LabelFloatingTopicShape="urn:mindjet:RoundedRectangle" LeftMargin="2." RightMargin="2." TopMargin="2." BottomMargin="2." VerticalLeftMargin="6." VerticalRightMargin="6." VerticalTopMargin="2." VerticalBottomMargin="2." VerticalLabelFloatingTopicShape="urn:mindjet:RoundedRectangle"/><ap:DefaultTopicLayout Width="90." Padding="2."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Center" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" SubTopicsVerticalAlignment="urn:mindjet:Middle" SubTopicsVerticalGrowthDirection="urn:mindjet:Down" DistanceFromParent="2." VerticalDistanceFromParent="5." DistanceBetweenSiblings="3." VerticalDistanceBetweenSiblings="3." SubTopicsDepth="1" SubTopicsAlignmentDualVertical="urn:mindjet:Center" VerticalSubTopicsConnectionStyle="urn:mindjet:RoundedElbow" VerticalSubTopicsConnectionPoint="urn:mindjet:Outside"/><ap:DefaultSubTopicsVisibility Hidden="false"/></ap:LabelTopicDefaultsGroup><ap:LabelSubTopicDefaultsGroup Level="0"><ap:DefaultColor FillColor="ffffffff" LineColor="ff748a9f"/><ap:DefaultText TextAlignment="urn:mindjet:Left" TextCapitalization="urn:mindjet:None" PlainText="Subtopic"><ap:Font Color="ff333333" Size="9." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:Line" LeftMargin="0.5" RightMargin="0.5" TopMargin="0.5" BottomMargin="0.5" VerticalLeftMargin="6." VerticalRightMargin="6." VerticalTopMargin="1." VerticalBottomMargin="1." VerticalSubTopicShape="urn:mindjet:RoundedRectangle"/><ap:DefaultTopicLayout Width="61."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Center" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" SubTopicsVerticalAlignment="urn:mindjet:Middle" SubTopicsVerticalGrowthDirection="urn:mindjet:AutomaticVertical" VerticalDistanceFromParent="3." DistanceBetweenSiblings="3." VerticalDistanceBetweenSiblings="3." SubTopicsAlignmentDualVertical="urn:mindjet:Bottom" VerticalSubTopicsConnectionStyle="urn:mindjet:RoundedElbow"/><ap:DefaultSubTopicsVisibility Hidden="false"/></ap:LabelSubTopicDefaultsGroup><ap:LabelSubTopicDefaultsGroup Level="1"><ap:DefaultColor FillColor="ffffffff"/><ap:DefaultText TextAlignment="urn:mindjet:Left" TextCapitalization="urn:mindjet:None" PlainText="Subtopic"><ap:Font Color="ff333333" Size="9." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:Line" LeftMargin="0.5" RightMargin="0.5" TopMargin="0.5" BottomMargin="0.5" VerticalLeftMargin="6." VerticalRightMargin="6." VerticalTopMargin="1." VerticalBottomMargin="1." VerticalSubTopicShape="urn:mindjet:Line"/><ap:DefaultTopicLayout Width="61."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Center" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" SubTopicsVerticalAlignment="urn:mindjet:Middle" SubTopicsVerticalGrowthDirection="urn:mindjet:AutomaticVertical" VerticalDistanceFromParent="3." DistanceBetweenSiblings="3." VerticalDistanceBetweenSiblings="3." SubTopicsAlignmentDualVertical="urn:mindjet:Bottom" VerticalSubTopicsConnectionStyle="urn:mindjet:RoundedElbow"/></ap:LabelSubTopicDefaultsGroup><ap:OrgChartTopicDefaultsGroup><ap:DefaultColor FillColor="ffeef4fa" LineColor="ff3170b3"/><ap:DefaultText TextAlignment="urn:mindjet:Center" TextCapitalization="urn:mindjet:None" VerticalTextAlignment="urn:mindjet:Top" PlainText="Org-Chart Topic"><ap:Font Color="ff0f252d" Size="12." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultSubTopicShape VerticalLeftMargin="5." VerticalRightMargin="5." VerticalTopMargin="2." VerticalBottomMargin="2." VerticalSubTopicShape="urn:mindjet:RoundedRectangle"/><ap:DefaultLabelFloatingTopicShape VerticalLeftMargin="5." VerticalRightMargin="5." VerticalTopMargin="2." VerticalBottomMargin="2." VerticalLabelFloatingTopicShape="urn:mindjet:RoundedRectangle"/><ap:DefaultCalloutFloatingTopicShape VerticalCalloutFloatingTopicShape="urn:mindjet:RoundedRectangleBalloon" VerticalLeftMargin="5." VerticalRightMargin="5." VerticalTopMargin="2." VerticalBottomMargin="2."/><ap:DefaultTopicLayout TopicLayoutHorizontalAlignment="urn:mindjet:Center" TopicLayoutVerticalAlignment="urn:mindjet:Center" TopicTextAndImagePosition="urn:mindjet:TextRightImageLeft" TopicWidthControl="urn:mindjet:AutoWidth" Width="50." MinimumHeight="5." Padding="2."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Center" SubTopicsGrowth="urn:mindjet:Vertical" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" SubTopicsShapeWidthFactor="1." SubTopicsVerticalAlignment="urn:mindjet:Middle" SubTopicsVerticalGrowthDirection="urn:mindjet:AutomaticVertical" DistanceFromParent="5." VerticalDistanceFromParent="5." DistanceBetweenSiblings="1." VerticalDistanceBetweenSiblings="3.4000000953674316" SubTopicsDepth="1" SubTopicsAlignmentDualVertical="urn:mindjet:Center" VerticalSubTopicsConnectionStyle="urn:mindjet:RoundedElbow" VerticalSubTopicsConnectionPoint="urn:mindjet:Outside"/><ap:DefaultSubTopicsVisibility Hidden="false"/></ap:OrgChartTopicDefaultsGroup><ap:OrgChartSubTopicDefaultsGroup Level="0"><ap:DefaultColor FillColor="ffeaf5ee" LineColor="ff6ebb89"/><ap:DefaultText TextAlignment="urn:mindjet:Center" TextCapitalization="urn:mindjet:None" VerticalTextAlignment="urn:mindjet:Top" PlainText="Subtopic"><ap:Font Color="ff102c2b" Size="10." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultSubTopicShape VerticalLeftMargin="5." VerticalRightMargin="5." VerticalTopMargin="0.5" VerticalBottomMargin="0.5" VerticalSubTopicShape="urn:mindjet:RoundedRectangle"/><ap:DefaultCalloutFloatingTopicShape VerticalCalloutFloatingTopicShape="urn:mindjet:RectangleBalloon" VerticalLeftMargin="2." VerticalRightMargin="2." VerticalTopMargin="2." VerticalBottomMargin="2."/><ap:DefaultTopicLayout TopicLayoutHorizontalAlignment="urn:mindjet:Center" TopicLayoutVerticalAlignment="urn:mindjet:Center" TopicTextAndImagePosition="urn:mindjet:TextRightImageLeft" TopicWidthControl="urn:mindjet:AutoWidth" Width="50." MinimumHeight="5." Padding="1."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Bottom" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" SubTopicsShapeWidthFactor="1." SubTopicsVerticalAlignment="urn:mindjet:Middle" SubTopicsVerticalGrowthDirection="urn:mindjet:AutomaticVertical" DistanceFromParent="3." VerticalDistanceFromParent="3." DistanceBetweenSiblings="3." VerticalDistanceBetweenSiblings="1." SubTopicsDepth="1" SubTopicsAlignmentDualVertical="urn:mindjet:Center" SubTopicsTreeConnectionPoint="urn:mindjet:Inside" VerticalSubTopicsConnectionStyle="urn:mindjet:Elbow" VerticalSubTopicsConnectionPoint="urn:mindjet:Outside"/><ap:DefaultSubTopicsVisibility Hidden="false"/></ap:OrgChartSubTopicDefaultsGroup><ap:OrgChartSubTopicDefaultsGroup Level="1"><ap:DefaultColor FillColor="ffedf6f0" LineColor="ff6ebb89"/><ap:DefaultText TextAlignment="urn:mindjet:Center" TextCapitalization="urn:mindjet:None" VerticalTextAlignment="urn:mindjet:Top" PlainText="Subtopic"><ap:Font Color="ff192223" Size="10." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:RoundedRectangle" LeftMargin="1." RightMargin="1." TopMargin="1." BottomMargin="1." VerticalLeftMargin="0.5" VerticalRightMargin="0.5" VerticalTopMargin="0.5" VerticalBottomMargin="0.5" VerticalSubTopicShape="urn:mindjet:Rectangle"/><ap:DefaultCalloutFloatingTopicShape VerticalCalloutFloatingTopicShape="urn:mindjet:RectangleBalloon" VerticalLeftMargin="2." VerticalRightMargin="2." VerticalTopMargin="2." VerticalBottomMargin="2."/><ap:DefaultTopicLayout TopicLayoutHorizontalAlignment="urn:mindjet:Center" TopicLayoutVerticalAlignment="urn:mindjet:Center" TopicTextAndImagePosition="urn:mindjet:TextRightImageLeft" TopicWidthControl="urn:mindjet:AutoWidth" Width="50." MinimumHeight="5." Padding="1."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Bottom" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" SubTopicsShapeWidthFactor="1." DistanceFromParent="3." VerticalDistanceFromParent="3." DistanceBetweenSiblings="3." VerticalDistanceBetweenSiblings="1." SubTopicsDepth="1" SubTopicsAlignmentDualVertical="urn:mindjet:Center" VerticalSubTopicsConnectionStyle="urn:mindjet:Elbow" VerticalSubTopicsConnectionPoint="urn:mindjet:Outside"/></ap:OrgChartSubTopicDefaultsGroup><ap:OrgChartSubTopicDefaultsGroup Level="2"><ap:DefaultColor FillColor="00000000" LineColor="ff999999"/><ap:DefaultText TextAlignment="urn:mindjet:Center" TextCapitalization="urn:mindjet:None" VerticalTextAlignment="urn:mindjet:Top" PlainText="Subtopic"><ap:Font Color="ff101418" Size="9." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:Line" LeftMargin="1." RightMargin="1." TopMargin="1." BottomMargin="1." VerticalLeftMargin="0.5" VerticalRightMargin="0.5" VerticalTopMargin="0.5" VerticalBottomMargin="0.5" VerticalSubTopicShape="urn:mindjet:Rectangle"/><ap:DefaultCalloutFloatingTopicShape VerticalCalloutFloatingTopicShape="urn:mindjet:RectangleBalloon" VerticalLeftMargin="2." VerticalRightMargin="2." VerticalTopMargin="2." VerticalBottomMargin="2."/><ap:DefaultTopicLayout TopicLayoutHorizontalAlignment="urn:mindjet:Center" TopicLayoutVerticalAlignment="urn:mindjet:Center" TopicTextAndImagePosition="urn:mindjet:TextRightImageLeft" TopicWidthControl="urn:mindjet:AutoWidth" Width="50." MinimumHeight="5." Padding="1."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Bottom" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" SubTopicsShapeWidthFactor="1." DistanceFromParent="3." VerticalDistanceFromParent="3." DistanceBetweenSiblings="3." VerticalDistanceBetweenSiblings="1." SubTopicsDepth="1" SubTopicsAlignmentDualVertical="urn:mindjet:Center" VerticalSubTopicsConnectionStyle="urn:mindjet:Elbow" VerticalSubTopicsConnectionPoint="urn:mindjet:Outside"/></ap:OrgChartSubTopicDefaultsGroup><ap:RelationshipDefaultsGroup><ap:DefaultColor FillColor="00000000" LineColor="ffc04b00"/><ap:DefaultLineStyle LineDashStyle="urn:mindjet:RoundDot" LineWidth="1.5"/><ap:DefaultConnectionStyle ConnectionShape="urn:mindjet:NoArrow" Index="0"/><ap:DefaultConnectionStyle ConnectionShape="urn:mindjet:Arrow" Index="1"/><ap:DefaultRelationshipLineShape LineShape="urn:mindjet:Bezier"/></ap:RelationshipDefaultsGroup><ap:BoundaryDefaultsGroup><ap:DefaultLineStyle LineDashStyle="urn:mindjet:Solid" LineWidth="1."/><ap:DefaultBoundaryShape BoundaryShape="urn:mindjet:CurvedLine" Margin="0."/></ap:BoundaryDefaultsGroup><ap:Structure StructureGrowthDirection="urn:mindjet:Automatic" UseAutoLayout="true" MinimumMainTopicsHeight="12." FadeNotSelectedObjects="true" UseCurveAntialiasing="true" UseTextAntialiasing="true" MainTopicLineWidth="0.10000000149011612" VerticalMainTopicLineWidth="0.10000000149011612" SiblingSpacing="0." ParentChildSpacing="0." UseOrganicLines="false" HideCollapseSign="false"/><ap:BackgroundFill FillColor="ffffffff"/><ap:NotesDefaultFont Color="ff000000" Size="10." Name="Verdana"/><ap:TimelineSubTopicDefaultsGroup Level="0"><ap:DefaultColor FillColor="ffeef4fa" LineColor="ff3170af"/><ap:DefaultText TextAlignment="urn:mindjet:Left" TextCapitalization="urn:mindjet:None" PlainText=""><ap:Font Color="ff0f252d" Size="12." Name="Segoe UI" Bold="false" Italic="false" Underline="false" Strikethrough="false"/></ap:DefaultText><ap:DefaultSubTopicShape SubTopicShape="urn:mindjet:RoundedRectangle" LeftMargin="1." RightMargin="1." TopMargin="1." BottomMargin="1." VerticalLeftMargin="2." VerticalRightMargin="2." VerticalTopMargin="2." VerticalBottomMargin="2." VerticalSubTopicShape="urn:mindjet:RoundedRectangle"/><ap:DefaultTopicLayout Width="35." Padding="2."/><ap:DefaultSubTopicsShape SubTopicsAlignment="urn:mindjet:Bottom" SubTopicsConnectionPoint="urn:mindjet:Outside" SubTopicsConnectionStyle="urn:mindjet:RoundedElbow" SubTopicsGrowth="urn:mindjet:Horizontal" SubTopicsGrowthDirection="urn:mindjet:AutomaticHorizontal" SubTopicsShape="urn:mindjet:Vertical" SubTopicsVerticalAlignment="urn:mindjet:Middle" SubTopicsVerticalGrowthDirection="urn:mindjet:AutomaticVertical" DistanceFromParent="5.5" VerticalDistanceFromParent="10." DistanceBetweenSiblings="3.4000000953674316" VerticalDistanceBetweenSiblings="1." SubTopicsAlignmentDualVertical="urn:mindjet:Bottom" VerticalSubTopicsConnectionStyle="urn:mindjet:RoundedElbow" VerticalSubTopicsConnectionPoint="urn:mindjet:Outside"/><ap:DefaultSubTopicsVisibility Hidden="false"/></ap:TimelineSubTopicDefaultsGroup></ap:StyleGroup><ap:MapViewGroup ViewIndex="0" RowIndex="0" ColumnIndex="0" SplitterRatio="0."><ap:ZoomFactor ZoomFactor="0.97000002861022949"/></ap:MapViewGroup><ap:DocumentGroup><ap:Language Language="zh-sim"/><ap:Creator UserName="windat337@outlook.com" UserEmail=""/><ap:LastModificator UserName="lenovo" UserEmail=""/><ap:Author UserName="Mindjet" UserEmail=""/><ap:Version Major="143"/><ap:Statistics NumberOfTopics="277" NumberOfWords="402" NumberOfHyperlinks="0" NumberOfRelationships="0" NumberOfPictures="0" NumberOfBoundaries="0" NumberOfNotes="0"/><ap:DateTimeStamps Created="2017-12-19T16:14:03" LastModified="2018-01-03T13:25:09"/><ap:Description Comments="The MindManager default map template."/><ap:PreviewImageData ImageType="urn:mindjet:PngImage" CustomImageType=""><cor:Base64 xsi:nil="false">iVBORw0KGgoAAAANSUhEUgAAACwAAADcCAMAAAFLz4O8AAADAFBMVEX////39/e9vb3W1tZrvYycnJzn5+fOzs7v7++tra3e3t7Gxsa1tbWlpaVra2t7e3uMjIxKSkpaWlr///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9At+aVAAAACXBIWXMAAC4kAAAuJAEq4ZkJAAAGhElEQVR4nO1ZjZLkKAiOXSuUyGxy8/4P6SMcqEk0kp/em925qzprptsmXyMgCNhTymMy39h7Xz+R255FlxKWT9h+wQ1cgtBOWKc5cfm0rsA0/QgHSH6j8gbtM0iv8okJYdo5t/M07eJX6ac58Pb07HVJ0X669BSeVIWN4jdhJ1V7peOKZ5ft6VFf6lPSua9KVT4QRVNOwVGlc6N46ufsJ4AyRTzBZGs5V3Cw0YG9gUcZ8ZSPLBiq1FPKivkG4w38HPY5RjR5XsxdmfttVMtXjJry1dgTs5NUHdmw7ahvmUOxDqZY17rAO7R5un2OKg9ywCiuJPtY9Q644ylFem6HfU5Aoj5t9FeLCaa+1X9UdNjpqNqaPvDOnDGrm9fFjQ4Npp27Ya7KYEeHwjPPQwobnRqMfAtXX/poMO1aIdH6lY5/TGvE3Oi42mpfePfD3R9kP9TfAn/W70gAVU/fWTZytWTZu0jE+rceUMN4Rl5V6si+RX/GnxwX/cBx1aJDi5c4OUstJggOHD1Z8lpuMsi4ohcxGkYAjkWYFMNxyS3uj0yYBrnflwQ8r/vq4yxJQMM1xxf1YXIhiRNPEzX+0V5uZBLDZ/PgCTrgfjB+zZIPybiwh4OW2KNryLU+2KjRkt0tWY0dODD6jpxz3ohu5UabTNVyR/I5k4G/5IzA3h/ZZPTIRwSM44oFzYBwJGt2NtDm6Mgk3CSMYmx2hw9yo1eNlHmI4JBdy+Rok3VEk9wLLryXEOqKIkXdnwlXP8Vt1jLhA5N+RciLNOqQJhwgJCL3s1E+8m+OBjLJVjJpVBpOiI0MIn+pV5LWRtFxziR+kV1RuwGETR3fDFtAZUIA5EbymToOHYE7yi1EKRaP6cjU8pz315A1CEZy3NCfSN5xPrbz+ROd1mBuYQ4QPWEV3CkZ+6PghUjGkic5TZIAGekovcAZ6DN13iWf5DRzSTZNFTbenqJ3cebsmKQZM5eQkthBk/u2nsH7hGxHgy5JaGTAclh+vanIJruGDKFUggH7WrRk194v9hI+rUcYdJ3VK35X0v3zZCYfubYpuAYQoKX8q2ey8FzAR97HPDpJn2tJYiZuLepN8scvk7XVphligI7MubjCdCCnLVW/ueSP1FhwJ3sLXMjaOx7Ja/p8zOSELHzYRA+7o+Q5HllNHj54KH3eleRDmyU61kraz1mV0olh1UgwuFCuq4aySn0Qf7GueouMJGEjHaq8NWSw0NiJLnKXFp3KXriyI5MLuHq+epHeASjZj+OBgGp2KRSiNNqw3yNsBR7uaEmjvKyeUi9vJMdKhZAcSqmBbWpAKWA2t+LyxEUXFCy1DrgVrAVqtzPhpbdOaFXfoy583NQrMJVjSTpLT+CjrhLkPTlYLCvxSyuokX7Wmz8V40+BD4X+9Tg43ulAz6W4uAcPB9wFGIpDi8+ghIoT94o108weeYkcZphj3WyomtVLzHoVrK/qXeJZkslpdSo5m2hwklMxdpu1JcM12AfxI441OK8VfCbGajrchqaeM/C2Kc34j7hoHdhe5n8RZ3EjgL29uhowRIpbpDbmEHmBzwCzFDlhdeZ64uRdiWnivYm1RjnLnm1Kf5bdgOMWXBoEd9Z4UZGZ9Xrx3s6SqfiZzP34bjC5x+CnviGBe2ianeQmOWPkgJGZw6R3D/VxLdI6zgiRKYTgvIfZoV8OjiTf1oZk4jMXMsZXOlI9aiTTYXC3qY0ybwBR/B6ckTcXw/b4DrBRSdRWx3UJZAsOC+xn3c6VdF6dTK+P46aWb/UFldZJaMnMGd0XVOKVNliL36cF1cX4H/zbwJpLpIqYl8SxS/REMPiQYKU6kqSCbS0q5wzEruRCraTto0CKK2o7Sjp2ly1Y65vlr/2B1cBlcBx8eoySCjbb/BPOL/Mi/gT8YTL+t4CrzWcfg7bv0iEtcArWa7xjdXEBfkOMOzDB6HUHsK8VqosAVqHfg4vaHBg8X4sk4PKDr9QqyPdgOj3bTPDTsYElqqQJZ9jqhSsw5TNYXi4W2qyx+KBlwZ0YmJOIxDvdaSlgyE3Rk00v4IdDfKO0ziH/mHQth4AhDJct5+B3XDS8I3Mt65H0l+Q7F+0bhlvwG2J8B3hVQ3/ruASrZQAkG5D8O00LZP5eDR8fbFeoxs80FzL72Ukn5bdrpLr7UgHrbZFeGcUt5qcsX3MUrUft2M8bCtrXjA/ALvW3IWcKos/34aU9d3pv4cmyMw3N+Tr+BuiCHauSIDX1AAAAAElFTkSuQmCC</cor:Base64></ap:PreviewImageData><ap:DocumentPath DocumentPath=""/></ap:DocumentGroup><ap:MarkersSetGroup><ap:IconMarkersSets><ap:IconMarkersSet><ap:Name Name="Flags"/><ap:IconMarkers><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Yes"/><ap:OneStockIcon IconType="urn:mindjet:FlagGreen"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Maybe"/><ap:OneStockIcon IconType="urn:mindjet:FlagYellow"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Discuss"/><ap:OneStockIcon IconType="urn:mindjet:FlagOrange"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Risk"/><ap:OneStockIcon IconType="urn:mindjet:FlagRed"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Move"/><ap:OneStockIcon IconType="urn:mindjet:FlagPurple"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Defer"/><ap:OneStockIcon IconType="urn:mindjet:FlagBlue"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="No"/><ap:OneStockIcon IconType="urn:mindjet:FlagBlack"/></ap:IconMarker></ap:IconMarkers></ap:IconMarkersSet><ap:IconMarkersSet><ap:Name Name="Arrows"/><ap:IconMarkers><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Up"/><ap:OneStockIcon IconType="urn:mindjet:ArrowUp"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Down"/><ap:OneStockIcon IconType="urn:mindjet:ArrowDown"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Left"/><ap:OneStockIcon IconType="urn:mindjet:ArrowLeft"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Right"/><ap:OneStockIcon IconType="urn:mindjet:ArrowRight"/></ap:IconMarker></ap:IconMarkers></ap:IconMarkersSet><ap:IconMarkersSet><ap:Name Name="Smileys"/><ap:IconMarkers><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Happy"/><ap:OneStockIcon IconType="urn:mindjet:SmileyHappy"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Neutral"/><ap:OneStockIcon IconType="urn:mindjet:SmileyNeutral"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Sad"/><ap:OneStockIcon IconType="urn:mindjet:SmileySad"/></ap:IconMarker></ap:IconMarkers></ap:IconMarkersSet></ap:IconMarkersSets><ap:IconMarkers><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Pro"/><ap:OneStockIcon IconType="urn:mindjet:ThumbsUp"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Con"/><ap:OneStockIcon IconType="urn:mindjet:ThumbsDown"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Question"/><ap:OneStockIcon IconType="urn:mindjet:QuestionMark"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Attention"/><ap:OneStockIcon IconType="urn:mindjet:ExclamationMark"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Decision"/><ap:OneStockIcon IconType="urn:mindjet:JudgeHammer"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Date"/><ap:OneStockIcon IconType="urn:mindjet:Calendar"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Cost"/><ap:OneStockIcon IconType="urn:mindjet:Dollar"/></ap:IconMarker><ap:IconMarker xsi:type="ap:StockIconMarker"><ap:Name Name="Alarm"/><ap:OneStockIcon IconType="urn:mindjet:Emergency"/></ap:IconMarker></ap:IconMarkers><ap:FillColorMarkersName Name="Fill Colors"/><ap:TextColorMarkersName Name="Font Colors"/><ap:TaskPercentageMarkersName Name="Progress"/><ap:TaskPercentageMarkers><ap:TaskPercentageMarker><ap:Name Name="Not done"/><ap:TaskPercentage TaskPercentage="0"/></ap:TaskPercentageMarker><ap:TaskPercentageMarker><ap:Name Name="Quarter done"/><ap:TaskPercentage TaskPercentage="25"/></ap:TaskPercentageMarker><ap:TaskPercentageMarker><ap:Name Name="Half done"/><ap:TaskPercentage TaskPercentage="50"/></ap:TaskPercentageMarker><ap:TaskPercentageMarker><ap:Name Name="Three quarters done"/><ap:TaskPercentage TaskPercentage="75"/></ap:TaskPercentageMarker><ap:TaskPercentageMarker><ap:Name Name="Task done"/><ap:TaskPercentage TaskPercentage="100"/></ap:TaskPercentageMarker></ap:TaskPercentageMarkers><ap:TaskPriorityMarkersName Name="Priority"/><ap:TaskPriorityMarkers><ap:TaskPriorityMarker><ap:Name Name="Priority 1"/><ap:TaskPriority TaskPriority="urn:mindjet:Prio1"/></ap:TaskPriorityMarker><ap:TaskPriorityMarker><ap:Name Name="Priority 2"/><ap:TaskPriority TaskPriority="urn:mindjet:Prio2"/></ap:TaskPriorityMarker><ap:TaskPriorityMarker><ap:Name Name="Priority 3"/><ap:TaskPriority TaskPriority="urn:mindjet:Prio3"/></ap:TaskPriorityMarker><ap:TaskPriorityMarker><ap:Name Name="Priority 4"/><ap:TaskPriority TaskPriority="urn:mindjet:Prio4"/></ap:TaskPriorityMarker><ap:TaskPriorityMarker><ap:Name Name="Priority 5"/><ap:TaskPriority TaskPriority="urn:mindjet:Prio5"/></ap:TaskPriorityMarker></ap:TaskPriorityMarkers></ap:MarkersSetGroup></ap:Map>',
	}
	var formatXMLJson = $.extend(true, {}, _formatXMLJson);
	var replaceStringArray = [
			{	
				source:'\n', 
				target:'&#xA;' 
			},{	
				source:'<', 
				target:'&lt;' 
			},{	
				source:'>', 
				target:'&gt;' 
			},{	
				source:/\"/g, 
				target:'\'' 
			}
		]
	getDeleteParentObj(formatXMLJson);// 删除对象中的parent
	setFormatXMLJsonData(formatXMLJson); //初始化数据
	// 处理不是englishName和chineseName的对象
	for(var key in formatXMLJson){
		if(key != "englishName" && key != "chineseName"){
			var XMLStr = transformationalXML(formatXMLJson[key]); //转换xml
			// 添加开始结束内容
			XMLStr = XMLSTRING.start + XMLStr +XMLSTRING.end;
		}
	}
	// 处理数据
	// 把data处理成每个字段中都有“_nsproperty”
	// 字段属性 例：type:text 转化成 type：{_nsproperty：_nsproperty._attribute.type}，通过_nsproperty._attribute获得
	// 删除对象中的subdata保留_nsproperty中的subdata，并通过_nsproperty.subdata添加type属性。
	// 即：type:{
	// 		_nsproperty：_nsproperty._attribute.type,
	// 		_nsproperty.subdata[].value:{
	// 			_nsproperty：{
	// 				text:_nsproperty.subdata[].text
	// 			}
	// 		}
	// }
	function getDeleteParentObj(data){
		for(var key in data){
			if(key == "parent"){
				delete data[key];
			}else{
				if(typeof(data[key])=="object"){
					getDeleteParentObj(data[key]);
				}
			}
		}
	}
	function setFormatXMLJsonData(data){
		for(var key in data){
			if(typeof(data[key]) == "object" && key!="_nsproperty"){
				if(typeof(data[key]._nsproperty) == "undefined"){  // 对象中未设置_nsproperty
					data[key]._nsproperty = {
						text:key
					}
				}
				for(var keySecond in data[key]){
					if(keySecond!="_nsproperty" && typeof(data[key][keySecond])=="object"){
						if(keySecond == "subdata"){
							delete data[key][keySecond]; // 删除对象中的subdata
						}else{
							setFormatXMLJsonData(data[key][keySecond]);
						}
					}
					if(keySecond=="_nsproperty"){
						if(typeof(data[key][keySecond]._attribute)=="object"){
							for(var thirdKey in data[key][keySecond]._attribute){ // 通过_nsproperty._attribute处理属性键值对
								data[key][thirdKey] = {};
								data[key][thirdKey] = data[key][keySecond]._attribute[thirdKey];
							}
						}
						if(typeof(data[key][keySecond].subdata)=="object"){ // 通过_nsproperty.subdata添加type属性
							for(var index=0; index<data[key][keySecond].subdata.length;index++){
								data[key].type[data[key][keySecond].subdata[index].value] = {};
								data[key].type[data[key][keySecond].subdata[index].value]._nsproperty = {
									text:data[key][keySecond].subdata[index].text
								};
							}
						}
					}
					if(keySecond!="_nsproperty" && typeof(data[key][keySecond])=="string"){  // 处理没有经过处理的有用字符串字段 添加 _nsproperty
						var textStr = data[key][keySecond];
						data[key][keySecond] = {
							_nsproperty:{
								text:keySecond + ":" + textStr
							}
						}
					}
				}
			}
		}
	}
	// 转化为xml
	// 对象结构{_nsproperty：{}，obj1:{},obj2:{}}
	// 读取_nsproperty中的text值，循环obj1，obj2
	function transformationalXML(data){
		var xmlTextStr = '';
		var xmlSubStr = '';
		for(var firstKey in data){
			if(firstKey != "_nsproperty" && typeof(data[firstKey]) == "object"){
				xmlSubStr += transformationalXML(data[firstKey]);
			}
		}
		if(data._nsproperty){
			var text = data._nsproperty.text;
			if(typeof(text)=="undefined"){
				console.error("text属性未找到");
				return false;
			}
			// 判断是否有\n\<\>
			var pattern = /[\n\<\>\"]/g;
			if(pattern.test(text)){
				// 替换字符串中\n\<\>为'&#xA;'/'&lt;'/'&gt;'
				for(index=0;index<replaceStringArray.length;index++){
					text = text.replace(replaceStringArray[index].source,replaceStringArray[index].target);
				}
				xmlTextStr = '<ap:Text PlainText="'+ text +'"><ap:Font/></ap:Text>';
			}else{
				xmlTextStr = '<ap:Text PlainText="'+ text +'"><ap:Font/></ap:Text>';
			}
		}
		if(xmlSubStr == ""){
			var xml = "<ap:Topic>" + xmlTextStr + "</ap:Topic>";
		}else{
			var xml = "<ap:Topic>" + "<ap:SubTopics>" + xmlSubStr + "</ap:SubTopics>" + xmlTextStr + "</ap:Topic>";
		}
		return xml;
	}

	return XMLStr;
}