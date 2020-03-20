/********************************************************************
 * 
 */
var questionUI = (function() {
	var config;

	//初始化
	function init(configObj){
		//设置默认值
		config=setDefault(configObj);
		//获取html 
		getHtml(config);
		//顶部导航
		var navJson =config.navJson;
		var nav={};

		reloadTableData();
		var formJson = {
			id:"form-textInput",
			size:"standard",
			format:"standard",
			form:[[
				{
					id: 		 		'textBtnInput',
					label: 		 		'搜索数据',
					type: 		 		'text-btn',
					placeholder:        '题目类型',
					column: 	 		12,
					btns: 		 		[
						{
							text:'搜索',
							handler:searchData
						}
					]
				}
			]]
		}
		formPlane.formInit(formJson);	
		controlPlane.formNavInit(navJson);
	}
	//加载表格数据
	function reloadTableData(){
		ajaxFun(setfields)
		//获取表格Ajax数据
		function setfields(data){
			if($.isArray(data[config.table.data.dataSrc])){
				config.allData = data[config.table.data.dataSrc];
				config.questiondata = data[config.table.data.dataSrc];
				config.count = Math.ceil(config.allData.length/config.pageLength);
				getTableByConfig(config);
				//表格 分页按钮
				setNavBtn();
			}
		}
	}
	//搜索
	function searchData(data){
		//console.log(data.value);
		var value = data.value;
		config.pageNum =1;
		if( value== ''){
			refreshTable();
		}else{
			var dataSourceArr =[];
			var newAllData = $.extend(true,[],config.questiondata);
			for(var di = 0;di<newAllData.length;di++){
				if(typeof(newAllData[di][config.search])!='undefined'){
					if(newAllData[di][config.search].indexOf(value) >=0){
						dataSourceArr.push(newAllData[di]);
					}
				}else{
					console.warn(config.search+'属性值不存在!')
				}
			}
			config.allData = dataSourceArr;
			config.count = Math.ceil(config.allData.length/config.pageLength);
			getPageDataFun(config);
			//getPageDataFun(0);
		}
	}
	//设置按钮
	function setNavBtn(){
		if((config.pageNum ==1 && config.pageNum == config.count) ||config.count == 0){
			config.isDisabledBefore = true;
			config.isDisabledAfter= true; 
			config.isDisabledBeforeRow = true;
			config.isDisabledAfterRow = true;
		}else if(config.pageNum == config.count){
			config.isDisabledBefore = false;
			config.isDisabledAfter= true;
		}else if(config.pageNum == 1){
			config.isDisabledBefore = true;
			config.isDisabledAfter= false;
		}else{
			config.isDisabledBefore = false;
			config.isDisabledAfter= false;
		}
		initBtn(config);
	}
	function initBtn(config){
		var nav= {
			id: "topnav",
			isShowTitle:false,
			btns:[[
					{
						text: 		'上一页',
						disabled:   config.isDisabledBefore,
						handler: 	function(){
							config.pageNum=config.pageNum -1;
							getPageDataFun(config);
							//getPageDataFun(-1);
						}
					},
					// {
					// 	text: 		'上一条',
					// 	disabled:   config.isDisabledBeforeRow,
					// 	handler: 	function(){
					// 		getSelectRowFun(-1);
					// 	},
					// },{
					// 	text: 		'下一条',
					// 	disabled:   config.isDisabledAfterRow,
					// 	handler: 	function(){
					// 		getSelectRowFun(1);
					// 	},
					// },
					{
						text: 		'下一页',
						disabled:   config.isDisabledAfter,
						handler: 	function(){
							config.pageNum=config.pageNum +1;
							getPageDataFun(config);
							//getPageDataFun(1);
						}
					}
				]],
		}
		nsNav.init(nav);
	}
	//当前页数据源
	function getDataSource(config){
		var dataSource = [];
		var dataI = config.pageLength * (config.pageNum-1);
		var pageLength = config.pageLength * config.pageNum;
		for(var i = dataI;i<pageLength;i++){
			if(typeof(config.allData[i]) != 'undefined'){
				dataSource.push(config.allData[i]);
			}
		}
		return dataSource;
	}
	//ajax
	function ajaxFun(callbackFun){
		var ajaxConfig = {
				url:config.table.data.src,
				type:config.table.data.type,
				data:config.table.data.data
			}
		nsVals.ajax(ajaxConfig,callbackFun);
	}
	//刷新表格
	function refreshTable(){
		function refreshconfig(data){
			config.allData = data[config.table.data.dataSrc];
			config.questiondata = data[config.table.data.dataSrc];
			config.count = Math.ceil(config.allData.length/config.pageLength);
			getPageDataFun(config);
			// config.table.data.dataSource = getDataSource(config);
			// baseDataTable.originalConfig[config.tableId].dataConfig.dataSource = config.table.data.dataSource;
			// baseDataTable.refreshByID(config.tableId);
			// var html=getExamDetailHtml(config);
			// $('#examdetail').html(html);
			// $('#pageinfo').html('<span>第'+config.pageNum+'页(共'+config.count+'页)</span>');
			// setNavBtn();
		}
		ajaxFun(refreshconfig)
	}
	//获取当前页数据
	function getPageDataFun(config){
		config.table.data.dataSource = getDataSource(config);
		baseDataTable.originalConfig[config.tableId].dataConfig.dataSource = config.table.data.dataSource;
		baseDataTable.refreshByID(config.tableId);
		var html=getExamDetailHtml(config);
		$('#examdetail').html(html);
		$('#pageinfo').html('<span>第'+config.pageNum+'页(共'+config.count+'页)</span>');
		setNavBtn();
	}
	//表格配置
	function getTableByConfig(configObj){
		var $examdetail=$('#examdetail');
		config.table.data.dataSource = getDataSource(configObj);
		var dataConfig = {
			tableID: configObj.tableId,
			dataSource : configObj.table.data.dataSource,
			isPage : false,      //是否开启分页
			info : false,
			isSearch:false
		}
		var columnConfig = configObj.table.columns;
		var uiConfig = {
			pageLengthMenu: 	10, 	//可选页面数  auto是自动计算  all是全部
			isSingleSelect: true,		//是否单选
			onSingleSelectHandler:function(data){
				var rowData = baseDataTable.getSingleRowSelectedData(configObj.tableId);
				//当前选中行索引
				config.rowNum=getSelectRowIndex(rowData);
				//getSelectRowFun(1);
				var $tableID = $('#table-'+rowData.id);
				if($('.problems-list-table').hasClass('problems-list-pitch')){
					$('.problems-list-table').removeClass('problems-list-pitch');
				}
				$tableID.addClass('problems-list-pitch');
				$examdetail.scrollTop($examdetail.scrollTop() + $tableID.offset().top - $examdetail.offset().top);
			}		 			
		}
		var btnConfig = configObj.table.btns;
		$('#'+configObj.tableId).html();
		baseDataTable.init(dataConfig, columnConfig, uiConfig,btnConfig);
		var html=getExamDetailHtml(configObj);
		$examdetail.html(html);
		$('#pageinfo').html('<span>第'+config.pageNum+'页(共'+config.count+'页)</span>');
	}
	//试题详情
	function getExamDetailHtml(config){
		var dataArr=config.table.data.dataSource;
		var newArr=[];
		var tableHtml ='';
		//console.log(config.table.columns);
		var columnArr = $.extend(true,[],config.table.columns);
		columnArr.sort(function(a,b){
			if(typeof(a.index) != 'undefined' && typeof(b.index) != 'undefined'){
				return a.index - b.index;
			}
		})
		//console.log(columnArr);
		for(var ci =0;ci<columnArr.length;ci++){
			if(typeof(columnArr[ci].index)!='undefined'){
				newArr.push(columnArr[ci]);
			}
		}
		//console.log(newArr);
		if($.isArray(dataArr)){
			if(newArr.length>0){
				for(var di = 0;di<dataArr.length;di++){
					var isUsed = dataArr[di][newArr[2].field] == 0 ?'否':'是';
					tableHtml+=	'<table class="problems-list-table" id="table-'+dataArr[di].id+'" name="table-'+dataArr[di].id+'">'
							+		'<tr class="problems-list-title"><td><span>'+newArr[0].title+'</span><span>:</span>'+dataArr[di][newArr[0].field]+'</td><td><span>'+newArr[1].title+'</span><span>:</span>'+dataArr[di][newArr[1].field]+'</td><td><span>'+newArr[2].title+'</span><span>:</span>'+isUsed+'</td></tr>'
							+		'<tr class="problems-list-problem"><td colspan="3"><span>'+newArr[3].title+':</span>'+dataArr[di][newArr[3].field]+'</td></tr>'
							+		'<tr class="problems-list-answer"><td colspan="3"><span>'+newArr[4].title+':</span>'+dataArr[di][newArr[4].field]+'</td></tr>'
							+	'</table>';
					}
			}
		}
		return tableHtml;
	}
	//获取选中行索引
	function getSelectRowIndex(rowData){
		//var rowData = baseDataTable.getSingleRowSelectedData(config.tableId);
		var dataSource = config.table.data.dataSource;
		var index = 0;
		for(var di = 0 ;di<dataSource.length;di++){
			if(rowData.id == dataSource[di].id){
				index=di;
				break;
			}
		}
		return index;
	}
	//选中行
	function getSelectRowFun(num){
		if(config.rowNum +num <0){
			if(config.pageNum > 1){
				config.pageNum=config.pageNum -1;
				getPageDataFun(config);
				//getPageDataFun(-1);
			}
		}
		config.rowNum = config.rowNum + num;
		var dataSource = config.table.data.dataSource;
		//当前选中行
		var rowData = baseDataTable.getSingleRowSelectedData(config.tableId);
		//console.log(rowData);
		//取消行选中
		baseDataTable.selectClear(config.tableId);
		var selectData = dataSource[config.rowNum];
		//设置行选中
		baseDataTable.setSelectRows(config.tableId,selectData.id.toString());
		initBtn(config)
	}
	
	//设置默认值
	function setDefault(config){
		//表格Id
		config.tableId = 'examtable';
		//当前页数
		config.pageNum = 1;
		//当前行
		config.rowNum = 1;
		//每页条数
		config.pageLength = 10;
		config.count = 0;
		config.search =  typeof(config.search) =='string'?config.search:'';
		config.navJson = {};
		//上页按钮禁用
		config.isDisabledBefore = true;
		//下页按钮禁用 
		config.isDisabledAfter= false;
		//上行按钮禁用 
		config.isDisabledBeforeRow = false;
		//下行按钮禁用
		config.isDisabledAfterRow = false;
		config.title = typeof(config.title) =='string'?config.title:'';
		return config;
	}
	//生成Container html
	function createContainer(html){
		//找到容器，将html添加到前面
		var $container = $('container').not('.content');
		if($('.nswindow .content').length > 0){
			$container = $('.nswindow .content:last');
		}
		$container.prepend(html);
	}
	//获取html
	function getHtml(configObj){
		var html='<div class="page-title nav-form">'
					//<!--按钮组-->
				+'</div>'
				+'<div class="row form-content">'
				+	'<div class="col-sm-4" id="form-textInput">'
				+	'</div>'
				+'</div>'
				+'<div class="row form-content">'
				+	'<div class="col-sm-4 main-panel">'	
				+		'<div class="panel panel-default">'
				+			'<div class="panel-body">'
				+				'<div class="table-responsive">'
				+					'<table cellspacing="0" class="table table-singlerow table-hover table-bordered table-striped" id="'+configObj.tableId+'">'
				+					'</table>'
				+					'<div id="pageinfo">'
				//+               		'<span>第'+config.pageNum+'页(共'+config.count+'页)</span>'
				+					'</div>'
				+				'</div>'
				+			'</div>'
				+		'</div>'
				+		'<div class="nav-form" id="topnav">'
				//+			<!--按钮组-->
				+		'</div>'
				+	'</div>'
				+	'<div class="col-sm-8 problems-list" id="examdetail">'
				+	'</div>'
				+'</div>'
		html=createContainer(html);
		return html;	
	}
	function getConfig(){
		console.log(config);
	}
	return {
		init:init, 				//初始化方法
		refreshTable:refreshTable,
		getConfig:getConfig
	}
})(jQuery);