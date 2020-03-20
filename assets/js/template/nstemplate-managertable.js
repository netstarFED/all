/* *
 * 单个表格增删改查模板
 * */
//初始化模板
nsTemplate.templates.managerTable.init = function(config) {

	//验证数据合法性
	if (debugerMode) {
		var success = nsTemplate.templates.managerTable.validate(config);
		if (!success) {
			return false;
		}
	}
	//记录config
	nsTemplate.templates.managerTable.data[config.id] = $.extend(true, {}, config);

	//设置默认值
	config = nsTemplate.templates.managerTable.setDefault(config);

	//生成html
	var html = nsTemplate.templates.managerTable.getHtml(config);

	//围加根html
	html = nsTemplate.aroundRootHtml(html);

	//将html添加到页面
	nsTemplate.appendHtml(html);

	//创建模板Json对象
	nsTemplate.templates.managerTable.createJson(config);

	//初始化layout
	nsLayout.init(config.id);

	//增加模板样式

	return true;
}
//验证数据合法性
nsTemplate.templates.managerTable.validate = function(config) {

	return true;
}
//设置默认值
nsTemplate.templates.managerTable.setDefault = function(config) {
	config.navId = 'nav';
	config.tableId = 'table';
	config.dialogId = config.id + '-dialog';
	config.formId = 'form';
	config.navJson = 'navJson';
	config.tableJson = 'tableJson';
	config.formJson = 'formJson';
	config.tabId = config.id + '-tabs';
	config.title = typeof(config.title) == 'string' ? config.title : '';
	return config;
}
//生成html
nsTemplate.templates.managerTable.getHtml = function(config) {
	var html = '<layout id="' + config.id + '" ns-package="' + config.package + '" ns-options="templates:singletablemodal">' +
		'<nav ns-id="' + config.navId + '" ns-config="' + config.navJson + '" ns-options="templates:singletablemodal"></nav>' +
		'<panel ns-id="' + config.tableId + '" ns-options="col:12" ns-config="table:' + config.tableJson + '"></panel>' +
		'</layout>';
	return html;
}
//创建模板Json对象
nsTemplate.templates.managerTable.createJson = function(config) {

	var obj = eval(config.package + '={}');

	obj[config.navJson] = {
		//id: config.navId,
		title: config.title,
		isShowTitle:typeof(config.isShowTitle)=='boolean'?config.isShowTitle:false,
		btns: []
	};

	var columns = config.table.field;
	nsTemplate.setFieldHide('table', columns, config.table.hide);
	var tableBtns;
	var origalTableBtns;
	if($.isArray(config.tableBtns)){
		var btnGroupArr = nsTemplate.runObjBtnHandler(config.tableBtns,commonTableBtnHandler,commonTableDropBtnHandler);
		tableBtns = btnGroupArr[0];
		origalTableBtns = btnGroupArr[1];
	}
	var columnBtnHandlers;
	if($.isArray(config.tableRowBtns)){
		var tableRowGroupArr=nsTemplate.runObjColumnBtnHandler(config.tableRowBtns,columnBtnHandler);
		var btns=tableRowGroupArr[0];
		columnBtnHandlers = tableRowGroupArr[1];
		columns.push({
			field: 'id',
			title: '操作',
			width: 100,
			searchable: false,
			tabPosition:'after',
			formatHandler: {
				type: 'button',
				data: btns
			}
		});
	}
	//自定义列按钮事件
	function columnBtnHandler(data){
		var runHandler = columnBtnHandlers[data.buttonIndex];
		if(typeof(runHandler)=='object'){
			if(typeof(runHandler.beforeHandler) == 'function'){
			var beforeHandler=runHandler.beforeHandler;
			data.config=beforeHandler();
			}
			if(!$.isEmptyObject(runHandler.btn)){
				if(data.rowData){
					data.value=data.rowData
				}
				nsTemplate.runObjHandler(runHandler.btn,'handler',[data]);
			}
			if(typeof(runHandler.afterHandler)=='function'){
				nsTemplate.runObjHandler(runHandler, 'afterHandler', [data]);
			}
		}
	}
	//table表格普通按钮事件
	function commonTableBtnHandler(data){
		var runHandler = origalTableBtns[data.nsIndex].handler;
		var btnHandler = origalTableBtns[data.nsIndex];
		if(typeof(runHandler)=='object'){
			if(!$.isEmptyObject(runHandler.btn)){
				btnHandler = runHandler.btn;
			}
		}
		if(typeof(runHandler.beforeHandler) == 'function'){
			var beforeHandler=runHandler.beforeHandler;
			data.config=beforeHandler();
		}
		if(typeof(runHandler.btn.handler)=='function'){
			nsTemplate.runObjHandler(btnHandler,'handler',[data]);
		}
		if(typeof(runHandler.btn.handler)=='function'){
			nsTemplate.runObjHandler(runHandler,'afterHandler',[data]);
		}
	}
	//table表格一级下拉按钮事件
	function commonTableDropBtnHandler(data){
		var runHandler = origalTableBtns[data.nsIndex][data.nsSubIndex].handler;
		if(typeof(runHandler)=='object'){
			if(typeof(runHandler.beforeHandler)=='function'){
				nsTemplate.runObjHandler(runHandler, 'beforeHandler', [data]);
			}
			if(typeof(runHandler.btn.handler)=='function'){
				nsTemplate.runObjHandler(runHandler,'handler',[data]);
			}
			if(typeof(runHandler.afterHandler)=='function'){
				nsTemplate.runObjHandler(runHandler, 'afterHandler', [data]);
			}
		}
		if(typeof(runHandler)=='function'){
			nsTemplate.runObjHandler(origalTableBtns[data.nsIndex][data.nsSubIndex],'handler',[data]);
		}
	}
	obj[config.tableJson] = {
		columns: columns,
		data: {
			src: config.ajax.select.ajax,
			type: config.ajax.select.type, //GET POST
			dataSrc: config.ajax.select.dataSrc,
			data: {}, //参数对象{id:1,page:100}
			isServerMode: false, //是否开启服务器模式
			isSearch: true, //是否开启搜索功能
			isPage: true, //是否开启分页
		},
		ui: {
			pageLengthMenu: 10, //可选页面数  auto是自动计算  all是全部
			isSingleSelect: true, //是否单选
			dragWidth: false,
		},
		btns: {
			selfBtn:tableBtns
		}
	};
	if(typeof(config.tableUi)=='object'){
		if(!$.isEmptyObject(config.tableUi)){
			var uiConfig = {};
			for(var ui in config.tableUi){
				obj[config.tableJson].ui[ui] = config.tableUi[ui];
			}
		}
	}
	//console.log(obj)
	function refreshTable() {
		baseDataTable.reloadTableAJAX('table-' + config.id + '-' + config.tableId);
	}
}
/*****************搜索模板页 start***********************************/
nsTemplate.templates.searchPage.getTabData = function(config){
	if(!$.isEmptyObject(config.tab)){
		var tabIndex = config.tab.index;
		if($.isArray(config.form.field[tabIndex].subdata)){
			if(config.form.field[tabIndex].subdata.length > 0){
				nsTemplate.templates.getTabHtml(config,tabIndex);
			}
		}
	}
}
nsTemplate.templates.searchPage.setDefault = function(config) {
	config.navId = 'nav';
	config.tableId = 'table';
	config.dialogId = config.id + '-dialog';
	config.formId = 'form';
	config.navJson = 'navJson';
	config.tableJson = 'tableJson';
	config.formJson = 'formJson';
	config.tabId = 'tabs';
	config.btnId = 'btns';
	config.title = typeof(config.title) == 'string' ? config.title : '';
	config.browersystem = $('body').attr('ns-system');
	config.isFormHidden = typeof(config.isFormHidden)=='boolean' ? config.isFormHidden : false;
	return config;
}
nsTemplate.templates.searchPage.init = function(config){
	//记录config
	nsTemplate.templates.searchPage.data[config.id] = $.extend(true, {}, config);
	//设置默认值
	config = nsTemplate.templates.searchPage.setDefault(config);
	//生成html
	var html = nsTemplate.templates.searchPage.getHtml(config);
	//围加根html
	html = nsTemplate.aroundRootHtml(html);
	//将html添加到页面
	nsTemplate.appendHtml(html);
	//创建模板Json对象
	nsTemplate.templates.searchPage.createJson(config);
	//初始化layout
	if(typeof(config.beforeInitHandler)=='function'){
		//初始化之前调用
		var package = config.package;
		package = eval(package);
		package = config.beforeInitHandler(package);
	}
	nsLayout.init(config.id);
	if(config.isFormHidden == true){
		//隐藏
		$('#'+config.id+'-form').hide();
		$('#'+config.id+'-tabs').hide();
	}
	nsTemplate.templates.searchPage.getTabData(config);//创建tab
	config.searchData = nsForm.getFormJSON(config.id+'-form',false);//获取搜索数据
	if(config.browersystem == 'pc'){
		nsTemplate.templates.searchPage.createBtnJson(config);//生成btn按钮
		var $nav = $('#'+config.id+'-btns');
		var navWidth = 0;
		var navTop = 0;
		if($nav.length==1){
			navWidth = $nav.outerWidth();
			navTop = $nav.offset().top;
		}
		var formID = config.id+'-form';
		var btnTop = 0 ;
		var $btn = $('button[ns-form="form-'+formID+'"]');
		if($btn.length == 1){
			btnTop = $btn.offset().top;
		}
		var navTitleTop = 0;
		if(config.isShowTitle){
			navTitleTop = $('.breadcrumb-container').offset().top;
		}
		var spaceTop = btnTop - navTop + (btnTop-navTitleTop);
		if(!$.isEmptyObject(config.tab)){
			spaceTop = btnTop - navTop + 13;
		}else{
			$btn.css('top','-13px');
		}
		$nav.css({'top':spaceTop+'px'});
	}
	if(typeof(config.afterInitHandler)=='function'){
		//初始化之后调用
		config.afterInitHandler();
	}
}
//tab输出
nsTemplate.templates.getTabHtml = function(config,tabIndex){
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
		var nId = $.trim($(this).attr('ns-id'));
		var fieldStr = $.trim($(this).closest('ul').attr('nsform-index'));
		config.searchData[fieldStr] = nId;
		nsTemplate.templates.searchPage.refresh(config);
	});
}
//刷新
nsTemplate.templates.searchPage.refresh = function(config){
	var tableId = 'table-'+config.id+'-table';
	var formId = config.id + '-form';
	var $container = $('#'+formId).find('.search-link');
	var searchData = nsForm.getFormData(formId);
	var jsonData = nsForm.getFormJSON(formId);

	
	if(typeof(config.beforeSubmitHandler)=='function'){
		jsonData = config.beforeSubmitHandler(jsonData);
		if(jsonData === false){return;}
	}
	refreshSearchHtml(formId,$container,searchData);
	function refreshSearchHtml(formID,$container,searchData){
		var liHtml = '';
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
			delete searchData[nID];
			var fillvalues = {}
			fillvalues[nID] = '';
			nsForm.fillValues(fillvalues,formID);
			var $container = $this.closest('.search-link');
			var formJson = nsForm.getFormJSON(formID,false);
			var tableID = formID.substring(0,formID.lastIndexOf('-'));
			tableID = 'table-'+tableID+'-table';
			var tableParamDta = baseDataTable.data[tableID].dataConfig.data;
			var paramObject = $.extend({},tableParamDta,formJson);
			for(key in paramObject){
				if(paramObject[key] === ''){
					delete paramObject[key];
				}
			}
			baseDataTable.reloadTableAJAX(tableID,paramObject);
			refreshSearchHtml(formID,$container,searchData);
		});
	}
	//保留原来的参数
	if(config.table.ajax.select){
		if(config.table.ajax.select.data){
			for(key in config.table.ajax.select.data){
				if(typeof(jsonData[key]) == 'undefined'){
					jsonData[key] = config.table.ajax.select.data[key];
				}
			}
		}
	}
	//去掉为空的值 caoyuan 20180225
	for(key in jsonData){
		if(jsonData[key] === ''){
			delete jsonData[key];
		}
	}
	baseDataTable.reloadTableAJAX(tableId,jsonData);
}
//刷新表格
nsTemplate.templates.searchPage.refreshTable = function(tableId,jsonData){
	baseDataTable.reloadTableAJAX(tableId,jsonData);
}
//输出html
nsTemplate.templates.searchPage.getHtml = function(config){
	var navHtml = '';
	if(config.browersystem == 'pc'){
		//电脑端输出
		if(!$.isEmptyObject(config.nav)){
			if($.isArray(config.nav.field)){
				navHtml = '<panel ns-id="'+config.btnId+'" ns-options="border:left,class:nav-form"></panel>';
			}
		}
	}
	var tabHtml = '';
	if(!$.isEmptyObject(config.tab)){
		tabHtml = '<panel ns-id="'+config.tabId+'"></panel>';
	}
	var isShowHistoryBtn = true;
	if(typeof(config.isShowHistoryBtn) == 'boolean'){
		isShowHistoryBtn = config.isShowHistoryBtn;
	}
	var html = '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="templates:searchPage,isShowHistoryBtn:'+isShowHistoryBtn+'">'
					+'<nav ns-id="' + config.navId + '" ns-config="' + config.navJson + '" ns-options="templates:searchPage"></nav>' 
					+navHtml
					+tabHtml
					+'<panel ns-id="'+config.formId+'" ns-options="col:12" ns-config="form:'+config.formJson+'"></panel>'
					+'<panel ns-id="'+config.tableId+'" ns-options="col:12,class:senior-search" ns-config="table:'+config.tableJson+'"></panel>'
				+'</layout>';
	return html;
}
nsTemplate.templates.searchPage.createJson = function(config){
	var obj = eval(config.package + '={}');
	obj[config.navJson] = {
		id: config.navId,
		title: config.title,
		isShowTitle: typeof(config.isShowTitle)=='boolean' ? config.isShowTitle : false,
		btns: []
	};
	var columns = config.form.field;
	nsTemplate.setFieldHide('form', columns, config.form.hide);
	var tableColumns = config.table.field;
	nsTemplate.setFieldHide('table',tableColumns,config.table.hide);
	for(var i=0; i<columns.length; i++){
		columns[i].commonChangeHandler = commonChangeFormHandler;
	}

	var columnBtnHandlers;
	if($.isArray(config.table.tableRowBtns)){
		var columnBtnArr =  nsTemplate.runObjColumnBtnHandler(config.table.tableRowBtns,columnBtnHandler);
		var columnBtns = columnBtnArr[0];
		columnBtnHandlers = columnBtnArr[1];
		if(columnBtns.length > 0){
			var btnWidth = columnBtns.length * 30 + 10;
			var customerBtnJson = {
				title: '操作',
				width:btnWidth,
				tabPosition:'after',
				formatHandler: {
					type: 'button',
					data: {
						subdata:columnBtns
					}
				}
			};
			if(typeof(config.table.dataReturnbtns)=='function'){
				customerBtnJson.formatHandler.data.dataReturn = config.table.dataReturnbtns;
			}
			tableColumns.push(customerBtnJson);
		}
	}
	var tableBtns = [];
	var origalTableBtns;
	if($.isArray(config.table.btns)){
		var tableBtnArr = config.table.btns;
		if(config.browersystem == 'mobile'){
			if(!$.isEmptyObject(config.nav)){
				if($.isArray(config.nav.field)){
					tableBtnArr = $.merge(config.nav.field,config.table.btns);
				}
			}
		}
		var btnGroupArr = nsTemplate.runObjBtnHandler(tableBtnArr,commonTableBtnHandler,commonTableDropBtnHandler);
		tableBtns = btnGroupArr[0];
		origalTableBtns = btnGroupArr[1];
	}
	var isUserControl = typeof(config.form.isUserControl)=='boolean' ? config.form.isUserControl : true;
	isUserControl = config.browersystem == 'mobile' ? false : isUserControl; 
	var isColumnSearchHidden = config.browersystem == 'mobile' ? true : true;
	obj[config.formJson] = {
		isUserControl:isUserControl,//是否开启用户自定义配置
		isUserContidion:true,//是否查看筛选条件
		form:columns
	};
	var formParamsObject = {};
	for(var paramI=0; paramI<columns.length; paramI++){
		if(columns[paramI].value){
			formParamsObject[columns[paramI].id] = columns[paramI].value;
		}
		if(columns[paramI].value === 0){
			formParamsObject[columns[paramI].id] = columns[paramI].value;
		}
	}
	var tableParamsObject = $.extend(true,config.table.ajax.select.data,formParamsObject);
	obj[config.tableJson] = {
		columns: tableColumns,
		data: {
			src: config.table.ajax.select.src,
			type: config.table.ajax.select.type, //GET POST
			dataSrc: config.table.ajax.select.dataSrc,
			data: tableParamsObject, //参数对象{id:1,page:100}
			isServerMode: typeof(config.table.ajax.select.isServerMode)=='boolean'?config.table.ajax.select.isServerMode:false, //是否开启服务器模式
			isSearch: true, //是否开启搜索功能
			isPage: true, //是否开启分页
			lengthChange:true,
		},
		ui: {
			pageLengthMenu: 10, 			//可选页面数  auto是自动计算  all是全部
			isMulitSelect: true,					 //是否单选
			dragWidth: true,
			isColumnSearchHidden:isColumnSearchHidden,						//列字段查询
			isOpenCheck:true,						//是否开启全选
			isUseTableControl:true,					//开启列选择
			checkHandler:							allTableCheckHandler,
			columnHandler:							columnHandler,
			isUseMax:true,
			isUseTabs:								true,							//是否使用tabs状态
		},
		btns:{
			title:config.table.title,
			selfBtn:tableBtns
		}
	};
	if(typeof(config.table.ui)=='object'){
		if(!$.isEmptyObject(config.table.ui)){
			for(var ui in config.table.ui){
				if(ui == 'tabsName' || ui == 'isUseMax' || ui == 'isOpenCheck' || ui== 'tabsDefaultIndex' || ui== 'isUseTableControl' || ui=='isColumnSearchHidden'){
					obj[config.tableJson].ui[ui] = config.table.ui[ui];
				}
			}
		}
	}
	if(config.browersystem =='pc'){
		obj[config.tableJson].ui.isUseCleanLocalStorage = true;
	}
	//form表单公用返回事件
	function commonChangeFormHandler(runObj){
		nsTemplate.runObjHandler(config.form.changeHandler,'before',[runObj]);
		nsTemplate.runObjHandler(config.form.changeHandler,'change',[
			{
				after:function(runObj){
					var id = runObj.config.id;
					config.searchData[id] = runObj.value;
					nsTemplate.templates.searchPage.refresh(config);
				}
			},runObj
		]);
		nsTemplate.runObjHandler(config.form.changeHandler,'after',[runObj]);
	}
	//table表格全选事件
	function allTableCheckHandler(returnObj){
		var $table = baseDataTable.data[returnObj.tableID].uiConfig.$table;
		var $customer = $('#control-btn-toolbar-'+returnObj.tableID).find('.customer');
		var customerNumber = 0;
		if(returnObj.isChecked){
			$table.find('label.checkbox-inline').addClass('checked');
			//$table.find('input[type="checkbox"]').prev().addClass('checked');
			customerNumber =returnObj.data.length;
		}else{
			$table.find('label.checkbox-inline').removeClass('checked');
			//$table.find('input[type="checkbox"]').prev().removeClass('checked');
		}
		$customer.text(customerNumber);
	}
	//table表格自定义列配置
	function columnHandler(tableID){
		nsUI.tablecolumn.init(tableID)
	}
	//自定义列按钮事件
	function columnBtnHandler(data){
		var runHandler = columnBtnHandlers[data.buttonIndex];
		if(typeof(runHandler)=='object'){
			if(typeof(runHandler.beforeHandler)=='function'){
				nsTemplate.runObjHandler(runHandler, 'beforeHandler', [data]);
			}
			if(!$.isEmptyObject(runHandler.btn)){
				if(typeof(runHandler.btn)){}
				nsTemplate.runObjHandler(runHandler.btn,'handler',[data]);
			}
			if(typeof(runHandler.afterHandler)=='function'){
				nsTemplate.runObjHandler(runHandler, 'afterHandler', [data]);
			}
			if(typeof(runHandler.handler)=='function'){
				nsTemplate.runObjHandler(runHandler, 'handler', [data]);
			}
		}
	}
	//table表格普通按钮事件
	function commonTableBtnHandler(data){
		var runHandler = origalTableBtns[data.nsIndex].handler;
		if(typeof(runHandler)=='object'){
			if(typeof(runHandler.before)=='function'){
				nsTemplate.runObjHandler(runHandler, 'before', [data]);
			}
			if(typeof(runHandler.after)=='function'){
				nsTemplate.runObjHandler(runHandler, 'after', [data]);
			}
			if(typeof(runHandler.btn)=='function'){
				nsTemplate.runObjHandler(runHandler,'handler',[data]);
			}
		}
		if(typeof(runHandler)=='function'){
			nsTemplate.runObjHandler(origalTableBtns[data.nsIndex],'handler',[data]);
		}
	}
	//table表格一级下拉按钮事件
	function commonTableDropBtnHandler(data){
		var runHandler = origalTableBtns[data.nsIndex][data.nsSubIndex].handler;
		if(typeof(runHandler)=='object'){
			if(typeof(runHandler.before)=='function'){
				nsTemplate.runObjHandler(runHandler, 'before', [data]);
			}
			if(typeof(runHandler.btn)=='function'){
				nsTemplate.runObjHandler(runHandler,'handler',[data]);
			}
			if(typeof(runHandler.after)=='function'){
				nsTemplate.runObjHandler(runHandler, 'after', [data]);
			}
		}
		if(typeof(runHandler)=='function'){
			nsTemplate.runObjHandler(origalTableBtns[data.nsIndex][data.nsSubIndex],'handler',[data]);
		}
	}
}
nsTemplate.templates.searchPage.refreshSearchHtml = function(formID,$container,searchData){
	var liHtml = '';
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
		delete searchData[nID];
		var fillvalues = {}
		fillvalues[nID] = '';
		nsForm.fillValues(fillvalues,formID);
		var $container = $this.closest('.search-link');
		var formJson = nsForm.getFormJSON(formID,false);
		var tableID = formID.substring(0,formID.lastIndexOf('-'));
		tableID = 'table-'+tableID+'-table';
		//保留原来的参数
		if(config.table.ajax.select){
			if(config.table.ajax.select.data){
				for(key in config.table.ajax.select.data){
					if(typeof(jsonData[key]) == 'undefined'){
						jsonData[key] = config.table.ajax.select.data[key];
					}
				}
			}
		}
		//去掉为空的值 caoyuan 20180225
		for(key in jsonData){
			if(jsonData[key] === ''){
				delete jsonData[key];
			}
		}
		baseDataTable.reloadTableAJAX(tableID,formJson);
		nsTemplate.templates.searchPage.refreshSearchHtml(formID,$container,searchData);
	});
}
nsTemplate.templates.searchPage.createBtnJson = function(config){
	if(!$.isEmptyObject(config.nav)){
		if($.isArray(config.nav.field)){
			var btnGroupArr = nsTemplate.runObjBtnHandler(config.nav.field,baseBtnHandler,subBtnHandler);
			var btnArr = btnGroupArr[0];
			var origalBtnJson = btnGroupArr[1];
			var navId = config.id + '-btns';
			var navJson = {
				id:navId,
				btns:[btnArr],
				isShowTitle:typeof(config.isShowTitle)=='boolean' ? config.isShowTitle : false,
			}
			nsNav.init(navJson);
		}
	}
	function baseBtnHandler(element){
		var nIndex = element.attr('fid');
		var callbackHandler = origalBtnJson[nIndex];
		nsTemplate.runObjHandler(callbackHandler,'handler',[
			{
				before:function(){
					console.log('before')
				}
			}
		]);
	}
	function subBtnHandler(element){
		var nIndex = element.children('a').attr('fid');
		var subIndex = element.children('a').attr('optionid');
		callbackHandler = origalBtnJson[nIndex][subIndex];
		nsTemplate.runObjHandler(callbackHandler,'handler',[
			{
				before:function(){
					
				}
			}
		]);
	}
}	
//解析时间 type是类型比如today,nextday,prevday,week,nextweek,month,nextmonth,all
nsTemplate.templates.searchPage.getDate = function(type){
	var currentType = typeof(type) == 'undefined' ? 'today' : type;
	var curDate=new Date();
	var startTimer = '';
	var endTimer = '';
	var fullYear = curDate.getFullYear();
	var month = curDate.getMonth()+1 < 10 ? "0"+(curDate.getMonth()+1) : curDate.getMonth()+1;
	var day = curDate.getDate() < 10 ? "0"+(curDate.getDate()) : curDate.getDate();
	switch(currentType){
		case 'today':
			startTimer = fullYear + '-' + month + '-' + day + ' 00:00'; 
			endTimer = fullYear + '-' + month + '-' + day + ' 23:59';
			break;
		case 'nextday':
			day = curDate.getDate()+1 < 10 ? "0"+(curDate.getDate()+1) : curDate.getDate()+1;
			startTimer = fullYear + '-' + month + '-' + day + ' 00:00';
			endTimer = fullYear + '-' + month + '-' + day + ' 23:59';;
			break;
		case 'prevday':
			day = curDate.getDate()-1 < 10 ? "0"+(curDate.getDate()-1) : curDate.getDate()-1;
			startTimer = fullYear + '-' + month + '-' + day + ' 00:00';
			endTimer = fullYear + '-' + month + '-' + day + ' 23:59';
			break;
		case 'week':
			break;
		case 'nextweek':
			break;
		case 'prevmonth':
			
			break;
		case 'month':
			month = ((curDate.getMonth()-0+1)<10?'0'+(curDate.getMonth()-0+1):(curDate.getMonth()-0+1))+'-01';
			startTimer = fullYear + '-' + month + ' 00:00'; 
			endTimer = fullYear + '-' + month + '-' + day + '23:59';
			break;
		case 'nextmonth':
			
			break;
		case 'all':
			startTimer = fullYear + '-' + '01-01 00:00';
			endTimer = fullYear + '-' + month + '-' + day + ' 23:59';
			break;
	}
	console.log('start:'+startTimer+'endtimer:'+endTimer)
}
/*****************搜索模板页 end***********************************/
/*****************tab模板页 start*********************************/
nsTemplate.templates.managerTab.setDefault = function(configObj){
	var config = configObj;
	if(!$.isArray(config.tabs)){
		console.error('请填写tab参数，类型：数组并且必填');
		return false;
	}
	config.isShowHistoryBtn = typeof(config.isShowHistoryBtn) == 'boolean' ? config.isShowHistoryBtn : false;
	config.navId = 'nav';
	config.tableId = 'table';
	config.dialogId = config.id + '-dialog';
	config.formId = 'form';
	config.formPlateId = 'formPlate';
	config.logtimelineId = 'logtimeline';
	config.navJson = 'navJson';
	config.tableJson = 'tableJson';
	config.formJson = 'formJson';
	config.containerJson = 'containerJson';
	config.formPlateJson = 'formPlateJson';
	config.logtimelineJson = 'logtimelineJson';
	config.tabId = 'tabs';
	config.btnId = 'btns';
	config.panelId = 'panel';
	config.activeIndex = 0; //默认读tab第一个
	config.title = typeof(config.title) == 'string' ? config.title : '';
	return config;
}
nsTemplate.templates.managerTab.init = function(config){
	//记录config
	nsTemplate.templates.managerTab.data[config.id] = $.extend(true, {}, config);
	//设置默认值
	config = nsTemplate.templates.managerTab.setDefault(config);
	var commonFormChangeFunc = {};
	var commonFormPlateChangeFunc = {};
	var commonLogtimelineChangeFunc = {};
	var tableColumnBtnHandlers = {};
	var tableNavBtnFunc = {};
	if(config){
		//输出tab标题
		var tabNames = [];//tab标题
		var dataArr = [];
		for(var tabI=0; tabI<config.tabs.length; tabI++){
			tabNames.push(config.tabs[tabI].title);
			if(typeof(config.tabs[tabI].isActive)=='boolean'){
				if(config.tabs[tabI].isActive){config.activeIndex = tabI;}
			}
			if($.isArray(config.tabs[tabI].content)){
				dataArr.push(config.tabs[tabI].content);
			}
		}
		function getTabContentHtml(){
			var html = '';
			var data = dataArr[config.activeIndex];
			for(var dataI=0; dataI<data.length; dataI++){
				var type = data[dataI].type;
				var optionStr = '';
				if(typeof(data[dataI].options)=='object'){
					if(!$.isEmptyObject(data[dataI].options)){
						for(var option in data[dataI].options){
							optionStr += option + ':' + data[dataI].options[option] + ',';
						}
						optionStr = optionStr.substring(0,optionStr.lastIndexOf(','));
					}
				}
				var nsContainer = '';
				if(typeof(data[dataI].container)=='object'){
					if(!$.isEmptyObject(data[dataI].container)){
						var containerJson = 'containerJson' + dataI;
						nsContainer = 'ns-container="'+containerJson+'"';
					}
				}
				switch(type){
					case 'table':
						//ns-container="container1Json"
						html += '<panel ns-id="'+config.tableId+dataI+'" '+nsContainer+' ns-options="'+optionStr+'" ns-config="table:'+config.tableJson+dataI+'"></panel>';
						break;
					case 'form':
						html += '<panel ns-id="'+config.formId+dataI+'" '+nsContainer+' ns-options="'+optionStr+'" ns-config="form:'+config.formJson+dataI+'"></panel>';
						break;
					case 'formPlate':
						html += '<panel ns-id="'+config.formPlateId+dataI+'" '+nsContainer+' ns-options="'+optionStr+'" ns-config="formPlate:'+config.formPlateJson+dataI+'"></panel>';
						break;
					case 'logtimeline':
						html += '<panel ns-id="'+config.logtimelineId+dataI+'" '+nsContainer+' ns-options="'+optionStr+'" ns-config="logtimeline:'+config.logtimelineJson+dataI+'"></panel>';
						break;
					case 'panel':
						html += '<panel ns-id="'+config.panelId+dataI+'" '+nsContainer+' ns-options="'+optionStr+'"></panel>';
						break;
				}
			}
			return html;
		}
		function getTabHtml(){
			var tabHtml = '';
			for(var tabI=0; tabI<tabNames.length; tabI++){
				classStr = tabI == config.activeIndex ? 'active' : '';
				tabHtml += '<li ns-index="'+tabI+'" class="'+classStr+'">'
							+'<a href="javascript:void()" data-toggle="tab" ns-index="'+tabI+'">'+tabNames[tabI]+'</a>';
							+'</li>';
			}
			return tabHtml;
		}
		function getHtml(){
			var html = '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="templates:managerTab,isShowHistoryBtn:'+config.isShowHistoryBtn+'">'
							+getTabContentHtml()
						+'</layout>';
			return html;
		}
		var globalTabID = 'nstemplate-tab-'+config.id;
		var globalTabhtml = '<div id="'+globalTabID+'" class="col-xs-12 col-sm-12 nspanel nstemplate-tab">'
								+'<ul class="nav nav-tabs nav-tabs-justified">'
									+getTabHtml()
							+'</ul></div>';
		//围加根html
		var html = nsTemplate.aroundRootHtml(globalTabhtml);
		//将html添加到页面
		nsTemplate.appendHtml(html);
		var $templateTab = $('#'+globalTabID);
		$lis = $('#'+globalTabID+' ul > li');
		$lis.off('click');
		$lis.on('click',function(ev){
			config.activeIndex = $(this).attr('ns-index')
			refreshLayout()
		});
		refreshLayout();
		function refreshLayout(){
			refreshLayoutHtml();
			refreshLayoutData();
			refreshLayoutHandler();
		}
		function refreshLayoutHandler(){
			//初始化layout
			if(typeof(config.beforeInitHandler)=='function'){
				//初始化之前调用
				package = config.beforeInitHandler(config);
			}
			nsLayout.init(config.id);
			if(typeof(config.afterInitHandler)=='function'){
				//初始化之后调用
				config.afterInitHandler(config);
			}
		}
		function refreshLayoutHtml(){
			var html = getHtml();
			$templateTab.siblings().remove();
			$templateTab.parent().append(html);
		}
		function refreshLayoutData(){
			var obj = eval(config.package + '={}');
			var commonForm = [];
			var commonFormPlate = [];
			var commonLogtimeline = [];
			var data = dataArr[config.activeIndex];
			for(var i=0; i<data.length; i++){
				var configData = data[i];
				var type = configData.type;
				if(typeof(configData.container)=='object'){
					if(!$.isEmptyObject(configData.container)){
						var containerJson = config.containerJson + i;
						obj[containerJson] = configData.container;
					}
				}
				switch(type){
					case 'table':
						nsTemplate.setFieldHide('table',configData.field,configData.hide);
						var tableJson = config.tableJson + i;
						if($.isArray(configData.field)){
							var tableColumns = [];
							for(var columnI=0;columnI<configData.field.length; columnI++){
								tableColumns.push(configData.field[columnI]);
							}
							obj[tableJson] = {
								columns: tableColumns,
								data: {
									src: configData.ajax.select.src,
									type: configData.ajax.select.type, //GET POST
									dataSrc: configData.ajax.select.dataSrc,
									data: configData.ajax.select.data, //参数对象{id:1,page:100}
									isServerMode: false, //是否开启服务器模式
									isSearch: true, //是否开启搜索功能
									isPage: true, //是否开启分页
								},
								ui:{
									isUseTabs:true,
								},
								btns:{
									title:typeof(configData.title)=='undefined' ? '':configData.title,
								}
							}
							if($.isArray(configData.tableRowBtns)){
								var tableRowTabBtnArr = [];
								for(var rowBtnI=0; rowBtnI<configData.tableRowBtns.length; rowBtnI++){
									tableRowTabBtnArr.push(configData.tableRowBtns[rowBtnI]);
								}
								var columnBtnArr =  nsTemplate.runObjColumnBtnHandler(tableRowTabBtnArr,tableTabColumnBtnHandler);
								var columnBtns = columnBtnArr[0];
								tableColumnBtnHandlers[i] = columnBtnArr[1];
								if(columnBtns.length > 0){
									obj[tableJson].columns.push({
										title: '操作',
										formatHandler: {
											type: 'button',
											data: columnBtns
										}
									});
								}
							}
							if($.isArray(configData.btns)){
								var tableNavBtnTabArr = [];
								for(var navI=0; navI<configData.btns.length; navI++){
									tableNavBtnTabArr.push(configData.btns[navI]);
								}
								var btnGroupArr = nsTemplate.runObjBtnHandler(tableNavBtnTabArr,commonTableTabBtnHandler,commonTableTabDropBtnHandler);
								obj[tableJson].btns.selfBtn = btnGroupArr[0];
								tableNavBtnFunc[i] = btnGroupArr[1];
							}
						}
						break;
					case 'form':
						commonForm = configData.field;
						commonFormChangeFunc = configData.changeHandler;
						nsTemplate.setFieldHide('form', configData.field, configData.hide);
						var formJson = config.formJson + i;
						obj[formJson] = {
							isUserControl:typeof(configData.isUserControl)=='boolean'?configData.isUserControl : false,//是否开启用户自定义配置
							isUserContidion:typeof(configData.isUserContidion)=='boolean'?configData.isUserContidion: false,//是否查看筛选条件
							form:configData.field
						};
						break;
					case 'formPlate':
						commonFormPlate = configData.field;
						commonFormPlateChangeFunc = configData.changeHandler;
						nsTemplate.setFieldHide('formPlate', configData.field, configData.hide);
						var formPlateJson = config.formPlateJson + i;
						obj[formPlateJson] = {
							isUserControl:typeof(configData.isUserControl)=='boolean'?configData.isUserControl : false,//是否开启用户自定义配置
							isUserContidion:typeof(configData.isUserContidion)=='boolean'?configData.isUserContidion: false,//是否查看筛选条件
							form:configData.field,
							size:configData.plusOptions.size,
							title:configData.plusOptions.title,
							showNumber:configData.plusOptions.showNumber,
							manner:configData.plusOptions.manner,
							pattern:configData.plusOptions.pattern,
							url:configData.plusOptions.url,
							type:configData.plusOptions.type,
							data:configData.plusOptions.data, //李亚伟20180313 182虚拟机对照 添加
							dataSrc:configData.plusOptions.dataSrc,
							btns:configData.btns,
							formBtns:configData.formBtns
						};
						break;
					case 'logtimeline':
						commonLogtimeline = configData.field;
						commonLogtimelineChangeFunc = configData.changeHandler;
						nsTemplate.setFieldHide('logtimeline', configData.field, configData.hide);
						var logtimelineJson = config.logtimelineJson + i;
						obj[logtimelineJson] = {
							isUserControl:typeof(configData.isUserControl)=='boolean'?configData.isUserControl : false,//是否开启用户自定义配置
							isUserContidion:typeof(configData.isUserContidion)=='boolean'?configData.isUserContidion: false,//是否查看筛选条件
							field:configData.field,
							isShowComment:configData.plusOptions.isShowComment,
							isLogtimelineRight:configData.plusOptions.isLogtimelineRight,
							data:configData.plusOptions.data,
							templete:configData.plusOptions.templete,
							commentSend:configData.plusOptions.commentSend,
							commentDelete:configData.plusOptions.commentDelete,
							commentList:configData.plusOptions.commentList 	//李亚伟20180313 182虚拟机对照 添加
						};
						break;
				}
			}
			for(var formI=0; formI<commonForm.length; formI++){
				commonForm[formI].commonChangeHandler = commonFormTabHandler;
			}
			for(var formPlateI=0; formPlateI<commonFormPlate.length; formPlateI++){
				commonFormPlate[formPlateI].commonChangeHandler = commonFormPlateTabHandler;
			}
			for(var logtimelineI=0; logtimelineI<commonLogtimeline.length; logtimelineI++){
				commonLogtimeline[logtimelineI].commonChangeHandler = commonLogtimelineTabHandler;
			}
		}
	}
	function commonFormTabHandler(runObj){
		if(!$.isEmptyObject(commonFormChangeFunc)){
			if(typeof(commonFormChangeFunc.before)=='function'){
				nsTemplate.runObjHandler(commonFormChangeFunc,'before',[runObj]);
			}
			if(typeof(commonFormChangeFunc.after)=='function'){
				nsTemplate.runObjHandler(commonFormChangeFunc,'after',[runObj]);
			}
		}
		nsTemplate.runObjHandler(commonFormChangeFunc,'change',[
			{
				after:function(runObj){
					console.log(runObj)
				}
			},runObj
		]);
	}
	function commonFormPlateTabHandler(runObj){
		if(!$.isEmptyObject(commonFormPlateChangeFunc)){
			if(typeof(commonFormPlateChangeFunc.before)=='function'){
				nsTemplate.runObjHandler(commonFormPlateChangeFunc,'before',[runObj]);
			}
			if(typeof(commonFormPlateChangeFunc.after)=='function'){
				nsTemplate.runObjHandler(commonFormPlateChangeFunc,'after',[runObj]);
			}
		}
		nsTemplate.runObjHandler(commonFormPlateChangeFunc,'change',[
			{
				after:function(runObj){
					console.log(runObj)
				}
			},runObj
		]);
	}
	function commonLogtimelineTabHandler(runObj){
		if(!$.isEmptyObject(commonLogtimelineChangeFunc)){
			if(typeof(commonLogtimelineChangeFunc.before)=='function'){
				nsTemplate.runObjHandler(commonLogtimelineChangeFunc,'before',[runObj]);
			}
			if(typeof(commonLogtimelineChangeFunc.after)=='function'){
				nsTemplate.runObjHandler(commonLogtimelineChangeFunc,'after',[runObj]);
			}
		}
		nsTemplate.runObjHandler(commonLogtimelineChangeFunc,'change',[
			{
				after:function(runObj){
					console.log(runObj)
				}
			},runObj
		]);
	}
	function tableTabColumnBtnHandler(data){
		for(var column in tableColumnBtnHandlers){
			var runHandler = tableColumnBtnHandlers[column][data.buttonIndex];
			if(typeof(runHandler)=='object'){
				if(typeof(runHandler.beforeHandler)=='function'){
					nsTemplate.runObjHandler(runHandler, 'beforeHandler', [data]);
				}
				if(!$.isEmptyObject(runHandler.btn)){
					if(typeof(runHandler.btn)){}
					nsTemplate.runObjHandler(runHandler.btn,'handler',[data]);
				}
				if(typeof(runHandler.afterHandler)=='function'){
					nsTemplate.runObjHandler(runHandler, 'afterHandler', [data]);
				}
			}
		}
	}
	function commonTableTabBtnHandler(data){
		for(var tableBtn in tableNavBtnFunc){
			var runHandler = tableNavBtnFunc[tableBtn][data.nsIndex].handler;
			if(typeof(runHandler)=='object'){
				if(typeof(runHandler.before)=='function'){
					nsTemplate.runObjHandler(runHandler, 'before', [data]);
				}
				if(typeof(runHandler.after)=='function'){
					nsTemplate.runObjHandler(runHandler, 'after', [data]);
				}
				if(typeof(runHandler.btn)=='function'){
					nsTemplate.runObjHandler(runHandler,'handler',[data]);
				}
			}
			if(typeof(runHandler)=='function'){
				nsTemplate.runObjHandler(tableNavBtnFunc[tableBtn][data.nsIndex],'handler',[data]);
			}
		}
	}
	function commonTableTabDropBtnHandler(data){
		for(var tableBtn in tableNavBtnFunc){
			var runHandler = tableNavBtnFunc[tableBtn][data.nsIndex][data.nsSubIndex].handler;
			if(typeof(runHandler)=='object'){
				if(typeof(runHandler.before)=='function'){
					nsTemplate.runObjHandler(runHandler, 'before', [data]);
				}
				if(typeof(runHandler.btn)=='function'){
					nsTemplate.runObjHandler(runHandler,'handler',[data]);
				}
				if(typeof(runHandler.after)=='function'){
					nsTemplate.runObjHandler(runHandler, 'after', [data]);
				}
			}
			if(typeof(runHandler)=='function'){
				nsTemplate.runObjHandler(tableNavBtnFunc[tableBtn][data.nsIndex][data.nsSubIndex],'handler',[data]);
			}
		}
	}
}
/*****************tab模板页 end***********************************/
/************************以下为双表格模板*****************************/
nsTemplate.templates.managerMoreTable.init = function(config){
	//记录config
	nsTemplate.templates.managerMoreTable.data[config.id] = $.extend(true,{},config);
	//设置默认值
	config = nsTemplate.templates.managerMoreTable.setDefault(config);
	//生成html
	var html = nsTemplate.templates.managerMoreTable.getHtml(config);
	//围加根html
	html = nsTemplate.aroundRootHtml(html);
	//将html添加到页面
	nsTemplate.appendHtml(html);
	//创建模板Json对象
	nsTemplate.templates.managerMoreTable.createJson(config);
	//初始化layout
	nsLayout.init(config.id);
	return true;
}
//生成html
nsTemplate.templates.managerMoreTable.getHtml = function(config){
	var html = '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="templatetest.managerMoreTable">' +
				'<nav ns-id="' + config.navId + '" ns-config="' + config.navJson + '" ns-options="templates:managerTable"></nav>' +
				'<panel ns-id="' + config['mainConfig'].tableId+ '" ns-options="col:12" ns-config="table:' + config.mainConfigTableJson + '"></panel>' +
				'<panel ns-id="' + config['subConfig'].tableId + '" ns-options="col:12" ns-config="table:' + config.subConfigTableJson + '"></panel>' +
				'</layout>';
	return html;
}
//创建模板json对象
nsTemplate.templates.managerMoreTable.createJson = function(config){
	var obj = eval(config.package + '={}');
	obj[config.navJson] = {
		title : config.title,
		isShowTitle :true,
		btns:[]
	};
	var	columnBtnHandlers = {};
	$.each(config.moreConfig,function(key,value){
		nsTemplate.setFieldHide('table',value.table.field,value.table.hide);
		var btnGroupArr = nsTemplate.runObjBtnHandler(value.tableBtns,commonTableBtnHandler,commonTableDropBtnHandler);
		var tableBtns = btnGroupArr[0];
		var	origalTableBtns = btnGroupArr[1];
		var tableRowGroupArr=nsTemplate.runObjColumnBtnHandler(value.tableRowBtns,columnBtnHandler);
		var btns= tableRowGroupArr[0];
		columnBtnHandlers["'table-"+config.id+"-"+config[key].tableId+"'"] = tableRowGroupArr[1];
		value.table.field.push({
			field: 'id',
			title: '操作',
			width: 100,
			searchable: false,
			formatHandler: {
				type: 'button',
				data: btns
			}
		});
		obj[config[key+'TableJson']] = {
		columns: value.table.field,
		data: {
			src: value.ajax.select.ajax,
			type: value.ajax.select.type, //GET POST
			dataSrc: value.ajax.select.dataSrc,
			data: {}, //参数对象{id:1,page:100}
			isServerMode: false, //是否开启服务器模式
			isSearch: true, //是否开启搜索功能
			isPage: true, //是否开启分页
			},
		ui: {
			pageLengthMenu: 10, //可选页面数  auto是自动计算  all是全部
			isSingleSelect: true, //是否单选
			dragWidth: false,
			isUseTabs:true,
		},
		btns: {
			selfBtn:tableBtns
			}
		};
		//自定义列按钮事件
	function columnBtnHandler(data){
		var runHandler = columnBtnHandlers["'"+data.tableId+"'"][data.buttonIndex];
		if(typeof(runHandler)=='object'){
			if(typeof(runHandler.beforeHandler)=='function'){
				nsTemplate.runObjHandler(runHandler, 'beforeHandler', [data]);
			}
			if(!$.isEmptyObject(runHandler.btn)){
				if(typeof(runHandler.btn)){}
				nsTemplate.runObjHandler(runHandler.btn,'handler',[data]);
			}
			if(typeof(runHandler.afterHandler)=='function'){
				nsTemplate.runObjHandler(runHandler, 'afterHandler', [data]);
			}
		}
	}
	//table表格普通按钮事件
	function commonTableBtnHandler(data){
		var runHandler = origalTableBtns[data.nsIndex].handler;
		var btnHandler = origalTableBtns[data.nsIndex];
		if(typeof(runHandler)=='object'){
			if(!$.isEmptyObject(runHandler.btn)){
				btnHandler = runHandler.btn;
			}
		}
		nsTemplate.runObjHandler(runHandler, 'beforeHandler', [data]);
		nsTemplate.runObjHandler(btnHandler,'handler',[
			{
				after:function(data){
					console.log('after')
					console.log(data)
				}
			},data
		]);
		nsTemplate.runObjHandler(runHandler, 'afterHandler', [data]);
	}
	//table表格一级下拉按钮事件
	function commonTableDropBtnHandler(data){
		var runHandler = origalTableBtns[data.nsIndex][data.nsSubIndex].handler;
		if(typeof(runHandler)=='object'){
			if(typeof(runHandler.beforeHandler)=='function'){
				nsTemplate.runObjHandler(runHandler, 'beforeHandler', [data]);
			}
			if(typeof(runHandler.btn.handler)=='function'){
				nsTemplate.runObjHandler(runHandler,'handler',[data]);
			}
			if(typeof(runHandler.afterHandler)=='function'){
				nsTemplate.runObjHandler(runHandler, 'afterHandler', [data]);
			}
		}
		if(typeof(runHandler)=='function'){
			nsTemplate.runObjHandler(origalTableBtns[data.nsIndex][data.nsSubIndex],'handler',[data]);
		}
	}
	})
}
//设置默认值
nsTemplate.templates.managerMoreTable.setDefault = function(config){
	config.navId = 'nav';
	config.navJson = 'navJson';
	config.tabId = config.id + '-tabs';
	config.title = typeof(config.title) == 'string' ? config.title : '';
	config['mainConfig'] ={};
	config['subConfig']={};
	config['mainConfig'].tableId = 'main-table';
	config['subConfig'].tableId = 'sub-table';
	config.mainDialogId = config.id + 'main-dialog';
	config.subDialogId = config.id + 'sub-dialog';
	config.mainFormId = 'main-form';
	config.subFormId = 'sub-form';
	config.mainConfigTableJson = 'mainTableJson';
	config.subConfigTableJson = 'subTableJson';
	config.mainFormJson = 'mainFormJson';
	config.subFormJson = 'subFormJson';
	config.mainTitle = typeof(config.moreConfig.mainConfig.title) == 'string' ? config.moreConfig.mainConfig.title : '';
	config.subTitle = typeof(config.moreConfig.subConfig.title) == 'string' ? config.moreConfig.subConfig.title : '';
	return config;
}
/************************以上为双表格模板*****************************/
/********************统计模板 start***********************/
nsTemplate.templates.countCharttable.init = function(config){
	//记录config
	nsTemplate.templates.countCharttable.data[config.id] = $.extend(true, {}, config);
	//设置默认值
	config = nsTemplate.templates.searchPage.setDefault(config);
	setDefault();
	function setDefault(){
		if(!$.isArray(config.table.charts)){config.table.charts = [];}
	}
	//生成html
	function getHtml(){
		var navHtml = '';
		var formHtml = '';
		var tableHtml = '<panel ns-id="customertable" ns-options="col:12" ns-config="customertable:tableJson"></panel>';
		if(!$.isEmptyObject(config.nav)){
			if($.isArray(config.nav.field)){
				navHtml = '<nav ns-id="' + config.navId + '" ns-config="' + config.navJson + '" ns-options="templates:countCharttable"></nav>';
			}
		}
		if(!$.isEmptyObject(config.form)){
			var nContainer = '';
			if(!$.isEmptyObject(config.form.container)){
				nContainer = 'ns-container="containerJson"';
			}
			formHtml = '<panel ns-id="'+config.formId+'" ns-options="col:12"  '+nContainer+' ns-config="form:'+config.formJson+'"></panel>';
		}
		var optionsStr = 'templates:countCharttable';
		if(config.isShowHistoryBtn){optionsStr+=',isShowHistoryBtn:true'}else{optionsStr+=',isShowHistoryBtn:false'}
		return '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="'+optionsStr+'">'
					+navHtml + formHtml + tableHtml
				+'</layout>';
	}
	var html = getHtml();
	//围加根html
	html = nsTemplate.aroundRootHtml(html);
	//将html添加到页面
	nsTemplate.appendHtml(html);
	//创建模板Json对象
	createJson();
	nsLayout.init(config.id);
	function createJson(){
		var obj = eval(config.package + '={}');
		if(!$.isEmptyObject(config.nav)){	
			obj[config.navJson] = {
				id: config.navId,
				title: config.title,
				isShowTitle: typeof(config.isShowTitle)=='boolean' ? config.isShowTitle : false,
				btns: [config.nav.field]
			};
		}
		if(!$.isEmptyObject(config.form)){
			for(var i=0; i<config.form.field.length; i++){
				config.form.field[i].commonChangeHandler = commonChangeFormHandler;
			}
			nsTemplate.setFieldHide('form', config.form.field, config.form.hide);
			obj[config.formJson] = {
				isUserControl:typeof(config.form.isUserControl)=='boolean' ? config.form.isUserControl : false,//是否开启用户自定义配置
				isUserContidion:typeof(config.form.isUserContidion)=='boolean' ? config.form.isUserContidion : false,//是否查看筛选条件
				form:config.form.field
			};
			//form表单公用返回事件
			function commonChangeFormHandler(runObj){
				nsTemplate.runObjHandler(config.form.changeHandler,'before',[runObj]);
				nsTemplate.runObjHandler(config.form.changeHandler,'change',[
					{
						after:function(runObj){
							//统计模板执行的操作是根据检索值刷新表格和图表
							var formId = config.id + '-form';
							var jsonData = nsForm.getFormJSON(formId);
							if(typeof(config.beforeSubmitHandler)=='function'){
								jsonData = config.beforeSubmitHandler(jsonData);
								if(jsonData === false){return;}
							}
							for(key in jsonData){
								if(jsonData[key] == ''){
									delete jsonData[key];
								}
							}
							var tableID = config.id + '-customertable';
							nsUI.customertable[tableID].config.ajax.data = jsonData;
							nsUI.customertable.refresh(tableID);
						}
					},runObj
				]);
				nsTemplate.runObjHandler(config.form.changeHandler,'after',[runObj]);
			}
			if(!$.isEmptyObject(config.form.container)){
				obj['containerJson'] = config.form.container;
			}
		}
		obj['tableJson'] = config.table;
	}
}
/********************统计模板 end***********************/
/********************多表单模板 start***********************/
nsTemplate.templates.managerForms.init = function(config){
	setDefault();
	function setDefault(){
		config.isShowHistoryBtn = typeof(config.isShowHistoryBtn) == 'boolean' ? config.isShowHistoryBtn : false;
		config.navId = 'nav';
		config.isNav = false;
		if(typeof(config.nav)=='object'){
			if($.isArray(config.nav.field)){
				config.isNav = true;
			}
			config.nav.title = typeof(config.nav.title)=='string' ? config.nav.title : '';
			config.nav.isShowTitle = typeof(config.nav.isShowTitle)=='boolean' ? config.nav.isShowTitle : false;
		}
		config.navJson = 'navJson';
		config.tableJson = 'tableJson';
		config.formJson = 'formJson';
		config.formId = 'form';
		config.tableId = 'table';
		config.containerJson = 'containerJson';
		config.mode = typeof(config.mode)=='string' ? config.mode : 'normal';
	}
	var isValid = true;
	if(debugerMode){
		var validArray = 
		[
			['forms','array',true],
		]
		isValid = nsDebuger.validOptions(validArray,config);
	}
	if(isValid){
		//验证通过则继续
		function getHtml(){
			var navHtml = '';
			var formHtml = '';
			if(config.isNav){
				navHtml = '<nav ns-id="' + config.navId + '" ns-config="' + config.navJson + '" ns-options="templates:managerForms"></nav>';
			}
			for(var formI=0; formI<config.forms.length; formI++){
				var optionStr = '';
				for(var option in config.forms[formI].options){
					optionStr += option + ':' + config.forms[formI].options[option] + ',';
				}
				optionStr = optionStr.substring(0,optionStr.lastIndexOf(','));
				formHtml += '<panel ns-id="'+config.formId+formI+'" ns-options="'+optionStr+'" ns-config="form:'+config.formJson+formI+'"></panel>';
				if(typeof(config.forms[formI].table)=='object'){
					var nsContainer = '';
					if(typeof(config.forms[formI].table.container)=='object'){
						if($.isArray(config.forms[formI].table.container.forms)){
							nsContainer = 'ns-container="'+config.containerJson+formI+'"';
						}
					}
					formHtml += '<panel ns-id="'+config.tableId+formI+'" '+nsContainer+' ns-config="table:'+config.tableJson+formI+'"></panel>'
				}
			}
			var html = '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="templates:managerForms,mode:mode-'+config.mode+',isShowHistoryBtn:'+config.isShowHistoryBtn+'">'
							+navHtml+formHtml
						+'</layout>';
			return html;
		}
		var html = getHtml();
		//围加根html
		html = nsTemplate.aroundRootHtml(html);
		//将html添加到页面
		nsTemplate.appendHtml(html);
		createJson();
		//nsLayout.init(config.id);
		function createJson(){
			var obj = eval(config.package + '={}');
			if(config.isNav){
				obj[config.navJson] = {
					title:config.nav.title,
					isShowTitle:config.nav.isShowTitle,
					btns:[config.nav.field]
				}
			}
			for(var formI=0; formI<config.forms.length; formI++){
				var formIndex = config.formJson+formI;
				nsTemplate.setFieldHide('form',config.forms[formI].field,config.forms[formI].hide);
				obj[formIndex] = {
					isUserControl:typeof(config.forms[formI].isUserControl)=='boolean'?config.forms[formI].isUserControl:false,//是否开启用户自定义配置
					isUserContidion:typeof(config.forms[formI].isUserContidion)=='boolean'?config.forms[formI].isUserContidion:false,//是否查看筛选条件
					plusClass:config.forms[formI].plusClass,
					form:config.forms[formI].field,
					isSingleMode:config.forms[formI].isSingleMode
				}
				if(typeof(config.forms[formI].table)=='object'){
					nsTemplate.setFieldHide('table',config.forms[formI].table.field,config.forms[formI].table.hide);
					var tableIndex = config.tableJson+formI;
					obj[tableIndex] = {
						columns: config.forms[formI].table.field,
						data: {
							src: config.forms[formI].table.ajax.src,
							type: config.forms[formI].table.ajax.type, //GET POST
							dataSrc: config.forms[formI].table.ajax.dataSrc,
							data: config.forms[formI].table.ajax.data, //参数对象{id:1,page:100}
							isServerMode: typeof(config.forms[formI].table.ajax.isServerMode)=='boolean'?config.forms[formI].table.ajax.isServerMode:false, //是否开启服务器模式
							isSearch: true, //是否开启搜索功能
							isPage: true, //是否开启分页
						},
						ui:{
							isUseTabs:true,
						}
					}
					for(var ui in config.forms[formI].table.ui){
						obj[tableIndex].ui[ui] = config.forms[formI].table.ui[ui];
					}
					if(typeof(config.forms[formI].table.container)=='object'){
						var containerIndex = config.containerJson+formI;
						obj[containerIndex] = config.forms[formI].table.container;
					}
				}
			}
		
			nsLayout.init(config.id);
		}
	}else{
		console.log(config);
		nsalert('配置参数有误');
	}
}
/******************** 多表单模板 end ***********************/