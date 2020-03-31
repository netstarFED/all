typeof NetstarUI == 'undefined' ? NetstarUI = {} : "";
var isCachePageByLablePages = false;
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
         title: "",
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
            panelDiffTimeUnit: 'latestTime'
         };
         nsVals.setDefaultValues(item, defaultFieldConfig);
      }
      //设置config
      config.el = outerConfig.el.indexOf('#') != -1 ? outerConfig.el : '#' + outerConfig.el;
      config.isCategroy = isCachePageByLablePages;
      nsVals.setDefaultValues(config.btnInfo, outerConfig);
      typeof outerConfig.panels != 'undefined' ?
         config.panels = $.extend(true, [], outerConfig.panels) :
         '';
      typeof messageVm != 'undefined' ? config.messageIsShow = messageVm.messageIsShow : config.messageIsShow = false;
      $(config.el).empty();
      // console.log(config);
   }
   //获得html
   function getHtml(type) {
      /* <ul class="clearfix">\
             <li v-for="(item,index) in panel.rows" :key="item">\
                <a href="#" @click="loadPage(panel, index)">\
                   <h6>{{item[panel.panelTitleField]}}</h6>\
                   <p>{{item[panel.panelTextField]}}</p>\
                   <span class="pt-badge">{{item[panel.panelTipsField]}}</span>\
                </a>\
             </li>\
          </ul>\
       */
      //icon-ellipsis-h
      var html = {
         mainHtml: '<li class="pt-top-menu-item">\
                         <div class="pt-top-menu-item-row" @click="openPanel($event)">\
                            <a class="pt-nav-item" href="#">\
                               <i class="icon-bell-o"></i>\
                               <span>{{vueConfig.btnInfo.title}}</span>\
                               <span class="pt-badge pt-badge-warning">{{allMessageNum}}</span>\
                            </a>\
                         </div>\
                         <div class="pt-top-nav-block pt-top-scroll" v-show="messageIsShow"></div>\
                      </li>',
         panelHtml: '<div v-for="(panel, panelIndex) in panels" :key="panel"  class="pt-list-block" :class="[\'pt-\' + panel.type + \'-info\']">\
                         <div class="title">\
                             <h5>{{panel.name}}</h5>\
                             <span class="pt-badge">{{panel.tips}}</span>\
                             <small>{{panel.hint}}</small>\
                             <div class="pt-btn-group">\
                             <button class="pt-btn pt-btn-default pt-btn-icon pt-btn-circle" @click.stop="openPanelMore">\
                                 <i class="icon-all-o"></i>\
                             </button>\
                             </div>\
                         </div>\
                        <div class="pt-list-block-classify" v-if="isCategroy === true" v-for="(dataitem,proname) in panel.categroyRows">\
                           <div class="pt-list-block-classify-title"><i class="icon-history"></i>{{proname}}</div>\
                           <div class="pt-block-list card-task" v-for="(item,index) in dataitem" :key="item">\
                              <div class="pt-block-content" @click="loadPageByCategroy(panel,index,dataitem)">\
                                 <div class="card-task-top">\
                                    <div class="card-task-title"><a href="javascript:void(0);" :title="item[panel.panelTitleField]">{{item[panel.panelTitleField]}}</a></div>\
                                    <span class="card-task-number">{{item[panel.panelTipsField]}}</span>\
                                 </div>\
                                 <div class="card-task-tag"><div class="card-task-sub-title">{{item[panel.panelTextField]}}</div><div class="card-task-time">{{item[panel.panelDiffTimeUnit]}}</div></div>\
                              </div>\
                           </div>\
                        </div>\
                        <div class="pt-block-list card-task" v-for="(item,index) in panel.rows" :key="item" v-if="isCategroy === false">\
                           <div class="pt-block-content" @click="loadPage(panel, index)">\
                              <div class="card-task-top">\
                                 <div class="card-task-title"><a href="javascript:void(0);" :title="item[panel.panelTitleField]">{{item[panel.panelTitleField]}}</a></div>\
                                 <span class="card-task-number">{{item[panel.panelTipsField]}}</span>\
                              </div>\
                              <div class="card-task-tag"><div class="card-task-sub-title">{{item[panel.panelTextField]}}</div><div class="card-task-time">{{item[panel.panelDiffTimeUnit]}}</div></div>\
                           </div>\
                        </div>\
                      </div>'
      };
      return html[type];
   }
   //sjj 201200109 根据processName存储信息
   function showByProcessName(_dataArr) {
      var categroyRowsJson = {};
      for (var i = 0; i < _dataArr.length; i++) {
         var data = _dataArr[i];
         if (typeof (categroyRowsJson[data.processName]) == 'undefined') {
            categroyRowsJson[data.processName] = [];
         }
         categroyRowsJson[data.processName].push(data);
      }
      return categroyRowsJson;
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
               latestTime: item.latestTime,
               processName: item.processName,
               rows: []
            };
            nameMap[name][panel.panelTitleField] = name;
            nameMap[name][panel.panelTipsField] = 0;
            nameMap[name][panel.panelDiffTimeUnit] = '';
            if (item.latestTime) {
               nameMap[name][panel.panelDiffTimeUnit] = NetStarUtils.getDiffByTimeUnit(item.latestTime); //时间差 
            }
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
            messageIsShow: config.messageIsShow,
            isCategroy: config.isCategroy, //sjj 20200109 是否分类展示 默认false 
         },
         watch : {
            panels : function(panelList, old){
               for(var i=0; i<panelList.length; i++){
                  if(panelList[i].type == "rollout"){
                     if(typeof(NetstarHomePage) == "object" && typeof(NetstarHomePage.mainMessageVue) == "object"){
                        NetstarHomePage.mainMessageVue.detailsData = panelList[i].rows;
                     }
                  }
               }
            },
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
                  /*if($(config.el).attr('id')=='topMessageBarNav'){
                    $(config.el).find('.pt-top-nav-block').removeClass('hide');
                    $(config.el).find('.pt-top-nav-block').removeAttr('style');
                  }else{
                    $(config.el).find('.pt-top-nav-block').addClass('hide');
                    $(config.el).find('.pt-top-nav-block').css('position', 'absolute').css('left', -offsetLeft);
                  }*/
               }
            },
            openPanelMore: function (ev) {
               //sjj 20200109
               var $btn = $(ev.target).closest('button');
               $btn.toggleClass('categroy-panel');
               if ($btn.hasClass('categroy-panel')) {
                  $btn.children('i').attr('class', 'icon-all');
                  this.isCategroy = true;
               } else {
                  $btn.children('i').attr('class', 'icon-all-o');
                  this.isCategroy = false;
               }
               isCachePageByLablePages = this.isCategroy;
            },
            loadPage: function (panel, index) {
               var vm = this;
               var type = panel.type;
               vm.messageIsShow = !vm.messageIsShow;
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
                     var packageSuffix = '-0-' + activityId;
                     url = url + ';activityName=' + title + ';workflowType=0;packageSuffix=' + packageSuffix + ';';
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
            },
            loadPageByCategroy: function (panel, index, data) {
               var vm = this;
               var type = panel.type;
               vm.messageIsShow = !vm.messageIsShow;
               switch (type) {
                  case 'board':

                     break;
                  case 'rollout':
                     var panelItem = data[index];
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
                     var packageSuffix = '-0-' + activityId;
                     url = url + ';activityName=' + title + ';workflowType=0;packageSuffix=' + packageSuffix + ';';
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
                  panelArr[panelArr.length - 1].categroyRows = showByProcessName(panelArr[panelArr.length - 1].rows); //sjj 20200109
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
               //  num > 99 ? num = '99+' : '';
               num > 999 ? num = '999+' : ''; // 
               return num;
            }
         },
         mounted: function () {
            $('.pt-rollout-info').find('ul').css('max-height', this.rolloutMaxHeight);
            
            var panels = this.panels;
            for(var i=0; i<panels.length; i++){
               if(panels[i].type == "rollout"){
                  if(typeof(NetstarHomePage) == "object" && typeof(NetstarHomePage.mainMessageVue) == "object"){
                     NetstarHomePage.mainMessageVue.detailsData = panels[i].rows;
                  }
               }
            }
         },
      });
   }
   // 返回待办显示列表
   function getShowRows(){
      for (var i = 0; i < messageVm.panels.length; i++) {
         var item = messageVm.panels[i];
         if (item.type == 'rollout') {
            return item.rows;
         }
      }
   }
   // 返回待办的rows
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
            el: "topMessageBarNav",
            title: "消息",
            tips: rows.length,
            panels: [{
               name: "我的待办",
               type: "rollout",
               tips: "",
               url: "/netStarRights/iwilldo",
               panelTitleField: "activityName",
               panelUrlField: "formUrl",
               panelTextField: "processName",
               panelTipsField: "workitemCount",
               rows: rows
            }]
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
      getShowRows : getShowRows,
      getRollOutRows: getRollOutRows,
      setRollOutRows: setRollOutRows,
      refreshMessage: refreshMessage
   };
})(jQuery);
NetstarUI.labelPages = function (id, containerParent) {
   var functionHandler = {
      //点击tab页时调用的方法
      recordHandler: function (index) {
         var currentPage = rowNavVue.labelPagesArr[index];
         // typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.inPageHandler(currentPage.currentLi);
         typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.inPageHandler(currentPage.attrs, currentPage);
      },
      //关闭调用
      closeHandler: function (index) {
         var currentPage = rowNavVue.labelPagesArr[index];
         typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.unsubscribeByUntId(typeof currentPage.config != 'undefined' ? currentPage.config.package : '');
      },
      //刷新调用
      refreshHandler: function (currentPage) {
         typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.refreshInfoRemind(currentPage.attrs);
      }
   };
   var containerW = $('#' + id).outerWidth();
   var availableWidth = containerW - 108; //标签页的宽度-首页标签固定的宽度-下拉选项的宽度
   var rowNavVue = new Vue({
      el: "#" + id,
      data: {
         containerParent: containerParent,
         currentTab: 0,
         navFunctionShow: false,
         labelPagesArr: [],
         pageProperty: [],
         availableWidth: availableWidth
      },
      created: function () {
         this.labelPagesArr.push({
            title: '首页',
            url: '/home',
            dom: $(this.containerParent).find('container:not(.hidden)').get(0),
            config: "",
            attrs: {}
         });
         /*****************************sjj 添加左右滑动支持的按钮 start */
         var leftBtnHtml = '<button class="pt-btn pt-btn-icon hide pt-labelpage-btn" ns-prev="true" ns-labelpageId="' + id + '" @click="prevLablePagesClickHandler"><i class="icon-arrow-left-o"></i></button>';
         var rightBtnHtml = '<button class="pt-btn pt-btn-icon hide pt-labelpage-btn" ns-next="true" ns-labelpageId="' + id + '" @click="nextLablePagesClickHandler"><i class="icon-arrow-right-o"></i></button>';
         /*****************************sjj 添加左右滑动支持的按钮 end */
         var tabHtml = leftBtnHtml + '<div class="pt-nav">\
                                <ul id="ul-' + id + '">\
                                    <li class="pt-nav-item"\
                                    v-for="(item, index) in labelPagesArr" :key="item"\
                                     @click="recordCurrent(index,$event)" @mouseenter.stop.prevent="mouseEnterCurrent($event)"\>\
                                        <a href="javascript:void(0);">\
                                        {{item.title}}\
                                        </a>\
                                        <div v-if="index != 0" @click.stop="removeCurrent(index)" class="pt-btn-clear">\
                                            <i class="icon-close-alt-o"></i>\
                                        </div>\
                                    </li>\
                                </ul>\
                            </div>\
                            ' + rightBtnHtml + '\
                            <div class="pt-nav pt-tabbar-control">\
                                <div class="pt-nav-toggle" @click="toggleNavFunction">\
                                    <i class="icon-arrow-down"></i>\
                                </div>\
                                <ul v-show="navFunctionShow" class="pt-dropdown-menu">\
                                    <li class="pt-nav-item" @click="removeAll"><span>关闭全部标签</span></li>\
                                    <li class="pt-nav-item" @click="removeOther"><span>关闭其他标签</span></li>\
                                    <li class="pt-nav-item" @click="removeCurrent(currentTab)"></i><span>关闭当前标签</span></li>\
                                </ul>\
                            </div>';
         $('#' + id).append(tabHtml);
      },
      methods: {
         //sjj 20200107
         prevLablePagesClickHandler: function (ev) {
            var $btn = $(ev.target).closest('button');
            var ulId = 'ul-' + $btn.attr('ns-labelpageId');
            if (this.labelpageNum == 1) {
               $btn.attr('disabled','disabled');
               //nsalert('已经是第一页', 'warning');
               return;
            }
            $btn.removeAttr('disabled');
            $btn.siblings().removeAttr('disabled');
            this.labelpageNum--;

            var iStart = (this.labelpageNum) * this.totalPageNum;
            var iEnd = iStart + this.totalPageNum;
            if (this.labelpageNum == 1) {
               $('#' + ulId).css({
                  left: '0px',
                  overflow: "hidden",
                  position: "absolute"
               });
            }
            if (this.labelpageNum > 1) {
               //var $lis = $("#"+ulId+' li:gt('+iStart+')');
               var $lis = $("#" + ulId + ' li:lt(' + iStart + ')');
               var nowW = 0;
               $.each($lis, function (v, k) {
                  nowW += $(k).outerWidth();
               })
               var leftNum = nowW - this.availableWidth;
               $("#" + ulId).stop().animate({
                  left: -leftNum
               }, 300);
            }
            return;
            if (NetstarUI.labelpageVm.currentTab == 0) {
               $('#' + ulId).css({
                  left: '0px',
                  overflow: "hidden",
                  position: "absolute"
               });
               nsalert('已经是第一个', 'warning');
               return;
            }
            var currentLiW = $('#' + ulId + ' >li.current').outerWidth();
            NetstarUI.labelpageVm.recordCurrent(NetstarUI.labelpageVm.currentTab - 1);
            if (NetstarUI.labelpageVm.currentTab == 0) {
               $('#' + ulId).css({
                  overflow: "hidden",
                  position: "absolute",
                  left: '0px'
               });
               return;
            }
            var curretnTabIndex = NetstarUI.labelpageVm.currentTab - 1;
            var $lis = $("#" + ulId + ' li:gt(' + curretnTabIndex + ')');
            var nowW = 0;
            $.each($lis, function (v, k) {
               nowW += $(k).outerWidth();
            })
            if (nowW > availableWidth) {
               var leftOffset = $('#' + ulId).css('left');
               var move = Number(leftOffset.substring(0, leftOffset.indexOf('p'))) + currentLiW;
               if (move < 0) {
                  $("#" + ulId).stop().animate({
                     "left": move
                  }, 300);
               } else {
                  $('#' + ulId).css({
                     left: '0px',
                     overflow: "hidden",
                     position: "absolute"
                  });
               }
            }
         },
         nextLablePagesClickHandler: function (ev) {
            var $btn = $(ev.target).closest('button');
            var ulId = 'ul-' + $btn.attr('ns-labelpageId');

            var currentPage = this.labelpageNum - 1;
            var iStart = (currentPage) * this.totalPageNum;
            var iEnd = iStart + this.totalPageNum;
            
            $btn.siblings().removeAttr('disabled');
            if (iEnd > NetstarUI.labelpageVm.labelPageLength) {
               $btn.attr('disabled','disabled');
               //nsalert('已经是最后一页', 'warning');
               return;
            }
            if(this.labelpageNum > this.totalPageNum){
               $btn.attr('disabled','disabled');
               return;
            }
            $btn.removeAttr('disabled');
            this.labelpageNum++;

            var $lis = $("#" + ulId + ' li:lt(' + iEnd + ')');
            var nowW = 0;
            $.each($lis, function (v, k) {
               nowW += $(k).outerWidth();
            })

            //console.log(iStart)
            //console.log(iEnd)
            //console.log(nowW)
            $("#" + ulId).stop().animate({
               left: -nowW
            }, 300);
            return;
            if (NetstarUI.labelpageVm.currentTab == 10) {
               nsalert('已经是最后一个', 'warning');
               return;
            }
            if (typeof (NetstarUI.labelpageVm.labelPagesArr[NetstarUI.labelpageVm.currentTab + 1]) == 'undefined') {
               nsalert('已经是最后一个', 'warning');
               return;
            }
            NetstarUI.labelpageVm.recordCurrent(NetstarUI.labelpageVm.currentTab + 1);

            var $lis = $("#" + ulId + ' li:gt(' + NetstarUI.labelpageVm.currentTab + ')');
            var nowW = 0;
            $.each($lis, function (v, k) {
               nowW += $(k).outerWidth();
            })

            var leftOffset = $('#' + ulId).css('left');
            leftOffset = Number(leftOffset.substring(0, leftOffset.indexOf('p')));
            var liWidth = 0;
            var $lis = $('#' + ulId + ' >li:lt(' + NetstarUI.labelpageVm.currentTab + ')');
            $.each($lis, function (v, w) {
               var liW = $(w).outerWidth();
               liWidth += liW;
            })
            if (availableWidth - nowW >= 200) {
               //不需要再计算
               //$('#'+ulId).css({left:'0px',overflow:"hidden",position:"absolute"});
            } else {
               $("#" + ulId).stop().animate({
                  left: -liWidth
               }, 300);
            }
         },
         // 新编辑器加载页面
         newLoadPage : function(config){
            /**
             * config               object {}
             *    url               页面地址
             *    title             tab页标题
             *    isOpenNewTab      是否打开新的tab页
             *    pageOperateData   当前页面的操作数据 用于newtab按钮 页面之间传递数据
             *    isCachePage       是否缓存页面配置
             *    labelpageVmDataByGrid
             */
            // 验证
            if(typeof(config) != "object"){
               console.error('打开页面失败，请检查配置');
               nsAlert('打开页面失败，请检查配置');
               return false;
            }
            if(typeof(config.url) != "string" || config.url.length == 0){
               console.error('打开页面失败，请检查配置');
               nsAlert('打开页面失败，请检查配置');
               return false;
            }
            // 添加默认配置
            var defaultConfig = {
               url : '',
               title : '',
               isOpenNewTab : true,
               pageOperateData : {},
               isCachePage : true,
               labelpageVmDataByGrid : {},
            };
            NetStarUtils.setDefaultValues(config, defaultConfig);
            var url = config.url;
            // vue对象
            var vm = this;
            //如果超过10个，则提示不可再添加
            if (vm.labelPageLength > 10) {
               nsalert('超过页面数上限', 'warning');
               console.warn('超过页面数上限');
               return false;
            }
            // 未知操作 从原来方法获取到不知道用途
            vm.loadType = 'ajaxUrl';
            //是否打开新的tab页
            vm.isNewTab = config.isOpenNewTab;

            //根据url来获取contaienrId和是否多开
            function getContainerIdAndIsMulitByUrl(urlStr){
               var isMulitTab = false;
               // 替换地址中domId不识别的符号 /：.
               var id = urlStr.replace(/(\/|\:|\.)/g, '-');
               var separatorArr = ['?', ';'];
               // 截取？/：之前的部分
               $.each(separatorArr, function (index, item) {
                  if (id.indexOf(item) != '-1') {
                     id = id.substring(0, id.indexOf(item));
                  }
               });
               // 通过模板参数添加id
               // 同一模板打开多次 识别"{"判断templateparam传值是否为对象，isMulitTab ：表示是否多开 多开时读取packageName表示包名添加时间戳
               // lyw 原因：判断是否打开新tab通过判断的url地址（删除了？后边）所以阻止了同一个地址多开 根据此参数添加 20190911
               if (urlStr.indexOf('templateparam') > 0) {
                  var tempValueNameCode = urlStr.substring(urlStr.indexOf('templateparam') + 'templateparam='.length)
                  if (tempValueNameCode.indexOf(';') > -1) {
                     tempValueNameCode = tempValueNameCode.substring(0, tempValueNameCode.indexOf(';'))
                  }
                  tempValueNameCode = decodeURIComponent(tempValueNameCode);
                  if (tempValueNameCode.indexOf('{') == 0) {
                     tempValueNameCode = JSON.parse(tempValueNameCode);
                     if (tempValueNameCode.isMulitTab) {
                        isMulitTab = true;
                        id += '-' + tempValueNameCode.packageName.replace(/(\/|\:|\.)/g, '-');
                     }
                  } else {
                     //sjj 20190916 因为当前url可能相同，所以为了保证容器id的唯一性，如果存在参数则把参数也拼接到容器id中
                     id += '-' + tempValueNameCode.replace(/(\/|\:|\.)/g, '-');
                  }
               }
               var packageSuffix = '';
               // 通过在url后拼写packageSuffix自定义添加id
               if (urlStr.indexOf('packageSuffix') > -1) {
                  var urlArr = urlStr.split(';');
                  for (var i = 0; i < urlArr.length; i++) {
                     if (urlArr[i].indexOf('packageSuffix') > -1) {
                        var _urlProArr = urlArr[i].split('=');
                        packageSuffix = _urlProArr[1];
                        id += _urlProArr[1];
                        break;
                     }
                  }
               }
               return {
                  id : id,
                  isMulitTab : isMulitTab,
                  packageSuffix : packageSuffix
               };
            }
            var obj = getContainerIdAndIsMulitByUrl(url);
            var containerId = obj.id;
            var isMulitTab = obj.isMulitTab;
            var packageSuffix = obj.packageSuffix;
            //如果已经打开过，且没有关闭过，则打开
            var isAleadyOpen = false;
            var urlIndex = this.urlIsOpen(url, vm.isNewTab);
            if(urlIndex != -1 && !isMulitTab){
               // 当前没有打开并且不是多开 只需要切换tab
               isAleadyOpen = true;
            }
            if(isAleadyOpen){
               //url链接已经打开 并且不是多开
               var isRefresh = true;
               var labelpageVmDataByGrid = config.labelpageVmDataByGrid;
               if(!$.isEmptyObject(labelpageVmDataByGrid)){
                  if(labelpageVmDataByGrid.labelpageVmById){
                     if(labelpageVmDataByGrid.labelpageVmById[labelpageVmDataByGrid.id]){
                        if(vm.labelPagesArr[labelpageVmDataByGrid.labelpageVmById[labelpageVmDataByGrid.id].currentTab]){
                           urlIndex = labelpageVmDataByGrid.labelpageVmById[labelpageVmDataByGrid.id].currentTab;
                        }
                        isRefresh = false;
                     }
                  }
               }
               vm.labelPagesArr[urlIndex].title = config.title;
               vm.labelPagesArr[urlIndex].currentUrl = config.url;
               vm.recordCurrent(urlIndex, isRefresh);
               return true;
            }
            // 先隐藏当前页面，并添加新的容器
            var $containerParent = $(vm.containerParent);
            var $currentContainer = $containerParent.find('container:not(.hidden)');
            $currentContainer.addClass('hidden');
            var currentContainerId = $currentContainer.attr('id');
            if(typeof(currentContainerId) == 'undefined') {
               //如果没有id则添加时间戳
               var currentContainerId = 'projecthomepage' + '-' + new Date().valueOf();
               $currentContainer.attr('id', currentContainerId);
            }
            vm.hiddenContainerId = currentContainerId;
            vm.currentContainerId = containerId;
            /***未知代码start*****/
            // 再次判断是否已经打开 不知道为什么 通过原来获得
            // 如果当前有这个容器，说明已经有这个页面了，那么就要进行if里面的操作
            var findUrl = containerId.replace(/-/g, '/');
            var index = vm.arrayIsInclude(findUrl);
            isAleadyOpen = index == -1 ? false : true;
            if(isAleadyOpen){
               //如果是用object加的页面。则直接显示那个页面
               if (vm.loadType == 'object') {
                  vm.recordCurrent(index);
                  return false;
               }
               //否则进行以下操作
               if (vm.isNewTab) {
                  vm.isEditConfig = true;
                  vm.currentContainerId = containerId + '-' + new Date().valueOf();
                  $containerParent.append('<container id="' + containerId + '"></container>');
                  vm.labelPagesArr.push({
                     title: title,
                     url: url,
                  });
               } else {
                  //sjj 20190806 添加方法 vm.labelPagesArr[index].dom不存在时候的逻辑补充
                  if (typeof (vm.labelPagesArr[index].dom) == 'undefined') {
                     vm.labelPagesArr[index].dom = $('#' + containerId);
                     $('#' + containerId).empty();
                     $('#' + containerId).removeClass('hidden');
                     vm.currentTab = index;
                     functionHandler.recordHandler(index);
                     vm.setCurrent(index);
                  } else {
                     $(vm.labelPagesArr[index].dom).empty();
                     vm.recordCurrent(index);
                     vm.currentContainerId = $(vm.labelPagesArr[index].dom).attr('id');
                  }
               }
            }
            /***未知代码end*****/
            else{
               $containerParent.append('<container id="' + containerId + '"></container>');
               // 将title 和 url 事先添加进去(造成加载很快的假象)
               var isEditPackageName = false;
               var existUrlIndex = this.urlIsOpen(url, false);
               if (existUrlIndex > -1) {
                  isEditPackageName = true;
                  vm.isEditConfig = true;
               }
               vm.labelPagesArr.push({
                  title: config.title,
                  url: url,
                  dom: $('#' + vm.currentContainerId),
                  isEditConfig: isEditPackageName,
                  packageSuffix: packageSuffix,
               });
            }
            setTimeout(function () {
               vm.openPage(config);
            }, 0)
         },
         openPage : function(config){
            var vm = this;
            var url = config.url;
            // var pageId = config.url;
            // if(pageId.indexOf('?') > -1){
            //    pageId = pageId.substring(0, pageId.indexOf('?'));
            // }
            if (url.indexOf("http") == 0) {
            } else {
               url = getRootPath() + url;
            }
            var pageConfig = {
               pageIidenti: url,
               url: url,
               // pageId : pageId,
               pageOperateData: config.pageOperateData,
               isCachePage: config.isCachePage,
               callBackFunc: function (isSuccess, data, _pageConfig) {
                  if (isSuccess) {
                     res = data;
                     var pageOperateDataStr = typeof (_pageConfig.pageOperateData) == "object" ? JSON.stringify(_pageConfig.pageOperateData) : '{}';
                     var $currentContainer = $(vm.containerParent).find('container#' + vm.currentContainerId);

                     var resPageParam = vm.getContainerAndConfigName(res);
                     var templateInit = resPageParam.templateInit;
                     var containerHtml = resPageParam.containerHtml;
                     var configName = resPageParam.configName;

                     if (templateInit) {
                        templateInit[0] = templateInit[0].replace(configName, configName + ', ' + pageOperateDataStr);
                     }

                     //渲染到页面上
                     if (vm.isEditConfig && templateInit) {
                        vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = true;
                        // 是否存在包名后缀配置 如果存在设置包名
                        var newPackageSuffix = new Date().valueOf();
                        if (vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix && vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix.length > 0) {
                           newPackageSuffix += vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix;
                        }
                        var addHtml = configName + ".package = " + configName + ".package + '.' +\"" + newPackageSuffix + "\";\n" + templateInit[0];
                        containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
                     } else {
                        vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = false;
                        // 是否存在包名后缀配置 如果存在设置包名
                        if (vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix && vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix.length > 0) {
                           var _addHtml = configName + ".package = " + configName + ".package + '.' +\"" + vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix + "\";" + templateInit[0];
                           containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, _addHtml);
                        }
                     }
                     //如果有配置的话，则添加以下内容
                     if ($.trim(configName).length != 0) {
                        var addHtml = templateInit[0] + ';' + 'NetstarUI.labelpageVm.setContaienrConfig("' + url + '",' + configName + ')';
                        containerHtml = containerHtml.replace(/NetstarTemplate\.init\((.*?)\)/, addHtml);
                     } else {
                        vm.loadType == 'object' ?
                           vm.labelPagesArr[vm.labelPageLength - 1].config = $.extend(true, {}, vm.containerObj) :
                           vm.labelPagesArr[vm.labelPageLength - 1].config = '';
                     }
                     // vm.labelPagesArr[vm.labelPageLength - 1].ajaxRes = res;
                     vm.labelPagesArr[vm.labelPageLength - 1].pageIidenti = _pageConfig.pageIidenti;

                     //sjj 20190710 对需要弹出的页面额外处理 NetstarOriginalMenuList是需要弹出的页面
                     if (typeof (NetstarOriginalMenuList) == 'object') {
                        if (NetstarOriginalMenuList[url]) {
                           var timerStr = 'container-simple-table-' + new Date().valueOf();
                           var formId = 'form-scientificInput-' + new Date().valueOf();
                           containerHtml = containerHtml.replace('container-simple-table', timerStr);
                           containerHtml = containerHtml.replace('#container-simple-table', '#' + timerStr);
                           var regRules = new RegExp("form-scientificInput", "g");
                           containerHtml = containerHtml.replace(regRules, formId);
                           //containerHtml = containerHtml.replace('form-scientificInput',formId);
                        }
                     }



                     $currentContainer.append(containerHtml);
                     vm.isNewTab ? vm.labelPagesArr[vm.labelPageLength - 1].dom = $currentContainer.get(0) : '';
                     //设置currentTab
                     vm.currentTab = vm.labelPageLength - 1;
                     functionHandler.refreshHandler(vm.labelPagesArr[vm.labelPageLength - 1]);


                     //sjj 20200107 如果当前屏幕盛不下10个标签页，需要出左右箭头来支持切换显示
                     var ulWidth = $('#' + id + ' ul').outerWidth(); //可用的ul的宽度
                     var $ul = $('#ul-' + id);
                     var liWidth = 0;
                     var $lis = $('#ul-' + id + ' >li');
                     $.each($lis, function (v, w) {
                        var liW = $(w).outerWidth();
                        liWidth += liW;
                     })
                     if (ulWidth > vm.availableWidth) {
                        var leftOffset = liWidth - vm.availableWidth;
                        //开启左右切换
                        var ulStyle = {
                           overflow: 'hidden',
                           position: 'absolute',
                           left: -leftOffset + 'px'
                        };
                        var divStyle = {
                           width: vm.availableWidth + 'px',
                           overflow: 'hidden',
                           position: 'relative'
                        };
                        $('button[ns-labelpageId="' + id + '"]').removeClass('hide');
                        //$('button[ns-labelpageId="' + id + '"]')
                        $ul.css(ulStyle);
                        $ul.parent().css(divStyle);
                        $('#' + id).addClass('labelpage-scroll-x');
                        vm.labelpageNum = Math.ceil($lis.length / Math.ceil(vm.availableWidth / 120)); //li的总长度/宽度= 共几页
                        vm.totalPageNum = Math.ceil($lis.length / Math.ceil($lis.length / Math.ceil(vm.availableWidth / 120))); //每页显示条数
                        
                     } else if (ulWidth == vm.availableWidth) {

                     } else {
                        $('button[ns-labelpageId="' + id + '"]').addClass('hide');
                        $ul.removeAttr('style');
                        $ul.parent().removeAttr('style');
                     }
                  } else {
                     vm.labelPagesArr.pop();
                     $('#' + vm.hiddenContainerId).removeClass('hidden');
                     $('#' + vm.currentContainerId).remove();
                     NetStarUtils.defaultAjaxError(data);
                     console.error('请求错误，错误代码：' + data.status);
                  }
               },
            }
            pageProperty.getAndCachePage(pageConfig);
         },
         // 加载页面
         loadPage: function (url, title, isAlwaysNewTab, pageOperateData, isCachePage,labelpageVmDataByGrid) {
            //console.log('loagepage')
            /*****************************sjj 20190916 start */
            //url的来源决定了如何判断是否是多开tab页面
            /**
             * 菜单地址url来源是控制器地址拼接 则多开是根据地址不会重复判断
             * 菜单地址url来源是根据具体的界面地址 如/topage/123333333类似这样的地址 这样的地址打开会记录到缓存，所以如果此类情况多开需要添加额外参数来判断是否多开
             * 如果配置了多开为isAlwaysNewTab：true,则不需要截断url自己拼接的参数来判断此界面地址是否打开过，否则由于每次打开url相同，拼接传送的时间戳不固定会判断不出来是否多开
             * 如果没有配置多开isAlwaysNewTab：false，则需要截断url自己拼接的参数，根据打开的原始url链接判断此url链接是否已经打开过
             */
            /*****************************sjj 20190916 end */
            // pageOperateData : 当前页面的操作数据 用于newtab按钮 ；lyw 20190620
            // isCachePage : 是否缓存页面 默认true
            typeof isCachePage != 'boolean' ? isCachePage = true : "";
            typeof isAlwaysNewTab != 'boolean' ? isAlwaysNewTab = true : "";
            labelpageVmDataByGrid = typeof(labelpageVmDataByGrid)=='object' ? labelpageVmDataByGrid : {};//sjj 20200111
            var vm = this;
            if ($.trim(url).length == 0 || $.trim(url) == '#') return;

            /** 
             * cy 20190717 针对性添加前缀
             * 如果url没有http:// 或者 https://，则添加前缀(NetstarHomePage.config.mainMenus.defaultServerUrl) 
             * 典型如："/netStarRights/saleEnterprise"  => "https://wangxingcloud.com/netStarRights/saleEnterprise"
             */
            if (typeof (url) == "string") {
               if (url.indexOf('http://') == 0 || url.indexOf('https://') == 0) {
                  var serverUrl = '';
                  url = serverUrl + url;
               } else {
                  var serverUrl = NetstarHomePage.config.mainMenus.defaultServerUrl;
                  url = serverUrl + url;
               }
            }

            //如果超过10个，则提示不可再添加
            if (vm.labelPageLength > 10) {
               return nsalert('超过页面数上限', 'warning');
            }

            //如果传参为obj，则调用另一方法
            if (typeof url == 'object') {
               vm.loadType = 'object';
               vm.containerObj = this.getPageByObj(url);
               url = vm.containerObj.id + ';';
               for (var key in vm.containerObj.attrs) {
                  if (vm.containerObj.attrs.hasOwnProperty(key)) {
                     var element = vm.containerObj.attrs[key];
                     url += key + '=' + element + ';';
                  }
               }
               title = vm.containerObj.title;
            } else {
               vm.loadType = 'ajaxUrl';
            }
            //是否打开新的tab页
            if (typeof isAlwaysNewTab == 'boolean' && !isAlwaysNewTab) {
               vm.isNewTab = false;
            } else {
               vm.isNewTab = true;
            }
            //根据url来构建contaienrId
            var separatorArr = ['?', ';'];
            vm.currentContainerId = url.replace(/(\/|\:|\.)/g, '-'); //zy 20190620 添加了对.：替换为'-'的逻辑
            vm.currentUrl = url; //sjj 20190711 存储当前的url地址
            $.each(separatorArr, function (index, item) {
               if (vm.currentContainerId.indexOf(item) != '-1') {
                  vm.currentContainerId = vm.currentContainerId.substring(0, vm.currentContainerId.indexOf(item));
               }
            });
            // 同一模板打开多次 识别"{"判断templateparam传值是否为对象，isMulitTab ：表示是否多开 多开时读取packageName表示包名添加时间戳
            var isOpenMulitTab = false; // lyw 原因：判断是否打开新tab通过判断的url地址（删除了？后边）所以阻止了同一个地址多开 根据此参数添加 20190911
            if (url.indexOf('templateparam') > 0) {
               var tempValueNameCode = url.substring(url.indexOf('templateparam') + 'templateparam='.length)
               if (tempValueNameCode.indexOf(';') > -1) {
                  tempValueNameCode = tempValueNameCode.substring(0, tempValueNameCode.indexOf(';'))
               }
               tempValueNameCode = decodeURIComponent(tempValueNameCode);
               if (tempValueNameCode.indexOf('{') == 0) {
                  tempValueNameCode = JSON.parse(tempValueNameCode);
                  if (tempValueNameCode.isMulitTab) {
                     isOpenMulitTab = true;
                     vm.currentContainerId += '-' + tempValueNameCode.packageName;
                     vm.currentContainerId = vm.currentContainerId.replace(/(\/|\:|\.)/g, '-'); //zy 20190620 添加了对.：替换为'-'的逻辑
                  }
               } else {
                  //sjj 20190916 因为当前url可能相同，所以为了保证容器id的唯一性，如果存在参数则把参数也拼接到容器id中
                  vm.currentContainerId += '-' + tempValueNameCode.replace(/(\/|\:|\.)/g, '-');
               }
            }
            var packageSuffix = '';
            if (url.indexOf('packageSuffix') > -1) {
               var urlArr = url.split(';');
               for (var i = 0; i < urlArr.length; i++) {
                  if (urlArr[i].indexOf('packageSuffix') > -1) {
                     var _urlProArr = urlArr[i].split('=');
                     packageSuffix = _urlProArr[1];
                     vm.currentContainerId += _urlProArr[1];
                     break;
                  }
               }
            }
            //如果已经打开过，且没有关闭过，则打开
            var urlIndex = this.urlIsOpen(url, vm.isNewTab);

            if (urlIndex != -1 && !isOpenMulitTab) {
               //url链接已经打开 并且不是多开
               var isRefresh = true;
               if(!$.isEmptyObject(labelpageVmDataByGrid)){
                  if(labelpageVmDataByGrid.labelpageVmById){
                     if(labelpageVmDataByGrid.labelpageVmById[labelpageVmDataByGrid.id]){
                        if(vm.labelPagesArr[labelpageVmDataByGrid.labelpageVmById[labelpageVmDataByGrid.id].currentTab]){
                           urlIndex = labelpageVmDataByGrid.labelpageVmById[labelpageVmDataByGrid.id].currentTab;
                        }
                        isRefresh = false;
                     }
                  }
               }
               vm.labelPagesArr[urlIndex].title = title;
               vm.labelPagesArr[urlIndex].currentUrl = url;
               vm.recordCurrent(urlIndex,isRefresh);
            } else {
               //先隐藏当前页面，并添加新的容器
               var $containerParent = $(vm.containerParent);
               var $currentContainer = $containerParent.find('container:not(.hidden)');
               $currentContainer.addClass('hidden');
               if (typeof $currentContainer.attr('id') == 'undefined') {
                  //如果没有id则添加时间戳
                  var homePageId = 'projectHomePage' + '-' + new Date().valueOf();
                  $currentContainer.attr('id', homePageId);
                  vm.hiddenContainerId = homePageId;
               } else {
                  vm.hiddenContainerId = $currentContainer.attr('id');
               }
               //如果当前有这个容器，说明已经有这个页面了，那么就要进行if里面的操作
               var findUrl = vm.currentContainerId.replace(/-/g, '/');
               var index = vm.arrayIsInclude(findUrl);

               if (index != -1) {
                  //如果是用object加的页面。则直接显示那个页面
                  if (vm.loadType == 'object') {
                     vm.recordCurrent(index);
                     return false;
                  }
                  vm.isNewTab = false;
                  //否则进行以下操作
                  // if (vm.isNewTab) {
                  //    vm.isEditConfig = true;
                  //    vm.currentContainerId = vm.currentContainerId + '-' + new Date().valueOf();
                  //    $containerParent.append('<container id="' + vm.currentContainerId + '"></container>');
                  //    vm.labelPagesArr.push({
                  //       title: title,
                  //       url: url,
                  //    });
                  // } else {
                     //sjj 20190806 添加方法 vm.labelPagesArr[index].dom不存在时候的逻辑补充
                     if (typeof (vm.labelPagesArr[index].dom) == 'undefined') {
                        vm.labelPagesArr[index].dom = $('#' + vm.currentContainerId);
                        $('#' + vm.currentContainerId).empty();
                        $('#' + vm.currentContainerId).removeClass('hidden');
                        vm.currentTab = index;
                        functionHandler.recordHandler(index);
                        vm.setCurrent(index);
                     } else {
                        $(vm.labelPagesArr[index].dom).empty();
                        vm.recordCurrent(index);
                        vm.currentContainerId = $(vm.labelPagesArr[index].dom).attr('id');
                     }
                  // }
               } else {
                  $containerParent.append('<container id="' + vm.currentContainerId + '"></container>');
                  //将title 和 url 事先添加进去(造成加载很快的假象)
                  var isEditPackageName = false;
                  var existUrlIndex = this.urlIsOpen(url, false);
                  if (existUrlIndex > -1) {
                     isEditPackageName = true;
                     vm.isEditConfig = true;
                  }
                  vm.labelPagesArr.push({
                     title: title,
                     url: url,
                     dom: $('#' + vm.currentContainerId),
                     isEditConfig: isEditPackageName,
                     packageSuffix: packageSuffix,
                  });
               }
               setTimeout(function () {
                  vm.getJsp(url, pageOperateData, isCachePage);
               }, 0)
            }
         },
         //通过url请求页面内容
         getJsp: function (url, pageOperateData, isCachePage) {
            // pageOperateData : 当前页面的操作数据 用于newtab按钮 ；lyw 20190620
            var vm = this;
            var _url = "";
            //zy 20190620 如果url本身已经有http开头，则不再追加 getRootPath start------
            if (url.indexOf("http") == 0) {
               _url = url;
            } else {
               _url = getRootPath() + url;
            }
            //zy 20190620 end------

            var pageConfig = {
               pageIidenti: url,
               url: _url,
               pageOperateData: pageOperateData,
               isCachePage: isCachePage,
               callBackFunc: function (isSuccess, data, _pageConfig) {
                  if (isSuccess) {
                     var res = data;
                     var pageOperateDataStr = typeof (_pageConfig.pageOperateData) == "object" ? JSON.stringify(_pageConfig.pageOperateData) : '{}';
                     var $currentContainer = $(vm.containerParent).find('container#' + vm.currentContainerId);

                     var resPageParam = vm.getContainerAndConfigName(res);
                     var templateInit = resPageParam.templateInit;
                     var containerHtml = resPageParam.containerHtml;
                     var configName = resPageParam.configName;

                     if (templateInit) {
                        templateInit[0] = templateInit[0].replace(configName, configName + ', ' + pageOperateDataStr);
                     }

                     //渲染到页面上
                     if (vm.isEditConfig && templateInit) {
                        vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = true;
                        // 是否存在包名后缀配置 如果存在设置包名
                        var newPackageSuffix = new Date().valueOf();
                        if (vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix && vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix.length > 0) {
                           newPackageSuffix += vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix;
                        }
                        var addHtml = configName + ".package = " + configName + ".package + '.' +\"" + newPackageSuffix + "\";\n" + templateInit[0];
                        containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
                     } else {
                        vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = false;
                        // 是否存在包名后缀配置 如果存在设置包名
                        if (vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix && vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix.length > 0) {
                           var _addHtml = configName + ".package = " + configName + ".package + '.' +\"" + vm.labelPagesArr[vm.labelPageLength - 1].packageSuffix + "\";" + templateInit[0];
                           containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, _addHtml);
                        }
                     }
                     //如果有配置的话，则添加以下内容
                     if ($.trim(configName).length != 0) {
                        var addHtml = templateInit[0] + ';' + 'NetstarUI.labelpageVm.setContaienrConfig("' + url + '",' + configName + ')';
                        containerHtml = containerHtml.replace(/NetstarTemplate\.init\((.*?)\)/, addHtml);
                     } else {
                        vm.loadType == 'object' ?
                           vm.labelPagesArr[vm.labelPageLength - 1].config = $.extend(true, {}, vm.containerObj) :
                           vm.labelPagesArr[vm.labelPageLength - 1].config = '';
                     }
                     // vm.labelPagesArr[vm.labelPageLength - 1].ajaxRes = res;
                     vm.labelPagesArr[vm.labelPageLength - 1].pageIidenti = _pageConfig.pageIidenti;

                     //sjj 20190710 对需要弹出的页面额外处理 NetstarOriginalMenuList是需要弹出的页面
                     if (typeof (NetstarOriginalMenuList) == 'object') {
                        if (NetstarOriginalMenuList[url]) {
                           var timerStr = 'container-simple-table-' + new Date().valueOf();
                           var formId = 'form-scientificInput-' + new Date().valueOf();
                           containerHtml = containerHtml.replace('container-simple-table', timerStr);
                           containerHtml = containerHtml.replace('#container-simple-table', '#' + timerStr);
                           var regRules = new RegExp("form-scientificInput", "g");
                           containerHtml = containerHtml.replace(regRules, formId);
                           //containerHtml = containerHtml.replace('form-scientificInput',formId);
                        }
                     }



                     $currentContainer.append(containerHtml);
                     vm.isNewTab ? vm.labelPagesArr[vm.labelPageLength - 1].dom = $currentContainer.get(0) : '';
                     //设置currentTab
                     vm.currentTab = vm.labelPageLength - 1;
                     functionHandler.refreshHandler(vm.labelPagesArr[vm.labelPageLength - 1]);


                     //sjj 20200107 如果当前屏幕盛不下10个标签页，需要出左右箭头来支持切换显示
                     var ulWidth = $('#' + id + ' ul').outerWidth(); //可用的ul的宽度
                     var $ul = $('#ul-' + id);
                     var liWidth = 0;
                     var $lis = $('#ul-' + id + ' >li');
                     $.each($lis, function (v, w) {
                        var liW = $(w).outerWidth();
                        liWidth += liW;
                     })
                     if (ulWidth > vm.availableWidth) {
                        var leftOffset = liWidth - vm.availableWidth;
                        //开启左右切换
                        var ulStyle = {
                           overflow: 'hidden',
                           position: 'absolute',
                           left: -leftOffset + 'px'
                        };
                        var divStyle = {
                           width: vm.availableWidth + 'px',
                           overflow: 'hidden',
                           position: 'relative'
                        };
                        $('button[ns-labelpageId="' + id + '"]').removeClass('hide');
                        //$('button[ns-labelpageId="' + id + '"]')
                        $ul.css(ulStyle);
                        $ul.parent().css(divStyle);
                        $('#' + id).addClass('labelpage-scroll-x');
                        vm.labelpageNum = Math.ceil($lis.length / Math.ceil(vm.availableWidth / 120)); //li的总长度/宽度= 共几页
                        vm.totalPageNum = Math.ceil($lis.length / Math.ceil($lis.length / Math.ceil(vm.availableWidth / 120))); //每页显示条数
                        
                     } else if (ulWidth == vm.availableWidth) {

                     } else {
                        $('button[ns-labelpageId="' + id + '"]').addClass('hide');
                        $ul.removeAttr('style');
                        $ul.parent().removeAttr('style');
                     }
                  } else {
                     vm.labelPagesArr.pop();
                     $('#' + vm.hiddenContainerId).removeClass('hidden');
                     $('#' + vm.currentContainerId).remove();
                     NetStarUtils.defaultAjaxError(data);
                     console.error('请求错误，错误代码：' + data.status);
                  }
               },
            }
            var ajaxConfig = {
               url: getRootPath() + url,
               type: "GET",
               data: {},
               success: function (res) {
                  if (typeof res.msg != 'undefined') {
                     nsalert(res.msg);
                     return false;
                  }
                  if (typeof (res) == "object") {
                     res = pageProperty.getPageHtml(res.data);
                  }
                  var $currentContainer = $(vm.containerParent).find('container#' + vm.currentContainerId);
                  var templateInit = vm.getContainerAndConfigName(res).templateInit;
                  var containerHtml = vm.getContainerAndConfigName(res).containerHtml;
                  var configName = vm.getContainerAndConfigName(res).configName;
                  //渲染到页面上
                  if (vm.isEditConfig && templateInit) {
                     vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = true;
                     var addHtml = configName + ".package = " + configName + ".package + '.' +" + new Date().valueOf() + ";" + templateInit[0];
                     containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
                  } else {
                     vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = false;
                  }
                  //如果有配置的话，则添加以下内容
                  if ($.trim(configName).length != 0) {
                     var addHtml = templateInit[0] + ';' + 'NetstarUI.labelpageVm.setContaienrConfig("' + url + '",' + configName + ')';
                     containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
                  } else {
                     vm.loadType == 'object' ?
                        vm.labelPagesArr[vm.labelPageLength - 1].config = $.extend(true, {}, vm.containerObj) :
                        vm.labelPagesArr[vm.labelPageLength - 1].config = '';
                  }
                  vm.labelPagesArr[vm.labelPageLength - 1].ajaxRes = res;
                  $currentContainer.append(containerHtml);
                  vm.isNewTab ? vm.labelPagesArr[vm.labelPageLength - 1].dom = $currentContainer.get(0) : '';
                  //设置currentTab
                  vm.currentTab = vm.labelPageLength - 1;
                  //lxh 缓存机制 19/02/20
                  // NetstarCatchHandler.setCatch(vm.currentContainerId, res);
               },
               fail: function (err) {
                  console.log(err);
               },
               error: function (XMLHttpRequest, textStatus, errorThrown) {
                  vm.labelPagesArr.pop();
                  $('#' + vm.hiddenContainerId).removeClass('hidden');
                  $('#' + vm.currentContainerId).remove();
                  NetStarUtils.defaultAjaxError(XMLHttpRequest);
               },
            };
            // $.ajax(ajaxConfig);
            //lxh 缓存机制 19/02/20
            /* if (!!NetstarCatchHandler.getCatch(vm.currentContainerId)) {
                ajaxConfig.success(NetstarCatchHandler.getCatch(vm.currentContainerId));
            } else {
            } */
            if (vm.loadType == 'object') {
               vm.$nextTick(function () {
                  ajaxConfig.success('<container>' + (vm.containerObj.html ? vm.containerObj.html : "") + '</container>');
                  vm.setContaienrConfig(url, {
                     pageParam: vm.containerObj.attrs
                  });
                  typeof vm.containerObj.shownHandler == 'function' && vm.containerObj.shownHandler({
                     jqDom: $('#' + id).find('li').eq(vm.labelPageLength - 1)
                  });
                  delete vm.containerObj;
               });
            } else if (vm.loadType == 'ajaxUrl') {
               // $.ajax(ajaxConfig);
               pageProperty.getAndCachePage(pageConfig);
            }
         },
         getContainerHtml: function (htmlString) {
            //优先根据 container 标签匹配 其次根据 body标签进行匹配
            var containerHtml = '';
            var matchTag = 'container';
            var lastIndex = htmlString.lastIndexOf('</' + matchTag + '>');
            var firstIndex = htmlString.indexOf('<' + matchTag + '>');
            if (firstIndex != -1 && lastIndex != -1) {
               containerHtml = htmlString.substring(firstIndex + ('<' + matchTag + '>').length, lastIndex);
            } else {
               matchTag = 'body';
               if (firstIndex != -1 && lastIndex != -1) {
                  containerHtml = htmlString.substring(firstIndex + ('<' + matchTag + '>').length, lastIndex);
               } else {
                  //如果不包含 container 和 body 标签则全部返回
                  console.warn('加载页面时，没有找到 container 和 body 标签');
                  containerHtml = htmlString;
               }
            }
            return containerHtml;
         },
         //获取container的内容和配置
         getContainerAndConfigName: function (htmlString) {

            //获取ajax返回HTML或者代码段中的有效代码
            var containerHtml = this.getContainerHtml(htmlString);

            //获得当前页面配置
            var templateInit = containerHtml.match(/NetstarTemplate\.init[\s]*\((\S+)\)/);
            var configName = templateInit != null ? templateInit[1] : "";

            return {
               containerHtml: containerHtml,
               configName: configName,
               templateInit: templateInit
            };
         },
         //根据obj属性添加页面
         getPageByObj: function (options) {
            var defaultOptions = {
               id: new Date().valueOf(),
               title: '无标题',
               attrs: {},
               shownHandler: function (elid) {}
            };
            nsVals.setDefaultValues(options, defaultOptions);
            if ($.trim(options.id).length == 0) {
               options.id = new Date().valueOf();
            } else {
               switch (options.type) {
                  case 'workflowTab':
                     options.id = options.id;
                     break;
                  default:
                     options.id = options.id + "/" + new Date().valueOf();
                     break;
               }
               // options.id = options.id + "/" + new Date().valueOf();
            }
            if ($.trim(options.title).length == 0) {
               options.title = '无标题';
            }
            return $.extend(true, {}, options);
         },
         //记录更改 currentTab
         recordCurrent: function (index,isRefresh) {
            var vm = this;
            isRefresh = typeof(isRefresh)=='boolean' ? isRefresh : false;
            this.currentTab = index;
            var $currentContainer = $(this.containerParent).find('container:not(.hidden)');
            $currentContainer.addClass('hidden');
            $(this.labelPagesArr[index].dom).removeClass('hidden');
            //调用rabbitMq刷新tab页信息
            //$('#' + id).find('li').eq(index)
            functionHandler.recordHandler(index);
            this.setCurrent(index);

            //sjj 20190916 刷新当前界面 
            /**
             * 只有是列表的模板才需要执行根据参数格式化的值进行刷新操作
             */
            /*************判断当前的页面是否需要进行刷新操作 start****************************************** */
            if(isRefresh){
               var currentUrl = this.labelPagesArr[index].currentUrl;
               if (currentUrl) {
                  //如果存在当前url的地址  读取点击按钮的格式化参数作为入参传送到当前界面
                  var currentTempletConfig = this.labelPagesArr[index].config;
                  var templateParam = currentUrl.substring(currentUrl.indexOf('=') + 1, currentUrl.length);
                  if (NetstarTempValues) {
                     if (NetstarTempValues[templateParam]) {
                        var templateConfig = NetstarTemplate.templates.configs[currentTempletConfig.package];
                        if(typeof(templateConfig)=='undefined'){
                           for(var packageI in NetstarTemplate.templates.configs){
                              if(NetstarTemplate.templates.configs[packageI].package.indexOf(currentTempletConfig.package)>-1){
                                 var cPackageNameArr = currentTempletConfig.package.split('.');
                                 var nPackageArr = NetstarTemplate.templates.configs[packageI].package.split('.');
                                 var newPackageArr = [];
                                 for(var c=0; c<cPackageNameArr.length; c++){
                                    newPackageArr.push(nPackageArr[c]);
                                 }
                                 var nPackageNameStr = newPackageArr.join('.');
                                 if(currentTempletConfig.package == nPackageNameStr){
                                    templateConfig = NetstarTemplate.templates.configs[packageI];
                                    break;
                                 } 
                              }
                           }
                        }
                        if(!$.isEmptyObject(templateConfig)){
                           templateConfig.pageParam = NetstarTempValues[templateParam];
                           NetstarTemplate.refreshByPackage({
                              package: templateConfig.package,
                              templateId: templateConfig.id
                           });
                        }
                     }
                  }
               }
            }
            /****************判断当前的页面是否需要进行刷新操作 start*************************************** */
            /**************sjj 20200109 判断是否需要出标签滚动条 start************************************ */
            var id = this.$el.id;
            var uId = 'ul-' + id;
            var ulWidth = $('#' + uId).outerWidth(); //可用的ul的宽度
            var totalLiWidth = 0;
            var $ul = $('#' + uId);
            var $lis = $('#' + uId + ' >li');
            for (var l = 0; l < $lis.length - 1; l++) {
               totalLiWidth += $($lis[l]).outerWidth();
            }
            if (ulWidth > this.availableWidth) {
               var leftOffset = totalLiWidth - this.availableWidth;
               //开启左右切换
               var ulStyle = {
                  overflow: 'hidden',
                  position: 'absolute',
                  left: -leftOffset + 'px'
               };
               var divStyle = {
                  width: this.availableWidth + 'px',
                  overflow: 'hidden',
                  position: 'relative'
               };
               $('button[ns-labelpageId="' + id + '"]').removeClass('hide');
               $ul.css(ulStyle);
               $ul.parent().css(divStyle);
               $('#' + id).addClass('labelpage-scroll-x');
               vm.labelpageNum = Math.ceil($lis.length / Math.ceil(this.availableWidth / 120)); //li的总长度/宽度= 共几页
               vm.totalPageNum = Math.ceil($lis.length / Math.ceil($lis.length / Math.ceil(this.availableWidth / 120))); //每页显示条数
            } else if (ulWidth == this.availableWidth) {

            } else {
               $('button[ns-labelpageId="' + id + '"]').addClass('hide');
               $ul.removeAttr('style');
               $ul.parent().removeAttr('style');
            }
            /**************sjj 20200109 判断是否需要出标签滚动条 end************************************ */
         },
         //移除当前页面
         removeCurrent: function (index) {
            this.navFunctionShow = false;
            var _this = this;
            typeof index != 'undefined' ? '' : index = _this.currentTab;
            //执行关闭函数
            var pageConfig = this.labelPagesArr[index].config;

            if (typeof (pageConfig) == 'undefined') {
               pageConfig = {};
            }

            if (NetstarTemplate.templates.configs[pageConfig.package]) {
               pageConfig = NetstarTemplate.templates.configs[pageConfig.package];
            }

            var containerId = _this.$el.id;
            var uId = 'ul-' + containerId;
            //var cLiW = $('#'+uId+' li.current').outerWidth();

            if (typeof pageConfig.beforeCloseHandler == 'function') {
               var getValue = pageConfig.beforeCloseHandler(pageConfig.package);
               if (!nsVals.isEqualObject(getValue.getPageData, getValue.serverData)) {
                  nsconfirm('当前页面修改后末保存,是否关闭?', function (state) {
                     if (state) {
                        _this.closeByIndex(index);
                     }
                  }, 'warning');
               } else {
                  _this.closeByIndex(index);
               }
            } else if (typeof (pageConfig.clearShortcutKeyByCloseHandler) == 'function') {
               //sjj 20190801 关闭当前模版页的时候清空当前模版页的所有快捷键的配置
               pageConfig.clearShortcutKeyByCloseHandler(pageConfig.package, index, this.labelPagesArr);
               _this.closeByIndex(index);
            } else {
               _this.closeByIndex(index);
            }
            //sjj 20200108 如果存在左右滚动的情况需要在删除的时候添加当前位置的判断
            var ulWidth = $('#' + uId).outerWidth(); //可用的ul的宽度
            var totalLiWidth = 0;
            var $lis = $('#' + uId + ' >li');
            for (var l = 0; l < $lis.length - 1; l++) {
               totalLiWidth += $($lis[l]).outerWidth();
            }
            if (totalLiWidth <= _this.availableWidth) {
               //不需要再计算
               $('#' + uId).css({
                  overflow: "hidden",
                  position: "absolute",
                  left: '0px'
               });
               $('button[ns-labelpageId="' + containerId + '"]').addClass('hide');
               //availableWidth = $('#'+containerId) - 40 - 60;//标签页的宽度-首页标签固定的宽度-下拉选项的宽度
               _this.labelpageNum = 0; //li的总长度/宽度= 共几页
               _this.totalPageNum = 0; //每页显示条数
            } else {
               /*if(ulWidth > _this.availableWidth){
                  var uOffsetLeft = $('#'+uId).css('left');
                  uOffsetLeft = Number(uOffsetLeft.substring(0,uOffsetLeft.indexOf('p')));
                  var leftN = uOffsetLeft + 86;
                  //$("#"+uId).stop().animate({left:leftN},300);
                }else if(ulWidth < _this.availableWidth){
                  
                }*/
            }
         },
         //设置current属性
         setCurrent: function (index) {
            //移除isCurrent
            for (var i = 0; i < this.labelPagesArr.length; i++) {
               var item = this.labelPagesArr[i];
               item.isCurrent = false;
            }

            this.labelPagesArr[index].isCurrent = true;

            $('#' + id).find('.pt-nav li').removeClass('current');
            $('#' + id).find('.pt-nav li').eq(index).addClass('current');

         },
         //根据index来关闭页面
         closeByIndex: function (index) {
            $('#ptNavToolTips').remove();
            //如果是object添加页面，则执行关闭页面
            this.loadType == 'object' ?
               this.labelPagesArr[index].config.closeHandler && this.labelPagesArr[index].config.closeHandler() :
               "";
            //取消定阅
            functionHandler.closeHandler(index);
            //移除数据
            this.deleteContainerArr(index);
            //进行计算  如果删除的是当前显示的页面，则将最后一个页面设为显示
            //否则只将currentTab的值减一
            if (this.currentTab == index) {
               var currentShowDomIndex = this.labelPageLength - 1;
               this.currentTab = currentShowDomIndex;
               $(this.labelPagesArr[currentShowDomIndex].dom).removeClass('hidden');
            } else if (this.currentTab > index) {
               this.currentTab--;
            }
         },
         //刷新
         refreshPage: function (index) {
            var vm = this;
            var currentPage = this.labelPagesArr[index];
            var currentContainer = $(currentPage.dom);
            currentContainer.empty();
            var pageIidenti = currentPage.pageIidenti;
            var cachePageData = pageProperty.cachePageData;
            if(typeof(cachePageData[pageIidenti]) != "object"){
               // 没有缓存请检查
               return false;
            }
            var pageData = cachePageData[pageIidenti].pageData;
            var cacheType = '';
            if(currentPage.url.indexOf('getById') > -1){
               cacheType = 'getById';
            }else{
               cacheType = 'pageConfig';
            }
            var pageHtml = pageProperty.getPageHtmlByPageConfig(pageData, cacheType);
            var CCName = vm.getContainerAndConfigName(pageHtml);
            var templateInit = CCName.templateInit;
            var containerHtml = CCName.containerHtml;
            var configName = CCName.configName;
            // var templateInit = vm.getContainerAndConfigName(currentPage.ajaxRes).templateInit;
            // var containerHtml = vm.getContainerAndConfigName(currentPage.ajaxRes).containerHtml;
            // var configName = vm.getContainerAndConfigName(currentPage.ajaxRes).configName;
            //渲染到页面上
            if (currentPage.isEditConfig) {
               var addHtml = configName + ".package = " + configName + ".package + '.' +" + new Date().valueOf() + ";" + templateInit[0];
               containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
            }
            currentContainer.append(containerHtml);
            functionHandler.refreshHandler(currentPage);
         },
         //根据位置弹出下拉
         mouseEnterCurrent: function (e) {
            var $currentNav = $(e.target);
            $('#placeholder-popupbox').append('<div id="ptNavToolTips" class="pt-nav-tooltips"><span>' + $currentNav.text() + '</span></div>');
            $('#ptNavToolTips').css('position', 'absolute')
               .css('top', $currentNav.offset().top + 40)
               .css('left', $currentNav.offset().left)
               .css('width', $currentNav.width() + 'px')
               .css('z-index', 9999);
            $currentNav.on('mouseleave', function () {
               $('#ptNavToolTips').remove();
            });
         },
         //移除全部标签
         removeAll: function () {
            this.navFunctionShow = false;
            $('#ptNavToolTips').remove();
            var len = this.labelPageLength;
            //移除所有
            for (var i = len - 1; i >= 1; i--) {
               this.deleteContainerArr(i);
            }
            this.currentTab = 0;
            $(this.labelPagesArr[0].dom).removeClass('hidden');
            /***************sjj 20190109 start*******************/
            var id = this.$el.id;
            $('button[ns-labelpageid="'+id+'"]').addClass('hide');
            /***************sjj 20190109 end*******************/
         },
         //移除其他页面
         removeOther: function () {
            this.navFunctionShow = false;
            $('#ptNavToolTips').remove();
            var len = this.labelPageLength;
            //移除所有
            for (var i = len - 1; i >= 1; i--) {
               if (i == this.currentTab) continue;
               this.deleteContainerArr(i);
            }
            this.currentTab = 1;
            $(this.labelPagesArr[1].dom).removeClass('hidden');

             /***************sjj 20190109 start*******************/
             var id = this.$el.id;
             $('button[ns-labelpageid="'+id+'"]').addClass('hide');
             $('#ul-'+id).css({left:'0px',overflow:"hidden",position:"absolute"});
             /***************sjj 20190109 end*******************/
         },
         //移除数组元素
         deleteContainerArr: function (index) {
            if (typeof index != 'undefined') {
               //移除当前容器
               $(this.labelPagesArr[index].dom).remove();
               this.labelPagesArr.splice(index, 1);
            } else {
               this.labelPagesArr.splice(this.labelPageLength - 1, 1);
            }
         },
         //向页面数组中添加attrs
         setContainerArrAttrs: function (index, valueObj) {
            if (typeof this.labelPagesArr[index].attrs == 'undefined') {
               this.labelPagesArr[index].attrs = valueObj;
            } else {
               for (var key in valueObj) {
                  if (valueObj.hasOwnProperty(key)) {
                     var ele = valueObj[key];
                     this.labelPagesArr[index].attrs[key] = ele;
                  }
               }
            }
         },
         //添加点击dom关闭nav功能下拉
         toggleNavFunction: function () {
            var vm = this;
            this.navFunctionShow = !this.navFunctionShow;
            //添加一些document点击事件
            $(document).on('click', function (e) {
               if ($(e.target).parents('.pt-tabbar-control').length == 0 && $(e.target).attr('class') != 'pt-dropdown-menu' && vm.navFunctionShow) {
                  vm.navFunctionShow = false;
                  $(document).off('click');
               }
            });
         },
         //是否在数组中
         arrayIsInclude: function (verItem, array) {
            var index = -1;
            // var verItem = verItem.substr(0, verItem.lastIndexOf('/')).replace(/\//g, '-');
            for (var i = 0; i < this.labelPagesArr.length; i++) {
               var dom = this.labelPagesArr[i].dom;
               var $dom = $(dom);
               if(dom && $dom.length > 0){
                  // lyw 修改 比较容器时不可以通过url因为其中不仅有/转化-，还存在:转化-，因此无法比较
                  var domId = $dom.attr('id');
                  var _domId = domId.replace(/-/g, '/');
                  if (_domId.indexOf(verItem) != -1) {
                     index = i;
                     break;
                  }
               }else{
                  var item = this.labelPagesArr[i].url;
                  if (item.indexOf(verItem) != -1) {
                     index = i;
                  }
               }
            }
            return index;
         },
         //是还有这个url，返回下标
         urlIsOpen: function (url, isAlwaysNewTab) {
            if (typeof (isAlwaysNewTab) == 'undefined') {
               isAlwaysNewTab = false;
            }
            var subIndex = -1;
            var newUrl = url;
            if (url.indexOf('?') > -1 && !isAlwaysNewTab) {
               newUrl = url.substring(0, url.indexOf('?'));
            }
            for (var index = 0; index < this.labelPagesArr.length; index++) {
               var item = this.labelPagesArr[index];
               var compareUrl = item.url;
               if (item.url.indexOf('?') > -1 && !isAlwaysNewTab) {
                  compareUrl = item.url.substring(0, item.url.indexOf('?'));
               }
               if (newUrl == compareUrl) {
                  subIndex = index;
                  break;
               }
            }
            return subIndex;
         },
         setContaienrConfig: function (url, currentConfig) {
            //activityId  processId workItemId data_auth_code
            var showField = 'activityId,activityName,processId,workItemId,data_auth_code'.split(',');
            var $currentLi = $('#' + id).find('li').eq(this.labelPageLength - 1);
            if (typeof currentConfig != 'undefined') {
               if (typeof currentConfig.template != 'undefined') $currentLi.attr('ns-template', currentConfig.template);
               if (typeof currentConfig.pageParam != 'undefined') {
                  //设置属性
                  NetStarUtils.setDomAttrsCaseSensitive($currentLi, currentConfig.pageParam, this.loadType == 'ajaxUrl' ? showField : undefined);
               }
               this.setContainerArrAttrs(this.labelPageLength - 1, currentConfig.pageParam);
               this.loadType == 'ajaxUrl' ? this.labelPagesArr[this.labelPageLength - 1].config = $.extend(true, {}, currentConfig) : '';
            } else {
               this.labelPagesArr[this.labelPageLength - 1].config = '';
            }
         },
         //根据li设置属性
         setDomAttr: function (domObj, valueObj) {
            this.setContainerArrAttrs(this.labelPageLength - 1, valueObj);
            NetStarUtils.setDomAttrsCaseSensitive(domObj.jqDom, valueObj);
         }
      },
      computed: {
         labelPageLength: function () {
            return this.labelPagesArr.length;
         }
      },
      watch: {
         labelPagesArr: function () {
            this.$nextTick(function () {
               var theLastIndex = this.labelPageLength - 1;
               var $currentLi = $('#' + id).find('.pt-nav li').eq(theLastIndex);
               $('#' + id).find('.pt-nav li').removeClass('current');
               $currentLi.addClass('current');
               //移除isCurrent
               for (var index = 0; index < this.labelPagesArr.length; index++) {
                  var item = this.labelPagesArr[index];
                  item.isCurrent = false;
               }
               //设置attrs
               typeof this.labelPagesArr[theLastIndex].attrs == 'undefined' ?
                  this.labelPagesArr[theLastIndex].attrs = {} :
                  '';
               //设置isCurrent
               this.labelPagesArr[theLastIndex].isCurrent = true;
               this.labelPagesArr[theLastIndex].currentLi = $currentLi.get(0);
               //添加两个方法
               this.labelPagesArr[theLastIndex].setPlusClass = (function ($currentLi) {
                  return function (classStr) {
                     var currentLiClass = $currentLi.prop('class');
                     var mySelfClassNames = 'pt-nav-item';

                     $currentLi.attr('class', '');
                     $currentLi.addClass(mySelfClassNames);
                     $currentLi.addClass(classStr);
                  };
               })($currentLi);
               this.labelPagesArr[theLastIndex].getPlusClass = (function ($currentLi) {
                  return function () {
                     // var mySelfClassNames = ['pt-nav-item', 'current'];
                     var mySelfClassNames = ['pt-nav-item'];
                     var currentLiClass = $currentLi.prop('class');

                     for (var index = 0; index < mySelfClassNames.length; index++) {
                        var item = mySelfClassNames[index];
                        currentLiClass = currentLiClass.replace(item, "");
                     }
                     return currentLiClass;
                  };
               })($currentLi);
            });
         }
      },
      mounted:function(){
        
      },
   });
   return rowNavVue;
};
$(document).ready(function () {
   NetstarUI.labelpageVm = NetstarUI.labelPages('labelPages', 'body');
});