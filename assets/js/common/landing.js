
var nslanding = {};
nslanding.data = {};
/**
*设置默认值
*/
nslanding.initConfig = function(config){
	var ajaxConfig = config.ajaxConfig;
	ajaxConfig.type = typeof(ajaxConfig.type) == 'string' ? ajaxConfig.type : 'GET';
	ajaxConfig.data = typeof(ajaxConfig.data) == 'undefined' ? {} : ajaxConfig.data;
	ajaxConfig.url  = typeof(ajaxConfig.url) == 'string' ? ajaxConfig.url : '';
	ajaxConfig.dataSrc = typeof(ajaxConfig.dataSrc) == 'string' ? ajaxConfig.dataSrc : '';
	if(!$.isArray(config.dataSource)){
		config.dataSource = []
	}
	return config;
}
/**
*初始化
*/
nslanding.initTap = function(configObj){
	var configId = typeof(configObj.id) == 'string'?configObj.id : '';
	nslanding.data[configObj.id] ={};
	if(configId){
		var config = nslanding.initConfig(configObj);
		var ajaxConfig = configObj.ajaxConfig;
		nslanding.config = config;
		$.ajax({
		url:ajaxConfig.url,
		type:ajaxConfig.type,
		data:ajaxConfig.data,
		dataType:'json',
		context:config,
		success: function(data){
				//ajax返回数据
				var backData = [];
 				if(ajaxConfig.dataSrc){
 					backData = data[ajaxConfig.dataSrc]
				}else{
					backData = data;
				}
				config.dataSource = backData;
				nslanding.data[configObj.id].config = config;
				var menuHtml = getMenuHtml(config);
				var plusClass=typeof(configObj.plusClass)=='undefined'?'':configObj.plusClass;
				var html='<div class="row '+plusClass+' overview-box" id="row-'+configObj.id+'">'+ menuHtml + '</div>'
				$("#"+configObj.id).html(html);	
				bindClick(configObj);
			},
		error:function(e){
			console.error('失败');
			}
		});
	}else{
		nsalert('参数不完整','error');
		console.log(configObj);
	}
//添加事件
	function bindClick(config){
		$('[mid="menu-'+config.id+'"]').on('click',function(ev){

			var dataSource = config.dataSource;
			var shortmenuObj = {};
			shortmenuObj.ev = ev;
			var shortmenuid = $(this).attr('nsid');
			for(var si = 0;si<dataSource.length;si++){
				if(dataSource[si].id == shortmenuid){
					shortmenuObj.data=dataSource[si];
				}
			}
			var handlerFunc=config.handlerFun;
			handlerFunc(shortmenuObj.data);
		})
	}
	//生成html
	function getMenuHtml(config){
		//var config = nslanding.config;
		var dataList = config.dataSource;
		
		var htmlStr='';
		for(var menuI=0;menuI<dataList.length;menuI++){
			var configsub=dataList[menuI];
			if(configsub){
			//设置菜单宽度
			var widthStr=(100/dataList.length)+"%";	
			if(typeof(configsub.href)=='undefined'){
				configsub.href='';
			};
			configsub.configId = config.id;
			//判定是否显示
			// configsub.isstate= configsub.ishidden == 'false ? 'block':'none';
			//'display:'+configsub.isstate+
			// var hrefStr =''
			// if(configsub.href){
			// 	var pathStr = getRootPath() + configsub.href;
			// 	hrefStr = "javascript:nsFrame.loadMenuNew('"+pathStr+"','"+0+"','"+false+"',"+configsub.parameter+");";
			// }else{
			// 	hrefStr = "javascript:void(0);";
			// };
			var iconHtml ='';
			var iconClass=typeof(configsub.icon)=='string'? configsub.icon:'fa-file-text';
			configsub.text = typeof(configsub.text)=='string'? configsub.text:'未定义';
			configsub.total =typeof(configsub.total) =='number'?configsub.total:0;
			if(iconClass.indexOf('.')>-1){
				iconHtml = '<img src='+iconClass+' style="width:48px;height:48px;text-aligh:center;margin:7px auto;display:block;line-height:48px;font-size:28px;border-radius:100px;background:#fff"></img>'
			}else{
				iconHtml = '<i class="fa '+iconClass+'" ></i>'
			}
			htmlStr += '<div class="col-xs-2"  style="width:'+widthStr+' " nsid="'+configsub.id+'"  mid="menu-'+config.id+'" >'
						//+ '<a href="'+hrefStr+'">'
						+ '<a href="javascript:void(0);">'
							+ '<div class="overview-box-item overview-box-0'+(menuI+1)+'" style="background:'+configsub.color+'">'
								+ '<div class="overview-icon">'
								+ iconHtml
								+ '</div>'
								+ '<div class="overview-info">'
								+ '<h4 class="overview-title">'+configsub.text+'</h4>'
								+ '<h2 class="overflow-quantity">'+configsub.total+'</h2>'
								+ '<p>subtitle</p>'
								+ '</div>'
							+ '</div>'
						+ '</a>'
					+ '</div>';
			};
		};
		return htmlStr;
	};
};
//编辑顶部菜单
nslanding.editTap = function(tapId,nsid,total){
	if(tapId!=''&&tapId!=undefined&&nsid!=''&&nsid!=undefined&&total!=''&&total!=undefined){
     $('#'+tapId).find('[nsid="'+nsid+'"]').find('h2').text(total);
	}else{
		nsalert('参数不完整','error');
		console.log(tapId,menuId,total);
	}
}
/**
*初始化列表config
*/
nslanding.initListConfig = function(config){
	config.title = typeof(config.title) == 'string'? config.title : '';
	config.plusClass = typeof(config.plusClass) == 'string' ? config.plusClass : '';
	config.moreUrl = typeof(config.moreUrl) == 'string' ? config.moreUrl : '';
	config.icon = typeof(config.icon) == 'string' ? config.icon : '';
	config.subSize = typeof(config.subSize) == 'string' ? config.subSize : '';
	if(!$.isArray(config.dataSource)){
		config.dataSource = [];
	}
	var ajaxConfig = config.ajaxConfig;
	ajaxConfig.url = typeof(ajaxConfig.url) == 'string' ? ajaxConfig.url : '';
	ajaxConfig.type = typeof(ajaxConfig.type) == 'string' ? ajaxConfig.type : 'GET';
	ajaxConfig.data = typeof(ajaxConfig.data) == 'undefined' ? {} : ajaxConfig.data;
	ajaxConfig.dataSrc = typeof(ajaxConfig.dataSrc) == 'string' ? ajaxConfig.dataSrc : ''; 
	return config;
}
/**
*初始化列表
*/
nslanding.initList = function(configObj){
	var configId = typeof(configObj.id) == 'string'? configObj.id : '';
	if(configId){
		var config = nslanding.initListConfig(configObj);
		var liHeight = 0;
		if(config.subSize =='fullwidth'){
			liHeight = 60;
			config.height = typeof(config.height)=='undefined'?456:config.height;
		}else if(config.subSize =='standard'){
			liHeight = 42;
			config.height = typeof(config.height)=='undefined'?350:config.height;
		}
		//每页数据长度
		//(面板高度-标题高度-分页)/li标签高度 = 每页数据长度
		config.pagelength  = Math.floor((config.height-50-45)/liHeight);
		var liListHtml='';
		for(var ci =0;ci<config.pagelength;ci++){
			var subConfig = {};
			subConfig.subSize = config.subSize;
			liListHtml+=nslanding.subInfoHtml(subConfig);
		}
		nslanding.getAjaxConfig(config);
		var moreHtml=''
		if(config.moreUrl != ''){
		moreHtml = "<a href=javascript:nsFrame.loadMenuNew('"+getRootPath()+config.moreUrl+"','0','false'); style='float:right'>更多...</a>"
		}else{
			moreHtml = '';
		}
		var headerHtml	= '<div class="ns-table-panel-header">'
						+	'<h4 class="ns-table-panel-title">'
						+		'<i class="fa '+config.icon+'"></i>'
						+		config.title
						+		moreHtml
						+	'</h4>'
						+'</div>';
		var pageliHtml = '<li class="page" nsid="page-li-'+config.id+'">'
						+'<a href="javascript:void(0);" selectPage="up" title><</a>'
						+'<a href="javascript:void(0);" selectPage="down" title>></a>'
						+'</li>';				
		var ourhtml 	='<div class="nstable-panel-body">'
						+	'<ul class="card-list" nsid="ul-'+config.id+'">'
						+		liListHtml
						+		pageliHtml
						+	'</ul>'
						+'</div>';
		var $panelId = $("#"+configObj.id);
		$panelId.html(headerHtml+ourhtml);			
	}else{
		nsalert('参数不完整','error');
		console.log(configObj);
	}
};
//设置组件是否显示
nslanding.setdisplay=function(id){
	var configS = {
		id: 	"plane-dialogS",
		title: 	"是否设为隐藏",
		size: 	"s",
		form:[
			{
				id: 		'nslandingdisplay',
				label: 		'是否显示',
				type: 		'checkbox',
				textField : 'text',
				valueField : 'value',
				value: ['2'],
				subdata : [ {
					text : '是',
					value : '1',
				},{
					text : '否',
					value : '2',
					//isDisabled:true
				}]
			}
		],
		btns:[
			{
				text: 		'确认修改',
				handler:function(){
					console.log('xxx');
				},
			}
		]
	}
	nsdialog.initShow(configS);
};
//获取ajax数据
nslanding.getAjaxConfig=function(config){
		var ajaxConfig = config.ajaxConfig;
		if(ajaxConfig.url){
		$.ajax({
			url:ajaxConfig.url,
			type:ajaxConfig.type,
			data:ajaxConfig.data,
			dataType:'json',
			context:config,
			success:function(data){
				//config = this;
				var ajaxConfigArr = [];
				if(ajaxConfig.dataSrc){
					ajaxConfigArr = data[ajaxConfig.dataSrc];
				}else{
					ajaxConfigArr = data;
				}
				config.dataSource = ajaxConfigArr;
				nslanding.data[config.id] ={};
				nslanding.data[config.id].config = config;
				nslanding.refreshInfoHtml(nslanding.data[config.id].config);
			},
			error:function(){
				console.error('失败');
			}
		});	
		}else{
			nsalert('参数不完整','error');
			console.log(ajaxConfig);
		}	
	};
