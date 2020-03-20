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
        var dynamicColumns = _config.format.dynamicColumns;
        var countListData = _config.countListData;
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
                        if(dArr.length > dLength){
                            dLength = dArr.length;
                            dynamicRowFirstData = dArr;
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
                        tbodyHtml += '<td class="td-' + tData.datatype + '" rowspan="' + tData.rowspan + '" '+outputStyle+' colspan="' + tData.colspan + '">' 
                                        +'<div>' + tData.text + '</div>' +
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
        var $table = $('#'+_config.id);
        $table.html(theadHtml+tbodyHtml);
        if (typeof (_config.isScroll) == 'boolean') {
			if (_config.isScroll) {
                var containerWidth = $(window).outerWidth() - 100;
                var avaHeight = $(window).outerHeight()-100;
				$table.parent().css({
					overflow: "hidden",
					height: avaHeight+'px',
					width: containerWidth + "px"
				});
				$table.before('<div class="scroll-panel-table-copy" style="height:'+avaHeight+'px;overflow:auto"></div>');
				var $div = $('.scroll-panel-table-copy');
				$div.html($table);
				var html = '<div class="scroll-panel nspanel layout-customertable-copy" style="position:absolute;z-index:1;left:0px;width:' + containerWidth + 'px"><table id="scroll-table" cellspacing="0" class="table table-hover table-striped table-singlerow table-bordered table-sm scroll-table">' +
					theadHtml +
					'</table></div>';
				$table.parent().before(html);
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
			}
        }
        var tWidth = _config.totalWidth+'px';
        if(_config.isAutojustWidth){
            tWidth = '100%';
        }
		$table.css({
			'width': tWidth
		});
		$table.after('<div class="customer-table-input-component"></div>');


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
    },
    initData:function(countListData,_config){
        if(typeof(_config.format.handler) == 'function'){
            //定义了对数据的处理
			countListData = _config.format.handler(countListData);
        }
        _config.countListData = countListData;
        var dynamicColumns = _config.format.dynamicColumns;
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
    refreshById:function(_id,_data){
        var config = NetstarUI.countList.config[_id].config;
        if(_data){
            config.countListData = _data;
            NetstarUI.countList.initList(_config);
        }else{
            if(!$.isEmptyObject(config.ajax)){
                var ajaxConfig = $.extend(true,{},config.ajax);
                ajaxConfig.isReadTimeout = false;
                ajaxConfig.plusData = {id:config.id};
                NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
                    if(res.success){
                        var _config = NetstarUI.countList.config[ajaxOptions.plusData.id];
                        _config.countListData = res[ajaxOptions.dataSrc];
                        NetstarUI.countList.initList(_config);
                    }
                },true);
            }
        }
    },
    //初始化
    init:function(_config){
        if($('#'+_config.id).length==0){
            return;
        }
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