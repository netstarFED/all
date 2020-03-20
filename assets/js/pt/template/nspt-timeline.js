NetstarTemplate.timeline = (function(){
    var configsById = {};
    var stateManage = {
        0 : '<i class="icon-clock"></i>',
        1 : '<i class="icon-clock"></i>',
        2 : '<i class="icon-clock"></i>',
        3 : '<i class="icon-clock"></i>',
        default : '<i class="icon-return"></i>',
    };
    var TEMPLATE = {
        line : '<ul class="timeline-list">'
                    + '<li v-for="(listData, index) in timeList" :class="{title:listData.nsIsIntervalData}">'
                        // 时间分割标题
                        + '<span class="flag" v-if="listData.nsIsIntervalData">{{listData.nsName}}</span>'
                        + '<div class="" v-else>'
                            + '<div class="time-mark" v-html="listData.nsStateIcon"></div>'
                            + '{{nsList}}'
                            + '<div class="pt-btn-group">'
                                + '<button class="pt-btn pt-btn-default" v-for="(btn, btnI) in btns" @click="click($event, btn, listData)">'
                                    + '{{btn.text}}'
                                + '</button>'
                            + '</div>'
                        + '</div>'
                    + '</li>'
                + '</ul>',
    }
    var configManage = {
        validConfig : function(config){
            return true;
        },
        setConfig : function(config){
        },
        getConfigById : function(id){
            var configs = configsById[id];
            if(configs){
                return configs.config;
            }else{
                nsAlert('没有找到config');
                console.error('没有找到config');
                return false;
            }
        },
        getVueConfigById : function(id){
            var configs = configsById[id];
            if(configs){
                return configs.vueConfig;
            }else{
                nsAlert('没有找到config');
                console.error('没有找到config');
                return false;
            }
        },
    }
    var common = {
        // 获取格式化的表达式
        getFormatListExpression : function(listExpression, config){
            var rex1 = /\{\{(.*?)\}\}/g;
            var rex2 = /\{\{(.*?)\}\}/;
            var str = listExpression;
            if(rex2.test(listExpression)){
                var strArr = listExpression.match(rex1);
                for(var i=0; i<strArr.length; i++){
                    var _str = strArr[i].match(rex2)[1];
                    if(config.timeField == _str){
                        _str = 'nsTime';
                    }
                    var conStr = '{{listData.' + _str + '}}';
                    str = str.replace(strArr[i], conStr);
                }
            }
            var $str = $(str);
            var attr = {
                ':ns-index' : 'listData.nsIndex',
                // ':class' : '[listData.nsStateIcon]',timeline-content
            };
            $str.attr(attr);
            str = $str.prop('outerHTML');
            return str;
        },
        // 获取格式化数据 timeList
        getFormatTimeList : function(timeList, config){
            var timeField = config.timeField;
            var timeFormat = config.timeFormat;
            var stateField = config.stateField;
            var timeInterval = config.timeInterval; // 时间分割 年 月 日
            var returnList = [];
            var indexDate = ''; // 当前时间 根据时间分割 年 月 日
            var timeIntervalFormat = 'DD';
            var timeIntervalName = '日';
            switch(timeInterval){
                case 'year':
                    timeIntervalFormat = 'YYYY';
                    timeIntervalName = "年";
                    break;
                case 'month':
                    timeIntervalFormat = 'MM';
                    timeIntervalName = "月";
                    break;
            }
            // 根据配置添加需要的数据
            for(var i=0; i<timeList.length; i++){
                var timeData = $.extend(true, {}, timeList[i]);
                var _indexDate = ''; // 当前年 月 日
                // 设置格式化时间
                if(typeof(timeData[timeField]) == "number"){
                    timeData.nsTime = moment(timeData[timeField]).format(timeFormat);
                    _indexDate = moment(timeData[timeField]).format(timeIntervalFormat);
                    // 根据状态设置样式字段
                    var state = timeData[stateField];
                    if(stateManage[state]){
                        timeData.nsStateIcon = stateManage[state];
                    }else{
                        timeData.nsStateIcon = stateManage.default;
                    }
                    if(indexDate !== _indexDate){
                        indexDate = _indexDate;
                        var timeIntervalObj = {
                            nsName : _indexDate + timeIntervalName,
                            nsIsIntervalData : true, // 是否添加的间隔数据
                            nsIndexDate : _indexDate,
                        }
                        returnList.push(timeIntervalObj);
                    }
                    timeData.nsIsIntervalData = false;
                    timeData.nsIndexDate = _indexDate;
                    timeData.nsIndex = i;
                    returnList.push(timeData);
                }else{
                    nsAlert('配置错误，没有找到时间字段');
                    console.error('配置错误，没有找到时间字段');
                    console.error(config);
                }
            }
            return returnList;
        },
        // 通过ajax获取时间轴数据
        getTimeListByAjax : function(config, callBackFunc){
            var ajaxConfig = $.extend(true, {}, config.ajax);
            ajaxConfig.plusData = {
                configId : config.id,
                callBackFunc : callBackFunc,
            };
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                var plusData = _ajaxConfig.plusData;
                var configId = plusData.configId;
                var _config = configManage.getConfigById(configId);
                if(res.success){
                    var data = res[_config.ajax.dataSrc];
                    if(typeof(plusData.callBackFunc) == "function"){
                        plusData.callBackFunc(data, _config);
                    }
                }else{
                    // ajax失败
                    console.error('ajax失败');
                }
            });
        },
    }
    function getData(config){
        var timeList = $.extend(true, [], config.timeList);
        var formatTimeList = common.getFormatTimeList(timeList, config);
        var data = {
            btns : config.btns,
            original : timeList,
            timeList : formatTimeList,
        }
        return data;
    }
    function getHtml(config){
        var html = TEMPLATE.line;
        var formatListExpression = common.getFormatListExpression(config.listExpression, config)
        html = html.replace('{{nsList}}', formatListExpression);
        return html;
    }
    function vueInit(config){
        var html = getHtml(config);
        var $container = $('#' + config.id);
        $container.html(html);
        var data = getData(config);
        configsById[config.id].vueConfig = new Vue({
            el: '#' + config.id,
            data: data,
            watch: {
                original : function(newList, oldList){
                    var timeList = common.getFormatTimeList(newList, config);
                    this.timeList = timeList;
                    config.timeList = $.extend(true, [], newList);
                },
            },
            methods: {
                click : function(ev, btn, listData){
                    var nsIndex = listData.nsIndex;
                    var original = this.original;
                    var _listData = $.extend(true, {}, original[nsIndex]);
                    if(typeof(btn.handler) == "function"){
                        btn.handler(_listData, nsIndex, this);
                    }
                },
                editTimeData : function(timeData, nsIndex){
                    if(typeof(timeData) == "object" && typeof(nsIndex) == "number"){
                        var original = $.extend(true, [], this.original);
                        original[nsIndex] = timeData;
                        this.original = original;
                    }else{
                        nsAlert('编辑的时间数据必须是对象,必须指出时间线位置');
                        console.error('编辑的时间数据必须是对象,必须指出时间线位置');
                    }
                },
                editTimeList : function(timeList){
                    if($.isArray(timeList)){
                        this.original = timeList;
                    }else{
                        nsAlert('编辑的时间线必须是数组');
                        console.error('编辑的时间线必须是数组');
                    }
                },
            },
            mounted: function(){
            }
        });
    }
    function editTimeData(timeData, nsIndex, configId){
        var vueConfig = configManage.getVueConfigById(configId);
        if(vueConfig){
            vueConfig.editTimeData(timeData, nsIndex);
        }
    }
    function editTimeList(timeList, configId){
        var vueConfig = configManage.getVueConfigById(configId);
        if(vueConfig){
            vueConfig.editTimeList(timeList);
        }
    }
    function refreshByAjax(configId){
        var config = configManage.getConfigById(configId);
        common.getTimeListByAjax(config, function(data, _config){
            editTimeList(data, _config.id);
        });
    }
    // 初始化
    function init(config){
        // 验证配置是否通过
        var isPass = configManage.validConfig(config);
        if(!isPass){
            return isPass;
        }
        // 定义config
        configsById[config.id] = {
            source : $.extend(true, {}, config),
            config : config,
        };
        // 设置config
        configManage.setConfig(config);
        common.getTimeListByAjax(config, function(data, _config){
            _config.sourceTimeList = $.extend(true, [], data);
            _config.timeList = data;
            vueInit(_config);
        });
    }
    return {
        init : init,
        getConfigById : configManage.getConfigById,
        editTimeData : editTimeData,
        editTimeList : editTimeList,
        refreshByAjax : refreshByAjax,
    }
})(jQuery)