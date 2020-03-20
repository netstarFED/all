NetstarUI.exportXls = {
    writeFile:function(_config){
        var write_opts = {};
		if (_config.ext == 'xls') {
			write_opts.bookType = "xlml";
		} else {
			write_opts.bookType = _config.ext;
        }
        XLSX.utils.book_append_sheet(_config.bookXls,_config.wsArr[0], _config.sheetName);
        var html = _config.bookXls;
        XLSX.writeFile(html,_config.excelName + '.' + _config.ext, write_opts);
		_config.bookXls = null;//导出完清空
    },
    getWsData:function(dataSource,_config){
        var wsData = [];
        var columnById = _config.columnById;
        for(var dataI=0; dataI<dataSource.length; dataI++){
            var rowData = dataSource[dataI];
            var obj = {};
            $.each(columnById,function(cId,cItem){
                if(cItem.hidden === false){
                    var value = NetStarGrid.dataManager.getValueByColumnType(rowData[cId],rowData,cItem);
                    if(typeof(value)=='undefined'){value = '';}
                    var reg = /<[^>]+>/g;
                    if(reg.test(value)){
                        value = value.replace(reg,'');
                    }
                    obj[cItem.title] = typeof value == 'number' && value.toString().length >= 12 ? value.toString() : value;
                }
            })
            wsData.push(obj);
        }
        return wsData;
    },
    setDataSource:function(_config){
        var dataSource = _config.dataSource;
        if(dataSource.length == 0){
            nsalert('数据为空','error');
            return;
        }
        var ws = XLSX.utils.json_to_sheet(this.getWsData(dataSource,_config),{header:_config.theadNamesArr,cellDates: true});
        _config.wsArr.push(ws);
        $.each(_config.wsArr, function (index, item) {
			_config.colsArr.length > 0 ? item['!cols'] = _config.colsArr : "";
		});
        this.writeFile(_config);
    },
    getGridHeader:function(_config){
        var configs = NetStarGrid.configs[_config.id];
        var columnConfig = configs.original.columns;
        var keyValuesJson = {};	//拿到标题和key值相对应json
        var colsArr = [];			//列宽
        var theadNamesArr = []; //标题名字
        var columnFieldsArr = []; //字段名字
        for(var columnI=0; columnI<columnConfig.length; columnI++){
            var columnData = $.extend(true,{},columnConfig[columnI]);
            if(typeof(columnData.width)=='number'){
                //sheetWidth -= columnData.width;
            }
            if(columnData.hidden === false){
                //当前字段处于显示状态
                theadNamesArr.push(columnData.title);
                columnFieldsArr.push(columnData.field);
                keyValuesJson[columnData.field] = {
                    title:columnData.title,
                    formatHandler:columnData.formatHandler,
                    meta:{
                        col:columnI,
                        settings:{sTableId:_config.id}
                    }
                };
                colsArr.push({wpx:columnData.width});
            }
        }
        _config.theadNamesArr = theadNamesArr;
        _config.columnFieldsArr = columnFieldsArr;
        _config.colsArr = colsArr;
        _config.keyValuesJson = keyValuesJson;
        _config.columnById = configs.gridConfig.columnById;
    },
    wholeByExprot:function(_config){
        //获取标题头
        this.getGridHeader(_config);
        this.setDataSource(_config);//处理数据源
    },
    selectedByExport:function(){

    },
    checkboxByExport:function(){

    },
    setDefault:function(_config){
        var defaultParams = {
            type:'excel',
            ext:'xlsx',
            sheets:false,
            requestSource:'this',
            ajaxConfig:{},
            excelName:Number(new Date()),
            isServerMode:false,
            dataSource:[],
            bookXls:XLSX.utils.book_new(),//表格对象
            sheetName:'sheet_1',
            wsArr:[],
        };
        NetStarUtils.setDefaultValues(_config,defaultParams);
        if(!$.isEmptyObject(_config.ajaxConfig)){
            _config.isServerMode = true;
        }
    },
    init:function(_config){
        /**
         * type             string          导出类型  默认excel
         * id               string          表格id
         * excelName        string          导出显示的文件名
         * ext              string          文件后缀
         * sheets           boolean         是否分页 
         * requestSource    string          导出数据的来源（selected(导出当前选中值),checkbox（导出勾选的值）,this（导出整体表格））
         * ajaxConfig       object          当前导出数据是否根据此配置执行
        */
        this.setDefault(_config);
        var configs = NetStarGrid.configs[_config.id];
        if($.isEmptyObject(configs)){
            console.warn(configs);
            nsalert('参数配置有误','error');
            return;
        }
        if(_config.isServerMode){
            var serverAjaxConfig = $.extend(true,{},_config.ajaxConfig);
            serverAjaxConfig.plusData = {
                config:_config
            };
            NetStarUtils.ajax(serverAjaxConfig,function(res,ajaxOptions){
                if(res.success){
                    var config = ajaxOptions.plusData.config;
                    config.dataSource = res.rows;
                    if(!$.isArray(config.dataSource)){
                        config.dataSource = [];
                    }
                    switch(config.requestSource){
                        case 'this':
                            this.wholeByExprot(config);
                            break;
                        case 'selected':
                            this.selectedByExport(config);
                            break;
                        case 'checkbox':
                            this.checkboxByExport(config);
                            break;
                    }
                }
            },true)
        }else{
           _config.dataSource = NetStarGrid.dataManager.getData(_config.id);
            switch(_config.requestSource){
                case 'this':
                    this.wholeByExprot(_config);
                    break;
                case 'selected':
                    this.selectedByExport(_config);
                    break;
                case 'checkbox':
                    this.checkboxByExport(_config);
                    break;
            }
        }
    }
}