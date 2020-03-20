/*
 * 表单用户管理面板
 */
 nsUI.formmanager = {};
 nsUI.formmanager.init = function(formData){
 	var formJson = formData;
 	var formID = formJson.id;
 	nsUI.formmanager[formID] = {
 		form:formData.form,
 		editForm:{},
 	};
 	if($('body').children('.modal-formmanger').length!=0){
		$('body').children('.modal-formmanger').remove();
	}
 	$('body').append(getHtml());//追加元素
 	initFooter();//添加底部按钮元素
 	function getHtml(){
		var html = '<div class="modal-formmanger"  id="nsui-formmanger">'
					+'<div class="modal-content">'
						+'<div class="modal-header">'
							+'<h4 class="modal-title" id="nsui-formmanger-label">'
								+language.ui.nsuiformmanager.title
							+'</h4>'
						+'</div>'
						+'<div class="modal-body">'
							+'<ul class="nav nav-tabs float-right">'
								+'<li class="active"><a href="#nsui-formmanger-tabs-first" data-toggle="tab">基础设置</a></li>'
								+'<li><a href="#nsui-formmanger-tabs-second" data-toggle="tab">高级设置</a></li>'
							+'</ul>'
							+'<div class="tab-content">'
								+'<div class="tab-pane active" id="nsui-formmanger-tabs-first">'
									//+'<div class="form-content-intro">最多支持7个筛选字段</div>'
									+'<table id="nsui-formmanger-tabs-table-first"></table>'
								+'</div>'
								+'<div class="tab-pane" id="nsui-formmanger-tabs-second">'
									+'<div class="form-content-intro">注释：列宽只能设置为1-12的正整数<br />排序值为1到当前form元素的总长度，只能为正整数<br />显示隐藏只能设置true/false</div>'
									+'<table id="nsui-formmanger-table"></table>'
								+'</div>'
							+'</div>'
						+'</div>'
						+'<div class="modal-footer" id="nsui-formmanger-footer"></div>'
					+'</div>'
				+'</div>';
		return html;
	}
	function initFooter(){
		var btns = [
			{
				text: '保存',
				handler: function(){
					//保存按钮事件
					nsUI.formmanager.getData(formID);
				}
			},{
				text:'重置',
				handler:function(){
					var storeId = 'nsForm-'+formID;
					store.remove(storeId);
					nsUI.formmanager.refresh(formID);
				}
			},
			{
				text: '取消',
				handler: function(){
					$('#nsui-formmanger').remove();
				}
			}
		]
		nsButton.initBtnsByContainerID('nsui-formmanger-footer',btns);
	}
	//表格配置启动
	nsUI.formmanager.initTable(formID);
 }
 //加载表格内容
