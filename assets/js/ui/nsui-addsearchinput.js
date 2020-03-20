/********************************************************************
 * 增删一体输入框
 */
nsUI.addSearchInput = {};
nsUI.addSearchInput.init = function(config){
	var $input = $('#'+config.fullID);

	var columnNum = 0; 
	var columnTitle = [];	
	var columnType = [];
	var columnData = [];
	var columnWidth = [];
	var dataSearch = [];
	var dataAjax = [];
	var dataKey = [];
	var dataTitle = [];

	var autoWidthColumnNum = 0   	//自动计算的列数量
	var autoWidthColumnTotal = 0	//自动计算的列宽度 百分比
	for(var col = 0; col<config.localDataConfig.length; col++){
		if(config.localDataConfig[col].visible){
			columnData[config.localDataConfig[col].visible-1] = col;
			columnNum++;
		}
		if(config.localDataConfig[col].search!=false){
			//search是默认可搜索
			dataSearch.push(col);
		}
		if(config.localDataConfig[col].ajax){
			dataAjax.push(col);
		}
		if(config.localDataConfig[col].key){
			dataKey.push(config.localDataConfig[col].key);
		}else{
			dataKey.push(-1);
		}
		if(config.localDataConfig[col].title){
			dataTitle.push(config.localDataConfig[col].title);
		}else{
			dataTitle.push('');
		}
	}
	
	for(var colI = 0; colI<columnData.length; colI++){
		var currentData = config.localDataConfig[columnData[colI]];
		columnTitle.push(currentData.title);
		columnType.push(currentData.type);
		if(typeof(currentData.width)=='undefined'){
			autoWidthColumnNum++;
		}else if(typeof(currentData.width)=='number'){
			autoWidthColumnTotal+=currentData.width;
		}else{
			nsalert(language.ui.nsuiaddsearchinput.currentDataError,'error');
		}
		columnWidth.push(currentData.width);
	}

	//计算列宽
	if(autoWidthColumnNum>0){
		if(autoWidthColumnTotal<=100){
			var columnWidthStr = parseInt(((100-autoWidthColumnTotal)/autoWidthColumnNum)*1000)/1000+'%';
			for(var i=0; i<columnWidth.length; i++){
				if(typeof(columnWidth[i])=='undefined'){
					columnWidth[i] = columnWidthStr;
				}else{
					columnWidth[i] = columnWidth[i]+'%';
				}
			}
		}else{
			nsalert(language.ui.nsuiaddsearchinput.autoWidthColumnNum);
		}
	}
	// 格式化宽度
	if(columnWidth.length>0){
		for(var i=0;i<columnWidth.length;i++){
			columnWidth[i] = columnWidth[i].toString();
			if(columnWidth[i].indexOf('%')==-1){
				columnWidth[i] += '%';
			}
		}
	}

	config.columnData  = columnData;		//显示列数据
	config.columnType  = columnType; 		//显示列类型
	config.columnNum   = columnNum; 		//列数量
	config.columnWidth = columnWidth; 		//列宽
	config.columnTitle = columnTitle; 		//标题数组

	config.dataSearch = dataSearch;			//可以搜索的数组
	config.dataAjax   = dataAjax;			//发送请求要的参数

	config.dataKey    = dataKey; 			//key 每个数据对象都有 没有的是-1
	config.dataTitle  = dataTitle; 			//标题 每个数据对象都有 没有的是''
	//激活方法
	function clickHiddenPlaneHandler(ev){
		//点击屏幕无关位置关闭弹框
		$(document).off('click',clickHiddenPlaneHandler);
		if($(ev.target).closest('.result-plane').length==0){
			if($(ev.target).closest('.add-select-input-btn').length==0){
				$input.parent().children('.result-plane').remove();
			}
		};
	}
	

	var $refreshBtn = $input.parent().children('[ns-control="refresh"]');
	var $listBtn = $input.parent().children('[ns-control="list"]');

	function inputFocusHandler(ev){
		//$input.off('focus');
		$input.on('blur',function(ev){
			$input.off('blur');
			//$input.on('focus',inputFocusHandler);
			$(document).on('click',clickHiddenPlaneHandler);
		})
		var isHadInit = typeof(config.isHadInit) == 'boolean' ? config.isHadInit : false;
		if((typeof(config.localDataArr)=='undefined'||config.localDataArr.length==0)&&!isHadInit){
			if(typeof(config.isHadInit) == 'undefined'){
				config.isHadInit = true; // 已经初始化
			}
			getRefreshAjaxData();
		}else{
			if(typeof(config.isHadInit) == 'undefined'){
				config.isHadInit = true; // 已经初始化
			}
			nsUI.addSearchInput.top10Plane(config,$input);
			var evData = {};
				evData.input = $input;
				evData.config = config;
			$input.on('keyup', evData, nsUI.addSearchInput.inputKeyHandler);
		}
		
	}
	//如果是需要转换的数据 则把标准的[{},{}]转化为[[],[]]
	function getTransformObject(dataArray){
		var localDataArr = [];
		for(var indexI = 0; indexI < dataArray.length; indexI++){
			//要插入的数据对象，第一个值是索引下标
			var dataArrayData = [indexI];

			//根据字段值转换为数组
			for(var feildI = 1; feildI<config.localDataConfig.length; feildI++){
				var valueKey = config.localDataConfig[feildI].key;
				//如果不存在则加空''
				if(dataArray[indexI][valueKey]){
					dataArrayData.push(dataArray[indexI][valueKey]);
				}else{
					dataArrayData.push('');
				}
			}
			localDataArr.push(dataArrayData);
		}
		return localDataArr;
	}
	// 获得刷新数据 lyw isComplete 判断是否有complete方法点击刷新执行时为true
	function getRefreshAjaxData(isComplete, isShow){
		var timestamp = new Date().getTime();
		timestamp = {'timestamp':timestamp};
		var typeStr = typeof(config.refreshAjaxType)=='string'?config.refreshAjaxType:'post';
		isShow = typeof(isShow)=='boolean'?isShow:true;
		var ajaxData = {
			url:config.refreshAjax,
			data:timestamp,
			dataType:'json',
			type:typeStr,
			success:function(data){
				var resData = data.data;
				if(typeof(resData)=='undefined'){resData = data.rows;}
				if(typeof(resData)=='string'){
					resData = eval(resData);
				}
				if($.isArray(resData)){
					if(resData.length>0&&!$.isArray(resData[0])){
						config.localDataArr = getTransformObject(resData);
					}else{
						config.localDataArr = resData;
					}
					if(isShow){
						if($input.parent().children('.result-plane').length>0){
							nsUI.addSearchInput.top10Plane(config, $input);
							$input.focus();
						}else{
							//面板未打开，且有选中值
							nsUI.addSearchInput.clearValue(config,$input,false);
						}
					}else{
						// 设置value值
						var valueArr = [];
						for(var i=0;i<config.localDataArr.length;i++){
							var valueId = config.localDataArr[i][config.submitIndex];
							if(valueId==config.value){
								valueArr = config.localDataArr[i];
								break;
							}
						}
						if(valueArr.length>0){
							// valueArr排序
							var localDataConfig = $.extend(true, [], config.localDataConfig);
							var visibleArr = [];
							for(var i=0;i<localDataConfig.length;i++){
								if(typeof(localDataConfig[i].visible)=="number"){
									localDataConfig[i].sourceCol = i;
									visibleArr.push(localDataConfig[i]);
								}
							}
							visibleArr.sort(function(a,b){
								a.visible-b.visible;
							});
							if(typeof(localDataConfig[config.submitIndex].visible)!="number"){
								localDataConfig[config.submitIndex].sourceCol = config.submitIndex;
								visibleArr.push(localDataConfig[config.submitIndex]);
							}
							for(var i=0;i<localDataConfig.length;i++){
								if(localDataConfig[i].key=="index"){
									localDataConfig[i].sourceCol = i;
									visibleArr.push(localDataConfig[i]);
									break;
								}
							}
							var _valueArr = [];
							for(var i=0;i<visibleArr.length;i++){
								_valueArr.push(valueArr[visibleArr[i].sourceCol]);
							}
							nsUI.addSearchInput.fillValue(_valueArr, config, $input);
						}
					}
				}else{
					nsalert(language.ui.nsuiaddsearchinput.localDataArr,'error');
				}
				
			},
			error:function(error){
				nsalert(language.ui.nsuiaddsearchinput.localDataArrError,'error');
				console.log(error);
			},
		}
		if(isComplete){
			ajaxData.complete = function(){
				$refreshBtn.children('i').removeClass('fa-spin');
			};
		}
		if(config.contentType){
			if(config.contentType == 'application/json'){
				ajaxData.contentType = 'application/json';
				ajaxData.data = JSON.stringify(ajaxData.data);
			}
		}
		$.ajax(ajaxData);
	}
	if(typeof(config.value)=="string"&&config.value!=""){
		getRefreshAjaxData(false, false);
	}
	if(config.readonly == false){
		$input.on('focus',inputFocusHandler);
		//按钮事件
		$refreshBtn.on('click',function(ev){
			$refreshBtn.children('i').addClass('fa-spin');
			getRefreshAjaxData(true);
		})
		if(typeof(config.listHandler)=='undefined'){
			$listBtn.remove();
		}else{
			$listBtn.on('click',function(ev){
				var handlerObj = {};
				var handlerID = $('#'+config.fullHiddenID).val();
				if(handlerID==''){
					handlerObj = -1;
				}else{
					for(var dataI=0; dataI<config.localDataArr.length; dataI++){
						if(config.localDataArr[dataI][1]==handlerID){
							for(var keyI=0; keyI<config.dataKey.length; keyI++){
								handlerObj[config.dataKey[keyI]] = config.localDataArr[dataI][keyI];
							}
						}
					}
				}
				config.listHandler(handlerObj);
			})
		}
	}else{
		//$input.off('focus');
		$refreshBtn.off('click');
		$listBtn.off('click');
	}
}
//选中数据
nsUI.addSearchInput.selectRow = function(rowID,config,$input){
	var valueArr = [];
	for(var cdI = 0; cdI<config.columnData.length; cdI++){
		valueArr.push(config.localDataArr[rowID][config.columnData[cdI]]);
	}
	if(valueArr.length == 2){valueArr.push('');}//sjj20181029 valueArr长度值判断
	valueArr[3] = config.localDataArr[rowID][config.localDataHiddenIDIndex];
	valueArr[4] = config.localDataArr[rowID][0];
	nsUI.addSearchInput.fillValue(valueArr,config,$input);
	//nsUI.addSearchInput.setValue
	$(document).off('keyup', nsUI.addSearchInput.documentKeyHandler);

	//如果没有配验证数据接口，则不验证
	if(!typeof(config.confirmAjax)=='string'){
		return false;
	}
	//发送ajax验证数据是否正确
	var ajaxData = {};
	for(var adI=0; adI<config.dataAjax.length; adI++){
		ajaxData[config.dataKey[config.dataAjax[adI]]] = config.localDataArr[rowID][config.dataAjax[adI]];
	}
	if(config.localDataAjaxData){
		$.each(config.localDataAjaxData,function(key,value){
			ajaxData[key] = config.localDataArr[rowID][value];
		})
	}
	//如果未定义验证组件则不用继续,直接调用回调函数
	if(typeof(config.confirmAjax)=='undefined'){
		if(typeof(config.completeHandler)=='function'){
			if(config.isCompleteClear){
				nsUI.addSearchInput.clearValue(config,$input,true);
			}
			config.completeHandler(ajaxData);
		}
		return false;
	}
	//有验证组件，发送ajax获取是否验证成功
	var typeStr = typeof(config.confirmAjaxType)=='string'?config.confirmAjaxType:'post';
	$.ajax({
		url:config.confirmAjax,
		data:ajaxData,
		dataType:'json',
		type:typeStr,
		success:function(data){
			if(data.success){
				//nsalert('验证成功');
				if(config.isCompleteClear){
					nsUI.addSearchInput.clearValue(config,$input,true);
				}
				if(typeof(config.completeHandler)=='function'){
					var rowData = {};
					//返回参数包含显示字段和发送ajax的字段
					var returnFields = [];
					returnFields = returnFields.concat(config.columnData);
					returnFields = returnFields.concat(config.dataAjax);
					for(var columnI=0; columnI<returnFields.length; columnI++){
						rowData[config.dataKey[returnFields[columnI]]] = config.localDataArr[rowID][returnFields[columnI]];
					}
					//两个拼接后生成回调
					config.completeHandler(rowData,config);
				}
			}else{
				nsalert(language.ui.nsuiaddsearchinput.validationFailure+data.msg,'error');
			}
		},
		error:function(error){
			nsalert(error,'error');
		}

	})
}
//输入框输入事件
nsUI.addSearchInput.currentKeyValue = '';
nsUI.addSearchInput.inputKeyHandler = function(ev){
	var $input = ev.data.input;
	var config = ev.data.config;
	var dataArr = config.localDataArr;
	var inputValue = $.trim($input.val());
	if(inputValue==''){
		//如果空则读取头10条;
		if(nsUI.addSearchInput.currentKeyValue != inputValue){
			nsUI.addSearchInput.top10Plane(config,$input)
		}
	}else{
		//有输入文字，过滤数据
		if(nsUI.addSearchInput.currentKeyValue != inputValue){
			//输入不同刷新
			nsUI.addSearchInput.currentKeyValue = inputValue;
			var top10Arr = [];
			for(var i = 0; i<dataArr.length; i++){
				var isFit = false;
				for(var currentItemI = 2; currentItemI<dataArr[i].length; currentItemI++){
					//在当前数组中搜索，0是序列号，不能用于搜索
					if(dataArr[i][currentItemI].indexOf(inputValue)>-1){
						isFit = true;
						top10Arr.push(dataArr[i]);
						break;
					}
				}
				if(top10Arr.length >= 9){
					i = dataArr.length;
				}
			}
			nsUI.addSearchInput.getPlane(top10Arr,config,$input,inputValue);
		}
	}
}
//保存新客户 发送ajax
nsUI.addSearchInput.save = function(saveData,config,$input){

	//生成填充
	var valueArr = []
	$.each(saveData,function(key,value){
		valueArr.push(value);
	})
	valueArr.push('');
	valueArr.push(-1);
	nsUI.addSearchInput.fillValue(valueArr,config,$input);

	var ajaxConfig = {};
	//config.add是后来添加的属性，支持标准ajax参数，早期方法只支持config.addAjax：url， config.addAjaxType：str(get/post)
	if(typeof(config.add)=='object'){
		ajaxConfig.url = config.add.url;
		ajaxConfig.data = saveData;
		ajaxConfig.type = config.add.type;
		ajaxConfig.dataType = 'json',
		ajaxConfig.dataSrc = config.add.dataSrc;
		ajaxConfig.contentType = config.add.contentType;
		//新项目如果为POST时候 支持contentType方法
		if(ajaxConfig.contentType){
			if(ajaxConfig.type.toLocaleUpperCase() == 'POST'){
				//ajaxConfig.contentType = "application/json; charset=utf-8";
				// ajaxConfig.contentType = config.addAjaxContentType;
				if(ajaxConfig.contentType =="application/json; charset=utf-8"){
					ajaxConfig.data = JSON.stringify(ajaxConfig.data);
				}
			}
		}
	}else{
		//兼容早期参数格式 只能定义config.addAjax 和 config.addAjaxType
		ajaxConfig = {
			url:config.addAjax,
			data:saveData,
			dataType:'json',
			type:typeof(config.addAjaxType)=='string'?config.addAjaxType:'post',
			dataSrc:'data',
		}
	}
	nsVals.ajax(ajaxConfig, addAjaxHandler, true)
	function addAjaxHandler(res){
		//报错处理
		if(res.success == false){
			// nsalert(language.ui.nsuiaddsearchinput.addError+data.msg,'error');
			nsalert(language.ui.nsuiaddsearchinput.addError+res.msg,'error'); // lyw 不知道data是什么
			return;
		}
		//保存正确
		var resData = res[ajaxConfig.dataSrc];
		nsalert(language.ui.nsuiaddsearchinput.addSuccess);
		//服务器回传的数据格式是json不是数组

		if(config.isCharge){
			//根据字段值转换为数组
			var newDataArray = [config.localDataArr.length];

			for(var feildI = 1; feildI<config.localDataConfig.length; feildI++){
				var valueKey = config.localDataConfig[feildI].key;
				//如果不存在则加空''
				if(resData[valueKey]){
					newDataArray.push(resData[valueKey]);
				}else{
					newDataArray.push('');
				}
			}
			
		}else{
			var newDataArray = resData;
		}
		config.localDataArr.unshift(newDataArray);

		if(typeof(config.completeHandler)=='function'){
			config.completeHandler(resData,config);
		}
			// console.warn('save ing')
			// console.warn(resData);
			// debugger
			// if(data.success){
			// 	nsalert(language.ui.nsuiaddsearchinput.addSuccess);
			// 	var resultArr = [];
			// 	$.each(saveData,function(key,value){
			// 		resultArr.push(value);
			// 	})
			// 	if(typeof(data.data)=='string'){
			// 		data.data = eval(data.data)[0];
			// 	}else if($.isArray(data.data)){
			// 		data.data = data.data[0];
			// 	}else{
			// 		nsalert(language.ui.nsuiaddsearchinput.saveFailure,'error');
			// 	}
			// 	resultArr.push(data.data[config.localDataHiddenIDIndex]);
			// 	resultArr.push(0);
			// 	nsUI.addSearchInput.fillValue(resultArr,config,$input);
			// 	for(var dataI=0; dataI<config.localDataArr.length; dataI++){
			// 		config.localDataArr[dataI][0] = config.localDataArr[dataI][0]+1;
			// 	}
				
			// 	data.data[0] = 0;
			// 	config.localDataArr.unshift(data.data);
			// 	if(config.isCompleteClear){
			// 		nsUI.addSearchInput.clearValue(config,$input,true);
			// 	}
			// 	if(typeof(config.completeHandler)=='function'){
			// 		var rowData = {};
			// 		debugger
			// 		for(var columnI=0; columnI<config.columnData.length; columnI++){
			// 			rowData[config.dataKey[config.columnData[columnI]]] = config.localDataArr[rowID][config.columnData[columnI]];
			// 		}

			// 		config.completeHandler(rowData,config);
			// 	}
			// 	//回填数组未添加
			// }else{
			// 	nsalert(language.ui.nsuiaddsearchinput.addError+data.msg,'error');
			// }
		}
}
//整体接收的键盘事件
nsUI.addSearchInput.documentKeyHandler = function(ev){
	var $input = ev.data.input;
	var config = ev.data.config;
	var $plane = $input.parent().children('.result-plane');
	var $currentRow = $plane.children('.current');
	if(ev.keyCode=='13'){
		//回车确认
		if($currentRow.length>0){
			var currentRowID = parseInt($currentRow.attr('rowindexid'));
			nsUI.addSearchInput.selectRow(currentRowID,config,$input);
		}else{
			var addRow =  $plane.children('.add');
			if(addRow.length==1){
				var addRowSpan = addRow.find('a span');
				var addRowData = {};
				var isNeedConfirm = false;
				for(var spanI=0;  spanI<addRowSpan.length; spanI++){
					addRowData[config.dataKey[config.columnData[spanI]]] = $(addRowSpan[spanI]).html();
					if($(addRowSpan[spanI]).html()==language.ui.nsuiaddsearchinput.addRowData){
						isNeedConfirm = true;
					}
				}
				if(isNeedConfirm){
					nsConfirm(language.ui.nsuiaddsearchinput.nsConfirm,'warning');
				}
				nsUI.addSearchInput.save(addRowData,config,$input);
			}
		}
		
	}else if(ev.keyCode=='40'){
		//下箭头 下移
		if($currentRow.next().hasClass('plane-content')){
			$currentRow.removeClass('current');
			$currentRow.next().addClass('current');
			currentRow = $currentRow.next();
		};
	}else if(ev.keyCode=='38'){
		//上箭头 上移
		if($currentRow.prev().hasClass('plane-content')){
			$currentRow.removeClass('current');
			$currentRow.prev().addClass('current');
			currentRow = $currentRow.prev();
		};
	}else if(ev.keyCode=='27'){
		//ESC 关闭
		nsUI.addSearchInput.closePlane(config, $input);
	}
}
//初始化面板数据
nsUI.addSearchInput.top10Plane = function(config, $input){
	if($input.val()==''){
		nsUI.addSearchInput.currentKeyValue = '';
		var emptyValueArr = [];
		var topNum = config.localDataArr.length>=10?10:config.localDataArr.length;
		for(var topI=0; topI<topNum; topI++){
			emptyValueArr.push(config.localDataArr[topI]);
		}
		nsUI.addSearchInput.getPlane(emptyValueArr,config,$input);
	}
}
//获得面板
nsUI.addSearchInput.getPlane = function(dataArr, config,$input,inputValue){
	var rowsHtml = '';
	var planeContentIDArr = [];

	function getPlaneRowHtml(data,indexID){
		//获取行代码
		var currentRowClass = '';
		if(indexID==0){
			currentRowClass = 'current';
		}
		var columnDataArr = [];
		for(var titleI = 0; titleI<config.columnData.length; titleI++){
			columnDataArr.push(data[config.columnData[titleI]]);
		}
		var rowHtml = '';
		if(typeof(inputValue)=='undefined'){
			inputValue = '';
		}

		for(var colI=0; colI<columnDataArr.length; colI++){
			if(inputValue!=''){
				columnDataArr[colI] = columnDataArr[colI].replace(inputValue,'<b>'+inputValue+'</b>');
			}
			rowHtml+='<span style="width:'+config.columnWidth[colI]+'">'+columnDataArr[colI]+'</span>';
		}
		rowHtml = 
				'<div class="plane-content '+currentRowClass+'" rowIndexID = "'+data[0]+'">'
					+'<a href="javascript:void(0);">'
					+rowHtml
					+'</a>'
				+'</div>'
		return rowHtml;
	}
	function getPlaneTitleHtml(config){
		//获取标题代码
		planeTitleHtml = '';
		for(var titleI=0; titleI<config.columnTitle.length; titleI++){
			planeTitleHtml += '<span style="width:'+config.columnWidth[titleI]+'">'+config.columnTitle[titleI]+'</span>';
		}
		planeTitleHtml = '<div class="plane-title">'+planeTitleHtml+'</div>';
		return planeTitleHtml;
	}
	
	if(dataArr.length>0){
		//有数据
		planeTitleHtml = getPlaneTitleHtml(config);
		for(var i=0; i<dataArr.length; i++){
			rowsHtml+= getPlaneRowHtml(dataArr[i],i);
		}
	}else{
		//没有数据
		planeTitleHtml = '';
		//emptyDataInfo
		var emptyStr = language.ui.nsuiaddsearchinput.planeTitleHtml;
		if(config.emptyDataInfo){
			emptyStr = config.emptyDataInfo;
		}
		rowsHtml = '<div class="empty">'+emptyStr+'</div>';
		if(inputValue.indexOf(' ')>-1){
			var newRecordHtml = '';
			var inputValueArr = inputValue.split(' ');

			//获得配置文件中数字类型的数量
			var typeNumber = 0;			//一共有几个数字类型的字段
			var typeString = 0;			//一共有几个字符类型的字段
			var typeNumberIndex = []; 	//储存数字类型的位置
			var typeStringIndex = []; 	//储存数字类型的位置
			var outputArr = [];
			for(var colI=0; colI<config.columnType.length; colI++){
				if(config.columnType[colI] == 'number'){
					typeNumber ++;
					typeNumberIndex.push(colI);
				}else if(config.columnType[colI] == 'string'){
					typeString ++;
					typeStringIndex.push(colI);
				}
				outputArr.push('');
			}
			
			var inputString = 0;		//一共有几个数字类型的输入值
			var inputNumber = 0;		//一共有几个数字类型的输入值
			var inputNumberIndex = []; 	//储存数字类型的位置
			var inputStringIndex = []; 	//储存数字类型的位置
			for(var ivI=0; ivI<inputValueArr.length; ivI++){
				var regNumber = new RegExp("^[0-9]*$");
				var isNumber = regNumber.test(inputValueArr[ivI]);
				if(isNumber){
					inputNumber++;
					inputNumberIndex.push(ivI);
				}else{
					inputString++;
					inputStringIndex.push(ivI);
				}
			}

			//重新组织输入字符串中的数据
			//处理数字输入值,必须配置值里有数字
			if(typeNumber>0&&inputNumber>0){
				if(typeNumber<=inputNumber){
					//如果输入值和配置值中的数字数量一样，或者小于，则按顺序赋值
					for(var tI = 0; tI<typeNumberIndex.length; tI++){
						outputArr[typeNumberIndex[tI]] = inputValueArr[inputNumberIndex[tI]];
					}
				}else if(typeNumber>inputNumber){
					//配置中的数字大于1，且数量大于输入数量，则将多余的填充
					for(var tI = 0; tI<typeNumberIndex.length; tI++){
						if(typeof(inputValueArr[inputNumberIndex[tI]])!='undefined'){
							outputArr[typeNumberIndex[tI]] = inputValueArr[inputNumberIndex[tI]];
						}else{
							outputArr[typeNumberIndex[tI]] = inputValueArr[inputNumberIndex[0]];
						}
					}
				}
			}
			//对空字段填充值
			var outputNumber = 0;
			var outputString = 0;
			for(var outputI = 0; outputI<outputArr.length; outputI++){
				if(outputArr[outputI]==''){
					if(config.columnType[outputI]=='string'){
						if(typeof(inputValueArr[inputStringIndex[outputString]])!='undefined'){
							outputArr[outputI] = inputValueArr[inputStringIndex[outputString]];
						}else{
							if(inputStringIndex.length==0){
								outputArr[outputI] = inputValueArr[inputValueArr.length-1];
							}else{
								outputArr[outputI] = inputValueArr[inputStringIndex[inputString-1]];
							}
						}
						
						outputString++;
					}else if(config.columnType[outputI]=='number'){
						outputArr[outputI] = inputValueArr[inputNumberIndex[outputNumber]];

						if(typeof(inputValueArr[inputNumberIndex[outputNumber]])!='undefined'){
							outputArr[outputI] = inputValueArr[inputNumberIndex[outputNumber]];
						}else{
							if(inputNumberIndex.length==0){
								//一个数字都米有
								outputArr[outputI] = language.ui.nsuiaddsearchinput.addRowData
							}else{
								outputArr[outputI] = inputValueArr[inputNumberIndex[inputNumber-1]];
							}
						}
						outputNumber++;
					}
				}
			}

			for(var opI=0; opI<outputArr.length; opI++){
				newRecordHtml +='<span style="width:'+config.columnWidth[opI]+'">'+outputArr[opI]+'</span>'; 
			}

			newRecordHtml = 
				'<div class="plane-content add'+'" rowIndexID = "">'
					+'<a href="javascript:void(0);">'
					+newRecordHtml
					+'</a>'
				+'</div>'
			rowsHtml = rowsHtml+newRecordHtml;
			planeTitleHtml = getPlaneTitleHtml(config);
		}
		
	}
	
	var $plane = $input.parent().children('.result-plane');

	if($plane.length==0){
		//还没有面板，添加面板，并且加上事件
		$input.after('<div class="result-plane">'+rowsHtml+planeTitleHtml+'</div>')
		var evData = {};
		evData.input = $input;
		evData.config = config;
		$(document).off('keyup');
		$(document).on('keyup',evData,nsUI.addSearchInput.documentKeyHandler);
		$input.parent().children('.result-plane').children('.plane-content').off('click');
		$input.parent().children('.result-plane').children('.plane-content').on('click',function(ev){
			var rowID = parseInt($(this).attr('rowindexid'));
			nsUI.addSearchInput.selectRow(rowID,config,$input);
		})
	}else{
		//已经有了面板，只是更新数据即可
		$plane.html(rowsHtml+planeTitleHtml);
		$input.parent().children('.result-plane').children('.plane-content').off('click');
		$input.parent().children('.result-plane').children('.plane-content').on('click',function(ev){
			var rowID = parseInt($(this).attr('rowindexid'));
			nsUI.addSearchInput.selectRow(rowID,config,$input);
		})
	}
}
//关闭面板
nsUI.addSearchInput.closePlane = function(config, $input){
	$input.parent().children('.result-plane').remove();
	$(document).off('keyup', nsUI.addSearchInput.documentKeyHandler);
	//激活方法
	// $input.on('focus',function(ev){
	// 	//$input.off('focus')
	// 	nsUI.addSearchInput.top10Plane(config,$input);
	// 	var evData = {};
	// 		evData.input = $input;
	// 		evData.config = config;
	// 	$input.on('keyup', evData, nsUI.addSearchInput.inputKeyHandler);
	// })
}
//填充值 
//valueArr是所用的数据，0是标题，1、2是备注，3是ID
nsUI.addSearchInput.fillValue = function(valueArr,config,$input){
	var valueText = valueArr[0]+' '+valueArr[1]+' '+valueArr[2];
	$input.val(valueText);
	$("#"+config.fullHiddenID).val(valueArr[3]);
	var classStr = '';
	if(typeof(config.listHandler)=='undefined'){
		classStr = 'style = "right:28px;"';
	}else{
		classStr = 'style = "right:56px;"';
	}
	//sjj20181029
	var remarkStr = valueArr[1];
	if(valueArr[2]){
		remarkStr += ': '+valueArr[2];
	}
	var valueHtml = '<div class="value-tag"'+classStr+'>'+valueArr[0]+' <span class="remark">（'+remarkStr+'）</span>'+'<div class="handler-btn">X</div></div>'
	$input.parent().append(valueHtml);
	//添加关闭按钮事件

	//$input.parent().find('.value-tag .handler-btn').on('click',function(ev){
	$input.parent().find('.value-tag').on('click',function(ev){
		$(this).off('click');
		nsUI.addSearchInput.clearValue(config,$input);
	})
	//回调函数
	if(typeof(config.changeHandler)=='function'){
		var func = config.changeHandler;
		func(valueArr[3]);
	}
	//移除面板
	nsUI.addSearchInput.closePlane(config, $input);
}
//清除数据
nsUI.addSearchInput.clearValue = function(config,$input,isNotOpenPlane){
	//isNotOpenPlane 是否准备再次输入
	$input.val('');
	$("#"+config.fullHiddenID).val('');
	$input.parent().children('.value-tag').remove();
	
	if(isNotOpenPlane){
		//仅仅关闭不准备输入
	}else{
		$input.focus();
		nsUI.addSearchInput.top10Plane(config,$input);
	}
}
//setValue方法赋值
nsUI.addSearchInput.setValue = function(id,formID,value){
	var configData = formPlane.data[formID].formInput[id];
	var currentData = '';
	for(var valueI = 0; valueI<configData.localDataArr.length; valueI++){
		if(configData.localDataArr[valueI][configData.localDataHiddenIDIndex]==value){
			currentData = configData.localDataArr[valueI];
			break;
		}
	}
	var inputID = 'form-'+formID+'-'+id;
	if(currentData!=''){
		var fillValuesArr = [];
		for(var columnI = 0; columnI<configData.columnData.length; columnI++){
			fillValuesArr.push(currentData[configData.columnData[columnI]]);
		}
		fillValuesArr.push(currentData[configData.localDataHiddenIDIndex]);
		nsUI.addSearchInput.fillValue(fillValuesArr,configData,$('#'+inputID))
	}else{
		if(value!=''||value!=undefined){
			nsalert(configData.label+language.ui.nsuiaddsearchinput.undefined);
			nsUI.addSearchInput.clearValue(configData,$('#'+inputID),true);
		}
	}
}

