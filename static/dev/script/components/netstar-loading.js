var　NetstarLoading = (function($){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
                nsAlert('进度条生成失败,id容器不存在','error');
                console.error('进度条生成失败,id容器不存在');
            }
            if(isPass){
                if($('#' + config.id).length == 0){
                    isPass = false;
                    nsAlert('进度条生成失败,id容器不存在','error');
                    console.error('进度条生成失败,id容器不存在');
                }
            }
            if(isPass){
                if(typeof(config.progressNum) != "undefined" && typeof(config.progressNum) != "number"){
                    nsAlert('进度条生成失败,默认值只能是数字','error');
                    console.error('进度条生成失败,默认值只能是数字');
                    console.error(config);
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                type : 'xs',  // xs sm md lg
                progressNum : 0,
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
        },
        // 获取
        getConfig : function(id){
            var _configs = configs[id];
            if(_configs){
                return _configs.config;
            }else{
                return false;
            }
        },
    }
    // 面板管理
    var panelManage = {
        // 获取html
        getHtml : function(config){
            var value = config.progressNum +'%';
            var html = '<div class="pt-progress pt-progress-'+ config.type +'">'
                            + '<div class="pt-progress-bar pt-progress-bar-primary" style="width:' + value + ';">'
                                + '<div class="progress-tag" id="' + config.id + '-progressbar">'+ value +'</div>'
                            + '</div>'
                        + '</div>';
            return html;
        },
        setContainer : function(config){
            var html = this.getHtml(config);
            var $container = $('#' + config.id);
            $container.html(html);
        },
    }
    function refresh(value, id){
        // 验证
        if(typeof(id) != "string" || $('#' + id).length == 0){
            nsAlert('进度条刷新失败,id容器不存在','error');
            console.error('进度条刷新失败,id容器不存在');
            return false;
        }
        if(typeof(value) != "undefined" && typeof(value) != "number"){
            nsAlert('进度条刷新失败,默认值只能是数字','error');
            console.error('进度条刷新失败,默认值只能是数字');
            console.error(value);
        }
        var $progressbar = $('#' + id + '-progressbar');
        value = value + '%';
        $progressbar.text(value);
        $progressbar.closest('.pt-progress-bar').width(value);
    }
    function remove(id){
        // 验证
        if(typeof(id) != "string" || $('#' + id).length == 0){
            nsAlert('进度条移除失败,id容器不存在','error');
            console.error('进度条移除失败,id容器不存在');
            return false;
        }
        var $container = $('#' + id);
        $container.children().remove();
    }
    function init(config){
        // 验证配置是否通过
        var isPass = configManage.validConfig(config);
        if(!isPass){
            return isPass;
        }
        // 定义config
        configs[config.id] = {
            source : $.extend(true, {}, config),
            config : config,
        };
        // 设置config
        configManage.setConfig(config);
        panelManage.setContainer(config);
    }
    return {
        configs : configs,
        init : init,
        remove: remove,
        refresh : refresh,
    }
})(jQuery)