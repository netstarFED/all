/**************************************************************************************************
 * 弹出框popupBox 别名是nsdialog
 */
popupBox.initShow = function(config){
	if($(".modal-backdrop").length>0){
		//位置出问题了
	}else{
		//设置是否回调函数仅用在取消，默认为false，全部触发
		popupBox.isOnlyCancel = nsVals.getDefaultFalse(config.isOnlyCancel);
		popupBox.isNotCancelHandler = false; //是否非取消操作
		//前置处理函数
		if(typeof(config.showBeforeHandler)=='function'){
			config.showBeforeHandler(config);
		}
		popupBox.init(config);
		var sizeStr = "m"
		if(typeof(config.size)!="undefined"){
			sizeStr = config.size;
		}
		popupBox.show(config, sizeStr);
	}
}
popupBox.init = function(config,containerID){
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
	var treeSelectJson = {}; 
	var boxContent = '';
	var formClass = '';
	var formContent = '';
	//如果弹出框里有table,则把tableID记录下来
	var tableArr = [];
	var uploadJson = {};	//是否有upload组件
	var upload_singleJson = {};
	var selectHandlerArr = [];
	var provSelectHandlerArr = [];
	var inputSelectArr = [];
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
						changeHandler:config.form[groupID].changeHandler
					};
					dateFormatArr.push(currentFormat);
				}
				//input-select
				if(config.form[groupID].type == 'input-select'){
					inputSelectArr.push(config.form[groupID]);
				}
				//select
				if(config.form[groupID].type == 'select'){
					selectHandlerArr.push(config.form[groupID]);
				}
				if(config.form[groupID].type == 'tree-select'){
					treeSelectJson[config.form[groupID].id] = config.form[groupID];
				}
				if(config.form[groupID].type == 'datetime'){
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
				}else if(config.form[groupID].type == 'province-select'){
					provSelectHandlerArr.push(config.form[groupID]);
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
					validateArr.push(config.form[groupID][inputID]);
					if(config.form[groupID][inputID].type == 'date'){
						var currentFormat = {
							id:config.form[groupID][inputID].id,
							format:config.form[groupID][inputID].format,
							changeHandler:config.form[groupID][inputID].changeHandler
						};
						dateFormatArr.push(currentFormat);
					}
					//input-select
					if(config.form[groupID][inputID].type == 'input-select'){
						inputSelectArr.push(config.form[groupID][inputID]);
					}
					if(config.form[groupID][inputID].type == 'select'){
						selectHandlerArr.push(config.form[groupID][inputID]);
					}
					if(config.form[groupID][inputID].type == 'tree-select'){
						treeSelectJson[config.form[groupID][inputID].id] = config.form[groupID][inputID];
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
					if(config.form[groupID][inputID].type == 'upload'){
						upload_singleJson[config.form[groupID][inputID].id] = config.form[groupID][inputID];
					}
					if(config.form[groupID][inputID].type =='table'){
						//记住tableID
						tableArr.push(config.form[groupID][inputID]);
					}else if(config.form[groupID][inputID].type == 'province-select'){
						provSelectHandlerArr.push(config.form[groupID][inputID]);
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
		formTagHeaderHtml = '<form class="form-horizontal" role="form" id="form-'+config.id+'" method="get" action="">';
		formTagFooterHtml = '</form>';
	}else{
		//如果生成的标签中只有一个自定义标签，则不生form标签
		formTagHeaderHtml = '';
		formTagFooterHtml = '';
	}
	//取消按钮
	var cancelBtnHtml = '';
	var isCancelBtnShow = nsVals.getDefaultTrue(config.isCancelBtnShow);
	if(isCancelBtnShow){
		cancelBtnHtml = 
			'<button type="button" class="btn btn-white" data-dismiss="modal">'
				+'<i class="fa fa-ban"></i> 取消'
			+'</button>'
	}
	//整体代码
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
					+ cancelBtnHtml
				+'</div>'
			+'</div>'
		+'</div>'
	+'</div>'

	$("#placeholder-popupbox").html(boxHtml);
	//添加按钮事件
	for(var btnHandlerI = 0; btnHandlerI<this.btnHandlerArr.length; btnHandlerI++){
		var btnDom = $("#"+config.id+' .modal-footer .btn')[btnHandlerI];
		if(typeof(btnHandlerArr[btnHandlerI].handler)=='function'){
			$(btnDom).on('click',function(){
				var btnHandlerIndexNum = parseInt($(this).attr('fid'));
				var handlerFunc = popupBox.btnHandlerArr[btnHandlerIndexNum];
				handlerFunc();
			});
		}
	}
	//取消按钮事件
	$("#"+config.id+' [nstype="cancel"]').on('click', function(ev){
		popupBox.hide({isCancel:true});
	});
	//有需要验证的
	if(validateArr.length > 0){
		//保存Form对象基本数据
		formPlane.validateForm(config.id,validateArr,'dialog');
	}
	$('#form-'+config.id).on('keydown',function(event){
		if(event.keyCode == 13){
			return false;
		}
	})
	//有需要加载的表格
	if(tableArr.length>0){
		popupBox.initTable(tableArr);
	}
	if(!$.isEmptyObject(upload_singleJson)){
		formPlane.componentUpload(config.id,upload_singleJson);
	}
	//tree-select类型
	if(!$.isEmptyObject(treeSelectJson)){
		treeUI.componentSelectPlane(config.id,treeSelectJson);
	}
	if(inputSelectArr.length > 0){
		formPlane.inputSelect(config.id,inputSelectArr);
	}
	//如果有upload组件，初始化
	if(!$.isEmptyObject(uploadJson)){
		var i = 1;
		var btnI = 0;
		$example_dropzone_filetable = $('#'+uploadJson.id);
		formPlane.dropzoneGetFile = {};
		formPlane.dropzoneGetFile['advancedDropzone'] = {};
		formPlane.dropzoneFile = {};
		formPlane.dropzoneFile['advancedDropzone'] = {};
		var uploadMaxFileLength = uploadJson.isAllowFiles ? Number(uploadJson.isAllowFiles):1;
		example_dropzone = $("#advancedDropzone").dropzone({
			url: uploadJson.uploadsrc,
			maxFiles:uploadMaxFileLength,
			dictMaxFilesExceeded:'您一次最多只能上传{{maxFiles}}个文件',
			addRemoveLinks:true,//添加移除文件
			dictInvalidFileType:'不支持上传的格式',
			dictResponseError:'文件上传失败',
			dictInvalidFileType:'文件名和类型不匹配',
			autoProcessQueue:true,//不自动上传
			init:function(){
				var dropzoneObj = this;
				formPlane.dropzoneFile['advancedDropzone'] = dropzoneObj;
			},
			addedfile: function(file)
			{
				if(i == 1)
				{
					$example_dropzone_filetable.find('tbody').html('');
				}
				
				var size = parseInt(file.size/1024, 10);
				size = size < 1024 ? (size + " KB") : (parseInt(size/1024, 10) + " MB");
				var	$el = $('<tr>\
								<th class="text-center">'+(i++)+'</th>\
								<td>'+file.name+'</td>\
								<td><div class="progress progress-striped"><div class="progress-bar progress-bar-warning"></div></div></td>\
								<td>'+size+'</td>\
								<td>Uploading...</td>\
							</tr>');
				
				$example_dropzone_filetable.find('tbody').append($el);
				file.fileEntryTd = $el;
				file.progressBar = $el.find('.progress-bar');
			},
			//一个文件被移除时发生
			removedfile:function(file){
				btnI--;
				if(btnI<0){
					btnI = 0;
					formPlane.dropzoneGetFile['advancedDropzone'] = {};
				}
			},
			uploadprogress: function(file, progress, bytesSent)
			{
				file.progressBar.width(progress + '%');
			},
			
			success: function(file,data)
			{
				file.fileEntryTd.find('td:last').html('<span class="text-success">上传成功</span>');
				file.progressBar.removeClass('progress-bar-warning').addClass('progress-bar-success');
				var btnHtml = '<td class="td-button">'
								+'<button type="button" class="btn btn-warning  btn-icon" fid="'+btnI+'" nstype="file-upload">'
									+'<i class="fa-trash"></i>'
								+'</button>'
							+'</td>';
				file.fileEntryTd.find('td:last').after(btnHtml);
				if(typeof(uploadJson.changeHandler)!='undefined'){
					var uploadFunc = uploadJson.changeHandler;
					uploadFunc(data,file);
				}
				formPlane.dropzoneGetFile['advancedDropzone'][btnI] = file;
				btnI++;
				file.fileEntryTd.find('button[nstype="file-upload"]').on('click',function(){
					var delFid = $(this).attr('fid');
					var removeFile = formPlane.dropzoneGetFile['advancedDropzone'][delFid];
					if(removeFile){
						formPlane.dropzoneFile['advancedDropzone'].removeFile(removeFile);
					}
				});
			},
			
			error: function(file,errorMessage)
			{
				file.fileEntryTd.find('td:last').closest('tr').remove();
				this.removeFile(file);
				//file.fileEntryTd.find('td:last').html('<span class="text-danger">失败</span>');
				//file.progressBar.removeClass('progress-bar-warning').addClass('progress-bar-red');
				nsalert(errorMessage);
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
	if(changeHandlerArr.length > 0){
		formPlane.componentHandler(config.id,changeHandlerArr);
	}
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
	if(selectHandlerArr.length>0){
		formPlane.validateSelectPlane(config.id,selectHandlerArr);
	}
	if(provSelectHandlerArr.length > 0){
		provinceSelect.init(config.id,provSelectHandlerArr);
	}
	//初始化完成后的回调
	if(typeof(config.showAfterHandler)=='function'){
		config.showAfterHandler(config);
	}
	//自动保存,储存数据
	if(typeof(config.autoSaveHandler)=='function'){
		popupBox.autoSaveValues = nsForm.getFormJSON(config.id, false);
		console.log(popupBox.autoSaveValues);
	}
};
popupBox.initTable = function(tableArr){
	var dataConfig = {};
	var columnConfig = {};
	var uiConfig = {};
	for(var tableID = 0; tableID<tableArr.length; tableID++){
		//id和src是必填项
		if(typeof(tableArr[tableID].id)=='undefined'){
			nsalert("表格ID未定义");
			return false;
		}
		if(typeof(tableArr[tableID].src)=='undefined' && typeof(tableArr[tableID].dataSource) == 'undefined'){
			nsalert("表格数据来源未定义");
			return false;
		}
		//srctype默认GET，dataSrc默认rows，data默认值是{}
		var srctype = 'GET';
	  	if(typeof(tableArr[tableID].srctype)!='undefined'){
			srctype = tableArr[tableID].srctype;
		}
		var dataSrc = 'data';
		if(typeof(tableArr[tableID].dataSrc)!='undefined'){
			dataSrc = tableArr[tableID].dataSrc;
		}
		var searchTitle = '搜索';
		if(typeof(tableArr[tableID].searchTitle)!='undefined'){
			searchTitle = tableArr[tableID].searchTitle;
		}
		var searchPlaceholder;
		if(typeof(tableArr[tableID].searchPlaceholder)!='undefined'){
			searchPlaceholder = tableArr[tableID].searchPlaceholder;
		}
		var scrollX = false;
		if(typeof(tableArr[tableID].scrollX)!='undefined'){
			scrollX = tableArr[tableID].scrollX;
		}
		// var tableColumns = tableArr[tableID].column;
		var tableColumns = [];
		if($.isArray(tableArr[tableID].columnConfig)){
			tableColumns = tableArr[tableID].columnConfig;
		}else{
			if($.isArray(tableArr[tableID].column)){
				tableColumns = tableArr[tableID].column;
			}
		}
		for(var columnI = 0; columnI < tableColumns.length; columnI ++){	
			if(tableColumns[columnI].removeHandler){
				tableColumns[columnI] = {
					title:'操作',
					formatHandler:{
						type:'upload',
						data:tableColumns[columnI].removeHandler
					}
				}
			}
		}
		columnConfig.columns = tableColumns;
		dataConfig = {
			tableID: 		tableArr[tableID].id,
			src: 			tableArr[tableID].src, 			
			type: 			srctype,							
			data: 			tableArr[tableID].data,			
			dataSrc: 		dataSrc,
			isServerMode: 	typeof(tableArr[tableID].isServerMode) == 'undefined' ? false:tableArr[tableID].isServerMode,      					
			isSearch: 		typeof(tableArr[tableID].isSearch) == 'undefined' ? false:tableArr[tableID].isSearch,      					
			isPage: 		typeof(tableArr[tableID].isPage) == 'undefined' ? false:tableArr[tableID].isPage,
			dataSource: 	tableArr[tableID].dataSource,
			info: 			typeof(tableArr[tableID].info) == 'undefined' ? true:tableArr[tableID].info,	
			isLengthChange:	tableArr[tableID].isLengthChange ? tableArr[tableID].isLengthChange:true
		};
		uiConfig = {
			searchTitle:searchTitle,
			searchPlaceholder:searchPlaceholder,
			isSelectColumns:tableArr[tableID].isSelectColumns?tableArr[tableID].isSelectColumns:false,
			isAllowExport: 	typeof(tableArr[tableID].isAllowExport) == 'undefined' ? false:tableArr[tableID].isAllowExport,          		 		
			pageLengthMenu:   tableArr[tableID].pageLengthMenu?tableArr[tableID].pageLengthMenu:['auto', 20, 50, 'all'],    	
			scrollAuto: 	tableArr[tableID].scrollAuto,
			isMulitSelect: 	typeof(tableArr[tableID].isMulitSelect) == 'boolean' ? tableArr[tableID].isMulitSelect:false,
			isSingleSelect: typeof(tableArr[tableID].isSingleSelect) == 'boolean' ? tableArr[tableID].isSingleSelect:true,
			scrollX: scrollX,
			scrollY:tableArr[tableID].scrollY,
			isorder:tableArr[tableID].isorder,
			dragWidth:tableArr[tableID].dragWidth,
			orderBtn:tableArr[tableID].orderBtn?tableArr[tableID].orderBtn:[],
			onLoadFilter:tableArr[tableID].onLoadFilter,
			onLoadSuccess:tableArr[tableID].onLoadSuccess,
			isUseTabs:tableArr[tableID].isUseTabs,
			isUseTableControl:tableArr[tableID].isUseTableControl,
			onLoadComplete:tableArr[tableID].onLoadComplete,
			tabsName:tableArr[tableID].tabsName
		};
		if(typeof(tableArr[tableID].scrollspace) == 'number'){
			uiConfig.scrollspace = tableArr[tableID].scrollspace;
		}
		if(typeof(tableArr[tableID].onSingleSelectHandler)!='undefined'){
			uiConfig.onSingleSelectHandler = tableArr[tableID].onSingleSelectHandler;
		}
		if(typeof(tableArr[tableID].onDoubleSelectHandler)!='undefined'){
			uiConfig.onDoubleSelectHandler = tableArr[tableID].onDoubleSelectHandler;
		}
		if(typeof(tableArr[tableID].onUnsingleSelectHandler)!='undefined'){
			uiConfig.onUnsingleSelectHandler = tableArr[tableID].onUnsingleSelectHandler;
		}
		if(typeof(tableArr[tableID].onUndoubleSelectHandler)!='undefined'){
			uiConfig.onUndoubleSelectHandler = tableArr[tableID].onUndoubleSelectHandler;
		}
		if(tableArr[tableID].primaryID){
			dataConfig.primaryID = tableArr[tableID].primaryID;
		}
		if(tableArr[tableID].contentType){
			dataConfig.contentType = tableArr[tableID].contentType;
		}
		baseDataTable.init(dataConfig, columnConfig.columns, uiConfig);
	}
}

popupBox.show = function(config,domSize){
	var domSizeName = arguments[1] ? arguments[1] : "m";
	var domStr = "#"+config.id;
	this.modal = $(domStr).modal('show', {backdrop: 'fade'});
	if(!$(domStr).hasClass("custom-width")){
		$(domStr).addClass("custom-width");
	}
	$(domStr).on('hide.bs.modal', popupBox.hideBeforeHandler);
	$(domStr).on('hidden.bs.modal', popupBox.hideAfterHandler);
	
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
//关闭前调用
popupBox.hideBeforeHandler = function(ev){
	var config = popupBox.config;
	var isAllowClose = true;
	//是取消操作
	if(popupBox.isNotCancelHandler == true){
		//不是取消操作，则更新自动保存的数据
		if(typeof(config.autoSaveHandler)=='function'){
			popupBox.autoSaveValues = nsForm.getFormJSON(config.id,false);
		}
	}else{
		//是取消操作
		if(typeof(config.autoSaveHandler)=='function'){
			//保存的数据是否修改过，如果修改则弹出提醒
			var unsaveValues = nsForm.getFormJSON(config.id, false);
			var isNeedWarning = !nsVals.isEqualObject(popupBox.autoSaveValues,unsaveValues);
			if(isNeedWarning){
				nsUI.confirm.show({
					content:'您有未保存的数据，是否保存？',
					btnsContent:['保存','不保存'],
					handler:function(isConfirm){
						if(isConfirm){
							config.autoSaveHandler(unsaveValues);
						}else{
							popupBox.hide();
						}
					}
				})
				isAllowClose = false;
			}
		}
	}
	if(popupBox.isOnlyCancel == true && popupBox.isNotCancelHandler == true){
		//隐藏操作不是由于取消引起的且设置了仅用于取消操作
	}else{
		var config = popupBox.config;
		//处理回调函数，根据返回值决定
		if(typeof(config.hideBeforeHandler)=='function'){
			var values = nsForm.getFormJSON(config.id, false);
			isAllowClose = config.hideBeforeHandler(values);
		}
	}
	return isAllowClose;
}
//关闭后调用
popupBox.hideAfterHandler = function(ev){
	if(popupBox.isOnlyCancel == true && popupBox.isNotCancelHandler == true){
		//隐藏操作不是由于取消引起的且设置了仅用于取消操作
	}else{
		var config = popupBox.config;
		if(typeof(config.hideAfterHandler)=='function'){
			var values = nsForm.getFormJSON(config.id,false);
			config.hideAfterHandler(values);
		}
	}
}
//关闭
popupBox.hide = function(){
	var config = popupBox.config;
	var returnValues = {};
	popupBox.isNotCancelHandler = true;
	if(typeof(config.hideBeforeHandler)=='function' || typeof(config.hideAfterHandler)=='function'){
		returnValues = nsForm.getFormJSON('plane-dialogS',false);
	}
	this.modal.modal('hide');
	popupBox.isNotCancelHandler = false;
	//this.config = undefined;
}
popupBox.getFormJson = function(){
	if(this.config){
		return nsForm.getFormJSON(this.config.id);
	}
}

popupBox.edit = function(editJsonArr,formID,size){
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
		var componentHtml = commonConfig.component(InputData,formID,'modal',size);
		var componentContainerHtml = componentHtml.substring(componentHtml.indexOf('=')+1,componentHtml.indexOf('>'));
		componentHtml = componentHtml.substring(componentHtml.indexOf('>')+1,componentHtml.lastIndexOf('<'));
		var hiddenInputID = 'form-'+formID+'-'+InputData.id;
		if(InputData.type == 'hidden'){
			if(inputContainer.parent().hasClass('row row-close')){
				$('#'+hiddenInputID).val(InputData.value);
			}
		}
		inputContainerAttr = componentContainerHtml.substring(componentContainerHtml.indexOf('"')+1,componentContainerHtml.length-1);
		inputContainer.closest('.form-group').attr('class',inputContainerAttr);
		inputContainer.closest('.form-group').html(componentHtml);
	}
}

popupBox.formEdit = function(editJsonArr, formID,size){
	var changeHandlerArr = [];
	var refreshSelectArr = [];
	var dateFormatArr = [];
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
		var componentHtml = commonConfig.component(InputData,formID,'modal',size);
		componentHtml = componentHtml.substring(componentHtml.indexOf('>')+1,componentHtml.lastIndexOf('<'));
		inputContainer.closest('.form-group').html(componentHtml);
		if(typeof(InputData.id)!='undefined'){
			if(typeof(InputData.changeHandler)!='undefined'){
				//非text-btn类型的组件有函数，集中处理，以change为标准
				changeHandlerArr.push(InputData);
			}
			if(InputData.type=='select'){
				refreshSelectArr.push(InputData);
			}
			if(InputData.type == 'date'){
				if(typeof(InputData.readonly)=='undefined'){
					dateFormatArr.push(InputData);
				}else{
					if(InputData.readonly == true){
						dateFormatArr.push(InputData);
					}
				}
			}
		}
	}
	//是否有日期类型
	if(dateFormatArr.length>0){
		formPlane.componentDate(formID,dateFormatArr);
	}
	for(refreshSel in refreshSelectArr){
		var refreshFormID = 'form-'+formID+'-'+refreshSelectArr[refreshSel].id;
		var refreshDisabled = false;
		if(typeof(refreshSelectArr[refreshSel].disabled) != 'undefined'){
			refreshDisabled = refreshSelectArr[refreshSel].disabled;
		}
		if(refreshDisabled){
			$('#'+refreshFormID).attr('disabled',true);
		}else{
			$('#'+refreshFormID).attr('disabled',false);
			$('#'+refreshFormID).selectBoxIt().on('open', function(){
				$(this).data('selectBoxSelectBoxIt').list.perfectScrollbar();
			});
		}
	}
	formPlane.componentHandler(formID,changeHandlerArr);
}