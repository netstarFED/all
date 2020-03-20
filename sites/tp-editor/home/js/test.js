/*
 * @Desription: 测试代码用
 * @Author: netstar.cy
 * @Date: 2019-12-15 14:56:47
 * @LastEditTime : 2019-12-28 14:37:50
 */
const pageConfig = 
{
    "package": "nscloud.oatasklist1",
    "template": "businessDataBase",
    "readonly": false,
    "isShowTitle": true,
    "isFormHidden": false,
    "versionNumber": "1",
    "components": [
        {
            "type": "list",
            "position": "body",
            "field": [
                {
                    "englishName": "billId",
                    "chineseName": "业务id",
                    "variableType": "string",
                    "field": "billId",
                    "title": "业务id",
                    "mindjetType": "hidden",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "5d6dd3ac-a9d8-6c8c-9690-9e10e0c59f2b",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "billId",
                        "englishName": "billId",
                        "chineseName": "业务id",
                        "variableType": "string",
                        "mindjetType": "hidden",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "5d6dd3ac-a9d8-6c8c-9690-9e10e0c59f2b",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.Long",
                        "type": "hidden",
                        "label": "业务id",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false
                    },
                    "editable": false,
                    "hidden": false,
                    "orderable": true,
                    "searchable": false,
                    "tooltip": false,
                    "isDefaultSubdataText": false,
                    "mindjetIndexState": 0,
                    "width": 200
                },
                {
                    "englishName": "taskName",
                    "chineseName": "任务名称",
                    "variableType": "string",
                    "field": "taskName",
                    "title": "任务名称",
                    "mindjetType": "text",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "a8707165-6ebf-2c50-28cc-f223dbe4f958",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "taskName",
                        "englishName": "taskName",
                        "chineseName": "任务名称",
                        "variableType": "string",
                        "mindjetType": "text",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "a8707165-6ebf-2c50-28cc-f223dbe4f958",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.String",
                        "type": "text",
                        "label": "任务名称",
                        "rules": "required",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false
                    },
                    "editable": false,
                    "width": 180,
                    "hidden": false,
                    "orderable": true,
                    "searchable": true,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "formatHandler": {
                        "type": "href",
                        "data": {
                            "url": "https://qaapi.wangxingcloud.com//templateMindPages/pageConfig/1310607376293823474",
                            "title": "WBS详情",
                            "field": "taskName",
                            "readonly": false,
                            "parameterFormat": "{\"id\":\"{id}\"}",
                            "templateName": "businessDataBase"
                        }
                    },
                    "columnType": "href",
                    "mindjetIndexState": 1
                },
                {
                    "englishName": "taskState",
                    "chineseName": "状态",
                    "variableType": "number",
                    "field": "taskState",
                    "title": "状态",
                    "mindjetType": "dict",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "cad878cb-2207-f2e8-232c-6c09fe5d1b79",
                    "voName": "wbsWbsTasksVO",
                    "dictArguments": "wbsTaskState",
                    "editConfig": {
                        "id": "taskState",
                        "englishName": "taskState",
                        "chineseName": "状态",
                        "variableType": "number",
                        "mindjetType": "dict",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "cad878cb-2207-f2e8-232c-6c09fe5d1b79",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.Integer",
                        "type": "select",
                        "label": "状态",
                        "dictArguments": "wbsTaskState",
                        "textField": "value",
                        "valueField": "id",
                        "isObjectValue": false,
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false,
                        "subdata": [
                            {
                                "id": "0",
                                "value": "未开始",
                                "parentId": "-1"
                            },
                            {
                                "id": "1",
                                "value": "执行中",
                                "parentId": "-1"
                            },
                            {
                                "id": "2",
                                "value": "暂停",
                                "parentId": "-1"
                            },
                            {
                                "id": "3",
                                "value": "完成",
                                "parentId": "-1"
                            },
                            {
                                "id": "4",
                                "value": "取消",
                                "parentId": "-1"
                            },
                            {
                                "id": "5",
                                "value": "未分配"
                            }
                        ]
                    },
                    "editable": false,
                    "width": 80,
                    "hidden": false,
                    "orderable": true,
                    "searchable": true,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "mindjetIndexState": 2,
                    "formatHandler": {
                        "type": "dictionary",
                        "data": {
                            "0": "未开始",
                            "1": "执行中",
                            "2": "暂停",
                            "3": "完成",
                            "4": "取消",
                            "5": "未分配"
                        }
                    },
                    "columnType": "dictionary"
                },
                {
                    "englishName": "taskType",
                    "chineseName": "任务类别",
                    "variableType": "number",
                    "field": "taskType",
                    "title": "任务类别",
                    "mindjetType": "dict",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "962c661b-fcc1-e511-b40a-7c55ba17bcdf",
                    "voName": "wbsWbsTasksVO",
                    "dictArguments": "taskType",
                    "editConfig": {
                        "id": "taskType",
                        "englishName": "taskType",
                        "chineseName": "任务类别",
                        "variableType": "number",
                        "mindjetType": "dict",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "962c661b-fcc1-e511-b40a-7c55ba17bcdf",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.Integer",
                        "type": "select",
                        "label": "任务类别",
                        "rules": "required",
                        "dictArguments": "taskType",
                        "textField": "value",
                        "valueField": "id",
                        "isObjectValue": false,
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false,
                        "subdata": [
                            {
                                "id": "1",
                                "value": "需求分析",
                                "parentId": "-1"
                            },
                            {
                                "id": "2",
                                "value": "概要设计",
                                "parentId": "-1"
                            },
                            {
                                "id": "3",
                                "value": "系统验证",
                                "parentId": "-1"
                            },
                            {
                                "id": "4",
                                "value": "编写文档",
                                "parentId": "-1"
                            },
                            {
                                "id": "5",
                                "value": "计划编制",
                                "parentId": "-1"
                            },
                            {
                                "id": "6",
                                "value": "集成测试",
                                "parentId": "-1"
                            },
                            {
                                "id": "7",
                                "value": "界面制作",
                                "parentId": "-1"
                            },
                            {
                                "id": "8",
                                "value": "模块开发",
                                "parentId": "-1"
                            },
                            {
                                "id": "9",
                                "value": "BUG修改",
                                "parentId": "-1"
                            },
                            {
                                "id": "10",
                                "value": "测试",
                                "parentId": "-1"
                            },
                            {
                                "id": "11",
                                "value": "内部培训",
                                "parentId": "-1"
                            },
                            {
                                "id": "12",
                                "value": "实施培训",
                                "parentId": "-1"
                            },
                            {
                                "id": "13",
                                "value": "项目实施",
                                "parentId": "-1"
                            }
                        ]
                    },
                    "editable": false,
                    "width": 90,
                    "hidden": false,
                    "orderable": true,
                    "searchable": true,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "mindjetIndexState": 3,
                    "formatHandler": {
                        "type": "dictionary",
                        "data": {
                            "1": "需求分析",
                            "2": "概要设计",
                            "3": "系统验证",
                            "4": "编写文档",
                            "5": "计划编制",
                            "6": "集成测试",
                            "7": "界面制作",
                            "8": "模块开发",
                            "9": "BUG修改",
                            "10": "测试",
                            "11": "内部培训",
                            "12": "实施培训",
                            "13": "项目实施"
                        }
                    },
                    "columnType": "dictionary"
                },
                {
                    "englishName": "origin",
                    "chineseName": "来源",
                    "variableType": "number",
                    "field": "origin",
                    "title": "来源",
                    "mindjetType": "dict",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "36e337d9-75b8-fc94-9e9b-cbd402946c5b",
                    "voName": "wbsWbsTasksVO",
                    "dictArguments": "taskOrigin",
                    "editConfig": {
                        "id": "origin",
                        "englishName": "origin",
                        "chineseName": "来源",
                        "variableType": "number",
                        "mindjetType": "dict",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "36e337d9-75b8-fc94-9e9b-cbd402946c5b",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.Integer",
                        "type": "select",
                        "label": "来源",
                        "dictArguments": "taskOrigin",
                        "textField": "value",
                        "valueField": "id",
                        "isObjectValue": false,
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false,
                        "subdata": [
                            {
                                "id": "1",
                                "value": "客户",
                                "parentId": "-1"
                            },
                            {
                                "id": "2",
                                "value": "竞品",
                                "parentId": "-1"
                            },
                            {
                                "id": "3",
                                "value": "售后",
                                "parentId": "-1"
                            },
                            {
                                "id": "4",
                                "value": "设计",
                                "parentId": "-1"
                            },
                            {
                                "id": "5",
                                "value": "实施",
                                "parentId": "-1"
                            }
                        ]
                    },
                    "editable": false,
                    "width": 80,
                    "hidden": false,
                    "orderable": true,
                    "searchable": true,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "mindjetIndexState": 4,
                    "formatHandler": {
                        "type": "dictionary",
                        "data": {
                            "1": "客户",
                            "2": "竞品",
                            "3": "售后",
                            "4": "设计",
                            "5": "实施"
                        }
                    },
                    "columnType": "dictionary"
                },
                {
                    "englishName": "userName",
                    "chineseName": "所属负责人名称",
                    "variableType": "string",
                    "field": "userName",
                    "title": "负责人",
                    "mindjetType": "text",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "3d59eaab-434f-2cf7-1569-0fcbc010779b",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "userName",
                        "englishName": "userName",
                        "chineseName": "所属负责人名称",
                        "variableType": "string",
                        "mindjetType": "text",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "3d59eaab-434f-2cf7-1569-0fcbc010779b",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.String",
                        "type": "text",
                        "label": "负责人",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false
                    },
                    "editable": false,
                    "width": 80,
                    "hidden": false,
                    "orderable": true,
                    "searchable": true,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "mindjetIndexState": 5
                },
                {
                    "englishName": "urgentState",
                    "chineseName": "紧急状态",
                    "variableType": "number",
                    "field": "urgentState",
                    "title": "紧急状态",
                    "mindjetType": "dict",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "0ac02ee5-7bc1-8917-fd23-5d7f263d7697",
                    "voName": "wbsWbsTasksVO",
                    "dictArguments": "taskEmerState",
                    "editConfig": {
                        "id": "urgentState",
                        "englishName": "urgentState",
                        "chineseName": "紧急状态",
                        "variableType": "number",
                        "mindjetType": "dict",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "0ac02ee5-7bc1-8917-fd23-5d7f263d7697",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.Integer",
                        "type": "radio",
                        "label": "紧急状态",
                        "dictArguments": "taskEmerState",
                        "textField": "value",
                        "valueField": "id",
                        "isHasClose": false,
                        "isObjectValue": false,
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false,
                        "subdata": [
                            {
                                "id": "0",
                                "value": "紧急",
                                "parentId": "-1"
                            },
                            {
                                "id": "1",
                                "value": "非常紧急",
                                "parentId": "-1"
                            },
                            {
                                "id": "2",
                                "value": "一般",
                                "parentId": "-1",
                                "selected": true,
                                "isChecked": true
                            }
                        ]
                    },
                    "editable": false,
                    "width": 80,
                    "hidden": false,
                    "orderable": true,
                    "searchable": true,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "mindjetIndexState": 6,
                    "formatHandler": {
                        "type": "dictionary",
                        "data": {
                            "0": "紧急",
                            "1": "非常紧急",
                            "2": "一般"
                        }
                    },
                    "columnType": "dictionary"
                },
                {
                    "englishName": "remarks",
                    "chineseName": "备注",
                    "variableType": "string",
                    "field": "remarks",
                    "title": "备注",
                    "mindjetType": "textarea",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "17d53dbd-56ad-47a5-c7af-415cf4e441e9",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "remarks",
                        "englishName": "remarks",
                        "chineseName": "备注",
                        "variableType": "string",
                        "mindjetType": "textarea",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "17d53dbd-56ad-47a5-c7af-415cf4e441e9",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.String",
                        "type": "textarea",
                        "label": "备注",
                        "disabled": false,
                        "width": "99%",
                        "hidden": false,
                        "isDistinct": false,
                        "column": 12
                    },
                    "editable": false,
                    "width": 100,
                    "hidden": false,
                    "orderable": true,
                    "searchable": false,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "mindjetIndexState": 7
                },
                {
                    "englishName": "whenCreated",
                    "chineseName": "创建时间",
                    "variableType": "date",
                    "field": "whenCreated",
                    "title": "提出时间",
                    "mindjetType": "date",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "e224074d-1694-a094-a3b0-fe9c2df7fb49",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "whenCreated",
                        "englishName": "whenCreated",
                        "chineseName": "创建时间",
                        "variableType": "date",
                        "mindjetType": "date",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "e224074d-1694-a094-a3b0-fe9c2df7fb49",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.util.Date",
                        "type": "date",
                        "label": "提出时间",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false
                    },
                    "editable": false,
                    "hidden": false,
                    "orderable": true,
                    "searchable": false,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "width": 150,
                    "formatHandler": {
                        "type": "date",
                        "data": {
                            "formatDate": "YYYY-MM-DD HH:mm:ss"
                        }
                    },
                    "columnType": "datetime",
                    "mindjetIndexState": 8
                },
                {
                    "englishName": "createdByName",
                    "chineseName": "创建人姓名",
                    "variableType": "string",
                    "field": "createdByName",
                    "title": "创建人",
                    "mindjetType": "text",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "0c0d75af-4391-f698-4c20-9ad809165397",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "createdByName",
                        "englishName": "createdByName",
                        "chineseName": "创建人姓名",
                        "variableType": "string",
                        "mindjetType": "text",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "0c0d75af-4391-f698-4c20-9ad809165397",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.String",
                        "type": "text",
                        "label": "创建人",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false
                    },
                    "editable": false,
                    "hidden": false,
                    "orderable": true,
                    "searchable": false,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "width": 46,
                    "mindjetIndexState": 9
                },
                {
                    "englishName": "whenModified",
                    "chineseName": "修改时间",
                    "variableType": "date",
                    "field": "whenModified",
                    "title": "修改时间",
                    "mindjetType": "date",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "9a37cfe5-9a95-0dcb-061f-dc71a25a6c8b",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "whenModified",
                        "englishName": "whenModified",
                        "chineseName": "修改时间",
                        "variableType": "date",
                        "mindjetType": "date",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "9a37cfe5-9a95-0dcb-061f-dc71a25a6c8b",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.util.Date",
                        "type": "date",
                        "label": "修改时间",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false
                    },
                    "editable": false,
                    "hidden": false,
                    "orderable": true,
                    "searchable": false,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "width": 150,
                    "formatHandler": {
                        "type": "date",
                        "data": {
                            "formatDate": "YYYY-MM-DD HH:mm:ss"
                        }
                    },
                    "columnType": "datetime",
                    "mindjetIndexState": 10
                },
                {
                    "englishName": "modifiedByName",
                    "chineseName": "修改人姓名",
                    "variableType": "string",
                    "field": "modifiedByName",
                    "title": "修改人",
                    "mindjetType": "text",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "fdc17d52-cb63-d8ee-29ed-e9167977d777",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "modifiedByName",
                        "englishName": "modifiedByName",
                        "chineseName": "修改人姓名",
                        "variableType": "string",
                        "mindjetType": "text",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "fdc17d52-cb63-d8ee-29ed-e9167977d777",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.String",
                        "type": "text",
                        "label": "修改人",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false
                    },
                    "editable": false,
                    "hidden": false,
                    "orderable": true,
                    "searchable": false,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "width": 46,
                    "mindjetIndexState": 11
                },
                {
                    "englishName": "deadline",
                    "chineseName": "办理期限",
                    "variableType": "date",
                    "field": "deadline",
                    "title": "办理期限",
                    "mindjetType": "date",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "0c343a47-21f8-cc5e-613a-03a852c2feaa",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "deadline",
                        "englishName": "deadline",
                        "chineseName": "办理期限",
                        "variableType": "date",
                        "mindjetType": "date",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "0c343a47-21f8-cc5e-613a-03a852c2feaa",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.util.Date",
                        "type": "date",
                        "label": "办理期限",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false
                    },
                    "editable": false,
                    "width": 100,
                    "hidden": false,
                    "orderable": true,
                    "searchable": true,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "formatHandler": {
                        "type": "date",
                        "data": {
                            "formatDate": "YYYY-MM-DD"
                        }
                    },
                    "columnType": "date",
                    "mindjetIndexState": 12
                },
                {
                    "englishName": "isDelay",
                    "chineseName": "是否延期",
                    "variableType": "number",
                    "field": "isDelay",
                    "title": "是否延期",
                    "mindjetType": "select",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "345c62a3-505d-b11f-a322-564e83efa56c",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "isDelay",
                        "englishName": "isDelay",
                        "chineseName": "是否延期",
                        "variableType": "number",
                        "mindjetType": "select",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "345c62a3-505d-b11f-a322-564e83efa56c",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.Integer",
                        "type": "select",
                        "label": "是否延期",
                        "subdata": [
                            {
                                "isDisabled": false,
                                "selected": false,
                                "value": "是",
                                "id": "1"
                            },
                            {
                                "isDisabled": false,
                                "selected": false,
                                "value": "否",
                                "id": "0"
                            }
                        ],
                        "textField": "value",
                        "valueField": "id",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false
                    },
                    "editable": false,
                    "width": 64,
                    "hidden": false,
                    "orderable": true,
                    "searchable": true,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "mindjetIndexState": 13
                },
                {
                    "englishName": "deadDays",
                    "chineseName": "办理天数",
                    "variableType": "number",
                    "field": "deadDays",
                    "title": "办理天数",
                    "mindjetType": "number",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "539a4cd0-516e-6ffe-2182-3bd906785a68",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "deadDays",
                        "englishName": "deadDays",
                        "chineseName": "办理天数",
                        "variableType": "number",
                        "mindjetType": "number",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "539a4cd0-516e-6ffe-2182-3bd906785a68",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.Integer",
                        "type": "number",
                        "label": "办理天数",
                        "disabled": true,
                        "hidden": false,
                        "isDistinct": false
                    },
                    "editable": false,
                    "width": 60,
                    "hidden": false,
                    "orderable": true,
                    "searchable": false,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "mindjetIndexState": 14
                },
                {
                    "englishName": "attachmentIds",
                    "chineseName": "附件",
                    "variableType": "string",
                    "field": "attachmentIds",
                    "title": "附件",
                    "mindjetType": "upload",
                    "isSet": "是",
                    "displayType": "all",
                    "gid": "befb0986-fc0a-9515-ca66-d73dd3844587",
                    "voName": "wbsWbsTasksVO",
                    "editConfig": {
                        "id": "attachmentIds",
                        "englishName": "attachmentIds",
                        "chineseName": "附件",
                        "variableType": "string",
                        "mindjetType": "upload",
                        "isSet": "是",
                        "displayType": "all",
                        "gid": "befb0986-fc0a-9515-ca66-d73dd3844587",
                        "voName": "wbsWbsTasksVO",
                        "className": "java.lang.String",
                        "type": "upload",
                        "label": "附件",
                        "textField": "originalName",
                        "valueField": "id",
                        "isMultiple": true,
                        "isShowThum": "true",
                        "fileTypeField": "contentType",
                        "btns": "upload,edit,delete,download,print",
                        "disabled": false,
                        "hidden": false,
                        "isDistinct": false,
                        "ajax": {
                            "url": "https://qaapi.wangxingcloud.com//files/uploadList"
                        },
                        "editAjax": {
                            "url": "https://qaapi.wangxingcloud.com//files/rename"
                        },
                        "downloadAjax": {
                            "url": "https://qaapi.wangxingcloud.com//files/download/"
                        },
                        "getFileAjax": {
                            "url": "https://qaapi.wangxingcloud.com//files/getListByIds",
                            "type": "GET"
                        },
                        "previewAjax": {
                            "url": "https://qaapi.wangxingcloud.com//files/pdf/",
                            "type": "GET"
                        },
                        "previewImagesAjax": {
                            "url": "https://qaapi.wangxingcloud.com//files/images/",
                            "type": "GET"
                        }
                    },
                    "editable": true,
                    "width": 100,
                    "hidden": false,
                    "orderable": true,
                    "searchable": false,
                    "tooltip": false,
                    "isDefaultSubdataText": true,
                    "formatHandler": {
                        "type": "upload",
                        "data": {
                            "isShowButton": true,
                            "isShowContent": true,
                            "uploadSrc": "https://qaapi.wangxingcloud.com//files/upload",
                            "supportFormat": ".docx,.xls",
                            "isContentFile": {
                                "isLookFile": true,
                                "isDeleteFile": true
                            }
                        }
                    },
                    "columnType": "upload",
                    "mindjetIndexState": 15
                }
            ],
            "ajax": {
                "src": "https://qaapi.wangxingcloud.com//wbsTask/getPage",
                "dataSrc": "rows",
                "type": "POST",
                "dataFormat": "object",
                "contentType": "application/json",
                "data": {}
            },
            "voId": "1303654792756731881",
            "idField": "id",
            "gid": "b098625e-f6a3-6512-2637-83448cc786d4",
            "objectState": 2,
            "hide": [
                "billId"
            ],
            "title": "OA任务管理"
        },
        {
            "type": "btns",
            "field": [
                {
                    "functionConfig": {
                        "ajaxData": {},
                        "data": {},
                        "ajaxDataVaildConfig": "{}",
                        "contentType": "application/x-www-form-urlencoded",
                        "dataFormat": "object",
                        "dataSrc": "rows",
                        "defaultMode": "viewerDialog",
                        "functionClass": "modal",
                        "suffix": "/templateMindPages/pageConfig/1313288987443463154",
                        "text": "任务详情",
                        "title": "任务详情",
                        "type": "GET",
                        "voName": "wbsWbsTasksVO",
                        "entityName": "wbsTask",
                        "chineseName": "查看任务详情",
                        "englishName": "taskDetial",
                        "isInlineBtn": false,
                        "isHaveSaveAndAdd": true,
                        "isReadonly": false,
                        "isSendPageParams": true,
                        "isMobileInlineBtn": true,
                        "isKeepSelected": false,
                        "parameterFormatType": "add",
                        "isSetValueToSourcePage": false,
                        "url": "https://qaapi.wangxingcloud.com//templateMindPages/pageConfig/1313288987443463154"
                    },
                    "btn": {
                        "text": "任务详情",
                        "isReturn": true
                    }
                }
            ],
            "gid": "af3ec485-ca56-a99d-76f2-2959249a5581",
            "objectState": 2
        }
    ],
    "draftBox": {
        "isUse": false,
        "isUseSave": true
    },
    "title": "OA任务管理",
    "pageParam": {}
}