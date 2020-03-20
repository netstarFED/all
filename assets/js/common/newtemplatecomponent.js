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
            + '<div class="" :class="containerClass">'
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
// 验证报错信息
NetstarComponent.validateMsg = {
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
	if(contentType){
		if(contentType == 'application/json' && typeof(ajaxConfig.data)=='object'){
			ajaxData = JSON.stringify(ajaxConfig.data);
		}
	}
	var ajaxType = contentType == 'application/json'?'POST':config.ajaxConfig.type;
	$.ajax({
		url: 		config.ajaxConfig.url,
		type: 		ajaxType,
		data: 		ajaxData,
		context: 	{
            config:config,
            vueConfig:vueConfig,
        }, //返回的this指向组件配置
		dataType: 	'json',
		success:function(res){
			var _config = this.config;
            var _vueConfig = this.vueConfig;
            
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
		},
		error:function(error){
			var _config = this.config;
			var _vueConfig = this.vueConfig;
			nsalert(language.common.nscomponent.part.radioAjaxError,'error');
			// 移除正在加载
			if(typeof(callbackFunc)=='function'){
				callbackFunc(_config, _vueConfig, false, error);
			}
			if(debugerMode){
				console.log(error);
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
    var value = parameter.value;
    var subdata = parameter.subdata;
    var isObjectValue = parameter.isObjectValue;
    var valueField = parameter.valueField;
    var type = parameter.type;
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
            data.inputTextURL = 'http://api.map.baidu.com/geocoder?address='+ encodeURIComponent(data.inputText)+'&output=html&src=webapp.baidu.openAPIdemo';
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
                data.inputTextURL = 'http://api.map.baidu.com/geocoder?address='+ encodeURIComponent(data[inputTextName])+'&output=html&src=webapp.baidu.openAPIdemo';
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
            vueComponent.inputTextURL = 'http://api.map.baidu.com/geocoder?address='+ encodeURIComponent(showData)+'&output=html&src=webapp.baidu.openAPIdemo';
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
    var formComponent = NetstarComponent.config[formID].vueConfig;
    if(typeof(formComponent)!='object'){
        // formID错误，表单不存在
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    isValid = typeof(isValid)=="boolean"?isValid:true;
    var isValidSuccess = true;
    var values = {};
    for(var componentId in formComponent){
        var value = formComponent[componentId].getValue(isValid);
        if(value === false){
            values = false;
            break;
        }
        values[componentId] = value;
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
        if(typeof(vueComponent)!='object'){
            console.error(editArr[i].id+'组件不存在');
            continue;
        }
        vueComponent.edit(editArr[i]);
    }
}
// 表单赋值
NetstarComponent.fillValues = function(values, formID){
    /**
     * values       object          value对象
     * formID       string          表单id 
     */
    var formComponent = NetstarComponent.config[formID].vueConfig;
    if(typeof(formComponent)!='object'){
        // formID错误，表单不存在
        console.error('formID:'+formID+'错误，该表单不存在');
        return false;
    }
    for(var idKey in values){
        var vueComponent = formComponent[idKey];
        if(vueComponent){
            vueComponent.setValue(values[idKey]);
        }
    }
}
// vue组件修改
NetstarComponent.editVueComponent = function(editObj, vueComponent){
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
                break;
            case 'readonly':
                vueComponent.disabled = editObj[editKey];
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
    if(config.type != 'hidden'){
        formgroupClass += config.rules == 'required'?'pt-form-required':''; // 规则现在只有必填
    }
    // 组件内容（input）容器类名
    var containerClass = 'pt-'+config.type;
    if(config.disabled == true){
        containerClass += ' disabled';
    }
    // input 添加 input-group
    if( config.type == 'business'||
        config.type == 'text'||
        config.type == 'number'||
        config.type == 'date'
    ){
        if(config.formSource != 'staticData'){
            containerClass += ' pt-input-group';
        }
    }
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
            var inputText = '';
            var isSet = false;
            if($.isArray(config.value) && config.value.length==1){
                isSet = true;
                inputText = config.value[0][config.textField];
            }
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
        case 'number':
        case 'textarea':
            data.inputText = config.value;
            break;
        case 'date':
            config.value = typeof(config.value)=='number'?moment(config.value).format(config.format):'';
            data.inputText = config.value;
            break;
        case 'radio':
        case 'checkbox':
        case 'select':
            // 选项
            data.subdata = config.subdata;
            if(config.type == "select"){
                data.subdata = NetstarComponent.select.getSubdata(config);
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
                        inputText = inputText.split(',');
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
                data.ajaxConfig = config.ajaxConfig;
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
    }  
    if(config.type!='hidden'){
        if(config.formSource == 'staticData'){
            NetstarComponent.setStaticTemplateData(config, data);
        }
    }
    return data;
}
// 设置组件警告信息和状态
NetstarComponent.setComponentWarnInfoState = function(vueComponent){
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

// 表单配置
NetstarComponent.formComponent = {
    ver : '18.11.29', // 版本号
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
		}
		nsVals.setDefaultValues(config, defaultConfig);
    },
    // 设置config
    setConfig: function(config){
        if(config.readonly == true){
            config.disabled = true;
        }
        // form的id
        config.fullID = 'form-' + config.id;
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
                _componentConfig.hidden == true ||  			    //隐藏不能支持
                _componentConfig.readonly == true ||  			    //只读不能支持
                _componentConfig.disabled == true ||  			    //disable
                typeof(_componentConfig.id)=='undefined' || 		//压根没id的
                _componentConfig.formSource=='staticData'        	//静态数据
            ){
                return false;
            }
            //上述两个条件都不满足则可以支持
            AllowEnterSwitchArr.push(_componentConfig);
            return true;
        }
		var formArr = [];  // 支持回车切换的组件数组 
		for(var i=0;i<form.length;i++){
			setAllowEnterSwitchArr(form[i], formArr)
		}
		for(var i=0; i<formArr.length-1; i++){
			if(!formArr[i].enterFocusField){
				//如果不是最后，则是数组中的下一个字段
				formArr[i].enterFocusField = formArr[i+1].id;
			}
		}
        // 最后一个失去焦点认为整个表单完成输入（失去焦点）回调 表单的blurHandler
        if(typeof(config.blurHandler)=='function'){
            formArr[formArr.length-1].blurHandler = config.blurHandler;
        }
        // 设置模式
        var formSource = config.formSource;
        for(var i=0;i<form.length;i++){
            if(typeof(form[i].formSource)!='string'){
                form[i].formSource = formSource;
            }
        }
        var rex = /^([0-9]*)%$/;  // number + %
        // 根据defaultComponentWidth设置表单组件宽度
        if(typeof(config.defaultComponentWidth)=="string"){
            if(rex.test(config.defaultComponentWidth)){
                for(var i=0;i<form.length;i++){
                    if(typeof(form[i].width)=='string'&&rex.test(form[i].width)){
                    }else{
                        form[i].width = config.defaultComponentWidth;
                    }
                }
                config.formStyle += ' pt-form-vertical';
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
                if(form[i].type!="hidden"&&form[i].hidden!=true){
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
                if(moreBtnWidth===0){
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
            isValid = false;
        }
        for(var comI=0;comI<form.length;comI++){
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
        }
        return isValid;
    },
    getHtml: function(config){
        // 生成 表单组件 组件标签是根据id生成的
        var form = config.form;
        var components = '';
        var componentsmore = '';
        for(var comI=0;comI<form.length;comI++){
            var componentId = 'form-'+config.id+'-'+form[comI].id;
            componentId = componentId.toLocaleLowerCase();
            if(form[comI].mindjetFieldPosition == "field-more"){
                componentsmore += '<' + componentId + '></' + componentId + '>';
            }else{
                components += '<' + componentId + '></' + componentId + '>';
            }
        }
        if(config.formSource!="staticData" && config.isSetMore==true){
            components += '<form-' + config.id + '-field-more></form-' + config.id + '-field-more>';
        }
        var componentsContent = '<div class="field" ns-type="field">'+components+'</div>'+'<div class="field-more hide" ns-type="field-more">'+componentsmore+'</div>';
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
    getComponentConfig: function(config){
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
            // 根据类型获得组件配置
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
        var storeData = store.get(config.id);
        var sourceData = $.extend(true,[],NetstarComponent.config[config.id].source.array);
        if(typeof(storeData)!="object"){
            return sourceData;
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
    // 获取表单配置
    getFormConfig: function(config){
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        if(typeof(NetstarComponent.form[config.id])=="undefined"){
            NetstarComponent.form[config.id] = {};
        }
        // 保存表单原始值
        if(typeof(NetstarComponent.form[config.id].source)=="undefined"){
            NetstarComponent.form[config.id].source = $.extend(true,{},config);
        }
        if(typeof(NetstarComponent.config[config.id])=="undefined"){
            NetstarComponent.config[config.id] = {};
        }
        // 保存组件原始值
        if(typeof(NetstarComponent.config[config.id].source)=="undefined"){
            NetstarComponent.config[config.id].source = {
                obj : _this.getComponentSourceConfig(config),
                array : $.extend(true, [], config.form),
            };
        }
        config.form = _this.getConfigByStore(config);
        _this.setConfig(config);
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
    init:function(components, config){
        /**
         * components 表单vue配置
         *  form ： 表单容器vue
         *  component ： 组件vue
         * config 表单配置
        */
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
                    var _this = this;
                    if(typeof(config.completeHandler)=="function"){
                        var obj = {
                            config : config,
                            component : _this,
                            form : NetstarComponent.form[id].vueConfig,
                        }
                        config.completeHandler(obj);
                    }
                }
            })
            var $children = NetstarComponent.data.component[id].$children;
            NetstarComponent.config[id].vueConfig = {};
            for(var i=0;i<$children.length;i++){
                if(!$children[i].isMoreBtn){
                    // 不是更多按钮组件
                    NetstarComponent.config[id].vueConfig[$children[i].sourceId] = $children[i];
                }
            }
        },10);

    },
    refresh:function(config){
        $('#'+config.id).children().remove();
        // 通过id查找原始的form配置
        var sourceFormConfig = $.extend(true,{},NetstarComponent.form[config.id].source);
        var component = NetstarComponent.formComponent.getFormConfig(sourceFormConfig);
        NetstarComponent.formComponent.init(component, sourceFormConfig);
    },
}
NetstarComponent.dialogComponent = {
    VERSION: '18.11.29', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:
            {
                panel:  '<div class="pt-modal">'
                            + '<div class="pt-container">'
                                + '<div class="pt-modal-content" :id="id" :style="styleObject">'
                                    + '<div class="pt-modal-header" v-on:mousedown="mousedownmove($event)">'
                                        + '<div class="pt-title">'
                                            + '<h4>{{title}}</h4>'
                                        + '</div>'
                                        + '<div class="pt-close">'
                                            + '<button type="button" class="pt-btn pt-btn-icon pt-btn-circle" v-on:click="close">'
                                                + '<i class="icon-close"></i>'
                                            + '</button>'
                                        + '</div>' 
                                    + '</div>'
                                    + '<div class="pt-modal-body" :id="bodyId">'
                                    + '</div>'
                                    + '<div class="pt-modal-footer text-right" :id="footerId">'
                                        + '<div class="pt-window-control" v-on:mousedown="mousedown($event)"></div>'
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
        var rex2 = /^([0-9]*)%$/;  // number + %
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
        if(typeof(config.width)=='string'){
            config.width = getnumber(config.width,'width');
        }
        if(typeof(config.height)=='string'){
            config.height = getnumber(config.height,'height');
        }
        config.dialogId = 'dialog-' + config.id;
        config.bodyId = 'dialog-' + config.id + '-body';
        config.footerId = 'dialog-' + config.id + '-footer';
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
            footerIdGroup : config.footerIdGroup,
            modalbgStyle : {},
        }
        if(typeof(config.width)=="number"){
            data.styleObject.width = config.width + 'px';
        }
        if(typeof(config.height)=="number"){
            data.styleObject.height = config.height + 'px';
        }
        var $ptModal = $('[ns-type="pt-modal"]');
        var maxIndex = 0;
        var iIndex = -1;
        for(var i=0;i<$ptModal.length;i++){
            var nsIndex = Number($ptModal.eq(i).attr('ns-index'));
            var nsTop = $ptModal.eq(i).attr('ns-top');
            if(nsIndex>maxIndex && nsTop!='true'){
                maxIndex = nsIndex;
                iIndex= i;
            }
        }
        if(iIndex>-1){
            var maxZIndex = Number($ptModal.eq(iIndex).find('.pt-modal-content').css('z-index'));
            if(!isNaN(maxZIndex)){
                data.modalbgStyle['z-index'] = maxZIndex+1;
                data.styleObject['z-index'] = maxZIndex+2;
            }
        }
        return data;
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
                    config.shownHandler(obj);
                    // 计算弹框body高度
                    this.setDialogBodyHeight();
                }
            },
            methods: {
                setDialogBodyHeight: function(){
                    NetstarComponent.morebtn.setDialogBodyHeight(config.id);
                },
                // 点击鼠标 拖拽移动
                mousedownmove: function(ev){
                    // 按下鼠标容器
                    var $this = $(ev.target);
                    // 按下鼠标鼠标位置
                    var pageX = ev.pageX;
                    var pageY = ev.pageY;
                    // 弹框容器
                    var $container = $('#'+this.id);
                    // 弹框禁止选中
                    $container.addClass('text-no-select');
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
                        if(top < 0){
                            isOutWindowHeight = true;
                        }
                        if((top+dialogHeight) > windowHeight){
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
                    var offsetTop = offset.top;
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
                        config.hideHandler(obj);
                    }
                    $('#'+config.id+'nsdialog-container').remove();
                    // 关闭之后回调
                    if(typeof(config.hidenHandler)=='function'){
                        config.hidenHandler(obj);
                    }
                },
            }
        }
        return component;
    },
    init: function(config){
        if(typeof(NetstarComponent.dialog[config.id])=="undefined"){
            NetstarComponent.dialog[config.id] = {};
        }
        var _this = this;
        _this.setDefault(config);
        var isTrue = _this.validatConfig(config);
        if(!isTrue){
            return false;
        }
        if(typeof(NetstarComponent.dialog[config.id].source)=="undefined"){
            NetstarComponent.dialog[config.id].source = $.extend(true,{},config);
        }
        _this.setConfig(config);
        var vuedialogConfig = _this.getComponentConfig(config);
        var $ptModal = $('[ns-type="pt-modal"]');
        $ptModal.removeAttr('ns-top');
        $('body').append('<div id="'+config.id+'nsdialog-container" ns-type="pt-modal" ns-index="'+($ptModal.length+1)+'" ns-top="true"><nsdialog-container><nsdialog-container></div>');
        var vuedialog = new Vue({
            el: '#'+config.id+'nsdialog-container',
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
    VERSION: '18.11.29', //版本号
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
                    var sourceFormConfig = NetstarComponent.config[config.formID].source.array;
                    var vueTable = NetstarComponent.dialog[config.containerId].vueTable;
                    // 排序 field在前 field-more在后
                    var formArr = NetstarComponent.morebtn.getSortData(sourceFormConfig);
                    NetstarComponent.moretable.setTableNullData(formArr, "mindjetFieldPosition");
                    var formArrObj = NetstarComponent.morebtn.getSplitData(formArr);
                    var field = formArrObj.field;
                    var fieldMore = formArrObj.fieldMore;
                    vueTable.tableData = field;
                    vueTable.tableDataMore = fieldMore;
                },
                saveClose: function(){
                    // 通过表格vue组件获得表格数据
                    var vueTable = NetstarComponent.dialog[config.containerId].vueTable;
                    var tableData = vueTable.getTableData();
                    var tableDataObj = tableData.obj;
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
                    console.log(saveData);
                    store.set(config.formID, saveData);
                    nsAlert("保存成功","success");
                    NetstarComponent.dialog[config.containerId].vueConfig.close();
                    NetstarComponent.formComponent.refresh(NetstarComponent.form[config.formID].source);
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
	VERSION: '18.11.29', //版本号
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
                                    + '<li v-for="val in tableData" :class="val.class" :ns-position="val.position" :ns-id="val.id" :ns-type="val.type" draggable="true" v-on:dragstart="dragstart($event)" v-on:dblclick="dblclickSwitch($event)" v-on:click="clickSwitch($event)">'
                                        + '<span>{{val.index}}</span>'
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
        var vueComponentConfig = _this.getComponentConfig(config);
        $('#'+config.id).append('<table-panel></table-panel>');
        var vuePanel = new Vue({
            el: '#'+config.id,
            components:{
                "table-panel" : vueComponentConfig
            }
        });
        NetstarComponent.dialog[config.containerId].vueTable = vuePanel.$children[0];
    }
}
// 更多按钮
NetstarComponent.morebtn = {
	VERSION: '18.11.29', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            morebutton:  '<button class="pt-btn pt-btn-default" v-on:click="morecomponent($event)">'
                            + '更多'
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
        var $body = $containerDialog.children('.pt-modal-body');
        var bodyHeight = $containerDialog.outerHeight() - $header.outerHeight() - $footer.outerHeight();
        // var $tabHeader = $body.find('.pt-title');
        // var $tabBody = $body.find('.pt-list');
        // $tabBody.outerHeight(bodyHeight-$tabHeader.outerHeight());
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
                };
                if(typeof(config.moreBtnWidth)=='string'){
                    data.styleObject.width = config.moreBtnWidth;
                }
                return data;
            },
            methods: {
                // 控制更多组件显示隐藏
                morecomponent: function(ev){
                    var formContainerId = config.id;
                    var $moreContainer = $('#'+formContainerId).find('[ns-type="field-more"]');
                    if($moreContainer.children().length==0){
                        $moreContainer.addClass('hide');
                        return;
                    }
                    $moreContainer.toggleClass('hide');
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
                    if((offsetX+conWidth)>winWidth){
                        seatX = 'left';
                        left = offsetX-(conWidth-width);
                    }
                    if((offsetY+height+conHeight+marginTop)>winHeight){
                        seatY = 'top';
                        top = offsetY-conHeight;
                    }
                    var moreContainerOffset = {
                        left:left,
                        top:top,
                    }
                    $moreContainer.offset(moreContainerOffset);
                    $moreContainer.addClass(seatX + ' ' + seatY);
                },
                // 更多设置
                setform: function(ev){
                    var formContainerId = config.id;
                    var $moreContainer = $('#'+formContainerId).find('[ns-type="field-more"]');
                    $moreContainer.addClass('hide');
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
// 业务组件
NetstarComponent.business = {
	VERSION: '18.11.29', //版本号
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
        },
        MOBILE:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" v-model="inputText" ref="inputName" :id="id" />',
            button: '<button class="pt-btn pt-btn-white pt-btn-icon" :class="buttonClass">...</button>', 
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            inputWidth :        100,            // 输入框宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            formSource:         'form',         // 表单 staticData/table
            textField :         'name',         // 显示字段
            value :             '',             // value
            source :            {},             // 查询地址
            selectMode:         'radio',        // 单选 多选 不能选 radio checkbox noSelect
            infoBtnName:        '基本信息',      // 弹框 查看基本信息按钮 的显示文字
            dialogTitle:        '弹框标题',      // 弹框标题
            disabled:           false,          // 是否只读
            search:             {},             // 回车查询参数
            rules :             '',             // 规则
            hidden:             false,          // 是否隐藏
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
        if(typeof(config.inputWidth)=="string"){
            console.error('inputWidth必须是数字格式，否则设置默认值100');
            console.error(config);
            config.inputWidth = 100;
        }
        if(config.inputWidth<20){
            console.error('inputWidth的最小宽度是20，否则设置默认值100');
            console.error(config);
            config.inputWidth = 100;
        }
        config.source.type = typeof(config.source.type)=='string'?config.source.type:'GET';
        config.search.type = typeof(config.search.type)=='string'?config.search.type:'GET';
        if(($.isArray(config.value)&&config.value.length==1)||config.value===''){
        }else{
            if(typeof(config.value)=="object"){
                config.value = [config.value];
            }else{
                config.value = '';
            }
        }
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
                $input.attr('v-on:keyup.13', 'inputEnter');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                $input.attr('v-on:change', 'change');
                $button.attr('v-on:click', 'buttonClick');   // 按钮点击事件
                $button.attr('v-on:mousedown', 'mousedown');
                $button.attr('v-on:mouseup', 'mouseup');
                var inputHtml = $input.prop('outerHTML');   // input模板
                var buttonHtml = $button.prop('outerHTML'); // button模板
                var btncontainer = NetstarComponent.common.btncontainer;
                btncontainer = btncontainer.replace('{{nscontainer}}', buttonHtml);
                contentHtml = inputHtml + btncontainer;   // input+button整体模板
                contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
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
        var formgroupClass = config.rules == 'required'?config.rules:''; // 规则现在只有必填
        formgroupClass += ' '+ config.type;
        var containerClass = config.type;
        if(config.formSource != 'staticData'){
            containerClass += ' input-group';
        }
        var hiddenClass = '';
        if(config.hidden){
            hiddenClass = 'hide';
        }
        var inputText = '';
        if(config.value){
            inputText = typeof(config.value[config.textField])=='string'?config.value[config.textField]:'';
        }
        var labelClass = "";
        if(config.label == ""){
            labelClass = "hide";
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
            inputWidth:         config.inputWidth,      // input的宽度  用于设置input的宽度
            inputText:          inputText,              // input的显示值 用于获取和设置input的值
            stateClass:         '',                     // 验证信息状态 类名
            validatInfo:        '',                     // 验证信息
            disabled:           config.disabled,        // 是否只读
            isValidatValue:     true,                   // 失去焦点时是否需要验证value值 属性在按钮按下和松开时设置/弹框生成和移除时设置
            styleObject:{
                width:config.inputWidth+'px',
            },
            sourceId:           config.id,
        };
        if(config.formSource == 'staticData'){
            NetstarComponent.setStaticTemplateData(config, data);
        }
        return data;
    },
    dialog: {
        btnTemplate :   '<button class="pt-btn pt-btn-default">{{nsContainer}}</button>',
        // 获取按钮
        getBtnsTemplate:function(componentConfig){
            var i18n = NetstarComponent.business.I18N[languagePackage.userLang];
            var selectMode = componentConfig.selectMode;
            // 选中
            var selectTemplate = this.btnTemplate;
            selectTemplate = selectTemplate.replace('{{nsContainer}}', i18n.selected);
            var $selectTemplate = $(selectTemplate);
            $selectTemplate.attr('v-on:click', 'selected');
            selectTemplate = $selectTemplate.prop('outerHTML');
            //  选中并关闭
            var selectCloseTemplate = this.btnTemplate;
            selectCloseTemplate = selectCloseTemplate.replace('{{nsContainer}}', i18n.selectedClose);
            var $selectCloseTemplate = $(selectCloseTemplate);
            $selectCloseTemplate.attr('v-on:click', 'selectedclose');
            selectCloseTemplate = $selectCloseTemplate.prop('outerHTML');
            //  添加
            var addTemplate = this.btnTemplate;
            addTemplate = addTemplate.replace('{{nsContainer}}', i18n.add);
            var $addTemplate = $(addTemplate);
            $addTemplate.attr('v-on:click', 'add');
            addTemplate = $addTemplate.prop('outerHTML');
            //  查看基本信息
            var viewBaseInfoTemplate = this.btnTemplate;
            viewBaseInfoTemplate = viewBaseInfoTemplate.replace('{{nsContainer}}', componentConfig.infoBtnName);
            var $viewBaseInfoTemplate = $(viewBaseInfoTemplate);
            $viewBaseInfoTemplate.attr('v-on:click', 'query');
            viewBaseInfoTemplate = $viewBaseInfoTemplate.prop('outerHTML');
            //  关闭
            var closeTemplate = this.btnTemplate;
            closeTemplate = closeTemplate.replace('{{nsContainer}}', i18n.close);
            var $closeTemplate = $(closeTemplate);
            $closeTemplate.attr('v-on:click', 'close');
            closeTemplate = $closeTemplate.prop('outerHTML');

            var btnsTemplate = '';
            if(selectMode == 'checkbox'){
                btnsTemplate = selectTemplate + selectCloseTemplate + addTemplate + viewBaseInfoTemplate + closeTemplate;
            }else{
                btnsTemplate = selectTemplate + addTemplate + viewBaseInfoTemplate + closeTemplate;
            }
            var btncontainer = NetstarComponent.common.otherbtncontainer;
            btncontainer = btncontainer.replace("{{nscontainer}}", btnsTemplate);
            // return btnsTemplate;
            return btncontainer;
        },
        initBtnsAndShowPage : function(pageConfig, componentConfig, vueComponent, obj){
            /**
             * pageConfig 页面配置参数
             * componentConfig 业务组件配置参数、
             * vueComponent 业务组件vue配置
             * obj 弹框配置
             */
            var _this = this;
            var inputText = vueComponent.getInputText();
            var panelInitParams = {
                pageParam:                 {value:inputText},               // 传输参数 value：查询值 input的输入值
                config:                     pageConfig,                     // 模板配置 通过请求的页面拿到的
                componentConfig:{
                    container:              obj.config.bodyId,                         // 容器 （id或class）通过组件拿到（组件配置）
                    selectMode:             componentConfig.selectMode,     // 单选 多选 不能选 通过组件拿到（组件配置）
                    componentClass :        'list',                         // 组件类别 默认list
                    doubleClickHandler:     function(value){                // 显示弹框 传入的双击方法 （关闭弹框和刷新value/inputText）
                        console.log(value);
                        // 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
                        var vueComponentWorking = NetstarComponent.config[componentConfig.formID].vueConfig[componentConfig.id];
                        vueComponentWorking.setValue(value);
                        NetstarComponent.dialog[obj.config.id].vueConfig.close();
                        // 跳转到下一个字段
                        vueComponentWorking.jumpToNextField();
                    },
                },
            }
            var morePanel = NetstarTemplate.componentInit(panelInitParams);
            var btnsTemplate = _this.getBtnsTemplate(componentConfig);
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
                                var value = morePanel.selectHandler();
                                if(value){
                                    // 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
                                    var vueComponentWorking = NetstarComponent.config[componentConfig.formID].vueConfig[componentConfig.id];
                                    vueComponentWorking.setValue(value);
                                    if(componentConfig.selectMode=="radio"){
                                        NetstarComponent.dialog[obj.config.id].vueConfig.close();
                                        // 完成事件 表单：跳转到下一个字段
                                        vueComponentWorking.completeHandler('selected', panelInitParams);
                                    }else{
                                        // 完成事件 表单：跳转到下一个字段
                                        vueComponentWorking.completeHandler('selected', panelInitParams);
                                    }
                                }else{
                                    if(value === null){
                                        console.error('value设置错误');
                                        console.error(value);
                                    }
                                }
                            },
                            selectedclose : function(){
                                // 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
                                var vueComponentWorking = NetstarComponent.config[componentConfig.formID].vueConfig[componentConfig.id];
                                var value = morePanel.selectHandler();
                                vueComponentWorking.setValue(value);
                                NetstarComponent.dialog[obj.config.id].vueConfig.close();
                                // 完成事件 表单：跳转到下一个字段
                                vueComponentWorking.completeHandler('selectedclose', panelInitParams);
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
        init: function(pageConfig, componentConfig, vueComponent){
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
                height:500,
                shownHandler : function(obj){
                    _this.initBtnsAndShowPage(pageConfig, componentConfig, vueComponent, obj);
                },
                hidenHandler : function(obj){
                    if(NetstarComponent.business.$containerPage.length>0){
                        NetstarComponent.business.$containerPage.remove();
                    }
                    // 正在操作的Vue组件有可能不是 弹框初始化时的组件可能发生了变化
                    var vueComponentWorking = NetstarComponent.config[componentConfig.formID].vueConfig[componentConfig.id];
                    if(typeof(vueComponentWorking.closeHandler)=="function"){
                        var panelInitParams = {
                            pageParam:                 {value:inputText},               // 传输参数 value：查询值 input的输入值
                            config:                     pageConfig,                     // 模板配置 通过请求的页面拿到的
                            componentConfig:{
                                container:              obj.config.bodyId,              // 容器 （id或class）通过组件拿到（组件配置）
                                selectMode:             componentConfig.selectMode,     // 单选 多选 不能选 通过组件拿到（组件配置）
                                componentClass :        'list',                         // 组件类别 默认list
                            },
                        }
                        vueComponentWorking.closeHandler(panelInitParams);
                    }
                },
            }
            
            NetstarComponent.dialogComponent.init(dialogConfig);
        },
    },
    // 回车执行的查询ajax 回调查询后要执行的操作 如:表单中回车赋值或弹框
    // 写成单独方法的原因 表格调取组件时 回车重写 需要查询
    searchByEnter: function(config, vueConfig, callbackFunc){
        var search = config.search;
        var ajaxConfig = {
            url:search.url,
            type:search.type,
            context:{
                config:config,
                vueConfig:vueConfig,
                callbackFunc:callbackFunc,
            },
            cache:false,
            success:function(data){
                if(typeof(this.callbackFunc)=="function"){
                    this.callbackFunc(this, data);
                }
            }
        }
        $.ajax(ajaxConfig);
    },
    // 表单中enter执行方法
    inputEnter: function(config, vueConfig){
        this.searchByEnter(config, vueConfig, function(context, data){
            var _config = context.config;
            var _vueConfig = context.vueConfig;
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
                    NetstarComponent.business.buttonClick(_config, _vueConfig);
                }
            }else{
                NetstarComponent.business.buttonClick(_config, _vueConfig);
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
    showPageData:function(pageConfig, config){
        var _this = this;
        var vueConfig = NetstarComponent.config[config.formID].vueConfig[config.id];
        // var _config = NetstarComponent.config[config.formID].config[config.id];
        _this.dialog.init(pageConfig, config, vueConfig);
    },
    buttonClick: function(config, vueConfig){
        var ajaxConfig = {
            url:config.source.url,
            type:config.source.type,
            dataType:'text',
            context:{
                config:config,
                vueConfig:vueConfig
            },
            success:function(data){
                var _config = this.config;
                var _vueConfig = this.vueConfig;
                var _configStr = JSON.stringify(_config);
                var funcStr = 'NetstarComponent.business.showPageData(pageConfig, '+_configStr+')';
                var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
                var $container = nsPublic.getAppendContainer();
                var $containerPage = $(containerPage);
                NetstarComponent.business.$containerPage = $containerPage;
                $container.append($containerPage);
            }
        }
        $.ajax(ajaxConfig);
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
                // 关闭弹框后执行的方法 表单不需要 会删除掉
                closeHandler:function(obj){
                    console.warn('/*******关闭弹框，表单中此方法没用********/');
                    console.warn(obj);
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
                    var nextFieldId = config.enterFocusField;
                    if(nextFieldId){
                        var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
                        nextComponent.focus();
                    }else{
                        this.blur();
                    }
                },
                // 回车
                inputEnter:function(){
                    _this.inputEnter(config, this);
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
                    // var value = this.value;
                    var rules = config.rules;
                    var isTrue = true;
                    switch(rules){
                        case 'required':
                            if(value == ''){
                                isTrue = false;
                            }
                            break;
                    }
                    if(!isTrue){
                        var validatInfo = NetstarComponent.validateMsg[rules];
                        this.validatInfo = validatInfo;
                        NetstarComponent.setComponentWarnInfoState(this);
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
                    if($.isArray(value)||value===''){
                    }else{
                        if(typeof(value)=="object"){
                            value = [value];
                        }else{
                            console.error(config.id+'设置value值错误！');
                            console.error(value);
                            console.error(config);
                            return ;
                        }
                    }
                    var sourceValue = config.value;
                    config.value = value;
                    var isSet = false; // 是否为value设置了值
                    if($.isArray(value)){
                        isSet = true;
                        // this.inputText = value[0][config.textField] ? value[0][config.textField] : '';
                        this.inputText = '';
                        for(var valI=0;valI<value.length;valI++){
                            var inputTextStr = value[valI][config.textField] ? value[valI][config.textField] : '';
                            if(inputTextStr != ""){
                                this.inputText += inputTextStr + ',';
                            }
                        }
                        if(this.inputText != ""){
                            this.inputText = this.inputText.substring(0,this.inputText.length-1);
                        }
                    }else{
                        if(!$.isArray(value)&&typeof(value)=="object"){
                            isSet = true;
                            this.inputText = value[config.textField] ? value[config.textField] : '';
                        }else{
                            this.inputText = '';
                        }
                    }
                    if(isSet == true && this.inputText === ''){
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
                    if(this.isValidatValue){
                        this.getValue();
                    }
                    if(typeof(config.blurHandler)=='function'){
                        config.blurHandler(_config, this);
                    }
                },
                // 失去焦点
                blur: function(){
                    this.$refs.inputName.blur();
                },
                // 改变 change
                change: function(){
                    var text = this.inputText;
                    // var value = this.value;
                    // var config = this.config;
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
                    if(typeof(config.relationField)=="string"){
                        var relationField = config.relationField;
                        if(NetstarComponent.config[config.formID]){
                            var vueComponent = NetstarComponent.config[config.formID].vueConfig[relationField];
                            if(typeof(vueComponent)=='object'){
                                vueComponent.ajaxLoading = true;
                            }
                        }
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改
                    NetstarComponent.editVueComponent(obj, this);
                }
            },
        }
        return component;
    },
}
// 文本组件
NetstarComponent.text = {
	VERSION: '18.11.29', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
        },
        MOBILE:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            inputWidth :        100,            // 输入框宽度
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
        if(config.readonly == true){
            config.disabled = true;
        }
        // 宽度
        if(typeof(config.inputWidth)=="string"){
            console.error('inputWidth必须是数字格式，否则设置默认值100');
            console.error(config);
            config.inputWidth = 100;
        }
        if(config.inputWidth<20){
            console.error('inputWidth的最小宽度是20，否则设置默认值100');
            console.error(config);
            config.inputWidth = 100;
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
                contentHtml = inputHtml;   // input+button整体模板
                contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
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
        var formgroupClass = config.rules == 'required'?config.rules:''; // 规则现在只有必填
        formgroupClass += ' '+ config.type;
        var containerClass = config.type;
        if(config.formSource != 'staticData'){
            containerClass += ' input-group';
        }
        var hiddenClass = '';
        if(config.hidden){
            hiddenClass = 'hide';
        }
        var labelClass = "";
        if(config.label == ""){
            labelClass = "hide";
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
            // config:             config,                 // 组件的配置   用于方便查询组件的其他配置参数
            inputWidth:         config.inputWidth,      // input的宽度  用于设置input的宽度
            inputText:          config.value,              // input的显示值 用于获取和设置input的值
            // value:              config.value,           // config的value值 用于发送ajax/获取/设置value值
            stateClass:         '',                     // 验证信息状态 类名
            validatInfo:        '',                     // 验证信息
            disabled:           config.disabled,        // 是否只读
            styleObject:{
                width:config.inputWidth+'px',
            },
            sourceId:           config.id,              //  
        };
        if(config.formSource == 'staticData'){
            NetstarComponent.setStaticTemplateData(config, data);
        }
        return data;
    },
    inputEnter: function(config, vueComponent){
        var nextFieldId = config.enterFocusField;
        if(nextFieldId){
            var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
            nextComponent.focus();
        }else{
            vueComponent.blur();
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
                // 回车
                inputEnter:function(){
                    _this.inputEnter(config, this);
                },
                // 验证value
                validatValue: function(value){
                    // var value = this.value;
                    // var _config = this.config;
                    // var value = config.value;
                    var rules = config.rules;
                    var isTrue = true;
                    switch(rules){
                        case 'required':
                            if(value == ''){
                                isTrue = false;
                            }
                            break;
                    }
                    if(!isTrue){
                        var validatInfo = NetstarComponent.validateMsg[rules];
                        this.validatInfo = validatInfo;
                        NetstarComponent.setComponentWarnInfoState(this);
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
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    this.getValue();
                    if(typeof(config.blurHandler)=='function'){
                        config.blurHandler(_config, this);
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
                    NetstarComponent.editVueComponent(obj, this);
                }
            },
        }
        return component;
    },
}
// 数字组件
NetstarComponent.number = {
	VERSION: '18.11.29', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            input:'<input class="pt-form-control" type="number" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
        },
        MOBILE:{
            input:'<input class="pt-form-control" type="number" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            inputWidth :        100,            // 输入框宽度
            label :             '',             // label
            templateName :      'PC',           // 模板名字
            value :             '',             // value
            disabled:           false,          // 是否只读
            rules :             '',             // 规则
            formSource:         'form',         // 表单类型 默认form table/staticData
            hidden:             false,          // 是否隐藏
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
        if(typeof(config.inputWidth)=="string"){
            console.error('inputWidth必须是数字格式，否则设置默认值100');
            console.error(config);
            config.inputWidth = 100;
        }
        if(config.inputWidth<20){
            console.error('inputWidth的最小宽度是20，否则设置默认值100');
            console.error(config);
            config.inputWidth = 100;
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
                contentHtml = inputHtml;   // input+button整体模板
                contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
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
        var formgroupClass = config.rules == 'required'?config.rules:''; // 规则现在只有必填
        formgroupClass += ' '+ config.type;
        var containerClass = config.type;
        if(config.formSource != 'staticData'){
            containerClass += ' input-group';
        }
        var hiddenClass = '';
        if(config.hidden){
            hiddenClass = 'hide';
        }
        var labelClass = "";
        if(config.label == ""){
            labelClass = "hide";
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
            // config:             config,                 // 组件的配置   用于方便查询组件的其他配置参数
            inputWidth:         config.inputWidth,      // input的宽度  用于设置input的宽度
            inputText:          config.value,           // input的显示值 用于获取和设置input的值
            // value:              config.value,           // config的value值 用于发送ajax/获取/设置value值
            stateClass:         '',                     // 验证信息状态 类名
            validatInfo:        '',                     // 验证信息
            disabled:           config.disabled,        // 是否只读
            styleObject:{
                width:config.inputWidth+'px',
            },
            sourceId:           config.id,
        };
        if(config.formSource == 'staticData'){
            NetstarComponent.setStaticTemplateData(config, data);
        }
        return data;
    },
    inputEnter: function(config, vueComponent){
        var nextFieldId = config.enterFocusField;
        if(nextFieldId){
            var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
            nextComponent.focus();
        }else{
            vueComponent.blur();
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
                // 回车
                inputEnter:function(){
                    _this.inputEnter(config, this);
                },
                // 验证value
                validatValue: function(value){
                    // var value = config.value;
                    var rules = config.rules;
                    var isTrue = true;
                    switch(rules){
                        case 'required':
                            if(value == ''){
                                isTrue = false;
                            }
                            break;
                    }
                    if(!isTrue){
                        var validatInfo = NetstarComponent.validateMsg[rules];
                        this.validatInfo = validatInfo;
                        NetstarComponent.setComponentWarnInfoState(this);
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
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    this.getValue();
                    if(typeof(config.blurHandler)=='function'){
                        config.blurHandler(config, this);
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
                    var vueConfig = this;
                    var text = this.inputText;
                    text = text.toString();
                    if(text == ""){
                        config.value = null;
                    }else{
                        config.value = Number(text);
                    }
                    // config.value = text;
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
                    NetstarComponent.editVueComponent(obj, this);
                }
            },
        }
        return component;
    },
}
// 日期组件
NetstarComponent.date = {
	VERSION: '18.11.29', //版本号
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
            button: '<button class="pt-btn pt-btn-default pt-btn-icon" :disabled="disabled">'
                        +'<i class="icon-arrow-down-o"></i>'
                    + '</button>',
        },
        MOBILE:{
            input:'<input class="pt-form-control" type="text" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id" />',
            button: '<button class="pt-btn pt-btn-default pt-btn-icon" :disabled="disabled">'
                        +'<i class="icon-arrow-down-o"></i>'
                    + '</button>',
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            inputWidth :                100,                        // 输入框宽度
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
        // 宽度
        if(typeof(config.inputWidth)=="string"){
            console.error(i18n.inputWidthError1);
            console.error(config);
            config.inputWidth = 100;
        }
        if(config.inputWidth<20){
            console.error(i18n.inputWidthError2);
            console.error(config);
            config.inputWidth = 100;
        }
        // 验证value必须是时间戳 （数字）
        if(config.value!=''){
            if(typeof(config.value)!='number'){
                config.value = '';
                console.error(i18n.valueError);
                console.error(config);
            }
        }
        config.format = config.format.toUpperCase();
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
                $input.attr('v-on:change', 'change');
                // $input.attr('v-on:keyup', 'keyup($event)');
                $button.attr('v-on:click', 'buttonClick');   // 按钮点击事件
                $button.attr('v-on:mousedown', 'mousedown');
                $button.attr('v-on:mouseup', 'mouseup');
                var inputHtml = $input.prop('outerHTML');   // input模板
                var buttonHtml = $button.prop('outerHTML'); // button模板
                var btncontainer = NetstarComponent.common.btncontainer;
                btncontainer = btncontainer.replace('{{nscontainer}}', buttonHtml);
                contentHtml = inputHtml + btncontainer;   // input+button整体模板
                contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
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
        var formgroupClass = config.rules == 'required'?config.rules:''; // 规则现在只有必填
        formgroupClass += ' '+ config.type;
        var containerClass = config.type;
        if(config.formSource != 'staticData'){
            containerClass += ' input-group';
        }
        var hiddenClass = '';
        if(config.hidden){
            hiddenClass = 'hide';
        }
        config.value = typeof(config.value)=='number'?moment(config.value).format(config.format):'';
        var labelClass = "";
        if(config.label == ""){
            labelClass = "hide";
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
            // config:             config,                 // 组件的配置   用于方便查询组件的其他配置参数
            inputWidth:         config.inputWidth,      // input的宽度  用于设置input的宽度
            inputText:          config.value,           // input的显示值 用于获取和设置input的值
            // value:              config.value,           // config的value值 用于发送ajax/获取/设置value值
            stateClass:         '',                     // 验证信息状态 类名
            validatInfo:        '',                     // 验证信息
            disabled:           config.disabled,        // 是否只读
            isValidatValue:     true,                   // 失去焦点是否验证value
            styleObject:{
                width:config.inputWidth+'px',
            },
            sourceId:           config.id,
        };
        if(config.formSource == 'staticData'){
            NetstarComponent.setStaticTemplateData(config, data);
        }
        return data;
    },
    inputEnter: function(config, vueComponent){
        var nextFieldId = config.enterFocusField;
        if(nextFieldId){
            var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
            nextComponent.focus();
        }else{
            vueComponent.blur();
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
                    }
                    if(!$.isEmptyObject(config.addvalue)){
                        datePickerOption.autovalue = config.addvalue;
                    }
                    var inputNameId = this.id;
                    var $input = $('#'+inputNameId);
                    $input.datepicker(datePickerOption).on('changeDate', function(ev){
                        __this.inputText = $input.val();
                        // __this.value = __this.inputText;
                        __this.change();
                        if(config.isRunEnter == true){
                            config.isRunEnter = false;
                            __this.inputEnter();
                        }
                    })
                    $input.off('change');
                    $input.on('change', function(ev){
                        __this.inputText = $input.val();
                        // __this.value = __this.inputText;
                        __this.change();
                    });
                    if(config.isInputMask){
                        $input.inputmask(config.format.replace(/((y?Y?)*)((m?M?)*)((d?D?)*)/g,function($1){return $1.slice(0,1).toLowerCase()}));
                    }
                },
                // 回车
                inputEnter: function(){
                    _this.inputEnter(config, this);
                },
                // 按钮点击
                buttonClick: function(){
                    var inputNameId = this.id;
                    var $input = $('#'+inputNameId);
                    $input.datepicker('show');
                },
                // 验证value
                validatValue: function(value){
                    // var value = config.value;
                    value = value==null?"":value;
                    var rules = config.rules;
                    var isTrue = true;
                    switch(rules){
                        case 'required':
                            if(value == ''){
                                isTrue = false;
                            }
                            break;
                    }
                    if(!isTrue){
                        var validatInfo = NetstarComponent.validateMsg[rules];
                        this.validatInfo = validatInfo;
                        NetstarComponent.setComponentWarnInfoState(this);
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
                        value = $input.val();
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
                        value = null;
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
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    if(this.isValidatValue){
                        this.getValue();
                    }
                    if(typeof(config.blurHandler)=='function'){
                        config.blurHandler(config, this);
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
                    // 验证text格式
                    if(text!=''){
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
                        // text = Number(moment(text).format('x'));
                        value = Number(moment(value).format('x'));
                    }else{
                        value = null;
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
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this);
                }
            },
            mounted: function(){
                this.dateDefind();
            }
        }
        return component;
    },
}
// 单选组件
NetstarComponent.radio = {
	VERSION: '18.11.29', //版本号
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
                        + '<label :for="option.fillId">{{optionText}}</label>'
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
            inputWidth :                100,                        // 输入框宽度
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
        }
        if(typeof(config.url)=='undefined'&&typeof(config.ajaxConfig)=='undefined'){
            config.ajaxLoading = false;
        }else{
            config.ajaxLoading = true;
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
        // 宽度
        if(typeof(config.inputWidth)=="string"){
            console.error(i18n.inputWidthError1);
            console.error(config);
            config.inputWidth = 100;
        }
        if(config.inputWidth<20){
            console.error(i18n.inputWidthError2);
            console.error(config);
            config.inputWidth = 100;
        }
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
                var labelHtml = $label.prop('outerHTML');  // label模板
                labelHtml = labelHtml.replace('optionValue','option.'+config.valueField);
                labelHtml = labelHtml.replace('optionText','option.'+config.textField);
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
                contentHtml =   '<div v-if="ajaxLoading==false" class="radio-group" v-bind:style="styleObject">'
                                    + labelHtml
                                    + closeHtml
                                + '</div>'
                                + '<div v-else class="radio-group" v-bind:style="styleObject">'
                                    + loadingHtml
                                + '</div>'

                contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
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
        var formgroupClass = config.rules == 'required'?config.rules:''; // 规则现在只有必填
        formgroupClass += ' '+ config.type;
        var containerClass = config.type;
        var hiddenClass = '';
        if(config.hidden){
            hiddenClass = 'hide';
        }
        var inputText = config.value;
        if(config.isObjectValue && config.value!=''){
            inputText = config.value[0][config.valueField];
        }
        var labelClass = "";
        if(config.label == ""){
            labelClass = "hide";
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
            // config:             config,                 // 组件的配置   用于方便查询组件的其他配置参数
            inputWidth:         config.inputWidth,      // input的宽度  用于设置input的宽度
            inputText:          inputText,              // input的显示值 用于获取和设置input的值
            // value:              config.value,           // config的value值 用于发送ajax/获取/设置value值
            stateClass:         '',                     // 验证信息状态 类名
            validatInfo:        '',                     // 验证信息
            disabled:           config.disabled,        // 是否只读
            subdata:            config.subdata,         // 单选选项
            ajaxLoading:        config.ajaxLoading,     // 是否正在加载
            isObjectValue:      config.isObjectValue,   // value格式
            isValidatValue:     true,
            sourceId:           config.id,
            styleObject:{
                width:config.inputWidth+'px',
            }
        };
        if(config.ajaxConfig){
            data.ajaxConfig = config.ajaxConfig;
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
        if(config.formSource == 'staticData'){
            NetstarComponent.setStaticTemplateData(config, data);
        }
        return data;
    },
    inputEnter: function(config, vueComponent, ev){
        // var vueComponent = NetstarComponent.config[config.formID].vueConfig[config.id];
        var nextFieldId = config.enterFocusField;
        if(nextFieldId){
            var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
            nextComponent.focus();
        }else{
            vueComponent.blur(ev);
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
                    // var value = this.value;
                    var rules = config.rules;
                    var isTrue = true;
                    switch(rules){
                        case 'required':
                            if(value == ''){
                                isTrue = false;
                            }
                            break;
                    }
                    if(!isTrue){
                        var validatInfo = NetstarComponent.validateMsg[rules];
                        this.validatInfo = validatInfo;
                        NetstarComponent.setComponentWarnInfoState(this);
                    }
                    return isTrue;
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
                    if(typeof(config.blurHandler)=='function'){
                        config.blurHandler(config, this);
                    }
                },
                // 失去焦点
                blur: function(ev){
                    $(ev.target).blur();
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
                        var relationField = config.relationField;
                        var vueComponent = NetstarComponent.config[config.formID].vueConfig[relationField];
                        if(typeof(vueComponent)=='object'){
                            vueComponent.ajaxLoading = true;
                        }
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this);
                }
            },
            mounted: function(){
                if(this.ajaxLoading){
                    this.ajax();
                }
            }
        }
        return component;
    },
}
// 多选组件
NetstarComponent.checkbox = {
	VERSION: '18.11.29', //版本号
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
                        + '<label :for="option.fillId">{{optionText}}</label>'
                    + '</div>',
            loading: '<div class="loading">正在加载</div>', 
        },
        MOBILE:{
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            inputWidth :                100,                        // 输入框宽度
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
        }
        if(typeof(config.url)=='undefined'&&typeof(config.ajaxConfig)=='undefined'){
            config.ajaxLoading = false;
        }else{
            config.ajaxLoading = true;
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
        // 宽度
        if(typeof(config.inputWidth)=="string"){
            console.error(i18n.inputWidthError1);
            console.error(config);
            config.inputWidth = 100;
        }
        if(config.inputWidth<20){
            console.error(i18n.inputWidthError2);
            console.error(config);
            config.inputWidth = 100;
        }
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
                var labelHtml = $label.prop('outerHTML');  // label模板
                labelHtml = labelHtml.replace('optionValue','option.'+config.valueField);
                labelHtml = labelHtml.replace('optionText','option.'+config.textField);
                contentHtml =   '<div v-if="ajaxLoading==false" class="radio-group" v-bind:style="styleObject">'
                                    + labelHtml
                                + '</div>'
                                + '<div v-else class="radio-group" v-bind:style="styleObject">'
                                    + loadingHtml
                                + '</div>'

                contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
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
        var formgroupClass = config.rules == 'required'?config.rules:''; // 规则现在只有必填
        formgroupClass += ' '+ config.type;
        var containerClass = config.type;
        var hiddenClass = '';
        if(config.hidden){
            hiddenClass = 'hide';
        }
        var inputText = config.value;
        if(config.isObjectValue && config.value!=''){
            inputText = [];
            for(var i=0;i<config.value.length;i++){
                inputText.push(config.value[i][config.valueField]);
            }
        }else{
            if(config.value==''){
                inputText = [];
            }else{
                inputText = inputText.split(',');
            }
        }
        var labelClass = "";
        if(config.label == ""){
            labelClass = "hide";
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
            // config:             config,                 // 组件的配置   用于方便查询组件的其他配置参数
            inputWidth:         config.inputWidth,      // input的宽度  用于设置input的宽度
            inputText:          inputText,              // input的显示值 用于获取和设置input的值
            // value:              config.value,           // config的value值 用于发送ajax/获取/设置value值
            stateClass:         '',                     // 验证信息状态 类名
            validatInfo:        '',                     // 验证信息
            disabled:           config.disabled,        // 是否只读
            subdata:            config.subdata,         // 单选选项
            ajaxLoading:        config.ajaxLoading,     // 是否正在加载
            isObjectValue:      config.isObjectValue,   // value格式
            isValidatValue:     true,
            styleObject:{
                width:config.inputWidth+'px',
            },
            sourceId:           config.id,
        };
        if(config.ajaxConfig){
            data.ajaxConfig = config.ajaxConfig;
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
        if(config.formSource == 'staticData'){
            NetstarComponent.setStaticTemplateData(config, data);
        }
        return data;
    },
    inputEnter: function(config, vueComponent, ev){
        var nextFieldId = config.enterFocusField;
        if(nextFieldId){
            var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
            nextComponent.focus();
        }else{
            vueComponent.blur(ev);
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
                    var components = NetstarComponent.config[config.formID].config;
                    NetstarComponent.setAjaxSubdata(config,  this, components);
                },
                // 回车
                inputEnter: function(ev){
                    _this.inputEnter(config, this, ev);
                },
                // 验证value
                validatValue: function(value){
                    // var value = config.value;
                    var rules = config.rules;
                    var isTrue = true;
                    switch(rules){
                        case 'required':
                            if(value == ''){
                                isTrue = false;
                            }
                            break;
                    }
                    if(!isTrue){
                        var validatInfo = NetstarComponent.validateMsg[rules];
                        this.validatInfo = validatInfo;
                        NetstarComponent.setComponentWarnInfoState(this);
                    }
                    return isTrue;
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
                    if(isValid){
                        var isTrue = this.validatValue(value);
                        if(!isTrue){
                            value = false;
                        }
                    }
                    if(config.isBooleanValue==true){
                        value = Number(value);
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
                    if(typeof(config.blurHandler)=='function'){
                        config.blurHandler(config, this);
                    }
                },
                // 失去焦点
                blur: function(ev){
                    $(ev.target).blur();
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
                        var relationField = config.relationField;
                        var vueComponent = NetstarComponent.config[config.formID].vueConfig[relationField];
                        if(typeof(vueComponent)=='object'){
                            vueComponent.ajaxLoading = true;
                        }
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this);
                }
            },
            mounted: function(){
                if(this.ajaxLoading){
                    this.ajax();
                }
            }
        }
        return component;
    },
}
// 下拉选组件
NetstarComponent.select = {
	VERSION: '18.11.29', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            select:  '<select class="" v-model="inputText" :id="id"></select>',
            loading: '<div class="loading">正在加载</div>', 
        },
        MOBILE:{
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            inputWidth :                100,                        // 输入框宽度
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
            multiple:                   false,                      // 是否多选
            isSearch:                   false,                      // 是否有搜索框
            isAsynSearch:               false,                      // 是否异步搜索
            hidden:                     false,                      // 是否隐藏
        }
        if(typeof(config.url)=='undefined' && typeof(config.ajaxConfig)=='undefined' && !config.isAsynSearch){
            config.ajaxLoading = false;
        }else{
            config.ajaxLoading = true;
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
        // 宽度
        if(typeof(config.inputWidth)=="string"){
            console.error(i18n.inputWidthError1);
            console.error(config);
            config.inputWidth = 100;
        }
        if(config.inputWidth<20){
            console.error(i18n.inputWidthError2);
            console.error(config);
            config.inputWidth = 100;
        }
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
            if(config.disabled){
                for(var i=0;i<config.subdata.length;i++){
                    config.subdata[i].isDisabled = config.disabled;
                }
            }
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
                multiple:       config.multiple,
            }
            config.value = NetstarComponent.getValueBySubdata(parameter);
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
                var $select = $(tempalte.select);
                $select.attr('v-bind:style', 'styleObject');
                // $select.attr('v-on:focus', 'setfocus');
                // $select.attr('v-on:blur', 'setblur');
                
                // if(config.isSearch){
                //     // $select.attr('v-on:keyup.shift.13', 'inputEnter($event)');
                // }else{
                    // $select.attr('v-on:keyup.13', 'inputEnter($event)');
                // }
                // $select.attr('v-on:focus', 'setfocus');

                contentHtml = $select.prop('outerHTML');  // select模板
                contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
                if(config.formSource=='table'){
                    containerHtml = NetstarComponent.common.tableComponent;
                }
                break;
            case 'staticData':
                // contentHtml = NetstarComponent.common.staticComponent;
                // var $content = $(contentHtml);
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
    getSubdata:function(config){
        var subdata = config.subdata;
        var textField = config.textField;
        var valueField = config.valueField;
        var retSub = [];
        for(var i=0;i<subdata.length;i++){
            // valueField/textField不存在时表示当条数据配置错误不在下拉框中显示
            if(typeof(subdata[i][valueField])=='undefined'||typeof(subdata[i][textField])=='undefined'){
                console.error('valueField/textField不存在时表示当条数据配置错误不在下拉框中显示');
                console.error(subdata[i]);
                console.error(subdata);
                console.error(config);
            }else{
                var subObj = {
                    id: subdata[i][valueField],
                    text: subdata[i][textField],
                }
                retSub.push(subObj);
            }
        }
        return retSub;
    },
    getData: function(config){
        var data = NetstarComponent.getNewVueComponentData(config);
        return data;
        var formgroupClass = config.rules == 'required'?config.rules:''; // 规则现在只有必填
        formgroupClass += ' '+ config.type;
        var containerClass = config.type;
        var hiddenClass = '';
        if(config.hidden){
            hiddenClass = 'hide';
        }
        var inputText = config.value;
        if(config.isObjectValue && config.value!=''){
            inputText = [];
            for(var i=0;i<config.value.length;i++){
                inputText.push(config.value[i][config.valueField]);
            }
        }else{
            if(config.value==''){
                inputText = [];
            }else{
                inputText = inputText.split(',');
            }
        }
        var vueSubdata = this.getSubdata(config);
        var labelClass = "";
        if(config.label == ""){
            labelClass = "hide";
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
            // config:             config,                 // 组件的配置   用于方便查询组件的其他配置参数
            inputWidth:         config.inputWidth,      // input的宽度  用于设置input的宽度
            inputText:          inputText,              // input的显示值 用于获取和设置input的值
            // value:              config.value,           // config的value值 用于发送ajax/获取/设置value值
            stateClass:         '',                     // 验证信息状态 类名
            validatInfo:        '',                     // 验证信息
            disabled:           config.disabled,        // 是否只读
            subdata:            vueSubdata,             // 单选选项
            ajaxLoading:        config.ajaxLoading,     // 是否正在加载
            isObjectValue:      config.isObjectValue,   // value格式
            styleObject:{
                width:config.inputWidth+'px',
            },
            sourceId:           config.id,
            isBlur:             true,
        };
        if(config.ajaxConfig){
            data.ajaxConfig = config.ajaxConfig;
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
        if(config.formSource == 'staticData'){
            NetstarComponent.setStaticTemplateData(config, data);
        }
        return data;
    },
    inputEnter: function(config, vueComponent, ev){
        var nextFieldId = config.enterFocusField;
        if(nextFieldId){
            var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
            nextComponent.focus();
        }else{
            vueComponent.blur(ev);
        }
    },
    initSelect: function(config, vueConfig){
        var subdata = vueConfig.subdata;
        selectConfig = {
            multiple: config.multiple, // 是否多选
            placeholder: '',
            disabled:config.disabled,
        };
        if(typeof(config.isHasClose)=="boolean"){
            selectConfig.allowClear = config.isHasClose;
        }
        // 是否异步搜索
        if(config.isAsynSearch){
            selectConfig.ajax = $.extend(true, {}, config.ajaxConfig);
            selectConfig.ajax.processResults = function(data){
                config.subdata = data[config.ajaxConfig.dataSrc];
                return {
                    results: NetstarComponent.select.getSubdata(config)
                };
            }
            selectConfig.ajax.data = function(params){
                var searchKeyName = config.searchKeyName?config.searchKeyName:'search';
                var data = config.ajaxConfig.data;
                data[searchKeyName] = params.term;
                return data;
            }
        }else{
            selectConfig.data = subdata;
            // 是否搜索 多选不能搜索
            if(!config.isSearch){
                // 不是搜索
                selectConfig.minimumResultsForSearch = -1;
            }
        }
        var $select = $('#'+config.fullID);
        $select.children().remove();
        $select.select2(selectConfig).val(vueConfig.inputText).trigger('change').on('change', function (ev) {
            var valType = typeof(vueConfig.inputText);
            var val = $(this).val();
            if(valType=='number'&&val!=''){
                val = Number(val);
            }
            if(val == null){
                val = '';
            }
            vueConfig.inputText = val;
            vueConfig.change();
        }).on('keypress',function(ev) {
            ev.preventDefault();
        }).on('select2:close', function(ev){
            vueConfig.blurHandler(ev);
        });
        if(config.disabled!=true){
            $select.next().find('.select2-selection').on('focus',function(){
                $select.select2('open');
            })
            $select.next().find('.select2-selection').on('keyup',function(ev){
                if(ev.keyCode == 13){
                    vueConfig.inputEnter(ev);
                }
            })
        }

        // .on('select2:selecting', function(ev){
        //     console.warn('ev select2:selecting');
        //     //ev.preventDefault();
        // }).on('select2:close', function(ev){
        //     console.warn('ev select2:close');
        //     NetstarComponent.select.inputEnter(config, vueConfig, ev);
        //     //ev.preventDefault();
        // });
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
                        subdata[i].disabled = value;
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
                    NetstarComponent.setAjaxSubdata(config, _this, components, function(config, vueConfig, isTrue){
                        if(isTrue){
                            vueConfig.subdata = NetstarComponent.select.getSubdata(config);
                            // console.log(vueConfig.subdata);
                            if(config.formSource!="staticData"){
                                NetstarComponent.select.initSelect(config, vueConfig);
                            }
                        }
                    });
                },
                // 回车
                inputEnter: function(ev){
                    _this.inputEnter(config, this, ev);
                },
                // 验证value
                validatValue: function(value){
                    // var value = config.value;
                    var rules = config.rules;
                    var isTrue = true;
                    switch(rules){
                        case 'required':
                            if(value == ''){
                                isTrue = false;
                            }
                            break;
                    }
                    if(!isTrue){
                        var validatInfo = NetstarComponent.validateMsg[rules];
                        this.validatInfo = validatInfo;
                        NetstarComponent.setComponentWarnInfoState(this);
                    }
                    return isTrue;
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
                    // var value = this.value;
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
                // 获得焦点
                focus: function(){
                    var $select = $('#'+this.id);
                    $select.next().find('.select2-selection').focus();
                },
                // 设置失去焦点
                blurHandler: function(ev){
                    this.getValue();
                    if(typeof(config.blurHandler)=='function'){
                        config.blurHandler(config, this);
                    }
                },
                // 失去焦点
                blur: function(ev){
                    var $select = $(ev.target);
                    $select.blur();
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
                        var relationField = config.relationField;
                        var vueComponent = NetstarComponent.config[config.formID].vueConfig[relationField];
                        if(typeof(vueComponent)=='object'){
                            vueComponent.ajaxLoading = true;
                        }
                    }
                },
                // 修改组件
                edit: function(obj){
                    // 修改数据和方法不可以修改dom （可以修改dom属性，暂不支持，通过refs修改）
                    NetstarComponent.editVueComponent(obj, this);
                }
            },
            mounted: function(){
                var _this = this;
                if(this.ajaxLoading){
                    this.ajax();
                }else{
                    if(config.formSource!="staticData"){
                        // setTimeout(function(){
                            NetstarComponent.select.initSelect(config, _this);
                        // },100)
                    }
                }
            }
        }
        return component;
    },
}
// 文本域组件
NetstarComponent.textarea = {
	VERSION: '18.11.29', //版本号
	I18N: {
		en:{
		},
		zh:{
		}
    },
    TEMPLATE:{
        PC:{
            input:'<textarea class="pt-form-control" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id"></textarea>',
        },
        MOBILE:{
            input:'<textarea class="pt-form-control" :class="inputClass" :disabled="disabled" v-model="inputText" ref="inputName" :id="id"></textarea>',
        },
    },
	// 设置config的默认配置
	setDefault: function(config){
        var defaultConfig = {
            inputWidth :        100,            // 文本域宽度
            inputHeight:        40,             // 文本域高度
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
        if(config.readonly == true){
            config.disabled = true;
        }
        // 宽度
        if(typeof(config.inputWidth)=="string"){
            console.error('inputWidth必须是数字格式，否则设置默认值100');
            console.error(config);
            config.inputWidth = 100;
        }
        if(config.inputWidth<20){
            console.error('inputWidth的最小宽度是20，否则设置默认值100');
            console.error(config);
            config.inputWidth = 100;
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
        switch(config.formSource){
            case 'form':
            case 'table':
                var $input = $(tempalte.input);
                // 为每一部分添加事件属性
                // 为input和button添加事件
                $input.attr('v-bind:style', 'styleObject');
                $input.attr('v-on:keydown.13', 'inputEnter($event)');  // 回车事件keyup.13
                $input.attr('v-on:blur', 'blurHandler');
                $input.attr('v-on:focus', 'focusHandler');
                $input.attr('v-on:change', 'change');
                var inputHtml = $input.prop('outerHTML');   // input模板
                contentHtml = inputHtml;   // input+button整体模板
                contentHtml += '<div :class="stateClass">{{validatInfo}}</div>';
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
        var formgroupClass = config.rules == 'required'?config.rules:''; // 规则现在只有必填
        formgroupClass += ' '+ config.type;
        var hiddenClass = '';
        if(config.hidden){
            hiddenClass = 'hide';
        }
        var containerClass = config.type;
        var labelClass = "";
        if(config.label == ""){
            labelClass = "hide";
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
            // config:             config,                 // 组件的配置   用于方便查询组件的其他配置参数
            inputWidth:         config.inputWidth,      // input的宽度  用于设置input的宽度
            inputText:          config.value,              // input的显示值 用于获取和设置input的值
            // value:              config.value,           // config的value值 用于发送ajax/获取/设置value值
            stateClass:         '',                     // 验证信息状态 类名
            validatInfo:        '',                     // 验证信息
            disabled:           config.disabled,        // 是否只读
            styleObject:{
                width:config.inputWidth+'px',
                height:config.inputHeight+'px',
            },
            sourceId:           config.id,              //  
        };
        return data;
    },
    inputEnter: function(config, vueComponent){
        var nextFieldId = config.enterFocusField;
        if(nextFieldId){
            var nextComponent = NetstarComponent.config[config.formID].vueConfig[nextFieldId];
            nextComponent.focus();
        }else{
            vueComponent.blur();
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
                // 回车
                inputEnter: function(ev){
                    if(ev.ctrlKey == false){
                        // enter 跳转组件
                        ev.preventDefault(); // 阻止默认行为 默认回车换行
                        _this.inputEnter(config, this);
                    }else{
                        // ctrl+enter 添加换行
                        $(ev.target).val(function(index, text){
                            return (text+'\n');
                        });
                    }
                },
                // 验证value
                validatValue: function(value){
                    // var value = this.value;
                    // var _config = this.config;
                    var value = config.value;
                    var rules = config.rules;
                    var isTrue = true;
                    switch(rules){
                        case 'required':
                            if(value == ''){
                                isTrue = false;
                            }
                            break;
                    }
                    if(!isTrue){
                        var validatInfo = NetstarComponent.validateMsg[rules];
                        this.validatInfo = validatInfo;
                        NetstarComponent.setComponentWarnInfoState(this);
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
                },
                // 获得焦点
                focus: function(){
                    this.$refs.inputName.focus();
                },
                // 设置失去焦点
                blurHandler: function(){
                    this.getValue();
                    if(typeof(config.blurHandler)=='function'){
                        config.blurHandler(_config, this);
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
                    NetstarComponent.editVueComponent(obj, this);
                }
            },
        }
        return component;
    },
}
// 隐藏组件
NetstarComponent.hidden = {
	VERSION: '18.11.29', //版本号
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
        return data;
        var formgroupClass = config.type;
        var containerClass = config.type;
        var hiddenClass = 'hide';
        var data = {
            labelClass:         '',                     // label样式 现在还没有用
            formitemClass:      '',                     // formitem样式 现在还没有用        
            formtdClass:        '',                     // formtd样式 现在还没有用
            formgroupClass:     formgroupClass,         // formgroup样式 根据rules设置 （必填样式）
            hiddenClass:        hiddenClass,            // 表单是否隐藏
            containerClass:     containerClass,         // 表单内容类名
            inputClass:         '',                     // input样式 现在还没有用
            id:                 config.fullID,          // 组件id      设置组件的id
            labelText:          config.label,           // 组件label值  设置组件label的显示值
            inputWidth:         config.inputWidth,      // input的宽度  用于设置input的宽度
            inputText:          config.value,              // input的显示值 用于获取和设置input的值
            stateClass:         '',                     // 验证信息状态 类名
            validatInfo:        '',                     // 验证信息
            disabled:           config.disabled,        // 是否只读
            sourceId:           config.id,              //  
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
                    NetstarComponent.editVueComponent(obj, this);
                }
            },
        }
        return component;
    },
}
var nsTemplatefunc = function(obj){
    /*
     * obj ：{}
     * container ：         string      // 容器id或class 例如：#id / .class
     * selectMode :         string      // 单选 多选 不能选
     * params :             object      // 参数
     * doubleClickHandler： function    // 双击事件
    */
    var containerId = obj.container;
    var $container = $(containerId);
    // obj.doubleClickHandler('555');
    $container.append('<containerpage></containerpage>');
    var config = {
        id : 'business',
        label : '业务组件',
        type : 'business',
        rules : 'required',
        textField : 'name',
        inputWidth: 120,
        value : '',
        dialogTitle: '往来单位[供应商]选择框',
        infoBtnName:'查看单位基本信息',
        source:{
            url : getRootPath() + '/demos/newcomponent/clickpage.jsp',
            data :'clickpage',
        },
        search:{
            url : getRootPath() + '/demos/newcomponent/clickpage.jsp',
            data : '',
        },
    }
    var componentConfig = NetstarComponent.business.getComponentConfig(config);
    new Vue({
        el: containerId,
        components:{
            'containerpage':componentConfig,
        }
    })
    
    return {
        selectHandler:function(){
            console.log('选中');
            return {name:"name",text:"你好"};
        }, // 选中
        addHandler:function(){
            console.log('添加');
        }, // 添加
        queryHandler:function(){
            console.log('快速查询')
        }, // 快速查询
    }
}