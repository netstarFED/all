/************自定义方法组件化调用********************************/
/*
	*关联组件
	*多volist相关数据
	*格式化函数
*/
var nsCombineComponent = {
	array:{
		'datevalue-combine':[{
			label: 					'出生日期',
			type: 					'dateTimeInput',
			format: 				'YYYY/MM/DD',
			column: 				3,
			//commonChangeHandler:	getAgeMonthByBirthday,
		},{
			label: 					'年月',
			type: 					'valuesInput',
			//format: 				'年龄{this:99}月{month:99}',
			column: 				3,
			//commonChangeHandler:	getBirthdayByAgeMonth,
		},{
			type: 					'hidden',
		}]
	},	
	getCombineInput:function(fieldJson){
		var valueData = nsCombineComponent.array[fieldJson.type];
		switch(fieldJson.type){
			case 'datevalue-combine':
				//日期年龄月输入组件
				for(var i=0; i<valueData.length; i++){
					if(valueData[i].type=='dateTimeInput'){
						valueData[i].id = fieldJson.subFields.birthday.id;
					}else if(valueData[i].type=="valuesInput"){
						valueData[i].id = fieldJson.subFields.age.id;
						valueData[i].format = '年龄{this:99}月{'+fieldJson.subFields.ageMonth.id+':99}';
					}else{
						valueData[i].id = fieldJson.subFields.ageMonth.id;
					}
					valueData[i].relateField = fieldJson.subFields;
					valueData[i].commonChangeHandler = nsCombineComponent.dateValueInit;
				}
				break;
		}
		return valueData;
	},//获取日期文本输入组件
	dateValueInit:function(data){
		/*
			*data.relateField 有关联的subfields字段属性
			*data.config 相关配置属性
			*data.value 当前值
		}*/
		var config = data.config;
		var id = config.id;
		var formId = config.fullID.substring(5,config.fullID.length-id.length-1);
		var fillValueJson = {}; 
		switch(config.type){
			case 'dateTimeInput':
				var valueJson = nsVals.getAgeByBirthDate(data.value);
				fillValueJson[data.config.relateField.age.id] = valueJson.age;
				fillValueJson[data.config.relateField.ageMonth.id] = valueJson.month;
				break;
			case 'valuesInput':
				/*value 年龄 *day 相差天数  *month 相差月*/
				var birthdayDate = nsVals.getBirthDateByAge(28,2,2);
				fillValueJson[data.config.relateField.birthday.id] = birthdayDate;
				break;
		}
		nsForm.fillValues(fillValueJson,formId);
	},//根据出生日期计算年龄月 根据年龄月计算出生日期
	formatDataByClass:function(classField,voList){
		/*
			* classField 类别字段
			* voList 要格式化的vo
				*拿到的数据格式如[{
					id:'12300001',
					className:'理化',
					hazardName:'甲醇'
				},{
					id:'12300002',
					className:'微生物',
					hazardName:'副溶血性弧菌'
				},{
					id:'12300003',
					className:'微生物',
					hazardName:'短小杆菌芽胞灭杀指数'
				},{
					id:'12300004',
					className:'理化',
					hazardName:'久效磷'
				}]
		*/
		var voListJson = {};
		for(var listI=0;listI<voList.length; listI++){
			var voData = voList[listI];
			if(typeof(voListJson[voData[classField]])!='object'){
				voListJson[voData[classField]].push(voList[listI]);
			}
		}
		return voListJson;
	}//根据类别格式化函数
}//组合组件的相关调用
/*关于for循环中var let的使用
	*var声明变量是函数作用域，而let声明变量是语句块作用域
	*var{ 循环体 } 在每次执行循环体之前，JS 引擎会把 i 在循环体的上下文中重新声明及初始化一次
**/
var nsCustomPackage = {
	//根据定义volist的名字获取其相关值 此方法针对于variableName:'a.b.c.d'这样的定义转换
	/*
		举例variableName = 'customer.contact'
		*1.根据variableName转换json格式  转化为{customer:{contact:{}}}
		*2.根据variableName赋值 value = {id:'33'} 赋值为获取customer.contact = {id:'333'}
		*3.根据variableName获取某一层vo值 获取customer.contact的值
		*4.根据variableName获取当前json格式的数据 {customer:{contact:{id:'333'}}}
	**/
	data:{},
	getJson:function(paths){
		var action = paths.split('.');
		var c = {};
		var p = c;
		for(var i=0; i<action.length; i++){
			p[action[i]] = {}; 
			p = p[action[i]]; 
		}
		return c;
	},//获取json格式
	getValue:function(paths){
		/*
			* 入参
				*paths vo名字 举例:"customerVolist.contactList"
			**/
		var ps = paths.split('.');
		var top = this.data;
		for(var i = 0; i < ps.length; i++){
			if(!top[ps[i]]){
				top[ps[i]] = {};
			}
			top = top[ps[i]];
		}
		return top;
	},//得到值
	setValue:function(paths,value){
		/*
			* 入参
				*paths vo名字 举例:"customerVolist.contactList"
				*value 设置值
		**/
		var ps = paths.split('.');
		var top = this.data;
		for(var i = 0; i < ps.length; i++){
			if(!top[ps[i]]){
				top[ps[i]] = {};
			}
			if(i == ps.length - 1){
				top[ps[i]] = value;
			}
			top = top[ps[i]];
		}
	},//设置值
	getData:function(isClear){
		/*
			*入参  isClear boolean  作用决定是否清空值
		*/
		isClear = typeof(isClear)=='boolean' ? isClear : true;//默认清空
		var data = this.data;
		this.clearData();
		return data;
	},//获取值
	clearData:function(){
		this.data = {};
	},//清空
	//根据大对象和当前操作数据添加objectState标识
	//objectState 有 Added(添加1), Updated(修改2), Unchanged(无变化0), Deleted(删除-1), Detached(销毁)
	/*
		*objectData  		大数据集合
		*currentData 		当前操作数据
		*variableName      	操作的vo对象
		*idField     		主键id
		*状态为 Unchanged 或者 Updated 的 Vo, 修改数据后的状态为 Updated
		*状态为 Added 的 Vo, 修改数据后仍然为 Added
		*状态为 Unchanged 的 Vo, 调用 Delete 方法后状态为 Deleted
		*状态为 Added 的 Vo, 调用 Delete 方法后状态为 Detached
		*   原数据objectState				拷贝后的objectState				最终的objectState
			Added							Added,Updated,UnChanged			Added
			Added							Deleted							Deleted
			Updated							Added,Updated,UnChanged			Updated
			Updated							Deleted							Deleted
			UnChanged						Added,Updated,UnChanged			Updated
			UnChanged						Deleted							Deleted
	**/
	//已知大对象数据值读取大对象中某一层vo的数据
	getVoDataByVariableName:function(variableData,variableName){
		var variableNameArray = variableName.split('.');
		var variableValue;
		if(variableNameArray.length == 1){
			variableValue = variableData[variableName];
		}else{
			//如果是{child.childName}类型的则继续找值
			variableValue = variableData;
			for(var i = 0; i < variableNameArray.length; i++){
				if(!variableValue[variableNameArray[i]]){
					variableValue[variableNameArray[i]] = {};
				}
				variableValue = variableValue[variableNameArray[i]];
			}
		}
		return variableValue;
	},//已知大对象数据值读取大对象中某一层vo的数据

}//关于定义的包名的相关方法
function getUrlParams(){
	var result = {};
	var params = window.location.search.slice(1).split('&');
	for (var i = 0; i < params.length; i++){
		var idx = params[i].indexOf('=');
		if (idx > 0){
			result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
		}
	}
	return result;
}
var nsVue = {
	graps:{
		product:{
			
		}
	},//定义包名
	table:{},//表格data
	formatHandler:{
		/**
			formatHandler:{
				type:'date/input/select/money/number'
				data:{}
			}
		**/
		chargeDate:function(_value,_format){
			/*
				{
					type:'date',
					data:{
						format:'YYYY-MM-DD/YYYY-MM-DD HH:mm:ss'
					}
				}
				*获取要转换的值
				*要转换的格式 如YYYY-MM-DD  YYYY-MM-DD HH:mm:ss
			*/
			var isCharge = false;//默认不对值进行转换
			var value = '';//默认值为空
			switch(typeof(value)){
				case 'string':
					if(value){
						//值为字符串类型并且存在
						isCharge = true;
					}
					break;
				case 'number':
					if(value != 0){
						//值为数值类型但值为0 此处不应该 排除0 但因为存在获取类型值转换问题所以暂定方案需要过滤0
						isCharge = true;
					}
					break;
			}
			if(isCharge){
				//可以对值进行转换
				var format = _format ? _format : 'YYYY-MM-DD';//如果没有定义转换，则默认转换格式为年-月-日
				value = moment(value).format(_format);
			}
			return value;
		},//输出格式是日期类型
		chargeMoney:function(_value,_format){
			/*
				{
					type:'money',
					data:{
						format:{
							places://小数位数 默认2位
							symbol://标识符 默认$
							thousand://分隔符 默认,
							decimal://小数点 默认显示小数点
						}
					}
				}
				*获取要转换的值
				*要转换的格式
			*/
			var value = baseDataTable.formatMoney(_value,_format.places,_format.symbol,_format.thousand,_format.decimal);
			return value;
		},//输出格式是货币类型
		chargeCodeToName:function(_value){
			/*
				{
					type:'codeToName',
				}
				* 根据区域码能获取到市和区{area:{},city:{}}
				* 根据市的码能货到到省{city:{},pro:{}}
				* 根据省的码获取到省{pro:{}}
				* 
			*/
			var nameStr = '';
			if(_value){
				//存在值进行code转换
				var codeData = provinceSelect.data[_value];
				var proJson = {};
				if(!$.isEmptyObject(codeData.area)){
					//当前值是区域值  通过区域值获取到市的数据 再通过市的数据获取到省的数据
					proJson = provinceSelect.data[codeData.city.code];
					proJson.area = codeData.area;
				}else if(!$.isEmptyObject(codeData.city)){
					//当前值是市  可以获取到市和省的数据
					proJson = codeData;
				}else{
					//当前值是省的数据
					proJson = codeData;
				}
				//拼接省市区的值以逗号分割
				var nameStrArr = ['pro','city','area'];
				for(var indexI=0;indexI<nameStrArr.length;indexI++){
					if(!$.isEmptyObject(proJson[nameStrArr[indexI]])){
						nameStr += proJson[nameStrArr[indexI]].name + ',';
					}
				}
				nameStr = nameStr.substring(0,nameStr.length-1);
			}
			return nameStr;
		},//省市区code码转换
		chargeDictionary:function(_value,_format){
			/*  
				_value 当前值
				_format 字典值 如{'male':'1','female':'2'}
			*/
			var dictionaryValue;
			var isSingle = true; //默认读取单个字典
			if(typeof(_value)=='string'){
				//是字符串类型并且还有逗号分割 认为要处理多个字典显示
				if(_value.indexOf(',')>-1){
					isSingle = false;
				}
			}
			if(isSingle){
				$.each(_format, function (key, value) {
					if (key == _value) {
						//找到相对应的值终止查找
						dictionaryValue = value;
						return false; 
					}
				});
				if(dictionaryValue){
					var reg = /[switch]/; 
					if(!reg.test(dictionaryValue)){
						//如果字典值里面还有switch则输出标签
						dictionaryValue = '<label>'+dictionaryValue+'</label>';
					}
				}
			}else{
				var dataArray = _value.split(',');
				for(var dataI=0; dataI<dataArray.length; dataI++){
					dictionaryValue += '<label>'+_format[dataArray[dataI]]+'</label>';
				}
			}
			return dictionaryValue;
		},//字典转换
		chargeFunc:function(_value,_format,data){
			var value = _value;
			if(typeof(_format)=='function'){
				value = _format(_value,data);
			}
			return value;
		},//自定义方法
		chargeFormatType:function(_value,_format){
			/*
				*_format {
					type:money/number/date/string
					format:',.000',
				}
			*/
			var isNumberMatch = /\d+$/;//是否验证数字
			var isMoneyMatch = /^([1-9][0-9]*(,[0-9]{3})*(\.[0-9]+)?)$/;//是否是货币类型
			var matchvalue = _value;
			var formatMatch = _format.format;
			switch(_format.type){
				case 'money':
					if (isNumberMatch.test(matchvalue)) {
						//验证全部是数字
						formatMatch = formatMatch.substring(formatMatch.indexOf('.') + 1, formatMatch.length);
						matchvalue = baseDataTable.formatMoney(matchvalue,formatMatch.length,'');
					}
					break;
				case 'number':
					var precision = 0;
					if(formatMatch.indexOf('.') > -1){
						precision = formatMatch.substring(formatMatch.indexOf('.') + 1, formatMatch.length);
						precision = precision.length;
					}
					if(isNumberMatch.test(_value)){
						//当前值可以转换成数字
						matchvalue = Number(_value);
						matchvalue = matchvalue.toFixed(precision);
					}else if(isMoneyMatch.test(_value)){
						//当前值是货币类型,把值转换成数值类型
						matchvalue = _value.replace(/,/g, '');
						matchvalue = Number(matchvalue);
						matchvalue = matchvalue.toFixed(precision);
					}else{
						if(debugerMode){
							console.error('表格数据格式化处理错误，只支持数字和文本转换为带小数点的数字');
							console.error(currentvalue);
							console.error(format);
						}
					}
					break;
				case 'date':
					var olbFormat = 'YYYY-MM-DD';
					var newFormat = 'yyyy-MM-DD';
					if(typeof(formatMatch) == 'object'){
						for(var formatI in formatMatch){
							olbFormat = formatI;
							newFormat = formatMatch[formatI];
						}
					}
					if(moment(matchvalue, olbFormat).isValid()){
						//通过则可以转换为日期型
						matchvalue = moment(matchvalue).format(newFormat);
					}
					break;
				case 'string':
					matchvalue = matchvalue.toString();
					break;
			}
			return matchvalue;
		},//自定义类型输出转换
	},//自定义formatHandler
	component:{
		//vue 组件定义
		list:{
			head:Vue.component('list-title',{
				template:'<thead><tr><th @click="orderSortBy">姓名</th><th>性别</th><th>年龄</th></tr></thead>',
				data:function(){
					
				},
				methods:{
					orderSortBy:function(){
						console.log(this)
					}
				}
			}),
			contend:Vue.component('list-body',{
				template:'<tbody><tr><td>AAA</td><td>nan</td><td>39</td></tr></tbody>'
			}),
			init:{
				template:'<table class="table table-singlerow table-hover table-bordered table-striped dataTable no-footer">'
							+'<list-title></list-title>'
							+'<list-body></list-body>'
						+'</table>',
			}
		}
	},
	init:{
		listInit:function(_configObj){
			var config = $.extend(true,{},_configObj);
			config.data.tableId = 'table-'+config.id;
			nsVue.table[config.data.tableId] = {
				originalConfig:_configObj
			};
			var dataSource = config.data.dataSource;//表格数据
			var columns = config.columns;//表格列
			var vm = new Vue({
				el:'#'+config.id,
				data:{
					list:dataSource,
					columns:columns
				},
				components:{
					'ui-list':nsVue.component.list.init
				}
			})
		}	
	},
}