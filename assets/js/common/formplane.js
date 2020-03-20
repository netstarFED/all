formPlane.data = {}; 
formPlane.rules = {};  //验证规则
formPlane.fillValid = {};
formPlane.formInit = function(formJson,formContainer){
	var validateArr = [];//需要验证的
	var btnHandlerArr = [];//按钮组件的事件
	var changeHandlerArr = [];//radio,checkbox组件的事件
	var dateFormatArr = [];//日期格式
	var dateTimeFormatArr = [];//日期时间格式
	var uploadHanlderJson = {};
	var radioTooltipJson = {};
	var typeaheadArr = [];
	var select2Arr = [];
	var textBtnArr = [];
	var treeSelectJson = {};
	var addSelectInputConfig = false; 	//是否有增查一体输入框
	var organizaSelectConfig = false;	//是否有组织架构输入框
	var personSelectJson = {};
	var isHavePopover = false;
	var isHaveTooltip = false;
	var selectDateJson = {};
	var daterangepickerJson = {};//日期区间组件
	var selectHandlerArr = [];
	var provSelectHandlerArr = [];//省市区联动
	var selectProvinceArr = [];//省市区输入框
	var inputSelectArr = [];	//输入下拉框
	var formHtml = "";
	for(var groupID = 0; groupID<formJson.form.length; groupID++){
		var groupHtml = '';
		for(var inputID = 0; inputID<formJson.form[groupID].length; inputID++){
			var inputHtml = "";
			if(typeof(formJson.form[groupID][inputID].id)!="undefined"){
				groupHtml += commonConfig.component(formJson.form[groupID][inputID], formJson.id, "form");
				if(formJson.form[groupID][inputID].type == 'person-select'){
					//人员选择器不能使用这个规则，独立处理
					if(formJson.form[groupID][inputID].rules){
						formJson.form[groupID][inputID].sRules = formJson.form[groupID][inputID].rules;
						delete formJson.form[groupID][inputID].rules;
					}
				}
				if(formJson.form[groupID][inputID].type == 'input-select'){
					inputSelectArr.push(formJson.form[groupID][inputID]);
				}
				if(formJson.form[groupID][inputID].type == 'select-province'){
					selectProvinceArr.push(formJson.form[groupID][inputID]);
				}
				validateArr.push(formJson.form[groupID][inputID]);
				//按钮事件
				if(typeof(formJson.form[groupID][inputID].btnhandler)!='undefined'){
					btnHandlerArr.push(formJson.form[groupID][inputID]);
				}

				if(formJson.form[groupID][inputID].type == 'radio'){
					radioTooltipJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				//下拉框文本组件
				if(formJson.form[groupID][inputID].type == 'selectDate'){
					selectDateJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				//日期区间
				if(formJson.form[groupID][inputID].type == 'daterangepicker'){
					daterangepickerJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				if(formJson.form[groupID][inputID].type == 'typeahead'){
					typeaheadArr.push(formJson.form[groupID][inputID]);
				}
				//select
				if(formJson.form[groupID][inputID].type == 'select'){
					selectHandlerArr.push(formJson.form[groupID][inputID]);
				}
				if(formJson.form[groupID][inputID].type == 'tree-select'){
					treeSelectJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				if(formJson.form[groupID][inputID].type == 'select2'){
					select2Arr.push(formJson.form[groupID][inputID]);
				}
				if(typeof(formJson.form[groupID][inputID].changeHandler)!='undefined'){
					//非text-btn类型的组件有函数，集中处理，以change为标准
					changeHandlerArr.push(formJson.form[groupID][inputID]);
				}
				if(formJson.form[groupID][inputID].type == 'text-btn'){
					textBtnArr.push(formJson.form[groupID][inputID]);
				}
				if(formJson.form[groupID][inputID].type == 'date' && !formJson.form[groupID][inputID].readonly){
					var currentFormat = {
						id:formJson.form[groupID][inputID].id,
						format:formJson.form[groupID][inputID].format,
						changeHandler:formJson.form[groupID][inputID].changeHandler
					};
					dateFormatArr.push(currentFormat);
				}
				if(formJson.form[groupID][inputID].type == 'upload'){
					uploadHanlderJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				if(formJson.form[groupID][inputID].type == 'person-select'){
					personSelectJson[formJson.form[groupID][inputID].id] = formJson.form[groupID][inputID];
				}
				if(formJson.form[groupID][inputID].type == 'add-select-input'){
					if(addSelectInputConfig==false){
						addSelectInputConfig = formJson.form[groupID][inputID];
						isHaveTooltip = true;
					}else{
						nsAlert(language.form.addSelectInputError,'error');
					}
				}
				if(formJson.form[groupID][inputID].type == 'organiza-select'){
					if(organizaSelectConfig==false){
						organizaSelectConfig = formJson.form[groupID][inputID];
					}else{
						nsAlert(language.form.organizaSelectError,'error');
					}
				}
				if(formJson.form[groupID][inputID].type == 'datetime'){
					dateTimeFormatArr.push(formJson.form[groupID][inputID]);
				}
				if(formJson.form[groupID][inputID].type == 'province-select'){
					provSelectHandlerArr.push(formJson.form[groupID][inputID]);
				}
			}else{
				if(typeof(formJson.form[groupID][inputID].html)!="undefined"){
					groupHtml += formJson.form[groupID][inputID].html;				
				}else if(typeof(formJson.form[groupID][inputID].note)!="undefined"){
					//注释类型
					groupHtml += '<blockquote>'
									+'<p>'+formJson.form[groupID][inputID].note+'</p>'
								+'</blockquote>'
				}else if(typeof(formJson.form[groupID][inputID].element)!="undefined"){
					//预先定义的element元素
					if(formJson.form[groupID][inputID].element=="hr"){
						//横线
						groupHtml += '<div class="col-xs-12 element-hr"><hr></div><div class="clearfix"></div>';
					}else if(formJson.form[groupID][inputID].element=="label"){
						//组标签
						var elementLableTitle = '';
						var elementLableHide = '';
						if(formJson.form[groupID][inputID].label){
							elementLableTitle = formJson.form[groupID][inputID].label;
							elementLableHide = '';
						}else{
							//未定义lable
							elementLableTitle = '';
							elementLableHide = 'hide';
						}
						var labelHeight = '';
						var labelWeight = '';
						if(typeof(formJson.form[groupID][inputID].height) == 'string'){
							if(formJson.form[groupID][inputID].height.indexOf('px')>-1){
								labelHeight = 'height: '+formJson.form[groupID][inputID].height+';';
							}else if(formJson.form[groupID][inputID].height.indexOf('%')>-1){
								labelHeight = 'height: '+formJson.form[groupID][inputID].height+';';
							}else{
								labelHeight = 'height: '+formJson.form[groupID][inputID].height+'px;';
							}
						}else if(typeof(formJson.form[groupID][inputID].height) == 'number'){
							labelHeight = 'height: '+formJson.form[groupID][inputID].height+'px;';
						}
						if(typeof(formJson.form[groupID][inputID].width) == 'string'){
							if(formJson.form[groupID][inputID].width.indexOf('px')>-1){
								labelWeight = 'width: '+formJson.form[groupID][inputID].width+';';
							}else if(formJson.form[groupID][inputID].width.indexOf('%')>-1){
								labelWeight = 'width: '+formJson.form[groupID][inputID].width+';';
							}else{
								labelWeight = 'width: '+formJson.form[groupID][inputID].width+'px;';
							}
						}else if(typeof(formJson.form[groupID][inputID].width) == 'number'){
							labelWeight = 'width: '+formJson.form[groupID][inputID].width+'px;';
						}
						var labelStyleStr = 'style="'+labelHeight+''+labelWeight+'"';
						groupHtml += '<label class="grouplable '+elementLableHide+'" '+labelStyleStr+'>'+elementLableTitle+'</label>'
					}else if(formJson.form[groupID][inputID].element=="br"){
						//回车
						groupHtml += '<div class="col-xs-12 element-br"></div><div class="clearfix"></div>';
					}else if(formJson.form[groupID][inputID].element=="title"){
						//标题
						groupHtml += '<div class="col-xs-12 element-title"><label>'
							+'<i class="fa fa-arrow-circle-down"></i> '
							+formJson.form[groupID][inputID].label
						+'</label></div>';
					}
				}
			}
		}
		var groupCls = "row row-close";
		var groupHrHtml = '<div class="col-xs-12 element-space"></div>';
		if(typeof(formJson.format)!="undefined"){
			if(formJson.format=='standard'){
				groupCls = "row row-close";
				groupHrHtml = '<div class="col-xs-12 element-space"></div>';
			}else if(formJson.format=='close'){
				groupCls = "row row-close";
				groupHrHtml = '';
			}else if(formJson.format=='noline'){
				groupCls = "row";
				groupHrHtml = '';
			}
		}
		if(typeof(formJson.fillbg)!="undefined"){
			if(formJson.fillbg==true){
				groupCls += ' fillbg';
			}
		}
		if(groupID==(formJson.form.length-1)){
			groupHrHtml = '';
		}
		groupHtml = '<div class="'+groupCls+'">'+groupHtml+groupHrHtml+'</div>';
		formHtml +=groupHtml;
	}
	var sizeCls = '';
	var width = '';
	if(typeof(formJson.size)=="undefined"||formJson.size=="fullwidth"){
		//
	}else if(formJson.size=="standard"){
		sizeCls = ' '+formJson.size;
	}else{
		width = ' style="max-width: '+formJson.width+';"';
	}

	var panelHtml = '';
	if(formContainer){
		panelHtml = 
			'<form role="form" class="clearfix panel-form '+sizeCls+'"  id="form-'+formJson.id+'" method="get" action="" '+width+'>'
				+formHtml
			+'</form>'
	}else{
		panelHtml=
			'<div class="panel panel-default panel-form">'
				+'<div class="panel-body">'
					+'<form role="form" class="clearfix '+sizeCls+'"  id="form-'+formJson.id+'" method="get" action="" '+width+'>'
						+formHtml
					+'</form>'
				+'</div>'
			+'</div>';
	}
	if(debugerMode){
		if($("#"+formJson.id).length<1){
			nsalert("无法在页面上找到Form对象，请检查HTML和JSON中的id命名是否统一");
		}else if($("#"+formJson.id).length>1){
			nsalert("HTML中的from出现了ID重复,无法填充");
		}
	}
	
	if(formContainer){
		$("#"+formJson.id+" "+formContainer).html(panelHtml);
	}else{
		$("#"+formJson.id).html(panelHtml);
	}

	$('#form-'+formJson.id).on('keydown',function(event){
		if(event.keyCode == 13){
			return false;
		}
	})
	//是否有验证的对象
	if(validateArr.length>0){
		formPlane.validateForm(formJson.id,validateArr);
	}
	//
	if(!$.isEmptyObject(radioTooltipJson)){
		formPlane.radioTooltipPlane(formJson.id,radioTooltipJson);
	}
	//是否有日期类型
	if(dateFormatArr.length>0){
		formPlane.componentDate(formJson.id,dateFormatArr);
	}
	//日期时间类型
	if(dateTimeFormatArr.length>0){
		formPlane.componentDatetime(formJson.id,dateTimeFormatArr);
	}
	//是否有上传类型
	if(!$.isEmptyObject(uploadHanlderJson)){
		formPlane.componentUpload(formJson.id,uploadHanlderJson);
	}
	if(typeaheadArr.length>0){
		formPlane.componentTypeahead(formJson.id,typeaheadArr);
	}
	//tree-select类型
	if(!$.isEmptyObject(treeSelectJson)){
		treeUI.componentSelectPlane(formJson.id,treeSelectJson);
	}
	//person-select类型
	if(!$.isEmptyObject(personSelectJson)){
		personUI.componentPersonPlane(formJson.id,personSelectJson);
	}

	//初始化select组件
	$('.form-item.select select').selectBoxIt().on('open', function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	});

	$('.form-item.selectplane select').selectBoxIt().on('open',function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	})

	if(select2Arr.length>0){
		formPlane.componentSelect2(formJson.id,select2Arr);
	}

	if(textBtnArr.length > 0 ){
		formPlane.componentTextBtnHandler(formJson.id,textBtnArr);
	}
	//如果有增查一体输入框
	if(addSelectInputConfig!=false){
		addSelectInputConfig.fullID = 'form-'+formJson.id+'-'+addSelectInputConfig.id;
		nsUI.addSearchInput.init(addSelectInputConfig);
	}
	//如果有组织架构树
	if(organizaSelectConfig!=false){
		organizaSelectConfig.fullID = 'form-'+formJson.id+'-'+organizaSelectConfig.id;
		nsUI.organizaSelect.init(organizaSelectConfig);
	}
	//tooltip
	if(isHaveTooltip){
		//$('#form-'+formJson.id+' [data-toggle="tooltip"]').tooltip();
	}
	//激活popover
	if(isHavePopover){
		$('#form-'+formJson.id+' [data-toggle="popover"]').popover();
	}
	
	//给带按钮组件的按钮添加事件
	for(var textbtnI = 0; textbtnI<btnHandlerArr.length; textbtnI++){
		var clickInputID = '#form-'+formJson.id+'-'+btnHandlerArr[textbtnI].id;
		$(clickInputID).closest('.input-group').find('.btn').off('click');
		$(clickInputID).closest('.input-group').find('.btn').on('click',function(ev){
			var clickFormID = $(ev.target).closest('form').attr('id');
			var clickInputID = $(ev.target).closest('.input-group').find('input').attr('id');
			clickInputID = clickInputID.substr(clickFormID.length+1, clickInputID.length);
			clickFormID = clickFormID.substr(5,clickFormID.length);
			var btnClickHandler = formPlane.data[clickFormID].formInput[clickInputID].btnhandler;
			btnClickHandler();
		});
	}
	if(changeHandlerArr.length > 0){
		formPlane.componentHandler(formJson.id,changeHandlerArr);
	}
	if(selectHandlerArr.length > 0){
		formPlane.validateSelectPlane(formJson.id,selectHandlerArr);
	}
	if(!$.isEmptyObject(selectDateJson)){
		formPlane.selectDatePlane(formJson.id,selectDateJson);
	}
	if(!$.isEmptyObject(daterangepickerJson)){
		formPlane.daterangepickerPlane(formJson.id,daterangepickerJson);
	}
	if(provSelectHandlerArr.length > 0){
		provinceSelect.init(formJson.id,provSelectHandlerArr);
	}
	if(selectProvinceArr.length>0){
		provinceSelect.initSelect.init(formJson.id,selectProvinceArr);
	}
	if(inputSelectArr.length > 0){
		formPlane.inputSelect(formJson.id,inputSelectArr);
	}
	formPlane.selectMorePlane(formJson.id);
}
formPlane.init = formPlane.formInit;

formPlane.inputSelect = function(formID,inputSelectArr){
	for(var i=0; i<inputSelectArr.length; i++){
		var config = inputSelectArr[i];
		config.formID = formID;
		config.fullID = 'form-'+formID+'-'+inputSelectArr[i].id;
		nsUI.inputSelect.init(config);
	}
}

formPlane.radioTooltipPlane = function(formID,radioTooltipJson){
	for(var radioT in radioTooltipJson){
		var radioTooltip = radioTooltipJson[radioT].isTooltip ?radioTooltipJson[radioT].isTooltip:false;
		if(radioTooltip){
			var radioTooltipID = 'form-'+formID+'-'+radioT;
			$('input[name="'+radioTooltipID+'"]').closest('label').tooltip();
		}
	}
}

//日期区间
formPlane.daterangepickerPlane = function(formID,daterangepickerJson){
	var $daterangepickerDom = {};
	for(var rangeI in daterangepickerJson){
		var rangepickerID = 'form-'+formID+'-'+rangeI;
		var daterangeOpts = {};
		daterangeOpts = {
			format: 	language.date.rangeFormat,
			separator: 	language.date.separator,
			applyClass : 'btn-sm btn-success',
			cancelClass : 'btn-sm btn-default',
			locale: {

				applyLabel: language.date.applyLabel,
				cancelLabel: language.date.cancelLabel,
				fromLabel: language.date.fromLabel,
				toLabel:language.date.toLabel,
				monthNames:language.date.monthNames,
				daysOfWeek:language.date.daysOfWeek

			},
		}
		$daterangepickerDom[rangeI] = $('#'+rangepickerID).daterangepicker(daterangeOpts);
	}
}
formPlane.selectMorePlane = function(formID){
	$('#form-'+formID+' [commonplane="moreSelectPlane"] button').on('click',function(ev){
		var btnFid = Number($(this).attr('fid'));
		var formID = $(ev.target).closest('form').attr('id');
		var planeID = $(ev.target).closest('.form-item').attr('ns-id');
		var $elementParentDom = $(ev.target).closest('.form-td');
		formID = formID.substr(5,formID.length);
		var returnFunc = formPlane.data[formID].formInput[planeID].button[btnFid].handler;
		if(returnFunc){
			returnFunc(planeID,$elementParentDom);
		}
	})
} 

//下拉框文本组件
formPlane.selectDatePlane = function(formID,selectDateJson){
	var $selectDateSelectDom = $('select[nstype="selectDate-caseSelect"]');
	$selectDateSelectDom.selectBoxIt().on('change',function(ev){
		var selectID = $(this).attr('id');
		var selectValue = $(this).val().trim();
		var selectText = $(this).find('option:selected').text().trim();
		var formID = $(ev.target).closest('form').attr('id');
		selectID = selectID.substr(formID.length+1,selectID.length);
		formID = formID.substr(5,formID.length);
		var returnID = $(ev.target).closest('.form-item').attr('ns-id');
		var returnFunc = formPlane.data[formID].formInput[returnID].caseSelect.changeHandler;
		if(returnFunc){
			var selectFunc = returnFunc(returnID);
			selectFunc(selectValue,selectText);
		}
	});
	$('input[nstype="selectDate-date"]').datepicker({
		format: 	language.date.selectFormat,
		autoclose:true,
		todayHighlight:true,
	});
	var daterangeOpts = {};
	daterangeOpts = {

		format:'YYYY-MM-DD',
		separator:language.date.separator,

		applyClass : 'btn-sm btn-success',
        cancelClass : 'btn-sm btn-default',
		locale: {

			applyLabel:language.date.applyLabel,
			cancelLabel:language.date.cancelLabel,
			fromLabel:language.date.fromLabel,
			toLabel:language.date.toLabel,
			monthNames:language.date.monthNames,
			daysOfWeek:language.date.daysOfWeek

		},
	}
	var $daterangepickerDom = $('div[nstype="selectDate-daterange"]');
	$daterangepickerDom.daterangepicker(daterangeOpts,function(start,end,label){
		var daterangevalue = start.format(language.date.rangeFormat)+language.date.separator+end.format(language.date.rangeFormat);
		$daterangepickerDom.children('span').text(daterangevalue);
	});
	$daterangepickerDom.on('apply.daterangepicker',function(ev,picker){

		var startRange = picker.startDate.format('YYYY-MM-DD');
 		endRange = picker.endDate.format('YYYY-MM-DD');
 		var daterangevalue = startRange + language.date.separator + endRange;

 		$daterangepickerDom.children('span').text(daterangevalue);
	});
}

formPlane.validateForm = function(formID,validateArr,formType){
	//保存Form对象基本数据
	var formDataID = formID;
	var formInput = {};
	var addRulesArr = [];
	for(var formInputI = 0; formInputI<validateArr.length; formInputI++){
		var formInputID = formDataID+'-'+validateArr[formInputI].id;
		formInputID = formInputID.substr(formDataID.length+1,formInputID.length);
		if(validateArr[formInputI].type == 'selectText' || validateArr[formInputI].type == 'textSelect'){
			//下拉框文本
			var inputID = validateArr[formInputI].text.id;
			var selectID = validateArr[formInputI].select.id;
			var inputJson = validateArr[formInputI].text;
			var selectJson = validateArr[formInputI].select;
			addRulesArr.push(inputJson,selectJson);
		}else if(validateArr[formInputI].type == 'selectDate'){
			//下拉框日期
			var caseSelectJson = validateArr[formInputI].caseSelect;
			var textJson = validateArr[formInputI].text;
			var dateJson = validateArr[formInputI].date;
			dateJson.id = dateJson.id;
			var daterangeJson = validateArr[formInputI].daterange;
			daterangeJson.id = daterangeJson.id;
			addRulesArr.push(caseSelectJson,textJson,dateJson,daterangeJson);
		}else if(validateArr[formInputI].type == 'selectSelect'){
			//下拉框下拉框
			var firstSelectJson = validateArr[formInputI].firstSelect;
			var secondSelectJson = validateArr[formInputI].secondSelect;
			addRulesArr.push(firstSelectJson,secondSelectJson);
		}else if(validateArr[formInputI].type == 'datetime'){
			//日期时间
			var requiredStr = '';
			if(validateArr[formInputI].rules){
				requiredStr = 'required';
			}
			var dateJson = {};
			dateJson.id = formInputID + '-date';
			dateJson.type = 'text';
			dateJson.rules = requiredStr;
			//formInput[dateJson.id] = dateJson;
			addRulesArr.push(dateJson);

			var timeJson = {};
			timeJson.id = formInputID + '-time';
			timeJson.type = 'text';
			timeJson.rules = requiredStr;
			//formInput[timeJson.id] = timeJson;
			addRulesArr.push(timeJson);
		}
		var formInputValue = validateArr[formInputI];
		formInput[formInputID] = formInputValue;
	}
	//保存form类型 默认为form
	var typeStr = 'form'
	if(typeof(formType)=='string'){
		if(formType == 'dialog' || formType == 'form'){
			typeStr = formType;
		}else{

			nsAlert(language.common.fromplane.tableTypeDefinition,'error');

		}
	}
	formPlane.data[formDataID] = {id:formDataID,formInput:formInput, formType:typeStr};
	//添加验证规则
	var validateRulesArr = $.merge(validateArr,addRulesArr);
	var rules = commonConfig.getRules(validateRulesArr,formDataID);
	var validateObj = $("#form-"+formDataID).validate(rules);
	formPlane.rules[formDataID] = rules.rules; //验证规则
}
formPlane.validateSelectPlane = function(formID,selectArr){
	for(var selectI = 0; selectI < selectArr.length; selectI++){
		var selectID = 'form-'+formID+'-'+selectArr[selectI].id;
		$('#'+selectID).selectBoxIt().on('close',function(ev){
			var formID = $(ev.target).closest('form').attr('id');
			var selectID = $(ev.target).closest('select').attr('id');

			var changeSelectID = selectID.substr(formID.length+1, selectID.length);
			var changeFormID = formID.substr(5,formID.length);
			var changeHandler = formPlane.data[changeFormID].formInput[changeSelectID].changeHandler;
			var returnValue = $(ev.target).closest('select').val().trim();
			var returnText = $(ev.target).find('option:selected').text().trim();
			
			var SelectBoxItTextID = selectID+'SelectBoxItText';
			$('#'+SelectBoxItTextID).attr('data-val',returnValue);
			$('#'+SelectBoxItTextID).text(returnText);
			if(formPlane.data[changeFormID].formInput[changeSelectID].rules){
				if(formPlane.data[changeFormID].formInput[changeSelectID].rules.indexOf('select')>-1){
					if(returnValue){
						formPlane.fillValid[changeFormID][selectID] = true;
						$(ev.target).closest('div').find('.has-error').remove();
					}else{
						formPlane.fillValid[changeFormID][selectID] = false;
					}
				}
			}
			if(changeHandler){
				changeHandler(returnValue,returnText);
			}
		});
	}
}
formPlane.init = formPlane.formInit;
//清空操作
formPlane.clearData = function(formID){
	var newFormID = 'form-'+formID;
	var formData = formPlane.data[formID].formInput;
	for(var inputID in formData){
		var currentKeyID = newFormID + '-' + inputID;
		var currentType = formData[inputID].type;
		switch(currentType){
			case "select":
				var id = "";
				var value = "";
				if(formData[inputID].rules){

					value = language.datatable.fillStatus.required;

				}else{

					value = language.datatable.fillStatus.optional;

				}
				var textField = formData[inputID].textField;
				var valueField = formData[inputID].valueField;
				var defaultSelected = formData[inputID].value; 
				var selectElementID = currentKeyID + 'SelectBoxItText';
				$('#'+currentKeyID).val(id);
				$('#'+currentKeyID).closest('div').find('#'+selectElementID).text(value);
				$('#'+currentKeyID).closest('div').find('#'+selectElementID).attr('data-val',id);
				break;
			case "selectText":
				$('#'+currentKeyID+'CompareType').val('');
				var selectElementID = currentKeyID + 'CompareTypeSelectBoxItText';

				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).text(language.datatable.fillStatus.optional);

				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).attr('data-val','');
				$('#'+currentKeyID+'DefaultValue1').val('');
				break;
			case "selectSelect":
				$('#'+currentKeyID+'CompareType').val('');
				var selectElementID = currentKeyID + 'CompareTypeSelectBoxItText';

				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).text(language.datatable.fillStatus.optional);

				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).attr('data-val','');
				
				$('#'+currentKeyID+'DefaultValue1').val('');
				var selectElementID = currentKeyID + 'DefaultValue1SelectBoxItText';

				$('#'+currentKeyID+'DefaultValue1').closest('div').find('#'+selectElementID).text(language.datatable.fillStatus.optional);

				$('#'+currentKeyID+'DefaultValue1').closest('div').find('#'+selectElementID).attr('data-val','');
				
				break;
			case "selectDate":
				$('#'+currentKeyID+'CompareType').val('');
				var selectElementID = currentKeyID + 'CompareTypeSelectBoxItText';

				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).text(language.datatable.fillStatus.optional);

				$('#'+currentKeyID+'CompareType').closest('div').find('#'+selectElementID).attr('data-val','');
				$('#'+currentKeyID+'DefaultValue1Temp').val('');
				$('#'+currentKeyID+'DefaultValue1').val('');
				$('#'+currentKeyID+'DefaultValue2').val('');
				break;
			case "select2":
				$select2Change[currentKeyID].val('').trigger("change");
				break;
			case "datetime":
				$('#'+currentKeyID+'-date').val('');
				$('#'+currentKeyID+'-time').val('');
				break;
			case "radio":
			case "checkbox":
				$('input[name="'+currentKeyID+'"]').removeAttr('checked');
				break;
			case "upload":
				$('#'+currentKeyID).html('');
				var uploadFile = formPlane.dropzoneGetFile[inputID];
				var $uploadFileDom = formPlane.dropzoneFileJson[inputID];
				if(!$.isEmptyObject(uploadFile)){
					for(var fileI in uploadFile){
						$uploadFileDom.removeFile(uploadFile[fileI]);
					}
				}
				break;
			case "tree-select":
				$('#'+currentKeyID).val('');
				$('#'+currentKeyID).attr('value','');
				$('#'+currentKeyID).attr('nodeid','');
				break;
			default:
				$('#'+currentKeyID).val('');
				break;
		}
	}
}
//重置操作
formPlane.resetData = function(formID){
	var newFormID = 'form-'+formID;
	var formData = formPlane.data[formID].formInput;
	for(var inputID in formData){
		var currentKeyID = newFormID + '-' + inputID;
		if(formData[inputID].type == 'select'){
			var id = "";
			var value = "";
			if(formData[inputID].rules){

				value = language.datatable.fillStatus.required;

			}else{

				value = language.datatable.fillStatus.optional;

			}
			var textField = formData[inputID].textField;
			var valueField = formData[inputID].valueField;
			var defaultSelected = formData[inputID].value; 
			var subdata = formData[inputID].subdata;
			for(var selectI in subdata){
				var textSelect = 'text';
				if(typeof(textField)=='undefined'){
					textSelect = 'text';
				}else{
					textSelect = textField;
				}
				var valueSelect = 'id';
				if(typeof(valueField)=='undefined'){
					valueSelect = 'id';
				}else{
					valueSelect = valueField;
				}
				if(subdata[selectI].selected){
					id = subdata[selectI][valueSelect];
					value = subdata[selectI][textSelect];
				}else if(typeof(defaultSelected)!='undefined'){
					if(subdata[selectI][valueSelect] == defaultSelected){
						id = subdata[selectI][valueSelect];
						value = subdata[selectI][textSelect];
					}
				}
			}
			var selectElementID = currentKeyID + 'SelectBoxItText';
			$('#'+currentKeyID).val(id);
			$('#'+currentKeyID).closest('div').find('#'+selectElementID).text(value);
			$('#'+currentKeyID).closest('div').find('#'+selectElementID).attr('data-val',id);
		}else if(formData[inputID].type == 'radio' || formData[inputID].type == 'checkbox'){
			$('input[name="'+currentKeyID+'"]').removeAttr('checked');
		}else{
			if(typeof(formData[inputID].value)!='undefined'){
				$('#'+currentKeyID).val(formData[inputID].value);
			}else{
				$('#'+currentKeyID).val('');
			}
		}
	}
}
formPlane.dropzoneFileJson = {};//存放的是当前上传文件的dom,在清空form表单的时候会用到
formPlane.dropzoneGetFile = {};//存放的是当前上传文件的file,清空删除文件都会用到，一个文件可以上传多个，所以存放每个下标和file对应值
formPlane.tempFileJson = {};//存放的是文件数量
formPlane.dropzoneStr = {};//一个表单支持多个上传组件，{'upload1':[],'upload2':[]} 
formPlane.uploadImageJson = {}; //

