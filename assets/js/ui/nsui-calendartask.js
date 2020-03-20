nsUI.calendarTask = (function ($) {
   "use strict";
   var allConfig = {};

   //配置管理
   var configManage = {
      originalConfig: {},
      config: {},
      //设置默认值
      setDefault: function (outerConfig) {
         this.originalConfig = $.extend(true, {}, outerConfig);
         this.config = $.extend(true, {}, outerConfig);
         var beginMonth = outerConfig.beginMonth ? outerConfig.beginMonth : new Date().getMonth() + 1;
         var defaultConfig = {
            el: '#' + this.config.containerId,
            beginMonth: beginMonth,
            currentDate: new Date().getFullYear() + ',' + beginMonth,
            //设置字段默认值
            msgIdField: 'code',
            taskField: 'allot',
            taskIdField: 'id',
            dateBeginField: 'dateFrom',
            dateEndField: 'dateTo',
            textField: 'title',
            valueField: 'value',
            colorField: 'color'
         }
         nsVals.setDefaultValues(this.config, defaultConfig);
         $(this.config.el).addClass('pt-calendar');
         $(this.config.el).css('user-select', 'none');
      },
      //整理fields
      formatFields: function (config) {
         config.formatFields = {
            front: [],
            behind: []
         };
         config.frontFields = [];
         config.frontWidth = [];
         config.behindFields = [];
         config.behindWidth = [];
         config.fields.forEach(function (item, index) {
            config[item.position + 'Fields'].push(item[config.taskIdField]);
            config[item.position + 'Width'].push(item.width);
            config.formatFields[item.position].push(item);
         })
      },
      //获取组件配置config
      getConfig: function (outerConfig) {
         this.setDefault(outerConfig);
         this.formatFields(this.config);
         return this.config;
      }
   };

   //数据管理
   var dataManage = {
      //请求getValueAjax
      ajax: function (ajaxConfig, cb) {
         var ajax = nsVals.getAjaxConfig(ajaxConfig);
         nsVals.ajax(ajax, function (res) {
            if (res.success) {
               var resData = res[ajax.dataSrc];
               configManage.config.resData = resData;
               typeof cb == 'function' && cb(resData);
            } else {
               typeof cb == 'function' && cb(false);
               configManage.config.resData = false;
            }
         })
      },
      //根据月份获取当前的数据
      getCurrentMsg: function (currentDate) {
         //拿到日期
         var currentYear = currentDate.split(',')[0];
         var currentMonth = currentDate.split(',')[1];
         var config = configManage.config;
         //全当前日期数据
         if (config.resData) {
            var resData = $.extend(true, [], config.resData);
            for (var idx = 0; idx < resData.length; idx++) {
               var itm = resData[idx];
               //筛选年份月份都符合的数据
               for (var index = 0; index < itm[config.taskField].length; index++) {
                  var item = itm[config.taskField][index];
                  var itemYear = new Date(item[config.dateBeginField]).getFullYear();
                  var itemMonth = new Date(item[config.dateBeginField]).getMonth() + 1;
                  if (itemYear != currentYear || itemMonth != currentMonth) {
                     itm[config.taskField].splice(index, 1);
                     index--;
                  }
               }
               //如果数据为空，则删除
               /* if (itm[config.taskField].length == 0) {
                  resData.splice(idx, 1);
                  idx--;
               } */
            }
            console.log(resData);
            return resData;
         } else {
            console.error('没有数据');
            return false;
         }
      },
      //获取组件数据
      getPageData: function () {

      },
      //刷新
      refresh: function () {
         allConfig.vmConfig.getValue();
      }
   };

   //html管理
   var TEMPLATE = {
      CONTAINER: '<div class="pt-panel pt-grid-body"></div>',
      BUTTONGROUP: '<div class="pt-calendar-title">\
                     <div class="pt-btn-group">\
                        <button class="pt-btn pt-btn-default" @click="lastMonth">\
                           <span>上一月</span>\
                        </button>\
                        <button class="pt-btn pt-btn-default" @click="nextMonth">\
                           <span>下一月</span>\
                        </button>\
                     </div>\
                     <h4>当前{{currentYear}}年{{currentMonth}}月</h4>\
                  </div>',
      HEADER: '<div class="pt-grid-body-head">\
                  <div class="pt-container">\
                     <table class="pt-grid" :style="tableStyle"><tbody>\
                        <tr>\
                           <!-- 头字段 -->\
                           <td v-for="(item,index) in config.formatFields.front"\
                              :ns-fieldname="item.id"\
                              :ns-tdindex="index"\
                              :style="{width:item.width + \'px\',\
                                 \'max-width\':item.width + \'px\',\
                                 \'box-sizing\':\'border-box\',\
                                 overflow:\'hidden\'}"\
                           >\
                              {{item.name}}\
                           </td>\
                           <!-- 中字段 -->\
                           <td v-for="(item,index) in dateNum"\
                           :ns-tdindex="config.formatFields.front.length + index"\
                           :style="dateStyle">\
                              {{item}}\
                           </td>\
                           <!-- 尾字段 -->\
                           <!-- ,left:behindLeft[index] + \'px\' -->\
                           <td v-for="(item,index) in config.formatFields.behind"\
                              :ns-fieldname="item.id"\
                              :ns-tdindex="config.formatFields.front.length + dateNum + index"\
                              :style="{width:item.width + \'px\',\
                                 \'max-width\':item.width + \'px\',\
                                 \'box-sizing\':\'border-box\',\
                                 overflow:\'hidden\'}"\
                           >\
                              {{item.name}}\
                           </td>\
                        </tr>\
                     </tbody></table>\
                  </div></div>',
      BODY: '<div class="pt-panel pt-grid-body">\
               <div class="pt-container">\
                     <table class="pt-grid" :style="tableStyle"><tbody>\
                        <!-- 头字段 -->\
                        <tr v-for="(item,index) in currentMonthMsg">\
                           <td v-for="(itm,idx) in config.frontFields" :ns-fieldname="itm"\
                           :style="{width:config.frontWidth[idx] + \'px\'}">\
                              {{item[itm]}}\
                           </td>\
                           <!-- 中间 -->\
                           <td class="task-row" :style="{width:remainWidth + \'px\',\
                              overflow:\'hidden\',\
                              position:\'relative\'}"\
                           >\
                              <!-- 中间在小格子 -->\
                              <div v-for="idx in dateNum"\
                                 :class="{\'currentday\' : idx == new Date().getDate()}"\
                                 :style="{position:\'absolute\',\
                                    left:((idx - 1) * dateWidth) + \'px\',\
                                    top:\'0px\',\
                                    width:dateWidth + \'px\',\
                                    height:\'100%\',\
                                    \'border-right\':\'1px solid #bfbfbf\'}">\
                              </div>\
                              <!-- height:taskHeight + \'px\',\ -->\
                              <div class="task-row-item" v-for="(itm, idx) in item[config.taskField]"\
                                 :style="{position:\'absolute\',\
                                    left:getPositionLeft(itm) + \'px\',\
                                    top:getPositionTop(itm, item) + \'px\',\
                                    width:getWidthByDate(itm, item) + \'px\',\
                                    height:taskHeight + \'px\',\
                                    overflow:\'hidden\',\
                                    background:itm[config.colorField]}"\
                                    @click="taskClick(itm, item, $event)"\
                                    @mousedown="taskMouseDown(itm, idx, item, $event)"\
                                    @mouseover="taskMouseOver(itm, idx, item, $event)"\
                              >\
                                 {{itm[config.textField]}}\
                              </div>\
                              {{setTdHeight(item, index)}}\
                           </td>\
                           <!-- 尾字段 -->\
                           <!-- ,left:behindLeft[index] + \'px\' -->\
                           <td v-for="(itm,idx) in config.behindFields" :ns-fieldname="itm"\
                              :style="{width:config.behindWidth[idx] + \'px\'}">\
                                 {{item[itm]}}\
                           </td>\
                        </tr>\
                     </tbody></table>\
               </div>\
            </div>',
      FOOTER: ''
   }
   /* taskField: 'allot',
   taskIdField: 'id',
   dateBeginField: 'dateFrom',
   dateEndField: 'dateTo',
   textField: 'title',
   valueField: 'value',
   colorField: 'color' */
   //面板管理
   var panelManage = {
      //构建面板
      buildPanel: function (config) {
         $(config.el).append(TEMPLATE.CONTAINER);
         $(config.el).find('.pt-grid-body').eq(0).append(TEMPLATE.BUTTONGROUP);
         $(config.el).find('.pt-grid-body').eq(0).append(TEMPLATE.HEADER);
         $(config.el).find('.pt-grid-body').eq(0).append(TEMPLATE.BODY);
      },
      //渲染面板
      renderPanel: function (data) {

      }
   }

   //vue管理
   var vueManage = {
      //返回vue要用到的data
      getVueData: function (_config) {
         var containerWidth = $(_config.el).width();
         var remainWidthFloat = containerWidth;
         _config.fields.forEach(function (item, index) {
            remainWidthFloat = remainWidthFloat - item.width
         })
         //中间日期的个数和每一个的宽度
         var dateNum = methodsManage.getDateNum(new Date().getFullYear(), _config.beginMonth, 0);
         var dateWidth = parseInt(remainWidthFloat / dateNum);
         var remainWidthInt = dateWidth * dateNum;
         var overAllWidth = containerWidth - (remainWidthFloat - remainWidthInt);
         //vue的data
         var vueData = {
            config: $.extend(true, {}, _config),
            containerWidth: $(_config.el).width(),

            overAllWidth: overAllWidth,   //容器全部宽度
            remainWidthFloat: remainWidthFloat,
            remainWidth: remainWidthInt,//容器除去头和尾中间日期要用到的宽度

            dateWidth: dateWidth,//该月份的天数
            dateNum: dateNum,//每天的格子的宽度

            taskHeight: 30,   //任务的高度
            tableStyle: {  //表格的样式
               width: overAllWidth + 'px',
            },

            currentDate: _config.currentDate,
            currentYear: Number(_config.currentDate.split(',')[0]),
            currentMonth: Number(_config.currentDate.split(',')[1]),
            currentMonthMsg: [], //当前月份的任务信息
            shownHistory: {}, //当前展示过的信息
         }
         return vueData;
      },
      //返回vue初始化的vueConfig
      getVueConfig: function (_config) {
         var vueConfig = {
            id: _config.containerId,
            el: _config.el,
            data: this.getVueData(_config),
            methods: {
               //发送ajax
               getValue: function () {
                  var vm = this;
                  dataManage.ajax(this.config.getValueAjax, function (resData) {
                     vm.setCurrentData(vm.currentDate);
                  });
               },
               //上一月
               lastMonth: function () {
                  if (this.currentMonth == 1) {
                     this.currentYear = this.currentYear - 1;
                     this.currentMonth = 12;
                  } else {
                     this.currentMonth = this.currentMonth - 1;
                  }
                  this.setCurrentData(this.currentYear + ',' + this.currentMonth);
               },
               //下一月
               nextMonth: function () {
                  if (this.currentMonth == 12) {
                     this.currentYear = this.currentYear + 1;
                     this.currentMonth = 1;
                  } else {
                     this.currentMonth = this.currentMonth + 1;
                  }
                  this.setCurrentData(this.currentYear + ',' + this.currentMonth);
               },
               //computed
               computed: function () {
                  this.dateNum = methodsManage.getDateNum(this.currentYear, this.currentMonth, 0);
                  this.dateWidth = parseInt(this.remainWidthFloat / this.dateNum);
                  var remainWidthInt = this.dateWidth * this.dateNum;
                  this.overAllWidth = this.containerWidth - (this.remainWidthFloat - remainWidthInt);
                  this.remainWidth = remainWidthInt;
                  this.tableStyle = { "width": this.overAllWidth + 'px' }
               },
               //renderByDate
               renderByDate: function (year, month) {
                  this.currentYear = year;
                  this.currentMonth = month;
                  this.setCurrentDate();
                  this.setCurrentData();
               },
               //设置当前数据
               setCurrentData: function (currentDate) {
                  //根据日期 2019,4 ,这样的格式来从全部数据中获取数据,然后赋值给vue就可以刷新数据
                  var currentDate = currentDate ? currentDate : this.currentDate;
                  var thisDateData = dataManage.getCurrentMsg(currentDate);
                  if (thisDateData) {
                     this.currentMonthMsg = thisDateData;
                     this.shownHistory = {};
                     this.setCurrentDate();
                  }
               },
               //设置翻页时的日期
               setCurrentDate: function (year, month) {
                  if (typeof year != 'undefined') {
                     this.currentDate = year + ',' + this.currentDate.split(',')[1]
                  }
                  if (typeof month != 'undefined') {
                     this.currentDate = this.currentDate.split(',')[0] + ',' + month
                  }
                  if (typeof year == 'undefined' && typeof month == 'undefined') {
                     this.currentDate = this.currentYear + ',' + this.currentMonth
                  }
                  configManage.config.currentDate = this.currentDate;

                  this.computed()
                  $('.task-row').removeAttr('originalHeight');
               },
               //获取每个任务的left
               getPositionLeft: function (itm) {
                  var config = this.config;
                  var beginDate = itm[config.dateBeginField];
                  return (new Date(beginDate).getDate() - 1) * this.dateWidth
               },
               //获取每个任务的top
               getPositionTop: function (taskItem, msgItem) {
                  var config = this.config;
                  //开始日期和结束日期
                  var beginDate = new Date(taskItem[config.dateBeginField]).getDate();
                  var endDate = new Date(taskItem[config.dateEndField]).getDate();
                  if (typeof this.shownHistory[msgItem[config.msgIdField]] == 'undefined') {
                     //如果保存日期区间数组没有创建，则新建数组，并全部赋值为0
                     // this.shownHistory[msgItem[config.msgIdField]] = Array.apply(null, Array(31)).map(function () { return 0 });
                     this.shownHistory[msgItem[config.msgIdField]] = Array.apply(null, Array(31)).map(
                        function () {
                           return {
                              count: 0,
                              line: []
                           }
                        });
                     //保存第几行有数据
                     for (var index = beginDate; index <= endDate; index++) {
                        var item = this.shownHistory[msgItem[config.msgIdField]][index];
                        item.count++;
                        item.line[0] = true;
                     }
                     return 0;
                  }
                  //保存的数据
                  var shownHistory = this.shownHistory[msgItem[config.msgIdField]];
                  console.log(this.shownHistory);
                  //取出当前区间的数据
                  var currentSectionShown = shownHistory.slice(beginDate, endDate + 1);
                  var sectionLineNum = currentSectionShown.map(function (item) { //取出当前区间最大行数
                     return item.count
                  }).reduce(function (max, cur) {
                     return Math.max(max, cur)
                  }, -Infinity);
                  //取出当前区间的所有行数据情况
                  var lineArr = currentSectionShown.map(function (item) {
                     return item.line
                  });
                  var lineEmpty = this.getArraySameIndex(lineArr);
                  if (lineEmpty <= sectionLineNum) {
                     sectionLineNum = lineEmpty;
                  } else {
                     //如果不符合，则查看在当前区间sectionLineNum行是否都为空，如果不是都为空，则赋值为lineEmpty
                     for (var i = 0; i < lineArr.length; i++) {
                        var item = lineArr[i];
                        if (item[sectionLineNum] != undefined) {
                           sectionLineNum = lineEmpty;
                        }
                     }
                  }

                  //给渲染的区间数量加一，行数加一
                  for (var index = beginDate; index <= endDate; index++) {
                     var item = shownHistory[index];
                     item.count++;
                     item.line[sectionLineNum] = true;
                  }
                  // 返回当前区间的相对定位top值，即当前区间已存在任务数量 * 每个任务的高度
                  //当前日期区间task数量
                  return sectionLineNum * this.taskHeight;
               },
               //获取二维数组中，内部数组某一项值相同的下标
               getArraySameIndex: function (arr, samesign) {
                  var lineEmpty = -1;
                  var currentLine = 0;
                  for (var index = 0; index < arr.length; index++) {
                     var item = arr[index];

                     if (item[currentLine] == samesign) {
                        lineEmpty = currentLine;
                     } else {
                        lineEmpty = -1;
                        index = -1;
                        if (++currentLine == arr.length) {
                           break;
                        }
                     }
                  }
                  return lineEmpty === -1 ? arr.length + 1 : lineEmpty;
               },
               //获取每个任务的width
               getWidthByDate: function (taskItem, msgItem) {
                  var config = this.config;
                  var beginDate = new Date(taskItem[config.dateBeginField]).getDate();
                  var endDate = new Date(taskItem[config.dateEndField]).getDate();
                  //给当前日期区间内的所有值自增 1
                  /* for (var index = beginDate; index <= endDate; index++) {
                     this.shownHistory[msgItem[config.msgIdField]][index].count++;
                  } */
                  //当前宽度即为日期数加 1 * 日期宽度
                  return (endDate - beginDate + 1) * this.dateWidth;
               },
               //设置该行的高度
               setTdHeight: function (msgItem, index) {
                  this.$nextTick(function () {
                     var config = this.config;
                     //拿到最大行数，然后给定td行高值
                     var shownHistory = this.shownHistory[msgItem[config.msgIdField]];
                     if (!shownHistory) {
                        return false;
                     }
                     var tdHeight = shownHistory.map(function (item) {
                        return item.line.length
                     }).reduce(function (max, cur) {
                        return Math.max(max, cur);
                     }, -Infinity) * this.taskHeight;

                     $(config.el).find('td.task-row').eq(index).css('height', tdHeight);
                     $(config.el).find('td.task-row').eq(index).attr('originalHeight', tdHeight);
                  })
               },
               //task点击事件
               taskClick: function (taskItem, msgItem, e) {
                  e.data = {};
                  for (var key in taskItem) {
                     if (taskItem.hasOwnProperty(key)) {
                        var element = taskItem[key];
                        e.data[key] = element;
                     }
                  }
                  if (e.altKey) {
                     //alt + click
                     this.config.handler.onItemClickAltListener(e, taskItem)
                  } else if (e.ctrlKey) {
                     //ctrl + click
                     this.config.handler.onItemClickCtrlListener(e, taskItem)
                  } else {
                     //only click
                     this.config.handler.onItemClickListener(e, taskItem);
                  }
               },
               //拖拽事件
               taskMouseDown: function (taskItem, taskIndex, msgItem, downE) {
                  var vm = this;
                  var $el = $(downE.target);
                  var $elWidth = parseInt($el.css('width'));

                  var originalLeft = parseFloat($el.css('left'));
                  var originalTop = parseFloat($el.css('top'));

                  var mouseDownX = downE.clientX;
                  var mouseDownY = downE.clientY;

                  var mouseMoveX, mouseMoveY;
                  $(document).on('mousemove', function (e) {
                     mouseMoveX = e.clientX - mouseDownX;
                     mouseMoveY = e.clientY - mouseDownY;

                     var currentLeft = originalLeft + mouseMoveX;
                     var currentTop = originalTop + mouseMoveY;

                     if (currentLeft < 0) {
                        currentLeft = 0;
                     }
                     if (currentLeft > vm.remainWidth - $elWidth) {
                        currentLeft = vm.remainWidth - $elWidth
                     }
                     if (currentTop < 0) {
                        currentTop = 0;
                     }
                     if (currentTop > $el.parents('.task-row').height() - vm.taskHeight) {
                        currentTop = $el.parents('.task-row').height() - vm.taskHeight
                     }

                     $el.css('z-index', 9999);
                     $el.css('left', currentLeft);
                     $el.css('top', currentTop);
                  })
                  $(document).on('mouseup', function (e) {
                     var x = Math.round(mouseMoveX / vm.dateWidth);
                     var nowBegin, nowEnd, dateObj = {};
                     if (x < 0) {
                        nowBegin = moment(taskItem[vm.config.dateBeginField]).subtract(-x, 'days').valueOf();
                        nowEnd = moment(taskItem[vm.config.dateEndField]).subtract(-x, 'days').valueOf();
                     } else {
                        nowBegin = moment(taskItem[vm.config.dateBeginField]).add(x, 'days').valueOf();
                        nowEnd = moment(taskItem[vm.config.dateEndField]).add(x, 'days').valueOf();
                     }
                     //传给回调的数据
                     dateObj[vm.config.dateBeginField] = nowBegin;
                     dateObj[vm.config.dateEndField] = nowEnd;
                     vm.config.handler.onDragLinstener($.extend(true, {}, msgItem), $.extend(true, {}, taskItem), dateObj, (function () {
                        return function () {
                           msgItem[vm.config.taskField][taskIndex][vm.config.dateBeginField] = nowBegin;
                           msgItem[vm.config.taskField][taskIndex][vm.config.dateEndField] = nowEnd;
                           vm.shownHistory = {};
                        }
                     })())

                     $el.css('left', originalLeft);
                     $el.css('top', originalTop);
                     $el.css('z-index', 'auto');
                     $(document).off('mousemove mouseup');

                  })
               },
               //鼠标悬浮事件
               taskMouseOver: function (taskItem, taskIndex, msgItem, e) {
                  var vm = this;
                  var $el = $(e.target);
                  var unFoldHeight = 80;
                  if (!$el.parents('.task-row').attr('originalHeight')) {
                     $el.parents('.task-row').attr('originalHeight', $el.parents('.task-row').outerHeight())
                  }

                  $el.css('height', vm.taskHeight + unFoldHeight);
                  $el.parents('.task-row').css('height', parseFloat($el.parents('.task-row').attr('originalHeight')) + unFoldHeight);
                  $el.css('z-index', 9999);
                  $el.css('overflow-y', 'scroll');
                  $el.on('mouseleave', function (e) {
                     $el.css('height', vm.taskHeight);
                     $el.css('overflow-y', 'hidden');
                     $el.parents('.task-row').css('height', parseFloat($el.parents('.task-row').attr('originalHeight')));
                     $el.css('z-index', 'auto');
                     $el.off('mouseleave');
                  })
               }
            },
            computed: {
               //behindLeft
               behindLeft: function () {
                  var vm = this;
                  var behindLeft = [];
                  this.config.formatFields.behind.forEach(function (item, index) {
                     behindLeft[index] = vm.remainWidth + item.width;
                  })
                  return behindLeft;
               },
               dateStyle: function () {
                  return {
                     "width": this.dateWidth + 'px',
                     "overflow": 'hidden',
                     // "max-width": this.dateWidth + 'px',
                     // "min-width": this.dateWidth + 'px'
                  }
               }
            },
            watch: {
               currentDate: {
                  handler: function () {
                     this.currentYear = Number(this.currentDate.split(',')[0]);
                     this.currentMonth = Number(this.currentDate.split(',')[1]);
                  }
               }
            },
            created: function () {
               var vm = this;
               vm.getValue();
            },
            mounted: function () { }
         }

         return vueConfig;
      }
   }

   //方法管理
   var methodsManage = {
      //根据当前的年份，月份获取天数
      getDateNum: function (fullYear, month) {
         var d = new Date(fullYear, month, 0);
         return d.getDate();
      },
      //获取当前月份的信息
      getCurrentMonthMsg: function (config) {

      },
      //toFixed
      toFixed: function (num, s) {
         var times = Math.pow(10, s);
         var des = num * times; //+0.5
         des = parseInt(des, 10) / times;
         return des + '';
      },
      //renderByDate
      renderByDate: function (year, month) {
         allConfig.vmConfig.renderByDate(year, month);
      }
   }

   //拿到所有配置项
   function getConfig(outerConfig) {
      var config = configManage.getConfig(outerConfig);
      var vueConfig = vueManage.getVueConfig(config);

      return {
         config: config,
         vueConfig: vueConfig
      }
   }

   function init(outerConfig) {
      allConfig = getConfig(outerConfig);
      //构建面板
      panelManage.buildPanel(allConfig.config);
      //初始化vue
      allConfig.vmConfig = new Vue(allConfig.vueConfig);
      console.log(allConfig);
   }

   return {
      init: init,
      refresh: dataManage.refresh,
      renderByDate: methodsManage.renderByDate
   }
})(jQuery);