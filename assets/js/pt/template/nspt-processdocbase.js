/*
 * @Author: netstar.lxh
 * @Date: 2018-12-25 13:27:47
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2019-04-15 18:11:00
 * @Desription: 文件说明
 */
NetstarTemplate.templates.processDocBase = (function ($) {
   var originConfig = {}; //该组件传参原始对象
   var config = {}; //该组件使用对象
   var pageExtraData = {};   //页面打开状态
   var templateName = 'processDocBase';
   //初始化
   function init(outerConfig, _componentConfig) {
      setDefault(outerConfig);
      buildDefaultContainer();
      setDefaultData(function () {
         getRemainHeight();
         formatComponents(config.components);
         setIdFieldNames(config);
         buildContainer();
         renderComponents();
         setTemplateBasedName();
         // 设置草稿箱按钮
         // NetstarTemplate.draft.setBtns(config);
         config.templateDisabled(config, config.readonly, false);
      });
   }
   //组件初始化
   function componentInit(outerConfig, _componentConfig) {
      setDefault(outerConfig, _componentConfig);
      buildDefaultContainer();
      setDefaultData(function () {
         getRemainHeight();
         formatByComponentConfig();
         formatComponents(config.components);
         buildContainer();
         renderComponents();
      });
      // newVue();
      return {
         selectHandler: function () {
            return getSelectData();
         },
         addHandler: function () {
            console.log("添加");
         },
         queryHandler: function () {
            console.log("选中");
         }
      };
   }
   //设置默认值
   function setDefault(outerConfig, _componentConfig) {
      originConfig = $.extend(true, {}, outerConfig);
      config = $.extend(true, {}, outerConfig);
      //设置默认值
      var defaultConfig = {
         template: 'processDocBase',
         formatComponentsArr: [],//将components的字段保存
         allData: {},//所有的数据
         serverData: {},
         defaultData: {},
         idFieldNames: {},
         extraKeyField: [],
         baseId: config.id + '-',//baseId
         _componentConfig: _componentConfig,
         pageHeight: $('body').height(), //页面高度
         tabKeyFieldObj:{},//sjj 201905017 存放compontents中type类型为tab的配置
      };
      nsVals.setDefaultValues(config, defaultConfig);
      $.each(config.components, function (index, item) {
         var obj = {
            position: 'body',
            keyField: 'root',
            parent: 'root'
         };
         nsVals.setDefaultValues(item, obj);
         switch(item.type){
            case 'btns':
               if(config.draftBox && config.draftBox.isUse == true){
                  if(config.draftBox.isUseSave){
                     var draftBoxSaveBtn = {
                        btn : {
                           text : '保存草稿',
                           isReturn : true,
                           handler : (function(_config){
                              return function(){
                                 NetstarTemplate.draft.btnManager.save(_config);
                              }
                           })(config),
                           // function(){
                           //    NetstarTemplate.draft.btnManager.save(config);
                           // }
                        },
                        functionConfig : {},
                     }
                     item.field.push(draftBoxSaveBtn);
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
                        // handler : function(){
                        //    NetstarTemplate.draft.btnManager.show(config);
                        // },
                     },
                     functionConfig : {},
                  }
                  item.field.push(draftBoxBtn);
               }
               break;
         }
      });
      getParentChildRelation(config.components);
      NetstarTemplate.draft.setConfig(config); // 设置草稿箱相关参数
      //sjj 20190517 添加是否使用isListTabs属性 作用list列表是否以tab形式展现
      config.isListTabs = typeof(config.isListTabs)=='boolean' ? config.isListTabs : false;
      //console.log(config);
   }

   // 通过按钮的英文名从页面中获取 按钮配置 lyw 2019/05/10
   function getPageBtnConfigByEnglishName(pageConfig, btnEnglishName){
      var btnConfig = false;
      var components = pageConfig.components;
      for(var i=0; i<components.length; i++){
         if(components[i].type != 'btns'){
            continue;
         }
         var field = components[i].field;
         if(!$.isArray(field)){
            continue;
         }
         for(var j=0; j<field.length; j++){
            if(field[j].functionConfig.englishName == btnEnglishName){
               btnConfig = field[j].functionConfig;
               break;
            }
         }
         if(btnConfig){
            break;
         }
      }
      return btnConfig;
   }
   //业务组件
   var busComponents = {
      businessbase: {
         init: function (data) {
            // getOtherPageConfig('/index/businessbase', 'businessbase');
            var _this = this;
            var btnGroupHtml = '<div class="pt-panel"><div class="btn-group" id="pt-processdocbase-saletemplate-businessbase-btn"></div></div>';
            var panelInitParams = {
               pageParam: { value: "1" },               // 传输参数 value：查询值 input的输入值
               config: _this.config,                     // 模板配置 通过请求的页面拿到的
               componentConfig: {
                  container: data.config.bodyId,                         // 容器 （id或class）通过组件拿到（组件配置）
                  selectMode: 'checkbox',     // 单选 多选 不能选 通过组件拿到（组件配置）
                  componentClass: 'list',                         // 组件类别 默认list
                  doubleClickHandler: function (value) {                // 显示弹框 传入的双击方法 （关闭弹框和刷新value/inputText）
                     console.log(value);
                     NetstarComponent.dialog[data.config.id].vueConfig.close();
                  },
               },
            };
            var morePanel = NetstarTemplate.componentInit(panelInitParams);
            //弹窗下方按钮初始化
            var dialogBtns = [
               {
                  text: "选中",
                  handler: function () {
                     morePanel.selectHandler();
                  }
               },
               {
                  text: "添加",
                  handler: function () {
                     morePanel.addHandler();
                  }
               },
               {
                  text: "查看单位基本信息",
                  handler: function () {
                     morePanel.queryHandler();
                  }
               },
               {
                  text: "关闭",
                  handler: function () {
                     NetstarComponent.dialog[data.config.id].vueConfig.close();
                  }
               }
            ];
            dialogBtns = NetstarTemplate.getBtnArrayByBtns(dialogBtns);
            var navConfig = {
               pageId: "pt-processdocbase-saletemplate",
               id: "pt-processdocbase-saletemplate-businessbase-btn",
               btns: dialogBtns
            };
            $('#' + data.config.footerIdGroup).append(btnGroupHtml);
            vueButtonComponent.init(navConfig);
         },
         setConfig: function (config) {
            var _this = this;
            this.config = config;
            var dialog = {
               id: "otherPageGoodsDialog",
               // width: '50%',
               // height: 300,
               title: '选择商品',
               templateName: 'PC',
               showHandler: function (data) { },
               shownHandler: function (data) {
                  _this.init(data);
               }
            };
            //弹窗初始化
            NetstarComponent.dialogComponent.init(dialog);
         }
      },
      addInfoDialog: {
         init: function () { },
         setConfig: function (outerConfig, extraData, btnEnglishName) {
            var extraData = $.extend(true, {}, extraData);
            var currentConfig = $.extend(true, {}, outerConfig);
            var pageConfig = config;
            typeof extraData.package != 'undefined' ? pageConfig = getConfigBypackage(extraData.package).config : '';
            typeof extraData.isInit != 'boolean' ? extraData.isInit = true : '';

            getParentChildRelation(currentConfig.components, undefined, pageConfig);
            setIdFieldNames(currentConfig, pageConfig);

            var pageData = getPageData(pageConfig.package, false);
            for (var index = 0; index < pageConfig.extraKeyField.length; index++) {
               var item = pageConfig.extraKeyField[index];
               currentConfig.pageParam[item] = pageData[item];
            }

            /***** 获取当前页面参数 跟据 formatValueData : {"aa":"{page.customer.aa}"}  lyw20190510 start ******/
            // 点击按钮配置
            var btnConfig = getPageBtnConfigByEnglishName(pageConfig, btnEnglishName);
            // 需要格式化的formatValueData : '{"bb":{"aa":"{page.customer.aa}"}}'
            var formatValueData = btnConfig.formatValueData; 
            // 转化对象
            if(typeof(formatValueData) == "string" && formatValueData.length>0){
               formatValueData = JSON.parse(formatValueData);
            }
            if(typeof(formatValueData) == "object"){
               var valueData = {};
               for(var key in formatValueData){
                  valueData[key] = nsVals.getVariableJSON(formatValueData[key], pageData);
               }
               if(valueData){
                  for(var key in valueData){
                     for(var fieldKey in valueData[key]){
                        if(valueData[key][fieldKey]){
                           currentConfig.pageParam[key] = typeof(currentConfig.pageParam[key]) == "object" ? currentConfig.pageParam[key] : {};
                           currentConfig.pageParam[key][fieldKey] = valueData[key][fieldKey];
                        }
                     }
                  }
               }
            }
            /***** 获取当前页面参数 跟据 getValues : {"aa":"{page.customer.aa}"}  lyw20190510 end ******/

            /***** 读取按钮配置 lyw 20190515 star *****/
            var defaultReadBtnConfig = {
               isHaveSaveAndAdd : false,
               getDataByAjax : {},
            };
            for(var key in defaultReadBtnConfig){
               currentConfig[key] = typeof(defaultReadBtnConfig[key]) == typeof(btnConfig[key]) ? btnConfig[key] : defaultReadBtnConfig[key];
            }
            /***** 读取按钮配置 lyw 20190515 end *****/
            //sjj 20190516 界面来源参
            nsVals.extendJSON(currentConfig.pageParam,pageData);
            currentConfig.size = 'md';
            currentConfig.closeHandler = function (data) {
               if (typeof data != 'undefined' && !$.isEmptyObject(data)) {
                  //在这里直接放到pageData就可以了，这里返回带有keyfield的数据
                  for (var key in data) {
                     if (data.hasOwnProperty(key)) {
                        var element = data[key];
                        switch ($.type(element)) {
                           case 'array':
                              if(pageConfig.mainGrid){
                                 if(key != pageConfig.mainGrid.keyField){
                                    pageConfig.serverData[key] = $.extend(true, [], element);
                                 }
                              }
                              break;
                           case 'object':
                              pageConfig.serverData[key] = $.extend(true, {}, element);
                              break;

                           default:
                              break;
                        }
                     }
                  }
               }
            };
            extraData.isInit ? NetstarTemplate.init(currentConfig) : '';
         }
      }
   };
   //根据 _componentConfig.componentClass 剔除其他
   function formatByComponentConfig() {
      if (config._componentConfig.componentClass == 'list') {
         for (var index = 0, len = config.components.length; index < len; index++) {
            var item = config.components[index];
            if (item.type != 'list') {
               config.components.splice(index, 1);
               index--;
               len--;
            } else {
               config._componentConfig.listId = item.id;
            }
         }
      }
   }
   //格式化各个组件
   function formatComponents(components, _config) {
      typeof _config != 'undefined' ?
         config = _config :
         "";
      var listNum = 0;
      $.each(components, function (index, item) {
         switch (item.type) {
            case 'vo':
               config.formatComponentsArr.push(formatForm(item));
               break;
            case 'list':
               config.formatComponentsArr.push(getGridConfig(item));
               //sjj 20190517 记录当前模版中使用了几个list
               listNum++;
               break;
            case 'btns':
               config.formatComponentsArr.push(getBtnsConfig(item));
               break;
            case 'tab':
               //sjj 20190517 配置了tab配置 当前模版只能配置一个type类型为tab的
               config.tabKeyFieldObj = item;
               break;
            default:
               break;
         }
      });
      //sjj 20190517 如果当前listNum大于1并且components中存在type为tab的配置项 则当前模版使用tab
      if(!config.isListTabs){
         if(listNum > 1 && !$.isEmptyObject(config.tabKeyFieldObj)){
            config.isListTabs = true;
         }
      }
   }
   //格式化表格
   function formatForm(formConfig) {
      var formValue = getDataByKeyField(formConfig.keyField) || {};
      var formJson = {};
      formJson.id = formConfig.id;
      //添加默认配置
      for (var key in formConfig) {
         if (formConfig.hasOwnProperty(key)) {
            var element = formConfig[key];
            if (key != 'id' && key != 'form') {
               formJson[key] = element;
            }
         }
      }
      //设置只读 值
      $.each(formConfig.field, function (index, item) {
         // item.readonly = typeof config.readonly == 'boolean' ? config.readonly : false;
         //设置值
         if (!$.isEmptyObject(formValue)) {
            if(typeof(formValue[item.id]) != "undefined"){
               item.value = formValue[item.id];
            }
         }
         //设置隐藏字段 
         if ($.inArray(item.id, formConfig.hide) != -1) {
            item.type = 'hidden';
         }
         //如果有业务组件，则设置idFieldNames
         if (item.type == 'business') {
            config.idFieldNames['root.' + item.id] = item.idField;
         }
      });
      formJson.form = formConfig.field;
      var componentConfig = {
         config: formJson,
         id: formJson.id,
         type: 'vo',
         renderType: 'form',
         templateOptions: formConfig,
      };
      return componentConfig;
   }
   //格式化Grid cy 20181228
   function getGridConfig(pageListOptions) {
      /**
       * pageListOptions:object 参数举例：
       * {
       *    btns: [{…}]
       *    delete: {type: "dialog", text: "删除商品别名{name}"}
       *    field: (10) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
       *    flagField: "flag"
       *    idField: "itemCode"
       *    keyField: "child"
       *    parent: "GoodsPlatformList"
       *    position: "body"
       *    title: "商品标题"
       *    type: "list"
       * }
       */
      var options = pageListOptions;
      //拿到默认数据
      typeof options.dataSource == 'undefined' ? options.dataSource = [] : '';
      var defaultGridData = getDataByKeyField(options.keyField);
      $.merge(options.dataSource, defaultGridData && !$.isEmptyObject(defaultGridData) && $.isArray(defaultGridData[options.keyField]) ? defaultGridData[options.keyField] : []);
      var gridConfig = {
         /** 数据配置
          *       当前模板中grid是编辑模式
          *       表格数据是单据数据的一部分，直接以dataSource方式从整体数据对象中获取
          */
         columns: options.field,
         data: {
            idField: options.idField,
            tableID: options.id,
            dataSource: [], //options.dataSource
         },
         ui: {
            isAutoSerial: true,   //是否开启自动序列列 最前面那个1,2,3,4的列
            isCheckSelect: false,  //是否开启check select选中行  尽在支持多选状态下可用
            isHeader: false,
            isPage: false,
            minPageLength: 10,
            // height: 400,
            // isEditMode: typeof config.readonly == 'boolean' ? !config.readonly : true, //编辑模式
            isEditMode: true, //编辑模式
            pageLengthMenu: [20, 50, 100, 200],  //每页多少
            pageLengthDefault: 20,               //默认分页数量
            selectMode: 'single',                //多选multi none single
            isHaveEditDeleteBtn: typeof options.isHaveEditDeleteBtn == 'boolean' ? options.isHaveEditDeleteBtn : true,
            isAllowAdd: typeof options.isAllowAdd == 'boolean' ? options.isAllowAdd : true
         }
      };
      var componentConfig = {
         config: gridConfig,
         id: options.id,
         type: 'list',
         renderType: 'grid',
         templateOptions: options,
      };

      return componentConfig;
   }
   //格式化 btns
   function getBtnsConfig(btns) {
      var optionsConfig = {
         dialogBeforeHandler: (function (config) {
            return function (data) {
               //{"customerId":"{customerVo.customerId}","goodsShopId":"{saleDetailVoList.goodsShopId}",'saleWarehouseId':"{saleWarehouseId}"}
               //{"customerId":"客户必填","saleWarehouseId":"货位必填","goodsShopId":"货品必填"} validateParams   
              //data.controllerObj.parameterFormat
               //sjj 20190514 如果配置了验证参数，则获取界面值不需要进行验证，而是对当前界面值的部分配置参数值进行验证
               var isValidatParams = true;//是否对界面获取值进行验证参数
               var isParmeterFormat = true;
               if(data.controllerObj){
                  //读取到了ajax的配置相关项
                  if(data.controllerObj.validateParams){
                     //并且定了配置属性
                     switch(typeof(data.controllerObj.validateParams)){
                        case 'string':
                           isValidatParams = false;
                           isParmeterFormat = false;
                           if(typeof(data.controllerObj.parameterFormat)=='undefined'){
                              isValidatParams = true;
                           }
                           break;
                     }
                  }
                  if(data.controllerObj.defaultMode == 'successMessage'){
                     isValidatParams = false;
                  }
               }
               var pageData = getPageData(config.package,isValidatParams);//获取界面参
               data.config = config;//当前界面的config配置参数
               if(!isParmeterFormat){
                  if(data.controllerObj.defaultMode == 'successMessage'){
                     //successMessage 不需要对值验证，弹出来的窗体上有三个按钮 三个按钮再验证 sjj 20190612 不需要验证
                  }else{
                        //仅需要有针对性某些值进行验证
                        var validateParams = JSON.parse(data.controllerObj.validateParams); //验证提示语 
                        if(data.controllerObj.parameterFormat){
                           var parameterFormat = JSON.parse(data.controllerObj.parameterFormat);//转换的数据参数
                           var listDataRequestSource = data.controllerObj.requestSource;//当前按钮的配置源checkbox /selected
                           if(listDataRequestSource != 'checkbox'){
                              if(config.mainGrid){
                                 if(config.mainGrid.id){
                                    var selectData = NetStarGrid.getSelectedData(config.mainGrid.id);
                                    //读取单行选中值
                                    if(selectData.length > 0){
                                       nsVals.extendJSON(pageData,selectData[0]);
                                    }
                                 }
                              }
                           }
                           var chargeData = NetStarUtils.getFormatParameterJSON(parameterFormat,pageData);//获取到转换的数据值
                           var validateStrArray = [];//验证提示语
                           for(var chargeparam in chargeData){
                              if(validateParams[chargeparam]){
                                 var validateStr = validateParams[chargeparam];
                                 var isPush = false;
                                 switch(typeof(chargeData[chargeparam])){
                                    case 'string':
                                       if(chargeData[chargeparam] == ''){
                                          isPush = true;
                                       }
                                       break;
                                    case 'number':
                                       if(isNaN(chargeData[chargeparam])){
                                          isPush = true;
                                       }
                                       break;
                                    case 'object':
                                       if($.isEmptyObject(chargeData[chargeparam])){
                                          isPush = true;
                                       }
                                       break;
                                    default:
                                       break;
                                 }
                                 if(isPush){
                                    validateStrArray.push(validateStr);
                                 }
                              }
                           }
                           if(chargeData == false){
                              for(var validfield in validateParams){
                                 validateStrArray.push(validateParams[validfield]);
                              }
                           }
                           if(validateStrArray.length > 0){
                              data.value = false;
                              nsalert(validateStrArray.join(' '),'warning');
                           }else{
                              data.value = chargeData;
                           }
                        }else{
                           if(pageData){
                              var isValid = NetStarUtils.getPageValidResult(pageData,data.controllerObj.validateParams);
                              if(isValid == false){
                                 //验证失败不执行
                                 data.value = false;
                              }else{
                                 data.value = pageData;
                              }
                           }else{
                              data.value = pageData;
                           }
                        }
                  }
               }else{
                  if (!pageData) return data;
                  data.value = pageData;
                  if (typeof data.controllerObj.requestSource != 'undefined') {
                     if(config.mainGrid){
                        if(config.mainGrid.id){
                           var selectData = NetStarGrid.getSelectedData(config.mainGrid.id);
                           switch (data.controllerObj.requestSource) {
                              case 'selected':
                                 //vo
                                 for (var key in selectData[0]) {
                                    if (selectData[0].hasOwnProperty(key)) {
                                       var element = selectData[0][key];
                                       if (!!data.value) {
                                          //data.value[key] = element;
                                          //sjj 20190506 则当前存储数据值应该是当前的vo值
                                          data.value = selectData[0];
                                          break;
                                       }
                                    }
                                 }
                                 break;
                              case 'checkBox':
                                 //selectedList
                                 if (!!data.value) {
                                    data.value.selectedList = selectData;
                                 }
                                 break;
         
                              default:
                                 break;
                           }
                        }
                     }
                  }
               }
               return data;
            }
         })(config),
         ajaxBeforeHandler: (function (config) {
            return function (handlerObj) {
               handlerObj.config = config;
               if ($.isEmptyObject(handlerObj.dialogBeforeConfig)) {
                  handlerObj.dialogBeforeConfig = { value: getPageData(config.package) };
               }
               return handlerObj;
            }
         })(config),
         ajaxAfterHandler: (function (config) {
            return function (data, plusData) {
               var currentConfig = getConfigBypackage(config.package).config;
               if (typeof plusData != 'undefined' && plusData.isCloseWindow) {
                  if (typeof config.parentSourceParam != 'undefined') {
                     NetstarTemplate.refreshByPackage(config.parentSourceParam, data,plusData);
                     // NetstarTemplate.templates.docListViewer.refreshData(config.parentSourceParam, data);
                     NetstarUI.labelpageVm.removeCurrent();
                  } else {
                     console.error('上一页面没有传递参数，不刷新父页面');
                     NetstarUI.labelpageVm.removeCurrent();
                  }
                  return;
               }
               switch (data.objectState) {
                  case NSSAVEDATAFLAG.DELETE:
                     //删除
                     //编辑成功后关闭页面
                     $('#' + currentConfig.containerHeaderId).empty();
                     $('#' + currentConfig.containerBodyId).empty();
                     //$('#' + currentConfig.containerBodyId).css('max-height', 0);
                     $('#' + currentConfig.containerFooterId).empty();
                     buildContainer(currentConfig);
                     currentConfig.serverData = {};
                     renderComponents($.extend(true, {}, currentConfig));
                     break;
                  case NSSAVEDATAFLAG.NULL:
                     //无操作
                     break;
                  case NSSAVEDATAFLAG.ADD:
                  case NSSAVEDATAFLAG.EDIT:
                  case NSSAVEDATAFLAG.VIEW:
                     //新增
                     //编辑
                     data = nsServerTools.setObjectStateData(data);
                     currentConfig.serverData = data;
                     refreshCompnent(currentConfig.package,data);
                     break;
                  default:
                     break;
               }
               if(plusData.clickBtnType == "isUseSave" || plusData.clickBtnType == "isUseSaveSubmit" || plusData.isIsSave){
                  var _currentConfig = NetstarTemplate.draft.configByPackPage[currentConfig.package];
                  if(_currentConfig && _currentConfig.draftBox){
                     delete _currentConfig.draftBox.useDraftId;
                  }
               }
            };
         })(config),
         loadPageHandler: function (data) {
            return data;
         },
         closePageHandler: function (data) {
            console.log(data);
         }
      };
      var defaultModeArr = ['addInfoDialog'];
      var package = config.package.replace(/\./g, '-');
      // addOtherBtns();
      //页面下方按钮初始化
      var btnsArray = $.extend(true, [], btns.field);
      btnsArray = NetstarTemplate.getBtnArrayByBtns(btnsArray);
      //查看是否有弹窗
      for (var i = 0; i < btns.field.length; i++) {
         var item = btns.field[i];
         if (typeof item.functionConfig == 'object' && $.inArray(item.functionConfig.defaultMode, defaultModeArr) != -1) {
            var functionConfig = item.functionConfig;
            var suffix = functionConfig.suffix;
            var defaultMode = functionConfig.defaultMode;
            btnsArray[i].handler = function () {
               getOtherPageConfig(suffix, defaultMode, {
                  keyField: functionConfig.keyField,
                  package: package.replace(/-/g, '.')
               }, functionConfig);
            };
            btnsArray[i].text = functionConfig.text;
         }
         /* if (item.btn.text == '保存|提交') {
            btnsArray[i].parentSourceParam = $.extend(true, {}, config.parentSourceParam);
            btnsArray[i].callBackHandler = (function (config) {
               return function () {
                  if (typeof config.parentSourceParam != 'undefined') {
                     NetstarUI.labelpageVm.removeCurrent();
                     NetstarTemplate.templates.docListViewer.refreshData(config.parentSourceParam, data);
                  }
               };
            })(config);
         } */
      }
      //渲染按钮
      var btnsConfig = {
         pageId: package,
         package:config.package,
         id: btns.id,
         btns: btnsArray,
         callback: optionsConfig
      };
      var componentConfig = {
         config: btnsConfig,
         id: btns.id,
         type: 'btns',
         renderType: 'btns',
         templateOptions: btns,
      };

      return componentConfig;
   }

   //构建页面容器
   function buildContainer(_config, _listDrag) {
      //可拖拽设置要用到的属性
      var dragContainerId = "", ltId = '', rbId = '';
      var dragMode = typeof _listDrag == 'boolean' ? _listDrag : false;
      //根据传进来的config来格式化
      typeof _config != 'undefined' ?
         config = _config :
         "";
      //创建容器
      var $container = $('#' + config.containerId);
      var baseHtml = '<div class="pt-panel">\
                           <div class="pt-container">\
                              <div class="pt-panel-row">\
                                 <div class="pt-panel-col"></div>\
                              </div>\
                           </div>\
                        </div>';
      //构建容器
      /***********sjj 20190517 针对list显示为tab的展现形式添加判断 start********************************** */
      var tabListArray = [];
      var tabKeyFieldStr = '';
      if(config.isListTabs){
         tabKeyFieldStr = config.tabKeyFieldObj.field;
      }
      /***********sjj 20190517 针对list显示为tab的展现形式添加判断 start********************************** */
      $.each(config.components, function (index, item) {
         //创建面板并添加
         var $currentContainer = $(baseHtml);
         var $insertion = $currentContainer.find('.pt-panel-col');
         var positionContainer = item.position.split('-')[0] ? item.position.split('-')[0] : "";
         var position = item.position.split('-')[1] ? item.position.split('-')[1] : "";
         position != "" ? $insertion.addClass('text-' + position) : '';
         //找到要添加到的框架
         var $currentPosition;
         switch (positionContainer) {
            case 'header':
               $currentPosition = $('#' + config.containerHeaderId)
               break;
            case 'body':
               $currentPosition = $('#' + config.containerBodyId)
               break;
            case 'footer':
               $currentPosition = $('#' + config.containerFooterId)
               break;

            default:
               break;
         }
         switch (item.type) {
            case 'vo':
               $insertion.append('<div id="' + item.id + '"></div>');
               $currentPosition.append($currentContainer);
               break;
            case 'list':
               //是否可以拖拽
               var dragId = "";
               var dragConId = config.baseId + 'dragContainer';
               if (dragMode) {
                  dragId = item.id + "-drag-" + index;
                  ltId == "" ? ltId = dragId : rbId = dragId;
                  if ($currentPosition.find('#' + dragConId).length == 0) {
                     $currentPosition.append('<div id="' + dragConId + '"></div>');
                     dragContainerId == "" ? dragContainerId = dragConId : "";
                  }
               };
               /***********sjj 20190517 针对list显示为tab的展现形式添加判断 start********************************** */
               var isContinueAppend = true;
               if(typeof(item.isListTabs)=='boolean'){
                  if(item.isListTabs){
                     isContinueAppend = false;
                     tabListArray.push(item);
                  }
               }else{
                  if(tabKeyFieldStr){
                     if(tabKeyFieldStr.indexOf(item.keyField)>-1){
                        isContinueAppend = false;
                        tabListArray.push(item);
                     }
                  }
               }
               /***********sjj 20190517 针对list显示为tab的展现形式添加判断 end********************************** */
               //构建组件
               if(isContinueAppend){
                     var gridHtml =
                     '<div class="pt-panel ' + (rbId != '' && dragMode ? 'pt-panel-toggle' : "") + '" id="' + dragId + '">\
                        <div class="pt-container">\
                           <div id="' + item.id + '"></div>\
                        </div>\
                     </div>';
                  $currentPosition.find('#' + dragConId).length != 0
                     ? $currentPosition.find('#' + dragConId).append(gridHtml)
                     : $currentPosition.append(gridHtml);
               }
               break;
            case 'btns':
               var extraClass = position != "" ? "text-" + position : '';
               $insertion.closest('.pt-container').prepend('<div class="pt-panel-row">\
                                    <div class="pt-panel-col '+ extraClass + '">\
                                       <div class="btn-select-info-group" id="'+ item.id + '-btn-info">\
                                       </div>\
                                    </div>\
                                 </div>');
               $insertion.append('<div class="btn-group" id="' + item.id + '"></div>');
               $currentPosition.append($currentContainer);
               break;
            case 'tab':
               break;
            default:
               if (debugerMode) {
                  console.error('不能识别的组件：' + item.type);
               }
               break;
         }
      });
      /**************sjj 20190517 针对list显示tab的展现形式 start**************************************************** */
      if(config.isListTabs){
         var tabLiHtml = '';
         var tabContentHtml = '';
         for(var tabI=0; tabI<tabListArray.length; tabI++){
            var tabData = tabListArray[tabI];
            var classStr = 'component-list pt-nav-item';//class名称
            var activeClassStr = '';
            if(tabI == 0){activeClassStr = 'current';}
            tabLiHtml += '<li class="'+classStr+' '+activeClassStr+'" ns-index="'+tabI+'">'
                        +'<a href="javascript:void(0);" ns-href-id="'+tabData.id+'">'
                           +tabData.title
                        +'</a>'
                     +'</li>';
            tabContentHtml += '<div class="pt-tab-content '+activeClassStr+'">'
                           +'<div class="pt-tab-components" id="'+tabData.id+'"></div>'
                        +'</div>';
         }
         var tabHtml = '<div class="pt-tab-components-tabs pt-tab" style="height:'+config.remainHeight+'px;max-height:'+config.remainHeight+'px;">'
									+'<div class="pt-container">'
										+'<div class="pt-tab-header">'
											+'<div class="pt-nav">'
												+'<ul class="pt-tab-list-components-tabs">'
													+tabLiHtml
												+'</ul>'
											+'</div>'
										+'</div>'
										+'<div class="pt-tab-body">'
											+tabContentHtml
										+'</div>'
									+'</div>'
                        +'</div>';
         var html = '<div class="pt-panel">'
                        +'<div class="pt-container">'
                           +tabHtml
                        +'</div>'
                     +'</div>';  
         config.remainHeight -= 43;            
         if($('#'+config.containerBodyId+' [nsgirdpanel="grid-el"]').length>1){
            var $lastListContainer = $('#'+config.containerBodyId+' [nsgirdpanel="grid-el"]:last').closest('.pt-panel');
            $lastListContainer.after(html);
         }else{
            var $lastListContainer = $('#'+config.containerBodyId);
            $lastListContainer.prepend(html);
         }
      }
      /**************sjj 20190517 针对list显示tab的展现形式 end**************************************************** */
      return {
         dragId: {
            dragContainerId: dragContainerId,
            ltId: ltId,
            rbId: rbId
         }
      };
   }

   //渲染form table组件
   function renderComponents(_config, cb) {
      typeof _config != 'undefined' ?
         config = _config :
         "";
      var once = false;
      for (var index = 0, len = config.formatComponentsArr.length; index < len; index++) {
         var item = config.formatComponentsArr[index];
         switch (item.renderType) {
            case 'form':
               //添加表格回车换行方法
               // item.config.blurHandler = (function (config) {
               //    return function () {
               //       //sjj 20190408 此模版会不存在表格的情况此时不可调用表格设置焦点 临时解决 需要晓航回来自己修改
               //       if (config.mainGrid) {
               //          NetStarGrid.setFirstEditRowState(config.mainGrid.id);
               //       }
               //    };
               // })(config);
               // 只在表格的前一个表单添加回车回调 即 表单失去焦点表格获得焦点 lyw 20190617 star -----
               if(typeof(config.formatComponentsArr[index+1]) == "object" && config.formatComponentsArr[index+1].type == "list"){
                  item.config.blurHandler = (function (config) {
                     return function () {
                        //sjj 20190408 此模版会不存在表格的情况此时不可调用表格设置焦点 临时解决 需要晓航回来自己修改
                        if (config.mainGrid) {
                           NetStarGrid.setFirstEditRowState(config.mainGrid.id);
                        }
                     };
                  })(config);
               }
               // 只在表格的前一个表单添加回车回调 即 表单失去焦点表格获得焦点 lyw 20190617 end -----
               item.config.completeHandler = function () {
                  cb && cb();
               }
               var formValue = getDataByKeyField(item.config.keyField);
               var component = NetstarComponent.formComponent.getFormConfig(item.config, formValue);
               //改为闭包
               item.config.getPageDataFunc = (function (config) {
                  return function () {
                     // return getPageData(config.package, false);
                     return getPageSourceData(config.package, false);
                  };
               })(config);
               NetstarComponent.formComponent.init(component, item.config);
               break;
            case 'grid':
               var gridConfig = item.config;
               gridConfig.data.dataSource = item.config.data.dataSource;  //临时加上的数据源
               //如果在页面中指定了dataSource则添加到grid配置参数data.dataSource中 cy 20190124
               if ($.isArray(item.templateOptions.dataSource)) {
                  gridConfig.data.dataSource = item.templateOptions.dataSource;
               }
               if (once) {
                  getRemainHeight();
                  once = false;
               }
               gridConfig.ui.height = config.remainHeight;
               //发送函数名用来获取数据
               for (var i = 0; i < gridConfig.columns.length; i++) {
                  var itm = gridConfig.columns[i];
                  if (typeof itm.editConfig != 'undefined' && itm.editConfig.type == 'business') {
                     //改为闭包
                     itm.editConfig.getTemplateValueFunc = (function (config) {
                        return function () {
                           return getPageData(config.package, false);
                        };
                     })(config);
                  }
               }
               gridConfig.getPageDataFunc = (function (config) {
                  return function () {
                     return getPageData(config.package, false);
                  };
               })(config);
               NetStarGrid.init(gridConfig);
               break;
            case 'btns':
               vueButtonComponent.init(item.config);
               addBtnsInfo(item.templateOptions);
               break;

            default:
               break;
         }
      }

      //切换详情表的tab
      function detailListTabHandler(ev){
         var $this = $(this);
         var $li = $this.closest('li');
         var id = $this.attr('ns-href-id');
         var $dom = $('#'+id).closest('.pt-tab-content');
         $li.addClass('current');
         $li.siblings().removeClass('current');
         $dom.addClass('current');
         $dom.siblings().removeClass('current')
      }
      var $lis = $('#'+config.containerBodyId+' ul.pt-tab-list-components-tabs > li');
		$lis.children('a').off('click',detailListTabHandler);
		$lis.children('a').on('click',detailListTabHandler);
   }
   //添加按钮显示信息
   function addBtnsInfo(templateOptions) {
      for (var index = 0; index < templateOptions.field.length; index++) {
         var item = templateOptions.field[index];
         if (item.functionConfig.defaultMode == 'addInfoDialog') {
            var functionConfig = item.functionConfig;
            var suffix = functionConfig.suffix;
            var defaultMode = functionConfig.defaultMode;
            getOtherPageConfig(suffix, defaultMode, {
               isInit: false,
               package: config.package
            }, functionConfig);
         }
      }
      //添加按钮选择信息显示
      /* for (var i = 0, len = templateOptions.field.length; i < len; i++) {
         var item = templateOptions.field[i];
         var englishName = item.functionConfig ? item.functionConfig.englishName : "";
         $('#' + templateOptions.id + '-btn-info').append('<div ns-btnId="' + englishName + '" class="btn-select-info" fid="' + i + '"><span></span></div>');
      }
      getAjaxDataByConfig(templateOptions.field, 'btn', function (pageData) {
         templateOptions.getValueForBtns = pageData;
         var keys = Object.keys(templateOptions.getValueForBtns);
         $.each(keys, function (index, item) {
            var currentBtnSpan = $('div[ns-btnid=' + item + ']>span');
            var text = templateOptions.getValueForBtns[item].state ? templateOptions.getValueForBtns[item].state : templateOptions.getValueForBtns[item].goodsNum;
            currentBtnSpan.text(text);
         });
      }); */
   }

   //设置默认的getValueAjax
   function setDefaultData(cb) {
      //拿到传过来的 页面的包名 和 idField，拿完删除
      if (typeof config.pageParam != 'undefined' && typeof config.pageParam.parentSourceParam != 'undefined') {
         config.parentSourceParam = $.extend(true,{},config.pageParam.parentSourceParam);
         delete config.pageParam.parentSourceParam;
      }

      for (var i = 0; i < config.components.length; i++) {
         var item = config.components[i];
         //拿到主表id
         if (item.type == 'list' && typeof config.mainGrid == 'undefined') {
            config.mainGrid = {};
            config.mainGrid.id = item.id;
            config.mainGrid.idField = item.idField;
            config.mainGrid.keyField = item.keyField;
         }
      }
      //请求ajax，拿到页面初始值
      if (typeof config.getValueAjax != 'undefined' && !$.isEmptyObject(config.getValueAjax)) {
         /* var ajax = nsVals.getAjaxConfig(config.getValueAjax, config.pageParam, {
            idField: config.idField,
            keyField: config.keyField
         }); */
         if(!$.isEmptyObject(config.getValueAjax.data)){
            //sjj 20190527
            config.getValueAjax.data = NetStarUtils.getVariableJSON(config.getValueAjax.data,config.pageParam);
         }else{
            config.getValueAjax.data = config.pageParam;
         }
         NetStarUtils.ajax(config.getValueAjax, function (res) {
            if (res.success) {
               var resData = res[config.getValueAjax.dataSrc];
               //如果返回数据是
               if ($.isArray(resData)) {
                  if (typeof config.mainGrid == 'undefined') {
                     nsalert('请配置表格，否则无法显示信息.', 'error');
                     return false;
                  }
                  config.serverData[config.mainGrid.keyField] = resData;
                  config.defaultData[config.mainGrid.keyField] = resData;
               } else {
                  config.serverData = resData;
                  config.defaultData = resData;
               }
            } else {
               nsalert('服务器端返回数据错误');
               console.error(res);
            }
            cb && cb();
         }, true);
      } else {
         config.serverData = $.extend(true, {}, config.pageParam || {});
         config.defaultData = $.extend(true, {}, config.pageParam || {});
         cb && cb();
      }
   }
   //设置数据
   function setValue(data, _package) {
      var package;
      typeof _package == 'undefined' ? package = config.package : package = _package;
      getConfigBypackage(package).config.serverData = data;
      config.serverData = data;
      refreshCompnent(package);
   }
   // 根据草稿箱设置数据
   function setValueByDraft(data, _package){
      // 刷新组件数据
      refreshCompnent(_package, data);
   }
   //刷新页面数据
   function refreshCompnent(_package, data) {
      // data ：lyw 20190627 页面数据不是来源于服务端 来源草稿箱
      config = getConfigBypackage(_package).config;
      $.each(config.components, function (index, item) {
         var id = item.id;
         var keyField = item.keyField;
         var parent = item.parent;
         var fillValues = getDataByKeyField(keyField, data);
         if (item.type == 'vo') {
            !fillValues || $.isEmptyObject(fillValues)
               ? NetstarComponent.fillValues({}, id, true)//清空表单值
               : NetstarComponent.fillValues(fillValues, id, true);//赋值
         } else if (item.type == 'list') {
            !fillValues || $.isEmptyObject(fillValues)
               ? NetStarGrid.resetData([], id)//清空表单值
               : NetStarGrid.resetData(fillValues[keyField], id);//赋值
         }
      });
   }

   //可通用的
   /****************************设置主体框架 */
   function buildDefaultContainer() {
      config.containerId = config.baseId + 'container';
      config.containerHeaderId = config.baseId + 'header';
      config.containerBodyId = config.baseId + 'body';
      config.containerFooterId = config.baseId + 'footer';
      //设置页面框架
      config.$appendContainer = config._componentConfig
         ? $('#' + config._componentConfig.container).length > 0
            ? $('#' + config._componentConfig.container)
            : $('.' + config._componentConfig.container)
         : nsPublic.getAppendContainer();
      if(config.$container){
         config.$container.html('<div class="pt-main ' + templateName.toLowerCase() + '">\
                                    <div id="' + config.containerId + '">\
                                       <div id="' + config.containerHeaderId + '"></div>\
                                       <div id="' + config.containerBodyId + '"></div>\
                                       <div class="pt-template-footer" id="' + config.containerFooterId + '"></div>\
                                    </div>\
                                 </div>');
      }else{
         config.$appendContainer.append('<div class="pt-main ' + templateName.toLowerCase() + '">\
                                    <div id="' + config.containerId + '">\
                                       <div id="' + config.containerHeaderId + '"></div>\
                                       <div id="' + config.containerBodyId + '"></div>\
                                       <div class="pt-template-footer" id="' + config.containerFooterId + '"></div>\
                                    </div>\
                                 </div>');
                                 
      }
   }

   /****************************格式化数据关系 */
   //格式化父子关系
   function getParentChildRelation(components, _keyField, _config) {
      arguments.length == 3 ?
         config = _config :
         "";
      if (typeof _keyField != 'undefined') {
         $.each(components, function (index, item) {
            if (item.keyField == _keyField) {
               if (item.parent == 'root') {
                  config.parentChildRelation[_keyField] = "root" + "." + item.keyField;
               } else {
                  getParentChildRelation(components, item.parent);
                  config.parentChildRelation[_keyField] = config.parentChildRelation[item.parent] + '.' + item.keyField;
               }
            }
         });
      } else {
         typeof config.parentChildRelation == 'undefined' ?
            config.parentChildRelation = {} :
            "";
         $.each(components, function (index, item) {
            typeof item.parent == 'undefined' ? item.parent = 'root' : '';
            if (typeof item.parent == 'undefined' || typeof item.keyField == 'undefined') {
               return;
            }
            if (typeof config.parentChildRelation[item.keyField] != 'undefined') {
               return;
            }
            if (item.parent == 'root') {
               //拿到type=vo,parent = root的idField 和 keyField
               if (item.type == 'vo') {
                  config.idField = item.idField;
                  config.keyField = item.keyField;
               }
               if (item.keyField == 'root') {
                  config.parentChildRelation[item.keyField] = "root";
               } else {
                  config.parentChildRelation[item.keyField] = "root" + '.' + item.keyField;
               }
            } else {
               if (typeof config.parentChildRelation[item.parent] != 'undefined') {
                  config.parentChildRelation[item.keyField] = config.parentChildRelation[item.parent] + '.' + item.keyField;
               } else {
                  getParentChildRelation(components, item.parent);
                  config.parentChildRelation[item.keyField] = config.parentChildRelation[item.parent] + '.' + item.keyField;
               }
            }
         });
      }
   }
   //根据parent获得该组件数据
   function getDataByKeyField(keyField, data) {
      var pageData = typeof(data) == "object" ? data : config.serverData; // lyw 20190627 页面数据不是来源于服务端 来源草稿箱
      //如果没有当前keyField的，则返回
      if (typeof config.parentChildRelation[keyField] == 'undefined') return false;
      var currentRelation = config.parentChildRelation[keyField].replace(/root\./g, "");
      if (currentRelation != 'root') {
         var variableJson = {};
         variableJson[keyField] = "{" + currentRelation + "}";
         //根据类似 {a:"{parent.a}"} 的格式获得数据
         return nsServerTools.deleteEmptyData(nsVals.getVariableJSON(variableJson, pageData));
      } else {
         return nsServerTools.deleteEmptyData(pageData);
      }
   }

   /****************************获得idFieldNames */
   //获得idFieldNames
   function setIdFieldNames(_config, _setConfig) {
      typeof _config == 'undefined' ? '' : config = _config;
      config.panelConfig = {};
      for (var i = 0; i < config.components.length; i++) {
         var item = config.components[i];
         if (item.type == 'btns' || item.type == 'tab') continue;
         if (typeof _setConfig != 'undefined') {
            _setConfig.idFieldNames[_setConfig.parentChildRelation[item.keyField]] = item.idField;
            $.inArray(item.keyField, _setConfig.extraKeyField) == -1 ?
               _setConfig.extraKeyField.push(item.keyField) :
               '';
         } else {
            config.idFieldNames[config.parentChildRelation[item.keyField]] = item.idField;
         }
         config.panelConfig[item.containerId] = item;
      }
   }

   /****************************获取数据 */
   //拼接现有数据
   function getPageData(package, _formVerify, _setObjectState) {
      typeof _formVerify != 'boolean' ? _formVerify = true : '';
      if (getConfigBypackage(package)) {
         config = getConfigBypackage(package).config;
      }
      var pageData = $.extend(true, {}, config.serverData);
      var isError = false;
      var fillValue;
      for (var i = 0; i < config.components.length; i++) {
         var item = config.components[i];
         switch (item.type) {
            case 'vo':
               fillValue = NetstarComponent.getValues(item.id, _formVerify);
               /*sjj 20190515 start获取vo值 需要做进一步的判断逻辑 如果当前vo值存在于界面来源参pageParams中，则最后入参的参数取决于当前vo编辑是否有值*/
               /*比如vo{id:'333',name:'333',sex:'333'},pageParams:{id:'333',userid:'dddd'}此时vo中不存在userid是因为此值为数值类型，值为空所以无此参数
               ，而pageParams中存在，需要把userid从pageParms参数中移除
               */
               var voComponentConfig = NetstarComponent.config[item.id].config;
               for(var voField in voComponentConfig){
                  delete pageData[voField];
               }
               /*******sjj 20190515 end************/
               break;
            case 'list':
               fillValue = _formVerify ? verifyGridData(NetStarGrid.dataManager.getData(item.id), config, item.id) : NetStarGrid.dataManager.getData(item.id);
               /**********************sjj 20190521 start */
               //如果服务端数据list比当前操作list长度不一致 并且服务端返回数据值中不存在主键id  
               /**********************sjj 20190521 end */
               //config.serverData
               break;
            case 'btns':
            case 'tab':
               continue;
               break;

            default:
               break;
         }
         if (!fillValue) {
            isError = true;
            return false;
         }
         if (!(fillValue instanceof Array)) {
            //去除空值
            fillValue = nsServerTools.deleteEmptyData(fillValue);
         }
         setDataByKeyField(item.keyField, fillValue, pageData, config);
      }
      if (isError) return false;
      //将 allData 中的数据添加到pageData
      for (var key in config.allData) {
         if (config.allData.hasOwnProperty(key)) {
            var element = config.allData[key];
            if (key != 'objectState') {
               pageData[key] = element;
            }
         }
      }
      _setObjectState === false ? '' : pageData = nsServerTools.getObjectStateData(config.serverData, pageData, config.idFieldNames);
      //variableJson, variableData, _isAllowEmpty, _emptyValue  将数据格式化
      // nsVals.getVariableJSON(config.variableJson, pageData, true, "");
      for (var key in config.pageParam) {
         if (!pageData.hasOwnProperty(key)) {
            pageData[key] = config.pageParam[key];
         }
      }
      return pageData;
   }
   //根据keyField设置data
   function setDataByKeyField(keyField, data, pageData, config) {
      if (typeof keyField == 'undefined') return false;
      var currentRelation = config.parentChildRelation[keyField];
      if (currentRelation == 'root') {
         for (var key in data) {
            if (data.hasOwnProperty(key)) {
               var element = data[key];
               pageData[key] = element;
            }
         }
      } else {
         var currentRelationArr = currentRelation.split('.');
         currentRelationArr.shift();
         var arrLen = currentRelationArr.length;
         var tempObj = pageData;
         for (var i = 0; i < currentRelationArr.length; i++) {
            var item = currentRelationArr[i];
            if (i != arrLen && typeof tempObj[item] == 'undefined') {
               tempObj[item] = {};
            }
            if (i == arrLen - 1) {
               tempObj[item] = data;
            }
            tempObj = tempObj[item];
         }
      }
   }
   //获得表格选中数据
   function getSelectData() {
      return NetStarGrid.getSelectedData(config._componentConfig.listId);
   }
   //检验表格数据是否合法
   function verifyGridData(gridData, config, gridId) {
      var verifyResult = true;
      var hasRequired = {
         required: false,
         info: []
      };
      var legalMsg = "";
      // var mainGridConfigManager = NetStarGrid.configs[config.mainGrid.id];
      var mainGridConfigManager = NetStarGrid.configs[gridId]; // lyw 20190807
      var mainGridConfig = mainGridConfigManager.gridConfig;
      var columns = mainGridConfig.columns;
      var verifyRuleObj = [];
      for (var index = 0; index < columns.length; index++) {
         var item = columns[index];
         if (typeof item.editConfig != 'undefined') {
            if (typeof item.editConfig.rules != 'undefined' && item.editConfig.rules.indexOf('required') != -1) {
               hasRequired.required = true;
               hasRequired.info.push({
                  id: item.editConfig.id,
                  name: item.editConfig.label
               })
            }
            verifyRuleObj[item.editConfig.id] = {
               keyField: item.editConfig.id,
               rules: item.editConfig.rules,
               type: item.editConfig.type,
               name: item.editConfig.label
            };
         }
      }

      for (var index = 0; index < gridData.length; index++) {
         var item = gridData[index];
         for (var key in item) {
            if (item.hasOwnProperty(key) && typeof verifyRuleObj[key] != 'undefined') {
               var value = item[key];
               var element = verifyRuleObj[key];
               element.value = value;
               var islegal = NetstarComponent.validatValue(element);
               if (!islegal.isTrue) {
                  if (islegal.validatInfo.indexOf(',') != -1) {
                     islegal.validatInfo = islegal.validatInfo.substr(0, islegal.validatInfo.length - 1);
                  }
                  if (legalMsg.indexOf(key) == -1) {
                     //(' + key + ')
                     legalMsg += element.name + ': ' + islegal.validatInfo + ',';
                  }
                  verifyResult = false;
               }
            }
         }
      }

      if ($.isEmptyObject(gridData) && hasRequired.required) {
         /* var alertString = '请填写必填字段:';
         for (let index = 0; index < hasRequired.info.length; index++) {
            var item = hasRequired.info[index];
            alertString += item.name + ',';
         }
         alertString = alertString.substr(0, alertString.length - 1);
         nsalert(alertString, 'error'); */
         nsalert('请在表格内填写处理内容', 'error');
         console.error('请填写必填字段');
         return false;
      }

      if (verifyResult) {
         return gridData;
      } else if (!verifyResult) {
         legalMsg = legalMsg.substr(0, legalMsg.length - 1);
         nsalert(legalMsg, 'error');
         return false;
      }
   }

   //检查是否末保存
   function getValue(_package) {
      return {
         pageData: getPageData(_package, false, false),
         serverData: getConfigBypackage(_package).config.serverData
      }
   }
   //拿到某一页面模版的config
   function getConfigBypackage(_package) {
      if (typeof NetstarTemplate.templates[templateName].aggregate == 'undefined') return false;
      var aggregate = NetstarTemplate.templates[templateName].aggregate[_package];
      if (typeof aggregate != 'undefined') {
         return aggregate;
      } else {
         console.error('模版名称错误', 'error');
         return false;
      }
   }

   //获取某一组件下的getValueAjax
   function getAjaxDataByConfig(btns, type, cb) {
      if (!(typeof btns == 'object' && typeof type == 'string')) return;
      var ajaxConfig = {};
      var ajaxConfigField = "ajaxConfig" + '-' + type + '-' + new Date().valueOf();
      ajaxConfig.ajaxConfigField = ajaxConfigField;
      ajaxConfig[ajaxConfigField] = {};
      switch (type) {
         case "btn":
            try {
               if (!(btns instanceof Array)) return;
               $.each(btns, function (index, item) {
                  var functionConfig = item.functionConfig;
                  if (typeof functionConfig != 'undefined' && typeof functionConfig.getValueAjax != 'undefined') {
                     var id = functionConfig.englishName;
                     ajaxConfig[ajaxConfigField][id] = {};
                     ajaxConfig[ajaxConfigField][id].ajax = functionConfig.getValueAjax;
                     ajaxConfig[ajaxConfigField][id].parentNodeName = "root";
                     ajaxConfig[ajaxConfigField][id].panelId = id;
                  }
               })
            } catch (error) {
               console.error('这里出错了!!!');
               console.log(error);
            }
            break;

         default:
            break;
      }
      fillDataWithConfig.fillValue(ajaxConfig, function (pageComponentData) {
         typeof cb == 'function' && cb(pageComponentData);
      });
   }

   //获取页面剩余高度
   function getRemainHeight(_config) {
      typeof _config != 'undefined' ?
         config = _config :
         "";
      config.remainHeight = 0;
     /* var hasUsedHeight = 0;

      var $container = nsPublic.getAppendContainer();
      var $pageDiv = $container.find('#' + config.containerId).children();
      for (var i = 0, len = $pageDiv.length; i < len; i++) {
         var $this = $pageDiv.eq(i);
         hasUsedHeight += $this.outerHeight();
      }*/
      /*******sjj 20190513 减去导航栏和底部按钮占用的高度 start */
      var templateFooterHeight = 0;
		for(var name in NetstarTopValues){
			templateFooterHeight += NetstarTopValues[name].height;
      }
      /*******sjj 20190513 减去导航栏和底部按钮占用的高度 end */
      config.remainHeight =  $(window).outerHeight() - 158 - 20 -  templateFooterHeight;
   }
   // 获取页面来源数据
   function getPageSourceData(package){
      if (getConfigBypackage(package)) {
         config = getConfigBypackage(package).config;
      }
      var pageData = {};
      if(config){
         pageData = $.extend(true, {}, config.pageParam);
      }
      return pageData;
   }
   //返回模版数据
   function getTemplateValueFunc() {
      // return getPageData(config.package, false);
      return getPageSourceData(config.package);
   }
   //根据包名设置模版
   function setTemplateBasedName() {
      if (typeof NetstarTemplate.templates[templateName].aggregate == 'undefined') {
         NetstarTemplate.templates[templateName].aggregate = {};
      }
      NetstarTemplate.templates[templateName].aggregate[config.package] = {};
      //模版状态
      config.setTemplateState = function (state) {
         var stateArr = 'suspend-message,emergency-message,again-message,normal-message,state-disabled-message'.split(',');
         if (typeof this.state != 'undefined') {
            this.$appendContainer.find('.pt-main').removeClass(this.state);
         }
         this.state = state;
         this.$appendContainer.find('.pt-main').addClass(state);
      }
      //模版只读
      config.templateDisabled = function (_config, isDisabled, showTitle, workitemState) {
         // lyw 通过状态获取显示数据
         var workitemStateObj = {
            128 : '此业务单已被签收，点击按钮关闭页面',
            4 : '此业务单已被提交，点击按钮关闭页面',
            5 : '此业务单已被提交，点击按钮关闭页面',
            16 : '此业务单已被回退，点击按钮关闭页面',
         }
         var tipsInfo = workitemStateObj[workitemState] ? workitemStateObj[workitemState] : '此业务单已被处理，点击按钮关闭页面';
         typeof _config != 'undefined' ?
            config = _config :
            "";
         //如果禁用
         if (typeof isDisabled == 'boolean' && isDisabled) {
            $('#' + config.containerId).addClass('template-disabled');
            //如果不显示内容
            if (typeof showTitle == 'boolean' && !showTitle) {
               var disabledContent = '';
            } else {
               var disabledContent = '<div class="state-content">\
                                          <p>' + tipsInfo + '</p>\
                                          <button onclick="NetstarUI.labelpageVm.removeCurrent()" type="button" class="pt-btn pt-btn-default">\
                                             <span>关闭</span>\
                                          </button>\
                                       </div>';
            }
            $('#' + config.containerId).parents('.pt-main').append('<div class="dialog-template-state">' + disabledContent + '</div>');
         } else if (typeof isDisabled == 'boolean' && !isDisabled) {
            $('#' + config.containerId).removeClass('template-disabled');
            // nsPublic.getAppendContainer().find('.pt-main .dialog-template-state').remove();
            $('#' + config.containerId).parent().children('.dialog-template-state').remove();
         }
      }
      NetstarTemplate.templates[templateName].aggregate[config.package].config = $.extend(true, {}, config);
      NetstarTemplate.templates[templateName].aggregate[config.package].originConfig = $.extend(true, {}, originConfig);
   }
   //获得其他页面的config
   function getOtherPageConfig(url, businessName, extraData, btnConfig) {
      var pageConfig = {
         pageIidenti : url,
         url : getRootPath() + url,
         callBackFunc : function(isSuccess, data, _pageConfig){
             if(isSuccess){
               var res = data;
               // var pageConfig = 'currentDialogConfig';
               if(typeof(res) == "object"){
                  res = pageProperty.getPageHtml(res.data);
               }
               //拿到容器
               var matchTag = 'container';
               var containerHtml = '';
               if (res.indexOf('<' + matchTag + '>') != -1 && res.lastIndexOf('</' + matchTag + '>') != -1) {
                  containerHtml = res.substring(res.indexOf('<' + matchTag + '>') + ('<' + matchTag + '>').length, res.lastIndexOf('</' + matchTag + '>'));
               } else {
                  matchTag = 'body';
                  if (res.indexOf('<' + matchTag + '>') != -1 && res.lastIndexOf('</' + matchTag + '>') != -1) {
                     containerHtml = res.substring(res.indexOf('<' + matchTag + '>') + ('<' + matchTag + '>').length, res.lastIndexOf('</' + matchTag + '>'));
                  } else {
                     containerHtml = res;
                  }
               }
               containerHtml = '<container>' + containerHtml + '</container>';
               //进行替换
               try {
                  var configName = containerHtml.match(/NetstarTemplate\.init[\s]*\((\S+)\)/)[1];
               } catch (error) {
                  return nsalert("页面没有该项配置", 'warning');
               }
               var btnEnglishName = btnConfig.englishName; // 点击的按钮名
               containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, 'NetstarTemplate.templates.processDocBase.busComponents.'  + businessName 
                                                                                             + '.setConfig(' 
                                                                                                + configName + ',' + JSON.stringify(extraData) + ',"'
                                                                                                + btnEnglishName
                                                                                             + '")');
               $('container').append($(containerHtml).find('script'));
             }else{
             }
         },
      }
      pageProperty.getAndCachePage(pageConfig);
      // $.ajax({
      //    url: getRootPath() + url,
      //    data: {},
      //    success: function (res) {
      //       // var pageConfig = 'currentDialogConfig';
      //       if(typeof(res) == "object"){
      //          res = pageProperty.getPageHtml(res.data);
      //       }
      //       //拿到容器
      //       var matchTag = 'container';
      //       var containerHtml = '';
      //       if (res.indexOf('<' + matchTag + '>') != -1 && res.lastIndexOf('</' + matchTag + '>') != -1) {
      //          containerHtml = res.substring(res.indexOf('<' + matchTag + '>') + ('<' + matchTag + '>').length, res.lastIndexOf('</' + matchTag + '>'));
      //       } else {
      //          matchTag = 'body';
      //          if (res.indexOf('<' + matchTag + '>') != -1 && res.lastIndexOf('</' + matchTag + '>') != -1) {
      //             containerHtml = res.substring(res.indexOf('<' + matchTag + '>') + ('<' + matchTag + '>').length, res.lastIndexOf('</' + matchTag + '>'));
      //          } else {
      //             containerHtml = res;
      //          }
      //       }
      //       containerHtml = '<container>' + containerHtml + '</container>';
      //       //进行替换
      //       try {
      //          var configName = containerHtml.match(/NetstarTemplate\.init[\s]*\((\S+)\)/)[1];
      //       } catch (error) {
      //          return nsalert("页面没有该项配置", 'warning');
      //       }
      //       var btnEnglishName = btnConfig.englishName; // 点击的按钮名
      //       containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, 'NetstarTemplate.templates.processDocBase.busComponents.'  + businessName 
      //                                                                                     + '.setConfig(' 
      //                                                                                        + configName + ',' + JSON.stringify(extraData) + ',"'
      //                                                                                        + btnEnglishName
      //                                                                                     + '")');
      //       $('container').append($(containerHtml).find('script'));
      //    },
      //    fail: function (err) {
      //       console.log(err);
      //    }
      // });
   }
   return {
      init: init,
      componentInit: componentInit,
      setValue: setValue,
      setValueByDraft : setValueByDraft,
      getPageData: getPageData,
      getValue: getValue,
      busComponents: busComponents,
      refreshCompnent:refreshCompnent,
      utils: {
         buildDefaultContainer: buildDefaultContainer,
         getParentChildRelation: getParentChildRelation,
         getDataByKeyField: getDataByKeyField,
         setIdFieldNames: setIdFieldNames,
         getPageData: getPageData,
         setDataByKeyField: setDataByKeyField,
         getSelectData: getSelectData,
         getValue: getValue,
         getConfigBypackage: getConfigBypackage,
         getAjaxDataByConfig: getAjaxDataByConfig,
         getRemainHeight: getRemainHeight,
         getTemplateValueFunc: getTemplateValueFunc,
         setTemplateBasedName: setTemplateBasedName,
         getOtherPageConfig: getOtherPageConfig,
      },
      refreshByConfig:function(_config){
         this.refreshCompnent(_config.package);
      }
   };

   //附加按钮
   function addOtherBtns() {
      config.btns.push({
         btn: {
            text: "选择商品",
            isReturn: true,
            handler: function (callBack, Obj) {
               getOtherPageConfig('/index/businessbase', 'businessbase');
            }
         }
      });
   }
})(jQuery);