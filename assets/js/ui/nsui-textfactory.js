nsUI.textfactory = {}
//初始化
nsUI.textfactory.init = function (config) {
	// body...
	var arrayConfig = $.extend(true,{},config);
	nsUI.textfactory.arrayConfig = arrayConfig;
	formPlane.formInit(arrayConfig);
	nsUI.textfactory.valid(arrayConfig);
	// 当同时满足存在工厂按钮和错误状态为false两个条件，才开始初始化工厂按钮
	if (nsUI.textfactory.isExsitFactory && (!nsUI.textfactory.isExsitFault)) {
		nsUI.textfactory.initBtns(arrayConfig);
	}
}
//验证
nsUI.textfactory.valid = function (config) {
	var faConfig = config.form;
	// 初始化错误状态为false
	nsUI.textfactory.isExsitFault = false;
	// 是否存在工厂按钮
	nsUI.textfactory.isExsitFactory = 0;
	for (var i = 0; i < faConfig.length; i++) {
		// 当前项是否存在textFactory
		if (faConfig[i].textFactory) {
			// 验证textFactory是否是数组
			if (!isArray(faConfig[i].textFactory)) {
				console.error('按钮配置参数只能是数组！');
				nsUI.textfactory.isExsitFault = true;
			}
			nsUI.textfactory.isExsitFactory++;
		}
	}
	function isArray(o){
		return Object.prototype.toString.call(o)=='[object Array]';
	}
}
//初始化所有按钮
nsUI.textfactory.initBtns = function (config) {
	var faConfig = config.form;
	// 循环初始化按钮
	for (var i = 0; i < faConfig.length; i++) {
		if (faConfig[i].textFactory) {
			nsUI.textfactory.initBtn(faConfig[i], i);
		}
	}
}
//初始化单独按钮
nsUI.textfactory.initBtn = function (currentConfig, index) {
	// body...
	var html = '<button type="button" class="btn btn-info btn-icon" id="form-form-textInput-factoryBtn-'+ index +'" fid="'+index+'"onclick="nsUI.textfactory.togglePanel('+ index +')">'
					+'<i class="fa-keyboard-o"></i>'
				+'</button>'
				// +nsUI.textfactory.initPanel(currentConfig, index);
	var $inputContainer = $('#form-form-textInput-'+ currentConfig.id);
	if ($inputContainer.siblings('div.input-group-btn').length) {
		$inputContainer.siblings('div.input-group-btn').append(html);
	} else {
		html = '<div class="input-group-btn text-btn">'
					+html
				+'</div>';
		$inputContainer.parent().append(html);
	}
	nsUI.textfactory.initPanel(currentConfig, index);
}
//切换显示隐藏
nsUI.textfactory.togglePanel = function (index) {
	var currentConfig = nsUI.textfactory.arrayConfig.form[index];
	var currentPanel = document.getElementById('textfactory-panel-' + index);
	currentPanel.style.display = currentPanel.style.display == "none" ? "block" : "none";
	// $(document).on('click',clickHiddenPlaneHandler);
	// //激活方法
	// function clickHiddenPlaneHandler(ev){
	// 	//点击屏幕无关位置关闭弹框
	// 	//判断当前点击区域是否在指定区域如果没有则移除面板
	// 	if($(ev.target).closest('.organiza-plane').length==0){
	// 		if($(ev.target).closest('.state').length == 0){
	// 			$(document).off('click',clickHiddenPlaneHandler);
	// 			config.$input.parent().children('.organiza-plane').remove();
	// 		}
	// 	};
	// }
	nsUI.textfactory.selectField = document.getElementById('form-form-textInput-'+ currentConfig.id);
}
//初始化显示面板
nsUI.textfactory.initPanel = function (currentConfig, index) {
	// body...
	var html = '';
	for (var i = 0; i < currentConfig.textFactory.length; i++) {
		html += '<span class="factory-tag" onclick="nsUI.textfactory.replace('+index+','+i+')">'+ currentConfig.textFactory[i] +'&nbsp</span>'
	}
	// html = '<div class="btn">'+ html +'</div>';
	//首先创建div
    var descDiv = document.createElement('div');
    document.body.appendChild(descDiv);
    //获取输入框dom元素
    var $jquerytext = $('#form-form-textInput-' + currentConfig.id);
    var text = document.getElementById('form-form-textInput-' + currentConfig.id);
    //计算div的确切位置
    var seatX = $jquerytext.offset().left;//横坐标
    var seatY = $jquerytext.offset().top + text.offsetHeight;//纵坐标
    var inputWidth = $jquerytext.parent().width();
    //给div设置样式，比如大小、位置
    var cssStr = "width:"+inputWidth+"px;left:" + seatX + 'px;top:' + seatY + 'px;';
    //将样式添加到div上，显示div
    descDiv.style.cssText = cssStr;
    descDiv.style.display = 'none';
    descDiv.id ='textfactory-panel-'+ index;
    descDiv.innerHTML = html;
    descDiv.className = 'factory-dropdown'
	// return html;
}
//点击替换
nsUI.textfactory.replace = function (index,i) {
	var currentConfig = nsUI.textfactory.arrayConfig.form[index];
	var selectField = nsUI.textfactory.selectField;
	var startP = selectField.selectionStart;
    var endP = selectField.selectionEnd;
    var strArray = selectField.value.split('');
    strArray.splice(startP, endP - startP, currentConfig.textFactory[i]);
    selectField.value = strArray.join('');
    nsUI.textfactory.togglePanel(index);
}