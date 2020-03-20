/********************简单统计模板 start***********************/
//图表的默认配置
nsTemplate.templates.simpleStats.defaultEChartOptions = {
    bar: {
        tooltip: {
            trigger: 'item',
            formatter: '{b} : {c}'
        },
        xAxis: [
            {
                type: 'category',
                data: [],
                boundaryGap: true,
                nameGap: 20,
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    interval: 0,
                    rotate: 30
                }
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        legend: {
            data: [],
            type: 'scroll',
            orient: 'vertical',
            right: 100,
            top: 20,
            bottom: 20
        },
        series : []
    },
    barColor: {
        tooltip: {
            trigger: 'item',
            formatter: '{a} : {c}'
        },
        grid: [{
            right: 300
        }],
        xAxis: [
            {
                type: 'category',
                data: ['数据']
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        legend: {
            data: [],
            type: 'scroll',
            orient: 'vertical',
            right: 100,
            top: 20,
            bottom: 20
        },
        series : []
    },
    line: {
        tooltip: {
            trigger: 'axis',
            formatter: '{b} : {c}'
        },
        xAxis: [
            {
                type: 'category',
                data: [],
                boundaryGap: true,
                nameGap: 20,
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    interval: 0,
                    rotate: 30
                }
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series : [
            {
                type: 'line',
                smooth: true,
                data: []
            }
        ]
    },
    pie: {
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {c} ({d}%)"
        },
        legend: {
            data: [],
            type: 'scroll',
            orient: 'vertical',
            right: 100,
            top: 20,
            bottom: 20
        },
        series : [
            {
                type: 'pie',
                radius: '55%',
                center: ['40%', '50%'],
                animationType: 'scale',
                animationEasing: 'elasticOut',
                animationDelay: 500,
                data: []
            }
        ]
    },
    map: {
        tooltip: {
            trigger: 'item'
        },
        visualMap: {
            left: 'left',
            top: 'bottom',
            seriesIndex: [0],
            inRange: {
                color: ['#e0ffff', '#006edd']
            },
            calculable: true
        },
        series : [
            {
                type: 'map',
                //mapType: 'china', 需要引入地图数据才可以使用
                roam: true,
                label: {
                    normal: {
                        show: true,
                        formatter: function(params){
                            var value = '-';
                            if(params.value){
                                value = params.value;
                            }
                            return params.name + ":" + value;
                        },
                        position: 'inside',
                        backgroundColor: '#fff',
                        padding: [4, 5],
                        borderRadius: 3,
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.5)',
                        color: '#777'
                    },
                    emphasis: {
                        show: true
                    }
                },
                tooltip: {
                    formatter: function(params){
                        var value = '-';
                        if(params.value){
                            value = params.value;
                        }
                        return params.name + ":" + value;
                    }
                },
                data: []
            }
        ]
    }
}
nsTemplate.templates.simpleStats.init = function(config){
	//记录config
	nsTemplate.templates.simpleStats.data[config.id] = $.extend(true, {}, config);
	//设置默认值
	config = nsTemplate.templates.searchPage.setDefault(config);
	//生成html
	function getHtml(){
		var navHtml = '';
		var formHtml = '';
		var chartHtml = '';
		var tableHtml = '<panel ns-id="'+config.tableId+'" ns-options="col:12" ns-config="table:'+config.tableJson+'"></panel>';
        navHtml = '<nav ns-id="' + config.navId + '" ns-config="' + config.navJson + '" ns-options="templates:simpleStats"></nav>';
		if(!$.isEmptyObject(config.form)){
			formHtml = '<panel ns-id="'+config.formId+'" ns-options="col:12" ns-config="form:'+config.formJson+'"></panel>';
		}
		if($.isArray(config.charts)){
			for(var chartI=0; chartI<config.charts.length; chartI++){
				var chartStr = 'charts'+chartI;
				var columnNumber = typeof(config.charts[chartI].column)=='number' ? config.charts[chartI].column : 12;
				var height = typeof(config.charts[chartI].height)=='number' ? config.charts[chartI].height : 400;
                config.charts[chartI].height = height;
				chartHtml += '<panel ns-id="'+chartStr+'" ns-options="col:'+columnNumber+',height:' + height + 'px;margin:0"></panel>';
			}
		}
		var optionsStr = 'templates:simpleStats';
		if(config.isShowHistoryBtn){optionsStr+=',isShowHistoryBtn:true'}else{optionsStr+=',isShowHistoryBtn:false'}
		return '<layout id="'+config.id+'" ns-package="'+config.package+'" ns-options="'+optionsStr+'">'
					+navHtml + formHtml + chartHtml + tableHtml
				+'</layout>';
	}
	var html = getHtml();
	//围加根html
	html = nsTemplate.aroundRootHtml(html);
	//将html添加到页面
	nsTemplate.appendHtml(html);
	//创建模板Json对象
	createJson();
	nsLayout.init(config.id);
	if(config.isTableHidden){
		$('#table-'+config.id+'-'+config.tableId).css({'display':'none'});
	}
    config.searchData = nsForm.getFormJSON(config.id+'-form',false);//获取搜索数据
	var echartArray = [];
	if($.isArray(config.charts)){
		for(var chartI=0; chartI<config.charts.length; chartI++){
			var chartStr = 'charts'+chartI;
			var titleHtml = '';
			var chart = config.charts[chartI];
			if(chart.title){
				titleHtml = '<div class="ns-table-panel-header">'
							+'<h4 class="ns-table-panel-title">'
							+'<i class="fa fa-line-chart"></i>'
							+chart.title
							+'</h4>'
							+'</div>';
			}
			var chartId = 'echart-'+config.id+'-'+chartStr;
			//36 - panel 中的 title 高度为 height18+padding9*2 = 36
            //10 - panel 本身 padding-bottom = 10
			var height = chart.height - 36 - 10;
			var echartHtml  =	titleHtml
							+'<div class="nstable-panel-body">'
							+	'<div id="'+chartId+'" class="chart" style="width:100%;height:' + height + 'px;"></div>'
							+'</div>'
			var $echart = $("#"+config.id+'-'+chartStr);		
			$echart.html(echartHtml);
			var $chartDom = echarts.init($('#'+chartId)[0]);
			//将 $chartDom 绑定到 chart 上，方便后续使用
			chart.$dom = $chartDom;
			//下面 init 需要 data 数组
            chart.data = [];
			nsChartUI.init(chart, $chartDom);

			//执行特殊的初始化操作 - liuzh
            var defOption = nsTemplate.templates.simpleStats.defaultEChartOptions[chart.type];
            if(typeof(chart.beforeInit) == 'function'){
                //通过 this 可以访问全部属性
                chart.beforeInit();
            }
            //合并默认配置和用户的配置，用户配置优先级更高
            chart.customOption = $.extend(true, {}, defOption, chart.option);
            chart.$dom.setOption(chart.customOption, true);
            if(typeof(chart.afterInit) == 'function'){
                //通过 this 可以访问全部属性
                chart.afterInit();
            }
            //只以属性方式提供 onclick 的功能，其他的事件可以在 afterInit 中绑定
            //事件可以查看：http://echrts.baidu.com/api.html#events
            if(typeof(chart.clickEvent) == 'function'){
                chart.$dom.on('click', function(params){
                    this.clickEvent(params);
                }, chart);
            }
		}
	}
	function createJson(){
		var obj = eval(config.package + '={}');
        obj[config.navJson] = {
            id: config.navId,
            title: config.title,
            isShowTitle: typeof(config.isShowTitle)=='boolean' ? config.isShowTitle : false,
            btns: []
        };
		if(!$.isEmptyObject(config.nav)){
            obj[config.navJson].btns = [config.nav.field];
		}
        var formParamsObject = {};
		if(!$.isEmptyObject(config.form)){
            var columns = config.form.field;
			for(var i=0; i<columns.length; i++){
                columns[i].commonChangeHandler = commonChangeFormHandler;
                if(typeof(columns[i].value) != "undefined" && columns[i].value != ''){
                    formParamsObject[columns[i].id] = columns[i].value;
                }
			}
			nsTemplate.setFieldHide('form', config.form.field, config.form.hide);
			obj[config.formJson] = {
				isUserControl:typeof(config.form.isUserControl)=='boolean' ? config.form.isUserControl : false,//是否开启用户自定义配置
				isUserContidion:typeof(config.form.isUserContidion)=='boolean' ? config.form.isUserContidion : false,//是否查看筛选条件
				form:config.form.field
			};
			//form表单公用返回事件
			function commonChangeFormHandler(runObj){
				nsTemplate.runObjHandler(config.form.changeHandler,'before',[runObj]);
				nsTemplate.runObjHandler(config.form.changeHandler,'change',[runObj]);
                if(config.isAutoReloadTable){
                    var id = runObj.config.id;
                    config.searchData[id] = runObj.value;
                    nsTemplate.templates.simpleStats.refresh(config);
                }
				nsTemplate.runObjHandler(config.form.changeHandler,'after',[runObj]);
			}
		}
		/******************table start *****************************************************************************/
		nsTemplate.setFieldHide('table',config.table.field,config.table.hide);
		var columnBtnHandlers;
		if($.isArray(config.table.tableRowBtns)){
			var columnBtnArr =  nsTemplate.runObjColumnBtnHandler(config.table.tableRowBtns,columnBtnHandler);
			var columnBtns = columnBtnArr[0];
			columnBtnHandlers = columnBtnArr[1];
			if(columnBtns.length > 0){
				var btnWidth = columnBtns.length * 30 + 10;
				var customerBtnJson = {
					title: '操作',
					width:btnWidth,
					tabPosition:'after',
					formatHandler: {
						type: 'button',
						data: {
							subdata:columnBtns
						}
					}
				};
				if(typeof(config.table.dataReturnbtns)=='function'){
					customerBtnJson.formatHandler.data.dataReturn = config.table.dataReturnbtns;
				}
				tableColumns.push(customerBtnJson);
			}
		}
		var tableBtns = [];
		var origalTableBtns;
		if($.isArray(config.table.btns)){
			var tableBtnArr = config.table.btns;
			var btnGroupArr = nsTemplate.runObjBtnHandler(tableBtnArr,commonTableBtnHandler,commonTableDropBtnHandler);
			tableBtns = btnGroupArr[0];
			origalTableBtns = btnGroupArr[1];
		}
        var tableParamsObject =  $.extend(true,config.table.ajax.data,formParamsObject);
		obj[config.tableJson] = {
			columns: config.table.field,
			data: {
				src: config.table.ajax.src,
				type: config.table.ajax.type, //GET POST
				dataSrc: config.table.ajax.dataSrc,
				data: tableParamsObject, //参数对象{id:1,page:100}
				isServerMode: typeof(config.table.ajax.isServerMode)=='boolean'?config.table.ajax.isServerMode:false, //是否开启服务器模式
				isSearch: typeof(config.table.ajax.isSearch)=='boolean'?config.table.ajax.isSearch:true, //是否开启搜索功能
				isPage: typeof(config.table.ajax.isPage)=='boolean'?config.table.ajax.isPage:true, //是否开启分页
				isLengthChange:typeof(config.table.ajax.isLengthChange)=='boolean'?config.table.ajax.isLengthChange:false, //是否开启分页
				info:typeof(config.table.ajax.info)=='boolean'?config.table.ajax.info:false,
			},
			btns:{
				title:config.table.title,
				selfBtn:tableBtns
			},
			ui:{
				onLoadFilter:tableLoadHandler,
				isUseTabs:true,
			}
		};
		if(typeof(config.table.ui)=='object'){
			if(!$.isEmptyObject(config.table.ui)){
				for(var ui in config.table.ui){
					obj[config.tableJson].ui[ui] = config.table.ui[ui];
				}
			}
		}
		//table表格自定义列配置
		function columnHandler(tableID){
			nsUI.tablecolumn.init(tableID)
		}
		//自定义列按钮事件
		function columnBtnHandler(data){
			var runHandler = columnBtnHandlers[data.buttonIndex];
			if(typeof(runHandler)=='object'){
				if(typeof(runHandler.beforeHandler)=='function'){
					nsTemplate.runObjHandler(runHandler, 'beforeHandler', [data]);
				}
				if(!$.isEmptyObject(runHandler.btn)){
					if(typeof(runHandler.btn)){}
					nsTemplate.runObjHandler(runHandler.btn,'handler',[data]);
				}
				if(typeof(runHandler.afterHandler)=='function'){
					nsTemplate.runObjHandler(runHandler, 'afterHandler', [data]);
				}
				if(typeof(runHandler.handler)=='function'){
					nsTemplate.runObjHandler(runHandler, 'handler', [data]);
				}
			}
		}
		//table表格普通按钮事件
		function commonTableBtnHandler(data){
			var runHandler = origalTableBtns[data.nsIndex].handler;
			if(typeof(runHandler)=='object'){
				if(typeof(runHandler.before)=='function'){
					nsTemplate.runObjHandler(runHandler, 'before', [data]);
				}
				if(typeof(runHandler.after)=='function'){
					nsTemplate.runObjHandler(runHandler, 'after', [data]);
				}
				if(typeof(runHandler.btn)=='function'){
					nsTemplate.runObjHandler(runHandler,'handler',[data]);
				}
			}
			if(typeof(runHandler)=='function'){
				nsTemplate.runObjHandler(origalTableBtns[data.nsIndex],'handler',[data]);
			}
		}
		//table表格一级下拉按钮事件
		function commonTableDropBtnHandler(data){
			var runHandler = origalTableBtns[data.nsIndex][data.nsSubIndex].handler;
			if(typeof(runHandler)=='object'){
				if(typeof(runHandler.before)=='function'){
					nsTemplate.runObjHandler(runHandler, 'before', [data]);
				}
				if(typeof(runHandler.btn)=='function'){
					nsTemplate.runObjHandler(runHandler,'handler',[data]);
				}
				if(typeof(runHandler.after)=='function'){
					nsTemplate.runObjHandler(runHandler, 'after', [data]);
				}
			}
			if(typeof(runHandler)=='function'){
				nsTemplate.runObjHandler(origalTableBtns[data.nsIndex][data.nsSubIndex],'handler',[data]);
			}
		}
		function tableLoadHandler(data){
            var charts = config.charts;
		    setTimeout(function(){
                $.each(charts, function(index, chart){
                    if(chart && chart.$dom && typeof(chart.update) == 'function'){
                        //深度克隆，保证原值不会被修改
                        chart.update(chart.$dom, data, $.extend(true, {}, chart.customOption));
                    }
                });
            }, 0);
		}
		/******************table end *****************************************************************************/
	}
}
//刷新
nsTemplate.templates.simpleStats.refresh = function(config){
    var tableId = 'table-'+config.id+'-table';
    var formId = config.id + '-form';
    var jsonData = nsForm.getFormJSON(formId);
    if(typeof(config.beforeSubmitHandler)=='function'){
        jsonData = config.beforeSubmitHandler(jsonData);
        if(jsonData === false){return;}
    }
    for(key in jsonData){
        if(jsonData[key] == ''){
            delete jsonData[key];
        }
    }
    baseDataTable.reloadTableAJAX(tableId,jsonData);
}
/********************简单统计模板 end***********************/