/*******刘增辉项目 start****************/
//功能：在弹框的时候给表单赋默认值
nsdialog.initValueShow = function(formDialog,json){
	var cloneDialog = $.extend({},formDialog);
	var cloneForm = $.extend(true,[],formDialog.form);
	for(var i=0; i<cloneForm.length; i++){
		var comp = cloneForm[i];
        if($.isArray(comp)){
            for(var j = 0; j < comp.length; j++){
                var c = comp[j];
                if(c.id in json){
                    c.value = json[c.id];
                }
            }
        } else if(comp.id in json){
			comp.value = json[comp.id];
		}
	}
	cloneDialog.form = cloneForm;
	nsdialog.initShow(cloneDialog);
}
/*******刘增辉项目 end****************/