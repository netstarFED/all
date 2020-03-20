popupBoxMore.initShow = function(config){
	popupBoxMore.init(config);
	var sizeStr = "m"
	if(typeof(config.size)!="undefined"){
		sizeStr = config.size;
	}
	popupBoxMore.show("#"+config.id, sizeStr);
}
popupBoxMore.init = function(config,containerID){
	debugger
	this.btnHandlerArr = [];
	this.config = config;
	var boxHtml = '';
	var boxTitle;
	if(typeof(config.title)=='undefined'){
		boxTitle = ""
	}else{
		boxTitle = config.title;
	}
	if(typeof(config.form)=='undefined'){
		config.form = [];
	}
	if(typeof(config.btns)=='undefined'){
		config.btns = [];
	}

	var boxBody = '';
	var validateArr = [];
	var dateFormatArr = [];
	var dateTimeFormatArr = [];
	var btnHandlerArr = [];//按钮组件的事件
	var changeHandlerArr = [];//radio,checkbox组件的事件
	var select2Arr = [];
	var typeaheadArr = [];
	var boxContent = '';
	var formClass = '';
	var formContent = '';
	//如果弹出框里有table,则把tableID记录下来
	var tableArr = [];
	var uploadJson = {};	//是否有upload组件
	var upload_singleJson = [];
	for(var groupID=0; groupID<config.form.length;groupID++){
		if(typeof(config.form[groupID].length)=='undefined'){
			formContent = 'modal-body'
			var inputHtml = "";
			if(typeof(config.form[groupID].id)!="undefined"){
				boxBody += commonConfig.component(config.form[groupID], config.id, "modal",config.size);
				validateArr.push(config.form[groupID]);
				if(config.form[groupID].type == 'date'){
					var currentFormat = {
						id:config.form[groupID].id,
						format:config.form[groupID].format,
						changeHandler:config.form[groupID].changeHandler,
					};
					dateFormatArr.push(currentFormat);
				}
				if(config.form[groupID].type == "datetime"){
					dateTimeFormatArr.push(config.form[groupID]);
				}
				if(config.form[groupID].type == 'select2'){
					select2Arr.push(config.form[groupID]);
				}
				if(config.form[groupID].type == 'typeahead'){
					typeaheadArr.push(config.form[groupID]);
				}
				if(config.form[groupID].type == 'upload_single'){
					upload_singleJson[config.form[groupID].id] = config.form[groupID];
				}
				if(typeof(config.form[groupID].changeHandler)!='undefined'){
					//非text-btn类型的组件有函数，集中处理，以change为标准
					changeHandlerArr.push(config.form[groupID]);
				}
				if(config.form[groupID].type =='upload'){
					//如果有upload组件需要在HTML生成后初始化
					uploadJson = config.form[groupID];
					//upload不需要validate,记住tableID
					tableArr.push(config.form[groupID]);
				}else if(config.form[groupID].type =='table'){
					//记住tableID
					tableArr.push(config.form[groupID]);
				}else{
					//给其它有ID的组件加上验证
					validateArr.push(config.form[groupID]);
				}
			}else{
				if(typeof(config.form[groupID].html)!="undefined"){
					boxBody += config.form[groupID].html;
				}else if(typeof(config.form[groupID].note)!="undefined"){
					boxBody += 	'<blockquote>'
									+'<p>'+config.form[groupID].note+'</p>'
								+'</blockquote>'
				}
			}
		}else{
			formClass = 'panel-form';
			formContent = 'panel-body';
			for(var inputID=0; inputID<config.form[groupID].length;inputID++){
				if(typeof(config.form[groupID][inputID].id)=="undefined"){
					if(typeof(config.form[groupID][inputID].html)!="undefined"){
						boxBody += config.form[groupID][inputID].html;
					}else if(typeof(config.form[groupID][inputID].note)!="undefined"){
						boxBody += 	'<blockquote>'
										+'<p>'+config.form[groupID][inputID].note+'</p>'
									+'</blockquote>'
					}else if(typeof(config.form[groupID][inputID].element)!="undefined"){
						//预先定义的element元素
						if(config.form[groupID][inputID].element=="hr"){
							//横线
							boxBody += '<div class="col-xs-12 element-hr"><hr></div><div class="clearfix"></div>';
						}else if(config.form[groupID][inputID].element=="label"){
							//组标签
							boxBody += '<label class="grouplable">'+config.form[groupID][inputID].label+'</label>'
						}else if(config.form[groupID][inputID].element=="br"){
							//回车
							boxBody += '<div class="col-xs-12 element-br"></div><div class="clearfix"></div>';
						}else if(config.form[groupID][inputID].element=="title"){
							//标题
							boxBody += '<div class="col-xs-12 element-title"><label>'
								+'<i class="fa fa-arrow-circle-down"></i> '
								+config.form[groupID][inputID].label
							+'</label></div>';
						}
					}
				}else{
					if(config.form[groupID][inputID].type == 'date'){
						var currentFormat = {
							id:config.form[groupID][inputID].id,
							format:config.form[groupID][inputID].format,
							changeHandler:config.form[groupID][inputID].changeHandler,
						};
						dateFormatArr.push(currentFormat);
					}
					if(config.form[groupID][inputID].type == 'datetime'){
						dateTimeFormatArr.push(config.form[groupID][inputID]);
					}
					if(config.form[groupID][inputID].type == 'select2'){
						select2Arr.push(config.form[groupID][inputID]);
					}
					if(config.form[groupID][inputID].type == 'typeahead'){
						typeaheadArr.push(config.form[groupID][inputID]);
					}
					if(typeof(config.form[groupID][inputID].changeHandler)!='undefined'){
						//非text-btn类型的组件有函数，集中处理，以change为标准
						changeHandlerArr.push(config.form[groupID][inputID]);
					}
					if(config.form[groupID][inputID].type == 'upload_single'){
						upload_singleJson[config.form[groupID][inputID].id] = config.form[groupID][inputID];
					}
					if(config.form[groupID][inputID].type =='upload'){
						//如果有upload组件需要在HTML生成后初始化
						uploadJson = config.form[groupID][inputID];
						//upload不需要validate,记住tableID
						tableArr.push(config.form[groupID][inputID]);
					}else if(config.form[groupID][inputID].type =='table'){
						//记住tableID
						tableArr.push(config.form[groupID][inputID]);
					}else{
						//给其它有ID的组件加上验证
						validateArr.push(config.form[groupID][inputID]);
					}
					boxBody += commonConfig.component(config.form[groupID][inputID], config.id, "form", config.size);
				}
			}
		}
	}
	/* 生成按钮 */
	var btnsHtml = "";
	for(var btnID=0; btnID<config.btns.length; btnID++){
		if(typeof(config.btns[btnID].handler)!='undefined'){
			btnHandlerArr.push(config.btns[btnID]);
		}
		btnsHtml += commonConfig.getBtn(config.btns[btnID],"modal",btnID);
		if(typeof(config.btns[btnID].handler)=='function'){ 
			this.btnHandlerArr.push(config.btns[btnID].handler);
		}else{
			this.btnHandlerArr.push('');
		};
	}
	var smallTitle = typeof(config.note)=="undefined"?"":'<small> <i class="fa fa-angle-double-right"></i> '+config.note+' </small>';
	var titleHtml = '';
	if(boxTitle!=''){
		titleHtml = '<div class="modal-header">'
						+'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
						+'<h4 class="modal-title">'+boxTitle+smallTitle+'</h4>'
					+'</div>'
	}
	var formTagHeaderHtml, formTagFooterHtml;
	var isOutForm = true;
	if(config.form.length==1){
		if(config.form[0].html){
			isOutForm = false;
		}
	}
	if(isOutForm){
		formTagHeaderHtml = '<form class="form-horizontal" role="form" id="form-'+config.id+'" method="get" action="" onsubmit="false">';
		formTagFooterHtml = '</form>';
	}else{
		//如果生成的标签中只有一个自定义标签，则不生form标签
		formTagHeaderHtml = '';
		formTagFooterHtml = '';
	}
	boxHtml +=
	'<div id="'+config.id+'" class="modal fade modal-ns">'
		+'<div class="modal-dialog">'
			+'<div class="modal-content '+formClass+'">'
				+titleHtml
				+'<div class="'+formContent+'">'
					+formTagHeaderHtml
					+'<div class="row row-close fillbg">'
						+boxBody
					+'</div>'
					+formTagFooterHtml
				+'</div>'
				
				+'<div class="modal-footer">'
					+ btnsHtml
					+'<button type="button" class="btn btn-white" data-dismiss="modal">取消</button>'
				+'</div>'
			+'</div>'
		+'</div>'
	+'</div>'
	//未指定容器，则使用普通Model容器
	if($("#placeholder-popupboxMore").length==0){
		$("body").append('<div id="placeholder-popupboxMore"></div>');
	}
	$("#placeholder-popupboxMore").html(boxHtml);
	
	//添加按钮事件
	for(var btnHandlerI = 0; btnHandlerI<this.btnHandlerArr.length; btnHandlerI++){
		var btnDom = $("#"+config.id+' .modal-footer .btn')[btnHandlerI];
		if(typeof(btnHandlerArr[btnHandlerI].handler)=='function'){
			$(btnDom).on('click',function(){
				var btnHandlerIndexNum = parseInt($(this).attr('fid'));
				var handlerFunc = popupBoxMore.btnHandlerArr[btnHandlerIndexNum];
				handlerFunc();
			});
		}
	}
	//有需要验证的
	if(validateArr.length>0){
		formPlane.validateForm(config.id,validateArr,'dialog');
		/*//保存Form对象基本数据
		var formDataID = config.id;
		var formInput = {}
		for(var formInputI = 0; formInputI<validateArr.length; formInputI++){
			var formInputID = config.id+'-'+validateArr[formInputI].id;
			formInputID = formInputID.substr(formDataID.length+1,formInputID.length);
			var formInputValue = validateArr[formInputI];
			formInput[formInputID] = formInputValue;
		}
		formPlane.data[formDataID] = {id:formDataID,formInput:formInput};
		var rules = commonConfig.getRules(validateArr,config.id);
		$("#form-"+config.id).validate(rules);*/
	}
	//有需要加载的表格
	if(tableArr.length>0){
		popupBox.initTable(tableArr);
	}
	if(!$.isEmptyObject(upload_singleJson)){
		formPlane.componentUpload(config.id,upload_singleJson);
	}
	//如果有upload组件，初始化
	if(!$.isEmptyObject(uploadJson)){
		var i = 1;
			$example_dropzone_filetable = $('#'+uploadJson.id);
			example_dropzone = $("#advancedDropzone").dropzone({
			url: uploadJson.uploadsrc,
			
			addedfile: function(file)
			{
				if(i == 1)
				{
					$example_dropzone_filetable.find('tbody').html('');
				}
				
				var size = parseInt(file.size/1024, 10);
				size = size < 1024 ? (size + " KB") : (parseInt(size/1024, 10) + " MB");
				
				var	$el = $('<tr>\
								<td class="text-center">'+(i++)+'</td>\
								<td>'+file.name+'</td>\
								<td><div class="progress progress-striped"><div class="progress-bar progress-bar-warning"></div></div></td>\
								<td>'+size+'</td>\
								<td>Uploading...</td>\
							</tr>');
				
				$example_dropzone_filetable.find('tbody').append($el);
				file.fileEntryTd = $el;
				file.progressBar = $el.find('.progress-bar');
			},
			
			uploadprogress: function(file, progress, bytesSent)
			{
				file.progressBar.width(progress + '%');
			},
			
			success: function(file,data)
			{
				file.fileEntryTd.find('td:last').html('<span class="text-success">上传成功</span>');
				file.progressBar.removeClass('progress-bar-warning').addClass('progress-bar-success');
				if(typeof(uploadJson.changeHandler)!='undefined'){
					var uploadFunc = uploadJson.changeHandler;
					uploadFunc(data,file);
				}
			},
			
			error: function(file)
			{
				file.fileEntryTd.find('td:last').html('<span class="text-danger">失败</span>');
				file.progressBar.removeClass('progress-bar-warning').addClass('progress-bar-red');
			}
		});
		
		$("#advancedDropzone").css({
			minHeight: 200
		});
	}

	//是否有日期类型
	if(dateFormatArr.length>0){
		formPlane.componentDate(config.id,dateFormatArr);
	}
	if(dateTimeFormatArr.length>0){
		formPlane.componentDatetime(config.id,dateTimeFormatArr);
	}

	//给radio checkbox组件添加change事件，只要定义了handler
	formPlane.componentHandler(config.id,changeHandlerArr);
	if(typeaheadArr.length>0){
		formPlane.componentTypeahead(config.id,typeaheadArr);
	}
	//初始化select组件
	$('.form-item.select select').selectBoxIt().on('open', function(){
		$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
	});

	if(select2Arr.length>0){
		formPlane.componentSelect2(config.id,select2Arr);
	}

}
popupBoxMore.show = function(domStr,domSize){
	var domSizeName = arguments[1] ? arguments[1] : "m";
	this.modal = $(domStr).modal('show').on('shown.bs.modal', function () {
	  // 执行一些动作...
	  var $model = $('#placeholder-popupboxMore').children('div');
	  $model.attr('style',$model.attr('style')+'z-index:1052');
	  $($('.modal-backdrop')[1]).attr('style','z-index:1051');
	})
	if(!$(domStr).hasClass("custom-width")){
		$(domStr).addClass("custom-width");
	}
	var widthStr = "600px";
	switch(domSizeName){
		case "s":
			widthStr = "400px";
			break;
		case "m":
			widthStr = "600px";
			break;
		case "b":
			widthStr = "800px";
			break;
		case "f":
			widthStr = "100%";
			break;
		default:
			widthStr = domSize;
			break;
	}
	$(domStr+" .modal-dialog").attr("style","width:"+widthStr);
}
popupBoxMore.hide = function(){
	this.config = undefined;
	this.modal.modal('hide');
}
popupBoxMore.getFormJson = function(){
	if(this.config){
		if($("#form-"+this.config.id).valid()){
			var componentArr = [];
			var formDataJson = {};
			for(var formArrI = 0; formArrI<this.config.form.length; formArrI++){
				var component = this.config.form[formArrI];
				if(component.id){
					componentArr.push(this.config.form[formArrI]);
					var inputValue;
					if(component.type == 'radio'){
						inputValue = $('#form-'+this.config.id+' input[name="form-'+this.config.id+'-'+component.id+'"]:checked').val();
					}else if(component.type == 'checkbox'){
						var checkboxObj = $('#form-'+this.config.id+' input[name="form-'+this.config.id+'-'+component.id+'"]');
						if(checkboxObj.length == 1){
							if($(checkboxObj).is(':checked')){
								inputValue = 1;
							}else{
								inputValue = 0;
							}
						}else{
							if($('#form-'+this.config.id+' input[name="form-'+this.config.id+'-'+component.id+'"]:checked').length > 0){
								var chkArr = [];
								$('#form-'+this.config.id+' input[name="form-'+this.config.id+'-'+component.id+'"]:checked').each(function(ev){
									chkArr.push($(this).val());
								});
								inputValue = chkArr;
							}else{
								inputValue = "";
							}
						}
					}else{
						inputValue = $('#form-'+this.config.id+' #form-'+this.config.id+'-'+component.id).val();
					}
					formDataJson[component.id] = inputValue;


				}
			}
			return formDataJson;
		}else{
			return false;
		}
	}
}