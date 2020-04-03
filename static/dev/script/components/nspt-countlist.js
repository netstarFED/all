NetstarUI.countList = {
    config:{},
    //设置默认值
    setDefault:function(_config){
        var defaultParams = {
            isScroll:true,
            isAutojustWidth:true,//是否自适应宽度 默认true
            format:{
                handler:function(res){
                    return res;
                },//自定义处理返回对象
                dynamicColumns:{},//动态列的配置
                styleExpress:{},//列样式表达式
            },
            theadArray:[],//标题的输出
            tbodyArray:[],//行数据的输出
            outPutType:'rowColumn',//默认按一级行一级列的格式去输出  可配置为：columnTwoLevel,columnThirdLevel...
            dynamicColumnsArrByLevel2:{},//输出的动态列
            insertPositionJson:{},//在某个字段之后插入动态的列
            theadLevel:1,//标题列按普通一层输出
            theadCombine:[true],//一层列
            combineThColumnArray:[],//标题列是否允许列合并
            columnThRenderArray:[],//标题列渲染的类型
            combineRowArray:[],//行是否允许合并
            styleExpressByCol:{},
            columnStyleByRow:[],//列样式
            formatHandlerJson:{}
        };
        NetStarUtils.setDefaultValues(_config,defaultParams);
        if(_config.format.outPutType){
            _config.outPutType = _config.format.outPutType;
        }
        if(_config.format.rowCombineField){
            _config.rowCombineField = _config.format.rowCombineField;
        }
        for(var dynamicField in _config.format.dynamicColumns){
            var colArr = _config.format.dynamicColumns[dynamicField].fields;
            var insertPosition = _config.format.dynamicColumns[dynamicField].insertPosition;
            if($.isArray(colArr)){
                for(var colI=0; colI<colArr.length; colI++){
                    _config.dynamicColumnsArrByLevel2[colArr[colI]] = dynamicField;
                }
            }
            if(insertPosition){
                _config.insertPositionJson[insertPosition] = dynamicField;
            }
        }
        _config.format.dynamicColumns = typeof(_config.format.dynamicColumns)=='object' ? _config.format.dynamicColumns : {};
        var outPutType = _config.outPutType;
        //根据配置的数据  
        switch(outPutType){
            case 'columnTwoLevel':
                _config.theadLevel = 2;//两层标题列输出
                _config.theadCombine = [true,true];//默认输出两层标题列支持两层标题列合并
                break;
        }
    },
    getData:function(_config,type){
        var rowsArray = [];
        var outputArray = [];
        var rowspanArray = [];
        var columnspanArray = [];
        var renderArray = [];
        var columnStyleByRow = [];
        switch (type) {
            case 'th':
                rowspanArray = _config.theadCombine;
                columnspanArray = _config.combineThColumnArray;
                renderArray = _config.columnThRenderArray;
                rowsArray = _config.theadArray;
                break;
            case 'tr':
                rowspanArray = _config.combineRowArray;
                columnspanArray = _config.combineRowColumnArray;
                renderArray = _config.columnThRenderArray;
                rowsArray = _config.tbodyArray;
                columnStyleByRow = _config.columnStyleByRow;
                break;
            default:
                break;
        }
        var columnFieldArray = _config.columnFieldArray;
        var dynamicColumns = _config.format.dynamicColumns;
        var countListData = _config.countListData;
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
                var styleStr = {};
                var text = colsArray[colI];
                if(!$.isEmptyObject(columnStyleByRow[rowI])){
                   if(!$.isEmptyObject(columnStyleByRow[rowI][colI])){
                       styleStr = columnStyleByRow[rowI][colI];
                   }
                }
                switch (dataType) {
                    case 'button':
                        if(type == 'tr'){
                            text = '<button class="btn" type="button" ns-rowindex="'+rowI+'" ns-colindex="'+colI+'" ns-colfield="'+_config.columnNameFieldArray[colI]+'"><span>'+text+'</span></button>';
                        }
                        break;
                    case 'function':
                        text = renderData();
                        break;
                    default:
                        break;
                }
                var colFieldStr = '';
                if(dynamicColumns[columnFieldArray[colI]]){

                }else{
                    if(columnFieldArray[colI]){
                        colFieldStr = columnFieldArray[colI];
                    }
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
                    isAllowCombine: false,
                    isAllowedCombine: false,
                    styleStr:styleStr,
                    colField:colFieldStr,
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
                                            if(typeof(outputArray[nextOutrowIndex][colspanIDs[outColIndex]])=='undefined'){
                                                break outNextRow;
                                            }
                                            if (outputArray[nextOutrowIndex][colspanIDs[outColIndex]].isRender == false || outputArray[nextOutrowIndex][colspanIDs[outColIndex]].isAllowRowspan == false) {
                                                break outNextRow;
                                            }
                                            if (outputArray[nextOutrowIndex][colspanIDs[outColIndex]].isAllowColspan == false) {
                                                break outNextRow;
                                            }
                                            if (currentText != outputArray[nextOutrowIndex][colspanIDs[outColIndex]].text) {
                                                break outNextRow;
                                            }
                                            if(type == 'tr' && _config.rowCombineField){
                                                var nextRowIndex = outputArray[nextOutrowIndex][colspanIDs[outColIndex]].row;
                                                var cRowIndex = outputArray[outRowI][colspanIDs[outColIndex]].row;
                                                if(countListData[nextRowIndex][_config.rowCombineField] != countListData[cRowIndex][_config.rowCombineField]){
                                                    break outNextRow;
                                                }
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
    },
    getTbodyData:function(_config){
        var dataArray = _config.countListData;
        var columnFieldArray = _config.columnFieldArray;
        var tbodyArray = [];
        var dynamicColumns = _config.format.dynamicColumns;
        var styleExpressByCol = _config.styleExpressByCol;
        var columnStyleByRow = _config.columnStyleByRow;
        var combineRowArray = _config.combineRowArray;
        for(var dataI=0; dataI<dataArray.length; dataI++){
            var data = dataArray[dataI];
            var rowArr = [];
            var columnStyle = [];
            for(var colI=0; colI<columnFieldArray.length; colI++){
                var colField = columnFieldArray[colI];
                if(dynamicColumns[colField]){
                    var dynamicData = dynamicColumns[colField];
                    var fields = dynamicData.fields;
                    if($.isArray(data[dynamicData.keyField])){
                        var pushArr = data[dynamicData.keyField];
                        for(var p=0; p<pushArr.length; p++){
                            var pushData = pushArr[p];
                            for(var f=0; f<fields.length; f++){
                                var fieldStr = fields[f];
                                var pushDataStr = pushData[fieldStr];
                                if(typeof(pushDataStr)=='undefined'){pushDataStr = '';}
                                rowArr.push(pushDataStr);
                                if($.isEmptyObject(styleExpressByCol[fieldStr])){
                                    columnStyle.push(null);
                                }else{
                                    var expressData = $.extend(true,{},data);
                                    NetStarUtils.setDefaultValues(expressData,pushData)
                                    var styleStr = NetStarUtils.getStyleByCompareValue({
                                        rowData: expressData,
                                        tdField: fieldStr,
                                        styleExpress: styleExpressByCol[fieldStr]
                                    });
                                    columnStyle.push(styleStr);
                                }
                            }
                        }
                        if(pushArr.length != dynamicData.length){
                            var appendLength = dynamicData.length - pushArr.length;
                            for(var p=0; p<appendLength; p++){
                                for(var f=0; f<fields.length; f++){
                                    rowArr.push('');
                                }
                            }
                        }
                    }else{
                        if(typeof(dynamicData.length)=='number'){
                            for(var p=0; p<dynamicData.length; p++){
                                for(var f=0; f<fields.length; f++){
                                    rowArr.push('');
                                }
                            }
                        }
                    }
                }else{
                    var dataStr = data[colField];
                    if(typeof(dataStr)=='undefined'){
                        dataStr = '';
                        if(_config.columnsId[colField]){
                            if(!$.isEmptyObject(_config.columnsId[colField].formatHandler)){
                                if(_config.columnsId[colField].formatHandler.type == 'button'){
                                    dataStr = _config.columnsId[colField].title;
                                }
                            }
                        }
                    }
                    rowArr.push(dataStr);
                    if($.isEmptyObject(styleExpressByCol[colField])){
                        columnStyle.push(null);
                    }else{
                        var styleStr = NetStarUtils.getStyleByCompareValue({
                            rowData: data,
                            tdField: colField,
                            styleExpress: styleExpressByCol[colField]
                        });
                        columnStyle.push(styleStr);
                    }
                }
            }
            tbodyArray.push(rowArr);
            columnStyleByRow.push(columnStyle);
            combineRowArray.push(true);
            if(dataI > 0 && dataI < dataArray.length){
                if(_config.rowCombineField){
                    if(data[_config.rowCombineField] != dataArray[dataI-1][_config.rowCombineField]){
                        //combineRowArray[dataI] = false;
                    }
                }
            }
        }
        return tbodyArray;
    },
    initList:function(_config){
        var insertPositionIndexArr = _config.insertPositionIndexArr;
        var dynamicColumns = _config.format.dynamicColumns ? _config.format.dynamicColumns : {};
        var countListData = _config.countListData;
        var columnsId = _config.columnsId;
        if(insertPositionIndexArr.length > 0){
            for(var i=0; i<insertPositionIndexArr.length; i++){
                var colField  = insertPositionIndexArr[i].field;
                var insertIndex = insertPositionIndexArr[i].index;
                if(dynamicColumns[colField]){
                    //定义了动态列的输出
                    _config.columnFieldArray.splice(insertIndex+1,0,colField);
                    var dynamicColumnsConfig = dynamicColumns[colField];
                    
                    var dynamicRowFirstData = countListData[0][dynamicColumnsConfig.keyField];
                    if(!$.isArray(dynamicRowFirstData)){dynamicRowFirstData = countListData[1][dynamicColumnsConfig.keyField]}
                    var dLength = 0;
                    for(var c=0; c<countListData.length; c++){
                        var dArr = countListData[c][dynamicColumnsConfig.keyField];
                        if($.isArray(dArr)){
                            if(dArr.length > dLength){
                                dLength = dArr.length;
                                dynamicRowFirstData = dArr;
                            }
                        }
                    }

                    dynamicColumnsConfig.length = dynamicRowFirstData.length;
                    var fieldsLength = 0;
                    if($.isArray(dynamicColumnsConfig.fields)){
                        fieldsLength = dynamicColumnsConfig.fields.length;
                    }
                    var afterIndex = insertIndex+1;
                    var dynamicColArr = dynamicColumnsConfig.fields;
                    for(var f=dynamicRowFirstData.length-1; f>-1; f--){
                        if(fieldsLength > 1){
                            for(var e=0; e<fieldsLength; e++){
                                var columnData = _config.columnsId[dynamicColArr[e]] ? _config.columnsId[dynamicColArr[e]] : _config.columnsId[colField];
                                _config.columnWidthArray.splice(insertIndex+1,0,columnData.width);
                                _config.totalWidth += columnData.width;
                                _config.levelOneTitleArr.splice(insertIndex+1,0,dynamicRowFirstData[f][colField]);
                                _config.levelTwoTitleArr.splice(afterIndex,0,columnData.title);
                                var isColumnCombine = typeof(columnData.isColumnCombine)=='boolean' ? columnData.isColumnCombine : false;
                                var dataType = typeof(columnData.columnType)=='boolean' ? columnData.columnType : 'text';
                                _config.combineRowColumnArray.splice(insertIndex+1,0,isColumnCombine);
                                _config.combineThColumnArray.splice(insertIndex+1,0,true);
                                _config.columnThRenderArray.splice(insertIndex+1,0,dataType);
                                afterIndex++;
                            }
                        }else{
                            _config.levelOneTitleArr.splice(insertIndex+1,0,dynamicRowFirstData[f][colField]);
                            _config.levelTwoTitleArr.splice(insertIndex+1,0,dynamicRowFirstData[f][colField]);
                            var columnData = _config.columnsId[dynamicColArr[0]] ? _config.columnsId[dynamicColArr[0]] : _config.columnsId[colField];
                            _config.columnWidthArray.splice(insertIndex+1,0,columnData.width);
                            _config.totalWidth += columnData.width;
                            var isColumnCombine = typeof(columnData.isColumnCombine)=='boolean' ? columnData.isColumnCombine : false;
                            var dataType = typeof(columnData.columnType)=='boolean' ? columnData.columnType : 'text';
                            _config.combineRowColumnArray.splice(insertIndex+1,0,isColumnCombine);
                            _config.combineThColumnArray.splice(insertIndex+1,0,true);
                            _config.columnThRenderArray.splice(insertIndex+1,0,dataType);
                        }
                    }
                }
            }
        }

       
        if(_config.theadLevel == 2){
            _config.theadArray = [_config.levelOneTitleArr,_config.levelTwoTitleArr];
        }
        var theadData = this.getData(_config,'th');
        _config.theadData = theadData;

        _config.tbodyArray = this.getTbodyData(_config);
        _config.tbodyData = this.getData(_config,'tr');
        function getTheadHtml(){
            //列宽
            var theadHtml = '<tr class="first-rowth"><th width="0"></th>';
            for (var widthI = 0; widthI < _config.columnWidthArray.length; widthI++) {
                var tdWidth = _config.columnWidthArray[widthI] / _config.totalWidth * 100;
                tdWidth = parseInt(tdWidth * 100) / 100;
                var widthStr = tdWidth + '%';
                theadHtml += '<th width="' + widthStr + '"></th>';
            }
            theadHtml += '</tr>';
    
            for (var thRowI = 0; thRowI < _config.theadData.length; thRowI++) {
                theadHtml += '<tr><th></th>';
                for (var thColI = 0; thColI < _config.theadData[thRowI].length; thColI++) {
                    var thData = _config.theadData[thRowI][thColI];
                    if (thData.isRender) {
                        //允许输出渲染
                        theadHtml += '<th class="th-' + thData.datatype + '" th-colindex="' + thColI + '" th-rowindex="' + thRowI + '" rowspan="' + thData.rowspan + '" colspan="' + thData.colspan + '">'
                                        +'<div class="text-content">' + thData.text + '</div>'
                                    '</th>';
                    }
                }
            }
            theadHtml = '<thead>'+theadHtml+'</thead>'
            return theadHtml;
        }
        function getTbodyHtml(){
            var tbodyHtml = '';
            for (var rowI = 0; rowI < _config.tbodyData.length; rowI++) {
                var trClassStr = '';
                tbodyHtml += '<tr class="' + trClassStr + '" ns-rowindex="' + rowI + '"><td ns-rowindex="' + rowI + '" class="first-rowtd" style="40px"></td>';
                for (var colI = 0; colI < _config.tbodyData[rowI].length; colI++) {
                    var tData = _config.tbodyData[rowI][colI];
                    if (tData.isRender) {
                        //允许输出渲染
                        var styleStr = tData.styleStr;
                        var styleCss = '';
                        for(var styleI in styleStr){
                            styleCss += styleI+':'+styleStr[styleI]+';';
                        }
                        var outputStyle = '';
                        if(styleCss){
                            outputStyle = 'style='+styleCss;
                        }
                        var tdContentHtml = '<div>' + tData.text + '</div>';
                        /****lyw 通过列配置获取显示数据及显示数据html start****/
                        if(columnsId[tData.colField]){
                            var columnConfig = columnsId[tData.colField];
                            var showText = NetStarGrid.dataManager.getValueByColumnType(tData.text, countListData[rowI], columnConfig);
                            switch(columnConfig.columnType){
                                case 'href':
                                    var hrefConfig = {
                                        countListId : _config.id,
                                        colField : tData.colField,
                                        rowIndex : rowI,
                                        colIndex : colI,
                                        value : tData.text,
                                        text : showText,
                                    }
                                    var hrefConfigStr = JSON.stringify(hrefConfig);
                                    tdContentHtml = "<a href='javascript:void(0);' onclick='NetstarUI.countList.rowHrefLinkJump("+hrefConfigStr+")'>"+showText+"</a>";
                                    break;
                                default:
                                    tdContentHtml = '<div>' + showText + '</div>';
                                    break;
                            }
                        }
                        /****lyw 通过列配置获取显示数据及显示数据html end******/
                        tbodyHtml += '<td class="td-' + tData.datatype + '" rowspan="' + tData.rowspan + '" '+outputStyle+' colspan="' + tData.colspan + '">' 
                                        + tdContentHtml +
                                    '</td>';
                    }
                }
                tbodyHtml += '</tr>';
            }
            tbodyHtml = '<tbody>'+tbodyHtml+'</tbody>'
            return tbodyHtml;
        }
        var theadHtml = getTheadHtml();
        var tbodyHtml = getTbodyHtml();
        var $tableContainer = $('#'+_config.id);
        
        // $table.html(theadHtml+tbodyHtml);
        var beforeHtml = '';
        var afterHtml = '<div class="customer-table-input-component"></div>';
        var tWidth = _config.totalWidth+'px';
        if(_config.isAutojustWidth && _config.isScroll !== true){
            tWidth = '100%';
        }
		// $table.css({
		// 	'width': tWidth
        // });
        var tableId = _config.id + '-table';
        var scrollYId = _config.id + '-scroll-y';
        var scrollXId = _config.id + '-scroll-x';
        _config.tableId = tableId;
        _config.scrollYId = scrollYId;
        _config.scrollXId = scrollXId;
        var tableHtml = '<table class="table table-hover table-striped table-singlerow table-bordered table-sm scroll-table" style="width:'+ tWidth +'" id="'+ tableId +'">'
                            + theadHtml
                            + tbodyHtml
                        + '</table>'
                        + afterHtml
        if (typeof (_config.isScroll) == 'boolean') {
			if (_config.isScroll) {
                var containerWidth = $(window).outerWidth() - 180;
                var avaHeight = $(window).outerHeight()-100;
                /**lyw注释start */
				// $table.parent().css({
				// 	overflow: "hidden",
				// 	height: avaHeight+'px',
				// 	width: containerWidth + "px"
                // });
				// $table.before('<div class="scroll-panel-table-copy" style="height:'+avaHeight+'px;overflow:auto"></div>');
				// var $div = $('.scroll-panel-table-copy');
				// $div.html($table);
				// var html = '<div class="scroll-panel nspanel layout-customertable-copy" style="position:absolute;z-index:1;left:0px;width:' + containerWidth + 'px"><table id="scroll-table" cellspacing="0" class="table table-hover table-striped table-singlerow table-bordered table-sm scroll-table">' +
				// 	theadHtml +
				// 	'</table></div>';
				// $table.parent().before(html);
                /**lyw注释end */
				/*$('.scroll-panel .scroll-table').css({
					width: _config.totalWidth + 'px',
					position: 'absolute',
					top:0,
					left:0,
				});
				$('.scroll-panel-table').on('scroll', function (ev) {
					var scrollLeft = ev.target.scrollLeft;
					$('.scroll-panel').css({
						left: -scrollLeft + 'px'
					});
                })*/
                var positionObj = $tableContainer.position()
                var scrollXTop = positionObj.top+avaHeight-9;
                var scrollYTop = positionObj.top;
                if(_config.outPutType == "rowColumn"){
                    avaHeight -= 39;
                    // scrollXTop += 39;
                    scrollYTop += 39;
                }
                $tableContainer.css({
                    overflow: "hidden",
                    height: avaHeight+'px',
                    width: containerWidth + "px"
                });
                var scrollXClass = 'hide';
                if(containerWidth < _config.totalWidth){
                    scrollXClass = '';
                }
                beforeHtml = '<div class="scroll-panel nspanel layout-customertable-copy" style="left:0px;width:' + containerWidth + 'px">'
                                + '<table cellspacing="0" class="table table-hover table-striped table-singlerow table-bordered table-sm scroll-table" style="width:'+ tWidth +'">'
                                        + theadHtml
                                + '</table>'
                            + '</div>'
                tableHtml = '<div class="scroll-panel-table-copy" style="height:'+avaHeight+'px;">'
                                + tableHtml
                            + '</div>'
                            // 横向滚动条
                            + '<div nsgirdcontainer="grid-body-scroll-x" class="grid-body-scroll-x '+ scrollXClass +'" id="'+ scrollXId +'" style="top:'+ scrollXTop +'px;width:' + (containerWidth-1) + 'px;height:8px;">'
                                + '<div class="grid-body-scroll-x-div" style="width:'+ tWidth +';height:8px;"></div>'     
                            + '</div>'
                            // 纵向滚动条
                            + '<div nsgirdcontainer="grid-body-scroll-y" class="grid-body-scroll-y" id="'+ scrollYId +'" style="right:1px;top:'+ scrollYTop +'px;height:'+(avaHeight-1)+'px;">'
                                + '<div class="grid-body-scroll-y-div" style="height:'+ avaHeight +'px;"></div>'     
                            + '</div>'
                
			}
        }
        var tableContentHtml = beforeHtml + tableHtml;
        $tableContainer.html(tableContentHtml);
        // $table.after('<div class="customer-table-input-component"></div>');
        var $table = $('#' + tableId);
        if (_config.isScroll === true) {
            // 插入后设置纵向滚动条
            var tableHeight = $table.height();
            var isScrollX = false;
            var isScrollY = false;
            if(containerWidth < _config.totalWidth){
                isScrollX = true;
            }
            if(avaHeight < tableHeight){
                isScrollY = true;
            }
            if(isScrollX){
                var $scrollX = $('#' + scrollXId);
                $scrollX.scroll(function(ev){
                    var tableScrollLeft = $scrollX.scrollLeft();
                    var $headTable = $tableContainer.find('.scroll-panel');
                    var $tableParent = $table.parent();
                    $headTable.scrollLeft(tableScrollLeft);
                    $tableParent.scrollLeft(tableScrollLeft);
                })
            }
            var $scrollY = $('#' + scrollYId);
            if(isScrollY){
                $scrollY.children().height(tableHeight);
                $scrollY.scroll(function(ev){
                    var tableScrollTop = $scrollY.scrollTop();
                    var $tableParent = $table.parent();
                    $tableParent.scrollTop(tableScrollTop);
                });
            }else{
                $scrollY.addClass('hide');
            }
        }
        var $buttons = $('#' + _config.id + ' button[type="button"]');
        $buttons.off('click');
		$buttons.on('click', function (ev) {
            var $this = $(this);
            var colIndex = $this.attr('ns-colindex');
            var rowIndex = $this.attr('ns-rowindex');
            var countListData = _config.countListData;
            var rowData = countListData[rowIndex];
            var colField = $this.attr('ns-colfield');
            //var formatHandlerJson = _config.formatHandlerJson[colIndex] ? _config.formatHandlerJson[colIndex] : {};
            var formatHandlerJson = _config.columnsId[colField];
            if(!$.isEmptyObject(formatHandlerJson)){
                if(formatHandlerJson.formatHandler){
                    var formatData = formatHandlerJson.formatHandler.data ? formatHandlerJson.formatHandler.data : {};
                    if(!$.isEmptyObject(formatData.echart)){
                        var echartJson = formatData.echart;
                        var titleStr = echartJson.title ? echartJson.title : '';
                        if(titleStr){
                            titleStr = NetStarUtils.getHtmlByRegular(rowData,titleStr);
                        }else{
                            switch(echartJson.type){
                                case 'line':
                                    titleStr = '折线图';
                                    break;
                                case 'bar':
                                    titleStr = '柱状图';
                                    break;
                            }
                        }
                        if(echartJson.data.source){
                            if(echartJson.data.source == 'dynamicColumns'){
                                var sourceField = echartJson.data.field;
                                var dynamicConfig = _config.format.dynamicColumns[sourceField];
                                var dataArray = rowData[dynamicConfig.keyField];
                                if(!$.isArray(dataArray)){dataArray = [];}
                                if(dataArray.length == 0){
                                    nsalert('数据为空','warning');
                                    return;
                                }
                                var fields = dynamicConfig.fields;
                                var legendTitleArr = [];
                                var xArray = [];
                                var seriesArr = [];
                                var newJson = {};
                                for(var l=0; l<fields.length; l++){
                                    legendTitleArr.push(_config.columnsId[fields[l]].title);
                                    newJson[fields[l]] = {
                                        name:_config.columnsId[fields[l]].title,
                                        type:'line',
                                        data:[],
                                        label: {
                                            normal: {
                                                show: true,
                                            }
                                        },
                                    };
                                }
                                for(var d=0; d<dataArray.length; d++){
                                    xArray.push(dataArray[d][sourceField]+'年');
                                    for(var f=0; f<fields.length; f++){
                                        newJson[fields[f]].data.push(dataArray[d][fields[f]]);
                                    }
                                }
                                for(var seriesI in newJson){
                                    seriesArr.push(newJson[seriesI]);
                                }
                                var dialogConfig = {
                                    id: 'echarts-dialog-component',
                                    title: titleStr,
                                    templateName: 'PC',
                                    height:450,
                                    width : 800,
                                    shownHandler : function(_shownData){
                                        var echartId = 'echart-'+_shownData.config.bodyId;
                                        var html = '<div class="echart-panel" id="' + echartId + '" style="width:100%;height:300px;"></div>';
                                        $('#'+_shownData.config.bodyId).html(html);
                                        var options = {};
                                        switch(echartJson.type){
                                            case 'pie':
                                               break;
                                            case 'bar':
                                                break;
                                            case 'line':
                                                options = {
                                                    title: {
                                                        text: titleStr,
                                                        x: 'center',
                                                    },
                                                    tooltip: {
                                                        trigger: 'axis'
                                                    },
                                                    legend: {
                                                        orient: 'vertical',
                                                        right: 10,
                                                        top: 100,
                                                        bottom: 100,
                                                        data:legendTitleArr
                                                    },
                                                    xAxis:  {
                                                        type: 'category',
                                                        data: xArray
                                                    },
                                                    yAxis: {
                                                        type: 'value',
                                                        max:200,
                                                        min:0,
                                                    },
                                                    series: seriesArr
                                                };                                                    
                                                break;
                                        }
                                        var chartDom = echarts.init($('#'+echartId)[0]);
                                        chartDom.clear();
                                        chartDom.setOption(options);
                                    },
                                    hiddenHandler:function(){}
                                };
                                NetstarComponent.dialogComponent.init(dialogConfig);
                            }
                        }
                    }else{
                        if(typeof(formatData.callbackFunc) == 'function'){
                            formatData.callbackFunc({
                                data:rowData
                            });
                        }
                    }
                }
            }
		});
        
        //查询条件
        //NetStarUtils.getListQueryData
        switch(_config.outPutType){
            case 'rowColumn':
                   var queryConfig = NetStarUtils.getListQueryData(_config.field, {
                        id: _config.id,
                        value:''
                    });
                    if(queryConfig.queryForm.length > 0){
                        var html = '<div class="list-query-panel" id="' + queryConfig.id + '"></div>';
                        var advanceHtml = '<div class="advance-query-panel" id="advance-'+queryConfig.id+'" style="margin:-20px 0px 10px 0px;float:right"></div>';
                        if($('#'+queryConfig.id).length == 0){
                            $table.closest('.component-countlist').before('<div class="pt-panel-query">'+html+advanceHtml+'</div>');
                            
                            function confirmQueryHandler(){
                                var $this = $(this);
                                var formId = $this.attr('containerid');
                                var prefix = 'query-';
                                var gridId = formId.substring(prefix.length, formId.length);
                                confirmQuickQueryHandler({
                                    gridId: gridId,
                                    formId: formId
                                });
                            }
                            function confirmQuickQueryHandler(_queryObj){
                                var formId = _queryObj.formId;
                                var gridId = _queryObj.gridId;
                                var formJson = NetstarComponent.getValues(formId);
                                var paramJson = {};
                                if (formJson.filtermode == 'quickSearch') {
                                    if (formJson.filterstr) {
                                        paramJson = {
                                            keyword: formJson.filterstr,
                                            //quicklyQueryColumnNames:[],
                                            quicklyQueryColumnValue:formJson.filterstr,
                                        };
                                    }
                                } else {
                                    var queryConfig = NetstarComponent.config[formId].config[formJson.filtermode];
                                    if (!$.isEmptyObject(queryConfig)) {
                                        if (formJson[formJson.filtermode]) {
                                            if (queryConfig.type == 'business' && typeof (queryConfig.outputFields) == "undefined") {
                                                switch (queryConfig.selectMode) {
                                                    case 'single':
                                                        paramJson[formJson.filtermode] = formJson[formJson.filtermode][queryConfig.idField];
                                                        break;
                                                    case 'checkbox':
                                                        paramJson[formJson.filtermode] = formJson[formJson.filtermode][0][queryConfig.idField];
                                                        break;
                                                }
                                            } else {
                                                paramJson[formJson.filtermode] = formJson[formJson.filtermode];
                                            }
                                        }
                                        if (typeof (formJson[formJson.filtermode]) == 'number') {
                                            paramJson[formJson.filtermode] = formJson[formJson.filtermode];
                                        }
                                        if (queryConfig.type == 'dateRangePicker') {
                                            var startDate = formJson.filtermode + 'Start';
                                            var endDate = formJson.filtermode + 'End';
                                            paramJson[startDate] = formJson[startDate];
                                            paramJson[endDate] = formJson[endDate];
                                        }else if(queryConfig.type == 'valuesInput'){
                                            var valuesInputStr = queryConfig.value;
                                            if(typeof(valuesInputStr)=='object'){
                                                $.each(valuesInputStr,function(k,v){
                                                    paramJson[k] = v;
                                                })
                                            }
                                        }
                                    } else {
                                        if (formJson.filterstr) {
                                            paramJson[formJson.filtermode] = formJson.filterstr;
                                        }
                                    }
                                }
                                //console.log(paramJson)
                                //console.log(gridId)
                                var config = NetstarUI.countList.config[gridId].config;
                                NetstarUI.countList.refreshById(gridId,[],paramJson);
                            }
                            var formConfig = {
                                id: queryConfig.id,
                                formStyle: 'pt-form-normal',
                                plusClass: 'pt-custom-query',
                                isSetMore: false,
                                form: queryConfig.queryForm,
                                completeHandler: function () {
                                    var btnHtml = '<div class="pt-btn-group">' +
                                        '<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" containerid="' + queryConfig.id + '"><i class="icon-search"></i></button>' +
                                        '</div>';
                                    $('#' + queryConfig.id).append(btnHtml);
                                    $('button[containerid="' + formConfig.id + '"]').off('click', confirmQueryHandler);
                                    $('button[containerid="' + formConfig.id + '"]').on('click', confirmQueryHandler);
                                }
                            };
                            NetstarComponent.formComponent.show(formConfig, {});
                            setTimeout(function () {
                                //绑定回车事件
                                var componentVueconfig = NetstarComponent.config[formConfig.id].vueConfig;
                                for (var fieldId in componentVueconfig) {
                                    if (fieldId != 'filtermode') {
                                        var elementConfig = componentVueconfig[fieldId];
                                        componentVueconfig[fieldId].inputEnter = function (event) {
                                            if (elementConfig.isShowDialog && typeof (elementConfig.returnData) == "object" && typeof (elementConfig.returnData.documentEnterHandler) == 'function') {
                                                elementConfig.returnData.documentEnterHandler();
                                            } else {
                                                event.stopImmediatePropagation();
                                                var elementId = $(event.currentTarget).attr('id');
                                                this.blur();
                                                var formId = $(this.$el).closest('.pt-form-body').attr('id');
                                                elementId = elementId.substring(formId.length + 1, elementId.length);
                                                formId = formId.substring(5, formId.length);
                
                                                var elementComponentConfig = NetstarComponent.config[formId].config[elementId];
                                                if (elementComponentConfig.type == 'businessSelect') {
                                                    var vueConfig = NetstarComponent.config[formId].vueConfig[elementId];
                                                    NetstarComponent.businessSelect.searchByEnter(elementComponentConfig, vueConfig, function (context, data) {
                                                        var plusData = data.plusData;
                                                        var _config = context.config ? context.config : NetstarComponent.config[formId].config[plusData.componentId];
                                                        var _vueConfig = context.vueConfig ? context.vueConfig : NetstarComponent.config[formId].vueConfig[plusData.formID];
                                                        _vueConfig.loadingClass = '';
                                                        if (data.success) {
                                                            var dataSrc = _config.search.dataSrc;
                                                            var value = data[dataSrc];
                                                            if ($.isArray(value) && value.length == 1) {
                                                                _vueConfig.setValue(value); // 赋值
                                                            }
                                                            var gridId = formId.substring(6, formId.length);
                                                            var templateId = gridId.substring(0, gridId.lastIndexOf('-list'));
                                                            if (templateId) {
                                                                config = NetstarTemplate.templates.businessDataBase.data[templateId].config;
                                                            }
                                                            confirmQuickQueryHandler({
                                                                gridId: gridId,
                                                                formId: formId
                                                            });
                                                        }
                                                    });
                                                } else if (elementComponentConfig.type == 'business') {
                                                    var vueConfig = NetstarComponent.config[formId].vueConfig[elementId];
                                                    NetstarComponent.business.searchByEnter(elementComponentConfig, vueConfig, function (context, data) {
                                                        var plusData = data.plusData;
                                                        var _config = context.config ? context.config : NetstarComponent.config[formId].config[plusData.componentId];
                                                        var _vueConfig = context.vueConfig ? context.vueConfig : NetstarComponent.config[formId].vueConfig[plusData.formID];
                                                        _vueConfig.loadingClass = '';
                                                        if (data.success) {
                                                            var dataSrc = _config.search.dataSrc;
                                                            var value = data[dataSrc];
                                                            if ($.isArray(value) && value.length == 1) {
                                                                _vueConfig.setValue(value); // 赋值
                                                            }
                                                            var gridId = formId.substring(6, formId.length);
                                                            confirmQuickQueryHandler({
                                                                gridId: gridId,
                                                                formId: formId
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    var gridId = formId.substring(6, formId.length);
                                                    confirmQuickQueryHandler({
                                                        gridId: gridId,
                                                        formId: formId
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }, 100)

                            var advancedQueryId = 'advance-' + queryConfig.id;
                            if($('#'+advancedQueryId.length == 1)){
                                var advancedQueryConfig = {
                                    id: advancedQueryId,
                                    title: '高级查询',
                                    getAjaxData: {
                                        panelId: advancedQueryId,
                                    },
                                    saveAjaxData: {
                                        panelId: advancedQueryId,
                                    },
                                    delAjaxData: {},
                                    form: queryConfig.advanceForm,
                                    queryHandler: function (formJson, _config) {
                                        var gridId = queryConfig.id.substring(6, queryConfig.id.length);
                                        var formId = _config.queryTermId;
                                        store.set(formId, formJson);
                                        var queryFormArr = _config.form;
                                        for (var i = 0; i < queryFormArr.length; i++) {
                                            var fieldId = queryFormArr[i].id;
                                            if (formJson[fieldId]) {
                                                if (queryFormArr[i].type == 'business' && typeof (queryFormArr[i].outputFields) == "undefined") {
                                                    switch (queryFormArr[i].selectMode) {
                                                        case 'single':
                                                            formJson[fieldId] = formJson[fieldId][queryFormArr[i].idField];
                                                            break;
                                                        case 'checkbox':
                                                            formJson[fieldId] = formJson[fieldId][0][queryFormArr[i].idField];
                                                            break;
                                                    }
                                                }
                                            }
                                        }
                                        NetstarUI.countList.refreshById(gridId,[],formJson);
                                    },
                                }
                                NetstarComponent.advancedQuery.init(advancedQueryConfig);
                            }
                        }
                    }
                break;
        }
        //图表
        var echartsConfig = _config.format.echarts ? _config.format.echarts : {};
        if(!$.isEmptyObject(echartsConfig)){
            var fieldConfig = echartsConfig.data;
            var xField = fieldConfig.field;
            var titleStr = echartsConfig.title ? echartsConfig.title : '';
            var echartId = 'echarts-'+_config.id;
            var html = '<div class="echart-panel" id="' + echartId + '" style="width:100%;height:300px;"></div>';
            if($('#'+echartId).length == 1){
                $('#'+echartId).remove();
            }
            if($('#query-'+_config.id).length > 0){
                $('#query-'+_config.id).parent().after(html);
            }else{
                $table.closest('.component-countlist').before(html);
            }
            var options = {};
            var legendTitleArr = [];
            for(var e=1; e<_config.levelOneTitleArr.length; e++){
                legendTitleArr.push(_config.levelOneTitleArr[e]);
            }
            var xArray = [];
            var seriesArr = [];
            var rowsData = _config.countListData;
            var newJson =  {};
            var columnsIdData = _config.columnsId;

            
            for(var cField in columnsIdData){
                var colData = columnsIdData[cField];
                var cHidden = typeof(colData.hidden)=='boolean' ? colData.hidden : false;
                if(colData.title && !cHidden){
                    //存在标题并且当前字段不隐藏
                    newJson[colData.field] = {
                        name:colData.title,
                        type:echartsConfig.type,
                        data:[],
                        label: {
                            normal: {
                                show: true,
                            }
                        },
                    };
                }
            }

            for(var r=0; r<rowsData.length; r++){
                var rData = rowsData[r];
                if(rData[xField]){
                    xArray.push(rData[xField]);
                }
                for(var n in newJson){
                    newJson[n].data.push(rData[n]);
                }
            }
            for(var seriesI in newJson){
                seriesArr.push(newJson[seriesI]);
            }
            
            switch(echartsConfig.type){
                case 'pie':
                    break;
                case 'bar':
                case 'line':
                    options = {
                        title: {
                            text: titleStr,
                            x: 'center',
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        legend: {
                            orient: 'vertical',
                            right: 10,
                            top: 100,
                            bottom: 100,
                            data:legendTitleArr
                        },
                        xAxis:  {
                            type: 'category',
                            data: xArray
                        },
                        yAxis: {
                            type: 'value',
                            max:200,
                            min:0,
                        },
                        series: seriesArr
                    };                                                    
                    break;
            }
            var chartDom = echarts.init($('#'+echartId)[0]);
            chartDom.clear();
            chartDom.setOption(options);
        }

    },
    rowHrefLinkJump : function(hrefConfig){
        var configs = NetstarUI.countList.config[hrefConfig.countListId];
        if(typeof(configs) != "object"){
            nsAlert('没有找到统计列表', 'error');
            console.error('没有找到统计列表');
            console.error(hrefConfig);
            return false;
        }
        var gridConfig = configs.config;
        var gridId = hrefConfig.countListId;
        // 所有列配置
        var columnsId = gridConfig.columnsId;
        // 列字段
        var field = hrefConfig.colField;
        // 列配置
        var columnConfig = columnsId[field];
        var formatHandler = columnConfig.formatHandler;
        var url = formatHandler.data.url;
        var titleStr = formatHandler.data.title ? formatHandler.data.title : '';
        var originalRows = gridConfig.countListData;
        var rowIndex = hrefConfig.rowIndex;
        var rowData = $.extend(true, {}, originalRows[rowIndex]);
        if(typeof(formatHandler.data.urlSubdata) == "string" && formatHandler.data.urlSubdata.length > -1){
            var urlSubdata = JSON.parse(formatHandler.data.urlSubdata);
            var subdataField = formatHandler.data.subdataField;
            var urlObj = false;
            var subdataFieldValue = rowData[subdataField];
            for(var i=0; i<urlSubdata.length; i++){
                var subdataObj = urlSubdata[i];
                if(subdataObj.value === subdataFieldValue){
                    urlObj = subdataObj;
                    break;
                }
            }
            if(urlObj){
                url = urlObj.url;
                if(typeof(url) == "string" && url.indexOf('http') != 0){
                    url = getRootPath() + url;
                }
                if(typeof(urlObj.data) == "object"){
                    var urlData = nsVals.getVariableJSON(urlObj.data, rowData);
                    nsVals.extendJSON(rowData, urlData);
                }
                if(typeof(urlObj.title) == "string"){
                    titleStr = urlObj.title;
                }
            }
        }
        if(typeof(url) != "string" || url.length == 0){
            nsAlert('没有找到url','error');
            console.error('没有找到url');
            return false;
        }
        //目前限制添加读取是根据模板id跳转的，所以需要判断是否存在模板id 
        if (gridId.indexOf('layout') > -1) {
            var packageName = '';
            if(gridConfig.package){
                packageName = gridConfig.package;
            }else{
                packageName = gridId.substring(18, gridId.lastIndexOf('-list'));
                packageName = packageName.replace(/\-/g, '.');
            }
            if (NetstarTemplate.templates.configs[packageName]) {
                if (!$.isEmptyObject(NetstarTemplate.templates.configs[packageName].pageParam)) {
                    if(formatHandler.data.isFirstUseRow){
                        nsVals.extendJSON(NetstarTemplate.templates.configs[packageName].pageParam, rowData);
                    }else{
                        nsVals.extendJSON(rowData, NetstarTemplate.templates.configs[packageName].pageParam);
                    }
                }
            }
            var packageNameSufficStr = new Date().getTime();
            var idField = gridConfig.idField;
            if(idField){
                packageNameSufficStr = rowData[idField] ? rowData[idField] : packageNameSufficStr;
            }
            var tempValueName = packageName + packageNameSufficStr;
            var isAllwaysNewTab = typeof(formatHandler.data.isAllwaysNewTab)=='boolean' ? formatHandler.data.isAllwaysNewTab : true;
            if(isAllwaysNewTab){
                tempValueName = {
                    packageName: tempValueName,
                    isMulitTab: isAllwaysNewTab,
                }
                tempValueName = JSON.stringify(tempValueName);
            }else{
                tempValueName = packageName;
            }
            if (typeof (NetstarTempValues) == 'undefined') {
                NetstarTempValues = {};
            }

            var templateName = formatHandler.data.templateName;
            var parameterFormat = {};
            if (formatHandler.data.parameterFormat) {
                var parameterFormat = JSON.parse(formatHandler.data.parameterFormat);
                if(parameterFormat.dialogType){
                    templateName = parameterFormat.dialogType;
                    parameterFormat = parameterFormat;
                }else{
                    var chargeData = nsVals.getVariableJSON(parameterFormat, rowData);
                    nsVals.extendJSON(rowData, chargeData);
                }
            }
            /***是否发送查询数据start***/
            if(formatHandler.data.isSendQueryModel){
                var gridData = gridConfig.ajax.data;
                if(typeof(gridData) == "object" && !$.isEmptyObject(gridData)){
                    rowData.queryModel = gridData;
                }
            }
            /***是否发送查询数据end***/
            var readonly = typeof (formatHandler.data.readonly) == 'boolean' ? formatHandler.data.readonly : false;
            rowData.readonly = readonly;
            NetstarTempValues[tempValueName] = rowData;
            //businessDataBaseEditor  templateName
            if(url.indexOf('?')>-1){
                var search = url.substring(url.indexOf('?')+1,url.length);
                var paramsObj = search.split('&');
                var resultObject = {};
                for (var i = 0; i < paramsObj.length; i++){
                    var idx = paramsObj[i].indexOf('=');
                    if (idx > 0){
                        resultObject[paramsObj[i].substring(0, idx)] = paramsObj[i].substring(idx + 1);
                    }
                }
                $.each(resultObject, function (key, text) {
                    NetstarTempValues[tempValueName][key] = text;
                });
                url = url.substring(0,url.indexOf('?'));
            }

            url = url + '?templateparam=' + encodeURIComponent(tempValueName);

            switch (templateName) {
                case 'businessDataBaseEditor':
                    var pageConfig = {
                        pageIidenti: url,
                        url: url,
                        plusData: {
                            config: {
                                value: rowData
                            },
                            gridId: gridId,
                        },
                        callBackFunc: function (isSuccess, data, _pageConfig) {
                            if (isSuccess) {
                                var _config = _pageConfig.plusData.config;
                                var _configStr = JSON.stringify(_config);
                                var funcStr = 'nsProject.showPageDataByGrid(pageConfig,' + _configStr + ',"' + _pageConfig.plusData.gridId + '")';
                                var starStr = '<container>';
                                var endStr = '</container>';
                                var containerPage = data.substring(data.indexOf(starStr) + starStr.length, data.indexOf(endStr));
                                var exp = /NetstarTemplate\.init\((.*?)\)/;
                                var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                                containerPage = containerPage.replace(containerPage.match(exp)[0], funcStrRep);
                                var $container = nsPublic.getAppendContainer();
                                $container.append(containerPage);
                            }
                        }
                    }
                    pageProperty.getAndCachePage(pageConfig);
                    break;
                case 'tree':
                    var dialogConfig = {
                        id: 'tree-dialog-component',
                        title: titleStr,
                        templateName: 'PC',
                        height:520,
                        width : 420,
                        shownHandler : function(_shownData){
                            var treeConfig = {
                                container:_shownData.config.bodyId,
                                selectMode:'single',
                                readonly:readonly,
                                editorConfig:{
                                    idField:parameterFormat.idField,
                                    textField:parameterFormat.textField,
                                    parentIdField:parameterFormat.parentIdField
                                },
                                ajax:{
                                    url:formatHandler.data.url,
                                    type:'get',
                                    dataSrc:'rows',
                                    contentType:'application/x-www-form-urlencoded',
                                    data:{id:rowData[parameterFormat.sendIdField]}
                                },
                                queryConfig:{
                                    id:'query-'+_shownData.config.bodyId
                                },
                                defaultPositionId:rowData[parameterFormat.sendIdField]
                            };
                            NetstarTreeList.init(treeConfig);
                        }
                    };
                    NetstarComponent.dialogComponent.init(dialogConfig);
                    break;
                default:
                    if (!$.isEmptyObject(rowData)) {
                        titleStr = NetStarUtils.getHtmlByRegular(rowData, titleStr);
                    }
                    NetstarUI.labelpageVm.loadPage(url, titleStr, isAllwaysNewTab, {}, true);
                    break;
            }
        }
    },
    initData:function(countListData,_config){
        if(typeof(_config.format.handler) == 'function'){
            //定义了对数据的处理
			countListData = _config.format.handler(countListData);
        }
        _config.countListData = countListData;
        var dynamicColumns = _config.format.dynamicColumns ? _config.format.dynamicColumns : {};
        var styleExpress = _config.format.styleExpress ? _config.format.styleExpress : {};
        var styleExpressByCol = styleExpress.col ? styleExpress.col : {};
        var fieldArray = _config.field;
        var levelOneTitleArr = [];
        var levelTwoTitleArr = [];
        var insertPositionIndexArr = [];
        var columnsId = {};
        var columnWidthArray = [];
        var totalWidth = 0;
        var combineThColumnArray = [];
        var columnThRenderArray = [];
        var combineRowColumnArray = [];
        var columnFieldArray = [];
        var columnNameFieldArray = [];
        for(var fieldI=0; fieldI<fieldArray.length; fieldI++){
            var fieldData = fieldArray[fieldI];
            if(fieldData.hidden == true){
                continue;
            }
            var dataType = fieldData.columnType ? fieldData.columnType : 'text';//默认输出是文本
            var isColumnCombine = typeof(fieldData.isColumnCombine)=='boolean' ? fieldData.isColumnCombine : false;//是否允许列合并
            var formatHandler = fieldData.formatHandler ? fieldData.formatHandler : {};
            if(formatHandler.type){
                dataType = formatHandler.type;
                _config.formatHandlerJson[fieldI] = fieldData;
            }
            if(_config.insertPositionJson[fieldData.field]){
                insertPositionIndexArr.push({
                    index:fieldI,
                    field:_config.insertPositionJson[fieldData.field]
                });
            }
            if(!$.isEmptyObject(styleExpressByCol[fieldData.field])){
                _config.styleExpressByCol[fieldData.field] = styleExpressByCol[fieldData.field];
            }
            columnsId[fieldData.field] = fieldData;
            columnNameFieldArray.push(fieldData.field);
            if(dynamicColumns[fieldData.field]){

            }else if(_config.dynamicColumnsArrByLevel2[fieldData.field]){
               
            }else{
                levelOneTitleArr.push(fieldData.title);
                columnWidthArray.push(fieldData.width);
                totalWidth += fieldData.width;
                combineRowColumnArray.push(isColumnCombine);
                columnThRenderArray.push(dataType);
                columnFieldArray.push(fieldData.field);
                combineThColumnArray.push(true);
            }
        }
        _config.columnsId = columnsId;
        _config.columnNameFieldArray = columnNameFieldArray;
        levelTwoTitleArr = $.extend(true,[],levelOneTitleArr);

        _config.columnThRenderArray = columnThRenderArray;
        _config.combineThColumnArray = combineThColumnArray;
        _config.columnWidthArray = columnWidthArray;
        _config.totalWidth = totalWidth;
        _config.columnFieldArray = columnFieldArray;
        _config.combineRowColumnArray = combineRowColumnArray;
        _config.theadArray = [levelOneTitleArr];
        _config.levelOneTitleArr = levelOneTitleArr;
        _config.levelTwoTitleArr = levelTwoTitleArr;
        _config.insertPositionIndexArr = insertPositionIndexArr;

        this.initList(_config);
    },
    refreshById:function(_id,_data,_paramsData){
        var config = NetstarUI.countList.config[_id].config;
        var isDataSource = true;
        if(!$.isEmptyObject(_paramsData)){
            isDataSource = false;
        }
        if(isDataSource){
            // config.countListData = _data;
            // NetstarUI.countList.initList(config);
            NetstarUI.countList.initData(_data, config);
        }else{
            if(!$.isEmptyObject(config.ajax)){
                var ajaxConfig = $.extend(true,{},config.ajax);
                ajaxConfig.isReadTimeout = false;
                ajaxConfig.plusData = {id:config.id};
                ajaxConfig.data = typeof(ajaxConfig.data) == 'object' ? ajaxConfig.data : {};
                var _defaultParamsData = config.defaultParamsData;
                if(!$.isEmptyObject(_defaultParamsData)){
                    var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
                    var isUseObject = true;
                    for(var key in ajaxConfig.data){
                        if(ajaxParameterRegExp.test(ajaxConfig.data[key])){
                            isUseObject = false;
                            break;
                        }
                    }
                    if(isUseObject){
                        ajaxConfig.data = NetStarUtils.getDefaultValues(ajaxConfig.data,_defaultParamsData);
                    }else{
                        ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data,_defaultParamsData);
                    }
                }

                $.each(_paramsData,function(k,v){
					//if(typeof(ajaxConfig.data[k])=='undefined'){
						ajaxConfig.data[k] = v;
					//}
				});
                NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
                    if(res.success){
                        var _config = NetstarUI.countList.config[ajaxOptions.plusData.id].config;
                        // _config.countListData = res[ajaxOptions.dataSrc];
                        // NetstarUI.countList.initList(_config);
                        if($.isArray(res[ajaxOptions.dataSrc]) && res[ajaxOptions.dataSrc].length > 0){
                            NetstarUI.countList.initData(res[ajaxOptions.dataSrc], config);
                        }else{
                            nsAlert('返回数据错误，请检查', 'error');
                            console.log(res);
                            console.log(config);
                            var $table = $('#' + _config.tableId);
                            $table.remove();
                        }
                    }
                },true);
            }
        }
    },
    //初始化
    init:function(_config,_paramsData){
        if($('#'+_config.id).length==0){
            return;
        }
        _config.defaultParamsData = _paramsData;
        NetstarUI.countList.config[_config.id] = {
            original:$.extend(true,{},_config),//初始化的原始值
            config:_config,//运行中的数据
        };
        this.setDefault(_config);
        var countListData = [];
        if(!$.isEmptyObject(_config.ajax)){
            var ajaxConfig = $.extend(true,{},_config.ajax);
            ajaxConfig.isReadTimeout = false;
            ajaxConfig.plusData = {id:_config.id};
            ajaxConfig.data = typeof(ajaxConfig.data)=='object' ? ajaxConfig.data : {};
            if(!$.isEmptyObject(_paramsData)){
                var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
                var isUseObject = true;
                for(var key in ajaxConfig.data){
                    if(ajaxParameterRegExp.test(ajaxConfig.data[key])){
                        isUseObject = false;
                        break;
                    }
                }
                if(isUseObject){
                    ajaxConfig.data = NetStarUtils.getDefaultValues(ajaxConfig.data,_paramsData);
                }else{
                    ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data,_paramsData);
                }
            }
            NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
                if(res.success){
                    countListData = res[ajaxOptions.dataSrc];
                    NetstarUI.countList.initData(countListData,NetstarUI.countList.config[ajaxOptions.plusData.id].config);
                }
            },true);
        }else{
            countListData = _config.dataSource;
            NetstarUI.countList.initData(countListData,_config);
        }
    }
}