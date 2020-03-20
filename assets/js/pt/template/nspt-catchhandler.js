var NetstarCatchHandler = (function ($) {
   NetstarTemplate.serverData = {};
   NetstarTemplate.serverData.preloadArr = [];
   function setAjaxCatch(config, ajaxField) {
      if (!isInPreloadArr(config)) {
         NetstarTemplate.serverData.preloadArr.push({
            config: config,
            ajaxField: ajaxField
         });
      }
   }
   //设置缓存
   function setCatch(catchName, catchData) {
      NetstarTemplate.serverData[catchName] = catchData;
   }
   //拿到缓存
   function getCatch(catchName) {
      if (typeof NetstarTemplate.serverData[catchName] != 'undefined') {
         return NetstarTemplate.serverData[catchName];
      } else {
         return false;
      }
   }
   //预加载函数
   function preload() {
      for (var i = 0, len = NetstarTemplate.serverData.preloadArr.length; i < len; i++) {
         var item = NetstarTemplate.serverData.preloadArr[i];
         ajaxRequest(item);
      }
   }
   //ajax请求函数
   function ajaxRequest(item) {
      var config = item.config, ajaxField = item.ajaxField;
      //在这里添加查寻是否已经请求过了 lxh 2019/02/18
      var ajaxConfig = {
         url: config[ajaxField].url,
         type: config[ajaxField].type,
         dataType: 'text',
         context: {
            config: config
         },
         success: function (res) {
            setCatch(this.config[ajaxField].url, res);
         }
      };
      $.ajax(ajaxConfig);
   }
   //检测数组中是否已经有了
   function isInPreloadArr(config) {
      for (var i = 0; i < NetstarTemplate.serverData.preloadArr.length; i++) {
         var item = NetstarTemplate.serverData.preloadArr[i];
         if (typeof item.config.id != 'undefined' && (config.id == item.config.id)) {
            return true;
         }
      }
      return false;
   }
   return {
      setAjaxCatch: setAjaxCatch,
      setCatch: setCatch,
      getCatch: getCatch,
      preload: preload
   }
})(jQuery);