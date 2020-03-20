/*
 * 静态表格
 */
nsUI.staticTable = (function($) {
	var config; 				//配置文件
	var originalConfigs = {}; 	//原始配置文件
	var configs = {}; 			//运行时配置文件
	var components = {};
	function init(_config){
		//主要参数 {id:'表格容器ID', column:jsonarray,ui:{}}
		//验证还没写
		config = _config;
		originalConfigs[config.id] = $.extend(true, {}, config);
		config = setDefault(config);
		configs[config.id] = config;

		config.$table.html(getHtml());
		config.$table.addClass(config.tableClass);
		initComponents(components[config.id]);
	}
	//刷新表格数据
	function refresh(dataArray, tableID){
		//刷新表格数据 dataArray 是JSON数组，格式必须与config中的data一样，tableID
		//验证还没写
		config = configs[tableID];
		if(debugerMode){
			if(typeof(config)=='undefined'){
				console.error('无法找到初始化后的数据，请核实tableID');
			}
		}
		config.data = dataArray;
		config.$table.children('tbody').html(getBodyHtml())
		initComponents(components[config.id]);
	}
	//设置默认值
	//dataType 默认为"dataArray"，primaryID默认为"id"
	function setDefault(_config){
		//默认值
		if(typeof(_config.dataType)=='undefined'){
			_config.dataType = 'dataArray'
		}
		if(typeof(_config.primaryID)=='undefined'){
			_config.primaryID = 'id'
		}

		_config.$table = $('#'+_config.id);
		//保存columnData到组件分组里
		function setComponents(columnData){
			if(typeof(components[_config.id])=='undefined'){
				components[_config.id] = {};
			}
			if(typeof(components[_config.id][columnData.type])=='undefined'){
				components[_config.id][columnData.type] = [];
			}
			components[_config.id][columnData.type].push(columnData);
		}
		//转换column数据
		_config.columns = {};
		var tableWidth = _config.$table.parent().width();
		for(var columnI=0; columnI<_config.column.length; columnI++){
			//添加索引值
			_config.column[columnI].columnIndex = columnI;  //添加columnIndex，代表是列索引值
			//转换type到function
			if(typeof(_config.column[columnI].type)=='string'){
				setComponents(_config.column[columnI]);
				switch(_config.column[columnI].type){
					case 'input':
						_config.column[columnI].formatHandler = getInput;
						break;
					case 'select':
						_config.column[columnI].formatHandler = getSelect;
						break;
					case 'switch':
						_config.column[columnI].formatHandler = getSwitch;
						break;
					case 'select':
						_config.column[columnI].formatHandler = getSelect;
						break;
					case 'btn':
						_config.column[columnI].formatHandler = getBtns;
						break;
					case 'radio-column':
						_config.column[columnI].formatHandler = getRadioColumn;
						break;
					default:
						if(debugerMode){
							console.error('不能识别的列类型：'+_config.column[columnI].type);
							console.error(_config.column[columnI]);
						}
						break;
				}
			}else{
				//没有类型默认为string，文本类型
				_config.column[columnI].type = 'string'
			}
			//创建columns对象
			var columnName = _config.column[columnI].data;
			//如果data有重复的 则名称命名为data+列索引
			if(typeof(_config.columns[columnName])=='object'){
				//重命名之前的
				var renameColumn = _config.columns[columnName];
				var renameStr =renameColumn.data+'-'+renameColumn.columnIndex;
				renameColumn.name = renameStr;
				_config.columns[renameStr] = renameColumn;
				delete _config.columns[columnName];
				//修改现在的名字
				columnName = columnName+'-'+columnI;
			}
			_config.column[columnI].name = columnName;
			_config.columns[columnName] = _config.column[columnI];
			//如果有附加的btn，统一添加index和隐藏文字
			if($.isArray(_config.column[columnI].btns)){
				for(var btnI = 0; btnI<_config.column[columnI].btns.length; btnI++){
					_config.column[columnI].btns[btnI].isShowText = false;
					_config.column[columnI].btns[btnI].index = 
						{
							'ns-column':columnI,
							'ns-btn':btnI,
							'ns-column-name':columnName
						}
				}
			}
			//附加的btn end-----
		}
		//表格默认样式
		_config.tableClass = 'table table-hover table-striped statictable';
		if(typeof(_config.ui)=='object'){
			if(typeof(_config.ui.plusClass)=='string'){
				_config.tableClass += ' '+_config.ui.plusClass;
			}
		}

		if(debugerMode){
			if(_config.$table.length==0){
				console.error('表格配置的id:'+_config.id+', 无法找到');
				console.error(this.originalConfig[config.id]);
			}
			for(var dataI = 0; dataI<_config.data.length; dataI++){
				if(typeof(_config.data[dataI][_config.primaryID])=='undefined'){
					console.error('表格配置的主键ID:'+_config.primaryID+', 没有在数据中定义');
					console.error(_config.data[dataI]);
				}
			}
		}

		return _config;
	}
	function getHtml(){
		var html = '';
		html += 
			'<thead>'
				+getHeadHtml();
			+'</thead>'
		html += 
			'<tbody>'
				+getBodyHtml();
			+'</tbody>'
		return html;
	}
	function getHeadHtml(){
		var html = '';
		for(var columnI=0; columnI<config.column.length; columnI++){
			var widthStyle = '';
			if(typeof(config.column[columnI].width)=='number'){
				widthStyle = 'style="width:'+config.column[columnI].width+'px;" '
			}else if(typeof(config.column[columnI].width)=='string'){
				widthStyle = 'style="width:'+config.column[columnI].width+';" '
			}
			html+=
				'<th '
					+widthStyle
					+'ns-name="'+config.column[columnI].name+'" '
					+'ns-data="'+config.column[columnI].data+'" '
				+'>'
					+config.column[columnI].title;
				+'</th>'
		}
		html = 
			'<tr>'
				+'<th>&nbsp;</th>'
				+html
			+'</tr>'
		return html;
	}
	function getBodyHtml(){
		var html = '';

		for(var dataI=0; dataI<config.data.length; dataI++){
			var trHtml = '';
			trHtml += '<th>'+(dataI+1)+'</th>';
			for(var columnI=0; columnI<config.column.length; columnI++){
				var content = '';
				var value = config.data[dataI][config.column[columnI].data];  	//当前值
				var rowData = config.data[dataI];								//行数据
				rowData.row = dataI;
				rowData.column = columnI;
				var tableData = config.data; 									//整体数据
				var columnData = $.extend(true, {}, config.column[columnI]); 	//列数据
				//回调函数的参数
				var submitData = 
					{
						index:{
							row:dataI,
							column:columnI
						},
						value:value,
						tableData:tableData,
						rowData:rowData,
						columnData:columnData,
						tableID:config.id
					}
				//预处理回调函数
				if(typeof(config.column[columnI].beforeHandler)=='function'){
					var callbackData = config.column[columnI].beforeHandler(submitData);
					if(typeof(callbackData)!='undefined'){
						value = callbackData;
					}
				}
				//格式化回调函数
				if(typeof(config.column[columnI].formatHandler)=='function'){
					content = config.column[columnI].formatHandler(submitData);
				}else{
					content = config.data[dataI][config.column[columnI].data];
				}
				trHtml+=
					'<td '
						+'class="td-'+config.column[columnI].type+'" '
					+'>'
						+content
					+'</td>'
			}
			
			var trCls = '';
			if(config.data[dataI].nsAttrSelected){
				trCls = ' class="selected"';
			}
			html+=
				'<tr'+trCls+'>'
					+trHtml
				+'</tr>'
		}
		return html;
	}
	//获得ID
	function getID(rowData){
		var idStr = config.id+'-input-column'+rowData.column+'-row'+rowData.row;
		return idStr;
	}
	//获得通用属性
	function getCommonAttr(rowData,columnData){
		var attrString = 
				'id="'+getID(rowData)+'" '
				+'ns-column="'+rowData.column+'" '
				+'ns-row="'+rowData.row+'" '
				+'ns-table-type="'+columnData.type+'" '
		return attrString
	}
	//文本框
	function getInput(data){

		var value = data.value;
		var rowData = data.rowData;
		var columnData = data.columnData;
		var tableData = data.tableData;

		var readonlyStr = '';
		if(columnData.readonly){
			readonlyStr = 'readonly="readonly" '
		}

		//按钮代码
		var btnsHtml = ''
		if($.isArray(columnData.btns)){
			for(var btnI=0; btnI<columnData.btns.length; btnI++){
				columnData.btns[btnI].index['ns-row'] = rowData.row;
			}
			btnsHtml = nsButton.getHtmlByConfigArray(columnData.btns);
		}

		//全部代码
		html = 
			'<input '
				+ getCommonAttr(rowData,columnData)
				+'type="text" '
				+'name="'+getID(rowData)+'" '
				+'value="'+value+'" '
				+'class="ns-table-input form-control" '
				+readonlyStr
			+'>'
			+btnsHtml

		return html;
	}
	//复选框 checkbox 还没写
	function getCheckbox(value, rowData, columnData, tableData){

	}
	//开关 switch
	function getSwitch(data){
		var value = data.value;
		var rowData = data.rowData;
		var columnData = data.columnData;
		var tableData = data.tableData;

		var isChecked = false;
		switch(typeof(value)){
			case 'boolean':
				if(value==true){
					isChecked = true;
				}
				break;
			case 'string':
				if(value=='true'){
					isChecked = true;
				}
				if(value == '1'){
					isChecked = true;
				}
				break;
			case 'number':
				if(value==1){
					isChecked = true;
				}
				break;
		}
		var checkedStr = '';
		var checkCls = '';
		if(isChecked){
			checkedStr = 'checked="checked" '
			checkCls = ' checked'
		}
		var idStr = getID(rowData);
		var infoStr = typeof(columnData.info)=='undefined'?'':columnData.info;
		var readonlyStr = columnData.readonly ? ' disabled':'';
		var html = 
			'<label '
				+'class="checkbox-inline checkbox-switch'+checkCls+readonlyStr+'" '
				+'for="'+idStr+'" '
			+'>'
				+ infoStr
			+'</label>'
			+'<input '
				+ getCommonAttr(rowData,columnData)
				+'type="checkbox" '
				+'class="checkbox-options" '
				+'value="true" '
				+readonlyStr+' '
				+checkedStr
			+'>'
		return html;
	}
	//基础下拉框 select 
	function getSelect(data){
		var value = data.value;
		var rowData = data.rowData;
		var columnData = data.columnData;
		var tableData = data.tableData;

		var html = '';
		var readonlyHtml = '';
		var readonlyAttr = ''
		//withoutEmpty 是否有无选项
		if(columnData.typeData.withoutEmpty){
			//html +='';
		}else{
			html +='<option value="">'+language.default.empty+'</option>';
		}
		for(var selectI=0; selectI<columnData.typeData.subdata.length; selectI++){
			var idStr = columnData.typeData.subdata[selectI][columnData.typeData.valueField];
			var textStr = columnData.typeData.subdata[selectI][columnData.typeData.textField];
			var selectedStr = '';
			if(idStr === value){
				selectedStr = ' selected';
				readonlyHtml = '<option value="'+idStr+'"'+selectedStr+'>'+textStr+'</option>';
			}
			html +='<option value="'+idStr+'"'+selectedStr+'>'+textStr+'</option>'
		}
		if(columnData.readonly){
			html = readonlyHtml;
			readonlyAttr = 'readonly="readonly" ';
		}
		html = 
			'<select '
				+getCommonAttr(rowData,columnData)
				+'class="form-control ns-table-selectbase" '
				+readonlyAttr
			+'>'
				+html
			+'</select>'
		return html
	}
	//按钮组 btns 
	function getBtns(data){
		var value = data.value;
		var rowData = data.rowData;
		var columnData = data.columnData;
		var tableData = data.tableData;

		var html = '';
		for(var btnI=0; btnI<columnData.btns.length; btnI++){
			if(typeof(columnData.btns[btnI].isShowText)=='undefined'){
				columnData.btns[btnI].isShowText = false;
			}
			var event = typeof(columnData.btns[btnI].event) == 'undefined' ? 'click' : columnData.btns[btnI].event;
			columnData.btns[btnI].index = {
				'ns-row':rowData.row,
				'ns-column':rowData.column,
				'ns-btn':btnI,
				'ns-event':event
			}
			html += nsButton.getHtml(columnData.btns[btnI])
		}
		html = 
			'<div class="btn-group">'
				+html
			+'</div>'
		return html
	}
	//列单选框
	function getRadioColumn(data){
		var value = data.value;
		var rowData = data.rowData;
		var columnData = data.columnData;
		var tableData = data.tableData;

		var isChecked = false;
		if(data.columnData.value == value){
			isChecked = true;
		}
		var checkedStr = '';
		var checkCls = '';
		if(isChecked){
			checkedStr = 'checked="checked" '
			checkCls = ' checked'
		}
		var idStr = getID(rowData);
		var infoStr = typeof(columnData.info)=='undefined'?'':columnData.info;
		var readonlyStr = columnData.readonly ? ' disabled':'';
		var html = 
			'<label '
				+'class="radio-inline'+checkCls+readonlyStr+'" '
				+'for="'+idStr+'" '
			+'>'
				+ infoStr
			+'</label>'
			+'<input '
				+ getCommonAttr(rowData,columnData)
				+'name="'+config.id+'-input-column'+rowData.column+'" '
				+'type="radio" '
				+'class="radio-options" '
				+'value="'+value+'" '
				+readonlyStr+' '
				+checkedStr
			+'>'
		return html;
	}
	//初始化组件事件
	function initComponents(componentsData){
		for(type in componentsData){
			switch(type){
				case 'input':
					initInput();
					break;
				case 'btn':
					initBtn();
					break;
				case 'switch':
					initSwitch();
					break;
				case 'checkbox':
					break;
				case 'select':
					initSelect();
					break;
				case 'radio-column':
					initRadioColumn();
					break;
				default:
					if(debugerMode){
						console.error('不能识别的组件类型:'+type);
						console.error(componentsData[type]);
					}
					break;
			}
		}
	}
	//获取回调函数所用的参数
	function getReturnData($dom, ev){
		var columnIndex = parseInt($dom.attr('ns-column'));
		var rowIndex = parseInt($dom.attr('ns-row'));
		var data = {
			tableID:ev.data.config.id,
			index:{
				column:columnIndex,
				row:rowIndex,
			},
			$dom:$dom,
			$row:$dom.closest('tr'),
			event:ev,
			columnData:ev.data.config.column[columnIndex],
			rowData:ev.data.config.data[rowIndex],
			tableData:ev.data.config.data
		}
		return data;
	}
	//input init
	function initInput(){
		//验证处理
		function validateHandler(valueStr,rules){
			var isPassRules = true;
			if(typeof(rules)=='string'){
				if(rules != ''){
					var rulesArr = rules.split(' ');
					for(var ruleI=0; ruleI<rulesArr.length; ruleI++){
						isPassRules = nsValid.test(valueStr,rulesArr[ruleI]);
					}
				}
			}
			return isPassRules;
		}
		//change处理函数
		function changeEventHandler(ev){
			ev.stopPropagation();
			var $input = $(this);
			var data = getReturnData($input, ev);
			var valueStr = $input.val();
			var rules = data.columnData.rules;
			var isPassRules = validateHandler(valueStr,rules);
			data.value = valueStr;
			data.eventType = ev.type;
			var originalValue = $input.attr('ns-originalvalue');
			data.originalValue = originalValue;
			data.isValid = isPassRules;//验证是否通过
			if(isPassRules == false){
				data.columnData.changeHandler(data);
			}else{
				//只有值发生变化了才调用
				if(originalValue != data.value){
					data.isModify = true;
					if(data.columnData.isOnlyEnter){
						//指定了enterhandler，只在按下回车时候回调
						if(ev.keyCode == 13){
							$input.attr('ns-originalvalue', data.value);
							data.columnData.changeHandler(data);
						};
					}else if(data.columnData.isUseEnter){
						//同时指定了changhandler和enterhandler
						data.isEnterEvent = (ev.keyCode == 13);
						$input.attr('ns-originalvalue', data.value);
						data.columnData.changeHandler(data);
					}else{
						$input.attr('ns-originalvalue', data.value);
						data.columnData.changeHandler(data);
					}
				}else{
					//即使值不相等，如果定义了enterHandler，也在按下回车时候回调
					if(data.columnData.isOnlyEnter || data.columnData.isUseEnter){
						if(ev.keyCode == 13){
							data.isModify = false;
							$input.attr('ns-originalvalue', data.value);
							data.columnData.changeHandler(data);
						};
					}
				}
			}
		}
		//blur处理函数
		function blurEventHandler(ev){
			ev.stopPropagation();
			var $input = $(this);
			var data = getReturnData($input, ev);
			var valueStr = $input.val();
			//验证
			var rules = data.columnData.rules;
			var isPassRules = validateHandler(valueStr,rules);
			data.value = valueStr;
			data.eventType = ev.type;
			var originalValue = $input.attr('ns-blurvalue');
			data.originalValue = originalValue;
			data.isValid = isPassRules;//验证是否通过
			if(isPassRules == false){
				data.columnData.blurHandler(data);
			}else{
				//不管发没发生变化都调用，但是data.isModify标记
				if(originalValue != data.value){
					$input.attr('ns-blurvalue', data.value);
					data.isModify = true;
					data.columnData.blurHandler(data);
				}else{
					data.isModify = false;
					data.columnData.blurHandler(data);
				}
			}	
		}
		//判别要加载的事件种类 是否添加keyup事件
		for(var inputColumnI = 0; inputColumnI<components[config.id]['input'].length; inputColumnI++){
			var columnData = components[config.id]['input'][inputColumnI];
			//回车回调 回车回调实际上只是keyup回调的一个特定触发条件
			if(typeof(columnData.enterHandler)=='function'){
				if(typeof(columnData.changeHandler)!='function'){
					columnData.changeHandler = columnData.enterHandler;
					columnData.isOnlyEnter = true;
					columnData.isUseKeyupEvent = true;
				}else{
					columnData.isUseEnter = true;
					columnData.isUseKeyupEvent = true;
				}
			}

			//修改值的回调
			if(typeof(columnData.changeHandler)=='function'){
				var eventStr = 'change';
				//是否支持keyup事件
				if(columnData.isUseKeyupEvent){
					eventStr += ' keyup';
				}
				if(columnData.isUseKeyupEvent){
					eventStr = 'keyup';
				}
				//当前列配置所生成的文本框
				var $inputs = config.$table.find('input[ns-table-type="input"][ns-column="'+columnData.columnIndex+'"]');
				for(var inputI = 0; inputI<$inputs.length; inputI++){
					var $input = $inputs.eq(inputI);
					var originalValue = $input.val();
					var eventData = {
						config:config,
						originalValue:originalValue
					}
					$input.attr('ns-originalvalue',originalValue);
					$input.on(eventStr, eventData, changeEventHandler);
				}
			}
			//失去焦点的回调
			if(typeof(columnData.blurHandler)=='function'){
				var $inputs = config.$table.find('input[ns-table-type="input"][ns-column="'+columnData.columnIndex+'"]');
				for(var inputI = 0; inputI<$inputs.length; inputI++){
					var $input = $inputs.eq(inputI);
					var originalValue = $input.val();
					var eventData = {
						config:config,
						originalValue:originalValue
					}
					$input.attr('ns-blurvalue',originalValue);
					$input.on('blur', eventData, blurEventHandler);
				}
			}
			

			if($.isArray(columnData.btns)){
				config.$table.find('td.td-input button.btn').on('click', {config:config}, function(ev){
					var $btn = $(this);
					var btnIndex = parseInt($btn.attr('ns-btn'));
					var data = getReturnData($btn, ev);
					data.index.btn = btnIndex;
					data.$tdInput = $(this).closest('td').children('input');
					var inputValue = data.$tdInput.val();
					data.inputValue = inputValue;
					if(typeof(data.columnData.btns[btnIndex].handler)=='function'){
						data.columnData.btns[btnIndex].handler(data);
					}
				});
			}
		}
	}
	//btn init
	function initBtn(){
		var $btn = config.$table.find('td.td-btn button.btn').not('[ns-event="mousedown"]');
		$btn.on('click', {config:config}, function(ev){
			var $btn = $(this);
			var btnIndex = parseInt($btn.attr('ns-btn'));
			var data = getReturnData($btn, ev);
			data.index.btn = btnIndex;
			if(typeof(data.columnData.btns[btnIndex].handler)=='function'){
				data.columnData.btns[btnIndex].handler(data);
			}
		});
		var $dragTrbtns = config.$table.find('td.td-btn button[ns-event="mousedown"]');
		var $dragTrs = config.$table.children('tbody').children('tr');
		var modalBodyOffset = config.$table.closest('.modal-body').offset();
		var dragTrArr = [];
		$dragTrs.each(function(key,value){
			var $tr = $(this);
			var trCoordinate = {}; 
			var trOffset= $tr.offset();
			var trWidth = $tr.outerWidth();
			var trHeight = $tr.outerHeight();
			trCoordinate.index = $tr.index();
			trCoordinate.x1 = trOffset.left;
			trCoordinate.x2 = trWidth + trOffset.left;
			trCoordinate.y1 = trOffset.top;
			trCoordinate.y2 = trHeight + trOffset.top;
			dragTrArr.push(trCoordinate);
		});
		$dragTrbtns.on('mousedown',{config:config},function(ev){
			var $allAvailable = config.$table.closest('.modal-formmanger');
			var modalOffset = $allAvailable.offset();
			var $this = $(this);
			var event = ev;
			var $tr = $this.closest('tr');
			var trOffset = $tr.offset();
			var currentOffset = $this.offset();
			var leftX = currentOffset.left;
			var topY = currentOffset.top;
			var positonLeft = trOffset.left - modalBodyOffset.left;
			var positonTop = trOffset.top - modalOffset.top;
			var offsetX = ev.offsetX + leftX;
			var offsetY = ev.offsetY + topY;
			if(ev.target.nodeName == 'I'){
				var iconOffset = $(ev.target).offset();
				var spaceX = iconOffset.left - currentOffset.left;
				var spaceY = iconOffset.top - currentOffset.top;
				offsetX = offsetX + spaceX;
				offsetY = offsetY + spaceY;
			}
			var availableIndex = $tr.index();
			var positionJson = {
				offsetX:offsetX,
				offsetY:offsetY,
				left:positonLeft,
				top:positonTop,
				width:$tr.outerWidth(),
				height:$tr.outerHeight()
			}
			//记录下要拖拽到的目标坐标
			/*var availableCoordinate = {
				x1:modalOffset.left,
				x2:modalOffset.left + $allAvailable.outerWidth(),
				y1:modalOffset.top,
				y2:modalOffset.top + $allAvailable.outerHeight(),
			}*/
			var positionStyle = 'left:'+positonLeft+'px;';  				//top
			positionStyle += ' top:'+positonTop+'px;';						//left
			positionStyle += ' width:'+positionJson.width+'px; '; 			//width
			positionStyle += ' height:'+positionJson.height+'px;'; 			//width
			var trIndex = $tr.index();
			var itemHtml = '<div id="tr-drag-panel" class="tr-drag-panel" ns-trIndex="'+trIndex+'" style="'+positionStyle+'"></div>';
			if($('#tr-drag-panel').length>0){
				$('#tr-drag-panel').remove();
			}
			$('.modal-formmanger').append(itemHtml);//追加拖拽对象
			var $drag = $('#tr-drag-panel');
			var btnIndex = $this.attr('ns-btn');
			$(document).on('mousemove',function(ev){
				var left = ev.pageX - positionJson.offsetX + positonLeft;
				var top = ev.pageY - positionJson.offsetY + positonTop;
				$drag.css({'top':top, 'left':left});
			});
			$(document).on('mouseup',function(ev){
				//结束拖拽
				$(document).off('mousemove');
				$(document).off('mouseup');
				//拖拽是否在有效区域范围
				availableIndex = isAvailableZone();
				var moveIndex = Number($drag.attr('ns-trIndex'));//拖拽元素下标
				console.log('moveIndex:'+moveIndex+';availableIndex:'+availableIndex);
				var data = getReturnData($this,event);
				data.value = availableIndex;
				$drag.remove();
				var existSortLength = data.tableData.length;//数据长度
				//生成排序队列
				var rowIndexArr = [];
				var dataArr = [];
				for(var rowI=0; rowI<existSortLength; rowI++){
					var nsIndex = data.tableData[rowI].disorder;//排序序列号
					var dataObj = {
						originaRowIndex:rowI,
						originalNsIndex:nsIndex,
					};
					rowIndexArr.push(rowI);
					dataArr.push(dataObj);
				}
				rowIndexArr.splice(moveIndex, 1);//删除元素
				rowIndexArr.splice(availableIndex, 0, moveIndex);//在第几个元素之前追加一个新元素
				for(var rowI = 0; rowI<existSortLength; rowI++){
					dataArr[rowIndexArr[rowI]].editNsIndex = dataArr[rowI].originalNsIndex;
					dataArr[rowIndexArr[rowI]].editRowIndex = dataArr[rowI].originaRowIndex;
				}
				for(var dataI = 0; dataI<existSortLength; dataI++){
					data.tableData[dataI].disorder = dataArr[dataI].editNsIndex;
				}
				data.tableData.sort(function(a,b){
					return a.disorder - b.disorder
				});
				nsUI.staticTable.refresh(data.tableData,data.tableID);
				if(typeof(data.columnData.btns[btnIndex].handler)=='function'){
					data.columnData.btns[btnIndex].handler(data);
				}
			});
			function isAvailableZone(){
				var moveOffset = $drag.offset();
				var moveCoordinate = {
					x1:moveOffset.left,
					x2:moveOffset.left + positionJson.width,
					y1:moveOffset.top,
					y2:moveOffset.top + positionJson.height
				}
				/*if(moveCoordinate.x1 >= availableCoordinate.x1 && moveCoordinate.x2 <= availableCoordinate.x2 && moveCoordinate.y1 >= availableCoordinate.y1 && moveCoordinate.y2 <= availableCoordinate.y2){
					console.log('true')
				}else{
					console.log('false')
				}*/
				for(var moveI=0; moveI<dragTrArr.length; moveI++){
					if(dragTrArr[moveI].y1 <= moveCoordinate.y1){
						availableIndex = dragTrArr[moveI].index;
					}
				}
				return availableIndex;
			}
		})
	}
	//switch init
	function initSwitch(){
		config.$table.find('input[ns-table-type="switch"]').not('[disabled]').on('change', {config:config}, function(ev){
			var $checkbox = $(this);
			$checkbox.prev().toggleClass('checked');
			var data = getReturnData($checkbox, ev);
			data.isChecked = $checkbox.prev().hasClass('checked');
			if(typeof(data.columnData.changeHandler)=='function'){
				data.columnData.changeHandler(data);
			}
		});
	}
	//普通下拉框初始化
	function initSelect(){
		config.$table.find('select[ns-table-type="select"]').on('change', {config:config}, function(ev){
			var $select = $(this);
			var data = getReturnData($select, ev);
			data.value = $select.val();
			if(typeof(data.columnData.changeHandler)=='function'){
				data.columnData.changeHandler(data);
			}
		});
	}
	//列单选框初始化
	function initRadioColumn(){
		config.$table.find('input[ns-table-type="radio-column"]').not('[disabled]').on('click', {config:config}, function(ev){
			config.$table.find('input[ns-table-type="radio-column"]').not('[disabled]').prev().removeClass('checked');
			var $radio = $(this);
			$radio.prev().addClass('checked');
			var data = getReturnData($radio, ev);
			data.isChecked = $radio.prev().hasClass('checked');
			console.log($radio.attr('name'));
			if(typeof(data.columnData.changeHandler)=='function'){
				data.columnData.changeHandler(data);
			}
		});
	}
	
	//获取配置参数
	function getConfig(tableID){
		if(debugerMode){
			var validParameterArr = [
				[tableID,'string',true]
			]
			nsDebuger.validParameter(validParameterArr);
		}
		var returnConfig = nsUI.staticTable.config[tableID];
		if(debugerMode){
			if(typeof(returnConfig)!='object'){
				console.error('nsUI.staticTable.getConfig('+tableID+')获取配置参数失败，请检查tableID是否正确，表格是否初始化');
				return false;
			}
		}

		return returnConfig;
	}
	//设置值
	function setValue(tableID, columnName, rowIndex, value){
		//tableID：表格ID，columnName：列名称也是data值,也可以是索引值，rowIndex:行索引（第几行）,value:设置值
		if(debugerMode){
			var parametersArr = [
				[tableID,'string',true],  				//表格ID
				[columnName,'string number', true], 	//列名称
				[rowIndex,'number', true], 				//行索引（第几行）
				[value,'string number',true], 			//设置值
			]
			nsDebuger.validParameter(parametersArr);
		}
		var _config = nsUI.staticTable.config[tableID];
		if(debugerMode){
			if(typeof(_config)!='object'){
				console.error('setValue中的tableID：'+tableID+'无效');
				return false;
			}
		}
		var columnConfig =  _config.columns[columnName];
		if(debugerMode){
			if(typeof(columnConfig)!='object'){
				console.error('setValue中的columnName：'+columnName+'无效');
				return false;
			}
		}
		var componentType = columnConfig.type;
		var componentValue = value;
		var columnIndex = columnConfig.columnIndex

		switch(componentType){
			//普通单元格
			case 'string':
				var $component = $('#'+_config.id+' tbody tr').eq(rowIndex).children('td').eq(columnIndex);
				if(debugerMode){
					if($component.length==0){
						console.error('无法找到修改组件，当前组件类型为string，tableID：'+tableID+'定位是第'+(rowIndex+1)+'行/第'+(columnIndex+2)+'列')
					}
				}
				if(typeof(columnConfig.formatHandler)=='function'){
					//回调函数的参数
					var submitData = 
						{
							index:{
								row:rowIndex,
								column:columnIndex
							},
							value:value,
							tableData:_config.data,
							rowData:_config.data[rowIndex],
							columnData:columnConfig,
							tableID:tableID
						}	
					componentValue = columnConfig.formatHandler(submitData);
				}
				//刷新单元格
				$component.html(componentValue.toString());
				//修改数据
				//_config.data[rowIndex][columnName] = componentValue;
				break;
			//输入框
			case 'input':
				if(typeof(componentValue)!='string'){
					componentValue = componentValue.toString();
				}
				var $component = _config.$table.find('input[ns-table-type="input"][ns-column="'+columnIndex+'"][ns-row="'+rowIndex+'"]');
				if(debugerMode){
					if($component.length==0){
						console.error('无法找到修改组件，当前组件类型为input，tableID：'+tableID+'定位是第'+(rowIndex+1)+'行/第'+(columnIndex+2)+'列')
					}
				}
				//刷新输入框
				$component.attr('ns-originalvalue', componentValue);
				$component.attr('ns-blurvalue',componentValue);
				$component.val(componentValue);
				//修改数据
				//_config.data[rowIndex][columnName] = componentValue;
				break;
			default:
				if(debugerMode){
					console.error('不能识别的组件类型');
				}
				break;
		}
		return true;
	}
	//获取值
	function getValue(tableID, columnName, rowIndex){
		//tableID：表格ID，columnName：列名称也是data值,也可以是索引值，rowIndex:行索引（第几行）
		if(debugerMode){
			var parametersArr = [
				[tableID,'string',true],  				//表格ID
				[columnName,'string number', true], 	//列名称
				[rowIndex,'number', true], 				//行索引（第几行）
			]
			nsDebuger.validParameter(parametersArr);
		}
		var _config = nsUI.staticTable.config[tableID];
		if(debugerMode){
			if(typeof(_config)!='object'){
				console.error('setValue中的tableID：'+tableID+'无效');
				return false;
			}
		}
		var columnConfig =  _config.columns[columnName];
		if(debugerMode){
			if(typeof(columnConfig)!='object'){
				console.error('setValue中的columnName：'+columnName+'无效');
				return false;
			}
		}
		var componentType = columnConfig.type;
		var columnIndex = columnConfig.columnIndex;
		var componentValue;
		switch(componentType){
			//普通单元格
			case 'string':
				componentValue = _config.data[rowIndex][columnConfig.data]
				break;
			//输入框
			case 'input':
				var $component = _config.$table.find('input[ns-table-type="input"][ns-column="'+columnIndex+'"][ns-row="'+rowIndex+'"]');
				if(debugerMode){
					if($component.length==0){
						console.error('无法找到组件，当前组件类型为input，tableID：'+tableID+'定位是第'+(rowIndex+1)+'行/第'+(columnIndex+2)+'列')
					}
				}
				componentValue = $component.val();
				break;
			default:
				if(debugerMode){
					console.error('不能识别的组件类型');
				}
				break;
		}
		return componentValue;
	}
	return {
		init:init,
		refresh:refresh,
		originalConfig:originalConfigs,
		config:configs,
		getConfig:getConfig,
		getValue:getValue,
		setValue:setValue
	}
})(jQuery);