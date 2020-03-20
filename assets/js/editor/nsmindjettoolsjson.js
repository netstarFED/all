var nscrm = {
    "system": {
        "user": {
            "id": "id",
            "name": "name"
        },
        "prefix": {
            "root": "http://10.10.1.119:8080/NPE",
            "dict": "/basDictController/getDictByTableName?tableName="
        }
    },
    "default": {
        "now": {
            "year ": "今年",
            "day": "今天"
        },
        "ajaxType": {},
        "ajaxDataSrc": {},
        "ajaxCache": {},
        "ajax": {
            "dataSrc": "rows",
            "type": "POST",
            "dataType": "json",
            "defaultData": {}
        }
    },
    "pages": {
        "customer": {},
        "contact": {},
        "chance": {},
        "touch": {}
    },
    "customer": {
        "controller": {
            "new": {
                "myCustomer": {
                    "suffix": "/crm/customer/new",
                    "接口文档": "客户/新建/录入新建",
                    "defaultMode": "dialog",
                    "functionField": {
                        "name": {},
                        "signedFlag": {},
                        "otherGoodsFlag": {},
                        "otherGoodsDes": {},
                        "industry": {},
                        "source": {},
                        "regionalLocationId": {},
                        "address": {},
                        "level": {},
                        "state": {},
                        "gdp": {},
                        "tag": {},
                        "phone": {},
                        "fax": {},
                        "website": {},
                        "zipcode": {},
                        "scale": {},
                        "bottomPrice": {},
                        "topPrice": {},
                        "parentId": {},
                        "empolyeesQuantity": {},
                        "postAddressId": {
                            "省": {},
                            "城市": {},
                            "街道": {},
                            "详细地址": {}
                        },
                        "billingAddressId": {
                            "省": {},
                            "城市": {},
                            "街道": {},
                            "详细地址": {}
                        },
                        "deliveryAddresssId": {
                            "省": {},
                            "城市": {},
                            "街道": {},
                            "详细地址": {}
                        },
                        "ownerId": {},
                        "remark": {}
                    }
                },
                "clue": {
                    "suffix": "/crm/customer/new",
                    "接口文档": "客户/新建/录入新建",
                    "defaultMode": "dialog",
                    "functionField": {
                        "name": {},
                        "parentId": {},
                        "signedFlag": {},
                        "otherGoodsFlag": {},
                        "otherGoodsDes": {},
                        "goods": {},
                        "state": {},
                        "source": {},
                        "phone": {},
                        "homephone": {},
                        "regionalLocationId": {},
                        "address": {},
                        "zipcode": {},
                        "website": {},
                        "remark": {},
                        "ownerId": {}
                    }
                },
                "import": {
                    "suffix": "/crm/customer/import",
                    "接口文档": "客户/新建/批量导入验证",
                    "defaultMode": "dialog",
                    "functionField": {
                        "url": {},
                        "Interfacetype": {}
                    }
                },
                "importConfirm": {
                    "suffix": "/crm/customer/importconfirm",
                    "接口文档": "客户/新建/批量导入确认",
                    "defaultMode": "dialog",
                    "functionField": {
                        "Interfacetype": {}
                    }
                },
                "buildingimport": {
                    "suffix": "/crm/customer/import",
                    "接口文档": "客户/新建/批量导入确认",
                    "functionField": {
                        "url": {},
                        "Interfacetype": {}
                    }
                }
            },
            "modify": {
                "modify": {
                    "suffix": "/crm/customer/modify",
                    "接口文档": "客户/修改/修改",
                    "defaultMode": "valueDialog,tablebtn"
                },
                "touchnew": {
                    "suffix": "/crm/touch/new",
                    "接口文档": "接触/新增",
                    "defaultMode": "dialog"
                },
                "changeOwnerByPublic": {
                    "suffix": "/crm/customer/changetopublic",
                    "接口文档": "客户/修改/转移为公海客户",
                    "defaultMode": "confirm"
                },
                "changeOwnerByOther": {
                    "suffix": "/crm/customer/changeownertoother",
                    "接口文档": "客户/修改/转移客户",
                    "defaultMode": "valueDialog",
                    "functionField": {
                        "ownerId": {}
                    }
                },
                "changeOwnerToOtherBymanager": {
                    "suffix": "/crm/customer/changeownertootherbymanager",
                    "接口文档": "客户/修改/转移客户",
                    "defaultMode": "valueDialog",
                    "functionField": {
                        "ownerId": {}
                    }
                },
                "changeOwnerToMyself": {
                    "suffix": "/crm/customer/changeownertomyself",
                    "接口文档": "客户/修改/转为我的客户",
                    "defaultMode": "valueDialog,tablebtn",
                    "functionField": {
                        "name": {},
                        "phone": {}
                    }
                }
            },
            "delete": {
                "delete": {
                    "suffix": "/crm/customer/delete",
                    "接口文档": "客户/修改/转移客户",
                    "defaultMode": "confirm,tablebtn"
                }
            },
            "query": {
                "basicquery": {
                    "suffix": "/crm/customer/getlist",
                    "接口文档": "查询/线索、客户、公海客户查询"
                },
                "heavyquery": {
                    "suffix": "/crm/customer/query",
                    "接口文档": "客户/查询/线索、客户、联系人排重查询",
                    "defaultMode": "dialog",
                    "select": "公海客户",
                    "functionField": {
                        "phone": {},
                        "homephone": {},
                        "name": {}
                    }
                },
                "detailedquery": {
                    "suffix": "/crm/customer/getbyid",
                    "data": {
                        "name": {}
                    },
                    "接口文档": "客户/查询/客户详细页查询"
                }
            },
            "statistics": {
                "cluestatistics": {
                    "suffix": "/crm/clueconversion/statistics",
                    "接口文档": "统计/线索转化率",
                    "functionField": {
                        "ownerId": {}
                    }
                },
                "accountstatistics": {
                    "suffix": "/crm/customer/customerstatistic",
                    "接口文档": "统计/客户量统计",
                    "functionField": {
                        "ownerId": {}
                    }
                }
            }
        },
        "state": {
            "customertopublic": {
                "field": {
                    "name": {},
                    "level": {},
                    "source": {},
                    "parentId": {},
                    "parentName": {},
                    "regionalLocationId": {},
                    "address": {},
                    "industry": {},
                    "scale": {},
                    "signedFlag": {},
                    "otherGoodsFlag": {},
                    "otherGoodsDes": {},
                    "phone": {},
                    "fax": {},
                    "website": {},
                    "zipcode": {},
                    "remark": {},
                    "accountOwnerFormerByid": {}
                }
            },
            "clue": {
                "field": {
                    "name": {},
                    "phone": {},
                    "parentId": {},
                    "parentName": {}
                },
                "field-more": {
                    "signedFlag": {},
                    "otherGoodsFlag": {},
                    "otherGoodsDes": {},
                    "state": {},
                    "source": {},
                    "homephone": {},
                    "regionalLocationId": {},
                    "address": {},
                    "zipcode": {},
                    "remark": {},
                    "website": {}
                }
            },
            "presonalCustomer": {
                "field": {
                    "name": {},
                    "ownerName": {},
                    "level": {},
                    "phone": {},
                    "remark": {},
                    "parentId": {},
                    "parentName": {}
                },
                "field-more": {
                    "signedFlag": {},
                    "otherGoodsFlag": {},
                    "otherGoodsDes": {},
                    "industry": {},
                    "goods": {},
                    "source": {},
                    "regionalLocationId": {},
                    "address": {},
                    "state": {},
                    "gdp": {},
                    "tag": {},
                    "fax": {},
                    "website": {},
                    "zipcode": {},
                    "scale": {},
                    "empolyeesQuantity": {},
                    "ownerId": {},
                    "budget": {}
                }
            },
            "importCustomer": {
                "field": {
                    "phone": {},
                    "homephone": {},
                    "website": {},
                    "fax": {},
                    "zipcode": {}
                }
            },
            "importHighSeasCustomer": {
                "field": {
                    "phone": {},
                    "homephone": {},
                    "website": {},
                    "fax": {},
                    "zipcode": {},
                    "address": {}
                }
            },
            "heavyqueryCustomer": {
                "field": {
                    "phone": {},
                    "homephone": {},
                    "website": {},
                    "fax": {},
                    "zipcode": {},
                    "address": {}
                }
            }
        },
        "fields": {
            "id": {
                "id": "id",
                "type": "hidden",
                "des": "客户ID,自动生成",
                "mindjetType": "hidden",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 18,
                "label": "id"
            },
            "goods": {
                "id": "goods",
                "rules": "required",
                "type": "select2",
                "value": "产品ID",
                "multiple": true,
                "mindjetType": "dict",
                "mindjetClass": "fieldBusiness",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_PRODUCTS",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 33,
                "label": "产品"
            },
            "whenCreated": {
                "id": "whenCreated",
                "type": "datetime",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 65,
                "label": "创建时间"
            },
            "whenSystem": {
                "id": "whenSystem",
                "type": "datetime",
                "des": "数据进入系统的服务器时间",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 44,
                "label": "进入系统时间"
            },
            "whenOwnerModified": {
                "id": "whenOwnerModified",
                "type": "datetime",
                "des": " 未发生过转移操作之前,此时间为新增客户的操作时间",
                "subdata": [
                    {
                        "value": 0,
                        "text": "转入公海"
                    },
                    {
                        "value": 1,
                        "text": "转出公海到自己"
                    },
                    {
                        "value": 2,
                        "text": "转出线索到自己"
                    },
                    {
                        "value": 3,
                        "text": "转移客户所属人"
                    }
                ],
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 47,
                "label": "当前所属人修改时间"
            },
            "lastModifiedtime": {
                "id": "lastModifiedtime",
                "type": "datetime",
                "des": " \n最近的一次修改客户资料的时间。\n新增客户时,最近修改时间等于新增客户的操作时间。\n添加联系人算修改,机会、合同、接触不算修改。\n欢迎页和部分统计会经常使用此时间 。",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 55,
                "label": "最近修改时间"
            },
            "touchTime": {
                "id": "touchTime",
                "type": "datetime",
                "des": " 客户的接触,及客户下属的机会、合同所涉及到的或者跟进的时间都会更新此数据\n欢迎页和部分统计会使用此时间",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 58,
                "label": "最近接触时间"
            },
            "contractTime": {
                "id": "contractTime",
                "type": "datetime",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 61,
                "label": "最近合同时间"
            },
            "opportunityTime": {
                "id": "opportunityTime",
                "type": "datetime",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 63,
                "label": "最近机会时间"
            },
            "deletetime": {
                "id": "deletetime",
                "type": "datetime",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 67,
                "label": "删除时间"
            },
            "whenStateCreated": {
                "id": "whenStateCreated",
                "type": "datetime",
                "des": "\n记录客户、线索每个状态创建的时间。多个",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 69,
                "label": "状态创建时间"
            },
            "regionalOwnerById": {
                "id": "regionalOwnerById",
                "type": "hidden",
                "mindjetType": "hidden",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 73,
                "label": "负责人区域"
            },
            "ownerId": {
                "id": "ownerId",
                "type": "select2",
                "value": " 登录人ID",
                "suffix": "/netStarRights/basUserController-getAllUser",
                "res": " 销售小组模式、客户打开可选管理人功能、当前登录人拥有可选管理人权限的情况下,这里是个select2下拉框,数据源是组织机构",
                "mindjetType": "select2",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 75,
                "label": "负责人"
            },
            "name": {
                "id": "name",
                "rules": "required",
                "type": "text",
                "width": "100",
                "mindjetType": "text",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 88,
                "label": "客户名称"
            },
            "type": {
                "id": "type",
                "type": "select",
                "subdata": [
                    {
                        "value": 0,
                        "text": "个人客户"
                    },
                    {
                        "value": 1,
                        "text": "线索"
                    },
                    {
                        "value": 2,
                        "text": "公海客户"
                    }
                ],
                "mindjetType": "select",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 83,
                "label": "数据类别"
            },
            "signedFlag": {
                "id": "signedFlag",
                "type": "radio",
                "subdata": [
                    {
                        "value": 0,
                        "text": "是"
                    },
                    {
                        "value": 1,
                        "text": "否"
                    }
                ],
                "des": "是否老客户,如果合同签了,则自动转为老客户",
                "mindjetType": "radio",
                "mindjetClass": "fieldControl",
                "value": 0,
                "mindjetIndex": 92,
                "label": "已签单"
            },
            "otherGoodsFlag": {
                "id": "otherGoodsFlag",
                "type": "radio",
                "subdata": [
                    {
                        "value": 0,
                        "text": "是"
                    },
                    {
                        "value": 1,
                        "text": "否"
                    }
                ],
                "des": "是否已经使用类似的商品,如果有则填写类似商品",
                "mindjetType": "radio",
                "mindjetClass": "fieldControl",
                "value": 0,
                "mindjetIndex": 97,
                "label": "使用竞品"
            },
            "otherGoodsDes": {
                "id": "otherGoodsDes",
                "type": "textarea",
                "mindjetType": "textarea",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 102,
                "label": "竞品描述"
            },
            "industry": {
                "id": "industry",
                "type": "select",
                "mindjetType": "dict",
                "mindjetClass": "fieldControl",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_INDUSTRY",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 104,
                "label": "行业"
            },
            "source": {
                "id": "source",
                "type": "select",
                "mindjetType": "dict",
                "mindjetClass": "fieldControl",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_SOURCE",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 106,
                "label": "信息来源"
            },
            "regionalLocationId": {
                "id": "regionalLocationId",
                "rules": "required",
                "value": "当前登录人区域属性",
                "type": "province_select",
                "mindjetType": "省市区",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 108,
                "label": "区域位置"
            },
            "address": {
                "id": "address",
                "type": "textarea",
                "mindjetType": "textarea",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 112,
                "label": "详细地址"
            },
            "level": {
                "id": "level",
                "value": "1",
                "type": "select",
                "des": "后期可能调整为单独维护,以添加相关功能",
                "mindjetType": "dict",
                "mindjetClass": "fieldControl",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_RATING",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 114,
                "label": "分级"
            },
            "state": {
                "id": "state",
                "value": "1",
                "type": "select",
                "mindjetType": "dict",
                "mindjetClass": "fieldControl",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_CLUESTATE",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 121,
                "label": "状态"
            },
            "createdWayId": {
                "id": "createdWayId",
                "type": "hidden",
                "des": "记录数据创建的来源",
                "subdata": [
                    {
                        "value": 0,
                        "text": "公海:1"
                    },
                    {
                        "value": 1,
                        "text": "线索:2"
                    },
                    {
                        "value": 2,
                        "text": "客户:3"
                    },
                    {
                        "value": 3,
                        "text": "其他:4"
                    }
                ],
                "mindjetType": "hidden",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 124,
                "label": "新建来源"
            },
            "transferdirection": {
                "id": "transferdirection",
                "type": "hidden",
                "des": "记录数据转化方向",
                "subdata": [
                    {
                        "value": 0,
                        "text": "公海:1"
                    },
                    {
                        "value": 1,
                        "text": "客户:2"
                    },
                    {
                        "value": 2,
                        "text": "线索:3"
                    }
                ],
                "mindjetType": "hidden",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 131,
                "label": "转移方向"
            },
            "accountOwnerFormerByid": {
                "id": "accountOwnerFormerByid",
                "type": "hidden",
                "des": "记录客户原所属人",
                "value": "客户前负责人id",
                "mindjetType": "hidden",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 137,
                "label": "客户前负责人"
            },
            "ownerName": {
                "id": "ownerName",
                "type": "hidden",
                "mindjetType": "hidden",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 141,
                "label": "负责人姓名"
            },
            "lastOwnerName": {
                "id": "lastOwnerName",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 143,
                "label": "客户前负责人姓名"
            },
            "gdp": {
                "id": "gdp",
                "rules": "number",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 145,
                "label": "年收入"
            },
            "createdBy": {
                "id": "createdBy",
                "rules": "hidden",
                "type": "text",
                "value": "创建人id",
                "mindjetType": "text",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 148,
                "label": "创建人"
            },
            "deleteById": {
                "id": "deleteById",
                "rules": "hidden",
                "type": "text",
                "value": "删除人id",
                "mindjetType": "text",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 152,
                "label": "删除人"
            },
            "budget": {
                "id": "budget",
                "rules": "number",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 159,
                "label": "预算"
            },
            "tag": {
                "id": "tag",
                "des": "可以多选",
                "mindjetType": "",
                "mindjetClass": "fieldControl",
                "type": "text",
                "mindjetIndex": 162,
                "label": "标签"
            },
            "remark": {
                "id": "remark",
                "type": "textarea",
                "mindjetType": "文本域",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 165,
                "label": "备注"
            },
            "phone": {
                "id": "phone",
                "des": "****-*******,“-”前最多4位数字,“-”后最多8位数字,且固定电话也可以不输“-”前区号,直接输入号码。",
                "type": "text",
                "rules": "number",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 167,
                "label": "电话"
            },
            "homephone": {
                "id": "homephone",
                "type": "text",
                "rules": "number",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 171,
                "label": "座机"
            },
            "fax": {
                "id": "fax",
                "rules": "maxlength=11",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 174,
                "label": "传真"
            },
            "website": {
                "id": "website",
                "rules": "url",
                "mindjetType": "",
                "mindjetClass": "fieldVisual",
                "type": "text",
                "mindjetIndex": 177,
                "label": "网址"
            },
            "zipcode": {
                "id": "zipcode",
                "rules": "postalcode",
                "mindjetType": "",
                "mindjetClass": "fieldVisual",
                "type": "text",
                "mindjetIndex": 179,
                "label": "邮编"
            },
            "scale": {
                "id": "scale",
                "type": "select",
                "mindjetType": "dict",
                "mindjetClass": "fieldVisual",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_SCALE",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 181,
                "label": "规模"
            },
            "bottomPrice": {
                "id": "bottomPrice",
                "type": "text",
                "des": "承受价格范围的最低价",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 183,
                "label": "承受价格范围开始"
            },
            "topPrice": {
                "id": "topPrice",
                "type": "text",
                "des": "承受价格范围的最高价",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 186,
                "label": "承受价格范围结束"
            },
            "parentId": {
                "id": "parentId",
                "type": "select2",
                "suffix": "/crm/customer/getlist",
                "dataSrc": "rows",
                "textField": "name",
                "valueField": "id",
                "des": "会影响多张统计表,暂不实现",
                "mindjetType": "select2",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 189,
                "label": "母公司"
            },
            "parentName": {
                "id": "parentName",
                "type": "hidden",
                "mindjetType": "hidden",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 196,
                "label": "母公司名称"
            },
            "empolyeesQuantity": {
                "id": "empolyeesQuantity",
                "rules": "number",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 198,
                "label": "员工数量"
            },
            "postAddress": {
                "id": "postAddress",
                "type": "textarea",
                "mindjetType": "textarea",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 201,
                "label": "邮寄详细地址"
            },
            "postAddressId": {
                "id": "postAddressId",
                "type": "province_select",
                "mindjetType": "省市区",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 203,
                "label": "邮寄地址"
            },
            "billingAddress": {
                "id": "billingAddress",
                "type": "textarea",
                "mindjetType": "textarea",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 205,
                "label": "开票详细地址"
            },
            "billingAddressId": {
                "id": "billingAddressId",
                "type": "province_select",
                "mindjetType": "省市区",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 207,
                "label": "开票地址"
            },
            "deliveryAddress": {
                "id": "deliveryAddress",
                "type": "textarea",
                "mindjetType": "textarea",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 209,
                "label": "发货详细地址"
            },
            "deliveryAddresssId": {
                "id": "deliveryAddresssId",
                "type": "province_select",
                "mindjetType": "省市区",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 211,
                "label": "发货地址"
            },
            "otherAddress": {
                "id": "otherAddress",
                "type": "textarea",
                "mindjetType": "textarea",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 213,
                "label": "其它详细地址"
            },
            "otherAddressId": {
                "id": "otherAddressId",
                "type": "province_select",
                "mindjetType": "省市区",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 215,
                "label": "其他地址"
            }
        },
        "columns": {
            "id": {
                "field": "id",
                "title": "id",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 18,
                "mindjetType": "hidden",
                "width": 100
            },
            "goods": {
                "field": "goods",
                "title": "产品",
                "inputType": "select2",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 33,
                "mindjetType": "dict",
                "width": 100
            },
            "whenCreated": {
                "field": "whenCreated",
                "title": "创建时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 65,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "whenSystem": {
                "field": "whenSystem",
                "title": "进入系统时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 44,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "whenOwnerModified": {
                "field": "whenOwnerModified",
                "title": "当前所属人修改时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 47,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "lastModifiedtime": {
                "field": "lastModifiedtime",
                "title": "最近修改时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 55,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "touchTime": {
                "field": "touchTime",
                "title": "最近接触时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 58,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "contractTime": {
                "field": "contractTime",
                "title": "最近合同时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 61,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "opportunityTime": {
                "field": "opportunityTime",
                "title": "最近机会时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 63,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "deletetime": {
                "field": "deletetime",
                "title": "删除时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 67,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "whenStateCreated": {
                "field": "whenStateCreated",
                "title": "状态创建时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 69,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "regionalOwnerById": {
                "field": "regionalOwnerById",
                "title": "负责人区域",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 73,
                "mindjetType": "hidden",
                "width": 100
            },
            "ownerId": {
                "field": "ownerId",
                "title": "负责人",
                "inputType": "select2",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 75,
                "mindjetType": "select2",
                "width": 100
            },
            "name": {
                "field": "name",
                "title": "客户名称",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 88,
                "mindjetType": "text",
                "width": 100
            },
            "type": {
                "field": "type",
                "title": "数据类别",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 83,
                "mindjetType": "select",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "个人客户",
                            "1": "线索",
                            "2": "公海客户"
                        }
                    }
                }
            },
            "signedFlag": {
                "field": "signedFlag",
                "title": "已签单",
                "inputType": "radio",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 92,
                "mindjetType": "radio",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "是",
                            "1": "否"
                        }
                    }
                }
            },
            "otherGoodsFlag": {
                "field": "otherGoodsFlag",
                "title": "使用竞品",
                "inputType": "radio",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 97,
                "mindjetType": "radio",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "是",
                            "1": "否"
                        }
                    }
                }
            },
            "otherGoodsDes": {
                "field": "otherGoodsDes",
                "title": "竞品描述",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 102,
                "mindjetType": "textarea",
                "width": 100
            },
            "industry": {
                "field": "industry",
                "title": "行业",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 104,
                "mindjetType": "dict",
                "width": 100
            },
            "source": {
                "field": "source",
                "title": "信息来源",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 106,
                "mindjetType": "dict",
                "width": 100
            },
            "regionalLocationId": {
                "field": "regionalLocationId",
                "title": "区域位置",
                "inputType": "province_select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 108,
                "mindjetType": "省市区",
                "width": 100
            },
            "address": {
                "field": "address",
                "title": "详细地址",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 112,
                "mindjetType": "textarea",
                "width": 100
            },
            "level": {
                "field": "level",
                "title": "分级",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 114,
                "mindjetType": "dict",
                "width": 100
            },
            "state": {
                "field": "state",
                "title": "状态",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 121,
                "mindjetType": "dict",
                "width": 100
            },
            "createdWayId": {
                "field": "createdWayId",
                "title": "新建来源",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 124,
                "mindjetType": "hidden",
                "width": 100
            },
            "transferdirection": {
                "field": "transferdirection",
                "title": "转移方向",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 131,
                "mindjetType": "hidden",
                "width": 100
            },
            "accountOwnerFormerByid": {
                "field": "accountOwnerFormerByid",
                "title": "客户前负责人",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 137,
                "mindjetType": "hidden",
                "width": 100
            },
            "ownerName": {
                "field": "ownerName",
                "title": "负责人姓名",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 141,
                "mindjetType": "hidden",
                "width": 100
            },
            "lastOwnerName": {
                "field": "lastOwnerName",
                "title": "客户前负责人姓名",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 143,
                "mindjetType": "text",
                "width": 100
            },
            "gdp": {
                "field": "gdp",
                "title": "年收入",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 145,
                "mindjetType": "text",
                "width": 100
            },
            "createdBy": {
                "field": "createdBy",
                "title": "创建人",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 148,
                "mindjetType": "text",
                "width": 100
            },
            "deleteById": {
                "field": "deleteById",
                "title": "删除人",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 152,
                "mindjetType": "text",
                "width": 100
            },
            "budget": {
                "field": "budget",
                "title": "预算",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 159,
                "mindjetType": "text",
                "width": 100
            },
            "tag": {
                "field": "tag",
                "title": "标签",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 162,
                "mindjetType": "",
                "width": 100
            },
            "remark": {
                "field": "remark",
                "title": "备注",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 165,
                "mindjetType": "文本域",
                "width": 100
            },
            "phone": {
                "field": "phone",
                "title": "电话",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 167,
                "mindjetType": "text",
                "width": 100
            },
            "homephone": {
                "field": "homephone",
                "title": "座机",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 171,
                "mindjetType": "text",
                "width": 100
            },
            "fax": {
                "field": "fax",
                "title": "传真",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 174,
                "mindjetType": "text",
                "width": 100
            },
            "website": {
                "field": "website",
                "title": "网址",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 177,
                "mindjetType": "",
                "width": 100
            },
            "zipcode": {
                "field": "zipcode",
                "title": "邮编",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 179,
                "mindjetType": "",
                "width": 100
            },
            "scale": {
                "field": "scale",
                "title": "规模",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 181,
                "mindjetType": "dict",
                "width": 100
            },
            "bottomPrice": {
                "field": "bottomPrice",
                "title": "承受价格范围开始",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 183,
                "mindjetType": "text",
                "width": 100
            },
            "topPrice": {
                "field": "topPrice",
                "title": "承受价格范围结束",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 186,
                "mindjetType": "text",
                "width": 100
            },
            "parentId": {
                "field": "parentId",
                "title": "母公司",
                "inputType": "select2",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 189,
                "mindjetType": "select2",
                "width": 100
            },
            "parentName": {
                "field": "parentName",
                "title": "母公司名称",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 196,
                "mindjetType": "hidden",
                "width": 100
            },
            "empolyeesQuantity": {
                "field": "empolyeesQuantity",
                "title": "员工数量",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 198,
                "mindjetType": "text",
                "width": 100
            },
            "postAddress": {
                "field": "postAddress",
                "title": "邮寄详细地址",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 201,
                "mindjetType": "textarea",
                "width": 100
            },
            "postAddressId": {
                "field": "postAddressId",
                "title": "邮寄地址",
                "inputType": "province_select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 203,
                "mindjetType": "省市区",
                "width": 100
            },
            "billingAddress": {
                "field": "billingAddress",
                "title": "开票详细地址",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 205,
                "mindjetType": "textarea",
                "width": 100
            },
            "billingAddressId": {
                "field": "billingAddressId",
                "title": "开票地址",
                "inputType": "province_select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 207,
                "mindjetType": "省市区",
                "width": 100
            },
            "deliveryAddress": {
                "field": "deliveryAddress",
                "title": "发货详细地址",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 209,
                "mindjetType": "textarea",
                "width": 100
            },
            "deliveryAddresssId": {
                "field": "deliveryAddresssId",
                "title": "发货地址",
                "inputType": "province_select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 211,
                "mindjetType": "省市区",
                "width": 100
            },
            "otherAddress": {
                "field": "otherAddress",
                "title": "其它详细地址",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 213,
                "mindjetType": "textarea",
                "width": 100
            },
            "otherAddressId": {
                "field": "otherAddressId",
                "title": "其他地址",
                "inputType": "province_select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 215,
                "mindjetType": "省市区",
                "width": 100
            }
        }
    },
    "contact": {
        "controller": {
            "new": {
                "new": {
                    "suffix": "/crm/contact/new",
                    "接口文档": "联系人/新增/录入新增",
                    "defaultMode": "dialog"
                },
                "import": {
                    "suffix": "/crm/contact/import",
                    "接口文档": "联系人/新增/导入验证",
                    "defaultMode": "dialog"
                },
                "importConfirm": {
                    "suffix": "/crm/contact/importConfirm",
                    "接口文档": "联系人/新增/导入确认",
                    "defaultMode": "dialog"
                }
            },
            "modify": {
                "modify": {
                    "suffix": "/crm/contact/modify",
                    "接口文档": "联系人/修改",
                    "defaultMode": "valueDialog,tablebtn"
                }
            },
            "delete": {
                "delete": {
                    "suffix": "/crm/contact/delete",
                    "接口文档": "联系人/删除",
                    "defaultMode": "confirm,tablebtn"
                }
            },
            "statistics": {
                "statistics": {
                    "suffix": "--"
                }
            },
            "query": {
                "basicquery": {
                    "suffix": "/crm/contact/getlist",
                    "接口文档": "查询/联系人查询"
                },
                "detailedquery": {
                    "suffix": "/crm/contact/getbyid",
                    "接口文档": "查询/联系人详细页查询"
                },
                "heavyquery": {
                    "suffix": "/crm/contact/getlist",
                    "接口文档": "客户/查询/线索、客户、联系人排重查询",
                    "defaultMode": "dialog",
                    "select": "个人客户",
                    "functionField": {
                        "qq": {},
                        "homephone": {},
                        "appellation": {}
                    }
                }
            }
        },
        "state": {
            "onOffice": {
                "filed": {
                    "name": {},
                    "title": {},
                    "phone": {},
                    "homephone": {},
                    "remark": {}
                },
                "field-more": {
                    "sex": {},
                    "address": {},
                    "birthday": {},
                    "isremind": {},
                    "ondutyFlag": {},
                    "whenLeave": {},
                    "mailbox": {},
                    "pictureAttachId": {},
                    "qq": {},
                    "weixin": {},
                    "department": {},
                    "appellation": {},
                    "leader": {},
                    "hobby": {},
                    "habit": {},
                    "social": {},
                    "spouse": {},
                    "children": {},
                    "consumption": {},
                    "ownerId": {}
                }
            },
            "improtContact": {
                "field": {
                    "weixin": {},
                    "qq": {},
                    "title": {},
                    "department": {},
                    "sex": {}
                }
            },
            "contact": {
                "field": {
                    "customerId": {},
                    "customerName": {},
                    "name": {},
                    "id": {},
                    "title": {},
                    "phone": {},
                    "homephone": {},
                    "remark": {},
                    "ownerName": {}
                },
                "field-more": {
                    "sex": {},
                    "address": {},
                    "birthday": {},
                    "isremind": {},
                    "ondutyFlag": {},
                    "whenLeave": {},
                    "mailbox": {},
                    "qq": {},
                    "weixin": {},
                    "department": {},
                    "appellation": {},
                    "leader": {},
                    "hobby": {},
                    "habit": {},
                    "social": {},
                    "spouse": {},
                    "children": {},
                    "consumption": {},
                    "ownerId": {}
                }
            }
        },
        "fields": {
            "id": {
                "id": "id",
                "des": "自动生成",
                "type": "hidden",
                "value": "联系人ID",
                "mindjetType": "hidden",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 463,
                "label": "id"
            },
            "customerId": {
                "id": "customerId",
                "type": "select2",
                "suffix": "/crm/customer/getlist",
                "dataSrc": "rows",
                "textField": "name",
                "valueField": "id",
                "des": "会影响多张统计表,暂不实现",
                "mindjetType": "select2",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 566,
                "label": "客户id"
            },
            "whenCreated": {
                "id": "whenCreated",
                "type": "datetime",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 475,
                "label": "创建时间"
            },
            "lastModifiedtime": {
                "id": "lastModifiedtime",
                "type": "datetime",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 477,
                "label": "最近修改时间"
            },
            "touchTime": {
                "id": "touchTime",
                "type": "datetime",
                "des": " 联系人的接触",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 479,
                "label": "最近接触时间"
            },
            "deletetime": {
                "id": "deletetime",
                "type": "datetime",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 482,
                "label": "删除时间"
            },
            "name": {
                "id": "name",
                "rules": "required",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 485,
                "label": "姓名"
            },
            "phone": {
                "id": "phone",
                "rules": "number required",
                "type": "text",
                "des": "Telephone,必填",
                "mindjetType": "text",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 488,
                "label": "电话"
            },
            "value": {
                "id": "value",
                "type": "select",
                "mindjetType": "dict",
                "mindjetClass": "fieldControl",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_TYPE",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 492,
                "label": "联系人类别"
            },
            "address": {
                "id": "address",
                "type": "textarea",
                "mindjetType": "textarea",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 496,
                "label": "详细地址"
            },
            "birthday": {
                "id": "birthday",
                "type": "date",
                "mindjetType": "date",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 498,
                "label": "生日"
            },
            "isremind": {
                "id": "isremind",
                "type": "radio",
                "subdata": [
                    {
                        "value": 0,
                        "text": "是"
                    },
                    {
                        "value": 1,
                        "text": "否"
                    }
                ],
                "des": "若是选择是,将数据展示在首页的日历框中；",
                "value": 0,
                "mindjetType": "radio",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 500,
                "label": "是否提醒"
            },
            "ondutyFlag": {
                "id": "ondutyFlag",
                "type": "radio",
                "subdata": [
                    {
                        "value": 0,
                        "text": "是"
                    },
                    {
                        "value": 1,
                        "text": "否"
                    }
                ],
                "mindjetType": "radio",
                "mindjetClass": "fieldControl",
                "value": 0,
                "mindjetIndex": 506,
                "label": "是否在职"
            },
            "whenLeave": {
                "id": "whenLeave",
                "type": "date",
                "des": " 设置是否在职为否时,可填写",
                "mindjetType": "date",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 510,
                "label": "离职日期"
            },
            "ownerId": {
                "id": "ownerId",
                "type": "select2",
                "value": " 登录人ID",
                "suffix": "/netStarRights/basUserController-getAllUser",
                "res": " 销售小组模式、客户打开可选管理人功能、当前登录人拥有可选管理人权限的情况下,这里是个select2下拉框,数据源是组织机构",
                "mindjetType": "select2",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 513,
                "label": "负责人"
            },
            "ownerName": {
                "id": "ownerName",
                "type": "hidden",
                "mindjetType": "hidden",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 518,
                "label": "负责人姓名"
            },
            "createdBy": {
                "id": "createdBy",
                "type": "text",
                "value": "登录人ID",
                "mindjetType": "text",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 520,
                "label": "创建人"
            },
            "lastOwner": {
                "id": "lastOwner",
                "type": "text",
                "value": "转移客户前的负责人",
                "mindjetType": "text",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 523,
                "label": "前负责人"
            },
            "qq": {
                "id": "qq",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 527,
                "label": "qq"
            },
            "weixin": {
                "id": "weixin",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 529,
                "label": "微信"
            },
            "title": {
                "id": "title",
                "type": "select",
                "mindjetType": "dict",
                "mindjetClass": "fieldVisual",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_JOB",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 531,
                "label": "职务"
            },
            "department": {
                "id": "department",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 533,
                "label": "部门"
            },
            "sex": {
                "id": "sex",
                "type": "radio",
                "subdata": [
                    {
                        "value": 0,
                        "text": "男"
                    },
                    {
                        "value": 1,
                        "text": "女"
                    }
                ],
                "mindjetType": "radio",
                "mindjetClass": "fieldVisual",
                "value": 0,
                "mindjetIndex": 535,
                "label": "性别"
            },
            "appellation": {
                "id": "appellation",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 539,
                "label": "称谓"
            },
            "leader": {
                "id": "leader",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 541,
                "label": "上级"
            },
            "homephone": {
                "id": "homephone",
                "rules": "number",
                "mindjetType": "",
                "mindjetClass": "fieldVisual",
                "type": "text",
                "mindjetIndex": 543,
                "label": "座机"
            },
            "hobby": {
                "id": "hobby",
                "type": "textarea",
                "mindjetType": "文本域",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 545,
                "label": "兴趣爱好"
            },
            "habit": {
                "id": "habit",
                "type": "textarea",
                "mindjetType": "文本域",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 547,
                "label": "习惯"
            },
            "disposition": {
                "id": "disposition",
                "type": "textarea",
                "mindjetType": "文本域",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 549,
                "label": "性格"
            },
            "social": {
                "id": "social",
                "type": "textarea",
                "mindjetType": "文本域",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 551,
                "label": "社交特点"
            },
            "spouse": {
                "id": "spouse",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 553,
                "label": "配偶"
            },
            "children": {
                "id": "children",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 555,
                "label": "子女"
            },
            "consumption": {
                "id": "consumption",
                "type": "textarea",
                "mindjetType": "文本域",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 557,
                "label": "消费习惯"
            },
            "pictureAttachId": {
                "id": "pictureAttachId",
                "des": "图片\n（BMP、fpx、eps、pcx、svg、al、wmf、lic、emc、tiff、\npsd、png、gif、cdr、hdri、jpeg、pcd、raw、tga、dxf、\nraw、exif、ufo）",
                "mindjetType": "",
                "mindjetClass": "fieldVisual",
                "type": "text",
                "mindjetIndex": 559,
                "label": "照片"
            },
            "mailbox": {
                "id": "mailbox",
                "des": "mail",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 561,
                "label": "邮箱"
            },
            "remark": {
                "id": "remark",
                "type": "textarea",
                "mindjetType": "textarea",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 564,
                "label": "备注"
            },
            "customerName": {
                "id": "customerName",
                "type": "hidden",
                "mindjetType": "hidden",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 573,
                "label": "对应客户名称"
            }
        },
        "columns": {
            "id": {
                "field": "id",
                "title": "id",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 463,
                "mindjetType": "hidden",
                "width": 100
            },
            "customerId": {
                "field": "customerId",
                "title": "客户id",
                "inputType": "select2",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 566,
                "mindjetType": "select2",
                "width": 100
            },
            "whenCreated": {
                "field": "whenCreated",
                "title": "创建时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 475,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "lastModifiedtime": {
                "field": "lastModifiedtime",
                "title": "最近修改时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 477,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "touchTime": {
                "field": "touchTime",
                "title": "最近接触时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 479,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "deletetime": {
                "field": "deletetime",
                "title": "删除时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 482,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "name": {
                "field": "name",
                "title": "姓名",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 485,
                "mindjetType": "text",
                "width": 100
            },
            "phone": {
                "field": "phone",
                "title": "电话",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 488,
                "mindjetType": "text",
                "width": 100
            },
            "value": {
                "field": "value",
                "title": "联系人类别",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 492,
                "mindjetType": "dict",
                "width": 100
            },
            "address": {
                "field": "address",
                "title": "详细地址",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 496,
                "mindjetType": "textarea",
                "width": 100
            },
            "birthday": {
                "field": "birthday",
                "title": "生日",
                "inputType": "date",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 498,
                "mindjetType": "date",
                "width": 86,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD"
                    }
                }
            },
            "isremind": {
                "field": "isremind",
                "title": "是否提醒",
                "inputType": "radio",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 500,
                "mindjetType": "radio",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "是",
                            "1": "否"
                        }
                    }
                }
            },
            "ondutyFlag": {
                "field": "ondutyFlag",
                "title": "是否在职",
                "inputType": "radio",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 506,
                "mindjetType": "radio",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "是",
                            "1": "否"
                        }
                    }
                }
            },
            "whenLeave": {
                "field": "whenLeave",
                "title": "离职日期",
                "inputType": "date",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 510,
                "mindjetType": "date",
                "width": 86,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD"
                    }
                }
            },
            "ownerId": {
                "field": "ownerId",
                "title": "负责人",
                "inputType": "select2",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 513,
                "mindjetType": "select2",
                "width": 100
            },
            "ownerName": {
                "field": "ownerName",
                "title": "负责人姓名",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 518,
                "mindjetType": "hidden",
                "width": 100
            },
            "createdBy": {
                "field": "createdBy",
                "title": "创建人",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 520,
                "mindjetType": "text",
                "width": 100
            },
            "lastOwner": {
                "field": "lastOwner",
                "title": "前负责人",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 523,
                "mindjetType": "text",
                "width": 100
            },
            "qq": {
                "field": "qq",
                "title": "qq",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 527,
                "mindjetType": "text",
                "width": 100
            },
            "weixin": {
                "field": "weixin",
                "title": "微信",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 529,
                "mindjetType": "text",
                "width": 100
            },
            "title": {
                "field": "title",
                "title": "职务",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 531,
                "mindjetType": "dict",
                "width": 100
            },
            "department": {
                "field": "department",
                "title": "部门",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 533,
                "mindjetType": "text",
                "width": 100
            },
            "sex": {
                "field": "sex",
                "title": "性别",
                "inputType": "radio",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 535,
                "mindjetType": "radio",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "男",
                            "1": "女"
                        }
                    }
                }
            },
            "appellation": {
                "field": "appellation",
                "title": "称谓",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 539,
                "mindjetType": "text",
                "width": 100
            },
            "leader": {
                "field": "leader",
                "title": "上级",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 541,
                "mindjetType": "text",
                "width": 100
            },
            "homephone": {
                "field": "homephone",
                "title": "座机",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 543,
                "mindjetType": "",
                "width": 100
            },
            "hobby": {
                "field": "hobby",
                "title": "兴趣爱好",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 545,
                "mindjetType": "文本域",
                "width": 100
            },
            "habit": {
                "field": "habit",
                "title": "习惯",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 547,
                "mindjetType": "文本域",
                "width": 100
            },
            "disposition": {
                "field": "disposition",
                "title": "性格",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 549,
                "mindjetType": "文本域",
                "width": 100
            },
            "social": {
                "field": "social",
                "title": "社交特点",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 551,
                "mindjetType": "文本域",
                "width": 100
            },
            "spouse": {
                "field": "spouse",
                "title": "配偶",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 553,
                "mindjetType": "text",
                "width": 100
            },
            "children": {
                "field": "children",
                "title": "子女",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 555,
                "mindjetType": "text",
                "width": 100
            },
            "consumption": {
                "field": "consumption",
                "title": "消费习惯",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 557,
                "mindjetType": "文本域",
                "width": 100
            },
            "pictureAttachId": {
                "field": "pictureAttachId",
                "title": "照片",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 559,
                "mindjetType": "",
                "width": 100
            },
            "mailbox": {
                "field": "mailbox",
                "title": "邮箱",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 561,
                "mindjetType": "text",
                "width": 100
            },
            "remark": {
                "field": "remark",
                "title": "备注",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 564,
                "mindjetType": "textarea",
                "width": 100
            },
            "customerName": {
                "field": "customerName",
                "title": "对应客户名称",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 573,
                "mindjetType": "hidden",
                "width": 100
            }
        }
    },
    "chance": {
        "controller": {
            "new": {
                "new": {
                    "suffix": "/crm/opportunity/new",
                    "接口文档": "机会/新增/录入新增"
                }
            },
            "modify": {
                "modify": {
                    "suffix": "/crm/opportunity/modify",
                    "接口文档": "机会/修改/修改"
                },
                "touchnew": {
                    "suffix": "/crm/touch/new",
                    "接口文档": "接触/新增"
                },
                "changeOwnerByOther": {
                    "suffix": "/crm/opportunity/changetoother",
                    "接口文档": "机会/修改/转移给他人"
                },
                "changeOwnerToOtherBymanager": {
                    "suffix": "/crm/opportunity/changetoother",
                    "接口文档": "机会/修改/转移给他人"
                },
                "changeContract": {
                    "suffix": "/crm/opportunity/changeopportunitytocontract",
                    "接口文档": "机会/修改/转移为合同"
                },
                "changeState": {
                    "suffix": "/crm/opportunity/changestage",
                    "接口文档": "机会/修改/更改机会状态"
                }
            },
            "delete": {
                "delete": {
                    "suffix": "/crm/opportunity/delete",
                    "接口文档": "机会/删除"
                }
            },
            "query": {
                "basicquery": {
                    "suffix": "/crm/opportunity/getlist",
                    "接口文档": "查询/机会查询"
                },
                "heavyquery": {
                    "suffix": "/crm/opportunity/query",
                    "接口文档": "机会查重"
                },
                "detailedquery": {
                    "suffix": "/crm/opportunity/getbyid",
                    "data": {
                        "name": {}
                    },
                    "接口文档": "查询/机会户详细页查询"
                }
            },
            "statistics": {
                "signedStatisticsTable": {
                    "suffix": "/crm/opportunity/opportunitytocontractstatistic",
                    "接口文档": "机会/统计/赢单机会汇总表"
                },
                "predictSaleTable": {
                    "suffix": "/crm/opportunity/forecastopportunitytocontractstatistic",
                    "接口文档": "机会/统计/销售预测报表"
                },
                "stateStatistics": {
                    "suffix": "/crm/opportunity/opportunitystatistic",
                    "接口文档": "机会/统计/机会量统计报表"
                }
            }
        },
        "state": {
            "firstTouch": {},
            "confirmNeed": {},
            "projectAndOffer": {},
            "negotiationReview": {},
            "customerSigned": {},
            "projectFaure": {},
            "chance": {
                "field": {
                    "customerId": {},
                    "customerName": {},
                    "name": {},
                    "predictSaleAmounts": {},
                    "whenPredictSigned": {},
                    "stage": {},
                    "signedPossibility": {},
                    "remark": {}
                }
            }
        },
        "fields": {
            "chance": {
                "id": "chance",
                "rules": "required",
                "vale": "机会ID",
                "mindjetType": "",
                "mindjetClass": "fieldBusiness",
                "type": "text",
                "mindjetIndex": 688,
                "label": "机会"
            },
            "contract": {
                "id": "contract",
                "rules": "创建合同,关联机会时,自动生成",
                "type": "hidden",
                "value": "合同ID",
                "mindjetType": "hidden",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 691,
                "label": "合同"
            },
            "customerId": {
                "id": "customerId",
                "rules": "required",
                "type": "select",
                "suffix": "/crm/customer/getlist",
                "dataSrc": "rows",
                "method": "GET",
                "textField": "name",
                "valueField": "id",
                "value": "客户名称ID",
                "mindjetType": "select",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 695,
                "label": "对应客户"
            },
            "customerName": {
                "id": "customerName",
                "type": "hidden",
                "mindjetType": "hidden",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 704,
                "label": "对应客户名称"
            },
            "contact": {
                "id": "contact",
                "type": "select",
                "suffix": "/contact",
                "method": "GET",
                "value": "联系人ID",
                "mindjetType": "select",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 706,
                "label": "联系人"
            },
            "goods": {
                "id": "goods",
                "rules": "",
                "type": "select",
                "value": "产品ID",
                "mindjetType": "dict",
                "mindjetClass": "fieldBusiness",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_PRODUCTS",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 711,
                "label": "产品"
            },
            "time": {
                "id": "time",
                "mindjetType": "",
                "mindjetClass": "fieldBusiness",
                "type": "text",
                "mindjetIndex": 715,
                "label": "时间"
            },
            "name": {
                "id": "name",
                "rules": "required",
                "mindjetType": "",
                "mindjetClass": "fieldControl",
                "type": "text",
                "mindjetIndex": 717,
                "label": "机会名称"
            },
            "contactId": {
                "id": "contactId",
                "type": "select",
                "subdata": [
                    {
                        "value": 0,
                        "text": "SQL查询"
                    }
                ],
                "suffix": "/contact",
                "method": "GET",
                "value": "联系人ID",
                "mindjetType": "select",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 719,
                "label": "关联联系人"
            },
            "predictSaleAmounts": {
                "id": "predictSaleAmounts",
                "rules": "required",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 725,
                "label": "预计销售金额"
            },
            "whenPredictSigned": {
                "id": "whenPredictSigned",
                "rules": "required",
                "type": "date",
                "mindjetType": "date",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 728,
                "label": "预计签单日期"
            },
            "stage": {
                "id": "stage",
                "type": "select",
                "subdata": [
                    {
                        "value": 0,
                        "text": "初步接洽"
                    },
                    {
                        "value": 1,
                        "text": "确认需求"
                    },
                    {
                        "value": 2,
                        "text": "方案"
                    },
                    {
                        "value": 3,
                        "text": "谈判审核"
                    },
                    {
                        "value": 4,
                        "text": "客户签单"
                    },
                    {
                        "value": 5,
                        "text": "项目失败"
                    }
                ],
                "mindjetType": "select",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 731,
                "label": "销售阶段"
            },
            "signedPossibility": {
                "id": "signedPossibility",
                "type": "hidden",
                "des": "取决于销售阶段,不同阶段对应选择数值",
                "subdata": [
                    {
                        "value": 0,
                        "text": "初步接洽"
                    },
                    {
                        "value": 1,
                        "text": "确认需求"
                    },
                    {
                        "value": 2,
                        "text": "报价"
                    },
                    {
                        "value": 3,
                        "text": "谈判审核"
                    },
                    {
                        "value": 4,
                        "text": "客户签单"
                    },
                    {
                        "value": 5,
                        "text": "项目失败"
                    }
                ],
                "mindjetType": "hidden",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 739,
                "label": "签单可能性"
            },
            "type": {
                "id": "type",
                "type": "select",
                "subdata": [
                    {
                        "value": 0,
                        "text": "高价值机会"
                    },
                    {
                        "value": 1,
                        "text": "普遍机会"
                    },
                    {
                        "value": 2,
                        "text": "低价值机会"
                    }
                ],
                "mindjetType": "select",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 748,
                "label": "机会类型"
            },
            "whenGettedData": {
                "id": "whenGettedData",
                "type": "date",
                "mindjetType": "date",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 753,
                "label": "机会获取日期"
            },
            "whenChanceStateCreated": {
                "id": "whenChanceStateCreated",
                "mindjetType": "",
                "mindjetClass": "fieldControl",
                "type": "text",
                "mindjetIndex": 755,
                "label": "机会状态创建时间"
            },
            "sourceId": {
                "id": "sourceId",
                "type": "select",
                "subdata": [
                    {
                        "value": 0,
                        "text": "广告"
                    },
                    {
                        "value": 1,
                        "text": "社交推广"
                    },
                    {
                        "value": 2,
                        "text": "研讨会"
                    },
                    {
                        "value": 3,
                        "text": "搜索引擎"
                    },
                    {
                        "value": 4,
                        "text": "客户介绍"
                    },
                    {
                        "value": 5,
                        "text": "代理商"
                    },
                    {
                        "value": 6,
                        "text": "其他"
                    }
                ],
                "mindjetType": "select",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 756,
                "label": "机会来源"
            },
            "ownerId": {
                "id": "ownerId",
                "type": "select",
                "subdata": [
                    {
                        "value": 0,
                        "text": "SQL查询"
                    }
                ],
                "mindjetType": "select",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 765,
                "label": "负责人"
            },
            "lastOwner": {
                "id": "lastOwner",
                "des": "永远记录最新转移前的负责人",
                "mindjetType": "",
                "mindjetClass": "fieldControl",
                "type": "text",
                "mindjetIndex": 768,
                "label": "原负责人"
            },
            "whyFailure": {
                "id": "whyFailure",
                "rules": "required",
                "type": "textarea",
                "mindjetType": "文本域",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 770,
                "label": "项目失败原因"
            },
            "contractFlag": {
                "id": "contractFlag",
                "type": "radio",
                "subdata": [
                    {
                        "value": 0,
                        "text": "是:0"
                    },
                    {
                        "value": 1,
                        "text": "否:1"
                    }
                ],
                "des": "若是执行了转为合同动作,此字段置为是。转为合同按钮隐藏；",
                "value": 0,
                "mindjetType": "radio",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 773,
                "label": "是否转为合同"
            },
            "remark": {
                "id": "remark",
                "type": "textarea",
                "mindjetType": "文本域",
                "mindjetClass": "fieldVisual",
                "mindjetIndex": 780,
                "label": "备注"
            }
        },
        "columns": {
            "chance": {
                "field": "chance",
                "title": "机会",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 688,
                "mindjetType": "",
                "width": 100
            },
            "contract": {
                "field": "contract",
                "title": "合同",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 691,
                "mindjetType": "hidden",
                "width": 100
            },
            "customerId": {
                "field": "customerId",
                "title": "对应客户",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 695,
                "mindjetType": "select",
                "width": 100
            },
            "customerName": {
                "field": "customerName",
                "title": "对应客户名称",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 704,
                "mindjetType": "hidden",
                "width": 100
            },
            "contact": {
                "field": "contact",
                "title": "联系人",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 706,
                "mindjetType": "select",
                "width": 100
            },
            "goods": {
                "field": "goods",
                "title": "产品",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 711,
                "mindjetType": "dict",
                "width": 100
            },
            "time": {
                "field": "time",
                "title": "时间",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 715,
                "mindjetType": "",
                "width": 100
            },
            "name": {
                "field": "name",
                "title": "机会名称",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 717,
                "mindjetType": "",
                "width": 100
            },
            "contactId": {
                "field": "contactId",
                "title": "关联联系人",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 719,
                "mindjetType": "select",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "SQL查询"
                        }
                    }
                }
            },
            "predictSaleAmounts": {
                "field": "predictSaleAmounts",
                "title": "预计销售金额",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 725,
                "mindjetType": "text",
                "width": 100
            },
            "whenPredictSigned": {
                "field": "whenPredictSigned",
                "title": "预计签单日期",
                "inputType": "date",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 728,
                "mindjetType": "date",
                "width": 86,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD"
                    }
                }
            },
            "stage": {
                "field": "stage",
                "title": "销售阶段",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 731,
                "mindjetType": "select",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "初步接洽",
                            "1": "确认需求",
                            "2": "方案",
                            "3": "谈判审核",
                            "4": "客户签单",
                            "5": "项目失败"
                        }
                    }
                }
            },
            "signedPossibility": {
                "field": "signedPossibility",
                "title": "签单可能性",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 739,
                "mindjetType": "hidden",
                "width": 100
            },
            "type": {
                "field": "type",
                "title": "机会类型",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 748,
                "mindjetType": "select",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "高价值机会",
                            "1": "普遍机会",
                            "2": "低价值机会"
                        }
                    }
                }
            },
            "whenGettedData": {
                "field": "whenGettedData",
                "title": "机会获取日期",
                "inputType": "date",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 753,
                "mindjetType": "date",
                "width": 86,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD"
                    }
                }
            },
            "whenChanceStateCreated": {
                "field": "whenChanceStateCreated",
                "title": "机会状态创建时间",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 755,
                "mindjetType": "",
                "width": 100
            },
            "sourceId": {
                "field": "sourceId",
                "title": "机会来源",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 756,
                "mindjetType": "select",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "广告",
                            "1": "社交推广",
                            "2": "研讨会",
                            "3": "搜索引擎",
                            "4": "客户介绍",
                            "5": "代理商",
                            "6": "其他"
                        }
                    }
                }
            },
            "ownerId": {
                "field": "ownerId",
                "title": "负责人",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 765,
                "mindjetType": "select",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "SQL查询"
                        }
                    }
                }
            },
            "lastOwner": {
                "field": "lastOwner",
                "title": "原负责人",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 768,
                "mindjetType": "",
                "width": 100
            },
            "whyFailure": {
                "field": "whyFailure",
                "title": "项目失败原因",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 770,
                "mindjetType": "文本域",
                "width": 100
            },
            "contractFlag": {
                "field": "contractFlag",
                "title": "是否转为合同",
                "inputType": "radio",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 773,
                "mindjetType": "radio",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "是:0",
                            "1": "否:1"
                        }
                    }
                }
            },
            "remark": {
                "field": "remark",
                "title": "备注",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 780,
                "mindjetType": "文本域",
                "width": 100
            }
        }
    },
    "touch": {
        "controller": {
            "new": {
                "new": {
                    "suffix": "/crm/touch/new",
                    "接口文档": "接触/新增"
                }
            },
            "modify": {
                "modify": {
                    "suffix": "/crm/touch/modify",
                    "接口文档": "接触/修改"
                }
            },
            "readFlag": {
                "readFlag": {}
            },
            "delete": {
                "delete": {
                    "suffix": "/crm/touch/delete",
                    "接口文档": "接触/删除"
                }
            },
            "query": {
                "basicquery": {
                    "suffix": "/crm/touch/getlist",
                    "接口文档": "查询/机会查询"
                },
                "detailedquery": {
                    "suffix": "/crm/touch/getbyid",
                    "data": {
                        "name": {}
                    },
                    "接口文档": "查询/机会户详细页查询"
                }
            },
            "statistics": {
                "touchRecordStatistics": {
                    "suffix": "/crm/touch/coustomerstatistic",
                    "data": {
                        "whenCreated": {},
                        "whenActualTouch": {},
                        "ownerId": {}
                    },
                    "接口文档": "统计/接触记录统计"
                }
            }
        },
        "state": {
            "customer": {},
            "chance": {},
            "contract": {},
            "touch": {
                "field": {
                    "dataType": {},
                    "dataId": {},
                    "dataName": {},
                    "newState": {},
                    "type": {},
                    "permitDeletedFlag": {},
                    "permitModifiedFlag": {},
                    "whenTouch": {},
                    "whenTouchNextime": {},
                    "description": {},
                    "remindToId": {},
                    "remindToName": {}
                }
            }
        },
        "fields": {
            "whenCreated": {
                "id": "whenCreated",
                "type": "datetime",
                "des": "接触信息创建时间",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 875,
                "label": "创建时间"
            },
            "lastModifiedtime": {
                "id": "lastModifiedtime",
                "type": "datetime",
                "des": "接触信息最近修改时间",
                "mindjetType": "datetime",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 878,
                "label": "最近修改时间"
            },
            "createdBy": {
                "id": "createdBy",
                "type": "text",
                "mindjetType": "text",
                "mindjetClass": "fieldBusiness",
                "mindjetIndex": 881,
                "label": "创建人"
            },
            "state": {
                "id": "state",
                "type": "select",
                "mindjetType": "dict",
                "mindjetClass": "fieldControl",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 884,
                "label": "状态"
            },
            "newState": {
                "id": "newState",
                "type": "select",
                "mindjetType": "dict",
                "mindjetClass": "fieldControl",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 886,
                "label": "新状态"
            },
            "dataId": {
                "id": "dataId",
                "type": "select",
                "mindjetType": "select",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 888,
                "label": "名称"
            },
            "dataName": {
                "id": "dataName",
                "type": "hidden",
                "mindjetType": "hidden",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 890,
                "label": "显示名称"
            },
            "chanceState": {
                "id": "chanceState",
                "type": "select",
                "subdata": [
                    {
                        "value": 0,
                        "text": "初步接洽"
                    },
                    {
                        "value": 1,
                        "text": "确认需求"
                    },
                    {
                        "value": 2,
                        "text": "方案"
                    },
                    {
                        "value": 3,
                        "text": "谈判审核"
                    },
                    {
                        "value": 4,
                        "text": "客户签单"
                    },
                    {
                        "value": 5,
                        "text": "项目失败"
                    }
                ],
                "des": "动态获取,状态获取的是机会、合同、客户、线索的状态",
                "mindjetType": "select",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 892,
                "label": "机会的状态"
            },
            "customerState": {
                "id": "customerState",
                "rules": "required",
                "type": "select",
                "des": "动态获取,状态获取的是机会、合同、客户、线索的状态",
                "mindjetType": "dict",
                "mindjetClass": "fieldControl",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_STATE",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 901,
                "label": "客户的状态"
            },
            "clueState": {
                "id": "clueState",
                "type": "select",
                "des": "动态获取,状态获取的是机会、合同、客户、线索的状态",
                "mindjetType": "dict",
                "mindjetClass": "fieldControl",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_CLUESTATE",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 905,
                "label": "线索的状态"
            },
            "type": {
                "id": "type",
                "type": "select",
                "mindjetType": "dict",
                "mindjetClass": "fieldControl",
                "dataSrc": "rows",
                "urlSuffix": "/basDictController/getDictByTableName?tableName=",
                "urlDictArguments": "DICT_TOUCHTYPE",
                "url": "/NPE/uiTest/getJson",
                "data": {
                    "keyName": "DICT_DEMO_DATA"
                },
                "method": "post",
                "textField": "name",
                "valueField": "value",
                "mindjetIndex": 908,
                "label": "接触方式"
            },
            "whenTouch": {
                "id": "whenTouch",
                "type": "datetime",
                "format": "yyyy-mm-dd hh",
                "mindjetType": "datetime",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 910,
                "label": "接触时间"
            },
            "whenTouchNextime": {
                "id": "whenTouchNextime",
                "type": "datetime",
                "format": "yyyy-mm-dd hh",
                "mindjetType": "datetime",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 913,
                "label": "下次接触时间"
            },
            "description": {
                "id": "description",
                "type": "textarea",
                "rules": "required",
                "mindjetType": "文本域",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 916,
                "label": "拜访描述"
            },
            "permitDeletedFlag": {
                "id": "permitDeletedFlag",
                "type": "radio",
                "subdata": [
                    {
                        "value": 0,
                        "text": "是"
                    },
                    {
                        "value": 1,
                        "text": "否"
                    }
                ],
                "des": "若是接触修改了关联对象状态,字段置为否",
                "mindjetType": "radio",
                "mindjetClass": "fieldControl",
                "value": 0,
                "mindjetIndex": 919,
                "label": "是否允许删除"
            },
            "permitModifiedFlag": {
                "id": "permitModifiedFlag",
                "type": "radio",
                "subdata": [
                    {
                        "value": 0,
                        "text": "是"
                    },
                    {
                        "value": 1,
                        "text": "否"
                    }
                ],
                "des": "若是接触修改了关联对象状态,字段置为否",
                "mindjetType": "radio",
                "mindjetClass": "fieldControl",
                "value": 0,
                "mindjetIndex": 924,
                "label": "是否允许修改"
            },
            "dataType": {
                "id": "dataType",
                "des": "判断数据类型",
                "subdata": [
                    {
                        "value": 0,
                        "text": "客户:0"
                    },
                    {
                        "value": 1,
                        "text": "联系人:1"
                    },
                    {
                        "value": 2,
                        "text": "机会:2"
                    },
                    {
                        "value": 3,
                        "text": "合同:3"
                    },
                    {
                        "value": 4,
                        "text": "线索:4"
                    }
                ],
                "type": "select",
                "mindjetType": "select",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 929,
                "label": "数据类型"
            },
            "pictureAttachmentIds": {
                "id": "pictureAttachmentIds",
                "mindjetType": "",
                "mindjetClass": "fieldControl",
                "type": "text",
                "mindjetIndex": 937,
                "label": "图片上传"
            },
            "attachmentIds": {
                "id": "attachmentIds",
                "mindjetType": "",
                "mindjetClass": "fieldControl",
                "type": "text",
                "mindjetIndex": 938,
                "label": "附件上传"
            },
            "remindToName": {
                "id": "remindToName",
                "type": "hidden",
                "mindjetType": "hidden",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 939,
                "label": "被提醒人姓名"
            },
            "remindToId": {
                "id": "remindToId",
                "type": "select2",
                "suffix": "/netStarRights/basUserController-getAllUser",
                "mindjetType": "select2",
                "mindjetClass": "fieldControl",
                "mindjetIndex": 941,
                "label": "被提醒人id"
            }
        },
        "columns": {
            "whenCreated": {
                "field": "whenCreated",
                "title": "创建时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 875,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "lastModifiedtime": {
                "field": "lastModifiedtime",
                "title": "最近修改时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 878,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "createdBy": {
                "field": "createdBy",
                "title": "创建人",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 881,
                "mindjetType": "text",
                "width": 100
            },
            "state": {
                "field": "state",
                "title": "状态",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 884,
                "mindjetType": "dict",
                "width": 100
            },
            "newState": {
                "field": "newState",
                "title": "新状态",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 886,
                "mindjetType": "dict",
                "width": 100
            },
            "dataId": {
                "field": "dataId",
                "title": "名称",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 888,
                "mindjetType": "select",
                "width": 100
            },
            "dataName": {
                "field": "dataName",
                "title": "显示名称",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 890,
                "mindjetType": "hidden",
                "width": 100
            },
            "chanceState": {
                "field": "chanceState",
                "title": "机会的状态",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 892,
                "mindjetType": "select",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "初步接洽",
                            "1": "确认需求",
                            "2": "方案",
                            "3": "谈判审核",
                            "4": "客户签单",
                            "5": "项目失败"
                        }
                    }
                }
            },
            "customerState": {
                "field": "customerState",
                "title": "客户的状态",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 901,
                "mindjetType": "dict",
                "width": 100
            },
            "clueState": {
                "field": "clueState",
                "title": "线索的状态",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 905,
                "mindjetType": "dict",
                "width": 100
            },
            "type": {
                "field": "type",
                "title": "接触方式",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 908,
                "mindjetType": "dict",
                "width": 100
            },
            "whenTouch": {
                "field": "whenTouch",
                "title": "接触时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 910,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "whenTouchNextime": {
                "field": "whenTouchNextime",
                "title": "下次接触时间",
                "inputType": "datetime",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 913,
                "mindjetType": "datetime",
                "width": 134,
                "formatHandler": {
                    "type": "date",
                    "data": {
                        "formatDate": "YYYY-MM-DD hh:mm:ss"
                    }
                }
            },
            "description": {
                "field": "description",
                "title": "拜访描述",
                "inputType": "textarea",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 916,
                "mindjetType": "文本域",
                "width": 100
            },
            "permitDeletedFlag": {
                "field": "permitDeletedFlag",
                "title": "是否允许删除",
                "inputType": "radio",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 919,
                "mindjetType": "radio",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "是",
                            "1": "否"
                        }
                    }
                }
            },
            "permitModifiedFlag": {
                "field": "permitModifiedFlag",
                "title": "是否允许修改",
                "inputType": "radio",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 924,
                "mindjetType": "radio",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "是",
                            "1": "否"
                        }
                    }
                }
            },
            "dataType": {
                "field": "dataType",
                "title": "数据类型",
                "inputType": "select",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 929,
                "mindjetType": "select",
                "width": 134,
                "formatHandler": {
                    "type": "stringReplace",
                    "data": {
                        "formatDate": {
                            "0": "客户:0",
                            "1": "联系人:1",
                            "2": "机会:2",
                            "3": "合同:3",
                            "4": "线索:4"
                        }
                    }
                }
            },
            "pictureAttachmentIds": {
                "field": "pictureAttachmentIds",
                "title": "图片上传",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 937,
                "mindjetType": "",
                "width": 100
            },
            "attachmentIds": {
                "field": "attachmentIds",
                "title": "附件上传",
                "inputType": "text",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 938,
                "mindjetType": "",
                "width": 100
            },
            "remindToName": {
                "field": "remindToName",
                "title": "被提醒人姓名",
                "inputType": "hidden",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 939,
                "mindjetType": "hidden",
                "width": 100
            },
            "remindToId": {
                "field": "remindToId",
                "title": "被提醒人id",
                "inputType": "select2",
                "searchable": true,
                "orderable": true,
                "mindjetIndex": 941,
                "mindjetType": "select2",
                "width": 100
            }
        }
    }
}