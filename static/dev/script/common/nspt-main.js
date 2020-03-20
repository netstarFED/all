/**
 * @Desription: 登录进来看到的主界面组件
 * @Author: netstar.sjj
 * @Date: 2019-05-07 11:00:00
 */
"use strict"; 
var NetstarMainPage = {
    init:function(_configObj){
        var config = _configObj;
        /**
         *config containerId 容器id  
        */
        //模板配置html参数
        var TEMPLATE = {
            PC:{
                //页面头部内容
                HEADER:{
                    CONTAINER:
                        '<div class="pt-header">\
                            <div class="pt-container">\
                                {{TOPBAR}}\
                                {{DROPDOWNMENU}}\
                                {{TABBAR}}\
                            </div>\
                        </div>',
                    //topbar 顶部logo及工具条
                    TOPBAR:
                        '<div class="pt-topbar">\
                            <div class="pt-container">\
                                <div class="pt-logo">\
                                    <img :src="domParams.TOPBAR.logoSrc" alt="" />\
                                </div>\
                                <div :id="domParams.TOPBAR.barNav.id" class="pt-nav pt-dropdown"></div>\
                                <div :id="domParams.TOPBAR.messageNav.id" class="pt-nav pt-dropdown"></div>\
                            </div>\
                        </div>',
                    //dropdonw-memu 菜单下拉
                    DROPDOWNMENU:
                        '<div class="pt-navbar">\
                            <div class="pt-container">\
                                <div :id="domParams.DROPDOWNMENU.id" class="pt-nav pt-dropdown"></div>\
                            </div>\
                        </div>',
                    //TABBAR 标签页
                    TABBAR:
                        '<div :id="domParams.TABBAR.id" class="pt-tabbar"></div>',
                },
                //设置皮肤和字体
                SETTINGSKINFONT:{
                    //设置皮肤和字体大小总开关容器
                    ICONONOFF:
                        '<div class="pt-setting-icon" :id="domParams.SETTINGSKINFONT.ICONONOFF.id" @click="settingSkinAndFontClick">\
                            <icon class="icon icon-setting"></icon>\
                        </div>',
                    //设置皮肤和字体的内容容器
                    CONTAINER:
                        '{{ICONONOFF}}\
                        <div class="pt-setting hide">\
                            {{FONT}}\
                            {{SKIN}}\
                            {{BTNS}}\
                        </div>',
                    //字体
                    FONT:
                        '<div class="pt-form-group fg-radio pt-form-required">\
                            <div class="title">页面字体大小</div>\
                            <div class="pt-radio">\
                                <div class="radio-group">\
                                    <div class="pt-radio-inline">\
                                        <input type="radio" id="body-skin-form-form-radio1-0" :name="domParams.SETTINGSKINFONT.FONT.id" class="" value="0" />\
                                        <label for="body-skin-form-form-radio1-0" class="pt-radio-inline left">小</label>\
                                    </div>\
                                    <div class="pt-radio-inline">\
                                        <input type="radio" id="body-skin-form-form-radio1-1" :name="domParams.SETTINGSKINFONT.FONT.id" class="" value="1" />\
                                        <label for="body-skin-form-form-radio1-1" class="pt-radio-inline left">中</label>\
                                    </div>\
                                    <div class="pt-radio-inline">\
                                        <input type="radio" id="body-skin-form-form-radio1-2" :name="domParams.SETTINGSKINFONT.FONT.id" class="" value="2" />\
                                        <label for="body-skin-form-form-radio1-2" class="pt-radio-inline left">大</label>\
                                    </div>\
                                </div>\
                                <div class="pt-radio-img">\
                                    <img src="../public/static/image/pt-setting/1.jpg" class="hide" alt="">\
                                    <img src="../public/static/image/pt-setting/2.jpg" class="hide" alt="">\
                                    <img src="../public/static/image/pt-setting/3.jpg" class="hide" alt="">\
                                </div>\
                            </div>\
                        </div>',
                    //皮肤
                    SKIN:
                        '<div class="pt-setting-skin">\
                            <div class="title">皮肤</div>\
                            <div class="pt-setting-skin-group" ns-type="body-skin-tab">\
                                <div class="pt-setting-skin-group-inline pt-setting-skin-group-inline-a" ns-class="pt-setting-skin-group-inline-a"></div>\
                                <div class="pt-setting-skin-group-inline pt-setting-skin-group-inline-b" ns-class="pt-setting-skin-group-inline-b"></div>\
                                <div class="pt-setting-skin-group-inline pt-setting-skin-group-inline-c" ns-class="pt-setting-skin-group-inline-c"></div>\
                                <div class="pt-setting-skin-group-inline pt-setting-skin-group-inline-d" ns-class="pt-setting-skin-group-inline-d"></div>\
                            </div>\
                        </div>',
                    //按钮
                    BTNS:
                        '<div class="pt-btn-group">\
                            <button type="button" class="pt-btn pt-btn-success" ns-type="body-skin-save" @click="saveSettingSkinFontBtn">\
                                <span>保存</span>\
                            </button>\
                            <button type="button" class="pt-btn pt-btn-default" ns-type="body-skin-cancel" @click="cancelSettingSkinFontBtn">\
                                <span>取消</span>\
                            </button>\
                        </div>'
                }
            }
        };
        var vueTemplate = NetStarUtils.getTemplate(TEMPLATE);
        var methodsManager = {
            menuInit:function(_vueConfig){
                //菜单初始化
                var menuConfig = _vueConfig.domParams.DROPDOWNMENU;
                if(!$.isEmptyObject(menuConfig.config)){
                    menuConfig.config.id = menuConfig.id;
                    NetstarUI.buildNav(menuConfig.config);
                }   
            },
            systemMenuInit:function(_vueConfig){
                //系统菜单初始化
                var systemMenuConfig = _vueConfig.domParams.TOPBAR.barNav;
                if(!$.isEmptyObject(systemMenuConfig.config)){
                    systemMenuConfig.config.id = systemMenuConfig.id;
                    NetstarUI.buildNav(systemMenuConfig.config);
                }
            },
            messageMenuInit:function(_vueConfig){
                //消息菜单初始化
                var messageMenuConfig = _vueConfig.domParams.TOPBAR.messageNav;
                if(!$.isEmptyObject(messageMenuConfig.config)){
                    messageMenuConfig.config.el = messageMenuConfig.id;
                    NetstarUI.message.init(messageMenuConfig.config);
                }
            }
        }
        var vueManger = {
            getData:function(config){
                var vueData = {
                    domParams:{
                        TOPBAR:{
                            logoSrc:getRootPath()+'/public/static/assets/images/netstar/logo.png',
                            barNav:{
                                id:'topBarNav',
                                config:config.systemMenu
                            },
                            messageNav:{
                                id:'topMessageBarNav',
                                config:config.messageMenu
                            }
                        },
                        DROPDOWNMENU:{
                            id:'topNav',
                            config:config.menu
                        },
                        TABBAR:{
                            id:'labelPages'
                        },
                        SETTINGSKINFONT:{
                            CONTAINER:{
                                isShow:false,//默认是不显示
                            },
                            ICONONOFF:{
                                id:'body-link-skin-manager-setting'
                            },
                            FONT:{
                                id:'body-skin-form-form-radio1'
                            }
                        }
                    }
                };
                return vueData;
            },
            getVueConfig:function(config){
                var vueConfig = {
                    id: config.id,
                    el: '#'+config.id,
                    data: this.getData(config),
                    component:{},
                    watch:{},
                    methods:{
                        settingSkinAndFontClick:function(ev){
                            var id = this.domParams.SETTINGSKINFONT.ICONONOFF.id;
                            var inputId = this.domParams.SETTINGSKINFONT.FONT.id;
                            var $container = $('#'+id);
                            $container.toggleClass('active');
                            if ($container.hasClass('active')) {
                                $('.pt-setting').removeClass('hide');
                                var classStr = $('body[ns-system="pc"]').attr('class');
                                var sizeValue;
                                if (classStr.indexOf('sm') > -1) {
                                    sizeValue = 0;
                                } else if (classStr.indexOf('md') > -1) {
                                    sizeValue = 1;
                                } else if (classStr.indexOf('lg') > -1) {
                                    sizeValue = 2;
                                }
                                $('input[name="'+inputId+'"][value="' + sizeValue + '"]').attr('checked', true);
                                var linkHref = $('#body-link-skin-manager').attr('href');
                                var skinClassStr = '';
                                if (linkHref.indexOf('sap') > -1) {
                                    skinClassStr = 'pt-setting-skin-group-inline-a';
                                } else if (linkHref.indexOf('gjp') > -1) {
                                    skinClassStr = 'pt-setting-skin-group-inline-b';
                                } else if (linkHref.indexOf('pt') > -1) {
                                    skinClassStr = 'pt-setting-skin-group-inline-c';
                                }
                                $('[ns-class="' + skinClassStr + '"]').addClass('active');
                                $('[ns-class="' + skinClassStr + '"]').siblings().removeClass('active');
                                $('.pt-radio-img > img').eq(sizeValue).removeClass('hide');
                                $('.pt-radio-img > img').eq(sizeValue).siblings().addClass('hide');
                            } else {
                                $('.pt-setting').addClass('hide');
                            }
                            function documentSettingClick(ev){
                                var dragel = $('#'+ev.data.id)[0];
                                var target = ev.target;
                                var elementSetting = $('.pt-setting')[0];
                                if(dragel != target && !$.contains(dragel,target)){
                                    if(elementSetting != target && !$.contains(elementSetting,target)){
                                        $('#'+id).removeClass('active');
                                        $('.pt-setting').addClass('hide');
                                        $(document).off('click',documentSettingClick);
                                    }
                                }
                            }
                            $(document).on('click',{id:id,inputId:inputId},documentSettingClick);
                        },
                        saveSettingSkinFontBtn:function(ev){
                            var id = this.domParams.SETTINGSKINFONT.ICONONOFF.id;
                            var inputId = this.domParams.SETTINGSKINFONT.FONT.id;
                            var activeClass = $('.pt-setting-skin-group > div.active').attr('ns-class');
                            var sizeNumber = Number($('input[name="'+inputId+'"]:checked').val());
                            var sizeClassStr = '';
                            var skinHref = getRootPath() + '/public/static/assets/less-pt/'; //sap-common.css?v=0.1'
                            switch (sizeNumber) {
                                case 0:
                                    sizeClassStr = 'sm';
                                    break;
                                case 1:
                                    sizeClassStr = 'md';
                                    break;
                                case 2:
                                    sizeClassStr = 'lg';
                                    break;
                            }
                            switch (activeClass) {
                                case 'pt-setting-skin-group-inline-a':
                                    skinHref += 'sap-common.css?v=0.1';
                                    break;
                                case 'pt-setting-skin-group-inline-b':
                                    skinHref += 'gjp-common.css?v=0.1';
                                    break;
                                case 'pt-setting-skin-group-inline-c':
                                    skinHref += 'pt-common.css?v=0.1';
                                    break;
                                case 'pt-setting-skin-group-inline-d':
                                    skinHref += 'standard-common.css?v=0.1';
                                    break;
                            }
                            store.set('skin-config', {
                                size: sizeClassStr,
                                linkhref: skinHref
                            });
                            NetStarUtils.setBodySizeAndSkin(getRootPath());
                            $('#'+id).removeClass('active');
                            $('.pt-setting').addClass('hide');
                           // NetStarUtils.resetTemplateData();
                            //保存方法
                        },
                        cancelSettingSkinFontBtn:function(ev){
                            var id = this.domParams.SETTINGSKINFONT.ICONONOFF.id;
                            $('#'+id).removeClass('active');
                            $('.pt-setting').addClass('hide');
                        }//取消方法
                    },
                    mounted:function(){
                        /*var nsPublic = nsPublic ? nsPublic : {};
                        nsPublic.getAppendContainer = function () {
                            var insertLocation = $('container:not(.hidden)').not('.content');
                            if ($('.nswindow .content').length > 0) {
                                insertLocation = $('.nswindow .content:last');
                            }
                            return insertLocation;
                        }*/
                        methodsManager.menuInit(this);//菜单初始化
                        methodsManager.systemMenuInit(this); //系统惨淡初始化
                        methodsManager.messageMenuInit(this); //消息展示初始化

                        //设置图片大小
                        var radioName = this.domParams.SETTINGSKINFONT.FONT.id;
                        $('input[name="'+radioName+'"]').on('click', function (ev) {
                            var $this = $(this);
                            $this.closest('.radio-group').find('label').removeClass('checked');
                            $this.parent().children('label').addClass('checked');
                            var sizeValue = $this.val();
                            $('.pt-radio-img > img').eq(sizeValue).removeClass('hide');
                            $('.pt-radio-img > img').eq(sizeValue).siblings().addClass('hide');
                        });

                        //切换皮肤
                        $('[ns-type="body-skin-tab"] > div').on('click', function (ev) {
                            var $this = $(this);
                            $this.addClass('active');
                            $this.siblings().removeClass('active');
                        });
                        
                    },
                };
                return vueConfig;
            }
        };
        var htmlManger = {
            getHtml:function(){
                var headerHtml = NetStarUtils.getTemplateHtml(vueTemplate.HEADER.CONTAINER, vueTemplate.HEADER);
                var skinfontHtml = NetStarUtils.getTemplateHtml(vueTemplate.SETTINGSKINFONT.CONTAINER, vueTemplate.SETTINGSKINFONT);
                var html = headerHtml + skinfontHtml;
                return html;
            }
        };

        $('#'+config.id).html(htmlManger.getHtml());//给容器填充内容
        //执行VUE渲染
        var vueConfig = vueManger.getVueConfig(config);
		var vueObj = new Vue(vueConfig);
    },
};