//生成每条信息html
nslanding.subInfoHtml=function(config){
		var subInfoHtml = '';
		//li标签高度
		var subSize ='';
		if(config.subSize =='standard'){
			subSize = ''
		}else if(config.subSize =='fullwidth'){
			subSize = 'card-list-lg'
		}
		if(config.id){
		var subDataSource = nslanding.initDataSource(config);
		//判断是否有图标字段
		var iconHtml ='';
		if(subDataSource.icon != ''){   //id="before-'+config.panelId+'-'+config.id+'"
			iconHtml= '<div class="card-list-before" nsid="'+config.id+'" id="before-'+config.panelId+'-'+config.id+'">'
					+	'<i class="fa '+subDataSource.icon+'" nsid="'+config.id+'"></i>'
					+ '</div>'
		}else{
			iconHtml='';
		};
		//判断状态字段
		var afterHtml = '';
		if(!isNaN(config.state)){
			var spanHtml = '';
			if(config.state == 0){
				spanHtml	='<span class="text-warning" nsid="'+config.id+'">'
							+	'<i class="fa fa-envelope"></i>'
							+'</span>'
			}else if(config.state == 1){
				spanHtml	='<span class="checked" nsid="'+config.id+'">'
							+	'<i class="fa fa-envelope-open"></i>'
							+'</span>'
			}
			//id="after-'+config.panelId+'-'+config.id+'"
			afterHtml 	='<div class="card-list-after" nsid="'+config.id+'" id="after-'+config.panelId+'-'+config.id+'">'
						+	spanHtml
						+'</div>'
		}else if(typeof(config.state)=='string'){
			if(config.state!=''){
				var infostate ='';
				switch(config.state){
					case 'danger':    //红
						infostate = 'danger';
					break;
					case 'warning':   //橙
						infostate = 'warning';
					break;
					case 'info':    //蓝
						infostate = 'info';
					break;
				}
				afterHtml	= '<div class="card-list-after" nsid="'+config.id+'" id="after-'+config.panelId+'-'+config.id+'">'
							+	'<span class="badge badge-'+infostate+'" nsid="'+config.id+'">'+config.total+'</span>'
							+ '</div>'
			}else{
				afterHtml='';
			}
		}else{
			afterHtml ='';
		};
		//副标题Html
		var subHtml='';
		if(config.subTitle !=''){
			subHtml = '<span>'+config.subTitle+'</span>';
		}else{
			subHtml ='';
		};
			subInfoHtml = 	'<a href="javascript:void(0);">'
						+		iconHtml
						+		'<div class="card-list-info" nsid="'+config.id+'" id="info-'+config.panelId+'-'+config.id+'">'
				        +			'<h5 class="title" nsid="'+config.id+'">'+config.title+'</h5>'
				        +			subHtml
			            +		'</div>'
			            + 		afterHtml
						+	'</a>'		
			return subInfoHtml;

		}else{
			subInfoHtml ='<li class="card-list-item '+subSize+'" nsid="info"></li>'
			return subInfoHtml;
			nsalert('数据为空','warning');
		 	console.log(config);
		}
	}
