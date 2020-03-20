/*
 * 表格用户管理面板
 */

var pageN = 0; //开始条数
var recordsTotal = 10;
nsList.blockTable = {
    data: {},
    originalRowsData: [],
    container: {},
    rowData: {},
    closeBtnObj: {},
    htmlJson: {},
};
nsList.blockTable.parseFilters = function (exp) {
	var inSingle = false;
	var inDouble = false;
	var inTemplateString = false;
	var inRegex = false;
	var curly = 0;
	var square = 0;
	var paren = 0;
	var lastFilterIndex = 0;
	var c, prev, i, expression, filters;

	for (i = 0; i < exp.length; i++) {
		prev = c;
		c = exp.charCodeAt(i);
		if (inSingle) {
			if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
		} else if (inDouble) {
			if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
		} else if (inTemplateString) {
			if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
		} else if (inRegex) {
			if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
		} else if (
			c === 0x7C && // pipe
			exp.charCodeAt(i + 1) !== 0x7C &&
			exp.charCodeAt(i - 1) !== 0x7C &&
			!curly && !square && !paren
		) {
			if (expression === undefined) {
				// first filter, end of expression
				lastFilterIndex = i + 1;
				expression = exp.slice(0, i).trim();
			} else {
				pushFilter();
			}
		} else {
			switch (c) {
				case 0x22: inDouble = true; break         // "
				case 0x27: inSingle = true; break         // '
				case 0x60: inTemplateString = true; break // `
				case 0x28: paren++; break                 // (
				case 0x29: paren--; break                 // )
				case 0x5B: square++; break                // [
				case 0x5D: square--; break                // ]
				case 0x7B: curly++; break                 // {
				case 0x7D: curly--; break                 // }
			}
			if (c === 0x2f) { // /
				var j = i - 1;
				var p = (void 0);
				// find first non-whitespace prev char
				for (; j >= 0; j--) {
					p = exp.charAt(j);
					if (p !== ' ') { break }
				}
				if (!p || !validDivisionCharRE.test(p)) {
					inRegex = true;
				}
			}
		}
	}

	if (expression === undefined) {
		expression = exp.slice(0, i).trim();
	} else if (lastFilterIndex !== 0) {
		pushFilter();
	}

	function pushFilter() {
		(filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
		lastFilterIndex = i + 1;
	}

	if (filters) {
		for (i = 0; i < filters.length; i++) {
			expression = wrapFilter(expression, filters[i]);
		}
	}
	return expression;
}
nsList.blockTable.getHtmlByRegular = function (data, text,dictionaryData) {
	/*
		data object 匹配的数据值
		expression string 正则匹配的表达式
	*/
	var tokens = [];
	var tagRE = /\{\{((?:.|\n)+?)\}\}/g;
	var lastIndex = tagRE.lastIndex = 0;
	var match, index, tokenValue;
	var html = '';
	var isContinue = true;
	while ((match = tagRE.exec(text))) {
		index = match.index;
		// push text token
		if (index > lastIndex) {
			tokenValue = text.slice(lastIndex, index)
			tokens.push(tokenValue);
		}
		// tag token
		var exp = nsList.blockTable.parseFilters(match[1].trim());
		if(dictionaryData){
			var dictionaryStr = dictionaryData[exp][data[exp]] ?dictionaryData[exp][data[exp]] : '';
			tokens.push(dictionaryStr);
			if(dictionaryStr == ''){
				isContinue = false;
			}
		}else{
			var dictionaryStr = data[exp] ? data[exp] : '';
			tokens.push(dictionaryStr);
			if(dictionaryStr == ''){
				isContinue = false;
			}
		}
		lastIndex = index + match[0].length;
	}
	if(!isContinue){
		html = '';
	}else{
		if (lastIndex < text.length) {
			tokenValue = text.slice(lastIndex)
			tokens.push(tokenValue);
		}
		for (var i = 0; i < tokens.length; i++) { html += tokens[i]; }
	}
	return html;
}
//设置默认值 cy 20180824
nsList.blockTable.setDefalut = function (dataConfig, columnConfig, uiConfig) {
    pageN = 0;
    recordsTotal = 10;
    //设定uiConfig.selectMode  single/multi/none;
    if (typeof (uiConfig.selectMode) == 'string') {
        if (debugerMode) {
            if (typeof (uiConfig.isSingleSelect) != 'undefined') {
                delete uiConfig.isSingleSelect;
                //console.warn('uiConfig.selectMode已经设定为："'+uiConfig.selectMode+'" 已经自动忽略 isSingleSelect 属性');
            }
            if (typeof (uiConfig.isMulitSelect) != 'undefined') {
                delete uiConfig.isMulitSelect;
                //console.warn('uiConfig.selectMode已经设定为："'+uiConfig.selectMode+'" 已经自动忽略 isMulitSelect 属性');
            }
        }
    } else {
        if (uiConfig.isSingleSelect) {
            uiConfig.selectMode = 'single';
        } else if (uiConfig.isSingleSelect) {
            uiConfig.selectMode = 'multi';
        } else {
            uiConfig.selectMode = 'none';
        }
    }
    uiConfig.isClass = typeof (uiConfig.isClass) == 'boolean' ? uiConfig.isClass : true;
}
nsList.blockTable.dropCommonBtnHandler = function ($dom) {
    var navId = $dom.closest('.nav-form').attr('id');
    var prefixStr = 'nav-moblieButtons-';
    var tableId = navId.substring(prefixStr.length, navId.length);
    var btns = nsList.blockTable.data[tableId].uiConfig.btns;
    var optionId = $dom.children('a').attr('optionid');
    var functionConfig = btns[optionId].functionConfig;
    var data = nsList.blockTable.data[tableId].data;
    var dataConfig = nsList.blockTable.data[tableId].dataConfig;
    if(typeof(btns[optionId].btn.handler)=='function'){
        btns[optionId].btn.handler({$disabledBtn:$dom,buttonIndex:optionId,rowData:data,tableId:tableId,idField:dataConfig.primaryID});
    }
    /*var url = functionConfig.url;
    var jsonData = {
        data: data,
        url: window.location.href
    };
    if (url) {
        $dom.closest('.nav-form').remove();
        var pageParam = JSON.stringify(jsonData);
        pageParam = encodeURIComponent(encodeURIComponent(pageParam));
        var url = url + '?templateparam=' + pageParam;
        nsFrame.loadPage(url);
    } else {
        nsalert('不存在的跳转链接');
        console.warn(functionConfig);
    }*/
}
nsList.blockTable.dropBtnHandler = function (data) {
    /*
    	tableId:tableId,
    	type:'block',
    	rowIndex:rowIndex,
    	rowData:dataSource[rowIndex],
    	columnField:columnFieldArray,
    	buttonIndex:nIndex,
    	nsIndex:nIndex
    */
    var tableObj = nsList.blockTable.data[data.tableId];
    var moreBtnData = tableObj.columnDropbtnObject[data.nsIndex];
    nsList.blockTable.data[data.tableId].data = data.rowData;
    if (data.classFlag) {
        moreBtnData = tableObj.columnClassBtnObject[data.classFlag][data.nsIndex];
    }
    var btnArray = [];
    if ($.isArray(moreBtnData.subdata)) {
        if (nsList.blockTable.data[data.tableId].uiConfig.btns) {
            btnArray = nsTemplate.getBtnArrayByBtns(nsList.blockTable.data[data.tableId].uiConfig.btns);
            var telBtnIndex = -1;
            var emailBtnIndex = -1;
            for (var btnI = 0; btnI < btnArray.length; btnI++) {
                btnArray[btnI].handler = nsList.blockTable.dropCommonBtnHandler;
                if(nsList.blockTable.data[data.tableId].uiConfig.btns[btnI].btn.index){
                    nsVals.extendJSON(btnArray[btnI].index,nsList.blockTable.data[data.tableId].uiConfig.btns[btnI].btn.index);
                }
                if(btnArray[btnI].text.indexOf('{')>-1){
                    var dictionaryConfig = JSON.parse(btnArray[btnI].text);
                    switch(dictionaryConfig.formatHandler.type){
                        case 'changeBtn':
                            $.each(dictionaryConfig.formatHandler.data,function(key,value){
                                if (key == data.rowData[dictionaryConfig.field]){
                                    btnArray[btnI].text = value.text;
                                    if(value.icon){
                                        btnArray[btnI].index.iconCls = value.icon;
                                    }
                                }
                            });
                            break;
                        case 'dictionary':
                            $.each(dictionaryConfig.formatHandler.data,function(key,value){
                                if (key == data.rowData[dictionaryConfig.field]){
                                    btnArray[btnI].text = value;
                                }
                            });
                            if(dictionaryConfig.formatHandler.icon){
                                $.each(dictionaryConfig.formatHandler.icon,function(key,value){
                                    if (key == data.rowData[dictionaryConfig.field]){btnArray[btnI].index.iconCls = value;}
                                });
                            }
                            break;
                    }
                }
                var sourceField = nsList.blockTable.data[data.tableId].uiConfig.btns[btnI].functionConfig.sourceField;
                if(btnArray[btnI].text == '打电话'){
                    btnArray[btnI].index.iconCls = '<i class="icon-tel-alt-o"></i>';
                    if(sourceField){
                        if(data.rowData[sourceField]){
                            btnArray[btnI].disabled = false;
                            btnArray[btnI].href = 'tel:'+data.rowData[sourceField];
                        }else{
                            telBtnIndex = btnI;
                            btnArray[btnI].disabled = true;
                            btnArray[btnI].href = 'javascript:void(0);';
                            btnArray[btnI].configShow = false;
                        }
                    }
                    delete btnArray[btnI].handler;
                }else if(btnArray[btnI].text == '发邮件'){
                    btnArray[btnI].index.iconCls = '<i class="icon-mail-o"></i>';
                    if(sourceField){
                        if(data.rowData[sourceField]){
                            emailBtnIndex = btnI;
                            btnArray[btnI].configShow = false;
                        }
                        btnArray[btnI].href = 'email:'+data.rowData[sourceField];
                    }
                    delete btnArray[btnI].handler;
                }
            }
            if(telBtnIndex > -1){
               // btnArray.splice(telBtnIndex,1);
            }
        }
        var id = 'nav-moblieButtons-' + data.tableId;
        var navHtml = '<div class="nav-form mobile-menu-buttons" nspanel="moblieButtons" id="' + id + '"></div>';
        $('#' + id).remove();
        $('body').append(navHtml);
        var $container = $('#' + id);
        $container.off('click');
        $container.on('click', function (ev) {
            $(this).remove();
        });
        var navJson = {
            id: id,
            isShowTitle: false,
            btns: [
                [{
                    hidden: true,
                    subdata: btnArray
                }]
            ]
        }
        nsNav.init(navJson);
    }
}
nsList.blockTable.init = function (dataConfig, columnConfig, uiConfig) {
    nsList.blockTable.setDefalut(dataConfig, columnConfig, uiConfig);
    var blockTableId = dataConfig.tableID;
    var columnSimpleFieldArray = []; //转换列数据相关属性
    var columnClassFieldObject = {};
    var columnBtnHandler = {}; //列按钮事件
    var columnSelectHandler = {}; //自定义列select事件
    var columnDropbtnObject = {}; //展开更多按钮的操作 手机端
    var columnClassBtnObject = {}; //分类btn
    var rowStateObject = {}; //行状态
    nsList.blockTable.htmlJson[blockTableId] = {};
    //自定义组件
    function componentCompleteHandler(data) {

    }
    //读取列配置
    function convertColumnData(columnConfig, classFlag) {
        var columnFieldArray = [];
        if (classFlag) {
            columnClassBtnObject[classFlag] = {};
            rowStateObject[classFlag] = {};
        }
        for (var colI = 0; colI < columnConfig.length; colI++) {
            var isHidden = typeof (columnConfig[colI].hidden) == 'boolean' ? columnConfig[colI].hidden : false;
            columnFieldArray.push({
                id: columnConfig[colI].field,
                isShowTitle: typeof (columnConfig[colI].isShowTitle) == 'boolean' ? columnConfig[colI].isShowTitle : false, //默认不显示
                title: typeof (columnConfig[colI].title) == 'string' ? columnConfig[colI].title : '', //如果title未定义默认为空
                position: typeof (columnConfig[colI].position) == 'string' ? columnConfig[colI].position : '', //position默认为text
                plusClass: typeof (columnConfig[colI].plusClass) == 'string' ? columnConfig[colI].plusClass : 'text',
                type: 'text',
                hidden: isHidden,
                classType: columnConfig[colI].type ? columnConfig[colI].type : '',
                icon: columnConfig[colI].icon ? columnConfig[colI].icon : '',
                customHtml: columnConfig[colI].customHtml
            });
            if (columnConfig[colI].position) {
                switch (columnConfig[colI].position) {
                    //case 'title':
                    case 'left':
                    case 'right':
                    case 'bottom':
                    case 'top':
                        if (!$.isArray(nsList.blockTable.htmlJson[blockTableId][columnConfig[colI].position])) {
                            nsList.blockTable.htmlJson[blockTableId][columnConfig[colI].position] = [];
                        }
                        nsList.blockTable.htmlJson[blockTableId][columnConfig[colI].position].push(colI);
                        break;
                }
            }
            if (typeof (columnConfig[colI].formatHandler) == 'object') {
                var customerFormatHandler = columnConfig[colI].formatHandler;
                var valueStr = '';
                switch (customerFormatHandler.type) {
                    case 'button':
                        for (var btnI = 0; btnI < customerFormatHandler.data.subdata.length; btnI++) {
                            for (var btn in customerFormatHandler.data.subdata[btnI]) {
                                columnBtnHandler[btnI] = customerFormatHandler.data.subdata[btnI][btn];
                                var btnJson = {
                                    text: btn,
                                    handler: customerFormatHandler.data.subdata[btnI][btn],
                                    isReturn: true,
                                    index: {
                                        fid: btnI
                                    }
                                }
                                valueStr += nsButton.getHtml(btnJson);
                            }
                        }
                        break;
                    case 'moblieButtons':
                        var btnJson = {
                            text: customerFormatHandler.text,
                            isReturn: true,
                            isShowText: false,
                            index: {
                                fid: colI,
                                nstype: 'moblieButtons'
                            }
                        };
                        if (classFlag) {
                            btnJson.index.classkey = classFlag;
                            columnClassBtnObject[classFlag][colI] = customerFormatHandler.data;
                        }
                        valueStr = nsButton.getHtml(btnJson);
                        columnDropbtnObject[colI] = customerFormatHandler.data;
                        break;
					case 'dictionary':
					case 'diffday':
                        valueStr = customerFormatHandler.data;
                        break;
                    case 'select':
                        valueStr = customerFormatHandler.data.subdata;
                        columnSelectHandler[colI] = customerFormatHandler.data.handler;
                        columnFieldArray[colI].customerField = customerFormatHandler.data;
                        break;
                    case 'icon':
                        break;
                    case 'brage':
                        break;
                    case 'href':
                        valueStr = customerFormatHandler.data;
                        break;
                    case 'closebtn':
                        nsList.blockTable.closeBtnObj[blockTableId] = customerFormatHandler.data;
                        break;
                    case 'serialState':
                        columnFieldArray[colI].data = customerFormatHandler.data;
                        break;
                    case 'class-dictionary':
                        columnFieldArray[colI].data = customerFormatHandler.data;
                        break;
                    case 'rowstate':
                        columnFieldArray[colI].data = customerFormatHandler.data;
                        rowStateObject[classFlag] = customerFormatHandler.data;
                    case 'date':
                        columnFieldArray[colI].data = customerFormatHandler.data;
                        break;
                }
                columnFieldArray[colI].type = customerFormatHandler.type;
                columnFieldArray[colI].value = valueStr;
            } else if (typeof (columnConfig[colI].formatHandler) == 'function') {
                columnFieldArray[colI].type = 'function';
                columnFieldArray[colI].value = columnConfig[colI].formatHandler;
            }
        }
        return columnFieldArray;
    }
    if (typeof (columnConfig) == 'object') {
        if ($.isArray(columnConfig)) {
            columnSimpleFieldArray = convertColumnData(columnConfig); //调用转换列数据配置属性
        } else {
            $.each(columnConfig, function (key, value) {
                columnClassFieldObject[key] = convertColumnData(value.field, key);
            });
        }
    }
    //输出面板
    var titleHtml = '';
    if (uiConfig.title) {
        titleHtml = '<h3>' + uiConfig.title + '</h3>';
    }
    var containerId = 'blocktable-component-' + blockTableId;
    var containerHtml = '';
    if (uiConfig.component) {
        containerHtml = '<div id="' + containerId + '" class="blocktable-component"></div>';
    }
    var attrClassStr = nsVals.browser.browserSystem;
    if (uiConfig.mode) {
        attrClassStr = ' block-tags-' + uiConfig.mode;
    }
    var html = titleHtml + containerHtml + '<div class="block-tags ' + attrClassStr + '" nsList="block" id="' + blockTableId + '"></div>';
    uiConfig.$container.html(html);
    if (uiConfig.component) {
        var pageConfig = {
            containerId: containerId
        };
        uiConfig.component.init(pageConfig, componentCompleteHandler);
    }
    var $blockTable = $('#' + blockTableId);
    nsList.blockTable.data[blockTableId] = {
        dataConfig: dataConfig,
        columnConfig: columnConfig,
        uiConfig: uiConfig,
        columnField: columnSimpleFieldArray,
        columnBtnHandler: columnBtnHandler,
        columnDropbtnObject: columnDropbtnObject,
        columnSelectHandler: columnSelectHandler,
        columnClassFieldObject: columnClassFieldObject,
        columnClassBtnObject: columnClassBtnObject,
        rowStateObject: rowStateObject
    };
    nsList.blockTable.container[blockTableId] = {
        $table: $blockTable
    };
    nsList.blockTable.rowData[blockTableId] = {};
    //读取数据
    if (dataConfig.src) {
        //如果定义了url参数则调用ajax获取数据
        var listAjax = {
            url: dataConfig.src,
            type: dataConfig.type,
            data: dataConfig.data
        }
        if (typeof (dataConfig.isServerMode) == 'boolean') {
            if (dataConfig.isServerMode == true) {
                var params = {};
                if (typeof (dataConfig.data) == 'string') {
                    if (dataConfig.data) {
                        params = JSON.parse(dataConfig.data);
                    }
                } else if (typeof (dataConfig.data) == 'object') {
                    params = $.extend(true, {}, dataConfig.data);
                }
                params.start = 0;
                params.length = 10;
                if (typeof (uiConfig.pageLengthMenu) == 'number') {
                    params.length = uiConfig.pageLengthMenu;
                }
                listAjax.data = JSON.stringify(params);
                listAjax.contentType = "application/json; charset=utf-8";
            }
        }
        nsVals.ajax(listAjax, function (res) {
            nsList.blockTable.originalRowsData[blockTableId] = $.extend(true, [], res[dataConfig.dataSrc]);
            nsList.blockTable.data[blockTableId].dataConfig.dataSource = $.extend(true, [], res[dataConfig.dataSrc]);
            nsList.blockTable.getHtml(blockTableId, res[dataConfig.dataSrc]);
           // nsList.data[blockTableId].serverData = res;
            //recordsTotal = Number(nsList.data[blockTableId].serverData.recordsTotal);
            if (nsVals.browser.browserSystem == 'mobile' && nsList.blockTable.data[blockTableId].dataConfig.dataSource.length>0){
                $(document).ready(function () {
                    $(window).off('scroll', nsList.blockTable.scrollHandler);
                    $(window).on('scroll', nsList.blockTable.scrollHandler);
                });
            }
        });
    } else {
        nsList.blockTable.originalRowsData[blockTableId] = $.extend(true, [], dataConfig.dataSource);
        nsList.blockTable.data[blockTableId].dataConfig.dataSource = $.extend(true, [], dataConfig.dataSource);
        nsList.blockTable.getHtml(blockTableId, dataConfig.dataSource);
        
        if (nsVals.browser.browserSystem == 'mobile' && nsList.blockTable.data[blockTableId].dataConfig.dataSource.length>0){
            $(document).ready(function () {
                $(window).off('scroll', nsList.blockTable.scrollHandler);
                $(window).on('scroll', nsList.blockTable.scrollHandler);
            });
        }
    }  
}
nsList.blockTable.scrollHandler = function(ev){
    //手机端模式
    ev.preventDefault();
    var isContinue = true;
    if($('container .mobile-crm-search-table').length>0){
        if($('.mobilewindow-halfscreen').length > 0){
            if(!$('.mobilewindow-halfscreen').hasClass('hide')){
                isContinue = false;
            }
        }
    }
    if(isContinue){
        var range = 0; //距下边界长度/单位px
        var totalheight = 0;
        var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
        totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
        if (($(document).height() - range) <= totalheight) {
            //ajax请求
            var isContinue = true;
            var layoutId = $('nstemplate >div.mobile-crm-search-form').attr('id');
            if (typeof (layoutId) == 'undefined') {
                isContinue = false;
            }
            if(isContinue){
                layoutId = layoutId.substring(0, layoutId.length - 5);
                if (typeof (layoutId) == 'undefined') {
                    $(window).off('scroll', nsList.blockTable.scrollHandler);
                    isContinue = false;
                };
            }
            if(isContinue){
                if (typeof (nsTemplate.templates.listFilter.data[layoutId]) == 'undefined') {
                    $(window).off('scroll', nsList.blockTable.scrollHandler);
                    isContinue = false;
                }
            }
            if(isContinue){
                if($('.mobilewindow-halfscreen').length > 0){
                    if(!$('.mobilewindow-halfscreen').hasClass('hide')){
                        isContinue = false;
                        //$('body').css({'overflow-x':'hidden','overflow-y':'hidden'});
                    }
                }
            }
            if(isContinue){
                var tpConfig = nsTemplate.templates.listFilter.data[layoutId].config;
                if (tpConfig) {
                    //已经滑动到底部
                    pageN++; ///页码0  页码1  页码2  页码3 页码4 页码5
                    var startPage = pageN * 10;
                    //$(window).scrollTop(totalheight);
                    var blockTableId = 'table-' + tpConfig.id + '-table';
                    $('#' + blockTableId).children('.list-data-loading').remove();
                    if(recordsTotal < startPage){
                        var html = '<div class="list-no-data no-data">没有更多咯~</div>';
                        $('#' + blockTableId).children('.list-no-data').remove();
                        $('#' + blockTableId).append(html);
                        return false;
                    }
                    $('#'+blockTableId).append('<div class="list-data-loading"></div>');
                    var formId = tpConfig.id + '-form';
                    var formParamsObject = nsTemplate.getChargeDataByForm(formId, false);
                    tableParamsObject = $.extend(true, {}, formParamsObject);
                    for (var param in tpConfig.table.ajax.data) {
                        tableParamsObject[param] = tpConfig.table.ajax.data[param];
                    }
                    tableParamsObject.start = startPage;
                    tableParamsObject.length = 10;
                    var listAjax = nsVals.getAjaxConfig(tpConfig.table.ajax, tableParamsObject, {
                        idField: tpConfig.table.idField,
                        keyField: tpConfig.table.keyField,
                        pageParam: tpConfig.pageParam,
                        parentObj: tpConfig.parentObj
                    });
                    listAjax.plusData = {
                        tableId: 'table-' + tpConfig.id + '-table',
                        dataSrc: tpConfig.table.ajax.dataSrc,
                        startPage: startPage
                    };
                    nsVals.ajax(listAjax, function (res, ajaxData) {
                        if (res.success) {
                            //加载成功
                            $('#' + blockTableId).children('.list-data-loading').remove();
                            var dataArray = res[ajaxData.plusData.dataSrc];
                            var tableId = ajaxData.plusData.tableId;
                            nsList.data[tableId].serverData = res;
                            recordsTotal = Number(nsList.data[blockTableId].serverData.recordsTotal);
                            //var dataArray = [];
                            if (!$.isArray(dataArray)) {
                                dataArray = [];
                            }
                            //console.log(ajaxData.plusData.startPage)
                            var originalRowsData = nsList.data[tableId].dataConfig.dataSource;
                            var uiConfig = nsList.data[tableId].uiConfig;
                            var html = '';
                            if (dataArray.length > 0) {
                                if (typeof (uiConfig.classConfig) == 'object') {
                                    if (uiConfig.classConfig.classField) {
                                        var classField = uiConfig.classConfig.classField;
                                        if (dataArray[0][classField]) {
                                            if (originalRowsData[originalRowsData.length - 1][classField] == dataArray[0][classField]) {
                                                dataArray[0].isShowClassTitle = false;
                                            }
                                        }
                                    }
                                }
                                html = nsList.blockTable.getTableHtml(tableId, dataArray);
                                $('#' + tableId + ' .row').append(html);
                                nsList.blockTable.eventHandler(tableId, dataArray);
                            } else {
                                // html = '<div class="empty-content">暂无数据</div>';
                                html = '<div class="list-no-data no-data">没有更多咯~</div>';
                                $('#' + blockTableId).children('.list-no-data').remove();
                                $('#' + tableId).append(html);
                            }
                        }
                    }, true);
                }
            }
        }
    }
}
nsList.blockTable.eventHandler = function (tableId, dataSource) {
    var $blockTable = nsList.blockTable.container[tableId].$table;
    var columnFieldArray = nsList.blockTable.data[tableId].columnField;
    var fillClassStr = '';
    var uiConfig = nsList.blockTable.data[tableId].uiConfig;
    var dataConfig = nsList.blockTable.data[tableId].dataConfig;
    var isSerialNumber = typeof (dataConfig.isSerialNumber) == 'boolean' ? dataConfig.isSerialNumber : true;
    $blockTable.find('.fa.fa-close').off('click');
    $blockTable.find('.fa.fa-close').on('click', function (event) {
        event.stopPropagation();
        var $this = $(this);
        var tableId = $this.closest('[nslist="block"]').attr('id');
        var nIndex = $this.parent().children('.block-tags-content').attr('nsindex');
        var closeBtnObj = nsList.blockTable.closeBtnObj[tableId];
        if (typeof (closeBtnObj) == 'object') {
            var closeBtnAjax = closeBtnObj.functionConfig;
            var handler = closeBtnObj.handler;
            if (!$.isEmptyObject(closeBtnAjax)) {
                var jsonData = {
                    tableId: tableId,
                    // rowData:nsList.blockTable.originalRowsData[tableId][nIndex]
                    rowData: nsList.blockTable.data[tableId].dataConfig.dataSource[nIndex]
                };
                if (typeof (handler.delChildBtnHandler) == 'function') {
                    handler.delChildBtnHandler(jsonData, closeBtnObj);
                }
                /*var obj = handler.dialogBeforeHandler(jsonData);
                var paramsObj = $.extend(true,{},obj.value);
                //paramsObj.objecState = NSSAVEDATAFLAG.DELETE;
                var optionsObj = {
                	dialogBeforeHandler:{
                		btnOptionsConfig:obj.btnOptionsConfig,
                		selectData:paramsObj,
                		containerFormJson:obj.containerFormJson
                	}
                };
                optionsObj = handler.ajaxBeforeHandler(optionsObj);
                var listAjax = nsVals.getAjaxConfig(closeBtnAjax,paramsObj,optionsObj);
                listAjax.plusData = {
                	delChildBtnHandler:handler.delChildBtnHandler,
                	dataSrc:closeBtnAjax.dataSrc
                };
                nsVals.ajax(listAjax,function(res,ajaxData){
                	var resData = res;
                	if(typeof(ajaxData.dataSrc)=='string'){
                		resData = res[ajaxData.dataSrc];
                	}
                	ajaxData.plusData.delChildBtnHandler(resData,{tableId:tableId});
                });*/
            }
        } else {
            // nsList.blockTable.originalRowsData[tableId].splice(nIndex,1);
            nsList.blockTable.data[tableId].dataConfig.dataSource.splice(nIndex, 1);
            // nsList.blockTable.getHtml(tableId,nsList.blockTable.originalRowsData[tableId]);
            nsList.blockTable.getHtml(tableId, nsList.blockTable.data[tableId].dataConfig.dataSource);
        }
    });
    $blockTable.find('.block-tags-content').off('click');
    $blockTable.find('.block-tags-content').on('click', function (event) {
        event.stopPropagation();
        //基础属性
        var $this = $(this);
        var tableId = $this.closest('[nslist="block"]').attr('id');
        var nIndex = $this.attr('nsindex');
        // var dataSource = nsList.blockTable.originalRowsData[tableId];
        var dataSource = nsList.blockTable.data[tableId].dataConfig.dataSource;
        var uiConfig = nsList.blockTable.data[tableId].uiConfig;

        //选中状态切换
        switch (uiConfig.selectMode) {
            case 'multi':
                $this.toggleClass('selected');
                break;
            case 'single':
                $this.toggleClass('selected');
                break;
            case 'none':
                break;
        }


        var selectMode = '';
        if (uiConfig.isSingleSelect == true) {
            selectMode = 'single';
        }
        if (uiConfig.isMulitSelect == true) {
            selectMode = 'multi';
        }

        function selectHandler() {
            switch (selectMode) {
                case 'single':
                    nsList.blockTable.rowData[tableId].data = dataSource[nIndex];
                    break;
                case 'multi':
                    if (!$.isArray(nsList.blockTable.rowData[tableId].data)) {
                        nsList.blockTable.rowData[tableId].data = [];
                    }
                    nsList.blockTable.rowData[tableId].data.push(dataSource[nIndex]);
                    break;
            }
            if (typeof (uiConfig.onSingleSelectHandler) == 'function') {
                uiConfig.onSingleSelectHandler({
                    obj: $this,
                    tableID: tableId
                });
            }
        }

        function cancelSelectHandler() {
            switch (selectMode) {
                case 'single':
                    nsList.blockTable.rowData[tableId].data = {};
                    break;
                case 'multi':
                    var multiRowData = nsList.blockTable.rowData[tableId].data;
                    if ($.isArray(multiRowData)) {
                        for (var mutilI = 0; mutilI < multiRowData.length; mutilI++) {
                            if (isObjectValueEqual(dataSource[nIndex], multiRowData[mutilI])) {
                                multiRowData.splice(mutilI, 1);
                            }
                        }
                    }
                    break;
            }
        }
        if ($this.hasClass('selected')) {
            //执行选中事件
            selectHandler();
        } else {
            //执行取消选中事件
            cancelSelectHandler();
        }

        //clickHandler cy 2018.08.24
        if (typeof (uiConfig.clickHandler) == 'function') {
            /***回调返回数据是event 和 data
             * {
             * 		event:object 		jquery的event对象
             * 		data:object  		数据
             *		isSelected:boolean 	是否选中
             * 		$dom:jquery $(DOM) 	当前操作对象
             * 		selectDatas:array 	选中的数据 暂时没写
             * 	}
             ***/
            var returnObj = {};
            returnObj.event = event;
            returnObj.data = dataSource[nIndex];
            returnObj.isSelected = $this.hasClass('selected');
            returnObj.$dom = $this;
            uiConfig.clickHandler(returnObj);
        }
    });
    $blockTable.find('button[type="button"]').on('click', blockTableBtnHandler);

    function blockTableBtnHandler(ev) {
        ev.stopPropagation();
        var $this = $(this);
        var nIndex = $this.attr('fid');
        var tableId = $this.closest('[nsList="block"]').attr('id');
        var rowIndex = $this.closest('.block-tags-content').attr('nsIndex');
        var classFlag = $this.attr('classkey');
        var returnObj = {
            tableId: tableId,
            type: 'block',
            rowIndex: rowIndex,
            rowData: dataSource[rowIndex],
            columnField: columnFieldArray,
            buttonIndex: nIndex,
            nsIndex: nIndex,
            classFlag: classFlag,
        };
        if ($this.attr('nstype') == 'moblieButtons') {
            //手机端更多
            nsList.blockTable.dropBtnHandler(returnObj);
        } else if (typeof (nsList.blockTable.data[tableId].columnBtnHandler[nIndex]) == 'function') {
            nsList.blockTable.data[tableId].columnBtnHandler[nIndex](returnObj);
        }
    }
    $blockTable.find('.block-tags-content select').off('change');
    $blockTable.find('.block-tags-content select').on('change', function (ev) {
        ev.stopPropagation();
        var $this = $(this);
        var tableId = $this.closest('[nsList="block"]').attr('id');
        var rowIndex = $this.closest('.block-tags-content').attr('nsIndex');
        var colIndex = $this.attr('ns-col');
        dataSource[rowIndex][columnFieldArray[colIndex].id] = $this.val();
        var returnObj = {
            tableId: tableId,
            type: 'block',
            rowIndex: rowIndex,
            rowData: dataSource[rowIndex],
            columnField: columnFieldArray,
            obj: $this
        };
        if (typeof (nsList.blockTable.data[tableId].columnSelectHandler[colIndex]) == 'function') {
            nsList.blockTable.data[tableId].columnSelectHandler[colIndex](returnObj);
        }
    });
}
nsList.blockTable.getHtml = function (tableId, dataSource) {
    pageN = 0;
    recordsTotal = 10;
    if (!$.isArray(dataSource)) {
        dataSource = [];
    }
    var tableHtml = '';
    var columnFieldArray = nsList.blockTable.data[tableId].columnField;
    var $blockTable = nsList.blockTable.container[tableId].$table;
    var fillClassStr = '';
    var uiConfig = nsList.blockTable.data[tableId].uiConfig;
    var dataConfig = nsList.blockTable.data[tableId].dataConfig;
    var isSerialNumber = typeof (dataConfig.isSerialNumber) == 'boolean' ? dataConfig.isSerialNumber : true;
    var isTouchEvent = false;
    var columnClassFieldObject = nsList.blockTable.data[tableId].columnClassFieldObject;
    var rowStateObject = nsList.blockTable.data[tableId].rowStateObject;
    if (dataSource.length > 0) {
        isTouchEvent = true;
        var inputSize;
        switch (uiConfig.column) {
            case 1:
                inputSize = " col-lg-1 col-md-1 col-sm-2 col-xs-6";
                break;
            case 2:
                inputSize = " col-lg-2 col-md-2 col-sm-4 col-xs-6";
                break;
            case 3:
                inputSize = " col-lg-3 col-md-4 col-sm-6 col-xs-12";
                break;
            case 4:
                inputSize = " col-md-4 col-sm-6 col-xs-12";
                break;
            case 6:
                inputSize = " col-sm-6 col-xs-12";
                break;
            case 8:
                inputSize = " col-md-8 col-xs-12";
                break;
            case 9:
                inputSize = " col-md-9 col-xs-12";
                break;
            case 0:
                inputSize = " col-none";
                break;
            case 12:
                inputSize = " col-lg-12 col-md-12  col-sm-12 col-xs-12";
                break;
            default:
                inputSize = " col-lg-2 col-md-3  col-sm-4 col-xs-6";
                break;
        }
        var classConfig = typeof (uiConfig.classConfig) == 'object' ? uiConfig.classConfig : {};
        //循环读取几行几列的数据
        var rowsDataArray = []; //表格数据
        for (var rowI = 0; rowI < dataSource.length; rowI++) {
            var colArr = [];
            var classId = dataSource[rowI][classConfig.classField];

            function setColData(columnFieldArray) {
                for (var colI = 0; colI < columnFieldArray.length; colI++) {
                    var colJson = $.extend(true, {}, columnFieldArray[colI]);
                    var valueStr = '';
                    switch (columnFieldArray[colI].type) {
                        case 'button':
                        case 'moblieButtons':
                            //按钮
                            fillClassStr = 'button';
                            valueStr = columnFieldArray[colI].value;
                            isButton = true;
                            break;
                        case 'text':
                        case 'serialState':
                        case 'rowstate':
                            valueStr = dataSource[rowI][colJson.id];
                            if (colJson.customHtml) {
                                if(colJson.id){
                                    if(dataSource[rowI][colJson.id]){
                                        //存在自定义的输出
                                        valueStr = nsVals.getTextByFieldFlag(colJson.customHtml, dataSource[rowI]);
                                    }else{
                                        valueStr = '';
                                    }
                                }else{
                                    //存在自定义的输出
                                    valueStr = nsVals.getTextByFieldFlag(colJson.customHtml, dataSource[rowI]);
                                }
                            }
                            if (colJson.data) {
                                if (colJson.data.flagField) {
                                    colJson.plusValue = dataSource[rowI][colJson.data.flagField];
                                }
                            }
							break;
						case 'diffday':
							//天数之差
							valueStr = columnFieldArray[colI].value.default ? columnFieldArray[colI].value.default : '';
							if(dataSource[rowI][colJson.id]){
								var currentDate = moment(dataSource[rowI][colJson.id]).format('YYYY-MM-DD HH:mm:ss');
								var newDate = moment().format('YYYY-MM-DD HH:mm:ss');
								var currentDiffDate = moment(currentDate,'YYYY-MM-DD HH:mm:ss');
								var newDiffDate = moment(newDate,'YYYY-MM-DD HH:mm:ss');
								var seconds = newDiffDate.diff(currentDiffDate,"second");
								var mintus = seconds/60;
								var diff = Math.floor((mintus/60)/24);
								valueStr = '<div><h4>'+diff+'天</h4><span>未联系</span></div>';
							}
							break;
                        case 'function':
                            //方法
                            valueStr = columnFieldArray[colI].value(dataSource[rowI][colJson.id], dataSource[rowI]);
                            break;
                        case 'dictionary':
                            //字典
							valueStr = typeof (columnFieldArray[colI].value.default) == 'string' ? columnFieldArray[colI].value.default : '';
							if(colJson.customHtml){
								valueStr = nsList.blockTable.getHtmlByRegular(dataSource[rowI],colJson.customHtml,colJson.value);
							}else{
								$.each(columnFieldArray[colI].value, function (key, value) {
									if (key == dataSource[rowI][colJson.id]) {
										valueStr = value;
										return false;
									}
								});
							}
                            break;
                        case 'class-dictionary':
                            var data = colJson.data.data;
                            var datavalue = dataSource[rowI][colJson.id];
                            $.each(data, function (key, value) {
                                if (key == datavalue) {
                                    valueStr = value.text;
                                    colJson.plusClass += ' ' + value.class;
                                    return false;
                                }
                            });
                            break;
                        case 'select':
                            var selectHtml = '<select ns-col="' + colI + '">';
                            var subArray = columnFieldArray[colI].value;
                            var customerField = columnFieldArray[colI].customerField;
                            var textField = 'text';
                            var valueField = 'value';
                            if (typeof (customerField) == 'object') {
                                if (customerField.textField) {
                                    textField = customerField.textField;
                                }
                                if (customerField.valueField) {
                                    valueField = customerField.valueField;
                                }
                            }
                            for (var subI = 0; subI < subArray.length; subI++) {
                                var classStr = '';
                                if (subArray[subI].value == dataSource[rowI][colJson.id]) {
                                    classStr = 'selected';
                                }
                                selectHtml += '<option value="' + subArray[subI][valueField] + '" ' + classStr + '>' + subArray[subI][textField] + '</option>';
                            }
                            selectHtml += '</select>';
                            valueStr = selectHtml;
                            break;
                        case 'icon':
                            valueStr = dataSource[rowI][colJson.id];
                            break;
                        case 'brage':
                            valueStr = dataSource[rowI][colJson.id];
                            break;
                        case 'image':
                            valueStr = '<img src="' + dataSource[rowI][colJson.id] + '" />';
                            break;
                        case 'date':
                            var formatDate = 'YYYY-MM-DD';
                            if (typeof (colJson.data) == 'object') {
                                if (colJson.data.formatDate) {
                                    formatDate = colJson.data.formatDate;
                                }
                            }
                            if (dataSource[rowI][colJson.id]) {
                                var dateStr = moment(dataSource[rowI][colJson.id]).format(formatDate);
                                valueStr = '<i class="fa-clock-o"></i>' + dateStr;
                            }
                            break;
                        case 'href':
                            var hrefData = columnFieldArray[colI].value;
                            var url = hrefData.handler(dataSource[rowI]);
                            valueStr = '<a href="' + url + '">' + hrefData.text + '</a>';
                            break;
                    }
                    if (typeof (valueStr) == 'undefined') {
                        valueStr = '';
                    }
                    colJson.value = valueStr;
                    colArr.push(colJson);
                }
            }
            setColData(columnFieldArray);
            if (columnClassFieldObject[classId]) {
                setColData(columnClassFieldObject[classId]);
            }
            rowsDataArray.push(colArr);
        }
        //输出html
        var tableDataLength = rowsDataArray.length;
        tableHtml = '<div class="row">';
        var closeHtml = '<i class="fa fa-close"></i>';
        if (typeof (uiConfig.isClose) == 'boolean') {
            if (!uiConfig.isClose) {
                closeHtml = '';
            }
        }
        //循环输出每一行每一列的数据值
        for (var dataI = 0; dataI < tableDataLength; dataI++) {
            //先循环行
            var rowData = rowsDataArray[dataI];
            var classId = dataSource[dataI][classConfig.classField];
            var isClassIdEqual = false; //默认不相等
            //输出行容器
            var plusAttr = '';
            if (nsVals.browser.browserSystem == 'mobile') {
                plusAttr = 'ns-touch="mobile"';
            }
            var primaryIdAttr = 'ns-primaryId="'+dataSource[dataI][dataConfig.primaryID]+'"';
            if (!$.isEmptyObject(rowStateObject[classId])) {
                inputSize += ' ' + rowStateObject[classId].data[dataSource[dataI][rowStateObject[classId].flagField]];
            }
            var rowHtml = '<div class="' + inputSize + '" '+plusAttr+' '+primaryIdAttr+'>' +
                closeHtml +
                '<div class="block-tags-content ' + fillClassStr + '" nsIndex="' + dataI + '">';
            if (classConfig.classField) {
                //存在分类id
                var classNameStr = classConfig.data[classId] ? classConfig.data[classId] : classConfig.data.default;
                var classNameHtml = '<div class="block-table-classtitle" ' + plusAttr + '>' + classNameStr + '</div>';
                if (dataI > 0 && dataI <= tableDataLength - 1) {
                    if (dataSource[dataI - 1][classConfig.classField] == classId) {
                        //和上一个分类id相等
                        classNameHtml = '';
                        isClassIdEqual = true;
                    }
                }

                if (uiConfig.isClass) {
                    rowHtml = classNameHtml + rowHtml;
                } else {
                    //rowHtml += '<div class="block-table-info-title">'+classNameStr+'</div>';
                }
                //循环每行中的列数据
                for (var valueI = 0; valueI < rowsDataArray[dataI].length; valueI++) {
                    var colData = rowsDataArray[dataI][valueI];
                    //如果当前列的输出值为和当前分类id值相等则不显示isClassIdEqual &&
                    if (uiConfig.isClass) {
                       // if (colData.id == classConfig.classField) {
                            //分类相等列id相等
                           // colData.isOutput = -1;
                           // continue;
                       // }
                    }

                    var hiddenClassStr = '';
                    if (colData.hidden) {
                        hiddenClassStr = 'hidden';
                    } //是否要隐藏列

                    var classStr = 'class="' + colData.plusClass + ' ' + colData.position + ' ' + hiddenClassStr + '"';
                    var positionClassStr = 'block-table-' + colData.position;

                    var serialHtml = ''; //输出序列号占位
                    if (dataConfig.isSerialNumber) {
                        serialHtml = '<span class="block-table-serial">' + (dataI + 1) + '</span>';
                    }

                    var iconHtml = ''; //是否有自定义图标的输出
                    if (colData.icon) {
                        iconHtml = colData.icon;
                    }
                    //最简单方式的输出 
                    var defaultHtml = colData.title + ':' + colData.value;
                    var contentHtml = colData.isShowTitle ? defaultHtml : colData.value;
                    var tdValueHtml = '';
                    if(colData.value){
                        tdValueHtml = '<span ' + classStr + ' nsIndex="' + valueI + '">' + iconHtml + contentHtml + '</span>';
                    }
                    switch (colData.type) {
                        case 'title':
                            tdValueHtml = '<div class="block-table-title">' + tdValueHtml + '</div>';
                            break;
                        case 'button':
                        case 'moblieButtons':
                            tdValueHtml = '<div class="block-table-button">' + tdValueHtml + '</div>';
                            break;
                    }

                    var outputTdHtml = '';
                    var isPositionEqual = false;
                    if (colData.position) {
                        //定义了位置输出
                        outputTdHtml = '<div class="' + positionClassStr + '">' + tdValueHtml;
					}
					if (valueI > 0 && valueI <= rowsDataArray[dataI].length - 1) {
						if (rowsDataArray[dataI][valueI - 1].position == colData.position) {
							//和上一个输出位置相等
							isPositionEqual = true;
							outputTdHtml = tdValueHtml;
						} else {
							//和上一个输出位置不相等
							if (rowsDataArray[dataI][valueI - 1].isOutput != -1) {
                                //上一个有输出需要输出结束标记
                                if(rowsDataArray[dataI][valueI - 1].position){
                                    outputTdHtml = '</div>' + outputTdHtml;
                                }
							}
						}
					}
					if (valueI == rowsDataArray[dataI].length - 1) {
                        //已经是最后一个
                        if(rowsDataArray[dataI][valueI].position){
                            outputTdHtml = outputTdHtml + '</div>';
                        }
						//console.log(outputTdHtml)
						//console.log('-----------------------')
					}   
                    //console.log(outputTdHtml)
                    //console.log('-----------------------')
                    rowHtml += outputTdHtml;
                }
            } else {
                //循环输出每行列数据
                //position title  content right button
                if (!$.isEmptyObject(nsList.blockTable.htmlJson[tableId])) {
                    //存在自定义的表格输出格式
                    var htmlJson = nsList.blockTable.htmlJson[tableId];

                    function getListHtml(arr, position) {
                        if (!$.isArray(arr)) {
                            return '';
                        }
                        var positionStyle = 'block-table-' + position;
                        var html = '<div class="' + positionStyle + '">';
                        for (var titleI = 0; titleI < arr.length; titleI++) {
                            var valueI = arr[titleI];
                            var serialStateStr = '';
                            if (rowsDataArray[dataI][valueI].type == 'serialState') {
                                if (rowsDataArray[dataI][valueI].data.flagField) {
                                    serialStateStr = rowsDataArray[dataI][valueI].data.data[rowsDataArray[dataI][valueI].plusValue];
                                } else {
                                    serialStateStr = rowsDataArray[dataI][valueI].data[rowsDataArray[dataI][valueI].value];
                                }
							}
							var hiddenClassStr = '';
							if (rowsDataArray[dataI][valueI].hidden) {
								hiddenClassStr = 'hidden';
							}
                            var classStr = 'class="'+hiddenClassStr+' ' + rowsDataArray[dataI][valueI].plusClass + ' ' + rowsDataArray[dataI][valueI].type + ' ' + serialStateStr + '"';
                            var contentStr = rowsDataArray[dataI][valueI].value ? rowsDataArray[dataI][valueI].value : '';
                            var defaultHtml = rowsDataArray[dataI][valueI].title + ':' + contentStr;
                            var contentHtml = '';
                            if (rowsDataArray[dataI][valueI].icon) {
                                contentHtml = rowsDataArray[dataI][valueI].icon;
                            }
                            contentHtml += rowsDataArray[dataI][valueI].isShowTitle ? defaultHtml : contentStr;
                            if (rowsDataArray[dataI][valueI].classType == 'title') {
                                html += '<div class="block-table-title">' +
                                    '<span ' + classStr + ' nsIndex="' + valueI + '" data-toggle="tooltip" title="' + contentStr + '">' + contentHtml + '</span>' +
                                    '</div>';
                            } else if (rowsDataArray[dataI][valueI].classType == 'button') {
                                html += '<div class="block-table-button">' +
                                    '<span ' + classStr + ' nsIndex="' + valueI + '">' + contentHtml + '</span>' +
                                    '</div>';
                            } else {
                                html += '<span ' + classStr + ' nsIndex="' + valueI + '">' + contentHtml + '</span>';
                            }
                        }
                        html += '</div>';
                        return html;
                    }
                    var serialHtml = ''; //输出序列号占位
                    if (dataConfig.isSerialNumber) {
                        serialHtml = '<span class="block-table-serial">' + (dataI + 1) + '</span>';
                    }
                    var leftHtml = getListHtml(htmlJson.left, 'left');
                    var rightHtml = getListHtml(htmlJson.right, 'right');
                    rowHtml += serialHtml + leftHtml + rightHtml;
                } else {
                    for (var valueI = 0; valueI < rowsDataArray[dataI].length; valueI++) {
                        var hiddenClassStr = '';
                        if (rowsDataArray[dataI][valueI].hidden) {
                            hiddenClassStr = 'hidden';
                        }
                        var classStr = 'class="' + rowsDataArray[dataI][valueI].plusClass + ' ' + rowsDataArray[dataI][valueI].position + ' ' + hiddenClassStr + '"';
                        var defaultHtml = rowsDataArray[dataI][valueI].title + ':' + rowsDataArray[dataI][valueI].value;
                        var contentHtml = rowsDataArray[dataI][valueI].isShowTitle ? defaultHtml : rowsDataArray[dataI][valueI].value;
                        if(rowsDataArray[dataI][valueI].value){
                            rowHtml += '<span ' + classStr + ' nsIndex="' + valueI + '">' + contentHtml + '</span>';
                        }
                    }
                }
            }
            rowHtml += '</div></div>';
            tableHtml += rowHtml;
            //console.log(rowHtml)
            //console.log('-------------------------------')
        }
        tableHtml += '</div>';
    } else {
        tableHtml = '<div class="block-tage-empty no-data">暂无数据</div>';
    }
    $blockTable.html(tableHtml);
    if (isTouchEvent == false) {
        pageN = 0;
        recordsTotal = 10;
        $(window).off('scroll',nsList.blockTable.scrollHandler);
        return false;
    }
    $(window).off('scroll',nsList.blockTable.scrollHandler);
    $(window).on('scroll',nsList.blockTable.scrollHandler);
    nsList.blockTable.eventHandler(tableId, dataSource);
}
nsList.blockTable.getTableHtml = function (tableId, dataSource) {
    var tableHtml = '';
    var columnFieldArray = nsList.blockTable.data[tableId].columnField;
    var $blockTable = nsList.blockTable.container[tableId].$table;
    var fillClassStr = '';
    var uiConfig = nsList.blockTable.data[tableId].uiConfig;
    var dataConfig = nsList.blockTable.data[tableId].dataConfig;
    var isSerialNumber = typeof (dataConfig.isSerialNumber) == 'boolean' ? dataConfig.isSerialNumber : true;
    var isTouchEvent = false;
    if (dataSource.length > 0) {
        isTouchEvent = true;
        var inputSize;
        switch (uiConfig.column) {
            case 1:
                inputSize = " col-lg-1 col-md-1 col-sm-2 col-xs-6";
                break;
            case 2:
                inputSize = " col-lg-2 col-md-2 col-sm-4 col-xs-6";
                break;
            case 3:
                inputSize = " col-lg-3 col-md-4 col-sm-6 col-xs-12";
                break;
            case 4:
                inputSize = " col-md-4 col-sm-6 col-xs-12";
                break;
            case 6:
                inputSize = " col-sm-6 col-xs-12";
                break;
            case 8:
                inputSize = " col-md-8 col-xs-12";
                break;
            case 9:
                inputSize = " col-md-9 col-xs-12";
                break;
            case 0:
                inputSize = " col-none";
                break;
            case 12:
                inputSize = " col-lg-12 col-md-12  col-sm-12 col-xs-12";
                break;
            default:
                inputSize = " col-lg-2 col-md-3  col-sm-4 col-xs-6";
                break;
        }
        var classConfig = typeof (uiConfig.classConfig) == 'object' ? uiConfig.classConfig : {};
        //循环读取几行几列的数据
        var rowsDataArray = []; //表格数据
        for (var rowI = 0; rowI < dataSource.length; rowI++) {
            var colArr = [];
            for (var colI = 0; colI < columnFieldArray.length; colI++) {
                var colJson = $.extend(true, {}, columnFieldArray[colI]);
                var valueStr = '';
                switch (columnFieldArray[colI].type) {
                    case 'button':
                    case 'moblieButtons':
                        //按钮
                        fillClassStr = 'button';
                        valueStr = columnFieldArray[colI].value;
                        isButton = true;
                        break;
                    case 'text':
                    case 'serialState':
                    case 'rowstate':
                        valueStr = dataSource[rowI][colJson.id];
                        if (colJson.customHtml) {
                            if(colJson.id){
                                if(dataSource[rowI][colJson.id]){
                                    //存在自定义的输出
                                    valueStr = nsVals.getTextByFieldFlag(colJson.customHtml, dataSource[rowI]);
                                }else{
                                    valueStr = '';
                                }
                            }else{
                                //存在自定义的输出
                                valueStr = nsVals.getTextByFieldFlag(colJson.customHtml, dataSource[rowI]);
                            }
                        }
                        if (colJson.data) {
                            if (colJson.data.flagField) {
                                colJson.plusValue = dataSource[rowI][colJson.data.flagField];
                            }
                        }
						break;
					case 'diffday':
						//天数之差
						valueStr = columnFieldArray[colI].value.default ? columnFieldArray[colI].value.default : '';
						if(dataSource[rowI][colJson.id]){
							var currentDate = moment(dataSource[rowI][colJson.id]).format('YYYY-MM-DD HH:mm:ss');
							var newDate = moment().format('YYYY-MM-DD HH:mm:ss');
							var currentDiffDate = moment(currentDate,'YYYY-MM-DD HH:mm:ss');
							var newDiffDate = moment(newDate,'YYYY-MM-DD HH:mm:ss');
							var seconds = newDiffDate.diff(currentDiffDate,"second");
							var mintus = seconds/60;
							var diff = Math.floor((mintus/60)/24);
							valueStr = '<div><h4>'+diff+'天</h4><span>未联系</span></div>';
						}
						break;	
                    case 'function':
                        //方法
                        valueStr = columnFieldArray[colI].value(dataSource[rowI][colJson.id], dataSource[rowI]);
                        break;
                    case 'dictionary':
                        //字典
						valueStr = typeof (columnFieldArray[colI].value.default) == 'string' ? columnFieldArray[colI].value.default : '';
						if(colJson.customHtml){
							valueStr = nsList.blockTable.getHtmlByRegular(dataSource[rowI],colJson.customHtml,colJson.value);
						}else{
							$.each(columnFieldArray[colI].value, function (key, value) {
								if (key == dataSource[rowI][colJson.id]) {
									valueStr = value;
									return false;
								}
							});
						}
                        break;
                    case 'select':
                        var selectHtml = '<select ns-col="' + colI + '">';
                        var subArray = columnFieldArray[colI].value;
                        var customerField = columnFieldArray[colI].customerField;
                        var textField = 'text';
                        var valueField = 'value';
                        if (typeof (customerField) == 'object') {
                            if (customerField.textField) {
                                textField = customerField.textField;
                            }
                            if (customerField.valueField) {
                                valueField = customerField.valueField;
                            }
                        }
                        for (var subI = 0; subI < subArray.length; subI++) {
                            var classStr = '';
                            if (subArray[subI].value == dataSource[rowI][colJson.id]) {
                                classStr = 'selected';
                            }
                            selectHtml += '<option value="' + subArray[subI][valueField] + '" ' + classStr + '>' + subArray[subI][textField] + '</option>';
                        }
                        selectHtml += '</select>';
                        valueStr = selectHtml;
                        break;
                    case 'icon':
                        valueStr = dataSource[rowI][colJson.id];
                        break;
                    case 'brage':
                        valueStr = dataSource[rowI][colJson.id];
                        break;
                    case 'image':
                        valueStr = '<img src="' + dataSource[rowI][colJson.id] + '" />';
                        break;
                    case 'date':
                        var formatDate = 'YYYY-MM-DD';
                        if (typeof (colJson.data) == 'object') {
                            if (colJson.data.formatDate) {
                                formatDate = colJson.data.formatDate;
                            }
                        }
                        if (dataSource[rowI][colJson.id]) {
                            var dateStr = moment(dataSource[rowI][colJson.id]).format(formatDate);
                            valueStr = '<i class="fa-clock-o"></i>' + dateStr;
                        }
                        break;
                    case 'href':
                        var hrefData = columnFieldArray[colI].value;
                        var url = hrefData.handler(dataSource[rowI]);
                        valueStr = '<a href="' + url + '">' + hrefData.text + '</a>';
                        break;
                }
                if (typeof (valueStr) == 'undefined') {
                    valueStr = '';
                }
                colJson.value = valueStr;
                colArr.push(colJson);
            }
            rowsDataArray.push(colArr);
        }
        //输出html
        var tableDataLength = rowsDataArray.length;
        //tableHtml = '<div class="row">';
        var closeHtml = '<i class="fa fa-close"></i>';
        if (typeof (uiConfig.isClose) == 'boolean') {
            if (!uiConfig.isClose) {
                closeHtml = '';
            }
        }
        //循环输出每一行每一列的数据值
        for (var dataI = 0; dataI < tableDataLength; dataI++) {
            //先循环行
            var rowData = rowsDataArray[dataI];
            var classId = dataSource[dataI][classConfig.classField];
            var isClassIdEqual = false; //默认不相等
            //输出行容器
            var plusAttr = '';
            if (nsVals.browser.browserSystem == 'mobile') {
                plusAttr = 'ns-touch="mobile"';
            }
            var primaryIdAttr = 'ns-primaryId="'+dataSource[dataI][dataConfig.primaryID]+'"';
            var rowHtml = '<div class="' + inputSize + '" '+plusAttr+' '+primaryIdAttr+'>' +
                closeHtml +
                '<div class="block-tags-content ' + fillClassStr + '" nsIndex="' + dataI + '">';
            if (classConfig.classField) {
                //存在分类id
                var classNameStr = classConfig.data[classId] ? classConfig.data[classId] : classConfig.data.default;
                var classNameHtml = '<div class="block-table-classtitle" ' + plusAttr + '>' + classNameStr + '</div>';
                if (typeof (dataSource[dataI].isShowClassTitle) == 'boolean') {
                    if (dataSource[dataI].isShowClassTitle == false) {
                        classNameHtml = '';
                    }
                }
                if (dataI > 0 && dataI <= tableDataLength - 1) {
                    if (dataSource[dataI - 1][classConfig.classField] == classId) {
                        //和上一个分类id相等
                        classNameHtml = '';
                        isClassIdEqual = true;
                    }
				}
				if(uiConfig.isClass){
					rowHtml = classNameHtml + rowHtml;
				}
                //循环每行中的列数据
                for (var valueI = 0; valueI < rowsDataArray[dataI].length; valueI++) {
                    var colData = rowsDataArray[dataI][valueI];
					//如果当前列的输出值为和当前分类id值相等则不显示isClassIdEqual &&
					if (uiConfig.isClass) {
                        if (colData.id == classConfig.classField) {
                            //分类相等列id相等
                            colData.isOutput = -1;
                            continue;
                        }
                    } 

                    var hiddenClassStr = '';
                    if (colData.hidden) {
                        hiddenClassStr = 'hidden';
                    } //是否要隐藏列

                    var classStr = 'class="' + colData.plusClass + ' ' + colData.position + ' ' + hiddenClassStr + '"';
                    var positionClassStr = 'block-table-' + colData.position;

                    var serialHtml = ''; //输出序列号占位
                    if (dataConfig.isSerialNumber) {
                        serialHtml = '<span class="block-table-serial">' + (dataI + 1) + '</span>';
                    }

                    var iconHtml = ''; //是否有自定义图标的输出
                    if (colData.icon) {
                        iconHtml = colData.icon;
                    }
                    //最简单方式的输出 
                    var defaultHtml = colData.title + ':' + colData.value;
                    var contentHtml = colData.isShowTitle ? defaultHtml : colData.value;
                    var tdValueHtml = '';
                    if(colData.value){
                        var tdValueHtml = '<span ' + classStr + ' nsIndex="' + valueI + '">' + iconHtml + contentHtml + '</span>';
                    }
                    switch (colData.type) {
                        case 'title':
                            tdValueHtml = '<div class="block-table-title">' + tdValueHtml + '</div>';
                            break;
                        case 'button':
                        case 'moblieButtons':
                            tdValueHtml = '<div class="block-table-button">' + tdValueHtml + '</div>';
                            break;
                    }

                    var outputTdHtml = '';
                    var isPositionEqual = false;
                    if (colData.position) {
                        //定义了位置输出
                        outputTdHtml = '<div class="' + positionClassStr + '">' + tdValueHtml;
					}
					
					if (valueI > 0 && valueI <= rowsDataArray[dataI].length - 1) {
						if (rowsDataArray[dataI][valueI - 1].position == colData.position) {
							//和上一个输出位置相等
							isPositionEqual = true;
							outputTdHtml = tdValueHtml;
						} else {
							//和上一个输出位置不相等
							if (rowsDataArray[dataI][valueI - 1].isOutput != -1) {
                                //上一个有输出需要输出结束标记
                                if(rowsDataArray[dataI][valueI - 1].position){
                                    outputTdHtml = '</div>' + outputTdHtml;
                                }
							}
						}
					}
					if (valueI == rowsDataArray[dataI].length - 1) {
                        //已经是最后一个
                        if(rowsDataArray[dataI][valueI].position){
                            outputTdHtml = outputTdHtml + '</div>';
                        }
						//console.log(outputTdHtml)
						//console.log('-----------------------')
					}
                    //console.log(outputTdHtml)
                    //console.log('-----------------------')
                    rowHtml += outputTdHtml;
                }
            } else {
                //循环输出每行列数据
                //position title  content right button
                if (!$.isEmptyObject(nsList.blockTable.htmlJson[tableId])) {
                    //存在自定义的表格输出格式
                    var htmlJson = nsList.blockTable.htmlJson[tableId];

                    function getListHtml(arr, position) {
                        if (!$.isArray(arr)) {
                            return '';
                        }
                        var positionStyle = 'block-table-' + position;
                        var html = '<div class="' + positionStyle + '">';
                        for (var titleI = 0; titleI < arr.length; titleI++) {
                            var valueI = arr[titleI];
                            var serialStateStr = '';
                            if (rowsDataArray[dataI][valueI].type == 'serialState') {
                                if (rowsDataArray[dataI][valueI].data.flagField) {
                                    serialStateStr = rowsDataArray[dataI][valueI].data.data[rowsDataArray[dataI][valueI].plusValue];
                                } else {
                                    serialStateStr = rowsDataArray[dataI][valueI].data[rowsDataArray[dataI][valueI].value];
                                }
							}
							var hiddenClassStr = '';
							if (rowsDataArray[dataI][valueI].hidden) {
								hiddenClassStr = 'hidden';
							}
                            var classStr = 'class="'+hiddenClassStr+' ' + rowsDataArray[dataI][valueI].plusClass + ' ' + rowsDataArray[dataI][valueI].type + ' ' + serialStateStr + '"';
                            var defaultHtml = rowsDataArray[dataI][valueI].title + ':' + rowsDataArray[dataI][valueI].value;
                            var contentHtml = '';
                            if (rowsDataArray[dataI][valueI].icon) {
                                contentHtml = rowsDataArray[dataI][valueI].icon;
                            }
                            var contentStr = rowsDataArray[dataI][valueI].value ? rowsDataArray[dataI][valueI].value : '';
                            contentHtml += rowsDataArray[dataI][valueI].isShowTitle ? defaultHtml : contentStr;
                            if (rowsDataArray[dataI][valueI].classType == 'title') {
                                html += '<div class="block-table-title">' +
                                    '<span ' + classStr + ' nsIndex="' + valueI + '">' + contentHtml + '</span>' +
                                    '</div>';
                            } else if (rowsDataArray[dataI][valueI].classType == 'button') {
                                html += '<div class="block-table-button">' +
                                    '<span ' + classStr + ' nsIndex="' + valueI + '">' + contentHtml + '</span>' +
                                    '</div>';
                            } else {
                                html += '<span ' + classStr + ' nsIndex="' + valueI + '">' + contentHtml + '</span>';
                            }
                        }
                        html += '</div>';
                        return html;
                    }
                    var serialHtml = ''; //输出序列号占位
                    if (dataConfig.isSerialNumber) {
                        serialHtml = '<span class="block-table-serial">' + (dataI + 1) + '</span>';
                    }
                    var leftHtml = getListHtml(htmlJson.left, 'left');
                    var rightHtml = getListHtml(htmlJson.right, 'right');
                    rowHtml += serialHtml + leftHtml + rightHtml;
                } else {
                    for (var valueI = 0; valueI < rowsDataArray[dataI].length; valueI++) {
                        var hiddenClassStr = '';
                        if (rowsDataArray[dataI][valueI].hidden) {
                            hiddenClassStr = 'hidden';
                        }
                        var classStr = 'class="' + rowsDataArray[dataI][valueI].plusClass + ' ' + rowsDataArray[dataI][valueI].position + ' ' + hiddenClassStr + '"';
                        var defaultHtml = rowsDataArray[dataI][valueI].title + ':' + rowsDataArray[dataI][valueI].value;
                        var contentHtml = rowsDataArray[dataI][valueI].isShowTitle ? defaultHtml : rowsDataArray[dataI][valueI].value;
                        if(rowsDataArray[dataI][valueI].value){
                            rowHtml += '<span ' + classStr + ' nsIndex="' + valueI + '">' + contentHtml + '</span>';
                        }
                    }
                }
            }
            rowHtml += '</div></div>';
            tableHtml += rowHtml;
            //console.log(rowHtml)
            //console.log('-------------------------------')
        }
        //tableHtml += '</div>';
    } else {
        tableHtml = '<div class="block-tage-empty no-data">暂无数据</div>';
    }
    return tableHtml;
}
//获取选中值
nsList.blockTable.getSelectedRowData = function (tableId, isTip) {
    var data = nsList.blockTable.rowData[tableId].data;
    var selectMode = '';
    isTip = isTip ? isTip : true;
    if ($.isEmptyObject(data) || data.length === 0) {
        data = null;
        if (isTip) {
            nsalert(language.datatable.nsalert.uncheckLine);
        }
    }
    return data;
}
nsList.blockTable.add = function (tableId, data) {
    // if($.isArray(data)){
    // 	if(nsList.blockTable.originalRowsData[tableId].length == 0){
    // 		nsList.blockTable.originalRowsData[tableId] = data;
    // 	}else{
    // 		nsList.blockTable.originalRowsData[tableId] = $.extend(true,[],data,nsList.blockTable.originalRowsData[tableId]);
    // 	}
    // }else{
    // 	nsList.blockTable.originalRowsData[tableId].unshift(data);
    // }
    if ($.isArray(data)) {
        if (nsList.blockTable.data[tableId].dataConfig.dataSource.length == 0) {
            nsList.blockTable.data[tableId].dataConfig.dataSource = data;
        } else {
            nsList.blockTable.data[tableId].dataConfig.dataSource = $.extend(true, [], data, nsList.blockTable.data[tableId].dataConfig.dataSource);
        }
    } else {
        nsList.blockTable.data[tableId].dataConfig.dataSource.unshift(data);
    }
    nsList.blockTable.getHtml(tableId, nsList.blockTable.data[tableId].dataConfig.dataSource);
}
nsList.blockTable.edit = function (tableId, data) {
    nsList.blockTable.getHtml(tableId, nsList.blockTable.data[tableId].dataConfig.dataSource);
}
nsList.blockTable.del = function (tableId, data) {
    var nIndex;
    // var tableData = nsList.blockTable.originalRowsData[tableId];
    var tableData = nsList.blockTable.data[tableId].dataConfig.dataSource;
    for (var tableI = 0; tableI < tableData.length; tableI++) {
        if (tableData[tableI].nsTempTimeStamp === data.nsTempTimeStamp) {
            nIndex = tableI;
        }
    }
    tableData.splice(nIndex, 1);
    nsList.blockTable.getHtml(tableId, tableData);
}
nsList.blockTable.clear = function (tableId) {
    // nsList.blockTable.originalRowsData[tableId] = [];
    nsList.blockTable.data[tableId].dataConfig.dataSource = [];
    nsList.blockTable.getHtml(tableId, nsList.blockTable.data[tableId].dataConfig.dataSource);
}