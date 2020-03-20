/**
 * 设置页面布局
 * 
 * nsLayout.data 布局对象 包含nsTabs对象
 */
nsLayout.data = {};
var nsTabs = {};
//转化字符串成为JSON对象 格式是"a:b,c:d"->{a:b,c:d},字符串中不需要引号和双引号
nsLayout.convertOptions = function(optionsStr){
	if(typeof(optionsStr)=='undefined'){
		//如果配置字符串未定义则直接返回默认
		return {'position':'default'};
	}else{
		return nsVals.convertOptions(optionsStr);
	}
}
nsLayout.setNavDefaultsOptions = function(options){

}
nsLayout.setPanelDefaultOptions = function(options){
	var formatOptions = options;
	
	if(options.position){
		//如果位置存在则暂时无需处理
	}else{
		formatOptions.position = 'default';
	}

	/**************2017-11-28是否定义了用户配置属性***********************/
	if(typeof(options.isUserControl)=='boolean'){
		//定义了用户配置属性无需处理
	}else{
		//如果没有定义，默认为true，显示用户配置属性
		formatOptions.isUserControl = false;
	}
	if(typeof(formatOptions.col)=='undefined'){
		formatOptions.col = 12;
	};
	formatOptions.beforeHeight = this.height;  					//之前组件占用的高度
	formatOptions.rowId = this.rowNum;  						//第几行
	formatOptions.colId = this.colNum-this.rowNum*12; 	 		//第几列
	this.colNum += formatOptions.col;
	if(this.colNum%12==0){
		this.rowNum++;
		if(formatOptions.height){
			if(formatOptions.height!='auto'){
				this.height += formatOptions.height; //已占用高度
			}
		}else{
			this.height += 30;
		}
	}
	return formatOptions;
}

