//组件操作简写nsCom 方法完善后单独js
var nsCom = {
	show: 				nsForm.showByID, 			//显示组件
	hide:  				nsForm.hideByID,			//隐藏组件
	edit: 				nsComponent.edit, 			//修改组件
	getConfigByDom: 	nsForm.getDomConfig, 		//通过页面DOM节点获取config
	getConfigById: 		nsForm.getConfigById,		//通过id获取页面节点
	setValues:　			nsFormBase.setValues, 		//批量赋值
	setValue: 			nsComponent.setValue, 		//单独赋值
	editByArray: 		nsComponent.editByArray,	//批量修改组件
}
nsForm.edit = nsCom.editByArray;
nsForm.fillValues = nsCom.setValues;
nsForm.init = nsForm.formInit;
var nsDialog = {
	show: 				nsForm.modalInit,			//显示弹框
	hide: 				nsForm.modalHide,			//关闭弹框	
	data:				nsForm.modalFormJson,		//获取数据
}
popupBox.initShow = nsDialog.show;
popupBox.hide = nsDialog.hide;
popupBox.getFormJson = nsDialog.data;
popupBox.getFormJSON = popupBox.getFormJson;
//$.fn.dataTable.ext.errMode = "none";
