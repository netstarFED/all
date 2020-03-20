nsMultiSelect.Json = {};
nsMultiSelect.multiSelectInit = function(multiselectJson){
	var currentSelectJson = {};
	currentSelectJson.attribute = multiselectJson;
	var multiselectID = 'multi-'+multiselectJson.multiID;
	nsMultiSelect.Json[multiselectID] = {};
	var selectArr = [];
	if(typeof(multiselectJson.select)!='undefined'){
		selectArr = multiselectJson.select;
	}else{
		$.ajax({
			url:multiselectJson.url, //请求的数据链接
			type:multiselectJson.method,
			data:multiselectJson.data,
			async:false,
			success:function(rec){
				if(typeof(multiselectJson.dataSrc)=='undefined'){
					selectArr = rec;
				}else{
					for(d in rec){
						selectArr = rec[multiselectJson.dataSrc];
					}
				}
			},
			error: function () {
				nsalert(language.common.commonconfig.nsalert.checkDataFormat,'warning');
			}
		});
	}
	var selectOrder = multiselectJson.order;
	if(typeof(selectOrder)!='undefined'){
		selectArr = selectArr.sort(function(a,b){
			if(Number(a[selectOrder]) < Number(b[selectOrder])){return -1;}
			if(Number(a[selectOrder]) > Number(b[selectOrder])){return 1;}
			if(Number(a[selectOrder]) == Number(b[selectOrder])){return 0;}
		});
	}
	currentSelectJson.orderData = selectArr;
	nsMultiSelect.Json[multiselectID] = currentSelectJson;
	multiSelectHtml = nsMultiSelect.Data(multiselectID);
	if($("#"+multiselectJson.id).length<1){
		nsalert("无法在页面上找到multi对象，请检查HTML和JSON中的id命名是否统一");
	}else if($("#"+multiselectJson.id).length>1){
		nsalert("HTML中的multi出现了ID重复,无法填充");
	}else{
		$("#"+multiselectJson.id).html(multiSelectHtml);
	}
	nsMultiSelect.componentMulti(multiselectID);
}
nsMultiSelect.Data = function(multiID){
	var multiAttribute = nsMultiSelect.Json[multiID].attribute;
	var selectArr = nsMultiSelect.Json[multiID].orderData;
	var selectHtml = '';
	for(var select = 0 ; select < selectArr.length; select ++){
		var textField = '';
		var valueField = '';
		var labelField = '';
		var groupArrField = 'subdata';
		if(typeof(multiAttribute.labelField)=='undefined'){
			labelField = 'label';
		}else{
			labelField = multiAttribute.labelField;
		}
		if(typeof(multiAttribute.groupField)=='undefined'){
			groupArrField = 'subdata';
		}else{
			groupArrField = multiAttribute.groupField;
		}
		var groupArr = selectArr[select][groupArrField];
		if(typeof(groupArr) == 'undefined'){
			if(typeof(multiAttribute.textField)=='undefined'){
				textField = selectArr[select].text;
			}else{
				textField = selectArr[select][multiAttribute.textField];
			}
			if(typeof(multiAttribute.valueField)=='undefined'){
				valueField = selectArr[select].id;
			}else{
				valueField = selectArr[select][multiAttribute.valueField];
			}
			selectHtml += '<option value="'+valueField+'">'+textField+'</option>';
		}else{
			selectHtml += '<optgroup label="'+selectArr[select][labelField]+'">';
			for(var sub = 0; sub < groupArr.length; sub ++){
				if(typeof(multiAttribute.textField)=='undefined'){
					textField = groupArr[sub].text;
				}else{
					textField = groupArr[sub][multiAttribute.textField];
				}
				if(typeof(multiAttribute.valueField)=='undefined'){
					valueField = groupArr[sub].id;
				}else{
					valueField = groupArr[sub][multiAttribute.valueField];
				}
				selectHtml += '<option value="'+valueField+'">'+textField+'</option>';
			}
			selectHtml += '</optgroup>';
		}
	}
	multiSelectHtml = '<select name="'+multiID+'[]" id="'+multiID+'" class="form-control multi" multiple="multiple">'
					+selectHtml
					+'</select>';
	return multiSelectHtml;
}

