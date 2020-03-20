nsNav.json = {}; 				//原始数据
nsNav.btnHandler = {};			//普通按钮事件
nsNav.btnGroupHandler = {};		//按钮组事件
nsNav.dropdownSaveHandler = [];//sjj20181024 下拉事件 存储的是saveCustom
nsNav.dropdownAjaxHandler = [];//lxh20181115 下拉打印模板事件 存储的是printCustom
nsNav.config = {};
nsNav.init = function(navJson){
	if(debugerMode){
		var parametersArr = [
			['id','string',true],
			['btns','array',true],
			['isShowTitle','boolean'],
		];
		nsDebuger.validOptions(parametersArr,navJson);
		//btns属性必须是二维数组，第一层是分组信息
		if($.isArray(navJson.btns)){
			for(var btnsArrI = 0; btnsArrI<navJson.btns.length; btnsArrI++){
				if($.isArray(navJson.btns[btnsArrI])==false){
					console.error('导航按钮组是二维数组格式，当前不符合设定');
					console.error(navJson);
					return;
				}
			}
		}
	}
	
	if(typeof(navJson.btns)!='undefined'){
		nsNav.initBtns(navJson);
	}
}

//自定义配置下拉菜单，返回html
nsNav.getConfigBtnHtml = function(config){
	var pageCode = 'document'; 
	if(config.pageCode){
		pageCode = config.pageCode;
	}
	var ulHtml = '';
	$.each(config, function(key,value){
		if(key=='nav'||key=='formJson'||key=='tableJson'){
			var listName;
			var listIcon;
			switch(key){
				case 'nav':
					listName = '导航按钮配置';
					listIcon = 'fa-inbox';
					break;
				case 'formJson':
					listName = '表单配置';
					listIcon = 'fa-terminal';
					break;
				case 'tableJson':
					listName = '表格配置';
					listIcon = 'fa-table';
					break;
			}
			var iconHtml = '<i class="fa '+listIcon+'"></i> ';
			var listHtml = '<li><a href="javascript:void(0);" pageCode="'+pageCode+'" configtype="'+key+'">'+listName+'</a></li>';
			listHtml+='<li class="divider"></li>';
			ulHtml +=listHtml;
		}
	})
	ulHtml+='<li><a href="javascript:void(0);" pageCode="'+pageCode+'" configtype="all">全部恢复默认</a></li>';
	ulHtml = '<ul class="dropdown-menu" role="menu">'+ulHtml+'</ul>';
	ulHtml = '<a class="nav-config-btn" href="javascript:void(0);"  data-toggle="dropdown"><i class="fa-cog"></i></a>'+ulHtml;
	return ulHtml;
}
//列表模式搜索框选择分类
nsNav.searchSelectListHandler = function(obj){
	console.log(obj);
}
//模态页面搜索框下拉列表click处理
nsNav.getSelectListValue = function(navID,selectID,name){
	//console.log(nsNav.json[navID]);
	var $select =nsNav.json[navID].$searchContainer.children('button.select.angle');
	function changeName(name){
		//修改下拉列表当前选择的名称
		var $listTitle = $select.children('span');
		if($listTitle.length==0){
			//if(name!='default-all'){
				$select.append('<span> '+name+'</span>');
			//}
		}else{
			//if(selectID!='default-all'){
				$listTitle.html(' '+name);
			//}else{
				//$listTitle.remove();
			//}
		}
		
	}
	if(nsNav.json[navID].classSelectID){
		if(nsNav.json[navID].classSelectID != selectID){
			nsNav.json[navID].classSelectID = selectID;
			changeName(name);
		}
	}else{
		nsNav.json[navID].classSelectID = selectID;
		changeName(name);
	}
	var searchInputValue = nsNav.json[navID].$searchContainer.children('input.select').val();
	//搜索框的值
	if($.trim(searchInputValue)!=''){
		//如果搜索框不是空，则重新搜索
		console.log('如果搜索框不是空，则重新搜索');
	}
}
//模态页面高级搜索面板代码
nsNav.getSearchAdvancePlaneHtml = function(navJson){
	navJson.search.advance.id = navJson.id+'-search-advance-panel';
	var formBaseObj = nsForm.panelInitData(navJson.search.advance);
	var html = 
		'<div class="search-advance-panel form-wide-panel" id="'+navJson.search.advance.id+'">'
			+'<form role="form" id="form-'+navJson.search.advance.id+'" method="get" action="">'
				+formBaseObj.html
			+'</form> '
		+'</div>'

	return html;
}
//模态页面搜索框代码，返回html
nsNav.getSearchPlaneHtml = function(navJson){
	var html = '';
	navJson.classSelectID = 'default-all'; //默认是不分类搜索
	function getSelectListHtml(subdata){
		var listHtml = '';

		if(typeof(subdata)=='object'){
			$.each(subdata,function(key,value){
				listHtml +=
					'<li>'
						+'<a href="javascript:nsNav.getSelectListValue(\''+ navJson.id +'\',\''+value.id+'\',\''+value.name+'\');" >'+value.name+'</a>'
					+'</li>'
			})
			
		}
		listHtml += '<li class="divider"></li>';
		listHtml += '<li>'
						+'<a href="javascript:nsNav.getSelectListValue(\''+ navJson.id +'\',\''+'default-all'+'\',\'全部\');" >全部</a>'
					+'</li>'
		return listHtml;
	}
	switch(navJson.search.mode){
		case 'simple':
			html+= 
				'<input class="simple" placeholder="'+navJson.search.placeholder+'"  type="text">'
				+'<button class="simple search" >'
					+'<i class="fa fa-search"></i>'
				+'</button>';
			break;
		case 'select':
			//是否有列表
			if($.isArray(navJson.search.subdata)){
				html+= 
					'<button class="select angle" data-toggle="dropdown">'
						+'<i class="fa-angle-down"></i>'
					+'</button>'
					+'<ul class="dropdown-menu" role="menu">'
						+getSelectListHtml(navJson.search.subdata)
					+'</ul>'
			}
			//是否有日期选择器
			if(typeof(navJson.search.dateRange)=='object'){
				html+= 
					'<button class="select calendar" >'
						+'<i class="linecons-calendar"></i>'
					+'</button>'
			}
			
			//生成搜索框
			var isHiddenInputCls = '';
			if(navJson.search.hideInput){
				//隐藏搜素框 改变后面搜索按钮的样式
				isHiddenInputCls = ' hiddeninput';
			}else{
				//placeholder默认为空
				if(typeof(navJson.search.placeholder)!='string'){
					navJson.search.placeholder = '';
				}
				html+='<input class="select" placeholder="'+navJson.search.placeholder+'"  type="text">'
			}
			//是否有高级查询表单
			if(typeof(navJson.search.advance)=='object'){
				//搜索框标题
				if(typeof(navJson.search.advance.searchInputTitle)=='string'){
					html =
						'<span class="search-title" >'
							+navJson.search.advance.searchInputTitle
						+'</span>'
						+ html
				}
				html +=
					'<button nssearchid="'+navJson.id+'" class="select search with-advance'+isHiddenInputCls+'" >'
						+'<i class="fa fa-search"></i>'
					+'</button>'
					// +'<button class="select advance" >'
					// 	+'高级搜索'
					// +'</button>'
					+nsNav.getSearchAdvancePlaneHtml(navJson);
			}else{
				html+=
					'<button nssearchid="'+navJson.id+'" class="select search'+isHiddenInputCls+'" >'
						+'<i class="fa fa-search"></i>'
					+'</button>'
			}
			break;
		default:
			nsalert('搜索框模式错误，无法获取HTML');
			break;
	}
	if(typeof(navJson.search.info)=='string' && navJson.search.info!=''){
		html +=
			'<div class="search-info">'
				+'<i class="fa fa-question-circle"></i>'
				+navJson.search.info
			+'</div>';
	}
	return html;
}
//初始化自定义配置按钮
nsNav.initConfigBtn = function(configObj,$container){

	var navID = configObj.nav[0].id;
	nsNav.config[navID] = configObj;
	var ulHtml = nsNav.getConfigBtnHtml(configObj);
	var configBtnHtml = '<div class="nav-config">'+ulHtml+'</div>';
	//根据参数决定输出位置
	if(typeof($container)=='object'){
		$container.html(configBtnHtml);
	}else{
		$("#"+navID).append(configBtnHtml);
	}
	
	$("#"+navID+' .nav-config ul.dropdown-menu li a').on("click",function(ev){
		//var navID = $(this).closest('.page-title.nav-form').attr('id');
		var type = $(this).attr('configtype');
		var pageCode = $(this).attr('pageCode');
		nsNav.configBtnHandler(pageCode,type);
	});
}
nsNav.configBtnHandler = function(pageCode,type){
	switch(type){
		case 'nav':
			nsCustomConfig.initButtonConfigPage(pageCode);
			break;
		case 'formJson':
			nsCustomConfig.initFormConfigPage(pageCode);
			break;
		case 'tableJson':
			nsCustomConfig.initTableConfigPage(pageCode);
			break;
		case 'all':
			nsCustomConfig.clearCustomData(pageCode);
			break;
	}
}
//实际上的init过程
nsNav.initBtns = function(navJson){
	var btnsHtml = '';
	var btnHandlerArr = [];//button按钮的事件
	var groupBtnHandlerArr = [];//button按钮下拉框
	var btnIndex = 0;
	var dropdownSaveHandlerArr = [];//下拉模式是saveCustom的事件sjj20181024
	var dropdownAjaxHandlerArr = [];//下拉模式是printCustom的事件lxh20181115
	//获取普通按钮
	if($.isArray(navJson.btns)){
		for(var btnGroupID=0; btnGroupID<navJson.btns.length; btnGroupID++){
			var btnGroupHtml = '<div class="btn-group">';
			if(debugerMode){
				if(!$.isArray(navJson.btns[btnGroupID])){
					console.error('btns的参数是二维数组，当前参数不正确');
					console.error(navJson.btns);
					return false;
				}
			}
			for(var btnID=0; btnID<navJson.btns[btnGroupID].length; btnID++){
				var groupBtnArr = [];
				var dropdownSaveArr = [];
				var dropdownAjaxArr = [];
				var btnIndexConfig = {fid:btnIndex};
				var dropdownType = 	navJson.btns[btnGroupID][btnID].dropdownType; //sjj20181024
				if($.isArray(navJson.btns[btnGroupID][btnID].subdata)){
					//含有下拉按钮组
					for(var childBtn in navJson.btns[btnGroupID][btnID].subdata){
						btnIndexConfig.optionid = childBtn;
						if(typeof(navJson.btns[btnGroupID][btnID].subdata[childBtn].handler)=='function'){
							//sjj20181024
							if(dropdownType=='saveCustom'){
								dropdownSaveArr.push(navJson.btns[btnGroupID][btnID].subdata[childBtn].handler);
							}else{
								groupBtnArr.push(navJson.btns[btnGroupID][btnID].subdata[childBtn].handler);
							}
						}else{
							groupBtnArr.push('');
							dropdownSaveArr.push('');
						}
					}
				}else if(typeof navJson.btns[btnGroupID][btnID].ajaxConfig != 'undefined'){
					switch (dropdownType) {
						case 'ajaxShowIndex':
							dropdownAjaxArr.push(navJson.btns[btnGroupID][btnID].handler);
							break;
						default:
							break;
					}
				}
				groupBtnHandlerArr.push(groupBtnArr);
				dropdownSaveHandlerArr.push(dropdownSaveArr);
				dropdownAjaxHandlerArr.push(dropdownAjaxArr);
				//btnGroupHtml += commonConfig.getBtn(navJson.btns[btnGroupID][btnID],"form",btnIndex);
				var defaultConfig = {
					isShowText:true,
					isShowIcon:true,
					disabled:false,
					isReturn:false,
					configShow:true
				};
				nsVals.setDefaultValues(navJson.btns[btnGroupID][btnID],defaultConfig);
				nsVals.setDefaultValues(navJson.btns[btnGroupID][btnID].index,btnIndexConfig);
				if(typeof(navJson.btns[btnGroupID][btnID].index)!='object'){
					navJson.btns[btnGroupID][btnID].index = btnIndexConfig;
				}
				btnGroupHtml += nsButton.getHtml(navJson.btns[btnGroupID][btnID],"form",btnIndex);
				if(typeof(navJson.btns[btnGroupID][btnID].handler)=='function'){ 
					btnHandlerArr.push(navJson.btns[btnGroupID][btnID].handler);
				}else{
					btnHandlerArr.push('');
				}
				btnIndex++;
			}
			btnGroupHtml += "</div>";
			btnsHtml += btnGroupHtml;
		}
	}
	//获取大按钮
	var bigBtnsHtml = '';
	var bigBtnHandlerArr = [];
	if(typeof(navJson.bigBtns)=='object'){
		var bigBtnsObj = nsNav.btnBigInit(navJson, btnHandlerArr);
		bigBtnsHtml = bigBtnsObj.html;
		bigBtnHandlerArr = bigBtnsObj.handlerArr;
		if(bigBtnHandlerArr.length>0){
			//合并两个事件的数组
			btnHandlerArr.push.apply(btnHandlerArr,bigBtnHandlerArr);
		}
	}
	//定制按钮容器
	var customBtnHtml = '';
	if(navJson.isCustom){
		customBtnHtml = nsNav.getConfigBtnHtml(navJson.customContainer);
		customBtnHtml = '<div class="btn-custom">'+customBtnHtml+'</div>'
	}
	//搜索框容器
	var searchHtml = '';
	if(navJson.search){
		if(typeof(navJson.search.mode)=='string'){
			if(navJson.search.mode!='none'){
				searchHtml = nsNav.getSearchPlaneHtml(navJson);
				searchHtml = 
					'<div class="panel-search '+navJson.search.mode+'">'
						+searchHtml
					+'</div>';
			}
		}
	}
	//面包屑代码
	var titleListHandler = {};
	var titleListHtml = '';
	var titleListArr = navJson.titleListArr;
	if($.isArray(titleListArr)){
		if(titleListArr.length > 0){
			var isCurrentStr = '';
			for(var listI=0; listI<titleListArr.length; listI++){
				titleListHandler[listI] = {};
				//方法是否是函数，如果是则无需再绑定click事件
				//返回两个参数：1.是否绑定单击事件 2.是否在html内部绑定单击事件
				function getClickFunc(handler){
					var onclickAttr = '';
					var isClick = false;//默认不绑定
					if(typeof(handler)=='function'){
						//是个函数，调用方法
						isClick = true;
					}else if(typeof(handler) == 'string'){
						//是个内置的方法
						//如果带着()，则需要判断里面的引号是单引号还是双引号，有括号就不要使用参数了
						if(handler.indexOf("(")>-1){
							if(handler.indexOf("'")>-1){
								onclickAttr = ' onclick="'+handler+';"';
							}else{
								onclickAttr = " onclick='"+handler+";'";
							}
						}
					}
					return [onclickAttr,isClick];
				}
				var getBindArr = getClickFunc(titleListArr[listI].handler);
				var onclickAttr = getBindArr[0];
				var isClick = getBindArr[1];
				if(isClick){
					titleListHandler[listI].click = titleListArr[listI].handler;
				}
				var sublistHtml = '';
				if($.isArray(titleListArr[listI].subdata)){
					//handler是个数组
					var subListArr = titleListArr[listI].subdata;
					titleListHandler[listI].handler = [];
					for(var subI=0; subI<subListArr.length; subI++){
						var getSubBindArr = getClickFunc(subListArr[subI].handler);
						var onSubClickAttr = getSubBindArr[0];
						var isSubClick = getSubBindArr[1];
						if(isSubClick){
							titleListHandler[listI].handler.push(subListArr[subI].handler);
						}
						sublistHtml += '<a href="javascript:void(0)" isClick="'+isSubClick+'" ns-navIndex="'+listI+'" ns-dropIndex="'+subI+'">'+subListArr[subI].text+'</a>';
					}
					sublistHtml = '<div class="btn-group">'
									+sublistHtml
								+'</div>';
				}	
				var isCurrent = typeof(titleListArr[listI].isCurrent) == 'boolean' ? titleListArr[listI].isCurrent : false; 
				var isHiddenClassStr = '';
				if(isCurrent){
					isCurrentStr = titleListArr[listI].text;
					isHiddenClassStr = 'hide';
				}
				titleListHtml += '<li class="'+isHiddenClassStr+'">'
									+'<a href="javascript:void(0)" '+onclickAttr+' isClick="'+isClick+'" ns-navIndex="'+listI+'">'
										+titleListArr[listI].text
									+'</a>'
									+sublistHtml
								 +'</li>';
			}
			titleListHtml = '<li>'
								+'<div class="btn-group">'
									+'<button type="button" class="btn btn-white dropdown-toggle" data-toggle="dropdown">'
										+isCurrentStr
										+'<span class="caret"></span>'
									+'</button>'
									+'<ul class="dropdown-menu">'
										+titleListHtml
									+'</ul>'
								+'</div>'
							+'</li>';
		}
	}
	//是否存在标题列
	var titleHtml = '';
	var btnTitleHtml = '';
	if(typeof(navJson.title)=='string'){
		btnTitleHtml = '<div class="nav-title">'+navJson.title+'</div>';
	}
	//isShowTitle是否显示导航面包屑,默认显示
	var isShowTitle = typeof(navJson.isShowTitle) == 'boolean' ? navJson.isShowTitle : true;
	if(isShowTitle){
		nsNav.titleListHandler = titleListHandler;
		//如果菜单数据尚未加载完成 则先输出容器
		titleHtml = '<div class="breadcrumb-container" waitingload = "'+navJson.id+'">'
						+'<ol class="breadcrumb"></ol>'
					+'</div>';
	}
	var navHtml = btnTitleHtml + btnsHtml + bigBtnsHtml + customBtnHtml + searchHtml ;
	var navID = 'default';
	if(typeof(navJson.id)!="undefined"){
		$("#"+navJson.id).html(navHtml);
		//一个界面中只能出现一个导航栏
		if($('.breadcrumb-container').length == 0){
			$("#"+navJson.id).after(titleHtml);
		}
		navID = navJson.id;
		//面包屑输出
		getBreadcrumbHtml();
	}else{
		$(".nav-form").html(navHtml);
	}
	if(navJson.search){
		nsNav.searchHandler(navJson);//如果开启了搜索则调用搜索事件

		//回调搜索事件
		if(typeof(navJson.search.callbackSearchHandler)=='function'){
			$('[nssearchid="'+navJson.id+'"]').on('click',function(ev){
				var navID = $(this).attr('nssearchid');
				var searchJson;
				if($(this).hasClass('with-advance')){
					//如果有高级搜索类，则代表有自定义form
					var searchJson = nsForm.getFormJSON(navID+'-search-advance-panel');
					if(searchJson==false){
						searchJson = {};
					}
				}else{
					searchJson = {};
				}
				
				function getJsonName(configName,inputValue){
					if(typeof(inputValue)=='undefined'){
						return false;
					}
					var jsonName;
					if(typeof(navJson.search[configName])=='string'){
						jsonName = navJson.search[configName];
					}else{
						jsonName = 'default'+configName;
					}
					//处理日期区间选择
					if(configName=='dateID'){
						inputValue = nsNav.json[navID].search.searchDate;
					}
					searchJson[jsonName] = inputValue;
				}
				
				if($(this).parent().children('[data-toggle="dropdown"]').length>0){
					var classValue = $(this).parent().children('[data-toggle="dropdown"]').children('span').html();
					if(typeof(classValue)=='undefined'){
						classValue = '';
					}
					getJsonName('classValue',classValue);
				}
				var dateValue = $(this).parent().children('.select.calendar').children('span').html();
				var inputValue = $(this).parent().children('input').val();
				
				getJsonName('dateValue',dateValue);
				getJsonName('inputValue',inputValue);
				navJson.search.callbackSearchHandler(searchJson,navJson);
			})
		}
		
		//如果有搜索帮助信息
		if(typeof(navJson.search.info)=='string'){
			navJson.$container = $("#"+navJson.id);
			navJson.$searchContainer = $("#"+navJson.id+' .panel-search');
			navJson.$searchContainer.children('input').on('focus', function(ev){
				var $searchInfo = navJson.$searchContainer.children('.search-info');
				$searchInfo.animateShow('fadeInRight');
				$(this).on('blur',function(){
					$searchInfo.animateHide('fadeOutRight');
				});
			})
		}
		//
		//如果有日期区间组件
		if(typeof(navJson.search.dateRange)=='object'){
			var $calendarButton = $('#'+navJson.id+' .select.calendar');
			//基础配置
			var options = {
				"ranges": {
					'今天': [moment(), moment()],
					'昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
					'最近7天': [moment().subtract(6, 'days'), moment()],
					'最近30天': [moment().subtract(29, 'days'), moment()],
					'本周': [moment().startOf('week'), moment().endOf('week')],
					'上周': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
					'本月': [moment().startOf('month'), moment().endOf('month')],
					'上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
				},
				"locale": {
					"format": "YYYY/MM/DD HH:mm",
					"separator": " / ",
					"applyLabel": "确认",
					"cancelLabel": "取消",
					"fromLabel": "从",
					"toLabel": "到",
					"customRangeLabel": "选择日期区间",
					"daysOfWeek": [
						"日",
						"一",
						"二",
						"三",
						"四",
						"五",
						"六"
					],
					"monthNames": [
						"一月",
						"二月",
						"三月",
						"四月",
						"五月",
						"六月",
						"七月",
						"八月",
						"九月",
						"十月",
						"十一月",
						"十二月"
					],
					"firstDay": 0
				},
				"alwaysShowCalendars": true,
				"opens": "left",
				"buttonClasses": "btn",
			}
			//获取显示状态数据
			function getStateHtml(start,end,label){
				//验证callbackFormat
				if(debugerMode){
					if(typeof(navJson.search.dateRange.callbackFormat)!='undefined'){
						if(typeof(navJson.search.dateRange.callbackFormat)=='string'){
							//正确
						}else{
							console.error('callbackFormat只能是字符型，如YYYY-MM-DD，或者YYYY-MM-DD HH:mm:ss');
						}
					}
				}
				//读取callbackFormat
				var customFormatStr = 'YYYY-MM-DD';
				if(typeof(navJson.search.dateRange.callbackFormat)=='string'){
					customFormatStr = navJson.search.dateRange.callbackFormat;
				}
				//储存数据
				navJson.search.searchDate = {
					start:start.format('YYYY-MM-DD HH:mm:ss'),
					end:end.format('YYYY-MM-DD HH:mm:ss'),
					customStart:start.format(customFormatStr),
					customEnd:end.format(customFormatStr),
					label:label
				}
				//精简文字
				var html = ''
				if(label=='选择日期区间' || label=='默认日期区间'){
					var startStr = start.format('YYYY/MM/DD');
					var endStr = end.format('YYYY/MM/DD');
					if(start.format('YYYY') == end.format('YYYY')){
						startStr = start.format('MM/DD');
						endStr = end.format('MM/DD');
					}else{
						startStr = start.format('YYYY/MM/DD');
						endStr = end.format('YYYY/MM/DD');
					}
					if(startStr == endStr){
						html = startStr;
					}else{
						html = startStr + ' 到 ' + endStr;
					}
					if(label=='默认日期区间'){
						html = '默认：'+html
					}
				}else{
					html = label;
				}
				html = '<i class="linecons-calendar"></i>'
					+'<span>' + html + '</span>';
				return html;
			}
			//默认日期 
			var isDefaultDate = false;
			if(typeof(navJson.search.dateRange.start)=='string'){
				options.startDate = navJson.search.dateRange.start;
				isDefaultDate = true;
				if(typeof(navJson.search.dateRange.end)!='string'){
					options.endDate = moment().format('YYYY/MM/DD');
				}
			}
			if(typeof(navJson.search.dateRange.end)=='string'){
				options.endDate = navJson.search.dateRange.end;
				isDefaultDate = true;
				if(typeof(navJson.search.dateRange.start)!='string'){
					options.startDate = moment().format('YYYY/MM/DD');
				}
			}
			var stateHtml = '';
			if(isDefaultDate){
				options.ranges['默认日期区间'] = [moment(options.startDate, 'YYYY/MM/DD'),moment(options.endDate, 'YYYY/MM/DD')];
				if(options.startDate.indexOf(':')<0){
					options.startDate = options.startDate + ' 00:00:00';
				}
				if(options.endDate.indexOf(':')<0){
					options.endDate = options.endDate + ' 23:59:59';
				}
				var start = moment(options.startDate, 'YYYY/MM/DD HH:mm:ss');
				var end = moment(options.endDate, 'YYYY/MM/DD HH:mm:ss');
				var label = '默认日期区间';
				stateHtml = getStateHtml(start,end,label);
				$calendarButton.html(stateHtml);
			}
			//最大最小日期
			if(typeof(navJson.search.dateRange.min)=='string'){
				options.minDate = navJson.search.dateRange.min;
			}
			if(typeof(navJson.search.dateRange.max)=='string'){
				options.maxDate = navJson.search.dateRange.max;
			}
			//高级搜索
			if(typeof(navJson.search.advance)=='object'){
				var $advanceButton = $('#'+navJson.id+' .select.advance');
				$advanceButton.on('click', function(ev){
					var $advancePlane = $(this).closest('.panel-search').children('.search-advance-panel');
					$advancePlane.toggleClass('show')
				});
			}
			$calendarButton.daterangepicker(
				options, 
				function(start, end, label) {
					//填充时间区域到导航栏
					var outputHtml = getStateHtml(start,end,label);
					$calendarButton.html(outputHtml);
				});
		}
		//如果有高级搜索按钮
		if(typeof(navJson.search.advance)=='object'){
			nsFormBase.init(navJson.search.advance);
		}
	}
	if(navJson.isCustom){
		$("#"+navID+' .btn-custom ul.dropdown-menu li a').on("click",function(ev){
			var type = $(this).attr('configtype');
			var pageCode = $(this).attr('pageCode');
			nsNav.configBtnHandler(pageCode,type);
		});
	}
	function getBreadcrumbHtml(){
		if(mainmenu.dataGetReady == false){
			titleHtml = '<div class="breadcrumb-container" waitingload = "'+navJson.id+'">'
							+'<ol class="breadcrumb"></ol>'
						+'</div>';
			mainmenu.waitingloadID = navJson.id;
			mainmenu.titleListHtml = titleListHtml;
		}else{
			//给容器追加内容
			var topNavStr = $.trim($('.main-menu > li.active').children('a').children('span').text());
			var subNavStr = '';
			if($('#main-menu > li.active').hasClass('expanded')){
				//含有展开表示有子集项目是展开状态
				subNavStr = $.trim($('#main-menu > li.active.expanded').find('ul li.active').text());
			}
			var homeHref = getRootPath() + '/home?istree=1';
			if(nsVals.homeUrl){
				homeHref = 'javascript:nsFrame.loadPage("'+nsVals.homeUrl+'");';
			}
			var homeHtml = 
				'<li>'
					+'<a href="'+homeHref+'"><i class="fa-home"></i>首页</a>'
				+'</li>';
			var breadcrumbHtml = homeHtml+'<li>'+topNavStr+'</li><li>'+subNavStr+'</li>'+titleListHtml;
			$('[waitingload="'+navJson.id+'"]').children('ol').html(breadcrumbHtml);
			nsNav.dropdownBtn();
		}
	}
	nsNav.json[navID] = navJson;
	nsNav.btnHandler[navID] = btnHandlerArr;
	nsNav.btnGroupHandler[navID] = groupBtnHandlerArr;
	nsNav.dropdownSaveHandler[navID] = dropdownSaveHandlerArr;
	nsNav.dropdownAjaxHandler[navID] = dropdownAjaxHandlerArr;
	nsNav.btnInit(btnHandlerArr,groupBtnHandlerArr,navID);
}
//面包屑下拉组选择事件
nsNav.dropdownBtn = function(){
	//所有按钮点击事件
	$('[waitingload="'+mainmenu.waitingloadID+'"]').find('[isclick=true]').on('click',function(ev){
		ev.stopPropagation();
		var navIndex = $(this).attr('ns-navIndex');
		var dropIndex = $(this).attr('ns-dropindex');
		var $btnGroup = $(this).closest('.btn-group')
		var isOpen = $btnGroup.hasClass('open');
		if(isOpen){
			$btnGroup.removeClass('open');
		}else{
			$btnGroup.addClass('open');
		}
		var returnHandler;
		if(typeof(dropIndex)!='undefined'){
			returnHandler = nsNav.titleListHandler[navIndex].handler[dropIndex];
		}else{
			returnHandler = nsNav.titleListHandler[navIndex].click;
		}
		if(typeof(returnHandler)=='function'){
			returnHandler();
		}
	});
}
//面包屑搜索中触发的input和button按钮事件
nsNav.searchHandler = function(navJson){
	if(!$.isEmptyObject(navJson.search.changeHandler)){
		//如果搜索中传送了函数调用
		var $input;
		switch(navJson.search.mode){
			case 'simple':
			case 'select':
				$input = $('#'+navJson.id).children('.panel-search').children('input[type="text"]');
				break;
			default:
				nsalert('搜索框模式错误，无法调用函数');
				break;
		}
		if($input.length = 1){
			var eventStr = navJson.search.changeHandler.type;//事件类型函数
			eventStr = typeof(eventStr) == 'undefined' ? 'change' : eventStr;//默认触发change事件
			$input.on(eventStr, function(ev){
				var valueStr = $.trim($(this).val());
				if(typeof(navJson.search.changeHandler.func)=='function'){
					navJson.search.changeHandler.func(valueStr,$(this));
				}
			})
			$input.parent().find('button.search').on('click',function(ev){
				var valueStr = $.trim($(this).parent().children('input').val());
				if(typeof(navJson.search.changeHandler.func)=='function'){
					navJson.search.changeHandler.func(valueStr,$(this));
				}
			})
		}
	}
}
//大按钮初始化
nsNav.btnBigInit = function(navJson, btnHandlerArr){
	var html = '';
	var handlerArr = [];
	function getFid(){
		var fid = btnHandlerArr.length + handlerArr.length;
		fid = 'fid="'+fid+'"';
		return fid;
	}
	//之前已经判断是否object类型，只有两种可能，是否是数组，如果是数组则执行自定义方法，如果是普通对象，则定义了
	//var bigBtnIsArray = $.isArray(navJson.bigBtns)?true:false;
	//先暂时不写了，只有object一种类型


	//回退按钮
	if(typeof(navJson.bigBtns.histroyBtn)=='object'){
		if(typeof(navJson.bigBtns.histroyBtn.handler)=='function'){
			html +='<button class="btn-big btn-histroy" type="button" '+getFid()+'><i class="fa-chevron-left" ></i></button>';
			handlerArr.push(navJson.bigBtns.histroyBtn.handler);
		}else if(typeof(navJson.bigBtns.histroyBtn.handler)=='string'){
			html +='<button class="btn-big btn-histroy" type="button" onclick="'+navJson.bigBtns.histroyBtn.handler+'();"><i class="fa-chevron-left" ></i></button>';
			handlerArr.push('');
		}
	}
	//刷新按钮
	//refreshBtn
	if(typeof(navJson.bigBtns.refreshBtn)=='object'){
		if(typeof(navJson.bigBtns.refreshBtn.handler)=='function'){
			html +='<button class="btn-big btn-refresh" type="button" '+getFid()+'><i class="fa-refresh" ></i></button>';
			handlerArr.push(navJson.bigBtns.refreshBtn.handler);
		}else if(typeof(navJson.bigBtns.refreshBtn.handler)=='string'){
			html +='<button class="btn-big btn-refresh" type="button" onclick="'+navJson.bigBtns.refreshBtn.handler+'();"><i class="fa-refresh" ></i></button>';
			handlerArr.push('');
		}
	}
	//新增按钮
	if(typeof(navJson.bigBtns.addBtn)=='object'){
		if(typeof(navJson.bigBtns.addBtn.handler)=='function'){
			html +='<button class="btn-big btn-plus" type="button" '+getFid()+'><i class="fa-plus" ></i></button>';
			handlerArr.push(navJson.bigBtns.addBtn.handler);
		}else if(typeof(navJson.bigBtns.addBtn.handler)=='string'){
			html +='<button class="btn-big btn-plus" type="button" onclick="'+navJson.bigBtns.addBtn.handler+'();"><i class="fa-plus" ></i></button>';
			handlerArr.push('');
		}
	}
	
	//搜索按钮
	if(typeof(navJson.bigBtns.searchBtn)=='object'){
		if(typeof(navJson.bigBtns.searchBtn.handler)=='function'){
			html +='<button class="btn-big btn-search" type="button" '+getFid()+'><i class="fa-search" ></i></button>';
			handlerArr.push(navJson.bigBtns.searchBtn.handler);
		}else if(typeof(navJson.bigBtns.searchBtn.handler)=='string'){
			html +='<button class="btn-big btn-plus" type="button" onclick="'+navJson.bigBtns.searchBtn.handler+'();"><i class="fa-search" ></i></button>';
			handlerArr.push('');
		}
	}

	if(html != ''){
		html = '<div class="btn-group-big">'+html+'</div>';
	}
	return {
		html:html,
		handlerArr:handlerArr
	}
}
nsNav.btnInit = function(btnArr,btnGroupArr,navID){
	//普通按钮返回函数调用
	for(var btnI=0;btnI<btnArr.length; btnI++){
		if(btnArr[btnI]!=''){
			var btnDom;
			if(navID=='default'){
				btnDom = $(".nav-form button[fid='"+btnI+"']");
			}else{
				btnDom = $("#"+navID+".nav-form button[fid='"+btnI+"']");
			}
			
			var controlPlaneID = 'default';
			if(btnArr[btnI]!=''){
				$(btnDom).off('click');
				$(btnDom).on('click',function(ev){
					if(typeof($(this).closest('.nav-form').attr('id'))=='undefined'){
						controlPlaneID = 'default';
					}else{
						controlPlaneID = $(this).closest('.nav-form').attr('id');
					}
					var functionID = Number($(this).attr('fid'));
					var btnHandler = nsNav.btnHandler[controlPlaneID][functionID];
					var isReturn = $(this).attr('isReturn')=='true'?true:false;
					if(isReturn){
						btnHandler($(this));
					}else{
						btnHandler();
					}
					
				});
			}
		}
	}
	//下拉按钮返回函数调用
	for(var btnGroupIndex=0; btnGroupIndex<btnGroupArr.length;btnGroupIndex++){
		if(btnGroupArr[btnGroupIndex].length > 0){
			//长度大于0表明了是有下拉选择事件
			var childDom;
			if(navID=='default'){
				childDom = $(".nav-form button")[btnGroupIndex];
			}else{
				childDom = $("#"+navID+".nav-form button")[btnGroupIndex];
			}
			var subBtnDom = $(childDom).nextAll();
			//主要针对手机端下拉按钮的处理 sjj 
			if(typeof(childDom)=='undefined'){
				//不存在按钮
				subBtnDom = $("#"+navID+".nav-form");
			}else if($(childDom).attr('ns-type')=="dropdown"){
				$(childDom).on('click',function(ev){
					var $this = $(this);
					$this.siblings().toggleClass('show');
					var isshow = true;
					if($(this).siblings().hasClass('show')){
						isshow = false;
					}
					$this.attr('isshow',isshow);
				});
			}
			var controlPlaneID = 'default';
			$(subBtnDom).find('li').off('click');
			$(subBtnDom).find('li').on('click',function(ev){
				var $this = $(this);
				var $nav = $this.closest('.nav-form');
				if(typeof($nav.attr('id'))=='undefined'){
					controlPlaneID = 'default';
				}else{
					controlPlaneID = $nav.attr('id');
				}
				var functionID = Number($this.children('a').attr('fid'));
				var optionID = Number($this.children('a').attr('optionid'));
				//如果btn下标存在，则继续执行
				var isshowBtn = $(this).attr('isshowbtn');
				if(typeof(isshowBtn)!='undefined'){
					if(isshowBtn == 'false'){
						//追加到body元素上
						$nav.remove();
					}else{
						//存在btn按钮
						$this.closest('ul').removeClass('show');
						$this.closest('ul').parent().children('[ns-type="dropdown"]').attr('isshow','true');
					}
				}
				if(isNaN(functionID)==false){
					var handlerArr = nsNav.btnGroupHandler[controlPlaneID][functionID];
					//判断下拉按钮是否是个数组，因为下拉选择钮可能存在多个
					if($.isArray(handlerArr)){
						var btnHandler = handlerArr[optionID];
						var isReturn = $this.children('a').attr('isReturn')=='true'?true:false;
						if(typeof(btnHandler) == 'function'){
							//返回调用方法是个function
							//?这个有个疑问是否存在isReturn
							if(isReturn){
								btnHandler($this);
							}else{
								btnHandler($this);
							}
						}
					}
				}
			});
		}
	}

	//sjj20181024 下拉框模式是saveCustom
	function clickHiddenBtnDropdownHandler(ev){
		//点击屏幕无关位置关闭弹框
		if($(ev.target).closest('button[ns-type="drop"]').length==0){
			$('button[ns-type="drop"]').closest('.btn-dropdown').children('ul').removeClass('open');
			$(document).off('click',clickHiddenBtnDropdownHandler);
		};
	}

	var dropSaveArray = nsNav.dropdownSaveHandler[navID];
	for(var dropI=0; dropI<dropSaveArray.length; dropI++){
		if(dropSaveArray[dropI].length > 0){
			//长度大于0表明了是有下拉选择事件
			var $dropdown;
			if(navID=='default'){
				$dropdown = $('.nav-form [dropdown-index="'+dropI+'"]');
			}else{
				$dropdown = $('#'+navID+'.nav-form [dropdown-index="'+dropI+'"]');
			}
			if($dropdown.length > 0){
				var $expandBtn = $dropdown.find('button[ns-type="drop"]');
				var $showBtn = $dropdown.find('button[ns-type="event"]');
				$expandBtn.on('click',function(ev){
					var $this = $(this);
					$('button[ns-type="drop"]').closest('.btn-dropdown').children('ul').removeClass('open');
					$this.closest('.btn-dropdown').children('.dropdown-menu').toggleClass('open');
					if($this.closest('.btn-dropdown').children('.dropdown-menu').hasClass('open')){
						$(document).on('click',clickHiddenBtnDropdownHandler);
					}
				});
				var $btns = $dropdown.find('button:not([ns-type="drop"])');
				$btns.on('click',function(ev){
					var $this = $(this);
					var text = $.trim($this.children('span').text());
					$this.closest('.btn-dropdown').find('button[ns-type="event"]').children('span').text(text);
					var optionid = $this.attr('optionid');
					var fid = $this.attr('fid');
					var $ul = $this.closest('.btn-dropdown').children('.dropdown-menu');
					$ul.removeClass('open');
					$this.closest('.btn-dropdown').find('button[ns-type="event"]').attr('optionid',optionid);
					if(typeof(dropSaveArray[fid][optionid])=='function'){
						dropSaveArray[fid][optionid]();
					}
				});
			}
		}
	}

	//下拉类型为printCustom lxh 20181115
	var dropAjaxArray = nsNav.dropdownAjaxHandler[navID];
	for(var dropI=0; dropI<dropAjaxArray.length; dropI++){
		if(dropAjaxArray[dropI].length > 0){
			//长度大于0表明了是有下拉选择事件
			var $dropdown;
			if(navID=='default'){
				$dropdown = $('.nav-form [dropdown-index="'+dropI+'"]');
			}else{
				$dropdown = $('#'+navID+'.nav-form [dropdown-index="'+dropI+'"]');
			}
			if($dropdown.length > 0){
				var $expandBtn = $dropdown.find('button[ns-type="drop"]');
				$expandBtn.on('click',function(){
					$(this).closest('.btn-dropdown').children('ul').addClass('open');
					if($(this).closest('.btn-dropdown').children('.dropdown-menu').hasClass('open')){
						$(document).on('click',clickHiddenBtnDropdownHandler);
					}
				})
			}
		}
	}
}