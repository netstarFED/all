/*
 * @Desription: 模板编辑器配置文件
 * @Author: netstar.cy
 * @Date: 2019-12-26 13:26:00
 * @LastEditTime : 2019-12-30 22:12:00
 * 包含:
 *      apis:array 服务器端接口 
 */

const NetstarTPEditorConfig = {};
//需要别的接口使用的接口返回数据
NetstarTPEditorConfig.data = {}; 
//服务器端接口配置
NetstarTPEditorConfig.urls = [
    //controllerlist 获取所有的controller
    {
        /** 
         * 说明:     获取所有的controller
         * JSON:     formdatasources.controllerlist.json 20191226
         * DEMO:     NetstarTPEditor.api.controllerlist.get({ids:'1302894493352849385'}).then(function(res){console.log(res)})
         */
        name: 'controllerlist',
        url: "/formdatasources/controllerlist",
        formatter: function (res) {
            console.log(res);
            var warnList = [];
            let _res = [];
            for (let i = 0; i < res.rows.length; i++) {
                let _data = res.rows[i];
                let _chineseName = _data.chineseName;
                let _englishName = _data.controllerName;
                let _fullName = _chineseName + '(' + _englishName + ')';

                //如果中文名称没传回来就只显示英文名称
                if (typeof (_chineseName) != 'string') {
                    _data.index = i;
                    warnList.push(_data);
                    _fullName = _englishName;
                }

                _res.push({
                    text: _fullName,
                    value: _data.id,
                });
            }
            if (warnList.length > 0) {
                console.warn('controllerlist数据载入错误', warnList);
            }
            return _res;
        }
    },
    //controller 获取controller所属的vo和method
    {
        /** 
         * 说明:     获取controller所属的vo和method
         * JSON:     formdatasources.controller.json
         * DEMO:     NetstarTPEditor.api.controller.get({ids:'1302894493352849385'}).then(function(res){console.log(res)})
         * 数据源:   {success:true, rows:[
         *              //controller
         *              "controllerName":"AlarmRecordController"
         *              "chineseName":"告警记录",
         *              "id": "1302894493352849385"
         *              ...
         *              
         *              voList: [{
         *                  //vo
         *                  fieldList:[{
         *                      //字段
         *                      "fieldName": "whenModified",
         *                      "chineseName": "修改时间",
         *                      "description": "修改时间",
         *                      "dataTypeName": "Date",
         "                      "id": "1302894493352880105"
        *                  }],
        *                  methodList:[{
        *                      //方法
        *                      "methodParams":[{
        *                          //参数
        *                          "paramName": "userId",
        *                          "dataTypeName": "Long",
        *                      }]  
        *                      "url": "alarmRecord/getByIdAndUserId",
        *                      "chineseName": "根据告警记录id获取详情",
        *                      "methodName": "getByIdAndUserId",
        *                      "httpMethod": "GET",
        *                      "returnTypeName": "com.netstar.response.ObjectResponse\u003ccom.netstar.alarm.vo.AlarmRecordVO\u003e",
        *                  }]
        *              }]
        *          ]}
        * return: object {
        *      methodsList:array {id, text, children}
        *      dataSourceList_options:array  {id, text, children}
        *      methodsUrls:array {id, url, name, controllerName, }
        * }
        **/
        name: 'controller',
        url: "/formdatasources/controller",
        type: 'GET',
        formatter: function (res) {
            var _res = {
                methodsList: [],
                dataSourceList_options: [],
                methodsUrls: [],
            }
            if (res.rows) {
                var dataVOmapList = res.rows;
                var arrMethods = [];
                var arrField = [];
                var voMaps = res.rows;

                var resControllerList = [];
                var resVoList = [];
                var resMethodList = [];
                var resFieldList = [];
                var resFieldListByVo = [];
                var resmethodListByVo = [];
                var fieldVoSubdata = [];
                var methodVoSubdata = [];
                var fieldByVoId = {};
                var methodByVoId = {};
                for (var i = 0; i < voMaps.length; i++) {
                    var voMap = voMaps[i];
                    var _voMap = {
                        id: voMap.id,
                        chnName: voMap.chineseName,
                        enName:voMap.controllerName,
                        children: voMap.voList,
                    }
                    resControllerList.push(_voMap);  //contrller列表
                    var _methodMap = {
                        id: voMap.id,
                        chnName: voMap.chineseName,
                        enName:voMap.controllerName,
                        children : [],
                    }
                    var _fieldMap = {
                        id: voMap.id,
                        chnName: voMap.chineseName,
                        enName:voMap.controllerName,
                        children : [],
                    }

                    var voLists = voMap.voList;
                    //对VO下属的信息遍历，包含字段和方法
                    for (var j = 0; j < voLists.length; j++) {
                        var voList = voLists[j];
                        // 所有children field/method
                        var _voList = {
                            id: voList.id,
                            chnName: voList.chineseName ? voList.chineseName : "无名称",
                            enName: '',
                            controllerName:_voMap.enName,
                            children: []
                        };
                        resVoList.push(_voList);
                        // 所有字段
                        var _voList2 = {
                            id: voList.id,
                            chnName: voList.chineseName ? voList.chineseName : "无名称",
                            enName: '',
                            controllerName:_voMap.enName,
                            children: []
                        };
                        // 所有方法
                        var _voList3 = {
                            id: voList.id,
                            chnName: voList.chineseName ? voList.chineseName : "无名称",
                            enName: '',
                            controllerName:_voMap.enName,
                            children: []
                        };
                        
                        //方法遍历 methodList
                        if(voList.methodList){
                            var methodLists = voList.methodList;
                            for (var k = 0; k < methodLists.length; k++) {
                                var methodData = methodLists[k];
                                var _methodData = {
                                    id: methodData.id,
                                    chnName: methodData.chineseName,
                                    enName: methodData.url,
                                    url:methodData.url,
                                    voListName: _voList.chnName,
                                    controllerName:_voList.controllerName,
                                    original: methodData
                                };
                                _voList.children.push(_methodData);                 // field/method
                                resMethodList.push(_methodData);                    // 所有method
                                _voList3.children.push(_methodData);                // 当前vo中method
                            }
                            // _voMap.children.push(_voList);
                        }
                        //字段遍历 fieldList
                        if(voList.fieldList){
                            var fieldList  = voList.fieldList;
                            for (var m = 0; m < fieldList.length; m++) {
                                var fieldData = fieldList[m];
                                var _fieldData = {
                                    id: fieldData.id,
                                    chnName: fieldData.chineseName,
                                    enName: fieldData.fieldName,
                                    voListName: _voList.chnName,
                                    controllerName:_voList.controllerName,
                                    original: fieldData
                                };
                                _voList.children.push(_fieldData);                  // field/method
                                resFieldList.push(_fieldData);                      // 所有field
                                _voList2.children.push(_fieldData);                 // 当前vo中field
                            }
                            // _voMap.children.push(_voList);
                        }
                        if(_voList2.children.length > 0){
                            resFieldListByVo.push(_voList2);                        // 当前vo中field
                            if(typeof(fieldByVoId[_voList2.id]) == "undefined"){
                                fieldVoSubdata.push({
                                    id : _voList2.id,
                                    chnName : _voList2.chnName,
                                });
                                fieldByVoId[_voList2.id] = _voList2.children;
                            }
                        }
                        if(_voList3.children.length > 0){
                            resmethodListByVo.push(_voList3);                       // 当前vo中method
                            if(typeof(methodByVoId[_voList3.id]) == "undefined"){
                                methodVoSubdata.push({
                                    id : _voList3.id,
                                    chnName : _voList3.chnName,
                                });
                                methodByVoId[_voList3.id] = _voList3.children;
                            }
                        }
                    }
                    // arrMethods.push(_voMap);
                    // arrField.push(dataVOmapList[i].voList)
                    if(resFieldListByVo.length > 0){
                        _fieldMap.children = resFieldListByVo;
                        arrField.push(_fieldMap);
                    }
                    if(resmethodListByVo.length > 0){
                        _methodMap.children = resmethodListByVo;
                        arrMethods.push(_methodMap);
                    }
                }
                _res.methodsList = arrMethods;                  // 根据controler获取方法
                _res.dataSourceList_options = arrField;         // 根据controler获取字段
                _res.methodListByControler = arrMethods;                  // 根据controler获取方法
                _res.fieldListByControler = arrField;         // 根据controler获取字段
                // var dealArr = [].concat.apply([], arrField);
                _res.urls = resMethodList;                      // 所有的方法列表
                _res.controllerList = resControllerList;        // 所有的controlers
                _res.voList = resVoList;                        // 所有的vo
                _res.fieldList = resFieldList;                  // 所有的字段列表
                _res.fieldListByVo = resFieldListByVo;          // 通过vo获取的字段
                _res.methodList = resMethodList;                // 所有的方法列表
                _res.methodListByVo = resmethodListByVo;        // 通过vo获取的方法

                _res.fieldVoSubdata = fieldVoSubdata;
                _res.fieldByVoId = fieldByVoId;
                _res.methodVoSubdata = methodVoSubdata;
                _res.methodByVoId = methodByVoId;     
            }

            // 根据字段类型处理默认的字段配置
            for(let fi = 0; fi<_res.fieldList.length; fi++){
                // console.log(_res.fieldList[fi].original);
                let fieldData = _res.fieldList[fi]
                let original = fieldData.original;
                let defaultAttrs = {};
                switch(original.dataTypeName){
                    //日期
                    case "Date":
                        defaultAttrs.form = NetstarTPEditorConfig.data.getComponents.types.form.date;
                        defaultAttrs.grid = NetstarTPEditorConfig.data.getComponents.types.grid.datetime;
                        break;
                    //整数一般是选择
                    case "Integer":
                        defaultAttrs.form = NetstarTPEditorConfig.data.getComponents.types.form.select;
                        defaultAttrs.grid = NetstarTPEditorConfig.data.getComponents.types.grid.subdataText;
                        break;
                    case "String":
                    case "Long": //这个目前只能当长字符串处理
                    default:
                        defaultAttrs.form = NetstarTPEditorConfig.data.getComponents.types.form.text;
                        defaultAttrs.grid = NetstarTPEditorConfig.data.getComponents.types.grid.grid;
                        break;
                }

                let allAttrArr = [];
                let allAttrs = {};
                for(let fasI = 0; fasI<defaultAttrs.form.attrArr.all.length; fasI++){
                    // console.log(defaultAttrs.form.attrArr.all[fasI]);
                    let attrObj = defaultAttrs.form.attrArr.all[fasI];
                    let _attr = $.extend(true, {}, attrObj);
                    allAttrs[attrObj.id] = $.extend(true, {}, attrObj);
                    // allAttrArr
                }
                fieldData.defaultAttrs = defaultAttrs;
            }
            return _res;
        }
    },
    //getComponents 获取所有组件配置 panel form btns grid template 
    {
        /** 
         * 说明:     获取所有组件
         * JSON:     formdesigner.controls.getList
         * DEMO:     NetstarTPEditor.api.getComponents.get().then(function(res){console.log(res)})
         * 数据源:   {success:true, rows:[]
         * return:  
         * [{
         *      id:'',
         *      type:''   form/grid/page/
         *      name:''
         *      chineseName:'',
         *      formComponents:[],
         *      icon:'',
         * }]
         * 
         * [//S所有表单的   [//文本 {单个组件}]  [数字]   ]
         * 
         *formComponents: [
         *      text:[
         *        id:{},  
         *      ],
         *      number:[],
         * ]
         **/
        name: 'getComponents',
        url: "/formdesigner/controls/getList",
        formatter: function (res) {
            
            //组件类型定义 
            const COMPONENTTYPE = {
                "0": "panel",
                "1": "btns",
                // "2":"", 暂时没有这个
                "4": "form",
                "5": "template",
                "6": "grid",
            }

            //组件信息处理方法
            const getComponetParams = function (resData) {

                let _params = {};
                //原始值
                _params.chnName = resData.chnName;
                _params.enName = resData.enName;
                _params.componentType = COMPONENTTYPE[resData.controlCateId];

                //加工后的值
                _params.name = _params.enName;
                _params.fullName = _params.componentType + '-' + _params.enName; //为保证名称唯一，而不同类型的组件有同样名称 所以name由类型和enName共同组成


                //转换config为配置参数
                let config = {}; //resData.description: { operator: {},//操作属性 data: {},//数据属性 };


                try {
                    config = JSON.parse(resData.description);
                } catch (e) {
                    console.error("description参数配置错误，转换JSON失败", resData);
                    _params.originConfig = config;
                    return _params;
                }

                _params.originConfig = config;
                _params.attrs = {};
                _params.attrArr = {
                    all: [],
                    operator: [],
                    data: []
                };

                /** 
                 * originConfig: {operator:{}, data:{}} 分别存贮操作属性和数据属性 
                 **/
                $.each(config.operator, function (key, value) {
                    var _component = getEditorFormComponent(key, value, resData);
                    //补充面板类型和分组属性
                    _component.netstarTPeditorPanelType = _params.componentType;
                    _component.netstarTPeditorPanelGroupType = 'operator';

                    _params.attrs[key] = _component;
                    _params.attrArr.all.push(_component);
                    _params.attrArr.operator.push(_component);
                })
                $.each(config.data, function (key, value) {
                    var _component = getEditorFormComponent(key, value, resData);
                    _component.panelType = _params.componentType;
                    _component.panelGroupType = 'data',

                        _params.attrs[key] = _component;
                    _params.attrArr.all.push(_component);
                    _params.attrArr.data.push(_component);
                })
                return _params;
            }

            /**
             * 获取编辑状态下的表单组件配置
             * @param {string} name  组件名称 例如 id/type
             * @param {object} config 编辑组件描述，例如:{
             *      chineseName:    "组件类型"       //中文名称 =>label
             *      validType:      "string"        //返回的数据类型 =>variableType
             *      toolType:       "select"        //操作类型 => type
             *      default:        "text"          //默认值 => value
             *      required:       true            //是否必填 => rules
             * }
             * @returns _component:object 表单组件属性配置{id,label,type,variableType, rules}
             */
            const getEditorFormComponent = function (name, config, resData) {

                //写错了validType 写成了 vaildType，改成对的
                if (typeof (config.validType) == 'undefined' && typeof (config.vaildType) == 'string') {
                    config.validType = config.vaildType;
                }

                var _component = {
                    id: name,
                    label: config.chineseName,
                    originConfig: config,
                    type: config.toolType,
                    variableType: config.validType
                }

                // 添加默认值
                if(typeof(config.default) != "undefined"){
                    _component.value = config.default;
                }
                // 添加只读
                if(typeof(config.disabled) != "undefined"){
                    _component.disabled = config.disabled;
                }
                // 添加changeHandlerVals
                if(typeof(config.changeHandlerVals) != "undefined"){
                    _component.changeHandlerVals = config.changeHandlerVals;
                }

                //对于有些常用属性默认添加variableType
                switch (config.chineseName) {
                    case 'ajax':
                        _component.variableType = typeof (config.validType) == 'undefined' ? 'object' : config.validType;
                        break;
                }
                //判断是否有错误配置
                $.each(_component, function (key, value) {
                    if (typeof (value) == 'undefined') {
                        console.error('配置错误，缺少' + key, config, resData)
                    }
                })
                //必填转化为输入规则
                if (config.required) {
                    _component.rules = 'required';
                }


                /** 
                 * 有些组件类型是基本组件类型中没有的，需要进一步加工
                 * 需要处理的参数如下：{
                 *      chineseName:'标签',  //编辑状态下的label
                 *      validType:'string',  //编辑完成后需要转换的数据类型 并转换为该类型
                 *      toolType:'text',     //编辑方式 包括可以直接转换成表单组件类型的，也包括需要单独处理的 
                 *                          包括： 
                 *                              所有选择类的要添加 textField valueField;
                 *                              check:勾选框 multi-select:多选 
                 *                              select: 每个组件都有一个需要根据当前数据生成组件类型 例如form组件的typet
                 * }
                 **/
                switch (config.toolType) {

                    //勾选 只有一个复选框返回true的 组件
                    case 'check':
                        _component.type = "checkbox";
                        var subdata = [{
                            value: "1",
                        }]
                        _component.subdata = subdata;
                        if (config.default == "") {
                            _component.value = "";
                        } else if (config.default == true) {
                            _component.value = "1";
                        } else {
                            _component.value = "";
                        }
                        break;

                        //多选下拉框
                    case "multi-select":
                        _component.type = "select";
                        _component.subdata = config.subdata;
                        _component.textField = "text";
                        _component.valueField = "value";
                        _component.selectMode = "multi";
                        break;

                        //下拉
                    case 'select':
                        _component.textField = "text";
                        _component.valueField = "value";
                        _component.subdata = config.subdata;
                        break;
                }
                return _component;

            }

            //格式化返回结果
            let _res = {
                componentArr: [], //组件信息 array
                components: {}, //组件信息 object
                typeArr: {}, //根据类型分类后的 array  {panel:[], btns:[], form:[], template:[], grid:[]}
                types: {}, //根据类型分类后的 object {panel:{}, btns:{}, form:{}, template:{}, grid:{}}
            };
            for (let key in COMPONENTTYPE) {
                let value = COMPONENTTYPE[key];
                _res.types[value] = {};
                _res.typeArr[value] = [];
            }

            //重新组织组件信息
            for (var i = 0; i < res.rows.length; i++) {
                let resdata = res.rows[i];
                let _params = getComponetParams(resdata);

                //数组: 所有/类型
                _res.componentArr.push(_params);
                _res.typeArr[_params.componentType].push(_params);
                //对象：全名/类型.name
                _res.components[_params.fullName] = _params;
                _res.types[_params.componentType][_params.name] = _params;
            }

            //组件信息中的type应该改为该类型的所有组件 需要处理的组件类型包含 btns form grid panel
            var typeAttrArray = [{
                    name: 'btns',
                    typeAttrName: 'defaultMode',
                    typeKey: 'id'
                },
                {
                    name: 'form',
                    typeAttrName: 'type',
                    typeKey: 'id'
                },
                {
                    name: 'grid',
                    typeAttrName: 'columnType'
                },
                {
                    name: 'panel',
                    typeAttrName: 'type'
                }
            ];
            var subdatas = {};
            for (let typeI = 0; typeI < typeAttrArray.length; typeI++) {
                var name = typeAttrArray[typeI].name;
                var typeAttrName = typeAttrArray[typeI].typeAttrName;
                var typeAttrKey = typeAttrArray[typeI].typeKey;
                var attrArr = _res.typeArr[name];
                var typeSubdataArr = [];

                //第一次循环生成类型的subdata
                for (var attrI = 0; attrI < attrArr.length; attrI++) {
                    var attrConfig = attrArr[attrI];
                    var subdataObj = {
                        text: attrConfig.chnName,
                        value: attrConfig.enName,
                    };
                    typeSubdataArr.push(subdataObj);
                }
                //第二次循环插入subdata
                for (var attrI = 0; attrI < attrArr.length; attrI++) {
                    var attrConfig = attrArr[attrI].attrs[typeAttrName];
                    if (typeof (attrConfig) == 'object') {
                        attrConfig.subdata = typeSubdataArr;
                    } else {
                        console.error('组件配置信息错误：找不到类型定义 ' + typeAttrName, attrConfig);
                    }
                }

            }
            NetstarTPEditorConfig.data.getComponents = _res; //这个组件信息需要其他接口调用
            return _res;

        }
    },
    //user 获取用户信息
    {
        /**  
         * 说明:    获取当前用户信息
         * JSON:    servletcontexts.properties.json
         * DEMO:    NetstarTPEditor.api.user.get().then(function(res){console.log(res)})
         */
        name: 'user',
        url: '/servletContexts/properties',
        type: 'GET',
    },
    //templateList 模板列表
    {
        /** 
         * 说明： 获取所有模板
         * JSON:  formdesigner.formTemplates.getList.json
         * DEMO:  NetstarTPEditor.api.templateList.get().then(function(res){console.log(res)})
         */
        name: 'templateList',
        url: '/formdesigner/formTemplates/getList',
        type: 'POST',
        formatter: function (res) {
            let _res = [];
            for (let i = 0; i < res.rows.length; i++) {
                let resData = res.rows[i];
                var config = {};
                var isOutConfig = true;
                try {
                    config = JSON.parse(resData.config);

                } catch(error) {
                    config = {
                        templateName: '配置文件错误'
                    };
                    console.error('模板配置文件错误', resData);
                    isOutConfig = false;
                }
                var _data = {
                    id: resData.id,
                    enName: resData.templateName,
                    chnName: config.template,
                    value: config,
                }
                if (isOutConfig) {
                    _res.push(_data);
                }
            }
            return _res;
        },
    },
    //pageList 页面列表
    {
        /** 
         * 说明： 获取所有页面
         * JSON:  formdesigner.formTemplates.getList.json
         * DEMO:  NetstarTPEditor.api.pageList.get().then(function(res){console.log(res)})
         */
        name:'pageList',
        url: '/formdesigner/formControls/getList',
        data:{type:'page'},
        type: 'POST',
        formatter:function(res){
            let _res = [];
            for(let i=0; i<res.rows.length; i++){
                
                let resData = res.rows[i];
                let _config = {};
                try{
                    _config = JSON.parse(resData.config);
                }catch(error){
                    console.error('页面配置文件出错');
                }
                let _data = {
                    enName:_config.package,
                    chnName:_config.title,
                    id:resData.id,
                    original:resData,
                };
                
                _data.config = _config;
                _res.push(_data);
            }
            return _res;
        }
    },
    //pageListByPage 页面列表
    {
        /** 
         * 说明： 分页获取页面
         * JSON:  formdesigner.formTemplates.getPage.json
         * DEMO:  NetstarTPEditor.api.pageListByPage.get({start:1, length:10, type:"page"}).then(function(res){console.log(res)})
         */
        name:'pageListByPage',
        url: '/formdesigner/formControls/getPage',
        type: 'POST',
        formatter:function(res){
            let _res = [];
            for(let i=0; i<res.rows.length; i++){
                
                let resData = res.rows[i];
                let _config = {};
                try{
                    _config = JSON.parse(resData.config);
                }catch(error){
                    console.error('页面配置文件出错');
                }
                let _data = {
                    enName:_config.package,
                    chnName:_config.title,
                    id:resData.id,
                    original:resData,
                };
                
                _data.config = _config;
                _res.push(_data);
            }
            return _res;
        }
    },
];