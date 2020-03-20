/***************************************************************************************************
 * nsUI.confirm  / nsconfirm('提示信息',function,'error')
 * @returns true/false
 */
nsUI.confirm = (function () {
	var config;
	var isUserHandler = false;
	//打开
	function show(configObj) {
		//config.title 		标题		string 
		//config.content  	内容 	boolean
		//config.btnsContent 按钮文字 array 必须是2个前面是确定的，后面是取消的
		//config.width  	宽度 	number
		//config.btns  		按钮 	jsonArray，与其它按钮相同{text:'',handler:function(){}}
		//config.isResetBtn 是否重置全部按钮,不保留默认的取消 		boolean
		//config.handler 	回调函数 function 返回值是true false
		//config.isModal 	是否使用modal弹框形式
		//config.icon 		指定显示图标
		//config.state 		指定显示状态  '','success','warning','error'
		if (debugerMode) {
			var optionsArr = [
				['title', 'string'],  		//标题
				['content', 'string'], 		//内容
				['btnsContent', 'array'], 	//按钮文字
				['width', 'number'], 		//宽度
				['btns', 'array'], 			//按钮
				['isResetBtn', 'boolean'],	//是否重置按钮，默认false，默认有取消按钮，其它的加上去
				['handler', 'function', true],		//回调函数
				['isModal', 'boolean'],
				['icon', 'string'],
				['state', 'string'],
			]
			nsDebuger.validOptions(optionsArr, configObj);
		}
		config = setDefault(configObj);
		isUserHandler = false;
		this.config = config;
		var html = '';
		if (config.isModal) {
			html = getModalHtml();
		} else {
			html = getHtml();
		}
		if ($('#' + config.id).length > 0) {
			$('#' + config.id).remove();
		}
		$('body').append(html);
		config.$container = $('#' + config.id);
		btnsInit();

		//关闭后移除DOM，如果不是按钮事件，则调用
		if (config.isModal) {
			//modal弹框形式的
			config.$container.modal();
			config.$container.on('hidden.bs.modal', function (ev) {
				if (!isUserHandler) {
					callbackFunction('cancel');
				}
				$('#' + config.id).remove();
			})
		}
		config.$container.focus();
		$('body').on('keyup', keyupHandler);
	}
	function keyupHandler(ev) {
		if (ev.keyCode == 13) {
			callbackFunction('confirm');
			hide(true);
		} else if (ev.keyCode == 27) {
			callbackFunction('cancel');
			hide(true);
		}
	}
	//设置默认值
	function setDefault(configObj) {
		this.options = {
			id: 'nsconfirm-modal-default',
			title: '',
			content: '',
			width: 600,
			isModal: false,
			icon: '',
			state: '',
			btns: [
				{
					text: language.ui.setDefaultSuccess,
					type: 'success',
					index: { 'ns-confirm-type': 'confirm', fid: 0 },
					handler: close
				}, {
					text: language.ui.setDefaultCancel,
					index: { 'ns-confirm-type': 'cancel', fid: 1 },
					handler: close
				}
			]
		}
		for (option in configObj) {
			switch (option) {
				case 'btns':
					if (configObj.isResetBtn) {
						options.btns = configObj.btns;
					} else {
						options.btns = options.btns.concat(options[option]);
					}
					break;
				default:
					options[option] = configObj[option];
					break;
			}
		}
		options.titleID = options.id + '-title-label';
		//重新定义按钮文字
		if (typeof (configObj.btnsContent) == 'object') {
			if (debugerMode) {
				if (!$.isArray(configObj.btnsContent)) {
					console.error(language.ui.nsuiconfirm.consoleError);
					console.error(configObj.btnsContent);
				} else {
					if (configObj.btnsContent.length != 2) {
						console.error(language.ui.nsuiconfirm.consoleError);
						console.error(configObj.btnsContent);
					} else {
						if (typeof (configObj.btnsContent[0]) != 'string' || typeof (configObj.btnsContent[1]) != 'string') {
							console.error(language.ui.nsuiconfirm.consoleErrorchina);
							console.error(configObj.btnsContent);
						}
					}
				}
			}
			options.btns[0].text = configObj.btnsContent[0];
			options.btns[1].text = configObj.btnsContent[1];
		}

		return options;
	}
	//获取HTML 不是Modal形式的
	function getHtml() {
		var html = '';
		var titleHtml = '';
		if (config.title != '') {
			titleHtml =
				'<div class="confirm-header">'
				+ '<h4>' + config.title + '</h4>'
				+ '</div>';
		}
		var btnsHtml = nsButton.getHtmlByConfigArray(config.btns);
		btnsHtml = '<div class="confirm-footer"><div class="btn-group">'
			+ btnsHtml
			+ '</div></div>'
		var iconHtml = ''
		if (config.icon != '') {
			switch (config.icon) {
				case 'warning':
					iconHtml = 'fa-exclamation-triangle'
					break;
			}
			iconHtml = iconHtml + ' ' + config.icon;
			iconHtml = '<div class="confirm-icon"><i class="' + iconHtml + '"></i></div>';
		}

		var bodyHtml = '';
		if (config.content != '') {
			var withIcon = ''
			if (iconHtml != '') {
				withIcon = ' icon ' + config.icon;
			}
			bodyHtml = '<div class="confirm-content' + withIcon + '">' + config.content + '</div>';
			bodyHtml =
				'<div class="confirm-body">'
				+ iconHtml
				+ bodyHtml
				+ '</div>'
		}
		var plusClass = '';
		if (config.icon != '') {
			plusClass += ' ' + config.icon;
		}
		if (config.state != '') {
			plusClass += ' ' + config.state;
		}
		html =
			'<div class="ns-confirm-container' + plusClass + '" id="' + config.id + '" tabindex="-1">'
			+ titleHtml
			+ bodyHtml
			+ btnsHtml
			+ '<div class="confrim-bg"></div>'
			+ '</div>'
		return html;
	}
	//获取容器的HTML代码
	function getModalHtml() {
		var html = '';
		var titleHtml = '';
		if (config.title != '') {
			titleHtml =
				'<div class="modal-header">'
				+ '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
				+ '<h4 class="modal-title" id="' + config.titleID + '">' + config.title + '</h4>'
				+ '</div>';
		}
		var btnHtmls = nsButton.getHtmlByConfigArray(config.btns);
		var bodyHtml = '';
		if (config.content != '') {
			bodyHtml =
				'<div class="modal-body">'
				+ config.content
				+ '</div>'
		}
		console.error('  ' + config.state);
		html +=
			'<div class="modal fade ns-confirm-modal" id="' + config.id + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'
			+ '<div class="modal-dialog">'
			+ '<div class="modal-content">'
			+ titleHtml
			+ bodyHtml
			+ '<div class="modal-footer confirm-footer"><div class="btn-group">'
			+ btnHtmls
			+ '</div></div>'
			+ '</div>'
			+ '</div>'
			+ '</div>'
		return html;
	}
	//按钮初始化 按钮上有ns-confirm-type属性，confirm是确认，cancel是取消
	function btnsInit() {
		config.$container.find('.confirm-footer button').off('click');
		config.$container.find('.confirm-footer button').on('click', function (ev) {
			var nsConfirmType = $(this).attr('ns-confirm-type');
			var btnIndex = $(this).attr('fid');
			if (typeof (nsConfirmType) == 'string') {
				var callbackBln = callbackFunction(nsConfirmType, btnIndex);
				if (typeof (callbackBln) != 'boolean') {
					callbackBln = true;
				}
				hide(true, callbackBln);
			}
		});
	}
	//回调
	function callbackFunction(nsConfirmType, btnIndex) {
		var callbackBln = true;
		switch (nsConfirmType) {
			case 'confirm':
				config.handler(true);
				break;
			case 'cancel':
				config.handler(false);
				break;
			case 'handler':
				config.btns[btnIndex].handler();
				break;
		}
	}
	//隐藏
	function hide(isUserHide, isAllowHide) {
		//isUserHide是否按钮事件引发，如果是true，则不调用关闭时候的回调方法
		if (typeof (isAllowHide) != 'boolean') {
			isAllowHide = true;
		}
		isUserHandler = isUserHide;
		if (config.isModal) {
			config.$container.modal('hide');
		} else {
			if (isAllowHide) {
				config.$container.remove();
			}
		}
		$('body').off('keyup', keyupHandler);
	}
	function defaultCallback(isConfirm) {
		console.log('isConfirm:' + isConfirm);
		return isConfirm
	}
	return {
		show: show,
		hide: hide,
		defaultCallback: defaultCallback
	}
})(jQuery);
//简单调用方式
function nsconfirm(content, handler, state) {
	//content 	必填 字符 显示内容
	//handler 	必填 回调处理函数，会返回是否点击了确认
	//state  	必填 字符 显示状态"","error","success","warning" 

	//验证state参数
	if (typeof (state) == 'string') {
		//合法的
		if (state == '' || state == 'error' || state == 'success' || state == 'warning') {
			//合法名称
		} else {
			if (debugerMode) {
				console.error('nsConfirm方法的state参数名称错误：只能是"","error","success","warning",当前是：' + state)
			}
		}
	} else if (typeof (state) == 'undefined') {
		state = '';
	} else {
		if (debugerMode) {
			console.error('nsConfirm方法的state参数类型错误：必须是字符串，名称是"","error","success","warning",当前是类型：' + typeof (state))
		}
	}
	var config =
	{
		content: content,
		handler: handler,
		state: state
	}
	nsUI.confirm.show(config);
}
var nsConfirm = nsconfirm;