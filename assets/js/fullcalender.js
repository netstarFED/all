$(document).ready(function(){
	var fullCalendarJson = {
		id:			'calendar',								//要显示日程表的元素id
		defaultDate:		'2017-05-20',								//默认显示的日期
		isSelect:		true,									//是否支持选中
		url:			getRootPath() + '/assets/json/fullcalendar.json',			//请求链接
		method:			'GET',									//请求方式 GET OR POST
		data:			{},									//请求参数
		dataSrc:		'data',									//数据源参数
		//字段参数
		fieldConfig:		{
			title:'title',										//标题
			start:'start',										//开始时间
			end:'end'										//结束时间  
		},
		eventHandler:		function(data){								//点击事件的触发
			console.log(data);
		},							
		selectHandler:		function(start,end){							//是否有选中事件
			console.log(start);
			console.log(end);
		},
	}
	nsFullcalendar.init(fullCalendarJson);
	/*var data =  [
		{
			"code":"周一",
			"maincode":"43",
			"questcode":"26",
			"slowCode":"12",
		},{
			"code":"周二",
			"maincode":"25",
			"questcode":"17",
			"slowCode":"10",
		},{
			"code":"周三",
			"maincode":"92",
			"questcode":"78",
			"slowCode":"20",
		},{
			"code":"周四",
			"maincode":"52",
			"questcode":"28",
			"slowCode":"11",
		},{
			"code":"周五",
			"maincode":"33",
			"questcode":"12",
			"slowCode":"16",
		},{
			"code":"周六",
			"maincode":"55",
			"questcode":"41",
			"slowCode":"18",
		},{
			"code":"周日",
			"maincode":"78",
			"questcode":"42",
			"slowCode":"19",
		}
	]*/
	//var data = ['23','45','56','78','10'];
	var data =  [
		{
			"code":"周一",
			"maincode":"43",
		},{
			"code":"周二",
			"maincode":"25",
		},{
			"code":"周三",
			"maincode":"92",
		},{
			"code":"周四",
			"maincode":"52",
		},{
			"code":"周五",
			"maincode":"33",
			"markLine":true
		},{
			"code":"周六",
			"maincode":"55",
		},{
			"code":"周日",
			"maincode":"78",
		}
	];
	var chartJson = {
		title:'图表标题',
		type:'line',
		xAxisField:'code',
		//yAxisField:['maincode','questcode','slowCode'],
		yAxisField:'maincode',
		yAxisName:'主跑道',
		yAxisStock:'跑道',
		//yAxisName:['主跑道','快跑道','慢跑道'],
		//yAxisStock:['跑道','跑道','慢跑'],
		//isShowMax:true,
		//isShowMin:true,
		//isShowAverage:true,
		markLine:[
			{name:'abc',value:23},
			{name:'def',value:35}
		],
		data:data
	}
	var $chartDom = echarts.init($('#barchart-single')[0]);
	nsChartUI.init(chartJson,$chartDom);
});