var NetstarComponent = {};
NetstarComponent.data = {
    container:{},
    component:{},
}
// 组件高度常量
NetstarComponent.COMPONENTHEIGHT = {
    DEFAULT : 25, // 默认
    SM : 24, // 最小值
    MAX : 30, // 最大值
}
// 组件配置
NetstarComponent.config = {};
// vue弹框配置
NetstarComponent.dialog = {};
NetstarComponent.form = {};
// 通用模板
NetstarComponent.common = {
    formComponent:  
        '<div class="pt-form-group" :class="[formgroupClass,hiddenClass,widthClass]" :style="formGroupStyle">'
            + '<label :for="id" class="pt-control-label" :class="labelClass">{{labelText}}</label>'
            + '<div class="" :class="containerClass" ref="validate">'
                + '{{nscontainer}}'
            + '</div>'
        +'</div>',
    tableComponent: 
        '<div class="pt-input-group" :class="formgroupClass">'
            + '{{nscontainer}}'
        +'</div>',
    form:  
        '<div class="pt-form" :class="[formStyle,formLayout,plusClass]" :style="formInitStyle">'
            + '<div class="pt-form-header"></div>'
            + '<div class="pt-form-body" :id="id">'
                + '{{nscontainer}}'
            + '</div>'
            + '<div class="pt-form-footer"></div>'
        + '</div>',
    btncontainer: 
        '<div class="pt-input-group-btn">{{nscontainer}}</div>',
    otherbtncontainer: 
        '<div class="pt-btn-group" :class="btnsClass">{{nscontainer}}</div>',
    staticComponent: 
        '<span class="">{{inputText}}</span>',
    staticLink:
        '<a :href="inputTextURL" :class="inputClass">{{nscontainer}}{{inputText}}</a>',
    staticBlock:
        '<span v-for="value in textArr" :class="inputClass">{{value}}</span>',
    staticSpan:
        '<span :class="inputClass">{{nscontainer}}{{inputText}}</span>',
}
// 获得格式化的rules： 拆分rules值 转化为可用状态 {reg："max"，compareNum：2}
NetstarComponent.getFormatRules = function(ruleStr){
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
NetstarComponent.validateMsg = {
	required: "必填",
	remote: "验证未通过",
	email: "电子邮件有误",
	url: "有效网址有误",
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
    phone:'座机号有误',
    fax:'传真有误',
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
    positive:'只能是正数',
}
// 格式化ajax的data参数 保留原始值/应用值/格式化获得参照值
NetstarComponent.formatAjaxData = function(config, components){
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
                        case 'pageVo':
						case 'row':
						case 'table':
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
				case 'searchField':
					// 搜索字段
					data[dataKey] = typeof(data[dataKey])=='string'?data[dataKey]:'';
					break;
                case 'page': // 获取页面数据
                case 'pageVo': // 获取页面数据
                case 'row':
                case 'table':
                    // var fieldId = formatData[dataKey];
                    var fieldIdArr = fieldId.split('.');
                    var formID = config.formID;
                    if(dataType == 'page'){
                        var formConfigs = NetstarComponent.form[formID];
                        if(typeof(formConfigs)!='object'){
                            console.error('表单不存在');
                            console.error(formID);
                            console.error(config);
                            break;
                        }
                        var formConfig = formConfigs.config;
                        if(typeof(formConfig.getPageDataFunc)!="function"){
                            console.error('表单获取页面数据方法getPageDataFunc不存在');
                            console.error(formConfig);
                            console.error(config);
                            break;
                        }
                        var pageData = formConfig.getPageDataFunc();
                    }else{
                        if(typeof(config.relationData) != "object"){
                            console.error('relationData不存在');
                            console.error(config);
                            break;
                        }
                        var pageData = config.relationData[dataType] ? config.relationData[dataType] : {};
                    }
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
                    if( NetstarComponent.config[components[fieldId].formID] &&
                        NetstarComponent.config[components[fieldId].formID].vueConfig &&
                        NetstarComponent.config[components[fieldId].formID].vueConfig[fieldId]
                    ){
                        var value = NetstarComponent.config[components[fieldId].formID].vueConfig[fieldId].getValue(false);
                    }else{
                        // var value = components[fieldId].value;
                        if( NetstarComponent.config[components[fieldId].formID] &&
                            NetstarComponent.config[components[fieldId].formID].config &&
                            NetstarComponent.config[components[fieldId].formID].config[fieldId]
                        ){
                            var componentConfig = NetstarComponent.config[components[fieldId].formID].config[fieldId];
                            if(componentConfig.type == "business" && typeof(componentConfig.value) == "object"){
                                var value = NetstarComponent.commonFunc.getBusinessValueByValObj(componentConfig.value, componentConfig);
                            }else{
                                var value = components[fieldId].value;
                            }
                        }else{
                            var value = components[fieldId].value;
                        }
                    }
                    if(!value){
                        isObjVal = false;
                    }
                    switch(components[fieldId].type){
                        case 'select':
                        case 'radio':
                        case 'checkbox':
                        case 'business':
                        case 'treeSelect':
                            if(typeof(value) == "object"){
                                if(!isObjVal){
                                    value = value[components[fieldId].id];
                                }
                            }else{
                                if(isObjVal){
                                    isObjVal = false;
                                }
                            }
                            break;
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
            if((typeof(data[dataKey])=="string"&&data[dataKey].length===0)||(typeof(data[dataKey])=="object"&&$.isEmptyObject(data[dataKey]))){
                delete data[dataKey];
                config.ajaxConfig.isErrorGetValue = true; // lyw 20190315 关联表达式取值错误
            }
		}
	}
	config.ajaxConfig.data = data;
}
//组件获取subData的通用方法
NetstarComponent.setAjaxSubdata = function(config ,vueConfig, components, callbackFunc){
	/** 
	 * config        	组件的config, 其中config.ajaxConfig 是{url, type, data, contentType}
     * vueConfig        vue的组件配置
	 * components 		表单所有色组件配置
	 * callbackFunc 	完成时候的回调 成功返回ajax中dataSrc数组，错误回调空数组[]  
	 * 
	 * return callbackFunc返回时候的参数是包含了subdata的组件config
	 **/
	// 格式化ajax的data数据
    NetstarComponent.formatAjaxData(config, components); // 这个方法还没有写
    if(config.ajaxConfig.isErrorGetValue){
        config.ajaxLoading = false; // ajax 加载完成
        vueConfig.ajaxLoading = false; // ajax 加载完成
        vueConfig.subdata = [];
        config.subdata = [];
        // 移除正在加载
        if(typeof(callbackFunc)=='function'){
            callbackFunc(config, vueConfig, false);
        }
        // nsAlert('关联表达式取值错误','error');
        console.error(config);
        config.ajaxConfig.isErrorGetValue = false;
        return;
    }
	// application/json 则需要使用 JSON.stringify
	var ajaxConfig = config.ajaxConfig;
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
	var ajaxType = contentType == 'application/json'?'POST':config.ajaxConfig.type;
	var _ajaxConfig = {
		url: 		config.ajaxConfig.url,
		type: 		ajaxType,
        data: 		ajaxConfig.data,
		plusData: 	{
            config:config,
            vueConfig:vueConfig,
        }, //返回的this指向组件配置
        dataType: 	'json',
    }
    if(typeof(contentType)=="string"&&contentType.length>0){
        _ajaxConfig.contentType = contentType;
    }
    NetStarUtils.ajax(_ajaxConfig, function(res, __ajaxConfig){
        if(res.success){
            // var _config = __ajaxConfig.plusData.config;
            // var _vueConfig = __ajaxConfig.plusData.vueConfig;
            var componentId = __ajaxConfig.plusData.config.id;
            var formID = __ajaxConfig.plusData.config.formID;
            var _config = NetstarComponent.config[formID].config[componentId];
            var _vueConfig = NetstarComponent.config[formID].vueConfig[componentId];
            
            _config.ajaxLoading = false; // ajax 加载完成
            _vueConfig.ajaxLoading = false; // ajax 加载完成
            var subdata;
            if(typeof(_config.ajaxConfig.dataSrc)=='string'&&_config.ajaxConfig.dataSrc!=''){
                subdata = res[_config.ajaxConfig.dataSrc];
            }else{
                subdata = res;
            }

            //是否获取数据成功
            var isGetSubdata  = true;
            if($.isArray(subdata)){
                _config.subdata = $.extend(true,[],subdata);
                // 设置是否只读
                if(_config.disabled == true){
                    for(var i=0;i<subdata.length;i++){
                        subdata[i].isDisabled = _config.disabled;
                    }
                }
                // 获取value 通过subdata
                var parameterValue = {
                    value:          _config.value,
                    valueField:     _config.valueField,
                    subdata:        _config.subdata,
                    isObjectValue:  _config.isObjectValue,
                    type:           _config.type,
                    multiple:       _config.multiple,
                }
                _config.value = NetstarComponent.getValueBySubdata(parameterValue);
                var parameterText = {
                    value:          _config.value,
                    type:           _config.type,
                    valueField:     _config.valueField,
                }
                _vueConfig.inputText = NetstarComponent.getInputTextByValue(parameterText);
                NetstarComponent.setSubdata(subdata, _config);
                var parameter = {
                    inputText:          _vueConfig.inputText, 
                    subdata:            subdata, 
                    textField:          _config.textField, 
                    valueField:         _config.valueField, 
                }
                _vueConfig.inputName = NetstarComponent.getInputNameByInputText(parameter);
                if(_config.type=="select"){
                    // select类型subdata不能直接赋值需要经过处理 回调赋值
                }else{
                    _vueConfig.subdata = subdata;
                }
            }else{
                if(typeof(subdata) != 'undefined'){
                    //既不是数组也不是underfined则认为是错误
                    isGetSubdata = false;
                    if(debugerMode){
                        console.error('获取组件subdata数据失败');
                        console.error(_config);
                    }
                }else{
                    //没有返回值的时候（undifined）可能是合法的
                    _vueConfig.subdata = [];
                    _config.subdata = [];
                }
            }
            if(typeof(callbackFunc)=='function'){
                callbackFunc(_config, _vueConfig, isGetSubdata);
            }
        }else{
            var _config = __ajaxConfig.plusData.config;
            var _vueConfig = __ajaxConfig.plusData.vueConfig;
            _config.ajaxLoading = false; // ajax 加载完成
            _vueConfig.ajaxLoading = false; // ajax 加载完成
        	nsalert(_config.type + '组件' + _config.label + 'ajax请求错误','error');
        	console.error(_config.type + '组件' + _config.label + 'ajax请求错误','error');
        	console.error(_config);
        	// 移除正在加载
        	if(typeof(callbackFunc)=='function'){
        		callbackFunc(_config, _vueConfig, false, res);
        	}
        	if(debugerMode){
        		console.log(res);
        		console.log(_config);
        	}
        }
    })
}
// 设置subdata的fillId
NetstarComponent.setSubdata = function(subdata, config){
    var componentId = config.fullID;
    var valueField = config.valueField;
    for(var i=0;i<subdata.length;i++){
        subdata[i].fillId = componentId + '-' + subdata[i][valueField];
    }
}
// 通过subdata获得value值
NetstarComponent.getValueBySubdata = function(parameter){
    /**
     * parameter {} 以下使用到的参数
     * value            string/array            value值 数组格式中有可能包含对象
     *                  string : isObjectValue==false
     *                  array : isObjectValue==false && typeof(value[])=='object'
     * subdata          array                   subdata选项数组
     * isObjectValue    boolean                 value值的类型
     * valueField       string                  value对应的subdata的key值
     * type             string                  组件类型 radio/checkbox
     * multiple         boolean                 是否多选
     * isReadSub        boolean                 是否读取subdata的选中值
     **/
	if(debugerMode){
		var optionArr = 
		[
			['subdata', 			'object',       true],
			['isObjectValue', 		'boolean',      true],
			['valueField', 		    'string',       true],
		]
		var isValid = nsDebuger.validOptions(optionArr, parameter);
		if(isValid == false){
			return false;
		}
    }
    var value = typeof(parameter.value)=="undefined"?'':parameter.value;
    var subdata = parameter.subdata;
    var isObjectValue = parameter.isObjectValue;
    var valueField = parameter.valueField;
    var type = parameter.type;
    var isReadSub = typeof(parameter.isReadSub)=='boolean'?parameter.isReadSub:true;
    // 格式化value
    var valueStr = '';
    if(value === '' || ($.isArray(value)&&value.length===0)){
        if(isObjectValue){
            value = []; 
        }
    }else{
        if(!isObjectValue){
            value += ','; 
            valueStr = value;
        }else{
            for(var i=0;i<value.length;i++){
                valueStr += value[i][valueField]+',';
            }
        }
    }
    // 是否需要通过subdata获得value值
    var isValueSub = true;
    switch(type){
        case 'radio':
            if(value.length>0){
                isValueSub = false;
            }
            break;
        case 'select':
            if(value.length>0 && !parameter.multiple){
                isValueSub = false;
            }
            break;
    }
    if(!isReadSub){
        isValueSub = false;
    }
    if(isValueSub){
        // 通过subdata中的isChecked获得value
        for(var i=0;i<subdata.length;i++){
            if(subdata[i].isChecked || subdata[i].selected){
                var valueId = subdata[i][valueField];
                if(valueStr.indexOf(valueId)==-1){
                    valueStr += valueId + ',';
                    if(isObjectValue){
                        value.push(subdata[i]);
                    }else{
                        value += valueId + ',';
                    }
                }
            }
        }
    }
    if(!isObjectValue){
        value = value.substring(0, value.length-1);
    }
    if(value.length==0){
        return '';
    }
    if(!isObjectValue){
        var retValue = '';
        value = value.split(',');
        for(var valI=0;valI<value.length;valI++){
            var isHaveSub = false;
            for(var i=0;i<subdata.length;i++){
                if(value[valI] == subdata[i][valueField]){
                    isHaveSub = true;
                    break;
                }
            }
            if(isHaveSub){
                retValue += value[valI] + ',';
            }
        }
        if(retValue!=''){
            retValue = retValue.substring(0,retValue.length-1);
        }
        return retValue;
    }else{
        var retValue = [];
        for(var valI=0;valI<value.length;valI++){
            var isHaveSub = false;
            for(var i=0;i<subdata.length;i++){
                if(value[valI][valueField] == subdata[i][valueField]){
                    isHaveSub = true;
                    break;
                }
            }
            if(isHaveSub){
                retValue.push(value[valI]);
            }
        }
        if(retValue.length==0){
            retValue = '';
        }
        return retValue;
    }
}
// 通过value值获取inputText的值
NetstarComponent.getInputTextByValue = function(parameter){
    /**
     * parameter object
     * value            string/array        value值
     * valueField       string         
     * type             string              组件类型
     */
    var value = parameter.value;
    var valueField = parameter.valueField;
    var type = parameter.type;
    var inputText = '';
    if(typeof(value)=='string'){
        inputText = value;
    }else{
        for(var i=0;i<value.length;i++){
            inputText  += value[i][valueField] + ',';
        }
        if(inputText.length>0){
            inputText = inputText.substring(0, inputText.length-1);
        }
    }
    switch(type){
        case 'radio':
            break;
        case 'checkbox':
            if(inputText==''){
                inputText = [];
            }else{
                inputText = inputText.split(',');
            }
            break;
    }
    return inputText;
}
// 通过inputText获取value
NetstarComponent.getValueByInputText = function(parameter){
    /**
     * parameter {}
     * inputText            string/arr
     * subdata              arr
     * isObjectValue        boolean
     * valueField           string
     */
    var inputText = parameter.inputText;
    var subdata = parameter.subdata;
    var isObjectValue = parameter.isObjectValue;
    var valueField = parameter.valueField;
    var value = '';
    if(!isObjectValue){
        if(typeof(inputText)=='string'){
            value = inputText;
        }else{
            value = inputText.toString();
        }
    }else{
        value = [];
        if(typeof(inputText)=='string'){
            inputText = [inputText];
        }
        for(var textI=0;textI<inputText.length;textI++){
            var valObj = false;
            for(var subI=0;subI<subdata.length;subI++){
                if(subdata[subI][valueField] == inputText[textI]){
                    valObj = subdata[subI];
                    break;
                }
            }
            if(valObj){
                value.push(valObj); 
            }
        }
    }
    return value;
}
// 通过inputText获取inputName
NetstarComponent.getInputNameByInputText = function(parameter){
    /**
     * parameter {}
     * inputText        string/arr          选中项
     * textField        string              
     * valueField       string
     * subdata          arr                 单选选项
     */
    var inputName = '';
    var inputText = typeof(parameter.inputText)=='string'?[parameter.inputText]:parameter.inputText;
    var textField = parameter.textField;
    var valueField = parameter.valueField;
    var subdata = parameter.subdata;
    for(var i=0;i<inputText.length;i++){
        for(var subI=0;subI<subdata.length;subI++){
            if(subdata[subI][valueField]==inputText[i]){
                inputName += subdata[subI][textField] + ',';
            }
        }
    }
    if(inputName.length>0){
        inputName = inputName.substring(0,inputName.length-1);
    }
    return inputName;
}
// 获得静态模板
NetstarComponent.getStaticTemplate = function(config){
    var staticTemplate = '';
    switch(config.acts){
        case 'tags':
            staticTemplate = NetstarComponent.common.staticSpan;
            break;
        case 'label':
            staticTemplate = NetstarComponent.common.staticSpan;
            break;
        case 'formlabel':
            staticTemplate = NetstarComponent.common.staticSpan;
            break;
        case 'title':
            staticTemplate = NetstarComponent.common.staticSpan;
            break;
        case 'baidu':
            staticTemplate = NetstarComponent.common.staticLink;
            break;
        case 'tel':
            staticTemplate = NetstarComponent.common.staticLink;
            break;
        case 'link':
            staticTemplate = NetstarComponent.common.staticLink;
            break;
        case 'icons':
            staticTemplate = NetstarComponent.common.staticLink;
            break;
        case 'baiduMapByName':
            config.iconsHtml = '<i class="icon-map-mark-o"></i>';
            staticTemplate = NetstarComponent.common.staticLink;
            break;
        case 'block':
            staticTemplate = NetstarComponent.common.staticBlock;
            break;
        default:
            staticTemplate = NetstarComponent.common.staticSpan;
            break;
    }
    if(config.iconsHtml){
        staticTemplate = staticTemplate.replace('{{nscontainer}}',config.iconsHtml);
    }else{
        staticTemplate = staticTemplate.replace('{{nscontainer}}','');
    }
    var $content = $(staticTemplate);
    $content.attr('v-bind:style', 'styleObject');
    staticTemplate = $content.prop('outerHTML');
    return staticTemplate;
}
// 设置静态模板数据
NetstarComponent.setStaticTemplateData = function(config, data){
    data.labelClass = 'hide';
    var isUrl = false;
    switch(config.acts){
        case 'tags':
        case 'label':
            data.inputClass = 'show-text';
            break;
        case 'formlabel':
            data.inputClass = 'show-text';
            data.labelClass = '';
            data.labelText += ':';
            break;
        case 'title':
            data.inputClass = 'show-title';
            break;
        case 'baidu':
            data.inputClass = 'show-link';
            isUrl = true;
            break;
        case 'tel':
            data.inputClass = 'show-link';
            isUrl = true;
            break;
        case 'link':
            data.inputClass = 'show-link';
            isUrl = true;
            break;
        case 'icons':
            data.inputClass = 'show-link';
            isUrl = true;
            break;
        case 'baiduMapByName':
            data.inputClass = 'show-link';
            if(config.type == "provinceselect"){
                data.inputTextURL = '';
            }else{
                data.inputTextURL = 'https://api.map.baidu.com/geocoder?address='+ encodeURIComponent(data.inputText)+'&output=html&src=webapp.baidu.openAPIdemo';
            }
            break;
        case 'block':
            data.inputClass = 'show-block';
            break;
        default:
            data.inputClass = 'show-text';
            break;
    }
    var inputTextName = '';
    switch(config.type){
        case 'radio':
        case 'checkbox':
        case 'select':
            inputTextName = 'inputName';
            break;
        default:
            inputTextName = 'inputText';
            break;

    }
    if(config.acts == 'block'){
        if(data[inputTextName]){
            data.textArr = data[inputTextName].split(',');
        }else{
            data.textArr = '';
        }
    }
    if(isUrl){
        switch(config.acts){
            case 'baiduMapByName':
                data.inputTextURL = 'https://api.map.baidu.com/geocoder?address='+ encodeURIComponent(data[inputTextName])+'&output=html&src=webapp.baidu.openAPIdemo';
                break;
            case 'tel':
                data.inputTextURL = 'tel:'+data[inputTextName];
                break;
            default:
                data.inputTextURL = data[inputTextName];
                break;

        }
    }
}
// 监听显示控制模板数据 inputText / inputName
NetstarComponent.watchTemplateShowData = function(config, vueComponent, showName){
    var showData = vueComponent[showName];
    if(vueComponent.inputTextURL){
        switch(config.acts){
            case 'baiduMapByName':
            vueComponent.inputTextURL = 'https://api.map.baidu.com/geocoder?address='+ encodeURIComponent(showData)+'&output=html&src=webapp.baidu.openAPIdemo';
            break;
            case 'tel':
            vueComponent.inputTextURL = 'tel:'+showData;
            break;
            default:
            vueComponent.inputTextURL = showData;
            break;
        }
    }
    if(config.acts == 'block'){
        if(showData){
            vueComponent.textArr = showData.split(',')
        }else{
            vueComponent.textArr = [];
        }
    }
}
// 获取表单数据
NetstarComponent.getValues = function(formID, isValid){
    /**
     * formID       string      表单id
     * isValid      boolean     是否验证
     */
    if(typeof(NetstarComponent.config[formID])!='object'){
        nsAlert(formID + '表单不存在');
        console.error(formID + '表单不存在');
        return false;
    }
    var formVueComponent = NetstarComponent.config[formID].vueConfig;
    var formComponent = NetstarComponent.config[formID].config;
    if(typeof(formVueComponent)!='object'){
        // formID错误，表单不存在
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    isValid = typeof(isValid)=="boolean"?isValid:true;
    var isValidSuccess = true;
    var values = {};
    function validataByVariableType(componentId, _value){
        var isContinue = false;
        // 如果获取到的当前值是“”，而数据类型是 number 则不保存
        if(_value === ""){
            // variableType 属性是voMap自动生成的，尚未验证长ID问题（服务器端是数字，但是由于太长转成了string，有些字段（非voMap导入的没有配置的）没有该属性
            // var variableType = NetstarComponent.config[formID].source.obj[componentId].variableType; // string number
            var _component = NetstarComponent.config[formID].source.obj[componentId];
            if(typeof(_component) == "object"){
                var variableType = _component.variableType; // string number
                if(variableType == "number" || variableType == "date"){
                    // 先只处理number类型
                    isContinue = true;
                }
                if(variableType == "string"){
                    if(_component.className == "java.lang.Long"){
                        isContinue = true;
                    }
                }
            }
        }
        return isContinue;
    }
    function getFormatValueByVariableType(componentId, _value){
        // variableType 属性是voMap自动生成的，尚未验证长ID问题（服务器端是数字，但是由于太长转成了string，有些字段（非voMap导入的没有配置的）没有该属性
        var _component = NetstarComponent.config[formID].source.obj[componentId];
        var isContinue = false;
        if(typeof(_component) == "object"){
            var variableType = _component.variableType; // string number
            switch(variableType){
                case 'number':
                    if(typeof(_value) == "string"){
                        if(_value.length < 16){
                            _value = Number(_value);
                            if(isNaN(_value)){
                                isContinue = true;
                            }
                        }
                    }
                    break;
            }
        }
        return {
            value : _value,
            isContinue : isContinue
        }
    }
    for(var componentId in formVueComponent){
        // 所有组件都有value更多按钮排除
        if(componentId!="nsMoreBtn"){
            var _isValid = isValid;
            if(formComponent[componentId].type === "label"){
                continue;
            }
            if(formVueComponent[componentId].hidden || formComponent[componentId].type==="hidden"){
                _isValid = false;
                if(formVueComponent[componentId].isSave === false){
                    continue;
                }
            }
            var value = formVueComponent[componentId].getValue(_isValid);
            if(_isValid && value === false){
                values = false;
                break;
            }
            var isContinue = validataByVariableType(componentId, value);// 如果获取到的当前值是“”，而数据类型是 number 则不保存
            if(isContinue){
                continue;
            }
            var component = NetstarComponent.config[formID].config[componentId];
            var formValueObj = getFormatValueByVariableType(componentId, value); // 获取格式化的value
            if(formValueObj.isContinue){
                console.error('value数据错误，不进行保存，请检查配置');
                console.error(component);
                console.error(formVueComponent[componentId]);
                continue;
            }else{
                value = formValueObj.value;
            }
            switch(component.type){
                case 'map':
                case 'treeSelect':
                case 'valuesInput':
                    for(var key in value){
                        isContinue = validataByVariableType(key, value[key]);
                        if(isContinue){
                            continue;
                        }
                        values[key] = value[key];
                    }
                    break;
                case 'dateRangeInput':
                case 'dateRangePicker':
                    for(var key in value){
                        isContinue = validataByVariableType(component.id, value[key]);
                        if(isContinue){
                            continue;
                        }
                        values[key] = value[key];
                    }
                    break;
                case 'business':
                case 'businessSelect':
                    if(component.isReadOutputFields && typeof(value) == "object"){
                        for(var key in value){
                            isContinue = validataByVariableType(component.id, value[key]);
                            if(isContinue){
                                continue;
                            }
                            values[key] = value[key];
                        }
                    }else{
                        values[componentId] = value; 
                    }
                    break;
                case 'radio':
                case 'select':
                case 'checkbox':
                    if(typeof(component.outputFields) == "object" && typeof(value) == "object"){
                        for(var key in value){
                            if(component.id == key){
                                isContinue = validataByVariableType(component.id, value[key]);
                                if(isContinue){
                                    continue;
                                }
                            }
                            values[key] = value[key];
                        }
                    }else{
                        values[componentId] = value;
                    }
                    break;
                default:
                    values[componentId] = value;
                    break;
            }
        } 
    }
    return values;
}
// 表单组件修改
NetstarComponent.editComponents = function(editArr, formID){
    /**
     * editArr      array           修改的数组
     * formID       string          表单id
     */
    var formComponent = NetstarComponent.config[formID].vueConfig;
    var _formComponent = NetstarComponent.config[formID].config;
    if(typeof(formComponent)!='object'){
        // formID错误，表单不存在
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    if(!$.isArray(editArr)){
        console.error('editArr:'+editArr+'错误，必须数组');
        return false;
    }
    for(var i=0;i<editArr.length;i++){
        if(typeof(editArr[i])!='object'){
            console.error('editArr的:'+editArr[i]+'错误');
            continue;
        }
        if(typeof(editArr[i].id)!='string'){
            console.error('editArr的:id必填');
            continue;
        }
        var vueComponent = formComponent[editArr[i].id];
        var component = _formComponent[editArr[i].id];
        
        if(typeof(vueComponent)!='object'){
            // console.error(editArr[i].id+'组件不存在');
            continue;
        }
        if(editArr[i].hidden || editArr[i].readonly || editArr[i].disabled){
            editArr[i].rules = '';
        }else{
            if(typeof(editArr[i].rules) == "undefined"){
                editArr[i].rules = component.sourceRules;
            }else{
                component.sourceRules = editArr[i].rules;
            }
        }
        vueComponent.edit(editArr[i]);
    }
}
// 表单赋值
NetstarComponent.fillValues = function(values, formID, isClear){
    /**
     * values       object          value对象
     * formID       string          表单id 
     * isClear      boolean         是否清空未设置的value
     */
    var formComponentData = NetstarComponent.config[formID];
    if(typeof(formComponentData)!='object'){
        // formID错误，表单不存在
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    if(typeof(values)!="object"){
        console.error('values错误');
        console.error(values);
        return false;
    }
    var vueComponents = formComponentData.vueConfig;
    var components = formComponentData.config;
    var _values = $.extend(true, {}, values);
    isClear = typeof(isClear)=="boolean"?isClear:false; 
    if(isClear){
        for(var comId in vueComponents){
            if(comId!="nsMoreBtn"){
                if(typeof(_values[comId])=="undefined"){
                    _values[comId] = '';
                }
            }
        }
    }
    for(var idKey in _values){
        var vueComponent = vueComponents[idKey];
        if(vueComponent){
            var component = components[idKey];
            var value = _values[idKey];
            // 业务组件value值处理
            switch(component.type){
                case 'business':
                case 'businessSelect':
                    if(typeof(value) != "undefined" && value !== '' && component.isReadOutputFields){
                        value = NetstarComponent.commonFunc.getBusinessValueByVo(component, _values);
                    }
                    break;
            }
            vueComponent.setValue(value);
        }
    }
}
// vue组件修改
NetstarComponent.editVueComponent = function(editObj, vueComponent, config){
    /**
     * editObj          object          修改的对象
     * vueComponent     object          vue组件配置
     */
    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
    if(typeof(editObj)!='object'){
        nsAlert('editObj必须是对象格式', 'error');
        return false;
    }
    for(var editKey in editObj){
        switch(editKey){
            case 'id':
            case 'fullID':
            case 'calculatorId':
                break;
            case 'value':
                var value = editObj.value;
                if(editObj.value == null){
                    value = "";
                }
                vueComponent.setValue(value);
                break;
            case 'hidden':
                var hiddenClass = '';
                if(editObj.hidden){
                    hiddenClass = 'hide';
                }
                vueComponent.hiddenClass = hiddenClass;
                vueComponent.hidden = editObj.hidden;
                break;
            case 'readonly':
            case 'disabled':
                if(config.formDisabled){
                    // 表单只读表示表单中每个组件只读且只读不可修改
                    break;
                }
                vueComponent.disabled = editObj[editKey];
                if(vueComponent.disabled){
                    if(vueComponent.containerClass.indexOf("disabled")==-1){
                        vueComponent.containerClass += " disabled";
                    }
                }else{
                    vueComponent.containerClass = vueComponent.containerClass.replace("disabled", "");
                }
                break;
            case 'rules':
                var rules = editObj.rules;
                var requiredStr = 'pt-form-required';
                if(rules.indexOf("required")>-1){
                    if(vueComponent.formgroupClass.indexOf(requiredStr)==-1){
                        vueComponent.formgroupClass += ' '+ requiredStr;
                    }
                }else{
                    if(vueComponent.formgroupClass.indexOf(requiredStr)>-1){
                        vueComponent.formgroupClass = vueComponent.formgroupClass.replace(requiredStr, '');
                    }
                }
                config.rules = rules;
                break;
            default:
                vueComponent[editKey] = editObj[editKey];
                break;
        }
    }
}
// 获得生成组件数据 根据配置的config 
NetstarComponent.getNewVueComponentData = function(config){
    // 整体组件类名
    var formgroupClass = 'fg-'+config.type + ' '; 
    // 规则类名 添加在整体组件
    if(config.type != 'hidden' && typeof(config.rules) == "string"){
        formgroupClass += config.rules.indexOf('required') > -1?'pt-form-required':''; // 规则现在只有必填
    }
    // 组件内容（input）容器类名
    var containerClass = 'pt-'+config.type;
    if(config.disabled == true){
        containerClass += ' disabled';
    }
    /**********sjj 20190522 修改input 添加 input-group方法 start */
    switch(config.type){
        case 'business':
        case 'businessSelect':
        case 'text':
        case 'number':
        case 'date':
        case 'dateRangeInput':
        case 'dateRangePicker':
        case 'map':
        case 'treeSelect':
        case 'valuesInput':
        case 'provinceselect':
        case 'select':
        case 'upload':
        case 'cubesInput':
        case 'password':
        case 'standardInput':
            if(config.formSource != 'staticData'){
                containerClass += ' pt-input-group';
            }
            break;
    }
    /**********sjj 20190522 修改input 添加 input-group方法 end */
    // input 添加 input-group lyw
    /*if( config.type == 'business'||
        config.type == 'businessSelect'||
        config.type == 'text'||
        config.type == 'number'||
        config.type == 'date'||
        config.type == 'dateRangeInput'||
        config.type == 'dateRangePicker'||
        config.type == 'map'||
        config.type == 'treeSelect'||
        config.type == 'valuesInput'||
        config.type == 'provinceselect'
    ){
        if(config.formSource != 'staticData'){
            containerClass += ' pt-input-group';
        }
    }*/
    // 组件显示/隐藏类
    var hiddenClass = '';
    if(config.hidden){
        hiddenClass = 'hide';
    }
    var labelClass = "";
    if(config.label == ""){
        labelClass = "hide";
    }
    if(typeof(config.fullID)=="undefined"){
        config.fullID = 'tabel-' + (config.formID?config.formID:'') + '-' + config.id;
    }
    var data = {
        labelClass:         labelClass,             // label样式
        formitemClass:      '',                     // formitem样式 现在还没有用        
        formtdClass:        '',                     // formtd样式 现在还没有用
        formgroupClass:     formgroupClass,         // formgroup样式 根据rules设置 （必填样式）
        hiddenClass:        hiddenClass,            // 表单是否隐藏
        containerClass:     containerClass,         // 表单内容类名
        inputClass:         '',                     // input样式 现在还没有用
        id:                 config.fullID,          // 组件id      设置组件的id
        labelText:          config.label,           // 组件label值  设置组件label的显示值
        inputText:          '',                     // input的显示值 用于获取和设置input的值
        stateClass:         '',                     // 验证信息状态 类名
        validatInfo:        '',                     // 验证信息
        disabled:           config.disabled,        // 是否只读
        sourceId:           config.id,
        styleObject:        {},
        widthClass:         '',                     // 设置width整体宽度时配置
        formGroupStyle:     {},                     // pt-form-group 的样式 宽度
        hidden:             config.hidden,
    };
    // input的宽度  用于设置input的宽度
    if(typeof(config.inputWidth)=='number'){
        data.styleObject.width = config.inputWidth + 'px';
    }
    // input的高度  用于设置input的高度
    if(typeof(config.inputHeight)=='number'){
        data.styleObject.height = config.inputHeight + 'px';
    }
    // 如果设置了整体宽度 inputWidth/inputHeight 没有意义 删除设置
    if(typeof(config.width)=='string'){
        var rex2 = /^([0-9]*)%$/;  // number + %
        if(rex2.test(config.width)){
            data.formGroupStyle.width = config.width;
            // data.widthClass = "pt-form-group-width";
            data.styleObject = {};
        }
    }
    switch(config.type){
        case 'business':
        case 'businessSelect':
            var inputText = '';
            var isSet = false;
            // value是数组且存在
            if($.isArray(config.value)&&config.value.length>0){
                isSet = true;
                for(var i=0;i<config.value.length;i++){
                    var inputTextStr = config.value[i][config.textField]?config.value[i][config.textField]:'';
                    if(inputTextStr.length>0){
                        inputText += inputTextStr + ',';
                    }
                }
                if(inputText!=""){
                    inputText = inputText.substring(0,inputText.length-1);
                }
            }
            // 存在value时，没有要显示的字段 表示textField错误
            if(isSet == true && inputText === ''){
                console.error("组件的textField配置错误，不能显示value值");
                console.error(config.value);
                console.error(config);
            }
            data.inputText = inputText;
            // 失去焦点时是否需要验证value值 属性在按钮按下和松开时设置/弹框生成和移除时设置
            data.isValidatValue = true;
            break;
        case 'text':
        case 'textarea':
        case 'password':
            data.inputText = config.value;
            data.ishide = true;
            break;
        case 'number':
            data.inputText = config.value;
            data.calculatorId = config.calculatorId; // 计算器容器
            data.isFocusSelect = true; // 获得焦点时是否选中
            break;
        case 'date':
            var value = typeof(config.value)=='number'?moment(config.value).format(config.format):'';
            data.isValidatValue = true;
            data.inputText = value;
            if(config.isOnlyTime){
                config.value = typeof(config.value)=='number'?moment(config.value).format('YYYY-MM-DD ' + config.format):'';
            }else{
                config.value = value;
            }
            break;
        case 'radio':
        case 'checkbox':
        case 'select':
            // 选项
            data.subdata = config.subdata;
            if(config.type == "select"){
                data.subdata = NetstarComponent.select.getSubdata(config);
            }
            if(config.type == 'checkbox'||config.type == 'radio'){
                data.showState = config.showState;
            }
            var inputText = config.value;
            if(config.type == 'checkbox' || config.type == 'select'){
                if(config.isObjectValue && config.value!=''){
                    inputText = [];
                    for(var i=0;i<config.value.length;i++){
                        inputText.push(config.value[i][config.valueField]);
                    }
                }else{
                    if(config.value==''){
                        inputText = [];
                    }else{
                        if(typeof(inputText)=='string'){
                            //需要判断当前值是不是字符串类型 防止数值类型报错
                            inputText = inputText.split(',');
                        }
                    }
                }
            }else{
                if(config.isObjectValue && config.value!=''){
                    inputText = config.value[0][config.valueField];
                }
            }
            data.inputText = inputText;
            // 是否正在加载
            data.ajaxLoading = config.ajaxLoading;
            // value格式
            data.isObjectValue = config.isObjectValue;
            // 失去焦点时是否需要验证value值 点击当前选项不验证
            data.isValidatValue = true;
            // ajax配置
            if(config.ajaxConfig){
                // data.ajaxConfig = config.ajaxConfig;
            }
            var inputName = '';
            if(inputText.length>0&&config.subdata.length>0){
                var parameter = {
                    inputText:      inputText,
                    textField:      config.textField,
                    valueField:     config.valueField,
                    subdata:        config.subdata,
                };
                inputName = NetstarComponent.getInputNameByInputText(parameter);
            }
            data.inputName = inputName;
            break;
        case 'provinceselect':
            data.nsTabShow = false;
            break;
        case 'map':
            data.nsTabShow = false;
            data.nsMapShow = false;
            break;
        case 'dateRangeInput':
            data.isValidatValue = true;
            // data.fieldStart = config.value.fieldStart;
            // data.fieldEnd = config.value.fieldEnd;
            data.fieldStart = config.value.fieldStart === '' ? '' : moment(config.value.fieldStart).format(config.format);
            data.fieldEnd = config.value.fieldEnd === '' ? '' : moment(config.value.fieldEnd).format(config.format);
            data.idStart = data.id + '-start';
            data.idEnd = data.id + '-end';
            data.idButtonStart = data.id + '-start-button';
            data.idButtonEnd = data.id + '-end-button';
            break;
        case 'dateRangePicker':
            data.isValidatValue = true;
            data.fieldStart = config.value.fieldStart;
            data.fieldEnd = config.value.fieldEnd;
            break;
    }  
    if(config.type!='hidden'){
        if(config.formSource == 'staticData'){
            NetstarComponent.setStaticTemplateData(config, data);
        }
    }
    return data;
}
// 设置组件警告信息和状态
NetstarComponent.setComponentWarnInfoState2 = function(vueComponent, warnInfoStr){
    var $alert = $('#toast-container');
    var alertStr = $alert.text();
    if(alertStr.indexOf(warnInfoStr)==-1){
        // nsAlert(warnInfoStr, 'error');
    }
    var warnName = 'pt-form-required-tips';
    vueComponent.stateClass = warnName;
    vueComponent.containerClass += ' '+warnName;
    var timeOut = setTimeout(function (){
        vueComponent.validatInfo = '';
        vueComponent.stateClass = '';
        vueComponent.containerClass = $.trim(vueComponent.containerClass.replace(warnName, ''));
        clearTimeout(timeOut);
    }, 3000);
}
NetstarComponent.setComponentWarnInfoState = function(config, warnInfo){
    var warnName = 'pt-form-required-tips';
    var $validate = config.$validate;
    var html = '<div class="' + warnName + '">' + warnInfo + '</div>';
    if($validate.children('.' + warnName).length > 0){
        $validate.children('.' + warnName).remove();
        $validate.removeClass(warnName);
        if(config.timeOut){
            clearTimeout(config.timeOut);
        }
    }
    $validate.append(html);
    $validate.addClass(warnName);
    var $validateContent = $validate.children('.' + warnName);
    var timeOut = setTimeout(function (){
        $validateContent.remove();
        $validate.removeClass(warnName);
        clearTimeout(timeOut);
    }, 3000);
    config.timeOut = timeOut;
}
// 表单只读
NetstarComponent.setFormDisabled = function(formID){
    /**
     * formID       string          表单id
     */
    var formComponentObj = NetstarComponent.config[formID];
    if(typeof(formComponentObj)!='object'){
        // formID错误，表单不存在
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    var formVueComponent = formComponentObj.vueConfig;
    var formComponent = formComponentObj.config;
    if(typeof(formVueComponent)!='object'||typeof(formComponent)!='object'){
        // formID错误，表单不存在
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    for(var componentId in formComponent){
        formComponent[componentId].disabled = true;
    }
    for(var componentId in formVueComponent){
        formVueComponent[componentId].disabled = true;
    }
}
// 获取原始的value值
NetstarComponent.getValueBySourceConfig = function(sourceConfig, config){
    var value = sourceConfig.value;
    switch(config.type){
        case 'radio':
        case 'select':
            if(value !== '' && typeof(value) != "undefined"){
                break;
            }
            var subdata = config.subdata;
            if(!$.isArray(subdata)){
                break;
            }
            for(var i = 0; i < subdata.length; i ++){
                if(subdata[i].selected || subdata[i].isChecked){
                    var valueField = typeof(config.valueField) != "undefined" ? config.valueField : 'value';
                    value = subdata[i][valueField];
                    break;
                }
            }
            break;
        case 'checkbox':
            var subdata = config.subdata;
            if(!$.isArray(subdata)){
                break;
            }
            value = value === '' || typeof(value) == "undefined" ? [] : value;
            value = $.isArray(value) ? value : value.split(',');
            for(var i = 0; i < subdata.length; i ++){
                if(subdata[i].selected || subdata[i].isChecked){
                    if(config.isObjectValue){
                        value.push(subdata[i]);
                    }else{
                        var valueField = typeof(config.valueField) != "undefined" ? config.valueField : 'value';
                        value.push(subdata[i][valueField]);
                    }
                }
            }
            if(value.length == 0){
                value = '';
            }else{
                if(!config.isObjectValue){
                    value = value.toString();
                }
            }
            break;
    }
    return value;
}
// 表单清空
NetstarComponent.clearValues = function(formID, isClear){
    /**
     * formID       string          表单id
     * isClear      boolean         是否清空默认值 默认清空 true
     */
    var formComponentObj = NetstarComponent.config[formID];
    if(typeof(formComponentObj)!='object'){
        // formID错误，表单不存在
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    var formVueComponent = formComponentObj.vueConfig;
    var formComponent = formComponentObj.config;
    if(typeof(formVueComponent)!='object'||typeof(formComponent)!='object'){
        // formID错误，表单不存在
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    var values = {};
    var sourceConfig = formComponentObj.source.obj;
    isClear = typeof(isClear)=="boolean"?isClear:true;
    if(!isClear){
        for(var componentId in sourceConfig){
            // values[componentId] = sourceConfig[componentId].value;
            values[componentId] = NetstarComponent.getValueBySourceConfig(sourceConfig[componentId], formComponent[componentId]);
        }
    }
    // for(var componentId in formComponent){
    //     formComponent[componentId].value = typeof(values[componentId])=="undefined"?'':values[componentId];
    // }
    for(var componentId in formVueComponent){
        if(componentId!="nsMoreBtn"){
            formVueComponent[componentId].setValue(typeof(values[componentId])=="undefined"?'':values[componentId]);
        }
    }
}
// 表单获取焦点
NetstarComponent.setFormFocus = function(formID){
    var formComponentData = NetstarComponent.config[formID];
    var formData = NetstarComponent.form[formID];
    if(typeof(formComponentData)!='object'||typeof(formData)!='object'){
        // formID错误，表单不存在
        nsAlert('formID:'+formID+'错误，该表单不存在');
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    var componentIndexArr = formData.config.componentIndexArr;
    var vueConfigs = formComponentData.vueConfig;
    for(var i=0;i<componentIndexArr.length;i++){
        var component = vueConfigs[componentIndexArr[i]];
        if(typeof(component)=="object"){
            if(component.disabled||component.readonly||component.hidden){ 
            }else{
                isNextComponent = true;
                component.focus();
                break;
            }
        }
    }
}
NetstarComponent.setNextComponentFocus1 = function(config, vueConfig){
    var nextFieldId = config.enterFocusField;
    if(nextFieldId){
        var nextVueComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
        var nextComponent = NetstarComponent.config[config.formID].config[nextFieldId];
        // 判断下一个表单是否还可以获得焦点
        if(nextVueComponent.disabled||nextVueComponent.readonly||nextVueComponent.hidden){
            NetstarComponent.setNextComponentFocus(nextComponent, vueConfig);
        }else{
            nextVueComponent.focus();
        }
    }else{
        vueConfig.blur();
    }
}
NetstarComponent.setNextComponentFocus = function(config, vueConfig){
    var formComponentData = NetstarComponent.config[config.formID];
    var formData = NetstarComponent.form[config.formID];
    if(typeof(formComponentData)!='object'||typeof(formData)!='object'){
        // formID错误，表单不存在
        nsAlert('formID:'+formID+'错误，该表单不存在');
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    var componentIndexArr = formData.config.componentIndexArr;
    var vueConfigs = formComponentData.vueConfig;
    var configs = formComponentData.config;
    var componentIndex = 0;
    for(var i=0;i<componentIndexArr.length;i++){
        if(componentIndexArr[i] == config.id){
            componentIndex = i;
            break;
        }
    }
    var isNextComponent = false;
    for(var i=(componentIndex+1);i<componentIndexArr.length;i++){
        var vueComponent = vueConfigs[componentIndexArr[i]];
        var component = configs[componentIndexArr[i]];
        if(typeof(vueComponent)=="object"){
            if(vueComponent.disabled || 
                vueComponent.readonly || 
                vueComponent.hidden || 
                component.mindjetFieldPosition === "field-more" ||
                component.type === "label"
            ){ 
            }else{
                isNextComponent = true;
                vueComponent.focus();
                break;
            }
        }
    }
    if(!isNextComponent){
        vueConfig.blur();
    }
}
// 判断是否执行blurHandler
NetstarComponent.formBlurHandler = function(config, vueConfig){
    if(config.formSource=="table"){
        return;
    }
    if(typeof(config.formID)=="undefined"){
        return;
    }
    var formComponentData = NetstarComponent.config[config.formID];
    var formData = NetstarComponent.form[config.formID];
    if(typeof(formComponentData)!='object'||typeof(formData)!='object'){
        // formID错误，表单不存在
        nsAlert('formID:'+config.formID+'错误，该表单不存在');
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    var blurHandler = formData.config.blurHandler;
    if(typeof(blurHandler)!="function"){
        return;
    }
    var componentIndexArr = formData.config.componentIndexArr;
    var vueConfigs = formComponentData.vueConfig;
    var componentIndex = 0;
    for(var i=0;i<componentIndexArr.length;i++){
        if(componentIndexArr[i] == config.id){
            componentIndex = i;
            break;
        }
    }
    var endIndex = 0;
    for(var i=(componentIndexArr.length-1);i>-1;i--){
        var component = vueConfigs[componentIndexArr[i]];
        if(typeof(component)=="object"){
            if(component.disabled||component.readonly||component.hidden){ 
            }else{
                endIndex = i;
                break;
            }
        }
    }
    if(componentIndex == endIndex){
        blurHandler(config, vueConfig);
    }
    if(typeof(config.countFuncHandler)=='function'){
        config.countFuncHandler();
    }
}
NetstarComponent.changeComponentByChangeHandlerData = function(changeData, formID){
    var vueComponents = NetstarComponent.config[formID].vueConfig;
    if(typeof(vueComponents)!='object'){
        // formID错误，表单不存在
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    var editConponent = {};
    for(var stateType in changeData){
        for(var componentId in changeData[stateType]){
            if(typeof(editConponent[componentId])!="object"){
                editConponent[componentId] = {};
            }
            editConponent[componentId][stateType] = changeData[stateType][componentId];
        }
    }
    var editArr = [];
    for(var componentId in editConponent){
        var editObj = editConponent[componentId];
        editObj.id = componentId;
        editArr.push(editObj);
    }
    NetstarComponent.editComponents(editArr, formID);
};
NetstarComponent.countFunc = function(){
    var obj = {
        a:1,
        b:2,
        e:3,
        ff:4,
        c:5,
        dd:6
    }
    var obj1 = {};
    var rex=/(abs|acos|asin|atan|atan2|ceil|cos|exp|floor|log|max|min|pow|random|sin|sqrt|tan)\(([^\(\)]+)\)/;
    var rex2=/(abs|acos|asin|atan|atan2|ceil|cos|exp|floor|log|max|min|pow|random|sin|sqrt|tan)\(([^\(\)]+)\)/g;
    var rex3 = /\{\{(.*?)\}\}/;
    var rex4 = /\{\{(.*?)\}\}/g;
    var rex5 = /\((.*?)\)/;
    var rex6 = /\((.*?)\)/g;
    var aa = "(max({{a}},cos({{b}}+{{e}}))+{{ff}})+min({{c}},{{dd}})";
    var bb = aa.match(rex2);
    for(var bbI=0;bbI<bb.length;bbI++){
        var bbStr = bb[bbI];
        var bbStrArr = bbStr.match(rex);
        switch(bbStrArr[1]){
            case 'cos':
                var funcStr = bbStrArr[2];

                break;
            case 'max':
                break;
            case 'min':
                break;
        }
    }
    function countMath(str){

    }
    function rexMath(){}
}
NetstarComponent.validatValue = function(validatConfig){
    /*
     * value : 表单的value值
     * rules : rules的配置值 如 max=0 ；required
     * type : 类型
     */
    var isTrue = true;
    var validatInfo = '';
    if(typeof(validatConfig.type)=="undefined" || typeof(NetstarComponent[validatConfig.type])!="object"){
        console.warn('验证调取错误，没有发送type值，无法验证, 返回默认true');
        console.warn(validatConfig);
        return {
            isTrue:isTrue,
            validatInfo:validatInfo,
        };
    }
    var value = typeof(validatConfig.value)=="undefined"?'':validatConfig.value;
    if(typeof(validatConfig.rules)=="string"&&validatConfig.rules.length>0){
        var isTrueObj = NetstarComponent[validatConfig.type].validatValue(value, validatConfig.rules);
        isTrue = isTrueObj.isTrue;
        validatInfo = isTrueObj.validatInfo;
        if(validatInfo.length>0){
            var validatInfoArr = validatInfo.split('');
            if(validatInfoArr[validatInfoArr.length-1]==","){
                validatInfo = validatInfo.substring(0, validatInfo.length-1);
            }
        }
        // if(!isTrue){
        //     nsAlert(isTrueObj.validatInfo,'error');
        //     console.error('输入数据验证失败，输入值：'+ validatConfig.value + ' ，错误信息如下：'+isTrueObj.validatInfo);
        //     console.error(validatConfig);
        // }
    }
    return {
        isTrue:isTrue,
        validatInfo:validatInfo,
    };
}
// 通用方法
NetstarComponent.commonFunc = {
    // 通过vo（表单设置的默认值）获得业务组件value值  如果配置innerFields按照innerFields获取value值否则按照outputField
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
            if(typeof(val) == "object"){
                var valArr = $.isArray(val) ? $.extend(true, [], val) : [$.extend(true, {}, val)];
            }else{
                var valArr = val.split(',');
            }
            for(var i=0; i<valArr.length; i++){
                value[i] = typeof(value[i]) == "object" ? value[i] : {};
                value[i][key] = valArr[i];
            }
        }
        // 如果配置innerFields按照innerFields获取value值否则按照outputField
        if(typeof(component.innerFields) == "object"){
            var innerFields = component.innerFields;
            for(var key in innerFields){
                if(!vo[innerFields[key]]){
                    addNone(key);
                    console.error('获取vo数据中没有' + innerFields[key] + '字段');
                    console.error(innerFields);
                    console.error(vo);
                    console.error(component);
                }else{
                    setData(key, vo[innerFields[key]]);
                }
            }
            return value;
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
    // 获取container
    getContainer : function($rel){
        var $container = $rel.closest('container');
        if($container.length == 0){
            $container = $('body');
        }
        return $container;
    },
    // 设置容器位置 
    setContainerPosition : function($container, $relative, defaultPosition){
        // 默认在相对容器的下方 左边与相对容器左边对齐， 右边无法完全显示时放在左边， 下边无法显示时在上边
        // 上边无法显示显示在下边 左边无法显示时显示在右边（左右 / 上下 都无法完全显示）

        // 计算位置
        /**
         * $container : 要设置的容器
         *  width ：容器宽度
         *  height : 容器高度
         *  marginTop : 
         * $relative : 相对容器
         *  relHeight : 相对容器t高度
         *  relWidth : 相对容器宽度
         *  relOffset : 相对容器偏移位置
         *      relOffsetX : x偏移
         *      relOffsetY : y偏移
         * $window : 窗口容器
         *  winWidth ：窗口宽度
         *  winHeight ：窗口高度
         */
        // 根据window计算位置
        var $window = $(window);
        var winWidth = $window.width();
        var winHeight = $window.height();
        var width = $container.outerWidth();
        var height = $container.outerHeight();
        var relOffset = $relative.offset();
        var relOffsetX = relOffset.left;
        var relOffsetY = relOffset.top;
        var relHeight = $relative.outerHeight()+2;
        var relWidth = $relative.outerWidth();
        var scrollHeight = $window.scrollTop();
        var borderWidth = $relative.parent().css('border-width');
        borderWidth = Number(borderWidth.replace('px', ''));
        if(isNaN(borderWidth)){
            borderWidth = 0;
        }
        var x = relOffsetX - borderWidth;
        var y = relOffsetY + relHeight - scrollHeight;
        var isTop = true;
        var isLeft = true;
        var css = {};
        // 判断容器高度 设置top/bottom
        if(defaultPosition == 'upper'){
            isTop = false;
            if((relOffsetY-scrollHeight)<height){
                isTop = true;
            }
        }else{
            if((relOffsetY+relHeight+height)>winHeight && height<relOffsetY){
                isTop = false;
            }
        }
        if((relOffsetX+width)>winWidth){
            isLeft = false;
        }
        if(isTop){
            css.top = y;
        }else{
            css.bottom = winHeight - relOffsetY + scrollHeight;
        }
        if(isLeft){
            css.left = x;
        }else{
            css.right = winWidth-(relOffsetX + relWidth);
        }
        $container.css(css);
    },
    // 获取容器位置样式 position:absolute
    getPositionStyle : function($relative, isRelWidth, otherStyle){
        isRelWidth = isRelWidth ? isRelWidth : true; // 是否生成相对宽度
        var styleStr = 'style="position:absolute;';
        var relHeight = $relative.height();
        var relWidth = $relative.width();
        var relOffset = $relative.offset();
        var left = relOffset.left;
        var top = relOffset.top + relHeight;
        styleStr += 'left:' + left + 'px;top:' + top + 'px;';
        if(isRelWidth){
            styleStr += 'width:' + relWidth + 'px;';
        }
        if(otherStyle && otherStyle.length > 0){
            styleStr += ' '+ otherStyle;
        }
        styleStr += '"';
        return styleStr;
    },
    // 点击任意位置执行方法 点击任意位置关闭下拉弹框
    clickAnyWhereToFunc : function(ev){
        var data = ev.data;
        var parentName = data.parentName;
        var relId = data.relId;
        var containerId = data.containerId;
        var $target = $(ev.target);
        var $relative =  $('#'+relId).closest(parentName);
        var $container =  $('#'+containerId);
        var $targetParent =  $target.closest(parentName);
        var $targetParent2 =  $target.closest('#'+containerId);
        // 判断是否点击临时插入的a标签用于下载 点击不执行方法
        var isDownload = false;
        if(ev.target.tagName == "A" && ev.target.style.display == 'none'){
            isDownload = true;
        }
        if(($targetParent.length>0&&$relative.is($targetParent)) || ($targetParent2.length>0&&$container.is($targetParent2)) || isDownload){
        }else{
            data.func();
        }
    },
    // 刷新组件通过关联字段
    refreshComponentByRelationField : function(config){
        var relationField = config.relationField;
        var relationFieldArr = relationField.split(',');
        for(var i=0; i<relationFieldArr.length; i++){
            var _relationField = relationFieldArr[i];
            if(NetstarComponent.config[config.formID]){
                var vueComponent = NetstarComponent.config[config.formID].vueConfig[_relationField];
                if(typeof(vueComponent)=='object'){
                    vueComponent.ajaxLoading = true;
                }
            }
        }
    },
    // 获取value通过组件配置 config
    getValueByComponentConfig : function(config){
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
    },
    // vue 初始化省市弹框
    initVueProvince : function(config, vueConfig){
        var code = '';
        switch(config.type){
            case 'provinceselect':
                code = vueConfig.getValue(false);
                break;
            case 'map':
                code = vueConfig.getConfigValue().code;
                break;
        }
        NetstarComponent.provinceselectTab.init(code, config, vueConfig);
    },
    // 获取格式化后的data
    getFormatData : function(data, config){
        var formatData = {};
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
						case 'row':
						case 'table':
						case 'page':
						case 'systemInfo':
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
					formatData[dataAttr] = {
                        type : 'value',
                        field : dataVal
                    }; // 不是和关联属性是设置为false
				}
			}
		}
		return formatData;
    },
    // 组件设置value值 通过 NetstarMainPage.systemInfo(系统参数)
    setValueByValueExpression : function(componentConfig, formConfig){
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
    },
    // 获取格式化后的data通过this。page
    getFormDataByComponent : function(config, components, ajaxName){
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
        sourceData = $.extend(true,{},config[ajaxName].data);
        data = config[ajaxName].data;
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
                        case 'pageVo':
                        case 'row':
                        case 'table':
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
        for(var dataKey in formatData){
            if(formatData[dataKey]!=false){
                var dataType = formatData[dataKey].type;
                var fieldId = formatData[dataKey].field;
                switch(dataType){
                    case 'searchField':
                        // 搜索字段
                        data[dataKey] = typeof(data[dataKey])=='string'?data[dataKey]:'';
                        break;
                    case 'page': // 获取页面数据
                    case 'pageVo': // 获取页面数据
                    case 'row':
                    case 'table':
                        // var fieldId = formatData[dataKey];
                        var fieldIdArr = fieldId.split('.');
                        var formID = config.formID;
                        if(dataType == 'page'){
                            var formConfigs = NetstarComponent.form[formID];
                            if(typeof(formConfigs)!='object'){
                                console.error('表单不存在');
                                console.error(formID);
                                console.error(config);
                                break;
                            }
                            var formConfig = formConfigs.config;
                            if(typeof(formConfig.getPageDataFunc)!="function"){
                                console.error('表单获取页面数据方法getPageDataFunc不存在');
                                console.error(formConfig);
                                console.error(config);
                                break;
                            }
                            var pageData = formConfig.getPageDataFunc();
                        }else{
                            if(typeof(config.relationData) != "object"){
                                console.error('relationData不存在');
                                console.error(config);
                                break;
                            }
                            var pageData = config.relationData[dataType] ? config.relationData[dataType] : {};
                        }
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
                        if( NetstarComponent.config[components[fieldId].formID] &&
                            NetstarComponent.config[components[fieldId].formID].vueConfig &&
                            NetstarComponent.config[components[fieldId].formID].vueConfig[fieldId]
                        ){
                            var value = NetstarComponent.config[components[fieldId].formID].vueConfig[fieldId].getValue(false);
                        }else{
                            // var value = components[fieldId].value;
                            if( NetstarComponent.config[components[fieldId].formID] &&
                                NetstarComponent.config[components[fieldId].formID].config &&
                                NetstarComponent.config[components[fieldId].formID].config[fieldId]
                            ){
                                var componentConfig = NetstarComponent.config[components[fieldId].formID].config[fieldId];
                                if(componentConfig.type == "business" && typeof(componentConfig.value) == "object"){
                                    var value = NetstarComponent.commonFunc.getBusinessValueByValObj(componentConfig.value, componentConfig);
                                }else{
                                    var value = components[fieldId].value;
                                }
                            }else{
                                var value = components[fieldId].value;
                            }
                        }
                        if(!value){
                            isObjVal = false;
                        }
                        switch(components[fieldId].type){
                            case 'select':
                            case 'radio':
                            case 'checkbox':
                            case 'business':
                            case 'treeSelect':
                                if(typeof(value) == "object"){
                                    if(!isObjVal){
                                        value = value[components[fieldId].id];
                                    }
                                }else{
                                    if(isObjVal){
                                        isObjVal = false;
                                    }
                                }
                                break;
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
                if((typeof(data[dataKey])=="string"&&data[dataKey].length===0)||(typeof(data[dataKey])=="object"&&$.isEmptyObject(data[dataKey]))){
                    delete data[dataKey];
                }
            }
        }
        return data;
    },
    // 获取格式化后的data通过this。page
    getFormDataByTable : function(config, ajaxName){
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
        if(typeof(config)!=='object'){
            console.error('调用错误，config必填');
            return false;
        }
        var data = {};
        var sourceData = {};
        var formatData = {};
        // 判断是否初始化若已经初始化 修改组件
        sourceData = $.extend(true,{},config[ajaxName].data);
        data = $.extend(true, {}, config[ajaxName].data);
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
                        case 'pageVo':
                        case 'row':
                        case 'table':
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
        for(var dataKey in formatData){
            if(formatData[dataKey]!=false){
                var dataType = formatData[dataKey].type;
                var fieldId = formatData[dataKey].field;
                switch(dataType){
                    case 'page': // 获取页面数据
                        dataType = "pageVo";
                        break;
                    case 'this':
                        dataType = "row";
                        break;
                    default:
                        break;
                }
                if(typeof(config.relationData) != "object"){
                    console.error('relationData不存在');
                    console.error(config);
                    break;
                }
                var pageData = config.relationData[dataType] ? config.relationData[dataType] : {};
                var value = '';
                var fieldIdArr = fieldId.split('.');
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
                if((typeof(data[dataKey])=="string"&&data[dataKey].length===0)||(typeof(data[dataKey])=="object"&&$.isEmptyObject(data[dataKey]))){
                    delete data[dataKey];
                }
            }
        }
        return data;
    },

}
// 表单配置
NetstarComponent.formComponent = {
    ver : '0.1.0', // 版本号
    I18N : {
        en:{},
        zh:{},
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            templateName :              'form',
            componentTemplateName :     'PC',
            form :                      [],
            formLayout:                 'pt-form-inline',      // form布局 默认行内
            formStyle:                  '',                 // form样式 默认‘’ 其他配置：pt-form-normal没边框没边距
            formSource:                 'form',             // 表单状态 staticData静态模式
            plusClass:                  '',                 // 自定义样式类名   
            isSetMore:                  true,               // 是否设置更多 
            componentHeight:            'SM',
            labelIdNum :                1,
            disabled :                  false,
		}
		nsVals.setDefaultValues(config, defaultConfig);
    },
    // 格式化组件
    formatFormComponent: function(components, config){
        for(var i=0; i<components.length; i++){
            components[i].sourceRules = components[i].rules ? components[i].rules : '';
            if(components[i].hidden || components[i].readonly || components[i].disabled){
                components[i].rules = '';
            }
            if(NetstarComponent[components[i].type]){
                if(typeof(NetstarComponent[components[i].type].formatConfig)=="function"){
                    NetstarComponent[components[i].type].formatConfig(components[i], config);
                }
                // 获取value 通过系统参数
                NetstarComponent.commonFunc.setValueByValueExpression(components[i], config);
            }
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        // form的id
        config.fullID = 'form-' + config.id;
        this.formatFormComponent(config.form, config);
        this.setRelHideComponent(config.form);
        // 通过config的配置为config.form中各个组件添加相关属性
        function setComponentConfig(compontent){
            compontent.fullID = config.fullID + '-' + compontent.id; // 组件id 组件标签名字
            compontent.formID = config.id; // 表单Id
            compontent.templateName = config.componentTemplateName; // 组件模板名
            // 兼容旧组件 把旧组件type值改成当前组件认识的
            switch(compontent.type){
                case 'select2':
                    compontent.type = 'select';
                    break;
                case 'provincelinkSelect':
                case 'provincelink-select':
                    compontent.type = 'provinceselect';
                    break;
                case 'date':
                    if(compontent.isDateRangePicker){
                        compontent.type = 'dateRangePicker';
                    }
                    break;
            }
            compontent.formDisabled = config.disabled;  // 表单是否只读
            if(config.disabled){
                // 根据表单只读设置组件只读
                compontent.disabled = config.disabled;
                compontent.readonly = config.disabled;
            }
        }
        var form = config.form;
        for(var comI=0;comI<form.length;comI++){
            setComponentConfig(form[comI]);
        }
        // 支持回车 添加回车参数
        // enterFocusField 跳转的目标字段 字段默认设置 也可以自己设置 自己设置的优先级高（确定跳转字段）
        function setAllowEnterSwitchArr(_componentConfig,AllowEnterSwitchArr){
            //类型为非操作类的组件 如html title hr label node br 有些在type属性上，有些则完全没有type属性
            switch(_componentConfig.type){
                case 'title':
                case 'html':
                case 'hr':
                case 'label':
                case 'node':
                case 'br':
                case 'hidden':
                    return false;
                    break;
                case undefined:
                    return false;
                    break;
            }
            //类型合格但是属性不支持的组件也需要排除
            if(	
                // _componentConfig.hidden == true ||  			    //隐藏不能支持
                // _componentConfig.readonly == true ||  			    //只读不能支持
                // _componentConfig.disabled == true ||  			    //disable
                typeof(_componentConfig.id)=='undefined' || 		//压根没id的
                _componentConfig.formSource=='staticData'        	//静态数据
            ){
                return false;
            }
            if(typeof(NetstarComponent[_componentConfig.type])!="object"){
                return false;
            }
            //上述两个条件都不满足则可以支持
            // AllowEnterSwitchArr.push(_componentConfig);
            _componentConfig.componentIndex = AllowEnterSwitchArr.length-1;
            AllowEnterSwitchArr.push(_componentConfig.id);
            return true;
        }
        // 设置componentIndexArr
        var componentIndexArr = [];
        for(var i=0;i<form.length;i++){
            setAllowEnterSwitchArr(form[i],componentIndexArr)
        }
        config.componentIndexArr = componentIndexArr;

        // 设置模式
        var formSource = config.formSource;
        for(var i=0;i<form.length;i++){
            if(typeof(form[i].formSource)!='string'){
                form[i].formSource = formSource;
            }
        }
        // 设置组件的changHandlerData通过组件类型
        this.setChangeHandlerDataByType(config.form);
        // 根据changeHandlerData设置表单组件的状态
        // 注意：changeHandlerData有两个机制 1.初始化之前执行 2.change执行（只在checkbox，radio，select起作用）
        this.setFormComponentsByChangeHandlerData(config.form);
        var rex = /^([0-9]*)%$/;  // number + %
        // 根据defaultComponentWidth设置表单组件宽度
        if(typeof(config.defaultComponentWidth)=="string"){
            if(rex.test(config.defaultComponentWidth)){
                for(var i=0;i<form.length;i++){
                    if((typeof(form[i].width)=='string'&&rex.test(form[i].width))||form[i].mindjetFieldPosition=="field-more"){
                    }else{
                        form[i].width = config.defaultComponentWidth;
                    }
                }
                config.formStyle += ' pt-form-vertical';
                config.isSetPercentageComponent = true; // 组件是否设置的百分比
            }else{
                console.error('默认宽度配置错误：'+config.defaultComponentWidth);
                console.error(config);
                delete config.defaultComponentWidth;
            }
        }
        // 计算更多按钮的宽度 和 表单最小高度，防止页面抖动
        var moreBtnWidth = false;
        var minHeight = NetstarComponent.COMPONENTHEIGHT[config.componentHeight.toUpperCase()];
        if(config.formStyle.indexOf('pt-form-normal') == -1){
            minHeight += 10;
        }
        if(typeof(config.defaultComponentWidth)=='string'){
            var lineNum = 0;
            var lineWidth = 0;
            var form = config.form;
            var defaultWid = 0;
            if(rex.test(config.defaultComponentWidth)){
                defaultWid = Number(config.defaultComponentWidth.match(rex)[1]);
            }
            for(var i=0;i<form.length;i++){
                var width = 0;
                if(form[i].type!="hidden"&&form[i].hidden!=true&&form[i].mindjetFieldPosition!='field-more'){
                    if(typeof(NetstarComponent[form[i].type])!="object"){
                        continue;
                    }
                    if(typeof(form[i].width)=='string'){
                        if(rex.test(form[i].width)){
                            width = Number(form[i].width.match(rex)[1]);
                        }
                    }else{
                        width = defaultWid;
                    }
                    if(lineWidth == 0){
                        lineNum ++;
                    }
                    if((lineWidth+width) > 100){
                        lineNum ++;
                        lineWidth = width;
                    }else{
                        if((lineWidth+width) == 100){
                            lineWidth = 0;
                        }else{
                            lineWidth += width;
                        }
                    }
                }
            }
            if(config.isSetMore==true){
                // lineNum ++;
                moreBtnWidth = 100-lineWidth;
                if(moreBtnWidth===0 || moreBtnWidth < 10){
                    moreBtnWidth = 100;
                    lineNum ++;
                }
                moreBtnWidth += '%';
            }
            minHeight = minHeight*lineNum;
        }
        if(config.formStyle.indexOf('pt-form-normal') == -1){
            minHeight += 12;
        }
        config.formPanelMinHeight = minHeight;
        if(moreBtnWidth){
            config.moreBtnWidth = moreBtnWidth;
        }
        if(config.formSource == "staticData"){
            config.formStyle += ' pt-form-view';
        }
        // 设置表达式方法 total:{{price}}*{{number}}
        this.setCountFuncByTotal(config.form);
    },
    // 设置关联隐藏字段
    setRelHideComponent: function(components){
        var _components = $.extend(true, [], components);
        // 设置关联改变
        function mapRelChange(obj){
            var config = obj.config;
            var vueConfigs = NetstarComponent.config[config.formID].vueConfig;
            if(typeof(vueConfigs)=="object"){
                var vueConfig = vueConfigs[config.changeField];
                if(typeof(vueConfig)=="object"){
                    vueConfig.changeByRelField(obj);
                }
            }
        }
        // 设置隐藏字段
        function getHideConfig(id, componentId){
            return {
                id : id,
                type : 'hidden',
                isSave : false,
                changeField : componentId,
                changeHandler : function(obj){
                    mapRelChange(obj)
                },
            }
        }
        // 设置显示字段
        function setShowConfig(changeFieldId, component){
            component.changeField = changeFieldId;
            component.isSave = false;
            var defaultChangeFunc = typeof(component.changeHandler)=="function"? component.changeHandler : function(){};
            component.changeHandler = function(obj){
                mapRelChange(obj);
                defaultChangeFunc(obj);
            }
        }
        var componentsObj = {};
        for(var i=0; i<components.length; i++){
            componentsObj[components[i].id] = components[i];
        }
        for(var comI=0; comI<_components.length; comI++){
            var component = _components[comI];
            switch(component.type){
                case 'map':
                    var subFields = component.subFields;
                    if(typeof(subFields)!="object"){
                        break;
                    }
                    for(var key in subFields){
                        if(typeof(componentsObj[subFields[key]])=="object"){
                            setShowConfig(component.id, componentsObj[subFields[key]]);
                        }else{
                            var hideConfig = getHideConfig(subFields[key], component.id);
                            componentsObj[hideConfig.id] = hideConfig;
                            components.push(hideConfig);
                        }
                    }
                    break;
                case 'dateRangeInput':
                case 'dateRangePicker':
                    component.fieldStart = typeof(component.fieldStart) != 'string' ? component.id + 'Start' : component.fieldStart;
                    component.fieldEnd = typeof(component.fieldEnd) != 'string' ? component.id + 'End' : component.fieldEnd;
                    var arr = [component.fieldStart, component.fieldEnd];
                    for(var i=0; i<arr.length; i++){
                        if(typeof(componentsObj[arr[i]])=="object"){
                            setShowConfig(component.id, componentsObj[arr[i]]);
                        }else{
                            var hideConfig = getHideConfig(arr[i], component.id);
                            componentsObj[hideConfig.id] = hideConfig;
                            components.push(hideConfig);
                        }
                    }
                    break;
                case 'treeSelect':
                    if(!component.outputFields){
                        break;
                    }
                    component.outputFields = typeof(component.outputFields) == "string" ? JSON.parse(component.outputFields) : component.outputFields;
                    var arr = [];
                    for(var outFieldKey in component.outputFields){
                        arr.push(outFieldKey);
                    }
                    for(var i=0; i<arr.length; i++){
                        if(typeof(componentsObj[arr[i]])=="object"){
                            setShowConfig(component.id, componentsObj[arr[i]]);
                        }else{
                            var hideConfig = getHideConfig(arr[i], component.id);
                            componentsObj[hideConfig.id] = hideConfig;
                            components.push(hideConfig);
                        }
                    }
                    break;
                case 'valuesInput':
                    if(!component.outputFields){
                        break;
                    }
                    var arr = [];
                    for(var i=0; i<component.outputFields.length; i++){
                        if(component.id != component.outputFields[i].id){
                            arr.push(component.outputFields[i].id);
                        }
                    }
                    for(var i=0; i<arr.length; i++){
                        if(typeof(componentsObj[arr[i]])=="object"){
                            setShowConfig(component.id, componentsObj[arr[i]]);
                        }else{
                            var hideConfig = getHideConfig(arr[i], component.id);
                            componentsObj[hideConfig.id] = hideConfig;
                            components.push(hideConfig);
                        }
                    }
                    break;
            }
        }
    },
    setChangeHandlerDataByType: function(components){
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
    },
    setFormComponentsByChangeHandlerData:function(components){
        var changeHandlerDataComponents = {};
        // 获得所有changeHandlerData组件
        for(var componentI=0; componentI<components.length; componentI++){
            var componentConfig = components[componentI];
            var componentType = componentConfig.type;
            var value = NetstarComponent.commonFunc.getValueByComponentConfig(componentConfig);
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
    },
    // 验证配置是否正确
    validatConfig: function(config){
        var validArr = [
            ['id', 			'string', 	true], 	// id
            ['form', 		'object', 	true], 	// 表单组件配置
        ]
		var isValid = nsDebuger.validOptions(validArr, config);
        var form = config.form;
        if(form.length==0){
            nsalert('form配置错误，form必填且长度大于0');
            console.error('form配置错误，form必填且长度大于0');
            console.error(form);
            isValid = false;
        }
        // var subFieldsKey = {
        //     code : 'string',
        //     // address : 'string',
        //     longitude : 'string',
        //     latitude : 'string',
        // }
        for(var comI=0;comI<form.length;comI++){
            if(typeof(NetstarComponent[form[comI].type])=="object"){
                if(form[comI].type == "label"){
                    continue;
                }
                if(typeof(form[comI].id)!='string'){
                    console.error('组件没有配置id，id是必填的');
                    console.error(form[comI]);
                    isValid = false;
                    break;
                }
                if(typeof(form[comI].type)!='string'){
                    console.error('组件没有配置type，type是必填的');
                    console.error(form[comI]);
                    isValid = false;
                    break;
                }
                // switch(form[comI].type){
                //     case 'baidumap':
                //         if(typeof(form[comI].subFields)!="object"||$.isEmptyObject(form[comI].subFields)){
                //             console.error('组件配置错误，subFields必填并且不为空');
                //             console.error(form[comI]);
                //             isValid = false;
                //         }else{
                //             var subFields = {};
                //             for(var subKey in form[comI].subFields){
                //                 if(subFieldsKey[subKey]=="string"){
                //                     subFields[subKey] = form[comI].subFields[subKey];
                //                 }
                //             }
                //             if($.isEmptyObject(subFields)){
                //                 console.error('组件配置错误，subFields配置错误');
                //                 console.error(form[comI]);
                //                 isValid = false;
                //             }
                //         }
                //         break;
                // }
            }
        }
        return isValid;
    },
    // 获得表达式方法对象 计算对象{字段:{name(结果字段):计算方法数组}}
    getCountObj: function(formConfig){
        // formConfig form表单组件配置
        var countObj = {}; // 计算对象{字段:{name(结果字段):计算方法数组}}
        var rexContent = {
            math : /(abs|acos|asin|atan|atan2|ceil|cos|exp|floor|log|max|min|pow|random|sin|sqrt|tan)\((.*?)\)/g,
            field : /\{\{(.*?)\}\}/g,                    // 字段
            fieldStr : /\{\{(.*?)\}\}/,                  // 字段
            // mark : /[\+\-\*\/\(\)\[\]]/g,                 // +-*/()[]
            markStr : /[\+\-\*\/\(\)\[\]]/,               // +-*/()[]
            // markAll : /[\+\-\*\/\(\)\[\]\{\}]/g,         // +-*/()[]{}
            markSmallPair : /[\(\)]/g,                   // ()
            markCentrePair : /[\[\]]/g,                  // []
            markBigPair : /[\{\}]/g,                     // {}
            markSmall : /\((.*?)\)/g,                    // ()
            markSmallStr : /\((.*?)\)/,                  // ()
            markCentre : /\[(.*?)\]/g,                   // []
            markCentreStr : /\[(.*?)\]/,                 // []
            fieldMark : /\{\{(.*?)\}\}|[\+\-\*\/\(\)\[\]\<\>\=]{1}/g, // 字段和符号
        };
        // 验证total
        function validTotal(_tatal){
            var isLegal = true; // 是否合法
            // 获得所有字段 并验证字段是否合法
            // var markRex = rexContent.mark;
            var strArr = _tatal.match(rexContent.fieldMark); // fieldArr:["[","{{ggg}}","+","(","{{bbb}}", "-", "{{aaa}}",")","]","+","{{ddddd}}"];
            // 获得所有符号 并验证符号是否合法 [(+)*]*
            // var markArr = _tatal.match(markRex);
            var fieldRex = rexContent.field;
            var fieldRexStr = rexContent.fieldStr;
            var markRexStr = rexContent.markStr;
            var fieldArr = [];
            var markArr = [];
            for(var i=0; i<strArr.length; i++){
                if(strArr[i]!=""){
                    if(fieldRexStr.test(strArr[i])){
                        fieldArr.push(strArr[i]); 
                    }else{
                        if(markRexStr.test(strArr[i])){
                            markArr.push(strArr[i]);
                        }
                    }
                }
            }
            for(var i=0; i<fieldArr.length; i++){
                if(fieldArr[i]!="" && fieldRexStr.test(fieldArr[i])){
                    // isLegal = fieldRex.test(fieldArr[i]);
                    // if(isLegal){
                        var matchArr = fieldArr[i].match(fieldRex);
                        if(matchArr.length>1){ // 字段中包含两个以上字段 字段之间没有运算符
                            isLegal = false;
                        }else{
                            var matchStr = fieldArr[i].match(fieldRexStr)[1];
                            if(fieldArr[i]!=matchArr[0]||rexContent.markBigPair.test(matchStr)){ // 字段中包含符号{}
                                isLegal = false;
                            }
                        }
                    // }
                }
                if(!isLegal){
                    return isLegal;
                }
            }
            // 获得所有符号 并验证符号是否合法 [(+)*]*
            // var markArr = _tatal.match(markRex);
            var markStr = '';
            for(var i=0; i<markArr.length; i++){
                markStr += markArr[i];
            }
            function validMark(_markStr, _validStr, _markRex, _markRexStr, _pairRex){
                var isLegalMark = _markRex.test(_markStr); // ()[]是否有)] 有)]才有可能正确
                if(isLegalMark){
                    var matchMarkArr = _markStr.match(_markRex);
                    for(var i=0; i<matchMarkArr.length; i++){
                        var matchMarkArrStr = matchMarkArr[i];
                        var matchMarkStr = matchMarkArrStr.match(_markRexStr)[1];
                        if(_pairRex.test(matchMarkStr)){ // 
                            isLegalMark = false;
                            break;
                        }
                    }
                }
                return isLegalMark;
            }
            if(markStr.indexOf('(')>-1){
                isLegal = validMark(markStr, '(', rexContent.markSmall, rexContent.markSmallStr, rexContent.markSmallPair); // 小括号是否使用正确
                if(!isLegal){
                    return isLegal;
                }
            }
            if(markStr.indexOf('[')>-1){// 中括号是否使用正确
                isLegal = validMark(markStr, '[', rexContent.markCentre, rexContent.markCentreStr, rexContent.markCentrePair);
                if(!isLegal){
                    return isLegal;
                }
            }
            return isLegal;
        }
        for(var componentI=0; componentI<formConfig.length; componentI++){
            var componentConfig = formConfig[componentI];
            if(typeof(componentConfig.total)=="string"&&componentConfig.total!=""){
                var total = componentConfig.total;
                var name = componentConfig.id;
                // 验证 total 是否合法
                var isLegal = validTotal(total);
                if(isLegal){
                    var countFuncArr = total.match(rexContent.fieldMark);
                    for(var arrI=0; arrI<countFuncArr.length; arrI++){
                        if(rexContent.fieldStr.test(countFuncArr[arrI])){ // 字段
                            var fieldName = countFuncArr[arrI].match(rexContent.fieldStr)[1];
                            if(typeof(countObj[fieldName])!="object"){
                                countObj[fieldName] = {};
                            }
                            countObj[fieldName][name] = countFuncArr;
                        }
                    }
                }else{
                    console.error('字段'+name+'配置total配置错误');
                    console.error(componentConfig);
                }
            }
        }
        return countObj;
    },
    // 计算表达式
    countExpression: function(expressionStr){
        var rex1 = /\((.*?)\)/;
        var rex2 = /\((.*?)\)/g;
        var rex3 = /[\+\-\*\/]/;
        var rex4 = /[\+\-\*\/]/g;
        if(rex1.test(expressionStr)){
            var expArr = expressionStr.match(rex2);
            var expNum = expressionStr.split(rex2);
            for(var expI=0; expI<expArr.length; expI++){
                var expStr2 = expArr[expI].match(rex1)[0];
                var expStr = expArr[expI].match(rex1)[1];
                var numArr = expStr.split(rex4);
                var markArr = expStr.match(rex4);
                for(var markI=0; markI<markArr.length; markI++){
                    var num1 = numArr[markI];
                    var num1 = numArr[markI+1];
                    if(markArr[markI] == "*" || markArr[markI] == "/"){
                        var result = countAll(num1, num2, markArr[markI]);
                        numArr[markI] = result;
                        numArr.splice(markI,1)
                        markArr[markI] = false;
                    }
                }
                // 删除false符号
                var _markArr = [];
                for(var markI=0; markI<markArr.length; markI++){
                    if(markArr[markI]!=false){
                        _markArr.push(markArr[markI]);
                    }
                }
                for(var markI=0; markI<_markArr.length; markI++){
                    var num1 = numArr[markI];
                    var num1 = numArr[markI+1];
                    if(_markArr[markI] == "*" || _markArr[markI] == "/"){
                        var result = countAll(num1, num2, _markArr[markI]);
                        numArr[markI] = result;
                        _markArr[markI] = false;
                    }
                }
                var resultExp = numArr[0];
                expArr[expI] = resultExp;
                expressionStr = expressionStr.replace(expStr2, resultExp);
            }
        }
        console.log(expressionStr);
        function countSimpleExp(_expressionStr){

        }
        function countAll(){
            return 24;
        }
        // 加
        function countAdd(num1,num2){
            
        }
        // 减
        function countReduce(num1,num2){
            
        }
        // 乘
        function countRide(num1,num2){
            
        }
        // 除
        function countExcept(num1,num2){
            
        }
    },
    // 设置表达式方法 countHandler 通过total:{{price}}*{{number}}参数
    setCountFuncByTotal: function(formConfig){
        // formConfig form表单组件配置
        var countObj = this.getCountObj(formConfig); // 计算对象{字段:{name(结果字段):计算方法数组}}
        var rexContent = {
            field : /\{\{(.*?)\}\}/g,                    // 字段
            fieldStr : /\{\{(.*?)\}\}/,                  // 字段
            markStr : /[\+\-\*\/\(\)\[\]]/,               // +-*/()[]
            markSmallPair : /[\(\)]/g,                   // ()
            markCentrePair : /[\[\]]/g,                  // []
            markBigPair : /[\{\}]/g,                     // {}
            markSmall : /\((.*?)\)/g,                    // ()
            markSmallStr : /\((.*?)\)/,                  // ()
            markCentre : /\[(.*?)\]/g,                   // []
            markCentreStr : /\[(.*?)\]/,                 // []
            fieldMark : /\{\{(.*?)\}\}|[\+\-\*\/\(\)\[\]]{1}/g, // 字段和符号
        };
        for(var componentI=0; componentI<formConfig.length; componentI++){
            var componentConfig = formConfig[componentI];
            var componentId = componentConfig.id;
            if(typeof(countObj[componentId])=="object"){
                var fieldCountFuncObj = countObj[componentId];
                componentConfig.countFuncHandler = function(){
                    var formData = NetstarComponent.getValues(this.formID, false);
                    var countData = {};
                    for(var fieldKey in fieldCountFuncObj){
                        var countFuncArr = fieldCountFuncObj[fieldKey];
                        var countFuncStr = '';
                        for(var arrI=0; arrI<countFuncArr.length; arrI++){
                            var str = countFuncArr[arrI];
                            if(rexContent.fieldStr.test(str)){
                                var fieldId = str.match(rexContent.fieldStr)[1];
                                var fieldVal = formData[fieldId];
                                str = Number(fieldVal);
                                if(isNaN(str)){
                                    str = 0;
                                }
                            }
                            countFuncStr += str;
                        }
                        // console.log(countFuncArr);
                        // console.log(countFuncStr);
                        var result = eval(countFuncStr);
                        if(typeof(result)!="boolean"){
                            var resultStr = result.toString();
                            if(resultStr.indexOf('.')>-1){
                                var resultStrArr = resultStr.split('.');
                                var resultStrMix = resultStrArr[1];
                                if(resultStrMix.length == 17){
                                    resultStr = result.toFixed(16);
                                }
                            }
                            countData[fieldKey] = Number(resultStr);
                        }else{
                            countData[fieldKey] = result;
                        }
                    }
                    console.log(countData);
                    var editDataArr = [];
                    for(var key in countData){
                        var editDataObj = {};
                        editDataObj = {
                            id : key,
                            value : countData[key],
                        }
                        editDataArr.push(editDataObj);
                    }
                    NetstarComponent.editComponents(editDataArr, this.formID);
                }
            }
        }
    },
    getHtml: function(config){
        // 生成 表单组件 组件标签是根据id生成的
        var form = config.form;
        var components = '';
        var componentsmore = '';
        var formHtmlList = [];
        for(var comI=0;comI<form.length;comI++){
            var componentId = 'form-'+config.id+'-'+form[comI].id;
            componentId = componentId.toLocaleLowerCase();
            switch(form[comI].type){
                case 'listSelectInput':
                    formHtmlList.push('<' + componentId + '></' + componentId + '>')
                    break;
                default:
                    if(form[comI].mindjetFieldPosition == "field-more"){
                        componentsmore += '<' + componentId + '></' + componentId + '>';
                    }else{
                        components += '<' + componentId + '></' + componentId + '>';
                    }
                    break;
            }
        }
        if(config.formSource!="staticData" && config.isSetMore==true){
            components += '<form-' + config.id + '-field-more></form-' + config.id + '-field-more>';
        }
        var aequilateClass = 'custom'; // 自定义宽度 设置最大宽度
        if(config.isSetPercentageComponent){
            aequilateClass = 'aequilate'; // 百分比宽度 与form等宽
        }
        var componentsContent = '<div class="field" ns-type="field">'+components+'</div>'+'<div class="field-more hide '+aequilateClass+'" ns-type="field-more" ns-formid="'+config.id+'">'+componentsmore+'</div>';
        componentsContent = '<form novalidate="true" autocomplete="off" onkeydown="if(event.keyCode==13){return false;}" onsubmit="return false">' + componentsContent + '</form>';
        // 每一个listSelectInput组件都会生成一个表单
        for(var i=0; i<formHtmlList.length; i++){
            componentsContent += formHtmlList[i];
        }
        // 表单模板
        var template = NetstarComponent.common[config.templateName];
        template = template.replace('{{nscontainer}}', componentsContent);
        return template;
    },
    getData: function(config){
        var data = {
            id : config.fullID,
            // formClass : 'panel-' + config.templateName,
            formStyle: config.formStyle,
            formLayout: config.formLayout,
            plusClass: config.plusClass,
            formInitStyle : {
                'min-height' : config.formPanelMinHeight + 'px',
            }
        };
        return data;
    },
    getComponentSourceConfig: function(config){
        var form = config.form;
        var componentsConfigObj = {};
        for(var comI=0;comI<form.length;comI++){
            var componentConfig = form[comI];
            componentsConfigObj[form[comI].id] = $.extend(true,{},componentConfig);
        }
        return componentsConfigObj;
    },
    getComponentConfig: function(config, formEditData){
        var form = config.form;
        var componentsConfigObj = {};
        for(var comI=0;comI<form.length;comI++){
            var componentConfig = form[comI];
            componentsConfigObj[form[comI].id] = componentConfig;
        }
        return componentsConfigObj;
    },
    getComponentsVueConfig: function(config){
        var form = config.form;
        var componentsObj = {};
        for(var comI=0;comI<form.length;comI++){
            var componentId = 'form-'+config.id+'-'+form[comI].id;
            componentId = componentId.toLocaleLowerCase();
            var component = {};
            // 根据类型获得组件配置k
            if(typeof(NetstarComponent[form[comI].type])=="object"){
                component = NetstarComponent[form[comI].type].getComponentConfig(form[comI]);
                componentsObj[componentId] = component;
            }else{
                console.error('类型'+form[comI].type+'的组件不存在');
                console.error(form[comI]);
            }
        }
        if(config.formSource!="staticData" && config.isSetMore==true){
            componentsObj['form-' + config.id.toLocaleLowerCase() + '-field-more'] = NetstarComponent.morebtn.getComponentConfig(config);
        }
        return componentsObj;
    },
    getConfigByStore: function(config){
        var storeAllData = store.get('form-'+config.id);
        var sourceData = $.extend(true,[],NetstarComponent.config[config.id].source.array);
        if(typeof(storeAllData)!="object"){
            return sourceData;
        }else{
            if(typeof(storeAllData.components)!="object"){
                return sourceData;
            }else{
                var storeData = $.extend(true, {}, storeAllData.components);
            }
        }
        // 重新排序
        // field在前 field-more在后 hidden在最后
        var showArr= NetstarComponent.morebtn.getSortData(sourceData);
        for(var i=0;i<sourceData.length;i++){
            if(sourceData[i].type=="hidden"||sourceData[i].hidden==true){
                showArr.push(sourceData[i]);
            }
        }
        sourceData = showArr;
        // 添加排序索引
        for(var i=0;i<sourceData.length;i++){
            var storeObj = storeData[sourceData[i].id];
            if(storeObj){
                if(typeof(storeObj.index)=='number'){
                    sourceData[i].index = storeObj.index;
                }
                if(storeObj.mindjetFieldPosition){
                    sourceData[i].mindjetFieldPosition = storeObj.mindjetFieldPosition;
                }
            }else{
                sourceData[i].index = i;
            }
        }
        sourceData.sort(function(a,b){
            return a.index-b.index
        })
        return sourceData;
    },
    setComponentValue: function(config, formEditData){
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
                        case 'businessSelect':
                            if(typeof(value) != "undefined" && value !== '' && componentConfig.isReadOutputFields){
                                value = NetstarComponent.commonFunc.getBusinessValueByVo(componentConfig, formEditData);
                            }
                            break;
                    }
                    componentConfig.value = value;
                }
            }
        }
    },
    // 获取表单配置
    getFormConfig: function(config, formEditData){
        /**
         * config 表单配置
         * formEditData 表单组件设置的value值
         */
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            console.error('表单配置有误');
            console.error(config);
            return false;
        }
        NetstarComponent.form[config.id] = {};
        // 保存表单原始值
        NetstarComponent.form[config.id].source = $.extend(true,{},config);
        NetstarComponent.config[config.id] = {};
        // 保存组件原始值
        NetstarComponent.config[config.id].source = {
            obj : _this.getComponentSourceConfig(config),
            array : $.extend(true, [], config.form),
        };
        config.form = _this.getConfigByStore(config);
        _this.setConfig(config);
        // 如果formEditData==object 表示设置value
        if(typeof(formEditData)=="object"  && !$.isEmptyObject(formEditData)){
            _this.setComponentValue(config, formEditData);
        }
        NetstarComponent.config[config.id].config = _this.getComponentConfig(config);
        NetstarComponent.form[config.id].config = config;
        var html = _this.getHtml(config);
        var formComponentName = config.fullID.toLocaleLowerCase();
        var formComponent = {};
        formComponent[formComponentName] = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
        }
        var componentComponent = _this.getComponentsVueConfig(config);
        NetstarComponent.config[config.id].sourceVueConfig = componentComponent;
        NetstarComponent.form[config.id].sourceVueConfig = formComponent;
        return {
            form : formComponent,
            component : componentComponent,
        }
    },
    // 设置view到组件的label标签中
    setViewToComponentLabel: function(config){
        var components = config.form;
        for(var comI=0; comI<components.length; comI++){
            var componentConfig = components[comI];
            if(typeof(componentConfig.viewConfig)=="object"){
                var $label = $('[for="'+componentConfig.fullID+'"]');
                componentConfig.viewConfig.$container = $label;
                componentConfig.viewConfig.getValueFunc = function(){
                    var formData = NetstarComponent.getValues(config.id, false);
                    return formData;
                }
                NetstarComponent.viewer.init(componentConfig.viewConfig);
            }
        }
    },
    init:function(components, config){
        /**
         * components 表单vue配置
         *  form ： 表单容器vue
         *  component ： 组件vue
         * config 表单配置
        */
        var _this = this;
        var id = config.id;
        if(typeof(id)!='string'){
            console.error('初始化表单id必填');
            console.error(config);
            return false;
        }
        if($('#'+id).length==0){
            console.error('初始化表单id错误，id容器不存在');
            console.error(config);
            return false;
        }
        if(typeof(components)!='object'){
            console.error('components（vue配置）必填，类型必须是object');
            console.error(components);
            return false;
        }
        if(typeof(components.form)!='object'){
            console.error('components.form（表单vue配置）必填，类型必须是object');
            console.error(components);
            return false;
        }
        if(typeof(components.component)!='object'){
            console.error('components.component（组件vue配置）必填，类型必须是object');
            console.error(components);
            return false;
        }
        var formComponentName = '';
        for(var key in components.form){
            formComponentName = key;
        }
        $('#'+id).append('<'+formComponentName+'></'+formComponentName+'>');
        var formContainer = components.form;
        var componentContainer = components.component;
        NetstarComponent.data.container[id] = new Vue({
            el: '#'+id,
            components:formContainer,
        });
        NetstarComponent.form[id].vueConfig = NetstarComponent.data.container[id].$children[0];
        setTimeout(function(){
            NetstarComponent.data.component[id] = new Vue({
                el: '#'+id,
                components:componentContainer,
                mounted:function(){
                },
                method:{
                },
            })
            var $children = NetstarComponent.data.component[id].$children;
            NetstarComponent.config[id].vueConfig = {};
            for(var i=0;i<$children.length;i++){
                // if(!$children[i].isMoreBtn){
                    // 不是更多按钮组件
                    NetstarComponent.config[id].vueConfig[$children[i].sourceId] = $children[i];
                // }
            }
            setTimeout(function(){
                // 配置view
                _this.setViewToComponentLabel(config);
                if(typeof(config.completeHandler)=="function"){
                    var obj = {
                        config : config,
                        form : NetstarComponent.form[id].vueConfig,
                    }
                    config.completeHandler(obj);
                }
                var componentConfings = NetstarComponent.config[id];
                var components = NetstarComponent.config[id].config;
                var vueComponents = NetstarComponent.config[id].vueConfig;
                for(var comId in components){
                    if(typeof(components[comId].changeHandler) == "function"){
                        var vueComponent = vueComponents[comId];
                        var obj = {
                            id : comId,
                            text : vueComponent.inputText,
                            value : vueComponent.getValue(false),
                            config : components[comId],
                            vueConfig : vueComponent,
                        }
                        components[comId].changeHandler(obj);
                    }
                }
            },10)
        },10);

    },
    refresh:function(config, isSaveData){
        /**
         * config       object          表单配置
         * isSaveData   boolean         是否保存已经编辑的数据
         */
        if(isSaveData){
            var formEditData = NetstarComponent.getValues(config.id, false);
        }
        $('#'+config.id).children().remove();
        // 通过id查找原始的form配置
        var sourceFormConfig = $.extend(true,{},NetstarComponent.form[config.id].source);
        var component = NetstarComponent.formComponent.getFormConfig(sourceFormConfig, formEditData);
        NetstarComponent.formComponent.init(component, sourceFormConfig);
    },
    refreshById:function(id){
        // 通过id获取原始的表单config配置
        var configs = NetstarComponent.form[id];
        if(typeof(configs) != "object"){
            nsAlert('id错误，没有找到表单配置');
            console.error('id错误，没有找到表单配置');
            return ;
        }
        var config = configs.source;
        NetstarComponent.formComponent.refresh(config);
    },
}
NetstarComponent.dialogComponent = {
    VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:
            {
                panel:  '<div class="pt-modal" :class="plusClass">'
                            + '<div class="pt-container">'
                                + '<div class="pt-modal-content" :id="id" :style="styleObject">'
                                    + '<div class="pt-modal-header" v-on:mousedown="mousedownmove($event)">'
                                        + '<div class="pt-title" :class="{hide:!isTitle}">'
                                            + '<h4>{{title}}</h4>'
                                        + '</div>'
                                        + '<div class="pt-close">'
                                            + '<button type="button" class="pt-btn pt-btn-icon pt-btn-circle" v-on:click="close">'
                                                + '<i class="icon-close"></i>'
                                            + '</button>'
                                        + '</div>' 
                                        + '<div class="pt-modal-header-content" :id="headId">'
                                        + '</div>'
                                    + '</div>'
                                    + '<div class="pt-modal-body" :id="bodyId">'
                                    + '</div>'
                                    + '<div class="pt-modal-footer text-right" :id="footerId">'
                                        + '<div class="pt-window-control" :class="{hide:!isAllowDrag}" v-on:mousedown="mousedown($event)"></div>'
                                        + '<div class="pt-btn-group-container" :id="footerIdGroup"></div>'
                                    + '</div>'
                                + '</div>'
                            + '</div>'
                            + '<div class="pt-modal-bg" :style="modalbgStyle"></div>'
                        + '</div>',
            },
        MOBILE:{},
    },
    // 设置默认值
    setDefault: function(config){
        var defaultConfig = {
            tempalte : 'PC',
            title : '这里弹框是标题',
            // width : 500,
            // height : 320,
            plusClass : '',
            isAllowDrag : true,
            isStore : false,
            isTitle : true,
        }
        if(config.height != "auto"){
            defaultConfig.height = 320;
        }
        if(config.width != "auto"){
            defaultConfig.width = 500;
        }
        nsVals.setDefaultValues(config, defaultConfig);
    },
    // 验证config
    validatConfig : function(config){
        var isTrue = true;
        if(typeof(config.id)!='string'){
            isTrue = false;
            console.error('弹框id必须设置');
            console.error(config);
        }
        return isTrue;
    },
    // 设置config
    setConfig : function(config){
        // 设置宽高
        // 宽高是 字符串：数字+'px'/百分比 改为只显示数字 其它形式设置默认值500*500
        var rex1 = /^([0-9]*)px$/; // number + px
        var rex2 = /^(-?\d+)(\.\d+)?%$/;  // number + %   ^(-?\d+)(\.\d+)?$
        function getnumber(str,type){
            var num = 500; // 设置默认500*500
            if(rex1.test(str)){
                // number + px
                num = Number(str.match(rex1)[1]);
            }else{
                if(rex2.test(str)){
                    // number + %
                    var num2 = Number(str.match(rex2)[1]);
                    var windowWidth = $(window)[type]();
                    num = windowWidth*num2/100;
                }else{
                    console.warn(type+':配置错误，设置为默认500');
                    console.warn(type+':'+str);
                    console.warn(config);
                }
            }
            return num;
        }
        function getLT(str,type){
            var num = '';
            if(rex1.test(str)){
                num = str;
            }else{
                if(rex2.test(str)){
                    // number + %
                    // var num2 = Number(str.match(rex2)[1]);
                    num = str;
                }else{
                    console.warn(type+':配置错误');
                    console.warn(type+':'+str);
                    console.warn(config);
                }
            }
            return num;
        }
        var $window = $(window);
        if(typeof(config.width)=='string'){
            config.width = getnumber(config.width,'width');
            if(config.width > $window.width()){
                config.width = $window.width();
            }
        }
        if(typeof(config.height)=='string' && config.height != 'auto'){
            config.height = getnumber(config.height,'height');
            if(config.height > $window.height()){
                config.height = $window.height();
            }
        }
        if(typeof(config.left)=='string' && config.left != 'auto'){
            config.left = getLT(config.left, 'left');
            if(config.left === ''){ delete config.left; }
        }
        if(typeof(config.top)=='string' && config.top != 'auto'){
            config.top = getLT(config.top, 'top');
            if(config.top === ''){ delete config.top; }
        }
        config.dialogId = 'dialog-' + config.id;
        config.bodyId = 'dialog-' + config.id + '-body';
        config.footerId = 'dialog-' + config.id + '-footer';
        config.headId = 'dialog-' + config.id + '-header';
        config.footerIdGroup = 'dialog-' + config.id + '-footer-group';
    },
    getHtml: function(config){
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var panel = tempalte.panel;
        return panel;
    },
    getData: function(config){
        var data = {
            styleObject : {},
            title : config.title,
            id : config.dialogId,
            bodyId : config.bodyId,
            footerId : config.footerId,
            headId : config.headId,
            footerIdGroup : config.footerIdGroup,
            modalbgStyle : {},
            isAllowDrag : config.isAllowDrag,
            isTitle : config.isTitle,
        }
        if(typeof(config.width)=="number"){
            data.styleObject.width = config.width + 'px';
            data.styleObject['margin-left'] = (-config.width/2) + 'px';
        }
        if(typeof(config.height)=="number"){
            data.styleObject.height = config.height + 'px';
        }
        if(typeof(config.left)=="string"){
            data.styleObject.left = config.left;
        }
        if(typeof(config.top)=="string"){
            data.styleObject.top = config.top;
        }
        data.styleObject['max-height'] = $(window).height() + 'px';
        var $ptModal = $('[ns-type="pt-modal"]');
        var maxIndex = 0;
        var iIndex = -1;
        for(var i=0;i<$ptModal.length;i++){
            var nsIndex = Number($ptModal.eq(i).attr('ns-index'));
            var nsTop = $ptModal.eq(i).attr('ns-top');
            if(nsIndex>=maxIndex && nsTop!='true'){
                maxIndex = nsIndex;
                iIndex = i;
            }
        }
        if(iIndex>-1){
            var maxZIndex = Number($ptModal.eq(iIndex).find('.pt-modal-content').css('z-index'));
            if(!isNaN(maxZIndex)){
                data.modalbgStyle['z-index'] = maxZIndex+1;
                data.styleObject['z-index'] = maxZIndex+2;
            }
        }
        if(typeof(config.zIndex) == "number"){
            data.modalbgStyle['z-index'] = config.zIndex;
            data.styleObject['z-index'] = config.zIndex+1;
        }
        data.plusClass = config.plusClass;
        return data;
    },
    // 设置弹框body高度
    setDialogBodyHeight: function(containerId){
        var $containerDialog = $('#dialog-'+containerId);
        var $header = $containerDialog.children('.pt-modal-header');
        var $footer = $containerDialog.children('.pt-modal-footer');
        // var footerHeight = $footer.height() == 0?$footer.outerHeight():45; // 如果设置了按钮计算按钮容器的高度 否则按照一行按钮计算 45px
        var $body = $containerDialog.children('.pt-modal-body');
        var bodyHeight = $containerDialog.outerHeight() - $header.outerHeight() - $footer.outerHeight();
        $body.outerHeight(bodyHeight);
    },
    // 设置弹框body最大高度
    setDialogBodyMaxHeight : function(containerId){
        var $containerDialog = $('#dialog-'+containerId);
        var $header = $containerDialog.children('.pt-modal-header');
        var $footer = $containerDialog.children('.pt-modal-footer');
        // var footerHeight = $footer.height() == 0?$footer.outerHeight():45; // 如果设置了按钮计算按钮容器的高度 否则按照一行按钮计算 45px
        var $body = $containerDialog.children('.pt-modal-body');
        var bodyMaxHeight = $(window).height() - $header.outerHeight() - $footer.outerHeight();
        $body.css('max-height', bodyMaxHeight + 'px');
    },
    // 获取组件配置
    getComponentConfig: function(config){
        var _this = this;
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            // 挂载前
            beforeMount: function(){
                var vueComponent = this;
                if(typeof(config.showHandler)=="function"){
                    var obj = {
                        // $el : vueComponent.$el,
                        $data : vueComponent.$data,
                        config : config,
                    }
                    config.showHandler(obj);
                }
            },
            // 挂载结束
            mounted: function(){
                var vueComponent = this;
                // 计算弹框位置
                // vueComponent.setPosition();
                // 弹框显示完成回调
                if(typeof(config.shownHandler)=="function"){
                    var obj = {
                        $el : vueComponent.$el,
                        $data : vueComponent.$data,
                        config : config,
                    }
                    // 计算弹框body高度
                    // this.setDialogBodyHeight();
                    if(config.height != "auto"){
                        this.setDialogBodyHeight();
                    }
                    config.shownHandler(obj);
                }
                _this.setDialogBodyMaxHeight(config.id);
            },
            methods: {
                setDialogBodyHeight: function(){
                    NetstarComponent.morebtn.setDialogBodyHeight(config.id);
                },
                // 点击鼠标 拖拽移动
                mousedownmove: function(ev){

                    // 按下鼠标容器
                    var $this = $(ev.target);
                    if(!$this.hasClass('pt-modal-header')){
                        $this = $this.parents('.pt-modal-header');
                    }
                    // 按下鼠标鼠标位置
                    var pageX = ev.pageX;
                    var pageY = ev.pageY;
                    // 弹框容器
                    var $container = $('#'+this.id);
                    // 弹框禁止选中
                    $container.addClass('text-no-select');
                    $container.addClass('pt-dragging');
                    // 弹框的位置
                    var offset = $container.offset();
                    var offsetLeft = offset.left;
                    var offsetTop = offset.top;
                    // 窗口宽度/高度 this高度/宽度
                    // 用于：通过比较偏移位置 判断是否需要根据鼠标移动改变窗口位置
                    var windowWidth = $(window).width();
                    var windowHeight = $(window).height();
                    var thisWidth = $this.outerWidth();
                    var dialogHeight = $('#'+config.dialogId).outerHeight();
                    // 鼠标移动
                    function mousemove(_event){
                        // 移动后鼠标位置
                        var mousePageX = _event.pageX;
                        var mousePageY = _event.pageY;
                        // 移动后鼠标移动的长度
                        var xLen = mousePageX - pageX;
                        var yLen = mousePageY - pageY;
                        // 改变的位置
                        var left = offsetLeft + xLen;
                        var top = offsetTop + yLen;
                        // 是否移出窗口
                        var isOutWindowWidth = false;
                        var isOutWindowHeight = false;
                        if(left < 0){
                            isOutWindowWidth = true;
                        }
                        if((left+thisWidth) > windowWidth){
                            isOutWindowWidth = true;
                        }
                        if(top - $(window).scrollTop() < 0){
                            isOutWindowHeight = true;
                        }
                        if((top - $(window).scrollTop() + dialogHeight) > windowHeight && yLen > 0){
                            isOutWindowHeight = true;
                        }
                        if(isOutWindowWidth){
                            // console.warn("弹框不可移出窗口");
                        }else{
                            $container.offset({
                                left:left
                            });
                        }
                        if(isOutWindowHeight){
                            // console.warn("弹框不可移出窗口");
                        }else{
                            $container.offset({
                                top:top
                            });
                        }
                    }
                    // 放开鼠标
                    function mouseup(_event){
                        // 松开鼠标时位置
                        mousemove(_event);
                        // 移除弹框禁止选中
                        $container.removeClass('text-no-select');
                        $container.removeClass('pt-dragging');
                        // 关闭移动鼠标事件
                        $(document).off('mousemove', mousemove);
                        // 关闭松开鼠标事件
                        $(document).off('mouseup', mouseup);
                    }
                    // 关闭移动鼠标事件
                    $(document).off('mousemove', mousemove);
                    // 添加移动鼠标事件
                    $(document).on('mousemove', mousemove);
                    // 关闭松开鼠标事件
                    $(document).off('mouseup', mouseup);
                    // 添加松开鼠标事件
                    $(document).on('mouseup', mouseup);
                },
                // 点击鼠标 拖拽改变大小
                mousedown : function(ev){
                    ev.stopImmediatePropagation();
                    ev.stopPropagation();
                    var __this = this;
                    // 是否移动了 用于判断mouseup是否执行
                    var isMoveMouse = false;
                    // 按下鼠标容器
                    var $this = $(ev.target);
                    // 按下鼠标鼠标位置
                    var pageX = ev.pageX;
                    var pageY = ev.pageY;
                    // 弹框容器
                    var $container = $('#'+this.id);
                    // 弹框禁止选中
                    // $container.addClass('text-no-select');
                    // 弹框的大小
                    var width = $container.outerWidth();
                    var height = $container.outerHeight();
                    // 当前弹框的偏移
                    var offset = $container.offset();
                    var offsetLeft = offset.left;
                    var offsetTop = offset.top - $(window).scrollTop();
                    // 当前窗口宽度/高度 根据偏移和宽高判断弹框大小是否已经超过范围
                    var windowWidth = $(window).width();
                    var windowHeight = $(window).height();
                    function changeBlock(event){
                        // 移动/松开 后鼠标位置
                        var mousePageX = event.pageX;
                        var mousePageY = event.pageY;
                        // 移动/松开 后鼠标移动的长度
                        var xLen = mousePageX - pageX;
                        var yLen = mousePageY - pageY;
                        var changeWidth = width+xLen;
                        var changeHeight = height+yLen;
                        var cssObj = {};
                        var isMoveX = false;
                        var isMoveY = false;
                        if((offsetLeft+changeWidth)<windowWidth){
                            isMoveX = true;
                            cssObj.width = changeWidth + 'px';
                        }
                        if((offsetTop+changeHeight)<windowHeight){
                            isMoveY = true;
                            cssObj.height = changeHeight + 'px';
                        }
                        // 改变弹框的大小
                        $container.css(cssObj);
                        // 改变弹框body的大小
                        __this.setDialogBodyHeight();
                        // 返回对象
                        var obj = {
                            isMoveX:isMoveX, // 是否移动x
                            isMoveY:isMoveY, // 是否移动y
                            lengX:xLen, // 移动的宽度
                            lengY:yLen, // 移动的高度
                            pageX:pageX, // 开始鼠标位置
                            pageY:pageY, // 开始鼠标位置
                            mousePageX:mousePageX,// 结束鼠标位置
                            mousePageY:mousePageY,// 结束鼠标位置
                            width:width, // 弹框宽度
                            height:height, // 弹框高度
                            config:config, // 弹框配置
                            $this:$this, // 操作块
                            $container:$container, // 弹框容器
                        }
                        return obj;
                    }
                    // 鼠标移动
                    function mousemove(_event){
                        isMoveMouse = true;
                        var obj = changeBlock(_event);
                        // 移动鼠标过程中回调
                        if(typeof(config.mousemoveHandler)=="function"){
                            config.mousemoveHandler(obj);
                        }
                    }
                    // 放开鼠标
                    function mouseup(_event){
                        if(isMoveMouse){
                            var obj = changeBlock(_event);
                            // 放开鼠标回调
                            if(typeof(config.mouseupHandler)=="function"){
                                config.mouseupHandler(obj);
                            }
                        }
                        // 移除弹框禁止选中
                        // $container.removeClass('text-no-select');
                        // 关闭移动鼠标事件
                        $(document).off('mousemove', mousemove);
                        // 关闭松开鼠标事件
                        $(document).off('mouseup', mouseup);
                    }
                    // 关闭移动鼠标事件
                    $(document).off('mousemove', mousemove);
                    // 添加移动鼠标事件
                    $(document).on('mousemove', mousemove);
                    // 关闭松开鼠标事件
                    $(document).off('mouseup', mouseup);
                    // 添加松开鼠标事件
                    $(document).on('mouseup', mouseup);
                    // 移动鼠标之前回调
                    if(typeof(config.mousedownHandler)=="function"){
                        var obj = {
                            pageX:pageX,
                            pageY:pageY,
                            width:width,
                            height:height,
                            config:config,
                            $this:$this,
                            $container:$container,
                        }
                        config.mousedownHandler(obj);
                    }
                },
                // 计算弹框位置
                setPosition : function(){
                    // 窗口容器
                    var $window = $(window); 
                    // 窗口容器宽度
                    var windowWidth = $window.width();
                    // 窗口容器高度
                    var windowHeight = $window.height();
                    // 弹框容器
                    var $container = $('#'+this.id);
                    // 弹框容器宽度
                    var containerWidth = $container.width();
                    // 弹框容器高度
                    var containerHeight = $container.height();
                    // 弹框距离窗口上下距离
                    var top = (windowHeight-containerHeight)/2;
                    // 弹框距离窗口左右距离
                    var left = (windowWidth-containerWidth)/2;
                    // 设置弹框位置
                    $container.css({
                        top : top + 'px',
                        left : left + 'px',
                    });
                },
                // 计算弹框位置大小信息
                getDialogInfo : function(){
                    // 窗口容器
                    var $window = $(window); 
                    // 窗口容器宽度
                    var windowWidth = $window.width();
                    // 窗口容器高度
                    var windowHeight = $window.height();
                    // 弹框容器
                    var $container = $('#'+this.id);
                    // 弹框容器宽度
                    var containerWidth = $container.width();
                    // 弹框容器高度
                    var containerHeight = $container.height();
                    // 弹框宽度
                    var width = (containerWidth / windowWidth) * 100;
                    var width = width > 100 ? '100%' : width + '%';
                    // 弹框高度
                    var height = (containerHeight / windowHeight) * 100;
                    var height = height > 100 ? '100%' : height + '%';
                    // 
                    var offset = $container.offset();
                    // 弹框距离窗口上下距离
                    var top = (((offset.top-$(window).scrollTop()) - 100) / windowHeight * 100) + '%';
                    // 弹框距离窗口左右距离
                    var left = ((0.5 - (windowWidth/2 - (offset.left + containerWidth/2))/windowWidth) * 100) + '%';
                    return {
                        width : width,
                        height : height,
                        top : top,
                        left : left,
                    }
                },
                // 关闭弹框
                close : function(){
                    var vueComponent = this;
                    var obj = {
                        $el : vueComponent.$el,
                        $data : vueComponent.$data,
                        config : config,
                    }
                    // 关闭之前回调
                    if(typeof(config.hideHandler)=='function'){
                        var isClose = config.hideHandler(obj);
                        if(typeof(isClose) == "boolean" && isClose === false){
                            // 根据hideHandler返回的参数判断是否关闭弹框
                            return false;
                        }
                    }
                    if(config.isStore){
                        var dialogInfo = this.getDialogInfo();
                        var name = config.id;
                        if(typeof(config.name) == "string"){
                            name = config.name;
                        }
                        store.set(name, dialogInfo);
                    }
                    $('#'+config.dialogContainerId).remove();
                    // 关闭之后回调
                    if(typeof(config.hiddenHandler)=='function'){
                        config.hiddenHandler(obj);
                    }
                },
            }
        }
        return component;
    },
    init: function(config){
        // 验证按钮是否已经点击过
        var dialogContainerId = config.id + '-nsdialog-container';
        if($('#'+dialogContainerId).length>0){
            return;
        }
        config.dialogContainerId = dialogContainerId;
        NetstarComponent.dialog[config.id] = {};
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        NetstarComponent.dialog[config.id].source = $.extend(true,{},config);
        _this.setConfig(config);
        var vuedialogConfig = _this.getComponentConfig(config);
        var $ptModal = $('[ns-type="pt-modal"]');
        $ptModal.removeAttr('ns-top');
        $('body').append('<div id="'+dialogContainerId+'" ns-type="pt-modal" ns-index="'+($ptModal.length+1)+'" ns-top="true"><nsdialog-container><nsdialog-container></div>');
        var vuedialog = new Vue({
            el: '#'+dialogContainerId,
            components:{
                "nsdialog-container":vuedialogConfig
            }
        })
        NetstarComponent.dialog[config.id].config = config;
        NetstarComponent.dialog[config.id].sourceVueConfig = vuedialogConfig;
        NetstarComponent.dialog[config.id].vueConfig = vuedialog.$children[0];
    },
}
NetstarComponent.moreDialogBtns = {
    VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            defButton : '<button class="pt-btn pt-btn-default" v-on:click="resDefaultSet">'
                            + '还原默认设置'
                        + '</button>',
            saveButton : '<button class="pt-btn pt-btn-default" v-on:click="saveClose">'
                            + '保存/关闭'
                        + '</button>',
        },
        MOBILE:{},
    },
    getHtml: function(config){
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var defButton = tempalte.defButton;
        var saveButton = tempalte.saveButton;
        var btnHtml = defButton + saveButton;
        var btncontainer = NetstarComponent.common.otherbtncontainer;
        btncontainer = btncontainer.replace("{{nscontainer}}", btnHtml);
        return btncontainer;
    },
    getData: function(config){
    },
    setStoreByDialogData: function(dialogData, storeID, name){
        var storeData = store.get(storeID);
        if($.isEmptyObject(dialogData)){
            if(typeof(storeData)=="undefined"){
                nsAlert("没有要保存的数据","warning");
                return;
            }else{
                delete storeData[name];
            }
        }else{
            if(typeof(storeData)=="undefined"){
                storeData = {};
            }
            storeData[name] = dialogData;
        }
        store.set(storeID, storeData);
        nsAlert("保存成功","success");
    },
    // 获取组件配置
    getComponentConfig: function(config){
        var _this = this;
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = {btnsClass:''};
                return data;
            },
            mounted: function(){
                var containerId = config.containerId;
                NetstarComponent.morebtn.setDialogBodyHeight(containerId);
            },
            methods: {
                resDefaultSet: function(){
                    nsconfirm('确定恢复默认设置吗？', function(isTrue){
                        if(isTrue){
                            if(config.type == "table"){
                                store.remove(config.tableID);
                                var configs = NetStarGrid.configs[config.tableID];
                                configs.original.isReadStore = true;
                                var tableData = $.extend(true, [], configs.vueConfig.data.originalRows);
                                NetStarGrid.init(configs.original);
                                NetStarGrid.configs[config.tableID].vueConfig.data.originalRows = tableData;
                            }else{
                                store.remove('form-'+config.formID);
                                NetstarComponent.formComponent.refresh(NetstarComponent.form[config.formID].source, true);
                            }
                            NetstarComponent.dialog[config.containerId].vueConfig.close();
                            // 原来不删除本地存储 只刷新弹框
                            // var vueTable = NetstarComponent.dialog[config.containerId].vueTable;
                            // if(config.type == "table"){
                            //     var configs = NetStarGrid.configs[config.tableID];
                            //     var source = $.extend(true, {}, configs.original);
                            //     source.isReadStore = false;
                            //     // var tableVueConfig = NetStarGrid.getVueConfig(source);
                            //     var columns = NetstarComponent.tableColumnManager.getSortData(source.columns); // 排序
                            //     NetstarComponent.tableColumnManager.setTableNullData(columns); // 设置空数据
                            //     var columnsObj = NetstarComponent.tableColumnManager.getSplitData(columns);
                            //     var showColumns = columnsObj.show;
                            //     var hideColumns = columnsObj.hide;
                            //     vueTable.tableData = showColumns;
                            //     vueTable.tableDataMore = hideColumns;
                            // }else{
                            //     var sourceFormConfig = NetstarComponent.config[config.formID].source.array;
                            //     // 排序 field在前 field-more在后
                            //     var formArr = NetstarComponent.morebtn.getSortData(sourceFormConfig);
                            //     NetstarComponent.moretable.setTableNullData(formArr, "mindjetFieldPosition");
                            //     var formArrObj = NetstarComponent.morebtn.getSplitData(formArr);
                            //     var field = formArrObj.field;
                            //     var fieldMore = formArrObj.fieldMore;
                            //     vueTable.tableData = field;
                            //     vueTable.tableDataMore = fieldMore;
                            // }
                        }
                    }, 'warning');
                    
                },
                saveClose: function(){
                    // 通过表格vue组件获得表格数据
                    var vueTable = NetstarComponent.dialog[config.containerId].vueTable;
                    var tableData = vueTable.getTableData();
                    var tableDataObj = tableData.obj;
                    if(config.type == "table"){
                        var configs = NetStarGrid.configs[config.tableID];
                        var source = $.extend(true, {}, configs.original);
                        source.isReadStore = false;
                        // var tableVueConfig = NetStarGrid.getVueConfig(source);
                        var columns = NetstarComponent.tableColumnManager.getSortData(source.columns); // 排序
                        var saveData = {};
                        var isSaveStore = false; // 是否保存本地存储
                        // 对比是否发生改变
                        for(var i=0;i<columns.length;i++){
                            var sourceObj = columns[i];
                            var tableDataCon = tableDataObj[sourceObj.field];
                            var position = Number(tableDataCon.position);
                            sourceObjHidden = typeof(sourceObj.hidden)=='boolean'?sourceObj.hidden:false; // 表格列是否隐藏
                            tableDataConHidden = tableDataCon.type == "field"? false : true; // 设置的表格列是否隐藏
                            if(sourceObjHidden != tableDataConHidden || i != position){
                                isSaveStore = true;
                            }
                            saveData[sourceObj.field] = {
                                hidden : tableDataCon.type == "field"? false : true,
                            }
                            saveData[sourceObj.field].index = i != position ? position : i;
                        }
                        // if(isSaveStore){
                        //     console.log(saveData);
                        //     // var saveDataObj = {components: saveData};
                        //     store.set(config.tableID, saveData);
                        //     nsAlert("保存成功","success");
                        // }else{
                        //     store.remove(config.tableID);
                        // }
                        if(!isSaveStore){
                            saveData = {};
                        }
                        _this.setStoreByDialogData(saveData, config.tableID, 'columns');
                        NetstarComponent.dialog[config.containerId].vueConfig.close();
                        configs.original.isReadStore = true;
                        var tableData = $.extend(true, [], configs.vueConfig.data.originalRows);
                        NetStarGrid.init(configs.original);
                        NetStarGrid.configs[config.tableID].vueConfig.data.originalRows = tableData;
                    }else{
                        // 原始数据
                        var sourceData = $.extend(true,{},NetstarComponent.config[config.formID].source);
                        var sourceArr = sourceData.array;
                        var saveData = {};
                        // 重新排列原始数据field在前field-more在后
                        var sourceARR = NetstarComponent.morebtn.getSortData(sourceArr);
                        // 对比是否发生改变
                        for(var i=0;i<sourceARR.length;i++){
                            var sourceObj = sourceARR[i];
                            var tableDataCon = tableDataObj[sourceObj.id];
                            if(typeof(tableDataCon)!="object"){
                                continue;
                            }
                            var mindjetFieldPosition = sourceObj.mindjetFieldPosition ? sourceObj.mindjetFieldPosition : "field";
                            if(mindjetFieldPosition != tableDataCon.type){
                                saveData[sourceObj.id] = {
                                    mindjetFieldPosition : tableDataCon.type,
                                }
                            }
                            var position = Number(tableDataCon.position);
                            if(i != position){
                                if(typeof(saveData[sourceObj.id])=="undefined"){
                                    saveData[sourceObj.id] = {};
                                }
                                saveData[sourceObj.id].index = position;
                            }
                        }
                        // if($.isEmptyObject(saveData)){
                        //     store.remove(config.formID);
                        // }else{
                        //     console.log(saveData);
                        //     store.set(config.formID, saveData);
                        //     nsAlert("保存成功","success");
                        // }
                        _this.setStoreByDialogData(saveData, 'form-'+config.formID, 'components');
                        NetstarComponent.dialog[config.containerId].vueConfig.close();
                        NetstarComponent.formComponent.refresh(NetstarComponent.form[config.formID].source, true);
                    }
                },
            }
        }
        return component;
    },
    init: function(config){
        var _this = this;
        var vueComponentConfig = _this.getComponentConfig(config);
        $('#'+config.id).append('<nsdialog-button></nsdialog-button>');
        var vueBtns = new Vue({
            el: '#'+config.id,
            components:{
                "nsdialog-button" : vueComponentConfig,
            }
        });
        NetstarComponent.dialog[config.containerId].vueBtns = vueBtns.$children[0];
    }
}
NetstarComponent.moretable = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            panel : '<div class="pt-panel-col pt-formeditor" :ns-type="type">'
                        + '<div class="pt-container">'
                            + '<div class="pt-title">'
                                + '<h6>{{title}}</h6>'
                            + '</div>'
                            + '<div class="pt-list">'
                                 + '<ul>'
                                    + '<li>'
                                        + '<span>行号</span>'
                                        + '<span>控件文本</span>'
                                    + '</li>'
                                + '</ul>'
                                + '<ul v-on:drop="drop($event)" v-on:dragover="dragover($event)">'
                                    + '<li v-for="val in tableData" :class="[val.class,val.switch,val.id==\'\'?\'pt-nodata\':\'\']" :ns-position="val.position" :ns-id="val.id" :ns-type="val.type" draggable="true" v-on:dragstart="dragstart($event)" v-on:dblclick="dblclickSwitch($event)" v-on:click="clickSwitch($event)">'
                                        + '<span v-if="val.id">{{val.index}}</span>'
                                        + '<span>{{val.name}}</span>'
                                    + '</li>'
                                + '</ul>'
                            + '</div>'
                        + '</div>'
                    + '</div>',
        },
        MOBILE:{},
    },
    getHtml: function(config){
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var panel = tempalte.panel;
        var panelMore = panel.replace('tableData', 'tableDataMore');
        panelMore = panelMore.replace('{{title}}', '{{titleMore}}');
        panelMore = panelMore.replace(':ns-type="type"', ':ns-type="typeMore"');
        // panelMore = panelMore.replace('clickSwitch', 'clickSwitchMore');
        return ('<div class="pt-panel">'+'<div class="pt-container">'+'<div class="pt-panel-row">'+panel + panelMore+'</div>'+'</div>'+'</div>');
    },
    getData: function(config){
        var data = {
            type : 'field',
            typeMore : 'field-more',
            title : '显示到主面板的控件',
            titleMore : '隐藏到"更多..."面板的控件',
            tableData : config.field,
            tableDataMore : config.fieldMore,
        }
        if(config.type=="table"){
            data.title = '显示到主面板列';
            data.titleMore = '隐藏的面板列';
        }
        return data;
    },
    // 判断是否需要添加空对象
    setTableNullData:function(allData, type){
        // 这个方法在两个地方用 type=“mindjetFieldPosition” 表示刚进入时表单所有配置 type=“type”表示更多弹框数据切换时所有表格数据配置
        // 判断是否存在空数组 即type=field/field-more的对象不存在了
        var isField = false;
        var isFieldMore = false;
        for(var i=0;i<allData.length;i++){
            switch(type){
                case 'type':
                    if(allData[i][type]=="field"){
                        isField = true; 
                    }
                    if(allData[i][type]=="field-more"){
                        isFieldMore = true; 
                    }
                    break;
                case 'mindjetFieldPosition':
                    if(allData[i][type]=="field-more"){
                        isFieldMore = true; 
                    }else{
                        isField = true;
                    }
                    break;
            }
        }
        // isField/isFieldMore表示长度是否为0，长度是0时添加空对象用于填充表格tbody 重新定义tableData/tableDataMore
        var nullObj = {
            id: '',
            index: 0,
        }
        if(type=="type"){
            nullObj.name = '暂时没有数据';
        }else{
            nullObj.label = '暂时没有数据';
        }
        if(!isField){
            nullObj[type] = "field";
            allData.splice(0,0,nullObj);
        }
        if(!isFieldMore){
            nullObj[type] = "field-more";
            allData.splice(allData.length-1,0,nullObj);
        }
    },
    // 获取组件配置
    getComponentConfig: function(config){
        var _this = this;
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            methods: {
                // 获取表格数据
                getTableData: function(){
                    var tableData = this.tableData;
                    var tableDataMore = this.tableDataMore;
                    var allTableData = tableData.concat(tableDataMore);
                    // 删除空对象
                    for(var i=0;i<allTableData.length;i++){
                        if(allTableData[i].id==""){
                            allTableData.splice(i,1);
                        }
                    }
                    var obj = {};
                    for(var i=0;i<allTableData.length;i++){
                        allTableData[i].position = i;
                        obj[allTableData[i].id] = allTableData[i];
                    }
                    return {
                        obj : obj,
                        array : allTableData,
                    };
                },
                // 刷新表格数据
                refreshTable : function(refreshConfig){
                    /**
                     * refreshConfig : {} 传参配置
                     * star : 开始位置 点击/拖拽的位置
                     * end : 结束位置 拖放结束的位置
                     * seat : 在拖放位置 之前/之后
                     * 
                     * 表格数据
                     * allData : 所有数据 field数据+field-more更多数据
                     * tableData : field数据 新
                     * tableDataMore : 更多数据 新
                     * 
                     * 开始/结束对象
                     * starObj : 开始对象
                     * endObj : 结束对象
                     */
                    var star = refreshConfig.star;
                    var end = refreshConfig.end;
                    var seat = refreshConfig.seat;
                    var allData = this.tableData.concat(this.tableDataMore);
                    var tableData = [];
                    var tableDataMore = [];
                    var starObj = {};
                    var endObj = {};
                    // 获取开始/结束位置数据标识位置
                    for(var i=0;i<allData.length;i++){
                        var position = allData[i].position;
                        if(position == star){
                            starObj = allData[i];
                            allData[i] = "star";
                            starObj.class = 'current';
                            if(star!=end){
                                starObj.switch = 'switch';
                            }
                            continue;
                        }
                        if(position == end){
                            endObj = allData[i];
                            endObj.class = '';
                            allData[i] = "end";
                            continue;
                        }
                    }
                    // 判断是否在同一个里边上下拖动 在一个里边那么另一边样式不变 否则拖动位置后一个点亮 拖动对象点亮
                    if(starObj.type == endObj.type || star == end){
                        for(var i=0;i<allData.length;i++){
                            if(allData[i].type==starObj.type){
                                allData[i].class = '';
                            }
                        }
                    }else{
                        for(var i=0;i<allData.length;i++){
                            allData[i].class = '';
                        }
                        for(var i=0;i<allData.length;i++){
                            if(allData[i]=="star"){
                                if(allData[i+1]){
                                    allData[i+1].class = 'current';
                                }else{
                                    allData[i-1].class = 'current';
                                }
                                break;
                            }
                        }
                    }
                    // 替换结束标识
                    if(star == end){
                        for(var i=0;i<allData.length;i++){
                            if(allData[i] == "star"){
                                allData[i] = starObj;
                                break;
                            }
                        }
                    }else{
                        // 改变开始位置 改成与结束相同
                        starObj.type = endObj.type;
                        for(var i=0;i<allData.length;i++){
                            if(allData[i] == "end"){
                                if(seat == "before"){
                                    allData.splice(i,1,starObj,endObj);
                                }else{
                                    allData.splice(i,1,endObj,starObj);
                                }
                                break;
                            }
                        }
                    }
                    // 删除开始标识
                    for(var i=0;i<allData.length;i++){
                        if(allData[i] == "star"){
                            allData.splice(i, 1);
                            break;
                        }
                    }
                    // 删除因为数组没有数据添加的空对象
                    for(var i=0;i<allData.length;i++){
                        if(allData[i].id==""){
                            allData.splice(i,1);
                        }
                    }
                    NetstarComponent.moretable.setTableNullData(allData, "type");
                    // 整理两个数组
                    for(var i=0;i<allData.length;i++){
                        allData[i].position = i;
                        if(allData[i].type == "field"){
                            allData[i].index = tableData.length+1;
                            tableData.push(allData[i]);
                            continue;
                        }
                        if(allData[i].type == "field-more"){
                            allData[i].index = tableDataMore.length+1;
                            tableDataMore.push(allData[i]);
                            continue;
                        }
                    }
                    this.tableData = tableData;
                    this.tableDataMore = tableDataMore;
                },
                // 在一个拖动过程中，释放鼠标键时触发此事件
                drop: function(ev){
                    /**
                     * star : 开始位置 拖拽的位置
                     * end : 结束位置 拖放结束的位置
                     * seat : 在拖放位置 之前/之后
                     */
                    var star = ev.dataTransfer.getData('star');
                    // 拖放到的容器 根据容器 确定结束位置
                    var $this = $(ev.target);
                    if(ev.target.nodeName == "LI"){
                        var $tr = $this;
                    }else{
                        var $tr = $this.parent('li');
                    }
                    var end = $tr.attr('ns-position');
                    // 插入位置 之前/之后
                    var seat = 'after';
                    var height = $tr.height();
                    var pageY = $tr.offset().top;
                    var centerHeightY = pageY + height/2;
                    var mousePageY = ev.pageY;
                    if(mousePageY<centerHeightY){
                        seat = 'before';
                    }
                    // 根据获得的star/end/seat三个值刷新表格数据
                    var refreshConfig = {
                        star : star,
                        end : end,
                        seat : seat,
                    }
                    this.refreshTable(refreshConfig);
                },
                // 当某被拖动的对象在另一对象容器范围内拖动时触发此事件
                dragover: function(ev){
                    ev.preventDefault();
                },
                // 用户开始拖动元素时触发
                dragstart: function(ev){
                    // 设置开始位置
                    var $this = $(ev.target);
                    var position = $this.attr('ns-position');
                    ev.dataTransfer.setData("star", position);
                },
                dblclickSwitch : function(ev){
                    /**
                     * star : 开始位置 点击的位置
                     * end : 结束位置 拖放结束的位置
                     * seat : 在拖放位置 之前/之后
                     */
                    var $this = $(ev.currentTarget);
                    var star = $this.attr("ns-position");
                    var seat = "after";
                    var end = '';
                    var starType = $this.attr("ns-type");
                    var endTable = this.tableData; // 结束数据所在表格
                    if(starType == "field"){
                        endTable = this.tableDataMore;
                    }
                    end = endTable[endTable.length-1].position;
                    var refreshConfig = {
                        star : star,
                        end : end,
                        seat:'after',
                    }
                    this.refreshTable(refreshConfig);
                },
                clickSwitch: function(ev){
                    /**
                     * star : 开始位置 点击的位置
                     * end : 结束位置 拖放结束的位置
                     * seat : 在拖放位置 之前/之后
                     */
                    var $this = $(ev.currentTarget);
                    var star = $this.attr("ns-position");
                    var end = star;
                    var refreshConfig = {
                        star : star,
                        end : end,
                        seat:'after',
                    }
                    this.refreshTable(refreshConfig);
                },
            }
        }
        return component;
    },
    init: function(config){
        var _this = this;
        NetstarComponent.dialog[config.containerId].table = {
            source : $.extend(true, {}, config),
            config : config,
        }
        var vueComponentConfig = _this.getComponentConfig(config);
        NetstarComponent.dialog[config.containerId].table.sourceVueConfig = vueComponentConfig;
        $('#'+config.id).append('<table-panel></table-panel>');
        var vuePanel = new Vue({
            el: '#'+config.id,
            components:{
                "table-panel" : vueComponentConfig
            }
        });
        NetstarComponent.dialog[config.containerId].vueTable = vuePanel.$children[0];
        NetstarComponent.dialog[config.containerId].table.vueConfig = NetstarComponent.dialog[config.containerId].vueTable;
    }
}
// 更多按钮
NetstarComponent.morebtn = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            morebutton:  '<button class="pt-btn pt-btn-default" v-on:click="morecomponent($event)">'
                            + '更多..'
                        + '</button>',
            setbutton:  '<button class="pt-btn pt-btn-default pt-btn-icon" v-on:click="setform($event)">'
                            + '<i class="fa fa-cog"></i>'
                        + '</button>',
        },
        MOBILE:{},
    },
    getHtml: function(config){
        var templateName = config.componentTemplateName;
        var tempalte = this.TEMPLATE[templateName];
        var morebutton = tempalte.morebutton;
        var setbutton = tempalte.setbutton;
        var buttonContainer = NetstarComponent.common.otherbtncontainer;
        var content = morebutton + setbutton;
        var $buttonContainer = $(buttonContainer);
        $buttonContainer.attr(":style","styleObject");
        buttonContainer = $buttonContainer.prop('outerHTML');
        buttonContainer = buttonContainer.replace('{{nscontainer}}', content);
        return buttonContainer;
    },
    getData: function(config){},
    // 排序 field在前 field-more在后
    getSortData: function(configForm){
        var arr = [];
        // 排除隐藏
        for(var i=0;i<configForm.length;i++){
            if(configForm[i].type!="hidden"&&configForm[i].hidden!=true){
                arr.push(configForm[i]);
            }
        }
        var formArr = [];
        for(var i=0;i<arr.length;i++){
            var mindjetFieldPosition = arr[i].mindjetFieldPosition ? arr[i].mindjetFieldPosition : "field";
            if(mindjetFieldPosition == "field"){
                formArr.push(arr[i]);
            }
        }
        for(var i=0;i<arr.length;i++){
            var mindjetFieldPosition = arr[i].mindjetFieldPosition ? arr[i].mindjetFieldPosition : "field";
            if(mindjetFieldPosition == "field-more"){
                formArr.push(arr[i]);
            }
        }
        return formArr;
    },
    // 拆分field/field-more
    getSplitData: function(formArr){
        var field = [];
        var fieldMore = [];
        for(var i=0;i<formArr.length;i++){
            var mindjetFieldPosition = formArr[i].mindjetFieldPosition ? formArr[i].mindjetFieldPosition : "field";
            var fieldObj = {
                id : formArr[i].id,
                name : formArr[i].label,
                position : i,
                type : mindjetFieldPosition,
            }
            if(mindjetFieldPosition == "field-more"){
                fieldObj.index = fieldMore.length+1;
                fieldMore.push(fieldObj);
            }else{
                fieldObj.index = field.length+1;
                field.push(fieldObj);
            }
        }
        field[0].class = "current";
        fieldMore[0].class = "current";
        return {
            field : field,
            fieldMore : fieldMore,
        };
    },
    // 设置弹框body高度
    setDialogBodyHeight: function(containerId){
        var $containerDialog = $('#dialog-'+containerId);
        var $header = $containerDialog.children('.pt-modal-header');
        var $footer = $containerDialog.children('.pt-modal-footer');
        // var footerHeight = $footer.height() == 0?$footer.outerHeight():45; // 如果设置了按钮计算按钮容器的高度 否则按照一行按钮计算 45px
        var $body = $containerDialog.children('.pt-modal-body');
        var bodyHeight = $containerDialog.outerHeight() - $header.outerHeight() - $footer.outerHeight();
        $body.outerHeight(bodyHeight);
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = {
                    isMoreBtn:true,
                    btnsClass:'pt-btn-group-compact',
                    styleObject : {},
                    sourceId : 'nsMoreBtn',
                    id : 'nsMoreBtn',
                };
                if(typeof(config.moreBtnWidth)=='string'){
                    data.styleObject.width = config.moreBtnWidth;
                }
                return data;
            },
            methods: {
                // 点击任意位置关闭 点击显示时添加该事件 隐藏时关闭该事件 如：更多弹框显示时；点击按钮关闭时；点击任意位置隐藏时关闭事件
                documentClick: function(ev){
                    var $target = $(ev.target);
                    var formContainerId = config.id;
                    var $moreContainer = $('#'+formContainerId).find('[ns-type="field-more"]');
                    var $button = $('#'+formContainerId).find('.pt-btn-group.pt-btn-group-compact button').eq(0);
                    var $parent = $target.parents('[ns-type="field-more"]');
                    if(($parent.length==0||!$parent.is($moreContainer))&&!$target.is($moreContainer)&&!$target.is($button)){
                        $moreContainer.addClass('hide');
                        $(document).off('click',this.documentClick);
                    }
                },
                // 控制更多组件显示隐藏
                morecomponent: function(ev){
                    var __this = this;
                    // ev.stopImmediatePropagation();
                    var formContainerId = config.id;
                    var $moreContainer = $('#'+formContainerId).find('[ns-type="field-more"]');
                    // 隐藏其它显示的field-more
                    var $moreContainers = $('[ns-type="field-more"]');
                    if($moreContainers.length>1){
                        for(var moreI=0;moreI<$moreContainers.length;moreI++){
                            var $otherMoreContainers = $moreContainers.eq(moreI);
                            if(!$otherMoreContainers.hasClass('hide')&&!$otherMoreContainers.is($moreContainer)){
                                var formID = $otherMoreContainers.attr('ns-formid');
                                var formConfig = NetstarComponent.config[formID];
                                if(formConfig){
                                    var vueMoreBtn = formConfig.vueConfig.nsMoreBtn;
                                    $otherMoreContainers.addClass('hide');
                                    $(document).off('click',vueMoreBtn.documentClick);
                                }
                            }
                        }
                    }
                    if($moreContainer.children().length==0){
                        $moreContainer.addClass('hide');
                        return;
                    }
                    $moreContainer.toggleClass('hide');
                    if(!$moreContainer.hasClass('hide')){
                        // 显示时添加任意位置关闭
                        $(document).on('click',this.documentClick);
                    }else{
                        // 隐藏时删除任意位置关闭
                        $(document).off('click',this.documentClick);
                        return;
                    }
                    // 计算更多容器的位置
                    /**
                     * $moreContainer : 更多容器
                     *  conWidth ：容器宽度
                     *  conHeight : 容器高度
                     *  marginTop : 
                     * $btn : 当前更多按钮
                     *  height : 按钮高度
                     *  width : 按钮宽度
                     *  offset : 按钮偏移位置
                     *      offsetX : x偏移
                     *      offsetY : y偏移
                     * $window : 窗口容器
                     *  winWidth ：窗口宽度
                     *  winHeight ：窗口高度
                     */
                    var $window = $(window);
                    var winWidth = $window.width();
                    var winHeight = $window.height();
                    var conWidth = $moreContainer.outerWidth();
                    var conHeight = $moreContainer.outerHeight();
                    var marginTop = $moreContainer.css("margin-top");
                    marginTop = Number(marginTop.replace('px',''));
                    if(isNaN(marginTop)){
                        marginTop = 0;
                    }
                    var $btn = $(ev.target);
                    var offset = $btn.offset();
                    var offsetX = offset.left;
                    var offsetY = offset.top;
                    var height = $btn.outerHeight();
                    var width = $btn.outerWidth();

                    var seatX = 'right'; // 位置 左右
                    var seatY = 'bottom'; // 位置 上下
                    var left = offsetX;
                    var top = offsetY+height+marginTop;
                    if((offsetY+height+conHeight+marginTop)>winHeight){
                        seatY = 'top';
                        top = offsetY-conHeight;
                    }
                    // $moreContainer.removeClass('aequilate');
                    $moreContainer.removeClass('left');
                    $moreContainer.removeClass('right');
                    $moreContainer.removeClass('top');
                    $moreContainer.removeClass('bottom');
                    if(config.isSetPercentageComponent){
                        // 组件的宽度是百分比
                        var $form = $('#'+config.id);
                        left = $form.offset().left;
                        var moreContainerOffset = {
                            left:left,
                            top:top-marginTop,
                        }
                        var $field = $moreContainer.parent().children('[ns-type="field"]');
                        $moreContainer.width($field.width());
                        $moreContainer.css(moreContainerOffset);
                        $moreContainer.addClass(seatY);
                        // $moreContainer.addClass('aequilate');
                    }else{
                        if((offsetX+conWidth)>winWidth){
                            seatX = 'left';
                            left = offsetX-(conWidth-width);
                        }
                        var moreContainerOffset = {
                            left:left,
                            top:top,
                        }
                        $moreContainer.offset(moreContainerOffset);
                        $moreContainer.addClass(seatX + ' ' + seatY);
                    }
                },
                // 更多设置
                setform: function(ev){
                    ev.stopImmediatePropagation();
                    var formContainerId = config.id;
                    var $moreContainer = $('#'+formContainerId).find('[ns-type="field-more"]');
                    $moreContainer.addClass('hide');
                    $(document).off('click',this.documentClick);
                    var $btn = $(ev.target);
                    var moreDialog = {
                        id : config.id + '-more',
                        title : '自定义控件显示位置',
                        templateName : 'PC',
                        height:500,
                        shownHandler : function(dialogData){
                            // 排序 field在前 field-more在后
                            var formArr = _this.getSortData(config.form);
                            NetstarComponent.moretable.setTableNullData(formArr, "mindjetFieldPosition");
                            var formArrObj = _this.getSplitData(formArr);
                            var field = formArrObj.field;
                            var fieldMore = formArrObj.fieldMore;
                            var obj = {
                                formID:config.id,
                                id: dialogData.config.bodyId,
                                containerId : dialogData.config.id,
                                templateName : 'PC',
                                field:field,
                                fieldMore:fieldMore,
                            }
                            NetstarComponent.moretable.init(obj);
                            var obj = {
                                formID:config.id,
                                id: dialogData.config.footerIdGroup,
                                containerId : dialogData.config.id,
                                templateName : 'PC',
                            }
                            NetstarComponent.moreDialogBtns.init(obj);
                        },
                        mousemoveHandler : function(obj){
                            NetstarComponent.morebtn.setDialogBodyHeight(obj.config.id);
                        },
                        mouseupHandler : function(obj){
                            NetstarComponent.morebtn.setDialogBodyHeight(obj.config.id);
                        },
                    }
                    NetstarComponent.dialogComponent.init(moreDialog);
                }
            },
        }
        return component;
    },
}
// 表格列管理器
NetstarComponent.tableColumnManager = {
    // 获取非系统配置的列配置 删除序列列 删除系统列 现在用的原始数据不需要删除系统数据
    getNotSystemColumnsConfig: function(_columns){
        var columns = [];
        for(var i=0;i<_columns.length;i++){
            if(!_columns[i].isSystemColumn && typeof(_columns[i].field)!='undefined'){
                columns.push(_columns[i]);
            }
        }
        return columns;
    },
    // 排序 show在前 hide在后
    getSortData: function(__columns){
        var _columns = this.getNotSystemColumnsConfig(__columns);
        var columns = [];
        for(var i=0;i<_columns.length;i++){
            if(_columns[i].hidden != true){
                columns.push(_columns[i]);
            }
        }
        for(var i=0;i<_columns.length;i++){
            if(_columns[i].hidden == true){
                columns.push(_columns[i]);
            }
        }
        return columns;
    },
    // 判断是否需要添加空对象
    setTableNullData: function(columns){
        // 这个方法在两个地方用 type=“mindjetFieldPosition” 表示刚进入时表单所有配置 type=“type”表示更多弹框数据切换时所有表格数据配置
        // 判断是否存在空数组 即type=field/field-more的对象不存在了
        var isShow = false;
        var isHide = false;
        for(var i=0;i<columns.length;i++){
            if(columns[i].hidden!=true){
                isShow = true; 
            }else{
                isHide = true;
            }
        }
        // isShow/isHide表示长度是否为0，长度是0时添加空对象用于填充表格tbody 重新定义tableData/tableDataMore
        var nullObj = {
            index : 0,
            field : '',
            title : '暂时没有数据',
        }
        if(!isShow){
            nullObj.hidden = false;
            columns.splice(0,0,nullObj);
        }
        if(!isHide){
            nullObj.hidden = true;
            columns.splice(columns.length,0,nullObj);
        }
    },
    // 获取拆分后的数据 根据hidden==true拆分
    getSplitData: function(columns){
        var showColumns = [];
        var hideColumns = [];
        // var columns = [];
        // 排除序号列和空列
        // for(var i=0;i<_columns.length;i++){
        //     if(typeof(_columns[i].field)!='undefined'&&_columns[i].field!="NETSTAR-AUTOSERIAL"){
        //         columns.push(_columns[i]);
        //     }
        // }
        for(var i=0;i<columns.length;i++){
            var type = columns[i].hidden == true? 'field-more' : 'field';
            var columnObj = {
                id : columns[i].field,
                name : columns[i].title,
                position : i,
                type : type,
            }
            if(columns[i].field == "NETSTAR-CHECKSELECT"){
                columnObj.name = 'checkbox';
            }
            if(columns[i].hidden != true){
                columnObj.index = showColumns.length+1;
                showColumns.push(columnObj);
            }else{
                columnObj.index = hideColumns.length+1;
                hideColumns.push(columnObj);
            }
        }
        showColumns[0].class = "current";
        hideColumns[0].class = "current";
        return {
            show : showColumns,
            hide : hideColumns,
        }
    },
    // 获得根据本地存储设置的列数据
    getColumnsConfigByStore: function(source, _storeData){
        var columns = this.getNotSystemColumnsConfig(source);
        if(typeof(_storeData)!="object"){
            return columns;
        }else{
            if(typeof(_storeData.columns)!="object"){
                return columns;
            }else{
                var storeData = _storeData.columns;
            }
        }
        var storeDataNum = 0; // 本地存储的列数量
        for(var key in storeData){
            storeDataNum ++;
        }
        // 比较本地存储的列数量与现在的列数量是否一致 若不一致则不用比较排序了 直接返回排好序的
        if(columns.length!=storeDataNum){
            return columns;
        }
        var columnsObj = {}; // 通过列field为key值设置的对象
        for(var i=0;i<columns.length;i++){
            columnsObj[columns[i].field] = columns[i];
        }
        // 比较字段是否相同 若有字段改变则不用比较排序了 直接返回排好序的
        for(var key in columnsObj){
            if(typeof(storeData[key])=="undefined"){
                return columns;
            }
        }
        // 通过storeData 记录排序和显示隐藏
        for(var key in storeData){
            columnsObj[key].hidden = storeData[key].hidden;
            columnsObj[key].index = storeData[key].index;
        }
        columns = columns.sort(function(a,b){return a.index-b.index});
        return columns;
    },
    init: function(_config){
        var _this = this;
        var config = _config;
        var original = $.extend(true,{},config.original);
        var gridConfig = $.extend(true,{},config.gridConfig);
        var columnDialogConfig = {
            id : original.id + '-more',
            title : '自定义控件显示位置',
            templateName : 'PC',
            height:500,
            shownHandler : function(dialogData){
                // 排序 field表示显示 field-more表示隐藏
                var storeColumnsData = store.get(original.id);
				var columns = NetstarComponent.tableColumnManager.getColumnsConfigByStore(original.columns, storeColumnsData); // 排序
                // var columns = _this.getSortData(original.columns);
                _this.setTableNullData(columns); // 设置空数据
                var columnsObj = _this.getSplitData(columns);
                var showColumns = columnsObj.show;
                var hideColumns = columnsObj.hide;
                var obj = {
                    type:'table',
                    tableID:original.id,
                    id: dialogData.config.bodyId,
                    containerId : dialogData.config.id,
                    templateName : 'PC',
                    field:showColumns,
                    fieldMore:hideColumns,
                }
                NetstarComponent.moretable.init(obj);
                var obj = {
                    type : 'table',
                    tableID : original.id,
                    id: dialogData.config.footerIdGroup,
                    containerId : dialogData.config.id,
                    templateName : 'PC',
                }
                NetstarComponent.moreDialogBtns.init(obj);
            },
            mousemoveHandler : function(obj){
                NetstarComponent.dialogComponent.setDialogBodyHeight(obj.config.id);
            },
            mouseupHandler : function(obj){
                NetstarComponent.dialogComponent.setDialogBodyHeight(obj.config.id);
            },
        }
        NetstarComponent.dialogComponent.init(columnDialogConfig);
    }
}
// 业务组件business
NetstarComponent.business = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
            selected:       'selected',
            selectedClose:  'selectedClose',
            close :         'close',
            add :           'add',
		},
		zh:{
            selected:       '选中',
            selectedClose:  '选中并关闭',
            close :         '关闭',
            add :           '添加',
		}
    },
    TEMPLATE: {
        PC:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
            button:  '<button class="pt-btn pt-btn-default pt-btn-icon" :disabled="disabled">'
                        +'<i class="icon-copy-o"></i>'
                    + '</button>',
            clear: '<button class="pt-btn pt-btn-default pt-btn-icon clear" :disabled="disabled" :class={hide:!isShowClear} @click="clear" @mousedown="clearMousedown" @mouseup="clearMouseup">'
                        +'<i class="icon-close"></i>'
                    + '</button>',
        },
        MOBILE:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" v-model="inputText" ref="inputName" :id="id" />',
            button: '<button class="pt-btn pt-btn-white pt-btn-icon" :class="buttonClass">...</button>', 
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        100,            // 输入框宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            formSource:         'form',         // 表单 staticData/table
            textField :         'name',         // 显示字段
            idField :           'id',           // id字段
            value :             '',             // value
            source :            {},             // 查询地址
            selectMode:         'single',        // 单选 多选 不能选 single checkbox noSelect
            infoBtnName:        '基本信息',      // 弹框 查看基本信息按钮 的显示文字
            dialogTitle:        '弹框标题',      // 弹框标题
            disabled:           false,          // 是否只读
            search:             {},             // 回车查询参数
            rules :             '',             // 规则
            hidden:             false,          // 是否隐藏
            isShowDialog:       false,          // 当前业务组件的弹框是否正在显示
            isReadOutputFields: false,          // 是否配置outputFields 代码配置
            defaultPageIndex:   0,              // 默认显示页码

            isOutputString :    false,          // 是否输出字符串 通过弹框获取textField获取value
		}
        nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        // 宽度
        // if(typeof(config.inputWidth)=="string"){
        //     console.error('inputWidth必须是数字格式，否则设置默认值100');
        //     console.error(config);
        //     config.inputWidth = 100;
        // }
        // if(config.inputWidth<20){
        //     console.error('inputWidth的最小宽度是20，否则设置默认值100');
        //     console.error(config);
        //     config.inputWidth = 100;
        // }
        // config.source.type = typeof(config.source.type)=='string'?config.source.type:'GET';
        config.source.type = 'GET';
        config.search.type = typeof(config.search.type)=='string'?config.search.type:'GET';
        config.source.contentType = typeof(config.source.contentType)=='string'?config.source.contentType:'application/x-www-form-urlencoded';
        config.search.contentType = typeof(config.search.contentType)=='string'?config.search.contentType:'application/x-www-form-urlencoded';
        // 判断config.subdataAjax是否为对象且存在url 不存在删除该项配置
        if(typeof(config.subdataAjax)!="undefined"){
            if(typeof(config.subdataAjax)=="object"){
                if(typeof(config.subdataAjax.url)!="string"){
                    delete config.subdataAjax;
                    console.error("subdataAjax配置有误");
                    console.error(config);
                }else{
                    config.subdataAjax.type = typeof(config.subdataAjax.type)=='string'?config.subdataAjax.type:'GET';
                }
            }else{
                delete config.subdataAjax;
            }
        }
        if(typeof(config.getFormData)!="undefined"){
            if(typeof(config.getFormData)=="object"){
                if(typeof(config.getFormData.url)!="string"){
                    delete config.getFormData;
                    console.error("getFormData配置有误");
                    console.error(config);
                }else{
                    config.getFormData.type = typeof(config.getFormData.type)=='string'?config.getFormData.type:'GET';
                }
            }else{
                delete config.getFormData;
            }
        }
        // 设置value
        if($.isArray(config.value)||config.value===''){
        }else{
            if(typeof(config.value)=="object"){
                config.value = [config.value];
            }else{
                if((typeof(config.value)=="string"&&config.value.length>0)||typeof(config.value)=="number"){
                    // value是字符串或数字时 并且 value！=''，config.subdataAjax==‘object’保存着value否则设置value值为"",原因：兼容旧版本select
                    if(typeof(config.subdataAjax)!="object"){
                        config.value = '';
                    }
                    nsAlert('字段：' + config.id + '(' + config.label + ')value值赋值错误');
                    console.error('字段：' + config.id + '(' + config.label + ')value值赋值错误');
                    console.error(config.id);
                }else{
                    config.value = '';
                }
            }
        }
        // 设置defaultSearchData 设置搜索时默认搜索参数 
        if(typeof(config.defaultSearchData) != "object"){
            config.defaultSearchData = {};
        }else{
            config.sourceDefaultSearchData = $.extend(true, {}, config.defaultSearchData);
        }
        if(typeof(config.search.data) == "object"){
            for(var key in config.search.data){
                config.defaultSearchData[key] = config.search.data[key];
            }
        }
        config.defaultSearchData = NetstarComponent.commonFunc.getFormatData(config.defaultSearchData);
        /**lxh 缓存处理*/
        NetstarCatchHandler.setAjaxCatch(config,'source');
        // 格式化赋值表达式assignExpres 通过assignExpres配置在业务组件value改变时为表单赋值
        if(typeof(config.assignExpres) == "string"){
            config.assignExpres = JSON.parse(config.assignExpres);
        }
        config.dialogIsTab = false;
        // 弹框是tab页时处理
        if(config.source.url.indexOf(',') > -1){
            var sourceUrlArr = config.source.url.split(',');
            var dialogTitleArr = config.dialogTitle.split(',');
            if(config.defaultPageIndex >= sourceUrlArr.length){
                config.defaultPageIndex = 0;
            }
            if(!$.isArray(config.source.data)){
                config.source.data = [config.source.data];
            }
            var pageUrl = {
                index : config.defaultPageIndex,
                page : [],
            };
            for(var i=0; i<sourceUrlArr.length; i++){
                var urlStr = sourceUrlArr[i];
                var page = {
                    ajax : {
                        url : urlStr,
                        type : 'GET',
                        contentType : 'application/x-www-form-urlencoded',
                        data : typeof(config.source.data[i]) == "object" ? config.source.data[i] : {},
                    },
                    title : typeof(dialogTitleArr[i]) == "string" ? dialogTitleArr[i] : 'tab标题',
                }
                pageUrl.page.push(page);
            }
            config.pageUrl = pageUrl;
            config.dialogIsTab = true;
        }
    },
    formatConfig : function(config, formConfig){
        // 如果isOutputString==true 表示value输出字符串 通过此配置自己设置outputFields innerFields
        if(config.isOutputString){
            config.outputFields = {};
            config.idField = config.textField;
            config.outputFields[config.id] = '{' + config.textField + '}';
            config.innerFields = {};
            config.innerFields[config.textField] = '{' + config.id + '}';
        }
        if(typeof(config.outputFields) == "string"){
            // outputFields输出的不是所有的字段 不包括当前id 对应的value值
            config.outputFields = JSON.parse(config.outputFields);
        }
        if(typeof(config.outputFields) == "object" &&　!$.isEmptyObject(config.outputFields)){
            // 格式化outputFields
            config.outputFields = this.getFormatOutputFields(config);
            config.isReadOutputFields = true;
        }
        if(typeof(config.innerFields) == "string"){
            // 用于输入value
            config.innerFields = JSON.parse(config.innerFields);
        }
        if(typeof(config.innerFields) == "object" &&　!$.isEmptyObject(config.innerFields)){
            // 格式化innerFields
            config.innerFields = NetstarComponent.commonFunc.getFormatOutputFields(config.innerFields);
        }
    },
    // 获取格式化后的outputFields
    getFormatOutputFields : function(config){
        var outputFields = NetstarComponent.commonFunc.getFormatOutputFields(config.outputFields);
        return outputFields;
    },
    // 验证配置是否正确
    validatConfig: function(config){
        if(typeof(config.source.url)!='string'){
            console.error('组件配置不完整没有source配置ajax');
            console.error(config);
            return false;
        }
        if(typeof(config.search.url)!='string'){
            console.error('组件配置不完整没有search配置ajax');
            console.error(config);
            return false;
        }
        return true;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                var $button = $(tempalte.button);
                // 为每一部分添加事件属性
                // 为input和button添加事件
                // $input.attr('v-bind:style', '{width:inputWidth+"px"}');
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keydown.13', 'inputEnterDown');  // 回车事件keyup.13
                $input.attr('v-on:keyup.13', 'inputEnter');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                $input.attr('v-on:change', 'change');
                $button.attr('v-on:click', 'buttonClick');   // 按钮点击事件
                $button.attr('v-on:mousedown', 'mousedown');
                $button.attr('v-on:mouseup', 'mouseup');
                var inputHtml = $input.prop('outerHTML');   // input模板
                var buttonHtml = $button.prop('outerHTML'); // button模板
                if(config.formSource == 'form'){
                    buttonHtml += tempalte.clear;
                }
                var btncontainer = NetstarComponent.common.btncontainer;
                btncontainer = btncontainer.replace('{{nscontainer}}', buttonHtml);
                contentHtml = inputHtml + btncontainer;   // input+button整体模板
                // contentHtml += '<div :class="stateClass" ref="validate">{{validatInfo}}</div>';
                contentHtml += '<div :class="loadingClass"></div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                // contentHtml = NetstarComponent.common.staticComponent;
                // var $content = $(contentHtml);
                // // $content.attr('v-bind:style', '{width:inputWidth+"px"}');
                // $content.attr('v-bind:style', 'styleObject');
                // contentHtml = $content.prop('outerHTML');   // 静态模板
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        data.loadingClass = '';
        data.isShowClear = false;
        if(($.isArray(config.value) && config.value.length > 0)  || (typeof(config.value) == "object") && !$.isEmptyObject(config.value)){
            data.isShowClear = true;
        }
        return data;
    },
    getPageData : function(config){
        var pageData = {};
        switch(config.formSource){
            case 'form':
                var formConfigs = NetstarComponent.form[config.formID];
                if(typeof(formConfigs)!='object'){
                    console.error('表单不存在');
                    console.error(config.formID);
                    console.error(config);
                    break;
                }
                var formConfig = formConfigs.config;
                if(typeof(formConfig.getPageDataFunc)!="function"){
                }else{
                    pageData = formConfig.getPageDataFunc();
                }
                break;
            case 'table':
                if (typeof (config.getTemplateValueFunc) == "function") {
                    pageData = config.getTemplateValueFunc();
                }
                break;
        }
        return pageData;
    },
    getDefaultSearchData : function(config){
        var pageData = this.getPageData(config);
        var _defaultSearchData = {};
        var _this = {};
        if(config.formSource == 'form'){
            _this = NetstarComponent.getValues(config.formID, false);
        }
        var defaultSearchData = config.defaultSearchData;
        for(var key in defaultSearchData){
            var defaultSearchDataVal = defaultSearchData[key];
            switch(defaultSearchDataVal.type){
                case 'this':
                    var fieldId = defaultSearchDataVal.field;
                    var isObjVal = false;
                    if(fieldId.indexOf('.')>-1){
                        isObjVal = true;
                        var fieldIdArr = fieldId.split('.');
                        fieldId = fieldIdArr[0];
                        var fieldIdName = fieldIdArr[1];
                    }
                    var value = _this[fieldId];
                    var valStr = '';
                    if(!value){
                        isObjVal = false;
                    }
                    if(isObjVal){
                        if($.isArray(value)){
                            for(var i=0;i<value.length;i++){
                                if(value[i][fieldIdName]){
                                    valStr += value[i][fieldIdName] + ',';
                                }else{
                                    console.error('value之中没有待用字段'+fieldIdName);
                                    console.error(value);
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
                                    console.error(config);
                                }
                            }else{
                                console.error('value值格式错误，应该是对象类型');
                                console.error(value);
                                console.error(config);
                            }
                        }

                    }else{
                        valStr = value;
                    }
                    _defaultSearchData[key] = valStr;
                    break;
                case 'page':
                    var value = '';
                    var fieldIdArr = defaultSearchDataVal.field.split('.');
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
                    _defaultSearchData[key] = value;
                    break;
                case 'row':
                case 'table':
                    var value = '';
                    var fieldIdArr = defaultSearchDataVal.field.split('.');
                    var relationData = config.relationData ? config.relationData : {};
                    relationData = typeof(relationData[defaultSearchDataVal.type]) == "object" ? relationData[defaultSearchDataVal.type] : {};
                    if(fieldIdArr.length>0){
                        if(typeof(relationData[fieldIdArr[0]])!="undefined"){
                            value = relationData[fieldIdArr[0]];
                            if(fieldIdArr.length>1){
                                if($.isArray(relationData[fieldIdArr[0]])){
                                    var valueStr = '';
                                    for(var i=0; i<relationData[fieldIdArr[0]].length; i++){
                                        valueStr += relationData[fieldIdArr[0]][i][fieldIdArr[1]] + ',';
                                    }
                                    if(valueStr.length>0){
                                        valueStr = valueStr.substring(0,valueStr.length-1);
                                    }
                                    value = valueStr;
                                }else{
                                    if(typeof(relationData[fieldIdArr[0]])=="object"){
                                        value = relationData[fieldIdArr[0]][fieldIdArr[1]];
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
                    _defaultSearchData[key] = value;
                    break;
                case 'value':
                    _defaultSearchData[key] = defaultSearchDataVal.field;
                    break;
            }
        }
        for(var key in _defaultSearchData){
            if(_defaultSearchData[key] === '' || typeof(_defaultSearchData[key]) == "undefined"){
                delete _defaultSearchData[key];
            }
        }
        return _defaultSearchData;
    },
    dialog: {
        btnTemplate :   '<button class="pt-btn pt-btn-default">{{nsContainer}}</button>',
        BTNSTEMPLATE : '<div class="pt-panel">'
                        + '<div class="pt-container">'
                            + '<div class="pt-panel-row">'
                                + '<div class="pt-panel-col">'
                                    + '<div class="pt-btn-group" :class="btnsClass">'
                                        + '<button class="pt-btn pt-btn-default" v-on:click="selected" v-if="isSelect">{{selectName}}</button>'
                                        + '<button class="pt-btn pt-btn-default" v-on:click="selectedclose" v-if="isSelectClose">{{selectCloseName}}</button>'
                                    + '</div>'
                                + '</div>'
                                + '<div class="pt-panel-col">'
                                    + '<div class="pt-btn-group" :class="btnsClass">'
                                        + '<button class="pt-btn pt-btn-default" v-on:click="add" v-if="isAdd">{{addName}}</button>'
                                        + '<button class="pt-btn pt-btn-default" v-on:click="query" v-if="isQuery">{{queryName}}</button>'
                                        + '<button class="pt-btn pt-btn-default" v-on:click="close" v-if="isClose">{{closeName}}</button>'
                                    + '</div>'
                                + '</div>'
                            + '</div>'
                        + '</div>'
                    + '</div>',
        TABSTEMPLATE : '<div class="pt-nav">'
                            + '<ul>'
                                + '<li v-for="(tab,index) in tabs" class="pt-nav-item" :class="{current:index === currentIndex}" @click="click($event, index)">'
                                    + '<span>{{tab.title}}</span>'
                                + '</li>'
                            + '</ul>'
                        + '</div>',
        getBtnsData : function(config){
            var i18n = NetstarComponent.business.I18N[languagePackage.userLang];
            var funcs = config.returnData;
            var data = {
                btnsClass : '',

                selectName : i18n.selected,
                selectCloseName : i18n.selectedClose,
                addName : i18n.add,
                queryName : config.infoBtnName,
                closeName : i18n.close,

                isSelect : typeof(funcs.selectHandler) == "function",
                isSelectClose : typeof(funcs.selectHandler) == "function" && config.selectMode == "checkbox",
                isAdd : typeof(funcs.addHandler) == "function",
                isQuery : typeof(funcs.queryHandler) == "function",
                isClose : true,
            }
            return data;
        },
        // 获取按钮
        getBtnsTemplate:function(componentConfig, funcs){
            var i18n = NetstarComponent.business.I18N[languagePackage.userLang];
            var selectMode = componentConfig.selectMode;
            // 选中
            var selectTemplate = '';
            if(typeof(funcs.selectHandler)=="function"){
                selectTemplate = this.btnTemplate;
                selectTemplate = selectTemplate.replace('{{nsContainer}}', i18n.selected);
                var $selectTemplate = $(selectTemplate);
                $selectTemplate.attr('v-on:click', 'selected');
                selectTemplate = $selectTemplate.prop('outerHTML');
            }
            //  选中并关闭
            var selectCloseTemplate = '';
            if(typeof(funcs.selectHandler)=="function"){
                selectCloseTemplate = this.btnTemplate;
                selectCloseTemplate = selectCloseTemplate.replace('{{nsContainer}}', i18n.selectedClose);
                var $selectCloseTemplate = $(selectCloseTemplate);
                $selectCloseTemplate.attr('v-on:click', 'selectedclose');
                selectCloseTemplate = $selectCloseTemplate.prop('outerHTML');
            }
            //  添加
            var addTemplate = '';
            if(typeof(funcs.addHandler)=="function"){
                addTemplate = this.btnTemplate;
                addTemplate = addTemplate.replace('{{nsContainer}}', i18n.add);
                var $addTemplate = $(addTemplate);
                $addTemplate.attr('v-on:click', 'add');
                addTemplate = $addTemplate.prop('outerHTML');
            }
            //  查看基本信息
            var viewBaseInfoTemplate = '';
            if(typeof(funcs.queryHandler)=="function"){
                viewBaseInfoTemplate = this.btnTemplate;
                viewBaseInfoTemplate = viewBaseInfoTemplate.replace('{{nsContainer}}', componentConfig.infoBtnName);
                var $viewBaseInfoTemplate = $(viewBaseInfoTemplate);
                $viewBaseInfoTemplate.attr('v-on:click', 'query');
                viewBaseInfoTemplate = $viewBaseInfoTemplate.prop('outerHTML');
            }
            //  关闭
            var closeTemplate = this.btnTemplate;
            closeTemplate = closeTemplate.replace('{{nsContainer}}', i18n.close);
            var $closeTemplate = $(closeTemplate);
            $closeTemplate.attr('v-on:click', 'close');
            closeTemplate = $closeTemplate.prop('outerHTML');

            // var btnsTemplate = '';
            // if(selectMode == 'checkbox'){
            //     btnsTemplate = selectTemplate + selectCloseTemplate + addTemplate + viewBaseInfoTemplate + closeTemplate;
            // }else{
            //     btnsTemplate = selectTemplate + addTemplate + viewBaseInfoTemplate + closeTemplate;
            // }
            var selectBtnStr = '';
            var otherBtnStr = addTemplate + viewBaseInfoTemplate + closeTemplate;
            var btncontainer = NetstarComponent.common.otherbtncontainer;
            if(selectMode == 'checkbox'){
                selectBtnStr = selectTemplate + selectCloseTemplate;
            }else{
                selectBtnStr = selectTemplate;
            }
            selectBtnStr = btncontainer.replace("{{nscontainer}}", selectBtnStr);
            otherBtnStr = btncontainer.replace("{{nscontainer}}", otherBtnStr);
            var btnsTemplate = '<div class="pt-panel">'
                                    + '<div class="pt-container">'
                                        + '<div class="pt-panel-row">'
                                            + '<div class="pt-panel-col">' 
                                                + selectBtnStr
                                            + '</div>'
                                            + '<div class="pt-panel-col">' 
                                                + otherBtnStr
                                            + '</div>'
                                        + '</div>'
                                    + '</div>'
                                + '</div>'
            // return btnsTemplate;
            return btnsTemplate;
        },
        initBtnsAndShowPage : function(pageConfig, componentConfig, vueComponent, obj, isSearch){
            /**
             * pageConfig 页面配置参数
             * componentConfig 业务组件配置参数、
             * vueComponent 业务组件vue配置
             * obj 弹框配置
             */
            // 在模板的pageParam添加source中的data
            if(typeof(componentConfig.source.data)=="object" && !$.isEmptyObject(componentConfig.source.data)){
                pageConfig.pageParam = typeof(pageConfig.pageParam)=="object"?pageConfig.pageParam:{};
                for(var dataKey in componentConfig.source.data){
                    pageConfig.pageParam[dataKey] = componentConfig.source.data[dataKey];
                }
            }
            var _this = this;
            var inputText = '';
            if(isSearch){
                inputText = vueComponent.getInputText();
            }

            var _pageParam = NetstarComponent.business.getDefaultSearchData(componentConfig);
            var panelInitParams = {
                pageParam:                  _pageParam,      
                // {
                //     // value:inputText   // 传输参数 value：查询值 input的输入值
                // },               
                config:                     pageConfig,                     // 模板配置 通过请求的页面拿到的
                componentConfig:{
                    editorConfig:           componentConfig,                // 组件配置参数
                    container:              obj.config.bodyId,              // 容器 （id或class）通过组件拿到（组件配置）
                    selectMode:             componentConfig.selectMode,     // 单选 多选 不能选 通过组件拿到（组件配置）
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
                        // 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
                        var vueComponentWorking = NetstarComponent.config[componentConfig.formID].vueConfig[componentConfig.id];
                        vueComponentWorking.setValue(value);
                        // 跳转到下一个字段
                        vueComponentWorking.completeHandler('doubleClick', panelInitParams);
                        // if(componentConfig.selectMode != "checkbox"){
                            NetstarComponent.dialog[obj.config.id].vueConfig.close();
                        // }
                    },
                    closeHandler:            function(){
                        NetstarComponent.dialog[obj.config.id].vueConfig.close();
                    }
                },
            }
            if(inputText.length > 0){
                panelInitParams.pageParam.keyword = inputText;
            }
            var morePanel = NetstarTemplate.componentInit(panelInitParams);
            componentConfig.returnData = morePanel;
            componentConfig.sendOutData = panelInitParams;
            var btnsTemplate = _this.getBtnsTemplate(componentConfig, morePanel);
            $('#' + obj.config.footerIdGroup).append('<pagebtns></pagebtns>');
            new Vue({
                el : '#' + obj.config.footerIdGroup,
                components:{
                    'pagebtns':{
                        template:btnsTemplate,
                        data:function(){
                            return {btnsClass:''};
                        },
                        methods:{
                            selected : function(){
                                var _value = morePanel.selectHandler();
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
                                    // 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
                                    var vueComponentWorking = NetstarComponent.config[componentConfig.formID].vueConfig[componentConfig.id];
                                    vueComponentWorking.setValue(value);
                                    if(componentConfig.selectMode=="single"||componentConfig.selectMode=="radio"){
                                        NetstarComponent.dialog[obj.config.id].vueConfig.close();
                                        // 完成事件 表单：跳转到下一个字段
                                        vueComponentWorking.completeHandler('selected', panelInitParams);
                                    }else{
                                        // 完成事件 表单：跳转到下一个字段
                                        vueComponentWorking.completeHandler('selected', panelInitParams);
                                    }
                                }else{
                                    nsAlert('没有选中value值', 'error');
                                    console.error('value设置错误');
                                    console.error(_value);
                                }
                            },
                            selectedclose : function(){
                                // 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
                                var vueComponentWorking = NetstarComponent.config[componentConfig.formID].vueConfig[componentConfig.id];
                                var _value = morePanel.selectHandler();
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
                                    vueComponentWorking.setValue(value);
                                    NetstarComponent.dialog[obj.config.id].vueConfig.close();
                                    // 完成事件 表单：跳转到下一个字段
                                    vueComponentWorking.completeHandler('selectedclose', panelInitParams);
                                }else{
                                    nsAlert('没有选中value值', 'error');
                                    console.error('value设置错误');
                                    console.error(_value);
                                }
                            },
                            add : function(){
                                morePanel.addHandler();
                            },
                            query : function(){
                                morePanel.queryHandler();
                            },
                            close : function(){
                                NetstarComponent.dialog[obj.config.id].vueConfig.close();
                            }
                        }
                    },
                }
            });
        },
        // 刷新page
        refreshPage : function(pageConfig, obj){
            var _this = this;
            var vueConfig = NetstarComponent.config[obj.formID].vueConfig[obj.id];
            var config = obj;
            if(typeof(NetstarComponent.config[obj.formID])=='object'){
                config = NetstarComponent.config[obj.formID].config[obj.id];
            }
            // 初始化方法 body容器
            _this.setPageConfig(config, pageConfig);
            var panelInitParams = config.sendOutData;
            var searchData = _this.getSearchData(config, vueConfig, false);
            panelInitParams.pageParam = searchData;
            panelInitParams.config = pageConfig;
            panelInitParams.componentConfig.editorConfig = config;
            var morePanel = NetstarTemplate.componentInit(panelInitParams);
            config.returnData = morePanel;
            config.sendOutData = panelInitParams;
        },
        // 获取tab页数据
        getTabsData : function(config){
            var data = {
                tabs : $.extend(true, [], config.pageUrl.page),
                currentIndex : config.pageUrl.index,
            }
            return data;
        },
        // 显示tab页
        showTabs : function(containerId, config){
            var _this = this;
            var tabsTemplate = _this.TABSTEMPLATE;
            $('#' + containerId).html(tabsTemplate);
            var data = _this.getTabsData(config);
            config.TabsVueConfig = new Vue({
                el : '#' + containerId,
                data : data,
                watch: {},
                methods:{
                    click : function(ev, index){
                        config.pageUrl.index = index;
                        this.currentIndex = index;
                        NetstarComponent.business.buttonClick(config, {}, false, true);
                    },
                },
                mounted: function(){},
            });
        },
        // 显示按钮
        showBtns : function(containerId, config, dialogId){
            var _this = this;
            var btnsTemplate = _this.BTNSTEMPLATE;
            $('#' + containerId).html(btnsTemplate);
            var data = _this.getBtnsData(config);
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
                            // 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
                            var vueComponentWorking = NetstarComponent.config[config.formID].vueConfig[config.id];
                            vueComponentWorking.setValue(value);
                            if(config.selectMode=="single"||config.selectMode=="radio"){
                                NetstarComponent.dialog[dialogId].vueConfig.close();
                                // 完成事件 表单：跳转到下一个字段
                                vueComponentWorking.completeHandler('selected', panelInitParams);
                            }else{
                                // 完成事件 表单：跳转到下一个字段
                                vueComponentWorking.completeHandler('selected', panelInitParams);
                            }
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
                        var vueComponentWorking = NetstarComponent.config[config.formID].vueConfig[config.id];
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
                            vueComponentWorking.setValue(value);
                            NetstarComponent.dialog[dialogId].vueConfig.close();
                            // 完成事件 表单：跳转到下一个字段
                            vueComponentWorking.completeHandler('selectedclose', panelInitParams);
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
        // 获取页面data
        getSourceData : function(config){
            var ajax = config.source;
            if(config.dialogIsTab){
                ajax = config.pageUrl.page[config.pageUrl.index].ajax;
            }
            var data = ajax.data;
            return data;
        },
        // 设置页面config通过插入代码获取的config
        setPageConfig : function(config, pageConfig){
            var _this = this;
            // 在模板的pageParam添加source中的data
            var sourceData = _this.getSourceData(config);
            if(typeof(sourceData)=="object" && !$.isEmptyObject(sourceData)){
                pageConfig.pageParam = typeof(pageConfig.pageParam)=="object"?pageConfig.pageParam:{};
                for(var dataKey in sourceData){
                    pageConfig.pageParam[dataKey] = sourceData[dataKey];
                }
            }
        },
        // 获取页面搜索参数
        getSearchData : function(config, vueConfig, isSearch){
            var searchData = NetstarComponent.business.getDefaultSearchData(config);
            var inputText = '';
            if(isSearch){
                inputText = vueConfig.getInputText();
            }
            if(inputText.length > 0){
                searchData.keyword = inputText;
            }
            return searchData;
        },
        show : function(pageConfig, config, vueConfig, obj, isSearch){
            var _this = this;
            /**
             * pageConfig 页面配置参数
             * config 业务组件配置参数
             * vueConfig 业务组件vue配置
             * obj 弹框配置
             */
            // 显示tab页
            if(config.dialogIsTab){
                _this.showTabs(obj.config.headId, config);
            }
            // 初始化方法 body容器
            _this.setPageConfig(config, pageConfig);
            var searchData = _this.getSearchData(config, vueConfig, isSearch);
            var panelInitParams = {
                pageParam:                  searchData,             
                config:                     pageConfig,                     // 模板配置 通过请求的页面拿到的
                componentConfig:{
                    editorConfig:           config,                // 组件配置参数
                    container:              obj.config.bodyId,              // 容器 （id或class）通过组件拿到（组件配置）
                    selectMode:             config.selectMode,     // 单选 多选 不能选 通过组件拿到（组件配置）
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
                        // 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
                        var vueComponentWorking = NetstarComponent.config[config.formID].vueConfig[config.id];
                        vueComponentWorking.setValue(value);
                        // 跳转到下一个字段
                        vueComponentWorking.completeHandler('doubleClick', panelInitParams);
                        // if(componentConfig.selectMode != "checkbox"){
                            NetstarComponent.dialog[obj.config.id].vueConfig.close();
                        // }
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
            _this.showBtns(obj.config.footerIdGroup, config, obj.config.id);
        },
        init: function(pageConfig, componentConfig, vueComponent, isSearch){
            /**
             * pageConfig 页面配置参数
             * componentConfig 业务组件配置参数
             * vueComponent 业务组件vue配置
             */
            var _this = this;
            var inputText = vueComponent.getInputText();
            var dialogConfig = {
                id: componentConfig.fullID + '-panel',
                title: componentConfig.dialogTitle,
                templateName: 'PC',
                height:520,
                width : 700,
                isStore : true,
                isTitle : !componentConfig.dialogIsTab,
                plusClass : 'pt-business-dialog',
                shownHandler : function(obj){
                    componentConfig.isShowDialog = true;
                    _this.show(pageConfig, componentConfig, vueComponent, obj, isSearch);
                    if(typeof(componentConfig.returnData.shownHandler)=="function"){
                        componentConfig.returnData.shownHandler(componentConfig.sendOutData);
                    }
                },
                hideHandler: function(){
                    if(typeof(componentConfig.returnData.hideHandler)=="function"){
                        componentConfig.returnData.hideHandler(componentConfig.sendOutData);
                    }
                },
                hiddenHandler : function(obj){
                    componentConfig.isShowDialog = false;
                    if(NetstarComponent.business.$containerPage.length>0){
                        NetstarComponent.business.$containerPage.remove();
                    }
                    // 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
                    var vueComponentWorking = NetstarComponent.config[componentConfig.formID].vueConfig[componentConfig.id];
                    if(typeof(vueComponentWorking.closeHandler)=="function"){
                        vueComponentWorking.closeHandler(componentConfig.sendOutData);
                    }
                    if(typeof(componentConfig.returnData.hiddenHandler)=="function"){
                        componentConfig.returnData.hiddenHandler(componentConfig.sendOutData);
                    }
                },
            }
            var dialogInfo = store.get(dialogConfig.id);
            if(dialogInfo){
                for(var key in dialogInfo){
                    dialogConfig[key] = dialogInfo[key];
                }
            }
            NetstarComponent.dialogComponent.init(dialogConfig);
        },
    },
    // 通过getFormData给表单赋值
    setFormByGetFormData : function(config, vueConfig){
        // 获取表单数据
        value = vueConfig.getSourceValue(false);
        var ajaxData = value;
        if(typeof(config.getFormData.data) == 'object' && !$.isEmptyObject(config.getFormData.data)){
            ajaxData = NetStarUtils.getFormatParameterJSON(config.getFormData.data, ajaxData);
        }
        var contentType = 'application/json';
        if(typeof (config.getFormData.contentType) == "string" && config.getFormData.contentType.length > 0){
            contentType = config.getFormData.contentType;
        }
        // 发送ajax根据value值查询行数据 
        var ajaxConfig = {
            url: config.getFormData.url,
            type: typeof (config.getFormData.type) == "string" ? config.getFormData.type : 'GET',
            contentType: contentType, //"application/json",
            plusData: {
                componentId: config.id,
                formId: config.formID,
                selectedData: value,
            },
            data: ajaxData,
        }
        NetStarUtils.ajax(ajaxConfig, function (data, _ajaxConfig) {
            var _componentId = _ajaxConfig.plusData.componentId;
            var _formId = _ajaxConfig.plusData.formId;
            var _componentConfig = NetstarComponent.config[_formId].config[_componentId]; // 组件配置
            var _componentVueConfig = NetstarComponent.config[_formId].vueConfig[_componentId];; // 组件vue配置
            var resData = data;
            if (typeof (_componentConfig.getFormData.dataSrc) == "string") {
                resData = data[_componentConfig.getFormData.dataSrc];
            }
            if (typeof(resData)!="object") {
                console.error('返回的数据错误');
                console.error(data);
                console.error(_componentConfig);
                console.error(_componentVueConfig);
                return;
            }
            NetstarComponent.fillValues(resData, _formId);
        })
    },
    // 回车执行的查询ajax 回调查询后要执行的操作 如:表单中回车赋值或弹框
    // 写成单独方法的原因 表格调取组件时 回车重写 需要查询
    searchByEnter: function(config, vueConfig, callbackFunc){
        var search = config.search;
        var searchText = vueConfig.inputText;
        if(searchText.length == 0){
            var context = {
                config : config,
                vueConfig : vueConfig,
            }
            var data = {
                success : false,
            }
            if(typeof(callbackFunc) == "function"){
                callbackFunc(context, data);
            }
            return;
        }
        var _pageParam = NetstarComponent.business.getDefaultSearchData(config);
        var data = {
            searchType:"accurate",    // 查询类型:快速查询 componentSearch / quickSearch
            keyword:searchText,   
        }
        for(var key in _pageParam){
            data[key] = _pageParam[key];
        }
        var dataStr = JSON.stringify(data);
        var ajaxConfig = {
            url:search.url,
            type:search.type,
            context:{
                config:config,
                vueConfig:vueConfig,
                callbackFunc:callbackFunc,
            },
            cache:false,
            data:dataStr,
            contentType:'application/json',
            success:function(data){
                if(typeof(this.callbackFunc)=="function"){
                    this.callbackFunc(this, data);
                }
            }
        }
        // $.ajax(ajaxConfig);
        var ajaxConfig = {
            url:search.url,
            type:search.type,
            cache:false,
            data:data,
            contentType:'application/json',
            plusData:{
                callbackFunc:callbackFunc,
                componentId : config.id,
                formID : config.formID,
            },
        }
        NetStarUtils.ajax(ajaxConfig, function(data, _ajaxConfig){
            var _callbackFunc = _ajaxConfig.plusData.callbackFunc;
            var componentId = _ajaxConfig.plusData.componentId;
            var formID = _ajaxConfig.plusData.formID;
            if(typeof(_callbackFunc)=="function"){
                var _config = NetstarComponent.config[formID].config[componentId];
                var _vueConfig = NetstarComponent.config[formID].vueConfig[componentId];
                var context = {
                    config : _config,
                    vueConfig : _vueConfig,
                }
                _callbackFunc(context, data);
            }
        }, true)
    },
    // 表单中enter执行方法
    inputEnter: function(config, vueConfig){
        vueConfig.loadingClass = 'pt-form-loading';
        this.searchByEnter(config, vueConfig, function(context, data){
            var _config = context.config;
            var _vueConfig = context.vueConfig;
            _vueConfig.loadingClass = '';
            if(data.success){
                var dataSrc = _config.search.dataSrc;
                var value = data[dataSrc];
                if($.isArray(value)&&value.length==1){
                    _vueConfig.setValue(value); // 赋值
                    // 跳转下一组件
                    _vueConfig.completeHandler();
                    // var nextFieldId = _config.enterFocusField;
                    // if(nextFieldId){
                    //     var nextComponent = NetstarComponent.config[_config.formID].vueConfig[nextFieldId];
                    //     nextComponent.focus();
                    // }else{
                    //     _vueConfig.blur();
                    // }
                }else{
                    if($.isArray(value) && value.length==0){
                        value = {};
                        value[_config.textField] = _vueConfig.inputText;
                        _vueConfig.setValue(value); // 赋值
                        // 跳转下一组件
                        _vueConfig.completeHandler();
                    }else{
                        NetstarComponent.business.buttonClick(_config, _vueConfig, true);
                    }
                }
            }else{
                NetstarComponent.business.buttonClick(_config, _vueConfig, true);
            }
        });
    },
    // 截取container代码
    getContainerPage: function(pageStr,funcStr){
        var starStr = '<container>';
        var endStr = '</container>';
        // var exp = /\<container\>(.*?)\<\/container\>/;
        // var containerPage = pageStr.match(exp)[1];
        var containerPage = pageStr.substring(pageStr.indexOf(starStr)+starStr.length, pageStr.indexOf(endStr));
        // 删除init方法
        // var formatStarStr = 'pageProperty.init(pageParams, function(pageConfig){';
        // var formatEndStr = '})';
        // var containerPageStar = containerPage.substring(0, containerPage.indexOf(formatStarStr)+formatStarStr.length);
        // var containerPageEnd = containerPage.substring(containerPage.indexOf(formatEndStr));
        // containerPage = containerPageStar + funcStr + containerPageEnd;
        // containerPage = containerPage.replace('nsTemplate.init(treeListJson);',funcStr);
        var exp = /NetstarTemplate\.init\((.*?)\)/;
        var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
        containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
        return containerPage;
    },
    getPageByPageIndex : function(config){
        var pageUrl = config.pageUrl;
        var pageIndex = pageUrl.index;
        
    },
    showPageData:function(pageConfig, _config){
        var _this = this;
        var vueConfig = NetstarComponent.config[_config.formID].vueConfig[_config.id];
        var config = _config;
        if(typeof(NetstarComponent.config[_config.formID])=='object'){
            config = NetstarComponent.config[_config.formID].config[_config.id];
        }
        _this.dialog.init(pageConfig, config, vueConfig, _config.isSearch);
    },
    getPageAjax : function(config){
        var ajax = config.source;
        if(config.dialogIsTab){
            ajax = config.pageUrl.page[config.pageUrl.index].ajax;
        }
        return ajax;
    },
    buttonClick: function(config, vueConfig, isSearch, isRefresh){
        isSearch = typeof(isSearch)=="boolean"?isSearch:false;
        var ajaxInfo = this.getPageAjax(config);
        var ajaxConfig = {
            url:ajaxInfo.url,
            type:ajaxInfo.type,
            data:ajaxInfo.data,
            dataType:'text',
            plusData:{
                componentId : config.id,
                formID : config.formID,
                isSearch:isSearch,
                isRefresh : isRefresh,
            },
            contentType:ajaxInfo.contentType,
        }
        function successFunc(data, _ajaxConfig){
            var componentId = _ajaxConfig.plusData.componentId;
            var formID = _ajaxConfig.plusData.formID;
            var _isSearch = _ajaxConfig.plusData.isSearch;
            var _isRefresh = _ajaxConfig.plusData.isRefresh;
            var _configStrObj = {
                id: componentId,
                formID: formID,
                isSearch: _isSearch,
            };
            var _configStr = JSON.stringify(_configStrObj);
            var funcStr = 'NetstarComponent.business.showPageData(pageConfig, '+_configStr+')';
            if(_isRefresh){
                funcStr = 'NetstarComponent.business.dialog.refreshPage(pageConfig, '+_configStr+')';
                NetstarComponent.business.$containerPage.remove();
            }
            var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
            var $container = nsPublic.getAppendContainer();
            var $containerPage = $(containerPage);
            NetstarComponent.business.$containerPage = $containerPage;
            $container.append($containerPage);
        }
        //在这里添加查询是否已经请求过了 lxh 2019/02/18
        if(!!NetstarCatchHandler.getCatch(config.source.url)){
            successFunc(NetstarCatchHandler.getCatch(config.source.url), ajaxConfig);
        }else{
            NetStarUtils.ajaxForText(ajaxConfig, function(data, _ajaxConfig){
                successFunc(data, _ajaxConfig)
            });
        }
    },
    getInputTextByValue: function(value, config){
        var inputText = '';
        if($.isArray(value)){
            inputText = '';
            for(var valI=0;valI<value.length;valI++){
                var inputTextStr = value[valI][config.textField] ? value[valI][config.textField] : '';
                if(inputTextStr != ""){
                    inputText += inputTextStr + ',';
                }
            }
            if(inputText != ""){
                inputText = inputText.substring(0,inputText.length-1);
            }
        }else{
            if(!$.isArray(value)&&typeof(value)=="object"){
                inputText = value[config.textField] ? value[config.textField] : '';
            }else{
                inputText = '';
            }
        }
        return inputText;
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                if(value === ''){
                    isTrue = false;
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch:{
                inputText:function(value,oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                }
            },
            methods: {
                clearMousedown: function(){
                    this.isValidatValue = false;
                },
                clearMouseup: function(){
                    this.isValidatValue = true;
                },
                // 清空
                clear : function(ev){
                    var _this = this;
                    this.setValue('');
                },
                // 关闭弹框后执行的方法 表单不需要 会删除掉
                closeHandler:function(obj){
                    // console.warn('/*******关闭弹框，表单中此方法没用********/');
                    // console.warn(obj);
                },
                // 组件执行完成方法
                // 在表单中执行：回车跳转到下一个字段
                // 这个方法在其他地方需要自己写 例如：表格中
                completeHandler: function(btnName, pageJson){
                    /**
                     * btnName : 按钮名字
                     * pageJson : 弹框页面的相关参数 表单中不需要 表格中有用
                     */
                    if(btnName == 'selected' && config.selectMode == 'checkbox'){
                        // 多选时的选中按钮不执行跳转
                        return;
                    }
                    if(typeof(config.getFormData) == "object"){
                        _this.setFormByGetFormData(config, this);
                    }
                    NetstarComponent.setNextComponentFocus(config, this);
                },
                // 回车
                inputEnter:function(ev){
                    ev.stopImmediatePropagation();
                    if(!this.isEnterDown){
                        return ;
                    }
                    this.isEnterDown = false;
                    if(config.isShowDialog&&typeof(config.returnData)=="object"&&typeof(config.returnData.documentEnterHandler)=='function'){
                        config.returnData.documentEnterHandler();
                    }else{
                        _this.inputEnter(config, this);
                    }
                },
                inputEnterDown:function(){
                    this.isEnterDown = true;
                },
                // 点击
                buttonClick:function(){
                    _this.buttonClick(config);
                },
                // 按钮按下
                mousedown:function(){
                    this.isValidatValue = false;
                },
                // 按钮松开
                mouseup:function(){
                    this.isValidatValue = true;
                },
                // 获取inputText
                getInputText:function(){
                    return this.inputText;
                },
                // 设置inputText
                setInputText:function(inputText){
                    this.inputText = inputText;
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取原始value
                getSourceValue : function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var value = config.value;
                    // 获得idField
                    if(typeof(config.subdataAjax)=="object"){
                        var valueStr = '';
                        for(var valI=0;valI<value.length;valI++){
                            var valueStr1 = value[valI][config.idField]?value[valI][config.idField]:"";
                            if(valueStr1!=""){
                                valueStr += valueStr1 + ',';
                            }
                        }
                        if(valueStr.length>0){
                            valueStr = valueStr.substring(0,valueStr.length-1);
                        }
                        value = valueStr;
                    }
                    if(config.selectMode=="single"||config.selectMode=="radio"){
                        // 单选value返回对象
                        if(value.length>1){
                            console.error("字段："+config.id+"是单选格式，配置value错误");
                            console.error(config);
                            return false;
                        }
                        if(value.length==1){
                            value = value[0];
                        }
                        if(value.length==0){
                            value = "";
                        }
                    }else{
                        // 多选value返回list
                    }
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    var value = this.getSourceValue(isValid);
                    if(config.isReadOutputFields && typeof(value) == 'object'){
                        value = $.isArray(value) ? value : [value];
                        value = NetstarComponent.commonFunc.getBusinessValueByValObj(value, config);
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    if($.isArray(value)||value===''){
                    }else{
                        if(typeof(value)=="object"){
                            value = [value];
                        }else{
                            if(typeof(config.subdataAjax)=="object"){
                                var subdata = config.subdataAjax.subdata;
                                var valueArr = [];
                                var valueStrArr = value.split(',');
                                for(var valStrI=0;valStrI<valueStrArr.length;valStrI++){
                                    for(var subI=0;subI<subdata.length;subI++){
                                        if(subdata[subI][config.idField]==valueStrArr[valStrI]){
                                            valueArr.push(subdata[subI]);
                                        }
                                    }
                                }
                                if(valueArr.length>0){
                                    value = valueArr;
                                }
                            }
                            if(typeof(value)!="object"){
                                console.error(config.id+'设置value值错误！');
                                console.error(value);
                                console.error(config);
                                return ;
                            }
                        }
                    }
                    if(config.selectMode=="single"||config.selectMode=="radio"){
                        // 单选value返回对象
                        if(value.length>1){
                            console.error("字段："+config.id+"是单选格式，配置value错误");
                            console.error(config);
                            return false;
                        }
                        if(value.length==1){
                            value = value[0];
                        }
                        if(value.length==0){
                            value = "";
                        }
                    }else{
                        // 多选value返回list
                    }
                    var sourceValue = config.value;
                    config.value = value;
                    var isInputTextError = false;
                    this.inputText = _this.getInputTextByValue(value, config);
                    if(value!=""&&this.inputText==""){
                        isInputTextError = true;
                    }
                    if(isInputTextError){
                        console.error("组件的textField配置错误，不能显示value值");
                        console.error(value);
                        console.error(config);
                    }
                    var isSame = true;
                    // 判断是否改变
                    if(typeof(sourceValue)!=typeof(value)){
                        isSame = false;
                    }else{
                        if(typeof(sourceValue)=='object'){
                            isSame = nsVals.isEqualObject(sourceValue,value);
                        }else{
                            if(sourceValue != value){
                                isSame = false;
                            }
                        } 
                    }
                    if(!isSame){
                        this.change();
                    }
                },
                // 设置焦点
                focusHandler: function(ev){
                    $(ev.target).select();
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    // 修改显示值 根据value
                    if(this.isValidatValue){
                        var isInputTextError = false;
                        var value = config.value;
                        this.inputText = _this.getInputTextByValue(value, config);
                        if(value!=""&&this.inputText==""){
                            isInputTextError = true;
                        }
                        if(isInputTextError){
                            console.error("组件的textField配置错误，不能显示value值");
                            console.error(value);
                            console.error(config);
                        }
                        this.getValue();
                        // 判断是否执行blurHandler
                        NetstarComponent.formBlurHandler(config, this);
                    }
                },
                // 失去焦点
                blur: function(){
                    this.$refs.inputName.blur();
                },
                // 改变 change
                change: function(){
                    var text = this.inputText;
                    // var value = config.value;
                    var value = this.getValue(false);
                    if(($.isArray(config.value) && config.value.length > 0)  || (typeof(config.value) == "object") && !$.isEmptyObject(config.value)){
                        this.isShowClear = true;
                    }else{
                        this.isShowClear = false;
                    }
                    var vueConfig = this;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                    if(typeof(config.relationField)=="string"){
                        NetstarComponent.commonFunc.refreshComponentByRelationField(config);
                        // var relationField = config.relationField;
                        // if(NetstarComponent.config[config.formID]){
                        //     var vueComponent = NetstarComponent.config[config.formID].vueConfig[relationField];
                        //     if(typeof(vueComponent)=='object'){
                        //         vueComponent.ajaxLoading = true;
                        //     }
                        // }
                    }
                    if(typeof(config.assignExpres) == "object" && config.selectMode == "single"){
                        var sourceValue = this.getSourceValue(false);
                        var formID = config.formID;
                        var formData = NetStarUtils.getFormatParameterJSON(config.assignExpres, sourceValue);
                        NetstarComponent.fillValues(formData, formID);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改
                    NetstarComponent.editVueComponent(obj, this, config);
                },
                // 获取subdata
                getSubdata: function(){
                    var __this = this;
                    var ajaxConfig = {
                        url : config.subdataAjax.url,
                        type : config.subdataAjax.type,
                        data: config.subdataAjax.data,
                        context: 	{
                            config:config,
                            vueConfig:__this,
                        }, //返回的this指向组件配置
                        dataType: 	'json',
                        success:function(res){
                            var ___this = this;
                            var _config = ___this.config;
                            var _vueConfig = ___this.vueConfig;
                            var subdata = res;
                            if(typeof(_config.subdataAjax.dataSrc)=="string"){
                                subdata = res[_config.subdataAjax.dataSrc];
                            }
                            if(!$.isArray(subdata)){
                                subdata = [];
                                console.error('ajax获得的subdata格式错误');
                                console.error(res);
                                console.error(_config);
                            }
                            _config.subdataAjax.subdata = subdata;
                            if(typeof(_config.value)=="string"&&_config.value.length>0){
                                for(var i=0;i<subdata.length;i++){
                                    if(subdata[i][_config.idField] == _config.value){
                                        _config.value = [subdata[i]];
                                        _vueConfig.inputText = subdata[i][_config.textField];
                                    }
                                }
                            }
                            if(typeof(_config.value)=="string"&&_config.value.length>0){
                                console.error('value值设置错误：'+_config.value);
                                console.error(_config);
                            }
                        }
                    }
                    $.ajax(ajaxConfig);
                }
            },
            mounted : function(){
                if(typeof(config.subdataAjax)=="object"){
                    this.getSubdata();
                }
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            },
        }
        return component;
    },
}
// 下拉业务组件
NetstarComponent.businessSelect = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
            selected:       'selected',
            selectedClose:  'selectedClose',
            close :         'close',
            add :           'add',
		},
		zh:{
            selected:       '选中',
            selectedClose:  '选中并关闭',
            close :         '关闭',
            add :           '添加',
		}
    },
    TEMPLATE: {
        PC:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
            button:  '<button class="pt-btn pt-btn-default pt-btn-icon" :disabled="disabled">'
                        +'<i class="icon-copy-o"></i>'
                    + '</button>',
            clear: '<button class="pt-btn pt-btn-default pt-btn-icon clear" :disabled="disabled" :class={hide:!isShowClear} @click="clear" @mousedown="clearMousedown" @mouseup="clearMouseup">'
                        +'<i class="icon-close"></i>'
                    + '</button>',
        },
        MOBILE:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" v-model="inputText" ref="inputName" :id="id" />',
            button: '<button class="pt-btn pt-btn-white pt-btn-icon" :class="buttonClass">...</button>', 
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        100,            // 输入框宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            formSource:         'form',         // 表单 staticData/table
            textField :         'name',         // 显示字段
            idField :           'id',           // id字段
            value :             '',             // value
            source :            {},             // 模板地址
            selectMode:         'single',       // 单选 多选 single multi
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            hidden:             false,          // 是否隐藏
            //如果不是个表达式，则视为textField 例如：shopName  => <li>{{shopName}}</li>
            //如果是个表达式, 则解析 例如 <li><span class="title">{{shopName}}</span><span class="note">{{shopClass}} 电话：{{shopTel}}</span></li>
            //该表达式解析为 => <li><span class="title">济宁林场贸易公司</span><span class="note">VIP客户 电话：0388-98554412</span></li>
            listExpression:     '',             // 显示表达式
		}
        nsVals.setDefaultValues(config, defaultConfig);
        // 设置listExpression（表达式的默认值）
        if(config.listExpression === ''){
            config.listExpression = '<li>{{' + config.textField + '}}</li>';
        }
        if(config.selectMode != 'single'){
            config.selectMode = 'multi';
        }
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        config.source.type = typeof(config.source.type)=='string'?config.source.type:'GET';
        // 设置value
        if($.isArray(config.value)||config.value===''){
            config.value = config.value.length==0 ? '' : config.value;
        }else{
            if(typeof(config.value)=="object"){
                config.value = [config.value];
            }else{
                config.value = '';
                nsAlert('字段：' + config.id + '(' + config.label + ')value值赋值错误');
                console.error('字段：' + config.id + '(' + config.label + ')value值赋值错误');
                console.error(config);
            }
        }
        // 设置defaultSearchData 设置搜索时默认搜索参数 
        if(typeof(config.defaultSearchData) != "object"){
            config.defaultSearchData = {};
        }else{
            config.sourceDefaultSearchData = $.extend(true, {}, config.defaultSearchData);
            config.defaultSearchData = NetstarComponent.commonFunc.getFormatData(config.defaultSearchData);
        }
        if(typeof(config.getFormData)!="undefined"){
            if(typeof(config.getFormData)=="object"){
                if(typeof(config.getFormData.url)!="string"){
                    delete config.getFormData;
                    console.error("getFormData配置有误");
                    console.error(config);
                }else{
                    config.getFormData.type = typeof(config.getFormData.type)=='string'?config.getFormData.type:'GET';
                }
            }else{
                delete config.getFormData;
            }
        }
        // 格式化赋值表达式assignExpres 通过assignExpres配置在业务组件value改变时为表单赋值
        if(typeof(config.assignExpres) == "string"){
            config.assignExpres = JSON.parse(config.assignExpres);
        }
    },
    formatConfig : function(config, formConfig){
        if(typeof(config.outputFields) == "string"){
            // outputFields输出的不是所有的字段 不包括当前id 对应的value值
            config.outputFields = JSON.parse(config.outputFields);
        }
        if(typeof(config.outputFields) == "object" &&　!$.isEmptyObject(config.outputFields)){
            // 格式化outputFields
            config.outputFields = this.getFormatOutputFields(config);
            config.isReadOutputFields = true;
        }
        if(typeof(config.innerFields) == "string"){
            // 用于输入value
            config.innerFields = JSON.parse(config.innerFields);
        }
        if(typeof(config.innerFields) == "object" &&　!$.isEmptyObject(config.innerFields)){
            // 格式化innerFields
            config.innerFields = NetstarComponent.commonFunc.getFormatOutputFields(config.innerFields);
        }

    },
    // 获取格式化后的outputFields
    getFormatOutputFields : function(config){
        var outputFields = NetstarComponent.commonFunc.getFormatOutputFields(config.outputFields);
        return outputFields;
    },
    // 验证配置是否正确
    validatConfig: function(config){
        if(typeof(config.source.url)!='string'){
            console.error('组件配置不完整没有source配置ajax');
            console.error(config);
            return false;
        }
        return true;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                var $button = $(tempalte.button);
                // 为每一部分添加事件属性
                // 为input和button添加事件
                $input.attr('v-bind:style', 'styleObject');
                // $input.attr('v-on:keyup.13', 'inputEnter');  // 回车事件keyup.13
                $input.attr('v-on:keyup', 'keyup');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                $input.attr('v-on:change', 'change');
                $button.attr('v-on:click', 'buttonClick');   // 按钮点击事件
                $button.attr('v-on:mousedown', 'mousedown');
                $button.attr('v-on:mouseup', 'mouseup');
                var inputHtml = $input.prop('outerHTML');   // input模板
                var buttonHtml = $button.prop('outerHTML'); // button模板
                buttonHtml += tempalte.clear;
                var btncontainer = NetstarComponent.common.btncontainer;
                btncontainer = btncontainer.replace('{{nscontainer}}', buttonHtml);
                contentHtml = inputHtml + btncontainer;   // input+button整体模板
                // contentHtml += '<div :class="stateClass" ref="validate">{{validatInfo}}</div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        data.isShowClear = false;
        if(($.isArray(config.value) && config.value.length > 0)  || (typeof(config.value) == "object") && !$.isEmptyObject(config.value)){
            data.isShowClear = true;
        }
        return data;
    },
    select: {
        template : {
            container : '<div class="pt-dropdown" :name="id">'
                            + '<input type="text" class="pt-form-control" ref="focusInput" v-on:keyup="keyup">'
                            + '<ul class="pt-dropdown-components" ref="allList" :style="allListStyle">'
                                + '<template v-for="(listData,index) in list">'
                                    + '{{nsList}}'
                                + '</template>'
                            + '</ul>'
                            + '<ul class="pt-tags-group" :class="[{\'no-data\':selectList.length==0},{hide:type==\'single\'}]" :style="selectedStyle">'
                                + '<template v-for="(selectListData,index) in selectList">'
                                    + '{{nsSelectList}}'
                                + '</template>'
                            + '</ul>'
                            + '<div class="pt-btn-group">'
                                + '<button class="pt-btn pt-btn-primary pt-btn-icon add" @click="add"  :class="{hide:!isHaveAdd}">'
                                    + '<i class="icon-add"></i>'
                                    + '新增'
                                + '</button>'
                                // + '<button class="pt-btn pt-btn-default pt-btn-icon" @click="query">'
                                //     + '<i class="fa fa-search"></i>'
                                //     + '查询'
                                // + '</button>'
                                + '<button class="pt-btn pt-btn-default pt-btn-icon clear" @click="clear">'
                                    +'<i class="icon-trash-o"></i>'
                                + '</button>'
                                // + '<button class="pt-btn pt-btn-default pt-btn-icon" @click="close">'
                                //     +'<i class="icon-close"></i>'
                                // + '</button>'
                            + '</div>'
                        + '</div>',
        },
        // 获取格式化的表达式
        getFormatListExpression : function(listExpression, listName){
            var rex1 = /\{\{(.*?)\}\}/g;
            var rex2 = /\{\{(.*?)\}\}/;
            var str = listExpression;
            if(rex2.test(listExpression)){
                var strArr = listExpression.match(rex1);
                for(var i=0; i<strArr.length; i++){
                    var conStr = '{{' + listName + '.' + strArr[i].match(rex2)[1] + '}}';
                    str = str.replace(strArr[i], conStr);
                }
            }
            var $str = $(str);
            var attr = {
                'ns-name' : listName,
                ':ns-index' : 'index',
                'v-on:click' : 'clickSelect',
                'v-on:dblclick' : 'dblclickSelect',
                ':class' : '{active:('+listName+'.isHover===true),selected:'+listName+'.isSelected===true}',
                // 'tabindex' : -1,
            };
            $str.attr(attr);
            str = $str.prop('outerHTML');
            return str;
        },
        // 设置下拉框内容
        setSelectContent: function(config, contentId){
            var _this = this;
            var listHtml = _this.getFormatListExpression(config.listExpression, 'listData');
            var selectListHtml = _this.getFormatListExpression(config.listExpression, 'selectListData');
            var html = _this.template.container;
            html = html.replace('{{nsList}}', listHtml);
            html = html.replace('{{nsSelectList}}', selectListHtml);

            var $form = $("#"+config.formID);
            var $container = $form.closest('container');
            if($container.length==0){
                $container = $('body');
            }
            var content = '<div id="'+contentId+'" class="pt-input-group pt-businessselect-panel" style="height:0px;">'
                                + html
                            + '</div>';
            $container.append(content);
        },
        // 格式化list selectList 通过list selectList
        getFormatTwoList : function(list, selectList, config){
            var idField = config.idField;
            for(var listI=0; listI<list.length; listI++){
                var isSelected = false;
                for(var selI=0; selI<selectList.length; selI++){
                    if(list[listI][idField] === selectList[selI][idField]){
                        isSelected = true;
                        break;
                    }
                }
                if(isSelected){
                    list[listI].isSelected = true;
                    list[listI].isHover = false;
                }else{
                    list[listI].isSelected = false;
                    list[listI].isHover = false;
                }
            }
            for(var selI=0; selI<selectList.length; selI++){
                selectList[selI].isSelected = true;
                selectList[selI].isHover = false;
            }
            if(list.length > 0){
                list[0].isHover = true;
            }else{
                if(selectList.length > 0){
                    selectList[0].isHover = true;
                }
            }
            return {
                list : list,
                selectList : selectList
            };
        },
        // 获得列表数据
        getData : function(config){
            var _this = this;
            var returnData = config.returnData;
            var list = returnData.list;
            var selectList = returnData.selectList;
            var listObj = _this.getFormatTwoList(list, selectList, config);
            list = listObj.list;
            selectList = listObj.selectList;
            var data = {
                isShowSelect : true,
                id : config.fullID,
                list : list,
                selectList : selectList,
                type : config.selectMode,
                selectedStyle : {},
                allListStyle : {},
                isHaveAdd : typeof(returnData.addHandler) == "function",
            }
            return data;
        },
        // 获取选中值
        getSelected : function(arr, config){
            var selectList = [];
            for(var arrI=0; arrI<arr.length; arrI++){
                if(arr[arrI].isSelected){
                    var obj = $.extend(true, {}, arr[arrI]);
                    var fieldId = config.idField;
                    var isHadSelected = false;
                    for(var i=0; i<selectList.length; i++){
                        if(obj[fieldId]===selectList[i][fieldId]){
                            isHadSelected = true;
                            break;
                        }
                    }
                    if(!isHadSelected){
                        delete obj.isSelected;
                        delete obj.isHover;
                        selectList.push(obj);
                    }
                }
            }
            return selectList;
        },
        // 清空选中
        clearSelected : function(arr, index){
            // index 清空除index以外的选中 若果index不是数字全部清空
            var isAllClear = typeof(index)=="number" ? false : true;
            if(isAllClear){
                for(var arrI=0; arrI<arr.length; arrI++){
                    arr[arrI].isSelected = false;
                }
            }else{
                for(var arrI=0; arrI<arr.length; arrI++){ 
                    if(index !== arrI){
                       arr[arrI].isSelected = false;
                    }
                }
            }
        },
        // 清空hover
        clearHover : function(arr){
            for(var arrI=0; arrI<arr.length; arrI++){
                arr[arrI].isHover = false;
            }
        },
        // 单选
        getListsSingleSelect : function($li, list, selectList, isJudge, idFiled){
            // isJudge 是否判断当前是否选择状态 true 判断：若果选中取消没选中选中 false 不判断：无论选中都执行选中
            var _this = this;
            var nsIndex = Number($li.attr('ns-index'));
            var nsName = $li.attr('ns-name');
            var liData = {};
            if(nsName == "listData"){
                liData = list[nsIndex];
                _this.clearSelected(list, nsIndex);
                _this.clearSelected(selectList);
            }else{
                liData = selectList[nsIndex];
                _this.clearSelected(selectList, nsIndex);
                _this.clearSelected(list);
            }
            _this.clearHover(list);
            _this.clearHover(selectList);
            
            if(isJudge){
                if(liData.isSelected){
                    liData.isSelected = false;
                }else{
                    liData.isSelected = true;
                }
            }else{
                liData.isSelected = true;
            }
            selectList = [];
            if(liData.isSelected){
                selectList = [$.extend(true, {}, liData)];
            }
            liData.isHover = true;
            return {
                list : list,
                selectList : selectList
            }
        },
        // 多选
        getListsMultipleSelect : function($li, list, selectList, isJudge, idField){
            // isJudge 是否判断当前是否选择状态 true 判断：若果选中取消没选中选中 false 不判断：无论选中都执行选中
            var _this = this;
            var nsIndex = Number($li.attr('ns-index'));
            var nsName = $li.attr('ns-name');
            var liData = {};
            if(nsName == "listData"){
                liData = list[nsIndex];
            }else{
                liData = selectList[nsIndex];
            }
            _this.clearHover(list);
            _this.clearHover(selectList);
            if(isJudge){
                if(liData.isSelected){
                    liData.isSelected = false;
                }else{
                    liData.isSelected = true;
                }
            }else{
                liData.isSelected = true;
            }
            for(var listI=0; listI<list.length; listI++){
                if(list[listI][idField]===liData[idField]){
                    list[listI].isSelected = liData.isSelected;
                    break;
                }
            }
            var isHadSelect = false;
            for(var selectI=0; selectI<selectList.length; selectI++){
                if(selectList[selectI][idField]===liData[idField]){
                    isHadSelect = true;
                    if(!liData.isSelected){
                        selectList.splice(selectI, 1);
                    }
                    break;
                }
            }
            if(liData.isSelected && !isHadSelect){
                selectList.push(liData);
            }
            liData.isHover = true;
            return {
                list : list,
                selectList : selectList
            }
        },
        // 获取当前li 通过上一个
        setHoverData : function(keyCode, list, selectList, config){
            var _this = this;
            var $container = $('#'+config.selectContainerId).find('ul').eq(0);
            var $li = $container.find('li.active');
            var $currentLi = $li;
            if($li.length == 1){
                var nsIndex = Number($li.attr('ns-index'));
                var nsName = $li.attr('ns-name');
                var currentName = nsName;
                var currentIndex = 0;
                var currentList = nsName == "listData" ? list : selectList;
                switch(keyCode){
                    case 38:
                        if(nsIndex == 0){
                            if(nsName == "listData"){
                                if(selectList.length>0){
                                    currentName = 'selectListData';
                                    currentList = selectList;
                                }else{
                                    currentIndex = list.length-1;
                                    currentList = list;
                                }
                            }else{
                                if(list.length>0){
                                    currentName = 'listData';
                                    currentList = list;
                                }else{
                                    currentIndex = selectList.length-1;
                                    currentList = selectList;
                                }
                            }
                        }else{
                            currentIndex = nsIndex - 1;
                        }
                        break;
                    case 40:
                        if(nsIndex == currentList.length-1){
                            if(nsName == "listData"){
                                if(selectList.length>0){
                                    currentName = 'selectListData';
                                    currentList = selectList;
                                }else{
                                    currentIndex = 0;
                                    currentList = list;
                                }
                            }else{
                                if(list.length>0){
                                    currentName = 'listData';
                                    currentList = list;
                                }else{
                                    currentIndex = 0;
                                    currentList = selectList;
                                }
                            }
                        }else{
                            currentIndex = nsIndex + 1;
                        }
                        break;
                }
                _this.clearHover(list);
                _this.clearHover(selectList);
                currentList[currentIndex].isHover = true;
            }else{
                console.error('未知错误,lyw');
            }
        },
        // 获得isHover==true的数据
        getHoverJQLi : function(config){
            var _this = this;
            var $container = $('#'+config.selectContainerId);
            var $li = $container.find('li.active');
            return $li;
        },
        // 刷新下拉框 通过list selectList
        refresh : function(config, vueConfig){
            var returnData = config.returnData;
            var _returnData = this.getFormatTwoList(returnData.list, returnData.selectList, config);
            var list = _returnData.list;
            var selectList = _returnData.selectList;
            config.selectVuePanel.list = list;
            config.selectVuePanel.selectList = selectList;
            this.setfocusInputFocus(config.selectVuePanel, vueConfig);
        },
        // 设置input焦点使业务组件的input失去焦点
        setfocusInputFocus : function(selectVuePanel, vueConfig){
            vueConfig.isValidatValue = false;
            selectVuePanel.$refs.focusInput.focus();
            vueConfig.isValidatValue = true;
        },
        // 完成选中 并跳转
        completeSelect : function(config, vueConfig){
            var _this = this;
            var selectVuePanel = config.selectVuePanel;
            // var valueList = selectVuePanel.getValue();
            // vueConfig.setValue(valueList);
            selectVuePanel.close();
            // 跳转
            NetstarComponent.setNextComponentFocus(config, vueConfig);
        },
        // 获取选中
        getRefreshLists : function(list, selectList, idField){
            for(var listI=0; listI<list.length; listI++){
                if(list[listI].isSelected){
                    var isHadSelected = false;
                    for(var selectI=0; selectI<selectList.length; selectI++){
                        if(list[listI][idField] === selectList[selectI][idField]){
                            isHadSelected = true;
                            break;
                        }
                    }
                    if(!isHadSelected){
                        selectList.push(list[listI]);
                    }
                }
            }
            for(var selectI=0; selectI<selectList.length; selectI++){
                for(var listI=0; listI<list.length; listI++){
                    if(list[listI][idField] === selectList[selectI][idField]){
                        list[listI].isSelected = selectList[selectI].isSelected;
                        break;
                    }
                }
            }
            var _selectList = [];
            for(var selectI=0; selectI<selectList.length; selectI++){
                if(selectList[selectI].isSelected){
                    _selectList.push(selectList[selectI]);
                }
            }
            return {
                list : list,
                selectList : _selectList
            };
        },
        init: function(config, vueConfig){
            /**
             * config 业务组件配置参数 :returnData 页面配置返回参数
             * vueConfig 业务组件vue配置
             */
            var _this = this;
            // 关闭其它业务组件下拉框
            // NetstarComponent.businessSelect.closeSelect();
            // 开始初始化下拉框
            var contentId = "ns-businessSelect-"+config.id;
            _this.setSelectContent(config, contentId); // 添加下拉框内容
            config.selectContainerId = contentId;
            var data = _this.getData(config);
            config.selectVuePanel = new Vue({
                el: '#' + contentId,
                data: data,
                watch: {
                    isShowSelect : function(value){
                        vueConfig.isShowSelect = value;
                    },
                },
                methods: {
                    setSelected : function($li, isJudge){
                        // isJudge 是否判断当前是否选择状态 true 判断：若果选中取消没选中选中 false 不判断：无论选中都执行选中
                        isJudge = typeof(isJudge)=="boolean"?isJudge:true;
                        var list = $.extend(true, [], this.list);
                        var selectList = $.extend(true, [], this.selectList);
                        if(config.selectMode == "single"){
                            // 单选
                            // _this.singleSelect($li, list, selectList, isJudge);
                            var lists = _this.getListsSingleSelect($li, list, selectList, isJudge, config.idField);
                            list = lists.list;
                            selectList = lists.selectList;
                        }else{
                            // 多选
                            // _this.multipleSelect($li, list, selectList, isJudge);
                            var lists = _this.getListsMultipleSelect($li, list, selectList, isJudge, config.idField);
                            list = lists.list;
                            selectList = lists.selectList;
                        }
                        this.list = list;
                        this.selectList = selectList;
                    },
                    clickSelect : function(ev){
                        var __this = this;
                        __this.$refs.focusInput.focus();
                        switch(__this.type){
                            case "single":
                                var $li = $(ev.currentTarget);
                                __this.setSelected($li, false);
                                _this.completeSelect(config, vueConfig);
                                break;
                            default:
                                clearTimeout(__this.clickTimeOut);
                                var $li = $(ev.currentTarget);
                                // 为了双击时阻止单击事件
                                __this.clickTimeOut = setTimeout(function(){
                                    __this.setSelected($li);
                                }, 200)
                                break;
                        }
                    },
                    dblclickSelect : function(ev){
                        var __this = this;
                        if(__this.type == "single"){
                            return;
                        }
                        clearTimeout(this.clickTimeOut); // 阻止单击事件
                        var $li = $(ev.currentTarget);
                        __this.setSelected($li, false);
                        _this.completeSelect(config, vueConfig);
                    },
                    add : function(){
                        var __this = this;
                        config.returnData.addHandler(function(addData){
                            // addData object表示一条数据 array表示多条数据
                            __this.setValue(addData);
                        });
                        this.close();
                    },
                    query : function(){
                        config.returnData.queryHandler();
                    },
                    clear : function(){
                        var returnData = $.extend(true, {}, config.sourceReturnData);
                        returnData.selectList = [];
                        config.returnData = returnData;
                        _this.refresh(config, vueConfig);
                        vueConfig.setValue('');
                    },
                    close : function(){
                        var valueList = this.getValue();
                        vueConfig.setValue(valueList);
                        if(typeof(config.getFormData) == "object"){
                            NetstarComponent.business.setFormByGetFormData(config, vueConfig);
                        }
                        vueConfig.isShowSelect = false;
                    },
                    getValue : function(){
                        var list = $.extend(true, [], this.list);
                        var selectList = $.extend(true, [], this.selectList);
                        var allList = list.concat(selectList);
                        var _selectList = _this.getSelected(allList, config);
                        return _selectList;
                    },
                    keydown : function(ev){
                        switch(ev.keyCode){
                            case 32:
                            // case 40:
                                ev.preventDefault();
                                break;
                        }
                    },
                    keyup : function(ev){
                        ev.stopImmediatePropagation();
                        var __this = this;
                        var list = $.extend(true, [], __this.list);
                        var selectList = $.extend(true, [], __this.selectList);
                        var id = __this.id;
                        var $input = $('#' + id);
                        switch(ev.keyCode){
                            case 38:
                                // 上
                                var $ul = $('[name="' + config.fullID + '"].pt-dropdown').find('ul.pt-dropdown-components');
                                var $lis = $ul.find('li');
                                var $li = $ul.find('li.active');
                                if($lis.eq(0).is($li)){
                                    $input.focus();
                                    break;
                                }
                                _this.setHoverData(ev.keyCode, list, selectList, config);
                                __this.list = list;
                                __this.selectList = selectList;
                                $li = $ul.find('li.active');
                                $ul.scrollTop($ul.scrollTop() - $li.outerHeight());
                                break;
                            case 40:
                                // 下
                                var $ul = $('[name="' + config.fullID + '"].pt-dropdown').find('ul.pt-dropdown-components');
                                var $lis = $ul.find('li');
                                var $li = $ul.find('li.active');
                                if($lis.eq($lis.length-1).is($li)){
                                    break;
                                }
                                _this.setHoverData(ev.keyCode, list, selectList, config);
                                __this.list = list;
                                __this.selectList = selectList;
                                $li = $ul.find('li.active');
                                $ul.scrollTop($ul.scrollTop() + $li.outerHeight());
                                break;
                            case 32:
                                // 空格
                                if($input.is(':focus')){
                                    break;
                                }
                                var $li = _this.getHoverJQLi(config);
                                __this.setSelected($li);
                                break;
                            case 13:
                                // enter
                                _this.completeSelect(config, vueConfig);
                                break;
                        }
                    },
                    documentScroll : function(ev){
                        this.close();
                    },
                    documentClose : function(ev){
                        NetstarComponent.commonFunc.clickAnyWhereToFunc(ev);
                    },
                },
                mounted: function(){
                    var __this = this;
                    // 添加键盘事件
                    $(document).on('keyup', __this.keyup);
                    $(document).on('keydown', __this.keydown);
                    $(document).on('scroll', __this.documentScroll);
                    // 添加点击任意位置关闭
                    var obj = {
                        relId : __this.id,
                        containerId : contentId,
                        parentName : '.pt-form-group',
                        func : function(){
                            __this.close();
                        }
                    }
                    $(document).on('click', obj, __this.documentClose);
                    
                    // _this.setfocusInputFocus(this, vueConfig);
                    // 添加选中样式 根据列表设置选中列表宽度
                    var allListDom = __this.$refs.allList;
                    var allListOffsetWidth = allListDom.children[0].offsetWidth;
                    var allListOffsetHeight = allListDom.offsetHeight;
                    var isYScroll = false;
                    if(allListOffsetHeight > 300){
                        isYScroll = true;
                        allListOffsetHeight = 300;
                    }
                    var selectedStyle = {
                        width : allListOffsetWidth + 'px',
                    }
                    __this.selectedStyle = selectedStyle;
                    var allListStyle = {
                        height : allListOffsetHeight + 'px',
                    }
                    __this.allListStyle = allListStyle;
                    // 计算位置
                    var $select = $('[name="'+__this.id+'"]');
                    var scrollWidth = 0;
                    if(isYScroll){
                        scrollWidth = 7;
                    }
                    $select.width(allListOffsetWidth+scrollWidth);
                    var $input = $('#'+__this.id);
                    NetstarComponent.commonFunc.setContainerPosition($select, $input);
                }
            })
        },
    },
    // 验证listConfig格式是否正确
    validataListConfig : function(listConfig){
        var isValid = true;
        if(typeof(listConfig)!="object"||typeof(listConfig.data)!="object"||typeof(listConfig.data.src)!="string"){
            nsAlert('listConfig返回值错误','error');
            console.error('listConfig返回值错误');
            isValid = false;
        }
        if(isValid){
            var validArr = [
                ['src', 			'string', 	true], 	// id
            ]
            isValid = nsDebuger.validOptions(validArr, listConfig.data);
        }
        return isValid;
    },
    setListConfigDefault : function(listConfig){
        var ajax = listConfig.data;
        var defaultAjax = {
            url : ajax.src,
            type : 'POST',
            data : {},
		}
        nsVals.setDefaultValues(ajax, defaultAjax);
    },
    // 通过页面参数 显示下拉框
    showSelectByPageParams:function(pageConfig, componentParams){
        var _this = this;
        var vueConfig = NetstarComponent.config[componentParams.formID].vueConfig[componentParams.id];
        var config = NetstarComponent.config[componentParams.formID].config[componentParams.id];
        var _pageParam = NetstarComponent.business.getDefaultSearchData(config);
        var paramsConfig = {
            pageParam:                  _pageParam,
            config:                     pageConfig,                     // 模板配置 通过请求的页面拿到的
            componentConfig:{
                editorConfig:           config,                         // 组件配置参数
                selectMode:             config.selectMode,              // 单选 多选 不能选 通过组件拿到（组件配置）
                componentClass :        'select',                         // 组件类别 默认list
            },
        }
        // var pageParams = NetstarTemplate.componentInit(paramsConfig);
        /**
         * pageParams {}
         * listConfig : list配置
         * addHandler : 新增的方法
         * queryHandler ：查询方法
         */
        // var pageParams = _this.returnFunction(paramsConfig);
        var pageParams = NetstarTemplate.componentInit(paramsConfig);
        // 验证listConfig
        var isValidListConfig = _this.validataListConfig(pageParams.listConfig);
        if(!isValidListConfig){
            nsAlert('页面list配置错误','error');
            console.error('页面list配置错误');
            console.error(pageParams);
            return;
        }
        // 设置listConfig默认值
        _this.setListConfigDefault(pageParams.listConfig);
        // 发送ajax获得list数据
        var ajaxConfig = $.extend(true, {}, pageParams.listConfig.data);
        ajaxConfig.plusData = {
            componentId : config.id,
            formID : config.formID,
            pageParam : pageParams,
        };
        NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            if(res.success){
                // 通过组件id获取组件配置 （config/vueConfig）
                var componentId = _ajaxConfig.plusData.componentId;
                var formID = _ajaxConfig.plusData.formID;
                var formConfigs = NetstarComponent.config[formID];
                var _config = formConfigs.config[componentId];
                var _vueConfig = formConfigs.vueConfig[componentId];
                var _pageParam = _ajaxConfig.plusData.pageParam; // 页面返回参
                // 设置list selectList
                var list = res;
                if(typeof(_pageParam.listConfig.data.dataSrc)=="string"){
                    list = res[_pageParam.listConfig.data.dataSrc];
                }
                list = $.isArray(list)?list:[];
                pageParams.list = list;
                if($.isArray(_config.value)){
                    pageParams.selectList = _config.value;
                }else{
                    if(typeof(_config.value)=="object" && !$.isEmptyObject(_config.value)){
                        pageParams.selectList = [_config.value];
                    }else{
                        pageParams.selectList = [];
                    }
                }
                // 验证
                _config.returnData = pageParams;
                _config.sourceReturnData = $.extend(true, {}, pageParams);
                _this.select.init(_config, _vueConfig);
            }else{
                nsAlert('获取数据失败','error');
                console.error('获取数据失败');
            }
        });
        
    },
    // 显示下拉框
    showSelect: function(config){
        var ajaxConfig = {
            url:config.source.url,
            type:config.source.type,
            data:config.source.data,
            dataType:'text',
            plusData:{
                componentId : config.id,
                formID : config.formID,
            },
            contentType:config.source.contentType,
        }
        function successFunc(data, _ajaxConfig){
            var componentId = _ajaxConfig.plusData.componentId;
            var formID = _ajaxConfig.plusData.formID;
            var _config = NetstarComponent.config[formID].config[componentId];
            var _configStrObj = {
                id: componentId,
                formID: formID,
            };
            var _configStr = JSON.stringify(_configStrObj);
            var funcStr = 'NetstarComponent.businessSelect.showSelectByPageParams(pageConfig, '+_configStr+')';
            var containerPage = NetstarComponent.businessSelect.getContainerPage(data, funcStr);
            var $container = nsPublic.getAppendContainer();
            var $containerPage = $(containerPage);
            
            // NetstarComponent.business.$containerPage = $containerPage;
            _config.$containerPage = $containerPage;
            $container.append($containerPage);
        }
        //在这里添加查询是否已经请求过了 lxh 2019/02/18
        if(!!NetstarCatchHandler.getCatch(config.source.url)){
            successFunc(NetstarCatchHandler.getCatch(config.source.url), ajaxConfig);
        }else{
            NetStarUtils.ajaxForText(ajaxConfig, function(data, _ajaxConfig){
                successFunc(data, _ajaxConfig)
            });
        }
    },
    // 关闭下拉框
    closeSelect: function(config){
        var _this = this;
        if(config.$containerPage){
            // 清除加载页面的js
            config.$containerPage.remove();
        }
        if(config.selectContainerId){
            // 清除加载下拉框容器
            $('#'+config.selectContainerId).remove();
        }
        if(config.selectVuePanel){
            // 取消键盘事件
            config.selectVuePanel.isShowSelect = false;
            $(document).off('keyup', config.selectVuePanel.keyup);
            $(document).off('keyup', config.selectVuePanel.keydown);
            $(document).off('click', config.selectVuePanel.documentClose);
            $(document).off('scroll', config.selectVuePanel.documentScroll);
        }
    },
    // 回车查询 根据新数据 重新显示下拉框
    searchByEnter: function(config, vueConfig, callbackFunc){
        var _this = this;
        var returnData = config.returnData;
        if(typeof(returnData)!="object"){
            nsAlert('下拉业务组件返回错误，无法查询','error');
            console.error('下拉业务组件返回错误，无法查询');
            console.error(config);
            return false;
        }
        var ajaxConfig = $.extend(true, {}, returnData.listConfig.data);
        // var searchText = vueConfig.inputText;
        var searchText = $('#' + config.fullID).val();
        var _pageParam = NetstarComponent.business.getDefaultSearchData(config);
        ajaxConfig.data = {
            searchType:"componentSearch",    // 查询类型:快速查询 componentSearch / quickSearch
            keyword:searchText,   
        }
        for(var key in _pageParam){
            data[key] = _pageParam[key];
        }
        ajaxConfig.plusData = {
            componentId : config.id,
            formID : config.formID,
        }
        NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            // 通过组件id获取组件配置 （config/vueConfig）
            var componentId = _ajaxConfig.plusData.componentId;
            var formID = _ajaxConfig.plusData.formID;
            var formConfigs = NetstarComponent.config[formID];
            var _config = formConfigs.config[componentId];
            var _vueConfig = formConfigs.vueConfig[componentId];
            if(res.success){
                // 设置新的list selectList
                var returnData = _config.returnData;
                var list = res;
                if(typeof(returnData.listConfig.data.dataSrc)=="string"){
                    list = res[returnData.listConfig.data.dataSrc];
                }
                list = $.isArray(list)?list:[];
                var selectList = _config.selectVuePanel.getValue();
                _config.sourceReturnData.list = $.extend(true, [], list);
                _config.sourceReturnData.selectList = $.extend(true, [], selectList);
                // 如果为单选清空选中
                if(_config.selectMode == "single"){
                    selectList = [];
                }
                // 搜索后默认选中第一条
                if(list.length == 1){
                    selectList.push(list[0]);
                }
                var listObj = _this.select.getFormatTwoList(list, selectList, _config);
                returnData.list = listObj.list;
                returnData.selectList = listObj.selectList;
                _this.select.refresh(_config, _vueConfig);
            }else{
                nsAlert('查询失败，返回数据错误', 'error');
                console.error('查询失败，返回数据错误');
                console.error(res);
            }
            if(typeof(callbackFunc) == "function"){
                var context = {
                    config : _config,
                    vueConfig : _vueConfig,
                }
                callbackFunc(context, res);
            }
        });
    },
    // 截取container代码
    getContainerPage: function(pageStr,funcStr){
        var starStr = '<container>';
        var endStr = '</container>';
        var containerPage = pageStr.substring(pageStr.indexOf(starStr)+starStr.length, pageStr.indexOf(endStr));
        var exp = /NetstarTemplate\.init\((.*?)\)/;
        var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
        containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
        return containerPage;
    },
    getInputTextByValue: function(value, config){
        var inputText = '';
        if($.isArray(value)){
            inputText = '';
            for(var valI=0;valI<value.length;valI++){
                var inputTextStr = value[valI][config.textField] ? value[valI][config.textField] : '';
                if(inputTextStr != ""){
                    inputText += inputTextStr + ',';
                }
            }
            if(inputText != ""){
                inputText = inputText.substring(0,inputText.length-1);
            }
        }else{
            if(!$.isArray(value)&&typeof(value)=="object"){
                inputText = value[config.textField] ? value[config.textField] : '';
            }else{
                inputText = '';
            }
        }
        return inputText;
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                if(value === ''){
                    isTrue = false;
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                data.isShowSelect = false; // 下拉框是否正在显示
                return data;
            },
            watch:{
                inputText:function(value,oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                },
                isShowSelect : function(value, oldValue){
                    if(value){
                        // 显示下拉框
                        _this.showSelect(config);
                    }else{
                        // 关闭下拉框
                        _this.closeSelect(config, this);
                    }
                },
            },
            methods: {
                keyup: function(ev){
                    var __this = this;
                    switch(ev.keyCode){
                        case 13:
                            __this.inputEnter(ev);
                            break;
                        case 40:
                            ev.stopImmediatePropagation();
                            _this.select.setfocusInputFocus(config.selectVuePanel, __this);
                            break;
                    }
                },
                clearMousedown: function(){
                    this.isValidatValue = false;
                },
                clearMouseup: function(){
                    this.isValidatValue = true;
                },
                // 清空
                clear : function(ev){
                    var _this = this;
                    // _this.inputText = "";
                    config.selectVuePanel.clear();
                },
                // 回车
                inputEnter:function(ev){
                    ev.stopImmediatePropagation();
                    // 回车表示搜索  跳转字段是下拉框选中时 选中跳转
                    _this.searchByEnter(config, this);
                },
                // 点击
                buttonClick:function(){
                    this.isShowSelect = !this.isShowSelect;
                },
                // 按钮按下
                mousedown:function(){
                    this.isValidatValue = false;
                },
                // 按钮松开
                mouseup:function(){
                    this.isValidatValue = true;
                },
                // 获取inputText
                getInputText:function(){
                    return this.inputText;
                },
                // 设置inputText
                setInputText:function(inputText){
                    this.inputText = inputText;
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                getSourceValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var value = config.value;
                    // 获得idField
                    if(typeof(config.subdataAjax)=="object"){
                        var valueStr = '';
                        for(var valI=0;valI<value.length;valI++){
                            var valueStr1 = value[valI][config.idField]?value[valI][config.idField]:"";
                            if(valueStr1!=""){
                                valueStr += valueStr1 + ',';
                            }
                        }
                        if(valueStr.length>0){
                            valueStr = valueStr.substring(0,valueStr.length-1);
                        }
                        value = valueStr;
                    }
                    if(config.selectMode=="single"||config.selectMode=="radio"){
                        // 单选value返回对象
                        if(value.length>1){
                            console.error("字段："+config.id+"是单选格式，配置value错误");
                            console.error(config);
                            return false;
                        }
                        if(value.length==1){
                            value = value[0];
                        }
                        if(value.length==0){
                            value = "";
                        }
                    }else{
                        // 多选value返回list
                    }
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    var value = this.getSourceValue(isValid);
                    if(config.isReadOutputFields && typeof(value) == 'object'){
                        value = $.isArray(value) ? value : [value];
                        value = NetstarComponent.commonFunc.getBusinessValueByValObj(value, config);
                    }
                    return value;

                },
                // 设置value
                setValue:function(value){
                    if($.isArray(value)||value===''){
                    }else{
                        if(typeof(value)=="object"){
                            value = [value];
                        }else{
                            if(typeof(config.subdataAjax)=="object"){
                                var subdata = config.subdataAjax.subdata;
                                var valueArr = [];
                                var valueStrArr = value.split(',');
                                for(var valStrI=0;valStrI<valueStrArr.length;valStrI++){
                                    for(var subI=0;subI<subdata.length;subI++){
                                        if(subdata[subI][config.idField]==valueStrArr[valStrI]){
                                            valueArr.push(subdata[subI]);
                                        }
                                    }
                                }
                                if(valueArr.length>0){
                                    value = valueArr;
                                }
                            }
                            if(typeof(value)!="object"){
                                console.error(config.id+'设置value值错误！');
                                console.error(value);
                                console.error(config);
                                return ;
                            }
                        }
                    }
                    if(config.selectMode=="single"){
                        // 单选value返回对象
                        if(value.length>1){
                            console.error("字段："+config.id+"是单选格式，配置value错误");
                            console.error(config);
                            return false;
                        }
                        if(value.length==1){
                            value = value[0];
                        }
                        if(value.length==0){
                            value = "";
                        }
                    }else{
                        // 多选value返回list
                    }
                    var sourceValue = config.value;
                    config.value = value;
                    var isInputTextError = false;
                    this.inputText = _this.getInputTextByValue(value, config);
                    if(value!=""&&this.inputText==""){
                        isInputTextError = true;
                    }
                    if(isInputTextError){
                        console.error("组件的textField配置错误，不能显示value值");
                        console.error(value);
                        console.error(config);
                    }
                    var isSame = true;
                    // 判断是否改变
                    if(typeof(sourceValue)!=typeof(value)){
                        isSame = false;
                    }else{
                        if(typeof(sourceValue)=='object'){
                            isSame = nsVals.isEqualObject(sourceValue,value);
                        }else{
                            if(sourceValue != value){
                                isSame = false;
                            }
                        } 
                    }
                    if(!isSame){
                        this.change();
                    }
                },
                // 设置焦点
                focusHandler: function(ev){
                    $(ev.target).select();
                    // 获取焦点时显示下拉框 若果下拉框正在显示这则不再执行 正在显示
                    this.isShowSelect = true;
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    if(this.isValidatValue){
                        // 修改显示值 根据value
                        var isInputTextError = false;
                        var value = config.value;
                        this.inputText = _this.getInputTextByValue(value, config);
                        if(value!=""&&this.inputText==""){
                            isInputTextError = true;
                        }
                        if(isInputTextError){
                            console.error("组件的textField配置错误，不能显示value值");
                            console.error(value);
                            console.error(config);
                        }
                        this.getValue();
                        // 判断是否执行blurHandler
                        NetstarComponent.formBlurHandler(config, this);
                    }
                },
                // 失去焦点
                blur: function(){
                    this.$refs.inputName.blur();
                },
                // 改变 change
                change: function(){
                    var text = this.inputText;
                    // var value = config.value;
                    var value = this.getValue(false);
                    if(($.isArray(config.value) && config.value.length > 0)  || (typeof(config.value) == "object") && !$.isEmptyObject(config.value)){
                        this.isShowClear = true;
                    }else{
                        this.isShowClear = false;
                    }
                    var vueConfig = this;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                    if(typeof(config.relationField)=="string"){
                        NetstarComponent.commonFunc.refreshComponentByRelationField(config);
                        // var relationField = config.relationField;
                        // if(NetstarComponent.config[config.formID]){
                        //     var vueComponent = NetstarComponent.config[config.formID].vueConfig[relationField];
                        //     if(typeof(vueComponent)=='object'){
                        //         vueComponent.ajaxLoading = true;
                        //     }
                        // }
                    }
                    if(typeof(config.assignExpres) == "object" && config.selectMode == "single"){
                        var sourceValue = this.getSourceValue(false);
                        var formID = config.formID;
                        var formData = NetStarUtils.getFormatParameterJSON(config.assignExpres, sourceValue);
                        NetstarComponent.fillValues(formData, formID);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改
                    NetstarComponent.editVueComponent(obj, this, config);
                },
            },
            mounted : function(){
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            },
        }
        return component;
    },
}
// 文本组件
NetstarComponent.text = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
            buttonClear:'<button class="pt-btn pt-btn-default pt-btn-icon pt-input-clear">'
                            +'<i class="icon-close"></i>'
                        + '</button>',
            button:'<button class="pt-btn pt-btn-default" v-for="btn in btns" v-on:click="btn.handler">'
                        + '{{btn.name}}'
                    + '</button>',
        },
        MOBILE:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        100,            // 输入框宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 显示类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
            isHasClose:         true,          // 是否存在清空按钮
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
    },
    // 验证配置是否正确
    validatConfig: function(config){
        var isVali = true;
        var rules = config.rules;
        if(rules.indexOf('remote')>-1){
            if(typeof(config.remoteAjax)!="string"){
                isVali = false;
                nsAlert('text组件验证配置错误，rules是remote(ajax排重时)remoteAjax必填', 'error');
                console.error('text组件验证配置错误，rules是remote(ajax排重时)remoteAjax必填');
            }
        }
        return isVali;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                // 为每一部分添加事件属性
                // 为input和button添加事件
                // $input.attr('v-bind:style', '{width:inputWidth+"px"}');
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keyup.13', 'inputEnter');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                $input.attr('v-on:change', 'change');
                var inputHtml = $input.prop('outerHTML');   // input模板
                var buttonHtml = '';
                if(config.isHasClose){
                    var $button = $(tempalte.buttonClear);
                    $button.attr('v-on:click', 'btnClickClose');
                    $button.attr('v-on:mousedown', 'btnMouseDown');
                    $button.attr(':class','{hide:ishide}');
                    buttonHtml = $button.prop('outerHTML');
                }
                var btncontainer = NetstarComponent.common.btncontainer;
                var $btncontainer = $(btncontainer);
                $btncontainer.addClass('pt-input-group-btn-group');
                if($.isArray(config.btns)&&config.btns.length > 0){
                    var btnsHtml = tempalte.button;
                    buttonHtml += btnsHtml;
                    // 现在没有用 为了以后添加text按钮时用 按钮数量超过1时添加类名pt-input-group-btn-group
                    // if(config.isHasClose){
                    //     $btncontainer.addClass('pt-input-group-btn-group');
                    // }else{
                    //     if(config.btns.length > 1){
                    //         $btncontainer.addClass('pt-input-group-btn-group');
                    //     }
                    // }
                }
                btncontainer = $btncontainer.prop('outerHTML').replace('{{nscontainer}}', buttonHtml);

                contentHtml = inputHtml + btncontainer;   // input+button整体模板
                // contentHtml += '<div :class="stateClass" ref="validate">{{validatInfo}}</div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                // contentHtml = NetstarComponent.common.staticComponent;
                // var $content = $(contentHtml);
                // // $content.attr('v-bind:style', '{width:inputWidth+"px"}');
                // $content.attr('v-bind:style', 'styleObject');
                // contentHtml = $content.prop('outerHTML');   // 静态模板
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        return data;
    },
    inputEnter: function(config, vueComponent){
        NetstarComponent.setNextComponentFocus(config, vueComponent);
        // var nextFieldId = config.enterFocusField;
        // if(nextFieldId){
        //     var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
        //     nextComponent.focus();
        // }else{
        //     vueComponent.blur();
        // }
    },
    // 验证value
    validatValue: function(_value, _rules, returnType, config){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var _validatInfo = '';
        function validateVal(value, __rules){
            var rules = __rules.split(' ');
            var isPass = true; // 是否合法
            var validatInfo = ''; // 错误信息
            for(var i=0; i<rules.length; i++){
                var ruleNameStr = rules[i];
                var formatRules = NetstarComponent.getFormatRules(ruleNameStr);
                var ruleName = formatRules.ruleName; // 规则名称
                var compareArr = formatRules.compareArr; // 若有 = 等号后边值 数组 没有比较值为空数组
                if(ruleName == 'required'){
                    if(value === "" || value === null){
                        isPass = false;
                        validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                    }
                }else{
                    if(value !== "" && value != null){
                        switch(ruleName){
                            case 'remote':
                                // ajax验证
                                break;
                            case 'ismobile':
                            case 'mobile':
                            case 'fax':
                                //手机号验证
                                regStr=/^(13[0-9]|14[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])\d{8}$/;
                                if(!regStr.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'isphone':
                            case 'phone':
                                //固定电话验证
                                regStr = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;//d*$;
                                if(!regStr.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'postalcode':
                                //邮政编码验证
                                regStr = /^[0-9]\d{5}$/;
                                if(!regStr.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'bankno':
                                //银行卡号验证
                                var isTrue = nsValid.bankno(value);
                                if(!isTrue){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'Icd':
                                //身份证号验证
                                var isTrue = nsValid.Icd(value);
                                if(!isTrue){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'positiveInteger':
                                //正整数验证
                                var g = /^[1-9]*[1-9][0-9]*$/;
                                if(!g.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'nonnegativeInteger':
                                //非负整数验证
                                var g = /^([1-9]\d*|[0]{1,1})$/;
                                if(!g.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'integer':
                                //整数验证
                                /*var reg = /^-?[1-9]*[1-9][0-9]*$/;*/
                                var reg = /^-?\d+$/;
                                if(!reg.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;	
                            case 'max':
                                var compareNum = compareArr[0];
                                if(!(Number(value) <= compareNum)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                                }
                                break;
                            case 'min':
                                var compareNum = compareArr[0];
                                if(!(compareNum <= Number(value))){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                                }
                                break;
                            case 'positive':
                                // 正数
                                if(!(Number(value) > 0)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'negative':
                                //负数验证
                                if(!(Number(value) <= 0)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'range':
                                // 范围在 {0} 到 {1} 之间
                                if(!(Number(value)>=compareArr[0] && Number(value)<=compareArr[1])){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareArr[0],compareArr[1]);
                                }
                                break;
                            case 'precision':
                                var compareNum = compareArr[0];
                                // 小数 {0} 位
                                var isTrue = nsValid.precision(value,Number(compareNum));
                                if(!isTrue){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                                }
                                break;
                            case 'url':
                                // url
                                var reg = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
                                var isTrue = reg.test(value);
                                if(!isTrue){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'email':
                                //邮箱验证
                                var reg = /^([a-zA-Z0-9\._-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
                                var isTrue = reg.test(value);
                                if(!isTrue){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'minlength':
                                // 最少字符
                                var compareNum = compareArr[0];
                                if(compareNum > value.length){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                                }
                                break;
                            case 'maxlength':
                                // 最多字符
                                var compareNum = compareArr[0];
                                if(compareNum < value.length){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            if(validatInfo.length > 0){
                var validatInfoArr = validatInfo.split('');
                if(validatInfoArr[validatInfoArr.length-1]==","){
                    validatInfo = validatInfo.substring(0, validatInfo.length-1);
                }
            }
            return {
                isTrue : isPass,
                validatInfo: validatInfo,
            };
        }
        var obj = validateVal(_value, _rules);
        if(typeof(_value)=="string"&&_value.length>0&&_rules.indexOf('remote')>-1 && typeof(config)=="object"){
            // 排重
            var isSendAjax = true;
            if(typeof(config.sourceValue)=="undefined"){
                isSendAjax = false;
            }else{
                if(config.sourceValue == _value){
                    isSendAjax = false;
                }
            }
            if(isSendAjax){
                var ajaxData = {};
                ajaxData[config.id] = _value;
                var ajaxConfig = {
                    url : config.remoteAjax,
                    type : 'POST',
                    data : ajaxData,
                    plusData : {
                        formID : config.formID,
                        componentId : config.id,
                    },
                }
                NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                    if(res.success){
                        var data = res.data;
                        if((data && data.validateResult) || !data){
                            return; 
                        }
                        var plusData = _ajaxConfig.plusData;
                        var form = NetstarComponent.config[plusData.formID];
                        if(typeof(form)!="object"){
                            return;
                        }
                        var vueComponent = form.vueConfig[plusData.componentId];
                        var component = form.config[plusData.componentId];
                        vueComponent.validatInfo = data.validateMsg;
                        var warnInfoStr = component.label + ':' + data.validateMsg;
                        vueComponent.focus();
                        // NetstarComponent.setComponentWarnInfoState(vueComponent, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(component, data.validateMsg);
                    }
                })
            }
            
        }
        if(returnType == "boolean"){
            isTrue = obj.isTrue;
            return isTrue;
        }
        return obj;
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                data.btns = config.btns;
                return data;
            },
            watch: {
                inputText:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                    if(value.length > 0){
                        this.ishide = false;
                    }else{
                        this.ishide = true;
                    }
                }
            },
            methods: {
                // 
                btnMouseDown: function(){
                    this.isnotblur = true;
                },
                // 点击清空
                btnClickClose: function(ev){
                    this.inputText = "";
                    this.change();
                    this.isnotblur = false;
                    this.focus();
                },
                // 回车
                inputEnter:function(){
                    _this.inputEnter(config, this);
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules, 'object', config);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var value = config.value;
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var sourceValue = config.value;
                    // this.value = value;
                    config.value = value;
                    this.inputText = value;
                    var isSame = true;
                    // 判断是否改变
                    if(sourceValue != value){
                        isSame = false;
                    }
                    if(!isSame){
                        this.change();
                    }
                },
                // 设置焦点
                focusHandler: function(ev){
                    $(ev.target).select();
                    config.sourceValue = $(ev.target).val();
                    if(this.inputText.length > 0){
                        this.ishide = false;
                    }
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    if(this.isnotblur){
                        return;
                    }
                    this.getValue();
                    this.ishide = true;
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                    // if(typeof(config.blurHandler)=='function'){
                    //     config.blurHandler(_config, this);
                    // }
                },
                // 失去焦点
                blur: function(){
                    this.$refs.inputName.blur();
                },
                // 改变 change
                change: function(){
                    // value和inputText同时变化 
                    // 原因：input上存的值是inputText所以改变input的输入时value不会改变所以在这里改
                    this.inputText = typeof(this.inputText)=="number"?this.inputText.toString():this.inputText;
                    var vueConfig = this;
                    var text = this.inputText;
                    config.value = text;
                    var value = config.value;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted : function(){
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            },
        }
        return component;
    },
}
// 数字组件
NetstarComponent.number = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" alt="" />',
            button:  '<button class="pt-btn pt-btn-default pt-btn-icon">'
                        +'<i class="fa fa-calculator"></i>'
                    + '</button>',
        },
        MOBILE:{
            input:'<input class="pt-form-control" type="number" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        100,            // 输入框宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 表单类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
            format:             '',             // 数字格式 默认无
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        // 根据数字格式设置小数位数
        // 如果设置了小数位数 改变数字格式 即小数位数优先级高于数字格式
        if(typeof(config.decimalDigit)=="number"){
            var formatStr = ".";
            for(var i=0;i<config.decimalDigit;i++){
                formatStr += "0";
            }
            config.format = formatStr;
        }else{
            if(config.format == ""){
                config.decimalDigit = '';
            }else{
                var rex = /[^0\.]+/g; // 是否包含除了0，.以外的其它字符
                var rex1 = /^\.0*$/; // .**格式
                if(rex.test(config.format) || !rex1.test(config.format)){
                    // 包含除了0,.以外的其它字符
                    console.error('format配置错误：'+config.format);
                    console.error(config);
                    config.decimalDigit = 0;
                }else{
                   var formatStr = config.format.substring(1);
                   var formatArr = formatStr.split('');
                   config.decimalDigit = formatArr.length;
                }
            }
        }
        config.value = config.value == null ? '' : config.value;
        if(config.value != ""){
            if(config.decimalDigit != false){
                config.value = Number(config.value).toFixed(config.decimalDigit);
            }else{
                config.value = Number(config.value);
            }
        }
        // 计算器容器id
        config.calculatorId = config.fullID + '-calculator';
    },
    // 验证配置是否正确
    validatConfig: function(config){
        return true;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                var $button = $(tempalte.button);
                // 为每一部分添加事件属性
                // 为input和button添加事件
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keyup.13', 'inputEnter');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                $input.attr('v-on:change', 'change');
                $button.attr('v-on:click', 'calculator');
                var inputHtml = $input.prop('outerHTML');   // input模板
                var buttonHtml = $button.prop('outerHTML');   // button模板
                var btncontainer = NetstarComponent.common.btncontainer;
                btncontainer = btncontainer.replace('{{nscontainer}}', buttonHtml);
                contentHtml = inputHtml + btncontainer;   // input+button整体模板
                contentHtml += '<div :id="calculatorId"></div>';
                // contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                // contentHtml = NetstarComponent.common.staticComponent;
                // var $content = $(contentHtml);
                // // $content.attr('v-bind:style', '{width:inputWidth+"px"}');
                // $content.attr('v-bind:style', 'styleObject');
                // contentHtml = $content.prop('outerHTML');   // 静态模板
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        return data;
    },
    inputEnter: function(config, vueComponent){
        NetstarComponent.setNextComponentFocus(config, vueComponent);
        // var nextFieldId = config.enterFocusField;
        // if(nextFieldId){
        //     var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
        //     nextComponent.focus();
        // }else{
        //     vueComponent.blur();
        // }
    },
    validatValue: function(value, ruleStr, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var rules = ruleStr.split(' ');
        var isPass = true; // 是否合法
        var validatInfo = ''; // 错误信息
        for(var i=0; i<rules.length; i++){
            var ruleNameStr = rules[i];
            var formatRules = NetstarComponent.getFormatRules(ruleNameStr);
            var ruleName = formatRules.ruleName; // 规则名称
            var compareArr = formatRules.compareArr; // 若有 = 等号后边值 数组 没有比较值为空数组
            if(ruleName == 'required'){
                if(value === "" || value === null){
                    isPass = false;
                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                }
            }else{
                if(value !== "" && value != null){
                    switch(ruleName){
                        case 'ismobile':
                        case 'mobile':
                            //手机号验证
                            regStr=/^(13[0-9]|14[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])\d{8}$/;
                            if(!regStr.test(value)){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                            }
                            break;
                        case 'isphone':
                        case 'phone':
                            //固定电话验证
                            regStr = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;//d*$;
                            if(!regStr.test(value)){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                            }
                            break;
                        case 'postalcode':
                            //邮政编码验证
                            regStr = /^[0-9]\d{5}$/;
                            if(!regStr.test(value)){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                            }
                            break;
                        case 'bankno':
                            //银行卡号验证
                            var isTrue = nsValid.bankno(value);
                            if(!isTrue){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                            }
                            break;
                        case 'Icd':
                            //身份证号验证
                            var isTrue = nsValid.Icd(value);
                            if(!isTrue){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                            }
                            break;
                        case 'positiveInteger':
                            //正整数验证
                            var g = /^[1-9]*[1-9][0-9]*$/;
                            if(!g.test(value)){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                            }
                            break;
                        case 'nonnegativeInteger':
                            //非负整数验证
                            var g = /^([1-9]\d*|[0]{1,1})$/;
                            if(!g.test(value)){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                            }
                            break;
                        case 'integer':
                            //整数验证
                            /*var reg = /^-?[1-9]*[1-9][0-9]*$/;*/
                            var reg = /^-?\d+$/;
                            if(!reg.test(value)){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                            }
                            break;	
                        case 'max':
                            var compareNum = compareArr[0];
                            if(!(Number(value) <= compareNum)){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                            }
                            break;
                        case 'min':
                            var compareNum = compareArr[0];
                            if(!(compareNum <= Number(value))){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                            }
                            break;
                        case 'positive':
                            // 正数
                            if(!(Number(value) > 0)){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                            }
                            break;
                        case 'negative':
                            //负数验证
                            if(!(Number(value) <= 0)){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                            }
                            break;
                        case 'range':
                            // 范围在 {0} 到 {1} 之间
                            if(!(Number(value)>=compareArr[0] && Number(value)<=compareArr[1])){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName](compareArr[0],compareArr[1]);
                            }
                            break;
                        case 'precision':
                            var compareNum = compareArr[0];
                            // 小数 {0} 位
                            var isTrue = nsValid.precision(value,Number(compareNum));
                            if(!isTrue){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        if(isPass){
            if(typeof(value) != 'undefined' && value != null && value.toString().length > 0){
                // 验证是否是数字
                var rex = /^(\-|\+)?\d+(\.\d+)?$/;
                isPass = rex.test(value);
                validatInfo += NetstarComponent.validateMsg.number + ',';
            }
        }
        if(validatInfo.length > 0){
            var validatInfoArr = validatInfo.split('');
            if(validatInfoArr[validatInfoArr.length-1]==","){
                validatInfo = validatInfo.substring(0, validatInfo.length-1);
            }
        }
        if(returnType == "boolean"){
            return isPass;
        }
        return {
            isTrue : isPass,
            validatInfo : validatInfo,
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch: {
                inputText:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                }
            },
            methods: {
                // 计算器显示
                calculatorShow: function(){
                    var __this = this;
                    var calculatorId = config.calculatorId;
                    var $calculator = $('#'+calculatorId);
                    var $input = $('#'+__this.id);
                    __this.isDestroy = true;
                    $calculator.calculator({
                        calculatorClass: 'netstar-calculator',
                        showAnim: 'fadeIn',
                        showOptions: 'fast',
                        layout: ['CABS_=','_7_8_9_+','_4_5_6_-','_1_2_3_*','_0+-_._/'],
                        clearText: 'C',
                        backspaceText: 'Back',
                        onButton: function(label, value, inst) {
                            $input.val(value);
                            if(label == '='){
                                __this.calculatorDestroy();  // 销毁
                                __this.isFocusSelect = false;
                                $input.focus();
                            }
                        },
                    }); // 创建
                    // 计算位置
                    // $calculator.css('top',$('#'+__this.id).outerHeight());
                    NetstarComponent.commonFunc.setContainerPosition($calculator, $input);
                    // 设置点击任意位置销毁计算器
                    $(document).off('click',__this.calculatorDestroy);
                    $(document).on('click',__this.calculatorDestroy);
                    // 设置不销毁参数
                    function notEestroy(){
                        __this.isDestroy = false;
                    }
                    // 点击当前组件时不销毁计算器
                    $input.parent().off('click',notEestroy);
                    $input.parent().on('click',notEestroy);
                    $calculator.children('.calculator-keyentry').on('keyup',function(event){
                        switch(event.keyCode){
                            case 13:
                                __this.calculatorDestroy();
                                __this.inputEnter();
                                break;
                        }
                    });
                    $calculator.children('.calculator-keyentry').focus();
                },
                // 计算器销毁
                calculatorDestroy: function(){
                    var __this = this;
                    var calculatorId = config.calculatorId;
                    var $calculator = $('#'+calculatorId);
                    if(__this.isDestroy){
                        var $input = $('#'+__this.id);
                        var value = $input.val();
                        __this.setValue(value);
                        $calculator.calculator('destroy');  // 销毁
                        $(document).off('click',__this.calculatorDestroy);
                    }
                    __this.isDestroy = true;
                },
                // 计算器
                calculator:function(event){
                    var calculatorId = config.calculatorId;
                    var $calculator = $('#'+calculatorId);
                    if($calculator.children().length > 0){
                        // 销毁
                        this.calculatorDestroy();
                    }else{
                        // 显示
                        this.calculatorShow();
                    }
                },
                // 回车
                inputEnter:function(){
                    _this.inputEnter(config, this);
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var isTrue = true;
                    var validatInfo = '';
                    var validObj = _this.validatValue(value, rules);
                    isTrue = validObj.isTrue;
                    validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var value = config.value;
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    if(value===''){
                        value = null;
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var sourceValue = config.value;
                    config.value = value;
                    this.inputText = value;
                    var isSame = true;
                    // 判断是否改变
                    if(sourceValue != value){
                        isSame = false;
                    }
                    if(!isSame){
                        this.change();
                    }
                },
                // 设置焦点
                focusHandler: function(ev){
                    if(this.isFocusSelect){
                        $(ev.target).select();
                    }
                    var calculatorId = config.calculatorId;
                    var $calculator = $('#'+calculatorId);
                    if($calculator.children().length > 0){
                        // 销毁
                        this.calculatorDestroy();
                    }
                    this.isFocusSelect = true;
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    this.getValue();
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                },
                // 失去焦点
                blur: function(){
                    this.$refs.inputName.blur();
                },
                // 改变 change
                change: function(){
                    // value和inputText同时变化 
                    // 原因：input上存的值是inputText所以改变input的输入时value不会改变所以在这里改
                    var vueConfig = this;
                    if(this.inputText!=""){
                        if(config.decimalDigit != false){
                            this.inputText = isNaN(Number(this.inputText)) ? this.inputText : Number(this.inputText).toFixed(config.decimalDigit);
                        }else{
                            this.inputText = isNaN(Number(this.inputText)) ? this.inputText : Number(this.inputText);
                        }
                    }
                    var text = this.inputText;
                    text = text.toString();
                    if(text == ""){
                        config.value = null;
                    }else{
                        if(config.decimalDigit != false && config.decimalDigit > 0){
                            config.value = isNaN(Number(text)) ? text : parseFloat(text);
                        }else{
                            config.value = isNaN(Number(text)) ? text : Number(text);
                        }
                    }
                    var value = config.value;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                    if(typeof(config.countFuncHandler)=='function'){
                        config.countFuncHandler();
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted : function(){
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            },
        }
        return component;
    },
}
// 日期组件
NetstarComponent.date = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
            valueError:'日期组件的value值必须是数字，请检查配置 修改为默认值空',
            inputWidthError1:'inputWidth必须是数字格式，否则设置默认值100',
            inputWidthError2:'inputWidth的最小宽度是20，否则设置默认值100',
		},
		zh:{
            valueError:'日期组件的value值必须是数字，请检查配置 修改为默认值空',
            inputWidthError1:'inputWidth必须是数字格式，否则设置默认值100',
            inputWidthError2:'inputWidth的最小宽度是20，否则设置默认值100',
		}
    },
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
            button: '<button class="pt-btn pt-btn-default pt-btn-icon" :disabled="disabled" ref="buttonName">'
                        +'<i class="icon-arrow-down-o"></i>'
                    + '</button>', 
            dropdownContainer : '<div :class="dropdownClass" :id="dropdownId"></div>',           
        },
        MOBILE:{},
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :                100,                        // 输入框宽度
            label :                     '',                         // label
            templateName :              'PC',                       // 模板名字
            formSource:                 'form',                     // 表单类型 默认form staticData/table
            value :                     '',                         // value
            rules :                     '',                         // 规则
            disabled:                   false,                      // 是否只读
            daysOfWeekDisabled:         '',                         // 字符串或数组格式 根据周几设置只读 默认''即不设置只读
            daysOfWeekHighlighted:      false,                      // 目前没有用
            todayBtn:                   false,                      // 目前没有用
            clearBtn:                   false,                      // 目前没有用
            startView:                  0,                          // 开始视图 0(日)/1(月->日)/2(年->月->日)
            addvalue:                   {},                         // 日期底部按钮 配置 {value:''，id:''}
            format:                     nsVals.default.dateFormat,  // 默认日期格式
            isInputMask:                true,                       // 输入样式验证
            hidden:                     false,                      // 是否隐藏
            isDefaultDate:              false,                      // 是否设置默认日期
            isTime:                     false,                      // 是否添加时间 默认否
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        var i18n = this.I18N[languagePackage.userLang];
        // 设置默认日期
        if(config.isDefaultDate){
            if(config.value==''){
                config.value = Number(moment(new Date()).format('x'));
            }
        }
        // 验证value必须是时间戳 （数字）
        if(config.value!=''){
            if(typeof(config.value)!='number'){
                config.value = '';
                console.error(i18n.valueError);
                console.error(config);
            }
        }
        if(typeof(config.value) == 'number'){
            config.sourceValue = config.value;
        }
        // 格式化format
        var formatStr = $.trim(config.format);
        if(formatStr.indexOf(' ') > -1){
            config.isTime = true;
            config.startView = 2;
            var formatArr = formatStr.split(' ');
            formatArr[0] = formatArr[0].toUpperCase();
            formatArr[1] = formatArr[1].replace(/M|S/g, function(a){return a.toLowerCase()});
            formatStr = formatArr[0] + ' ' + formatArr[1];
        }else{
            if(formatStr.indexOf('H') === 0 || formatStr.indexOf('h') === 0){
                // 表示仅显示时间
                config.isOnlyTime = true;
                formatStr = formatStr.replace(/M|S/g, function(a){return a.toLowerCase()});
            }else{
                formatStr = formatStr.toUpperCase();
            }
        }
        config.format = formatStr;
        config.dropdownId = config.fullID + '-dropdown-container';
    },
    // 验证配置是否正确
    validatConfig: function(config){
        var isTrue = true;
        return isTrue;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                var $button = $(tempalte.button);
                // 为每一部分添加事件属性
                // 为input和button添加事件
                // $input.attr('v-bind:style', '{width:inputWidth+"px"}');
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keyup.13', 'inputEnter');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                // $input.attr('v-on:change', 'change');
                // $input.attr('v-on:keyup', 'keyup($event)');
                $button.attr('v-on:click', 'buttonClick');   // 按钮点击事件
                $button.attr('v-on:mousedown', 'mousedown');
                $button.attr('v-on:mouseup', 'mouseup');
                var inputHtml = $input.prop('outerHTML');   // input模板
                var buttonHtml = $button.prop('outerHTML'); // button模板
                var btncontainer = NetstarComponent.common.btncontainer;
                btncontainer = btncontainer.replace('{{nscontainer}}', buttonHtml);
                if(config.isOnlyTime){
                    btncontainer = '';
                }
                contentHtml = inputHtml + btncontainer;   // input+button整体模板
                contentHtml += tempalte.dropdownContainer;
                // contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                // contentHtml = NetstarComponent.common.staticComponent;
                // var $content = $(contentHtml);
                // // $content.attr('v-bind:style', '{width:inputWidth+"px"}');
                // $content.attr('v-bind:style', 'styleObject');
                // contentHtml = $content.prop('outerHTML');   // 静态模板
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        data.dropdownId = config.dropdownId;
        if(config.isTime){
            data.dropdownClass = 'pt-datetime-dropdown';
        }else{
            data.dropdownClass = 'pt-date-dropdown';
        }
        return data;
    },
    inputEnter: function(config, vueComponent){
        NetstarComponent.setNextComponentFocus(config, vueComponent);
        // var nextFieldId = config.enterFocusField;
        // if(nextFieldId){
        //     var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
        //     nextComponent.focus();
        // }else{
        //     vueComponent.blur();
        // }
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                if(value === ''){
                    isTrue = false;
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    getShowPosition : function(config, type){
        var $input = config.$input;
        var inputLeft = $input.offset().left;
        var windowWidth = $(window).width();
        var contentWidth = 236;
        if(type == "time"){
            contentWidth = 222;
        }
        if((contentWidth + inputLeft) > windowWidth){
            return 'right';
        }else{
            return 'left';
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch: {
                inputText:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                }
            },
            methods: {
                // 设置日期组件样式
                dateDefind: function(){
                    var __this = this;
                    var inputNameId = __this.id;
                    var $input = $('#'+inputNameId);
                    var $button = $(__this.$refs.buttonName);
                    var $dropdown = $('#' + __this.dropdownId);
                    if(config.isOnlyTime){

                    }else{
                        if(config.isTime){
                            // 时间配置
                            var datetimePickerOption = 
                            {
                                language:           'cn',
                                autoclose:          true,
                                todayHighlight:     true,
                                firstDay:           1,
                                maxView:            3,
                                minuteStep:         1,
                                startView:          config.startView,
                                format:             config.format.toLowerCase(),        // 日期格式; 转化字母大小写
                                daysOfWeekDisabled: config.daysOfWeekDisabled,
                                pickerPosition:     'bottom left',                       // 显示位置
                                container:          '#' + __this.dropdownId,
                                show:               true,
                            }
                            config.datetimePickerOption = datetimePickerOption;
                        }else{
                            // 日期组件配置
                            var datePickerOption = 
                            {
                                autoclose:          true,
                                todayHighlight:     true,
                                firstDay:           1,
                                maxViewMode:        2,
                                enableOnReadonly:   false,
                                format:             config.format.toLowerCase(),   // 日期格式; 转化字母大小写
                                daysOfWeekDisabled: config.daysOfWeekDisabled,
                                startView:          config.startView,
                                // orientation:        'bottom left',                       // 显示位置
                                orientation:        'bottom right',                       // 显示位置
                                showOnFocus:        false,                          // 获取焦点时不显示
                                // container:          '#' + __this.dropdownId,
                            }
                            if(!$.isEmptyObject(config.addvalue)){
                                datePickerOption.autovalue = config.addvalue;
                            }
                            config.datePickerOption = datePickerOption;
                            // $input.datepicker(datePickerOption).on('changeDate', function(ev){
                            //     __this.inputText = $input.val();
                            //     __this.focus();
                            //     __this.change();
                            // })
                        }
                    }
                    if(!config.isInputMask){
                        $input.off('change');
                        $input.on('change', function(ev){
                            __this.inputText = $input.val();
                            __this.change();
                        });
                    }
                    config.$input = $input;
                },
                // 回车
                inputEnter: function(){
                    _this.inputEnter(config, this);
                },
                // 按钮点击
                buttonClick: function(){
                    var __this = this;
                    var inputNameId = this.id;
                    var $input = $('#'+inputNameId);
                    var positionStr = _this.getShowPosition(config);
                    if(!config.isTime){
                        config.datePickerOption.orientation = 'bottom ' + positionStr;
                        
                        $input.off('changeDate');
                        $input.datepicker(config.datePickerOption).on('changeDate', function(ev){
                            __this.inputText = $input.val();
                            __this.focus();
                            __this.change();
                        }).on('hide', function(){
                            $input.datepicker('destroy');
                        })
                        $input.datepicker('show');
                    }else{
                        config.datetimePickerOption.pickerPosition = 'bottom ' + positionStr;
                        $input.datetimepicker(config.datetimePickerOption).on('changeDate', function(ev){
                            var dateNum = ev.date.valueOf();
                            __this.inputText = moment(dateNum).format(config.format);
                            __this.focus();
                            __this.change();
                        }).on('hide', function(){
                            $input.datetimepicker('remove');
                        })
                        $input.datetimepicker('show')
                    }
                },
                // 验证value
                validatValue: function(value){
                    // var value = config.value;
                    value = value==null?"":value;
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var value = config.value;
                    // 因为 isInputMask==true 回车时执行完失去焦点时才会设置value多以value会存在滞后设置所以 通过jQuery获得value
                    // 由于 执行完回车后 失去焦点后如果组件存在 会执行change change会设置config.value所以这里不用设置
                    // 回车后 删除组件（表格调取）时不会执行input的change
                    if(config.isInputMask==true){
                        var inputNameId = this.id;
                        var $input = $('#'+inputNameId);
                        if(config.isOnlyTime){
                            value = moment(value).format('YYYY-MM-DD ' + config.format);
                        }else{
                            value = $input.val(); 
                        }
                    }
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }else{
                            value = Number(moment(value).format('x'));
                        }
                    }else{
                        if(value){
                            value = Number(moment(value).format('x'));
                        }
                    }
                    if(isNaN(value)){
                        value = '';
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var i18n = NetstarComponent.date.I18N;
                    if(value!=''&&typeof(value)!='number'){
                        console.error(i18n.valueError);
                        console.error(value);
                        value = '';
                    }
                    config.sourceValue = value;
                    var configValue = value;
                    if(value!=''){
                        value = moment(value).format(config.format);
                        if(config.isOnlyTime){
                            configValue = moment(config.sourceValue).format('YYYY-MM-DD ' + config.format);;
                        }else{
                            configValue = value;
                        }
                    }
                    var sourceValue = config.value;
                    config.value = configValue;
                    this.inputText = value;
                    var isSame = true;
                    // 判断是否改变
                    if(sourceValue != value){
                        isSame = false;
                    }
                    if(!isSame){
                        this.change();
                    }
                },
                mousedown: function(){
                    this.isValidatValue = false;
                },
                mouseup: function(){
                    this.isValidatValue = true;
                },
                // 设置焦点
                focusHandler: function(ev){
                    var __this = this;
                    $(ev.target).select();
                    if(config.isInputMask){
                        var inputNameId = this.id;
                        var $input = $('#'+inputNameId);
                        var formatStr = config.format.replace(/m/g, 's');
                        $input.inputmask(formatStr.replace(/((y?Y?)*)((m?M?)*)((d?D?)*)((h?H?)*)((s?S?)*)/g,function($1){return $1.slice(0,1).toLowerCase()}),{
                            oncomplete : function(event){
                                var $inputmask = $(event.target);
                                __this.inputText = $inputmask.val();
                                __this.change();
                            }
                        });
                    }
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    var __this = this;
                    if(this.isValidatValue){
                        this.getValue();
                    }
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                    // if(typeof(config.blurHandler)=='function'){
                    //     config.blurHandler(config, this);
                    // }
                    if(config.isInputMask){
                        var inputNameId = this.id;
                        var $input = $('#'+inputNameId);
                        $input.inputmask('remove');
                        $input.val(__this.inputText);
                    }
                },
                // 失去焦点
                blur: function(){
                    this.$refs.inputName.blur();
                },
                // 改变 change
                change: function(){
                    // value和inputText同时变化 
                    // 原因：input上存的值是inputText所以改变input的输入时value不会改变所以在这里改
                    var text = this.inputText;
                    var sourceText = text;
                    // 验证text格式
                    if(text!=''){
                        if(config.isOnlyTime){
                            var date = moment(config.sourceValue).format('YYYY-MM-DD');
                            text = date + ' ' + text;
                        }
                        var textDate = moment(text).format('x');
                        if(textDate == 'Invalid date'){
                            text = '';
                            this.inputText = text;
                            console.error('日期格式错误 设置为空');
                        }
                    }
                    config.value = text;
                    var value = config.value;
                    if(text!=''){
                        value = Number(moment(value).format('x'));
                    }else{
                        value = null;
                    }
                    var vueConfig = this;
                    var obj = {
                        id:config.id,
                        text:sourceText,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted: function(){
                this.dateDefind();
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            }
        }
        return component;
    },
}
// 单选组件
NetstarComponent.radio = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            label:  '<div class="pt-radio-inline" v-for="option in subdata" v-on:mousedown="mousedown" v-on:mouseup="mouseup">'
                        + '<input class="" type="radio" :class="inputClass" :disabled="option.isDisabled" :id="option.fillId" :name="id" v-model="inputText" :value="optionValue" />'
                        + '<label class="pt-radio-inline" :for="option.fillId" :class="[showState,inputText.indexOf(optionValue)>-1?\'checked\':\'\']">{{optionText}}</label>'
                    + '</div>',
            button: '<button class="pt-btn pt-btn-default pt-btn-icon" :disabled="disabled">'
                        +'<i class="icon-arrow-down-o"></i>'
                    + '</button>',
            loading: '<div class="loading">正在加载</div>',
            // close:  '<label class="radio-clear">清空</label>'    
            close:  '<div class="pt-clear-inline" v-on:mousedown="mousedown" v-on:mouseup="mouseup">'
                        + '<input class="" type="radio" :name="id" v-model="inputText" value="" :id="id+\'clear\'" />'
                        + '<label class="pt-radio-clear" :for="id+\'clear\'">清空</label>'
                    + '</div>',  
        },
        MOBILE:{
            input:'<input class="form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
            button: '<button class="btn btn-default btn-icon" :disabled="disabled">'
                        +'<i class="icon-arrow-down-o"></i>'
                    + '</button>',
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :                100,                        // 输入框宽度
            label :                     '',                         // label
            templateName :              'PC',                       // 模板名字
            formSource:                 'form',                     // 表单类型 默认form table/staticData
            value :                     '',                         // value
            rules :                     '',                         // 规则
            disabled:                   false,                      // 是否只读
            subdata:                    [],                         // 下拉选项 默认为空
            textField:                  'text',                     // 默认的textField
            valueField:                 'value',                    // 默认的valueField
            isObjectValue:              false,                      // value值是否是对象
            isHasClose:                 false,                      // 是否存在清空按钮
            hidden:                     false,                      // 是否隐藏
            showState:                  'left',                     // 显示位置
        }
        if(typeof(config.url)=='undefined'&&typeof(config.ajaxConfig)=='undefined'){
            config.ajaxLoading = false;
        }else{
            config.ajaxLoading = true;
        }
		nsVals.setDefaultValues(config, defaultConfig);
        if(defaultConfig.showState!="right"){
            defaultConfig.showState = 'left';
        }
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        var i18n = this.I18N[languagePackage.userLang];
        // 宽度
        // if(typeof(config.inputWidth)=="string"){
        //     console.error(i18n.inputWidthError1);
        //     console.error(config);
        //     config.inputWidth = 100;
        // }
        // if(config.inputWidth<20){
        //     console.error(i18n.inputWidthError2);
        //     console.error(config);
        //     config.inputWidth = 100;
        // }
        if(typeof(config.ajaxConfig)!='object'&&typeof(config.url)=='string'){
            config.ajaxConfig = {};
            config.ajaxConfig.url = config.url;
            config.ajaxConfig.type = typeof(config.method)=='string'?config.method:'GET';
            config.ajaxConfig.data = typeof(config.data)!='undefined'?config.data:{};
            config.ajaxConfig.dataSrc = typeof(config.dataSrc)!='undefined'?config.dataSrc:'';
            config.ajaxConfig.contentType = typeof(config.contentType)!='undefined'?config.contentType:'';
        }
        if(config.subdata.length>0){
            // 设置是否只读
            for(var i=0;i<config.subdata.length;i++){
                config.subdata[i].isDisabled = config.disabled;
            }
            // 设置subdata
            NetstarComponent.setSubdata(config.subdata, config);
        }
        if(config.value!=''){
            if(config.isObjectValue){
                if(!$.isArray(config.value)||config.value.length==0){
                    console.error('value值格式错误');
                    console.error(config);
                    config.value = '';
                }
            }else{
                if(typeof(config.value)=='object'){
                    console.error('value值格式错误');
                    console.error(config);
                    config.value = '';
                }
            }
        }
        if(typeof(config.url)=='undefined'&&typeof(config.ajaxConfig)=='undefined'){
            // 获取value
            var parameter = {
                value:          config.value,
                valueField:     config.valueField,
                subdata:        config.subdata,
                isObjectValue:  config.isObjectValue,
                type:           config.type,
            }
            config.value = NetstarComponent.getValueBySubdata(parameter);
        }
        // 格式化outputFields
        if(typeof(config.outputFields) == "string" && config.outputFields.length > 0){
            config.outputFields = JSON.parse(config.outputFields);
        }
    },
    // 验证配置是否正确
    validatConfig: function(config){
        var isTrue = true;
        return isTrue;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $label = $(tempalte.label);
                var loadingHtml = tempalte.loading;
                var $input = $label.find('input');
                // 为每一部分添加事件属性
                $input.attr('v-on:change', 'change');
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:keyup.13', 'inputEnter($event)');
                $input.attr('v-on:focus', 'focusHandler($event)');
                var labelHtml = $label.prop('outerHTML');  // label模板
                labelHtml = labelHtml.replace(/optionValue/g,'option.'+config.valueField);
                labelHtml = labelHtml.replace(/optionText/g,'option.'+config.textField);
                // 清空按钮
                var closeHtml = '';
                if(config.isHasClose){
                    closeHtml = tempalte.close;
                    var $close = $(closeHtml);
                    var closeId = config.fullID + '-' + 'clear';
                    $close.children('input').attr('id', closeId);
                    $close.children('input').attr('v-on:change', 'change');
                    $close.children('input').attr('v-on:keyup.13', 'inputEnter($event)');
                    $close.children('input').attr('v-on:blur', 'blurHandler');
                    $close.children('label').attr('for', closeId);
                    closeHtml = $close.prop('outerHTML');
                }
                contentHtml =   '<div v-if="ajaxLoading==false" class="pt-radio-group" v-bind:style="styleObject">'
                                    + labelHtml
                                    + closeHtml
                                + '</div>'
                                + '<div v-else class="pt-radio-group" v-bind:style="styleObject">'
                                    + loadingHtml
                                + '</div>'

                // contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                // contentHtml = NetstarComponent.common.staticComponent;
                // var $content = $(contentHtml);
                // // $content.attr('v-bind:style', '{width:inputWidth+"px"}');
                // $content.attr('v-bind:style', 'styleObject');
                // contentHtml = $content.prop('outerHTML');   // 静态模板
                // contentHtml = contentHtml.replace('{{inputText}}', '{{inputName}}');
                contentHtml = NetstarComponent.getStaticTemplate(config);
                contentHtml = contentHtml.replace('{{inputText}}', '{{inputName}}');
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        return data;
    },
    inputEnter: function(config, vueComponent, ev){
        NetstarComponent.setNextComponentFocus(config, vueComponent, ev);
        // var vueComponent = NetstarComponent.config[config.formID].vueConfig[config.id];
        // var nextFieldId = config.enterFocusField;
        // if(nextFieldId){
        //     var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
        //     nextComponent.focus();
        // }else{
        //     vueComponent.blur(ev);
        // }
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                if(value === ''){
                    isTrue = false;
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch:{
                ajaxLoading:function(value,oldValue){
                    if(value){
                        this.ajax();
                    }
                },
                disabled:function(value,oldValue){
                    var subdata = this.subdata;
                    for(var i=0;i<subdata.length;i++){
                        subdata[i].isDisabled = value;
                    }
                },
                inputName:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputName');
                }
            },
            methods: {
                ajax: function(){
                    var _this = this;
                    var components = NetstarComponent.config[config.formID].config;
                    NetstarComponent.setAjaxSubdata(config, _this, components);
                },
                // 回车
                inputEnter: function(ev){
                    _this.inputEnter(config, this, ev);
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取原始的value值
                getSourceValue : function(){
                    var _this = this;
                    var text = _this.inputText;
                    var subdata = config.subdata;
                    var parameter = {
                        inputText       :   text,
                        subdata         :   subdata,
                        isObjectValue   :   true,
                        valueField      :   config.valueField,
                    }
                    // 通过inputText获得value值
                    var value = NetstarComponent.getValueByInputText(parameter);
                    return value;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;

                    var _this = this;
                    var text = _this.inputText;
                    var subdata = config.subdata;
                    var parameter = {
                        inputText       :   text,
                        subdata         :   subdata,
                        isObjectValue   :   _this.isObjectValue,
                        valueField      :   config.valueField,
                    }
                    // 通过inputText获得value值
                    var value = NetstarComponent.getValueByInputText(parameter);
                    var isTrue = true;
                    if(isValid){
                        isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    if(isTrue){
                        if(typeof(config.outputFields) == "object"){
                            var souVal = _this.getSourceValue();
                            var outVals = NetStarUtils.getFormatParameterJSON(config.outputFields, souVal);
                            outVals[config.id] = value;
                            value = outVals;
                        }
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var _this = this;
                    var sourceInputText = _this.inputText;
                    var subdata = config.subdata;
                    // 获取value
                    var parameter = {
                        value:          value,
                        valueField:     config.valueField,
                        subdata:        subdata,
                        isObjectValue:  config.isObjectValue,
                        type:           config.type,
                        isReadSub:      false,
                    }
                    var value = NetstarComponent.getValueBySubdata(parameter);
                    var parameterText = {
                        value:          value,
                        type:           config.type,
                        valueField:     config.valueField,
                    }
                    _this.inputText = NetstarComponent.getInputTextByValue(parameterText);
                    var isSame = true;
                    // 判断是否改变
                    if(sourceInputText != _this.inputText){
                        isSame = false;
                    }
                    if(!isSame){
                        _this.change();
                    }
                },
                mousedown: function(){
                    this.isValidatValue = false;
                },
                mouseup: function(){
                    this.isValidatValue = true;
                },
                focusHandler: function(){
                    var inputName = this.id;
                    var $input = $('[name='+inputName+']');
                    $input.parents('.fg-radio').addClass('active-component'); // 获得焦点时标记
                    return false;
                },
                // 获得焦点
                focus: function(){
                    var inputName = this.id;
                    var $input = $('[name='+inputName+']');
                    $input.eq(0).focus();
                    return false;
                },
                // 设置失去焦点
                blurHandler: function(ev){
                    // ev.relatedTarget==null表示不是通过点击失去的 通过判断name==id判断是否还在当前radio中
                    var relatedTarget = ev.relatedTarget; 
                    var id = this.id;
                    var $input = $('[name='+id+']');
                    $input.parents('.fg-radio').removeClass('active-component'); // 失去焦点时取消标记
                    var isValidat = false;
                    if(relatedTarget != null){
                        if(relatedTarget.name!=id){
                            isValidat = true;
                        }
                    }else{
                        isValidat = this.isValidatValue;
                    }
                    if(isValidat){
                        this.getValue();
                        // 判断是否执行blurHandler
                        NetstarComponent.formBlurHandler(config, this);
                    }
                    // if(typeof(config.blurHandler)=='function'){
                    //     config.blurHandler(config, this);
                    // }
                },
                // 失去焦点
                blur: function(){
                    var id = this.id;
                    var $input = $('[name='+id+']:focus');
                    if($input.length>0){
                        $input.blur();
                    }
                },
                // 改变 change
                change: function(){
                    var _this = this;
                    /**
                     * radio 选项改变时inputText改变 通过inputText的改变改变其他值（inputText/inputName/inputValue）
                     * inputText        选中的value值 即valueField对应的值
                     * inputName        选中的label值 即textField对应的值
                     * inputValue       选中的value值 即inputText通过isObjectValue获得的值
                     */
                    var text = _this.inputText;
                    var subdata = config.subdata;
                    var parameter = {
                        inputText       :   text,
                        subdata         :   subdata,
                        isObjectValue   :   _this.isObjectValue,
                        valueField      :   config.valueField,
                    }
                    // 通过inputText获得value值
                    var value = NetstarComponent.getValueByInputText(parameter);
                    // _this.value = value;
                    var parameter = {
                        inputText:          text, 
                        subdata:            subdata, 
                        textField:          config.textField, 
                        valueField:         config.valueField, 
                    }
                    // 通过inputText获得inputName值
                    _this.inputName = NetstarComponent.getInputNameByInputText(parameter);
                    var vueConfig = _this;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                    if(typeof(config.relationField)=="string"){
                        NetstarComponent.commonFunc.refreshComponentByRelationField(config);
                        // var relationField = config.relationField;
                        // var vueComponent = NetstarComponent.config[config.formID].vueConfig[relationField];
                        // if(typeof(vueComponent)=='object'){
                        //     vueComponent.ajaxLoading = true;
                        // }
                    }
                    if(typeof(config.changeHandlerData)=="object"){
                        if(typeof(config.changeHandlerData[text])=="object"){
                            NetstarComponent.changeComponentByChangeHandlerData(config.changeHandlerData[text], config.formID);
                        }else{
                            if(typeof(config.changeHandlerData.nsRestoreDefaultObj)=="object"){
                                NetstarComponent.changeComponentByChangeHandlerData(config.changeHandlerData.nsRestoreDefaultObj, config.formID);
                            }
                        }
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted: function(){
                if(this.ajaxLoading){
                    this.ajax();
                }
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            }
        }
        return component;
    },
}
// 多选组件
NetstarComponent.checkbox = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            label:  '<div class="pt-checkbox-inline" v-for="option in subdata" v-on:mousedown="mousedown" v-on:mouseup="mouseup">'
                            + '<input class="" type="checkbox" :class="inputClass" :disabled="option.isDisabled" :id="option.fillId" :name="id" v-model="inputText" :value="optionValue" />'
                            + '<label class="pt-checkbox-inline" :for="option.fillId" :class="[showState,inputText.indexOf(optionValue)>-1?\'checked\':\'\']">{{optionText}}</label>'
                        + '</div>',
            loading: '<div class="loading">正在加载</div>', 
        },
        MOBILE:{
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :                100,                        // 输入框宽度
            label :                     '',                         // label
            templateName :              'PC',                       // 模板名字
            formSource:                 'form',                     // 表单类型 默认form staticData/table
            value :                     '',                         // value
            rules :                     '',                         // 规则
            disabled:                   false,                      // 是否只读
            subdata:                    [],                         // 下拉选项 默认为空
            textField:                  'text',                     // 默认的textField
            valueField:                 'value',                    // 默认的valueField
            isObjectValue:              false,                      // value值是否是对象
            hidden:                     false,                      // 是否隐藏
            isBooleanValue:             false,                      // value是否是0/1
            showState:                  'left',                     // 
        }
        if(typeof(config.url)=='undefined'&&typeof(config.ajaxConfig)=='undefined'){
            config.ajaxLoading = false;
        }else{
            config.ajaxLoading = true;
        }
        nsVals.setDefaultValues(config, defaultConfig);
        if(defaultConfig.showState!="right"){
            defaultConfig.showState = 'left';
        }
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        var i18n = this.I18N[languagePackage.userLang];
        // 宽度
        // if(typeof(config.inputWidth)=="string"){
        //     console.error(i18n.inputWidthError1);
        //     console.error(config);
        //     config.inputWidth = 100;
        // }
        // if(config.inputWidth<20){
        //     console.error(i18n.inputWidthError2);
        //     console.error(config);
        //     config.inputWidth = 100;
        // }
        if(typeof(config.ajaxConfig)!='object'&&typeof(config.url)=='string'){
            config.ajaxConfig = {};
            config.ajaxConfig.url = config.url;
            config.ajaxConfig.type = typeof(config.method)=='string'?config.method:'GET';
            config.ajaxConfig.data = typeof(config.data)!='undefined'?config.data:{};
            config.ajaxConfig.dataSrc = typeof(config.dataSrc)!='undefined'?config.dataSrc:'';
            config.ajaxConfig.contentType = typeof(config.contentType)!='undefined'?config.contentType:'';
        }
        if(config.subdata.length>0){
            // 设置是否只读
            for(var i=0;i<config.subdata.length;i++){
                config.subdata[i].isDisabled = config.disabled;
            }
            // 设置subdata
            NetstarComponent.setSubdata(config.subdata, config);
        }
        if(config.value!=''){
            if(config.isObjectValue){
                if(!$.isArray(config.value)||config.value.length==0){
                    console.error('value值格式错误');
                    console.error(config);
                    config.value = '';
                }
            }else{
                if(typeof(config.value)=='object'){
                    console.error('value值格式错误');
                    console.error(config);
                    config.value = '';
                }
            }
        }
        if(typeof(config.url)=='undefined'&&typeof(config.ajaxConfig)=='undefined'){
            // 获取value 通过subdata
            var parameter = {
                value:          config.value,
                valueField:     config.valueField,
                subdata:        config.subdata,
                isObjectValue:  config.isObjectValue,
                type:           config.type,
            }
            config.value = NetstarComponent.getValueBySubdata(parameter);
        }
        // 如果 isBooleanValue == true 表示value反回/设置的是1/0 改变subdata 是他的valueField是1
        if(config.subdata.length>1){
            config.isBooleanValue = false;
        }
        if(config.isBooleanValue == true){
            if(config.subdata.length==0){
                var sundataObj = {}
                sundataObj[config.textField] = '';
                sundataObj[config.valueField] = 1;
                sundataObj.isDisabled = config.disabled;
                config.subdata = [sundataObj];
            }
            config.subdata[0][config.valueField] = 1;
        }
        if(typeof(config.changeHandlerData)=="object"){
            for(var key in config.changeHandlerData){
                if(key.indexOf(',')>-1){
                    var keyArr = key.split(',');
                    keyArr.sort();
                    var keyStr = keyArr.toString();
                    if(keyStr != key){
                        config.changeHandlerData[keyStr] = config.changeHandlerData[key];
                        delete config.changeHandlerData[key];
                    }
                }
            }
        }
        // 格式化outputFields
        if(typeof(config.outputFields) == "string" && config.outputFields.length > 0){
            config.outputFields = JSON.parse(config.outputFields);
        }
    },
    // 验证配置是否正确
    validatConfig: function(config){
        var isTrue = true;
        return isTrue;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $label = $(tempalte.label);
                var loadingHtml = tempalte.loading;
                var $input = $label.find('input');
                var $lableText = $label.find('label');
                // 为每一部分添加事件属性
                $input.attr('v-on:change', 'change');
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:keyup.13', 'inputEnter($event)');
                $input.attr('v-on:focus', 'focusHandler($event)');
                // $lableText.attr('v-on:click', 'labelClick($event)');
                var labelHtml = $label.prop('outerHTML');  // label模板
                labelHtml = labelHtml.replace(/optionValue/g,'option.'+config.valueField);
                labelHtml = labelHtml.replace(/optionText/g,'option.'+config.textField);
                contentHtml =   '<div v-if="ajaxLoading==false" class="pt-checkbox-group" v-bind:style="styleObject">'
                                    + labelHtml
                                + '</div>'
                                + '<div v-else class="pt-checkbox-group" v-bind:style="styleObject">'
                                    + loadingHtml
                                + '</div>'

                // contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                // contentHtml = NetstarComponent.common.staticComponent;
                // var $content = $(contentHtml);
                // // $content.attr('v-bind:style', '{width:inputWidth+"px"}');
                // $content.attr('v-bind:style', 'styleObject');
                // contentHtml = $content.prop('outerHTML');   // 静态模板
                // contentHtml = contentHtml.replace('{{inputText}}', '{{inputName}}');
                contentHtml = NetstarComponent.getStaticTemplate(config);
                contentHtml = contentHtml.replace('{{inputText}}', '{{inputName}}');
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        return data;
    },
    inputEnter: function(config, vueComponent, ev){
        NetstarComponent.setNextComponentFocus(config, vueComponent, ev);
        // var nextFieldId = config.enterFocusField;
        // if(nextFieldId){
        //     var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
        //     nextComponent.focus();
        // }else{
        //     vueComponent.blur(ev);
        // }
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                if(value === ''){
                    isTrue = false;
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch:{
                ajaxLoading:function(value,oldValue){
                    if(value){
                        this.ajax();
                    }
                },
                disabled:function(value,oldValue){
                    var subdata = this.subdata;
                    for(var i=0;i<subdata.length;i++){
                        subdata[i].isDisabled = value;
                    }
                },
                inputName:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputName');
                }
            },
            methods: {
                // labelClick: function(ev){
                //     $ev = $(ev.target);
                //     var forName = $ev.attr('for');
                //     var $input = $('#'+forName);
                //     if(!$input.is(':checked')){
                //         $ev.addClass('checked');
                //     }else{
                //         $ev.removeClass('checked');
                //     }
                // },
                ajax: function(){
                    var components = NetstarComponent.config[config.formID].config;
                    NetstarComponent.setAjaxSubdata(config,  this, components);
                },
                // 回车
                inputEnter: function(ev){
                    _this.inputEnter(config, this, ev);
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取原始的value值
                getSourceValue : function(){
                    var _this = this;
                    var text = _this.inputText;
                    var subdata = config.subdata;
                    var parameter = {
                        inputText       :   text,
                        subdata         :   subdata,
                        isObjectValue   :   true,
                        valueField      :   config.valueField,
                    }
                    // 通过inputText获得value值
                    var value = NetstarComponent.getValueByInputText(parameter);
                    return value;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;

                    var _this = this;
                    var text = _this.inputText;
                    var subdata = config.subdata;
                    var parameter = {
                        inputText       :   text,
                        subdata         :   subdata,
                        isObjectValue   :   _this.isObjectValue,
                        valueField      :   config.valueField,
                    }
                    // 通过inputText获得value值
                    var value = NetstarComponent.getValueByInputText(parameter);
                    var isTrue = true;
                    if(isValid){
                        isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    if(config.isBooleanValue==true){
                        value = Number(value);
                    }
                    if(isTrue){
                        if(typeof(config.outputFields) == "object"){
                            var souVal = _this.getSourceValue();
                            if(souVal.length > 0){
                                var outVals = NetStarUtils.getFormatParameterJSON(config.outputFields, souVal);
                                outVals[config.id] = value;
                                value = outVals;
                            }
                        }
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var _this = this;
                    var sourceInputText = _this.inputText;
                    var subdata = config.subdata;
                    for(var i=0;i<subdata.length;i++){
                        delete subdata[i].isChecked;
                    }
                    // 获取value
                    var parameter = {
                        value:          value,
                        valueField:     config.valueField,
                        subdata:        subdata,
                        isObjectValue:  config.isObjectValue,
                        type:           config.type,
                        isReadSub:      false,
                    }
                    var value = NetstarComponent.getValueBySubdata(parameter);
                    var parameterText = {
                        value:          value,
                        type:           config.type,
                        valueField:     config.valueField,
                    }
                    _this.inputText = NetstarComponent.getInputTextByValue(parameterText);
                    var isSame = true;
                    // 判断是否改变
                    if(sourceInputText != _this.inputText){
                        isSame = false;
                    }
                    if(!isSame){
                        _this.change();
                    }
                },
                mousedown: function(){
                    this.isValidatValue = false;
                },
                mouseup: function(){
                    this.isValidatValue = true;
                },
                focusHandler: function(ev){
                    var inputName = this.id;
                    var $input = $('[name='+inputName+']');
                    $input.parents('.fg-checkbox').addClass('active-component'); // 获得焦点时标记
                },
                // 获得焦点
                focus: function(){
                    var inputName = this.id;
                    var $input = $('[name='+inputName+']');
                    $input.eq(0).focus();
                },
                // 设置失去焦点
                blurHandler: function(ev){
                    // ev.relatedTarget==null表示不是通过点击失去的 通过判断name==id判断是否还在当前radio中
                    var relatedTarget = ev.relatedTarget; 
                    var id = this.id;
                    var $input = $('[name='+id+']');
                    $input.parents('.fg-checkbox').removeClass('active-component'); // 失去焦点时取消标记
                    var isValidat = false;
                    if(relatedTarget != null){
                        if(relatedTarget.name!=id){
                            isValidat = true;
                        }
                    }else{
                        isValidat = this.isValidatValue;
                    }
                    if(isValidat){
                        console.log('验证');
                        this.getValue();
                    }
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                    // if(typeof(config.blurHandler)=='function'){
                    //     config.blurHandler(config, this);
                    // }
                },
                // 失去焦点
                blur: function(){
                    var id = this.id;
                    var $input = $('[name='+id+']:focus');
                    if($input.length>0){
                        $input.blur();
                    }
                },
                // 改变 change
                change: function(){
                    var _this = this;
                    /**
                     * radio 选项改变时inputText改变 通过inputText的改变改变其他值（inputText/inputName/inputValue）
                     * inputText        选中的value值 即valueField对应的值
                     * inputName        选中的label值 即textField对应的值
                     * inputValue       选中的value值 即inputText通过isObjectValue获得的值
                     */
                    var text = _this.inputText;
                    var subdata = config.subdata;
                    var parameter = {
                        inputText       :   text,
                        subdata         :   subdata,
                        isObjectValue   :   _this.isObjectValue,
                        valueField      :   config.valueField,
                    }
                    // 通过inputText获得value值
                    var value = NetstarComponent.getValueByInputText(parameter);
                    var parameter = {
                        inputText:          text, 
                        subdata:            subdata, 
                        textField:          config.textField, 
                        valueField:         config.valueField, 
                    }
                    // 通过inputText获得inputName值
                    _this.inputName = NetstarComponent.getInputNameByInputText(parameter);
                    var vueConfig = _this;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                    if(typeof(config.relationField)=="string"){
                        NetstarComponent.commonFunc.refreshComponentByRelationField(config);
                        // var relationField = config.relationField;
                        // var vueComponent = NetstarComponent.config[config.formID].vueConfig[relationField];
                        // if(typeof(vueComponent)=='object'){
                        //     vueComponent.ajaxLoading = true;
                        // }
                    }
                    text.sort();
                    textStr = text.toString();
                    if(typeof(config.changeHandlerData)=="object"){
                        if(typeof(config.changeHandlerData[textStr])=="object"){
                            NetstarComponent.changeComponentByChangeHandlerData(config.changeHandlerData[textStr], config.formID);
                        }else{
                            if(typeof(config.changeHandlerData.nsRestoreDefaultObj)=="object"){
                                NetstarComponent.changeComponentByChangeHandlerData(config.changeHandlerData.nsRestoreDefaultObj, config.formID);
                            }
                        }
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted: function(){
                if(this.ajaxLoading){
                    this.ajax();
                }
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            }
        }
        return component;
    },
}
// 文本域组件
NetstarComponent.textarea = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            input:'<textarea class="pt-form-control" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id"></textarea>',
            ueditor:'<script type="text/plain" :class="inputClass" :id="id" :disabled="disabled" :style="styleObject">{{inputText}}</script>',
        },
        MOBILE:{},
    },
    mode : {
        //全部功能按钮
        all : [
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
        ],
        //标准功能按钮
        standard : [
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
        ],
        //min功能按钮
        min : [
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
        ],
        custom : [[]],
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        100,         // 文本域宽度
            inputHeight:        40,             // 文本域高度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 显示类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
            isUseUEditor:       false,          // 是否使用UEditor
            model :             'standard',     // 标准 all / min / standard / custom
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        // 宽度
        // if(typeof(config.inputWidth)=="string"){
        //     console.error('inputWidth必须是数字格式，否则设置默认值100');
        //     console.error(config);
        //     config.inputWidth = 100;
        // }
        // if(config.inputWidth<20){
        //     console.error('inputWidth的最小宽度是20，否则设置默认值100');
        //     console.error(config);
        //     config.inputWidth = 100;
        // }
    },
    // 验证配置是否正确
    validatConfig: function(config){
        return true;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                // 为每一部分添加事件属性
                // 为input和button添加事件
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keyup.13', 'inputEnter($event)');  // 回车事件keyup.13
                $input.attr('v-on:keydown.13', 'inputEnterDown($event)');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                $input.attr('v-on:change', 'change');
                var inputHtml = $input.prop('outerHTML');   // input模板
                contentHtml = inputHtml;   // input+button整体模板
                // contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
                if(config.isUseUEditor){
                    contentHtml = tempalte.ueditor;
                }
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                // contentHtml = NetstarComponent.common.staticComponent;
                // var $content = $(contentHtml);
                // // $content.attr('v-bind:style', '{width:inputWidth+"px"}');
                // $content.attr('v-bind:style', 'styleObject');
                // contentHtml = $content.prop('outerHTML');   // 静态模板
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        return data;
    },
    inputEnter: function(config, vueComponent){
        NetstarComponent.setNextComponentFocus(config, vueComponent);
        // var nextFieldId = config.enterFocusField;
        // if(nextFieldId){
        //     var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
        //     nextComponent.focus();
        // }else{
        //     vueComponent.blur();
        // }
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                if(value === ''){
                    isTrue = false;
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch:{
                inputText:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                }
            },
            methods: {
                ueditorInit: function(){
                    var __this = this;
                    //配置参数
                    var ueditorConfig = {};
                    //高度控制
                    var ueditorHeight = 200;
                    if (typeof(config.height) == 'number') {
                        ueditorHeight = config.height - 33;
                    }
                    ueditorConfig.autoHeightEnabled = false;
                    ueditorConfig.initialFrameHeight = ueditorHeight;
                    //是否只读
                    if (config.readonly) {
                        ueditorConfig.readonly = true;
                    }
                    ueditorConfig.wordCount = config.wordCount ? config.wordCount : false;
                    ueditorConfig.elementPathEnabled = config.elementPathEnabled ? config.elementPathEnabled : false;
                    ueditorConfig.toolbars = $.isArray(config.model) ? config.model : NetstarComponent.textarea.mode[config.model];
                    config.toolbars = ueditorConfig.toolbars;
                    UE.delEditor(config.fullID);
                    config.ueditor = UE.getEditor(config.fullID, ueditorConfig);
                    // 添加监听事件
                    config.ueditor.addListener('focus', function(evType, ev) {
                        __this.focusHandler(ev);
                    });
                    config.ueditor.addListener('blur', function(evType, ev) {
                        __this.blurHandler(ev);
                    });
                    config.ueditor.addListener('contentChange', function(evType, ev) {
                        __this.inputText = config.ueditor.getContent();
                        __this.change(ev);
                    });
                },
                inputEnterDown: function(ev){
                    // 阻止默认行为 默认回车换行
                    ev.cancelBubble=true;
                    ev.preventDefault(); 
                    ev.stopPropagation();
                },
                // 回车
                inputEnter: function(ev){
                    if(ev.altKey == false){
                        // enter 跳转组件
                        // $(ev.target)[0].selectionStart = $(ev.target).val().length;
                        _this.inputEnter(config, this);
                    }else{
                        // alt+enter 添加换行
                        $(ev.target).val(function(index, text){
                            return (text+'\n');
                        });
                    }
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var value = config.value;
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var sourceValue = config.value;
                    // this.value = value;
                    config.value = value;
                    this.inputText = value;
                    if(config.isUseUEditor){
                        config.ueditor.setContent(value);
                    }
                    var isSame = true;
                    // 判断是否改变
                    if(sourceValue != value){
                        isSame = false;
                    }
                    if(!isSame){
                        this.change();
                    }
                },
                // 设置焦点
                focusHandler: function(ev){
                    $(ev.target).select();
                },
                // 获得焦点
                focus: function(){
                    if(config.isUseUEditor){
                        config.ueditor.focus(true);
                        return;
                    }
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    this.getValue();
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                    // if(typeof(config.blurHandler)=='function'){
                    //     config.blurHandler(_config, this);
                    // }
                },
                // 失去焦点
                blur: function(){
                    if(config.isUseUEditor){
                        config.ueditor.blur();
                        return;
                    }
                    this.$refs.inputName.blur();
                },
                // 改变 change
                change: function(){
                    // value和inputText同时变化 
                    // 原因：input上存的值是inputText所以改变input的输入时value不会改变所以在这里改
                    var vueConfig = this;
                    var text = this.inputText;
                    config.value = text;
                    var value = config.value;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted : function(){
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
                if(config.isUseUEditor){
                    this.ueditorInit();
                }
            },
        }
        return component;
    },
}
// 隐藏组件
NetstarComponent.hidden = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="hidden" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
        },
        MOBILE:{
            input:'<input class="pt-form-control" type="hidden" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            inputWidth :        0,              // 输入框宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 显示类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
            isSave:             true,
		}
		nsVals.setDefaultValues(config, defaultConfig);
    },
    // 设置config
    setConfig: function(config){
    },
    // 验证配置是否正确
    validatConfig: function(config){
        return true;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        var $input = $(tempalte.input);
        // 为每一部分添加事件属性
        $input.attr('v-on:change', 'change');
        var inputHtml = $input.prop('outerHTML');   // input模板
        contentHtml = inputHtml;   // input+button整体模板
        if(config.formSource=='table'){
            containerHtml = NetstarComponent.common.tableComponent;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        data.isSave = typeof(config.isSave)=="boolean" ? config.isSave : true;
        return data;
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch: {
                inputText:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                }
            },
            methods: {
                // 获取value
                getValue:function(isValid){
                    var value = config.value;
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var sourceValue = config.value;
                    config.value = value;
                    this.inputText = value;
                    var isSame = true;
                    // 判断是否改变
                    if(sourceValue != value){
                        isSame = false;
                    }
                    if(!isSame){
                        this.change();
                    }
                },
                // 改变 change
                change: function(){
                    // value和inputText同时变化 
                    // 原因：input上存的值是inputText所以改变input的输入时value不会改变所以在这里改
                    var vueConfig = this;
                    var text = this.inputText;
                    config.value = text;
                    var value = config.value;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
        }
        return component;
    },
}
// 省市联动弹出的tab组件
NetstarComponent.provinceselectTab = {
    VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            tab: '<div class="pt-dropdown" :name="id">'
                    + '<div class="pt-tab-tabs">'
                        + '<div class="pt-tab-title">'
                            + '<ul>'
                                + '<li ns-type="province" :ns-active="nsActive==\'province\'?true:false" :class="[nsActive==\'province\'?\'current\':\'\']" :value="provinceVal" @click="clickTab">{{provinceText}}</li>'
                                + '<li ns-type="city" :ns-active="nsActive==\'city\'?true:false" :value="cityVal" :class="[nsActive==\'city\'?\'current\':\'\',nsActive==\'province\'?\'hide\':\'\']" @click="clickTab">{{cityText==""?"请选择":cityText}}</li>'
                                + '<li ns-type="area" :ns-active="nsActive==\'area\'?true:false" :value="areaVal" :class="[nsActive==\'area\'?\'current\':\'\',nsActive!=\'area\'?\'hide\':\'\']" @click="clickTab">{{areaText==""?"请选择":areaText}}</li>'
                            + '</ul>'
                        + '</div>'
                        + '<div class="pt-tab-content">'
                            + '<div class="" ns-list="province" :class="nsActive!=\'province\'?\'hide\':\'\'">'
                                + '<ul>'
                                    + '<li v-for="province in provinceArr" :class="provinceText==province.name?\'current\':\'\'" :value="province.code" @click="nameSelect">{{province.name}}</li>'
                                + '</ul>'
                            + '</div>'
                            + '<div class="" ns-list="city" :class="nsActive!=\'city\'?\'hide\':\'\'">'
                                + '<ul>'
                                    + '<li v-for="city in cityArr" :class="cityText==city.name?\'current\':\'\'" :value="city.code" @click="nameSelect">{{city.name}}</li>'
                                + '</ul>'
                            + '</div>'
                            + '<div class="" ns-list="area" :class="nsActive!=\'area\'?\'hide\':\'\'">'
                                + '<ul>'
                                    + '<li v-for="area in areaArr" :class="areaText==area.name?\'current\':\'\'" :value="area.code" @click="nameSelect">{{area.name}}</li>'
                                + '</ul>'
                            + '</div>'
                        + '</div>'
                    + '</div>'
                    + '<div class="pt-btn-group">'
                        + '<button class="pt-btn pt-btn-icon pt-btn-default" @click="confirm"><i class="icon-check"></i></button>'
                        + '<button class="pt-btn pt-btn-icon pt-btn-default" @click="close"><i class="icon-close"></i></button>'
                    + '</div>'
                + '</div>',
        },
        MOBILE:{
        },
    },
    // 通过地名name获得code码即value值
    getCodeByName: function(name){
        var value = '';
        if(name == ""){
            return value;
        }
        var isReadCode = false;
        var _provinceInfo = $.extend(true, [], provinceInfo);
        for(var provinceI=0;provinceI<_provinceInfo.length;provinceI++){
            var provinceCode = _provinceInfo[provinceI].code;
            var provinceName = _provinceInfo[provinceI].name;
            var provinceWb = _provinceInfo[provinceI].wb;
            var provincePinyin = _provinceInfo[provinceI].pinyin;
            var cityInfo = _provinceInfo[provinceI].sub;
            if(provinceName.indexOf(name)>-1||provinceWb.indexOf(name)>-1||provincePinyin.indexOf(name)>-1){
                isReadCode = true;
                value = provinceCode;
            }
            if(!isReadCode&&$.isArray(cityInfo)){
                for(var cityI=0; cityI<cityInfo.length; cityI++){
                    var cityCode = cityInfo[cityI].code;
                    var cityName = cityInfo[cityI].name;
                    var cityWb = cityInfo[cityI].wb;
                    var cityPinyin = cityInfo[cityI].pinyin;
                    var areaInfo = cityInfo[cityI].sub;
                    if(cityName.indexOf(name)>-1||cityWb.indexOf(name)>-1||cityPinyin.indexOf(name)>-1){
                        isReadCode = true;
                        value = cityCode;
                    }
                    if(!isReadCode&&$.isArray(areaInfo)){
                        for(var areaI=0; areaI<areaInfo.length; areaI++){
                            var areaCode = areaInfo[areaI].code;
                            var areaName = areaInfo[areaI].name;
                            var areaWb = areaInfo[areaI].wb;
                            var areaPinyin = areaInfo[areaI].pinyin;
                            if(areaName.indexOf(name)>-1||areaWb.indexOf(name)>-1||areaPinyin.indexOf(name)>-1){
                                isReadCode = true;
                                value = areaCode;
                                break;
                            }
                        }
                    }else{
                        break;
                    }
                }
            }else{
                break;
            }
        }
        return value;
    },
    // 设置container
    setContainer : function(parentId, tabId, config){
        var tabHtml = this.TEMPLATE.PC.tab;
        var $form = $("#"+parentId);
        var $container = NetstarComponent.commonFunc.getContainer($form);
        var tabVueHtml = '<div id="'+tabId+'" class="pt-input-group pt-provinceselect" style="height:0px;">'
                            + tabHtml;
                        + '</div>';
        $container.append(tabVueHtml);
    },
    // 获取数据
    getData : function(config){
        var data = {
            id : config.fullID,
            provinceId : config.fullID + '-province',
            cityId : config.fullID + '-city',
            areaId : config.fullID + '-area',
            nsTabShow : true,
        };
        return data;
    },
    // 获取省市县下拉框相关信息 省市县数组和省市县显示值 通过value值
    getTabInfoByValue: function(value){
        /**
         * value == null||""        下框是          省-空-空            显示空
         * value == 省code          下框是          省-市-空            显示省
         * value == 市code          下框是          省-市-县            显示市
         * value == 县code          下框是          省-市-县            显示县
         */
        var provinceArr = [];
        var cityArr = [];
        var areaArr = [];
        var provinceVal = '';
        var provinceText = '';
        var cityVal = '';
        var cityText = '';
        var areaVal = '';
        var areaText = '';
        var inputText = '';
        var inputName = '';
        var nsActive = 'province';
        var _provinceInfo = $.extend(true, [], provinceInfo);
        provinceArr = _provinceInfo;
        if(typeof(value)!="undefined"&&value!=""){
            var isReadCode = false; // 是否已经读到code码
            for(var provinceI=0;provinceI<_provinceInfo.length;provinceI++){
                var provinceCode = _provinceInfo[provinceI].code;
                var provinceName = _provinceInfo[provinceI].name;
                var cityInfo = _provinceInfo[provinceI].sub;
                if(provinceCode == value){
                    isReadCode = true;
                    cityArr = $.isArray(cityInfo)?cityInfo:[];
                    provinceVal = provinceCode;
                    provinceText = provinceName;
                }
                if(!isReadCode&&$.isArray(cityInfo)){
                    for(var cityI=0; cityI<cityInfo.length; cityI++){
                        var cityCode = cityInfo[cityI].code;
                        var cityName = cityInfo[cityI].name;
                        var areaInfo = cityInfo[cityI].sub;
                        if(cityCode == value){
                            isReadCode = true;
                            nsActive = 'city';
                            cityArr = cityInfo;
                            areaArr = $.isArray(areaInfo)?areaInfo:[];
                            provinceVal = provinceCode;
                            provinceText = provinceName;
                            cityVal = cityCode;
                            cityText = cityName;
                        }
                        if(!isReadCode&&$.isArray(areaInfo)){
                            for(var areaI=0; areaI<areaInfo.length; areaI++){
                                var areaCode = areaInfo[areaI].code;
                                var areaName = areaInfo[areaI].name;
                                if(areaCode == value){
                                    isReadCode = true;
                                    nsActive = 'area';
                                    cityArr = cityInfo;
                                    areaArr = areaInfo;
                                    provinceVal = provinceCode;
                                    provinceText = provinceName;
                                    cityVal = cityCode;
                                    cityText = cityName;
                                    areaVal = areaCode;
                                    areaText = areaName;
                                    break;
                                }
                            }
                        }else{
                            if(isReadCode){
                                break;
                            }
                        }
                    }
                }else{
                    if(isReadCode){
                        break;
                    }
                }
            }
        }
        if(provinceVal!=""){
            inputText = provinceVal;
            inputName = provinceText;
        }else{
            // 面板默认显示
            provinceVal = '110000'; 
            provinceText = '北京市';
        }
        if(cityVal!=""){
            inputText = cityVal;
            inputName += ' '+cityText;
        }
        if(areaVal!=""){
            inputText = areaVal;
            inputName += ' '+areaText;
        }
        return {
            province : provinceArr,
            city : cityArr,
            area : areaArr,
            provinceVal : provinceVal,
            provinceText : provinceText,
            cityVal : cityVal,
            cityText : cityText,
            areaVal : areaVal,
            areaText : areaText,
            inputText : inputText,
            inputName : inputName,
            nsActive : nsActive,
        }
    },
    // 通过value设置data
    setDataByValue: function(data, value, state){
        var tabObj = this.getTabInfoByValue(value);
        state = typeof(state)=="string"?state:'source';
        data.provinceArr = tabObj.province;
        data.provinceVal = tabObj.provinceVal;
        data.provinceText = tabObj.provinceText;
        data.cityArr = tabObj.city;
        data.cityVal = tabObj.cityVal;
        data.cityText = tabObj.cityText;
        data.areaArr = tabObj.area;
        data.areaVal = tabObj.areaVal;
        data.areaText = tabObj.areaText;
        var nsActive = tabObj.nsActive;
        var isComplete = false;
        switch(state){
            case 'source':
                data.inputText = tabObj.inputText;
                data.inputName = tabObj.inputName;
                break;
            case 'clickname':
                if(nsActive=="province"){
                    if(data.cityArr.length>0){
                        nsActive = 'city';
                    }else{
                        isComplete = true;
                    }
                }else{
                    if(nsActive=="city"){
                        if(data.areaArr.length>0){
                            nsActive = 'area';
                        }else{
                            isComplete = true;
                        }
                    }else{
                        isComplete = true;
                    } 
                }
                break;
            case 'keyupnull':
            case 'setValue':
                if(nsActive=="province"){
                    if(data.cityArr.length>0){
                        nsActive = 'city';
                    }else{
                        isComplete = true;
                    }
                }else{
                    if(nsActive=="city"){
                        if(data.areaArr.length>0){
                            nsActive = 'area';
                        }else{
                            isComplete = true;
                        }
                    }else{
                        isComplete = true;
                    } 
                }
                data.inputText = tabObj.inputText;
                data.inputName = tabObj.inputName + ' ';
                break;
        }
        data.nsActive = nsActive;
        data.isComplete = isComplete;
    },
    // 通过value获取code/name
    getNameByVal: function(value){
        var provinceNameByCode = nsDataFormat.formatProvince.provinceNameByCode;
        var name = provinceNameByCode[value] ? provinceNameByCode[value] : "";
        return name;
    },
    // 初始化
    init : function(code, config, vueConfig){
        var _this = this;
        // 设置容器
        var formID = config.formID;
        var tabId = "ns-provinceselect-"+config.fullID;
        _this.setContainer(formID, tabId, config);
        /**
         * inputName  显示的文字
         * provinceArr      显示省列表
         * provinceText     省name
         * provinceVal      省code
         * cityArr          显示市列表
         * cityText         市name
         * cityVal          市code
         * areaArr          显示区列表
         * areaText         区name
         * areaVal          区code
         * nsActive         正在显示的面板      ‘province/city/area’
         * nsTabShow        是否显示tab面板     ‘true/false’
         * 
         */
        var data = _this.getData(config);
        var value = code;
        _this.setDataByValue(data, value);
        config.tabVue = new Vue({
            el: '#' + tabId,
            data: data,
            watch: {
                nsTabShow:function(value, oldValue){
                    var __this = this;
                    if(!value){
                        $('#'+tabId).remove();
                        delete config.tabVue;
                        vueConfig.nsTabShow = false;
                        $(document).off('click', __this.documentClose);
                    }
                },
            },
            methods: {
                confirm: function(){
                    var __this = this;
                    var provinceVal = __this.provinceVal;
                    var cityVal = __this.cityVal;
                    var areaVal = __this.areaVal;
                    var value = provinceVal;
                    if(areaVal!=""){
                        value = areaVal;
                    }else{
                        if(cityVal!=""){
                            value = cityVal;
                        }
                    }
                    var provinceText = "";
                    if(__this.provinceText!=""){
                        provinceText += __this.provinceText;
                    }
                    if(__this.cityText!=""){
                        provinceText += ' ' + __this.cityText;
                    }
                    if(__this.areaText!=""){
                        provinceText += ' ' + __this.areaText;
                    }
                    var sourceValue = config.value;
                    __this.inputText = value;
                    __this.inputName = provinceText;
                    vueConfig.inputText = value;
                    vueConfig.inputName = provinceText;
                    if(sourceValue!=value){
                        vueConfig.change();
                    }
                    __this.close();
                },
                nameSelect: function(ev){
                    var __this = this;
                    var $target = $(ev.target);
                    var value = $target.attr("value"); 
                    _this.setDataByValue(__this, value, 'clickname');
                    if(__this.isComplete==true){
                        __this.confirm();
                    }
                },
                clickTab: function(ev){
                    var __this = this;
                    var $target = $(ev.target);
                    var nsType = $target.attr('ns-type');
                    __this.nsActive = nsType;
                    switch(nsType){
                        case "province":
                            __this.cityVal = "";
                            __this.cityText = "";
                            __this.areaVal = "";
                            __this.areaText = "";
                            break;
                        case "city":
                            __this.areaVal = "";
                            __this.areaText = "";
                            break;
                        case "area":
                            break;
                    }
                },
                close: function(isHaveFocus){
                    isHaveFocus = typeof(isHaveFocus)=="boolean"?isHaveFocus:true;
                    var __this = this;
                    __this.nsTabShow = false;
                    if(isHaveFocus){
                        vueConfig.focus();
                    }
                },
                // 点击任意位置关闭
                documentClose:function(ev){
                    NetstarComponent.commonFunc.clickAnyWhereToFunc(ev);
                },
            },
            mounted: function(){
                // 计算位置
                var __this = this;
                // 添加点击任意位置关闭
                var obj = {
                    relId : __this.id,
                    containerId : tabId,
                    parentName : '.pt-form-group',
                    func : function(){
                        if(__this.nsTabShow){
                            __this.nsTabShow = false;
                        }
                    }
                }
                $(document).on('click', obj, __this.documentClose);
                // 显示 位置
                var $tabs = $('[name="'+__this.id+'"]');
                // var $input = $('#'+__this.id);
                NetstarComponent.commonFunc.setContainerPosition($tabs, config.$relative);
            }
        });
    },
}
// 省市联动
NetstarComponent.provinceselect = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            text: '<input class="pt-form-control" :disabled="disabled" :value="inputName" v-model="inputName" :nsValue="inputText" :id="id" :style="styleObject" @click="show" @keyup="keyup" @blur="blurHandler" @change="change">',
            tab: '<div class="pt-dropdown" :name="id">'
                    + '<div class="pt-tab-tabs">'
                        + '<div class="pt-tab-title">'
                            + '<ul>'
                                + '<li ns-type="province" :ns-active="nsActive==\'province\'?true:false" :class="[nsActive==\'province\'?\'current\':\'\']" :value="provinceVal" @click="clickTab">{{provinceText}}</li>'
                                + '<li ns-type="city" :ns-active="nsActive==\'city\'?true:false" :value="cityVal" :class="[nsActive==\'city\'?\'current\':\'\',nsActive==\'province\'?\'hide\':\'\']" @click="clickTab">{{cityText==""?"请选择":cityText}}</li>'
                                + '<li ns-type="area" :ns-active="nsActive==\'area\'?true:false" :value="areaVal" :class="[nsActive==\'area\'?\'current\':\'\',nsActive!=\'area\'?\'hide\':\'\']" @click="clickTab">{{areaText==""?"请选择":areaText}}</li>'
                            + '</ul>'
                        + '</div>'
                        + '<div class="pt-tab-content">'
                            + '<div class="" ns-list="province" :class="nsActive!=\'province\'?\'hide\':\'\'">'
                                + '<ul>'
                                    + '<li v-for="province in provinceArr" :class="provinceText==province.name?\'current\':\'\'" :value="province.code" @click="nameSelect">{{province.name}}</li>'
                                + '</ul>'
                            + '</div>'
                            + '<div class="" ns-list="city" :class="nsActive!=\'city\'?\'hide\':\'\'">'
                                + '<ul>'
                                    + '<li v-for="city in cityArr" :class="cityText==city.name?\'current\':\'\'" :value="city.code" @click="nameSelect">{{city.name}}</li>'
                                + '</ul>'
                            + '</div>'
                            + '<div class="" ns-list="area" :class="nsActive!=\'area\'?\'hide\':\'\'">'
                                + '<ul>'
                                    + '<li v-for="area in areaArr" :class="areaText==area.name?\'current\':\'\'" :value="area.code" @click="nameSelect">{{area.name}}</li>'
                                + '</ul>'
                            + '</div>'
                        + '</div>'
                    + '</div>'
                    + '<div class="pt-btn-group">'
                        + '<button class="pt-btn pt-btn-icon pt-btn-default" @click="confirm"><i class="icon-check"></i></button>'
                        + '<button class="pt-btn pt-btn-icon pt-btn-default" @click="close"><i class="icon-close"></i></button>'
                    + '</div>'
                + '</div>',
        },
        MOBILE:{
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        200,            // 默认宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 显示类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
		}
		nsVals.setDefaultValues(config, defaultConfig);
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
    },
    // 验证配置是否正确
    validatConfig: function(config){
        return true;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        if(config.formSource=="staticData"){
            var contentHtml = NetstarComponent.getStaticTemplate(config);
            contentHtml = contentHtml.replace("{{inputText}}", "{{inputName}}");
        }else{
            var textHtml = tempalte.text;
            var tabHtml = tempalte.tab;
            // var contentHtml = textHtml + tabHtml;
            var contentHtml = textHtml;
            // contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
            if(config.formSource=='table'){
                containerHtml = NetstarComponent.common.tableComponent;
            }
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        data.inputText = config.value;
        data.inputName = NetstarComponent.provinceselectTab.getNameByVal(config.value);
        if(data.inputName === ""){
            data.inputText = "";
        }
        return data;
    },
    // 通过地名name获得code码即value值
    getValueByName: function(name){
        var value = '';
        if(name == ""){
            return value;
        }
        var isReadCode = false;
        var _provinceInfo = $.extend(true, [], provinceInfo);
        for(var provinceI=0;provinceI<_provinceInfo.length;provinceI++){
            var provinceCode = _provinceInfo[provinceI].code;
            var provinceName = _provinceInfo[provinceI].name;
            var provinceWb = _provinceInfo[provinceI].wb;
            var provincePinyin = _provinceInfo[provinceI].pinyin;
            var cityInfo = _provinceInfo[provinceI].sub;
            if(provinceName.indexOf(name)>-1||provinceWb.indexOf(name)>-1||provincePinyin.indexOf(name)>-1){
                isReadCode = true;
                value = provinceCode;
            }
            if(!isReadCode&&$.isArray(cityInfo)){
                for(var cityI=0; cityI<cityInfo.length; cityI++){
                    var cityCode = cityInfo[cityI].code;
                    var cityName = cityInfo[cityI].name;
                    var cityWb = cityInfo[cityI].wb;
                    var cityPinyin = cityInfo[cityI].pinyin;
                    var areaInfo = cityInfo[cityI].sub;
                    if(cityName.indexOf(name)>-1||cityWb.indexOf(name)>-1||cityPinyin.indexOf(name)>-1){
                        isReadCode = true;
                        value = cityCode;
                    }
                    if(!isReadCode&&$.isArray(areaInfo)){
                        for(var areaI=0; areaI<areaInfo.length; areaI++){
                            var areaCode = areaInfo[areaI].code;
                            var areaName = areaInfo[areaI].name;
                            var areaWb = areaInfo[areaI].wb;
                            var areaPinyin = areaInfo[areaI].pinyin;
                            if(areaName.indexOf(name)>-1||areaWb.indexOf(name)>-1||areaPinyin.indexOf(name)>-1){
                                isReadCode = true;
                                value = areaCode;
                                break;
                            }
                        }
                    }else{
                        break;
                    }
                }
            }else{
                break;
            }
        }
        return value;
    },
    // 初始化tab页
    initTabVue: function(config, inputVueConfig){
        config.$relative = $('#'+config.fullID);
        NetstarComponent.commonFunc.initVueProvince(config, inputVueConfig);
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                if(value === ''){
                    isTrue = false;
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                /**
                 * inputName  显示的文字
                 * provinceArr      显示省列表
                 * provinceText     省name
                 * provinceVal      省code
                 * cityArr          显示市列表
                 * cityText         市name
                 * cityVal          市code
                 * areaArr          显示区列表
                 * areaText         区name
                 * areaVal          区code
                 * nsActive         正在显示的面板      ‘province/city/area’
                 * nsTabShow        是否显示tab面板     ‘true/false’
                 */
                var data = _this.getData(config);
                // NetstarComponent.provinceselectTab.setDataByValue(data, config.value);
                return data;

            },
            watch: {
                inputText:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                },
                // tabs是否显示
                nsTabShow: function(value, oldValue){
                    if(value){
                        _this.initTabVue(config, this);
                    }else{
                        var vueTabConfig = config.tabVue;
                        if(typeof(vueTabConfig)=="object"){
                            vueTabConfig.close(false);
                        }
                    }
                },
            },
            methods: {
                show: function(ev){
                    var __this = this;
                    __this.nsTabShow = true;
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var value = config.value;
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var __this = this;
                    if(__this.nsTabShow == true){
                        __this.nsTabShow = false;
                    }
                    var sourceValue = config.value;
                    // config.value = value;
                    __this.inputName = NetstarComponent.provinceselectTab.getNameByVal(value);
                    __this.inputText = __this.inputName === '' ? '' : value;
                    if(sourceValue!=value){
                        __this.change();
                    }
                },
                focus: function(){
                    var __this = this;
                    var $input = $('#'+__this.id);
                    $input.focus();
                },
                // 设置失去焦点
                blurHandler: function(ev){
                    if(this.nsTabShow==false){
                        this.getValue();
                        // 判断是否执行blurHandler
                        NetstarComponent.formBlurHandler(config, this);
                    }
                    var value = this.getValue(false);
                    if(value===''){
                        this.inputName = '';
                    }
                },
                // 失去焦点
                blur: function(){
                    var __this = this;
                    var $input = $('#'+__this.id);
                    $input.blur();
                },
                // keyup " "
                keyup: function(ev){
                    var __this = this;
                    var $ev = $(ev.target);
                    var inputName = $ev.val();
                    var vueTabConfig = config.tabVue;
                    switch(ev.keyCode){
                        case 8: // Backspace
                            var _inputNameArr = inputName.split(' ');
                            var inputNameArr = [];
                            for(var i = 0; i < _inputNameArr.length; i++){
                                if(_inputNameArr[i] !== ''){
                                    inputNameArr.push(_inputNameArr[i]);
                                }
                            }
                            if(inputNameArr.length === 0 || inputNameArr.length === 1){
                                // 出入框为空
                                var value = _this.getValueByName(inputName);
                                NetstarComponent.provinceselectTab.setDataByValue(vueTabConfig, value, 'source');
                                vueTabConfig.inputText = '';
                                vueTabConfig.inputName = '';
                                __this.inputText = '';
                                __this.inputName = '';
                                return;
                            }
                            var inputNameStr = '';
                            for(var i = 0; i < inputNameArr.length - 1; i++){
                                inputNameStr += inputNameArr[i] + ' ';
                            }
                            inputNameStr = inputNameStr.substring(0, inputNameStr.length-1);
                            for(var i=(inputNameArr.length-2);i>-1;i--){
                                var valueName = inputNameArr[i];
                                var value = _this.getValueByName(valueName);
                                if(value!=""){
                                    if(typeof(vueTabConfig)=="undefined"){
                                        var vueTabConfigData = {};
                                        NetstarComponent.provinceselectTab.setDataByValue(vueTabConfigData, value, 'keyupnull');
                                        __this.inputText = vueTabConfigData.inputText;
                                        __this.inputName = vueTabConfigData.inputName;
                                        if(vueTabConfigData.isComplete==true){
                                            __this.nsTabShow = false;
                                        }else{
                                            __this.nsTabShow = true;
                                        }
                                    }else{
                                        NetstarComponent.provinceselectTab.setDataByValue(vueTabConfig, value, 'keyupnull');
                                        __this.inputText = vueTabConfig.inputText;
                                        __this.inputName = vueTabConfig.inputName;
                                        __this.isComplete = vueTabConfig.isComplete;
                                        if(__this.nsTabShow == false){
                                            __this.nsTabShow = true;
                                        }
                                        if(__this.isComplete==true){
                                            vueTabConfig.confirm();
                                        }
                                    }
                                    break;
                                }
                            }
                            break;
                        case 32: // 空格
                            if(inputName==""){
                                // 出入框为空
                                var value = _this.getValueByName(inputName);
                                NetstarComponent.provinceselectTab.setDataByValue(vueTabConfig, value, 'source');
                                vueTabConfig.inputText = '';
                                vueTabConfig.inputName = '';
                                __this.inputText = '';
                                __this.inputName = '';
                                return;
                            }
                            var inputNameStrArr = inputName.split('');
                            if(inputNameStrArr[inputNameStrArr.length-1]!=" "){
                                // 输入框最后一个字符是空
                                return;
                            }
                            var inputNameArr = inputName.split(' ');
                            for(var i=(inputNameArr.length-2);(-1)<i&&i<(inputNameArr.length-1);i--){
                                var valueName = inputNameArr[i];
                                var value = _this.getValueByName(valueName);
                                if(value!=""){
                                    if(typeof(vueTabConfig)=="undefined"){
                                        var vueTabConfigData = {};
                                        NetstarComponent.provinceselectTab.setDataByValue(vueTabConfigData, value, 'keyupnull');
                                        if(vueTabConfigData.isComplete==true){
                                            __this.nsTabShow = false;
                                        }else{
                                            __this.nsTabShow = true;
                                        }
                                    }else{
                                        NetstarComponent.provinceselectTab.setDataByValue(vueTabConfig, value, 'keyupnull');
                                        __this.inputText = vueTabConfig.inputText;
                                        __this.inputName = vueTabConfig.inputName;
                                        __this.isComplete = vueTabConfig.isComplete;
                                        if(__this.nsTabShow == false){
                                            __this.nsTabShow = true;
                                        }
                                        if(__this.isComplete==true){
                                            vueTabConfig.confirm();
                                        }
                                    }
                                    break;
                                }
                            }
                            break;
                        case 13: // enter
                            if(__this.nsTabShow == true){
                                __this.nsTabShow = false;
                            }
                            var value = config.value;
                            if(__this.inputText != value){
                                __this.setValue(__this.inputText);
                            }
                            NetstarComponent.setNextComponentFocus(config, __this);
                            break;
                        default:
                            if(inputName.length > 0 &&__this.nsTabShow == false){
                                __this.nsTabShow = true;;
                            }
                            break;
                    }
                },
                // 改变 change
                change: function(){
                    var __this = this;
                    var inputText = __this.inputText;
                    var inputName = __this.inputName;
                    // var sourceValue = config.value;
                    config.value = inputText;
                    var obj = {
                        id:config.id,
                        text:inputName,
                        value:inputText,
                        config:config,
                        vueConfig:__this,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted: function(){
                var __this = this;
                if(config.formSource=="staticData"&&config.acts=="baiduMapByName"){
                    var inputName = this.inputName;
                    inputName = inputName.replace(/ /g, "");
                    this.inputTextURL = 'https://api.map.baidu.com/geocoder?address='+ encodeURIComponent(inputName)+'&output=html&src=webapp.baidu.openAPIdemo';
                }
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            }
        }
        return component;
    },
}
// 视图查看组件
NetstarComponent.viewer = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
            selected:       'selected',
            selectedClose:  'selectedClose',
            close :         'close',
            add :           'add',
		},
		zh:{
            selected:       '选中',
            selectedClose:  '选中并关闭',
            close :         '关闭',
            add :           '添加',
		}
    },
    TEMPLATE: {
        PC:{
            button: '<button class="pt-control-label-btn"><i class="icon-arrow-right"></i></button>',
        },
        MOBILE:{},
    },
	// 设置config的默认配置
	setDefault: function(config){
        config.type = config.type == 'viewerList' ? 'viewerList' : 'viewerVo';
        var defaultConfig = {
            type : 'GET',
            data: {},
            dataSrc: 'rows',
		}
		nsVals.setDefaultValues(config.ajax, defaultConfig);
    },
    // 验证配置是否正确
    validatConfig: function(config){
        var validArr =
			[
				['ajax', 			'object', 	    true],
				['$container', 		'object', 	    true],
				['getValueFunc', 	'function', 	true],
				['field', 			'object', 	    true],
			]
        var isValid = nsDebuger.validOptions(validArr, config);
        if(isValid){
            if(typeof(config.ajax.url)!="string"){
                nsAlert('ajax配置错误', 'error');
                console.error(config);
                isValid = false;
            }
            if(!$.isArray(config.field)){
                nsAlert('field配置错误', 'error');
                console.error(config);
                isValid = false;
            }else{
                if(config.field.length == 0){
                    nsAlert('field配置错误', 'error');
                    console.error(config);
                    isValid = false;
                }
            }
            if(config.$container.length == 0){
                nsAlert('$container配置错误', 'error');
                console.error(config);
                isValid = false;
            }
        }
        return isValid;
    },
    getHtml: function(){
        return $(this.TEMPLATE.PC.button);
    },
    setEvent: function(config){
        var _this = this;
        var $button = config.$button;
        $button.off('click');
        $button.on('click', function(ev){
            _this.dialog.init(config);
        });
    },
    dialog: {
        TEMPLATE:{
            table: '<table class="pt-table-simple">'
                        + '<thead>'
                            + '<tr>'
                                + '<th v-for="titleObj in titleArr" :ns-tabledata="titleObj.field">{{titleObj.title}}</th>'
                            + '</tr>'
                        + '</thead>'
                        + '<tbody>'
                            + '<tr v-for="valueObj in dataArr">'
                                + '<td v-for="titleObj in titleArr">{{valueObj[titleObj.field]}}</td>'
                            + '</tr>'
                        + '</tbody>'
                    + '</table>',
        },
        table: function(valObj, showConfig){
            var config = showConfig.config;
            var dialogConfig = showConfig.dialogConfig;
            var id = dialogConfig.config.bodyId;
            var html = this.TEMPLATE.table;
            $('#'+id).append(html);
            new Vue({
                el: '#'+id,
                data: {
                    titleArr : config.field,
                    dataArr : valObj,
                },
            });
        },
        form: function(valObj, showConfig){
            var config = showConfig.config;
            var dialogConfig = showConfig.dialogConfig;
            var id = dialogConfig.config.bodyId;
            var field = $.extend(true, [], config.field);
            for(var fieldI=0; fieldI<field.length; fieldI++){
                if(typeof(valObj[field[fieldI].id])!="undefined"){
                    field[fieldI].value = valObj[field[fieldI].id];
                }
            }
            var formJson = {
                id: id,
                templateName: 'form',
                componentTemplateName: 'PC',
                formSource: 'staticData',
                isSetMore:false,
                form:field,
            };
            var components = NetstarComponent.formComponent.getFormConfig(formJson);
            NetstarComponent.formComponent.init(components, formJson);
        },
        show: function(dialogConfig, config){
            var ajaxConfig = $.extend(true, {}, config.ajax);
            ajaxConfig.plusData = {
                config : config,
                dialogConfig : dialogConfig
            };
            ajaxConfig.data = config.getValueFunc();
            NetStarUtils.ajax(ajaxConfig, function(data, _ajaxConfig){
                var plusData = _ajaxConfig.plusData;
                var type = plusData.config.type;
                var dataObj = data;
                if(typeof(_ajaxConfig.dataSrc)=="string"){
                    dataObj = data[_ajaxConfig.dataSrc];
                }
                if(type == "viewerList"){
                    NetstarComponent.viewer.dialog.table(dataObj, plusData);
                }else{
                    NetstarComponent.viewer.dialog.form(dataObj, plusData);
                }
            })
        },
        init: function(config){
            var _this = this;
            var dialogConfig = {
                id: 'viewer-' + config.type + '-dialog',
                title: '查看参考数据',
                templateName: 'PC',
                // height:500,
                shownHandler : function(obj){
                    console.log(obj);
                    _this.show(obj, config);
                },
            }
            NetstarComponent.dialogComponent.init(dialogConfig);
        },
    },
    // 获取组件配置
    init:function(config){
        var _this = this;
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setDefault(config);
        config.$button = _this.getHtml();
        _this.setEvent(config);
        config.$container.append(config.$button);
    },
}
// 地图
NetstarComponent.map = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            code: '<input class="pt-form-control hide" ns-field-type="code" :disabled="disabled" v-model="inputName" :nsValue="inputText" :style="styleObject" :ns-name="id" @click="show" @mousedown="mousedown" @mouseup="mouseup" @keyup="keyupCode" @blur="blurHandler" @mousedown="mousedown" @mouseup="mouseup" @change="change">',
            address: '<input class="pt-form-control" ns-field-type="address" :disabled="disabled" v-model="address" :style="styleObject" :ns-name="id" @keyup="keyup" @blur="blurHandler" @mousedown="mousedown" @mouseup="mouseup" @change="addressChange">',
            longitude: '<input class="pt-form-control hide" ns-field-type="longitude" :disabled="disabled" v-model="longitude" :style="styleObject" :ns-name="id" @keyup="keyup" @blur="blurHandler" @mousedown="mousedown" @mouseup="mouseup" @change="change">',
            latitude: '<input class="pt-form-control hide" ns-field-type="latitude" :disabled="disabled" v-model="latitude" :style="styleObject" :ns-name="id" @keyup="keyup" @blur="blurHandler" @mousedown="mousedown" @mouseup="mouseup" @change="change">',
            button : '<button class="pt-btn pt-btn-default pt-btn-icon" @click="showMap" @mousedown="mousedown" @mouseup="mouseup" >'
                        +'<i class="icon-map-mark-o"></i>'
                    + '</button>',
            dialogConfirm : '<button class="pt-btn pt-btn-default" ns-type="confirm">'
                                +'确认'
                            + '</button>',
            dialogGoto : '<button class="pt-btn pt-btn-default" ns-type="goto">'
                                +'到这去'
                            + '</button>',
            dialogContent : '<div class="map-position" ns-id="content">'
                                + '<div class="pt-input-group"  ns-type="address">'
                                    + '<input class="pt-form-control" type="text" id="{{addressId}}">'
                                + '</div>'
                                + '<div class="" ns-type="inputName"></div>'
                                // + '<div class="" ns-type="address"></div>'
                                + '<div class="" ns-type="longitude"></div>'
                                + '<div class="" ns-type="latitude"></div>'
                            + '</div>',
            search : '<div class="map-search pt-input-group" ns-id="search">'
                        + '<input class="pt-form-control" type="text">'
                        + '<div class="pt-input-group-btn">'
                            + '<button class="pt-btn pt-btn-default" ns-type="search">搜索</button>'
                        + '</div>'
                    + '</div>',
            mapPanel : '<div class="pt-map" id="{{mapPanelId}}">'
                            // 左侧列表
                            + '<div class="pt-map-control" id="{{mapListPanelId}}">'
                            + '</div>'
                            // 右侧地图
                            + '<div class="pt-map-location" id="{{mapId}}">'
                            + '</div>'
                        + '</div>'
        },
        MOBILE:{
        },
    },
    fieldOrder:['code','address','longitude','latitude'],
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        200,            // 默认宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 显示类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
            mapType:            'qq',           // 地图类型 腾讯/百度地图 qq/baidu
            referer: 			'OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77', // 您的应用名
            mapKey :            '2WPBZ-7QQWX-PZY4W-TZKNS-6OSYO-NMBYJ', // key
            editTips :          '仅用于改变显示，不改变定位',             // 修改提示
		}
		nsVals.setDefaultValues(config, defaultConfig);
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
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
            var configs = NetstarComponent.config[config.formID];
            if(typeof(configs)=="object"){
                var components = configs.config;
                if(typeof(components)=="object"){
                    var component = components[componentId];
                    comVal = component.value;
                }
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
    },
    // 验证配置是否正确
    validatConfig: function(config){
        return true;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        if(config.formSource=="staticData"){
            var contentHtml = NetstarComponent.getStaticTemplate(config);
            contentHtml = contentHtml.replace("{{inputText}}", "{{inputStr}}");
        }else{
            var codeHtml = tempalte.code;
            var addressHtml = tempalte.address;
            var longitudeHtml = tempalte.longitude;
            var latitudeHtml = tempalte.latitude;
            var buttonHtml = tempalte.button;
            var btncontainer = NetstarComponent.common.btncontainer;
            btncontainer = btncontainer.replace('{{nscontainer}}', buttonHtml);
            var contentHtml = '<div class="map-input" :id="id">'
                                    + codeHtml + addressHtml + longitudeHtml + latitudeHtml
                               + '</div>'
                               +　btncontainer;
            // contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
            if(config.formSource=='table'){
                containerHtml = NetstarComponent.common.tableComponent;
            }
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        data.isValidatValue = true;
        // 设置value值
        var value = config.value;
        for(var key in value){
            switch(key){
                case 'code':
                    var code = value[key];
                    var name = NetstarComponent.provinceselectTab.getNameByVal(code);
                    code = name === '' ? '' : code;
                    data.inputText = code;
                    data.inputName = name;
                    break;
                default:
                    data[key] = value[key];
                    break;
            }
        }
        var focusFieldType = '';
        var typeArr = this.fieldOrder;
        var fieldShowSou = config.fieldShow.source;
        var fieldShowIs = config.fieldShow.is;
        for(var i=0; i<typeArr.length; i++){
            if(fieldShowSou[typeArr[i]]){
                focusFieldType = typeArr[i];
                break;
            }
        }
        data.focusFieldType = 'address';
        for(var showKey in fieldShowIs){
            data[showKey] = fieldShowIs[showKey];
        }
        var inputStr = data.inputName + ' ' + data.address + ' ' + data.longitude + ' ' + data.latitude;
        data.inputStr = inputStr;
        return data;
    },
    // 通过地名name获得code码即value值
    getCodeByNames: function(name){
        var nameArr = name.split(' ');
        var code = '';
        for(var i=nameArr.length-1; i>-1; i--){
            code = NetstarComponent.provinceselectTab.getCodeByName(nameArr[i]);
            if(code !== ''){
                break;
            }
        }
        return code;
    },
    // 初始化tab页
    initTabVue: function(config, inputVueConfig){
        config.$relative = $('input[ns-name="'+config.fullID+'"][ns-field-type="code"]');
        NetstarComponent.commonFunc.initVueProvince(config, inputVueConfig);
    },
    // 设置信息到弹框
    setInfoToDialog : function($footer, value){
        var _this = this;
        var text = _this.getVueTextByValue(value);
        var $contentList = $footer.children('[ns-id="content"]').children();
        var textName = {
            inputName : '区域地址：',
            address : '详细地址：',
            longitude : '经度：',
            latitude : '纬度：',
        }
        for(var listI=0; listI<$contentList.length; listI++){
            var $con = $($contentList[listI]);
            var nsType = $con.attr('ns-type');
            var str = text[nsType];
            if(nsType == 'address'){
                $con.children().val(str);
            }else{
                if(str || str === 0){
                    str = textName[nsType] + str;
                }
                $con.text(str);
            }
        }
    },
    setBaiduPositionByPoint : function(map, myGeocoder, latitude, longitude, $footer, config){
        var _this = this;
        map.clearOverlays();
        var new_point = new BMap.Point(Number(longitude), Number(latitude));
        map.centerAndZoom(new_point, 16);
        marker = new BMap.Marker(new_point); // 创建标注
        map.addOverlay(marker); // 将标注添加到地图中
        map.panTo(new_point);
        // 设置选中数据
        myGeocoder.getLocation(new_point, function(data){      
            if(data){      
                config.mapData.selectedData = _this.getValueByBaiduMapDataInfo(data);
                _this.setInfoToDialog($footer, config.mapData.selectedData);     
            }  
        });
    },
    setBaiduPositionByAddress : function(map, myGeocoder, address, $footer, config){
        var _this = this;
        myGeocoder.getPoint(address, function(point) {
            if (point) {
                map.centerAndZoom(point, 16);
                map.addOverlay(new BMap.Marker(point));
                // 设置选中数据
                myGeocoder.getLocation(point, function(data){
                    config.mapData.selectedData = _this.getValueByBaiduMapDataInfo(data);
                    _this.setInfoToDialog($footer, config.mapData.selectedData);
                });
            } else {
                alert("您选择地址没有解析到结果!");
            }
        });
    },
    initMapBaidu: function(positionInfo, config, vueConfig){
        var _this = this;
        var mapDialog = {
            id : config.id + '-map',
            title : '百度地图',
            templateName : 'PC',
            height:600,
            width : 850,
            shownHandler : function(dialogData){
                var dialogConfig = dialogData.config;
                // var mapId = dialogConfig.bodyId;
                var contentId = dialogConfig.bodyId;
                var footerIdGroup = dialogConfig.footerIdGroup;
                var $footer = $('#' + footerIdGroup);

                // 设置地图面板
                _this.setMapContentPanel(contentId, config);
                var mapId = config.mapPanelId;
                // 点击的数据
                config.mapData = {
                    selectedData : {},
                    sourceData : positionInfo,
                };
                // 地图
                var type = positionInfo.type;
                var marker = ''; // 地图标记
                // 百度地图API功能
                var map = new BMap.Map(mapId);
                var point = new BMap.Point(116.331398, 39.897445);
                map.centerAndZoom(point, 12);
                // 创建地址解析器
                var myGeocoder = new BMap.Geocoder();
                config.mapData.geocoder = myGeocoder;
                config.mapData.map = map;
                // 将地址解析结果显示在地图上,并调整地图视野
                switch(type){
                    case 'point':
                        var longitude = positionInfo.longitude;
                        var latitude = positionInfo.latitude;
                        _this.setBaiduPositionByPoint(map, myGeocoder, latitude, longitude, $footer, config);
                        break;
                    case 'address':
                        var address = positionInfo.address;
                        _this.setBaiduPositionByAddress(map, myGeocoder, address, $footer, config);
                        break;
                    case 'none':
                        if (navigator.geolocation){ 
                            navigator.geolocation.getCurrentPosition(function(position){
                                var latitude = value.coords.latitude; 
                                var longitude = value.coords.longitude;
                                _this.setBaiduPositionByPoint(map, myGeocoder, latitude, longitude);
                            },function(){
                                nsAlert('定位失败');
                                console.log('定位失败');
                            },{ 
                                enableHighAccuracy: true, 
                                maximumAge: 1000
                            }); 
                        }else{ 
                            alert("您的浏览器不支持使用HTML5来获取地理位置服务"); 
                        } 
                        break;
                }
                map.enableScrollWheelZoom(true); //开启鼠标滚轮缩放
                if(!config.disabled){
                    map.addEventListener("click", function(event) {
                        var pointClick = event.point;
                        map.clearOverlays();  
                        marker = new BMap.Marker(event.point);
                        map.addOverlay(marker); // 将标注添加到地图中
                        myGeocoder.getLocation(pointClick, function(data){
                            config.mapData.selectedData = _this.getValueByBaiduMapDataInfo(data);
                            _this.setInfoToDialog($footer, config.mapData.selectedData);
                        });
                    });
                }
                _this.setDialogDomAndEvent(config, vueConfig, dialogConfig, positionInfo);
            },
        }
        NetstarComponent.dialogComponent.init(mapDialog);
    },
    initMapQQ: function(positionInfo, config, vueConfig){
        var _this = this;
        var mapDialog = {
            id : config.id + '-map',
            title : '腾讯地图',
            templateName : 'PC',
            height:600,
            width : 820,
            shownHandler : function(dialogData){
                var dialogConfig = dialogData.config;
                // var mapId = dialogConfig.bodyId;
                var contentId = dialogConfig.bodyId;
                var footerIdGroup = dialogConfig.footerIdGroup;
                var $footer = $('#' + footerIdGroup);
                config.$footer = $footer;
                // 设置地图面板
                config.footerAddressId = footerIdGroup + '-address';
                _this.mapPanel.setMapPanelContent(contentId, config);
                _this.mapPanel.setMapQQ(config, vueConfig, positionInfo);
                _this.setDialogDomAndEvent(config, vueConfig, dialogConfig, positionInfo);
            },
        }
        NetstarComponent.dialogComponent.init(mapDialog);
    },
    mapPanel : {
        template : {
            list : '<div class="">'
                        +  '<div class="map-search pt-input-group" ns-id="search">'
                            + '<input class="pt-form-control" type="text" @keyup.13="search" v-model="searchText">'
                            + '<div class="pt-input-group-btn">'
                                + '<button class="pt-btn pt-btn-default" ns-type="search" @click="search">搜索</button>'
                            + '</div>'
                        + '</div>'
                        + '<ul class="pt-map-results">'
                            + '<li @click="click($event, addressObj)" v-for="(addressObj,index) in list" '
                                    + ':class={current:(selectedAddress===addressObj.address&&selectedName===addressObj.name&&selectedLatitude===addressObj.latLng.lat&&selectedLongitude===addressObj.latLng.lng)}>'
                                + '<div class="">{{addressObj.name}}</div>'
                                + '<div class="">'
                                    + '<span>{{addressObj.address}}</span>'
                                    // + '<span>{{addressObj.phone}}</span>'
                                + '</div>'
                            + '</li>'
                        + '</ul>'
                    + '</div>'
        },
        // 设置地图弹框内容面板
        setMapPanelContent : function(contentId, config){
            config.mapPanel = {
                mapPanelId : contentId + '-panel',
                mapListPanelId : contentId + '-panel-list',
                mapId : contentId + '-panel-map',
                bodyId : contentId,
            }
            // 设置html代码
            var html = NetstarComponent.map.TEMPLATE[config.templateName].mapPanel;
            html = html.replace('{{mapPanelId}}', config.mapPanel.mapPanelId);
            html = html.replace('{{mapListPanelId}}', config.mapPanel.mapListPanelId);
            html = html.replace('{{mapId}}', config.mapPanel.mapId);
            var $content = $('#' + contentId);
            $content.append(html);
            config.mapPanel.$mapListPanel = $('#' + config.mapPanel.mapListPanelId);
            config.mapPanel.$input = $('#' + config.mapPanel.mapListPanelId).find('input');
            config.mapPanel.$btns = $('#' + config.mapPanel.mapListPanelId).find('button');
            config.mapPanel.$map = $('#' + config.mapPanel.mapId);
            config.mapPanel.$body = $content;
            this.setMapPanelAddressList([], config);
        },
        // 设置list面板
        setMapPanelAddressList : function(addressList, config){
            var _this = this;
            var listId = config.mapPanel.mapListPanelId;
            var getData = function(){
                var data = {
                    list : addressList,
                    searchText : '',
                    selectedName : '',
                    selectedAddress : '',
                    selectedLatitude : '',
                    selectedLongitude : '',
                }
                return data;
            }
            var html = this.template.list;
            var $container = $('#' + listId);
            $container.append(html);
            config.vueList = new Vue({
                el: '#' + listId,
                data: getData,
                watch: {},
                methods: {
                    click : function(ev, addressObj){
                        // 设置选中样式
                        this.selectedName = addressObj.name;
                        this.selectedAddress = addressObj.address;
                        this.selectedLatitude = addressObj.latLng.lat;
                        this.selectedLongitude = addressObj.latLng.lng;
                        config.mapData.selectedData = {
                            address : addressObj.address ? addressObj.address : addressObj.name,
                            latitude : addressObj.latLng.lat,
                            longitude : addressObj.latLng.lng,
                        }
                        _this.getAddressByPoint(addressObj.latLng.lat, addressObj.latLng.lng, function(data){
                            config.mapData.selectedData.code = data.result.ad_info.adcode;
                            NetstarComponent.map.setInfoToDialog(config.$footer, config.mapData.selectedData);
                        });
                    },
                    getValue : function(){
                        var addressStr = $('#' + config.footerAddressId).val();
                        config.mapData.selectedData.address = addressStr;
                        return config.mapData.selectedData;
                    },
                    search : function(){
                        var searchText = this.searchText;
                        config.mapData.searchService.search(searchText);
                    },
                },
                mounted: function(){
                    var $container = config.mapPanel.$body;
                    var containerHeight = $container.height();
                    var searchHeight = $container.find('.map-search').outerHeight();
                    var listHeight = containerHeight - searchHeight;
                    var $list = $container.find('.pt-map-results');
                    $list.height(listHeight);
                }
            });
        },
        getAddressByPoint : function(lat, lng, callBackFunc){
            var data={
                location:   lat + ',' + lng,
                /*换成自己申请的key*/
                key:        "2WPBZ-7QQWX-PZY4W-TZKNS-6OSYO-NMBYJ",
                get_poi:    0,
            }
            var url="https://apis.map.qq.com/ws/geocoder/v1/?";
            data.output="jsonp";
            $.ajax({
                type:           "GET",
                dataType:       'jsonp',
                data:           data,
                jsonp:          "callback",
                jsonpCallback:  "QQmap",
                url:            url,
                success:        function(data){
                    callBackFunc(data);
                },
                error : function(err){
                    alert("服务端错误，请刷新浏览器后重试");
                    console.log(err);
                }
            })
        },
        setMapQQ : function(config, vueConfig, positionInfo){
            var _this = this;
            var mapId = config.mapPanel.mapId;
            // 点击的数据
            config.mapData = {
                selectedData : {},
                sourceData : positionInfo,
            };
            // 腾讯地图
            var type = positionInfo.type;
            var marker = ''; // 地图标记
            var map = new qq.maps.Map(document.getElementById(mapId), {
                center: new qq.maps.LatLng(39.916527,116.397128),      // 地图的中心地理坐标。
                zoom : 15,
                panControl : false,
                zoomControl : false,
                scaleControl : false,
            });
            var isSetAddress = true;
            //地址和经纬度之间进行转换服务
            var geocoder = new qq.maps.Geocoder({
                complete : function(result){
                    //设置服务请求成功的回调函数
                    map.setCenter(result.detail.location);
                    if(typeof(marker)=="object"){
                        marker.setMap(null); 
                    }
                    marker = new qq.maps.Marker({
                        map: map,
                        position: result.detail.location
                    });
                    // 设置选中地址数据
                    var lat = result.detail.location.lat;
                    var lng = result.detail.location.lng;
                    _this.getAddressByPoint(lat, lng, function(data){
                        var showData = NetstarComponent.map.getValueByQQMapDataInfo(data);
                        showData.address = positionInfo.address;
                        NetstarComponent.map.setInfoToDialog(config.$footer, showData);
                    });
                },
                error : function(){
                    //若服务请求失败，则运行以下函数
                    alert("出错了，请输入正确的地址！！！");
                }
            });
            config.mapData.geocoder = geocoder;
            var searchService = new qq.maps.SearchService({
                map : map,
                complete: function(results) {
                    config.vueList.list = results.detail.pois;
                },
            });
            config.mapData.searchService = searchService;
            var setSelectedDataByPoint = function(data){
                var clickData = NetstarComponent.map.getValueByQQMapDataInfo(data);
                // NetstarComponent.map.setInfoToDialog(config.$footer, config.mapData.selectedData);
                config.mapData.searchService.search(clickData.address);
            }
            //点击
            if(!config.disabled){
                qq.maps.event.addListener(map, 'click', function(ev) {
                    if(typeof(marker)=="object"){
                        marker.setMap(null); 
                    }
                    marker = new qq.maps.Marker({
                        map: map,
                        // position: result.detail.location
                        position:ev.latLng, 
                    });
                    var lat = ev.latLng.getLat().toFixed(5);
                    var lng = ev.latLng.getLng().toFixed(5);
                    _this.getAddressByPoint(lat, lng, setSelectedDataByPoint);
                });
            }
            switch(type){
                case 'point':
                    var longitude = positionInfo.longitude;
                    var latitude = positionInfo.latitude;
                    var latLng = new qq.maps.LatLng(latitude, longitude);
                    // geocoder.getAddress(latLng);
                    _this.getAddressByPoint(latitude, longitude, setSelectedDataByPoint);
                    break;
                case 'address':
                    var address = positionInfo.address;
                    geocoder.getLocation(address);
                    searchService.search(address);
                    break;
                case 'none':
                    var geolocation = new qq.maps.Geolocation(config.mapKey, config.referer);
                    geolocation.getLocation(function(position){
                        var latitude = position.lat;
                        var longitude = position.lng;
                        var latLng = new qq.maps.LatLng(latitude, longitude);
                        // geocoder.getAddress(latLng);
                        _this.getAddressByPoint(latitude, longitude, setSelectedDataByPoint);
                    },function(){
                        nsAlert('定位失败');
                        console.log('定位失败');
                    },{
                        timeout: 8000,
                    })
                    break;
            }
        },
    },
    // 设置弹框内容 事件
    setDialogDomAndEvent : function(config, vueConfig, dialogConfig, positionInfo){
        var _this = this;
        var footerIdGroup = dialogConfig.footerIdGroup;
        var $footer = $('#' + footerIdGroup);
        // 搜索
        if(!config.disabled){
            var searchHtml = _this.TEMPLATE[config.templateName].search;
            var $search = $(searchHtml);
            var $inputSearch = $search.find('input');
            var $buttonSearch = $search.find('button');
            $buttonSearch.off('click');
            $buttonSearch.on('click', function(ev){
                var address = $inputSearch.val();
                if(address === ''){
                    return;
                }
                if(config.mapType == 'qq'){
                    config.mapData.geocoder.getLocation(address); // 定位
                    // 设置选中

                }else{
                    _this.setBaiduPositionByAddress(config.mapData.map, config.mapData.geocoder, address, $footer, config);
                }
            });
            // $footer.append($search);
        }
        // 内容
        var content = _this.TEMPLATE[config.templateName].dialogContent;
        content = content.replace('{{addressId}}', config.footerAddressId);
        $footer.append(content);
        _this.setInfoToDialog($footer, positionInfo.value);
        // 按钮
        var buttonConfirm = _this.TEMPLATE[config.templateName].dialogConfirm;
        var buttonGoto = _this.TEMPLATE[config.templateName].dialogGoto;
        var buttonHtml = '';
        if(!config.disabled){
            buttonHtml = buttonConfirm;
        }
        buttonHtml += buttonGoto;
        buttonHtml = '<div class="pt-btn-group">' + buttonHtml + '</div>';
        var $buttonContainer = $(buttonHtml);
        var $buttons = $buttonContainer.find('button');
        $buttons.off('click');
        $buttons.on('click', function(ev){
            var $this = $(this);
            var nsType = $this.attr('ns-type');
            switch(nsType){
                case 'confirm':
                    if(!$.isEmptyObject(config.mapData.selectedData)){
                        var value = config.vueList.getValue();
                        vueConfig.setConfigValue(value);
                    }else{
                        nsAlert('您没有选择地址', 'warning');
                        console.error('您没有选择地址');
                    }
                    NetstarComponent.dialog[dialogConfig.id].vueConfig.close();
                    break;
                case 'goto':
                    var hrefStr = '';
                    var mapSourceData = config.mapData.sourceData;
                    var type = mapSourceData.type;
                    if(!$.isEmptyObject(config.mapData.selectedData)){
                        type = 'selected';
                        var selectedData = config.vueList.getValue();
                    }
                    switch(type){
                        case 'selected':
                            var longitude = selectedData.longitude;
                            var latitude = selectedData.latitude;
                            var address = selectedData.address;
                            hrefStr = 'to=' + address + '&tocoord=' + latitude + ','+longitude;
                            break;
                        case 'point':
                            var longitude = mapSourceData.longitude;
                            var latitude = mapSourceData.latitude;
                            var address = mapSourceData.value.address;
                            if(typeof(address)=="string"&&address.length>0){
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
        $footer.append($buttonContainer);
    },
    // 通过地图中获取到的详细信息获得 value
    getValueByBaiduMapDataInfo : function(mapDataInfo){
        var province = mapDataInfo.addressComponents.province;
        var city = mapDataInfo.addressComponents.city;
        var area = mapDataInfo.addressComponents.district;
        var name = province + ' ' + city + ' ' + area;
        var code = this.getCodeByNames(name);
        var addressObj = {
            code : code,
            address: mapDataInfo.address,
            longitude: mapDataInfo.point.lng,
            latitude: mapDataInfo.point.lat,
        };
        return addressObj;
    },
    // 通过地图中获取到的详细信息获得 value
    getValueByQQMapDataInfo : function(mapDataInfo){
        var result = mapDataInfo.result;
        var code = result.ad_info.adcode;
        var address = result.address;
        var latitude = result.location.lat;
        var longitude = result.location.lng;
        var townTitle = result.address_reference && result.address_reference.town && result.address_reference.town.title ? result.address_reference.town.title : '';
        var landmark_l2 = result.address_reference && result.address_reference.landmark_l2 && result.address_reference.landmark_l2.title ? result.address_reference.landmark_l2.title : '';
        address += townTitle + landmark_l2;
        var addressObj = {
            code : code,
            address: address,
            longitude: longitude,
            latitude: latitude,
        };
        return addressObj;
    },
    // 通过value值设置位置信息
    getPositionInfoByValue : function(value, firstComponent){
        var addressStr = '';
        var type = 'address';
        if(typeof(value)!="object"){
        }else{
            firstComponent = firstComponent ? firstComponent : 'point';
            switch(firstComponent){
                case 'code':
                    if(value.code!==''){
                        addressStr = NetstarComponent.provinceselectTab.getNameByVal(value.code);
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
                            addressStr = NetstarComponent.provinceselectTab.getNameByVal(value.code);
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
                                addressStr = NetstarComponent.provinceselectTab.getNameByVal(value.code);
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
    // 获取格式化的value
    getFormatValue : function(value){
        var val = {
            code : '',
            address : '',
            longitude : '',
            latitude : '',
        }
        if(typeof(value)=="string"&&value.length>0){
            value = {
                address : value,
            }
        }
        if(typeof(value)!="object"){
        }else{
            var code = value.code;
            var name = NetstarComponent.provinceselectTab.getNameByVal(code);
            code = name === '' ? '' : code;
            val.code = code;
            val.address = value.address ? value.address : '';
            val.longitude = value.longitude ? value.longitude : '';
            val.latitude = value.latitude ? value.latitude : '';
        }
        return val;
    },
    // 通过value获取显示数据
    getVueTextByValue : function(value){
        var obj = {
            inputText : '',
            inputName : '',
            address : '',
            longitude : '',
            latitude : '',
        }
        if(typeof(value)!="object"){
        }else{
            var code = value.code;
            var name = NetstarComponent.provinceselectTab.getNameByVal(code);
            code = name === '' ? '' : code;
            obj.inputText = code;
            obj.inputName = name;
            obj.address = value.address ? value.address : '';
            obj.longitude = value.longitude || value.longitude === 0 ? value.longitude : '';
            obj.latitude = value.latitude || value.latitude === 0 ? value.latitude : '';
        }
        return obj;
    },
    // 验证value是否变化
    getValIsChange : function(value, sourseValue){
        var isChange = false;
        if(typeof(value)!=typeof(sourseValue)){
            isChange = true;
        }else{
            for(var valKey in value){
                if(value[valKey] != sourseValue[valKey]){
                    isChange = true;
                    break;
                }
            }
        }
        return isChange;
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                var _isTrue = false;
                for(var key in value){
                    if(value[key]!=null && value[key]!=''){
                        _isTrue = true;
                        continue;
                    }
                }
                if(!_isTrue){
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                isTrue = _isTrue;
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 获取下一个焦点字段
    getNextField : function(type, config){
        var typeArr = ['code','address','longitude','latitude'];
        var index = 0;
        for(var i=0; i<typeArr.length; i++){
            if(typeArr[i]==type){
                index = i;
                break;
            }
        }
        var obj = config.fieldShow.source;
        var nextIndex = index;
        for(var i=(index+1); i<typeArr.length; i++){
            if(obj[typeArr[i]]){
                nextIndex = i;
                break;
            }
        }
        var nextField = nextIndex>=typeArr.length || nextIndex===index ? false : typeArr[nextIndex];
        return nextField;
    },
    // 设置其它的关联组件的value值
    setRelMapComponentValue : function(vueConfig, config){
        var value = vueConfig.getValue(false);
        var vueConfigs = NetstarComponent.config[config.formID].vueConfig;
        for(var key in value){
            if(typeof(vueConfigs[key])=="object"){
                vueConfigs[key].setValue(value[key]);
            }
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                /**
                 * inputName  显示的文字
                 * provinceArr      显示省列表
                 * provinceText     省name
                 * provinceVal      省code
                 * cityArr          显示市列表
                 * cityText         市name
                 * cityVal          市code
                 * areaArr          显示区列表
                 * areaText         区name
                 * areaVal          区code
                 * nsActive         正在显示的面板      ‘province/city/area’
                 * nsTabShow        是否显示tab面板     ‘true/false’
                 */
                var data = _this.getData(config);
                return data;
            },
            watch: {
                inputText:function(value, oldValue){
                    this.setInputStr();
                    NetstarComponent.watchTemplateShowData(config, this, 'inputStr');
                },
                address:function(value, oldValue){
                    this.setInputStr();
                    NetstarComponent.watchTemplateShowData(config, this, 'inputStr');
                    if(value === ''){
                        this.inputText = '';
                        this.inputName = '';
                        this.longitude = '';
                        this.latitude = '';
                    }
                },
                longitude:function(value, oldValue){
                    this.setInputStr();
                    NetstarComponent.watchTemplateShowData(config, this, 'inputStr');
                },
                latitude:function(value, oldValue){
                    this.setInputStr();
                    NetstarComponent.watchTemplateShowData(config, this, 'inputStr');
                },
                // tabs是否显示
                nsTabShow: function(value, oldValue){
                    if(value){
                        _this.initTabVue(config, this);
                    }else{
                        var vueTabConfig = config.tabVue;
                        if(typeof(vueTabConfig)=="object"){
                            vueTabConfig.close(false);
                        }
                    }
                },
            },
            methods: {
                show: function(ev){
                    var __this = this;
                    __this.nsTabShow = true;
                },
                showMap: function(){
                    var value = this.getConfigValue(false);
                    var positionInfo = _this.getPositionInfoByValue(value);
                    switch(config.mapType){
                        case "qq":
                            _this.initMapQQ(positionInfo, config, this);
                            break;
                        case "baidu":
                            _this.initMapBaidu(positionInfo, config, this);
                            break;
                    }
                },
                setInputStr: function(){
                    var inputStr = this.inputName + ' ' + this.address + ' ' + this.longitude + ' ' + this.latitude;
                    this.inputStr = inputStr;
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    var __this = this;
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    // var value = config.value;
                    var value = {};
                    var conValue = __this.getConfigValue();
                    var fieldShow = config.fieldShow.source;
                    var subFields = config.subFields;
                    for(var key in fieldShow){
                        if(fieldShow[key]){
                            value[subFields[key]] = conValue[key];
                        }
                    }
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 获取value
                getConfigValue:function(){
                    var __this = this;
                    var value = {
                        code : __this.inputText,
                        address : __this.address,
                        longitude : __this.longitude,
                        latitude : __this.latitude,
                    };
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var __this = this;
                    if(typeof(value)=="string"){
                        var address = value;
                        value = __this.getConfigValue();
                        value.address = address;
                    }
                    __this.setConfigValue(value);
                },
                // 设置value
                setConfigValue:function(value){
                    var __this = this;
                    if(__this.nsTabShow == true){
                        __this.nsTabShow = false;
                    }
                    value = _this.getFormatValue(value)
                    var vueText = _this.getVueTextByValue(value);
                    for(var key in vueText){
                        __this[key] = vueText[key];
                    }
                    var sourceValue = config.value;
                    config.value = value;
                    var isChange = _this.getValIsChange(value, sourceValue);
                    if(isChange){
                        __this.change();
                        // 设置其它的关联组件的value值
                        _this.setRelMapComponentValue(__this, config);
                    }
                },
                focus: function(){
                    var nsName = this.id;
                    var fieldType = this.focusFieldType;
                    this.setFocusByType(fieldType);
                },
                // 设置失去焦点
                blurHandler: function(ev){
                    if(this.nsTabShow==false && this.isValidatValue){
                        this.getValue();
                        // 判断是否执行blurHandler
                        NetstarComponent.formBlurHandler(config, this);
                    }
                },
                // 失去焦点
                blur: function(){
                    var nsName = this.id;
                    var $input = $('input[ns-name="'+nsName+'"]');
                    $input.blur();
                },
                // 设置焦点
                setFocusByType : function(type){
                    var nsName = this.id;
                    var $input = $('input[ns-name="'+nsName+'"][ns-field-type="'+type+'"]');
                    $input.focus();
                    this.isValidatValue = true;
                },
                // 跳转
                jumpByFieldType : function(fieldType){
                    var __this = this;
                    var sourceValue = config.value;
                    var value = __this.getConfigValue();
                    var isChange = _this.getValIsChange(value, sourceValue);
                    if(isChange){
                        __this.change();
                    }
                    // var nextField = _this.getNextField(fieldType, config);
                    var nextField = false;
                    if(nextField === false){
                        NetstarComponent.setNextComponentFocus(config, __this);
                    }else{
                        this.isValidatValue = false;
                        __this.setFocusByType(nextField);
                    }
                },
                // keyup " "
                keyupCode: function(ev){
                    var __this = this;
                    var $ev = $(ev.target);
                    var inputName = $ev.val();
                    var vueTabConfig = config.tabVue;
                    switch(ev.keyCode){
                        case 8: // Backspace
                        case 32: // 空格
                            if(inputName==""){
                                // 出入框为空
                                var value = _this.getCodeByNames(inputName);
                                NetstarComponent.provinceselectTab.setDataByValue(vueTabConfig, value, 'source');
                                vueTabConfig.inputText = '';
                                vueTabConfig.inputName = '';
                                __this.inputText = '';
                                __this.inputName = '';
                                return;
                            }
                            var inputNameStrArr = inputName.split('');
                            if(inputNameStrArr[inputNameStrArr.length-1]!=" "){
                                // 输入框最后一个字符是空
                                return;
                            }
                            var inputNameArr = inputName.split(' ');
                            for(var i=(inputNameArr.length-2);(-1)<i&&i<(inputNameArr.length-1);i--){
                                var valueName = inputNameArr[i];
                                var value = _this.getCodeByNames(valueName);
                                if(value!=""){
                                    if(typeof(vueTabConfig)=="undefined"){
                                        var vueTabConfigData = {};
                                        NetstarComponent.provinceselectTab.setDataByValue(vueTabConfigData, value, 'keyupnull');
                                        if(vueTabConfigData.isComplete==true){
                                            __this.nsTabShow = false;
                                        }else{
                                            __this.nsTabShow = true;
                                        }
                                    }else{
                                        NetstarComponent.provinceselectTab.setDataByValue(vueTabConfig, value, 'keyupnull');
                                        __this.inputText = vueTabConfig.inputText;
                                        __this.inputName = vueTabConfig.inputName;
                                        __this.isComplete = vueTabConfig.isComplete;
                                        if(__this.nsTabShow == false){
                                            __this.nsTabShow = true;
                                        }
                                        if(__this.isComplete==true){
                                            vueTabConfig.confirm();
                                        }
                                    }
                                    break;
                                }
                            }
                            break;
                        case 13: // enter
                            if(__this.nsTabShow == true){
                                __this.nsTabShow = false;
                            }
                            var code = _this.getCodeByNames(inputName);
                            __this.inputText = code;
                            __this.jumpByFieldType('code');
                            break;
                        default:
                            if(inputName.length > 0 &&__this.nsTabShow == false){
                                __this.nsTabShow = true;;
                            }
                            break;
                    }
                },
                keyup : function(ev){
                    var __this = this;
                    switch(ev.keyCode){
                        case 13: 
                            // enter
                            var $input = $(ev.currentTarget);
                            var fieldType = $input.attr('ns-field-type');
                            __this.jumpByFieldType(fieldType);
                            break;
                        default:
                            break;
                    }
                },
                // mouseup
                mouseup : function(ev){
                    this.isValidatValue = true;
                },
                // mousedown
                mousedown : function(ev){
                    this.isValidatValue = false;
                },
                addressChange : function(){
                    // nsalert(config.editTips, 'warning');
                    console.warn(config.editTips);
                    console.warn(config);
                    this.change();
                },
                // 改变 change
                change: function(){
                    var __this = this;
                    var value = __this.getConfigValue();
                    var vueText = _this.getVueTextByValue(value);
                    config.value = value;
                    var obj = {
                        id:config.id,
                        text:vueText,
                        value:value,
                        config:config,
                        vueConfig:__this,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                },
                changeByRelField: function(obj){
                    // console.log(obj);
                    var value = this.getConfigValue();
                    var keyName = '';
                    var subFields = config.subFields;
                    var relConfig = obj.config;
                    for(var key in subFields){
                        if(relConfig.id === subFields[key]){
                            keyName = key;
                            continue;
                        }
                    }
                    if(value[keyName] !== obj.value){
                        value[keyName] = obj.value;
                        this.setConfigValue(value);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted: function(){
                var __this = this;
                if(config.formSource=="staticData"&&config.acts=="baiduMapByName"){
                    var inputName = this.inputName;
                    inputName = inputName.replace(/ /g, "");
                    this.inputTextURL = 'https://api.map.baidu.com/geocoder?address='+ encodeURIComponent(inputName)+'&output=html&src=webapp.baidu.openAPIdemo';
                }
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            }
        }
        return component;
    },
}
// 日期区间组件 input输入
NetstarComponent.dateRangeInput = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="{{nsModel}}" :ns-name="id" ns-field-type="{{type}}" />',
            button: '<button class="pt-btn pt-btn-default pt-btn-icon" :disabled="disabled" ns-field-type="{{type}}" :ns-name="id">'
                        +'<i class="icon-arrow-down-o"></i>'
                    + '</button>',
        },
        MOBILE:{},
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            label :                     '',                         // label
            templateName :              'PC',                       // 模板名字
            formSource:                 'form',                     // 表单类型 默认form staticData/table
            value :                     '',                         // value
            rules :                     '',                         // 规则
            disabled:                   false,                      // 是否只读
            daysOfWeekDisabled:         '',                         // 字符串或数组格式 根据周几设置只读 默认''即不设置只读
            daysOfWeekHighlighted:      false,                      // 目前没有用
            todayBtn:                   false,                      // 目前没有用
            clearBtn:                   false,                      // 目前没有用
            startView:                  0,                          // 开始视图 0(日)/1(月->日)/2(年->月->日)
            addvalue:                   {},                         // 日期底部按钮 配置 {value:''，id:''}
            format:                     nsVals.default.dateFormat,  // 默认日期格式
            isInputMask:                true,                       // 输入样式验证
            hidden:                     false,                      // 是否隐藏
            isDefaultDate:              false,                      // 是否设置默认日期
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        config.format = config.format.toUpperCase();
        config.fieldStart = typeof(config.fieldStart)=="string"?config.fieldStart:config.id+'Start';
        config.fieldEnd = typeof(config.fieldEnd)=="string"?config.fieldEnd:config.id+'End';
        // 获取格式化日期
        function getFormatDate(dateVal){
            dateVal = typeof(dateVal)=="undefined" ? '' : dateVal;
            if(typeof(dateVal)!='number'){
                dateVal = '';
            }else{
                // dateVal = moment(dateVal).format(config.format);
            }
            return dateVal;
        }
        function getComponentValue(componentId){
            var comVal = '';
            var configs = NetstarComponent.config[config.formID];
            if(typeof(configs)=="object"){
                var components = configs.config;
                if(typeof(components)=="object"){
                    var component = components[componentId];
                    comVal = component.value;
                }
            }
            return comVal;
        }
        if(config.value === ""){
            config.value = {}
        }
        // 设置value值
        if(typeof(config.value)=="object"){
            var fieldStart = getComponentValue(config.fieldStart);
            var fieldEnd = getComponentValue(config.fieldEnd);
            // config.value.fieldStart = getFormatDate(fieldStart);
            // config.value.fieldEnd = getFormatDate(fieldEnd);
            config.value.fieldStart = getFormatDate(fieldStart);
            config.value.fieldEnd = getFormatDate(fieldEnd);
        }else{
            config.value = {
                fieldStart : getFormatDate(config.value),
                fieldEnd : '',
            }
        }
    },
    // 验证配置是否正确
    validatConfig: function(config){
        return true;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        // 设置input输入框的相关属性
        function getStrByAttrs(str, name){
            var attrName = name === "start" ? 'Start' : 'End';
            str = str.replace('{{nsModel}}', 'field'+attrName);
            str = str.replace('{{type}}', name);
            return str;
        }
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                var $button = $(tempalte.button);
                // 为每一部分添加事件属性
                // 为input和button添加事件
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keyup.13', 'inputEnter');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                $input.attr('v-on:change', 'change');
                $input.attr('v-on:mousedown', 'mousedown');
                $input.attr('v-on:mouseup', 'mouseup');
                $button.attr('v-on:click', 'buttonClick');   // 按钮点击事件
                $button.attr('v-on:mousedown', 'mousedown');
                $button.attr('v-on:mouseup', 'mouseup');
                var inputHtml = $input.prop('outerHTML');   // input模板
                var inputHtmlStart = getStrByAttrs(inputHtml, 'start');
                var inputHtmlEnd = getStrByAttrs(inputHtml, 'end');
                var buttonHtml = $button.prop('outerHTML'); // button模板
                var buttonHtmlStart = getStrByAttrs(buttonHtml, 'start');
                var buttonHtmlEnd = getStrByAttrs(buttonHtml, 'end');
                var btncontainer = NetstarComponent.common.btncontainer;
                var btncontainerStart = btncontainer.replace('{{nscontainer}}', buttonHtmlStart);
                var btncontainerEnd = btncontainer.replace('{{nscontainer}}', buttonHtmlEnd);
                contentHtml = inputHtmlStart + btncontainerStart + inputHtmlEnd + btncontainerEnd;   // input+button整体模板
                // contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        return data;
    },
    inputEnter: function(config, vueComponent){
        NetstarComponent.setNextComponentFocus(config, vueComponent);
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                var _isTrue = false;
                for(var key in value){
                    if(value[key]!=null){
                        _isTrue = true;
                    }
                }
                if(!_isTrue){
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                isTrue = _isTrue;
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 验证输入值是否合法 获得合法输入值 不合格清空 只有在isInputMark==false时会出现验证不合格
    getFormatText: function(text){
        if(text!==''){
            var textDate = moment(text).format('x');
            if(textDate == 'Invalid date'){
                text = '';
                console.error('日期格式错误 设置为空');
            }
        }
        return text;
    },
    // 验证value是否变化
    getValIsChange : function(value, sourseValue){
        var isChange = false;
        if(typeof(value)!=typeof(sourseValue)){
            isChange = true;
        }else{
            for(var valKey in value){
                if(value[valKey] != sourseValue[valKey]){
                    isChange = true;
                    break;
                }
            }
        }
        return isChange;
    },
    // 设置其它的关联组件的value值
    setRelComponentValue : function(vueConfig, config){
        var value = vueConfig.getValue(false);
        var vueConfigs = NetstarComponent.config[config.formID].vueConfig;
        for(var key in value){
            if(typeof(vueConfigs[key])=="object"){
                vueConfigs[key].setValue(value[key]);
            }
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch: {
                inputText:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                }
            },
            methods: {
                // 设置日期组件样式
                dateDefind: function(){
                    var __this = this;
                    // 日期组件配置
                    var datePickerOption = 
                    {
                        autoclose:          true,
                        todayHighlight:     true,
                        firstDay:           1,
                        maxViewMode:        2,
                        enableOnReadonly:   false,
                        format:             config.format.toLowerCase(),   // 日期格式; 转化字母大小写
                        daysOfWeekDisabled: config.daysOfWeekDisabled,
                        startView:          config.startView,
                        orientation:        'bottom',                       // 显示位置
                        showOnFocus:        false,                          // 获取焦点时不显示
                        // startDate :         '2019/4/9'
                    }
                    if(!$.isEmptyObject(config.addvalue)){
                        datePickerOption.autovalue = config.addvalue;
                    }
                    var nsName = this.id;
                    var $input = $('input[ns-name="'+nsName+'"]');
                    function inputEvent(ev){
                        var $thisInput = $(ev.currentTarget);
                        var nsFieldType = $thisInput.attr('ns-field-type');
                        var textName = 'field'+nsFieldType.replace(/\b\w+\b/g, function(word) {   
                            return word.substring(0,1).toUpperCase( ) +  word.substring(1);
                        });
                        __this[textName] = $thisInput.val();
                        __this.change();
                        if(nsFieldType=="start"){
                            var $endInput = $('input[ns-name="'+nsName+'"][ns-field-type="end"]');
                            $endInput.datepicker('setStartDate' , __this[textName]);
                        }else{
                            var $startInput = $('input[ns-name="'+nsName+'"][ns-field-type="start"]');
                            $startInput.datepicker('setEndDate' , __this[textName]);
                        }
                    }
                    $input.datepicker(datePickerOption).on('changeDate', function(ev){
                        var $thisInput = $(ev.currentTarget);
                        inputEvent(ev);
                        $thisInput.focus();
                    })
                    $input.off('change');
                    $input.on('change', function(ev){
                        inputEvent(ev)
                    });
                    if(config.isInputMask){
                        $input.inputmask(config.format.replace(/((y?Y?)*)((m?M?)*)((d?D?)*)/g,function($1){return $1.slice(0,1).toLowerCase()}));
                    }
                },
                // 回车
                inputEnter: function(ev){
                    var $thisInput = $(ev.currentTarget);
                    var nsFieldType = $thisInput.attr('ns-field-type');
                    switch(nsFieldType){
                        case 'start':
                            var nsName = this.id;
                            var $input = $('input[ns-name="'+nsName+'"][ns-field-type="end"]');
                            this.isValidatValue = false;
                            $input.focus();
                            this.isValidatValue = true;
                            break;
                        case 'end':
                            _this.inputEnter(config, this);
                            break;
                    }
                },
                // 按钮点击
                buttonClick: function(ev){
                    var $button = $(ev.currentTarget);
                    var nsFieldType = $button.attr('ns-field-type');
                    var nsName = this.id;
                    var $input = $('input[ns-name="'+nsName+'"][ns-field-type="'+nsFieldType+'"]');
                    $input.datepicker('show');
                },
                // 验证value
                validatValue: function(value){
                    value = value==null?"":value;
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    var __this = this;
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var _value = config.value;
                    // 格式化value
                    var value = {}
                    value[config.fieldStart] = _value.fieldStart;
                    value[config.fieldEnd] = _value.fieldEnd;
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var i18n = NetstarComponent.date.I18N;
                    if(value!=''&&typeof(value)!='number'){
                        console.error(i18n.valueError);
                        console.error(value);
                        value = '';
                    }
                    if(value!=''){
                        value = moment(value).format(config.format);
                    }
                    var sourceValue = config.value;
                    config.value = value;
                    this.inputText = value;
                    var isSame = true;
                    // 判断是否改变
                    if(sourceValue != value){
                        isSame = false;
                    }
                    if(!isSame){
                        this.change();
                    }
                },
                // 设置value
                setConfigValue:function(value){
                    var __this = this;
                    var sourceValue = config.value;
                    config.value = value;
                    var isChange = _this.getValIsChange(value, sourceValue);
                    if(isChange){
                        var nsName = __this.id;
                        var $inputStart = $('input[ns-name="'+nsName+'"][ns-field-type="start"]');
                        var $inputEnd = $('input[ns-name="'+nsName+'"][ns-field-type="end"]');
                        var fieldStart = value.fieldStart === ''? '' : moment(value.fieldStart).format(config.format);
                        var fieldEnd = value.fieldEnd === ''? '' : moment(value.fieldEnd).format(config.format);
                        $inputStart.val(fieldStart);
                        $inputEnd.val(fieldEnd);
                        __this.change();
                        // 设置其它的关联组件的value值
                        _this.setRelComponentValue(__this, config);
                    }
                },
                mousedown: function(){
                    this.isValidatValue = false;
                },
                mouseup: function(){
                    this.isValidatValue = true;
                },
                // 设置焦点
                focusHandler: function(ev){
                    $(ev.target).select();
                },
                // 获得焦点
                focus: function(){
                    var nsName = this.id;
                    var $input = $('input[ns-name="'+nsName+'"][ns-field-type="start"]');
                    $input.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    if(this.isValidatValue){
                        this.getValue();
                    }
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                },
                // 失去焦点
                blur: function(){
                    var nsName = this.id;
                    var $input = $('input[ns-name="'+nsName+'"]');
                    $input.blur();
                },
                // 改变 change
                change: function(){
                    var __this = this;
                    var nsName = __this.id;
                    var $inputStart = $('input[ns-name="'+nsName+'"][ns-field-type="start"]');
                    var $inputEnd = $('input[ns-name="'+nsName+'"][ns-field-type="end"]');
                    var fieldStart = $inputStart.val();
                    var fieldEnd = $inputEnd.val();

                    __this.fieldStart = _this.getFormatText(fieldStart);
                    __this.fieldEnd = _this.getFormatText(fieldEnd);
                    var textStart = __this.fieldStart;
                    var textEnd = __this.fieldEnd;

                    var valStart = textStart!=='' ? Number(moment(textStart).format('x')) : '';
                    var valEnd = textEnd!=='' ? Number(moment(textEnd).format('x')) : '';

                    var value = {};
                    value[config.fieldStart] = valStart;
                    value[config.fieldEnd] = valEnd;
                    
                    var conValue = {
                        fieldStart : valStart,
                        fieldEnd : valEnd,
                    }
                    config.value = conValue;

                    var text = {};
                    text[config.fieldStart] = textStart;
                    text[config.fieldEnd] = textEnd;
                    var vueConfig = this;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                    _this.setRelComponentValue(__this, config)
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                },
                changeByRelField: function(obj){
                    var value = $.extend(true, {}, config.value);
                    var keyName = '';
                    var subFields = {
                        fieldStart : config.fieldStart,
                        fieldEnd : config.fieldEnd,
                    };
                    var relConfig = obj.config;
                    for(var key in subFields){
                        if(relConfig.id === subFields[key]){
                            keyName = key;
                            continue;
                        }
                    }
                    if(value[keyName] !== obj.value){
                        value[keyName] = obj.value;
                        this.setConfigValue(value);
                    }
                },
            },
            mounted: function(){
                this.dateDefind();
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            }
        }
        return component;
    },
}
// 日期区间组件 选择器
NetstarComponent.dateRangePicker = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
            applyLabel: "确认",
            cancelLabel: "取消",
            customRangeLabel: "选择日期区间",
            default: "默认：",
            defaultDateRange: "默认日期区间",
            fromLabel: "从",
            lastmonth: "上月",
            lastweek: "上周",
            localeformat: "YYYY/MM/DD",
            month: "本月",
            sevendays: "最近7天",
            thirtydays: "最近30天",
            toLabel: "到",
            today: "今天",
            week: "本周",
            yesterday: "昨天",
            format: "YYYY-MM-DD HH:mm:ss",
            rangeFormat: "YYYY-MM-DD",
            selectFormat: "yyyy-mm-dd",
            year: "YYYY",
            monthday: "MM/DD",
            separator: "至",
            monthNames: [ "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月" ],
            daysOfWeek: [ "周日", "周一", "周二", "周三", "周四", "周五", "周六" ],
		}
    },
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" :id="id" />',
            button: '<button class="pt-btn pt-btn-default pt-btn-icon" :disabled="disabled">'
                        +'<i class="icon-arrow-down-o"></i>'
                    + '</button>',
            clear : '<button class="pt-btn pt-btn-default pt-btn-icon clear" @click="clear" :class={hide:!isHaveValue}>'
                        + '<i class="icon-close"></i>'
                    + '</button>',
            dropdownContainer : '<div :class="dropdownClass" :id="dropdownId"></div>',  
        },
        MOBILE:{},
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            label :                     '',                         // label
            templateName :              'PC',                       // 模板名字
            formSource:                 'form',                     // 表单类型 默认form staticData/table
            value :                     '',                         // value
            rules :                     '',                         // 规则
            disabled:                   false,                      // 是否只读
            format:                     nsVals.default.dateFormat,  // 默认日期格式
            hidden:                     false,                      // 是否隐藏
            isDefaultDate:              false,                      // 是否设置默认日期
            ranges :                    true,                       // 默认范围 按钮  今天 昨天 最近七天 最近30天  本周 上周 本月 上月
            languageType :              'zh',                       // 默认中文
            isHasClose :                true,
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        config.format = config.format.toUpperCase();
        config.fieldStart = typeof(config.fieldStart)=="string"?config.fieldStart:config.id+'Start';
        config.fieldEnd = typeof(config.fieldEnd)=="string"?config.fieldEnd:config.id+'End';
        // 获取格式化日期
        function getFormatDate(dateVal){
            dateVal = typeof(dateVal)=="undefined" ? '' : dateVal;
            if(typeof(dateVal)!='number'){
                dateVal = '';
            }else{
                dateVal = moment(dateVal).format(config.format);
            }
            return dateVal;
        }
        function getComponentValue(componentId){
            var comVal = '';
            var configs = NetstarComponent.config[config.formID];
            if(typeof(configs)=="object"){
                var components = configs.config;
                if(typeof(components)=="object"){
                    var component = components[componentId];
                    comVal = component.value;
                }
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
            config.value.fieldStart = getFormatDate(fieldStart);
            config.value.fieldEnd = getFormatDate(fieldEnd);
        }else{
            config.value = {
                fieldStart : getFormatDate(config.value),
                fieldEnd : ''
            };
        }
        config.dropdownId = config.fullID + '-dropdown-container';
    },
    // 验证配置是否正确
    validatConfig: function(config){
        return true;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                var $button = $(tempalte.button);
                // 为每一部分添加事件属性
                // 为input和button添加事件
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keyup.13', 'inputEnter');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                // $input.attr('v-on:change', 'change');
                $input.attr('v-on:mousedown', 'mousedown');
                $input.attr('v-on:mouseup', 'mouseup');
                $button.attr('v-on:click', 'buttonClick');   // 按钮点击事件
                $button.attr('v-on:mousedown', 'mousedown');
                $button.attr('v-on:mouseup', 'mouseup');
                var inputHtml = $input.prop('outerHTML');   // input模板
                var buttonHtml = $button.prop('outerHTML'); // button模板
                if(config.isHasClose){
                    buttonHtml = tempalte.clear + buttonHtml;
                }
                var btncontainer = NetstarComponent.common.btncontainer;
                btncontainer = btncontainer.replace('{{nscontainer}}', buttonHtml);
                contentHtml = inputHtml + btncontainer;   // input+button整体模板
                contentHtml += tempalte.dropdownContainer;
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        if(data.inputText === ''){
            data.isHaveValue = false;
        }
        data.dropdownId = config.dropdownId;
        data.dropdownClass = 'pt-daterangepicker-dropdown';
        return data;
    },
    inputEnter: function(config, vueComponent){
        NetstarComponent.setNextComponentFocus(config, vueComponent);
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                var _isTrue = false;
                for(var key in value){
                    if(value[key] != null || value[key] !== ''){
                        _isTrue = true;
                    }
                }
                if(!_isTrue){
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                isTrue = _isTrue;
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 验证输入值是否合法 获得合法输入值 不合格清空 只有在isInputMark==false时会出现验证不合格
    getFormatText: function(text){
        if(text!==''){
            var textDate = moment(text).format('x');
            if(textDate == 'Invalid date'){
                text = '';
                console.error('日期格式错误 设置为空');
            }
        }
        return text;
    },
    // 获取日期区间参数
    getDateRangePickerOptions : function(config){
        var i18n = this.I18N[config.languageType];
        // 设置options
        var ranges = {};
        if (config.ranges == true) {
            ranges[i18n.today] = [moment(), moment()];
            ranges[i18n.yesterday] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
            ranges[i18n.sevendays] = [moment().subtract(6, 'days'), moment()];
            ranges[i18n.thirtydays] = [moment().subtract(29, 'days'), moment()];
            ranges[i18n.week] = [moment().startOf('week'), moment().endOf('week')];
            ranges[i18n.lastweek] = [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')];
            ranges[i18n.month] = [moment().startOf('month'), moment().endOf('month')];
            ranges[i18n.lastmonth] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];
        } 
        var options = {
            "ranges": ranges,
            "locale": {
                "format": i18n.localeformat,
                "separator": " - ",
                "applyLabel": i18n.applyLabel,
                "cancelLabel": i18n.cancelLabel,
                "fromLabel": i18n.fromLabel,
                "toLabel": i18n.toLabel,
                "customRangeLabel": i18n.customRangeLabel,
                "daysOfWeek": i18n.daysOfWeek,
                "monthNames": i18n.monthNames,
                "firstDay": 1
            },
            "alwaysShowCalendars": true,
            "opens": "center",
            "buttonClasses": "btn",
            // "parentEl": '#' + config.dropdownId,
        }
        // 设置默认日期 
        var value = config.value;
        var valueOptions = this.getSetData(value.fieldStart, value.fieldEnd, config.isDefaultDate, i18n);
        if(valueOptions.isHasDate){
            options.autoUpdateInput = true;
            options.startDate = valueOptions.startDate;
            options.endDate = valueOptions.endDate;
            options.ranges[i18n.defaultDateRange] = [moment(options.startDate, i18n.rangeFormat), moment(options.endDate, i18n.rangeFormat)];
            config.value.fieldStart = moment(options.startDate).format('x');
            config.value.fieldEnd = moment(options.endDate).format('x');
            if(options.startDate && options.startDate == options.endDate){
                // config.value.fieldEnd = (Number(config.value.fieldStart) + 60*60*24-1).toString();
                var date = moment(Number(config.value.fieldStart)).format(i18n.rangeFormat);
                var starDatetime = date + ' 00:00:00';
                var endDatetime = date + ' 23:59:59';
                config.value.fieldStart = moment(starDatetime).format('x');
                config.value.fieldEnd = moment(endDatetime).format('x');
            }
        }else{
            options.autoUpdateInput = false;
        }
        // 格式设置
        if(typeof(config.format) == 'string'){
            options.locale.format = config.format;
        }
        if(typeof(config.separator) == 'string'){
            options.locale.separator = config.separator;
        }
        return  options;
    },
    // 获得设置日期
    getSetData : function(fieldStart, fieldEnd, isSetDefault, i18n){
        var startDate = '';
        var endDate = '';
        var isHasDate = false;
        if(fieldStart !== ''){
            startDate = fieldStart;
            isHasDate = true;
            if (fieldEnd === '') {
                endDate = moment().format(i18n.rangeFormat);
            }
        }
        if(fieldEnd !== ''){
            endDate = fieldEnd;
            isHasDate = true;
            if (fieldStart === '') {
                startDate = moment().format(i18n.rangeFormat);
            }
        }
        if(startDate === '' && isSetDefault){
            isHasDate = true;
            startDate = moment().format(i18n.rangeFormat);
            endDate = moment().format(i18n.rangeFormat);
        }
        return {
            isHasDate : isHasDate,
            startDate : startDate,
            endDate : endDate,
        }
    },
    // 设置其它的关联组件的value值
    setRelComponentValue : function(vueConfig, config){
        var value = vueConfig.getValue(false);
        var vueConfigs = NetstarComponent.config[config.formID].vueConfig;
        for(var key in value){
            if(typeof(vueConfigs[key])=="object"){
                vueConfigs[key].setValue(value[key]);
            }
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch: {
                inputText:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                },
            },
            methods: {
                clear : function(){
                    this.setValue();
                    config.$input.focus();
                },
                // 设置日期组件样式
                dateDefind: function(){
                    var __this = this;
                    // 日期组件配置
                    var datePickerOption = _this.getDateRangePickerOptions(config);
                    var id = __this.id;
                    var $input = $('#' + id);
                    config.$input = $input; 
                    // $input.daterangepicker(datePickerOption, function(start, end, label) {
                    //     valueData.start = moment(start).format(config.format);
                    //     valueData.end = moment(end).format(config.format);
                    //     // __this.inputText = $input.val();
                    //     // var soufieldStart = __this.fieldStart;
                    //     // var soufieldEnd = __this.fieldEnd;
                    //     // __this.fieldStart = moment(start).format('YYYY-MM-DD');
                    //     // __this.fieldEnd = moment(end).format('YYYY-MM-DD');
                    //     // var isChange = soufieldStart != __this.fieldStart || soufieldEnd != __this.fieldEnd ? true : false;
                    //     // if(isChange){
                    //     //     __this.change();
                    //     // }
                    // });
                    $input.daterangepicker(datePickerOption);
                    // 显示
                    $input.on('show.daterangepicker',function(ev, picker){
                        $input.data('daterangepicker').autoUpdateInput = true;
                    });
                    $input.on('apply.daterangepicker',function(ev, picker){
                        // var soufieldStart = __this.fieldStart;
                        // var soufieldEnd = __this.fieldEnd;
                        // __this.fieldStart = moment(valueData.start).format('YYYY-MM-DD');
                        // __this.fieldEnd = moment(valueData.end).format('YYYY-MM-DD');
                        // __this.inputText = __this.fieldStart + ' - ' + __this.fieldEnd;
                        // var isChange = soufieldStart != __this.fieldStart || soufieldEnd != __this.fieldEnd ? true : false;
                        // if(isChange){
                        //     __this.change();
                        // }
                        var value = {};
                        value[config.fieldStart] = Number(moment(picker.startDate).format('x'));
                        value[config.fieldEnd] = Number(moment(picker.endDate).format('x'));
                        __this.setValue(value);
                    });
                    $input.on('cancel.daterangepicker',function(ev, picker){
                    });
                    $input.on('hide.daterangepicker',function(ev, picker){
                        if(!config.value.fieldStart && !config.value.fieldStart){
                            $input.val('');
                        }
                        $input.focus();
                    });
                },
                // 回车
                inputEnter: function(ev){
                    _this.inputEnter(config, this);
                },
                // 按钮点击
                buttonClick: function(ev){
                    var id = this.id;
                    var $input = $('#' + id);
                    $input.trigger('click');
                },
                // 验证value
                validatValue: function(value){
                    value = value==null?"":value;
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    var __this = this;
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var _value = config.value;
                    var value = {};
                    value[config.fieldStart] = _value.fieldStart ? Number(_value.fieldStart) : _value.fieldStart;
                    value[config.fieldEnd] = _value.fieldEnd ? Number(_value.fieldEnd) : _value.fieldEnd;
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置value 这个方法对外没有用
                setValue:function(value){
                    var __this = this;
                    // 格式化value
                    if(typeof(value)!="object"){
                        value = {};
                    }
                    var fieldStart = !isNaN(value[config.fieldStart]) && typeof(value[config.fieldStart]) != "undefined" ? Number(value[config.fieldStart]) : '';
                    var fieldEnd = !isNaN(value[config.fieldEnd]) && typeof(value[config.fieldEnd]) != "undefined" ? Number(value[config.fieldEnd]) : '';
                    __this.fieldStart = fieldStart;
                    __this.fieldEnd = fieldEnd;
                    var souValue = config.value;
                    var isChange = fieldStart != souValue.fieldStart || fieldEnd != souValue.fieldEnd ? true : false;
                    if(isChange){
                        __this.inputText =  + ' - ' + moment(fieldEnd).format(config.format.toUpperCase());
                        var inputTextStr = fieldStart === '' ? '' : moment(fieldStart).format(config.format.toUpperCase()) + ' - ';
                        inputTextStr += fieldEnd === '' ? '' : moment(fieldEnd).format(config.format.toUpperCase());
                        __this.inputText = inputTextStr;
                        config.$input.val(inputTextStr);
                        __this.change();
                    }
                },
                mousedown: function(){
                    this.isValidatValue = false;
                },
                mouseup: function(){
                    this.isValidatValue = true;
                },
                // 设置焦点
                focusHandler: function(ev){
                    $(ev.target).select();
                },
                // 获得焦点
                focus: function(){
                    var id = this.id;
                    var $input = $('#' + id);
                    $input.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    if(this.isValidatValue){
                        this.getValue();
                    }
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                },
                // 失去焦点
                blur: function(){
                    var nsName = this.id;
                    var $input = $('input[ns-name="'+nsName+'"]');
                    $input.blur();
                },
                // 改变 change
                change: function(){
                    var __this = this;
                    var textStart = __this.fieldStart;
                    var textEnd = __this.fieldEnd;

                    var valStart = textStart!=='' ? Number(moment(textStart).format('x')) : '';
                    var valEnd = textEnd!=='' ? Number(moment(textEnd).format('x')) : '';
                    if(valStart && valStart == valEnd){
                        valEnd += 60*60*24-1;
                    }
                    var value = {};
                    value[config.fieldStart] = valStart;
                    value[config.fieldEnd] = valEnd;
                    
                    var conValue = {
                        fieldStart : valStart,
                        fieldEnd : valEnd,
                    }
                    config.value = conValue;
                    var text = __this.inputText;
                    var vueConfig = __this;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                    _this.setRelComponentValue(__this, config)
                    if(text.length > 0){
                        __this.isHaveValue = true;
                    }else{
                        __this.isHaveValue = false;
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                },
                changeByRelField: function(obj){
                    // console.log(obj);
                    var value = this.getValue(false);
                    var relConfig = obj.config;
                    if(Number(value[relConfig.id]) !== Number(obj.value)){
                        var dataStr = moment().format('YYYY-MM-DD');
                        if(relConfig.id == config.fieldStart){
                            dataStr += ' 00:00:00';
                        }
                        if(relConfig.id == config.fieldEnd){
                            dataStr += ' 23:59:59';
                        }
                        value[relConfig.id] = isNaN(obj.value) || obj.value == "" ? Number(moment(dataStr).format('x')) : Number(obj.value);
                        this.setValue(value);
                    }
                },
            },
            mounted: function(){
                this.dateDefind();
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            }
        }
        return component;
    },
}
// 下拉树组件 z-tree.js treeSelect
NetstarComponent.treeSelect = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
            button:'<button class="pt-btn pt-btn-default" ref="treeBtn">'
                        + '<i class="fa fa-caret-down"></i>'
                    + '</button>',
            clear:'<button class="pt-btn pt-btn-default pt-btn-icon pt-input-clear" :class={hide:isHide} @click="btnClickClose">'
                        + '<i class="icon-close"></i>'
                    + '</button>',
        },
        MOBILE:{},
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 显示类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
            async :             false,          // 是否同步 默认false
            textField  :        'text',
            valueField :        'value',
            fullnameField :     '',             // 
            level :             0,              // 打开层级 默认全部关闭
            outputFields :         '',          // 输出的其它字段 '{"id":"code"}'
            isMultiple :        false,          // 是否多选
            isCheckParent :     false,
            children :          'children',     // 树数据子级名
            parentId :          'parentId',     // 树数据pId
            isTurnTree :        false,
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        if(typeof(config.ajaxConfig)!='object'&&typeof(config.url)=='string'){
            config.ajaxConfig = {};
            config.ajaxConfig.url = config.url;
            config.ajaxConfig.type = typeof(config.method)=='string'?config.method:'GET';
            config.ajaxConfig.data = typeof(config.data)!='undefined'?config.data:{};
            config.ajaxConfig.dataSrc = typeof(config.dataSrc)!='undefined'?config.dataSrc:'';
            config.ajaxConfig.contentType = typeof(config.contentType)=='string' && config.contentType.length>0 ? config.contentType:'application/json'; // application/x-www-form-urlencoded
        }
        // 格式化outputFields
        config.outputFields = this.getFormatOutputFields(config);
        // 格式化value
        var value = config.value;
        config.value = {};
        for(var key in config.outputFields){
            config.value[key]= '';
        }
        config.value[config.id] = value;
    },
    // 获取格式化后的outputFields
    getFormatOutputFields : function(config){
        // var souOutputFields = config.outputFields;
        // if(typeof(souOutputFields) == "string" && souOutputFields.length > 0){
        //     souOutputFields = JSON.parse(souOutputFields);
        // }
        // souOutputFields = typeof(souOutputFields) == "object" ? souOutputFields : {};
        // var outputFields = {};
        // var rex = /\{(.*?)\}/; // 验证data值是否是‘{***}’样式
        // for(var key in souOutputFields){
        //     var fieldName = souOutputFields[key];
        //     var isRex = rex.test(fieldName);
        //     if(isRex){
        //         fieldName = fieldName.match(rex)[1];
        //         outputFields[key] = fieldName;
        //     }
        // }
        // outputFields[config.id] = config.valueField;
        var outputFields = NetstarComponent.commonFunc.getFormatOutputFields(config.outputFields);
        outputFields[config.id] = config.valueField;
        return outputFields;
    },
    // 验证配置是否正确
    validatConfig: function(config){
        var isValid = true;
        return isValid;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                var $button = $(tempalte.button);
                var clearHtml = tempalte.clear;
                // 为每一部分添加事件属性
                // 为input和button添加事件
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keyup.13', 'inputEnter');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                // $input.attr('v-on:change', 'change');
                var inputHtml = $input.prop('outerHTML');   // input模板
                $button.attr('v-on:mousedown', 'mousedown');
                $button.attr('v-on:mouseup', 'mouseup');
                $button.attr('v-on:click', 'showTree');

                var buttonHtml = $button.prop('outerHTML');
                buttonHtml = clearHtml + buttonHtml;
                var btncontainer = NetstarComponent.common.btncontainer;
                btncontainer = btncontainer.replace('{{nscontainer}}', buttonHtml);

                contentHtml = inputHtml + btncontainer;   // input+button整体模板
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        data.isHide = true;
        data.isBlur = true;
        if(!$.isArray(config.subdata)){
            data.ajaxLoading = true;
        }
        return data;
    },
    inputEnter: function(config, vueComponent){
        NetstarComponent.setNextComponentFocus(config, vueComponent);
    },
    // 验证value
    validatValue: function(value, rules, returnType, config){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                var _isTrue = false;
                for(var key in value){
                    if(value[key]!=null && value[key]!=''){
                        _isTrue = true;
                        continue;
                    }
                }
                if(!_isTrue){
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                isTrue = _isTrue;
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    tree : {
        treeConfigs : {},
        // list转tree
        convertToTree : function(list, idField, parentField, childField, sortField){
            var idMap = {};
            for(var i = 0; i < list.length; i++){
                idMap[list[i][idField]] = list[i];
            }
            var result = [];
            for(var i = 0; i < list.length; i++){
                var row = list[i];	
                if(row[parentField] && idMap[row[parentField]]){
                    var parent = idMap[row[parentField]];
                    if(!$.isArray(parent[childField])){
                        parent[childField] = [];
                    }
                    parent.isParent = true;
                    parent[childField].push(row);
                }else{
                    result.push(row);
                }
            }
            return result;
        },
        // 获取选中节点
        getCheckNodesObjByValue : function(config, value){
            // 保存value值
            value = typeof(value) == 'string' ? value : '';
            // 显示text值
            var name = [];
            // 选中节点值
            var checkNodes = [];
            // 输出字段
            var outputFields = config.outputFields;
            // 保存valueObject值 根据outputFields获取的值
            var outputFieldsValue = {};
            for(var outField in outputFields){
                outputFieldsValue[outField] = [];
            }
            // 是否存在选中值
            var isHaveChecked = true;
            // 树名
            var fullID = config.fullID;
            // 树配置
            var treeConfig = this.treeConfigs[fullID];
            // 树节点
            var zNodes = treeConfig.zNodes;
            // 树的子级 名称默认children
            var treeChildrenField = config.children;
            // value字段名
            var valueField = config.valueField;
            // text字段名
            var textField = config.textField;
            // 完整字段名 fullnameField优先级高于textField
            var fullnameField = config.fullnameField;
            var valArr = value.split(',');
            // 查询所有节点获取选中
            function queryAllNode(nodes){
                for(var nodeI=0; nodeI<nodes.length; nodeI++){
                    var node = nodes[nodeI];
                    // 是否有子级
                    var isHaveChild = $.isArray(node[treeChildrenField]);
                    // 判断是否选中
                    var isChecked = false;
                    for(var valI=0; valI<valArr.length; valI++){
                        if(node[valueField] == valArr[valI]){
                            isChecked = true;
                        }
                    }
                    if(isChecked){
                        // 添加name
                        if(fullnameField && node[fullnameField]){
                            name.push(node[fullnameField]);
                        }else{
                            name.push(node[textField]);
                        }
                        // 添加checkNodes
                        checkNodes.push(node);
                        for(var outField in outputFields){
                            var outFieldVal = outputFields[outField];
                            var valStr = typeof(node[outFieldVal]) == "undefined" ? '' : node[outFieldVal];
                            outputFieldsValue[outField].push(valStr);
                        }
                    }
                    if(isHaveChild){
                        // 存在子元素继续查找
                        queryAllNode(node[treeChildrenField]);
                    }
                }
            }
            queryAllNode(zNodes);
            // 格式化outputFieldsValue
            for(var outField in outputFields){
                outputFieldsValue[outField] = outputFieldsValue[outField].toString();;
            }
            name = name.toString();
            if(value.length === 0){
                isHaveChecked = false;
            }
            return {
                name : name,
                value : value,
                nodes : checkNodes,
                isHaveChecked : isHaveChecked,
                outputFieldsValue : outputFieldsValue,
            }
        },
        // 获取选中节点
        getCheckNodesObjByNodes : function(config, checkNodes){
            // 选中节点值
            checkNodes = $.isArray(checkNodes) ? checkNodes : [];
            // 保存value值
            var value = [];
            // 显示text值
            var name = [];
            // 输出字段
            var outputFields = config.outputFields;
            // 保存valueObject值 根据outputFields获取的值
            var outputFieldsValue = {};
            for(var outField in outputFields){
                outputFieldsValue[outField] = [];
            }
            // 是否存在选中值
            var isHaveChecked = true;
            // value字段名
            var valueField = config.valueField;
            // text字段名
            var textField = config.textField;
            // 完整字段名 fullnameField优先级高于textField
            var fullnameField = config.fullnameField;
            for(var i=0; i<checkNodes.length; i++){
                var node = checkNodes[i];
                if(fullnameField && node[fullnameField]){
                    //是否有全称字段
                    name.push(node[fullnameField]);
                }else{
                    name.push(node[textField]);
                }
                value.push(node[valueField]);
                for(var outField in outputFields){
                    var outFieldVal = outputFields[outField];
                    var valStr = typeof(node[outFieldVal]) == "undefined" ? '' : node[outFieldVal];
                    outputFieldsValue[outField].push(valStr);
                }
            }
            // 格式化outputFieldsValue
            for(var outField in outputFields){
                outputFieldsValue[outField] = outputFieldsValue[outField].toString();;
            }
            name = name.toString();
            value = value.toString();
            if(value.length === 0){
                isHaveChecked = false;
            }
            return {
                name : name,
                value : value,
                nodes : checkNodes,
                isHaveChecked : isHaveChecked,
                outputFieldsValue : outputFieldsValue,
            }
        },
        // 格式化数据
        getFormatData : function(config, zNodes, checkNodes){
            zNodes =  $.isArray(zNodes) ? zNodes : [];
            checkNodes =  typeof(checkNodes) == 'string' ? checkNodes.split(',') : [];
            // 展开层数 默认不展开层
            var levelNumber = typeof(config.level)=='number' ? config.level : 0;
	        if(levelNumber < 1){
                levelNumber = 0;
            }
            // 当前层级
            var level = 0;
            // 树的子级 名称默认children
            var treeChildrenField = config.children;
            // 选中name

            function resetData(resceiveData, level){
                var isExpand = false; // 是否展开
                if(level < levelNumber){
                    isExpand = true;
                }
                for(var i = 0; i < resceiveData.length; i ++){
                    // 是否有子级
                    var isHaveChild = $.isArray(resceiveData[i][treeChildrenField]);
                    // 是否展开
                    resceiveData[i].open = isExpand;
                    // 是否有子级
                    resceiveData[i].isParent = isHaveChild;
                    // 显示字段
                    resceiveData[i].name = resceiveData[i][config.textField];
                    // 获取字段
                    resceiveData[i].id = resceiveData[i][config.valueField];
                    // parent字段
                    resceiveData[i].pId = resceiveData[i][config.parentId];

                    // 判断是否选中
                    var isChecked = false;
                    for(var nodeI=0; nodeI<checkNodes.length; nodeI++){
                        if(resceiveData[i][config.valueField] == checkNodes[nodeI]){
                            isChecked = true;
                        }
                    }
                    if(isChecked){
                        resceiveData[i].checked = true;
                        resceiveData[i].halfCheck = true;
                    }else{
                        resceiveData[i].checked = false;
                        resceiveData[i].halfCheck = false;
                    }
                    // 如果有子级 设置子级
                    if(isHaveChild){
                        resetData(resceiveData[i][treeChildrenField], ++level);
                    }
                }
            }
            resetData(zNodes, level);
            return zNodes;
        },
        // 通过ajax获取subdata
        getSubdataByAjax : function(config, callBackFunc){
            var components = NetstarComponent.config[config.formID].config;
            var data = NetstarComponent.commonFunc.getFormDataByComponent(config, components, 'ajaxConfig');
            var ajaxConfig = {
                url:        config.ajaxConfig.url,	
                data:       data,
                type:       config.ajaxConfig.type,
                contentType:config.ajaxConfig.contentType,
                dataType:   "json",
                plusData:   {
                    componentId : config.id,
                    formID : config.formID,
                    callBackFunc : callBackFunc,
                },
            }
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                if(res.success){
                    var plusData = _ajaxConfig.plusData;
                    var componentId = plusData.componentId;
                    var formID = plusData.formID;
                    var component = NetstarComponent.config[formID].config[componentId];
                    var vueComponent = NetstarComponent.config[formID].vueConfig[componentId];
                    vueComponent.ajaxLoading = false;
                    if(typeof(plusData.callBackFunc) == "function"){
                        plusData.callBackFunc(component, res[component.dataSrc]);
                    }
                }else{
                    // 获取树失败
                }
            });
        },
        // 刷新树数据
        refreshTreeData : function(config, zNodes){
            var zNodes = NetstarComponent.treeSelect.tree.getFormatData(config, zNodes, config.value[config.id]);
            treeConfig = this.treeConfigs[config.fullID];
            treeConfig.zNodes = zNodes;
        },
        // 初始化树数据
        initTreeData : function(config, callBackFunc){
            var _this = this;
            if($.isArray(config.subdata)){
                var subdata = config.subdata;
                if(config.isTurnTree){
                    subdata = _this.convertToTree(subdata, config.valueField, config.parentId, config.children);
                }
                _this.refreshTreeData(config, subdata);
                if(typeof(callBackFunc) == "function"){
                    callBackFunc(config);
                }
            }else{
                _this.getSubdataByAjax(config, function(_config, zNodes){
                    if(_config.isTurnTree){
                        zNodes = _this.convertToTree(zNodes, _config.valueField, _config.parentId, _config.children);
                    }
                    _this.refreshTreeData(_config, zNodes);
                    if(typeof(callBackFunc) == "function"){
                        callBackFunc(config);
                    }
                });
            }
        },
        // 获取setting ztree的配置参数
        getSetting : function(config){
            var _this = this;
            var setting = {
                data: {
                    simpleData: {
                        enable: true
                    },
                    key:{
                        url:'urlNullAndEmpty'  //防止url命名冲突 urlNullAndEmpty是不存在的返回值，所以很长
                    }
                },
                view: {
                    expandSpeed: ""
                },
                callback: {
                    onClick: _this.clickNode,
                    onCheck: _this.clickNode,
                    onMouseDown: _this.mouseDownNode,
                    onMouseUp: _this.mouseUpNode,
                }
            }
            if(config.async){
                setting.async = {
                    enable: true,
                    url: config.url,
                    type:"GET",
                }
            }

            if(config.isMultiple){
                //开启多选
                /**
                 * Y 属性定义 checkbox 被勾选后的情况； 
                 * N 属性定义 checkbox 取消勾选后的情况； 
                 * p 表示操作会影响父级节点； 
                 * s 表示操作会影响子级节点  默认值：{ "Y": "ps", "N": "ps" }
                 */
                if(config.isCheckParent){
                    //勾选父节点
                    setting.check = {
                        enable: true,
                        chkStyle:"checkbox",
                    }
                }else{
                    setting.check = {
                        enable: true,
                        chkStyle:"checkbox", 
                        chkboxType: { "Y": "s", "N": "s" },//只影响父级节点；取消勾选操作，只影响子级节点
                    }
                }
            }else{
                //开启单选
                setting.check = {
                    enable: true,
                    // enable: false,
                    chkStyle: "radio",
                    radioType: "all"
                }
            }
            return setting;
        },
        getVueConfigByTreeId : function(treeId){
            // 树名
            var fullID = treeId.substring(0, treeId.lastIndexOf('-'));
            // 树配置
            var treeConfig = NetstarComponent.treeSelect.tree.treeConfigs[fullID];
            // 组件配置
            var config = treeConfig.config;
            // vueConfig
            var formID = config.formID;
            var componentId = config.id;
            var vueConfig = NetstarComponent.config[formID].vueConfig[componentId];
            return vueConfig;
        },
        mouseDownNode : function(event, treeId){
            var vueConfig = NetstarComponent.treeSelect.tree.getVueConfigByTreeId(treeId);
            vueConfig.isBlur = false;
        },
        mouseUpNode : function(event, treeId){
            var vueConfig = NetstarComponent.treeSelect.tree.getVueConfigByTreeId(treeId);
            vueConfig.isBlur = true;
        },
        clickNode : function(event, treeId, treeNode){
            // 点击类型
            var clickType = event.type;
            // 树名
            var fullID = treeId.substring(0, treeId.lastIndexOf('-'));
            // 树配置
            var treeConfig = NetstarComponent.treeSelect.tree.treeConfigs[fullID];
            // 组件配置
            var config = treeConfig.config;
            // input
            var $input = config.$input;
            // 树的子级 名称默认children
            var treeChildrenField = config.children;
            // 树对象
            var zTree = $.fn.zTree.getZTreeObj(treeId);
            // 选中取消勾选状态
            function setIsCheckNode(checkNodes, isChecked){
                for(var i=0; i<checkNodes.length; i++){
                    var checkNode = checkNodes[i];
                    // 更新点击节点
                    checkNode.checked = isChecked;
                    zTree.updateNode(checkNode);
                    if($.isArray(checkNode[treeChildrenField]) && config.isMultiple){
                        setIsCheckNode(checkNode[treeChildrenField], isChecked);
                    }
                }
            }
            switch(clickType){
                case 'ztree_check':
                    // 点击选中框
                    break;
                case 'click':
                    // 点击文字
                    // 选中取消勾选状态
                    setIsCheckNode([treeNode], !treeNode.checked);       
                    break;
            }
            // 选中节点
            var nodes = zTree.getCheckedNodes(true);

            // 选中信息
            var checkObj = NetstarComponent.treeSelect.tree.getCheckNodesObjByNodes(config, nodes);

            // 显示name
            var name = checkObj.name;
            // value
            var value = checkObj.value;
            var outputFieldsValue = checkObj.outputFieldsValue;
            if(value !== config.value[config.id]){
                // config.value = outputFieldsValue;
                config.cheakNodes = nodes;
                var formID = config.formID;
                var componentId = config.id;
                var vueConfig = NetstarComponent.config[formID].vueConfig[componentId];
                vueConfig.inputText = name;
                vueConfig.setConfigValue(outputFieldsValue);
            }
            if(treeNode.checked && config.isMultiple == false){
                NetstarComponent.treeSelect.tree.hideTree(config);
            }
        },
        // 显示树时 设置事件
        setEvent : function(config){
            var _this = this;
            var fullID = config.fullID;
            var treeConfig = _this.treeConfigs[fullID];
            var $input = treeConfig.$input;
            var $tree = treeConfig.$tree;
            function onBodyDown(ev){
                var dragel = $tree[0];
                var treeId = $tree.attr('id');
                var inputDom = $input[0];
                var target = ev.target;
                var $parent = $(target).parents('#' + treeId);
                if(dragel != target && !$.contains(dragel, target) && inputDom != target && $parent.length == 0){
                    _this.hideTree(config);
                    $(document).off("mousedown", onBodyDown);
                }
            }
            $(document).off("mousedown", onBodyDown);
            $(document).on("mousedown", onBodyDown);
        },
        // 隐藏树
        hideTree : function(config){
            var _this = this;
            var fullID = config.fullID;
            var treeConfig = _this.treeConfigs[fullID];
            var $tree = treeConfig.$tree;
            var $treeContainer = treeConfig.$treeContainer;
            $treeContainer.remove();
            $(document).off('scroll', _this.documentScroll);
        },
        // 设置树容器
        setTreeContainerDom : function(config){
            var fullID = config.fullID;
            var treeConfig = this.treeConfigs[fullID];
            // 树input
            var $input = treeConfig.$input;
            // 树id
            var treeId = treeConfig.treeId;
            // 追加容器 默认body 如果存在container默认位置是container
            var $treePosition = NetstarComponent.commonFunc.getContainer($input);
            // 添加自定义容器 树插入自定义容器
            if(config.$customContainer){
                // 自定义容器
                $treePosition = config.$customContainer;
            }
            // 如果这个树已经存在 删除 
            if(treeConfig.$treeContainer && treeConfig.$treeContainer.length > 0){
                treeConfig.$treeContainer.remove();
            }
            // 计算位置 的 相对容器
            var $relativeContainer = $input.parent();
            var styleStr = NetstarComponent.commonFunc.getPositionStyle($relativeContainer, true, 'z-index:9999;');
            // 容器的html
            var treeHtml = '<div class="treeform-ztree" ' + styleStr + '><ul id="' + treeId + '"></ul></div>';
            // 插入树容器
            $treePosition.append(treeHtml);
            // 树
            treeConfig.$tree = $('#' + treeId);
            // 树容器
            treeConfig.$treeContainer = treeConfig.$tree.parent();
        },
        documentScroll : function(ev){
            var config = ev.data.config;
            NetstarComponent.treeSelect.tree.hideTree(config);
        },
        // 显示树
        showTree : function(config){
            var componentFullId = config.fullID;
            var treeConfig = this.treeConfigs[componentFullId];
            // 刷新下拉树数据
            this.refreshTreeData(config, treeConfig.zNodes);
            // 设置树dom
            this.setTreeContainerDom(config);
            // 显示树
            $.fn.zTree.init(treeConfig.$tree, treeConfig.setting, treeConfig.zNodes);
            // 添加事件
            this.setEvent(config);
            $(document).on('scroll', {config : config}, this.documentScroll);
        },
        // 初始化树
        init : function(config, vueConfig){
            var _this = this;
            // if(config.readonly){
                //设置为只读不需要初始化tree
                // return false;
            // }
            var $input = config.$input;
            var $button = config.$button;
            //设置ztree的配置参数
            var setting = _this.getSetting(config);
            _this.treeConfigs[config.fullID] = {
                setting : setting,
                $input : $input,
                $button : $button,
                treeId : config.fullID + '-tree',
                config : config,
                zNodes : [],
            }
            NetstarComponent.treeSelect.tree.initTreeData(config, function(){
                if(config.value[config.id]){
                    var checkObj = NetstarComponent.treeSelect.tree.getCheckNodesObjByValue(config, config.value[config.id]);
                    config.value = checkObj.outputFieldsValue;
                    vueConfig.inputText = checkObj.name;
                    config.checkNodes = checkObj.nodes;
                }
            });
        },
    },
    // 设置其它的关联组件的value值
    setRelMapComponentValue : function(vueConfig, config){
        var value = vueConfig.getValue(false);
        var vueConfigs = NetstarComponent.config[config.formID].vueConfig;
        for(var key in value){
            if(typeof(vueConfigs[key])=="object" && key != config.id){
                vueConfigs[key].setValue(value[key]);
            }
        }
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch: {
                inputText:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                    this.isHide = !(value.length > 0);
                },
                ajaxLoading:function(value,oldValue){
                    if(value){
                        this.initTree();
                    }
                },
            },
            methods: {
                initTree : function(){
                    var __this = this;
                    var $input = $('#' + __this.id);
                    var $button = $(__this.$refs.treeBtn);
                    config.$input = $input;
                    config.$button = $button;
                    _this.tree.init(config, this);
                },
                mousedown : function(){
                    this.isBlur = false;
                },
                mouseup : function(){
                    this.isBlur = true;
                },
                // 点击清空
                btnClickClose: function(ev){
                    this.setValue('');
                },
                // 回车
                inputEnter:function(){
                    _this.inputEnter(config, this);
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules, 'object', config);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var value = config.value;
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var __this = this;
                    var checkObj = NetstarComponent.treeSelect.tree.getCheckNodesObjByValue(config, value);
                    var name = checkObj.name;
                    __this.inputText = name;
                    __this.setConfigValue(checkObj.outputFieldsValue);
                },
                // 设置value
                setConfigValue:function(value){
                    var __this = this;
                    var sourceValue = config.value;
                    config.value = value;
                    isChange = !(sourceValue[config.id] == value[config.id]);
                    if(isChange){
                        __this.change();
                        // 设置其它的关联组件的value值
                        _this.setRelMapComponentValue(__this, config);
                    }
                },
                // 显示true
                showTree : function(ev){
                    ev.preventDefault();
                    _this.tree.showTree(config);
                },
                // 设置焦点
                focusHandler: function(ev){
                    this.showTree(ev);
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    if(!this.isBlur){
                        return;
                    }
                    this.getValue(); // 显示验证信息
                    _this.tree.hideTree(config); // 隐藏树
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                },
                // 失去焦点
                blur: function(){
                    this.$refs.inputName.blur();
                },
                // 改变 change
                change: function(){
                    var vueConfig = this;
                    var text = this.inputText;
                    var value = config.value;
                    var valStr = value[config.id];
                    var obj = {
                        id:config.id,
                        text:text,
                        value:valStr,
                        config:config,
                        vueConfig:vueConfig,
                        outputFieldsValue:value,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                    if(typeof(config.relationField)=="string"){
                        NetstarComponent.commonFunc.refreshComponentByRelationField(config);
                    }
                },
                changeByRelField: function(obj){
                    // 不执行任何操作
                    // console.log(obj);
                    // var value = this.getConfigValue();
                    // var keyName = '';
                    // var subFields = config.subFields;
                    // var relConfig = obj.config;
                    // for(var key in subFields){
                    //     if(relConfig.id === subFields[key]){
                    //         keyName = key;
                    //         continue;
                    //     }
                    // }
                    // if(value[keyName] !== obj.value){
                    //     value[keyName] = obj.value;
                    //     this.setConfigValue(value);
                    // }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                },
            },
            mounted : function(){
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
                this.initTree();
            },
        }
        return component;
    },
}
// 多值输入组件 valuesInput m:0-12;s:0-59;YYYY/y:年;YY/MM:两位数字;h:0-24
NetstarComponent.valuesInput = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
			errorFormat:'errorFormat',
			errorFormatField:'errorFormatField',
		},
		zh:{
			errorFormat:'FORMAT参数错误',
			errorFormatField:'FORMAT中字段配置错误'
		}
    },
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" :id="id" />',
        },
        MOBILE:{},
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            label :                     '',                         // label
            templateName :              'PC',                       // 模板名字
            formSource:                 'form',                     // 表单类型 默认form staticData/table
            value :                     '',                         // value
            rules :                     '',                         // 规则
            disabled:                   false,                      // 是否只读
            format:                     nsVals.default.dateFormat,  // 输出格式
            hidden:                     false,                      // 是否隐藏
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 格式化config
    formatConfig: function(config){
        var outputFields = [];
        // 对配置字符串进行处理
		if(typeof(config.format)!='string'){
			// format参数错误			
			if(debugerMode){
				var errorStr = config.label+'('+config.id +') 配置错误 多值输入组件必须配置format参数';
				console.error(errorStr);
				nsalert(errorStr, 'error');
				console.error(config);
			}
		}else{
			// 循环查找{fieldId:YY}
			var patt = new RegExp("\{(.*?)\}","g"); 	// 取出
			// var 
			while ((result = patt.exec(config.format)) != null)  {
				var configValueStr = result[1];  	// 示例："componentId:MM"
				var originalStr = result[0]; 		// 示例："{componentId:MM}"
				var configValueArr = configValueStr.split(':');
				// 匹配值出问题了，格式不是{a:b},一般而言是因为找不到':'
				if(configValueArr.length!=2){
					if(debugerMode){
						console.error('多值输入组件format参数配置错误:'+configValueStr+'，格式应该为{field:MM}类型');
						console.error(config.format);
						console.error(config);
					}
				}else{
					var maskFieldName = configValueArr[0]; 				// fieldName 例如：componentId
					var maskFormatStr = configValueArr[1];				// fieldMaskField  例如：MM
					
					//this指当前
					if(maskFieldName == 'this'){
						maskFieldName = config.id;
                    }
                    var obj = {
                        id : maskFieldName,
                        format : maskFormatStr,
                        souStr : originalStr,
                        souValStr : configValueStr,
                    }
                    outputFields.push(obj);
				}
            }
        
        }
        config.outputFields = outputFields;
    },
    // 设置config
    setConfig: function(config){
        var _this = this;
        if(config.readonly == true){
            config.disabled = true;
        }
        // format : '{this:YY}/{value2:MM}-{value3:YY}/{value4:MM}'
        // outputFields : []
        var components = NetstarComponent.config[config.formID].config;
        var outputFields = config.outputFields;          // 输出字段
        var outputMaskStr = config.format; 		// 格式化后的mask字符串 99/99-99/99
        var outputValueStr = config.format;  		// 输出值的字符串
        var valuesMask = config.format;  		// 输出值的字符串
        var value = {};
        var inputTextMask = config.format;
        
		// 获取输出的mask字符串
		function getMaskStr(_maskFormatStr){
			var maskStr = '';
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
        
        for(var i=0; i<outputFields.length; i++){
            var outputField = outputFields[i];
            var idStr = outputField.id;
            var formatStr = outputField.format;
            var souStr = outputField.souStr;
            var maskStr = getMaskStr(formatStr); // YY-->99
            var valueStrObj = _this.getValueStr(idStr, formatStr, config);
            var valueStr = valueStrObj.format;           // YY时  1-->01
            var souValueStr = valueStrObj.souce;
            outputValueStr = outputValueStr.replace(souStr, valueStr);
            outputMaskStr = outputMaskStr.replace(souStr, maskStr);
            inputTextMask = inputTextMask.replace(souStr, valueStrObj.default);
            outputField.value = souValueStr;
            outputField.defValue = valueStrObj.default;
            valuesMask = valuesMask.replace(souStr, function(){
                var _formatStr = formatStr.replace(/./g, '*');
                return _formatStr;
            });
        }
        for(var i=0; i<outputFields.length; i++){
            var outputField = outputFields[i];
            value[outputField.id] = outputField.value;
        }
        //如果全部值都是空的，就输出value为空
		var isAllEmpty = true;
        for(var i=0; i<outputFields.length; i++){
            var outputField = outputFields[i];
            if(outputField.value){
                isAllEmpty = false;
                break;
            }
        }
        // 设置位置以及长度
        var rex = new RegExp("[\*]+","g"); 	//根据*分隔符取出值
        var unitArr= [];
        while ((result = rex.exec(valuesMask)) != null){
            unitArr.push({
                index : result.index,
                length : result[0].length,
            });
        }
        for(var i=0; i<unitArr.length; i++){
            for(var key in unitArr[i]){
                outputFields[i][key] = unitArr[i][key];
            }
        }
        var outputFieldsObj = {}
        for(var i=0; i<outputFields.length; i++){
            outputFieldsObj[outputFields[i].id] = outputFields[i];
        }
        config.outputFieldsObj = outputFieldsObj;
        outputValueStr = isAllEmpty ? '' : outputValueStr;
        config.outputMask = outputMaskStr;
        config.outputValue = outputValueStr;
        config.valuesMask = valuesMask;
        config.value = value;
        // config.inputTextMask = valuesMask.replace(/\*/g, '_');
        config.inputTextMask = inputTextMask;
        // 判断输出是否有当前字段 若有则可以设置value 否则不可以设置value
        var isSaveCurrentId = false;
        for(var i=0; i<outputFields.length; i++){
            if(outputFields[i].id == config.id){
                isSaveCurrentId = true;
                break;
            }
        }
        config.isSaveCurrentId = isSaveCurrentId;
    },
    // 验证配置是否正确
    validatConfig: function(config){
        return true;
    },
    // 获取输出的value字符串
    getValueStr : function(_idStr, _formatStr, config){
        // _idStr:string 	示例：fieldName 例如：componentId
        // _formatStr:string	示例：fieldMaskField  例如：MM
        var components = NetstarComponent.config[config.formID].config;
        //获取字段对应值值
        var valueStr = '';
        var componentValue = '';
        var defStr = '';
        // 获取前缀字符串
		function getPrefixStr(_componentValue, _maskStr){
			/* prefixWord:string 	前缀字符，如'0'
			 * _componentValue:string 	当前值
			 * _maskStr:string 		格式化目标形式 如'MM','9999'等
			 */
			 var valueStr = '';
             var prefixStr = '';
             var _valueType = typeof(_componentValue);
			 //根据类型决定没值的时候显示什么
			 switch(_maskStr){
			 	case 'MM':
                    //两个数字的月份
                    defStr = '01';
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
                    defStr = '00';
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
                    defStr = '1970';
			 		if(_valueType == 'number' || _valueType == 'string'){
			 			//如果长度短了才补充
			 			valueStr = _componentValue.toString();
						if(valueStr.length < _maskStr.length){
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
			 		if(_valueType == 'number' || _valueType == 'string'){
			 			valueStr = _componentValue.toString();
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
							prefixStr += prefixStrUnit;
						}
						for(var psI = 0; psI<_maskStr.length; psI++){
							defStr += prefixStrUnit;
						}
					}
			 		break;
            }
			return prefixStr + valueStr;
		}
        if(typeof(components[_idStr])!='object'){
            //在表单配置中找不到该对象
            if(debugerMode){
                var errorStr = '多值输入组件format参数:{'+_idStr+'}错误，无法找到对应字段'+_idStr;
                nsalert(errorStr,'error');
                console.error(errorStr);
                console.error(config);
            }
            return false;
        }else{
            //找到并标识对应组件
            var relatedComponentConfig = components[_idStr];
            componentValue = relatedComponentConfig.value;
            valueStr = getPrefixStr(componentValue, _formatStr);
        }
        // return valueStr;
        return {
            souce : componentValue,
            format : valueStr,
            default : defStr,
        };
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                // 为每一部分添加事件属性
                // 为input和button添加事件
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keyup.13', 'inputEnter');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                // $input.attr('v-on:change', 'change');
                var inputHtml = $input.prop('outerHTML');   // input模板
                contentHtml = inputHtml;   // input+button整体模板
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        data.inputText = config.outputValue;
        return data;
    },
    inputEnter: function(config, vueComponent){
        NetstarComponent.setNextComponentFocus(config, vueComponent);
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                var _isTrue = false;
                for(var key in value){
                    if(value[key] != null || value[key] !== ''){
                        _isTrue = true;
                    }
                }
                if(!_isTrue){
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                isTrue = _isTrue;
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 设置其它的关联组件的value值
    setRelComponentValue : function(vueConfig, config){
        var value = vueConfig.getValue(false);
        var vueConfigs = NetstarComponent.config[config.formID].vueConfig;
        for(var key in value){
            if(typeof(vueConfigs[key])=="object"){
                vueConfigs[key].setValue(value[key]);
            }
        }
    },
    // 通过显示值获取格式化后的输出值
    getOutputValueByInputText : function(config, inputText){
        var outputFields = config.outputFields;
        var valuesMask = config.valuesMask;
        var value = {};
        //没有输入的情况下
		if(inputText == ''){
			for(var i = 0; i<outputFields.length; i++){
				value[outputFields[i].id] = '';
			}
		}else{
		//有输入值的情况下
			//保存到value中
			for(var i = 0; i<outputFields.length; i++){
				var outputField = outputFields[i];
                var index = outputField.index;
                var length = outputField.length;
                var componentValue = inputText.substr(index, length);
                var rex = /\_/g;
				if(rex.test(componentValue)){
					componentValue = componentValue.replace(rex, '');
				}
				value[outputField.id] = componentValue;
			}
        }
        return value;
    },
    // 通过输出的value值获取显示值 inputText
    getInputTextByValue : function(config, vueConfig, componentId, valStr, value){
        var _this = this;
        var outputFieldsObj = config.outputFieldsObj;
        var outputField = outputFieldsObj[componentId]; 
        if(!outputField){
            return vueConfig.inputText;
        }
        if(!valStr){
            // return vueConfig.inputText;
            if(vueConfig.inputText === ''){
                return vueConfig.inputText;
            }
            valStr = outputField.defValue;
        }
        valStr = valStr.toString();
        valStr = valStr.length > outputField.defValue.length ? valStr.substring(0, outputField.defValue.length) : valStr;
        // 输出字段
        var inputText = vueConfig.inputText ? vueConfig.inputText : config.inputTextMask;
        var starStr = inputText.substr(0, outputField.index);
        var endStr = inputText.substr(outputField.index + outputField.length);
        inputText = starStr + valStr + endStr;
        return inputText;
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch: {
                inputText:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                },
            },
            methods: {
                setInputMark : function(){
                    var __this = this;
                    var inputNameId = __this.id;
                    var $input = $('#'+inputNameId);
                    var formatStr = config.outputMask;
                    $input.inputmask(formatStr);
                },
                // 回车
                inputEnter: function(ev){
                    _this.inputEnter(config, this);
                },
                // 验证value
                validatValue: function(value){
                    value = value==null?"":value;
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    var __this = this;
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var inputText = __this.inputText;
                    var value = _this.getOutputValueByInputText(config, inputText);
                    if(isValid){
                        var isTrue = __this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置value 这个方法对外没有用
                setValue:function(value){
                    if(!config.isSaveCurrentId){
                        // 不保存当前id不可以设置值
                        return ;
                    }
                    var __this = this;
                    var sourceValue = config.value;
                    if(value != sourceValue[config.id]){
                        __this.setInputText(value, config.id);
                    }
                },
                // 设置显示值 inputText
                setInputText: function(str, fieldId){
                    var __this = this;
                    __this.inputText = _this.getInputTextByValue(config, __this, fieldId, str);
                    __this.change();
                },
                // 设置焦点
                focusHandler: function(ev){
                },
                // 销毁输入格式
                destroyMark : function(){
                    var inputNameId = this.id;
                    var $input = $('#'+inputNameId);
                    $input.inputmask('remove');
                    $input.val(this.inputText);
                },
                // 获得焦点
                focus: function(){
                    var id = this.id;
                    var $input = $('#' + id);
                    $input.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    var __this = this;
                    // 失去焦点时执行change事件
                    var inputNameId = __this.id;
                    var $input = $('#'+inputNameId);
                    var valStr = $input.val();
                    if(valStr != __this.inputText){
                        __this.inputText = valStr;
                        __this.change();
                    }
                    // 验证
                    this.getValue();
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                },
                // 失去焦点
                blur: function(){
                    var nsName = this.id;
                    var $input = $('input[ns-name="'+nsName+'"]');
                    $input.blur();
                },
                // 改变 change
                change: function(){
                    var __this = this;
                    var text = __this.inputText;
                    var value = _this.getOutputValueByInputText(config, text);
                    var vueConfig = __this;
                    config.value = value;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                    _this.setRelComponentValue(__this, config)
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                },
                changeByRelField: function(obj){
                    // console.log(obj);
                    var value = config.value;
                    var relConfig = obj.config;
                    if(value[relConfig.id] !== obj.value){
                        this.setInputText(obj.value, relConfig.id);
                    }
                },
            },
            mounted: function(){
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
                this.setInputMark();
            }
        }
        return component;
    },
}
//sjj 20190521 自定义select组件 
NetstarComponent.select = {
    /**
        * 两种读取模式 subdata ajax ok
        * 设置整体只读 readonly ok
        * 容器高度 height ok
        * 面板的宽度和高度 支持左对齐or右对齐 ok
        * 支持多字段拼接展示的格式化ok
        * 目前有三种展现形式blocktable和vo以及table ok
        * 赋值 获取值ok
        * 支持搜索 本地检索or发送ajax请求检索 isServerMode （已完成本地检索事件，未完成服务端检索）
        * 获取值模式 isObjectValue ok
        * 设置面板中下拉项禁用 disabled 并且已经禁用的选项不允许再添加选中 ok
        * 快捷键支持上下选回车确认OK
        * 当选择完毕之后应该执行下一个可操作的组件获取焦点 OK
        * 完成之后的回调关联操作 ok
        * 删除选中值 ok
        * 是否多选 以及多选情况下允许最多选择几项
     */
    VERSION: '0.1.0', //版本号
    //自定义配置
    I18N: {
		en:{
            selectedFlag:'isSelected',//选中标记
            attrFieldArr:['isHover'],
        },
		zh:{}
    },
    //模板输出
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" v-model="inputText" ref="inputName" :disabled="disabled" :id="id" :ns-id="componentId" />',
            loading: '<div class="loading">正在加载</div>', 
            button: '<button class="pt-btn pt-btn-default pt-btn-icon" :disabled="disabled" :ns-name="id" :showpanel="isShowPanel">'
                        +'<i class="icon-arrow-down-o"></i>'
                    +'</button>',
            single: '<button v-if="multi === false" class="pt-btn pt-btn-default pt-btn-icon clear" :disabled="disabled" :class={hide:!isShowCloseBtn} @click="clearBtn" @mousedown="clearMousedown" @mouseup="clearMouseup">'
                        +'<i class="icon-close"></i>'
                    + '</button>',
            multi:'<div class="mutli-select-text-input" v-if="multi===true" :ns-input="id">'
                        +'<template v-for="value in valueArray">'
                            +'<span class="select-options-text">'
                                +'{{nsList}}'
                               // +'{{value.name}}'
                               // +'<a class="close" href="javascript:void(0);" @click="closeClickByMulti"></a>'
                            +'</span>'
                        +'</template>'
                    +'</div>',
        },
        MOBILE:{
        },
    },
    //设置默认值
    setDefault:function(config){
        var defaultConfig = {
            // inputWidth :        100,         // 输入框宽度
            //inputHeight:      100,            //输入框高度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            formSource:         'form',         // 表单 staticData/table
            textField :         'text',         // 显示字段
            idField :           'value',           // id字段
            valueField:         'value',
            value :             '',             // value
            selectMode:         'single',       // 单选 多选 single multi
            disabled:           false,          // 是否禁用
            //readonly:           false,          // 是否只读
            rules :             '',             // 规则
            hidden:             false,          // 是否隐藏
            isSearch:           false,          //是否允许检索
            panelConfig:        {
                'text-align':'left'
            },             //面板配置
            ajaxConfig:{},//ajax配置
            subdata:[],
            isServerMode:false,//默认本地检索
            listArray:[],//列表数据
            filterListArray:[],//检索结果数据
            panelStyle:{},//面板样式
            isObjectValue:false,//默认返回值是否是list
            isPreloadData:true,
            //subdata //ajaxConfig 
            //如果不是个表达式，则视为textField 例如：shopName  => <li>{{shopName}}</li>
            //如果是个表达式, 则解析 例如 <li><span class="title">{{shopName}}</span><span class="note">{{shopClass}} 电话：{{shopTel}}</span></li>
            //该表达式解析为 => <li><span class="title">济宁林场贸易公司</span><span class="note">VIP客户 电话：0388-98554412</span></li>
            listExpression:     '',             // 显示表达式
            isAjax:true,                       //默认调用ajax获取数据
		};
        nsVals.setDefaultValues(config, defaultConfig);
        config.panelConfig.containerId = 'panel-'+config.fullID;
        // 设置listExpression（表达式的默认值）
        if(config.listExpression === ''){
            config.listExpression = '<li>{{' + config.textField + '}}</li>';
        }
        //是否显示是静态数据
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
        //设置禁用 支持配置readonly和disabled
        if(config.readonly === true){
            config.disabled = config.readonly;
        }
        config.multi = false;
        if(config.selectMode == 'multi'){
            config.multi = true;
        }
        if(config.selectMode == 'checkbox'){
            config.multi = true;
            config.selectMode = 'multi';
        }
        //如果ajaxConfig为空对象则当前下拉框是本地读取数据 读取是否定义了默认选中值
        if($.isEmptyObject(config.ajaxConfig)){
            if(config.url){
                config.ajaxConfig.url = config.url;
                config.ajaxConfig.type = typeof(config.method)=='string'?config.method:'GET';
                config.ajaxConfig.data = typeof(config.data)!='undefined'?config.data:{};
                config.ajaxConfig.dataSrc = typeof(config.dataSrc)!='undefined'?config.dataSrc:'';
                config.ajaxConfig.contentType = typeof(config.contentType)!='undefined'?config.contentType:'';
            }else{
                // 获取value 通过subdata
                var parameter = {
                    value:          config.value,
                    valueField:     config.valueField,
                    subdata:        config.subdata,
                    isObjectValue:  config.isObjectValue,
                    type:           config.type,
                    multiple:       config.multi,
                }
                config.value = NetstarComponent.getValueBySubdata(parameter);
                config.isAjax = false;//subdata定义好的无需调用ajax获取
                config.listArray = $.extend(true,[],config.subdata);
                config.filterListArray = $.extend(true,[],config.subdata);
            }
        }else{
            //如果是ajax请求模式并且开启了支持服务端检索
            if(typeof(config.ajaxConfig.isServerMode)=='boolean'){
                if(config.ajaxConfig.isServerMode){
                    config.isServerMode = true;
                }
            }
        }
        for(var attr in config.panelConfig){
            var unitStr = '';
            switch(attr){
                case 'width':
                case 'height':
                    unitStr = 'px';
                    break;
            }
            config.panelStyle[attr] = config.panelConfig[attr];
            if(unitStr){
                config.panelStyle[attr] += unitStr;
            }
        }
        // 格式化outputFields
        if(typeof(config.outputFields) == "string" && config.outputFields.length > 0){
            config.outputFields = JSON.parse(config.outputFields);
        }
    },
    //验证配置属性值
    validatConfig:function(config){
        return true;
    },
    //获取容器
    getHtml:function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                var $button = $(tempalte.button);
                // 为每一部分添加事件属性
                // 为input添加事件
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keyup', 'inputKeyUp');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                //$input.attr('v-on:change', 'change');
                $button.attr('v-on:click', 'buttonClick');   // 按钮点击事件
                $button.attr('v-on:mousedown', 'mousedown');
                $button.attr('v-on:mouseup', 'mouseup');
                var inputHtml = $input.prop('outerHTML');   // input模板
                var buttonHtml = tempalte.single+$button.prop('outerHTML'); // button模板
                var btncontainer = NetstarComponent.common.btncontainer;
                btncontainer = btncontainer.replace('{{nscontainer}}', buttonHtml);
                var multiName = 'value';
                var formatMutliHtml = '{{'+multiName+'.'+config.textField+'}}'
                                        +'<a :ns-id="'+multiName+'.'+config.valueField+'" class="close" href="javascript:void(0);" @click="closeClickByMulti"></a>';
                var multiHtml = tempalte.multi.replace('{{nsList}}',formatMutliHtml);
                contentHtml = inputHtml+multiHtml+btncontainer;   // 整体模板
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    //获取配置属性值
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        var defaultVueData = {
            isShowPanel:false,//默认不显示面板
            isAjax:config.isAjax,//是否调用了ajax
            isSearch:config.isSearch,//是否开启了检索
            isServerMode:config.isServerMode,//是否服务端检索
            formID:config.formID,//表单id
            componentId:config.id,//组件id
            multi:config.multi,//是否多选
            isShowCloseBtn:false,//是否显示删除按钮
            valueArray:[],//当前选中值
            idField:config.valueField,//主键id
            textField:config.textField,//显示文本
            currentSelectedList:{},//当前面板选择的值
            ajaxLoading:false,
            isPreloadData:config.isPreloadData,//是否预加载
        };
        nsVals.extendJSON(data,defaultVueData);
        return data;
    },
    //面板组件相关调用方法
    panelComponentConfig:{
        template:'<div class="pt-dropdown" :name="id" :style="panelStyle">'
                        + '<input type="text" class="pt-form-control" ref="focusInput">'
                        + '<ul class="pt-dropdown-components" :select-type="type">'
                            + '<template v-for="(listData,index) in filterListArray">'
                                + '{{nsList}}'
                            + '</template>'
                        + '</ul>'
                    +'</div>',
        getData:function(config){
            var data = {
                id:config.fullID,//容器id
                filterListArray:config.filterListArray,//检索之后的数据
                listArray:config.listArray,//当前所有数据
                type:config.selectMode,//选中模式
                panelStyle:config.panelStyle,//面板样式
                panelId:config.panelConfig.containerId,//输出位置定位的容器
                componentId:config.id,//组件id
                formID:config.formID,//表单id 
                primaryId:config.valueField,
                listData:{},
                isDocumentEnter:false,//是否是document上绑定的回车触发
                isInputSearch:false,//是否是input触发的回车事件
            };
            //给过滤列表添加自定义属性
            //for(var filterI=0; filterI<data.filterListArray.length; filterI++){
                //data.filterListArray[filterI].isHover = false;
            //}
            for(var listI=0; listI<config.listArray.length; listI++){
                data.listData[config.listArray[listI][config.valueField]] = config.listArray[listI];
            }
            return data;
        },
        setHtml:function(config){
            var listExpression = config.listExpression;
            var listName = 'listData';
            var rex1 = /\{\{(.*?)\}\}/g;
            var rex2 = /\{\{(.*?)\}\}/;
            var listHtml = listExpression;
            if(rex2.test(listExpression)){
                var strArr = listExpression.match(rex1);
                for(var i=0; i<strArr.length; i++){
                    var conStr = '{{' + listName + '.' + strArr[i].match(rex2)[1] + '}}';
                    listHtml = listHtml.replace(strArr[i], conStr);
                }
            }
            var $str = $(listHtml);
            var attr = {
                'ns-name' : listName,
                ':ns-index' : 'index',
                'v-on:click' : 'clickSelect',
                ':ns-id': listName+'.'+config.valueField,
                ':class' : '{active:('+listName+'.isHover===true),selected:'+listName+'.isSelected===true}',
                ':disabled':listName+'.disabled'
            };
            $str.attr(attr);
            listHtml = $str.prop('outerHTML');
            
            listHtml = NetStarUtils.getFilterByExpressionHtml(listHtml);
            var html = this.template;
            html = html.replace('{{nsList}}', listHtml);
            config.$panel.html(html);
        },
        keyup:function(ev,_data){
            ev.preventDefault(); 
            //ev.stopImmediatePropagation();
            //console.log('documentkeyup')
            //面板组件按下快捷键事件
            var vueObj;
            if(_data){
                vueObj = _data.vueConfig;
            }else{
                vueObj = ev.data.vueConfig;
            }
            var $liList = $('div[name="'+vueObj.id+'"] ul');
            var componentVueConfig = NetstarComponent.config[vueObj.formID].vueConfig[vueObj.componentId];
            switch(ev.keyCode){
                case 38:
                    // 上
                    //$('#'+vueObj.id).blur();
                    //如果当前没有活动的 此时应该弹出提示 已经到顶部了
                    var selectItem = $liList.children('.active');
                    //console.log(selectItem)
                    if(selectItem.length==1){
                        var prevItem = false;
                        function getPrevItem(item){
                            if(item.prev().attr('disabled')){
                                if(item.prev().length!=0){
                                    getPrevItem(item.prev());
                                }
                            }else{
                                if(item.prev().attr('ns-name')=='listData'){
                                    prevItem = item.prev();
                                }else{
                                    if(item.prev().length!=0){
                                        getPrevItem(item.prev());
                                    }
                                }
                            }
                        }
                        getPrevItem(selectItem);
                        if(prevItem!=false){
                            prevItem.addClass('active');
                            selectItem.removeClass('active');
                        }else{
                          //  console.log('prev')
                        }
                    }
                    break;
                case 40:
                    // 下
                    //$('#'+vueObj.id).blur();
                    //如果当前没有活动的 有两种情况 一种是真的到底部了 一种是刚获取焦点展开下拉此时没有默认选中值
                    var selectItem = $liList.children('.active');
                    if(selectItem.length == 1){
                        function getNextItem(item){
                            if(item.next().attr('disabled')){
                                if(item.next().length!=0){
                                    //如果有下一个
                                    getNextItem(item.next());
                                }
                            }else{
                                if(item.next().attr('ns-name')=='listData'){
                                    nextItem = item.next();
                                }else{
                                    if(item.next().length!=0){
                                        //如果有下一个
                                        getNextItem(item.next());
                                    } 
                                }
                            }
                        }
                        if(selectItem.next().length == 0){
                            selectItem.removeClass('active');
                            nextItem = $liList.children().eq(0);
                            nextItem.addClass('active');
                        }else{
                            getNextItem(selectItem);
                            if(typeof(nextItem)=='undefined'){
                               
                            }else{
                                if(nextItem!=false){
                                    nextItem.addClass('active');
                                    selectItem.removeClass('active');
                                }else{
                                    //console.log('next')
                                }
                            }
                        }
                    }else{
                        nextItem = $liList.children().eq(0);
                        nextItem.addClass('active');
                    }
                    break;
                case 32:
                    // 空格
                   //多选情况下 空格表示
                    break;
                case 13:
                    // enter
                    //确认完成事件
                    //console.log('documentEnter')
                    //如果当前面板是关闭状态此时点击搜索是查询事件 不是完成事件

                    if($liList.children('.active').length == 1){
                        //有活动列表
                        var primaryId = $liList.children('.active').attr('ns-id');
                        vueObj.setValue(primaryId);
                    }
                    //if($("#"+vueObj.id).is(":focus")){
                       // console.log('inputenter')
                   // }else{
                       // console.log('documententer');
                       // var primaryId = $liList.children('.active').attr('ns-id');
                       // vueObj.setValue(primaryId);
                    //}
                    break;
            }
        },
        init:function(config,_vueConfig){
            var _this = this;
            _this.setHtml(config);
            config.panelVueObj = new Vue({
                el: '#' + config.panelConfig.containerId,
                data: _this.getData(config),
                filters:{
                    dictData:function(value,text,data){
                        if(nsVals.dictData[text].jsondata[value]){
                            value = nsVals.dictData[text].jsondata[value];
                        }
                        return value;
                    }
                },
                watch: {
                    filterListArray:{
                        deep:true,
                        handler:function(newValue,oldValue){
                            //console.log(newValue)
                            //console.log(oldValue)
                        }
                        //监听检索的列表数据
                    }
                },
                methods:{
                    validateExistByValue:function(validData,valueArray){
                        // 通过value值验证是否存在
                        var isExistIndex = -1;
                        var vueConfig = NetstarComponent.config[this.formID].vueConfig[this.componentId];
                        for(var valueI=0; valueI<valueArray.length; valueI++){
                            if(valueArray[valueI][vueConfig.idField] == validData[vueConfig.idField]){
                                isExistIndex = valueI;
                                break;
                            }
                        }
                        return isExistIndex;
                    },
                    //刷新选中值
                    refreshSelectedList:function(){
                        var vueConfig = NetstarComponent.config[this.formID].vueConfig[this.componentId];
                        var selectedFlag = NetstarComponent.select.I18N.en.selectedFlag;
                        var inputIdsArr = [];
                        if(vueConfig.inputIds){
                            inputIdsArr = vueConfig.inputIds.split(',');
                        }
                        var filterListArray = this.filterListArray;
                        var idField = vueConfig.idField;
                        for(var listI=0; listI<filterListArray.length; listI++){
                            filterListArray[listI][selectedFlag] = false;
                            if(inputIdsArr.indexOf(filterListArray[listI][idField])>-1){
                                filterListArray[listI][selectedFlag] = true;
                            }
                        }
                    },
                    setValue:function(_id){
                        // 判断当前是单选 则设置值之后关闭面板 
                        var data = this.listData[_id];
                        var vueConfig = NetstarComponent.config[this.formID].vueConfig[this.componentId];
                        //console.log(vueConfig.valueArray)
                        if(!$.isArray(vueConfig.valueArray)){
                            vueConfig.valueArray = [];
                        }
                        vueConfig.currentSelectedList = data;
                        switch(this.type){
                            case 'single':
                                vueConfig.valueArray = [data];
                                break;
                            case 'multi':
                                //判断当前值是否存在于数组当中
                               // vueConfig.isShowPanel = true;
                                var isAppendData = true;
                                if(vueConfig.valueArray.length > 0){
                                    var isExistIndex = this.validateExistByValue(data,vueConfig.valueArray);
                                    if(isExistIndex > -1){
                                        // 已经存在的数据
                                        isAppendData = false;
                                    }
                                }
                                if(isAppendData){
                                    vueConfig.valueArray.push(data);
                                }else{
                                    vueConfig.valueArray.splice(isExistIndex,1);
                                }
                                break;
                        }
                        vueConfig.setValueInput();
                    },
                    //单击事件
                    clickSelect:function(ev){
                        document.removeEventListener("click", this.isSearchDropDown);
                        //console.log('click');
                        var __this = this;
                        __this.$refs.focusInput.focus();
                        var $li = $(ev.currentTarget);
                        if($li.attr('disabled')){
                            //含有disabled属性
                        }else{
                            $li.toggleClass('selected');
                            var primaryId = $li.attr('ns-id');
                            this.setValue(primaryId);
                        }
                    },
                    refreshFilterList:function(){
                        //给过滤列表添加自定义属性
                        for(var filterI=0; filterI<this.filterListArray.length; filterI++){
                            this.filterListArray[filterI].isHover = false;
                        }
                    },
                    isSearchDropDown:function(ev){
                        //console.log('documentclick')
                        //当前点击范围 如果是在下拉选择区域 或者输入框所在范围区域
                        var $inputParent =  $('#'+this.id).closest('.pt-form-group');
                        var $container =  $('#panel-'+this.id);
                        var $targetInputParent =  $(ev.target).closest('.pt-form-group');
                        var $targetPanel =  $(ev.target).closest('#panel-'+this.id);
                        if(NetstarComponent.config[this.formID].config[this.componentId]){
                            if(NetstarComponent.config[this.formID].config[this.componentId].formSource == 'table'){
                                $inputParent =  $('#'+this.id).closest('.pt-input-group');
                                $targetInputParent =  $(ev.target).closest('.pt-input-group');
                            }
                        }

                        if(($targetInputParent.length>0&&$inputParent.is($targetInputParent))||($targetPanel.length>0&&$container.is($targetPanel))){
                           // console.log('notdocumentclick');
                        }else{
                           // console.log('yesdocumentclick');
                            if($('#'+this.id).is(':focus')){

                            }else{
                                //if(NetstarComponent.config[this.formID].config[this.componentId]){
                                   // NetstarComponent.config[this.formID].config[this.componentId].filterListArray = $.extend(true,[],NetstarComponent.config[this.formID].config[this.componentId].listArray);
                                   // this.refreshSelectedList();
                               // }
                                NetstarComponent.select.closePanel(NetstarComponent.config[this.formID].config[this.componentId],NetstarComponent.config[this.formID].vueConfig[this.componentId]);
                                document.removeEventListener("click", this.isSearchDropDown);
                            }
                        }
                    },
                },
                mounted:function(){
                   // console.log('panelInit')
                    var vueObj = this;
                    /********计算显示面板的位置 start********* */ 
                    var $panel = $('[name="'+vueObj.id+'"]');
                    var $input = $('#'+vueObj.id);
                    NetstarComponent.commonFunc.setContainerPosition($panel, $input);
                    /********计算显示面板的位置 end********* */ 
                    /****************整体键盘按下事件 start************************** */
                    /*document.removeEventListener('keyup',_this.keyup);
                    document.addEventListener('keyup',function(ev){
                        _this.keyup(ev,{vueConfig:vueObj});
                    });*/
                    $(document).off('keyup',_this.keyup);
                    $(document).on('keyup',{vueConfig:vueObj},_this.keyup);
                    /****************整体键盘按下事件 end **************************** */
                    //this.refreshFilterList();
                    //默认当前第一个处于活动
                    //if(this.filterListArray.length>0){
                        //this.filterListArray[0].isHover = true;
                    //}
                    //设置选中
                    this.refreshSelectedList();
                    document.removeEventListener("click", this.isSearchDropDown);   
                    document.addEventListener("click", this.isSearchDropDown);
                }
            });
        }
    },
    //显示面板
    showPanel:function(config,vueConfig){
        //console.log('showpanel')
        //给container容器追加显示面板 如果面板存在则先删除存在的面板重新追加
        var $container = nsPublic.getAppendContainer();//先读取到当前的container容器
        if($container.length>0 && config.formSource == 'table'){
            //$container = $('container:last');
            $container = $('#'+config.formID).closest('container');
            if($container.length == 0){
                $container = $('body');
            }
        }
        if($container.children('.pt-select-panel').length>0){
            $container.children('.pt-select-panel').remove();
        }
        config.panelConfig.containerId = 'panel-'+config.fullID;
        $container.append('<div class="pt-input-group pt-select-panel" id="'+config.panelConfig.containerId+'" componentId="'+config.id+'">');
        config.$panel = $('#'+config.panelConfig.containerId);//面板容器
        
        //如果没有定义容器的宽度，默认容器的宽度和当前触发的组件宽度一致
        if(typeof(config.panelConfig.width)!='number'){
            config.panelConfig.width = $('#'+config.fullID).closest('.pt-input-group').outerWidth();
            if(config.formSource == 'table'){
                //config.panelConfig.width = $('#'+config.fullID).outerWidth();
            }
            config.panelStyle.width = config.panelConfig.width+'px';
        }
        if(typeof(config.panelConfig.height)!='number'){
            if(config.filterListArray.length > 0){
                config.panelStyle.height = config.filterListArray.length * 30 + 'px';
                if($(window).innerHeight() - config.filterListArray.length * 30 < 100){
                    config.panelStyle.height = $(window).innerHeight() - $('#'+config.fullID).offset().top - $('#'+config.fullID).innerHeight() - 10 + 'px';
                }
            }else{
                config.panelStyle.height = 30 + 'px';
            }
            if($('#'+config.fullID).closest('.pt-modal-body').length>0){
                if($('#'+config.fullID).closest('.pt-modal-body').outerHeight()<config.filterListArray.length * 30){
                    config.panelStyle.height = $('#'+config.fullID).closest('.pt-modal-body').outerHeight() + 'px';
                }
            }
        }
        this.panelComponentConfig.init(config,vueConfig);//面板组件调用
    },
    //关闭面板
    closePanel:function(config,vueConfig){
        //console.log('closepanel')
        if(config){
            var $panel = $('#'+config.panelConfig.containerId);
            if($panel.length > 0){
                $panel.remove();
            }
            vueConfig.isShowPanel = false;
            $(document).off('keyup',this.panelComponentConfig.keyup);
        }
    },
    validatValue:function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                if(value === ''){
                    isTrue = false;
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                if($.isArray(value)){
                    if(value.length == 0){
                        isTrue = false;
                        validatInfo = NetstarComponent.validateMsg[rules];
                    }
                }
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    getSubdata:function(config){
        var subdata = config.subdata;
        var textField = config.textField;
        var valueField = config.valueField;
        var retSub = [];
        var isErrorInfoSub = false;
        var errorInfoArrSub = [];
        for(var i=0;i<subdata.length;i++){
            // valueField/textField不存在时表示当条数据配置错误不在下拉框中显示
            if(typeof(subdata[i][valueField])=='undefined'||typeof(subdata[i][textField])=='undefined'){
                isErrorInfoSub = true;
                errorInfoArrSub.push(i);
            }else{
                var subObj = {
                    id: subdata[i][valueField],
                    text: subdata[i][textField],
                }
                retSub.push(subObj);
            }
        }
        if(isErrorInfoSub){
            console.error('valueField/textField不存在时表示当条数据配置错误不在下拉框中显示');
            console.error(errorInfoArrSub);
            console.error(subdata);
            console.error(config);
        }
        return retSub;
    },
    //获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch:{
                inputText:function(value,oldValue){
                  if(this.inputText == ''){
                    this.isShowCloseBtn = false;
                    this.valueArray = [];
                    this.inputIds = '';
                  }
                },
                ajaxLoading:function(){
                    if(this.ajaxLoading){
                        this.setDataByAjax();
                    }
                }
            },
            methods:{
                //根据config配置设置默认值
                setDefaultValueByConfig:function(){
                    var componentConfig = NetstarComponent.config[this.formID].config[this.componentId];
                    //如果是单选需要根据id找到text
                    //如果是多选判断一下是ids还是list如果是list直接循环输出找到text
                    var filterListArray = componentConfig.filterListArray;
                    var idField = this.idField;
                    var textField = this.textField;
                    var inputTextArray = [];
                    var valueArray = [];
                    var inputIds = [];
                    var defaultValue = componentConfig.value;
                    var selectedFlag = _this.I18N.en.selectedFlag;
                    componentConfig.defaultValue = defaultValue;
                    if(defaultValue || defaultValue === 0){
                        //值存在或者当前值为0
                        if(componentConfig.multi){
                            //多选
                            if($.isArray(defaultValue)){
                                valueArray = defaultValue;
                                for(var valueI=0; valueI<valueArray.length; valueI++){
                                    inputTextArray.push(valueArray[valueI][textField]);
                                    inputIds.push(valueArray[valueI][idField]);
                                }
                                for(var valueI=0; valueI<filterListArray.length; valueI++){
                                    if(inputIds.indexOf(filterListArray[valueI][idField])>-1){
                                        filterListArray[valueI][selectedFlag] = true;
                                    }
                                }
                            }else if(typeof(defaultValue)=='string'){
                                for(var valueI=0; valueI<filterListArray.length; valueI++){
                                    if(defaultValue.indexOf(filterListArray[valueI][idField])>-1){
                                        filterListArray[valueI][selectedFlag] = true;
                                        inputTextArray.push(filterListArray[valueI][textField]);
                                        valueArray.push(filterListArray[valueI]);
                                        inputIds.push(filterListArray[valueI][idField]);
                                    }
                                } 
                            }
                        }else{
                            //单选
                            for(var valueI=0; valueI<filterListArray.length; valueI++){
                                if(filterListArray[valueI][idField] == defaultValue){
                                    filterListArray[valueI][selectedFlag] = true;
                                    inputTextArray.push(filterListArray[valueI][textField]);
                                    valueArray.push(filterListArray[valueI]);
                                    inputIds.push(filterListArray[valueI][idField]);
                                    break;
                                }
                            }
                        }
                        this.inputText = inputTextArray.join(',');//给input赋值
                        this.isShowCloseBtn = true;//显示关闭按钮
                        this.valueArray = valueArray;//当前选中值
                        this.inputIds = inputIds.join(',');//获取值ids
                    }
                },
                //服务端查询
                serverSearchByEnter:function(ev){

                },
                //查询事件
                searchByEnter:function(ev){
                    //console.log('searchByENTER');
                    var valueStr = $("#"+this.id).val();
                    var filterListArray = [];
                    var config = NetstarComponent.config[this.formID].config[this.componentId];
                    for(var listI=0; listI<config.listArray.length; listI++){
                        var listData = config.listArray[listI];
                        if(codefans_net_CC2pingyin(listData[config.textField]).indexOf(codefans_net_CC2pingyin(valueStr))>-1){
                            //listData.isHover = false;
                            filterListArray.push(listData);
                        }else if(getWBCode(listData[config.textField]).indexOf(getWBCode(valueStr))>-1){
                            //listData.isHover = false;
                            filterListArray.push(listData);
                        }
                    }
                    config.filterListArray = filterListArray;
                    //if(config.filterListArray.length >0){
                        //检索完成之后设置下拉面板第一个为活动列表
                        //config.filterListArray[0].isHover = true;
                    //}
                    _this.showPanel(config,this);
                },
                inputKeyUp:function(ev){
                    ev.preventDefault();
                    switch(ev.keyCode){
                        case 38:
                        case 40:
                        case 13:
                        case 32:
                            break;
                        default:
                            if(this.isServerMode){
                                //服务端查询
                                this.serverSearchByEnter(ev);
                            }else{
                                //本地查询
                                this.searchByEnter(ev);
                            }
                            break;
                    }
                },
                //回车事件
                inputEnter:function(ev){
                    console.log('inputEnter')
                    ev.preventDefault(); 
                    //ev.stopPropagation(); 
                    //ev.stopImmediatePropagation();
                   // if(this.isServerMode){
                        //服务端查询
                       // this.serverSearchByEnter(ev);
                    //}else{
                       //本地查询
                       // this.searchByEnter(ev);
                    //}
                },
                //失去焦点事件
                blurHandler:function(ev){
                    //console.log('blurhandler');
                    //console.log('blur')
                    var _this = this;
                    setTimeout(function(){
                        _this.getValue(true);//获取当前组件的值
                        NetstarComponent.formBlurHandler(config, _this);
                    },300)
                },
                //获取焦点事件
                focusHandler:function(ev){
                    //获取焦点设置焦点在当前元素并且显示面板
                    //console.log('focushandler')
                    //console.log(this.ajaxLoading)
                    $(ev.currentTarget).focus();
                    
                    if(!this.isPreloadData){
                        this.setDataByAjax();
                    }else{
                        this.isShowPanel = true;
                        _this.showPanel(config,this);
                    }
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 失去焦点
                blur: function(){
                   // console.log('blurdie')
                    this.$refs.inputName.blur();
                },
                //失去焦点改变事件
                change:function(ev){
                    var componentConfig = NetstarComponent.config[this.formID].config[this.componentId];//获取到组件的配置属性
                    var obj = {
                        id:componentConfig.id,
                        text:this.currentSelectedList[componentConfig.textField],
                        value:this.currentSelectedList[componentConfig.valueField],
                        config:componentConfig,
                        vueConfig:this,
                        jsonData:this.currentSelectedList,
                    };
                    if(typeof(componentConfig.changeHandler)=='function'){
                        componentConfig.changeHandler(obj);
                    }
                    if(typeof(componentConfig.commonChangeHandler)=='function'){
                        componentConfig.commonChangeHandler(obj);
                    }
                    if(typeof(componentConfig.relationField)=="string"){
                        NetstarComponent.commonFunc.refreshComponentByRelationField(componentConfig);
                    }
                    if(typeof(componentConfig.changeHandlerData)=="object"){
                        if(typeof(componentConfig.changeHandlerData[this.currentSelectedList[componentConfig.valueField]])=="object"){
                            NetstarComponent.changeComponentByChangeHandlerData(componentConfig.changeHandlerData[this.currentSelectedList[componentConfig.valueField]], componentConfig.formID);
                        }else{
                            if(typeof(componentConfig.changeHandlerData.nsRestoreDefaultObj)=="object"){
                                NetstarComponent.changeComponentByChangeHandlerData(componentConfig.changeHandlerData.nsRestoreDefaultObj, componentConfig.formID);
                            }
                        }
                    }
                    if(!componentConfig.multi){
                        // 单选情况下完成之后关闭面板
                        this.isShowPanel = false;
                        NetstarComponent.select.closePanel(componentConfig,this);
                        if(componentConfig.formSource == 'table'){
                            this.blurHandler();
                        }else{
                            NetstarComponent.setNextComponentFocus(componentConfig, this);
                        }
                    }else{
                       
                    }
                },
                //按钮点击事件
                buttonClick:function(ev){
                   // ev.stopPropagation();//阻止冒泡
                    //表单中所有下拉组件设置为不显示
                    //判断当前面板是展开还是关闭
                    this.isShowPanel = !this.isShowPanel;
                    if(this.isShowPanel){
                        NetstarComponent.select.showPanel(config,this);
                    }else{
                        NetstarComponent.select.closePanel(config,this);
                    }
                },
                //按钮按下不需要验证
                mousedown:function(){
                    this.isValidatValue = false;
                },
                //按钮按下不需要验证
                mouseup:function(){
                    this.isValidatValue = true;
                },
                clearBtn:function(ev){
                    this.clear(ev);
                    this.change();
                },
                //删除值
                clear:function(ev){
                    this.inputText = '';
                    this.isShowCloseBtn = false;
                    this.valueArray = [];
                    this.inputIds = '';
                    this.isShowPanel = false;
                    NetstarComponent.config[this.formID].config[this.componentId].filterListArray = NetstarComponent.config[this.formID].config[this.componentId].listArray;
                    var selectedFlag = NetstarComponent.select.I18N.en.selectedFlag;
                    for(var listI=0; listI<NetstarComponent.config[this.formID].config[this.componentId].filterListArray.length; listI++){
                        NetstarComponent.config[this.formID].config[this.componentId].filterListArray[listI][selectedFlag] = false;
                    }
                },
                //多选的删除
                closeClickByMulti:function(ev){
                    var primaryId = $(ev.currentTarget).attr('ns-id');
                    var valueArray = this.valueArray;
                    var isExistIndex = -1;
                    for(var valueI=0; valueI<valueArray.length; valueI++){
                        if(valueArray[valueI][this.idField] == primaryId){
                            isExistIndex = valueI;
                            break;
                        }
                    }
                    if(isExistIndex > -1){
                        valueArray.splice(isExistIndex,1);
                    }
                    $('div[name="'+this.id+'"] ul li[ns-id="'+primaryId+'"]').removeClass('selected');
                    this.setSelectedValue();
                },
                //按钮按下不验证值
                clearMousedown: function(){
                    this.isValidatValue = false;
                },
                clearMouseup: function(){
                    this.isValidatValue = true;
                },
                //ajax获取数据值
                setDataByAjax:function(){
                    var components = NetstarComponent.config[this.formID].config;
                    NetstarComponent.setAjaxSubdata(config, this, components, function(_config, vueConfig, isTrue){
                        if(isTrue){
                            vueConfig.subdata = NetstarComponent.select.getSubdata(_config);
                        }else{
                            vueConfig.subdata = [];
                        }
                        _config.filterListArray = $.extend(true,[],_config.subdata);
                        _config.listArray = $.extend(true,[],_config.subdata);
                        //本地数据设置默认值
                        vueConfig.setDefaultValueByConfig();
                        if(_config.formSource == 'table'){
                            vueConfig.isShowPanel = true;
                            NetstarComponent.select.showPanel(_config,vueConfig);
                        }
                        if($('#'+_config.fullID).is(':focus')){
                            vueConfig.isShowPanel = true;
                            NetstarComponent.select.showPanel(_config,vueConfig);
                        }
                    });
                },
                //验证
                validatValue:function(value){
                    /*
                    * value : 表单的value值
                    * ruleStr : rules的配置值 如 max=0 ；required
                    * returnType : 返回验证结果
                    */
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                clearCustomAttr:function(){
                    //清空自定义运行的属性值
                    var attrFieldArray = _this.I18N.en.attrFieldArr;
                    var valueArray = this.valueArray;
                    for(var attrI=0; attrI<attrFieldArray.length; attrI++){
                        for(var valueI=0; valueI<valueArray.length; valueI++){
                            delete valueArray[valueI][attrFieldArray[attrI]];
                        }
                    }
                },
                setSelectedValue:function(){
                    //设置选中
                    var vueConfig = NetstarComponent.config[this.formID].vueConfig[this.componentId];
                    var valueArray = [];
                    var valueIds = [];
                    for(var valueI=0; valueI<vueConfig.valueArray.length; valueI++){
                        valueArray.push(vueConfig.valueArray[valueI][vueConfig.textField]);
                        valueIds.push(vueConfig.valueArray[valueI][vueConfig.idField]);
                    }
                    this.inputText = valueArray.join(',');
                    this.inputIds = valueIds.join(',');
                    $('#'+this.id).val(this.inputText);
                },
                setValue:function(_valueStr){
                    var vueConfig = NetstarComponent.config[this.formID].vueConfig[this.componentId];
                    var componentConfig = NetstarComponent.config[this.formID].config[this.componentId];
                    componentConfig.value = _valueStr;
                    if(_valueStr){
                        var nsIndex = - 1;
                        for(var valueI=0; valueI<componentConfig.subdata.length; valueI++){
                            if(componentConfig.subdata[valueI][vueConfig.idField] == _valueStr){
                                nsIndex = valueI;
                                break;
                            }
                           // valueArray.push(vueConfig.valueArray[valueI]);
                            //valueIds.push(vueConfig.valueArray[valueI][vueConfig.idField]);
                        }
                        if(nsIndex > -1){
                            this.valueArray = [componentConfig.subdata[nsIndex]];
                            this.inputText = componentConfig.subdata[nsIndex][vueConfig.textField];
                            this.inputIds = componentConfig.subdata[nsIndex][vueConfig.idField];
                            $('#'+this.id).val(this.inputText);
                        }
                    }else{
                        this.clear();
                    }
                },
                //获取值
                getValue:function(isValid){
                    this.clearCustomAttr();
                    var componentConfig = NetstarComponent.config[this.formID].config[this.componentId];//获取到组件的配置属性
                    var valueStr = false;
                    if(componentConfig.isObjectValue){
                        //返回值是个list
                        valueStr = this.valueArray;
                    }else{
                        //返回值是字符串
                        valueStr = this.inputIds ? this.inputIds : '';
                    }
                    var isTrue = true;
                    if(isValid){
                        isTrue = this.validatValue(valueStr);
                        if(!isTrue){
                            valueStr = false;
                        }
                    }
                    if(isTrue){
                        if(typeof(config.outputFields) == "object"){
                            var outVals = NetStarUtils.getFormatParameterJSON(config.outputFields, this.valueArray);
                            outVals[config.id] = valueStr;
                            valueStr = outVals;
                        }
                    }
                    if(!this.multi){
                        //单选
                        var inputName = $('#'+this.id).val();
                        if(this.valueArray.length > 0){
                            if(inputName !== this.valueArray[0][componentConfig.textField]){
                                //$('#'+this.id).val('');
                                this.clear();
                            }
                        }else{
                            valueStr = componentConfig.value;
                            if(isValid){
                                isTrue = this.validatValue(valueStr);
                                if(!isTrue){
                                    valueStr = false;
                                }
                            }
                            this.clear(); 
                        }
                    }
                    return valueStr;
                },
                //设置值
                setValueInput:function(){
                    this.setSelectedValue();
                    this.isShowCloseBtn = true;
                    this.change();
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                },
            },
            mounted:function(){
                //如果定义了ajax且当前不是服务端检索则应该初始化的时候进行赋值
                if(this.isAjax && !this.isServerMode && this.isPreloadData){
                    this.setDataByAjax();
                }else{
                    //本地数据设置默认值
                    this.setDefaultValueByConfig();
                }
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
                if(config.formSource == 'table'){
                    NetstarComponent.config[this.formID].vueConfig = {};
                    NetstarComponent.config[this.formID].vueConfig[this.componentId] = this;
                }
                //console.log('init')
            },
        };
        return component;
    }
}
// label
NetstarComponent.label = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            div:'<div :class="labelStyle">{{title}}</div>',
        },
        MOBILE:{
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            formSource :        'form',         // 显示类型 默认form table/staticData
            styleName :         'common',       // common：普通
		}
		nsVals.setDefaultValues(config, defaultConfig);
    },
    // 设置config
    setConfig: function(config){
    },
    // 验证配置是否正确
    validatConfig: function(config){
        return true;
    },
    formatConfig : function(config, formConfig){
        config.id = 'label-' + formConfig.labelIdNum ++;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var containerHtml = tempalte.div;
        return containerHtml;
    },
    getData: function(config){
        var data = {
            title : config.label,
            sourceId : config.id,
            labelStyle : 'pt-label-' + config.styleName,
        };
        return data;
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch: {
            },
            methods: {
            },
            mounted : function(){
            },
        }
        return component;
    },
}
// 附件上传
NetstarComponent.upload = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            // upload: '<input class="pt-form-control" :disabled="disabled" :value="inputName" v-model="inputName" :nsValue="inputText" :id="id" :style="styleObject" @click="show" @keyup="keyup" @blur="blurHandler" @change="change">',
            // 表单显示的容器
            container : '<div class="pt-form-control" :id="id" :style="styleObject" @mouseover="showInPanel" @mouseout="hideInPanel">{{showStr}}</div>',
            // 鼠标进入时面板的容器
            inContainer : '<div class="pt-input-group-btn" :class="{hide:!isIn}" @mouseover="showInPanel" @mouseout="hideInPanel">'
                                + '<template v-if="isMultiple">'
                                    + '<button class="pt-btn pt-btn-default pt-btn-icon" @click="showListPanel">'
                                        +'<i class="icon-arrow-down-o"></i>'
                                    + '</button>'
                                + '</template>'
                                + '<template v-else>'
                                    + '{{fileBtnContent}}'
                                + '</template>'
                            + '</div>',
            listContainer : '<div class="pt-upload-list-container" :id="uploadListId"></div>',
        },
        MOBILE:{
        },
    },
    title : {
        upload : '上传',
        delete : '删除',
        download : '下载',
        print : '打印',
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        200,            // 默认宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 显示类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
            btns:               ['upload'],     // 显示的按钮 upload / delete / download / print
            isMultiple:         false,          // 是否多选
            accept:             '',             // image/gif, image/jpeg, image/bmp, image/png, .doc
            textField:          'text',         // 显示名
            valueField:         'value',        // 唯一标识 id
            urlField:           'url',          // url的key值
            thumUrlField:       'thumUrl',      // 缩略图地址的key值
            isShowThum:         true,           // 是否显示缩略图 默认显示
            fileNum:            5,              // 内部参数 不可配
            fileTypeField:      'contentType',  // 文件类型字段
            uploadAjaxData:     {},             // ajax传参
            ajax :              {},             // 上传地址配置
            editAjax :          {},             // 修改地址配置
            downloadAjax :      {},             // 下载地址配置
		}
		nsVals.setDefaultValues(config, defaultConfig);
    },
    // 设置config
    setConfig: function(config){
        config.uploadListId = config.fullID + '-uploadlist';
        if(config.readonly == true){
            config.disabled = true;
        }
        if(typeof(config.btns) == "string" && config.btns.length > 0){
            config.btns = config.btns.split(',')
            for(var i=0; i<config.btns.length; i++){
                config.btns[i] = $.trim(config.btns[i]);
            }
        }
        if(typeof(config.uploadAjaxData) == "string" && config.btns.length > 0){
            config.uploadAjaxData = JSON.parse(config.uploadAjaxData);
        }
        
        // if(typeof(config.value) == "object"){
        //     if($.isArray(config.value)){
        //         config.value = config.value;
        //     }else{
        //         config.value = [config.value];
        //     }
        // }else{
        //     if(typeof(config.value) == "undefined"){
        //         config.value = '';
        //     }else{
        //         if(config.value !== ''){
        //             console.error('value值设置错误');
        //             console.error(config.value);
        //             console.error(config);
        //             config.value = '';
        //         }
        //     }
        // }
        config.ajax = typeof(config.ajax) == "object" ? config.ajax : {};
        config.editAjax = typeof(config.editAjax) == "object" ? config.editAjax : {};
        config.getFileAjax = typeof(config.getFileAjax) == "object" ? config.getFileAjax : {};
        config.downloadAjax = typeof(config.downloadAjax) == "object" ? config.downloadAjax : {};
        config.ajax.type = typeof(config.ajax.type) == "string" ? config.ajax.type : 'GET';
        config.ajax.dataSrc = typeof(config.ajax.dataSrc) == "string" ? config.ajax.dataSrc : 'rows';
        config.editAjax.type = typeof(config.editAjax.type) == "string" ? config.editAjax.type : 'GET';
        config.editAjax.dataSrc = typeof(config.editAjax.dataSrc) == "string" ? config.editAjax.dataSrc : 'data';
        config.editAjax.contentType = typeof(config.editAjax.contentType) == "string" ? config.editAjax.contentType : 'application/x-www-form-urlencoded';

        config.getFileAjax.type = typeof(config.getFileAjax.type) == "string" ? config.getFileAjax.type : 'GET';
        config.getFileAjax.dataSrc = typeof(config.getFileAjax.dataSrc) == "string" ? config.getFileAjax.dataSrc : 'rows';
        config.getFileAjax.contentType = typeof(config.getFileAjax.contentType) == "string" ? config.getFileAjax.contentType : 'application/x-www-form-urlencoded';
    },
    // 验证配置是否正确
    validatConfig: function(config){
        return true;
    },
    // 上传面板
    uploadPanel : {
        template : {
            // 上传
            upload : '<button class="pt-btn pt-btn-default pt-btn-icon" :title="uploadTitle" :disabled="disabled">'
                        + '<input v-if="isMultiple" class="pt-upload-control" :accept="accept" multiple="multiple" type="file" @change="uploadFile" ref="uploadInput">'
                        + '<input v-else class="pt-upload-control" :accept="accept" type="file" @change="uploadFile" ref="uploadInput">'
                        + '<i class="icon-upload-o"></i>'
                    + '</button>',
            // 编辑
            edit : '<button class="pt-btn pt-btn-default pt-btn-icon" :title="editTitle" :disabled="disabled" @click="editFile">'
                        + '<i class="icon-edit-o"></i>'
                    + '</button>',
            // 删除
            delete : '<button class="pt-btn pt-btn-default pt-btn-icon" :title="deleteTitle" :disabled="disabled" @click="deleteFile">'
                        +'<i class="icon-trash-o"></i>'
                    + '</button>',
            // 下载
            download : '<button class="pt-btn pt-btn-default pt-btn-icon" :title="downloadTitle" :disabled="disabled" @click="downloadFile">'
                            + '<i class="icon-download-o"></i>'
                        + '</button>',
            // 下载
            downloads : '<button class="pt-btn pt-btn-default pt-btn-icon" :title="downloadsTitle" :disabled="disabled" @click="downloadFiles">'
                            + '<i class="icon-download-o"></i>'
                        + '</button>',
            // 打印
            print : '<button class="pt-btn pt-btn-default pt-btn-icon" :title="printTitle" :disabled="disabled" @click="printFile">'
                        +'<i class="icon-print-o"></i>'
                    + '</button>',
            // 文件列表 单选时隐藏
            listContent : '<div class="pt-upload-list" @click="clickPanel">'
                            + '<div class="pt-upload-list-header" :class="{hide:disabled}">'
                                + '<div :class="selectState" @click="selectAllFile">'
                                    // 全选 半选 不选
                                + '</div>'
                                + '<div class="pt-input-group-btn">'
                                    + '{{filesBtnContent}}'
                                + '</div>'
                            + '</div>'
                            + '<div class="pt-upload-list-body">'
                                + '<ul class="">'
                                    + '<li v-for="(file,index) in files[pageIndex]" :class="{selected:file.isSelected,readonly:disabled}" class="pt-upload-list-item" @click="selectedFile($event,file,index)">'
                                        + '<div v-if="!$.isEmptyObject(file)" class="pt-list-table">'
                                            // 图片
                                            + '<div class="pt-upload-thumbs">'
                                                // 缩略图
                                                + '<img class="pt-image" v-if="isShowThum&&file[thumUrlField]" :src="file[thumUrlField]"/>' 
                                                // 默认
                                                + '<div v-else class="pt-icon">'
                                                    + '<template v-if="defaultFileImage[file[fileTypeField]]">'
                                                        + '<i :class="defaultFileImage[file[fileTypeField]]"></i>'
                                                    + '</template>'
                                                    + '<template v-else>'
                                                        + '<i :class="defaultFileImage.default"></i>'
                                                    + '</template>'
                                                + '</div>'
                                            + '</div>'
                                            // 内容
                                            + '<div class="pt-upload-names">'
                                                // 编辑状态
                                                + '<template v-if="file.isEditing">'
                                                    + '<input class="pt-form-control" type="text" v-model="file[textField]" @blur="editBlur">'
                                                    + '<div class="pt-input-group-btn">'
                                                        + '<button class="pt-btn pt-btn-default pt-btn-icon" @click="editName($event,file,index)" @mousedown="editMousedown" @mouseup="editMouseup">'
                                                            + '<i class="icon-check"></i>'
                                                        + '</button>'
                                                    + '</div>'
                                                + '</template>'
                                                // 显示状态
                                                + '<template v-else>'
                                                    + '<span>{{file[textField]}}</span>'
                                                + '</template>'
                                            + '</div>'
                                            // 按钮
                                            + '<div class="pt-input-group-btn" :class="{hide:disabled}">'
                                                + '{{fileBtnContent}}'
                                            + '</div>'
                                        + '</div>'
                                    + '</li>'
                                + '</ul>'
                            + '</div>'
                            + '<div class="pt-upload-list-footer">'
                                + '<div class="pt-page-turn">'
                                    + '<div class="pt-btn-group">'
                                        + '<button class="pt-btn pt-btn-link" @click="firstPage">'
                                            + '<span>首页</span>'
                                        + '</button>'
                                        + '<button class="pt-btn pt-btn-icon pt-btn-link" @click="prevPage" :disabled="pageIndex===0">'
                                            + '<i class="fa fa-chevron-left"></i>'
                                        + '</button>'
                                    + '</div>'
                                    + '<div class="pt-form-group">'
                                        + '<label for="name" class="pt-control-label">第</label>'
                                        + '<div class="pt-input-group">'
                                            + '<input type="text" class="pt-form-control" placeholder="" v-model="currentPage" @blur="pageIndexBlur">'
                                            + '<div class="pt-input-group-btn">'
                                                + '<button class="pt-btn pt-btn-default pt-btn-icon" @click="showPageSelectPanel" ref="selectPageBtn">'
                                                    + '<i class="icon-arrow-down-o"></i>'
                                                + '</button>'
                                            + '</div>'
                                            + '<div class="pt-input-group-select" :class="{hide:!isShowPageSelectPanel}">'
                                                + '<ul>'
                                                    + '<li v-for="(file,index) in files" :class="{active:currentPage == (index+1)}" @click="selectPageNum($event, index)">{{index+1}}</li>'
                                                + '</ul>'
                                            + '</div>'
                                        + '</div>'
                                        + '<label for="name" class="pt-control-label">页</label>'
                                    + '</div>'
                                    + '<div class="pt-btn-group">'
                                        + '<button class="pt-btn pt-btn-icon pt-btn-link" @click="nextPage" :disabled="pageIndex===(files.length-1)">'
                                            + '<i class="fa fa-chevron-right"></i>'
                                        + '</button>'
                                        + '<button class="pt-btn pt-btn-link" @click="lastPage">'
                                            + '<span>尾页</span>'
                                        + '</button>'
                                    + '</div>'
                                + '</div>'
                            + '</div>'
                        + '<div>',
        },
        defaultFileImage : {
            'image/jpeg' : 'icon-image',
            'image/gif' : 'icon-image',
            'image/bmp' : 'icon-image',
            'image/png' : 'icon-image',

            'doc' : 'icon-file-word',
            'excel' : 'icon-file-excel',
            'pdf' : 'icon-file-pdf',
            'zip' : 'icon-file-zip',
            'default' : 'icon-file-o',
        },
        // 获取单个文件编辑按钮
        getfileBtnHtml : function(isMultiple, btns){
            var template = this.template;
            var html = '';
            for(var i=0; i<btns.length; i++){
                var btnHtml = template[btns[i]];
                if(isMultiple){
                    if(btns[i] == "upload"){
                        // 多选行按钮没有上传
                        continue;
                    }else{
                        var eventStr = 'File($event,file,index)';
                        var rex = new RegExp(btns[i] + 'File', 'g');
                        btnHtml = btnHtml.replace(rex, btns[i] + eventStr);
                    }
                }else{
                    if(btns[i] == "edit"){
                        // 单选按钮没有编辑
                        continue;
                    } 
                }
                html += btnHtml;
            }
            return html;
        },
        // 获取多个文件编辑按钮
        getfilesBtnHtml : function(btns){
            var template = this.template;
            var html = '';
            for(var i=0; i<btns.length; i++){
                var btnHtml = '';
                switch(btns[i]){
                    case 'upload':
                        btnHtml = template[btns[i]];
                        break;
                    case 'download':
                        btnHtml = template.downloads;
                        break;
                    case 'print':
                    case 'delete':
                        btnHtml = template[btns[i]];
                        var eventStr = 'Files';
                        var rex = new RegExp(btns[i] + 'File', 'g');
                        btnHtml = btnHtml.replace(rex, btns[i] + eventStr);
                        break;
                    default:
                        break;
                }
                html += btnHtml;
            }
            return html;
        },
        // 获取list的html
        getListPanelHtml : function(config){
            var template = this.template;
            var html = template.listContent;
            var btnsHtml = this.getfileBtnHtml(true, config.btns);
            var filesBtnsHtml = this.getfilesBtnHtml(config.btns);
            html = html.replace('{{fileBtnContent}}', btnsHtml);
            html = html.replace('{{filesBtnContent}}', filesBtnsHtml);
            return html;
        },
        getValFiles : function(fileAll){
            var _fileAll = [];
            for(var i=0; i<fileAll.length; i++){
                for(var j=0; j<fileAll[i].length; j++){
                    if(!$.isEmptyObject(fileAll[i][j])){
                        _fileAll.push(fileAll[i][j]);
                    }
                }
            }
            return _fileAll;
        },
        // 获取files通过fileNum和fileAll
        getFiles : function(fileAll, fileNum, isTowDimen){
            var _fileAll = [];
            if(isTowDimen){
                _fileAll = this.getValFiles(fileAll);
            }else{
                _fileAll = fileAll;
            }
            var files = [[]];
            var pageNum = 0;
            for(var i=0; i<_fileAll.length; i++){
                if(i !== 0 && i%fileNum === 0){
                    pageNum ++;
                    files[pageNum] = [];
                }
                files[pageNum].push(_fileAll[i]);
            }
            // 如果最后一页数量不够 用空对象补充
            // if(files[files.length-1].length < fileNum){
            //     for(var i=files[files.length-1].length; i<fileNum; i++){
            //         files[files.length-1][i] = {};
            //     }
            // }
            return files;
        },
        getData : function(config){
            var value = $.isArray(config.valueFiles) ? config.valueFiles : [];
            var fileNum = config.fileNum;
            var files = this.getFiles(value, fileNum, false);
            var data = {
                files : files,
                thumUrlField : config.thumUrlField,
                textField : config.textField,
                isShowThum : config.isShowThum,
                deleteTitle : '删除',
                editTitle : '编辑',
                uploadTitle : '上传',
                downloadTitle : '下载',
                downloadsTitle : '下载',
                printTitle : '打印',
                printsTitle : '打印全部',
                disabled : config.disabled,
                urlField : config.urlField,
                isMultiple : config.isMultiple,
                accept : config.accept,
                fileTypeField : config.fileTypeField,
                currentPage : 1,
                pageIndex : 0,
                defaultFileImage : this.defaultFileImage,
                isShowPageSelectPanel : false,
                selectState : 'pt-checkbox',
            };
            return data;
        },
        // 显示面板
        showListPanel: function(config, vueConfig){
            var _this = this;
            // 获取并插入html
            var html = this.getListPanelHtml(config);
            var uploadListId= config.uploadListId;
            var $uploadListContainer = $('#' + uploadListId);
            $uploadListContainer.html(html);
            // 获取data
            var data = this.getData(config);
            // 初始化vue
            config.uploadListVue = new Vue({
                el: '#' + uploadListId,
                data: data,
                watch: {
                    currentPage : function(value, oldVal){
                        value = Number(value);
                        if(isNaN(value) || value<1 || value>this.files.length){
                        }else{
                            this.pageIndex = value - 1;
                        }
                    },
                    files : function(files, oldFiles){
                        var isSelected = false;
                        var isSelectedAll = true;
                        for(var i=0; i<files.length; i++){
                            for(var j=0; j<files[i].length; j++){
                                if(!$.isEmptyObject(files[i][j])){
                                    if(files[i][j].isSelected){
                                        isSelected = true;
                                    }else{
                                        isSelectedAll = false; 
                                    }
                                }
                            }
                        }
                        if(isSelected && isSelectedAll){
                            // 全选
                            this.selectState = 'pt-checkbox-full';
                        }else{
                            if(isSelected){
                                // 半选
                                this.selectState = 'pt-checkbox-harf';
                            }else{
                                // 不选
                                this.selectState = 'pt-checkbox';
                            }
                        }
                    },
                },
                methods: {
                    showPageSelectPanel : function(){
                        this.isShowPageSelectPanel = !this.isShowPageSelectPanel;
                    },
                    clickPanel : function(ev){
                        var isPanelSelecting = false;
                        if($(ev.target).is($(this.$refs.selectPageBtn)) || $(ev.target).parent().is($(this.$refs.selectPageBtn))){
                            isPanelSelecting = true;
                        }
                        if(!isPanelSelecting){
                            this.isShowPageSelectPanel = false;
                        }
                    },
                    selectAllFile : function(){
                        var _files = $.extend(true, [], this.files);
                        var isSelected = true;
                        if(this.selectState == 'pt-checkbox-full'){
                            isSelected = false;
                        }
                        for(var i=0; i<_files.length; i++){
                            for(var j=0; j<_files[i].length; j++){
                                if(!$.isEmptyObject(_files[i][j])){
                                    _files[i][j].isSelected = isSelected;
                                }
                            }
                        }
                        this.files = _files;
                    },
                    selectPageNum : function(ev, index){
                        this.currentPage = index + 1;
                        this.pageIndex = index;
                    },
                    // 首页
                    firstPage : function(){
                        this.currentPage = 1;
                    },
                    // 尾页
                    lastPage : function(){
                        this.currentPage = this.files.length;
                    },
                    // 上一页
                    prevPage : function(){
                        this.currentPage --;
                    },
                    // 下一页
                    nextPage : function(){
                        this.currentPage ++;
                    },
                    // 页码输入框失去焦点 value显示当前页码
                    pageIndexBlur : function(){
                        this.currentPage = this.pageIndex + 1;
                    },
                    // 上传文件
                    uploadFile : function(ev,file,index){
                        var __this = this;
                        var $upload = $(this.$refs.uploadInput);
                        var files = $upload.prop('files');
                        NetstarComponent.upload.uploadFile(files, config, function(resRowsData, plusData){
                            __this.addFile(resRowsData);
                        });
                        $upload.val("");
                    },
                    // 编辑名字
                    editName : function(ev,file,index){
                        var __this = this;
                        var data = {};
                        data[config.valueField] = file[config.valueField];
                        data[config.textField] = file[config.textField];
                        this.cancelEdit();
                        NetstarComponent.upload.editFileName(data, config, function(resData, plusData){
                            __this.setFileName(data, index);
                        });
                    },
                    // 编辑按钮mousedown
                    editMousedown : function(){
                        this.isEditConfirm = true;
                    },
                    // 编辑按钮mouseup
                    editMouseup : function(){
                        this.isEditConfirm = false;
                    },
                    // 设置文件名字 通过文件返回值
                    setFileName : function(file, index){
                        var files = $.extend(true, [], this.files);
                        files[this.pageIndex][index][config.textField] = file[config.textField];
                        this.files = files;
                        vueConfig.setValueFiles(this.getValFiles(files));
                    },
                    // 编辑失去焦点时取消编辑
                    editBlur : function(){
                        if(!this.isEditConfirm){
                            this.cancelEdit()
                        }
                    },
                    // 取消编辑方法
                    cancelEdit : function(){
                        var files = $.extend(true, [], this.files);
                        for(var i=0; i<files.length; i++){
                            for(var j=0; j<files[i].length; j++){
                                delete files[i][j].isEditing;
                                if(typeof(files[i][j]['source' + config.textField]) != "undefined" && files[i][j]['source' + config.textField] != files[i][j][config.textField]){
                                    files[i][j][config.textField] = files[i][j]['source' + config.textField];
                                }
                                delete files[i][j]['source' + config.textField];
                            }
                        }
                        this.files = files;
                    },
                    // 编辑文件
                    editFile : function(ev,file,index){
                        this.cancelEdit();
                        var files = $.extend(true, [], this.files);
                        files[this.pageIndex][index].isEditing = true;
                        files[this.pageIndex][index]['source' + config.textField] = file[config.textField];
                        this.files = files;
                        setTimeout(function(){
                            $(ev.target).parents('li').find('input').focus();
                        },0)
                    },
                    // 删除文件
                    deleteFile : function(ev,file,index){
                        var _files = $.extend(true, [], this.files);
                        _files[this.pageIndex].splice(index, 1);
                        this.files = _this.getFiles(_files, config.fileNum, true);
                        vueConfig.setValueFiles(_this.getValFiles(_files));
                    },
                    // 删除多个文件
                    deleteFiles : function(ev){
                        var noSelectedFiles = this.getNoSelectedFile();
                        this.files = _this.getFiles(noSelectedFiles, config.fileNum, false);
                        vueConfig.setValueFiles(noSelectedFiles);
                    },
                    // 获取未选中文件
                    getNoSelectedFile : function(){
                        var _files = this.files;
                        var noSelectedFiles = [];
                        for(var i=0; i<_files.length; i++){
                            for(var j=0; j<_files[i].length; j++){
                                if(!$.isEmptyObject(_files[i][j]) && !_files[i][j].isSelected){
                                    noSelectedFiles.push(_files[i][j]);
                                }
                            }
                        }
                        return noSelectedFiles;
                    },
                    // 获取选中文件
                    getSelectedFile : function(){
                        var _files = this.files;
                        var selectedFiles = [];
                        for(var i=0; i<_files.length; i++){
                            for(var j=0; j<_files[i].length; j++){
                                if(_files[i][j].isSelected){
                                    selectedFiles.push(_files[i][j]);
                                }
                            }
                        }
                        return selectedFiles;
                    },
                    // 选中文件
                    selectedFile : function(ev,file,index){
                        if( ev.target.tagName == "INPUT" || 
                            ev.target.tagName == "BUTTON" || 
                            ev.target.parentNode.tagName == "BUTTON" || 
                            $.isEmptyObject(file) || config.disabled
                        ){
                            // li 中的按钮不执行选中
                            return;
                        }
                        var _files = $.extend(true, [], this.files);
                        _files[this.pageIndex][index].isSelected = file.isSelected == true ? false : true;
                        this.files = _files;
                    },
                    // 下载文件
                    downloadFile : function(ev,file,index){
                        NetstarComponent.upload.downloadFile(file, config);
                    },
                    // 打印文件
                    printFile : function(ev,file,index){console.log(file)},
                    // 下载多个文件
                    downloadFiles : function(ev){},
                    // 打印多个文件
                    printFiles : function(ev){},
                    // 新增文件
                    addFile : function(files){
                        var _files = $.extend(true, [], this.files);
                        _files = _this.getValFiles(_files);
                        _files = _files.concat(files);
                        this.files = _this.getFiles(_files, config.fileNum, false);
                        vueConfig.setValueFiles(_files);
                    },
                    // 获取value
                    getValue : function(){},
                    close : function(){
                        var $uploadListContainer = $('#' + config.uploadListId)
                        $uploadListContainer.children().remove();
                        $(document).off('scroll', this.documentScroll);
                        $(document).off('click', this.documentClose);
                    },
                    documentScroll : function(ev){
                        // this.close();
                        vueConfig.isShowListPanel = false;
                    },
                    documentClose : function(ev){
                        NetstarComponent.commonFunc.clickAnyWhereToFunc(ev);
                    },
                },
                mounted: function(){
                    var __this = this;
                    var $upload = $('#' + config.fullID);
                    var $uploadListContainer = $('#' + config.uploadListId)
                    NetstarComponent.commonFunc.setContainerPosition($uploadListContainer, $upload, 'upper');
                    $(document).on('scroll', __this.documentScroll);
                    // 添加点击任意位置关闭
                    var obj = {
                        relId : config.fullID,
                        containerId : config.uploadListId,
                        parentName : '.pt-form-group',
                        func : function(){
                            // __this.close();
                            vueConfig.isShowListPanel = false;
                        }
                    }
                    if(config.formSource == "table"){
                        obj.parentName = ".table-editor-container"
                    }
                    $(document).on('click', obj, __this.documentClose);
                }
            });
        },
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        if(config.formSource=="staticData"){
            var contentHtml = NetstarComponent.getStaticTemplate(config);
            contentHtml = contentHtml.replace("{{inputText}}", "{{showStr}}");
        }else{
            var containerHtml2 = tempalte.container;
            var inHtml = tempalte.inContainer;
            var listHtml = tempalte.listContainer;
            var btnHtml = this.uploadPanel.getfileBtnHtml(false, config.btns);
            inHtml = inHtml.replace('{{fileBtnContent}}', btnHtml);
            var contentHtml = containerHtml2 + inHtml + listHtml;
            if(config.formSource=='table'){
                containerHtml = NetstarComponent.common.tableComponent;
            }
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        data.isIn = false; // 鼠标是否进入
        if(config.isMultiple && config.disabled){
            data.isIn = true; 
        }
        data.isMultiple = config.isMultiple; // 是否多选
        var btns = config.btns;
        for(var i=0; i<btns.length; i++){
            data[btns[i] + 'Title'] = this.title[btns[i]];
        }
        data.accept = config.accept;
        var showStr = '';
        // if($.isArray(config.value) && config.value.length > 0){
        //     if(config.isMultiple){
        //         showStr = config.value.length + '个附件';
        //     }else{
        //         showStr = config.value[0][config.textField];
        //     }
        // }
        data.showStr = showStr;
        data.uploadListId = config.uploadListId;
        data.isShowListPanel = false;
        return data;
    },
    // 验证value
    validatValue: function(value, rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(rules){
            case 'required':
                if(value === '' || ($.isArray(value)&&value.length==0)){
                    isTrue = false;
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 上传文件
    uploadFile : function(files, config, callBackFunc){
        NetstarComponent.upload.abc = files;
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
            var item = files[i];
            formData.append('files', item, item.name);
        }
        if(!$.isEmptyObject(config.uploadAjaxData)){
            for(var key in config.uploadAjaxData){
                formData.append(key, config.uploadAjaxData[key]);
            }
        }
        // 发送ajax
        var ajaxConfig = {
            url : config.ajax.url,
            processData : false,
            contentType : false,
            data : formData,
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
                var _config = NetstarComponent.config[plusData.formId].config[plusData.componentId];
                // var _vueConfig = NetstarComponent.config[plusData.formId].vueConfig[plusData.componentId];
                // _vueConfig.setValue(res[_config.ajax.dataSrc]);
                if(typeof(plusData.callBackFunc) == "function"){
                    plusData.callBackFunc(res[_config.ajax.dataSrc], plusData);
                }
            }else{
                nsalert("上传失败");
                nsalert(res.msg, 'error');
            }
        })
    },
    // 修改文件名字
    editFileName : function(data, config, callBackFunc){
        // 发送ajax
        var ajaxConfig = {
            url : config.editAjax.url,
            data : data,
            contentType : config.editAjax.contentType,
            plusData : {
                componentId : config.id,
                formId : config.formID,
            },
        }
        NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            if(res.success){
                nsalert("修改成功");
                var plusData = _ajaxConfig.plusData;
                // var _config = NetstarComponent.config[plusData.formId].config[plusData.componentId];
                // if(typeof(res[_config.editAjax.dataSrc]) != "object"){
                //     nsAlert('修改文件名返回值错误','error');
                //     console.error('修改文件名返回值错误');
                //     console.error(res);
                //     console.error(_config);
                //     return false;
                // }
                if(typeof(callBackFunc) == "function"){
                    callBackFunc(res, plusData);
                }
            }else{
                nsalert("修改失败");
                nsalert(res.msg, 'error');
            }
        })
    },
    // value是否改变
    getValIsChange : function(value, sourceValue, config){
        var isChange = false;
        if(typeof(value) != typeof(sourceValue)){
            isChange = true;
        }else if(value.length != sourceValue.length){
            isChange = true;
        }else{
            for(var i=0; i<value.length; i++){
                var isHave = false;
                for(var j=0; j<sourceValue.length; j++){
                    if(value[i][config.valueField] == sourceValue[j][config.valueField]){
                        isHave = true;
                    }
                }
                if(!isHave){
                    isChange = true;
                    break; 
                }
            }
        }
        return isChange;
    },
    // 下载文件
    downloadFile : function(file, config, callBackFunc){
        var downloadFileUrl = config.downloadAjax.url + file[config.valueField];
        var downloadFileName = file[config.textField];
        nsVals.downloadFile(downloadFileName, downloadFileUrl);
    },
    // 通过ids获取file
    getFileByIds : function(ids, config, callBackFunc){
        var ajaxConfig = {
            url : config.getFileAjax.url,
            data : {
                ids : ids,
                hasContent : false,
            },
            type : config.getFileAjax.type,
            contentType : config.getFileAjax.contentType,
            plusData : {
                componentId : config.id,
                formId : config.formID,
                callBackFunc : callBackFunc,
            },
        }
        NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            if(res.success){
                var plusData = _ajaxConfig.plusData;
                var _config = NetstarComponent.config[plusData.formId].config[plusData.componentId];
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
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch: {
                isShowListPanel : function(value){
                    if(value){
                        _this.uploadPanel.showListPanel(config, this);
                    }else{
                        if(config.uploadListVue){
                            config.uploadListVue.close();
                        }
                    }
                }
            },
            methods: {
                // 初始化完成执行ajax通过ids获取文件
                initComplete : function(){
                    var __this = this;
                    var value = config.value;
                    config.valueFiles = [];
                    if(typeof(value)!="string" || value === ''){
                        return;
                    }
                    _this.getFileByIds(value, config, function(files, plusData){
                        var showStr = '';
                        if($.isArray(files) && files.length > 0){
                            if(config.isMultiple){
                                showStr = files.length + '个附件';
                            }else{
                                showStr = files[0][config.textField];
                            }
                            config.valueFiles = files;
                        }
                        __this.showStr = showStr;
                    })
                },
                // 显示文件list弹框
                showListPanel : function(ev){
                    this.isShowListPanel = !this.isShowListPanel;
                    // _this.uploadPanel.showListPanel(config, this);
                },
                // 显示鼠标进入时的面板
                showInPanel: function(ev){
                    if(config.disabled){
                        return;
                    }
                    this.isIn = true;
                },
                // 移除鼠标进入时的面板
                hideInPanel: function(ev){
                    if(config.disabled){
                        return;
                    }
                    this.isIn = false;
                },
                uploadFile: function(ev){
                    var $upload = $(this.$refs.uploadInput);
                    var files = $upload.prop('files');
                    var __this = this;
                    _this.uploadFile(files, config, function(resRowsData, plusData){
                        __this.setValueFiles(resRowsData);
                    });
                    $upload.val("");
                },
                deleteFile: function(ev){
                    this.setValueFiles('');
                },
                downloadFile: function(){
                    var file = this.getValue();
                    if(file){
                        _this.downloadFile(file[0], config);
                    }
                },
                printFile: function(){},
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    // var value = config.value;
                    var value = '';
                    var valueFiles = config.valueFiles;
                    if($.isArray(valueFiles)){
                        for(i=0; i<valueFiles.length; i++){
                            value += valueFiles[i][config.valueField] + ',';
                        } 
                        if(value.length > 0){
                            value = value.substring(0, value.length-1);
                        }
                    }
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置valueFiles
                setValueFiles : function(valueFiles){
                    var __this = this;
                    // valueFiles是否正确
                    if(typeof(valueFiles) == "object"){
                        if(!$.isArray(valueFiles)){
                            valueFiles = [valueFiles];
                        }
                    }else{
                        if(valueFiles === ""){
                            valueFiles = [];
                        }else{
                            console.error('upload组件value值设置错误');
                            console.error(config);
                            return false;
                        }
                    }
                    if(!config.isMultiple && valueFiles.length > 1){
                        console.error('upload组件valueFiles值设置错误');
                        console.error(config);
                        return false;
                    }
                    var sourceValueFiles = config.valueFiles;
                    config.valueFiles = valueFiles;
                    var isChange = _this.getValIsChange(config.valueFiles, sourceValueFiles, config);
                    if(isChange){
                        __this.change();
                    }
                },
                // 设置value
                setValue:function(value){
                    var __this = this;
                    if(typeof(value)!="string" || value === ''){
                        return;
                    }
                    _this.getFileByIds(value, config, function(files, plusData){
                        // value是否正确
                        if(typeof(files) == "object"){
                            if(!$.isArray(files)){
                                files = [files];
                            }
                        }else{
                            if(files === ""){
                                files = [];
                            }else{
                                console.error('upload组件value值设置错误');
                                console.error(config);
                                return false;
                            }
                        }
                        if(!config.isMultiple && files.length > 1){
                            console.error('upload组件value值设置错误');
                            console.error(config);
                            return false;
                        }
                        var sourceValueFiles = config.valueFiles;
                        config.valueFiles = files;
                        var isChange = _this.getValIsChange(config.valueFiles, sourceValueFiles, config);
                        if(isChange){
                            __this.change();
                        }
                    })
                },
                focus: function(){},
                inputEnter: function(){},
                // 设置失去焦点
                blurHandler: function(){},
                // 失去焦点
                blur: function(){},
                // 改变完成 在表格中用到 表单中没有用
                changeComplete : function(){
                },
                // 改变 change
                change: function(){
                    var __this = this;
                    var showStr = '';
                    var valueFiles = config.valueFiles;
                    if(config.isMultiple){
                        showStr = valueFiles.length > 0 ? valueFiles.length + '个附件' : '';
                        // for(){}
                    }else{
                        if(valueFiles.length == 1){
                            showStr = valueFiles[0][config.textField];
                        }
                    }
                    var value = __this.getValue(false);
                    __this.showStr = showStr;
                    var obj = {
                        id:config.id,
                        text:showStr,
                        value:value,
                        valueFiles:valueFiles,
                        config:config,
                        vueConfig:__this,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                    __this.changeComplete();
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted: function(){
                var __this = this;
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
                this.initComplete();
            }
        }
        return component;
    },
}

// 多值输入
NetstarComponent.cubesInput = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            content : '<div class="" :disabled="disabled" :id="id" :class="inputClass" :style="styleObject">'
                        + '<div class="pt-cubesinput-table-panel" :id="cubesinputTablePanelId"></div>'
                    + '</div>',
        },
        MOBILE:{},
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        100,            // 输入框宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 显示类型 默认form table/staticData
            hidden:             false,          // 是否隐藏

            valField :          'valueList',
            rowField :          'rowList',
            colField :          'colList',
            keyField :          'stdValue',
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(!(typeof(config.saveAjax) == "object" && typeof(config.saveAjax.url) == "string")){
            config.disabled = true;
        }
        if(config.readonly == true){
            config.disabled = true;
        }
        config.getAjax.type = typeof(config.getAjax.method)=='string'?config.getAjax.method:'GET';
        config.getAjax.data = typeof(config.getAjax.data)!='undefined'?config.getAjax.data:{};
        config.getAjax.dataSrc = typeof(config.getAjax.dataSrc)!='undefined'?config.getAjax.dataSrc:'';
        config.getAjax.contentType = typeof(config.getAjax.contentType)!='undefined'?config.getAjax.contentType:'';
        if(!config.disabled){
            config.saveAjax.type = typeof(config.saveAjax.method)=='string'?config.saveAjax.method:'GET';
            config.saveAjax.data = typeof(config.saveAjax.data)!='undefined'?config.saveAjax.data:{};
            config.saveAjax.dataSrc = typeof(config.saveAjax.dataSrc)!='undefined'?config.saveAjax.dataSrc:'';
            config.saveAjax.contentType = typeof(config.saveAjax.contentType)!='undefined'?config.saveAjax.contentType:'';
        }
    },
    // 验证配置是否正确
    validatConfig: function(config){
        var isVali = true;
        if(typeof(config.getAjax) == "object" && typeof(config.getAjax.url) == "string"){}else{
            isVali = false;
        }
        return isVali;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var contentHtml = tempalte.content;   // input模板
                // contentHtml += '<div :class="stateClass" ref="validate">{{validatInfo}}</div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        data.isOneDimensional = false; // 是否一维 不存在了
        data.inputText = "编辑";
        // if(typeof(config.value) == "object"){
        //     if($.isArray(config.value[config.valField]) && config.value[config.valField].length == 1){
        //         data.isOneDimensional = true;
        //         data.inputText = config.value[config.valField][0].value;
        //     }
        // }
        data.cubesinputTablePanelId = data.id + '-table-panel';
        data.ajaxLoading = true;
        return data;
    },
    inputEnter: function(config, vueComponent){
        NetstarComponent.setNextComponentFocus(config, vueComponent);
    },
    // 验证value
    validatValue: function(_value, _rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 获取组件配置
    getComponentConfig: function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                data.btns = config.btns;
                return data;
            },
            watch: {
                ajaxLoading: function(value, oldValue){
                    if(value){
                        this.getData();
                    }
                },
            },
            methods: {
                getData : function(){
                    var ajaxConfig = $.extend(true, {}, config.getAjax);
                    ajaxConfig.plusData = {
                        configId : config.id,
                        formId : config.formID
                    } 
                    var components = NetstarComponent.config[config.formID].config;
                    var data = NetstarComponent.commonFunc.getFormDataByComponent(config, components, 'getAjax');
                    console.log(data);
                    ajaxConfig.data = data;
                    NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                        if(res.success){
                            var configId = _ajaxConfig.plusData.configId;
                            var formId = _ajaxConfig.plusData.formId;
                            var _config = NetstarComponent.config[formId].config[configId];
                            var _vueConfig = NetstarComponent.config[formId].vueConfig[configId];
                            var dataSrc = _ajaxConfig.dataSrc;
                            var data = typeof(dataSrc) == "string" && dataSrc.length > 0 ? res[dataSrc] : res;
                            if(typeof(data) == "object" && typeof(data[_config.keyField]) == "string"){
                                data = JSON.parse(data[_config.keyField]);
                            }
                            _vueConfig.ajaxLoading = false;
                            var cubesinputTablePanelId = _vueConfig.cubesinputTablePanelId;
                            var cubesInputConfig = {
                                type : 'common',
                                isSave : true,
                                id : cubesinputTablePanelId,
                                confirmHandler : function(resData, _cubesInputConfig){
                                    var saveAjax = $.extend(true, {}, _config.saveAjax);
                                    // saveAjax.data = resData;
                                    var saveData = {};
                                    saveData[_config.keyField] = JSON.stringify(resData);
                                    var _components = NetstarComponent.config[_config.formID].config;
                                    var _data = NetstarComponent.commonFunc.getFormDataByComponent(_config, _components, 'saveAjax');
                                    if(_data){
                                        for(var key in _data){
                                            saveData[key] = _data[key];
                                        }
                                    }
                                    saveAjax.data = saveData;
                                    console.log(resData);
                                    NetStarUtils.ajax(saveAjax, function(res, _ajaxConfig){
                                        if(res.success){
                                            nsAlert('保存成功');
                                        }
                                    })
                                }
                            };
                            NetstarCubesInput.init(cubesInputConfig, data);
                        }
                    });
                },
                getSaveData : function(){
                    var cubesinputTablePanelId = this.cubesinputTablePanelId;
                    var saveData = NetstarCubesInput.getSaveData(cubesinputTablePanelId);
                    if(typeof(saveData) == "object"){
                        saveData = JSON.stringify(saveData);
                    }else{
                        saveData = '';
                    }
                    return saveData;
                },
                // 回车
                inputEnter:function(){
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules, 'object', config);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var value = this.getSaveData();
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var sourceValue = config.value;
                    // this.value = value;
                    config.value = value;
                    this.inputText = value;
                    var isSame = true;
                    // 判断是否改变
                    if(sourceValue != value){
                        isSame = false;
                    }
                    if(!isSame){
                        this.change();
                    }
                },
                // 获得焦点
                focus: function(){
                    if(this.isOneDimensional){
                        this.$refs.inputName.focus();
                    }
                },
                // 设置失去焦点
                blurHandler: function(){
                    this.getValue();
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                },
                // 失去焦点
                blur: function(){
                    if(this.isOneDimensional){
                        this.$refs.inputName.blur();
                    }
                },
                // 改变 change
                change: function(){
                    var text = this.inputText;
                    var value = config.value;
                    var vueConfig = this;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted : function(){
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
                if(this.ajaxLoading){
                    this.getData();
                }
            },
        }
        return component;
    },
}

// 标准值输入
NetstarComponent.standardInput = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            content : '<div class="" :disabled="disabled" :id="id" :class="inputClass" :style="styleObject">'
                        + '<div class="pt-cubesinput-table-panel" :id="standardTablePanelId"></div>'
                    + '</div>',
        },
        MOBILE:{},
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        100,            // 输入框宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 显示类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(!(typeof(config.saveAjax) == "object" && typeof(config.saveAjax.url) == "string")){
            config.disabled = true;
        }
        if(config.readonly == true){
            config.disabled = true;
        }
        config.ajax.type = typeof(config.ajax.method)=='string'?config.ajax.method:'GET';
        config.ajax.data = typeof(config.ajax.data)!='undefined'?config.ajax.data:{};
        config.ajax.dataSrc = typeof(config.ajax.dataSrc)!='undefined'?config.ajax.dataSrc:'';
        config.ajax.contentType = typeof(config.ajax.contentType)!='undefined'?config.ajax.contentType:'';
        config.subDataAjax.type = typeof(config.subDataAjax.method)=='string'?config.subDataAjax.method:'GET';
        config.subDataAjax.data = typeof(config.subDataAjax.data)!='undefined'?config.subDataAjax.data:{};
        config.subDataAjax.dataSrc = typeof(config.subDataAjax.dataSrc)!='undefined'?config.subDataAjax.dataSrc:'';
        config.subDataAjax.contentType = typeof(config.subDataAjax.contentType)!='undefined'?config.subDataAjax.contentType:'';
    },
    // 验证配置是否正确
    validatConfig: function(config){
        var isVali = true;
        if(typeof(config.ajax) == "object" && typeof(config.ajax.url) == "string"){}else{
            isVali = false;
        }
        if(typeof(config.subDataAjax) == "object" && typeof(config.subDataAjax.url) == "string"){}else{
            isVali = false;
        }
        return isVali;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var contentHtml = tempalte.content;   // input模板
                // contentHtml += '<div :class="stateClass" ref="validate">{{validatInfo}}</div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        data.standardTablePanelId = data.id + '-table-panel';
        data.ajaxLoading = true;
        return data;
    },
    inputEnter: function(config, vueComponent){
        NetstarComponent.setNextComponentFocus(config, vueComponent);
    },
    // 验证value
    validatValue: function(_value, _rules, returnType){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isTrue,
            validatInfo : validatInfo,
        }
    },
    // 获取组件配置
    getComponentConfig: function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch: {
                ajaxLoading: function(value, oldValue){
                    if(value){
                        this.getData();
                    }
                },
            },
            methods: {
                getData : function(){
                    var standardTablePanelId = this.standardTablePanelId;
                    var standardConfig = {
                        type : 'common',
                        isSave : false,
                        id : standardTablePanelId,
                        ajax : config.ajax,
                        subDataAjax : config.subDataAjax,
                        attrValueField:config.attrValueField,
                        attrTextField:config.attrTextField,
                        confirmHandler : function(resData, _standardConfig){
                            console.log(resData);
                        }
                    };
                    NetstarStandardInput.init(standardConfig);
                },
                getSaveData : function(){
                    var standardTablePanelId = this.standardTablePanelId;
                    var saveData = NetstarStandardInput.getSaveData(standardTablePanelId);
                    if(typeof(saveData) == "object"){
                        saveData = JSON.stringify(saveData);
                    }else{
                        saveData = '';
                    }
                    return saveData;
                },
                // 回车
                inputEnter:function(){
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules, 'object', config);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var value = this.getSaveData();
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var sourceValue = config.value;
                    // this.value = value;
                    config.value = value;
                    this.inputText = value;
                    var isSame = true;
                    // 判断是否改变
                    if(sourceValue != value){
                        isSame = false;
                    }
                    if(!isSame){
                        this.change();
                    }
                },
                // 获得焦点
                focus: function(){
                },
                // 设置失去焦点
                blurHandler: function(){
                    this.getValue();
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                },
                // 失去焦点
                blur: function(){
                },
                // 改变 change
                change: function(){
                    var text = this.inputText;
                    var value = config.value;
                    var vueConfig = this;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted : function(){
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
                if(this.ajaxLoading){
                    this.getData();
                }
            },
        }
        return component;
    },
}

// 下拉选择输入列表
NetstarComponent.listSelectInput = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            panel:'<div class="pt-listselectinput" :disabled="disabled" :id="id" :class="inputClass" :style="styleObject"></div>',
        },
        MOBILE:{
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        100,            // 输入框宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 显示类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
            // 列表配置参数
            idField :           'id',           // id字段
            idValField :        'idValue',      // id字段显示的value
            labelField :        'label',        // id字段显示的label
            nameField :         "name",         // name字段
            nameValField :      'nameValue',    // name字段显示的value
            urlField :          'url',          // url字段
            // 下拉框配置参数
            textField :         'text',         // 
            valueField :        'value',        // 
            // 显示配置
            lineNum :           2,              // 每行显示几对组件
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        if(typeof(config.ajaxConfig)!='object'&&typeof(config.url)=='string'){
            config.ajaxConfig = {};
            config.ajaxConfig.url = config.url;
            config.ajaxConfig.type = typeof(config.method)=='string'?config.method:'GET';
            config.ajaxConfig.data = typeof(config.data)!='undefined'?config.data:{};
            config.ajaxConfig.dataSrc = typeof(config.dataSrc)!='undefined'?config.dataSrc:'';
            config.ajaxConfig.contentType = typeof(config.contentType)!='undefined'?config.contentType:'';
        }
        if(typeof(config.selectAjax)!='object'&&typeof(config.selectUrl)=='string'){
            config.selectAjax = {};
            config.selectAjax.url = config.selectUrl;
            config.selectAjax.type = typeof(config.selectMethod)=='string'?config.selectMethod:'GET';
            config.selectAjax.data = typeof(config.selectData)!='undefined'?config.selectData:{};
            config.selectAjax.dataSrc = typeof(config.selectDataSrc)!='undefined'?config.selectDataSrc:'';
            config.selectAjax.contentType = typeof(config.selectContentType)!='undefined'?config.selectContentType:'';
        }
    },
    // 验证配置是否正确
    validatConfig: function(config){
        var isVali = true;
        if(typeof(config.ajaxConfig)!='object'&&typeof(config.url)!='string'){
            isVali = false;
        }
        if(typeof(config.selectAjax)!='object'&&typeof(config.selectUrl)!='string'){
            isVali = false;
        }
        return isVali;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                containerHtml = tempalte.panel;
                break;
            case 'staticData':
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        return data;
    },
    inputEnter: function(config, vueComponent){
        // NetstarComponent.setNextComponentFocus(config, vueComponent);
    },
    // 验证value
    validatValue: function(_value, _rules, returnType, config){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var validatInfo = '';
        switch(_rules){
            case 'required':
                if(value === '' || ($.isArray(value)&&value.length==0)){
                    isTrue = false;
                    validatInfo = NetstarComponent.validateMsg[rules];
                }
                break;
        }
        if(returnType == "boolean"){
            return isTrue;
        }
        return {
            isTrue : isPass,
            validatInfo: validatInfo,
        };
    },
    setFormByList : function(list, config){
        // url
        var urlField = config.urlField;
        // id
        var idField = config.idField;
        var idValField = config.idValField;
        var labelField = config.labelField;
        // name
        var nameField = config.nameField;
        var nameValField = config.nameValField;
        // select
        var textField = config.textField;
        var valueField = config.valueField;
        // 显示宽度
        var defaultComponentWidth = 1/(config.lineNum*2) * 100 + '%';
        // 组件数组
        var formArr = [];
        for(var i=0; i<list.length; i++){
            var data = list[i];
            var selectAjaxConfig = $.extend(true, {}, config.selectAjax);
            selectAjaxConfig.url += data[urlField];
            // id
            var idComponent = {
                id : data[idField],
                type : "select",
                label : data[labelField],
                ajaxConfig : selectAjaxConfig,
                textField : textField,
                valueField : valueField,
                value : data[idValField],
                plusConfig : {
                    isStart : true,
                    config : config,
                    data : data,
                },
                changeHandler : function(obj){
                    var thisConfig = obj.config;
                    if(thisConfig.plusConfig.isStart){
                        thisConfig.plusConfig.isStart = false;
                        return;
                    }
                    var formID = thisConfig.formID;
                    var relationId = thisConfig.plusConfig.data[config.nameField];
                    var edit = {
                        id : relationId,
                        value : obj.text,
                    }
                    NetstarComponent.editComponents([edit], formID);
                }
            }
            var nameComponent = {
                id : data[nameField],
                type : "text",
                // label : data[nameLabelField],
                value : data[nameValField],
            }
            formArr.push(idComponent);
            formArr.push(nameComponent);
        }
        var formConfig = {
            id : config.fullID,
            isSetMore : false,
            templateName: 'form',
            componentTemplateName: 'PC',
            defaultComponentWidth : defaultComponentWidth,
            form : formArr,
        }
        
        var component = NetstarComponent.formComponent.getFormConfig(formConfig);
        NetstarComponent.formComponent.init(component, formConfig);
    },
    // 通过表单设置的数据获取value
    getValueByValData : function(data, config){
        var list = config.list;
        // id
        var idField = config.idField;
        var idValField = config.idValField;
        // name
        var nameField = config.nameField;
        var nameValField = config.nameValField;
        for(var i=0; i<list.length; i++){
            var obj = list[i];
            obj[idValField] = data[obj[idField]];
            obj[nameValField] = data[obj[nameField]];
        }
        return list;
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                return data;
            },
            watch:{
                ajaxLoading:function(value,oldValue){
                    if(value){
                        this.ajax();
                    }
                },
            },
            methods: {
                ajax: function(){
                    var __this = this;
                    var components = NetstarComponent.config[config.formID].config;
                    var data = NetstarComponent.commonFunc.getFormDataByComponent(config, components, 'ajaxConfig');
                    var ajaxConfig = {
                        url:        config.ajaxConfig.url,	
                        data:       data,
                        type:       config.ajaxConfig.type,
                        contentType:config.ajaxConfig.contentType,
                        plusData:   {
                            componentId : config.id,
                            formID : config.formID,
                        },
                    }
                    NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                        if(res.success){
                            var plusData = _ajaxConfig.plusData;
                            var componentId = plusData.componentId;
                            var formID = plusData.formID;
                            var component = NetstarComponent.config[formID].config[componentId];
                            var vueComponent = NetstarComponent.config[formID].vueConfig[componentId];
                            vueComponent.ajaxLoading = false;
                            var data = res[component.ajaxConfig.dataSrc];
                            component.sourceList = $.extend(true, [], data);
                            component.list = data;
                            NetstarComponent.listSelectInput.setFormByList(data, component);
                        }else{
                            // 获取树失败
                        }
                    });
                },
                // 回车
                inputEnter:function(){
                    _this.inputEnter(config, this);
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules, 'object', config);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var fullID = config.fullID;
                    var valueData = NetstarComponent.getValues(fullID, false);
                    var value = _this.getValueByValData(valueData, config);
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    // var sourceValue = config.value;
                    // // this.value = value;
                    // config.value = value;
                    // this.inputText = value;
                    // var isSame = true;
                    // // 判断是否改变
                    // if(sourceValue != value){
                    //     isSame = false;
                    // }
                    // if(!isSame){
                    //     this.change();
                    // }
                },
                // 设置焦点
                focusHandler: function(ev){
                    $(ev.target).select();
                    config.sourceValue = $(ev.target).val();
                    if(this.inputText.length > 0){
                        this.ishide = false;
                    }
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    if(this.isnotblur){
                        return;
                    }
                    this.getValue();
                    this.ishide = true;
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                    // if(typeof(config.blurHandler)=='function'){
                    //     config.blurHandler(_config, this);
                    // }
                },
                // 失去焦点
                blur: function(){
                    this.$refs.inputName.blur();
                },
                // 改变 change
                change: function(){
                    // value和inputText同时变化 
                    // 原因：input上存的值是inputText所以改变input的输入时value不会改变所以在这里改
                    this.inputText = typeof(this.inputText)=="number"?this.inputText.toString():this.inputText;
                    var vueConfig = this;
                    var text = this.inputText;
                    config.value = text;
                    var value = config.value;
                    var obj = {
                        id:config.id,
                        text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted : function(){
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
                this.ajax();
            },
        }
        return component;
    },
}

// password
NetstarComponent.password = {
	VERSION: '0.1.0', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="password" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
            buttonClear:'<button class="pt-btn pt-btn-default pt-btn-icon pt-input-clear">'
                            +'<i class="icon-close"></i>'
                        + '</button>',
            button:'<button class="pt-btn pt-btn-default" v-for="btn in btns" v-on:click="btn.handler">'
                        + '{{btn.name}}'
                    + '</button>',
        },
        MOBILE:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            // inputWidth :        100,            // 输入框宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 显示类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
            isHasClose:         true,          // 是否存在清空按钮
            isMd5 :             true,           // 发送是否加密
		}
		nsVals.setDefaultValues(config, defaultConfig);
        if(config.formSource == 'staticData'){
            config.acts = config.acts ? config.acts : 'label';
        }
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        if(config.isMd5){
            config.value = '';
        }
    },
    // 验证配置是否正确
    validatConfig: function(config){
        var isVali = true;
        return isVali;
    },
    getHtml: function(config){
        // 模板格式
        var templateName = config.templateName;
        var tempalte = this.TEMPLATE[templateName];
        var contentHtml = '';
        var containerHtml = NetstarComponent.common.formComponent; // 容器模板
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                // 为每一部分添加事件属性
                // 为input和button添加事件
                // $input.attr('v-bind:style', '{width:inputWidth+"px"}');
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keyup.13', 'inputEnter');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                $input.attr('v-on:change', 'change');
                var inputHtml = $input.prop('outerHTML');   // input模板
                var buttonHtml = '';
                if(config.isHasClose){
                    var $button = $(tempalte.buttonClear);
                    $button.attr('v-on:click', 'btnClickClose');
                    $button.attr('v-on:mousedown', 'btnMouseDown');
                    $button.attr(':class','{hide:ishide}');
                    buttonHtml = $button.prop('outerHTML');
                }
                var btncontainer = NetstarComponent.common.btncontainer;
                var $btncontainer = $(btncontainer);
                $btncontainer.addClass('pt-input-group-btn-group');
                if($.isArray(config.btns)&&config.btns.length > 0){
                    var btnsHtml = tempalte.button;
                    buttonHtml += btnsHtml;
                    // 现在没有用 为了以后添加text按钮时用 按钮数量超过1时添加类名pt-input-group-btn-group
                    // if(config.isHasClose){
                    //     $btncontainer.addClass('pt-input-group-btn-group');
                    // }else{
                    //     if(config.btns.length > 1){
                    //         $btncontainer.addClass('pt-input-group-btn-group');
                    //     }
                    // }
                }
                btncontainer = $btncontainer.prop('outerHTML').replace('{{nscontainer}}', buttonHtml);

                contentHtml = inputHtml + btncontainer;   // input+button整体模板
                // contentHtml += '<div :class="stateClass" ref="validate">{{validatInfo}}</div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                contentHtml = NetstarComponent.getStaticTemplate(config);
                break;
        }
        containerHtml = containerHtml.replace('{{nscontainer}}',contentHtml);
        return containerHtml;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        return data;
    },
    inputEnter: function(config, vueComponent){
        NetstarComponent.setNextComponentFocus(config, vueComponent);
    },
    // 验证value
    validatValue: function(_value, _rules, returnType, config){
        /*
         * value : 表单的value值
         * ruleStr : rules的配置值 如 max=0 ；required
         * returnType : 返回验证结果
         */
        returnType = typeof(returnType)=="undefined" ? 'object' : returnType;
        var isTrue = true;
        var _validatInfo = '';
        function validateVal(value, __rules){
            var rules = __rules.split(' ');
            var isPass = true; // 是否合法
            var validatInfo = ''; // 错误信息
            for(var i=0; i<rules.length; i++){
                var ruleNameStr = rules[i];
                var formatRules = NetstarComponent.getFormatRules(ruleNameStr);
                var ruleName = formatRules.ruleName; // 规则名称
                var compareArr = formatRules.compareArr; // 若有 = 等号后边值 数组 没有比较值为空数组
                if(ruleName == 'required'){
                    if(value === "" || value === null){
                        isPass = false;
                        validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                    }
                }else{
                    if(value !== "" && value != null){
                        switch(ruleName){
                            case 'remote':
                                // ajax验证
                                break;
                            case 'ismobile':
                            case 'mobile':
                            case 'fax':
                                //手机号验证
                                regStr=/^(13[0-9]|14[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])\d{8}$/;
                                if(!regStr.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'isphone':
                            case 'phone':
                                //固定电话验证
                                regStr = /^((0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;//d*$;
                                if(!regStr.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'postalcode':
                                //邮政编码验证
                                regStr = /^[0-9]\d{5}$/;
                                if(!regStr.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'bankno':
                                //银行卡号验证
                                var isTrue = nsValid.bankno(value);
                                if(!isTrue){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'Icd':
                                //身份证号验证
                                var isTrue = nsValid.Icd(value);
                                if(!isTrue){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'positiveInteger':
                                //正整数验证
                                var g = /^[1-9]*[1-9][0-9]*$/;
                                if(!g.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'nonnegativeInteger':
                                //非负整数验证
                                var g = /^([1-9]\d*|[0]{1,1})$/;
                                if(!g.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'integer':
                                //整数验证
                                /*var reg = /^-?[1-9]*[1-9][0-9]*$/;*/
                                var reg = /^-?\d+$/;
                                if(!reg.test(value)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;	
                            case 'max':
                                var compareNum = compareArr[0];
                                if(!(Number(value) <= compareNum)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                                }
                                break;
                            case 'min':
                                var compareNum = compareArr[0];
                                if(!(compareNum <= Number(value))){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                                }
                                break;
                            case 'positive':
                                // 正数
                                if(!(Number(value) > 0)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'negative':
                                //负数验证
                                if(!(Number(value) <= 0)){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'range':
                                // 范围在 {0} 到 {1} 之间
                                if(!(Number(value)>=compareArr[0] && Number(value)<=compareArr[1])){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareArr[0],compareArr[1]);
                                }
                                break;
                            case 'precision':
                                var compareNum = compareArr[0];
                                // 小数 {0} 位
                                var isTrue = nsValid.precision(value,Number(compareNum));
                                if(!isTrue){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                                }
                                break;
                            case 'url':
                                // url
                                var reg = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
                                var isTrue = reg.test(value);
                                if(!isTrue){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'email':
                                //邮箱验证
                                var reg = /^([a-zA-Z0-9\._-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
                                var isTrue = reg.test(value);
                                if(!isTrue){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName] + ',';
                                }
                                break;
                            case 'minlength':
                                // 最少字符
                                var compareNum = compareArr[0];
                                if(compareNum > value.length){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                                }
                                break;
                            case 'maxlength':
                                // 最多字符
                                var compareNum = compareArr[0];
                                if(compareNum < value.length){
                                    isPass = false;
                                    validatInfo += NetstarComponent.validateMsg[ruleName](compareNum);
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            if(validatInfo.length > 0){
                var validatInfoArr = validatInfo.split('');
                if(validatInfoArr[validatInfoArr.length-1]==","){
                    validatInfo = validatInfo.substring(0, validatInfo.length-1);
                }
            }
            return {
                isTrue : isPass,
                validatInfo: validatInfo,
            };
        }
        var obj = validateVal(_value, _rules);
        if(typeof(_value)=="string"&&_value.length>0&&_rules.indexOf('remote')>-1 && typeof(config)=="object"){
            // 排重
            var isSendAjax = true;
            if(typeof(config.sourceValue)=="undefined"){
                isSendAjax = false;
            }else{
                if(config.sourceValue == _value){
                    isSendAjax = false;
                }
            }
            if(isSendAjax){
                var ajaxData = {};
                ajaxData[config.id] = _value;
                var ajaxConfig = {
                    url : config.remoteAjax,
                    type : 'POST',
                    data : ajaxData,
                    plusData : {
                        formID : config.formID,
                        componentId : config.id,
                    },
                }
                NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                    if(res.success){
                        var data = res.data;
                        if((data && data.validateResult) || !data){
                            return; 
                        }
                        var plusData = _ajaxConfig.plusData;
                        var form = NetstarComponent.config[plusData.formID];
                        if(typeof(form)!="object"){
                            return;
                        }
                        var vueComponent = form.vueConfig[plusData.componentId];
                        var component = form.config[plusData.componentId];
                        vueComponent.validatInfo = data.validateMsg;
                        var warnInfoStr = component.label + ':' + data.validateMsg;
                        vueComponent.focus();
                        // NetstarComponent.setComponentWarnInfoState(vueComponent, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(component, data.validateMsg);
                    }
                })
            }
            
        }
        if(returnType == "boolean"){
            isTrue = obj.isTrue;
            return isTrue;
        }
        return obj;
    },
    // 获取组件配置
    getComponentConfig:function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        _this.setConfig(config);
        var html = _this.getHtml(config);
        var component = {
            template: html,
            data: function(){
                var data = _this.getData(config);
                data.btns = config.btns;
                return data;
            },
            watch: {
                inputText:function(value, oldValue){
                    NetstarComponent.watchTemplateShowData(config, this, 'inputText');
                    if(value.length > 0){
                        this.ishide = false;
                    }else{
                        this.ishide = true;
                    }
                }
            },
            methods: {
                // 
                btnMouseDown: function(){
                    this.isnotblur = true;
                },
                // 点击清空
                btnClickClose: function(ev){
                    this.inputText = "";
                    this.change();
                    this.isnotblur = false;
                    this.focus();
                },
                // 回车
                inputEnter:function(){
                    _this.inputEnter(config, this);
                },
                // 验证value
                validatValue: function(value){
                    var rules = config.rules;
                    var validObj = _this.validatValue(value, rules, 'object', config);
                    var isTrue = validObj.isTrue;
                    var validatInfo = validObj.validatInfo;
                    if(!isTrue){
                        // this.validatInfo = validatInfo;
                        // var warnInfoStr = config.label + ':' + validatInfo;
                        // NetstarComponent.setComponentWarnInfoState(this, warnInfoStr);
                        NetstarComponent.setComponentWarnInfoState(config, validatInfo);
                    }
                    return isTrue;
                },
                // 获取value
                getValue:function(isValid){
                    // isValid : 是否需要验证 默认需要
                    isValid = typeof(isValid)=='boolean'?isValid:true;
                    var value = config.value;
                    if(config.isMd5){
                        value = hex_md5(value);
                    }
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    return value;
                },
                // 设置value
                setValue:function(value){
                    var sourceValue = config.value;
                    // this.value = value;
                    if(config.isMd5){
                        value = '';
                    }
                    config.value = value;
                    this.inputText = value;
                    var isSame = true;
                    // 判断是否改变
                    if(sourceValue != value){
                        isSame = false;
                    }
                    if(!isSame){
                        this.change();
                    }
                },
                // 设置焦点
                focusHandler: function(ev){
                    $(ev.target).select();
                    config.sourceValue = $(ev.target).val();
                    if(this.inputText.length > 0){
                        this.ishide = false;
                    }
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    if(this.isnotblur){
                        return;
                    }
                    this.getValue();
                    this.ishide = true;
                    // 判断是否执行blurHandler
                    NetstarComponent.formBlurHandler(config, this);
                },
                // 失去焦点
                blur: function(){
                    this.$refs.inputName.blur();
                },
                // 改变 change
                change: function(){
                    // value和inputText同时变化 
                    // 原因：input上存的值是inputText所以改变input的输入时value不会改变所以在这里改
                    this.inputText = typeof(this.inputText)=="number"?this.inputText.toString():this.inputText;
                    var vueConfig = this;
                    var text = this.inputText;
                    config.value = text;
                    var value = config.value;
                    if(config.isMd5){
                        value = hex_md5(value);
                    }
                    var obj = {
                        id:config.id,
                        // text:text,
                        value:value,
                        config:config,
                        vueConfig:vueConfig,
                    }
                    if(typeof(config.changeHandler)=='function'){
                        config.changeHandler(obj);
                    }
                    if(typeof(config.commonChangeHandler)=='function'){
                        config.commonChangeHandler(obj);
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this, config);
                }
            },
            mounted : function(){
                if(typeof(config.$validate)!="object"){
                    var validateDom = this.$refs.validate;
                    config.$validate = $(validateDom);
                }
            },
        }
        return component;
    },
}