var numrangeComponent = (function ($) {
    function showNum(num) {
        // 显示到页面上
        digital.minInput.val(num.minNum);
        digital.maxInput.val(num.maxNum);
    }
    function event() {
        digital.minNum = Number(digital.minInput.val() ? digital.minInput.val() : 0);
        digital.maxNum = Number(digital.maxInput.val() ? digital.maxInput.val() : 0);

        if (digital.changeHandler && typeof (digital.changeHandler) == 'function') {
            digital.changeHandler({
                "minNum": digital.minNum == 0 ? "" : digital.minNum,
                "maxNum": digital.maxNum == 0 ? "" : digital.maxNum
            });
        }
    }
    function addEvent() {
        digital.minInput.on('change', function () {
            event()
        })
        digital.maxInput.on('change', function () {
            event()
        })
    }
    function appendInput() {
        console.log(digital.config);
        var prefix = digital.config.formSource + "-" + digital.config.formID;
        // 创建框架
        var container = digital.$container;
        var minLabel = $("label[name='" + prefix + "-minNum']");
        var maxLabel = $("label[name='" + prefix + "-maxNum']");
        // 获取form-group
        var group = $("#" + prefix);
        // 创建功能组件
        digital.minInput = group.find("#" + prefix + "-minNum");
        digital.maxInput = group.find("#" + prefix + "-maxNum");
        // 将最大值，最小值来添加到label中
        digital.minInput.appendTo(minLabel);

        digital.maxInput.appendTo(maxLabel);
        // 添加完组件添加事件
        addEvent();
    }
    var digital = {
        container: "",
        init: function (config) {
            this.config = config;
            for (var key in config) {
                if (config.hasOwnProperty(key)) {
                    var element = config[key];
                    this[key] = element;
                }
            }
            // console.log(this);
            appendInput();
            // 如果有默认显示数据，则显示
            if (this.config.value) {
                showNum(this.config.value);
            }
        }
    }
    function init(config) {
        if (config != "" && typeof (config) != "undefined") {
            digital.init(config);
        }
    }
    return {
        init: init
    }
})(jQuery)