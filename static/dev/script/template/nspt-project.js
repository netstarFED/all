/*
 * @Desription: 文件说明
 * @Author: netstar.cy
 * @Date: 2019-10-26 17:38:30
 * @LastEditTime: 2019-12-19 10:16:46
 */
/*
	nsMindjetToJS
*/
var nsMindjetToJS = (function(){
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
	return {
		getTags:function(){
			return tags;
		},
	}
})(jQuery);

//处理对象的工具
var nsMindjetToJSTools = {};
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

var nsProject = (function() {
//--------------------------------项目处理组件 start--------------------------------
var projectObj = {};  //整体配置参数
var defalutConfig = {};		//默认配置对象
var nstemplate = {
		screenWidth:$(window).width(),    //屏幕宽
		screenHeight:$(window).height(),	//屏幕高
		menuWidth:240,  //菜单宽
		paddingTwo:30,	//内容显示区域外边距
		labelWidth:100,	//标题栏宽度
		scrollbar:17,	//滚动条看度
		tableDefWidth :30, //表格字段列默认宽度
		tableMinWidth :20,//表格字段列最小宽度
		tableMaxWidth: 150//表格字段列最大宽度
	};
defalutConfig.ajax = {
	type:'GET',
}
//设置默认值
function setDefault(projectObj){
	//设置默认的属性
	if(typeof(projectObj.system)=='undefined'){
		projectObj.system = {};
	}
	//系统默认前缀
	if(typeof(projectObj.system.prefix)=='undefined'){
		projectObj.system.prefix = {};
	}
	//url默认前缀
	if(typeof(projectObj.system.prefix.url)=='undefined'){
		// var protocolName = window.location.protocol;
		// var hostName = window.location.host;
		// var pathName = window.location.pathname;
		// var projectName = pathName.substring(0, pathName.indexOf('/',1))
		// projectObj.system.prefix.url = protocolName + '//' + hostName+projectName;
		projectObj.system.prefix.url = getRootPath();
	}
	//默认字典地址
	projectObj.system.prefix.dict = projectObj.system.prefix.url + '/basDictController/getDictByTableName';
	//默认上传图片地址
	//projectObj.system.prefix.uploadSrc = projectObj.system.prefix.url + '/attachment/upload';
	projectObj.system.prefix.uploadSrc = projectObj.system.prefix.url + '/files/upload';
	// 
	function setUrlBySuffix(_fieldConfig, _type){
		switch(_type){
			case 'text':
				if(typeof(_fieldConfig.remoteAjax)=="string" && _fieldConfig.remoteAjax.indexOf('http:') == -1){
					_fieldConfig.remoteAjax = projectObj.system.prefix.url + _fieldConfig.remoteAjax;
				}
				break;
			//数据处理
			case 'tree-select':
			case 'treeSelect':
			case 'checkbox':
			case 'radio':
				if(_fieldConfig.suffix){
					_fieldConfig.url = projectObj.system.prefix.url + _fieldConfig.suffix;
				}
				break;
			case 'business':
			case 'businessSelect':
				if(typeof(_fieldConfig.source)=="object"){
					if(_fieldConfig.source.suffix){
						if(_fieldConfig.source.suffix.indexOf(',') > -1 && _type == 'business'){
							var suffixArr = _fieldConfig.source.suffix.split(',');
							var urlStr = '';
							for(var i=0; i<suffixArr.length; i++){
								urlStr += projectObj.system.prefix.url + suffixArr[i] + ',';
							}
							urlStr = urlStr.substring(0, urlStr.length-1);
							_fieldConfig.source.url = urlStr;
						}else{
							_fieldConfig.source.url = projectObj.system.prefix.url + _fieldConfig.source.suffix;
						}
					}
				}
				if(typeof(_fieldConfig.search)=="object"){
					if(_fieldConfig.search.suffix){
						_fieldConfig.search.url = projectObj.system.prefix.url + _fieldConfig.search.suffix;
					}
				}
				if(typeof(_fieldConfig.subdataAjax)=="object"){
					if(_fieldConfig.subdataAjax.suffix){
						_fieldConfig.subdataAjax.url = projectObj.system.prefix.url + _fieldConfig.subdataAjax.suffix;
					}
				}
				if(typeof(_fieldConfig.getRowData)=="object"){
					if(_fieldConfig.getRowData.suffix){
						_fieldConfig.getRowData.url = projectObj.system.prefix.url + _fieldConfig.getRowData.suffix;
					}
				}
				if(typeof(_fieldConfig.getFormData)=="object"){
					if(_fieldConfig.getFormData.suffix){
						_fieldConfig.getFormData.url = projectObj.system.prefix.url + _fieldConfig.getFormData.suffix;
					}
				}
				break;
			case 'photoImage':
			// case 'uploadImage':
			// case 'upload':
				if(_fieldConfig.suffix){
					_fieldConfig.url = projectObj.system.prefix.url + _fieldConfig.suffix;
				}else{
					_fieldConfig.url = projectObj.system.prefix.url + '/files/uploadList';
				}
				_fieldConfig.previewUrl = projectObj.system.prefix.url + '/files/images/';
				_fieldConfig.getFileAjax = {
					url : projectObj.system.prefix.url + '/files/getListByIds',
					type : 'GET',
				}
				break;
			case 'cubesInput':
				if(typeof(_fieldConfig.getAjax) == "object"){
					if(_fieldConfig.getAjax.suffix){
						_fieldConfig.getAjax.url = projectObj.system.prefix.url + _fieldConfig.getAjax.suffix;
					}
				}
				if(typeof(_fieldConfig.saveAjax) == "object"){
					if(_fieldConfig.saveAjax.suffix){
						_fieldConfig.saveAjax.url = projectObj.system.prefix.url + _fieldConfig.saveAjax.suffix;
					}
				}
				break;
			case 'standardInput':
				if(typeof(_fieldConfig.ajax) == "object"){
					if(_fieldConfig.ajax.suffix){
						_fieldConfig.ajax.url = projectObj.system.prefix.url + _fieldConfig.ajax.suffix;
					}
				}
				if(typeof(_fieldConfig.subdataAjax) == "object"){
					if(_fieldConfig.subdataAjax.suffix){
						_fieldConfig.subdataAjax.url = projectObj.system.prefix.url + _fieldConfig.subdataAjax.suffix;
					}
				}
				break;
			case 'listSelectInput':
				if(_fieldConfig.suffix){
					_fieldConfig.url = projectObj.system.prefix.url + _fieldConfig.suffix;
				}else{
					_fieldConfig.url = projectObj.system.prefix.uploadSrc;
				}
				if(typeof(_fieldConfig.selectAjax) == "object"){
					if(_fieldConfig.selectAjax.suffix){
						_fieldConfig.selectAjax.url = projectObj.system.prefix.url + _fieldConfig.selectAjax.suffix;
					}
				}
				break;
			case 'upload':
			case 'uploadImage':
				// 手机图片上传用到的参数
				if(_type == "uploadImage"){
					if(_fieldConfig.suffix){
						_fieldConfig.url = projectObj.system.prefix.url + _fieldConfig.suffix;
					}else{
						_fieldConfig.url = projectObj.system.prefix.url + '/files/uploadList';
					}
					_fieldConfig.previewUrl = projectObj.system.prefix.url + '/files/images/';
				}
				_fieldConfig.ajax = {
					url : projectObj.system.prefix.url + '/files/uploadList',
				}
				_fieldConfig.editAjax = {
					url : projectObj.system.prefix.url + '/files/rename',
				}
				_fieldConfig.downloadAjax = {
					url : projectObj.system.prefix.url + '/files/download/',
				}
				_fieldConfig.getFileAjax = {
					url : projectObj.system.prefix.url + '/files/getListByIds',
					type : 'GET',
				}
				_fieldConfig.previewAjax = {
					url : NetStarUtils.getStaticUrl() + '/files/pdf/',
					type : 'GET',
				}
				_fieldConfig.previewImagesAjax = {
					url : projectObj.system.prefix.url + '/files/images/',
					type : 'GET',
				}
				if(typeof(_fieldConfig.produceFileAjax) == "object" && typeof(_fieldConfig.produceFileAjax.suffix) == "string"){
					_fieldConfig.produceFileAjax.url = projectObj.system.prefix.url + _fieldConfig.produceFileAjax.suffix;
				}
				break;
			case 'data':
				_fieldConfig.url = projectObj.system.prefix.dict;
				_fieldConfig.method = 'POST';
				_fieldConfig.data = {tableName:_fieldConfig.urlDictArguments};
				break;
			case 'select2':
			case 'select':
				if(typeof(_fieldConfig.subdata)=='undefined'){
					if(typeof(_fieldConfig.suffix) == 'undefined'){
						_fieldConfig.subdata = [];
						if(debugerMode){
							console.error(_fieldConfig.label+'('+_fieldConfig.id+')字段：'+'的subdata和suffix都未定义未定义，默认空数组');
							console.error(_fieldConfig);
						}
						break;
					}
					_fieldConfig.url = projectObj.system.prefix.url + _fieldConfig.suffix;
					_fieldConfig.method = typeof(_fieldConfig.method) == 'string'?_fieldConfig.method:'post';
					_fieldConfig.dataSrc = typeof(_fieldConfig.dataSrc) == 'string'?_fieldConfig.dataSrc:'rows';
				}
				if(_fieldConfig.linkUrlSuffix && _fieldConfig.linkUrlSuffix.length > 0){
					_fieldConfig.linkUrl = projectObj.system.prefix.url + _fieldConfig.linkUrlSuffix;
				}
				break;
			case 'uploadSingle':
				_fieldConfig.uploadSrc = projectObj.system.prefix.uploadSrc;
				_fieldConfig.method = 'POST';
				break;
			case 'expression':
				var urlType = typeof(_fieldConfig.urlType)=='string'?_fieldConfig.urlType:'items';
				_fieldConfig.listAjax = {
					url: getRootPath() + '/items/getItemList',
					type: 'POST',
					data: {},
					dataSrc: 'rows'
				};
				switch(urlType){
					case 'items':
						_fieldConfig.listAjax.url = getRootPath() + '/items/getItemList';
						_fieldConfig.listAjaxFields = [
							{ name: 'itemId', idField: true, search: false },
							{ name: 'itemCode', title: '项目代码', search: true },
							{ name: 'itemName', title: '项目名称', search: true },
							{ name: 'itemPyItem', search: true },
							{ name: 'itemWbItem', search: true }
						];
						break;
					case 'pfItems':
						_fieldConfig.listAjax.url = getRootPath() + '/pfItems/getPfItemListOfSelect';
						_fieldConfig.listAjaxFields = [
							{ name: 'pfItemId', idField: true, search: false },
							{ name: 'pfItemName', title: '项目名称', search: true },
							{ name: 'pfItemPyItem', search: true },
							{ name: 'pfItemWbItem', search: true }
						];
						break;
				}
				_fieldConfig.assistBtnWords = ['+', '-', '*', '/', '(', ')', '=', '<>', '>', '<', '>=', '<=', 'and', 'or', '清空'];
				_fieldConfig.dataSource = [];
				break;
			case 'input-select':
				if(typeof(_fieldConfig.saveAjax)=='object'){
					if(typeof(_fieldConfig.saveAjax.suffix)=='string'){
						_fieldConfig.saveAjax.url = getRootPath() + _fieldConfig.saveAjax.suffix;
					}
				}
				if(typeof(_fieldConfig.selectConfig)=='object'){
					if(typeof(_fieldConfig.selectConfig.suffix)=='string'){
						_fieldConfig.selectConfig.url = getRootPath() + _fieldConfig.selectConfig.suffix;
					}
				}
				break
		}
	}
	//修改需要重新赋值的属性
	for(businessName in projectObj){
		if(businessName == 'system' || businessName == 'pages' || businessName == 'default'){
			//系统设置的对象
		}else{
			//业务对象 默认值处理 字典
			for(var fieldId in projectObj[businessName].fields){
				var fieldConfig = projectObj[businessName].fields[fieldId];
				setUrlBySuffix(fieldConfig, fieldConfig.mindjetType);
				// switch(fieldConfig.mindjetType){
				// 	//数据处理
				// 	case 'tree-select':
				// 	case 'checkbox':
				// 	case 'radio':
				// 		if(fieldConfig.suffix){
				// 			fieldConfig.url = projectObj.system.prefix.url + fieldConfig.suffix;
				// 		}
				// 		break;
				// 	case 'business':
				// 		if(typeof(fieldConfig.source)=="object"){
				// 			if(fieldConfig.source.suffix){
				// 				fieldConfig.source.url = projectObj.system.prefix.url + fieldConfig.source.suffix;
				// 			}
				// 		}
				// 		if(typeof(fieldConfig.search)=="object"){
				// 			if(fieldConfig.search.suffix){
				// 				fieldConfig.search.url = projectObj.system.prefix.url + fieldConfig.search.suffix;
				// 			}
				// 		}
				// 		if(typeof(fieldConfig.subdataAjax)=="object"){
				// 			if(fieldConfig.subdataAjax.suffix){
				// 				fieldConfig.subdataAjax.url = projectObj.system.prefix.url + fieldConfig.subdataAjax.suffix;
				// 			}
				// 		}
				// 		if(typeof(fieldConfig.getRowData)=="object"){
				// 			if(fieldConfig.getRowData.suffix){
				// 				fieldConfig.getRowData.url = projectObj.system.prefix.url + fieldConfig.getRowData.suffix;
				// 			}
				// 		}
				// 		break;
				// 	case 'photoImage':
				// 	case 'uploadImage':
				// 	case 'upload':
				// 		if(fieldConfig.suffix){
				// 			fieldConfig.url = projectObj.system.prefix.url + fieldConfig.suffix;
				// 		}else{
				// 			fieldConfig.url = projectObj.system.prefix.uploadSrc;
				// 		}
				// 		break;
				// 	case 'data':
				// 		fieldConfig.url = projectObj.system.prefix.dict;
				// 		fieldConfig.method = 'POST';
				// 		fieldConfig.data = {tableName:fieldConfig.urlDictArguments};
				// 		break;
				// 	case 'select2':
				// 	case 'select':
				// 		if(typeof(fieldConfig.subdata)=='undefined'){
				// 			if(typeof(fieldConfig.suffix) == 'undefined'){
				// 				fieldConfig.subdata = [];
				// 				if(debugerMode){
				// 					console.error(fieldConfig.label+'('+fieldConfig.id+')字段：'+'的subdata和suffix都未定义未定义，默认空数组');
				// 					console.error(fieldConfig);
				// 				}
				// 				break;
				// 			}
				// 			fieldConfig.url = projectObj.system.prefix.url + fieldConfig.suffix;
				// 			fieldConfig.method = typeof(fieldConfig.method) == 'string'?fieldConfig.method:'post';
				// 			fieldConfig.dataSrc = typeof(fieldConfig.dataSrc) == 'string'?fieldConfig.dataSrc:'rows';
				// 		}
				// 		break;
				// 	case 'uploadSingle':
				// 		fieldConfig.uploadSrc = projectObj.system.prefix.uploadSrc;
				// 		fieldConfig.method = 'POST';
				// 		break;
				// 	case 'expression':
				// 		var urlType = typeof(fieldConfig.urlType)=='string'?fieldConfig.urlType:'items';
				// 		fieldConfig.listAjax = {
				// 			url: getRootPath() + '/items/getItemList',
				// 			type: 'POST',
				// 			data: {},
				// 			dataSrc: 'rows'
				// 		};
				// 		switch(urlType){
				// 			case 'items':
				// 				fieldConfig.listAjax.url = getRootPath() + '/items/getItemList';
				// 				fieldConfig.listAjaxFields = [
				// 					{ name: 'itemId', idField: true, search: false },
				// 					{ name: 'itemCode', title: '项目代码', search: true },
				// 					{ name: 'itemName', title: '项目名称', search: true },
				// 					{ name: 'itemPyItem', search: true },
				// 					{ name: 'itemWbItem', search: true }
				// 				];
				// 				break;
				// 			case 'pfItems':
				// 				fieldConfig.listAjax.url = getRootPath() + '/pfItems/getPfItemListOfSelect';
				// 				fieldConfig.listAjaxFields = [
				// 					{ name: 'pfItemId', idField: true, search: false },
				// 					{ name: 'pfItemName', title: '项目名称', search: true },
				// 					{ name: 'pfItemPyItem', search: true },
				// 					{ name: 'pfItemWbItem', search: true }
				// 				];
				// 				break;
				// 		}
				// 		fieldConfig.assistBtnWords = ['+', '-', '*', '/', '(', ')', '=', '<>', '>', '<', '>=', '<=', 'and', 'or', '清空'];
				// 		fieldConfig.dataSource = [];
				// 		break;
				// 	case 'input-select':
				// 		if(typeof(fieldConfig.saveAjax)=='object'){
				// 			if(typeof(fieldConfig.saveAjax.suffix)=='string'){
				// 				fieldConfig.saveAjax.url = getRootPath() + fieldConfig.saveAjax.suffix;
				// 			}
				// 		}
				// 		if(typeof(fieldConfig.selectConfig)=='object'){
				// 			if(typeof(fieldConfig.selectConfig.suffix)=='string'){
				// 				fieldConfig.selectConfig.url = getRootPath() + fieldConfig.selectConfig.suffix;
				// 			}
				// 		}
				// 		break
				// }
			}
			// 设置表格的 editConfig 如果没有根据表单配置/默认生成
			for(var columnId in projectObj[businessName].columns){
				var columnConfig = projectObj[businessName].columns[columnId];
				var isSetDef = false; // 是否设置默认表单配置
				if(typeof(columnConfig.editConfig)!="object"){
					isSetDef = true;
					var fieldId = columnConfig.field;
					if($.isArray(projectObj[businessName].field)){
						var fields = projectObj[businessName].field;
						for(var fieldI=0; fieldI<fields.length; fieldI++){
							if(fields[fieldI].id == fieldId){
								isSetDef = false;
								columnConfig.editConfig = $.extend(true, {}, fields[fieldI]);
								delete columnConfig.editConfig.id;
							}
						}
					}
				}
				if(isSetDef){
					var formType = "text";
					switch(columnConfig.variableType){
						case "number":
							formType = 'number';
							break;
						case "date":
							formType = 'date';
							break;
					}
					var defaultFieldConfig = { 
						type:formType, 
						formSource:'table', 
						templateName:'PC',
						variableType: columnConfig.variableType,
					};
					columnConfig.editConfig = defaultFieldConfig;
				}
			}
			// 表格默认值处理
			for(var columnId in projectObj[businessName].columns){
				var columnConfig = projectObj[businessName].columns[columnId];
				// 处理formatHandler的默认值
				if(typeof(columnConfig.columnType)!='undefined'){
					switch(columnConfig.columnType){
						case 'upload':
							columnConfig.formatHandler.data.uploadSrc = projectObj.system.prefix.uploadSrc;
							break;
						case 'href':
							if(columnConfig.formatHandler.data.url && columnConfig.formatHandler.data.url.indexOf('http') == -1){
								columnConfig.formatHandler.data.url = projectObj.system.prefix.url + columnConfig.formatHandler.data.url;
							}
							break;
					}
				}
				if(typeof(columnConfig.editConfig)=="object"){
					setUrlBySuffix(columnConfig.editConfig, columnConfig.editConfig.mindjetType);
				}
			}
			//方法 默认值处理 ajax默认参数
			for(var controllerClassKey in projectObj[businessName].controller){
				for(var controllerKey in projectObj[businessName].controller[controllerClassKey]){
					var controllerObj = projectObj[businessName].controller[controllerClassKey][controllerKey];
					//默认的ajax参数
					for(var ajaxKey in projectObj.default.ajax){
						if(typeof(controllerObj[ajaxKey])=='undefined'){
							controllerObj[ajaxKey] = projectObj.default.ajax[ajaxKey]
						}
					}
				}
			}
			// 设置状态的edit 
			if(typeof(projectObj[businessName].state)!="object"){
				// vo没有状态
				continue;
			}
			for(var stateName in projectObj[businessName].state){
				for(var stateType in projectObj[businessName].state[stateName]){
					var stateFields = projectObj[businessName].state[stateName][stateType];
					for(var fieldId in stateFields){
						// 判断字段中是否有edit
						var fieldEdit = stateFields[fieldId].edit;
						if(typeof(fieldEdit)!="object"){
							continue;
						}
						// 判断edit中是否有form配置 格式化
						if(typeof(fieldEdit.form)=="object"){
							setUrlBySuffix(fieldEdit.form, fieldEdit.form.mindjetType);
						}
						// 判断edit中是否有table配置 格式化editConfig 没有editConfig设置form或默认
						if(typeof(fieldEdit.table)=="object"){
							if(typeof(fieldEdit.table.editConfig)=="object"){
								setUrlBySuffix(fieldEdit.table.editConfig, fieldEdit.table.editConfig.mindjetType);
							}else{
								if(typeof(fieldEdit.form)=="object"){
									fieldEdit.table.editConfig = $.extend(true, {}, fieldEdit.form);
								}else{
									var formType = "text";
									switch(fieldEdit.table.variableType){
										case "number":
											formType = 'number';
											break;
										case "date":
											formType = 'date';
											break;
									}
									var defaultFieldConfig = { 
										type:formType, 
										formSource:'table', 
										templateName:'PC',
										variableType: fieldEdit.table.variableType,
									};
									fieldEdit.table.editConfig = defaultFieldConfig;
								}
							}
							
							var columnConfig = fieldEdit.table;
							// 处理formatHandler的默认值
							if(typeof(columnConfig.columnType)!='undefined'){
								switch(columnConfig.columnType){
									case 'upload':
										columnConfig.formatHandler.data.uploadSrc = projectObj.system.prefix.uploadSrc;
										break;
									case 'href':
										if(columnConfig.formatHandler.data.url && columnConfig.formatHandler.data.url.indexOf('http') == -1){
											columnConfig.formatHandler.data.url = projectObj.system.prefix.url + columnConfig.formatHandler.data.url;
										}
										break;
								}
							}
						}
					}
				}
			}
		}
	}
}
//初始化方法
function init(_projectObj){
	if(debugerMode){
		if(typeof(_projectObj)!='object'){
			console.error('参数必须是object，当前类型是'+typeof(_projectObj),'error')
			console.error(_projectObj);
			return;
		}
	}
	projectObj = $.extend(true, {}, _projectObj);
	setDefault(projectObj);
	var nsWorkflowVo = {
		controller : {
			list : {
				nsWorkflowViewer : {
					text : '流程监控',
					defaultMode : 'workflowViewer',
					englishName : 'nsWorkflowViewer',
				},
				nsWorkflowViewerById : {
					text : '流程监控',
					defaultMode : 'workflowViewerById',
					englishName : 'nsWorkflowViewerById',
				},
				nsWorkflowSubmit : {
					text : '提交',
					defaultMode : 'workflowSubmit',
					workflowType : 'submit',
					englishName : 'nsWorkflowSubmit',
				},
				nsWorkflowSubmitClose : {
					text : '提交并关闭',
					defaultMode : 'workflowSubmit',
					workflowType : 'submit',
					isCloseWindow : true,
					englishName : 'nsWorkflowSubmitClose',
				},
				nsWorkflowMultiSubmit : {
					text : '批量提交',
					defaultMode : 'workflowSubmit',
					workflowType : 'multiSubmit',
					englishName : 'nsWorkflowMultiSubmit',
					requestSource:'checkbox'
				},
				nsWorkflowReject : {
					text : '驳回',
					defaultMode : 'workflowSubmit',
					workflowType : 'reject',
					englishName : 'nsWorkflowReject',
				},
				nsWorkflowCancelSign : {
					text : '取消签收',
					defaultMode : 'workflowSubmit',
					workflowType : 'cancelSign',
					englishName : 'nsWorkflowCancelSign',
				},
				nsWorkflowWithdraw : {
					text : '撤回',
					defaultMode : 'workflowSubmit',
					workflowType : 'withdraw',
					englishName : 'nsWorkflowWithdraw',
				},
				nsWorkflowRollback : {
					text : '回退',
					defaultMode : 'workflowSubmit',
					workflowType : 'rollback',
					englishName : 'nsWorkflowRollback',
				},
				nsWorkflowRebook : {
					text : '改签',
					defaultMode : 'workflowSubmit',
					workflowType : 'rebook',
					englishName : 'nsWorkflowRebook',
				},
				nsWorkflowTrunTo : {
					text : '转办',
					defaultMode : 'workflowSubmit',
					workflowType : 'turnTo',
					englishName : 'nsWorkflowTrunTo',
				},
				nsWorkflowHasten : {
					text : '催办',
					defaultMode : 'workflowSubmit',
					workflowType : 'hasten',
					englishName : 'nsWorkflowHasten',
				},
				nsWorkflowEmergency : {
					text : '应急',
					defaultMode : 'workflowSubmit',
					workflowType : 'emergency',
					englishName : 'nsWorkflowEmergency',
				},
				nsWorkflowComplete : {
					text : '签收',
					defaultMode : 'workflowSubmit',
					workflowType : 'complete',
					englishName : 'nsWorkflowComplete',
				},
				nsWorkflowForWard : {
					text : '提交', // 先签收后提交
					defaultMode : 'workflowSubmit',
					workflowType : 'forWard',
					englishName : 'nsWorkflowForWard',
				},
				nsWorkflowSubmitAllBatch : {
					text : '提交', // 批量提交批次
					defaultMode : 'workflowSubmit',
					workflowType : 'submitAllBatch',
					englishName : 'nsWorkflowSubmitAllBatch',
				},
				nsWorkflowFindHandleRec : {
					text : '查看办理意见', // 查看办理意见
					defaultMode : 'workflowSubmit',
					workflowType : 'findHandleRec',
					englishName : 'nsWorkflowFindHandleRec',
				},
				nsWorkflowUnduComplete : {
					text : '取消结束',
					defaultMode : 'workflowSubmit',
					workflowType : 'unduComplete',
					englishName : 'nsWorkflowUnduComplete',
				},
			}
		}
	}
	nsProject.nsWorkflowVo = nsWorkflowVo;
	projectObj.nsWorkflowVo = nsWorkflowVo;
	$.each(projectObj, function(businessKey,businessValue){
		//根据controller的类型处理基本方法，如果存在controller则根据默认类型进行初始化
		if(businessValue.controller){
			//第一层是controller的分类：new edit query等
			$.each(businessValue.controller, function(classKey,classValue){
				//第二层是具体的controller
				$.each(classValue, function(controllerKey,controllerValue){
					//初始化方法
					initFunction(businessValue, controllerValue);
				});
			})
			
		}
	})
	// $.each(projectObj, function(key,value){
	// 	if(value.field){
	// 		initField(key, value.field);
	// 	}
	// 	if(value.controller){
	// 		if(debugerMode){
	// 			$.each(value.controller,function(keyf,valuef){
	// 				initController(valuef);
	// 			})
	// 		}
	// 		initFunction(value);
	// 	}
	// })
	return projectObj;
}
//ajax通用方法
var ajaxCommon = function (ajaxConfig, handlerObj){
	//ajaxConfig 业务里包含的配置对象
	//handlerObj 有两个，{beforeHandler:f(), afterHandler:f(),value:{}}一个是前置，一个是后置
	//判断handlerObj是否合法
	if(debugerMode){
		if(handlerObj){
			//判断传入参数对象是否合法
			/*$.each(handlerObj, function(key,value){
				if(key!='beforeHandler' && key!='afterHandler' && key!='value'&& key!='successFun' && key!='$btnDom'){
					console.error('回调对象错误:' + key + '，\r\n必须是beforeHandler/afterHandler/value/successFun/$btnDom');
				}
			})*/
			var validArr =
			[
				['beforeHandler', 			'function', 	true], 	//前置回调函数
				['afterHandler', 			'function', 	true], 	//成功回调函数
				['value', 					'object', 		true], 	//操作值
				['successFun', 				'function', 		],	//成功之后的回调函数
				['dialogBeforeHandler', 	'object', 			],	//弹框之前的配置参数
			]
			var isValid = nsDebuger.validOptions(validArr, handlerObj);
			if(isValid === false){return false;}
			//如果需要入参而没有传入则不合法
			if(ajaxConfig.data){
				if(typeof(handlerObj.value)!='object'){
					console.error('调用ajax:'+ajaxConfig.url+' 时未传入必须的参数');
				}
			}
		}
	}

	//克隆配置对象
	var runningConfig = $.extend(true,{},ajaxConfig);

	if(handlerObj.controllerObj){
		//定义了权限码参数
		if(handlerObj.controllerObj.defaultData){
			runningConfig.data = $.extend(true,runningConfig.data,handlerObj.controllerObj.defaultData);
		}
		if(handlerObj.controllerObj.isAjaxDialog){
			runningConfig = handlerObj.controllerObj;
		}
	}
	/*runningConfig.data = handlerObj.value;*/
	runningConfig.successMsg = runningConfig.successMsg ? runningConfig.successMsg : '操作成功';
	//前置回调函数
	if(handlerObj.beforeHandler){
		var innerValue = {};
		if(!$.isEmptyObject(handlerObj.value)){innerValue = handlerObj.value;}
		handlerObj.ajaxConfig = runningConfig;
		handlerObj = handlerObj.beforeHandler(handlerObj);
		if(!$.isEmptyObject(handlerObj.value)){
			if(!$.isArray(handlerObj.value)){
				$.each(innerValue,function(key,value){
					handlerObj.value[key] = value;
				})
			}
		}
	}
	var ajaxConfigOptions = handlerObj.ajaxConfigOptions ? handlerObj.ajaxConfigOptions : {};
	ajaxConfigOptions.dialogBeforeConfig = handlerObj.dialogBeforeConfig;
	var listAjax = nsVals.getAjaxConfig(runningConfig,handlerObj.value,ajaxConfigOptions);
	listAjax.plusData = runningConfig;
	//sjj 20190606  是否有矩阵传值参数
	if(runningConfig.matrixVariable){
		//listAjax.url = listAjax.url + runningConfig.matrixVariable;
	}
	//处理权限码加到ajaxheader
	if(typeof(listAjax.data)=='object'){
		if(typeof(listAjax.data.data_auth_code) == 'string'){
			if(typeof(listAjax.header)!='object'){
				listAjax.header = {};
			}
			listAjax.header.data_auth_code = listAjax.data.data_auth_code;
		}
	}

	nsVals.ajax(listAjax,function(res,plusData){
			//dialog成功回调
			if(handlerObj.$btnDom){
				//handlerObj.$btnDom.removeAttr('disabled');
				var $btns = handlerObj.$btnDom.parent().children('button[ajax-disabled="true"]');
				$btns.removeAttr('ajax-disabled');
				$btns.removeAttr('disabled');
			}
			if(typeof(handlerObj.successFun) == 'function'){
				var enterHandler = typeof(handlerObj.successFun) == 'function'?handlerObj.successFun:{};
				//res.success:ajax成功状态
				//handlerObj.$btnDom:按钮节点
				handlerObj.successFun(res.success,handlerObj.$btnDom);
			}
			if(res.success == false){
				//这里添加错误信息处理
				return false;
			}
			//弹出服务器端返回的msg提示 cy 20180712
			if(res.msg){
				nsalert(res.msg,'success');
			}else{
				//sjj 20190521 如果自定义配置中定义了successMsg返回值，则读取定义的返回值提示语
				if(plusData.plusData.successMsg){
					nsalert(plusData.plusData.successMsg,'success');
				}
			}
			//sjj 20190521判断是否自定义了操作标识
			var returnObjectState;
			switch(plusData.plusData.successOperate){
				case 'refresh':
					returnObjectState = NSSAVEDATAFLAG.VIEW;
					break;
				case 'delete':
					returnObjectState = NSSAVEDATAFLAG.DELETE;
					break;
				case 'edit':
					returnObjectState = NSSAVEDATAFLAG.EDIT;
					break;
				case 'add':
					returnObjectState = NSSAVEDATAFLAG.ADD;
					break;
			}
			//sjj 20190524 如果
			if(typeof(plusData.plusData.objectState)=='number'){
				returnObjectState = plusData.plusData.objectState;
			}
			//后置回调函数 后置回调函数的返回值暂无处理，但是必须回传 以后补充方法
			if(handlerObj.afterHandler){
				if(runningConfig.dataSrc){
					/**lxh 添加plusData */
					if(typeof(returnObjectState)!='undefined'){
						data = res[runningConfig.dataSrc] ? res[runningConfig.dataSrc] : {};
						data.objectState = returnObjectState;
					}else{
						data = res[runningConfig.dataSrc] ? res[runningConfig.dataSrc] : {};
					}
					handlerObj.afterHandler(data,plusData.plusData);
				}else{
					if(typeof(returnObjectState)!='undefined'){
						res.objectState = returnObjectState;
					}
					handlerObj.afterHandler(res);
				}
				if(plusData.plusData.isCloseWindow){
					// lyw 20190910 如果需要在模板里边加关闭方法
					// nsFrame.popPageClose(); 
					// NetstarUI.labelpageVm.closeByIndex(NetstarUI.labelpageVm.labelPageLength-1);
				}
			}
		},true
	)
}
//初始化方法
function initFunction(businessObj, controllerObj){
	//businessObj 业务对象
	//controllerObj 方法对象
	// if(controllerObj.defaultMode == 'wxtPrint'){
	// 	controllerObj.showBtnType = 'state';
		// controllerObj.dropSelectMode = 'checkbox';
		// controllerObj.dropdownSubdata = [
		// 	{
		// 		title : '打印',
		// 		info : '销售单打印',
		// 		ajax : {
		// 			url : getRootPath() + '/saleController/v2/createReport',
		// 			contentType:"application/x-www-form-urlencoded",
		// 			dataSrc : "data",
		// 			type : 'GET',
		// 			data : {
		// 				id : '{listSelected.id}',
		// 				reportTemplateId:"1316634437328307186",
		// 			}
		// 		}
		// 	}
		// ]
	// }
	switch(controllerObj.defaultMode){
		case 'wxtPrint':
			controllerObj.showBtnType = 'state';
			break;
		case 'excelImportVer3':
		case 'excelExportVer3':
			controllerObj.showBtnType = 'importAndExport';
			break;
	}
	//判断是否是非ajax方法，如果是非ajax方法则直接生成function绑定事件
	var noAjaxModeName = ['excelImport'];
	// var isAjaxFunction = true;
	if(noAjaxModeName.indexOf(controllerObj.defaultMode) > -1){
		// isAjaxFunction = false;
		var noAjaxConfig = $.extend(true, {}, controllerObj);
		controllerObj.func = {
			config:noAjaxConfig,
			function:function(){
				/*console.log(controllerObj);
				console.log(noAjaxConfig);*/
				excelImport.init(noAjaxConfig.templateId);
			},
		}
		return;
	}
	//验证
	if(debugerMode){
		if(typeof(controllerObj.suffix)!='string'){
			// console.error('controller:'+controllerObj.suffix+'未定义接口方法');
		}
		var optionsArr = [
			['suffix','string',false],  		//controller地址 必填
			['afterHandler','function'], 		//前置处理函数
			['beforeHandler','function'], 		//后置处理函数
			['data','object'], 					//发送数据定义
			['type','string'], 					//ajax类型，GET POST
			['dataSrc','string'],				//返回值字段名
			['dataType','string'],				//发送数据类型
		];
			nsDebuger.validOptions(optionsArr,controllerObj);
		}
	//参数
	var ajaxConfig = $.extend(true, {}, controllerObj);
	//参数---url
	if(typeof(controllerObj.suffix)=='string'){
		ajaxConfig.url = projectObj.system.prefix.url + controllerObj.suffix;
	}
	// 判断是否存在callbackAjax 如果有转化成完整的地址 lyw
	if(typeof(ajaxConfig.callbackAjax)=='string'){
		ajaxConfig.callbackAjax = projectObj.system.prefix.url + controllerObj.callbackAjax;
	}
	if(controllerObj.getSuffix){
		//弹框之前调用ajax请求链接
		ajaxConfig.getUrl = projectObj.system.prefix.url + controllerObj.getSuffix;
	}
	if(typeof(controllerObj.uploadAjax)=="object"){
		controllerObj.uploadAjax.url = projectObj.system.prefix.url + controllerObj.uploadAjax.suffix;
	}
	if(typeof(controllerObj.importAjax)=="object"){
		controllerObj.importAjax.url = projectObj.system.prefix.url + controllerObj.importAjax.suffix;
	}
	if(typeof(controllerObj.getPanelDataAjax)=="object"){
		controllerObj.getPanelDataAjax.url = projectObj.system.prefix.url + controllerObj.getPanelDataAjax.suffix;
	}
	if(typeof(controllerObj.beforeAjax)=="object"){
		controllerObj.beforeAjax.url = projectObj.system.prefix.url + controllerObj.beforeAjax.suffix;
	}
	//sjj 20190514添加针对getUrl配置不完善的功能,该方法用于临时解决，以后会处理
	if(ajaxConfig.getUrl){
		if(ajaxConfig.getUrl.indexOf('http') == -1){
			ajaxConfig.getUrl = projectObj.system.prefix.url + controllerObj.getUrl;
		}
	}

	delete controllerObj.suffix;

	//通用基本方法
	var ajaxFunc = function(handlerObj){
		if(typeof(handlerObj)=='undefined'){
			handlerObj = {};
		}
		//ajaxCommon(this.config, handlerObj);
		/********sjj20180601 前置处理值*******************/
		/********sjj20180601 前置处理值********************/
		var ajaxHandler = {
			beforeHandler:			typeof(handlerObj.beforeHandler)=='function' ? handlerObj.beforeHandler : handlerObj.ajaxBeforeHandler,
			afterHandler:			typeof(handlerObj.afterHandler)=='function' ? handlerObj.afterHandler : handlerObj.ajaxAfterHandler,
			value:					handlerObj.value ? handlerObj.value : {},
			successFun:				handlerObj.successFun,
			dialogBeforeConfig:		typeof(handlerObj.dialogBeforeHandler)=='object' ? handlerObj.dialogBeforeHandler : {},
			controllerObj:			handlerObj.controllerObj,
			$btnDom:						handlerObj.$btnDom,
			ajaxConfigOptions:	typeof(handlerObj.ajaxConfigOptions)=='object' ? handlerObj.ajaxConfigOptions : {}
		}

    /***************sjj 20190410 针对按钮文本的转换根据数据值调用对应的ajax start************************************************* */
		function setAjaxConfig(valueData){
			if(typeof(ajaxConfig.text) == "string"){
				if(ajaxConfig.text.indexOf('{')>-1){
					var formatConfig = JSON.parse(ajaxConfig.text);
					switch(formatConfig.formatHandler.type){
							case 'changeBtn':
								$.each(formatConfig.formatHandler.data,function(value,keyConfig){
									if (value == valueData[formatConfig.field]){
											if(keyConfig.ajax){
												nsVals.extendJSON(ajaxConfig,keyConfig.ajax);
											}
									}
							});
								break;
					}
				}
			}else{
				console.error('没有配置text');
				console.error(ajaxConfig);
			}
		}
		if(!$.isEmptyObject(ajaxHandler.value)){
			setAjaxConfig(ajaxHandler.value);
		}else{
			if(ajaxHandler.dialogBeforeConfig.selectData){
				setAjaxConfig(ajaxHandler.dialogBeforeConfig.selectData);
			}
		}
		/***************sjj 20190410 针对按钮文本的转换根据数据值调用对应的ajax start************************************************* */

		ajaxCommon(ajaxConfig,ajaxHandler);
	};
	//生成基本方法对象
	controllerObj.func = {
		config:ajaxConfig,
		function:ajaxFunc,
	};
//--------------------------------------------------wxk公共弹窗------------------------------------------------------------		
   	
    if(typeof(controllerObj.defaultMode)=='string'){
    	var defaultModeName = controllerObj.defaultMode;
    	//显示字段
    	var functionField = controllerObj.functionField;
    	//rowData取值方式
    	controllerObj.sourceMode = 'selectedRow';
    	if(defaultModeName.indexOf('tablebtn')>-1){
    	controllerObj.sourceMode = 'tablebtn';
    	}
    	//defaultMode类型
    	var dataUserModeKey = [
    		'dialog','valueDialog','confirm','toPage','loadPage','changePage','ajaxDialog','component','print','custom','templatePrint','workflowViewer','workflowViewerById','workflowSubmit','newtab','viewerDialog','successMessage','dataImport','excelImportVer2','multiDialog','ajaxAndSend','business','previewFile','ajaxNewtab','download','addInfoDialog','ajaxAndPdf','excelExport','wxtPrint','downloadByFile','excelImportVer3','excelExportVer3'
    	];
    	var defaultModeArray=defaultModeName.split(',');
    	for(var mi = 0;mi<defaultModeArray.length;mi++){
    		if(dataUserModeKey.indexOf(defaultModeArray[mi]) >-1){
    			//defaultMode指定类型
    			controllerObj.userMode = defaultModeArray[mi];
    		}
    	}
    	//根据是否包含tablebtn获取方法数据
    	// controllerObj.getFunctionData = function(controllerObj,config){
    	// 	//判断defaultMode中是否包含tablebtn
	    // 	var rowData = null;
	    // 	switch(controllerObj.sourceMode){
	    // 		case "selectedRow":  //(这里为什么表格上部按钮为tableID;表格行按钮为tableId)
	    // 			var tableConfig=baseDataTable.data[config.tableID];
			  //   	//表格是否开启多选
			  //   	var isMulitSelect = tableConfig.dataConfig.isMulitSelect;
			  //   	var isids=controllerObj.dataFormat == 'ids'?true:false;
	    // 			//if(isMulitSelect && isids){     //?
	    // 			if(isMulitSelect){
	    // 				//多选
	    // 				rowData = baseDataTable.getTableSelectData(config.tableID);     
	    // 			}else{
	    // 				//单选
	    // 				rowData = baseDataTable.getSingleRowSelectedData(config.tableID);
	    // 			}
	    // 			break;
	    // 		case "tablebtn":
	    // 			rowData = config.rowData;
	    // 			break;
	    // 	}
	    // 	return rowData;
		 // }
    	switch(controllerObj.userMode){
			case 'dialog':
				controllerObj.func.dialog = function(callBack,Obj){
					var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
					}
					var configJson = $.extend(true,{},Obj);
					//configJson.dialogForm = getDialogForm(businessObj.fields,functionField);
					configJson.controllerObj = functionConfigObj;
					configJson.event = callBack.event;
					dialogCommon(callBack,configJson);
				}
				break;
			//修改弹窗
			case 'valueDialog':
				controllerObj.func.valueDialog = function(callBack,Obj){	
					var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
					}							//id:?
					var configJson = $.extend(true,{},Obj);
					//获取表格行数据
					//configJson.rowObj = controllerObj.getFunctionData(controllerObj,configJson);
					configJson.controllerObj = functionConfigObj;
					configJson.event = callBack.event;
					dialogCommon(callBack,configJson);
					/*if(configJson.rowData){
						dialogCommon(callBack,configJson);
					}*/
				}
				break;
			//ajax弹框
			case 'ajaxDialog':
				controllerObj.func.ajaxDialog = function(callBack,Obj){	
					var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
					}						
					var configJson = $.extend(true,{},Obj);
					configJson.controllerObj = functionConfigObj;
					ajaxDialogCommon(callBack,configJson);
				}
				break;
			//确认弹窗
			case 'confirm':
				controllerObj.func.confirm = function(callBack,Obj){
					var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
					}	
					var configJson = $.extend(true,{},Obj);
					configJson.controllerObj = functionConfigObj;
    				confirmCommon(callBack,configJson);
				}
				break;
			case 'custom':
				//sjj20181030 自定义按钮
				controllerObj.func.custom = function(callBack,Obj){
					$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
					var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
					}	
					var configJson = $.extend(true,{},Obj);
					configJson.controllerObj = functionConfigObj;
					configJson.event = callBack.event;
					callBack.controllerObj = functionConfigObj;
					customCommon(callBack,configJson);
				}
				break;
    		case 'toPage':
    			//跳转界面sjj20180517 btn tablerowbtn
    			controllerObj.func.toPage = function(callback,Obj){
    				$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
    				var functionConfigObj = controllerObj;
    				if(typeof(callback.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
					}
    				var configJson = $.extend(true,{},Obj);
    				configJson.controllerObj = functionConfigObj;
    				toPageCommon(callback,configJson);
    			}
    			break;
    		case 'newtab':
    			//sjj 20190227 添加支持打开新标签页方法
    			controllerObj.func.newtab = function(callback,Obj){
    				$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
    				var functionConfigObj = controllerObj;
    				if(typeof(callback.getFuncConfigHandler)=='function'){
							functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
						}
    				var configJson = $.extend(true,{},Obj);
    				configJson.controllerObj = functionConfigObj;
    				newTabCommon(callback,configJson);
    			}
					break;
			case 'ajaxNewtab':
				//sjj 20191108 添加支持ajax执行完成之后的跳转界面并进行赋值操作 
    			controllerObj.func.ajaxNewtab = function(callback,Obj){
    				$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
    				var configJson = $.extend(true,{},Obj);
					configJson.controllerObj = controllerObj;
					callback.controllerObj = controllerObj;
    				ajaxNewtabCommon(callback,configJson);
    			}
				break;
				case 'multiDialog':
					//sjj 20190815 多url链接拼接成的tab弹出界面
					controllerObj.func.multiDialog = function(callback,obj){
						$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
						var functionConfigObj = controllerObj;
						var configJson = $.extend(true,{},obj);
    				configJson.controllerObj = functionConfigObj;
    				multiDialogCommon(callback,configJson);
					}
					break;
				case 'viewerDialog':
					//sjj 20190403 添加仅支持查看页弹框
					controllerObj.func.viewerDialog = function(callBack,obj){
						$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
						var functionConfigObj = controllerObj;
						var configJson = $.extend(true,{},obj);
    				configJson.controllerObj = functionConfigObj;
    				viewerDialogCommon(callBack,configJson);
					}
					break;
    		case 'loadPage':
    			//在当前窗口打开新界面
    			controllerObj.func.loadPage = function(callback,Obj){
    				$('[type="button"]').blur();
    				var functionConfigObj = controllerObj;
    				if(typeof(callback.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
					}
    				var configJson = $.extend(true,{},Obj);
    				configJson.controllerObj = functionConfigObj;
    				loadPageCommon(callback,configJson);
    			}
    			break;
    		case 'changePage':
    			//跳转界面sjj20180606 btn tablerowbtn
    			controllerObj.func.changePage = function(callback,obj){
    				var functionConfigObj = controllerObj;
    				if(typeof(callback.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callback.getFuncConfigHandler(obj);
					}
    				var configJson = $.extend(true,{},obj);
    				configJson.controllerObj = functionConfigObj;
    				changePageCommon(callback,configJson);
    			}
    			break;
    		case 'component':
    			//自定义组件sjj20180802 
    			controllerObj.func.component = function(callBack,obj){
    				var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
					}
    				var configJson = $.extend(true,{},obj);
    				configJson.controllerObj = functionConfigObj;
    				changeComponentCommon(callBack,configJson);
    			}
    			break;
    		case 'print':
    			//自定义组件sjj 20180928
    			controllerObj.func.print = function(callBack,obj){
    				var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
					}
    				var configJson = $.extend(true,{},obj);
    				configJson.controllerObj = functionConfigObj;
    				printCommon(callBack,configJson);
    			}
				 break;	
			case 'templatePrint':
				 //模板打印 lxh 20181116
    			controllerObj.func.templatePrint = function(callBack,obj){
					// 添加打印中loading
					NetStarUtils.loading('正在处理中');
    				var functionConfigObj = controllerObj;
    				if(typeof(callBack.getFuncConfigHandler)=='function'){
						functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
					}
    				var configJson = $.extend(true,{},obj);
					 configJson.controllerObj = functionConfigObj;
					 callBack.controllerObj = functionConfigObj;
    				templatePrint(callBack,configJson);
    			}
    			break;
			case 'workflowViewer':
				 //工作流 流程监控
    			controllerObj.func.workflowViewer = function(callBack,obj){
    				var configJson = $.extend(true,{},obj);
    				workflowViewer(callBack,configJson);
    			}
    			break;
			case 'workflowViewerById':
					//工作流 流程监控
				controllerObj.func.workflowViewerById = function(callBack,obj){
					var configJson = $.extend(true,{},obj);
					workflowViewerById(callBack,configJson);
				}
				break;
			case 'workflowSubmit':
				 //工作流
    			controllerObj.func.workflowSubmit = function(callBack,obj){
    				var functionConfigObj = controllerObj;
    				var configJson = $.extend(true,{},obj);
					 configJson.controllerObj = functionConfigObj;
    				workflowSubmit(callBack,configJson);
    			}
					break;
						break;
			case 'successMessage':
					//sjj 20190524 按钮类型为successMessage
					controllerObj.func.successMessage = function(callBack,obj){
    				var functionConfigObj = controllerObj;
    				var configJson = $.extend(true,{},obj);
					 configJson.controllerObj = functionConfigObj;
					 successMessage(callBack,configJson);
    			}
					break;
			case 'excelImportVer2':
					// lyw 表格数据导入
					controllerObj.func.excelImportVer2 = function(callBack,obj){
						var functionConfigObj = controllerObj;
    					var configJson = $.extend(true,{},obj);
						configJson.controllerObj = functionConfigObj;
						excelImportVer2(callBack,configJson);
					}
					break;
			case 'ajaxAndSend':
					//sjj 20190929生成报告控件可以设置模板名称可以设置业务id，调用两个方法1、根据模板名称获取模板2、根据模板id和业务id打印templateName，deptId，bllCateCode，languageName	  
					controllerObj.func.ajaxAndSend = function(callBack,obj){
						$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
    				var functionConfigObj = controllerObj;
    				var configJson = $.extend(true,{},obj);
    				configJson.controllerObj = functionConfigObj;
    				ajaxAndSendCommon(callBack,configJson);
					}
					break;
			case 'business':
				//sjj 20190929生成报告控件可以设置模板名称可以设置业务id，调用两个方法1、根据模板名称获取模板2、根据模板id和业务id打印templateName，deptId，bllCateCode，languageName	  
				controllerObj.func.business = function(callBack,obj){
					$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
					var functionConfigObj = controllerObj;
					var configJson = $.extend(true,{},obj);
					configJson.controllerObj = functionConfigObj;
					businessInit(callBack, configJson);
				}
				break;
			case 'previewFile':
				//sjj 20190929生成报告控件可以设置模板名称可以设置业务id，调用两个方法1、根据模板名称获取模板2、根据模板id和业务id打印templateName，deptId，bllCateCode，languageName	  
				controllerObj.func.previewFile = function(callBack,obj){
					$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
					var functionConfigObj = controllerObj;
					var configJson = $.extend(true,{},obj);
					configJson.controllerObj = functionConfigObj;
					previewFileInit(callBack, configJson);
				}
				break;
			case 'download':
				//sjj 20191126 文件下载
				controllerObj.func.download = function(callBack,obj){
					$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
					var functionConfigObj = controllerObj;
					var configJson = $.extend(true,{},obj);
					configJson.controllerObj = functionConfigObj;
					callBack.controllerObj = functionConfigObj;
					downloadFileInit(callBack, configJson);
				}
				break;
			case 'downloadByFile':
				//sjj 20191126 文件下载
				controllerObj.func.downloadByFile = function(callBack,obj){
					$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
					var functionConfigObj = controllerObj;
					var configJson = $.extend(true,{},obj);
					configJson.controllerObj = functionConfigObj;
					callBack.controllerObj = functionConfigObj;
					downloadByFileInit(callBack, configJson);
				}
				break;
			case 'addInfoDialog':
				//sjj 20191203 在当前模板弹出添加页面 
				controllerObj.func.addInfoDialog = function(callBack,obj){
					$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
					var functionConfigObj = controllerObj;
					var configJson = $.extend(true,{},obj);
					configJson.controllerObj = functionConfigObj;
					callBack.controllerObj = functionConfigObj;
					addInfoDialogInit(callBack, configJson);
				}
				break;
			case 'ajaxAndPdf':
				//sjj  20191216  发送ajax成功之后执行调用pdf
				controllerObj.func.ajaxAndPdf = function(callBack,obj){
					$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
					var functionConfigObj = controllerObj;
					var configJson = $.extend(true,{},obj);
					configJson.controllerObj = functionConfigObj;
					callBack.controllerObj = functionConfigObj;
					ajaxAndPdfInit(callBack, configJson);
				}
				break;
			case 'excelExport':
				//sjj  20191216  列表数据导出excel
				controllerObj.func.excelExport = function(callBack,obj){
					$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
					var functionConfigObj = controllerObj;
					var configJson = $.extend(true,{},obj);
					configJson.controllerObj = functionConfigObj;
					callBack.controllerObj = functionConfigObj;
					excelExportInit(callBack, configJson);
				}
				break;
			case 'wxtPrint':
				//sjj 20200205网星通打印
				controllerObj.func.wxtPrint = function(callBack,obj){
					$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
					var functionConfigObj = controllerObj;
					var configJson = $.extend(true,{},obj);
					configJson.controllerObj = functionConfigObj;
					callBack.controllerObj = functionConfigObj;
					wxtPrintInit(callBack, configJson);
				}
				break;
			case 'excelImportVer3':
				// excel导入
				controllerObj.func.excelImportVer3 = function(callBack,obj){
					$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
					var functionConfigObj = controllerObj;
					var configJson = $.extend(true,{},obj);
					configJson.controllerObj = functionConfigObj;
					callBack.controllerObj = functionConfigObj;
					excelImportVer3(callBack, configJson);
				}
				break;
			case 'excelExportVer3':
				// excel导出
				controllerObj.func.excelExportVer3 = function(callBack,obj){
					$('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
					var functionConfigObj = controllerObj;
					var configJson = $.extend(true,{},obj);
					configJson.controllerObj = functionConfigObj;
					callBack.controllerObj = functionConfigObj;
					excelExportVer3(callBack, configJson);
				}
				break;
		}
	 }
	//发送websocket
	function wsConnect(callBack,configJson,dataType){
		//dataType array 或者 object
		//var $btn = $(configJson[0]);
		//$btn.controllerObj = {};
		//var handlerObj = {};
		var handlerObj = callBack.ajaxBeforeHandler(callBack);
		var funcConfig = configJson.controllerObj;
		var fullFormId = handlerObj.config.fullFormId;
		var fullTableId = handlerObj.config.fullTableId;
		var webSocketUrl = funcConfig.webSocketUrl || "";
		//如果没有链接
		if(typeof funcConfig.ws == 'undefined' || funcConfig.ws.readyState !== 1){
			funcConfig.ws = nschat.websocket.wsConnect(function name() {  },function (res) {
				//这里接收返回数据
				/**
				 * res = [{ business:[{},{}],msg:"",..... }]
				 */
				res = res[0];
				if(res.excute){
					NetStarUtils.removeLoading();
			  }
				if(res.success == 'true'){
					var callbackAjax = res.callbackAjax;
					if(typeof callbackAjax != 'undefined' && $.trim(callbackAjax).length > 0){
						var ajaxConfig = {
							url:callbackAjax,
							type:funcConfig.type,
							data:res,
							dataSrc:'data'
						};
						var ajax = nsVals.getAjaxConfig(ajaxConfig);
						nsVals.ajax(ajax,function(res){
							if(res.success){
								switch(dataType){
									case 'array':
										//修改table
										var dataSource = baseDataTable.originalConfig[fullTableId].dataConfig.dataSource;
										var $dataTable = $('#' + fullTableId);
										$.each(res[ajaxConfig.dataSrc].business,function(index,item){
											$.each(dataSource,function(idx,itm){
												if(itm.regReportId == item.regReportId){
													dataSource[idx] = item;
													/* var $tr = $dataTable.find('tr').eq(idx);
													$dataTable.row($tr).data(item).draw(false); */
												}
											});
										});
										baseDataTable.refreshByID(fullTableId);
										break;
									case 'object':
										nsForm.fillValues(res[ajaxConfig.dataSrc],fullFormId);
										console.log('修改form');
										break;
								}

							}
						});
					}
				}else{
					return nsalert(res.msg,'error');
				}
			},webSocketUrl,function(event){
				nsalert("连接出错", 'error');
				NetStarUtils.removeLoading();
				// NetstarUI.confirm.show({
				// 	title:'打印出错',
				// 	content:'<div class="print-alert"><h4><i class=""></i><span>设备连接错误，不能打印</span></h4><p>请点击确认下载安装最新版网星通</p></div>',
				// 	width:500,
				// 	state:'error',
				// 	handler:function (state) {
				// 		if(state){
				// 			var a = document.createElement('a');
				// 			a.href = getRootPath() + '/files/download/10010';
				// 			a.download = '网星通';
				// 			a.click();
				// 		}else{
				// 			console.log('点击取消');
				// 		}
				// 	}
				// });
				NetstarHomePage.systemInfo.netstarDownload({
					text : '“网星通”是物联网终端程序，负责和各种硬件设备互联互通。如使用打印、扫描枪、身份证阅读器、仪器接口、仪器数据采集等功能需要安装托盘程序“网星通”，请点击下载',
					netstarWidth : 600,
					netstarHeight : 450,
				})
			});
		}
	}
	//模板打印
	function templatePrint(callBack,configJson){
		/**
		 * type 
		 * print  	打印
		 * preview 	预览
		 * printAjax 	打印有回调
		 * previewAjax	打印预览有回调
		 */
	//	var $btn = $(configJson[0]);
		//$btn.controllerObj = {};
		//拿到当前模板的配置
		//var handlerObj = {};
		//handlerObj = callBack.ajaxBeforeHandler(handlerObj);
		var pageConfig = callBack.dialogBeforeHandler(callBack);//拿到当前模板选择的数据
		//var funcConfig = callBack.getFuncConfigHandler(configJson);//拿到当前按钮的配置
		var funcConfig = configJson.controllerObj;
		//var templateId = $btn.attr('templateId');//拿到要打印的模板的id
		var templateId = '';
		if(configJson.controllerObj.ajaxData){
			templateId = configJson.controllerObj.ajaxData.templateId;
		}
		//如果按钮上有templateId的话往下执行
		if(!pageConfig.value){return nsalert('请选择一行','error');}
		if(typeof templateId != 'undefined'){
			//公共数据
			var callbackAjax = funcConfig.callbackAjax ? getRootPath() + funcConfig.callbackAjax : "";
			var listName = funcConfig.listName || "";
			//判断打印表格还是表单，表格是数组，表单是对象
			switch($.type(pageConfig.value)){
				case 'array':
						wsConnect(callBack,configJson,'array');
						//如果有规定需要传的字段字段
						var sendMsg = [];
						if(typeof funcConfig.requiredFields != 'undefined'){
							var requiredFields = funcConfig.requiredFields.split(',');
							$.each(pageConfig.value,function(index,item){
								var requiredObj = {};
								$.each(requiredFields,function(idx,itm){
									requiredObj[itm] = item[itm];
									requiredObj.templateId = templateId;
								});
								sendMsg.push(requiredObj);
							});
						}else{
							//没有规定要传的特定字段则发送选中的全部数据
							sendMsg = pageConfig.value;
						}
						//发送数据
						if(NetStarRabbitMQ.linkSuccess){
							//NetStarUtils.loading('正在打印，请稍候...');
						}
						switch (funcConfig.btnType) {
							case 'print':
							nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
								break;
							case 'preview':
							nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
								break;
							case 'printAjax':
							nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
								break;
							case 'previewAjax':
							nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
								break;
							default:
								break;
						}
					break;
				case 'object':
						wsConnect(callBack,configJson,'object');
						//如果有规定需要传的字段字段
						var sendMsg = {};
						if(typeof funcConfig.requiredFields != 'undefined'){
							var requiredFields = funcConfig.requiredFields.split(',');
							for (var key in requiredFields) {
								if (requiredFields.hasOwnProperty(key)) {
									var element = requiredFields[key];
									if($.inArray(key,requiredFields)){
										sendMsg[key] = element;
									}
								}
							}
						}else{
							//没有规定要传的特定字段则发送选中的全部数据
							sendMsg = pageConfig.value;
						}
						//发送数据
						if(NetStarRabbitMQ.linkSuccess){
							//NetStarUtils.loading('正在打印，请稍候...');
						}
						switch (funcConfig.btnType) {
							case 'print':
							nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
								break;
							case 'preview':
							nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
								break;
							case 'printAjax':
							nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
								break;
							case 'previewAjax':
							nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
								break;
							default:
								break;
						}
					break;
			}
		}else{
			return nsalert('该模板没有id，请检查配置','error');
		}
	 }
    //获取弹窗显示字段
    function getDialogForm(businessObj,functionField){
    	if(debugerMode){
			var parametersArr = [
			[businessObj,'object',true],
			[functionField,'object',true],
			]
			var isVaild = nsDebuger.validParameter(parametersArr);
			if(isVaild == false){
				return;
			}
			if(typeof(businessObj.fields)!='object'){
				console.error('无法在指定业务对象中找到字段属性');
				console.error(businessObj)
				return;
			}
		}
		var dialogForm = [];
		for(ffi in functionField){
			if(typeof(businessObj.fields[ffi]) == 'object'){
				// lyw 读取字典
				switch(businessObj.fields[ffi].mindjetType){
					case 'dict':
						if(typeof(nsVals.dictData[businessObj.fields[ffi].dictArguments])=='undefined'){
							console.error('无法找到字典数据:'+businessObj.fields[ffi].dictArguments)
						}else{
							businessObj.fields[ffi].subdata = nsVals.dictData[businessObj.fields[ffi].dictArguments].subdata;
						}
						break;
				}
				var dialogFormField = $.extend(true,{},businessObj.fields[ffi]);
				dialogFormField.mindjetIndex = functionField[ffi].mindjetIndex;
				dialogForm.push(dialogFormField);
			}
		}
		dialogForm.sort(function(a,b){
			return a.mindjetIndex - b.mindjetIndex;
		})
		return dialogForm;
    }
    //确认弹窗
    function confirmCommon(callback,configJson){
		/*
		 * normal  	则只附加参数
		 * object 	则用对象名称包裹，返回标准对象格式
		 * id 		只使用id作为参数
		 * ids 		返回ids格式，用于批量操作
		 */
		var confirmdata;
		var controllerObj = configJson.controllerObj;
		callback.controllerObj = controllerObj;
		//dialog的前置回调
		if(typeof(callback.dialogBeforeHandler)=='function'){
			//加验证
			confirmdata = callback.dialogBeforeHandler(callback);
		}
		if(confirmdata.value === false){
			var infoMsgStr = controllerObj.noSelectInfoMsg ? controllerObj.noSelectInfoMsg:'请选择要处理的数据';
			nsalert(infoMsgStr,'error');
			console.error(infoMsgStr);
			return false;
		}
		//确认弹窗提示信息
		var ajaxObj = {
			//value:confirmdata.value,
			dialogBeforeHandler:{
				btnOptionsConfig:confirmdata.btnOptionsConfig,
				//selectData:confirmdata.value,
				containerFormJson:confirmdata.containerFormJson
			},
			controllerObj:controllerObj.func.config,
			value:confirmdata.value,
		}
		if(callback.event){
			if(callback.event.target.nodeName == 'BODY'){
				if(callback.data.id){
					ajaxObj.$btnDom = $('#'+callback.data.id);
					var $btns = ajaxObj.$btnDom.parent().children('button:not([disabled="disabled"])');
					$btns.attr('ajax-disabled',true);
					$btns.attr('disabled',true);
					//ajaxObj.$btnDom.attr('disabled',true);
				}
			}else{
				ajaxObj.$btnDom = $(callback.event.currentTarget);
				var $btns = ajaxObj.$btnDom.parent().children('button:not([disabled="disabled"])');
				$btns.attr('ajax-disabled',true);
				$btns.attr('disabled',true);
				//ajaxObj.$btnDom.attr('disabled',true);
			}
		}
		/***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
		if(typeof(callback.ajaxBeforeHandler)=='function'){
			ajaxObj.beforeHandler = function(data){
				return callback.ajaxBeforeHandler(data);
			};
		}
		if(typeof(callback.ajaxAfterHandler)=='function'){
			/**lxh 添加plusData */
			ajaxObj.afterHandler = function(data,plusData){
				return callback.ajaxAfterHandler(data,plusData);
			};
		}
		nsconfirm(controllerObj.title,function(isDelete){
			if(isDelete){
				controllerObj.func.function(ajaxObj);
			}else{
				if(ajaxObj.$btnDom){
					//ajaxObj.$btnDom.removeAttr('disabled');
					var $btns = ajaxObj.$btnDom.parent().children('button[ajax-disabled="true"]');
					$btns.removeAttr('ajax-disabled');
					$btns.removeAttr('disabled');
				}
			}
		},'warning')
    }

    //sjj20181030 自定义按钮
    function customCommon(callback,configJson){
    	/*
		 * normal  	则只附加参数
		 * object 	则用对象名称包裹，返回标准对象格式
		 * id 		只使用id作为参数
		 * ids 		返回ids格式，用于批量操作
		 */
		var $btnDom;
		if(callback.event){
			if(callback.event){
				if(callback.event.target.nodeName == 'BODY'){
					if(callback.data.id){
						$btnDom = $('#'+callback.data.id);
						var $btns = $btnDom.parent().children('button:not([disabled="disabled"])');
						$btns.attr('ajax-disabled',true);
						$btns.attr('disabled',true);
						//$btnDom.attr('disabled',true);
					}
				}else{
					$btnDom = $(callback.event.currentTarget);
					var $btns = $btnDom.parent().children('button:not([disabled="disabled"])');
					$btns.attr('ajax-disabled',true);
					$btns.attr('disabled',true);
					//$btnDom.attr('disabled',true);
				}
			}
		}
		var confirmdata;
		var controllerObj = configJson.controllerObj;
		//dialog的前置回调
		if(typeof(callback.dialogBeforeHandler)=='function'){
			//加验证
			confirmdata = callback.dialogBeforeHandler(configJson);
		}
		if(confirmdata){
			if($.isEmptyObject(confirmdata.value)){
				if($btnDom){
					var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
					$btns.removeAttr('ajax-disabled');
					$btns.removeAttr('disabled');
					//$btnDom.removeAttr('disabled');
				}
				return;
			}
		}
		//确认弹窗提示信息
		var ajaxObj = {
			//value:confirmdata.value,
			dialogBeforeHandler:{
				btnOptionsConfig:confirmdata.btnOptionsConfig,
				//selectData:confirmdata.value,
				containerFormJson:confirmdata.containerFormJson,
			},
			controllerObj:controllerObj.func.config,
			value:confirmdata.value,
		};
		if($btnDom){
			ajaxObj.$btnDom = $btnDom;
		}
		// 处理{id:"{id}"} 191020 cy
		var _controllerObj = ajaxObj.controllerObj;
		if(!$.isEmptyObject(_controllerObj.ajaxData)){
			_controllerObj.data = NetStarUtils.getFormatParameterJSON(_controllerObj.ajaxData, ajaxObj.value);
		}
		if(confirmdata.optionsConfig){
			ajaxObj.ajaxConfigOptions = {idField:confirmdata.optionsConfig.idField};
		}
		/***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
		if(typeof(callback.ajaxBeforeHandler)=='function'){
			ajaxObj.beforeHandler = function(data){
				return callback.ajaxBeforeHandler(data);
			};
		}
		if(typeof(callback.ajaxAfterHandler)=='function'){
			ajaxObj.afterHandler = function(data,plusData){
				return callback.ajaxAfterHandler(data,plusData);
			};
		}
		controllerObj.func.function(ajaxObj);
    }

    //公用弹框内容调用 旧弹框
    function dialogContentOld(callback,obj){
		var fieldValue = typeof(obj.value)=='object' ? obj.value : {};
		var controllerObj = obj.controllerObj;
		var functionField = obj.controllerObj.functionField;
		var dialogField = [];
		//如果指定functionField的情况下显示functionField下字段
		if(typeof(functionField)=='object'){
			dialogField = getDialogForm(businessObj,functionField);
		}else{ 
			if(typeof(functionField)=='string'&&functionField.indexOf('nsProject.getFieldsByState')==0){
				// 通过状态获取字段
				dialogField = eval(functionField);
			}else{
				//否则显示全部字段
				dialogField = getDialogForm(businessObj,fieldValue);
			}
		}
		//调整表单form中的下拉框data参数 
		function getSelectData(fieldArr,fieldValue){
			var newFieldArr = fieldArr;
			if($.isEmptyObject(fieldValue)){
				if(!$.isEmptyObject(obj.currentData)){
					fieldValue = obj.currentData;
				}
			}
			for(var fieldI = 0; fieldI<fieldArr.length; fieldI++){
				//是否是ajax请求 需要转data参数
				if(fieldArr[fieldI].url){
					//存在url链接
					function getSelectAjaxData(_params){
						var data = $.extend(true,{},_params);
						if(fieldArr[fieldI].dataFormat == 'ids'){
							if($.isArray(fieldValue)){
								var ids = [];
								for(var dataI=0; dataI<fieldValue.length; dataI++){
									ids.push(fieldValue[dataI][obj.options.idField]);
								}
								ids = ids.join(',');
								data.ids = ids;
							}else{
								data.ids = fieldValue[obj.options.idField];
							}
						}else{
							for(var param in data){
								if(typeof(data[param])=='string'&&
									(data[param].indexOf('this.')>-1||data[param].indexOf('page.')>-1||data[param].indexOf('search')>-1)
								){

								}else{
									data[param] = nsVals.getTextByFieldFlag(data[param],fieldValue);
								}
								if(data[param] === 'undefined'){data[param] = '';}
							}
						}
						return data;
					}
					fieldArr[fieldI].data = typeof(fieldArr[fieldI].data)=='object' ? fieldArr[fieldI].data : {};
					fieldArr[fieldI].data = getSelectAjaxData(fieldArr[fieldI].data);
				}
			}
			return newFieldArr;
		}
		dialogField = getSelectData(dialogField,fieldValue);
		if(fieldValue && dialogField){
			//如果存在form并且存在默认值的情况
			for(var formI = 0; formI<dialogField.length;formI++){
				if(dialogField[formI].voField){
					dialogField[formI].id = dialogField[formI].voField;
				}
				dialogField[formI].value = fieldValue[dialogField[formI].id];
			}
		}
		/****sjj 20180531 添加支持事件回调 start***/
		/*changeHandlerData
			*readonly:{id:false,name:false}
			*disabled:{id:false,name:true}
			*value:{id:'3333',name:"ddd"}
			*hidden:{id:true,name:true}
		*/

		var dialogJson = {
			id:'dialogCommon',//typeof(obj.config.dialogId) == 'undefined'?'dialogCommon':obj.config.dialogId,
			title: typeof(controllerObj.title) =='string'?controllerObj.title:'表单维护',
			size:'m',
			form:dialogField,
			isEnterHandler:true,//控制是否绑定回车事件
			btns:[{
				text:typeof(controllerObj.btnText) =='string'?controllerObj.btnText:'确认',
				isReturn:true,
				handler:function($btnDom,callbackFun){
					//$btnDom:按钮节点
					//callbackFun:ajax方法回调
					var jsonData = nsTemplate.getChargeDataByForm('dialogCommon');
					if(jsonData){
						var handlerJson = {};

						handlerJson.value = jsonData;//formJsonFormat(jsonData,dialogForm);
						handlerJson.controllerObj = controllerObj.func.config;
						//by cy 20180508
						//function和ajax的前后置回调
						if(typeof(callback.ajaxBeforeHandler)=='function'){
							handlerJson.beforeHandler = function(data){
								return callback.ajaxBeforeHandler(data);
							};
						}
						if(typeof(callback.ajaxAfterHandler)=='function'){
							handlerJson.afterHandler = function(data){
								//判断返回值 只有success为true才可以关闭弹框
								if(typeof(data)=='undefined'){
									nsalert('返回值不能为undefined');
								}
								nsdialog.hide();
								return callback.ajaxAfterHandler(data);
								/*if(data.success){
									
								}else{
									//返回失败
									if(data.msg){
										//存在错误返回信息
									}
								}*/
							};
						}
						if(typeof(callbackFun) == 'function'){
							handlerJson.successFun = callbackFun;
							handlerJson.$btnDom=$btnDom;
						}

						/***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
						handlerJson.dialogBeforeHandler = {
							btnOptionsConfig:obj.btnOptionsConfig,
							selectData:obj.value,
							containerFormJson:obj.containerFormJson
						}
						controllerObj.func.function(handlerJson);
					}
				}
			}]
		}
		nsdialog.initShow(dialogJson);
    }
	//dialog和valueDialog公用弹窗
	function dialogCommon(callback,obj){
		//obj.value
		/* 	callback:object 回调函数对象 {ajaxBeforeHandler:funtion(){return}}
		 * 		{
		 *			dialogBeforeHandler:funtion(dialogFormJson){return dialogFormJson;}  	//弹出框弹出之前调用的回调参数 传递参数是弹框的配置参数
		 * 			ajaxBeforeHandler:funtion(ajaxConfig){return ajaxConfig;} 				//ajax调用前的回调参数，传递参数是ajax的所有参数
		 * 			ajaxAfterHandler:funtion(res){return res} 								//ajax调用后的回调参数，传递参数是服务器返回结果
		 * 		}
			obj:object 注：此参数在任何情况下不允许传入 已经在框架初始化时赋值完成
		 */
		//by cy 20180508
		//dialog的前置回调
		if(typeof(callback.dialogBeforeHandler)=='function'){
			//加验证
			obj = callback.dialogBeforeHandler(obj);
		}
		var controllerObj=obj.controllerObj;
		if(controllerObj.userMode === 'valueDialog'){
			//如果当前弹框是valueDialog判断是否有返回值如果返回值为false，则提示必须有需要操作的值
			if(obj.value === false){
				var infoMsgStr = controllerObj.noSelectInfoMsg ? controllerObj.noSelectInfoMsg:'请选择要处理的数据';
				nsalert(infoMsgStr,'error');
				return false;
			}
		}
	dialogContent(callback,obj);
	}
	
    //公用弹框内容调用
    function dialogContent(callback,obj){
			var fieldValue = typeof(obj.value)=='object' ? obj.value : {};
			var controllerObj = obj.controllerObj ? obj.controllerObj : {};
			var functionField = obj.controllerObj.functionField;
			var dialogField = [];
			//如果指定functionField的情况下显示functionField下字段
			if(typeof(functionField)=='object'){
				dialogField = getDialogForm(businessObj,functionField);
			}else{ 
				if(typeof(functionField)=='string'&&functionField.indexOf('nsProject.getFieldsByState')==0){
					// 通过状态获取字段
					dialogField = eval(functionField);
				}else{
					//否则显示全部字段
					dialogField = getDialogForm(businessObj,fieldValue);
				}
			}
			//调整表单form中的下拉框data参数 
			function getSelectData(fieldArr,fieldValue){
				var newFieldArr = fieldArr;
				if($.isEmptyObject(fieldValue)){
					if(!$.isEmptyObject(obj.currentData)){
						fieldValue = obj.currentData;
					}
				}
				for(var fieldI = 0; fieldI<fieldArr.length; fieldI++){
					//是否是ajax请求 需要转data参数
					if(fieldArr[fieldI].url){
						//存在url链接
						function getSelectAjaxData(_params){
							var data = $.extend(true,{},_params);
							if(fieldArr[fieldI].dataFormat == 'ids'){
								if($.isArray(fieldValue)){
									var ids = [];
									for(var dataI=0; dataI<fieldValue.length; dataI++){
										ids.push(fieldValue[dataI][obj.options.idField]);
									}
									ids = ids.join(',');
									data.ids = ids;
								}else{
									data.ids = fieldValue[obj.options.idField];
								}
							}else{
								for(var param in data){
									if(typeof(data[param])=='string'&&
										(data[param].indexOf('this.')>-1||data[param].indexOf('page.')>-1||data[param].indexOf('search')>-1)
									){
	
									}else{
										data[param] = nsVals.getTextByFieldFlag(data[param],fieldValue);
									}
									if(data[param] === 'undefined'){data[param] = '';}
								}
							}
							return data;
						}
						fieldArr[fieldI].data = typeof(fieldArr[fieldI].data)=='object' ? fieldArr[fieldI].data : {};
						fieldArr[fieldI].data = getSelectAjaxData(fieldArr[fieldI].data);
					}
				}
				return newFieldArr;
			}
			if(obj.controllerObj.defaultMode == 'valueDialog'){
				dialogField = getSelectData(dialogField,fieldValue);
				if(fieldValue && dialogField){
					//sjj 20191014 start格式化参数
					if(obj.controllerObj.parameterFormat){
						var parameterFormat = obj.controllerObj.parameterFormat;
						fieldValue = NetStarUtils.getFormatParameterJSON(JSON.parse(parameterFormat),fieldValue);
					}
					//sjj 20191014 end 格式化参数
					//如果存在form并且存在默认值的情况
					for(var formI = 0; formI<dialogField.length;formI++){
						if(dialogField[formI].voField){
							dialogField[formI].id = dialogField[formI].voField;
						}
						dialogField[formI].value = fieldValue[dialogField[formI].id];
					}
				}
			}
			/****sjj 20180531 添加支持事件回调 start***/
			/*changeHandlerData
				*readonly:{id:false,name:false}
				*disabled:{id:false,name:true}
				*value:{id:'3333',name:"ddd"}
				*hidden:{id:true,name:true}
			*/
				// 判断是否有旧组件
				var isOld = false;
				for(var fieldI=0; fieldI<dialogField.length; fieldI++){
					if(typeof(NetstarComponent[dialogField[fieldI].type])=="undefined"){
						isOld = true;
						break;
					}
				}
				if(isOld){
					dialogContentOld(callback,obj);
					return;
				}
			var dialogJson = {
				id:'dialogCommon',//typeof(obj.config.dialogId) == 'undefined'?'dialogCommon':obj.config.dialogId,
				title: typeof(controllerObj.title) =='string'?controllerObj.title:'表单维护',
				templateName:'PC',
				shownHandler:function(data){
					var formConfig = {
						id: data.config.bodyId,
						templateName: 'form',
						componentTemplateName: 'PC',
						defaultComponentWidth:'50%',
						form:dialogField,
						isSetMore:typeof(controllerObj.isSetMore) =='boolean'?controllerObj.isSetMore:false,
						completeHandler:function(data){
							var dataConfig = data.config;
							var id = dataConfig.id;
							var footerId = id.substring(0,id.length-5)+'-footer-group';
							var btnJson = {
								id:footerId,
								pageId:id,
								btns:[
									{
										text:typeof(controllerObj.btnText) =='string'?controllerObj.btnText:'确认',
										handler:function(){
											var jsonData = NetstarComponent.getValues('dialog-dialogCommon-body');
											if(jsonData){
												var handlerJson = {};
	
												handlerJson.value = jsonData;//formJsonFormat(jsonData,dialogForm);
												handlerJson.controllerObj = controllerObj.func.config;
												//by cy 20180508
												//function和ajax的前后置回调
												if(typeof(callback.ajaxBeforeHandler)=='function'){
													handlerJson.beforeHandler = function(data){
														return callback.ajaxBeforeHandler(data);
													};
												}
												if(typeof(callback.ajaxAfterHandler)=='function'){
													handlerJson.afterHandler = function(data){
														//判断返回值 只有success为true才可以关闭弹框
														if(typeof(data)=='undefined'){
															nsalert('返回值不能为undefined');
														}
														NetstarComponent.dialog['dialogCommon'].vueConfig.close();
														return callback.ajaxAfterHandler(data);
														/*if(data.success){
															
														}else{
															//返回失败
															if(data.msg){
																//存在错误返回信息
															}
														}*/
													};
												}
												/***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
												handlerJson.dialogBeforeHandler = {
													btnOptionsConfig:obj.btnOptionsConfig,
													selectData:obj.value,
													containerFormJson:obj.containerFormJson
												}
												controllerObj.func.function(handlerJson);
											}
										}
									},{
										text:'关闭',
										handler:function(){
											NetstarComponent.dialog['dialogCommon'].vueConfig.close();
										}
									}
								]
							};
							//sjj 20190516 如果配置了getDataByAjax需要调用里面的配置
							if(!$.isEmptyObject(controllerObj.getDataByAjax)){
								btnJson.btns.unshift({
									text:controllerObj.getDataByAjax.btnText,
									handler:function(){
										//fieldValue
										var getDataByAjax  = $.extend(true,{},controllerObj.getDataByAjax);
										getDataByAjax.data = fieldValue;
										getDataByAjax.plusData = {dataSrc:controllerObj.getDataByAjax.dataSrc};
										NetStarUtils.ajax(getDataByAjax,function(res,ajaxData){
											if(res.success){
												NetstarComponent.fillValues(res[ajaxData.plusData.dataSrc],'dialog-dialogCommon-body');
											}
										},true)
									}
								});
							}
							vueButtonComponent.init(btnJson);
						},
						// lyw 20191025 返回页面数据
						getPageDataFunc : (function(pageValue){
							return function(){
								return pageValue;
							}
						})(fieldValue)
					};
					NetstarComponent.formComponent.show(formConfig, fieldValue);
					
					//sjj 20191206 添加tipContent  tipClass :  默认 warn error success info 
					if(controllerObj.tipContent){
						var tipClassStr = controllerObj.tipClass;
						$('#'+data.config.bodyId).prepend('<div class="tip-content"><span class="'+tipClassStr+'">'+controllerObj.tipContent+'</span></div>');
					}
				}
			};
			if(typeof(controllerObj.width) !=='undefined' && controllerObj.width!==""){
				dialogJson.width = controllerObj.width;
			}
			if(typeof(controllerObj.height) !=='undefined' && controllerObj.height!==""){
				dialogJson.height = controllerObj.height;
			}
			NetstarComponent.dialogComponent.init(dialogJson);
	
		}
    //ajax弹框
    function ajaxDialogCommon(callback,obj){
    	//dialog的前置回调
		if(typeof(callback.dialogBeforeHandler)=='function'){
			//加验证
			obj = callback.dialogBeforeHandler(obj);
		}
		var controllerObj = obj.controllerObj;
		var getListAjax = {
			url:controllerObj.func.config.getUrl,
			dataSrc:controllerObj.func.config.getDataSrc,
			type:controllerObj.func.config.getType,
			dataFormat:controllerObj.func.config.getDataFormat,
			data:controllerObj.func.config.getData,
			isAjaxDialog:true,//调用弹框调用ajax
			contentType:controllerObj.func.config.getContentType,
		}
		getListAjax.data = $.extend(true,getListAjax.data,controllerObj.func.config.defaultData);
		var handlerJson = {
			controllerObj:getListAjax,
			value:obj.value,
			beforeHandler:callback.ajaxBeforeHandler,
			afterHandler:function(data){
				obj.value = data;
				dialogContent(callback,obj);
			}
		}
		controllerObj.func.function(handlerJson);
	}
	function getPageConfig(backCount){
		var keys = Object.keys(nsFrame.containerPageData);
		if(keys.length > backCount){
			//根据时间戳倒序排序
			keys.sort(function(a,b){
				return nsFrame.containerPageData[b].timeStamp - nsFrame.containerPageData[a].timeStamp;
			});
			return nsFrame.containerPageData[keys[backCount]];
		}
		return null;
	}
    function loadPageCommon(callback,obj){
    	var url = obj.controllerObj.func.config.url;
		var paramObj = $.extend(true,{},obj.controllerObj.func.config.defaultData);
		var callback = callback.ajaxBeforeHandler(callback);
		var configObj = callback.dialogBeforeHandler(obj);
		var historyPageConfig = getPageConfig(0);
		var callBackUrl = window.location.href;
		if(historyPageConfig){
			callBackUrl = historyPageConfig.url;
		}
		var jsonData = {
			data:configObj.value,//接受到的参数
			url:callBackUrl,//回传的url
		}
		if(typeof(NetstarTempValues)=='undefined'){NetstarTempValues = {};}
		var tempValueName = configObj.config.package + new Date().getTime();
		NetstarTempValues[tempValueName] = jsonData;
		if(url){
			var url = url+'?templateparam='+encodeURIComponent(tempValueName);
			if(NetStarUtils.Browser.browserSystem == 'mobile'){
				nsFrame.loadPageVRouter(url);
			}else{
				nsFrame.loadPage(url);
			}
		}else{
			console.warn(obj.controllerObj.func);
			nsalert('不存在url，无法跳转');
		}
    }

		//sjj 20190929 生成报告控件 先发送url链接请求然后根据请求返回参连接websocket
		function ajaxAndSendCommon(callBack,obj){
			var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
			callBack.controllerObj = functionConfig;
			var data = callBack.dialogBeforeHandler(callBack);//获取模板参数
			var templateConfig = data.config;
			//console.log(data.value)
			//var webSocketBody = '{"command":"报表打印","templateId":"a.b.c","listName":"dd","business":{"id":"{id}","reportTemplateId":"{reportTemplateId}"}}';
		
			var callbackAjax = functionConfig.callbackAjax ? getRootPath() + functionConfig.callbackAjax : "";
			if(functionConfig.url){
				var ajaxConfig = {
					url:functionConfig.url,
					type:functionConfig.type,
					contentType:functionConfig.contentType,
					dataSrc:functionConfig.dataSrc,
					plusData:{
						webSocketBody:functionConfig.webSocketBody,
						packageName:templateConfig.package,
						ajaxAfterHandler:callBack.ajaxAfterHandler,
						valueData:data.value,
						callbackAjax:callbackAjax
					},
					//data:{
						//templateName:templateConfig.package,
						//deptId:NetstarMainPage.systemInfo.user.deptId,
						//bllCateCode:'',
						//languageName:'',
					//}
				};
				ajaxConfig.data = NetStarUtils.getFormatParameterJSON(functionConfig.data,data.value);
				NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
					if(res.success){
						var webSocketBody = ajaxOptions.plusData.webSocketBody;
						var ptTemplateConfig = NetstarTemplate.templates.configs[ajaxOptions.plusData.packageName];
						var ptTemplateValueData = ajaxOptions.plusData.valueData;
						var resData = res[ajaxOptions.dataSrc];
						webSocketBody = JSON.parse(webSocketBody);
						var isContinue = true;
						if(webSocketBody.business){
							if(/\[(.*?)\]/.test('[webSocketBody.business]')){
								isContinue = false;
								//是个数组
								var businessD = webSocketBody.business.match(/\[(.*?)\]/);
								businessD = JSON.parse(businessD[1]);
								var businessArr = [];
								var bJson = {};
								var fieldJson = {};
								var keyFieldArr = [];
								for(var fieldI in businessD){
									var fkeyField = businessD[fieldI];
									fkeyField = fkeyField.substring(1,fkeyField.length-1);
									var splitKeyField = fkeyField.split('.');
									if(keyFieldArr.indexOf(splitKeyField[0])>-1){
										
									}else{
										keyFieldArr.push(splitKeyField[0]);
									}
									fieldJson[fieldI] = splitKeyField[1];
								}
								for(var keyFieldI=0; keyFieldI<keyFieldArr.length; keyFieldI++){
									var cKeyField = keyFieldArr[keyFieldI];
									for(var i=0; i<resData[cKeyField].length; i++){
										var bJson = {};
										for(var f in fieldJson){
											var rData = resData[cKeyField][i][fieldJson[f]];
											bJson[f] = rData;
										}
										businessArr.push(bJson);
									}
								}
								webSocketBody.business = JSON.stringify(businessArr);
							}else{
								webSocketBody.business = JSON.stringify(NetStarUtils.getFormatParameterJSON(webSocketBody.business,resData));
							}
						}else if(webSocketBody.fileId){
							//cy 191026 修改 根据lyw截图
							//webSocketBody.fileId = resData.fileId; 
						}
						var formatJson = {};
						for(var formatI in webSocketBody){
							switch(formatI){
								case 'command':
									break;
								case 'templateId':
									break;
								case 'listName':
									break;
								case 'business':
									break;
								default:
									formatJson[formatI] = webSocketBody[formatI];
									break;
							}
						}
						for(var paramsData in formatJson){
							var valueData = {};
							//cy 191026 修改 根据lyw截图
							valueData[paramsData] = formatJson[paramsData];
							// webSocketBody[paramsData] = NetStarUtils.getFormatParameterJSON(valueData,resData);
							valueData = NetStarUtils.getFormatParameterJSON(valueData,resData);
							webSocketBody[paramsData] = valueData[paramsData];
						}
						if(ajaxOptions.plusData.callbackAjax){
							webSocketBody.callbackAjax = ajaxOptions.plusData.callbackAjax;
						}
						nschat.websocket.wsConnect(function(){
							nschat.websocket.send(JSON.stringify(webSocketBody));
						},function(){},'127.0.0.1:8888/Chat')
						//链接websocket
						//nschat.websocket.send(jsonString);
						//nschat.websocket.send(JSON.stringify(webSocketBody));
					}else{
						nsalert('返回值为false','error');
					}
				},true)
			}else{
				var webSocketBody = functionConfig.webSocketBody;
				webSocketBody = JSON.parse(webSocketBody);
				if(webSocketBody.business){
					webSocketBody.business = JSON.stringify(NetStarUtils.getFormatParameterJSON(webSocketBody.business,data.value));
				}else if(webSocketBody.fileId){
					webSocketBody.fileId = data.value.fileId;
				}
				var formatJson = {};
				for(var formatI in webSocketBody){
					switch(formatI){
						case 'command':
							break;
						case 'templateId':
							break;
						case 'listName':
							break;
						default:
							formatJson[formatI] = webSocketBody[formatI];
							break;
					}
				}
				for(var paramsData in formatJson){
					var valueData = {};
					valueData[paramsData] = formatJson[paramsData];
					webSocketBody[paramsData] = NetStarUtils.getFormatParameterJSON(valueData,data.value);
				}
				if(callbackAjax){
					webSocketBody.callbackAjax = callbackAjax;
				}
				nschat.websocket.wsConnect(function(){
					nschat.websocket.send(JSON.stringify(webSocketBody));
				 },function(){},'127.0.0.1:8888/Chat')
			}
		}

    //添加支持打开新标签页的方法
    function newTabCommon(callBack,obj){
		callBack.controllerObj = obj.controllerObj;
    	var url = obj.controllerObj.func.config.suffix;
    	obj = callBack.dialogBeforeHandler(callBack);
		var value = obj.value;
		if(value == false){
			return;
		}
    	if(typeof(value.parentSourceParam)=='object'){
    		value.parentSourceParam.isEditMode = obj.controllerObj.isEditMode;
		}
		var isContinue = true;
		var isAlwaysNewTab = typeof(obj.controllerObj.func.config.isAlwaysNewTab)=='boolean' ? obj.controllerObj.func.config.isAlwaysNewTab : true;
		// var tempValueName = obj.config.package + new Date().getTime();
		var packageName = obj.config.package;
		var packageNameSufficStr = new Date().getTime();

		if(!$.isEmptyObject(value)){
			if(!$.isArray(value)){value = $.extend(true,{},obj.value)};
			//sjj 20190926 判断url链接是否自带配置参数editModel
			if(url.indexOf('?')>-1){
				var search = url.substring(url.indexOf('?')+1,url.length);
				var paramsObj = search.split('&');
				var resultObject = {};
				for (var i = 0; i < paramsObj.length; i++){
					idx = paramsObj[i].indexOf('=');
					if (idx > 0){
						resultObject[paramsObj[i].substring(0, idx)] = paramsObj[i].substring(idx + 1);
					}
				}
				if(typeof(value)!='object'){value = {};}
				$.each(resultObject, function (key, text) {
					value[key] = text;
				});
				url = url.substring(0,url.indexOf('?'));
			}

			// var btnOptions = typeof(obj.btnOptionsConfig) == "object" && typeof(obj.btnOptionsConfig.options) == "object" ? obj.btnOptionsConfig.options : {};
			// var idField = btnOptions.idField;
			var idField;
			if(typeof(obj.btnOptionsConfig) == "object" && typeof(obj.btnOptionsConfig.options) == "object"){
				var btnOptions = obj.btnOptionsConfig.options;
				idField = btnOptions.idField;
			}else{
				// 没有按钮配置时获取主表idField
				if(typeof(obj.config) == "object" && typeof(obj.config.idFieldsNames) == "object"){
					idField = obj.config.idFieldsNames.root;
				}
			}
			if(idField){
				packageNameSufficStr = value[idField] ? value[idField] : packageNameSufficStr;
			}
			var tempValueName = packageName + packageNameSufficStr;
			if(isAlwaysNewTab){
				tempValueName = {
					packageName: tempValueName,
					isMulitTab: isAlwaysNewTab,
				}
				tempValueName = JSON.stringify(tempValueName);
			}else{
				tempValueName = packageName;
			}
			NetstarTempValues[tempValueName] = value;
			if(obj.controllerObj.func.config.parameterFormat){
				var parameterFormat = JSON.parse(obj.controllerObj.func.config.parameterFormat);
				var chargeData = nsVals.getVariableJSON(parameterFormat,NetstarTempValues[tempValueName]);
				switch(obj.controllerObj.func.config.parameterFormatType){
					case 'cover': // 覆盖
						NetstarTempValues[tempValueName] = chargeData;
						break;
					default:
						// 添加
						nsVals.extendJSON(NetstarTempValues[tempValueName],chargeData);
						break;
				}
			}
			//sjj 20190418 是否配置了isCopyObject
			if(obj.controllerObj.func.config.isCopyObject){
				for(var value in NetstarTempValues[tempValueName]){
					if(typeof(NetstarTempValues[tempValueName][value])=='object'){
						delete NetstarTempValues[tempValueName][value];
					}
				}
			}
			url = url+'?templateparam=' + encodeURIComponent(tempValueName);
		}else{
			if(isAlwaysNewTab){
				var tempValueName = {
					packageName: packageName + packageNameSufficStr,
					isMulitTab: isAlwaysNewTab,
				}
				tempValueName = JSON.stringify(tempValueName);
				NetstarTempValues[tempValueName] = {};
				url = url+'?templateparam=' + encodeURIComponent(tempValueName);
			}
		}
		// 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 lyw 20190620 start ---
		var defaultPageData = {};
		var formatValueData = obj.controllerObj.formatValueData; 
		// 转化对象
		if(typeof(formatValueData) == "string" && formatValueData.length>0){
			formatValueData = JSON.parse(formatValueData);
		}
		if(typeof(formatValueData) == "object"){
			var pageOperateData = {};
			if(typeof(NetstarTemplate.getOperateData) == "function"){
				pageOperateData = NetstarTemplate.getOperateData(obj.config);
			}
			defaultPageData = NetStarUtils.getFormatParameterJSON(formatValueData, pageOperateData);
		}
		// 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 lyw 20190620 end ---
		var validStr = '';
		if(obj.controllerObj.validateParams){
			var validateParams = JSON.parse(obj.controllerObj.validateParams);
			for(var valid in validateParams){
				switch(typeof(value[valid])){
					case 'string':
						if(value[valid] == ''){
							isContinue = false;
						}
						break;
					case 'object':
						if($.isEmptyObject(value[valid])){
							isContinue = false;
						}
						break;
					case 'undefined':
						isContinue = false;
						break;
				}
				if(isContinue == false){
					validStr += validateParams[valid]+';';
					break;
				}
			}
		}
		if(isContinue){
			var titleStr = obj.controllerObj.title;
			//添加对标题的判断，标题必填，不然之后会报错 cy 191119
			if(typeof(titleStr)!='string'){
				console.error('方法标题(title)未定义',controllerObj);
				titleStr = '方法标题(title)未定义';
			}
			if(!$.isEmptyObject(value)){
				titleStr = NetStarUtils.getHtmlByRegular(value,titleStr);
			}
			NetstarUI.labelpageVm.loadPage(url,titleStr, isAlwaysNewTab, defaultPageData);
		}else{
			nsalert(validStr,'warning');
		}
	}
	function viewerDialogCommon(callBack,obj){
		var url = obj.controllerObj.func.config.url;
		var pageObj = callBack.dialogBeforeHandler(obj);
		pageObj.value = typeof(pageObj.value) == 'object' ? pageObj.value : {};
		pageObj.value.readonly = true;
		var tempValueName = pageObj.config.package + new Date().getTime();
		NetstarTempValues[tempValueName] = pageObj.value;
		url = url+'?templateparam=' + encodeURIComponent(tempValueName);
		var ajaxConfig = {
				//url:url,
				//type:'GET',
				plusData:{value:pageObj.value},
				pageIidenti : url,
				paramObj : pageObj.value,
				url : url,
				callBackFunc:function(isSuccess, data, _pageConfig){
						if(isSuccess){
						var _config = _pageConfig.config;
						var _configStr = JSON.stringify(_config);
						var valueJson = {value:_pageConfig.plusData.value};
						var pageOperateDataStr = JSON.stringify(valueJson);
						var funcStr = 'nsProject.showPageData(pageConfig,' +pageOperateDataStr + ',' +  _configStr + ')';
						var starStr = '<container>';
						var endStr = '</container>';
						var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
						var exp = /NetstarTemplate\.init\((.*?)\)/;
						var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
						containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
						var $container = nsPublic.getAppendContainer();
						$container.append(containerPage);
						}
				}
		};
		pageProperty.getAndCachePage(ajaxConfig);
		/*NetStarUtils.ajaxForText(ajaxConfig,function(data,ajaxOptions){
				var _config = ajaxOptions.plusData.config;
				var valueJson = {value:_config.value};
				var _configStr = JSON.stringify(valueJson);
				var funcStr = 'nsProject.showPageData(pageConfig,'+_configStr+')';
				//var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
				var starStr = '<container>';
				var endStr = '</container>';
				var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
				var exp = /NetstarTemplate\.init\((.*?)\)/;
				var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
				containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
				var $container = nsPublic.getAppendContainer();
				$container.append(containerPage);
		});*/
		/*var ajaxConfig = {
			url:url,
			type:'GET',
			dataType:'html',
			context:{
				config:pageObj
			},
			success:function(data){
				var _config = this.config;
				var valueJson = {value:_config.value};
				var _configStr = JSON.stringify(valueJson);
				var funcStr = 'nsProject.showPageData(pageConfig,'+_configStr+')';
				//var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
				var starStr = '<container>';
				var endStr = '</container>';
				var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
				var exp = /NetstarTemplate\.init\((.*?)\)/;
				var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
				containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
				var $container = nsPublic.getAppendContainer();
				$container.append(containerPage);
			}
		};
		$.ajax(ajaxConfig);*/
	}
	//sjj 20190815 mutliDialog 多个url链接拼接成一个tab页面
	function multiDialogCommon(callback,obj){
		var pageDataObj = callback.dialogBeforeHandler(obj);
		pageDataObj.value = typeof(pageDataObj.value) == 'object' ? pageDataObj.value : {};
		var titleArr = [];
		if(obj.controllerObj.title){
			titleArr = obj.controllerObj.title.split(',');
		}
		var urlArr = [];
		if(obj.controllerObj.func.config.url){
			urlArr = obj.controllerObj.func.config.url.split(',');
		}
		var titleStr = obj.controllerObj.tabTitles ? obj.controllerObj.tabTitles : '多tab页面';
		var controllerObj = obj.controllerObj ? obj.controllerObj : {};
		if(controllerObj.parameterFormat){
			var parameterFormat = controllerObj.parameterFormat;
			pageDataObj.value = NetStarUtils.getFormatParameterJSON(JSON.parse(parameterFormat),pageDataObj.value);
		}
		var sandBtnParameter = {
			config : typeof(controllerObj.func) == "object" && typeof(controllerObj.func.config) == "object" ? controllerObj.func.config : {},
		};
		if(typeof(pageDataObj.config) == "object"){
			sandBtnParameter.package = pageDataObj.config.package;
		}
		var dialogCommon = {
			id:'multitab-dialog-url',
			title: titleStr,
			templateName: 'PC',
			height:'auto',
			width:1170,
			plusClass:'multiDialog',
			shownHandler:function(data){
					var $dialog = $('#'+data.config.dialogId);
					var $dialogBody = $('#'+data.config.bodyId);
					var ulId = data.config.bodyId + '-ul';
					$dialog.addClass('pt-modal-content-lg');
					$dialogBody.addClass('pt-modal-tab');
					var tabContentId = data.config.bodyId+'-container';
					var liHtml = '';
					var tabContentHtml = '';
					for(var titleI=0; titleI<titleArr.length; titleI++){
							var classStr = titleI === 0 ? 'current' : '';
							// var contentClassStr = titleI === 0 ? '' : 'hide';
							var id = data.config.bodyId +'-li-'+titleI;
							liHtml += '<li class="pt-nav-item '+classStr+'" id="'+id+'">'
													+'<a href="javascript:void(0);" ns-url="'+urlArr[titleI]+'">'+titleArr[titleI]+'</a>'
											+'</li>';
							//tabContentHtml += '<div id="'+id+'"></div>';
					}
					var headerHtml = 
						'<div class="pt-tab-header">\
							<div class="pt-nav">\
								<ul id="'+ulId+'">'
								+ liHtml
								+'</ul>\
							</div>\
						</div>';
					if(titleArr.length == 0){
						$dialog.addClass('pt-modal-notab');
					}
					$('#'+data.config.headId).append(headerHtml);

					//sjj 20191206 添加tipContent  tipClass :  默认 warn error success info 
					var tipContentHtml = '';
					if(controllerObj.tipContent){
						var tipClassStr = controllerObj.tipClass;
						tipContentHtml.prepend('<div class="tip-content"><span class="'+tipClassStr+'">'+controllerObj.tipContent+'</span></div>');
					}
					var tabClassStr = '';
					if(titleArr.length == 1){
						tabClassStr = 'pt-othertab-onlychild';
					}
					var html = tipContentHtml+'<div class="pt-othertab '+tabClassStr+'">'
									+'<div class="pt-container">'
											// +'<div class="pt-othertab-header">'
											// 		+'<div class="pt-nav">'
											// 				+'<ul id="'+ulId+'">'
											// 						+liHtml
											// 				+'</ul>'
											// 		+'</div>'
											// +'</div>'
											+'<div class="pt-othertab-body">'
													+'<div class="pt-othertab-content">'
															+'<div id="'+tabContentId+'"></div>'
													+'</div>'
											+'</div>'
											+'<div class="pt-othertab-footer"></div>'
									+'</div>'
							+'</div>';
					$dialogBody.html(html);
					function getConfigByUrl(url){
							var pageObj = {
								containerId:tabContentId,
								pageParam:pageDataObj.value,
								btnConfig : sandBtnParameter,
							};
							var tempValueName = pageDataObj.config.package + new Date().getTime();
							NetstarTempValues[tempValueName] = pageDataObj.value;
							url = url+'?templateparam=' + encodeURIComponent(tempValueName);
							
							var ajaxConfig = {
									//url:url,
									//type:'GET',
									plusData:{
										pageObj : pageObj,
									},
									pageIidenti : url,
									paramObj : pageDataObj.value,
									url : url,
									callBackFunc:function(isSuccess, data, _pageConfig){
											if(isSuccess){
												var _config = _pageConfig.plusData.pageObj;
												var _configStr = JSON.stringify(_config);
												var funcStr = 'NetstarTemplate.getConfigByAjaxUrl(pageConfig,'+_configStr+')';
												var starStr = '<container>';
												var endStr = '</container>';
												var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
												var exp = /NetstarTemplate\.init\((.*?)\)/;
												var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
												containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
												var $container = nsPublic.getAppendContainer();
												$container.append(containerPage);
											}
									}
							};
							pageProperty.getAndCachePage(ajaxConfig);
							/*
							var ajaxConfig = {
									url:url,
									type:'GET',
									dataType:'html',
									context:{
											config:pageObj
									},
							};
							NetStarUtils.ajaxForText(ajaxConfig,function(data,_this){
									var _config = _this.config;
									var _configStr = JSON.stringify(_config);
									var funcStr = 'NetstarTemplate.getConfigByAjaxUrl(pageConfig,'+_configStr+')';
									var starStr = '<container>';
									var endStr = '</container>';
									var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
									var exp = /NetstarTemplate\.init\((.*?)\)/;
									var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
									containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
									var $container = $('container');
									$container.append(containerPage);
							});*/
					}
					$('#'+ulId+' li > a').on('click',function(ev){
							var $this = $(this);
							var url = $this.attr('ns-url');
							var id = $this.closest('li').attr('id');
							$this.closest('li').addClass('current');
							$this.closest('li').siblings().removeClass('current');
							getConfigByUrl(url);
					});
				getConfigByUrl(urlArr[0]);
			}
	};
	NetstarComponent.dialogComponent.init(dialogCommon);
	}
	//topage弹出界面 sjj20180518
	function toPageCommon(callback,obj){
		var url = obj.controllerObj.func.config.url;
		var paramObj = $.extend(true,{},obj.controllerObj.func.config.defaultData);
		var callback = callback.ajaxBeforeHandler(callback);
		obj = callback.dialogBeforeHandler(obj);
		var configObj = callback.config;
		var value = obj.value;
		if(value){
			var templateObj = eval(configObj.package);
			templateObj.pageParams = value;
			templateObj.descritute = obj.btnOptionsConfig.descritute;
			paramObj.package = configObj.package;
		}
		/*if(obj.rowData){
			var rowData = $.extend(true,{},obj.rowData);
			var templateObj = eval(configObj.package);
			templateObj.pageParams = rowData;
			console.log(templateObj)
			paramObj.template = configObj.package;
			//paramObj = $.extend(true,paramObj,rowData);
		}*/
		if(!$.isEmptyObject(paramObj)){
			paramObj = JSON.stringify(paramObj);
			var urlStr =  encodeURIComponent(encodeURIComponent(paramObj));
			url = url+'?templateparam='+urlStr;
		}
		//nsFrame.popPage(url);
		var config = {
			url:url,
			loadedHandler:function(){
				return callback.loadPageHandler(obj);
			},
			closeHandler:function(){
				return callback.closePageHandler(obj);
			}
		}
		if(obj.controllerObj.width){
			config.width = obj.controllerObj.width;
		}
		if(obj.controllerObj.height){
			config.height = obj.controllerObj.height;
		}
		if(obj.controllerObj.title){
			config.title = obj.controllerObj.title;
		}
		nsFrame.popPageConfig(config);
		//跳转链接
	}
	//changePage 跳转界面 sjj20180606
	function changePageCommon(callback,obj){
		var url = obj.controllerObj.func.config.url;
		var paramObj = obj.controllerObj.func.config.defaultData;
		var callback = callback.ajaxBeforeHandler(callback);
		obj = callback.dialogBeforeHandler(obj);
		var configObj = callback.config;
		var value = obj.value;
		if(value){
			var templateObj = eval(configObj.package);
			templateObj.pageParams = value;
			paramObj.package = configObj.package;
		}
		/*if(obj.rowData){
			var rowData = $.extend(true,{},obj.rowData);
			var templateObj = eval(configObj.package);
			templateObj.pageParams = rowData;
			//paramObj = $.extend(true,paramObj,rowData);
		}*/
		if(!$.isEmptyObject(paramObj)){
			paramObj = JSON.stringify(paramObj);
			var urlStr =  encodeURIComponent(encodeURIComponent(paramObj));
			url = url+'?templateparam='+urlStr;
		}
		window.location.href = url;
	}
	//自定义组件调用
	function changeComponentCommon(callBack,obj){
		var controllerObj = obj.controllerObj;
		var funcObj = eval(controllerObj.componentName);
		function componentCompleteHandler(data){
			var value = {ids:data.value.join(',')};
			var completeAjax = controllerObj.func.config;
			completeAjax.data = $.extend(true,completeAjax.data,controllerObj.func.config.defaultData);
			var handlerJson = {
				controllerObj:completeAjax,
				value:value,
				beforeHandler:callBack.ajaxBeforeHandler,
				afterHandler:function(data){
					callBack.ajaxAfterHandler(data);
				}
			}
			controllerObj.func.function(handlerJson);
		}
		var pageConfig = {
			callback:callBack,
			obj:obj
		};
		funcObj.init({},componentCompleteHandler,pageConfig);
	}
	//打印  sjj 20180928
	function printCommon(callBack,obj){
		nschat.websocket.wsConnect(function(){
			obj = callback.dialogBeforeHandler(obj);
			var idField = obj.btnOptionsConfig.descritute.idField;
			var id = obj.value[idField];
			var jsonData = {
				id:'1279797681833092073',
				command:'报表打印'
			}
			if(obj.controllerObj.data){
				if(obj.controllerObj.data.id){
					var match = /\{([^:]*?)\}/g.exec(obj.controllerObj.data.id);
					jsonData.id = match[1];
				}
			}
			var businessId = {};
			businessId[idField] = id;
			jsonData.businessId = businessId;
			var jsonString = JSON.stringify(jsonData);
			nschat.websocket.send(jsonString);
		},function(){},'127.0.0.1:8888/Chat')
		/*nschat.websocket.wsConnect(function(){
		  nschat.websocket.send('{"command":"报表模板编辑","id":12345664}');
		},function(){});*/
	}
	//工作流监控弹框
	function workflowViewer(callBack, obj){
		var rowData = obj.rowData;
		var id = callBack.data.id;
		if(typeof(rowData)=='undefined'){
			var dialogConfig = callBack.dialogBeforeHandler(callBack);
			rowData = dialogConfig.value;
			if(typeof(rowData)=='object'){
				if($.isArray(rowData.selectedList)){
					rowData = rowData.selectedList[0];
				}
			}
		}
		if(typeof(rowData)!='object'){rowData = {}};
		var workitemId = rowData.workItemId;
		if(typeof(workitemId)!='undefined'){
			// nsUI.flowChartViewer.dialog.show(workitemId);
			var flowChartViewerConfig = {
				id : id + '-' + workitemId,
				workitemId : workitemId,
				title : '流程监控',
				attrs : {},
			}
			NetstarUI.flowChartViewer.tab.init(flowChartViewerConfig);
		}else{
			console.error('没有找到workitemId');
			console.error(rowData);
		}
		return;
	}
	function workflowViewerById(callBack, obj){
		var rowData = obj.rowData;
		var id = callBack.data.id;
		if(typeof(rowData)=='undefined'){
			var dialogConfig = callBack.dialogBeforeHandler(callBack);
			rowData = dialogConfig.value;
			if(typeof(rowData)=='object'){
				if($.isArray(rowData.selectedList)){
					rowData = rowData.selectedList[0];
				}
			}
		}
		if(typeof(rowData)!='object'){rowData = {}};
		var workitemId = rowData.id;
		if(typeof(workitemId)!='undefined'){
			// nsUI.flowChartViewer.dialog.show(workitemId);
			var flowChartViewerConfig = {
				id : id + '-' + workitemId,
				workitemId : workitemId,
				title : '流程监控',
				attrs : {},
				rootWorkitemUrlName : 'id',
			}
			NetstarUI.flowChartViewer.tab.init(flowChartViewerConfig);
		}else{
			console.error('没有找到id');
			console.error(rowData);
		}
		return;
	}
	//工作流按钮配置
	function workflowSubmit(callBack, obj){
		var $btnDom;
		if(typeof(callBack.data) == "object" && callBack.data.id){
			$btnDom = $('#'+callBack.data.id);
			var $btns = $btnDom.parent().children('button:not([disabled="disabled"])');
			$btns.attr('ajax-disabled',true);
			$btns.attr('disabled',true);
		}
		var rowData = obj.rowData;
		// 查看办理意见不识别workitemId识别instanceIds(郑天祥,董超) 所以特殊处理   
		var controllerObj = obj.controllerObj;
		var workflowType = controllerObj.workflowType;
		if(typeof(rowData)=='undefined'){
			var dialogConfig = callBack.dialogBeforeHandler(callBack);
			rowData = dialogConfig.value;
			// if(typeof(rowData)=='object'){
			// 	if($.isArray(rowData.selectedList)){
			// 		rowData = rowData.selectedList[0];
			// 	}
			// }
		}
		if(typeof(rowData)!='object'){rowData = {}};
		/***********sjj 20191230  获取值的时候需要判断当前行选中如果处于禁用状态则不发参 start******************** */
		var selectedListArr = [];
		if($.isArray(rowData.selectedList)){
			for(var s=0; s<rowData.selectedList.length; s++){
				var selectedStateDisabled = typeof(rowData.selectedList[s]['NETSTAR-TRDISABLE'])=='boolean' ? rowData.selectedList[s]['NETSTAR-TRDISABLE'] : false;
				if(selectedStateDisabled == false){
					selectedListArr.push(rowData.selectedList[s]);
				}
			}
		}
		/***********sjj 20191230  获取值的时候需要判断当前行选中如果处于禁用状态则不发参 end******************** */
		switch(workflowType){
			case 'findHandleRec':
			case 'unduComplete':
				if($.isArray(rowData.selectedList)){
					rowData = selectedListArr[0];
				}
				var instanceIds = rowData.instanceIds;
				if(typeof(instanceIds)!='undefined'){
					switch(workflowType){
						case 'findHandleRec':
							var operationFunc = nsEngine.operation().instanceIds(instanceIds).submitAllBatch(true).build();
							break;
						case 'unduComplete':
							var operationFunc = nsEngine.operation().instanceIds(instanceIds).build();
							break;
					}
					// var operationFunc = nsEngine.operation().instanceIds(instanceIds).submitAllBatch(true).build();
					if(typeof(operationFunc[workflowType])=="function"){
						operationFunc[workflowType]();
						if($btnDom){
							var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
							$btns.removeAttr('ajax-disabled');
							$btns.removeAttr('disabled');
						}
					}else{
						if($btnDom){
							var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
							$btns.removeAttr('ajax-disabled');
							$btns.removeAttr('disabled');
						}
						console.error(workflowType+'方法不存在');
						console.error(operationFunc);
					}
				}else{
					if($btnDom){
						var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
						$btns.removeAttr('ajax-disabled');
						$btns.removeAttr('disabled');
					}
					console.error('没有找到instanceIds');
					console.error(rowData);
				}
				break;
			default:
				var workitemId = rowData.workItemId;
				if($.isArray(rowData.selectedList)){
					if(workflowType == "multiSubmit"){
						workitemId = [];
						for(var i=0; i<selectedListArr.length; i++){
							if(selectedListArr[i].workItemId){
								workitemId.push(selectedListArr[i].workItemId);
							}
						}
						if(workitemId.length == 0){
							workitemId = undefined;
						}
					}else{
						rowData = selectedListArr[0] ? selectedListArr[0] : {};
						workitemId = rowData.workItemId;
					}
				}
				// var workitemId = rowData.workItemId;
				if(typeof(workitemId)!='undefined'){
					switch(workflowType){
						case 'submitAllBatch':
							var operationFunc = nsEngine.operation().workitemId(workitemId).submitAllBatch(true).build();
							workflowType = 'submit';
							break;
						case 'multiSubmit':
							var operationFunc = nsEngine.operation().workitemIds(workitemId).build();
							break;
						default:
							var operationFunc = nsEngine.operation().workitemId(workitemId).build();
							break;
					}
					if(typeof(operationFunc[workflowType])=="function"){
						operationFunc[workflowType](function(resp){
							if($btnDom){
								var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
								$btns.removeAttr('ajax-disabled');
								$btns.removeAttr('disabled');
							}
							nsAlert(controllerObj.text+'成功', 'success');
							if(callBack){
								if(typeof(callBack.ajaxAfterHandler)=='function'){
									callBack.ajaxAfterHandler({});
								}
								if(controllerObj.isCloseWindow){
									NetstarUI.labelpageVm.closeByIndex(NetstarUI.labelpageVm.currentTab);
								}
							}
							// console.log(resp);
							// var $tr = obj.obj.parents("tr");
							// $tr.find('button').attr('disabled',true);
						},function(resp){
							if($btnDom){
								var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
								$btns.removeAttr('ajax-disabled');
								$btns.removeAttr('disabled');
							}
							//nsAlert(controllerObj.text+'失败', 'error');
							console.error(resp);
						});
					}else{
						if($btnDom){
							var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
							$btns.removeAttr('ajax-disabled');
							$btns.removeAttr('disabled');
						}
						console.error(workflowType+'方法不存在');
						console.error(operationFunc);
					}
				}else{
					if($btnDom){
						var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
						$btns.removeAttr('ajax-disabled');
						$btns.removeAttr('disabled');
					}
					console.error('没有找到workitemId');
					console.error(rowData);
				}
				break;
		}
		return;
	}
	//sjj 20190524 defaultMode successMessage
	function successMessage(callback,obj){
			var titleStr = obj.controllerObj.title ? obj.controllerObj.title : '请选择对本单据的处理,按 《《Esc》》键放弃本次处理';
			var controllerObj = obj.controllerObj;
			//dialog的前置回调
			var dialogBeforeConfigData = {};
			if(typeof(callback.dialogBeforeHandler)=='function'){
				//加验证
				dialogBeforeConfigData = callback.dialogBeforeHandler(obj);
			}
			//确认弹窗提示信息
			var ajaxObj = {
				dialogBeforeHandler:{
					btnOptionsConfig:dialogBeforeConfigData.btnOptionsConfig,
				},
				value:dialogBeforeConfigData.value,
				controllerObj:controllerObj.func.config,
				templateConfig:dialogBeforeConfigData.config
			};
			if(typeof(ajaxObj.value)!='object'){
				ajaxObj.value = {};
			}
			/***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
			if(typeof(callback.ajaxBeforeHandler)=='function'){
				ajaxObj.beforeHandler = function(data){
					return callback.ajaxBeforeHandler(data);
				};
			}
			if(typeof(callback.ajaxAfterHandler)=='function'){
				ajaxObj.afterHandler = function(data,ajaxData){
					NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
					return callback.ajaxAfterHandler(data,ajaxData);
				};
			}
			//btnsConfig
			var btnsArray = [];
			if(!$.isArray(controllerObj.btnsConfig)){
				btnsArray = [
					{
						text:'保存',
						handler:function(){
							//nsconfirm('是否确认保存？',function(isDelete){
								//if(isDelete){
									//获取界面值
									var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
									if(ajaxValue){
										ajaxObj.value = ajaxValue;
										ajaxObj.value.saveParam = NSSAVEDATAFLAG.ADD;
										ajaxObj.objectState = NSSAVEDATAFLAG.VIEW;
										ajaxObj.controllerObj.clickBtnType = 'isUseSave'; // lyw 20190614
										controllerObj.func.function(ajaxObj);
									}else{
										nsalert('请填写数据','warning');
									}
							//	}
							//},'warning')
						}
					},{
						text:'保存|提交',
						handler:function(){
							//nsconfirm('是否确认保存并提交？',function(isDelete){
								//if(isDelete){
									var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
									if(ajaxValue){
										ajaxObj.value = ajaxValue;
										ajaxObj.value.saveParam = NSSAVEDATAFLAG.EDIT;
										ajaxObj.objectState = NSSAVEDATAFLAG.DELETE;
										ajaxObj.controllerObj.clickBtnType = 'isUseSaveSubmit'; // lyw 20190614
										controllerObj.func.function(ajaxObj);
									}else{
										nsalert('请填写数据','warning');
									}
							//	}
							//},'warning')
						}
					},{
						text:'保存草稿',
						handler:function(){
							//isUser true isSaveBtn
							dialogBeforeConfigData.config.draftBox.isUse = true;
							function func(){
								//关闭当前弹出框
								NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
							}
							NetstarTemplate.draft.btnManager.save(dialogBeforeConfigData.config,func);
						}
					}
				]
			}else{
				for(var btnI=0; btnI<controllerObj.btnsConfig.length; btnI++){
					switch(controllerObj.btnsConfig[btnI]){
						case 'isUseSave':
							btnsArray.push({
								text:'保存',
								handler:function(_btnConfig){
									//nsconfirm('是否确认保存？',function(isDelete){
										//if(isDelete){
											var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
											
											if(ajaxValue == false){

												//获取数据被表单字段验证拦截了 返回为false
												nsalert('请填写数据','warning');

											}else{

												//保存之前 根据表达式验证整体页面录入数据是否合法 cy 2019.06.13 start------
												var validData = $.extend(true, {}, ajaxValue);
												var validConfig = ajaxObj.controllerObj.validateParams;  //该值可能是string 方法内部转换
												var isValid = NetStarUtils.getPageValidResult(validData, validConfig);
												//保存之前验证整体页面录入数据是否合法 cy 2019.06.13 end  ------

												if(isValid == false){
													//验证失败不执行
												}else{
													$(_btnConfig.event.currentTarget).attr('disabled',true);//按钮禁用
													ajaxObj.value = ajaxValue;
													ajaxObj.value.saveParam = NSSAVEDATAFLAG.ADD;
													ajaxObj.objectState = NSSAVEDATAFLAG.VIEW;
													ajaxObj.controllerObj.clickBtnType = 'isUseSave'; // lyw 20190614
													ajaxObj.$btnDom = $(_btnConfig.event.currentTarget);
													ajaxObj.successFun = function(msg,$btnDom){
														var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
														$btns.removeAttr('ajax-disabled');
														$btns.removeAttr('disabled');
														//$btnDom.removeAttr('disabled');
													}
													controllerObj.func.function(ajaxObj);
												}
											}
											
											

									//	}
									//},'warning')
								}
							});
							break;
						case 'isUseSaveSubmit':
						btnsArray.push({
							text:'保存|提交',
							handler:function(){
								//nsconfirm('是否确认保存并提交？',function(isDelete){
									//if(isDelete){
										var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
										if(ajaxValue){
											ajaxObj.value = ajaxValue;
											ajaxObj.value.saveParam = NSSAVEDATAFLAG.EDIT;
											ajaxObj.objectState = NSSAVEDATAFLAG.DELETE;
											ajaxObj.controllerObj.clickBtnType = 'isUseSaveSubmit'; // lyw 20190614
											controllerObj.func.function(ajaxObj);
										}else{
											nsalert('请填写数据','warning');
										}
								//	}
								//},'warning')
							}
						})
							break;
						case 'isUseDraft':
							btnsArray.push({
								text:'保存草稿',
								handler:function(){
									//isUser true isSaveBtn
									dialogBeforeConfigData.config.draftBox.isUse = true;
									function func(){
										//关闭当前弹出框
										NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
									}
									NetstarTemplate.draft.btnManager.save(dialogBeforeConfigData.config,func);
								}
							});
							break;
					}
				}
			}
			btnsArray.push({
					text:'废弃退出',
					handler:function(){
							//关闭当前弹出框
							NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
							NetstarUI.labelpageVm.removeCurrent();
							//刷新界面
					}
			});
			var dialogCommon = {
				id:'btn-dialog-panel',
				title: '保存提示',
				templateName: 'PC',
				height:120,
				plusClass:'pt-confirm',
				shownHandler:function(data){
						var html = '<p class=""><i class="icon-info"></i>'+titleStr+'</p>';
						$('#'+data.config.bodyId).html(html);
						var btnJson = {
								id:data.config.footerIdGroup,
								pageId:'btn-'+data.config.footerIdGroup,
								btns:btnsArray,
						};
						vueButtonComponent.init(btnJson);
				}
			}
			NetstarComponent.dialogComponent.init(dialogCommon);
	}
	// lyw 表格导入
	function excelImportVer2(callback,obj){
		var controllerObj = obj.controllerObj;
		var importConfig = {
			type : 'dialog',
			id : callback.data.id + '-import',
			title : controllerObj.title,
			templateId : controllerObj.templateId,
		}
		if(typeof(callback.dataImportComplete) == "function"){
			importConfig.completeHandler = callback.dataImportComplete;
		}
		
		NetstarExcelImport.init(importConfig);
	}
	// lyw 业务组件
	function businessInit(callback,obj){
		var controllerObj = obj.controllerObj;
		var btnConfig = callback.data;
		var sourceBtnConfig = controllerObj.func.config;
		nsProject.businessBtnManage.configs = typeof(nsProject.businessBtnManage.configs) == "object" ? nsProject.businessBtnManage.configs : {};
		nsProject.businessBtnManage.configs[btnConfig.id] = {
			callback : callback,
			controller : controllerObj,
		};
        var pageConfig = {
            pageIidenti : sourceBtnConfig.url,
            url : sourceBtnConfig.url,
            plusData:{
				btnId : btnConfig.id,
            },
            contentType:sourceBtnConfig.contentType,
            callBackFunc : function(isSuccess, data, _pageConfig){
                if(isSuccess){
					var plusData = _pageConfig.plusData;
					var businessBtn = nsProject.businessBtnManage.configs[plusData.btnId];
					var _configStr = JSON.stringify(plusData);
					var funcStr = 'nsProject.businessBtnManage.dialog(pageConfig, '+_configStr+')';
					var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
					var $container = nsPublic.getAppendContainer();
					var $containerPage = $(containerPage);
					businessBtn.$containerPage = $containerPage;
					$container.append($containerPage);
                }
            },
        }
        pageProperty.getAndCachePage(pageConfig);
	}
	// 通过ids获取文件信息
	function getFileByIds(ids, config, callBackFunc){
		var ajaxConfig = {
			url : getRootPath() + '/files/getListByIds',
			data : {
				ids : ids,
				hasContent: false,
			},
			type : 'GET',
			//cy 191026 修改 根据lyw截图
			contentType:'application/x-www-form-urlencoded',
			plusData : {
				callBackFunc : callBackFunc,
				config: config,
			},
			isReadTimeout:false,
		}
		// var ajaxData2 = typeof(config.ajaxData2) == "object" ? config.ajaxData2 : {};
		// if(!$.isEmptyObject(ajaxData2)){
		// 	ajaxConfig.data = $.extend(false, ajaxConfig.data, ajaxData2);
		// }
		NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
			if(res.success){
				var plusData = _ajaxConfig.plusData;
				var _config = plusData.config;
				if(typeof(res.rows) != "object"){
					nsAlert('获取文件返回值错误','error');
					console.error('获取文件返回值错误');
					console.error(res);
					console.error(_config);
					return false;
				}
				if(typeof(plusData.callBackFunc) == "function"){
					plusData.callBackFunc(res.rows, _config);
				}
			}else{
				// nsalert("获取文件失败");
				console.error(res.msg, 'error');
			}
		})
	}
	function previewFileShow(files, config, callBack){
		var _files = [];
		for(var i=0; i<files.length; i++){
			var contentType = files[i].contentType;
			var suffix = contentType.substring(contentType.lastIndexOf('/')+1);
			//cy 191026 修改 根据lyw截图
			if(files[i].suffix){
				suffix = files[i].suffix;
			}

			var fileObj = {
				id : files[i].id,
                originalName : files[i].originalName,
                suffix : suffix,
			};
			_files.push(fileObj);
		}
		var urlData = typeof(config.fileAjaxData) == "object" ? config.fileAjaxData : {};
        NetstarUI.pdfDialog.dialog({
            url:        '',
            zoomFit:    'width',
            isDownload: true,             //是否有下载
			urlArr :  	_files,
			urlData : 	urlData,
            pdfUrlPrefix : NetStarUtils.getStaticUrl() + '/files/pdf/',   
			imgUrlPrefix : NetStarUtils.getStaticUrl() + '/files/images/',
			downUrlPrefix:NetStarUtils.getStaticUrl()+'/files/download/',//20191218 sjj 修改 修改原因：吴燕蓉说应该是download不应该是pdf
			hiddenHandler : function(obj){
				if(typeof(callBack) == "object"){
					if(typeof(callBack.dialogBeforeHandler) == "function"){
						var callBackDialogData = callBack.dialogBeforeHandler(callBack);
						var _templateConfig = callBackDialogData.config;
						if(!$.isEmptyObject(_templateConfig)){
							switch(_templateConfig.template){
								case 'docListViewer':
								case 'businessDataBase':
									if(typeof(callBack.refreshByConfig) == "function"){
										callBack.refreshByConfig(_templateConfig);
									}
									break;
							}
						}
					}
				}
			}
        });
	}
	// 文件预览
	function previewFileInit(callback,obj){
		var pageData = {};
		// if(typeof(callback.getOperateData) == "function"){
		// 	operateData = callback.getOperateData();
		// }else{
		// 	if(typeof(callback.dialogBeforeHandler) == "function"){
		// 		var befData = callback.dialogBeforeHandler(callback);
		// 		if(befData &&　befData.config){

		// 		}
		// 	}
		// }
		if(typeof(callback.dialogBeforeHandler) == "function"){
			var befData = callback.dialogBeforeHandler(callback);
			if(befData){
				pageData = befData.value;
			}
		}
		var $btnDom;
		if(callback.data){
			if($('#'+callback.data.id).length == 1){
				$btnDom = $('#'+callback.data.id);
				var $btns = $btnDom.parent().children('button:not([disabled="disabled"])');
				$btns.attr('ajax-disabled',true);
				$btns.attr('disabled',true);
			}
		}
		var controllerObj = obj.controllerObj;
		var btnConfig = controllerObj.func.config;
		var data = NetStarUtils.getFormatParameterJSON(btnConfig.data, pageData);
		if(btnConfig.url.length == 0){
			nsAlert('没有配置地址信息', 'error');
			console.error('没有配置地址信息');
			if($btnDom){
				var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
				$btns.removeAttr('ajax-disabled');
				$btns.removeAttr('disabled');
			}
			return false;
		}
		var callbackfuncs = {};
		for(var key in callback){
			if(typeof(callback[key]) == "function"){
				callbackfuncs[key] = callback[key];
			}
		}
		var ajaxConfig = {
			url : btnConfig.url,
			type : btnConfig.type ? btnConfig.type : 'POST',
			contentType : btnConfig.contentType ? btnConfig.contentType : 'application/x-www-form-urlencoded',
			data : data,
			plusData : {
				config : btnConfig,
				$btnDom:$btnDom,
				callback : callbackfuncs,
			},
			isReadTimeout:false,
		}
		NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){

			var plusData = typeof(_ajaxConfig.plusData)=='object' ? _ajaxConfig.plusData : {};
			var _config = plusData.config;
			var _callback = plusData.callback;
			var dataSrc = _config.dataSrc;
			var data = res[dataSrc] ? res[dataSrc] : {};

			if(plusData.$btnDom){
				var $btns = plusData.$btnDom.parent().children('button[ajax-disabled="true"]');
				$btns.removeAttr('ajax-disabled');
				$btns.removeAttr('disabled');
			}

			if(!$.isArray(data)){
				data = [data];
			}

			var fileFields = _config.fileFields;
			// 通过fileFields获取data中的文件id
			var ids = [];

			var fileFieldsArr = fileFields.split(',');
			for(var listI=0; listI<data.length; listI++){
				var _data = data[listI];
				for(var i=0; i<fileFieldsArr.length; i++){
					if(typeof(_data[fileFieldsArr[i]]) != "undefined" && _data[fileFieldsArr[i]]){
						ids.push(_data[fileFieldsArr[i]]);
					}
				}
			}

			if(ids.length == 0){
				nsAlert('没有对应的附件', 'warning');
				console.warn('没有对应的附件');
				console.warn(res);
				return false;
			}
			getFileByIds(ids.toString(), _config, (function(__callback){
					return function(resData, __config){
						previewFileShow(resData, __config, __callback);
					}
				})(_callback)
			)
		},true);
	}

	function downloadByFileInit(callback,obj){
		var controllerObj = {};
		if(obj.controllerObj){
			if(obj.controllerObj.func.config){
				controllerObj = obj.controllerObj.func.config;
			}
		}
		var targetField = controllerObj.targetField;
		var downloadFileUrl = controllerObj.url;
		var dataJson = {};
		if(typeof(callback.dialogBeforeHandler)=='function'){
			dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
		}
		var templateConfig = dataJson.config;
		var value = dataJson.value;//获取value值
		var currentGridConfig = {};
		switch(templateConfig.template){
			case 'businessDataBase':
				if(!$.isEmptyObject(templateConfig.mainComponent)){
					currentGridConfig = templateConfig.mainComponent;
				}else{
					currentGridConfig = templateConfig.components[0];
				}
				break;
			case 'docListViewer':
				currentGridConfig = templateConfig.mainComponent;
				if(targetField){
					for(var gridId in templateConfig.componentsConfig.list){
						var gJson = templateConfig.componentsConfig.list[gridId];
						if(gJson.keyField == targetField){
							currentGridConfig = gJson;
							break;
						}	
					}
				}
				break;
			case 'businessDataBaseLevel3':
				break;
		}
		if(!$.isEmptyObject(currentGridConfig)){
			var configs = NetStarGrid.configs[currentGridConfig.id];
			var gridConfig = configs.gridConfig;
			var queryConfig = gridConfig.ui.query;
			var uiConfig = gridConfig.ui;
			var matrixData = {};
			// if(!$.isEmptyObject(queryConfig)){
			// 	var formJson = NetstarComponent.getValues(queryConfig.id);
			// 	var paramJson = {};
			// 	if (formJson.filtermode == 'quickSearch') {
			// 		if (formJson.filterstr) {
			// 			paramJson = {
			// 				keyword: formJson.filterstr,
			// 				//quicklyQueryColumnNames:[],
			// 				quicklyQueryColumnValue:formJson.filterstr,
			// 			};
			// 			if(queryConfig.quickQueryFieldArr.length > 0){
			// 				paramJson.quicklyQueryColumnNames = queryConfig.quickQueryFieldArr;
			// 			}
			// 		}
			// 	} else {
			// 		var queryFormConfig = NetstarComponent.config[queryConfig.id].config[formJson.filtermode];
			// 		if (!$.isEmptyObject(queryFormConfig)) {
			// 			if (formJson[formJson.filtermode]) {
			// 				if (queryFormConfig.type == 'business' && typeof (queryFormConfig.outputFields) == "undefined") {
			// 					switch (queryFormConfig.selectMode) {
			// 						case 'single':
			// 							paramJson[formJson.filtermode] = formJson[formJson.filtermode][queryFormConfig.idField];
			// 							break;
			// 						case 'checkbox':
			// 							paramJson[formJson.filtermode] = formJson[formJson.filtermode][0][queryFormConfig.idField];
			// 							break;
			// 					}
			// 				} else {
			// 					paramJson[formJson.filtermode] = formJson[formJson.filtermode];
			// 				}
			// 			}
			// 			if (typeof (formJson[formJson.filtermode]) == 'number') {
			// 				paramJson[formJson.filtermode] = formJson[formJson.filtermode];
			// 			}
			// 			if (queryFormConfig.type == 'dateRangePicker') {
			// 				var startDate = formJson.filtermode + 'Start';
			// 				var endDate = formJson.filtermode + 'End';
			// 				paramJson[startDate] = formJson[startDate];
			// 				paramJson[endDate] = formJson[endDate];
			// 			}else if(queryConfig.type == 'valuesInput'){
			// 				var valuesInputStr = queryConfig.value;
			// 				if(typeof(valuesInputStr)=='object'){
			// 					$.each(valuesInputStr,function(k,v){
			// 						paramJson[k] = v;
			// 					})
			// 				}
			// 			}
			// 		} else {
			// 			if (formJson.filterstr) {
			// 				paramJson[formJson.filtermode] = formJson.filterstr;
			// 			}
			// 		}
			// 	}
			// 	matrixData = paramJson;
			// 	if(!$.isEmptyObject(uiConfig.paramsData)){
			// 		$.each(uiConfig.paramsData,function(k,v){
			// 			if(typeof(matrixData[k])=='undefined'){
			// 				matrixData[k] = v;
			// 			}
			// 		});
			// 	}
			// }
			if(!$.isEmptyObject(queryConfig)){
				var gridData = gridConfig.data.data;
				if(typeof(gridData) == "object" && !$.isEmptyObject(gridData)){
					matrixData = gridData;
				}
			}
			var matrixVariableStr = '';
			for (var matrix in matrixData) {
				if(matrixVariableStr.length == 0){
					matrixVariableStr = '/';
				}
				matrixVariableStr += ';' + matrix + '=' + matrixData[matrix];
			}
			if(matrixVariableStr){
				downloadFileUrl = downloadFileUrl + matrixVariableStr;
			}
		}
		var downName = obj.controllerObj.title ? obj.controllerObj.title : 'excel';
		NetStarUtils.download({
			url:downloadFileUrl,
			//url: 'https://qaapi.wangxingcloud.com//sample/accept/sampleItems/getSampleItemDeatilListExcel',
			fileName: downName+'.xlsx',
		});
	}
	//文件下载
	function downloadFileInit(callback,obj){
		var controllerObj = obj.controllerObj;
		var ajaxData = controllerObj.ajaxData; //{bllId:'',bllType:'',hasContent:false}
		var ajaxConfigByBll = {
            url:getRootPath()+'/files/getListByBll',
            type:'POST',
            dataSrc:'data',
            data:ajaxData,
			contentType:'application/x-www-form-urlencoded',
			isReadTimeout:false,
		};
		NetStarUtils.ajax(ajaxConfigByBll,function(res){
			if(res.success){
				var fileListArr = [];
				if($.isArray(res.rows)){
					fileListArr = res.rows;
				}
				var idsArr = [];
				for(var idI=0; idI<fileListArr.length; idI++){
					idsArr.push(fileListArr[idI].id);
				}
				var fileListIdsAjaxConfig = {
					url : getRootPath() + '/files/getListByIds',
					data : {
						ids : idsArr.join(','),
						hasContent : false,
					},
					type : 'GET',
					contentType:'application/x-www-form-urlencoded',
					isReadTimeout:false,
				 };
				 NetStarUtils.ajax(fileListIdsAjaxConfig,function(resData,ajaxOptions){
					if(resData.success){
						var filesArray = [];
						if($.isArray(resData.rows)){
							filesArray = resData.rows;
						}
						if(filesArray.length == 1){
							var downloadFileName = filesArray[0].originalName;
							var fileId = filesArray[0].id;
							var downloadFileUrl = getRootPath()+'/files/download/'+ fileId;
							NetStarUtils.download({
								url: downloadFileUrl,
								fileName: downloadFileName,
							});
						}
					}else{
					   var msg = resData.msg ? resData.msg : '返回值为false';
					   nsalert(msg,'error');
					}
				 },true)
			}else{
				var msg = res.msg ? res.msg : '返回值为false';
                nsalert(msg,'error');
			}
		},true)
	}

	function addInfoDialogInit(callback,obj){
		var dataJson = {};
		if(typeof(callback.dialogBeforeHandler)=='function'){
			dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
		}
		var controllerObj = obj.controllerObj;
		if(controllerObj.func){
			if(controllerObj.func.config){
				var currentFunctionConfig = obj.controllerObj.func.config;
				var preSuffix = currentFunctionConfig.suffix;
				var pageConfig = {
					pageIidenti:preSuffix,
					url:getRootPath() + preSuffix,
					plusData:{
						controllerObj:currentFunctionConfig,
						packageName:dataJson.config.package
					},
					callBackFunc:function(isSuccess, data,_pageConfig){
						if(isSuccess){
						  var res = data;
						  if(typeof(res) == "object"){
							res = pageProperty.getPageHtml(res.data);
						  }
						  var ajaxPlusData = _pageConfig.plusData;
						  //拿到容器
						  var matchTag = 'container';
						  var containerHtml = '';
						  if(res.indexOf('<' + matchTag + '>') != -1 && res.lastIndexOf('</' + matchTag + '>') != -1){
							 containerHtml = res.substring(res.indexOf('<' + matchTag + '>') + ('<' + matchTag + '>').length, res.lastIndexOf('</' + matchTag + '>'));
						  }else{
							matchTag = 'body';
							if(res.indexOf('<' + matchTag + '>') != -1 && res.lastIndexOf('</' + matchTag + '>') != -1){
								containerHtml = res.substring(res.indexOf('<' + matchTag + '>') + ('<' + matchTag + '>').length, res.lastIndexOf('</' + matchTag + '>'));
							}else{
								containerHtml = res;
							}
						  }
						  containerHtml = '<container>' + containerHtml + '</container>';
						  //进行替换
						  try{
							var configName = containerHtml.match(/NetstarTemplate\.init[\s]*\((\S+)\)/)[1];
						  }catch (error){
							return nsalert("页面没有该项配置", 'warning');
						  }
						  var btnEnglishName = ajaxPlusData.controllerObj.englishName; // 点击的按钮名
						  var extraData = {
							keyField:ajaxPlusData.controllerObj.keyField,
							package:ajaxPlusData.packageName
						  };
						  var _configStr = JSON.stringify(extraData);
						  var _controllerObj = JSON.stringify(ajaxPlusData.controllerObj);
						  var funcStr = 'NetstarTemplate.commonFunc.addInfoDialogInitByBtn('+configName+','+_configStr+','+_controllerObj+')';
						  containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/,funcStr);
						  $('container').append($(containerHtml).find('script'));
						}else{
						}
					},
				}
				pageProperty.getAndCachePage(pageConfig);
			}
		}else{
			nsalert('请查看配置','warning');
			console.warn('请查看配置');
		}
	}

	function ajaxAndPdfInit(callback,obj){
		var controllerObj = obj.controllerObj;
		var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
		var dataJson = {};
		if(typeof(callback.dialogBeforeHandler)=='function'){
			dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
		}
		var templateConfig = dataJson.config;
		var value = dataJson.value;//获取value值
		if(functionConfig.url){
			var ajaxConfig = {
				url:functionConfig.url,
				type:functionConfig.type,
				contentType:functionConfig.contentType,
				dataSrc:functionConfig.dataSrc,
				plusData:{
					packageName:templateConfig.package,
					ajaxAfterHandler:callback.ajaxAfterHandler,
					valueData:value,
					fileField:functionConfig.fileField
				},
			};
			ajaxConfig.data = NetStarUtils.getFormatParameterJSON(functionConfig.data,value);
			NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
				if(res.success){
					var fileField = ajaxOptions.plusData.fileField;
					var ptTemplateConfig = NetstarTemplate.templates.configs[ajaxOptions.plusData.packageName];
					var ptTemplateValueData = ajaxOptions.plusData.valueData;
					var resData = res[ajaxOptions.dataSrc];
					fileField = JSON.parse(fileField);
					var innerParams = NetStarUtils.getFormatParameterJSON(fileField,resData);
					var urlParams = '';
					for(var innerI in innerParams){
						urlParams = innerParams[innerI];
					}
					//调整为修改了pdf的域名，改为直接调用打印 cy 191219  调用PDF的地址从 qaapi. 改为当前域名
					if(window.location.protocol == 'http:'){
						//原有代码是打开window再打印 当本地使用时候会仍然使用当前方式
						nsalert('当前访问方式不支持PDF直接打印, 需要正式发布后支持','warning');
						console.warn('当前访问方式不支持PDF直接打印，需要正式发布后支持');
						var url = NetStarUtils.getStaticUrl()+'/files/pdf/'+urlParams+'?Authorization='+NetStarUtils.OAuthCode.get();
						window.open(url);
					}else if(window.location.protocol == 'https:'){
						var url = NetStarUtils.getStaticUrl() + '/files/pdf/'+urlParams+'?Authorization='+NetStarUtils.OAuthCode.get();
						if($('#iframe-print').length > 0){
							$('#iframe-print').remove();
						}
						$('body').append('<iframe id="iframe-print" style="display:none; visibility:hidden;" src="' + url + '"></iframe>')
						$("#iframe-print")[0].contentWindow.print();
					}
				}else{
					nsalert('返回值为false','error');
				}
			},true)
		}
	}

	function excelExportInit(callback,obj){
		var controllerObj = obj.controllerObj;
		var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
		var dataJson = {};
		if(typeof(callback.dialogBeforeHandler)=='function'){
			dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
		}
		var templateConfig = dataJson.config;
		var value = dataJson.value;//获取value值
		var targetField = controllerObj.targetField;
		var currentGridConfig = {};
		var isCountExport = false;
		switch(templateConfig.template){
			case 'businessDataBase':
				if(!$.isEmptyObject(templateConfig.mainComponent)){
					currentGridConfig = templateConfig.mainComponent;
				}else{
					currentGridConfig = templateConfig.components[0];
				}
				break;
			case 'docListViewer':
				currentGridConfig = templateConfig.mainComponent;
				if(targetField){
					for(var gridId in templateConfig.componentsConfig.list){
						var gJson = templateConfig.componentsConfig.list[gridId];
						if(gJson.keyField == targetField){
							currentGridConfig = gJson;
							break;
						}	
					}
				}
				break;
			case 'businessDataBaseLevel3':
				break;
			case 'statisticsList':
				if(templateConfig.mode == 'countList'){
					isCountExport = true;
					currentGridConfig = templateConfig.components[0];
				}
				break;
		}
		if(!$.isEmptyObject(currentGridConfig)){
			var exportXlsJson = {
				id:currentGridConfig.id
			};
			if(functionConfig.ext){
				exportXlsJson.ext = functionConfig.ext;
			}
			if(functionConfig.excelName){
				exportXlsJson.excelName = functionConfig.excelName;
			}
			if(functionConfig.requestSource){
				exportXlsJson.requestSource = functionConfig.requestSource;
			}
			if(isCountExport){
				NetstarUI.exportXls.initByCount(exportXlsJson);
			}else{
				NetstarUI.exportXls.init(exportXlsJson);
			}
		}
	}
	function wxtPrintInit(callback,obj){
		var storeName = '';
		// 发送打印消息
		function sendWxtPrintInfo(printInfo){
			printInfo.page = typeof(printInfo.page) == "undefined" ? '' : printInfo.page;
			printInfo.pageNumber2 = typeof(printInfo.pageNumber2) == "undefined" ? '' : printInfo.pageNumber2;
			var message = {
				userId : NetstarMainPage.systemInfo.user.userId,
				printUserId : printInfo.userId,
				action : printInfo.action,
				fileIds : printInfo.fileIds,
				printerId : printInfo.id,
				printType : printInfo.type,
				paperType : "1",
				page : printInfo.page+','+printInfo.pageNumber2,
				copies : "10",
				layout : "1",
				btnId : printInfo.btnId,
				storeName : storeName,
			};
			var messageStr = JSON.stringify(message);
			NetStarRabbitMQ.printSend(message.printUserId, messageStr);
		}
		// 获取打印消息
		function getPrintMessage(printInfos, otherInfo){
			var arr = [];
			for(var i=0; i<printInfos.length; i++){
				var pageLength = '1';
				var layout = '1';
				if(!isNaN(Number(printInfos[i].pageLength))){
					pageLength = printInfos[i].pageLength;
				}
				if(printInfos[i].layout === "0"){
					layout = "0";
				}
				var page = '';
				if(typeof(printInfos[i].page) != "undefined"){
					page = printInfos[i].page + ',';
				}
				if(typeof(printInfos[i].pageNumber2) != "undefined"){
					page += printInfos[i].pageNumber2;
				}
				var obj = {
					fileIds : printInfos[i].fileIds,
					printerId : printInfos[i].id,
					printType : printInfos[i].type,
					// paperType : "1",
					paperType : printInfos[i].defaultPaperType,
					page : page,
					copies : pageLength,
					layout : layout,
				}
				arr.push(obj);
			}
			var message = {
				action : otherInfo.action,
				trayUserId : printInfos[0].userId,
				senderUserId : NetstarMainPage.systemInfo.user.userId,
				printSubtask : arr,
				btnsConfigName : otherInfo.btnsConfigName,
				btnIndex : otherInfo.btnIndex,
				printTaskNo : otherInfo.btnsConfigName + '-' + otherInfo.btnIndex + '-' + otherInfo.btntimeStamp,
			}
			console.log(message);
			return message;
		}
		// 改变按钮状态
		function changeBtnsState($btnDom, isDisable){
			if(isDisable){
				var $btns = $btnDom.parent().children('button:not([ajax-disabled="true"])');
				$btns.attr('ajax-disabled',true);
				$btns.attr('disabled',true);
			}else{
				var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
				$btns.removeAttr('ajax-disabled',true);
				$btns.removeAttr('disabled',true);
			}
		}
		// 获取发送ajax的data
		function getAjaxData(funcConfig, ajaxConfig, pageConfig){
			var data = typeof(ajaxConfig.data)=='object' ? ajaxConfig.data : {};
			var value = pageConfig.value;
			if(funcConfig.dataFormat == 'id'){
				if(pageConfig.btnOptionsConfig){
					if(pageConfig.btnOptionsConfig.options){
						if(pageConfig.btnOptionsConfig.options.idField){
							var idField = pageConfig.btnOptionsConfig.options.idField;
							data[idField] = value[idField];
						}
					}
				}
			}else{
				if($.isEmptyObject(data)){
					data = value;
				}
			}
			// 转化对象
			var pageOperateData = value;
			if(typeof(NetstarTemplate.getOperateData) == "function"){
				pageOperateData = NetstarTemplate.getOperateData(pageConfig.config);
			}
			data = NetStarUtils.getFormatParameterJSON(data, pageOperateData);
			return data;
		}
		function getAjaxData2(funcConfig, ajaxConfig, pageConfig){
			var data = typeof(ajaxConfig.data)=='object' ? ajaxConfig.data : {};
			var value = pageConfig.value;
			if(funcConfig.dataFormat == 'id'){
				if(pageConfig.btnOptionsConfig){
					if(pageConfig.btnOptionsConfig.options){
						if(pageConfig.btnOptionsConfig.options.idField){
							var idField = pageConfig.btnOptionsConfig.options.idField;
							data[idField] = value[idField];
						}
					}
				}
			}else{
				if($.isEmptyObject(data)){
					data = value;
				}else{
					data = NetStarUtils.getFormatParameterJSON(data, value);
				}
			}
			// 获取页面操作数据 用于多选 lyw 20200204 start ---
			var operateData = {};
			var formatValueData = funcConfig.formatValueData;
			// 转化对象
			if(typeof(formatValueData) == "string" && formatValueData.length>0){
				formatValueData = JSON.parse(formatValueData);
			}
			if(typeof(formatValueData) == "object"){
				var pageOperateData = {};
				if(typeof(NetstarTemplate.getOperateData) == "function"){
					pageOperateData = NetstarTemplate.getOperateData(pageConfig.config);
				}
				operateData = NetStarUtils.getFormatParameterJSON(formatValueData, pageOperateData);
			}
			for(var key in operateData){
				if(typeof(data[key]) == "undefined"){
					data[key] = operateData[key];
				}
			}
			// 获取页面操作数据 用于多选 lyw 20200204 end ---
			return data;
		}
		// 获取fileId数据
		function getFileData(funcConfig, fileField, pageConfig){
			if(typeof(fileField) == "string"){
				if(fileField.length > 0){
				}else{
					console.error('没有配置文件字段请检查配置');
					nsAlert('没有配置文件字段请检查配置', 'error');
					console.error(funcConfig);
					return false;
				}
			}else{
				console.error('没有配置文件字段请检查配置');
				nsAlert('没有配置文件字段请检查配置', 'error');
				console.error(funcConfig);
				return false;
			}
			var descritute = pageConfig.btnOptionsConfig.descritute;
			var operateKey = 'listChecked';
			if(typeof(descritute.keyField) == "string"){
				operateKey = descritute.keyField + 'Checked';
			}
			var pageOperateData = {};
			if(typeof(NetstarTemplate.getOperateData) == "function"){
				pageOperateData = NetstarTemplate.getOperateData(pageConfig.config);
			}
			pageOperateData = typeof(pageOperateData[operateKey]) == "object" ? pageOperateData[operateKey] : [];
			var fileIds = '';
			for(var i=0; i<pageOperateData.length; i++){
				if(typeof(pageOperateData[i][fileField]) == "string" && pageOperateData[i][fileField].length > 0){
					fileIds += pageOperateData[i][fileField] + ',';
				}else{
					console.error('没有找到fileId请检查行数据是否完整');
					nsAlert('没有找到fileId请检查行数据是否完整', 'error');
					console.error(pageOperateData, i);
					fileIds = false;
					break;
				}
			}
			if(fileIds === ''){
				console.error('没有找到fileId请检查是否选中行');
				console.error(pageOperateData);
				fileIds = false;
			}
			if(fileIds){
				fileIds = fileIds.substring(0, fileIds.length-1);
			}
			return fileIds;
		}
		// 通过ajax获取fileId
		function getFileIdByAjax(funcConfig, ajaxConfig, pageConfig, plusData, callBackFunc){
			var data = getAjaxData(funcConfig, ajaxConfig, pageConfig);
			ajaxConfig.dataSrc = 'data';
			ajaxConfig.data = data;
			ajaxConfig.plusData = {
				callBackFunc : callBackFunc,
				fileField : funcConfig.fileField ? funcConfig.fileField : 'fileId',
			};
			if(typeof(plusData) == "object"){
				ajaxConfig.plusData = $.extend(false, ajaxConfig.plusData, plusData);
			}
			NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
				var plusData = ajaxOptions.plusData;
				if(res.success){
					var fileField = plusData.fileField;
					var resData = res[ajaxOptions.dataSrc];
					var fileIdsArr = [];
					if(typeof(resData) != "object"){ resData = {}; }
					if(!$.isArray(resData)){
						resData = [resData];
					}
					for(var i=0; i<resData.length; i++){
						if(resData[i][fileField]){
							fileIdsArr.push(resData[i][fileField]);
						}
					}
					if(fileIdsArr.length == 0){
						console.error('没有找到fileId,请检查返回数据');
						nsalert('没有找到fileId,请检查返回数据', 'error');
						return;
					}
					var fileIds = fileIdsArr.toString();
					if(typeof(plusData.callBackFunc) == "function"){
						plusData.callBackFunc(fileIds, plusData);
					}
				}
			});
		}
		// 生成弹框
		function showDialog(isPreview, callBackFunc){
			var dialogConfig = {
				id:'btn-dialog-wxtprint',
				title: '打印设置',
				templateName: 'PC',
				height:600,
				width:'80%',
				// defaultFooterHeight : 20,
				plusClass:'pt-wxtprint-setting',
				shownHandler:function(data){
					if(typeof(callBackFunc) == "function"){
						callBackFunc(data.config);
					}
				}
			}
			if(isPreview){
				dialogConfig.defaultFooterHeight = 20;
			}
			NetstarComponent.dialogComponent.init(dialogConfig);
		}
		// 通过按钮发送消息并改变按钮text
		function sendMessageAndChangeBtn($clickBtn, printInfo, callBackFunc){
			var textStr = $clickBtn.text();
			var isTime = false;
			if(textStr.indexOf('取消') == -1){
				isTime = true;
				printInfo.action = 'print';
				$clickBtn.text('取消'+textStr);
			}else{
				printInfo.action = 'cancelPrint';
				var valueTextStr = textStr.substring(2,textStr.length);
				$clickBtn.text(valueTextStr);
			}
			sendWxtPrintInfo(printInfo);
			// NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
			if(nsProject.PRINTSETTIMEOUT){
				clearTimeout(nsProject.PRINTSETTIMEOUT);
			}
			if(isTime){
				nsProject.PRINTSETTIMEOUT = setTimeout(function(){
					var _textStr = $clickBtn.text();
					if(_textStr.indexOf('取消') == 0){
						var _valueTextStr = _textStr.substring(2, _textStr.length);
						$clickBtn.text(_valueTextStr);
					}
				},2000)
			}
			if(typeof(callBackFunc) == "function"){
				callBackFunc();
			}
		}
		// 获取打印机列表显示
		function getPrintList(callBackFunc){
			var printAjax = {
				src : getRootPath()+'/system/cloudPrints/getList',
				data : {},
				dataSrc : 'rows',
				contentType : 'application/json',
			}
			NetStarUtils.ajax(printAjax, (function(_callBackFunc){
				return function(res){
					if(res.success){
						var resList = res.rows;
						var printTypeDict = typeof(nsVals.dictData['CLOUD_PRINT_TYPE']) == "object" && typeof(nsVals.dictData['CLOUD_PRINT_TYPE'].jsondata) == "object" ? nsVals.dictData['CLOUD_PRINT_TYPE'].jsondata : {};
						var paperTypeDict = typeof(nsVals.dictData['DEFAULT_PAPER_TYPE']) == "object" && typeof(nsVals.dictData['DEFAULT_PAPER_TYPE'].jsondata) == "object" ?  nsVals.dictData['DEFAULT_PAPER_TYPE'].jsondata : {};
						var list = [];
						for(var i=0; i<resList.length; i++){
							var obj = $.extend(true, {}, resList[i]);
							var type = obj.type;
							var defaultPaperType = obj.defaultPaperType;
							var typeName = printTypeDict[type] ? printTypeDict[type] : '';
							var paperName = paperTypeDict[defaultPaperType] ? paperTypeDict[defaultPaperType] : '';
							obj.typeName = typeName;
							obj.paperName = paperName;
							list.push(obj);
						}
						if(typeof(_callBackFunc) == "function"){
							_callBackFunc(list);
						}
					}
				}
			})(callBackFunc));
		}
		// 初始化没有预览的设置打印机面板
		function initSetPrint(initConfig){
			var dialogConfig = initConfig.dialogConfig;
			// var fileIds = initConfig.fileIds;
			var storeName = initConfig.storeName;
			var btnStateObj = initConfig.btnStateObj;
			var subIndex = btnStateObj.subIndex; // 设值的是第几条数据
			var clickBtnId = initConfig.btnId;
			var bodyId = dialogConfig.bodyId;
			var footerId = dialogConfig.footerIdGroup;
			var $body = $('#' + bodyId);
			var storeData = getStore(storeName, subIndex);
			var blockConfig = {
				id : bodyId,
				data : {
					idField : 'id',
					// src:getRootPath()+'/system/cloudPrints/getList',
					// data:{},
					// dataSrc:'rows',
					// contentType: 'application/json',
				},
				ui : {
					selectMode : "single",	
					isHaveEditDeleteBtn : false,
					listExpression: '<li class="pt-list-table">'
										+'<span class="title">打印机名称:{{name}}</span>'
										+'<span class="note">打印机类型:{{typeName}}</span>'
										+'<span class="page">默认纸张:{{paperName}}</span>'
									+'</li>',
					defaultValueOption : {
						value : [storeData],
						idField : 'id',
					},
				},
				columns : [],
			}
			getPrintList((function(_blockConfig){
				return function(list){
					_blockConfig.data.dataSource = list;
					NetstarBlockList.init(blockConfig);
				}
			})(blockConfig))
			// NetstarBlockList.init(blockConfig);
			var btnJson = {
				id : footerId,
				pageId:'btn-' + footerId,
				btns:[
					{
						text:'确定',
						handler:function(){
							//发送websocket
							var selectData = NetstarBlockList.getSelectedData(bodyId);//获取打印配置的值
							if(selectData.length == 0){
								console.error('没有选中打印机');
								nsalert('没有选中打印机', 'error');
								return false;
							}
							selectData = selectData[0];
							var printInfo = {
								id : selectData.id,
								userId : selectData.userId,
								type : selectData.type,
								printerId : selectData.id,
							}
							setStore(printInfo, storeName, subIndex);
							NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
							// store.set(bodyId, $.extend(true, {}, printInfo));
							// printInfo.btnId = clickBtnId;
							// printInfo.fileIds = fileIds;
							// var $clickBtn = $('#' + clickBtnId);
							// sendMessageAndChangeBtn($clickBtn, printInfo, function(){
							// 	NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
							// })
						}
					},{
						text:'取消',
						handler:function(){
							//关闭当前弹出框
							NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
						}
					}
				],
			};
			vueButtonComponent.init(btnJson);
		}
		// 设置打印机配置
		function setStore(storeContent, storeName, subIndex){
			var storeData = store.get(storeName);
			if(typeof(storeData) != "object"){
				storeData = {};
			}
			storeData[subIndex] = storeContent;
			store.set(storeName, storeData);
		}
		// 获取打印机配置
		function getStore(storeName, subIndex){
			var storeData = store.get(storeName);
			var res = {};
			if(typeof(storeData) == "object" && typeof(storeData[subIndex]) == "object"){
				res = storeData[subIndex];
			}
			return res;
		}
		// 获取打印机配置
		function getStoreAll(storeName){
			var storeData = store.get(storeName);
			if(typeof(storeData) != "object"){
				storeData = {}
			}
			return storeData;
		}
		// 初始化打印预览设置面板
		function initPrintPreview(initConfig){
			var dialogConfig = initConfig.dialogConfig;
			var fileIds = initConfig.fileIds;
			var storeName = initConfig.storeName;
			var btnStateObj = initConfig.btnStateObj;
			var subIndex = btnStateObj.subIndex; // 设值的是第几条数据
			var clickBtnId = initConfig.btnId;
			var bodyId = dialogConfig.bodyId;
			var footerId = dialogConfig.footerIdGroup;
			var $body = $('#' + bodyId);
			// 按钮id
			var btnId = 'btn-' + bodyId;
			// 表单id
			var voId = 'vo-' + bodyId;
			// 预览id
			var pdfId = 'pdf-' + bodyId;
			var btnHtml = '<div class="pt-main-row">'
							+'<div class="pt-main-col">'
								+'<div class="pt-panel">'
									+'<div class="pt-container">'
										+'<div id="'+btnId+'" class="pt-components-btns"></div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
			var voHtml = '<div class="pt-main-col wxtprint-left">'
								+'<div class="pt-panel">'
									+'<div class="pt-container">'
										+'<div id="'+voId+'" class="pt-components-vo"></div>'
									+'</div>'
								+'</div>'
							+'</div>';
			var pdfHtml = '<div class="pt-main-col wxtprint-right">'
								+'<div class="pt-panel">'
									+'<div class="pt-container">'
										+ '<div class="pt-components-pdf-title">预览</div>'
										+'<div id="'+pdfId+'" class="pt-components-pdf"></div>'
									+'</div>'
								+'</div>'
							+'</div>';
			var html = '<div class="pt-main pt-wxtprint-panel">'
									// + btnHtml
									+'<div class="pt-main-row">'
										+ voHtml
										+ pdfHtml
									+'</div>'
								+'</div>';
			$body.html(html);
			// 计算预览文件容器高度
			var bodyHeight = $body.innerHeight();
			var $pdf = $('#' + pdfId);
			var $pdfTitle = $pdf.prev();
			var pdfTitleHeight = $pdfTitle.outerHeight();
			var previewHeight = bodyHeight - pdfTitleHeight -20 - 20 - 34;
			$pdf.height(previewHeight);
			// 表单
			var formConfig = {
				id:voId,
				templateName: 'form',
				componentTemplateName: 'PC',
				//defaultComponentWidth:'100%',
				isSetMore:false,
				plusClass:'pt-form-print',
				form:[
					{
						id: 'printerId',
						label: '目标打印机',
						type: 'select',
						textField: 'name',
						valueField: 'id',
						rules : 'required',
						//inputWidth:450,
						// ajaxConfig:{
						// 	url:getRootPath()+'//system/cloudPrints/getList',
						// 	src:getRootPath()+'//system/cloudPrints/getList',
						// 	data:{},
						// 	dataSrc:'rows',
						// },
						panelConfig:{
							height:300,
						},
						outputFields : {
							id : "{id}",
							userId : "{userId}",
							type : "{type}",
							defaultPaperType : "{defaultPaperType}",
						},
						// isObjectValue:true,
						listExpression: '<li class="pt-list-table">'
											+'<span class="title">打印机名称:{{name}}</span>'
											+'<span class="note">打印机类型:{{typeName}}</span>'
											+'<span class="page">默认纸张:{{paperName}}</span>'
										+'</li>',
					},{
						id:'page',
						label:'页码',
						type:'valuesInput',
						format:'{this:9}-{pageNumber2:999}',
					},{
						id:'pageLength',
						label:'份数',
						type:'text',
						rules : 'positiveInteger',
					},{
						id:'layout',
						label:'打印方向',
						type:'radio',
						value : '1',
						subdata : [
							{
								text : "横",
								value : "0",
							},{
								text : "竖",
								value : "1",
							}
						],
					}
				],
			};
			var storeData = getStore(storeName, subIndex);
			getPrintList((function(_formConfig, _storeData){
				return function(list){
					_formConfig.form[0].subdata = list;
					NetstarComponent.formComponent.show(_formConfig, _storeData);
				}
			})(formConfig, storeData))
			// NetstarComponent.formComponent.show(formConfig, storeData);
			// 预览
			var fileIdsArr = fileIds.split(',');
			var pdfViewArr = [];
			var stateUrl = NetStarUtils.getStaticUrl();
			var token = NetStarUtils.OAuthCode.get();
			for(var i=0; i<fileIdsArr.length; i++){
				pdfViewArr.push({
					url : stateUrl + '/files/pdf/' + fileIdsArr[i] + '?Authorization=' + token,
					type : 'pdf',
				})
			}
			var pdfViewConfig = {
				id : pdfId,
				isPrint : false,
				url : pdfViewArr,
			}
			NetstarUI.multiPdfViewer.init(pdfViewConfig);
			// 按钮
			var btnJson = {
				id : footerId,
				pageId:'btn-' + footerId,
				btns:[
					{
						text:'确定',
						handler:function(){
							var printInfo = NetstarComponent.getValues(voId);//获取打印配置的值
							if(!printInfo){
								console.error('请检查表单配置');
								return false;
							}
							setStore(printInfo, storeName, subIndex);
							NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
						}
					},{
						text:'取消',
						handler:function(){
							//关闭当前弹出框
							NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
						}
					}
				],
			};
			vueButtonComponent.init(btnJson);
		}
		// 打印
		function printAndCancel(actionName, printList, controllerObj, dataJson, storeName, btnStateObj, callBackFunc){
			if(!$.isArray(printList)){
				printList = [printList];
			}
			var btnType = controllerObj.btnType;
			var subIndex = btnStateObj.subIndex; // 设值的是第几条数据
			var btnVueConfig = btnStateObj.btnsVue.vueConfigs[btnStateObj.index];
			switch(btnType){
				case 'print': // 打印
				case 'preview': // 预览打印
					var fileIds = getFileData(controllerObj, controllerObj.fileField, dataJson);
					if(!fileIds){
						break;
					}
					var storeData = getStoreAll(storeName);
					// 判断打印的列表是否都存在配置 如果没有配置 报错不进行打印
					var isAllSet = true;
					for(var i=0; i<printList.length; i++){
						if(typeof(storeData[printList[i].nsIndex]) == "undefined"){
							isAllSet = false;
						}
					}
					if(!isAllSet){
						nsAlert('请检查打印机是否全部配置','warning');
						console.warn('请检查打印机是否全部配置');
						break;
					}
					var printInfos = [];
					for(var i=0; i<printList.length; i++){
						var storeObj = storeData[printList[i].nsIndex];
						storeObj.fileIds = fileIds;
						printInfos.push(storeObj);
					}
					var btnVueConfig = btnStateObj.btnsVue.vueConfigs[btnStateObj.index];
					var otherInfo = {
						action : actionName,
						btntimeStamp : btnVueConfig.timestamp,
						btnsConfigName : btnStateObj.btnsVue.btnsConfigName,
						btnIndex : btnStateObj.index,
					}
					var message = getPrintMessage(printInfos, otherInfo);
					var messageStr = JSON.stringify(message);
					NetStarRabbitMQ.printSend(message.trayUserId, messageStr);
					if(typeof(callBackFunc) == "function"){
						callBackFunc();
					}
					break;
				case 'printAjax': // 发送ajax的打印 即 表格行上没有fileId字段
				case 'previewAjax': // 发送ajax的预览打印 即 表格行上没有fileId字段
					var storeData = getStoreAll(storeName);
					// 判断打印的列表是否都存在配置 如果没有配置 报错不进行打印
					var isAllSet = true;
					for(var i=0; i<printList.length; i++){
						if(typeof(storeData[printList[i].nsIndex]) == "undefined"){
							isAllSet = false;
						}
					}
					if(!isAllSet){
						nsAlert('请检查打印机是否全部配置','warning');
						console.warn('请检查打印机是否全部配置');
						break;
					}
					var printInfos = [];
					for(var i=0; i<printList.length; i++){
						var storeObj = storeData[printList[i].nsIndex];
						storeObj.fileIds = fileIds;
						printInfos.push(storeObj);
					}
					var currentAjaxIndex = 0;
					
					for(var i=0; i<printList.length; i++){
						var ajaxConfig = $.extend(true, {}, printList[i].ajax); 
						var _plusData = {
							ajaxIndex : i,
							storeName : storeName,
							btnStateObj : btnStateObj,
							printList : printList,
							printInfos : printInfos,
						}
						getFileIdByAjax(printList[i], ajaxConfig, dataJson, _plusData, (function(_printInfos, _actionName, _callBackFunc){
							return function(fileIds, plusData){
								currentAjaxIndex ++;
								_printInfos[plusData.ajaxIndex].fileIds = fileIds;
								if(currentAjaxIndex == plusData.printList.length){
									var btnVueConfig = plusData.btnStateObj.btnsVue.vueConfigs[plusData.btnStateObj.index];
									var otherInfo = {
										action : _actionName,
										btntimeStamp : btnVueConfig.timestamp,
										btnsConfigName : plusData.btnStateObj.btnsVue.btnsConfigName,
										btnIndex : plusData.btnStateObj.index,
									}
									var message = getPrintMessage(_printInfos, otherInfo);
									var messageStr = JSON.stringify(message);
									NetStarRabbitMQ.printSend(message.trayUserId, messageStr);
									if(typeof(_callBackFunc) == "function"){
										_callBackFunc();
									}
								}
							}
						})(printInfos, actionName, callBackFunc))
					}
					break;
			}
		}
		// 设置
		function setPrintInfo(controllerObj, storeName, btnStateObj){
			var btnType = controllerObj.btnType;
			var subIndex = btnStateObj.subIndex; // 设值的是第几条数据
			switch(btnType){
				case 'print': // 打印 没有预览所以不需要fileId
				case 'printAjax': // 打印 没有预览所以不需要fileId
					showDialog(false, function(dialogConfig){
						var initConfig = {
							dialogConfig : dialogConfig,
							// fileIds : fileIds,
							btnId : btnId,
							storeName : storeName,
							btnStateObj : btnStateObj,
						}
						initSetPrint(initConfig);
					});
					break;
				case 'preview': // 预览打印
					var fileIds = getFileData(controllerObj, controllerObj.fileField, dataJson);
					if(!fileIds){
						break;
					}
					showDialog(true, function(dialogConfig){
						var initConfig = {
							dialogConfig : dialogConfig,
							fileIds : fileIds,
							btnId : btnId,
							storeName : storeName,
							btnStateObj : btnStateObj,
						}
						initPrintPreview(initConfig);
					});
					break;
				case 'previewAjax': // 发送ajax的预览打印 即 表格行上没有fileId字段
					var btnVueConfig = stateObj.btnsVue.vueConfigs[stateObj.index];
					var subPrint = $.extend(true, {}, btnVueConfig.dropdownSubdata[stateObj.subIndex]);
					subPrint.nsIndex = stateObj.subIndex;
					var ajaxConfig = $.extend(true, {}, subPrint.ajax); 
					var _plusData = {
						storeName : storeName,
						btnStateObj : btnStateObj,
					};
					getFileIdByAjax(subPrint, ajaxConfig, dataJson, _plusData, function(fileIds, plusData){
						showDialog(true, function(dialogConfig){
							var initConfig = {
								dialogConfig : dialogConfig,
								fileIds : fileIds,
								btnId : plusData.btnId,
								storeName : plusData.storeName,
								btnStateObj : plusData.btnStateObj,
							}
							initPrintPreview(initConfig);
						});
					})
					break;
			}
		}
			
		//sjj 20200205 网星通打印
		var controllerObj = obj.controllerObj;
		var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
		var dataJson = {};
		if(typeof(callback.dialogBeforeHandler)=='function'){
			dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
		}
		var pageConfig = callback.config;
		var package = pageConfig.package;
		var stateObj = callback.stateObj;
		var btnIndex = stateObj.index;
		var storeName = package + '-' + btnIndex;
		var btnId = callback.data.id;
		var eventFuncName = callback.eventFuncName;
		var btnVueConfig = stateObj.btnsVue.vueConfigs[stateObj.index];
		var btnConfig = stateObj.btnsVue.data[stateObj.index];
		switch(eventFuncName){
				case 'click':
					btnVueConfig.timestamp = new Date().getTime();
				case 'clickCancel': // 点击按钮
					var actionName = 'print';
					if(eventFuncName == 'clickCancel'){
						actionName = 'cancelPrint';
					}
					var selectList = stateObj.btnsVue.stateGetCheck(stateObj.index); 
					if(selectList.length == 0){
						nsAlert('没有选择打印模板及配置', 'warning');
						console.warn('没有选择打印模板及配置');                                                                                                                                                                                                            
						break;
					}
					printAndCancel(actionName, selectList, controllerObj, dataJson, storeName, stateObj, (function(_btnVueConfig, _eventFuncName, _functionConfig){
						return function(){
							if(_eventFuncName == 'click'){
								_btnVueConfig.showType = 'loading';
								_btnVueConfig.loadingStyle = {
									width : '0%',
								}
								_btnVueConfig.loadingText = '0%';
								_btnVueConfig.showText = '取消打印';
							}else{
								_btnVueConfig.showType = 'default';
								_btnVueConfig.showText = functionConfig.text;
								_btnVueConfig.dropdownState = 'list';
							}
							_btnVueConfig.isShowDropdown = false;
						}
					})(btnVueConfig, eventFuncName, functionConfig))                                                                                                                                                                                                          
					break;
				case 'mouseover': // 移入
					break;
				case 'mouseout': // 移出
					btnVueConfig.showType = 'default';
					btnVueConfig.showText = functionConfig.text;
					btnVueConfig.dropdownState = 'list';
					btnVueConfig.isShowDropdown = false;
					break;
				case 'dropPrint': // 下拉打印
					var subPrint = $.extend(true, {}, btnVueConfig.dropdownSubdata[stateObj.subIndex]);
					subPrint.nsIndex = stateObj.subIndex;
					printAndCancel('print', subPrint, controllerObj, dataJson, storeName, stateObj)
					break;
				case 'dropSet': // 点击设置
					setPrintInfo(controllerObj, storeName, stateObj);
					break;
				case 'dropClick': // 点击下拉框
					break;
		}
		// var btnType = controllerObj.btnType;
		// switch(btnType){
		// 	case 'print': // 打印
		// 		var fileIds = getFileData(controllerObj, controllerObj.fileField, dataJson);
		// 		if(!fileIds){
		// 			break;
		// 		}
		// 		var storeId = 'dialog-btn-dialog-wxtprint-body';
		// 		var storeData = store.get(storeId);
		// 		if(storeData){
		// 			var printInfo = storeData;
		// 			printInfo.btnId = btnId;
		// 			printInfo.fileIds = fileIds;
		// 			var $clickBtn = $('#' + btnId);
		// 			sendMessageAndChangeBtn($clickBtn, printInfo);
		// 		}else{
		// 			showDialog(false, function(dialogConfig){
		// 				var initConfig = {
		// 					dialogConfig : dialogConfig,
		// 					fileIds : fileIds,
		// 					btnId : btnId,
		// 				}
		// 				initPrint(initConfig);
		// 			});
		// 		}
		// 		break;
		// 	case 'preview': // 预览打印
		// 		var fileIds = getFileData(controllerObj, controllerObj.fileField, dataJson);
		// 		if(!fileIds){
		// 			break;
		// 		}
		// 		showDialog(true, function(dialogConfig){
		// 			var initConfig = {
		// 				dialogConfig : dialogConfig,
		// 				fileIds : fileIds,
		// 				btnId : btnId,
		// 			}
		// 			initPrintPreview(initConfig);
		// 		});
		// 		break;
		// 	case 'printAjax': // 发送ajax的打印 即 表格行上没有fileId字段
		// 		if($btn){
		// 			changeBtnsState($btn, true);
		// 		}
		// 		var ajaxConfig = $.extend(true,{},functionConfig); 
		// 		getFileIdByAjax(controllerObj, ajaxConfig, dataJson, btnId, $btn, function(fileIds, plusData){
		// 			// showDialog(false, function(dialogConfig){
		// 			// 	var initConfig = {
		// 			// 		dialogConfig : dialogConfig,
		// 			// 		fileIds : fileIds,
		// 			// 		btnId : plusData.btnId,
		// 			// 	}
		// 			// 	initPrint(initConfig);
		// 			// });
		// 			var storeId = 'dialog-btn-dialog-wxtprint-body';
		// 			var storeData = store.get(storeId);
		// 			if(storeData){
		// 				var printInfo = storeData;
		// 				printInfo.btnId = plusData.btnId;
		// 				printInfo.fileIds = fileIds;
		// 				var $clickBtn = $('#' + plusData.btnId);
		// 				sendMessageAndChangeBtn($clickBtn, printInfo);
		// 			}else{
		// 				showDialog(false, function(dialogConfig){
		// 					var initConfig = {
		// 						dialogConfig : dialogConfig,
		// 						fileIds : fileIds,
		// 						btnId : plusData.btnId,
		// 					}
		// 					initPrint(initConfig);
		// 				});
		// 			}
		// 		})
		// 		break;
		// 	case 'previewAjax': // 发送ajax的预览打印 即 表格行上没有fileId字段
		// 		if($btn){
		// 			changeBtnsState($btn, true);
		// 		}
		// 		var ajaxConfig = $.extend(true,{},functionConfig); 
		// 		getFileIdByAjax(controllerObj, ajaxConfig, dataJson, btnId, $btn, function(fileIds, plusData){
		// 			showDialog(true, function(dialogConfig){
		// 				var initConfig = {
		// 					dialogConfig : dialogConfig,
		// 					fileIds : fileIds,
		// 					btnId : plusData.btnId,
		// 				}
		// 				initPrintPreview(initConfig);
		// 			});
		// 		})
		// 		break;
		// }
	}
	// 以下方法为备份
	function wxtPrintInit2(callback,obj){
		//sjj 20200205 网星通打印
		var controllerObj = obj.controllerObj;
		var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
		var dataJson = {};
		if(typeof(callback.dialogBeforeHandler)=='function'){
			dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
		}
		var btnId = callback.data.id;
		if(callback.event){
			if(callback.event.target.nodeName == 'BODY'){
				if(callback.data.id){
					var $btnDom = $('#'+callback.data.id);
					var $btns = $btnDom.parent().children('button:not([ajax-disabled="true"])');
					$btns.attr('ajax-disabled',true);
					$btns.attr('disabled',true);
				}
			}else{
				var $btnDom = $(callback.event.currentTarget);
				var $btns = $btnDom.parent().children('button:not([ajax-disabled="true"])');
				$btns.attr('ajax-disabled',true);
				$btns.attr('disabled',true);
			}
		}
		var templateConfig = dataJson.config;
		var value = dataJson.value;//获取value值
		console.log(value);
		//现根据当前配置的url发送请求获取到文件ids
		var ajaxConfig = $.extend(true,{},functionConfig);
		ajaxConfig.data = typeof(ajaxConfig.data)=='object' ? ajaxConfig.data : {};
		if(controllerObj.dataFormat == 'id'){
			if(dataJson.btnOptionsConfig){
				if(dataJson.btnOptionsConfig.options){
					if(dataJson.btnOptionsConfig.options.idField){
						var idField = dataJson.btnOptionsConfig.options.idField;
						ajaxConfig.data[idField] = value[idField];
					}
				}
			}
		}else{
			if($.isEmptyObject(ajaxConfig.data)){
				ajaxConfig.data = value;
			}else{
				ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data,value);
			}
		}
		
		// 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 lyw 20200204 start ---
		var defaultPageData = {};
		var formatValueData = obj.controllerObj.formatValueData;
		// 转化对象
		if(typeof(formatValueData) == "string" && formatValueData.length>0){
			formatValueData = JSON.parse(formatValueData);
		}
		if(typeof(formatValueData) == "object"){
			var pageOperateData = {};
			if(typeof(NetstarTemplate.getOperateData) == "function"){
				pageOperateData = NetstarTemplate.getOperateData(dataJson.config);
			}
			defaultPageData = NetStarUtils.getFormatParameterJSON(formatValueData, pageOperateData);
		}
		for(var key in defaultPageData){
			if(typeof(ajaxConfig.data[key]) == "undefined"){
				ajaxConfig.data[key] = defaultPageData[key];
			}
		}
		// ajaxConfig.data = $.extend(false, ajaxConfig.data, defaultPageData)
		// 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 lyw 20200204 end ---
		ajaxConfig.plusData = {btnId:btnId};
		NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
			if($('#'+callback.data.id).length == 1){
				var $btns = $('#'+callback.data.id).parent().children('button[ajax-disabled="true"]');
				$btns.removeAttr('ajax-disabled',true);
				$btns.removeAttr('disabled',true);
			}
			if(res.success){
				var resData = res[ajaxOptions.dataSrc];
				var idsArr = [];
				var pdfViewArr = [];
				if(!$.isArray(resData)){
					resData = [];
				}
				var fileId = res.data.fileId;
				var idsStr = fileId;
				var token = NetStarUtils.OAuthCode.get();
				pdfViewArr.push({
					url : NetStarUtils.getStaticUrl() + '/files/pdf/' + fileId + '?Authorization='+token,
					type : 'pdf',
				})
				// for(var r=0; r<resData.length; r++){
				// 	idsArr.push(resData[r].id);
				// 	var pdfUrl = getRootPath() + 'files/pdf/' + resData[r].id;
				// 	var pdfType = 'pdf';
				// 	var token = NetStarUtils.OAuthCode.get();
				// 	switch(resData[r].reportType.toLocaleLowerCase()){
				// 		case 'img':
				// 		case 'gif':
				// 		case 'jpeg':
				// 		case 'png':
				// 		case 'jpg':
				// 		case 'bmp':
				// 			pdfUrl = getRootPath() + 'files/images/' + resData[r].id;
				// 			pdfType = 'img';
				// 			break;
				// 	}
				// 	pdfViewArr.push({
				// 		url : pdfUrl + '?Authorization='+token,
				// 		type : pdfType,
				// 	})
				// }
				// var idsStr = idsArr.join(',');
				// var idsStr = '1326383365623907314';
				//获取到ids弹出打印设置
				var dialogCommon = {
					id:'btn-dialog-wxtprint',
					title: '打印设置',
					templateName: 'PC',
					height:600,
					width:'80%',
					defaultFooterHeight : 20,
					plusClass:'pt-wxtprint-setting',
					shownHandler:function(data){
						//按钮输出
						//vo输出
						//预览输出
						var btnId = 'btn-'+data.config.bodyId;
						var voId = 'vo-'+data.config.bodyId;
						var pdfId = 'pdf-'+data.config.bodyId;
						var btnHtml = '<div class="pt-main-row">'
										+'<div class="pt-main-col">'
											+'<div class="pt-panel">'
												+'<div class="pt-container">'
													+'<div id="'+btnId+'" class="pt-components-btns"></div>'
												+'</div>'
											+'</div>'
										+'</div>'
									+'</div>';
						var voHtml = '<div class="pt-main-col wxtprint-left">'
											+'<div class="pt-panel">'
												+'<div class="pt-container">'
													+'<div id="'+voId+'" class="pt-components-vo"></div>'
												+'</div>'
											+'</div>'
										+'</div>';
						var pdfHtml = '<div class="pt-main-col wxtprint-right">'
											+'<div class="pt-panel">'
												+'<div class="pt-container">'
													+ '<div class="pt-components-pdf-title">预览</div>'
													+'<div id="'+pdfId+'" class="pt-components-pdf"></div>'
												+'</div>'
											+'</div>'
										+'</div>';
						var html = '<div class="pt-main pt-wxtprint-panel">'
										+btnHtml
										+'<div class="pt-main-row">'
											+voHtml+pdfHtml
										+'</div>'
									+'</div>';
						$('#'+data.config.bodyId).html(html);
						var btnJson = {
								id:btnId,
								pageId:'btn-'+data.config.footerIdGroup,
								btns:[
									{
										text:'打印',
										//iconCls:'icon-print',
										/*dropdownType:'memoryDropdown',
										isReturn:true,
										subdata:[
											{
												text:'打印',
												isReturn:true,
												handler:function(data){
													console.log(data)
												},
												functionConfig:{}
											},{
												text:'打印预览',
												isReturn:true,
												handler:function(data){
													console.log(data)
												},
												functionConfig:{}
											}
										],*/
										handler:function(){
											//发送websocket
											var formData = NetstarComponent.getValues(voId);//获取打印配置的值
											if(!formData){
												console.error('请检查表单配置');
												return false;
											}
											var printInfo = {};
											if($.isArray(formData.printerId)){
												printInfo = formData.printerId[0];
											}else{
												printInfo = formData;
											}
											store.set(voId, formData)
											//打印发参
											var printParamsData = {
												userId:NetstarMainPage.systemInfo.user.userId,
												printUserId:printInfo.userId,
												action:"print",
												fileIds:idsStr,
												printerId:printInfo.id,
												printType:printInfo.type,
												paperType:"1",
												//page:"1,2-4",
												page:formData.page+','+formData.pageNumber2,
												copies:"10",
												layout:"1",
												btnId:ajaxOptions.plusData.btnId,
											};
											//取消打印发参
											var cancelPrintParamsData = {
												userId:NetstarMainPage.systemInfo.user.userId,
												printUserId:printInfo.userId,
												action:"cancelPrint",
												fileIds:idsStr,
												printerId:printInfo.id,
												printType:printInfo.type,
												paperType:"1",
												//page:"1,2-4",
												page:formData.page+','+formData.pageNumber2,
												copies:"10",
												layout:"1",
												btnId:ajaxOptions.plusData.btnId,
											};
											
											var textStr = $('#'+ajaxOptions.plusData.btnId).text();
											var isTime = false;
											if(textStr.indexOf('取消') == -1){
												isTime = true
												$('#'+ajaxOptions.plusData.btnId).text('取消'+textStr);
												var printUserId = printInfo.userId;
												var messageStr = JSON.stringify(printParamsData);
												NetStarRabbitMQ.printSend(printUserId, messageStr);
											}else{
												var valueTextStr = textStr.substring(2,textStr.length);
												$('#'+ajaxOptions.plusData.btnId).text(valueTextStr);
												var printUserId = printInfo.userId;
												var messageStr = JSON.stringify(cancelPrintParamsData);
												NetStarRabbitMQ.printSend(printUserId, messageStr);
											}
											NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
											if(isTime){
												setTimeout(function(){
													var _textStr = $('#'+ajaxOptions.plusData.btnId).text();
													if(_textStr.indexOf('取消') == 0){
														var _valueTextStr = textStr.substring(2,_textStr.length);
														$('#'+ajaxOptions.plusData.btnId).text(_valueTextStr);
													}
												},1000)
											}
											// console.log(cancelPrintParamsData)
											// console.log(printParamsData);
											//formData.ids = idsStr;
											//var businessJson = formData;
											/*var webSocketBody = {
												"command":"报表打印",
												"templateId":templateConfig.id,
												"listName":"",
												"business":JSON.stringify(businessJson),
											};
											nschat.websocket.wsConnect(function(){
												nschat.websocket.send(JSON.stringify(webSocketBody));
											},function(){},'127.0.0.1:8888/Chat')*/
											//websocket发送成功之后会返回参，这个时候打印按钮需要变成取消打印按钮

											//{"userId":"1302723015498463","action":"print","fileIds":"111,222,333","printerId":"1302723015498463","printType":"1","paperType":"1","page":"1,2-4","copies":"10","layout":"1"}
											//{"userId":"1302723015498463","action":"cancelPrint","fileIds":"111,222,333","printerId":"1302723015498463","printType":"1","paperType":"1","page":"1,2-4","copies":"10","layout":"1"}
										}
									},{
										text:'取消',
										handler:function(){
											//关闭当前弹出框
											NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
										}
									}
								],
						};
						vueButtonComponent.init(btnJson);
	
						var formConfig = {
							id:voId,
							templateName: 'form',
							componentTemplateName: 'PC',
							//defaultComponentWidth:'100%',
							isSetMore:false,
							plusClass:'pt-form-print',
							form:[
								{
									id: 'printerId',
									label: '目标打印机',
									type: 'select',
									textField: 'name',
									valueField: 'id',
									rules : 'required',
									//inputWidth:450,
									ajaxConfig:{
										url:getRootPath()+'//system/cloudPrints/getList',
										src:getRootPath()+'//system/cloudPrints/getList',
										data:{},
										dataSrc:'rows',
									},
									panelConfig:{
										height:300,
									},
									outputFields : {
										id : "{id}",
										userId : "{userId}",
										type : "{type}"
									},
									// isObjectValue:true,
									listExpression: '<li class="pt-list-table">'
														+'<span class="title">打印机名称:{{name}}</span>'
														+'<span class="note">打印机类型:{{type}}</span>'
														+'<span class="page">默认纸张:{{defaultFlag}}</span>'
													+'</li>',
								},{
									id:'page',
									label:'页码',
									type:'valuesInput',
									format:'{this:9}-{pageNumber2:999}',
								},{
									id:'pageLength',
									label:'份数',
									type:'text'
								}
							],
						};
						var storeData = store.get(voId);
						NetstarComponent.formComponent.show(formConfig, storeData);
						// 预览
						var pdfViewConfig = {
							id : pdfId,
							isPrint : false,
							url : pdfViewArr,
						}
						NetstarUI.multiPdfViewer.init(pdfViewConfig);
					}
				};
				NetstarComponent.dialogComponent.init(dialogCommon);
			}else{
				var msg = res.msg ? res.msg : '请求返回值false';
				nsalert(msg,'error');
			}
		},true);
	}

	function ajaxNewtabCommon(callback,obj){
		var dataJson = {};
		if(typeof(callback.dialogBeforeHandler)=='function'){
			dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
		}
		var value = dataJson.value;//获取value值
		var controllerObj = obj.controllerObj.func.config;//获取按钮配置项
		if(value == false){
			if(controllerObj.noSelectInfoMsg){
				//定义了弹出的提示语
				nsalert(controllerObj.noSelectInfoMsg,'error');
				console.error(infoMsgStr);
			}
			return false;
		}
		var isUseConfirm = typeof(controllerObj.isUseConfirm)=='boolean' ? controllerObj.isUseConfirm : true;//默认弹出框
		if(callback.event){
			if(callback.event.target.nodeName == 'BODY'){
				if(callback.data.id){
					var $btnDom = $('#'+callback.data.id);
					var $btns = $btnDom.parent().children('button:not([ajax-disabled="true"])');
					$btns.attr('ajax-disabled',true);
					$btns.attr('disabled',true);
					//$btnDom.attr('disabled',true);
				}
			}else{
				var $btnDom = $(callback.event.currentTarget);
				var $btns = $btnDom.parent().children('button:not([ajax-disabled="true"])');
				$btns.attr('ajax-disabled',true);
				$btns.attr('disabled',true);
				//$btnDom.attr('disabled',true);
			}
		}
		function getAjaxHandler(){
			var ajaxConfig = $.extend(true,{},obj.controllerObj.beforeAjax);
			ajaxConfig.data = typeof(ajaxConfig.data)=='object' ? ajaxConfig.data : {};
			if(controllerObj.dataFormat == 'id'){
				if(dataJson.btnOptionsConfig){
					if(dataJson.btnOptionsConfig.options){
						if(dataJson.btnOptionsConfig.options.idField){
							var idField = dataJson.btnOptionsConfig.options.idField;
							ajaxConfig.data[idField] = value[idField];
						}
					}
				}
			}else{
				if($.isEmptyObject(ajaxConfig.data)){
					ajaxConfig.data = value;
				}else{
					ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data,value);
				}
			}
			ajaxConfig.plusData = {
				btnFunctionConfig:controllerObj,
				packageName:dataJson.config.package,
			};
			NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
				//$('#'+callback.data.id).removeAttr('disabled');
				if($('#'+callback.data.id).length == 1){
					var $btns = $('#'+callback.data.id).parent().children('button[ajax-disabled="true"]');
					$btns.removeAttr('ajax-disabled',true);
					$btns.removeAttr('disabled',true);
					//$('#'+callback.data.id).removeAttr('disabled');
				}
				if(res.success){
					var resData = res[ajaxOptions.dataSrc];
					var btnFunctionConfig = ajaxOptions.plusData.btnFunctionConfig;
					var titleStr = btnFunctionConfig.title;
					var url = btnFunctionConfig.url;
					var tempValueName = ajaxOptions.plusData.packageName + new Date().getTime();
					NetstarTempValues[tempValueName] = {templateDataByAjax:resData};
					url = url+'?templateparam=' + encodeURIComponent(tempValueName);
					NetstarUI.labelpageVm.loadPage(url,titleStr,true);
				}
			},true);
		}
		if(isUseConfirm){
			nsconfirm(controllerObj.beforeTitle,function(isDelete){
				if(isDelete){
					getAjaxHandler();
				}else{
					if($('#'+callback.data.id).length == 1){
						var $btns = $('#'+callback.data.id).parent().children('button[ajax-disabled="true"]');
						$btns.removeAttr('ajax-disabled',true);
						$btns.removeAttr('disabled',true);
						//$('#'+callback.data.id).removeAttr('disabled');
					}
				}
			},'warning')
		}else{
			getAjaxHandler();
		}
	}

	// lyw 导入
	function excelImportVer3(callback,obj){
		var controllerObj = obj.controllerObj;
		var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
		var dataJson = {};
		if(typeof(callback.dialogBeforeHandler)=='function'){
			dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
		}
		var pageConfig = callback.config;
		var package = pageConfig.package;
		var stateObj = callback.stateObj;
		var btnIndex = stateObj.index;
		var storeName = package + '-' + btnIndex;
		var btnId = callback.data.id;
		var eventFuncName = callback.eventFuncName;
		var btnVueConfig = stateObj.btnsVue.vueConfigs[stateObj.index];
		var btnConfig = stateObj.btnsVue.data[stateObj.index];
		switch(eventFuncName){
			case 'click':
				btnVueConfig.timestamp = new Date().getTime();
				// 暂时代码
				var importInstructionsExpression = functionConfig.importInstructionsExpression;
				if(!importInstructionsExpression){
					importInstructionsExpression = '<div class="import-nstructions-list">'
														+ '<ul>'
															+ '<li>按仓库导入商品</li>'
															+ '<li>多次导入库存信息</li>'
															+ '<li>商品编号和属性编号必填</li>'
														+ '</ul>'
													+ '</div>'
				}
				var importConfig = {
					id : 'netstar-import-dialog',
					expression : importInstructionsExpression,
					confirmHandler : (function(_btnVueConfig, _eventFuncName, _functionConfig){
						return function(data){
							console.log(data);
							_btnVueConfig.showType = 'loading';
							_btnVueConfig.loadingStyle = {
								width : '0%',
							}
							_btnVueConfig.loadingText = '0%';
							_btnVueConfig.showText = '取消导入';
							_btnVueConfig.isShowDropdown = false;
						}
					})(btnVueConfig, eventFuncName, functionConfig),
				};
				NetstarExcelImportVer3.init(importConfig);
				break;
			case 'clickCancel': // 点击按钮
				// var actionName = 'import';
				// if(eventFuncName == 'clickCancel'){
				// 	actionName = 'cancelImport';
				// }       
				btnVueConfig.showType = 'default';
				btnVueConfig.showText = functionConfig.text;
				btnVueConfig.dropdownState = 'list';
				btnVueConfig.isShowDropdown = false;                                                                                                                                                                                
				break;
			case 'mouseover': // 移入
				break;
			case 'mouseout': // 移出
				btnVueConfig.showType = 'default';
				btnVueConfig.showText = functionConfig.text;
				btnVueConfig.dropdownState = 'list';
				btnVueConfig.isShowDropdown = false;
				break;
			case 'details': // 点击设置
				var importConfig = {
					type : 'details',
					title : '导入详情',
					id : 'netstar-import-details-dialog',
					infos : {
						addNum : 10,
						updateNum : 15,
						errorNum : 5,
					}
				};
				NetstarExcelImportVer3.init(importConfig);
				break;
		}
	}
	// lyw 导出
	function excelExportVer3(callback,obj){
		var controllerObj = obj.controllerObj;
		var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
		var dataJson = {};
		if(typeof(callback.dialogBeforeHandler)=='function'){
			dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
		}
		var pageConfig = callback.config;
		var package = pageConfig.package;
		var stateObj = callback.stateObj;
		var btnIndex = stateObj.index;
		var storeName = package + '-' + btnIndex;
		var btnId = callback.data.id;
		var eventFuncName = callback.eventFuncName;
		var btnVueConfig = stateObj.btnsVue.vueConfigs[stateObj.index];
		var btnConfig = stateObj.btnsVue.data[stateObj.index];
		switch(eventFuncName){
			case 'click':
				btnVueConfig.timestamp = new Date().getTime();
				btnVueConfig.showType = 'loading';
				btnVueConfig.loadingStyle = {
					width : '0%',
				}
				btnVueConfig.loadingText = '0%';
				btnVueConfig.showText = '取消导入';
				btnVueConfig.isShowDropdown = false;
				break;
			case 'clickCancel': // 点击按钮
				// var actionName = 'import';
				// if(eventFuncName == 'clickCancel'){
				// 	actionName = 'cancelImport';
				// }       
				btnVueConfig.showType = 'default';
				btnVueConfig.showText = functionConfig.text;
				btnVueConfig.dropdownState = 'list';
				btnVueConfig.isShowDropdown = false;                                                                                                                                                                                
				break;
			case 'mouseover': // 移入
				break;
			case 'mouseout': // 移出
				btnVueConfig.showType = 'default';
				btnVueConfig.showText = functionConfig.text;
				btnVueConfig.dropdownState = 'list';
				btnVueConfig.isShowDropdown = false;
				break;
		}
	}
	//--------------------------------------------------wxk公共弹窗------------------------------------------------------------
}
// lyw 20190930 业务组件
var businessBtnManage = {
	configs : {},
	setBtns : function(containerId, config, dialogId){
		var i18n = NetstarComponent.business.I18N[languagePackage.userLang];
		var funcs = config.returnData ? config.returnData : {};
		var data = {
			btnsClass : '',
			selectName : i18n.selected,
			selectCloseName : i18n.selectedClose,
			addName : i18n.add,
			queryName : config.infoBtnName ? config.infoBtnName : '基本查询',
			closeName : i18n.close,
			isSelect : typeof(funcs.selectHandler) == "function",
			isSelectClose : typeof(funcs.selectHandler) == "function" && config.selectMode == "checkbox",
			isAdd : typeof(funcs.addHandler) == "function",
			isQuery : false,
			isClose : true,
		}
		var btnsTemplate = NetstarComponent.business.dialog.BTNSTEMPLATE;
		$('#' + containerId).html(btnsTemplate);
		config.btnsVueConfig = new Vue({
			el : '#' + containerId,
			data : data,
			watch: {},
			methods:{
				selected : function(){
					var pageFuncs = config.returnData;
					var panelInitParams = config.sendOutData;
					var _value = pageFuncs.selectHandler();
					var value = '';
					if(typeof(_value)=="object"){
						if($.isArray(_value)){
							value = $.extend(true, [], _value);
							if(value.length==0){
								value = false;
							}
						}else{
							value = $.extend(true, {}, _value);
							if($.isEmptyObject(value)){
								value = false;
							}
						}
					}else{
						value = _value;
						if(value.length==0){
							value = false;
						}
					}
					if(value){
						businessBtnManage.setValue(value, config, function(data, plusData){
							NetstarComponent.dialog[dialogId].vueConfig.close();
						});
					}else{
						nsAlert('没有选中value值', 'error');
						console.error('value设置错误');
						console.error(_value);
					}
				},
				selectedclose : function(){
					var pageFuncs = config.returnData;
					var panelInitParams = config.sendOutData;
					// 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
					var _value = pageFuncs.selectHandler();
					var value = '';
					if(typeof(_value)=="object"){
						if($.isArray(_value)){
							value = $.extend(true, [], _value);
							if(value.length==0){
								value = false;
							}
						}else{
							value = $.extend(true, {}, _value);
							if($.isEmptyObject(value)){
								value = false;
							}
						}
					}else{
						value = _value;
						if(value.length==0){
							value = false;
						}
					}
					if(value){
						businessBtnManage.setValue(value, config, function(data, plusData){
							NetstarComponent.dialog[dialogId].vueConfig.close();
						});
					}else{
						nsAlert('没有选中value值', 'error');
						console.error('value设置错误');
						console.error(_value);
					}
				},
				add : function(){
					var pageFuncs = config.returnData;
					pageFuncs.addHandler();
				},
				query : function(){
					var pageFuncs = config.returnData;
					pageFuncs.queryHandler();
				},
				close : function(){
					NetstarComponent.dialog[dialogId].vueConfig.close();
				}
			},
			mounted: function(){},
		});
	},
	setValue : function(selectVal, config, callBackFunc){
		if($.isArray(selectVal) && selectVal.length == 1){
			selectVal = selectVal[0];
		}
		var callBackObj = config.callback;
		var controllerObj = config.controller;
		var btnConfig = callBackObj.data;
		var sourceBtnConfig = controllerObj;
		var getPanelDataAjax = $.extend(true, {}, sourceBtnConfig.getPanelDataAjax);
		getPanelDataAjax.plusData = {
			btnId : btnConfig.id,
			callBackFunc : callBackFunc,
		};
		var ajaxData = {};
		if(typeof(getPanelDataAjax.data) == 'object' && !$.isEmptyObject(getPanelDataAjax.data)){
			ajaxData = NetStarUtils.getFormatParameterJSON(getPanelDataAjax.data, selectVal);
		}
		getPanelDataAjax.data = ajaxData;
		NetStarUtils.ajax(getPanelDataAjax, function(data, _ajaxConfig){
			var _config = businessBtnManage.configs[_ajaxConfig.plusData.btnId];
			var _sourceBtnConfig = _config.controller;
			if(_sourceBtnConfig.operatorMode == 'add'){
				// add
				NetstarTemplate.addValueByKeyField(data[_ajaxConfig.dataSrc], _config.callback, _config.controller);
			}else{
				// edit
				NetstarTemplate.setValueByKeyField(data[_ajaxConfig.dataSrc], _config.callback, _config.controller);
			}
			if(typeof(_ajaxConfig.plusData.callBackFunc) == "function"){
				_ajaxConfig.plusData.callBackFunc(data, _ajaxConfig.plusData);
			}
		});
	},
	show : function(pageConfig, config, obj){
		var callBackObj = config.callback;
		var controllerObj = config.controller;
		var value = callBackObj.dialogBeforeHandler(callBackObj).value;
		/*var pageParam = {};
		if(controllerObj.parameterFormat){
			pageParam = NetStarUtils.getFormatParameterJSON(JSON.parse(controllerObj.parameterFormat),value);
		}*/
		var btnConfig = callBackObj.data;
		var sourceBtnConfig = controllerObj.func.config;
		// 初始化方法 body容器
		var panelInitParams = {
			pageParam:                  {},             
			config:                     pageConfig,                     // 模板配置 通过请求的页面拿到的
			componentConfig:{
				editorConfig:           sourceBtnConfig,                // 组件配置参数
				container:              obj.config.bodyId,              // 容器 （id或class）通过组件拿到（组件配置）
				selectMode:             sourceBtnConfig.selectMode,     			// 单选 多选 不能选 通过组件拿到（组件配置）
				componentClass :        'list',                         // 组件类别 默认list
				doubleClickHandler:     function(_value){     
					if(_value.length == 0){
						nsAlert('没有选中数据','warning');
						return false;
					}
					var value = '';
					if(typeof(_value)=="object"){
						if($.isArray(_value)){
							value = $.extend(true, [], _value);
						}else{
							value = $.extend(true, {}, _value);
						}
					}else{
						value = _value;
					}           
					// 显示弹框 传入的双击方法 （关闭弹框和刷新value/inputText）
					console.log(value);
					businessBtnManage.setValue(value, config, function(data, plusData){
						NetstarComponent.dialog[obj.config.id].vueConfig.close();
					});
				},
				closeHandler:            function(){
					NetstarComponent.dialog[obj.config.id].vueConfig.close();
				}
			},
		}
		var morePanel = NetstarTemplate.componentInit(panelInitParams);
		config.returnData = morePanel;
		config.sendOutData = panelInitParams;
		// 显示按钮
		businessBtnManage.setBtns(obj.config.footerIdGroup, config, obj.config.id);
	},
	dialog : function(pageConfig, btnInfo){
		if(pageConfig.template != "businessDataBase"){
			nsAlert('配置错误，该模板不支持业务组件', 'error');
			console.error('配置错误，该模板不支持业务组件');
			return;
		}
		var config = nsProject.businessBtnManage.configs[btnInfo.btnId];
		var callBackObj = config.callback;
		var controllerObj = config.controller;
		var btnConfig = callBackObj.data;
		var sourceBtnConfig = controllerObj.func.config;
		var dialogConfig = {
			id: 			btnConfig.id + '-business',
			title: 			sourceBtnConfig.dialogTitle,
			height:			520,
			width : 		700,
			plusClass : 	'pt-business-dialog',
			shownHandler : function(obj){
				config.isShowDialog = true;
				config.dialogConfig = obj;
				businessBtnManage.show(pageConfig, config, obj);
				if(typeof(config.returnData.shownHandler)=="function"){
					config.returnData.shownHandler(config.sendOutData);
				}
			},
			hideHandler: function(){
				// 隐藏前回调
				if(typeof(config.returnData.hideHandler)=="function"){
					config.returnData.hideHandler(config.sendOutData);
				}
			},
			hiddenHandler : function(obj){
				// 隐藏后回调
				config.isShowDialog = false;
				if(config.$containerPage.length>0){
					config.$containerPage.remove();
				}
				if(typeof(config.returnData.hiddenHandler)=="function"){
					config.returnData.hiddenHandler(btnConfig.sendOutData);
				}
			},
		}
		NetstarComponent.dialogComponent.init(dialogConfig);
	},
}

/*根据不同参数获取容器显示资源内容
* parameter:  base;more;query_select;query_text;base_table;more_table;
*/
function getFieldsByState(businessObj, stateName, TypeObj){
	//businessObj 	object 		业务对象，必须有field字段
	//stateName 	string 		状态名，支持二级状态名称
	//TypeObj 		boolean/object 	
	/*
	 * TypeObj={
	 *  isColumn:true/false,是否返回column，默认返回field 表格/表单
	 *  isDialog: 是否为弹框 默认false
	 *  isMoreCol:表单是否返回二维数组 弹框有效 为了多列显示 isDialog:true时有用
	 * }
	*/
	if(debugerMode){
		var parametersArr = [
			[businessObj,'object',true],
			[stateName,'string',true],
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		//对
		if(typeof(businessObj.fields)!='object'){
			console.error('无法在指定业务对象中找到字段属性');
			console.error(businessObj)
			return;
		}
		if(typeof(businessObj.state)!='object'){
			console.error('无法在指定业务对象中找到状态属性');
			console.error(businessObj)
			return;
		}
	}
	//isColumn默认值是false 返回field的字段
	//if(typeof(isColumn)!='boolean'){
		//isColumn = false;
	//}
	
	switch (typeof(TypeObj)){
		case 'boolean':
			TypeObj ={
				isColumn : TypeObj,
				isDialog : false,
				isMoreCol : false,
			}
			break;			
		case 'undefined':
			TypeObj ={
				isColumn : false,
				isDialog : false,
				isMoreCol : false,
			}
			break;
		case 'object':
			var defaultTypeConfig = {
				isColumn : false,
				isDialog : false,
				isMoreCol : false,
			}
			nsVals.setDefaultValues(TypeObj, defaultTypeConfig);
			break;
	}
	//判断应该输出哪个对象 field还是columns
	var fieldType = 'fields';
	if(TypeObj.isColumn){
		fieldType = 'columns';
	}
	// 判断是否为弹框
	var isDialog = TypeObj.isDialog;
	// 判断是否多列
	var isMoreCol = TypeObj.isMoreCol;

	//拆分状态
	var stateNameStr = '';
	var stateClassStr = 'more';  //默认为more
	if(stateName.indexOf('.')==-1){
		stateNameStr = stateName;
		if(businessObj.state[stateNameStr]){
			if(typeof(businessObj.state[stateNameStr].tabs) == "object"){
				stateClassStr = 'tabs';
			}
		}else{
			console.error('状态丢失，未查明原因，重新保存思维导图即可，如果操作时知道执行了什么导致的找lyw修改');
			console.error(businessObj);
		}
	}else{
		var stateNameArray = stateName.split('.');
		stateNameStr = stateNameArray[0];
		stateClassStr = stateNameArray[1];
		// 判断是否选择错误
		switch(stateClassStr){
			case 'base':
			case 'more':
				if(typeof(businessObj.state[stateNameStr].field) != "object" && typeof(businessObj.state[stateNameStr]['field-more']) != "object"){
					stateClassStr = 'tabs';
				}
				break;
			case 'tabs':
				// 这种情况不存在 因为 模板配置选择时不提供选择tabs
				if(typeof(businessObj.state[stateNameStr].tabs) != "object"){
					stateClassStr = 'more';
				}
				break;
		}
	}
	//确认状态对象存在
	if(debugerMode){
		if(typeof(businessObj.state[stateNameStr])!='object'){
			console.error('业务对象下没有指定的状态：'+stateNameStr);
			console.error(businessObj);
			return;
		}
	}
	
	//修改查询条件
	var searchStateName = [];
	var searchFieldType = [];
	var searchFieldClass = [];  //'fieldBusiness','fieldControl','fieldVisual'
	switch(stateClassStr){
		case 'tabs':
			//基本字段
			searchStateName = ['tabs'];
			break;
		case 'base':
			//基本字段
			searchStateName = ['field','field-sever'];
			break;
		case 'more':
			//更多字段 返回全部
			searchStateName = ['field', 'field-more','field-sever'];
			break;
		case 'query_select':
			//操作字段中的所有select类的组件
			searchStateName = ['field', 'field-more','field-sever'];
			searchFieldType = ['select','checkbox','select2','radio'];
			searchFieldClass = ['fieldControl'];
			break;
		case 'query_text':
			//操作字段中所有的文本组件
			searchStateName = ['field', 'field-more','field-sever'];
			searchFieldType = ['text'];
			searchFieldClass = ['fieldControl'];
			break;
	}
	var fieldsArray = [];
	//先根据state名字查找
	for(var ssnI = 0; ssnI<searchStateName.length; ssnI++){
		var isPush = true;  //是否应该返回相应字段
		var stateType = searchStateName[ssnI]; // 状态类型 tabs/field/field-more
		var stateData = businessObj.state[stateNameStr][stateType];
		for(var fieldKey in stateData){

			//根据类型判断
			if(searchFieldType.length>0){
				var isSetType = searchFieldType.indexOf(businessObj.fields[fieldKey].type)>-1;
				isPush = isSetType;
			}else{
				//没定义类型则全都可以
				isPush = true;
			}
			if(isPush == false){
				continue;
			}

			//根据mindjet数据描述的类型判断 如果定义了特定类型，则包含该类型则类型
			if(searchFieldClass.length>0){
				var isSetClass = searchFieldClass.indexOf(businessObj.fields[fieldKey].mindjetClass)>-1;
				isPush = isSetClass;
			}else{
				//没定义类型则全都可以
				isPush = true;
			}
			if(isPush == false){
				continue;
			}
			if(typeof(businessObj[fieldType][fieldKey])!='object' && typeof(stateData[fieldKey].edit)!='object'){
				if(debugerMode){
					console.error('状态字段：'+fieldKey+'不存在');
				}
				continue;
			}else{
				// 状态字段是否编辑 若编辑了则读取编辑数据 否则从 fields/columns 中获得
				if(typeof(stateData[fieldKey].edit)=='object'){
					var stateFieldKey = '';
					if(fieldType=='fields'){
						stateFieldKey = 'form';
					}
					if(fieldType=='columns'){
						stateFieldKey = 'table';
					}
					if(stateData[fieldKey].edit[stateFieldKey]){
						var fieldConfig = $.extend(true, {}, stateData[fieldKey].edit[stateFieldKey]);
					}else{
						// console.error('状态字段：'+fieldKey+'状态编辑的fields字段错误','error');
						var fieldConfig = $.extend(true, {}, businessObj[fieldType][fieldKey]);
						// continue;
					}
				}else{
					var fieldConfig = $.extend(true, {}, businessObj[fieldType][fieldKey]);
				}
				fieldConfig["mindjetIndexState"] = stateData[fieldKey]["mindjetIndexState"];
				//根据原始类型处理数据
				switch(fieldType){
					case 'fields':
						// 通过原始类型判断表单配置 （字典）
						switch(fieldConfig.mindjetType){
							case 'dict':
								if(typeof(nsVals.dictData[fieldConfig.dictArguments])=='undefined'){
									console.error('无法找到字典数据:'+fieldConfig.dictArguments)
								}else{
									fieldConfig.subdata = nsVals.dictData[fieldConfig.dictArguments].subdata;
								}
							break;
						}
						// 通过 状态类型（stateType）判断表单显示样式 只有field/field-more
						if(stateType=='field'||stateType=='field-more'||stateType=='field-sever'){
							fieldConfig.mindjetFieldPosition = stateType;
						}
						break
					case 'columns':
						// 字典处理
						switch(fieldConfig.mindjetType){
							case 'dict':
								if(typeof(nsVals.dictData[fieldConfig.dictArguments])=='undefined'){
									console.error('无法找到字典数据:'+fieldConfig.dictArguments)
								}else{
									fieldConfig.formatHandler = {
										type:'dictionary',
										data:nsVals.dictData[fieldConfig.dictArguments].jsondata
									}
									fieldConfig.columnType = "dictionary";
								}
								if(typeof(fieldConfig.editConfig)=="object"){
									if(typeof(nsVals.dictData[fieldConfig.editConfig.dictArguments])=='undefined'){
										console.error('无法找到字典数据:'+fieldConfig.editConfig.dictArguments)
									}else{
										fieldConfig.editConfig.subdata = nsVals.dictData[fieldConfig.editConfig.dictArguments].subdata;
									}
								}
								break;
						}
						//对列表里的字典类型的特殊处理，把显示字段换成冗余字段
						if(fieldConfig.mindjetType == 'data' && typeof(fieldConfig.redundant) == "undefined"){//专门为crm添加
							fieldConfig.hidden = true;
							var dictNameField = $.extend(true, {}, fieldConfig);
							dictNameField.field = dictNameField.field + 'DictName';
							fieldsArray.push(dictNameField);
						}
						if(typeof(fieldConfig.redundant) == "string"){ //自定义冗余字段
							fieldConfig = $.extend(true, {}, businessObj[fieldType][fieldConfig.redundant]);
						}
						if(stateType == 'tabs'){
							fieldConfig["mindjetTabName"] = stateData[fieldKey]["mindjetTabName"];
							fieldConfig.mindjetTabNamePosition = stateData[fieldKey]["mindjetTabNamePosition"]; // 识别的tab位置字段
							// fieldConfig.tabPosition = stateData[fieldKey]["mindjetTabNamePosition"]; // 曾经识别不知道为什么改了 sjj配置识别字段 lyw注
						}
						// 宽度处理
						if(typeof(fieldConfig.width) == 'undefined'){
							fieldConfig.width = 200;
						}
						break
				}
				fieldsArray.push(fieldConfig);
			}
		}	
	}
	//根据生成顺序排序
	fieldsArray.sort(function(a,b){
		return a.mindjetIndexState - b.mindjetIndexState;
	})
	// 弹框是否多列
	if(!TypeObj.isColumn){
		if(isDialog){
			if(isMoreCol){
				fieldsArray = [fieldsArray];
			}
		}
	}
	// console.log(fieldsArray);
	//lyw  2018/04/23    //20140411 删除 原因 如果在配置模板时配置隐藏字段则会出错 暂时删除等待解决
	// if(fieldType == 'fields'&& TypeObj.type=="form"){
	// 	//列宽对照
	// 	var columnArr = {
	// 		1:[1,1,2,6],
	// 		2:[2,2,4,6],
	// 		3:[3,4,6,12],
	// 		4:[4,4,6,12],
	// 		6:[6,6,6,12],
	// 		8:[8,8,12,12],
	// 		9:[9,9,12,12],
	// 		12:[12,12,12,12],
	// 	};
	// 	var fieldsGroupArray = [[]]; //生成的二维数组
	// 	var fieldsGroupArrayIndex = 0; //数组下标
	// 	var fieldsColumnLengthArr = [0,0,0,0]; //相加后的数组
	// 	//列相加
	// 	function fieldsColumnLengthFun(_fieldsColumnLengthArr,_columnForm){
	// 		for(var i=0;i<_fieldsColumnLengthArr.length;i++){
	// 			if($.isArray(columnArr[_columnForm])){
	// 				_fieldsColumnLengthArr[i] += columnArr[_columnForm][i];
	// 			}else{
	// 				_fieldsColumnLengthArr[i] += _columnForm;
	// 			}
	// 		}
	// 		return _fieldsColumnLengthArr;
	// 	}
	// 	//返回要插入的div ---计算列宽
	// 	function columnLengthToClass(_fieldsColumnLengthArr){
	// 		var fieldsColumnLast = [];
	// 		var formClassString = '';
	// 		for(var i=0;i<_fieldsColumnLengthArr.length;i++){
	// 			fieldsColumnLast[i] = 12-_fieldsColumnLengthArr[i]%12;
	// 			var str = '';
	// 			switch(i){
	// 				case 0:
	// 					str = 'lg';
	// 					break;
	// 				case 1:
	// 					str = 'md';
	// 					break;
	// 				case 2:
	// 					str = 'sm';
	// 					break;
	// 				case 3:
	// 					str = 'xs';
	// 					break;
	// 			}
	// 			if(fieldsColumnLast[i] == 12){
	// 				formClassString += ' hidden-' + str;
	// 			}else{
	// 				formClassString += ' col-' + str + '-' + fieldsColumnLast[i];
	// 			}
	// 		}

	// 		return '<div class="'+formClassString+' form-td"><div class="form-group"></div></div>';
	// 	}
		
	// 	function endAddHtml(_fieldsColumnLengthArr,columnForm){
	// 		var endColumnLengthArrUp = $.extend(true,[],_fieldsColumnLengthArr);
	// 		var endColumnLengthArr = fieldsColumnLengthFun(endColumnLengthArrUp,columnForm);
	// 		var fieldsColumnLast = [];
	// 		var formClassString = '';
	// 		for(var i=0;i<endColumnLengthArr.length;i++){
	// 			if(endColumnLengthArr[i]%12<columnArr[columnForm][i]){
	// 				fieldsColumnLast[i] = 12-_fieldsColumnLengthArr[i]%12;
	// 				fieldsColumnLengthArr[i] = 0;
	// 			}else{
	// 				fieldsColumnLast[i] = 12;
	// 				fieldsColumnLengthArr[i] = _fieldsColumnLengthArr[i];
	// 			}
	// 			var str = '';
	// 			switch(i){
	// 				case 0:
	// 					str = 'lg';
	// 					break;
	// 				case 1:
	// 					str = 'md';
	// 					break;
	// 				case 2:
	// 					str = 'sm';
	// 					break;
	// 				case 3:
	// 					str = 'xs';
	// 					break;
	// 			}
	// 			if(fieldsColumnLast[i] == 12){
	// 				formClassString += ' hidden-' + str;
	// 			}else{
	// 				formClassString += ' col-' + str + '-' + fieldsColumnLast[i];
	// 			}
	// 		}
	// 		return '<div class="'+formClassString+' form-td"><div class="form-group"></div></div>';
	// 	}
	// 	var starHiddenNum = 0;
	// 	// 判断前几个是hidden
	// 	for(var i=0; i<fieldsArray.length; i++){
	// 		if(fieldsArray[i].type == "hidden"){
	// 			starHiddenNum = i+1;
	// 		}else{
	// 			break;
	// 		}
	// 	}
	// 	for(var i=0; i<fieldsArray.length; i++){
	// 		if(fieldsArray[i].type == "hidden"){
	// 			fieldsGroupArray[fieldsGroupArrayIndex].push(fieldsArray[i]);
	// 		}else{
	// 			if(typeof(fieldsArray[i].column) == "undefined"){
	// 				var columnForm = 3;
	// 			}else{
	// 				var columnForm = parseInt(fieldsArray[i].column);
	// 			}
	// 			if((fieldsArray[i].column == 12 || fieldsArray[i].element == "label" || i==fieldsArray.length-1) && i>starHiddenNum){
	// 				if(i==fieldsArray.length-1){
	// 					var formClassString = endAddHtml(fieldsColumnLengthArr,columnForm)
	// 					fieldsGroupArray[fieldsGroupArrayIndex].push({html:formClassString});
	// 					fieldsGroupArray[fieldsGroupArrayIndex].push(fieldsArray[i]);
	// 					fieldsColumnLengthArr = fieldsColumnLengthFun(fieldsColumnLengthArr,columnForm);
	// 					var formClassStringEnd = columnLengthToClass(fieldsColumnLengthArr);
	// 					// fieldsGroupArray[fieldsGroupArrayIndex].push(fieldsArray[i]);
	// 					fieldsGroupArray[fieldsGroupArrayIndex].push({html:formClassStringEnd});
	// 				}else{
	// 					var formClassString = columnLengthToClass(fieldsColumnLengthArr);
	// 					fieldsGroupArray[fieldsGroupArrayIndex].push({html:formClassString});
	// 					fieldsGroupArray[fieldsGroupArrayIndex].push(fieldsArray[i]);
	// 					fieldsGroupArray.push([]);
	// 					fieldsGroupArrayIndex++;
	// 					fieldsColumnLengthArr = [0,0,0,0];
	// 				}
	// 			}else{
	// 				if(fieldsArray[i].element == "label"){
	// 				}else{
	// 					fieldsColumnLengthArr = fieldsColumnLengthFun(fieldsColumnLengthArr,columnForm);
	// 				}
	// 				fieldsGroupArray[fieldsGroupArrayIndex].push(fieldsArray[i]);
	// 			}
	// 		}
			
	// 	}
	// 	//20180519
	// 	var fieldsArrayEnd = [];
	// 	for(var index=0;index<fieldsGroupArray.length;index++){
	// 		for(var indexSec=0;indexSec<fieldsGroupArray[index].length;indexSec++){
	// 			fieldsArrayEnd.push(fieldsGroupArray[index][indexSec]);
	// 		}
	// 	}
	// 	return fieldsArrayEnd;
	// }
	return fieldsArray;
}
/*
*根据状态数组获取所有状态字段
*
*/
function getFieldsByStateArray(businessObj, stateNameArray, typeObj){
	//businessObj 	object 		业务对象，必须有field字段
	//stateNameArray 	array 		状态名，支持二级状态名称
	//isColumn 		boolean 	是否返回column，默认返回field
	if(debugerMode){
		var parametersArr = [
		[businessObj,'object',true],
		[stateNameArray,'object',true],
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		//对
		if(typeof(businessObj.fields)!='object'){
			console.error('无法在指定业务对象中找到字段属性');
			console.error(businessObj)
			return;
		}
		if(typeof(businessObj.state)!='object'){
			console.error('无法在指定业务对象中找到状态属性');
			console.error(businessObj)
			return;
		}
	}
	//isColumn默认值是false 返回field的字段
	switch (typeof(typeObj)){
		case 'boolean':
			typeObj ={
				isColumn : TypeObj,
				type : 'form'
			}
			break;			
		case 'undefined':
			typeObj ={
				isColumn : false,
				type : 'form'
			}
			break;
		case 'object':
			var defaultTypeConfig = {
				isColumn:false,
				type:'form'
			}
			nsVals.setDefaultValues(typeObj, defaultTypeConfig);
			break;
	}
	
	var fieldsArray = [];
	if($.isArray(stateNameArray)){
		for(var si =0;si<stateNameArray.length;si++){
			fieldsArray=fieldsArray.concat(getFieldsByState(businessObj,stateNameArray[si],typeObj));
			console.log('--------------------');
			console.log(fieldsArray);
		}
		//去重
		fieldsArray = uniqueArray(fieldsArray,typeObj);
	}
	return fieldsArray;
}
//数组去重
function uniqueArray(arr,typeObj){
	var res = [];
	var json = {};
	var flag = typeObj.isColumn?'field':'id';
	for(var i = 0; i < arr.length; i++){
		if(!json[arr[i][flag]]){
			res.push(arr[i]);
			json[arr[i][flag]] = 1;
		}
	}
	return res;
}
//获取字段定义，不区分状态	，可以带字段分类
function getFieldsByClass(businessObj, classIndex, isColumn){
	// businessObj 	object 			业务对象，必须包含fields字段
	// classIndex   number [0-4] 	业务对象分类，选填，如果不填则返回全部
	// 								可用值有0-4，0：业务字段； 1：操作字段，2：显示字段，3：默认自定义字段（尚未使用），4：操作和显示字段
	// isColumn 	boolean  		是否返回column，默认返回field
	if(debugerMode){
		var parametersArr = [
			[businessObj,'object',true],
			[classIndex,'number',false],
			[isColumn,'boolean',false],
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		if(typeof(businessObj.fields)!='object'){
			console.error('无法在指定业务对象中找到字段属性');
			console.error(businessObj)
			return;
		}
	}
	
	//isColumn默认值是false 返回field的字段
	if(typeof(isColumn)!='boolean'){
		isColumn = false;
	}
	//class默认值是false 返回field的字段
	if(typeof(classIndex)!='number'){
		classIndex = -1;
	}
	var fieldsArray = [];
	for(fieldKey in businessObj.fields){
		var isPush = false;
		switch(classIndex){
			case -1:
				//-1是默认值，全部返回
				isPush = true;
				break;
			case 0:
				//业务字段
				if(businessObj.fields[fieldKey].mindjetClass == 'fieldBusiness'){
					isPush = true;
				}
				break;
			case 1:
				//操作字段
				if(businessObj.fields[fieldKey].mindjetClass == 'fieldControl'){
					isPush = true;
				}
				break;
			case 2:
				//显示字段
				if(businessObj.fields[fieldKey].mindjetClass == 'fieldVisual'){
					isPush = true;
				}
				break;
			case 3:
				console.error('暂时不能使用的参数：'+classIndex+' 合法值为0,1,2,4');
				//暂时不用
				break;
			case 4:
				//显示字段
				if(businessObj.fields[fieldKey].mindjetClass == 'fieldControl' || businessObj.fields[fieldKey].mindjetClass == 'fieldVisual'){
					isPush = true;
				}
				break;
			default:
				console.error('不能识别的参数：'+classIndex+' 合法值为0-4')
				break;
		}
		if(isPush){
			if(isColumn){
				//返回column
				var fieldConfig = $.extend(true, {}, businessObj.columns[fieldKey]);
			}else{
				//返回field
				var fieldConfig = $.extend(true, {}, businessObj.fields[fieldKey]);
			}
			
			fieldsArray.push(fieldConfig);
		}
	}
	fieldsArray.sort(function(a,b){
		return a.mindjetIndex - b.mindjetIndex;
	})
	return fieldsArray;
}

//格式化一些表单字段显示
function formJsonFormat(jsonData,formField){
		var newFormJson = {};
		if(jsonData){
			$.each(jsonData,function(key,value){
				for(var fi=0;fi<formField.length;fi++){
					if(formField[fi].id == key){
						switch(formField[fi].type){
							case 'datetime':
							case 'date':
								newFormJson[key] = Date.parse(value);
								break;
							case 'provinceSelect':
								var locationName ={};
								locationName['province'] = value.province;
								locationName['city'] = value.city;
								locationName['area'] = value.area;
								var locationCode = '';
								if(value.areaCode != ''){
									locationCode = value.areaCode;
								}else{
									if(value.cityCode){
										locationCode = value.cityCode;
									}else{
										locationCode = value.provinceCode;
									}
								}
								newFormJson['locationName'] = JSON.stringify(locationName);
								newFormJson['locationCode'] = locationCode;
								break;
							default:
								newFormJson[key] = value;
								break;
						}
					}
				}
			})
			return newFormJson;
		}
}
//解析Mindjet保存的xml
function getXML(url){
	//解析Mindjet保存的xml url是上传后的xml文件地址
	//console.log(url);
}
/*
*根据方法名称获取按钮数组
*businessObj:业务对象
*functions:方法名称字符串 如果有多个方法则中间用','隔开
*/
function getFuncArrayByFuncNames(businessObj,funcNameStr){
	if(debugerMode){
		var parametersArr = [
			[businessObj,'object',true],
			[funcNameStr,'string',true]
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		if(typeof(businessObj.controller)!='object'){
			console.error('无法在指定业务对象中找到方法属性');
			console.error(businessObj)
			return;
		}
		if(funcNameStr == ''){
			console.error('第二个参数不能为空字符串');
			console.error(funcNameStr);
			return;
		}
	}
	//按钮数组
	var funcObjStrArray = [],
	funcObjArray=[];
	funcNameArray = funcNameStr.split(',');
	for(var fi = 0;fi<funcNameArray.length;fi++){
		var funObjNameArr=funcNameArray[fi].split('.');
		var funcAttr = {
	        controller:businessObj.controller,  //controller对象
	        functionClass: funObjNameArr[0],	//
	        functionName:funObjNameArr[1]       //,
	        //defaultMode:businessObj.controller[funObjNameArr[0]][funObjNameArr[1]].defaultMode,
	    }
		funcObjStrArray.push(funcAttr);
	}
	funcObjArray=getFuncArrayByFuncObjArray(funcObjStrArray);
	return funcObjArray;
};
/*
*根据方法名称获取按钮数组
*xmmapJson:思维导图对象
*funcNameStr:方法名称字符串 如果有多个方法则中间用','隔开
*/
function getFuncArrayByXmmapFuncNames(xmmapJson,funcNameStr){
	if(debugerMode){
		var parametersArr = [
			[xmmapJson,'object',true],
			[funcNameStr,'string',true]
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		if($.isEmptyObject(xmmapJson)){
			console.error('思维导图对象为空');
			console.error(xmmapJson)
			return;
		}
		if(funcNameStr == ''){
			console.error('第二个参数不能为空字符串');
			console.error(funcNameStr);
			return;
		}
	}
	// 按钮数组
	var funcObjStrArray = [],
	funcObjArray=[];
	funcNameArray = funcNameStr.split(',');
	var funcNameObj = {};
	var workflowFuncNameArray = [];
	if(funcNameStr.indexOf('.') > -1){
		for(var i=0; i<funcNameArray.length; i++){
			if(funcNameArray[i].indexOf('.') > -1){
				var _arr = funcNameArray[i].split('.');
				funcNameObj[_arr[0]] = $.isArray(funcNameObj[_arr[0]]) ? funcNameObj[_arr[0]] : [];
				funcNameObj[_arr[0]].push(_arr[1]);
			}
		}
	}else{
		// 单独拿出工作流按钮 为了只出一次
		var workflowBtnArr = ['nsWorkflowViewer','nsWorkflowSubmit','nsWorkflowReject','nsWorkflowCancelSign','nsWorkflowWithdraw','nsWorkflowRollback','nsWorkflowRebook','nsWorkflowTrunTo','nsWorkflowHasten','nsWorkflowEmergency','nsWorkflowComplete','nsWorkflowForWard','nsWorkflowSubmitAllBatch','nsWorkflowFindHandleRec']
		var __funcNameArray = [];
		for(var i=0; i<funcNameArray.length; i++){
			if(workflowBtnArr.indexOf(funcNameArray[i]) > -1){
				workflowFuncNameArray.push(funcNameArray[i]);
			}else{
				__funcNameArray.push(funcNameArray[i]);
			}
		}
		funcNameArray = __funcNameArray;
	}
	var businessFilterToSystem = nsMindjetToJS.getTags().businessFilterToSystem; // 业务对象同级中需要过滤掉的系统参数
	// 在方法中查询方法返回方法属性
	function getFuncAttrByFun(funcObj, _voNameStr){
		var funcAttr = false;
		for(var funcClass in funcObj){
			// funcClass : list / modal
			if(typeof(funcObj[funcClass])=='object'){
				for(var funcName in funcObj[funcClass]){
					var _funcNameArray = $.isArray(funcNameObj[_voNameStr]) ? funcNameObj[_voNameStr] : funcNameArray;
					if(_funcNameArray.indexOf(funcName) > -1){
						funcAttrObj = {
							controller: funcObj,  //controller对象
							functionClass: funcClass,	//
							functionName: funcName       //,
						}
						if(!funcAttr){
							funcAttr = [];
						}
						funcAttr.push(funcAttrObj);
					}
				}
			}
		}
		return funcAttr;
	}
	function setFuncObjStrArray(_xmmapJson, _voNameStr){
		for(var businessName in _xmmapJson){
			if(businessFilterToSystem.indexOf(businessName)==-1){
				var businessObj = _xmmapJson[businessName];
				// 判断是否存在方法
				if(typeof(businessObj.controller) == 'object'){
					// 存在方法时根据方法名字查找方法
					var funcAttr = getFuncAttrByFun(businessObj.controller, _voNameStr);
					if(funcAttr){
						for(var funcI=0;funcI<funcAttr.length;funcI++){
							funcObjStrArray.push(funcAttr[funcI]);
						}
					}
				}
			}
		}
	}
	var isSetWorkFlowBtns = false;
	for(var voNameStr in xmmapJson){
		setFuncObjStrArray(xmmapJson[voNameStr], voNameStr);
		// 兼容之间版本 新保存的不会走下边 因为新保存的保存了按钮的vo名字 lyw 20191016
		if(workflowFuncNameArray.length > 0 && !isSetWorkFlowBtns){
			if(typeof(xmmapJson[voNameStr].nsWorkflowVo)=='object'){
				isSetWorkFlowBtns = true;
				var funcObj = xmmapJson[voNameStr].nsWorkflowVo.controller;
				for(var funcClass in funcObj){
					// funcClass : list / modal
					if(typeof(funcObj[funcClass])=='object'){
						for(var funcName in funcObj[funcClass]){
							if(workflowFuncNameArray.indexOf(funcName) > -1){
								var funcAttrObj = {
									controller: funcObj,  //controller对象
									functionClass: funcClass,	//
									functionName: funcName       //,
								}
								funcObjStrArray.push(funcAttrObj)
							}
						}
					}
				}
			}
		}
	}
	// for(var businessName in xmmapJson){
	// 	if(businessFilterToSystem.indexOf(businessName)==-1){
	// 		var businessObj = xmmapJson[businessName];
	// 		// 判断是否存在方法
	// 		if(typeof(businessObj.controller) == 'object'){
	// 			// 存在方法时根据方法名字查找方法
	// 			var funcAttr = getFuncAttrByFun(businessObj.controller);
	// 			if(funcAttr){
	// 				for(var funcI=0;funcI<funcAttr.length;funcI++){
	// 					funcObjStrArray.push(funcAttr[funcI]);
	// 				}
	// 			}
	// 		}
	// 	}
	// }
	funcObjArray=getFuncArrayByFuncObjArray(funcObjStrArray);
	return funcObjArray;

	for(var fi = 0;fi<funcNameArray.length;fi++){
		var funObjNameArr=funcNameArray[fi].split('.');
		var funcAttr = {
	        controller:businessObj.controller,  //controller对象
	        functionClass: funObjNameArr[0],	//
	        functionName:funObjNameArr[1]       //,
	        //defaultMode:businessObj.controller[funObjNameArr[0]][funObjNameArr[1]].defaultMode,
	    }
		funcObjStrArray.push(funcAttr);
	}
	funcObjArray=getFuncArrayByFuncObjArray(funcObjStrArray);
	return funcObjArray;
};
/*
*根据方法数组获取按钮数组
*funcObjStrArray:[business.controller....,business.controller....]
*/
function getFuncArrayByFuncObjArray(funcObjStrArray){
	var btnArray = [];
	var funcObj = {};   //方法对象
	var btnObj= {};		//按钮对象
	if(funcObjStrArray.length>0){
		for(var fi = 0;fi<funcObjStrArray.length;fi++){
			btnObj=getFuncObj(funcObjStrArray[fi]);
			btnArray.push(btnObj);
		}
		return btnArray;
	}else{
		return btnArray;
	}
}
//sjj20181119 针对下拉选项的按钮添加事件
function dropdownBtnLoadPage(_callback,_configObj){
	var configObj = $.extend(true,{},_configObj);
	configObj = _callback.dialogBeforeHandler(configObj);
	var dialogParam = configObj.dialogParam;
	var funconfig = configObj.functionConfig;
	var jsonData = {
		keyField:funconfig.relateKeyField,//跳转界面要显示的vo
		dataLevel:funconfig.dataLevel,//topage跳转关系parent,child,brothers
		data:dialogParam.value,//接受到的参数
		vo:{
			keyField:dialogParam.vo.keyField,
			idField:dialogParam.vo.idField
		},//vo结构
		url:window.location.href,//回传的url
	}
	if(funconfig.url){
		var pageParam = JSON.stringify(jsonData);
		pageParam = encodeURIComponent(encodeURIComponent(pageParam));
		var url = getRootPath()+funconfig.url+'?templateparam='+pageParam;;
		nsFrame.loadPage(url);
	}else{
		console.warn(funconfig);
		nsalert('不存在url，无法跳转');
	}
}
/*
*根据方法获取按钮function对象
*funcObj:controller下具体方法对象
*/
function getFuncObj(funcObj){
	if(debugerMode){
		var parametersArr = [
			[funcObj,'objectNotEmpty',true]
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		var optionsArr = [
			['controller','object',true],  			//controller对象
			['functionClass','string',true], 		// 基本方法对象名称
			['functionName','string',true] 			//具体方法对象名称
			//['defaultMode','string',true] 		//
			]
		nsDebuger.validOptions(optionsArr,funcObj);
		var controller = funcObj.controller;
		var functionClass =funcObj.functionClass;
		var functionName = funcObj.functionName;
		var funObjParent = controller[functionClass];
		var parametersArr = [
			[funObjParent,'objectNotEmpty',true, '基本方法对象名称:'+functionClass+'不存在']
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		var funObjChild = controller[functionClass][functionName];
		var parametersArr = [
			[funObjChild,'objectNotEmpty',true,'具体方法对象名称:'+functionName+'不存在']
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		if(typeof(controller[functionClass][functionName].func)!='object'){
			console.error('无法在指定业务对象中找到方法属性');
			console.error(controller[functionClass][functionName].func)
			return;
		}
	}
	
	//var defaultMode = funcObj.defaultMode;
	var controller = funcObj.controller;
	var functionClass =funcObj.functionClass;//基本方法对象
	var functionName = funcObj.functionName;//具体方法对象
	var functionObj = {};					//按钮方法
	var func = controller[functionClass][functionName]['func'];
	var userMode = controller[functionClass][functionName].userMode;

	var btnObj = {};						//按钮对象
	//判断是否设置defaultMode 如果没有就取ajax方法
	if(typeof(userMode)=='string'){
		functionObj = func[userMode];
	}else{
		functionObj = func['function'];
	}
	//判断按钮名称如果没有设置就取默认(这里需要添加按钮默认显示)
	btnName = typeof(func.config['text']) == 'string' ? func.config['text'] : '按钮默认展现形式';
	//按钮对象
	btnObj = {
		functionConfig:$.extend(true,{},func.config),
		btn:{
			text:btnName,
			isReturn:true,
			handler:functionObj
		}
	}	
	//sjj20181119 如果是下拉选择按钮则存在subdata需要处理的情况
	if($.isArray(func.config.subdata)){
		var dropArray = $.extend(true,[],func.config.subdata);
		for(var dropI=0; dropI<dropArray.length; dropI++){
			var dropData = dropArray[dropI];
			var commonHandler;
			switch(dropData.defaultMode){
				case 'loadPage':
					commonHandler = dropdownBtnLoadPage;
					break;
				case 'toPage':
					commonHandler = toPageCommon;
					break;
				case 'dialog':
				case 'valueDialog':
					commonHandler = dialogCommon;
					break;
				case 'confirm':
					commonHandler = confirmCommon;
					break;
				default:
					commonHandler = customCommon;
					break;
			}
			dropData.handler = commonHandler;
		}
		btnObj.btn.subdata = dropArray;
	}
	return btnObj;
}
/*
*跨业务对象获取对象下的方法按钮
*parentBusiness:总业务对象
*funcNameStr:子业务对象加方法名 
*/
function getFuncArrayFromDefaultObj(parentBusiness,funcNameStr){
	if(debugerMode){
		var parametersArr = [
			[parentBusiness,'object',true],
			[funcNameStr,'string',true]
		]
		var isVaild = nsDebuger.validParameter(parametersArr);
		if(isVaild == false){
			return;
		}
		if(funcNameStr == ''){
			console.error('第二个参数不能为空字符串');
			console.error(funcNameStr);
			return;
		}
		var funcNameArray = funcNameStr.split(',');
		for(var i = 0;i<funcNameArray.length;i++){
			var funcNamei=funcNameArray[i];
			var businessObj=funcNamei.substring(0,funcNamei.indexOf('.',1));
			if(debugerMode){
				var parametersArr = [
					[parentBusiness[businessObj],'objectNotEmpty',true,'业务对象:'+businessObj+'不存在']
				]
				var isVaild = nsDebuger.validParameter(parametersArr);
				if(isVaild == false){
					return;
				}
			}
		}
	}
	//按钮数组
	var functions = [];
	var funcNameArray = funcNameStr.split(',');
	for(var i = 0;i<funcNameArray.length;i++){
		var funcNamei=funcNameArray[i];
		//业务对象名称
		var businessObj=funcNamei.substring(0,funcNamei.indexOf('.',1));
		//方法名称
		var funcNameStr=funcNamei.substring(funcNamei.indexOf('.',1)+1);
		//业务对象
		var businessObj = parentBusiness[businessObj];
		functionArray=getFuncArrayByFuncNames(businessObj,funcNameStr);
		functions=functions.concat(functionArray);
	}
	return functions;
}
//**************************************以上是格式化表单和表格字段******************************
/*********************20180320sjj 追加自定义业务组件逻辑代码添加 start**********************/
function partInit(_projectObj,serviceComponent){
	_projectObj.parts = {};
	for(var component in serviceComponent){
		_projectObj.parts[component] = serviceComponent[component];
	}
}
/*********************20180320sjj 追加自定义业务组件逻辑代码添加 end**********************/
//查看弹出页 sjj 20190403
function showPageData(pageConfig,configObj){
	pageConfig.readonly = configObj.value.readonly;
	delete configObj.value.readonly;
	pageConfig.pageParam = configObj.value;
	pageConfig.closeHandler = (function(){
		return function(){}
	})(configObj);
	NetstarTemplate.init(pageConfig);
}
//查看弹出页 lyw 20190927 表格调用 关闭时刷新表格
function showPageDataByGrid(pageConfig, configObj, gridId){
	pageConfig.readonly = configObj.value.readonly;
	delete configObj.value.readonly;
	pageConfig.pageParam = configObj.value;
	pageConfig.closeHandler = (function(config, _gridId){
		return function(pageData){
			NetStarGrid.refreshById(_gridId);
		}
	})(pageConfig, gridId);
	NetstarTemplate.init(pageConfig);
}
function sendPrintInfo(data){
	var btnsConfigName = data.btnsConfigName;
	var btnIndex = data.btnIndex;
	var vueConfig = nsManageBtnsConfigs[btnsConfigName].vueConfig.vueConfigs[btnIndex];
	console.log(data);
	var tipInfo = false;
	switch(data.errorCode){
		case '0':
			var isSuccess = true;
			var taskQuantity = 0;
			var taskCompleted = 0;
			if(typeof(data.taskQuantity) != "undefined" && typeof(data.taskCompleted) != "undefined"){
				isSuccess = false;
				taskQuantity = Number(data.taskQuantity);
				taskCompleted = Number(data.taskCompleted);
				if(taskQuantity == taskCompleted){
					tipInfo = data.errorMessage;
					isSuccess = true;
				}
			}else{
				tipInfo = data.errorMessage;
			}
			if(isSuccess){
				if(data.action == "cancelPrint"){
					vueConfig.showType = 'default';
					vueConfig.showText = vueConfig.defaultText;
					vueConfig.dropdownState = 'list';
					vueConfig.isShowDropdown = false;
				}else{
					vueConfig.showType = 'check';
					vueConfig.showText = '打印成功';
					vueConfig.isShowDropdown = false;
				}
			}else{
				vueConfig.showType = 'loading';
				vueConfig.showText = '取消打印';
				vueConfig.isShowDropdown = false;
				var numStr = (taskCompleted/taskQuantity).toFixed(2) * 100 + '%';
				vueConfig.loadingText = numStr;
				vueConfig.loadingStyle = {
					width : numStr,
				};
			}
			break;
		case '1024':
			break;
		case '1':
		case '1048576':
		case '128':
		case '16':
		case '2':
		case '2048':
		case '262144':
		case '32':
		case '32768':
		case '4':
		case '4096':
		case '4194304':
		case '512':
		case '65536':
		case '8':
		case '8388608':
		case '9999':
			tipInfo = data.errorMessage;
			vueConfig.showType = 'warn';
			vueConfig.showText = '打印错误';
			vueConfig.dropdownState = 'info';
			vueConfig.infoTitle = tipInfo;
			vueConfig.isShowDropdown = true;
			break;
		default:
			tipInfo = data.msg;
			break;
	}
	if(tipInfo){
		nsAlert(tipInfo);
		console.warn(tipInfo);
	}
}
// 接收导入消息
function acceptImportExportMessage(data){
	var btnsConfigName = data.btnsConfigName;
	var btnIndex = data.btnIndex;
	var vueConfig = nsManageBtnsConfigs[btnsConfigName].vueConfig.vueConfigs[btnIndex];
	console.log(data);
	var tipInfo = false;
	switch(data.errorCode){
		case '0':
			var isSuccess = true;
			var taskCompleted = 0; // 完成进度
			if(typeof(data.taskCompleted) != "undefined"){
				isSuccess = false;
				taskCompleted = Number(data.taskCompleted);
				if(1 == taskCompleted){
					tipInfo = data.errorMessage;
					isSuccess = true;
				}
			}else{
				tipInfo = data.errorMessage;
			}
			if(isSuccess){
				switch(data.action){
					case 'import':
						// 导入
						vueConfig.showType = 'check';
						vueConfig.showText = '导入成功';
						vueConfig.isShowDropdown = false;
						break;
					case 'export':
						// 导出
						vueConfig.showType = 'check';
						vueConfig.showText = '导出成功';
						vueConfig.isShowDropdown = false;
						break;
					case 'cancelImport':
						// 取消导入
					case 'cancelExport':
						// 取消导出
						vueConfig.showType = 'default';
						vueConfig.showText = vueConfig.defaultText;
						vueConfig.dropdownState = 'list';
						vueConfig.isShowDropdown = false;
						break;
				}
			}else{
				vueConfig.showType = 'loading';
				vueConfig.isShowDropdown = false;
				var numStr = taskCompleted * 100 + '%';
				vueConfig.loadingText = numStr;
				vueConfig.loadingStyle = {
					width : numStr,
				};
				switch(data.action){
					case 'import':
						// 导入
						vueConfig.showText = '取消导入';
						break;
					case 'export':
						// 导出
						vueConfig.showText = '取消导出';
						break;
				}
			}
			break;
		case '1024':
			break;
		case '1':
		case '1048576':
		case '128':
		case '16':
		case '2':
		case '2048':
		case '262144':
		case '32':
		case '32768':
		case '4':
		case '4096':
		case '4194304':
		case '512':
		case '65536':
		case '8':
		case '8388608':
		case '9999':
			var showText = '';
			switch(data.action){
				case 'import':
					// 导入
					showText = '导入错误';
					break;
				case 'export':
					// 导出
					showText = '导出错误';
					break;
				case 'cancelImport':
					// 取消导入
					showText = '取消导入错误';
				case 'cancelExport':
					// 取消导出
					showText = '取消导出错误';
					break;
			}
			tipInfo = data.errorMessage;
			vueConfig.showType = 'warn';
			vueConfig.showText = showText;
			vueConfig.dropdownState = 'info';
			vueConfig.infoTitle = tipInfo;
			vueConfig.isShowDropdown = true;
			break;
		default:
			tipInfo = data.msg;
			break;
	}
	if(tipInfo){
		nsAlert(tipInfo);
		console.warn(tipInfo);
	}
}
//实例
return {
	init:init,
	getXML:getXML,
	getFields:getFieldsByState,
	getFieldsByState:getFieldsByState,
	getFieldsByClass:getFieldsByClass,
	ajaxCommon:ajaxCommon,
	formJsonFormat:formJsonFormat,
	partInit:partInit,
	getFieldsByStateArray:getFieldsByStateArray,
	getFuncArrayByFuncNames:getFuncArrayByFuncNames,
	getFuncArrayByXmmapFuncNames:getFuncArrayByXmmapFuncNames,
	getFuncArrayFromDefaultObj:getFuncArrayFromDefaultObj,
	showPageData:showPageData,
	showPageDataByGrid : showPageDataByGrid,
	//getDataSource:getDataSource
	businessBtnManage : businessBtnManage,
	sendPrintInfo:sendPrintInfo,
	acceptImportExportMessage : acceptImportExportMessage,
}
//--------------------------------项目处理组件 end  --------------------------------
})(jQuery)