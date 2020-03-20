nsFrame.popContainer = {}; 	//弹框
nsFrame.popDrag = {};		//拖拽
nsFrame.minContainer = {};	//最小化窗口sj
//显示加载
nsFrame.loading = function(options){
	if(typeof(options)=='object'){
		//如果transparent为true，则半透明
		if(typeof(options.transparent)=='boolean'){
			if(options.transparent==true){
				options.transparent = 0.5;
			}
		}
		//如果是小于1大于0的数字，则设透明度
		if(typeof(options.transparent)=='number'){
			var bgColorStr = public_vars.$pageLoadingOverlay.css('background-color');
			bgColorStr = bgColorStr.substring(bgColorStr.indexOf('(')+1,bgColorStr.indexOf(')'));
			bgColorStr = 'rgba('+bgColorStr+','+options.transparent+')';
			public_vars.$pageLoadingOverlay.css('background-color',bgColorStr);
		}
		//如果设置文字，则显示文字
		if(typeof(options.info)=='string'){
			var infoHtml = '<div class="info"><span>'+options.info+'</span></div>';
			public_vars.$pageLoadingOverlay.append(infoHtml);
		}
		//如果设置cls：loader-3 则div的class设置为loader-3
		if(typeof(options.cls)=="string"){
			public_vars.$pageLoadingOverlay.children(".loader-2").addClass("loader-3").removeClass("loader-2");
		}
	}
};
//显示加载，半透明
nsFrame.loading2 = function(){
	public_vars.$pageLoadingOverlay.removeClass('loaded');
	public_vars.$pageLoadingOverlay.css('background-color','rgba(44,46,47,0.5)');
};

