toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "rtl": false,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": 200,
  "hideDuration": 200,
  "timeOut": 2000,
  "extendedTimeOut": 1000,
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
/***************************************************************************************************
 * nsalert('提示信息','error','plus')
 * 后两项为选填，iconStr参数只能使用fa fa-系列的图标
 * @returns
 */
function nsalert(str,stateStr,iconStr,timer){
	if(typeof(str)!='string'){
		nsalert("nsalert传入参数错误",'error');
		console.error('nsalert传入参数错误:'+str);
		return false;
	};

	var icon = '';
	var state = '';
	
	//计算默认值
	if(str.indexOf(language.common.nsalert.success)>-1||str.indexOf(language.common.nsalert.complete)>-1){
		icon = '<i class="fa fa-check"></i> ';
		state = 'success';
	}else if(str.indexOf(language.common.nsalert.fail)>-1||str.indexOf(language.common.nsalert.error)>-1||str.indexOf("error")>-1||str.indexOf(language.common.nsalert.deyk)>-1){
		icon = '<i class="fa fa-warning"></i> ';
		state = 'error';
	}else if(str.indexOf(language.common.nsalert.remind)>-1||str.indexOf(language.common.nsalert.warning)>-1||str.indexOf(language.common.nsalert.prompt)>-1||str.indexOf(language.common.nsalert.unable)>-1||str.indexOf(language.common.nsalert.prohibit)>-1){
		icon = '<i class="fa fa-warning"></i> ';
		state = 'warning';
	}
	//有iconStr参数
	if(typeof(iconStr) != 'undefined'){
		icon = '<i class="fa fa-'+iconStr+'"></i> ';
	}
	//有stateStr参数
	if(typeof(stateStr) != 'undefined'){
		state = stateStr;
	}
	if(state==''){
		state = 'info';
	}

	var tempTimer = 2000;
	if(icon==''){
		if(state == "error"||state == "warning"){
			icon = '<i class="fa fa-warning"></i> ';
			tempTimer = 5000;
		}else if(state == "success"){
			icon = '<i class="fa fa-check"></i> ';
		}else if(state == "info"){
			icon = '<i class="fa fa-comment"></i> ';
		}
	}
	var alertStr = icon+str;
	if(timer){
		tempTimer = timer;
	}
	toastr.options.timeOut = tempTimer;
	toastr.options.extendedTimeOut = 1000;
	
	switch(state){
		case "success":
			toastr.success(alertStr);
			break;
		case "info":
			toastr.info(alertStr);
			break;
		case "warning":
			toastr.warning(alertStr);
			break;
		case "error":
			toastr.error(alertStr);
			break;
	}
}
var nsAlert = nsalert;