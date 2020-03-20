function nsconfirm1(content, func, mode) {
   (function ($) {
      var config = {};
      function init(content, func, mode) {
         setDefault(content, func, mode);
         if ($('body').find(config.id).length != 0) {
         }
         $(config.id).insertAfter($('body'));
         initVue();
      }
      function setDefault(content, func, mode) {
         config = {
            id: "#nsconfirm-dialog-default",
            content: content,
            func: func,
            mode: mode
         }
      }
      function initVue() {
         var vm = new Vue({
            el: config.id,
            data: config,
            created: function () {
               var html = '<div class="confirm-container" :class="mode">\
                              <div class="container">\
                                 <div class="confirm-header"></div>\
                                 <div class="confirm-body">\
                                    <p>{{content}}</p>\
                                 </div>\
                                 <div class="confirm-footer">\
                                    <div class="btn-group">\
                                       <button class="btn btn-success" type="button" @click="confirm(true)">\
                                             <span>确定</span>\
                                       </button>\
                                       <button class="btn btn-default" type="button" @click="confirm(false)">\
                                             <span>取消</span>\
                                       </button>\
                                    </div>\
                                 </div>\
                              </div>\
                           </div>';
               var $container = $('<div id=' + this.id.replace('#', '') + '></div>');
               $container.append($(html));
               //添加到body中
               $(this.id).length == 0 ? "" : $(this.id).remove();
               $('body').append($container);
            },
            methods: {
               close: function () {
                  $(this.id).remove();
               },
               confirm: function (state) {
                  this.func(state);
                  this.close();
               }
            }
         })
      }
      return {
         init: init
      }
   })(jQuery).init(content, func, mode)
}