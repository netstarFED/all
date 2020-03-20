/*
 * 自定义模板表格
 */
nsUI.customertable = {};
nsUI.customertable.init = function (configObj) {
	var originalConfig = $.extend(true, {}, configObj); //存放原始值
	var config = configObj;
	var isValid = false;
	nsUI.customertable[config.id] = {};
	nsUI.customertable[config.id].config = config;
	$container = $('#' + config.id);
	config.echartObject = {
		mode: '', //当前图表展现模式 single tab column
		dom: [], //chart实例化元素
	};
	config.rowClassObj = {};
	config.rowDataObj = {};
	config.tableRowBtns = {};
	var displayBtnsArray = [];
	if ($.isArray(config.btns)) {
		for (var i = 0; i < config.btns.length; i++) {
			displayBtnsArray.push(true); //默认所有的按钮都显示
			config.tableRowBtns[i] = config.btns[i];
		}
	} else {
		config.btns = [];
	}
	//格式验证
	if (debugerMode) {
		if (!formatValidate()) {
			return false;
		}
	}

	function formatValidate() {
		var isValid = true;
		/***********验证config配置第一层 start*********************/
		var validArr = [
			['format', 'object', true],
			['chart', 'array'],
		]
		isValid = nsDebuger.validOptions(validArr, config);
		if (isValid == false) {
			return false;
		}
		/*********验证config配置第一层 end***********************/
		/*********验证config.format配置 start***********************/
		var validFormatArr = [
			['handler', 'function'],
			['fields', 'object', true],
			['totalType', 'string'],
			['dataType', 'string', true],
			['charts', 'object']
		]
		isValid = nsDebuger.validOptions(validFormatArr, config.format);
		if (isValid == false) {
			return false;
		}
		/*********验证config.format配置 start***********************/
		/*********验证config.ajax配置 start***********************/
		if (config.ajax) {
			var validAjaxArr = [
				['src', 'string', true],
				['type', 'string', true],
			]
			isValid = nsDebuger.validOptions(validAjaxArr, config.ajax);
		}
		if (isValid == false) {
			return false;
		}
		/*********验证config.ajax配置 start***********************/
		/*********验证config.format.fields配置 start***********************/
		var validFormatFieldArr = [
			['rootField', 'string'],
			['levelField', 'array', true],
			['describute', 'array', true],
			['totalField', 'object']
		]
		isValid = nsDebuger.validOptions(validFormatFieldArr, config.format.fields);
		if (isValid == false) {
			return false;
		}
		/*********验证config.format.fields配置  end***********************/
		return isValid;
	}
	if (config.ajax) {
		$.ajax({
			url: config.ajax.src, //请求的数据链接
			type: config.ajax.type,
			data: config.ajax.data,
			dataType: 'json',
			success: function (data) {
				if (config.fieldConfig) {
					var fieldConfig = config.fieldConfig;
					var rows = data.rows;
					if (typeof (rows) == 'undefined') {
						rows = data.data;
					}
					var rowField = fieldConfig.rowField;
					var columnField = fieldConfig.columnField;
					var twoDimensionalArray = [];
					var nameListArray = [];
					for (var rowI = 0; rowI < rows.length; rowI++) {
						var rowData = rows[rowI];
						var tempJson = $.extend(true, {}, rowData);

						function isExistTwoDimensionalArrayByRowField(_rowData) {
							var isContinue = false;
							if (nameListArray.length == 0) {
								nameListArray.push(_rowData[fieldConfig.levelFirst]);
							} else {
								if (nameListArray.indexOf(_rowData[fieldConfig.levelFirst]) == -1) {
									nameListArray.push(_rowData[fieldConfig.levelFirst]);
								}
							}
							if (twoDimensionalArray.length == 0) {
								isContinue = true;
							} else {
								var isExistIndex = -1;
								for (var arrI = 0; arrI < twoDimensionalArray.length; arrI++) {
									var arrData = twoDimensionalArray[arrI];
									if (arrData[rowField] == _rowData[rowField]) {
										isContinue = false;
										isExistIndex = arrI;
										break;
									}
								}
								if (isExistIndex == -1) {
									isContinue = true;
								} else {
									var columnData = {};
									columnData[fieldConfig.levelFirst] = _rowData[fieldConfig.levelFirst];
									for (var columnI = 0; columnI < columnField.length; columnI++) {
										columnData[columnField[columnI]] = _rowData[columnField[columnI]];
									}
									twoDimensionalArray[isExistIndex].columns.push(columnData);
								}
							}
							return isContinue;
						}
						var isExistData = isExistTwoDimensionalArrayByRowField(tempJson);
						if (isExistData) {
							tempJson.columns = [];
							var columnJson = {};
							columnJson[fieldConfig.levelFirst] = rowData[fieldConfig.levelFirst];
							for (var columnI = 0; columnI < columnField.length; columnI++) {
								columnJson[columnField[columnI]] = rowData[columnField[columnI]];
							}
							tempJson.columns.push(columnJson);
							twoDimensionalArray.push(tempJson);
						}
					}
					config.format.fields.levelField = ['rows', 'columns'];
					config.format.fields.titleField = 'nameList';
					delete config.format.fields.rootField;
					var objectData = {
						rows: twoDimensionalArray,
						nameList: nameListArray
					};
					formatTableData(objectData);
				} else {
					formatTableData(data);
				}
			},
			error: function (error) {
				nsalert(language.common.nscomponent.part.selectajaxError, 'error');
				if (debugerMode) {
					console.log(error);
				}
			}
		})
	} else {
		formatTableData(config.data);
	}
	var tableDataObject = {}; //存放的是原始数据值
	var tableDataArray = []; //表格第一层数据
	//处理数据
	function formatTableData(dataArray) {
		var fields = config.format.fields; //fields字段
		tableDataObject = dataArray; //存放的是原始数据值
		var levelFieldArray = fields.levelField; //等级字段
		var titleArray = fields.titleField; //获取标题头数据
		var descributeArray = fields.describute; //字段描述
		var totalFieldObject = fields.totalField ? fields.totalField : {}; //合计字段
		var totalType = config.format.totalType; //合计展示方式
		var dataType = config.format.dataType; //展示的数据类型
		var totalColumnTbodyArray = []; //存放计算列table的合计值
		var totalRowTbodyArray = []; //存放机房行table的合计值
		var totalBothArray = []; //存放总显示的合计值
		var totalFieldArray = descributeArray[1]; //合计需要用到的字段属性
		tableDataArray = []; //表格第一层数据
		config.theadsData = titleArray; //表格标题
		config.rowsData = []; //表格数据
		var tbodyDataArray = [];
		var echartObject = typeof (config.format.charts) == 'object' ? config.format.charts : false; //是否有图表
		/***************处理获取到的数据 start***********************/
		if (typeof (config.format.handler) == 'function') {
			tableDataObject = config.format.handler(tableDataObject);
		}
		if (fields.rootField) {
			tableDataObject = tableDataObject[fields.rootField];
		}
		tableDataArray = tableDataObject[levelFieldArray[0]];
		/***************处理获取到的数据 start***********************/
		/****************标题行数据   start************/
		if (!$.isArray(titleArray)) {
			if (fields.titleField) {
				titleArray = $.merge([], tableDataObject[fields.titleField]);
			} else {
				titleArray = [];
				for (var descI = 0; descI < descributeArray.length; descI++) {
					for (var descSubI = 0; descSubI < descributeArray[descI].length; descSubI++) {
						titleArray.push(descributeArray[descI][descSubI].name);
					}
				}
				config.theadsData = [titleArray]; //表格标题
			}
		} else {
			var newTitleArray = [];
			for (var titleI = 0; titleI < titleArray.length; titleI++) {
				var titleData = titleArray[titleI];
				if (typeof (titleArray[titleI]) == 'object') {
					//重复
					for (var combineI = 0; combineI < titleData.length; combineI++) {
						newTitleArray.push(titleData.title);
					}
				} else {
					newTitleArray.push(titleData);
				}
			}
			titleArray = newTitleArray;
			config.theadsData = [titleArray]; //表格标题
			config.isRepeatTitle = true;
		}
		/****************标题行数据  end************/
		/**************计算总合计 start***********************/
		if (totalFieldObject.count) {
			var totalHtml = '';
			for (var descI = 0; descI < totalFieldArray.length; descI++) {
				totalHtml += '<div class="funnel-detail">' +
					'<div class="funnel-name">' + totalFieldArray[descI].name + '</div>' +
					'<div class="funnel-value">' + tableDataObject[totalFieldObject.count][totalFieldArray[descI].value] + '</div>' +
					'</div>';
			}
			totalHtml = '<div class="funnel-total-content customertable-echart-count" id="customertable-counttotal-' + config.id + '">' + totalHtml + '</div>';
			if ($('#customertable-counttotal-' + config.id).length > 0) {
				$('#customertable-counttotal-' + config.id).remove();
			}
			$container.prepend(totalHtml);
		}
		/**************计算总合计 end***********************/
		/***********当前是列合计还是行合计 start******************************/
		switch (totalType) {
			case 'column':
				totalColumnTbodyArray = totalColunData(tableDataObject[totalFieldObject.column]);
				totalColumnTbodyArray.splice(0, 0, '合计');
				columnTableData();
				break;
			case 'row':
				if (totalFieldObject.row) {
					totalRowTbodyArray = totalRowData(tableDataObject[totalFieldObject.row]);
				}
				rowTableData();
				break;
			case 'both':
				if (totalFieldObject.column) {
					totalColumnTbodyArray = totalColunData(tableDataObject[totalFieldObject.column]);
					totalColumnTbodyArray.splice(0, 0, '合计');
				}
				if (totalFieldObject.row) {
					totalRowTbodyArray = totalRowData(tableDataObject[totalFieldObject.row]);
					titleArray.push('合计');
				}
				bothTableData();
				break;
			default:
				bothTableData();
				break;
		}
		/***********当前是列合计还是行合计 end******************************/
		/***********合计 start******************************/
		function totalColunData(data) {
			//计算table合计
			var totalArray = [];
			for (var totalI = 0; totalI < data.length; totalI++) {
				for (var fieldI = 0; fieldI < totalFieldArray.length; fieldI++) {
					totalArray.push(data[totalI][totalFieldArray[fieldI].value]);
				}
			}
			return totalArray;
		}

		function totalRowData(data) {
			//计算table合计
			var totalArray = [];
			for (var totalI = 0; totalI < data.length; totalI++) {
				var rowTotalArray = [];
				for (var fieldI = 0; fieldI < totalFieldArray.length; fieldI++) {
					rowTotalArray.push(data[totalI][totalFieldArray[fieldI].value]);
				}
				totalArray.push(rowTotalArray);
			}
			return totalArray;
		}
		/**********合计 end******************************/

		/****************处理table表头 start****************************************/
		//处理两层表头
		function levelTwoTheadData() {
			//获取要合并的td标题
			var descributeNameArray = [];
			for (var descI = 0; descI < descributeArray.length; descI++) {
				var levelNameArray = [];
				for (var descSubI = 0; descSubI < descributeArray[descI].length; descSubI++) {
					levelNameArray.push(descributeArray[descI][descSubI].name);
				}
				descributeNameArray.push(levelNameArray);
			}
			var legendTheadArray = [];
			var levelSecondTitleNameArry = [];
			var isRepeatTitle = typeof (config.isRepeatTitle) == 'boolean' ? config.isRepeatTitle : false;
			var titleLength = isRepeatTitle ? 1 : titleArray.length;
			for (var titleI = 0; titleI < titleLength; titleI++) {
				for (var nIndex = 0; nIndex < totalFieldArray.length; nIndex++) {
					legendTheadArray.push(titleArray[titleI]);
					levelSecondTitleNameArry.push(totalFieldArray[nIndex].name);
				}
			}
			if (isRepeatTitle) {
				legendTheadArray = titleArray;
			}
			for (var titleI = descributeNameArray[0].length - 1; titleI >= 0; titleI--) {
				legendTheadArray.unshift(descributeNameArray[0][titleI]);
				levelSecondTitleNameArry.unshift(descributeNameArray[0][titleI]);
			}
			//levelSecondTitleNameArry.splice(0,0,descributeNameArray[0][0]);
			config.theadsData = [legendTheadArray, levelSecondTitleNameArry];
		}
		/****************处理table表头 end****************************************/
		//得到一层表头的tbody数据
		function getLevelTbodyData() {
			for (var rowI = 0; rowI < tableDataArray.length; rowI++) {
				var dataArray = [];
				for (var descI = 0; descI < descributeArray.length; descI++) {
					for (var subI = 0; subI < descributeArray[descI].length; subI++) {
						dataArray.push(tableDataArray[rowI][descributeArray[descI][subI].value]);
					}
				}
				tbodyDataArray.push(dataArray);
			}
			/*if(totalColumnTbodyArray.length > 0){
				tbodyDataArray.push(totalColumnTbodyArray);
			}*/
		}
		//得到一层表头的行tbody数据
		function getLevelRowTbodyData() {
			for (var rowI = 0; rowI < tableDataArray.length; rowI++) {
				var dataArray = [];
				for (var descI = 0; descI < descributeArray.length; descI++) {
					for (var subI = 0; subI < descributeArray[descI].length; subI++) {
						dataArray.push(tableDataArray[rowI][descributeArray[descI][subI].value]);
					}
				}
				tbodyDataArray.push(dataArray);
			}
		}
		//列两层获取数据
		function getColumnTwoLevelTbodyData() {
			for (var rowI = 0; rowI < tableDataArray.length; rowI++) {
				var dataArray = [];
				for (var descI = 0; descI < descributeArray[0].length; descI++) {
					if (descributeArray[0][descI].type == 'join') {
						//拼接
						var isFieldJoin = true;
						if (descributeArray[0][descI].countField) {
							if (tableDataArray[rowI][descributeArray[0][descI].countField]) {
								isFieldJoin = false;
								dataArray.push(tableDataArray[rowI][descributeArray[0][descI].countField]);
							}
						}
						if (isFieldJoin) {
							var valueArray = [];
							for (var fieldI = 0; fieldI < descributeArray[0][descI].field.length; fieldI++) {
								valueArray.push(tableDataArray[rowI][descributeArray[0][descI].field[fieldI]]);
							}
							dataArray.push(valueArray.join(descributeArray[0][descI].split));
						}
					} else {
						dataArray.push(tableDataArray[rowI][descributeArray[0][descI].value]);
					}
				}
				var keyField = levelFieldArray[1] ? levelFieldArray[1] : levelFieldArray[0];
				for (var colI = 0; colI < tableDataArray[rowI][keyField].length; colI++) {
					for (var descI = 0; descI < totalFieldArray.length; descI++) {
						dataArray.push(tableDataArray[rowI][keyField][colI][totalFieldArray[descI].value]);
					}
				}
				tbodyDataArray.push(dataArray);
			}
			tbodyDataArray.push(totalColumnTbodyArray);
		}
		//行两层表头的tbody数据
		function getRowLevelTwoTbodyData() {
			config.rowDataObj = {};
			config.rowClassObj = {};
			if (displayBtnsArray.length > 0) {
				config.theadsData[1].push(config.theadsData[0][config.theadsData[0].length - 1]);
			}
			for (var rowI = 0; rowI < tableDataArray.length; rowI++) {
				var dataArray = [];
				config.rowDataObj[rowI] = tableDataArray[rowI];
				if (levelFieldArray.length == 1) {
					for (var descI = 0; descI < descributeArray.length; descI++) {
						var descributeDataArray = descributeArray[descI];
						for (var levelI = 0; levelI < descributeDataArray.length; levelI++) {
							var levelData = descributeDataArray[levelI];
							if (levelData.type == 'join') {
								//拼接
								var isFieldJoin = true;
								if (levelData.countField) {
									if (tableDataArray[rowI][levelData.countField]) {
										isFieldJoin = false;
										dataArray.push(tableDataArray[rowI][levelData.countField]);
										if (typeof (tableDataArray[rowI].level) == 'number') {
											config.rowClassObj[rowI] = 'level-' + tableDataArray[rowI].level;
										} else {
											if (typeof (tableDataArray[rowI].id) == 'undefined') {
												config.rowClassObj[rowI] = 'level-1';
											}
										}
									}
								}
								if (isFieldJoin) {
									var valueArray = [];
									for (var fieldI = 0; fieldI < levelData.field.length; fieldI++) {
										valueArray.push(tableDataArray[rowI][levelData.field[fieldI]]);
									}
									dataArray.push(valueArray.join(levelData.split));
								}
							} else {
								var valueStr = tableDataArray[rowI][levelData.value] ? tableDataArray[rowI][levelData.value] : '';
								dataArray.push(valueStr);
							}
						}
					}
				} else {
					for (var descI = 0; descI < descributeArray[0].length; descI++) {
						if (descributeArray[0][descI].type == 'join') {
							//拼接
							var isFieldJoin = true;
							if (descributeArray[0][descI].countField) {
								if (tableDataArray[rowI][descributeArray[0][descI].countField]) {
									isFieldJoin = false;
									dataArray.push(tableDataArray[rowI][descributeArray[0][descI].countField]);
									if (typeof (tableDataArray[rowI].level) == 'number') {
										config.rowClassObj[rowI] = 'level-' + tableDataArray[rowI].level;
									} else {
										if (typeof (tableDataArray[rowI].id) == 'undefined') {
											config.rowClassObj[rowI] = 'level-1';
										}
									}
								}
							}
							if (isFieldJoin) {
								var valueArray = [];
								for (var fieldI = 0; fieldI < descributeArray[0][descI].field.length; fieldI++) {
									valueArray.push(tableDataArray[rowI][descributeArray[0][descI].field[fieldI]]);
								}
								dataArray.push(valueArray.join(descributeArray[0][descI].split));
							}
						} else {
							var valueStr = tableDataArray[rowI][descributeArray[0][descI].value] ? tableDataArray[rowI][descributeArray[0][descI].value] : '';
							dataArray.push(valueStr);
						}
					}
					var keyField = levelFieldArray[1];
					for (var colI = 0; colI < tableDataArray[rowI][keyField].length; colI++) {
						for (var descI = 0; descI < totalFieldArray.length; descI++) {
							dataArray.push(tableDataArray[rowI][keyField][colI][totalFieldArray[descI].value]);
						}
					}
				}
				if ($.isArray(totalRowTbodyArray[rowI])) {
					//合计
					for (var rowT = 0; rowT < totalRowTbodyArray[rowI].length; rowT++) {
						dataArray.push(totalRowTbodyArray[rowI][rowT]);
					}
				}
				if (typeof (config.rowBtnBeforeHandler) == 'function') {
					displayBtnsArray = config.rowBtnBeforeHandler(config.rowDataObj[rowI]);
				}
				if (displayBtnsArray.length > 0) {
					var btnsHtml = '';
					var btnsArray = $.extend(true, [], config.btns);
					for (var btnI = 0; btnI < btnsArray.length; btnI++) {
						if (displayBtnsArray[btnI]) {
							// 当前按钮支持显示
							btnsHtml += nsButton.getHtml(btnsArray[btnI], 'table', btnI);
						}
					}
					dataArray.push(btnsHtml);
				}
				tbodyDataArray.push(dataArray);
			}
		}
		//列表格数据
		function columnTableData() {
			switch (dataType) {
				case 'column':
					//一层
					getLevelTbodyData();
					break;
				case 'columnTwoLevel':
					//两层
					levelTwoTheadData();
					getColumnTwoLevelTbodyData();
					break;
			}
			config.rowsData = tbodyDataArray;
			initTableEchart(dataType);
		}

		function rowTableData() {
			switch (dataType) {
				case 'row':
					//titleArray[0].push('合计');
					getLevelRowTbodyData();
					break;
				case 'rowTowLevel':
				case 'rowTwoLevel':
					if (!$.isEmptyObject(totalFieldObject)) {
						titleArray.push('合计');
					}
					levelTwoTheadData();
					getRowLevelTwoTbodyData();
					break;
			}
			config.rowsData = tbodyDataArray;
			initTableEchart(dataType);
		}

		function bothTableData() {
			switch (dataType) {
				case 'row':
				case 'column':
				case 'both':
					getLevelTbodyData();
					break;
				case 'rowTowLevel':
				case 'rowTwoLevel':
				case 'columnTwoLevel':
				case 'bothTwoLevel':
					levelTwoTheadData();
					getRowLevelTwoTbodyData();
					break;
			}
			if (totalColumnTbodyArray.length > 0) {
				tbodyDataArray.push(totalColumnTbodyArray);
			}
			config.rowsData = tbodyDataArray;
			initTableEchart(dataType); //输出表格
		}

		function initTableEchart(type) {
			initTable(type); //输出表格
			if (echartObject) {
				initChart(type);
			}
		}
		//画图表
		function initChart(tableType) {
			var charts = echartObject;
			var chartId = 'customertable-echart-' + config.id;
			var echartHtml = '<div id="' + chartId + '" class="customertable-echart-table"></div>';
			if ($('#' + chartId).length > 0) {
				$('#' + chartId).remove();
			}
			$container.prepend(echartHtml);
			var $chart = $("#" + chartId);
			var yAxisFieldArray = [];
			var yAxisNameArray = [];
			for (var valueI = 0; valueI < totalFieldArray.length; valueI++) {
				yAxisFieldArray.push(totalFieldArray[valueI].value);
				yAxisNameArray.push(totalFieldArray[valueI].name);
			}
			var isChartValid = true;
			if (!$.isArray(charts.title)) {
				isChartValid = false;
			};
			if (!$.isArray(charts.type)) {
				isChartValid = false;
			}
			if (isChartValid == false) {
				nsalert('参数不合法', 'error');
				console.log(charts)
				return false;
			}
			config.echartObject.mode = charts.mode;
			configObj.echartObject.tableType = tableType;
			switch (charts.mode) {
				case 'single':
					//验证
					if (charts.type.length !== 1) {
						nsalert('单模式下类型长度为1');
						return false;
					};
					singleChart();
					break;
				case 'tab':
					//验证
					var isTab = true;
					if (charts.type.length !== totalFieldArray.length) {
						isTab = false;
					} //数组类型长度对应显示的tab数量
					charts.defaultIndex = typeof (charts.defaultIndex) == 'number' ? charts.defaultIndex : 0; //默认读0
					if (charts.defaultIndex > totalFieldArray.length) {
						isTab = false;
					} //下标应该符合tab
					if (isTab == false) {
						nsalert('参数不合法', 'error');
						console.log(charts)
						return false;
					}
					tabsChart();
					break;
				case 'column':
					if (charts.column.length !== totalFieldArray.length) {
						return false;
					}
					if (charts.type.length !== totalFieldArray.length) {
						return false;
					} //数组类型长度对应显示的column数量
					var columnLength = 0;
					for (var columnI = 0; columnI < charts.column.length; columnI++) {
						columnLength += charts.column[columnI];
					}
					if (columnLength > 12) {
						return false;
					}
					columnChart();
					break;
			}

			function singleChart() {
				var cID = chartId + '-single';
				chartHtml = '<div class="echart-' + charts.mode + '" id="' + cID + '" style="width:100%;height:350px;"></div>';
				$chart.html(chartHtml);
				var chartType = charts.type[0];
				var type = chartType;
				var magicType = '';
				if (chartType.indexOf(',') > -1) {
					magicType = chartType.split(',');
					type = chartType.substring(0, chartType.indexOf(','));
				}
				var chartOptions = {
					title: charts.title[0],
					type: type,
					magicType: magicType,
					xAxisField: descributeArray[0][0].value,
					yAxisField: yAxisFieldArray,
					yAxisName: yAxisNameArray, //名称
					data: tableDataArray
				};
				if (chartOptions.type == 'funnel') {
					chartOptions.yAxisField = yAxisFieldArray[0];
					chartOptions.seriesTooltip = totalFieldArray;
				}
				if (charts.xAxisField) {
					chartOptions.xAxisField = charts.xAxisField;
				}
				if (charts.yAxisField) {
					chartOptions.yAxisField = charts.yAxisField;
				}
				switch (tableType) {
					case 'columnTwoLevel':
						moreLevelEchartData(totalFieldObject.column);
						break;
					case 'rowTowLevel':
					case 'rowTwoLevel':
						moreLevelEchartData(totalFieldObject.row);
						break;
					case 'row':
						chartOptions.data = [];
						break;
				}

				function moreLevelEchartData(chartData) {
					var seriesArray = [];
					//特殊形式多表头的处理显示
					for (var descI = 0; descI < totalFieldArray.length; descI++) {
						var seriesJson = {
							type: type,
							name: totalFieldArray[descI].name,
							data: []
						}
						for (var totalI = 0; totalI < tableDataObject[chartData].length; totalI++) {
							seriesJson.data.push(tableDataObject[chartData][totalI][totalFieldArray[descI].value]);
						}
						seriesArray.push(seriesJson);
					}
					chartOptions = {
						xAxisName: titleArray,
						title: charts.title[0],
						yAxisName: yAxisNameArray,
						magicType: magicType,
						data: tableDataArray,
						type: type,
						seriesArray: seriesArray
					};
				}
				var $chartDom = echarts.init($('#' + chartId + '-single')[0]);
				config.echartObject.dom.push({
					target: $chartDom,
					options: chartOptions
				});
				nsChartUI.init(chartOptions, $chartDom);
			}

			function tabsChart() {
				var tabsHtml = '';
				var tabNavHtml = '';
				var liWidth = 100 / totalFieldArray.length;
				liWidth = Math.floor(liWidth * 1000) / 1000;
				for (var liI = 0; liI < totalFieldArray.length; liI++) {
					var lID = 'tabs-tab-li-' + liI + '-' + charts.type[liI];
					var tabPanelID = 'tabs-tab-a-' + liI + '-tab';
					var activeClass = liI == charts.defaultIndex ? 'active' : '';
					var tabClassStr = 'style="width:' + liWidth + '%;"';
					tabNavHtml += '<li id="' + lID + '" class="' + activeClass + '" ' + tabClassStr + '>' +
						'<a id="tabs-tab-a-' + totalFieldArray[liI].value + '" ns-index="' + liI + '" href="#' + tabPanelID + '" data-toggle="tab">' +
						totalFieldArray[liI].name +
						'</a>' +
						'</li>';
					tabsHtml += '<div class="tab-pane echart-tab-panel ' + activeClass + '" id="' + tabPanelID + '">' +
						'</div>';
				}
				tabNavHtml = '<ul class="nav nav-tabs nav-tabs-justified" id="tabs-' + chartId + '">' +
					tabNavHtml +
					'</ul>';
				tabsHtml = '<div class="tab-content">' +
					tabsHtml +
					'</div>';
				$chart.html(tabNavHtml + tabsHtml);
				var defaultPanelID = 'tabs-tab-a-' + charts.defaultIndex + '-tab';
				var cWidth = $('#' + config.id).outerWidth();
				$('#' + defaultPanelID).html('<div class="echart-templates-tab" id="echart-' + defaultPanelID + '" style="width:' + cWidth + 'px;height:350px;"></div>');
				var defaultPanelChartID = 'echart-' + defaultPanelID;
				echartChangeTab(charts.defaultIndex, defaultPanelChartID);
				$('#tabs-' + chartId + ' li a').on('click', function (ev) {
					var $this = $(this);
					var nIndex = Number($this.attr('ns-index'));
					var panelId = 'tabs-tab-a-' + nIndex + '-tab';
					var cWidth = $('#' + config.id).outerWidth();
					$('#' + panelId).html('<div class="echart-templates-tab" id="echart-' + panelId + '" style="width:' + cWidth + 'px;height:350px;"></div>');
					var echartId = 'echart-' + panelId;
					echartChangeTab(nIndex, echartId);
				});
			}

			function echartChangeTab(index, echartId) {
				chartOptions = {
					title: charts.title[index],
					xAxisField: descributeArray[0][0].value,
					yAxisField: yAxisFieldArray[index],
					type: charts.type[index],
					data: tableDataArray
				};
				switch (tableType) {
					case 'columnTwoLevel':
						echarLevelData(tableDataObject[totalFieldObject.column]);
						break;
					case 'rowTowLevel':
					case 'rowTwoLevel':
						echarLevelData(tableDataObject[totalFieldObject.row]);
						break;
				}

				function echarLevelData(data) {
					chartOptions = {
						title: charts.title[index],
						xAxisName: titleArray,
						type: charts.type[index],
					};
					chartOptions.seriesArray = [];
					switch (charts.type[index]) {
						case 'bar':
						case 'line':
							chartOptions.seriesArray = [{
								type: charts.type[index],
								data: []
							}];
							for (var seriesI = 0; seriesI < data.length; seriesI++) {
								chartOptions.seriesArray[0].data.push(data[seriesI][totalFieldArray[index].value]);
							}
							break;
						case 'pie':
						case 'funnel':
							for (var seriesI = 0; seriesI < data.length; seriesI++) {
								chartOptions.seriesArray.push({
									name: titleArray[seriesI],
									value: data[seriesI][totalFieldArray[index].value]
								})
							}
							break;
					}
				}
				var $chartDom = echarts.init($('#' + echartId)[0]);
				config.echartObject.dom.push({
					target: $chartDom,
					options: chartOptions
				});
				nsChartUI.init(chartOptions, $chartDom);
			}

			function columnChart() {
				var echartHtml = '';
				var eID = chartId + '-column';
				for (var widthI = 0; widthI < charts.column.length; widthI++) {
					echartHtml += '<div class="col-xs-12 col-md-' + charts.column[widthI] + '">' +
						'<div class="echart-' + charts.mode + '" id="' + eID + '-' + widthI + '" style="width:100%;height:350px;"></div>' +
						'</div>';
				}
				$chart.html(echartHtml);
				for (var optionI = 0; optionI < totalFieldArray.length; optionI++) {
					var oID = eID + '-' + optionI;
					echartChangeTab(optionI, oID);
				}
			}
		}
	}

	function validate() {
		var isValidate = true;
		//行数据是否是数组格式
		if ($.isArray(config.rowsData)) {
			var rowsLength = config.rowsData.length; //共有几行
			if ($.isArray(config.combineRowArray)) {
				var combineRowLength = config.combineRowArray.length;
				if (combineRowLength != rowsLength) {
					isValidate = false;
					nsalert('行合并数据无法匹配！');
				}
			}
			var columnLength = config.rowsData[0].length;
			if ($.isArray(config.combineColumnArray)) {
				var combineColumnLength = config.combineColumnArray.length;
				if (combineColumnLength != columnLength) {
					isValidate = false;
					nsalert('列合并数据无法匹配！');
				}
			}
		} else {
			isValidate = false;
			nsalert('行数据返回格式有误！');
		}
		//列标题返回是否是数组格式
		if (!$.isArray(config.theadsData)) {
			isValidate = false;
			nsalert('列标题返回格式有误！');
		}
		if (!$.isArray(config.columnWidthArray)) {
			console.error('返回的表格数据不完整，应当包含 columnWidthArray 数组 当前数据如下：');
			console.error(config)
		}
		if (!$.isArray(config.rowHeightArray)) {
			console.error('返回的表格数据不完整，应当包含 rowHeightArray 数组 当前数据如下：');
			console.error(config)
		}
		return isValidate;
	}

	function initTable(tableType) {
		setDefault();

		function setDefault() {
			if (!$.isArray(config.combineRowArray)) {
				config.combineRowArray = [];
				for (var rowspanI = 0; rowspanI < config.rowsData.length; rowspanI++) {
					config.combineRowArray.push(true);
				}
			}
			if (!$.isArray(config.combineThArray)) {
				//标题头合并
				config.combineThArray = theadDealCombine(config.theadsData);
			}
			if (!$.isArray(config.charts)) {
				config.charts = [];
			}
		}
		var $table = $('#' + config.tableID); //table元素
		config.$table = $table;
		var theadsData = config.theadsData;
		var tbodysData = config.rowsData;
		var combineThArray = config.combineThArray; //处理th是否允许合并
		var combineThRowArray = combineThArray[0]; //th行合并
		var combineThColumnArray = combineThArray[1]; //th列合并
		var columnThRenderArray = combineThArray[2]; //th渲染
		var columnWidthArray = []; //列宽
		var rowHeightArray = config.rowHeightArray; //行高
		var totalWidth = 0;
		var combineRowArray = config.combineRowArray; //行是否允许合并
		var combineColumnArray = []; //列是否允许合并
		var columnRenderArray = []; //列渲染
		var customRender = config.customRender; //自定义渲染

		//sjj 20190505 处理列合并
		function getCombineColumnArray(_combineColumnArray) {
			/**
			 * 第一种 格式[true,{type:'repeat', length:5, unit:[true, true]}]
			 * 
			 * *** */
			var columnArray = [];
			for (var columnI = 0; columnI < _combineColumnArray.length; columnI++) {
				var combineColumnData = _combineColumnArray[columnI];
				switch (typeof (combineColumnData)) {
					case 'boolean':
						columnArray.push(combineColumnData);
						break;
					case 'object':
						if (combineColumnData.type == 'repeat') {
							//重复
							for (var combineI = 0; combineI < combineColumnData.length; combineI++) {
								for (i = 0; i < combineColumnData.unit.length; i++) {
									columnArray.push(combineColumnData.unit[i]);
								}
							}
						}
						break;
					default:
						columnArray.push(combineColumnData);
						break;
				}
			}
			return columnArray;
		}
		combineColumnArray = getCombineColumnArray(config.combineColumnArray);
		columnRenderArray = getCombineColumnArray(config.columnRenderArray);  //？？ 这步是在干什么？?
		columnWidthArray = getCombineColumnArray(config.columnWidthArray);
		var theadArray = getTablesData(theadsData, 'th'); //标题
		var tbodyArray = getTablesData(tbodysData, 'td'); //内容

		dealCustomerRender();
		//thead 标题行合并
		function theadDealCombine(theadsData) {
			var combineThRowArray = [];
			var combineThColumnArray = [];
			var columnThRenderArray = [];
			for (var thRowI = 0; thRowI < theadsData.length; thRowI++) {
				combineThRowArray.push(true);
			}
			if ($.isArray(theadsData[0])) {
				for (var thColI = 0; thColI < theadsData[0].length; thColI++) {
					combineThColumnArray.push(true);
					columnThRenderArray.push('text');
				}
			} else {
				combineThColumnArray = combineThRowArray;
				columnThRenderArray = combineThRowArray;
			}
			return [combineThRowArray, combineThColumnArray, columnThRenderArray];
		}
		//处理数据
		function getTablesData(data, type) {
			var rowsArray = data;
			var outputArray = [];
			var rowspanArray = [];
			var columnspanArray = [];
			var renderArray = [];
			switch (type) {
				case 'th':
					rowspanArray = combineThRowArray;
					columnspanArray = combineThColumnArray;
					renderArray = columnThRenderArray;
					break;
				case 'td':
					rowspanArray = combineRowArray;
					columnspanArray = combineColumnArray;
					renderArray = columnRenderArray;
					break;
				default:
					break;
			}
			for (var rowI = 0; rowI < rowsArray.length; rowI++) {
				var colsArray = rowsArray[rowI];
				var outputColArray = [];
				for (var colI = 0; colI < colsArray.length; colI++) {
					/**
					 **row 行下标
					 **col 列下标
					 **text 文本值
					 **colspan 合并列
					 **rowspan 合并行
					 ** isAllowColspan 允许合并列
					 ** isAllowRowspan 允许合并行
					 **isAllowCombine 是否允许合并
					 ** isAllowedCombine 是否允许被合并
					 **/
					var isAllowRowspan = typeof (rowspanArray[rowI]) == 'boolean' ? rowspanArray[rowI] : false;
					var isAllowColspan = typeof (columnspanArray[colI]) == 'boolean' ? columnspanArray[colI] : false;
					var renderData = renderArray[colI];
					var dataType = typeof (renderData) == 'function' ? 'function' : renderData;
					var text = colsArray[colI];
					switch (dataType) {
						case 'function':
							text = renderData();
							break;
						case 'money':
							text = baseDataTable.formatMoney(text);
							break;
						case 'date':
							text = commonConfig.formatDate(new Date(text).getTime(), 'YYYY-MM-DD');
							break;
						case 'datetime':
							text = commonConfig.formatDate(new Date(text).getTime(), 'YYYY-MM-DD HH:mm:ss');
							break;
						default:
							break;
					}
					var outputColJson = {
						row: rowI,
						col: colI,
						text: text,
						datatype: dataType,
						colspan: 1,
						rowspan: 1,
						isRender: true,
						isAllowColspan: isAllowColspan,
						isAllowRowspan: isAllowRowspan,
						isAllowCombine: true,
						isAllowedCombine: true,
					};
					outputColArray.push(outputColJson);
				}
				outputArray.push(outputColArray);
			}
			var returnArray = [];
			outerRow:
				for (var outRowI = 0; outRowI < outputArray.length; outRowI++) {
					var returnColArray = [];
					//开始读取每行中td数据
					interCol:
						for (var outColI = 0; outColI < outputArray[outRowI].length; outColI++) {
							var currentData = $.extend({}, outputArray[outRowI][outColI]); //克隆数据
							returnColArray.push(currentData);
							//当前元素是否渲染
							if (outputArray[outRowI][outColI].isRender == false) {
								continue;
							}
							var currentText = outputArray[outRowI][outColI].text; //文本值
							var colspanIDs = [outColI]; //合并列
							if (outputArray[outRowI][outColI].isAllowColspan) {
								//允许列合并
								for (var nextOutColI = outColI + 1; nextOutColI < outputArray[outRowI].length; nextOutColI++) {
									if (outputArray[outRowI][nextOutColI].isRender == false || outputArray[outRowI][nextOutColI].isAllowColspan == false) {
										continue;
									}
									if (currentText == outputArray[outRowI][nextOutColI].text) {
										colspanIDs.push(nextOutColI);
										currentData.colspan++;
										outputArray[outRowI][nextOutColI].isRender = false;
									} else {
										break;
									}
								}
							}
							if (outputArray[outRowI][outColI].isAllowRowspan) {
								//允许行合并
								var nextOutrowIndex = outRowI + 1;
								if (nextOutrowIndex == outputArray.length) {
									continue;
								}
								outNextRow: //下一行标记
									for (nextOutrowIndex; nextOutrowIndex < outputArray.length; nextOutrowIndex++) {
										outNextCol: //下一列标记
											for (var outColIndex = 0; outColIndex < colspanIDs.length; outColIndex++) {
												if (outputArray[nextOutrowIndex][colspanIDs[outColIndex]].isRender == false || outputArray[nextOutrowIndex][colspanIDs[outColIndex]].isAllowRowspan == false) {
													break outNextRow;
												}
												if (outputArray[nextOutrowIndex][colspanIDs[outColIndex]].isAllowColspan == false) {
													break outNextRow;
												}
												if (currentText != outputArray[nextOutrowIndex][colspanIDs[outColIndex]].text) {
													break outNextRow;
												}
											}
										currentData.rowspan++;
										for (var outColIndex = 0; outColIndex < colspanIDs.length; outColIndex++) {
											outputArray[nextOutrowIndex][colspanIDs[outColIndex]].isRender = false;
										}
									}
							}

						}
					returnArray.push(returnColArray);
				}
			return returnArray;
		}
		//自定义渲染值的处理
		function dealCustomerRender() {
			if ($.isArray(customRender)) {
				for (var customerI = 0; customerI < customRender.length; customerI++) {
					var text = tbodysData[customRender[customerI].row][customRender[customerI].column];
					tbodyArray[customRender[customerI].row][customRender[customerI].column].type == customRender[customerI].type;
					if (customRender[customerI].type == 'money') {
						text = baseDataTable.formatMoney(text);
					}
					tbodyArray[customRender[customerI].row][customRender[customerI].column].text = text;
				}
			}
		}
		/************根据合并行统计数据 start***********/
		/*************根据合并行统计数据 end*************/
		

		// var theadHtml = getTheadHtml();
		for (var totalI = 0; totalI < columnWidthArray.length; totalI++) {
			totalWidth += columnWidthArray[totalI];
		}

		var theadHtml = nsUI.customertable.html.getTheadByArray(config, columnRenderArray, theadArray, columnWidthArray, totalWidth);
		var tbodyHtml = nsUI.customertable.html.getTbodyByArray(config, tbodyArray);
		$table.html(theadHtml + tbodyHtml);
		if (typeof (config.isScroll) == 'boolean') {
			if (config.isScroll) {
				var containerWidth = $(window).outerWidth() - 120;
				$table.parent().css({
					overflow: "hidden",
					height: "600px",
					width: containerWidth + "px"
				});
				$table.before('<div class="scroll-panel-table" style="height:600px;overflow:auto"></div>');
				var $div = $('.scroll-panel-table');
				$div.html($table);
				var html = '<div class="scroll-panel nspanel layout-customertable" style="position:absolute;z-index:1;left:0px;width:' + containerWidth + 'px"><table id="scroll-table" cellspacing="0" class="table table-hover table-striped table-singlerow table-bordered table-sm scroll-table">' +
					theadHtml +
					'</table></div>';
				$table.parent().before(html);
				$('.scroll-panel .scroll-table').css({
					width: totalWidth + 'px',
					position: 'absolute',
					top:0,
					left:0,
				});
				$('.scroll-panel-table').on('scroll', function (ev) {
					var scrollLeft = ev.target.scrollLeft;
					$('.scroll-panel').css({
						left: -scrollLeft + 'px'
					});
				})
			}
		}
		$table.css({
			'width': totalWidth + 'px'
		});
		$table.after('<div class="customer-table-input-component"></div>');
		var $buttons = $('#' + config.tableID + ' button[type="button"]');
		var $editTablePanel = $table.parent().children('.customer-table-input-component');
		var $ths = $table.children('thead').children('tr:last');
		$ths = $ths.children('th').not(':first');
		$ths.children('.text-content').on('click', function (ev) {
			//过滤筛选
			var $this = $(this);
			var filterStr = $.trim($this.text());
			filterStr = '请输入' + filterStr;
			var $th = $this.closest('th');
			var colIndex = $th.attr('th-colindex'); //列下标
			var datatype = columnRenderArray[colIndex]; //渲染类型
			var classStr = 'input-' + datatype;
			var cssObj = {
				display: 'block',
				background: 'red',
				top: $th.position().top + 'px',
				left: $th.position().left + 'px',
				height: ($th.outerHeight() + 1) + 'px',
				width: ($th.outerWidth() + 1) + 'px',
			};
			var inputHtml = '<div id="customerTable-inputcomponent-panel" class="customertable-component-container">' +
				'<input type="text" class="' + classStr + '" placeHolder="' + filterStr + '" ns-colIndex="' + colIndex + '" ns-type="' + datatype + '" />' +
				'</div>';
			$editTablePanel.css(cssObj);
			$editTablePanel.html(inputHtml);
			var $input = $('#customerTable-inputcomponent-panel').children('input');
			//初始化input框
			initInput();

			function initInput() {
				switch (datatype) {
					case 'date':
						var options = {
							"locale": {
								"format": language.common.nscomponent.daterangepicker.localeformat,
								"separator": " / ",
								"applyLabel": language.common.nscomponent.daterangepicker.applyLabel,
								"cancelLabel": language.common.nscomponent.daterangepicker.cancelLabel,
								"fromLabel": language.common.nscomponent.daterangepicker.fromLabel,
								"toLabel": language.common.nscomponent.daterangepicker.toLabel,
								"customRangeLabel": language.common.nscomponent.daterangepicker.customRangeLabel,
								"daysOfWeek": language.date.daysOfWeek,
								"monthNames": language.date.monthNames,
								"firstDay": 1,
								"separator": '-',
							},
							"alwaysShowCalendars": true,
							"opens": "center",
							"buttonClasses": "btn",
						}
						$input.daterangepicker(options, function (start, end, label) {
							var startStr = start.format(language.date.rangeFormat);
							var endStr = end.format(language.date.rangeFormat);
							startStr = new Date(startStr).getTime();
							endStr = new Date(endStr).getTime();
							searchValue($input, startStr, endStr);
						});
						break;
					default:
						$input.on('focus', function (ev) {
							var $this = $(this);
							$this.on('keyup', function (event) {
								if (event.keyCode == 13) {
									searchValue($this);
								}
							});
						});
						$input.focus();
						$input.on('blur', function (blurEvent) {
							$editTablePanel.css('display', 'none');
						})
						break;
				}
			}
		});
		$ths.children('.sorting').on('click', function (ev) {
			//排序操作
			var $this = $(this);
			var sortStr = 'asc';
			if ($this.hasClass('sorting-asc')) {
				$this.removeClass('sorting-asc');
				$this.addClass('sorting-desc');
				sortStr = 'desc';
			} else {
				$this.addClass('sorting-asc');
				$this.removeClass('sorting-desc');
				sortStr = 'asc';
			}
			var colIndex = $this.closest('th').attr('th-colindex'); //列下标
			getSortColumnData(colIndex, sortStr);
		});
		//获取排序数据
		function getSortColumnData(index, sort) {
			var sorttype = sort;
			var datatype = columnRenderArray[index]; //渲染类型
			var data = [];
			for (var origalI = 0; origalI < tbodysData.length; origalI++) {
				var cArray = [];
				for (var origalJ = 0; origalJ < tbodysData[origalI].length; origalJ++) {
					cArray.push(tbodysData[origalI][origalJ]);
				}
				data.push(cArray);
			}
			switch (sorttype) {
				case 'desc':
					getDescData();
					break;
				case 'asc':
					getAscData();
					break;
			}

			function getDescData() {
				switch (datatype) {
					case 'text':
						data = data.sort(function (a, b) {
							return b[index].localeCompare(a[index]);
						});
						break;
					case 'date':
					case 'number':
						data = data.sort(function (a, b) {
							return b[index] - a[index];
						});
						break;
					case 'money':
						break;
					default:
						break;
				}
			}

			function getAscData() {
				switch (datatype) {
					case 'text':
						data = data.sort(function (a, b) {
							return a[index].localeCompare(b[index]);
						});
						break;
					case 'date':
					case 'number':
						data = data.sort(function (a, b) {
							return a[index] - b[index];
						});
						break;
					case 'money':
						break;
					default:
						break;
				}
			}
			refresh(data);
		}
		//字段检索
		function searchValue($dom, start, end) {
			var searchStr = $.trim($dom.val());
			var colIndex = $dom.attr('ns-colIndex');
			var datatype = $dom.attr('ns-type');
			var data = [];
			switch (datatype) {
				case 'text':
					for (var origalI = 0; origalI < tbodysData.length; origalI++) {
						if (tbodysData[origalI][colIndex].indexOf(searchStr) > -1) {
							data.push(tbodysData[origalI]);
						}
					}
					break;
				case 'number':
					searchStr = Number(searchStr);
					for (var origalI = 0; origalI < tbodysData.length; origalI++) {
						if (tbodysData[origalI][colIndex] === searchStr) {
							data.push(tbodysData[origalI]);
						}
					}
					break;
				case 'date':
					for (var origalI = 0; origalI < tbodysData.length; origalI++) {
						if (commonConfig.formatDate(tbodysData[origalI][colIndex]) == commonConfig.formatDate(start)) {
							data.push(tbodysData[origalI]);
						}
						if (tbodysData[origalI][colIndex] > start && tbodysData[origalI][colIndex] <= end) {
							data.push(tbodysData[origalI]);
						}
					}
					break;
				default:
					break;
			}
			if (data.length > 0) {
				refresh(data);
			} else {
				$table.children('tbody').html('<div class="customer-table-empty">暂无</div>');
			}
			$editTablePanel.css('display', 'none');
		}
		switch (tableType) {
			case 'row':
				combineRenderTableRowData();
				break;
		}

		function combineRenderTableRowData() {
			var combineRenderTableArray = [];
			for (var rowI = 0; rowI < tbodyArray.length; rowI++) {
				for (var colI = 0; colI < tbodyArray[rowI].length; colI++) {
					if (tbodyArray[rowI][colI].isRender) {
						//允许渲染
						if (tbodyArray[rowI][colI].rowspan > 1) {
							combineRenderTableArray.push({
								text: tbodyArray[rowI][colI].text,
								rowspan: tbodyArray[rowI][colI].rowspan,
								rowIndex: rowI,
								colIndex: colI
							});
						}
					}
				}
			}
			var seriesArray = [];
			var xAxisArray = [];
			var legendDataArray = [];
			for (var countI = 0; countI < combineRenderTableArray.length; countI++) {
				var combineRowLength = combineRenderTableArray[countI].rowspan; //合并了几行
				var startPage = ((countI + 1) - 1) * 7;
				var endPage = startPage + combineRowLength;
				var data = [];
				xAxisArray = [];
				for (var startIndex = startPage; startIndex < endPage; startIndex++) {
					data.push(tableDataArray[startIndex][config.format.charts.yAxisField]);
					xAxisArray.push(commonConfig.formatDate(tableDataArray[startIndex][config.format.charts.xAxisField]));
				}
				legendDataArray.push(combineRenderTableArray[countI].text);
				seriesArray.push({
					name: combineRenderTableArray[countI].text,
					data: data,
					type: 'bar'
				});
			}
			window.setTimeout(function () {
				var cOptions = {
					series: seriesArray,
					xAxis: {
						data: xAxisArray
					},
					legend: {
						data: legendDataArray
					}
				};
				config.echartObject.dom[0].target.setOption(cOptions);
			}, 500)
			//
		}
		//处理刷新数据
		function refresh(data) {
			var newDataArray = getTablesData(data, 'td');
			dealCustomerRender();
			var tbodyHtml = nsUI.customertable.html.getTbodyByArray(config, newDataArray);
			$table.html(tbodyHtml);
			refreshEchart(data);
		}

		function refreshEchart(data) {
			var chartMode = config.echartObject.mode;
			var chartDoms = config.echartObject.dom;
			var tableType = config.echartObject.tableType;
			//图表模式
			switch (chartMode) {
				case 'single':
					refreshSingleChart();
					break;
				case 'column':
					break;
				case 'tab':
					break;
			}

			function refreshSingleChart() {
				switch (tableType) {
					case 'row':
						break;
				}
			}
		}
		$buttons.off('click');
		$buttons.on('click', function (ev) {
			var fidIndex = $(this).attr('fid');
			var rowIndex = $(this).closest('tr').attr('ns-rowindex');
			if (typeof (config.tableRowBtns[fidIndex].handler) == 'function') {
				config.tableRowBtns[fidIndex].handler({
					data: config.rowDataObj[rowIndex]
				});
			}
		});

		//生成左侧固定列 读取参数 config.columnFixedLeft:Number 固定多少列在左侧不可滚动
		console.log(config)
		console.log(this);
		config.tbodyArray = tbodyArray;
		nsUI.customertable.fixedColumnPanel.initByTableConfig(config);
	}
}
nsUI.customertable.html = {
	//获取表格
	getTableByHtml:function(tableId, theadHtml, tbodyHtml){
		if(typeof(theadHtml)!= 'string'){
			theadHtml = '';
		}
		if(typeof(tbodyHtml)!= 'string'){
			tbodyHtml = '';
		}
		var tableHtml = 
		'<table cellspacing="0" class="table table-hover table-striped table-singlerow table-bordered table-sm" id="' + tableId + '">'
			+theadHtml
			+tbodyHtml
		+'</table>';
		return tableHtml;
	},
	//获取thead HTML 数据来源是原来流程中的变量
	getTheadByArray:function(config, columnRenderArray, theadArray, columnWidthArray, totalWidth) {
		var theadHtml = '';
		//列宽
		
		theadHtml += '<tr class="first-rowth"><th width="0"></th>';
		for (var widthI = 0; widthI < columnWidthArray.length; widthI++) {
			var tdWidth = columnWidthArray[widthI] / totalWidth * 100;
			tdWidth = parseInt(tdWidth * 100) / 100;
			var widthStr = tdWidth + '%';
			theadHtml += '<th width="' + widthStr + '"></th>';
		}
		theadHtml += '</tr>';

		for (var thRowI = 0; thRowI < theadArray.length; thRowI++) {
			theadHtml += '<tr><th></th>';
			var sortingHtml = '';
			if (thRowI == theadArray.length - 1) {
				sortingHtml = '<div class="sorting sorting-asc"></div>';
			};
			for (var thColI = 0; thColI < theadArray[thRowI].length; thColI++) {
				if (theadArray[thRowI][thColI].isRender) {
					//允许输出渲染
					theadHtml += '<th class="th-' + columnRenderArray[thRowI] + '" th-colindex="' + thColI + '" th-rowindex="' + thRowI + '" rowspan="' + theadArray[thRowI][thColI].rowspan + '" colspan="' + theadArray[thRowI][thColI].colspan + '">' +
						'<div class="text-content">' + theadArray[thRowI][thColI].text + '</div>' +
						sortingHtml +
						'</th>';
				}
			}
		}
		theadHtml = '<thead>'+theadHtml+'</thead>'
		return theadHtml;
	},
	//获取tbody HTML
	getTbodyByArray: function (config, tbodyArray) {
		console.warn(tbodyArray);
		var tbodyHtml = '';
		for (var rowI = 0; rowI < tbodyArray.length; rowI++) {
			var trClassStr = '';
			if (config.rowClassObj[rowI]) {
				trClassStr = config.rowClassObj[rowI];
			}
			tbodyHtml += '<tr class="' + trClassStr + '" ns-rowindex="' + rowI + '"><td ns-rowindex="' + rowI + '" class="first-rowtd" style="' + config.rowHeightArray[rowI] + 'px"></td>';
			for (var colI = 0; colI < tbodyArray[rowI].length; colI++) {
				if (tbodyArray[rowI][colI].isRender) {
					//允许输出渲染
					tbodyHtml += '<td class="td-' + tbodyArray[rowI][colI].datatype + '" rowspan="' + tbodyArray[rowI][colI].rowspan + '" colspan="' + tbodyArray[rowI][colI].colspan + '">' +
						'<div>' + tbodyArray[rowI][colI].text + '</div>' +
						'</td>';
				}
			}
			tbodyHtml += '</tr>';
		}
		tbodyHtml = '<tbody>'+tbodyHtml+'</tbody>'
		return tbodyHtml;
	},
	//根据列参数返回 thead HTML
	getEmptyTheadByArray: function (tableConfig, columnsConfigArray){
		/**columnsConfigArray:array
		 * [
		 * 	{
		 * 		width:20
		 * 	},...
		 * ]
		 */
		var html = '';
		for(var i=0; i<columnsConfigArray.length; i++){
			var width = columnsConfigArray[i].width;
			html += '<th class="empty" style="width:'+ width +'px; " ></th>'
		}
		html = '<thead>'+html+'</thead>';
		return html;
	}
}
nsUI.customertable.fixedColumnPanel = {
	html: '',
	config: {},
	tableConfig:{},
	//验证是否可用
	validate: function (tableConfig) {
		var isValid = true;

		var leftFixedColumnsNumber = tableConfig.leftFixedColumnsNumber;
		//未配置固定列 或者固定列数量小于1 则不执行
		if (typeof (leftFixedColumnsNumber) != 'number') {
			return false;
		} else {
			if (leftFixedColumnsNumber < 1) {
				return false;
			}
		}
		//固定列不能大于可用列
		if (leftFixedColumnsNumber > tableConfig.tbodyArray.length) {
			console.error('leftFixedColumnsNumber:' + leftFixedColumnsNumber + ' （左固定列数量）配置错误，不能大于可用列：' + tableConfig.tbodyArray.length);
			console.error(tableConfig);
			return false;
		}
		return isValid;
	},
	//根据表格配置获取固定列面板的配置
	getConfig: function (tableConfig) {

		var leftFixedColumnsNumber = tableConfig.leftFixedColumnsNumber;
		var leftFixedRows = [];
		var leftFixedColumns = [];

		//根据行数据返回固定列的行数据
		function getfiexdRowData(_rowData) {
			var fixedRowData = [];
			for (var i = 0; i < leftFixedColumnsNumber; i++) {
				fixedRowData.push(_rowData[i]);
			}
			return fixedRowData;
		}

		//获取所需要的行数据，其他放弃
		for (var rowI = 0; rowI < tableConfig.tbodyArray.length; rowI++) {
			var rowData = tableConfig.tbodyArray[rowI];
			leftFixedRows.push(getfiexdRowData(rowData));
		}

		var totalWidth = 0;
		leftFixedColumns.push({
			width:0,
			type:'empty',
		})
		//获取左侧固定列的配置 根据宽度获取列表		
		for(var i = 0; i<leftFixedColumnsNumber; i++){
			var columnWidth = tableConfig.columnWidthArray[i];
			totalWidth += columnWidth
			leftFixedColumns.push({
				width:columnWidth,
				type:'empty',
			});
		}

		//thead高度
		var theadHeight = $('#table-'+this.tableConfig.id+' thead').outerHeight();

		return {
			leftFixedColumnsNumber: leftFixedColumnsNumber, //Number 左侧有多少列固定
			leftFixedRows: leftFixedRows, 					//Array  都是哪些列
			leftFixedColumns:leftFixedColumns, 				//array [{type:'empty', }]
			totalWidth:totalWidth, 							//Number 面板宽度
			theadHeight:theadHeight, 						//thead 高度
		}
	},
	initByTableConfig(tableConfig) {
		//验证是否需要执行
		var isValid = this.validate(tableConfig);
		if (isValid == false) {
			return false;
		}
		this.tableConfig = tableConfig;
		this.config = this.getConfig(tableConfig);

		this.init();
	},
	//初始化方法
	init: function () {
		console.log(this.tableConfig);
		var tableId = 'table-'+this.tableConfig.id;
		var fixedTableTheadId = this.tableConfig.id + '-fixedLeft-thead';
		var fixedTableTbodyId = this.tableConfig.id + '-fixedLeft-tbody';

		//thead 对应的table
		var leftFixedTableHeadHtml = $('#' + tableId + ' thead').html();
		var leftFixedTableHeadContainerHtml = 
			'<div netstartype="table-fixed" id="container-'+fixedTableTheadId+'" class="fixedColumnPanel">'
				+'<table cellspacing="0" class="table table-hover table-striped table-singlerow table-bordered table-sm" id="' + fixedTableTheadId + '">'
					+ '<thead>'
					+ leftFixedTableHeadHtml 
					+ '</thead>'
				+'</table>';
			+'</div>';
		var $leftFixedHeadPanel = $(leftFixedTableHeadContainerHtml);
		//输出面板并添加属性
		$leftFixedHeadPanel.css({
			position:'absolute',
			top:this.config.headerHeight + 'px',
			width:this.config.totalWidth + 'px',
			left:'1px',
			top:0,
			overflow:'hidden',
			'z-index':3,
			'border-right':'2px solid #b3cbe5'
		});
		//
		$leftFixedHeadPanel.children('table').css({
			width:$('#'+tableId).outerWidth(),
		})
		this.tableConfig.$table.parent().append($leftFixedHeadPanel);

		//tbody对应的table
		var theadHtml = nsUI.customertable.html.getEmptyTheadByArray(this.tableConfig, this.config.leftFixedColumns);
		var tbodyHtml = nsUI.customertable.html.getTbodyByArray(this.tableConfig, this.config.leftFixedRows);
		var leftFixedTableBodyHtml = nsUI.customertable.html.getTableByHtml(fixedTableTbodyId, theadHtml, tbodyHtml);
		var leftFixedTableBodyContainerHtml = 
			'<div netstartype="table-fixed-body" id="container-'+fixedTableTbodyId+'" class="fixedColumnPanel">'
				+ leftFixedTableBodyHtml
			+'</div>';
		var $leftFixedBodyPanel = $(leftFixedTableBodyContainerHtml);
		//输出面板并添加属性
		$leftFixedBodyPanel.css({
			position:'absolute',
			top:this.config.theadHeight + 'px',
			width:this.config.totalWidth + 'px',
			bottom:'8px',
			left:'1px',
			top:0,
			overflow:'hidden',
			'z-index':2,
			'border-right':'2px solid #b3cbe5'
		});
		//
		$leftFixedBodyPanel.children('table').css({
			width:this.config.totalWidth + 'px',
		})
		this.tableConfig.$table.parent().append($leftFixedBodyPanel);

		//添加主表的滚动监听事件
		var $scrollTable = $('#'+this.tableConfig.id).find('.scroll-panel-table');
		$scrollTable.on('scroll', {orgSrollTop:this.config.theadHeight},function(ev){
			$leftFixedBodyPanel.css({
				top:-ev.target.scrollTop + ev.data.orgSrollTop + 'px'
			})
		})
	},
	
}
//整体刷新
nsUI.customertable.refresh = function (layoutID) {
	var tableId = 'table-' + layoutID;
	var tableHtml = '<table cellspacing="0" class="table table-hover table-striped table-singlerow table-bordered table-sm" id="' + tableId + '"></table>';
	$('#' + layoutID).html(tableHtml);
	nsUI.customertable.init(nsUI.customertable[layoutID].config);
}
//导出
nsUI.customertable.exportXls = function (tableID) {
	var tempTableHtml = '<div style="display:none;"><table id="customer-table-export"></table></div>';
	var $table = $('#' + tableID);
	$table.after($(tempTableHtml));
	var $customerTable = $('#customer-table-export');
	getExportHtml();

	function getExportHtml() {
		var theadHtml = '';
		var tbodyHtml = '';
		var theadTrDom = $table.children('thead').children('tr').not('.first-rowth');
		var tbodyDom = $table.children('tbody').children("tr");
		for (var thRowI = 0; thRowI < theadTrDom.length; thRowI++) {
			theadHtml += '<tr>';
			var thDom = $(theadTrDom[thRowI]).children('th');
			for (var thI = 0; thI < thDom.length; thI++) {
				var innerHtmlStr = '';
				var rowspanStr = '';
				var colspanStr = '';
				var $th = $(thDom[thI]);
				if (thI == 0) {
					//innerHtmlStr = thDom[thI].innerHTML;
				} else {
					innerHtmlStr = $th.children('div').text();
					rowspanStr = $th.attr('rowspan');
					colspan = $th.attr('colspan');
					rowspanStr = 'rowspan="' + rowspanStr + '"';
					colspanStr = 'colspan="' + colspan + '"';
					innerHtmlStr.replace(/[\r\n]/g, "");
					theadHtml += '<th ' + rowspanStr + ' ' + colspanStr + '>' + innerHtmlStr + '</th>';
				}
			}
			theadHtml += '</tr>';
		}
		for (var tr = 0; tr < tbodyDom.length; tr++) {
			var trHtml = '';
			var tdDom = $(tbodyDom[tr]).children();
			for (var td = 0; td < tdDom.length; td++) {
				var innerHtmlStr = '';
				var rowspanStr = '';
				var colspanStr = '';
				var $td = $(tdDom[td]);
				if (td == 0) {
					//innerHtmlStr = tdDom[td].innerHTML;
				} else {
					innerHtmlStr = $td.children('div').text();
					rowspanStr = $td.attr('rowspan');
					colspan = $td.attr('colspan');
					rowspanStr = 'rowspan="' + rowspanStr + '"';
					colspanStr = 'colspan="' + colspan + '"';
					var classStr = $td.attr('class');
					classStr = 'class="' + classStr + '"';
					innerHtmlStr = innerHtmlStr.replace(/[\r\n]/g, "");
					trHtml += '<td ' + classStr + ' ' + rowspanStr + ' ' + colspanStr + '>' + innerHtmlStr + '</td>';
				}
			}
			trHtml = '<tr>' + trHtml + '</tr>';
			tbodyHtml += trHtml;
		}
		tbodyHtml = '<tbody>' + tbodyHtml + '</tbody>';
		theadHtml = '<thead>' + theadHtml + '</thead>';
		$customerTable.html(theadHtml + tbodyHtml);
	}
	$customerTable.tableExport({
		type: 'excel',
		escape: 'false',
		fileName: 'excel'
	});
	$customerTable.remove();
}