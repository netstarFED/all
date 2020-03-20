/**
 * netstar messager
 * 
 * 
 * 例子：
 * 
 * <pre>
 * 自定义显示提示框内容、标题和按钮
 * nsmessager.show('选择一个按钮?', '提示', {
 * 	btns : [ {
 * 		text : '按钮1',
 * 		handler : function() {
 * 			nsalert('按钮1');
 * 		}
 * 	}, {
 * 		text : '按钮2',
 * 		handler : function() {
 * 			nsalert('按钮1');
 * 		}
 * 	} ]
 * });
 * 
 * 显示一个带确认和取消按钮的提示框
 * nsmessager.confirm('确定要删除吗?', function() {
 * 	nsalert('确认删除');
 * });
 * </pre>
 */
var nsmessager = (function($) {
	var dialog = {
		show : show,
		confirm : confirm
	}
	var _options = {
		msg : language.messager.messageContent,
		title : language.messager.prompt,
		btns : [ {
			text : language.messager.determine,
			handler : function() {
				popupBox.hide();
			}
		} ]
	};
	return dialog;

	function show(msg, caption, options) {
		_options = buildOptions(msg, caption, options);
		doPopupBoxShow(_options);
	}

	function confirm(msg, onOk) {
		_options = buildOptions(msg, language.messager.prompt, {
			btns : [ {
				text : language.messager.determine,
				handler : onOk
			} ]
		});
		doPopupBoxShow(_options);
	}

	function buildOptions(msg, title, options) {
		_options.msg = msg;
		_options.title = title;
		var btns = new Array();
		for (var i = 0; i < options.btns.length; i++) {
			var btn = options.btns[i];
			var doHandler = (function(btn) {
				var _btn = btn;
				var handler = function() {
					popupBox.hide();
					_btn.handler();
				}
				return handler;
			})(btn);
			btns.push({
				text : btn.text,
				handler : doHandler
			});
		}
		_options.btns = btns;
		return _options;
	}

	function doPopupBoxShow(options) {
		var config = {
			id : "nsmessager-view",
			title : options.title,
			size : "s",
			form : [ {
				note : options.msg
			} ],
			btns : options.btns
		};
		popupBox.initShow(config);
	}

})(jQuery);