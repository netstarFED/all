/*
 * @Author: netstar.sjj
 * @Date: 2019-06-25 13:45:00
 */
NetstarTemplate.templates.statisticsBase = (function ($) {
   function init(_config) {
      if (debugerMode) {
         //验证
         function validateByConfig(config) {
            var isValid = true;
            var validArr =
               [
                  ['template', 'string', true],
                  ['title', 'string'],
                  ['getValueAjax', 'object', true],
                  ['components', 'array', true]
               ];
            isValid = nsDebuger.validOptions(validArr, config);//验证当前模板的配置参数
            return isValid;
         }
         if (!validateByConfig(_config)) {
            nsalert('配置文件验证失败', 'error');
            console.error('配置文件验证失败');
            console.error(_config);
            return false;
         }
      }
      if (typeof (NetstarTemplate.templates.statisticsBase.data) == 'undefined') {
         NetstarTemplate.templates.statisticsBase.data = {};
      }
      _config.pageParam = typeof (_config.pageParam) == 'object' ? _config.pageParam : {};
      var originalConfig = $.extend(true, {}, _config);//保存原始值
      var config = _config;
      //记录config
      NetstarTemplate.templates.statisticsBase.data[_config.id] = {
         original: originalConfig,
         config: config
      };
      //格式化处理参数
      function formatHtmlByData(_listExpression, _data, _formatData) {
         var rex1 = /\{\{(.*?)\}\}/g;
         var rex2 = /\{\{(.*?)\}\}/;
         var html = _listExpression;
         if (rex2.test(html)) {
            var strArr = html.match(rex1);
            for (var i = 0; i < strArr.length; i++) {
               var valueStr = _data[strArr[i].match(rex2)[1]];
               var fieldName = strArr[i].match(rex2)[1];
               var fieldJson = typeof (_formatData[fieldName]) == 'object' ? _formatData[fieldName] : {};
               switch (fieldJson.type) {
                  case 'date':
                     if(typeof(fieldJson.format)=='undefined'){
                        fieldJson.format = 'YYYY-MM-DD HH:mm:ss';
                     }
                     valueStr = moment(valueStr).format(fieldJson.format);
                     break;
                  case 'timeUnit':
                     //存在单位
                     valueStr = moment.duration(Number(valueStr)).hours(); //minutes
                     break;
               }
               if(typeof(valueStr)=='undefined'){valueStr = ''}
               html = html.replace(strArr[i],valueStr);
            }
         }
         return html;
      }
      //组件类型为customize的自定义形式的初始化执行
      function customizeInit(_customizeJson,_config){
        for(var id in _customizeJson){
            var componentData = _customizeJson[id];
            var componentPageData = {};
            if(componentData.parent == 'root'){
               //读取根节点的数据
               componentPageData = _config.currentPageData;
            }else{
               componentPageData = _config.currentPageData[componentData.keyField] ? _config.currentPageData[componentData.keyField] : {};
            }
            var html = formatHtmlByData(componentData.listExpression,componentPageData,componentData.fieldJson);
            $('#'+id).html(html);
         }
      }
      //组件类型为bar,line,pie等图表形式的初始化执行
      function echartsInit(_echartJson,_config){
         for(var id in _echartJson){
            if(!$.isEmptyObject(_echartJson[id])){
               var componentData = _echartJson[id];
               var fieldJson = componentData.fieldJson;
               var componentPageData = {};
               if (componentData.parent == 'root') {
                  //读取根节点的数据
                  componentPageData = _config.currentPageData;
               } else {
                  componentPageData = _config.currentPageData[componentData.keyField] ? _config.currentPageData[componentData.keyField] : {};
               }
               var options = {};
               switch (componentData.type) {
                  case 'pie':
                     /*options = {
                        tooltip: {
                           trigger: 'item',
                           formatter: "{a} <br/>{b}: {c} ({d}%)"
                        },
                        legend: {
                           orient: 'vertical',
                           icon:'circle',
                           right: 10,
                           //top: 200,
                           //bottom: 20,
                           data:['深睡','浅睡','离线','醒着','REM'],
                           itemWidth:20,
                           itemHeight:20,
                        },
                        series: [
                           {
                              //name:'访问来源',
                              type:'pie',
                              radius: [0, '30%'],
                              label: {
                                    normal: {
                                       position: 'inner',
                                       textAlign:'center'
                                    }
                              },
                              data:[
                                    {value:36588000,name:'睡眠时长'},
                              ]
                           },
                           {
                              //name:'访问来源',
                              type:'pie',
                              radius: ['30%', '60%'],
                              label: {
                                    normal: {
                                       position: 'inner',
                                       
                                    }
                              },
                              data:[
                                    {value:12843000, name:'深睡'},
                                    {value:13432000, name:'浅睡'},
                                    {value:12843000, name:'离线'},
                                    {value:3658000, name:'醒着'},
                                    {value:74800, name:'REM'},
                              ]
                           }
                        ]
                     };*/
                     break;
               }
               if (typeof (componentData.dataCallback) == 'function') {
                  options = componentData.dataCallback(componentPageData, fieldJson);
               }
               if (componentData.pieId) {
                  var pieHtml = '<div class="echart-panel" id="' + componentData.echartId + '" style="width:100%;height:300px;"></div>';
                  $('#' + componentData.pieId).html(pieHtml);
               }
               var chartDom = echarts.init($('#' + componentData.echartId)[0]);
               chartDom.clear();
               chartDom.setOption(options);
            }
         }
      }
      //组件类型为list的初始化执行
      function listInit(_listJson, _config) {
         for (var id in _listJson) {
            var componentData = _listJson[id];
            var componentPageData = {};
            if (componentData.parent == 'root') {
               //读取根节点的数据
               componentPageData = _config.currentPageData;
            } else {
               componentPageData = _config.currentPageData[componentData.keyField] ? _config.currentPageData[componentData.keyField] : {};
            }
            var gridConfig = {
               id: componentData.id,
               type: componentData.type,
               plusClass: componentData.plusClass,
               templateId: _config.id,
               package: _config.package,
               data: {
                  isSearch: false,
                  dataSource: componentPageData,
                  primaryID: componentData.idField,
                  idField: componentData.idField,
               },
               columns: componentData.field,
               ui: {
                  isPage: false,
                  isHaveEditDeleteBtn: false,
                  selectMode: 'single',
               }
            };
            NetStarGrid.init(gridConfig);
         }
      }
      //查询事件
      function voCommonChangeHandler(data){
         var templateId = data.config.formID.substring(0,data.config.formID.lastIndexOf('-vo'));
         var templateId = $('#'+data.config.formID).closest('.statisticsbase').attr('id');
         var config = $.extend(true,{},NetstarTemplate.templates.statisticsBase.data[templateId].config);
         var queryData = NetstarComponent.getValues(data.config.formID,false);
         delete config.componentsConfig.vo;
         refreshData(config,queryData);
      }
      //组件类型为vo的初始化执行
      function voInit(_voJson, _config) {
         //初始化表单完成事件
         function voCompleteHandler() {

         }
         for (var id in _voJson) {
            var formJson = {
               id: id,
               templateName: 'form',
               componentTemplateName: 'PC',
               form: _voJson[id].field,
               isSetMore: typeof (_voJson[id].isSetMore) == 'boolean' ? _voJson[id].isSetMore : false,
               completeHandler: voCompleteHandler
            };
            if (_voJson[id].formStyle) {
               formJson.formStyle = _voJson[id].formStyle;
            }
            if (_voJson[id].plusClass) {
               formJson.plusClass = _voJson[id].plusClass;
            }
            var component = NetstarComponent.formComponent.getFormConfig(formJson);
            NetstarComponent.formComponent.init(component, formJson);
         }
      }
      function initPanelInit(config) {
         for (var type in config.componentsConfig) {
            var componentData = config.componentsConfig[type];
            switch (type) {
               case 'vo':
                  voInit(componentData, config);
                  break;
               case 'list':
                  listInit(componentData, config);
                  break;
               case 'echarts':
                  echartsInit(componentData, config);
                  break;
               case 'customize':
                  customizeInit(componentData, config);
                  break;
            }
         }
      }
      //初始化容器输出组件容器
      function initContainer() {
         var containerHtml = '';
         for (var componentI = 0; componentI < config.components.length; componentI++) {
            var componentData = config.components[componentI];
            componentData.templateId = config.id;
            if ($.isArray(componentData.field)) {
               var fieldJson = {};
               for (var fieldI = 0; fieldI < componentData.field.length; fieldI++) {
                  var fieldData = componentData.field[fieldI];
                  var isHideen = typeof (fieldData.hidden) == 'boolean' ? fieldData.hidden : false;
                  if (isHideen == false) {
                     fieldJson[fieldData.id] = fieldData;
                     if (componentData.type == 'vo') {
                        fieldData.commonChangeHandler = voCommonChangeHandler;
                     }
                  }
               }
               componentData.fieldJson = fieldJson;
            }
            var titleHtml = '';
            if (componentData.title) {
               titleHtml = '<div class="pt-title">' + componentData.title + '</div>'
            }
            switch (componentData.type) {
               case 'vo':
               case 'list':
               case 'customize':
                  containerHtml += '<div class="pt-panel">'
                     + titleHtml
                     + '<div class="pt-panel-container ' + componentData.type + '" id="' + componentData.id + '" nstype="' + componentData.type + '">'
                     + '</div>'
                     + '</div>';
                  config.componentsConfig[componentData.type][componentData.id] = componentData;
                  break;
               case 'bar':
               case 'line':
               case 'pie':
               case 'scatter':
                  componentData.echartId = 'echart-' + componentData.id;
                  config.componentsConfig.echarts[componentData.id] = componentData;
                  if (componentData.pieId) {

                  } else {
                     containerHtml += '<div class="pt-panel">'
                        + titleHtml
                        + '<div class="pt-panel-container ' + componentData.type + '" id="' + componentData.id + '" nstype="' + componentData.type + '">'
                        + '<div class="echart-panel" id="' + componentData.echartId + '" style="width:100%;height:300px;"></div>'
                        + '</div>'
                        + '</div>';
                  }
                  break;
            }
         }
         var bodyHtml = '<div class="pt-container">'
            + '<div class="pt-main-row">'
            + '<div class="pt-main-col">'
            + containerHtml
            + '</div>'
            + '</div>'
            + '</div>';
         var $container = $('container');
         if ($container.length > 0) {
            $container = $('container:last');
         }
         $container.prepend('<div class="pt-main statisticsbase" id="' + config.id + '">' + bodyHtml + '</div>');//输出面板
      }
      //ajax调用
      function refreshData(config,_queryData){
         /*var ajaxConfig = {
            url:getRootPath() + '/public/static/assets/json/statisticsbase/base.json',
            dataSrc:'data',
            type:'GET',
            contentType: 'application/x-www-form-urlencoded',
            plusData:{templateConfig:config}
         };*/
         _queryData = typeof(_queryData)=='object' ? _queryData : {};
         var ajaxConfig = $.extend(true,{},config.getValueAjax);
         ajaxConfig.plusData = {templateConfig:config};
         
         delete config.pageParam.parentSourceParam;
         NetStarUtils.setDefaultValues(_queryData,config.pageParam);
         /*var ajaxParameterRegExp = /\{?\}/;  //识别{aaaa}的数据
         var isUseObject = true;
         for(var key in ajaxConfig.data){
            if (ajaxParameterRegExp.test(ajaxConfig.data[key])) {
               isUseObject = false;
               break;
            }
         }
         if(isUseObject){
            ajaxConfig.data = _queryData;
         }else{
            ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data,_queryData);
         }*/
         ajaxConfig = nsVals.getAjaxConfig(ajaxConfig,_queryData,{idField:'id'});
         NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
            if(res.success){
               ajaxOptions.plusData.templateConfig.currentPageData = res[ajaxOptions.dataSrc] ? res[ajaxOptions.dataSrc] : {};
               initPanelInit(ajaxOptions.plusData.templateConfig);
            }
         }, true);
      }
      //设置默认值
      function setDefault() {
         var defaultConfig = {
            currentPageData: {},
            queryConfig: {},//查询配置
            idFieldsNames: {},//当前模板keyfield和idField对应关系的映射 如{'root':'id','root.salelist':'saleId','root.saleList.customerList':'customerId'}
            componentsConfig: {
               list: {},
               btns: {},
               vo: {},
               customize: {},
               echarts: {
                  bar: {},//柱形图
                  line: {},//线形图
                  pie: {},//饼形图
                  scatter: {},//散点图
               },
            },//根据当前容器的id存储组件信息
         };
         nsVals.extendJSON(config, defaultConfig);
      }
      setDefault();//设置默认值
      initContainer();//初始化容器

      if (config.getValueAjax) {
         refreshData(config);
      } else {
         initPanelInit(config);//面板容器组件事件初始化
      }
   }
   return {
      init: init,
      VERSION: '0.0.1',						//版本号
   }
})(jQuery);