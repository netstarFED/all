/*******日程表 UI start**************/
/***********
*ajax读取全部日程数据
*单击已有事件的方法
*选中之后触发事件
************************/
//设置默认值
nsFullcalendar.initConfig = function(config){
	config.method = typeof(config.method) == 'string' ? config.method : 'GET';						//ajax方式默认请求方式
	config.data = typeof(config.data) == 'undefined' ? {} : config.data;							//ajax默认请求参数
	config.isSelect = typeof(config.isSelect) == 'boolean' ? config.isSelect : true;				//默认支持选中状态
	config.url = typeof(config.url) == 'string' ? config.url : '';									//ajax请求链接
	config.dataSrc = typeof(config.dataSrc) == 'string' ? config.dataSrc : '';						//ajax数据源参
	config.firstDay = typeof(config.firstDay) == 'number' ? config.firstDay : 1;					//设置一周中显示的第一天是哪天，默认是周一
	if(!$.isArray(config.dataSource)){
		config.dataSource = [];																		//自定义返回的结果集
	}
	return config;																					//返回默认参
}
//初始化调用函数
nsFullcalendar.init = function(configObj){
	var configID = typeof(configObj.id) == 'string' ? configObj.id : '';							//获取要显示日程表的id
	if(configID){
		//id存在的情况则继续
		var config = nsFullcalendar.initConfig(configObj);											//获取默认参数
		nsFullcalendar.config = config;																//全局赋值参数
		//开始绘制日程表，先获取数据源参
		nsFullcalendar.drawCalendar();																//绘制日程表
		if(config.url){
			//如果存在ajax请求参，优先调用
			$.ajax({
				url:config.url,
				type:config.method,
				data:config.data,
				dataType:'json',
				context:config,
				success:function(data){
					config = this;
					var calendarListData = [];
					if(config.dataSrc){
						//存在数据源参
						calendarListData = data[config.dataSrc];
					}else{
						calendarListData = data;
					}
					config.dataSource = calendarListData;											//结果集参数赋值
					var calendarListData = nsFullcalendar.filterData();
					nsFullcalendar.addEventsData(config,calendarListData);
				},
				error:function(){
					nsalert(language.common.returnError);
				},
			});
		}else{
			//不存在ajax请求判断是否有自定义的数据集
			var calendarListData = nsFullcalendar.filterData();
			nsFullcalendar.addEventsData(config,calendarListData);
		}
	}else{
		nsalert('参数不完整','error');
		console.log(configObj);
	}
}
//过滤返回结果集的数据
nsFullcalendar.filterData = function(){
	var config = nsFullcalendar.config;
	var calendarListData = config.dataSource;													//数据集
	var fieldConfig = config.fieldConfig;														//要显示到日程表的字段
	for(var i=0; i<calendarListData.length; i++){
		calendarListData[i].title = calendarListData[i][fieldConfig.title];
		calendarListData[i].start = calendarListData[i][fieldConfig.start];
		calendarListData[i].end = calendarListData[i][fieldConfig.end];
	}
	return calendarListData;
}
//开始绘制日程表
nsFullcalendar.drawCalendar = function(){
	var config = nsFullcalendar.config;
	$('#'+config.id).fullCalendar({
		defaultDate: config.defaultDate,														//默认显示的日期
		editable: true,																			//日历上的事件是否可以修改
		eventLimit: true, 																		//是否限制一天中显示的事件数
		//头部标题显示
		header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,basicWeek,basicDay'
			},
		views: {
			month: { // name of view
				titleFormat: 'YYYY年MM月'// other view-specific options here
			}
		},
		//将在标题的按钮上显示的文本
		buttonText: {
				prev:'上一个',
				next:'下一个',
				today: '今天',
				month: '月',
				week: '周',
				day: '天'
			},
		//titleFormat:'YYYY MMMM',															//确定标题标题中显示的文本。
		//显示中文的月份
		monthNames: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
		//缩写月份用1-12来代替
		monthNamesShort: ['1','2','3','4','5','6','7','8','9','10','11','12'],
		//一周的中文名称
		dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
		//缩写一周的简拼
		dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
		//timeFormat两种格式'h:mm'/ like '5:00','h(:mm)t' // like '7p'  H大写为24个小时
		timeFormat: 'H:mm',																	//确定每个事件将显示的时间文本
		firstDay:config.firstDay,	
		selectable:config.isSelect,
		unselectAuto:false,																	//当点击页面日历以外的位置时，是否自动取消当前的选中状态。
		events:[],
		eventClick:nsFullcalendar.eventClick,
		select:nsFullcalendar.selectClick
	});
}
//日程表添加多条事件的操作
nsFullcalendar.addEventsData = function(config,data){
	var id = config.id;
	$("#"+id).fullCalendar('renderEvents',data,true);
	if(typeof(config.completeHandler)=='function'){
		config.completeHandler(config);
	}
}
//日程表添加单条事件的操作
nsFullcalendar.addEventData = function(id,data){
	$("#"+id).fullCalendar('renderEvent',data,true);
}
//日程表修改多条事件的操作
nsFullcalendar.updateEventsData = function(id,data){
	$("#"+id).fullCalendar('updateEvents',data);
}
//日程表修改单条事件的操作
nsFullcalendar.updateEventData = function(id,data){
	$("#"+id).fullCalendar('updateEvent',data);
}
//日程表删除事件的操作
nsFullcalendar.delEventData = function(id,delID){
	$("#"+id).fullCalendar('removeEvents',delID);
}
//已有事件的单击事件
nsFullcalendar.eventClick = function(event,jsEvent,view){
	$('.fc-event').removeClass('fc-color')
	$(jsEvent.target).closest('a').addClass('fc-color')
	var config = nsFullcalendar.config;
	if(typeof(config.eventHandler)=='function'){
		return config.eventHandler(event);													//返回事件函数
	}
}
//选中状态的事件
nsFullcalendar.selectClick = function(start, end,jsEvent){
	var config = nsFullcalendar.config;
	/*var timestamp = start.unix();
	var unixTimestamp = new Date(timestamp * 1000);
	var startTime = unixTimestamp.toLocaleString();

	var timeEstamp = end.unix();
	var unixWTimestamp = new Date(timeEstamp * 1000);
	var endTime = unixWTimestamp.toLocaleString();	*/
	
	if(typeof(config.selectHandler)=='function'){
		return config.selectHandler(start,end);
	}
}
//新增日历
nsFullcalendar.dialogAdd = function(){

}
//修改日历
nsFullcalendar.dialogEdit = function(){
	
}
//删除日历
nsFullcalendar.dialogDelete = function(){

}
nsFullcalendar.initcalendar = function(config){
	var title = typeof(config.title)=='string'?config.title:'';
	var calendarId = 'calendar-'+config.id;
	var titleHtml ='';
	if(title !=''){
		titleHtml = '<div class="ns-table-panel-header">'
					+	'<h4 class="ns-table-panel-title">'
					+		'<i class="fa fa-calendar"></i>'
					+		title
					+	'</h4>'
					+'</div>'
	}
	var calendarHtml =titleHtml
					+'<div class="nstable-panel-body">'
					+	'<div id="'+calendarId+'">'
					+	'</div>'
					+'</div>'
	var $calendar = $("#"+config.id);
	$calendar.html(calendarHtml);
	var configObj = $.extend(true, {}, config);
	configObj.id = calendarId;
	delete configObj.title;
	nsFullcalendar.init(configObj);		

}
/*******日程表 UI end**************/