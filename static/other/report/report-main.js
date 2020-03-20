//处理数据的加载和保存，封装界面的几个控件操作
var ReportMain = (function(eventbus){

    var Ajax = {
        data: function(url, data, fun, options) {
            data = data || {};
            $.ajax({
                data: data,
                url: getRootPath() + url,
                method: (options && options.method) ? options.method : 'get',
                success: function (data) {
                    if (data.success) {
                        fun && fun(data.data);
                    } else {
                        nsalert('获取失败，请重试 ' + data.msg, 'error');
                    }
                },
                error: function (e) {
                    nsalert('获取失败，请重试', 'error');
                }
            })
        },
        rows: function(url, data, fun) {
            data = data || {};
            $.ajax({
                data: data,
                url: getRootPath() + url,
                success: function (data) {
                    if (data.success) {
                        fun(data.rows);
                    } else {
                        nsalert('获取失败，请重试 ' + data.msg, 'error');
                    }
                },
                error: function (e) {
                    nsalert('获取失败，请重试', 'error');
                }
            })
        }
    };

    function guid(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    }

    var TableCommon = {
        //简易过滤数据方法
        filterData: function(rows, predicateFun, acceptFun){
            for(var i = 0; i < rows.length; i++){
                if(predicateFun(rows[i])){
                    acceptFun(rows[i]);
                }
            }
        },
        loadTableData: function(tableId, rows, config){
            nsTable.originalConfig[tableId].dataConfig.dataSource = rows;
            if(config && config.selectIndex){
                nsTable.originalConfig[tableId].uiConfig.selectIndex = config.selectIndex;
            }
            nsTable.refreshByID(tableId);
        },
        keepTabelSelectIndex: function(tableId, existsFun, trueFun, falseFun){
            var row = nsTable.getSingleRowSelectedData(tableId, false);
            if(row){
                var index = nsTable.container[tableId].dataIndex;
                if(existsFun(row, index)){
                    if(typeof(trueFun) == 'function'){
                        trueFun(row, index);
                    }
                } else {
                    if(typeof(falseFun) == 'function'){
                        falseFun(row, index);
                    }
                }
            } else if(typeof(falseFun) == 'function'){
                falseFun();
            }
        }
    };

    var EVENT = {
        chooseCheck: 'choose.check',    //选中数据源
        calculate: 'calculate',         //计算
        dressupChange: 'methodChange',   //方法变化
        calculateChange: 'calculateChange',   //方法变化
    };

    var MethodContext = function(options, chooseTable){
        var resultTables;

        var methodMap = {
            dressup: new Method(options.dressup, EVENT.dressupChange),
            calculate: new Method(options.calculate, EVENT.calculateChange)
        };

        //根据基础数据源和方法计算加工结果数据源
        function calculateMethod(endMethod){
            var tables = chooseTable.getSelectTables();
            //获取加工方法和单值计算方法
            var dressups = methodMap.dressup.getMethodsByEnd(endMethod);
            var calculates = methodMap.calculate.getMethodsByEnd(endMethod);
            if(dressups.length == 0 && calculates.length == 0){
                return tables;
            }
            return CalculateMethod.calculate(tables, dressups, calculates);
        }

        function showMethodForm(method, methodTypeId){
            //根据当前方法计算可选的数据源
            resultTables = calculateMethod(method);
            if(methodTypeId == methodMap.dressup.getTableId()){
                methodMap.dressup.show(method, resultTables);
            } else {
                methodMap.calculate.show(method, resultTables);
            }
        }

        //上下移动方法
        function moveMethod(event, isUp){
            var tableID = event.tableId;
            var methodObj;
            if(tableID == options.dressup.table){
                methodObj = methodMap.dressup;
            } else {
                methodObj = methodMap.calculate;
            }
            if(isUp){
                methodObj.moveUp(event.rowIndexNumber);
            } else {
                methodObj.moveDown(event.rowIndexNumber);
            }
        }

        return {
            dressup: methodMap.dressup,
            calculate: methodMap.calculate,
            getSelectDatasource: function(){
                return resultTables;
            },
            showMethodForm: showMethodForm,
            initMethodForm: function(methodForm, methodId){
                var formId = methodForm.getId();
                var selectMethod;
                //加工方法
                if(formId == 'dressup-methods-form'){
                    selectMethod = methodMap.dressup.getSelected();
                } else {//单值计算
                    selectMethod = methodMap.calculate.getSelected();
                }
                resultTables = calculateMethod(selectMethod);
                methodForm.initById(methodId);
            },
            initMethods: function(methodJson){
                if(methodJson.dressups){
                    methodMap.dressup.setMethods(methodJson.dressups);
                }
                if(methodJson.calculates){
                    methodMap.calculate.setMethods(methodJson.calculates);
                }
            },
            showDescription: function(type){
                //获取选中的方法
                var formData = options[type].method.getData(false);
                if(formData && formData.id){
                    var method = CalculateMethod.getMethod(formData.id);
                    console.dir(method);
                    nsdialog.initShow({
                        id: 	"method-description",
                        title: 	"方法说明",
                        size: 	"m",
                        form:[
                            {
                                id: 'description',
                                label: '现有密码',
                                type: 'html',
                                html: '<div id="method-description">' + method.description + '</div>'
                            }
                        ],
                        btns:[
                        ]
                    });
                }
            },
            addMethod: function(type){
                console.log('添加方法:' + type);
                var methodData = options[type].method.getData();
                var formData = options[type].form.getData();
                if(formData){
                    methodMap[type].add(methodData.id, formData);
                }
            },
            editMethod: function(type){
                console.log('修改方法:' + type);
                var index = nsTable.container[options[type].table].dataIndex;
                if(index != 0 && !index){
                    nsalert('请选择已添加方法后再进行编辑，或者直接新增');
                }
                var methodData = options[type].method.getData();
                var formData = options[type].form.getData();
                if(formData){
                    methodMap[type].edit(methodData.id, formData, index);
                }
            },
            deleteMethod: function(event){
                var tableID = event.tableId;
                var methodObj;
                if(tableID == options.dressup.table){
                    methodObj = methodMap.dressup;
                } else {
                    methodObj = methodMap.calculate;
                }
                methodObj.delete(event.rowIndexNumber);
            },
            moveUp: function(event){
                moveMethod(event, true);
            },
            moveDown: function(event){
                moveMethod(event, false);
            },
            loadAll: function(){
                methodMap.dressup.load();
                methodMap.calculate.load();
            },
            keepSelect: function(){
                methodMap.dressup.keepSelect();
                methodMap.calculate.keepSelect();
            },
            calculateMethod: calculateMethod
        }
    };

    var Method = function(methodOptions, changeEvent){
        this.methods = [];
        this.maxMethodOrder = 0;
        this.getFormId = function(){
            return methodOptions.method.getId();
        };
        this.getTableId = function(){
            return methodOptions.table;
        };
        //包装方法
        this.wrapMethod = function(methodId, formData){
            var method = CalculateMethod.getMethod(methodId);
            var name = method.name;
            if(method.custom && method.custom.name){
                name = method.custom.name.bind(method)(formData);
            }
            var order = (++this.maxMethodOrder);
            return {
                id: methodId,
                name: name,
                data: formData,
                order: order,
                guid: guid()
            };
        };
        //获取选中的方法
        this.getSelected = function(){
            return nsTable.getSingleRowSelectedData(methodOptions.table, false);
        };
        this.setMethods = function(methods){
            for(var i = 0; i < methods.length; i++){
                if(!methods[i].guid){
                    methods[i].guid = guid();
                }
            }
            this.methods = methods;
            this.methods.sort(function(a, b){return a.order - b.order;});
            if(this.methods.length > 0){
                this.maxMethodOrder = this.methods[this.methods.length - 1].order;
            }
        };
        this.getMethods = function(){
            return this.methods;
        };
        this.getMethodsByEnd = function(endMethod){
            var results = [];
            for(var i = 0; i < this.methods.length; i++){
                if(this.methods[i] != endMethod){
                    results.push(this.methods[i]);
                } else {
                    break;
                }
            }
            return results;
        };
        this.changeEvent = function(){
            eventbus.emit(changeEvent);
        };
        this.get = function(index){
            return this.methods[index];
        };
        this.delete = function(index){
            this.methods.splice(index, 1);
            this.changeEvent();
        };
        this.add = function(methodId, formData){
            this.methods.push(this.wrapMethod(methodId, formData));
            this.changeEvent();
        };
        this.moveUp = function(index){
            if(index > 0){
                var temp = this.methods[index];
                var tempOrder = temp.order;
                //交互序号
                this.methods[index].order = this.methods[index - 1].order;
                this.methods[index - 1].order = tempOrder;
                //交换位置
                this.methods[index] = this.methods[index - 1];
                this.methods[index - 1] = temp;
                this.keepSelect();
                return true;
            }
            return false;
        };
        this.moveDown = function(index){
            if(index < (this.methods.length - 1)){
                var temp = this.methods[index];
                var tempOrder = temp.order;
                //交互序号
                this.methods[index].order = this.methods[index + 1].order;
                this.methods[index + 1].order = tempOrder;
                //交换位置
                this.methods[index] = this.methods[index + 1];
                this.methods[index + 1] = temp;
                this.keepSelect();
                return true;
            }
            return false;
        };
        this.edit = function(methodId, formData, index){
            var newMethod = this.wrapMethod(methodId, formData);
            if(this.methods.length > index){
                var method = this.methods[index];
                $.extend(method, newMethod);
                this.changeEvent();
            }
        };
        this.show = function(row, resultTables){
            console.log('显示方法表单和数据');
            var methodId = row.id;
            var formData = row.data;
            var formArray = MethodCommon.createMethodFormArray(methodId, formData);
            //选择方法
            nsForm.fillValues({id: methodId}, methodOptions.method.getId());
            //初始方法表单
            MethodCommon.showMethod(methodOptions.form.getId(), formArray);
            //执行form中的changHandler事件
            for(var i = 0; i < formArray.length; i++){
                for(var j = 0; j < formArray[i].length; j++){
                    var formInput = formArray[i][j];
                    //下拉框，并且名字中带着 Table
                    if(formInput.changeHandler && formInput.id.indexOf('Table') != -1){
                        switch (formInput.type){
                            case 'select2':
                            case 'select':
                                var tableName = formData[formInput.id];
                                var selectTable = {columns:[]};
                                for(var k = 0; k < resultTables.length; k++){
                                    if(resultTables[k].name == tableName){
                                        selectTable = resultTables[k];
                                        break;
                                    }
                                }
                                formInput.changeHandler(tableName, tableName, selectTable, undefined, true);
                                break;
                        }
                    }
                }
            }
            //赋值
            nsForm.fillValues(formData, methodOptions.form.getId());
            //再次获取值，然后赋值对比，如果不一致，说明有条件不满足了
            var newFormData = methodOptions.form.getData(false);
            for(var key in formData){
                if(formData[key] != newFormData[key]){
                    console.log('before:' + formData[key] + ', after:' + newFormData[key]);
                    methodOptions.form.clearData();
                    nsalert('方法配置无效，请重新配置', 'warning');
                    break;
                }
            }
        };
        this.load = function(config){
            TableCommon.loadTableData(methodOptions.table, this.methods, config);
        };
        this.keepSelect = function(){
            var that = this;
            var load = that.load.bind(that);
            TableCommon.keepTabelSelectIndex(methodOptions.table, function(row, index){
                return that.methods.length > index;
            }, function(row){
                load({selectIndex: [row.guid]});
            }, load);
        }
    };

    var Table = function(tableOptions){
        this.rows = [];
        this.setRows = function(rows){
            this.rows = rows;
        };
        this.getRows = function(){
            return this.rows;
        };
        this.setSelectTableIds = function(selectTableIds){
            this.rows.forEach(function(r){
                if(selectTableIds.indexOf(r.id) != -1){
                    r.checkedFlag = 1;
                }
            })
        };
        //设置resultTable的选中状态
        this.setSelectResultIsShow = function (isShowNames) { 
            this.rows.forEach(function (r) {
                if (isShowNames.indexOf(r.name) != -1) {
                    r.isShow = 1;
                } else {
                    r.isShow = 0;
                }
            })
        };
        this.getSelectResultIsShowIds = function () {
            var selectResultIsShowIds = [];
            this.rows.forEach(function (r) {
                if (r.isShow == 1) {
                    selectResultIsShowIds.push(r.id);
                }
            });
            return selectResultIsShowIds;
        }
        this.getSelectTableIds = function(){
            var selectTableIds = [];
            this.rows.forEach(function(r){
                if(r.checkedFlag == 1){
                    selectTableIds.push(r.id);
                }
            });
            return selectTableIds;
        };
        this.getSelectTables = function(){
            var selectTable = [];
            this.rows.forEach(function(r){
                if(r.checkedFlag == 1){
                    //deep copy，因为后续计算后会修改这里的列
                    selectTable.push($.extend(true, {}, r));
                }
            });
            return selectTable;
        };
        this.getColumns = function(tableName){
            var result = [];
            this.rows.forEach(function(r){
                if(r.name == tableName){
                    result = r.columns;
                }
            });
            return result;
        };
        this.load = function(config){
            TableCommon.loadTableData(tableOptions.table, this.rows, config);
        };
        this.loadColumns = function(name, field){
            var columns = [];
            if(!field){
                field = 'name';
            }
            if(name){
                var choose;
                for(var i = 0; i < this.rows.length; i++){
                    if(name == this.rows[i][field]){
                        choose = this.rows[i];
                    }
                }
                if(choose && choose.columns){
                    columns = choose.columns;
                }
            }
            TableCommon.loadTableData(tableOptions.column, columns);
        };
        this.keepSelect = function(){
            var that = this;
            var load = that.load.bind(that);
            var loadColumns = that.loadColumns.bind(that);
            TableCommon.keepTabelSelectIndex(tableOptions.table, function(row, index){
                var rowExists = false;
                that.rows.forEach(function(r, index){
                    if(row && row.name == r.name){
                        rowExists = true;
                    }
                });
                return rowExists;
            }, function(row){
                load({selectIndex: [row.name]});
                loadColumns(row.name);
            }, function(){
                load();
                loadColumns();
            });
        }
    };

    //历史记录
    var History = function(funs){
        var HISTORY_SIZE = 20;
        var currentIndex = -1;
        var history = [];
        var enabled = true;

        function log(prefix){
            console.log(prefix + '---------------历史记录------------------');
            console.log(prefix + 'index:' + currentIndex);
            console.log(history);
        }

        function show(){
            enabled = false;
            funs.init($.extend({}, history[currentIndex], {categorySqlSources: funs.getBaseSqlSources()}));
        }

        return {
            record: function(){
                if(enabled){
                    //如果当前位置不是最后，就需要把后面的都清空
                    if(currentIndex != (history.length - 1)){
                        history.splice(currentIndex + 1);
                    }
                    if(history.length == HISTORY_SIZE){
                        //删除第一个
                        history.splice(0, 1);
                        currentIndex--;
                    }
                    history.push(funs.record());
                    currentIndex++;
                    log('记录 - ');
                }
                enabled = true;
            },
            //撤销
            undo: function(){
                if(currentIndex > 0){
                    currentIndex--;
                    show();
                    log('撤销 - ');
                } else {
                    nsalert('已经到头了，无法进行撤销', 'warning');
                }
            },
            //重做
            redo: function(){
                if(currentIndex < (history.length - 1)){
                    currentIndex++;
                    show();
                    log('重做 - ');
                } else {
                    nsalert('已经到头了，无法进行重做', 'warning');
                }
            },
            reset: function(){
                currentIndex = 0;
                history.splice(1);
                show();
            }
        }
    };

    /**
     * 初始化
     *
     * @param options
     * @returns {{initData: initData}}
     * @constructor
     */
    var Init = function(options){
        var _data;
        var _categorySqlSources;
        //选择数据源
        var chooseTable = new Table(options.choose);
        //加工结果
        var resultTable = new Table(options.result);
        //方法控制
        var methodContext = MethodContext(options, chooseTable);

        var history = History({
            record: getSaveObj,
            init: initData,
            getBaseSqlSources: function(){
                return _categorySqlSources;
            }
        });

        //绑定事件
        function bindEventBus(){
            //选中数据源
            eventbus.on(EVENT.chooseCheck, function(){
                //获取所有选中的数据源，重新执行加工方法和计算方法
                //更新加工后的数据
                console.log('选择数据源改变');
                updateResult();
            });
            //方法变化，重新计算
            eventbus.on(EVENT.dressupChange, function(){
                //获取所有选中的数据源，重新执行加工方法和计算方法
                //更新加工后的数据
                console.log('dressup 方法改变');
                updateResult();
            });
            eventbus.on(EVENT.calculateChange, function(){
                //获取所有选中的数据源，重新执行加工方法和计算方法
                //更新加工后的数据
                console.log('calculate 方法改变');
                updateResult();
            });
        }

        //更新加工结果
        function updateResult(){
            //计算加工结果
            var result = methodContext.calculateMethod();
            var currentRow = resultTable.getRows();
            //保留加工结果原有的复选框选中状态
            for (var i in result) {
                for (var j in currentRow) {
                    if (result[i].id == currentRow[j].id) {
                        result[i].isShow = currentRow[j].isShow;
                    }
                }
            }
            //加工结果新增加的行复选框默认为选中
            for (var i in result) {
                if (typeof(result[i].isShow) == 'undefined') {
                    result[i].isShow = 1;
                }
            }
            //设置结果行
            resultTable.setRows(result);
            //计算后需要保持原来table行选中状态
            resultTable.keepSelect();
            //保持方法的选中状态
            methodContext.keepSelect();
            //记录历史
            //history.record();
        }

        //初始化
        function initDataById(id){
            //获取数据
            Ajax.data('/reportSource/getById', {id: id}, function(data){
                initData(data);
                //绑定事件
                bindEventBus();
            });
        }

        //初始化
        function initData(data){
            _data = data;
            //只需要默认的数据源和方法，就能计算出结果
            if(data.categorySqlSources){
                _categorySqlSources = data.categorySqlSources;
                var tables = JSON.parse(data.categorySqlSources);
                for(var i = 0; i < tables.length; i++){
                    var table = tables[i];
                    for(var j = 0; j < table.columns.length; j++){
                        //备注值优先
                        if(table.columns[j].remark){
                            table.columns[j].name = table.columns[j].remark;
                        }
                    }
                }
                chooseTable.setRows(tables);
            }
            //初始化方法
            if(data.methods){
                methodContext.initMethods(JSON.parse(data.methods));
            }
            //处理选中状态
            if(data.selectTableIds){
                chooseTable.setSelectTableIds(JSON.parse(data.selectTableIds));
            }
            //加载选择数据源
            chooseTable.load();
            //更新所有数据
            updateResult();

            //处理'加工后'tab页表格的选中状态
            if (data.sqlSources) {
                var sqlSources = JSON.parse(data.sqlSources);
                var names = [];
                for (var n in sqlSources) {
                    if (sqlSources[n].isShow == '1') {
                        names.push(sqlSources[n].name);
                    }
                }
                resultTable.setSelectResultIsShow(names);
            }
            resultTable.load();
        }

        //获取保存对象
        function getSaveObj(){
            var saveObj = $.extend(true, {}, _data, {categorySqlSources: ''});
            //设置选中的
            saveObj.selectTableIds = JSON.stringify(chooseTable.getSelectTableIds());
            //加工结果
            saveObj.sqlSources = JSON.stringify(resultTable.getRows());
            //加工方法
            saveObj.methods = JSON.stringify({
                dressups: methodContext.dressup.getMethods(),
                calculates: methodContext.calculate.getMethods()
            });
            return saveObj;
        }

        //保存
        function save(){
            var saveObj = getSaveObj();
            console.log(JSON.stringify(saveObj, null, 4));
            //保存到数据库
            Ajax.data('/reportSource/save', saveObj, function(data){
                nsalert('保存成功', 'success');
            },{method:'post'});
        }

        return {
            //历史记录
            //history: history,
            //根据报表ID初始化数据，保护类别数据源和当前报表的加工方法和加工结果处理
            initData: initDataById,
            update: updateResult,
            save: save,
            //选择数据源
            onChooseTableChecked: function(row, state, value){
                TableCommon.filterData(chooseTable.getRows(),
                    function(r){
                        return r.id == row.id;
                    },
                    function(r){
                        r.checkedFlag = (state == 'selected' ? 1: 0);
                        eventbus.emit(EVENT.chooseCheck);
                });
            },
            //所有表格的点击事件
            onSingleSelectHandler: function(event){
                var row = nsTable.getSingleRowSelectedData(event.tableID);
                switch (event.tableID){
                    case options.choose.table:
                        chooseTable.loadColumns(row.id, 'id');
                        break;
                    case options.result.table:
                        resultTable.loadColumns(row.name);
                        break;
                    case options.dressup.table:
                    case options.calculate.table:
                        methodContext.showMethodForm(row, event.tableID);
                        break;
                }
            },
            initMethodForm: function(methodForm, methodId){
                methodContext.initMethodForm(methodForm, methodId);
            },
            //获取方法配置界面中，下拉数据源数据
            getSelectDatasource: function(){
                return methodContext.getSelectDatasource();
            },
            methodContext: methodContext,
            showMethodDescription: methodContext.showDescription,
            moveUp: methodContext.moveUp,
            moveDown: methodContext.moveDown,
            addMethod: methodContext.addMethod,
            editMethod: methodContext.editMethod,
            deleteMethod: methodContext.deleteMethod,
            isDialog: function(){return false;},
            guid: guid
        }
    };
    return Init;
})(window.eventbus);