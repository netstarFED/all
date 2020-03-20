nsUI.importdialog = {};
nsUI.importdialog.init = function(modalObject){
	var modal = {
		language:		{},
		showPage: 		0,
		id: 			modalObject.id,				//弹框id
		linkUrl: 		modalObject.url,			//下载数据模板地址
		title: 			modalObject.title,			//弹框标题
		type: 			modalObject.type,			//类型
		selectDataAjax: modalObject.selectDataAjax, //开始导入ajax参数
		confirmDataAjax:modalObject.confirmDataAjax,//确认导入ajax参数
		returnLeadData: {},
		showBtn:function(x,y,z){
					var footerAddress = $('#nsUI-importdialog-'+nsUI.importdialog.modal.id+" .modal-footer");
					for(var index=0;index<footerAddress.children("button").length;index++){
						footerAddress.children("button").eq(index).css("display","none");
					}
					footerAddress.children("button").eq(x).css("display","inline-block");
					footerAddress.children("button").eq(y).css("display","inline-block");
					footerAddress.children("button").eq(z).css("display","inline-block");
					$("#nsUI-importdialog-"+nsUI.importdialog.modal.id+" .modal-body-content").children().remove();
				},
		showNavStyle:function(z){ //console.log(z);
					var progress = $('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-stepProcess').children("ul").children("li");
					for(var index=0;index<progress.length;index++){
						progress.eq(index).removeClass("current");
					}
					// progress.eq(z-1).addClass("complete");
					// progress.eq(z).addClass("current");
					progress.eq(z).addClass("current");
					if(z>=1){
						progress.eq(z-1).addClass("complete");
						if(z==2){
							progress.eq(z-2).addClass("complete");
						}
					}
				}
	}
	//弹框用到的汉字
	if(typeof(modalObject.showExplainData) == "object" && JSON.stringify(modalObject.showExplainData) != "{}"){
		modal.language.stepFirst = modalObject.showExplainData;
	}else{
		modal.language.stepFirst = language.ui.nsuiimportDialog.stepFirst;
	}
	if(typeof(modalObject.selectDataAjax.showExplainData) == "object" && JSON.stringify(modalObject.selectDataAjax.showExplainData) != "{}"){
		modal.language.stepSecond = modalObject.selectDataAjax.showExplainData;
	}else{
		modal.language.stepSecond = language.ui.nsuiimportDialog.stepSecond;
	}
	if(typeof(modalObject.confirmDataAjax.showExplainData) == "object" && JSON.stringify(modalObject.confirmDataAjax.showExplainData) != "{}"){
		modal.language.stepThird = modalObject.confirmDataAjax.showExplainData;
	}else{
		modal.language.stepThird = language.ui.nsuiimportDialog.stepThird;
	}
	nsUI.importdialog.modal = modal;
	var modalHtml = '';
	var titleHtml = '';
	if(nsUI.importdialog.modal.title!=''){
		titleHtml = '<div class="modal-header">'
						+'<button type="button" class="close" data-dismiss="modal" aria-hidden="true" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'closeLead">×</button>'
						+'<h4 class="modal-title" id="nsUI-importdialog-myModalLabel">'+nsUI.importdialog.modal.title+'</h4>'
					+'</div>';
	}
	modalHtml = '<div class="modal fade bs-example-modal-lg" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
					+'<div class="modal-dialog modal-lg uimodal">'
						+'<div class="modal-content">'
							+titleHtml
							+'<div class="modal-body">'
								+'<div class="step_process" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-stepProcess">'
									+'<ul>'
										+'<li class="current"><span>文档上传</span></li>'
										+'<li><span>云端导入</span></li>'
										+'<li><span>完成</span></li>'
									+'</ul>'
								+'</div>'
								+'<div class="modal-body-content">'
								+'</div>'
							+'</div>'
							+'<div class="modal-footer">'
								+'<button type="button" class="btn btn-info" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-startToLead">开始导入</button>'
								+'<button type="button" class="btn btn-info" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-confirmToLead">确认导入</button>'
								+'<button type="button" class="btn btn-info" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-successLeaddata">完成</button>'
								+'<button type="button" class="btn btn-info" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-returnLeaddata">返回</button>'
								+'<button type="button" class="btn btn-default" data-dismiss="modal" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-cancelLead">取消</button>'
							+'</div>'
						+'</div>'
					+'</div>'
				+'</div>';
	$("body").append(modalHtml);
	nsUI.importdialog.modal.$container = $("#nsUI-importdialog-"+nsUI.importdialog.modal.id);
	nsUI.importdialog.modal.$container.modal();
}
nsUI.importdialog.returnShow = function(pageNumber,dataJson){
	showPageObj = {};
	if(pageNumber == 2){
		showPageObj = nsUI.importdialog.excelPage;
		var a = showPageObj.footerShowBtn[0];
		var b = showPageObj.footerShowBtn[1];
		var c = showPageObj.footerShowBtn[1];
	}else{
		if(pageNumber == 3){
			showPageObj = nsUI.importdialog.selectPage;
			var a = showPageObj.footerShowBtn[0];
			var b = showPageObj.footerShowBtn[1];
			var c = showPageObj.footerShowBtn[2];
		}
	}
	nsUI.importdialog.modal.showBtn(a,b,c);	//返回的状态（按钮，头部）
	if(typeof(dataJson) == "object"){
		showPageObj.showHtmlFun(dataJson);
	}else{
		showPageObj.showHtmlFun();
	}
	// showPageObj.showHtmlFun(dataJson);
	nsUI.importdialog.modal.showNavStyle(showPageObj.progressClass);   //返回的页数
}
nsUI.importdialog.show = function(nsModalObject,columnConfig){
	nsUI.importdialog.init(nsModalObject);
	nsUI.importdialog.modal.showBtn(nsUI.importdialog.excelPage.footerShowBtn[0],nsUI.importdialog.excelPage.footerShowBtn[1]);
	nsUI.importdialog.excelPage.showHtmlFun();

	$('#nsUI-importdialog-'+nsUI.importdialog.modal.id).on('hidden.bs.modal',function(){			//完全隐藏时移除modal
		$("#nsUI-importdialog-"+nsUI.importdialog.modal.id).remove();
	});

	$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-successLeaddata').off("click");
	$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-successLeaddata').on("click",function(){	//点击成功恢复隐藏
		$("#nsUI-importdialog-"+nsUI.importdialog.modal.id).modal('hide');
		if($("#table-nstemplate-layout-templatetes-search-table")){
			baseDataTable.refreshByID("table-nstemplate-layout-templatetes-search-table");//刷新表格
		}
	});

	$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-returnLeaddata').off('click');
	$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-returnLeaddata').on('click',function(){
		if(typeof(nsUI.importdialog.modal.obtainData) == "object"){
			nsUI.importdialog.returnShow(nsUI.importdialog.modal.showPage,nsUI.importdialog.modal.obtainData);
		}else{
			nsUI.importdialog.returnShow(nsUI.importdialog.modal.showPage);
		}
	});

	$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-confirmToLead').off("click");
	$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-confirmToLead').on("click",function(){				//点击确认导入
		var returnJSON = [];
		for(var key in nsUI.importdialog.modal.returnLeadData.data){
			for(var index in nsUI.importdialog.modal.returnLeadData.data[key]){
				if(nsUI.importdialog.modal.returnLeadData.data[key][index]["checkedFlag"] == 1){
					returnJSON.push(nsUI.importdialog.modal.returnLeadData.data[key][index]);
				}
			}
		}
		if(returnJSON.length == 0){
			nsalert("没有要导入的数据");
		}else{
			// var data = returnJSON; console.log(data)
			var arrString = {
				data:JSON.stringify(returnJSON),
				Interfacetype:nsModalObject.Interfacetype
			}
			// console.log(arrString);
			$.ajax({
				url: 		nsUI.importdialog.modal.confirmDataAjax.url,
				type: 		nsUI.importdialog.modal.confirmDataAjax.type,
				dataType: 	nsUI.importdialog.modal.confirmDataAjax.dataType,
				data: 		arrString,
				beforeSend:function(){
					nsUI.importdialog.loadingPage.showHtmlFun();			//确认导入之前
				},
				success:function(data){
					console.log(data);
					if(data.success){										//确认导入成功后
						nsUI.importdialog.modal.showBtn(nsUI.importdialog.successPage.footerShowBtn[0],nsUI.importdialog.successPage.footerShowBtn[1]);
						nsUI.importdialog.successPage.showHtmlFun(returnJSON);	//显示成功页面
						nsUI.importdialog.modal.showNavStyle(nsUI.importdialog.successPage.progressClass);
					}else{
						nsUI.importdialog.modal.showBtn(nsUI.importdialog.failurePage.footerShowBtn[0],nsUI.importdialog.failurePage.footerShowBtn[1]);
						nsUI.importdialog.failurePage.showHtmlFun();	//显示失败页面
					}
				}
			});
		}
	});

	$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-startToLead').off('click');			
	$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-startToLead').on('click',function(){			//开始导入
		var staicfile = document.getElementById('nsUI-importdialog-'+nsUI.importdialog.modal.id+'-modalUpload').files[0];
		var formData = new FormData();
		formData.append("Interfacetype",1);
		formData.append("file",staicfile);
		formData = '';
		$.ajax({
			url: 		nsUI.importdialog.modal.selectDataAjax.url,
			type: 		nsUI.importdialog.modal.selectDataAjax.type,
			contentType: false,
			processData:false,
			data:   	formData,
			beforeSend:function(){
				nsUI.importdialog.loadingPage.showHtmlFun();	//加载成功之前
			},
			success:function(data){						//加载成功
				console.log(data);
				if(data.success){

					if(typeof(nsUI.importdialog.modal.selectDataAjax.dataSrc) == "string"){
						var dataString = nsUI.importdialog.modal.selectDataAjax.dataSrc;
					}else{
						var dataString = "rows";
					}

					nsUI.importdialog.modal.obtainData = data[dataString];

					nsUI.importdialog.modal.showBtn(nsUI.importdialog.selectPage.footerShowBtn[0],nsUI.importdialog.selectPage.footerShowBtn[1],nsUI.importdialog.selectPage.footerShowBtn[2]);
					nsUI.importdialog.modal.returnLeadData.data = nsUI.importdialog.selectPage.showHtmlFun(data[dataString],columnConfig);		//显示确认导入页面
					nsUI.importdialog.modal.showNavStyle(nsUI.importdialog.selectPage.progressClass);
				}else{
					nsUI.importdialog.modal.showBtn(nsUI.importdialog.failurePage.footerShowBtn[0],nsUI.importdialog.failurePage.footerShowBtn[1]);
					nsUI.importdialog.failurePage.showHtmlFun();	//显示失败页面
				}
			}
		});
	});
}
nsUI.importdialog.excelPage = {
	showHtmlFun:function(){
					nsUI.importdialog.modal.showPage = 1;
					var modalBodyContent = '';
					var modalBodyContentInformation = '';
					modalBodyContentInformation += '<p>'+nsUI.importdialog.modal.language.stepFirst.information.title+'</p>';
					modalBodyContentInformation += '<p>'+nsUI.importdialog.modal.language.stepFirst.information.warning.title+'</p>';
					for(var key in nsUI.importdialog.modal.language.stepFirst.information.warning.warnArray){
						modalBodyContentInformation += '<p>'+nsUI.importdialog.modal.language.stepFirst.information.warning.warnArray[key]+'</p>';
					}
					modalBodyContent = '<div class="text-link"><a href="'+nsUI.importdialog.modal.linkUrl+'"><i class="fa-download"></i>'+nsUI.importdialog.modal.language.stepFirst.linkUrl+'</a></div>'
										+'<div class="modal-content-tips">'+modalBodyContentInformation+'</div>'
										+'<form class="input-file" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-form">'
											// +'<input type="hidden" id="url" name="Interfacetype">'
											+'<input type="file" accept="text/xlsx" class="form-control" name="file" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-modalUpload"/>'
											+'<span class="file-name"><span>'
										+'</form>'
					$("#nsUI-importdialog-"+nsUI.importdialog.modal.id+" .modal-body-content").append(modalBodyContent);
					$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-startToLead').attr("disabled","disabled");

					$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-modalUpload').on('click',function(e){
						$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-form')[0].reset();
					});
					$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-modalUpload').on('change',function(){
						$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-startToLead').removeAttr("disabled");
						var val = $(this).val();
						var valname = val.substring(val.lastIndexOf("\\")+1);
						$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-form span').text(valname);
					});
				},
	progressClass:0,
	footerShowBtn:[0,4]
}
nsUI.importdialog.selectPage = {
	showHtmlFun:function(dataRows,columnConfig){
					nsUI.importdialog.modal.showPage = 2;
					var modalBodyContent = '';
					var tableHtml = '';
					// 第二个页面---确认导入显示的内容
					modalBodyContent = '<ul class="nav nav-tabs" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-imformationClass">'
											+'<li id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-imformationClass-imformationData" class="active"><a href="javascript:void(0)">成功<span class="badge"></span></a></li>'
											+'<li id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-imformationClass-duplicateData"><a href="javascript:void(0)">重复<span class="badge"></span></a></li>'
											+'<li id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-imformationClass-errorData"><a href="javascript:void(0)">错误<span class="badge"></span></a></li>'
										+'</ul>'
										+'<div class="tab-content" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-table">'
										+'</div>';

					$("#nsUI-importdialog-"+nsUI.importdialog.modal.id+" .modal-body-content").append(modalBodyContent);			//插入导入的数据表格

					//数据类别的处理---添加默认选中、禁用---计算各类别数据个数，并显示在li中
					
					for(var name in dataRows){//debugger
						for(var key in dataRows[name]){
							if(name == "successData" || name == "repeatData"){
								if(name == "successData"){	
									dataRows[name][key]["checkedFlag"] = 1;
								}else{
									dataRows[name][key]["checkedFlag"] = 0;
								}
							}else{
								dataRows[name][key]["State"] = "unSelect";
								dataRows[name][key]["checkedFlag"] = 0;
							}
						}
					}
					// console.log(dataRows);
					// 列表旁显示数量
					nsUI.importdialog.modal.returnLeadData.successShowdata = dataRows.successData.length;
					nsUI.importdialog.modal.returnLeadData.repetitionShowdata = dataRows.repeatData.length;
					nsUI.importdialog.modal.returnLeadData.errorShowdata = dataRows.failData.length;
					var tableNavIdChildren = $('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-imformationClass').children("li");
					tableNavIdChildren.eq(0).children("a").children("span").text(nsUI.importdialog.modal.returnLeadData.successShowdata);
					tableNavIdChildren.eq(1).children("a").children("span").text(nsUI.importdialog.modal.returnLeadData.repetitionShowdata);
					tableNavIdChildren.eq(2).children("a").children("span").text(nsUI.importdialog.modal.returnLeadData.errorShowdata);
					
					//点击（成功、重复、错误）显示的数据
					function clickShowData(_string){
						var columnConfigT = [];
						columnConfigT = $.extend(true,[],columnConfig);
						console.log(columnConfigT);
						// columnHidden = true;//默认隐藏列
						if(_string == "failData"){
							// columnHidden = false;//显示列
							columnConfigT.push({
								field : 'error',
								title : '错误原因',
								hidden:false,
								tabPosition:'before',
								width:200,
							});
						}
						$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-table').append('<div class="table-responsive">'
																								+'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="nsUI-importdialog-'+nsUI.importdialog.modal.id+'-table-content"></table>'
																							+'</div>');
						var dataConfig = {								//允许的数据
							tableID:		'nsUI-importdialog-'+nsUI.importdialog.modal.id+'-table-content',
							dataSource: 	dataRows[_string]
						};
						columnConfigT.push({
							field:'checkedFlag',
							title:'选择',
							width:100,
							tabPosition:'after',
							formatHandler:{
								type:'checkbox',
								rules:'required',
								data:
									[
										{
											textField:'name',
											valueField:'id',
											handler:function(data,state,value){
											},
											checkedFlag:'1',
											uncheckedFlag:'0',
											isDisabledFlage:'State',
											value:'0',
										}
									]
							}
						});
						// var columnConfig = [							//title列标题 ，field显示的数据
						// 	{
						// 		field : 'error',
						// 		title : '错误原因',
						// 		hidden:columnHidden,
						// 		width:100,
						// 	},{
						// 		field : 'accountRate',
						// 		title : '客户名称',
						// 		tabPosition:'before',
						// 		width:100,
						// 	},{
						// 		field : 'accountNewsource',
						// 		title : '客户源',
						// 		width:100,
						// 	},{
						// 		field : 'accountState',
						// 		title : '状态',
						// 		width:100,
						// 	},{
						// 		field : 'accountByName',
						// 		title : '姓名',
						// 		width:100,
						// 	},{
						// 		field : 'area',
						// 		title : '省/市',
						// 		width:100,
						// 	},{
						// 		field : 'city',
						// 		title : '市',
						// 		width:100,
						// 	},{
						// 		field : 'detailedAddress',
						// 		title : '县/区',
						// 		width:100,
						// 	},{
						// 		field : 'email',
						// 		title : '邮箱',
						// 		width:100,
						// 	},{
						// 		field : 'industry',
						// 		title : '来源',
						// 		width:100,
						// 	},{
						// 		field : 'accountState',
						// 		title : '地址',
						// 		width:100,
						// 	},{
						// 		field:'checkedFlag',
						// 		title:'选择',
						// 		width:100,
						// 		tabPosition:'after',
						// 		formatHandler:{
						// 			type:'checkbox',
						// 			rules:'required',
						// 			data:
						// 				[
						// 					{
						// 						textField:'name',
						// 						valueField:'id',
						// 						handler:function(data,state,value){
						// 						},
						// 						checkedFlag:'1',
						// 						uncheckedFlag:'0',
						// 						isDisabledFlage:'state',
						// 						value:'0',
						// 					}
						// 				]
						// 		}
						// 	}
						// ];
						var uiConfig = {
							pageLengthMenu: 5,			//显示5行
							isSingleSelect:true,		//是否开启单行选中
							isUseTabs:true,
						};
						baseDataTable.init(dataConfig, columnConfigT, uiConfig);	//显示表格数据
					}
					clickShowData("successData");		//默认显示允许数据
					//点击显示数据
					$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-imformationClass li').off('click');
					$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-imformationClass li').on('click',function(even){
						if(typeof($('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-table').children()) == "object"){
							$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-table').children().remove();
						}
						$('#nsUI-importdialog-'+nsUI.importdialog.modal.id+'-imformationClass li').removeClass("active");
						if($(even.target).is("span")){
							var liId = $(even.target).parent().parent().text();
							$(even.target).parent().parent().addClass("active");
						}else{
							var liId = $(even.target).parent().text();
							$(even.target).parent().addClass("active");
						}
						if(liId.match("成功")){
							var dataSourceString = "successData";
						}else {
							if(liId.match("重复")){
								var dataSourceString = "repeatData";
							}else{
								if(liId.match('错误')){
									var dataSourceString = "failData";
								}
							}
						}
						clickShowData(dataSourceString);
					});
					// console.log(dataRows);
					return dataRows; //返回数据
				},
	progressClass:1,
	footerShowBtn:[1,3,4]
}
nsUI.importdialog.successPage = {
	showHtmlFun:function(returnJSON){
					nsUI.importdialog.modal.showPage = 3;
					var successHtml = '';
					//显示：成功数据；重复数据；错误数据；导出数据
					var dataNumberSuccess = nsUI.importdialog.modal.returnLeadData.successShowdata
					var dataNumberRepeat = nsUI.importdialog.modal.returnLeadData.repetitionShowdata;
					var dataNumberError = nsUI.importdialog.modal.returnLeadData.errorShowdata;
					var dataNumberLead = returnJSON.length;
					successHtml = '<div class="loading-data">'
									+'<i class="fa-check-circle"></i>'
									+'<h4>导入成功</h4>'
								+'</div>'
								+'<div class="statistics">'
									+'<div class="statistics-item"><span>'+dataNumberSuccess+'</span>成功数据</div>'
									+'<div class="statistics-item"><span>'+dataNumberRepeat+'</span>重复数据</div>'
									+'<div class="statistics-item"><span>'+dataNumberError+'</span>错误数据</div>'
									+'<div class="statistics-item"><span>'+dataNumberLead+'</span>导入数据</div>'
								+'</div>';

					$("#nsUI-importdialog-"+nsUI.importdialog.modal.id+" .modal-body-content").append(successHtml);
				}, 
	progressClass:2,
	footerShowBtn:[2,4]
}
nsUI.importdialog.loadingPage = {
	showHtmlFun:function(_returnJSON){
					var loadingHtml = '';
					loadingHtml = '<div class="loading-data"><div class="loader-2"></div></div>';
					$("#nsUI-importdialog-"+nsUI.importdialog.modal.id+" .modal-body-content").children().remove();
					$("#nsUI-importdialog-"+nsUI.importdialog.modal.id+" .modal-body-content").prepend(loadingHtml);	//在.modal-body-content容器内要插入loadingHtml
				}
}
nsUI.importdialog.failurePage = {
	showHtmlFun:function(){
					nsUI.importdialog.modal.showPage++;
					var failureHtml = '';
					failureHtml = '<div class="loading-data">'
									+'<i class="fa-times-circle"></i>'
									+'<h4>导入失败</h4>'
								+'</div>';

					$("#nsUI-importDialog-"+nsUI.importdialog.modal.id+" .modal-body-content").children().remove();
					$("#nsUI-importdialog-"+nsUI.importdialog.modal.id+" .modal-body-content").append(failureHtml);
				},
	footerShowBtn:[3,4]
}