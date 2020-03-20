/**
 * 接收参数应为array
 * config = {
        el: "topBarNav",
        title: "消息666",
        tips: '99+',
        panels: [
            {
                name: "待办",
                type: "rollout",
                tips: "小提示",
                rows: [
                    {
                        title: "第一个待办",
                        text: "时间等信息",
                        url: getRootPath() + "/oneOfTheIWD",
                        tips: "消息提示1"
                    },
                    {
                        title: "第二个待办",
                        text: "时间等信息",
                        url: getRootPath() + "/secondOfTheIWD",
                        tips: "消息提示2"
                    }
                ]
            }
        ]
    };
 */
NetstarUI.message = (function ($) {
   var config = {
      el: "",
      btnInfo: {},
      panels: []
   };
   var originConfig = {};
   var messageVm;
   function init(outerConfig) {
      setDefault(outerConfig);
      vueInit();
      if (typeof NetStarRabbitMQ != 'undefined') {
         NetStarRabbitMQ.connectBySaveConfig(getRollOutRows());
      }
   }
   //设置默认值
   function setDefault(outerConfig) {
      if (!verifyEL(outerConfig)) return;
      originConfig = $.extend(true, {}, outerConfig);
      //默认配置
      var defaultConfig = {
         title: "消息",
         tips: '',
         panels: []
      };
      nsVals.setDefaultValues(outerConfig, defaultConfig);
      //设置默认字段
      for (var i = 0; i < outerConfig.panels.length; i++) {
         var item = outerConfig.panels[i];
         var defaultFieldConfig = {
            panelTitleField: "title",
            panelUrlField: "url",
            panelTextField: "text",
            panelTipsField: "tips",
         };
         nsVals.setDefaultValues(item, defaultFieldConfig);
      }
      //设置config
      config.el = outerConfig.el.indexOf('#') != -1 ? outerConfig.el : '#' + outerConfig.el;
      nsVals.setDefaultValues(config.btnInfo, outerConfig);
      typeof outerConfig.panels != 'undefined'
         ? config.panels = $.extend(true, [], outerConfig.panels)
         : '';
      typeof messageVm != 'undefined' ? config.messageIsShow = messageVm.messageIsShow : config.messageIsShow = false;
      $(config.el).empty();
      // console.log(config);
   }
   //获得html
   function getHtml(type) {
      var html = {
         mainHtml: '<li @click="openPanel($event)" class="pt-top-menu-item">\
                        <div class="pt-top-menu-item-row">\
                           <a class="pt-nav-item" href="#">\
                              <i class="icon-bell-o"></i>\
                              <span>{{vueConfig.btnInfo.title}}</span>\
                              <span class="pt-badge pt-badge-warning">{{allMessageNum}}</span>\
                           </a>\
                        </div>\
                        <div class="pt-top-nav-block" v-show="messageIsShow"></div>\
                     </li>',
         panelHtml: '<div v-for="(panel, panelIndex) in panels" :key="panel"  class="pt-list-block" :class="[\'pt-\' + panel.type + \'-info\']">\
                        <div class="title">\
                            <h5>{{panel.name}}</h5>\
                            <span class="pt-badge">{{panel.tips}}</span>\
                            <small>{{panel.hint}}</small>\
                            <div class="pt-btn-group">\
                            <button class="pt-btn pt-btn-default pt-btn-icon pt-btn-circle" @click="openPanelMore(panel)">\
                                <i class="icon-ellipsis-h"></i>\
                            </button>\
                            </div>\
                        </div>\
                        <ul class="clearfix">\
                           <li v-for="(item,index) in panel.rows" :key="item">\
                              <a href="#" @click="loadPage(panel, index)">\
                                 <h6>{{item[panel.panelTitleField]}}</h6>\
                                 <p>{{item[panel.panelTextField]}}</p>\
                                 <span class="pt-badge">{{item[panel.panelTipsField]}}</span>\
                              </a>\
                           </li>\
                        </ul>\
                     </div>'
      };
      return html[type];
   }
   //showByName
   function showByName(panel) {
      var rows = panel.rows;
      var nameMap = {};
      var nameRows = [];
      for (var index = 0; index < rows.length; index++) {
         var item = rows[index];
         var name = item.activityName;
         if (!nameMap[name]) {
            // nameMap[name][panel.panelTextField] = name
            nameMap[name] = {
               activityId: item.activityId,
               processId: item.processId,
               formUrl: item.formUrl,
               rows: []
            };
            nameMap[name][panel.panelTitleField] = name;
            nameMap[name][panel.panelTipsField] = 0;
            nameRows.push(nameMap[name]);
         } else {
            //有重复的activityName时
            /* delete nameMap[name].activityId;
            delete nameMap[name].processId; */
         }
         if (!nameMap[name].formUrl && item.formUrl) {
            nameMap[name].formUrl = item.formUrl;
         }
         nameMap[name].rows.push(item);
         nameMap[name][panel.panelTipsField] += parseInt(item[panel.panelTipsField]);
      }
      return nameRows;
   }
   //构建容器
   function vueInit() {
      messageVm = new Vue({
         el: config.el,
         data: {
            rolloutMaxHeight: $('html').height() - 338,
            rolloutLength: 5,
            vueConfig: $.extend(true, {}, config),
            messageIsShow: config.messageIsShow
         },
         created: function () {
            var vm = this;
            var vueConfig = vm.vueConfig;
            //先添加按钮
            var $currentHtml = $(getHtml('mainHtml'));
            if ($(vueConfig.el).find('ul').length == 0) {
               $(vueConfig.el).append('<ul></ul>');
            }
            $(vueConfig.el).find('ul').append($currentHtml);
            //再添加各个面板
            var $panelsParent = $currentHtml.find('.pt-top-nav-block');
            var $currentTypeHtml = $(getHtml('panelHtml'));
            $panelsParent.append($currentTypeHtml);
            //提取每一类型的字段
            for (var i = 0; i < vm.vueConfig.panels.length; i++) {
               var item = vm.vueConfig.panels[i];
               vueConfig.btnInfo.tips += item.rows.length;
               vm[item.type] = {};
               for (var key in item) {
                  if (item.hasOwnProperty(key)) {
                     var element = item[key];
                     if (key.indexOf('panel') != -1) {
                        vm[item.type][key] = element;
                     }
                  }
               }
            }
         },
         methods: {
            openPanel: function (e) {
               var vm = this;
               vm.messageIsShow = !vm.messageIsShow;
               //添加一些document点击事件
               if (!vm.messageIsShow) {
                  $(document).off('click');
               } else {
                  $(document).on('click', function (e) {
                     if ($(e.target).parents(vm.vueConfig.el).length == 0) {
                        vm.messageIsShow = false;
                     }
                  });
               }
               //设置弹出窗偏移量，不会超出窗口
               var remainWidth = $('html').width() - ($(config.el).offset().left + parseInt($(config.el).css('paddingLeft')));
               if (remainWidth < 570) {
                  var offsetLeft = $('.pt-list-block').width() - remainWidth;
                  $(config.el).find('.pt-top-nav-block').css('position', 'absolute').css('left', -offsetLeft);
               }
            },
            openPanelMore: function (panel) {
               NetstarUI.labelpageVm.loadPage(panel.url, panel.name);
            },
            loadPage: function (panel, index) {
               var vm = this;
               var type = panel.type;
               switch (type) {
                  case 'board':

                     break;
                  case 'rollout':
                     var panelItem = panel.rows[index];
                     var url = panelItem[vm[type].panelUrlField];
                     var title = panelItem[vm[type].panelTitleField];
                     var activityId = panelItem.activityId;
                     var processId = panelItem.processId;
                     var text = panelItem[vm[type].panelTextField];
                     var tips = panelItem[vm[type].panelTipsField];
                     if (url.indexOf('/') != 0) {
                        url = '/' + url;
                     }
                     if (url.indexOf(',') >= 0) {
                        url = url.split(',')[0];
                     }
                     url = url + ';activityName=' + title + ';isForwardedList=false';
                     if (typeof activityId != 'undefined' && typeof processId != 'undefined') {
                        url = url + ';processId=' + processId + ';activityId=' + activityId;
                     }
                     NetstarUI.labelpageVm.loadPage(url, title);
                     break;
                  case 'list':

                     break;

                  default:
                     break;
               }
            }
         },
         computed: {
            panels: function () {
               var panelArr = [];
               for (var index = 0; index < this.vueConfig.panels.length; index++) {
                  var item = this.vueConfig.panels[index];
                  panelArr.push($.extend(true, {}, item));
                  panelArr[panelArr.length - 1].rows = showByName(item);
               }
               return panelArr;
            },
            allMessageNum: function () {
               var num = 0;
               for (var index = 0; index < this.vueConfig.panels.length; index++) {
                  var item = this.vueConfig.panels[index];
                  for (var idx = 0; idx < item.rows.length; idx++) {
                     var itm = item.rows[idx];
                     var itmTips = parseInt(itm[item.panelTipsField]);
                     if (!isNaN(itmTips)) {
                        num += itmTips;
                     }
                  }

               }
               num > 99 ? num = '99+' : '';
               return num;
            }
         },
         mounted: function () {
            $('.pt-rollout-info').find('ul').css('max-height', this.rolloutMaxHeight);
         },
      });
   }
   //返回待办的rows
   function getRollOutRows() {
      for (var i = 0; i < messageVm.vueConfig.panels.length; i++) {
         var item = messageVm.vueConfig.panels[i];
         if (item.type == 'rollout') {
            return item.rows;
         }
      }
   }
   //设置待办的rows
   function setRollOutRows(rows) {
      for (var i = 0; i < messageVm.vueConfig.panels.length; i++) {
         var item = messageVm.vueConfig.panels[i];
         if (item.type == 'rollout') {
            item.rows = rows;
         }
      }
   }
   //刷新
   function refreshMessage(cb, isConnect) {
      nsEngine.getWaitingList(null, function (rows) {
         var messageConfig = {
            el: "topBarNavMessage",
            title: "消息",
            tips: rows.length,
            panels: [
               {
                  name: "我的待办",
                  type: "rollout",
                  tips: "",
                  url: "/netStarRights/iwilldo",
                  panelTitleField: "activityName",
                  panelUrlField: "formUrl",
                  panelTextField: "processName",
                  panelTipsField: "workitemCount",
                  rows: rows
               }
            ]
         };
         setDefault(messageConfig);
         vueInit();
         cb && cb(getRollOutRows());
      });
   }
   function verifyEL(config) {
      if (typeof config.el == 'undefined') {
         nsalert('请填写el信息', 'warning');
         console.error('消息推送:请填写el信息', 'warning');
         return false;
      }
      return true;
   }
   return {
      init: init,
      getRollOutRows: getRollOutRows,
      setRollOutRows: setRollOutRows,
      refreshMessage: refreshMessage
   };
})(jQuery);
/**
 * panleGroupNum 是第几个组
 * rolloutLength  是规定的每个组显示几个
 * panel.rows[index + (panelGroupNum - 1) * rolloutLength] 就是分组后当前是第几个
 */
/*<ul class="clearfix" v-for="panelGroupNum in Math.ceil(panel.rows.length / rolloutLength)">\
    <li v-for="(item,index) in panel.rows" :key="item.url">\
        <template v-if="index < rolloutLength*panelGroupNum && typeof panel.rows[index + (panelGroupNum - 1) * rolloutLength] != \'undefined\'">\
        <a href="#" @click="loadPage(panel.rows[index + (panelGroupNum - 1) * rolloutLength].url,panel.rows[index + (panelGroupNum - 1) * rolloutLength].title)">\
            <h6>{{panel.rows[index + (panelGroupNum - 1) * rolloutLength].title}}</h6>\
            <p>{{panel.rows[index + (panelGroupNum - 1) * rolloutLength].text}}</p>\
            <span class="pt-badge">{{panel.rows[index + (panelGroupNum - 1) * rolloutLength].tips}}</span>\
        </a>\
        </template>\
    </li>\
</ul>\ */