formPlane.disabledDropzone = function(formID,elementID){
	$('#form-'+formID+'-'+elementID).parent().toggleClass('upload-disabled');
}
formPlane.componentUpload = function(formID,uploadHanlderJson){
	var tempFormID = 'form-'+formID;
	for(var fileIndex in uploadHanlderJson){
		formPlane.dropzoneFileJson[fileIndex] = {};
		formPlane.dropzoneGetFile[fileIndex] = {};
		formPlane.dropzoneStr[fileIndex] = [];
		var tempFileID = tempFormID + '-' + fileIndex;
		var currentFileID = fileIndex;
		var acceptedFiles = typeof(uploadHanlderJson[currentFileID].supportFormat) == 'undefined' ? "":uploadHanlderJson[currentFileID].supportFormat;
		var uploadMultiple = typeof(uploadHanlderJson[currentFileID].ismultiple) == 'undefined' ? false:uploadHanlderJson[currentFileID].ismultiple;
		var maxFiles = typeof(uploadHanlderJson[currentFileID].isAllowFiles) == 'undefined' ? 1:uploadHanlderJson[currentFileID].isAllowFiles;
		var defaultFilesLength = 0;
		if($.isArray(uploadHanlderJson[currentFileID].subdata)){
			var dropArr = uploadHanlderJson[currentFileID].subdata;
			defaultFilesLength = dropArr.length;
			//是否定义了valueField字段
			var uploadIdField = '';
			if(typeof(uploadHanlderJson[currentFileID].valueField)=='string'){
				if(uploadHanlderJson[currentFileID].valueField !== ''){
					uploadIdField = uploadHanlderJson[currentFileID].valueField;
				}
			} 
			for(var dropI=0; dropI<dropArr.length; dropI++){
				if(uploadIdField !== ''){
					formPlane.dropzoneStr[fileIndex].push(dropArr[dropI][uploadIdField]);
				}
			}
		}
		var fileI = 0;//初始化文件个数
		formPlane.tempFileJson[fileIndex] = defaultFilesLength;
		//判断是否含有只读属性
		var isReadonly = typeof(uploadHanlderJson[currentFileID].readonly) == 'boolean' ?uploadHanlderJson[currentFileID].readonly:false;
		if(isReadonly){
			//只读属性为真，则只可以进行下载不能上传和删除
			var downloadJson = {id:tempFileID,handler:uploadHanlderJson[currentFileID].downloadHandler}
			formPlane.dropzoneDownloadHandler(downloadJson);
		}else{		
			$('#'+tempFileID).dropzone({
				url: uploadHanlderJson[currentFileID].uploadSrc,
				paramName:tempFileID,
				acceptedFiles:acceptedFiles,
				uploadMultiple:uploadMultiple,	
				maxFiles:maxFiles,
				dictDefaultMessage:language.netstarDialog.upload.dictDefaultMessage,
				dictMaxFilesExceeded:language.netstarDialog.upload.dictMaxFilesExceeded,
				addRemoveLinks:true,//添加移除文件
				dictInvalidFileType:language.netstarDialog.upload.formatNotSupported,
				dictResponseError:language.netstarDialog.upload.dictResponseError,
				dictInvalidFileType:language.netstarDialog.upload.nameTypeNotMatch,
				autoProcessQueue:true,//不自动上传
				accept:function(file,done){
					var fileID = $(this.element).attr('id');
					var changeFormID = $('#'+fileID).closest('form').attr('id');
					var currentFileID = fileID.substr(changeFormID.length+1, fileID.length);
					var maxFilesLength = uploadHanlderJson[currentFileID].isAllowFiles;
					var tempFileLength = formPlane.tempFileJson[currentFileID];
					if(maxFilesLength == tempFileLength){
						done(language.netstarDialog.upload.maxFiles[0]+maxFilesLength+language.netstarDialog.upload.maxFiles[1]);
					}else{
						done();
					}
				},
				init:function(){
					var dropzoneObj = this;
					var filename = $(this.element).attr('id');
					var changeFormID = $('#'+filename).closest('form').attr('id');
					var currentFileID = filename.substr(changeFormID.length+1, filename.length);
					var returnObj = {};
					returnObj[filename] = {};
					returnObj[filename]['downloadhandler'] = uploadHanlderJson[currentFileID]['downloadHandler'];
					returnObj[filename]['delFileHandler'] = uploadHanlderJson[currentFileID]['delFileHandler'];					
					if(typeof(uploadHanlderJson[currentFileID].subdata)!='undefined'){
						formPlane.dropzoneHandler(dropzoneObj,returnObj);
					}
					formPlane.dropzoneFileJson[fileIndex] = dropzoneObj;
				},
				//添加了一个文件时发生
				addedfile:function(file){
					var fileID = $(this.element).attr('id');
					var size = parseInt(file.size/1024, 10);
					size = size < 1024 ? (size + " KB") : (parseInt(size/1024, 10) + " MB");
				},
				//一个文件被移除时发生上传时按一定间隔发生这个事件。
				//第二个参数为一个整数，表示进度，从 0 到 100。
				//第三个参数是一个整数，表示发送到服务器的字节数。
				//当一个上传结束时，Dropzone 保证会把进度设为 100。
				//注意：这个函数可能被以同一个进度调用多次。
				/*uploadprogress: function(file, progress, bytesSent)
				{
					console.log('progress');
				},*/
				//一个文件被移除时发生
				removedfile:function(file){
					var filename = $(this.element).attr('id');
					var changeFormID = $('#'+filename).closest('form').attr('id');
					var uploadFormID = changeFormID.substr(5,changeFormID.length);
					var currentFileID = filename.substr(changeFormID.length+1, filename.length);
					if(uploadHanlderJson[currentFileID].rules){
						if($('#'+filename).children('span').length > 0){
							formPlane.fillValid[uploadFormID][filename] = true;
						}else{
							formPlane.fillValid[uploadFormID][filename] = false;
						}
					}
					formPlane.tempFileJson[currentFileID] = $('#'+filename).children('span').length;
					if(formPlane.tempFileJson[currentFileID] == 0){
						formPlane.dropzoneGetFile[currentFileID] = {};
					}
				},
				//文件成功上传之后发生，第二个参数为服务器响应
				success: function(file,data)
				{
					var filename = $(this.element).attr('id');
					var changeFormID = $('#'+filename).closest('form').attr('id');
					var currentFileID = filename.substr(changeFormID.length+1, filename.length);
					var uploadFormID = changeFormID.substr(5,changeFormID.length);
					/*******验证开始start***************/
					formPlane.fillValid[uploadFormID][filename] = true;
					/*******验证结束end***************/

					var dropzoneObj = this;
					var receiveFileJson;
					/*******拿到返回值start***************/
					var returnObj = {};
					returnObj.data = data;
					returnObj.file = file;
					returnObj.fileInputId = currentFileID;
					if(typeof(uploadHanlderJson[currentFileID].changeHandler)!='undefined'){
						var uploadFunc = uploadHanlderJson[currentFileID].changeHandler;
						receiveFileJson = uploadFunc(returnObj);
					}
					/*******拿到返回值end***************/
					var loadfilevalue = '';//返回名称
					var loadFileID = '';//返回id
					if(typeof(receiveFileJson) == 'object'){
						var fileShowID = uploadHanlderJson[currentFileID]['valueField'];
						var fileShowvalueID = uploadHanlderJson[currentFileID]['textField'];
						loadFileID = receiveFileJson[fileShowID];
						loadfilevalue = receiveFileJson[fileShowvalueID];
					}else{
						//返回格式不对
					}
					if(loadFileID !== ''){formPlane.dropzoneStr[currentFileID].push(loadFileID)}//存放上传文件值
					var loadFileHtml = '<span class="dropzone-upload-span">'
									+'<a href="javascript:void(0)" id="'+loadFileID+'" ns-file="'+fileI+'" class="upload-close">'
									+'</a>'
									+'<a href="javascript:void(0)" id="'+loadFileID+'" class="upload-title">'
									+loadfilevalue+'</a>'
									+'</span>';
					$('#'+filename).append(loadFileHtml);
					formPlane.tempFileJson[currentFileID] = $('#'+filename).children('span').length;
					formPlane.dropzoneGetFile[currentFileID][fileI] = file;
					fileI++;
					var returnObj = {};
					returnObj[filename] = {};
					returnObj[filename]['downloadhandler'] = uploadHanlderJson[currentFileID]['downloadHandler'];
					returnObj[filename]['delFileHandler'] = uploadHanlderJson[currentFileID]['delFileHandler'];
					formPlane.dropzoneHandler(dropzoneObj,returnObj);
				},
				error: function(file,errorMessage)
				{
					nsAlert(errorMessage);
				}
			});
		}
	}
}
//只可以下载的方法
formPlane.dropzoneDownloadHandler = function(downloadJson){
	var fileID = downloadJson.id;
	var handler = downloadJson.handler;
	$('#'+fileID+' a.upload-title').off('click');
	$('#'+fileID+' a.upload-title').on('click',function(ev){
		var downloadID = $(this).attr('id');
		if(typeof(handler)=='function'){
			handler(downloadID);
		}
	})
}
//上传文件的删除方法
formPlane.dropzoneHandler = function(dropzoneObj,returnObj){
	var fileID = $(dropzoneObj.element).attr('id');
	$('#'+fileID+' a.upload-title').off('click');
	$('#'+fileID+' a.upload-title').on('click',function(ev){
		var downloadID = $(this).attr('id');
		if(typeof(returnObj[fileID]['downloadhandler'])!='undefined'){
			var downloadHandler = returnObj[fileID]['downloadhandler'];
			downloadHandler(downloadID);
		}
	})
	$('#'+fileID+' a.upload-close').off('click');
	$('#'+fileID+' a.upload-close').on('click',function(ev){
		$(this).closest('span').remove();
		var currID = $(this).attr('id');
		var delFid = $(this).attr('ns-file');
		var changeFormID = $('#'+fileID).closest('form').attr('id');
		var uploadFormID = changeFormID.substr(5,changeFormID.length);
		var currentFileID = fileID.substr(changeFormID.length+1, fileID.length);

		//删除文件判断是否在所要存储的数据当中
		var valueArr = formPlane.dropzoneStr[currentFileID];
		if($.isArray(valueArr)){
			for(var valueI=0; valueI<valueArr.length; valueI++){
				if(valueArr[valueI] == currID){
					valueArr.splice(valueI,1);
				}
			}
		}
		formPlane.dropzoneStr[currentFileID] = valueArr;
		var file = formPlane.dropzoneGetFile[currentFileID][delFid];
		if(file){
			dropzoneObj.removeFile(file);
		}else{
			var uploadRules = formPlane.data[uploadFormID].formInput[currentFileID].rules;
			if(uploadRules){
				if($('#'+fileID).children('span').length > 0){
					formPlane.fillValid[uploadFormID][fileID] = true;
				}else{
					formPlane.fillValid[uploadFormID][fileID] = false;
				}
			}
			formPlane.tempFileJson[currentFileID] = $('#'+fileID).children('span').length;
			if(formPlane.tempFileJson[currentFileID] == 0){
				formPlane.dropzoneGetFile[currentFileID] = {};
			}
		}
		if(typeof(returnObj[fileID]['delFileHandler'])!='undefined'){
			var removedFileHandler = returnObj[fileID]['delFileHandler'];
			removedFileHandler(currID);
		}
	})
}
//日期时间类型
formPlane.componentDatetime = function(formID,dateTimeFormatArr){
	for(var datetimeIndex in dateTimeFormatArr){
		var datetimeID = 'form-'+formID+'-'+dateTimeFormatArr[datetimeIndex].id;
		var dateID = 'form-'+formID+'-'+dateTimeFormatArr[datetimeIndex].id+'-date';
		var timeID = 'form-'+formID+'-'+dateTimeFormatArr[datetimeIndex].id+'-time';
		var dateFormat = language.date.selectFormat;
		var isShowseconds = true;
		if(typeof(dateTimeFormatArr[datetimeIndex].format)=='string'){
			var formatStr = dateTimeFormatArr[datetimeIndex].format;
			dateFormat = formatStr.split(' ')[0];
			if(typeof(formatStr.split(' ')[1])=='string'){
				//存在时间类型
				var timeFormat = formatStr.split(' ')[1];
				if(timeFormat.indexOf('ss') == -1){isShowseconds = false}
			}
		}
		$('#'+timeID).attr('seconds',isShowseconds);
		/**/
		var isDisabled = typeof(dateTimeFormatArr[datetimeIndex].disabled) == 'boolean' ? dateTimeFormatArr[datetimeIndex].disabled : false;
		if(isDisabled == false){	
			$('#'+dateID).off('focus');
			$('#'+dateID).on('focus',function(){
				var tempID = $(this).attr('id');
				var timeID = tempID.substr(0,tempID.length-5);
				timeID = timeID+'-time';
				$('#'+timeID).timepicker('hideWidget');
			});	
			$('#'+dateID).datepicker({
				format:dateFormat,
				autoclose:true,
				todayHighlight:true,
			}).on('changeDate', function(ev){
				var changeFormID = $(ev.target).closest('form').attr('id');  //formID
				var changeDateID = $(this).attr('id'); //dateID
				var changeDateTimeID = changeDateID.substr(changeFormID.length+1,changeDateID.length);
				changeDateTimeID = changeDateTimeID.substr(0,changeDateTimeID.length-5);
				changeFormID = changeFormID.substr(5,changeFormID.length);
				var changeHandler = formPlane.data[changeFormID].formInput[changeDateTimeID].changeHandler;
				var getTimerID = 'form-' + changeFormID + '-' + changeDateTimeID +'-time';
				var getTimervalue = $('#'+getTimerID).val().trim();
				if(typeof(changeHandler)=='function'){
					var changeDateVal = $(this).val().trim();
					var datetimervalue = changeDateVal + ' ' + getTimervalue;
					var returnObj = {};
					returnObj.datevalue = changeDateVal;
					returnObj.dateID = changeDateID;
					returnObj.timeValue = getTimervalue;
					returnObj.timeID = getTimerID;
					returnObj.datetimerID = changeDateTimeID;
					returnObj.datetimervalue = datetimervalue;
					changeHandler(returnObj);
				}
			});
			$('#'+timeID).timepicker({
				minuteStep: 1,//分钟间隔
				template: 'dropdown',//是否可选择 false,modal为只读
				showSeconds:isShowseconds,//是否显示秒
				secondStep:1,//秒间隔
				showMeridian:false,//24小时制  true为12小时制
				defaultTime: false,  //默认时间
				showInputs:false,
			}).on('hide.timepicker',function(ev){
				var changeFormID = $(ev.target).closest('form').attr('id');
				var currentTimeID = $(this).attr('id');
				var changeDateTimeID = currentTimeID.substr(changeFormID.length+1,currentTimeID.length);
				changeDateTimeID = changeDateTimeID.substr(0,changeDateTimeID.length-5);
				changeFormID = changeFormID.substr(5,changeFormID.length);
				var changeHandler = formPlane.data[changeFormID].formInput[changeDateTimeID].changeHandler;
				var getDateID = 'form-' + changeFormID + '-' + changeDateTimeID + '-date';
				var getDatevalue = $('#'+getDateID).val().trim();
				if(typeof(changeHandler)!='undefined'){
					var changeDateVal = $(this).val().trim();
					var datetimervalue = getDatevalue + ' ' + changeDateVal;
					var returnObj = {};
					returnObj.datevalue = getDatevalue;
					returnObj.dateID = getDateID;
					returnObj.timeValue = changeDateVal;
					returnObj.timeID = currentTimeID;
					returnObj.datetimerID = changeDateTimeID;
					returnObj.datetimervalue = datetimervalue;
					changeHandler(returnObj);
				}
			}).on('changeTime.timepicker',function(ev){
				var timeStr = ev.time.hours;
				if(Number(ev.time.minutes) < 10){
					timeStr += ':0'+ev.time.minutes;
				}else{
					timeStr +=':'+ev.time.minutes;
				}
				var isShowseconds = $(this).attr('seconds');
				if(isShowseconds == 'true'){
					if(Number(ev.time.seconds) < 10){
						timeStr += ':0'+ev.time.seconds;
					}else{
						timeStr += ':'+ev.time.seconds;
					}
				}
				$(this).val(timeStr);
			});
		}
	}
}

