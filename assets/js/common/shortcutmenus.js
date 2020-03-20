var nsShortCutMenus = {};
nsShortCutMenus.data = {};
//默认窗体显示6条数据
nsShortCutMenus.size = 6;
//初始化菜单
nsShortCutMenus.init = function(menuJson){	
	if(debugerMode){
		if(typeof(menuJson.id)=='undefined'){
			console.error('配置参数必须指定id');
			console.error(menuJson);
			return false;
		}
		if(typeof(menuJson.url)=='undefined'){
			console.error('配置参数必须指定url');
			console.error(menuJson);
			return false;
		}
	};
	menuJson.type = typeof(menuJson.type)=='undefined'?"GET":menuJson.type;
	menuJson.data = typeof(menuJson.data)=='undefined'?'':menuJson.data;
	menuJson.plusClass = typeof(menuJson.plusClass)=='undefined'?'':menuJson.plusClass;
	nsShortCutMenus.data[menuJson.id] = menuJson;									
	$.ajax({
		url:menuJson.url,
		type:menuJson.type,
		data:menuJson.data,
		dataType:"json",
		success: function(data){
				if(data.success){
							//html
							var menuHtml = nsShortCutMenus.getMenuHTML(data,menuJson.id);
							//扩展类名
							var plusClass=typeof(menuJson.plusClass)=='undefined'?'':menuJson.plusClass;
							var html='<div class="row '+plusClass+'" id="row-'+menuJson.id+'">'+ menuHtml + '</div>'
				}else{
					//获取信息失败输出后台返回的错误信息
					nsalert(data.msg);
				}
			$("#"+menuJson.id).html(html);	
		},
		error:function(e){
			console.error('失败');
		}
	});
};
//快捷菜单HTML
nsShortCutMenus.getMenuHTML = function(data,menuJsonId){
	var htmlStr='';
	var menuconfigArr=[];
    for(var menuI=0;menuI<data.rows.length;menuI++){
    	var config=data.rows[menuI];
    	if(config){
    	//设置菜单宽度
		var widthStr=(100/data.rows.length)+"%";	
		if(typeof(config.href)=='undefined'){
			config.href='';
		};
		var hrefStr =''
		if(config.href){
			var pathStr = getRootPath() + config.href;
			hrefStr = "javascript:nsFrame.loadMenuNew('"+pathStr+"','"+0+"','"+false+"',"+config.parameter+");";
		}else{
			hrefStr = "javascript:void(0);";
		};
		var iconClass=typeof(config.icon)=='undefined'?'fa-file-text':config.icon;
		htmlStr += '<div class="col-xs-2"  style="width:'+widthStr+'">'
					+ '<a href="'+hrefStr+'">'
						+ '<div class="overview-box-item overview-box-0'+(menuI+1)+'">'
							+ '<div class="overview-icon">'
							+ '<i class="fa '+iconClass+'"></i>'
							+ '</div>'
							+ '<div class="overview-info">'
							+ '<h4 class="overview-title">'+config.text+'</h4>'
							+ '<h2 class="overflow-quantity">'+config.total+'</h2>'
							+ '<p>subtitle</p>'
							+ '</div>'
						+ '</div>'
					+ '</a>'
				+ '</div>';
    	};
    	menuconfigArr.push(config);
    };
    nsShortCutMenus.data[menuJsonId].menuconfigArr = menuconfigArr;	
	return htmlStr;
};
//信息列表(消息/公告)----------------------------------------------------------------------
nsShortCutMenus.infolistinit = function(infoJson){
	if(debugerMode){
		if(typeof(infoJson.id)=='undefined'){
			console.error('配置参数必须指定id');
			console.error(infoJson);
			return false;
		};
		if(typeof(infoJson.url)=='undefined'){
			console.error('配置参数必须指定url');
			console.error(infoJson);
			return false;
		}
	};
	infoJson.icon  = typeof(infoJson.icon) =='undefined'?'':infoJson.icon;
	infoJson.title = typeof(infoJson.title) =='undefined'?'':infoJson.title;
	var moreHtml = ''
	infoJson.moreUrl = typeof(infoJson.moreUrl) == 'undefined'?'':infoJson.moreUrl;
	if(infoJson.moreUrl != ''){
		moreHtml = "<a href=javascript:nsFrame.loadMenuNew('"+getRootPath()+infoJson.moreUrl+"','0','false'); style='float:right'>更多...</a>"
	}else{
		moreHtml = '';
	}
	var infoJsonId = infoJson.id;
	var nsinfoliid ='[nsid="info-li-'+infoJsonId+'"]';
	var nspageliid ='[nsid="page-li-'+infoJsonId+'"]';
	//标题html
	var headerHtml = '<div class="ns-table-panel-header">'
						+'<h4 class="ns-table-panel-title">'
							+'<i class="fa '+infoJson.icon+'"></i>'
							+infoJson.title
							+moreHtml
						+'</h4>'
					+'</div>';
	infoJson.isState = typeof(infoJson.isstate) =='undefined'?false:infoJson.isstate;				
	// var pageSize = typeof(infoJson.pageSize)=="undefined"?6:infoJson.pageSize;
	// infoJson.pageSize = pageSize;
	//infoJson.isState = isState; 
	if(typeof(infoJson.type)=='undefined'){
		infoJson.type="GET";
	}
	if(typeof(infoJson.data)=='undefined'){
		infoJson.data={};
	}
	 nsShortCutMenus.data[infoJsonId] = infoJson;
	 //存储全部数据
	 nsShortCutMenus.data[infoJsonId].dataConfig={};
	var liSize=nsShortCutMenus.size;
	var liHtml= '';
	for(var liI = 0;liI<liSize;liI++){
		liHtml += '<li class="card-list-item" nsid="info-li-'+infoJsonId+'">'		
				+'</li>'
	}
	var pageliHtml = '<li class="page" nsid="page-li-'+infoJsonId+'">'
						+'<a href="javascript:void(0);" selectPage="up" title><</a>'
						+'<a href="javascript:void(0);" selectPage="down" title>></a>'
					+'</li>';
	var infoBodyHtml = '<div class="nstable-panel-body">'
						+'<ul class="card-list" nsid="info-ul-'+infoJsonId+'">'
							+liHtml
							+pageliHtml
						+'</ul>'
					+'</div>';	 
	$("#"+infoJsonId).html(headerHtml+infoBodyHtml);

	nsShortCutMenus.ajaxInit(infoJson);
};
// ajax显示内容
nsShortCutMenus.ajaxInit=function(infoJson){
	var infoJsonId = infoJson.id;
		$.ajax({
		url:infoJson.url,
		type:infoJson.type,
		data:infoJson.data,
		dataType:'json',
		success:function(data){
			if(data.success){
				//1获取ajax数据后将数据封装到自定义对象中
				nsShortCutMenus.data[infoJsonId].dataConfig=data.rows   
				nsShortCutMenus.getPageData(infoJson);
			}else{
				//获取信息失败输出后台返回的错误信息
				nsalert(data.msg);
			}
		},
		error:function(e){
			console.error('失败');
		}
	});
	
	}
