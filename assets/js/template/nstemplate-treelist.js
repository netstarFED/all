/****
***表单表格模板包含form，table,button(导航上显示的按钮)
****
********/
/******************** 表单表格模板 start ***********************/
nsTemplate.templates.treelist = (function(){
	var config = {};//当前配置参数
	var currentQueryParams = {
		count:0,//页码条数
		first:0,//起始页码
		queryParams:{
			parid: "-1",//当前查询的节点id 
			isfilter: false, //快速查询 默认false
			isshowstop: "0",//自定义过滤值
			filtermode: "quickquery",//快速查询模式 默认快速查询
			filterstr: ""//查询值
		},//查询条件
	};//当前查询参数
	var componentConfig = {};//组件相关配置参数
	/*参数结构形式参考
		*  count: 100
			filter: null
			first: 0
			orders:[
			  {
				ascending:true/false  升序or降序
			  dataField:''//字段名  

			}
			]
			pagerId: "$2669e212$grid_pager1"
			queryParams: {
			   parid: "423652501186349696", 
			   isfilter: false/true,   
			   isshowstop: "0"
			   filtermode: "quickquery/namepy/namepy/namepy"
			   filterstr: "333"，
			 
			   isqtyautoupload: "-1"
			}
	*/
	function refreshTableData(tableId){
		nsTable.reloadTableAJAX(tableId,currentQueryParams);
	}//刷新表格数据

	function treeEditBtnHandler(){}//树编辑事件
	function searchTreePosition(data){
		//先判断检索的值是否存在，按全称进行的节点查找
		var templateId = data.dom.closest('.treelist').attr('id');
		var treeId = 'tree-tree-plane-'+templateId+'-tree';
		var treeObj = nsDataFormat.tree[treeId];
		var treeNode = treeObj.getNodeByParam("name",data.value);
		if(!$.isEmptyObject(treeNode)){
			//存在节点的情况下，通过选中当前节点来定位到所有位置
			//两个事件 1.选中节点 2.根据当前节点id作为参数刷新表格和分类数据
			var tableId = 'table-table-plane-'+templateId;
			currentQueryParams.queryParams.parid = treeNode.id;
			currentQueryParams.queryParams.isfilter = false;
			treeObj.selectNode(treeNode);//设置选中节点
			refreshTableData(tableId);//刷新表格
		}else{
			//该节点不存在则不能进行定位关联检索方法
			nsalert('无法定位分类，请确认分类名是否正确！');
		}
	}//定位树节点
	function treenodeClickHandler(data){
		/*
			*treeId 			容器id
			*value 				节点值
			*id 				节点id
			*treeNode 			当前节点数据
		*/
		//此方法只是在获取节点刷新表格和分类数据
		var prefixStr = 'tree-tree-plane-';
		var afterfixStr = '-tree';
		var templateId = data.treeId.substring(prefixStr.length,data.treeId.length-afterfixStr.length);
		var tableId = 'table-table-plane-'+templateId;
		currentQueryParams.queryParams.parid = data.id;
		currentQueryParams.queryParams.isfilter = false;
		var classJson = {
			containerId:'class-'+config.id,
			id:data.id
		};
		getClassAjax(classJson);
		refreshTableData(tableId);
	}//树节点单击事件

	function quickquerySearchHandler(data){
		var formId = data.dom.closest('.treelist-table-quickquery').attr('id');
		var formJson = nsTemplate.getChargeDataByForm(formId);
		currentQueryParams.queryParams.isfilter = true;
		for(var value in formJson){
			currentQueryParams.queryParams[value] = formJson[value];
		}
		var prefixStr = 'quickquery-';
		var tableId = formId.substring(prefixStr.length,formId.length);
		refreshTableData(tableId);
	}//快速检索
	function customFilterSelectQueryHandler(data){
		currentQueryParams.queryParams[data.id] = data.value;
		var formId = data.dom.closest('.treelist-table-filtercondition').attr('id');
		var prefixStr = 'customcondition-';
		var tableId = formId.substring(prefixStr.length,formId.length);
		refreshTableData(tableId);
	} //自定义过滤下拉选查询

	function customFilterRefreshBtnHandler($btn){
		var tableId = $btn.closest('.treelist-table-component').attr('id');
		tableId = 'table-'+tableId;
		currentQueryParams.queryParams.isfilter = true;
		refreshTableData(tableId);
	}//表格自定义过滤
	function pageLengthChangeHandler(data){
		/*
			*tableId 		表格id
			*pageLength		当前显示的条数
		*/
		currentQueryParams.count = data.pageLength;
		refreshTableData(data.tableId);
	}
	function isLengthChangeAfterHandler(data){
		/*
			*tableId 表格id
		*/
		//公式  起码页 = 页码*显示条数
		currentQueryParams.first = nsTable.data[data.tableId].currentPage * nsTable.data[data.tableId].currentLength;
		console.log(currentQueryParams)
		//refreshTableData(data.tableId);
	}//跳转页码之后的回调事件

	function tableAddBtnHandler($btn){

	}//空白新增
	function tableAddRowHandler($btn){

	}//添加
	function tableSelectedBtnHandler($btn){
		var navId = $btn.closest('.nav-form').attr('id');
		var prefix = 'pagebtn-plane-';
		var templateId = navId.substring(prefix.length,navId.length);
		var tableId = 'table-table-plane-'+templateId;
		var selectData = nsTable.getSingleRowSelectedData(tableId);
	}//选中
	function tableSelectedAndCloseHandler($btn){
		
	}//选中并关闭
	function tableRowDoubleSelectHandler(data){
		var data = baseDataTable.table[data.tableID].row(data.obj).data();
		if(typeof(componentConfig.doubleClickHandler)=='function'){
			componentConfig.doubleClickHandler(data);
		}
	}//表格行双击事件
	var treeBtn = [{
		text:'编辑分类',
		handler:treeEditBtnHandler
	}];
	var pageButtonJson = {
		current:[{
			text:'空白新增',
			isReturn:true,
			handler:tableAddBtnHandler
		},{
			text:'选中',
			isReturn:true,
			handler:tableSelectedBtnHandler
		},{
			text:'选中并关闭',
			isReturn:true,
			handler:tableSelectedAndCloseHandler
		},{
			text:'添加',
			isReturn:true,
			handler:tableAddRowHandler
		}],
		common:[{
			text:'选中',
			isReturn:true,
			handler:tableSelectedBtnHandler
		},{
			text:'选中并关闭',
			isReturn:true,
			handler:tableSelectedAndCloseHandler
		},{
			text:'添加',
			isReturn:true,
			handler:tableAddRowHandler
		}]
	};//
	//输出树容器
	function getTreeHtml(treeConfig){
		var titleHtml = '';
		if(treeConfig.title){
			titleHtml = '<div class="treelist-tree-title">'+treeConfig.title+'</div>';
		}
		return titleHtml
				+'<div class="treelist-tree-ztree layout-ztree autoHeight" id="'+treeConfig.id+'"></div>'
				+'<div class="treelist-tree-btn nav-form" id="'+treeConfig.btnId+'"></div>';
	}
	//输出table
	function getTableHtml(tableConfig){
		return '<div class="treelist-table-condition">'
				+'</div>'
				+'<div class="table-responsive">'
						+'<table cellspacing="0" class="table table-hover table-striped table-bordered dataTable" '
						+'id="'+tableConfig.data.tableID+'">'
						+'</table>'
				+'</div>';
	}
	//输出树节点搜索组件
	function treePlaneSearchInit(searchTreeJson){
		var searchHtml = '<div class="treelist-tree-search" id="'+searchTreeJson.id+'"></div>';
		var treeId = searchTreeJson.id.substring(7,searchTreeJson.id.length);
		$('#'+treeId).before(searchHtml);
		nsForm.init(searchTreeJson);
	}
	//树初始化组件
	function treePlaneInit(_treeConfig){
		var treeConfig = $.extend(true,{},_treeConfig);
		if(!$.isEmptyObject(config.tree)){	
			treeConfig.searchTreeJson.id = 'search-tree-'+treeConfig.containerId;
			treeConfig.id = 'tree-'+treeConfig.containerId;
			treeConfig.btnId = 'btn-tree-'+treeConfig.containerId;
			var treeHtml = getTreeHtml(treeConfig);
			$('#'+treeConfig.containerId).html(treeHtml);//输出树容器
			treeSelectorUI.treePlane.init(treeConfig);//节点树实例化调用
			var navJson = {
				id:treeConfig.btnId,
				isShowTitle:false,
				btns:[treeBtn]
			};
			nsNav.init(navJson);
			if(treeConfig.searchTreeJson){
				treePlaneSearchInit(treeConfig.searchTreeJson);
			}
		}
	}	
	//表格快速查询组件
	function tableQuickqueryInit(quickqueryJson){
		//存在过滤选项	
		var html = '<div class="treelist-table-quickquery" id="'+quickqueryJson.id+'"></div>';
		var prefixStr = 'quickquery-table-';
		var containerId = quickqueryJson.id.substring(prefixStr.length,quickqueryJson.id.length);
		if($('#'+containerId+' .treelist-table-quickquery').length > 0){
			$('#'+containerId+' .treelist-table-quickquery').remove();
		}
		$('#'+containerId+' .treelist-table-condition').append(html);
		nsForm.init(quickqueryJson);
	}
	//表格自定义按钮组件
	function tableCustomBtnInit(customBtnJson){
		var html = '<div class="treelist-table-custombtn nav-form" id="'+customBtnJson.id+'"></div>';
		var prefixStr = 'custombtn-table-';
		var containerId = customBtnJson.id.substring(prefixStr.length,customBtnJson.id.length);
		if($('#'+containerId+' .treelist-table-custombtn').length > 0){
			$('#'+containerId+' .treelist-table-custombtn').remove();
		}
		$('#'+containerId+' .treelist-table-condition').append(html);
		nsNav.init(customBtnJson);
	}
	//表格自定义过滤条件组件
	function tableCustomFilterConditionInit(customFilterJson){
		var html = '<div class="treelist-table-filtercondition" id="'+customFilterJson.id+'"></div>';
		var prefixStr = 'customcondition-table-';
		var containerId = customFilterJson.id.substring(prefixStr.length,customFilterJson.id.length);
		if($('#'+containerId+' .treelist-table-filtercondition').length > 0){
			$('#'+containerId+' .treelist-table-filtercondition').remove();
		}
		$('#'+containerId+' .treelist-table-condition').append(html);
		nsForm.init(customFilterJson);
	}
	//当前界面自定义操作按钮  如针对行的操作 删除 修改 等
	function pageButtonInit(data){
		//针对界面去显示按钮  当前界面要显示的按钮 和从其他界面要调用显示的按钮
		/*
			* source   			是否来源于当前界面 current  common 
			* containerId		容器id
		*/
		//pageButtonJson
		var btnArray = pageButtonJson[data.source];
		if($.isArray(btnArray)){
			if(btnArray.length > 0){
				nsNav.init({
					id:data.containerId,
					isShowTitle:false,
					btns:[btnArray]
				});
			}
		}
	}
	//表格初始化组件
	function tablePlaneInit(_tableConfig){
		var tableConfig = $.extend(true,{},_tableConfig);
		var containerId = tableConfig.containerId;
		tableConfig.data.tableID = 'table-'+containerId;//表格
		tableConfig.ui.onDoubleSelectHandler = tableRowDoubleSelectHandler;
		var html = getTableHtml(tableConfig);
		$('#'+tableConfig.containerId).html(html);
		nsList.init(tableConfig.data,tableConfig.columns,tableConfig.ui);
		if(tableConfig.quickqueryJson){
			//表格快速查询组件
			tableConfig.quickqueryJson.id = 'quickquery-table-'+containerId;//快速检索
			tableQuickqueryInit(tableConfig.quickqueryJson);
		}
		if(tableConfig.customBtnJson){
			//自定义按钮
			tableConfig.customBtnJson.id = 'custombtn-table-'+containerId;//快速检索
			tableCustomBtnInit(tableConfig.customBtnJson);
		}
		if(tableConfig.customFilterJson){
			//自定义过滤条件
			tableConfig.customFilterJson.id = 'customcondition-table-'+containerId;//快速检索
			tableCustomFilterConditionInit(tableConfig.customFilterJson);
		}
	}
	function getClassAjax(data){
		/*
			*containerId	容器id
			*param			参数
		*/
		var containerId = data.containerId;
		var listAjax = $.extend(true,{},config.class.ajax);
		listAjax.data = typeof(listAjax.data)=='object' ? listAjax.data : {};
		listAjax.url = listAjax.src;
		listAjax.plusData = {
			dataSrc:config.class.ajax.dataSrc,
			containerId:containerId
		};
		if(typeof(data.param)=='object'){
			for(var param in data){
				listAjax.data[param] = data.param;
			}
		}
		delete listAjax.src;
		nsVals.ajax(listAjax,function(res,ajaxData){
			if(res.success){
				var data = res[ajaxData.plusData.dataSrc];
				if($.isArray(data)){
					var classStr = '';
					for(var i=0; i<data.length; i++){
						classStr += '\\'+data[i];
					}
					$('#'+ajaxData.plusData.containerId).html('<span>'+classStr+'</span>');
				}
			}
		},true)
	}//调用ajax读取分类
	function classPlaneInit(classJson){
		var classId = 'class-'+classJson.containerId;
		var html = '<div class="treelist-class-component">'
						+'<span class="class-title">'+classJson.title+'</span>'
						+'<span class="class-content" id="'+classId+'"></span>'
					+'</div>';
		$('#'+classJson.containerId).children('.treelist-table-component').before(html);
		getClassAjax({containerId:classId});
	}//分类组件
	function initContainer(){
		//输出界面布局
		/*
			*面板结构 左右
			*面板组成 tree组件 表格组件 支持展开树关闭树
			*tree  标题 检索  节点树  按钮 显示当前分类
			*table 快速查询  表格自定义 表格列表 按钮
			*pagebutton 当前界面可进行操作的按钮
		*/
		var titleHtml = '';
		if(config.title){
			//定义了标题输出
			titleHtml = '<div class="treelist-title">'+config.title+'</div>';
		}
		var html = '<div class="row layout-planes treelist" id="'+config.id+'">'
						+titleHtml
						+'<div class="main-container-col">'
							+'<div class="tree">'
								+'<div class="container treelist-tree-component" id="'+config.tree.containerId+'">'
								+'</div>'
					    	+'</div>'
						+'</div>'
						+'<div class="main-container-col treelist-expand-component">'
							+'<span><i></i>点击展开关闭树</span>'
						+'</div>'
						+'<div class="main-container-col treelist-table-component" id="'+config.table.containerId+'"></div>'
						+'<div class="treelist-pagebutton-component nav-form" id="'+config.pageBtnId+'"></div>'
					+'</div>';
		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		$container.prepend(html);//输出面板
		treePlaneInit(config.tree);//树的实例化
		tablePlaneInit(config.table);//表格实例化
		pageButtonInit({containerId:config.pageBtnId,source:'current'});//界面按钮
		if(!$.isEmptyObject(config.class)){
			//当前分类
			config.class.containerId = config.id;
			classPlaneInit(config.class);
		}
		$('#'+config.id+' .treelist-expand-component').on('click',function(ev){
			var $this = $(this);
			//$this.closest('.treelist').find('.treelist-tree-component').toggleClass('collapse');
		});//展开关闭
	}//初始化面板
	function createJson(){
		var packageJson = eval(config.package + '={}');
		var currentJson = {
			class:config.class,//当前分类信息
			searchtree:config.tree.searchTreeJson,//检索树
			tree:config.tree,//树列表配置
			table:config.table,//表格配置
			quickquery:config.table.quickqueryJson,//快速查询
		}
		for(var package in currentJson){
			packageJson[package] = currentJson[package];
		}
	}//定义组件
	function setDefault(){
		config.tree = typeof(config.tree)=='object' ? config.tree : {};
		config.tree.containerId = 'tree-plane-'+config.id;
		config.table.containerId = 'table-plane-'+config.id;
		config.pageBtnId = 'pagebtn-plane-'+config.id;
		var treeJson = {
			isSearch:true,
			clickCallback:treenodeClickHandler,
		};
		nsVals.setDefaultValues(config.tree,treeJson);
		//表格配置
		config.table = nsTemplate.setDefalutByTable(config.table);
		var tableJson = config.table;
		var tableColumnArray = tableJson.columns;
		var columnFieldArray = [];
		config.table.searchSelect = [];//列字段允许查询的列
		for(var columnI=0; columnI<tableColumnArray.length; columnI++){
			//判断当前列配置中searchable是否为true
			var columnData = tableColumnArray[columnI];
			if(typeof(columnData.searchable)=='boolean'){
				if(columnData.searchable == true){
					//为boolean值类型并且值为true
					//当前存在field属性的定义 如果没有无法按此关键词进行检索
					if(columnData.field){
						//此处暂时没有进行判断当前是否定义了formatHandler 如果定义了判断类型 有些formatHandler类型不能进行检索比如button
						var titleStr = columnData.title ? columnData.title : columnData.field;
						titleStr = '按'+titleStr+'查询';
						config.table.searchSelect.push({
							value:columnData.field,
							text:titleStr
						});
					}else{
						nsalert('当前列无法进行检索:'+columnData.field);
						console.warn(columnData);
					}
				}
			}
			if(typeof(columnData.isCommon)=='boolean'){
				if(columnData.isCommon){
					//公用配置列
					columnFieldArray.push(columnData);
				}
			}
		}
		config.table.commonColumnField = columnFieldArray;
		config.table.searchSelect.unshift({value:'quickquery',text:'快速查询',selected:true,});
		if(!$.isEmptyObject(config.table.columnSelect)){
			config.table.quickqueryJson = {
				form:[{
					id:"filterstr",
					type:'text-btn',
					value:config.table.columnSelect.defaultValue,
					btns:[{
						text:'搜索',
						handler:quickquerySearchHandler
					}]
				}]
			};
			if(typeof(config.table.columnSelect.isSelect)=='boolean'){
				if(config.table.columnSelect.isSelect){
					config.table.quickqueryJson.form.unshift({
						id:"filtermode",
						type:'select',
						subdata:config.table.searchSelect
					});
				}
			}
		}
		//主表中tableRowBtns的按钮处理
		var tableRowsBtnArray = $.extend(true,[],tableJson.tableRowBtns);//克隆 
		tableRowsBtnArray = nsTemplate.getBtnArrayByBtns(tableRowsBtnArray);//得到按钮值
		switch(tableJson.edit.type){
			case 'dialog':
				break;
			case 'confirm':
				tableRowsBtnArray.unshift({
					text:tableJson.edit.title,
					handler:function(){}
				});
				break;
		}
		if(tableRowsBtnArray.length > 0){
			//转换成表格行内的按钮形式['tianjia':function(){},'shanchu':functionI(){}]
			var rowBtnsArray = [];
			for(var rowBtnI=0; rowBtnI<tableRowsBtnArray.length; rowBtnI++){
				var btns = $.extend(true,{},tableRowsBtnArray[rowBtnI]);
				var btnJson = {};
				btnJson[btns.text] = btns.handler;
				rowBtnsArray.push(btnJson);
			}
			var btnWidth = tableRowsBtnArray.length * 30 + 10;
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
			for(var tColumnI=0; tColumnI<tableJson.columns.length; tColumnI++){
				if(tableJson.columns[tColumnI].field == 'nsTemplateButton'){
					tableJson.columns.splice(tColumnI,1);
				}
			}
			tableJson.columns.push(customerBtnJson);
		}
		if(config.tree.isSearch){
			//开启了树节点定位搜索
			config.tree.searchTreeJson = {
				form:[{
					id:"nodenames",
					type:"text-btn",
					placeholder:"输入类别名称进行定位",
					column:12,	
					btns:[{
						text:'定位',
						isShowText:true,
						isShowIcon:false,
						handler:searchTreePosition
					}]
				}]
			}
		}
		switch(config.table.customtype){
			//自定义表格检索
			case 'btn':
				config.table.customBtnJson = {
					isShowTitle:false,
					btns:[
							[{
								text:'刷新',
								isReturn:true,
								handler:customFilterRefreshBtnHandler
							}]
						]
				}
				break;
		}
		var tableFilterArray = [];
		switch(config.table.filterSource){
			case 'common':
				tableFilterArray = [{
					id:'isshowstop',
					label:'过滤',
					type:'select',
					subdata:[{
						value:'0',
						text:'仅显示正常',
						selected:true,
					},{
						value:'1',
						text:'仅显示停用'
					},{
						value:'2',
						text:'显示全部'
					}],
					commonChangeHandler:customFilterSelectQueryHandler
				}]
				break;
			case 'default':
				tableFilterArray = [{
					id:'isshowstop',
					label:'过滤',
					type:'select',
					subdata:[{
						value:'0',
						text:'仅显示正常商品',
						selected:true,
					},{
						value:'1',
						text:'仅显示停用商品'
					},{
						value:'2',
						text:'显示全部商品'
					}],
					commonChangeHandler:customFilterSelectQueryHandler
				}]
				break;
		}
		if(tableFilterArray.length > 0){
			config.table.customFilterJson = {
				form:tableFilterArray
			}
		}
		config.table.ui.pageChangeAfterHandler = isLengthChangeAfterHandler;//跳转页码之后的回调事件
		config.table.ui.pageLengthChangeHandler = pageLengthChangeHandler;//改变当前显示条数
		currentQueryParams.count = config.table.ui.pageLengthMenu[0];
	}//定义默认值
	function init(_config){
		config = _config;
		//第一次执行初始化模板
		if(typeof(nsTemplate.templates.treelist.data)=='undefined'){
			nsTemplate.templates.treelist.data = {};  
			/* 保存在该对象上的数据分为四个：
			 	* config(运行时参数)，
			 	* original（原始配置参数）
			*/
		}
		function configValidate(_config){
			var isValid = true;

			//整体参数验证
			var validArr =
				[
					['template', 'string', true], //模板
					['package', 'string', true], //包名
					['size', 'string'], //尺寸
					['title','string'],//标题
					['nav', 'object'], //头部
					['saveData', 'object'], //通用保存数据方法的配置
					['table', 'object', true], //表格对象
					['tree', 'object'], //目录树
					['class','object'],//分类配置
				]
			isValid = nsDebuger.validOptions(validArr, _config);
			if (isValid == false) {
				return false;
			}
		}//验证配置参数
		//验证配置参数 验证错误则不执行
		if (configValidate(_config) == false) {
			nsalert('配置文件验证失败', 'error');
			console.error('配置文件验证失败');
			console.error(_config);
			return false;
		}
		//记录config
		nsTemplate.templates.treelist.data[config.id] = {
			original:$.extend(true,{},config),
			config:config
		}
		setDefault();
		createJson();
		//输出面板
		initContainer();
	}
	function componentInit(config,_componentConfig){
		/*
			{
				config:config,
				componentConfig:{
					container: 	'#' + bodyId,                   // 容器 （id或class）通过组件拿到（组件配置）
					selectMode: 	componentConfig.selectMode,     // radio checkbox noSelect 单选 多选 不能选 通过组件拿到（组件配置）
					componentClass :	'list',                         // 组件类别 默认list
					doubleClickHandler:	function(value){                // 显示弹框 传入的双击方法 （关闭弹框和刷新value/inputText）
						console.log(value);
						vueComponent.setValue(value);
						_this.close('#'+containerId, vueComponent);
					},
				}
			}
		*/
		componentConfig = _componentConfig;
		switch(componentConfig.componentClass){
			case 'list':
				//列表
				var tableConfig = $.extend(true,{},config.table);
				//需要判断当前行选中模式 isSingleSelect   isMulitSelect
				switch(componentConfig.selectMode){
					case 'radio':
						tableConfig.ui.isSingleSelect = true;
						tableConfig.ui.isMulitSelect = false;
						break;
					case 'checkbox':
						tableConfig.ui.isSingleSelect = false;
						tableConfig.ui.isMulitSelect = true;
						break;
					case 'noSelect':
						tableConfig.ui.isSingleSelect = false;
						tableConfig.ui.isMulitSelect = false;
						break;
				}
				tableConfig.containerId = componentConfig.container;
				tablePlaneInit(tableConfig);
				break;
			default:
				nsalert('找不到对应组件');
				console.warn(data);
				break;
		}
		return {	
			selectHandler:function(){
				var tableId = 'table-'+componentConfig.container;
				var selectData = nsTable.getSingleRowSelectedData(tableId);
				return selectData;
			},
			addHandler:function(){
				console.log('add');
			},
			queryHandler:function(){
				console.log('query')
			}
		}
	}
	return {
		init:								init,							//模板初始化调用
		componentInit:						componentInit,					//调用某个组件初始化
	}
})(jQuery)
/******************** 表单表格模板 end ***********************/