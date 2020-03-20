var NetstarSounder = (function($){
    var configById = {};
    // config管理
    var configManage = {
        validataConfig : function(config){
            var isPass = true;
            if($('#' + config.id).length === 0){
                isPass = false;
            }
            return isPass;
        },
        setDefault : function(config){
            var defaultConfig = {
                isMuted : false,    // 是否静音
                url : '',           // 文件地址
                format : 'audio/ogg', // 音频格式
                type : 'horizontal', // horizontal / vertical 横/纵
                soundSize : '0.5',
                width : 240,
                height : 6,
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        setConfig : function(config){
            this.setDefault(config);
            config.sourceId = config.id + '-source';
            config.audioId = config.id + '-audio';
            config.textId = config.id + '-text';
            config.soundBarId = config.id + '-soundbar';
            config.soundBarContentId = config.id + '-soundbar-content';
            config.placeId = config.id + '-soundbar-place';
            config.progressId = config.id + '-soundbar-progress';
            config.scrollblockId = config.id + '-soundbar-placscrollblock';
        },
        getConfig : function(id){
            var configs = configById[id];
            if(configs){
                return configs.config;
            }else{
                return false;
            }
        },
    }
    // 面板管理
    var panel = {
        getJQHtml : function(config){
            var html = '<div class="pt-sounder pt-top-menu-item-row ' + config.type + '">'
                            + '<div class="pt-nav-item" ns-name="switch">'
                             + '<i class="icon-volume-o""></i>'
                            + '</div>'
                            + '<div class="pt-sounder-control pt-on hide" id="'+ config.soundBarId +'">'
                                + '<div class="pt-btn-group">'
                                    + '<button class="pt-btn pt-btn-default pt-btn-icon" ns-name="sounder-switch">'
                                        + '<i class="icon-volume-o"></i>'
                                    + '</button>'
                                + '</div>'
                                + '<div class="pt-progress" id="'+ config.progressId +'" style="width:' + config.width + 'px;height:' + config.height + 'px;">'
                                    + '<div class="pt-progress-bar" id="'+ config.placeId +'">'
                                    + '</div>'
                                    + '<div class="pt-progress-btn" id="'+ config.scrollblockId +'"></div>'
                                + '</div>'
                                
                                + '<div class="pt-progress-value">'
                                    + '<span id="'+ config.textId +'"></span>'
                                + '</div>'
                            + '</div>'
                            + '<div class="pt-source-container">'
                                + '<audio id="' + config.audioId + '">' //controls="controls"
                                    + '<source src="' + config.url + '" type="' + config.format + '" id="' + config.sourceId + '">'
                                    + 'Your browser does not support the audio element.'
                                + '</audio>'
                            + '</div>'
                        + '</div>';
            var $html = $(html);
            return $html;
        },
        setMoveEvent : function($container, config){
            var $scrollblock = $container.find('#' + config.scrollblockId);
            $scrollblock.off('mousedown');
            $scrollblock.on('mousedown', function(ev){
                // 按下鼠标容器
                var $this = $(this);
                var $i = $container.find('[ns-name="sounder-switch"]').children('i');
                $i.removeClass('icon-volume-mute-o');
                $i.addClass('icon-volume-o');
                // 按下鼠标鼠标位置
                var pageX = ev.pageX;
                var pageY = ev.pageY;
                // 进度条
                var $progress = $this.parent();
                var $text = $container.find('#' + config.textId);
                var $place = $container.find('#' + config.placeId);
                // 声音dom
                var audioDom = $container.find('#' + config.audioId)[0];
                // 进度条的位置
                var offset = $progress.offset();
                var offsetLeft = offset.left;
                var offsetTop = offset.top;
                // 进度条宽度/高度 this高度/宽度
                // 用于：计算块位置
                var width = $progress.width();
                var height = $progress.height();
                // 滑动块宽度
                var bolckWidth = $this.width();
                // 滑动块位置
                var position = $this.position();
                var bolckLeft = position.left;
                var bolckTop = position.top;
                // 块元素边界距离中心点距离
                var range = bolckWidth / 2;
                // 鼠标移动
                function mousemove(_event){
                    // 移动后鼠标位置
                    var mousePageX = _event.pageX;
                    var mousePageY = _event.pageY;
                    // 移动后鼠标移动的长度
                    var xLen = mousePageX - pageX;
                    var yLen = mousePageY - pageY;
                    // 改变的位置
                    var left = bolckLeft + xLen;
                    var top = bolckTop + yLen;
                    var volume = 0;
                    switch(config.type){
                        case 'horizontal':
                            if((left + range) > width){
                                left = width - range;
                            }
                            if((left + range) < 0){
                                left = 0 - range;
                            }
                            volume = (left + range) / width;
                            $this.css({
                                left:left
                            });
                            $place.width(left + range);
                            break;
                        case 'vertical':
                            if((top + range) > height){
                                top = height - range;
                            }
                            if((top + range) < 0){
                                top = 0 - range;
                            }
                            volume = (top + range) / width;
                            $this.css({
                                top:top
                            });
                            $place.height(left + range);
                            break;
                    }
                    audioDom.volume = volume;
                    $text.text(parseInt(volume*100) + '%');
                }
                // 放开鼠标
                function mouseup(_event){
                    // 松开鼠标时位置
                    mousemove(_event);
                    // 关闭移动鼠标事件
                    $(document).off('mousemove', mousemove);
                    // 关闭松开鼠标事件
                    $(document).off('mouseup', mouseup);
                }
                // 关闭移动鼠标事件
                $(document).off('mousemove', mousemove);
                // 添加移动鼠标事件
                $(document).on('mousemove', mousemove);
                // 关闭松开鼠标事件
                $(document).off('mouseup', mouseup);
                // 添加松开鼠标事件
                $(document).on('mouseup', mouseup);
            });
        },
        // 设置声音
        setSounder : function($container, config){
            // 声音dom
            var audioDom = $container.find('#' + config.audioId)[0];
            var $scrollblock = $container.find('#' + config.scrollblockId);
            var $text = $container.find('#' + config.textId);
            // 进度条
            var $progress = $container.find('#' + config.progressId);
            var width = $progress.width();
            var height = $progress.height();
            // 滑动块宽度
            var bolckWidth = $scrollblock.width();
            // 块元素边界距离中心点距离
            var range = bolckWidth / 2;
            var volume = 0;
            switch(config.type){
                case 'horizontal':
                    var left = $scrollblock.position().left;
                    volume = (left + range) / width;
                    audioDom.volume = volume;
                    break;
                case 'vertical':
                    var top = $scrollblock.position().top;
                    volume = (top + range) / height;
                    audioDom.volume = volume;
                    break;
            }
            $text.text(parseInt(volume*100) + '%');
        },
        // 设置声音控制块位置
        setPositionBySoundSize : function(soundSize, config){
            var $container = config.$container;
            var $scrollblock = $container.find('#' + config.scrollblockId);
            var $place = $container.find('#' + config.placeId);
            // 进度条
            var $progress = $container.find('#' + config.progressId);
            var width = $progress.width();
            var height = $progress.height();
            // 滑动块宽度
            var bolckWidth = $scrollblock.width();
            // 块元素边界距离中心点距离
            var range = bolckWidth / 2;
            switch(config.type){
                case 'horizontal':
                    var left = width * soundSize - range;
                    $scrollblock.css({
                        left : left,
                    })
                    $place.width(width * soundSize);
                    break;
                case 'vertical':
                    var top = height * soundSize - range;
                    $scrollblock.css({
                        top : top,
                    })
                    $place.height(height * soundSize);
                    break;
            }
        },
        setEvent : function($container, config){
            var _this = this;
            var $switch = $container.find('[ns-name="switch"]'); // 开关
            var $sounderSwitch = $container.find('[ns-name="sounder-switch"]'); // 静音开关
            // 设置滑块移动
            this.setMoveEvent($container, config);
            // 设置声音条控制器显示隐藏
            $switch.off('click');
            $switch.on('click', function(ev){
                var $controlBar = $container.children('.pt-sounder-control');
                $controlBar.toggleClass('hide');
            });
            // 设置声音开关
            $sounderSwitch.off('click');
            $sounderSwitch.on('click', function(ev){
                var $this = $(this);
                var $i = $this.children('i')
                var $controlBar = $container.children('#' + config.soundBarId);
                if($controlBar.hasClass('pt-on')){
                    // 开 设置为关
                    $controlBar.removeClass('pt-on');
                    $controlBar.addClass('pt-off');
                    $i.removeClass('icon-volume-o');
                    $i.addClass('icon-volume-mute-o');
                    var sourceDom = $container.find('#' + config.sourceId)[0];
                    sourceDom.volume = 0;
                }else{
                    $controlBar.removeClass('pt-off');
                    $controlBar.addClass('pt-on');
                    $i.removeClass('icon-volume-mute-o');
                    $i.addClass('icon-volume-o');
                    _this.setSounder($container, config);
                }
            });
        },
        show : function(config){
            var $html = this.getJQHtml(config);
            config.$container = $html;
            this.setEvent($html, config);
            var $container = $('#' + config.id);
            $container.html($html);
            if(config.isMuted){
                $html.find('audio').volume = 0;
            }else{
                var $text = $container.find('#' + config.textId);
                $html.find('audio').volume = config.soundSize;
                $text.text(parseInt(config.soundSize*100) + '%');
                this.setPositionBySoundSize(config.soundSize, config)
            }
        },
    }
    function init(config){
        // 验证config
        var isPass = configManage.validataConfig(config);
        if(!isPass){
            nsAlert('音频组件配置错误', 'error');
            return false;
        }
        configById[config.id] = {
            source : $.extend(true, {}, config),
            config : config,
        }
        // 设置config
        configManage.setConfig(config);
        // 初始化
        panel.show(config);
    }
    function play(playConfig){
        var config = configManage.getConfig(playConfig.id);
        if(config){
            var audioIdDom = document.getElementById(config.audioId);
            audioIdDom.play();
            var $sounder = $('#' + config.sourceId);
            $sounder.attr('src', playConfig.url);
        }else{
            nsAlert('未找到声音配置');
            console.error('未找到声音配置');
        }
    }
    return {
        init : init,
        play : play,
        configById : configById,
    }
})(jQuery)