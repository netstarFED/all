nsUI.mobileSearch = (function ($) {
   var config = {};  //页面配置
   function init(userConfig) {
      setDefault(userConfig);
      createInput();
      $('form').on('keydown', function (e) {
         if (e.keyCode == 13) {
            return false;
         }
      });
      //键盘监听
      listenInput();
      //按键监听
      $('.input-group-addon').on('click', function () {
         confirmInput(function () {
            config.$input.blur();
            config.handler(config.returnValue);
         });
      });
      if (config.showSearchHis) {
         config.$inputContainer.after('<div class="search-history"><div class="history-title""><span>历史记录</span><i class=" fa fa-trash-o"></i></div><div class="history-content"></div></div>');
         setSearchHis();
      }
   }
   //设定默认属性
   function setDefault(userConfig) {
      if (typeof userConfig.containerId == 'undefined') {
         nsalert('请配置输入框containerId', 'error');
      }
      config = $.extend(true, {}, userConfig);
      typeof config.type == 'undefined' || config.type.length == 0 ? config.type = 'search' : "";
      typeof config.placeholder == 'undefined' ? config.placeholder = '' : "";
      typeof config.btns == 'undefined' ? config.btns = [] : "";
      typeof config.defaultValue == 'undefined' ? config.defaultValue = '' : "";
      typeof config.handler == 'undefined' ? config.handler = function () { } : "";
      typeof config.showSearchHis == 'undefined' ? config.showSearchHis = true : "";
      config.inputValue = "";
      config.returnValue = {};
      config.$inputContainer = $('#' + config.containerId);
      config.$inputContainer.empty();
      config.localStorageName = config.containerId + 'His';
      config.$inputContainer.addClass('mobile-input-search');
   }
   //往页面添加搜索框
   function createInput() {
      var html = "";
      html = '<form action="javascript:return true;" role="form" aria-invalid="false" class="clearfix  standard compactmode " onsubmit="return false;" novalidate="novalidate"><div class="input-group">' +
         (typeof config.label != 'undefined' && $.trim(config.label).length != 0 ? '<span class="input-group-addon">' + config.label + '</span>' : '') +
         '<input class="form-control" placeholder="' + config.placeholder + '" type="' + config.type + '" value="' + config.defaultValue + '">' +
         '<div class="input-group-btn hidden" id="clearInput">' +
         '<button class="btn btn-icon">' +
         '<i class="fa-times-circle"></i>' +
         '</button>' +
         '</div></div>' +
         '<div class="btn-group">' +
         '</div></form>';
      config.$inputContainer.append(html);
      config.$input = config.$inputContainer.find('input');
      //input清空按钮事件
      config.$inputContainer.find('#clearInput').on('click', function (e) {
         $(this).addClass('hidden');
         config.$input.val("");
         config.$input.focus();
         config.inputValue = "";
         config.returnValue = {};
      });
      //添加搜索按钮
      if (!$.isEmptyObject(config.searchBtn)) {
         var searchBtn = config.searchBtn;
         var showText = typeof searchBtn.iconClass == 'undefined' || $.trim(searchBtn.iconClass).length == 0;
         var btnHtml = '<button id="searchBtn" class="btn btn-icon' + searchBtn.btnType + '">' +
            '<i class="' + searchBtn.iconClass + '"></i>' +
            (showText ? searchBtn.text : "") +
            '</button>';
         config.$inputContainer.find('.btn-group').append(btnHtml);
         var $currentBtn = $('#searchBtn');
         $currentBtn.on('click', function (e) {
            e.stopPropagation();
            confirmInput(function () {
               config.handler(config.returnValue);
            });
         });
      }
      //添加自定义按钮
      if (config.btns.length > 0) {
         $.each(config.btns, function (index, item) {
            typeof item.btnType == 'undefined' ? item.btnType = "text" : "";
            typeof item.text == 'undefined' ? item.text = "" : "";
            typeof item.handler == 'undefined' ? item.handler = function () { } : "";
            var showText = typeof item.iconClass == 'undefined' || $.trim(item.iconClass).length == 0;
            var btnHtml = '<button id="definedBtn-' + index + '" class="btn btn-icon' + item.btnType + '">' +
               '<i class="' + item.iconClass + '"></i>' +
               (showText ? item.text : "") +
               '</button>';
            config.$inputContainer.find('.btn-group').append(btnHtml);
            //添加按钮点击事件
            var $currentBtn = $('button#definedBtn-' + index);
            $currentBtn.on('click', function (e) {
               e.stopPropagation();
               item.handler(config.returnValue);
            });
         });
      }
      //添加loading
      $('container').append('<div id="mobileSearchLoading" class="mobile-search-loading hidden"></div>');
      // $('container').append('<div id="mobileSearchLoading" class="mobile-search-loading"></div>');
   }
   //监听键盘输入
   function listenInput() {
      config.$input.on('keyup', function (e) {
         switch (e.keyCode) {
            case 13:
               confirmInput(function () {
                  config.$input.blur();
                  config.handler(config.returnValue);
               });
               break;
            default:
               config.inputValue = $(this).val();
               if (config.inputValue.length > 0) {
                  $('#clearInput').removeClass('hidden');
               } else {
                  $('#clearInput').addClass('hidden');
               }
               break;
         }
      });
   }
   //确认输入
   function confirmInput(cb) {
      if (config.$input.val().length == 0) {
         return nsalert('请输入内容', 'warning');
      }
      config.returnValue = {
         inputValue: config.inputValue,
         ajaxData: {},
         config: config
      }
      if (typeof config.ajaxConfig != 'undefined') {
         $('#mobileSearchLoading').removeClass('hidden');
         var ajax = nsVals.getAjaxConfig(config.ajaxConfig, config.inputValue);
         nsVals.ajax(ajax, function (res) {
            $('#mobileSearchLoading').addClass('hidden');
            if (res.success) {
               config.returnValue.ajaxData = res[ajax.dataSrc];
            }
            cb && typeof cb == 'function' ? cb() : "";
         });
      } else {
         cb && typeof cb == 'function' ? cb() : "";
      }
      //保存进本地历史记录
      var searchHisArr = JSON.parse(localStorage.getItem(config.localStorageName)) || [];
      if (searchHisArr.length <= 10) {
         searchHisArr.unshift(config.inputValue);
      } else {
         searchHisArr.pop();
         searchHisArr.unshift(config.inputValue);
      }
      localStorage.setItem(config.localStorageName, JSON.stringify(distinct(searchHisArr)));
      setSearchHis();
   }
   //保存历史记录
   function setSearchHis() {
      var _this = this;
      var localStorageName = config.localStorageName;
      var $searchHis = $('.search-history');
      var $searchCon = $('.history-content');
      var searchHisArr = JSON.parse(localStorage.getItem(localStorageName)) || [];
      var hisStr = "";
      if (searchHisArr.length > 0) {
         $.each(searchHisArr, function (index, item) {
            hisStr += '<span class="search-history-item">' + $.trim(item) + '</span>';
         });
         $searchCon.empty();
         $searchCon.append(hisStr);
         $searchHis.removeClass('hidden');
         //清空历史记录
         var $clearHis = $searchHis.find('.fa-trash-o');
         $clearHis.on('touchstart', function () {
            $clearHis.on('touchmove', function () {
               $clearHis.off('touchend');
            });
            $clearHis.on('touchend', function () {
               localStorage.removeItem(localStorageName);
               setSearchHis();
               $clearHis.off('touchend touchmove');
            });
         });
         //历史记录点击事件
         $.each($searchHis.find('.search-history-item'), function (index, item) {
            $(this).on('touchstart', function () {
               $(this).on('touchmove', function () {
                  $(this).off('touchend');
               })
               $(this).on('touchend', function () {
                  config.inputValue = $(this).html();
                  confirmInput(function () {
                     config.handler(config.returnValue);
                  });
                  $(this).off('touchend touchmove');
               });
            });
         });
      } else {
         $searchCon.empty();
         $searchHis.addClass('hidden');
      }
   }
   //数组去重
   function distinct(arr) {
      var len = arr.length;
      var result = [];
      for (var i = 0; i < len; i++) {
         for (var j = i + 1; j < len; j++) {
            if (arr[i] == arr[j]) {
               j = ++i;
            }
         }
         result.push(arr[i]);
      }
      return result;
   }
   function setValue(param) { }
   function getValue() {
      return config.returnValue;
   }
   return {
      init: init,
      getValue: getValue
   };
})(jQuery);