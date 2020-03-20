var sale = {};
sale.sale = {};
sale.sale.input = {};
sale.sale.input.invoiceKindRate = 0;
//发票类型
var invoiceKindArr = [
	{
		invoiceKindId:"0",
		invoiceKindName:"普通发票",
		invoiceKindRate:0,
	},{
		invoiceKindId:"1",
		invoiceKindName:"收据",
		invoiceKindRate:6,
	},{
		invoiceKindId:"2",
		invoiceKindName:"增值税发票",
		invoiceKindRate:17,
	}
]
//结算方式
var paymentArr = [
	{
		payId:"0",
		payName:"现金"
	},{
		payId:"1",
		payName:"银行卡"
	},{
		payId:"2",
		payName:"储蓄卡"
	}
]
//部门
var deptArr = [
	{
		deptName: 	'部门A',
		id: 	'0',
		selected:true
	},{
		deptName: 	'部门B',
		id: 	'1',
	},{
		deptName: 	'部门C',
		id: 	'2',
	}
]
//经办人
var operatorArr = [
	{
		operatorName:'小A',
		operatorId:'0',
		deptId:'1'
	},{
		operatorName:'小B',
		operatorId:'1',
		deptId:'1'
	},{
		operatorName:'小C',
		operatorId:'2',
		deptId:'0'
	}
]

//结算工作方式
var settlementWayArr = [
	{
		settlementId:'0',
		settlementName:'出库',
		isChecked:true
	},{
		settlementId:'1',
		settlementName:'开票',
		isChecked:true
	},{
		settlementId:'2',
		settlementName:'收款',
		isChecked:true
	}
]
/*********部门经办人联动 start*******************/
function changeDeptHandler(formID,id){
	var newOperatorArr = changeAssociateHandler(id);
	var editSelectJson = [
		{
			id:"operatorId",
			subdata:newOperatorArr
		}
	]
	formPlane.edit(editSelectJson,formID);
}
function changeAssociateHandler(value){
	var selectID = '';
	if(typeof(value) == 'undefined'){	
		for(var deptId in deptArr){
			if(deptArr[deptId].selected){
				selectID = deptArr[deptId].id;
			}
		}
	}else{
		selectID = value;
	}
	var operatorSelArr = [];
	for(var operaId in operatorArr){
		if(operatorArr[operaId].deptId == selectID){
			operatorSelArr.push(operatorArr[operaId]);
		}
	} 
	return operatorSelArr;
}
/*********部门经办人联动 end*******************/