// var NetstarStaticManager = (function ($) {
    
//     //默认的菜单地址
//     var defaultMenusAjax = {
//         src:                    getRootPath() + '/public/static/assets/json/takesample/dropDownMenu.json',    //数据源地址
//         type:                   "GET",          //GET POST
//         contentType:            'application/json; charset=utf-8',          //GET POST
//         data:                   {},             //参数对象{id:1,page:100}
//         dataSrc:                'row',
//     }

//     function setDefaultConfig(config){

//     }
//     function init(config){
//         /***配置参数 config:{
//          *      menusAjax:{   //菜单的ajax 护着
//          *          isAjax:true, //如果该值是false 则此值直接就是菜单的返回值
//          *          url:'',
//          *          type:'GET',
//          *          contentType: 'application/json; charset=utf-8', 
//          *          data: {},
//          *          dataSrc: 'row',
//          *      }
//          *  }
//          **/
//         if(typeof(config)!='object'){
//             alert('NetstarStaticManager.init(config) 方法调用错误，config未定义');
//             return false;
//         }
//         //设置默认值
//         setDefaultConfig(config);
//         //获取菜单地址，以判断
//         getMenusList(config.menusAjax, function(resList){
//             console.warn(resList);
//         })
        
        
//     }
//     //获取菜单列表数据
//     function getMenusList(menusAjax, successCallback){
//         if(menusAjax.isAjax){
//             //读取默认值
//             var ajaxConfig = {};
//             for(var key in defaultMenusAjax){
//                 if(typeof(menusAjax[key]) == 'undefined'){
//                     ajaxConfig[key] = defaultMenusAjax[key];
//                 }else{
//                     ajaxConfig[key] = menusAjax[key];
//                 }
//             }
//             //获取数据
//             getAjaxData(
//                 ajaxConfig,
//                 function(res){
//                     console.warn(res);
//                     successCallback(res);
//                 }
//             )
//         }
//     }
//     //由于这个文件用于调用静态资源，所以获取值的方法等常用方法需要单独写
//     function getAjaxData(ajaxConfig, successCallback){
//         //ajaxConfig ajax的配置文件啊
//         //successCallback 成功后回调 返回值是有效数据
//         var _ajaxConfig = $.extends(true, {}, ajaxConfig);
//         _ajaxConfig.success = function(res){
//             if(res.success){
//                 var resList = res[_ajaxConfig.dataSrc];
//                 successCallback(resList);
//             }else{
//                 var errorMsg = data.msg;
//                 if (typeof (errorMsg) != 'string') {
//                     errorMsg = '服务器端未知错误';
//                 }
//                 alert(errorMsg);
//                 console.error(ajaxConfig);
//                 console.error(res);
//             }
//         };
//         _ajaxConfig.error = function(err){
//             alert('获取数据失败');
//             console.error('获取数据失败');
//             console.error(ajaxConfig);
//             console.error(res);
//         }
//         $.ajax(_ajaxConfig);
//     }
    
//     return {
//         init:init,
//     }
// })(jQuery)
