var excelImport = {
    init: function (templateId) {
        var config = {
            // 用来标识是哪个模板
            templateId: templateId,
            // 同上面弹窗的id
            container: "dialog-import",
            /**
             * 在主页面显示历史记录
             * 历史记录分为 excel表名 和 导入时间，点击记录可以跳到第二页面（给后台传id拿数据)
             */
            history: {
                fields: {},
                ajax: {
                    url: getRootPath() + "/importRecords/getListByTemplateId",
                    data: {"templateId": templateId,},
                    type: 'GET',
                    dataSrc: 'rows'
                },
                // 这个id在后面接收
                //id: "",
            },
            /**
             * 上传文件ajax
             * templateUrl  模板下载url
             * info    上传信息
             */
            upload: {
                ajax: {
                    url: getRootPath() + "/dataImport/upload",
                    data: {},
                    type: 'POST',
                    dataSrc: 'rows',
                    cache: false,
                    contentType: false,
                    processData: false,
                },
                templateUrl: getRootPath() + "/templateExport/" + templateId,
                currentDataUrl: getRootPath() + "/importRecords/getExcelByRecordId",
                info: "",
            },
            /**
             * 验证ajax
             *
             */
            valid: {
                /**
                 * 获取表头
                 */
                configAjax: {
                    url: getRootPath() + "/dataImport/getTableFieldsByTemplateId",
                    data: {"templateId": templateId,},
                    type: 'GET',
                    dataSrc: 'rows'
                },
                /**
                 * 获取表数据，会有错误，要把错误显示出来
                 */
                listAjax: {
                    url: getRootPath() + "/dataImport/getDataTableMessageByRecordId",
                    data: {},
                    type: 'GET',
                    dataSrc: 'rows'
                }
            },
            /**
             * 保存ajax，需要根据返回的数据来得到状态
             */
            save: {
                url: getRootPath() + "/dataImport/saveData/" + templateId,
                data: {},
                type: "POST",
                contentType: "application/json",
                dataSrc: "rows"
            }
        }
        var dialogConfig = {
            id: "dialog-import",
            title: "导入组件"
        }
        importComponent.show(config, dialogConfig);
    }
}

