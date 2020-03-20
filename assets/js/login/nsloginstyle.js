/***************************************************************************************************
 * nsLoginStyle 配置登录样式
 * @returns true/false
 */
nsLoginStyle = {
	style: {
		//登录框是否带阴影
		shadow: [
			'bg-shadow'
		],
		//登录框标题字体和边框颜色
		titleStyle: [
			'title-dark',
			'title-light'
		],
		//登录框背景透明度
		opacity: [
			'bg-dark-opacity-1',
			'bg-dark-opacity-2',
			'bg-dark-opacity-3',
			'bg-dark-opacity-4',
			'bg-dark-opacity-5',
			'bg-dark-opacity-6',
			'bg-dark-opacity-7',
			'bg-dark-opacity-8',
			'bg-dark-opacity-9',
			'bg-dark-opacity-10',
			'bg-light-opacity-1',
			'bg-light-opacity-2',
			'bg-light-opacity-3',
			'bg-light-opacity-4',
			'bg-light-opacity-5',
			'bg-light-opacity-6',
			'bg-light-opacity-7',
			'bg-light-opacity-8',
			'bg-light-opacity-9',
			'bg-light-opacity-10'
		],
		//登录框边框透明度
		borderOpacity: [
			'border-dark-opacity-1',
			'border-dark-opacity-2',
			'border-dark-opacity-3',
			'border-dark-opacity-4',
			'border-dark-opacity-5',
			'border-dark-opacity-6',
			'border-dark-opacity-7',
			'border-dark-opacity-8',
			'border-dark-opacity-9',
			'border-dark-opacity-10',
			'border-light-opacity-1',
			'border-light-opacity-2',
			'border-light-opacity-3',
			'border-light-opacity-4',
			'border-light-opacity-5',
			'border-light-opacity-6',
			'border-light-opacity-7',
			'border-light-opacity-8',
			'border-light-opacity-9',
			'border-light-opacity-10'
		],
		//登录框布局
		position: [
			'common-top-right', //右侧
			'flattening-middle' //中间
		],
		//logo图背景透明度
		logoOpacity: [
			'bg-dark-opacity-1',
			'bg-dark-opacity-2',
			'bg-dark-opacity-3',
			'bg-dark-opacity-4',
			'bg-dark-opacity-5',
			'bg-dark-opacity-6',
			'bg-dark-opacity-7',
			'bg-dark-opacity-8',
			'bg-dark-opacity-9',
			'bg-dark-opacity-10',
			'bg-light-opacity-1',
			'bg-light-opacity-2',
			'bg-light-opacity-3',
			'bg-light-opacity-4',
			'bg-light-opacity-5',
			'bg-light-opacity-6',
			'bg-light-opacity-7',
			'bg-light-opacity-8',
			'bg-light-opacity-9',
			'bg-light-opacity-10'
		],
		//input框背景透明度
		inputOpacity: [
			'bg-dark-opacity-1',
			'bg-dark-opacity-2',
			'bg-dark-opacity-3',
			'bg-dark-opacity-4',
			'bg-dark-opacity-5',
			'bg-dark-opacity-6',
			'bg-dark-opacity-7',
			'bg-dark-opacity-8',
			'bg-dark-opacity-9',
			'bg-dark-opacity-10',
			'bg-light-opacity-1',
			'bg-light-opacity-2',
			'bg-light-opacity-3',
			'bg-light-opacity-4',
			'bg-light-opacity-5',
			'bg-light-opacity-6',
			'bg-light-opacity-7',
			'bg-light-opacity-8',
			'bg-light-opacity-9',
			'bg-light-opacity-10'
		],
		//input框边框透明度
		inputBorderOpacity: [
			'border-dark-opacity-1',
			'border-dark-opacity-2',
			'border-dark-opacity-3',
			'border-dark-opacity-4',
			'border-dark-opacity-5',
			'border-dark-opacity-6',
			'border-dark-opacity-7',
			'border-dark-opacity-8',
			'border-dark-opacity-9',
			'border-dark-opacity-10',
			'border-light-opacity-1',
			'border-light-opacity-2',
			'border-light-opacity-3',
			'border-light-opacity-4',
			'border-light-opacity-5',
			'border-light-opacity-6',
			'border-light-opacity-7',
			'border-light-opacity-8',
			'border-light-opacity-9',
			'border-light-opacity-10'
		],
		//input边框圆角程度
		inputRadius: [
			'border-radius-none', //直角
			'border-radius-slight', //轻微圆角
			'border-radius-moderate', //稍重圆角
			'border-radius-severe' //重度圆角
		],
		//input框背景色，会导致字体颜色跟着变化
		inputBgColor: [
			'from-dark',
			'from-light'
		],
		//登录按钮圆角程度
		loginBtnRadius: [
			'border-radius-none', //直角
			'border-radius-slight', //轻微圆角
			'border-radius-moderate', //稍重圆角
			'border-radius-severe' //重度圆角
		],
		//登录按钮颜色，不填则默认蓝色，
		loginBtnColor: [
			'loginbtn-red', //红色
			'loginbtn-green', //绿色
			'loginbtn-blue', //蓝色
			'loginbtn-orange' //橙色
		]
	}
}

