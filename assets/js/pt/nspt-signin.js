
// 轮播图
var NetstarRotaryPlantingMap = (function(){
    var configs = {};
    // config
    var configManage = {
        setDefault : function(config){
            var defaultConfig = {
                time : 3000,
                width : 500,
                height : 300,
            }
            for(var key in defaultConfig){
                config[key] = typeof(config[key]) == "undefined" ? defaultConfig[key] : config[key];
            }
        },
        setConfig : function(config){
            config.$container = $('#' + config.id);
            config.ajax.type = typeof(config.ajax.type) == "string" ? config.ajax.type : 'GET';
            config.ajax.dataSrc = typeof(config.ajax.dataSrc) == "string" ? config.ajax.dataSrc : 'rows';
            config.ajax.contentType = typeof(config.ajax.contentType) == "string" ? config.ajax.contentType : 'application/x-www-form-urlencoded';
        },
        validatConfig : function(config){
            var isValid = true;
            var $container = $('#' + config.id);
            if($container.length === 0){
                isValid = false;
            }
            if(isValid){
                if(typeof(config.ajax) != "object"){
                    isValid = false;
                }else{
                    if(typeof(config.ajax.url) != "string"){
                        isValid = false;
                    }
                }
            }
            return isValid;
        },
    }
    // 面板
    var panelManage = {
        template : {
            html : '<div class="pt-rotaryplantingmap" :style="styleObj">'
                        + '<ul class="wrap">'
                            + '<li class="" :class="'
                                    + '{' 
                                        + 'slideInRight:imgObj.isActive,animated:imgObj.isActive||imgObj.isPrev,'
                                        + 'hide:!imgObj.isActive&&!imgObj.isPrev&&!imgObj.isStart,'
                                        + 'slideOutLeft:imgObj.isPrev'
                                    + '}"'
                                    + ' v-for="(imgObj,index) in imgArr">'
                                // + '<img class="" :src="imgObj[valueField]" :style="styleObj"/>'
                                + '<div class="" :style="[styleObj,imgObj.styleObj]"></div>'
                            + '</li>'
                        + '</ul>'
                    + '</div>'
        },
        getData : function(config){
            var data = {
                imgArr : config.imgArr,
                index : 1,
                valueField: config.valueField,
                styleObj : {}
            }
            if(data.imgArr.length > 0){
                data.imgArr[0].isStart = true;
            }
            data.styleObj.width = typeof(config.width) == "string" ? config.width : config.width + 'px';
            data.styleObj.height = typeof(config.height) == "string" ? config.height : config.height + 'px';
            if(config.height = "100%"){
                data.styleObj.height = $(document).height() + 'px';
            }
            if(config.width = "100%"){
                data.styleObj.width = $(document).width() + 'px';
            }
            for(var i=0; i<data.imgArr.length; i++){
                data.imgArr[i].styleObj = {
                    "background" : 'url(' + rootPath + data.imgArr[i][config.valueField] + ')',
                    "background-size": 'cover',
                    "background-repeat":"no-repeat",
                }
            }
            return data;
        },
        // 通过图片列表生成面板
        setListPanel : function(config){
            var html = panelManage.template.html;
            var data = panelManage.getData(config);
            var id = config.id;
            var $container = config.$container;
            $container.append(html);
            config.imgVue = new Vue({
                el: '#' + id,
                data: data,
                watch: {},
                methods: {
                    start : function(){
                        config.timer = setInterval(this.running, config.time);
                    },
                    stop : function(){
                        clearInterval(config.timer);
                    },
                    running : function(){
                        if(this.index >= this.imgArr.length){
                            this.index = 0;
                        }
                        var index = this.index;
                        var prev = index - 1;
                        if(prev == -1){
                            prev = this.imgArr.length - 1;
                        }
                        var imgArr = $.extend(true, [], this.imgArr);
                        for(var i=0; i<imgArr.length; i++){
                            imgArr[i].isActive = false;
                            imgArr[i].isPrev = false;
                            imgArr[i].isStart = false;
                        }
                        imgArr[index].isActive = true;
                        imgArr[prev].isPrev = true;
                        this.imgArr = imgArr;
                        this.index ++;
                    },
                    mouseout : function(){
                        this.start();
                    },
                    mouseover : function(){
                        this.stop();
                    },
                },
                mounted: function(){
                    this.start();
                }
            });
        },
    }
    // 事件
    var eventManage = {}
    // 方法
    var funcManage = {
        // 通过ajax初始化轮播图
        initByAjax : function(config, callBackFunc){
            var ajaxConfig = {
                url : config.ajax.url,
                type : config.ajax.type,
                contentType : config.ajax.content,
                plusData : {
                    id : config.id,
                    callBackFunc : callBackFunc,
                },
                success : function(res){
                    var _ajaxConfig = this;
                    var plusData = _ajaxConfig.plusData;
                    var _config = configs[plusData.id];
                    if(res.success){
                        var dataSrc = _config.ajax.dataSrc;
                        if($.isArray(res[dataSrc])){
                            if(typeof(plusData.callBackFunc) == "function"){
                                plusData.callBackFunc(res[dataSrc], plusData);
                            }
                        }else{
                            nsAlert('轮播图返回值错误');
                            console.log('轮播图返回值错误');
                            console.log(_config);
                            return false;
                        }
                    }else{
                        nsAlert('轮播图返回值错误');
                        console.log('轮播图返回值错误');
                        console.log(_config);
                        return false;
                    }
                }
            }
            $.ajax(ajaxConfig);
        }
    }
    function init(config){
        var isPass = configManage.validatConfig(config);
        if(!isPass){
            // 验证失败
            nsAlert('轮播图配置错误', 'error');
            console.error('轮播图配置错误');
            return;
        }
        configs[config.id] = config;
        configManage.setDefault(config);
        configManage.setConfig(config);
        funcManage.initByAjax(config, function(resData, plusData){
            var _config = configs[plusData.id];
            _config.imgArr = resData;
            panelManage.setListPanel(_config);
        })
    }
    return {
        init : init,
        configs : configs,
    }
})(jQuery)