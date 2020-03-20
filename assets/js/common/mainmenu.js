/**
 * 左侧菜单
 * 
 * @returns
 */
mainmenu.init = function(tid, sid, mainmenuIconConfig, homeUrl, defSinglePageMode) {
	if (typeof(tid) == 'object') {
		mainmenu.initByConfig(tid);
	} else {
		mainmenu.initOld(tid, sid, mainmenuIconConfig, homeUrl, defSinglePageMode);
	}
}
mainmenu.initByConfig = function(config) {

	//存储原始配置
	mainmenu.originalConfig = $.extend(true, {}, config);
	//设置默认值
	mainmenu.config = mainmenu.setDefault(config);
	var config = mainmenu.config;
	nsVals.homeUrl = config.homeUrl;
	mainmenu.dataGetReady = false;
	$.ajax({
		type: config.type,
		url: config.url,
		data: config.data,
		dataType: "json",
		success: function(data) {
			if (data.success) {
				mainmenu.dataGetReady = true;
				mainmenu.data = data;
				mainmenu.currentPageID = config.defMenu;
				addMenu(data[config.dataSrc]);
			}
			//加载完成回调事件 返回参数为加载结果
			if(typeof(mainmenu.loadedHandler)=='function'){
				mainmenu.loadedHandler(data[config.dataSrc]);
			}
		},
		error: function(e) {
			toastr.error(language.common.mainmenu.menuError);
		}
	});
	function addMenu(rows) {
		var config = mainmenu.config;
		var menuHtml = "";
		var currentLevel = 1;//当前菜单级别
		for (var i = 0; i < rows.length; i++) {
			var pageID = [i];//菜单索引
			var pageIDStr = JSON.stringify(pageID);
			var activeHtml = '';
			if (typeof(mainmenu.currentPageID[currentLevel - 1]) != 'undefined') {
				if (i == mainmenu.currentPageID[currentLevel - 1]) {
					activeHtml = 'class="opened active"';
				}
			}
			var subMenuHtml = "";
			//在限制菜单级别内可添加子级菜单
			if (config.menuLevel > currentLevel) {
				if (rows[i].children) {
					subMenuHtml = getSubMenuHtml(currentLevel + 1, rows[i].children, pageID, activeHtml != '', config);
				}
			}
			var hrefStr = "javascript:void(0)";
			if (rows[i].url) {
				hrefStr = getRootPath() + rows[i].url;
				var singlePageMode = typeof(rows[i].singlePageMode) == 'boolean' ? rows[i].singlePageMode : config.defSinglePageMode;
				if (singlePageMode) {
					var parameterMiniMenu = typeof(rows[i].minMenu) == 'boolean' ? rows[i].minMenu + '' : 'false';
					hrefStr = "javascript:nsFrame.loadMenu('" + hrefStr + "','" + pageIDStr + "','" + parameterMiniMenu + "');";
				} else {
					if (hrefStr.indexOf('?') > -1) {
						hrefStr += '&currentPageID=' + pageIDStr;
					} else {
						hrefStr += '?currentPageID=' + pageIDStr;
					}
				}
			}
			menuHtml +=
				'<li ' + activeHtml + '>' 
					+ '<a href="' + hrefStr + '">' 
						+ '<i class="' + getIcon(rows[i].name) + '"></i>' 
						+ '<span class="title">' + rows[i].name + '</span>' 
					+ '</a>' 
					+ subMenuHtml 
				+ '</li>';
		}
		$("#main-menu").html(menuHtml);
		//异步加载的面包屑
		if(mainmenu.waitingloadID){
			var html = mainmenu.initNav(mainmenu.currentPageID);
			$('[waitingload="'+mainmenu.waitingloadID+'"]').children('ol').html(html+mainmenu.titleListHtml);
			nsNav.dropdownBtn();
		}
		setup_sidebar_menu();
	}
	function getSubMenuHtml(currentLevel, rows, arrParentPageID, isParentActive, config) {
		var config = mainmenu.config;
		var menuHtml = "";
		for (var i = 0; i < rows.length; i++) {
			var pageID = $.extend(true, [], arrParentPageID); //菜单索引
			pageID[pageID.length] = i;
			var pageIDStr = JSON.stringify(pageID);
			var activeHtml = '';
			if(isParentActive){
				if (typeof(mainmenu.currentPageID[currentLevel - 1]) != 'undefined') {
					if (i == mainmenu.currentPageID[currentLevel - 1]) {
						activeHtml = 'class="opened active"';
					}
				}
			}
			var subMenuHtml = "";
			//在限制菜单级别内可添加子级菜单
			if (config.menuLevel > currentLevel) {
				if (rows[i].children) {
					subMenuHtml = getSubMenuHtml(currentLevel + 1, rows[i].children, pageID, activeHtml != '');
				}
			}
			var hrefStr = "javascript:void(0)";
			if (rows[i].url) {
				hrefStr = getRootPath() + rows[i].url;
				var singlePageMode = typeof(rows[i].singlePageMode) == 'boolean' ? rows[i].singlePageMode : config.defSinglePageMode;
				if (singlePageMode) {
					var parameterMiniMenu = typeof(rows[i].minMenu) == 'boolean' ? rows[i].minMenu + '' : 'false';
					hrefStr = "javascript:nsFrame.loadMenu('" + hrefStr + "','" + pageIDStr + "','" + parameterMiniMenu + "');";
				} else {
					if (hrefStr.indexOf('?') > -1) {
						hrefStr += '&currentPageID=' + pageIDStr;
					} else {
						hrefStr += '?currentPageID=' + pageIDStr;
					}
				}
			}
			//是否添加新打开窗口
			var useTabStr = '';
			//如果config中配置了字段参数则执行
			if(typeof(config.isUseTabField)=='string'){
				var isUseTab = rows[i][config.isUseTabField];
				//服务器端返回值为true 需要添加
				if(typeof(isUseTab)=='boolean'){
					if(isUseTab){
						useTabStr = getRootPath() + rows[i].url;
						if (useTabStr.indexOf('?') > -1) {
							useTabStr += '&currentPageID=' + pageIDStr;
						} else {
							useTabStr += '?currentPageID=' + pageIDStr;
						}
						useTabStr = '<a class="newtab" target="_blank" href="'+useTabStr+'&isnewtab=true"><i class="fa fa-clone"></i></a>';
					}
				}
			}
			menuHtml +=
				'<li ' + activeHtml + '>' 
					+'<a href="' + hrefStr + '">'
						//+'<i class="' + getIcon(rows[i].name) + '"></i>'
						+'<span class="title">' + rows[i].name + '</span>'
					+'</a>'
					+ useTabStr
					+ subMenuHtml
				+'</li>';
		}
		if (menuHtml != "") {
			menuHtml = '<ul>' + menuHtml + '</ul>';
		}
		return menuHtml;
	}
	function getIcon(name){
		name = $.trim(name);
		var iconClass = mainmenu.mainmenuIconConfig[name];
		if(typeof(iconClass) == "undefined"){
			iconClass = mainmenu.config.defMenuIcon;
		}
		return iconClass;
	}
}
//设置菜单配置默认值
mainmenu.setDefault = function(config){
	//设置默认菜单级别
	config.menuLevel = 4;
	//默认展开菜单和点亮
	config.defMenu = $.isArray(config.defMenu) ? config.defMenu : [-1];
	//设置默认为单页面打开方式
	config.defSinglePageMode = typeof(config.defSinglePageMode) == 'boolean' ? config.defSinglePageMode : true;
	//设置默认主页地址
	//config.homeUrl = '';
	//默认菜单url
	config.url = typeof(config.url) == 'undefined' ? getRootPath() + '/assets/json/mainmenu.json' : config.url;
	//默认ajax请求方式是GET请求
	config.type = typeof(config.type) == 'string' ? config.type : 'GET';
	//默认请求的参数是否为空
	config.data = typeof(config.data) == 'object' ? config.data : {};
	//默认的数据源data
	config.dataSrc = typeof(config.dataSrc) == 'string' ? config.dataSrc : 'rows';
	//设置主菜单无图标时默认图标
	config.defMenuIcon = typeof(config.defMenuIcon) == 'string' ? config.defMenuIcon : "linecons-desktop";
	//设置主菜单图标
	config.menuIcon = typeof(config.menuIcon) == 'object' ? config.menuIcon : {};
	var defIcon = {
		"基本结构": "fa-sitemap",
		"Form类": "fa-edit",
		"Table类": "fa-table",
		"汽修类": "fa-car",
		"dialog类": "fa-clipboard",
		"leftmenu类": "fa-list",
		"button类": "fa-mouse-pointer",
		"其他类UI": "fa-puzzle-piece",
		"奥来国信财务DEMO": "fa-rmb",
		"页面配置生成": "fa-file-text",
		"系统管理": "linecons-cog",
		"基础信息管理": "linecons-database",
		"项目管理": "linecons-calendar",
		"报表管理": "linecons-doc",
		"业务处理": "linecons-paper-plane",
		"编号规则": "linecons-tag",
		"采样管理": "linecons-inbox",
		"结果录入": "linecons-pencil"
	};
	for (icon in config.menuIcon) {
		defIcon[icon] = config.menuIcon[icon];
	}
	mainmenu.mainmenuIconConfig = defIcon;
	return config;
}
mainmenu.initOld = function(tid,sid,mainmenuIconConfig,homeUrl,defSinglePageMode){
	var config = {
		defMenu : [tid,sid],
		defSinglePageMode : defSinglePageMode,
		url : mainmenu.url,
		type : mainmenu.type,
		data : mainmenu.data,
		homeUrl : homeUrl,
		menuIcon : mainmenuIconConfig,
	};
	mainmenu.initByConfig(config);
}
mainmenu.initNew = mainmenu.init;