//加载完成
nsFrame.loaded= function(){
	public_vars.$pageLoadingOverlay.addClass('loaded');
	if(public_vars.$pageLoadingOverlay.attr('style')){
		public_vars.$pageLoadingOverlay.removeAttr('style')
	}
	if(public_vars.$pageLoadingOverlay.children('.info').length>0){
		public_vars.$pageLoadingOverlay.children('.info').remove();
	}
	if(public_vars.$pageLoadingOverlay.children('.loader-3').length>0){
		public_vars.$pageLoadingOverlay.children(".loader-3").addClass("loader-2").removeClass("loader-3");
	}
};
nsFrame.setRootObj = function(rootObj){
	nsFrame.rootObj = rootObj;
};
nsFrame.showingPageArr = [];
/**异步单页面初始化函数**/
nsFrame.init = function(pageObj){
	var nameStr = 'root';
	var currentNameStr = '';
	function getName(runObj){
		$.each(runObj,function(key,value){
			nameStr = nameStr+'-'+key;
			if(value == pageObj){
				currentNameStr = nameStr;
			}
			if(typeof(value)=='object'){
				getName(value);
			}
		});
	}
	//getName(nsFrame.rootObj);
	if(typeof(pageObj)!='object'){
		nsalert("nsFrame.init()参数未定义",'error');
		return false;
	};
	if(typeof(pageObj.main)!='function'){
		nsalert("没有找到main方法，无法完成初始化",'error');
		return false;
	}
	//在执行之前先看看是否有自动保存的数据
	if($.isEmptyObject(nsFrame.autoSaveData)){
		nsFrame.pageMainRun(pageObj);
		nsFrame.setAutoSaveDate(pageObj);
	}else{
		nsFrame.pageMainRun(pageObj);
	}

	
}
//自动保存的数据
nsFrame.autoSaveData = {};
//保存自动保存的页面原始数据
nsFrame.setAutoSaveDate = function(pageObj){
	if(typeof(pageObj.autoSave)=='object'){
		var saveData = {};
		saveData.forms = {};
		for(var formI=0; formI<pageObj.autoSave.form.length; formI++){
			var currentForm = pageObj.autoSave.form[formI];
			saveData.forms[currentForm.id] = nsForm.getFormJSON(currentForm.id, false);
		}
		saveData.timeStamp = new Date().getTime();
		saveData.handler = pageObj.autoSave.handler;
		var firstFormID = pageObj.autoSave.form[0].id;
		//页面形式
		var containerUrl = $('#'+firstFormID).closest('container').attr('ns-pageurl');
		//找不到则是弹框形式的页面加载
		if(typeof(containerUrl)=='undefined'){
			containerUrl = $('#'+firstFormID).closest('.content').attr('ns-pageurl');
		}
		nsFrame.autoSaveData[containerUrl] = saveData;
	}
}
//保存数据比对 原始的 没有用了已经修改为下一个方法
nsFrame.saveDataHandlerSource = function(containerUrl,nextFunction){
	var autoSaveData = nsFrame.autoSaveData[containerUrl].forms;
	var currentData = {};
	for(form in autoSaveData){
		currentData[form] = nsForm.getFormJSON(form, false);
	}
	var isNotEdit = nsVals.isEqualObject(autoSaveData,currentData);
	function saveConfirmHandler(isConfirm){
		if(isConfirm){
			nsFrame.autoSaveData[containerUrl].handler();
		}else{
			nextFunction(true);
		}
	}
	if(isNotEdit){
		//匹配成功，没有修改，不需要提醒，直接回调
		nextFunction(true); 
	}else{
		nsconfirm(language.common.nsframe.SaveOperation,saveConfirmHandler);
	}
}
//保存数据比对
nsFrame.saveDataHandler = function(containerUrl,nextFunction){
	var autoSaveData = $.extend(true,{},nsFrame.autoSaveData[containerUrl]);
	// 删除方法
	delete autoSaveData.handler;
	var currentData = {};
	function formatAutoSaveData(source,data,isChangeStr){
		// source : 自动保存的数据
		// data ：当前表单数据
		// isChangeStr : 是否把自动保存数据转化成字符串
		// 删除source中 在 表单上不存在的字段 原因：返回的数据多
		for(var sourceKey in source){
			if(typeof(data[sourceKey])=='undefined'){
				delete source[sourceKey];
			}
		}
		// 在原始数据中添加表单中存在数据中没有的字段 字段值：‘’
		for(var dataKey in data){
			if(typeof(source[dataKey])=='undefined'){
				source[dataKey] = '';
			}
			if(typeof(data[dataKey])=='undefined'){
				delete source[dataKey];
				delete data[dataKey];
				continue;
			}
			if(isChangeStr){
				if(typeof(source[dataKey])!='object' && typeof(source[dataKey])!='string' && typeof(source[dataKey])!=typeof(data[dataKey])){
					source[dataKey] = source[dataKey].toString();
				}
			}
		}
	}
	if(autoSaveData.forms){
		currentData.forms = {};
		for(form in autoSaveData.forms){
			// 判断是否存在该表单 若存在保存用于比较 若不存在删除autoSaveData中的关于该id对应的数据 不进行比较 
			// 原因：tab模板中的autoSaveData数据 若果没有点击数据对应的tab页则该id对应的表单不存在
			if($('#'+form).children().length>0){
				// currentData.forms[form] = nsForm.getFormJSON(form, false);
				currentData.forms[form] = nsTemplate.getChargeDataByForm(form, false);
				// 删除只读/隐藏的字段
				var formConfigObj = nsForm.data[form].formInput;
				for(var fieldId in formConfigObj){
					if( formConfigObj[fieldId].type == 'hidden' ||
						formConfigObj[fieldId].hidden ||
						formConfigObj[fieldId].readonly ||
						formConfigObj[fieldId].disabled 
					){
						delete currentData.forms[form][fieldId];
					}
				}
				// 格式化自动保存的数据 删除表单中不存在的字段 添加表单中存在的字段 为了比较两个值有没有变化
				formatAutoSaveData(autoSaveData.forms[form],currentData.forms[form],true);
			}else{
				delete autoSaveData.forms[form];
			}
		}
	}
	if(autoSaveData.tables){
		currentData.tables = {};
		for(table in autoSaveData.tables){
			// 判断是否存在该表格 若存在保存用于比较 若不存在删除autoSaveData中的关于该id对应的数据 不进行比较 
			// 原因：tab模板中的autoSaveData数据 若果没有点击数据对应的tab页则该id对应的表格不存在
			if($('#'+table).length>0){
				var tableData = baseDataTable.allTableData(table);
				currentData.tables[table] = $.extend(true,[],tableData);
				var tableConfigOBj = baseDataTable.data[table].columns; // 所有字段配置 用于删除隐藏的字段
				for(var i=0;i<currentData.tables[table].length;i++){
					for(var fieldKey in currentData.tables[table][i]){
						var isDel = false;
						if(typeof(tableConfigOBj[fieldKey])=='undefined'){
							isDel = true;
						}else{
							if(!tableConfigOBj[fieldKey].visible){
								isDel = true;
							}
						}
						if(isDel){
							delete currentData.tables[table][i][fieldKey];
						}
					}
				}
				// 格式化自动保存的数据 删除表单中不存在的字段 添加表单中存在的字段 为了比较两个值有没有变化
				for(var i=0;i<autoSaveData.tables[table].length;i++){
					if(currentData.tables[table][i]){
						formatAutoSaveData(autoSaveData.tables[table][i],currentData.tables[table][i],false);
					}else{
						break;
					}
				}
			}else{
				delete autoSaveData.tables[table];
			}
		}
	}
	var isNotEdit = nsVals.isEqualObject(autoSaveData,currentData);
	function saveConfirmHandler(isConfirm){
		if(isConfirm){
			nsFrame.autoSaveData[containerUrl].handler();
		}else{
			nextFunction(true);
		}
	}
	if(isNotEdit){
		//匹配成功，没有修改，不需要提醒，直接回调
		nextFunction(true); 
	}else{
		nsconfirm(language.common.nsframe.SaveOperation,saveConfirmHandler);
	}
}
//页面执行
nsFrame.pageMainRun = function(pageObj){
	pageObj.main();
	//如果存在自定义配置对象
	if(typeof(pageObj.config)=='object'){
		return false;
		//自定义配置对象初始化
		/*
			var mapID = pageObj.config.pageCode;
			mapID  = mapID.replace(/\./g,"-");
			var mapVal = $("#"+mapID+"-map").val();
			var convertedData= nsCustomConfig.initConfig(pageObj.config, mapVal);
			for(var navI = 0; navI<pageObj.config.nav.length; navI++){
				var navConfig = pageObj.config.nav[navI];
				navConfig.btns = convertedData[navConfig.id];
				nsNav.init(navConfig);
			}	
			nsNav.initConfigBtn(pageObj.config, pageObj.config.pageCode);
		*/
	}else{
		nsFrame.currentConfig = false;
	}
	var originalPageObj = $.extend(true,{},pageObj);
	nsFrame.showingPageArr.push(originalPageObj);
}
//左侧菜单点击
nsFrame.loadMenu = function(url,pageIDStr,parameterMiniMenu,data){
	var pageID = JSON.parse(pageIDStr);
	//是否最小化主菜单
	var isMiniMenu = false;
	if (parameterMiniMenu == "true") {
		isMiniMenu = true;
	}

	//是否有附加参数，只能以get方式转出 => 2017-10-26改为 ajax 请求参数
	if (data) {
		if (typeof(data) == 'string') {
			data = JSON.parse(data);
		}
	}
	//保存菜单变量
	var menuOption = {
		pageIDStr: pageIDStr,
		data: data,
		isMiniMenu: isMiniMenu,
		pageID: pageID,
		navVersion: 1
	}
	nsFrame.defaultMenuOption = menuOption;
	nsFrame.loadPage(url,menuOption);
}
//新菜单中使用
nsFrame.loadMenu2 = function(url,pageIDStr,parameterMiniMenu,data){
	var pageID = JSON.parse(pageIDStr);
	//是否最小化主菜单
	var isMiniMenu = false;
	if (parameterMiniMenu == "true") {
		isMiniMenu = true;
	}

	//是否有附加参数，只能以get方式转出 => 2017-10-26改为 ajax 请求参数
	if (data) {
		if (typeof(data) == 'string') {
			data = JSON.parse(data);
		}
	}
	//保存菜单变量
	var menuOption = {
		pageIDStr: pageIDStr,
		data: data,
		isMiniMenu: isMiniMenu,
		pageID: pageID,
		navVersion: 2
	}
	nsFrame.defaultMenuOption = menuOption;
	nsFrame.loadPage(url,menuOption);
}
//左侧菜单第四层点击 弹出框显示
nsFrame.clickMenuToPopUp = function(url,pageIDStr,parameterMiniMenu,data){
	var pageID = JSON.parse(pageIDStr);
	//是否最小化主菜单
	var isMiniMenu = false;
	if (parameterMiniMenu == "true") {
		isMiniMenu = true;
	}

	//是否有附加参数
	if (data) {
		if (typeof(data) == 'string') {
			data = JSON.parse(data);
		}
	}
	//保存菜单变量
	var menuOption = {
		pageIDStr: pageIDStr,
		data: data,
		isMiniMenu: isMiniMenu,
		pageID: pageID,
		navVersion: 1
	}
	nsFrame.defaultMenuOption = menuOption;
	nsFrame.popPage(url,menuOption);
}
nsFrame.loadMeun = nsFrame.loadMenu; //保留错误名称
nsFrame.loadMenuNew = nsFrame.loadMenu;

