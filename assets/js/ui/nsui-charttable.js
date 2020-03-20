nsUI.echarttable = {};
nsUI.echarttable.init = function(config){
	var isValid = valid();
	function valid(){
		var isValid = true;
		if(typeof(config.id)=='undefined'){
			nsalert('id必填');
			isValid = false;
		}
		if(!$.isArray(config.echart)){
			nsalert('图表分类为数组格式');
			isValid = false;
		}
		return isValid;
	}
	if(isValid){
		var defaultIndex = typeof(config.defaultIndex)=='number' ? config.defaultIndex : 0;//默认读取echart第一个
		config.$container = $('#'+config.id);
		nsUI.echarttable.config = config;
		nsUI.echarttable.changeTab(defaultIndex);
	}
}
nsUI.echarttable.changeTab = function(index){
	var config = nsUI.echarttable.config;
	var categroyLength = config.echart.length;
	if(index == -1){
		tableInit();
	}else if(index >= 0){
		echartInit();
	}
	function tableInit(){
		var tableID = config.id + '-table';
		var tableHtml = '<table class="table table-singlerow table-hover table-bordered table-striped" id="'+tableID+'"></table>';
		config.$container.html(tableHtml);
		var tableJson = {
			dataConfig:{
				tableID:		tableID,
				dataSource:		config.data,
				isSearch:		false,
			},
			columnConfig:config.field,
			uiConfig:{
				pageLengthMenu:10,
			}
		};
		baseDataTable.init(tableJson.dataConfig,tableJson.columnConfig,tableJson.uiConfig);
	}
	function echartInit(){
		var chartData = config.echart[index];
		var type = chartData.type;
		var chartJson = {
			title:chartData.title,
			type:type,
			data:config.data,
			xAxisField:chartData.xAxisField,
			yAxisField:chartData.yAxisField,
			legendField:chartData.legendField,
			legendData:chartData.legendData,
			changeHandler:chartData.changeHandler,
			magicType:chartData.magicType,
			countField:chartData.countField,
			seriesName:chartData.seriesName,
			config:config
		}
		switch(type){
			case 'bar':
				//柱形图
				break;
			case 'line':
				//折线图
				break;
			case 'pie':
			case 'ring':
				var pieArr = [];
				for(var pieI=0;pieI<config.data.length;pieI++){
					pieArr.push({
						name:config.data[pieI][chartData.xAxisField],
						value:config.data[pieI][chartData.yAxisField]
					})
				}
				chartJson.data = pieArr;
				break;
			case 'funnel':
				chartJson.seriesTooltip = chartData.tooltipField;
				break;
			case 'map':
				chartJson.roam = typeof(chartData.roam) == 'undefined' ? false : chartData.roam;
				chartJson.area = typeof(chartData.area) == 'undefined' ? false : chartData.area;
				chartJson.changeHandler = chartData.changeHandler;
				break;
			case 'complexchart':
				if(config.isTargetId){chartJson.isTargetId = config.isTargetId;};
				if($.isArray(chartData.magicType)){chartJson.magicType = chartData.magicType;};
				break;
			default:
				break;
		}
		config.$container.html('<div class="chart" style="width:100%;height:500px;"></div>');
		var $chartDom = echarts.init(config.$container.children('.chart')[0]);
		nsUI.chart(chartJson,$chartDom);
	}
}
nsUI.welcomePage = {};
nsUI.welcomePage.charge = function(config){
	if(!$.isArray(config.content)){
		nsalert('参数不合法');
		return false;
	}
	var contentArr = config.content;
	var $container = $('#'+config.id);
	var html = '';
	for(var indexI=0; indexI<contentArr.length; indexI++){
		var valueStr = contentArr[indexI].value;
		var valueHtml = valueStr;
		var contentHtml = '';
		var type = contentArr[indexI].type;
		var nameStr = contentArr[indexI].name;
		var classStr = typeof(contentArr[indexI].class)=='string' ? contentArr[indexI].class : '';
		if(typeof(contentArr[indexI].formatHandler)=='function'){valueStr = contentArr[indexI].formatHandler(valueStr);}
		if(typeof(contentArr[indexI].function)=='function'){
			valueHtml = '<a href="javascript:void(0)" ns-click="true" ns-index="'+indexI+'">'+valueStr+'</a>';
		}
		switch(type){
			case 'nameFirst':
				contentHtml = '<div class="format-content-name">'+nameStr+'</div>'
								+'<div class="format-content-value">'+valueHtml+'</div>';
				break;
			case 'valueFirst':
				contentHtml = '<div class="format-content-value">'+valueHtml+'</div>'
								+'<div class="format-content-name">'+nameStr+'</div>';
				break;
		}
		html += '<div class="statistics-item '+classStr+'">'
					+contentHtml
				+'</div>';
	}
	$container.html(html);
	var $a = $container.find('[ns-click="true"]');
	$a.off('click');
	$a.on('click',function(ev){
		var $this = $(this);
		var nIndex = $this.attr('ns-index');
		var valueStr = contentArr[nIndex].value;
		var data = contentArr[nIndex].functionData;
		data.value = valueStr;
		contentArr[nIndex].function(data);
	});
}