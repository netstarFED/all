var purchasePlane = {};
purchasePlane.formPlane = {};
/************表单部分 start*************************/
purchasePlane.formPlane.init = function(formJson){
	var formID = formJson.id;
	var formOffset= '';
	var formClearFix = '';
	var formData = formJson.form;
	var groupHtml = "";
	var changeHandlerArr = [];//radio,checkbox组件的事件
	var validateArr = [];
	for(var groupID = 0; groupID < formData.length; groupID++){
		if(typeof(formData[groupID].changeHandler)!='undefined'){
			changeHandlerArr.push(formData[groupID]);
		}
		if(typeof(formData[groupID].id)!="undefined"){
			validateArr.push(formData[groupID]);
		}
		var readonlyStr = "";
		if(typeof(formData[groupID].readonly)!="undefined"){
			if(formData[groupID].readonly == true){
				readonlyStr = 'readonly="readonly"';
			}else if(formData[groupID].readonly == false){
				readonlyStr = "";
			}
		}
		var groupIDName = typeof(formData[groupID].id)=="undefined"?"":"form-"+formID+"-"+formData[groupID].id;
		var defaultValueStr = typeof(formData[groupID].value)=="undefined"?"":formData[groupID].value;
		var groupType = formData[groupID].type;
		var groupColumnClass = 'col-sm-'+formData[groupID].column;
	
		switch(groupType){
			case 'text':
				groupHtml += '<div class="form-group bar-input input '+groupColumnClass+'">'
						+'<label class="control-label" for="'+formData[groupID].id+'">'
						+formData[groupID].label
						+'</label>'
						+'<input class="form-control" type="text" '+readonlyStr+' name="'+formData[groupID].id+'" value="'+defaultValueStr+'" id="'+groupIDName+'" />'
						+'</div>';
				break;
			case 'date':
				groupHtml += '<div class="form-group '+groupColumnClass+' bar-date date">'
						+'<label class="control-label" for="'+formData[groupID].id+'">'
						+formData[groupID].label
						+'</label>'
						+'<input class="form-control datepicker" type="text" '+readonlyStr+' name="'+formData[groupID].id+'" value="'+defaultValueStr+'" id="'+groupIDName+'" />'
						+'<button type="button" class="btn btn-default">'
						+'<i class="linecons-calendar"></i>'
						+'</button>'
						+'</div>';
				break;
			case 'select':
				groupHtml += '<div class="form-group '+groupColumnClass+' bar-select select">'
						+'<label class="control-label" for="'+formData[groupID].id+'">'
						+formData[groupID].label
						+'</label>'
						+'<select name="'+formData[groupID].id+'" id="'+groupIDName+'" class="form-control">';
				var groupSubData = formData[groupID].subdata;
				if(typeof(groupSubData)!='undefined'){
					var selectData;
					if(typeof(formData[groupID].url) =='undefined'){
						selectData = formData[groupID].subdata;
					}else{
						$.ajax({
							url:formData[groupID].url, //请求的数据链接
							type:formData[groupID].method,
							data:formData[groupID].data,
							async:false,
							success:function(rec){
								if(typeof(formData[groupID].dataSrc)=='undefined'){
									selectData = rec;
								}else{
									for(data in rec){
										selectData = rec[formData[groupID].dataSrc];
									}
								}
							},
							error: function () {
								nsalert('请检查数据格式是否合法','warning');
							}
						});
					}   
					if(typeof(selectData)!='undefined'){
						for(var selectI = 0; selectI<selectData.length; selectI++){
							var textStr = '';
							var valueStr = '';
							var isSelectStr = "";
							if(typeof(formData[groupID].textField)=='undefined'){
								textStr = selectData[selectI].text;
							}else{
								textStr = selectData[selectI][formData[groupID].textField];
							}
							if(typeof(formData[groupID].valueField)=='undefined'){
								valueStr = selectData[selectI].value;
							}else{
								valueStr = selectData[selectI][formData[groupID].valueField];
							}
							if(typeof(selectData[selectI].selected)!='undefined'){
								isSelectStr = selectData[selectI].selected ? "selected":"";
							}else{
								isSelectStr = defaultValueStr ?"selected":"";
							}
							groupHtml += '<option value="'+valueStr+'" '+isSelectStr+'>'
											+textStr
										+'</option>'
						}
					}
				}
				groupHtml +='</select></div>';
				break;
		}
	}
	if(typeof(formJson.offset)!='undefined'){
		formOffset = 'col-sm-offset-'+formJson.offset;
	}
	if(typeof(formJson.clearfix)!='undefined'){
		if(formJson.clearfix){
			formClearFix = 'clearfix';
		}
	}
	var formHtml = '<form role="form" id="form-'+formID+'" class="'+formOffset+' '+formClearFix+'" method="get" action="">'
				+'<div class="row">'+groupHtml+'</div>'
				+'</form>';
	if($("#"+formID).length<1){
		nsalert("无法在页面上找到Form对象，请检查HTML和JSON中的id命名是否统一");
	}else if($("#"+formID).length>1){
		nsalert("HTML中的from出现了ID重复,无法填充");
	}else{
		$("#"+formID).html(formHtml);
	}
	//初始化日期
	$('.bar-date.date .datepicker').datepicker({
		autoclose:true,
		todayHighlight:true,
		format:'yyyy-mm-dd',
	});
	//初始化select组件
	$('.bar-select.select select').selectBoxIt().on('open', function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	});
	//change事件
	if(changeHandlerArr.length > 0){
		formPlane.componentHandler(formID,changeHandlerArr);
	}
	if(validateArr.length > 0){
		//保存Form对象基本数据
		var formInput = {};
		for(var formInputI = 0; formInputI<validateArr.length; formInputI++){
			var formInputID = formID+'-'+validateArr[formInputI].id;
			formInputID = formInputID.substr(formID.length+1,formInputID.length);
			var formInputValue = validateArr[formInputI];
			formInput[formInputID] = formInputValue;
		}
		formPlane.data[formID] = {id:formID,formInput:formInput};
		//添加验证规则
		var rules = commonConfig.getRules(validateArr,formID);
		$("#form-"+formJson.id).validate(rules);
	}
}
/**
*功能：表单保存,支持多表单合并一个
*说明：如果是多个表单，需要把每个表单id传送过来
**/
purchasePlane.formPlane.save = function(formID1,formID2,formID3){
	var formJsonID_1 = formID1;
	var formJsonData_1 = formPlane.getFormJSON(formJsonID_1);
	var allFormJson = $.extend({},formJsonData_1);
	if(typeof(formID2)!='undefined'){
		var formJsonID_2 = formID2;
		var formjsonData_2 = formPlane.getFormJSON(formJsonID_2);
		allFormJson = $.extend({}, formJsonData_1,formjsonData_2);
		if(typeof(formID3)!='undefined'){
			var formJsonID_3 = formID3;
			allFormJson = $.extend({}, formJsonData_1,formjsonData_2,formJsonID_3);
		}
	}
	return allFormJson;
}
/************表单部分 end*************************/