nsFrame.defaultMenuOption = {}; //默认的打开
nsFrame.loadPage = function(url,menuOption){
	var config = {
		url: url,
		filterContainer: "container",
		container: 	"container",
	}
	if(menuOption){
		config.menuOption = menuOption;
	}
	nsFrame.initPage(config,'loadPage');
}
/******************* * SJJ 20190418 单页面路由 start***************** */
nsFrame.cacheUrlVRouter = {
	home:getRootPath()+'/mobilehome',
	urlObject:{},
	container:{},
	counter:0,
	pageParam:{},
}; 
nsFrame.urlReplace = function(href){
	if(href && /^#|javasc/.test(href) == false){
		if(history.replaceState){
			//nsFrame.loadPage(href);
			history.replaceState(null,document.title,href.split('#')[0]+'#');
			location.replace('');
		}else{
			//nsFrame.loadPage(href);
			location.replace(href);
		}
	}
}
nsFrame.loadPageVRouter = function(url){
	//var homeUrl = nsFrame.cacheUrlVRouter.home+'#';
	//window.history.pushState('forward',null,homeUrl);
	nsFrame.cacheUrlVRouter.container[nsFrame.cacheUrlVRouter.counter] = $('container');
	if($('container .mobile-crm-search-table').length > 0){
		var tablePrefix = 'table-table-';
		var templateId = $('container .mobile-crm-search-table').attr('id');
		templateId = templateId.substring(tablePrefix.length,templateId.lastIndexOf('-'));
		nsFrame.cacheUrlVRouter.pageParam[nsFrame.cacheUrlVRouter.counter] = {
			templateId:templateId,
			config:nsTemplate.templates.listFilter.data[templateId].config
		};
	}
	if($('container .form-column').length > 0){
		var templateId = $('container .form-column').attr('id');
		templateId = templateId.substring(0,templateId.lastIndexOf('-'));
		nsFrame.cacheUrlVRouter.pageParam[nsFrame.cacheUrlVRouter.counter] = {
			templateId:templateId,
			config:nsTemplate.templates.mobileForm.data[templateId].config
		};
	}
	if($('container').children('[ns-package]').length == 1){
		var package = $('container').children('[ns-package]').attr('ns-package');
		var templateConfig = NetstarTemplate.templates.configs[package];
		nsFrame.cacheUrlVRouter.pageParam[nsFrame.cacheUrlVRouter.counter] = {
			templateId:templateConfig.id,
			config:templateConfig
		};
	}
	$('container').remove();
	$('body').append('<container></container>');
	nsFrame.loadPage(url);
	var urlStr = url.substring(getRootPath().length,url.length);
	var pushUrl = getRootPath()+'/mobilehome#'+urlStr;
	window.history.pushState('forward',null,pushUrl);
	nsFrame.cacheUrlVRouter.counter ++;
	nsFrame.cacheUrlVRouter.urlObject[nsFrame.cacheUrlVRouter.counter] = url;
}
nsFrame.listenVRouter = function(){
	if(window.history && window.history.pushState){
		$(window).on('popstate',function(e){
			if($('.ns-confirm-container').length > 0){
				$('.ns-confirm-container').remove();
			}
			if($('[nspanel="moblieButtons"]').length > 0){
				$('[nspanel="moblieButtons"]').remove();
			}
			if($('.mobilewindow-halfscreen').length > 0){
				$('.mobilewindow-halfscreen').remove();
			}
			var isContinue = true;
			if($('.mobilewindow-fullscreen').length > 0){
				if(!$('.mobilewindow-fullscreen').hasClass('hide')){
					isContinue = false;
				}
				if($('.ns-map-container').length > 0){
					isContinue = false;
				}
				$('.mobilewindow-fullscreen').remove();
			}
			if(isContinue){
				nsFrame.cacheUrlVRouter.counter--;
				var $backPageContainer = nsFrame.cacheUrlVRouter.container[0];
				if(nsFrame.cacheUrlVRouter.counter>0){
					$backPageContainer = nsFrame.cacheUrlVRouter.container[nsFrame.cacheUrlVRouter.counter];
					$backPageContainer.children('nstemplate').remove();
					var templateConfig = nsFrame.cacheUrlVRouter.pageParam[nsFrame.cacheUrlVRouter.counter].config;
					var url = nsFrame.cacheUrlVRouter.urlObject[nsFrame.cacheUrlVRouter.counter];
					var tempValueName = url.substring(url.lastIndexOf('=')+1,url.length);
					//var tempValueName = templateConfig.package + new Date().getTime();
					if(typeof(NetstarTempValues)=='undefined'){NetstarTempValues = {};}
					NetstarTempValues[tempValueName] = templateConfig.pageParam;
					//var url = nsFrame.cacheUrlVRouter.urlObject[nsFrame.cacheUrlVRouter.counter];
					//nsFrame.loadPage(url);
				}else{
					nsFrame.cacheUrlVRouter.counter = 0;
					$backPageContainer.children('script').remove();
					//nsFrame.urlReplace(nsFrame.cacheUrlVRouter.home);
				}
				$('container').remove();
				$('body').append($backPageContainer);
			}else{
				var pushUrl = getRootPath()+'/mobilehome#'+nsFrame.cacheUrlVRouter.counter;
				window.history.pushState('forward',null,pushUrl);
			}
		})
	}
}
/********************** *SJJ 20190418 单页面路由 end***************** */
//简单方式打开
nsFrame.popPage = function(url){
	var config = {url:url};
	nsFrame.popPageConfig(config);
}
//当前窗口更换页面
nsFrame.popPageChange = function(url,ev){
	var config = {
		url: 		url,
		filterContainer: "container",
		container: 	"#nsPopContainer .content",
	};
	nsFrame.initPage(config,'popPageChange');
}
//配置方式打开
nsFrame.popPageConfig = function(config){
	var initConfig = nsFrame.popContainerInit(config);
	nsFrame.popPageShow(initConfig);
}

