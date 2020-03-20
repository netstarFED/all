/***table表格计算**/
var warehouseArr = [
	{
		warehouseName: 	'石家庄总库',
		id: 	'0',
		selected:true,
	},
	{
		warehouseName: 	'郑州库',
		id: 	'1',
	},
	{
		warehouseName: 	'天津库',
		id: 	'2',
	},{
		warehouseName: 	'北京库',
		id: 	'3',
	},{
		warehouseName: 	'杭州库',
		id: 	'4',
	}
];
var locationArr = [
	{
		locationName: 	'石1w',
		warehouseId: 	'0',
		id: 	 	 	'1'
	},
	{
		locationName: 	'石2w',
		warehouseId: 	'0',
		id: 	 	 	'2'
	},
	{
		locationName: 	'天1库',
		warehouseId: 	'2',
		id: 	 	 	'3'
	},{
		locationName: 	'天2库',
		warehouseId: 	'2',
		id: 	 	 	'4'
	}
];	
function isAppendEmptyRowHandler(tableID){
	var tableData = baseDataTable.allTableData(tableID);
	if(tableData.length == 0){
		baseDataTable.addTableSingleRow(tableID);
	}
}


var countNumberJson = {};
countNumberJson.formatHandler = {};	
/**
*功能：根据当前改变的值来计算其他数值
*参数：表id,改变的字段id,当前行的数据
**/
countNumberJson.formatHandler.countRowTotal = function(returnObj){
	var tableID = returnObj.tableId;
	var colIndex = returnObj.colIndex;
	var dataFieldArr = baseDataTable.getDataFieldIndex(tableID);
	var chargeField = dataFieldArr[colIndex];
	var data = returnObj.rowIndex.data();
	var countJson = {};
	countJson.noTaxPrice = 0;//不含税单价
	countJson.taxPrice = 0;//含税单价
	countJson.taxAmount = 0;//含税金额
	countJson.noTaxAmount = 0;//不含税金额
	countJson.tax = 0;//税额
	countJson.invoiceKindTaxRate = 0;//税率
	countJson.quantity = 0;//数量
	switch(chargeField){
		case "quantity":
			countJson.quantity = Number(returnObj.value);
			countJson.noTaxPrice = Number(data["noTaxPrice"]);//不变的值
			countJson.invoiceKindTaxRate = Number(data["invoiceKindTaxRate"]);//不变的值
			var tempNumber = Number(parseFloat(countJson.invoiceKindTaxRate/100).toFixed(3))+1;
			countJson.taxPrice = countJson.noTaxPrice * tempNumber;
			break;
		case "taxPrice":
			countJson.taxPrice = Number(returnObj.value);
			countJson.quantity = Number(data["quantity"]);//不变的值
			countJson.invoiceKindTaxRate = Number(data["invoiceKindTaxRate"]);//不变的值
			var tempNumber = Number(parseFloat(countJson.invoiceKindTaxRate/100).toFixed(3))+1;
			countJson.noTaxPrice = countJson.taxPrice / tempNumber;
			break;
		case "noTaxPrice":
			countJson.noTaxPrice = Number(returnObj.value);
			countJson.quantity = Number(data["quantity"]);//不变的值
			countJson.invoiceKindTaxRate = Number(data["invoiceKindTaxRate"]);//不变的值
			var tempNumber = Number(parseFloat(countJson.invoiceKindTaxRate/100).toFixed(3))+1;
			countJson.taxPrice = countJson.noTaxPrice * tempNumber;
			break;
		case "invoiceKindTaxRate":
			countJson.invoiceKindTaxRate = Number(returnObj.value);
			countJson.quantity = Number(data["quantity"]);
			countJson.taxPrice = Number(data["taxPrice"]);
			var tempNumber = Number(parseFloat(countJson.invoiceKindTaxRate/100).toFixed(3))+1;
			countJson.noTaxPrice = countJson.taxPrice / tempNumber;
			break;
	}
	countJson.taxPrice = parseFloat(countJson.taxPrice).toFixed(3);
	countJson.noTaxPrice = parseFloat(countJson.noTaxPrice).toFixed(3);
	countJson.taxAmount = countJson.taxPrice * countJson.quantity;
	countJson.noTaxAmount = countJson.noTaxPrice * countJson.quantity; 
	countJson.tax = countJson.taxAmount - countJson.noTaxAmount;
	countJson.noTaxAmount = parseFloat(countJson.noTaxAmount).toFixed(3);
	countJson.taxAmount = parseFloat(countJson.taxAmount).toFixed(3);
	countJson.tax = parseFloat(countJson.tax).toFixed(3);
	countNumberJson.formatHandler.countRowFill(returnObj,countJson);
	baseDataTable.countTotal(tableID);
}
/**
*功能：根据算到的值来填充相应的节点内容数据
*参数：表id,重新计算之后的json数据
**/
countNumberJson.formatHandler.countRowFill = function(returnObj,countJson){
	var tableID = returnObj.tableId;
	var $trObj = returnObj.obj.closest('tr');
	var currentTrIndex = Number(returnObj.rowIndex.index());
	var allArr = baseDataTable.allTableData(tableID);
	allArr[currentTrIndex]["quantity"] = countJson.quantity;
	allArr[currentTrIndex]["taxPrice"] = countJson.taxPrice;
	allArr[currentTrIndex]["noTaxPrice"] = countJson.noTaxPrice;
	allArr[currentTrIndex]["taxAmount"] = countJson.taxAmount;
	allArr[currentTrIndex]["noTaxAmount"] = countJson.noTaxAmount;
	allArr[currentTrIndex]["invoiceKindTaxRate"] = countJson.invoiceKindTaxRate;
	allArr[currentTrIndex]["tax"] = countJson.tax;

	var getAllColumnData = baseDataTable.getAllColumnIndex(tableID);
	$trObj.children('td:eq("'+getAllColumnData["quantity"]+'")').find('input').val(countJson.quantity);
	$trObj.children('td:eq("'+getAllColumnData["taxPrice"]+'")').find('input').val(countJson.taxPrice);
	$trObj.children('td:eq("'+getAllColumnData["taxAmount"]+'")').html(countJson.taxAmount);
	$trObj.children('td:eq("'+getAllColumnData["noTaxPrice"]+'")').find('input').val(countJson.noTaxPrice);
	$trObj.children('td:eq("'+getAllColumnData["noTaxAmount"]+'")').html(countJson.noTaxAmount);
	$trObj.children('td:eq("'+getAllColumnData["invoiceKindTaxRate"]+'")').find('input').val(countJson.invoiceKindTaxRate);
	$trObj.children('td:eq("'+getAllColumnData["tax"]+'")').html(countJson.tax);
}
/**
*功能：table表格的仓库改变事件触发
*参数：表id,重新计算之后的json数据
**/
countNumberJson.formatHandler.tableWareHouseChange = function(returnObj){
	var tableID = returnObj.tableId;
	var allArr = baseDataTable.allTableData(tableID);
	var currentTrIndex = Number(returnObj.rowIndex.index());
	allArr[currentTrIndex]["warehouseId"] = returnObj.value;
	var locationSelArr = [];
	for(var location in locationArr){
		if(locationArr[location].warehouseId == returnObj.value){
			locationSelArr.push(locationArr[location]);
		}
	}
	var trObj = returnObj.obj.closest('tr');
	countNumberJson.formatHandler.commonLocationChange(tableID,trObj,locationSelArr);
}
/**
*功能：根据仓库id的值来改变货位
**/
countNumberJson.formatHandler.commonLocationChange = function(tableID,trObj,locationSelArr){
	var getAllColumnData = baseDataTable.getAllColumnIndex(tableID);
	var tdCellIndex = getAllColumnData["locationId"];
	var selectObj = trObj.children('td:eq("'+tdCellIndex+'")').find('select');
	var selectOptionHtml = '';
	if(locationSelArr.length > 0){
		selectOptionHtml = '<option value="-1">请选择</option>';
		for(var sIndex in locationSelArr){
			var selected = '';
			if(locationSelArr[sIndex].selected){
				selected = 'selected';
			}
			selectOptionHtml += '<option value="'+locationSelArr[sIndex].id+'">'+locationSelArr[sIndex].locationName+'</option>';
		}
		selectObj.empty();
		selectObj.append(selectOptionHtml);
	}else{
		selectOptionHtml = '<option value="-1">请选择</option>';
		selectObj.empty();
		selectObj.append(selectOptionHtml);
	}
	var selectBoxOption = selectObj.selectBoxIt().data("selectBox-selectBoxIt");
	selectBoxOption.refresh();
}
/**
*功能：form表单发票改变重新计算整个表格的值
*参数：表id,税率字段id
**/
countNumberJson.formatHandler.countRateChange = function(tableID,invoiceKindTaxRate){
	var allArr = baseDataTable.allTableData(tableID);
	var getAllColumnData = baseDataTable.getAllColumnIndex(tableID);
	if(allArr.length <= 0){return;}
	var $trObj = baseDataTable.container[tableID].trObj;
	$trObj.each(function(key,value){
		var taxPrice = Number($(this).children('td:eq("'+getAllColumnData["taxPrice"]+'")').find('input').val().trim());
		var tempNumber = Number(parseFloat(invoiceKindTaxRate/100).toFixed(3))+1;
		var noTaxPrice = taxPrice / tempNumber;
		noTaxPrice = parseFloat(noTaxPrice).toFixed(3);
		var num = Number($(this).children('td:eq("'+getAllColumnData["quantity"]+'")').find('input').val().trim());
		var noTaxAmount = parseFloat(noTaxPrice * num).toFixed(3);
		$(this).children('td:eq("'+getAllColumnData["noTaxPrice"]+'")').find('input').val(noTaxPrice);
		$(this).children('td:eq("'+getAllColumnData["noTaxAmount"]+'")').html(noTaxAmount);
		$(this).children('td:eq("'+getAllColumnData["invoiceKindTaxRate"]+'")').find('input').val(invoiceKindTaxRate);
	});
	for(var rate = 0; rate < allArr.length; rate ++){
		allArr[rate]["invoiceKindTaxRate"] = invoiceKindTaxRate;
		var tempNumber = Number(parseFloat(invoiceKindTaxRate/100).toFixed(3))+1;
		allArr[rate]["noTaxPrice"] = Number(allArr[rate]["taxPrice"]) / tempNumber;
		allArr[rate]["noTaxPrice"] = parseFloat(allArr[rate]["noTaxPrice"]).toFixed(3);
		allArr[rate]["noTaxAmount"] = allArr[rate]["noTaxPrice"] * Number(allArr[rate]["quantity"]);
		allArr[rate]["noTaxAmount"] = parseFloat(allArr[rate]["noTaxAmount"]).toFixed(3);
	}
	baseDataTable.countTotal(tableID);
}
/**
*功能：通过改变仓库值来得到货位显示对应值
*参数： 仓库默认值，可不传
*/
countNumberJson.formatHandler.getLocationData = function(value){
	var selectID = '';
	if(typeof(value) == 'undefined'){	
		for(var war in warehouseArr){
			if(warehouseArr[war].selected){
				selectID = warehouseArr[war].id;
			}
		}
	}else{
		selectID = value;
	}
	var locationSelArr = [];
	for(var location in locationArr){
		if(locationArr[location].warehouseId == selectID){
			locationSelArr.push(locationArr[location]);
		}
	} 
	return locationSelArr;
}
/**
*功能：form表单仓库的change事件来改变表格的值
*参数：表id,选中的id和value值
**/
countNumberJson.formatHandler.wareHouseChange = function(tableID,id,value){
	var allArr = baseDataTable.allTableData(tableID);
	if(allArr.length <= 0){return;}
	var $trObj = baseDataTable.container[tableID].trObj;
	var getAllColumnData = baseDataTable.getAllColumnIndex(tableID);
	$trObj.each(function(){
		$selectObj = $(this).children('td:eq("'+getAllColumnData["warehouseId"]+'")').find('select');
		$selectObj.find("option[value='"+id+"']").attr("selected","selected");
		var selectElementID = $selectObj.attr('id') + 'SelectBoxItText';
		$selectObj.closest('td').find('#'+selectElementID).text(value);
		$selectObj.closest('td').find('#'+selectElementID).attr('data-val',id);
		var trObj = $(this);
		var locationSelArr = countNumberJson.formatHandler.getLocationData(id);
		countNumberJson.formatHandler.commonLocationChange(tableID,trObj,locationSelArr);
	});
	for(var rate = 0; rate < allArr.length; rate ++){
		allArr[rate]["warehouseId"] = id;
	}
}