var importComponent = (function ($) {
    // 主体
    var customers = {
        container: "dialog-import",
        init: function (config) {
            var _this = this;
            // 模板id
            if (typeof (config.templateId) != "undefined") {
                _this.templateId = config.templateId;
            } else {
                console.error("模板id没有配置");
            }
            // 历史记录ajax
            if (typeof (config.history) != "undefined") {
                _this.history = config.history;
            } else {
                console.error("历史记录ajax没有配置");
            }
            // save保存ajax
            if (typeof (config.save) != "undefined") {
                _this.save = config.save;
            } else {
                console.error("save保存ajax没有配置");
            }
            // upload上传ajax
            if (typeof (config.upload) != "undefined") {
                _this.upload = config.upload;
            } else {
                console.error("upload上传ajax没有配置");
            }
            // valid保存ajax
            if (typeof (config.valid) != "undefined") {
                _this.valid = config.valid;
            } else {
                console.error("valid验证ajax没有配置");
            }

            _this.config = config;
            // 第一个页面初始化
            firstPage.init();
            // 获取节点
            _this.getElement();
            // 文件上传事件
            firstPage.selectFile();
            // 拿到表结构
            var fieldsAjax = _this.valid.configAjax;
            nsVals.ajax(fieldsAjax, function (data) {
                _this.tableFields = data;
            });
            // console.log(this);
        },
        // 主体框架
        getHtml: function () {
            var _this = this;
            var $modalContent = $('<div class="modal-content"></div>');
            var titleHtml = '<div class="modal-header">'
                + '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
                + '<h4 class="modal-title">' + _this.config.title + '</h4>'
                + '</div>';
            var bodyHtml =
                '<div class="modal-body">'
                + '<div class="step_process" id="customersStepProcess">'
                + '<ul>'
                + '<li class="current">'
                + '<span>文档上传</span>'
                + '</li>'
                + '<li>'
                + '<span>云端导入</span>'
                + '</li>'
                + '<li>'
                + ' <span>完成</span>'
                + '</li>'
                + '</ul>'
                + '</div>'
                + '<div class="modal-body-content">'
                + '</div>'
            var footerHtml =
                '<div class="modal-footer">'
                + '<button type="button" class="btn btn-info disabled" id="startImport" style="display: inline-block;">'
                + '开始导入'
                + '</button>'
                + '<button type="button" class="btn btn-info" id="confirmImport" style="display: none;">'
                + '确认导入'
                + '</button>'
                + '<button type="button" class="btn btn-info" id="successImport" style="display: none;">'
                + '完成'
                + '</button>'
                + '<button type="button" class="btn btn-info" id="goBack" style="display: none;">'
                + '返回'
                + '</button>'
                + '<button type="button" class="btn btn-default" data-dismiss="modal" id="calcelImport" style="display: inline-block;">'
                + '取消'
                + '</button>'
                + '</div >';
            $modalContent.append(titleHtml);
            $modalContent.append(bodyHtml);
            $modalContent.append(footerHtml);
            $('#' + _this.container).find('.modal-dialog').empty();
            $('#' + _this.container).find('.modal-dialog').append($modalContent);
        },
        // 获取页面上btn
        getElement: function () {
            // 选择文件按钮
            this.$selectFile = $("#importFile");
            // 开始导入按钮
            this.$startImport = $('#startImport');
            // 确认导入按钮
            this.$confirmImport = $('#confirmImport');
            // 返回按钮
            this.$goBack = $('#goBack');
            // 取消导入按钮
            this.$calcelImport = $('#calcelImport');
            // form表单
            this.$importFileForm = $("#importFileForm");
            // 进度条状态
            this.$stepList = $("#customersStepProcess").find('li');
            // body-content
            this.$bodyContent = $(".modal-body-content");
            // 下载本次数据
            this.$downloadCurrentData = $("#downloadCurrentData");
        }
    }
    // 第一个页面
    var firstPage = {
        init: function () {
            this.firstPage();
            // 拿到表结构
        },
        getFirstPageHtml: function () {
            var firstPageHtml =
                '<div class="text-link">'
                + '<a href="" class="templateLink btn btn-white">'
                + '<i class="fa-download"></i>点击下载导入数据模板</a>'
                + '</div>'
                + '<div class="importHistory" id="importHistory"></div>'
                + '<div class="modal-content-tips">'
                + '</div>'
                + '<form class="input-file" id="importFileForm" enctype="multipart/form-data">'
                + '<input type="file" accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="form-control" name="file" id="importFile">'
                + '<span class="file-name">'
                + '<span></span>'
                + '</span>'
                + '</form>'
                + '</div>';
            return firstPageHtml;
        },
        // 文档上传页面
        firstPage: function () {
            var firstPageHtml = this.getFirstPageHtml();
            customers.getHtml();
            customers.$bodyContent = $(".modal-body-content");
            // 清空bodyContent
            customers.$bodyContent.empty();
            customers.$bodyContent.append(firstPageHtml);
            // 添加下载模板的链接
            $(".templateLink").attr('href', customers.config.upload.templateUrl);
            // 初始化第一个页面表格
            this.importHistory();
        },
        // 历史记录表
        importHistory: function () {
            var dataConfig = {
                "tableID": "table-importHistory",
                "dataSource": [],
                "isSearch": false,
            };
            var columnConfig = [
                {
                    "field": 'fileName',
                    "title": '导入名称'
                }, {
                    "field": 'importTime',
                    "title": '导入时间',
                    "width": 200,
                    "formatHandler": function (value, row, meta) {
                        var time = row.importTime;
                        return time;
                    },
                    "formatType": {
                        "type": 'date',
                        "format": {'YYYY-MM-DD': 'MM-DD-YYYY hh:ss:mm'},
                    }
                }, {
                    "field": 'finishTime',
                    "title": '完成时间',
                    "width": 200,
                    "formatHandler": function (value, row, meta) {
                        var time = row.finishTime;
                        return time;
                    },
                    "formatType": {
                        "type": 'date',
                        "format": {'YYYY-MM-DD': 'MM-DD-YYYY hh:ss:mm'},
                    }
                },
                {
                    "field": 'doneFlag',
                    "title": '是否完成',
                    "width": 100,
                    formatHandler: {
                        type: 'dictionary',
                        data: {
                            '1': '是',
                            '0': '否'
                        }
                    }
                }
            ];
            var uiConfig = {
                "pageLengthMenu": 5, //可选页面数  auto是自动计算  all是全部
                "isSingleSelect": true,
                "isMultiSelect": false,
                $container: $("#importHistory"),
                // 表格行单选事件
                onSingleSelectHandler: function (row) {
                    customers.recordId = row.rowData.id;
                    customers.$startImport.removeClass("disabled");
                    firstPage.starImport(false);
                    /* ajaxConfig.data = {
                     "recordId": recordId
                     }
                     nsVals.ajax(ajaxConfig, function (data) {
                     tableList = data;
                     if (tableList) {
                     console.log(tableList);
                     customers.$startImport.removeClass("disabled");
                     firstPage.starImport(tableList);
                     }
                     }) */
                },
                onUnsingleSelectHandler: function () {
                    customers.$startImport.addClass("disabled");
                }
            };

            // 接收ajax返回的数据
            var ajaxConfig = customers.history.ajax;
            nsVals.ajax(ajaxConfig, function (data) {
                var tableData = data;


                dataConfig.dataSource = tableData.data;
                for (var key in dataConfig.dataSource) {
                    var whenStart = dataConfig.dataSource[key].whenStart;
                    if (typeof(whenStart) != "undefined") {
                        var importTime = new Date(whenStart);
                        dataConfig.dataSource[key].importTime =
                            importTime.toLocaleDateString() + " " +
                            importTime.toLocaleTimeString();
                    }
                    var whenEnd = dataConfig.dataSource[key].whenEnd;
                    if (typeof(whenEnd) != "undefined") {
                        var finishTime = new Date(whenEnd);
                        dataConfig.dataSource[key].finishTime =
                            finishTime.toLocaleDateString() + " " +
                            finishTime.toLocaleTimeString();
                    }
                }
                // 初始化表格
                baseDataTable.init(dataConfig, columnConfig, uiConfig);
            })
        },
        // 上传文件接口
        uploadFile: function () {
            var _this = this;
            // 存储文件
            var file = customers.$selectFile.prop('files')[0];
            var formFile = new FormData();
            formFile.append('file', file);
            formFile.append('templateId', customers.templateId);
            // 发送ajax
            var ajaxConfig = customers.config.upload.ajax;

            ajaxConfig.data = formFile;
            nsVals.ajax(ajaxConfig, function (data) {
                if (data.success) {
                    customers.recordId = data.id;
                    // 切换按钮状态
                    _this.switchBtn();
                    // 初始化第二个页面
                    secondPage.init(data);
                } else {
                    nsalert("上传失败");
                }
            })
        },
        // 选择文件触发事件
        selectFile: function () {
            var _this = this;
            customers.$selectFile.on('change', function () {
                var file = customers.$selectFile.prop('files')[0];
                if (customers.$selectFile.val() != '') {
                    customers.$startImport.removeClass("disabled");
                    $(".file-name").text(file.name);
                    _this.starImport(true);
                } else {
                    customers.$startImport.addClass("disabled");
                }
            })
        },
        // 点击开始导入触发事件
        starImport: function (toUpload) {
            var _this = this;
            customers.$startImport.off();
            // 要用
            customers.$startImport.on('click', function () {
                // 如果没有传递数据，说明是导入新数据
                if (toUpload) {
                    //上传文件
                    //成功		切换按钮状态  进入第二个页面
                    //失败		提示失败
                    console.log("导入新数据");
                    _this.uploadFile();
                } else {
                    // 如果传递数据了，说明是导入历史数据
                    console.log("导入历史数据");
                    // 初始化第二个页面
                    secondPage.init();
                }
            })

            // 要注释
            /* customers.$startImport.on('click', function () {
             // 切换按钮状态
             _this.switchBtn();
             secondPage.init();
             }) */

        },
        // 切换按钮状态
        switchBtn: function () {
            // 切换按钮状态
            customers.$startImport.css('display', 'none');
            customers.$confirmImport.css('display', 'inline-block');
            customers.$goBack.css('display', 'inline-block');
            // 切换进度条状态
            customers.$stepList.removeClass('current');
            customers.$stepList.eq(1).addClass('current');
        },
        // 返回了firstPage页面
        goBackFirstPage: function () {
            // 得到htmls
            var firstPageHtml = this.getFirstPageHtml();
            customers.$bodyContent.empty();
            customers.$bodyContent.append(firstPageHtml);
            // 添加下载模板的链接
            $(".templateLink").attr('href', customers.config.upload.templateUrl);
            // 初始化第一个页面表格
            this.importHistory();
            // 获取节点
            customers.getElement();
            // 切换按钮状态
            customers.$startImport.css('display', 'inline-block');
            customers.$startImport.addClass("disabled");
            customers.$confirmImport.css('display', 'none');
            customers.$goBack.css('display', 'none');
            // 切换进度条状态
            customers.$stepList.removeClass('current');
            customers.$stepList.eq(0).addClass('current');
            // 返回事件
            this.selectFile();
        }
    }
    // 第二个页面
    var secondPage = {
        init: function (tableList) {
            this.secondPage(tableList);
        },
        // 获取第二界面表格数据
        getImportTable: function (callback) {
            var _this = this;
            var tableList;
            if (typeof (customers.recordId) != "undefined") {
                // 获取list的ajax
                var listAjax = customers.valid.listAjax;
                listAjax.data = {
                    recordId: customers.recordId
                }
                // 获取数据
                nsVals.ajax(listAjax, function (data) {
                    tableList = data;
                    if (tableList.success) {
                        // 切换按钮状态
                        firstPage.switchBtn();
                        // 调用回调函数
                        callback && callback({
                            fields: customers.tableFields,
                            list: tableList
                        });
                    } else {
                        nsalert("历史记录ajax返回出错");
                    }
                });
            } else {
                callback && callback({
                    fields: "",
                    list: tableList
                });
            }
        },
        // 云端导入页面
        secondPage: function (tableList) {
            var _this = this;
            var tabBtn = '';
            var $tabGroup = $('<div class="btn-group"></div>')
            var tableHtml = '<div class="importTable" id="importTable">'
                + '</div>';

            _this.getImportTable(function (data) {
                var table;
                // 如果没有传参，则使用请求到的，如果有参，说明是导入失败，重新加载页面
                if (typeof (tableList) == "undefined") {
                    // 说明是导入历史记录
                    table = data;
                } else {
                    // 说明是上传数据
                    table = {
                        fields: customers.tableFields,
                        list: tableList
                    }
                }
                // 字段
                var fieldsRows = table.fields.rows;
                // 每个table数据
                var listRows = table.list.rows;
                // 表数据
                window.itemList = {};

                for (var i = 0; i < fieldsRows.length; i++) {
                    for (var key in fieldsRows[i]) {

                        if (fieldsRows[i].hasOwnProperty(key)) {
                            var element = fieldsRows[i][key];
                            // 生成按钮
                            if (key == "name") {
                                tabBtn += '<button class="table-tab btn btn-white" data-table="' + element + '">' + element + '</button>';
                            }
                            // 规范数据
                            for (var j = 0; j < fieldsRows.length; j++) {
                                for (var key2 in listRows[j]) {
                                    if (listRows[j].hasOwnProperty(key2)) {
                                        var item = listRows[j][key2];
                                        if (element == item) {
                                            itemList[element] = {};
                                            // 规范数据，返回列配置
                                            var columnConfig = _this.alterKey(fieldsRows[i].fields);

                                            itemList[element].columnConfig = columnConfig;
                                            // 数据配置
                                            itemList[element].dataSource = listRows[j].list;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                // 清空bodyContent
                customers.$bodyContent.empty();
                // 添加按钮，添加表格
                $tabGroup.append(tabBtn);
                customers.$bodyContent.append($tabGroup);
                // 添加只显示错误信息的checkBox
                customers.$bodyContent.append($('<div class="fixd-offside">'
                    + '<input type="checkbox" name="defaultPrint" id="onlyError" checked="false">'
                    + '<label class="checkbox-inline" for="onlyError">只显示错误信息'
                    + '</label>'
                    + '</div>'
                    + '<div class="text-link">'
                    + '<a href="' + customers.upload.currentDataUrl + "?recordId=" + customers.recordId + '" class="download-current-data btn btn-white">'
                    + '<i class="fa-download"></i>点击下载本次数据</a>'
                    + '</div>'));
                // 添加错误显示div
                customers.$bodyContent.append($('<div class="error-box hidden" id="errorBox"></div>'));
                customers.$bodyContent.append(tableHtml);
                customers.$importTable = $("#importTable");
                // 下载本次数据
                this.$downloadCurrentData = $("#downloadCurrentData");
                // 第一个传递表数据，第二个值是刷新表的表名，由按钮提供
                _this.refreshImportTable(itemList);
                _this.secondPageAddEvent();
            });
        },
        // 规范表数据
        // 将fields数据中的 name 改为 field,并添加 title，从而形成columnConfig
        alterKey: function (data) {
            var _this = this;
            var columnConfig = [];
            $.each(data, function (index, value) {
                columnConfig[index] = {};

                for (var key in value) {
                    if (value.hasOwnProperty(key)) {
                        var element = value[key];
                        if (key == "name") {
                            columnConfig[index]["field"] = element;
                            columnConfig[index]["title"] = element;
                        } else if (key == "width") {
                            columnConfig[index]["width"] = element;
                        }
                    }
                }
            })
            // 每行添加按钮
            columnConfig.push({
                field: "button",
                title: "操作",
                width: 80,
                tabPosition: "after",
                formatHandler: {
                    type: "button",
                    data: [
                        {
                            '修改': function (row) {
                                if (_this.onlyErrorStatus) {
                                    var rowIndex = row.rowData.index;
                                } else {
                                    var rowIndex = row.rowIndexNumber;
                                }
                                var configS = {
                                    id: "plane-editImportInfo",
                                    title: "修改信息",
                                    zIndex: 9999,
                                    size: "m",
                                    form: [],
                                    btns: [
                                        {
                                            text: '确认修改',
                                            handler: function () {
                                                // 拿到修改后的数据
                                                var inputData = nsForm.getFormJSON("plane-editImportInfo");
                                                // console.log(inputData);
                                                // console.log(itemList);
                                                // 验证后进行数据的修改
                                                // inputData.isError = false; 修改后保留错误状态,更改背景色
                                                $.extend(itemList[_this.currentTable].dataSource[rowIndex], inputData);
                                                if (_this.onlyErrorStatus) {
                                                    _this.onlyErrorData()
                                                } else {
                                                    // 用修改后的数据来刷新表格
                                                    _this.refreshImportTable(itemList, _this.currentTable);
                                                }
                                                // 关闭表格
                                                hideDialog();
                                            },
                                        }
                                    ]
                                }

                                var rowData = row.rowData;
                                for (var key in rowData) {
                                    if (rowData.hasOwnProperty(key)) {
                                        var element = rowData[key];
                                        if (key != "button" && key != "id" && key != "isError" && key != "index") {
                                            if (typeof (element) != "object") {
                                                configS.form.push([{
                                                    id: key,
                                                    label: key,
                                                    value: element,
                                                    type: "text",
                                                    placeholder: "",
                                                    column: 6
                                                }])
                                            } else {
                                                configS.form.push({
                                                    id: key,
                                                    label: key,
                                                    value: element.value,
                                                    type: "text",
                                                    placeholder: "",
                                                    column: 6
                                                })
                                            }
                                        }
                                    }
                                }
                                nsdialogMore.initShow(configS);
                                $('#plane-editImportInfo').addClass('edit-modal');
                                function hideDialog() {
                                    nsalert("修改成功");
                                    nsdialogMore.hide();
                                }
                            }
                        },
                        {
                            '删除': function (row) {
                                if (_this.onlyErrorStatus) {
                                    var rowIndex = row.rowData.index;
                                } else {
                                    var rowIndex = row.rowIndexNumber;
                                }
                                // 获取行数据并删除
                                var trObj = row.obj.closest('tr');
                                baseDataTable.delRowData('table-importTable', trObj);
                                // 删除某一行
                                itemList[_this.currentTable].dataSource.splice(rowIndex, 1);
                                if (_this.onlyErrorStatus) {
                                    _this.onlyErrorData();
                                } else {
                                    _this.refreshImportTable(itemList, _this.currentTable);
                                }
                                // console.log(itemList[_this.currentTable].dataSource);
                                // 重新刷新表格
                                _this.refreshImportTable(itemList, _this.currentTable);
                                nsalert("删除成功");
                            }
                        }
                    ]
                }
            })
            return columnConfig;
        },
        // 用来根据数据刷新表格
        refreshImportTable: function (itemList, tableName) {
            var _this = this;
            // console.log(itemList);
            // 如果没有传表名，则默认显示第一个表数据
            var keyArr = [];
            if (typeof (tableName) == 'undefined') {
                $.each(itemList, function (key, value) {
                    keyArr.push(key);
                })
                _this.currentTable = keyArr[0];
                tableName = keyArr[0];
            }

            // 表数据
            var tableData = itemList[tableName].dataSource;
            // 表列配置
            var tableColumn = itemList[tableName].columnConfig;
            // 错误数据的index
            var errorData = "";

            // 表组件
            var dataConfig = {
                "tableID": "table-importTable",
                "dataSource": [],
                "isSearch": false,
            };
            var columnConfig = {};
            var uiConfig = {
                "pageLengthMenu": 5, //可选页面数  auto是自动计算  all是全部
                "isSingleSelect": true,
                "isMultiSelect": false,
                "isUseTabs": true,
                "$container": customers.$importTable,
                "changeTabCallback": function () {
                    _this.addErrorBox();
                }
            }
            // 将错误信息的key拿出来，放到后面使用formatHandler来进行错误信息的操作
            $.each(tableData, function (index, value) {
                for (var key in value) {
                    if (value.hasOwnProperty(key)) {
                        var element = value[key];
                        if (typeof (element) == 'object') {
                            // console.log(value, key, element);
                            errorData = key;
                            // console.log(index, value, key, element);
                        }
                    }
                }
            })
            //  给tableColumn添加formatHandler
            $.each(tableColumn, function (index, value) {
                if (index == tableColumn.length - 1) {
                    return;
                }
                value["formatHandler"] = function (rowData, row, meta) {
                    // console.log(value, row, meta);
                    if (row.isError) {
                        if (typeof (rowData) == "object") {
                            var $currentTd = $(meta.settings.aoData[meta.row].anCells[meta.col]);
                            // 给错误信息的td加class
                            $currentTd.addClass('error');
                            // 将错误信息赋值给td的data-errorMsg
                            $currentTd.attr("data-errormsg", rowData.errorMsg);
                            // 返回本表格要显示的数据
                            return rowData.value;
                        }
                        return rowData;
                    } else {
                        return rowData;
                    }
                }
            })
            // console.log(tableColumn);
            // 添加配置到表组件
            dataConfig.dataSource = tableData;
            columnConfig = tableColumn;
            // console.log(dataConfig, columnConfig, uiConfig);
            baseDataTable.init(dataConfig, columnConfig, uiConfig);
            // 添加事件，获取到当前错误的td
            _this.addErrorBox();
        },
        // 第二个页面添加事件,点击按钮显示特定表
        secondPageAddEvent: function () {
            var _this = this;
            // 按钮添加事件
            var btn = customers.$bodyContent.find("button");

            $.each(btn, function (index, btn) {
                $(btn).on('click', function () {
                    _this.currentTable = $(this).data('table');
                    // 如果已经勾选了只显示错误信息按钮,则显示相对应的错误信息
                    if (_this.onlyErrorStatus) {
                        _this.onlyErrorData();
                    } else {
                        _this.refreshImportTable(itemList, _this.currentTable);
                    }
                })
            })

            // 选框添加事件
            var $labelOnlyError = $('#onlyError').next();
            $labelOnlyError.on('click', function () {
                _this.onlyErrorStatus = $('#onlyError').is(':checked');
                if (_this.onlyErrorStatus) {
                    $('#onlyError').next().addClass('checked');
                    // 显示错误信息
                    _this.onlyErrorData();
                } else {
                    $('#onlyError').next().removeClass('checked');
                    // 显示正确信息
                    _this.refreshImportTable(itemList, _this.currentTable);
                }
            });

            // 返回第一页
            customers.$goBack.off();
            customers.$goBack.on('click', function () {
                firstPage.goBackFirstPage();
            })

            // 确认导入事件
            customers.$confirmImport.off();
            customers.$confirmImport.on('click', function () {
                threePage.init();
            })

        },
        // 只显示错误信息
        onlyErrorData: function () {
            for (var key in itemList) {
                var dataSource = itemList[key].dataSource;
                $.each(dataSource, function (index, item) {
                    item.index = index;
                })
            }
            var _this = this;
            window.errorList = $.extend(true, {}, itemList);
            (function removeFalse() {
                for (var key in errorList) {
                    if (errorList.hasOwnProperty(key)) {
                        var element = errorList[key];
                        var dataSource = element.dataSource;
                        $.each(dataSource, function (index, value) {
                            if (typeof (value) != "undefined" && !value.isError) {
                                dataSource.splice(index, 1);
                                removeFalse();
                            }
                        })
                    }
                }
            })();
            _this.refreshImportTable(errorList, _this.currentTable);
        },
        // 添加错误td鼠标悬停事件和显示错误信息的div
        addErrorBox: function () {
            // 给有错误的td添加鼠标悬停事件
            var $errorTd = $('td.error');
            var $errorBox = $("#errorBox");
            $.each($errorTd, function (index, value) {
                value.onmouseover = function (e) {
                    var errorMsg = $(this).data('errormsg');
                    var top = $(this).position().top;
                    var left = $(this).position().left;
                    var height = $(this).height();
                    $errorBox.attr('style', 'top:' + (top + height) + 'px;left:' + left + 'px;position:absolute;z-index:999999;')
                    $errorBox.text(errorMsg)
                    $errorBox.removeClass("hidden");
                }
                value.onmouseout = function () {
                    $errorBox.addClass("hidden");
                }
            })
        }
    }
    // 第三页面
    var threePage = {
        init: function () {
            var _this = this;
            //要用
            // 通过ajax来导入，如果成功执行成功方法，如果失败，执行失败方法
            var saveAjax = $.extend(true, {}, customers.config.save);
            var dataList = $.extend(true, {}, itemList);
            var ajaxList = [];
            var i = 0;

            for (var key in dataList) {
                if (dataList.hasOwnProperty(key)) {
                    var element = dataList[key];
                    delete element.columnConfig
                    $.each(element.dataSource, function (index, value) {
                        for (var key2 in value) {
                            if (key2 == "button" || key2 == "id" || key2 == "isError" || key2 == "index") {
                                delete value[key2];
                            }
                        }
                    })
                }
            }

            $.each(dataList, function (index, value) {
                ajaxList[i] = {};
                ajaxList[i]["name"] = index;
                ajaxList[i]["list"] = value.dataSource;
                i++;
            })
            saveAjax.data = JSON.stringify(ajaxList);

            saveAjax.url += "/" + customers.recordId;
            nsVals.ajax(saveAjax, function (data) {
                if (data.success == false) {
                    secondPage.init(_this.tableList);
                } else {
                    // 成功和失败两种状态
                    if (typeof (data.rows) == "undefined") {
                        //_this.threePageInfoHttpCallback(data);
                        _this.threePageSuccess();
                    } else {
                        // 失败后返回的数据
                        _this.tableList = data;
                        _this.threePageFail();
                    }
                }
            }, true);

            //要注释
            /* this.threePageSuccess();
             this.threePageFail(); */

            // 添加事件，与成功失败不冲突
            this.threePageEvent();
        },
        // 导入成功后调用的函数
        threePageSuccess: function () {
            var threePageHtml = '<div class="loading-data"><i class="fa-check-circle text-success"></i><h4>导入成功</h4></div>';
            customers.$bodyContent.empty();
            customers.$bodyContent.append(threePageHtml);
            this.switchBtn(false);
        },
        //导入成功后提示http回调信息
        threePageInfoHttpCallback: function (data) {
            if (data.isCallbackOk != "undefined") {
                var callbackMessage = data.callbackMessage;
                if (data.isCallbackOk == "OK") {
                    nsalert('回调http成功', 'success');
                } else {
                    nsalert('回调http失败', 'error');
                }
            }
        },
        // 失败后调用的函数
        threePageFail: function () {
            var threePageHtml = '<div class="loading-data"><i class="fa-times-circle text-danger"></i><h4>导入失败</h4></div>';
            customers.$bodyContent.empty();
            customers.$bodyContent.append(threePageHtml);
            this.switchBtn(true);
        },
        // 切换按钮状态
        switchBtn: function (status) {
            // 切换按钮状态
            customers.$startImport.css('display', 'none');
            customers.$confirmImport.css('display', 'none');
            // 如果成功则只显示成功，如果失败，则显示返回按钮和失败框
            if (status) {
                customers.$goBack.css('display', 'inline-block');
            } else {
                customers.$goBack.css('display', 'none');
            }
            // 切换进度条状态
            customers.$stepList.removeClass('current');
            customers.$stepList.eq(2).addClass('current');
        },
        // 第三页面事件
        threePageEvent: function () {
            var _this = this;
            customers.$goBack.off();
            customers.$goBack.on('click', function () {
                // 切换按钮状态
                customers.$startImport.css('display', 'none');
                customers.$confirmImport.css('display', 'inline-block');
                customers.$goBack.css('display', 'inline-block');
                // 切换进度条状态
                customers.$stepList.removeClass('current');
                customers.$stepList.eq(1).addClass('current');
                // 初始化第二个页面
                console.log("导入失败返回第二页面");
                secondPage.init(_this.tableList);
            })
        }
    }
    // 弹框显示组件
    function show(config, dialogConfig) {
        var dialogConfig = dialogConfig;
        var modal = '<div id="dialog-import" class="modal fade bs-example-modal-lg in" role="dialog" aria-hidden="true" aria-labelledby="dialog-import">'
            + '<div class="modal-dialog uimodal" style="width:800px">'
            + '</div>'
            + '</div>';
        // 如果没有模态框就添加，有则跳过
        if (typeof ($("body").find($("#dialog-import"))[0]) == "undefined") {
            $("body").append(modal);
        }
        // 显示模态框
        $('#dialog-import').modal('show');
        config.title = dialogConfig.title;
        // 初始化
        init(config);
    }

    // 初始化函数
    function init(config) {
        if (config != "" && typeof (config) != "undefined") {
            customers.init(config);
        } else {
            console.error("配置文件出错");
        }
    }

    return {
        show: show
    }
})(jQuery)