mainmenu.initNav = function(pageID){
	var navHtml = getRootPath() + '/home';
	if(nsVals.homeUrl){
		navHtml = 'javascript:nsFrame.loadPage("'+nsVals.homeUrl+'");';
	}
	navHtml = 
		'<li>'
			+'<a href="'+navHtml+'"><i class="fa-home"></i>'+language.common.mainmenu.homepage+'</a>'
		+'</li>';
	if($.isArray(pageID)){
		var rows = mainmenu.data[mainmenu.config.dataSrc];
		for (var i = 0; i < pageID.length; i++) {
			if(rows){
				if(pageID[i]>-1 && rows[pageID[i]] && rows[pageID[i]].name){
					navHtml += '<li><a href="javascript:void(0);">'+rows[pageID[i]].name+'</a></li>';
					rows = rows[pageID[i]].children;
				}else{
					break;
				}
			}else{
				break;
			}
		}
	}
	
	//$("#breadcrumb-env ol").html(homeHtml+topNavHtml+subNavHtml);
	return navHtml;
}
mainmenu.initNavNew = mainmenu.initNav;

mainmenu.setMin = function(isSetMin){
	if(isSetMin){
		//isSetMin是true，最小化左侧主菜单
		if(public_vars.$sidebarMenu.hasClass('collapsed')){
		//如果已经关闭则不需要操作
		}else{
			public_vars.$sidebarMenu.addClass('collapsed');
			ps_destroy();

			var $openMenuLi = public_vars.$sidebarMenu.find("li.has-sub.opened");
			$openMenuLi.removeClass('expanded opened')
			$openMenuLi.children('ul').removeAttr('style')
		}
	}else{
		if(public_vars.$sidebarMenu.hasClass('collapsed')){
			public_vars.$sidebarMenu.removeClass('collapsed');
			ps_init();
		}else{
			//如果已经展开则不需要操作
		}
	}
}
mainmenu.setCurrentMenu = function(pageID){
	if(!$.isArray(pageID)){
		return;
	}
	//菜单未有变化则直接返回
	if (nsVals.isEqualObject(pageID, mainmenu.currentPageID)) {
		return false;
	}
	
	//移除现有的样式，不移除已展开的菜单
	//$("#main-menu").find(".active").removeClass('opened active expanded');
	$("#main-menu").find(".active").removeClass('active');
	
	//分级设置菜单样式
	var arrTemp = [-1];
	var hasNextLevel = false;//是否拥有子级
	for (var i = 0; i < pageID.length; i++) {
		if (pageID[i] > -1) {
			arrTemp[i] = pageID[i];
			hasNextLevel = false;//是否拥有子级
			if (i < pageID.length - 1) {
				if (pageID[i + 1] > -1) {
					hasNextLevel = true;
				}
			}
			//激活菜单
			activeMenu(arrTemp, hasNextLevel);
		} else {
			break;
		}
	}
	mainmenu.currentPageID = arrTemp;
	function activeMenu(pageID, hasNextLevel) {
		if ($.isArray(pageID) && pageID.length > 0) {
			var curDom = $("#main-menu").children("li")[pageID[0]];
			var $curDom = $(curDom);
			//循环找子集
			for (var i = 1; i < pageID.length; i++) {
				$curDom = $($curDom.children('ul').children('li')[pageID[i]]);
			}
			var strClass = hasNextLevel ? 'opened active expanded' : 'opened active';
			//设置样式
			$curDom.addClass(strClass);
		}
	}
}