//初始化数据源
nslanding.initDataSource=function(subDataSource){
		subDataSource.icon = typeof(subDataSource.icon) == 'string' ? subDataSource.icon : '';
		subDataSource.title = typeof(subDataSource.title) == 'string' ? subDataSource.title :'';
		subDataSource.subTitle = typeof(subDataSource.subTitle) == 'string' ? subDataSource.subTitle :'';
		subDataSource.hrefStr = typeof(subDataSource.hrefStr) == 'string' ? subDataSource.hrefStr : '';
		subDataSource.parameter = typeof(subDataSource.parameter) == 'undefined' ? {} : subDataSource.parameter;
		return subDataSource;
	};
//生成列表主体部分
nslanding.refreshInfoHtml=function (config){
		var dataSource = config.dataSource;
		var ulInfoHtml ='';
		//当前显示第几组分页 (默认为第一组)
		config.groupNum = typeof(config.groupNum)=="undefined"?0:config.groupNum;
		//当前显示第几页 (默认为第一页)
		config.selectPage = typeof(config.selectPage) == 'undefined'?"1":config.selectPage;
		var dataArr=nslanding.getSelectPageData(config,config.selectPage);
		if(dataArr.length>0){
			$('#'+config.id).find('[nsid="info"]').children('a').remove();
			$('#'+config.id).find('[nsid="info"]').each(function(index){
				if(dataArr[index]){
					dataArr[index].panelId = config.id;
					dataArr[index].subSize = config.subSize;
					var html=nslanding.subInfoHtml(dataArr[index])
					$(this).html(html);
				}
			});
		}
		//生成分页html
		var pageObj=nslanding.getPageArr(config);
		$('#'+config.id).find('[nsid="page-'+config.id+'"]').children('[selectPage="up"]').after(pageObj.pageHtml);
		//绑定点击事件
		var $div=$('[nsid="ul-'+config.id+'"]').find('div');
		$div.on('click',function(ev){
			var dataId = $(this).attr('nsid');
			//var dataId=$(ev.target).attr('nsid');
			var liData = {};
			liData.ev = ev;
			for(var i=0;i<dataSource.length;i++){
				if(dataSource[i].id == dataId){
					liData.data=dataSource[i];
				}
			}
			var handlerFunc= config.handlerFun;
			handlerFunc(liData.data);
			//nslanding.setdisplay();
		});
		nslanding.onClickPage(config);
	};
