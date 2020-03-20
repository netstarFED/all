var NetstarStandardInput = (function($){
    var configById = {};
    // config管理器
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(config.type != "dialog"){
                if(typeof(config.id) != "string" || $('#' + config.id).length == 0){
                    isPass = false;
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                type : 'dialog',
                enterType : 'row',
                id : 'cubes-input',
                title : '弹框标题',
                colWidth : 100,
                rowHeight : 27,
                isSave : false,
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        setConfig : function(config){
            configManage.setDefault(config);
            config.tableId = config.id + '-body-table';
            config.headerId = config.id + '-header';
            config.bodyId = config.id + '-body';
            config.footerId = config.id + '-footer';
        },
        getConfig : function(id){
            var configs = configById[id];
            if(configs){
                return configs.config
            }
            return false;
        },
    }
    var table = {
        // 获取表格的html
        getTableHtml : function(config){
            var dataConfig = config.data;
            var columns = dataConfig.columns;
            var data = dataConfig.data;
            var columnObj = {};
            var thRowHtml = '<tr>';
            for(var i=0; i<columns.length; i++){
                columns[i]["ns-index"] = i;
                columnObj[columns[i].field] = columns[i];
                var thStr = '<th ns-index="' + i + '" ns-id="' + columns[i].field + '">' + columns[i].title + '</th>';
                thRowHtml += thStr;
            }
            thRowHtml += '</tr>';
            var rowsHtml = '';
            for(var i=0; i<data.length; i++){
                var tdRowHtml = '<tr>';
                for(var key in data[i]){
                    var editConnfig = columnObj[key];
                    if(typeof(editConnfig) == "undefined"){
                        continue;
                    }
                    var col = editConnfig["ns-index"];
                    var editHtml = '';
                    if(editConnfig.readonly){
                        editHtml = data[i][key];
                    }else{
                        switch(editConnfig.type){
                            case 'select':
                                var subdata = editConnfig.subData;
                                for(var h=0; h<subdata.length; h++){
                                    var selectedStr = '';
                                    if(subdata[h][editConnfig.valueField] === data[i][key]){
                                        selectedStr = 'selected';
                                    }
                                    editHtml += '<option value="' + subdata[h][editConnfig.valueField] + '" ' + selectedStr + '>' + subdata[h][editConnfig.textField] + '</option>';
                                }
                                editHtml = '<select>'
                                                + editHtml
                                            + '</select>'
                                break;
                            default:
                                editHtml = '<input class="pt-form-control" type="text"/ value=' + data[i][key] + ' row-index="' + i + '" col-index="' + col + '">';
                                break;
                        }
                    }
                    var tdStr = '<td ns-row="' + i + '" ns-col="' + col + '" ns-id="' + editConnfig.field + '">' + editHtml + '</td>';
                    tdRowHtml += tdStr;
                }
                rowsHtml += tdRowHtml;
            }
            var tableHtml = '<table class="pt-grid">'
                                + '<thead>' 
                                    + thRowHtml 
                                + '</thead>'
                                + '<tbody>' 
                                    + rowsHtml 
                                + '</tbody>'
                            + '</table>'
            // 完整表格的行数和列数
            config.showTable = {
                rowNum : data.length + 1,
                colNum : columns.length,
            }
            return tableHtml;
        },
        // 设置input排序
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
                if(inputArr[i]){
                    for(var j=0; j<inputArr[i].length; j++){
                        if(inputArr[i][j]){
                            _inputArr.push(inputArr[i][j]);
                        }
                    }
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
        // 设置表格事件
        setEvent : function($table, config){
            var $input = config.$input;
            $input.off('keydown');
            $input.on('keydown', function(ev){
                if(ev.keyCode == 13){
                    var $this = $(this);
                    var index = Number($this.attr('index'));
                    var nextIndex = index + 1;
                    if(index == config.inputMaxIndex){
                        nextIndex = 0;
                        return;
                    }
                    config.inputArr[nextIndex].focus();
                }
            });
            $input.off('focus');
            $input.on('focus', function(ev){
                var $this = $(this);
                $this.select();
            });
        },
        // 通过data获取编辑配置
        getEditConfig : function(dataConfig){
            var columns = dataConfig.columns;
            var editConfigArr = $.extend(true, [], columns);
            return editConfigArr;
        },
        // 获取html
        getPanelHtml : function(config){
            var html = '<div class="pt-standard-header" id="' + config.headerId + '"></div>'
                        + '<div class="pt-standard-body" id="' + config.bodyId + '">'
                            + '<div class="pt-cubes-input" id="' + config.tableId + '"></div>'
                        +'</div>'
                        + '<div class="pt-standard-footer" id="' + config.footerId + '"></div>'
            return html;
        },
        // 获取表格数据
        getTableData : function(id, isValida){
            isValida = typeof(isValida) == "boolean" ? isValida : true; // 默认验证
            var config = configManage.getConfig(id);
            if(!config){
                nsAlert('根据id=' + id + '没有找到config配置', 'error');
                console.error('根据id=' + id + '没有找到config配置');
                return false;
            }
            var $table = config.$table;
            var $tds = $table.find('td');
            var editConfigArr = config.editConfigArr;
            var data = [];
            var tableData = [];
            for(var i=0; i<$tds.length; i++){
                var $td = $tds.eq(i);
                var nsRow = Number($td.attr('ns-row'));
                var nsCol = Number($td.attr('ns-col'));
                var nsId = $td.attr('ns-id');
                var editConfig = editConfigArr[nsCol];
                var value = $td.text();
                data[nsRow] = $.isArray(data[nsRow]) ? data[nsRow] : [];
                tableData[nsRow] = typeof(tableData[nsRow]) == "object" ? tableData[nsRow] : {};
                if(!editConfig.readonly){
                    value = $td.children().val();
                }
                data[nsRow][nsCol] = value;
                tableData[nsRow][nsId] = value;
            }
            return {
                arr : data,
                obj : tableData,
            };
        },
        getSaveData : function(id){
            var config = configManage.getConfig(id);
            var saveData = false;
            var value = table.getTableData(config.id);
            if(value){                        
                saveData = value;
            }
            return saveData;
        },
        // 获取jQ表格
        getJQTable : function(config){
            var tableHtml = table.getTableHtml(config);
            var $table = $(tableHtml);
            table.setInputIndex($table, config);
            table.setEvent($table, config);
            return $table;
        },
        init : function(config){
            // 获取编辑配置
            config.editConfigArr = table.getEditConfig(config.data);
            // 设置面板
            var html = table.getPanelHtml(config);
            var $container = $('#' + config.id);
            $container.html(html);
            // 获取表格
            var $table = table.getJQTable(config);
            // 设置表格
            config.$table = $table;
            $('#' + config.tableId).append($table);
            if(config.isSave){
                var btnsHtml = btnManage.template.common;
                var $btns = $(btnsHtml);
                btnManage.setEvent($btns, config);
                $('#' + config.footerId).append($btns);
            }
        },
        // 获取弹框大小
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
            // 获取表格
            var $table = table.getJQTable(config);
            config.$table = $table;
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
                    config.$container.addClass("pt-cubes-input");
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
    }
    
    var btnManage = {
        template : {
            edit : '<div class="pt-btn-group">'
                        + '<button class="pt-btn pt-btn-default" ns-type="confirm">确定</button>'
                        + '<button class="pt-btn pt-btn-default" ns-type="close">关闭</button>'
                    + '</div>',
            dis : '<div class="pt-btn-group">'
                        + '<button class="pt-btn pt-btn-default" ns-type="close">关闭</button>'
                    + '</div>',
            common : '<div class="pt-btn-group">'
                        + '<button class="pt-btn pt-btn-default" ns-type="confirm">确定</button>'
                    + '</div>',
        },
        confirm : function(config){
            var saveData = table.getSaveData(config.id);
            if(saveData){
                if(typeof(config.confirmHandler) == "function"){
                    config.confirmHandler(saveData, config);
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
    var stdInputDataManager = {
        config: {},                     //配置   格式: {ajax:{}}
        data:{},                        //数据    格式: {attrList:[], valueList:[]}
        attrListField:'attrList',       //属性数组key
        valueListField:'valueList',     //值数组key
        subDataArray:[],                //属性下拉列表的数据 格式: {[],[]}
        //第一次获取数据
        getBaseDataByAjax: function (callbackFunc) {
            var _ajaxConfig = $.extend(true, {}, this.config.ajax);
            //第一次发ajax是不需要拼接id的
            _ajaxConfig.data = {};
            NetStarUtils.ajax(_ajaxConfig, function (res) {
                callbackFunc(res);
            });
        },
        //获取下拉列表数据
        getSubdataByAjax:function(callbackFunc){
            var _this = this;
            var _ajaxConfig = $.extend(true, {}, this.config.subDataAjax);
            //第二次发ajax，获取下拉列表数据 需要以id为参数
            var _ajaxData = {};
            var attrList =  _this.data[_this.attrListField];
            
            //对需要获取下拉列表的属性值ajaxData
            var ajaxDataKey = {};
            var patt = /\{(.*?)\}/g; 
            for(var key in _ajaxConfig.data){
                var valueStr = _ajaxConfig.data[key];
                while ((result = patt.exec(valueStr)) != null)  {
                    ajaxDataKey[key] = result[1];
                }
            }

            //添加ajax.data的数组 {id:"{id}"} => {id:2} 需要获取下拉列表数据的数组
            var ajaxDataArray = [];
            var selectAttrArray = [];
            for(var i = 0; i < attrList.length; i++){
                if(attrList[i].isNumerical == true){
                    //如果是数字则跳过
                    continue;
                }
                selectAttrArray.push(attrList[i]);
                var ajaxData = $.extend(true, {}, _ajaxConfig.data);
                for(var key in ajaxData ){
                    if(typeof(ajaxDataKey[key]) == 'string'){
                        //如果是需要替换的key，则读取当前attrList的数据
                        var _value = attrList[i][ajaxDataKey[key]];
                        ajaxData [key]= _value;
                    }
                }
                ajaxDataArray.push({key:attrList[i].cal, ajaxData:ajaxData});
            }

            var resObj = {};
            var resObjLength = 0;
            for(var resI = 0; resI<ajaxDataArray.length; resI++ ){
                var _ajaxData = ajaxDataArray[resI].ajaxData;
                var _cajaxConfig = $.extend(true, {}, _ajaxConfig);
                _cajaxConfig.data = _ajaxData;
                _cajaxConfig.plusData = {key:ajaxDataArray[resI].key}
                NetStarUtils.ajax(_cajaxConfig, function (res, _resConfig) {
                    resObjLength ++;
                    resObj[_resConfig.plusData.key] = res;
                    if(resObjLength == ajaxDataArray.length){
                        callbackFunc(resObj);
                    }
                });
            }
            
        },
        //获取表格配置
        getTableConfig:function(){
            var _this = this;

            //获取列配置
            var _config = {};
            var columns = [];
            for(var i = 0; i < _this.data.attrList.length; i++){
                var attr = _this.data.attrList[i];
                var column = {
                    field :     attr.cal,
                    title :     attr.name,
                    type:       attr.isNumerical?'text':'select',
                    
                };

                if(column.type == 'select'){
                    column.subData      =  _this.subDataObj[attr.cal].rows;
                    column.textField    =  _this.config.attrTextField;
                    column.valueField   =  _this.config.attrValueField;
                }
                columns.push(column);
            }

            //默认的基本配置
            columns.push({
                field :     "value",
                title :     "值",
                type  :     "text",
            })
            columns.push({
                field :     "customValue",
                title :     "表达式",
                type  :     "text",
            })

            _config.columns = columns;
            _config.data = _this.data.valueList;

            //获取表格数据

            return _config;
        },
        //主要的获取数据入口
        get: function (_config) {
            var _this = this;
            _this.config = _config;
            //获取基本数据
            _this.getBaseDataByAjax(function(res){
                _this.data = res.data;
                //this.data 格式： {attrList:[], valueList:[]}

                //根据基本数据中的attrList的属性id获取下拉列表的数据
                _this.getSubdataByAjax(function(subDataObj){
                    console.log(subDataObj);
                    _this.subDataObj = subDataObj;
                    
                    //根据下拉列表的数据
                    var tableConfig = _this.getTableConfig();
                    if(_config.getDataCallbackFunc){
                        _config.getDataCallbackFunc(tableConfig, _config);
                    }
                });
            })
        }
    }
    function show(config){
        switch(config.type){
            case 'dialog':
                table.dialogInit(config);
                break;
            default:
                table.init(config);
                break;
        }
    }
    function init(config){
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
        config.getDataCallbackFunc = function(resData, _config){
            _config.data = resData;
            show(_config);
        }
        stdInputDataManager.get(config);
        
    }
    return {
        init : init,
        getSaveData  : table.getSaveData,
    }
})(jQuery)