//容器及配置初始化
nsFrame.popContainerInit = function(config){
	if(config.url){
		//初始化弹出框所用DOM和Object
		if($.isEmptyObject(nsFrame.popContainer)){
			$("body").append('<div id="nsPopContainer" class="nspop-container page-container"></div>');
			nsFrame.popContainer.init = true;
			nsFrame.popContainer.windows = {};
			nsFrame.popContainer.length = 0;
		}
	}else{
		//url是必须的，其它都是选填的
		nsalert("弹出页面的URL未指定",'error');
		return false;
	}

	var initConfig = {};
	initConfig.url = config.url;
	//宽度
	var windowWidthNum;
	if(config.width){
		if(typeof(config.width)=='number'){
			windowWidthNum = config.width;
			initConfig.width = config.width+"px";
		}else{
			if(config.width=='default'){
				windowWidthNum = 960;
				initConfig.width = '960px';
			}else if(config.width=='auto'){
				windowWidthNum = ($(window).width()-100);
				initConfig.width = windowWidthNum+"px";
			}else{
				//有配置数字
				var widthStr = config.width;
				if(widthStr.indexOf('px')>=0){
					windowWidthNum = parseInt(widthStr.substr(0,widthStr.indexOf('px')));
				}else if(widthStr.indexOf('%')>=0){
					windowWidthNum = parseInt(widthStr.substr(0,widthStr.indexOf('%')));
					windowWidthNum = parseInt($(window).width()*windowWidthNum/100);
				}
				initConfig.width = widthStr;
			}
		}
	}else{
		windowWidthNum = $(window).width()-100;
		initConfig.width = ($(window).width()-100)+"px";
	}

	//自动居中
	initConfig.left = parseInt(($(window).width()-windowWidthNum)/2)+'px';
	initConfig.top = '50px';

	//高度
	if(config.height){
		if(typeof(config.height)=='number'){
			initConfig.height = config.height+"px";
		}else{
			initConfig.height = config.height;
		}
	}else{
		//initConfig.height = ($(window).height()-100)+"px";
		initConfig.height = 'auto';
	}
	//标题
	if(config.title){
		initConfig.title = config.title;
	}else{
		initConfig.title = '';
	}
	//关闭回调函数
	if(typeof(config.closeHandler)=='function'){
		initConfig.closeHandler = config.closeHandler;
	}else{
		initConfig.closeHandler = function(){};
	}
	//加载调用函数
	if(typeof(config.loadedHandler)=='function'){
		initConfig.loadedHandler = config.loadedHandler;
	}else{
		initConfig.loadedHandler = function(){};
	}
	//加载调用函数
	if(typeof(config.data)=='object'){
		initConfig.data = config.data;
	}
	//是否有背景,默认有背景
	if(config.bg){
		initConfig.bg = config.bg;
	}else{
		initConfig.bg = true;
	}

	//是否固定标题
	if(config.isFixedTitle){
		initConfig.isFixedTitle = config.isFixedTitle;
	}else{
		initConfig.isFixedTitle = false;
	}
	return initConfig;
}
//生成弹框，等待加载页面  
//containerID如果存在，则不在生成，主要用于恢复最小化窗口用
//restoreValues，则用于自动填充
nsFrame.popPageShow = function(config,containerID,restoreValues){
	if(!nsFrame.popContainer.init){
		return false;
	}
	var windowID;
	if(containerID){
		windowID = containerID;
	}else{
		function getWindowID(){
			var winID = "container-"+Math.floor(Math.random()*10000000000+1);
			if(nsFrame.popContainer.windows[windowID]){
				winID = getWindowID();
			}
			return winID;
		}
		windowID = getWindowID();
	}
	
	var windowsNum = 0; 
	$.each(nsFrame.popContainer.windows,function(key,value){
		windowsNum++;
	});
	config.id = windowID;
	config.zindex = windowsNum;
	nsFrame.popContainer.length = windowsNum+1;
	nsFrame.popContainer.windows[windowID] = {};
	nsFrame.popContainer.windows[windowID].config = config;

	var windowHTML = nsFrame.getWindowHTML(config,windowID);
	$("#nsPopContainer").append(windowHTML);

	//如果是固定标题 则拼接位置 cy 20180830 start --------------------
	if(config.isFixedTitle){
		//标题和关闭按钮需要定位 内容需要空出来顶部位置
		var $title = $('#'+config.id+'.nswindow > div.window-title');
		var $closeBtn = $('#'+config.id+'.nswindow > div.window-close');
		var $content = $('#'+config.id+'.nswindow > div.content');

		var fixedOffset = $content.offset();
		fixedOffset.width = $content.outerWidth();
		fixedOffset.right = $(window).width() - (fixedOffset.left + fixedOffset.width);
		fixedOffset.height = $title.outerHeight();

		$title.css({'top':fixedOffset.top, 'left':fixedOffset.left, 'width':fixedOffset.width});
		$closeBtn.css({'top':fixedOffset.top, 'right':fixedOffset.right});
		$content.css({'padding-top':fixedOffset.height});

		config.fixedOffset = fixedOffset;
	}
	//如果是固定标题 则拼接位置 cy 20180830 end ----------------------
	if(config.bg){
		if($("#nsPopContainer").find(".nspop-bg").length==0){
			$("#nsPopContainer").append('<div class="nspop-bg"></div>');
		}
	}
	
	//关闭窗口
	$("#nsPopContainer #"+windowID+" .window-close").on('click',function(ev){
		function ajaxHandler(isAllow){
			if(isAllow){
				nsFrame.popPageCloseByID(currentWindowID);
			}else{
				//取消操作
			}
		}
		var currentWindowID = $(this).closest('.nswindow').attr('id');
		var currentPageUrl = $(this).closest('.nswindow').children('.content').attr('ns-pageurl');
		if(typeof(nsFrame.autoSaveData[currentPageUrl])=='object'){
			nsFrame.saveDataHandler(currentPageUrl,ajaxHandler);
		}else{
			nsFrame.popPageCloseByID(currentWindowID);
		}
		//nsFrame.popPageCloseByID(currentWindowID);
	});

	//最小化窗口
	// $("#nsPopContainer #"+windowID+" .window-min").on('click',function(ev){
	// 	var currentWindowID = $(this).closest('.nswindow').attr('id');
	// 	nsFrame.popPageMinByID(currentWindowID);
	// });
	var ajaxconfig = {
		containerID:windowID,
		url: config.url,
		filterContainer: "container",
		container: 	"#"+windowID+" .content",
		popPageConfig:config,
	}
	nsFrame.initPage(ajaxconfig, "popPageShow", restoreValues);
}
//根据指定的url关闭弹窗
nsFrame.popPageCloseByUrl = function(urlString){
	//根据指定的url关闭弹窗
	//urlString 为部分或者全部url 举例： demos/form/base.jsp
	var windowID = $('[ns-pageurl*="'+urlString+'"]').closest('.nswindow').attr('id');
	nsFrame.popPageCloseByID(windowID);;
}
nsFrame.popPageCloseByID = function(id){
	//根据弹框页面的id关闭指定弹出页面
	//类似于nsFrame.popPageCloseByID('container-1688650263');
	$("#nsPopContainer #"+id+" .window-close").off("click");
	$("#nsPopContainer #"+id).remove();
	nsFrame.popContainer.windows[id].config.closeHandler();
	delete nsFrame.popContainer.windows[id];
	nsFrame.popContainer.length -=1;
	if(nsFrame.popContainer.length == 0){
		if($("#nsPopContainer").find(".nspop-bg").length>0){
			$("#nsPopContainer .nspop-bg").remove();
		}
	}
}
nsFrame.popPageClose = function(){
	if($.isEmptyObject(nsFrame.popContainer.windows)){
		return false;
	}
	$.each(nsFrame.popContainer.windows, function(key,value){
		var id = key;
		nsFrame.popContainer.windows[id].config.closeHandler();
	})
	$("#nsPopContainer .window-close").off("click");
	$("#nsPopContainer").html('');
	nsFrame.popContainer.windows = {};
	nsFrame.popContainer.length = 0;
}
nsFrame.popPageMinByID = function(id){
	if($.isEmptyObject(nsFrame.minContainer)){
		nsFrame.minContainer.windows = {};
		nsFrame.minContainer.length = 0;
		$("body").append('<div id="nsMinContainer" class="nsmin-container"><div class="blocks"></div></div>');
	}
	var titleName = nsFrame.popContainer.windows[id].config.title;
	nsFrame.minContainer.windows[id] = {};
	nsFrame.minContainer.windows[id].id = id;
	nsFrame.minContainer.windows[id].html = $("#nsPopContainer #"+id).html();
	var values = {};
	var valuesDoms = $("#nsPopContainer #"+id+' .content [id]');
	for(var valueIndex = 0; valueIndex<valuesDoms.length; valueIndex++){
		if($(valuesDoms[valueIndex]).val()!=''){
			values[$(valuesDoms[valueIndex]).attr('id')] = {
				value:$(valuesDoms[valueIndex]).val(),
				nstype:$(valuesDoms[valueIndex]).attr('nstype')
			}
		}
	}
	valuesDoms = null;
	nsFrame.minContainer.windows[id].values = values
	nsFrame.minContainer.windows[id].config =  nsFrame.popContainer.windows[id].config;
	nsFrame.minContainer.length = nsFrame.minContainer.length+1;

	//$("#nsPopContainer #"+id+" .window-min").off("click");
	$("#nsPopContainer #"+id+" .window-close").off("click");
	$("#nsPopContainer #"+id).remove();

	nsFrame.popContainer.windows[id] = ''
	delete nsFrame.popContainer.windows[id];
	nsFrame.popContainer.length -=1;
	if(nsFrame.popContainer.length == 0){
		if($("#nsPopContainer").find(".nspop-bg").length>0){
			$("#nsPopContainer .nspop-bg").remove();
		}
	}
	$('#nsMinContainer .blocks').append('<div wid="'+id+'"  class="min-block">'+titleName+'</div>')
	$('#nsMinContainer [wid="'+id+'"]').on('click',function(ev){
		var wid = $(ev.target).attr('wid');
		nsFrame.minOpenPage(wid);
	})
}
//恢复最小化窗口
nsFrame.minOpenPage = function(containerID){
	var config = nsFrame.minContainer.windows[containerID].config;
	var values = nsFrame.minContainer.windows[containerID].values;
	nsFrame.popPageShow(config, containerID, values);
	//$('#nsPopContainer #'+containerID).html(nsFrame.minContainer.windows[containerID].html);
	//var values = nsFrame.minContainer.windows[containerID].values;
	$('#nsMinContainer [wid="'+containerID+'"]').off('click');
	$('#nsMinContainer [wid="'+containerID+'"]').remove();
	delete nsFrame.minContainer.windows[containerID];
	nsFrame.minContainer.length -=1;
}
nsFrame.getWindowHTML = function(config,windowID){
	var windowHeight = config.height=='auto'?'':"height:"+config.height+"; ";
	var slideWidth = $(".sidebar-menu").width();
	var windowWidth = "width:"+config.width+"; ";
	var currentWindowLeft, currentWindowTop; 	//已经打开窗口的位置
	var windowLeft,windowTop;				//新窗口的位置
	if(nsFrame.popContainer.length>=2){
		//是否是第二个窗口，如果是，就要不能跟第一个重合
		$.each(nsFrame.popContainer.windows,function(key,value){
			if(key!=windowID){
				currentWindowLeft = $('#'+key).position().left;
				currentWindowTop = $('#'+key).position().top;
				windowLeft = (currentWindowLeft+'px')==config.left?(currentWindowLeft+30)+'px':config.left;
				windowTop = (currentWindowTop+'px')==config.top?(currentWindowTop+30)+'px':config.top;
			}
		})
	}
	if(typeof(windowLeft)=='undefined'){
		windowLeft  = config.left;
		windowTop = config.top;
	}
	//window的高和$(document)
	if($(document).scrollTop()>0){
		if($(window).height() != $(document).height()){
			var tempHeight = $(document).height() - $(window).height();
			if(typeof(windowTop) == 'string'){
				if(windowTop.indexOf('px')>-1){
					windowTop = windowTop.substr(0,windowTop.length-2);
					windowTop = Number(windowTop);
				}
			}
			windowTop = windowTop + tempHeight +'px';
		}
	}
	windowLeft = 'left:'+windowLeft+"; ";
	windowTop = 'top:'+windowTop+"; ";
	var zindexNum = config.zindex+1000;
	var zindex = "z-index:"+(config.zindex+1000)+"; ";
	var windowTitle = config.title ? config.title :'';
	var styleStr = 'style="'+windowHeight+windowWidth+windowLeft+windowTop+zindex+'"';
	//<div class="window-min"><i class="fa fa-minus"></i></div>
	var contentStyleStr = nsFrame.getDialogMaxHeightString(config);
	contentStyleStr = 'style="'+contentStyleStr+'"';
	var containerHtml = '<div class="window-title"><span>'+windowTitle+'</span></div><div class="window-close">x</div><div class="content" '+contentStyleStr+'></div>';
	
	//窗口样式
	var nswindowClass = 'nswindow main-content table-content';
	if(config.isFixedTitle){ //是否固定标题
		nswindowClass += ' fixed-title';
	}
	var windowHtml = '<div id="'+windowID+'" class="'+nswindowClass+'" '+styleStr+'>'+containerHtml+'</div>';
	return windowHtml;
}
//都打开过哪些页面，保存页面的config,弹出页面不在范围内
nsFrame.containerPageData = {};
//找到历史记录，实现回退
nsFrame.pageBack = function(pageBackConfig){
	//初始化回退页面参数
	if(!pageBackConfig){
		pageBackConfig = {};
	}
	if(!pageBackConfig.backCount){//回退数量
		pageBackConfig.backCount = 1;
	}

	function getPageConfig(backCount){
		var keys = Object.keys(nsFrame.containerPageData);
		if(keys.length > backCount){
			//根据时间戳倒序排序
			keys.sort(function(a,b){
				return nsFrame.containerPageData[b].timeStamp - nsFrame.containerPageData[a].timeStamp;
			});
			return nsFrame.containerPageData[keys[backCount]];
		}
		return null;
	}

	var historyPageConfig = getPageConfig(pageBackConfig.backCount);
	if(!historyPageConfig){
		//nsalert(language.common.nsframe.historicalRecord,'warning');
		var url = getRootPath();
        nsFrame.loadPage(url);
		return false;
	}else{
		//删去当前的，避免再次回退会找当前的时间戳
		var lastPageConfig = getPageConfig(0);
		delete nsFrame.containerPageData[lastPageConfig.url];
		if(historyPageConfig.menuOption){
			//如果存在menuOption存在则是页面载入
			var pageIDStr = historyPageConfig.menuOption.pageIDStr;
			var parameterMiniMenu = historyPageConfig.menuOption.parameterMiniMenu;
			var data = historyPageConfig.menuOption.data;
			if(pageBackConfig.data){
				data = pageBackConfig.data;
			}
			nsFrame.loadMenu(historyPageConfig.url, pageIDStr, parameterMiniMenu, data);
		}else{
			//未处理的情况
			console.error(language.common.nsframe.untreated);
			console.error(historyPageConfig);
		}
	}
}
//刷新页面
nsFrame.pageRefresh = function(layoutData){
	var pageArr = $.extend(true,[],nsFrame.showingPageArr);
	var url = $('#'+layoutData.layoutID).closest('container').attr('ns-pageurl');
	nsFrame.loadPage(url);
}
//恢复页面
nsFrame.restorePage = function(config){
	var popMode = config.popMode;
	var restoreValues = config.restoreValues;
	delete config.popMode;
	delete config.restoreValues;
	nsFrame.initPage(config,popMode,restoreValues);
}
//处理默认参数
nsFrame.configDefault = function(config){
	if(typeof(config.container)=='undefined'){
		config.container = 'container';
	}
	if(typeof(config.filterContainer)=='undefined'){
		config.filterContainer = 'body';
	}
	config.$container = $(config.container);
	return config;
}
//初始化页面调用AJAX
nsFrame.initPage = function(config,popMode,restoreValues){
	function ajaxHandler(isAllow){
		if(isAllow){
			nsFrame.initPageAjax(config,popMode,restoreValues);
		}else{
			//取消操作
		}
	}
	config = nsFrame.configDefault(config);
	if(popMode == 'loadPage'){
		//如果是载入页面，先判断是否要保存页面数据
		var currentPageUrl = config.$container.attr('ns-pageurl');
		if(typeof(nsFrame.autoSaveData[currentPageUrl])=='object'){
			nsFrame.saveDataHandler(currentPageUrl,ajaxHandler);
		}else{
			nsFrame.initPageAjax(config,popMode,restoreValues);
		}
	}else{
		nsFrame.initPageAjax(config,popMode,restoreValues);
	}
}
nsFrame.initPageAjax = function(config,popMode,restoreValues){
	var containerID;
	var isWithContent = '';
	if(typeof(config.containerID)!='string'){
		containerID = "container-more-"+Math.floor(Math.random()*10000000000+1);
	}else{
		containerID = config.containerID;
		isWithContent =" .content";
	}
	config.$container.attr('id',containerID);
	config.$container.attr('ns-pageurl',config.url);
	//保存config
	nsFrame.containerPageData[config.url] = config;
	var currentConfig = nsFrame.containerPageData[config.url];
	currentConfig.timeStamp = nsVals.getTimeStamp();
	currentConfig.popMode = popMode;
	currentConfig.restoreValues = restoreValues;
	currentConfig.containerID = containerID;

	var ajaxData = {};
	if(config.params){
		ajaxData = config.params;
	}
	if(config.menuOption){
		if (config.menuOption.data) {
			if (typeof(ajaxData) == 'string') {
				ajaxData = JSON.parse(ajaxData);
			}
			ajaxData = $.extend({},ajaxData, config.menuOption.data);
		}
	}
	var ajaxType = 'GET';
	if(config.method){
		ajaxType = config.method;
	}

	$.ajax(
	{
		url: config.url,
		data:ajaxData,
		type:ajaxType,
		cache:false,
		success:function(data){
			//获取成功后改变菜单和导航信息
			if(config.menuOption){
				mainmenu.initPageState(config.menuOption);
			}
			dataObj = data;
			var formatStr = data;
			formatStr = nsFrame.filterCode(formatStr,config.filterContainer);
			var containerDom = $("#"+containerID+isWithContent);
			containerDom.html(formatStr);
			//移除无用DOM和重复DOM
			containerDom.find("#dialog-more").remove();
			containerDom.find("#placeholder-popupbox").remove();
			containerDom.find('.page-loading-overlay').remove();
			containerDom.find('.settings-pane').remove();
			//拖动窗口
			if(popMode=='popPageShow' || popMode=='popPageChange'){
		
				/*containerDom.find('.page-title.nav-form').on("mousedown",function(event){
					var winID = $(this).closest('.nswindow').attr('id');
					if(typeof(winID)=='string'){
						var $window = $("#"+winID);
						nsFrame.popDrag.id = winID;
						nsFrame.popDrag.mDown = true;
						var downX = event.pageX;
						var downY = event.pageY;
						var positionX = $window.position().left;
						var positionY = $window.position().top;
						$(document).on('mousemove',function(ev){
							var moveX = positionX+ev.pageX-downX;
							var moveY = positionY+ev.pageY-downY;
							if(moveX < 10){
								moveX = 10;
								positionX = $window.position().left;
							}
							if(moveX > ($(window).width()-$window.width())-10){
								moveX = $(window).width()-$window.width()-10;
							}

							if(moveY < 10){
								moveY = 10;
							}
							if(moveX > ($(window).height()-$window.height())-10){
								moveY = $(window).height()-$window.height()-10;
							}
							$window.css({'left':moveX, 'top':moveY});
						});
						$(document).on('mouseup',function(ev){
							$(document).off('mousemove');
							$(document).off('mouseup');
						});
					}
				});*/
			}
			//弹框新开页面需要计算高度和位置，并且调用loaded函数
			if(popMode=='popPageShow'){
				// if(nsFrame.popContainer.windows[config.containerID].config.height == 'auto'){
				// 	var cHeight = containerDom.height();
				// 	console.log(cHeight);
				// 	if(cHeight<300){
				// 		cHeight = 300;
				// 	}else if(cHeight>($(window).height()-100)){
				// 		cHeight = $(window).height()-100;
				// 	}
				// 	var cHeightStyle = ' height:'+cHeight+'px;';
				// 	var cStyle = $("#"+config.containerID).attr('style')+cHeightStyle;
				// 	$("#"+config.containerID).attr('style',cStyle);
				// }
				if(typeof(restoreValues)!='undefined'){
					$.each(restoreValues,function(key,value){
						commonConfig.setKeyValue(key,value.value,value.nstype);
					})
				}
				//没有标题 且有导航按钮组则导航按钮组向上固定位置 cy 20180830 start --------------------
				var popPageConfig = config.popPageConfig;
				var $nav = $('#'+popPageConfig.id+'.nswindow > div.content  > .page-title');
				//导航按钮组存在且为固定标题
				if(popPageConfig.isFixedTitle == true && $nav.length == 1){
					$nav.addClass('fixed-nav');
					if(popPageConfig.title == '' ){
						//如果没有标题则直接占据标题位置
						$nav.css({'top':popPageConfig.fixedOffset.top, 'left':popPageConfig.fixedOffset.left});
					}else{
						//如果有标题则留出来标题的位置
						console.log($nav)
						$nav.css({'top':popPageConfig.fixedOffset.top, 'left':popPageConfig.fixedOffset.left});
					}
				}
				//没有标题 且有导航按钮组则导航按钮组向上固定位置 cy 20180830 end --------------------
				//回调
				if(typeof(nsFrame.popContainer.windows[config.containerID].config.loadedHandler) == 'function'){
					var loadedHandler = nsFrame.popContainer.windows[config.containerID].config.loadedHandler;
					loadedHandler();
				}
			}

		}
	});
}
nsFrame.filterCode = function(filterHtml,tag){
	var firstTag = filterHtml.substr(filterHtml.indexOf("<"+tag), 100);
	firstTag = firstTag.substring(0, firstTag.indexOf(">")+1);
	var lastTag = filterHtml.substr(filterHtml.lastIndexOf(tag+">")-100+tag.length+1,100);
	lastTag = lastTag.substr(lastTag.lastIndexOf("<"),lastTag.length);
	filterHtml = filterHtml.substring(filterHtml.indexOf(firstTag)+firstTag.length, filterHtml.lastIndexOf(lastTag));
	return filterHtml;
}
/*************弹框 sjj 20180402 start*******************************************/
nsFrame.normalDialog = function(config){
	//输出容器html
	var windowWidthNum = $(window).width()-100;
	var windowLeft = parseInt(($(window).width()-windowWidthNum)/2)+'px';
	var windowTop = '50px';
	var windowWidth = windowWidthNum+'px';
	var winID = "container-"+Math.floor(Math.random()*10000000000+1);
	function getContainerHtml(){
		var windowWidthStr = "width:"+windowWidth+"; ";
		var windowLeftStr = "left:"+windowLeft+"; ";
		var windowTopStr = "top:"+windowTop+"; ";
		var zindexNum = 1000;
		var zindex = "z-index:"+zindexNum+"; ";
		var windowTitle = config.title ? config.title :'';
		var styleStr = 'style="'+windowWidthStr+windowLeftStr+windowTopStr+zindex+'"';
		
		var html = '<div id="nsPopContainer" class="nspop-container page-container">'
						+'<div id="'+winID+'" class="nswindow main-content table-content" '+styleStr+'>'
							+'<div class="window-title"><span>'+windowTitle+'</span></div>'
							+'<div class="window-close">x</div><div class="content"></div>'
						+'</div>'
					+'</div>';
		return html;
	}
	var html = getContainerHtml();
	$('body').append(html);//追加元素
	//模板调用方法
	var dialogTemplate = eval(config.package + '={}');
	nsTemplate.init(config);
	//关闭弹框
	$("#nsPopContainer #"+winID+" .window-close").on('click',function(ev){
		var currentWindowID = $(this).closest('.nswindow').attr('id');
		$("#nsPopContainer #"+currentWindowID+" .window-close").off("click");
		$("#nsPopContainer #"+currentWindowID).remove();
		//关闭回调函数
		if(typeof(config.closeHandler)=='function'){
			config.closeHandler();
		}else{
			console.log('close')
		}
	});
}
//最大高度计算
nsFrame.getDialogMaxHeightString = function(config){
	//获取弹出框最大高度的样式表属性字符串
	//返回值是样式表属性字符串 'max-height:';
	var maxHeight = $(window).height();
	var maxHeightParameter = {
		modalPaddingTop:50, 		//弹框整体的上边距
		modalPaddingBottom:50, 		//弹框整体的下边距
		titleHeight:50, 			//标题高度
		//footerHeight:50, 			//按钮高度 后来改为头部出按钮了，这个高度就不需要了 20180830
	}
	//依次叠加
	var effectNum = 0;
	for(var key in maxHeightParameter){
		effectNum += maxHeightParameter[key];
	} 
	maxHeight = maxHeight - effectNum;
	//如果固定位置标题 title不占位则应该减去title的高度 cy 20180830
	if(config.isFixedTitle == true){
		maxHeight = maxHeight + 50;
	}
	//最小高度
	if(maxHeight<100){
		maxHeight = 100;
	}
	var styleAttrStr =  'max-height:'+maxHeight+'px;';
	return styleAttrStr;
}
/*************弹框 sjj 20180402 end*******************************************/
/*************内容弹框 cy 20180622 start*******************************************/
nsFrame.contentDialog = 
(function($) {
	//配置文件
	var config;
	var configs = {}; //根据id保存config
	function validate(){

	}
	//默认值 默认单独使用，只能打开一个
	function setDefault(_config){
		var defaultConfig = {
			id:'dialog-content',
			html:'',
			isClear:true,
		}
		nsVals.setDefaultValues(_config, defaultConfig);
	}
	//初始化
	function init(_config){
		/**
		 *{
		 *	id string 				标识符，可用于关闭
		 * 	width:number/string 	数字则为px string则直接使用
		 * 	height:number/string 	数字则为px string则直接使用
		 *	html: string 			弹框内容
		 * 	isClear:boolean 		是否清楚之前的弹框
		 * 	title:string 			标题
		 * 	btns:array 				按钮数组
		 * 	shownHandler:function 	显示后回调
		 *  hiddenHandler:function 	隐藏后回调
		 *}
		 **/
		
		//默认isClear为true, 则清空其他
		if(_config.isClear){
			clear();
		}
		//克隆使用以方便二次使用		
		config = $.extend(true, {}, _config);
		configs[config.id] = config;

	}
	
	//显示
	function show(_config){
		setDefault(_config);
		init(_config);
		//输出代码到body 并fixed
		var html = getHtml();
		var $dialog = $(html);

		$('body').append($dialog);

		if(config.shownHandler){
			config.shownHandler();
		}
		//如果没有配置高度，则需要计算
		if(typeof(config.height)=='undefined'){
			$dialog.css('margin-top', -($dialog.outerHeight()/2));
		}
		if(typeof(config.plusClass)=='string'){
			$dialog.addClass(config.plusClass);
		}
		//关闭按钮
		$('#'+config.id+' .close-btn').on('click', {id:config.id}, function(ev){
			var id = ev.data.id;
			hide(id);
		})

	}
	//关闭
	function hide(id){
		//不传id 则全部关掉
		if(typeof(id)=='undefined'){
			clear();
		}else{
			hideById(id);
		}
	}
	//清理
	function clear(){
		//逐个关闭
		for(var idKey in configs){
			hideById(idKey);
		}
	}
	//关闭执行代码
	function hideById(id){
		$('#'+id).remove();
		var _config = configs[id];
		if(_config.hiddenHandler){
			_config.hiddenHandler({id:id});
		}
		delete configs[id];
	}
	//获取html代码
	function getHtml(){
		//标题
		var titleHtml = '';
		if(typeof(config.title)=='string'){
			titleHtml = '<div class="panel-title">'+config.title+'</div>';
		}
		//底部
		var footerHtml = '';
		if(typeof(config.btns)=='object'){
			footerHtml = '<div class="panel-footer"></div>';
		}
		//宽度和用于居中的marginleft
		var style = '';
		if(typeof(config.width)=='number'){
			style += 'width:'+config.width+'px; ';
			//需要同时处理margin-left
			style += 'margin-left:-'+config.width/2+'px; ';
		}else if(typeof(config.width)=='string'){
			style += 'width:'+config.width+'; '
			//输出margin-left 需要处理数字文本
			var marginLeftStr = nsVals.stringCalculate(config.width,'/2');
			if(marginLeftStr){
				style += 'margin-left:-'+marginLeftStr+'; ';
			}
		}
		//高度和用于居中的margin-top
		if(typeof(config.height)=='number'){
			style += 'height:'+config.height+'px; ';
			//需要同时处理margin-top
			style += 'margin-top:-'+config.height/2+'px; ';
		}else if(typeof(config.height)=='string'){
			style += 'height:'+config.height+'; ';
			//输出margin-left 需要处理数字文本
			var marginTopStr = nsVals.stringCalculate(config.height,'/2')
			if(marginTopStr){
				style += 'margin-top:-'+marginTopStr+'; ';
			}
		}
		//拼接style属性
		if(style!=''){
			style = 'style="'+style+'"';
		}
		//拼接代码
		var html = 
			'<div id="'+config.id+'" class="dialog-content common-fixed-simple-panel" '+style+'>'
				+ '<a class="close-btn" href="javascript:void(0);"></a>'
				+ titleHtml
				+ '<div class="panel-body">'
					+config.html
				+ '</div>'
				+ footerHtml
			+'</div>'
		return html;
	}
	return {
		show:show,
		hide:hide,
		clear:clear
	}
})(jQuery);
/*************内容弹框 cy 20180622 end*******************************************/
var demos = {};
demos.nav = {};
demos.form = {};
demos.frame = {};
demos.ui = {};
demos.table = {};
nsFrame.setRootObj(demos);


