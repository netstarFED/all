var nsRenderTable = (function(){
	//输出表头数据
	function getTheadHtml(theadArray){
		var theadHtml = '';
	 	//列宽
	 	var totalWidth = 0;
	 	var columnWidthArray = [30,50,35,40,40,40,40,40];
	 	for(var totalI=0; totalI<columnWidthArray.length; totalI++){
	 		totalWidth += columnWidthArray[totalI];
	 	}
	 	theadHtml += '<tr class="first-rowth"><th width="0"></th>';
	 	for(var widthI=0; widthI<columnWidthArray.length; widthI++){
	 		var tdWidth = columnWidthArray[widthI]/totalWidth*100;
			tdWidth = parseInt(tdWidth*100)/100;
			var widthStr = tdWidth +'%';
	 		theadHtml += '<th width="'+widthStr+'"></th>';
	 	}
	 	theadHtml += '</tr>';

	 	for(var thRowI=0; thRowI<theadArray.length; thRowI++){
	 		theadHtml += '<tr><th></th>';
	 		var sortingHtml = '';
	 		for(var thColI=0; thColI<theadArray[thRowI].length; thColI++){
	 			if(theadArray[thRowI][thColI].isRender){
	 				//允许输出渲染
	 				theadHtml += '<th class="th-text" th-colindex="'+thColI+'" th-rowindex="'+thRowI+'" rowspan="'+theadArray[thRowI][thColI].rowspan+'" colspan="'+theadArray[thRowI][thColI].colspan+'">'
	 								+'<div class="text-content">'+theadArray[thRowI][thColI].text+'</div>'
	 							+'</th>';
	 			}
	 		}
	 	}
	 	return theadHtml;
	}
	//输出行数据
	function getTbodyHtml(tbodyArray){
		var rowHeightArray = [40,40,40,40];
		var tbodyHtml = '';
	 	for(var rowI=0; rowI<tbodyArray.length; rowI++){
	 		tbodyHtml += '<tr><td ns-rowindex="'+rowI+'" class="first-rowtd" style="'+rowHeightArray[rowI]+'px"></td>';
	 		for(var colI=0; colI<tbodyArray[rowI].length; colI++){
	 			if(tbodyArray[rowI][colI].isRender){
	 				//允许输出渲染
	 				tbodyHtml += '<td class="td-'+tbodyArray[rowI][colI].datatype+'" rowspan="'+tbodyArray[rowI][colI].rowspan+'" colspan="'+tbodyArray[rowI][colI].colspan+'">'
	 								+'<div>'+tbodyArray[rowI][colI].text+'</div>'
	 							+'</td>';
	 			}
	 		}
	 		tbodyHtml += '</tr>';
	 	}
	 	return tbodyHtml;
	}
	//刷新列表数据
	function getTwoDyadicArrays(tableId){
		var configObj = nsRenderTable[tableId];
		var $table = configObj.container.$table;
		var theadData = configObj.theadData;
		var dataArray = $.extend(true,[],configObj.originalDataArray);
		var columnArray = theadData.levelArray[theadData.levelTotal-1];
		var rowsDataArray = [];
		//console.log(theadData)
		function getRowData(dataArray){
			var rowsArray = [];
			for(var dataI=0; dataI<dataArray.length; dataI++){
				//读取行数据
				var rData = $.extend(true,{},dataArray[dataI]);
				var rowArray = [];
				for(var colI=0; colI<columnArray.length; colI++){
					var columnData = columnArray[colI];
					if(columnData.level > 1){
						var keyField = columnData.field.split('.');
						rowArray.push(rData[keyField[0]][columnData.index][keyField[1]]);
					}else{
						rowArray.push(rData[columnData.field]);
					}
				}
				rowsArray.push(rowArray);
			}
			return rowsArray;
		}
		console.log(configObj)
		var rowsDataArray = getRowData(dataArray);
		var combineRowData = getRowDataByCombine(rowsDataArray);
		configObj.combineRowData = combineRowData;
		configObj.rowsData = $.extend(true,[],rowsDataArray);

		var theadHtml = getTheadHtml(theadData.rowTitleArray);
	 	var tbodyHtml = getTbodyHtml(combineRowData);
	 	tbodyHtml = '<tbody>'+tbodyHtml+'</tbody>';
	 	theadHtml = '<thead>'+theadHtml+'</thead>';
	 	$table.html(theadHtml+tbodyHtml);
		/*var theadHtml = getTheadHtml(theadData.rowTitleArray);
		$table.html('<thead>'+theadHtml+'</thead><tbody></tbody>');*/
	}
	//ajax方式刷新数据
	function getListDataByAjax(tableId){
		//定义了src需要发送ajax请求
		var dataConfig = nsRenderTable[tableId].originalConfig.dataConfig;
		var listAjax = {
			url:dataConfig.src,
			data:dataConfig.data,
			type:dataConfig.type,
			plusData:dataConfig,
			contentType:'application/json; charset=utf-8'
		}
		nsVals.ajax(listAjax,function(res,ajaxObj){
			var plusData = ajaxObj.plusData;
			var data = res[plusData.dataSrc];
			nsRenderTable[tableId].originalDataArray = $.extend(true,[],data);
			getTwoDyadicArrays(plusData.tableID);
		});
	}
	//处理是否合并行数据
	function getRowDataByCombine(data){
		var rowsArray = data;
 		var outputArray = [];
 		var rowspanArray = [];
 		var columnspanArray = [];
 		var renderArray = [];
 		/*switch(type){
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
 		}*/
 		for(var rowI=0; rowI<rowsArray.length; rowI++){
 			var colsArray = rowsArray[rowI];
 			var outputColArray = [];
 			for(var colI=0; colI<colsArray.length; colI++){
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
 				var isAllowRowspan = typeof(rowspanArray[rowI]) == 'boolean' ? rowspanArray[rowI] : true;
 				var isAllowColspan = typeof(columnspanArray[colI]) == 'boolean' ? columnspanArray[colI] : true;
 				var renderData = renderArray[colI]; 
 				var dataType = typeof(renderData) == 'function' ? 'function' : renderData; 
 				var text = colsArray[colI];
 				switch(dataType){
 					case 'function':
 						text = renderData();
 						break;
 					case 'money':
 						text = baseDataTable.formatMoney(text);
 						break;
 					case 'date':
 						text = commonConfig.formatDate(new Date(text).getTime(),'YYYY-MM-DD');
 						break;
 					case 'datetime':
 						text = commonConfig.formatDate(new Date(text).getTime(),'YYYY-MM-DD HH:mm:ss');
 						break;
 					default:
 						break;
 				}
 				var outputColJson = {
 					row:rowI,
 					col:colI,
 					text:text,
 					datatype:dataType,
 					colspan:1,
 					rowspan:1,
 					isRender:true,
 					isAllowColspan:isAllowColspan,
 					isAllowRowspan:isAllowRowspan,
 					isAllowCombine:true,
 					isAllowedCombine:true,
 				};
 				outputColArray.push(outputColJson);
 			}
 			outputArray.push(outputColArray);
 		}
 		var returnArray = [];
 		outerRow:
 		for(var outRowI=0; outRowI<outputArray.length; outRowI++){
 			var returnColArray = [];
 			//开始读取每行中td数据
 			interCol:
 			for(var outColI=0; outColI<outputArray[outRowI].length; outColI++){
 				var currentData = $.extend({},outputArray[outRowI][outColI]);//克隆数据
 				returnColArray.push(currentData);
 				//当前元素是否渲染
					if(outputArray[outRowI][outColI].isRender == false){
						continue;
					}
					var currentText = outputArray[outRowI][outColI].text;//文本值
					var colspanIDs = [outColI];//合并列
					if(outputArray[outRowI][outColI].isAllowColspan){
						//允许列合并
						for(var nextOutColI=outColI+1; nextOutColI<outputArray[outRowI].length; nextOutColI++){
							if(outputArray[outRowI][nextOutColI].isRender == false || outputArray[outRowI][nextOutColI].isAllowColspan == false){
								continue;
							}
							if(currentText == outputArray[outRowI][nextOutColI].text){
								colspanIDs.push(nextOutColI);
								currentData.colspan ++;
								outputArray[outRowI][nextOutColI].isRender = false;
							}else{
								break;
							}
						}
					}
					if(outputArray[outRowI][outColI].isAllowRowspan){
						//允许行合并
						var nextOutrowIndex = outRowI + 1;
						if(nextOutrowIndex == outputArray.length){
						continue;
						}
						outNextRow://下一行标记
						for(nextOutrowIndex; nextOutrowIndex<outputArray.length; nextOutrowIndex++){
							outNextCol://下一列标记
							for(var outColIndex = 0; outColIndex<colspanIDs.length; outColIndex++){
 							if(outputArray[nextOutrowIndex][colspanIDs[outColIndex]].isRender == false || outputArray[nextOutrowIndex][colspanIDs[outColIndex]].isAllowRowspan == false){
								break outNextRow;
							}
							if(outputArray[nextOutrowIndex][colspanIDs[outColIndex]].isAllowColspan == false){
								break outNextRow;
							}
							if(currentText != outputArray[nextOutrowIndex][colspanIDs[outColIndex]].text){
								break outNextRow;
 							}
 						}
 						currentData.rowspan ++;
 						for(var outColIndex = 0; outColIndex<colspanIDs.length; outColIndex++){
 							outputArray[nextOutrowIndex][colspanIDs[outColIndex]].isRender = false;
 						}
						}
					}
 				
 			}
 			returnArray.push(returnColArray);
 		}
 		return returnArray;
	}
	//通过列配置数据获取到合并列数据
	function getCombineTheadDataByColumn(columnConfig){
		var levelTotal = 1;//总几层
		var theadArray = $.extend(true,[],columnConfig);//克隆列配置数据
		//递归循环输出表头有几层
		function getColumnData(columnArray,level){
			var titleLength = 0;//标题输出个数
			if(!$.isArray(columnArray)){
				//如果不是数组返回输出
				return 1;
			}
			if(level > levelTotal){
				levelTotal = level;
			}
			for(var columnI=0; columnI<columnArray.length; columnI++){
				var columnData = columnArray[columnI];
				var times = 1;
				if($.isArray(columnData.title)){
					times = columnData.title.length;//计算共输出几次
				}
				var childSize = getColumnData(columnData.children, level+1);
				columnData.titleLength = childSize;
				columnData.level = level;
				columnData.subIndex = columnI;
				titleLength += (times * childSize);
			}
			return titleLength;
		}
		//递归循环子数据
		function getChildrenByLevel(parent,children,targetLevel,currentLevel,nIndex){
			if(!children){
				parent.index = nIndex;
				return [parent];
			}
			if(targetLevel == currentLevel){
				var childArray = [];
				for(var cI=0; cI<children.length; cI++){
					var json = $.extend(true,{},children[cI]);
					json.index = nIndex;
					childArray.push(json);
				}
				return childArray;
			}
			var array = [];
			for(var i = 0; i < children.length; i++){
				var child = children[i];
				var times = 1;
				if($.isArray(child.title)){
					times = child.title.length;
				}
				while(times > 0){
					array = array.concat(getChildrenByLevel(child, child.children, targetLevel, currentLevel + 1,times));
					times--;
				}
			}
			return array;
		}
		//根据层数输出标题行
		function convertToColumns(root, maxLevel){
			var rows = [];
			for(var level = 0; level < maxLevel; level++){
				var columns = [];
				for(var i = 0; i < root.length; i++){
					var node = root[i];
					if(level == 0){
						columns.push(node);
					} else {
						var times = 1;
						if($.isArray(node.title)){
							times = node.title.length;
						}
						for(var timeI=0; timeI<times; timeI++){	
							columns = columns.concat(getChildrenByLevel(node,node.children,level,1,timeI));
						}
					}
				}
				rows.push(columns);
			}
			return rows;
		}
		var columnTotal = getColumnData(theadArray,1);//递归循环输出总共有几列
		var levelArray = convertToColumns(theadArray,levelTotal);//存放每一层数据值
		var titleArray = [];//存放每层标题
		for(var levelI=0; levelI<levelArray.length; levelI++){
			var cLevelArray = [];
			var levelData = levelArray[levelI];
			for(var colI=0; colI<levelData.length; colI++){
				var cData = levelData[colI];
				if($.isArray(cData)){
					for(var c=0; c<cData.length; c++){
						cLevelArray.push(cData[c].title);
					}
				}else{
					if(cData.titleLength > 1){
						for(var titleI=0; titleI<cData.title.length; titleI++){
							for(var numI=0; numI<cData.titleLength; numI++){
								cLevelArray.push(cData.title[titleI]);
							}
						}
					}else{
						cLevelArray.push(levelData[colI].title);
					}
				}
			}
			titleArray.push(cLevelArray);
		}
		rowTitleArray = getRowDataByCombine(titleArray);
		var theadJson = {
			levelTotal:levelTotal,
			titleArray:titleArray,
			theadArray:theadArray,
			levelArray:levelArray,
			columnTotal:columnTotal,
			rowTitleArray:rowTitleArray,
		}
		return theadJson;
	}
	//得到合并行数据格式通过给出的数据格式
	function getCombineDataByListData(tableId){
		
	}
	function init(dataConfig,columnConfig,uiConfig,btnConfig){
		var tableId = dataConfig.tableID;//表格id
		var primaryId = dataConfig.primaryID;//主键id
		nsRenderTable[tableId] = {};
		var originalConfig = {
			dataConfig:		$.extend(true, {}, dataConfig),
			columnConfig:	$.extend(true, [], columnConfig),	
			uiConfig:		$.extend(true, {}, uiConfig),
			btnConfig:		$.extend(true, {}, btnConfig),
		};
		var containerHeight = uiConfig.containerHeight;//容器的高度
		var $table;//表格
		var $container = uiConfig.$container;//表格的容器
		var pageLengthMenu = 10;//每页显示条数
		var tableContainerType; //获取容器类型 
		var tableHeightType;//高度模式类型 return string 'compact' 'wide'
		/*****************列配置参数 start***********************/
		//复杂表头按层次分
		var theadData = getCombineTheadDataByColumn(columnConfig);
		/*****************列配置参数 end***********************/
		/*****************计算固定行 start***********************/
		function getAutoRowsNumber(){
			uiConfig.$table = $table;
			tableContainerType = baseDataTable.getTableContainerType(uiConfig);
			tableHeightType = baseDataTable.setTableHeightType(uiConfig);
			pageLengthMenu = baseDataTable.getAutoRowsNumber(dataConfig, columnConfig, uiConfig, btnConfig);
		}
		/*****************计算固定行 end***********************/
		/**********容器面板 start*****************/
		function getContainerHtml(){
			//输出表格容器面板
			var styleStr = '';//表格容器高度
			if(containerHeight){
				//定义了表格容器高度
				styleStr = 'style="height:'+containerHeight+'px"';
			}
			//表格class配置
			var tableResponsiveClass = "table-responsive";
			var tableClass = "table table-hover table-bordered table-striped";
			if(uiConfig.browerSystem == 'pc'){
				//当前浏览器是电脑端
				if(typeof(nsUIConfig)=='object'){
					// 并且自定义了表格行高配置模式
					if(nsUIConfig.tableHeightMode == 'compact'){
						tableClass += ' table-sm';
						tableResponsiveClass += ' table-responsive-sm';
					}
				}
			}
			//输出表格html
			var tabelHtml = '<div class="'+tableResponsiveClass+'" '+styleStr+'>'
							+'<table cellspacing="0" class="'+tableClass+'" id="'+tableId+'">'
							+'</table>'
						+'</div>';
			return tabelHtml;
		}
		//是否存在容器面板
		if($container){
			//存在容器面板则需要填充html内容
			var tableHtml = getContainerHtml();
			$container.html(tableHtml);
			$table = $('#'+tableId);
		}else{
			$table = $('#'+tableId);
			$container = $table.closest('.table-responsive').parent();
			if($container.length == 0){
				$container = $table.parent();
			}
		}
		/**********容器面板 end*****************/
		/************设置配置参数 start*************************/
		getAutoRowsNumber();
		nsRenderTable[tableId] = {
			container:{
				$container:$container,
				$table:$table,
			},
			tableContainerType:tableContainerType,
			tableHeightType:tableHeightType,
			originalConfig:originalConfig,//存放原始参数
			primaryId:primaryId,		//主键id
			originalDataArray:[],		//列表原始数据值 
			pageLengthMenu:pageLengthMenu,//每页显示条数
			pageIndexArr:[0,pageLengthMenu],//当前页起始条数和结束条数
			currentPage:1,//当前页默认第一页
			pageLength:1,//分几页显示
			pageTotalId:tableId+'-info',//总条数容器id
			paginateId:tableId+'-paginate',//页码容器id
			theadData:theadData,//表头配置参数
			///columns:columns,  				//列基础数据 object格式 取值用
			//columnArray:columnArray,  			//列基础数据 array格式  循环用
		}
		/************设置配置参数 end*************************/
		/************输出列表 html start**********************/
		if(dataConfig.src){
			getListDataByAjax(tableId);
		}else{
			if($.isArray(dataConfig.dataSource)){
				nsRenderTable[tableId].originalDataArray = $.extend(true,[],dataConfig.dataSource);
				getTwoDyadicArrays(tableId);
			}
		}
		/***********输出列表 html end***********************/
	}
	return{
		init:								init,//初始化
		getCombineTheadDataByColumn:		getCombineTheadDataByColumn,//通过列配置数据获取到合并列数据
		getCombineDataByListData:			getCombineDataByListData,//得到合并行数据格式通过给出的数据格式
	}
})(jQuery);