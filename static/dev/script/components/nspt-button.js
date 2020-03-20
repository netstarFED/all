var nsManageKeyboardObj = {
    
};//存放界面快捷键数据
var nsManageBtnsConfigs = {
    
};//存放组件配置
var vueButtonComponent = (function($){
    var btnsNumber = 0;
    var navConfig = {};//运行中的配置
    var originalNavConfig = {};//保留原始配置
    var jsonBtn = {};//根据按钮id存放数据
    var template = {
        simple:'<button type="button" class="pt-btn pt-btn-default" :ns-field="item.functionConfig.englishName" :id="item.id" :isoperatormain="item.isOperatorMain" :issendpageparams="item.isSendPageParams" :functionclass="item.functionClass" :requestsource="item.requestSource" :isclosewindow="item.isCloseWindow" :defaultmode="item.defaultMode" :ismaindbaction="item.isMainDbAction" :fid="index" :disabled="idsdata[item.id].disabled" :class="[{\'hidden\':idsdata[item.id].hidden},idsdata[item.id].state,computedShortcutKey(item)]" :data-toggle="computedTooltip(item.id)" :title="computedTooltipTitle(item)" @click="onclick(item,$event)">'
                +'<i v-if="item.isShowIcon" :class="computedIcon(item)"></i>'
                +'<span v-if="item.isShowText">{{item.text}}</span>'
                +'<span v-if="item.shortcutKey" :class="computedShortcutKeyBySpan(item)" v-text="computedShortcutKeyText(item)">{{item.cutkey}}</span>'
            +'</button>'
            +'<div v-if="item.separator" class="pt-btn-separator"></div>',
        memoryDropdown:'<div class="pt-btn-dropdown pt-btn-dropdown-senior pt-btn">'
                            +'<div class="pt-btn-group pt-btn-group-compact">'
                                +'<button class="pt-btn pt-btn-default" :id="item.id" :isoperatormain="item.isOperatorMain" :issendpageparams="item.isSendPageParams" :functionclass="item.functionClass" :requestsource="item.requestSource" :isclosewindow="item.isCloseWindow" :defaultmode="item.defaultMode" :disabled="item.disabled" :ismaindbaction="item.isMainDbAction" :fid="index" :title="computedTooltipTitle(item)" @click="onclick(item,$event)"><span>{{item.text}}</span></button>'
                                +'<button class="pt-btn pt-btn-default pt-btn-icon" @click="onShowclick(item,$event)">'
                                    +'<i class="icon-arrow-down-o"></i>'
                                +'</button>'
                            +'</div>'
                            +'<div class="pt-btn-dropdown-panel hide">'
                                +'<div class="pt-btn-group">'
                                    +'<button class="pt-btn pt-btn-default" v-for="(drop,sub) in item.subdata" @click="onMemoryDropclick(drop,$event)" :id="drop.id" :fid="index" :disabled="drop.disabled" :optionid="sub"><span>{{drop.text}}</span></button>'
                                +'</div>'
                            +'</div>'
                        +'</div>',
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
                                        +'<button class="pt-btn pt-btn-default" :id="dropdown.id" :fid="index" :disabled="dropdown.disabled" :optionid="dindex" @click="memoryDropdownBtnClick($event)">'
                                            //+'<i class="fa-print"></i>'
                                            +'<span>{{dropdown.text}}</span>'
                                        +'</button>'
                                    +'</li>'
                                    //+'<li v-if="dropdown.separator" class="btn-dropdown-separator"></li>'
                                +'</ul>'
                            +'</div>'
                        +'</div>'
                        +'<div v-if="item.separator" class="pt-btn-separator"></div>',
        state : '<div class="pt-print" :ns-timestamp="vueConfigs[index].timestamp"  :disabled="idsdata[item.id].disabled">'
                    + '<div class="pt-btn-group">'
                        +'<template v-if="vueConfigs[index].showType === \'default\'">'
                            + '<div class="pt-btn pt-btn-default" type="button" @click="stateBtnClick($event,index,vueConfigs[index],item)">'
                                + '<i class="icon-print-o"></i>'
                                + '<span>{{vueConfigs[index].showText}}</span>'
                                + '<i class=""></i>'
                            + '</div>'
                            + '<div class="pt-btn pt-btn-default pt-btn-icon" @click="stateSwitchClick($event,index,vueConfigs[index],item)">'
                                + '<i :class="vueConfigs[index].dropBtnState"></i>'
                            + '</div>'
                        +'</template>'
                        +'<template v-else-if="vueConfigs[index].showType === \'check\'">'
                            + '<div class="pt-btn pt-btn-success" type="button" @mouseover="stateMouseover($event,index,vueConfigs[index],item)" @mouseout="stateMouseout($event,index,vueConfigs[index],item)">'
                                + '<i class="icon-print-o"></i>'
                                + '<span>{{vueConfigs[index].showText}}</span>'
                                + '<i class="icon-check"></i>'
                            + '</div>'
                        +'</template>'
                        +'<template v-else-if="vueConfigs[index].showType === \'warn\'">'
                            + '<div class="pt-btn pt-btn-danger" type="button" @mouseover="stateMouseover($event,index,vueConfigs[index],item)" @mouseout="stateMouseout($event,index,vueConfigs[index],item)">'
                                + '<i class="icon-print-o"></i>'
                                + '<span>{{vueConfigs[index].showText}}</span>'
                                + '<i class="icon-warning-o"></i>'
                            + '</div>'
                            // + '<div class="pt-btn pt-btn-default pt-btn-icon" @click="stateSwitchClick($event,index,vueConfigs[index],item)">'
                            //     + '<i class="icon-arrow-down-o"></i>'
                            // + '</div>'
                        +'</template>'
                        +'<template v-else-if="vueConfigs[index].showType === \'loading\'">'
                            + '<div class="pt-btn pt-btn-default pt-btn-loading" type="button" @click="stateBtnClickCancel($event,index,vueConfigs[index],item)">'
                                + '<i class="icon-print-o"></i>'
                                + '<span>{{vueConfigs[index].showText}}</span>'
                                + '<i class=""></i>'
                                + '<div class="btn-loading" :style="vueConfigs[index].loadingStyle">'
                                    + '<span>{{vueConfigs[index].loadingText}}</span>'
                                + '</div>'
                            + '</div>'
                        +'</template>'
                    + '</div>'
                    +'<template v-if="vueConfigs[index].dropdownState === \'list\'">'
                        + '<div class="pt-print-dropdown" :class={hide:!vueConfigs[index].isShowDropdown}>'
                            + '<div class="pt-list">'
                                + '<ul class="pt-list-group">'
                                    +'<template v-for="(dropObj,subIndex) in vueConfigs[index].dropdownSubdata">'
                                        + '<li class="pt-list-item" :class="{current:dropObj.isCurrent}" @click="stateDropClick($event,index,vueConfigs[index],item,subIndex,dropObj)">'
                                            + '<div class="list-check">'
                                                + '<i class="icon-check-circle"></i>'
                                            + '</div>'
                                            + '<span class="list-text">{{dropObj.title}}</span>'
                                            + '<span class="list-text">{{dropObj.info}}</span>'
                                            + '<div class="pt-btn-group">'
                                                + '<button class="pt-btn pt-btn-default pt-btn-icon" @click="stateDropSet($event,index,vueConfigs[index],item,subIndex,dropObj)">'
                                                    + '<i class="icon-setting-o"></i>'
                                                + '</button>'
                                                + '<button class="pt-btn pt-btn-default pt-btn-icon" @click="stateDropPrint($event,index,vueConfigs[index],item,subIndex,dropObj)">'
                                                    + '<i class="icon-print-o"></i>'
                                                + '</button>'
                                            + '</div>'
                                        + '</li>'
                                    +'</template>'
                                + '</ul>'
                            + '</div>'
                        + '</div>'
                    +'</template>'
                    +'<template v-else-if="vueConfigs[index].dropdownState === \'info\'">'
                        + '<div class="pt-print-dropdown" :class={hide:!vueConfigs[index].isShowDropdown}>'
                            + '<div class="text-panel">'
                                + '<p>{{vueConfigs[index].infoTitle}}</p>'
                                + '<p class="text-warning">{{vueConfigs[index].infoContent}}</p>'
                            + '</div>'
                        + '</div>'
                    +'</template>'
                + '</div>',
            importAndExport : '<div class="pt-print" :ns-timestamp="vueConfigs[index].timestamp"  :disabled="idsdata[item.id].disabled">'
                        + '<div class="pt-btn-group">'
                            +'<template v-if="vueConfigs[index].showType === \'default\'">'
                                + '<div class="pt-btn pt-btn-default" type="button" @click="importAndExportHandler($event,index,vueConfigs[index],item,\'click\')">'
                                    + '<i class="icon-print-o"></i>'
                                    + '<span>{{vueConfigs[index].showText}}</span>'
                                    + '<i class=""></i>'
                                + '</div>'
                                + '<div class="pt-btn pt-btn-default pt-btn-icon" @click="importAndExportHandler($event,index,vueConfigs[index],item,\'switch\')">'
                                    + '<i :class="vueConfigs[index].dropBtnState"></i>'
                                + '</div>'
                            +'</template>'
                            +'<template v-else-if="vueConfigs[index].showType === \'check\'">'
                                + '<div class="pt-btn pt-btn-success" type="button" @mouseover="importAndExportHandler($event,index,vueConfigs[index],item,\'mouseover\')" @mouseout="importAndExportHandler($event,index,vueConfigs[index],item,\'mouseout\')">'
                                    + '<i class="icon-print-o"></i>'
                                    + '<span>{{vueConfigs[index].showText}}</span>'
                                    + '<i class="icon-check"></i>'
                                + '</div>'
                            +'</template>'
                            +'<template v-else-if="vueConfigs[index].showType === \'warn\'">'
                                + '<div class="pt-btn pt-btn-danger" type="button" @mouseover="importAndExportHandler($event,index,vueConfigs[index],item,\'mouseover\')" @mouseout="importAndExportHandler($event,index,vueConfigs[index],item,\'mouseout\')">'
                                    + '<i class="icon-print-o"></i>'
                                    + '<span>{{vueConfigs[index].showText}}</span>'
                                    + '<i class="icon-warning-o"></i>'
                                + '</div>'
                            +'</template>'
                            +'<template v-else-if="vueConfigs[index].showType === \'loading\'">'
                                + '<div class="pt-btn pt-btn-default pt-btn-loading" type="button" @click="importAndExportHandler($event,index,vueConfigs[index],item,\'clickCancel\')">'
                                    + '<i class="icon-print-o"></i>'
                                    + '<span>{{vueConfigs[index].showText}}</span>'
                                    + '<i class=""></i>'
                                    + '<div class="btn-loading" :style="vueConfigs[index].loadingStyle">'
                                        + '<span>{{vueConfigs[index].loadingText}}</span>'
                                    + '</div>'
                                + '</div>'
                            +'</template>'
                        + '</div>'
                        +'<template v-if="vueConfigs[index].dropdownState === \'list\'">'
                            + '<div class="pt-print-dropdown" :class={hide:!vueConfigs[index].isShowDropdown}>'
                                + '<div class="pt-list">'
                                    + '<ul class="pt-list-group">'
                                        +'<template v-for="(dropObj,subIndex) in vueConfigs[index].dropdownSubdata">'
                                            + '<li class="pt-list-item">'
                                                // + '<div class="list-check">'
                                                //     + '<i class="icon-check-circle"></i>'
                                                // + '</div>'
                                                + '<span class="list-text">{{dropObj.title}}</span>'
                                                + '<span class="list-text">{{dropObj.info}}</span>'
                                                + '<div class="pt-btn-group">'
                                                    + '<template v-if="item.defaultMode==\'excelImportVer3\'">'
                                                        + '<button class="pt-btn pt-btn-default pt-btn-icon" @click="importAndExportHandler($event,index,vueConfigs[index],item,\'details\',subIndex,dropObj)">'
                                                            + '详情'
                                                        + '</button>'
                                                    + '</template>'
                                                    + '<template v-else-if="item.defaultMode==\'excelExportVer3\'">'
                                                        + '<button class="pt-btn pt-btn-default pt-btn-icon" @click="importAndExportHandler($event,index,vueConfigs[index],item,\'download\',subIndex,dropObj)">'
                                                            + '下载'
                                                        + '</button>'
                                                    + '</template>'
                                                + '</div>'
                                            + '</li>'
                                        +'</template>'
                                    + '</ul>'
                                + '</div>'
                            + '</div>'
                        +'</template>'
                        +'<template v-else-if="vueConfigs[index].dropdownState === \'info\'">'
                            + '<div class="pt-print-dropdown" :class={hide:!vueConfigs[index].isShowDropdown}>'
                                + '<div class="text-panel">'
                                    + '<p>{{vueConfigs[index].infoTitle}}</p>'
                                    + '<p class="text-warning">{{vueConfigs[index].infoContent}}</p>'
                                + '</div>'
                            + '</div>'
                        +'</template>'
                    + '</div>',
    };
    // 获取单个按钮的vue数据配置
    function getBtnsVueData(btns){
        var vueDataArr = [];
        for(var i=0; i<btns.length; i++){
            var vueData = {};
            var functionConfig = btns[i].functionConfig;
            switch(functionConfig.showBtnType){
                case 'state':
                    var isHaveDropdown = true;
                    var dropdownSubdata = $.isArray(functionConfig.dropdownSubdata) ? functionConfig.dropdownSubdata : [];
                    vueData = {
                        // 显示下拉还是显示状态  showType : default/check/warn/loading
                        showType : 'default',
                        // 显示按钮文字
                        showText : functionConfig.text,
                        defaultText : functionConfig.text,
                        // 是否有下拉 如果没有则下拉按钮隐藏
                        isHaveDropdown : isHaveDropdown,
                        // 下拉列表
                        dropdownSubdata : dropdownSubdata,
                        // 下拉按钮状态 
                        dropBtnState : 'icon-arrow-down-o',
                        // 是否显示下拉框
                        isShowDropdown : false,
                        // 下拉框状态 list/info
                        dropdownState : 'list',
                        // 状态是info时显示的文字
                        infoTitle : '',
                        infoContent : '',
                        loadingStyle : {},
                        loadingText : '',
                        // 按钮上打的特殊标签
                        timestamp : new Date().getTime(),
                    }
                    break;
                case 'importAndExport':
                    var isHaveDropdown = true;
                    vueData = {
                        // 显示下拉还是显示状态  showType : default/check/warn/loading
                        showType : 'default',
                        // 显示按钮文字
                        showText : functionConfig.text,
                        defaultText : functionConfig.text,
                        // 是否有下拉 如果没有则下拉按钮隐藏
                        isHaveDropdown : isHaveDropdown,
                        // 下拉列表
                        dropdownSubdata : [],
                        // 下拉按钮状态 
                        dropBtnState : 'icon-arrow-down-o',
                        // 是否显示下拉框
                        isShowDropdown : false,
                        // 下拉框状态 list/info
                        dropdownState : 'list',
                        // 状态是info时显示的文字
                        infoTitle : '',
                        infoContent : '',
                        loadingStyle : {},
                        loadingText : '',
                        // 按钮上打的特殊标签
                        timestamp : new Date().getTime(),
                    }
                    break;
                default:
                    break;
            }
            vueDataArr.push(vueData);
        }
        return vueDataArr;
    }
    function initComponent(){
        return{
            'btnComponent':{
                template:'<div class="pt-btn-group" v-if="data.length">'
                                +'<template v-for="(item,index) in data" :key="index">'
                                    +'<template v-if="typeof(item.functionConfig)==\'object\'&&item.functionConfig.showBtnType === \'state\'">'
                                        + template.state
                                    +'</template>'
                                    +'<template v-else-if="typeof(item.functionConfig)==\'object\'&&item.functionConfig.showBtnType === \'importAndExport\'">'
                                        + template.importAndExport
                                    +'</template>'
                                    +'<template v-else-if="item.dropdownType === \'memoryDropdown\' ">'
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
                    console.warn(navConfig.btns);
                    // 获取每个按钮的vue配置
                    var btnsVueData = getBtnsVueData(navConfig.btns);
                    var btnsConfigName = navConfig.package;
                    if(!btnsConfigName){
                        btnsConfigName = 'netstar-btns-config' - btnsNumber++;
                    }
                    return{
                        btnsConfigName : btnsConfigName,
                        data:navConfig.btns,
                        idsdata:jsonBtn,
                        callbackObj:navConfig.callback,
                        vueConfigs : btnsVueData,
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
                    nsManageBtnsConfigs[this.btnsConfigName] = {
                        vueConfig : this,
                    }
                },
                filters:{

                },//过滤器
                methods:{
                    onShowclick:function(item,event){
                        $(event.currentTarget).closest('.pt-btn-dropdown-senior').siblings().children('.pt-btn-dropdown-panel').addClass('hide');
                        $(event.currentTarget).closest('.pt-btn-dropdown').children('.pt-btn-dropdown-panel').toggleClass('hide');
                    },
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
                                refreshByConfig:item.refreshByConfig,
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
                        $(event.currentTarget).closest('.pt-btn-dropdown-panel').addClass('hide');
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
                    // 状态列表事件
                    stateSwitchClick : function(event, index, vueConfig, item){
                        // event.stopImmediatePropagation();
                        var _this = this;
                        vueConfig.isShowDropdown = !vueConfig.isShowDropdown;
                        var $target = $(event.target);
                        if(typeof(vueConfig.documentClick) != "function"){
                            // 方法定义在vueConfig中的原因  关闭事件时不会影响到组件中其他状态按钮
                            vueConfig.documentClick = function(ev){
                                var evData = ev.data;
                                var _vueConfig = evData.vueConfig;
                                var $souTarget = evData.$target;
                                var _$target = $(ev.target);
                                if(_$target.is($souTarget) || _$target.is($souTarget.parent())){
                                    return;
                                }
                                _vueConfig.isShowDropdown = false;
                                $(document).off('click', _vueConfig.documentClick);
                            }
                        }
                        if(vueConfig.isShowDropdown){
                            $(document).on('click',{$target : $target, vueConfig : vueConfig}, vueConfig.documentClick);
                        }else{
                            $(document).off('click', vueConfig.documentClick);
                        }
                    },
                    // 设置按钮状态
                    stateSetBtnShowType : function(index, showType){
                        var _this = this;
                        var vueConfigs = _this.vueConfigs;
                        vueConfigs[index].showType = showType;
                    },
                    // 设置按钮文字
                    stateSetBtnShowType : function(index, showText){
                        var _this = this;
                        var vueConfigs = _this.vueConfigs;
                        vueConfigs[index].showText = showText;
                    },
                    // 下拉框状态 list/info
                    stateSetDropdownState : function(index, dropdownState, infos){
                        var _this = this;
                        var vueConfigs = _this.vueConfigs;
                        vueConfigs[index].dropdownState = dropdownState;
                        if(dropdownState === 'info' && typeof(infos) == "object"){
                            vueConfigs[index].infoTitle = infos.infoTitle;
                            vueConfigs[index].infoContent = infos.infoContent;
                        }
                    },
                    // 获取选中
                    stateGetCheck : function(index){
                        var _this = this;
                        var vueConfigs = _this.vueConfigs[index];
                        var dropObjs = $.extend(true, [], vueConfigs.dropdownSubdata);
                        var arr = [];
                        for(var i=0; i<dropObjs.length; i++){
                            if(dropObjs[i].isCurrent){
                                var obj = $.extend(true, {}, dropObjs[i]);
                                obj.nsIndex = i;
                                arr.push(obj);
                            }
                        }
                        return arr;
                    },
                    getHandlerObj : function(event, index, vueConfig, item, eventFuncName){
                        var _this = this;
                        var obj = {
                            data:item,
                            event:event,
                            eventFuncName : eventFuncName,
                            stateObj : {
                                index : index,
                                btnsVue : _this,
                            },
                            dialogBeforeHandler:item.dialogBeforeHandler,
                            ajaxBeforeHandler:item.ajaxBeforeHandler,
                            ajaxAfterHandler:item.ajaxAfterHandler,
                            loadPageHandler:item.loadPageHandler,
                            closePageHandler:item.closePageHandler,
                            getOperateData:item.getOperateData,
                            dataImportComplete:item.dataImportComplete,
                            refreshByConfig:item.refreshByConfig,
                            setBtnDisable:function(){
                                _this.$set(_this.idsdata[item.id],"state",'loading');
                                _this.$set(_this.idsdata[item.id],"disabled",true);
                            },
                            setBtnAbled:function(){
                                _this.$set(_this.idsdata[item.id],"state",'');
                                _this.$set(_this.idsdata[item.id],"disabled",false);
                            },
                        }
                        return obj;
                    },
                    // 点击按钮事件
                    stateBtnClick : function(event, index, vueConfig, item){
                        var _this = this;
                        vueConfig.isShowDropdown = false;
                        if(typeof(item.handler)=='function'){ 
                            var obj = _this.getHandlerObj(event, index, vueConfig, item, 'click');
                            item.handler(obj);
                        }
                    },
                    stateBtnClickCancel : function(event, index, vueConfig, item){
                        var _this = this;
                        vueConfig.isShowDropdown = false;
                        if(typeof(item.handler)=='function'){ 
                            var obj = _this.getHandlerObj(event, index, vueConfig, item, 'clickCancel');
                            item.handler(obj);
                        }
                    },
                    stateMouseover : function(event, index, vueConfig, item){
                        var _this = this;
                        if(typeof(item.handler)=='function'){ 
                            var obj = _this.getHandlerObj(event, index, vueConfig, item, 'mouseover');
                            item.handler(obj);
                        }
                    },
                    stateMouseout : function(event, index, vueConfig, item){
                        var _this = this;
                        if(typeof(item.handler)=='function'){ 
                            var obj = _this.getHandlerObj(event, index, vueConfig, item, 'mouseout');
                            item.handler(obj);
                        }
                    },
                    stateDropPrint : function($event,index,vueConfig,item,subIndex,dropObj){
                        var _this = this;
                        $event.stopPropagation()// 阻止冒泡
                        if(typeof(item.handler)=='function'){ 
                            var obj = _this.getHandlerObj(event, index, vueConfig, item, 'dropPrint');
                            obj.stateObj.subIndex = subIndex;
                            item.handler(obj);
                        }
                    },
                    stateDropSet : function($event,index,vueConfig,item,subIndex,dropObj){
                        var _this = this;
                        $event.stopPropagation()// 阻止冒泡
                        if(typeof(item.handler)=='function'){ 
                            var obj = _this.getHandlerObj(event, index, vueConfig, item, 'dropSet');
                            obj.stateObj.subIndex = subIndex;
                            item.handler(obj);
                        }
                    },
                    stateDropClick : function($event,index,vueConfig,item,subIndex,dropObj){
                        var _this = this;
                        var vueConfigs = _this.vueConfigs[index];
                        var dropObjs = $.extend(true, [], vueConfigs.dropdownSubdata);
                        switch(item.functionConfig.dropSelectMode){
                            case 'checkbox':
                                dropObjs[subIndex].isCurrent = !dropObj.isCurrent;
                                break;
                            case 'single':
                                for(var i=0; i<dropObjs.length; i++){
                                    if(subIndex == i){
                                        dropObjs[subIndex].isCurrent = !dropObjs[subIndex].isCurrent;
                                    }else{
                                        dropObjs[i].isCurrent = false;
                                    }
                                }
                                
                                break;
                        }
                        vueConfigs.dropdownSubdata = dropObjs;
                        if(typeof(item.handler)=='function'){ 
                            var obj = _this.getHandlerObj(event, index, vueConfig, item, 'dropClick');
                            obj.stateObj.subIndex = subIndex;
                            item.handler(obj);
                        }
                    },
                    importAndExportHandler : function(event, index, vueConfig, item, eventName, subIndex, dropObj){
                        var _this = this;
                        function setDocumentFunc($target, vueConfig){
                            if(typeof(vueConfig.documentClick) != "function"){
                                // 方法定义在vueConfig中的原因  关闭事件时不会影响到组件中其他状态按钮
                                vueConfig.documentClick = function(ev){
                                    var evData = ev.data;
                                    var _vueConfig = evData.vueConfig;
                                    var $souTarget = evData.$target;
                                    var _$target = $(ev.target);
                                    if(_$target.is($souTarget) || _$target.is($souTarget.parent())){
                                        return;
                                    }
                                    _vueConfig.isShowDropdown = false;
                                    $(document).off('click', _vueConfig.documentClick);
                                }
                            }
                            if(vueConfig.isShowDropdown){
                                $(document).on('click',{$target : $target, vueConfig : vueConfig}, vueConfig.documentClick);
                            }else{
                                $(document).off('click', vueConfig.documentClick);
                            }
                        }
                        switch(eventName){
                            case 'switch':
                                var $event = $(event.target);
                                var isShowDropdown = vueConfig.isShowDropdown;
                                if(isShowDropdown){
                                    vueConfig.isShowDropdown = false;
                                    setDocumentFunc($event, vueConfig);
                                    break;
                                }
                                var historyAjax = {
                                    // url : getRootPath() + '',
                                    url : NetstarHomePage.config.staticPageRootPath + '/debugger/data/history.json',
                                    type : "POST",
                                    data : {},
                                    contentType : 'application/json',
                                }
                                NetStarUtils.ajax(historyAjax, (function(_setDocumentFunc, _vueConfig, _$event){
                                    return function(res){
                                        if(res.success && $.isArray(res.rows)){
                                            _vueConfig.dropdownSubdata = res.rows;
                                            _vueConfig.isShowDropdown = !_vueConfig.isShowDropdown;
                                            setDocumentFunc(_$event, _vueConfig);
                                        }
                                    }
                                })(setDocumentFunc, vueConfig, $event));
                                break;
                            case 'details':
                            case 'download':
                                event.stopPropagation()// 阻止冒泡
                                if(typeof(item.handler)=='function'){ 
                                    var obj = _this.getHandlerObj(event, index, vueConfig, item, eventName);
                                    obj.stateObj.subIndex = subIndex;
                                    item.handler(obj);
                                }
                                break;
                            default:
                                vueConfig.isShowDropdown = false;
                                if(typeof(item.handler)=='function'){ 
                                    var obj = _this.getHandlerObj(event, index, vueConfig, item, eventName);
                                    item.handler(obj);
                                }
                                break;
                        }
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
            nsManageBtnsConfigs[navConfig.package] = {};
        }
        //设置默认值
        function setDefault(){
            var shortcutArray = [];
            var shortcutObject = {};
            for(var btnI=0; btnI<navConfig.btns.length; btnI++){
                var btnData = navConfig.btns[btnI];      
                btnData.functionConfig = typeof(btnData.functionConfig) == 'object' ? btnData.functionConfig : {};    
                if(typeof(btnData.handler)=='function'){
                    if(typeof(navConfig.callback)=='object'){
                        for(var callback in navConfig.callback){
                            btnData[callback] = navConfig.callback[callback];
                        }
                    }
                }    
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
                btnData.isShowIcon = typeof(btnData.isShowIcon)=='boolean' ? btnData.isShowIcon : true;
                btnData.isShowText = typeof(btnData.isShowText)=='boolean' ? btnData.isShowText : true;
                jsonBtn[btnData.id] = btnData;
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
                                dropdownData.disabled = typeof(dropdownData.disabled) == 'boolean' ? dropdownData.disabled : false;
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
                }
            }
            if(!$.isEmptyObject(shortcutObject) && navConfig.package){
                nsManageKeyboardObj[navConfig.package].data = shortcutObject;
                nsManageBtnsConfigs[navConfig.package].data = shortcutObject;
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
            var shortCutKeyArr = [];
            for(var keyI in currentkeyboard){
                var keyJson = currentkeyboard[keyI];
                var shortcutKey = keyJson.shortcutKey;
                shortCutKeyArr.push(shortcutKey);
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
            
           /* hotkeys(shortCutKeyArr.join(','),currentkeyboard,function(event,handler){
                event.preventDefault();
                console.log(handler.key)
                console.log(handler.option[handler.key])
            })*/
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