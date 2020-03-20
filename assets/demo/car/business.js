var businessManger = {};//财务管理
businessManger.businessInvoice = {};
businessManger.businessInvoice.input = {};//业务开票界面
businessManger.businessInvoice.input.open = {};//打开业务单据

businessManger.businessReceipt = {};
businessManger.businessReceipt.input = {};//业务收票界面
businessManger.businessReceipt.input.open = {};//打开订单界面
//发票类型
var invoiceArr = [
	{
		invoiceId:'0',
		invoiceType:'普通发票'
	},{
		invoiceId:'1',
		invoiceType:'增值锐发票'
	},{
		invoiceId:'2',
		invoiceType:'收据发票'
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