mainmenu.initPageState = function(menuOption){
	switch(menuOption.navVersion){
		case 0:
			mainmenu.initNav(menuOption.pageID);
			break;
		case 1:
			mainmenu.initNavNew(menuOption.pageID);
			break;
		case 2:
			nsMenus.setCurrentMenuPosition(menuOption.pageID);
			nsMenus.setCurrentMenu(menuOption.pageID,true);
			return;
			break;
		default:
			console.error('menuOption.navVersion:' + menuOption.navVersion);
			mainmenu.initNav(menuOption.pageID);
			break;
	}
	
	mainmenu.setCurrentMenu(menuOption.pageID);
	mainmenu.setMin(menuOption.isMiniMeun);
}

mainmenu.getCurrentItem = function(){
	//根据目前展示的菜单获取面包屑标签名
	var $firstItem = $('#main-menu').children('li.opened');
	var firstLevelItemName = $firstItem.children('a').children('span.title').text();
	var $secondItem = $firstItem.children('ul').children('li.opened');
	var secondLevelItemName = $secondItem.children('a').children('span.title').text();
	var $thirdItem = $secondItem.children('ul').children('li.opened');
	var thirdLevelItemName = $thirdItem.children('a').children('span.title').text();

	var itemNameArray = [];
	if(firstLevelItemName != ''){
		itemNameArray.push(firstLevelItemName);
		if(secondLevelItemName!=''){
			itemNameArray.push(secondLevelItemName);
			if(thirdLevelItemName!=''){
				itemNameArray.push(thirdLevelItemName);
			}
		}
	}
	var html = '';
	var htmlClsName = ['first', 'second', 'third'];
	//顺序输出
	for(var i=0; i<itemNameArray.length; i++){
		html += '<span class="'+htmlClsName[i]+'">'+itemNameArray[i]+'</span>'
	}
	//标题输出
	var titleHtml = '<h1>'+itemNameArray[itemNameArray.length-1]+'</h1>';
	return {
		name:{
			first: 	firstLevelItemName,
			second: secondLevelItemName,
			third: thirdLevelItemName
		},
		nameArray: itemNameArray,
		html:html,
		titleHtml:titleHtml,
	}
}