//设置默认的tabs设置项目
nsLayout.setPanelTabsDefaultOptions = function(tabsObj){
	var tabArrs = tabsObj.container.children('tab');
	tabsObj.isTabWidth = true;
	if(tabArrs.length>0){
		tabsObj.tab = {};
		nsTabs[tabsObj.id] = tabsObj;
		nsTabs.default = tabsObj;
		var tabClassWidth = [];
		var tabClassNumber = 0; 	//设置宽度的总和相加是否为100%
		var tabHasunit = false;		//是否含有单位设置如px,%
		for(var tabI = 0; tabI<tabArrs.length; tabI++){
			var $tab = $(tabArrs[tabI]);
			var tab = {};
			tab.container = $tab;
			if(typeof($tab.attr('ns-id'))=='undefined'){
				tab.nsId = 'tab'+tabI;
				tab.id = tabsObj.id+'-'+tab.nsId;
			}else{
				tab.nsId = $tab.attr('ns-id');
				tab.id = tabsObj.id+'-'+tab.nsId;
			}
			tab.optionsStr = $tab.attr("ns-options");
			tab.options = nsLayout.convertOptions(tab.optionsStr);
			if(typeof(tab.options.title)=='undefined'){
				tab.options.title = tab.nsId;
			}
			if(typeof(tab.options.width) == 'number'){
				tabClassNumber += tab.options.width;
			}else{
				tabClassWidth.push(tabI);
			}
			tabsObj.tab[tab.nsId] = tab;
		}
		if(tabClassNumber > 100){
			//tab宽大于100抛出异常
			tabsObj.isTabWidth = false;
		}
		if(tabClassNumber < 100){
			//小于100,判断一下是否是有未设置宽度的tab,如果没有则抛出异常，否则未设置的宽度tab自适应列宽
			if(tabClassWidth.length > 0){
				//有未设置的宽度
				var tempWidth = 100 - tabClassNumber;
				var widthPercent = tempWidth / tabClassWidth.length;
				widthPercent = Math.floor(widthPercent*1000)/1000;
				for(var classI = 0; classI < tabArrs.length; classI++){
					if($.inArray(classI,tabClassWidth)>-1){
						var $tab = $(tabArrs[classI]);
						var tab = {};
						tab.container = $tab;
						if(typeof($tab.attr('ns-id'))=='undefined'){
							tab.nsId = 'tab'+tabI;
							tab.id = tabsObj.id+'-'+tab.nsId;
						}else{
							tab.nsId = $tab.attr('ns-id');
							tab.id = tabsObj.id+'-'+tab.nsId;
						}
						tab.optionsStr = $tab.attr("ns-options");
						tab.options = nsLayout.convertOptions(tab.optionsStr);
						if(typeof(tab.options.title)=='undefined'){
							tab.options.title = tab.nsId;
						}
						tab.options.width = widthPercent+'%';
						tabsObj.tab[tab.nsId] = tab;
					}
				}
			}else{
				//tab宽小于100抛出异常
				tabsObj.isTabWidth = false;
			}
		}
	}
	return tabsObj;
}
//处理模态页默认值
nsLayout.setPanelModalOptions = function(layoutOptions,options){
	if(layoutOptions.type=='modal'){
		switch(layoutOptions.modalClass){
			case 'treetable':
				//设定border
				options.border = nsVals.getDefaultFalse(options.border);
				options.singlerow = nsVals.getDefaultTrue(options.singlerow);
				break;
			default:
				break;
		}
	}
	return options;
}
//layout初始化方法
nsLayout.init = function(layoutID, layoutOptions){
	//layoutID: container的id
	/*layoutOptions: object layout的相关参数
	 *	afterHandler:function(layoutData){} //初始化完成后的回调参数
	 */
	if(typeof(layoutOptions)=='undefined'){
		layoutOptions = {};
	}
	var $container = $("#"+layoutID);
	var $nav = $container.children('nav');
	//合法性验证 这部分不全，需要补充
	if(debugerMode){
		if(typeof(layoutID)!='string'){
			console.error("参数只能是ID字符串");
			console.error(layoutID);
			return false;
		}
		if($.isEmptyObject($container)||$container.length==0){
			console.error("nsLayout.init()参数："+layoutID+" 错误，无法找到指定ID对应的DOM");
			return false;
		}
		if($nav.length>1){
			console.error("主导航只能有一个");
			return false;
		}
	}
	//初始化基本数据对象
	function getlayoutData(){
		var initData = {};
		nsLayout.data[layoutID] = initData;  //将新建立的layout数据放到nsLayout.data里
		initData.id = layoutID;
		initData.container = $container;
		initData.optionsStr = $container.attr('ns-options');
		initData.options = nsLayout.convertOptions(initData.optionsStr);
		
		if(typeof(initData.options.isShowHistoryBtn)!='boolean'){
			if (typeof(nsLayout.isShowHistoryBtn) != 'boolean') {
				nsLayout.isShowHistoryBtn = true;
			}
			if (nsLayout.isShowHistoryBtn) {
				var isContainer = true; //判断是不是<container>标签
				if ($container.parent().attr('class') === 'content') { //弹出页
					isContainer = false;
				}
				initData.options.isShowHistoryBtn = isContainer; //是否显示后退页按钮，默认显示 PS:弹出页不显示后退按钮，如果已定义了historyBtn，则按已定义的优先
			}else{
				initData.options.isShowHistoryBtn = false;
			}
		}
		/**********sjj 20180522 添加刷新图标 start****************************/
		if(typeof(initData.options.isShowRefreshBtn)!='boolean'){
			if (typeof(nsLayout.isShowRefreshBtn) != 'boolean') {
				nsLayout.isShowRefreshBtn = true;
			}
			if (nsLayout.isShowRefreshBtn) {
				var isContainer = true; //判断是不是<container>标签
				if ($container.parent().attr('class') === 'content') { //弹出页
					isContainer = false;
				}
				switch(initData.options.templates){
					case 'formTable':
					case 'listFilter':
					case 'singleTable':
					case 'tabFormList':
					case 'treeTable':
					case 'doubleTables':
						isContainer = false;
						break;
				}
				initData.options.isShowRefreshBtn = isContainer; //是否显示后退页按钮，默认显示 PS:弹出页不显示后退按钮，如果已定义了historyBtn，则按已定义的优先
			}else{
				initData.options.isShowRefreshBtn = false;
			}
		}
		/**********sjj 20180522 添加刷新图标 end****************************/
		initData.package = $container.attr('ns-package');
		//是否支持自定义配置
		if(initData.options.custom){
			initData.customConfig = {};
		}else{
			initData.customConfig = false;
		}
		return initData;
	}
	var layoutData = getlayoutData();
	//根据配置添加nav
	if (layoutData.options.isShowHistoryBtn && $nav.length == 0) {
		var navId = "nav-" + Math.floor(Math.random() * 10000000000 + 1);
		$container.append('<nav ns-id="' + navId + '"></nav>');
		$nav = $container.children('nav');
	}else{
		//sjj20180522 刷新和历史按钮
		if (layoutData.options.isShowRefreshBtn && $nav.length == 0) {
			var navId = "nav-" + Math.floor(Math.random() * 10000000000 + 1);
			$container.append('<nav ns-id="' + navId + '"></nav>');
			$nav = $container.children('nav');
		}
	}
	
	//处理导航栏部分
	if($nav.length == 1){
		//处理导航栏数据
		layoutData.nav = {};
		layoutData.nav.nsId = $nav.attr('ns-id');
		layoutData.nav.id = layoutData.id+"-"+layoutData.nav.nsId;
		layoutData.nav.initContainer = $nav;
		if(typeof($nav.attr('ns-config'))!='undefined'){
			var package = $container.attr('ns-package')
			var config = $nav.attr('ns-config');
			if(config.indexOf('nav:')){
				config = config.replace(/nav:/,'');
			}
			config = $.trim(config);
			if(package){
				config = package+'.'+config;
			}
			layoutData.nav.config = eval(config);
		}
		if(layoutData.options.isShowHistoryBtn){
			var histroyBtn = {
				handler: function() {
					nsFrame.pageBack();
				}
			};
			if (typeof(layoutData.nav.config) == 'object') {
				var navConfig = layoutData.nav.config;
				if (typeof(navConfig.bigBtns) == 'object') {
					if (typeof(navConfig.bigBtns.histroyBtn) == 'undefined') {
						navConfig.bigBtns.histroyBtn = histroyBtn;
					}
				} else {
					navConfig.bigBtns = {
						histroyBtn: histroyBtn
					};
				}
			} else {
				layoutData.nav.config = {
					bigBtns: {
						histroyBtn: histroyBtn
					}
				};
			}
		}
		//sjj 20180522刷新按钮
		if(layoutData.options.isShowRefreshBtn){
			var refreshBtn = {
				handler:function(){
					nsFrame.pageRefresh(layoutData);
				}
			}
			if (typeof(layoutData.nav.config) == 'object') {
				var navConfig = layoutData.nav.config;
				if (typeof(navConfig.bigBtns) == 'object') {
					if (typeof(navConfig.bigBtns.refreshBtn) == 'undefined') {
						navConfig.bigBtns.refreshBtn = refreshBtn;
					}
				} else {
					navConfig.bigBtns = {
						refreshBtn: refreshBtn
					};
				}
			} else {
				layoutData.nav.config = {
					bigBtns: {
						refreshBtn: refreshBtn
					}
				};
			}
		}
		layoutData.nav.optionsStr = $nav.attr("ns-options")
		layoutData.nav.options = nsLayout.convertOptions(layoutData.nav.optionsStr);
		nsLayout.initNav(layoutData);
	}else{
		//没有导航栏数据
	}

	var htmlCodeArr = [];
	var planeRowsArr = [];
	this.rowNum = 0;
	this.colNum = 0;
	this.height = 0;

	//处理普通面板
	
	/**********2017-11-28 排序********************************/
	var storeId = 'ly-'+layoutData.id;
	var storeStr = store.get(storeId);//从本地缓存读取数据
	/*if(storeStr){
		$container.html(storeStr.html)
	}*/
	var $layoutDom = $container.children(":not(nav)"); 
	if($layoutDom.length<1){
		//没有符合的面板组件
	}else{
		layoutData.tabs = {};
		layoutData.panels = {};
		for(var layoutIndex=0; layoutIndex<$layoutDom.length; layoutIndex++){
			var $layout = $($layoutDom[layoutIndex]);
			var tagNameStr = $layout.prop('tagName');//标签名称
			tagNameStr = tagNameStr.toLowerCase();//转换成小写

			switch(tagNameStr){
				case 'panel':
					var $panel = $layout;
					var panel = {};
					panel.nsId = $panel.attr("ns-id");
					if(typeof(panel.nsId)=='undefined'){
						panel.nsId = 'panel-'+(layoutIndex+1);
					}
					panel.id = layoutData.id+'-'+panel.nsId;
					panel.disorder = (layoutIndex+1);
					panel.container = $panel;
					panel.optionsStr = $panel.attr('ns-options');
					panel.options = nsLayout.convertOptions(panel.optionsStr);
					panel.options = nsLayout.setPanelDefaultOptions(panel.options);
					panel.options = nsLayout.setPanelModalOptions(layoutData.options, panel.options);
					panel.panelcontainer =  nsLayout.getPanelContainerData($container,$panel);//获得容器面板
					panel.config = nsLayout.getPanelConfig($container, $panel);
					layoutData.panels[panel.id] = panel;
					panel.beforeHeight = this.height;  //计算高度
					var outputPanelHtml = nsLayout.getPanelHtml(layoutData,panel);
					htmlCodeArr.push(outputPanelHtml);
					break;
				case 'tabs':
					var $tabs = $layout;
					var tabs = {};
					tabs.nsId = $tabs.attr('ns-id');
					if(typeof(tabs.nsId)=='undefined'){
						tabs.nsId = 'tabs-'+(layoutIndex+1);
					}
					tabs.id = layoutData.id+"-"+tabs.nsId;
					tabs.container = $tabs;
					tabs.disorder = (layoutIndex+1);
					tabs.optionsStr = $tabs.attr('ns-options');
					tabs.options = nsLayout.convertOptions(tabs.optionsStr);
					tabs.options = nsLayout.setPanelDefaultOptions(tabs.options);
					tabs.layoutID = layoutData.id;
					tabs = nsLayout.setPanelTabsDefaultOptions(tabs); //获取单独的属性
					layoutData.tabs[tabs.nsId] = tabs;
					//处理tabs上的config对象
					var configValue = tabs.container.attr('ns-config');
					if(typeof(configValue)!='undefined'){
						configValue = configValue.substring(configValue.indexOf(':')+1,configValue.length);
						tabs.config = eval(layoutData.package+'.'+configValue);
						if(debugerMode){
							if(typeof(tabs.config)!='object'){
								console.error('tabs的config配置参数 '+configValue+' 不正确，无法正确初始化');
								return false;
							}
						}
						
					}else{
						tabs.config = {};
					}
					//处理各个tab上的配置文件，tab转成了panel来处理
					$.each(tabs.tab,function(key,value){
						var tabobj = tabs.tab[key];
						tabobj.config = nsLayout.getPanelConfig($container, value.container);
						layoutData.panels[tabobj.id] = tabobj;
						tabs.tab[key].panel = tabobj;
					});
					var outputTabsHtml = nsLayout.getTabsHtml(layoutData,tabs);
					htmlCodeArr.push(outputTabsHtml);
					break;
			}
		}
	}
	/**********2017-11-28 排序********************************/
	/*var panels = $container.children('panel');
	if(panels.length<1){
		//没有面板组件
	}else{
		layoutData.panels = {};
		for(var panelIndex=0; panelIndex<panels.length; panelIndex++){
			var $panel = $(panels[panelIndex]);
			var panel = {};
			panel.nsId = $panel.attr("ns-id");
			if(typeof(panel.nsId)=='undefined'){
				panel.nsId = 'panel-'+(panelIndex+1);
			}
			panel.id = layoutData.id+'-'+panel.nsId;
			panel.disorder = (panelIndex+1);
			panel.container = $panel;
			panel.optionsStr = $panel.attr('ns-options');
			panel.options = nsLayout.convertOptions(panel.optionsStr);
			panel.options = nsLayout.setPanelDefaultOptions(panel.options);
			panel.options = nsLayout.setPanelModalOptions(layoutData.options, panel.options);
			panel.config = nsLayout.getPanelConfig($container, $panel);
			layoutData.panels[panel.id] = panel;
			panel.beforeHeight = this.height;  //计算高度
			var outputPanelHtml = nsLayout.getPanelHtml(layoutData,panel);
			htmlCodeArr.push(outputPanelHtml);
		}
	}
	//tabs 普通tabs
	var $tabsDom =  $container.children('tabs');
	if($tabsDom.length<1){
		//没有Tab组件
	}else{
		layoutData.tabs = {};
		if(typeof(layoutData.panels)=='undefined'){
			layoutData.panels = {};
		}
		for(var tabsI=0; tabsI<$tabsDom.length; tabsI++){
			var $tabs = $($tabsDom[tabsI]);
			var tabs = {};
			tabs.nsId = $tabs.attr('ns-id');
			if(typeof(tabs.nsId)=='undefined'){
				tabs.nsId = 'tabs-'+(tabsI+1);
			}
			tabs.id = layoutData.id+"-"+tabs.nsId;
			tabs.container = $tabs;
			tabs.disorder = (tabsI+1);
			tabs.optionsStr = $tabs.attr('ns-options');
			tabs.options = nsLayout.convertOptions(tabs.optionsStr);
			tabs.options = nsLayout.setPanelDefaultOptions(tabs.options);
			tabs.layoutID = layoutData.id;
			tabs = nsLayout.setPanelTabsDefaultOptions(tabs); //获取单独的属性
			layoutData.tabs[tabs.nsId] = tabs;
			//处理tabs上的config对象
			var configValue = tabs.container.attr('ns-config');
			if(typeof(configValue)!='undefined'){
				configValue = configValue.substring(configValue.indexOf(':')+1,configValue.length);
				tabs.config = eval(layoutData.package+'.'+configValue);
				if(debugerMode){
					if(typeof(tabs.config)!='object'){
						console.error('tabs的config配置参数 '+configValue+' 不正确，无法正确初始化');
						return false;
					}
				}
				
			}else{
				tabs.config = {};
			}
			//处理各个tab上的配置文件，tab转成了panel来处理
			$.each(tabs.tab,function(key,value){
				var tabobj = tabs.tab[key];
				tabobj.config = nsLayout.getPanelConfig($container, value.container);
				layoutData.panels[tabobj.id] = tabobj;
				tabs.tab[key].panel = tabobj;
			});
			var outputTabsHtml = nsLayout.getTabsHtml(layoutData,tabs);
			htmlCodeArr.push(outputTabsHtml);
		}
	}*/
	//输出HTML
	var outputHTMLCode = '';
	if(htmlCodeArr.length>0){
		for(var codeI=0; codeI<htmlCodeArr.length; codeI++){
			outputHTMLCode+=htmlCodeArr[codeI];
		}
		var rowClass = '';
		if(layoutData.options.type){
			if(layoutData.options.type == 'modal'){
				//layoutData.options.type = layoutData.options.modalClass;
				rowClass = 'layout-modal '+layoutData.options.modalClass;
			}else{
				rowClass = layoutData.options.type;
			}
		}
		if(layoutData.options.templates){rowClass += ' '+layoutData.options.templates;}
		if(layoutData.options.mode){rowClass += ' '+layoutData.options.mode;}
		layoutData.rowTotal = this.rowNum;
		layoutData.colTotal = this.colNum;
		//layoutData.height = this.height;
		delete this.rowNum;
		delete this.colNum;
		delete this.height;

		layoutData.layoutID = 'layout-'+layoutData.id
		outputHTMLCode = 
			'<div class="row layout-planes '+rowClass+'" id="'+layoutData.layoutID+'" nsid="'+layoutData.id+'">'
				+ outputHTMLCode
			+'</div>';
		$container.after(outputHTMLCode);
		layoutData.$container = $('#'+layoutData.layoutID);

		/**************************************************/
		//给面板容器添加事件
		if(layoutData.panels){
			for(var panel in layoutData.panels){
				var panelData = layoutData.panels[panel].panelcontainer;
				if(typeof(panelData)=='object'){
					if(!$.isEmptyObject(panelData)){
						var panelID = layoutData.panels[panel].id;
						var uID = panelID+'-list';
						if($.isArray(panelData.tabs)){
							$('#'+uID+' li a').on('click',{tabs:panelData.tabs},nsTabs.containerTabClickHandler);
						}
						if($.isArray(panelData.btns)){
							var navJson = {
								id:panelID+'-btns',
								isShowTitle:typeof(panelData.isShowTitle)=='boolean' ? panelData.isShowTitle : false,
								btns:[panelData.btns]
							}
							nsNav.init(navJson);
						}
						if($.isArray(panelData.forms)){
							var formJson = {
								id:panelID+'-customerform',
								isSingleMode:panelData.isSingleMode,
								plusClass:'container-panel-customerform',
								form:panelData.forms,
								size:panelData.formSize
							}
							nsForm.formInit(formJson);
						}
					}
				}
			}
		}
		//panelData.panelcontainer
		/*************************************************/

		//给tab添加事件
		if(layoutData.tabs){
			for(tabs in layoutData.tabs){
				if(typeof(layoutData.tabs[tabs].config)=='object'){
					//单击tab标签事件
					$('#tabs-'+layoutData.tabs[tabs].id+' li a').on('click',nsTabs.tabClickHanlder)
				}
			}
		};
		if(layoutData.options.custom){
			//允许自定义配置
			layoutData.customConfig.pageCode = layoutData.id;
			$.each(layoutData.panels,function(panelID,panelData){
				if(panelData.config){
					try{
						var configObj = {};
						configObj = eval(panelData.config.value);
						configObj.id = panelData.id;
						//处理表单
						if(panelData.config.type=='form'){
							if(layoutData.customConfig.formJson){
								//如果有formJson
							}else{
								//第一个formJson，先新建
								layoutData.customConfig['formJson'] = [];
							}
							layoutData.customConfig.formJson.push(configObj);
						//处理table
						}else if(panelData.config.type=='table'){
							if(layoutData.customConfig.tableJson){ 
								//如果有tableJson
							}else{
								//第一个tableJson，先新建
								layoutData.customConfig['tableJson'] = [];
								layoutData.customConfig['tableConfig'] = {};
							}
							var columnUser = {};
							columnUser.id = 'table-'+configObj.id;
							columnUser.configTitle = configObj.data.configTitle;
							columnUser.columns = configObj.columns;

							layoutData.customConfig.tableConfig[columnUser.id] = configObj
							layoutData.customConfig.tableJson.push(columnUser);
							//表格组件需要添加table标签
							var panelHeight = $("#"+panelData.id).height();
							var systemType = $('body').attr('ns-system');
							//仅在PC端，则开启uiconfig的紧凑模式情况下打开紧凑模式 cy 20180307
							/*if(systemType == 'pc'){
								if(typeof(nsUIConfig)=='object'){
									if(nsUIConfig.tableHeightMode == 'compact'){
										tableClass += ' table-sm';
									}
								}
							}*/
							var styleStr = '';
							if(panelData.options.height){
								styleStr = 'style="height:'+panelHeight+'px"';
							}
							var tabelHtml = 
							'<div class="table-responsive" '+styleStr+'>'
								+'<table cellspacing="0" class="table table-hover table-striped table-bordered dataTable" '
								+'id="table-'+configObj.id+'">'
								+'</table>'
							+'</div>';
							$("#"+configObj.id+' .panel-body').html(tabelHtml);
						}else if(panelData.config.type=='tree'){
							//tree类型添加HTML
							if(layoutData.customConfig.treeJson){ 
								//如果有treeJson
							}else{
								//第一个treeJson，先新建
								layoutData.customConfig['treeJson'] = {};
							}
							var treeHtml = 
							'<div id="tree-'+configObj.id+'"></div>'
							$("#"+configObj.id+' .panel-body').html(treeHtml);
							configObj.id = 'tree-'+panelData.id;
							configObj.isLayout = true;
							nsTree.init(configObj);
						}else if(panelData.config.type == 'ztree'){
							configObj.id = panelData.id;
							treeSelectorUI.treePlane.init(configObj);
						}
					}catch(error){
						var errInfo = "面板"+panelData.nsId +" config参数错误：<br>" + error.message + "\n\n";
						nsalert(errInfo,'error');
					}
					
				}
			});
			nsCustomConfig.init(layoutData.customConfig);
		}else{
			//不允许自定义配置
			$.each(layoutData.panels,function(panelID,panelData){
				if(panelData.config){
					var configObj = eval(panelData.config.value);
					if(debugerMode){
						if(typeof(configObj)=='undefined'){
							console.error(panelData.config.value+' 对象未定义');
							console.error(panelData.container.parent().html());
						}
					}
					panelData.config.value = configObj;
					configObj.id = panelData.id;

					var ctype = panelData.config.type;
					switch(ctype){
						case 'form':
							nsForm.formInit(configObj);
							break;
						case 'formPlate':
							nsUI.formPlate.init(configObj);
							break;
						case 'logtimeline':
							nsUI.logTimeline.init(configObj);
							break;
						case 'table':
							//如果是模态页，需要设置属性
							if(layoutData.options.type=='modal'){
								nsLayout.setModalTable(configObj, layoutData.options.modalClass);
							}
							configObj.data.tableID = 'table-'+panelData.id;
							//存储必要的信息到ui对象中
							if(layoutData.options.type=='modal'){
								configObj.ui.modalMode = {
									modalClass:layoutData.options.modalClass
								};
							}
							configObj.ui = typeof(configObj.ui)=='object'?configObj.ui:{};
							configObj.ui.$container = $("#"+panelData.id);
							//containerHeight = containerHeight-containerHeight%40;
							configObj.ui.containerHeight = 0;
							if(panelData.options.height){
								configObj.ui.containerHeight = configObj.ui.$container.height();
							}
							/*var tableClass = "table table-hover table-bordered table-striped";
							var tableResponsiveClass = "table-responsive";
							if(panelData.options.singlerow){
								tableClass += ' table-singlerow';
							}
							var systemType = $('body').attr('ns-system');
							//仅在PC端，则开启uiconfig的紧凑模式情况下打开紧凑模式 cy 20180307
							if(systemType == 'pc'){
								if(typeof(nsUIConfig)=='object'){
									if(nsUIConfig.tableHeightMode == 'compact'){
										tableClass += ' table-sm';
										tableResponsiveClass += ' table-responsive-sm';
									}
								}
							}
							var styleStr = '';
							if(panelData.options.height){
								styleStr = 'style="height:'+configObj.ui.containerHeight+'px"';
							}
							var tabelHtml = 
							'<div class="'+tableResponsiveClass+'" '+styleStr+'>'
								+'<table cellspacing="0" class="'+tableClass+'" '
								+'id="table-'+panelData.id+'">'
								+'</table>'
							+'</div>'
							configObj.ui.$container.html(tabelHtml);*/
							if(typeof(nsList)=='undefined'){
								//没有定义就默认的table调用
								baseDataTable.init(configObj.data, configObj.columns, configObj.ui, configObj.btns);
							}else{
								nsList.init(configObj.data, configObj.columns, configObj.ui, configObj.btns);
							}
							break;
						case 'rendertable':
							//如果是模态页，需要设置属性
							if(layoutData.options.type=='modal'){
								nsLayout.setModalTable(configObj, layoutData.options.modalClass);
							}
							configObj.data.tableID = 'table-'+panelData.id;
							//存储必要的信息到ui对象中
							if(layoutData.options.type=='modal'){
								configObj.ui.modalMode = {
									modalClass:layoutData.options.modalClass
								};
							}
							configObj.ui = typeof(configObj.ui)=='object'?configObj.ui:{};
							configObj.ui.$container = $("#"+panelData.id);
							//containerHeight = containerHeight-containerHeight%40;
							configObj.ui.containerHeight = 0;
							if(panelData.options.height){
								configObj.ui.containerHeight = configObj.ui.$container.height();
							}	
							nsList.init(configObj.data, configObj.columns, configObj.ui, configObj.btns);
							break;
						case 'tree':
							//tree类型添加HTML
							if(layoutData.customConfig.treeJson){ 
								//如果有treeJson
							}else{
								//第一个treeJson，先新建
								layoutData.customConfig['treeJson'] = {};
							}
							var treeHtml = '<div id="tree-'+configObj.id+'"></div>';
							$("#"+panelData.id).html(treeHtml);
							configObj.id = 'tree-'+panelData.id;
							configObj.isLayout = true;
							nsTree.init(configObj);
							break;
						case 'ztree':
							configObj.id = panelData.id;
							treeSelectorUI.treePlane.init(configObj);
							break;
						case 'overview-box':
							configObj.id = panelData.id;
							nslanding.initTap(configObj)
							break;
						case 'echart':
							var panelId = panelData.id;
							nsChartUI.initCharts(panelData.config,panelId);
							break;
						case 'calendar':
							configObj.id = panelData.id;
							nsFullcalendar.initcalendar(configObj);
							break;
						case 'list':
							configObj.id = panelData.id;
							configObj.height = panelData.options.height;
							nslanding.initList(configObj);
							break;
						case 'echarttable':
							if(configObj.isTargetId){
								configObj.isTargetId = layoutData.id + '-' + configObj.isTargetId;
							}
							nsUI.echarttable.init(configObj);
							break;
						case 'simplepanel':
							nsUI.welcomePage.charge(configObj);
							break;
						case 'customertable':
							var $container = $('#'+panelData.id);
							//var height = $container.height();
							var tableID = 'table-'+panelData.id;
							var tableClass = "table table-hover table-striped table-singlerow table-bordered table-sm";
							var tabelHtml = '<table cellspacing="0" class="'+tableClass+'" '
												+'id="'+tableID+'">'
											+'</table>';
							$container.html(tabelHtml);
							configObj.tableID = tableID;
							nsUI.customertable.init(configObj);
							break;
						case 'schedule':
							var $container = $('#'+panelData.id);
							var scheduleHtml = '<div class="calendar" id="schedule-'+panelData.id+'"></div>';
							configObj.scheduleID = 'schedule-'+panelData.id;
							$container.html(scheduleHtml);
							nsUI.schedule.init(configObj);
							break;
					}
				}
			});
		}
		/*************2017-11-28*******************/
		nsLayout.userControlHandler(layoutData);//用户配置事件调用
		//nsLayout.resizeHandler();//页面发生变化调用，主要用于计算自动高度 by caoyuan 20180130
		//添加了回调函数，cy.20180510
		if(layoutOptions.afterHandler){
			layoutOptions.afterHandler(layoutData);
		}
	}
}
/*****************容器面板tab事件 start**************************/
nsTabs.containerTabClickHandler = function(ev){
	var $this = $(this);
	var tabs = ev.data.tabs;
	var nIndex = $this.attr('ns-index');
	var tabID = $this.attr('id');
	var handler = tabs[nIndex].handler;
	$this.closest('li').addClass('active');
	$this.closest('li').siblings().removeClass('active');
	$('#tab-'+tabID).addClass('active');
	$('#tab-'+tabID).siblings().removeClass('active');
	if(typeof(handler)=='function'){
		var $ul = $this.closest('ul.nav-tabs');
		var uID = $ul.attr('id');
		var planeID = uID.substring(0,uID.lastIndexOf('-'));
		var layoutID = $this.closest('.row.layout-planes').attr('nsid');
		var config = nsLayout.data[layoutID].panels[planeID].config;
		var tabsID = uID;
		var callbackData = {
			layoutID:layoutID,
			planeID:planeID,
			tabsID:tabsID,
			tabID:tabID,
			config:config,
			container:nsLayout.data[layoutID].panels[planeID].panelcontainer
		}
		handler(ev,callbackData);
	}
}
/*****************容器面板tab事件 end***************************/
/*************2017-11-28 用户配置事件 start***********************/
nsLayout.userControlHandler = function(layoutData){
	var $container = layoutData.$container;
	$container.children('div').children('button[ns-operator="dragger"]').off('mousedown');
	$container.children('div').children('button[ns-operator="dragger"]').on('mousedown',function(ev){
		var containerId = $(this).attr('nsId');
		var nstype = $.trim($(this).attr('ns-type'));
		var data;
		var $source = $(this).closest('div');
		switch(nstype){
			case 'nspanel':
				data = layoutData.panels[containerId];
				break;
			case 'tabs':
				var tabId = containerId.substring(layoutData.id.length+1,containerId.length);
				data = layoutData.tabs[tabId];
				break;
		}
		var obj = {
			ev:ev,
			$this:$(this),
			$source:$source,
			data:data,
			layoutData:layoutData
		}
		nsLayout.userControlDragAdd(obj)
	});
	$container.children('div').children('button[ns-operator="config"]').off('click');
	$container.children('div').children('button[ns-operator="config"]').on('click',function(ev){
		var containerId = $(ev.target).closest('button').attr('nsId');
		var nstype = $.trim($(ev.target).closest('button').attr('ns-type'));
		var configData;
		var tabsForm = [];
		switch(nstype){
			case 'nspanel':
				configData = layoutData.panels[containerId];
				break;
			case 'tabs':
				var tabId = containerId.substring(layoutData.id.length+1,containerId.length);
				configData = layoutData.tabs[tabId];
				var tabData = configData.tab;
				tabsForm.push({
					element: 	'label',
					label: 		'tab设置',
					width: 	 	'100%',
				})
				for(var tabIndex in tabData){
					var i = 1;
					tabsForm.push({
						id: 		tabIndex,
						label: 		'标题'+i,
						type: 		'text',
						rules: 		'required',
						column: 	6,
						value: 		tabData[tabIndex].options.title
					},{
						id: 		tabIndex,
						label: 		'列宽'+i,
						type: 		'text',
						rules: 		'required',
						column: 	6,
						value: 		tabData[tabIndex].options.width
					})
					i++;
				}
				break;
			default:
				break;
		}
		var options = configData.options;
		var panelsLength = layoutData.container.children(":not(nav)").length;
		var orderLength = '1-'+panelsLength;
		var forms = [
			{
				html:'<div><span>列宽只能设置为1-12的正整数，边框目前只支持设置左、右,排序只能依据当前显示的长度来设置排序</span></div>',
			},
			{
				id: 		'userCol',
				label: 		'设置宽度(1-12)',
				type: 		'text',
				rules: 		'required positiveInteger min=1 max=12',
				value: 		options.col,
				column: 	6,
			},{
				id: 		'userHeight',
				label: 		'设置高度',
				type: 		'text',
				//rules: 		'required',
				value: 		options.height,
				column: 	6,
			},{
				id: 			'userBorder',
				label: 			'设置边框',
				type: 			'select',
				value: 			options.border,
				textField: 		'name',
				valueField: 	'id',
				column: 	6,
				subdata: 		[
					{
						name:'left',
						id:'left'
					},{
						name:'right',
						id:'right'
					}
				],
			},{
				id: 		'userOrder',
				label: 		'显示序号('+orderLength+')',
				type: 		'text',
				column: 	6,
				rules: 		'positiveInteger min=1 max='+panelsLength+'',
				value: 		configData.disorder
			}
		]
		var formArr = $.merge(forms,tabsForm);
		var userContrlDialog = {
			id: 	"plane-userDialog",
			title: 	"用户配置",
			size: 	"b",
			form:[formArr],
			btns:[
				{
					text: 		'保存',
					handler: 	function(){
						var formJson = nsForm.getFormJSON('plane-userDialog');
						if(formJson){
							var options = configData.options;
							options.col = formJson.userCol;
							options.height = formJson.userHeight;
							options.border = formJson.userBorder;
							var optionsStr = "col:"+options.col+",height:"+options.height+",border:"+options.border+",isUserControl:"+options.isUserControl;
							var oldOrder = Number(configData.disorder); 
							var newOrder = Number(formJson.userOrder);
							configData.container.removeAttr('ns-options');
							configData.container.attr('ns-options',optionsStr);
							if(oldOrder < newOrder){
								//向后移
								layoutData.container.children(":not(nav)").eq(newOrder-1).after(configData.container);
							}else if(oldOrder > newOrder){
								//向前移
								layoutData.container.children(":not(nav)").eq(newOrder-1).before(configData.container);
							}
							if(nstype == 'tabs'){
								//tab表格配置里面可以修改标题
								var tabData = configData.tab;
								for(var tabs in tabData){
									tabData[tabs].options.title = formJson[tabs];
									var optionsStr = "title:"+formJson[tabs];
									tabData[tabs].container.removeAttr('ns-options');
									tabData[tabs].container.attr('ns-options',optionsStr);
								}
							}
							nsdialog.hide();
							nsLayout.destroy(layoutData);
						}
					},
				}
			]
		}
		nsdialog.initShow(userContrlDialog);
	})
}
//拖拽执行
nsLayout.dragItem = {};
nsLayout.userControlDragAdd = function(obj){
	//拖拽对象相对于哪个元素而言进行的拖拽
	var $source = obj.$source;//操作对象
	var data = obj.data;//相关数据
	var layoutData = obj.layoutData;
	var offsetJson = $source.offset();//返回偏移坐标
	var parentOffset = $source.closest('.main-content.table-content').offset();
	var left = offsetJson.left - parentOffset.left;
	var top = offsetJson.top - parentOffset.top;
	var leftX = obj.$this.offset().left - offsetJson.left;
	var topY = obj.$this.offset().top -  offsetJson.top;
	var positionJson = {
		mouseX:obj.ev.offsetX + leftX,
		mouseY:obj.ev.offsetY + topY,
		left:left,
		top:top,
		width:$source.outerWidth(),
		height:$source.outerHeight()
	}
	nsLayout.dragItem.postion = positionJson;
	var positionStyle = 'left:'+offsetJson.left+'px;';  				//top
	positionStyle += ' top:'+offsetJson.top+'px;';					//left
	positionStyle += ' width:'+positionJson.width+'px; '; 	//width
	positionStyle += ' height:'+positionJson.height+'px;'; 	//width
	var nsIndex = $source.index();
	var itemHtml = '<div id="nsLayoutBoardDragItem" class="nsLayout-board-dragitem" ns-index="'+nsIndex+'" style="'+positionStyle+'"></div>';
	if($('#nsLayoutBoardDragItem').length>0){
		$('#nsLayoutBoardDragItem').remove();
	}
	$('body').append(itemHtml);//追加拖拽对象
	//拖拽方法
	var $drag = $('#nsLayoutBoardDragItem');//拖拽对象
	nsLayout.dragItem.available = [];
	layoutData.$container.children().each(function(key,value){
		var tarDiv = $(this);
		var tarDivPos = {x1: 0, y1: 0, x2: 0, y2: 0}; //目标对象的四个坐标
		var targetOffset = tarDiv.offset();
		var targetWidth = tarDiv.outerWidth();
		var targetHeight = tarDiv.outerHeight();
		//计算精确值
		var targetX2 = addFloat(targetOffset.left,targetWidth);
		var valueStr = targetX2.toString();
		var pointPosition = valueStr.length - valueStr.indexOf('.')-1;
		targetX2 = targetX2.toFixed(pointPosition - 1);
		targetX2 = parseInt(targetX2);
		//计算精确值
		var targetY2 = addFloat(targetOffset.top,targetHeight);
		var valueStr2 = targetY2.toString();
		var pointPositionY = valueStr2.length - valueStr2.indexOf('.')-1;
		targetY2 = targetY2.toFixed(pointPositionY - 1);
		targetY2 = parseInt(targetY2);

		tarDivPos.x1 = targetOffset.left;
		tarDivPos.x2 = targetX2;
		tarDivPos.y1 = targetOffset.top;
		tarDivPos.y2 = targetY2;
		var currentTarget = {
			$targe:tarDiv,
			position:tarDivPos
		}
		nsLayout.dragItem.available.push(currentTarget);
	});
	function addFloat(a,b){
		var result;
		var o1 = nsUI.resultTable.floatToInteger(a);
		var o2 = nsUI.resultTable.floatToInteger(b);
		var n1 = o1.num;
		var n2 = o2.num;
		var t1 = o1.times;
		var t2 = o2.times;
		var max = t1 > t2 ? t1 : t2;
		if (t1 === t2) { // 两个小数位数相同
			result = n1 + n2;
		} else if (t1 > t2) { // o1 小数位 大于 o2
			result = n1 + n2 * (t1 / t2);
		} else { // o1 小数位 小于 o2
			result = n1 * (t2 / t1) + n2;
		}
		return result / max;
	}
	var availableIndex = 0;//目标元素的下标
	$(document).on('mousemove',function(ev){ 
		//拖拽开始
		dragHandler(ev);
		ev.stopPropagation();
	});
	$(document).on('mouseup',function(ev){
		//结束拖拽
		$(document).off('mousemove');
		$(document).off('mouseup');
		//处理拖拽对象
		console.log('stopPropagation')
		var dragIndex = Number($drag.attr('ns-index'));//拖拽元素下标
		console.log(dragIndex)
		console.log(availableIndex)
		if(dragIndex != availableIndex){
			nsLayout.dragSort(dragIndex,availableIndex,obj);
		}
		$drag.remove();
	})
	//拖拽的距离
	/******超出左侧距离不合法 left > 不能拖拽的区域*****************/
	function dragHandler(ev){
		var leftNumber = ev.pageX - positionJson.mouseX;
		var topNumber = ev.pageY - positionJson.mouseY;
		$drag.css({'top':topNumber, 'left':leftNumber});
		availableIndex = nsLayout.isAvailableZone($drag); //是否在有效区域内
	}
}