nsMultiSelect.componentMulti = function(multiselectID){
	var multiAttribute = nsMultiSelect.Json[multiselectID].attribute;
	var keepOrder = false;
	if(multiAttribute.keepOrder == true){
		keepOrder = true;
	}
	var selectableHeader = '';
	var selectionHeader = '';
	var selectableFooter = '';
	var selectionFooter = '';
	if(multiAttribute.headerType == 'text'){
		if(typeof(multiAttribute.selectableHeader)!='undefined'){
			selectableHeader = "<div class='custom-header'>"
							+multiAttribute.selectableHeader
							+"</div>";
		}
		if(typeof(multiAttribute.selectionHeader)!='undefined'){
			selectionHeader = "<div class='custom-header'>"
							+multiAttribute.selectionHeader
							+"</div>";
		}
		if(typeof(multiAttribute.selectableFooter)!='undefined'){
			selectableFooter = "<div class='custom-header'>"
							+multiAttribute.selectableFooter
							+"</div>";
		}
		if(typeof(multiAttribute.selectionFooter)!='undefined'){
			selectionFooter = "<div class='custom-header'>"
							+multiAttribute.selectionFooter
							+"</div>";
		}
	}else if(multiAttribute.headerType == 'search'){
		selectableHeader = "<input type='text' class='search-input form-control' autocomplete='off' placeholder="+language.common.nsmultiselect.search+">";
		selectionHeader = "<input type='text' class='search-input form-control' autocomplete='off' placeholder="+language.common.nsmultiselect.search+">";
	}
	var choseALLGroup = false;
	if(multiAttribute.choseALLGroup == true){
		choseALLGroup = true;
	}
	var selectID = 'multi-'+multiAttribute.multiID;
	$('#'+selectID).multiSelect({
		keepOrder:keepOrder,
		selectableHeader:selectableHeader,
		selectionHeader:selectionHeader,
		selectableFooter:selectableFooter,
		selectionFooter:selectionFooter,
		selectableOptgroup:choseALLGroup,
		cssClass:'selectMulti',
		afterInit: function()
		{
			// Add alternative scrollbar to list
			this.$selectableContainer.add(this.$selectionContainer).find('.ms-list').perfectScrollbar();
			
			var that = this,
			$selectableSearch = that.$selectableUl.prev();
			$selectionSearch = that.$selectionUl.prev();
			selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)';
			selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';
			that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
			.on('keydown', function(e){
				if (e.which === 40){
					that.$selectableUl.focus();
					return false;
				}
			});

			that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
			.on('keydown', function(e){
				if (e.which == 40){
					that.$selectionUl.focus();
					return false;
				}
			});

			var selectedMulitID = this.$element.attr('id');
			nsMultiSelect.Json[selectedMulitID].data = [];
			nsMultiSelect.Json[selectedMulitID].obj = that;
			var _time = null;
			$(this.$selectableUl).off('dblclick');
			$(this.$selectableUl).on('dblclick','.ms-elem-selectable',function(ev){
				clearTimeout(_time);
				var selectedValue = $(this).data('msValue');
				var selectedText = $(ev.target).text().trim();
				//that.select(selectedValue);
				var $selectTableUI = that.$selectableUl;
				var selectionPid = that.$selectionUl.closest('div').attr('class');
				$('.'+selectionPid+' ul li').each(function(){
					if($(this).text().trim() == selectedText){
						$selectTableUI.find('li.selection-selected').removeClass('selection-selected');
						$(this).addClass('selection-selected');
						$(this).siblings().removeClass('selection-selected');
					}
				});
				var elementID = that.$element.attr('id');
				var selectJson = {"id":selectedValue,"text":selectedText,"type":"selection"};
				nsMultiSelect.multiSelectHandler(elementID,selectJson);
			});

			$(this.$selectableUl).off('click');
			$(this.$selectableUl).on('click','.ms-elem-selectable',function(ev){
				clearTimeout(_time);
				$(ev.target).closest('li').toggleClass('selection-selected');
				$(ev.target).closest('li').siblings().removeClass('selection-selected');	
				var selectedValue = $(this).data('msValue');
				var selectedText = $(ev.target).text().trim();
				_time = setTimeout(function(){
					//单击事件在这里
					var elementID = that.$element.attr('id');
					var selectJson = {"id":selectedValue,"text":selectedText,"type":"selected"};
					nsMultiSelect.multiSelectHandler(elementID,selectJson);
				},500);
			});
			var selectionTime = null;
			$(this.$selectionUl).off('click');
			$(this.$selectionUl).on('click','.ms-elem-selection',function(ev){
				clearTimeout(selectionTime);
				$(ev.target).closest('li').toggleClass('selection-selected');
				$(ev.target).closest('li').siblings().removeClass('selection-selected');	
				var selectedValue = $(this).data('msValue');
				var selectedText = $(ev.target).text().trim();
				selectionTime = setTimeout(function(){
					//单击事件在这里
					var elementID = that.$element.attr('id');
					var selectJson = {"id":selectedValue,"text":selectedText,"type":"cancelselected"};
					nsMultiSelect.multiSelectHandler(elementID,selectJson);
				},500);
			});
			$(this.$selectionUl).off('dblclick');
			$(this.$selectionUl).on('dblclick','.ms-elem-selection',function(ev){
				clearTimeout(selectionTime);
				var selectedValue = $(this).data('msValue');
				var selectedText = $(ev.target).text().trim();
				//that.deselect(selectedValue);
				var selectionPid = that.$selectableUl.closest('div').attr('class');
				var $slectionTableUI = that.$selectionUl;
				$('.'+selectionPid+' ul li').each(function(){
					if($(this).text().trim() == selectedText){
						$slectionTableUI.find('li.selection-selected').removeClass('selection-selected');
						$(this).addClass('selection-selected');
						$(this).siblings().removeClass('selection-selected');
					}
				});
				var elementID = that.$element.attr('id');
				var selectJson = {"id":selectedValue,"text":selectedText,"type":"cancelselection"};
				nsMultiSelect.multiSelectHandler(elementID,selectJson);
			});


		},
		afterSelect: function(values)
		{
			// Update scrollbar size
			this.$selectableContainer.add(this.$selectionContainer).find('.ms-list').perfectScrollbar('update');
			this.qs1.cache();
			this.qs2.cache();
			var elementID = this.$element.attr('id');
			var selectJson = {"id":values,"type":'selected'};
			nsMultiSelect.multiSelectedData(elementID,selectJson);
		},
		afterDeselect: function(values){
			this.qs1.cache();
			this.qs2.cache();
			var elementID = this.$element.attr('id');
			var selectJson = {"id":values,"type":'deselected'};
			nsMultiSelect.multiSelectedData(elementID,selectJson);
			
		}
	});
	if(typeof(multiAttribute.default)!='undefined'){
		$('#'+selectID).multiSelect('select',multiAttribute.default);
	}
	if(multiAttribute.isALLSelect == true){
		$('#'+selectID).multiSelect('select_all');
	}
	if(multiAttribute.isNotSelect == true){
		$('#'+selectID).multiSelect('deselect_all');
	}
}

