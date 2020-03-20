nsUI.radioCheckString = (function ($) {
   return (function ($) {
      var config = {};
      var symbol = "$";
      function init(outerConfig) {
         setDefault(outerConfig);
         addEvent();
      }
      function setDefault(outerConfig) {
         config = $.extend(true, {}, outerConfig);
         typeof config.inputType == 'undefined' ? config.inputType == 'radio' : "";
         typeof config.connectSymbol == 'undefined' ? "" : symbol = config.connectSymbol;
         config.$container = $('div[ns-id="' + config.id + '"]');
         config.$otherLabel = config.$container.find('#form-' + config.formID + '-other-label');
         config.$other = config.$container.find('#form-' + config.formID + '-other');
         config.$otherLabel.on('click', function (e) {
            e.stopPropagation();
            var $this = $(this);
            if (config.inputType == 'radio') {
               var hasChecked = $this.hasClass('checked');
               config.$container.find('label').removeClass('checked');
               if (!hasChecked) {
                  $this.addClass('checked');
               }
            } else if (config.inputType == 'checkbox') {
               $this.toggleClass('checked');
            }
            //其他添加禁用状态
            if ($this.hasClass('checked')) {
               config.$other.removeAttr('disabled');
               config.$other.focus();
            } else {
               config.$other.attr('disabled', 'disabled');
            }
            return false;
         });
      }
      function addEvent() {
         var preFix = config.formSource + "-" + config.formID;
         switch (config.inputType) {
            case "radio":
               config.$container.find('label[id != "form-' + config.formID + '-other-label"]').on('click', function (e) {
                  e.stopPropagation();
                  var $this = $(this);
                  var hasChecked = $this.hasClass('checked');
                  config.$container.find('label').removeClass('checked');
                  if (!hasChecked) {
                     $this.addClass('checked');
                  }
                  //其他添加禁用状态
                  if (config.$otherLabel.hasClass('checked')) {
                     config.$other.removeAttr('disabled');
                     config.$other.focus();
                  } else {
                     config.$other.attr('disabled', 'disabled');
                  }
                  //回调函数
                  config.changeHandler({
                     id: config.id,
                     dom: $this
                  });
                  return false;
               });
               break;
            case "checkbox":
               config.$container.find('label[id != "form-' + config.formID + '-other-label"]').on('click', function (e) {
                  e.stopPropagation();
                  var $this = $(this);
                  $this.toggleClass('checked');
                  //回调函数
                  config.changeHandler({
                     id: config.id,
                     dom: $this
                  });
                  return false;
               });
               break;

            default:
               break;
         }
      }
      function setValue(config, value) {
         var $form = $('#form-' + config.formID);
         var valueArr = [];
         var $container = $form.find('div[ns-id="' + config.id + '"]');
         var $checkedLabel = $container.find('label');
         if (config.inputType == 'radio') {
            $container.find('label').removeClass('checked');
            valueArr.push(value.split(symbol)[0]);
         } else if (config.inputType == 'checkbox') {
            valueArr = value.split(symbol);
         }
         $.each($checkedLabel, function (index, item) {
            var $this = $(item);
            var inputValue = $this.find('input').attr('value');
            var $input = $this.find('input[value="' + inputValue + '"]');
            if ($.inArray(inputValue, valueArr) != -1 && $input.length != 0) {
               $this.addClass('checked');
               $input.attr('checked', "");
            }
         });
      }
      function getValue(formID, inputkey) {
         var checkedStr = "";
         var $form = $('#form-' + formID);
         var $checkedLabel = config.$container.find('label.checked');
         switch (config.inputType) {
            case "radio":
               if (typeof $checkedLabel.attr('id') != 'undefined' && $checkedLabel.attr('id') == config.$otherLabel.attr('id')) {
                  checkedStr = config.$other.val().trim();
               } else {
                  checkedStr = $checkedLabel.text().trim();
               }
               break;
            case "checkbox":
               $.each($checkedLabel, function (index, item) {
                  var $this = $(this);
                  if (typeof $this.attr('id') != 'undefined' && $this.attr('id') == config.$otherLabel.attr('id')) {
                     checkedStr += config.$other.val().trim() + symbol;
                  } else {
                     checkedStr += $this.text().trim() + symbol;
                  }
               });
               checkedStr = checkedStr.substring(0, checkedStr.length - 1);
               break;

            default:
               break;
         }
         return checkedStr;
      }
      return {
         init: init,
         getValue: getValue,
         setValue: setValue,
         VERSION: "0.5.2"
      };
   })($);
})(jQuery);