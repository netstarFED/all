nsComponent = {
	codeMirror:{},//编辑器
};
/**
 * 根据rules自动生成placeholder字符串
 * return string 错误返回false
 **/
nsComponent.getPlaceHolder = function(config){

	//有效值的方式例子：required email max=2 range[2,10]
	//验证是否合法
	if(debugerMode){
		if(typeof(config)=='undefined'){
			console.error(language.common.nscomponent.placeHolder.undefined);
			console.error(config);
		}
		var reqExp = new RegExp('^[a-z0-9-A-Z ^=,\\[\\]]+$');
		if(typeof(config.rules) == 'string'){
			//只能包含大小写字母,数字,空格,[],逗号
			if(!reqExp.test(config.rules)){
				nsAlert('( '+config.rules+' ) '+language.common.nscomponent.placeHolder.configRules+'');
				return false;
			}
		}
	}

	//如果自定义了placeholder则直接返回
	if(typeof(config.placeholder)=="string"){
		return config.placeholder;
	}
	//没有指定规则
	if(typeof(config.rules)=='undefined'){
		//选填返回''
		if(config.type=='select' || config.type=='select2'){
			return language.common.nscomponent.placeHolder.returnSelect;
		}else{
			return '';
		}
	}
	//根据规则生成
	var placeholderStr = "";
	var placeholderArr = $.trim(config.rules).split(' ');
	for(var i=0; i<placeholderArr.length; i++){
		//拆分字符串
		var ruleName = placeholderArr[i];
		var ruleNumber;
		if(ruleName.indexOf('=')>-1){
			//有等于号则是有自定义值的规则
			//一个数 例如max=2
			ruleName = placeholderArr[i].substring(0,placeholderArr[i].indexOf('='));
			ruleNumber = placeholderArr[i].substring(placeholderArr[i].indexOf('=')+1,placeholderArr[i].length);
			if(ruleNumber.indexOf('[')>-1){
				ruleNumber = ruleNumber.substring(ruleNumber.indexOf('[')+1,ruleNumber.indexOf(']'));
				ruleNumber = ruleNumber.split(',');
			}
		}
		if(placeholderStr!=''){
			placeholderStr +=' ';
		}
		switch(ruleName){
			case 'required':
			case 'radio':
			case 'checkbox':
			case 'select':
			case 'select2':
				placeholderStr += language.common.nscomponent.placeHolder.select2;
				break;
			case 'email':
				placeholderStr += 'email';
				break;
			case 'dateISO':
				placeholderStr += language.common.nscomponent.placeHolder.dateISO;
				break;
			case 'date':
				placeholderStr += '';
				break;
			case 'url':
				placeholderStr += language.common.nscomponent.placeHolder.url;
				break;
			case 'number':
				placeholderStr += language.common.nscomponent.placeHolder.number;
				break;
			case 'positiveInteger':
				placeholderStr += language.common.nscomponent.placeHolder.positiveInteger;
			case 'nonnegativeInteger':
				placeholderStr += language.common.nscomponent.placeHolder.nonnegativeInteger; // 非负整数 lyw
				break;
			case 'nonnegative':
				placeholderStr += language.common.nscomponent.placeHolder.nonnegative; // 非负数 lyw
				break;
			case 'integer':
			    placeholderStr += language.common.nscomponent.placeHolder.integer;
			    break;
			case 'ismobile':
			case 'mobile':
				placeholderStr += language.common.nscomponent.placeHolder.ismobile;
				break;
			case 'postcode':
			case 'postalcode':
				placeholderStr += language.common.nscomponent.placeHolder.postalcode;
				break;
			case 'year':
				placeholderStr += language.common.nscomponent.placeHolder.year;
				break;
			case 'month':
				placeholderStr += language.common.nscomponent.placeHolder.month;
				break;
			case 'Icd':
			case 'icd':
				placeholderStr += language.common.nscomponent.placeHolder.icd;
				break;
			case 'bankno':
				placeholderStr += language.common.nscomponent.placeHolder.bankno;
				break;
			case 'minlength':
				placeholderStr += language.common.nscomponent.placeHolder.minlength +ruleNumber+language.common.nscomponent.placeHolder.font;
				break;
			case 'precision':
				placeholderStr += language.common.nscomponent.placeHolder.precision+ruleNumber+language.common.nscomponent.placeHolder.position;
				break;
			case 'maxlength':
				placeholderStr += language.common.nscomponent.placeHolder.maxlength+ruleNumber+language.common.nscomponent.placeHolder.font;
				break;
			case 'min':
				placeholderStr += language.common.nscomponent.placeHolder.min +ruleNumber;
				break;
			case 'max':
				placeholderStr += language.common.nscomponent.placeHolder.max+ruleNumber;
				break;
			case 'range':
				placeholderStr += ruleNumber[0]+language.common.nscomponent.placeHolder.range+ruleNumber[1];
				break;
			case 'uploadSingle':
				placeholderStr += language.common.nscomponent.placeHolder.select2;
				break;
			case 'typeahead':
				placeholderStr += language.common.nscomponent.placeHolder.select2; 
				break;
			case 'typeaheadtemplate':
				placeholderStr += language.common.nscomponent.placeHolder.select2; 
				break;
			case 'selectProvince':
				placeholderStr += language.common.nscomponent.placeHolder.select2;
				break;
			case 'equalTo':
				placeholderStr += '';
				break;
			case 'tablename':
				placeholderStr += language.common.nscomponent.placeHolder.tablename;
				break;
			case 'negative':
				placeholderStr += language.common.nscomponent.placeHolder.negative; //lyw 负数验证
				break;
			case 'rangelength':
				var ruleNumberStar = ruleNumber[0];
				var ruleNumberEnd = ruleNumber[1];
				placeholderStr += language.common.nscomponent.placeHolder.rangelength + ruleNumberStar + '到' + ruleNumberEnd + '之间'; //lyw 长度在 {0} 到 {1} 之间 20181017
				break;
			case 'phone':
			case 'isphone':
				placeholderStr += language.common.nscomponent.placeHolder.isphone; //lyw 长度在 {0} 到 {1} 之间 20181017
				break;
			default:
				//不能识别的规则
				if(nsDebuger.state){
					nsAlert( language.common.nscomponent.placeHolder.unrecognizedRule +ruleName,'warning');
				}
				break;
		}
	}
	return placeholderStr;
}

/**
 * 获取组件的HTML代码片段
 * 包括多个小组件
 * 返回 html
 **/
