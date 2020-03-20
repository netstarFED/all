/*
 * @Author: netstar.lxh
 * @Date: 2018-11-27 13:52:59
 * @LastEditors: netstar.lxh
 * @LastEditTime: 2019-02-28 14:35:22
 * @Desription: 文件说明
 */
nsUI.dragWindows = function (outerConfig) {
   (function () {
      var $ = jQuery;
      var config = {}; //组件总数据
      function init(outerConfig) {
         setDefault(outerConfig);
         addEvent();
      };

      function setDefault(outerConfig) {
         config = $.extend(true, {}, outerConfig);
         if (typeof config.parentContainerId == 'undefined' || $.trim(config.parentContainerId) == "" || typeof config.ltContainerId == 'undefined' || $.trim(config.ltContainerId) == "" || typeof config.rbContainerId == 'undefined' || $.trim(config.rbContainerId) == "") {
            return nsalert('请检查配置', 'error');
         }
         //拖拽容器
         typeof config.iClass == 'undefined' ? config.iClass = '' : ""; //拖拽容器内i标签图标
         typeof config.btnIClass == 'undefined' ? config.btnIClass = '' : ""; //拖拽容器内i标签图标
         typeof config.dragToolSize == 'undefined' ? config.dragToolSize = 3 : ""; //拖拽容器尺寸
         typeof config.closePosition == 'undefined' ? config.closePosition = '' : ""; //关闭方向
         //获取节点
         config.parentCon = $('#' + config.parentContainerId);
         config.ltCon = $('#' + config.ltContainerId);
         config.rbCon = $('#' + config.rbContainerId);
         config.parentCon.length == 0
            ? console.error('id为' + config.parentContainerId + '的容器不存在')
            : config.ltCon.length == 0
               ? console.error('id为' + config.ltContainerId + '的容器不存在')
               : config.rbCon.length == 0
                  ? console.error('id为' + config.rbContainerId + '的容器不存在')
                  : "";
         //设置基本属性
         config.parentCon.css('position', 'relative');
         config.hide = false;
      }

      function buildTool() {
         var ltOffSetTop = config.ltCon.position().top;
         var rbOffSetTop = config.rbCon.position().top;
         if (ltOffSetTop == rbOffSetTop) {
            config.direction = 'X';
            //如果顶端相同，则是左右移动
            config.mode = 'left';
            config.cursor = 'w-resize';
            config.reverseMode = 'bottom';
            config.width = 'width';
            config.height = 'height';
            config.mouseClient = 'clientX';
            config.parentSize = config.parentCon.width();
            config.ltConSize = config.ltCon.width();
            config.rbConSize = config.rbCon.width();
         } else {
            config.direction = 'Y';
            //否则是上下移动
            config.mode = 'top';
            config.cursor = 's-resize';
            config.reverseMode = 'right';
            config.width = 'height';
            config.height = 'width';
            config.mouseClient = 'clientY';
            config.parentSize = config.parentCon.height();
            config.ltConSize = config.ltCon.height();
            config.rbConSize = config.rbCon.height();
         }
         //按钮
         config.direction == 'X' ? config.btnIClass = 'fa fa-caret-left' : config.btnIClass = 'fa fa-caret-' + (config.closePosition == 'bottom' ? 'down' : "up");
         var hideBtn = $('<div class="pt-panel-control ' + (config.direction == 'Y' ? 'pt-panel-control-horizontal' : "pt-panel-control-vertical") + '"><button class="white btn"><i class="' + config.btnIClass + '"></i></button></div>');
         hideBtn.css('position', 'absolute')
            .css(config.mode, config.ltConSize + 'px')
            .css(config.reverseMode, 'calc(50% - 15px)');
         config.hideBtn = hideBtn;
         //构建拖拽容器
         var dragToolId = config.parentContainerId + '-dragTool';
         var dragTool = $('<div id="' + dragToolId + '"><i class="' + config.iClass + '"></i></div>');
         dragTool.css('cursor', config.cursor)
            .css('position', 'absolute')
            .css('backgroundColor', 'rgb(0,0,0,0)')
            .css(config.width, config.dragToolSize + 'px')
            .css(config.height, '100%')
            .css(config.mode, (config.ltConSize - config.dragToolSize / 2) + 'px');
         config.dragTool = dragTool;
         //添加到容器
         config.parentCon.append(config.hideBtn);
         config.parentCon.append(config.dragTool);
      }

      function addEvent() {
         buildTool();
         //绑定事件
         config.dragTool.off();
         config.parentCon.on('mouseenter', function (e) {
            if (config.parentCon.find(config.dragTool).length == 0) {
               // config.parentCon.append(config.dragTool);
               // config.parentCon.append(config.hideBtn);
            }
            //按钮事件
            config.hideBtn.off();
            config.hideBtn.on('click', function (e) {
               if (config.hide) {
                  config.hideBtn.removeClass('drag-fold');
                  //设置值
                  setLtSize(config.ltSizeCurrent);
                  setRbSize(config.rbSizeCurrent);
                  setDragToolSize(config.ltSizeCurrent);
                  setHideBtnSize(config.ltSizeCurrent);
                  config.hide = false;
               } else {
                  if (config.closePosition == 'bottom') {
                     config.hideBtn.addClass('drag-fold');
                     config.ltSizeCurrent = getLtSize().ltSizeCurrent;
                     config.rbSizeCurrent = getRbSize().rbSizeCurrent;
                     //设置大小
                     setLtSize(config.parentSize);
                     setRbSize(0);
                     setDragToolSize(config.parentSize);
                     setHideBtnSize(config.parentSize);
                  } else {
                     config.hideBtn.addClass('drag-fold');
                     config.ltSizeCurrent = getLtSize().ltSizeCurrent;
                     config.rbSizeCurrent = getRbSize().rbSizeCurrent;
                     //设置大小
                     setLtSize(0);
                     setRbSize(config.parentSize);
                     setDragToolSize(0);
                     setHideBtnSize(0);
                  }
                  config.hide = true;
               }
               //刷新值
               config.ltConSize = getLtSize().ltSizeCurrent;
               config.rbConSize = getRbSize().rbSizeCurrent;
            });
            config.hideBtn.on('mouseenter', function (e) {
               config.dragTool.css('backgroundColor', '#4089c9');
               config.hideBtn.on('mouseleave', function (e) {
                  config.hideBtn.off('mouseleave');
                  config.dragTool.css('backgroundColor', 'rgb(0,0,0,0)');
               });
            });
            //鼠标按下事件
            config.dragTool.on('mousedown', function (e) {
               config.parentCon.css('cursor', config.cursor);
               var lastMouseClient = e[config.mouseClient];
               var dragToolPosition = config.dragTool.position()[config.mode];
               var hideBtnPosition = config.hideBtn.position()[config.mode];
               config.parentCon.on('mousemove', function (e) {
                  var nestMouseClient = e[config.mouseClient];
                  var dragDist = nestMouseClient - lastMouseClient;
                  config.direction == 'X' ? config.boundary = config.parentCon.width() : config.boundary = config.parentCon.height();
                  if ((dragToolPosition + dragDist) <= 20 || (dragToolPosition + dragDist) >= config.boundary - 20) {
                     return;
                  }
                  setDragToolSize(dragToolPosition + dragDist);
                  setHideBtnSize(hideBtnPosition + dragDist);
                  //设置值	
                  config.ltSizeCurrent = config.ltConSize + dragDist;
                  config.rbSizeCurrent = config.parentSize - getLtSize().ltSizeCurrent;
                  setLtSize(config.ltConSize + dragDist);
                  setRbSize(config.parentSize - getLtSize().ltSizeCurrent);
                  return false;
               });
            });
            //移除事件
            config.parentCon.on('mouseup', function (e) {
               config.parentCon.css('cursor', 'default');
               //重置size
               config.ltConSize = getLtSize().ltSizeCurrent;
               config.rbConSize = getRbSize().rbSizeCurrent;
               config.parentCon.off('mousemove');
            });
            config.parentCon.on('mouseleave', function (e) {
               //重置size
               config.ltConSize = getLtSize().ltSizeCurrent;
               config.rbConSize = getRbSize().rbSizeCurrent;
               //移除事件
               config.parentCon.off('mousemove');
               config.parentCon.off('mouseleave');
               config.parentCon.off('mouseup');
               // config.dragTool.remove();
               // config.hideBtn.remove();
            });
            // return false;
         });
         //拖拽条加鼠标进入事件
         config.dragTool.on('mouseenter', function (e) {
            config.dragTool.css('backgroundColor', '#4089c9');
            config.dragTool.on('mouseleave', function (e) {
               config.dragTool.off('mouseleave');
               config.dragTool.css('backgroundColor', 'rgb(0,0,0,0)');
            });
         });
      }

      function setLtSize(size) {
         config.ltCon.get(0).style[config.width] = size + 'px';
      }

      function setRbSize(size) {
         config.rbCon.get(0).style[config.width] = size + 'px';
      }

      function setDragToolSize(size) {
         config.dragTool.css(config.mode, size + 'px');
      }

      function setHideBtnSize(size) {

         config.hideBtn.css(config.mode, size + 'px');
      }

      function getLtSize() {
         var ltSizeCurrent;
         if (config.direction == 'X') {
            ltSizeCurrent = config.ltCon.width();
         } else {
            ltSizeCurrent = config.ltCon.height();
         }
         return {
            ltSizeCurrent: ltSizeCurrent
         };
      }

      function getRbSize() {
         var rbSizeCurrent;
         if (config.direction == 'X') {
            rbSizeCurrent = config.rbCon.width();
         } else {
            rbSizeCurrent = config.rbCon.height();
         }
         return {
            rbSizeCurrent: rbSizeCurrent
         };
      }
      return {
         init: init
      };
   })().init(outerConfig);
};