nsUI.formmanager.initTable = function(formID){
 	var originaFormArr = nsUI.formmanager[formID].form;//获取表单数组
	var dataArr = [];//要显示的数据
 	var increaseIndex = 0;//自增记录行下标
 	for(var i=0; i<originaFormArr.length; i++){
 		if($.isArray(originaFormArr[i])){
 			for(var arrI=0; arrI<originaFormArr[i].length; arrI++){
 				if(originaFormArr[i].type){
	 				if(originaFormArr[i].type !='hidden' && originaFormArr[i].type != 'html'){
	 					componentInit(i,originaFormArr[i][arrI],arrI);
	 				}
 				}
 			}
 		}else{
			if(originaFormArr[i].type){
	 			if(originaFormArr[i].type !='hidden' && originaFormArr[i].type != 'html'){
	 				componentInit(i,originaFormArr[i]);
	 			}
			}
 		}
 	}
 	function componentInit(groupIndex,config,arrI){
 		var hiddenStr = config.hidden ? '0' : '1';
 		var groupColumnIndex = typeof(arrI)=='undefined' ? '-1' : arrI;
 		var data = {
			data:config.id,//主键id
			title:config.label,//原标题
			newTitle:config.label,//新标题
			columnWidth:config.column,//列宽
			isHidden:hiddenStr,//是否隐藏，隐藏读0，显示读1
			//groupIndex:groupIndex,//所在分组下标
			rowIndex:groupIndex,//行下标
			disorder:(increaseIndex+1),//排序序列号
			//groupColumnIndex:groupColumnIndex,//所在分组的下标
 		}
 		dataArr.push(data);
 		
 		nsUI.formmanager[formID].editForm[config.id] = {
 			label:config.label,
 			hidden:config.hidden,
 			column:config.column,
 			nsIndex:groupIndex
 		};
 		increaseIndex++;
 	}
 	var tabFirstTableConfig = {
 		id:'nsui-formmanger-tabs-table-first',
 		primaryID:'data',
 		column:[
 			{
 				data:'isHidden',
 				title:'是否启用',
				type:'switch',
				width:30,
				changeHandler:changeSwitchHandler
 			},{
 				data:'title',
 				title:'支持筛选的字段',
				type:'input',
				readonly:true,
 			},{
 				data:'disorder',
 				title:'拖动调整顺序',
				type:'btn',
				width:30,
				btns:[
					{
						text:'拖拽',
						event:'mousedown',//事件类型，mousedown  默认click
						handler:changeDragSortHandler
					}
				]
 			}
 		],
 		ui:{
			plusClass:'no-border'
		},
		data:dataArr
 	}
 	nsUI.staticTable.init(tabFirstTableConfig);
 	var tableConfig = {
		id:'nsui-formmanger-table',
		primaryID:'data',
		column:[
			{
				data:'title',
				title:'原标题',
				type:'input',
				readonly:true,
			},{
				data:'newTitle',
				title:'新标题',
				type:'input',
				blurHandler:function(data){
					blurTitleHandler(data);
				}
			},{
				data:'columnWidth',
				title:'列宽',
				type:'input',
				rules:'positiveInteger max=12',
				blurHandler:function(data){
					blurColumnHandler(data);
				}
			},{
				data:'disorder',
				title:'排序',
				type:'input',
				rules:'positiveInteger max='+dataArr.length+'',
				isUseKeyupEvent:true,
				blurHandler:function(data){
					blurRefreshHandler(data);
				},
				changeHandler:function(data){
					changeSortHandler(data);
				},
			},{
				data:'isHidden',
				title:'隐藏',
				type:'select',
				typeData:{
					textField:'text',
					valueField:'id',
					withoutEmpty:true,
					subdata:[
						{
							id:'0',
							text:true
						},{
							id:'1',
							text:false
						}
					]
				},
				changeHandler:function(data){
					changeHiddenHandler(data)
				}
			}
		],
		ui:{
			plusClass:'no-border'
		},
		data:dataArr
	}
	nsUI.staticTable.init(tableConfig);
	/*********************事件的触发*******************************************/
	function changeDragSortHandler(data){
		var dataArr = data.tableData;
		for(var i=0;i<dataArr.length; i++){
			nsUI.formmanager[formID].editForm[dataArr[i].data].nsIndex = dataArr[i].disorder;
		}
	}
	function changeSwitchHandler(data){
		var isHidden = data.isChecked ? false : true;
		nsUI.formmanager[formID].editForm[data.rowData.data].hidden = isHidden;
	}
	//是否隐藏  0隐藏 1显示
	function changeHiddenHandler(data){
		var isHidden;
		if(data.value == '0'){isHidden = true;}else if(data.value == '1'){isHidden = false;};
		nsUI.formmanager[formID].editForm[data.rowData.data].hidden = isHidden;
	}
	//排序
	function changeSortHandler(data){
		if(data.isValid == false){
			nsalert('无效输入','warning');
			data.$dom.val(data.originalValue);
			return false;
		}else{
			if(data.isModify){
				if(data.value== ''){
					nsalert('无效输入','warning');
					data.$dom.val(data.originalValue);
					return false;
				}
				//当前显示的移动
				var settingSort = parseInt(data.value);//目标序列号
				var endRowIndex;//目标行号
				var currentNsIndex = data.rowData.disorder;//当前序列号
				var currentRowIndex = data.index.row;//当前行号
				var maxSort = data.tableData.length;
				var settingData;
				for(var rowI = 0; rowI < maxSort; rowI++){
					if(data.tableData[rowI].disorder == settingSort){
						endRowIndex = data.tableData[rowI].row;
						settingData = data.tableData[rowI].data;
					}
				}		
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
				rowIndexArr.splice(currentRowIndex, 1);//删除元素
				rowIndexArr.splice(endRowIndex, 0, currentRowIndex);//在第几个元素之前追加一个新元素

				for(var rowI = 0; rowI<existSortLength; rowI++){
					dataArr[rowIndexArr[rowI]].editNsIndex = dataArr[rowI].originalNsIndex;
					dataArr[rowIndexArr[rowI]].editRowIndex = dataArr[rowI].originaRowIndex;
				}
				for(var dataI = 0; dataI<existSortLength; dataI++){
					data.tableData[dataI].disorder = dataArr[dataI].editNsIndex;
					nsUI.staticTable.setValue(data.tableID, 'disorder', dataI, dataArr[dataI].editNsIndex);
				}
			}
		}
	}
	function blurRefreshHandler(data){
		var dataArr = data.tableData;
		dataArr.sort(function(a,b){
			return a.disorder - b.disorder
		});
		for(var i=0;i<dataArr.length; i++){
			nsUI.formmanager[formID].editForm[dataArr[i].data].nsIndex = dataArr[i].disorder;
		}
		nsUI.staticTable.refresh(dataArr,'nsui-formmanger-table');
	}
	//列宽
	function blurColumnHandler(data){
		if(data.isValid == false){
			nsalert('无效输入','warning');
			data.$dom.val(data.originalValue);
			return false;
		}else{
			if(data.isModify){
				if(data.value== ''){
					nsalert('无效输入','warning');
					data.$dom.val(data.originalValue);
					return false;
				}
				nsUI.formmanager[formID].editForm[data.rowData.data].column = data.value;
			}
		}
	}
	//标题
	function blurTitleHandler(data){
		if(data.isModify){
			if(data.value== ''){
				nsalert('无效输入','warning');
				data.$dom.val(data.originalValue);
				return false;
			}
			nsUI.formmanager[formID].editForm[data.rowData.data].label = data.value;
		}
	}
 }
 //得到数据
 nsUI.formmanager.getData = function(formID){
 	var formJson = nsUI.formmanager[formID].editForm;
	var storeId = 'nsForm-'+formID;
	store.set(storeId,formJson);
 	nsUI.formmanager.refresh(formID);
 }
 //保存完成之后刷新操作
 nsUI.formmanager.refresh = function(formID){
 	$('#nsui-formmanger').remove();
 	var formData = nsForm.organizaData[formID];
 	nsForm.init(formData);
 }
