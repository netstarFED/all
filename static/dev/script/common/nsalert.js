toastr.options = {
  "closeButton": true,
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

	//语言包 如果存在整体配置且可用，则读取整体语言包
	var I18n = {
		zh:{
			cancel: "取消",
			complete: "完成",
			determine: "确定",
			deyk: "有误",
			error: "错误",
			fail: "失败",
			prohibit: "禁止",
			prompt: "提示",
			remind: "提醒",
			success: "成功",
			unable: "无法",
			warning: "警告",
		},
		en:{
			cancel: "cancel",
			complete: "complete",
			determine: "confirm",
			deyk: "has error",
			error: "error",
			fail: "fail",
			prohibit: "prohibit",
			prompt: "prompt",
			remind: "remind",
			success: "success",
			unable: "unable",
			warning: "warning",
		}
	}
	var i18n = {};
	if(typeof(language)=='object'){
		i18n = language.common.nsalert;
	}else{
		//当前用户语言
		var userLang = 'zh';  //只支持zh/en
		if (navigator.userLanguage) {
			userLang = navigator.userLanguage.substring(0,2).toLowerCase();
		}else{
			userLang = navigator.language.substring(0,2).toLowerCase();
		}
		i18n = I18n[userLang];
		
	}
	var icon = '';
	var state = '';
	
	//计算默认值
	if(str.indexOf(i18n.success)>-1||str.indexOf(i18n.complete)>-1){
		icon = '<i class="fa fa-check"></i> ';
		state = 'success';
	}else if(str.indexOf(i18n.fail)>-1||str.indexOf(i18n.error)>-1||str.indexOf("error")>-1||str.indexOf(i18n.deyk)>-1){
		icon = '<i class="fa fa-warning"></i> ';
		state = 'error';
	}else if(str.indexOf(i18n.remind)>-1||str.indexOf(i18n.warning)>-1||str.indexOf(i18n.prompt)>-1||str.indexOf(i18n.unable)>-1||str.indexOf(i18n.prohibit)>-1){
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