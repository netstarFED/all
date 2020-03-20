//定义基本方法和特殊方法

var MethodCommon = {
    methodFormArray: function(formJson){
        var formArray;
        if($.isArray(formJson)){
            if($.isArray(formJson[0])){
                formArray = formJson;
            } else {
                formArray = [formJson];
            }
        } else {
            formArray = [[formJson]];
        }
        return formArray;
    },
    createMethodFormArray: function(methodId, formData){
        var method = CalculateMethod.getParentChildMethod();
        var formArray = [];
        //如果是父子互算，还需要额外获取子方法
        if(methodId == method.id){
            var formJson = (eval('(' + method.formJson + ')'));
            formArray.push(this.methodFormArray(formJson)[0]);
            var singleMethod = CalculateMethod.getMethod(formData.singleMethod);
            formJson = (eval('(' + singleMethod.formJson + ')'));
            formArray.push(this.methodFormArray(formJson)[0]);
        } else {
            method = CalculateMethod.getMethod(methodId);
            var formJson = (eval('(' + method.formJson + ')'));
            formArray.push(this.methodFormArray(formJson)[0]);
        }
        this.appendMethodId(formArray, methodId);
        return formArray;
    },
    appendMethodId: function(formArray, methodId) {
        formArray[0].push({
            id: 'currentMethodId',
            type: 'hidden',
            value: methodId
        });
    },
    showMethod: function(formId, formArray){
        nsForm.init({
            id: formId,
            size: "standard compactmode",
            format: "standard",
            fillbg: true,
            form: formArray
        });
    }
};

/**
 * 对方法表单进行简单的封装，方便方法内部事件的处理
 */
var MethodForm = (function(){
    //数据库常见类型
    var JdbcType = {
        "NUMBER": [
            "BIT",
            "TINYINT",
            "BOOL", "BOOLEAN",
            "SMALLINT",
            "MEDIUMINT",
            "INT", "INTEGER",
            "BIGINT",
            "SERIAL",
            "DECIMAL",
            "DEC",
            "FLOAT",
            "DOUBLE",
            //-----------以上来自 mysql
            "NUMERIC",
            "SMALLMONEY",
            "MONEY",
            "REAL",
            //-----------以上来自 sqlserver
            "NUMBER"
            //-----------以上来自 oracle
        ],
        "DATE": [
            "DATE",
            "DATETIME",
            "TIMESTAMP",
            "TIME",
            "YEAR",
            //-----------以上来自 mysql
            "DATETIMEOFFSET",
            "DATETIME2",
            "SMALLDATETIME"
            //-----------以上来自 sqlserver
        ],
        "STRING": [
            "CHARACTER SET", "CHARSET",
            "CHAR",
            "VARCHAR",
            "TEXT",
            "VARBINARY",
            "TINYTEXT",
            "LONGTEXT",
            "ENUM",
            "SET",
            //-----------以上来自 mysql
            "NCHAR",
            "NTEXT",
            "NVARCHAR",
            //-----------以上来自 sqlserver
            "VARCHAR2",
            "NVARCHAR2",
            "LONG"
            //-----------以上来自 oracle
        ],
        "BYTE[]": [
            "TINYBLOB",
            "BLOB",
            "MEDIUMBLOB",
            "LONGBLOB",
            //-----------以上来自 mysql
            "BINARY",
            "VARBINARY",
            "IMAGE",
            //-----------以上来自 sqlserver
            "RAW",
            "LONG RAW",
            "CLOB",
            "NCLOB",
            "BFILE"
            //-----------以上来自 oracle
        ]
    };

    //获取类型数组
    function getTypeArray(type){
        if(type){
            type = type.toUpperCase();
        } else {
            return false;
        }
        for(var field in JdbcType){
            if(JdbcType[field].indexOf(type) != -1){
                return JdbcType[field];
            }
        }
        return false;
    }

    //根据类型过滤
    function filterByType(array, type){
        if(type){
            var typeArray = getTypeArray(type);
            if(typeArray){
                var subdata = [];
                for(var i = 0; i < array.length; i++){
                    if(array[i].jdbcType && typeArray.indexOf(array[i].jdbcType.toUpperCase()) != -1){
                        subdata.push(array[i]);
                    }
                }
                return subdata;
            }
        }
        return array;
    }

    return function(formId){
        var result = {
            getId: function(){
                return formId;
            },
            initById: function(methodId){
                var method = CalculateMethod.getMethod(methodId);
                var formJson = (eval('(' + method.formJson + ')'));
                this.init(formJson, methodId);
            },
            init: function(formJson, methodId){
                var form = MethodCommon.methodFormArray(formJson);
                MethodCommon.appendMethodId(form, methodId);
                MethodCommon.showMethod(formId, form);
            },
            clearData: function(){
                nsForm.clearData(formId);
            },
            getData: function(valid){
                return nsForm.getFormJSON(formId, valid);
            },
            fillValues: function(data){
                nsForm.fillValues(data, formId)
            },
            updateSelectData(fieldIds, array, type){
                var editArray = [];
                var subdata = filterByType(array, type);
                if($.isArray(fieldIds)){
                    for(var i = 0; i < fieldIds.length; i++){
                        editArray.push({id: fieldIds[i], subdata: subdata});
                    }
                } else {
                    editArray.push({id: fieldIds, subdata: subdata});
                }
                nsForm.edit(editArray, formId);
            },
            updateFieldValue(fieldId, value){
                nsForm.fillValues({fieldId: value}, formId)
            }
        };
        result.initById = result.initById.bind(result);
        return result;
    };
})();

