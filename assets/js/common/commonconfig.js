commonConfig.converSelectHtml = function(inputConfig){
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
commonConfig.component = function(inputConfig, formID, source, sizeName){
	//过滤掉null值
	if(inputConfig.value == null){
		inputConfig.value = '';
	}
	var size = arguments[3] ? arguments[3] : '';
	var inputHtml = "";
	var placeholderStr = commonConfig.getPlaceHolder(inputConfig);
	var readonlyStr = "";
	if(typeof(inputConfig.readonly)!="undefined"){
		if(inputConfig.readonly == true){
			readonlyStr = 'readonly="readonly"';
		}else if(inputConfig.readonly == false){
			readonlyStr = "";
		}
	}
	var inputIDName = typeof(inputConfig.id)=="undefined"?"":"form-"+formID+"-"+inputConfig.id;
	var valueStr = typeof(inputConfig.value)=="undefined"?"":inputConfig.value;
	if(typeof(inputConfig.value) == 'function'){
		valueStr = inputConfig.value();
	}else if(typeof(inputConfig.value) == 'number'){
		valueStr = valueStr.toString();
	}
	var labelHtml = "";
	var labelClassStr = "";
	var labelTextStr = "";
	var labelHeight = "";
	var labelWeight = "";
	if(typeof(inputConfig.height) == 'string'){
		if(inputConfig.height.indexOf('px')>-1){
			labelHeight = 'height: '+inputConfig.height+';';
		}else if(inputConfig.height.indexOf('%')>-1){
			labelHeight = 'height: '+inputConfig.height+';';
		}else{
			labelHeight = 'height: '+inputConfig.height+'px;';
		}
	}else if(typeof(inputConfig.height) == 'number'){
		labelHeight = 'height: '+inputConfig.height+'px;';
	}
	if(typeof(inputConfig.width) == 'string'){
		if(inputConfig.width.indexOf('px')>-1){
			labelWeight = 'width: '+inputConfig.width+';';
		}else if(inputConfig.width.indexOf('%')>-1){
			labelWeight = 'width: '+inputConfig.width+';';
		}else{
			labelWeight = 'width: '+inputConfig.width+'px;';
		}
	}else if(typeof(inputConfig.width) == 'number'){
		labelWeight = 'width: '+inputConfig.width+'px;';
	}
	var labelStyleStr = 'style="'+labelHeight+''+labelWeight+'"';
	if(typeof(inputConfig.label) == 'undefined' || inputConfig.label == ''){
		labelClassStr = "hide";
		labelTextStr = '';
	}else{
		labelClassStr = "";
		labelTextStr = inputConfig.label;
	}
	var formGroupHeight = '';
	if(inputConfig.height){
		formGroupHeight = 'style="height:'+inputConfig.height+'px;"';
	}
	//modal组件 ----------------------------------------------------------

	if(source=="modal"){
		var sizeArr = ["col-sm-4","col-sm-8"]
		switch(size){
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
		var modalSizeType = '';
		if(typeof(inputConfig.hidden)=='boolean'){
			if(inputConfig.hidden==true){
				modalSizeType  = ' hidden';
			}
		}else if(typeof(inputConfig.hidden)=='function'){
			var isHidden = inputConfig.hidden();
			if(isHidden==true){
				modalSizeType  = ' hidden';
			}
		}


		labelHtml = '<label class="control-label '+sizeArr[0]+' '+labelClassStr+' '+inputConfig.type+'-label" '+labelStyleStr+' for="'+inputIDName+'">'
						+labelTextStr
					+'</label>';
		if(inputConfig.type=="text"||inputConfig.type=="password"||inputConfig.type=="number"){
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+'<input id="'+inputIDName+'" name="'+inputIDName+'" type="'+inputConfig.type+'" ns-type="'+inputConfig.type+'" placeholder="'+placeholderStr+'" class="form-control" value="'+valueStr+'" '+readonlyStr+'>'
							+'</div>'
					+'</div>';
		}else if(inputConfig.type == "select-province"){
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+'<input id="'+inputIDName+'" name="'+inputIDName+'" type="'+inputConfig.type+'" ns-type="'+inputConfig.type+'" placeholder="'+placeholderStr+'" class="form-control" value="'+valueStr+'" '+readonlyStr+'>'
							+'</div>'
					+'</div>';
		}else if(inputConfig.type=="hidden"){
			inputHtml = '<input id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" type="hidden" ns-type="hidden" value="'+valueStr+'" class="hidden">';
		}else if(inputConfig.type == 'text-btn'){
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+'<input id="'+inputIDName+'" name="'+inputIDName+'" type="text" placeholder="'+placeholderStr+'" class="form-control" ns-type="'+inputConfig.type+'" value="'+valueStr+'" '+readonlyStr+'>';
			var btnArr = inputConfig.btns;
			if($.isArray(btnArr)){
				if(btnArr.length > 0 ){
					inputHtml += '<div class="input-group-btn text-btn">';
					for(var btn = 0 ; btn < btnArr.length; btn ++){
						var disabled = btnArr[btn].isDisabled ? " disabled ":"";
						var btnJson = {};
						btnJson.text = btnArr[btn].text;
						btnJson.handler = btnArr[btn].handler;
						inputHtml+= commonConfig.getBtn(btnJson,'form',btn,true,false);					
					}						
					inputHtml += '</div>';
				}
			}				
			inputHtml += '</div></div>';				
		}else if(inputConfig.type=="date"){
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+'<div class="input-group">'
									+'<input id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" type="text" class="form-control datepicker" value="'+valueStr+'" readonly placeholder="'+placeholderStr+'" data-format="'+inputConfig.format+'">'
									+'<div class="input-group-addon">'
										+'<a href="javascript:void(0);"><i class="linecons-calendar"></i></a>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'datetime'){
			var dateID = inputIDName + '-date';
			var timeID = inputIDName + '-time';
			var datetimerDefaultValue = commonConfig.formatDate('','YYYY-MM-DD HH:MM:DD');
			var datetimerValue = valueStr;
			var dateValue = '';
			var timeValue = '';
			if(typeof(datetimerValue)=='string'){
				dateValue = datetimerValue.split(' ')[0];
				timeValue = datetimerValue.split(' ')[1];
			}
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+' datetimepicker">'
								+'<input id="'+dateID+'" name="'+dateID+'" nstype="'+inputConfig.type+'" type="text" class="form-control datepicker" value="'+dateValue+'" '+readonlyStr+' />'
								+'<input id="'+timeID+'" name="'+timeID+'" nstype="'+inputConfig.type+'" type="text" class="form-control timepicker" value="'+timeValue+'" '+readonlyStr+' />' 
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="textarea"){
			var height = inputConfig.height;
			var labelHeight = '';
			if(height){
				if(typeof(height) == 'string'){
					var isAppend = false;
					if(height.indexOf('px')>-1){
						height = 'style="height: '+inputConfig.height+';"';
						isAppend = false;
					}else{
						height = 'style="height: '+inputConfig.height+'px;"';
						isAppend = true;
					}
					if(Number(height)>100){
						var tempHeight = inputConfig.height-20;
						if(isAppend){
							labelHeight = 'style="height: '+tempHeight+'px;"';
						}else{
							labelHeight = 'style="height: '+tempHeight+';"';
						}
					}else{
						if(isAppend){
							labelHeight = 'style="height: '+inputConfig.height+'px;"';
						}else{
							labelHeight = 'style="height: '+inputConfig.height+';"';
						}
					}
				}else{
					height = 'style="height: '+inputConfig.height+'px;"';
					var tempHeight = inputConfig.height-20;
					if(height > 100){
						labelHeight = 'style="height: '+tempHeight+'px;"';
					}else{
						labelHeight = 'style="height: '+inputConfig.height+'px;"';
					}
				}
			}else{
				height = '';
				labelHeight = '';
			}
			if(typeof(inputConfig.isFullWidth)!="undefined"){
				if(inputConfig.isFullWidth==true){
					sizeArr = ["hide","col-sm-12"];
				}
			}
			var textareaSize = '';
			if(typeof(inputConfig.column) == 'undefined'){
				textareaSize = 'col-sm-12';
			}else{
				textareaSize = modalSizeType;
			}
			inputHtml = '<div class="form-group '+textareaSize+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+'<textarea id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" placeholder="'+placeholderStr+'" class="form-control" '+readonlyStr+height+'>'+valueStr+'</textarea>'
							+'</div>'
						+'</div>';

		}else if(inputConfig.type=="upload"){
			inputHtml = '<div class="row '+modalSizeType+'">'
							+'<div class="col-sm-3 text-center">'
								+'<div id="advancedDropzone" class="droppable-area">'
									+language.common.commonconfig.label.fileArea
								+'</div>'
							+'</div>'
							+'<div class="col-sm-9">'
								+'<div class="table-responsive">'
									+'<table class="table table-bordered table-striped table-hover dataTable no-footer table-modal table-singlerow"  nstype="'+inputConfig.type+'" id="'+inputConfig.id+'">'
									+'</table>'
								+'</div>'
							+'</div>'
						+'</div>'

		}else if(inputConfig.type=='upload_single'){
			var dropzoneDefalutArr = inputConfig.subdata;
			var dropzoneDefalutHtml = '';
			var dropStr = '';
			if(typeof(dropzoneDefalutArr) != 'undefined'){
				var dropTextfield = inputConfig.textField;
				var dropValuefield = inputConfig.valueField;
				for(var dropIndex = 0; dropIndex < dropzoneDefalutArr.length; dropIndex ++){
					var dropDefaultId = dropzoneDefalutArr[dropIndex][dropValuefield];
					var dropDefaultvalue = dropzoneDefalutArr[dropIndex][dropTextfield];
					dropStr += dropDefaultId + ',';
					dropzoneDefalutHtml += '<span class="dropzone-upload-span">'
										+'<a href="javascript:void(0)" id="'+dropDefaultId+'" class="upload-close"></a>'
										+'<a href="javascript:void(0)" id="'+dropDefaultId+'" class="upload-title">'
										+dropDefaultvalue
										+'</a>'
										+'</span>';
				}
				dropStr = dropStr.substring(0,dropStr.lastIndexOf(','));
			}
			var isReadonly = typeof(inputConfig.readonly) == 'boolean' ? inputConfig.readonly : false;
			//var readonlyStr = isReadonly ? 'readonly=true' : 'readonly=false';
			var readonlyStr = '';
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="form-item upload '+sizeArr[1]+'">'
								+'<div class="input-group" '+readonlyStr+'>'
									+'<div id="'+inputIDName+'" class="droppable-area-dialog dz-clickable form-control">'
									+dropzoneDefalutHtml
									+'</div>'
									+'<div class="input-group-addon">'
										+'<a href="javascript:void(0);"><i class="fa fa-upload"></i></a>'
									+'</div>'
									+'<input type="hidden" value="'+dropStr+'" ns-type="upload" />'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="table"){
			inputHtml = '<div class="row"><div class="col-xs-12">'
							+'<div class="table-responsive">'
								+'<table class="table table-bordered table-striped table-hover dataTable no-footer table-modal table-singlerow" nstype="'+inputConfig.type+'" id="'+inputConfig.id+'">'
								+'</table>'
							+'</div>'
							+'</div></div>'
		}else if(inputConfig.type=="radio"){
			radioHtml = '';
			if(typeof(inputConfig.subdata)!="undefined"){
				for(var radioI = 0; radioI<inputConfig.subdata.length; radioI++){
					var radioCls = 'cbr cbr-primary';
					if(inputConfig.subdata[radioI].isChecked){
						var radioCls = 'cbr cbr-primary';
					}
					var radioTextStr = '';
					var radioValueStr = '';
					if(typeof(inputConfig.textField)=='undefined'){
						radioTextStr = inputConfig.subdata[radioI].text;
					}else{
						radioTextStr = inputConfig.subdata[radioI][inputConfig.textField];
					}
					if(typeof(inputConfig.valueField)=='undefined'){
						radioValueStr = inputConfig.subdata[radioI].value;
					}else{
						radioValueStr = inputConfig.subdata[radioI][inputConfig.valueField];
					}
					var checkedStr = '';
					if(valueStr){
						checkedStr = radioValueStr == valueStr ?"checked":"";
					}else{
						checkedStr = inputConfig.subdata[radioI].isChecked?" checked ":"";
					}

					var disabledStr = "";
					var disabledBool = inputConfig.subdata[radioI].isDisabled?inputConfig.subdata[radioI].isDisabled:false;
					if(disabledBool){
						disabledStr = "disabled";
					}else{
						disabledStr = "";
					}

					var radioMsgStr = '';
					if(inputConfig.subdata[radioI].msg){
						radioMsgStr = 'data-toggle="tooltip" title="'+inputConfig.subdata[radioI].msg+'"';
					}
					radioHtml += '<label class="radio-inline" '+radioMsgStr+'>'
									+'<input id="'+inputIDName+'-'+radioI+'"  nstype="'+inputConfig.type+'" type="radio" '+checkedStr+' '+disabledStr+' class="'+radioCls+'" name="'+inputIDName+'" value="'+radioValueStr+'" >'
									+radioTextStr
								+'</label>'
				}
			}
			//添加清空
			var radioClose = inputConfig.isHasClose ? inputConfig.isHasClose : false;
			var radioCloseLength = inputConfig.subdata.length;
			if(radioClose){
				radioHtml += '<label class="radio-inline control-label radio-clear">'
									+'<input id="'+inputIDName+'-'+radioCloseLength+'"  nstype="'+inputConfig.type+'-clear" type="radio" class="cbr cbr-primary hide" name="'+inputIDName+'" value="" />'
									+'清空'
								+'</label>'
			}
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+ radioHtml
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="checkbox"){
			checkboxHtml = '';
			if(typeof(inputConfig.subdata)!="undefined"){
				for(var checkboxI = 0; checkboxI<inputConfig.subdata.length; checkboxI++){
					var checkboxCls = 'cbr cbr-primary';
					if(inputConfig.subdata[checkboxI].isChecked){
						checkboxCls = 'cbr cbr-primary';
					}
					var checkboxTextStr = '';
					var checkboxValueStr = '';
					if(typeof(inputConfig.textField)=='undefined'){
						checkboxTextStr = inputConfig.subdata[checkboxI].text;
					}else{
						checkboxTextStr = inputConfig.subdata[checkboxI][inputConfig.textField];
					}
					if(typeof(inputConfig.valueField)=='undefined'){
						checkboxValueStr = inputConfig.subdata[checkboxI].value;
					}else{
						checkboxValueStr = inputConfig.subdata[checkboxI][inputConfig.valueField];
					}

					var checkedStr = '';
					if(typeof(inputConfig.value) == 'function'){
						var defaultCheckStr = inputConfig.value();
						checkedStr = checkboxValueStr == defaultCheckStr ?"checked":"";
					}else if(typeof(inputConfig.value) == 'string' || typeof(inputConfig.value) == 'number'){
						if(inputConfig.value){
							checkedStr = inputConfig.value == checkboxValueStr ?"checked":"";
						}else{
							checkedStr = inputConfig.subdata[checkboxI].isChecked?" checked ":"";
						}
					}else if(typeof(inputConfig.value) == 'object'){
						for(var check in inputConfig.value){
							if(checkboxValueStr == inputConfig.value[check]){
								checkedStr = "checked";
							}
						}
					}
					
					
					var disabledStr = "";
					var disabledBool = inputConfig.subdata[checkboxI].isDisabled?inputConfig.subdata[checkboxI].isDisabled:false;
					if(disabledBool){
						disabledStr = "disabled";
					}else{
						disabledStr = "";
					}

					checkboxHtml += '<label class="radio-inline">'
									+'<input id="'+inputIDName+'-'+checkboxI+'"  nstype="'+inputConfig.type+'" type="checkbox" '+checkedStr+' '+disabledStr+' class="'+checkboxCls+'" name="'+inputIDName+'" value="'+inputConfig.subdata[checkboxI].value+'" >'
									+inputConfig.subdata[checkboxI].text
								+'</label>'
				}
			}
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+ checkboxHtml
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="select"){
			selectHtml = '<option value="">'+placeholderStr+'</option>';
			var selectData;
			var selectAjaxData = {};
			if(inputConfig.data){
				selectAjaxData = inputConfig.data;
			}
			if(inputConfig.url =='' || inputConfig.url == null){
				selectData = inputConfig.subdata;
			}else{
				var ajaxUrl;
				if(typeof(inputConfig.url)=='function'){
					ajaxUrl = inputConfig.url();
				}else{
					ajaxUrl = inputConfig.url;
				}
				$.ajax({
					url:ajaxUrl, //请求的数据链接
					type:inputConfig.method,
					data:selectAjaxData,
					dataType:'json',
					async:false,
					success:function(rec){
						if(typeof(inputConfig.dataSrc)=='undefined'){
							selectData = rec;
						}else{
							for(data in rec){
								selectData = rec[inputConfig.dataSrc];
							}
						}
					},
					error: function () {
						nsalert(language.common.commonconfig.nsalert.checkDataFormat,'warning');
					}
				});
			}
			if(selectData){
				if(selectData.length > 0){
					for(var selectI = 0; selectI<selectData.length; selectI++){
						//var checkedStr = inputConfig.subdata[selectI].isChecked?" selected ":"";
						var textStr = '';
						var valueStrI = '';
						if(typeof(inputConfig.textField)=='undefined'){
							textStr = selectData[selectI].text;
						}else{
							textStr = selectData[selectI][inputConfig.textField];
						}
						if(typeof(inputConfig.valueField)=='undefined'){
							valueStrI = selectData[selectI].value;
						}else{
							valueStrI = selectData[selectI][inputConfig.valueField];
						}
						var checkedStr = '';
						if(valueStr){
							checkedStr = valueStr == valueStrI ?"selected":"";
						}else{
							checkedStr = selectData[selectI].selected?"selected":"";
						}
						var disabledStr = selectData[selectI].isDisabled?" disabled ":"";
						selectHtml += '<option value="'+valueStrI+'" '+checkedStr+' '+disabledStr+'>'
										+textStr
									+'</option>'
					}
				}else{
					if(valueStr){
						selectHtml += '<option value="'+valueStr+'" selected>'+valueStr+'</option>'; 
					}
				}
			}
			var isSelectDiabled = inputConfig.disabled ? 'disabled' : '';
			selectHtml = '<select class="form-control" id="'+inputIDName+'" '+isSelectDiabled+'  nstype="'+inputConfig.type+'">'
							+selectHtml
						+'</select>'
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+' form-item select">'
								+selectHtml
							+'</div>'
					+'</div>';
		}else if(inputConfig.type=="select2"){
			selectHtml = '<option value="">'+placeholderStr+'</option>';
			var select2GroupArr = inputConfig.subdata;//默认读取的是subdata值
			//是否是ajax方式读值
			if(typeof(inputConfig.url)=='string'){
				var isMethod = typeof(inputConfig.method) == 'string' ? inputConfig.method : 'GET';
				var params = typeof(inputConfig.params) == 'object' ? inputConfig.params : {};
				if(isMethod == ''){isMethod = 'GET'}
				$.ajax({
					url:inputConfig.url,
					dataType: "json", // 数据类型 
					type:isMethod,
					async:false,
					data:params,
					success:function(result){
						//是否定义了数据源参数
						if(typeof(inputConfig.dataSrc)=='undefined'){
							select2GroupArr = result;
						}else{
							select2GroupArr = result[inputConfig.dataSrc];
						}
					}
				})
			}
			if($.isArray(select2GroupArr)){
				//拿到的是数组格式
				var textField = typeof(inputConfig.textField)=='string' ? inputConfig.textField : 'text';
				var valueField = typeof(inputConfig.valueField)=='string' ? inputConfig.valueField : 'value';
				var childrenField = typeof(inputConfig.optchildren) == 'string' ? inputConfig.optchildren : 'children';
				for(var group in select2GroupArr){
					var textStr = select2GroupArr[group][textField];//文本值
					var optionStr = select2GroupArr[group][valueField];//id值
					//判断是否有分组的下拉框
					if($.isArray(select2GroupArr[group][childrenField])){
						//如果存在分组
						var childrenArr = select2GroupArr[group][childrenField];
						var groupTitle = typeof(inputConfig.optlabel) == 'string' ? inputConfig.optlabel : textField;
						selectHtml +='<optgroup label="'+select2GroupArr[group][groupTitle]+'">';
						for(var childI=0; childI < childrenArr.length; childI++){
							var childTextStr = childrenArr[childI][textField];
							var childValueStr = childrenArr[childI][valueField];
							var isDisabled = typeof(childrenArr[childI].isDisabled) == 'boolean' ? childrenArr[childI].isDisabled : false;
							var disabledStr = '';
							if(isDisabled){
								disabledStr = 'disabled';
							}
							var selectedStr = '';
							if(childrenArr[childI].selected == true){
								selectedStr = 'selected';
							}else{
								if(valueStr != ''){
									if(childValueStr == valueStr){
										selectedStr = 'selected';
									}
								}
							}
							selectHtml += '<option value="'+childValueStr+'" '+selectedStr+' '+disabledStr+'>'+childTextStr+'</option>';
						}
						selectHtml += '</optgroup>';
					}else{
						var selectedStr = '';
						if(select2GroupArr[group].selected == true){
							selectedStr = 'selected';
						}else{
							if(valueStr != ''){
								if(optionStr == valueStr){
									selectedStr = 'selected';
								}
							}
						}
						var isDisabled = typeof(select2GroupArr[group].isDisabled) == 'boolean' ? select2GroupArr[group].isDisabled : false;
						var disabledStr = '';
						if(isDisabled){
							disabledStr = 'disabled';
						}
						selectHtml += '<option value="'+optionStr+'" '+disabledStr+' '+selectedStr+'>'
										+textStr
									+'</option>';
					}
				}
			}
			var multiple = inputConfig.multiple ? 'multiple':'';
			var isDisabled = typeof(inputConfig.readonly) == 'boolean' ? inputConfig.readonly : false;
			if(typeof(inputConfig.disabled)=='boolean'){
				isDisabled = inputConfig.disabled;
			}
			var disabledStr = '';
			if(isDisabled){
				disabledStr = 'disabled';
			}
			selectHtml = '<select class="form-control" '+disabledStr+' id="'+inputIDName+'" '+multiple+'  nstype="'+inputConfig.type+'">'
							+selectHtml
						+'</select>'
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="form-item select2 '+sizeArr[1]+'">'
								+ selectHtml
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="typeahead"){
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="form-item '+sizeArr[1]+'">'
								+'<div class="typeahead__container">'
									+'<div class="typeahead__field">'
										+'<span class="typeahead__query">'
											+'<input id="'+inputIDName+'" class="form-control" nstype="'+inputConfig.type+'" type="search" placeholder="Search" autofocus autocomplete="off" />'
										+'</span>'
										+'<span class="typeahead__button">'
											+'<button type="button">'
												+'<span class="typeahead__search-icon"></span>'
											+'</button>'
										+'</span>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="addSelectInput"){
			if(typeof(inputConfig.hiddenID)=="undefined"){
				inputConfig.hiddenID = inputConfig.id+'-hidden'+Math.round()*100000;
			}
			inputConfig.fullHiddenID = "form-"+formID+"-"+inputConfig.hiddenID;
			inputHtml = 
				'<div class="form-group '+modalSizeType+'">'
						+labelHtml
						+'<div class="'+sizeArr[1]+'">'
							+'<input id="'+inputIDName+'" name="'+inputIDName+'" type="text" placeholder="'+placeholderStr+'" class="form-control" value="'+valueStr+'" '+readonlyStr+'>'
							+'<input id="'+inputHiddenIDName+'" name="'+inputHiddenIDName+'" type="'+inputConfig.type+'-hidden" value="" >'
						+'</div>'
				+'</div>';
		}else if(inputConfig.type == 'tree-select'){
			var treeCloseBtnID = inputIDName +'-tree-menuBtn';
			var treeValueStr = typeof(inputConfig.text) == 'undefined' ?'':inputConfig.text;
			var treeNodeId = '';
			if(typeof(inputConfig.value) == 'function'){
				treeNodeId = inputConfig.value();
			}else{
				treeNodeId = inputConfig.value ? inputConfig.value :'';
			}
			var treeID = inputIDName +'-tree';
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'
								+'<input id="'+inputIDName+'" name="'+inputIDName+'" nodeid="'+treeNodeId+'" treeType="'+inputConfig.treeId+'" nstype="'+inputConfig.type+'" value="'+treeValueStr+'" class="form-control" type="text" readonly>'
								+'<a id="'+treeCloseBtnID+'" href="javascript:void(0)" class="treeselect-arrow"><i class="fa fa-caret-down"></i></a>'
								+'<ul id="'+treeID+'" class="ztree hide"></ul>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'input-select'){
			var html = '<input class="form-control" id="'+inputIDName+'" ns-id="'+inputConfig.id+'" name="'+inputIDName+'" nstype="'+inputConfig.type+'" value="'+valueStr+'" type="text" />'
					+'<a id="'+inputIDName+'-selectBtn" href="javascript:void(0)" class="input-select-btn" nstype="'+inputConfig.type+'" ns-control="'+inputConfig.type+'-btn">'
							+'<i class="fa fa-caret-down"></i></a>';
			inputHtml = '<div class="form-group '+modalSizeType+'">'
							+labelHtml
							+'<div class="'+sizeArr[1]+'">'+inputHtml+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'province-select'){
			var provinceData = provinceInfo;
			var provSelectedStr = '';//省
			var citySelectedStr = '';//市
			var areaSelectedStr = '';//区
			if(typeof(valueStr) == 'object'){
				provSelectedStr = valueStr.province ? valueStr.province : '';
				citySelectedStr = valueStr.city ? valueStr.city : '';
				areaSelectedStr = valueStr.area ? valueStr.area : '';
			}
			var cityData = [];
			var areaData = [];
			var isShowCityDom = 'hide';
			var isShowAreaDom = 'hide';
			var selectProHtml = '';//省份html
			var selectCityHtml = '';//市 html
			var selectAreaHtml = '';//区 html
			for(var proI = 0; proI < provinceData.length; proI ++){
				var currentProvname = provinceData[proI].name;
				var currentProval = currentProvname;  //value值等同于text文本值的显示
				if(currentProval == '省份'){
					currentProval = '';
				}
				var isSelected = '';
				//存在默认省份的设置
				if(provSelectedStr != ''){
					if(currentProvname == provSelectedStr){
						cityData = provinceData[proI].sub;
						isSelected = 'selected';
					}
				}
				selectProHtml += '<option value="'+currentProval+'" '+isSelected+'>'+currentProvname+'</option>';
			}
			if(provSelectedStr == ''){
				citySelectedStr = provinceData[0].name;
				cityData = provinceData[0].sub;
				areaSelectedStr = cityData[0].name;
			}
			if(citySelectedStr != ''){
				isShowCityDom = '';
				for(var cityI = 0; cityI < cityData.length; cityI ++){
					var currentCityname = cityData[cityI].name;
					var isCitySelected = '';
					if(currentCityname == citySelectedStr){
						areaData = cityData[cityI].sub;
						isCitySelected = 'selected';
					}
					selectCityHtml += '<option value="'+currentCityname+'" '+isCitySelected+'>'+currentCityname+'</option>';
				}
			}
			if(areaSelectedStr != ''){
				isShowAreaDom = '';
				for(var areaI = 0; areaI < areaData.length; areaI ++){
					var currentAreaname = areaData[areaI].name;
					var isAreaSelected = '';
					if(currentAreaname == areaSelectedStr){
						isAreaSelected = 'selected';
					}
					selectAreaHtml += '<option value="'+currentAreaname+'" '+isAreaSelected+'>'+currentAreaname+'</option>';
				}
			}
			selectProHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="province" id="'+inputIDName+'-province">'
							+selectProHtml
						+'</select>';
			selectCityHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="city" id="'+inputIDName+'-city">'
							+selectCityHtml
						+'</select>';
			selectAreaHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="area" id="'+inputIDName+'-area">'
							+selectAreaHtml
						+'</select>';
			selectProHtml = '<div class="form-group" '+modalSizeType+'>'
								+'<label class="control-label  province-select-label '+sizeArr[1]+'" for="'+inputIDName+'-province">'
									+language.common.commonconfig.label.province+'</label>'
								+'<div class="form-item select">'
									+ selectProHtml
								+'</div>'
							+'</div>';
			selectCityHtml = '<div class="form-td col-sm-4 col-xs-12">'
								+'<div class="form-group" '+modalSizeType+'>'
									+'<label class="control-label  province-select-label '+sizeArr[1]+'" for="'+inputIDName+'-city">'
									+language.common.commonconfig.label.city+'</label>'
									+'<div class="form-item select">'
										+ selectCityHtml
									+'</div>'
								+'</div>'
							+'</div>';
			selectAreaHtml = '<div class="form-td col-sm-4 col-xs-12">'
							+'<div class="form-group" '+modalSizeType+'>'
								+'<label class="control-label  province-select-label '+sizeArr[1]+'" for="'+inputIDName+'-country">'
									+language.common.commonconfig.label.area+'</label>'
								+'<div class="form-item select">'
									+ selectAreaHtml
								+'</div>'
							+'</div>'
						+'</div>';
			inputHtml = selectProHtml + selectCityHtml + selectAreaHtml;
		}

	//Form组件 ----------------------------------------------------------
	}else if(source=="form"){
		//组件尺寸
		var inputSize = "";
		if(typeof(inputConfig.column)=="undefined"){
			inputSize = " col-lg-3 col-md-4 col-sm-6 col-xs-12";
		}else{
			var columnNum = parseInt(inputConfig.column);
			if(columnNum<0||columnNum>12){
				columnNum = 12;
			}
			switch(columnNum){
				case 1:
					inputSize = " col-lg-1 col-md-1 col-sm-1 col-xs-1";
					break;
				case 2:
					inputSize = " col-lg-2 col-md-2 col-sm-6 col-xs-12";
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
				case 12:
					inputSize = " col-xs-12";
					break;
				case 0:
					inputSize = " col-none";
					break;
			}
		}
		if(inputConfig.hidden){
			inputSize  += ' hidden';
		}

		labelHtml = '<label class="control-label '+labelClassStr+' '+inputConfig.type+'-label" '+labelStyleStr+' for="'+inputIDName+'">'
						+labelTextStr
					+'</label>';
		if(inputConfig.type=="text"||inputConfig.type=="password"||inputConfig.type=="number"){
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item">'
									+'<input id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" type="'+inputConfig.type+'" placeholder="'+placeholderStr+'" class="form-control" value="'+valueStr+'" '+readonlyStr+'>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="select-province"){
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<input id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" type="'+inputConfig.type+'" placeholder="'+placeholderStr+'" class="form-control" value="'+valueStr+'" '+readonlyStr+'>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type =='textSelect'){
			//文本下拉框组件
			var selectOptionHtml = commonConfig.converSelectHtml(inputConfig.select);
			var selectID = 'form-'+formID+'-'+inputConfig.select.id;
			var isSelectDiabled = inputConfig.select.disabled ? 'disabled' : '';
			var selectPlaceHolder = commonConfig.getPlaceHolder(inputConfig.select);
			var selectDefaultOptionHtml = '<option value="">'+selectPlaceHolder+'</option>';
			var selectHtml = '<select id="'+selectID+'" name="'+selectID+'" class="form-control" nstype="'+inputConfig.type+'-select" '+isSelectDiabled+'>'
							+selectDefaultOptionHtml
							+selectOptionHtml
						+'</select>';
			var inputID = 'form-'+formID+'-'+inputConfig.text.id;
			var inputPlaceHolder = commonConfig.getPlaceHolder(inputConfig.text);
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
					operationHtml += commonConfig.getBtn(btnJson,'form',buttonI,true,false);	
				}
				operationHtml = '<div class="btn-group" nstype="'+inputConfig.type+'_button">'
								+operationHtml
								+'</div>';
			}
			var hiddenTextHtml = '<input type="hidden" id="'+inputIDName+'" name="'+inputIDName+'" value="'+valueStr+'" />';
		
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item selectplane '+inputConfig.type+'" ns-id="'+inputConfig.id+'">'
									+hiddenTextHtml
									+inputHtml
									+selectHtml
									+operationHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'selectText'){
			//下拉框文本组件
			var selectOptionHtml = commonConfig.converSelectHtml(inputConfig.select);
			var selectID = 'form-'+formID+'-'+inputConfig.select.id;
			var isSelectDiabled = inputConfig.select.disabled ? 'disabled' : '';
			var selectPlaceHolder = commonConfig.getPlaceHolder(inputConfig.select);
			var selectDefaultOptionHtml = '<option value="">'+selectPlaceHolder+'</option>';
			var selectHtml = '<select id="'+selectID+'" name="'+selectID+'" class="form-control" nstype="'+inputConfig.type+'-select" '+isSelectDiabled+'>'
							+selectDefaultOptionHtml
							+selectOptionHtml
						+'</select>';
			var inputID = 'form-'+formID+'-'+inputConfig.text.id;
			var inputPlaceHolder = commonConfig.getPlaceHolder(inputConfig.text);
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
				operationHtml = '<div class="btn-group" commonplane="moreSelectPlane" nstype="'+inputConfig.type+'_button">'
								+operationHtml
								+'</div>';
			}
			var hiddenTextHtml = '<input type="hidden" id="'+inputIDName+'" name="'+inputIDName+'" value="'+valueStr+'" />';
		
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item selectplane '+inputConfig.type+'" ns-id="'+inputConfig.id+'">'
									+hiddenTextHtml
									+selectHtml
									+inputHtml
									+operationHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'selectDate'){
			//下拉框日期组件
			var caseOptionHtml = commonConfig.converSelectHtml(inputConfig.caseSelect);
			var caseSelectID ='form-'+formID+'-'+inputConfig.caseSelect.id;
			var caseSelectHtml = '<select id="'+caseSelectID+'" name="'+caseSelectID+'" class="form-control" nstype="'+inputConfig.type+'-caseSelect">'
								+caseOptionHtml
							+'</select>';    
			var textInputID = 'form-'+formID+'-'+inputConfig.text.id;
			var textValue = inputConfig.text.value ? inputConfig.text.value :'';
			var readonlyStr = inputConfig.text.readonly ? 'readonly="readonly"' :'';
			var textPlaceholder = commonConfig.getPlaceHolder(inputConfig.text);
			var textHidden = inputConfig.text.hidden ? 'hide':'';
			var textHtml = '<input type="text" id="'+textInputID+'" name="'+textInputID+'" class="form-control '+textHidden+'" value="'+textValue+'" placeholder="'+textPlaceholder+'" '+readonlyStr+' nstype="'+inputConfig.type+'-text" />';
			var dateID = 'form-'+formID+'-'+inputConfig.date.id;
			var dateValue = inputConfig.date.value ? inputConfig.date.value :'';
			var dateReadonly = inputConfig.date.readonly ? 'readonly="readonly"':'';
			var dateHidden = inputConfig.date.hidden ? 'hide':'';
			var dateHtml = '<input type="text" id="'+dateID+'" name="'+dateID+'" class="form-control datepicker '+dateHidden+'" readonly value="'+dateValue+'" '+dateReadonly+' nstype="'+inputConfig.type+'-date"  />'
			
			var dateRangeID = 'form-'+formID+'-'+inputConfig.daterange.id;
			var daterangeStart = inputConfig.daterange.startDate ? inputConfig.daterange.startDate :'';
			var daterangeEnd = inputConfig.daterange.endDate ? inputConfig.daterange.endDate :'';
			var daterangevalue = '';
			if(daterangeStart){
				daterangevalue = daterangeStart + '至' +daterangeEnd;
			}
			var daterangeHidden = inputConfig.daterange.hidden ? 'hide':'';
			//var daterangeHtml = '<input type="text" id="'+dateRangeID+'" name="'+dateRangeID+'" class="form-control daterangepicker '+daterangeHidden+'" readonly value="'+daterangevalue+'" nstype="'+inputConfig.type+'-daterange" />'; 
			var daterangeHtml = '<div class="daterange daterange-inline add-ranges '+daterangeHidden+'" id="'+dateRangeID+'" nstype="'+inputConfig.type+'-daterange">'
								+'<i class="fa-calendar"></i>'
								+'<span>'+daterangevalue+'</span>'
							+'</div>';
			var hiddenTextHtml = '<input type="hidden" id="'+inputIDName+'" name="'+inputIDName+'" value="'+valueStr+'" />';
			var operationHtml = '';
			if(inputConfig.button){
				var buttonArr = inputConfig.button;
				for(var buttonI = 0; buttonI < buttonArr.length; buttonI ++){
					var btnJson = {};
					btnJson.text = buttonArr[buttonI].text;
					btnJson.handler = buttonArr[buttonI].handler;
					operationHtml += nsButton.getHtml(btnJson,'form',buttonI,true,false);	
				}
				operationHtml = '<div class="btn-group" commonplane="moreSelectPlane" nstype="'+inputConfig.type+'_button">'
								+operationHtml
								+'</div>';
			}

			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item selectplane '+inputConfig.type+'" ns-id="'+inputConfig.id+'">'
									+hiddenTextHtml
									+caseSelectHtml
									+textHtml
									+dateHtml
									+daterangeHtml
									+operationHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'selectSelect'){
			//隐藏text
			var hiddenTextHtml = '<input type="hidden" id="'+inputIDName+'" name="'+inputIDName+'" value="'+valueStr+'" />';
			//下拉框下拉框组件
			var firstSelectOptionHtml = commonConfig.converSelectHtml(inputConfig.firstSelect);
			var selectID = 'form-'+formID+'-'+inputConfig.firstSelect.id;
			var isSelectDiabled = inputConfig.firstSelect.disabled ? 'disabled' : '';
			var firstPlaceHolder = commonConfig.getPlaceHolder(inputConfig.firstSelect);
			var firstDefaultOptionHtml = '<option value="">'+firstPlaceHolder+'</option>';
			var firstSelectHtml = '<select id="'+selectID+'" name="'+selectID+'" class="form-control" nstype="'+inputConfig.type+'-firstSelect" '+isSelectDiabled+'>'
							+firstDefaultOptionHtml
							+firstSelectOptionHtml
						+'</select>';
			
			var secondSelectOptionHtml = commonConfig.converSelectHtml(inputConfig.secondSelect);
			var secondID = 'form-'+formID+'-'+inputConfig.secondSelect.id;
			var secondDisabled = inputConfig.secondSelect.disabled ? 'disabled':'';
			var secondPlaceHolder = commonConfig.getPlaceHolder(inputConfig.secondSelect);
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
				operationHtml = '<div class="btn-group" commonplane="moreSelectPlane" nstype="'+inputConfig.type+'_button">'
								+operationHtml
								+'</div>';
			}
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item selectplane '+inputConfig.type+'" ns-id="'+inputConfig.id+'">'
								+hiddenTextHtml
								+firstSelectHtml
								+secondSelectHtml
								+operationHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="hidden"){
			inputHtml = '<input id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" type="hidden" value="'+valueStr+'" class="hidden">';
		}else if(inputConfig.type=="date"){
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item">'
									+'<div class="input-group" '+formGroupHeight+'>'
										+'<input id="'+inputIDName+'" name="'+inputIDName+'" nstype="'+inputConfig.type+'" type="text" class="form-control datepicker" value="'+valueStr+'" readonly placeholder="'+placeholderStr+'" data-format="'+inputConfig.format+'" >'
										+'<div class="input-group-addon">'
											+'<a href="javascript:void(0);"><i class="linecons-calendar"></i></a>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == "datetime"){
			var dateID = inputIDName + '-date';
			var timeID = inputIDName + '-time';
			var datetimerDefaultValue = commonConfig.formatDate('','YYYY-MM-DD HH:MM:DD');
			var datetimerValue = valueStr;
			var dateValue = '';//日期
			var timeValue = '';//时间
			if(datetimerValue){
				dateValue = datetimerValue.split(' ')[0];
				timeValue = datetimerValue.split(' ')[1];
			}
			inputHtml = '<div class="form-td datetimepicker '+inputSize+'">'
						+'<div class="form-group" '+formGroupHeight+'>'
							+labelHtml
							+'<div class="form-item datetimepicker">'
								+'<input id="'+dateID+'" name="'+dateID+'" nstype="'+inputConfig.type+'" type="text" class="form-control datepicker" value="'+dateValue+'" '+readonlyStr+' />'
								+'<input id="'+timeID+'" name="'+timeID+'" nstype="'+inputConfig.type+'" type="text" class="form-control timepicker" value="'+timeValue+'" '+readonlyStr+' />' 
							+'</div>'
						+'</div>'
					+'</div>';
		}else if(inputConfig.type == "daterangepicker"){
			//分隔符
			inputHtml = '<div class="form-td  '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item datetimepicker">'
									+'<input type="text" name="'+inputIDName+'" id="'+inputIDName+'" class="form-control" readonly nstype="'+inputConfig.type+'">'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="upload"){
			var dropzoneDefalutArr = inputConfig.subdata;
			var dropzoneDefalutHtml = '';
			var dropStr = '';
			if(typeof(dropzoneDefalutArr) != 'undefined'){
				var dropTextfield = inputConfig.textField;
				var dropValuefield = inputConfig.valueField;
				for(var dropIndex = 0; dropIndex < dropzoneDefalutArr.length; dropIndex ++){
					var dropDefaultId = dropzoneDefalutArr[dropIndex][dropValuefield];
					var dropDefaultvalue = dropzoneDefalutArr[dropIndex][dropTextfield];
					dropStr += dropDefaultId + ',';
					dropzoneDefalutHtml += '<span class="dropzone-upload-span">'
										+'<a href="javascript:void(0)" id="'+dropDefaultId+'" class="upload-close"></a>'
										+'<a href="javascript:void(0)" id="'+dropDefaultId+'" class="upload-title">'
										+dropDefaultvalue
										+'</a>'
										+'</span>';
				}
				dropStr = dropStr.substring(0,dropStr.lastIndexOf(','));
			}
			var isReadonly = typeof(inputConfig.readonly) == 'boolean' ? inputConfig.readonly : false;
			//var readonlyStr = isReadonly ? 'upload-disabled' : '';
			//var readonlyStr = isReadonly ? 'readonly=true' : 'readonly=false';
			var readonlyStr = '';
			inputHtml = '<div class="form-td '+inputSize+'">'
						+'<div class="form-group" '+formGroupHeight+'>'
							+labelHtml
							+'<div class="form-item upload">'
								+'<div class="input-group" '+readonlyStr+'>'
									+'<div id="'+inputIDName+'" class="droppable-area-form dz-clickable">'
									+dropzoneDefalutHtml
									+'</div>'									
									+'<div class="input-group-addon">'
									+'<a href="javascript:void(0);"><i class="fa fa-upload"></i></a>'
									+'</div>'
									+'<input type="hidden" value="'+dropStr+'" ns-type="upload" />'
								+'</div>'
							+'</div>'
						+'</div>'
					+'</div>';
		}else if(inputConfig.type=="textarea"){
			var height = inputConfig.height;
			var labelHeight = '';
			if(height){
				if(typeof(height) == 'string'){
					var isAppend = false;
					if(height.indexOf('px')>-1){
						height = 'style="height: '+inputConfig.height+';"';
						isAppend = false;
					}else{
						height = 'style="height: '+inputConfig.height+'px;"';
						isAppend = true;
					}
					if(Number(height)>100){
						var tempHeight = inputConfig.height-20;
						if(isAppend){
							labelHeight = 'style="height: '+tempHeight+'px;"';
						}else{
							labelHeight = 'style="height: '+tempHeight+';"';
						}
					}else{
						if(isAppend){
							labelHeight = 'style="height: '+inputConfig.height+'px;"';
						}else{
							labelHeight = 'style="height: '+inputConfig.height+';"';
						}
					}
				}else{
					height = 'style="height: '+inputConfig.height+'px;"';
					var tempHeight = inputConfig.height-20;
					if(height > 100){
						labelHeight = 'style="height: '+tempHeight+'px;"';
					}else{
						labelHeight = 'style="height: '+inputConfig.height+'px;"';
					}
				}
			}else{
				height = '';
				labelHeight = '';
			}
			var textareaSize = '';
			if(typeof(inputConfig.column) == 'undefined'){
				textareaSize = 'col-sm-12';
			}else{
				textareaSize = inputSize;
			}
			inputHtml = '<div class="form-td '+textareaSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<textarea id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" placeholder="'+placeholderStr+'" class="form-control" '+readonlyStr+height+'>'+valueStr+'</textarea>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'tree-select'){
			var treeCloseBtnID = inputIDName +'-tree-menuBtn';
			var treeValueStr = typeof(inputConfig.text) == 'undefined' ?'':inputConfig.text;
			var treeNodeId = '';
			if(typeof(inputConfig.value) == 'function'){
				var treeNodeId = inputConfig.value();
			}else{
				treeNodeId = inputConfig.value ? inputConfig.value :'';
			}
			var treeID = inputIDName+'-tree';
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<input id="'+inputIDName+'" type="text" nodeid="'+treeNodeId+'" name="'+inputIDName+'" treeType="'+inputConfig.treeId+'" nstype="'+inputConfig.type+'" value="'+treeValueStr+'" class="form-control" readonly>'
								+'<a id="'+treeCloseBtnID+'" href="javascript:void(0)" class="treeselect-arrow"><i class="fa fa-caret-down"></i></a>'
								+'<ul id="'+treeID+'" class="ztree hide"></ul>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'person-select'){
			var historyHtml = '';
			var isUsedHistory = true;
			var rightNum = 33;
			if(typeof(inputConfig.isUsedHistory)=='boolean'){
				if(inputConfig.isUsedHistory==false){
					isUsedHistory = false;
					rightNum = 3;
				}
			}else{
				inputConfig.isUsedHistory = true;
			}
			if(isUsedHistory){
				historyHtml = 
					'<a href="javascript:void(0);" class="person-select-plane-btn" style="right: 3px;" ns-control="historyInfo">'
						+'<i class="fa fa-clock-o"></i>'
					+'</a>';
			}
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<input id="'+inputIDName+'" type="text" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" personType="'+inputConfig.type+'" value="'+valueStr+'" class="form-control">'
								+'<a href="javascript:void(0);" class="person-select-plane-btn" style="right: '+(rightNum+30)+'px;" ns-control="personInfo">'
									+'<i class="fa fa-user"></i>'
								+'</a>'
								+'<a href="javascript:void(0);" class="person-select-plane-btn" style="right: '+rightNum+'px;" ns-control="groupInfo">'
									+'<i class="fa fa-sitemap"></i>'
								+'</a>'
								+historyHtml
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="radio"){
			radioHtml = '';
			if(debugerMode){
				if(typeof(inputConfig.subdata)!="object"){
					nsAlert('单选按钮组'+inputConfig.id+' subdata必须是数组','error');
					return false;
				}
			}
			if(inputConfig.subdata){
				var isDisabledNum = 0;
				for(var radioI = 0; radioI<inputConfig.subdata.length; radioI++){
					var radioCls = 'cbr cbr-primary';
					if(inputConfig.subdata[radioI].isChecked){
						var radioCls = 'cbr cbr-primary';
					}
					var radioTextStr = '';
					var radioValueStr = '';
					if(typeof(inputConfig.textField)=='undefined'){
						radioTextStr = inputConfig.subdata[radioI].text;
					}else{
						radioTextStr = inputConfig.subdata[radioI][inputConfig.textField];
					}
					if(typeof(inputConfig.valueField)=='undefined'){
						radioValueStr = inputConfig.subdata[radioI].value;
					}else{
						radioValueStr = inputConfig.subdata[radioI][inputConfig.valueField];
					}

					var checkedStr = '';
					if(valueStr){
						checkedStr = valueStr == radioValueStr ? "checked" :"";
					}else{
						checkedStr = inputConfig.subdata[radioI].isChecked ? "checked":"";
					}

					var disabledStr = "";
					var disabledBool = inputConfig.subdata[radioI].isDisabled?inputConfig.subdata[radioI].isDisabled:false;
					if(disabledBool){
						disabledStr = "disabled";
						isDisabledNum++; //统计disable的数量
					}else{
						disabledStr = "";
					}
					var radioMsgStr = '';
					if(inputConfig.subdata[radioI].msg){
						radioMsgStr = 'data-toggle="tooltip" title="'+inputConfig.subdata[radioI].msg+'"';
					}
					radioHtml += '<label class="radio-inline" '+radioMsgStr+'>'
									+'<input id="'+inputIDName+'-'+radioI+'" nstype="'+inputConfig.type+'" type="radio" '+checkedStr+' '+disabledStr+' class="'+radioCls+'" name="'+inputIDName+'" value="'+radioValueStr+'" >'
									+radioTextStr
								+'</label>';
				}
			}
			var disabledCls = ''
			if(isDisabledNum == inputConfig.subdata.length){
				disabledCls = ' all-disabled'; //全部都不可用才输出不可用样式
			}
			var radioClose = typeof(inputConfig.isHasClose)=='boolean' ? inputConfig.isHasClose : false;
			if(radioClose){
				var radioCloseLength = inputConfig.subdata.length;
				radioHtml += 
					'<label class="radio-inline radio-clear">'
						+'<input id="'+inputIDName+'-'+radioCloseLength+'"  nstype="'+inputConfig.type+'-clear" type="radio" class="cbr cbr-primary hide" name="'+inputIDName+'" value="" />'
						+'清空'
					+'</label>'
			}
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item radio '+disabledCls+'">'
									+ radioHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="checkbox"){
			checkboxHtml = '';
			if(typeof(inputConfig.subdata)!="undefined"){
				var isDisabledNum = 0;
				for(var checkboxI = 0; checkboxI<inputConfig.subdata.length; checkboxI++){
					var checkboxCls = 'cbr cbr-primary';
					if(inputConfig.subdata[checkboxI].isChecked){
						var checkboxCls = 'cbr cbr-primary';
					}
					var checkboxTextStr = '';
					var checkboxValueStr = '';
					if(typeof(inputConfig.textField)=='undefined'){
						checkboxTextStr = inputConfig.subdata[checkboxI].text;
					}else{
						checkboxTextStr = inputConfig.subdata[checkboxI][inputConfig.textField];
					}
					if(typeof(inputConfig.valueField)=='undefined'){
						checkboxValueStr = inputConfig.subdata[checkboxI].value;
					}else{
						checkboxValueStr = inputConfig.subdata[checkboxI][inputConfig.valueField];
					}

					var checkedStr = '';
					if(typeof(inputConfig.value) == 'function'){
						var defaultCheckStr = inputConfig.value();
						checkedStr = checkboxValueStr == defaultCheckStr ?"checked":"";
					}else if(typeof(inputConfig.value) == 'string' || typeof(inputConfig.value)=='number'){
						if(inputConfig.value){
							checkedStr = inputConfig.value == checkboxValueStr ?"checked":"";
						}else{
							checkedStr = inputConfig.subdata[checkboxI].isChecked?" checked ":"";
						}
					}else if(typeof(inputConfig.value) == 'object'){
						for(var check in inputConfig.value){
							if(checkboxValueStr == inputConfig.value[check]){
								checkedStr = "checked";
							}
						}
					}
					
					var disabledStr = "";
					var disabledBool = inputConfig.subdata[checkboxI].isDisabled?inputConfig.subdata[checkboxI].isDisabled:false;
					if(disabledBool){
						disabledStr = "disabled";
						isDisabledNum++; //统计disable的数量
					}else{
						disabledStr = "";
					}
					checkboxHtml += '<label class="checkbox-inline">'
									+'<input id="'+inputIDName+'-'+checkboxI+'"  nstype="'+inputConfig.type+'" type="checkbox" '+checkedStr+' '+disabledStr+' class="'+checkboxCls+'" name="'+inputIDName+'" value="'+checkboxValueStr+'" >'
									+checkboxTextStr
								+'</label>'
				}
			}else{
				checkboxHtml = '<label class="checkbox-inline">'
							+'<input id="'+inputIDName+'0"  nstype="'+inputConfig.type+'" type="checkbox"  class="cbr cbr-primary" name="'+inputIDName+'" value="1" >'
								+inputConfig.textField
								+'</label>'
			}
			var disabledCls = ''
			if(isDisabledNum == inputConfig.subdata.length){
				disabledCls = ' all-disabled'; //全部都不可用才输出不可用样式
			}
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item checkbox '+disabledCls+'">'
									+ checkboxHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="select2"){
			selectHtml = '<option value="">'+placeholderStr+'</option>';
			var select2GroupArr = inputConfig.subdata;//默认读取的是subdata值
			//是否是ajax方式读值
			if(typeof(inputConfig.url)=='string'){
				var isMethod = typeof(inputConfig.method) == 'string' ? inputConfig.method : 'GET';
				var params = typeof(inputConfig.params) == 'object' ? inputConfig.params : {};
				if(isMethod == ''){isMethod = 'GET'}
				$.ajax({
					url:inputConfig.url,
					dataType: "json", // 数据类型 
					type:isMethod,
					async:false,
					data:params,
					success:function(result){
						//是否定义了数据源参数
						if(typeof(inputConfig.dataSrc)=='undefined'){
							select2GroupArr = result;
						}else{
							select2GroupArr = result[inputConfig.dataSrc];
						}
					}
				})
			}
			if($.isArray(select2GroupArr)){
				//拿到的是数组格式
				var textField = typeof(inputConfig.textField)=='string' ? inputConfig.textField : 'text';
				var valueField = typeof(inputConfig.valueField)=='string' ? inputConfig.valueField : 'value';
				var childrenField = typeof(inputConfig.optchildren) == 'string' ? inputConfig.optchildren : 'children';
				for(var group in select2GroupArr){
					var textStr = select2GroupArr[group][textField];//文本值
					var optionStr = select2GroupArr[group][valueField];//id值
					//判断是否有分组的下拉框
					if($.isArray(select2GroupArr[group][childrenField])){
						//如果存在分组
						var childrenArr = select2GroupArr[group][childrenField];
						var groupTitle = typeof(inputConfig.optlabel) == 'string' ? inputConfig.optlabel : textField;
						selectHtml +='<optgroup label="'+select2GroupArr[group][groupTitle]+'">';
						for(var childI=0; childI < childrenArr.length; childI++){
							var childTextStr = childrenArr[childI][textField];
							var childValueStr = childrenArr[childI][valueField];
							var selectedStr = '';
							if(childrenArr[childI].selected == true){
								selectedStr = 'selected';
							}else{
								if(valueStr != ''){
									if(childValueStr == valueStr){
										selectedStr = 'selected';
									}
								}
							}
							var isDisabled = typeof(childrenArr[childI].isDisabled) == 'boolean' ? childrenArr[childI].isDisabled : false;
							var disabledStr = '';
							if(isDisabled){
								disabledStr = 'disabled';
							}
							selectHtml += '<option value="'+childValueStr+'" '+selectedStr+' '+disabledStr+'>'+childTextStr+'</option>';
						}
						selectHtml += '</optgroup>';
					}else{
						var selectedStr = '';
						if(select2GroupArr[group].selected == true){
							selectedStr = 'selected';
						}else{
							if(valueStr != ''){
								if(optionStr == valueStr){
									selectedStr = 'selected';
								}
							}
						}
						var isDisabled = typeof(select2GroupArr[group].isDisabled) == 'boolean' ? select2GroupArr[group].isDisabled : false;
						var disabledStr = '';
						if(isDisabled){
							disabledStr = 'disabled';
						}
						selectHtml += '<option value="'+optionStr+'" '+selectedStr+' '+disabledStr+'>'
										+textStr
									+'</option>';
					}
				}
			}
			var multiple = inputConfig.multiple ? 'multiple':'';
			var isDisabled = typeof(inputConfig.readonly) == 'boolean' ? inputConfig.readonly : false;
			if(typeof(inputConfig.disabled)=='boolean'){
				isDisabled = inputConfig.disabled;
			}
			var disabledStr = '';
			if(isDisabled){
				disabledStr = 'disabled';
			}
			selectHtml = '<select class="form-control" '+disabledStr+' nstype="'+inputConfig.type+'" id="'+inputIDName+'" '+multiple+' >'
							+selectHtml
						+'</select>'
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item select2">'
									+ selectHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="select"){
			selectHtml = '<option value="">'+placeholderStr+'</option>';
			var selectData;
			var selectAjaxData = {};
			if(inputConfig.data){
				selectAjaxData = inputConfig.data;
			}
			if(inputConfig.url =='' || inputConfig.url == null){
				selectData = inputConfig.subdata;
			}else{
				$.ajax({
					url:inputConfig.url, //请求的数据链接
					type:inputConfig.method,
					data:selectAjaxData,
					dataType:'json',
					async:false,
					success:function(rec){
						if(typeof(inputConfig.dataSrc)=='undefined'){
							selectData = rec;
						}else{
							for(data in rec){
								selectData = rec[inputConfig.dataSrc];
							}
						}
					},
					error: function () {
						nsalert(language.common.commonconfig.nsalert.checkDataFormat,'warning');
					}
				});
			}
			if(selectData){
				if(selectData.length > 0){
					for(var selectI = 0; selectI<selectData.length; selectI++){
						//var checkedStr = inputConfig.subdata[selectI].isChecked?" selected ":"";
						var textStr = '';
						var valueStrI = '';
						if(typeof(inputConfig.textField)=='undefined'){
							textStr = selectData[selectI].text;
						}else{
							textStr = selectData[selectI][inputConfig.textField];
						}
						if(typeof(inputConfig.valueField)=='undefined'){
							valueStrI = selectData[selectI].value;
						}else{
							valueStrI = selectData[selectI][inputConfig.valueField];
						}
						var checkedStr = '';
						if(valueStr){
							checkedStr = valueStr == valueStrI ? "selected":"";
						}else{
							checkedStr = selectData[selectI].selected ? "selected":"";
						}
						var disabledStr = selectData[selectI].isDisabled?" disabled ":"";
						selectHtml += '<option value="'+valueStrI+'" '+checkedStr+' '+disabledStr+'>'
										+textStr
									+'</option>'
					}
				}else{
					if(valueStr){
						selectHtml += '<option value="'+valueStr+'" selected>'+valueStr+'</option>'; 
					}
				}
			}
			var isSelectDiabled = inputConfig.disabled ? 'disabled' : '';
			selectHtml = '<select class="form-control" id="'+inputIDName+'" '+isSelectDiabled+'>'
							+selectHtml
						+'</select>'
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+labelHtml
								+'<div class="form-item select">'
									+ selectHtml
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="text-btn"){
			var btnArr = inputConfig.btns;
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item">'
									+'<div class="input-group">'
										+'<input id="'+inputIDName+'" name="'+inputIDName+'" '+readonlyStr+' nstype="'+inputConfig.type+'" type="text" class="form-control" placeholder="'+placeholderStr+'" value="'+valueStr+'">';
			if($.isArray(btnArr)){
				if(btnArr.length > 0){
					inputHtml += '<div class="input-group-btn text-btn">';
					for(var btn = 0 ; btn < btnArr.length; btn ++){
						var disabled = btnArr[btn].isDisabled?" disabled ":"";
						var btnJson = {};
						btnJson.text = btnArr[btn].text;
						btnJson.handler = btnArr[btn].handler;
						btnJson.disabled = disabled;
						inputHtml+= commonConfig.getBtn(btnJson,'form',btn,true,false);					
					}						
					inputHtml += '</div>';
				}
			}							
			
			inputHtml += '</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="typeahead"){
			inputHtml = '<div class="form-td '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item">'
									+'<div class="typeahead__container">'
										+'<div class="typeahead__field">'
											+'<span class="typeahead__query">'
												+'<input id="'+inputIDName+'" class="form-control"  nstype="'+inputConfig.type+'" type="search" placeholder="Search" autofocus autocomplete="off" />'
											+'</span>'
											+'<span class="typeahead__button">'
												+'<button type="button">'
													+'<span class="typeahead__search-icon"></span>'
												+'</button>'
											+'</span>'
										+'</div>'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="add-select-input"){
			if(typeof(inputConfig.hiddenID)=="undefined"){
				inputConfig.hiddenID = inputConfig.id+'-hidden-'+parseInt(Math.random()*100000+1);
			}
			if(typeof(inputConfig.submitIndex)=="number"){
				inputConfig.localDataHiddenIDIndex = inputConfig.submitIndex
			}
			var inputHiddenIDName = "form-"+formID+"-"+inputConfig.hiddenID;
			inputConfig.fullHiddenID = inputHiddenIDName;
			var tooltipHtml ='data-toggle="tooltip" data-placement="top" title="直接输入：张某 18610611123 则可自动保存为新用户" '
			inputHtml ='<div class="form-td add-select-input '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item">'
									+'<div class="input-group">'
										+'<input id="'+inputIDName+'" name="'+inputIDName+'"  nstype="'+inputConfig.type+'" type="text" placeholder="'+placeholderStr+'" class="form-control" value="'+valueStr+'" '+readonlyStr+'>'
										+'<a href="javascript:void(0);" class="input-group-btn add-select-input-btn" ns-control="refresh"><i class="fa fa-refresh"></i></a>'
										+'<a href="javascript:void(0);" class="input-group-btn add-select-input-btn" ns-control="list"><i class="fa fa-list"></i></a>'
										+'<input id="'+inputHiddenIDName+'" name="'+inputHiddenIDName+'" nstype="'+inputConfig.type+'-hidden" type="hidden" >'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type=="organiza-select"){
			if(typeof(inputConfig.hiddenID)=="undefined"){
				inputConfig.hiddenID = inputConfig.id+'-origanize-hidden-'+parseInt(Math.random()*100000+1);
			}
			var inputHiddenIDName = "form-"+formID+"-"+inputConfig.hiddenID;
			inputConfig.fullHiddenID = inputHiddenIDName;
			var text = '';
			var tid = '';
			if(typeof(valueStr)=='object'){
				text = valueStr.text;
				tid = valueStr.id;
			}
			var addBtnHtml = '';
			if(typeof(inputConfig.addHandler) == 'function'){
				addBtnHtml = '<a href="javascript:void(0);" class="input-group-btn origanize-select-btn" ns-control="add"><i class="fa fa-plus"></i></a>';
			}
			inputHtml = '<div class="form-td '+inputConfig.type+' '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item">'
									+'<div class="input-group">'
										+'<input class="form-control" '
										+' nstype="'+inputConfig.type+'"'
										+' name="'+inputIDName +'"'
										+' id="'+inputIDName+'"'
										+' placeholder="'+placeholderStr+'"'
										+' type="text"'
										+' value="'+text+'">'
										+'<a href="javascript:void(0);" class="input-group-btn origanize-select-btn" ns-control="search"><i class="fa fa-search"></i></a>'
										+addBtnHtml
										+'<input id="'+inputHiddenIDName+'" value="'+tid+'" name="'+inputHiddenIDName+'" nstype="'+inputConfig.type+'-hidden" type="hidden" >'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
		}else if(inputConfig.type == 'input-select'){
			var html = '<input class="form-control" id="'+inputIDName+'" ns-id="'+inputConfig.id+'" name="'+inputIDName+'" nstype="'+inputConfig.type+'" value="'+valueStr+'" type="text" />'
					+'<a id="'+inputIDName+'-selectBtn" href="javascript:void(0)" class="input-select-btn" nstype="'+inputConfig.type+'" ns-control="'+inputConfig.type+'-btn">'
							+'<i class="fa fa-caret-down"></i></a>';
			inputHtml = '<div class="form-td '+inputConfig.type+' '+inputSize+'">'
							+'<div class="form-group">'
								+labelHtml
								+'<div class="form-item">'
									+'<div class="input-group">'+html+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
			return inputHtml;
		}else if(inputConfig.type=="province-select"){
			var provinceData = provinceInfo;
			var provSelectedStr = '';//省
			var citySelectedStr = '';//市
			var areaSelectedStr = '';//区
			if(typeof(valueStr) == 'object'){
				provSelectedStr = valueStr.province ? valueStr.province : '';
				citySelectedStr = valueStr.city ? valueStr.city : '';
				areaSelectedStr = valueStr.area ? valueStr.area : '';
			}
			var cityData = [];
			var areaData = [];
			var isShowCityDom = 'hide';
			var isShowAreaDom = 'hide';
			var selectProHtml = '';//省份html
			var selectCityHtml = '';//市 html
			var selectAreaHtml = '';//区 html
			for(var proI = 0; proI < provinceData.length; proI ++){
				var currentProvname = provinceData[proI].name;
				var currentProval = currentProvname;  //value值等同于text文本值的显示
				if(currentProval == '省份'){
					currentProval = '';
				}
				var isSelected = '';
				//存在默认省份的设置
				if(provSelectedStr != ''){
					if(currentProvname == provSelectedStr){
						cityData = provinceData[proI].sub;
						isSelected = 'selected';
					}
				}
				selectProHtml += '<option value="'+currentProval+'" '+isSelected+'>'+currentProvname+'</option>';
			}
			if(provSelectedStr == ''){
				citySelectedStr = provinceData[0].name;
				cityData = provinceData[0].sub;
				areaSelectedStr = cityData[0].name;
			}
			if(citySelectedStr != ''){
				isShowCityDom = '';
				for(var cityI = 0; cityI < cityData.length; cityI ++){
					var currentCityname = cityData[cityI].name;
					var isCitySelected = '';
					if(currentCityname == citySelectedStr){
						areaData = cityData[cityI].sub;
						isCitySelected = 'selected';
					}
					selectCityHtml += '<option value="'+currentCityname+'" '+isCitySelected+'>'+currentCityname+'</option>';
				}
			}
			if(areaSelectedStr != ''){
				isShowAreaDom = '';
				for(var areaI = 0; areaI < areaData.length; areaI ++){
					var currentAreaname = areaData[areaI].name;
					var isAreaSelected = '';
					if(currentAreaname == areaSelectedStr){
						isAreaSelected = 'selected';
					}
					selectAreaHtml += '<option value="'+currentAreaname+'" '+isAreaSelected+'>'+currentAreaname+'</option>';
				}
			}
			selectProHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="province" id="'+inputIDName+'-province">'
							+selectProHtml
						+'</select>';
			selectCityHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="city" id="'+inputIDName+'-city">'
							+selectCityHtml
						+'</select>';
			selectAreaHtml = '<select class="form-control" nstype="'+inputConfig.type+'" data-pro="area" id="'+inputIDName+'-area">'
							+selectAreaHtml
						+'</select>';

			selectProHtml = '<div class="form-td col-sm-4 col-xs-12">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+'<label class="control-label  province-select-label" for="'+inputIDName+'-province">'
									+language.common.commonconfig.label.province+'</label>'
								+'<div class="form-item select">'
									+ selectProHtml
								+'</div>'
							+'</div>'
						+'</div>';
			selectCityHtml = '<div class="form-td col-sm-4 col-xs-12">'
								+'<div class="form-group" '+formGroupHeight+'>'
									+'<label class="control-label  province-select-label" for="'+inputIDName+'-city">'
									+language.common.commonconfig.label.city+'</label>'
									+'<div class="form-item select">'
										+ selectCityHtml
									+'</div>'
								+'</div>'
							+'</div>';
			selectAreaHtml = '<div class="form-td col-sm-4 col-xs-12">'
							+'<div class="form-group" '+formGroupHeight+'>'
								+'<label class="control-label  province-select-label" for="'+inputIDName+'-country">'
									+language.common.commonconfig.label.area+'</label>'
								+'<div class="form-item select">'
									+ selectAreaHtml
								+'</div>'
							+'</div>'
						+'</div>';
			inputHtml = selectProHtml + selectCityHtml + selectAreaHtml;
		}else{				
			nsalert('配置类型参数：'+inputConfig.type+' 填写有误，请核实');
		}
		
	}
	return inputHtml;
}
commonConfig.getSelectData = function(inputConfig){
	if(inputConfig.url =='' || inputConfig.url == null){
		selectData = inputConfig.subdata;
	}else{
		var ajaxUrl = inputConfig.url;
		if(typeof(ajaxUrl)=='function'){
			ajaxUrl = ajaxUrl();
		}
		var ajaxData = inputConfig.data;
		if(typeof(ajaxData)=='function'){
			ajaxData = ajaxData();
		}
		$.ajax({
			url: 	ajaxUrl, 
			type: 	inputConfig.method,
			data: 	ajaxData,
			async:false,
			success:function(rec){
				if(typeof(inputConfig.dataSrc)=='undefined'){
					selectData = rec;
				}else{
					for(data in rec){
						selectData = rec[inputConfig.dataSrc];
					}
				}
			},
			error: function () {
				nsalert(language.common.commonconfig.nsalert.checkDataFormat,'warning');
			}
		});
	}
	return selectData;
}
commonConfig.getRules = function(jsonArray,formID){
	formPlane.fillValid[formID] = {};
	var fillObj = {};
	var validateObj = {};
	var rules = {};
	for(var inputI=0; inputI<jsonArray.length; inputI++){
		if(typeof(jsonArray[inputI].rules)!='undefined'){
			var key = "form-"+formID+"-"+jsonArray[inputI].id;
			var value = {};
			var rulesStr = jsonArray[inputI].rules;
			var rulesArr = rulesStr.split(' ');
			for(var ruleI=0;ruleI<rulesArr.length; ruleI++){
				if(rulesArr[ruleI]=='required'){
					value['required'] = true;
				};
				if(rulesArr[ruleI]=='number'){
					value['number'] = true;
				};
				if(rulesArr[ruleI]=='email'){
					value['email'] = true;
				};
				//手机号
				if(rulesArr[ruleI]=='ismobile'){
					value['ismobile'] = true;
				};
				//邮政编码
				if(rulesArr[ruleI]=='postalcode'){
					value['postalcode'] = true;
				};
				//年份
				if(rulesArr[ruleI]=='year'){
					value['year'] = true;
				};
				//月份
				if(rulesArr[ruleI]=='month'){
					value['month'] = true;
				};
				//身份证
				if(rulesArr[ruleI]=='Icd'){
					value['Icd'] = true;
				};
				//银行卡号
				if(rulesArr[ruleI]=='bankno'){
					value['bankno'] = true;
				};
				if(rulesArr[ruleI]=='url'){
					value['url'] = true;
				};
				if(rulesArr[ruleI]=='date'){
					value['date'] = true;
				};
				if(rulesArr[ruleI]=='dateISO'){
					value['dateISO'] = true;
				};
				if(rulesArr[ruleI].indexOf('equalTo=')>-1){
					var toIDStr = rulesArr[ruleI];
					toIDStr = toIDStr.substr(toIDStr.indexOf("=")+1,toIDStr.length);
					toIDStr = "form-"+formID+"-"+toIDStr;
					value['equalTo'] = "#"+toIDStr;
				};
				if(rulesArr[ruleI].indexOf('minlength=')>-1){
					value['minlength'] = commonConfig.getRuleNumber(rulesArr[ruleI],'minlength');
				};
				if(rulesArr[ruleI].indexOf('maxlength=')>-1){
					value['maxlength'] = commonConfig.getRuleNumber(rulesArr[ruleI],'maxlength');
				};
				if(rulesArr[ruleI].indexOf('min=')>-1){
					value['min'] = commonConfig.getRuleNumber(rulesArr[ruleI],'min');
				};
				if(rulesArr[ruleI].indexOf('max=')>-1){
					value['max'] = commonConfig.getRuleNumber(rulesArr[ruleI],'max');
				};
				if(rulesArr[ruleI].indexOf('range=')>-1){
					value['range'] = commonConfig.getRuleNumberArray(rulesArr[ruleI]);
				};
				if(rulesArr[ruleI].indexOf('rangelength=')>-1){
					value['rangelength'] = commonConfig.getRuleNumberArray(rulesArr[ruleI]);
				};
				if(rulesArr[ruleI]=='autocomplete'){
					fillObj[key] = autoCompleteValid(key);
				}
				if(rulesArr[ruleI]=='select'){
					fillObj[key] = selectValid(jsonArray[inputI].value,jsonArray[inputI].subdata);
				}
				if(rulesArr[ruleI]=='select2'){
					fillObj[key] = selectValid(jsonArray[inputI].value,jsonArray[inputI].subdata);
				}
				if(rulesArr[ruleI].indexOf('precision')>-1){
					value['precision'] = commonConfig.getRuleNumber(rulesArr[ruleI],'precision');
				}
				if(rulesArr[ruleI] == 'upload'){
					fillObj[key] = uploadValid(jsonArray[inputI].subdata);
				}
			}
			rules[key] = value;
		}
		validateObj['rules'] = rules;
		formPlane.fillValid[formID] = fillObj;

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
commonConfig.getRulesPrecisionNumber = function(elestr,rules){
	var eleRules;
	var isPassRules = false;
	elestr = Number(elestr);
	if(isNaN(elestr)){isPassRules = false}
	if(rules == 0){
		var interger =  /^\d+$/;
		var negative = /^((-\d+)|(0+))$/;
		if(interger.test(elestr) || negative.test(elestr)){
			isPassRules = true;
		}else{
			isPassRules = false;
		}
	}else{
		switch(rules){
			case 1:
				eleRules = /^\d{0,9}\.\d{0,1}$|^\d{0,9}$/;
				break;
			case 2:
				eleRules = /^\d{0,9}\.\d{0,2}$|^\d{0,9}$/;
				break;
			case 3:
				eleRules = /^\d{0,9}\.\d{0,3}$|^\d{0,9}$/;
				break;
			case 4:
				eleRules = /^\d{0,9}\.\d{0,4}$|^\d{0,9}$/;
				break;
			case 5:
				eleRules = /^\d{0,9}\.\d{0,5}$|^\d{0,9}$/;
				break;
		}
		if(eleRules.test(elestr)){
			isPassRules = true;
		}else{
			isPassRules = false;
		}
	}
	return isPassRules;
}
//默认输入的小数
commonConfig.getPrecisionNumber = function(str){
	var numberStr = str.substr(str.indexOf("=")+1,str.length);
	var number = parseInt(numberStr);
	return number;
}

commonConfig.getRuleNumber = function(configStr,valueName){
	/*var numberStr = str.substr(str.indexOf("=")+1,str.length);
	var number = parseInt(numberStr);
	return number;*/
	var number = 0;
	if(configStr.indexOf(valueName)>-1){
		var validStr = configStr.substring(configStr.indexOf(valueName),configStr.length);
		var endIndexNum = validStr.split(' ');
		number = endIndexNum[0].substr(endIndexNum[0].indexOf("=")+1,endIndexNum[0].length);
	}else{
		number = configStr.substr(configStr.indexOf("=")+1,configStr.length);
	}
	number = parseInt(number);
	return number;
}
/**
 * 根据rules自动生成placeholder字符串
 */
commonConfig.getPlaceHolder = function(config){
	var placeholderStr = "";
	if(typeof(config.placeholder)=="undefined"){
		if(typeof(config.rules)!="undefined"){
			var tempPlaceholderStr = "";
			if(config.rules.indexOf("required")>=0){
				tempPlaceholderStr +=language.common.commonconfig.Verification.required;
			}
			if(config.rules.indexOf("email")>=0){
				tempPlaceholderStr +=" xxx@xxx.xxx";
			}
			if(config.rules.indexOf("dateISO")>=0){
				tempPlaceholderStr +=language.common.commonconfig.Verification.date;
			}
			if(config.rules.indexOf("url")>=0){
				tempPlaceholderStr +=language.common.commonconfig.Verification.url;
			}
			if(config.rules.indexOf("number")>=0){
				tempPlaceholderStr += language.common.commonconfig.Verification.number;
			}
			if(config.rules.indexOf("minlength")>=0){
				tempPlaceholderStr += language.common.commonconfig.Verification.minlength[0]+commonConfig.getRuleNumber(config.rules,'minLength')+language.common.commonconfig.Verification.minlength[1];
			}
			//验证小数位数
			if(config.rules.indexOf("precision") >= 0){
				tempPlaceholderStr += language.common.commonconfig.Verification.precision[0]+commonConfig.getRuleNumber(config.rules,'precision')+language.common.commonconfig.Verification.precision[1];
			}
			if(config.rules.indexOf("maxlength")>=0){
				tempPlaceholderStr += language.common.commonconfig.Verification.maxlength[0]+commonConfig.getRuleNumber(config.rules,'maxlength')+language.common.commonconfig.Verification.maxlength[1];
			}
			if(config.rules.indexOf("min=")>=0){
				tempPlaceholderStr += language.common.commonconfig.Verification.min[0]+commonConfig.getRuleNumber(config.rules,'min')+language.common.commonconfig.Verification.min[1];
			}
			if(config.rules.indexOf("max=")>=0){
				tempPlaceholderStr += language.common.commonconfig.Verification.max[0]+commonConfig.getRuleNumber(config.rules,'max')+language.common.commonconfig.Verification.max[1];
			}
			if(config.rules.indexOf("range=")>=0){
				var tempRulesArr = commonConfig.getRuleNumberArray(config.rules);
				tempPlaceholderStr += language.common.commonconfig.Verification.range[0]+tempRulesArr[0]+language.common.commonconfig.Verification.range[1]+tempRulesArr[1];
				tempRulesArr = null;
			}
			//如果还有手机，手机的验证
			if(config.rules.indexOf("ismobile")>=0){
				tempPlaceholderStr +=language.common.commonconfig.Verification.ismobile;
			}
			//邮政编码
			if(config.rules.indexOf("postalcode")>=0){
				tempPlaceholderStr +=language.common.commonconfig.Verification.postalcode;
			}
			//四位年份
			if(config.rules.indexOf("year")>=0){
				tempPlaceholderStr +=language.common.commonconfig.Verification.year;
			}
			//月份1-12
			if(config.rules.indexOf("month")>=0){
				tempPlaceholderStr +=language.common.commonconfig.Verification.month;
			}
			//身份证号码的验证
			if(config.rules.indexOf("Icd")>=0){
				tempPlaceholderStr +=language.common.commonconfig.Verification.Icd;
			}
			//银行卡号
			if(config.rules.indexOf("bankno")>=0){
				tempPlaceholderStr +=language.common.commonconfig.Verification.bankno;
			}
			//下拉框
			if(config.rules.indexOf("select")>=0){
				tempPlaceholderStr = language.common.commonconfig.Verification.required;
			}
			if(config.rules.indexOf("select2")>=0){
				tempPlaceholderStr = language.common.commonconfig.Verification.select;
			}
			placeholderStr = tempPlaceholderStr;
		}else{
			placeholderStr = '';
		}
	}else{
		placeholderStr = config.placeholder;
	}
	return placeholderStr;
}
//日期比较，只能输入今天之前的日期
commonConfig.compareDate =  function(newDate){
	var currentDate = new Date();
	var year = currentDate.getFullYear();       //年
	var month = currentDate.getMonth() + 1;     //月
	var day = currentDate.getDate();            //日
	var oldDate = year + "-";
	if (month < 10) { oldDate += "0"; }
	oldDate += month + "-";
	if (day < 10) { oldDate += "0"; }
	oldDate += day + " ";
	var flag = false;
	var oldArr = oldDate.split('-');
	var newArr = newDate.split('-');
	var count = oldArr.length;
	for (var i = 0; i < count; i++) {
		if (parseInt(oldArr[i]) < parseInt(newArr[i])) {
			flag = true;
			break;
		} else if (parseInt(oldArr[i]) > parseInt(newArr[i])) {
			break;
		}
	}
	return flag;
}
commonConfig.getRuleNumberArray = function(str){
	//将'range=[13,23]'转成 12,23数组
	var b1 = str.indexOf('[');
	var b2 = str.indexOf(',');
	var b3 = str.indexOf(']');
	var number1 = parseInt(str.substring(b1+1,b2));
	var number2 = parseInt(str.substring(b2+1,b3));
	return [number1,number2];
}
/**
 * 格式化时间
 * dataNumber是毫秒数 如1471862506000 
 * isFullTime是否显示时分秒，默认为不显示
 * 
 * @returns 年/月/日  或者（isFullTime==false） 年/月/日 时:分:秒
 */
commonConfig.formatDate = function(dateNumber,isFullTime){
	var isFullTimeBln = arguments[1] ? arguments[1] : 'YYYY-MM-DD';
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
commonConfig.setSelectKeyValue = function(id,value,type){
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
//填充value，subdata是当前控件的附属数据，如单选则需要提供此数据
commonConfig.setKeyValue = function(id,value,type,subdata,valueField){
	//console.log("id:"+id+" value:"+value+" type:"+type);
	switch(type){
		case 'text':
			$("#"+id).val(value);
			break;
		case 'date':
			var regu = /^[-+]?\d*$/;
			if(regu.test(value)){
				value = commonConfig.formatDate(value);
			};
			$("#"+id).val(value);
			break;
		case 'datetime':
			var dateStr = value.split(' ')[0];
			var timeStr = value.split(' ')[1];
			timeStr = typeof(timeStr) == 'undefined' ? '' : timeStr;
			$('#'+id+'-date').val(dateStr);
			$('#'+id+'-time').val(timeStr);
			break;
		case 'checkbox':
			var checkboxData = subdata; 
			$("[name='"+id+"']").removeAttr("checked");
			for(var chkI = 0; chkI<checkboxData.length; chkI++){
				if(typeof(value)=='string'){
					if(checkboxData[chkI][valueField] == value){
						$("#"+id+"-"+chkI).get(0).checked = true;
					}
				}else if($.isArray(value)){
					//默认值是个数组
					for(var i=0; i<value.length; i++){
						if(checkboxData[chkI][valueField] == value[i]){
							$("#"+id+"-"+chkI).get(0).checked = true;
						}
					}
				}
			}
			//$("#"+id+"-"+chkI).attr("checked",false);
			break;
		case 'radio':
			var radioData = subdata; 
			for(var radioI = 0; radioI<radioData.length; radioI++){
				if(radioData[radioI][valueField] == value){
					$("#"+id+"-"+radioI).get(0).checked = true;
				}else{
					$("#"+id+"-"+radioI).attr("checked",false);
				}
			}
			break;
		case 'select':
			$("#"+id).val(value);
			var selectTextStr = $("#"+id).find("option:selected").text();
			$("#"+id).next().find('.selectboxit-btn .selectboxit-text').text(selectTextStr);
			break;
		case 'select2':
			var $selectChange = $select2Change[id];
			$selectChange.val(value).trigger('change');
			break;
		case "province-select":
			var proviceID = id+'-province';
			var cityID = id+'-city';
			var areaID = id+'-area';
			if(typeof(value) == 'object'){
				if(typeof(value.province)!='undefined'){
					$('#'+proviceID).val(value.province);
					var selectBoxOption = $('#'+proviceID).selectBoxIt().data("selectBox-selectBoxIt");
					selectBoxOption.refresh();
				}
				if(typeof(value.city)!='undefined'){
					$('#'+cityID).val(value.city);
					var selectBoxOption = $('#'+cityID).selectBoxIt().data("selectBox-selectBoxIt");
					selectBoxOption.refresh();
				}
				if(typeof(value.area)!='undefined'){
					$('#'+areaID).val(value.area);
					var selectBoxOption = $('#'+areaID).selectBoxIt().data("selectBox-selectBoxIt");
					selectBoxOption.refresh();
				}
			}
			break;
		case "tree-select":
			var treeId = id +'-tree';
			$('#'+id).val(value.text);
			$('#'+id).attr("value",value.text);
			$('#'+id).attr("nodeid",value.value);
			treeUI.selectedTreeNode(treeId,value.value);
			break;
		default:
			$("#"+id).val(value);
			break;
	}		
}