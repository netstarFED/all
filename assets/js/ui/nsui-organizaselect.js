/********************************************************************
 * 组织架构一体搜索框
 */
nsUI.organizaSelect = {};
nsUI.organizaSelect.pageID = 0;//页码
nsUI.organizaSelect.config = {};
/****
*作用：初始化调用
*参数：
	*config config配置参数
*******/
nsUI.organizaSelect.init = function(config){
	var $input = $('#'+config.fullID);//得到input操作dom对象
	nsUI.organizaSelect.pageID = 0;
	//是否进入debugger模式
	if(debugerMode){
		//是否配置了字段属性参数
		if(!$.isArray(config.localDataConfig)){
			console.log(language.ui.nsuiorganizaselect.configlocalDataConfig+config.localDataConfig);
		}
		//是否配置了ajax调用url参数
		if(typeof(config.url)!='string'){
			console.log(language.ui.nsuiorganizaselect.configurl+config.url);
		}
		//ajax中data参数必须是object对象
		if(typeof(config.data) == 'string'){
			console.log(language.ui.nsuiorganizaselect.configdata+config.data);
		}
	}
	//url参数必须是合法的字符串类型
	if(typeof(config.url)!='string'){
		nsalert(language.ui.nsuiorganizaselect.configurl+config.url);
		return false;
	}
	//ajax请求方式get or post，默认是post请求方式
	config.method = typeof(config.method) == 'undefined' ? 'POST' : config.method;
	//ajax参数传送必须是object格式
	config.data = typeof(config.data) == 'undefined' ? {} : config.data;
	var theadTitle = [];//列标题
	var columnsField = [];//列字段
	var primaryKeyID = '';//id
	var rowHandler = {};
	//序列号  列字段值  操作事件 三部分
	for(var colI = 0; colI<config.localDataConfig.length; colI++){
		/************列标题start***************/
		if(config.localDataConfig[colI].title){
			theadTitle.push(config.localDataConfig[colI].title);
		}else{
			theadTitle.push('');
		}
		/************列标题end***************/
		/************保存到库中的主键id start***************/
		if(config.localDataConfig[colI].primaryKey == true){	
			primaryKeyID = config.localDataConfig[colI].key;
		}
		/************保存到库中的主键id end***************/
		/************列字段 start***************/
		if(config.localDataConfig[colI].key){
			columnsField.push(config.localDataConfig[colI].key);
		}
		/************列字段 end***************/
		/************是否有增删改的事件 start***************/
		if(typeof(config.localDataConfig[colI].editHandler)=='function'){
			rowHandler['edit'] = {};
			rowHandler['edit'].text = language.ui.nsuiorganizaselect.rowHandlerEdit;
			rowHandler['edit'].handler = config.localDataConfig[colI].editHandler;
		}
		if(typeof(config.localDataConfig[colI].delHandler)=='function'){
			rowHandler['del'] = {};
			rowHandler['del'].text = language.ui.nsuiorganizaselect.rowHandlerDel ;
			rowHandler['del'].handler = config.localDataConfig[colI].delHandler;
		}
		if(typeof(config.localDataConfig[colI].addHandler)=='function'){
			rowHandler['add'] = {};
			rowHandler['add'].text = language.ui.nsuiorganizaselect.rowHandlerAdd;
			rowHandler['add'].handler = config.localDataConfig[colI].addHandler;
		}
		/************是否有增删改的事件 end***************/
	}
	config.theadTitle = theadTitle;//存放到config配置中的列标题
	config.columnsField = columnsField;//存放到config配置中的列字段
	config.primaryKeyID = primaryKeyID;//存放到config配置中的主字段
	config.rowHandler = rowHandler;//存放到config配置中的事件
	config.$input = $input;
	nsUI.organizaSelect.keyboardFlag = true; //是否确认标识 
	nsUI.organizaSelect.config[config.fullID] = config;
	
	//当前搜索点击事件的触发事件
	var $searchBtn = $input.parent().children('[ns-control="search"]');
	//添加按钮事件
	var $addBtn = $input.parent().children('[ns-control="add"]');
	if(config.readonly == true){
		$searchBtn.off('click');
		$addBtn.off('click');
	}else{
		//获取焦点方法
		$input.on('focus',inputFocusHandler);
		$searchBtn.on('click',function(ev){
			var inputValue = $.trim($(this).parent().children('input[type=text]').val());
			var fullID = $(this).parent().children('input[type=text]').attr('id');
			var config = nsUI.organizaSelect.config[fullID];
			nsUI.organizaSelect.searchHandler(inputValue,config,config.$input);
		});
		$addBtn.on('click',function(ev){
			var inputValue = $.trim($(this).parent().children('input[type=text]').val());
			var fullID = $(this).parent().children('input[type=text]').attr('id');
			var config = nsUI.organizaSelect.config[fullID];
			if(typeof(config.addHandler)=='function'){
				config.addHandler();
			}
		});
	}
	function inputFocusHandler(ev){
		var $input = $(this);
		var fullID = $input.attr('id');
		var config = nsUI.organizaSelect.config[fullID];
		$input.off('focus');
		//触发失去焦点事件
		$input.on('blur',function(ev){
			var $this = $(this);
			$this.off('blur');
			$(document).off('keyup', nsUI.organizaSelect.documentKeyHandler);//关闭键盘按下事件
			$this.on('focus',inputFocusHandler);
			$(document).on('click',clickHiddenPlaneHandler);//点击屏幕关闭方法
		});
		var evData = {};
			evData.input = $input;
			evData.config = config;
		$input.on('keyup', evData, nsUI.organizaSelect.inputKeyHandler);//键盘按下事件
	}
	//激活方法
	function clickHiddenPlaneHandler(ev){
		//点击屏幕无关位置关闭弹框
		//判断当前点击区域是否在指定区域如果没有则移除面板
		if($(ev.target).closest('.organiza-plane').length==0){
			if($(ev.target).closest('.state').length == 0){
				$(document).off('click',clickHiddenPlaneHandler);
				config.$input.parent().children('.organiza-plane').remove();
			}
		};
	}
}
/****
*作用：输入框按下事件
*参数：
	*ev 事件的参数
*******/
nsUI.organizaSelect.inputKeyHandler = function(ev){
	var $input = ev.data.input;
	var config = ev.data.config;
	var inputValue = $.trim($input.val());
	if(ev.keyCode == 13){
		//如果当前按下的是回车事件则触发并关闭按下事件
		nsUI.organizaSelect.keyboardFlag = false;
		nsUI.organizaSelect.searchHandler(inputValue,config,$input);
	}	
}
/****
*作用：搜索事件
*参数：
	*inputValue 当前检索值
	*$input 当前input的dom元素
	*config config配置参数
*******/
nsUI.organizaSelect.searchHandler = function(inputValue,config,$input){
	nsUI.organizaSelect.pageID = 0;
	//发送ajax查询数据
	inputValue = inputValue.toLocaleUpperCase();
	config.data[config.searchField] = inputValue;  //暂时的注释
	//正在查询中
	var html = '<div class="input-loading"><i class="fa fa-circle-o-notch fa-spin fa-fw"></i></div>';
	$input.after(html);
	var formFullID = $input.closest('form').attr('id'); // <form>的id
	var formID = formFullID.substring(5);// 表单定义的id 通过<form>的id获得
	// 判断是否已经初始化了
	// if(config.isInit){
	// 	// 已经初始化
	// 	var formData = nsForm.getFormJSON(formID,false);
	// 	for(var dataAttr in config.formatData){
	// 		// 判断是否有关联参数 false 表示直接传的值不是通过其他字段获得的
	// 		if(config.formatData[dataAttr]){
	// 			// 关联属性赋值
	// 			config.data[dataAttr] = formData[config.formatData[dataAttr]];
	// 			if(config.data[dataAttr]==''){
	// 				delete config.data[dataAttr];
	// 			}
	// 		}
	// 	}
	// }else{
	// 	// 未初始化
	// 	// sourceData/formatData 可能在修改在修改弹框时将data查询的参数进行了处理 所以第一次初始化时不是 {this.***} 格式 因为已经进行了赋值
	// 	if(typeof(config.sourceData)=='undefined'){
	// 		config.sourceData = $.extend(true,{},config.data); // 原始的data
	// 	}
	// 	if(typeof(config.formatData)=='undefined'){
	// 		config.formatData = $.extend(true,{},config.data); // 格式化的data
	// 	}
	// 	if(!$.isEmptyObject(config.data)){
	// 		var markRegexp = /\{(.*?)\}/; // 验证data值是否是‘{***}’样式
	// 		// 通过关联字段的id获得关联data属性值
	// 		function getValueByRelFieldId(fieldId){
	// 			var formAllConfigObj = nsForm.data[formID].formInput; // 当前表单的所有字段配置
	// 			var fieldObj = formAllConfigObj[fieldId]; // 查询关联字段配置对象
	// 			// 没有找到关联字段
	// 			if($.isEmptyObject(fieldObj)){
	// 				return false;
	// 			}
	// 			// 关联字段的value
	// 			var valueStr = '';
	// 			if(typeof(fieldObj.value)=='string'){
	// 				valueStr = fieldObj.value;
	// 			}
	// 			return valueStr;
	// 		}
	// 		// 格式化data数据 关联关系的字段记录对应的字段id，不是关联关系的记为false
	// 		for(var dataAttr in config.data){
	// 			var dataVal = config.data[dataAttr];
	// 			var isHaveRel = markRegexp.test(dataVal); // 是否有关联关系，如果‘{**}’格式则有关联关系
	// 			if(isHaveRel){
	// 				var relField = dataVal.match(markRegexp)[1];
	// 				// 判断是否存在点/‘.’,存在认为关联字段定义正确否则定义错误
	// 				if(relField.indexOf('.')>-1){
	// 					var relFieldArr = relField.split('.');
	// 					var relType = relFieldArr[0];
	// 					var relFieldId = relFieldArr[1];
	// 					config.formatData[dataAttr] = relFieldId;
	// 					switch(relType){
	// 						case 'this':
	// 							// 参数在当前表单数组上
	// 							var dataAttrVal = getValueByRelFieldId(relFieldId);
	// 							if(dataAttrVal===false){
	// 								console.error(config.data[dataAttr]);
	// 								console.error('没有找到该字段对应的关联字段，请检查配置是否正确');
	// 							}else{
	// 								config.data[dataAttr] = dataAttrVal;
	// 								if(config.data[dataAttr]==''){
	// 									delete config.data[dataAttr];
	// 								}
	// 							}
	// 							break;
	// 						case 'page':
	// 							// 参数在当前页面上
	// 							break;
	// 						default:
	// 							// 不能识别
	// 							console.error('关联参数格式错误，应该是this.**/page.**格式，此参数将删除');
	// 							delete dataAttr[dataAttr];
	// 							break;
	// 					}
	// 				}
	// 			}else{
	// 				if(typeof(config.formatData[dataAttr])=='undefined'){
	// 					config.formatData[dataAttr] = false; // 不是和关联属性是设置为false
	// 				}
	// 			}
	// 		}
	// 	}
	// }
	var ajaxData = {
		url:config.url,
		data:config.data,
		type:config.method,
		dataType:'json',
		context:config,
		success:function(data){
			if(data.success){
				config = this;
				//加载完成，显示数据，移除正在加载
				$input.parent().children('.input-loading').remove();
				var dataArr = [];
				if(config.dataSrc.indexOf('.')>-1){
					var dataSrc = config.dataSrc.split('.');
					dataArr = data[dataSrc[0]];
					for(var i=1; i<dataSrc.length; i++){
						dataArr = dataArr[dataSrc[i]];
					}
				}else{
					dataArr = data[config.dataSrc];
				}
				config.dataArr = dataArr;//存放config配置中的数据
				nsUI.organizaSelect.getTabPlane(config);//得到面板
				config.isInit = true;
			}else{
				nsalert(language.ui.nsuiaddsearchinput.validationFailure+data.msg,'error');
			}
		},
		error:function(error){
			nsalert(error,'error');
		}
	}
	if(config.contentType == 'application/json'){
		ajaxData.contentType = 'application/json';
		ajaxData.data = JSON.stringify(ajaxData.data);
	}
	$.ajax(ajaxData);
}
nsUI.organizaSelect.refreshAJAX = function(fullID){
	var config = nsUI.organizaSelect.config[fullID];
	var value = $.trim(config.$input.val());
	nsUI.organizaSelect.searchHandler(value,config,config.$input);
}
/****
*作用：得到面板，并给面板填充数据元素
*参数：
	*config 当前元素的配置参数
*******/
nsUI.organizaSelect.getTabPlane = function(config){
	var $input = config.$input;
	var $plane = $input.parent().children('.organiza-plane');//当前面板的dom对象
	var dataArr = config.dataArr;
	var isEmpty = true;//判断当前拿到的是否是个数组
	$input.off('keyup',evData,nsUI.organizaSelect.inputKeyHandler);//键盘按下事件
	if($.isArray(dataArr)){
		if(dataArr.length > 0){	
			isEmpty = false;
		}
		//如果当前查询出的数据等于1则回车事件
		if(dataArr.length == 1){
			nsUI.organizaSelect.keyboardFlag = true;
		}
	}
	var tbodyHtml = '';//存放面板内容
	var theadHtml = '';//存放面板标题
	if(isEmpty){
		//无查询结果
		tbodyHtml = '<div class="empty">'+language.ui.nsuiorganizaselect.tbodyHtmlEmpty+'</div>';
	}else{
		theadHtml = nsUI.organizaSelect.getPlaneTitleHtml(config);
		var contentHtml = nsUI.organizaSelect.getPlaneContentHtml(config,0);
		var pageHtml = nsUI.organizaSelect.getPlanePageHtml(config.dataArr.length,0);
		tbodyHtml = '<div class="organiza-plane-content">'+contentHtml+pageHtml+'</div>';
	}
	if($plane.length == 0){
		$input.after('<div class="organiza-plane"></div>');
		$plane = $input.parent().children('.organiza-plane');
		var evData = {};
			evData.input = config.$input;
			evData.config = config;
		$(document).off('keyup',nsUI.organizaSelect.documentKeyHandler);
		$(document).on('keyup',evData,nsUI.organizaSelect.documentKeyHandler);//触发整体键盘操作事件
		$plane.html(theadHtml+tbodyHtml);
		config.$plane = $plane.children('.organiza-plane-content');
		nsUI.organizaSelect.getPlaneHandler(config);
	}else{	
		$plane.html(theadHtml+tbodyHtml);
		config.$plane = $plane.children('.organiza-plane-content');
		nsUI.organizaSelect.getPlaneHandler(config);
	}
}
//读取标题
nsUI.organizaSelect.getPlaneTitleHtml = function(config){
	var theadTitle = config.theadTitle;
	var theadHtml = '';
	var classBtnStr = '';
	if(!$.isEmptyObject(config.rowHandler)){
		classBtnStr = 'plane-content-button';
	}              
	/*********读取列标题 start*******************/
	for(var titleI=0; titleI<theadTitle.length; titleI++){
		//给最后一列添加操作class属性
		//遗漏问题： 读取列宽 判断当前是否有增删改查事件，如果没有不存在操作单独添加class？？？？？
		var classStr = titleI == theadTitle.length-1 ? classBtnStr : '';
		theadHtml += '<span class="'+classStr+'">'+theadTitle[titleI]+'</span>';
	}
	/*********读取列标题 end*******************/
	theadHtml = '<div class="plane-title">'+theadHtml+'</div>';
	return theadHtml;
}
//读取内容
nsUI.organizaSelect.getPlaneContentHtml = function(config,pageNum){
	var start = 0;
	var end = 10;
	start = pageNum*10;
	end = start+10;
	var dataArr = config.dataArr;
	if(end>dataArr.length){
		//不够10条，用空数据拼接
		end = dataArr.length;
	}
	var currentPageHtml = '';
	for(var plI = start; plI<end; plI++ ){
		currentPageHtml+=getContentHtml(dataArr[plI],plI,config);
	}
	function getContentHtml(data,indexID,config){
		var currentRowClass = 'plane-content';//默认当前第一条选中
		var rowHtml = '';
		rowHtml += '<span>'+(indexID+1)+'</span>'; //第一列存放先读取序列号
		/*****************读取列字段 start*******************************/
		for(var columnI=0; columnI<config.columnsField.length; columnI++){
			if(config.columnsField[columnI] != config.primaryKeyID){
				rowHtml += '<span>'+data[config.columnsField[columnI]]+'</span>';
			}
		}
		/*****************读取列字段 end*******************************/
		/*****************读取事件 start*******************************/
		var handlerHtml = '';
		if(!$.isEmptyObject(config.rowHandler)){
			handlerHtml = '<span ns-control="button" class="plane-content-button">';
			for(var handlerI in config.rowHandler){
				handlerHtml += commonConfig.getBtn(config.rowHandler[handlerI],'table',handlerI,true,false);
				//handlerHtml += nsButton.getHtml(config.rowHandler[handlerI],'table',handlerI,true,false);
			}
			handlerHtml += '</span>';

		}
		/*****************读取事件 end*******************************/
		//拼接当前行输出内容html
		rowHtml = '<div class="'+currentRowClass+'" ns-psindex="'+indexID+'">'
					+'<a href="javascript:void(0);" class="organiza-content" ns-control="list" ns-index="'+indexID+'">'
					+rowHtml
					+'</a>'
					+handlerHtml
				+'</div>';
		return rowHtml;
	}
	return currentPageHtml;
}
//读取分页
nsUI.organizaSelect.getPlanePageHtml = function(totalLength,pageNum){
	var stateHtml = '';
	if(totalLength > 0){
		var start = typeof(pageNum) == 'number' ? pageNum : 0;
		start = pageNum*10;
		var end = start+10;
		var pervCls = 'able';
		var nextCls = 'able';
		if(end>totalLength){
			end = totalLength-1;
		}
		if(start==0){
			pervCls = 'disabled';
		}
		if(end==(totalLength-1)){
			nextCls = 'disabled';
		}
		var currentPage = start/10+1;
		var totalPage = Math.ceil(totalLength/10);
		stateHtml = '<div class="state">'
						+'<div class="page">'
							+'<span class="'+pervCls+'" ns-psvalue="-1"><i class="fa fa-angle-left" aria-hidden="true"></i></span>'
							+'<span>'+currentPage+'/'+totalPage+'</span>'
							+'<span class="'+nextCls+'" ns-psvalue="+1"><i class="fa fa-angle-right" aria-hidden="true"></i></span>'
						+'</div>'
						+'<span>'+language.ui.nsuiorganizaselect.totalPageSpanA+'：'+totalLength+''+language.ui.nsuiorganizaselect.totalPageSpanB+'</span>'
					+'</div>';
	}
	return stateHtml;
}
//面板事件绑定
nsUI.organizaSelect.getPlaneHandler = function(config){
	var $input = config.$input;
	var $plane = config.$plane;
	var handler = config.rowHandler;
	//绑定面板列选中事件
	var $listDom = $plane.children('.plane-content').children('[ns-control="list"]');
	$listDom.off('click');
	$listDom.on('click',function(ev){
		var rowID = parseInt($(this).attr('ns-index'));
		nsUI.organizaSelect.selectRow(rowID,config,$input);//调用选中行触发操作
	});
	//绑定面板按钮事件
	var $buttonDom = $plane.children('.plane-content').children('[ns-control="button"]');
	$buttonDom.off('click');
	$buttonDom.on('click',function(ev){
		var $dom = $(ev.target).closest('button');
		var indexID = $(this).closest('.plane-content').attr('ns-psindex');
		var btnFid = $dom.attr('fid');
		var obj = {};
		obj.$dom = $dom;
		obj.data = config.dataArr[indexID];
		handler[btnFid].handler(obj);//返回行操作事件
	});
	var $pageDom = $plane.parent().find('.state .page span.able');
	$pageDom.off('click');
	$pageDom.on('click',function(ev){
		var value = $(this).attr('ns-psvalue');
		var pageID = nsUI.organizaSelect.pageID;
		if(value=='+1'){
			nsUI.organizaSelect.toPage(pageID+1,config);
		}else if(value == '-1'){
			nsUI.organizaSelect.toPage(pageID-1,config);
		}

	});
}
//翻页
nsUI.organizaSelect.toPage = function(pageNum,config){
	nsUI.organizaSelect.pageID = pageNum;
	var pageArr = config.dataArr;
	//翻页
	if(pageNum>Math.ceil(pageArr.length/10)-1){
		nsalert(language.ui.pagelast);
	}else if(pageNum<0){
		nsalert(language.ui.pageFirst);
	}else{
		nsUI.organizaSelect.refreshHtml(config,pageNum);
	}
}
//刷新数据
nsUI.organizaSelect.refreshHtml = function(config,pageNum){
	var tbodyHtml = nsUI.organizaSelect.getPlaneContentHtml(config,pageNum);
	var pageHtml = nsUI.organizaSelect.getPlanePageHtml(config.dataArr.length,pageNum);
	var $input = config.$input;
	var $plane = config.$plane;
	$plane.html(tbodyHtml+pageHtml);
	var isInputFocus = $input.is(':focus');
	if(isInputFocus){
		//[class="plane-content"]
		$plane.children('.plane-content').eq(0).addClass('current');
	}
	nsUI.organizaSelect.getPlaneHandler(config);
}
/****
*作用：面板选中行操作
*参数：
	*rowID 当前选中行的数组下标
	*config 当前元素的配置参数
	*$input 当前填充的操作对象
*******/
nsUI.organizaSelect.selectRow = function(rowID,config,$input){
	var valueArr = [];
	//valueArr[0]存放主键id值，然后顺序存放其他列字段值
	valueArr[0] = config.dataArr[rowID][config.primaryKeyID];
	for(var valueI=0; valueI<config.columnsField.length; valueI++){
		if(config.columnsField[valueI] != config.primaryKeyID){
			valueArr.push(config.dataArr[rowID][config.columnsField[valueI]]);
		}
	} 
	var currentData = config.dataArr[rowID];
	nsUI.organizaSelect.fillValue(valueArr,currentData,config,$input);//填充值操作
}
/****
*作用：整体键盘按下事件
*参数：
	*ev 事件触发的参数
	*ev.data分别存放了当前input的dom元素和config配置参数
*******/
nsUI.organizaSelect.documentKeyHandler = function(ev){
	var $input = ev.data.input;
	var config = ev.data.config;
	var $plane = config.$plane;//得到当前面板的dom元素
	var $currentRow = $plane.children('.current');//读取当前操作选中行的面板
	var inputValue = $.trim($input.val());
	var pageID = nsUI.organizaSelect.pageID;
	switch(ev.keyCode){
		case 40:
		case 37:
		case 39:
		case 38:
			nsUI.organizaSelect.keyboardFlag = true;
			break;
		case 13:
			break;
		default:
			nsUI.organizaSelect.keyboardFlag = false;
	}
	switch(ev.keyCode){
		case 13:
			//回车
			//如果存在当前选中行
			if(nsUI.organizaSelect.keyboardFlag){
				if($currentRow.length>0){
					var currentRowID = parseInt($currentRow.children('[ns-control="list"]').attr('ns-index'));
					nsUI.organizaSelect.selectRow(currentRowID,config,$input);
				}
			}else{
				nsUI.organizaSelect.searchHandler(inputValue,config,$input);
			}
			break;
		case 40:
			var selectItem = $currentRow;
			if(selectItem.length==1){
				var nextItem = false;
				function getNextItem(item){
					if(item.next().attr('class')=='plane-content'){
						nextItem = item.next();
					}else{
						if(item.next().length!=0){
							//如果有下一个
							getNextItem(item.next());
						}else{
							if(item.hasClass('state')){
								//最后一条了，再向下是翻下一页
								nsUI.organizaSelect.toPage(pageID+1,config);
							}
						} 
					}
				}
				getNextItem(selectItem);
				if(nextItem!=false){
					nextItem.addClass('current');
					selectItem.removeClass('current');
				};
			}else{
				$plane.children('.plane-content').eq(0).addClass('current');
			}
			break;
		case 38:
			var selectItem = $currentRow;
			if(selectItem.length==1){
				var prevItem = false;
				function getPrevItem(item){
					if(item.prev().attr('class')=='plane-content'){
						prevItem = item.prev();
					}else{
						if(item.prev().length!=0){
							getPrevItem(item.prev());
						}else{
							//第一条，再向上是翻上一页
							nsUI.organizaSelect.toPage(pageID-1,config);
						}
						
					}
				}
				getPrevItem(selectItem);
				if(prevItem!=false){
					prevItem.addClass('current');
					selectItem.removeClass('current');
				};
			}
			break;
		case 39:
			//右 翻下一页
			nsUI.organizaSelect.toPage(pageID+1,config);
			break;
		case 37:
			//左 翻上一页
			nsUI.organizaSelect.toPage(pageID-1,config);
			break;
		case 27:
			//esc 关闭
			nsUI.organizaSelect.closePlane(config, $input);
			break;
	}
}
/****
*作用：填充值
*参数：
	*valueArr 得到要填充的数组元素
	*config 配置参数
	*$input 当前input的dom元素
*******/
nsUI.organizaSelect.fillValue = function(valueArr,currentdata,config,$input){
	//input文本的内容
	//保存id的内容
	//添加关闭按钮和按钮事件
	$input.val(valueArr[1]);//读取第一个列标题
	$("#"+config.fullHiddenID).val(valueArr[0]);//存放主键id
	/********添加清空按钮元素 start******************/
	var valueHtml = '<div class="handler-btn">X</div>';
	if($input.parent().children('.handler-btn').length == 1){
		$input.parent().children('.handler-btn').remove();
	}
	$input.parent().append(valueHtml);
	$input.parent().find('.handler-btn').on('click',function(ev){
		$(this).off('click');
		nsUI.organizaSelect.clearValue(config,$input);
		//是否存在回调函数
		if(typeof(config.completeHandler)=='function'){
			config.completeHandler(currentdata);
		}
	})
	/********添加清空按钮元素 end******************/
	//是否存在回调函数
	if(typeof(config.completeHandler)=='function'){
		config.completeHandler(currentdata);
	}
	//移除面板
	nsUI.organizaSelect.closePlane(config, $input);
}
/****
*作用：清空内容
*参数：
	*$input 当前input的dom元素
	*config config配置参数
*******/
nsUI.organizaSelect.clearValue = function(config,$input){
	nsUI.organizaSelect.pageID = 0;
	$input.val('');//清空input元素
	$("#"+config.fullHiddenID).val('');//清空隐藏域值
	$input.parent().children('.handler-btn').remove();//移除清空按钮
	$input.focus();//得到焦点
}
/****
*作用：移除面板
*参数：
	*$input 当前input的dom元素
	*config config配置参数
*******/
nsUI.organizaSelect.closePlane = function(config, $input){
	nsUI.organizaSelect.pageID = 0;
	$input.parent().children('.organiza-plane').remove();//清空面板
	$(document).off('keyup', nsUI.organizaSelect.documentKeyHandler);//关闭键盘按下事件
	//激活方法
	var evData = {};
		evData.input = $input;
		evData.config = config;
		/*$input.on('blur',function(ev){
			$input.off('blur');
			$input.on('focus',inputFocusHandler);
			$(document).on('click',clickHiddenPlaneHandler);//点击屏幕关闭方法
		});*/
	$input.on('keyup',evData,nsUI.organizaSelect.inputKeyHandler);//键盘按下事件
}