nsComponent.part = (function($) {
	//先调用此对象
	var config;
	var formJson;
	var classForm = {};
	function init(_config, _formJson, _classForm){
		config = _config;
		formJson = _formJson;
	}
	//获取组件的value null和undefined转为空格
	//返回值是string
	//日期组件默认为今天
	function getValue(){
		//获取组件的value null和undefined转为空格
		//返回值是string
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
				/*if(debugerMode){
					console.warn('value值是个object，已经自动转化为空')
					console.warn(config.value);
				}*/
			}
			//sjj 20181022 针对valueFormat是volist的赋值
			if($.isArray(config.value)){
				var valueArray = [];
				var isVoList = true; // 是否是voList格式
				for(var a=0; a<config.value.length; a++){
					if(typeof(config.value[a][config.valueField])=='undefined'){
						isVoList = false;
						break;
					}
					valueArray.push(config.value[a][config.valueField]);
				}
				if(isVoList){
					returnValue = valueArray;
				}else{
					returnValue = config.value;
				}
			}
		}else if(typeof(config.value)=='number'){
			returnValue = config.value.toString();
		}else if(typeof(config.value)=='string'){
			returnValue = config.value;
		}

		//特殊控件默认值处理
		//如果是日期控件,默认值为今天
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
				break;
		}
		//config.value = returnValue;
		return returnValue;
	}
	
	//获取class和style 
	//返回样式属性 'class="***" style="****"'
	//第二个参数非必填
	function getClassStyle(plusClassStr, plusStyleStr){
		var classStr = plusClassStr;
		if(typeof(config.plusClass)=='string'){
			if(config.plusClassIsWithCol){
				classStr += ' '+ config.plusClass;
			}else{
				classStr = config.plusClass;
			}
			
		}
		if(typeof(plusStyleStr)=='undefined'){
			plusStyleStr = '';
		}
		var styleStr = plusStyleStr;
		if(typeof(config.plusStyle)=='string'){
			styleStr = ' ' + config.plusStyle;
		}
		var classStyleStr = 'class="' + classStr +'"';
		if(styleStr!=' '){
			styleStr = ' style="' + styleStr +'"';
		}
		if(styleStr==' style=""'){
			styleStr = '';
		}
		classStyleStr = classStyleStr + styleStr;
		return classStyleStr;
	}
	function getFormElementLable(){
		var classStr = 'control-label '+ config.type +'-label';
		var label = config.label?config.label:'';
		if(label === ''){
			classStr += ' hidden';
		}
		var heightStr = '';
		var widthStr = '';
		if(typeof(config.height)=='string'){
			if(config.height.indexOf('px')>-1){
				heightStr = 'height: '+config.height+';';
			}else if(config.height.indexOf('%')>-1){
				heightStr = 'height: '+config.height+';';
			}else{
				heightStr = 'height: '+config.height+'px;';
			}
		}else if(typeof(config.height) == 'number'){
			heightStr = 'height: '+config.height+'px;';
		}
		if(typeof(config.width)=='string'){
			if(config.width.indexOf('px')>-1){
				widthStr = 'height: '+config.width+';';
			}else if(config.width.indexOf('%')>-1){
				widthStr = 'width: '+config.width+';';
			}else{
				widthStr = 'width: '+config.width+'px;';
			}
		}else if(typeof(config.width)=='number'){
			widthStr = 'width: '+config.width+'px;';
		}
		var styleStr = 'style="'+widthStr+''+heightStr+'"';
		var html =
			'<label class="grouplable '+classStr+'" for="'+config.fullID+'" '+styleStr+'>'
				+label
			+'</label>';
		return html;
	}
	//获取label的HTML
	function getFormLabel(html){
		var classStr = 'control-label '+ config.type +'-label';
		var label = config.label?config.label:'';
		if(label === ''){
			classStr += ' hidden';
		}else{
			// 功能模式部分展示(允许操作)下 隐藏label
			if(config.formSource == 'staticData'){
				if(config.acts != 'formlabel' && config.acts != 'date-label' && config.acts != 'datetime-label'){
					classStr += ' hidden';
				}else{
					label += ':';
				}
			}
		}
		var span = '';
		var html =
			'<label class="'+classStr+'" for="'+config.fullID+'">'
				+ label
			+'</label>';
		return html;
	}
	function getModalLabel(size){
		var classStr = 'control-label '+ config.type +'-label '+ size;
		var label = config.label?config.label:'';
		if(label == ''){
			classStr += ' hidden';
		}
		var html =
			'<label class="'+classStr+'" for="'+config.fullID+'">'
				+label
			+'</label>';
		return html;
	}
	//获取组件的宽度column
	function getFormColumnSize(){
		var inputSize;
		switch(config.column){
			case 1:
				inputSize = " col-lg-1 col-md-1 col-sm-2 col-xs-6";
				break;
			case 2:
				inputSize = " col-lg-2 col-md-2 col-sm-4 col-xs-6";
				break;
			case 3:
				inputSize = " col-lg-3 col-md-4 col-sm-6 col-xs-12";
				break;
			case 4:
				inputSize = " col-md-4 col-sm-6 col-xs-12";
				break;
			case 6:
				inputSize = " col-sm-6 col-xs-12";
				break;
			case 8:
				inputSize = " col-md-8 col-xs-12";
				break;
			case 9:
				inputSize = " col-md-9 col-xs-12";
				break;
			case 12:
				inputSize = " col-xs-12";
				break;
			case 0:
				inputSize = " col-none";
				break;
			default:
				inputSize = " col-xs-"+config.column;
				break;
		}
		if(config.hidden){
			inputSize += ' hidden'; 
		}
		return inputSize;
	}
	function getModalColumnSize(){
		var configColumn = {};
		var sizeArr = ["col-sm-4","col-sm-8"];
		switch(formJson.size){
			case 's':
				sizeArr = ["col-sm-4","col-sm-8"];
				break;
			case 'm':
				sizeArr = ["col-sm-3","col-sm-9"];
				break;
			default: 
				sizeArr = ["col-sm-2","col-sm-10"];
				break;
		}
		// 表单部分占12
		if(typeof(config.columnClass)=='string'){
			if(config.columnClass=='fullColumn'){
				sizeArr = ["","col-sm-12"];
				configColumn.classStr = config.columnClass;
			}
		}
		configColumn.size = sizeArr;
		configColumn.classStr += config.hidden ? 'hidden' : '';
		return configColumn;
	}
	//input类型的通用属性
	function getDefalutAttr(){
		var readonlyStr = config.readonly? ' readonly="readonly"':'';
		var html = 
			'id="'+config.fullID+'"'
			+ ' nstype="'+config.type+'"'
			+ ' ns-id="'+config.id+'"'
			+ readonlyStr
		return html;
	}
	//input类型的通用外壳HTML
	function getDefalutHtml(html){
		/**sjj20181120 针对更多添加的数据进行添加删除操作***/
		var deleteHtml = '';
		if(config.stateSource == 'more'){
			config.hidden = false;
			deleteHtml = '<div class="form-btn">'
							+ '<button class="btn btn-icon" stateSource="more" relatefield="'+config.id+'">'
								+'<i class="icon-trash-o"></i>'
							+'</button>'
						+'</div>';
		}
		var mindjetFieldPositionAttr = '';
		if(config.mindjetFieldPosition){
			mindjetFieldPositionAttr = 'mindjetFieldPosition='+config.mindjetFieldPosition;
		}
		/**sjj20181120 针对更多添加的数据进行添加删除操作***/
		//withoutContainer是指是否包含容器
		switch(config.formSource){
			case 'form':
				//lyw 添加属性  只有一个时且设置了config.onlyshowone == true 居中显示
				// var checkedContent = config.onlyshowone == true ? 'checkbox-single' : '';
				var checkedContent = config.onlyshowone == true && config.subdata.length ==1 ? 'checkbox-single' : '';
				var classStr = nsComponent.part.getFormColumnSize();
				classStr += ' form-td '+'nscomponent-type-'+config.type+' nscomponent-form';
				var radioClassStr = '';
				if(config.type == 'daterangeRadio'){radioClassStr = 'radio';}
				html = 
					'<div class="form-group">'
						+deleteHtml
						+nsComponent.part.getFormLabel()
						+ '<div class="form-item '+config.type+' '+radioClassStr+' '+checkedContent+' " ns-id="'+config.id+'">'
							+ html
						+ '</div>'
					+ '</div>';
				if(config.withoutContainer){
					//html = html; 如果不要容器，则上面的已经完成
				}else{
					html =
						'<div '+getClassStyle(classStr)+' '+mindjetFieldPositionAttr+'>'
							+html
						+'</div>';
				}
				break;
			case 'modal':
				var classJson = nsComponent.part.getModalColumnSize();
				var classStr = classJson.classStr;
				classStr += ' form-group';
				var sizeArr = classJson.size;
				var labelHtml = nsComponent.part.getModalLabel(sizeArr[0]);
				if(typeof(config.type) == 'string'){
					classStr += ' nscomponent-type-'+config.type + ' nscomponent-modal';
				}
				html = 
					labelHtml+deleteHtml
					+'<div class="'+sizeArr[1]+'">'
						+html
					+'</div>';
				if(config.withoutContainer){
					//html = html; 如果不要容器，则上面的已经完成
				}else{
					html = 
						'<div '+getClassStyle(classStr)+' '+mindjetFieldPositionAttr+'>'
							+html
						+'</div>';
				}
				break;
			case 'table':
				if(config.withoutContainer){
					//html = html; 如果表格模式不要容器，则直接返回
				}else{
					html = '<td ns-td-id="'+config.id+'">'+html+'</td>';
				}
				break;
			case 'halfScreen':
			case 'fullScreen':
			case 'inlineScreen':
			case 'staticData':
				// 功能模式下字段显示类型 field/field-more
				var mindjetFieldPosition = config.mindjetFieldPosition=='field-more'?config.mindjetFieldPosition:'field';
				mindjetFieldPosition = 'mindjetFieldPosition="'+mindjetFieldPosition+'"';

				var classStr = 'form-td';
				if(config.hidden){
					classStr += ' hide';
				}
				// 半屏模式下 form-item 不显示
				var formItemClass = '';
				if(config.formSource == 'halfScreen'){
					formItemClass = 'hidden';
				}
				// 功能/行内模式 判断是否设置标签
				var mobileSign = '';
				if(	
					// 行内模式 显示状态是form在表单中显示（另一种情况是在表单中显示）
					config.formSource=='inlineScreen'||
					// 功能模式 isOper是否操作为是（开始是可以操作的，当查看详细信息时只展示字段和值）
					config.formSource=='staticData'
				){
					mobileSign = typeof(config.mobileSign)=='string' ? config.mobileSign : '';
				}
				// 行内模式的field-more字段在显示状态是form即在表单中显示时有删除按钮 
				var deleteBtn = '';
				if(config.formSource=='inlineScreen' && config.mindjetFieldPosition=='field-more'){
					deleteBtn = '<div class="form-btn">'
									+ '<button class="btn btn-icon">'
									    + '<i class="icon-trash-o"></i>'
									+ '</button>'
								+'</div>'
				}
				html = '<div class="form-group">'
							+ deleteBtn
							+ nsComponent.part.getFormLabel()
							+ '<div class="form-item '+config.type+' '+formItemClass+'" ns-id="'+config.id+'">'
								+ html
							+ '</div>'
						+'</div>'
				var newline = '';
				if(config.newline){
					newline = 'form-td-inline';
				}
				if(config.withoutContainer){
					//html = html; 如果不要容器，则上面的已经完成
				}else{
					html =
						'<div class="'+classStr+' '+mobileSign+' '+newline+'" '+mindjetFieldPosition+'>'
							+html
						+'</div>';
				}
				break;
			default:
				if(debugerMode){
					console.error('getDefalutHtml配置错误 config.formSource is ERROR');
					console.error(config);
				}
				break;
		}
		return html;
	}
	//获取载入代码 用于组件的ajax请求使用
	function getLoadingHtml(){
		var html =  
			'<div class="input-loading">'
				+'<i class="fa fa-circle-o-notch fa-spin fa-fw"></i>'
			+'</div>'
		return html;
	}
	//获取input类型代码
	function getTextInput(){
		var html = nsUI.textInput.getHtml(config);
		html = getDefalutHtml(html);
		return html;
	}
	//textarea
	function getTextareaInput(){
		var heightStr = '';
		if(typeof(config.height) == 'string'){
			if(config.height.indexOf('px')>-1){
				heightStr = 'style="height: '+config.height+';"';
			}else{
				heightStr = 'style="height: '+config.height+'px;"';
			}
		}else if(typeof(config.height) == 'number'){
			heightStr = 'style="height: '+config.height+'px;"';
		}
		var html = '<textarea class="form-control" '
					+getDefalutAttr()
					+' name="'+config.fullID+'"'
					+' id="'+config.fullID+'"'
					+' placeholder="'+config.placeholder+'"'
					+ heightStr
					+' >'
					+getValue()
					+'</textarea>';	
		html = getDefalutHtml(html);
		return html;			
	}
	//text-btn
	function getTextbtnInput(){
		var btnHtml = '';
		if(typeof(config.btns) == 'object'){
			if(!$.isEmptyObject(config.btns)){
				var btnArr = config.btns;
				btnHtml += '<div class="input-group-btn text-btn">';
				for(var btnI = 0; btnI < btnArr.length; btnI ++){
					var disabled = btnArr[btnI].isDisabled?" disabled ":"";
					var btnJson = {};
					btnJson.text = btnArr[btnI].text;
					btnJson.handler = btnArr[btnI].handler;
					btnJson.disabled = disabled;
					var isShowIcon = typeof(btnArr[btnI].isShowIcon) == 'boolean' ? btnArr[btnI].isShowIcon : true;
					var isShowText = typeof(btnArr[btnI].isShowText) == 'boolean' ? btnArr[btnI].isShowText : false;
					btnHtml+= nsButton.getHtml(btnJson,'form',btnI,isShowIcon,isShowText);	
				}
				btnHtml += '</div>';
			}
		}
		var html = '<div class="input-group">'
						+'<input class="form-control" '
						+getDefalutAttr()
						+' name="'+config.fullID +'"'
						+' id="'+config.fullID+'"'
						+' placeholder="'+config.placeholder+'"'
						+' type="text"'
						+' value="'+getValue()+'">'
						+btnHtml
					+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	// transactor lyw 20180926
	function getTransactorHtml(){
		var readonly = config.readonly?" disabled ":"";
		var btnHtml = '<div class="input-group-btn text-btn"><button type="button" '+readonly+' class="btn btn-info btn-icon" data-toggle="tooltip" title="编辑"><i class="fa-edit"></i></button></div>';
		var valueStr = '';
		var idToNameObj = {
			processCreaterFlag:'流程创建者',
			userOfPreviousActivity:'上一环节办理人',
			allDeptFlag:'所有部门',
			deptOfPreviousActivity:'上一环节办理人所在部门',
		}
		function getReadyValueHtml(valObj){
			var textStr = '';
			var valHtml = '';
			for(var attr in valObj){
				switch(attr){
					case 'processCreaterFlag':
					case 'userOfPreviousActivity':
					case 'allDeptFlag':
					case 'deptOfPreviousActivity':
						// 布尔值判断是否
						if(valObj[attr]=='true' || valObj[attr]==true){
							textStr +='<a href="javascript:void(0)" ns-attrname="'+attr+'">'+idToNameObj[attr]+'</a>';
						}
						break;
					case 'userOfOtherActivity':
					case 'role':
					case 'roleName':
					case 'deptOfOtherActivity':
					case 'candidateDept':
					case 'postId':
					case 'postName':
					case 'candidateGroup':
						// 字符串判断内容
						if(valObj[attr]&&!$.isEmptyObject(valObj[attr])){
							var valueField = '';
							var textField = '';
							if(config[valObj.type][attr].valueField){
								valueField = config[valObj.type][attr].valueField;
							}
							if(config[valObj.type][attr].textField){
								textField = config[valObj.type][attr].textField;
							}
							// textStr +='<a href="javascript:void(0)" ns-attrname="'+attr+'" class="">'+valObj[attr]+'</a>';
							textStr +='<a href="javascript:void(0)" ns-attrname="'+attr+'">'
										+'<span ns-userid="'+valObj[attr][valueField]+'">'+valObj[attr][textField]+'</span>'
									+'</a>';
						}
						break;
					case 'candidateUsers':
						// 数组判断选择内容
						if($.isArray(valObj[attr])){
							var spanHtml = ''
							var valueField = '';
							var textField = '';
							var localDataConfig = config[valObj.type].candidateUsers.personAjax.localDataConfig;
							for(var i=0;i<localDataConfig.length;i++){
								if(localDataConfig[i].isID){
									valueField = localDataConfig[i].key;
								}
								if(localDataConfig[i].isName){
									textField = localDataConfig[i].key;
								}
							}
							for(var i=0;i<valObj[attr].length;i++){
								spanHtml += '<span ns-userid="'+valObj[attr][i][valueField]+'">'+valObj[attr][i][textField]+'</span>'
							}
							if(spanHtml.length>0){
								textStr +='<a href="javascript:void(0)" ns-attrname="'+attr+'">'+spanHtml+'</a>';
							}
						}
						break;
				}
			}
			if(textStr.length>0){
				valHtml = '<div class="transactor-span">'
					+'<a href="javascript:void(0)" ns-type="'+valObj.type+'" class="fa fa-close">'
					+'</a>'
					+'<div ns-type="'+valObj.type+'">'
						+textStr
					+'</div>'
				+'</div>'
			}
			return valHtml;
		}
		if($.isArray(config.value)){
			for(var i=0;i<config.value.length;i++){
				valueStr += getReadyValueHtml(config.value[i]);
			}
		}
		var html = '<div class="input-group">'
						+'<div class="form-control" '
						+getDefalutAttr()
						+' name="'+config.fullID +'"'
						+' id="'+config.fullID+'">'
						+valueStr
						+'</div>'
						+btnHtml
					+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//uploadSingle
	function getSingleUpload(){
		var defaultHtml = '';			//默认显示的元素内容
		var valueStr = getValue();		//默认显示值
		//默认显示值的格式必须为数组举例:[{textField:'',valueField:''}]
		if($.isArray(valueStr)){
			var defalutData = valueStr;
			for(var defaultI = 0; defaultI < defalutData.length; defaultI ++){
				var  dropDefaultvalue = defalutData[defaultI][config.textField];
				var dropDefaultId = defalutData[defaultI][config.valueField];
				defaultHtml += '<span class="dropzone-upload-span">'
											+'<a href="javascript:void(0)" id="'+dropDefaultId+'" class="upload-close"></a>'
											+'<a href="javascript:void(0)" id="'+dropDefaultId+'" class="upload-title">'
												+dropDefaultvalue
											+'</a>'
										+'</span>';
			}
		}else{
			defaultHtml = config.placeholder;
		}
		var isReadonlyStr = config.readonly ? 'readonly' : '';
		var html = '<div class="input-group">'
						+'<div id="'+config.fullID+'" class="droppable-area-form dz-clickable form-control" '+isReadonlyStr+' ns-id="'+config.id+'" nstype="'+config.type+'">'
							+defaultHtml
						+'</div>'									
						+'<div class="input-group-addon fa fa-upload" id="'+config.fullID+'-btn">'
							//+'<a href="javascript:void(0);"><i class=""></i></a>'
						+'</div>'
					+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//upload
	function getUpload(){
		var inputHtml = '<div class="row">'
							+'<div class="col-sm-3 text-center">'
								+'<div id="advancedDropzone" class="droppable-area">'
									+language.common.nscomponent.part.inputHtmlFileArea
								+'</div>'
							+'</div>'
							+'<div class="col-sm-9">'
								+'<div class="table-responsive">'
									+'<table class="table table-bordered table-striped table-hover dataTable no-footer table-modal table-singlerow"  nstype="'+config.type+'" id="'+config.fullID+'">'
									+'</table>'
								+'</div>'
							+'</div>'
						+'</div>';
		return inputHtml;
	}
	//tree-select
	function getTreeSelect(){
		var treeCloseBtnID = config.fullID +'-tree-menuBtn';
		var treeNodeId = '';
		var treeValueStr = '';
		var valueStr = getValue();
		if(typeof(valueStr)=='object'){
			treeNodeId = valueStr.value;
			treeValueStr = typeof(valueStr.text) == 'undefined' ? '' : valueStr.text;
		}
		var treeID = config.fullID+'-tree';
		var html = '<input class="form-control" '
				+getDefalutAttr()
				+' name="'+config.fullID +'"'
				+' id="'+config.fullID+'"'
				+' placeholder="'+config.placeholder+'"'
				+' nodeid="'+treeNodeId+'"'
				+' type="text"'
				+' value="'+treeValueStr+'">'
				+'<a id="'+treeCloseBtnID+'" href="javascript:void(0)" class="treeselect-arrow">'
					+'<i class="fa fa-caret-down"></i></a>'
				//+'<ul id="'+treeID+'" class="ztree hide"></ul>';
		html = getDefalutHtml(html);
		return html;
	}
	//input-select
	function getInputselect(){
		//下拉输入框由text文本类型和带有select选择两部分组成
		var valueStr = getValue();
		var isReadonlyStr = config.readonly ? 'readonly' : '';
		var html = '<div class="input-group"><input class="form-control" id="'+config.fullID+'" '+isReadonlyStr+' ns-id="'+config.id+'" name="'+config.fullID+'" nstype="'+config.type+'" value="'+valueStr+'" type="text" />'
					+'<a id="'+config.fullID+'-selectBtn" href="javascript:void(0)" class="input-select-btn input-group-btn" nstype="'+config.type+'" ns-control="'+config.type+'-btn">'
							+'<i class="fa fa-caret-down"></i></a>'
					+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//case 'codeMirror':
	function getHtmlByCodeMirror(){
		var valueStr = getValue();
		var html = '<textarea class="form-control" '
					+getDefalutAttr()
					+' name="'+config.fullID+'"'
					+' id="'+config.fullID+'"'
					+' placeholder="'+config.placeholder+'"'
					+' >'
					+valueStr
					+'</textarea>';	
		/*var html = '<div class="code-mirror">'
						+'<textarea></textarea>'
					'</div>';*/
		return getDefalutHtml(html);
	}
	//getProvinceLinkSelect
	function getProvinceLinkSelect(){
		//省市区三级联动的json数据
		var valueJson = getValue();						//默认值{province:,city:,area:}		
		var proStr = '';								//默认省份
		var cityStr = '';								//默认市区
		var areaStr = '';								//默认区域
		var cityData = provinceInfo[0].sub;				//默认市区数据
		var areaData = cityData[0].sub;					//默认区域数据
		if(typeof(valueJson) == 'object'){
			var defaultConfig = {
				province:'',
				city:'',
				area:''
			};
			nsVals.setDefaultValues(valueJson,defaultConfig);
			proStr = valueJson.province;
			cityStr = valueJson.city;
			areaStr = valueJson.area;
		}else if(typeof(valueJson)=='string'){
			if(valueJson){
				var codeData = provinceSelect.data[valueJson];
				var proJson = {};
				var nameStr = '';
				if(!$.isEmptyObject(codeData.area)){
					proJson = provinceSelect.data[codeData.city.code];
					proJson.area = codeData.area;
					proStr = proJson.pro.name;
					cityStr = proJson.city.name;
					areaStr = proJson.area.name;
				}else if(!$.isEmptyObject(codeData.city)){
					proJson = codeData;
					proStr = proJson.pro.name;
					cityStr = proJson.city.name;
				}else{
					proJson = codeData;
					proStr = proJson.pro.name;
				}
			}
		}
		var isDisabledStr = config.readonly ? 'disabled' : '';//是否禁用
		var emptyHtml = '<option value=""></option>';
		var proSelectHtml = '<select class="form-control" '+isDisabledStr+' nstype="'+config.type+'" data-pro="province" id="'+config.fullID+'-province">'
							+emptyHtml;
		for(var proI = 0; proI < provinceInfo.length; proI ++){
			var currentProvname = provinceInfo[proI].name;
			var currentProval = currentProvname;  //value值等同于text文本值的显示
			if(currentProval ==language.common.nscomponent.part.currentProvalProvince ){
				currentProval = '';
			}
			var isSelected = '';
			//存在默认省份的设置
			if(currentProvname == proStr){
				isSelected = 'selected';
				cityData = provinceInfo[proI].sub;
				areaData = typeof(cityData) =='undefined'?undefined : areaData;
			}
			proSelectHtml += '<option value="'+provinceInfo[proI].code+'" '+isSelected+'>'+currentProvname+'</option>';
		}
		proSelectHtml += '</select>';
		var citySelectHtml = '<select class="form-control" '+isDisabledStr+' nstype="'+config.type+'" data-pro="city" id="'+config.fullID+'-city">'
							+emptyHtml;
		if($.isArray(cityData)){						
				citySelectHtml	+= '<option value="'+cityData[0].code+'">'+cityData[0].name+'</option>';		
			for(var cityI = 0; cityI < cityData.length; cityI ++){
				var currentCityname = cityData[cityI].name;
				var isCitySelected = '';
				if(currentCityname == cityStr){
					isCitySelected = 'selected';
					areaData = cityData[cityI].sub;

				}
				citySelectHtml += '<option value="'+cityData[cityI].code+'" '+isCitySelected+'>'+currentCityname+'</option>';
			}
		}
		citySelectHtml += '</select>';
		var areaSelectHtml = '<select class="form-control" '+isDisabledStr+' nstype="'+config.type+'" data-pro="area" id="'+config.fullID+'-area">'
								+emptyHtml;
		if($.isArray(areaData)){
			areaSelectHtml += '<option value="'+areaData[0].code+'">'+areaData[0].name+'</option>';
			for(var areaI = 0; areaI < areaData.length; areaI ++){
				var currentAreaname = areaData[areaI].name;
				var isAreaSelected = '';
				if(currentAreaname == areaStr){
					isAreaSelected = 'selected';
				}
				areaSelectHtml += '<option value="'+areaData[areaI].code+'" '+isAreaSelected+'>'+currentAreaname+'</option>';
			}
		}
		areaSelectHtml += '</select>';
		//var labelProHtml = '<label class="control-label  provincelink-select-label" for="'+config.fullID+'-province">'+language.common.nscomponent.part.province+'</label>';
		var html = '<div class="provincelinkage">'
						 + proSelectHtml + citySelectHtml + areaSelectHtml
					+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//province-select
	function getProvinceSelect(){
		//省市区三级联动的json数据
		var valueJson = getValue();						//默认值{province:,city:,area:}		
		var proStr = '';								//默认省份
		var cityStr = '';								//默认市区
		var areaStr = '';								//默认区域
		var cityData = provinceInfo[0].sub;				//默认市区数据
		var areaData = cityData[0].sub;					//默认区域数据
		if(typeof(valueJson) == 'object'){
			proStr = typeof(valueJson.province) == 'undefined' ? '' : valueJson.province;
			cityStr = typeof(valueJson.city) == 'undefined' ? '' : valueJson.city;
			areaStr = typeof(valueJson.area) == 'undefined' ? '' : valueJson.area;
		}
		var lableStr = '';
		if(formJson.formSource == 'modal'){
			var classJson = nsComponent.part.getModalColumnSize();
			var sizeArr = classJson.size;
			lableStr = sizeArr[0];
		}
		var isDisabledStr = config.readonly ? 'disabled' : '';
		/***************省份 start*******************/
		var labelProHtml = '<label class="control-label  province-select-label '+lableStr+'" for="'+config.fullID+'-province">'+language.common.nscomponent.part.province+'</label>';
		var selProHtml = '';
		var proSelectHtml = '<select class="form-control" '+isDisabledStr+' nstype="'+config.type+'" data-pro="province" id="'+config.fullID+'-province">'
							+'<option value="'+provinceInfo[0].code+'">'+provinceInfo[0].name+'</option>';
		for(var proI = 0; proI < provinceInfo.length; proI ++){
			var currentProvname = provinceInfo[proI].name;
			var currentProval = currentProvname;  //value值等同于text文本值的显示
			if(currentProval ==language.common.nscomponent.part.currentProvalProvince ){
				currentProval = '';
			}
			var isSelected = '';
			//存在默认省份的设置
			if(currentProvname == proStr){
				isSelected = 'selected';
				cityData = provinceInfo[proI].sub;
				areaData = typeof(cityData) =='undefined'?undefined : areaData;
			}
			proSelectHtml += '<option value="'+provinceInfo[proI].code+'" '+isSelected+'>'+currentProvname+'</option>';
		}
		proSelectHtml += '</select>';
		selProHtml = getDefalutHtml(proSelectHtml);
		/***************省份 end*******************/
		/***************市区 start***************************/
		var labelCityHtml = '<label class="control-label  province-select-label '+lableStr+'" for="'+config.fullID+'-city">'+language.common.nscomponent.part.city+'</label>';
		var citySelectHtml = '<select class="form-control" '+isDisabledStr+' nstype="'+config.type+'" data-pro="city" id="'+config.fullID+'-city">'
		if($.isArray(cityData)){						
				citySelectHtml	+= '<option value="'+cityData[0].code+'">'+cityData[0].name+'</option>';		
			for(var cityI = 0; cityI < cityData.length; cityI ++){
				var currentCityname = cityData[cityI].name;
				var isCitySelected = '';
				if(currentCityname == cityStr){
					isCitySelected = 'selected';
					areaData = cityData[cityI].sub;

				}
				citySelectHtml += '<option value="'+cityData[cityI].code+'" '+isCitySelected+'>'+currentCityname+'</option>';
			}
		}
		citySelectHtml += '</select>';
		var selCityHtml = getDefalutHtml(citySelectHtml);
		/***************市区 end************************************/
		/*************区域 start****************/
		var labelAreaHtml = '<label class="control-label  province-select-label '+lableStr+'" for="'+config.fullID+'-area">'+language.common.nscomponent.part.area+'</label>';
		var selAreaHtml = '';
			var areaSelectHtml = '<select class="form-control" '+isDisabledStr+' nstype="'+config.type+'" data-pro="area" id="'+config.fullID+'-area">';
			if($.isArray(areaData)){
				areaSelectHtml += '<option value="'+areaData[0].code+'">'+areaData[0].name+'</option>';
				for(var areaI = 0; areaI < areaData.length; areaI ++){
					var currentAreaname = areaData[areaI].name;
					var isAreaSelected = '';
					if(currentAreaname == areaStr){
						isAreaSelected = 'selected';
					}
					areaSelectHtml += '<option value="'+areaData[areaI].code+'" '+isAreaSelected+'>'+currentAreaname+'</option>';
				}
			}
			areaSelectHtml += '</select>';
			selAreaHtml = getDefalutHtml(areaSelectHtml);
	
		/**************区域 end*********************/
		var html = selProHtml + selCityHtml + selAreaHtml;
		return html;
	}
	//lyw 2018/04/18
	//baidumap
	function getBaiduMapInput(){
		var valueJson = getValue();						//默认值{province:,city:,area:}		
		var proStr = '';								//默认省份
		var cityStr = '';								//默认市区
		var areaStr = '';								//默认区域
		var cityData = provinceInfo[0].sub;				//默认市区数据
		var areaData = cityData[0].sub;					//默认区域数据
		if(typeof(valueJson) == 'object'){
			proStr = typeof(valueJson.province) == 'undefined' ? '' : valueJson.province;
			cityStr = typeof(valueJson.city) == 'undefined' ? '' : valueJson.city;
			areaStr = typeof(valueJson.area) == 'undefined' ? '' : valueJson.area;
		}
		var disabled = config.readonly ? 'disabled' : '';

		var defaultStr = 'nstype="'+config.type+'" ns-id="'+config.id+'"';
		var visibleValue = {                  //显示的value值
			province:provinceInfo[0].name,
		};
		//显示隐藏
		config.isPointDisplay = typeof(config.isPointDisplay) == "boolean" ? config.isPointDisplay : true;
		config.isAddressDisplay = typeof(config.isAddressDisplay) == "boolean" ? config.isAddressDisplay : true;
		config.isProvinceDisplay = typeof(config.isProvinceDisplay) == "boolean" ? config.isProvinceDisplay : true;
		// 地图按钮
		var btnHtml = '';
		var btnJson = {};
		btnJson.text = '地图';
		btnJson.handler = 'nsComponent.part.clickDisplayDialog("'+config.fullID+'")';
		btnJson.disabled = disabled;
		var isShowIcon = typeof(config.isShowIcon) == 'boolean' ? btnArr[btnI].isShowIcon : true;
		var isShowText = typeof(config.isShowText) == 'boolean' ? btnArr[btnI].isShowText : true;
		btnHtml = '<div class="input-group-btn text-btn">'
				 + nsButton.getHtml(btnJson,'form',0,isShowIcon,isShowText)
				 +'</div>';
		var proSelectHtml = '';  	//省
		var citySelectHtml = ''; 	//市
		var areaSelectHtml = '';	//区/县
		var addressHtml = ''; 		//详细地址
		var longitudeHtml = '';		//经度
		var latitudeHtml = ''; 			//维度
		if(config.isProvinceDisplay){
			//省
			var selProHtml = '';
			proSelectHtml = '<select class="form-control" '+disabled+' nstype="'+config.type+'" data-pro="province" id="'+config.fullID+'-province">'
								+'<option value="'+provinceInfo[0].code+'">'+provinceInfo[0].name+'</option>';
			for(var proI = 0; proI < provinceInfo.length; proI ++){
				var currentProvname = provinceInfo[proI].name;
				var currentProval = currentProvname;  //value值等同于text文本值的显示
				if(currentProval ==language.common.nscomponent.part.currentProvalProvince ){
					currentProval = '';
				}
				var isSelected = '';
				//存在默认省份的设置
				if(currentProvname == proStr){
					visibleValue.province = currentProvname;
					isSelected = 'selected';
					cityData = provinceInfo[proI].sub;
					areaData = typeof(cityData) =='undefined'?undefined : areaData;
				}
				proSelectHtml += '<option value="'+provinceInfo[proI].code+'" '+isSelected+'>'+currentProvname+'</option>';
			}
			proSelectHtml += '</select>';
			//市
			citySelectHtml = '<select class="form-control" '+disabled+' nstype="'+config.type+'" data-pro="city" id="'+config.fullID+'-city">'
			if($.isArray(cityData)){						
					citySelectHtml	+= '<option value="'+cityData[0].code+'">'+cityData[0].name+'</option>';		
				for(var cityI = 0; cityI < cityData.length; cityI ++){
					var currentCityname = cityData[cityI].name;
					var isCitySelected = '';
					if(currentCityname == cityStr){
						visibleValue.city = currentCityname;
						isCitySelected = 'selected';
						areaData = cityData[cityI].sub;

					}
					citySelectHtml += '<option value="'+cityData[cityI].code+'" '+isCitySelected+'>'+currentCityname+'</option>';
				}
			}
			citySelectHtml += '</select>';
			//县
			var selAreaHtml = '';
			areaSelectHtml = '<select class="form-control" '+disabled+' nstype="'+config.type+'" data-pro="area" id="'+config.fullID+'-area">';
			if($.isArray(areaData)){
				areaSelectHtml += '<option value="'+areaData[0].code+'">'+areaData[0].name+'</option>';
				for(var areaI = 0; areaI < areaData.length; areaI ++){
					var currentAreaname = areaData[areaI].name;
					var isAreaSelected = '';
					if(currentAreaname == areaStr){
						visibleValue.area = currentAreaname;
						isAreaSelected = 'selected';
					}
					areaSelectHtml += '<option value="'+areaData[areaI].code+'" '+isAreaSelected+'>'+currentAreaname+'</option>';
				}
			}
			areaSelectHtml += '</select>';
		}
		if(config.isAddressDisplay){
			addressHtml = '<input class="form-control " '
						+defaultStr
						+' name="'+config.fullID +'-address"'
						+' id="'+config.fullID+'-address"'
						+' placeholder="详细地址"'
						+' type="text"'
						+disabled
						+'>';
		}
		if(config.isPointDisplay){
			longitudeHtml = '<input class="form-control " '
						+defaultStr
						+' name="'+config.fullID +'-longitude"'
						+' id="'+config.fullID+'-longitude"'
						+' placeholder="经度"'
						+' type="text"'
						+disabled
						+'>';
			latitudeHtml = '<input class="form-control " '
						+defaultStr
						+' name="'+config.fullID +'-latitude"'
						+' id="'+config.fullID+'-latitude"'
						+' placeholder="纬度"'
						+' type="text"'
						+disabled
						+'>'
		}
		var html = '<div class="input-group">'
				+proSelectHtml+citySelectHtml+areaSelectHtml+addressHtml+longitudeHtml+latitudeHtml+btnHtml
				+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//baidumap组件点击按钮弹出地图
	function clickDisplayDialog(inputId){
		// var valueJson = JSON.parse(valueJsonStr);
		var dialogMap = {
			id: 	config.fullID+"-dialog",
			title: 	"百度地图",
			size: 	"b",
			form:[
				{
					html:'<div id="dialog-map" style="width:768px;height:500px;"></div>'
				}
			],
			shownHandler:function(){
				//找到表单中已有的地址
				var addressStr = '';
				addressStr += $("#"+inputId+"-province").find('option:selected').text();
				addressStr += $("#"+inputId+"-city").find('option:selected').text();
				addressStr += $("#"+inputId+"-area").find('option:selected').text();
				var pointLot = $("#"+inputId+"-longitude").val();
				var pointLat = $("#"+inputId+"-latitude").val();
				// 百度地图API功能
				var map = new BMap.Map("dialog-map");
				var point = new BMap.Point(116.331398,39.897445);
				map.centerAndZoom(point,12);
				// 创建地址解析器
				var myGeocoder = new BMap.Geocoder();
				// 将地址解析结果显示在地图上,并调整地图视野
				if(pointLot!=""&&pointLat!=""){
					map.clearOverlays(); 
					var new_point = new BMap.Point(Number(pointLot),Number(pointLat));
					map.centerAndZoom(new_point, 16);
					var marker = new BMap.Marker(new_point);  // 创建标注
					map.addOverlay(marker);              // 将标注添加到地图中
					map.panTo(new_point); 
				}else{
					myGeocoder.getPoint(addressStr, function(point){
						if (point) {
							map.centerAndZoom(point, 16);
							map.addOverlay(new BMap.Marker(point));
						}else{
							alert("您选择地址没有解析到结果!");
						}
					});
				}
				map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
				map.addEventListener("click", function(event){
					var pointClick = event.point;
					myGeocoder.getLocation(pointClick, function (data) {
						console.log(data)
						var address = data.address;
						// if(data.surroundingPois.length>0){
						// 	address = data.address+data.surroundingPois[0].title;
						// }
						var editJson = {
							province:data.addressComponents.province,
							city:data.addressComponents.city,
							area:data.addressComponents.district,
							address:data.address,
							longitude:data.point.lng,
							latitude:data.point.lat,
						};
						// console.log(editJson);
						provinceSelect.fillValueBaiDuMap(inputId,editJson);
					},event.currentTarget.Yg);
					nsdialog.hide();
				});
			}
		}
		nsdialog.initShow(dialogMap);		
	}
	//scientific-input
	function getScientificinput(){
		var html =	'<input class="form-control" '
					+getDefalutAttr()
					+' name="'+config.fullID +'"'
					+' id="'+config.fullID+'"'
					+' placeholder="'+config.placeholder+'"'
					+' type="text"'
					+' value="'+getValue()+'">'
					+'<label class="scientific-input-msg" ns-control="scientific"></label>';
		html = getDefalutHtml(html);
		return html;
	}
	//power-input
	function getPowerinput(){
		var html =	'<input class="form-control" '
					+getDefalutAttr()
					+' name="'+config.fullID +'"'
					+' id="'+config.fullID+'"'
					+' placeholder="'+config.placeholder+'"'
					+' type="text"'
					+' value="'+getValue()+'">'
					+'<label class="power-input-msg" ns-control="power"></label>';
		html = getDefalutHtml(html);
		return html;
	}
	//model-selector
	function getModelselector(){
		var valueJson = getValue();
		var valueStr = '';
		var idsStr = '';
		if(typeof(valueJson)=='object'){
			if(!$.isEmptyObject(valueJson)){
				//不为空
				valueStr = valueJson.value;
				idsStr = valueJson.id;
			}
		}else{
			valueStr = '';
			idsStr = '';
		}
		var html =	'<input class="form-control" '
					+getDefalutAttr()
					+' name="'+config.fullID +'"'
					+' id="'+config.fullID+'"'
					+' ms-id="'+idsStr+'"'
					+' placeholder="'+config.placeholder+'"'
					+' type="text"'
					+' value="'+valueStr+'">';
		html = getDefalutHtml(html);
		return html;
	}
	//person-select
	function getPersonSelect(){
		var historyHtml = '';
		var isUsedHistory = true;
		var rightNum = 33;
		if(typeof(config.isUsedHistory)=='boolean'){
			if(config.isUsedHistory==false){
				isUsedHistory = false;
				rightNum = 3;
			}
		}
		if(isUsedHistory){
			historyHtml = 
				'<a href="javascript:void(0);" class="person-select-plane-btn" style="right: 3px;" ns-control="historyInfo">'
					+'<i class="fa fa-clock-o"></i>'
				+'</a>';
		}
		var html =	'<input class="form-control" '
					+getDefalutAttr()
					+' name="'+config.fullID +'"'
					+' id="'+config.fullID+'"'
					+' placeholder="'+config.placeholder+'"'
					+' type="text"'
					+' value="'+getValue()+'">'
					+'<a href="javascript:void(0);" class="person-select-plane-btn" style="right: '+(rightNum+30)+'px;" ns-control="personInfo">'
						+'<i class="fa fa-user"></i>'
					+'</a>'
					+'<a href="javascript:void(0);" class="person-select-plane-btn" style="right: '+rightNum+'px;" ns-control="groupInfo">'
						+'<i class="fa fa-sitemap"></i>'
					+'</a>'
					+historyHtml;
		html = getDefalutHtml(html);
		return html;
	}
	//person-select-system
	function getPersonSelectSystem(){
		var rightNum = 33;
		var html =	'<input class="form-control" '
					+getDefalutAttr()
					+' name="'+config.fullID +'"'
					+' id="'+config.fullID+'"'
					+' placeholder="'+config.placeholder+'"'
					+' type="text"'
					+' value="'+getValue()+'">'
					+'<a href="javascript:void(0);" class="person-select-system-plane-btn" style="right: '+(rightNum+30)+'px;" ns-control="personInfo">'
						+'<i class="fa fa-user"></i>'
					+'</a>'
					+'<a href="javascript:void(0);" class="person-select-system-plane-btn" style="right: '+rightNum+'px;" ns-control="groupInfo">'
						+'<i class="fa fa-sitemap"></i>'
					+'</a>';
		html = getDefalutHtml(html);
		return html;
	}
	//隐藏域
	function getHidden(){
		var html = '<input class="hidden" '
				+getDefalutAttr()+' name="'+config.fullID 
				+'" type="hidden" '
				+'value="'+getValue()+'">';
		return html;
	}
	//日期控件
	function getDatePicker(){
		var html = nsUI.dateInput.getHtml(config);
		html = getDefalutHtml(html);
		return html;
	}
	//时间组件
	function getTimePicker(){
		var html = 
				'<div class="input-group">'
					+'<input class="form-control timepicker" '
						+getDefalutAttr()
						+' name="'+config.fullID+'"'
						+' placeholder="'+config.placeholder+'"'
						+' type="text"'
						+' value="'+getValue()+'"'
					+'>'
					/*+'<div class="input-group-addon">'
						+'<a href="javascript:void(0);"><i class="fa-calendar"></i></a>'
					+'</div>'*/
				+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//datetime
	function getDatetimePicker(){
		var html = nsUI.datetimeInput.getHtml(config);
		html = getDefalutHtml(html);
		return html;				
	}
	//daterange
	function getDateRangePicker(){
		var html = '<div class="input-group">'
						+'<input class="form-control input-mini" '
						+getDefalutAttr()
						+' name="'+config.fullID+'"'
						+' placeholder="'+config.placeholder+'"'
						+' type="text"'
						+' value="'+getValue()+'"'
						+'>'
						+'<div class="input-group-addon">'
							+'<a href="javascript:void(0);">'
								+'<i class="fa fa-calendar"></i>'
							+'</a>'
						+'</div>'
					+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//typeahead
	function getTypeahead(){
		var readonlyStr = config.readonly ? 'readonly' : '';
		var html = '<div class="typeahead__container">'
					+'<div class="typeahead__field">'
						+'<span class="typeahead__query '+readonlyStr+'">'
							+'<input class="form-control" '
								+getDefalutAttr()
								+' name="'+config.fullID+'"'
								+' ns-id="'+config.id+'"'
								+' nstype="'+config.type+'"'
								+' placeholder="'+config.placeholder+'"'
								+' type="text"'
								+' autofocus autocomplete="off"'
								+' value="'+getValue()+'"'
							+'>'
						+'</span>'
						+'<span class="typeahead__button">'
							+'<button type="button">'
								+'<span class="typeahead__search-icon"></span>'
							+'</button>'
						+'</span>'
					+'</div>'
				+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//typeaheadtemplate
	function getTypeaheadTemplate(){
		var readonlyStr = config.readonly ? 'readonly' : '';
		var html = '<div class="typeahead__container">'
					+'<div class="typeahead__field">'
						+'<span class="typeahead__query '+readonlyStr+'">'
							+'<input class="form-control" '
								+getDefalutAttr()
								+' name="'+config.fullID+'"'
								+' ns-id="'+config.id+'"'
								+' nstype="'+config.type+'"'
								+' placeholder="'+config.placeholder+'"'
								+' type="text"'
								+' autofocus autocomplete="off"'
								+' value="'+getValue()+'"'
							+'>'
						+'</span>'
						+'<span class="typeahead__button">'
							+'<button type="button">'
								+'<span class="typeahead__search-icon"></span>'
							+'</button>'
						+'</span>'
					+'</div>'
				+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//add-select-input
	function getAddSelectInput(){
		if(typeof(config.hiddenID)=="undefined"){
			config.hiddenID = config.id+'-hidden-'+parseInt(Math.random()*100000+1);
		}
		if(typeof(config.submitIndex)=="number"){
			config.localDataHiddenIDIndex = config.submitIndex;
		}
		var inputHiddenIDName = "form-"+formJson.id+"-"+config.hiddenID;
		config.fullHiddenID = inputHiddenIDName;
		var html ='<div class="input-group">'
						+'<input class="form-control" '
						+getDefalutAttr()
						+' name="'+config.fullID +'"'
						+' id="'+config.fullID+'"'
						+' placeholder="'+config.placeholder+'"'
						+' type="text"'
						+' value="'+getValue()+'">'
						+'<a href="javascript:void(0);" class="input-group-btn add-select-input-btn" ns-control="refresh"><i class="fa fa-refresh"></i></a>'
						+'<a href="javascript:void(0);" class="input-group-btn add-select-input-btn" ns-control="list"><i class="fa fa-list"></i></a>'
						+'<input id="'+inputHiddenIDName+'" name="'+inputHiddenIDName+'" nstype="'+config.type+'-hidden" type="hidden" >'
					+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//organizaSelect
	function getOrganizaSelect(){
		if(typeof(config.hiddenID)=="undefined"){
			config.hiddenID = config.id+'-origanize-hidden-'+parseInt(Math.random()*100000+1);
		}
		var inputHiddenIDName = "form-"+formJson.id+"-"+config.hiddenID;
		config.fullHiddenID = inputHiddenIDName;
		var valueStr = getValue();
		var text = '';
		var tid = '';
		if(typeof(valueStr)=='object'){
			text = valueStr.text;
			tid = valueStr.id;
		}
		var addHtml = '';
		var isShowAdd = typeof(config.isShowAdd) == 'boolean' ? config.isShowAdd : true;
		if(isShowAdd){
			addHtml = '<a href="javascript:void(0);" class="input-group-btn origanize-select-btn" ns-control="add"><i class="fa fa-plus"></i></a>';				
		}
		var html ='<div class="input-group">'
						+'<input class="form-control" '
						+getDefalutAttr()
						+' name="'+config.fullID +'"'
						+' id="'+config.fullID+'"'
						+' placeholder="'+config.placeholder+'"'
						+' type="text"'
						+' value="'+text+'">'
						+'<a href="javascript:void(0);" class="input-group-btn origanize-select-btn" ns-control="search"><i class="fa fa-search"></i></a>'
						+addHtml
						+'<input id="'+inputHiddenIDName+'" value="'+tid+'" name="'+inputHiddenIDName+'" nstype="'+config.type+'-hidden" type="hidden" >'
					+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//下拉框
	function getSelect(){
		// var html = nsUI.selectInput.getHtml(config,formJson);
		// html = getDefalutHtml(html);
		// return html;
		var html = '';
		var loaddingHtml = ''
		var configUrl = config.url;
		config.ajaxLoading = false;
		if(typeof(configUrl) == 'function'){
			configUrl = config.url();
		}
		if(typeof(configUrl)=='string'){
			loaddingHtml = getLoadingHtml();
			//如果config.ajaxLoading是true，则先不执行动作监听
			config.ajaxLoading = true;
			if(config.isInit){
				// 已经初始化
				var formData = nsForm.getFormJSON(formJson.id,false);
				for(var dataAttr in config.formatData){
					// 判断是否有关联参数 false 表示直接传的值不是通过其他字段获得的
					if(config.formatData[dataAttr]){
						// 关联属性赋值
						config.data[dataAttr] = formData[config.formatData[dataAttr]];
						if(config.data[dataAttr]==''){
							delete config.data[dataAttr];
						}
					}
				}
			}else{
				// 未初始化
				// sourceData/formatData 可能在修改在修改弹框时将data查询的参数进行了处理 所以第一次初始化时不是 {this.***} 格式 因为已经进行了赋值
				if(typeof(config.sourceData)=='undefined'){
					config.sourceData = $.extend(true,{},config.data); // 原始的data
				}
				if(typeof(config.formatData)=='undefined'){
					config.formatData = $.extend(true,{},config.data); // 格式化的data
				}
				if(!$.isEmptyObject(config.data)){
					var markRegexp = /\{(.*?)\}/; // 验证data值是否是‘{***}’样式
					// 通过关联字段的id获得关联data属性值
					function getValueByRelFieldId(fieldId){
						var formArr = formJson.form;
						var fieldObj = {};
						// 查询关联字段配置对象
						for(var indexI=0;indexI<formArr.length;indexI++){
							if($.isArray(formArr[indexI])){
								for(var indexJ=0;indexJ<formArr[indexI].length;indexJ++){
									if(formArr[indexI][indexJ].id == fieldId){
										fieldObj = formArr[indexI][indexJ];
									}
								}
							}else{
								if(formArr[indexI].id == fieldId){
									fieldObj = formArr[indexI];
								}
							}
						}
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
					for(var dataAttr in config.data){
						var dataVal = config.data[dataAttr];
						var isHaveRel = markRegexp.test(dataVal); // 是否有关联关系，如果‘{**}’格式则有关联关系
						if(isHaveRel){
							var relField = dataVal.match(markRegexp)[1];
							// 判断是否存在点/‘.’,存在认为关联字段定义正确否则定义错误
							if(relField.indexOf('.')>-1){
								var relFieldArr = relField.split('.');
								var relType = relFieldArr[0];
								var relFieldId = relFieldArr[1];
								config.formatData[dataAttr] = relFieldId;
								switch(relType){
									case 'this':
										// 参数在当前表单数组上
										var dataAttrVal = getValueByRelFieldId(relFieldId);
										if(dataAttrVal===false){
											console.error(config.data[dataAttr]);
											console.error('没有找到该字段对应的关联字段，请检查配置是否正确');
										}else{
											config.data[dataAttr] = dataAttrVal;
											if(config.data[dataAttr]==''){
												delete config.data[dataAttr];
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
							}
						}else{
							if(typeof(config.formatData[dataAttr])=='undefined'){
								config.formatData[dataAttr] = false; // 不是和关联属性是设置为false
							}
						}
					}
				}
			}
			var ajaxData = {
				url:configUrl, //请求的数据链接
				type:config.method,
				data:config.data,
				dataType:'json',
				context:config,
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
						$('#'+config.fullID).append(getSelectOptions(config));
						nsComponent.init.selectBoxIt(config);
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
						console.error(config);
					}
				}
			}
			// lyw 20180815
			if(config.contentType){
				if(config.contentType == 'application/json'){
					ajaxData.contentType = 'application/json';
					ajaxData.data = JSON.stringify(ajaxData.data);
				}
			}
			$.ajax(ajaxData);
		}else{
			//本地模式
			if($.isArray(config.subdata)){
				html += getSelectOptions(config);
			}else{
				if(debugerMode){
					console.error(language.common.nscomponent.part.subdataArray)
					console.error(config);
				}
			}
		}
		html = 
			'<select class="form-control" id="'+config.fullID+'" ns-id="'+config.id+'" nstype="'+config.type+'">'
				+'<option value="">'+config.placeholder+'</option>'
				+html
			+'</select>'
			+loaddingHtml;
		html = getDefalutHtml(html);
		return html;
	}
	//下拉框列表内容
	function getSelectOptions(config){
		var html = '';
		var defaultStr = getValue();
		for(var i=0; i<config.subdata.length; i++){
			valueStr    = config.subdata[i][config.valueField];
			textStr     = config.subdata[i][config.textField];
			if(defaultStr === ''){
				selectStr = config.subdata[i].selected ? 'selected' : ''; 
			}else{
				selectStr = valueStr == defaultStr?'selected':'';
			}
			disabledStr = config.subdata[i].isDisabled?" disabled ":"";
			html += 
				'<option value="'+valueStr+'" '+selectStr+' '+disabledStr+'>'
					+textStr
				+'</option>';
		}
		return html;
	}
	//select2
	function getSelect2(){
		var html = '';
		var loaddingHtml = '';
		var configUrl = config.url;
		if(typeof(configUrl) == 'function'){
			configUrl = config.url();
		}
		if(typeof(configUrl)=='string'){
			loaddingHtml = getLoadingHtml();
			if(config.isServiceMode == false){
				$.ajax({
					url:configUrl, //请求的数据链接
					type:config.method,
					data:config.data,
					context:config,
					dataType:'json',
					success:function(data){
						config = this;
						var subdata;
						if(typeof(config.dataSrc)!='string'){
							subdata = data;
						}else{
							subdata = data[config.dataSrc];
						}
						// lyw 20180628
						if(!$.isArray(subdata)){
							subdata = [];
						}
						config.subdata = subdata;
						$('#'+config.fullID).parent().children('.input-loading').remove();
						$('#'+config.fullID).append(getSelect2Options(config));
						nsComponent.init.select2BoxIt(config.fullID);
					},
					error: function (error) {
						nsalert(language.common.nscomponent.part.selectajaxErrorB,'error');
						if(debugerMode){
							console.log(error);
							console.error(config);
						}
					}
				});
			}
		}else{
			//本地模式
			if($.isArray(config.subdata)){
				html += getSelect2Options(config);
			}else{
				if(debugerMode){
					console.error(language.common.nscomponent.part.subdataArray)
					console.error(config);
				}
			}
		}
		var isMultiStr = config.multiple ? 'multiple' : '';
		var value = getValue();
		html = 
			'<select class="form-control" id="'+config.fullID+'" ns-id="'+config.id+'" nstype="'+config.type+'" '+isMultiStr+'>'
				+'<option value="">'+config.placeholder+'</option>'
				+html
			+'</select>'
			+loaddingHtml;
		if(config.isServiceMode){
			var optionHtml = '<option value="">'+config.placeholder+'</option>';
			if(value){
				optionHtml = '<option value="'+value[config.valueField]+'">'+value[config.textField]+'</option>';
			}
			html = '<select class="form-control" id="'+config.fullID+'" ns-id="'+config.id+'" nstype="'+config.type+'" '+isMultiStr+'>'
					+optionHtml
				+'</select>';
		}
		html = getDefalutHtml(html);
		return html;
	}
	function getSelect2Options(config){
		var html = '';
		if(typeof(config.optlabel) == 'string' && typeof(config.optchildren) == 'string'){
			//分组
			for(var i=0; i<config.subdata.length;i++){
				var optlabelStr = config.subdata[i][config.optlabel];
				var groupArr = config.subdata[i][config.optchildren];
				html += '<optgroup label="'+optlabelStr+'">';
				for(var g=0; g<groupArr.length; g++){
					var valueStr = groupArr[g][config.valueField];
					var textStr = groupArr[g][config.textField];
					var selectStr = groupArr[g].selected ? 'selected' : '';
					var disabledStr = groupArr[g].isDisabled ? 'disabled' : '';
					html += '<option value="'+valueStr+'" '+selectStr+' '+disabledStr+'>'
						+textStr
					+'</option>';
				}
				html += '</optgroup>';
			}
		}else{	
			var defaultStr = getValue();
			if(typeof(defaultStr) == 'string'){
				if(defaultStr.indexOf(',') > -1){
					defaultStr = defaultStr.split(',');
				}
			}
			for(var i=0; i<config.subdata.length; i++){
				valueStr = config.subdata[i][config.valueField];
				textStr = config.subdata[i][config.textField];
				var selectStr = '';
				if(defaultStr === ''){
					selectStr = config.subdata[i].selected ? 'selected' : ''; 
				}else{
					if(typeof(defaultStr) == 'string'){
						selectStr = valueStr == defaultStr?'selected':'';
					}else if(typeof(defaultStr)=='number'){
						selectStr = valueStr == defaultStr?'selected':'';
					}else{
						var nIndex = [];
						if($.isArray(defaultStr)){
							for(var j=0; j<defaultStr.length; j++){
								if(defaultStr[j] === valueStr){
									selectStr = 'selected';
								}
							}
						}
					}
				}
				disabledStr = config.subdata[i].isDisabled?"disabled":"";
				html += '<option value="'+valueStr+'" '+selectStr+' '+disabledStr+'>'
						+textStr
					+'</option>';
			}
		}
		return html;
	}
	//radio
	function getRadio(){
		var html = '';
		html = nsUI.radioInput.getHtml(config, formJson);
		html = getDefalutHtml(html);
		return html;
	}
	//日期区间radio
	function getDaterangeRadio(){
		var html = nsUI.daterangeRadioInput.getHtml(config, formJson);
		html = getDefalutHtml(html);
		return html;
	}
	//attachCheckBox 附加勾选20180820
	function getattachCheckBox(){
		return '';
		/*var disabledAttr = config.disabled ? 'disabled' : '';
		var checkedAttr = config.checked ? 'checked' : '';
		var html = '<label class="checkbox-inline '+disabledAttr+' '+checkedAttr+'" for="'+ config.fullID+'">'
					+'</label>'
					+'<input id="'+ config.fullID+'"'
						+'name="'+config.fullID+'"'
						+' ns-id="'+config.id+'"'
						+' nstype="'+config.type+'" type="checkbox" '
						+checkedAttr+' '+disabledAttr+'  class="checkbox-options">';
		html = getDefalutHtml(html);	
		return html;*/
	}
	//项目选择器
	function getProvinceSelectHtml(){
		var html = '<div class="project-select-input" id="'+config.fullID+'"></div>';
		html = getDefalutHtml(html);
		return html;
	}
	//checkbox
	function getCheckbox(){
		var html = '';
		html = nsUI.checkboxInput.getHtml(config, formJson);
		html = getDefalutHtml(html);
		return html;
	}
	function converSelectOption(inputConfig){
		var selectOptionHtml = '';
		var selectData = [];
		if(inputConfig.subdata){
			selectData = inputConfig.subdata;
		}else{
			var type = inputConfig.action ? inputConfig.action :'POST';
			$.ajax({
				url:inputConfig.url,
				data:inputConfig.data,
				type:type,
				dataType:'json',
				async:false,
				success:function(result){
					selectData = result;
				}
			});
		}
		for(var selectI=0; selectI<selectData.length; selectI++){
			var valueField = inputConfig.valueField ? inputConfig.valueField : 'value';
			var textField = inputConfig.textField ? inputConfig.textField : 'text';
			var isSelected = '';
			if(inputConfig.value){
				isSelected = selectData[selectI][valueField] == inputConfig.value ?"selected":"";
			}else{
				isSelected = selectData[selectI].selected ?"selected":"";
			}
			selectOptionHtml += '<option value="'+selectData[selectI][valueField]+'" '+isSelected+'>'+selectData[selectI][textField]+'</option>';
		}
		return selectOptionHtml;
	}
	function getTextselect(){
		//文本下拉框组件
		var inputConfig = config;
		var selectOptionHtml = converSelectHtml(inputConfig.select);
		var substrLength = config.fullID.length - config.id.length;
		var formID = config.fullID.substring(0,substrLength);
		var selectID = formID+inputConfig.select.id;
		var isSelectDiabled = inputConfig.select.disabled ? 'disabled' : '';
		var selectDefaultOptionHtml = '<option value=""></option>';
		var selectHtml = '<select id="'+selectID+'" name="'+selectID+'" class="form-control" nstype="'+inputConfig.type+'-select" '+isSelectDiabled+'>'
						+selectDefaultOptionHtml
						+selectOptionHtml
					+'</select>';
		var inputID = formID+inputConfig.text.id;
		var inputPlaceHolder = '';
		var inputDefault = inputConfig.text.value ? inputConfig.text.value : '';
		var readonlyStr = inputConfig.text.readonly ? 'readonly="readonly"' :'';
		var inputHtml = '<input type="text" id="'+inputID+'" name="'+inputID+'" value="'+inputDefault+'" class="form-control" nstype="'+inputConfig.type+'-text" placeholder="'+inputPlaceHolder+'" '+readonlyStr+' />';
		var operationHtml = '';
		if(inputConfig.button){
			var buttonArr = inputConfig.button;
			for(var buttonI = 0; buttonI < buttonArr.length; buttonI ++){
				var btnJson = {};
				btnJson.text = buttonArr[buttonI].text;
				btnJson.handler = buttonArr[buttonI].handler;
				operationHtml += nsButton.getHtml(btnJson,'form',buttonI,true,false);	
			}
			operationHtml = '<div class="btn-group" nstype="'+inputConfig.type+'-button">'
							+operationHtml
							+'</div>';
		}
		var hiddenTextHtml = '<input type="hidden" id="'+config.fullID+'" name="'+config.fullID+'" value="'+valueStr+'" />';
		
		var html = hiddenTextHtml+inputHtml+selectHtml+operationHtml;
		html = getDefalutHtml(html);
		return inputHtml;
	}
	function getSelecttext(){
		//下拉框文本组件
		var inputConfig = config;
		if(inputConfig.value){
			//把config.value转换成特有格式的.text.value和Select.value
			if(typeof(inputConfig.text.value)=='undefined'){
				inputConfig.text.value = inputConfig.value.text;
			}else if(inputConfig.text.value == ''){
				inputConfig.text.value = inputConfig.value.text;
			}
			if(typeof(inputConfig.select.value)=='undefined'){
				inputConfig.select.value = inputConfig.value.select;
			}else if(inputConfig.select.value == ''){
				inputConfig.select.value = inputConfig.value.select;
			}
		}
		var selectOptionHtml = converSelectHtml(inputConfig.select);
		var substrLength = config.fullID.length - config.id.length;
		var formID = config.fullID.substring(0,substrLength);
		var selectID = formID+inputConfig.select.id;
		var isSelectDiabled = inputConfig.select.disabled ? 'disabled' : '';
		var selectPlaceHolder = '';
		var selectDefaultOptionHtml = '<option value="">'+selectPlaceHolder+'</option>';
		var selectHtml = '<select id="'+selectID+'" name="'+selectID+'" class="form-control" nstype="'+inputConfig.type+'-select" '+isSelectDiabled+'>'
						+selectDefaultOptionHtml
						+selectOptionHtml
					+'</select>';
		var inputID = formID+inputConfig.text.id;
		var inputPlaceHolder = '';
		var inputDefault = inputConfig.text.value ? inputConfig.text.value : '';
		var readonlyStr = inputConfig.text.readonly ? 'readonly="readonly"' :'';
		var inputHtml = '<input type="text" id="'+inputID+'" name="'+inputID+'" value="'+inputDefault+'" class="form-control" nstype="'+inputConfig.type+'-text" placeholder="'+inputPlaceHolder+'" '+readonlyStr+' />';
		var operationHtml = '';
		if(inputConfig.button){
			var buttonArr = inputConfig.button;
			for(var buttonI = 0; buttonI < buttonArr.length; buttonI ++){
				var btnJson = {};
				btnJson.text = buttonArr[buttonI].text;
				btnJson.handler = buttonArr[buttonI].handler;
				operationHtml += nsButton.getHtml(btnJson,'form',buttonI,true,false);	
			}
			operationHtml = '<div class="btn-group" commonplane="moreSelectPlane" nstype="'+inputConfig.type+'-button">'
							+operationHtml
							+'</div>';
		}
		var hiddenTextHtml = '<input type="hidden" id="'+config.fullID+'" name="'+config.fullID+'" value="'+getValue()+'" />';
	
		inputHtml = hiddenTextHtml+selectHtml+inputHtml+operationHtml;
		inputHtml = getDefalutHtml(inputHtml);

		/*inputHtml = '<div class="form-td '+getFormColumnSize()+'">'
						+'<div class="form-group">'
							+'<label class="control-label '+inputConfig.type+'-label">'+config.label+'</label>'
							+'<div class="form-item selectplane '+inputConfig.type+'" ns-id="'+inputConfig.id+'">'
								+hiddenTextHtml
								+selectHtml
								+inputHtml
								+operationHtml
							+'</div>'
						+'</div>'
					+'</div>';*/
		return inputHtml;
	}
	function getSelectdate(){
		//下拉框日期组件
		var inputConfig = config;
		//把config.value转换成特有格式的.date.value和Select.value
		if(inputConfig.value){
			inputConfig.date.value = inputConfig.value.date;
			inputConfig.caseSelect.value = inputConfig.value.select;
			inputConfig.text.value = inputConfig.value.text;
			inputConfig.daterange.value = inputConfig.value.daterange;
		}

		var substrLength = config.fullID.length - config.id.length;
		var formID = config.fullID.substring(0,substrLength);
		//下拉列表
		var caseSelectID =	formID+inputConfig.caseSelect.id;
		var isSelectDiabled = inputConfig.caseSelect.disabled ? 'disabled' : '';
		var caseOptionHtml = converSelectHtml(inputConfig.caseSelect);
		var casePlaceHolder = '';
		var caseDefaultOptionHtml = '<option value="">'+casePlaceHolder+'</option>';
		var caseSelectHtml = 
			'<select id="'+caseSelectID+'" name="'+caseSelectID+'" class="form-control" nstype="'+inputConfig.type+'-caseSelect" ns-id="'+inputConfig.id+'" '+isSelectDiabled+'>'
				+caseDefaultOptionHtml
				+caseOptionHtml
			+'</select>';

		//文本框

		var textInputID = formID+inputConfig.text.id;
		var textValue = inputConfig.text.value ? inputConfig.text.value :'';
		var readonlyStr = inputConfig.text.readonly ? 'readonly="readonly"' :'';
		var textPlaceholder = '';
		var textHidden = inputConfig.text.hidden ? 'hide':'';
		var textHtml = '<input type="text" id="'+textInputID+'" name="'+textInputID+'" class="form-control '+textHidden+'" value="'+textValue+'" placeholder="'+textPlaceholder+'" '+readonlyStr+' nstype="'+inputConfig.type+'-text" />';
		//日期框
		var dateID = formID+inputConfig.date.id;
		var dateValue = inputConfig.date.value ? inputConfig.date.value :'';
		var dateReadonly = inputConfig.date.readonly ? 'readonly="readonly"':'';
		var dateHidden = inputConfig.date.hidden ? 'hide':'';
		var dateHtml = '<input type="text" id="'+dateID+'" name="'+dateID+'" class="form-control datepicker '+dateHidden+'" readonly value="'+dateValue+'" '+dateReadonly+' nstype="'+inputConfig.type+'-date"  />'
		//dateHtml = dateHtml+'<i class="fa-calendar"></i>';
		//日期区间
		inputConfig.daterange.fullID = formID+inputConfig.daterange.id;
		if(typeof(inputConfig.daterange.value)=='object'){
			inputConfig.daterange.startDate = inputConfig.daterange.value.startDate;
			inputConfig.daterange.endDate = inputConfig.daterange.value.endDate;
		}
		var dateRangeID = inputConfig.daterange.fullID;
		var daterangeStart = inputConfig.daterange.startDate ? inputConfig.daterange.startDate :'';
		var daterangeEnd = inputConfig.daterange.endDate ? inputConfig.daterange.endDate :'';
		var daterangevalue = '';
		if(daterangeStart){
			daterangevalue = daterangeStart + language.common.nscomponent.part.daterangeStart +daterangeEnd;
		}
		var daterangeHidden = inputConfig.daterange.hidden ? 'hide':'';
		//var daterangeHtml = '<input type="text" id="'+dateRangeID+'" name="'+dateRangeID+'" class="form-control daterangepicker '+daterangeHidden+'" readonly value="'+daterangevalue+'" nstype="'+inputConfig.type+'-daterange" />'; 
		/*var daterangeHtml = '<div class="form-control daterange daterange-inline add-ranges '+daterangeHidden+'" id="'+dateRangeID+'" nstype="'+inputConfig.type+'-daterange">'
							+'<i class="fa-calendar"></i>'
							+'<span>'+daterangevalue+'</span>'
						+'</div>';*/
		var daterangeHtml = '<input type="text" value="'+daterangevalue+'" class="form-control daterange daterange-inline add-ranges '+daterangeHidden+'" id="'+dateRangeID+'" nstype="'+inputConfig.type+'-daterange">'
							//+'<i class="fa-calendar"></i>'
							//+'<span>'+daterangevalue+'</span>';
		var valueStr = getValue();
		var hiddenTextHtml = '<input type="hidden" id="'+inputConfig.fullID+'" name="'+inputConfig.fullID+'" value="'+valueStr+'" />';
		//按钮代码
		var operationHtml = '';
		if(inputConfig.button){
			var buttonArr = inputConfig.button;
			for(var buttonI = 0; buttonI < buttonArr.length; buttonI ++){
				var btnJson = {};
				btnJson.text = buttonArr[buttonI].text;
				btnJson.handler = buttonArr[buttonI].handler;
				operationHtml += nsButton.getHtml(btnJson,'form',buttonI,true,false);	
			}
			operationHtml = '<div class="btn-group" commonplane="moreSelectPlane" nstype="'+inputConfig.type+'-button" ns-id="'+inputConfig.id+'">'
							+operationHtml
							+'</div>';
		}
		//整体拼接
		inputHtml = hiddenTextHtml+caseSelectHtml+textHtml+dateHtml+daterangeHtml+operationHtml;
		inputHtml = getDefalutHtml(inputHtml);

		/*inputHtml = '<div class="form-td '+getFormColumnSize()+'">'
						+'<div class="form-group">'
							+'<label class="control-label '+inputConfig.type+'-label">'+config.label+'</label>'
							+'<div class="form-item selectplane '+inputConfig.type+'" ns-id="'+inputConfig.id+'">'
								+hiddenTextHtml
								+caseSelectHtml
								+textHtml
								+dateHtml
								+daterangeHtml
								+operationHtml
							+'</div>'
						+'</div>'
					+'</div>';*/
		return inputHtml;
	}
	function converSelectHtml(inputConfig){
		var selectData;
		if(inputConfig.url){
			$.ajax({
				url:inputConfig.url, //请求的数据链接
				type:inputConfig.action,
				data:inputConfig.data,
				async:false,
				success:function(rec){
					selectData = rec;
				},
				error: function () {
					nsalert(language.common.nscomponent.part.converSelect,'warning');
				}
			});
		}else{
			selectData = inputConfig.subdata;
		}
		var selectOptionHtml = '';
		for(var selectI=0; selectI<selectData.length; selectI++){
			var valueField = inputConfig.valueField ? inputConfig.valueField : 'value';
			var textField = inputConfig.textField ? inputConfig.textField : 'text';
			var isSelected = '';
			if(inputConfig.value!==''){
				isSelected = selectData[selectI][valueField] == inputConfig.value ?"selected":"";
			}else{
				isSelected = selectData[selectI].selected ?"selected":"";
			}
			selectOptionHtml += '<option value="'+selectData[selectI][valueField]+'" '+isSelected+'>'+selectData[selectI][textField]+'</option>';
		}
		return selectOptionHtml;
	}
	function getSelectselect(){
		var inputConfig = config;
		if(inputConfig.value){
			//把config.value转换成特有格式的text.value和select.value
			if(typeof(inputConfig.firstSelect.value)=='undefined'){
				inputConfig.firstSelect.value = inputConfig.value.firstSelect;
			}else if(inputConfig.firstSelect.value == ''){
				inputConfig.firstSelect.value = inputConfig.value.firstSelect;
			}
			if(typeof(inputConfig.secondSelect.value)=='undefined'){
				inputConfig.secondSelect.value = inputConfig.value.secondStr;
			}else if(inputConfig.secondSelect.value == ''){
				inputConfig.secondSelect.value = inputConfig.value.secondStr;
			}
		}
		//隐藏text
		var hiddenTextHtml = '<input type="hidden" id="'+inputConfig.fullID+'" name="'+inputConfig.fullID+'" value="'+inputConfig.id+'" />';
		//下拉框下拉框组件
		var firstSelectOptionHtml = converSelectHtml(inputConfig.firstSelect);
		var substrLength = config.fullID.length - config.id.length;
		var formID = config.fullID.substring(0,substrLength);
		var selectID = formID+inputConfig.firstSelect.id;
		var isSelectDiabled = inputConfig.firstSelect.disabled ? 'disabled' : '';
		var firstPlaceHolder = '';
		var firstDefaultOptionHtml = '<option value="">'+firstPlaceHolder+'</option>';
		var firstSelectHtml = '<select id="'+selectID+'" name="'+selectID+'" class="form-control" nstype="'+inputConfig.type+'-firstSelect" '+isSelectDiabled+'>'
						+firstDefaultOptionHtml
						+firstSelectOptionHtml
					+'</select>';
		
		var secondSelectOptionHtml = converSelectHtml(inputConfig.secondSelect);
		var secondID = formID+inputConfig.secondSelect.id;
		var secondDisabled = inputConfig.secondSelect.disabled ? 'disabled':'';
		var secondPlaceHolder = '';
		var secondDefaultOptionHtml = '<option value="">'+secondPlaceHolder+'</option>';
		var secondSelectHtml = '<select id="'+secondID+'" name="'+secondID+'" class="form-control" nstype="'+inputConfig.type+'-secondSelect" '+secondDisabled+'>'
								+secondDefaultOptionHtml
								+secondSelectOptionHtml
							+'</select>';
		var operationHtml = '';
		if(inputConfig.button){
			var buttonArr = inputConfig.button;
			for(var buttonI = 0; buttonI < buttonArr.length; buttonI ++){
				var btnJson = {};
				btnJson.text = buttonArr[buttonI].text;
				btnJson.handler = buttonArr[buttonI].handler;
				operationHtml += nsButton.getHtml(btnJson,'form',buttonI,true,false);	
			}
			operationHtml = '<div class="btn-group" commonplane="moreSelectPlane" nstype="'+inputConfig.type+'-button">'
							+operationHtml
							+'</div>';
		}
		inputHtml = hiddenTextHtml+firstSelectHtml+secondSelectHtml+operationHtml;
		inputHtml = getDefalutHtml(inputHtml);

		/*inputHtml = '<div class="form-td '+getFormColumnSize()+'">'
						+'<div class="form-group">'
							+'<label class="control-label '+inputConfig.type+'-label">'+config.label+'</label>'
							+'<div class="form-item selectplane '+inputConfig.type+'" ns-id="'+inputConfig.id+'">'
							+hiddenTextHtml
							+firstSelectHtml
							+secondSelectHtml
							+operationHtml
							+'</div>'
						+'</div>'
					+'</div>';*/
		return inputHtml;
	}
	function getTable(){
		var inputHtml = '<div class="row"><div class="col-xs-12">'
							+'<div class="table-responsive">'
								+'<table class="table table-bordered table-striped table-hover dataTable no-footer table-modal table-singlerow" nstype="'+config.type+'" id="'+config.id+'">'
								+'</table>'
							+'</div>'
						+'</div></div>';
		return inputHtml;
	}
	//富文本编辑器，基本就是一个空容器
	function getUEditor(){
		if(typeof(config.value)!='string'){
			config.value = '';
		}
		var html = '<script type="text/plain"'
				+getDefalutAttr()
				+' id="'+config.fullID+'"'
				+' name="'+config.fullID+'"'
				+'>'
				+config.value
				+'</script>';
		html = getDefalutHtml(html);
		return html;
	}
	//颜色选择器
	function getColorPicker(){
		var html = '';
		var valueStr = typeof(config.value)=='string'?config.value:'';
		if(valueStr.length>0){
			valueStr = 'style="background-color:'+valueStr+'"';
		}
		var html = '<div class="input-group">'
						+'<input class="form-control" '
						+getDefalutAttr()
						+' name="'+config.fullID +'"'
						+' id="'+config.fullID+'"'
						+' placeholder="'+config.placeholder+'"'
						+' type="text"'
						+' value="'+getValue()+'">'
						+'<div class="input-group-addon">'
							+'<i class="color-preview"'+valueStr+'></i>'
						+'</div>'
					+'</div>';
		html = getDefalutHtml(html);
		return html;
	}
	//图片上传
	function getUploadImage(){
		//upload-image-click
		var classStr = nsComponent.part.getFormColumnSize();
		classStr += ' form-td upload-area';
		var value = getValue();
		var imageHtml = '';
		if(!$.isEmptyObject(value)){
			imageHtml = '<div class="upload-image-box">'
							+'<img src="'+value[config.textField]+'" alt="图片" id="'+config.fullID+'-image" ns-id="'+value[config.valueField]+'" /><i class="fa fa-close"></i>';
						+'</div>'
		}else{
			imageHtml = '<label class="upload-image-intro">'+config.label+'</label>'
						+'<div class="upload-image-box">'
					 		+ '<img alt="图片" id="'+config.fullID+'-image" class="hide" /><i class="fa fa-close hide"></i>'
					 	+'</div>'
		}
		var readonly = config.readonly ? 'readonly' : '';
		var html = '<div id="'+config.fullID+'" class="upload-image upload-image-user '+readonly+'">'
						+'<div ns-imgId="'+config.fullID+'" class="upload-image-show" ns-id="'+config.id+'">'
						+imageHtml
						+'</div>'
					+'</div>';
		html ='<div '+getClassStyle(classStr)+'>'
					+html
				+'</div>';
		return html;
	}
	//图片上传以及调用摄像头
	function getPhotoImageHtml(){
		var value = getValue();
		var imageHtml = '';
		if(!$.isEmptyObject(value)){
			var picUrl = value[config.textField] ? value[config.textField] : '';
			var picClassStr = picUrl ? '' : 'hide';
			imageHtml = '<div class="user-photo-img">'
							+'<img src="'+picUrl+'" alt="图片" id="'+config.fullID+'-image" class="'+picClassStr+'" ns-id="'+value[config.valueField]+'" />'
						+'</div>';
		}
		var html = '<div class="user-photo">'
						+'<div class="upload-control">'
							+'<div class="user-photo-upload" id="'+config.fullID+'-upload"></div>'
							+'<button class="user-photo-import" type="button" id="'+config.fullID+'-exportbtn">'
								+'<i class="fa-image"></i>导入照片</button>'
						+'</div>'
						+imageHtml
					+'</div>';
		return getDefalutHtml(html);
	}
	function getGraphicsInput(){
		var html = '<div class="input-group graphics-rating">'
						+'<input class="form-control graphics-input hidden" '
						+getDefalutAttr()
						+' name="'+config.fullID +'"'
						+' id="'+config.fullID+'"'
						+' placeholder="'+config.placeholder+'"'
						+' type="text"'
						+' value="'+getValue()+'">'
					+'</div>';
		return getDefalutHtml(html);
	}
	//文件断点上传
	function getWebUploadHtml(){

		var inputHtml = 	
							'<div class="row">'
							+'<div class="col-sm-3">'
								// +'<input type="hidden" id="uploadifyFilePath" value="${filePath }" />'
								+'<div class="webupload webupload-start">'
									+'<div id="uploader">'
									+	'<div class="statusBar" style="display:none;">'
									+		'<div class="progres-box">'
									+		 	'<div class="progress" id="jindutiao">'
									+				'<span class="percent">0%</span>'
									+				'<span class="percentage"></span>'
									+			'</div>'
									+		'</div>'
									+		'<div class="info"></div>'
									+	'</div>'
									+	'<div class="queueList">'
									+		'<div id="dndArea" class="placeholder">'
									+			'<div id="filePicker"></div>'
									+		'</div>'
									+	'</div>'
									+	'<button class="btn btn-default uploadBtn">开始上传</button>'
									+'</div>'
									+'<div id="picker" class="form-control-focus">选择文件</div>'
								+'</div>'
							+'</div>'
							+'<div class="col-sm-9">'
								+'<div class="table-responsive">'
									+'<table class="table table-bordered table-striped table-hover dataTable no-footer table-modal table-singlerow"  nstype="'+config.type+'" id="'+config.fullID+'">'
									+'</table>'
								+'</div>'
							+'</div>'
						+'</div>';
		return inputHtml;
	}
	// 数字区间组件
	function getNumRangeHtml(){
		/*nsUI.valuesInput.setConfig(config, formJson);
		console.log(config)*/
		var html = 			'<div class="form-group">'
					+			'<label name="minNum" for="'+ config.formSource + "-" + config.formID +'-minNum">'
					+				'<input class="form-control" id="'+ config.formSource + "-" + config.formID +'-minNum" ></input>'
					+			'</label>'
					+		'</div>'
					+		'<div class="form-group">'
					+			'<label name="maxNum" for="'+ config.formSource + "-" + config.formID +'-maxNum">'
					+				'<span>-</span>'
					+				'<input class="form-control" id="'+ config.formSource + "-" + config.formID +'-maxNum"></input>'
					+			'</label>'
					+		'</div>'
		return getDefalutHtml(html);
	}
	// 规则内容组件
	function getExpressionHtml(){
		var html = '<div id="itemExpContent">'
						+'<span class="exp-title">规则内容</span>'
						+'<input type="hidden">'
						+'<div class="form-control" id="expContent" contenteditable="true" style="position:relative;">'
						+'</div>'
						+'</input>'
						+'<span class="exp-title" id="assistBtn">功能按钮</span>'
					+'</div>';
		return html;
	}
	//multiselect
	function getMultiselectHtml(){
		var containerID = 'multi-select-'+config.id;
		return '<div class="col-sm-12" id="'+containerID+'"></div>';
	}
	//多值输入组件 cy 20180823
	function getValuesInputHtml(){
		//多值输入组件需要对config和formJson都进行一定的属性配置 并对关联字段就行标识
		nsUI.valuesInput.setConfig(config, formJson);
		//根据修改的config输出
		var errorCls = config.isError?' error':'';
		var cls = 'form-control'+' '+config.type+errorCls;
		var html = '<input class="'+cls+'" '
				+getDefalutAttr()
				+' name="'+config.fullID +'"'
				+' id="'+config.fullID+'"'
				+' placeholder="'+config.placeholder+'"'
				+' type="text"'
				+' value="'+config.outputValueStr+'">';
		html = getDefalutHtml(html);
		return html;
	}
	//多值输入组件 cy 20180831
	function getDateTimeInputHtml(){
		//获取日期时间
		nsUI.dateTimeInput.setConfig(config, formJson);
		//根据修改的config输出
		var errorCls = config.isError?' error':'';  //有错误
		var cls = 'form-control'+' '+config.type+errorCls;
		var html = '<input class="'+cls+'" '
				+getDefalutAttr()
				+' name="'+config.fullID +'"'
				+' id="'+config.fullID+'"'
				+' placeholder="'+config.placeholder+'"'
				+' type="text"'
				+' value="'+config.outputValueStr+'">';
		html = getDefalutHtml(html);
		return html;
	}
	// 工作流组件 lyw 20181029
	function getFlowchartviewerHtml(){
		var cls = 'form-control'+' '+config.type;
		var heightStr = typeof(config.height)=='number'?'height:'+config.height+'px;':'';
		if(config.height == 'auto'){
			var winHeight = $(window).height();
			var height = (winHeight - 230)+'px';
			heightStr = 'height:'+height+';';
		}
		var html = '<div class="btn-group">'
						+ '<button class="btn btn-icon">'
							+ '<i class="fa-search-plus"></i>'
						+ '</button>'
						+ '<button class="btn btn-icon">'
							+ '<i class="fa-search-minus"></i>'
						+ '</button>'
					+ '</div>'
					+ '<ul class="" ns-type="tree-process">'
					+ '</ul>'
					+'<div class="'+cls+'" '
					+getDefalutAttr()
					+' style="overflow:auto;'+heightStr+'"'
					+' id="'+config.fullID+'">'
					+'</div>'
		html = getDefalutHtml(html);
		return html;
	}
	// 移动端日期组件 lyw 20181120
	function getDateMobileHtml(){
		var html = '';
		html = nsUI.dateMobileInput.getHtml(config);
		html = getDefalutHtml(html);
		return html;
	}
	return {
		init:init, 										//初始化
		getValue:getValue,				
		getFormLabel:getFormLabel,						//label代码
		getModalLabel:getModalLabel,					//label代码
		getLoadingHtml:getLoadingHtml,					//正在加载中	
		getFormElementLable:getFormElementLable,		//element类型的label
		getFormColumnSize:getFormColumnSize,			//获取column宽度
		getModalColumnSize:getModalColumnSize,			//获取column宽度
		getTextInput:getTextInput, 						//文本输入控件
		getTextareaInput:getTextareaInput, 				//多行文本输入控件
		getTextbtnInput:getTextbtnInput,				//textbtn控件
		getSingleUpload:getSingleUpload,				//上传组件 
		getTreeSelect:getTreeSelect,					//树类型下拉框
		getPersonSelect:getPersonSelect,				//人员选择器
		getPersonSelectSystem:getPersonSelectSystem,	//系统人员选择器
		getTypeahead:getTypeahead,						//typeahead			
		getTypeaheadTemplate:getTypeaheadTemplate,		//getTypeaheadTemplate			
		getHidden:getHidden,							//隐藏域
		getDatePicker:getDatePicker, 					//日期选择
		getTimePicker:getTimePicker,					//时间选择
		getDatetimePicker:getDatetimePicker,			//日期时间
		getDateRangePicker:getDateRangePicker,			//日期区间
		getSelect:getSelect,							//下拉框
		getSelectOptions:getSelectOptions, 				//根据数据返回下拉框内容
		getRadio:getRadio, 								//单选组
		getCheckbox:getCheckbox, 						//多选组
		getSelect2:getSelect2, 							//select2
		getAddSelectInput:getAddSelectInput,			//add-select-input
		getOrganizaSelect:getOrganizaSelect,			//add-organiza-input
		getProvinceSelect:getProvinceSelect,			//省市区select的三级联动
		getProvinceLinkSelect:getProvinceLinkSelect,	//省市区
		getTextselect:getTextselect,					//textselect
		getSelecttext:getSelecttext,					//selectText
		getSelectdate:getSelectdate,					//selectDate
		getSelectselect:getSelectselect,				//selectSelect
		getUpload:getUpload,							//upload和table表格
		getTable:getTable,								//table表格
		getInputselect:getInputselect,					//下拉输入框
		getScientificinput:getScientificinput,			//科学计数法
		getPowerinput:getPowerinput,					//幂的几次方
		getModelselector:getModelselector,				//车型选择器
		getUEditor:getUEditor, 							//富文本编辑器
		getColorPicker:getColorPicker, 					//颜色选择器
		getUploadImage:getUploadImage,					//图片上传
		getGraphicsInput:getGraphicsInput,				//星级评分
		getBaiduMapInput:getBaiduMapInput, 				//百度地图
		clickDisplayDialog:clickDisplayDialog, 			//baidumap类型调用的方法
		getHtmlByCodeMirror:getHtmlByCodeMirror,		//编辑器
		getDaterangeRadio:getDaterangeRadio,			//日期区间radio
		getWebUploadHtml:getWebUploadHtml,				//断点文件上传
		getPhotoImageHtml:getPhotoImageHtml,			//头像上传以及摄像头调用
		getNumRangeHtml:getNumRangeHtml,				//数字区间组件
		getMultiselectHtml:getMultiselectHtml,			//获取多选输出
		getExpressionHtml:getExpressionHtml,			//规则内容组件
		getValuesInputHtml:getValuesInputHtml, 			//格式化多值输入主键
		getattachCheckBox:getattachCheckBox,			//附加勾选
		getProvinceSelectHtml:getProvinceSelectHtml,	//项目选择器文本输出
		getDateTimeInputHtml:getDateTimeInputHtml, 		//日期时间输入
		getTransactorHtml:getTransactorHtml, 			//办理人设置
		getFlowchartviewerHtml:getFlowchartviewerHtml, 	//工作流
		getDateMobileHtml:getDateMobileHtml, 			//移动端日期
	}
})(jQuery);
//组件数组容器 返回html，用于多数组
// html：已经生成的组件代码HTML
// formJson: 表单配置
nsComponent.getArrayContainer = function(html,formJson){
	switch(formJson.formSource){
		case 'form':
			break
		case 'table':
			html = '<tr>'+html+'</tr>';
			break;
	}
	return html;
}
//初始化组件事件和方法
nsComponent.init = (function($) {
	var formJson;
	//设置formJson
	function setFormJson(formID){
		formJson = nsFormBase.data[formID].config;
	}
	//设置通用属性 container
	function setCommonAttr($dom,config){
		//$dom必须是组件里包含的一个dom
		switch(formJson.formSource){
			case 'form':
				config.$container = $dom.closest('.form-td');
				break;
			case 'modal':
				config.$container = $dom.closest('.form-group');
				break
			case 'table':
				config.$container = {
					th:$dom.closest('table').find('[ns-th-id='+config.id+']'),
					td:$dom.closest('td')
				}
				break;
		}
		//sjj20181120 是否存在动态添加的删除事件 适用于所有组件的触发操作
		if(config.mindjetFieldPosition == 'field-more' && config.stateSource == 'more'){
			config.$container.find('button[stateSource="more"]').on('click',function(ev){
				var $this = $(this);
				var relatefield = $this.attr('relatefield');
				var formId = $this.closest('form').attr('id');
				formId = formId.substring(5,formId.length);
				var moreFormId = formId + '-hidden';
				var currentEditArray = [{
					id:relatefield,
					hidden:false,
				}];
				var storeId = 'more-'+formId;
				var storeData = store.get(storeId);
				if(typeof(storeData)=='object'){
					delete storeData[relatefield];
				}
				store.set(storeId,storeData);
				$this.closest('[mindjetFieldPosition="field-more"]').addClass('hidden');
				var editArray = [{id:relatefield,hidden:true}]
				nsForm.edit(currentEditArray,moreFormId);
			});
		}
	}
	//文本输入框
	function text(config){
		nsUI.textInput.init(config,formJson);
		return;
		var $dom = $('#'+config.fullID);
		config.$input = $dom;
		setCommonAttr($dom,config);
		$dom.on('keyup keydown',function(event){
			event.stopPropagation();
		});
		var isInputMask = typeof(config.isInputMask)=='boolean'?config.isInputMask:false;//默认不支持

		if(isInputMask){
			var formatStr = config.format.toUpperCase();
			//格式化数据的字符串
			var maskString = formatStr.replace(/[A-Z]/g,'9');
			$dom.inputmask(maskString);
		}
		if(typeof(config.changeHandler)=='function'){
			var eventStr = 'change';
			if(config.onKeyChange){
				//onKeyChange:true的情况下，则按键按下就触发change时间
				eventStr = 'change keyup'
			}
			$dom.on(eventStr, function(ev){
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
			$dom.on(eventStr, function(ev){
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
		//判断是否支持快捷键插入html
		var isUseHtmlInput = typeof(config.isUseHtmlInput)=='boolean' ? config.isUseHtmlInput : false;//默认不支持
		if(isUseHtmlInput){
			//支持快捷键插入html
			nsUI.htmlInput.init(config, 'form');
		}
		// 是否支持快捷键 下一个获得焦点
		var isOnKeyDown = typeof(config.isOnKeyDown)=='boolean' ? config.isOnKeyDown : false;//默认不支持
		if(isOnKeyDown){
			nsComponent.initKeydown($dom,config,formJson);
		}
	} 
	function textBtn(config){
		var $input = $('#'+config.fullID);
		setCommonAttr($input,config);
		nsUI.textInput.textBtn(config);
		return;
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
			} else {
				
			}
		});
		//输入助手按钮 2018.2.22by张青
		if($.isArray(config.assistant)){
			assistantBtnInit(config);
		}
	}
	function transactorBtn(config){
		var $input = $('#'+config.fullID);
		setCommonAttr($input,config);
		var $inputBtn = $input.parent('div').find('button'); // 末尾编辑按钮
		$inputBtn.off('click');
		$inputBtn.on('click',function(ev){
			nsTransactorEditor.init(config);
		});
		var $closeBtn = $input.children('div').children('a.fa-close'); // 标签删除按钮
		$closeBtn.off('click');
		$closeBtn.on('click',function(event){
			var $this = $(this);
			var nsType = $this.attr('ns-type');
			var values = config.value;
			for(var i=0;i<values.length;i++){
				if(values[i].type == nsType){
					values.splice(i,1);
					break;
				}
			}
			config.value = values;
			var formID = config.fullID.substring(5,config.fullID.length-config.id.length-1);
			nsForm.edit([config],formID);
			if(typeof(config.changeHandler)=='function'){
				config.changeHandler(config.value,config);
			}
		});
	}

	//输入助手按钮初始化
	//2018.2.22by张青begin-------------------------------------------------
	function assistantBtnInit(config){
		if(config.assistant.length == 0){
			return;
		}
		var $input = $('#'+config.fullID);
		//按钮代码-----------------------------------------------------
		assistantHtml = '<div class="input-group-btn text-btn">'
							+'<button type="button" class="btn btn-info btn-icon" ns-btn-type="assistant" ns-state="close" id="'+config.fullID+'-assistantBtn">'
								+'<i class="fa-keyboard-o"></i>'
							+'</button>';
						+'</div>'
		$input.parent().append(assistantHtml);
		if(config.readonly == false) {
			var $assistantBtn = $('#'+config.fullID+'-assistantBtn');
			config.$assistantBtn = $assistantBtn;
			$assistantBtn.off('mouseup');
			$assistantBtn.on('mousedown', function(){
				if(nsComponent.assistantDocumentClickHandler) {
					$(document).off('click', nsComponent.assistantDocumentClickHandler);
				}
				
			});
			$assistantBtn.on('mouseup', {inputID: config.fullID, config:config, btnID:config.fullID+'-assistantBtn'}, function(ev){//先写方法，后写调用。
			//方法区域：
				//document点击方法
				function documentClickHandler (event) {
					console.log('事件触发');
					// var $assistantBtn = $('[ns-btn-ype="assistant"]'); 
					var	$assistantPanel = $('#input-assistant-panel');
					var target = event.target;
					if ($assistantPanel.length > 0) {
						//判断点击区域是否在面板内
						//if(不在) -> 卸载方法调用 //&& (!$.contains($assistantBtn[0],target)) && ($assistantBtn[0] != target)
						if ($assistantPanel[0] != target && !$.contains($assistantPanel[0],target)) {
							assistantPanelRemove();
						} else {
							console.warn('document click handler')
							//不处理
						}
					} else {
						// 不处理
					}
				}
				nsComponent.assistantDocumentClickHandler = documentClickHandler;
				//a标签点击方法
				function aTagClickHandler (event) {
					//标签内容替换
					var that = this;
					var inputDom = $input[0];

					var startP = inputDom.selectionStart;
					assistantConfig.pointerStart = startP;

					var endP = inputDom.selectionEnd;
					assistantConfig.pointerEnd = endP;

					var strArray = inputDom.value.split('');
					strArray.splice(startP, endP - startP, that.innerText);
					inputDom.value = strArray.join('');
					//还原光标
					inputDom.focus();
					var position = startP + that.innerText.length;
					inputDom.selectionStart = inputDom.selectionEnd = position;
					//卸载方法调用
					assistantPanelRemove();
				}
				//加载方法
				function assistantPanelInit () {

					var seatX = $input.offset().left;//横坐标
					var seatY = $input.offset().top + $input.outerHeight();//纵坐标
					var inputWidth = $input.parent().outerWidth();
					var assistantStyleStr = "width:"+inputWidth+"px;left:" + seatX + 'px;top:' + seatY + 'px;';
					var assistantContentHtml = '';
					for (var wordI = 0; wordI < config.assistant.length; wordI++) {
						assistantContentHtml += '<a class="factory-tag">'+ config.assistant[wordI] +'</a>'
					}
					var assistantPanelHtml = '<div class="factory-dropdown" style="'+assistantStyleStr+'" id="input-assistant-panel" sourceinputid="'+config.fullID+'">'+assistantContentHtml+'</div>'
					$('body').append(assistantPanelHtml);
					var $assistantPanel = $('#input-assistant-panel');
					var $innerBtn = $assistantPanel.find('a');
					$innerBtn.off('click');
					//a标签点击事件：替换输入框文本 ('click', a标签点击方法调用)
					$innerBtn.on('click', aTagClickHandler);
					$(document).off('click', nsComponent.assistantDocumentClickHandler);
					setTimeout(function(){
						$(document).on('click', nsComponent.assistantDocumentClickHandler);
					},10)
					
				}
				//卸载方法
				function assistantPanelRemove () {
					var $assistantPanel = $('#input-assistant-panel');
					//获取原输入框id
					var sourceInputId = $assistantPanel.attr('sourceinputid');
					//将上一次按钮的ns-state属性设置为close
					var $prevClickBtn = $('#' + sourceInputId + '-assistantBtn');
					$prevClickBtn.attr('ns-state','close');
					// var	$assistantPanel = $('.factory-dropdown');
					//面板卸载
					if ($assistantPanel.length > 0) {
						$assistantPanel.remove();
					} else {
						//不处理
					}
					//document点击事件方法卸载
					$(document).off('click', nsComponent.assistantDocumentClickHandler);//面板卸载事件
				}
				//基本数据
				var assistantConfig = {
					inputID:ev.data.inputID,
					btnID:ev.data.btnID,
					config:ev.data.config,
				}
				//input输入框对象的处理
				$input = $('#'+assistantConfig.inputID);
				assistantConfig.$input = $input;
				$input.focus();

				var clickType = $(this).attr('ns-state');
				var	$assistantPanel = $('#input-assistant-panel');
				//按钮对象处理
				if(clickType == 'open'){
					//如果是打开状态，则关闭
					$(this).attr('ns-state','close');
					assistantConfig.clickType = clickType;
					assistantPanelRemove();
					return;
				}else{
					//如果是关闭状态，则打开
					$(this).attr('ns-state','open');
					assistantConfig.clickType = clickType;
					if($assistantPanel.length > 0){
						assistantPanelRemove();
					}
				}
				
				assistantPanelInit();

			})
		}
		
	//2018.2.22by张青end---------------------------------------------------
	}

	//daterangeRadio
	function daterangeRadio(config){
		var $dom = $('[name="'+config.fullID+'"]');
		setCommonAttr($dom,config);
		nsUI.daterangeRadioInput.init(config,formJson);
		return;
		var rangeArray = language.date.beforeRange;
		if(config.rangeType === 'after'){
			rangeArray = language.date.afterRange;
		}
		var customDateInputID = config.fullID + '-' + (rangeArray.length-1);
		var $dateInput = $('#'+customDateInputID);
		var $container = $dateInput.parent();
		var $customDateLabel = $dateInput.prev();
		var labelID = config.fullID + '-isInput-daterange';
		$dom.off('change');
		$dom.on('change',function(ev){
			var $this = $(this);
			var nameStr = $this.attr('name');
			var id = $this.attr('id');
			$this.parent().children('label').removeClass('checked');
			$('label[for="'+id+'"]').toggleClass('checked');
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
	}
	function radio(config){
		nsUI.radioInput.init(config,formJson);
	}
	function checkbox(config){
		nsUI.checkboxInput.init(config,formJson);
	}
	//日期组件
	function date(config){
		var $dateInput = $('#'+config.fullID);
		setCommonAttr($dateInput,config);
		nsUI.dateInput.init(config,formJson);
		return;
		var datePickerOption = 
		{
			autoclose:true,
			todayHighlight:true,
			firstDay:1,
			maxViewMode:2,
			enableOnReadonly:false
		}
		var defaultConfig = {
			daysOfWeekDisabled:'',
			daysOfWeekHighlighted:false,
			todayBtn:false,
			clearBtn:false
		};
		nsVals.setDefaultValues(config,defaultConfig);
		var dateFormat = config.format;
		if(typeof(dateFormat)=='undefined'){
			dateFormat = nsVals.default.dateFormat;
		}
		datePickerOption.format = dateFormat.toLowerCase(); // nsVals.default.dateFormat;
		datePickerOption.daysOfWeekDisabled = config.daysOfWeekDisabled;
		//datePickerOption.format = 'yyyy-mm';
		//datePickerOption.startView  = 1;
		datePickerOption.startView = typeof(config.startView)=='number' ? config.startView : 0;
		if(typeof(config.addvalue)=='object'){
			if(!$.isEmptyObject(config.addvalue)){
				datePickerOption.autovalue = config.addvalue
			}
		}
		var $dateInput = $('#'+config.fullID);
		setCommonAttr($dateInput,config);
		$dateInput.datepicker(datePickerOption).on('changeDate',function(ev){
			var currentConfig = nsForm.getConfigByDom($(this));
			if(typeof(currentConfig.changeHandler)=='function'){
				var changeDateVal = $(this).val().trim();
				var returnObj = {
					id: currentConfig.id,
					value: $(this).val().trim()
				};
				currentConfig.changeHandler(returnObj);
			}
			//模拟一个公用的事件回调
			if(typeof(config.commonChangeHandler)=='function'){
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
		$dateInput.next().on('click',function(ev){
			//$(this).prev().datepicker('show');
			$dateInput.datepicker('show');
		})
		// 是否支持快捷键 下一个获得焦点
		var isOnKeyDown = typeof(config.isOnKeyDown)=='boolean' ? config.isOnKeyDown : false;//默认不支持
		if(isOnKeyDown){
			nsComponent.initKeydown($dateInput,config,formJson);
		}
	}
	//时间
	function timepicker(config){
		setCommonAttr($('#'+config.fullID),config);
		var showSeconds = typeof(config.showSeconds) == 'boolean' ? config.showSeconds : false;
		$('#'+config.fullID).attr('disabled',config.readonly);
		$('#'+config.fullID).timepicker({
			minuteStep: 1,//分钟间隔
			template: 'dropdown',//是否可选择 false,modal为只读
			showSeconds:showSeconds,//是否显示秒
			secondStep:1,//秒间隔
			showMeridian:false,//24小时制  true为12小时制
			defaultTime: false,  //默认时间
			showInputs:false,
		}).on('hide.timepicker',function(ev){
			var $this = $(this);
			var currentTimeID = $this.attr('id');
			var changeHandler = config.changeHandler;
			var timerVal = $this.val().trim();
			if(typeof(changeHandler)=='function'){
				var returnObj = {};
				returnObj.value = timerVal;
				returnObj.timeID = currentTimeID;
				changeHandler(returnObj);
			}
			//模拟一个公用的事件回调
			if(typeof(config.commonChangeHandler)=='function'){
				var obj = {
					value:timerVal,
					dom:$this,
					type:'timepicker',
					id:config.id,
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
	}
	//日期时间
	function datetime(config){
		var dateID = config.fullID+'-date';
		var timeID = config.fullID+'-time';
		setCommonAttr($('#'+dateID),config);
		nsUI.datetimeInput.init(config,formJson);
		return;
		var dateFormat = language.date.selectFormat;
		var showSeconds = true;
		if(typeof(config.format)=='string'){
			var formatStr = config.format;
			dateFormat = formatStr.split(' ')[0];
			if(typeof(formatStr.split(' ')[1])=='string'){
				//存在时间类型
				var timeFormat = formatStr.split(' ')[1];
				if(timeFormat.indexOf('ss') == -1){showSeconds = false}
			}
		}
		showSeconds = typeof(config.showSeconds) == 'boolean' ? config.showSeconds : false;
		$('#'+timeID).attr('seconds',showSeconds);
		dateFormat = dateFormat.toLowerCase(); 
		$('#'+timeID).attr('disabled',config.readonly);
		//if(config.readonly == false){
			$('#'+dateID).datepicker({
				format:dateFormat,
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
			$('#'+timeID).timepicker({
				minuteStep: 1,//分钟间隔
				template: 'dropdown',//是否可选择 false,modal为只读
				showSeconds:showSeconds,//是否显示秒
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
		//}
		// 是否支持快捷键 下一个获得焦点
		var isOnKeyDown = typeof(config.isOnKeyDown)=='boolean' ? config.isOnKeyDown : false;//默认不支持
		if(isOnKeyDown){
			// nsComponent.initKeydown($('#'+dateID),config,formJson);
			// nsComponent.initKeydown($('#'+timeID),config,formJson);
		}
	}
	//日期区间组件
	function daterangepicker(config){
		//minDate maxDate startDate endDate
		var ranges = {};
		config.ranges = typeof(config.ranges) == 'boolean' ? config.ranges : true;
		if(config.ranges == true){
			ranges[language.common.nscomponent.daterangepicker.today] = [moment(), moment()];
			ranges[language.common.nscomponent.daterangepicker.yesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
			ranges[language.common.nscomponent.daterangepicker.sevendays] = [moment().subtract(6, 'days'), moment()];
			ranges[language.common.nscomponent.daterangepicker.thirtydays] = [moment().subtract(29, 'days'), moment()];
			ranges[language.common.nscomponent.daterangepicker.week] = [moment().startOf('week'), moment().endOf('week')];
			ranges[language.common.nscomponent.daterangepicker.lastweek] = [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')];
			ranges[language.common.nscomponent.daterangepicker.month] = [moment().startOf('month'), moment().endOf('month')];
			ranges[language.common.nscomponent.daterangepicker.lastmonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];
		}
		var options = {
			"ranges":ranges,
			"locale": {
				"format": language.common.nscomponent.daterangepicker.localeformat,
				"separator": " - ",
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
		//是否使用默认值 value''则不执行默认值
		config.isEmptyValue = false;
		if(config.value == ''){
			config.isEmptyValue = true;
		}

		//默认日期 
		var isDefaultDate = false;
		if(typeof(config.startDate) == 'string'){
			options.startDate = config.startDate;
			isDefaultDate = true;
			if(typeof(config.endDate)!='string'){
				options.endDate = moment().format(language.date.rangeFormat);
			}
		}
		if(typeof(config.endDate) == 'string'){
			options.endDate = config.endDate;
			isDefaultDate = true;
			if(typeof(config.startDate)!='string'){
				options.startDate = moment().format(language.date.rangeFormat);
			}
		}
		if(typeof(config.format) == 'string'){
			options.locale.format = config.format;
		}
		if(typeof(config.separator) == 'string'){
			options.locale.separator = config.separator;
		}

		$dateRangeInput = $('#'+config.fullID);
		var stateHtml = '';
		if(isDefaultDate){
			options.ranges[language.common.nscomponent.daterangepicker.defaultDateRange] = [moment(options.startDate,language.date.rangeFormat),moment(options.endDate, language.date.rangeFormat)];
			var start = moment(options.startDate, language.date.rangeFormat);
			var end = moment(options.endDate, language.date.rangeFormat);
			var label = language.common.nscomponent.daterangepicker.defaultDateRange;
			stateHtml = getStateHtml(start,end,label);
			$dateRangeInput.html(stateHtml);
		}

		//最大最小日期
		if(typeof(config.minDate)=='string'){
			options.minDate = config.minDate;
		}
		if(typeof(config.maxDate)=='string'){
			options.maxDate = config.maxDate;
		}
		
		setCommonAttr($dateRangeInput,config);
		function getStateHtml(start,end,label){
			var html = '';
			if(label==language.common.nscomponent.daterangepicker.customRangeLabel || label==language.common.nscomponent.daterangepicker.defaultDateRange){
				var startStr = start.format(language.date.rangeFormat);
				var endStr = end.format(language.date.rangeFormat);
				if(start.format(language.date.year) == end.format(language.date.year)){
					startStr = start.format(language.date.monthday);
					endStr = end.format(language.date.monthday);
				}else{
					startStr = start.format(language.date.rangeFormat);
					endStr = end.format(language.date.rangeFormat);
				}
				if(startStr == endStr){
					html = startStr;
				}else{
					html = startStr + language.common.nscomponent.daterangepicker.toLabel + endStr;
				}
				if(label==language.common.nscomponent.daterangepicker.defaultDateRange){
					//html = language.common.nscomponent.daterangepicker.default +html
				}
			}else{
				html = label;
			}
			html = '<i class="fa-calendar"></i>'
				+'<span>' + html + '</span>';
			return html;
		}
		$dateRangeInput.daterangepicker(options, function(start, end, label) {
			//填充时间区域到导航栏
			var outputHtml = getStateHtml(start,end,label);
			$dateRangeInput.html(outputHtml);
			// if(config.isEmptyValue == true){
			// 	debugger
			// 	$dateRangeInput.html('');
			// }
			

			// //如果改变过日期
			// if(config.isEmptyValue == true){
			// 	config.isEmptyValue = false;
			// }
			var currentConfig = nsForm.getConfigByDom($(this.element));
			if(typeof(currentConfig.changeHandler)=='function'){
				var changeDateVal = $(this.element).val().trim();
				var returnObj = {
					id: currentConfig.id,
					value: $(this.element).val().trim()
				};
				currentConfig.changeHandler(returnObj);
			}
			//模拟一个公用的事件回调
			if(typeof(currentConfig.commonChangeHandler)=='function'){
				var obj = {
					value:$(this.element).val().trim(),
					dom:$(this.element),
					type:'daterange',
					id:currentConfig.id,
					config:currentConfig
				}
				currentConfig.commonChangeHandler(obj);
			}
		});
	}

	//select和selectBoxIt方法都是初始化select，如果单独使用，只需要用第二个，每个select只能执行一次
	function select(config,selectArr){
		var $dom = $('#'+config.fullID);
		setCommonAttr($dom,config);
		if(config.ajaxLoading){
			//ajax还在加载，先不加载事件
		}else{
			selectBoxIt(config,selectArr);
			// nsUI.selectInput.init(config,formJson);
			delete config.ajaxLoading;
		}
	}
	function selectBoxIt(config,selectArr){
		var id = config.fullID;
		$('#'+id).selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar('update');
		});
		var selectBoxOption = $('#'+id).selectBoxIt().data("selectBox-selectBoxIt");
		selectBoxOption.refresh();
		function selectChangeHandler(ev){
			var $select = $(ev.target);
			var config = nsForm.getConfigByDom($select);
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
			removeError($select);
		}

		var isSelectDiabled = config.readonly ? true : false;
		$('#'+id).attr('disabled',isSelectDiabled);
		$('#'+id).off('change',selectChangeHandler);
		$('#'+id).on('change',selectChangeHandler);
	}
	function select2(config){
		var $select2 = $('#'+config.fullID);
		select2BoxIt(config.fullID);
	}
	function select2BoxIt(id){
		var $select2 = $('#'+id);
		var config = nsForm.getConfigByDom($select2);
		setCommonAttr($select2,config);
		var value;
		if(typeof(config.value) == 'function'){
			value = config.value();
		}else{
			value = config.value;
		}
		if(typeof(value) == 'string'){
			if(value.indexOf(',') > -1){
				value = value.split(',');
			}
		}
		var isSelectDiabled = config.readonly ? true : false;
		$select2.attr('disabled',isSelectDiabled);
		if(value){
			$select2.val(value).trigger('change');
		}
		if(config.isServiceMode == true){
			//服务端搜索模式
			$select2.parent().children('.input-loading').remove();
			formPlane.selectTwoDom[config.fullID] = $select2.select2({
				width:'100%',
				placeholder: placeholderStr,//默认值
				language:{
					inputTooShort:function(args){
						return '请输入一个或多个字符';
					}
				},
				ajax: {
					url: config.url,
					dataType: 'json',
					type:config.method,
					delay: 250,
					data: function (params) {
						var config = nsForm.getConfigByDom($(this));
						var requestJson = {};
						if(!$.isEmptyObject(config.data)){
							for(var i in config.data){
								requestJson[i] = config.data[i];
							}
						}
						if(config.requestParams){
							//如果存在请求参
							requestJson[config.requestParams] = params.term;
						}
						return requestJson;
					},
					processResults: function (data, params) {
						var config = nsForm.getConfigByDom(this.$element);
						var returnData = config.dataSrc ? data[config.dataSrc] : data;
						for(var i=0; i<returnData.length; i++){
							returnData[i].id = returnData[i][config.valueField];
							returnData[i].text = returnData[i][config.textField];
						}
						return {
							results: returnData,
						};
					},
					cache: true
				},
			//	escapeMarkup: function (markup) { console.log(markup); return markup; }, // let our custom formatter work
				minimumInputLength: 1
			});
			//formPlane.selectTwoDom[config.fullID].val('1').trigger('change');
			$select2.off('select2:close');
			$select2.on('select2:close',function(ev){
				var value = $.trim($(this).val());
				var config = nsForm.getConfigByDom($select2);
				/*var selectTwoArr = $(this).select2("data");
				var textStr = '';
				for(var i=0; i<selectTwoArr.length; i++){
					textStr += selectTwoArr[i].text+',';
				}
				textStr = textStr.substring(0,textStr.length-1);
				if(typeof(config.changeHandler)=='function'){
					config.changeHandler(value,textStr);
				}	*/	
				var textStr = $.trim($(this).find('option:selected').text());
				// lyw 20180620 异步搜索的select2添加changeHandler
				if(typeof(config.changeHandler)=='function'){
					config.changeHandler(value,textStr);
				}
				//模拟一个公用的事件回调
				if(typeof(config.commonChangeHandler)=='function'){
					var obj = {
						value:value,
						dom:$(this),
						type:'select2',
						id:config.id,
						textStr:textStr,
						config:config
					}
					config.commonChangeHandler(obj);
				}
				removeError($(this));
			});
		}else{
			var placeholderStr = typeof(config.rules)!='undefined' ? language.common.nscomponent.placeHolder.select2 : language.common.nscomponent.placeHolder.returnSelect;
			formPlane.selectTwoDom[config.fullID] = $select2.select2({
				placeholder: placeholderStr,//默认值
				tags:config.filltag,//手动添加自定义标签值
				maximumSelectionLength:config.maximumItem,//允许选择的条目数
				allowClear:config.isAllowClear,//是否清空选择项
				minimumResultsForSearch:config.isCloseSearch,
				width:'100%',
			});
			if($.isArray(config.subdata)){
				if(config.subdata.length > 0){
					$select2.off('select2:close');
					$select2.on('select2:close',function(ev){
						var value = $.trim($(this).val());
						var textStr = '';
						if(value.indexOf(',')>-1){
							value = value.split(',');
							for(var indexI=0; indexI<value.length; indexI++){
								if(value[indexI] === ''){
									value.splice(indexI,1);
								}
							}
							$(this).val(value).trigger('change');
						}
						var config = nsForm.getConfigByDom($select2);
						/*var selectTwoArr = $(this).select2("data");
						for(var i=0; i<selectTwoArr.length; i++){
							textStr += selectTwoArr[i].text+',';
						}*/
						var textStr = $.trim($(this).find('option:selected').text());
						//textStr = textStr.substring(0,textStr.length-1);
						if(typeof(config.changeHandler)=='function'){
							config.changeHandler(value,textStr);
						}		
						//模拟一个公用的事件回调
						if(typeof(config.commonChangeHandler)=='function'){
							var obj = {
								value:value,
								dom:$(this),
								type:'select2',
								id:config.id,
								text:textStr,
								config:config
							}
							config.commonChangeHandler(obj);
						}
						removeError($(this));
					});
				}
			}
		}
	}
	function uploadSingle(config){
		var $upload = $('#'+config.fullID);
		setCommonAttr($upload,config);
		var fileI = 0;									//初始化文件个数
		var valueStr;									//读取默认的赋值
		if(typeof(config.value)=='function'){
			valueStr = config.value();
		}else{
			valueStr = config.value;
		}
		if($.isArray(valueStr)){			
			var uploadIdField = '';
			if(typeof(config.valueField)=='string'){
				if(config.valueField !== ''){
					uploadIdField = config.valueField;	//是否定义了valueField字段
				}
			} 
			for(var dropI=0; dropI<valueStr.length; dropI++){
				if(uploadIdField !== ''){
					nsForm.dropzoneStr[config.fullID].push(valueStr[dropI][uploadIdField]);
				}
			}
		}
		//判断是否含有只读属性
		var isReadonly = typeof(config.readonly) == 'boolean' ?config.readonly:false;
		if(isReadonly){
			//只读属性为真，则只可以进行下载不能上传和删除
			var downloadJson = {id:config.fullID,handler:config.downloadHandler}
			dropzoneDownloadHandler(downloadJson);
		}else{
			uploadSingleHandler(config.fullID);			//有默认值的时候会触发上传和下载事件的调用
			var uploadbtnID = config.fullID+'-btn';
			var $uploadbtn = $('#'+uploadbtnID);
			var supportArr = ['#'+config.fullID,'#'+uploadbtnID];
			if($.isEmptyObject(nsForm.dropzoneFileJson[config.fullID])){	
				$upload.dropzone({
					url:config.url,
					paramName:config.fullID,
					acceptedFiles:config.supportFormat,
					uploadMultiple:config.ismultiple,	
					maxFiles:config.isAllowFiles,
					clickable:supportArr,
					dictDefaultMessage:language.common.nscomponent.select2BoxIt.dictDefaultMessage,
					dictMaxFilesExceeded:language.common.nscomponent.select2BoxIt.dictMaxFilesExceeded,
					addRemoveLinks:true,//添加移除文件
					dictInvalidFileType:language.common.nscomponent.select2BoxIt.dictInvalidFileType,
					dictResponseError:language.common.nscomponent.select2BoxIt.dictResponseError,
					dictInvalidFileType:language.common.nscomponent.select2BoxIt.dictInvalidFileType,
					autoProcessQueue:true,//不自动上传
					accept:function(file,done){
						var config = uploadSingleConfig($(this.element));
						var maxFilesLength = config.isAllowFiles;			//允许保存的最大值
						var alreadyLength = nsForm.dropzoneStr[config.fullID].length; //已经保存的值数量
						if(alreadyLength == maxFilesLength){
							//如果已经相等则不可再进行上传的操作
							done(language.common.nscomponent.select2BoxIt.isAllowFilesA+config.isAllowFiles+language.common.nscomponent.select2BoxIt.isAllowFilesB);
						}else{
							done();
						}
					},
					init:function(){
						//初始化数据
						var config = uploadSingleConfig($(this.element));
						var alreadyLength = nsForm.dropzoneStr[config.fullID].length; //已经保存的值数量
						if(alreadyLength.length > 0){
							//如果存在值的情况才会有上传下载删除事件
							uploadSingleHandler(this);
						}
						nsForm.dropzoneFileJson[config.fullID] = this;			//存放当前dom元素
					},
					//添加了一个文件时发生
					addedfile:function(file){
						var fileID = $(this.element).attr('id');
						var size = parseInt(file.size/1024, 10);
						size = size < 1024 ? (size + " KB") : (parseInt(size/1024, 10) + " MB");
					},
					//一个文件被移除时发生
					removedfile:function(file){
						var config = uploadSingleConfig($(this.element));
					},
					//文件成功上传之后发生，第二个参数为服务器响应
					success: function(file,data)
					{
						var config = uploadSingleConfig($(this.element));
						var receiveFileJson;
						/*******拿到返回值start***************/
						if(typeof(config.changeHandler)=='function'){
							var returnObj = {};
							returnObj.data = data;
							returnObj.file = file;
							returnObj.fileInputId = config.id;
							receiveFileJson = config.changeHandler(returnObj);
						}else{
							var rowData = data;
							if(config.dataSrc){
								rowData = data[config.dataSrc];
							}
							receiveFileJson = rowData[0];
						}
						/*******拿到返回值end***************/
						if($.isEmptyObject(receiveFileJson)){
							//如果拿到的值为空则返回报错
							nsAlert(language.common.nscomponent.select2BoxIt.receiveFile);
							return;
						}
						var value = receiveFileJson[config.valueField];//返回id
						var text = receiveFileJson[config.textField];//返回名称
						if(value !== ''){nsForm.dropzoneStr[config.fullID].push(value)}//存放上传文件值
						var loadFileHtml = '<span class="dropzone-upload-span">'
										+'<a href="javascript:void(0)" id="'+value+'" ns-file="'+fileI+'" class="upload-close">'
										+'</a>'
										+'<a href="javascript:void(0)" id="'+value+'" ns-file="'+fileI+'" class="upload-title">'
										+text+'</a>'
										+'</span>';
						if($.trim($('#'+config.fullID).text()) == language.common.nscomponent.placeHolder.select2){
							//没有值的情况下
							$('#'+config.fullID).text('');
						}
						$('#'+config.fullID).append(loadFileHtml);			//追加显示值
						nsForm.dropzoneGetFile[config.fullID][fileI] = file;	//记录当前是第几个添加的文件
						nsForm.dropzoneDataJson[config.fullID][value] = text;
						fileI++;
						uploadSingleHandler(this);							//触发下载和删除方法	
						removeError($(this.element));							//移除必填的错误提示
					},
					error: function(file,errorMessage)
					{
						nsAlert(errorMessage);
						this.removeFile(file);
					}
				});
			}
			/*nsForm.dropzoneFileJson[id].disable()
			nsForm.dropzoneFileJson[id].enable()*/
		}
	}

	//得到当前元素的配置属性
	function uploadSingleConfig($dom){
		var uploadId = $dom.attr('ns-id');
		var formId = $dom.closest('form').attr('id');
		formId = formId.substring(formId.indexOf('-')+1,formId.length);
		var config = nsForm.getFormConfig(formId).component[uploadId];
		return config;
	}
	//上传下载事件
	function dropzoneDownloadHandler(downloadJson){
		var fileID = downloadJson.id;
		var handler = downloadJson.handler;
		$('#'+fileID+' a.upload-title').off('click');
		$('#'+fileID+' a.upload-title').on('click',function(ev){
			var downloadID = $(this).attr('id');
			if(typeof(handler)=='function'){
				handler(downloadID);
			}
		})
	}


	//上传操作的下载和删除事件
	function uploadSingleHandler(dropzone,type){
		var $spanDom;
		var config;
		if(typeof(dropzone)=='string'){
			//获取的是个id
			var $dom = $('#'+dropzone);
			config = uploadSingleConfig($dom);
			$spanDom = $('#'+config.fullID+' span.dropzone-upload-span');
		}else{
			var $dom;
			if(type == 'button'){
				$dom = $(dropzone.element).prev();
			}else{
				$dom = $(dropzone.element);
			}
			config = uploadSingleConfig($dom);
			$spanDom = $('#'+config.fullID+' span.dropzone-upload-span');
		}
		$spanDom.children('.upload-title').off('click');
		$spanDom.children('.upload-title').on('click',function(ev){
			var $dom = $(this).closest('span').parent();
			var configObj = uploadSingleConfig($dom);
			var downLoadId = $(this).attr('id');
			if(typeof(configObj.downloadHandler)=='function'){
				configObj.downloadHandler(downLoadId);
			}
		});
		$spanDom.children('.upload-close').off('click');
		$spanDom.children('.upload-close').on('click',function(ev){
			var $dom = $(this).closest('span').parent();
			var configObj = uploadSingleConfig($dom);
			var delId = $(this).attr('id');
			//删除有两种情况，一种是默认值的时候删除，一种是在调用ajax上传成功之后删除，上传成功之后多存储了file
			var fileJson = nsForm.dropzoneGetFile[configObj.fullID];
			var valueArr = nsForm.dropzoneStr[configObj.fullID];
			//删除要删除文件和从已选中的值当中移除
			if($.isArray(valueArr)){
				for(var i=0; i<valueArr.length; i++){
					if(valueArr[i] == delId){
						valueArr.splice(i,1);
					}
				}
			}
			if(!$.isEmptyObject(fileJson)){
				//不为空，是经过上传处理的需要把文件同时删除
				var fileIndex = $(this).attr('ns-file');
				var file = fileJson[fileIndex];
				if(file){	
					delete nsForm.dropzoneGetFile[configObj.fullID][fileIndex];
					delete nsForm.dropzoneDataJson[configObj.fullID][delId];
					dropzone.removeFile(file);
				}
			}
			$(this).closest('span').remove();
			if(typeof(configObj.delFileHandler) == 'function'){
				config.delFileHandler(delId);
			}
		});
	}
	function typeahead(config){
		var typeaheadSource = {};
		if(typeof(config.sourceSrc)=='string'){
			typeaheadSource = {
				ajax:{
					url:config.sourceSrc,
					path:config.dataSrc
				}
			};
		}else{
			typeaheadSource[config.dataSrc] = {
				data: config.selfData
			}
		}
		$('#'+config.fullID).typeahead({
			input: config.fullID,
			minLength: 1,
			maxItem: 20,
			order: typeof(config.order) == 'string' ? config.order : '',
			group: true,
			maxItemPerGroup: 3,//每组显示结果数
			groupOrder: function () {
				var scope = this,
				sortGroup = [];

				for (var i in this.result) {
					sortGroup.push({
						group: i,
						length: this.result[i].length
					});
				}

				sortGroup.sort(
					scope.helper.sort(
						["length"],
						false, // false = desc, the most results on top
						function (a) {
							return a.toString().toUpperCase()
						}
					)	
				);

				return $.map(sortGroup, function (val, i) {
					return val.group
				});
			},
            hint: true,
			// dropdownFilter: typeof(config.dropdownFilter) == 'string' ? config.dropdownFilter : '',
			source:typeaheadSource,
			callback: {
				onInit: function(node){
					
				},
				//键盘触发事件
				onNavigateBefore:function(node,query,event){
					if (~[38,40].indexOf(event.keyCode)) {
						event.preventInputChange = true;
					}
				},
				onSearch:function(node,query){
					
				},
				onResult: function (node, query, result, resultCount) {
					if (query === "") return;
					var isQuery = true;
					if (result.length > 0 && result.length < resultCount) {
						isQuery = true;
					} else if (result.length > 0) {
						isQuery = true;
					} else {
						isQuery = false;
					}
					if($(node).closest('span').children('label.has-error').length >= 1){
						$(node).closest('span').children('label.has-error').remove();
					}
					if(isQuery == false){
						$(node).closest('span').append('<label class="has-error">'+language.common.nscomponent.select2BoxIt.isQuery+'</label>');
					}
				},
				onShowLayout: function (node,query){
				},
				onHideLayout: function (node, query) {
					node.attr('placeholder', 'Search');
				},
			}
		});
	}
	function typeaheadTemplate(config){
		var typeaheadSource = {};
		if(typeof(config.url)=='string'){
			typeaheadSource = {
				ajax:{
					url:config.url,
					path:config.dataSrc,
					type : config.method,
	       			data : config.data,
	       			dataType : "json",
				}
			};
		}else{
			typeaheadSource[config.dataSrc] = {
				data: config.selfData
			}
		}
		$('#'+config.fullID).typeahead({
			input: config.fullID,
			minLength: 1,
			maxItem: 20,
			order: typeof(config.order) == 'string' ? config.order : '',
			group: true,
			maxItemPerGroup: 3,//每组显示结果数
			groupOrder: function () {
				var scope = this,
				sortGroup = [];

				for (var i in this.result) {
					sortGroup.push({
						group: i,
						length: this.result[i].length
					});
				}

				sortGroup.sort(
					scope.helper.sort(
						["length"],
						false, // false = desc, the most results on top
						function (a) {
							return a.toString().toUpperCase()
						}
					)	
				);

				return $.map(sortGroup, function (val, i) {
					return val.group
				});
			},
            hint: true,
			// dropdownFilter: typeof(config.dropdownFilter) == 'string' ? config.dropdownFilter : '',
			source:typeaheadSource,
			callback: {
				onInit: function(node){
					
				},
				//键盘触发事件
				onNavigateBefore:function(node,query,event){
					if (~[38,40].indexOf(event.keyCode)) {
						event.preventInputChange = true;
					}
				},
				onSearch:function(node,query){
					
				},
				onResult: function (node, query, result, resultCount) {
					if (query === "") return;
					var isQuery = true;
					if (result.length > 0 && result.length < resultCount) {
						isQuery = true;
					} else if (result.length > 0) {
						isQuery = true;
					} else {
						isQuery = false;
					}
					if($(node).closest('span').children('label.has-error').length >= 1){
						$(node).closest('span').children('label.has-error').remove();
					}
					if(isQuery == false){
						$(node).closest('span').append('<label class="has-error">'+language.common.nscomponent.select2BoxIt.isQuery+'</label>');
					}
				},
				onShowLayout: function (node,query){
				},
				onHideLayout: function (node, query) {
					node.attr('placeholder', 'Search');
				},
			}
		});
	}
	function removeError($dom){
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
	function hidden(config){
		config.$container = $('#'+config.fullID).closest('.row.row-close');
	}
	//selecttext textselect selectdate selectselect button
	function advanchButtonHandler(ev){
		var btnFid = Number($(this).attr('fid'));
		var formID = $(ev.target).closest('form').attr('id');

		var planeID = $(ev.target).closest('.form-item').attr('ns-id');

		var $elementParentDom = $(ev.target).closest('.form-td');

		formID = formID.substr(5,formID.length);
		var returnFunc = nsForm.data[formID].formInput[planeID].button[btnFid].handler;
		if(returnFunc){
			returnFunc(planeID,$elementParentDom);
		}
	}
	//selectText
	function selectText(config){
		var $select = $('#form-'+formJson.id+'-'+config.select.id);
		setCommonAttr($select,config);
		$select.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
		});
		$select.closest('.form-item').find('button').off('click');
		$select.closest('.form-item').find('button').on('click',advanchButtonHandler);
	}
	//textSelect
	function textSelect(config){
		var $select = $('#form-'+formJson.id+'-'+config.select.id);
		setCommonAttr($select,config);
		$select.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
		});
		$select.closest('.form-item').find('button').off('click');
		$select.closest('.form-item').find('button').on('click',advanchButtonHandler);
	}
	//selectDate
	function selectDate(config){
		var $select = $('#form-'+formJson.id+'-'+config.caseSelect.id);
		setCommonAttr($select,config);
		var $selectBoxIt = $select.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
		});
		$selectBoxIt.off('change');
		$selectBoxIt.on('change',caseSelectHandler);
		var $date = $('#form-'+formJson.id+'-'+config.date.id);
		$date.datepicker({
			format:language.date.selectFormat,
			autoclose:true,
			todayHighlight:true,
		});
		getDaterange(config.daterange);
		$select.closest('.form-item').find('button').off('click');
		$select.closest('.form-item').find('button').on('click',advanchButtonHandler);
	}
	function getDaterange(config){
		//minDate maxDate startDate endDate
		var $dateRangeInput = $('#form-'+formJson.id+'-'+config.id);
		var ranges = {};
		config.ranges = typeof(config.ranges) == 'boolean' ? config.ranges : true;
		if(config.ranges == true){
			ranges[language.common.nscomponent.daterangepicker.today] = [moment(), moment()];
			ranges[language.common.nscomponent.daterangepicker.yesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
			ranges[language.common.nscomponent.daterangepicker.sevendays] = [moment().subtract(6, 'days'), moment()];
			ranges[language.common.nscomponent.daterangepicker.thirtydays] = [moment().subtract(29, 'days'), moment()];
			ranges[language.common.nscomponent.daterangepicker.week] = [moment().startOf('week'), moment().endOf('week')];
			ranges[language.common.nscomponent.daterangepicker.lastweek] = [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')];
			ranges[language.common.nscomponent.daterangepicker.month] = [moment().startOf('month'), moment().endOf('month')];
			ranges[language.common.nscomponent.daterangepicker.lastmonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];
		}		
		var options = {
			"ranges":ranges,
			"locale": {
				"format": language.common.nscomponent.daterangepicker.localeformat,
				"separator": " / ",
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
		//默认日期 
		var isDefaultDate = false;
		if(typeof(config.startDate) == 'string'){
			options.startDate = config.startDate;
			isDefaultDate = true;
			if(typeof(config.endDate)!='string'){
				options.endDate = moment().format(language.date.rangeFormat);
			}
		}
		if(typeof(config.endDate) == 'string'){
			options.endDate = config.endDate;
			isDefaultDate = true;
			if(typeof(config.startDate)!='string'){
				options.startDate = moment().format(language.date.rangeFormat);
			}
		}
		var stateHtml = '';
		if(isDefaultDate){
			options.ranges[language.common.nscomponent.daterangepicker.defaultDateRange] = [moment(options.startDate,language.date.rangeFormat),moment(options.endDate, language.date.rangeFormat)];
			var start = moment(options.startDate, language.date.rangeFormat);
			var end = moment(options.endDate, language.date.rangeFormat);
			var label = language.common.nscomponent.daterangepicker.defaultDateRange;
			stateHtml = getStateHtml(start,end,label);
			$dateRangeInput.html(stateHtml);
		}
		if(typeof(config.format) == 'string'){
			options.locale.format = config.format;
		}
		if(typeof(config.separator) == 'string'){
			options.locale.separator = config.separator;
		}
		//最大最小日期
		if(typeof(config.minDate)=='string'){
			options.minDate = config.minDate;
		}
		if(typeof(config.maxDate)=='string'){
			options.maxDate = config.maxDate;
		}
		$dateRangeInput = $('#'+config.fullID);
		setCommonAttr($dateRangeInput,config);
		function getStateHtml(start,end,label){
			var html = '';
			if(label==language.common.nscomponent.daterangepicker.customRangeLabel || label==language.common.nscomponent.daterangepicker.defaultDateRange){
				var startStr = start.format(language.date.rangeFormat);
				var endStr = end.format(language.date.rangeFormat);
				if(start.format(language.date.year) == end.format(language.date.year)){
					startStr = start.format(language.date.monthday);
					endStr = end.format(language.date.monthday);
				}else{
					startStr = start.format(language.date.rangeFormat);
					endStr = end.format(language.date.rangeFormat);
				}
				if(startStr == endStr){
					html = startStr;
				}else{
					html = startStr +' '+ language.common.nscomponent.daterangepicker.toLabel +' '+ endStr;
				}
				
			}else{
				html = label;
			}
			html = '<i class="fa-calendar"></i>'
				+'<span>' + html + '</span>';
			return html;
		}
		$dateRangeInput.daterangepicker(options, function(start, end, label) {
			//填充时间区域到导航栏
			var outputHtml = getStateHtml(start,end,label);
			$dateRangeInput.html(outputHtml);
		});
	}
	function caseSelectHandler(ev){
		var selectID = $(this).attr('id');
		var selectValue = $(this).val().trim();
		var selectText = $(this).find('option:selected').text().trim();
		var formID = $(ev.target).closest('form').attr('id');
		selectID = selectID.substr(formID.length+1,selectID.length);
		formID = formID.substr(5,formID.length);
		var returnID = $(ev.target).attr('ns-id');
		var returnFunc = nsForm.data[formID].formInput[returnID].caseSelect.changeHandler;
		if(returnFunc){
			var selectFunc = returnFunc(returnID);
			selectFunc(selectValue,selectText);
		}
	}
	//selectSelect
	function selectSelect(config){
		var $firstSelect = $('#form-'+formJson.id+'-'+config.firstSelect.id);
		setCommonAttr($firstSelect,config);
		$firstSelect.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
		});
		var $secondSelect = $('#form-'+formJson.id+'-'+config.secondSelect.id);
		$secondSelect.selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
		});
		$firstSelect.closest('.form-item').find('button').off('click');
		$firstSelect.closest('.form-item').find('button').on('click',advanchButtonHandler);
	}
	//scientificInput
	function scientificInput(config){
		//科学计数法
		var $dom = $('#'+config.fullID);
		setCommonAttr($dom,config);
		$dom.on('keyup', function(ev){
			//a×10^n的形式（1≤|a|<10，n为整数
			var value = $.trim($(this).val());
			var neg = "";			//正负号  
			value = Number(value);	//把值先转成数值类型
			if(isNaN(value)){
				//非数字验证必须输入合法数字
			}else{
				if(value != 0){
					//不等于0的值参与转换的运算
					if(value<0){
						//如果值小于0
						value *= -1;
						neg = "-";
					}
					var n = 0;
					n = parseInt(Math.log10(value)); 			//返回指定数字以 10 为底的对数 
					var num = Math.pow(10,n);					//表示10的n次幂

					value = value / num;

					var configJson = nsForm.getConfigByDom($(this));
					var number = neg+value+"*10^"+n;
					if(configJson.isShowone==false && Number(value)==1){
						number = neg+"10^"+n;
					}
					$(this).parent().children('[ns-control="scientific"]').text(number);
				}else{
					$(this).parent().children('[ns-control="scientific"]').text('');
				}
			}
		});	
	}
	//power-input
	function powerInput(config){
		//幂的几次方
		var $dom = $('#'+config.fullID);
		setCommonAttr($dom,config);
		$dom.on('keyup',function(ev){
			var valueStr = $.trim($(this).val());
			if(valueStr.indexOf('^')>-1){
				var numArr = valueStr.split('^');
				var num = numArr[0];
				var count = numArr[1];
				if(count !== ''){
					count = Number(count);
					if(!isNaN(count)){
						var resultNum = Math.pow(num,count);
						if(resultNum == Infinity){
							resultNum = '溢出，无法计算';
						}
						$(this).parent().children('[ns-control="power"]').text(resultNum);
					}else{
						//不合法的数据值
						$(this).parent().children('[ns-control="power"]').text('');
					}
				}
			}else{
				$(this).parent().children('[ns-control="power"]').text('');
			}
		})
	}
	//model-selector
	function modelSelector(config){
		//车型选择
		var $dom = $('#'+config.fullID);
		setCommonAttr($dom,config);
		$dom.on('click',function(ev){
			var configJson = nsForm.getConfigByDom($(this));
			nsUI.modelSelector.init(configJson);
		});
	}
	//uploadObj
	function uploadObj(config){
		// console.log(config);
		if(config.formSource == 'modal' && config.isInitComplete != false){
			config.isInitComplete = false;
			return;
		}
		var uploadJson = config;
		var i = 1;
		var btnI = 0;
		$example_dropzone_filetable = $('#'+uploadJson.id);
		formPlane.dropzoneGetFile = {};
		formPlane.dropzoneGetFile['advancedDropzone'] = {};
		formPlane.dropzoneFile = {};
		formPlane.dropzoneFile['advancedDropzone'] = {};
		var uploadMaxFileLength = uploadJson.isAllowFiles ? Number(uploadJson.isAllowFiles):1;
		var supportFormat = typeof(uploadJson.supportFormat) == 'undefined' ? '' : uploadJson.supportFormat;
		example_dropzone = $("#advancedDropzone").dropzone({
			url: uploadJson.uploadsrc,
			maxFiles:uploadMaxFileLength,
			acceptedFiles:config.supportFormat,
			dictMaxFilesExceeded:'您一次最多只能上传{{maxFiles}}个文件',
			addRemoveLinks:true,//添加移除文件
			dictInvalidFileType:'不支持上传的格式',
			dictResponseError:'文件上传失败',
			dictInvalidFileType:'文件名和类型不匹配',
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
	//ueditor
	function ueditor(config){
		config.$container = $('#'+config.fullID);
		//配置参数
		var ueditorConfig = {};
		
		if(config.formSource == 'modal'){
			//弹出框模式不需要设置宽，执行时可以获取
		}else{
			//表格模式需要强制指定宽度
			var parentWidth = config.$container.parent().outerWidth() - 30;
			config.$container.css('width',parentWidth);
		}
		
		//高度控制
		var ueditorHeight = 200;
		if(typeof(config.height)=='number'){
			ueditorHeight = config.height - 33;
		}
		ueditorConfig.autoHeightEnabled = false;
		ueditorConfig.initialFrameHeight = ueditorHeight;
		//全部功能按钮
		var fullModeBtns = [
			[
				'anchor', //锚点
				'undo', //撤销
				'redo', //重做
				'bold', //加粗
				'indent', //首行缩进
				'snapscreen', //截图
				'italic', //斜体
				'underline', //下划线
				'strikethrough', //删除线
				'subscript', //下标
				'fontborder', //字符边框
				'superscript', //上标
				'formatmatch', //格式刷
				'source', //源代码
				'blockquote', //引用
				'pasteplain', //纯文本粘贴模式
				'selectall', //全选
				'print', //打印
				'preview', //预览
				'horizontal', //分隔线
				'removeformat', //清除格式
				'time', //时间
				'date', //日期
				'unlink', //取消链接
				'insertrow', //前插入行
				'insertcol', //前插入列
				'mergeright', //右合并单元格
				'mergedown', //下合并单元格
				'deleterow', //删除行
				'deletecol', //删除列
				'splittorows', //拆分成行
				'splittocols', //拆分成列
				'splittocells', //完全拆分单元格
				'deletecaption', //删除表格标题
				'inserttitle', //插入标题
				'mergecells', //合并多个单元格
				'deletetable', //删除表格
				'cleardoc', //清空文档
				'insertparagraphbeforetable', //"表格前插入行"
				'insertcode', //代码语言
				'fontfamily', //字体
				'fontsize', //字号
				'paragraph', //段落格式
				//'simpleupload', //单图上传
				//'insertimage', //多图上传
				'edittable', //表格属性
				'edittd', //单元格属性
				'link', //超链接
				'emotion', //表情
				'spechars', //特殊字符
				'searchreplace', //查询替换
				'map', //Baidu地图
				'gmap', //Google地图
				'insertvideo', //视频
				'help', //帮助
				'justifyleft', //居左对齐
				'justifyright', //居右对齐
				'justifycenter', //居中对齐
				'justifyjustify', //两端对齐
				'forecolor', //字体颜色
				'backcolor', //背景色
				'insertorderedlist', //有序列表
				'insertunorderedlist', //无序列表
				'fullscreen', //全屏
				'directionalityltr', //从左向右输入
				'directionalityrtl', //从右向左输入
				'rowspacingtop', //段前距
				'rowspacingbottom', //段后距
				'pagebreak', //分页
				'insertframe', //插入Iframe
				'imagenone', //默认
				'imageleft', //左浮动
				'imageright', //右浮动
				'attachment', //附件
				'imagecenter', //居中
				'wordimage', //图片转存
				'lineheight', //行间距
				'edittip ', //编辑提示
				'customstyle', //自定义标题
				'autotypeset', //自动排版
				'webapp', //百度应用
				'touppercase', //字母大写
				'tolowercase', //字母小写
				'background', //背景
				'template', //模板
				'scrawl', //涂鸦
				'music', //音乐
				'inserttable', //插入表格
				'drafts', // 从草稿箱加载
				'charts', // 图表
				'kityformula', //公式插件
			]
		]
		//标准功能按钮
		var standardModeBtns = [
			[
				'source', //源代码
				'searchreplace', //查询替换
				'undo', //撤销
				'redo', //重做
				'|',

				//'simpleupload', //单图上传
				'snapscreen', //截图
				'imagenone', //默认
				'imageleft', //左浮动
				'imageright', //右浮动
				'imagecenter', //居中
				'|',

				'fontfamily', //字体
				'fontsize', //字号
				'forecolor', //字体颜色
				'bold', //加粗
				'italic', //斜体
				'underline', //下划线
				'strikethrough', //删除线
				'subscript', //下标
				'superscript', //上标
				'|',
				
				'insertorderedlist', //有序列表
				'insertunorderedlist', //无序列表
				'justifyleft', //居左对齐
				'justifyright', //居右对齐
				'justifycenter', //居中对齐
				'justifyjustify', //两端对齐
				'|',

				'horizontal', //分隔线
				'link', //超链接
				'unlink', //取消链接
				'selectall', //全选
				'print', //打印
				'preview', //预览
				'drafts', // 从草稿箱加载
				'kityformula', //公式插件
				'fullscreen', //全屏
			]
		]
		//min功能按钮
		var miniModeBtns = [
			[
				'source', //源代码
				'searchreplace', //查询替换
				'undo', //撤销
				'redo', //重做
				'|',

				//'simpleupload', //单图上传
				//'snapscreen', //截图
				//'|',

				//'fontfamily', //字体
				'fontsize', //字号
				'forecolor', //字体颜色
				'bold', //加粗
				'italic', //斜体
				'underline', //下划线
				'strikethrough', //删除线
				'subscript', //下标
				'superscript', //上标
				//'|',
				'fullscreen', //全屏
			]
		]
		//三种模式
		if(typeof(config.model)!='string'){
			config.model = 'standard';
		}
		//是否只读
		if(config.readonly){
			ueditorConfig.readonly = true;
		}
		
		switch(config.model){
			case 'all':
				ueditorConfig.toolbars = fullModeBtns;
				ueditorConfig.wordCount = true;
				ueditorConfig.elementPathEnabled = true;

				break;
			case 'standard':
				ueditorConfig.toolbars = standardModeBtns;
				ueditorConfig.wordCount = false;
				ueditorConfig.elementPathEnabled = false;
				break;
			case 'min':
				ueditorConfig.toolbars = miniModeBtns;
				ueditorConfig.wordCount = false;
				ueditorConfig.elementPathEnabled = false;
				break;
			case 'custom':
				config.toolbars = typeof(config.toolbars)=='undefined'?[]:config.toolbars;
				ueditorConfig.toolbars = [config.toolbars];
				ueditorConfig.wordCount = config.wordCount ? config.wordCount :false;
				ueditorConfig.elementPathEnabled = config.elementPathEnabled ? config.elementPathEnabled :false;
				break;
			default:
				console.error('不能识别的ueditor.model参数:'+config.model+', 仅可以使用 all standard min');
				break;
		}
		//console.warn(config.formSource);
		if(config.formSource == 'modal'){
			var fullscreenIndex = ueditorConfig.toolbars[0].indexOf('fullscreen');
			ueditorConfig.toolbars[0].splice(fullscreenIndex, 1);
		}
		config.toolbars = ueditorConfig.toolbars;
		config.ueditor =  UE.getEditor(config.fullID, ueditorConfig);
		//重新计算容器宽度
		config.ueditor.addListener( 'ready', function( editor ) {
			var $container = $(this.container);
			var containerWidth = $container.closest('.form-item.ueditor').outerWidth();
			$container.width(containerWidth);
			$container.parent().width(containerWidth);
		});
	}
	function colorpickerinput(config){
		var $color = $('#'+config.fullID);
		$preview = $color.siblings('.input-group-addon');
		var colorpickerConfig = {
			container:$color.parent(), //容器
		};
		if(typeof(config.format)=='string'){
			colorpickerConfig.format = config.format;
		}
		if(typeof(config.horizontal)=='boolean'){
			colorpickerConfig.horizontal = config.horizontal;
		}
		colorpickerConfig.template = '<div class="colorpicker">' +
			'<div class="colorpicker-saturation"><i><b></b></i></div>' +
			'<div class="colorpicker-hue"><i></i></div>' +
			'<div class="colorpicker-alpha"><i></i></div>' +
			'<div class="colorpicker-color"><div /></div>' +
			'<div class="colorpicker-selectors"></div>' +
		'</div>';
		config.sourceValue = config.value;
		$color.colorpicker(colorpickerConfig).on('changeColor',function(e){
			var value = $.trim($(this).val());
			var config = nsForm.getConfigByDom($(this));
			$(this).siblings('.input-group-addon').children('.color-preview').css('background-color',value);
			if(config.sourceValue!==value){
				config.sourceValue=value;
				if(typeof(config.changeHandler)=='function'){
					return config.changeHandler($(this));
				}
				//模拟一个公用的事件回调
				if(typeof(config.commonChangeHandler)=='function'){
					var obj = {
						value:value,
						dom:$(this),
						type:'colorpicker',
						id:config.id,
						config:config
					}
					config.commonChangeHandler(obj);
				}
			}
		})
		if(config.readonly){
			$color.colorpicker('disable');
		}
		$preview.on('click',function(ev){
			var $color = $(this).parent().children('input[type="text"]');
			$color.focus();
			$color.colorpicker('show');
		})
	}
	function uploadImage(config){
		nsForm[config.fullID] = {};
		if(!$.isEmptyObject(config.value)){
			nsForm[config.fullID] = config.value;
		}
		if(config.readonly){
			//如果为真不继续执行
			return false;
		}
		var $imgUpload = $('[ns-imgId="'+config.fullID+'"]');
		var supportArr = ['#'+config.fullID];
		$imgUpload.dropzone({
			url:config.url,
			paramName:config.fullID,
			acceptedFiles:'image/*',
			maxFiles:1,
			clickable:supportArr,
			dictDefaultMessage:language.common.nscomponent.select2BoxIt.dictDefaultMessage,
			dictMaxFilesExceeded:language.common.nscomponent.select2BoxIt.dictMaxFilesExceeded,
			dictInvalidFileType:language.common.nscomponent.select2BoxIt.dictInvalidFileType,
			dictResponseError:language.common.nscomponent.select2BoxIt.dictResponseError,
			dictInvalidFileType:language.common.nscomponent.select2BoxIt.dictInvalidFileType,	
			init:function(){
				this.on('thumbnail',function(thumb,dataUrl){
					
				});
				this.config = config;
				//初始化完成监听上传之后的成功和失败事件
				this.on('success',function(file,data){
					this.removeFile(file);
					var returnObj = {};
						returnObj.data = data;
						returnObj.file = file;
						returnObj.fileInputId = $(this.element);
					var config = this.config;
					var saveData = config.changeHandler(returnObj);
					nsForm[config.fullID] = saveData;
					$(this.element).children('label').remove();
					$(this.element).children().children().removeClass('hide');
					$(this.element).children().children('img').attr('src',saveData[config.textField]);
					$(this.element).children().children('img').attr('ns-id',saveData[config.valueField])
				});
				this.on('error',function(file,errorMessage){
					nsAlert(errorMessage)
					this.removeFile(file);
				})
			},
		});
		$imgUpload.children().children('.fa.fa-close').off('click');
		$imgUpload.children().children('.fa.fa-close').on('click',function(ev){
			ev.stopPropagation();
			var imgID = $(this).parent().parent().attr('ns-imgId');
			var eleID = $(this).parent().parent().attr('ns-id');
			var formID = imgID.substring(5,imgID.length-eleID.length-1);
			var config = nsFormBase.form[formID].component[eleID];
			if($(this).parent().parent('div').children('label').length > 0){
				$(this).parent().parent('div').children('label').remove();
			}
			$(this).parent().parent('div').append('<label>'+config.label+'</label>');
			$(this).parent().parent('div').children().not('label').addClass('hide');
			var nId = $(this).prev('img').attr('ns-id');
			if(typeof(config.delFileHandler)=='function'){
				config.delFileHandler(nId);
			}
		});
	}	
	function photoImage(config){
		var exportBtnId = config.fullID+'-exportbtn';
		var $exportBtn = $('#'+exportBtnId);
		$exportBtn.dropzone({
			clickable:true,
			url:config.url,
			paramName:exportBtnId,
			acceptedFiles:'image/*',
			maxFiles:1,
			dictDefaultMessage:language.common.nscomponent.select2BoxIt.dictDefaultMessage,
			dictMaxFilesExceeded:language.common.nscomponent.select2BoxIt.dictMaxFilesExceeded,
			dictInvalidFileType:language.common.nscomponent.select2BoxIt.dictInvalidFileType,
			dictResponseError:language.common.nscomponent.select2BoxIt.dictResponseError,
			dictInvalidFileType:language.common.nscomponent.select2BoxIt.dictInvalidFileType,	
			init:function(){
				this.on('thumbnail',function(thumb,dataUrl){
					
				});
				this.config = config;
				//初始化完成监听上传之后的成功和失败事件
				this.on('success',function(file,data){
					this.removeFile(file);
					var config = this.config;
					if(typeof(data)=='string'){data = JSON.parse(data);}
					var rowData = data;
					if(config.dataSrc){
						rowData = data[config.dataSrc];
					}
					var imageUrl = rowData[0][config.textField];
					imageUrl = imageUrl.replace(/\\/g,"/");
					var imageHtml = '<div class="user-photo-img">'
							+'<img src="'+imageUrl+'" alt="" />'
						+'</div>';
					$(this.element).closest('.user-photo').children('.user-photo-img').remove();
					$(this.element).closest('.user-photo').append(imageHtml);
					$(this.element).parent().children('.user-photo-upload').addClass('hide');
					var returnObj = {
						data:data,
						file:file,
						fileInputId:$(this.element)
					};
					if(typeof(config.changeHandler)=='function'){
						config.changeHandler(returnObj);
					};
					nsForm[config.fullID] = rowData[0];
				});
				this.on('error',function(file,errorMessage){
					nsAlert(errorMessage)
					this.removeFile(file);
				})
			},
		})
		/*imageHtml = '<div class="user-photo-img">'
							+'<img src="'+picUrl+'" alt="图片" id="'+config.fullID+'-image" class="'+picClassStr+'" ns-id="'+value[config.valueField]+'" />'
							+'<i class="fa fa-close"></i>'
						+'</div>';*/
	}
	function getGraphicsInput(config){
		var $star = $('#'+config.fullID);
		var maxnum = config.max;//星星数量
		var step = config.step;//刻度值
		var starHtml = '';
		var emptyStarHtml = '';
		var fillStarHtml = '';
		for(var i=0;i<maxnum;i++){
			emptyStarHtml += '<span class="star"><i class="icon-star-o"></i></span>';
			fillStarHtml += '<span class="star"><i class="icon-star"></i></span>';
		}
		var sizeStr = typeof(config.size) == 'string' ? config.size : '';
		var sizeClassStr = '';
		if(sizeStr == 's'){sizeClassStr = 'star-sm';}else if(sizeStr == 'm'){sizeClassStr = 'star-md';}
		starHtml = '<div class="graphics-score-star '+sizeClassStr+'">'
						+'<div class="empty-star">'+emptyStarHtml+'</div>'
						+'<div class="fill-star">'+fillStarHtml+'</div>'
					+'</div>';
		var $graphicsInput = $star.parent();
		$graphicsInput.prepend(starHtml);
		var defaultStr = typeof(config.value) == 'function' ? config.value() : config.value;
		var $graphicsDiv = $graphicsInput.children('.graphics-score-star');
		var $emptyDiv = $graphicsDiv.children('.empty-star');
		var $fillDiv = $graphicsDiv.children('.fill-star');
		var emptyDivWidth = $emptyDiv.outerWidth();
		$graphicsDiv.css({'width':emptyDivWidth+'px'});
		var cLeft = $graphicsDiv.offset().left;
		var cWidth = $graphicsDiv.outerWidth();
		var data = {
			left:cLeft,
			width:cWidth,
			max:maxnum,
			step:step,
			$fillDiv:$fillDiv,
			$input:$star
		};

		if(typeof(defaultStr)=='number'){
			var width = Math.round((defaultStr/maxnum)*100)+'%';
			$fillDiv.css({'width':width});
		}
		if(config.formSource == 'modal'){
			window.setTimeout(function(){
				var emptyDivWidth = $emptyDiv.outerWidth();
				$graphicsDiv.css({'width':emptyDivWidth+'px'});
				var cLeft = $graphicsDiv.offset().left;
				var cWidth = $graphicsDiv.outerWidth();
				var data = {
					left:cLeft,
					width:cWidth,
					max:maxnum,
					step:step,
					$fillDiv:$fillDiv,
					$input:$star
				};
				$graphicsDiv.off('mouseenter');
				$graphicsDiv.on('mouseenter',{data:data},graphicsMouseHanlder);
			},500)
		}
		$graphicsDiv.off('mouseenter');
		$graphicsDiv.on('mouseenter',{data:data},graphicsMouseHanlder);
		function graphicsMouseHanlder(ev){
			$graphicsDiv.off('mouseenter');
			$graphicsDiv.off('mousemove');
			var data = ev.data.data;
			$graphicsDiv.on('mousemove', function(moveEvent){
				var pageX = moveEvent.pageX;
				pageX = pageX - data.left;
				var percent = (pageX/data.width)*100;
				percent = Math.round(percent);
				data.$fillDiv.css({'width':percent+'%'});
			});
			$graphicsDiv.off('mousedown');
			$graphicsDiv.on('mousedown',function(downEvent){
				$graphicsDiv.off('mousedown');
				$graphicsDiv.off('mousemove');
				$graphicsDiv.on('mouseleave',function(leaveEvent){
					$graphicsDiv.off('mouseleave');
					$graphicsDiv.on('mouseenter',{data:data},graphicsMouseHanlder);
				})
				var pageX = downEvent.pageX;
				pageX = pageX - data.left;
				var percent = pageX/data.width;
				var setValue = (data.max * percent) * (1/data.step);
				setValue = Math.round(setValue);
				setValue = setValue / (1/data.step);
				data.$input.val(setValue);
				data.$fillDiv.css({'width':Math.round((setValue/data.max)*100)+'%'});
			})
		}
	}
	function getCodeMirrorInput(config){
		var $input = $('#'+config.fullID);
		var valueStr = config.value;
		if(typeof(valueStr)=='function'){valueStr = value();}
		var defaultConfig = {
			lineNumbers:true,
			value:valueStr,
			mode:'javascript'
		}
		if(config.mode){defaultConfig.mode = config.mode;}
		if(typeof(config.indentUnit)=='number'){defaultConfig.indentUnit = config.indentUnit;}
		if(typeof(config.smartIndent)=='boolean'){defaultConfig.smartIndent = config.smartIndent;}
		nsComponent.codeMirror[config.fullID] = {};
		switch(config.formSource){
			case 'dialog':
			case 'modal':
				setTimeout(function(){
					var editor = CodeMirror.fromTextArea($input[0],defaultConfig);
					nsComponent.codeMirror[config.fullID].$editor = editor;
				},500)
				break;
			case 'form':
			case 'formDialog':
				var editor = CodeMirror.fromTextArea($input[0],defaultConfig);
				nsComponent.codeMirror[config.fullID].$editor = editor;
				break;
		}
	}
	function webupload(config){ 
		//需要触发的事件
		var uploadConfig = {
			uploadUrl:config.uploadSrc,
			checkExistsUrl: config.validSrc,
			deleteFileUrl: config.delSrc,
			changeHandler:config.changeHandler,
			readonly:config.readonly
		}
		config.uploadConfig = uploadConfig;
	}
	function numrange(config){
		// 需要触发的事件
		// 引入js的触发事件
		numrangeComponent.init(config);
	}
	function expression(config){
		// 在这里初始化
		nsUI.expContent.init(config);
	}
	function multiselect(config){
		var configObj = $.extend(true,{},config);
		configObj.multiID = 'multiple-'+config.id;
		configObj.id = 'multi-select-'+config.id;
		nsMultiSelect.multiSelectInit(configObj);	
	}
	function attachCheckBox(config){
		var fullId = config.fullID;
		var id = config.id;
		var formId = fullId.substring(0,fullId.length-id.length-1);
		var $container = $('#'+formId+'-'+config.attachFieldId);
		var disabledAttr = config.disabled ? 'disabled' : '';
		var checkedAttr = config.checked ? 'checked' : '';
		var html = '<div class="attach-checkbox">'
						+'<label class="checkbox-inline '+disabledAttr+' '+checkedAttr+'" for="'+ config.fullID+'">'
						+'</label>'
						+'<input id="'+ config.fullID+'"'
							+'name="'+config.fullID+'"'
							+' ns-id="'+config.id+'"'
							+' nstype="'+config.type+'" type="checkbox" '
							+checkedAttr+' '+disabledAttr+'  class="checkbox-options">'
					+'</div>';
		$container.parent().append(html);
		$container.parent().addClass('form-item-attach-checkbox');
		$container.closest('.form-td').addClass('form-td-attach-checkbox');
		var $dom = $('#'+config.fullID);
		setCommonAttr($dom,config);
		$dom.off('change');
		$dom.on('change',function(ev){
			ev.stopPropagation();
			var $this = $(this);
			var $label = $this.parent().children('label.checkbox-inline');
			$label.toggleClass('checked');
			var isChecked = false;
			if($label.hasClass('checked')){isChecked = true;}
			if(typeof(config.changeHandler)=='function'){
				config.changeHandler({isChecked:isChecked});
			}
		});
	}
	//多值输入组件
	function valuesInput(configs){
		$.each(configs, function(id,config){
			nsUI.valuesInput.init(config);
		})
	}
	//时间日期输入组件
	function dateTimeInput(configs){
		$.each(configs, function(id,config){
			nsUI.dateTimeInput.init(config);
		})
	}
	//项目选择器
	function projectSelect(config){
		var $container = $('#'+config.fullID);
		$container.on('click',function(ev){
			if(typeof(config.beforeHandler)=='function'){
				config = config.beforeHandler(config);
			}
			var obj = $.extend(true,{},config.params);
			var formId = config.fullID.substring(5,config.fullID.length-config.id.length-1);
			obj.confirmHandler = function(data){
				var array = data.array;
				var textField = obj.listAjax.textField;
				var valueField = obj.listAjax.valueField;
				var html = '';
				for(var arrI=0; arrI<array.length; arrI++){
					html += '<span class="project-select-text" ns-id="'+array[arrI][valueField]+'">'+array[arrI][textField]+'</span>';
				}
				$container.html(html);
				nsForm.data[formId].formInput[config.id].saveData = data;
			}
			nsUI.projectSelect.clear();
			nsUI.projectSelect.init(obj);
		})
	}
	// 工作流
	function flowchartviewer(config){
		config.containerId = config.fullID;
		var $dom = $('#'+config.fullID);
		setCommonAttr($dom,config);
		switch(config.formSource){
			case 'form':
				nsUI.flowChartViewer.init(config);
				break;
			case 'modal':
				// 弹框情况下弹框完全显示后生成工作流
				break;
		}
	}
	return {
		setCommonAttr:setCommonAttr,
		setFormJson:setFormJson,
		text:text,
		textBtn:textBtn,
		transactorBtn:transactorBtn,
		radio:radio,
		checkbox:checkbox,
		select:select,
		selectBoxIt:selectBoxIt,
		select2:select2,
		select2BoxIt:select2BoxIt,
		date:date,
		datetime:datetime,
		daterangepicker:daterangepicker,
		uploadSingle:uploadSingle,
		typeahead:typeahead,
		typeaheadTemplate:typeaheadTemplate,
		removeError:removeError,
		hidden:hidden,
		selectText:selectText,
		textSelect:textSelect,
		selectDate:selectDate,
		selectSelect:selectSelect,
		uploadObj:uploadObj,
		setCommonAttr:setCommonAttr,
		scientificInput:scientificInput,
		powerInput:powerInput,
		modelSelector:modelSelector,
		ueditor:ueditor,
		colorpickerinput:colorpickerinput,
		uploadImage:uploadImage,
		getGraphicsInput:getGraphicsInput,
		timepicker:timepicker,
		getCodeMirrorInput:getCodeMirrorInput,
		daterangeRadio:daterangeRadio,
		webupload:webupload,
		photoImage:photoImage,
		numrange:numrange,
		multiselect:multiselect,
		expression:expression,
		attachCheckBox:attachCheckBox,
		valuesInput:valuesInput,
		dateTimeInput:dateTimeInput,
		projectSelect:projectSelect,
		flowchartviewer:flowchartviewer,
	}
})(jQuery);
// 不规范值的转换
nsComponent.setIrregularCharge = function(config,formJson){
	if(formJson.formSource == 'form'){
		if(config.type == 'upload'){
			config.type = 'uploadSingle';
		}
	}
	//类型定义不规范的转换
	switch(config.type){
		case 'upload_single':
		case 'upload-single':
			config.type = 'uploadSingle';
			break;
		case 'tree-select':
			config.type = 'treeSelect';
			break;
		case 'text-btn':
			config.type = 'textBtn';
			break;
		case 'person-select':
			config.type = 'personSelect';
			break;
		case 'add-select-input':
			config.type = 'addSelectInput';
			break;
		case 'province-select':
			config.type = 'provinceSelect';
			break;	
		case 'provincelink-select':
			config.type = 'provincelinkSelect';
			break;
		case 'select-province':
			config.type = 'selectProvince'
			break;
		case 'daterangepicker':
			config.type = 'daterange';
			break;
		case 'organiza-select':
			config.type = 'organizaSelect';
			break;
		case 'input-select':
			//输入下拉框
			config.type = 'inputSelect';
			break;
		case 'person-select-system':
			config.type = 'personSelectSystem';
			break;
		case 'scientific-input':
			//科学计数法
			config.type = 'scientificInput';
			break;
		case 'power-input':
			//幂的几次方
			config.type = 'powerInput';
			break;
		case 'model-selector':
			config.type = 'modelSelector';
			break;
	}
	//特殊不规范定义的value值转换
	switch(config.type){
		case 'uploadSingle':
			if(typeof(config.value) == 'undefined'){
				//支持原来的subdata赋值替换成最新的value赋值统一
				config.value = config.subdata;
			}
			break;
		case 'treeSelect':
			if(typeof(config.value) == 'string' && typeof(config.text) == 'string'){
				config.value = {value:config.value,text:config.text};
			}
			break;
	}
	//不规范定义ajax参数的转换
	switch(config.type){
		case 'select2':
		case 'inputSelect':
			if(typeof(config.data) == 'undefined'){
				config.data = config.params;
			}
			break;
		case 'treeSelect':
			if(typeof(config.method) == 'undefined'){
				config.method = config.treeType;
			}
			break;
		case 'uploadSingle':
			//uploadSingle不规范的url参数
			if(typeof(config.url) == 'undefined'){
				config.url = config.uploadSrc;
			}
			break;
	}
	//不规范定义readonly属性的转换
	switch(config.type){
		case 'select':
		case 'select2':
		case 'radio':
		case 'checkbox':
			if(typeof(config.readonly) == 'undefined'){
				config.readonly = config.disabled;
			}
			break;
		case 'modelSelector':
			config.readonly = true;
			break;
	}
	if(typeof(config.column)=='string'){config.column = Number(config.column)}
	config.rules = typeof(config.rules) == 'undefined' ? '' : config.rules;
	if(config.rules == ''){
		delete config.rules;
	}else{
		//不规范的验证
		switch(config.type){
			case 'select':
			case 'select2':
			case 'uploadSingle':
			case 'radio':
			case 'checkbox':
				config.rules = config.type;
				break;
			case 'typeahead':
			case 'typeaheadtemplate':
			case 'selectProvince':
				config.rules = 'required';
				break;
			case 'personSelect':
			case 'personSelectSystem':
				if(config.rules.indexOf(':')>-1){
					var rulesStr = config.rules;
					config.rules = rulesStr.replace(':','=');
				}
				break;
		}
	}

	if(config.type == 'provinceSelect'){
		config.column = 4;
		config.setRange = typeof(config.setRange) == 'object' ? config.setRange : {};
	}

	//subdata值
	switch(config.type){
		case 'select2':
			if(typeof(config.subdata) == 'undefined'){
				if($.isArray(config.data)){
					config.subdata = config.data;
					config.textField = 'text';
					config.valueField = 'id';
				}
			}
			break;
	}
	return config;
}
// 设定默认值
nsComponent.setDefault = function(config, formJson){
	//开启debug模式
	if(debugerMode){
		if(typeof(config.element) == 'string'){
			if(config.element!='label' && config.element!='title' && config.element!='hr' && config.element!='br'){
				console.error(language.common.nscomponent.setDefault.element);
				console.error(config);
			}
		}
		switch(config.type){
			case 'uploadSingle':
			case 'uploadImage':
				if(config.url === ''){
					console.log(language.common.nscomponent.setDefault.uploadSingle);
					console.log(config);
				}
				break;
		}
	}
	
	//默认设置隐藏属性为false
	config.hidden = typeof(config.hidden) == 'boolean' ? config.hidden : false;
	//默认设置只读属性为false
	if(typeof(config.readonly)!='boolean'){
		config.readonly = false;
	}
	//设置disabled
	config.disabled = typeof(config.disabled) == 'boolean' ? config.disabled : false;
	//默认value值为空
	if(typeof(config.value) == 'undefined'){
		config.value = '';
	}
	//保存完整ID
	config.fullID = "form-"+formJson.id+"-"+config.id;
	//获取表格基本属性
	if( formJson.formSource == 'halfScreen' ||  // 半屏
		formJson.formSource == 'fullScreen' ||  // 全屏
		formJson.formSource == 'inlineScreen' ||  // 行内
		formJson.formSource == 'staticData' 	    // 功能
		){
		// 移动端
		// 在字段配置中添加半屏/全屏/行内/功能属性配置
		// formSource默认读取当前表单配置的formSource更多配置且是半屏配置时更多为全屏
		config.formSource = formJson.formSource;
		config.formID = formJson.id;
		if(config.mindjetFieldPosition == 'field-more'&&formJson.formSource == 'halfScreen'){
			// 半屏模式下更多中的字段是全屏
			config.formSource = 'fullScreen';
		}
	}else{
		// pc
		config.formSource = formJson.formSource; //普通表格是form,弹框是modal
		config.formID = formJson.id;
	}
	//设置cloumn默认值
	if(typeof(config.column)=='number'){
		if(config.column>12 || config.column<0){
			if(debugerMode){
				console.warn(language.common.nscomponent.setDefault.columnRangeA+config.column+language.common.nscomponent.setDefault.columnRangeB);
			}
			config.column = undefined;
		}
	}
	switch(config.type){
		//富文本编辑器默认是12宽
		case 'ueditor':
			if(typeof(config.column)=='undefined'){
				config.column = 12;
			}
			break;
	}
	if(typeof(config.column)=='undefined'){
		switch(formJson.formType){
			case 'plane' : 
				config.column = 0;  //面板类默认为0 连续
				break;
			case 'form':
				config.column = 3;  //标准表单默认为3 一行四个
				break;
			case 'modal':
				config.column = 12; //弹出框默认为12 整行
				break;
		}
	}
	//根据类型的特殊处理
	switch(config.type){
		case 'checkbox':
			config.onlyshowone = typeof(config.onlyshowone) == 'boolean' ? config.onlyshowone : false; //lyw 仅显示一个选项 居中 只有subdata只有一个是才有用
			config.displayClass = typeof(config.displayClass) == "string" ? config.displayClass : "checkbox";
			break;
		case 'date':
			if(typeof(config.format)!='string'){
				config.format = nsVals.default.momentDate;
			}
			break;
		case 'scientificInput':
			config.isShowone = typeof(config.isShowone) == 'boolean' ? config.isShowone : true;
			break;
		case 'daterangeRadio':
			config.rangeType = typeof(config.rangeType) == 'string' ? config.rangeType : 'before';
			break;
		case 'attachCheckBox':
			config.disabled = typeof(config.disabled) == "boolean" ? config.disabled : false;
			config.checked = typeof(config.checked) == "boolean" ? config.checked : false;
			config.isPrevFieldAttach = typeof(config.isPrevFieldAttach) == 'boolean' ? config.isPrevFieldAttach : false;
			break;
	}
	config.placeholder = nsComponent.getPlaceHolder(config);
	// 根据config相关配置设置 mobileSign（手机标记）
	if(config.formSource == 'inlineScreen'){
		if(config.rules){
			if(config.rules.indexOf('required')>-1 ||
				config.rules == 'radio'
				){
				config.mobileSign = 'required';
			}
		}
		if(config.mindjetFieldPosition == 'field-more'){
			config.mobileSign = 'delete';
		}
	}
	// 添加宽度
  	switch(config.formSource){
		case 'halfScreen':  	// 半屏
		case 'fullScreen':  	// 全屏
		case 'inlineScreen': 	// 行内
			break;
		case 'staticData':    	// 静态数据 该模式下数据都不能
		default:
			break;
	}
	//textField,valueField 
	switch(config.type){
		case 'select':
		case 'select2':
		case 'radio':
		case 'checkbox':
		case 'uploadSingle':
		case 'treeSelect':
		case 'inputSelect':
			if(typeof(config.textField)!='string'){
				config.textField = 'text';
			}
			if(typeof(config.valueField)!='string'){
				config.valueField = 'value';
			}
			break;
	}
	//人员选择器
	switch(config.type){
		case 'personSelect':
			//不使用vaild验证，改变验证名称 config.sRules为人员选择器单独的验证规则
			config.sRules =  config.rules;
			delete config.rules;
		case 'personSelectSystem':
			config.isUsedHistory = typeof(config.isUsedHistory) == 'boolean' ? config.isUsedHistory : true;
			break;
	}
	//AJAX相关参数默认值
	switch(config.type){
		case 'select':
		case 'select2':
		case 'radio':
		case 'checkbox':
			//处理ajax相关参数
			if(typeof(config.url)!='string' && typeof(config.url) !='function'){
				delete config.url;
			}else{
				if(config.url==''){
					delete config.url;
				}else{
					//如果url可用
					if(typeof(config.method)!='string'){
						config.method = 'GET';
					}
					if(typeof(config.data)!='object'){
						config.data = {};
					}
					if(typeof(config.subdata)!='undefined'){
						delete config.subdata;
						if(debugerMode){
							console.warn(language.common.nscomponent.setDefault.appointUrl)
							console.warn(config);
						}
					}
				}
			}
			//如果没有url，则所有没用参数删除
			if(typeof(config.url)=='undefined'){
				if(typeof(config.method)!='undefined'){
					delete config.method;
				}
				if(typeof(config.data)!='undefined'){
					delete config.data;
				}
				if(debugerMode){
					if(typeof(config.subdata)!='object'){
						console.error(language.common.nscomponent.setDefault.configSubdata)
						console.error(config);
					}
				}
			}else{
				// 如果有url表示
				config.ajaxConfig = {
					url:config.url,
					type:config.method,
					data:config.data,
				}
				if(typeof(config.dataSrc)=='string'){
					config.ajaxConfig.dataSrc = config.dataSrc;
				}
				if(typeof(config.contentType)=='string'){
					config.ajaxConfig.contentType = config.contentType;
				}
			}
			
		break;
	}
	//属性默认值
	switch(config.type){
		case 'select2':
			config.isServiceMode = typeof(config.isServiceMode) == 'boolean' ? config.isServiceMode : false;
			config.multiple = typeof(config.multiple) == 'boolean' ? config.multiple : false,
			config.filltag = typeof(config.filltag) == 'boolean' ? config.filltag : false;
			config.isAllowClear = typeof(config.isAllowClear) == 'boolean' ? config.isAllowClear : true;
			config.maximumItem = Number(config.maximumItem);
			config.maximumItem = typeof(config.maximumItem) == 'number' ? config.maximumItem : 3;
			config.isCloseSearch = typeof(config.isCloseSearch) == 'number' ? config.isCloseSearch : 2;
			break;
		case 'uploadSingle':
			config.supportFormat = typeof(config.supportFormat) == 'string' ? config.supportFormat : '';
			config.ismultiple = typeof(config.ismultiple) == 'boolean' ? config.ismultiple : false;
			config.isAllowFiles = config.isAllowFiles ? config.isAllowFiles : 1;
			config.isAllowFiles = Number(config.isAllowFiles);
			break;
		case 'flowchartviewer':
			break;
	}
	if(typeof(formJson.sortObj)!='object'){formJson.sortObj = {};}
	if(typeof(config.element) == 'string'){
		config.type = config.element;
		if(typeof(formJson.sortObj[config.type])=='undefined'){
			formJson.sortObj[config.type] = 0;
		}else{
			formJson.sortObj[config.type] ++;
		}
		config.fullID = "form-"+formJson.id+'-element'+formJson.sortObj[config.type];
		config.id = 'element'+formJson.sortObj[config.type];
	}
	if(typeof(config.note) == 'string'){
		config.type = 'note';
		if(typeof(formJson.sortObj[config.type])=='undefined'){
			formJson.sortObj[config.type] = 0;
		}else{
			formJson.sortObj[config.type] ++;
		}
		config.fullID = "form-"+formJson.id+'-note'+formJson.sortObj[config.type];
		config.id = 'note'+formJson.sortObj[config.type];
	}
	if(typeof(config.html) == 'string'){
		config.type = 'html';
		if(typeof(formJson.sortObj[config.type])=='undefined'){
			formJson.sortObj[config.type] = 0;
		}else{
			formJson.sortObj[config.type] ++;
		}
		config.fullID = "form-"+formJson.id+'-html'+formJson.sortObj[config.type];
		config.id = 'html'+formJson.sortObj[config.type];
	}
	return config;
}
/**
 * 获取组件HTML代码
 * 会对组件的config配置文件进行属性操作
 * 返回 html
 */
nsComponent.getHTML = function(config, formJson){
	//config是组件的配置，必须是obj，组件必须有ID
	//formJson是表单配置
	
	//原本的代码中table和upload组件中的表格错误定义为column，不符合后期规则，修改为columnConfig lyw 20180913
	switch(config.type){
		case 'table':
			if($.isArray(config.column)){
				config.columnConfig = $.extend(true,[],config.column);
				delete config.column;
			}
			config.dataFormat = typeof(config.dataFormat)!='string'?'none':config.dataFormat;
			if(config.dataFormat == 'ids'){
				if(typeof(config.idField) != 'string'){
					config.idField = '';
					console.error('表单类型type:table配置错误，idField必填');
					console.error(config);
				}
			}
			break;
		case 'upload':
			if($.isArray(config.column)){
				config.columnConfig = $.extend(true,[],config.column);
				delete config.column;
			}
			break;
		case 'transactor':
			// lyw 20180926
			// 验证办理人中ajax和subdata是否全部配置
			var validNameObj = {
				user:['userOfOtherActivity'],
				role:['role','candidateDept','deptOfOtherActivity'],
				post:['postId','candidateDept','deptOfOtherActivity'],
				dept:['candidateDept'],
				group:['candidateGroup'],
			}
			for(var attr in validNameObj){
				if(typeof(config[attr]) == 'undefined'){
					console.error('表单类型type:transactor配置错误，'+attr+'必填');
					console.error(config);
					config[attr] = {};
				}
				for(var i=0;i<validNameObj[attr].length;i++){
					if(typeof(config[attr][validNameObj[attr][i]]) == 'undefined'){
						console.error('表单类型type:transactor配置错误，'+attr+'的属性'+validNameObj[attr][i]+'必填');
						console.error(config);
						config[attr][validNameObj[attr][i]] = {
							valueField:'id',
							textField:'name',
						};
					}else{
						var attrObj = config[attr][validNameObj[attr][i]];
						if(typeof(attrObj.textField) == 'undefined'){
							attrObj.textField = 'name'
						}
						if(typeof(attrObj.valueField) == 'undefined'){
							attrObj.valueField = 'id'
						}
						if(typeof(attrObj.url) == 'undefined'&&typeof(attrObj.subdata) == 'undefined'){
							attrObj.subdata = [];
							console.error('表单类型type:transactor配置错误，'+attr+'的属性'+validNameObj[attr][i]+'：url或subdata必填');
							console.error(config);
						}
					}
				}
			}
			// 验证人员配置
			if(typeof(config.user.candidateUsers) == 'undefined'){
				console.error('表单类型type:transactor配置错误，candidateUsers必填');
				console.error(config);
			}else{
				if(typeof(config.user.candidateUsers.personAjax) == 'undefined'||typeof(config.user.candidateUsers.groupAjax) == 'undefined'){
					console.error('表单类型type:transactor配置错误，candidateUsers的personAjax和groupAjax必填');
					console.error(config);
				}
			}
			if(config.value){
				// 处理value值
				config.sourceValue = $.extend(true,[],config.value);
				/*格式化value 删除没有用的空对象 验证是否有重复删除重复*/
				// 格式化对象 删除空对象
				function getFormatValObj(souValObj){
					var formatObj = {};
					for(var attr in souValObj){
						if(attr == 'type'){
							continue;
						}
						if(souValObj[attr] == 'true'){
							souValObj[attr] = true;
						}
						if(souValObj[attr] == 'false'){
							souValObj[attr] = false;
						}
						if(souValObj[attr]!=''&&souValObj[attr]){
							formatObj[attr] = souValObj[attr];
						}
					}
					return formatObj;
				}
				var valueArr = config.value;
				var formatValArr = []; // 格式化后的value
				for(var i=0;i<valueArr.length;i++){
					var valueContent = valueArr[i];
					if(typeof(valueContent.type)!='string'){
						continue;
					}
					var formatValObj = getFormatValObj(valueContent);
					if($.isEmptyObject(formatValObj)){
					}else{
						formatValObj.type = valueContent.type;
						formatValArr.push(formatValObj)
					}
				}
				var delValArr = []; // 删除重复数据获得value
				for(var i=0;i<formatValArr.length;i++){
					var isRepeat = false;
					for(var j=0;j<delValArr.length;j++){
						isRepeat = nsVals.isEqualObject(delValArr[j],formatValArr[i]);
					}
					if(!isRepeat){
						delValArr.push(formatValArr[i]);
					}
				}
				config.value = delValArr;
			}
			break;
	}
	
	if(debugerMode){
		//类型是table表格的没有验证类型
		if(config.type != 'table'){
			var parametersArr = 
			[
				[config,'object',true],
				[formJson,'object',true]
			]
			nsDebuger.validParameter(parametersArr);
			var validArr = 
			[
				['id','string number',true],
				['type','string',true],
				['readonly','boolean'],
				['label','string number'],
				['plusClass','string'],
				['plusStyle','string'],
				['column','number'],
				['hidden','boolean'],
				['element','string'],
				['rules','string'],
				['onKeyChange','boolean'],
			]
			nsDebuger.validOptions(validArr,config);
		}
	}
	nsComponent.part.init(config, formJson);
	//输出HTML
	var inputHtml = '';
	switch(config.type){
		case 'text':
		case 'password':
		case 'number':
			inputHtml = nsComponent.part.getTextInput();
			break;
		case 'provinceSelect':
			inputHtml = nsComponent.part.getProvinceSelect();
			break;
		case 'provincelinkSelect':
			inputHtml = nsComponent.part.getProvinceLinkSelect();
			break;
		case 'codeMirror':
			inputHtml = nsComponent.part.getHtmlByCodeMirror();
			break;
		case 'hidden':
			inputHtml = nsComponent.part.getHidden();
			break;
		case 'radio':
			inputHtml = nsComponent.part.getRadio();
			break;
		case 'daterangeRadio':
			inputHtml = nsComponent.part.getDaterangeRadio();
			break;
		case 'checkbox':
			inputHtml = nsComponent.part.getCheckbox();
			break;
		case 'select':
			inputHtml = nsComponent.part.getSelect();
			break;	
		case 'date':
			inputHtml = nsComponent.part.getDatePicker();
			break;
		case 'timer':
			inputHtml = nsComponent.part.getTimePicker();
			break;
		case 'datetime':
			inputHtml = nsComponent.part.getDatetimePicker();
			break;
		case 'daterange':
			inputHtml = nsComponent.part.getDateRangePicker();
			break;
		case 'uploadSingle':
			inputHtml = nsComponent.part.getSingleUpload();
			break;
		case 'uploadImage':
			inputHtml = nsComponent.part.getUploadImage();
			break; 
		case 'textarea':
			inputHtml = nsComponent.part.getTextareaInput();
			break;
		case 'textBtn':
			inputHtml = nsComponent.part.getTextbtnInput();
			break;
		case 'treeSelect':
			inputHtml = nsComponent.part.getTreeSelect();
			break;
		case 'personSelect':
			inputHtml = nsComponent.part.getPersonSelect();
			break;
		case 'scientificInput':
			//科学计数法
			inputHtml = nsComponent.part.getScientificinput();
			break;
		case 'powerInput':
			//幂的几次方
			inputHtml = nsComponent.part.getPowerinput();
			break;
		case 'modelSelector':
			//车型选择器
			inputHtml = nsComponent.part.getModelselector();
			break;
		case 'personSelectSystem':
			inputHtml = nsComponent.part.getPersonSelectSystem();
			break;
		case 'select2':
			inputHtml = nsComponent.part.getSelect2();
			break;
		case 'typeahead':
			inputHtml = nsComponent.part.getTypeahead();
			break;
		case 'typeaheadtemplate':
			inputHtml = nsComponent.part.getTypeaheadTemplate();
			break;
		case 'addSelectInput':
			inputHtml = nsComponent.part.getAddSelectInput();
			break;
		case 'organizaSelect':
			inputHtml = nsComponent.part.getOrganizaSelect();
			break;
		case 'html':
			inputHtml = config.html;
			break;
		case 'note':
			//注释类型
			inputHtml = '<blockquote>'
						+'<p>'+config.note+'</p>'
					+'</blockquote>';
			break;
		case 'hr':
			//横线
			inputHtml = '<div class="col-xs-12 element-hr"><hr></div><div class="clearfix"></div>';
			break;
		case 'br':
			inputHtml = '<div class="col-xs-12 element-br"></div><div class="clearfix"></div>';
			break;
		case 'title':
			//标题
			inputHtml = '<div class="col-xs-12 element-title"><label>'
							+'<i class="fa fa-arrow-circle-down"></i> '
							+nsComponent.part.getFormLabel()
						+'</label></div>';
			break;
		case 'label':
			inputHtml = nsComponent.part.getFormElementLable();
			break;
		case 'textSelect':
			inputHtml = nsComponent.part.getTextselect();
			break;
		case 'selectText':
			inputHtml = nsComponent.part.getSelecttext();
			break;
		case 'selectDate':
			inputHtml = nsComponent.part.getSelectdate();
			break;
		case 'selectSelect':
			inputHtml = nsComponent.part.getSelectselect();
			break;
		case 'table':
			inputHtml = nsComponent.part.getTable();
			break;
		case 'inputSelect':
			inputHtml = nsComponent.part.getInputselect();
			break;
		case 'upload':
			inputHtml = nsComponent.part.getUpload();
			break;
		case 'ueditor':
			inputHtml = nsComponent.part.getUEditor();
			break;
		case 'colorpickerinput':
			inputHtml = nsComponent.part.getColorPicker();
			break;
		case 'graphicsInput':
			inputHtml = nsComponent.part.getGraphicsInput();
			break;
		case 'baidumap':
			config.column = 12;
			inputHtml = nsComponent.part.getBaiduMapInput();
			break;
		case 'webupload':
			inputHtml = nsComponent.part.getWebUploadHtml();
			break;
		case 'photoImage':
			inputHtml = nsComponent.part.getPhotoImageHtml();
			break;
		case 'numrange':
			inputHtml = nsComponent.part.getNumRangeHtml();
			break;
		case 'multiselect':
			inputHtml = nsComponent.part.getMultiselectHtml();
			break;
		case 'expression':
			inputHtml = nsComponent.part.getExpressionHtml();
			break;
		case 'valuesInput':
			//格式化多值input cy 20180829
			inputHtml = nsComponent.part.getValuesInputHtml();
			break;
		case 'dateTimeInput':
			//格式化日期时间输入组件 cy 20180831
			inputHtml = nsComponent.part.getDateTimeInputHtml();
			break;
		case 'attachCheckBox':
			inputHtml = nsComponent.part.getattachCheckBox();
			//附加勾选
			break;
		case 'projectSelect':
			inputHtml = nsComponent.part.getProvinceSelectHtml();
			break;
		case 'transactor':
			// 办理人设置组件 lyw 20180921
			inputHtml = nsComponent.part.getTransactorHtml();
			break;
		case 'flowchartviewer':
			// 工作流设置组件 lyw 20181029
			inputHtml = nsComponent.part.getFlowchartviewerHtml();
			break;
		case 'datemobile':
			// 移动端日期组件
			inputHtml = nsComponent.part.getDateMobileHtml();
			break;
		default:
			if(debugerMode){
				console.error('不能识别的组件类型：'+config.type);
				console.error(config);
			}
			break;
	}
	return inputHtml;	
}

//使用data形式的组件批量初始化
nsComponent.dataInit = function(data, formID){
	//data 是数组形式整理好配置文件
	//两个值都是必填的
	if(debugerMode){
		var parametersArr = 
		[
			[data,'object',true],
			[formID,'string',true]
		]
		nsDebuger.validParameter(parametersArr);
	}
	nsComponent.init.setFormJson(formID);
	
	$.each(data, function(key,value){
		//key是类型
		//value是config数组或obj
		switch(key){
			case 'validateArr':
				nsFormBase.validate(formID,value);
				break;
			case 'hidden':
				for(var hiddenI=0; hiddenI<value.length; hiddenI++){
					nsComponent.init.hidden(value[hiddenI]);
				}
				break;
			case 'text':
			case 'number':
			case 'password':
			case 'textarea':
				//数组型
				for(var textI=0; textI<value.length; textI++){
					nsComponent.init.text(value[textI]);
				}
				break;
			case 'textBtn':
				for(var btnI=0; btnI<value.length; btnI++){
					nsComponent.init.text(value[btnI]);
					nsComponent.init.textBtn(value[btnI]);
				}
				break;
			case 'transactor':
				// 办理人设置组件 lyw 20180925
				for(var btnI=0; btnI<value.length; btnI++){
					if(!value[btnI].readonly){
						// 非只读
						nsComponent.init.transactorBtn(value[btnI]);
					}
				}
				break;
			case 'radio':
				for(var radioI=0; radioI<value.length; radioI++){
					nsComponent.init.radio(value[radioI]);
				}
				break;	
			case 'daterangeRadio':
				for(var radioI=0; radioI<value.length; radioI++){
					nsComponent.init.daterangeRadio(value[radioI]);
				}	
				break;
			case 'checkbox':
				for(var checkboxI=0; checkboxI<value.length; checkboxI++){
					nsComponent.init.checkbox(value[checkboxI]);
				}
				break;
			case 'select':
				for(var selectI=0; selectI<value.length; selectI++){
					nsComponent.init.select(value[selectI], value);
				}
				break;
			case 'select2':
				for(var selectI=0; selectI<value.length; selectI++){
					nsComponent.init.select2(value[selectI]);
				}
				break;
			case 'date':
				for(var dataI=0; dataI<value.length; dataI++){
					nsComponent.init.date(value[dataI]);
				}
				break;
			case 'daterange':
				for(var dateRangeI=0; dateRangeI<value.length; dateRangeI++){
					nsComponent.init.daterangepicker(value[dateRangeI]);
				}
				break;
			case 'datetime':
				for(var datetimeI=0; datetimeI<value.length; datetimeI++){
					nsComponent.init.datetime(value[datetimeI]);
				}
				break;
			case 'addSelectInput':
				nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value.id),value);
				nsUI.addSearchInput.init(value);
				break;
			case 'organizaSelect':
				for(var orgI=0; orgI<value.length; orgI++){
					nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value[orgI].id),value[orgI]);
					nsUI.organizaSelect.init(value[orgI]);
				}
				break;
			case 'treeSelect':
				for(var treeI in value){
					nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value[treeI].id),value[treeI]);
					treeUI.init(formID,value[treeI]);
				}
				break;
			case 'uploadSingle':
				for(var fileI in value){
					nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value[fileI].id),value[fileI]);
					nsForm.dropzoneFileJson[value[fileI].fullID] = {};	//存放的是当前上传文件的dom,在清空form表单的时候会用到
					nsForm.dropzoneGetFile[value[fileI].fullID] = {};		//存放的是当前上传文件的file,清空删除文件都会用到，一个文件可以上传多个，所以存放每个下标和file对应值
					nsForm.dropzoneStr[value[fileI].fullID] = [];			//getformjson的时候获取所有保存值	
					nsForm.dropzoneDataJson[value[fileI].fullID] = {};
					nsComponent.init.uploadSingle(value[fileI]);
				}
				break;
			case 'personSelect':
				if(typeof(value)=='string'){
					value = JSON.parse(value);
				}
				for(var personI in value){
					var config = value[personI];
					config.formID = formID;
					nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value[personI].id),value[personI]);
					nsUI.personSelect.init(config);
				}
				break;
			case 'personSelectSystem':
				for(var systemI=0; systemI<value.length; systemI++){
					nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value[systemI].id),value[systemI]);
					nsUI.systemPerson.planeInit(value[systemI]);
				}
				break;
			case 'typeahead':
				for(var autoI=0; autoI<value.length; autoI++){
					nsComponent.init.typeahead(value[autoI]);
				}
				break;
			case 'typeaheadtemplate':
				for(var autoI=0; autoI<value.length; autoI++){
					nsComponent.init.typeaheadTemplate(value[autoI]);
				}
				break;
			case 'baidumap':   //lyw
				provinceSelect.initBaiDuMap(formID,value);
			case 'provinceSelect': 
			case 'provincelinkSelect':
				if($.isArray(value)){
					for(var p=0; p<value.length; p++){
						nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value[p].id+'-province'),value[p]);
						if(typeof(value)=='string'){
							value = JSON.parse(value);
						}
						provinceSelect.init(formID,value);
					}
				}else{
					nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value.id+'-province'),value);
					if(typeof(value)=='string'){
						value = JSON.parse(value);
					}
					provinceSelect.init(formID,value);
				}
				break;
			case 'selectSelect':
				for(var i=0; i<value.length; i++){
					nsComponent.init.selectSelect(value[i]);
				}
				break;
			case 'textSelect':
				for(var i=0; i<value.length; i++){
					nsComponent.init.textSelect(value[i]);
				}
				break;
			case 'selectText':
				for(var i=0; i<value.length; i++){
					nsComponent.init.selectText(value[i]);
				}
				break;
			case 'selectDate':
				for(var i=0; i<value.length; i++){
					nsComponent.init.selectDate(value[i]);
				}
				break;
			case 'uploadObj':
				nsComponent.init.uploadObj(value);
				break;
			case 'webupload':
				nsComponent.init.webupload(value);
				break;
			case 'numrange':
				for(var i=0; i<value.length; i++){
					nsComponent.init.numrange(value[i]);
				}
				break;
			case 'expression':
				nsComponent.init.expression(value);
				break;
			case 'tableArr':
				value[0].id = value[0].fullID;
				popupBox.initTable(value);
				break;
			case 'table':
				popupBox.initTable(value);
				break;
			case 'inputSelect':
				for(var i=0; i<value.length; i++){
					var config = value[i];
					config.formID = formID;
					nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value[i].id),value[i]);
					nsUI.inputSelect.init(config);
				}
				break;
			case 'scientificInput':
				//科学计数法
				for(var scientI=0; scientI<value.length; scientI++){
					nsComponent.init.scientificInput(value[scientI]);
				}
				break;
			case 'powerInput':
				//幂的几次方
				for(var powerI=0; powerI<value.length; powerI++){
					nsComponent.init.powerInput(value[powerI]);
				}
				break;
			case 'modelSelector':
				//车型选择组件
				for(var carI=0; carI<value.length; carI++){
					nsComponent.init.modelSelector(value[carI]);
				}
				break;
			case 'ueditor':
				for(var ueditorI = 0; ueditorI<value.length; ueditorI++){
					nsComponent.init.ueditor(value[ueditorI]);
				}
				break;
			case 'colorpickerinput':
				for(var colorI=0; colorI<value.length; colorI++){
					nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value[colorI].id),value[colorI]);
					nsComponent.init.colorpickerinput(value[colorI]);
				}
				break;
			case 'uploadImage':
				for(var imageI=0; imageI<value.length; imageI++){
					nsComponent.init.uploadImage(value[imageI]);
				}
				break;
			case 'graphicsInput':
				for(var starI=0; starI<value.length; starI++){
					nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value[starI].id),value[starI]);
					nsComponent.init.getGraphicsInput(value[starI]);
				}
				break;
			case 'timer':
				for(var timeI=0; timeI<value.length; timeI++){
					nsComponent.init.timepicker(value[timeI]);
				}
				break;
			case 'codeMirror':
				for(var editorI=0; editorI<value.length; editorI++){
					nsComponent.init.getCodeMirrorInput(value[editorI]);
				}
				break;
			case 'photoImage':
				for(var photoI=0; photoI<value.length; photoI++){
					nsComponent.init.photoImage(value[photoI]);
				}
				break;
			case 'multiselect':
				nsComponent.init.multiselect(value);
				break;
			case 'attachCheckBox':
				//附加勾选
				for(var checkboxI=0; checkboxI<value.length; checkboxI++){
					nsComponent.init.attachCheckBox(value[checkboxI]);
				}
				break;
			case 'valuesInput':
				nsComponent.init.valuesInput(value);
				break;
			case 'dateTimeInput':
				nsComponent.init.dateTimeInput(value);
				break;
			case 'projectSelect':
				for(var proI=0; proI<value.length; proI++){
					nsComponent.init.setCommonAttr($('#form-'+formID+'-'+value[proI].id),value[proI]);
					nsComponent.init.projectSelect(value[proI]);
				}
				break;
			case 'flowchartviewer':
				for(var flowI=0; flowI<value.length; flowI++){
					nsComponent.init.flowchartviewer(value[flowI]);
				}
				break;
			case 'datemobile':
				for(var flowI=0; flowI<value.length; flowI++){
					nsUI.dateMobileInput.init(value[flowI]);
				}
				break;
			default:
				//还有很多form属性 不需要处理
				break;
		}
	});
	//是否使用回车快捷键
	//nsFormBase.shortcutKey(data);
}
//修改某个组件的属性
nsComponent.edit = function(id, formID, config){
	//修改某个组件
	//id和formID都是配置参数中的
	//config是要修改的属性
	if(debugerMode){
		var parametersArr = 
		[
			[id,'string',true],
			[formID,'string',true],
			[config,'object',true]
		]
		nsDebuger.validParameter(parametersArr);
	}
	if(typeof(config.hidden)=='boolean'){
		if(config.hidden){
			nsForm.hideByID(id,formID);
		}else{
			nsForm.showByID(id,formID);
		}
	}
	//sjj 20181023 如果type是label title 不需要继续执行
	if(config.type == 'label' || config.type == 'title'){return false;}
	var formJson = nsFormBase.data[formID].config;
	if(debugerMode){ //判断是否有这个表单配置参数
		if(typeof(formJson)!='object'){
			console.error('formID:'+formID+language.common.nscomponent.setDefault.formParameter);
		}
	}
	var usedConfig = nsForm.data[formID].formInput[id];
	if(debugerMode){ //判断是否有这个表单配置参数
		if(typeof(usedConfig)!='object'){
			console.error('id:'+id+language.common.nscomponent.setDefault.componentParameter);
			console.error(nsForm.data[formID]);
		}
	}
	
	for(key in config){
		usedConfig[key] = config[key];
	}

	usedConfig = nsComponent.setIrregularCharge(usedConfig,formJson);
	usedConfig = nsComponent.setDefault(usedConfig, formJson); //设置默认值

	usedConfig.withoutContainer = true;

	var html = nsComponent.getHTML(usedConfig, formJson);


	delete usedConfig.withoutContainer;
	switch(formJson.formSource){
		case 'form':
		case 'modal':
		case 'halfScreen':
		case 'fullScreen':
		case 'inlineScreen':
		case 'staticData':
			if(usedConfig.type == 'hidden'){
				$('#'+usedConfig.fullID).val(usedConfig.value);
			}else{
				usedConfig.$container.html(html);
			}
			break;
		case 'table':
			usedConfig.$container.th.children('.title').html(usedConfig.label);
			usedConfig.$container.td.html(html);
			break;
	}
	var dataTypeIsArrayBln = $.isArray(nsFormBase.data[formID][usedConfig.type]);
	//该组件类型传输的时候是否数组，如果是数组，则新建数组传过去，如果不是，则新建obj传过去
	var data = {};
	if(dataTypeIsArrayBln){
		data[usedConfig.type] = [usedConfig];
	}else{
		data[usedConfig.type] = {};
		data[usedConfig.type][usedConfig.id] = usedConfig;
	}
	nsComponent.dataInit(data, formJson.id);
}
//批量修改
nsComponent.editByArray = function(configArr,formID){
	//formID是配置参数中的id
	//configArr是配置参数 config的数组，必须指定数组
	if(debugerMode){
		var parametersArr = 
		[
			[configArr,'array',true],
			[formID,'string',true]
		]
		nsDebuger.validParameter(parametersArr);
	}
	for(var configI = 0; configI<configArr.length; configI++){
		var config = configArr[configI];
		// 如果是ajax请求组件 ajaxLoading == true
		// 排除移动端 有搜索框的情况
		if(typeof(config.url)=='string'&&config.isSendAjax==true){
			config.ajaxLoading = true;
		}
		nsComponent.edit(config.id,formID,config);
	}
}
//设置值的方法
nsComponent.setCommonValue = function(config,value){
	
}
nsComponent.setSelectKeyValue = function(id,value,type){
	switch(type){
		case 'selectText':
			var selectStr = value.select;
			var textStr = value.text;
			$('#'+id+'CompareType').val(selectStr);
			var selectTextStr = $("#"+id+"CompareType").find("option:selected").text();
			$("#"+id+"CompareType").next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr);
			$('#'+id+"DefaultValue1").val(textStr);
			break;
		case 'selectSelect':
			var firstStr = value.firstSelect;
			var secondStr = value.secondStr;
			$('#'+id+'CompareType').val(firstStr);
			var selectTextStr = $("#"+id+"CompareType").find("option:selected").text();
			$("#"+id+"CompareType").next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr);
			
			$('#'+id+'DefaultValue1').val(secondStr);
			var selectTextStr1 = $("#"+id+"DefaultValue1").find("option:selected").text();
			$("#"+id+"DefaultValue1").next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr1);
			
			break;
		case 'selectDate':
			var selectStr = value.select;
			var textStr = value.date;
			$('#'+id+'CompareType').val(selectStr);
			var selectTextStr = $("#"+id+"CompareType").find("option:selected").text();
			$("#"+id+"CompareType").next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr);
			$('#'+id+'DefaultValue1Temp').val(textStr);
			$('#'+id+'DefaultValue1').val(textStr);
			$('#'+id+'DefaultValue2').val(textStr);
			break;
	}
}

//对组件赋值
nsComponent.setValue = function(id, formID, value){
	//对某个组件进行赋值操作
	//id和formID都是配置参数中的
	//value是赋值
	if(debugerMode){
		var parametersArr = 
		[
			[id,'string',true],
			[formID,'string',true],
			[value,'any',true]
		]
		nsDebuger.validParameter(parametersArr);
	}
	var config = nsForm.data[formID].formInput[id];
	if(debugerMode){
		if(typeof(nsForm.data[formID])=='undefined'){
			console.error('formID'+formID+language.common.nscomponent.setDefault.notfoundformConfiguration);
		}else{
			if(typeof(nsForm.data[formID].formInput[id])=='undefined'){
				console.error('id：'+id+language.common.nscomponent.setDefault.notfoundComponent);
				//console.log(nsForm.data[formID]);
			}
		}
	}
	var id = config.fullID;
	switch(config.type){
		case 'text':
			if( config.formSource == 'halfScreen' ||  // 半屏
				config.formSource == 'fullScreen' ||  // 全屏
				config.formSource == 'inlineScreen' 	||  // 行内
				config.formSource == 'staticData' 	    // 功能
			){
				nsUI.textInput.setValue(config, value);
			}else{
				$("#"+id).val(value);
			}
			break;
		case 'date':
			if( config.formSource == 'halfScreen' ||  // 半屏
				config.formSource == 'fullScreen' ||  // 全屏
				config.formSource == 'inlineScreen' 	||  // 行内
				config.formSource == 'staticData' 	    // 功能
			){
				nsUI.dateInput.setValue(config, value);
			}else{
				var regu = /^[-+]?\d*$/;
				if(regu.test(value)){
					//
					if(value == ''){
						value = config.isDefaultDate == false ? '':nsComponent.formatDate(value);
					}else{
						value = nsComponent.formatDate(value);
					}
				}
				$("#"+id).val(value);
				$('#'+id).datepicker('update');
			}
			break;
		case 'datetime':
			if( config.formSource == 'halfScreen' ||  // 半屏
				config.formSource == 'fullScreen' ||  // 全屏
				config.formSource == 'inlineScreen' 	||  // 行内
				config.formSource == 'staticData' 	    // 功能
			){
				nsUI.datetimeInput.setValue(config, value);
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
				$('#'+id+'-date').val(dateStr);
				$('#'+id+'-time').val(timeStr);
				$('#'+id+'-date').datepicker('update');
				$('#'+id+'-time').timepicker('setTime',timeStr);
				$('#'+id+'-time').timepicker('updateWidget');
			}
			break;
		case 'timepicker':
			$('#'+id).val(value);
			$('#'+id).timepicker('setTime',value);
			$('#'+id).timepicker('updateWidget');
			break;
		case 'checkbox':
			if( config.formSource == 'halfScreen' ||  // 半屏
				config.formSource == 'fullScreen' ||  // 全屏
				config.formSource == 'inlineScreen' 	||  // 行内
				config.formSource == 'staticData' 	    // 功能
			){
				nsUI.checkboxInput.setValue(config, value);
			}else{
				var checkboxData = config.subdata;
				$('[for*="'+id+'"]').removeClass("checked"); 
				$("[name='"+id+"']").removeAttr("checked");
				$.each($("[name='"+id+"']"),function(key,value){
					$(this).removeClass('checked');
					$(this).prev().removeClass('checked');
				})
				//sjj20181022 对赋值进行优化添加方式
				var fillValueStr = '';
				switch(config.valueFormat){
					case 'array':
						fillValueStr = value.join(',');
						break;
					case 'volist':
						if($.isArray(value)){
							var valueArray = [];
							for(var c=0; c<value.length; c++){
								valueArray.push(value[c][config.valueField]);
							}
							fillValueStr = valueArray;
						}
						break;
					case 'string':
					default:
						fillValueStr = value;
						break;
				}
				if($.isArray(checkboxData)){
					// 如果checkboxData的长度是1 并且value是1 那么有可能1表示选中 查询它的选项id
					if(checkboxData.length==1&&(value=='1'||value==1)){
						value = checkboxData[0][config.valueField];
					}
					for(var chkI = 0; chkI<checkboxData.length; chkI++){
						if(typeof(value)=='string' || typeof(value)=='number'){
							if(checkboxData[chkI][config.valueField] == value){
								$("#"+id+"-"+chkI).get(0).checked = true;
								$("#"+id+"-"+chkI).prev().addClass('checked');
							}
						}else if($.isArray(value)){
							//默认值是个数组
							for(var i=0; i<value.length; i++){
								if(checkboxData[chkI][config.valueField] == value[i]){
									$("#"+id+"-"+chkI).prev().addClass('checked');
									$("#"+id+"-"+chkI).get(0).checked = true;
								}
							}
						}
					}
				}
			}
			break;
		case 'radio':
			if( config.formSource == 'halfScreen' ||  // 半屏
				config.formSource == 'fullScreen' ||  // 全屏
				config.formSource == 'inlineScreen' 	||  // 行内
				config.formSource == 'staticData' 	    // 功能
			){
				nsUI.radioInput.setValue(config, value);
			}else{
				var $radio = $('[name="'+id+'"]');
				$radio.removeAttr('checked');
				$radio.parent().children('label').removeClass('checked');
				//$("input[name='"+id+"'][value='"+value+"']").attr("checked",true);
				if($.isArray(config.subdata)){
					for(var radioI=0; radioI<config.subdata.length; radioI++){
						if(config.subdata[radioI][config.valueField] == value){
							$radio.get(radioI).checked = true;
							$('#'+id+'-'+radioI).prev().addClass('checked');
						}
					}
				}
			}
			break;
		case 'select':
			$("#"+id).val(value);
			var selectTextStr = $("#"+id).find("option:selected").text();
			$("#"+id).next().find('.selectboxit-btn .selectboxit-text').attr('data-val',value);
			$("#"+id).next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr);
			/*if($("#"+id).next().find('.selectboxit-btn .selectboxit-text').length > 0){
				$("#"+id).val(value);
				var selectTextStr = $("#"+id).find("option:selected").text();
				$("#"+id).next().find('.selectboxit-btn .selectboxit-text').attr('data-val',value);
				$("#"+id).next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr);
			}else{
				var $selectChange = nsForm.selectTwoDom[id];
				if(typeof(value)=='string'){
					if(value.indexOf(',')>-1){value = value.split(',')}
				}
				$selectChange.val(value).trigger('change');
			}*/
			break;
		case 'select2':
			var $selectChange = nsForm.selectTwoDom[id];
			if(typeof(value)=='string'){
				if(value.indexOf(',')>-1){value = value.split(',')}
			} 
			$selectChange.val(value).trigger('change');
			break;
		case 'addSelectInput':
			//增删一体输入框
			nsUI.addSearchInput.setValue(config.id, formID, value);
			break;
		case 'selectDate':
			nsComponent.setSelectKeyValue(config.id,value,config.type);
			break;
		case 'selectSelect':
			nsComponent.setSelectKeyValue(config.id,value,config.type);
			break;
		case 'selectText':
			nsComponent.setSelectKeyValue(config.id,value,config.type);
			break;
		case 'personSelect':
			nsUI.personSelect.setValue(value);
			break;
		case 'personSelectSystem':
			nsUI.systemPerson.setValue(id,value);
			break;
		case 'organizaSelect':
			if(typeof(value)=='object'){
				$('#'+id).val(value.text);
				$('#'+config.fullHiddenID).val(value.id);
			}
			break;
		case 'inputSelect':
			$('#'+id).val(value);
			break;
		case "baidumap":
			provinceSelect.fillValueBaiDuMap(id,value);
			break;
		case "provinceSelect":
		case 'provincelinkSelect':
			provinceSelect.fillValue(id,value);
			break;
		case 'codeMirror':
			nsComponent.codeMirror[id].$editor.setValue(value);
			break;
		case "treeSelect":
			if(config.readonly){
				$('#'+id).attr("value",value.text);
				$('#'+id).attr("nodeid",value.value);
			}else{
				treeUI[id].config.value = value;
				if(typeof(value)=='object'){
					treeUI[id].config.value = value.value;
				}
				if(value){
					treeUI.initTreeData(treeUI[id]);
				}else{
					$('#'+id).attr("value",'');
					$('#'+id).attr("nodeid",'');
				}
			}
			//$('#'+id).val(value.text);
			//treeUI.selectedTreeNode(treeId,value.value);
			break;
		case "uploadSingle":
			//console.log(value)
			break;
		case 'modelSelector':
			if(typeof(value)=='object'){
				if(!$.isEmptyObject(value)){
					//不为空
					$('#'+id).val(value.value);
					$('#'+id).attr('ms-id',value.id);
				}
			}
			break;
		case 'ueditor':
			config.ueditor.setContent(value);
			break;
		case 'colorpickerinput':
			$('#'+id).val(value);
			$('#'+id).siblings('.input-group-addon').children('.color-preview').css('background-color',value);
			break;
		case 'uploadImage':
			var $element = $('[ns-imgid="'+id+'"]');
			$element.children('label').remove();
			$element.children().removeClass('hide');
			$element.children('img').attr('src',value[config.textField]);
			$element.children('img').attr('ns-id',value[config.valueField])
			break;
		case 'graphicsInput':
			if(typeof(value)=='number'){
				var width = Math.round((value/config.max)*100)+'%';
				$('#'+id).parent().find('.fill-star').css({'width':width});
			}
			break;
		case 'multiselect':
			if(!$.isEmptyObject(value)){
				var multiID = 'multi-multiple-'+config.id;
				nsMultiSelect.fillMultiValue(multiID,value);
			}
			break;
		case 'attachCheckBox':
			if(value == 1){
				$("#"+id).prev().addClass('checked');
				$("#"+id).attr('checked',true);
			}else{
				$("#"+id).prev().removeClass('checked');
				$("#"+id).attr('checked',false);
			}
			break;
		case 'flowchartviewer':
			config.value = value;
			$('#'+id).children().remove();
			nsComponent.init.flowchartviewer(config);
			break;
		default:
			$("#"+id).val(value);
			break;
	}
}
//格式化日期
/**
 * 格式化时间
 * dataNumber是毫秒数 如1471862506000 
 * isFullTime是否显示时分秒，默认为不显示
 * 
 * @returns 年/月/日  或者（isFullTime==false） 年/月/日 时:分:秒
 */