/***************sjj 20190715 手机端 跳转界面的时候记录当前界面信息 start*************************************** */
nsFrame.loadPageByUrl = function(_config){
	//通过url加载界面 分两种 一种移除当前container追加新的container容器  一种在当前container基础之上添加新的container 隐藏掉当前container
	/**
	 * 参数名称         	   类型                备注
	 * _config url        	  string  			 要加载界面的url地址
	 * _config.isAppend       boolean			是否追加式的或者新的窗口打开 
	*/
	var url = _config.url;
	var isAppend = typeof(_config.isAppend)=='boolean' ? _config.isAppend : false;//默认不追加以新的窗口打开
	var $container = $('container');//当前容器面板
	//根据当前容器的属性ns-package 包名找到当前界面所引用的模版以及相关配置项
	var package = $('container').children('[ns-package]').attr('ns-package');
	var templateConfig = NetstarTemplate.templates.configs[package];
	nsFrame.cacheUrlVRouter.pageParam[nsFrame.cacheUrlVRouter.counter] = {
		templateId:templateConfig.id,
		config:templateConfig
	};
	nsFrame.cacheUrlVRouter.container[nsFrame.cacheUrlVRouter.counter] = $container;
	if(isAppend){
		//是追加 ajax请求 将返回值追加到container容器
	}else{
		$('container').remove();
		$('body').append('<container></container>');
		nsFrame.loadPage(url);
		var urlStr = url.substring(getRootPath().length,url.length);
		var pushUrl = getRootPath()+'/mobilehome#'+urlStr;
		window.history.pushState('forward',null,pushUrl);
		nsFrame.cacheUrlVRouter.counter ++;
		nsFrame.cacheUrlVRouter.urlObject[nsFrame.cacheUrlVRouter.counter] = url;
	}
} 
/***************sjj 20190715 手机端 跳转界面的时候记录当前界面信息 end**************************************** */