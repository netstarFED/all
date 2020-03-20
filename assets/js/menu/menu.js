
//菜单组件
// var nsMenus = {};
// nsMenus.formatData = function(){

// }
// nsMenus.init(config);
// getDataByAjax(config);
// getDateFromAjaxDate(dataArray);
// //setMenus(menuJson);
// getHtmlByJson(menuJson);
// setMenusEvent();
var nsMenus = (function(){
	//初始化
	function init(config){
		//存储原始配置
		this.originalConfig = $.extend(true, {}, config);
		//设置默认值
		this.config = setDefault(config);
		var config = this.config;
		if(config){
			this.dataGetReady = false;
			getDataByAjax(config);
		}	
	}
	//默认值
	function setDefault(config){
		if(typeof(config.id) == "undefined"){
			console.error("没有指定id");
			return false;
		}
		var defMenu = [-1];
		var windowHref = window.location.href;
		windowHref = decodeURI(windowHref);
		if(windowHref.indexOf('currentPageID=')>-1){
			var defMenuStr = windowHref.substring(windowHref.indexOf('currentPageID=')+'currentPageID=['.length,windowHref.length-1);
			defMenu = defMenuStr.split(',');
			for(var i=0;i<defMenu.length;i++){
				defMenu[i] = Number(defMenu[i]);
			}
		}
		var defaultJson = {
			url: 				getRootPath() + '/assets/json/menus.json',	//默认菜单url
			type:       	 	'GET', 										//默认ajax请求方式是GET请求
			data: 				{},											//默认请求的参数是否为空
			dataSrc: 			'rows',										//默认的数据源data
			defSinglePageMode: 	true,										//设置默认为单页面打开方式
			defMenuIcon: 		"linecons-desktop",							//设置主菜单无图标时默认图标
			menuIcon: 			{},											//设置主菜单图标
			isTurnTree: 		true,										//是否需要转树 默认true
			menuIdField: 		'id',										//菜单id
			menuParentIdField: 	'parentId',									//菜单父id
			nameField: 			'name',										//菜单显示name值
			urlField: 			'url',										//菜单url值
			defMenu: 			defMenu,									//默认展开菜单和点亮
		}
		nsVals.setDefaultValues(config,defaultJson);
		nsMenus.$container = $("#"+config.id);
		//菜单层级
		config.menuLevel = 4;
		
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
		nsMenus.mainmenuIconConfig = defIcon;
		return config;
	}
	//格式化数据
	function formatData(){}
	//通过ajax获取数据
	function getDataByAjax(config){
		$.ajax({
			type: config.type,
			url: config.url,
			data: config.data,
			dataType: "json",
			success: function(data) {
				if (data.success) {
					nsMenus.dataGetReady = true;
					nsMenus.data = data;
					nsMenus.currentPageID = config.defMenu;
					if(config.isTurnTree){
						var dataArr = nsDataFormat.convertToTree(data[config.dataSrc],config.menuIdField,config.menuParentIdField,'children');
					}else{
						var dataArr = data[config.dataSrc];
					}
					dataArr = getDateFromAjaxDate(dataArr,config);  //处理树，处理成需要的字段
					getHtmlByJson(dataArr); 						//生成并插入HTML代码
					// getDateFromAjaxDate(data[config.dataSrc]);
					// getHtmlByJson(data[config.dataSrc]);
					//点亮默认菜单
					setCurrentMenu(nsMenus.currentPageID);
					//显示默认菜单
					nsMenus.currentPagePosition = setCurrentMenuPosition(nsMenus.currentPageID);
					//添加方法
					setMenusEvent();
				}
			},
			error: function(e) {
				console.error('菜单加载出错');
			}
		});
	}
	//处理ajax数据
	function getDateFromAjaxDate(rows,config){
		var rows = $.extend(true,[],rows);
		function getNameUrlByMenu(_rows){
			for(var i=0;i<_rows.length;i++){
				var defaultJson = {
					name:_rows[i][config.nameField],
					url:_rows[i][config.urlField],
					isPopUp:'true',
				}
				nsVals.setDefaultValues(_rows[i],defaultJson);
				if($.isArray(_rows[i].children)){
					getNameUrlByMenu(_rows[i].children);
				}
			}
		}
		getNameUrlByMenu(rows);
		return rows;
	}
	//通过ajax获得html
	function getHtmlByJson(rows){
		var config = nsMenus.config;
		var menuHtml = "";
		var currentLevel = 1;//当前菜单级别
		var menuLevel = config.menuLevel;//菜单一共四层
		menuHtml = getSubMenuHtml(currentLevel,rows);
		function getSubMenuHtml(_menuLevel,_rows,pageIDStar,_isHaveUseTab){
			var menusHTML = '';
			var addMenuHtml = '';	
			for(var i = 0; i < _rows.length; i++){
				if($.isArray(pageIDStar)){
					var pageID = $.extend(true, [], pageIDStar); //菜单索引
					pageID[pageID.length] = i;
				}else{
					var pageID = [i];//菜单索引
				}
				var pageIDStr = JSON.stringify(pageID);
				var hrefStr = 'javascript:void(0)';
				if(_rows[i].url && _rows[i].url.length>0){
					// hrefStr = getRootPath() + _rows[i].url;
					hrefStr = getRootPath() +  _rows[i].url;
					if(_menuLevel == 4){
						if(_rows[i].isPopUp){
							var parameterMiniMenu = typeof(_rows[i].minMenu) == 'boolean' ? _rows[i].minMenu + '' : 'false';
							hrefStr = "javascript:nsFrame.clickMenuToPopUp('" + hrefStr + "','" + pageIDStr + "','" + parameterMiniMenu + "');";
						}
					}else{
						var singlePageMode = typeof(_rows[i].singlePageMode) == 'boolean' ? _rows[i].singlePageMode : config.defSinglePageMode;
						if (singlePageMode) {
							var parameterMiniMenu = typeof(_rows[i].minMenu) == 'boolean' ? _rows[i].minMenu + '' : 'false';
							hrefStr = "javascript:nsFrame.loadMenu2('" + hrefStr + "','" + pageIDStr + "','" + parameterMiniMenu + "');";
						}else{
							if (hrefStr.indexOf('?') > -1) {
								hrefStr += '&currentPageID=' + pageIDStr;
							} else {
								hrefStr += '?currentPageID=' + pageIDStr;
							}
						}
					}
					hrefStr = encodeURI(hrefStr);
				}
				var iconStr = config.defMenuIcon;
				if(nsMenus.mainmenuIconConfig[_rows[i].name]){
					iconStr = nsMenus.mainmenuIconConfig[_rows[i].name];
				}
				var spanHTML = '';
				if(_rows[i].spanClass){
					if(_rows[i].spanClass.length > 0){
						spanHTML = '<span class="badge '+_rows[i].spanClass+'">'+_rows[i].span+'</span>';
					}
				}
				//是否添加新打开窗口
				var useTabStr = '';
				var useTabClass = '';
				var isHaveUseTab = false;
				//如果config中配置了字段参数则执行
				if(typeof(config.isUseTabField)=='string'){
					var isUseTab = _rows[i][config.isUseTabField];
					//服务器端返回值为true 需要添加
					if(typeof(isUseTab)=='boolean'){
						if(isUseTab){
							useTabStr = getRootPath() + _rows[i].url;
							if (useTabStr.indexOf('?') > -1) {
								useTabStr += '&currentPageID=' + pageIDStr;
							} else {
								useTabStr += '?currentPageID=' + pageIDStr;
							}
							useTabStr = '<a class="newtab" target="_blank" href="'+useTabStr+'&isnewtab=true"><i class="fa fa-clone"></i></a>';
							useTabClass = 'submenu-list-item-blank';
							isHaveUseTab = true;
						}
					}
				}
				var haveUseTabStr = '';
				if(_isHaveUseTab){
					haveUseTabStr = 'style="right:24px;"';
				}
				var menuItemHtml = '';
				if($.isArray(_rows[i].children)){
					// _menuLevel++;
					if(_menuLevel<menuLevel){
						menuItemHtml = getSubMenuHtml(_menuLevel+1,_rows[i].children,pageID,isHaveUseTab);
					}
				}
				switch(_menuLevel){
					case 1:
						addMenuHtml += '<li class="sidebar-menu-item">'
										+'<div class="sidebar-menu-item-row">'
											+'<a href="javascript:void(0);">'
												+'<i class="'+iconStr+'"></i>'
												+'<span>'+_rows[i].name+'</span>'
											+'</a>'
										+'</div>'
										+menuItemHtml
									+'</li>';
						break;
					case 2:
						addMenuHtml += '<li class="submenu-list">'
											+'<div class="submenu-list-header">'
												+'<h5 class="submenu-list-title">'+_rows[i].name+'</h5>'
											+'</div>'
											+menuItemHtml;
										+'</li>';
						break;
					case 3:
						addMenuHtml += '<li class="submenu-list-item">'
										+'<div class="submenu-list-item-text '+useTabClass+'">'
											+spanHTML
											+'<a href="'+hrefStr+'" title="">'+_rows[i].name+'</a>'
											+useTabStr
										+'</div>'
										+menuItemHtml
									+'</li>';
						break;
					case 4:
						addMenuHtml += '<button type="button" class="btn btn-primary btn-icon" onclick="'+hrefStr+'">'
										+'<i class="'+_rows[i].name+'"></i>'
									+'</button>'
						break;
				}
			}
			switch(_menuLevel){
				case 1:
					menusHTML = '<div class="sidebar-menu-horizontal">'
									+'<ul>'
										+addMenuHtml
									+'</ul>'
								+'</div>'
					break;
				case 2:
					menusHTML = '<div class="submenu-block hide">'
									+'<ul>'
										+addMenuHtml
									+'</ul>'
								+'</div>'
					break;
				case 3:
					menusHTML = '<div class="submenu-list-body">'
									+'<ul>'
										+addMenuHtml
									+'</ul>'
								+'</div>'
					break;
				case 4:
					menusHTML = '<div class="btn-group submenu-list-item-control" '+haveUseTabStr+'>'
									+addMenuHtml
								+'</div>'
					break;
			}
			return menusHTML;
		}
		nsMenus.$container.html(menuHtml);
	}
	//点亮默认菜单位置
	function setCurrentMenu(pageID,isTrue){
		/*
		 * pageID 	array 		点亮菜单的位置 例如‘select使用’页面的pageID是[1,3,0]（第二个一层菜单第四个二层菜单第一个三层菜单）
		 * isTrue 	boolean 	是否需要判断 菜单是否有变化
		 */
		if(!$.isArray(pageID)){
			return;
		}
		if(isTrue){
			//菜单未有变化则直接返回
			if (nsVals.isEqualObject(pageID, nsMenus.currentPageID)) {
				nsMenus.$container.find(".submenu-block").addClass('hide');
				nsMenus.$container.find(".current").removeClass('current');
				setMenusEvent();
				return false;
			}
		}
		
		
		//移除现有的样式
		nsMenus.$container.find(".current").removeClass('current');
		nsMenus.$container.find(".open").removeClass('open');
		nsMenus.$container.find(".submenu-block").addClass('hide');

		//分级设置菜单样式
		var arrTemp = [-1];
		var hasNextLevel = false;//是否拥有子级
		for (var i = 0; i < pageID.length; i++) {
			if (pageID[i] > -1) {
				arrTemp[i] = pageID[i];
				//激活菜单
				activeMenu(arrTemp);
			}else{
				break;
			}
		}
		nsMenus.currentPageID = arrTemp;
		function activeMenu(pageID) {
			if ($.isArray(pageID) && pageID.length > 0) {
				var curDom = $("#" + nsMenus.config.id).find(".sidebar-menu-item")[pageID[0]];
				var $curDom = $(curDom);
				//循环找子集
				for (var i = 2; i < pageID.length; i++) {
					$curDom = $($curDom.find('.submenu-list')[pageID[i-1]]);
					$curDom = $($curDom.find('.submenu-list-item')[pageID[i]]);
				}
				var strClass = 'open';
				//设置样式
				$curDom.children("div").children("a").addClass(strClass);
			}
		}
		//添加方法
		setMenusEvent();
	}
	//显示默认菜单位置
	function setCurrentMenuPosition(pageID){
		var navHtml = getRootPath() + '/home';
		if(nsVals.homeUrl){
			navHtml = 'javascript:nsFrame.loadPage("'+nsVals.homeUrl+'");';
		}
		navHtml = 
			'<li>'
				+'<a href="'+navHtml+'"><i class="fa-home"></i>'+language.common.mainmenu.homepage+'</a>'
			+'</li>';
		if($.isArray(pageID)){
			var rows = nsMenus.data[nsMenus.config.dataSrc];
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
		return navHtml;
	}
	//添加方法
	function setMenusEvent(){
		nsMenus.$menusFirstLevel = nsMenus.$container.find(".sidebar-menu-item").children('.sidebar-menu-item-row');
		nsMenus.$submenuBlock = nsMenus.$container.find('.submenu-block');
		// nsMenus.$menusFirstLevelInA = nsMenus.$menusFirstLevel.children("div").children("a");
		nsMenus.$menusFirstLevelInA = nsMenus.$menusFirstLevel.children("a");
		// nsMenus.$menusFirstLevelInA.off('click');
		// nsMenus.$menusFirstLevelInA.on('click',function(event){
		// 	nsMenus.$menusFirstLevel.off('mouseenter mouseleave');
		// 	var $this = $(this);
		// 	var $parentNext = $this.parents(".sidebar-menu-item").find(".submenu-block");
		// 	nsMenus.$submenuBlock.addClass('hide');
		// 	nsMenus.$menusFirstLevelInA.removeClass('current');
		// 	$this.addClass('current');
		// 	$parentNext.removeClass('hide');
		// });
		//显示.submenu-block，并计算位置
		function showThisBlockPosition($this,$thisInA){
			$thisInA.addClass('current');
			nsMenus.$submenuBlock.addClass('hide');
			var $thisBlock = $this.next('.submenu-block');
			if($thisBlock.length > 0){
				var $thisList = $this.next('.submenu-block').find('.submenu-list');
				$thisBlock.removeClass('hide');
				var containerHeight = nsMenus.$container.children(".sidebar-menu-horizontal").offset().top;
				var containerwidth = nsMenus.$container.children(".sidebar-menu-horizontal").outerWidth();
				var blockHeight = $thisBlock.offset().top;
				var blockheight = $thisBlock.outerHeight();
				var blockwidth = $thisBlock.outerWidth();
				var blockwidthInt = $thisBlock.width();
				var listwidth = $thisList.outerWidth();
				var listwidthMargin = $thisList.eq(1).outerWidth(true);
				var scrollTop = $(window).scrollTop();
				var currentheight = $thisInA.height();
				var currentHeight = $thisInA.offset().top;
				var windowheight = $(window).height();
				var windowwidth = $(window).width();
				var bottomHeight = windowheight+scrollTop - (blockheight + currentHeight);
				if($thisBlock.is(nsMenus.$submenuBlock.eq(0))){ //判断是否是第一个 如果是第一个加类名 否则 计算位置
					$thisBlock.addClass('first-position');
				}else{
					if(bottomHeight>0){
						$thisBlock.offset({top:currentHeight-1});
					}else{
						if(blockheight>(windowheight+scrollTop-containerHeight) || blockwidth > (windowwidth-containerwidth)){
							if(blockheight>(windowheight+scrollTop-containerHeight)){
								$thisBlock.css('height',windowheight+scrollTop-containerHeight);
								$thisBlock.offset({top:scrollTop+48});
							}else{
								$thisBlock.offset({top:(windowheight+scrollTop-blockheight-1)});
							}
							if(blockwidth > (windowwidth-containerwidth)){
								$thisBlock.css('width',windowwidth-containerwidth);
							}
							$thisBlock.css('overflow','auto');
						}else{
							$thisBlock.offset({top:(windowheight+scrollTop-blockheight-1)});
						}
					}
				}
				//计算在哪个上加class用于加clear：left
				var listIntToOuter = listwidthMargin - listwidth;
				var inlineLiNum = parseInt((blockwidthInt+listIntToOuter) / (listwidth+listIntToOuter));

				if(inlineLiNum>0){
					$thisBlock.width((listwidth+listIntToOuter)*inlineLiNum-listIntToOuter+30);
					
					for(i=inlineLiNum,j=1;i<$thisList.length;i=i*j){
						$thisList.eq(i).addClass("line-feed");
						j++;
					}
				}
			}else{
				console.log("没有二级菜单");
			}
		}
		nsMenus.$menusFirstLevel.off('click');
		nsMenus.$menusFirstLevel.on('click',function(event){
			// nsMenus.$menusFirstLevel.off('mouseenter mouseleave');
			var $this = $(this);
			// var $childMenuObj = $this.children('.sidebar-menu-item-row').children('a');
			var $childMenuObj = $this.children('a');
			if($childMenuObj.hasClass('current')){
				// 如果已经显示执行隐藏
				nsMenus.$menusFirstLevelInA.removeClass('current');
				nsMenus.$submenuBlock.addClass('hide');
				return;
			}
			nsMenus.$menusFirstLevelInA.removeClass('current');
			// var $thisInA = $this.children('div').eq(0).children('a');
			var $thisInA = $this.children('a');
			showThisBlockPosition($this,$thisInA);
		});
		function hoverFunction(event){
			var $this = $(this);
			// var $thisInA = $this.children('div').eq(0).children('a');
			var $thisInA = $this.children('a');
			if(event.type == 'mouseenter'){
				var setShow = setTimeout(function(){
					//用于设置延迟
					showThisBlockPosition($this,$thisInA);
				},200);
				$this.on('mouseleave',function(){
					clearTimeout(setShow);
				});
			}else{
				var setHide = setTimeout(function(){
					//用于设置延迟
					$thisInA.removeClass('current');
					nsMenus.$submenuBlock.addClass('hide');
				},200);
				$this.on('mouseenter',function(){
					clearTimeout(setHide);
				});
			}
		}
		// nsMenus.$menusFirstLevel.off('mouseenter mouseleave',hoverFunction);
		// nsMenus.$menusFirstLevel.on('mouseenter mouseleave',hoverFunction);
		function hideVisibleCurrent(event){
			if($(event.target).parents('#'+nsMenus.config.id).length == 0){
				nsMenus.$menusFirstLevelInA.removeClass('current');
				nsMenus.$submenuBlock.addClass('hide');
				// nsMenus.$menusFirstLevel.on('mouseenter mouseleave',hoverFunction);
			}
		}
		$(document).off('click',hideVisibleCurrent);
		$(document).on('click',hideVisibleCurrent);
	}
	return {
		init:init,											//初始化
		setCurrentMenu:setCurrentMenu,						//点亮默认菜单位置
		setCurrentMenuPosition:setCurrentMenuPosition,		//显示默认菜单位置
	}
})(jQuery)