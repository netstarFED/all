//覆盖面板
var nsCoverPanels = {
	config:{},
	edit:{}, 	//edit方法集合
};
//左侧资源面板
nsCoverPanels.left = function(config){
	//标题文字
	var titleHtml = '';
	if(typeof(config.title)=='string'){
		titleHtml += 
		'<h2>'+config.title+'</h2>'
	}
	//副标题
	if(typeof(config.titleinfo)!='string'){
		config.titleinfo = '';
	}
	titleHtml += '<p class="substr">'+config.titleinfo+'</p>'
	//是否有关闭按钮
	var closeBtnHtml = '';
	if(config.withoutClose){
		config.isHasCloseBtn = false;
	}else{
		config.isHasCloseBtn = true;
		closeBtnHtml+='<div class="btn-close"></div>'
	}
	//config.id 的默认值
	if(typeof(config.id)=='string'){
	}else{
		config.id = 'menusCoverLeft';
	}
	//工具按钮组
	var btnsHtml = '';
	btnsHtml = '<div id="'+config.id+'Btns" class="btns"></div>'
	//是否初始化隐藏
	var hiddenCls = '';
	if(config.hidden){
		hiddenCls = ' hidden';
	}
	//附加的id和class
	var plusHtml = '';
	if(config.plusHtml){
		plusHtml = config.plusHtml;
	}
	//附加的class
	var plusCls = '';
	if(config.plusClass){
		plusCls = ' '+config.plusClass;
	}
	//最终代码
	var baseHtml = 
		'<div id="'+config.id+'" class="menus-cover-left'+hiddenCls+plusCls+'">'
			+ titleHtml
			+ closeBtnHtml
			+ btnsHtml
			+ plusHtml
		+ '</div>';
	$('#'+config.containerID).append(baseHtml);
	config.$container = $('#'+config.id);

	//最小化按钮
	if(config.isHasCloseBtn){
		config.$container.children('.btn-close').on('click',function(ev){
			if(config.$container.hasClass('min')){
				config.$container.removeClass('min');
			}else{
				config.$container.addClass('min');
			}
			
		})
	}
	//初始化按钮组	
	nsButton.initBtnsByContainerID(config.id+'Btns', config.btnsArray);
	//暴露config对象
	nsCoverPanels.config[config.id] = config;
	//edit辅助信息方法
	nsCoverPanels.edit.subTitle = function(id, text){
		//text 要修改的文本 id：nsCoverPanels.left初始化的对象id
		nsCoverPanels.config[id].$container.find('p.substr').html(text);
	}
	//edit辅助信息方法
	nsCoverPanels.edit.visible = function(id, isVisible){
		//isVisible 是否可见 id：nsCoverPanels.left初始化的对象id
		if(isVisible){
			if(nsCoverPanels.config[id].$container.hasClass('hidden')){
				nsCoverPanels.config[id].$container.removeClass('hidden');
			}
			if(nsCoverPanels.config[id].$container.hasClass('min')){
				nsCoverPanels.config[id].$container.removeClass('min');
			}
		}else{
			if(!nsCoverPanels.config[id].$container.hasClass('hidden')){
				nsCoverPanels.config[id].$container.addClass('hidden');
			}
		}
		
	}

}
//列表处理
nsCoverPanels.list = function(config){
	var data;
	var data2;
	
	//补充组件数据到界面数据
	function panelDataHandler(){
		//合并数据，并进行必要的数据处理
		function mergeData(componetData){
			var componentOriginalData = nsEditorBoard.originalComponent[componetData.name];
			if(typeof(componentOriginalData)=='undefined'){
				//如果没有则直接用配置文件中的
				nsEditorBoard.component[componetData.name] = componetData;
				return;
			}
			componetData.chineseName = componentOriginalData.chineseName; 		//中文名称
			if(componentOriginalData.defauleParams!=''){
				var params = eval('('+componentOriginalData.defauleParams+')');
				if(typeof(componetData.defauleParams)=='undefined'){
					componetData.defauleParams = {};
				}
				$.each(params,function(key,value){
					if(typeof(componetData.defauleParams[key])=='undefined'){
						componetData.defauleParams[key] = value;
					}
				});
			}
			componetData.windowCode = componentOriginalData.windowCode; //编辑窗体代码
			//console.log(componetData);
			//Form元素的默认属性
			if(componetData.parentName == 'Form'){
				if(typeof(componetData.baseAttr.isForm)=='undefined'){
					componetData.baseAttr.isForm = true;
				}
			}
			nsEditorBoard.component[componetData.name] = componetData;
		}
		for(var dI = 0; dI<data.length; dI++){
			//console.log(data[dI].chineseName)
			var componetData = data[dI];
			mergeData(componetData);
			if(data[dI].children){
				for(var cI = 0; cI<data[dI].children.length; cI++){
					var componetData = data[dI].children[cI];
					mergeData(componetData);
				}
			}
			
		}
	}
	//初始化面板组
	function initListPanel(){
		data = config.data;
		var tabIDArr = [];  //所属的tabID
		//TABs
		var ulHtml = '';
		for(var liI = 0; liI<data.length; liI++){
			tabIDArr.push(config.containerID+'-'+liI);
			
			//是否激活状态
			var activeHtml = '';
			if(liI==0){
				activeHtml = ' class="active"'
			}
			//TAB选项卡代码
			ulHtml+=
				'<li '+activeHtml+'>'
					+'<a href="#'+tabIDArr[liI]+'" '
						+'ns-tabindex="'+liI+'" '
						+'ns-key="'+data[liI][config.keyField]+'" '
						+'data-toggle="tab">'
						+data[liI].chineseName
					+'</a>'
				+'</li>'
		}
		ulHtml = 
			'<ul id="'+config.containerID+'-'+'Tab" class="nav nav-tabs">'
				+ulHtml
			+'</ul>'

		//内容
		var contentHtml = '';
		for(var contentI = 0; contentI<data.length; contentI++){
			//包含组件
			var componentHtml = '';
			if(data[contentI].children){
				var componentData = data[contentI].children;
				for(var componentI = 0; componentI<componentData.length; componentI++){
					componentHtml+=
					'<li>'
						+'<a href="javascript:void(0);" '
							+'ns-tabindex="'+contentI+'" '
							+'ns-componentindex="'+componentI+'" '
							+'ns-key="'+componentData[componentI][config.keyField]+'">'
							+componentData[componentI][config.textField]
						+'</a>'
					+'</li>'
				}
				componentHtml = 
					'<ul id="'+config.containerID+'-'+'components'+contentI+'" class="components">'
						+componentHtml
					+'</ul>'
			}
			//是否激活状态
			var activeHtml = '';
			if(contentI==0){
				activeHtml = ' active"'
			}
			contentHtml+=
				'<div class="tab-pane'+activeHtml+'" id="'+tabIDArr[contentI]+'">'
					+componentHtml
				+'</div>'
		}
		contentHtml = 
			'<div id="'+config.containerID+'-'+'content" class="tab-content">'
				+contentHtml
			+'</div>'
		config.$container = $('#'+config.containerID)
		config.$container.append(ulHtml+contentHtml);
		if(typeof(config.completeHandler)=='function'){
			config.completeHandler({
				sourceData:data,
				componentData:data2,
				$container:config.$container
			});
		}
	}
	initListPanel();

}