nsComponent.formatDate = function(dateNumber,isFullTime){
	var isFullTimeBln = arguments[1] ? arguments[1] : language.date.rangeFormat;
	var newDataNumber;
	var date;
	if(typeof(dateNumber)=="string"){
		if(dateNumber == ""){
			date = new Date();
		}else{	
			var newDataNumber = Number(dateNumber);
			if(isNaN(newDataNumber)){
				returnStr =  moment(dateNumber).format(isFullTimeBln);
				return returnStr;
			}else{
				date = new Date(newDataNumber);
			}
		}
	}else if(typeof(dateNumber)=="number"){
		date = new Date(dateNumber);
	}else if(typeof(dateNumber)=="undefined"){
		date = new Date();
	}else{
		return '';
	}
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();

	var monthStr = month<10?"0"+month:month.toString();
	var dayStr = day<10?"0"+day:day.toString();
	var hourStr = hour<10?"0"+hour:hour.toString();
	var minuteStr = minute<10?"0"+minute:minute.toString();
	var secondStr = second<10?"0"+second:second.toString();

	var returnStr = "";
	returnStr =  year+'-'+monthStr+'-'+dayStr+" "+hourStr+":"+minuteStr+":"+secondStr; 
	returnStr =  moment(returnStr).format(isFullTimeBln);
	return returnStr;
}

