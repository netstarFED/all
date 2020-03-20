/***
***列表过滤模板组成包含button,form,table,tab
*****/
/******************** 列表过滤模板 start ***********************/
nsTemplate.templates.listFilter = (function(){
	var config = {};
	var templateData = {};
	var customerComponentObj = {};//自定义组件如快速录入 ，增查删改一体等组件
	var searchParam = {};
	function templateInit(){
		nsTemplate.templates.listFilter.data = {};  
		/* 保存在该对象上的数据分为四个：
		 * config(运行时参数)，
		 * original（原始配置参数）
		 */
	}
	//验证
	function listFilterValidate(config){
		var isValid = true;
		var validArr = 
		[
			['form','object',true],
			['table','object',true],
			['tab','object']
		];
		isValid = nsDebuger.validOptions(validArr,config);//验证当前模板的配置参数
		if(isValid == false){return false;}
		isValid = nsTemplate.validConfigByForm(config.form);//验证form表单的配置参数
		if(isValid == false){return false;}
		isValid = nsTemplate.validConfigByTable(config.table,{isMainTable:true});//验证表格的配置参数
		if(isValid == false){return false;}
		return isValid;
	}
	function getData(){
		var formJson = nsTemplate.getChargeDataByForm(config.fullFormId);
		var tableArr = nsTable.getAllTableData(config.fullTableId);
		var data = {
			form:formJson,
			table:tableArr,
		}
		return data;
	}
	//刷新表格
	function refreshTable(dataSourceArray){
		//console.log(config.table.tableDataMode)
		switch(config.table.tableDataMode){
			case 'server':
				if(config.mode == 'mobile-crm-search'){
					nsList.refresh(config.fullTableId, dataSourceArray);
				}else{
					baseDataTable.reloadTableAJAX(config.fullTableId,{});
				}
				break;
			case 'dataSource':
				var mainTableId = config.fullTableId;
				if(config.browersystem == 'mobile'){
					nsList.refresh(config.fullTableId, dataSourceArray);
				}else{
					var cPage = baseDataTable.data[mainTableId].currentPage;
					baseDataTable.originalConfig[mainTableId].dataConfig.dataSource = dataSourceArray;
					baseDataTable.refreshByID(mainTableId);
				}
				break;
			case 'block':
				nsList.refresh(config.fullTableId, dataSourceArray);
				break;
		}
		//刷新当前页
		//baseDataTable.table[mainTableId].page(cPage).draw(false);
	}
	function refreshMainTable(paramObject){
		//筛选条件
		var tableParamsObject = {};
		if(paramObject){
			tableParamsObject = $.extend(true,{},paramObject);
		}else{
			var formParamsObject = nsTemplate.getChargeDataByForm(config.fullFormId,false);
			tableParamsObject = $.extend(true,{},formParamsObject);
			for(var param in config.table.ajax.data){
				tableParamsObject[param] = config.table.ajax.data[param];
			}
			if(!$.isEmptyObject(searchParam)){
				for(var search in searchParam){
					tableParamsObject[search] = searchParam[search];
				}
			}
		}
		var isServerMode = config.table.params.isServerMode;
		if(config.mode == 'mobile-crm-search'){
			isServerMode = false;
			tableParamsObject.start = 0;
			tableParamsObject.length = 10;
		}
		tableParamsObject = nsServerTools.deleteEmptyData(tableParamsObject);
		var listAjax = nsVals.getAjaxConfig(config.table.ajax,tableParamsObject,{idField:config.table.idField,keyField:config.table.keyField,pageParam:config.pageParam,parentObj:config.parentObj});
		if(isServerMode){
			//服务端
			baseDataTable.reloadTableAJAX(config.fullTableId,tableParamsObject);
		}else{
			nsVals.ajax(listAjax, function(res){
				if(res.success){
					var listData = res[config.table.ajax.dataSrc]; //数组对象
					//验证 dataSrc是否设置正确
					if(typeof(listData)=='undefined'){
						console.error('config.table.ajax.dataSrc : '+config.table.ajax.dataSrc+' 与返回数据不匹配');
						console.error(res);
						listData = [];
						//return false;
					}
					var dataSourceArray = [];
					for(var listI=0; listI<listData.length; listI++){
						dataSourceArray.push(listData[listI]);
					}
					refreshTable(dataSourceArray);
				}
			},true)
		}
	}

	//弹框调用前置方法
	function dialogBeforeHandler($btn){
		/*
			*$btn 行内按钮和外部按钮
			    *外部按钮是个dom对象元素
			    *行内按钮是object对象（应用在table行按钮）
		*/
		var data = $btn;
		var isOuterBtn = false;//是否外部按钮
		if($btn[0]){
			//外部按钮
			isOuterBtn = true;
		}
		data.containerFormJson = {};
		var formId;
		var selectTableArray = [];
		var allParamData = {};//如果是自定义整体传参 mainList mainForm  searchForm  mainVo
		if($btn.rowData){
			//如果是行内按钮则直接返回行的数据
			data.value = $btn.rowData;
			formId = data.tableId.substring(data.tableId.indexOf('-')+1,data.tableId.length)+'-customerform';
			selectTableArray.push(data.value);
			allParamData.mainVo = $btn.rowData;
		}else{
			if(config.browersystem == 'mobile'){
				formId = config.fullFormId;
				if(data.rowData){
					data.value = data.rowData;
				}
				//data.value = false;
			}else{
				var selectedData = baseDataTable.getTableSelectData(config.fullTableId,false);//获取行选中数据
				if(selectedData){
					data.value = selectedData;
					allParamData.mainVo = selectedData;
					selectTableArray = selectedData;
				}else{
					data.value = false;
				}
				var navId = $btn.closest('.nav-form').attr('id');
				formId = navId.substring(0,navId.lastIndexOf('-'))+'-customerform';
			}
		}
		data.options = {idField:config.table.idField};
		if($('#'+formId).length > 0){
			//存在form
			data.containerFormJson = nsTemplate.getChargeDataByForm(formId);
			if(config.table.add.keyField){
				allParamData[config.table.add.keyField] = data.containerFormJson;
			}else{
				allParamData.mainForm = data.containerFormJson;
			}
		}
		data.btnOptionsConfig = {
			currentTable:'main',//当前操作是主表还是附表
			isOuterBtn:isOuterBtn,//是否是外部按钮
			descritute:{keyField:config.table.keyField,idField:config.table.idField}
		}
		//sjj20181029  ajaxDataParamSource
		if(typeof(data.controllerObj.ajaxDataParamSource)=='string'){
			if(data.controllerObj.ajaxDataParamSource == 'all'){
				//value值为整个界面所有可获取的值
				var formJson = nsTemplate.getChargeDataByForm(config.fullFormId);
				if(config.form.keyField){
					allParamData[config.form.keyField] = formJson;
				}else{
					allParamData.searchForm = formJson;
				}
				if(config.table.keyField){
					allParamData[config.table.keyField] = selectTableArray;
				}else{
					allParamData.mainList = selectTableArray;
				}
				data.value = allParamData;
			}
		}
		data.config = config;
		return data;
	}
	//弹框ajax保存前置方法
	function ajaxBeforeHandler(handlerObj){
		//是否有选中值有则处理，无则返回
		handlerObj.config = config;
		handlerObj.ajaxConfigOptions = {
			idField:config.table.idField,
			keyField:config.table.keyField,
			pageParam:config.pageParam,
			parentObj:config.parentObj
		};
		return handlerObj;
	}
	//弹框ajax保存后置方法
	function ajaxAfterHandler(res){
		if(debugerMode){
			if($.isArray(res)){
				//数组返回值
			}else{
				if(typeof(res.objectState)!='number'){
					console.error('服务器返回数据没有objectState属性，无法执行');
					nsalert('服务器返回数据没有objectState属性，无法执行', 'error');
					return false;
				}
			}
		}
		switch(res.objectState){
			case NSSAVEDATAFLAG.DELETE:
				//删除
				nsList.delById(config.fullTableId, res);
				break;
			case NSSAVEDATAFLAG.EDIT:
				//修改
				nsList.rowEdit(config.fullTableId, res, {isUseNotInputData:true});
				break;
			case NSSAVEDATAFLAG.ADD:
				//修改
				nsList.rowEdit(config.fullTableId, res, {isUseNotInputData:true});
				break;
			case NSSAVEDATAFLAG.VIEW:
				//刷新
				refreshMainTable();
				break;
		}
		if($.isArray(res)){
			refreshMainTable();
		}
	}
	//弹框初始化加载界面
	function loadPageHandler(data){
		return data;
	}
	//关闭弹框界面
	function closePageHandler($btn){
			/*
			*$btn 行内按钮和外部按钮
			    *外部按钮是个dom对象元素
			    *行内按钮是object对象（应用在table行按钮）
		*/
		var data = $btn;
		var isOuterBtn = false;//是否外部按钮
		if($btn[0]){
			//外部按钮
			isOuterBtn = true;
		}
		if(isOuterBtn){
			var layoutId = $btn.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.listFilter.data[layoutId].config;
		}else{
			var layoutId = $btn.obj.closest('nsTemplate').children('layout').attr('id');
			config = nsTemplate.templates.listFilter.data[layoutId].config;
		}
		if(!$.isEmptyObject(config.getValueAjax)){
			refreshInitAjaxData();
		}else{
			if(config.table.params.isServerMode){
				var pageInfo = nsTable.table[config.fullTableId].page.info();
				nsTable.table[config.fullTableId].page(pageInfo.page).draw(false);
			}else{
				refreshMainTable();
			}
		}
	}
	//设置默认值
	function setDefault(){
		//layout的默认配置参数
		config = nsTemplate.setDefaultByTemplate(config);//默认值设置
		var layoutConfig = {
			navId:									'nav',
			tableId:								'table',
			formId:									'form',
			tabId:									'tabs',
			fullFormId:								config.id+'-form',
			fullTableId:							'table-'+config.id+'-table',
			fullTabId:								config.id + '-tabs',
			fullTitleId:							config.id+'-templateTitle',
			tableJson:								'tableJson',
			formJson:								'formJson',
			tableContainerJson:						'tableContainerJson',
			tab:									{},
			isUserTab:								false
		}
		nsVals.setDefaultValues(config,layoutConfig);
		//表格的默认配置参数
		var optionConfig = {
			dialogBeforeHandler:dialogBeforeHandler,
			ajaxBeforeHandler:ajaxBeforeHandler,
			ajaxAfterHandler:ajaxAfterHandler,
			loadPageHandler:loadPageHandler,
			closePageHandler:closePageHandler
		}
		config.table = nsTemplate.setDefalutByTable(config.table,optionConfig);
		if(config.browersystem === 'pc'){
			//pc端显示开启列搜索和设置列配置
			config.table.isColumnSearchHidden = true;
			config.table.isUseTableControl = true;
		}
		//表单的默认配置参数
		config.form = nsTemplate.setDefaultByForm(config.form,optionConfig);
		config.form.isUserControl = true;
		config.form.isUserContidion = true;
		config.isAutoSelect = true;
		switch(config.mode){
			case 'horizontal':
				config.isAutoSelect = false;
				var tablePanelHeight = $(window).height()-NSPAGEPARTHEIGHT.nav-30;
				//表格高度  不包含标题栏(和搜索栏在同一行) 和表格底部操作栏
				var tableHeight = tablePanelHeight-NSPAGEPARTHEIGHT.title-NSPAGEPARTHEIGHT.footer;
				var tableRowHeight = NSPAGEPARTHEIGHT.wide;
				if(typeof(nsUIConfig)=='object'){
					if(nsUIConfig.tableHeightMode == 'compact'){
						tableRowHeight = NSPAGEPARTHEIGHT.compact;
					}
				}
				var pageLengthMenu = Math.floor(tableHeight / tableRowHeight)-1;
				config.tablePageLengthMenu = pageLengthMenu;
				break;
			case 'simple-mobile':
			case 'mobile-crm-search':
				//简单条件的手机查询页面
				config.isAutoSelect = true;
				config.form.isUserControl = false;
				config.form.isUserContidion = false;
				break;
			case 'horizontalLineNum':
				config.isAutoSelect = false;
				config.tablePageLengthMenu = 15;
				break;
			case 'defaultLineNum':
				config.tablePageLengthMenu = 15;
				break;
		}

		//整理tableDataMode属性，用于显示数据 cy 20180904 start -----------------
		var tableDataMode = '';
		if(config.table.params){
			if(config.table.params.isServerMode){
				//服务器端数据
				tableDataMode = 'server';
			}else if(config.table.params.displayMode == 'block'){
				//block显示方式 数据一次性加载
				tableDataMode = 'block';
			}else{
				//一次性加载数据
				tableDataMode = 'dataSource';
			}
		}
		config.table.tableDataMode = tableDataMode;
		//整理tableDataMode属性，用于显示数据 cy 20180904 end -------------------
	}
	//输出html
	function getLayoutHtml(){
		var isShowHistoryBtn = config.isShowHistoryBtn;
		var tabHtml = '';
		if(typeof(config.tab.index)=='number'){
			config.isUserTab = true;
			//tab存在于form中的元素
			if(config.tab.index >=0 && config.tab.index <= config.form.field.length){
				tabHtml = '<panel ns-id="'+config.tabId+'"></panel>';
			}
		}
		var titleHtml = '';
		if(config.isShowTitle){
			//标题设置为显示
			titleHtml = '<panel ns-id="templateTitle"></panel>'; 
		}
		var optionsStr = 'templates:listFilter,isShowHistoryBtn:'+isShowHistoryBtn;
		if (config.mode) {
			optionsStr += ',mode:mode-' + config.mode;
		}
		var html = '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="'+optionsStr+'">'
						+titleHtml
						+tabHtml
						+'<panel ns-id="'+config.formId+'" ns-options="col:12" ns-config="form:'+config.formJson+'" ns-container="formContainer"></panel>'
						+'<panel ns-id="'+config.tableId+'" ns-options="col:12,class:senior-search" ns-config="table:'+config.tableJson+'" ns-container="tableContainer"></panel>'
					+'</layout>';
		return html;
	}
	//根据检索条件刷新表格
	function refreshTableByFormData(){
		var $container = $('#'+config.fullFormId).find('.search-link');//筛选条件的dom元素
		var formParamsObject = nsTemplate.getChargeDataByForm(config.fullFormId,false);
		//读取表格默认请求的参数
		var tableParamsObject = $.extend(true,{},config.table.dataParams);
		var paramObject = $.extend(true,tableParamsObject,formParamsObject);
		//如果筛选条件有空的删除不作为筛选条件
		for(key in paramObject){
			if(paramObject[key] === ''){
				delete paramObject[key];
			}
		}
		//如果刷新前要进行参数操作
		if(typeof(config.beforeSubmitHandler)=='function'){
			paramObject = config.beforeSubmitHandler(paramObject);
			if(paramObject === false){return;}
		}
		//刷新表格
		refreshMainTable(paramObject);
		function refreshFormContidionHtml(){
			var liHtml = '';
			//刷新筛选条件
			var searchData = nsForm.getFormData(config.fullFormId);
			var formJson = nsTemplate.getChargeDataByForm(config.fullFormId,false);
			for(var sId in searchData){
				if(formJson[sId]===''){
					delete searchData[sId];
				}
			}
			for(var searchID in searchData){
				if(searchData[searchID].value === '' || searchData[searchID].text == '全部'){
					delete searchData[searchID];
				}
			}
			if(!$.isEmptyObject(searchData)){
				for(var search in searchData){
					liHtml += '<li ns-id="'+search+'">'+searchData[search].label+':'+searchData[search].text+'</li>';
				}
			}else{
				liHtml = '<li class="empty">暂无</li>';
			}
			$container.html(liHtml);
			$container.children('li').not('.empty').off('click');
			$container.children('li').not('.empty').on('click',function(ev){
				var $this = $(this);
				var nID = $this.attr('ns-id');
				var fillvalues = {}
				fillvalues[nID] = '';
				nsForm.fillValues(fillvalues,config.fullFormId);
				var $container = $this.closest('.search-link');
				var formJson = nsTemplate.getChargeDataByForm(config.fullFormId,false);
				delete formJson[nID];
				var tableID = config.fullTableId;
				var tableParamDta = baseDataTable.data[tableID].dataConfig.data;
				var paramObject = $.extend({},tableParamDta,formJson);
				//清空参数为空的值
				for(key in paramObject){
					if(paramObject[key] === ''){
						delete paramObject[key];
					}
				}
				if(config.isAutoSelect){
					refreshMainTable(paramObject);
				}
				refreshFormContidionHtml();
			});
		}
		refreshFormContidionHtml();
	}
	//增晒改保存
	function saveDataAddAjax(inputData,dialogObj){
		//添加到表格中的数据
		var addTableRowData = $.extend(true,{},inputData)
		//添加时间戳
		var timeStamp = new Date().getTime();
		addTableRowData.nsTempTimeStamp = timeStamp;
		addTableRowData[config.table.idField] = '';//主键id值为空
		//添加行
		baseDataTable.addTableRowData(config.fullTableId,[addTableRowData]);
		//添加新增标识
		inputData.objectState = NSSAVEDATAFLAG.ADD;
		//获取发送参数
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax,inputData,{idField:config.table.idField}); 
		//标记时间戳用于返回数据后替换
		saveDataAjax.plusData = {nsTempTimeStamp:timeStamp,dialogObj:dialogObj};
		nsVals.ajax(saveDataAjax,function(res,ajaxObj){
			if(res.success){
				if(ajaxObj.plusData.dialogObj){
					ajaxObj.plusData.dialogObj.afterHandler();
				}else{
					nsdialog.hide();
				}
				nsalert('操作成功');
				//ajax.data中的时间戳
				var tempTimeStamp = ajaxObj.plusData.nsTempTimeStamp;
				//主表数据
				var singleTableData = baseDataTable.getAllTableData(config.fullTableId);
				var resMainData = res[config.saveData.ajax.dataSrc];
				//替换临时添加的数据
				for(var listI = 0;listI<singleTableData.length;listI++){
					var singleTableRowData = singleTableData[listI];
					//根据时间戳查询数据
					if(singleTableRowData.nsTempTimeStamp == tempTimeStamp){
						singleTableData[listI] = resMainData;
					}else{
						if(debugerMode){
							console.error('新增数据错误,表格数据已经有id')
						}	
					}
				}
				var isCloseWindow = config.table.add.isCloseWindow;
				if(isCloseWindow){
					nsFrame.popPageClose(); 
				}
				//刷新主表
				refreshTable(singleTableData);
			}else{
				var tableData = baseDataTable.table[config.fullTableId].data();
				var tempRowIndex = -1;
				for(var trI=0; trI<tableData.length; trI++){
					var rowData = tableData[trI];
					//根据时间戳找到数据
					if(rowData.nsTempTimeStamp == ajaxObj.plusData.nsTempTimeStamp){
						tempRowIndex = trI;
						break;
					}
				}
				//如果没找到停止执行
				if(tempRowIndex == -1){
					console.log('无法找到服务器返回数据对应结果');
					console.log(res);
					return false;
				}
				baseDataTable.table[config.fullTableId].row(tempRowIndex).remove().draw(false);
				baseDataTable.originalConfig[config.fullTableId].dataConfig.dataSource.splice(tempRowIndex,1);
			}
		},true)
	}
	function saveDataEditAjax(inputData,$tr){
		//数据先添加到表格中
		//nsList.rowEdit(config.fullTableId, inputData, {isUseNotInputData:true, queryMode:'tr', queryValue:$tr});
		//添加修改标识
		inputData.objectState = NSSAVEDATAFLAG.EDIT;
		//获取发送方法参数
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax,inputData,{idField:config.table.idField}); 
		saveDataAjax.plusData = {
			tableId: config.fullTableId, 		//tableId
			dataSrc: config.saveData.ajax.dataSrc,	//saveData的dataSrc 用于取数据
			$tr:$tr, 								//当前行
		};
		nsVals.ajax(saveDataAjax, function(res, ajaxObj){
			if(res.success){
				nsdialog.hide();
				nsalert('操作成功');
				//处理返回数据
				var tableId = ajaxObj.plusData.tableId;
				var dataSrc = ajaxObj.plusData.dataSrc;
				var $tr = ajaxObj.plusData.$tr;
				var resRowData = res[dataSrc];
				//主表数据
				nsList.rowEdit(tableId, resRowData, {isUseNotInputData:true, queryMode:'tr', queryValue:$tr});
				var isCloseWindow = config.table.edit.isCloseWindow;
				if(isCloseWindow){
					nsFrame.popPageClose(); 
				}
			}
		},true)
	}
	function saveDataDeleteAjax(inputData,$tr){
		//添加修改标识
		inputData.objectState = NSSAVEDATAFLAG.DELETE;
		//删除无用的field字段
		$.each(inputData, function(key,value){
			if(key == 'id' && value ===''){
				delete inputData[key];
			}else if(key.indexOf('nsTemplate')==0){
				delete inputData[key];
			}
		})

		//获取发送方法参数
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax,inputData,{idField:config.table.idField}); 
		saveDataAjax.plusData = {
			tableId: config.fullTableId, 		//tableId
			idField: config.table.idField, 	//用于查找数据进行比对
			dataSrc: config.saveData.ajax.dataSrc,	//saveData的dataSrc 用于取数据
			$tr:$tr, 								//当前行
		};

		nsVals.ajax(saveDataAjax, function(res, ajaxObj){
			if(res.success){
				nsalert('操作成功');
				//处理返回数据
				var tableId = ajaxObj.plusData.tableId;
				var idField = ajaxObj.plusData.idField;
				var dataSrc = ajaxObj.plusData.dataSrc;
				var $tr = ajaxObj.plusData.$tr;
				var resRowData = res[dataSrc];
				//表数据
				nsList.rowDelete(tableId, resRowData, {queryMode:'tr', queryValue:$tr});
				var isCloseWindow = config.table.delete.isCloseWindow;
				if(isCloseWindow){
					nsFrame.popPageClose(); 
				}
			}
		},true)
	}
	/********************form相关事件 start********************************/
	//查询事件
	function selectTableFilterHandler(){
		refreshTableByFormData();
	}
	//form事件调用
	function formCommonChangeHandler(data){
		if(data.type==='daterangeRadio'){
			$("#"+data.config.fullID+'-isInput-daterange').val(data.value);
		}
		if(config.isAutoSelect){
			if(config.mode == 'mobile-crm-search'){
				refreshMainTable();
			}else{
				refreshTableByFormData();
			}
		}
	}
	function formUserControlHandler(){nsUI.formmanager.init(nsFormBase.form[config.fullFormId]);}
	//form add dialog
	function formContainerAddHandler(){
		function addDialogFormSaveHandler(){console.log('save');nsalert('保存成功')}
		var formAddDialog = {
			id: 	"adddialog-"+config.fullFormId,
			title: 	config.form.add.title,
			size: 	"m",
			fillbg:false,
			form:config.form.add.field,
			btns:[
				{
					text:'保存',
					handler:addDialogFormSaveHandler
				}
			]
		};		
		formAddDialog.isValidSave = true;
		nsdialog.initShow(formAddDialog);
	}
	//form edit dialog
	function formContainerEditHandler(){
		function editDialogFormSaveHandler(){console.log('save');nsalert('保存成功')}
		var formAddDialog = {
			id: 	"editdialog-"+config.fullFormId,
			title: 	config.form.edit.title,
			size: 	"m",
			fillbg:false,
			form:config.form.edit.field,
			btns:[
				{
					text:'保存',
					handler:editDialogFormSaveHandler
				}
			]
		};	
		formAddDialog.isValidSave = true;	
		nsdialog.initShow(formAddDialog);
	}
	//form delete dialog
	function formContainerDelHandler(){
		function delDialogFormSaveHandler(){console.log('save');nsalert('删除成功')}
		var formAddDialog = {
			id: 	"deldialog-"+config.fullFormId,
			title: 	config.form.delete.title,
			size: 	"m",
			fillbg:false,
			form:config.form.delete.field,
			btns:[
				{
					text:'删除',
					handler:delDialogFormSaveHandler
				}
			]
		};		
		formAddDialog.isValidSave = true;	
		nsdialog.initShow(formAddDialog);
	}
	//form delete confirm
	function formContainerConfirmDelHandler(){
		var delText = config.form.delete.text;
		var contentStr = delText;
		var formData = nsTemplate.getChargeDataByForm(config.fullFormId);
		contentStr = nsVals.getTextByFieldFlag(contentStr,formData);
		nsConfirm(contentStr,delConfirmHandler,'warning');//弹出删除提示框
		function delConfirmHandler(result){
			//删除事件触发
			if(result){
				//如果为真则是确认事件
				var deleteRowData = nsTemplate.getChargeDataByForm(config.fullFormId);
				console.log(deleteRowData)
			}
		}
	}
	//form edit  multi save
	function formContainerEditSaveHandler(){}
	//form add  multi save
	function formContainerSaveHandler(){}
	//form component
	function formContainerComponentAddHandler(data){}
	function formContainerComponentEditHandler(data){}
	function formContainerComponentDelHandler(data){}
	/********************form相关事件 end********************************/
	/********************table相关事件 start********************************/
	//table component
	function tableContainerComponentAddHandler(inputData){
		//添加到表格中的数据
		var addTableRowData = $.extend(true,{},inputData)
		//添加时间戳
		var timeStamp = new Date().getTime();
		addTableRowData.nsTempTimeStamp = timeStamp;
		addTableRowData[config.table.idField] = '';//主键id值为空
		//添加行
		baseDataTable.addTableRowData(config.fullTableId,[addTableRowData]);
		//添加新增标识
		inputData.objectState = NSSAVEDATAFLAG.ADD;
		//获取发送参数
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax,inputData,{idField:config.table.idField,keyField:config.table.keyField,pageParam:config.pageParam,parentObj:config.parentObj}); 
		//标记时间戳用于返回数据后替换
		saveDataAjax.plusData = {nsTempTimeStamp:timeStamp};
		nsVals.ajax(saveDataAjax,function(res,ajaxObj){
			if(res.success){
				//ajax.data中的时间戳
				var tempTimeStamp = ajaxObj.plusData.nsTempTimeStamp;
				//主表数据
				var singleTableData = baseDataTable.getAllTableData(config.fullTableId);
				var resMainData = res[config.saveData.ajax.dataSrc];
				delete resMainData.objectState;
				//resMainData = nsTemplate.getDataByObjectState(resMainData);
				//替换临时添加的数据
				for(var listI = 0;listI<singleTableData.length;listI++){
					var singleTableRowData = singleTableData[listI];
					//根据时间戳查询数据
					if(singleTableRowData.nsTempTimeStamp == tempTimeStamp){
						singleTableData[listI] = resMainData;
					}else{
						if(debugerMode){
							console.error('新增数据错误,表格数据已经有id')
						}	
					}
				}
				//刷新主表
				refreshTable(singleTableData);
			}else{
				var tableData = baseDataTable.table[config.fullTableId].data();
				var tempRowIndex = -1;
				for(var trI=0; trI<tableData.length; trI++){
					var rowData = tableData[trI];
					//根据时间戳找到数据
					if(rowData.nsTempTimeStamp == ajaxObj.plusData.nsTempTimeStamp){
						tempRowIndex = trI;
						break;
					}
				}
				//如果没找到停止执行
				if(tempRowIndex == -1){
					console.log('无法找到服务器返回数据对应结果');
					console.log(res);
					return false;
				}
				baseDataTable.table[config.fullTableId].row(tempRowIndex).remove().draw(false);
				baseDataTable.originalConfig[config.fullTableId].dataConfig.dataSource.splice(tempRowIndex,1);
			}
		},true)
	}
	function tableContainerComponentEditHandler(_data){
		var data = $.extend(true,{},_data);
		data.objectState = NSSAVEDATAFLAG.EDIT;
		saveAjax(data);
	}
	function tableContainerComponentDelHandler(_data){
		var data = $.extend(true,{},_data);
		data.objectState = NSSAVEDATAFLAG.DELETE;
		saveAjax(data);
	}
	function saveAjax(inputData){
		var ajaxConfigOptions = {
			idField:config.table.idField,
			keyField:config.table.dataSrc,
			pageParam:config.pageParam,
			parentObj:config.parentObj
		};
		var saveDataAjax = nsVals.getAjaxConfig(config.saveData.ajax,inputData,ajaxConfigOptions);
		saveDataAjax.plusData = {
			dataSrc:config.saveData.ajax.dataSrc
		};
		nsVals.ajax(saveDataAjax,function(res,ajaxObj){
			if(res.success){
				ajaxAfterHandler(res[ajaxObj.plusData.dataSrc]);
			}
		},true);
	}
	//table add
	function tableContainerAddHandler(){
		var addDialogId = "adddialog-"+config.fullTableId;
		var addFieldArray = $.extend(true,[],config.table.add.field);
		var textArr = ['新增','保存并新增'];
		if(config.table.add.dialogBtnText){
			textArr = config.table.add.dialogBtnText.split('/');
		}
		var textAddStr = textArr[0];
		var textSaveStr = textArr[1] ? textArr[1] : '保存并新增';
		var size = config.table.add.width;
		var originalTableConfig = {
			id: 	addDialogId,
			title: 	config.table.add.title,
			size: 	size,
			fillbg:false,
			form:addFieldArray,
			btns:[
				{
					text:textAddStr,
					handler:function(){
						var dialogValue = nsTemplate.getChargeDataByForm(addDialogId);
						if(dialogValue){
							saveDataAddAjax(dialogValue);
							//nsdialog.hide();
						}
					}
				},{
					text:textSaveStr,
					handler:function(){
						var dialogValue = nsTemplate.getChargeDataByForm(addDialogId);
						if(dialogValue){
							saveDataAddAjax(dialogValue,{
								afterHandler:function(){
									var refreshConfig = $.extend(true,{},originalTableConfig);
									nsdialog.refresh(refreshConfig,{});
								}
							});
						}
					}
				}
			]
		};		
		originalTableConfig.isValidSave = true;	
		var tableAddDialogConfig = $.extend(true,{},originalTableConfig);
		nsdialog.initShow(tableAddDialogConfig);
	}
	//table edit方法调用
	function customerTableEditBtnHandler(data){
		var editDialogId = "editdialog-"+config.fullTableId;
		function editDialogTableSaveHandler(){
			var dialogValue = nsTemplate.getChargeDataByForm(editDialogId);
			if(dialogValue){
				var $tr = data.obj.parents('tr');
				saveDataEditAjax(dialogValue, $tr);
				//nsdialog.hide();
			}
		};
		var editFieldArray = nsTemplate.getFormField(config.table.edit.field,data.rowData);
		for(var editI=0; editI<editFieldArray.length; editI++){
			if($.isArray(editFieldArray[editI])){
				// 二维数组
				for(var editII=0; editII<editFieldArray[editI].length; editII++){
					editFieldArray[editI][editII].value = data.rowData[editFieldArray[editI][editII].id];
				}
			}else{
				// 一维数组
				editFieldArray[editI].value = data.rowData[editFieldArray[editI].id];
			}
		}
		var size = config.table.edit.width;
		var confirmStr = config.table.edit.dialogBtnText;
		var editTableDialog = {
			id: 	editDialogId,
			title: 	config.table.edit.title,
			size: 	size,
			fillbg:false,
			form:editFieldArray,
			btns:[
				{
					text:confirmStr,
					handler:editDialogTableSaveHandler
				}
			]
		};		
		editTableDialog.isValidSave = true;
		// lyw 添加弹框显示完之后执行方法  为了弹框显示出来之后修改表单 20190107
		if(config.table.edit.dialogConfig){
			if(typeof(config.table.edit.dialogConfig.shownHandler)=='function'){
				editTableDialog.shownHandler = config.table.edit.dialogConfig.shownHandler;
			}
		}
		nsdialog.initShow(editTableDialog);
	}
	//table delete dialog方法调用
	function customerTableDelBtnHandler(data){
		var delDialogId = "deldialog-"+config.fullTableId;
		function delDialogTableSaveHandler(){
			var dialogValue = nsTemplate.getChargeDataByForm(delDialogId);
			if(dialogValue){
				var $tr = data.obj.parents('tr');
				saveDataEditAjax(dialogValue,$tr);
				//nsdialog.hide();
			}
		}
		var delFieldArray = $.extend(true,[],config.table.delete.field);
		for(var delI=0; delI<delFieldArray.length; delI++){
			delFieldArray[delI].value = data.rowData[delFieldArray[delI].id];
		}
		var delTableDialog = {
			id: 	delDialogId,
			title: 	config.table.delete.title,
			size: 	"m",
			fillbg:false,
			form:delFieldArray,
			btns:[
				{
					text:'删除',
					handler:delDialogTableSaveHandler
				}
			]
		};		
		delTableDialog.isValidSave = true;
		nsdialog.initShow(delTableDialog);
	}
	//table delete confirm 
	function customerTableConfirmDelBtnHandler(data){
		var delText = config.table.delete.title;
		var contentStr = delText;
		var rowData = data.rowData;
		contentStr = nsVals.getTextByFieldFlag(contentStr,rowData);
		nsConfirm(contentStr,delConfirmHandler,'warning');//弹出删除提示框
		function delConfirmHandler(result){
			//删除事件触发
			if(result){
				//如果为真则是确认事件
				var $tr = data.obj.parents('tr');
				saveDataDeleteAjax(data.rowData,$tr);
			}
		}
	}
	//table useTableControl
	function useTableControlHandler(){nsUI.tablecolumn.init(config.fullTableId);}
	//table columnsearchhidden
	function tableColumnSearchChangeHandler(val,$dom,ev){
		if(ev.keyCode == 13){
			var formID = config.id + '-table-customerform';
			var formData = nsForm.getFormData(formID);
			if(nsTable.data[config.fullTableId].dataConfig.isServerMode){
				var formParamsObject = nsTemplate.getChargeDataByForm(config.fullFormId,false);
				var tableParamsObject = $.extend(true,{},config.table.dataParams);
				var paramObject = $.extend(true,tableParamsObject,formParamsObject);
				paramObject[formData.searchField.value] = formData.searchValue.value;
				for(key in paramObject){
					if(paramObject[key] === ''){
						delete paramObject[key];
					}
				}
				refreshMainTable(paramObject);
			}else{
				var jsonData = {
					type:'column',
					tableID:config.fullTableId,
					value:{
						index:[formData.searchField.value],
						value:formData.searchValue.value
					}
				}
				baseDataTable.getSearchHandler(jsonData);
			}
		}
	}
	function tableColumnSearchBtnChangeHandler(ev){
		var formID = config.id + '-table-customerform';
		var formData = nsForm.getFormData(formID);
		if(nsTable.data[config.fullTableId].dataConfig.isServerMode){
			var formParamsObject = nsTemplate.getChargeDataByForm(config.fullFormId,false);
			var tableParamsObject = $.extend(true,{},config.table.dataParams);
			var paramObject = $.extend(true,tableParamsObject,formParamsObject);
			paramObject[formData.searchField.value] = formData.searchValue.value;
			for(key in paramObject){
				if(paramObject[key] === ''){
					delete paramObject[key];
				}
			}
			refreshMainTable(paramObject);
		}else{
			var jsonData = {
				type:'column',
				tableID:config.fullTableId,
				value:{
					index:[formData.searchField.value],
					value:formData.searchValue.value
				}
			}
			baseDataTable.getSearchHandler(jsonData);
		}
	}
	//table add multi
	function tableContainerSaveHandler(){}
	/********************table相关事件 end********************************/
	//初始化对象相关参数值
	function createLayoutJson(){
		var listFilterObj = eval(config.package + '={}');
		//form数据
		var formFieldArray = $.extend(true,[],config.form.field);
		for(var i=0; i<formFieldArray.length; i++){
			switch(formFieldArray[i].type){
				case 'radio':
					if($.isArray(formFieldArray[i].subdata)){
						var json = {};
						if(formFieldArray[i].valueField){
							json[formFieldArray[i].valueField] = '';
							json[formFieldArray[i].textField] = '全部';
							if(formFieldArray[i].id=='nsTemplateOrderSort'){
								json[formFieldArray[i].textField] = '默认';
								json.orderField = '';
								json.orderType = '';
							}
							json.isChecked = true;
						}else{
							json = {
								value:'',
								text:'全部',
								isChecked:true,
							}
						}
						formFieldArray[i].subdata.unshift(json);
					}
					break;
				case 'tree-select':
					if(config.isAutoSelect){
						formFieldArray[i].clickCallback = refreshTableByFormData;
					}
					break;
			}
			formFieldArray[i].commonChangeHandler = formCommonChangeHandler;
		}
		listFilterObj[config.formJson] = {
			isUserContidion:config.form.isUserContidion,//是否查看筛选条件
			form:formFieldArray
		};
		if(config.form.sortConfig){
			config.form.sortConfig.commonChangeHandler = formCommonChangeHandler;
			listFilterObj[config.formJson].sortConfig = config.form.sortConfig;
		}

		//table数据
		var tableFieldArray = $.extend(true,[],config.table.field);
		for(var columnI=0; columnI<tableFieldArray.length; columnI++){
			tableFieldArray[columnI].searchable = true;
		}
		// 表格显示行数 lyw
		var tablePageLengthMenu = 10;
		if(config.tablePageLengthMenu){
			tablePageLengthMenu = config.tablePageLengthMenu;
		}
		//主表config定义
		var tableConfig = {
			/*data:{
				src:				config.table.ajax.src,
				type:				config.table.ajax.type, //GET POST
				dataSrc:			config.table.ajax.dataSrc,
				data:				tableParamsObject, //参数对象{id:1,page:100}
				isServerMode:		config.table.ajax.isServerMode, //是否开启服务器模式
				isSearch:			true, //是否开启搜索功能
				isSearchVisible:	false,
				isPage:				true, //是否开启分页
			},*/
			columns:				tableFieldArray,
			ui: {
				// pageLengthMenu:		10,
				pageLengthMenu:		tablePageLengthMenu,
				isSingleSelect:		false,
				isMulitSelect:		true,			//是否单选
				isUseMax:			true,
				dragWidth:			true,
			}
		}
		//补充主表tab相关属性
		nsTemplate.setTableConfig(tableConfig);
		tableConfig.data.primaryKey = config.table.idField;
		//是否服务端检索
		if(config.table.params.isServerMode){
			//服务端检索模式
			config.table.dataParams = $.extend(true,{},config.table.ajax.data);
			var listAjax = nsVals.getAjaxConfig(config.table.ajax,{},{idField:config.table.idField});
			tableConfig.data = {
				src:				listAjax.url,
				type:				listAjax.type, //GET POST
				dataSrc:			listAjax.dataSrc,
				data:				listAjax.data, //参数对象{id:1,page:100}
				isServerMode:		true, //是否开启服务器模式
				isSearch:			true, //是否开启搜索功能
				isSearchVisible:	false,
				isPage:				true, //是否开启分页
				primaryKey:			config.table.idField,
				contentType:		"application/json; charset=utf-8", //contenttype
			}
		}

		listFilterObj[config.tableJson] = tableConfig;

		var tableRowBtnsArr = $.extend(true,[],config.table.tableRowBtns);
		tableRowBtnsArr = nsTemplate.getBtnArrayByBtns(tableRowBtnsArr);//得到按钮值 
		if(config.table.edit){
			//存在编辑按钮默认是弹框
			var editStr = config.table.edit.text ? config.table.edit.text : '编辑';
			switch(config.table.edit.type){
				case 'dialog':
					tableRowBtnsArr.push({
						text:editStr,
						isReturn:true,
						handler:customerTableEditBtnHandler
					});
					break;
			}
		}
		if(config.table.delete){
			//存在删除按钮默认是弹框
			var delStr = config.table.delete.text ? config.table.delete.text : '删除';
			switch(config.table.delete.type){
				case 'dialog':
					tableRowBtnsArr.push({
						text:delStr,
						isReturn:true,
						handler:customerTableDelBtnHandler
					});
					break;
				case 'confirm':
					tableRowBtnsArr.push({
						text:delStr,
						isReturn:true,
						handler:customerTableConfirmDelBtnHandler
					});
					break;
			}
		}
		if(tableRowBtnsArr.length > 0){
			var rowBtnsArray = [];
			for(var rowBtnI=0; rowBtnI<tableRowBtnsArr.length; rowBtnI++){
				var btns = $.extend(true,{},tableRowBtnsArr[rowBtnI]);
				var btnJson = {};
				btnJson[btns.text] = btns.handler;
				rowBtnsArray.push(btnJson);
			}
			var btnWidth = tableRowBtnsArr.length * 30 + 10;
			var customerBtnJson = {
				field:'nsTemplateButton',
				title: '操作',
				width:btnWidth,
				tabPosition:'after',
				formatHandler: {
					type: 'button',
					data: {
						subdata:rowBtnsArray
					}
				}
			};
			//如果最后一个是按钮删除重新赋值目的为了防止重复多次添加操作
			for(var tColumnI=0; tColumnI<listFilterObj[config.tableJson].columns.length; tColumnI++){
				if(listFilterObj[config.tableJson].columns[tColumnI].field == 'nsTemplateButton'){
					listFilterObj[config.tableJson].columns.splice(tColumnI,1);
				}
			}
			if(typeof(config.table.dataReturnbtns)=='function'){
				customerBtnJson.formatHandler.data.dataReturn = config.table.dataReturnbtns;
			}
			listFilterObj[config.tableJson].columns.push(customerBtnJson);
		}
		//容器面板
		listFilterObj.formContainer = {};
		listFilterObj.tableContainer = {};
		var containerFormBtnArr = [];

		if(config.form.isUserControl){
			//开启了用户自定义配置
			containerFormBtnArr.push({
				text:'设置',
				isReturn:true,
				isShowText:true,
				isShowIcon:true,
				handler:formUserControlHandler
			});
		}
		if(config.form.add){
			var addTextStr = config.form.add.text ? config.form.add.text : '新增';
			switch(config.form.add.type){
				case 'dialog':
					containerFormBtnArr.push({
						text:addTextStr,
						isReturn:true,
						isShowText:true,
						isShowIcon:true,
						handler:formContainerAddHandler
					});
					break;
				case 'component':
					customerComponentObj[config.fullFormId] = {
						containerId:			'container-panel-'+config.id+'-'+config.formId,
						cId:					'control-btn-servicecomponent-'+config.fullFormId,
						data:					config.form.add.serviceComponent.data,
						init:					config.form.add.serviceComponent.init,
						componentType:			config.form.add.serviceComponent.type,
						source:					'form',
						operator:				'add',
					}
					break;
				case 'multi':
					listFilterObj.formContainer.forms = $.extend(true,[],config.form.add.field);
					listFilterObj.formContainer.title = config.form.add.title;
					listFilterObj.formContainer.isSingleMode = typeof(config.form.add.isSingleMode)=='boolean'?config.form.add.isSingleMode:true;
					/*containerFormBtnArr.push({
						text:addTextStr,
						isReturn:true,
						isShowText:true,
						isShowIcon:true,
						handler:formContainerSaveHandler
					})*/
					break;
			}
		}
		//edit
		if(config.form.edit){
			var editTextStr = config.form.edit.text ? config.form.edit.text : '编辑';
			switch(config.form.edit.type){
				case 'dialog':
					containerFormBtnArr.push({
						text:editTextStr,
						isReturn:true,
						isShowText:true,
						isShowIcon:true,
						handler:formContainerEditHandler
					});
					break;
				case 'component':
					customerComponentObj[config.fullFormId] = {
						containerId:			'container-panel-'+config.id+'-'+config.formId,
						cId:					'control-btn-servicecomponent-'+config.fullFormId,
						data:					config.form.edit.serviceComponent.data,
						init:					config.form.edit.serviceComponent.init,
						componentType:			config.form.edit.serviceComponent.type,
						source:					'form',
						operator:				'edit',
					}
					break;
				case 'multi':
					listFilterObj.formContainer.forms = config.form.edit.field;
					listFilterObj.formContainer.title = config.form.edit.title;
					containerFormBtnArr.push({
						text:editTextStr,
						isReturn:true,
						isShowText:true,
						isShowIcon:true,
						handler:formContainerEditSaveHandler
					})
					break;
			}
		}
		//delete
		if(config.form.delete){
			var delTextStr = config.form.delete.text ? config.form.delete.text : '删除';
			switch(config.form.delete.type){
				case 'dialog':
					containerFormBtnArr.push({
						text:delTextStr,
						isReturn:true,
						isShowText:true,
						isShowIcon:true,
						handler:formContainerDelHandler
					});
					break;
				case 'confirm':
					containerFormBtnArr.push({
						text:delTextStr,
						isReturn:true,
						isShowText:true,
						isShowIcon:true,
						handler:formContainerConfirmDelHandler
					});
					break;
			}
		}
		var btnArray = nsTemplate.getBtnArrayByBtns(config.form.btns);//得到按钮值 
		containerFormBtnArr = $.merge(containerFormBtnArr,btnArray);
		if(!config.isAutoSelect){
			containerFormBtnArr.unshift({
				text:'查询',
				btnCls:'btn btn-primary',
				handler:selectTableFilterHandler
			});
		}
		if(containerFormBtnArr.length > 0){
			listFilterObj.formContainer.btns = containerFormBtnArr;
		}
		//table container
		var containerTableBtnArr = [];
		var containerTableFormArr = [];
		//自定义列配置
		/*if(config.table.isUseTableControl){
			containerTableBtnArr.push({
				text:'列配置',
				isReturn:true,
				isShowIcon:true,
				isShowText:true,
				handler:useTableControlHandler
			});
		}*/
		//开启列搜索功能
		if(config.table.isColumnSearchHidden){
			//组成有select textBtn
			var selectJson = {
				id:'searchField',
				type:'select',
				column:0,
				textField:'name',
				valueField:'id',
				subdata:[]
			}
			for(var fieldI=0; fieldI<config.table.field.length; fieldI++){
				if(config.table.field[fieldI].searchable){
					//允许搜索
					selectJson.subdata.push({
						id:config.table.field[fieldI].field,
						name:config.table.field[fieldI].title
					});
				}
			}
			containerTableFormArr = [selectJson,{
				id:'searchValue',
				type:'text-btn',
				column:0,
				onKeyChange:true,
				changeHandler:tableColumnSearchChangeHandler,
				btns:[
					{
						text:'搜索',
						isShowText:true,
						isShowIcon:true,
						handler:tableColumnSearchBtnChangeHandler
					}
				]
			}];
			listFilterObj.tableContainer.isSingleMode = true;
		}
		//add
		if(config.table.add){
			var addTextStr = config.table.add.text ? config.table.add.text : '新增';
			switch(config.table.add.type){
				case 'dialog':
					containerTableBtnArr.push({
						text:addTextStr,
						isReturn:true,
						isShowText:true,
						isShowIcon:true,
						handler:tableContainerAddHandler
					});
					break;
				case 'component':
					customerComponentObj[config.fullTableId] = {
						containerId:			'container-panel-'+config.id+'-'+config.tableId,
						cId:					'control-btn-servicecomponent-'+config.fullTableId,
						data:					config.table.add.serviceComponent.data,
						init:					config.table.add.serviceComponent.init,
						componentType:			config.table.add.serviceComponent.type,
						source:					'table',
						operator:				'add',
						data_auth_code:			config.data_auth_code,
					}
					break;
				case 'multi':
					/*if(containerTableFormArr.length > 0){
						containerTableFormArr = $.merge(containerTableFormArr,config.table.add.field);
					}*/
					containerTableFormArr = $.extend(true,[],config.table.add.field);
					listFilterObj.tableContainer.title = config.table.add.title;
					listFilterObj.tableContainer.isSingleMode = typeof(config.table.add.isSingleMode)=='boolean'?config.table.add.isSingleMode:true;
					/*containerTableBtnArr.push({
						text:addTextStr,
						isReturn:true,
						isShowText:true,
						isShowIcon:true,
						handler:tableContainerSaveHandler
					})*/
					break;
			}
		}

		if(containerTableFormArr.length > 0){
			listFilterObj.tableContainer.forms = containerTableFormArr;
		}
		var tableBtnArray = nsTemplate.getBtnArrayByBtns(config.table.btns);//得到按钮值 
		containerTableBtnArr = $.merge(containerTableBtnArr,tableBtnArray);
		if(containerTableBtnArr.length > 0){
			listFilterObj.tableContainer.btns = containerTableBtnArr;
		}
		if(typeof(config.table.params)=='object'){
			listFilterObj.tableJson.ui.displayMode = config.table.params.displayMode;
			listFilterObj.tableJson.ui.selectMode = config.table.params.selectMode;
			if(typeof(config.table.params.isSerialNumber)=='boolean'){
				listFilterObj.tableJson.data.isSerialNumber = config.table.params.isSerialNumber; 
			}
			if(config.table.params.classConfig){
				listFilterObj.tableJson.ui.classConfig = config.table.params.classConfig;
			}
			listFilterObj.tableJson.ui.isClass = config.table.params.isClass;
			listFilterObj.tableJson.ui.isClose = config.table.params.isClose;
			listFilterObj.tableJson.ui.column = config.table.params.column;
		}
		if(config.mode =='mobile-crm-search'){
			listFilterObj.formJson.id = config.fullFormId;
			if(config.form.formSource){
				listFilterObj.formJson.formSource = config.form.formSource;
			}
			listFilterObj.formJson.clearHandler = function(){
				refreshMainTable();
			}
			nsForm.init(listFilterObj.formJson);
			var tableJson = listFilterObj.tableJson;
			tableJson.data.tableID = config.fullTableId;
			tableJson.ui.$container=$('#table-'+config.fullTableId);
			tableJson.data = $.extend(true,{},tableJson.data,config.table.ajax);
			tableJson.data.isServerMode = true;
			tableJson.ui.btns = $.extend(true,[],config.table.tableRowBtns);

			var uiJson = {
				displayMode:'block',
				isSerialNumber:false,
				isClose:false,
				selectMode:'none'
			};
			nsVals.extendJSON(tableJson.ui,uiJson);
			nsList.init(tableJson.data,tableJson.columns,tableJson.ui);
			var searchInputId = 'search-'+config.id;
			var placeholderStr = config.placeholder ? config.placeholder : '';
			var defaultInputHtml = '<div class="mobile-input-search-control">'
										+'<i class="fa-search"></i><span>'+placeholderStr+'</span>'
									+'</div>';
			var searchInputConfig = {
				containerId: searchInputId,
				placeholder: placeholderStr,
				defaultValue: "",
				type: "search",
				label: "<i class='fa-search'></i>",
				showSearchHis: false,
				btns: [
					{
						text: "取消",
						iconClass: "",
						btnType: "",
						handler: function (res) {
							searchParam = {};
							$('#'+searchInputId).empty();
							$('#'+searchInputId).html(defaultInputHtml);
							refreshMainTable();
							$('#'+searchInputId).on('click', function () {
								nsUI.mobileSearch.init(searchInputConfig);
								$('#'+searchInputId).find('input').select();
								$('#'+searchInputId).off();
							});
						}
					}
				],
				handler:function(res){ 
					var paramsJson = nsTemplate.getChargeDataByForm(config.fullFormId,false);
					for(var param in config.table.ajax.data){
						paramsJson[param] = config.table.ajax.data[param];
					}
					var searchField = config.searchField ? config.searchField : 'filter';//默认读取filter
					paramsJson[searchField] = res.inputValue;
					searchParam[searchField] = res.inputValue;
					refreshMainTable(paramsJson);
				}
			}
			$('#'+searchInputId).on('click', function () {
				nsUI.mobileSearch.init(searchInputConfig);
				$('#'+searchInputId).find('input').select();
				$('#'+searchInputId).off();
			});
			if(tableBtnArray.length > 0){
				$('button[ns-template-btn="mobile-add"]').on('click',function(ev){
					var $this = $(this);
					var nsIndex = $this.attr('customerindex');
					tableBtnArray[nsIndex].handler({buttonIndex:nsIndex,$dom:$this});
				})
			}
		}
	}
	//自定义组件调用
	function serviceComponentInit(){
		for(var component in customerComponentObj){
			var handler;
			if(customerComponentObj[component].source === 'form'){
				switch(customerComponentObj[component].operator){
					case 'add':
						handler = formContainerComponentAddHandler;
						break;
					case 'edit':
						handler = formContainerComponentEditHandler;
						break;
					case 'delete':
						handler = formContainerComponentDelHandler;
						break;
				}
			}else if(customerComponentObj[component].source === 'table'){
				switch(customerComponentObj[component].operator){
					case 'add':
						handler = tableContainerComponentAddHandler;
						break;
					case 'edit':
						handler = tableContainerComponentEditHandler;
						break;
					case 'delete':
						handler = tableContainerComponentDelHandler;
						break;
				}
			}
			customerComponentObj[component].init(customerComponentObj[component],handler);
		}
	}
	//输出tab内容
	function getTabHtml(tabIndex){
		var tabArr = config.form.field[tabIndex].subdata;
		var tabHtml = '<ul class="nav nav-tabs nav-tabs-justified" nsform-index="'+config.form.field[tabIndex].id+'">';
		for(var tabI=0; tabI<tabArr.length; tabI++){
			var classStr = tabI == 0 ? 'active' : '';
			tabHtml += '<li class="'+classStr+'"><a href="javascript:void()" data-toggle="tab" ns-id="'+tabArr[tabI][config.form.field[tabIndex].valueField]+'">'+tabArr[tabI][config.form.field[tabIndex].textField]+'</a></li>';
		}
		tabHtml += '</ul>';
		var tabID = config.id + '-tabs';
		$('#'+tabID).html(tabHtml);
		$('#'+tabID+' li a').on('click',function(ev){
		});
	}
	//读取默认
	function refreshInitAjaxData(){
		var pageParamObject = $.extend(true,{},config.pageParam);//界面跳转拿到的值
		var listAjax = nsVals.getAjaxConfig(config.getValueAjax,{},{idField:config.form.idField,pageParam:pageParamObject,keyField:config.table.keyField});
		nsVals.ajax(listAjax, function(res){
			if(res.success){
				var listData = res[config.getValueAjax.dataSrc];  		//数组对象
				//给当前检索值赋值
				var formData = {};
				var newFormFieldArray = config.form.field;
				for(var formI=0; formI<newFormFieldArray.length; formI++){
					if(newFormFieldArray[formI].type){
						//存在type属性就一定存在定义默认值mindjetFieldName
						formData[newFormFieldArray[formI].id] = listData[newFormFieldArray[formI].id];
					}
				}
				nsForm.fillValues(formData,config.fullFormId);
				if(config.mode != 'horizontal'){
					refreshMainTable();
				}
			}
		},true)
	}
	//初始化方法调用
	function init(configObj){
		config = configObj;
		//第一次执行初始化模板
		if(typeof(nsTemplate.templates.listFilter.data)=='undefined'){
			templateInit();
		}
		if(debugerMode){
			if(!listFilterValidate(config)){
				nsalert('配置文件验证失败', 'error');
				console.error('配置文件验证失败');
				console.error(config);
				return false;
			}
		}
		
		setDefault(); 	
		//记录config
		nsTemplate.templates.listFilter.data[config.id] = {
			original:$.extend(true,{},config),
			config:config
		}
		templateData = nsTemplate.templates.listFilter.data[config.id];
		
		var html = getLayoutHtml();
		if(config.mode == 'mobile-crm-search'){
			var isSearch = typeof(config.isSearch)=='boolean' ? config.isSearch : false;//默认不开启搜索
			var searchHtml = '';
			var classStr = 'no-mobile-search';
			if(config.isSearch){
				classStr = '';
				var placeHolderStr = config.placeholder ? config.placeholder : '';
				searchHtml = '<div class="row mobile-input-search" id="search-'+config.id+'">'
									+'<div class="mobile-input-search-control">'
										+'<i class="fa-search"></i><span>'+placeHolderStr+'</span>'
									+'</div>'
								+'</div>';
			}
			var formHtml = '<div class="mobile-crm-search-form" id="'+config.fullFormId+'"></div>';
			var tableHtml = '<div class="mobile-crm-search-table '+classStr+'" id="table-'+config.fullTableId+'"></div>';
			var buttonHtml = '';
			if($.isArray(config.table.btns)){
				var btnHtml = '';
				for(var btnI=0; btnI<config.table.btns.length; btnI++){
					btnHtml += '<button class="btn btn-primary" ns-template-btn="mobile-add" customerindex="0">'
								+'<span>'+config.table.btns[btnI].btn.text+'</span>'
							+'</div>';
				}
				if(config.table.btns.length > 0){
					buttonHtml = '<footer class="footer">'
					+'<div class="btn-group">'
						+btnHtml
					+'</div>'
				+'</footer>';
				}
			}
			html =  searchHtml + formHtml + tableHtml + buttonHtml;
		}
		//围加根html
		html = nsTemplate.aroundRootHtml(html);
		//将html添加到页面
		nsTemplate.appendHtml(html);
		
		//创建模板Json对象
		createLayoutJson();
		//初始化layout
		if(typeof(config.beforeInitHandler)=='function'){
			//初始化之前调用
			var package = config.package;
			package = eval(package);
			package = config.beforeInitHandler(package);
		}
		function layoutAfterHandler(layoutData){
			//初始化完成之后的调用刷新表格数据
			$('#'+config.fullTitleId).html('<div class="templateTitle">'+config.title+'</div>');
			//是否配置tab内容
			if(config.isUserTab){
				getTabHtml(config.tab.index);
			}
			//是否存在自定义组件
			serviceComponentInit();
			if(!config.table.params.isServerMode){
				//客户端模式
				if(!$.isEmptyObject(config.getValueAjax)){
					refreshInitAjaxData();
				}else{
					if(config.mode != 'horizontal'){
						refreshMainTable();
					}
				}
			}
			if(config.isFormHidden == true){
				//隐藏
				$('#'+config.fullFormId).hide();
				$('#'+config.fullTabId).hide();
			}
		}

		// 模板初始化前置回调 cy 20181117
		if(typeof(config.beforeInitHandler)=='function'){
			config.beforeInitHandler(config);
		}
		if(config.mode == 'mobile-crm-search'){

		}else{
			nsLayout.init(config.id,{afterHandler:layoutAfterHandler});
		}
		
		// 模板回调 lyw 20181018
		if(typeof(config.completeHandler)=='function'){
			config.completeHandler(config);
		}
	}
	return {
		init:								init,							//模板初始化调用
		dialogBeforeHandler:				dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:					ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:					ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:					loadPageHandler,				//弹框初始化加载方法
		closePageHandler:					closePageHandler,				//弹框关闭方法
		getData:							getData,	
	}
})(jQuery)
/******************** 列表过滤模板 end ************************/