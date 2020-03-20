/***table表格计算**/
var wareHouseArr = [
	{
		name: 	'石家庄总库',
		id: 	'0',
		selected:true,
	},
	{
		name: 	'郑州库',
		id: 	'1',
	},
	{
		name: 	'天津库',
		id: 	'2',
	},{
		name: 	'北京库',
		id: 	'3',
	},{
		name: 	'杭州库',
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
             
/**
*功能：根据当前改变的值来计算其他数值
*参数：表id,改变的字段id,当前行的数据
**/
countNumberJson.formatHandler.countRowTotal = function(tableID,chargeField,data){
	var countJson = {};
	countJson.notRatePrice = 0;
	countJson.ratePrice = 0;
	countJson.rateMoney = 0;
	countJson.notRateMoney = 0;
	countJson.rateQuota = 0;
	countJson.ratePercent = 0;
	countJson.num = 0;
	switch(chargeField){
		case "num":
			countJson.num = Number(data[chargeField]);
			countJson.notRatePrice = Number(data["notRatePrice"]);//不变的值
			countJson.ratePercent = Number(data["ratePercent"]);//不变的值
			var tempNumber = Number(parseFloat(countJson.ratePercent/100).toFixed(3))+1;
			countJson.ratePrice = countJson.notRatePrice * tempNumber;
			break;
		case "ratePrice":
			countJson.ratePrice = Number(data[chargeField]);
			countJson.num = Number(data["num"]);//不变的值
			countJson.ratePercent = Number(data["ratePercent"]);//不变的值
			var tempNumber = Number(parseFloat(countJson.ratePercent/100).toFixed(3))+1;
			countJson.notRatePrice = countJson.ratePrice / tempNumber;
			break;
		case "notRatePrice":
			countJson.notRatePrice = Number(data[chargeField]);
			countJson.num = Number(data["num"]);//不变的值
			countJson.ratePercent = Number(data["ratePercent"]);//不变的值
			var tempNumber = Number(parseFloat(countJson.ratePercent/100).toFixed(3))+1;
			countJson.ratePrice = countJson.notRatePrice * tempNumber;
			break;
		case "ratePercent":
			countJson.ratePercent = Number(data[chargeField]);
			countJson.num = Number(data["num"]);
			countJson.ratePrice = Number(data["ratePrice"]);
			var tempNumber = Number(parseFloat(countJson.ratePercent/100).toFixed(3))+1;
			countJson.notRatePrice = countJson.ratePrice / tempNumber;
			break;
	}
	countJson.ratePrice = parseFloat(countJson.ratePrice).toFixed(3);
	countJson.notRatePrice = parseFloat(countJson.notRatePrice).toFixed(3);
	countJson.rateMoney = countJson.ratePrice * countJson.num;
	countJson.notRateMoney = countJson.notRatePrice * countJson.num; 
	countJson.rateQuota = countJson.rateMoney - countJson.notRateMoney;
	countJson.notRateMoney = parseFloat(countJson.notRateMoney).toFixed(3);
	countJson.rateMoney = parseFloat(countJson.rateMoney).toFixed(3);
	countJson.rateQuota = parseFloat(countJson.rateQuota).toFixed(3);
	countNumberJson.formatHandler.countRowFill(tableID,countJson);
	countNumberJson.countTotal(tableID);
}
/**
*功能：根据算到的值来填充相应的节点内容数据
*参数：表id,重新计算之后的json数据
**/
countNumberJson.formatHandler.countRowFill = function(tableID,countJson){
	var $trObj = countNumberJson[tableID].field;
	var currentTrIndex = Number(baseDataTable.table[tableID].row($trObj).index());
	var allArr = baseDataTable.table[tableID].data();
	allArr[currentTrIndex]["num"] = countJson.num;
	allArr[currentTrIndex]["ratePrice"] = countJson.ratePrice;
	allArr[currentTrIndex]["notRatePrice"] = countJson.notRatePrice;
	allArr[currentTrIndex]["rateMoney"] = countJson.rateMoney;
	allArr[currentTrIndex]["notRateMoney"] = countJson.notRateMoney;
	allArr[currentTrIndex]["ratePercent"] = countJson.ratePercent;
	allArr[currentTrIndex]["rateQuota"] = countJson.rateQuota;

	var getAllColumnData = countNumberJson.getAllColumnIndex(tableID);
	$trObj.children('td:eq("'+getAllColumnData["num"]+'")').find('input').val(countJson.num);
	$trObj.children('td:eq("'+getAllColumnData["ratePrice"]+'")').find('input').val(countJson.ratePrice);
	$trObj.children('td:eq("'+getAllColumnData["rateMoney"]+'")').html(countJson.rateMoney);
	$trObj.children('td:eq("'+getAllColumnData["notRatePrice"]+'")').find('input').val(countJson.notRatePrice);
	$trObj.children('td:eq("'+getAllColumnData["notRateMoney"]+'")').html(countJson.notRateMoney);
	$trObj.children('td:eq("'+getAllColumnData["ratePercent"]+'")').find('input').val(countJson.ratePercent);
	$trObj.children('td:eq("'+getAllColumnData["rateQuota"]+'")').html(countJson.rateQuota);
}
/**
*功能：table表格的仓库改变事件触发
*参数：表id,重新计算之后的json数据
**/
countNumberJson.formatHandler.tableWareHouseChange = function(data,value,text,trObj){
	data["warehouseId"] = value;
	var allArr = baseDataTable.table['calculation-table'].data();
	var currentTrIndex = Number(baseDataTable.table['calculation-table'].row(trObj).index());
	allArr[currentTrIndex]["warehouseId"] = data["warehouseId"];
	var locationSelArr = [];
	for(var location in locationArr){
		if(locationArr[location].warehouseId == value){
			locationSelArr.push(locationArr[location]);
		}
	}
	var tableID = trObj.closest('table').attr('id');
	countNumberJson.formatHandler.commonLocationChange(tableID,trObj,locationSelArr);
}
/**
*功能：根据仓库id的值来改变货位
**/
countNumberJson.formatHandler.commonLocationChange = function(tableID,trObj,locationSelArr){
	var getAllColumnData = countNumberJson.getAllColumnIndex(tableID);
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
countNumberJson.formatHandler.countRateChange = function(tableID,ratePercent){
	var allArr = baseDataTable.table[tableID].data();
	var getAllColumnData = countNumberJson.getAllColumnIndex(tableID);
	if(allArr.length <= 0){return;}
	var $trObj = baseDataTable.container[tableID].trObj;
	$trObj.each(function(key,value){
		var ratePrice = Number($(this).children('td:eq("'+getAllColumnData["ratePrice"]+'")').find('input').val().trim());
		var tempNumber = Number(parseFloat(ratePercent/100).toFixed(3))+1;
		var notRatePrice = ratePrice / tempNumber;
		notRatePrice = parseFloat(notRatePrice).toFixed(3);
		var num = Number($(this).children('td:eq("'+getAllColumnData["num"]+'")').find('input').val().trim());
		var notRateMoney = parseFloat(notRatePrice * num).toFixed(3);
		$(this).children('td:eq("'+getAllColumnData["notRatePrice"]+'")').find('input').val(notRatePrice);
		$(this).children('td:eq("'+getAllColumnData["notRateMoney"]+'")').html(notRateMoney);
		$(this).children('td:eq("'+getAllColumnData["ratePercent"]+'")').find('input').val(ratePercent);
	});
	for(var rate = 0; rate < allArr.length; rate ++){
		allArr[rate]["ratePercent"] = ratePercent;
		var tempNumber = Number(parseFloat(ratePercent/100).toFixed(3))+1;
		allArr[rate]["notRatePrice"] = Number(allArr[rate]["ratePrice"]) / tempNumber;
		allArr[rate]["notRatePrice"] = parseFloat(allArr[rate]["notRatePrice"]).toFixed(3);
		allArr[rate]["notRateMoney"] = allArr[rate]["notRatePrice"] * Number(allArr[rate]["num"]);
		allArr[rate]["notRateMoney"] = parseFloat(allArr[rate]["notRateMoney"]).toFixed(3);
	}
	countNumberJson.countTotal(tableID);
}
/**
*功能：通过改变仓库值来得到货位显示对应值
*参数： 仓库默认值，可不传
*/
countNumberJson.formatHandler.getLocationData = function(value){
	var selectID = '';
	if(typeof(value) == 'undefined'){	
		for(var war in wareHouseArr){
			if(wareHouseArr[war].selected){
				selectID = wareHouseArr[war].id;
			}
		}
	}else{
		selectID = value;
	}
	countNumberJson.selectedWarehouseId = selectID;
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
	var allArr = baseDataTable.table[tableID].data();
	if(allArr.length <= 0){return;}
	var $trObj = baseDataTable.container[tableID].trObj;
	var getAllColumnData = countNumberJson.getAllColumnIndex(tableID);
	$trObj.each(function(){
		$selectObj = $(this).children('td:eq("'+getAllColumnData["warehouseId"]+'")').find('select');
		$selectObj.find("option[value='"+id+"']").attr("selected","selected");
		var selectElementID = $selectObj.attr('id') + 'SelectBoxItText';
		$selectObj.closest('td').find('#'+selectElementID).text(value);
		$selectObj.closest('td').find('#'+selectElementID).attr('data-val',id);
		var trObj = $(this);
		var locationSelArr = countNumberJson.formatHandler.getLocationData(value);
	});
	for(var rate = 0; rate < allArr.length; rate ++){
		allArr[rate]["warehouseId"] = id;
	}
}