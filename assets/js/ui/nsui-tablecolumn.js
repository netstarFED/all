/*
 * 表格自定义列配置
 * isUseTabs 是否使用  分情况处理 
* 使用tab 还要分是否制定分组列
 */
nsUI.tablecolumn = {};
nsUI.tablecolumn.init = function(_config){
	var configObj = _config;//配置参数
	/**
		*选择tab分类
		*可拖动排序的列
		*所有可拖动排序的列包括隐藏列
		*
	**/
	var managerData = configObj.managerData;//所有列相关属性配置
	var $container = configObj.$container;//容器
	var tabsDefaultIndex = managerData.tabsDefaultIndex;//当前活动的tab页
	var allColumnArray = [];//所有可选择列
	var visibleColumnArray = [];//当前可见的拖动列
	var tabsViewNameArray = managerData.tabsViewNameArray;//tab分类
	var tabColumnsArray = managerData.tabColumns[tabsDefaultIndex];//当前活动tab页的所有列
	if(!$.isArray(tabColumnsArray)){tabColumnsArray = managerData.tabColumns['auto'];}
	//输出填充html
	var tabsHtml = '<div class="manager-draggle"><select class="form-control ns-table-selectbase">';
	for(var tabI=0; tabI<tabsViewNameArray.length; tabI++){
		var selectedStr = tabI == tabsDefaultIndex ? 'selected' : '';
		tabsHtml += '<option value="'+tabI+'" '+selectedStr+'>'+tabsViewNameArray[tabI]+'</option>';
	}
	tabsHtml += '<select><div class="draggle-plane" id="manager-draggle-sort"></div></div>';
	$container.append(tabsHtml);
	var $dragarea = $('#manager-draggle-sort');//可操作的列拖动
	//设置定义列数组
	function setColumnData(){
		allColumnArray = [];
		visibleColumnArray = [];
		var colArray = tabColumnsArray;
		for(var columnI = 0; columnI < colArray.length; columnI++){
			var columnData = $.extend(true,[],colArray[columnI]);
			//if(columnData.tabPosition == tabsDefaultIndex){
				allColumnArray.push(columnData);
				if(!columnData.isHiddenColumn){
					//显示列
					visibleColumnArray.push(columnData);
				}
			//}
		}
	}
	//输出所有列
	function getAllLablesHtml(){
		var html = '';
		for(var columnI=0; columnI<allColumnArray.length; columnI++){
			var currentData = allColumnArray[columnI];
			var classStr = currentData.isHiddenColumn ? '' : 'current';
			html += '<div class="col-xs-2 '+classStr+'" ns-colIndex="'+currentData.columnIndex+'" ns-index="'+columnI+'"><span>'+currentData.title+'</span></div>';
		}
		return html;
	}
	//输出可设置显示列
	function getVisiableLablesHtml(){
		var html = '';
		//var width = Math.floor(100/visibleColumnArray.length);
		for(var columnI=0; columnI<visibleColumnArray.length; columnI++){	
		// style="width:'+width+'%;"	
			var currentData = visibleColumnArray[columnI];
			html += '<div class="col-xs-2">'
						+'<span ns-colIndex="'+currentData.columnIndex+'" ns-index="'+columnI+'">'+currentData.title+'</span>'
					+'</div>';
		}
		return html;
	}
	function getHtml(){
		setColumnData();
		//输出
		var html = '<p class="tils">拖动区块调整显示顺序</p>'
					+'<div class="alllabels sort">'//all-show-tab
						+getVisiableLablesHtml()
					+'</div>'
					+'<p class="tils">选择显示列</p>'
					+'<div class="alllabels choselables">'
						+getAllLablesHtml()
					+'</div>';
		$dragarea.html(html);
		var $alllabels = $dragarea.children('.choselables');
		var $allsort = $dragarea.children('.sort');
		$alllabels.children('div').off('click');
		$alllabels.children('div').on('click',function(ev){
			var $this = $(this);
			$this.toggleClass('current');
			var nsIndex = parseInt($this.attr('ns-index'));
			var isChecked = true;//是否选中
			if($this.hasClass('current')){
				isChecked = false;
			}else{
				isChecked = true;
			}
			var obj = {
				nsIndex:nsIndex,
				isChecked:isChecked
			}
			if(typeof(configObj.visibleColumnHandler)=='function'){
				tabColumnsArray = configObj.visibleColumnHandler(obj);
			}
			//重新读取显示排序
			setColumnData();
			$allsort.html(getVisiableLablesHtml());
			dragSortHandler();
		});
		dragSortHandler();
		function dragSortHandler(){
			var $dragLabels = $allsort.children('div');
			var dragLabels = [];
			$dragLabels.each(function(key,value){
				var $label = $(this);
				var labelCoordinate = {}; 
				var labelOffset= $label.offset();
				labelCoordinate.nsIndex = $label.index();
				labelCoordinate.index = $label.children('span').attr('ns-colIndex');
				labelCoordinate.x1 = labelOffset.left;
				dragLabels.push(labelCoordinate);
			})
			$dragLabels.on('mousedown',function(ev){
				var $this = $(this);
				var index = $this.index();
				var modalBodyOffset = $this.closest('.modal-body').offset();
				var modalOffset = $this.closest('.modal-tablemanger').offset();
				var currentOffset = $this.offset();
				var leftX = currentOffset.left;
				var topY = currentOffset.top;
				var positonLeft = leftX - modalBodyOffset.left;
				var positonTop = topY - modalOffset.top;
				var offsetX = ev.offsetX + leftX;
				var offsetY = ev.offsetY + topY;
				var positionJson = {
					offsetX:offsetX,
					offsetY:offsetY,
					left:positonLeft,
					top:positonTop,
					width:$this.outerWidth(),
					height:$this.outerHeight()
				}
				var positionStyle = 'left:'+positonLeft+'px;';  				//top
				positionStyle += ' top:'+positonTop+'px;';						//left
				positionStyle += ' width:'+positionJson.width+'px; '; 			//width
				positionStyle += ' height:'+positionJson.height+'px;'; 			//width
				var itemHtml = '<div id="span-drag-panel" class="tr-drag-panel" ns-index="'+index+'" style="'+positionStyle+'"></div>';
				if($('#span-drag-panel').length>0){
					$('#span-drag-panel').remove();
				}
				$('#nsui-tablemanger').append(itemHtml);//追加拖拽对象
				var $drag = $('#span-drag-panel');
				var availableIndex = 1;
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
					var targetObj = isAvailableZone();
					availableIndex = targetObj.index;
					var moveIndex = Number($drag.attr('ns-index'));//拖拽元素下标
					var targetIndex = targetObj.nsIndex;
					$drag.remove();
					console.log('moveIndex:'+moveIndex+';targetIndex:'+targetIndex);
					console.log(availableIndex)
					var obj = {
						currentIndex:moveIndex,
						targetIndex:availableIndex,
						endIndex:targetIndex,
					};
					if(typeof(configObj.dragSortHandler)=='function'){
						tabColumnsArray = configObj.dragSortHandler(obj);
					}
					//重新读取显示排序
					setColumnData();
					$allsort.html(getVisiableLablesHtml());
					dragSortHandler();
				});
				function isAvailableZone(){
					var moveOffset = $drag.offset();
					var targetObj = {};
					var moveCoordinate = {
						x1:moveOffset.left,
					}
					for(var moveI=0; moveI<dragLabels.length; moveI++){
						if(dragLabels[moveI].x1 <= moveCoordinate.x1){
							targetObj = dragLabels[moveI];
						}else{
							targetObj = dragLabels[moveI]
							break;
						}
					}
					return targetObj;
				}
			})
		}
	}
	getHtml();
	var $draggleTab = $container.children('.manager-draggle');
	$draggleTab.children('select').off('change');
	$draggleTab.children('select').on('change',function(ev){
		var $this = $(this);
		tabsDefaultIndex = Number($this.val());
		tabColumnsArray = managerData.tabColumns[tabsDefaultIndex];
		if(!$.isArray(tabColumnsArray)){tabColumnsArray = managerData.tabColumns['auto'];}
		getHtml();
		if(typeof(configObj.selectChangeHandler)=='function'){
			configObj.selectChangeHandler(tabsDefaultIndex);
		}
	});
	/*
	//位置计算
	function initComponent(){
		var $dragLabels = $showables.children('span');
		var dragLabels = [];
		$dragLabels.each(function(key,value){
			var $label = $(this);
			var labelCoordinate = {}; 
			var labelOffset= $label.offset();
			labelCoordinate.index = $label.index();
			labelCoordinate.x1 = labelOffset.left;
			dragLabels.push(labelCoordinate);
		})
		$dragLabels.on('mousedown',function(ev){
			var $this = $(this);
			var index = $this.index();
			var modalBodyOffset = $this.closest('.modal-body').offset();
			var modalOffset = $this.closest('.modal-tablemanger').offset();
			var currentOffset = $this.offset();
			var leftX = currentOffset.left;
			var topY = currentOffset.top;
			var positonLeft = leftX - modalBodyOffset.left;
			var positonTop = topY - modalOffset.top;
			var offsetX = ev.offsetX + leftX;
			var offsetY = ev.offsetY + topY;
			var positionJson = {
				offsetX:offsetX,
				offsetY:offsetY,
				left:positonLeft,
				top:positonTop,
				width:$this.outerWidth(),
				height:$this.outerHeight()
			}
			var positionStyle = 'left:'+positonLeft+'px;';  				//top
			positionStyle += ' top:'+positonTop+'px;';						//left
			positionStyle += ' width:'+positionJson.width+'px; '; 			//width
			positionStyle += ' height:'+positionJson.height+'px;'; 			//width
			var itemHtml = '<div id="span-drag-panel" class="tr-drag-panel" ns-index="'+index+'" style="'+positionStyle+'"></div>';
			if($('#span-drag-panel').length>0){
				$('#span-drag-panel').remove();
			}
			$('#nsui-tablecolumnmanger').append(itemHtml);//追加拖拽对象
			var $drag = $('#span-drag-panel');
			var availableIndex = index;
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
				var moveIndex = Number($drag.attr('ns-index'));//拖拽元素下标
				$drag.remove();
				console.log('moveIndex:'+moveIndex+';availableIndex:'+availableIndex);
				var existSortLength = columnArray.length;//数据长度
				//生成排序队列
				var rowIndexArr = [];
				var dataArr = [];
				for(var rowI=0; rowI<existSortLength; rowI++){
					var nsIndex = columnArray[rowI].columnIndex;//排序序列号
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
					columnArray[dataI].columnIndex = dataArr[dataI].editNsIndex;
				}
				columnArray.sort(function(a,b){return a.columnIndex - b.columnIndex;});
				refreshComponentHtml();
			});
			function isAvailableZone(){
				var moveOffset = $drag.offset();
				var moveCoordinate = {
					x1:moveOffset.left,
				}
				for(var moveI=0; moveI<dragLabels.length; moveI++){
					if(dragLabels[moveI].x1 <= moveCoordinate.x1){
						availableIndex = moveI;
					}
				}
				return availableIndex;
			}
		})
	}*/
}