//获取页面数据
nsShortCutMenus.getPageData=function(config){
	var infoJsonId = config.id;
	var $infoJsonId = $('[nsid="info-li-'+infoJsonId+'"]');
	//2用自定义对象中的数据对页面赋值
    var infoData = nsShortCutMenus.data[infoJsonId].dataConfig;
    //设置当前选中页默认未选中时当前选中页为1
	var selectPage=nsShortCutMenus.data[infoJsonId].selectPage;
	selectPage= typeof(selectPage) == "undefined" ? 1:selectPage;
	nsShortCutMenus.data[infoJsonId].selectPage = selectPage;
	//数据长度
	nsShortCutMenus.data[infoJsonId].dataLength =infoData.length;
	var dataArr=nsShortCutMenus.getSelectPageData(infoData,selectPage);
	dataHtml(dataArr);
	var ajaxFunc=nsShortCutMenus.ajaxInit;
	//行点击事件
    nsShortCutMenus.onClickRow(infoData,config,ajaxFunc,$infoJsonId)
    //分页点击事件
	nsShortCutMenus.onClickPage(infoData,config,ajaxFunc);

//根据给定数据显示		
	function dataHtml(data){
		//存储当前页数据
	 	nsShortCutMenus.data[infoJsonId].pageConfig={};
		$infoJsonId .children('a').remove();
		$infoJsonId .each(function(index){
			if(data[index] != undefined){
			var aHtml = subHtml(data[index]);
			$(this).html(aHtml);
			}
			});
			//填充li标签中的html
	function subHtml(config){
		nsShortCutMenus.data[infoJsonId].pageConfig[config.id]=	config;
		var isState=nsShortCutMenus.data[infoJsonId].isState;
		var checked = config.state == 1?'checked':'';
		var envelope= config.state == 1?'fa-envelope-open':'fa-envelope';
		//阅读状态html
		var stateHtml='<div class="card-list-after">'
						+ '<span class="text-warning '+checked+'">'
							+ '<i class="fa '+envelope+'"></i>'
						+ '</span>'
					+ '</div>';
		var subinfoHtml = '<div class="card-list-info">'
							+'<h5 class="title">'
							+config.text
							+'</h5>'
						+ '</div>';
		//设置是否显示阅读后状态 默认false
		var isState = isState==false?'':stateHtml					
		var	aHtml 	= '<a href="javascript:void(0);" id="'+config.id+'" title>'
							+subinfoHtml
							+isState
					'</a>'
		return aHtml;						
	}	
	}
}
//行点击事件
nsShortCutMenus.onClickRow=function(infoData,infoJson,ajaxFunc,$infoJsonId){
		var infoJsonId = infoJson.id;
		//信息栏绑定点击事件
			$infoJsonId .off();
			$infoJsonId .on('click',function(){
			var liId = $(this).children('a').attr('id');
			var liData= nsShortCutMenus.data[infoJsonId].pageConfig[liId];
			var handlerFun = infoJson.handler
 			//执行自定义事件
 			handlerFun(liData);
 			//5调用ajax方法刷新页面
		    //ajaxFunc(infoJson);
         	})
    }
