var nsManageKeyboardObj = {
    
};//存放界面快捷键数据
var vueButtonComponent = (function($){
    var navConfig = {};//运行中的配置
    var originalNavConfig = {};//保留原始配置
    var jsonBtn = {};//根据按钮id存放数据
    var template = {
        simple:'<button type="button" class="pt-btn pt-btn-default" :id="item.id" :isoperatormain="item.isOperatorMain" :issendpageparams="item.isSendPageParams" :functionclass="item.functionClass" :requestsource="item.requestSource" :isclosewindow="item.isCloseWindow" :defaultmode="item.defaultMode" :ismaindbaction="item.isMainDbAction" :fid="index" :disabled="idsdata[item.id].disabled" :class="[{\'hidden\':idsdata[item.id].hidden},idsdata[item.id].state,computedShortcutKey(item)]" :data-toggle="computedTooltip(item.id)" :title="computedTooltipTitle(item)" @click="onclick(item,$event)">'
                +'<i v-if="item.isShowIcon" :class="computedIcon(item)"></i>'
                +'<span v-if="item.isShowText">{{item.text}}</span>'
                +'<span v-if="item.shortcutKey" :class="computedShortcutKeyBySpan(item)" v-text="computedShortcutKeyText(item)">{{item.cutkey}}</span>'
            +'</button>'
            +'<div v-if="item.separator" class="pt-btn-separator"></div>',
        memoryDropdown:'<div class="pt-btn-group">'
                            +'<button type="button" class="pt-btn pt-btn-default dropdown-toggle" data-toggle="dropdown">{{item.text}}'
                                +'<span class="caret"></span>'
                            +'</button>'
                            +'<ul class="dropdown-menu" role="menu">'
                                +'<li v-for="(drop,sub) in item.subdata" @click="onMemoryDropclick(drop,$event)" :id="drop.id" :fid="index" :optionid="sub">'
                                    +'<a href="javascript:void(0);">{{drop.text}}</a>'
                                +'</li>'
                                //+'<li v-if="drop.separator" class="btn-dropdown-separator"></li>'
                            +'</ul>'
                        +'</div>'
                        +'<div v-if="item.separator" class="pt-btn-separator"></div>',
        memoryDropdownShow:'<div class="pt-btn-group">'
                            +'<div class="btn-dropdown dropdown-saveCustom-panel">'
                                +'<div class="pt-btn-group">'
                                    +'<button class="pt-btn pt-btn-default" ns-type="event" @click="memoryDropdownEvent(item,$event)">'
                                        //+'<i class="fa-print"></i>'
                                        +'<span>{{item.text}}</span>'
                                    +'</button>'
                                    +'<button class="pt-btn pt-btn-default btn-icon" ns-type="drop"> <i class="fa-caret-down" @click="memoryDropdownShowClick(item,$event)"></i>'
                                    +'</button>'
                                +'</div>'
                                +'<ul class="dropdown-menu dropdown-saveCustom-ul" :class="[{\'open\':idsdata[item.id].expand}]">'
                                    +'<li class="dropdown-item" v-for="(dropdown,dindex) in item.subdata">'
                                        +'<button class="pt-btn pt-btn-default" :id="dropdown.id" :fid="index" :optionid="dindex" @click="memoryDropdownBtnClick($event)">'
                                            //+'<i class="fa-print"></i>'
                                            +'<span>{{dropdown.text}}</span>'
                                        +'</button>'
                                    +'</li>'
                                    //+'<li v-if="dropdown.separator" class="btn-dropdown-separator"></li>'
                                +'</ul>'
                            +'</div>'
                        +'</div>'
                        +'<div v-if="item.separator" class="pt-btn-separator"></div>',
    };
    function initComponent(){
        return{
            'btnComponent':{
                template:'<div class="pt-btn-group" v-if="data.length">'
                                +'<template v-for="(item,index) in data" :key="index">'
                                    +'<template v-if="item.dropdownType === \'memoryDropdown\' ">'
                                        +template.memoryDropdown
                                    +'</template>'
                                    +'<template v-else-if="item.dropdownType === \'memoryDropdownShow\'">'
                                        +template.memoryDropdownShow
                                    +'</template>'
                                    +'<template v-else>'
                                        +template.simple
                                    +'</template>'
                                +'</template>'
                            +'</div>',
                data:function(){
                    return{
                        data:navConfig.btns,
                        idsdata:jsonBtn,
                        callbackObj:navConfig.callback,
                    }
                },
                computed:{
                    computedShortcutKeyText(_item){
                        return function(_item){
                            var shortcutKey = _item.shortcutKey.split('+');
                            var textStr = _item.shortcutKey;
                            if(shortcutKey.length == 2){
                                textStr = shortcutKey[1];
                            }
                            return '('+textStr+')';
                        }
                    },
                    computedShortcutKeyBySpan(_item){
                        return function(_item){
                            var shortcutKeyClassStr = '';
                            var altReg = /^alt(\+[a-zA-z0-9]+){0,3}$/i;
                            if(altReg.test(_item.shortcutKey)){
                                shortcutKeyClassStr = 'pt-shortcutkey-alt';
                            }
                            return shortcutKeyClassStr;
                        }
                    },
                    computedShortcutKey(_item){
                        return function(_item){
                            var shortcutKeyClassStr = '';
                            var ctrlReg = /^ctrl(\+[a-zA-z0-9]+){0,3}$/i;
                            var altReg = /^alt(\+[a-zA-z0-9]+){0,3}$/i;
                            if(ctrlReg.test(_item.shortcutKey)){
                                shortcutKeyClassStr = 'pt-shortcutkey-ctrl';
                                 var shortcutKey = _item.shortcutKey.split('+');  
                                 var combineSecondKey = shortcutKey[1].toLocaleLowerCase(); 
                                 if(combineSecondKey == 'shift' || combineSecondKey == 'alt'){
                                    shortcutKeyClassStr += '-'+combineSecondKey;
                                 } 
                                 if(shortcutKey.length > 2){
                                    if(shortcutKey[2].toLocaleLowerCase() == 'alt'){
                                        shortcutKeyClassStr += '-alt';
                                    }
                                 }  
                            }
                            if(altReg.test(_item.shortcutKey)){
                                shortcutKeyClassStr = 'pt-shortcutkey-alt';
                            }
                            return shortcutKeyClassStr;
                        }
                    },
                    computedTooltip(_id){
                        return function(_id){
                            var data = this.idsdata[_id];
                            var isTooptip = false;//默认不提示
                            if(typeof(data)=='object'){
                                isTooptip = typeof(data.tooltip)=='boolean' ? data.tooltip : false;
                            }
                            if(isTooptip){
                                var tooltipTitle = data.text;
                                if(data.tooltipTitle){
                                    //自定义了title
                                    tooltipTitle = data.tooltipTitle;
                                } 
                                return 'tooltip';
                            }
                        }
                    },//提示文字
                    computedTooltipTitle(_item){
                        return function(_item){
                            return _item.tooltipTitle ? _item.tooltipTitle : _item.text;
                        }
                    },//添加标题
                    computedIcon:function(_item){
                        return function(_item){
                            var iconCls = '';
                            if(_item.iconCls){
                                //自定义的icon图标
                                iconCls = _item.iconCls;
                            }
                            return iconCls;
                        }
                    },//输出icon
                    /*三种模式的输出*/ 
                },//计算属性
                watch:{

                },//侦听属性
                mounted(){
                    if(navConfig.package){
                        nsManageKeyboardObj[navConfig.package].vueConfig = this;
                    }
                },
                filters:{

                },//过滤器
                methods:{
                    onclick:function(item,event){
                        var _this = this;
                        if(typeof(item.handler)=='function'){ 
                            item.handler({
                                data:item,
                                event:event,
                                dialogBeforeHandler:item.dialogBeforeHandler,
                                ajaxBeforeHandler:item.ajaxBeforeHandler,
                                ajaxAfterHandler:item.ajaxAfterHandler,
                                loadPageHandler:item.loadPageHandler,
                                closePageHandler:item.closePageHandler,
                                getOperateData:item.getOperateData,
                                dataImportComplete:item.dataImportComplete,
                                setBtnDisable:function(){
                                    _this.$set(_this.idsdata[item.id],"state",'loading');
                                    _this.$set(_this.idsdata[item.id],"disabled",true);
                                },
                                setBtnAbled:function(){
                                    _this.$set(_this.idsdata[item.id],"state",'');
                                    _this.$set(_this.idsdata[item.id],"disabled",false);
                                },

                            });
                        }
                    },
                    onMemoryDropclick:function(item,event){
                       // console.log('drop')
                        //console.log(event)
                        var _this = this;
                        if(typeof(item.handler)=='function'){
                            item.handler({
                                data:item,
                                event:event,
                                dialogBeforeHandler:item.dialogBeforeHandler,
                                ajaxBeforeHandler:item.ajaxBeforeHandler,
                                ajaxAfterHandler:item.ajaxAfterHandler,
                                loadPageHandler:item.loadPageHandler,
                                closePageHandler:item.closePageHandler,
                            });
                        }
                    },
                    memoryDropdownEvent:function(data,event){
                        var item = data.subdata[item.defaultIndex];
                        var handler = item.handler;
                        if(typeof(handler)=='function'){
                            handler({
                                data:item,
                                event:event,
                                dialogBeforeHandler:item.dialogBeforeHandler,
                                ajaxBeforeHandler:item.ajaxBeforeHandler,
                                ajaxAfterHandler:item.ajaxAfterHandler,
                                loadPageHandler:item.loadPageHandler,
                                closePageHandler:item.closePageHandler,
                            });
                        }
                       // console.log(item)
                    },
                    memoryDropdownShowClick:function(item,event){
                        var isExpand = typeof(this.idsdata[item.id].expand)=='boolean' ? this.idsdata[item.id].expand : false;
                        //console.log(event);
                        this.$set(this.idsdata[item.id],"expand",!isExpand);
                        if(typeof(item.handler)=='function'){
                            item.handler({
                                data:item,
                                event:event,
                                dialogBeforeHandler:item.dialogBeforeHandler,
                                ajaxBeforeHandler:item.ajaxBeforeHandler,
                                ajaxAfterHandler:item.ajaxAfterHandler,
                                loadPageHandler:item.loadPageHandler,
                                closePageHandler:item.closePageHandler,
                            });
                        }
                    },
                    memoryDropdownBtnClick:function(event){
                        //console.log(event);
                    },
                }
            }
        }
    }//初始化组件
    function init(_navConfig){
        //开发模式下需要进行验证
        //验证配置参数 验证错误则不执行
        function configValidate(_navConfig){
            var isValid = true;
            //整体参数验证
            var validArr =
                [
                    ['id', 'string', true], 
                    ['btns', 'array', true], 
                ];
            isValid = nsDebuger.validOptions(validArr, _navConfig);
            return isValid;
        }
        if(configValidate(_navConfig) == false){
            nsalert('配置文件验证失败', 'error');
            console.error('配置文件验证失败');
            console.error(_navConfig);
            return false;
        }
        originalNavConfig = _navConfig;
        navConfig = $.extend(true,{},_navConfig);
        /*
            id          容器id
            pageId      页面id   
            btns        按钮
        */
        navConfig.$container = $('#'+navConfig.id);//容器id
        navConfig.$container.html('<vue-button></vue-button>');
        if(navConfig.package){
            //定义了包名
            nsManageKeyboardObj[navConfig.package] = {};
        }
        //设置默认值
        function setDefault(){
            var shortcutArray = [];
            var shortcutObject = {};
            for(var btnI=0; btnI<navConfig.btns.length; btnI++){
                var btnData = navConfig.btns[btnI];
                switch(btnData.dropdownType){
                    case 'memoryDropdown':
                    case 'memoryDropdownShow':
                        if($.isArray(btnData.subdata)){
                            //是数组合法
                            for(var dropI=0; dropI<btnData.subdata.length; dropI++){
                                var dropdownData = btnData.subdata[dropI];
                                if(typeof(dropdownData.id)=='undefined'){
                                    //console.warn(btnData);
                                    //console.log('id未定义')
                                    //id未定义的生成随机id
                                    dropdownData.id = 'btn-default-'+Math.floor(Math.random()*10000000000+1);
                                }
                                dropdownData.isShowIcon = typeof(dropdownData.isShowIcon)=='boolean' ? dropdownData.isShowIcon : true;
                                dropdownData.isShowText = typeof(dropdownData.isShowText)=='boolean' ? dropdownData.isShowText : true;
                                jsonBtn[dropdownData.id] = dropdownData;

                                if(dropdownData.shortcutKey){
                                    //快捷键
                                    shortcutArray.push(dropdownData.shortcutKey);
                                    shortcutObject[dropdownData.shortcutKey] = dropdownData;
                                }
                                if(typeof(dropdownData.handler)=='function'){
                                    if(typeof(navConfig.callback)=='object'){
                                        for(var callback in navConfig.callback){
                                            dropdownData[callback] = navConfig.callback[callback];
                                        }
                                    }
                                }

                            }   
                            if(typeof(btnData.defaultIndex)=='number'){
                                btnData.text = btnData.subdata[btnData.defaultIndex].text;
                                btnData.id = btnData.subdata[btnData.defaultIndex].id;
                            }
                        }else{
                            //console.warn(btnData);
                            //console.warn('subdata未定义');
                        }
                        break;
                    default:
                        if(typeof(btnData.id)=='undefined'){
                            //console.warn(btnData);
                            //console.log('id未定义')
                            //id未定义的生成随机id
                            btnData.id = 'btn-default-'+Math.floor(Math.random()*10000000000+1);
                        }
                        if(btnData.shortcutKey){
                            //快捷键
                            shortcutArray.push(btnData.shortcutKey);
                            shortcutObject[btnData.shortcutKey] = btnData;
                        }
                        if(typeof(btnData.handler)=='function'){
                            if(typeof(navConfig.callback)=='object'){
                                for(var callback in navConfig.callback){
                                    btnData[callback] = navConfig.callback[callback];
                                }
                            }
                        }
                        btnData.isShowIcon = typeof(btnData.isShowIcon)=='boolean' ? btnData.isShowIcon : true;
                        btnData.isShowText = typeof(btnData.isShowText)=='boolean' ? btnData.isShowText : true;
                        jsonBtn[btnData.id] = btnData;
                        break;
                }
            }
            if(!$.isEmptyObject(shortcutObject) && navConfig.package){
                nsManageKeyboardObj[navConfig.package].data = shortcutObject;
            }
        }
        setDefault();
        var components = initComponent();
        var vueBtnFn = new Vue({
            el: '#'+navConfig.id,
            data:{
                id:navConfig.id,
                config:navConfig
            },
            components:{
                'vue-button':components.btnComponent
            },
            computed:{

            },//计算属性
            watch:{

            },//侦听属性
            filters:{

            },//过滤器
            methods:{
                
            },//实例方法
            created:function(){

            },//在实例创建完成后被立即调用，完成初始化操作
            mounted:function(){
                if(!$.isEmptyObject(nsManageKeyboardObj[navConfig.package])){
                    if(nsManageKeyboardObj[navConfig.package].data){
                        vueButtonComponent.bindKeydownHandler(navConfig.package);
                    }
                }
                /*function documentKeydownHandler(evt){
                    console.log(evt);
                }
                $(document).off('keydown',documentKeydownHandler);
                $(document).on('keydown',documentKeydownHandler);*/
            },//el挂载到Vue实例上了，开始业务逻辑操作
            beforeDestroy:function(){

            },//实例销毁之前调用
            /*render:function(){

            },//渲染函数创建虚拟dom*/
        })
    }
    function unbindKeydownHandler(packageName){
        //找到当前要解绑的id 通过id找到其索引 把其相关配置解绑
        if(nsManageKeyboardObj[packageName]){
            var currentkeyboard = nsManageKeyboardObj[packageName].data;
            for(var keyI in currentkeyboard){
                var keyJson = currentkeyboard[keyI];
                var shortcutKey = keyJson.shortcutKey;
                hotkeys.unbind(shortcutKey);//解绑快捷键
            }
        }
    }//解绑
    function bindKeydownHandler(packageName){
        if(nsManageKeyboardObj[packageName]){
            var currentkeyboard = nsManageKeyboardObj[packageName].data;
            var currentVueConfig = nsManageKeyboardObj[packageName].vueConfig;
            for(var keyI in currentkeyboard){
                var keyJson = currentkeyboard[keyI];
                var shortcutKey = keyJson.shortcutKey;
                hotkeys(shortcutKey,keyJson,function(event,handler,scope){
                    event.preventDefault();
                    var item = handler.option; 
                    if(typeof(item.handler)=='function'){
                        item.handler({
                            data:item,
                            event:event,
                            dialogBeforeHandler:item.dialogBeforeHandler,
                            ajaxBeforeHandler:item.ajaxBeforeHandler,
                            ajaxAfterHandler:item.ajaxAfterHandler,
                            loadPageHandler:item.loadPageHandler,
                            closePageHandler:item.closePageHandler,
                            setBtnDisable:function(){
                                currentVueConfig.$set(currentVueConfig.idsdata[item.id],"state",'loading');
                                currentVueConfig.$set(currentVueConfig.idsdata[item.id],"disabled",true);
                            },
                            setBtnAbled:function(){
                                currentVueConfig.$set(currentVueConfig.idsdata[item.id],"state",'');
                                currentVueConfig.$set(currentVueConfig.idsdata[item.id],"disabled",false);
                            }
                        });
                    }else{
                        nsalert('未绑定方法');
                        console.warn(keyJson);
                        console.warn(handler);
                    }
                })
            }
        }
    }//给当前活动窗口的按钮绑定快捷键
    function unbindShortcutKeyByAll(){
        for(var packageName in nsManageKeyboardObj){
            vueButtonComponent.unbindKeydownHandler(packageName);
        }
    }
    return {
        init:init,
        jsonBtn:jsonBtn,
        bindKeydownHandler:bindKeydownHandler,
        unbindKeydownHandler:unbindKeydownHandler,
        unbindShortcutKeyByAll:unbindShortcutKeyByAll,
    }
})(jQuery)