/**
 * 封装方法执行过程
 *
 * @type {{calculate}}
 */
var CalculateMethod = (function(){
    var SOURCE_TABLE_NAME = "sourceTableName";
    var SOURCE_COLUMN_NAME = "sourceColumnName";
    var TARGET_TABLE_NAME = "targetTableName";
    var TARGET_COLUMN_NAME = "targetColumnName";
    var TARGET_COLUMN_TYPE = "targetColumnType";
    var CHILD_SOURCE_TABLE_NAME = "childSourceTableName";
    var CHILD_SOURCE_COLUMN_NAME = "childSourceColumnName";
    var COLUMNS = "columns";
    var CHILD_COLUMNS = "childColumns";

    var allMethods = [];

    //单值计算方法
    var singles;
    //加工方法
    var dressups;
    //父子互算方法需要使用子方法，这里特殊记录
    var parentChildMethodId = '1269310086774260713';
    var parentChildMethod;

    //初始化方法
    function initAllMethods(callback){
        $.ajax({
            url: getRootPath() + '/reportSourceMethod/getAll?complete=true',
            success: function (data) {
                if (data.success) {
                    allMethods = data.rows;
                    classifyMethods(allMethods);
                    if(callback && typeof(callback) == 'function'){
                        callback();
                    }
                } else {
                    console.error('获取方法失败:' + data.msg);
                }
            },
            error: function (e) {
                console.error('获取方法失败:' + data.msg);
            }
        });
    }

    //方法分类处理
    function classifyMethods(methods){
        singles = [], dressups = [];
        for(var i = 0; i < methods.length; i++){
            if(methods[i].implType == 'single'){
                singles.push(methods[i]);
            } else if(methods[i].implType == 'parentChild'){
                //父子互算子方法
            } else {
                dressups.push(methods[i]);
            }
            if(methods[i].formJson){
                methods[i].form = eval('(' + methods[i].formJson + ')');
            }
            if(methods[i].jsLogic){
                methods[i].custom = eval('(' + methods[i].jsLogic + ')');
            } else {
                methods[i].custom = false;
            }
            if(methods[i].id == parentChildMethodId){
                parentChildMethod = methods[i];
            }
        }
    }

    var CalculateContext = function(tables){
        this.tables = tables;
        this.tableMap = {};
        for(var i = 0; i < this.tables.length; i++){
            this.tableMap[this.tables[i].name] = this.tables[i];
        }
    };

    CalculateContext.prototype.getTables = function(){
        return this.tables;
    };
    CalculateContext.prototype.getTable = function(name){
        return this.tableMap[name];
    };
    CalculateContext.prototype.existsTable = function(name){
        return this.getTable(name) != undefined;
    };
    CalculateContext.prototype.addTable = function(table){
        this.tableMap[table.name] = table;
        this.tables.push(table);
    };
    CalculateContext.prototype.addTableColumn = function(tableName, column){
        var table = this.tableMap[tableName];
        if(table){
            table.columns.push(column);
        }
    };

    /* table 和 column 数据结构 ------------
    {
        "id": "0",
        "name": "附件表",
        "databaseId": "2",
        "databaseName": "10.10.10.130/newui",
        "dataSql": "select * from attachment",
        "md5": "91d6b8158f977929497ca968c26cbc43",
        "columns": [
            {
                "id": "1264376450325152745",
                "name": "id",
                "jdbcType": "int",
                "remark": "主键",
                "undefined": ""
            },
            {
                "id": "1264376450325153769",
                "name": "fileType",
                "jdbcType": "int",
                "remark": "文件类型",
                "undefined": ""
            }
        ],
        "params": [],
        "undefined": ""
    }"
    */

    var methodMap = {
        implTypeArray: [
            {
                name: '单值计算',
                id: 'single'
            }, {
                name: '单表新列',
                id: 'oneColumn'
            }, {
                name: '单表新表',
                id: 'oneTable'
            }, {
                name: '双表新列',
                id: 'twoColumn'
            }, {
                name: '双表新表',
                id: 'twoTable'
            }, {
                name: '父子互算计算方法',
                id: 'parentChild'
            }, {
                name: '普通方法',
                id: 'normal'
            }
        ],
        single: function(context, params){
            if(!context.existsTable(params[TARGET_TABLE_NAME])){
                context.addTable({
                    name: params[TARGET_TABLE_NAME],
                    columns: [],
                    sourceType: 'calculate'
                })
            }
            context.addTableColumn(params[TARGET_TABLE_NAME], {
                name: params[TARGET_COLUMN_NAME],
                remark: params[TARGET_COLUMN_NAME],
                jdbcType: params[TARGET_COLUMN_TYPE]
            });
        },
        oneColumn: function(context, params){
            //选择的表必须存在才能继续
            if(context.existsTable(params[SOURCE_TABLE_NAME])){
                context.addTableColumn(params[SOURCE_TABLE_NAME], {
                    name: params[TARGET_COLUMN_NAME],
                    remark: params[TARGET_COLUMN_NAME],
                    jdbcType: params[TARGET_COLUMN_TYPE]
                });
            }
        },
        oneTable: function(context, params){
            var sourceTable = context.getTable(params[SOURCE_TABLE_NAME]);
            //选择的表必须存在才能继续
            if(sourceTable){
                if(!context.existsTable(params[TARGET_TABLE_NAME])){
                    context.addTable({
                        name: params[TARGET_TABLE_NAME],
                        columns: [],
                        sourceType: 'calculate'
                    })
                }
                var columnStrs = params[COLUMNS];
                if(columnStrs){
                    var columns = columnStrs.split(',');
                    for(var i = 0; i < sourceTable.columns.length; i++){
                        if(columns.indexOf(sourceTable.columns[i].name) != -1){
                            context.addTableColumn(params[TARGET_TABLE_NAME], sourceTable.columns[i]);
                        }
                    }
                }
            }
        },
        twoColumn: function(context, params){
            if(context.existsTable(params[SOURCE_TABLE_NAME])) {
                context.addTableColumn(params[SOURCE_TABLE_NAME], {
                    name: params[TARGET_COLUMN_NAME],
                    remark: params[TARGET_COLUMN_NAME],
                    jdbcType: params[TARGET_COLUMN_TYPE]
                });
            }
        },
        twoTable: function(context, params){
            //关联表，主表
            var sourceTable = context.getTable(params[SOURCE_TABLE_NAME]);
            //子表
            var childTable = context.getTable(params[CHILD_SOURCE_TABLE_NAME]);
            //主子表必须同时存在
            if(sourceTable && childTable){
                if(!context.existsTable(params[TARGET_TABLE_NAME])){
                    context.addTable({
                        name: params[TARGET_TABLE_NAME],
                        columns: [],
                        sourceType: 'calculate'
                    })
                }
                var columnStrs = params[SOURCE_COLUMN_NAME];
                if(columnStrs){
                    var columns = columnStrs.split(',');
                    for(var i = 0; i < sourceTable.columns.length; i++){
                        if(columns.indexOf(sourceTable.columns[i].name) != -1){
                            var column = $.extend(true, {}, sourceTable.columns[i], {
                                name: sourceTable.name + "_" + sourceTable.columns[i].name,
                                remark: sourceTable.columns[i].remark ? (sourceTable.name + "_" + sourceTable.columns[i].remark): ''
                            });
                            context.addTableColumn(params[TARGET_TABLE_NAME], column);
                        }
                    }
                }
                columnStrs = params[CHILD_SOURCE_COLUMN_NAME];
                if(columnStrs){
                    var columns = columnStrs.split(',');
                    for(var i = 0; i < childTable.columns.length; i++){
                        if(columns.indexOf(childTable.columns[i].name) != -1){
                            var column = $.extend(true, {}, childTable.columns[i], {
                                name: childTable.name + "_" + childTable.columns[i].name,
                                remark: childTable.columns[i].remark ? (childTable.name + "_" + childTable.columns[i].remark): ''
                            });
                            context.addTableColumn(params[TARGET_TABLE_NAME], column);
                        }
                    }
                }
            }
        },
        parentChild: function(context, params){
            if(context.existsTable(params[SOURCE_TABLE_NAME])) {
                context.addTableColumn(params[SOURCE_TABLE_NAME], {
                    name: params[TARGET_COLUMN_NAME],
                    remark: params[TARGET_COLUMN_NAME],
                    jdbcType: params[TARGET_COLUMN_TYPE]
                });
            }
        }
    };

    var execMethods = function(context, dressups, calculates){
        //加工方法
        for(var i = 0; i < dressups.length; i++){
            var methodObj = dressups[i];
            var method = this.getMethod(methodObj.id);
            //使用默认方法和自定义方法
            if(method.custom && method.custom.logic){
                method.custom.logic(context, methodObj.data);
            } else if(method.implType && methodMap[method.implType]){
                methodMap[method.implType](context, methodObj.data);
            }
        }
        //加工方法
        for(var i = 0; i < calculates.length; i++){
            var methodObj = calculates[i];
            var method = this.getMethod(methodObj.id);
            //使用默认方法和自定义方法
            if(method.custom && method.custom.logic){
                method.custom.logic(context, methodObj.data);
            } else if(method.implType && methodMap[method.implType]){
                methodMap[method.implType](context, methodObj.data);
            }
        }
    };

    return {
        //初始化
        init: initAllMethods,
        //重新加载
        reload: initAllMethods,
        //计算方法，返回加工结果
        calculate: function(tables, dressups, calculates){
            var context = new CalculateContext(tables);
            execMethods.bind(this)(context, dressups, calculates);
            return context.getTables();
        },
        getSingles: function(){
            return singles;
        },
        getMethodsByType: function(type){
            var methods = [];
            for(var i = 0; i < allMethods.length; i++){
                if(allMethods[i].implType == type){
                    methods.push(allMethods[i]);
                }
            }
            return methods;
        },
        getDressups: function(){
            return dressups;
        },
        getParentChildMethod: function(){
            return parentChildMethod;
        },
        getMethod: function(id){
            for(var i = 0; i < allMethods.length; i++){
                if(allMethods[i].id == id){
                    return allMethods[i];
                }
            }
        },
        getImplTypeArray: function(){
            return methodMap.implTypeArray;
        }
    }
})();