//2018327 sjj 根据面板初始化
nsUI.addSearchInput.planeInit = function(_config){
	//config与组件参数一致， 比form用法增加的参数 $container config.baseAjax
	//config.$container 是输出容器
	//config.baseAjax 	是ajax返回的数据
	var config = _config;
	function getBaseHtml(){
		var html = '<div class="nsui-addsearchinput">'
					+'<label class="label-title">'+config.baseData.label+'</label>'
					+'<div class="form-td">'
						+'<div class="input-group">'
							+'<input type="text" class="form-control" name="'+config.baseData.fullID+'" id="'+config.baseData.fullID+'">'
							+'<a href="javascript:void(0);" class="input-group-btn add-select-input-btn" ns-control="refresh"><i class="fa fa-refresh"></i></a>'
							+'<a href="javascript:void(0);" class="input-group-btn add-select-input-btn" ns-control="list"><i class="fa fa-list"></i></a>'
						+'</div>'
					+'</div>'
				+'</div>';
		return html;
	}

	var html = getBaseHtml();
	config.$container.html(html);
	nsVals.ajax(config.baseAjax,function(data){
		var dataArray = data[config.baseAjax.dataSrc];
		if(debugerMode){
			if(typeof(dataArray)=='undefined'){
				console.error('数据库返回结果有误，不存在有效数据');
				console.error(config.baseAjax);
				console.error(data);
			}
		}
		//如果是需要转换的数据 则把标准的[{},{}]转化为[[],[]]
		if(config.baseData.isCharge){
			var localDataArr = [];
			for(var indexI = 0; indexI < dataArray.length; indexI++){
				//要插入的数据对象，第一个值是索引下标
				var dataArrayData = [indexI];

				//根据字段值转换为数组
				for(var feildI = 1; feildI<config.baseData.localDataConfig.length; feildI++){
					var valueKey = config.baseData.localDataConfig[feildI].key;
					//如果不存在则加空''
					if(dataArray[indexI][valueKey]){
						dataArrayData.push(dataArray[indexI][valueKey]);
					}else{
						dataArrayData.push('');
					}
				}
				localDataArr.push(dataArrayData);
			}
			dataArray = localDataArr
		}
		
		//如果没有有效返回结果，则转为空数组
		if($.isArray(dataArray)==false){
			dataArray = [];
		}
		config.baseData.localDataArr = dataArray;
		nsUI.addSearchInput.init(config.baseData);
	});
	
}