//判断拖拽区域是否合法
nsLayout.isAvailableZone = function($drag){
	var offsetXY = $drag.offset();
	var dragPos = {
		x1:offsetXY.left,
		x2:offsetXY.left + nsLayout.dragItem.postion.width,
		y1:offsetXY.top,
		y2:offsetXY.top + nsLayout.dragItem.postion.height
	}
	var availableArr = nsLayout.dragItem.available;
	var availableIndex = 0;
	for(var targetI=0; targetI<availableArr.length; targetI++){
		var tarDivPos = availableArr[targetI].position;
		if (dragPos.x2 >= tarDivPos.x1 && dragPos.x2 <= tarDivPos.x2 && dragPos.y2 >= tarDivPos.y1 && dragPos.y2 <= tarDivPos.y2){
			availableIndex = targetI;
		}
	}
	return availableIndex;
}
nsLayout.dragSort = function(dragIndex,targetIndex,dragJson){
	var layoutData = dragJson.layoutData;
	var $dragDom = dragJson.data.container;
	if(dragIndex < targetIndex){
		//向后移
		layoutData.container.children(":not(nav)").eq(targetIndex).after($dragDom);
	}else if(dragIndex > targetIndex){
		//向前移
		layoutData.container.children(":not(nav)").eq(targetIndex).before($dragDom);
	}
	nsLayout.destroy(layoutData)
}
//销毁layout执行
nsLayout.destroy = function(layoutData){
	if($('#'+layoutData.nav.id).length == 1){
		$('#'+layoutData.nav.id).remove();
		$('[waitingload="'+layoutData.nav.id+'"]').remove();
	}
	layoutData.$container.remove();
	var panels = layoutData.panels;
	var layoutsJson = {};
	for(panelsIndex in panels){
		layoutsJson[panelsIndex] = {
			id:panelsIndex,
			options:panels[panelsIndex].options,
			optionsStr:panels[panelsIndex].optionsStr,
			disorder:panels[panelsIndex].disorder
		}
	}
	var tabs = layoutData.tabs;
	for(tabsIndex in tabs){
		layoutsJson[tabsIndex] = {
			id:tabsIndex,
			options:tabs[tabsIndex].options,
			optionsStr:tabs[tabsIndex].optionsStr,
			disorder:tabs[tabsIndex].disorder
		}
	}
	var html = $.trim(layoutData.container.html());
	var storeJson = {
		layoutID:layoutData.id,
		layoutsJson:layoutsJson,
		html:html
	}
	var storeId = 'ly-'+layoutData.id;
	store.set(storeId,storeJson);
	nsLayout.init(layoutData.id);
}
/*************2017-11-28 用户配置事件 end***********************/
//设置表格的模态页属性
nsLayout.setModalTable = function(tabelConfig,modalClass){
	var isButton = false;
	//最后一个列的类型
	var lastColumn = tabelConfig.columns[tabelConfig.columns.length-1]
	var lastColumnType = typeof(lastColumn.formatHandler)=='object'?lastColumn.formatHandler.type:false;
	if(lastColumnType == 'button'){
		isButton = true;
	}
	if(isButton){
		if(typeof(lastColumn.width)=='undefined'){
			lastColumn.width = lastColumn.formatHandler.data.length * 30+10;
		}
		lastColumn.title = '<i class="fa fa-cogs" aria-hidden="true"></i>';
	}
	switch(modalClass){
		case 'treetable':
			//console.log()
			break;
	}
}
//得到面板容器数据
nsLayout.getPanelContainerData = function($container,$panel){
	if(typeof($panel.attr('ns-container'))!='undefined'){
		var package = $container.attr('ns-package')
		var container = $panel.attr('ns-container');
		var configStr = package+'.'+container;
		configStr = eval(configStr);
		return configStr;
	}else{
		return false;
	}
}
nsLayout.getPanelConfig = function($container,$panel){
	if(typeof($panel.attr('ns-config'))!='undefined'){
		var package = $container.attr('ns-package')
		var config = $panel.attr('ns-config');
		//统一写法，支持在nav标签里写nav：，但是要去掉才能用
		if(config.indexOf('nav:')){
			config = config.replace(/nav:/,'');
		}
		var configType = config.substr(0,config.indexOf(":"));
		var configStr = config.substr(config.indexOf(":")+1,config.length);
		configType = $.trim(configType);
		configStr = $.trim(configStr);
		package = $.trim(package);
		if(package){
			configStr = package+'.'+configStr;
		}
		var configJson = 
		{
			"type":configType,
			"value":configStr
		};
		return configJson;
	}else{
		return false;
	}
}
//页面发生变化调用，主要用于计算自动高度
nsLayout.resizeHandler = function(){
	$(window).resize(function(){
		//修改autoHeight面板的高度样式
		var $autoHeightArr = $('.nspanel.autoHeight');
		for(var i=0; i<$autoHeightArr.length; i++){
			var $autoHeight = $($autoHeightArr[i]);
			var styleStr = $autoHeight.attr('style');
			var heightStyleStr = styleStr.substr(styleStr.indexOf('height:')+7,10);
			heightStyleStr = heightStyleStr.substr(0,heightStyleStr.indexOf('px'));
			if(parseInt(heightStyleStr)>0){
				var heightNum = nsVals.containerHeight();
				var $layout = $autoHeight.parent();
				var layoutData = nsLayout.data[$layout.attr('id')];
				var panelData = layoutData.panels[$autoHeight.attr('id')];

				if(layoutData.options.type=='nospace'){
					heightNum = heightNum - panelData.options.beforeHeight -2;
				}else{
					heightNum = heightNum - panelData.options.beforeHeight -20 - panelData.options.rowId*10;
				}
				//处理行间距
				if(typeof(panelData.options.afterHeight)=='number'){
					if(layoutData.options.type=='nospace'){
						heightNum = heightNum-panelData.options.afterHeight;
					}else{
						var afterRowNum = 0;
						if(typeof(panelData.options.afterRow)=='number'){
							afterRowNum = panelData.options.afterRow;
						}
						heightNum = heightNum-panelData.options.afterHeight-afterRowNum*10;
					}
				}

				styleStr = styleStr.replace('height:'+heightStyleStr,'height:'+heightNum);
				$autoHeight.attr('style',styleStr);
			}
		}
	});
}
//初始化nav
nsLayout.initNav = function(layoutData){
	function resetModalBtns(btnsConfig){
	//修改按钮组输出类型，第一组是文字按钮，从第二组开始都是图标按钮
		for(var arrI = 0; arrI<btnsConfig.btns.length; arrI++){
			if(arrI==0){
				//第一组暂时不动，保持原样，以后会对数据进行过滤
			}else{
				//之后的组只显示图标
				for(var btnI=0; btnI<btnsConfig.btns[arrI].length; btnI++){
					btnsConfig.btns[arrI][btnI].isOnlyIcon = true;
				}
			}
		}
	}
	//如果没有指定位置，则默认为default
	if(typeof(layoutData.nav.options.position)!='string'){
		layoutData.nav.options.position = 'default';
	}
	if(typeof(layoutData.options.type)!='string'){
		layoutData.options.type = 'standard';
	}
	//位置相关的class 目前只有两个值：default/bottom(弹框时候在下面)
	var positionCls = '';
	if(layoutData.nav.options.position!='default'){
		positionCls = ' '+layoutData.nav.options.position;
	}else{
		positionCls = '';
	}
	//模板相关class
	var templatesCls = '';
	if(layoutData.nav.options.templates){
		templatesCls = ' '+layoutData.nav.options.templates;
	}else{
		templatesCls = '';
	}
	var navHtml = '';
	var rowClass = 'page-title nav-form'+positionCls+templatesCls;
	/***sjj 20180514  导航nav默认按钮样式需要添加公用class*****************/
	//是否是公用class isCommon 默认true,配置false之后不用公用的class
	var isCommonNav = typeof(layoutData.nav.isCommon)=='boolean' ? layoutData.nav.isCommon : true;
	if(isCommonNav){rowClass += ' layout-nav-common'}
	navHtml = '<div class="'+rowClass+'" id="'+layoutData.nav.id+'"></div>'

	layoutData.container.before(navHtml);
	layoutData.nav.$container = $('#'+layoutData.nav.id);
	if(typeof(layoutData.nav.config)=='undefined'){
		return;
	}
	layoutData.nav.config.id = layoutData.nav.id;
	if(layoutData.options.type=='standard'){
		//如果是普通页面
		if(layoutData.nav.config){
			if(layoutData.options.custom){
				//如果定制
				layoutData.customConfig.nav = [layoutData.nav.config];
			}else{
				nsNav.init(layoutData.nav.config);
			}
		}
	}else if(layoutData.options.type=='modal'){
		//如果是模态页面
		if(typeof(layoutData.nav.options)!='object'){
			layoutData.nav.options = {};
		}
		//自定义按钮配置项
		if(layoutData.options.custom){
			layoutData.nav.config.customContainer = {pageCode: layoutData.id}; //初始化自定义配置对象
			//默认跟随layout总体配置
			layoutData.nav.config.isCustom = true;
			
			if(typeof(layoutData.nav.options.custom)!='boolean'){
				//不设置是否控制则跟随layout的控制,则视为允许配置
				layoutData.nav.options.isConfig = true;
			}else{
				layoutData.nav.options.isConfig = layoutData.nav.options.custom;
			}
			//如果是要控制则配置所需项目
			if(layoutData.nav.options.isConfig == true){
				layoutData.nav.config.customContainer.nav = true;
			}
		}
		//搜索框容器
		//0 是无 none，1是简单模式 simple，2是条件模式 select，3是高级模式 advance
		if(typeof(layoutData.nav.config.search)!='object'){
			//默认是1，默认打开

			layoutData.nav.options.searchClassID = 1;
			layoutData.nav.config.search = {
				mode: 'none',
				placeholder: '',
				info:''
			};
		}else{
			if(typeof(layoutData.nav.config.search.mode)!='string'){
				nsalert('搜索模式配置错误(search.mode)','error');
				layoutData.nav.config.search.mode = 'simple';
			}
		}
		//layout的参数options.searchMode
		layoutData.nav.options.searchMode = layoutData.nav.config.search.mode;
		//修改按钮状态
		resetModalBtns(layoutData.nav.config); 
		layoutData.nav.config.pageCode = layoutData.id;
		layoutData.nav.config.modalClass = layoutData.options.modalClass;
		switch(layoutData.options.modalClass){
			case 'table':
			case 'treetable':
			case 'ziptable':
			case 'customsearchtable':  //自定义查询列表
			case 'customsearchdialog': //自定义查询弹框
				layoutData.nav.config.plusClass = layoutData.options.modalClass;
				$('#'+layoutData.nav.config.id).addClass('modal-'+layoutData.nav.config.plusClass);
				nsNav.init(layoutData.nav.config);
				break;
			default:
				nsNav.init(layoutData.nav.config);
				if(debugerMode){
					console.error('模态页类型错误 当前类型为:'+layoutData.options.modalClass+'，支持的类型为table / treetable / ziptable / customsearchtable');
				}
				break;
		}
		
	}
}
//返回面板代码
nsLayout.getPanelHtml = function(layoutData,panelData,type){
	var panelHtml = '';
	var style = '';
	var autoClass = '';
	if(panelData.options.height){
		if(panelData.options.height=='auto'){
			//设置为自动高度时候，计算面板高度
			autoClass = ' autoHeight';
			var heightNum = 0;
			//是否是弹框
			var isInWindow = layoutData.container.closest('.nswindow').length>0;
			//如果是弹框
			if(isInWindow){
				//弹框计算高度
				var styleStr = layoutData.container.closest('.nswindow').attr('style');
				var isHasHeight = styleStr.indexOf('height')>-1;
				if(isHasHeight){
					//指定高度
					var $nswindow = layoutData.container.closest('.nswindow');
					heightNum = $nswindow.height();
					if($nswindow.children('.window-title').length>0){
						heightNum -= $nswindow.children('.window-title').outerHeight(); //减去标题高度
					}
					if($nswindow.find('.page-title').length>0){
						heightNum -= $nswindow.find('.page-title').outerHeight(); //减去按钮高度
					}
					heightNum -= 15;
					if(typeof(layoutData.options.type)=='string'){
						if(layoutData.options.type == 'modal'){
							//customsearchdialog目标下，要给右下角按钮留出位置
							if(layoutData.options.modalClass == 'customsearchdialog'){
								heightNum -= 60;
							}
						}
					}
					style += 'height:'+heightNum+'px; ';
				}else{
					//没有指定高度
				}
			}else{
				//普通页面计算高度
				heightNum = nsVals.containerHeight();
				if(layoutData.options.type=='nospace'){
					heightNum = heightNum - this.height -2;
				}else if(layoutData.options.type=='modal'){
					heightNum = nsVals.layoutHeight();
					if(layoutData.options.modalClass == 'customsearchtable'){
						//定制搜索模板带上面的搜索框，表格比普通的低15个像素
						heightNum = heightNum - 15;
					}
				}else{
					heightNum = heightNum - this.height -20 - panelData.options.rowId*10;
				}
				//处理行间距
				if(typeof(panelData.options.afterHeight)=='number'){
					if(layoutData.options.type=='nospace'){
						heightNum = heightNum-panelData.options.afterHeight;
					}else if(layoutData.options.type=='modal'){
						heightNum = heightNum-panelData.options.afterHeight;
					}else{
						var afterRowNum = 1
						if(typeof(panelData.options.afterRow)=='number'){
							afterRowNum = panelData.options.afterRow;
						}
						heightNum = heightNum-panelData.options.afterHeight-afterRowNum*10;
					}
				}
				style += 'height:'+heightNum+'px; ';
			}
			
		}else if(typeof(panelData.options.height)=='number'){
			style += 'height:'+panelData.options.height+'px; ';
		}else{
			style += 'height:'+panelData.options.height+'; ';
		}
	}
	if(panelData.options.width){
		if(typeof(panelData.options.width)=='number'){
			style += 'width:'+panelData.options.width+'px; ';
		}else{
			style += 'width:'+panelData.options.width+'; ';
		}
	}
	var btnTypeClass = typeof(type) == 'undefined' ? 'nspanel' : type;
	var typeClass = ' nspanel';
	if(type){
		typeClass+=' '+type; //暂时不用了
	}
	var borderClass = ''
	if(panelData.options.border){
		borderClass = " border-"+panelData.options.border;
	}
	var colClass = 'col-xs-12 col-sm-'+panelData.options.col;
	var panelType = 'panel-form';

	var layoutTypeClass = '';
	if(panelData.config.type){
		layoutTypeClass = ' layout-'+panelData.config.type;
	}
	// 2018.3.29 by 张青start 目的:当日志时间轴在右侧时浮动定位到右边，避免布局错误。
	if(panelData.options.isLogtimelineRight === true){
		layoutTypeClass += ' logtimeline-right';
	}
	// 2018.3.29 by 张青end
	switch(panelData.config.type){
		case 'table':
			panelType = panelType+' panel-table';
			break;
	}
	var classStr = '';
	if(panelData.options.class){classStr = ' '+panelData.options.class;}
	/**********************2017-11-28********************************************/
	var userControlHtml = '';//默认用户配置html内容为空
	if(panelData.options.isUserControl == true){
		var userControlId = panelData.id + '-btns';
		userControlHtml = '<button type="button" class="btn btn-white btn-icon" ns-operator="config" ns-type="'+btnTypeClass+'" nsId="'+panelData.id+'" data-id="'+userControlId+'"><i class="fa-table"></i></button>'
						+'<button type="button" class="btn btn-white btn-icon"  ns-operator="dragger" ns-type="'+btnTypeClass+'" nsId="'+panelData.id+'" data-id="'+userControlId+'"><i class="fa-arrows"></i></button>';
	}
	//var panelBodyHtml = '<div class="panel panel-default '+panelType+'"><div class="panel-body"></div></div>';
	if(panelData.options.position=='default'){
		panelHtml = '<div id="'+panelData.id+'" nsid="'+panelData.nsId+'" class="'+colClass+typeClass+layoutTypeClass+borderClass+autoClass+classStr+'" style="'+style+'">'+userControlHtml+'</div>';
	}else{
		console.error(panelData.options.position);
	}
	/***************容器面板 start********************/
	var panelcontainer = panelData.panelcontainer;
	if(panelcontainer){
		var panelID = panelData.id;
		var panelcontainerID = 'container-panel-'+panelID;
		var titleHtml = '';
		var titleStr = typeof(panelcontainer.title)=='string' ? panelcontainer.title : '';
		if(panelcontainer.title){
			titleHtml = '<div class="title-container-panel">'+titleStr+'</div>';
		}
		var btnHtml = '';
		var tabHtml = '';
		var formHtml = '';
		var totalLength = 0;
		if($.isArray(panelcontainer.btns)){
			totalLength += panelcontainer.btns.length;
			btnHtml = '<div class="btn-container-panel nav-form" id="'+panelID+'-btns"></div>';
		}
		if($.isArray(panelcontainer.tabs)){
			totalLength += panelcontainer.tabs.length;
			tabHtml = '<div class="tab-container-panel tabs" id="'+panelID+'-tabs">'
							+'<ul id="'+panelID+'-list" class="nav nav-tabs nav-tabs-justified">';
			var tabContentHtml = '';
			for(var tabI=0; tabI<panelcontainer.tabs.length; tabI++){
				var tabStyleStr = '';
				var tabClassStr = tabI == 0 ? 'active' : '';
				if(typeof(panelcontainer.tabs[tabI].width)=='string'){
					tabStyleStr = 'style="width:'+panelcontainer.tabs[tabI].width+';"';
				}else if(typeof(panelcontainer.tabs[tabI].width)=='number'){
					tabStyleStr = 'style="width:'+panelcontainer.tabs[tabI].width+'%;"';
				}
				var liID = panelID+'-tabs-tab-'+tabI;
				var nId = panelID+'-tabs-tab-a-'+tabI;
				var aID = 'tab-'+panelID+'-tabs-tab-a-'+tabI;
				var contentHtml = typeof(panelcontainer.tabs[tabI].content)=='undefined' ? '':panelcontainer.tabs[tabI].content;
				tabHtml += '<li id="'+liID+'" '+tabStyleStr+' class="'+tabClassStr+'"><a href="#'+aID+'" ns-index="'+tabI+'" id="'+nId+'">'+panelcontainer.tabs[tabI].title+'</a></li>';
				tabContentHtml += '<div class="tab-pane '+tabClassStr+'" id="'+aID+'">'
									+'<div class="panel panel-default panel-form">'
										+'<div class="panel-body">'
										+contentHtml
										+'</div>'
									+'</div></div>';
			}
			tabHtml += '</ul><div class="tab-content">'+tabContentHtml+'</div></div>';
		}

		var containerFormClassStr = 'nspanel-container-forms-inline';
		if($.isArray(panelcontainer.forms)){
			totalLength += panelcontainer.forms.length;
			var rightStyleStr = '';
			/*if(btnHtml){
				rightStyleStr = 'style="right:229px;"';
			}*/
			if(!panelcontainer.isSingleMode){containerFormClassStr = 'nspanel-container-forms';}
			formHtml = '<div class="form-container-panel forms" id="'+panelID+'-customerform" '+rightStyleStr+'></div>';
		}
		var panelContainerStyleStr = '';
		var panelStyleStr = '';	
		switch(panelData.config.type){
			case 'simplepanel':
				panelContainerStyleStr = 'layout-container-panel-simplepanel ';
				panelStyleStr = 'statistics';
				break;
			case 'table':
				panelContainerStyleStr = 'layout-container-panel-table ';
				break;
			case 'form':
				panelContainerStyleStr = 'layout-container-panel-forms ';
				break;
			case 'doubleTables':
				panelContainerStyleStr = 'layout-container-panel-doubleTables ';
				break;
		}
		if(totalLength === 0){
			containerFormClassStr+= ' panel-container-empty';
		}
		//容器面板的plusClass属性  	
		//if(panelcontainer.plusClass){classStr += ' '+panelcontainer.plusClass;}
		panelHtml = '<div id="container-'+panelcontainerID+'" class="nspanel-container '+panelContainerStyleStr+colClass+typeClass+layoutTypeClass+borderClass+autoClass+classStr+'" style="'+style+'">'
						+'<div id="'+panelcontainerID+'" class="panel-container-content '+containerFormClassStr+'">'
							+titleHtml+tabHtml
							+'<div class="container-form-btns">'
								+formHtml+btnHtml
							+'</div>'
						+'</div>'
						+'<div id="'+panelID+'" nsid="'+panelData.nsId+'" class="panel-container-panel '+panelStyleStr+'">'+userControlHtml+'</div>'
					+'</div>';
	}
	/***************容器面板 end********************/
	return panelHtml;
}
nsLayout.initPanels = function(data,panelshtml){
	var sizeClass = "";
	if(data.options.size=="standard"){
		sizeClass = 'standard'
	}
	var rowHtml = '<div class="row '+sizeClass+'">'+panelshtml+'</div>'
	data.container.after(rowHtml);
}
//暂时不用的
nsLayout.getPanelTabsHtml = function(data){
	var tabsHtml = "";
	var tabTitleHtml = '';
	
	if(data.tab){
		var tabHtml = '';
		var tabNavHtml = '';
		var tabIndex = 0;
		$.each(data.tab,function(key,value){
			var navActiveClass = '';
			var tabActiveClass = '';
			if(tabIndex==0){
				navActiveClass = ' class="active"';
				tabActiveClass = ' active';
				tabIndex++;
			}
			tabHtml += '<div class="tab-pane'+tabActiveClass+'" id="'+value.id+'"></div>';
			tabNavHtml +='<li'+navActiveClass+'><a href="#'+value.id+'" data-toggle="tab">'+value.options.title+'</a></li>';
		});
		tabTitleHtml =
			'<div class="panel-options">'
				+'<ul class="nav nav-tabs">'
					+tabNavHtml
				+'</ul>'
			+'</div>';
		tabHtml = 
			'<div class="panel-body">'	
				+'<div class="tab-content">'
					+tabHtml
				+'</div>'
			+'</div>'
		tabsHtml+=tabHtml;
	}
	//标题
	if(data.options.title){
		tabTitleHtml = 
		'<div class="panel-heading">'
			+'<h3 class="panel-title">'+data.options.title+'</h3>'
			+tabTitleHtml
		+'</div>';
	}
	tabsHtml = 
		'<div class="panel panel-default panel-tabs" id="'+data.id+'">'
			+tabTitleHtml
			+tabsHtml
		+'</div>'
	var bgClass = '';
	if(data.options.bg=='none'){
		bgClass = 'nspanel-nobg';
	}
	var colClass = 'col-xs-12 col-sm-'+data.options.col;
	tabsHtml = 	'<div class="'+colClass+'  nspanel nspanel-tab '+bgClass+'">'+tabsHtml+'</div>'
	return tabsHtml;
}
//获取tabs代码
nsLayout.getTabsHtml = function(layoutData, tabsData){
	var tabsHtml = "";
	var tabTitleHtml = '';
	if(tabsData.tab){
		var tabHtml = '';
		var tabNavHtml = '';
		var tabDefault = '';
		var isFixedWidth = typeof(tabsData.config.isFixedWidth)=='boolean'?tabsData.config.isFixedWidth:false;
		if(typeof(tabsData.config.defaultTab)=='string'){
			tabDefault = tabsData.config.defaultTab;
		}
		$.each(tabsData.tab,function(key,value){
			var navActiveClass = '';
			var tabActiveClass = '';
			if(tabDefault==''){
				navActiveClass = ' class="active"';
				tabActiveClass = ' active';
				tabDefault = key;
			}else{
				if(tabDefault == key){
					navActiveClass = ' class="active"';
					tabActiveClass = ' active';
				}
			}
			nsTabs.default.config.activeTab = tabDefault;
			var tabClassStr = '';
			if(isFixedWidth==false){
					//不适用指定宽度
				if(typeof(value.options.width)=='string'){
					tabClassStr = 'style="width:'+value.options.width+';"';
				}else if(typeof(value.options.width)=='number'){
					tabClassStr = 'style="width:'+value.options.width+'%;"';
				}
			}
			tabHtml += '<div class="tab-pane'+tabActiveClass+'" id="'+value.id+'"><div class="panel panel-default panel-form"><div class="panel-body"></div></div></div>';
			tabNavHtml +=
				'<li id="tabs-tab-'+value.id+'"'+navActiveClass+' '+tabClassStr+'>'
					//href="#'+value.id+'"
					+'<a nsid="'+value.nsId+'" id="tabs-tab-a-'+value.id+'" href="javascript:void(0)" ns-href="'+value.id+'" data-toggle="tab">'
						+value.options.title
					+'</a>'
				+'</li>';
		});
		var tabsClassStr = '';
		if(isFixedWidth){tabsClassStr = ' nav-tabs-fixedwidth';}
		tabNavHtml =
			'<ul class="nav nav-tabs nav-tabs-justified '+tabsClassStr+'" nsid="'+tabsData.nsId+'" id="tabs-'+tabsData.id+'">'
				+tabNavHtml
			+'</ul>';
		var tableHeightStyle = '';
		if(tabsData.options.height){
			tableHeightStyle = 'height:'+(tabsData.options.height-30)+'px;'
		}
		tabHtml = 
			'<div class="tab-content" style="'+tableHeightStyle+'">'
				+tabHtml
			+'</div>';
		tabsHtml+=tabHtml;
	}
	
	tabsHtml = tabNavHtml+tabsHtml;
	var panelHtml = nsLayout.getPanelHtml(layoutData,tabsData,'tabs');
	tabsHtml = 
		panelHtml.substring(0,panelHtml.lastIndexOf('><')+1)
			+ tabsHtml
		+'</div>'
	return tabsHtml;
}
//切换tab
nsTabs.show = function(tabID,tabsID,layoutID){
	//tabID  layout中配置的tab名称
	//tabsID和layoutID非必填，默认切换最后一个初始化的tabs，如果使用则必须一块使用
	var idStr = '';
	if(typeof(tabsID)=='undefined'||typeof(layoutID)=='undefined'){
		idStr = 'tabs-tab-a-'+nsTabs.default.id+'-'+tabID;
	}else{
		idStr = 'tabs-tab-a-'+layoutID+'-'+tabsID+'-'+tabID;
	}
	nsTabs.setShowByID(idStr);
}
nsTabs.setShowByID = function(idStr){
	$('#'+idStr).tab('show');
	var ev = {
		type:'nsTabs.show'
	}
	nsTabs.tabDomHanlder($('#'+idStr),ev);
}
//nstab的切换页面函数使用
nsTabs.tabClickHanlder = function(ev){
	nsTabs.tabDomHanlder($(this),ev);
}
nsTabs.tabDomHanlder =function($dom, ev){
	var planeID = $dom.attr('ns-href');
	$('#'+planeID).addClass('active');
	$('#'+planeID).siblings().removeClass('active');
	//planeID = planeID.substring(1,planeID.length);
	var layoutID = $dom.closest('.row.layout-planes').attr('nsid');
	var config = nsLayout.data[layoutID].panels[planeID].config.value;
	var tabsID = $dom.closest('ul.nav-tabs').attr('nsid');
	var tabID = $dom.attr('nsid')
	var callbackData = {
		layoutID:layoutID,
		planeID:planeID,
		tabsID:tabsID,
		tabID:tabID,
		activeConfig:config
	}
	nsLayout.data[layoutID].tabs[tabsID].config.activeTab = tabID;
	nsLayout.data[layoutID].tabs[tabsID].config.activeTabData = callbackData;
	if(typeof(nsLayout.data[layoutID].tabs[tabsID].config.changeTabCallback)=='function'){
		nsLayout.data[layoutID].tabs[tabsID].config.changeTabCallback(ev,callbackData);
	}
}
//获取当前活动页
nsTabs.getActiveID = function(tabsID, layoutID){
	//tabsID, layoutID都是非必填，默认返回最后一个活动的
	if(typeof(tabsID)=='undefined' && typeof(layoutID)=='undefined'){
		return nsTabs.default.config.activeTab;
	}else{
		if(typeof(layoutID)=='undefined'){
			var activeTab = nsLayout.data[nsTabs.default.layoutID].tabs[tabsID].config.activeTab;
			return activeTab;
		}else{
			var activeTab = nsLayout.data[layoutID].tabs[tabsID].config.activeTab;
			return activeTab;
		}

	}
}