nsMultiSelect.multiSelectHandler = function(elementID,selectJson){
	var selectedFunc;
	var selectionFunc;
	var cancelSelectedFunc;
	var cancelSelectionFunc;
	var multiAttribute = nsMultiSelect.Json[elementID].attribute;
	if(typeof(multiAttribute.selectedHanlder)!='undefined'){
		selectedFunc = multiAttribute.selectedHanlder;
	}
	if(typeof(multiAttribute.selectionHandler)!='undefined'){
		selectionFunc = multiAttribute.selectionHandler;
	}
	if(typeof(multiAttribute.cancelSelectedHandler)!='undefined'){
		cancelSelectedFunc = multiAttribute.cancelSelectedHandler;
	}
	if(typeof(multiAttribute.cancelSelectionHandler)!='undefined'){
		cancelSelectionFunc = multiAttribute.cancelSelectionHandler;
	}
	if(selectJson.type == 'selected'){
		if(typeof(selectedFunc)=='function'){
			selectedFunc(selectJson.id,selectJson.text);
		}
	}else if(selectJson.type == 'selection'){
		if(typeof(selectionFunc)=='function'){
			var receiveJson = selectionFunc(selectJson.id,selectJson.text);
			if(receiveJson.success){
				$('#'+elementID).multiSelect('select',selectJson.id)
			}else{
				nsalert(receiveJson.msg);
			}
		}else{
			$('#'+elementID).multiSelect('select',selectJson.id)
		}
	}else if(selectJson.type == 'cancelselected'){
		if(typeof(cancelSelectedFunc)=='function'){
			cancelSelectedFunc(selectJson.id,selectJson.text);
		}
	}else if(selectJson.type == 'cancelselection'){
		if(typeof(cancelSelectionFunc)=='function'){
			var receiveJson = cancelSelectionFunc(selectJson.id,selectJson.text);
			if(receiveJson.success){
				$('#'+elementID).multiSelect('deselect',selectJson.id)
			}else{
				nsalert(receiveJson.msg);
			}
		}else{
			$('#'+elementID).multiSelect('deselect',selectJson.id)
		}
	}
}
nsMultiSelect.multiSelectSort = function(elementID,type){
	var multiSelectArr = nsMultiSelect.Json[elementID];
	var multiSelectObj = multiSelectArr.obj;
	var multiSelectOrderJson = {};
	var $selectedSort = $(multiSelectObj.$container).find('.selection-selected');
	var selectedText = $selectedSort.text().trim();
	var containerID = $selectedSort.closest('div').attr('class');
	var containerPid = $('.'+containerID).parent().attr('id');
	if(typeof(containerID) == 'undefined'){
		nsalert(language.common.nsmultiselect.selected);
	}else{
		multiSelectOrderJson.selectedText = selectedText;
		var elementObj = $('#'+containerPid+' .'+containerID+' ul li');
		var elementFirstText = $('#'+containerPid+' .'+containerID+' ul li:first').text().trim();
		var elementEndText = $('#'+containerPid+' .'+containerID+' ul li:last').text().trim();
		var currentSelectObj ;
		var currentSelectIndex ;
		$(elementObj).each(function(key,values){
			if($(this).text().trim() == selectedText){
				currentSelectObj = $(values);
				currentSelectIndex = key;
			}
		});
		var thisLocation = elementObj.index(currentSelectObj);
		if(type == 'up'){
			if(thisLocation < 1 ){
				nsalert(language.common.nsmultiselect.systemHintop);
			}else {
				function getPrevObj(cObj){
					var returnPrevObj = cObj.prev();
					if(returnPrevObj.css('display') == 'none'){
						getPrevObj(returnPrevObj);
					}else{
						multiSelectOrderJson.moveText = returnPrevObj.text().trim();
						returnPrevObj.before(currentSelectObj);
					}
				}
				getPrevObj(currentSelectObj);
				nsMultiSelect.multiSelectRefreshData(elementID,multiSelectOrderJson);
			}	
		}else if(type == 'down'){
			if(thisLocation >= elementObj.length - 1){
				nsalert(language.common.nsmultiselect.systemHintop.systemHinBottom);
			}else{
				function getNextObj(cObj){
					var returnNextObj = cObj.next();
					if(returnNextObj.css('display') == 'none'){
						getNextObj(returnNextObj);
					}else{
						multiSelectOrderJson.moveText = returnNextObj.text().trim();
						returnNextObj.after(currentSelectObj);
					}
				}
				getNextObj(currentSelectObj);
				nsMultiSelect.multiSelectRefreshData(elementID,multiSelectOrderJson);
			}
		}else if(type == 'top'){
			if( thisLocation < 1 ){
				nsalert(language.common.nsmultiselect.systemHintop);
			}else {
				multiSelectOrderJson.moveText = elementFirstText;
				currentSelectObj.parent().prepend(currentSelectObj);  //移动到最顶
				nsMultiSelect.multiSelectRefreshData(elementID,multiSelectOrderJson);
			}
		}else if(type == 'bottom'){
			if( thisLocation >= elementObj.length - 1 ){
				nsalert(language.common.nsmultiselect.systemHintop.systemHinBottom);
			}else {
				multiSelectOrderJson.moveText = elementEndText;
				currentSelectObj.parent().append(currentSelectObj);   //移动到最底
				nsMultiSelect.multiSelectRefreshData(elementID,multiSelectOrderJson);
			}
		}
	}
}
nsMultiSelect.multiSelectRefreshData = function(elementID,orderJson){
	var orderData = nsMultiSelect.Json[elementID].orderData;
	var orderAttribute = nsMultiSelect.Json[elementID].attribute;
	var valueField = typeof(orderAttribute.valueField) == 'undefined' ? 'id':orderAttribute.valueField;
	var textField = typeof(orderAttribute.textField) == 'undefined' ? 'text':orderAttribute.textField;
	var labelField = typeof(orderAttribute.labelField) == 'undefined' ? 'label':orderAttribute.labelField;
	var groupField = typeof(orderAttribute.groupField) == 'undefined' ? 'subdata':orderAttribute.groupField;
	var orderField = typeof(orderAttribute.order) == 'undefined' ? 'undefined':orderAttribute.order;		
	var selectedIndex = 0;
	var selectedMoveIndex = 0;
	for(var order in orderData){
		if(orderData[order][textField] == orderJson.selectedText){
			selectedIndex = order;
		}
		if(orderData[order][textField] == orderJson.moveText){
			selectedMoveIndex = order;
		}
	}
	var orderNumber = orderData[selectedIndex][orderField];
	var moveOrderNumber = orderData[selectedMoveIndex][orderField];
	orderData[selectedIndex][orderField] = moveOrderNumber;
	orderData[selectedMoveIndex][orderField] = orderNumber;
}

