/*******登录  start**************/

/**
 * 获取路径
 * 
 * @returns
 */
function getRootPath() {
	var curWwwPath = window.document.location.href;
	var pathName = window.document.location.pathname;
	var pos = curWwwPath.indexOf(pathName);
	var localhostPaht = curWwwPath.substring(0, pos);
	var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
	return (localhostPaht + projectName);
}
function login_submit() {
	var a = $("#username").val();
	var b = $("#password").val();
	if (a && b) {
		$.ajax({
			type : "POST",
			async : false,
			dataType : 'json',
			url : getRootPath() + "/LoginIndex",
			data : {
				login : 1,
				username : a,
				password : b
			},
			success : function(data) {
				if (data.success) {
					window.top.location.href = getRootPath() + "/home";
				} else {
					$("#pwmsg").html(data.pwmsg);
				}
			}
		});
	} else {
		if (!a) {
			$("#pwmsg").html("用户名必填！");
		} else if (!b) {
			$("#pwmsg").html("密码必填！");
		}
	}
}
function bottomHandler(){
  var windowHeight = Number($(window).height());
  if(windowHeight <= 650){
    $("#bottomForm").css({  
      "bottom":"-50px",
      "overflow":"auto",
    });
  }else{
    $("#bottomForm").css({  
      "bottom":"34px",
    });
  }  
}
$(window).resize(function(){
   bottomHandler();
});
$(window).keypress(function(ev){
  if(ev.keyCode == 13){
    //触发回车事件  
    login_submit();
  }
});
/*******登录 end**************/