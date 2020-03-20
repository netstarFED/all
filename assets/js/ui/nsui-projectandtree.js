/********************************************************************
 * 定制组件 左侧树右侧项目选择器
 */
nsUI.projectAndTree = (function($) {
	var config;
	var $closeBtn;
	var $cancelBtn;
	var $confirmBtn;
	//初始化，调用projectSelect和treePlane
	function init(configObj){
		if(typeof(configObj)!='object'){
			nsalert(language.ui.nsuipersonselect.configurationParameter,'error');
			return false;
		}
		config = configObj;
		config.planeID = config.id+'-projectAndTreePlane';
		var html = getPlaneHtml();
		$('body').append(html);

		//加载项目选择器面板
		config.$container = $('#'+config.planeID+' div.container-project');
		nsUI.projectSelect.init(config);

		//添加tree
		//使用tree面板组件必须提供容器
		config.$treeContainer = config.treeAjax.$treeContainer = $('#'+config.planeID+' div.container-tree');
		if(config.treeAjax.clickCallback){
			config.treeAjax.clickHandler = treeClickHandler;
		}
		if(config.treeAjax.checkCallback){
			config.treeAjax.checkHandler = treeCheckHandler;
		}
		config.treeAjax.id = config.id;
		config.treeAjax.treeID = config.id+'-tree';
		nsUI.treePlane.init(config.treeAjax);

		//初始化按钮
		$closeBtn = $('#'+config.planeID+'>a.ps-close-btn');
		$confirmBtn =  $('#'+config.planeID+'>.ps-btn .btn-success');
		$cancelBtn = $('#'+config.planeID+'>.ps-btn .btn-white');
		
		$confirmBtn.on('click',function(ev){
			var treeStr = nsUI.treePlane.getCheckIDs(config.id);
			var treeArr = nsUI.treePlane.getCheckedData(config.id);
			var projectStr = nsUI.projectSelect.getDataIDs();
			var projectArr = nsUI.projectSelect.getData();
			var returnObj = {};
			returnObj.treeStr = treeStr;
			returnObj.treeArr = treeArr;
			returnObj.projectStr = projectStr;
			returnObj.projectArr = projectArr;

			if(typeof(config.confirmHandler)=='function'){
				config.confirmHandler(returnObj)
			}else{
				nsalert(language.ui.nsuipersonselect.confirmHandlerError,'error');
			}
		})
		$closeBtn.on('click',closePlane);
		$cancelBtn.on('click',closePlane);
	}

	//初始化整体HTML
	function getPlaneHtml(){
		var html = 
			'<div class="project-tree-plane" id="'+config.planeID+'">'
				+'<div class="title-tree">'+config.treeTitle+'： </div>'
				+'<div class="container-project"></div>'
				+'<div class="container-tree"></div>'
				+'<a class="ps-close-btn" href="javascript:void(0);">x</a>'
				+'<div class="ps-btn"><button class="btn btn-success"><i class="fa fa-check"></i> '+language.ui.confirm+'</button><button class="btn btn-white">'+language.ui.setDefaultCancel+'</button></div>'
			+'</div>';
		return html;
	}
	//关闭面板
	function closePlane(ev){
		nsUI.projectSelect.clear();
		$('#'+config.planeID).remove();
		config = undefined;
	}
	//树的单击
	function treeClickHandler(data,treeId){
		if(typeof(config.treeAjax.clickCallback)=='function'){
			config.treeAjax.clickCallback(data,treeId);
		}
	}
	//树的选中
	function treeCheckHandler(data,treeId){
		if(typeof(config.treeAjax.checkCallback)=='function'){
			config.treeAjax.checkCallback(data,treeId);
		}
	}

	return {
		init:init,
		close:closePlane
	}
})(jQuery);