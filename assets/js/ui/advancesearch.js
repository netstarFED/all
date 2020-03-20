/*******配件选择器 UI start**************/
/*****
*组成分四部分       
*1.检索部分 是一个form表单
*2.检索来源数据 是一个datatable的表格
*3.查询结果，是一个显示结果的容器
*4.完成操作， 是确认or清空搜索项
******/
nsUI.advance = (function($){
	var config;											//配置参数
	var $configID;										//配置id
	var $closeBtn;										//关闭面板
	var $tages;											//显示选择的标签
	function init(configObj){
		//如果id未定义返回false
		if(typeof(configObj.id)=='undefined'){
			return;
		}
		config = configObj;
		// 错误提示信息 默认
		config.errorMsg = typeof(config.errorMsg)=='string'?config.errorMsg:language.ui.advancesearch.infoMsgA;

		config.dataArr = [];							//确认返回的数据
		config.valueFieldArr = [];						//显示tages的字段
		config.primaryKey = '';							//主键的id
		config.selectMode = '';							//选中模式，multi表明是多选模式 single表明是单选模式

		config.formJson = {};							//初始化表单的参数为空
		config.tableJson = {};							//初始化表格的参数为空
		config.btnsJson = {};							//初始化按钮的参数为空	

		var titleID= config.id + '-title';				//title标题的id
		var formID= config.id + '-form';				//form表单的id
		var btnsID = config.id + '-btn';				//btn按钮的id
		var tableID = config.id + '-table';				//table表格的id
		var tagesID = config.id + '-tages';				//tages显示的id

		config.titleID = titleID;						//config配置的标题id
		config.formID = formID;							//config配置的表单id
		config.btnsID = btnsID;							//config配置的按钮id
		config.tableID = tableID;						//config配置的表格id
		config.tagesID = tagesID;						//config配置的显示值id

		fillShowField();								//调用给字段赋值

		var formHtml = getFormContainer(formID);		//form表单的容器
		var btnsHtml = getBtnsContainer(btnsID);		//btn按钮的容器
		var tableHtml = getTableContainer(tableID);		//table表格的容器
		var tagesHtml = getTagesContainer(tagesID);		//指定tag显示数据
		if(typeof(config.form) == 'object'){
			config.formJson.id = formID;
			config.formJson.form = configObj.form;
		}

		//默认按钮组包含查询，清空，确认和取消四个按钮
		var defaultBtnArr = [
			{
				text:		language.ui.advancesearch.btn.query,
				handler:	queryHandler
			},{
				text:		language.ui.advancesearch.btn.confirm,
				handler:	confirmHandler
			},{
				text:		language.ui.advancesearch.btn.cancel,
				handler:	cancelHandler
			},{
				text:		language.ui.advancesearch.btn.empty,
				handler:	clearHandler
			}
		];
		if(typeof(config.btns) == 'undefined'){
			config.btns = [];
		}
		if(typeof(config.btns) == 'object'){
			config.btns.push(defaultBtnArr);
			config.btnsJson.id = btnsID;
			config.btnsJson.isShowTitle = false;
			config.btnsJson.btns = config.btns;
		}
		if(typeof(config.table) == 'object'){
			if(!$.isEmptyObject(config.table.dataConfig)){
				configObj.table.dataConfig.tableID = tableID;							//表id
				configObj.table.dataConfig.isSearch = false;							//默认关闭搜索
				configObj.table.dataConfig.primaryKey = config.primaryKey;				//主键id
				//sjj20181025 是否存在data的定义
				if(configObj.table.dataConfig.data){
					config.originalData = $.extend(true,{},configObj.table.dataConfig.data);
				}
			}
			if(config.table.uiConfig.isSingleSelect == true){
				config.selectMode = 'single';
			}
			if(config.table.uiConfig.isMulitSelect == true){
				config.selectMode = 'multi';
			}
			config.table.uiConfig.isSetHeight = true;									//是否设置表格高根据每页显示条数设置
			config.table.uiConfig.onSingleSelectHandler = selectedHandler;				//定义单击选中事件
			config.table.uiConfig.onUnsingleSelectHandler = unSelectedHandler;			//定义取消单击选中事件
			config.table.uiConfig.onUndoubleSelectHandler = unDoubleSelectedHandler;	//定义取消双击选中事件

			config.onDoubleSelectHandler = config.table.uiConfig.onDoubleSelectHandler;	//给config配置定义双击确认事件
			config.table.uiConfig.onDoubleSelectHandler = doubleSelectedHandler;		//给table双击行配置事件
			config.tableJson = configObj.table;
		}
		config.isDefaultSearch  = typeof(config.isDefaultSearch)=='boolean' ? config.isDefaultSearch : true;
		var html = '';
		if(config.isDefaultSearch){
			html='<div class="advance-search-box"><input class="form-control" type="text" id="multipleQuery" name="multipleQuery" placeholder="名称/编码"></div>';
		}
		var advanceHtml = btnsHtml+html+formHtml+tableHtml+tagesHtml;
		if(typeof(config.container) == 'object'){
			//如果容器存在
			config.container.html(advanceHtml);
		}else{
			//容器不存在
			//追加容器
			var titleHtml = getTitleContainer(titleID);		//title标题的容器
			var widthStr = '';
			var marginStr = '';
			switch(config.size){
				case 's':
					widthStr = 'width:400px;';
					marginStr = 'margin-left:-200px;';
					break;
				case 'm':
					widthStr = 'width:600px;';
					marginStr = 'margin-left:-300px;';
					break;
				case 'b':
					widthStr = 'width:800px;';
					marginStr = 'margin-left:-400px;';
					break;
				default:
					if(config.size){
						widthStr = 'width:'+config.size+';';
						var widthNum = widthStr.replace('%','');
						marginStr = 'margin-left:-'+widthNum/2+';';
					}
					break;
			}
			var styleStr = 'style="'+widthStr+''+marginStr+'"';
			var containerHtml = '<div class="advance-search-plane" id="'+config.id+'" '+styleStr+'>'
									+titleHtml+advanceHtml
								+'</div>';
			if($('.advance-search-plane').length == 1){
				$('.advance-search-plane').remove();
			}
			$('body').append(containerHtml);
		}
		$configID = $('#'+config.id);
		$closeBtn = $('#'+config.titleID+' .advance-close-btn');
		$closeBtn.off('click');
		$closeBtn.on('click',closeAdvanceHandler);
		$tages = $('#'+config.tagesID);
		var $navBtn = $('#'+config.btnsID);
		var $title = $('#'+config.titleID);
		var $form = $('#'+config.formID);

		var pageLengthMenu = config.table.uiConfig.pageLengthMenu;	
		var paddingHeight = 48;
		if(config.table.uiConfig.scrollX == true){
			paddingHeight = 66;
		}
		var tableHeight = pageLengthMenu * 40 + 40 + paddingHeight;
		/*$('#'+config.id+' .advance-table').css({'height':tableHeight});
		$('#'+config.id+' .advance-tages').css({'height':tableHeight});*/
		if(!$.isEmptyObject(config.formJson)){
			nsForm.formInit(config.formJson);
		}
		if(!$.isEmptyObject(config.tableJson)){
			baseDataTable.init(config.tableJson.dataConfig,config.tableJson.columnConfig,config.tableJson.uiConfig);
		}
		if(!$.isEmptyObject(config.btnsJson)){
			controlPlane.formNavInit(config.btnsJson);
		}
	}
	//关闭面板触发事件
	function closeAdvanceHandler(){
		$configID.remove();
	}
	//给显示字段和主键id赋值
	function fillShowField(){
		if(typeof(config.tages) == 'object'){
			if($.isArray(config.tages.valueField)){
				//如果定义了显示字段
				config.valueFieldArr = config.tages.valueField;
			}
			if(typeof(config.tages.primaryKey) == 'string'){
				if(config.tages.primaryKey){
					//如果存在主键id
					config.primaryKey = config.tages.primaryKey;
				}
			}
		}
	}
	//输出title标题的容器
	function getTitleContainer(titleID){
		var titleStr = typeof(config.title) == 'string' ? config.title : '';
		var titleHtml = '<div class="advance-title" id="'+titleID+'">'
							+'<label>'+titleStr+'</label>'
							+'<a class="advance-close-btn" href="javascript:void(0);">x</a>'
						+'</div>';
		return titleHtml;
	}
	//输出tages显示数据的容器
	function getTagesContainer(tagesID){
		var tagesHtml = '<div class="advance-tages" id="'+tagesID+'">'
						+'<label class="advance-infoMsg"><span>'+language.ui.advancesearch.infoMsg +'</span></label>'
						+'<label class="advance-tagMsg">'+language.ui.advancesearch.tagMsg +'</label>'
					+'</div>';
		return tagesHtml;
	}
	//输出form表单的容器
	function getFormContainer(formID){
		var formHtml = '<div class="advance-form form-wide-panel" id="'+formID+'"></div>';
		return formHtml;
	}
	//输出btns按钮的容器
	function getBtnsContainer(btnsID){
		var btnsHtml = '<div class="advance-button nav-form" id="'+btnsID+'"></div>';
		return btnsHtml;
	}
	//输出table表格的容器
	function getTableContainer(tableID){
		var tableHtml = '<div class="advance-table">'
							+'<div class="table-responsive">'
								+'<table cellspacing="0" '
									+' class="table table-singlerow table-hover table-bordered table-striped" '
									+' id="'+tableID+'">'
								+'</table>'			
							+'</div>'
						+'</div>';
		return tableHtml;
	}
	//动态加载tages显示的数据值
	function refreshTagesHtml(tagStr,tagID){
		//追加数据开始则清空提示语
		var $tageMsg = $tages.children('label.advance-tagMsg');
		if($tageMsg.length == 1){
			$tageMsg.remove();
		}
		//根据id判断值是否存在，存在的情况下不能多次添加
		if(config.selectMode == 'single'){
			//单选模式
			var lableMsgHtml = '<label class="advance-infoMsg">'+language.ui.advancesearch.infoMsgA+'<span>'+language.ui.advancesearch.infoMsgB+'</span></label>';
			var tagHtml = '<span class="tag-content" advance-tagid="'+tagID+'">'
							+'<a href="javascript:void(0)" class="tag-title">'+tagStr+'</a>'
							+'<a href="javascript:void(0)" class="tag-close"></a>'
						+'</span>';
			$('#'+config.tagesID).html(lableMsgHtml+tagHtml);
		}else if(config.selectMode == 'multi'){
			//多选模式
			var isAppend = true;
			//如果此值已经存在数组中则不push值
			if($('#'+config.tagesID+' span[advance-tagid="'+tagID+'"]').length > 0){
				//已经存在的情况下不再进行追加
				isAppend = false;
			}
			if(isAppend){	
				var tagHtml = '<span class="tag-content" advance-tagid="'+tagID+'">'
								+'<a href="javascript:void(0)" class="tag-title">'+tagStr+'</a>'
								+'<a href="javascript:void(0)" class="tag-close"></a>'
							+'</span>';
				$('#'+config.tagesID).append(tagHtml);
				var msgLength = $('#'+config.tagesID+' span.tag-content').length;
				$('#'+config.tagesID+' .advance-infoMsg span').html('共'+msgLength+'个');
			}
		}
		//触发显示数据值的删除事件
		$('#'+config.tagesID+' span').off('click');
		$('#'+config.tagesID+' span').on('click',tagesHandler);
	}
	//table行选中触发事件
	function selectedHandler(rows){
		var tableID = rows.obj.closest('table').attr('id');										//获取当前table的id
		var selectedData = baseDataTable.table[tableID].row(rows.obj).data();					//获取当前行的值
		rows.obj.attr('advance-tid',selectedData[config.primaryKey]);							//给当前选中行添加选中标识
		selectDataHandler(selectedData);														//对拿到当前的行的数据进行处理
	}
	//对当前选中行做处理
	function selectDataHandler(data){
		var tagStr = '';																		//设置默认为空
		var valueFieldArr = config.valueFieldArr;												//要显示的字段名称
		for(var fieldI=0; fieldI<valueFieldArr.length; fieldI++){
			tagStr += data[valueFieldArr[fieldI]] + ' ';										//以空格来分割要显示的值
		}
		tagStr = tagStr.substring(0,tagStr.lastIndexOf(' '));									//以最后一个空格为限
		//值拿到之后两个动作 1.刷新要显示的tages数据  2.赋值数据
		if(config.selectMode == 'single'){
			//单选模式
			var selectedArr = [];
			selectedArr.push(data);
			config.dataArr = selectedArr;														//单选模式只能有一组值
		}else if(config.selectMode == 'multi'){
			//多选模式要考虑刷新之后的操作
			config.dataArr.push(data);															//多选模式直接追加元素值
		}	
		refreshTagesHtml(tagStr,data[config.primaryKey]);										//刷新显示区域的值
	}
	//table行取消选中触发事件
	function unSelectedHandler(rows){
		var tableID = rows.obj.closest('table').attr('id');										//获取当前table的id
		rows.obj.removeClass('advance-tid');													//移除当前行的标识 
		if(config.selectMode == 'single'){
			$('#'+config.tagesID).html('');														//单选模式内容直接清空
			config.dataArr = [];																//值为空
		}else if(config.selectMode == 'multi'){
			var data = baseDataTable.table[tableID].row(rows.obj).data();						//获取当前的数据
			var currentID = data[config.primaryKey];											//拿到主键id
			if($('#'+config.tagesID+ ' span[advance-tagid="'+currentID+'"]').length > 0){
				$('#'+config.tagesID+ ' span[advance-tagid="'+currentID+'"]').remove();
			}
			deleteData(currentID);																//从赋值的数组中移除
		}
		isShowTagmsg();
	}	
	//双击行选中触发事件 触发的确认事件
	function doubleSelectedHandler(rows){
		var tableID = rows.obj.closest('table').attr('id');										//获取当前table的id
		var selectedData = baseDataTable.table[tableID].row(rows.obj).data();					//获取当前行的值
		var dataArr = [];																		//定义数组
		dataArr.push(selectedData);	
		closeAdvanceHandler();																	//数组赋值															//给config配置的数组赋值
		if(typeof(config.onDoubleSelectHandler) == 'function'){
			return config.onDoubleSelectHandler(dataArr);
		}
	}
	//双击行取消触发事件
	function unDoubleSelectedHandler(rows){}
	//tages显示值触发删除事件
	function tagesHandler(ev){
		var deleteID = $(this).attr('advance-tagid');												//要删除的主键id
		$('#'+config.tableID+' tbody tr[advance-tid="'+deleteID+'"]').removeClass('selected');		//移除选中选项
		deleteData(deleteID);																		//调用删除方法
		$(this).remove();																			//移除当前元素
	}
	//根据主键id删除数据  删除的一行
	function deleteData(currentID){
		var dataArr = config.dataArr;
		for(var i=0; i<dataArr.length; i++){
			if(dataArr[i][config.primaryKey] == currentID){
				dataArr.splice(i,1);
			}
		}
		if(config.selectMode == 'single'){
			baseDataTable.container[config.tableID].dataObj = {};
		}else if(config.selectMode == 'multi'){
			var multiData = baseDataTable.container[config.tableID].multiData;
			for(var multiI=0; multiI<multiData.length; multiI++){
				if(multiData[multiI][config.primaryKey] == currentID){
					multiData.splice(multiI,1);
				}
			}
		}
		isShowTagmsg();
	}
	//确认事件的触发
	function confirmHandler(){
		var data;
		if(config.dataArr.length > 0){
			data = config.dataArr;
		}else{
			data = false;
		}
		var isClose = true;
		if($.isArray(data)){
			if(data.length <= 0){
				isClose = false;
			}
		}else{
			isClose = false;
		}
		if(isClose){
			closeAdvanceHandler();
			if(typeof(config.confirmHandler) == 'function'){
				config.confirmHandler(data);					//返回确认按钮事件
			}
		}else{
			// nsAlert( language.ui.advancesearch.infoMsgA ,'error');
			nsAlert( config.errorMsg ,'error');
		}
	}
	//查询事件的触发
	function queryHandler(){
		var formJson = formPlane.getFormJSON(config.formID,false);
		if(config.isDefaultSearch){
			formJson.multipleQuery = $.trim($('#multipleQuery').val());
		}
		if(typeof(config.searchCallback)=='function'){
			var callbackData = config.searchCallback(formJson);
			if(typeof(callbackData)=="object"){
				formJson = callbackData;
			}else{
				if(debugerMode){
					console.error('searchCallback参数返回对象不合法，必须是object');
				}
			}
		}
		var paramData = {};
		if(config.originalData){
			//sjj20181025
			var params = $.extend(true,{},config.originalData);
			if(config.formKeyField){
				params[config.formKeyField] = formJson;
			}else{
				params = $.extend(true,formJson,params);
			}
			paramData = params;
		}else{
			paramData = formJson;
		}
		baseDataTable.reloadTableAJAX(config.tableID,paramData);
	}
	//清空事件的触发
	function clearHandler(){
		if(config.isDefaultSearch){
			$('#multipleQuery').val('');
		}
		formPlane.clearData(config.formID);												//清空表单
	}
	//取消事件的触发
	function cancelHandler(){						
		$('#'+config.tableID+' tbody tr').removeClass('selected');						//移除所有的选中状态
		config.dataArr = [];															//清空值
		isShowTagmsg();
		closeAdvanceHandler();
		if(typeof(config.cancelHandler) == 'function'){
			return config.cancelHandler();												//返回取消按钮事件
		}
	}
	//是否显示添加提示语
	function isShowTagmsg(){
		var dataArr = config.dataArr;
		//当数据为空的情况下显示
		if(dataArr.length == 0){
			var labeHtml = '<label class="advance-infoMsg">'+language.ui.advancesearch.infoMsgC+'<span>'+language.ui.advancesearch.infoMsg+'</span></label>'
							+'<label class="advance-tagMsg">'+language.ui.advancesearch.tagMsg+'</label>';
			$tages.html(labeHtml);														//清空显示值
		}else{
			var msgLength = dataArr.length;
			$('#'+config.tagesID+' .advance-infoMsg span').html( language.ui.advancesearch.infoMsgD +msgLength+ language.ui.advancesearch.infoMsgE );
		}
	}
	return {
		init:					init,
		selectedHandler:		selectedHandler,
		unSelectedHandler:		unSelectedHandler,
		confirmHandler:			confirmHandler			
	}
})(jQuery);
/*******配件选择器 UI end**************/