formPlane.componentDate = function(formID,dateFormatArr){
	for(var format in dateFormatArr){
		var currentFormatObj = $('#form-'+formID+'-'+dateFormatArr[format].id);
		var iconDatePickerObj = currentFormatObj.closest('div');
		iconDatePickerObj = iconDatePickerObj.find('.input-group-addon a');
		iconDatePickerObj.on('click',function(ev){
			var dateFormatObj = $(ev.target).closest('.input-group').children('input');
			dateFormatObj.datepicker('show');
		})
		if(typeof(dateFormatArr[format].format)=='undefined'){
			dateFormatArr[format].format = 'yyyy-mm-dd';
		}
		var datepickerOption = {
			autoclose:true,
			todayHighlight:true,
			format:dateFormatArr[format].format
		};
		//初始化日期组件	
		$('#form-'+formID+'-'+dateFormatArr[format].id).datepicker({
			autoclose:true,
			todayHighlight:true,
			format:dateFormatArr[format].format,
		}).on('changeDate', function(ev){
			var changeFormID = $(ev.target).closest('form').attr('id');
			var changeInputID = $(this).attr('id');
			changeInputID = changeInputID.substr(changeFormID.length+1, changeInputID.length);
			changeFormID = changeFormID.substr(5,changeFormID.length);
			var changeHandler = formPlane.data[changeFormID].formInput[changeInputID].changeHandler;
			if(typeof(changeHandler)!='undefined'){
				var changeDateVal = $(this).val().trim();
				var returnObj = {};
				returnObj.id = changeInputID;
				returnObj.value = changeDateVal;
				changeHandler(returnObj);
			}
		}).on('hide', function(event) {
			//屏蔽掉默认的modal.hide事件
			event.preventDefault();
			event.stopPropagation();
		});
	}
}
formPlane.componentTypeahead = function(formID,typeaheadArr){
	for(var typeaheadIndex in typeaheadArr){
		var typeaheadID = '#form-'+formID+'-'+typeaheadArr[typeaheadIndex].id;
		var typeaheadOrder = "asc";
		if(typeof(typeaheadArr[typeaheadIndex].order)!='undefined'){
			typeaheadOrder = typeaheadArr[typeaheadIndex].order;
		}
		var typeaheadSource = {};
		if(typeof(typeaheadArr[typeaheadIndex].sourceSrc)!='undefined'){
			if(typeaheadArr[typeaheadIndex].sourceSrc != ''){
				typeaheadSource = {
					ajax:{
						url:typeaheadArr[typeaheadIndex].sourceSrc,
						path:typeaheadArr[typeaheadIndex].dataSrc
					}
				};
			}else{
				//ajax为空，读自定义数据
				//typeaheadSource = {data:typeaheadArr[typeaheadIndex].selfData};
				typeaheadSource[typeaheadArr[typeaheadIndex].dataSrc] = {
					data: typeaheadArr[typeaheadIndex].selfData
				}
				/*typeaheadSource = {
					country: {
                		data: typeaheadArr[typeaheadIndex].selfData
            		},
            		capital: {
                		data: data.capitals
            		}
            	};*/
			}
		}
		typeof $.typeahead === 'function' && $.typeahead({
			input: typeaheadID,
			minLength: 1,
			maxItem: 20,
			order: typeaheadOrder,
			group: true,
			maxItemPerGroup: 3,//每组显示结果数
			groupOrder: function () {
				var scope = this,
				sortGroup = [];

				for (var i in this.result) {
					sortGroup.push({
						group: i,
						length: this.result[i].length
					});
				}

				sortGroup.sort(
					scope.helper.sort(
						["length"],
						false, // false = desc, the most results on top
						function (a) {
							return a.toString().toUpperCase()
						}
					)	
				);

				return $.map(sortGroup, function (val, i) {
					return val.group
				});
			},
            hint: true,
			dropdownFilter: typeaheadArr[typeaheadIndex].dropdownFilter,
			source:typeaheadSource,
			/*source: {
				ajax:{
					url:getRootPath() +'/assets/json/shortkey.json',
					path:typeaheadArr[typeaheadIndex].dataSrc
				}
			},*/
			callback: {
				onInit: function(node){
					
				},
				//键盘触发事件
				onNavigateBefore:function(node,query,event){console.log(query);
					if (~[38,40].indexOf(event.keyCode)) {
						event.preventInputChange = true;
					}
				},
				onSearch:function(node,query){
					var keyID = $(node).attr('id');
					for(var kID in formPlane.fillValid[formID]){
						if(kID == keyID){
							$('#'+kID).closest('span').find('.has-error').remove();
							if(query == ''){
								formPlane.fillValid[formID][kID] = false;
								$('#'+kID).closest('span').append('<label class="has-error">必填</label>');
							}else{
								formPlane.fillValid[formID][kID] = true;
							}
						}
					}
				},
				onResult: function (node, query, result, resultCount) {
					if (query === "") return;
						var text = "";
						var isQuery = true;
					if (result.length > 0 && result.length < resultCount) {
						text = "Showing <strong>" + result.length + "</strong> of <strong>" + resultCount + '</strong> elements matching "' + query + '"';
						isQuery = true;
					} else if (result.length > 0) {
						text = 'Showing <strong>' + result.length + '</strong> elements matching "' + query + '"';
						isQuery = true;
					} else {
						text = 'No results matching "' + query + '"';
						isQuery = false;
					}
					var queryID = $(node).attr('id');
					$('#'+queryID).closest('span').find('.has-error').remove();
					if(isQuery == false){
						$('#'+queryID).closest('span').append('<label class="has-error">未找到匹配值</label>');
					}
					for(var kID in formPlane.fillValid[formID]){
						if(kID == queryID){
							formPlane.fillValid[formID][kID] = isQuery;
						}
					}
					$('#result-container').html(text);
				},
				onShowLayout: function (node,query){
					
				},
				onHideLayout: function (node, query) {
					node.attr('placeholder', 'Search');
				},
			}
		});
	}
}
var $select2Change = {};
formPlane.componentSelect2 = function(formID,select2Arr){
	var mainID = 'form-'+formID+'-';
	for(var choseI=0; choseI<select2Arr.length; choseI++){
		//是否可以自定义添加标签
		var filltag = typeof(select2Arr[choseI].filltag) == 'boolean' ? select2Arr[choseI].filltag : false;
		//是否可以自定义关闭选项
		var isAllowClear = typeof(select2Arr[choseI].isAllowClear) == 'boolean' ? select2Arr[choseI].isAllowClear : true;
		//多选前提下，允许最多选择的项
		var maximumItem = typeof(select2Arr[choseI].maximumItem) == 'number' ? select2Arr[choseI].maximumItem : 3;
		//是否开启搜索
		var isCloseSearch = typeof(select2Arr[choseI].isCloseSearch) == 'number' ? select2Arr[choseI].isCloseSearch : 1;
		//默认值：如果是必填则显示，如果不是则不显示
		var placeholderStr = '';
		var sID = mainID+select2Arr[choseI].id;//完整的选项id
		if(select2Arr[choseI].rules){

			placeholderStr = language.datatable.fillStatus.required;

			//如果值存在验证通过
			if($('#'+sID).val()){
				formPlane.fillValid[formID][sID] = true;
			}
		}
		$select2Change[sID] = $('#'+sID).select2({
			placeholder: placeholderStr,//默认值
			tags:filltag,//手动添加自定义标签值
			maximumSelectionLength:maximumItem,//允许选择的条目数
			allowClear: isAllowClear,//是否清空选择项
			minimumResultsForSearch:isCloseSearch,
			width:'100%',
		});
	}
	$('.form-item.select2 select').on('select2:close', function (evt) {
		var keyID = $(evt.target).closest('select').attr('id');//当前select2元素的id
		var formMainID = $(evt.target).closest('form').attr('id');//form的id
		var formID = formMainID.substr(5,formMainID.length);
		var selFormID = 'form-'+formID;
		var selectID = keyID.substr(selFormID.length+1,keyID.length);
		var query = $(evt.target).closest('select').val();
		var queryText = $(evt.target).closest('select').find('option:selected').text().trim();
		//是否有验证
		for(var kID in formPlane.fillValid[formID]){
			if(kID == keyID){
				$('#'+kID).closest('div').find('.has-error').remove();

				if(query == '' || query == language.common.commonconfig.Verification.select || query == null){

					formPlane.fillValid[formID][kID] = false;
					$('#'+kID).closest('div').append('<label class="has-error">'+language.datatable.fillStatus.required+'</label>');
				}else{
					formPlane.fillValid[formID][kID] = true;
				}
			}
		}
		var select2Func = formPlane.data[formID].formInput[selectID].changeHandler;
		if(typeof(select2Func) == 'function'){
			select2Func(query,queryText);
		}                   
	});	
}
formPlane.componentTextBtnHandler = function(formID,textBtnArr){
	for(var textBtn = 0; textBtn < textBtnArr.length; textBtn ++){
		var textID = 'form-'+formID+'-'+textBtnArr[textBtn].id;
		var $elementObj = $('#'+textID).closest('div').find('button');
		if(typeof($elementObj.attr('disabled'))=='undefined'){
			$elementObj.off('click');
			$elementObj.on('click',function(ev){
				var btnID = Number($(this).attr('fid'));
				var changeInputID = $(this).closest('div').parent().find('input').attr('id');
				var changeFormID = $(this).closest('form').attr('id');
				changeInputID = changeInputID.substr(changeFormID.length+1, changeInputID.length);
				changeFormID = changeFormID.substr(5,changeFormID.length);
				var btnArr = formPlane.data[changeFormID].formInput[changeInputID].btns;
				if(!isNaN(btnID)){
					if(typeof(btnArr[btnID].handler)=='function'){	
						var btnFunc = btnArr[btnID].handler;
						btnFunc();
					}
				} 
			})
		}
	}
}
formPlane.componentHandler = function(formID,changeHandlerArr){
	for(var changehandlerI = 0; changehandlerI<changeHandlerArr.length; changehandlerI++){
		var changehandlerInputID = 'form-'+formID+'-'+changeHandlerArr[changehandlerI].id;
		if(changeHandlerArr[changehandlerI].type=='radio' || changeHandlerArr[changehandlerI].type=='checkbox'){
			$('input[name="'+changehandlerInputID+'"]').on('change',function(ev){
				var changeFormID = $(ev.target).closest('form').attr('id');
				var changeInputID = $(ev.target).attr('name');
				changeInputID = changeInputID.substr(changeFormID.length+1, changeInputID.length);
				changeFormID = changeFormID.substr(5,changeFormID.length);
				var changeHandler = formPlane.data[changeFormID].formInput[changeInputID].changeHandler;
				var returnValue = $(ev.target).val();
				var returnObj = $(this);
				changeHandler(returnValue,returnObj);
			})
		}else if(changeHandlerArr[changehandlerI].type=='select'){
			//
		}else if(changeHandlerArr[changehandlerI].type == 'text' || changeHandlerArr[changehandlerI].type == 'text-btn' || changeHandlerArr[changehandlerI].type == 'number'){
			$('input[id="'+changehandlerInputID+'"]').on('keyup',function(ev){
				var changeFormID = $(ev.target).closest('form').attr('id');
				var changeSelectID = $(ev.target).closest('input').attr('id');
				changeSelectID = changeSelectID.substr(changeFormID.length+1, changeSelectID.length);
				changeFormID = changeFormID.substr(5,changeFormID.length);
				var changeHandler = formPlane.data[changeFormID].formInput[changeSelectID].changeHandler;
				var returnObj = {};
				returnObj.id = changeSelectID;
				returnObj.value = $(ev.target).val().trim();
				returnObj.obj = $(this);
				if(typeof(changeHandler)!='undefined'){
					changeHandler(changeSelectID,$(ev.target).val().trim(),returnObj);
				}
			})
		}
	}
}
formPlane.selectProvince = function(editJsonArr,formID){
	var changeHandlerArr = [];
	var refreshSelectArr = [];
	for(var i=0; i<editJsonArr.length; i++){
		var editJson = editJsonArr[i];
		var inputArr = formPlane.getInputContainerAndData(editJson.id, formID);
		var inputContainer = inputArr[0];
		var InputData = inputArr[1];
		$.each(editJson,function(key,value){
			if(key!='id'){
				InputData[key] = value;
			}
		});
		var editID = 'form-'+formID+'-'+InputData.id;
		var editDataArr = InputData.subdata;
		var editHtml = '';
		for(var sub in editDataArr){
			var isSelectStr = editDataArr[sub].selected ? "selected" :"";
			editHtml += '<option value="'+editDataArr[sub].value+'" '+isSelectStr+'>'+editDataArr[sub].text+'</option>';
		}
		editHtml = '<select id="'+editID+'" class="form-control" nstype="select">'+editHtml+'</select>';
		inputContainer.closest('div').html(editHtml);
		if(typeof(InputData.id)!='undefined'){
			if(typeof(InputData.changeHandler)!='undefined'){
				//非text-btn类型的组件有函数，集中处理，以change为标准
				changeHandlerArr.push(InputData);
			}
			if(InputData.type=='select'){
				refreshSelectArr.push(InputData.id);
			}
		}
	}
	for(refreshSel in refreshSelectArr){
		var refreshFormID = 'form-'+formID+'-'+refreshSelectArr[refreshSel];
		$('#'+refreshFormID).selectBoxIt().on('open', function(){
			$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
		});
	}
	formPlane.componentHandler(formID,changeHandlerArr);
}
//追加表单区域
formPlane.append = function(appendArr,formID,appendID){
	var appendHtml = '';
	var validateArr = [];
	var fillFormID = 'form-'+formID;
	for(var appendI = 0; appendI < appendArr.length; appendI ++){
		if(typeof(appendArr[appendI].id) == 'undefined'){
			if(typeof(appendArr[appendI].html)!='undefined'){
				appendHtml += appendArr[appendI].html;
			}
		}else{
			if($('#'+fillFormID+'-'+appendArr[appendI].id).length > 0){
				//已经存在的元素
				appendHtml += '';
			}else{
				appendHtml += commonConfig.component(appendArr[appendI],formID,'form');
				validateArr.push(appendArr[appendI]);
			}
		}
	}
	if(typeof(appendID) == 'undefined'){
		$('#'+fillFormID).children('.row').last().append(appendHtml);
	}else{
		$('#'+fillFormID+'-'+appendID).closest('.row.row-close.fillbg').append(appendHtml);
	}
	//是否有验证的对象
	if(validateArr.length>0){
		formPlane.validateForm(formID,validateArr);
	}
	//初始化select组件
	$('.form-item.select select').selectBoxIt().on('open', function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	});

	$('.form-item.selectplane select').selectBoxIt().on('open',function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	})
}
formPlane.delete = function(formID,deleteArr){
	if(typeof(deleteArr) == 'object'){
		for(var delI = 0; delI < deleteArr.length; delI ++){
			var delID = 'form-'+formID+'-'+deleteArr[delI];
			$('#'+delID).closest('.form-td').remove();
		}
	}
}
//将更改表单的部分区域
formPlane.edit = function(editJsonArr, formID){
	var changeHandlerArr = [];
	var refreshSelectArr = [];
	var dateFormatArr = [];
	var uploadHandlerJson = {};
	var textBtnArr = [];
	var treeSelectJson = {};
	var selectDateJson = {};
	var selectHandlerArr = [];
	var provSelectArr = [];
	var select2Arr = [];
	for(var i=0; i<editJsonArr.length; i++){
		var editJson = editJsonArr[i];
		var inputArr = formPlane.getInputContainerAndData(editJson.id,formID);
		var inputContainer = inputArr[0];
		var InputData = inputArr[1];
		$.each(editJson,function(key,value){
			if(key!='id'){
				InputData[key] = value;
			}
		});
		var formType = typeof(nsForm.data[formID].formType)=='string'?nsForm.data[formID].formType:'form';
		var componentHtml = '';
		if(formType=='dialog'|| formType=='modal'){
			formType = 'modal'; //弹出框修改传递的参数是dialog
			componentHtml = commonConfig.component(InputData,formID, formType, nsdialog.config.size);
		}else{
			componentHtml = commonConfig.component(InputData,formID, formType);
		}
		
		
		var hiddenInputID = 'form-'+formID+'-'+InputData.id;
		if(InputData.type == 'hidden'){
			if(inputContainer.parent().hasClass('row row-close')){
				$('#'+hiddenInputID).val(InputData.value);
			}
		}
		
		if(formType=='form'){
			var componentContainerHtml = componentHtml.substring(componentHtml.indexOf('=')+1,componentHtml.indexOf('>'));
			componentHtml = componentHtml.substring(componentHtml.indexOf('>')+1,componentHtml.lastIndexOf('<'));
			inputContainerAttr = componentContainerHtml.substring(componentContainerHtml.indexOf('"')+1,componentContainerHtml.length-1);
			inputContainer.closest('.form-td').attr('class',inputContainerAttr);
			inputContainer.closest('.form-td').html(componentHtml);
		}else if(formType=='modal'){
			var componentClassStr = componentHtml.substring(componentHtml.indexOf('class="')+7,componentHtml.indexOf('>'));
			componentClassStr = componentClassStr.substring(0,componentHtml.indexOf('"'));
			componentHtml = componentHtml.substring(componentHtml.indexOf('>')+1,componentHtml.lastIndexOf('<'));
			inputContainer.closest('.form-group ').attr('class',componentClassStr);
			inputContainer.closest('.form-group ').html(componentHtml);
		}
		
		if(typeof(InputData.id)!='undefined'){
			if(typeof(InputData.changeHandler)!='undefined'){
				//非text-btn类型的组件有函数，集中处理，以change为标准
				changeHandlerArr.push(InputData);
			}
			if(InputData.type=='select'){
				refreshSelectArr.push(InputData);
			}
			if(InputData.type == 'select2'){
				select2Arr.push(InputData);
			}
			var inputReadonly = InputData.readonly ? InputData.readonly : false;
			if(InputData.type == 'date' && inputReadonly == false){
				dateFormatArr.push(InputData);
			}
			if(InputData.type == 'upload'){
				uploadHandlerJson[InputData.id] = InputData;
			}
			if(InputData.type == 'text-btn'){
				textBtnArr.push(InputData);
			}
			if(InputData.type == 'select'){
				selectHandlerArr.push(InputData);
			}
			if(InputData.type == 'tree-select'){
				treeSelectJson[InputData.id] = InputData;
			}
			if(InputData.type == 'selectDate'){
				selectDateJson[InputData.id] = InputData;
			}
			if(InputData.type == 'province-select'){
				provSelectArr.push(InputData);
			}
		}
	}
	if(selectHandlerArr.length > 0){
		formPlane.validateSelectPlane(formID,selectHandlerArr);
	}

	if(provSelectArr.length > 0){
		provinceSelect.init(formID,provSelectArr);
	}
	//selectDate
	if(!$.isEmptyObject(selectDateJson)){
		formPlane.selectDatePlane(formID,selectDateJson);
	}
	formPlane.selectMorePlane(formID);
	//tree-select
	if(!$.isEmptyObject(treeSelectJson)){
		treeUI.componentSelectPlane(formID,treeSelectJson);
	}
	//select2
	if($.isArray(select2Arr)){
		formPlane.componentSelect2(formID,select2Arr);
	}
	//text-btn
	if(textBtnArr.length > 0 ){
		formPlane.componentTextBtnHandler(formID,textBtnArr);
	}
	//是否有日期类型
	if(dateFormatArr.length>0){
		formPlane.componentDate(formID,dateFormatArr);
	}
	//是否有上传类型
	if(!$.isEmptyObject(uploadHandlerJson)){
		formPlane.componentUpload(formID,uploadHandlerJson);
	}
	var selectDiabledArr = [];
	var cancelSelectDisableArr = [];
	for(refreshSel in refreshSelectArr){
		var refreshFormID = 'form-'+formID+'-'+refreshSelectArr[refreshSel].id;
		var refreshDisabled = false;
		if(typeof(refreshSelectArr[refreshSel].disabled) != 'undefined'){
			refreshDisabled = refreshSelectArr[refreshSel].disabled;
			if(refreshDisabled == true){
				selectDiabledArr.push(refreshFormID);
			}else{
				cancelSelectDisableArr.push(refreshFormID);
			}
		}
	}
	if(selectDiabledArr.length > 0){
		for(var selected in selectDiabledArr){
			$('#'+selectDiabledArr[selected]).attr('disabled',true);
		}
	}
	if(cancelSelectDisableArr.length > 0){
		for(var selected in selectDiabledArr){
			$('#'+selectDiabledArr[selected]).attr('disabled',false);
		}
	}
	formPlane.componentHandler(formID,changeHandlerArr);
	//初始化select组件
	$('.form-item.select select').selectBoxIt().on('open', function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	});

	$('.form-item.selectplane select').selectBoxIt().on('open',function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	})
}
/***************************************************************************************************
 * formPlane.getInputContainerAndData
 * arguments inputID 原始input id
 * arguments formID  表单的id，预留参数，暂不使用，用于区分多表单
 *
 * @returns 数组, [0]是该组件的jquery DOM对象，[1]是原始数据
 */