//获取当前页数据
nslanding.getSelectPageData=function(config,Pagei){
		var dataSource = config.dataSource;
		var selectPage = parseInt(Pagei);
			var dataArr = [];
			var size = config.pagelength;
			for(var i=(selectPage-1)*size;i<size*selectPage;i++){
				if(dataSource[i]){
					dataArr.push(dataSource[i]);
				}		
			}
			return dataArr;
	};
//将分页数存入二维数组每组5个;infoData:ajax数据;num:第几组    [[1,2,3,4,5],[6,7,8,9,10]]
nslanding.getPageArr=function(config){
 		var dataSource = config.dataSource;
 		//当前是第几组分页数据
 		var num = config.groupNum;
 		var arrO = [];
 		if(dataSource.length>0){
 		//总页数
		var pageCount = Math.ceil(dataSource.length/config.pagelength);
		config.pageCount=pageCount;
		//总组数
		var groupPageNum = Math.ceil(pageCount/5);
		//var arrINum=1;
		// for(var dO = 0;dO<groupPageNum;dO++){
		// 	var arrI = [];
		// 	var count=0;
 	// 		for(var dI = 0; dI < pageCount;dI++){
 	// 			if(count < 5){
 	// 				var dataI=dO*5+1+dI;
 	// 				var dataLi=nslanding.getSelectPageData(config,dataI);
 	// 				if( dataLi.length!=0){
 	// 				arrI[dI]=dataI;
		// 			count++;	
 	// 				}
 	// 			}else{
 	// 				break;
 	// 			}
 	// 		}
		// 	arrO[dO]=arrI;
		// }
			var x = 1;
			for(var dO = 0;dO<groupPageNum;dO++){
				var arrI =[];
				var count = 0;
				for(var dI =x;dI<=pageCount;dI++){
					if(count<5){
						x=dI+1;
						arrI.push(dI)
						count++;
					}
				}
               arrO.push(arrI);
			}
 		}
 		//分页按钮
		var pageHtmlStr='';
		//当前选择页
		if($.isArray(arrO[num])){
			for(var arrI=0;arrI<arrO[num].length;arrI++){
			pageHtmlStr+= '<a href="javascript:void(0);" ns-id="page-'+config.id+'" selectgroup="'+num+'" selectPage="'+arrO[num][arrI]+'" title>'+arrO[num][arrI]+'</a>';
			}
		}
		return arr={
 			data:arrO[num],
 			index:num,
 			pageHtml:pageHtmlStr
 		}
 	};
