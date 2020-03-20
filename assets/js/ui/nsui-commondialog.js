/***************************************************************************************************
 * nsUI.commondialog  通用简单弹框 只用于内部使用
 */
nsUI.commonDialog = (function(){
	var config;
	function configValidate(){
		var isValid = true;
		if(debugerMode){
			var optionsArr = [
				['id', 		'string', 	true],  //id
				['type', 	'string'], 			//类型 默认为fixed-simple
				['title', 	'string'],  		//标题
				['html', 	'string'], 			//html内容
				['btns', 	'array' ], 			//按钮
			]
			isValid = nsDebuger.validOptions(optionsArr,configObj);
		}
		return isValid;
	}
	//设置默认值
	function setDefault(){
		var defaultConfig = {
			type:'fixed-simple',
			title:'',
			html:'<p>没有获取到HTML</p>',
			btns:[]
		}
		nsVals.setDefaultValues(config, defaultConfig);
	}
	//初始化 入口
	function init(_config){
		//验证
		var isValid = configValidate(_config);
		if(isValid == false){
			return false;
		}
		config = _config;
		//默认值
		setDefault(config);
		//用html填充面板
		initPanel();

	}
	//面板初始化
	function initPanel
	function setHtml(){
		var html = 
			 '<a class="close-btn" href="javascript:void(0);"></a>'
			+'<div class="panel-title"></div>'
			+'<div class="panel-body"></div>'
			+'<div class="panel-footer"></div>';
		config.$container.html(html);
		config.$container.addClass('common-fixed-simple-panel');
	}
})(jQuery);