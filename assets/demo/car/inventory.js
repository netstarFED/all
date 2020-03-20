//调出单命名
var inventory = {};
inventory.transfersapply = {};//调拨申请
inventory.transfersapply.input = {};//调拨申请界面
inventory.transfersapply.pop = {};//打开调拨单界面
inventory.transfersapply.addAccessories = {};//申请添加调拨单配件

inventory.transfersout = {};//调出单
inventory.transfersout.input = {};//调出单界面	
inventory.transfersout.pop = {};//调出单打开界面
inventory.transfersout.import = {};//导入界面

inventory.transfersin = {};//调入单
inventory.transfersin.input = {};//调入单界面
inventory.transfersin.pop = {};//调入单打开界面
//调出经办人
var outOperatorArr = [
	{
		outOperatorId:'0',
		outOperatorName:'小A'
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
//调入货位
var inLocationArr = [
	{
		inLocationId:"0",
		inLocationName:"A货位"
	},{
		inLocationId:"1",
		inLocationName:"B货位"
	},{
		inLocationId:"2",
		inLocationName:"C货位"
	}
]
//调出货位
var outLocationArr = [
	{
		outLocationId:"0",
		outLocationName:"A货位"
	},{
		outLocationId:"1",
		outLocationName:"B货位"
	},{
		outLocationId:"2",
		outLocationName:"C货位"
	}
]
//仓库
var warehouseIdArr = [
	{
		warehouseId:"0",
		warehouseName:"A仓库"
	},{
		warehouseId:"1",
		warehouseName:"B仓库"
	},{
		warehouseId:"2",
		warehouseName:"C仓库"
	}
]
var inWarehouseArr = [
	{
		inWarehouseId:'0',
		inWarehouseName:'仓库1',
		selected:true
	},{
		inWarehouseId:'1',
		inWarehouseName:'仓库2',
	},{
		inWarehouseId:'2',
		inWarehouseName:'仓库3',
	}
];
var outWarehouseArr = [
	{
		outWarehouseId:'0',
		outWarehouseName:'仓库1',
	},{
		outWarehouseId:'1',
		outWarehouseName:'仓库2',
	},{
		outWarehouseId:'2',
		outWarehouseName:'仓库3',
	}
];
//公司
var companyArr = [
	{
		companyId:"0",
		companyName:'A公司'
	},{
		companyId:"1",
		companyName:'B公司'
	},{
		companyId:"2",
		companyName:'C公司'
	}
]
//调出公司
var outCompanyArr = [
	{
		outCompanyCode:"0",
		outCompanyName:"A公司"
	},{
		outCompanyCode:"1",
		outCompanyName:"B公司"
	},{
		outCompanyCode:"2",
		outCompanyName:"C公司"
	}
]
//调入公司
var inCompanyArr = [
	{
		inCompanyCode:"0",
		inCompanyName:"A公司"
	},{
		inCompanyCode:"1",
		inCompanyName:"B公司"
	},{
		inCompanyCode:"2",
		inCompanyName:"C公司"
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