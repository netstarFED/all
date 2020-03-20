nsUI.chart = function (chartJson, chartDom) {
	var dataSource = chartJson.data;//数据源
	var regression = chartJson.regression ? chartJson.regression : "linear";
	var order = chartJson.order ? chartJson.order : 2;
	var xAxisField = chartJson.xAxisField;																		//x轴字段
	var yAxisField = chartJson.yAxisField;																		//y轴字段
	var xAxisName = chartJson.xAxisName;																		//多字段显示名称
	var xAxisStock = chartJson.xAxisStock;																		//多字段对应提示名称	
	var yAxisName = chartJson.yAxisName;																		//多字段显示名称
	var yAxisStock = chartJson.yAxisStock;																		//多字段对应提示名称
	var xAxisArr = [];																							//x轴数组值
	var yAxisArr = [];																							//y轴数组值
	var seriesArr = [];																							//生成的序列数组值
	var showPosition = typeof (chartJson.showPosition) == 'undefined' ? 'x' : chartJson.showPosition;			//图标生成模式 y轴 or x轴
	showPosition = showPosition.toLocaleUpperCase();															//转换成大写的X or Y
	var titleStr = chartJson.title;																				//标题
	var isXRotate = typeof (chartJson.isXRotate) == 'boolean' ? chartJson.isXRotate : false;						//x轴刻度标签旋转是否有角度
	var isShowMax = typeof (chartJson.isShowMax) == 'boolean' ? chartJson.isShowMax : false;						//是否显示最大值
	var isShowMin = typeof (chartJson.isShowMin) == 'boolean' ? chartJson.isShowMin : false;						//是否显示最小值
	var isShowAverage = typeof (chartJson.isShowAverage) == 'boolean' ? chartJson.isShowAverage : false;			//是否显示平均值
	var legendTitle = [];																						//只能是数组 
	var xIndexLength = 0;																						//x轴显示长度
	var isFlagMark = false;																						//是否定义了标识
	var markLineArr = [];																						//标线数组	
	var radius = chartJson.size;
	//鼠标悬停时信息前缀
	var prefixName = chartJson.prefixName;
	//标题title		

	var options = {
		title: { text: titleStr },
		tooltip: {},
		toolbox: {
			show: true,
			feature: {
				saveAsImage: {}
			}
		},
		legend: {
			data: [],
		},
	}
	if ($.isArray(chartJson.magicType)) { options.toolbox.feature.magicType = { show: true, type: chartJson.magicType } };
	/**************x轴data参数配置 start******************/
	if (typeof (xAxisField) == 'string') {
		for (var i = 0; i < dataSource.length; i++) {
			var xAxisValue = dataSource[i][xAxisField];
			if(chartJson.dateFormat){
				xAxisValue = moment(xAxisValue).format(chartJson.dateFormat);
			}
			xAxisArr.push(xAxisValue);
		}
		xIndexLength = xAxisArr.length - 1;
	} else if (chartJson.xAxisName) {
		xAxisArr = chartJson.xAxisName;
	}
	/**************x轴data参数配置 end******************/
	/**************标线 start*****************/
	if ($.isArray(chartJson.markLine)) {
		if (chartJson.markLine.length > 0) {
			isFlagMark = true;
			for (var markI = 0; markI < chartJson.markLine.length; markI++) {
				var markJson = {
					name: chartJson.markLine[markI].name,
					coord: [0, chartJson.markLine[markI].value]
				};
				if(chartJson.markLine[markI].lineStyle){
					markJson.lineStyle = chartJson.markLine[markI].lineStyle;
				}
				var lineJson = [
					markJson, {
						coord: [xIndexLength, chartJson.markLine[markI].value]
					}
				]
				markLineArr.push(lineJson);
			}
		}
	}
	/**************标线  end******************/
	//y轴配置
	if (typeof (yAxisField) == 'string') {
		for (var i = 0; i < dataSource.length; i++) {
			yAxisArr.push(dataSource[i][yAxisField]);
		}
	}
	//判断图形
	switch (chartJson.type) {
		case 'line':
		case 'bar':
			//调用柱状图和线形图函数
			lineOrbarChart();
			break;
		case 'scatter':
			scatterFun();
			break;
		case 'funnel':
			//漏斗图
			funnelCirque();
			break;
		case 'pie':
		case 'ring':
			//调用饼图和环形图函数
			pieOrCirque();
			break;
	}
	//散点图
	function scatterFun() {
		var scatterdata = [];
		if ($.isArray(dataSource)) {
			scatterdata = dataSource;
		}
		if(isFlagMark){
			var seriesJson = {
				name: typeof (chartJson.title) == 'string' ? chartJson.title : '',
				type: chartJson.type,
				data: yAxisArr,
			}
			if(chartJson.symbol){
				seriesJson.symbol = chartJson.symbol;
			}
			if(chartJson.color){
				seriesJson.color = chartJson.color;
			}
			if (isFlagMark) {
				seriesJson.markLine = {
					data: markLineArr,
					symbol:'none',
				}
			}
			seriesArr.push(seriesJson);
			options.series = seriesArr;
			//走默认的显示
			options.xAxis = {
				data: xAxisArr
			}
			//x轴标签有角度显示
			if (isXRotate) {
				options.xAxis.axisLabel = {
					show: true,
					rotate: -70
				}
			}
			options.yAxis = { type: 'value' };
			if(chartJson.yAxisMin){
				options.yAxis.min = chartJson.yAxisMin;
			}
			if(chartJson.yAxisMax){
				options.yAxis.max = chartJson.yAxisMax;
			}
		}else{

			var myRegression = ecStat.regression(regression, scatterdata, order);
			myRegression.expression = myRegression.expression.replace(/\+[\s]*\-/g, "- ")
				.replace(/((\+|\-)[\s]*0(?!\.))|(0[\s]*(\+|\-))/g, "")
				.replace(/\b\s*\b/g, " ")
				.replace(/^\s*|\s*$/g, "");
			myRegression.points.sort(function (a, b) {
				return a[0] - b[0];
			});
			options.tooltip = {
				trigger: 'axis',
				axisPointer: {
					type: 'line'
				}
			};
			options.xAxis = {
				type: 'value',
				splitLine: {
					lineStyle: {
						type: 'dashed'
					}
				},
			};
			options.yAxis = {
				type: 'value',
				splitLine: {
					lineStyle: {
						type: 'dashed'
					}
				},
			};
			//series配置
			var configArr = [];
			//散点数据配置
			var scatterConfig = {};
			scatterConfig.name = typeof (chartJson.scatter) == 'undefined' ? '散点' : chartJson.scatter;
			scatterConfig.type = 'scatter';
			scatterConfig.label = {
				emphasis: {
					show: true,
					position: 'left',
					textStyle: {
						color: 'blue',
						fontSize: 16
					}
				}
			};
			scatterConfig.data = scatterdata;
	
			configArr.push(scatterConfig);
			var lineConfig = {};
			lineConfig.name = typeof (chartJson.line) == 'undefined' ? '直线' : chartJson.line;
			lineConfig.type = 'line';
			lineConfig.showSymbol = false;
			lineConfig.data = myRegression.points;
			lineConfig.markPoint = {
				itemStyle: {
					normal: {
						color: 'transparent'
					}
				},
				label: {
					normal: {
						show: true,
						position: 'left',
						formatter: myRegression.expression,
						textStyle: {
							color: '#333',
							fontSize: 14
						}
					}
				},
				data: [{ coord: myRegression.points[myRegression.points.length - 1] }]
			};
			configArr.push(lineConfig);
			options.series = configArr;
		}
	}
	//漏斗图
	function funnelCirque() {
		options.tooltip = {
			trigger: 'item',
		},
			options.calculable = true;
		var seriesJson = {
			type: 'funnel',
			data: [],
		};
		var legendData = [];
		if ($.isArray(chartJson.seriesArray)) {
			seriesJson.data = chartJson.seriesArray;
			seriesJson.tooltip = {};
			options.legend = { data: xAxisName };
		} else {
			for (var nIndex = 0; nIndex < dataSource.length; nIndex++) {
				dataSource[nIndex].name = dataSource[nIndex][chartJson.xAxisField];
				dataSource[nIndex].value = dataSource[nIndex][chartJson.yAxisField];
				//legendData.push(dataSource[nIndex][chartJson.xAxisField]);
			}
			seriesJson.tooltip = {
				formatter: function (params, ticket, callback) {
					var html = '';
					if ($.isArray(chartJson.seriesTooltip)) {
						html += '<div class="tooltip-content">'
							+ '<div class="tooltip-title">' + params.data[chartJson.xAxisField] + '</div>'
							+ '<div class="tooltip-detail">'
						for (var tooltipI = 0; tooltipI < chartJson.seriesTooltip.length; tooltipI++) {
							html += '<div class="tooltip-detail-content">'
								+ '<div class="tooltip-name">' + chartJson.seriesTooltip[tooltipI].name + ':</div>'
								+ '<div class="tooltip-value">' + params.data[chartJson.seriesTooltip[tooltipI].value] + '</div>'
								+ '</div>';
						}
						html += '</div></div>';
					} else {
						html = '<div class="tooltip-content">'
							+ '<div class="tooltip-title">' + params.data[chartJson.yAxisField] + '</div>'
							+ '</div>';
					}
					return html;
				}
			}
			options.tooltip.formatter = "{a} <br/>{b} : {c}%";
			seriesJson.data = dataSource;
		}
		seriesArr.push(seriesJson);
		options.series = seriesArr;
		//options.legend.data = legendData;
	}
	//显示饼图和环形图
	function pieOrCirque() {
		var seriesJson = {};
		var showName = [];
		seriesJson.data = [];
		if ($.isArray(chartJson.seriesArray)) {
			seriesJson.data = chartJson.seriesArray;
		} else {
			for (var nIndex = 0; nIndex < dataSource.length; nIndex++) {
				var dataname = dataSource[nIndex][xAxisField];
				var datavalue = dataSource[nIndex][yAxisField];
				if (dataSource[nIndex].name) {
					dataname = dataSource[nIndex].name;
					datavalue = dataSource[nIndex].value;
				}
				var keyValue = {
					value: datavalue,
					name: dataname
				};
				showName.push(dataname);
				seriesJson.data.push(keyValue);
			}
		}
		options.legend = {
			orient: 'vertical',
			x: 'left',
			data: showName
		};
		if (typeof (options.title) == 'object') {
			options.title.x = 'center';
		}
		if (typeof (prefixName) == 'string') {
			seriesJson.name = prefixName;
		}
		seriesJson.type = 'pie';
		if (chartJson.type == 'pie') {
			seriesJson.radius = '65%';
			seriesJson.itemStyle = {
				emphasis: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: 'rgba(0,0,0,0.5)'
				}
			}
		} else if (chartJson.type == 'ring') {
			/*if(debugerMode){
				if(radius[0] >=radius[1]){
					console.error('图形内径比例应小于外径比例!');
				}
			}*/
			seriesJson.radius = ['50%', '70%'];
			seriesJson.avoidLabelOverlap = false;
			seriesJson.label = {
				normal: {
					show: false,
					position: 'center'  //outside  外部显示
				},
				emphasis: {
					show: true,
					textStyle: {
						fontSize: '20',
						fontWeight: 'bold'
					}
				}
			},
				seriesJson.labelLine = {
					normal: {
						show: false
					}
				}
		}
		seriesArr.push(seriesJson);
		options.series = seriesArr;
	}
	//显示柱状图或线形图
	function lineOrbarChart() {
		if (showPosition == 'Y') {
			if ($.isArray(xAxisField)) {
				//x轴字段是个数组
				for (var xIndex = 0; xIndex < xAxisField.length; xIndex++) {
					var seriesJson = {};
					if ($.isArray(xAxisName)) {
						seriesJson.name = xAxisName[xIndex];			//标题
					}
					if ($.isArray(chartJson.xAxisStock)) {
						var xAxisStock = chartJson.xAxisStock;
						seriesJson.stack = xAxisStock[xIndex];
					}
					seriesJson.type = chartJson.type;					//bar or line
					seriesJson.label = {
						normal: {
							show: true,
							position: 'insideRight'
						}
					};
					seriesJson.data = [];
					for (var axisI = 0; axisI < dataSource.length; axisI++) {
						seriesJson.data.push(dataSource[axisI][xAxisField[xIndex]]);
					}
					seriesArr.push(seriesJson);
				}
			} else {
				var seriesJson = {
					name: typeof (chartJson.title) == 'string' ? chartJson.title : '',
					type: chartJson.type,
					data: xAxisArr
				}
				seriesArr.push(seriesJson);
			}
			options.xAxis = [
				{
					type: 'value'
				}
			],
			options.yAxis = [
				{
					type: 'category',
					data: yAxisArr
				}
			],
			options.series = seriesArr;
		} else {
			if ($.isArray(chartJson.seriesArray)) {
				options.legend = {
					data: chartJson.yAxisName
				}
				options.series = chartJson.seriesArray;
			} else {
				if (typeof (yAxisField) == 'string') {
					var seriesJson = {
						name: typeof (chartJson.title) == 'string' ? chartJson.title : '',
						type: chartJson.type,
						data: yAxisArr,
					}
					if (isFlagMark) {
						seriesJson.markLine = {
							data: markLineArr
						}
					}
					seriesArr.push(seriesJson);
					options.series = seriesArr;
				} else if ($.isArray(yAxisField)) {
					options.legend = {
						data: yAxisName
					}
					for (var yIndex = 0; yIndex < yAxisField.length; yIndex++) {
						var seriesJson = {};
						if ($.isArray(yAxisName)) {
							seriesJson.name = yAxisName[yIndex];			//标题
						}
						seriesJson.type = chartJson.type;				//bar or line
						if ($.isArray(chartJson.yAxisStock)) {
							var yAxisStock = chartJson.yAxisStock;
							seriesJson.stack = yAxisStock[yIndex];
						}
						seriesJson.label = {
							normal: {
								show: true,
								position: 'insideRight'
							}
						};
						var markPointData = [];
						if (isShowMax) {
							var maxJson = { type: 'max', name: '最大值' };
							markPointData.push(maxJson);

							seriesJson.markLine = {
								data: [
									//{type: 'average', name: '平均值'},
									[
										{
											symbol: 'none',
											x: '90%',
											yAxis: 'max'
										}, {
											symbol: 'circle',
											label: {
												normal: {
													position: 'start',
													formatter: '最大值'
												}
											},
											type: 'max',
											name: '最高点'
										}
									]
								]
							};
						}
						if (isShowAverage) {
							var averageJson = { type: 'average', name: '平均值' };
							markPointData.push(averageJson);
						}
						if (isShowMin) {
							var minJson = { type: 'min', name: '最小值' };
							markPointData.push(minJson);
						}
						if (markPointData.length > 0) {
							seriesJson.markPoint = {
								data: markPointData
							};
						}
						if (isFlagMark) {
							seriesJson.markLine = {
								data: markLineArr
							}
						}
						seriesJson.data = [];
						for (var axisI = 0; axisI < dataSource.length; axisI++) {
							seriesJson.data.push(dataSource[axisI][yAxisField[yIndex]]);
						}
						seriesArr.push(seriesJson);
					}
					options.series = seriesArr;
				}
			}
			//走默认的显示
			options.xAxis = {
				data: xAxisArr
			}
			//x轴标签有角度显示
			if (isXRotate) {
				options.xAxis.axisLabel = {
					show: true,
					rotate: -70
				}
			}
			options.yAxis = { type: 'value' };
			if(typeof(chartJson.yAxisMin)=='number'){
				options.yAxis.min = chartJson.yAxisMin;
			}
			options.tooltip = {
				trigger: 'axis'
			}
		}
		if(chartJson.yAxisMin){
			options.yAxis.min = chartJson.yAxisMin;
		}
		if(chartJson.yAxisMax){
			options.yAxis.max = chartJson.yAxisMax;
		}
	}

	// 使用刚指定的配置项和数据显示图表。
	if (chartJson.type == 'map') {
		var area = chartJson.area;
		if (area) {
			var chinaJson = echarts.getMap(area).geoJson;
			var data = [];
			for (var i = 0; i < chinaJson.features.length; i++) {
				data.push({
					name: chinaJson.features[i].properties.name,
					value: (function randomData() {
						return Math.round(Math.random() * 1000);
					})()
				});
			}
			options = {
				title: chartJson.title,
				tooltip: {
					trigger: 'item'
				},
				roam: chartJson.roam,//是否开启鼠标缩放和平移漫游  //开启缩放scale  //开启平移move
				visualMap: {
					min: 10,
					max: 1000,
					text: ['High', 'Low'],
					realtime: false,
					calculable: true,
					inRange: {
						color: ['lightskyblue', 'yellow', 'orangered']
					}
				},
				series: [
					{
						name: '地区',
						type: 'map',
						map: area, // 自定义扩展图表类型
						label: {
							normal: {
								show: true,
								position: 'inside',
								backgroundColor: '#fff',
								color: '#777',
								padding: [4, 5],
								borderRadius: 3,
								borderWidth: 1,
								borderColor: 'rgba(0,0,0,0.5)',
								formatter: function (params) {
									return params.name + '：' + params.value;
								}
							},
							emphasis: {
								show: true
							}
						},
						data: data
					}
				]
			};
		}
	} else if (chartJson.type == 'complexchart') {
		//多图表类型
		legendArray = chartJson.legendData;
		xAxisArray = legendArray;
		if ($.isArray(yAxisField)) {
			for (var yIndex = 0; yIndex < yAxisField.length; yIndex++) {
				var json = {
					name: chartJson.seriesName[yIndex],
					data: [],
					type: chartJson.magicType[0]
				}
				for (var chartI = 0; chartI < chartJson.data.length; chartI++) {
					json.data.push(chartJson.data[chartI][yAxisField[yIndex]]);
				}
				seriesArray.push(json);
			}
		} else {
			var data = [];
			for (var chartI = 0; chartI < chartJson.data.length; chartI++) {
				data.push(chartJson.data[chartI][yAxisField]);
			}
			seriesArray.push({ data: data, type: chartJson.magicType[0] });
		}
		var seriesArray = [];
		var xAxisArray = [];
		var legendArray = [];
		options = {
			title: chartJson.title,
			legend: { data: legendArray },
			xAxis: {
				type: "category",
				data: xAxisArray,
				axisLabel: {
					show: true,
					rotate: -25
				}
			},
			yAxis: { type: 'value' },
			toolbox: {
				show: true,
				feature: {
					saveAsImage: {},
					magicType: {
						type: chartJson.magicType
					}
				}
			},
			tooltip: {
				trigger: 'item',
			},
			isXRotate: true,
			series: seriesArray
		}
	}
	var isSplitLineShow = typeof (chartJson.isSplitLineShow) == 'boolean' ? chartJson.isSplitLineShow : false;
	if (chartJson.isSplitLineShow) {
		options.xAxis.boundaryGap = false;
		options.xAxis.splitLine = { show: true };
		options.xAxis.axisTick = { length: 1 };
	}
	chartDom.setOption(options);
	/*if(chartJson.type == 'funnel'){
		if($.isArray(chartJson.seriesTooltip)){
			var html = '<div class="funnel-total-content">';
			for(var tooltipI=0; tooltipI<chartJson.seriesTooltip.length; tooltipI++){
				var num = 0;
				for(var dataI=0; dataI<dataSource.length; dataI++){
					var toFloat = parseFloat(dataSource[dataI][chartJson.seriesTooltip[tooltipI].id]);
					num += toFloat;
				}
				html += '<div class="funnel-detail">'
							+'<div class="funnel-name">'+chartJson.seriesTooltip[tooltipI].name+'</div>'
							+'<div class="funnel-value">'+num+'</div>'
						+'</div>'; 
			}
			html += '</div>';
			$(chartDom['_dom']).after(html)
		}else{
			var num = 0;
			for(var dataI=0; dataI<dataSource.length; dataI++){
				var toFloat = parseFloat(dataSource[dataI][chartJson.yAxisField]);
				num += toFloat;
			}
			var html = '<div class="funnel-total-content">'
							+'<div class="funnel-detail">总计：</div>'
							+'<div class="funnel-detail">'+num+'</div>'
						+'</div>';
		}
	}*/
	if ($.isArray(chartJson.countField)) {
		var html = '<div class="funnel-total-content">';
		for (var countI = 0; countI < chartJson.countField.length; countI++) {
			html += '<div class="funnel-detail">'
				+ '<div class="funnel-name">' + chartJson.countField[countI].name + '</div>'
				+ '<div class="funnel-value">' + chartJson.countField[countI].value + '</div>'
				+ '</div>';
		}
		html += '</div>';
		$(chartDom['_dom']).after(html)
	}
	if (typeof (chartJson.changeHandler) == 'function') {
		chartDom.on('click', function (data) {
			var config = { data: data, options: options, chart: chartDom }
			chartJson.changeHandler(config);

			//options.series[0].map = data.name;
			//chartDom.setOption(options, true);
		});
	}
}
var nsChartUI = {};//定义图表
nsChartUI.init = nsUI.chart;
//初始化列表数组
nsChartUI.initCharts = function (config, panelId) {
	var chartJsonArr = config.value.charts;
	var chartId = 'echart-' + panelId;
	var title = typeof (config.value.title) == 'string' ? config.value.title : '';
	var titleHtml = '';
	if (title != '') {
		titleHtml = '<div class="ns-table-panel-header">'
			+ '<h4 class="ns-table-panel-title">'
			+ '<i class="fa fa-line-chart"></i>'
			+ title
			+ '</h4>'
			+ '</div>'
	}
	var echartHtml = titleHtml
		+ '<div class="nstable-panel-body">'
		+ '<div id="' + chartId + '" class="chart" style="width:100%;height:325px;"></div>'
		+ '</div>'
	var $echar = $("#" + panelId);
	$echar.html(echartHtml);
	if ($.isArray(chartJsonArr)) {
		var btnHtml = '<div class="nstable-panel-footer">'
			+ '<div id="echartbutton" class="nav-form button"></div>'
			+ '</div>'
		$('#' + chartId).parent().after(btnHtml);
		var navConfig = {};
		navConfig.id = 'echartbutton';
		navConfig.isShowTitle = false;
		var btns = [];
		for (var bI = 0; bI < chartJsonArr.length; bI++) {
			if (chartJsonArr[bI].isdefault) {
				var $chartDom = echarts.init($('#' + chartId)[0]);
				nsChartUI.init(chartJsonArr[bI].config, $chartDom);
			}
			var btn = [];
			var btnObj = {
				text: chartJsonArr[bI].text,
				parameter: bI,
				isReturn: true,
				handler: function (ev) {
					var bt = ev.currentTarget;
					var fid = parseInt($(bt).attr('fid'));
					echartsFun(fid, $chartDom);
				}
			}
			btn.push(btnObj);
			btns.push(btn);
		}
		navConfig.btns = btns;
		nsNav.init(navConfig);
		function echartsFun(fid, $chartDom) {
			var navconfigObj = chartJsonArr[fid].config;
			nsChartUI.init(navconfigObj, $chartDom);
		}
	} else {
		var navconfigObj = chartJsonArr[0].config;
		nsChartUI.init(navconfigObj, $chartDom);
	}
}
/*nsChartUI.init = function(chartJson,chartDom){
	var dataSource = chartJson.data;
	var xAxisArr = [];
	var yAxisField = chartJson.yAxisField;
	var yAxisName = chartJson.yAxisName;
	var yAxisArr = [];
	for(var axisI = 0; axisI < dataSource.length; axisI ++){
		xAxisArr.push(dataSource[axisI][chartJson.xAxisField]);
	}
	if(typeof(yAxisField) == 'object'){
		for(var yAxisI = 0; yAxisI < yAxisField.length; yAxisI ++){
			var yAxisJson = {};
			yAxisJson.name = yAxisName[yAxisI];
			yAxisJson.type = chartJson.type;
			if(typeof(chartJson.yAxisStock) == 'object'){
				var yAxisStock = chartJson.yAxisStock;
				yAxisJson.stack = yAxisStock[yAxisI];
			}
			if(chartJson.yAxisWidth){
				yAxisJson.barWidth = Number(chartJson.yAxisWidth);
			}
			yAxisJson.label = {
                normal: {
                    show: true,
                    position: 'insideRight'
                }
            };
			yAxisJson.data = [];
			for(var axisI = 0; axisI < dataSource.length; axisI ++){
				yAxisJson.data.push(dataSource[axisI][yAxisField[yAxisI]]);
			}
			yAxisArr.push(yAxisJson);
		}
	}
	var options = {
		title: {
			text: chartJson.title,
			//textAlign:'center',
			//textBaseline:'middle'
		},
		tooltip: {},
		toolbox:{
			show: true,
			feature:{
				saveAsImage: {}
			}
		},
		legend: {
			data:yAxisName,
		},
		xAxis: {
			data: xAxisArr
		},
		yAxis: {

		},
		series: yAxisArr
	}
	// 使用刚指定的配置项和数据显示图表。
	chartDom.setOption(options);
}*/