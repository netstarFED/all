var checkCookie = function(typeJsonData){
	//isSetDefault是否是设置默认读取 true
	//isSave是否保存cookie false
	//isSavePassword是否保存密码 false
	//isDirectLogin是否直接登录 false
	//password,username,remember读取的id----用户名，密码，选择
	var isSetDefault = typeof(typeJsonData.isSetDefault) == 'boolean' ? typeJsonData.isSetDefault : true;
	var isSave = typeof(typeJsonData.isSave) == 'boolean' ? typeJsonData.isSave : false;
	var isSavePassword = typeof(typeJsonData.isSavePassword) == 'boolean' ? typeJsonData.isSavePassword : false;
	var isDirectLogin = typeof(typeJsonData.isDirectLogin) == 'boolean' ? typeJsonData.isDirectLogin : false;
	if(isSave){
		isSetDefault = false;
	}
	if(isSave || isSetDefault){
		if(typeof(typeJsonData.username) != "string" || $("#"+typeJsonData.username).length != 1){
			// alert("没有找到--用户名id");
		}
		if(typeof(typeJsonData.remember) != "string" || $("#"+typeJsonData.remember).length != 1){
			// alert("没有找到默认--记住id");
		}
		if(isSavePassword){
			if(typeof(typeJsonData.password) != "string" || $("#"+typeJsonData.password).length != 1){
				// alert("没有找到--密码id");
			}
		}
	}
	// if(isDirectLogin){

	// }
	if(isSetDefault){
		var username=$.cookie("username");
		if (username){
			if(typeof(typeJsonData.remember) == "string"){
				$("#"+typeJsonData.remember).attr("checked","checked");
			}
			// $("#"+typeJsonData.remember).attr("checked","checked");
			$("#"+typeJsonData.username).val(username);
			if(isSavePassword){
				var password=$.cookie("password");
				if(password){
					$("#"+typeJsonData.password).val(password);
					if(isDirectLogin){
						login_submit();
					}
				}
			}
		}
	}else{
		if($("#"+typeJsonData.remember).is(':checked')){
		// if(isSave){
			var user = $("#"+typeJsonData.username).val();
			if (user!="" && user!=null){
				$.cookie("username",user, { expires: 7 });
			}
			if(isSavePassword){
				var pass = $("#"+typeJsonData.password).val();
				if (pass!="" && pass!=null){
					$.cookie("password",pass, { expires: 7 });
				}
			}
		}else{
			$.cookie("username", "");
			$.cookie("password", "");
		}

	}
}
var NSAJAXERRORINFO = {
	200:'返回数据成功，很可能是返回格式错误',
	400:'HTTP 400 – 请求无效',
	401.1:'HTTP 401.1 – 未授权：登录失败',
	401.2:'HTTP 401.2 – 未授权：服务器配置问题导致登录失败',
	401.3:'HTTP 401.3 – ACL 禁止访问资源',
	401.4:'HTTP 401.4 – 未授权：授权被筛选器拒绝',
	401.5:'HTTP 401.5 – 未授权：ISAPI 或 CGI 授权失败',
	403:'HTTP 403 – 对 Internet 服务管理器 的访问仅限于 Localhost',
	403.1:'HTTP 403.1 禁止访问：禁止可执行访问',
	403.2:'HTTP 403.2 – 禁止访问：禁止读访问',
	403.3:'HTTP 403.3 – 禁止访问：禁止写访问',
	403.4:'HTTP 403.4 – 禁止访问：要求 SSL',
	403.5:'HTTP 403.5 – 禁止访问：要求 SSL 128',
	403.6:'HTTP 403.6 – 禁止访问：IP 地址被拒绝',
	403.7:'HTTP 403.7 – 禁止访问：要求客户证书',
	403.8:'HTTP 403.8 – 禁止访问：禁止站点访问',
	403.9:'HTTP 403.9 – 禁止访问：连接的用户过多',
	403.10:'HTTP 403.10 – 禁止访问：配置无效',
	403.11:'HTTP 403.11 – 禁止访问：密码更改',
	403.12:'HTTP 403.12 – 禁止访问：映射器拒绝访问',
	403.13:'HTTP 403.13 – 禁止访问：客户证书已被吊销',
	403.15:'HTTP 403.15 – 禁止访问：客户访问许可过多',
	403.16:'HTTP 403.16 – 禁止访问：客户证书不可信或者无效',
	403.17:'HTTP 403.17 – 禁止访问：客户证书已经到期或者尚未生效 HTTP',
	404:'HTTP 404- 无法找到文件',
	405:'HTTP 405 – 资源被禁止',
	406:'HTTP 406 – 无法接受',
	407:'HTTP 407 – 要求代理身份验证',
	410:'HTTP 410 – 永远不可用',
	412:'HTTP 412 – 先决条件失败',
	414:'HTTP 414 – 请求 – URI 太长',
	500:'HTTP 500 – 内部服务器错误',
	500.100:'HTTP 500.100 – 内部服务器错误 – ASP 错误',
	500.12:'HTTP 500-12 应用程序重新启动',
	500.13:'HTTP 500-13 – 服务器太忙',
	500.14:'HTTP 500-14 – 应用程序无效',
	500.15:'HTTP 500-15 – 不允许请求 global.asa',
	501:'Error 501 – 未实现',
	502:'HTTP 502 – 网关错误'
}