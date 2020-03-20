/***************************************************************************************************
 * nsUI.login  
 * @returns true/false
 */
nsUI.login = (function(){
	var config;
	function show(configObj){
		config = setDefault(configObj);
		this.config = config;
		var html = getHtml();
		if($('#'+config.id).length>0){
			$('#'+config.id).remove();
		}
		$('body').append(html);
		config.$container = $('#'+config.id);
		btnsInit();
	}
	function setDefault(configObj){
		/*var contentStr=typeof(configObj.content)=='undefined'?'':configObj.content;
		var idStr=typeof(configObj.id)=='undefined'?'nsconfirm-modal-default':configObj.content;*/
		var title=typeof(configObj.title)=='undefined'?'':configObj.title;
		this.options = {
			id:'nsconfirm-modal-default',
			title:title,
			content:'',
			width:600,
			isModal:false,
			icon:'',
			state:'',
			btns:[
				{
					text: 		language.ui.setDefaultSuccess,
					type: 		'success',
					index: 		{'ns-confirm-type':'confirm',fid:0},
					handler: 	close
				},{
					text: 		language.ui.setDefaultCancel,
					index: 		{'ns-confirm-type':'cancel',fid:1},
					handler: 	close
				}
			]
		}
		for(option in configObj){
			switch(option){
				case 'btns':
					if(configObj.isResetBtn){
						options.btns = configObj.btns;
					}else{
						options.btns = options.btns.concat(options[option]);
					}
					break;
				default:
					options[option] = configObj[option];
					break;
			}
		}
		options.titleID = options.id+'-title-label';
		//重新定义按钮文字
		if(typeof(configObj.btnsContent)=='object'){
			if(debugerMode){
				if(!$.isArray(configObj.btnsContent)){
					console.error(language.ui.nsuiconfirm.consoleError);
					console.error(configObj.btnsContent);
				}else{
					if(configObj.btnsContent.length!=2){
						console.error(language.ui.nsuiconfirm.consoleError);
						console.error(configObj.btnsContent);
					}else{
						if(typeof(configObj.btnsContent[0])!='string' || typeof(configObj.btnsContent[1])!='string'){
							console.error( language.ui.nsuiconfirm.consoleErrorchina );
							console.error(configObj.btnsContent);
						}
					}
				}
			}
			options.btns[0].text = configObj.btnsContent[0];
			options.btns[1].text = configObj.btnsContent[1];
		}
		options.content = '<div class="form-group login-username-icon">'
							+'<label class="control-label">用户名：</label>'
							+'<input type="text" readonly class="form-control" value="'+options.username+'" id="username" name="username" />'
						+'</div>'
						+'<div class="form-group login-password-icon">'
							+'<label class="control-label">密码：</label>'
							+'<input type="password" class="form-control" id="pwd" name="pwd" />'
						+'</div>';
		return options;
	}
	function getHtml(){
		var titleHtml = '';
		if(config.title!=''){
			titleHtml = 
				'<div class="confirm-header">'
					+'<h4>'+config.title+'</h4>'
				+'</div>';
		}
		var btnsHtml = nsButton.getHtmlByConfigArray(config.btns);
		btnsHtml = '<div class="confirm-footer">'
						+btnsHtml
					+'</div>';
		var bodyHtml = '';
		if(config.content!=''){
			bodyHtml = '<div class="confirm-content">'+config.content+'</div>';
			bodyHtml =
				'<div class="confirm-body">'
					+bodyHtml
				+'</div>'
		}
		var	html =
			'<div class="ns-confirm-container" id="'+config.id+'" tabindex="-1">'
				+titleHtml
				+bodyHtml
				+btnsHtml
				+'<div class="confrim-bg"></div>'
			+'</div>'
		return html;
	}
	function btnsInit(){
		config.$container.find('.confirm-footer button').off('click');
		config.$container.find('.confirm-footer button').on('click',function(ev){
			var nsConfirmType = $(this).attr('ns-confirm-type');
			if(typeof(nsConfirmType)=='string'){
				callbackFunction(nsConfirmType);
			}
		});
	}
	//回调
	function callbackFunction(nsConfirmType){
		switch(nsConfirmType){
			case 'confirm':
				var pwd = $.trim($('#pwd').val());
				var username = $.trim($('#username').val());
				var params = {
					login:1,
					username:username,
					password:pwd
				}
				$.ajax({
					url:config.ajax.url, //请求的数据链接
					type:config.ajax.type,
					data:params,
					dataType:'json',
					success:function(data){
						if(data.success == true){
							hide(true,true);
							if(typeof(config.completeHandler)=='function'){
								config.completeHandler();
							}
						}else{
							nsalert(data.pwmsg);		
						}
					},
					error:function(error){
						nsalert(language.common.nscomponent.part.selectajaxError,'error');
						if(debugerMode){
							console.log(error);
						}
					}
				})
				break;
			case 'cancel':
				hide(true,true);
				if(typeof(config.cancelHandler)=='function'){
								config.cancelHandler();
							}
				break;
		}
	}
	function hide(isUserHide,isAllowHide){
		//isUserHide是否按钮事件引发，如果是true，则不调用关闭时候的回调方法
		if(typeof(isAllowHide)!='boolean'){
			isAllowHide = true;
		}
		if(isAllowHide){
			config.$container.remove();
		}
	}
	return {
		show:show,
		hide:hide,
	}
})(jQuery);
//简单调用方式
function nslogin(configObj){
	nsUI.login.show(configObj);
}
var nslogin = nslogin;