formPlane.getInputContainerAndData = function(inputID,formID){
	var formInputData = {};
	var InputData = {};
	for(var form in formPlane.data){
		var formInputData = formPlane.data[formID].formInput;
		InputData = formInputData[inputID];
		if(!$.isEmptyObject(InputData)){
			var inputContainer;
			if(InputData.type == 'radio' || InputData.type == 'checkbox'){
				var nameID = 'form-'+formPlane.data[formID].id+'-'+InputData.id;
				inputContainer = $('input[name="'+nameID+'"]');
			}else if(InputData.type=="province-select"){
				var nameID = 'form-'+formPlane.data[formID].id+'-'+InputData.id+'-province';
				inputContainer = $('#'+nameID);
			}else if(InputData.type == 'datetime'){
				inputContainer = $("#form-"+formPlane.data[formID].id+'-'+InputData.id+'-date');
			}else{
				inputContainer = $("#form-"+formPlane.data[formID].id+'-'+InputData.id);
			}
			return [inputContainer,InputData];
		}
	}
	if($.isEmptyObject(formInputData)){

		nsalert(language.common.fromplane.formCannotFound);

	}else{
		if($.isEmptyObject(InputData)){

			nsalert(language.common.fromplane.dataCannotFound);

		}
	}
	return false;
}
//将数据填充到表单中
formPlane.setValues = function(json,fillformID){
	json = nsVals.clearNull(json);
	formPlane.fillValues(json,fillformID);
}
formPlane.fillValues = function(json,fillformID){
	var formID = arguments[1] ? arguments[1] : '';
	var formIDStr = formID;
	if(formIDStr == ''){
		for(var form in formPlane.data){
			formID = form;
			formIDStr = 'form-'+form;
		}
	}else{
		formIDStr = 'form-'+formID;
	}
	$.each(json,function(key,value){
		if(typeof(formPlane.data[formID].formInput[key])!='undefined'){

			var inputID = formIDStr+'-'+key;
			var inputValue = value;
			var inputType = formPlane.data[formID].formInput[key].type;
			var subdata = '';
			var valueField = 'value';
			if(formPlane.data[formID].formInput[key].valueField){
				valueField = formPlane.data[formID].formInput[key].valueField;
			}
			if(inputType=='radio'){
				subdata = formPlane.data[formID].formInput[key].subdata;
			}
			if(inputType=='checkbox'){
				subdata = formPlane.data[formID].formInput[key].subdata;
			}
			if(inputType=='add-select-input'){
				var configData = formPlane.data[formID].formInput[key];
				var currentData = '';
				for(var valueI = 0; valueI<configData.localDataArr.length; valueI++){
					if(configData.localDataArr[valueI][configData.localDataHiddenIDIndex]==value){
						currentData = configData.localDataArr[valueI];
						break;
					}
				}
				if(currentData!=''){
					var fillValuesArr = [];
					for(var columnI = 0; columnI<configData.columnData.length; columnI++){
						fillValuesArr.push(currentData[configData.columnData[columnI]]);
					}
					fillValuesArr.push(currentData[configData.localDataHiddenIDIndex]);
					nsUI.addSearchInput.fillValue(fillValuesArr,configData,$('#'+inputID))
				}else{
					if(value!=''||value!=undefined){

						nsalert(configData.label+language.common.fromplane.errorReturn);

						nsUI.addSearchInput.clearValue(configData,$('#'+inputID),true);
					}
				}
			}else if(inputType == 'organiza-select'){
				var configData = formPlane.data[formID].formInput[key];
				if(typeof(value)=='object'){
					$('#'+configData.fullID).val(value.text);
					$('#'+configData.fullHiddenID).val(value.id);
				}
			}else if(inputType == 'selectDate'){
				commonConfig.setSelectKeyValue(inputID,inputValue,inputType);
			}else if(inputType == 'selectSelect'){
				commonConfig.setSelectKeyValue(inputID,inputValue,inputType);
			}else if(inputType == 'selectText'){
				commonConfig.setSelectKeyValue(inputID,inputValue,inputType);
			}else if(inputType == 'person-select'){
				nsUI.personSelect.setValue(value);
			}else{
				commonConfig.setKeyValue(inputID,inputValue,inputType,subdata,valueField);
				if(typeof(formPlane.fillValid[formID][inputID])!='undefined'){
					formPlane.fillValid[formID][inputID] = true;
				}
			}
		}
	});
}
//得到表单所有值
formPlane.getAllFormData = function(formID){
	var formData = {};
	for(var inputJson in formPlane.data[formID].formInput){
		var inputkey;
		var inputValue;
		var inputType = formPlane.data[formID].formInput[inputJson].type;
		inputkey = inputJson;
		if(inputType == 'radio'){
			inputValue = $('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').val();
		}else if(inputType == 'checkbox'){
			var checkboxObj = $('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]');
			if(checkboxObj.length == 1){
				if($(checkboxObj).is(':checked')){
					inputValue = 1;
				}else{
					inputValue = 0;
				}
			}else{
				if($('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').length > 0){
					var chkArr = [];
					$('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').each(function(ev){
						chkArr.push($(this).val());
					});
					inputValue = chkArr;
				}else{
					inputValue = "";
				}
			}
		}else{
			inputValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
		}
		formData[inputkey] = inputValue;
	}
	return formData;
}
//将表单内容生成json  
//isNeedValid (boolean) 是否要验证，默认为true，需要验证
formPlane.getFormJSON = function(formID,isNeedValid){
	//初始化验证
	if(typeof(formID)!='string'){
		nsalert('getFormJSON参数错误，必须提供config中form的id','error');
		return false;
	}
	if($("#form-"+formID).length==0){
		nsalert('表单ID：'+formID+' 不存在','error');
		return false;
	}
	if(typeof(isNeedValid)!='boolean'){
		isNeedValid = true;
	}

	//判断是否通过验证，返回值为是否通过验证，true
	function getFormValid(){
		var validBln = true;
		//默认验证规则是否通过
		if($("#form-"+formID).valid()==false){
			validBln = false;
		}
		//下拉框等自定义组件的验证，外部验证
		var fillValid = true;
		var errorArrID = [];
		for(var valid in formPlane.fillValid[formID]){
			if(formPlane.fillValid[formID][valid] == false){
				fillValid = false;
				errorArrID.push(valid);
			}
		}
		if(fillValid==false){
			for(var index in errorArrID){
				if($('#'+errorArrID[index]).parent().children().hasClass('has-error')){
					$('#'+errorArrID[index]).parent().find('.has-error').remove();
				}
				$('#'+errorArrID[index]).parent().append('<label class="has-error">必填</label>');
			}
			validBln = false;
		}
		//人员选择器等，内部验证组件
		for(var inputkey in formPlane.data[formID].formInput){
			var config = formPlane.data[formID].formInput[inputkey];
			var inputType = config.type;
			switch(inputType){
				//人员选择器
				case 'person-select':
					var isPSvalid = nsUI.personSelect.isValid(nsForm.data[formID].formInput[inputkey]);
					if(isPSvalid==false){
						validBln = false;
					}
					break;
			}
		}
		return validBln;
	}
	//获取数据
	function getJson(){
		var formDataJson = {};
		for(var inputkey in formPlane.data[formID].formInput){
			var inputValue;
			var config = formPlane.data[formID].formInput[inputkey];
			var inputType = config.type;
			switch(inputType){
				case 'selectText':
				case 'textSelect':
					//下拉框文本  //文本下拉框
					formDataJson[inputkey] = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
					var selectID = config.select.id;
					var textID = config.text.id;
					var formSelectID = 'form-'+formID+'-'+selectID;
					var selectvalue = $('#form-'+formID+' #'+formSelectID).val().trim();
					formDataJson[selectID] = selectvalue;
					var formTextID = 'form-'+formID+'-'+textID;
					var textvalue = $('#form-'+formID+' #'+formTextID).val().trim();
					formDataJson[textID] = textvalue;
					break;
				case 'selectDate':
					//下拉框日期组件
					var formPreID = 'form-'+formID+'-';
					var caseSelectID = config.caseSelect.id;
					var caseSelectvalue = $('#form-'+formID+' #'+formPreID+caseSelectID).val().trim();
					var textID = config.text.id;
					var textvalue = $('#form-'+formID+' #'+formPreID+textID).val().trim();
					var dateID = config.date.id;
					var datevalue = $('#form-'+formID+' #'+formPreID+dateID).val().trim();
					var dateRangeID = config.daterange.id;
					var daterangevalue = $('#form-'+formID+' #'+formPreID+dateRangeID).children('span').text().trim();
					if(daterangevalue){
						var daterangeStart = daterangevalue.split(language.date.separator)[0];
						var daterangeEnd = daterangevalue.split(language.date.separator)[1];
						formDataJson[dateID] = daterangeStart;
						formDataJson[dateRangeID] = daterangeEnd;
					}else{
						formDataJson[dateID] = datevalue;
						formDataJson[dateRangeID] = '';
					}
					formDataJson[caseSelectID] = caseSelectvalue;
					formDataJson[textID] = textvalue;

					formDataJson[inputkey] = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
					break;
				case 'selectSelect':
					//下拉框下拉框组件
					var formPreID = 'form-'+formID+'-';
					var firstSelectID = config.firstSelect.id;
					var secondSelectID = config.secondSelect.id;
					var firstvalue = $('#form-'+formID+' #'+formPreID+firstSelectID).val().trim();
					var secondvalue = $('#form-'+formID+' #'+formPreID+secondSelectID).val().trim();
					formDataJson[firstSelectID] = firstvalue;
					formDataJson[secondSelectID] = secondvalue;
					formDataJson[inputkey] = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
					break;
				case 'radio':
					//单选
					inputValue = $('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').val();
					formDataJson[inputkey] = inputValue;
					break;
				case 'checkbox':
					//复选
					var checkboxObj = $('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]');
					if(checkboxObj.length == 1){
						if($(checkboxObj).is(':checked')){
							inputValue = 1;
						}else{
							inputValue = 0;
						}
					}else{
						if($('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').length > 0){
							var chkArr = [];
							$('#form-'+formID+' input[name="form-'+formID+'-'+inputkey+'"]:checked').each(function(ev){
								chkArr.push($(this).val());
							});
							inputValue = chkArr;
						}else{
							inputValue = "";
						}
					}
					formDataJson[inputkey] = inputValue;
					break;
				case 'add-select-input':
				case 'organiza-select':
					//增删一体输入框
					inputValue = $('#'+config.fullHiddenID).val();
					formDataJson[inputkey] = inputValue;
					break;
				case 'tree-select':
					//下拉框树
					inputValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey).attr('nodeId');
					formDataJson[inputkey] = inputValue;
					break;
				case 'datetime':
					//日期时间组件
					var dateValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey+'-date').val().trim();
					var timeValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey+'-time').val().trim();
					if(typeof(timeValue) == 'undefined'){
						inputValue = dateValue;
					}else if(typeof(timeValue)=='string'){
						if(timeValue !== ''){
							inputValue = dateValue +' '+timeValue;
						}
					}
					inputValue = typeof(inputValue) == 'undefined' ? '':inputValue;
					formDataJson[inputkey] = inputValue;
					break;
				case 'person-select':
					inputValue = nsForm.data[formID].formInput[inputkey].resultPersonArr;
					formDataJson[inputkey] = inputValue;
					break;
				case 'province-select':
					var tempElementID = 'form-'+formID+'-';
					var provinceID = tempElementID+inputkey+'-province';
					var cityID = tempElementID+inputkey+'-city';
					var areaID = tempElementID+inputkey+'-area';
					var valueJson = {};
					valueJson.province = $('#'+provinceID).val();
					var cityvalue = $('#'+cityID).val();
					if(cityvalue === null || cityvalue === ''){
						valueJson.city = '';
					}else{
						valueJson.city = cityvalue;
					}
					var areavalue = $('#'+areaID).val();
					if(areavalue === null || cityvalue === ''){
						valueJson.area = '';
					}else{
						valueJson.area = areavalue;
					}
					formDataJson[inputkey] = valueJson;
					break;
				case 'upload':
				case 'upload_single':
				case 'upload-single':
					var valueArr = formPlane.dropzoneStr[inputkey];
					valueArr = valueArr.join(',');
					formDataJson[inputkey] = valueArr;
					break;
				case 'select2':
					inputValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
					if($.isArray(inputValue)){
						inputValue = inputValue.join(',');
					}
					formDataJson[inputkey] = inputValue;
					break;
				default:
					inputValue = $('#form-'+formID+' #form-'+formID+'-'+inputkey).val();
					formDataJson[inputkey] = inputValue;
					break;
			}
		}
		return formDataJson;
	}

	//返回json,或者返回false，验证不通过
	if(isNeedValid){
		var isPastValid = getFormValid();
		if(isPastValid == false){

			nsalert(language.common.fromplane.validationFailure);

			return false;
		}else{
			return getJson();
		}
	}else{
		return getJson();
	}
	
}