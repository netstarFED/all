/*
 * @Author: netstar.lxh
 * @Date: 2019-01-22 14:18:23
 * @LastEditors: netstar.lxh
 * @LastEditTime: 2019-03-26 11:46:41
 * @Desription: 单据加工模版
 */
NetstarTemplate.templates.processDocSecond = (function ($) {
   var originConfig = {}; //该组件传参原始对象
   var config = {}; //该组件使用对象
   var optionsConfig = {
      dialogBeforeHandler: function (data) {
         data.value = config.utils.getPageData(config.package);
         return data;
      },
      ajaxBeforeHandler: function (handlerObj) {
         handlerObj.config = config;
         if ($.isEmptyObject(handlerObj.dialogBeforeConfig)) {
            handlerObj.dialogBeforeConfig = { value: config.utils.getPageData(config.package) };
         }
         return handlerObj;
      },
      ajaxAfterHandler: function (data) {
         nsalert('操作成功');
         setValue(data);
      },
      loadPageHandler: function (data) {
         return data;
      },
      closePageHandler: function (data) {
         console.log(data);
      }
   };
   var templateName = 'processDocSecond';

   //初始化
   function init(outerConfig, _componentConfig) {
      setDefault(outerConfig);
      config.utils.buildDefaultContainer();
      setDefaultData(function () {
         formatComponents();
         config.utils.setIdFieldNames(config);
         config.buildReturn = buildContainer(config, true);
         renderComponents();
         config.readonly ? config.utils.templateDisabled() : "";
         /*************根据包名设置模版 */
         setTemplateBasedName();
         /****************设置拖拽窗口 */
         nsUI.dragWindows({
            parentContainerId: config.buildReturn.dragId.dragContainerId,
            ltContainerId: config.buildReturn.dragId.ltId,
            rbContainerId: config.buildReturn.dragId.rbId,
            closePosition: "bottom"
         });
      });
      console.log(config);
   }
   //设置默认值
   function setDefault(outerConfig, _componentConfig) {
      originConfig = $.extend(true, {}, outerConfig);
      config = $.extend(true, {}, outerConfig);
      //设置默认值
      var defaultConfig = {
         utils: NetstarTemplate.templates.processDocBase.utils,
         formatComponentsArr: [],//将components的字段保存
         serverData: {},//服务端的数据
         baseId: config.id + '-',//baseId
         _componentConfig: _componentConfig,//如果是其他页面调用的话，则添加一些要用到的参数
         pageHeight: $('body').height(),
         willUsedComponentId: {},
         transferData: {}
      };
      nsVals.setDefaultValues(config, defaultConfig);
      //赋值id
      $.each(config.components, function (index, item) {
         var obj = {
            position: 'body',
            keyField: 'root',
            parent: 'root'
         };
         nsVals.setDefaultValues(item, obj);
      });
      config.utils.getParentChildRelation(config.components, undefined, config);
   }

   /*********************************格式化组件 */
   //格式化各个组件
   function formatComponents(_config) {
      typeof _config != 'undefined'
         ? config = _config
         : "";
      $.each(config.components, function (index, item) {
         switch (item.type) {
            case 'vo':
               if (index != 1) {
                  config.formatComponentsArr.push(formatForm(item));
               } else {
                  config.formatComponentsArr.push(formatForm(item, "searchForm"));
               }
               break;
            case 'list':
               config.formatComponentsArr.push(getGridConfig(item));
               break;
            case 'btns':
               config.btns = item.field;
               break;

            default:
               break;
         }
      });
   }
   //格式化表格
   function formatForm(formConfig, formName) {
      var formValue = config.utils.getDataByKeyField(formConfig.keyField) || {};
      var formJson = {};
      formJson.id = formConfig.id;
      typeof formName != 'undefined'
         ? config.willUsedComponentId[formName] = formConfig.id
         : "";
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
            item.value = formValue[item.id];
         }
         //设置隐藏字段 
         if ($.inArray(item.id, formConfig.hide) != -1) {
            item.type = 'hidden';
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
      typeof config.willUsedComponentId.firstGridId == 'undefined'
         ? config.willUsedComponentId.firstGridId = pageListOptions.id
         : config.willUsedComponentId.secondGridId = pageListOptions.id;
      var options = pageListOptions;
      typeof options.dataSource == 'undefined' ? options.dataSource = [] : '';
      var serverData = config.utils.getDataByKeyField(options.keyField);
      $.merge(options.dataSource, serverData && !$.isEmptyObject(serverData) ? serverData[options.keyField] : []);
      options.id = options.id;
      var gridConfig = {
         /** 数据配置
          *       当前模板中grid是编辑模式
          *       表格数据是单据数据的一部分，直接以dataSource方式从整体数据对象中获取
          */
         columns: options.field,
         data: {
            tableID: options.id,
            dataSource: [], //options.dataSource
         },
         ui: {
            isAutoSerial: true,   //是否开启自动序列列 最前面那个1,2,3,4的列
            isCheckSelect: true,  //是否开启check select选中行  尽在支持多选状态下可用
            isHeader: false,
            isPage: false,
            minPageLength: 10,
            // isEditMode: typeof config.readonly == 'boolean' ? !config.readonly : true, //编辑模式
            isEditMode: true, //编辑模式
            pageLengthMenu: [20, 50, 100, 200],  //每页多少
            pageLengthDefault: 20,               //默认分页数量
            selectMode: 'single',                //多选multi none single
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

   /*********************************构建容器 */
   //构建页面容器
   function buildContainer(_config, _listDrag) {
      //可拖拽设置要用到的属性
      var dragContainerId = "", ltId = '', rbId = '';
      var dragMode = typeof _listDrag == 'boolean' ? _listDrag : false;
      //根据传进来的config来格式化
      typeof _config != 'undefined'
         ? config = _config
         : "";
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
      $.each(config.components, function (index, item) {
         //创建面板并添加
         var $currentContainer = $(baseHtml);
         var insertion = $currentContainer.find('.pt-panel-col');
         var positionContainer = item.position.split('-')[0] ? item.position.split('-')[0] : "";
         var position = item.position.split('-')[1] ? item.position.split('-')[1] : "";
         position != "" ? insertion.addClass('text-' + position) : '';
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
               insertion.append('<div id="' + item.id + '"></div>');
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
               //构建组件
               var gridHtml =
                  '<div class="pt-panel ' + (rbId != '' && dragMode ? 'pt-panel-toggle' : "") + '" id="' + dragId + '">\
                     <div class="pt-container">\
                        <div id="' + item.id + '"></div>\
                     </div>\
                  </div>';
               $currentPosition.find('#' + dragConId).length != 0
                  ? $currentPosition.find('#' + dragConId).append(gridHtml)
                  : $currentPosition.append(gridHtml);
               break;
            case 'btns':
               var package = config.package.replace(/\./g, '-');
               var btnGroupHtml = '<div class="pt-panel">\
                                    <div class="pt-container">\
                                       <div class="pt-panel-row">\
                                          <div class="pt-panel-col">\
                                             <div class="btn-select-info-group" id="'+ package + '-btn-select-info">\
                                             </div>\
                                          </div>\
                                       </div>\
                                       <div class="pt-panel-row">\
                                          <div class="pt-panel-col">\
                                          <div class="btn-group" id="'+ package + '-btn">\
                                          </div>\
                                       </div>\
                                    </div>\
                                 </div>';
               $currentPosition.append(btnGroupHtml);
               break;
            default:
               if (debugerMode) {
                  console.error('不能识别的组件：' + item.type);
               }
               break;
         }
      });
      return {
         dragId: {
            dragContainerId: dragContainerId,
            ltId: ltId,
            rbId: rbId
         }
      };
   }

   /*********************************渲染组件 */
   //渲染form table组件
   function renderComponents(_config) {
      typeof _config != 'undefined'
         ? config = _config
         : "";
      var once = true;
      (function () {
         for (var index = 0, len = config.formatComponentsArr.length; index < len; index++) {
            var item = config.formatComponentsArr[index];
            if (item.renderType == 'form') {
               //添加表格回车换行方法
               item.config.blurHandler = function () {
                  console.log(NetstarTemplate.templates.processDocSecond.aggregate[config.package].config.willUsedComponentId.firstGridId);
                  NetStarGrid.setFirstEditRowState(NetstarTemplate.templates.processDocSecond.aggregate[config.package].config.willUsedComponentId.firstGridId);
               }
               var component = NetstarComponent.formComponent.getFormConfig(item.config);
               NetstarComponent.formComponent.init(component, item.config);

            } else if (item.renderType == 'grid') {
               var gridConfig = item.config;
               //设置数据
               if ($.isArray(item.templateOptions.dataSource)) {
                  gridConfig.data.dataSource = item.templateOptions.dataSource;
               }
               //如果在页面中指定了dataSource则添加到grid配置参数data.dataSource中 cy 20190124
               if (once) {
                  config.utils.getRemainHeight(config);
                  once = false;
               }
               gridConfig.ui.height = config.remainHeight / 2; //设定高度
               //发送函数名用来获取数据
               for (var i = 0; i < gridConfig.columns.length; i++) {
                  var itm = gridConfig.columns[i];
                  if (typeof itm.editConfig != 'undefined' && itm.editConfig.type == 'business') {
                     itm.editConfig.getTemplateValueFunc = getTemplateValueFunc;
                  }
               }
               gridConfig.data.idField = item.templateOptions.idField;
               var vueObj = NetStarGrid.init(gridConfig);
            }
         }
      })();
      renderBtns(config);
   }
   //附加按钮
   function addOtherBtns() {
      var otherBtns = [
         {
            btn: {
               text: "查询商品",
               isReturn: true,
               handler: function (callBack, Obj) {
                  //特定的id (需修改)
                  var formValue = NetstarComponent.getValues(config.willUsedComponentId.searchForm);
                  console.log("查询商品");
                  console.log(formValue);
                  if (!formValue) return;
                  var ajax = nsVals.getAjaxConfig({
                     src: getRootPath() + '/public/static/assets/json/template/withFormTableModal.json',
                     type: 'GET',
                     dataSrc: 'data',
                     data: {},
                  }, formValue);
                  NetStarUtils.ajax(ajax, function (res) {
                     if (res.success) {
                        var goodsList = [
                           {
                              "productId": 1,
                              "swapOutGoodsName": "多闪",
                              "barCode": "1254515684231235",
                              "specification": "XL",
                              "type": "C456-BH",
                              "units": "网星",
                              "unitsRelation": "联系上算我输",
                              "notes": "第一行"
                           }, {
                              "productId": 2,
                              "swapOutGoodsName": "聊天宝",
                              "barCode": "1254515684231235",
                              "specification": "XL2",
                              "type": "C88-LOP",
                              "units": "重磊实业",
                              "unitsRelation": "联系上算你输",
                              "notes": "第二行"
                           }
                        ];
                        NetStarGrid.refreshDataById(config.willUsedComponentId.firstGridId, goodsList);
                     }
                  });
               }
            }
         },
         {
            btn: {
               text: "拿到批次",
               isReturn: true,
               handler: function (callBack, Obj) {
                  //特定的id (需修改)
                  console.log("传给后台拿批次");
                  var batch = NetStarGrid.getCheckedData(config.willUsedComponentId.firstGridId);
                  console.log(batch);
                  if (batch.length == 0) {
                     return nsalert('请选择商品', 'warning');
                  } else {
                     var ajax = nsVals.getAjaxConfig({
                        src: getRootPath() + '/public/static/assets/json/template/withFormTableModal.json',
                        type: 'GET',
                        dataSrc: 'data',
                        data: {},
                     }, batch);
                     NetStarUtils.ajax(ajax, function (res) {
                        if (res.success) {
                           console.log('获取批次成功');
                           var batch = [
                              {
                                 "productId": 1,
                                 "swapOutGoodsName": "多闪",
                                 "barCode": "1254515684231235",
                                 "specification": "XL",
                                 "type": "C456-BH",
                                 "units": "网星",
                                 "unitsRelation": "联系上算我输",
                                 "notes": "第一行"
                              }, {
                                 "productId": 2,
                                 "swapOutGoodsName": "聊天宝",
                                 "barCode": "1254515684231235",
                                 "specification": "XL2",
                                 "type": "C88-LOP",
                                 "units": "重磊实业",
                                 "unitsRelation": "联系上算你输",
                                 "notes": "第二行"
                              }
                           ];
                           NetStarGrid.refreshDataById(config.willUsedComponentId.secondGridId, batch);
                        }
                     });
                  }
               }
            }
         }
      ];
      config.btns = config.btns.concat(otherBtns);
   }
   //渲染btn按钮
   function renderBtns(_config) {
      typeof _config != 'undefined'
         ? config = _config
         : "";
      if (typeof config.btns == 'undefined') return false;
      var package = config.package.replace(/\./g, '-');
      addOtherBtns();
      //页面下方按钮初始化
      var btnsArray = $.extend(true, [], config.btns);
      btnsArray = NetstarTemplate.getBtnArrayByBtns(btnsArray);
      var navConfig = {
         pageId: package,
         id: package + "-btn",
         btns: btnsArray,
         callback: optionsConfig
      };
      //添加按钮选择信息显示
      for (var i = 0, len = config.btns.length; i < len; i++) {
         var item = config.btns[i];
         var englishName = item.functionConfig ? item.functionConfig.englishName : "";
         $('#' + package + '-btn-select-info').append('<div ns-btnId="' + englishName + '" class="btn-select-info" fid="' + i + '"><span></span></div>');
      }
      config.utils.getAjaxDataByConfig(config.btns, 'btn', function (pageData) {
         config.getValueForBtns = pageData;
         var keys = Object.keys(config.getValueForBtns);
         $.each(keys, function (index, item) {
            var currentBtnSpan = $('div[ns-btnId=' + item + ']>span');
            var text = config.getValueForBtns[item].state ? config.getValueForBtns[item].state : config.getValueForBtns[item].goodsNum;
            currentBtnSpan.text(text);
         });
      });
      vueButtonComponent.init(navConfig);
   }

   /*********************************设置值 */
   //设置默认的getValueAjax
   function setDefaultData(cb) {
      if (typeof config.getValueAjax != 'undefined' && !$.isEmptyObject(config.getValueAjax)) {
         var data = config.pageParam || config.getValueAjax.data;
         var ajax = nsVals.getAjaxConfig(config.getValueAjax, data);
         NetStarUtils.ajax(ajax, function (res) {
            if (res.success) {
               config.defaultData = res[ajax.dataSrc];
               config.serverData = res[ajax.dataSrc];
            } else {
               nsalert('服务器端返回数据错误');
               return false;
            }
            cb && cb();
         });
      } else {
         config.defaultData = $.extend(true, {}, config.pageParam || {});
         config.serverData = $.extend(true, {}, config.pageParam || {});
         cb && cb();
      }
   }
   //设置页面数据
   function setValue(data, _package) {
      var package;
      typeof _package == 'undefined' ? package = config.package : package = _package;
      if (!$.isEmptyObject(data)) {
         NetstarTemplate.templates.processDocSecond.aggregate[package].config.serverData = data;
         config.serverData = data;
      }
      refreshCompnent(package);
   }

   /*********************************刷新值 */
   //刷新页面数据
   function refreshCompnent(_package) {
      var config = getConfigBypackage(_package).config;
      $.each(config.components, function (index, item) {
         var id = item.id;
         var keyField = item.keyField;
         var parent = item.parent;
         var fillValues = config.utils.getDataByKeyField(keyField);
         if (item.type == 'vo') {
            NetstarComponent.fillValues(fillValues, id);
         } else if (item.type == 'list') {
            NetStarGrid.refreshDataById(id, fillValues[keyField]);
         }
      });
   }

   /*********************************公共 */
   function getValue(_package) {
      return {
         pageData: config.utils.getPageData(_package, false),
         serverData: getConfigBypackage(_package).config.serverData
      }
   }
   function getPageData(_package) {
      return config.utils.getPageData(_package);
   }
   //返回模版数据
   function getTemplateValueFunc() {
      return config.utils.getPageData(config.package, false);
   }
   //拿到某一页面模版的config
   function getConfigBypackage(_package) {
      if (typeof NetstarTemplate.templates[templateName].aggregate == 'undefined') return false;
      var aggregate = NetstarTemplate.templates[templateName].aggregate[_package];
      if (typeof aggregate != 'undefined') {
         return aggregate;
      } else {
         nsalert('模版名称错误', 'error')
         return false;
      }
   }
   //根据包名设置模版
   function setTemplateBasedName() {
      if (typeof NetstarTemplate.templates[templateName].aggregate == 'undefined') {
         NetstarTemplate.templates[templateName].aggregate = {};
      }
      //模版状态
      config.setTemplateState = function (state) {
         var stateArr = 'suspend-message,emergency-message,again-message,normal-message'.split(',');
         if (typeof this.state != 'undefined') {
            this.$appendContainer.find('.pt-main').removeClass(this.state);
         }
         this.state = state;
         this.$appendContainer.find('.pt-main').addClass(state);
      }
      //模版只读
      config.templateDisabled = function (_config, isDisabled) {
         typeof _config != 'undefined' ?
            config = _config :
            "";
         if (typeof isDisabled == 'boolean' && isDisabled) {
            $('#' + config.containerId).addClass('template-disabled');
            $('#' + config.containerId).parents('.pt-main').append('<div class="dialog-template-state">\
                                                                     <div class="state-content">\
                                                                        <p>此业务单已被处理，点击按钮关闭页面</p>\
                                                                        <button onclick="NetstarUI.labelpageVm.removeCurrent()" type="button" class="pt-btn pt-btn-default">\
                                                                           <span>关闭</span>\
                                                                        </button>\
                                                                     </div>\
                                                                  </div>');
         } else if (typeof isDisabled == 'boolean' && !isDisabled) {
            $('#' + config.containerId).removeClass('template-disabled');
            nsPublic.getAppendContainer().find('.pt-main .dialog-template-state').remove();
         }
      }
      NetstarTemplate.templates[templateName].aggregate[config.package] = {};
      NetstarTemplate.templates[templateName].aggregate[config.package].config = $.extend(true, {}, config);
      NetstarTemplate.templates[templateName].aggregate[config.package].originConfig = $.extend(true, {}, originConfig);
   }
   return {
      init: init,
      getPageData: getPageData
   };
})(jQuery);