/**
*对外方法刷新指定列表
*/
nsShortCutMenus.refreshData = function(MenusId){
	var config=nsShortCutMenus.data[MenusId]

	nsShortCutMenus.ajaxInit(config);
}   
/**
*分页点击事件
*/
nsShortCutMenus.onClickPage=function(infoData,infoJson,ajaxFunc){	
		//默认状态num为0;
		var infoJsonId = infoJson.id;
		var $infoJsonId = $('[nsid="page-li-'+infoJsonId+'"]');
 	 	var groupN=typeof(nsShortCutMenus.data[infoJsonId].groupNum)=="undefined"?0:nsShortCutMenus.data[infoJsonId].groupNum;
    	var selectPage=nsShortCutMenus.data[infoJsonId].selectPage;
    	var pageArr=getPageArr(infoData,groupN);
        var pageNumHtml=getPageHtml(infoJsonId,pageArr);
        $infoJsonId.children('[ns-id="page-'+infoJsonId+'"]').remove();
		$infoJsonId.children('[selectPage="up"]').after(pageNumHtml);
		$infoJsonId.children('[ns-id="page-'+infoJsonId+'"]').each(function(){
			if($(this).attr("selectPage")==selectPage){
			$(this).attr("class","current")
			}
		})
		$infoJsonId.children('a').off();
		//总页数
		var pageCount=nsShortCutMenus.data[infoJsonId].pageLength;
		//如果最后一页没有在数组中则下一页点击事件可用
		if($.inArray(pageCount,pageArr.data)<0){
			$infoJsonId.children('[selectpage="down"]').on('click',function(){
				var state=$(this).attr("selectpage");
				getUpOrDownData(infoJsonId,infoData,state,$infoJsonId);
			})
		}else{
			$infoJsonId.children('[selectpage="down"]').off()
		}
		//如果第一页没有在数组中则上一页点击事件可用
		if($.inArray(1,pageArr.data)<0){
			$infoJsonId.children('[selectpage="up"]').on('click',function(){
				var state=$(this).attr("selectpage");
				getUpOrDownData(infoJsonId,infoData,state,$infoJsonId);
			})
		}else{
			$infoJsonId.children('[selectpage="up"]').off()
		}
		$('[ns-id="page-'+infoJsonId+'"]').on('click',function(){
			var page=$(this).attr("selectPage");
			console.log(page);
			nsShortCutMenus.data[infoJsonId].selectPage=page;
			ajaxFunc(infoJson);
		});
		//点击前后分页
		function getUpOrDownData(infoJsonId,infoData,state,$infoJsonId){
			var state = state == "up"?-1:1;
			var n = $('[ns-id="page-'+infoJsonId+'"]').attr("selectgroup");
				var pageArr=getPageArr(infoData,parseInt(n)+state);
		        var pageNumHtml=getPageHtml(infoJsonId,pageArr);
		        $('[ns-id="page-'+infoJsonId+'"]').remove();
				$infoJsonId.children('[selectPage="up"]').after(pageNumHtml);
				nsShortCutMenus.data[infoJsonId].selectPage=pageArr.data[pageArr.data.length-1];
				ajaxFunc(infoJson);
		}
	//将分页数存入二维数组每组5个;infoData:ajax数据;num:第几组
 	function getPageArr(infoData,num){
 		nsShortCutMenus.data[infoJsonId].groupNum = num;
 		var arrO = [];
 		if(infoData.length>0){
 		//总页数
		var pageCount = Math.ceil(infoData.length/6);
		nsShortCutMenus.data[infoJsonId].pageLength=pageCount;
		//总组数
		var groupPageNum = Math.ceil(pageCount/5);
		//var arrINum=1;
		for(var dO = 0;dO<groupPageNum;dO++){
			var arrI = [];
			var count=0;
 			for(var dI = 0; dI < pageCount;dI++){
 				if(count < 5){
 					var dataI=dO*5+1+dI;
 					var dataLi=nsShortCutMenus.getSelectPageData(infoData,dataI);
 					if( dataLi.length!=0){
 					arrI[dI]=dataI;
					count++;	
 					}
 				}else{
 					break;
 				}
 			}
			arrO[dO]=arrI;
		}
 		}
 		return arr={
 			data:arrO[num],
 			index:num
 		}
 	};
	//处理分页html
 function getPageHtml(id,pagedata){
 	var pageNumArr = pagedata.data;
 	var index = pagedata.index;
	//分页按钮
	var firstpageHtml='';
	//当前选择页
	 var selectgroup = typeof(selectgroup) == "undefined"?1:selectgroup;
	 if($.isArray(pageNumArr)){
	 	for(var arrI=0;arrI<pageNumArr.length;arrI++){
		firstpageHtml+= '<a href="javascript:void(0);" ns-id="page-'+infoJsonId+'" selectgroup="'+index+'"   selectPage="'+pageNumArr[arrI]+'" title>'+pageNumArr[arrI]+'</a>';
		}
	 }
	
	return firstpageHtml;
		}
    }
 //获取当前页数据
