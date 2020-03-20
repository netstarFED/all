/*
 * 表格面板
 */
nsList = {
	data:{}
};
nsList.init = function(dataConfig,columnConfig,uiConfig,btnConfig){
	//如果没有传送表格id直接回退不继续执行代码
	if(debugerMode){
		if(typeof(dataConfig.tableID) != 'string'){
			console.error('表格ID（tableID）未定义');
			console.error(dataConfig);
			return;
		}
	}
	//默认值设定
	function setBaseDefault(){
		//是否定义了主键id
		if (dataConfig.primaryKey) {
			dataConfig.primaryID = dataConfig.primaryKey;
		}
		var defaultConfig = {
			primaryID:								'id',					//主键id
			src:									'',						//ajax请求链接	
			type:									'GET',					//ajax请求方式
			pagingType:								'simple',				//默认分页展现形式 
			dataSrc:								'data',					//ajax返回数据源
			data:									{},						//ajax请求参
			isServerMode:							false,					//是否开启服务端
			isSearch:								true,					//是否允许搜索
			isPage:									true,					//是否允许分页
			info:									true,					//提示信息第几页
			isLengthChange:							true,					//是否固定行
			isSearchVisible:						true,					//是否显示搜索
		}
		nsVals.setDefaultValues(dataConfig,defaultConfig);
		//页码展现形式
		switch(dataConfig.pagingType){
			case 'full':
				dataConfig.pagingType = 'input';
				break;
			case 'simple':
				dataConfig.pagingType = 'simple_numbers';
				break;
			default:
				dataConfig.pagingType = 'simple_numbers';
				break;
		}
	}
	function setUiconfigDefault(){
		var defaultConfig = {
			searchPlaceholder:						'',						//搜索默认提示语
			isSelectColumns:						false,					//是否开启列选择
			isSingleSelect:							true,					//是否允许单选
			isMulitSelect:							false,					//是否允许多选
			displayMode:							'table',				//默认展现模式
			isAutoSerial:							true,					//是否输出序列号 
			browserSystem:							nsVals.browser.browserSystem,//当前打开版本
		}
		nsVals.setDefaultValues(uiConfig,defaultConfig);
	}
	function setBtnDefault(){
		if(typeof(btnConfig)=='undefined'){btnConfig = {};}
		btnConfig.title = typeof(btnConfig.title)=='string' ? btnConfig.title : '';
		if(!$.isArray(btnConfig.selfBtn)){btnConfig.selfBtn = [];}
	}
	setBaseDefault();
	setUiconfigDefault();
	//setBtnDefault();
	var tableId = dataConfig.tableID;
	nsList.data[tableId] = {
		dataConfig:dataConfig,
		columnConfig:columnConfig,
		uiConfig:uiConfig
	};
	switch(uiConfig.displayMode){
		case 'table':
			baseDataTable.init(dataConfig,columnConfig,uiConfig,btnConfig);
			break;
		case 'block':
			nsList.blockTable.init(dataConfig,columnConfig,uiConfig);
			break;
		case 'tree':
			nsList.treeTable.init(dataConfig,columnConfig,uiConfig);
			break;
		case 'rendertable':
			nsRenderTable.init(dataConfig,columnConfig,uiConfig,btnConfig);
			break;
	}
}
//添加方法
nsList.add = function(tableId,data){
	var uiConfig = nsList.data[tableId].uiConfig;
	switch(uiConfig.displayMode){
		case 'table':
			if($.isArray(data)){
				baseDataTable.addTableRowData(tableId,data);
			}else if(typeof(data)=='object'){
				baseDataTable.addTableRowData(tableId,[data]);
			}
			break;
		case 'block':
			nsList.blockTable.add(tableId,data);
			break;
	}
}
//修改方法
nsList.edit = function(tableId,data){
	var uiConfig = nsList.data[tableId].uiConfig;
	switch(uiConfig.displayMode){
		case 'table':
			baseDataTable.table[tableId].rows().invalidate().draw(false);
			break;
		case 'block':
			nsList.blockTable.edit(tableId,data);
			break;
	}
}
//删除方法
nsList.del = function(tableId,data){
	var uiConfig = nsList.data[tableId].uiConfig;
	var primaryID = nsList.data[tableId].dataConfig.primaryID;
	switch(uiConfig.displayMode){
		case 'table':
			var tableData = baseDataTable.getAllTableData(tableId);
			var delIndex;
			for(var tableI=0; tableI<tableData.length; tableI++){
				if(tableData[tableI].nsTempTimeStamp === data.nsTempTimeStamp){
					delIndex = tableI;
				}
			}
			if(delIndex >=0){
				baseDataTable.table[tableId].row(delIndex).remove().draw(false);
			}else{
				nsalert('数据不存在无法删除');
			}
			break;
		case 'block':
			nsList.blockTable.del(tableId,data);
			break;
	}
}
//删除，根据id删除
nsList.delById = function(tableId,rowData){
	//rowData {voId:'234'}, 必须包含id
	var uiConfig = nsList.data[tableId].uiConfig;
	var primaryID = nsList.data[tableId].dataConfig.primaryID;
	switch(uiConfig.displayMode){
		case 'table':
			var tableData = baseDataTable.getAllTableData(tableId);
			var delIndex;
			for(var tableI=0; tableI<tableData.length; tableI++){
				if(tableData[tableI][primaryID] === rowData[primaryID]){
					delIndex = tableI;
				}
			}
			if(delIndex >=0){
				baseDataTable.table[tableId].row(delIndex).remove().draw(false);
				//sjj20180927 删除数据应该从原始数据一起删除
				if($.isArray(nsTable.originalConfig[tableId].dataConfig.dataSource)){
					nsTable.originalConfig[tableId].dataConfig.dataSource.splice(delIndex,1);
				}
			}else{
				nsalert('数据不存在无法删除');
			}
			break;
		case 'block':
			nsList.blockTable.del(tableId,data);
			break;
	}
}
//获取全部数据
nsList.getAllData = function(tableId){
	var data = [];
	if(nsList.data[tableId]){
		var uiConfig = nsList.data[tableId].uiConfig;
		switch(uiConfig.displayMode){
			case 'table':
				data = baseDataTable.getAllTableData(tableId);
				break;
			case 'block':
				// data = nsList.blockTable.originalRowsData[tableId];
				data = nsList.blockTable.data[tableId].dataConfig.dataSource;
				break;
		}
		for(var dataI=0; dataI<data.length; dataI++){
			if(typeof(data[dataI].nsTempTimeStamp)=='number'){
				delete data[dataI].nsTempTimeStamp;
			}
		}
	}
	return data;
}
//销毁
nsList.destroy = function(tableId){
	var uiConfig = nsList.data[tableId].uiConfig;
	switch(uiConfig.displayMode){
		case 'table':
			baseDataTable.destroy(tableId);
			break;
		case 'block':
			break;
	}
}
//清空
nsList.clear = function(tableId,flag){
	var uiConfig = nsList.data[tableId].uiConfig;
	switch(uiConfig.displayMode){
		case 'table':
			baseDataTable.clearData(tableId,flag);
			baseDataTable.isFillEmptyRow(tableId);
			break;
		case 'block':
			nsList.blockTable.clear(tableId);
			break;
	}
}
//转换查找biaogetab中的tabname和tabposition
nsList.getTableColumnAndTabsName = function(columnArr){
	var tabData = {};
	var tabsName = [];
	var isContinue = true;
	var fieldArray = $.extend(true,[],columnArr);//克隆
	//排序 lyw注 不知道在做什么
	// fieldArray.sort(function(a,b){
	// 	return a.mindjetTabNamePosition - b.mindjetTabNamePosition;
	// });
	//匹配找到tabname键值对
	for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
		if(typeof(fieldArray[fieldI].mindjetTabName)=='undefined' || typeof(fieldArray[fieldI].mindjetTabNamePosition)=='undefined'){
			isreturn = false;
			break;
		}
		if(typeof(tabData[fieldArray[fieldI].mindjetTabNamePosition])!=='object'){
			tabData[fieldArray[fieldI].mindjetTabNamePosition] = {};
		}
		tabData[fieldArray[fieldI].mindjetTabNamePosition].name = fieldArray[fieldI].mindjetTabName;
		if(!$.isArray(tabData[fieldArray[fieldI].mindjetTabNamePosition].field)){
			tabData[fieldArray[fieldI].mindjetTabNamePosition].field = [];
		}
		tabData[fieldArray[fieldI].mindjetTabNamePosition].field.push(fieldArray[fieldI]);
	}
	//改变位置删除不必要存在的元素属性
	if(isContinue){
		var positionNum = 0;
		for(var tab in tabData){
			tabsName.push(tabData[tab].name);
			for(var tabI=0; tabI<tabData[tab].field.length; tabI++){
				delete tabData[tab].field[tabI].mindjetTabNamePosition;
				delete tabData[tab].field[tabI].mindjetTabName;
				tabData[tab].field[tabI].tabPosition = positionNum;
			}
			positionNum++;
		}
	}
	return{
		tabsName:tabsName,
		columnArray:fieldArray
	}
}
//表格行修改
nsList.rowEdit = function(tableId, inputData, options){
	//tableId: string 表格ID 必填
	//inputData: object 修改行的数据 必填 例如：{id:1, name:'abc'}
	/*options：object 配置参数，默认{isUseNotInputData：false}
	 *		isUseNotInputData:boolean 默认true，是否保留原始值 ，默认不保留原始数据
	 * 		isUseInputField:boolean 默认true, 编辑弹框输入数据与表格数据不匹配
	 * 		queryMode:string  可选值（all/tr/field）默认none tr:按照tr查找 field:按照某个字段查找， all：不查找直接刷新全部, 
	 * 		queryValue:根据queryMode确定类型 
	 */
	var $datatable = baseDataTable.table[tableId];
	var datatableData = $datatable.data();
		
		
	//默认值
	var defaultOptions = 
	{
		isUseNotInputData:true,
		isUseInputField:true,
		type:'table',
	}
	nsVals.setDefaultValues(options, defaultOptions);

	//如果要保留原始值 则读取原表格行的值 补充到新数据上
	function setNotInputData(){
		var newData = {};
		if(options.isUseNotInputData){
			for(var dataKey in inputData){
				if(typeof(inputData[dataKey])=='undefined'){
					newData[dataKey] = inputData[dataKey];
				}else{
					newData[dataKey] = inputData[dataKey];
				}
			}
		}
		return newData;
	}
	//设置输入值，附加有效的值
	function setInputDataValue(){
		for(var key in newData){
			if(newData[key] == '' && typeof(inputData[key])=='undefined'){
				//如果表格数据为空 则 没有新输入值 就不要了
			}else{
				inputData[key] = newData[key];
			}
		}
	}
	//根据field查找
	function getRowIndexByInputData(){
		var rowIndex = -1;
		var matchField = options.queryValue;
		for(var trI = 0; trI<datatableData.length; trI++){
			if(datatableData[trI][matchField] == inputData[matchField]){
				rowIndex = trI;
			}
		}
		if(rowIndex == -1){
			if(typeof(inputData[matchField])=='undefined'){
				console.error('服务器返回数据中没有有效的主键值');
				console.error(res);
			}else{
				console.error('无法找到对应的数据 '+matchField+':'+inputData[matchField]);
				console.error(res);
			}
			return false;
		}else{
			return rowIndex;
		}
		
	}
	//根据查询类型不同获取当前行数据
	//然后根据类型不同刷新数据
	switch(options.queryMode){
		case 'tr':
			//根据$tr获取数据和刷新数据
			var $tr = options.queryValue;
			var rowData = $datatable.row($tr).data();
			var newData = setNotInputData();
			if(options.isUseInputField){
				//如果inputData的字段可以直接用于表格显示 则刷新表格对应的行
				$datatable.row($tr).data(newData).draw(false);
				//修改原来的输入值 添加表格上的有效值
				setInputDataValue();
			}else{
				//如果inputData的字段与表格不符合 先不修改
			}
			
			break;
		case 'field':
			//查找某个字段相同来查找
			var rowIndex = getRowIndexByInputData();
			var rowData = $datatable.row(rowIndex).data();
			var newData = setNotInputData();
			if(options.isUseInputField){
				//如果inputData的字段可以直接用于表格显示 则刷新表格对应的行
				$datatable.row(rowIndex).data(newData).draw(false);
				//修改原来的输入值 添加表格上的有效值
				setInputDataValue();
			}else{
				//如果inputData的字段与表格不符合 先不修改
			}
			break;
		case 'all':
			break;
	}
}
//表格行修改
nsList.rowDelete = function(tableId, inputData, options){
	//tableId: string 表格ID 必填
	/*options：object 配置参数
	 * 		queryMode:string  可选值（all/tr/field）默认none tr:按照tr查找 field:按照某个字段查找， all：不查找直接刷新全部, 
	 * 		queryValue:根据queryMode确定类型
	 * 		type:string 默认值：table 
	 * 		idField:string 用于比对数据
	 */
	var $datatable = baseDataTable.table[tableId];
	var datatableData = $datatable.data();
		
	//默认值
	var defaultOptions = 
	{
		type:'table',
	}
	nsVals.setDefaultValues(options, defaultOptions);

	//根据field查找
	function getRowIndexByInputData(){
		var rowIndex = 0;
		for(var trI = 0; trI<datatableData.length; trI++){
			console.log(datatableData[trI]);
		}
		return rowIndex;
	}
	//然后根据类型不同刷新数据
	switch(options.queryMode){
		case 'tr':
			//根据$tr获取数据和刷新数据
			var $tr = options.queryValue;
			baseDataTable.table[tableId].row($tr).remove().draw(false);
			
			break;
		case 'field':
			//查找某个字段相同来查找
			var rowIndex = getRowIndexByInputData();
			baseDataTable.table[tableId].row($tr).remove().draw(false);
			break;
		case 'all':
			break;
	}
}
//表格批量添加 临时数据 在ajax返回后要（成功）替换或者（失败）删除
nsList.rowMultiAddForTempData = function(config){
	/*config：object 配置参数
	 *		tableId: string 	表格ID 必填
	 *		inputData: object 	输入的数据 必填
	 * 		idField:string  	id字段用来判断新增数据, 
	 *
	 * 		isSaveData：boolean 如果是saveData，则添加NSSAVEDATAFLAG.ADD
	 * 		keyField:string 	如果是saveData则需要idField/keyField（如果keyField为空则不附加）/currentData
	 * 		currentData:object  当前操作的数据
	 *
	 * 		parentType:string 			父对象的类型，form/table 
	 * 		parentContainerId:string 	keyField不为空的时候，则需要指定此参数,父对象的容器ID，表格则为上级表格ID，表单则为表单ID
	 * 		parentIdField:string 		keyField不为空的时候，且类型为list（table），则需要指定此参数
	 *
	 * 		ajax:object 		ajax配置参数 {src:'',type, }
	 * 		afterHandler:function(res)  全部执行完毕的回调函数, 返回结果为服务器数据
	 */
	//添加到表格中的数据
	
	var chargeField = config.chargeField;
	//添加行并选中新行
	var originalDataSource = [];
	var tableDataArray = [];
	switch(nsList.data[config.tableId].uiConfig.displayMode){
		case 'table':
			originalDataSource = baseDataTable.originalConfig[config.tableId].dataConfig.dataSource;
			break;
		case 'block':
			// originalDataSource = nsList.blockTable.originalRowsData[config.tableId];
			originalDataSource = nsList.blockTable.data[config.tableId].dataConfig.dataSource;
			break;
	}
	tableDataArray = $.extend(true,[],originalDataSource);
	var inputDataArray = $.extend(true,[],config.inputData);
	var ajaxData = $.extend(true, {}, config.currentData);
	var rowArray = [];
	if(!$.isArray(ajaxData[config.keyField])){ajaxData[config.keyField] = [];}
	function isExistDataByIdField(id){
		//根据id判断是否已经存在于数据中
		var isExist = false;//默认不存在
		if(id){
			for(var idI=0; idI<ajaxData[config.keyField].length; idI++){
				var existData = ajaxData[config.keyField][idI];
				if(existData[config.idField] === id){
					//存在
					isExist = true;
					break;//终止循环
				}
			}
		}
		return isExist;
	}
	if(chargeField){
		//存在转字段
		var chargeField = eval('('+chargeField+')');
		for(var dataI=0; dataI<inputDataArray.length; dataI++){
			var rowData = $.extend(true,{},inputDataArray[dataI]);
			var rowJson = {};
			for(field in chargeField){
				rowJson[field] = nsVals.getTextByFieldFlag(chargeField[field],rowData);
			}
			rowArray.push(rowJson);
		}
	}else{
		rowArray = inputDataArray;
	}
	for(var arrayI=0; arrayI<rowArray.length; arrayI++){
		var inputData = $.extend(true,{},rowArray[arrayI]);
		//是否已经存在
		var isExist = isExistDataByIdField(inputData[config.idField]);
		if(!isExist){
			//不存在进行添加
			inputData.objectState = NSSAVEDATAFLAG.ADD;
			ajaxData[config.keyField].push(inputData);
			originalDataSource.unshift(rowArray[arrayI]);
		}
	}
	nsList.refresh(config.tableId,originalDataSource);
	//baseDataTable.refreshByID(config.tableId);
	var newData = $.extend(true,{},ajaxData);
	var ajaxConfig = {};
	if(config.isSaveData){
		newData.objectState = NSSAVEDATAFLAG.ADD;
		//处理keyField
		if(config.keyField == ''){
			//不用补充
		}else{
			//主表未修改标识
			newData.objectState = NSSAVEDATAFLAG.NULL;
			if(typeof(newData[config.keyField])=='undefined'){
				newData[config.keyField] = [];
			}
		}
		ajaxConfig = nsVals.getAjaxConfig(config.ajax, newData);
	}
	//标记时间戳用于返回数据后替换
	ajaxConfig.plusData = {
		tableId:config.tableId,
		dataSrc:config.ajax.dataSrc,
		idField:config.idField,
		afterHandler:config.afterHandler,
		keyField:config.keyField,
		tableDataArray:tableDataArray
	};
	//如果有keyField则有父对象
	if(config.keyField!=''){
		ajaxConfig.plusData.parentType = config.parentType;
		ajaxConfig.plusData.parentContainerId = config.parentContainerId;
		ajaxConfig.plusData.parentIdField = config.parentIdField;
	}
	nsVals.ajax(ajaxConfig, function(res, ajaxObj){
		//ajax.data中的时间戳
		var tableId = ajaxObj.plusData.tableId;
		var dataSrc = ajaxObj.plusData.dataSrc;
		var idField = ajaxObj.plusData.idField;
		var afterHandler = ajaxObj.plusData.afterHandler;
		var keyField = ajaxObj.plusData.keyField;
		var tableDataArray = ajaxObj.plusData.tableDataArray;
		var tableData = [];
		//主表数据
		/*switch(nsList.data[tableId].uiConfig.displayMode){
			case 'table':
				tableData = baseDataTable.table[tableId].data();
				
				//区分类型
				var tempRowIndex = -1;
				var keyFieldType = -1;
				if(keyField == ''){
					keyFieldType = 0; //一层数据
				}else if(keyField.indexOf('.')){
					var keyFieldMatchArray = keyField.match(/\./g);
					if(keyFieldMatchArray){
						keyFieldType = keyFieldType.length + 1; //sale.info 有.则认为三级及以上
					}else{
						keyFieldType = 1; //二层数据
					}
					
				}
				//查找相关行
				switch(keyFieldType){
					case 0:
						//keyField = '', 只有一层的根据时间戳查找
						for(var trI = 0; trI<tableData.length; trI++){
							var rowData = tableData[trI];
							//根据时间戳找到数据
							if(rowData.nsTempTimeStamp == tempTimeStamp){
								tempRowIndex = trI;
								break;
							}
						}
						break;

					case 1:
						//keyField = 'saleVOList', 第二层的根据父表的idField查找
						//var parentTableData = baseDataTable.table[tableId].data();
						for(var trI = 0; trI<tableData.length; trI++){
							var rowData = tableData[trI];
							//根据时间戳找到数据
							if(rowData.nsTempTimeStamp == tempTimeStamp){
								tempRowIndex = trI;
								break;
							}
						}

						break;
					default:
						console.error('暂时不能处理，需要补充方法');
						break;
				}
				
				//如果找不到相关行，则停止执行
				if(tempRowIndex == -1){
					console.error('无法找到服务器返回数据对应的结果，之前已经保存成功');
					console.error(res);
					return false;
				}
				break;
			case 'block':
				// tableData = nsList.blockTable.originalRowsData[tableId];
				tableData = nsList.blockTable.data[tableId].dataConfig.dataSource;
				break;
		}*/
		//返回数据
		var resData = res[dataSrc];

		var isAddSuccess = true;
		// 1. 返回数据是否成功 success:true
		if(res.success){
			isAddSuccess = true;
		}else{
			nsalert('新增数据失败','error');
			isAddSuccess = false;
		}

		// 2.判断返回数据是否可用,是否包含必须的字段keyField
		if(keyField!='' && isAddSuccess){
			if($.isArray(resData[keyField])){
				isAddSuccess = true
			}else{
				isAddSuccess = false;
				console.error('服务器端返回数据错误');
				console.error(res);
			}
		}
		// 补充服务器没有返回来的数据 如果没有返回则补充为''
		function getNullDataByTableRowData(resData, _tableRowData){
			var fullData = $.extend(false, {}, resData);
			for(var key in _tableRowData){
				if(typeof(resData[key])=='undefined'){
					fullData[key] = '';
				}
			}
			return fullData;
		}
		//简单数据（主表数据） 执行新增操作成功，刷新数据
		function refreshRowData(refreshOptions){
			/* refreshOptions, 
			 * { 
			 *	tableId:string, 
			 *	idField:string, 
			 * 	rowIndex:number, 
			 *	resData:{},  		返回的服务器端数据
			 * }
			 */
			/*var tableRowData = baseDataTable.table[refreshOptions.tableId].row(refreshOptions.rowIndex).data();
			if(tableRowData[refreshOptions.idField]==''){
				
				// 删除临时时间戳
				if(tableRowData.nsTempTimeStamp){
					delete tableRowData.nsTempTimeStamp;
				}
				//生成插入到表格的数据 补充Null数据
				rowData = getNullDataByTableRowData(refreshOptions.resData, tableRowData);
				//刷新表格数据和原始数据
				baseDataTable.table[tableId].row(refreshOptions.rowIndex).data(rowData).draw(false);
				baseDataTable.originalConfig[refreshOptions.tableId].dataConfig.dataSource[refreshOptions.rowIndex] = rowData;
			}else{
				console.error('数据已经保存过，无法执行新增操作');
				console.error(res);
			}*/
			nsList.refresh(tableId,resData[keyField]);
		}
		//两层数据 刷新上级数据和当前表格数据
		function refreshObjectData(){
			nsList.refresh(tableId,resData[keyField]);
		/*		parentType:string 			父对象的类型，form/table 
		 * 		parentContainerId:string 	keyField不为空的时候，则需要指定此参数,父对象的容器ID，表格则为上级表格ID，表单则为表单ID
		 * 		parentIdField:string 		keyField不为空的时候，且类型为list（table），则需要指定此参数
		 */
			/*if(keyField!=''){
				var parentType = ajaxObj.plusData.parentType;
				var parentContainerId = ajaxObj.plusData.parentContainerId;
				var parentIdField = ajaxObj.plusData.parentIdField;
			}
			switch(parentType){
				case 'list':
					//刷新上级表（主表） 只刷新对应id的数据
					var parentTableData= baseDataTable.table[parentContainerId].data();
					var parentRowIndex = -1;
					for(var parentRowI = 0; parentRowI<parentTableData.length; parentRowI++){
						var parentTableRowData = parentTableData[parentRowI];
						if(parentTableRowData[parentIdField]==resData[parentIdField]){
							parentRowIndex = parentRowI;
							break;
						}
					}
					var parentTableRowData = getNullDataByTableRowData(resData, parentTableData[0]); 
					baseDataTable.table[parentContainerId].row(parentRowIndex).data(parentTableRowData).draw(false);
					baseDataTable.originalConfig[parentContainerId].dataConfig.dataSource[parentRowIndex] = parentTableRowData;
					//刷新子表格 全部刷新
					//var childTableData = baseDataTable.table[tableId].data();
					//baseDataTable.originalConfig[tableId].dataConfig.dataSource = resData[keyField];
					//baseDataTable.refreshByID(tableId);
					nsList.refresh(tableId,resData[keyField]);
					break;
				case 'modal':
					//还没写
					break;
			}*/
		}
		//新增操作失败，删除数据
		function removeRowData(data){
			var tableId = data.tableId;
			nsList.refresh(tableId,tableDataArray);
			/*var dataArray = [];
			for(var dataI=0; dataI<resData[keyField].length; dataI++){
				if(resData[keyField][dataI].objectState == 0){
					dataArray.push(resData[keyField][dataI]);
				}
			}*/
			//baseDataTable.table[tableId].row(rowIndex).remove().draw(false);
			//baseDataTable.originalConfig[config.tableId].dataConfig.dataSource.splice(rowIndex,1);
		}
		if(isAddSuccess){
			refreshRowData({
				tableId:tableId,
				idField:idField,
				//rowIndex:tempRowIndex,
				resData:resData
			});
			//回调
			if(typeof(afterHandler)=='function'){
				afterHandler(resData);
			};
			/*if(keyField == ''){
				refreshRowData({
					tableId:tableId,
					idField:idField,
					//rowIndex:tempRowIndex,
					resData:resData
				});
				//选中第一行
				nsList.selectFirstRow(tableId);
				//回调
				if(typeof(afterHandler)=='function'){
					afterHandler(res[dataSrc]);
				};
			}else{
				refreshObjectData();
				//选中第一行
				nsList.selectFirstRow(tableId);
				//回调
				if(typeof(afterHandler)=='function'){
					afterHandler(res[dataSrc]);
				};
			}*/
		}else{
			removeRowData({
				tableId:tableId,
				idField:idField,
			});
		}
	}, true)
}
//表格行添加 临时数据 在ajax返回后要（成功）替换或者（失败）删除
nsList.rowAddForTempData = function(config){
	/*config：object 配置参数
	 *		tableId: string 	表格ID 必填
	 *		inputData: object 	输入的数据 必填
	 * 		idField:string  	id字段用来判断新增数据, 
	 *
	 * 		isSaveData：boolean 如果是saveData，则添加NSSAVEDATAFLAG.ADD
	 * 		keyField:string 	如果是saveData则需要idField/keyField（如果keyField为空则不附加）/currentData
	 * 		currentData:object  当前操作的数据
	 *
	 * 		parentType:string 			父对象的类型，form/table 
	 * 		parentContainerId:string 	keyField不为空的时候，则需要指定此参数,父对象的容器ID，表格则为上级表格ID，表单则为表单ID
	 * 		parentIdField:string 		keyField不为空的时候，且类型为list（table），则需要指定此参数
	 *
	 * 		ajax:object 		ajax配置参数 {src:'',type, }
	 * 		afterHandler:function(res)  全部执行完毕的回调函数, 返回结果为服务器数据
	 */
	
	//添加到表格中的数据
	var addTabelRowData = $.extend(true, {}, config.inputData);
	var timeStamp = new Date().getTime();
	addTabelRowData.nsTempTimeStamp = timeStamp; //添加时间戳
	addTabelRowData[config.idField] = '';   //添加空id
	//添加行并选中新行
	// var originalDataSource = baseDataTable.originalConfig[config.tableId].dataConfig.dataSource;
	var originalDataSource = [];
	switch(nsList.data[config.tableId].uiConfig.displayMode){
		case 'table':
			originalDataSource = baseDataTable.originalConfig[config.tableId].dataConfig.dataSource;
			break;
		case 'block':
			// originalDataSource = nsList.blockTable.originalRowsData[config.tableId];
			originalDataSource = nsList.blockTable.data[config.tableId].dataConfig.dataSource;
			break;
	}
	originalDataSource.unshift(addTabelRowData);
	nsList.refresh(config.tableId,originalDataSource);
	//baseDataTable.refreshByID(config.tableId);
	nsList.selectFirstRow(config.tableId);

	//ajax发送的数据
	var newData = $.extend(true, {}, config.inputData);
	var ajaxConfig = {};
	//saveData处理
	if(config.isSaveData){
		//saveData添加新增标识
		newData.objectState = NSSAVEDATAFLAG.ADD;
		//处理keyField
		if(config.keyField == ''){
			//不用补充
			ajaxConfig = nsVals.getAjaxConfig(config.ajax, newData,{pageParam:config.pageParam});
		}else{
			var ajaxData = $.extend(true, {}, config.currentData);
			//主表未修改标识
			ajaxData.objectState = NSSAVEDATAFLAG.NULL;
			//子表数据处理
			if(typeof(ajaxData[config.keyField])=='undefined'){
				ajaxData[config.keyField] = [];
			}
			for(var rowI = 0; rowI<ajaxData[config.keyField].length; rowI++){
				var ajaxRowData = ajaxData[config.keyField][rowI];
				//添加子表未修改标识
				ajaxRowData.objectState = NSSAVEDATAFLAG.NULL;
				//过滤无用数据
				nsList.clearDataTableRowData(ajaxRowData);
			}
			//把新增的加到第一行
			ajaxData[config.keyField].unshift(newData);
			//拼接发送json串
			ajaxData = $.extend(true, {}, ajaxData);
			ajaxConfig = nsVals.getAjaxConfig(config.ajax, ajaxData,{pageParam:config.pageParam});
		}
	}
		
	//标记时间戳用于返回数据后替换
	ajaxConfig.plusData = {
		nsTempTimeStamp:timeStamp,
		tableId:config.tableId,
		dataSrc:config.ajax.dataSrc,
		idField:config.idField,
		afterHandler:config.afterHandler,
		keyField:config.keyField,
	};
	//如果有keyField则有父对象
	if(config.keyField!=''){
		ajaxConfig.plusData.parentType = config.parentType;
		ajaxConfig.plusData.parentContainerId = config.parentContainerId;
		ajaxConfig.plusData.parentIdField = config.parentIdField;
	}
	nsVals.ajax(ajaxConfig, function(res, ajaxObj){
		//ajax.data中的时间戳
		var tempTimeStamp = ajaxObj.plusData.nsTempTimeStamp;
		var tableId = ajaxObj.plusData.tableId;
		var dataSrc = ajaxObj.plusData.dataSrc;
		var idField = ajaxObj.plusData.idField;
		var afterHandler = ajaxObj.plusData.afterHandler;
		var keyField = ajaxObj.plusData.keyField;
		//主表数据
		// var tableData = baseDataTable.table[tableId].data();
		var tableData = [];
		switch(nsList.data[tableId].uiConfig.displayMode){
			case 'table':
				tableData = baseDataTable.table[tableId].data();
				break;
			case 'block':
				// tableData = nsList.blockTable.originalRowsData[config.tableId];
				tableData = nsList.blockTable.data[config.tableId].dataConfig.dataSource;
				break;
		}
		//返回数据
		var resData = res[dataSrc];
		//区分类型
		var tempRowIndex = -1;
		var keyFieldType = -1;
		if(keyField == ''){
			keyFieldType = 0; //一层数据
		}else if(keyField.indexOf('.')){
			var keyFieldMatchArray = keyField.match(/\./g);
			if(keyFieldMatchArray){
				keyFieldType = keyFieldType.length + 1; //sale.info 有.则认为三级及以上
			}else{
				keyFieldType = 1; //二层数据
			}
			
		}
		//查找相关行
		switch(keyFieldType){
			case 0:
				//keyField = '', 只有一层的根据时间戳查找
				for(var trI = 0; trI<tableData.length; trI++){
					var rowData = tableData[trI];
					//根据时间戳找到数据
					if(rowData.nsTempTimeStamp == tempTimeStamp){
						tempRowIndex = trI;
						break;
					}
				}
				break;

			case 1:
				//keyField = 'saleVOList', 第二层的根据父表的idField查找
				// var parentTableData = baseDataTable.table[tableId].data();
				for(var trI = 0; trI<tableData.length; trI++){
					var rowData = tableData[trI];
					//根据时间戳找到数据
					if(rowData.nsTempTimeStamp == tempTimeStamp){
						tempRowIndex = trI;
						break;
					}
				}

				break;
			default:
				console.error('暂时不能处理，需要补充方法');
				break;
		}
		
		//如果找不到相关行，则停止执行
		if(tempRowIndex == -1){
			console.error('无法找到服务器返回数据对应的结果，之前已经保存成功');
			console.error(res);
			return false;
		}

		var isAddSuccess = true;
		// 1. 返回数据是否成功 success:true
		if(res.success){
			isAddSuccess = true;
		}else{
			nsalert('新增数据失败','error');
			isAddSuccess = false;
		}

		// 2.判断返回数据是否可用,是否包含必须的字段keyField
		if(keyField!='' && isAddSuccess){
			if($.isArray(resData[keyField])){
				isAddSuccess = true
			}else{
				isAddSuccess = false;
				console.error('服务器端返回数据错误');
				console.error(res);
			}
		}
		// 补充服务器没有返回来的数据 如果没有返回则补充为''
		function getNullDataByTableRowData(resData, _tableRowData){
			var fullData = $.extend(false, {}, resData);
			for(var key in _tableRowData){
				if(typeof(resData[key])=='undefined'){
					fullData[key] = '';
				}
			}
			return fullData;
		}
		//简单数据（主表数据） 执行新增操作成功，刷新数据
		function refreshRowData(refreshOptions){
			/* refreshOptions, 
			 * { 
			 *	tableId:string, 
			 *	idField:string, 
			 * 	rowIndex:number, 
			 *	resData:{},  		返回的服务器端数据
			 * }
			 */
			for(var data in refreshOptions.resData){
			 	if($.isArray(refreshOptions.resData[data])){
			 		for(var i=0; i<refreshOptions.resData[data].length; i++){
			 			if(refreshOptions.resData[data][i].objectState == NSSAVEDATAFLAG.ADD){
			 				delete refreshOptions.resData[data][i].objectState;	
			 			}
			 		}
			 	}
			}
			var tableRowData = baseDataTable.table[refreshOptions.tableId].row(refreshOptions.rowIndex).data();
			if(tableRowData[refreshOptions.idField]==''){
				
				// 删除临时时间戳
				if(tableRowData.nsTempTimeStamp){
					delete tableRowData.nsTempTimeStamp;
				}
				//生成插入到表格的数据 补充Null数据
				rowData = getNullDataByTableRowData(refreshOptions.resData, tableRowData);
				//刷新表格数据和原始数据
				baseDataTable.table[tableId].row(refreshOptions.rowIndex).data(rowData).draw(false);
				baseDataTable.originalConfig[refreshOptions.tableId].dataConfig.dataSource[refreshOptions.rowIndex] = rowData;
			}else{
				console.error('数据已经保存过，无法执行新增操作');
				console.error(res);
			}
		}
		//两层数据 刷新上级数据和当前表格数据
		function refreshObjectData(){
		/*		parentType:string 			父对象的类型，form/table 
		 * 		parentContainerId:string 	keyField不为空的时候，则需要指定此参数,父对象的容器ID，表格则为上级表格ID，表单则为表单ID
		 * 		parentIdField:string 		keyField不为空的时候，且类型为list（table），则需要指定此参数
		 */
			if(keyField!=''){
				var parentType = ajaxObj.plusData.parentType;
				var parentContainerId = ajaxObj.plusData.parentContainerId;
				var parentIdField = ajaxObj.plusData.parentIdField;
			}
			for(var data in resData){
			 	if($.isArray(resData[data])){
			 		for(var i=0; i<resData[data].length; i++){
			 			if(resData[data][i].objectState == NSSAVEDATAFLAG.ADD){
			 				delete resData[data][i].objectState;	
			 			}
			 		}
			 	}
			}
			switch(parentType){
				case 'list':
					//刷新上级表（主表） 只刷新对应id的数据
					var parentTableData= baseDataTable.table[parentContainerId].data();
					var parentRowIndex = -1;
					for(var parentRowI = 0; parentRowI<parentTableData.length; parentRowI++){
						var parentTableRowData = parentTableData[parentRowI];
						if(parentTableRowData[parentIdField]==resData[parentIdField]){
							parentRowIndex = parentRowI;
							break;
						}
					}
					var parentTableRowData = getNullDataByTableRowData(resData, parentTableData[0]); 
					baseDataTable.table[parentContainerId].row(parentRowIndex).data(parentTableRowData).draw(false);
					baseDataTable.originalConfig[parentContainerId].dataConfig.dataSource[parentRowIndex] = parentTableRowData;
					//刷新子表格 全部刷新
					//var childTableData = baseDataTable.table[tableId].data();
					//baseDataTable.originalConfig[tableId].dataConfig.dataSource = resData[keyField];
					//baseDataTable.refreshByID(tableId);
					nsList.refresh(tableId,resData[keyField]);
					break;
				case 'modal':
					//还没写
					break;
			}


			//console.log(res[dataSrc]);
		}
		//新增操作失败，删除数据
		function removeRowData(rowIndex){
			// baseDataTable.table[tableId].row(rowIndex).remove().draw(false);
			// baseDataTable.originalConfig[config.tableId].dataConfig.dataSource.splice(rowIndex,1);
			switch(nsList.data[tableId].uiConfig.displayMode){
				case 'table':
					baseDataTable.table[tableId].row(rowIndex).remove().draw(false);
					baseDataTable.originalConfig[config.tableId].dataConfig.dataSource.splice(rowIndex,1);
					break;
				case 'block':
					nsList.blockTable.container[config.tableId].$table.children().children().eq(rowIndex).remove();
					// nsList.blockTable.originalRowsData[config.tableId].splice(rowIndex,rowIndex+1);
					tableData = nsList.blockTable.data[config.tableId].dataConfig.dataSource.splice(rowIndex,rowIndex+1);
					break;
			}
		}
		var returnRes = res[dataSrc];
		if(isAddSuccess){
			if(keyField == ''){
				refreshRowData({
					tableId:tableId,
					idField:idField,
					rowIndex:tempRowIndex,
					resData:resData
				});
				//选中第一行
				nsList.selectFirstRow(tableId);
				//回调
				/*if(typeof(afterHandler)=='function'){
					afterHandler(res[dataSrc]);
				};*/
			}else{
				refreshObjectData();
				//选中第一行
				nsList.selectFirstRow(tableId);
				//回调
				/*if(typeof(afterHandler)=='function'){
					afterHandler(res[dataSrc]);
				};*/
			}
		}else{
			returnRes = res.errData;
			removeRowData(tempRowIndex);
		}
		/****sjj 20180912 针对返回事件添加参数 ajax成功失败都需要添加返回参数*************/
		if(typeof(afterHandler)=='function'){
			afterHandler(isAddSuccess,returnRes);     //返回失败 无返回 
		}
	}, true)
}
//选中第一行
nsList.selectFirstRow = function(tableId){
	//tableId:string 
	var tableData = [];
	switch(nsList.data[tableId].uiConfig.displayMode){
		case 'table':
			tableData = baseDataTable.table[tableId].data();
			if(tableData.length>0){
				//选中第一行,并取消其他行的选中状态
				$("#"+tableId).children('tbody').children('tr.selected').removeClass('selected');
				$("#"+tableId).children('tbody').children('tr:first').addClass('selected');
				//修改选中数据
				baseDataTable.container[tableId].dataObj = tableData[0];
			}
			break;
		case 'block':
			// tableData = nsList.blockTable.originalRowsData[tableId];
			tableData = nsList.blockTable.data[tableId].dataConfig.dataSource;
			if(tableData.length>0){
				//选中第一行,并取消其他行的选中状态
				$("#"+tableId).children('.row').children().children('.selected').removeClass('selected');
				$("#"+tableId).children('.row').children().children('div:first').addClass('selected');
				//修改选中数据
				nsList.blockTable.rowData[tableId].data = tableData[0];
			}
			break;
	}
	// var tableData = baseDataTable.table[tableId].data();
	// if(tableData.length>0){
	// 	//选中第一行,并取消其他行的选中状态
	// 	$("#"+tableId).children('tbody').children('tr.selected').removeClass('selected');
	// 	$("#"+tableId).children('tbody').children('tr:first').addClass('selected');
	// 	//修改选中数据
	// 	baseDataTable.container[tableId].dataObj = tableData[0];
	// }
}
//清除表格数据中的无用数据
nsList.clearDataTableRowData = function(tableRowData){
	//tableRowData 表格中的行数据，一般是通过row().data()方法获取的
	//删除无用的field字段
	$.each(tableRowData, function(key,value){
		if(key == 'id' && value ===''){
			delete tableRowData[key];
		}else if(key.indexOf('nsTemplate')==0){
			delete tableRowData[key];
		}
	})
}
//表格添加数据
nsList.rowAdd = function(tableId, rowData){
	//rowData 
	var uiConfig = nsList.data[tableId].uiConfig;
	switch(uiConfig.displayMode){
		case 'table':
			var newRowData = []
			if($.isArray(rowData) == false){
				newRowData.push(rowData)
			}else{
				newRowData = rowData
			}
			var tableData = baseDataTable.table["tableId"].data();
			for(var i=newRowData.length-1; i>=0; i--){
				tableData.unshift(newRowData[i]);
			}
			baseDataTable.table[tableId].rows().invalidate().draw(false);
			break;
		case 'block':
			nsList.blockTable.add(tableId,data);
			break;
	}
}
//刷新
nsList.refresh = function(tableId,dataArr){
	/*
	*tableId 表格id
	*dataArr 刷新的数据
	*/
	var displayMode = nsList.data[tableId].uiConfig.displayMode;
	switch(displayMode){
		case 'table':
			baseDataTable.originalConfig[tableId].dataConfig.dataSource = dataArr;
			baseDataTable.refreshByID(tableId);
			break;
		case 'block':
			// nsList.blockTable.originalRowsData[tableId] = dataArr;
			nsList.blockTable.data[tableId].dataConfig.dataSource = dataArr;
			nsList.blockTable.getHtml(tableId,dataArr);
			break;
	}
}