NetstarComponent.historylist = (function($){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
            }
            if(isPass){
                if($('#' + config.id).length == 0){
                    isPass = false;
                }
            }
            if(isPass){
                if(!$.isArray(config.list) || config.list.length == 0){
                    console.error('没有历史记录');
                    isPass = false;
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                stripNum : 5,
                defaultPage : 0,
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        getListByStripNum : function(config){
            var souList = config.list;
            var list = [];
            var stripNum = config.stripNum;
            var pageNum = -1;
            for(var i=0; i<souList.length; i++){
                if(i%stripNum === 0){
                    pageNum ++;
                    list[pageNum] = [];
                }
                list[pageNum].push(souList[i]);
            }
            return list;
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            config.$container = $('#' + config.id);
            // 设置config的list根据单页显示数量
            config.sourceList = $.extend(true, [], config.list);
            config.list = this.getListByStripNum(config);
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
    var panelManage = {
        TEMPLATE : {
            listContent : '<div class="record-list pt-dropdown-pager">'
                            + '<ul>'
                                + '<li class="record-block-item" v-for="(data,index) in list[pageIndex]">'
                                    + '<div class="record-block-item-left">'
                                        + '<div class="title">{{data.title}}</div>'
                                        + '<div class="time">{{data.time}}</div>'
                                    + '</div>'
                                    + '<div class="record-block-item-right">'
                                        + '<div class="tag">{{data.userName}}</div>'
                                    + '</div>'
                                + '</li>'
                            + '</ul>'
                            + '<div class="pt-pager">'
                                + '<div class="pt-form pt-form-inline pt-form-normal">'
                                    + '<div class="pt-form-body">'
                                        + '<div class="pt-page-turn">'
                                            + '<div class="pt-btn-group">'
                                                + '<button class="pt-btn pt-btn-icon" @click="firstPage">'
                                                    + '<i class="icon-step-backward-o"></i>'
                                                + '</button>'
                                                + '<button class="pt-btn pt-btn-icon" @click="prevPage" :disabled="pageIndex===0">'
                                                    + '<i class="icon-arrow-left-o"></i>'
                                                + '</button>'
                                            + '</div>'
                                            + '<div class="pt-form-group">'
                                                + '<div class="pt-input-group">'
                                                    + '<input class="pt-form-control" v-model="currentPage" @blur="pageIndexBlur">'
                                                + '</div>'
                                            + '</div>'
                                            + '<div class="pt-btn-group">'
                                                + '<button class="pt-btn pt-btn-icon" @click="nextPage" :disabled="pageIndex===(list.length-1)">'
                                                    + '<i class="icon-arrow-right-o"></i>'
                                                + '</button>'
                                                + '<button class="pt-btn pt-btn-icon" @click="lastPage">'
                                                    + '<i class="icon-step-forward-o"></i>'
                                                + '</button>'
                                            + '</div>'
                                        + '</div>'
                                    + '</div>'
                                + '</div>'
                            + '</div>'
                        + '</div>',
            listContent2 : '<div class="record-block-item">'
                            + '<div class="pt-upload-list-header">'
                            + '</div>'
                            + '<div class="pt-upload-list-body">'
                                + '<ul class="">'
                                    + '<li v-for="(data,index) in list[pageIndex]" class="pt-upload-list-item">'
                                        + '<div class="pt-list-table">'
                                            // 图标
                                            + '<div class="pt-upload-thumbs">'
                                                + '<i class="icon-file-o"></i>'
                                            + '</div>'
                                            // 内容
                                            + '<div class="pt-upload-names">'
                                                + '<span>{{data.title}}</span>'
                                                + '<span>{{data.userName}}</span>'
                                            + '</div>'
                                        + '</div>'
                                    + '</li>'
                                + '</ul>'
                            + '</div>'
                            + '<div class="pt-upload-list-footer">'
                                + '<div class="pt-page-turn">'
                                    + '<div class="pt-btn-group">'
                                        + '<button class="pt-btn pt-btn-link" @click="firstPage">'
                                            + '<span>首页</span>'
                                        + '</button>'
                                        + '<button class="pt-btn pt-btn-icon pt-btn-link" @click="prevPage" :disabled="pageIndex===0">'
                                            + '<i class="fa fa-chevron-left"></i>'
                                        + '</button>'
                                    + '</div>'
                                    + '<div class="pt-form-group">'
                                        + '<label for="name" class="pt-control-label">第</label>'
                                        + '<div class="pt-input-group">'
                                            + '<input type="text" class="pt-form-control" placeholder="" v-model="currentPage" @blur="pageIndexBlur">'
                                            + '<div class="pt-input-group-btn">'
                                                + '<button class="pt-btn pt-btn-default pt-btn-icon" @click="showPageSelectPanel" ref="selectPageBtn">'
                                                    + '<i class="icon-arrow-down-o"></i>'
                                                + '</button>'
                                            + '</div>'
                                            + '<div class="pt-input-group-select" :class="{hide:!isShowPageSelectPanel}">'
                                                + '<ul>'
                                                    + '<li v-for="(data,index) in list" :class="{active:currentPage == (index+1)}" @click="selectPageNum($event, index)">{{index+1}}</li>'
                                                + '</ul>'
                                            + '</div>'
                                        + '</div>'
                                        + '<label for="name" class="pt-control-label">页</label>'
                                    + '</div>'
                                    + '<div class="pt-btn-group">'
                                        + '<button class="pt-btn pt-btn-icon pt-btn-link" @click="nextPage" :disabled="pageIndex===(list.length-1)">'
                                            + '<i class="fa fa-chevron-right"></i>'
                                        + '</button>'
                                        + '<button class="pt-btn pt-btn-link" @click="lastPage">'
                                            + '<span>尾页</span>'
                                        + '</button>'
                                    + '</div>'
                                + '</div>'
                            + '</div>'
                        + '<div>',
        },
        getHtml : function(){
            var html = this.TEMPLATE.listContent;
            return html;
        },
        getData : function(config){
            var data = {
                list : config.list,
                pageIndex : config.defaultPage,
                isShowPageSelectPanel : false,
                currentPage : 1,
            };
            return data;
        },
        show : function(config){
            var html = this.getHtml(config);
            var containerId = config.id;
            var $container = config.$container;
            $container.html(html);
            var vueData = this.getData(config);
            new Vue({
                el: '#' + containerId,
                data: vueData,
                watch: {
                    currentPage : function(value, oldVal){
                        value = Number(value);
                        if(isNaN(value) || value<1 || value>this.list.length){
                        }else{
                            this.pageIndex = value - 1;
                        }
                    }
                },
                methods: {
                    // 首页
                    firstPage : function(){
                        this.currentPage = 1;
                    },
                    // 尾页
                    lastPage : function(){
                        this.currentPage = this.list.length;
                    },
                    // 上一页
                    prevPage : function(){
                        this.currentPage --;
                    },
                    // 下一页
                    nextPage : function(){
                        this.currentPage ++;
                    },
                    // 页码输入框失去焦点 value显示当前页码
                    pageIndexBlur : function(){
                        this.currentPage = this.pageIndex + 1;
                    },
                    showPageSelectPanel : function(){
                        this.isShowPageSelectPanel = !this.isShowPageSelectPanel;
                    },
                    selectPageNum : function(ev, index){
                        this.currentPage = index + 1;
                        this.pageIndex = index;
                    },
                },
                mounted: function(){
                    if(typeof(config.completeHandler) == "function"){
                        config.completeHandler(config);
                    }
                }
            });
        }
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
        panelManage.show(config);
    }
    return {
        init : init,
    }
})(jQuery)