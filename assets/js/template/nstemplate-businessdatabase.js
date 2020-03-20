/****
***表单表格模板包含form，table,button(导航上显示的按钮)
****
********/
/******************** 表单表格模板 start ***********************/
nsTemplate.templates.businessDataBase = (function(){
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
	var optionsConfig = {
		dialogBeforeHandler:dialogBeforeHandler,
		ajaxBeforeHandler:ajaxBeforeHandler,
		ajaxAfterHandler:ajaxAfterHandler,
		loadPageHandler:loadPageHandler,
		closePageHandler:closePageHandler
	};
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
	function dialogBeforeHandler($btn){
		var data = $btn;
		var isOuterBtn = false;//是否外部按钮
		var tableId = 'table-'+config.table.containerId;
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
			selectTableArray.push(data.value);
			allParamData.mainVo = $btn.rowData;
		}else{
			var selectedData = baseDataTable.getTableSelectData(tableId,false);//获取行选中数据
			if(selectedData){
				data.value = selectedData;
				allParamData.mainVo = selectedData;
				selectTableArray = selectedData;
			}else{
				data.value = false;
			}
		}
		data.options = {idField:config.table.idField};
		data.btnOptionsConfig = {
			currentTable:'main',//当前操作是主表还是附表
			isOuterBtn:isOuterBtn,//是否是外部按钮
			descritute:{keyField:config.table.keyField,idField:config.table.idField}
		}
		return data;
	}
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
	function ajaxAfterHandler(res){
		var newData = $.extend(true,{},res);
		delete newData.objectState;
		var treeId = 'tree-'+config.tree.containerId;
		var tableId = 'table-'+config.table.containerId;
		if(config.isTree){
			var treeObj = nsDataFormat.tree[treeId];
			var nodes = treeObj.getSelectedNodes();
			var treeNodeData = treeObj.getNodeByParam(config.tree.idField,res[config.tree.idField]);
			treeNodeData = $.extend(true,treeNodeData,newData);
			switch(res.objectState){
				case NSSAVEDATAFLAG.ADD:
					//添加节点
					treeObj.addNodes(nodes[0],newData);
					break;
				case NSSAVEDATAFLAG.EDIT:
					//编辑节点
					treeObj.updateNode(treeNodeData);
					break;
				case NSSAVEDATAFLAG.DELETE:
					//删除节点
					treeObj.removeNode(treeNodeData);
					break;
				case NSSAVEDATAFLAG.NULL:
					//无操作
				 	break;
				 case NSSAVEDATAFLAG.VIEW:
				 	//刷新
				 	break;
			}
		}
		if(config.table){
			//表格数据
			switch(res.objectState){
				case NSSAVEDATAFLAG.DELETE:
					//删除
					nsList.delById(tableId, res);
					break;
				case NSSAVEDATAFLAG.EDIT:
					//修改
					nsList.rowEdit(tableId, res, {isUseNotInputData:true});
					break;
				case NSSAVEDATAFLAG.ADD:
					//修改
					nsList.rowEdit(tableId, res, {isUseNotInputData:true});
					break;
				case NSSAVEDATAFLAG.VIEW:
					//刷新
					nsTable.reloadTableAJAX(tableId,currentQueryParams);
					break;
			}
			if($.isArray(res)){
				nsTable.reloadTableAJAX(tableId,currentQueryParams);
			}
		}	
	}
	function loadPageHandler(data){
		return data;
	}
	function closePageHandler($btn){
		var data = $btn;
		
	}
	function refreshTableData(tableId){
		nsTable.reloadTableAJAX(tableId,currentQueryParams);
	}//刷新表格数据

	function treeEditBtnHandler(data){
		var navId = data.closest('.businessdatabase-tree-btn').attr('id');
		var prefix = 'btn-';
		var treeId = navId.substring(prefix.length,navId.length);
		treeId = treeId+'-tree';
		var treeObj = nsDataFormat.tree[treeId];
		var nodes = treeObj.getSelectedNodes();	
		if(nodes.length > 0){
			var editDialog = {
				id: 'edit-tree-dialog',
				title: '编辑分类',
				size: 's',
				form: [{
					id:config.tree.idField,
					type:'hidden',
					value:nodes[0][config.tree.idField]
				},{
					id:config.tree.textField,
					label:'节点名称',
					type:'text',
					value:nodes[0][config.tree.textField]
				}],
				btns: 
				[
					{
						text: '确定',
						handler: function(){
							console.log('333')
						}
					}
				]
			}
			nsdialog.initShow(editDialog);//弹框调用
		}else{
			nsalert(language.ui.nsTree.dialog.emptyObject);
		}
	}//树编辑事件
	function searchTreePosition(event){
		var $this = $(this);
		//先判断检索的值是否存在，按全称进行的节点查找
		var formId = $this.attr('ns-id');
		var prefix = 'search-';
		var treeId = formId.substring(prefix.length,formId.length);
		treeId = treeId+'-tree';
		var treeObj = nsDataFormat.tree[treeId];
		var value = $('#input-'+formId).val();
		var treeNode = treeObj.getNodeByParam("name",value);
		if(!$.isEmptyObject(treeNode)){
			//存在节点的情况下，通过选中当前节点来定位到所有位置
			//两个事件 1.选中节点 2.根据当前节点id作为参数刷新表格和分类数据
			var prefixStr = 'search-tree-tree-';
			var templateId = formId.substring(prefixStr.length,formId.length);
			var tableId = 'table-table-'+templateId;
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
		var formId = data.config.formID;
		//var formId = data.dom.closest('.businessdatabase-table-quickquery').attr('id');
		var formJson = NetstarComponent.getValues(formId);
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
		//var formId = data.dom.closest('.businessdatabase-table-filtercondition').attr('id');
		var formId = data.config.formID;
		var prefixStr = 'customcondition-';
		var tableId = formId.substring(prefixStr.length,formId.length);
		refreshTableData(tableId);
	} //自定义过滤下拉选查询

	function searchSelectChangeHandler(data){
		console.log(data)
	}

	function customFilterRefreshBtnHandler(event){
		//NetstarComponent.editComponents
		var $this = $(this);
		var containerId = $this.attr('containerid');
		var prefix = 'quickquery-';
		var tableId = containerId.substring(prefix.length,containerId.length);
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
		var prefix = 'pagebtn-simple-';
		var templateId = navId.substring(prefix.length,navId.length);
		var tableId = 'table-table-plane-'+templateId;
		var selectData = nsTable.getSingleRowSelectedData(tableId);
		console.log(selectData);
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
		isReturn:true,
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
	//内容面板
	function getContentHtml(contentHtml){
		return '<div class="pt-panel">'
					+'<div class="pt-container">'
						+'<div class="pt-panel-row">'
							+'<div class="pt-panel-col">'
								+contentHtml
							+'</div>'
						+'</div>'
						+'</div>'
				+'</div>';
	}
	//输出树容器
	function getTreeHtml(treeConfig){
		var titleHtml = '';
		if(treeConfig.title){
			var html = '<div class="pt-title">'
							+'<h6>'+treeConfig.title+'</h6>'
						+'</div>';
			titleHtml = getContentHtml(html);
		}
		var searchHtml = '';
		if(config.tree.isSearch){
			var positionHtml = '<div class="pt-form pt-form-inline pt-form-normal" id="'+treeConfig.searchTreeJson.id+'"></div>';
			searchHtml = getContentHtml(positionHtml);
		}
		var ztreeHtml = '<div class="pt-tree">'
							+'<div class="pt-container">'
								+'<div class="businessdatabase-tree-ztree layout-ztree autoHeight" id="'+treeConfig.id+'"></div>'
							+'</div>'
						+'</div>';
		var btnHtml = '<div class="businessdatabase-tree-btn nav-form" id="'+treeConfig.btnId+'"></div>';
		return titleHtml+searchHtml+getContentHtml(ztreeHtml)+getContentHtml(btnHtml);
	}
	//输出table
	function getTableHtml(tableConfig){
		var contidionHtml = '';
		//quickqueryJson   customBtnJson	 customFilterJson
		var quickqueryHtml = '';
		if(tableConfig.quickqueryJson){
			quickqueryHtml = '<div class="pt-panel-col" id="'+tableConfig.quickqueryId+'">'
								//+'<div class="businessdatabase-table-quickquery"></div>'
							+'</div>';
		}
		var customfilterHtml = '';
		if(tableConfig.customFilterJson){
			customfilterHtml = '<div class="pt-panel-col text-right" id="'+tableConfig.customFilterId+'">'
									//+'<div class="businessdatabase-table-filtercondition"></div>'
								+'</div>';
		}
		if(quickqueryHtml || customfilterHtml){
			contidionHtml = '<div class="pt-container">'
								+'<div class="pt-panel-row">'
									+quickqueryHtml+customfilterHtml
								+'</div>'
							+'</div>';
		}
		var headHtml = '<div class="pt-panel pt-grid-header">'		
							+contidionHtml
						+'</div>';
		var bodyHtml = '<div class="table-responsive">'
								+'<table cellspacing="0" class="table table-hover table-striped table-bordered dataTable" '
								+'id="'+tableConfig.data.tableID+'">'
								+'</table>'
						+'</div>';
		var tableHtml  = getContentHtml(bodyHtml);
		tableHtml = '<div class="pt-panel pt-grid-body">'+tableHtml+'</div>';
		return headHtml + tableHtml;
		/*return '<div class="businessdatabase-table-condition">'
				+'</div>'
				+'<div class="table-responsive">'
						+'<table cellspacing="0" class="table table-hover table-striped table-bordered dataTable" '
						+'id="'+tableConfig.data.tableID+'">'
						+'</table>'
				+'</div>';*/
	}
	//输出树节点搜索组件
	function treePlaneSearchInit(searchTreeJson){
		var searchHtml = '<div class="pt-form-body">'
							+'<div class="pt-form-group">'
								+'<div class="pt-input-group">'
									+'<input type="text" id="input-'+searchTreeJson.id+'" class="pt-form-control" placeholder="请输入类别名称进行定位">'
								+'</div>'
								+'<div class="pt-btn-group">'
									+'<button class="pt-btn pt-btn-default" type="button" ns-id="'+searchTreeJson.id+'">'
										+'<span>定位</span>'
									+'</button>'
								+'</div>'
							+'</div>'
						+'</div>';
		var $container = $('#'+searchTreeJson.id);
		$container.html(searchHtml);
		var $button = $container.find('button[type="button"]');
		$button.off('click',searchTreePosition);
		$button.on('click',searchTreePosition);
	}
	//树初始化组件
	function treePlaneInit(_treeConfig){
		var treeConfig = $.extend(true,{},_treeConfig);
		if(config.isTree){	
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
		quickqueryJson.plusClass = 'pt-form-normal';
		quickqueryJson.completeHandler = function(obj){
			var buttonHtml = '<div class="pt-btn-group">'
							+'<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" containerid="'+quickqueryJson.id+'"><i class="icon-search"></i></button>'
						+'</div>';
			var $container = $('#'+quickqueryJson.id);
			$container.append(buttonHtml);
			$('button[containerid="'+quickqueryJson.id+'"]').off('click',customFilterRefreshBtnHandler);
			$('button[containerid="'+quickqueryJson.id+'"]').on('click',customFilterRefreshBtnHandler);
		}
		var component2 = NetstarComponent.formComponent.getFormConfig(quickqueryJson);
		NetstarComponent.formComponent.init(component2,quickqueryJson);
		//nsForm.init(quickqueryJson);
	}
	//表格自定义按钮组件
	function tableCustomBtnInit(customBtnJson){
		var html = '<div class="businessdatabase-table-custombtn nav-form" id="'+customBtnJson.id+'"></div>';
		var prefixStr = 'custombtn-table-';
		var containerId = customBtnJson.id.substring(prefixStr.length,customBtnJson.id.length);
		if($('#'+containerId+' .businessdatabase-table-custombtn').length > 0){
			$('#'+containerId+' .businessdatabase-table-custombtn').remove();
		}
		$('#'+containerId+' .businessdatabase-table-condition').append(html);
		nsNav.init(customBtnJson);
	}
	//表格自定义过滤条件组件
	function tableCustomFilterConditionInit(customFilterJson){
		customFilterJson.plusClass = 'pt-form-normal';
		var component2 = NetstarComponent.formComponent.getFormConfig(customFilterJson);
		NetstarComponent.formComponent.init(component2,customFilterJson.id);
		//nsForm.init(customFilterJson);
	}
	//当前界面自定义操作按钮  如针对行的操作 删除 修改 等
	function buttonInit(navJson){
		nsNav.init(navJson);
	}
	function pageButtonInit(){
		//针对界面去显示按钮  当前界面要显示的按钮 和从其他界面要调用显示的按钮
		/*
			* source   			是否来源于当前界面 current  common 
			* containerId		容器id
		*/
		//pageButtonJson
		//config.pageBtnId = 'pagebtn-plane-'+config.id;
		var leftBtnId = 'pagebtn-simple-'+config.id;
		var rightBtnId = 'pagebtn-'+config.id;
		var html = '<div class="pt-panel">'
						+'<div class="pt-container">'
							+'<div class="pt-panel-row">'
								+'<div class="pt-panel-col">'
									+'<div class="nav-form" id="'+leftBtnId+'">'
									+'</div>'
								+'</div>'
								+'<div class="pt-panel-col text-right">'
									+'<div class="nav-form" id="'+rightBtnId+'">'
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>'
					+'</div>';
		$('.businessdatabase-table-component').append(html);
		var btnArray = pageButtonJson['current'];
		if($.isArray(config.table.btns)){
			var tableBtnsArray = $.extend(true,[],config.table.btns);//克隆 
			btnArray = nsTemplate.getBtnArrayByBtns(tableBtnsArray);//得到按钮值
		}
		var navJson = {
			id:leftBtnId,
			isShowTitle:false,
			btns:[btnArray]
		};
		/*var rightArray = [{
			text:'打印',
			btnCls:'btn btn-default',
			handler:function(){}
		},{
			text:'退出',
			btnCls:'btn btn-danger',
			handler:function(){}
		}];
		var rightNavJson = {
			id:rightBtnId,
			isShowTitle:false,
			btns:[rightArray]
		};*/
		buttonInit(navJson);
		//buttonInit(rightNavJson);
	}
	//表格初始化组件
	function tablePlaneInit(_tableConfig){
		var tableConfig = $.extend(true,{},_tableConfig);
		var containerId = tableConfig.containerId;
		tableConfig.data.tableID = 'table-'+containerId;//表格
		tableConfig.ui.onDoubleSelectHandler = tableRowDoubleSelectHandler;
		tableConfig.quickqueryId = 'quickquery-table-'+containerId;//快速检索
		tableConfig.customFilterId = 'customcondition-table-'+containerId;//快速检索
		tableConfig.customBtnId = 'custombtn-table-'+containerId;//快速检索
		var html = getTableHtml(tableConfig);
		$('#'+tableConfig.containerId).html(html);
		nsList.init(tableConfig.data,tableConfig.field,tableConfig.ui);
		if(tableConfig.quickqueryJson){
			//表格快速查询组件
			tableConfig.quickqueryJson.id = tableConfig.quickqueryId;
			tableQuickqueryInit(tableConfig.quickqueryJson);
		}
		if(tableConfig.customBtnJson){
			//自定义按钮
			//tableCustomBtnInit(tableConfig.customBtnJson);
		}
		if(tableConfig.customFilterJson){
			//自定义过滤条件
			tableConfig.customFilterJson.id = tableConfig.customFilterId;
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
					$('#'+ajaxData.plusData.containerId).html(classStr);
				}
			}
		},true)
	}//调用ajax读取分类
	function classPlaneInit(classJson){
		var classId = 'class-'+classJson.containerId;
		var classHtml = '<div class="pt-title text-danger">'
							+'<span>'+classJson.title+'</span>'
							+'<span class="class-content" id="'+classId+'"></span>'
						+'</div>';
		var html = 	getContentHtml(classHtml);		
		$('#'+classJson.containerId).find('.businessdatabase-table-component').prepend(html);
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
			titleHtml = '<div class="pt-title pt-page-title"><h4>'+config.title+'</h4></div>';
			titleHtml = getContentHtml(titleHtml);
			titleHtml = '<div class="pt-main-row"><div class="pt-main-col">'+titleHtml+'</div></div>'
		}
		var treeHtml = '';
		if(config.isTree){
			treeHtml = '<div class="pt-main-col" id="'+config.tree.containerId+'"></div>';
		}
		var html = '<div class="pt-main businessdatabase" id="'+config.id+'">'
						+'<div class="pt-container">'
							+titleHtml
							+'<div class="pt-main-row">'
								+treeHtml
								/*+'<div class="main-col businessdatabase-expand-component">'
									+'<span><i></i>点击展开关闭树</span>'
								+'</div>'*/
								+'<div class="pt-main-col businessdatabase-table-component" id="'+config.table.containerId+'"></div>'
								//+'<div class="businessdatabase-pagebutton-component nav-form" id="'+config.pageBtnId+'"></div>'
							+'</div></div>'
					+'</div>';
		var $container = $('container');
		if($container.length > 0){
			$container = $('container:last');
		}
		$container.prepend(html);//输出面板
		treePlaneInit(config.tree);//树的实例化
		tablePlaneInit(config.table);//表格实例化
		pageButtonInit();//界面按钮
		if(config.isTree){
			if(!$.isEmptyObject(config.class)){
				//当前分类
				config.class.containerId = config.id;
				classPlaneInit(config.class);
			}
		}
		$('#'+config.id+' .businessdatabase-expand-component').on('click',function(ev){
			var $this = $(this);
			//$this.closest('.businessdatabase').find('.businessdatabase-tree-component').toggleClass('collapse');
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
		config.isTree = true;
		if($.isEmptyObject(config.tree)){config.isTree = false;}
		config.tree.containerId = 'tree-plane-'+config.id;
		config.table.containerId = 'table-plane-'+config.id;
		var treeJson = {
			isSearch:true,
			clickCallback:treenodeClickHandler,
		};
		nsVals.setDefaultValues(config.tree,treeJson);
		//表格配置
		config.table = nsTemplate.setDefalutByTable(config.table,optionsConfig,config);
		nsTemplate.setTableConfig(config.table);
		config.table.data.isSearch = false;
		config.table.data.contentType = 'application/json; charset=utf-8';
		nsVals.extendJSON(config.table.data,config.table.ajax);
		delete config.table.data.dataSource;
		var tableJson = config.table;
		var tableColumnArray = tableJson.field;
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
							text:titleStr,
							searchType:columnData.searchType
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
		config.table.searchSelect.unshift({value:'quickquery',text:'快速查询',isChecked:true,});
		config.table.ui = typeof(config.table.ui)=='object' ? config.table.ui : {};
		if(!$.isEmptyObject(config.table.columnSelect)){
			config.table.quickqueryJson = {
				form:[{
					id:"filterstr",
					type:'text',
					value:config.table.columnSelect.defaultValue,
					/*btns:[{
						text:'搜索',
						handler:quickquerySearchHandler
					}]*/
				}]
			};
			if(typeof(config.table.columnSelect.isSelect)=='boolean'){
				if(config.table.columnSelect.isSelect){
					config.table.quickqueryJson.form.unshift({
						id:"filtermode",
						type:'select',
						subdata:config.table.searchSelect,
						commonChangeHandler:searchSelectChangeHandler
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
			for(var tColumnI=0; tColumnI<tableJson.field.length; tColumnI++){
				if(tableJson.field[tColumnI].field == 'nsTemplateButton'){
					tableJson.field.splice(tColumnI,1);
				}
			}
			tableJson.field.push(customerBtnJson);
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
						isChecked:true,
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
						isChecked:true,
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
		if(typeof(config.table.ui.pageLengthMenu)=='undefined'){
			config.table.ui.pageLengthMenu = [5,10,15,20];
		}
		currentQueryParams.count = config.table.ui.pageLengthMenu[0];
	}//定义默认值
	function init(_config){
		config = _config;
		//第一次执行初始化模板
		if(typeof(nsTemplate.templates.businessDataBase.data)=='undefined'){
			nsTemplate.templates.businessDataBase.data = {};  
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
		nsTemplate.templates.businessDataBase.data[config.id] = {
			original:$.extend(true,{},config),
			config:config
		}
		setDefault();
		createJson();
		//输出面板
		initContainer();
	}
	function componentInit(_config,_componentConfig){
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
		config = $.extend(true,{},_config);
		setDefault();
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
				delete tableConfig.customFilterJson;
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
		dialogBeforeHandler:				dialogBeforeHandler,			//弹框调用前置方法
		ajaxBeforeHandler:					ajaxBeforeHandler,				//弹框ajax保存前置方法
		ajaxAfterHandler:					ajaxAfterHandler,				//弹框ajax保存后置方法
		loadPageHandler:					loadPageHandler,				//弹框初始化加载方法
		closePageHandler:					closePageHandler,				//弹框关闭方法
	}
})(jQuery)
/******************** 表单表格模板 end ***********************/