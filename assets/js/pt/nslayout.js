/*
 * @Author: Lxh
 * @Date: 2018-11-27 17:28:23
 * @LastEditors: netstar.lxh
 * @LastEditTime: 2018-12-25 13:37:52
 * @Description: 
 */
NetStarLayout = {};
NetStarLayout.init = function (outerConfig) {
   var nsLayout = (function ($) {
      var panels = {},
         originalConfig = {},
         config = {};

      function init(outerConfig) {
         originalConfig = $.extend(true, {}, outerConfig);
         config = $.extend(true, {}, outerConfig);
         setDefault();
         setPanels(config.panels);
         buildPanel(config.panels, config.layout);
         config.$container.append(config.layout);
         console.log(config);
      }

      function setDefault() {
         if (!verify(config.id)) {
            return nsalert('请填写id', 'error');
         }
         config.layout = $('<div id="' + config.id + '" ns-id="' + config.id + '"  ns-type="layout"  class="nslayout ' + config.plusclass + '"></div>');
         config.panel = {}; //所有面板的集合
         config.vueData = {}; //需要传给vue做data的参数
         config.addDragEvent = [];
      }

      function setPanels(panels, parentPanel) {
         /**
          * 做高度计算
          * 做拼接
          * 做template拼接
          */
         camputeSize(panels, parentPanel);
         var i, len;
         for (i = 0, len = panels.length; i < len; i++) {
            var item = panels[i];
            if (!verify(item.id)) {
               item.id = i;
            } //检验id
            item.type == 'rows' || item.type == 'cols' ? setPanels(item[item.type], item) : "";
         }
      }
      //计算赋值宽高
      function camputeSize(panel, parentPanel) {
         var i, len,
            parentSize = {},
            heightArr = [],
            countNoHeight = 0,
            widthArr = [],
            countNoWidth = 0,
            sizeArr = 'width,height'.split(','),
            sizeArrUp = 'Width,Height'.split(',');
         //拿到默认的父级宽高
         parentSize = {
            width: verify(parentPanel) ? parentPanel.width : $('.content-box').width(),
            height: verify(parentPanel) ? parentPanel.height : $('.content-box').height(),
            assignedWidth: 0,
            assignedHeight: 0
         };
         for (i = 0, len = panel.length; i < len; i++) {
            var item = panel[i];
            !verify(item.type) ? item.type = parentPanel.type.replace('s', "") : ""; //赋值默认type
            //给定默认值
            if (getDirection(item.type) == 'row' || item.type == 'cols') {
               if (typeof parentPanel != 'undefined' && parentPanel.type == 'cols') {
                  item.height = parentSize.height;
                  widthArr[i] = 0;
                  countNoWidth++;
               } else {
                  item.width = parentSize.width;
                  if (verify(item.height)) {
                     if (item.height <= 1) {
                        item.height *= parentSize.height;
                     }
                     if (item.height > parentSize.height) {
                        item.height = parentSize.height * 0.1;
                     }
                  } else {
                     heightArr[i] = 0;
                     countNoHeight++;
                  }
               }
            } else if (item.type == 'col') {
               item.height = parentSize.height;
               if (verify(item.width)) {
                  if (item.width <= 1) {
                     item.width *= parentSize.width;
                  }
                  if (item.width > parentSize.width) {
                     item.width = parentSize.width * 0.1;
                  }
               } else {
                  widthArr[i] = 0;
                  countNoWidth++;
               }
            }

            parentSize.assignedWidth += item.width ? item.width : 0;
            parentSize.assignedHeight += item.height ? item.height : 0;
         }
         if (countNoHeight) {
            $.each(heightArr, function (index, item) {
               if (item == 0) {
                  var surplus = parentSize.height - parentSize.assignedHeight;
                  panel[index].height = surplus / countNoHeight;
               }
            });
         }
         if (countNoWidth) {
            $.each(widthArr, function (index, item) {
               if (item == 0) {
                  var surplus = parentSize.width - parentSize.assignedWidth;
                  panel[index].width = surplus / countNoWidth;
               }
            });
         }
      }
      //构建panel的html语句
      function buildPanel(panel, $parentPanel, containerGather) {
         var parentId = $parentPanel.attr('id');
         verify(containerGather) ? "" : containerGather = config.panel;
         $.each(panel, function (index, item) {
            var $panel;
            var id = parentId + '-' + item.id;
            var nsId = item.id;
            var plusclass = item.plusclass;
            if (verify(item.template)) {
               //如果有模板，则走模板
               // {{defaultAttr}}: id="" ns-id=""  ns-type="layout-panel"  标明了defaultAttr的标签也就是下级对象的容器
               // {{defaultClass}}: nslayout-panel plusclass rows
               var defaultAttr = id + 'DefaultAttr';
               var defaultClass = id + 'DefaultClass';
               defaultAttr = defaultAttr.replace(/-/g, "");
               defaultClass = defaultClass.replace(/-/g, "");
               /defaultAttr/g.test(item.template) ? item.template = item.template.replace('{{defaultAttr}}', 'ns-id="' + nsId + '" ns-type="layout-panel"') : '';
               /defaultClass/g.test(item.template) ? item.template = item.template.replace('{{defaultClass}}', ':class="[' + defaultClass + ']"') : '';
               config.vueData[defaultAttr] = {
                  "id": id,
                  "ns-id": nsId,
                  "ns-type": "layout-panel"
               };
               config.vueData[defaultAttr + 'Str'] = 'id="' + id + '" ns-id="' + nsId + '" ns-type="layout-panel"';
               config.vueData[defaultClass] = "nslayout-panel " + (plusclass ? plusclass : '') + " rows";
               $panel = $(item.template);
               $panel.attr(':id', '[' + defaultAttr + '.id]');
            } else {
               //如果没有模板则默认输出
               $panel = $('<div id="' + id + '" ns-id="' + nsId + '"  ns-type="layout-panel"  class="nslayout-panel rows ' + plusclass + '"></div>');
            }
            $panel.css('background-color', method2());
            $panel.css('width', item.width);
            $panel.css('height', item.height);

            containerGather[item.id] = $panel;
            if (verify(item.rows) || verify(item.cols)) {
               buildPanel(verify(item.rows) ? item.rows : item.cols, $panel, containerGather[item.id]);
            }
            //如果设置拖拽属性
            if (item.isCanDrag) {
               config.addDragEvent.push({
                  parentContainerId: id,
                  ltContainerId: id + '-' + item[item.type][0].id,
                  rbContainerId: id + '-' + item[item.type][1].id
               });
            }
            $parentPanel.append($panel);
         });
      }

      function setPanelForConfig() {

      }

      function getPanelConfig() {

      }

      function verify(element) {
         if (typeof element == 'undefined') {
            return false;
         }
         if ($.trim(element).length == 0) {
            return 0;
         }
         return true;
      }

      function getDirection(type) {
         if (type == 'row' || type == 'rows') {
            return 'row';
         }
         if (type == 'col' || type == 'cols') {
            return 'col';
         }
      }

      function getConfig() {
         return {
            config: config,
            originalConfig: originalConfig
         };
      }

      function method2() {
         var color = "#";
         for (var i = 0; i < 6; i++) {
            color += (Math.random() * 16 | 0).toString(16);
         }
         return color;
      }
      return {
         init: init,
         getPanelConfig: getPanelConfig,
         getConfig: getConfig
      };
   })(jQuery);
   nsLayout.init(outerConfig);
   return {
      getPanelConfig: nsLayout.getPanelConfig,
      getConfig: nsLayout.getConfig
   };
};