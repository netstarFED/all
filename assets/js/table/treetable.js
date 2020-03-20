/*
 * 表格用户管理面板
 */
nsList.treeTable = {
	config:{},//数据配置
	data:{},//数据值
};
nsList.treeTable.init = function(dataConfig,columnConfig,uiConfig){
	var tableId = dataConfig.tableID;
	var plusConfig = uiConfig.tree;
	var treeConfig = {
		textField:plusConfig.textField,
		valueField:plusConfig.valueField,
		parentIdField:plusConfig.parentIdField,
		idField:plusConfig.idField,
		childIdField:'children'
	};
	nsList.treeTable.config[tableId] = {
		dataConfig:$.extend(true,{},dataConfig),
		columnConfig:$.extend(true,[],columnConfig),
		uiConfig:$.extend(true,{},uiConfig),
		treeConfig:treeConfig,
	};
	nsTable.init(dataConfig,columnConfig,uiConfig);
	var listAjax = {
		url: 		uiConfig.tree.src,
		data: 		uiConfig.data,
		type: 		'GET',
		dataType: 	'json',
		plusData: 	{tableId:tableId,config:uiConfig.tree}
	}
	nsVals.ajax(listAjax,function(res,plusObj){
		var tableId = plusObj.plusData.tableId;
		var plusConfig = plusObj.plusData.config;
		var originalData = res[plusConfig.dataSrc];
		var data = $.extend(true,[],originalData);
		var treeConfig = {
			textField:plusConfig.textField,
			valueField:plusConfig.valueField,
			parentIdField:plusConfig.parentIdField,
			idField:plusConfig.idField,
			childIdField:'children'
		}
		var listDataArray = nsDataFormat.getTreeDataByRows(data,treeConfig);
		var treeKeyValueData = {};
		var treeParentKeyValueData = {};
		for(var dataI=0; dataI<originalData.length; dataI++){
			var cJson = $.extend(true,{},originalData[dataI]);
			treeKeyValueData[cJson[treeConfig.idField]] = cJson;
		}
		nsList.treeTable.data[tableId] = {
			listData:originalData,
			treeData:listDataArray,
			treeKeyValueData:treeKeyValueData,
		}
		refreshTableData(tableId);
	});
	function refreshTableData(tableId){
		var data = nsList.treeTable.data[tableId];
		var treeData = data.treeData;
		var treeKeyValueData = $.extend(true,{},data.treeKeyValueData);
		var treeConfig = nsList.treeTable.config[tableId].treeConfig;
		var currentDataArray = [];
		for(var dataI=0; dataI<treeData.length; dataI++){
			var data = $.extend(true,{},treeKeyValueData[treeData[dataI][treeConfig.idField]]);
			currentDataArray.push(data);
		}
		baseDataTable.originalConfig[tableId].dataConfig.dataSource = currentDataArray;
		baseDataTable.refreshByID(tableId);
	}
}