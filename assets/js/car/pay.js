function moreAccountFunc(formID,codeId,payId){
	var configEmpty = {
		id: 	"plane-viewTable",
		title: 	'表格',
		size: 	"b",
		form: 	[
					{
						id: 		'damo-table',
						type: 		'table',
						dataSource:	 null,
						info:false,
						isSingleSelect:true,
						onDoubleSelectHandler: doubleSelectedFunc,
						column: [
							{
								field:'detail_Id',
								title:'操作',
								width:10,
								formatHandler:{
									type:'button',
									data:[
										{'添加':addDamoTableRowFunc},
										{'删除':delDamoTableRowFunc}
									]
								}
							},
							{
								field : 'accountCode',
								title : '账号',
								width : 150,
								formatHandler:{
									type:'select',
									data:
									[
										{
											textField:'name',
											valueField:'id',
											handler:selectAccountCodeFunc,
											subdata:[
												{
													name: 	'现金',
													id: 	'0',
												},
												{
													name: 	'银行卡',
													id: 	'1',
												},
												{
													name: 	'支付宝',
													id: 	'2',
												}
											]
										}
									]
								}
							}, {
								field : 'accountMoney',
								title : '金额',
								width : 185,
								total:true,
								formatHandler:{
									type:'input',
									data:
									[
										{
											handler:accountMoneyFunc
										}
									]
								}
							}, {
								field : 'accountRemark',
								title : '备注',
								width : 185,
								formatHandler:{
									type:'input',
								}
							} 
						],
					}
				],
		btns:[
			{
				text: 		'保存',
				handler: 	saveAccountDamoFunc
			}
		]
	}
	popupBox.initShow(configEmpty);
	tableDataHandler('damo-table');
	//保存
	var formID = formID;
	var codeId = codeId;
	var payId = payId;
	function saveAccountDamoFunc(){
		
		popupBox.hide(); //关闭弹框
		var tableID = 'damo-table';
		var accountArrData = baseDataTable.allTableData(tableID);
		var pay = baseDataTable.countTotalJson[tableID];
		var payWay = '';
		var selectID = $('#form-'+formID+'-'+codeId);
		var inputID = $('#form-'+formID+'-'+payId);
		var selectPid = selectID.closest('.form-item.select');
		if(accountArrData.length == 1){
			selectPid.removeClass('hide');
			payWay = accountArrData[0].accountCode;
			selectID.find("option[value='"+payWay+"']").attr("selected","selected");
			var selectText = selectID.find("option[value='"+payWay+"']").text().trim();
			var selectElementID = 'form-'+formID+'-'+codeId+'SelectBoxItText';
			$('#'+selectElementID).text(selectText);
			$('#'+selectElementID).attr('data-val',payWay);
		}else if(accountArrData.length > 1){
			payWay = '多付款方式';
			selectPid.addClass('hide');
			var labelHtml = '<label class="more-label-way">'+payWay+'</label>';
			selectPid.parent().find('.more-label-way').remove();
			selectPid.prev().after(labelHtml);
		}
		var formAccountText = baseDataTable.countTotalJson['damo-table']["accountMoney"];
		inputID.val(formAccountText);
		var returnObj = {};
		returnObj.data = accountArrData;
		returnObj.pay = pay;
		returnObj.payWay = payWay;
		//调用ajax
		saveAjaxFunc(returnObj);
	}	
}
function tableDataHandler(tableID){
	var tableData = baseDataTable.allTableData(tableID);
	if(tableData.length > 0){
		baseDataTable.reloadAddTableAJAX(tableID);
	}else{
		baseDataTable.addTableSingleRow(tableID);
	}
}
//添加行
function addDamoTableRowFunc(returnObj){
	var tableID = returnObj.tableId;
	baseDataTable.addTableSingleRow(tableID);
}
//删除行
function delDamoTableRowFunc(returnObj){
	var tableID = returnObj.tableId;
	var trObj = returnObj.obj.closest('tr');
	baseDataTable.delTableRowData(tableID,trObj);
}
function doubleSelectedFunc(){

}
//select账号事件

var selectedAccountValueArr = [];
var selectedAccountIdArr = [];
function selectAccountCodeFunc(returnObj){
	var currentData = returnObj.rowIndex.data();
	var selectBoxItObj = returnObj.obj;
	var selectedAccountID = returnObj.value;
	var currendId = returnObj.id;
	var isHasValue = $.inArray(selectedAccountID,selectedAccountValueArr);
	var isHasID = $.inArray(currendId,selectedAccountIdArr);
	var tempJson = {};
	tempJson.id = currendId;
	tempJson.value = selectedAccountID;
	if(isHasID==-1&&isHasValue==-1){
		selectedAccountIdArr.push(currendId);
		selectedAccountValueArr.push(selectedAccountID);
	}else if(isHasID!=-1&&isHasValue==-1){
		tempJson.id = currendId;
		tempJson.value = selectedAccountID;
		selectedAccountIdArr[isHasID] = currendId;
		selectedAccountValueArr[isHasID] = selectedAccountID;
	}else if(isHasValue!=-1){
		//no
		tempJson.id = currendId;
		tempJson.value = "";
		selectedAccountIdArr[isHasID] = currendId;
		selectedAccountValueArr[isHasID] = "";
	}
	selectBoxItObj.find("option[value='"+tempJson.value+"']").attr("selected","selected");
	var selectElementID = tempJson.id + 'SelectBoxItText';
	var selectElementText = selectBoxItObj.find("option[value='"+tempJson.value+"']").text().trim();
	$('#'+selectElementID).text(selectElementText);
	$('#'+selectElementID).attr('data-val',tempJson.value);
	currentData["accountCode"] = tempJson.value;
}
//金额
function accountMoneyFunc(returnObj){
	var value = returnObj.value;
	var data = returnObj.rowIndex.data();
	var inputObj = returnObj.obj;
	if(isNaN(value)){
		inputObj.val('');
		data["accountMoney"] = 0;
	}else{
		data["accountMoney"] = value;
	}
	baseDataTable.countTotal('damo-table');
}