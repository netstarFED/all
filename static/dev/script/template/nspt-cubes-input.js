NetstarCubesInput = (function($){
    /**
     * columnThs = attrList + 属性值
     *  {  
     *      title : '',
     *      title : '',
     *  }
     * rowThs = nameList => 根据attrId拆分成数组
     * valus = valueList
     */
    var configById = {};
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(config.type!="dialog" && typeof(config.id) != "string"){
                isPass = false;
            }
            if(isPass){}
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                type : 'dialog',
                enterType : 'left',
                id : 'cubes-input',
                title : '弹框标题',
                columnThs : [],
                rowThs : [],
                valueThs : [],
                colWidth : 100,
                rowHeight : 27,
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        setConfig : function(config){
            configManage.setDefault(config);
        },
        getConfig : function(id){
            var configs = configById[id];
            if(configs){
                return configs.config
            }
            return false;
        },
    }
    var common = {
        // 获取最大层级
        getMaxLevel : function(ths){
            var level = 1;
            var maxLev = 1;
            function getLevel(arr, _level){
                if(_level > maxLev){
                    maxLev = _level;
                }
                for(var i=0; i<arr.length; i++){
                    if($.isArray(arr[i].children) && arr[i].children.length > 0){
                        var __level = _level + 1;
                        getLevel(arr[i].children, __level);
                    }
                }
            }
            if($.isArray(ths) && ths.length > 0){
                getLevel(ths, level);
            }
            return maxLev;
        },
        // 获取行数
        getRowNumByCell : function(ths){
            var num = 1;
            function getLevel(arr){
                for(var i=0; i<arr.length; i++){
                    if($.isArray(arr[i].children) && arr[i].children.length > 0){
                        getLevel(arr[i].children);
                    }else{
                        num += 1;
                    }
                }
            }
            if($.isArray(ths) && ths.length > 0){
                num = 0;
                getLevel(ths);
            }
            return num;
        },
        // 获取列数量
        getColNumByCell : function(ths){
            var num = 1;
            function getLevel(arr){
                for(var i=0; i<arr.length; i++){
                    if($.isArray(arr[i].children) && arr[i].children.length > 0){
                        getLevel(arr[i].children);
                    }else{
                        num += 1;
                    }
                }
            }
            if($.isArray(ths) && ths.length > 0){
                num = 0;
                getLevel(ths);
            }
            return num;
        },
        // 获取单元格数据 list
        getCellsData : function(data){
            var cells = [];
            function setCells(arr){
                for(var i=0; i<arr.length; i++){
                    cells.push(arr[i]);
                    if($.isArray(arr[i].children) && arr[i].children.length > 0){
                        setCells(arr[i].children);
                    }
                }
            }
            setCells(data);
            return cells;
        },
        // 设置空单元格数据
        setNullCellsData : function(data){
            var cells = $.extend(true, [], data);
            for(var i=0; i<cells.length; i++){
                var cell = cells[i];
                if(cell.span > 1){
                    for(var j=1; j<cell.span; j++){
                        var nullCell = $.extend(true, {}, cell);
                        nullCell.html = '';
                        nullCell.span = 1;
                        nullCell.cellIndex = j+1;
                        nullCell.isNull = true;
                        data.push(nullCell);
                    }
                }
            }
        },
        // 获取未读取数据子层级 通过展开的list数据
        getLevel : function(data){
            var level = 0;
            for(var i=0; i<data.length; i++){
                if(!data[i].isRead){
                    level = level < data[i].level ? data[i].level : level;
                }
            }
            return level;
        },
        // 获取父单元格数据
        getParentCellData : function(child, cells){
            var cell = {};
            for(var i=0; i<cells.length; i++){
                if(cells[i].id == child.parentId && cells[i].cellIndex == (child.index+1)){
                    cell = cells[i];
                    break;
                }
            }
            return cell;
        },
        // 获取单元格数据 存在层级关系
        getCellsDataByLevel : function(ths, _level, parentId, spanType){
            var cellsData = [];
            for(var i=0; i<ths.length; i++){
                var th = ths[i];
                // 根据单元格子单元数量计算跨行
                var rowNum = common.getRowNumByCell(th.children);
                if(spanType == "colspan"){
                    // rowNum = $.isArray(th.children) && th.children.length > 0 ? th.children.length : 1;
                    rowNum = common.getColNumByCell(th.children);
                }
                var rowHtml = table.getCellHtml(th, rowNum, spanType);
                var rowObj = {
                    html : rowHtml,
                    level : _level,
                    data : th,
                    index : i,
                    span : rowNum,
                    id : th.field,
                    cellIndex : 1,   // 排序
                    isNull : true,
                    isRead : false,
                    parentId : parentId,
                }
                if($.isArray(th.children) && th.children.length > 0){
                    var __level = _level + 1;
                    // rowObj.span = th.children.length;
                    rowObj.children = common.getCellsDataByLevel(th.children, __level, th.field, spanType);
                }
                cellsData.push(rowObj);
            }
            return cellsData;
        },
        // 通过单元格获取行html和根节点单元格
        getRowHtmlRoot : function(html, cell, cells){
            cell.isRead = true;
            html = cell.html + html;
            var rootCell = cell;
            if(cell.level > 1){
                var parent = common.getParentCellData(cell, cells);
                parent.isRead = true;
                var parentObj = common.getRowHtmlRoot(html, parent, cells);
                rootCell = parentObj.root;
                html = parentObj.html;
            }
            return {
                html : html,
                root : rootCell,
            };
        },
        // 设置行数据 通过子级查找父级拼成单行数据
        setRowsDataByChild : function(cells, level, rowData){
            for(var i=0; i<cells.length; i++){
                var cell = cells[i];
                if(cell.level == level && !cell.isRead){
                    var trObj = common.getRowHtmlRoot('', cell, cells);
                    var obj = {
                        html : trObj.html,
                        root : trObj.root,
                        leaf : cell,
                        cellIndex : trObj.root.cellIndex,
                        index : trObj.root.index,
                    }
                    rowData.push(obj);
                }
            }
            var _level = common.getLevel(cells);
            if(_level > 0){
                common.setRowsDataByChild(cells, _level, rowData);
            }
        },
        // 设置行数据 通过层级设置单行数据
        getRowsDataByLevel : function(cells){
            var rowData = [];
            var rowDataArr = [];
            function setRowDataArr(_cells){
                for(var i=0; i<_cells.length; i++){
                    var cell = _cells[i];
                    rowDataArr[cell.level-1] = $.isArray(rowDataArr[cell.level-1]) ? rowDataArr[cell.level-1] : [];
                    rowDataArr[cell.level-1].push(cell);
                    if($.isArray(cell.children) && cell.children.length > 0){
                        // 存在子单元格
                        setRowDataArr(cell.children);
                    }
                }
            }
            setRowDataArr(cells);
            for(var i=0; i<rowDataArr.length; i++){
                var row = rowDataArr[i];
                var trStr = '';
                for(var j=0; j<row.length; j++){
                    trStr += row[j].html;
                }
                var rowObj = {
                    data : row,
                    html : trStr,
                }
                rowData.push(rowObj);
            }
            return rowData;
        },
        // 获取行排序数据
        getSortRowsData : function(rowsData, rowThs){
            // 通过rowThs将行数据整理成按照index排序的二维数组 然后通过cellIndex对第二维数组排序
            var twoArray = [];
            for(var i=0; i<rowThs.length; i++){
                twoArray[i] = [];
                for(var j=0; j<rowsData.length; j++){
                    if(rowsData[j].index === i){
                        twoArray[i].push(rowsData[j]);
                    }
                }
            }
            for(var i=0; i<twoArray.length; i++){
                twoArray[i].sort(function(a, b){
                    return a.cellIndex - b.cellIndex;
                });
            }
            // 按顺序展开二维数组
            var _rowsData = [];
            for(var i=0; i<twoArray.length; i++){
                for(var j=0; j<twoArray[i].length; j++){
                    _rowsData.push(twoArray[i][j]);
                }
            }
            return _rowsData;
        },
        // 获取列数量
        getColNumByColumnThs : function(columnThs){
            function getChildNum(child){
                var num = 0;
                for(var i=0; i<child.length; i++){
                    num += $.isArray(child[i].children) && child[i].children.length > 0 ? getChildNum(child[i].children) : 1;
                }
                return num;
            }
            var colNum = getChildNum(columnThs);
            return colNum;
        },
        // 获取列数量
        getColNumByRowThs : function(rowThs){
            var num = common.getMaxLevel(rowThs);
            return num;
        },
        // 获取行数量
        getRowNumByColumnThs : function(columnThs){
            var num = common.getMaxLevel(columnThs);
            return num;
        },
        // 获取行数量
        getRowNumByRowThs : function(rowThs){
            function getChildNum(child, type){
                var num = 0;
                var i = type == "root" ? 1 : 0;
                for(; i<child.length; i++){
                    num += $.isArray(child[i].children) && child[i].children.length > 0 ? getChildNum(child[i].children, 'child') : 1;
                }
                return num;
            }
            var rowNum = getChildNum(rowThs, 'root');
            return rowNum;
        },
        validataVal : function(value, rules, $td){
            if(typeof(rules) != "string"){
                return true;
            }
            var rules = rules.split(' ');
            var isPass = true; // 是否合法
            var validatInfo = ''; // 错误信息
            // 先验证必填
            if(rules.indexOf('required') > -1 && value === ''){
                isPass = false;
                validatInfo = NetstarComponent.validateMsg['required'] + ',';
            }
            if(isPass && value !== ''){
                // 验证其它
                for(var i=0; i<rules.length; i++){
                    var ruleStr = rules[i];
                    switch(ruleStr){
                        case 'positiveInteger':
                            //正整数验证
                            var rex = /^[1-9]*[1-9][0-9]*$/;
                            if(!rex.test(value)){
                                isPass = false;
                                validatInfo += NetstarComponent.validateMsg[ruleStr] + ',';
                            }
                            break;
                    }
                }
            }
            if(validatInfo.length > 0){
                validatInfo = validatInfo.substring(0, validatInfo.length-1);
            }
            if(!isPass){
                common.setWarnInfoState(validatInfo, $td);
            }
            return isPass;
        },
        setWarnInfoState : function(warnInfo, $td){
            var warnName = 'pt-form-required-tips';
            var $validate = $td;
            var html = '<div class="' + warnName + '">' + warnInfo + '</div>';
            if($validate.children('.' + warnName).length > 0){
                $validate.children('.' + warnName).remove();
                $validate.removeClass(warnName);
            }
            $validate.append(html);
            $validate.addClass(warnName);
            var $validateContent = $validate.children('.' + warnName);
            var timeOut = setTimeout(function (){
                $validateContent.remove();
                $validate.removeClass(warnName);
                clearTimeout(timeOut);
            }, 3000);
        },
        validataVals : function(config, vals){
            var tdMatrix = config.tdMatrix;
            var validataData = config.colTable.validata;
            var isPass = true;
            for(var i=0; i<vals.length; i++){
                for(var j=0; j<vals[i].length; j++){
                    var _validataData = validataData[j];
                    isPass = common.validataVal(vals[i][j], _validataData.data.rules, tdMatrix[i][j]);
                    if(!isPass){ break; }
                }
                if(!isPass){ break; }
            }
            return isPass;
        },
    }
    var table = {
        getCellHtml : function(rowData, rowNum, spanType){
            spanType = spanType ? spanType : 'rowspan';
            var field = rowData.field ? rowData.field : '';
            var title = rowData.title ? rowData.title : '';
            var rowHtml = '<th ' + spanType + '="' + rowNum + '" ns-field="' + field + '">' + title + '</th>';
            return rowHtml;
        },
        getRowTableData : function(config){
            var rowThs = config.rowThs;
            // 获取有层级关系的单元格数据
            var cellsData = common.getCellsDataByLevel(rowThs, 1, -1, 'rowspan');
            // 获取所有单元格数据 list
            var cells = common.getCellsData(cellsData);
            // 对于跨行单元格通过空单元格补齐单元格数据
            common.setNullCellsData(cells);
            // 获取行数据 通过子级设置
            var level = common.getLevel(cells);
            var rowsData = [];
            common.setRowsDataByChild(cells, level, rowsData);
            // 获取行排序数据
            var sortRowsData = common.getSortRowsData(rowsData, rowThs);
            // 生成的列数量
            var colNum = rowThs.length > 0 ? common.getMaxLevel(rowThs) : 0;
            // 保存的行表格数据
            config.rowTable = {
                levelData : cellsData,
                cells : cells,
                rows : $.extend(true, [], sortRowsData),
                colNum : colNum,
            };
            return sortRowsData;
        },
        getColTableData : function(config){
            var columnThs = config.columnThs;
            // 获取有层级关系的单元格数据
            var cellsData = common.getCellsDataByLevel(columnThs, 1, -1, 'colspan');
            // 获取行数据 通过层级
            var rowsData = common.getRowsDataByLevel(cellsData, rowsData);
            // 生成的行数量
            var rowNum = common.getMaxLevel(columnThs);
            // 保存的行表格数据
            config.colTable = {
                levelData : cellsData,
                rows : rowsData,
                validata : rowsData[rowsData.length-1].data,
                rowNum : rowNum,
            };
            return rowsData;
        },
        getTableData : function(config){
            var rowTableData = table.getRowTableData(config);
            var colTableData = table.getColTableData(config);
            var colColNum = common.getColNumByColumnThs(config.columnThs);  //  列数据 生成列数量
            var rowColNum = common.getColNumByRowThs(config.rowThs);        //  行数据 生成列数量
            var colRowNum = common.getRowNumByColumnThs(config.columnThs);  //  列数据 生成行数量
            var rowRowNum = common.getRowNumByRowThs(config.rowThs);        //  行数据 生成行数量 除去第一条数据生成的行
            /**
             * 如果第一条行数据为空时
             *  根据列数据生成的行数量设置行合并
             *  根据行数据生成的列数量设置列合并
             */
            if(config.rowThs[0] &&　$.isEmptyObject(config.rowThs[0])){
                rowTableData[0].html = '<th rowspan="' + colRowNum + '" colspan="' + rowColNum + '" ns-field=""></th>'
            }
            /**
             * 通过判断 通过行数据生成的行数量与 除去第一条数据生成的行数量 比较差值
             * 如果 == 1 表示 行数据存在通过列数量设置的列合并
             * 如果 等于 列数据生成行数量 表示数据正确
             * 如果 不等于 列数据生成行数量 表示数据生成错误 数据处理错误
             */
            var dVal = rowTableData.length - rowRowNum; // 差值
            if(dVal == 1 || dVal == colRowNum){
                for(var i=0; i<dVal; i++){
                    rowTableData[i].html += colTableData[i].html;
                }
                for(; i<colRowNum; i++){
                    rowTableData.splice(i, 0, colTableData[i]);
                }
                config.starRowIndex = rowTableData.length - rowRowNum;
                config.starColIndex = rowColNum;
                return rowTableData;
            }else{
                if(rowTableData.length === 0 && colTableData.length > 0){
                    for(var i=0; i<colRowNum; i++){
                        rowTableData.push(colTableData[i]);
                    }
                    config.starRowIndex = rowTableData.length;
                    config.starColIndex = 0;
                    return rowTableData;
                }else{
                    // 数据生成错误
                    return false;
                }
            }
        },
        getTableHtml : function(config){
            var tableData = table.getTableData(config);
            config.tableData = tableData;
            var starRowIndex = config.starRowIndex; 
            var starColIndex = config.starColIndex; 
            var valueThs = config.valueThs;
            var valData = [];
            // value生成的行数量与列数量
            config.valTable = {
                rowNum : valueThs.length,
                colNum : valueThs[0] ? valueThs[0].length : 0,
            }
            // 完整表格的行数和列数
            config.showTable = {
                rowNum : config.valTable.rowNum + config.colTable.rowNum,
                colNum : config.valTable.colNum + config.rowTable.colNum,
            }
            var readonlyStr = '';
            if(config.readonly === true){
                readonlyStr = 'disabled=disabled';
            }
            for(var rIndex=0; rIndex<valueThs.length; rIndex++){
                var tr = '';
                for(var cIndex=0; cIndex<valueThs[rIndex].length; cIndex++){
                    tr += '<td>'
                                + '<input class="pt-form-control" ' + readonlyStr + ' row-index="' + rIndex +'" col-index="' + cIndex +'" value="' + valueThs[rIndex][cIndex].value + '" type="text"/>'
                            + '</td>';
                }
                valData.push(tr);
            }
            if(starRowIndex == tableData.length){
                // 没有列标题
                for(var i=0; i<valData.length; i++){
                    tableData.push({ html : valData[i] });
                }
            }else{
                for(var i=starRowIndex; i<tableData.length; i++){
                    tableData[i].html += valData[i-starRowIndex];
                }
            }
            var html = '<div class="pt-cubes-input"><table border="1" class="pt-grid"><thead>';
            for(var i=0; i<tableData.length; i++){
                if(i == starRowIndex){
                    html += '</thead><tbody>'
                }
                html += '<tr>' + tableData[i].html + '</tr>';
            }
            html += '</tbody></table></div>';
            return html;
        },
        setInputIndex : function($table, config){
            var inputArr = [];
            var tdMatrix = []; // td矩阵
            var $input = $table.find('input');
            for(var i=0; i<$input.length; i++){
                var rowIndex = Number($input.eq(i).attr('row-index'));
                var colIndex = Number($input.eq(i).attr('col-index'));
                if(config.enterType == "row"){
                    inputArr[rowIndex] = $.isArray(inputArr[rowIndex]) ? inputArr[rowIndex] : [];
                    inputArr[rowIndex][colIndex] = $input.eq(i);
                }else{
                    inputArr[colIndex] = $.isArray(inputArr[colIndex]) ? inputArr[colIndex] : [];
                    inputArr[colIndex][rowIndex] = $input.eq(i);
                }
                tdMatrix[rowIndex] = $.isArray(tdMatrix[rowIndex]) ? tdMatrix[rowIndex] : [];
                tdMatrix[rowIndex][colIndex] = $input.eq(i).parent();
            }
            var _inputArr = [];
            for(var i=0; i<inputArr.length; i++){
                for(var j=0; j<inputArr[i].length; j++){
                    _inputArr.push(inputArr[i][j]);
                }
            }
            for(var i=0; i<_inputArr.length; i++){
                _inputArr[i].attr('index', i);
            }
            config.inputMaxIndex = _inputArr.length - 1;
            config.inputArr = _inputArr;
            config.$input = $input;
            config.tdMatrix = tdMatrix;
        },
        setEvent : function($table, config){
            var $input = $table.find('input');
            $input.off('keydown');
            $input.on('keydown', function(ev){
                if(ev.keyCode == 13){
                    var $this = $(this);
                    var index = Number($this.attr('index'));
                    var nextIndex = index + 1;
                    if(index == config.inputMaxIndex){
                        nextIndex = 0;
                    }
                    config.inputArr[nextIndex].focus();
                    // config.inputArr[nextIndex][0].selectionStart = config.inputArr[nextIndex].val().length;
                }
            });
            $input.off('blur');
            $input.on('blur', function(ev){
                var $this = $(this);
                var value = $this.val();
                var colIndex = Number($this.attr('col-index'));
                var validataData = config.colTable.validata[colIndex];
                common.validataVal(value, validataData.data.rules, $this.parent());
            });
            $input.off('focus');
            $input.on('focus', function(ev){
                var $this = $(this);
                $this.select();
            });
        },
        init : function(config){
            config.$container = $('#' + config.id);
            var tableHtml = table.getTableHtml(config);
            var $table = $(tableHtml);
            table.setInputIndex($table, config);
            table.setEvent($table, config);
            // config.$container.append($table);
            var $tableContainer = config.$container;
            if(config.isSave){
                config.tableContainer = config.id + '-table';
                config.btnsContainer = config.id + '-btns';
                var html = '<div id = "' + config.tableContainer + '"></div><div id = "' + config.btnsContainer + '"></div>';
                config.$container.append(html);
                var $tableContainer = $('#' + config.tableContainer);
                var btnsHtml = btnManage.template.common;
                var $btns = $(btnsHtml);
                btnManage.setEvent($btns, config);
                $('#' + config.btnsContainer).append($btns);
            }
            $tableContainer.append($table);
        },
        getDialogSize : function(config){
            var rowHeight = config.rowHeight;
            var colWidth = config.colWidth;
            var rowNum = config.showTable.rowNum;
            var colNum = config.showTable.colNum;
            var rowsHeight = rowHeight * rowNum + 118;
            var colsWidth = colWidth * colNum + 32;
            return {
                width : colsWidth,
                height : rowsHeight,
            }
        },
        dialogInit : function(config){
            var tableHtml = table.getTableHtml(config);
            var $table = $(tableHtml);
            table.setInputIndex($table, config);
            table.setEvent($table, config);
            var size = table.getDialogSize(config);
            var dialog = {
                id: config.id,
                width: size.width,
                height: size.height,
                title: config.title,
                templateName: 'PC',
                shownHandler: function (data) {
                    var dialogBodyId = data.config.bodyId;
                    var footerIdGroup = data.config.footerIdGroup;
                    config.$container = $('#' + dialogBodyId);
                    config.$container.append($table);
                    config.$footer = $('#' + footerIdGroup);
                    var template = btnManage.template.edit;
                    if(config.readonly === true){
                        template = btnManage.template.dis;
                    }
                    var $conBtns = $(template);
                    btnManage.setEvent($conBtns, config);
                    config.$footer.append($conBtns);
                },
            }
            NetstarComponent.dialogComponent.init(dialog);
        },
        getValue : function(id, isValida){
            isValida = typeof(isValida) == "boolean" ? isValida : true; // 默认验证
            var config = configManage.getConfig(id);
            if(!config){
                nsAlert('根据id=' + id + '没有找到config配置', 'error');
                console.error('根据id=' + id + '没有找到config配置');
                return false;
            }
            var $input = config.$input;
            var val = [];
            for(var i=0; i<$input.length; i++){
                var rowIndex = Number($input.eq(i).attr('row-index'));
                var colIndex = Number($input.eq(i).attr('col-index'));
                val[rowIndex] = $.isArray(val[rowIndex]) ? val[rowIndex] : [];
                val[rowIndex][colIndex] = $input.eq(i).val();
            }
            var valueThs = $.extend(true, [], config.valueThs);
            for(var i=0; i< valueThs.length; i++){
                for(var j=0; j<valueThs[i].length; j++){
                    valueThs[i][j].value = val[i][j];
                }
            }
            if(isValida){
                var isPass = common.validataVals(config, val);
                if(!isPass){
                    valueThs = false;
                }
            }
            return valueThs;
        },
        getSaveData : function(id){
            var config = configManage.getConfig(id);
            var saveData = false;
            var value = table.getValue(config.id);
            if(value){
                saveData = config.serverJson;
                var valueList = saveData.valueList;
                var valObj = {};
                for(var i=0; i<value.length; i++){
                    for(var j=0; j<value[i].length; j++){
                        valObj[value[i][j].id] = value[i][j].value;
                    }
                }
                for(var i=0; i<valueList.length; i++){
                    valueList[i].value = valObj[valueList[i].id];
                }
            }
            return saveData;
        },
    }
    var btnManage = {
        template : {
            edit : '<div class="pt-btn-group">'
                        + '<button class="pt-btn pt-btn-default" ns-type="confirm">确定</button>'
                        + '<button class="pt-btn pt-btn-default" ns-type="close">关闭</button>'
                    + '</div>',
            dis : '<div class="pt-btn-group">'
                        // + '<button class="pt-btn pt-btn-default" ns-type="confirm">确定</button>'
                        + '<button class="pt-btn pt-btn-default" ns-type="close">关闭</button>'
                    + '</div>',
            common : '<div class="pt-btn-group">'
                        + '<button class="pt-btn pt-btn-default" ns-type="confirm">确定</button>'
                    + '</div>',
        },
        confirm : function(config){
            var value = table.getValue(config.id);
            if(value){
                var saveJson = config.serverJson;
                var valueList = saveJson.valueList;
                var valObj = {};
                for(var i=0; i<value.length; i++){
                    for(var j=0; j<value[i].length; j++){
                        valObj[value[i][j].id] = value[i][j].value;
                    }
                }
                for(var i=0; i<valueList.length; i++){
                    valueList[i].value = valObj[valueList[i].id];
                }
                if(typeof(config.confirmHandler) == "function"){
                    config.confirmHandler(saveJson, config);
                }
                if(config.type == "dialog"){
                    btnManage.close(config);
                }
            }
        },
        close : function(config){
            NetstarComponent.dialog[config.id].vueConfig.close();
        },
        setEvent : function($conBtns, config){
            var $btns = $conBtns.find('button');
            $btns.off('click');
            $btns.on('click', function(ev){
                var $this = $(this);
                var nsType = $this.attr('ns-type');
                btnManage[nsType](config);
            });
        },
    }
    //数据处理器 cy 20190724
    var cubesDataManager = {
        originalServerJson:{}, 	//服务器原始数据
        serverJson:{}, 			//服务器数据
        cubesLength:0, 			//矩阵维度
        getData:function(_serverJson){
            this.serverJson = this.getServerJson(_serverJson);
            this.cubesLength = _serverJson.attrList.length;
            var cubesData = this.getCubesData(this.serverJson);
            return cubesData;
        },
        //处理服务器数据
        getServerJson:function(_serverJson){
            this.originalServerJson = _serverJson;
            var serverJson = $.extend(true, {}, _serverJson);
    
            //把属性和标题 从array转成object
            var attrs = {};
            for(var ai = 0; ai < _serverJson.attrList.length; ai++){
                var attrConfig = _serverJson.attrList[ai];
                attrs[attrConfig.id] = attrConfig;
            }
            this.attrs = attrs;
    
            var titles = {};
            for(var ti = 0; ti < _serverJson.titleList.length; ti++){
                var titleConfig = _serverJson.titleList[ti];
                titles[titleConfig.id] = titleConfig;
            }
            this.titles = titles;
            
            return serverJson;
        },
        getCubesData:function(_serverJson){
            var columnThs = this.getColumnThs(_serverJson);
            var rowThs = this.getRowThs(_serverJson);
            var rowValues = this.getRowValues(_serverJson);
            return {
                columnThs:columnThs,
                rowThs:rowThs,
                rowValues:rowValues,
            }
        },
        getRowValues:function(_serverJson){
            var cubesLength = this.cubesLength;
            var rowValues = [];
            var rowValuesArray = [];
            var attrs = this.attrs;
            var titles = this.titles;
            
            if(cubesLength == 1){
                // 如果属性列表长度 = 1 直接输出
                rowValuesArray = [$.extend(true, [], _serverJson.valueList)];//虽然只有一行数据也需要转化为二维数组
            }else if(cubesLength == 2){
                // 如果属性列表长度 = 2 行列都有，需要拆分
                rowValues = [];
                //xid所指向的数据
                var xIds = {};
                var xIndexs = {};
                var xIdsLength = 0;
                //yid所指向的数据
                var yIds = {};
                var yIndexs = {};
                var yIdsLength = 0;
    
                //第一次循环找到二维数组的两个长度
                for(var i = 0; i<_serverJson.valueList.length; i++){
                    var valueConfig = _serverJson.valueList[i];
                    //建立xids对象集合 计算x轴宽度
                    if(typeof(xIds[valueConfig.a]) == 'undefined'){
                        xIds[valueConfig.a] = 
                        {
                            id:valueConfig.id,
                            index: xIdsLength,
                        };
                        xIndexs[xIdsLength] = xIds[valueConfig.a];
                        xIdsLength ++;
                    }
                    //建立yids对象集合 计算y轴宽度
                    if(typeof(yIds[valueConfig.b]) == 'undefined'){
                        yIds[valueConfig.b] = 
                        {
                            id:valueConfig.id,
                            index: yIdsLength,
                        };
                        yIndexs[yIdsLength] = yIds[valueConfig.b];
                        yIdsLength ++;
                    }
                }
                
                //整理成与xid 和 yid对应的二维数组
                rowValuesArray = []; 
                for(var valueI = 0; valueI<_serverJson.valueList.length; valueI++){
                    var valueConfig = _serverJson.valueList[valueI];
                    var xidIndex = xIds[valueConfig.a].index;
                    var yidIndex = yIds[valueConfig.b].index;
    
                    if(typeof(rowValuesArray[yidIndex]) == 'undefined'){
                        rowValuesArray.push([]);
                    }
                    rowValuesArray[yidIndex][xidIndex] = valueConfig;
                }
    
            }else{
    
            }
            return rowValuesArray;
        },
        /** 获取配置参数的列配置 输出结果是
         * @return {
         * 	title:'',
         * 	field:'',
         *  children:[{}]
         * } 	
         */
        getColumnThs:function(_serverJson){
            var cubesLength = this.cubesLength;
            var columnThArray = [];
            var columnThs = []; //返回的数组
    
            if(cubesLength == 1){
                // 如果属性列表长度 = 1 则行标题为空，列标题直接输出
                for(var i=0; i<_serverJson.titleList.length; i++){
                    var titleObj = _serverJson.titleList[i];
                    columnThArray.push({
                        title:titleObj.name,
                        field:titleObj.id,
                        parentId:titleObj.parentId,
                    })
                }
                columnThs = NetStarUtils.convertToTree(columnThArray, 'field', 'parentId', 'children' );
            }else if(cubesLength == 2){
                // 如果属性列表长度 = 2 则列标题只输出第一个 attrList 中对应的
                var rowAttrId = _serverJson.attrList[0].id;
                for(var i=0; i<_serverJson.titleList.length; i++){
                    var titleObj = _serverJson.titleList[i];
                    if(rowAttrId != titleObj.attrId){
                        continue;
                    }
                    columnThArray.push({
                        title:titleObj.name,
                        field:titleObj.id,
                        parentId:titleObj.parentId,
                    })
                }
                columnThs = NetStarUtils.convertToTree(columnThArray, 'field', 'parentId', 'children' );
            }else{
    
            }
            return columnThs;
        },
        getRowThs:function(_serverJson){
            var cubesLength = this.cubesLength;
            var rowThArray = [];
            var rowThs = [];
            if(cubesLength == 1){
                // 如果属性列表长度 = 1 则行标题为空
                rowThs = [];
            }else if(cubesLength == 2){
                // 如果属性列表长度 = 2 则列标题只输出第一个 attrList 中对应的
                var rowAttrId = _serverJson.attrList[1].id;
                for(var i=0; i<_serverJson.titleList.length; i++){
                    var titleObj = _serverJson.titleList[i];
                    if(rowAttrId != titleObj.attrId){
                        continue;
                    }
                    rowThArray.push({
                        title:titleObj.name,
                        field:titleObj.id,
                        parentId:titleObj.parentId,
                    })
                }
    
                rowThs = NetStarUtils.convertToTree(rowThArray, 'field', 'parentId', 'children' );
                rowThs.unshift({});
            }
            return rowThs;
        }
    }
    function init(config, serverJson){
        /*  先处理数据 把服务器数据 
         *{
         *      attrList:[ {id:1, name:'牌号'}, ...], 
         *      titleList:[{id:10, name:'牌号1',   
         *      parentId:-1, attrId:1}, ...], valueList:[]
         * }
         * 转化为
         * {
         *      columnThs:[],
         *      rowThs:[],
         *      rowValues:[]
         * }
         */
        var cubesData = cubesDataManager.getData(serverJson);
        config.columnThs = cubesData.columnThs; //列标题 树形结构 {field:'id1', title:'标题', children:[]}
        config.rowThs = cubesData.rowThs;       //行标题 树形结构
        config.valueThs = cubesData.rowValues;  //输入值数组（二维数组）[[{value:'', id:'', xId:,yId,...},{}],[]]
        config.sourceServerJson = $.extend(true, {}, serverJson);
        config.serverJson = serverJson;

        var isPass = configManage.validConfig(config);
        if(!isPass){
            // 配置错误
            nsAlert('标准值配置错误', 'error');
            console.error(config);
            return false;
        }
        configById[config.id] = {
            source : $.extend(true, {}, config),
            config : config
        };
        configManage.setConfig(config);
        switch(config.type){
            case 'dialog':
                table.dialogInit(config);
                break;
            default:
                table.init(config);
                break;
        }
    }
    return {
        init : init,
        configById : configById,
        getValue : table.getValue,
        getSaveData : table.getSaveData,
    }
    
})($)