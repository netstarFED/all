/*
 * @Desription: htmlDOM元素模拟的input
 * @Author: netstar.cy
 * @Date: 2018-04-09 14:50:24
 * @LastEditTime: 2019-12-12 19:24:53
 * @ver: 1.1.3
 */

nsUI.htmlInput = (function($) {
//插入代码

function insertHtmlBySimpleTag(tagStr, cursorSelected){
	var $input = config.$input;
	var inputValue = $input.val();
	//插入位置之前的文本
	var beforeStr = inputValue.substring(0, cursorSelected.start);
	//插入位置之后的文本
	var afterStr = inputValue.substring(cursorSelected.end);
	var valueStr = beforeStr + tagStr + afterStr;
	$input.val(valueStr);

	var cursorStart = cursorSelected.start + tagStr.length;
	var cursorEnd = cursorSelected.end + tagStr.length;

	$input[0].setSelectionRange(cursorStart, cursorEnd);
}
function insertHtml(htmlTagName, cursorSelected){
	
	var $input = config.$input;
	var inputValue = $input.val();
	//插入位置之前的文本
	var beforeStr = inputValue.substring(0, cursorSelected.start);
	//插入位置之后的文本
	var afterStr = inputValue.substring(cursorSelected.end);
	//前后标签
	var startTagHtml = '<'+htmlTagName+'>';
	var endTagHtml = '</'+htmlTagName+'>';
	var isCompleteTag = false;  						//是否完整标签
	var isInsertTag = true; 							//是否是插入标签，false则代表是取消当前标签
	var startTags = beforeStr.match(tagRep.startG); 	//开始标签
	if(startTags){
		var startTagLength = startTags.length; 			//开始标签的数量
		var endTags = beforeStr.match(tagRep.endG);  	//结束标签
		if(endTags){
			var endTagLength = endTags.length; 			//结束标签的数量
			//开始标签和结束标签的数量相等，则认为所有标签闭合，不允许标签互相嵌套
			isCompleteTag = (endTagLength == startTagLength);
		}
	}else{
		//没有开始标签，则必然是完整的
		isCompleteTag = true;
	}
	if(isCompleteTag == false){
		//获取最近的标签名称
		var lastStartTag = startTags[startTags.length-1];
		//如果最近的标签与要插入的标签不一致，则认为不是完整标签，无法插入
		if(lastStartTag != startTagHtml){
			nsalert(language.ui.htmlInput.tagError, 'error');
			return;
		};
		//如果最近的标签与要插入的标签一致 则视为取消标签操作
		isInsertTag = false;
		var lastTagRegExp = new RegExp(lastStartTag, 'g');
		var patt;
		var pattLastIndex = 0;
		while((patt = lastTagRegExp.exec(beforeStr))!=null){
			pattLastIndex = lastTagRegExp.lastIndex;
		}
		//找到最后一个开始标签并删除
		pattLastIndex = pattLastIndex-lastStartTag.length;
		beforeStr = beforeStr.substring(0, pattLastIndex)+beforeStr.substring(pattLastIndex+lastStartTag.length);
		//找到后面的第一个对应标签并删除
		var firstEndTag = lastStartTag.substring(0,1)+'/'+lastStartTag.substring(1);
		afterStr = afterStr.replace(firstEndTag, '');
		//插入标签设为空
		startTagHtml = '';
		endTagHtml = '';
	}	

	//要插入的新字符串
	var newValue = 
		beforeStr 							//插入标签前的字符串
		+ startTagHtml 						//插入标签的开始部分 例如<sub>
		+ cursorSelected.selectedText 		//插入标签可能包含的内容，如果不是选中状态，则为空
		+ endTagHtml 						//插入标签的结束部分 例如</sub>
		+ afterStr; 						//插入标签后面的字符串
	$input.val(newValue);
	var cursorStart = cursorSelected.start;
	var cursorEnd = cursorSelected.end;
	if(isInsertTag){
		//如果是插入标签则要加上新标签的长度
		cursorStart = cursorStart+startTagHtml.length;
		cursorEnd = cursorEnd+startTagHtml.length;
	}else{
		//如果是插入标签则要减去原有标签的长度
		cursorStart = cursorStart-htmlTagName.length-2;
		cursorEnd = cursorEnd-htmlTagName.length-2;
	}
	$input[0].setSelectionRange(cursorStart, cursorEnd);

	config.originalValue.isInsertEmptyTag = true;
}
//生成模拟输入框
function htmlInputContainerInit(){
	
	//设置宽高和行高
	var styleHtml = '';
	styleHtml += 'height:'+config.$container.height()+'px; ';
	if(config.type == 'textarea'){
		styleHtml += 'line-height:16px; ';
		styleHtml += 'overflow:auto; ';
	}else{
		styleHtml += 'line-height:'+config.$input.height()+'px; ';
	}
	styleHtml += 'width:'+config.$input.outerWidth()+'px;';
	styleHtml = ' style="'+styleHtml+'"';
	//设置输出字段
	var spanObj = getSpansData(config.value);
	//只读模式
	var readonlyCls = '';
	if(config.readonly){
		readonlyCls = ' readonly';
	}
	var html = 
		'<div class="shortcut-html-input'+readonlyCls+'"'
			+styleHtml
		+'>'
			+spanObj.html
		+'</div>'
	config.$input.after(html);
	if(config.readonly){
		return;
	}
	//失去焦点要执行清除
	config.$input.on('blur', config, function(ev){
		config = ev.data;
		if(config.htmlinputConfig.isUsePreviewMode){
			config.$htmlInput.removeClass('preview');
		}
		clearHtmlInput();
	})
	//设置点击选取---------------
	//模拟input的jquery对象
	config.$htmlInput = config.$container.find('.shortcut-html-input');
	htmlInputEventInit();
}
//清除模拟input的操作状态
function clearHtmlInput(){

	config.$htmlInput.find('span.active').removeClass('active');
	var $selectedSpans = config.$htmlInput.find('span.selected');
	config.$selectedSpans = $selectedSpans;
	$selectedSpans.removeClass('selected');
}
//初始化HtmlInput的事件
function htmlInputEventInit(){
	//所有的可操作span
	var $inputSpans = config.$htmlInput.find('span[nstag-index]');
	config.$inputSpans = $inputSpans;
	//计算最后一个span的宽度

	//模拟input的位置
	config.htmlInputOffsetX = config.$htmlInput.offset().left;
	config.htmlInputOffsetY = config.$htmlInput.offset().top;

	//如果是开发模式，则需要减去模拟显示层的位移
	if(config.htmlinputConfig.isUsePreviewMode){
		config.htmlInputOffsetTop = config.$container.height();
	}else{
		config.htmlInputOffsetTop = 0;
	}
	//span的位置
	var spanArray = [];
	for(var inputSpanI = 0; inputSpanI<$inputSpans.length; inputSpanI++){
		var $inputSpan = $inputSpans.eq(inputSpanI);
		var spanOffsetX = $inputSpan.offset().left;
		var spanWidth = $inputSpan.width();
		spanOffsetX = spanOffsetX - config.htmlInputOffsetX;
		//offsetx 和宽度

		var spanAttr = {
			$span:$inputSpan,
			offsetX:spanOffsetX + spanWidth/2,
			width:spanWidth
		}
		//如果是textarea则需要计算offsetY
		if(config.type == 'textarea'){
			spanAttr.offsetY = $inputSpan.offset().top - config.htmlInputOffsetY;
		}
		spanArray.push(spanAttr);		
		
	}
	//追加了开始位置和结束位置
	config.spanArray = spanArray;
	config.eventIsMove = false;
	config.$htmlInput.off('mousedown');
	config.$htmlInput.on('mousedown', config, function(inputMouseDownEvent){
		//阻止默认事件和清除模拟input的标记
		inputMouseDownEvent.preventDefault();
		var _config = inputMouseDownEvent.data;
		config = _config;
		var spanArray = _config.spanArray;
		clearHtmlInput();
		//开始位置
		var startX = inputMouseDownEvent.pageX - _config.htmlInputOffsetX;
		if(_config.type == 'textarea'){
			var startY = inputMouseDownEvent.pageY - _config.htmlInputOffsetY + _config.htmlInputOffsetTop;
		}
		
		//根据位置设置选中状态
		function setSelectState(mouseCurrentX, mouseCurrentY){
			var isMoveRight = mouseCurrentX>=startX;
			var selectedSpanIndexArray = [];
			//对所有的span对象进行循环查找
			for(var spanXI = 0; spanXI<spanArray.length; spanXI++){
				var spanX = spanArray[spanXI].offsetX;
				var spanWidth =  spanArray[spanXI].width;
				var $span = spanArray[spanXI].$span;
				//判断方向 start----
				if(isMoveRight){
					//从左向右移动
					if(spanX>startX && spanX<mouseCurrentX + spanWidth){
						if(_config.type == 'text'){
							selectedSpanIndexArray.push(spanXI);
							$span.addClass('selected');
						}else if(_config.type == 'textarea'){
							var spanY = spanArray[spanXI].offsetY;
							if(mouseCurrentY > spanY && mouseCurrentY < spanY+14){
								selectedSpanIndexArray.push(spanXI);
								$span.addClass('selected');
								console.warn('addSelected:'+$span.text());
							}else if($span.hasClass('selected')){
								//对已经选中的添加到数组中
								selectedSpanIndexArray.push(spanXI);
							}
						}else{
							//结果录入时使用这里 cy 191212
							selectedSpanIndexArray.push(spanXI);
							$span.addClass('selected');
						}
					}else{
						if( $span.hasClass('selected') ){
							$span.removeClass('selected');
						}
					}
				}else{
					//从右向左移动
					// if( spanX < startX && spanX > mouseCurrentX ){
					// 	selectedSpanIndexArray.push(spanXI);
					// 	$span.addClass('selected');
					// }else{
					// 	if( $span.hasClass('selected') ){
					// 		$span.removeClass('selected');
					// 	}
					// }
					if( spanX < startX && spanX > mouseCurrentX){
						if(_config.type == 'text'){
							selectedSpanIndexArray.push(spanXI);
							$span.addClass('selected');
						}else if(_config.type == 'textarea'){
							var spanY = spanArray[spanXI].offsetY;
							if(mouseCurrentY > spanY && mouseCurrentY < spanY+14){
								selectedSpanIndexArray.push(spanXI);
								$span.addClass('selected');
							}else if($span.hasClass('selected')){
								//对已经选中的添加到数组中
								selectedSpanIndexArray.push(spanXI);
							}
						}else{
							//结果录入时使用这里 cy 191212
							selectedSpanIndexArray.push(spanXI);
							$span.addClass('selected');
						}
					}else{
						if( $span.hasClass('selected') ){
							$span.removeClass('selected');
						}
					}
				}
				//判断方向 end----

				//所有选中的元素，排序后选中开始和结束中的遗漏部分
				selectedSpanIndexArray.sort(function(a, b){return a-b});
				if(selectedSpanIndexArray.length>=2){
					var selectedStart = selectedSpanIndexArray[0];
					var selectedEnd = selectedSpanIndexArray[selectedSpanIndexArray.length-1];
					for(var spanSortI = selectedStart; spanSortI<=selectedEnd; spanSortI++){
						if(spanArray[spanSortI].$span.hasClass('selected')){
							//有了就不用动了
						}else{
							spanArray[spanSortI].$span.addClass('selected')
						}
					}
				}
			}
			return selectedSpanIndexArray;
		}
		//鼠标移动，选中元素
		_config.$htmlInput.on('mousemove', function(inputMouseUpEvent){
			_config.eventIsMove = true;
			//移动中的位置 需要加上元素的宽度
			var moveX = inputMouseUpEvent.pageX - _config.htmlInputOffsetX;
			var moveY = inputMouseUpEvent.pageY - _config.htmlInputOffsetY  + _config.htmlInputOffsetTop ;
			setSelectState(moveX, moveY);
		})
		//没有点击span元素，点击或者拖拽的范围不包含任何可用span
		function unMoveSelected(endX){
			if(endX<spanArray[0].offsetX){
				$inputSpans.eq(0).addClass('active');
				focusInput(_config, {start:0, end:0});
			}else if(endX>spanArray[spanArray.length-1].offsetX){
				var lastSapnIndex = spanArray.length-1;
				$inputSpans.eq(lastSapnIndex).addClass('active');
				var lastInputValueIndex = parseInt($inputSpans.eq(lastSapnIndex).attr('nstag-index'));
				focusInput(_config, {start:lastInputValueIndex, end:lastInputValueIndex})
			}
		}
		//鼠标放开，选中元素，激活输入框
		_config.$htmlInput.on('mouseup mouseleave', function(inputMouseUpEvent){
			_config.$htmlInput.off('mouseup');
			_config.$htmlInput.off('mouseleave');
			_config.$htmlInput.off('mousemove');
			var endX = inputMouseUpEvent.pageX - _config.htmlInputOffsetX;
			var endY = inputMouseUpEvent.pageY - _config.htmlInputOffsetY  + _config.htmlInputOffsetTop ;
			//如果是拖拽动作，则看选择区域
			if(_config.eventIsMove){
				_config.eventIsMove = false;
				var selectedSpanIndexArray = setSelectState(endX, endY);
				
				if(selectedSpanIndexArray.length == 0){
					unMoveSelected(endX);
				}else{
					var start = $inputSpans.eq(selectedSpanIndexArray[0]).attr('nstag-index');
					var end = $inputSpans.eq(selectedSpanIndexArray[selectedSpanIndexArray.length-1]).attr('nstag-index');
					start = parseInt(start);
					end = parseInt(end);
					var inputValueStr = config.$input.val();
					if(inputValueStr.substring(end, end+1)!='<'){
						end = end+1;
					}else{
						end = end+inputValueStr.substring(end).indexOf('>')+1;
					}
					focusInput(_config, {start:start, end:end});
				}
			}else{
				//如果是点击，则使用span的click事件
				unMoveSelected(endX);
			}
			
		})
	})
	
	$inputSpans.on('click', config, function(mouseDownEvent){
		//是否span触发的， 也有可能是在模拟的input上触发的
		var _config = mouseDownEvent.data;
		//如果产生了拖动事件，则不执行
		if(_config.eventIsMove){
			return;
		}
		clearHtmlInput();
		var $this = $(this);
		var start = parseInt($(this).attr('nstag-index'));
		$this.addClass('active');
		focusInput(_config, {start:start, end:start})
	})
}
//显示辅助按钮 cy 191211 start ----------------
function setAssBtns(start, end) {
	var $input = config.$input;
	var suphtml = '<button type="button" netstar-assinput="sup">X<sup style="color:#ff0000;">2</sup></button>';
	var subhtml = '<button type="button" netstar-assinput="sub">X<sub style="color:#ff0000;">2</sub></button>';
	var ihtml = '<button type="button" netstar-assinput="i"><i style="color:#ff0000;">i</i></button>';
	var html  = '<div class="resultinput-assinput-panel" style="position: absolute; right: 0; top: -24px;">'+ suphtml + subhtml + ihtml +'</div>';
	$input.parent().append(html);
	$input.parent().find('[netstar-assinput]').on('click', {config:config}, function(ev){
		var assInputStr = $(this).attr('netstar-assinput');  //返回sup sub i
		var _config =  ev.data.config;
		var _outputValue = _config.$input.val();
		console.warn("原来的值:", _outputValue);
		//获取到之前选中的文本
		var _$selectedSpans = _config.$selectedSpans;
		if(_$selectedSpans.length > 0){
			var firstSpan = _$selectedSpans.eq(0);
			var startIndex = parseInt(firstSpan.attr('nstag-index'));
			var lastSpan = _$selectedSpans.eq(_$selectedSpans.length - 1);
			var lastIndex = parseInt(lastSpan.attr('nstag-index'));

			var inputValue = _outputValue;
			var inputValue1 = inputValue.substr(0, startIndex);
			var inputValue2 = inputValue.substr(startIndex, lastIndex);  //这个是真正选中的文本 前后添加标签
			var inputValue3 = inputValue.substr(lastIndex+1);

			//判断选中范围中是否有标签 
			var tagRegexp = /\<(.*?)\>/g;
			var result; 
			var tagsArr = [];
			// console.log(tagRegexp.exec(inputValue2));
			while ( ( result = tagRegexp.exec(inputValue2) ) != null) {
				tagsArr.push(result)
				tagRegexp.lastIndex;
			}
			var isSetOutputValue = false;
			//如果包含两个标签且成对才进一步处理，如果是单数则先清除标签
			if(tagsArr.length == 2){
				//选取的范围是否以TAG开头和结尾
				var isFirstTag = tagsArr[0].index == 0;
				var isLastTag = tagsArr[1].index + tagsArr[1][0].length == inputValue2.length;
				if(isFirstTag && isLastTag){
					//如果两个是一对，并且与当前选中的相等，则取消标签
					if(('/'+tagsArr[0][1]) == tagsArr[1][1]){
						if( tagsArr[0][1] == assInputStr){
							//取消标签
							inputValue2 = inputValue2.replace(tagsArr[0][0], '');
							inputValue2 = inputValue2.replace(tagsArr[1][0], '');
							_outputValue = inputValue1 + inputValue2+ inputValue3;
							isSetOutputValue = true;
						}
					}
				}
			}
			if(isSetOutputValue == false){
				if(tagsArr.length % 2 == 1 ){
					//只有一个标签，不成对，无法使用
					_outputValue = inputValue;
					nsalert('选中的文本无法添加标签', 'error');
					isSetOutputValue = true;
				}else if(tagsArr.length % 2 == 0){
					//清除掉所有标签
					for(var i = 0; i<tagsArr.length; i++){
						inputValue2 = inputValue2.replace(tagsArr[i][0], '');
					}
					console.warn( 'clear', inputValue2 )
				}
			}
			

			if(isSetOutputValue == false){
				_outputValue = inputValue1 + '<' + assInputStr + '>'+ inputValue2 + '</' + assInputStr + '>'+ inputValue3;
			}
			

			_config.value = _outputValue;
			_config.$input.val(_outputValue);
			var spanObj = getSpansData(_outputValue);
			_config.$htmlInput.html(spanObj.html);
			htmlInputEventInit();
		}
		ev.stopPropagation();
		ev.preventDefault();
	})
}

//显示辅助按钮 cy 191211 end   ----------------

//恢复input的激活状态，准备接受输入
function focusInput(config, inputPosition){
	var start = inputPosition.start;
	var end = inputPosition.end;
	config.$input.focus();
	setAssBtns(start, end);
	config.$input[0].setSelectionRange(start, end);
	//预览开发模式下两个不重叠
	if(config.htmlinputConfig.isUsePreviewMode){
		config.$htmlInput.addClass('preview');
		config.$htmlInput.css({'top': '-'+config.$htmlInput.outerHeight()+'px'});
	}
}
//获取value的html代码和span对象数组
function getSpansData(value){
	//只读模式下直接返回html代码
	value = value.replace(/\</g,function($1){return ' '+$1}); //在标签<>前面加个空格
	if(config.readonly){
		return {html:value};
	}
	var spanDataArray = [];

	var replaceLeftTag = /</;
	
	value = value+' ';
	var valueArray = value.split('');
	for(var spanI = 0; spanI<valueArray.length; spanI++){
		var inputIndex = spanI;
		var tagArray = value.substring(0, spanI).match(/\</g);
		var brTagArray = value.substring(0, spanI).match(/\<br\/\>/g);
		if(tagArray){
			inputIndex = inputIndex - tagArray.length;
			if(brTagArray){
				//inputIndex = inputIndex - brTagArray.length;
			}
		}
		//空格需要转义显示
		var tagText = valueArray[spanI];
		if(tagText == ' '){
			tagText = '&nbsp;'
		}
		spanDataArray[spanI] = {
			inputIndex:inputIndex,
			type:'text',
			value:valueArray[spanI],
			html: 	'<span '
						+'nstag-type="text" '
						+'nstag-index="'+inputIndex+'" '
					+'>'
					+tagText
					+'</span>'
		}
	}
	var valueFormatStr = value;

	//查找简单TAG（单标签）如：</br>，并修改
	while ((stResult = tagRep.tagSimpleG.exec(valueFormatStr)) != null)  {
		var stStr = stResult[0];
		var stStrLength = stStr.length;
		var stStrIndex = stResult.index;

		for(var i = stStrIndex; i<stStrIndex + stStrLength; i++){
			spanDataArray[i].html = spanDataArray[i].value;
			spanDataArray[i].type = 'html';
			spanDataArray[i].spanIndex = spanDataArray[stStrIndex].inputIndex;
		}
	}

	//匹配<sub><sup> 识别标签
	var htmlTagMatchArray = valueFormatStr.match(tagRep.startG);
	var htmlTagLength = 0;
	if(htmlTagMatchArray){
		htmlTagLength = htmlTagMatchArray.length;
	}
	//修改Tag标签，插入到字符串数组中
	for(var tagI = 0; tagI<htmlTagLength; tagI++){
		/*
		 * tagData:{
		 * 	startIndex: 	3,
		 *  startTag:  		'<sub>',
		 *  endIndex:  		15,
		 *  endTag: 		'</sub>',
		 *  tagHtml: 		'<sup>2</sup>'
		 *  tagText: 		'2'
		 * }	
		 */
		var replaceTag = valueFormatStr.match(tagRep.start);
		//标签的开始位置 
		var tagData = 
		{
			startIndex:replaceTag.index,
			startTag:replaceTag[0]
		};
		var tagEndStr = '</'+tagData.startTag.substr(1,tagData.startTag.length-2)+'>';
		var tagEndRegExp = new RegExp(tagEndStr);
		var replaceTag = valueFormatStr.match(tagEndRegExp);
		//结束tag
		tagData.endIndex = replaceTag.index + tagEndStr.length;
		tagData.endTag = replaceTag[0];
		//tag对应的html和text
		tagData.tagHtml = valueFormatStr.substring(tagData.startIndex, tagData.endIndex);
		tagData.tagText = tagData.tagHtml.substring(tagData.startTag.length, tagData.tagHtml.length-tagData.endTag.length);
		//replaceTagArray.push(tagData);
		//将原始文本中的html tag标签的相关内容删除
		var replaceTagStr = '';
		var tagTextStart = tagData.startIndex + tagData.startTag.length;
		var tagTextEnd = tagData.endIndex - tagData.endTag.length;
		for(var strI = tagData.startIndex; strI<tagData.endIndex; strI++){
			var spanData = spanDataArray[strI];
			replaceTagStr += ' '
			if(strI<tagTextStart || strI>=tagTextEnd){
				//需要原样输出的标签
				spanData.type = 'html';
				spanData.html = spanData.value;
			}else{
				//保持原样
			}
			
		}
		valueFormatStr = valueFormatStr.substring(0, tagData.startIndex) +replaceTagStr+ valueFormatStr.substring(tagData.endIndex, valueFormatStr.length);
	}
	var html = '';
	var spanIndex = 0;  //输入框里的文字对应htmlinput中的span位置
	for(var spanI = 0; spanI<spanDataArray.length; spanI++){
		var spanData = spanDataArray[spanI];
		html += spanData.html;
		if(typeof(spanData.spanIndex) == 'undefined'){
			//已经生成spanIndex的就不生成了，比如<br>;
			spanData.spanIndex = spanIndex;
		}
		
		if(spanData.type == 'text'){
			spanIndex++;
		}else{
			//不是文本的不递增，由于没有输入span标签，span位置不发生变化
		}
	}
	return {
		html:html,
		spanDataArray:spanDataArray
	}
}
//获取光标选择对象
function getCursorSelected(inputDom){
	/**
	 * 返回光标结果
	 * return {
	 *		start:光标开始位置
	 * 		end:光标结束位置
	 * 		selected: 是否选中
	 * 		selectedText: 选中的文字
	 * }
	 **/
	var cursorSelected = {
		start:inputDom.selectionStart,
		end:inputDom.selectionEnd
	}
	if(cursorSelected.start == cursorSelected.end){
		cursorSelected.selected = false;
		cursorSelected.selectedText = '';
	}else{
		cursorSelected.selected = true;
		var selectedText = config.$input.val();
		selectedText = selectedText.substring(cursorSelected.start, cursorSelected.end);
		cursorSelected.selectedText = selectedText;
	}
	return cursorSelected;
}
//返回文本框的光标是否在标签html内 retrun true/false
function getIsWithInTagHtml(inputValue, cursorPosition){
	var leftValue = inputValue.substring(0,cursorPosition);
	var leftMatchArray = leftValue.match(tagRep.tagLeftG);
	var leftMatchArrayLength = 0;
	if(leftMatchArray){
		leftMatchArrayLength = leftMatchArray.length;
	};
	var rightMatchArray = leftValue.match(tagRep.tagRightG);
	var rightMatchArrayLength = 0;
	if(rightMatchArray){
		rightMatchArrayLength = rightMatchArray.length;
	};
	//如果标签数量不一样则一定是在一个标签内容了
	var isWithIn =  leftMatchArrayLength != rightMatchArrayLength;
	//ture是在一个标签内<sup>或者</sup>，不可见的文字，false就是在标签外,是可见的文字
	return isWithIn;
}
//返回合法的html
function getValidValue(inputValue, $input){
	var inputDom = $input[0];
	var returnStr = inputValue;
	var tagStartArray = inputValue.match(tagRep.anyTagG);
	var isValid = false;
	if(tagStartArray){
		if(tagStartArray.length%2 == 0){
			//标签数量成对出现，数量合法
			isValid = true;
		}else{
			isValid = false;
		}
	}else{
		//一个标签都没有也是合法
		isValid = true;
	}
	//清理空标签
	function clearEmptyTag(){
		returnStr = returnStr.replace(tagRep.tagEmptyG, '');
		var tagsStrEmptyArray = returnStr.match(tagRep.tagEmptyG);
		if(tagsStrEmptyArray){
			clearEmptyTag();
		}
	}
	//返回清理标签后的新光标位置
	function getCursorStart(){
		var withoutTagRightStr = clearAfterCursorRightStr;
		while((patt = tagRep.anyTagG.exec(clearAfterCursorLeftStr))!=null){
			//获取去掉当前标签的字符串
			var withoutTagLeftStr = patt.input.substring(0, patt.index);
			var tagStr = patt[0];
			//同步清理标签
			if(withoutTagRightStr.indexOf('<')==0){
				withoutTagRightStr = withoutTagRightStr.substring(withoutTagRightStr.indexOf('>'));
			}
			if((withoutTagLeftStr+withoutTagRightStr) == returnStr){
				return patt.index;
			}else{
				return clearAfterCursorLeftStr.indexOf('<');
			}
		}
	}
	var cursor = getCursorSelected(inputDom);
	var cursorStart = cursor.start;

	if(isValid == false){
		var validValue = inputValue;
		//原始字符串
		var originalStr = config.originalValue.text;
		var originalLeftStr = originalStr.substring(0, config.originalValue.start); 	//选中范围左边的
		var originalRightStr = originalStr.substring(config.originalValue.end); 		//选中范围右边的
		var originalEditStr = originalStr.substring(config.originalValue.start, config.originalValue.end);
		//新字符串
		var newStr = inputValue;
		
		//新增加的字符串
		var newInputStr = newStr.substring(originalLeftStr.length,(newStr.length-originalRightStr.length));
		var tagsStr = '';
		var editTagArray = originalEditStr.match(tagRep.anyTagG);
		if(editTagArray){
			for(var tagI = 0; tagI<editTagArray.length; tagI++){
				tagsStr += editTagArray[tagI];
			}
		}

		returnStr = returnStr.substring(0, originalLeftStr.length+newInputStr.length)+tagsStr+originalRightStr;
		//清理空标签
		if(config.originalValue.isInsertEmptyTag == false){
			var tagsStrEmptyArray = returnStr.match(tagRep.tagEmptyG);
			if(tagsStrEmptyArray){
				clearEmptyTag();
			}
			var clearAfterCursorLeftStr = newStr.substring(0, cursor.start);
			var clearAfterCursorRightStr = newStr.substring(cursor.start);
			var clearBeforeCursorLeftStr = returnStr.substring(0, cursor.start);

			//如果清理了html标签，则需要重新定位光标和刷新input的value
			if(clearAfterCursorLeftStr != clearBeforeCursorLeftStr){
				cursorStart = getCursorStart();
			}else{
				//不用改光标位置
			}
			$input.val(returnStr);
			inputDom.setSelectionRange(cursorStart, cursorStart);
		}
		
		
	}else{
		//合法则不用修改
		//清理空标签
		var tagsStrEmptyArray = returnStr.match(tagRep.tagEmptyG);
		if(tagsStrEmptyArray){
			//清理空标签
			//debugger
			if(config.originalValue.isInsertEmptyTag == false){
				clearEmptyTag();
				var clearAfterCursorLeftStr = inputValue.substring(0, cursor.start);
				var clearAfterCursorRightStr = inputValue.substring(cursor.start);
				var clearBeforeCursorLeftStr = returnStr.substring(0, cursor.start);
				cursorStart = getCursorStart();
				$input.val(returnStr);
				inputDom.setSelectionRange(cursorStart, cursorStart);
			}
		}

	}
	return returnStr;
}
//htmlinpu的初始化
function formHtmlInputInit(){
	htmlInputContainerInit(config);
	//只读模式不需要绑定事件
	if(config.readOnly){
		return;
	}
	//config.$input.off('keydown');
	config.$input.on('keydown', config, inputKeydownHandler);
	//config.$input.off('keyup');
	config.$input.on('keyup', config, inputKeyupHandler);
	function inputKeyupHandler(event){
		event.stopPropagation();
		config = event.data;
		var $this = $(this);
		var inputDom = $this[0];
		var inputValue = $this.val();
		inputValue = getValidValue(inputValue, $this); //获取有效的input文本，如果有半个标签等情况，需要处理
		var cursor = getCursorSelected(inputDom);
		
		//如果在一个标签内，是不可见的文字
		var isWithInTagHtml = getIsWithInTagHtml(inputValue, cursor.start);
		var leftValue = inputValue.substring(0, cursor.start);
		var rightValue = inputValue.substring(cursor.start);
		var resetInputIndex = 0;
		var isNeedResetInput = false; //是否需要重新定位光标
		if(isWithInTagHtml){
			
			switch(event.keyCode){
				case 37:
					//左 跳过tag标签 到标签前面
					resetInputIndex = leftValue.lastIndexOf('<');
					isNeedResetInput = true;
					break;
				case 39:
					//右 跳过tag标签 到标签后面
					resetInputIndex = rightValue.indexOf('>')+1+leftValue.length;
					isNeedResetInput = true;
					break;
			}
		}
		//如果出现了需要跳过的tag标签
		if(isNeedResetInput){
			//重新设定位置
			config.$input[0].setSelectionRange(resetInputIndex,resetInputIndex);
			//重新获取cursor的属性
			cursor = getCursorSelected(inputDom);
		}
		
		var spansData = getSpansData(inputValue);
		config.$htmlInput.html(spansData.html); //subscript
		htmlInputEventInit();

		//处理额外添加的空格对span定位的影响
		var tagNumber = 0;
		var anyTagArray = leftValue.match(tagRep.anyTagG);
		var brTagArray = leftValue.substring(0, spanI).match(/\<br\/\>/g);

		//每个标签会在自己前面产生一个空格
		if(anyTagArray){
			tagNumber = anyTagArray.length;
		}
		if(brTagArray){
			tagNumber = tagNumber + brTagArray.length;
		}

		var selectedCursor = {
			start:cursor.start+tagNumber,
			end:cursor.end
		}
		
		if(cursor.selected){
			//选中区域文字包含的标签对
			var selectLeftValue = inputValue.substring(0,cursor.end);
			var tagNumber = 0;
			var anyTagArray = selectLeftValue.match(tagRep.anyTagG);
			if(anyTagArray){
				//每个标签会在自己前面产生一个空格
				selectedCursor.end = cursor.end + anyTagArray.length;
			}
			//映射选中区域
			var spanStartIndex = spansData.spanDataArray[selectedCursor.start].spanIndex;
			var spanEndIndex = spansData.spanDataArray[selectedCursor.end].spanIndex;
			clearHtmlInput();
			for(var spanI = spanStartIndex; spanI<spanEndIndex; spanI++){
				config.$inputSpans.eq(spanI).addClass('selected');
			}
			
		}else{
			//映射插入状态
			clearHtmlInput();
			var spanIndex = spansData.spanDataArray[selectedCursor.start].spanIndex;
			config.$inputSpans.eq(spanIndex).addClass('active');
		}
	}
	/* 上标下标快捷键 通过定义输入快捷键和插入标签可以定义其它的快捷键 */
	function inputKeydownHandler(event){
		config = event.data;

		var $this = $(this);
		var inputDom = $this[0];  //input的dom对象
		var cursor = getCursorSelected(inputDom);
		config.originalValue = cursor;
		config.originalValue.text = $this.val();
		config.originalValue.isInsertEmptyTag  = false; //是否插入tag，有可能产生空标签

		//捕捉输入事件 
		if(event.altKey && event.shiftKey && event.keyCode === 187){
			//输入上标 alt+shift+'+'
			event.stopPropagation();
			event.preventDefault();
			insertHtml('sup', getCursorSelected(inputDom));
		}else if(event.altKey && event.shiftKey == false && event.keyCode === 187){
			//输入下标 alt+'+'
			event.stopPropagation();
			event.preventDefault();
			var cursor = getCursorSelected(inputDom);
			insertHtml('sub', cursor);
		}else if(event.altKey && event.keyCode === 13){
			//输入下标 alt+'enter' alt回车
			event.stopPropagation();
			event.preventDefault();
			var cursor = getCursorSelected(inputDom);
			//简单标签插入
			insertHtmlBySimpleTag('<br/>', cursor);
		}else if(event.altKey && event.keyCode === 189){
			//可能的误操作
			event.stopPropagation();
			event.preventDefault();
		}else if(event.keyCode == 9){
			//tab 直接跳过即可
			event.stopPropagation();
		}else{
			//非快捷键输入
			//非选择区域情况下才需要处理，当前是输入状态
			if(cursor.start == cursor.end){
				switch(event.keyCode){
					//backspace 向前删除
					case 8:
						var oldValueStr = config.originalValue.text;
						//要删除的字符串
						var deleteStr = oldValueStr.substring(0, cursor.start);
						console.warn('deleteStr:'+deleteStr);

						//如果最后一个字符是 > 则判断是否<br/>等单标签，如果是, 则删除整个标签；如果不是， 是成对的标签，则需要先去删标签内部的，直到内部清空才删标签
						var deleteTargetType = 'normal';  //deleteTargetType  normal 普通 tag 单标签 ditag 成对标签
						if(/\>$/.test(deleteStr)){
							if(/\/\>$/.test(deleteStr)){
								//以 /> 结尾，是单标签
								deleteTargetType = 'singletag';
							}else{
								//以 > 结尾，是成对标签
								deleteTargetType = 'ditag';
							}
						}
						console.warn('deleteTargetType:'+deleteTargetType);

						switch(deleteTargetType){
							case 'ditag':
								//成对标签先删内部 跳过标签直接删文字
								var oldValueLeftStr = oldValueStr.substring(0, cursor.start);
								var oldValueRightStr = oldValueStr.substring(cursor.end);
								var cursorStart = oldValueLeftStr.lastIndexOf('<')-1;
								var newValueStr = oldValueLeftStr.substring(0, oldValueLeftStr.lastIndexOf('<')-1);
								newValueStr += oldValueLeftStr.substring(oldValueLeftStr.lastIndexOf('<'));
								newValueStr += oldValueRightStr;
								$this.val(newValueStr);
								inputDom.setSelectionRange(cursorStart, cursorStart);
								event.preventDefault();
								break;

							case 'singletag':
								//单标签直接删除
								var oldValueLeftStr = oldValueStr.substring(0, cursor.start);
								var oldValueRightStr = oldValueStr.substring(cursor.end);

								var matchResult = oldValueLeftStr.match(/\<[a-z]*?\/\>$/);  //查找最后一个单标签的开始位置
								var cursorStart = matchResult.index;
								var newValueStr = oldValueLeftStr.substring(0, matchResult.index);
								newValueStr += oldValueRightStr;
								$this.val(newValueStr);
								inputDom.setSelectionRange(cursorStart, cursorStart);
								event.preventDefault();
								break;
						}
						// var isDeleteTag = deleteStr.lastIndexOf('>') ==  deleteStr.length - 1;
						// //如果要删除时标签里的 >
						// // 如果要删除的标签是<br/>, 那就不用跳过了标签删字符了
						// var isDeleteBRTag = /\>$/.test(deleteStr);
						// if(isDeleteTag){
						// 	//跳过标签直接删文字
						// 	var oldValueLeftStr = oldValueStr.substring(0, cursor.start);
						// 	var oldValueRightStr = oldValueStr.substring(cursor.end);
						// 	var cursorStart = oldValueLeftStr.lastIndexOf('<')-1;
						// 	var newValueStr = oldValueLeftStr.substring(0, oldValueLeftStr.lastIndexOf('<')-1);
						// 	newValueStr += oldValueLeftStr.substring(oldValueLeftStr.lastIndexOf('<'));
						// 	newValueStr += oldValueRightStr;

						// 	$this.val(newValueStr);
						// 	inputDom.setSelectionRange(cursorStart, cursorStart);
						// 	event.preventDefault();
						// }

						break;
					//delete 向后删除
					case 46:
						var oldValueStr = config.originalValue.text;
						//要删除的字符串
						var deleteStr = oldValueStr.substring(cursor.start);
						var isDeleteTag = deleteStr.indexOf('<') ==  0;
						//如果要删除时标签里的 >
						if(isDeleteTag){
							//跳过标签直接删文字
							var oldValueLeftStr = oldValueStr.substring(0, cursor.start);
							var oldValueRightStr = oldValueStr.substring(cursor.end);
							var cursorStart = oldValueRightStr.indexOf('>')+cursor.start+1;
							var newValueStr = oldValueRightStr.substring(0, oldValueRightStr.indexOf('>')+1);
							newValueStr += oldValueRightStr.substring(oldValueRightStr.indexOf('>')+2);
							newValueStr = oldValueLeftStr + newValueStr;

							$this.val(newValueStr);
							inputDom.setSelectionRange(cursorStart, cursorStart);
							event.preventDefault();
						}
						break;
				}
			}else{
				switch(event.keyCode){
					//backspace 向前删除
					case 8:
					//delete 向后删除
					case 46:
						var oldValueStr = config.originalValue.text;
						//要删除的字符串
						var deleteStr = oldValueStr.substring(cursor.start, cursor.end);
						//var deleteStrTagArray = deleteStr.match()
						var anyTag = tagRep.anyTagG;
						var newValueStr = '';
						while((patt = anyTag.exec(deleteStr))!=null){
							//清除内容，拼接标签
							newValueStr += deleteStr.substring(patt.index, anyTag.lastIndex);
						}
						//新的
						newValueStr = 
							  oldValueStr.substring(0, cursor.start)
							+ newValueStr
							+ oldValueStr.substring(cursor.end);
						//删除空标签
						newValueStr = newValueStr.replace(tagRep.tagEmptyG, '');
						//找到光标位置
						var cursorStart = newValueStr.length;
						//逐个标对文本 找到不一样的作为插入点
						for(var strI = 0; strI<newValueStr.length; strI++){
							var subStr1 = newValueStr.substring(strI, strI+1);
							var subStr2 = oldValueStr.substring(strI, strI+1);
							
							if(subStr2!=subStr1){
								cursorStart = strI;
								var firstTagStart = newValueStr.substring(cursorStart).indexOf('<');
								var firstTagEnd = newValueStr.substring(cursorStart).indexOf('>');
								//如果是在标签里面，则指向标签有效部分
								if(firstTagEnd<firstTagStart){
									cursorStart = cursorStart + firstTagEnd+1;
								}
								//如果是最开始，且只有标签没有文本,则指向标签有效部分
								if(cursorStart == 0 && newValueStr.indexOf('<')==0){
									cursorStart = newValueStr.indexOf('>')+1;
								}
								break;
							}
						}
						$this.val(newValueStr);
						inputDom.setSelectionRange(cursorStart, cursorStart);
						event.preventDefault();
						break;
					}
				
			}
			
			//正常执行操作
		}
		
	}
}
//配置参数
var config;
//标签相关的正则表达式 必须要先定义所包含的英文字符，没有使用/d
var tagContent = 'subpiu' //支持sub上标 sup下标 i斜体 b粗体 u下划线
var tagRep = {
	start: 		new RegExp('<['+tagContent+']*>'),  			//开始标签
	startG: 	new RegExp('<['+tagContent+']*>', 'g'), 		//开始标签 全局搜索
	end: 		new RegExp('<\/['+tagContent+']*>'), 			//结束标签
	endG: 		new RegExp('<\/['+tagContent+']*>', 'g'), 		//结束标签 全局搜索
	anyTagG: 	new RegExp('<['+'\/'+tagContent+']*>', 'g'), 	//所有标签 全局搜索
	tagLeftG: 	new RegExp('\<','g'), 							//标签的左边 '<'  全局搜索
	tagRightG: 	new RegExp('\>','g'), 							//标签的左边 '>'  全局搜索
	tagEmpty: 	/<(.*?)><\/\1>/, 								//空标签 <sup></sup>
	tagEmptyG:  /<(.*?)><\/\1>/g, 								//空标签 <sup></sup>
	tagSimpleG: /<[br]*\/>/g, 									//简单标签 <br/>
	tagSimple: 	/<[br]*\/>/, 
}
//设置默认的htmlinputConfig
function setDefault(){
	var htmlinputConfig = 
	{
		isUsePreviewMode:false
	}
	if(typeof(config.htmlinputConfig)!='object'){
		config.htmlinputConfig = {};
	}
	nsVals.setDefaultValues(config.htmlinputConfig, htmlinputConfig);
}
function init(_config, sourceType){
	//默认显示模式
	config = _config;
	setDefault();
	config.sourceType = sourceType;
	switch(sourceType){
		case 'form':
		case 'resulttable':
			formHtmlInputInit(config);
			break;
	}
}
return {
	init:init,
	getSpansData:getSpansData
}
})(jQuery);