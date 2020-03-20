/**
 * @author dongchao on 2018/6/26.
 */
templateDef = {
    main: {
        main: function () {
            //类别树
            this.categoryTreeConfig = {
                id: "treedemo",
                src: getRootPath() + '/templateCategorys/getList',
                type: "GET",
                data: '',
                dataSrc: 'rows',
                controlMode: 'none',
                expandLevel: 1,
                controlForm: {
                    keyID: 'id',
                    keyParent: 'parentId',
                    keyText: 'name',
                    keyOrderID: 'ordered'
                },
                addAjax: getRootPath() + '/templateCategorys/save',
                editAjax: getRootPath() + '/templateCategorys/save',
                deleteAjax: getRootPath() + '/templateCategorys/delete',
                ajaxMethod: 'POST',
                selectMode: 'single',
                dragMode: false,
                selectHandler: function (data) {
                    baseDataTable.reloadTableAJAX('table-templateDef-main-template', {categoryId: data.id});
                    baseDataTable.clearData('table-templateDef-main-sheet');
                    baseDataTable.clearData('table-templateDef-main-cell');
                    baseDataTable.clearData('table-templateDef-main-table');
                    baseDataTable.clearData('table-templateDef-main-column');
                },
                addHandler: function () {
                    nsTree.init(templateDef.main.categoryTreeConfig);
                    nsdialog.hide();
                },
                delHandler: function () {
                    nsTree.init(templateDef.main.categoryTreeConfig);
                    nsdialog.hide();
                },
                editHandler: function () {
                    nsTree.init(templateDef.main.categoryTreeConfig);
                    nsdialog.hide();
                }
            };

            //导航栏
            this.navConfig = {
                isShowTitle: false,
                isShowHistoryBtn: false,
                isShowRefreshBtn: false,
                btns: [
                    [
                        {
                            text: '新增模版分类',
                            handler: nsTree.dialogAdd
                        },
                        {
                            text: '修改模版分类',
                            handler: function (data) {
                                if (!nsTree.currentData) {
                                    nsalert('请先选中一行模版分类', 'error');
                                }
                                nsTree.dialogEdit(data);
                            }
                        },
                        {
                            text: '删除模版分类',
                            handler: nsTree.dialogDelete
                        }
                    ],
                    [
                        {
                            text: '全部打开',
                            handler: nsTree.expandAll
                        },
                        {
                            text: '全部关闭',
                            handler: nsTree.collapseAll
                        }
                    ]
                ]
            };

            //标签页
            this.tabs = {
                defaultTab: 'sheet-tab',
                changeTabCallback: function (event, data) {
                    $('#layout-templateDef-main .can-hide').removeClass('hide').addClass('hide');
                    switch (data.tabID) {
                        case 'sheet-tab':
                            $('#templateDef-main-sheet').removeClass('hide');
                            $('#templateDef-main-cell').removeClass('hide');
                            console.log('sheet');
                            break;
                        case 'table-tab':
                            $('#templateDef-main-table').removeClass('hide');
                            $('#templateDef-main-column').removeClass('hide');
                            console.log('table');
                            break;
                    }
                }
            };

            //template表格
            this.templateDefTableConfig = {
                columns: [
                    {
                        field: 'id',
                        title: '主键id',
                        width: 80,
                    },
                    {
                        field: 'name',
                        title: '模版名称',
                        width: 80
                    },
                    {
                        field: 'categoryName',
                        title: '模版分类名称',
                        width: 80
                    },
                    {
                        field: 'remark',
                        title: '备注',
                        width: 80
                    },
                    {
                        title: '操作',
                        width: 150,
                        tabPosition: 'after',
                        formatHandler: {
                            type: 'button',
                            data: [
                                {
                                    '生成模版文件': generateTemplate
                                },
                                {
                                    '修改': editTemplateDef
                                }, {
                                    '删除': deleteTemplateDef
                                },
                                {
                                    '下载模版': downloadTemplate
                                },
                                {
                                    '上传模版': uploadTemplate
                                },
                                {
                                    '设置成功后的请求': setSuccessHttpRequest
                                }
                            ]
                        }
                    }
                ],
                data: {
                    src: getRootPath() + '/templateDefs/getList',
                    type: "GET",
                    isServerMode: false,
                    isSearch: true,
                    isPage: true,
                    dataSrc: 'rows',
                },
                ui: {
                    searchTitle: "",
                    searchPlaceholder: "",
                    isSelectColumns: false,
                    isAllowExport: false,
                    pageLengthMenu: 10,
                    isSingleSelect: true,
                    isMulitSelect: false,
                    defaultSelect: true,
                    isUseTabs: true,
                    tableHeightType: "wide",
                    onSingleSelectHandler: function () {
                        var data = nsTable.getSingleRowSelectedData("table-templateDef-main-template");
                        baseDataTable.reloadTableAJAX('table-templateDef-main-sheet', {templateId: data.id});
                        refreshTable('table-templateDef-main-cell', {sheetId: null});
                        baseDataTable.reloadTableAJAX('table-templateDef-main-table', {templateId: data.id});
                        refreshTable('table-templateDef-main-column', {tableId: null});
                    }
                },
                btns: {
                    addBtn: addTemplateDef
                }
            };
            //sheet表格
            this.sheetTableConfig = {
                columns: [
                    {
                        field: 'id',
                        title: '主键1',
                        width: 50,
                        hidden: true
                    },
                    {
                        field: 'name',
                        title: 'sheet名称',
                        width: 50
                    },
                    {
                        field: 'tableName',
                        title: '数据库表名',
                        width: 50
                    },
                    {
                        field: 'remark',
                        title: '备注',
                        width: 50
                    },
                    {
                        title: '操作',
                        width: 80,
                        tabPosition: 'after',
                        formatHandler: {
                            type: 'button',
                            data: [
                                {
                                    '修改': editSheetDef
                                }, {
                                    '删除': deleteSheetDef
                                }
                            ]
                        }
                    }
                ],
                data: {
                    src: getRootPath() + '/sheetDefs/getListByTempId',
                    type: "GET",
                    isServerMode: false,
                    isSearch: true,
                    isPage: true,
                    dataSrc: 'rows',
                },
                ui: {
                    searchTitle: "",
                    searchPlaceholder: "",
                    isSelectColumns: false,
                    isAllowExport: false,
                    pageLengthMenu: 10,
                    isSingleSelect: true,
                    isMulitSelect: false,
                    defaultSelect: true,
                    tableHeightType: "wide",
                    isUseTabs: true,
                    onSingleSelectHandler: function () {
                        var data = nsTable.getSingleRowSelectedData("table-templateDef-main-sheet");
                        baseDataTable.reloadTableAJAX('table-templateDef-main-cell', {sheetId: data.id});
                    }
                },
                btns: {
                    addBtn: addSheetDef,
                    selfBtn: []
                }
            };
            //cell表格
            this.cellTableConfig = {
                columns: [
                    {
                        field: 'id',
                        title: '主键2',
                        width: 100,
                        hidden: true
                    },
                    {
                        field: 'disOrder',
                        title: '排序',
                        width: 100,
                        hidden: true
                    },
                    {
                        field: 'extendJson',
                        title: '扩展属性',
                        width: 100,
                        hidden: true
                    },
                    {
                        field: 'name',
                        title: '列名称',
                        width: 100,
                        tabPosition: 'before',
                    },
                    {
                        field: 'typeName',
                        title: '列类型',
                        width: 100
                    },
                    {
                        field: 'dataType',
                        title: '数据类型',
                        width: 100
                    },
                    {
                        field: 'dataLength',
                        title: '长度',
                        width: 100
                    },
                    {
                        field: 'columnId',
                        title: '导出的字段ID',
                        width: 100,
                        hidden: true
                    },
                    {
                        field: 'columnName',
                        title: '导出的字段名',
                        width: 100,
                    },
                    {
                        field: 'isShow',
                        title: '是否显示',
                        width: 100,
                        formatHandler: {
                            type: 'dictionary',
                            data: {
                                '1': '是',
                                '0': '否'
                            }
                        }
                    },
                    {
                        field: 'isSave',
                        title: '是否保存',
                        width: 100,
                        formatHandler: {
                            type: 'dictionary',
                            data: {
                                '1': '是',
                                '0': '否'
                            }
                        }
                    },
                    {
                        field: 'nonEmptyFlag',
                        title: '是否非空',
                        width: 100,
                        formatHandler: {
                            type: 'dictionary',
                            data: {
                                '1': '是',
                                '0': '否'
                            }
                        }
                    },
                    {
                        field: 'defaultValue',
                        title: '默认值',
                        width: 100
                    },
                    {
                        field: 'validRule',
                        title: '验证规则',
                        width: 100
                    },
                    {
                        field: 'uniqueInFileFlag',
                        title: '导入文件内唯一',
                        width: 100,
                        formatHandler: {
                            type: 'dictionary',
                            data: {
                                '1': '是',
                                '0': '否'
                            }
                        }
                    },
                    {
                        field: 'uniqueInDbFlag',
                        title: '数据库内唯一',
                        width: 100,
                        formatHandler: {
                            type: 'dictionary',
                            data: {
                                '1': '是',
                                '0': '否'
                            }
                        }
                    },
                    {
                        field: 'ordinaryOperation',
                        title: '操作',
                        width: 150,
                        tabPosition: 'after',
                        formatHandler: {
                            type: 'button',
                            data: [
                                {
                                    '设置': setCellDef
                                },
                                {
                                    '修改': editCellDef
                                },
                                {
                                    '删除': deleteCellDef
                                },
                                {
                                    '上移': moveUp
                                },
                                {
                                    '下移': moveDown
                                }
                            ]
                        }
                    }
                ],
                data: {
                    src: getRootPath() + '/cellDefs/getListBySheetId',
                    type: "GET",
                    isServerMode: false,
                    isSearch: true,
                    isPage: true,
                    dataSrc: 'rows',
                },
                ui: {
                    searchTitle: "",
                    searchPlaceholder: "",
                    isSelectColumns: false,
                    isAllowExport: false,
                    pageLengthMenu: 10,
                    isSingleSelect: true,
                    isMulitSelect: false,
                    defaultSelect: true,
                    isUseTabs: true,
                    tableHeightType: "wide",
                    onSingleSelectHandler: function () {
                    }
                },
                btns: {
                    addBtn: addCellDef
                }
            };
            //table表格
            this.tableTableConfig = {
                columns: [
                    /*                    {
                     field: 'id',
                     title: '主键3',
                     width: 80,
                     hidden: true
                     },*/
                    {
                        field: 'databaseName',
                        title: '数据库名称',
                        width: 80
                    },
                    {
                        field: 'name',
                        title: '数据库表名',
                        width: 80
                    },
                    {
                        title: '操作',
                        width: 80,
                        tabPosition: 'after',
                        formatHandler: {
                            type: 'button',
                            data: [
                                {
                                    '删除': deleteTableDef
                                }, {
                                    '刷新': refreshTableDef
                                }
                            ]
                        }
                    }
                ],
                data: {
                    src: getRootPath() + '/tables/getListByTempId',
                    type: "GET",
                    isServerMode: false,
                    isSearch: true,
                    isPage: true,
                    dataSrc: 'rows',
                },
                ui: {
                    searchTitle: "",
                    searchPlaceholder: "",
                    isSelectColumns: false,
                    isAllowExport: false,
                    pageLengthMenu: 10,
                    isSingleSelect: true,
                    isMulitSelect: false,
                    defaultSelect: true,
                    tableHeightType: "wide",
                    onSingleSelectHandler: function () {
                        var data = nsTable.getSingleRowSelectedData("table-templateDef-main-table");
                        baseDataTable.reloadTableAJAX('table-templateDef-main-column', {tableId: data.id});
                    }
                },
                btns: {
                    addBtn: function () {
                        var templateData = nsTable.getSingleRowSelectedData("table-templateDef-main-template");
                        if (!templateData) {
                            nsalert('请先选中一行模版', 'error');
                            return;
                        }
                        var addTableDefConfig = {
                            id: 'table-templateDef-main-table-dialog',
                            title: '新增数据库表',
                            size: 'm',
                            form: tableDefDialogForm,
                            btns: [
                                {
                                    text: '确认',
                                    handler: editTableDefSubmit
                                }
                            ]
                        };
                        nsdialog.initShow(addTableDefConfig);
                    }
                }
            };
            //column表格
            this.columnTableConfig = {
                columns: [
                    /*{
                     field: 'id',
                     title: '主键4',
                     width: 100,
                     hidden: true
                     },*/
                    {
                        field: 'name',
                        title: '字段名',
                        width: 100
                    },
                    {
                        field: 'remark',
                        title: '备注',
                        width: 100
                    },
                    {
                        field: 'dataType',
                        title: '数据类型',
                        width: 100
                    },
                    {
                        field: 'dataLength',
                        title: '长度',
                        width: 100
                    },
                    {
                        field: 'nonEmptyFlag',
                        title: '是否非空',
                        width: 100,
                        formatHandler: {
                            type: 'dictionary',
                            data: {
                                '1': '是',
                                '0': '否'
                            }
                        }
                    },
                    {
                        field: 'pkFlag',
                        title: '是否主键',
                        width: 100,
                        formatHandler: {
                            type: 'dictionary',
                            data: {
                                '1': '是',
                                '0': '否'
                            }
                        }
                    },
                    {
                        field: 'ordinaryOperation',
                        title: '操作',
                        width: 150,
                        tabPosition: 'after',
                        formatHandler: {
                            type: 'button',
                            data: [
                                {
                                    '修改': function (data) {
                                        var editTableColumnConfig = {
                                            id: 'table-templateDef-main-column-dialog',
                                            title: "修改单元格",
                                            size: 'm',
                                            form: [
                                                {
                                                    id: 'id',
                                                    type: 'hidden'
                                                },
                                                {
                                                    id: 'dataLength',
                                                    label: '长度',
                                                    type: 'text',
                                                    rules: 'required precision=2',
                                                }
                                            ],
                                            btns: [
                                                {
                                                    text: '确认',
                                                    handler: editTableColumnSubmit
                                                }
                                            ]
                                        }
                                        nsdialog.initValueShow(editTableColumnConfig, data.rowData);
                                    }
                                }
                            ]
                        }
                    }
                ],
                data: {
                    src: getRootPath() + '/tableColumns/getListByTableId',
                    type: "GET",
                    isServerMode: false,
                    isSearch: true,
                    isPage: true,
                    isUseTabs: true,
                    dataSrc: 'rows',
                },
                ui: {
                    searchTitle: "",
                    searchPlaceholder: "",
                    isSelectColumns: false,
                    isAllowExport: false,
                    pageLengthMenu: 10,
                    isSingleSelect: true,
                    isMulitSelect: false,
                    tableHeightType: "wide",
                    defaultSelect: true,
                    onSingleSelectHandler: function () {
                    }
                },
                btns: {}
            };

            nsLayout.init("templateDef-main");

            function refreshTable(tableId, data) {
                baseDataTable.reloadTableAJAX(tableId, data);
            }

            //新增excel模版定义
            function addTemplateDef() {
                var addTemplateDefConfig = {
                    id: 'table-templateDef-main-template-dialog',
                    title: '新增模版',
                    size: 'm',
                    form: templateDefDialogForm,
                    btns: [
                        {
                            text: '确认',
                            handler: editTemplateDefSubmit
                        }
                    ]
                };
                nsdialog.initShow(addTemplateDefConfig);
            }

            //修改excel模版定义弹窗
            function editTemplateDef(data) {
                var row = data.rowData;
                var editTemplateDefConfig = {
                    id: 'table-templateDef-main-template-dialog',
                    title: "修改模版",
                    size: 'm',
                    form: templateDefDialogForm,
                    btns: [
                        {
                            text: '确认',
                            handler: editTemplateDefSubmit
                        }
                    ]
                };
                nsdialog.initValueShow(editTemplateDefConfig, row);
            }

            //excel模版定义弹窗配置
            var templateDefDialogForm = [
                {
                    id: 'id',
                    label: '模版ID',
                    type: 'hidden'
                }, {
                    id: 'name',
                    label: '模版名称',
                    type: 'text',
                    rules: 'required'
                }, {
                    id: 'categoryId',
                    label: '模版类别',
                    type: 'tree-select',
                    url: getRootPath() + '/templateCategorys/getList',
                    treeType: 'GET',
                    async: true,
                    rules: 'required',
                    dataSrc: 'rows',
                    textField: 'name',
                    valueField: 'id'
                }, {
                    id: 'remark',
                    label: '备注',
                    type: 'text',
                    rules: 'required'
                }
            ];
            //删除excel模版定义弹窗
            function deleteTemplateDef(data) {
                var trData = data.rowData;
                nsmessager.confirm("是否确认删除模版：" + trData.name, function () {
                    $.ajax({
                        data: {id: trData.id},
                        url: getRootPath() + '/templateDefs/delete',
                        success: function (data) {
                            if (data.success) {
                                nsalert('删除成功', 'success');
                                baseDataTable.reloadTableAJAX("table-templateDef-main-template");
                                refreshTable("table-templateDef-main-sheet", {templateId: null});
                                refreshTable("table-templateDef-main-cell", {sheetId: null});
                                refreshTable("table-templateDef-main-table", {templateId: null});
                                refreshTable("table-templateDef-main-column", {tableId: null});
                            } else {
                                var errStr = data.msg;
                                nsalert('删除失败，请重试 ' + errStr, 'error');
                            }
                        },
                        error: function (e) {
                            nsalert('删除失败，请重试', 'error');
                        }
                    })
                });
            }

            //excel模板编辑保存
            function editTemplateDefSubmit() {
                var data = nsForm.getFormJSON('table-templateDef-main-template-dialog');
                if (data) {
                    $.ajax({
                        data: data,
                        url: getRootPath() + '/templateDefs/save',
                        type: 'post',
                        success: function (data) {
                            if (data.success) {
                                nsalert('保存成功', 'success');
                                baseDataTable.reloadTableAJAX('table-templateDef-main-template');
                                nsdialog.hide();
                            } else {
                                var errStr = data.msg;
                                nsalert('保存失败，请重试 ' + errStr, 'error');
                            }
                        },
                        error: function (e) {
                            nsalert('保存失败，请重试', 'error');
                        }
                    })
                }
            }


            //生成模板文件
            function generateTemplate(data) {
                var templateId = data.rowData.id;
                nsmessager.confirm("如果模版文件已存在,将会覆盖!是否确认生成模版?", function () {
                    $.ajax({
                        url: getRootPath() + '/templateExport/generate/' + templateId,
                        type: 'POST',
                        success: function (data) {
                            if (data.success) {
                                nsalert('生成模版成功');
                            } else {
                                var errStr = data.msg;
                                nsalert('生成模版失败，' + errStr, 'error');
                            }
                        },
                        error: function (e) {
                            nsalert('生成模版失败，请重试', 'error');
                        }
                    });
                })
            }

            // 下载模版
            function downloadTemplate(data) {
                var templateId = data.rowData.id;
                // var templateUrl = getRootPath() + "/templateExport/" + templateId;
                // var a = document.createElement('a');
                // a.href = templateUrl;
                // a.click();
                NetStarUtils.download({
                    url : getRootPath() + "/templateExport/" + templateId,
                    fileName : templateId + '.xlsx',
                })
            }

            //上传模版
            function uploadTemplate(data) {
                var templateId = data.rowData.id;
                var uploadTemplateConfig = {
                    id: 'upload',
                    title: '上传模版文件',
                    size: 'm',
                    form: [
                        {
                            id: 'file',
                            label: '上传模版文件',
                            type: 'upload_single',
                            column: 12,
                            uploadSrc: getRootPath() + '/templateExport/' + templateId,//路径
                            supportFormat: '.xlsx',
                            changeHandler: function (data) {
                                data = data.data;
                                if (data.success) {
                                    nsalert('上传成功!', 'success');
                                    nsdialog.hide();
                                }
                                var formData = nsForm.getFormJSON('upload');
                                if (!formData.name) {
                                    nsForm.fillValues({
                                        name: data.data.name
                                    }, 'upload');
                                }
                                return data;
                            },
                            ismultiple: false,
                            textField: 'name',
                            valueField: 'name',
                        }
                    ],
                    btns: [
                        {
                            text: '确认',
                            handler: function () {
                                nsdialog.hide();
                            }
                        }
                    ]
                };
                nsdialog.initShow(uploadTemplateConfig);
            }

            //设置导入成功后的Http请求
            function setSuccessHttpRequest(data) {
                var row = data.rowData;
                var httpSettings = eval('(' + data.rowData.httpSettings + ')');
                row = $.extend({}, row, httpSettings);
                var setSuccessHttpRequestConfig = {
                    id: 'table-templateDef-main-template-http-dialog',
                    title: "设置导入成功后的Http请求",
                    size: 'm',
                    form: [
                        {
                            id: 'id',
                            label: '模版ID',
                            type: 'hidden'
                        }, {
                            id: 'url',
                            label: '请求路径',
                            type: 'text',
                            rules: 'required'
                        }, {
                            id: 'paramName',
                            label: '参数名',
                            type: 'text'
                        }, {
                            id: 'isInUse',
                            label: '是否启用',
                            type: 'radio',
                            textField: 'text',
                            valueField: 'value',
                            subdata: [
                                {
                                    text: '是',
                                    value: '1',
                                    isChecked: true,
                                    isDisabled: false
                                }, {
                                    text: '否',
                                    value: '0',
                                    isChecked: false,
                                    isDisabled: false
                                }
                            ]
                        },
                        {
                            id: 'type',
                            label: '请求类型',
                            type: 'radio',
                            textField: 'text',
                            valueField: 'value',
                            subdata: [
                                {
                                    text: 'GET',
                                    value: 'GET',
                                    isChecked: true,
                                    isDisabled: false
                                }, {
                                    text: 'POST',
                                    value: 'POST',
                                    isChecked: false,
                                    isDisabled: false
                                }
                            ]
                        }, {
                            id: 'dataSheet',
                            label: '数据来源表格',
                            type: 'select',
                            textField: 'name',
                            valueField: 'id',
                            dataSrc: 'rows',
                            url: getRootPath() + '/sheetDefs/getListByTempId?templateId=' + data.rowData.id,
                            changeHandler: function (id, value) {
                                var parentCols = getCellDefs(id, function (cellDefs) {
                                    nsForm.edit([
                                        {
                                            id: 'dataCell',
                                            subdata: cellDefs
                                        }
                                    ], 'table-templateDef-main-template-http-dialog');
                                });
                            }
                        }, {
                            id: 'dataCell',
                            label: '数据来源列',
                            type: 'select2',
                            textField: 'name',
                            valueField: 'name',
                            subdata: [],
                        }
                    ],
                    btns: [
                        {
                            text: '确认',
                            handler: function () {
                                var data = nsForm.getFormJSON('table-templateDef-main-template-http-dialog');
                                if (data) {
                                    var submitData = {
                                        id: data.id,
                                        httpSettings: JSON.stringify(data)
                                    }
                                    $.ajax({
                                        data: submitData,
                                        url: getRootPath() + '/templateDefs/save',
                                        type: 'post',
                                        success: function (data) {
                                            if (data.success) {
                                                nsalert('保存成功', 'success');
                                                nsdialog.hide();
                                            } else {
                                                var errStr = data.msg;
                                                nsalert('保存失败，请重试 ' + errStr, 'error');
                                            }
                                        },
                                        error: function (e) {
                                            nsalert('保存失败，请重试', 'error');
                                        }
                                    })
                                }
                            }
                        }
                    ]
                };
                nsdialog.initValueShow(setSuccessHttpRequestConfig, row);
            }

            //新增Sheet页定义
            function addSheetDef() {
                var data = nsTable.getSingleRowSelectedData("table-templateDef-main-template");
                if (!data) {
                    nsalert('请先选中一行模版', 'error');
                    return;
                }
                var editSheetConfig = {
                    id: 'table-templateDef-main-sheet-dialog',
                    title: "新增sheet页",
                    size: 'm',
                    form: sheetDefDialogForm(),
                    btns: [
                        {
                            text: '确认',
                            handler: function () {
                                editSheetDefSubmit({templateId: data.id})
                            }
                        }
                    ]
                }
                nsdialog.initShow(editSheetConfig);
            }

            //修改Sheet页定义弹窗
            function editSheetDef(data) {
                var editSheetConfig = {
                    id: 'table-templateDef-main-sheet-dialog',
                    title: "修改sheet页",
                    size: 'm',
                    form: sheetDefDialogForm(),
                    btns: [
                        {
                            text: '确认',
                            handler: editSheetDefSubmit
                        }
                    ]
                }
                nsdialog.initValueShow(editSheetConfig, data.rowData);
            }

            //SheetDef弹窗配置
            function sheetDefDialogForm() {
                var templateData = nsTable.getSingleRowSelectedData("table-templateDef-main-template");
                return [
                    {
                        id: 'id',
                        label: 'SheetID',
                        type: 'hidden'
                    }, {
                        id: 'name',
                        label: 'Sheet页名称',
                        type: 'text',
                        rules: 'required'
                    }, {
                        id: 'tableName',
                        label: '',
                        type: 'hidden'
                    }, {
                        id: 'tableId',
                        label: '数据库表名',
                        type: 'select',
                        rules: 'required',
                        textField: 'name',
                        valueField: 'id',
                        dataSrc: 'rows',
                        url: getRootPath() + '/tables/getListByTempId?templateId=' + templateData.id,
                        changeHandler: function (id, value) {
                            nsForm.fillValues({tableName: value}, 'table-templateDef-main-sheet-dialog');
                        }
                    }, {
                        id: 'remark',
                        label: '备注',
                        type: 'text',
                        rules: 'required'
                    }
                ];
            }

            //删除Sheet页定义弹窗
            function deleteSheetDef(data) {
                var trData = data.rowData;
                nsmessager.confirm("是否确认删除模版：" + trData.name, function () {
                    $.ajax({
                        data: {id: trData.id},
                        url: getRootPath() + '/sheetDefs/delete',
                        success: function (data) {
                            if (data.success) {
                                nsalert('删除成功', 'success');
                                baseDataTable.reloadTableAJAX("table-templateDef-main-sheet");
                                refreshTable("table-templateDef-main-cell", {sheetId: null});
                            } else {
                                var errStr = data.msg;
                                nsalert('删除失败，请重试 ' + errStr, 'error');
                            }
                        },
                        error: function (e) {
                            nsalert('删除失败，请重试', 'error');
                        }
                    })
                });
            }

            //Sheet页定义编辑保存
            function editSheetDefSubmit(templateData) {
                var data = nsForm.getFormJSON('table-templateDef-main-sheet-dialog');
                if (templateData) {
                    data.templateId = templateData.templateId;
                }
                if (data) {
                    $.ajax({
                        data: data,
                        url: getRootPath() + '/sheetDefs/save',
                        type: 'post',
                        success: function (data) {
                            if (data.success) {
                                nsalert('保存成功', 'success');
                                baseDataTable.reloadTableAJAX('table-templateDef-main-sheet');
                                nsdialog.hide();
                            } else {
                                var errStr = data.msg;
                                nsalert('保存失败，请重试 ' + errStr, 'error');
                            }
                        },
                        error: function (e) {
                            nsalert('保存失败，请重试', 'error');
                        }
                    })
                }
            }


            //sheet页关系弹窗表格
            function dialogForm(data) {
                var parentSheetId = data.rowData.id;
                var config = {
                    id: "dialogForm-table",
                    title: "设置sheet页关系",
                    size: "b",
                    form: [
                        {
                            id: 'sheet-relation-table',
                            type: 'table',
                            src: getRootPath() + '/sheetRelations/getListByParentSheetId?parentSheetId=' + parentSheetId,
                            srctype: "GET",
                            dataSrc: "rows",
                            isColumnsCounter: true,
                            isSingleSelect: true,
                            column: [
                                {
                                    field: 'parentSheetName',
                                    title: '父sheet页名称',
                                    width: 48,
                                }, {
                                    field: 'childSheetName',
                                    title: '子sheet页名称',
                                    width: 48,
                                }, {
                                    field: 'parentColName',
                                    title: '父列名',
                                    width: 48,
                                }, {
                                    field: 'childColName',
                                    title: '子列名',
                                    width: 48,
                                }, {
                                    title: '操作',
                                    width: 50,
                                    tabPosition: 'after',
                                    formatHandler: {
                                        type: 'button',
                                        data: [
                                            {
                                                '修改': editSheetRelation
                                            }, {
                                                '删除': deleteSheetRelation
                                            }
                                        ]
                                    }
                                }
                            ],
                        }
                    ],
                    btns: [
                        {
                            text: '新增',
                            handler: function () {
                                addSheetRelation(data.rowData)
                            }
                        }
                    ]
                }
                popupBox.initShow(config);
            }

            function addSheetRelation(data) {
                var editSheetRelationConfig = {
                    id: 'table-templateDef-main-sheet-relation-dialog',
                    title: "新增sheet页关系",
                    size: 'm',
                    form: setSheetRelationForm(data),
                    btns: [
                        {
                            text: '确认',
                            handler: setSheetRelationSubmit
                        }
                    ]
                }
                nsdialogMore.initShow(editSheetRelationConfig);
            }

            function editSheetRelation(data) {
                var relationData = data.rowData;
                var editSheetRelationConfig = {
                    id: 'table-templateDef-main-sheet-relation-dialog',
                    title: "修改sheet页关系",
                    size: 'm',
                    form: editSheetRelationForm(relationData),
                    btns: [
                        {
                            text: '确认',
                            handler: setSheetRelationSubmit
                        }
                    ]
                }
                nsdialogMore.initShow(editSheetRelationConfig);

                autoInput(editSheetRelationConfig, relationData);
            }

            function deleteSheetRelation(data) {
                var trData = data.rowData;
                var config = {
                    id: "plane-viewState",
                    title: "确认",
                    size: "s",
                    form: [
                        {
                            note: "是否确认删除此sheet页关系?"
                        }
                    ],
                    btns: [
                        {
                            text: '确认',
                            handler: function () {
                                $.ajax({
                                    data: {id: trData.id},
                                    url: getRootPath() + '/sheetRelations/delete',
                                    success: function (data) {
                                        if (data.success) {
                                            nsalert('删除成功', 'success');
                                            baseDataTable.reloadTableAJAX("sheet-relation-table");
                                        } else {
                                            var errStr = data.msg;
                                            nsalert('' + errStr, 'error');
                                        }
                                        nsdialogMore.hide();
                                    },
                                    error: function (e) {
                                        nsalert('删除失败，请重试', 'error');
                                        nsdialogMore.hide();
                                    }
                                })
                            }
                        }
                    ]
                }
                nsdialogMore.initShow(config);
            }

            //设置主子表关系
            function setSheetRelationForm(data) {
                var templateData = nsTable.getSingleRowSelectedData("table-templateDef-main-template");
                var formId = 'table-templateDef-main-sheet-relation-dialog';
                return [
                    {
                        id: 'id',
                        label: 'SheetRelationID',
                        type: 'hidden'
                    }, {
                        id: 'parentSheetId',
                        label: 'parentSheetId',
                        type: 'hidden',
                        value: data.id,
                    }, {
                        id: 'parentSheetName',
                        label: '父Sheet页名',
                        type: 'text',
                        value: data.name,
                        readonly: true,
                    }, {
                        id: 'parentColId',
                        label: '父Col列名',
                        type: 'select',
                        textField: 'name',
                        valueField: 'id',
                        dataSrc: 'rows',
                        rules: 'required',
                        url: getRootPath() + '/cellDefs/getListBySheetId?sheetId=' + data.id,
                        changeHandler: function () {
                        }
                    }, {
                        id: 'childSheetId',
                        label: '子Sheet页名',
                        type: 'select',
                        rules: 'required',
                        textField: 'name',
                        valueField: 'id',
                        dataSrc: 'rows',
                        url: getRootPath() + '/sheetDefs/getListByTempId?' + 'templateId=' + templateData.id,
                        changeHandler: function (id, value) {
                            //根据id进行ajax查询,
                            //将查询结果设置到第二个下拉框的数据中
                            getCols(id, function (cols) {
                                nsForm.edit([{
                                    id: 'childColId',
                                    subdata: cols
                                }], formId);
                            });
                        }
                    }, {
                        id: 'childColId',
                        label: '子Col列名',
                        type: 'select',
                        textField: 'name',
                        valueField: 'id',
                        rules: 'required',
                        changeHandler: function () {
                        }
                    }
                ];
            }

            function editSheetRelationForm(data) {
                var templateData = nsTable.getSingleRowSelectedData("table-templateDef-main-template");
                var formId = 'table-templateDef-main-sheet-relation-dialog';
                return [
                    {
                        id: 'id',
                        label: 'SheetRelationID',
                        type: 'hidden',
                        value: data.id
                    }, {
                        id: 'parentSheetId',
                        label: 'parentSheetId',
                        type: 'hidden',
                        value: data.parentSheetId,
                    }, {
                        id: 'parentSheetName',
                        label: '父Sheet页名',
                        type: 'text',
                        value: data.parentSheetName,
                        readonly: true,
                    }, {
                        id: 'parentColId',
                        label: '父Col列名',
                        type: 'select',
                        textField: 'name',
                        valueField: 'id',
                        dataSrc: 'rows',
                        value: data.parentColId,
                        rules: 'required',
                        url: getRootPath() + '/cellDefs/getListBySheetId?sheetId=' + data.parentSheetId,
                        changeHandler: function () {
                        }
                    }, {
                        id: 'childSheetId',
                        label: '子Sheet页名',
                        type: 'select',
                        rules: 'required',
                        textField: 'name',
                        valueField: 'id',
                        value: data.childSheetId,
                        dataSrc: 'rows',
                        url: getRootPath() + '/sheetDefs/getListByTempId?' + 'templateId=' + templateData.id,
                        changeHandler: function (id, value) {
                            //根据id进行ajax查询,
                            //将查询结果设置到第二个下拉框的数据中
                            getCols(id, function (cols) {
                                nsForm.edit([{
                                    id: 'childColId',
                                    subdata: cols
                                }], formId);
                            });
                        }
                    }, {
                        id: 'childColId',
                        label: '子Col列名',
                        type: 'select',
                        textField: 'name',
                        valueField: 'id',
                        value: data.childColId,
                        rules: 'required',
                        changeHandler: function () {
                        }
                    }
                ];
            }

            function setSheetRelationSubmit() {
                var data = nsForm.getFormJSON('table-templateDef-main-sheet-relation-dialog');
                if (data) {
                    $.ajax({
                        data: data,
                        url: getRootPath() + '/sheetRelations/save',
                        type: 'post',
                        success: function (data) {
                            if (data.success) {
                                nsalert('保存成功', 'success');
                                baseDataTable.reloadTableAJAX('sheet-relation-table');
                                nsdialogMore.hide();
                            } else {
                                var errStr = data.msg;
                                nsalert('保存失败，请重试 ' + errStr, 'error');
                            }
                        },
                        error: function (e) {
                            nsalert('保存失败，请重试', 'error');
                        }
                    })
                }
            }


            //根据sheetId 获取列
            function getCols(sheetId, successFun) {
                $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    data: {sheetId: sheetId},
                    url: getRootPath() + '/cellDefs/getListBySheetId',
                    success: function (data) {
                        if (data.success) {
                            if (typeof(successFun) == 'function') {
                                successFun(data.rows);
                            }
                        } else {
                            nsalert('获取列失败，请重试 ' + data.msg, 'error');
                        }
                    },
                    error: function (e) {
                        nsalert('获取列失败，请重试', 'error');
                    }
                });
            }

            //新增cellDef列定义
            function addCellDef() {
                var data = nsTable.getSingleRowSelectedData("table-templateDef-main-sheet");
                if (!data) {
                    nsalert('请先选中一个sheet', 'error');
                    return;
                }
                var addCellDefConfig = {
                    id: 'table-templateDef-main-cell-dialog',
                    title: '新增单元格',
                    size: 'm',
                    form: cellDefDialogForm(),
                    btns: [
                        {
                            text: '确认',
                            handler: function () {
                                editCellDefSubmit({sheetId: data.id});
                            }
                        }
                    ]
                };
                nsdialog.initShow(addCellDefConfig);
            }

            //获取表单配置,设置列定义信息
            function setCellDef(data) {
                var typeId = data.rowData.type;
                var rowData = data.rowData;
                if (data.rowData.extendJson) {
                    var extendData = eval('(' + data.rowData.extendJson + ')');
                    rowData = $.extend({}, extendData, rowData);
                }
                $.ajax({
                    url: getRootPath() + '/columnTypes/' + typeId,
                    type: 'GET',
                    success: function (data) {
                        if (data.success) {
                            var formSettings = data.data.formSettings;
                            setCellDefDialog(formSettings, rowData);
                        } else {
                            var errStr = data.msg;
                            nsalert('获取表单配置信息失败，请重试 ' + errStr, 'error');
                        }
                    },
                    error: function (e) {
                        nsalert('获取表单配置信息失败，请重试', 'error');
                    }
                });
            }

            function setCellDefDialog(formSettings, rowData) {
                var setCellConfig = eval('(' + formSettings + ')');
                nsdialog.initValueShow(setCellConfig, rowData);
                /* 不同列类型有不同的情况,将自动填充联动下拉框的代码移到了列类型配置中 */
                if (setCellConfig.autoInput) {
                    setCellConfig.autoInput(setCellConfig, rowData);
                }
            }

            //设置列定义信息保存
            function setCellDefSubmit(data) {
                data.extendJson = JSON.stringify(data);
                $.ajax({
                    data: data,
                    url: getRootPath() + '/cellDefs/update',
                    type: 'post',
                    success: function (data) {
                        if (data.success) {
                            nsalert('保存成功', 'success');
                            baseDataTable.reloadTableAJAX('table-templateDef-main-cell');
                            nsdialog.hide();
                        } else {
                            var errStr = data.msg;
                            nsalert('保存失败，请重试 ' + errStr, 'error');
                        }
                    },
                    error: function (e) {
                        nsalert('保存失败，请重试', 'error');
                    }
                });
            }

            function editCellDef(data) {
                var editCellConfig = {
                    id: 'table-templateDef-main-cell-dialog',
                    title: "修改单元格",
                    size: 'm',
                    form: cellDefDialogForm(),
                    btns: [
                        {
                            text: '确认',
                            handler: function () {
                                editCellDefSubmit(data.rowData);
                            }
                        }
                    ]
                }
                nsdialog.initValueShow(editCellConfig, data.rowData);
            }

            //新增列定义弹窗
            function cellDefDialogForm() {
                var sheetData = nsTable.getSingleRowSelectedData("table-templateDef-main-sheet");
                return [
                    {
                        id: 'id',
                        label: 'id',
                        type: 'hidden'
                    }, {
                        id: 'name',
                        label: '列名称',
                        type: 'text',
                        rules: 'required',
                        changeHandler: function () {
                        }
                    }, {
                        id: 'columnId',
                        label: '字段',
                        type: 'select2',
                        textField: 'name',
                        valueField: 'id',
                        dataSrc: 'rows',
                        url: getRootPath() + '/tableColumns/getListBySheetId?sheetId=' + sheetData.id,
                        changeHandler: function (id, value) {
                        }
                    }, {
                        id: 'type',
                        label: '列类型',
                        type: 'select2',
                        rules: 'required',
                        textField: 'columnType',
                        valueField: 'id',
                        dataSrc: 'rows',
                        url: getRootPath() + '/columnTypes/getList',
                        changeHandler: function (id, value) {
                        }
                    }, {
                        id: 'width',
                        label: '列宽',
                        type: 'text',
                        rules: 'number',
                        changeHandler: function () {
                        }
                    }, {
                        id: 'dataLength',
                        label: '长度',
                        type: 'text',
                        readonly: true,
                    }, {
                        id: 'isShow',
                        label: '是否显示',
                        type: 'radio',
                        textField: 'text',
                        valueField: 'value',
                        subdata: [
                            {
                                text: '是',
                                value: '1',
                                isChecked: true,
                                isDisabled: false,
                            },
                            {
                                text: '否',
                                value: '0',
                                isChecked: false,
                                isDisabled: false,
                            }
                        ]
                    }, {
                        id: 'isSave',
                        label: '是否保存',
                        type: 'radio',
                        textField: 'text',
                        valueField: 'value',
                        subdata: [
                            {
                                text: '是',
                                value: '1',
                                isChecked: true,
                                isDisabled: false,
                            },
                            {
                                text: '否',
                                value: '0',
                                isChecked: false,
                                isDisabled: false,
                            }
                        ]
                    }
                ];
            }

            function deleteCellDef(data) {
                var trData = data.rowData;
                nsmessager.confirm("是否确认删除：" + trData.name, function () {
                    $.ajax({
                        data: {id: trData.id},
                        url: getRootPath() + '/cellDefs/delete',
                        success: function (data) {
                            if (data.success) {
                                nsalert('删除成功', 'success');
                                baseDataTable.reloadTableAJAX("table-templateDef-main-cell");
                            } else {
                                var errStr = data.msg;
                                nsalert('删除失败，请重试 ' + errStr, 'error');
                            }
                        },
                        error: function (e) {
                            nsalert('删除失败，请重试', 'error');
                        }
                    })
                });
            }

            function editCellDefSubmit(sheetData) {
                //获取当前行中的数据,删除表单中的属性,扩展formData
                var formFields = ['columnName', 'columnId', 'id', 'isSave', 'isShow', 'name', 'type', 'width'];
                $.each(sheetData, function (name, value) {
                    if ($.inArray(name, formFields) >= 0) {
                        delete sheetData[name];
                    }
                });
                var formData = nsForm.getFormJSON('table-templateDef-main-cell-dialog');
                var data = $.extend({}, formData, sheetData);
                if (data) {
                    $.ajax({
                        data: data,
                        url: getRootPath() + '/cellDefs/save',
                        type: 'post',
                        success: function (data) {
                            if (data.success) {
                                nsalert('保存成功', 'success');
                                baseDataTable.reloadTableAJAX('table-templateDef-main-cell');
                                nsdialog.hide();
                            } else {
                                var errStr = data.msg;
                                nsalert('保存失败，请重试 ' + errStr, 'error');
                            }
                        },
                        error: function (e) {
                            nsalert('保存失败，请重试', 'error');
                        }
                    })
                }
            }

            function moveUp(data) {
                var currentId = data.rowData.id;
                $.ajax({
                    data: {
                        currentId: currentId,
                        isUp: 1
                    },
                    url: getRootPath() + '/cellDefs/move',
                    type: 'POST',
                    success: function (data) {
                        if (data.success) {
                            nsalert('上移成功', 'success');
                            baseDataTable.reloadTableAJAX("table-templateDef-main-cell");
                        } else {
                            var errStr = data.msg;
                            nsalert('上移失败，请重试 ' + errStr, 'error');
                        }
                    },
                    error: function (e) {
                        nsalert('上移失败，请重试', 'error');
                    }
                })
            }

            function moveDown(data) {
                var currentId = data.rowData.id;
                $.ajax({
                    data: {
                        currentId: currentId,
                        isUp: 0
                    },
                    url: getRootPath() + '/cellDefs/move',
                    type: 'POST',
                    success: function (data) {
                        if (data.success) {
                            nsalert('下移成功', 'success');
                            baseDataTable.reloadTableAJAX("table-templateDef-main-cell");
                        } else {
                            var errStr = data.msg;
                            nsalert('下移失败，请重试 ' + errStr, 'error');
                        }
                    },
                    error: function (e) {
                        nsalert('下移失败，请重试', 'error');
                    }
                })
            }

            var tableDefDialogForm = [
                {
                    id: 'id',
                    label: 'id',
                    type: 'hidden'
                }, {
                    id: 'databaseId',
                    label: '数据库',
                    type: 'select2',
                    rules: 'required',
                    textField: 'name',
                    valueField: 'id',
                    dataSrc: 'rows',
                    url: getRootPath() + '/databases',
                    changeHandler: function (id, value) {
                        var parentCols = getTables(id, function (tables) {
                            nsForm.edit([{
                                id: 'name',
                                subdata: tables
                            }], 'table-templateDef-main-table-dialog');
                        });
                        var databaseType = getDatabaseType(id, function (databaseType) {
                            nsForm.fillValues({databaseType: databaseType}, 'table-templateDef-main-table-dialog');
                        });
                        nsForm.fillValues({databaseName: value}, 'table-templateDef-main-table-dialog');
                    }
                }, {
                    id: 'databaseType',
                    label: '数据库类型',
                    type: 'hidden',
                    changeHandler: function () {
                    }
                }, {
                    id: 'databaseName',
                    label: '数据库名称',
                    type: 'hidden',
                    changeHandler: function () {
                    }
                }, {
                    id: 'name',
                    label: '表名称',
                    type: 'select2',
                    textField: 'name',
                    valueField: 'name',
                    rules: 'required',
                    changeHandler: function () {
                    }
                }
            ];

            function getTables(databaseId, successFun) {
                $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    url: getRootPath() + '/databases/' + databaseId,
                    success: function (data) {
                        if (data.success) {
                            if (typeof(successFun) == 'function') {
                                successFun(data.rows);
                            }
                        } else {
                            nsalert('获取数据库表失败，请重试 ' + data.msg, 'error');
                        }
                    },
                    error: function (e) {
                        nsalert('获取数据库表失败，请重试', 'error');
                    }
                });
            }

            /**
             * 根据数据库id获取数据库类型
             * @param databaseId
             * @param succeFun
             */
            function getDatabaseType(databaseId, succeFun) {
                $.ajax({
                    type: 'GET',
                    datatype: 'json',
                    url: getRootPath() + '/databases',
                    success: function (data) {
                        if (data.success) {
                            for (var i in data.rows) {
                                if (data.rows[i].id == databaseId) {
                                    if (typeof(succeFun) == 'function') {
                                        succeFun(data.rows[i].dbType);
                                    }
                                }
                            }
                        } else {
                            nsalert('获取数据库失败，请重试 ' + data.msg, 'error');
                        }
                    },
                    error: function (e) {
                        nsalert('获取数据库失败，请重试', 'error');
                    }
                });
            }

            function getTableColumns(databaseId, tableName, successFun) {
                $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    url: getRootPath() + '/databases/' + databaseId + '/' + tableName,
                    success: function (data) {
                        if (data.success) {
                            if (typeof(successFun) == 'function') {
                                successFun(data.rows);
                            }
                        } else {
                            nsalert('获取数据库表字段失败，请重试 ' + data.msg, 'error');
                        }
                    },
                    error: function (e) {
                        nsalert('获取数据库表字段失败，请重试', 'error');
                    }
                });
            }

            function getCellDefs(sheetId, successFun) {
                $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    data: {sheetId: sheetId},
                    url: getRootPath() + '/cellDefs/getListBySheetId',
                    success: function (data) {
                        if (data.success) {
                            if (typeof(successFun) == 'function') {
                                successFun(data.rows);
                            }
                        } else {
                            nsalert('获取列定义失败，请重试 ' + data.msg, 'error');
                        }
                    },
                    error: function (e) {
                        nsalert('获取列定义失败，请重试', 'error');
                    }
                });
            }


            function editTableDefSubmit() {
                var data = nsForm.getFormJSON('table-templateDef-main-table-dialog');
                var templateData = nsTable.getSingleRowSelectedData("table-templateDef-main-template");
                if (templateData) {
                    data.templateId = templateData.id;
                }
                if (data) {
                    $.ajax({
                        data: data,
                        url: getRootPath() + '/tables/save',
                        type: 'post',
                        success: function (data) {
                            if (data.success) {
                                nsalert('保存成功', 'success');
                                baseDataTable.reloadTableAJAX('table-templateDef-main-table');
                                baseDataTable.reloadTableAJAX('table-templateDef-main-column');
                                nsdialog.hide();
                            } else {
                                var errStr = data.msg;
                                nsalert('保存失败，请重试 ' + errStr, 'error');
                            }
                        },
                        error: function (e) {
                            nsalert('保存失败，请重试', 'error');
                        }
                    })
                }
            }

            function deleteTableDef(data) {
                var trData = data.rowData;
                nsmessager.confirm("是否确认删除表格：" + trData.name, function () {
                    $.ajax({
                        data: {id: trData.id},
                        url: getRootPath() + '/tables/delete',
                        success: function (data) {
                            if (data.success) {
                                nsalert('删除成功', 'success');
                                baseDataTable.reloadTableAJAX("table-templateDef-main-table");
                                baseDataTable.reloadTableAJAX('table-templateDef-main-column');
                            } else {
                                var errStr = data.msg;
                                nsalert('' + errStr, 'error');
                            }
                        },
                        error: function (e) {
                            nsalert('删除失败，请重试', 'error');
                        }
                    })
                });
            }

            function refreshTableDef(data) {
                var trData = data.rowData;
                $.ajax({
                    url: getRootPath() + '/databases/clearCache/' + trData.databaseId + '/' + trData.name,
                    success: function (data) {
                    },
                    error: function (data) {
                    }
                });
                $.ajax({
                    data: {id: trData.id},
                    url: getRootPath() + '/tables/refreshById',
                    success: function (data) {
                        if (data.success) {
                            nsalert('刷新成功', 'success');
                            baseDataTable.reloadTableAJAX("table-templateDef-main-column");
                        } else {
                            var errStr = data.msg;
                            nsalert('' + errStr, 'error');
                        }
                    },
                    error: function (e) {
                        nsalert('刷新成功，请重试', 'error');
                    }
                })
            }


            //自动填充级联下拉框
            function autoInput(formConfig, formData) {
                var formArray = formConfig.form;
                for (var i = 0; i < formArray.length; i++) {
                    var formInput = formArray[i];
                    if (formInput.changeHandler) {
                        switch (formInput.type) {
                            case 'select':
                            case 'select2':
                                var sheetId = formData[formInput.id];
                                formInput.changeHandler(sheetId, {});
                                break;
                        }
                    }
                }
            }

            function editTableColumnSubmit() {
                var data = nsForm.getFormJSON('table-templateDef-main-column-dialog');
                if (data) {
                    $.ajax({
                        data: data,
                        url: getRootPath() + '/tableColumns/save',
                        type: 'post',
                        success: function (data) {
                            if (data.success) {
                                nsalert('修改成功', 'success');
                                baseDataTable.reloadTableAJAX('table-templateDef-main-column');
                                nsdialog.hide();
                            } else {
                                var errStr = data.msg;
                                nsalert('修改成功，请重试 ' + errStr, 'error');
                            }
                        },
                        error: function (e) {
                            nsalert('修改成功，请重试', 'error');
                        }
                    })
                }
            }
        }
    }
};