//分页点击方法
nslanding.onClickPage=function(config){
		var configId = config.id;
		var dataSource = config.dataSource;
		var $pageLiId = $('[nsid="page-li-'+configId+'"]');
		//当前组
 	 	var groupN=config.groupNum;
 	 	//当前页    
    	var selectPage=config.selectPage;
    	//总页数
		var pageCount=config.pageCount;
    	var pageObj=nslanding.getPageArr(config);
        $('[ns-id="page-'+configId+'"]').remove();
		$pageLiId.children('[selectPage="up"]').after(pageObj.pageHtml);
		$pageLiId.children('[ns-id="page-'+configId+'"]').each(function(){
			if($(this).attr("selectPage")==selectPage){
			$(this).attr("class","current")
			}
		})
		$pageLiId.children('a').off();
		
		//如果最后一页没有在数组中则下一页点击事件可用
		if($.inArray(pageCount,pageObj.data)<0){
			$pageLiId.children('[selectpage="down"]').on('click',function(){
				var state=$(this).attr("selectpage");
				nslanding.getUpOrDownData(config,state);
			})
		}else{
			$pageLiId.children('[selectpage="down"]').off()
		}
		//如果第一页没有在数组中则上一页点击事件可用
		if($.inArray(1,pageObj.data)<0){
			$pageLiId.children('[selectpage="up"]').on('click',function(){
				var state=$(this).attr("selectpage");
				nslanding.getUpOrDownData(config,state);
			})
		}else{
			$pageLiId.children('[selectpage="up"]').off()
		}
		$('[ns-id="page-'+configId+'"]').on('click',function(){
			var page=$(this).attr("selectPage");
			console.log(page);
			config.selectPage=page;
			nslanding.getAjaxConfig(config);
		});
	};
//点击前后分页
nslanding.getUpOrDownData=function(config,state){
			var configId = config.id;
			//判断'<'还是'>'
			var state = state == "up"?-1:1;
			//变化分页当前组
			config.groupNum = parseInt(config.groupNum)+state;
			console.log(config.selectPage);
			var pageObj=nslanding.getPageArr(config);
			var datai=0;
			if(state==1){
				datai=0
			}else{
				datai=4
			}
			config.selectPage=(pageObj.data[datai]).toString();
			console.log(config.selectPage);
			nslanding.getAjaxConfig(config);
		}
//刷新指定列表
nslanding.refreshList=function(listid){
	var config=nslanding.data[listid].config;
	nslanding.getAjaxConfig(config);
}