nsShortCutMenus.getSelectPageData=function(data,selectPage){
			var dataArr = [];
			var size = nsShortCutMenus.size;
			for(i=(selectPage-1)*size;i<size*selectPage;i++){
				if(data[i]){
					dataArr.push(data[i]);
				}		
			}
			return dataArr;
}
//待办信息-----------------------------------------------------------
nsShortCutMenus.activeInfo = function(activeInfoJson){
	if(debugerMode){
		if(typeof(activeInfoJson.id)=='undefined'){
			console.error('配置参数必须指定id');
			console.error(activeInfoJson);
			return false;
		}
		if(typeof(activeInfoJson.url)=='undefined'){
			console.error('配置参数必须指定url');
			console.error(activeInfoJson);
			return false;
		}
	};
	var activeJsonId=activeInfoJson.id;
	//分页li标签nsid
	var nsliid="[nsid='page-li-"+activeJsonId+"']";
	activeInfoJson.icon = typeof(activeInfoJson.icon)=='undefined'?'':activeInfoJson.icon;
	activeInfoJson.title = typeof(activeInfoJson.title)=='undefined'?'':activeInfoJson.title;
	//activeInfoJson.pageSize = typeof(activeInfoJson.pageSize)=="undefined"?6:activeInfoJson.pageSize;  
	activeInfoJson.type = typeof(activeInfoJson.type)=='undefined'?"GET":activeInfoJson.type;
	var moreHtml = ''
	activeInfoJson.moreUrl = typeof(activeInfoJson.moreUrl) == 'undefined'?'':activeInfoJson.moreUrl;
	if(activeInfoJson.moreUrl != ''){	
		moreHtml = "<a href=javascript:nsFrame.loadMenuNew('"+getRootPath()+activeInfoJson.moreUrl+"','0','false'); style='float:right'>更多...</a>"
	}else{
		moreHtml = '';
	}
	if(typeof(activeInfoJson.data)=='undefined'){
		activeInfoJson.data={};
	}
	var headerHtml = '<div class="ns-table-panel-header">'
						+'<h4 class="ns-table-panel-title">'
							+'<i class="fa '+activeInfoJson.icon+'"></i>'
							+activeInfoJson.title
							+moreHtml
						+'</h4>'
					+'</div>';

	var liSize=nsShortCutMenus.size;
	var liHtml= '';
	for(var liI = 0;liI<liSize;liI++){
		liHtml += '<li class="card-list-item card-list-lg" nsid="info-li-'+activeJsonId+'">'		
				+'</li>'
	}
	var pageliHtml = '<li class="page" nsid="page-li-'+activeJsonId+'">'
						+'<a href="javascript:void(0);" selectPage="up" title><</a>'
						+'<a href="javascript:void(0);" selectPage="down" title>></a>'
					+'</li>';
	var bodyHtml = '<div class="nstable-panel-body">'
					+'<ul class="card-list" nsid="info-ul">'
					+liHtml
					+pageliHtml
					+'</ul>'
				+'</div>';
	var allHtml = headerHtml+bodyHtml;			
	$("#"+activeJsonId).html(allHtml);			
	nsShortCutMenus.data[activeJsonId] = activeInfoJson;
	nsShortCutMenus.actAjaxFunc(activeInfoJson);	
};
nsShortCutMenus.actAjaxFunc = function(activeInfoJson){
	var activeJsonId = activeInfoJson.id
	$.ajax({
		url:activeInfoJson.url,
		type:activeInfoJson.type,
		data:activeInfoJson.data, 
		dataType:'json',
		success:function(data){
			if(data.success){
				//1获取ajax数据后将数据封装到自定义对象中
				nsShortCutMenus.data[activeJsonId].dataConfig=data.rows
     
				nsShortCutMenus.getActiveData(activeInfoJson);
			}else{
				//获取信息失败输出后台返回的错误信息
				nsalert(data.msg);
			}
		},
		error:function(e){
			console.error('失败');
		}
	})
}
//获取待办列表数据
nsShortCutMenus.getActiveData = function(activeInfoJson){
	var activeJsonId = activeInfoJson.id
	var $activeJsonId = $('[nsid="info-li-'+activeJsonId+'"]');
	//2用自定义对象中的数据对页面赋值
    var infoData = nsShortCutMenus.data[activeJsonId].dataConfig;
    //设置当前选中页默认未选中时当前选中页为1
	var selectPage=nsShortCutMenus.data[activeJsonId].selectPage;
	selectPage= typeof(selectPage) == "undefined" ? 1:selectPage;
	nsShortCutMenus.data[activeJsonId].selectPage = selectPage;
	//数据长度
	nsShortCutMenus.data[activeJsonId].dataLength =infoData.length;
	var rows=nsShortCutMenus.getSelectPageData(infoData,selectPage);
	$activeJsonId.children('a').remove();
	$activeJsonId.each(function(index){
		if(rows[index] != undefined){
		var aHtml = getLiHtml(rows[index]);
		$(this).html(aHtml);
		}
	});
	function getLiHtml(config){
	var beforeHtml = '<div class="card-list-before">'
					+'<i class="fa '+config.icon+'"></i>'
					+'</div>';
	var infoHtml = '<div class="card-list-info">'
					+'<h5 class="title">'
					+config.activityName
					+'</h5>'
					+'<span>'+config.processName+'</span>'
				 + '</div>';
	var afterHtml = '<div class="card-list-after">'
					+'<span class="badge '+config.state+'">'+config.total+'</span>'
				+  '</div>';
	if(typeof(config.href)=='undefined'){
			config.href='';
		};
	var hrefStr =''
		if(config.href){
			var pathStr = getRootPath() + config.href;
			hrefStr = "javascript:nsFrame.loadMenuNew('"+pathStr+"','"+0+"','"+false+"',"+config.parameter+");";
		}else{
			hrefStr = "javascript:void(0);";
		};			
	var lihtml = '<a href="'+hrefStr+'" title>'
					+ beforeHtml
					+ infoHtml
					+ afterHtml
				+ '</a>'	
	return lihtml;
	}
	var ajaxFunc = nsShortCutMenus.actAjaxFunc;
	//分页点击事件
   	nsShortCutMenus.onClickPage(infoData,activeInfoJson,ajaxFunc);	
};


