/***
***列表过滤模板组成包含button,form,table,tab
*****/
/******************** 列表过滤模板 start ***********************/
nsTemplate.templates.mobileListfilter = (function(){
	var config = {};
	function templateInit(){
		nsTemplate.templates.mobileListfilter.data = {};  
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
		if($btn.rowData){
			//如果是行内按钮则直接返回行的数据
			data.value = $btn.rowData;
			formId = data.tableId.substring(data.tableId.indexOf('-')+1,data.tableId.length)+'-customerform';
		}else{
			var selectedData = baseDataTable.getTableSelectData(config.fullTableId,false);//获取行选中数据
			if(selectedData){
				data.value = selectedData;
			}else{
				data.value = false;
			}
			var navId = $btn.closest('.nav-form').attr('id');
			formId = navId.substring(0,navId.lastIndexOf('-'))+'-customerform';
		}
		data.options = {idField:config.table.idField};
		if($('#'+formId).length > 0){
			//存在form
			data.containerFormJson = nsTemplate.getChargeDataByForm(formId);
		}
		data.btnOptionsConfig = {
			currentTable:'main',//当前操作是主表还是附表
			isOuterBtn:isOuterBtn,//是否是外部按钮
			descritute:{keyField:config.table.keyField,idField:config.table.idField}
		}
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
			/*for(var rowI=0; rowI<res.length; rowI++){
				nsList.rowEdit(config.fullTableId, res[rowI], {isUseNotInputData:true});
			}*/
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
			fullNavId:								config.id+'nav',
			fullFormId:								config.id+'-form',
			fullTableId:							'table-'+config.id+'-table',
			fullTitleId:							config.id+'-templateTitle',
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
				break;
			case 'simple-mobile':
			case 'mobile-crm-search':
				//简单条件的手机查询页面
				config.isAutoSelect = false;
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
	//获取html
	function getHtml(){
		var navHtml = '<div class="page-title nav-form" id="'+config.fullNavId+'"></div>';
		var formHtml = '<div class="panel-body" id="'+config.fullFormId+'"></div>';
		var tableHtml = '<div class="" id="table-'+config.fullTableId+'"></div>';
		return '<div class="templates-'+config.mode+'">'+navHtml+formHtml+tableHtml+'</div>';
	}
	//初始化格式数据
	function getInitJson(){
		var formFieldArray = $.extend(true,[],config.form.field);
		var tableFieldArray = $.extend(true,[],config.table.field);
		var navJson = {
			id:					config.fullNavId,
			isShowTitle:		false,
			search:				{
				mode:				'simple',  //simple,select,advance
				placeholder:		'客户名称',
				changeHandler:		{
					type:		'change keyup',			//要触发的事件类型
					func:		function(valuestr){
						console.log(valuestr);
					}
				}	
			},
			btns:[]
		}
		var formJson = {
			id:  		config.fullFormId,
			size: 		"standard",
			format: 	"standard",
			fillbg: 	true,
			form:		formFieldArray,
		}
		var tableJson = {
			dataConfig:{
				tableID:config.fullTableId,
				dataSource:[{
					hazardCode:'123',
				},{
					hazardCode:'123',
				}]
			},
			columns:tableFieldArray,
			ui: {
				pageLengthMenu:		10,
				displayMode:		'block',
				$container:			$('#table-'+config.fullTableId),
			}
		}
		nsNav.init(navJson);
		nsForm.init(formJson);
		nsList.init(tableJson.dataConfig,tableJson.columns,tableJson.ui);
	}
	//初始化方法调用
	function init(configObj){
		if(configObj.mode != 'mobile-crm-search'){
			//sjj 20181022 手机端crm模板
			return false;
		}
		config = configObj;
		//第一次执行初始化模板
		if(typeof(nsTemplate.templates.mobileListfilter.data)=='undefined'){
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
		nsTemplate.templates.mobileListfilter.data[config.id] = {
			original:$.extend(true,{},config),
			config:config
		}
		var html = getHtml();
		//围加根html
		html = nsTemplate.aroundRootHtml(html);
		//将html添加到页面
		nsTemplate.appendHtml(html);
		getInitJson();
	}
	return {
		init:								init,							//模板初始化调用
		dialogBeforeHandler:				dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:					ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:					ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:					loadPageHandler,				//弹框初始化加载方法
		closePageHandler:					closePageHandler,				//弹框关闭方法
	}
})(jQuery)
/******************** 列表过滤模板 end ************************/