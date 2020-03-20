/***************************************************************************************************
 * nsUI.notify  / nsnotify('提示信息',function,'error')
 * @returns true/false
 */
nsUI.notify = (function(){
	var config;
	//打开
	function show(configObj){
		//config.title 		标题		string 
		//config.content  	内容 	boolean
		//config.state 		指定显示状态  '','success','warning','error'
		//config.timeout   指定关闭时间，单位秒
		if(debugerMode){
			var optionsArr = [
				['title','string'],  		//标题
				['content','string'], 		//内容
				['state','string'], 
				['timeout','number'],		//指定关闭时间，单位秒
			]
			nsDebuger.validOptions(optionsArr,configObj);
		}
		configObj = setDefault(configObj);
		if($('#'+configObj.id).length>0){
			hide();
		}
		config = configObj;
		this.config = config;
		var html = getHtml();
		$('body').append(html);
		
		config.$container = $('#'+config.id);

		//关闭
		$("#"+config.id+' .close').on('click', function(ev){
			hide();
		});
		if(typeof(config.timeout)=='number'){
			if(config.timeout>0){
				config.timeoutId = window.setTimeout(hide,config.timeout*1000); 
			}
		}
	}

	//设置默认值
	function setDefault(configObj){
		this.options = {
				id:'nsnotify-default',
				title:'',
				content:'',
				state:'',
				timeout:0//0表示不自动关闭
			}
		for(option in configObj){
			options[option] = configObj[option];
		}
		return options;
	}
	//获取HTML
	function getHtml(){
		var html = '';
		var titleHtml = '';
		if(config.title!=''){
			titleHtml = '<h4 class="notify-title">'+config.title+'</h4>';
		}
		titleHtml = 
				'<div class="notify-header">'
					+titleHtml
					+'<button type="button" class="close">×</button>'
				+'</div>';
		var bodyHtml = '';
		if(config.content!=''){
			var state = ''
			if(config.state!=''){
				state = ' icon '+config.state;
			}
			bodyHtml = '<div class="notify-content'+state+'">'+config.content+'</div>';
			bodyHtml =
				'<div class="notify-body">'
					+bodyHtml
				+'</div>'
		}
		html =
			'<div class="ns-notify-container" id="'+config.id+'" tabindex="-1">'
				+titleHtml
				+bodyHtml
				+'<div class="notify-footer"></div>'
			+'</div>';
		return html;
	}
	//隐藏
	function hide(){
		if(typeof(config.timeoutId)=='number'){
			window.clearTimeout(config.timeoutId);
		}
		config.$container.remove();
	}
	
	return {
		show:show,
		hide:hide
	}
})(jQuery);
//简单调用方式
function nsnotify(content,timeout,state){
	//content 	必填 字符 显示内容
	//timeout   数字 自动关闭时间：单位秒
	//state  	字符 显示状态"","error","success","warning" 

	//验证state参数
	if(typeof(state)=='string'){
		//合法的
		if( state =='' ||  state=='error' ||  state=='success' ||  state== 'warning'){
			//合法名称
		}else{
			if(debugerMode){
				console.error('nsNotify方法的state参数名称错误：只能是"","error","success","warning",当前是：'+state)
			}
		}
	}else if(typeof(state)=='undefined'){
		state = '';
	}else{
		if(debugerMode){
			console.error('nsNotify方法的state参数类型错误：必须是字符串，名称是"","error","success","warning",当前是类型：'+typeof(state))
		}
	}
	var config = 
	{
		content:content,
		timeout:timeout,
		state:state
	}
	nsUI.notify.show(config);
}
var nsNotify = nsnotify;