nsMultiSelect.multiSelectedData = function(elementID,selectedJson){
	var selectedMulitID = elementID;
	var selectData = [];
	var multiAttribute = nsMultiSelect.Json[selectedMulitID].attribute;
	var selectData = nsMultiSelect.Json[selectedMulitID].orderData;
	var selectedArr = selectedJson.id;
	var defaultValue = multiAttribute.default;
	var valueField = typeof(multiAttribute.valueField) !='undefined' ? multiAttribute.valueField:'id';
	var textField = typeof(multiAttribute.textField) !='undefined' ? multiAttribute.textField:'text';
	var labelField = typeof(multiAttribute.labelField) !='undefined' ? multiAttribute.labelField:'label';
	var groupField = typeof(multiAttribute.groupField) !='undefined' ? multiAttribute.groupField:'subdata';
	var dataSrc = typeof(multiAttribute.dataSrc) !='undefined' ? multiAttribute.dataSrc:'';	
	nsMultiSelect.Json[selectedMulitID].dataSrc = dataSrc;
	for(var selected in selectData){
		if(typeof(selectData[selected][groupField])=='undefined'){
			for(var single = 0; single < selectedArr.length; single ++){
				if(selectData[selected][valueField] == selectedArr[single]){
					if(selectedJson.type == 'selected'){
						nsMultiSelect.Json[selectedMulitID].data.push(selectData[selected]);
					}else if(selectedJson.type == 'deselected'){
						nsMultiSelect.Json[selectedMulitID].data.splice(selectData[selected],1);
					}
				}
			}
		}else{
			var groupArr = selectData[selected][groupField];
			var groupLableField = selectData[selected][labelField];
			var groupJson = {};
			for(var group in groupArr){
				for(var double = 0; double < selectedArr.length; double++){
					if(groupArr[group][valueField] == selectedArr[double]){
						if(selectedJson.type == 'selected'){
							groupJson[labelField] = groupLableField;
							groupJson[groupField] = groupArr[group];
							nsMultiSelect.Json[selectedMulitID].data.push(groupJson);
						}else if(selectedJson.type == 'deselected'){
							var deselectArr = nsMultiSelect.Json[selectedMulitID].data;
							for(var deselect in deselectArr){
								var deselectGroupArr = deselectArr[deselect][groupField];
								for(var dSelect in deselectGroupArr){
									if(deselectGroupArr[dSelect] == selectedArr[double]){
										nsMultiSelect.Json[selectedMulitID].data.splice(deselect,1);
									}
								}
							}
						}
					}
				}
			}
		}
	}
}
nsMultiSelect.fillMultiValue = function(fillID,fillJson){
	var selectOptionJson = {};
	var multiAttribute = nsMultiSelect.Json[fillID].attribute;
	var valueField = typeof(multiAttribute.valueField) == 'undefined' ?'id':multiAttribute.valueField;
	var textField = typeof(multiAttribute.textField) == 'undefined' ?'text':multiAttribute.textField;
	var orderID = typeof(multiAttribute.singOrder) == 'undefined' ?'undefined':multiAttribute.singOrder;
	for(var fill in fillJson){
		selectOptionJson.value = fillJson[valueField];
		selectOptionJson.text = fillJson[textField];
	}
	nsMultiSelect.Json[fillID].orderData.push(fillJson);
	$('#'+fillID).multiSelect('addOption',selectOptionJson);
}
nsMultiSelect.componentMultiSelect = function(fillID,type,value){
	switch(type){
		case "refresh":
			$('#'+fillID).multiSelect('refresh');
			break;
		case "select_all":
			$('#'+fillID).multiSelect('select_all');
			break;
		case "deselect_all":
			$('#'+fillID).multiSelect('deselect_all');
			break;
		case "select":
			$('#'+fillID).multiSelect('select',value);
			break;
		case "deselect":
			$('#'+fillID).multiSelect('deselect',value);
			break;
		default:
			break;
	}
}
nsMultiSelect.getSelectJson = function(multiID){
	var dataJson = {};
	var dataSrc = nsMultiSelect.Json[multiID].dataSrc;
	dataJson[dataSrc] = nsMultiSelect.Json[multiID].data;
	return dataJson;
}