nsLoginStyle.init = function(configObj) {

	//设置默认参数
	var config = nsLoginStyle.setDefault(configObj);
	nsLoginStyle.config = config;

	var html = nsLoginStyle.getHtml();
	if ($('#' + config.id).length > 0) {
		$('#' + config.id).remove();
	}
	$('body').append(html);

	if (typeof(config.loginHandler) == 'function') {
		//注册回车事件
		$(window).keypress(function(ev) {
			if (ev.keyCode == 13) {
				nsLoginStyle.login();
			}
		});
	}
}
//设置默认参数
nsLoginStyle.setDefault = function(config) {
	//保留原始配置
	nsLoginStyle.originalConfig = $.extend(true, {}, config);

	//登录页div的id
	config.id = 'nsLoginStyle-loginDiv';
	//用户名框id
	config.userNameId = 'nsLoginStyle-loginDiv-username';
	//密码框id
	config.pwdId = 'nsLoginStyle-loginDiv-pwd';
	//错误提示id
	config.msgId = 'nsLoginStyle-loginDiv-msg';

	var rootPath = nsLoginStyle.getRootPath();

	//背景图
	config.bgImgUrl = typeDefVal(config.bgImgUrl, 'string', rootPath + '/image/login/login-bg.jpg');

	//登录框是否带阴影  样式名:bg-shadow
	config.shadow = typeDefVal(config.shadow, 'string', '');
	//登录框标题
	config.title = typeDefVal(config.title, 'string', '用户登录');
	//登录框标题字体和边框颜色 title-dark/title-light
	config.titleStyle = typeDefVal(config.titleStyle, 'string', '');
	//登录框背景透明度，分为1-10个级别bg-dark-opacity-1/bg-light-opacity-1
	config.opacity = typeDefVal(config.opacity, 'string', '');
	//登录框边框透明度，分为1-10个级别border-light-opacity-1/border-dark-opacity-1
	config.borderOpacity = typeDefVal(config.borderOpacity, 'string', '');
	//登录框右侧和中间布局；默认右侧 common-top-right/flattening-middle
	config.position = typeDefVal(config.position, 'string', 'common-top-right');
	//登录框距左 PS:中间布局不允许配置距左位置（样式中默认为50%）
	if (config.position == 'flattening-middle') {
		config.left = '';
	} else {
		config.left = typeDefVal(config.left, 'string', '75%');
	}

	//logo图
	config.logoImgSrc = typeDefVal(config.logoImgSrc, 'string', rootPath + '/image/login/logo.png');
	//logo图背景透明度，分为1-10个级别bg-dark-opacity-1/bg-light-opacity-1
	config.logoOpacity = typeDefVal(config.logoOpacity, 'string', '');

	//input框背景透明度，分为1-10个级别bg-dark-opacity-1/bg-light-opacity-1
	config.inputOpacity = typeDefVal(config.inputOpacity, 'string', '');
	//input框边框透明度，分为1-10个级别border-light-opacity-1/border-dark-opacity-1
	config.inputBorderOpacity = typeDefVal(config.inputBorderOpacity, 'string', '');
	//input边框圆角程度，直角border-radius-none、轻微圆角border-radius-slight、稍重圆角border-radius-moderate、重度圆角border-radius-severe
	config.inputRadius = typeDefVal(config.inputRadius, 'string', '');
	//input框背景色，会导致字体颜色跟着变化，from-dark,from-light
	config.inputBgColor = typeDefVal(config.inputBgColor, 'string', 'from-light');

	//登录按钮显示文本，未填则默认登录
	config.loginBtnText = typeDefVal(config.loginBtnText, 'string', '登 录');
	//登录按钮圆角程度，若未填则同input框圆角程度，一般不需设置此属性。直角border-radius-none、轻微圆角border-radius-slight、稍重圆角border-radius-moderate、重度圆角border-radius-severe
	config.loginBtnRadius = typeDefVal(config.loginBtnRadius, 'string', config.inputRadius);
	//登录按钮颜色，不填则默认蓝色，loginbtn-red,loginbtn-green,loginbtn-blue,loginbtn-orange
	config.loginBtnColor = typeDefVal(config.loginBtnColor, 'string', 'loginbtn-blue');
	//登录按钮handler
	//config.loginHandler = function(){}

	//个人定义按钮组，格式如下：
	/*config.selfBtns = [{
		id : '',
		text : '',
		handler : function(){
		}
	},{
		id : '',
		text : '',
		handler : function(){

		}		
	}];*/
	config.selfBtns = $.isArray(config.selfBtns) ? config.selfBtns : [];

	//设置类型默认值
	function typeDefVal(val, strType, defVal) {
		return typeof(val) == strType ? val : defVal;
	}
	return config;
}
//获取html
nsLoginStyle.getHtml = function(){
	var config = nsLoginStyle.config;
	//登录框距左
	var leftStyle = '';
	if(config.left.length>0){
		leftStyle = 'style="left:' + config.left + '"';
	}

	var inputClass = config.inputRadius + ' ' + config.inputOpacity + ' ' + config.inputBorderOpacity;
	var loginBtnClass = config.loginBtnColor + ' ' + config.loginBtnRadius;
	var selfBtnsHtml = getSelfBtnsHtml(config.selfBtns);
	var html = '<div id="' + config.id + '" class="page-login ' + config.position + '" style="background-image:url(' + config.bgImgUrl + ')">' +
					'<div class="logo ' + config.logoOpacity + '">' +
						'<img src="' + config.logoImgSrc + '" alt=""/>' +
					'</div>' +
					'<div class="login ' + config.shadow + ' ' + config.opacity + ' ' + config.borderOpacity + '" ' + leftStyle + '>' +
						'<div class="title ' + config.titleStyle + '">' +
				    		config.title +
				        '</div>' +
					    '<div class="group-from ' + config.inputBgColor + '">' +
					        '<input class="' + inputClass + '" type="text" id="' + config.userNameId + '" placeholder="请输入您的用户名" />' +
					        '<span class="fa fa-user"></span>' +
					    '</div>' +
					    '<div class="group-from ' + config.inputBgColor + '">' +
					        '<input class="' + inputClass + '" type="password" id="' + config.pwdId + '" placeholder="请输入您的密码">' +
					        '<span class="fa fa-lock"></span>' +
					        '<div class="cue hide" id="' + config.msgId + '">您输入的密码错误</div>' +
					    '</div>' +
				        '<div class="loginbtn ' + loginBtnClass + '">' +
					        '<a href="javascript:nsLoginStyle.login();" id="loginBtn">' + config.loginBtnText + '</a>' +
					    '</div>' +
					    selfBtnsHtml +
					'</div>' +
					'<div id="bottomForm "class="bottom">Copyright 2016 ALL Rights Reserved 网星软件</div>'+
				'</div>';
	function getSelfBtnsHtml(btns) {
		var btnHtml = '';
		if (btns.length > 0) {
			var id = config.id + '-btns';
			btnHtml = '<div id="' + id + '" class="pt">';
			for (var i = 0; i < btns.length; i++) {
				var btnId = typeof(btns[i].id) == 'string' ? btns[i].id : (id + '-' + Math.floor(Math.random() * 10000000000 + 1));
				var btnText = typeof(btns[i].text) == 'string' ? btns[i].text : '';
				if (i > 0) {
					btnHtml += '&nbsp; &nbsp;';
				}
				btnHtml += '<a href="javascript:void(0);" onclick="nsLoginStyle.selfBtnOnClick(' + i + ')" id="' + btnId + '">' + btnText + '</a>';
			}
			btnHtml += '</div>';
		}
		return btnHtml;
	}
	return html;
}
//个人按钮点击事件
nsLoginStyle.selfBtnOnClick = function(nsIndex) {
	if (typeof(nsIndex) == 'number' && nsIndex >= 0 && nsIndex < nsLoginStyle.config.selfBtns.length) {
		if (typeof(nsLoginStyle.config.selfBtns[nsIndex].handler) == 'function') {
			nsLoginStyle.config.selfBtns[nsIndex].handler();
		}
	}
}
//登录方法
nsLoginStyle.login = function() {
	if (typeof(nsLoginStyle.config.loginHandler) == 'function') {
		nsLoginStyle.config.loginHandler();
	}
}
//获取表单数据
nsLoginStyle.getFormJson = function(name) {
	if (typeof(name) == 'string') {
		var val = '';
		switch (name) {
			case 'username':
				val = $("#" + nsLoginStyle.config.userNameId).val();
				break;
			case 'password':
				val = $("#" + nsLoginStyle.config.pwdId).val();
				break;
			default:
				console.log('name值传入错误，请填写username/password');
				break;
		}
		return val;
	} else {
		var obj = {
			username: $("#" + nsLoginStyle.config.userNameId).val(),
			password: $("#" + nsLoginStyle.config.pwdId).val()
		}
		return obj;
	}
}
//设置登录用户名数据
nsLoginStyle.setFormJson = function(name, value) {
	if (typeof(name) == 'string') {
		value = typeof(value) == 'string' ? value : '';
		switch (name) {
			case 'username':
				$("#" + nsLoginStyle.config.userNameId).val(value);
				break;
			case 'password':
				$("#" + nsLoginStyle.config.pwdId).val(value);
				break;
			default:
				console.log('name值传入错误，请填写username/password');
				break;
		}
	} else if (typeof(name) == 'object') {
		$("#" + nsLoginStyle.config.userNameId).val(name.username);
		$("#" + nsLoginStyle.config.pwdId).val(name.password);
	} else {
		console.log('参数错误：需传入object或两个string（username/password，value值）');
	}
}

//设置错误信息
nsLoginStyle.setErrorMsg = function(msg) {
	msg = typeof(msg) == 'string' ? msg : '';
	$("#" + nsLoginStyle.config.msgId).html(msg);
	nsLoginStyle.setErrorVisible(msg.length > 0);
}
//设置错误信息显示或隐藏
nsLoginStyle.setErrorVisible = function(visible) {
	if (visible) {
		$("#" + nsLoginStyle.config.msgId).removeClass('hide');
	} else {
		$("#" + nsLoginStyle.config.msgId).addClass('hide');
	}
}
//获取根目录
nsLoginStyle.getRootPath = function() {
	var curWwwPath = window.document.location.href;
	var pathName = window.document.location.pathname;
	var pos = curWwwPath.indexOf(pathName);
	var localhostPaht = curWwwPath.substring(0, pos);
	var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
	return (localhostPaht + projectName);
}
//获取指定样式表
nsLoginStyle.getStyle = function(key) {
	key = typeof(key) == 'string' ? key : '';
	return nsLoginStyle.style[key];
}