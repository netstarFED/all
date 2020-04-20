/*
 * @Author: netstar.lyw
 * @Date: 2020-04-03
 * @LastEditors: netstar.lyw
 * @LastEditTime: 2020-04-03
 * @Desription: 体检登记模板
 * 此模板通过component的name配置设置容器位置  不是一个可多用的模板是单独为体检登记写的
 */
NetstarTemplate.templates.physicalsReport = (function ($) {
    var configs = {};
    // config管理
    var configManage = {
        // 验证
        validConfig : function(config){
            //如果开启了debugerMode
            var isValid = true;
            if(debugerMode){
               //验证配置参数是否合法
               isValid = NetstarTemplate.commonFunc.validateByConfig(config);
            }
            if(!isValid){
                isValid = false;
                nsalert('配置文件验证失败', 'error');
                console.error('配置文件验证失败');
                console.error(config);
            }
            return isValid
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                defaultComponentWidth : '33%',
                serverData : {},
                pageData : {},
                closeValidSaveTime : 500,
                title : '',
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置配置
        setConfig : function(config){
            // 设置关闭是否保存方法
            if(config.closeValidSaveTime > -1){
                config.beforeCloseHandler = baseFuncManage.closePageBeforeHandler;
            }
            // 设置各组件配置 通过name
            var components = config.components;
            var componentsByName = {};
            var componentsById = {};
            for(var componentI=0; componentI<components.length; componentI++){
                var componentData = components[componentI];
                // keyField
                var componentKeyField = componentData.keyField ? componentData.keyField : 'root';
                // parent
                var parentField = componentData.parent ? componentData.parent : 'root';
                // params 暂时无用
                componentData.params = typeof(componentData.params)=='object' ? componentData.params : {};
                // 组件id
                var componentId = componentData.id;
                if(typeof(componentId) == "undefined"){
                    componentId = config.id + '-' + componentData.name + '-' + componentI;//定义容器id
                }
                componentData.id = componentId;
                componentData.package = config.package;
                componentData.parentField = config.parentField;
                componentData.componentKeyField = config.componentKeyField;
                // 这里配置无用 其它模板有配置所以配置  根据组件类型存储信息
                if(config.componentsConfig[componentData.type]){
                    config.componentsConfig[componentData.type][componentData.id] = componentData; 
                }
                // 名字
                var componentName = componentData.name;
                componentsByName[componentName] = componentData;
                componentsById[componentId] = componentData;
			}
            config.componentsByName = componentsByName;
            config.componentsById = componentsById;
            // 设置草稿箱
            if(config.draftBox && config.draftBox.isUse == true){
                if(typeof(config.componentsByName.btns) == "undefined"){
                    config.componentsByName.btns = {};
                }
                var btns = config.componentsByName.btns;
                if(config.draftBox.isUseSave){
                   var draftBoxSaveBtn = {
                        btn : {
                        text : '保存草稿',
                        isReturn : true,
                        handler : (function(_config){
                                return function(){
                                    NetstarTemplate.draft.btnManager.save(_config, function(obj){
                                        var package = obj.ajaxConfig.plusData.saveData.formName;
                                        var pageConfig = NetstarTemplate.templates.configs[package];
                                        if(!pageConfig){ return false; }
                                        if(pageConfig.draftBox.closeOrClear){
                                            NetstarTemplate.templates.physicalsReport.clearPageData(pageConfig);
                                        }
                                    });
                                }
                            })(config),
                        },
                        functionConfig : {},
                   }
                   btns.field.push(draftBoxSaveBtn);
                   if($.isArray(btns.outBtns)){
                       btns.outBtns.push(draftBoxSaveBtn);
                   }
                }
                var draftBoxBtn = {
                    btn : {
                        text : '草稿箱',
                        isReturn : true,
                        handler : (function(_config){
                            return function(){
                                NetstarTemplate.draft.btnManager.show(_config);
                            }
                        })(config),
                   },
                   functionConfig : {},
                }
                btns.field.push(draftBoxBtn);
                if($.isArray(btns.outBtns)){
                    btns.outBtns.push(draftBoxBtn);
                }
                NetstarTemplate.draft.setConfig(config); // 设置草稿箱相关参数
            }
        },
        getConfig : function(package){
            var _configs = configs[package];
            if(_configs){
                return _configs.config;
            }else{
                return false;
            }
        }
    }
    // 基础方法管理
    var baseFuncManage = {
        //此方法获取到当前模板页的配置定义和当前界面操作值
        dialogBeforeHandler : function(data,templateId){
            var templateConfig = NetstarTemplate.templates.physicalsReport.data[templateId].config;
            data.config = templateConfig;
            data.value = dataManage.getPageData(templateConfig);
            return data;
        },
        //此方法是在调用ajax执行之前的回调
        ajaxBeforeHandler : function(handlerObj,templateId){
            return handlerObj;
        },
        //此方法是在调用ajax完成之后需要对当前界面执行的逻辑
        ajaxAfterHandler : function(data,templateId,ajaxPlusData){
            var templateConfig = {};
            if(templateId){
                templateConfig = NetstarTemplate.templates.physicalsReport.data[templateId].config;
            }else{
                if(NetstarUI.labelpageVm.labelPagesArr[NetstarUI.labelpageVm.currentTab]){
                    var packageName = NetstarUI.labelpageVm.labelPagesArr[1].config.package;
                    templateConfig = NetstarTemplate.templates.configs[packageName];
                }
            }

            if(typeof(ajaxPlusData)=='undefined'){
                ajaxPlusData = {};
            }
            // templateConfig.pageInitDefaultData = getPageData(templateConfig, false, false); // 页面初始化数据改变
            if(templateConfig.closeValidSaveTime > -1){
                setTimeout(function(){
                    templateConfig.pageInitDefaultData = dataManage.getPageData(templateConfig, false, false); // 页面初始化数据改变
                }, templateConfig.closeValidSaveTime);
            }
            if(ajaxPlusData.isCloseWindow === true){
                //如果按钮上配置了关闭当前界面直接执行关闭操作
                NetstarUI.labelpageVm.removeCurrent();
            }else{
                if(!$.isArray(data)){
                    //返回值是对象 可以根据返回状态去处理界面逻辑
                    switch(data.objectState){
                        case NSSAVEDATAFLAG.DELETE:
                            //删除
                            templateConfig.serverData = {};
                            clearByAll(templateConfig);
                        break;
                        case NSSAVEDATAFLAG.EDIT:
                            //修改
                            templateConfig.serverData = nsServerTools.setObjectStateData(data);//改变服务端数据值，删除ojbectState为-1的数据
                            NetStarUtils.deleteAllObjectState(templateConfig.serverData);//删除objectState状态值
                            templateConfig.pageData = NetStarUtils.deepCopy(templateConfig.serverData);
                            clearByAll(templateConfig);
                            initComponentByFillValues(templateConfig);
                        break;
                        case NSSAVEDATAFLAG.ADD:
                            //新增
                            templateConfig.serverData = {};
                            clearByAll(templateConfig);
                        break;
                        case NSSAVEDATAFLAG.VIEW:
                            //刷新
                            templateConfig.serverData = nsServerTools.setObjectStateData(data);//改变服务端数据值，删除ojbectState为-1的数据
                            NetStarUtils.deleteAllObjectState(templateConfig.serverData);//删除objectState状态值
                            templateConfig.pageData = NetStarUtils.deepCopy(templateConfig.serverData);
                            clearByAll(templateConfig);
                            initComponentByFillValues(templateConfig);
                        break;
                    }
                }else{
                    //返回值是数组 没法根据objectState去处理逻辑
                }
            }
        },
        loadPageHandler : function(){   
        },
        closePageHandler : function(){

        },
        closePageBeforeHandler : function(package){
            var templateConfig = configManage.getConfig(package);
            if(!templateConfig){
                return false;
            }
            function delUndefinedNull(obj){
                if($.isArray(obj)){
                for(var i=0; i<obj.length; i++){
                    delUndefinedNull(obj[i]);
                }
                }else{
                for(var key in obj){
                    if(typeof(obj[key]) == "object"){
                        delUndefinedNull(obj[key]);
                    }else{
                        if(obj[key] === '' || obj[key] === undefined){
                            delete obj[key];
                        }
                    }
                }
                }
            }
            var pageData = dataManage.getPageData(package, false, false);
            delUndefinedNull(pageData)
            var pageInitDefaultData = templateConfig.pageInitDefaultData ? templateConfig.pageInitDefaultData : templateConfig.serverData;
            delUndefinedNull(pageInitDefaultData)
            return {
                getPageData : pageData,
                serverData : pageInitDefaultData,
            }
        }
    }
    // 组件管理
    var componentManage = {
        // 按钮
        btns : {
            init : function(componentConfig, config){
                var btnConfig = config.componentsByName.btns;
                var btnsObj = {};
                btnsObj[btnConfig.id] = btnConfig;
                NetstarTemplate.commonFunc.btns.initBtns(btnsObj, config);
            }
        },
        // 个人信息
        personal : {
            // 获取数据
            getData : function(componentConfig, isValid, config){
                var photoFileId = componentConfig.personalVue.data
                return photoFileId 
            },
            // 设置数据
            setData : function(data, componentConfig, config){
                
            },
            // 清空数据
            clearData : function(componentConfig, config){
                
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            //html
            html:function(componentConfig,config){
                var id = componentConfig.id + '-personal-search';
                var inputId = componentConfig.id + '-input';
                var selectVoId = componentConfig.id + '-selectVo';
                var html = 
                    '<div id = "'+ id + '">'
                        +'<div class="pt-panel">'
                            +'<div class="search-box">'
                            +'<input type="text" class="pt-form-control" id="'+ inputId + '" placeholder="体检编号" @blur.prevent=\'searchNo()\'>'
                            +'</div>'
                        +'</div>'
                        +'<div class="pt-panel">'
                            +'<div class="user-photo">'
                                +'<img :src="databaseUrl" alt="">'
                            +'</div>'
                            +'<div class="user-photo-eidt">'
                            +' <div class="pt-btn-group">'
                                    +'<button class="pt-btn pt-btn-default" @click="uploadImg()">'
                                        +'<i class="icon icon-image"></i>'
                                    +'</button>'
                                    +'<button class="pt-btn pt-btn-default">'
                                        +'<i class="icon icon-id"></i>'
                                    +'</button>'
                                    +'<button class="pt-btn pt-btn-default" @click=\'clickPhoto()\'>'
                                        +'<i class="icon icon-camera"></i>'
                                    +'</button>'
                                +'</div>'
                        + '</div>'
                        +'</div>'
                        +'<div class="pt-panel">'
                            +'<div class="queue">'
                                +'<div class="pt-btn-group">'
                                   +' <button class="pt-btn pt-btn-default" @click="getPrevious()"><i class="icon icon-arrow-left-o"></i><span>上一位</span></button>'
                                    +'<button class="pt-btn pt-btn-default" @click="getNext()"><span>下一位</span><i class="icon icon-arrow-right-o"></i></button>'
                                +'</div>'
                            +'</div>'
                        +'</div>'
                        +'<div id="'+selectVoId+'"></div>'
                     + '</div>';

                componentConfig.searchId = id;
                componentConfig.selectVoId = selectVoId;
                componentConfig.inputId = inputId;
                return html;
            },
            // 初始化
            init :function(componentConfig, config){
                var id = componentConfig.id;
                var $container = $('#' + id);
                var html = this.html(componentConfig,config)
                $container.html(html)
                this.html(componentConfig,config)
                //拍照+上传+体检搜索
                var personalVue = new Vue({
                    el:"#" + componentConfig.searchId,
                    data:{
                        photoFileId:'',//照片id
                        databaseUrl:""
                    },
                    methods:{
                        //体检编号查询
                        searchNo(){
                            var data = $('#'+ componentConfig.inputId).val();
                            var ajaxConfig = {
                                url: getRootPath() + '/reg/regs/getByRegCode',
                                contentType: 'application/x-www-form-urlencoded',
                                /* contentType: 'application/json', */
                                data: {
                                    regCode: data,
                                    params: ['regType', 'regCombo'],
                                },
                                type: 'POST',
                            }
                            NetStarUtils.ajax(ajaxConfig, function (res) {
                                if(!res.rows){
                                    nsalert('当前编号不存在');
                                }
                            })
                        },
                        //拍照
                        clickPhoto(){
                            var _this = this;
                            NetStarUtil.wangxingTong.websocket({command:'打开摄像头'},function(res){
                                console.log(res);
                                if(res.image){
                                    _this.databaseUrl = res.image
                                    NetStarUtil.wangxingTong.upLoadImage.init(res.image,'pic',function(res){
                                        /* var photoFileId = res.data[0].id
                                        _this.photoFileId = photoFileId */
                                        console.log(res)
      
                                      })
                                }

                            })
                            // console.log(1111)
                        },
                        //上传图片
                        uploadImg(){
                            var _this = this;
                            if(_this.databaseUrl){
                                var base64Url = _this.databaseUrl
                                NetStarUtil.wangxingTong.upLoadImage.init(base64Url,'pic',function(res){
                                  var photoFileId = res.data.id
                                  _this.photoFileId = photoFileId

                                })
                            }
                        },
                        //获取上一位
                        getPrevious(){
                            var ajaxConfig = {
                                url: getRootPath() + '/reg/regs/getPrevious',
                                contentType: 'application/json',
                                data: {
                                },
                                type: 'POST',
                            }
                            NetStarUtils.ajax(ajaxConfig, function (res) {
                                if(!res.rows){
                                    nsalert('当前编号不存在');
                                }
                            })
                        },
                        //获取下一位
                       getNext(){
                            var ajaxConfig = {
                                url: getRootPath() + '/reg/regs/getNext',
                                contentType: 'application/json',
                                data: {
                                },
                                type: 'POST',
                            }
                            NetStarUtils.ajax(ajaxConfig, function (res) {
                                if(!res.rows){
                                    nsalert('当前编号不存在');
                                }
                            })
                       }

                    }
                })
                componentConfig.personalVue =  personalVue
            }
        },
        // 登记信息
        register : {   
            // 获取数据
            getData : function(componentConfig, isValid, config){
                // header
                var headerData = componentConfig.headerVueObj.showData;
                // boder
                var formValue = NetstarComponent.getValues(componentConfig.bodyId, isValid);
                if(!formValue){
                    return formValue;
                }
                formValue = $.extend(false, formValue, headerData);
                var peTypeDataConfig = config.peTypeData;
                formValue.processId = "1330801290317399026";

                formValue.regTypeVOList = $.isArray(componentConfig.peTypeIdResData) ? componentConfig.peTypeIdResData : [];
                console.log('按钮配置' + config)
                return formValue;
            },
            // 设置数据
            setData : function(data, componentConfig, config){
                // header
                var headerValue = {
                    time : data.time,
                    orderNo : data.orderNo,
                    type : data.type,
                }
                componentConfig.headerVueObj.data = headerValue;
                // boder
                NetstarComponent.fillValues(data, componentConfig.bodyId);
            },
            // 清空数据
            clearData : function(componentConfig, config){
                // header
                componentConfig.headerVueObj.data = [];
                // boder
                NetstarComponent.clearValues(componentConfig.bodyId);
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            // 获取header的html
            getHeaderHtml : function(componentConfig){
                var html = '<div class="title">体检登记</div>'
                                + '<div class="pt-panel-header-right">'
                                    + '<span>预约时间：{{showData.time}}</span>'
                                    + '<span>订单编号：{{showData.orderNo}}</span>'
                                    + '<div class="switch">'
                                        + '<div class="switch-item" v-on:click="btnCutaways" :class="{\'current\': showData.groupFlag==0}">'
                                            + '<span>个人</span>'
                                        + '</div>'
                                        + '<div class="switch-item" v-on:click="btnCutawaysBack" :class="{\'current\': showData.groupFlag==1}">'
                                            + '<span>单位</span>'
                                        + '</div>'
                                    + '</div>'
                                    + '<div class="checkbox-box" v-on:click="btnChecked" :class="{\'checked\': showData.peState==1}">'
                                        + '<span>预约</span>'
                                    + '</div>'
                                + '</div>'
                            + '</div>'
                return html;
            },
            getHeaderShowData : function(data, componentConfig){
                var time = '';
                if(data.time){
                    time = moment(data.time).format('YYYY-MM-DD')
                }
                var showData = {
                    time : time,
                    orderNo : data.orderNo,
                    groupFlag : data.groupFlag,
                    peState:data.peState
                };
                return showData;
            },
            // 初始化header
            initHeader : function(componentConfig, data, config){
                var _this = this;
                var headerId = componentConfig.headerId;
                var $header = $('#' + headerId);
                var html = this.getHeaderHtml(componentConfig);
                $header.html(html);
                var value = {
                    time : data.time,
                    orderNo : data.orderNo,
                    groupFlag : 0,
                    peState:1
                }
                var showData = this.getHeaderShowData(value, componentConfig);
                var vueObj = new Vue({
                    el:'#' + headerId,
                    data:{
                        data : value,
                        showData : showData,
                    },
                    watch : {
                        data : function(newData, oldValue){
                            this.showData = _this.getHeaderShowData(newData, componentConfig);
                        }
                    },
                    methods:{
                        //体检登记  单位个人切换
                        btnCutaways: function () {
                            var _this = this;
                            _this.showData.groupFlag = 0;
                        },
                        btnCutawaysBack: function () {
                            var _this = this;
                            _this.showData.groupFlag = 1;
                        },
                        //体检登记 预约勾选
                        /* 1是预约 */
                        btnChecked: function () {
                            var _this = this;
                            if (_this.showData.peState == 1) {
                                _this.showData.peState = 0;
                            } else {
                                _this.showData.peState = 1;
                            }
                        },
                    }
                })
                componentConfig.headerVueObj = vueObj;
            },
            // 初始化表单
            initForm : function(componentConfig, data, config){
                var field = componentConfig.field;
                for(var i=0; i<field.length; i++){
                    field[i].packageName = config.package;
                }
                var formConfig = {
                    id: componentConfig.bodyId,
                    defaultComponentWidth: "33%",
                    isSetMore: false,
                    form : field,
                }

                NetstarComponent.formComponent.show(formConfig, data);
            },
            // 初始化
            init : function(componentConfig, config){
                console.log(componentConfig);
                var id = componentConfig.id;
                var headerId = id + '-header';
                var bodyId = id + '-body';
                // 添加容器
                var html = '<div class="pt-panel-header" id="'+ headerId +'"></div>'
                            + '<div id="'+ bodyId +'"></div>'
                var $container = $('#' + id);
                componentConfig.headerId = headerId;
                componentConfig.bodyId = bodyId;
                $container.html(html);
                // 数据
                var data = typeof(config.serverData) == "object" ? config.serverData : {};
                // 初始化header
                this.initHeader(componentConfig, data,config);
                // 初始化表单
                this.initForm(componentConfig, data,config)

            }
        },
        // 项目信息
        project : {
            //添加项目
            dialog:{
                //获取弹框列表配置
                getDialogConfig:function(componentConfig,data,config){
                    //regList的传参
                 var voId = config.components[2].bodyId
                  var formData = NetstarComponent.getValues(voId);
                  var regListAjaxData = formData.customerName;             
                    var itemList = {
                        id: componentConfig.dialoglistId,
                        data: {
                            idField: 'id',
                            src: getRootPath() + '/npebase/datCombos/getList',
                            contentType: 'application/json',
                            mentod: 'GET',
                            dataSrc: 'rows',
                            data: {},
                        },
                        columns: [
                            {
                                field: 'itemClassId',
                                title: '项目类别',
                            },
                            {
                                field: 'comboName',
                                title: '组合项目',
                            },
                            { //number
                                field: 'comboPrice',
                                title: '标准金额',

                            }
                        ],
                        ui: {
                            isCheckSelect: true,
                            isOpenQuery: true,
                            height: 500
                        }
                    };
                    var regList = {
                        id:  componentConfig.dialoglistId,
                        data: {
                            idField: 'id',
                            src: getRootPath() + '/npebase/datPackages/getListWithoutCustomer',
                            contentType: 'application/json',
                            mentod: 'GET',
                            data: {

                            },
                        },
                        columns: [
                            {
                                field: 'dictClassName',
                                title: '体检项目',
                            },
                            {
                                field: 'packageName',
                                title: '套餐名称',
                            },
                            {
                                field: 'basePrice', //number
                                title: '标准金额',
                            },
                            {
                                field: 'itemType',
                                title: '优惠金额',
                            },
                            {
                                field: 'pkgPrice',
                                title: '应收金额',
                            },
                            {
                                field: 'discount',
                                title: '折扣率',
                            }
                        ],
                        ui: {
                            isOpenQuery: true,
                            selectedHandler: function (data) {
                                var id = data.id
                                var ajaxConfig = {
                                    url: getRootPath() + '/npebase/datPackageCombos/getList',
                                    contentType: 'application/json',
                                    type: 'GET',
                                    data: {
                                        packageId: id
                                    },
                                }
                                NetStarUtils.ajax(ajaxConfig, function (res) {
                                    componentConfig.selectedData = res.rows       
                                })
                            }
                        }
                    };
                    var unitList = {
                        id:  componentConfig.dialoglistId,
                        data: {
                            idField: 'id',
                            src: getRootPath() + '/npebase/datPackages/getList',
                            contentType: 'application/json',
                            mentod: 'GET',
                            data: {
                                customerId: regListAjaxData
                            },
                        },
                        columns: [
                            {
                                field: 'dictClassName',
                                title: '体检项目',
                            },
                            {
                                field: 'packageName',
                                title: '套餐名称',
                            },
                            {
                                field: 'basePrice', //number
                                title: '标准金额',
                            },
                            {
                                field: 'itemType',
                                title: '优惠金额',
                            },
                            {
                                field: 'pkgPrice',
                                title: '应收金额',
                            },
                            {
                                field: 'discount',
                                title: '折扣率',
                            }
                        ],
                        ui: {
                            isOpenQuery: true,
                            height: 500,
                            selectedHandler: function (data) {
                                /* setSelectedData(data) */

                            }
                        }
                    }
                    var dialogConfig = {
                        itemList:itemList,
                        regList:regList,
                        unitList:unitList
                    }
                    componentConfig.dialogConfig = dialogConfig
                    return {
                        itemList:itemList,
                        regList:regList,
                        unitList:unitList
                    }
                },
                //按钮的配置
                btnHandler:function(componentConfig){                 
                    var addComboBtns = {
                        id: componentConfig.dialogBtnId,
                        btns: [{
                                text: '确认',
                                handler: function () {
                                    var selectedData= componentConfig.selectedData;
                                    //传参 comboIds
                                    var checkedData = NetStarGrid.getCheckedData(componentConfig.dialoglistId);
                                    //拼接套餐里面的项目加勾选的项目
                                    var itemIds = '';
                                    var unitList = ''
                                    for (var i = 0; i < checkedData.length; i++) {
                                        itemIds += checkedData[i].id + ','
                                    }
                                    for (var j = 0; j < selectedData.length; j++) {
                                        unitList += selectedData[j].id + ','
                                    }
                                    var comboIds = '';
                                    if (itemIds != '' && unitList == '') {
                                        comboIds = itemIds
                                    } else if (unitList != '' && itemIds == '') {
                                        comboIds = unitList
                                    } else {
                                        comboIds = itemIds + unitList;
                                    }
                                    //返回处理好的项目
                                    var ajaxConfig = {
                                        url: getRootPath() + 'reg/combos/addCombo',
                                        contentType: 'application/x-www-form-urlencoded',
                                        type: 'POST',
                                        data: {
                                            comboIds: comboIds
                                        }
                                    }
                                    NetStarUtils.ajax(ajaxConfig, function (res) {
                                        if (res.success) {
                                            //获取项目数据
                                            NetstarComponent.dialog[componentConfig.dialogId].vueConfig.close();
                                            for (var i = 0; i < res.rows.length; i++) {
                                                res.rows[i].isOwnExpense = 1;
                                            }
                                            //存放数据 用来显示项目列表
                                            componentConfig.itemData = res.rows;
                                            componentConfig.itemVue.addComboVOList = componentConfig.itemData;
                                            //显示项目长度
                                            componentConfig.vueObj.itemAmountNum = res.rows.length;
                                        }
                                    })
                                }
                            },
                            {
                                text: '关闭',
                                handler: function () {
                                    NetstarComponent.dialog[componentConfig.dialogId].vueConfig
                                        .close()
                                }
                            }
                        ]
                    };
                    return addComboBtns
                },
                //获取项目弹框html
                getDialogShownHtml:function(componentConfig,data){
                    var dialoglistId = componentConfig.headerId + '-dialog-list'
                    var dialogBtnId = componentConfig.headerId + '-dialog-btn'
                    var html = '<div class="pt-tab-header">\
                                    <div class="pt-nav">\
                                        <ul class="pt-tab-list-components-tabs">\
                                            <li id="tab-propertyList" class="component-list pt-nav-item current" ns-name="unitList">\
                                                <a id="tab-color" href="javascript:void(0);">单位套餐 </a>\
                                            </li>\
                                            <li id="tab-processorList" class="component-list pt-nav-item" ns-name="regList">\
                                                <a id="tab-color-2" href="javascript:void(0);" hidden> 体检套餐 </a>\
                                            </li>\
                                            <li id="tab-processorList" class="component-list pt-nav-item" ns-name="itemList">\
                                                <a id="tab-color-2" href="javascript:void(0);" hidden> 体检项目</a>\
                                            </li>\
                                        </ul>\
                                    </div>\
                                </div>\
                                <div id="'+ dialoglistId +'"></div>'
                    var btnHtml = '<div id="'+dialogBtnId+'"></div>'
                    componentConfig.dialoglistId = dialoglistId;
                    componentConfig.dialogBtnId = dialogBtnId;
                    return {
                        html:html,
                        btnHtml:btnHtml
                    }
                },
                //新增项目弹框
                getDialogShownHandler:function(componentConfig,data,config) {     
                //页面容器
                    var dialogBodyId = data.config.bodyId;
                    var footerBodyId = data.config.footerId; 
                    var html =this.getDialogShownHtml(componentConfig,data).html;
                    var BtnHtml =this.getDialogShownHtml(componentConfig,data).btnHtml;
                    $('#' + dialogBodyId).html(html);
                    $('#' + footerBodyId).html(BtnHtml); 
                    //初始化表格tab页初始表格
                    var dialogConfig = this.getDialogConfig(componentConfig,data,config).unitList;//表格配置
                    NetStarGrid.init(dialogConfig); 
                    //弹框数据 
                    var dialogDataManage = { 
                        currentName: 'unitList',
                        data: {},
                        table: {
                            itemList: componentConfig.dialogConfig.itemList,
                            regList: componentConfig.dialogConfig.regList,
                            unitList: componentConfig.dialogConfig.unitList,
                        }
                    };
                    // 添加tab事件
                    var $lis = $('#' + dialogBodyId).find('li');
                    $lis.off('click');
                    $lis.on('click', function (ev) {
                        var $this = $(this);
                        // 记录数据
                        dialogDataManage.data[dialogDataManage.currentName] = NetStarGrid.getCheckedData(componentConfig.dialoglistId);
                        // 切换tab  current字体样式
                        $lis.removeClass('current');
                        $this.addClass('current');
                        dialogDataManage.currentName = $this.attr('ns-name');
                        // 切换table
                        var gridConfig = dialogDataManage.table[dialogDataManage.currentName];
                        // 设置默认值
                        NetStarGrid.init(gridConfig);
                    });
                    //按钮初始化
                    console.log(this.btnHandler(componentConfig))
                    vueButtonComponent.init(this.btnHandler(componentConfig));
                },
            },
            //获取header的html
            getHeaderHtml:function(componentConfig){
                var dialogId = componentConfig.id + '-dialog'
                componentConfig.dialogId = dialogId;
                var html = '<div class="pt-btn-group">'
                                +  '<button class="pt-btn pt-btn-default pt-btn-icon" id="'+ dialogId +'" @click="itemDialog()">'
                                    +  '<i class="icon icon-add"></i>'
                                +   '</button>'
                                +   '<button class="pt-btn pt-btn-default" @click = "clearData()">'
                                    +   '<span>清空</span>'
                                +  '</button>'
                                +  '<button class="pt-btn pt-btn-default" @click ="pricingFun()">'
                                        +'<span>计算价格</span>'
                                +  '</button>'
                                +  '<button class="pt-btn pt-btn-default">'
                                        +'<span>项目详情</span>'
                                +  '</button>'
                        +  '</div>'
                            +  '<div class="badge">'
                                +  '<span>项目数量</span>'
                                +  '<span class="pt-badge pt-badge-warning">'
                                    +'{{itemAmountNum}}'
                                +  '</span>'
                            +  '</div>';
                return html;
                
            },
            // 获取数据
            getData : function(componentConfig, isValid, config){
                var itemData = componentConfig.itemVue.addComboVOList;
                return  itemData
            },
            // 设置数据
            setData : function(data, componentConfig, config){
                
            },
            // 清空数据
            clearData : function(componentConfig, config){
                componentConfig.itemVue.addComboVOList = [];
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },        
            //初始化header
            initHeader:function(componentConfig,config){
                /* 
                    *项目的数据  itemData 
                */
                var _this = this;
                var headerId = componentConfig.headerId;
                var $header = $('#' + headerId);
                var html = this.getHeaderHtml(componentConfig);
                $($header).html(html);
                var vueObj = new Vue({
                    el:'#' + headerId,
                    data:{
                        itemAmountNum:'0'
                    },
                    methods:{
                        //点击加号弹出项目页面
                        itemDialog(){
                            //验证如果登记信息必填内容为空的不可点击
                            var voData = config.components[2].bodyId;
                            var _voData = NetstarComponent.getValues(voData);
                            if(_voData){
                                NetstarComponent.dialogComponent.init(dialog);
                            }else{
                                nsalert('必填项目未填写','error');
                            }
                            
                        },
                        //清空按钮
                        clearData(){
                            _this.clearData(componentConfig);
                        },
                        //计算价格
                        pricingFun(){
                            var ajaxConfig = {
                                url:getRootPath() + '/reg/pricingPersonals/pricing',
                                contentType: 'application/x-www-form-urlencoded',
                                contentType: 'application/json',
                                data: {

                                },
                                type: 'POST',
                            }
                            NetStarUtils.ajax(ajaxConfig,function(res){
                            })
                        }

                    }
                });
                var dialog = {
                    id: componentConfig.dialogId,
                    templateName: 'PC',
                    height: '80%',
                    width: '80%',
                    title: '添加项目',
                    shownHandler:function(data){
                        _this.dialog.getDialogShownHandler(componentConfig,data,config)
                    }
                };
                componentConfig.vueObj = vueObj;

            },
            //body的html
            bodyHtml:function(componentConfig){
                var html = 
                        '<div class="block-list block-list-vertical">'
                            + '<div class="block-list-group">'
                                 +'<div class="block-list-item " v-for="item in addComboVOList">'
                                    +'<div class="block-list-content">'
                                       + '<div class="list-body">'
                                            +'<div class="list-title">'
                                                +'<span>{{item.comboName}}</span>'
                                            +'</div>'
                                            +'<div class="list-text">'
                                                +'<span>{{item.receivable}}</span>'
                                                +'<span class="text-through">{{item.standardAmount}}</span>'
                                            +'</div>'
                                        +'</div>'
                                        +'<div class="block-list-control">'
                                            +'<div class="pt-btn-group">'
                                                +'<button class="pt-btn pt-btn-default pt-btn-icon" @click="addItemFun(item.comboId)">'
                                                    +'<i class="icon">自</i>'
                                               +'</button>'
                                                +'<button class="pt-btn pt-btn-default pt-btn-icon"@click="deleteItem(item.comboId)">'
                                                    +'<i class="icon icon-trash-o"></i>'
                                                +'</button>'
                                            +'</div>'
                                        +'</div>'
                                        +'<div class="price-type-mark" v-if="item.isOwnExpense === 0">自</div>'
                                        +'<div class="program-addon-mark" v-if="item.packageId"></div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                        +'</div>'
                return html;
            },
            //初始化body
            initBody:function(componentConfig,config){
                var bodyId = componentConfig.bodyId;
                var html = this.bodyHtml(componentConfig);

                //添加项目容器
                $('#' +bodyId).html(html);
                var vueObj = new Vue ({
                    el:'#' +bodyId,
                    data:{
                        addComboVOList:componentConfig.itemData,
                    },
                    methods:{
                        /* 
                            *自费
                            * 点击时添加自费标签
                            * isOwnExpense 0： 是  1： 否
                         */
                        addItemFun(itemId){
                            var _this = this;
                            for (var i = 0; i < _this.addComboVOList.length; i++) {
                                if (_this.addComboVOList[i].comboId == itemId) {
                                    _this.addComboVOList[i].isOwnExpense = 0;
                                }
                            }
                        },
                        /* 
                            *点击时删除项目
                            *删除时项目数量同是变化
                         */
                        deleteItem(itemId){
                            var _this = this;
                            for (var i = 0; i < _this.addComboVOList.length; i++) {
                                if (_this.addComboVOList[i].comboId == itemId) {
                                    _this.addComboVOList.splice(i, 1);
                                    var itemLength = _this.addComboVOList.length;
                                    componentConfig.vueObj.itemAmountNum = itemLength; 
                                }
                            }
                        }
                    }

                })
                componentConfig.itemVue = vueObj;
            },
            // 初始化
            init : function(componentConfig, config){
                var id = componentConfig.id;
                var headerId = id + '-header'
                var bodyId = id + '-body'
                //添加容器
                var html = '<div class = "pt-panel-header" id="'+ headerId + '"></div>'
                         + '<div class = "pt-panel-body" id = "'+ bodyId +'"></div>';
             
                var $container = $('#' + id);
                componentConfig.headerId = headerId;
                componentConfig.bodyId = bodyId;
                $container.html(html);
                //初始化header
                this.initHeader(componentConfig,config);
                 //初始化body
                this.initBody(componentConfig,config);
            }
        },
        // 费用信息
        cost : {
            // 获取数据
            getData : function(componentConfig, isValid, config){
                var vueObj = componentConfig.vueObj;
                var originalRows = vueObj.originalRows;
                return originalRows;
            },
            // 设置数据
            setData : function(data, componentConfig, config){
                var vueObj = componentConfig.vueObj;
                vueObj.originalRows = data;
            },
            // 清空数据
            clearData : function(componentConfig, config){
                var vueObj = componentConfig.vueObj;
                vueObj.originalRows = [];
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            blockList : {
                TEMPLATE : '<div class="price-block" v-for="(row, index) in rows">'
                            + '<div class="price-block-header">'
                                + '<span class="price-type" :class="row[\'NETSTAR-HEADER-CLASS\']">{{row.isOwn}}</span>'
                                + '<span>{{row.pricingCode}}</span>'
                            + '</div>'
                            + '<div class="price-block-body">'
                                + '<ul>'
                                    + '<li>'
                                        + '<label for="">标准价格：</label>'
                                        + '<span>￥{{row.standardAmount}}</span>'
                                    + '</li>'
                                    + '<li>'
                                        + '<label for="">优惠券：</label>'
                                        + '<span>￥{{row.discountAmount}}</span>'
                                    + '</li>'
                                    + '<li>'
                                        + '<label for="">实收金额：</label>'
                                        + '<span><b>￥{{row.amount}}</b></span>'
                                    + '</li>'
                                + '</ul>'
                            + '</div>'
                        + '</div>',
                getRows : function(originalRows){ 
                    var rows = [];
                    for(var i=0; i<originalRows.length; i++){
                        var originalRow = originalRows[i];
                        var classStr = '';
                        switch(originalRow.isOwnExpense){
                            case 0:
                                classStr = 'price-type-public';
                                originalRow.isOwn = '自费'
                                break;
                            case 1:
                                classStr = 'price-type-own';
                                originalRow.isOwn = '公费'
                                break;
                        }
                        var row = {
                            standardAmount : originalRow.standardAmount,
                            discountAmount : originalRow.discountAmount,
                            amount : originalRow.amount,
                            isOwn:originalRow.isOwn,
                            pricingCode: originalRow.pricingCode,
                            'NETSTAR-HEADER-CLASS' : classStr,
                        }
                        rows.push(row);
                    }
                    return rows;
                },
                getVueData : function(blockConfig, config){
                    var originalRows = [];
                    if(typeof(config.serverData) == "object" && $.isArray(config.serverData[blockConfig.keyField])){
                        originalRows = config.serverData[blockConfig.keyField];
                    }
                    var rows = this.getRows(originalRows);
                    var data = {
                        originalRows : originalRows,
                        rows : rows,
                    };
                    return data;
                },
                init : function(blockConfig, config){
                    var _this = this;
                    var containerId = blockConfig.id;
                    var $container = $('#' + containerId);
                    $container.append(_this.TEMPLATE);
                    var data = _this.getVueData(blockConfig, config);
                    blockConfig.vueObj = new Vue({
                        el: '#' + containerId,
                        data: data,
                        watch: {
                            originalRows : function(value, oldValue) {
                                this.rows = _this.getRows(value);
                            }
                        },
                        methods: {
                        },
                        mounted: function(){
                        }
                    });
                },
            },
            // 初始化
            init : function(componentConfig, config){
                this.blockList.init(componentConfig, config);
            }
        },
        // 优惠信息
        discount : {
            // 获取数据
            getData : function(componentConfig, isValid, config){
                
            },
            // 设置数据
            setData : function(data, componentConfig, config){
                
            },
            // 清空数据
            clearData : function(componentConfig, config){
                
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            // 初始化
            init : function(componentConfig, config){
                
            }
        },
        // 危害信息
        harm : {
            // 获取数据
            getData : function(componentConfig, isValid, config){

            },
            // 设置数据
            setData : function(data, componentConfig, config){
                var regHazardVOList = data; //职业危害
                /* componentConfig.harmVue.regHazardVOList = regHazardVOList; */

            },
            // 清空数据
            clearData : function(componentConfig, config){
                
            },
            // 刷新
            refresh : function(data, componentConfig, config){
                
            },
            //按钮和搜索（header）
            sourceAddBtn:{
                //vo的配置
                harmDialogVoConfig:function(componentConfig){
                    var voConfig = {
                        id:componentConfig.harmDialogVOId,
                        templateName:'form',
                        componentTemplateName:'PC',
                        isSetMore:false,
                        form:[
                            {
                                id:'ocpcId',
                                type:'select',
                                label:'监护种类',
                                url:getRootPath() + '/npebase/occTutelages/getList',
                                contentType:'application/json',
                                mentod:'POST',
                                dataSrc:'rows',
                                valueField:'id',
                                textField:'tutelageName',
                                outputFields : {
                                    ocpcName : '{tutelageName}',
                                    ocpcId: '{id}',
                                },
                            }
                        ]
                    };
                    return voConfig
                },
                //弹框按钮配置
                harmDialogBtnConfig:function(componentConfig,data,config){
                    var _this = this;
                    /* 
                        * 获取到页面表单id 把块状表格所有的监护种类id替换  进行批量设置
                    */ 
                   
                    var btnConfig = {
                        id:componentConfig.harmDialogBtnd,
                        btns:[
                            {
                                text:'确定',
                                handler:function(){
                                    var ocpcName = NetstarComponent.getValues(componentConfig.harmDialogVOId,true).ocpcName;
                                    var ocpcId = NetstarComponent.getValues(componentConfig.harmDialogVOId,true).ocpcId;
                                    if(ocpcName){
                                        var harmData = componentConfig.harmVue.regHazardVOList;
                                        for(var i = 0; i<harmData.length;i++){
                                            harmData[i].ocpcName = ocpcName;
                                            harmData[i].ocpcId = ocpcId;
                                        }
                                        componentConfig.harmVue.regHazardVOList = harmData;
                                        
                                    }
                                    NetstarComponent.dialog[componentConfig.harmDialogId].vueConfig.close()
                                }
                            }
                        ]

                    };
                    return btnConfig
                },
                //危害弹框的配置
                harmDialogConfig:function(componentConfig,data){
                    var bodyId = data.config.bodyId;
                    var footerId = data.config.footerId;
                    var harmDialogVOId = componentConfig.id + '-vo';
                    var harmDialogBtnd = componentConfig.id + '-btn';
                    componentConfig.harmDialogVOId = harmDialogVOId;
                    componentConfig.harmDialogBtnd = harmDialogBtnd;
                    //插入容器
                    $('#' +bodyId).html(
                        '<div id = "'+ harmDialogVOId + '"></div>'
                    );
                    $('#' +footerId).html(
                        '<div id = "'+ harmDialogBtnd + '"></div>'
                    );
                    //初始化弹框vo与btn
                    var voConfig = this.harmDialogVoConfig(componentConfig);
                    var btnConfig = this.harmDialogBtnConfig(componentConfig)
                    NetstarComponent.formComponent.show(voConfig);
                    vueButtonComponent.init(btnConfig)
                },
                //批量设置弹框
                harmDialog:function(componentConfig,data,config){
                    var _this = this;
                    var id = componentConfig.id +'-harmDialog'
                    //弹框
                    var dialogConfig = {
                        id:id,
                        templateName:"PC",
                        title:"批量设置",
                        shownHandler:function(data){
                            _this.harmDialogConfig(componentConfig,data,config);
                        }

                    }
                    NetstarComponent.dialogComponent.init(dialogConfig);
                    componentConfig.harmDialogId = id
                },
                //按钮初始化
                btninit:function(componentConfig,config){
                    var _this = this;
                    var btns = {
                        id:componentConfig.hazardBtnId,
                        btns: [
                            {
                                text: '批量设置',
                                handler: function (data) {
                                    _this.harmDialog(componentConfig,data,config)
                                }
                            },
                            {
                                text: '必检项目',
                                handler: function () {
        
                                }
                            }
                        ]
                    }
                    vueButtonComponent.init(btns);
                },
                init:function(componentConfig,config){
                    this.btninit(componentConfig,config);
                }
            },
            //块状表格
            blockList:{
                init:function(componentConfig,config){
                    var _this = this;
                    var originalRows = [];
                    if(typeof(config.serverData) == "object" && $.isArray(config.serverData[componentConfig.keyField])){
                        originalRows = config.serverData[componentConfig.keyField];
                    }
                    for(var regHazardI = 0; regHazardI<originalRows.length; regHazardI++){
                        originalRows[regHazardI].hazardDomId = "hazardDomId-" + regHazardI;
                        originalRows[regHazardI].ocpcDomId = "ocpcDomId-" + regHazardI;
                    }
                    var harmConfig = {
                        field : [
                            {
                                field:'ocpcName',
                                editConfig:{
                                    type:'select',
                                    url:getRootPath() + '/npebase/occTutelages/getList',
                                    contentType:'application/json',
                                    mentod:'POST',
                                    dataSrc:'rows',
                                    valueField:'id',
                                    textField:'tutelageName',
                                    outputFields : {
                                        ocpcName : '{tutelageName}',
                                        ocpcId: '{id}',
                                    },
                                }
                            },
                            {
                                field:'hazardName',
                                editConfig:{
                                    type:'select',
                                    url:getRootPath() + '/npebase/occHazards/getList',
                                    contentType:'application/json',
                                    mentod:'POST',
                                    dataSrc:'rows',
                                    valueField:'id',
                                    textField:'hazardName',
                                    outputFields : {
                                        hazardName : '{hazardName}',
                                        hazardId: '{id}',
                                    },
                                }
                            }
                        ],
                        componentById : {
                            ocpcName : {
                                editConfig : {
                                    type:'select',
                                    url:getRootPath()+'/npebase/occTutelages/getList',
                                    contentType:'application/json',
                                    mentod:'POST',
                                    dataSrc:'rows',
                                    valueField:'id',
                                    textField:'tutelageName',
                                    outputFields : {
                                        ocpcName : '{tutelageName}',
                                        ocpcId: '{id}',
                                    },
                                }
                            },
                            hazardName : {
                                editConfig : {
                                    type:'select',
                                    url:getRootPath() + '/npebase/occHazards/getList',
                                    contentType:'application/json',
                                    mentod:'POST',
                                    dataSrc:'rows',
                                    valueField:'id',
                                    textField:'hazardName',
                                    outputFields : {
                                        hazardName : '{hazardName}',
                                        hazardId: '{id}',
                                    },
                                }
                            }
                        }
                    }
                    var harmVue = new Vue({
                        el:"#" + componentConfig.hazardblockId,
                        data:{
                            regHazardVOList : originalRows,
                        },
                        methods:{
                            removeComponent:function($editorContainer){
                                if ($editorContainer.length > 0) {
                                    var editorConfig = this.editorConfig;
                                    var editorVueConfig = this.editorVue;
                                    var editorVueComConfig = false;
                                    if(editorVueConfig){
                                        editorVueComConfig = editorVueConfig.$children[0];
                                    }
                                    /******lyw 20190411 计算器组件需要重新获取，进行保存值 end********/
                                    // 验证是否是日期组件 删除日器组件
                                    if(typeof(editorConfig) == "object"){
                                        switch(editorConfig.type){
                                            case 'date':
                                                break;
                                            case 'provinceselect':
                                                break;
                                            case 'select':
                                                if(editorVueComConfig){
                                                    if(editorConfig.panelVueObj){
                                                        $(document).off("click", editorConfig.panelVueObj.isSearchDropDown);
                                                    }
                                                    if(typeof(editorVueComConfig.blurHandler)=='function'){
                                                        editorVueComConfig.blurHandler();
                                                    }
                                                }  
                                                break;
                                        }
                                    }
                                    // 销毁组件
                                    if(typeof(editorVueConfig) == "object"){
                                        editorVueConfig.$destroy();
                                        delete this.editorVue;
                                    }
                                    this.removeRemoveEditorListener();
                                    $editorContainer.children().remove();
                                    if ($('.pt-select-panel').length > 0) {
                                        // 下拉组件下拉框删除 以及下拉框添加的事件关闭
                                        $('.pt-select-panel').remove();
                                        $(document).off('keyup',NetstarComponent.select.panelComponentConfig.keyup);
                                    }
                                }
                            },
                            removeRemoveEditorListener : function(){
                                $('body').off('mousedown', this.outClickHandler);
                            },
                            outClickHandler:function(ev){
                                //如果当前操作对象不再编辑器里则是out
                                var isOut = $(ev.target).closest('.form-block-editor-container').length == 0;
                                if (isOut) {
                                    if (ev.target.nodeName == 'LI') {
                                        isOut = false;
                                    }
        
                                    //sjj 2019106  如果当前下拉框出现滚动区域不可关闭
                                    if (ev.target.className == 'pt-dropdown') {
                                        if (ev.target.parentNode && ev.target.parentNode.className.indexOf('pt-input-group pt-select-panel')>-1){
                                            isOut = false;
                                        }
                                    }
                                    if($(ev.target).closest('.pt-pager').length == 1){
                                        //sjj 20200113
                                        isOut = false;
                                    }
                                }
                                //如果当前操作也不在要点击的单元格里则不是out
                                var $td = ev.data.$td;
                                if ($td[0] == $(ev.target)[0] || $(ev.target).closest('td')[0] == $(ev.target)[0] || $td[0] == $(ev.target).closest('td')[0]) {
                                    isOut = false;
                                }
                                var _tdEditor = ev.data.this;
                                if (isOut) {
                                    var $gridContainer = ev.data.$td.closest('container');
                                    if ($gridContainer.length == 0) {
                                        $gridContainer = $('body');
                                    }
                                    var $editorContainer = $gridContainer.find('.form-block-editor-container');
                                    _tdEditor.removeComponent($editorContainer);
                                }
                            },
                            addRemoveListener : function($td){
                                //$td是当前点击正在初始化的单元格
                                var _this = this;
                                //点击了其他地方的监听器
                                this.removeRemoveEditorListener();
                                //sjj 20190509 把body的click事件改为了mousedown事件
                                $('body').on('mousedown', {
                                    this: _this,
                                    $td: $td
                                }, this.outClickHandler);
                            },
                            showFormEditor : function(ev, editConfig, fieldName, index, hazardDomId){
                                var _this = this;
                                var $td = $(ev.currentTarget);
                                var editConfig = editConfig;
                                editConfig.changeHandler = function(obj){
                                    var editValue = obj.vueConfig.getValue();
                                    // 赋值
                                    if(typeof(editValue) == "object"){
                                        for(var key in editValue){
                                            _this.regHazardVOList[index][key] = editValue[key];
                                        }
                                    }else{
                                        _this.regHazardVOList[index][fieldName] = editValue;
                                    }
                                    // 移除 
                                    var $editorContainer = $('#' + hazardDomId);
                                    _this.removeComponent($editorContainer);
                                }
                                var componentVueConfig = NetstarComponent[editConfig.type].getComponentConfig(editConfig);
                                var editorVueConfig = {
                                    el: '#' + hazardDomId,
                                    data: {
                                    },
                                    components: {
                                        'editorinput': componentVueConfig
                                    }
                                };
                                NetstarComponent.config[editConfig.formID] = {
                                    vueConfig: {},
                                    config: {},
                                    source : {
                                        obj : {},
                                    },
                                };
                                this.editConfig = editConfig
                                NetstarComponent.config[editConfig.formID].config[editConfig.id] = editConfig;
                                NetstarComponent.config[editConfig.formID].source.obj[editConfig.id] = editConfig;
                                this.editorVue = new Vue(editorVueConfig);
                                //聚焦并选中文本框
                                if (typeof (this.editorVue.$children[0]) == "object") {
                                    NetstarComponent.config[editConfig.formID].config[editConfig.id].index = index;
                                    this.editorVue.$children[0].focus();
                                }
                                NetstarComponent.config[editConfig.formID].vueConfig[editConfig.id] = this.editorVue.$children[0];
                                // 其他点击事件都会关闭编辑器
                                _this.addRemoveListener($td);
                            },
                            clickTdHandler(ev, value, fieldName, index, hazardDomId){
                                var $editContainer = $('#' + hazardDomId);
                                $editContainer.html('<editorinput></editorinput>')
                                var defaultComponentConfig = {
                                    type:'select',
                                    id: 'editor',
                                    type: 'select',
                                    formSource: 'table',
                                    templateName: 'PC',
                                    value: typeof (value) == "undefined" ? '' : value, // 当前单元格的value值。如果不存在设置“”
                                    formID: 'netstar-saas-hazard',
                                    variableType: 'string',
                                    tableIndex: index,
                                    isShowPanel : true,
                                }
                                var editConfig = harmConfig.componentById[fieldName].editConfig;
                                NsUtils.setDefaultValues(editConfig, defaultComponentConfig);
                                this.showFormEditor(ev, editConfig, fieldName, index, hazardDomId);
                            }
                        },
                        mounted(){
                        }
                    });
                    componentConfig.harmVue = harmVue
                }
            },
            //获取html
            getHtml:function(componentConfig){     
                var blockId =  componentConfig.id + '-block-harm';
                var btnId =  componentConfig.id + '-btns'
                var html = 
                        '<div class="pt-panel">'
                        +' <div class="pt-panel-header">'
                                +'<div class="title">职业危害因素</div>'
                                    +'<div class="pt-form pt-form-normal pt-form-inline pt-custom-query">'
                                        +'<div class="pt-form-header"></div>'
                                        +'<div class="pt-form-body">'
                                            +'<form>'
                                                +'<div ns-type="field" class="field">'
                                                    +'<div ns-field="filtermode" class="pt-form-group fg-select ">'
                                                        +'<label class="pt-control-label hide"></label>'
                                                        +'<div class="pt-select pt-input-group">'
                                                            +'<input type="text" placeholder="" selectmode="single" ns-id="filtermode" class="pt-form-control">'
                                                            +'<div class="pt-input-group-btn">'
                                                                +'<button class="pt-btn pt-btn-default pt-btn-icon clear">'
                                                                    +'<i class="icon-close"></i>'
                                                                +'</button>'
                                                                +'<button class="pt-btn pt-btn-default pt-btn-icon">'
                                                                    +'<i class="icon-arrow-down-o"></i>'
                                                                +'</button>'
                                                        + '</div>'
                                                        +'</div>'
                                                    +'</div>'
                                                    +'<div ns-field="filterstr" class="pt-form-group fg-text ">'
                                                        +'<label class="pt-control-label hide"></label>'
                                                        +'<div class="pt-text pt-input-group pt-text-assistant">'
                                                            +'<input type="text" placeholder="" class="pt-form-control">'
                                                            +'<div class="pt-input-group-btn pt-input-group-btn-group">'
                                                                +'<button class="pt-btn pt-btn-default pt-btn-icon pt-input-clear hide">'
                                                                    +'<i class="icon-close"></i>'
                                                                +'</button>'
                                                        +'</div>'
                                                            +'<div class="pt-text-assistant-btns hide">'
                                                            +'<div class="pt-btn-group"></div>'
                                                            +'</div>'
                                                        +'</div>'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div ns-type="field-more" class="field-more hide custom"></div>'
                                            +'</form>'
                                        +'</div>'
                                        +'<div class="pt-form-footer"></div>'
                                    +'</div>'
                                    +'<div class="pt-btn-group">'
                                    +' <button type="button"class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh">'
                                        +'<i class="icon-search"></i>'
                                        +'</button>'
                                    +'</div>'   
                                +'<div id="'+ btnId +'" class="pt-panel-header-right"></div>'
                            +'</div>'
                        +'<div class="pt-panel-body"  id="'+blockId+'">'
                            +'<div  class="block-list block-list-grid grid-col-4">'
                                +'<div class="block-list-group">'
                                    +'<div class="block-list-item" v-for="(list,index) in regHazardVOList">'
                                        +'<div class="block-list-content">'
                                            +'<div @click="clickTdHandler($event, list.hazardId, \'hazardName\', index, list.hazardDomId)" class="pt-form-control">'
                                                +'<span>{{list.hazardName}}</span>'
                                                +'<div :id="list.hazardDomId" class="form-block-editor-container"></div>'
                                            +'</div>'
                                            +'<div @click="clickTdHandler($event, list.ocpcId, \'ocpcName\', index, list.ocpcDomId)" class="pt-form-control">'
                                                +'<span>{{list.ocpcName}}</span>'
                                                +'<div :id="list.ocpcDomId" class="form-block-editor-container"></div>'
                                            +'</div>'
                                        +'</div>'
                                +' </div>'
                                +'</div>'
                            +'</div>'
                        +'</div>'
                    +'</div>';
                    componentConfig.hazardBtnId = btnId;
                    componentConfig.hazardblockId = blockId;
        return html;
            },
            // 初始化
            init : function(componentConfig, config){  
                var id = componentConfig.id;
                var $container = $('#' + id)
                var html = this.getHtml(componentConfig);
                $container.html(html);
                this.sourceAddBtn.init(componentConfig,config);
                this.blockList.init(componentConfig,config);
            }
        },
        init : function(config){
            var componentsByName = config.componentsByName;
            for(var keyName in componentsByName){
                var componentConfig = componentsByName[keyName];
                if(typeof(componentManage[componentConfig.name]) == "object"){
                    componentManage[componentConfig.name].init(componentConfig, config);
                }else{
                    console.error('没有找到组件方法');
                    console.error(componentConfig);
                }
            }
            if(config.closeValidSaveTime > -1){
               setTimeout(function(){
                config.pageInitDefaultData = dataManage.getPageData(config, false, false);
               }, config.closeValidSaveTime);
            }
            // 重新设置草稿箱formatFields 中字段的containerId
            if(config.draftBox && config.draftBox.isUse == true){
                var componentsById = config.componentsById;
                var formatFields = config.draftBox.formatFields;
                for(var key in formatFields){
                    var draftBoxField = formatFields[key];
                    var draftBoxFieldContainerId = draftBoxField.containerId;
                    if(componentsById[draftBoxFieldContainerId]){
                        switch(draftBoxField.nsType){
                            case 'vo':
                                draftBoxField.containerId = componentsById[draftBoxFieldContainerId].bodyId;
                                break;
                            case 'list':
                                draftBoxField.containerId = componentsById[draftBoxFieldContainerId].bodyId;
                                break;
                        }
                    }
                }
            }
        }
    }
    // 整体面板管理
    var panelManage = {
        getTitle : function(config){
            var html = '';
            if(config.title){
                //定义了标题输出
                html = '<div class="pt-main-row physicalsreport-title">'
                            +'<div class="pt-main-col">'
                                +'<div class="pt-panel pt-panel-header">'
                                    +'<div class="pt-container">'
                                        +'<div class="pt-panel-row">'
                                            +'<div class="pt-panel-col">'
                                                +'<div class="pt-title pt-page-title"><h4>'+config.title+'</h4></div>'
                                            +'</div>'
                                        +'</div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                        +'</div>';
            }
            return html;
        },
        getBtns : function(config){
            var btnConfig = config.componentsByName.btns;
            if(!btnConfig){
                return '';
            }
            var html = '<div class="pt-panel">'
                            +'<div class="pt-container">'
                                +'<div class="pt-panel-row">'
                                    +'<div class="pt-panel-col">'
                                        +'<div class="main-btns pt-components-btn" id="'+btnConfig.id+'"></div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                        +'</div>';
            return html;
        },
        // 个人信息
        getPersonal : function(config){
            var personalConfig = config.componentsByName.personal;
            if(!personalConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ personalConfig.id +'">'
                        + '</div>'
            return html;
        },
        getRegister : function(config){
            var registerConfig = config.componentsByName.register;
            if(!registerConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ registerConfig.id +'">'
                        + '</div>'
            return html;
        },
        getProject : function(config){
            var projectConfig = config.componentsByName.project;
            if(!projectConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ projectConfig.id +'">'
                        + '</div>'
            return html;
        },
        getCost : function(config){
            var costConfig = config.componentsByName.cost;
            if(!costConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ costConfig.id +'">'
                        + '</div>'
            return html;
        },
        getDiscount : function(config){
            var discountConfig = config.componentsByName.discount;
            if(!discountConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ discountConfig.id +'">'
                        + '</div>'
            return html;
        },
        getHarm : function(config){
            var harmConfig = config.componentsByName.harm;
            if(!harmConfig){
                return '';
            }
            var html = '<div class="pt-panel" id="'+ harmConfig.id +'">'
                        + '</div>'
            return html;
        },
        init : function(config){
            // title
            var titleHtml = panelManage.getTitle(config);
            // btns
            var btnsHtml = panelManage.getBtns(config);
            // 个人信息
            var personalHtml = panelManage.getPersonal(config);
            // 登记信息
            var registerHtml = panelManage.getRegister(config);
            // 项目信息
            var projectHtml = panelManage.getProject(config);
            // 费用信息
            var costHtml = panelManage.getCost(config);
            // 优惠信息
            var discountHtml = panelManage.getDiscount(config);
            // 危害信息
            var harmHtml = panelManage.getHarm(config);
            // html
            var templateClassStr = '';
            if(config.plusClass){
                templateClassStr = config.plusClass;
            }
            var html = '<div class="pt-main physicalsreport '+templateClassStr+'" id="'+config.id+'" ns-package="'+config.package+'">'
                            + '<div class="pt-container">'
                                + titleHtml
                                // 按钮
                                + '<div class="pt-main-row">'
                                    + '<div class="pt-main-col">'
                                        // 按钮
                                        + btnsHtml
                                    + '</div>'
                                + '</div>'
                                // left
                                + '<div class="pt-main-row">'
                                    + '<div class="pt-main-col">'
                                        // 个人信息
                                        + personalHtml
                                        // 费用信息
                                        + costHtml
                                        // 优惠信息
                                        + discountHtml
                                    + '</div>'
                                    // center
                                    + '<div class="pt-main-col">'
                                        // 登记信息
                                        + registerHtml
                                        // 危害信息
                                        + harmHtml
                                    + '</div>'
                                    // right
                                    + '<div class="pt-main-col">'
                                        // 项目信息
                                        + projectHtml
                                    + '</div>'
                                + '</div>'
                            + '</div>'
                        + '</div>';
            
            // 容器
            var $container = $('container').not('.hidden');
            if($container.length > 0){
                $container = $container.eq($container.length - 1);
            }
            if(config.$container){
                $container = config.$container;
            }
            $container.append(html);
        }
    }
    // 页面方法管理
    var dataManage = {
        getComponentsData : function(config, isValid){
            var data = {};
            var componentsByName = config.componentsByName;
            for(var keyName in componentsByName){
                // 按钮不需要获取
                if(keyName == "btns"){ continue; }
                // 没有该组件
                if(typeof(componentManage[keyName]) != "object"){ continue; }
                var componentConfig = componentsByName[keyName];
                var componentData = componentManage[keyName].getData(componentConfig, isValid, config);
                if(componentData == undefined){
                    continue;
                }
                if(!componentData){
                    data = false;
                    break;
                }
                var keyField = componentConfig.keyField;
                if(keyField == "root"){
                    $.each(componentData, function(key, value){
                        data[key] = value;
                    });
                }else{
                    data[keyField] = componentData;
                }
            }
            return data;
        },
        //获取界面数据
        getPageData : function(config, isValid, isSetObjectState){
            /**
             * config object 当前配置项 某些条件下存在不传配置项传值为包名的情况（具体条件暂不清楚）
             * isValid 是否验证 默认true验证
             * isSetObjectState 是否需要比较设置状态值 默认true
            */
            isValid = typeof(isValid)=='boolean' ? isValid : true;
            isSetObjectState = typeof(isSetObjectState)=='boolean' ? isSetObjectState : true;
            if(typeof(config)=='string'){
               config = configManage.getConfig(config);
            }
            var pageData = dataManage.getComponentsData(config, isValid);
            if(pageData === false){
               return false;
            }
            var returnData = pageData;
            if(isSetObjectState){
               returnData = nsServerTools.getObjectStateData(config.serverData, pageData, config.idFieldsNames);
            }
            NetstarTemplate.commonFunc.setSendParamsByPageParamsData(returnData, config);
            return returnData;
        },
        // 设置页面数据
        setPageData : function(value, config){
            if(typeof(config)=='string'){
               config = configManage.getConfig(config);
            }
            // 验证
            value = typeof(value)=='object' ? value : {};
            var data = config.serverData;
            if(!$.isEmptyObject(value)){
                data = value;
            }
            if($.isEmptyObject(data)){
               nsalert('无返回值', 'warning');
               console.error('无返回值');
               return false;
            }
            // 开始赋值
            var componentsByName = config.componentsByName;
            for(var keyName in componentsByName){
                // 按钮不需要获取
                if(keyName == "btns"){ continue; }
                // 没有该组件
                if(typeof(componentManage[keyName]) != "object"){ continue; }
                var componentConfig = componentsByName[keyName];
                var componentData = {};
                var keyField = componentConfig.keyField;
                if(keyField == "root"){
                    componentData = data;
                }else{
                    componentData = data[keyField];
                }
                componentManage[keyName].setData(componentData, componentConfig, config);
            }
        },
        // 清空页面数据
        clearPageData : function(config){
            var componentsByName = config.componentsByName;
            for(var keyName in componentsByName){
                // 按钮不需要获取
                if(keyName == "btns"){ continue; }
                // 没有该组件
                if(typeof(componentManage[keyName]) != "object"){ continue; }
                var componentConfig = componentsByName[keyName];
                componentManage[keyName].clearData(componentConfig, config);
            }
        },
        // 通过草稿箱设置页面数据
        setValueByDraft : function(data, package){
            dataManage.setPageData(data, package);
        }
    }
    // 初始化
    function init(config){
        var isPass = configManage.validConfig(config);
        if(!isPass){
            return false;
        }
        // 存储模板配置参数
        NetstarTemplate.commonFunc.setTemplateParamsByConfig(config);
        configs[config.package] = {
            sourse : $.extend(true, {}, config),
            config : config,
        }
        // 设置模板通用参数默认值
        NetstarTemplate.commonFunc.setDefault(config);
        // 设置config
        configManage.setConfig(config);
        // 初始化容器
        panelManage.init(config);
        if(!$.isEmptyObject(config.getValueAjax)){
            //当前界面存在此定义则先请求根据返回值去初始化各个组件调用
            var getValueAjaxConfig = $.extend(true, {}, config.getValueAjax);
            if(!$.isEmptyObject(config.pageParam)){
               if(!$.isEmptyObject(getValueAjaxConfig.data)){
                  getValueAjaxConfig.data = NetStarUtils.getFormatParameterJSON(getValueAjaxConfig.data, config.pageParam);
               }else{
                  getValueAjaxConfig.data = config.pageParam;
               }
            }
            getValueAjaxConfig.plusData = {
               packageName:config.package,
               templateId:config.id
            };
            NetStarUtils.ajax(getValueAjaxConfig,function(res,ajaxPlusData){
                var templateConfig = configManage.getConfig(ajaxPlusData.plusData.packageName);
               if(res.success){
                  var resData = res[ajaxPlusData.dataSrc] ? res[ajaxPlusData.dataSrc] : {};
                  NetStarUtils.deleteAllObjectState(resData);//删除服务端返回的数据状态
                  templateConfig.serverData = resData;//服务端返回的原始数据
                  templateConfig.pageData = NetStarUtils.deepCopy(resData);//克隆服务端返回的原始数据
                  componentManage.init(templateConfig);//组件化分别调用
               }else{
                  nsalert('返回值false','error');
                  componentManage.init(templateConfig);//组件化分别调用
               }
            },true);
        }else{
            componentManage.init(config);
        }
    }
    return {
        getConfig : configManage.getConfig,
        init : init,
        dialogBeforeHandler : baseFuncManage.dialogBeforeHandler,
        ajaxBeforeHandler : baseFuncManage.ajaxBeforeHandler,
        ajaxAfterHandler : baseFuncManage.ajaxAfterHandler,
        // 获取页面数据
        getPageData : dataManage.getPageData,
        // 设置页面数据
        setPageData : dataManage.setPageData,
        // 清空页面数据
        clearPageData : dataManage.clearPageData,
        // 通过草稿箱设置页面数据
        setValueByDraft : dataManage.setValueByDraft,
    };
})(jQuery);