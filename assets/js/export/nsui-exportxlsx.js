var nsexportxlsx = (function ($) {
	var config = {}; //组件配置文件
	//根据 volist 数据导出电子表格
	function json_to_excel(option) {
		/**
		 * option.data	数据
		 * option.header	标题
		 * option.excelName	文件名
		 * option.ext	文件后缀
		 * option.sheetName	表名
		 * option.sheets	是否分页
		 * option.sheetFilter 分页筛选
		 */
		if (option.sheets) {
			setDefault(option);
			config.header = option.header;
			getWsArr(option.data);
			writeFile();
		} else {
			var wb = XLSX.utils.book_new();
			var ws = XLSX.utils.json_to_sheet(option.data, { header: option.header, cellDates: true });
			XLSX.book_append_sheet(wb, ws, option.sheetName);
			XLSX.writeFile(wb, option.excelName + '.' + option.ext);
		}
	}
	//根据 二维数组导出电子表格
	function aoa_to_excel(option) {
		/**
		 * option.data	数据
		 * option.header	标题
		 * option.excelName	文件名
		 * option.ext	文件后缀
		 * option.sheetName	表名
		 */
		if (config.sheets) {
			return nsalert("暂不支持二维数组导出分页", "error");
		}
		var wb = XLSX.utils.book_new();
		var ws = XLSX.utils.aoa_to_sheet(option.data, { cellDates: true })
		XLSX.book_append_sheet(wb, ws, option.sheetName)
		XLSX.writeFile(wb, option.excelName + '.' + option.ext)
	}
	//根据 表格id导出电子表格
	function table_to_excel() {
		if (!config.isCurrentTableData) {
			getHeader();
			getWs();
			writeFile();
		} else {
			getHeader();
			getWs(baseDataTable.data[config.tableId].filterData);
			writeFile();
		}
	}
	//根据 ajax请求数组导出电子表格
	function ajax_to_excel() {
		var dataConfig = baseDataTable.originalConfig[config.tableId].dataConfig;
		var ajaxConfig = {
			url: dataConfig.src,
			type: dataConfig.type,
			data: dataConfig.data,
			dataSrc: dataConfig.dataSrc
		};
		config.ajaxConfig = nsVals.getAjaxConfig(ajaxConfig);
		nsVals.ajax(config.ajaxConfig, function (res) {
			if (!$.isEmptyObject(res)) {
				var dataSource = res[config.ajaxConfig.dataSrc];
				if (config.ajaxConfig.dataSrc == 'rows') {
					getHeader();
					getWs(dataSource);
					writeFile();
				}
			}
		})
	}
	//导出电子表格
	function getexcel(option) {
		/**
		 * option  type(必填)       string   currentData(导出当前表格显示数据，需要传入tableId)
		 *                             		 serversData(导出由服务器中通过ajax请求到的数据)
		 *                             		 selectData(导出当前表格选中数据，需要传入tableId)
		 *         sheets      boolean  是否分多个表   默认false
		 * 		  sheetName  string  导出excel文件单个表名字   默认"sheet_1"	如果开启分表，则为数组
		 *         excelName  string   导出excel文件名字   默认时间戳
		 *         ext        string   导出excel格式,支持xls、xlsx、xlsm、xlsb  默认 xlsx
		 * 		  tableId	 string 	  要导出表格数据的表格id
		 * 		  sheetFilter function 一个函数，用来分页，返回值为分出的页名
		 * 		  headerJson  json	表格标题，形式为键值对应标题文字
		 * ---------以下为serversData模式下必填---------------
		 * 		  ajaxConfig = {
		 * 				url:"",
		 * 				type:"",
		 * 				data:{},
		 * 				dataSrc:""
		 * 			}
		 * 		  
		 */
		setDefault(option);
		switch (config.type) {
			case 'selectData':
			case 'currentData':
				table_to_excel();//获得表格中的
				break;
			case 'serversData':
				ajax_to_excel();//ajax导出表格
				break;
			default:
				nsalert("导出类型(type)出错，应为(currentData(当前表格数据),selectData(当前选中数据),serversData(ajax导出数据))中一个", "error");
				break;
		}
	}
	//设置默认值函数
	function setDefault(option) {
		//config默认值
		config = {
			type: "",
			isCurrentTableData: false,
			sheets: false,
			excelName: Number(new Date()),
			ext: "xlsx",
			wsArr: [],
			colsArr: [],
			allowFields: [],
			wb: XLSX.utils.book_new()	//表格对象
		};
		var optionArr = ['type', 'sheets', 'sheetName', 'sheetFilter', 'excelName', 'ext', 'tableId', 'ajaxConfig', 'headerJson', 'isCurrentTableData'];
		//如果导出方式无效，则报错
		if (typeof (option['type']) == 'undefined') {
			return nsalert("请至少填写导出excel方式(type参数)", "error");
		}
		$.each(optionArr, function (index, item) {
			if (typeof (option[item]) != 'undefined' && $.trim(option[item]).length > 0) {
				config[item] = option[item]
			}
		})
		//表名
		typeof (config.sheetName) == 'undefined' ? config.sheetName = "sheet_1" : '';
		//判断数据合理性
		if (config.type == "currentData" || config.type == "selectData") {
			if (typeof (config.tableId) == "undefined" || $.trim(config.tableId).length == 0) {
				return nsalert("请填写tableId", "error");
			}
		} else if (config.type == "serversData") {
			if (typeof (config.ajaxConfig) == "undefined") {
				return nsalert("请填写ajaxConfig", "error")
			}
			config.ajaxConfig = nsVals.getAjaxConfig(config.ajaxConfig, config.ajaxConfig.data);
		}
		config.html = option.html;
		// console.log(config);
	}
	//获得标题和列宽
	function getHeader() {
		if (config.headerJson) {
			var header = [];
			for (var key in config.headerJson) {
				if (config.headerJson.hasOwnProperty(key)) {
					var element = config.headerJson[key];
					header.push(element);
				}
			}
			config.header = header;
		} else {
			var visableColumnName = [];
			/* var allConfig = nsTable.data[config.tableId];
			var allColumnFields = Object.keys(allConfig.columns);
			var hiddenColumnFields = [];
			if (typeof allConfig.uiConfig.isUseTabs == 'undefined' || !allConfig.uiConfig.isUseTabs) {
			} else if (typeof allConfig.uiConfig.isUseTabs != 'undefined' && allConfig.uiConfig.isUseTabs) {
				for (var key in allConfig.uiConfig.tabColumn.hidden) {
					if (allConfig.uiConfig.tabColumn.hidden.hasOwnProperty(key)) {
						var element = allConfig.uiConfig.tabColumn.hidden[key];
						hiddenColumnFields.push(element.data);
					}
				}
			}
			$.each(allColumnFields,function(index,item){
				if($.inArray(item,hiddenColumnFields) == -1){
					visableColumnName.push(item);
				}
			});*/

			var columnConfig = baseDataTable.data[config.tableId].columnConfig;
			var sheetWidth = parseInt(getComputedStyle(document.getElementById(config.tableId)).width);
			var headerJson = {};	//拿到标题和key值相对应json
			var header = [];		//标题数组
			var colsArr = [];			//列宽
			$.each(columnConfig, function (index, item) {
				if (typeof (item.width) == 'number') {
					sheetWidth -= item.width;
				}
			});
			//获取列宽，标题
			visableColumnName = baseDataTable.getVisableColumnsName(config.tableId);

			//如果存在html
			if(config.html){
				var trLength = $(config.html).length;//输出tr的长度
				var emptyRows = [];
				for(var trI=0; trI<trLength; trI++){
					var rowObj = {};
					var colNum = 0;
					var textHtml = $(config.html)[trI].children[0].innerHTML;
					/*for(var colI in visableColumnName){
						colNum++;
						rowObj[colI] = null;
						if(colNum == 2){
							rowObj[colI] = textHtml;	
						}
					}*/
					emptyRows.push(textHtml);
				}
				config.emptyRows = emptyRows;
			}

			$.each(columnConfig, function (index, item) {
				if (typeof (visableColumnName[item.data]) != 'undefined' && item.data != 'id') {
					config.allowFields.push(item.name);
					var colsObj = {};
					header.push(item.title);
					headerJson[item.name] = {
						title: item.title,
						formatHandler: item.formatHandler,
						meta: {
							col: index,
							settings: {
								sTableId: config.tableId
							}
						}
					}
					colsObj.wpx =
						typeof item.width == "string"
							? (parseFloat(item.width) / 100) * sheetWidth
							: item.width;
					colsArr.push(colsObj);
				}
			});
			config.header = header;
			config.headerJson = headerJson;
			config.colsArr = colsArr;
		}

	}
	//获得ws
	function getWs(dataSource) {
		dataSource = typeof (dataSource) == 'undefined'
			? config.type == 'selectData'
				? NSCHECKEDFLAG.VALUE
					? baseDataTable.getTableSelectData(config.tableId)	//选中数据
					: getNotSelectData()	//非选中数据
				: baseDataTable.getAllTableData(config.tableId)
			: dataSource;
		//分为两种，一种为二维数组导出表格，一种为voList导出表格
		if (dataSource == null) { nsalert('无数据', 'warning'); return false; }
		if (dataSource[0] instanceof Array) {
			//如果数据是二维数组
			var wsData = [];
			wsData = dataSource;			//拿到json数据
			wsData.unshift(config.header);
			var ws = XLSX.utils.aoa_to_sheet(wsData, { cellDates: true });
			//放到wsArr数组
			config.wsArr.push(ws);
		} else {
			//如果数据格式为voList
			//如果分页
			var firstRow;
			var nameArr = [];
			if($.isArray(config.emptyRows)){
				if(config.emptyRows.length > 0){
					firstRow = config.emptyRows.length + 1;
					for(var emptyI=0; emptyI<config.emptyRows.length; emptyI++){
						nameArr.push([config.emptyRows[emptyI]]);
					}
				}
			}
			//console.log(nameArr)
			//console.log(dataSource)

			if (config.sheets) {
				getWsArr(dataSource);
			} else {

				var ws = XLSX.utils.json_to_sheet(getWsData(dataSource), { header: config.header, cellDates: true });
				if(config.html && firstRow){
					var testSheet = XLSX.utils.aoa_to_sheet(nameArr, { cellDates: true });
					XLSX.utils.sheet_add_json(testSheet,getWsData(dataSource),{header: config.header, cellDates: true,origin:'A'+firstRow});
					config.wsArr.push(testSheet);
				}else{
					config.wsArr.push(ws);
				}
			}
		}
		
		$.each(config.wsArr, function (index, item) {
			config.colsArr.length > 0 ? item['!cols'] = config.colsArr : "";
		});

	}
	//根据数据拿到拼接标题后的wsData
	function getWsData(dataSource) {
		var unDisplay = ['button', 'icon', 'image', 'upload', 'uploadFile'];
		var getForDataSource = ['input'];
		var wsData = [];
		//拿到显示数据 并 进行时间 num 转为 date
		$.each(dataSource, function (i, ite) {
			var obj = {};
			for (var key in ite) {
				if (ite.hasOwnProperty(key)) {
					var element = ite[key];
					if ($.inArray(key, config.allowFields) != -1) {
						if (typeof (config.headerJson[key].formatHandler) != 'undefined') {
							config.headerJson[key].meta.row = i;
							var formatHandler = config.headerJson[key].formatHandler;
							//如果是一些不能显示的则跳过
							if ($.inArray(formatHandler.type, unDisplay) == -1) {
								var data = formatHandler.data;
								var meta = config.headerJson[key].meta;
								var formatDate = typeof (formatHandler.data) != 'undefined'
									? typeof formatHandler.data.formatDate != 'undefined'
										? formatHandler.data.formatDate
										: ""
									: "";
								if (typeof (data) != 'undefined' && (typeof (data.handler) != 'undefined' || data instanceof Array)) {
									if (formatHandler.type == 'func') {
										var cbData = data.handler(element,ite);
										var cellData = cbData;
										if($(cbData).length > 0){
											cellData = $(cbData).html() != 'undefined' ? $(cbData).html() : cbData;
										}
										setObj(obj, [config.headerJson[key].title], cellData);
									} else {
										var cbData = baseDataTable.formatHandler[formatHandler.type](element, ite, meta, data);
										var cellData = $(cbData).html() != 'undefined' ? $(cbData).html() : cbData;
										setObj(obj, [config.headerJson[key].title], cellData);
									}
								} else {
									try {
										if ($.inArray(formatHandler.type, getForDataSource) == -1) {
											var cellData = baseDataTable.formatHandler[formatHandler.type](element, ite, meta, formatDate);
											setObj(obj, [config.headerJson[key].title], cellData);
										} else {
											setObj(obj, [config.headerJson[key].title], element);
										}
									} catch (error) {
										setObj(obj, [config.headerJson[key].title], element);
									}
								}
							}
						} else {
							setObj(obj, [config.headerJson[key].title], element);
						}
					}
				}
			}
			wsData.push(obj);
		});
		return wsData;
	}
	//赋值
	function setObj(obj, eleName, value) {
		if (typeof obj != 'undefined' && $.trim(eleName) != '') {
			obj[eleName] = typeof value == 'number' && value.toString().length >= 12 ? value.toString() : value;
		}
	}
	//根据数据分页
	function getWsArr(dataSource) {
		config.wsDatas = {};
		config.sheetName = [];
		$.each(dataSource, function (i, ite) {
			if (typeof config.sheetFilter(ite) == 'object') {
				config.wsDatas[config.sheetFilter(ite).sheetName || ('sheet ' + (i + 1))] = [];
				config.wsDatas[config.sheetFilter(ite).sheetName || ('sheet ' + (i + 1))].push(ite);
			}
		});
		for (var key in config.wsDatas) {
			if (config.wsDatas.hasOwnProperty(key)) {
				var element = config.wsDatas[key];
				var ws = XLSX.utils.json_to_sheet(getWsData(element), { header: config.header, cellDates: true });
				config.sheetName.push(key);
				config.wsArr.push(ws);
			}
		}
	}
	//获取未选中表格数据
	function getNotSelectData() {
		var notSelectData = [];
		var cTrs = $('tr[class]:not("tr.selected")');
		$.each(cTrs, function (index, cTr) {
			notSelectData.push(baseDataTable.table[config.tableId].row(cTr).data());
		});
		console.log(notSelectData);
		return notSelectData;
	}
	//导出
	function writeFile() {
		var write_opts = {};
		if (config.ext == 'xls') {
			write_opts.bookType = "xlml";
		} else {
			write_opts.bookType = config.ext;
		}
		var html;
		if(!config.sheets){
			XLSX.utils.book_append_sheet(config.wb, config.wsArr[0], config.sheetName);
			html = config.wb;
		}else{
			//如果开启分页，则遍历添加到wb中
			$.each(config.wsArr, function (index, item) {
				XLSX.utils.book_append_sheet(config.wb, item, typeof (config.sheetName[index]) != 'undefined' ? config.sheetName[index] : "sheet_" + index);
			});
			html = config.wb;
		}
		if(config.html){
			/*$('#'+config.tableId+' thead').prepend(config.html);
			if($('#'+config.tableId+' tbody tr').children('th').length > 0){
				$('#'+config.tableId+' tbody tr').children('th').remove();
				$('#'+config.tableId+' thead tr:last').children('th').eq(0).remove();
			}

			var dataWorkSheet = html.Sheets['sheet_1'];
			var elt = document.getElementById(config.tableId);	
			var worksheet = XLSX.utils.table_to_sheet(elt, {sheet:"Sheet JS"});

			for(var sheetI in worksheet){
				if(!$.isEmptyObject(worksheet[sheetI])){
					if(worksheet[sheetI].t == 'n'){
						worksheet[sheetI] = dataWorkSheet[sheetI];
					}
				}
			}

			//console.log(worksheet);
			
			worksheet.A1.s = {alignment: {horizontal: "center", vertical: "center"} };
			worksheet['!cols'] = dataWorkSheet['!cols'];

			html.Sheets['sheet_1'] = worksheet;*/
			html.Sheets['sheet_1'].A1.s = {alignment: {horizontal: "center", vertical: "center"} };
			html.Sheets['sheet_1']['!merges'] = [
				{
					e:{r:0,c:(config.header.length-1)},
					s:{r:0,c:0}
				},{
					e:{r:0,c:(config.header.length-1)},
					s:{r:0,c:0}
				}
			];
		}
		//return;

		XLSX.writeFile(html, config.excelName + '.' + config.ext, write_opts);
		//导出完清空
		config.wb = null;
	}
	return {
		getexcel: getexcel,
		json_to_excel: json_to_excel,
		aoa_to_excel: aoa_to_excel
	};
})(jQuery);