//对组件验证
nsComponent.getRules = function(formID,validateArr){
	var rules = {};
	var validateObj = {};
	for(getI = 0; getI < validateArr.length; getI ++){
		var rulesStr = validateArr[getI].rules;
		if(typeof(rulesStr) == 'string'){
			var key = "form-"+formID+"-"+validateArr[getI].id;
			var value = {};
			var rulesArr = rulesStr.split(' ');
			for(var ruleI = 0; ruleI < rulesArr.length; ruleI ++){
				var getRulesStr = nsValid.getRules(rulesArr[ruleI],formID);
				value[getRulesStr.type] = getRulesStr.rules;
			}
			rules[key] = value;
		}
		validateObj['rules'] = rules;
		validateObj['errorPlacement'] = function(error, element){
			if(element.attr('nstype')=='radio') {
		    	error.appendTo( element.closest('.form-item.radio'));
			}else{
				//error.appendTo(element);
				element.after(error)
			}
		}
	}
	return validateObj;
}

//根据当前元素判断下拉输出位置 
nsComponent.getComponentPosition = function($input,option){
	/*
		*$input 当前需要追加下拉内容的元素
		*option 属性配置参数
		   *source 来源 主要三个 form,dialog
	*/

	var inputOffset = $input.offset();
	var topNum = 0;
	var leftNum = 0;
	var position = 'absolute';//默认绝对定位
	var defaultParameter = {
		top:40, 		//当前元素的高度
	}
	var marginAttrStr = '0 15px';
	var fillAttrStr = '';
	switch(option.source){
		case 'form':
		case 'formDialog':
			inputOffset = $input.closest('.form-td').offset();
			topNum = inputOffset.top + defaultParameter.top;
			leftNum = inputOffset.left;
			marginAttrStr = '0px';
			if($('.nswindow .content').length > 0){
				var $container = $('.nswindow .content:last');
				var nswindowOffset = $container.offset();
				leftNum = leftNum - nswindowOffset.left;
				topNum = inputOffset.top-10;
			}
			var width = $input.closest('.form-td').outerWidth();
			fillAttrStr = 'width:'+width+'px;';
			break;
		case 'modal':
		case 'dialog':
			/*topNum = inputOffset.top - $input.closest('.modal-body').offset().top + defaultParameter.top;
			leftNum = $input.parent().position().left;*/
			//inputOffset = $input.closest('.form-group').offset();
			inputOffset = $input.offset();
			topNum = inputOffset.top + defaultParameter.top;
			leftNum = inputOffset.left;
			marginAttrStr = '0px';
			var width = $input.closest('.modal-dialog').outerWidth();
			//leftNum = width - leftNum - 10;
			/*if(width >= $(window).outerWidth()){
				leftNum = $input.offset().left;
			}*/
			width = width - (leftNum - $input.closest('.modal-dialog').offset().left)-10;
			fillAttrStr = 'z-index:9999;width:'+width+'px;';
			break;
		case 'formDialog':
			topNum = inputOffset.top + defaultParameter.top;
			leftNum = inputOffset.left;
			marginAttrStr = '0px';
			break;
		case 'custom':
			// lyw 项目组件用到 把下拉树加到了input父元素下 20180706
			topNum = $input.outerHeight();
			leftNum = 0;
			marginAttrStr = '0px';
			var width = $input.outerWidth();
			fillAttrStr = 'z-index:9999;width:'+width+'px;';
			break;
	}
	var styleAttrStr = 'style="top:'+topNum+'px;left:'+leftNum+'px;margin:'+marginAttrStr+';position:'+position+';'+fillAttrStr+'"';
	return styleAttrStr;
}