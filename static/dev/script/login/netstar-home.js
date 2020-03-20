/*
 * @Desription: HOME页
 * @Author: netstar.cy
 * @Date: 2019-08-22 16:16:41
 * @LastEditTime: 2019-11-16 10:23:16
 */
// "use strict"; 
var NetstarMainPage = {};
var NetstarHomePage = {
    //主页初始化方法
    init:function(_config){
        /**初始化欢迎页
         * @params config:object 
         * {
         *  html:           //首页html
         *  mainMenus:{   //菜单配置
         *      ajax:{ ... }
         *      convertToTree: true,
         *      id: "topNav",
         *      menuChildIdField: "children",
         *      menuIdField: "menuId",
         *      menuNameField: "menuName",
         *      menuParentIdField: "menuParentId",
         *      menuUrlField: "menuUrl",
         *  }
         *  userMode        :string  dev 开发/dist 发布/online 生产环境
         * }
         */
        var _this = this;
        var config = _config;
        this.config = config;
        // 本地HTML文件地址
        config.staticPageRootPath = window.location.origin;
        //必须先初始化mainPage
        this.mainPage.init(config.html);
		/*
		 * 验证是否需要获取token 若果NetstarHomePage.config.isNeedToken==true(需要)否则(不需要))
		 * 不需要登录时不需要获取token 获取假的token : default
		 * isNeedToken 存在登录页时配置在登录页上 否则配置在开始页面
         * 不需要token时也不存在注销
		 */
		if(NetstarHomePage.config.isNeedToken !== false && config.systemInfo){
			NetstarHomePage.systemInfo.setLogOut(config.systemInfo); // 设置临时的注销 ajax获取成功后会删除
		}
        //载入登录属性
        if(config.getLoginProperty){
            this.getLoginProperty(config.getLoginProperty, function(res){
                //获取后的回调 
                //设置菜单地址的默认前缀， 设置config.mainMenus.defaultServerUrl = res.data.context.weburl start ------
                var isHaveWebUrl = false;
                if(res && typeof(config.mainMenus) == "object"){
                    if(res.data){
                        if(res.data.context){
                            if(typeof(res.data.context.weburl) == 'string'){
                                config.mainMenus.defaultServerUrl = res.data.context.weburl;
                                isHaveWebUrl = true;
                            }
                        }
                    }
                }
                //如果没有返回服务器地址，需要提醒，并且添加默认值
                if(isHaveWebUrl == false && typeof(config.mainMenus) == "object"){
                    var defalutServerUrl = window.location.origin;
                    config.mainMenus.defaultServerUrl = defalutServerUrl;
                    console.error(config.getLoginProperty.url + '没有返回context.weburl参数，已经设置为当前域名:'+defalutServerUrl);
                }
                //设置菜单地址的默认前缀， 设置config.mainMenus.defaultServerUrl end --------
                //重建getRootPath
                window.getRootPath = function () {
                    return NetstarLogin.loginProperty.data.context.weburl;
                }
                //  ueditor上传地址
                if(typeof(window.UEDITOR_CONFIG) != "object"){
                    window.UEDITOR_CONFIG = {};
                }
                window.UEDITOR_CONFIG.serverUrl = getRootPath() + '/cloud/ueditor';
                // 保存消息连接配置
                _this.setLink(config);
                //初始化菜单
                if(config.mainMenus){
                    _this.mainMeuns.init(config.mainMenus, _this);
                }
                if(config.systemInfo){
                    config.systemInfo.userInfo = res.data.user;
                    config.systemInfo.isLinkWorkflow = config.isLinkWorkflow;
                    config.systemInfo.isLinkNetstar = config.isLinkNetstar;
                    NetstarHomePage.systemInfo.init(config.systemInfo);
                }
                if(typeof(config.callBackFunc) == "function"){
                    config.callBackFunc();
                }
            });
        }else{
            //初始化菜单
            if(config.mainMenus){
                _this.mainMeuns.init(config.mainMenus, _this);
            }
            if(config.systemInfo){
                config.systemInfo.userInfo = res.data.user;
                config.systemInfo.isLinkWorkflow = config.isLinkWorkflow;
                config.systemInfo.isLinkNetstar = config.isLinkNetstar;
                NetstarHomePage.systemInfo.init(config.systemInfo);
            }
            if(typeof(config.callBackFunc) == "function"){
                config.callBackFunc();
            }
        }
        
        //字典预加载
        if(config.getDict){
            this.getDictAjax(config.getDict);
        }
        
        //对之前的nsPublic进行兼容
        if(typeof(nsPublic)!='object'){
           window.nsPublic = {};
        }
        window.nsPublic.getAppendContainer = this.getAppendContainer;
        //home页
        var source = NetStarUtils.getUrlPara();
        if(typeof(source) == 'object'){
            _this.loginSource = source;
        }

        //载入相关静态资源
        //this.mainPage.getStatic(config.userMode);

        // 菜单页面事件
        this.setMainEvent();
    },
    setMainEvent : function(){
        var $meunsClose = $('#mainpage-menus-btn');
        $meunsClose.off('click');
        $meunsClose.on('click', function(){
            var isCount = true;
            if ($("body").hasClass("collapse")) {
                isCount = false;
                $("body").removeClass("collapse");
            } else {
                $("body").addClass("collapse");
            }
            //sjj 2020011 重新计算宽度 如果当前屏幕盛不下10个标签页，需要出左右箭头来支持切换显示
            var id = 'labelPages';
            var $ul = $('#ul-' + id);
            //sjj 20200113 之所以加延时是因为如果不加的话获取到的宽度不对
            setTimeout(function(){
                var ulWidth = $ul.outerWidth(); //可用的ul的宽度
                NetstarUI.labelpageVm.availableWidth = $('#labelPages').outerWidth() - 108;
                var availableWidth = $('#labelPages').outerWidth() - 108;
                //console.log(ulWidth)
               // console.log(NetstarUI.labelpageVm.availableWidth)
                if(ulWidth < availableWidth){
                    $('button[ns-labelpageId="' + id + '"]').addClass('hide');
                    $ul.removeAttr('style');
                    $ul.parent().removeAttr('style');
                    NetstarUI.labelpageVm.totalPageNum = 1;
                    NetstarUI.labelpageVm.labelpageNum = 1;
                }else{
                    var divStyle = {
                        width:availableWidth + 'px',
                        overflow: 'hidden',
                        position: 'relative'
                    };
                    var ulStyle = {
                        overflow: 'hidden',
                        position: 'absolute',
                        left: availableWidth-ulWidth+'px'
                    };
                    $('button[ns-labelpageId="' + id + '"]').removeClass('hide');
                    $ul.css(ulStyle);
                    $ul.parent().css(divStyle);
                }
            },250)
        });
    },
    //container初始化
    mainPage:{
        BODYCLASS:'body-page-body skin-autoservice frame-standard',
        init:function(resHtml){
            if(resHtml == ''){
                return false;
            }
            //只取其中的container内的
            var html = NetStarUtils.getTagHtmlByRes('container', resHtml);
            //更换body class 并插入内容
            $('body').attr('class',this.BODYCLASS);
            $('body').html(html);
        },
        staticUrl:'include/mainpage-static-{userMode}.html',  //{userMode}需要替换为  dev 开发/dist 发布/online 生产环境
        /**
         *请求主页用的静态资源并加载，对应三个文件，文件路径 this.staticUrl
         * <!-- MAINPAGE 静态资源文件/本地文件 start -->
         *      <script type="text/javascript" src="http://localhost:2000/static/dev/script/common/nspt-labelpage.js?v=0.9.1"></script>
         * <!-- MAINPAGE 静态资源文件 end -->
         * @param {string} userMode   dev /dist /online
         */
        getStatic:function(userMode){
            /** */
            var staticUrl = this.staticUrl;
            staticUrl = staticUrl.replace('{userMode}', userMode);
            NetStarUtils.getHtmlByUrl(staticUrl, function(resHtml){
                $('head').append(resHtml);
            })
        }
    },
    //主菜单 
    mainMeuns:{
        class : {
            top : {
                ptHeader : '',
                container : 'top',
                item : 'pt-top-menu-item',
                row : 'pt-top-menu-item-row',
                navItem : 'pt-nav-item',
                navBlock : 'pt-top-nav-block',
            },
            left : {
                // ptHeader : 'pt-header-left',pt-header-veritical
                // ptHeader : 'pt-header-veritical',
                ptHeader : 'pt-veritical',
                container : 'left',
                item : 'pt-top-menu-item',
                row : 'pt-top-menu-item-row',
                navItem : 'pt-nav-item',
                navBlock : 'pt-top-nav-block',
            },
            defaultIcon : 'icon-menu',
        },
        // 设置默认值
        setDefault : function(config){
            /**在指定位置构建导航 {
             *      id: "",                                 //要放置的div的id
             *		menuIdField:"id",                       //菜单的id字段id
             *		menuParentIdField:"parentId",           //菜单父级id字段 
             *		menuChildIdField:"children",             //菜单子级id字段
             *		menuNameField:"name",                   //菜单名字字段
             *		menuUrlField:"url",                     //菜单链接字段
             *		singlePageModeField:"singlePageMode",   //是否是单页面字段
             *      convertToTree:false,                    //是否需要转换为树
             *      defaultServerUrl:'', 
             * }
             */
            var defaultConfig = {
                menuType : 'top',
                menuIdField: 'id',
                menuClassField: 'class',
                menuParentIdField: 'parentId',
                menuChildIdField: 'children',
                menuNameField: 'name',
                menuUrlField: 'url',
                singlePageModeField: 'singlePageMode',
                convertToTree: true,
                defaultServerUrl:'',
            };
            NetStarUtils.setDefaultValues(config, defaultConfig);
        },
        // 设置config
        setConfig : function(){
            var config = this.configs.config;
            this.setDefault(config);
        },
        // 显示
        show : function(){
            var mainMeuns = this;
            var config = mainMeuns.configs.config;
            var classObj = NetstarHomePage.mainMeuns.class[config.menuType];
            var $meunsContainer = $('#' + config.id);
            // 设置容器样式
            $meunsContainer.addClass(classObj.container);
            $meunsContainer.parents('body').addClass(classObj.ptHeader);
            // 获取菜单列表
            var meunsData = config.meunsData;
            var config = mainMeuns.configs.config;
            var timeOut = '';
            function getLiHtml(item, _level, hasChildren){
                //图标
                var iconHtml = '';
                if(_level == 0 && config.menuType == "left"){
                    // 一级菜单图标只在左侧菜单设置 且必须设置没有返回图标设置默认图标
                    var icoStr = typeof(item.ico) == "string" ? item.ico : NetstarHomePage.mainMeuns.class.defaultIcon;
                    iconHtml =  '<i class="' + icoStr+ '"></i>'
                }
                //文本
                var textHtml = '<span>' + item[config.menuNameField] + '</span>';
                //链接 
                var hrefHtml = "";
                var targetHtml = '';
                if(hasChildren){
                    //有下级元素则本级不能点击
                    // hrefHtml = 'javascript:void(0);';
                    hrefHtml = '';
                }else{
                    // 默认是单页面模式，实际上都是
                    var isSinglePageMode = typeof(item[config.singlePageModeField]) == 'boolean' ? item[config.singlePageModeField] : true;
                    //没有子元素 那就是链接
                    if(isSinglePageMode == false){
                        //不是单页面模式 直接输出链接 实际上这个情况就没有出现
                        hrefHtml = getRootPath() + "/" + item[config.menuUrlField];
                    }else{
                        //单页面模式，这是最常用的模式
                        var pageUrl = item[config.menuUrlField];
                        var serverUrl = NetstarHomePage.config.mainMenus.defaultServerUrl; // NetstarLogin.loginProperty.data.context.weburl;
                        // console.log('serverUrl:' + serverUrl);
                        // pageUrl = serverUrl + pageUrl; 
                        // 判断url地址类型 netstartype=static 表示跳转静态页面
                        var openType = item.openType;
                        switch(openType){
                            case 1:
                                // var pageUrlArr = pageUrl.split('?');
                                // var showUrl = pageUrlArr[0];
                                targetHtml = 'target=_blank';
                                if(pageUrl.indexOf('editor') > -1){
                                    pageUrl = '/sites/editor/index.html?url=' + pageUrl;
                                }
                                // hrefHtml = pageUrl;
                                hrefHtml = 'onclick="javascript:window.open(\'' + pageUrl + '\')"';
                                break;
                            case 2:
                                //pageUrl = getRootPath() + pageUrl;
                                pageUrl = NetStarUtils.wrapUrl(pageUrl);
                                hrefHtml = 'onclick="javascript:window.open(\'' + pageUrl + '\')"';
                                break;
                            default:
                                /*****sjj 20190813 统计报表静态地址 start*/
                                var reg = new RegExp('static:');
                                if(reg.test(pageUrl)){
                                    var substringStr = 'static:';
                                    pageUrl = NetstarHomePage.config.staticPageRootPath + '/sites/pages'+pageUrl.substring(substringStr.length,pageUrl.length);
                                }
                                if(pageUrl.indexOf('getById') > -1){
                                    var loadPageConfig = {
                                        url : pageUrl,
                                        title : item[config.menuNameField]
                                    };
                                    var loadPageStr = JSON.stringify(loadPageConfig);
                                    hrefHtml = "onclick='javascript:NetstarUI.labelpageVm.newLoadPage(" + loadPageStr + ");'";
                                    break;
                                }
                                    /*****sjj 20190813 统计报表静态地址 end*/
                                // hrefHtml = 'javascript:NetstarUI.labelpageVm.loadPage(\'' + pageUrl + '\',\'' + item[config.menuNameField] + '\');';
                                hrefHtml = 'onclick="javascript:NetstarUI.labelpageVm.loadPage(\'' + pageUrl + '\',\'' + item[config.menuNameField] + '\');"';
                                break;
                        }
                    }
                }
                //是否有子元素 判断方式是 menuChildIdField是否是 object 并且不能是空对象 ; 
                var hasChildren = typeof item[config.menuChildIdField] == 'object' && !$.isEmptyObject(item[config.menuChildIdField]);
                // 有子菜单时样式
                var dropdownClass = '';
                // 子菜单面板
                var blockHtml = '';
                if(hasChildren){
                    dropdownClass = 'dropdown-arrow';
                    blockHtml = getBlockHtml(_level);
                }
                var liHtml  =  '<li class="' + classObj.item + ' ' + dropdownClass + '" style="position:relative;">'
                                    + '<div class="' + classObj.row + '">'
                                        // + '<a class="' + classObj.navItem + '" ' + targetHtml + ' href="' + hrefHtml + '" > '
                                        + '<div class="' + classObj.navItem + '" ' + hrefHtml + '" > '
                                            + iconHtml
                                            + textHtml
                                        + '</div>'
                                    + '</div>'
                                    + blockHtml
                                + '</li>'
                return liHtml;
            }
            function getBlockHtml(_level){
                var nsAttr = 'ns-level="' + _level + '"';
                var styleStr = '';
                if(_level > 0){
                    nsAttr += ' ns-type="multilevel"';
                    // styleStr = 'style="position:absolute;top:0;"'
                    styleStr = '';
                }
                var blockHtml = '<div class="' + classObj.navBlock + ' hide" ' + nsAttr + ' ' + styleStr + '>' 
                                    + '<ul></ul>'
                                + '</div>';
                return blockHtml;
            }
            function setNavBlockPositionByTop($this, $block){
                var cssObj = {};
                var offsetRight = document.body.clientWidth - $this.offset().left - $this.width();
                if (offsetRight >= $this.width()) {
                    cssObj.left = $this.width() + 'px';
                } else {
                    cssObj.right = $this.width() + 'px';
                }
                if($block){
                    var bodyHeight = document.body.clientHeight;
                    var offsetTop = bodyHeight - $this.offset().top;
                    var blockHeight = $block.outerHeight();
                    if(offsetTop >= blockHeight){
                        cssObj.top = 0;
                    }else{
                        cssObj.top = offsetTop - blockHeight + 1;
                        // cssObj.top = offsetTop - blockHeight;
                        // cssObj['max-height'] = bodyHeight + 'px';
                    }
                }   
                return cssObj;
            }
            function setNavBlockPositionByLeft($this, $block){
                var thisOffset = $this.offset();
                var thisWidth = $this.width();
                var thisHeight = $this.height();
                var $document = $(document);
                var $window = $(window);
                var windowWidth = $window.width();
                var windowHeight = $window.height();
                var blockWidth = $block.outerWidth();
                var blockHeight = $block.outerHeight();
                var scrollTop = $document.scrollTop();
                // 默认在父级右下 如果下边高度不够放在上边
                var left = thisOffset.left + thisWidth;
                var top = thisOffset.top - scrollTop;
                if((windowHeight - top) < blockHeight){
                    if(blockHeight > windowHeight){
                        console.log('菜单过长无法正常显示');
                        top = 0;
                    }else{
                        top = windowHeight - blockHeight;
                    }
                }
                var cssObj = {
                    left : left,
                    top : top,
                };
                return cssObj;
            }
            function setMeunsEvent(){
                // 点击document的第一级菜单隐藏所有菜单下拉显示块
                function documentClick(ev){
                    if ($(ev.target).parents('ul').eq(0).parent().attr('id') == config.id) {
                        $('#' + config.id).find('.'+ classObj.navBlock).addClass('hide');
                    }
                }
                $(document).off('click', documentClick);
                $(document).on('click', documentClick);
                $meunsContainer.children('ul').on('mouseleave', function (ev) {
                    clearTimeout(timeOut);
                    timeOut = setTimeout(function () {
                        $meunsContainer.find('.'+classObj.navBlock).addClass('hide');
                        $meunsContainer.find('li.open').removeClass('open');
                    }, 500);
                });
            }
            function setLiEvent($li){
                // 鼠标进入
                $li.on('mouseenter', function (index, item) {
                    clearTimeout(timeOut);
                    var $this = $(this);
                    // 显示进入li的子菜单
                    $this.children('.'+classObj.navBlock).removeClass('hide');
                    // 隐藏其它li的子菜单
                    $li.siblings().find('.'+classObj.navBlock).addClass('hide');
                    // 设置子菜单样式
                    var cssPosition = {};
                    if(config.menuType == "top"){
                        var $block = $this.children('.'+classObj.navBlock+'[ns-type="multilevel"]').eq(0);
                        cssPosition = setNavBlockPositionByTop($this, $block);
                    }else{
                        var $block = $this.children('.'+classObj.navBlock).eq(0);
                        cssPosition = setNavBlockPositionByLeft($this, $block);
                    }
                    $block.css(cssPosition);
                    // 设置当前菜单样式
                    var $parentLi = $this.parents('li');
                    $meunsContainer.find('li.open').removeClass('open');
                    $parentLi.addClass('open');
                });
            }
            function setMeunsJQDom($container, data, _level){
                if ($container.get(0).localName != 'ul') {
                    if ($container.find('ul').length == 0) {
                        $container.append('<ul></ul>');
                    }
                    $container = $container.find('ul').eq(0);
                }
                $.each(data, function (index, item) {
                    //是否有子元素 判断方式是 menuChildIdField是否是 object 并且不能是空对象 ; 
                    var hasChildren = typeof item[config.menuChildIdField] == 'object' && !$.isEmptyObject(item[config.menuChildIdField]);
                    //li
                    var liHtml = getLiHtml(item, _level, hasChildren);
                    var $li = $(liHtml);
                    setLiEvent($li);
                    if (hasChildren) {
                        var __level = _level + 1;
                        setMeunsJQDom($li.find('ul'), item[config.menuChildIdField], __level);
                    }
                    $container.append($li);
                });
            }
            var level = 0;
            setMeunsJQDom($meunsContainer, meunsData, level);
            setMeunsEvent();
        },
        refreshByType : function(meunType){
            var mainMeuns = this;
            var config = mainMeuns.configs.config;
            config.menuType = meunType;
            mainMeuns.showByAjax();
        },
        // 恢复原始container
        restoreContainer : function(){
            var mainMeuns = this;
            var config = mainMeuns.configs.config;
            var id = config.id;
            var $container = $('#' + id);
            var $body = $container.parents('body');
            $container.empty();
            var classObj = mainMeuns.class;
            if(config.menuType == "top"){
                $body.removeClass(classObj.left.ptHeader);
            }
        },
        showByAjax : function(){
            var mainMeuns = this;
            var config = mainMeuns.configs.config;
            var ajaxConfig = config.ajax;
            mainMeuns.restoreContainer();
            NetStarUtils.ajax(ajaxConfig, function (res) {
                if(res.success){
                    var data = res[ajaxConfig.dataSrc];
                    if(config.convertToTree){
                        data = NetStarUtils.convertToTree(data, config.menuIdField, config.menuParentIdField, config.menuChildIdField)
                    }
                    config.meunsData = data;
                    NetstarHomePage.mainMeuns.show();
                }else{
                    
                }
            },true);
        },
        init : function(_config){
            var config = $.extend(true, {}, _config);
            this.configs = {
                config : config,
                source :  $.extend(true, {}, config)
            };
            this.setConfig(config);
            this.showByAjax();
        },
    },
    // 系统信息展示面板
    systemInfo : {
        getConfig : function(){
            return this.configs.config;
        },
        getHtml : function(){
            var config = this.getConfig();
            var showLinkStr = '';
            if(!config.isLinkWorkflow && !config.isLinkNetstar){
                showLinkStr = 'hide';
            }
            var html = '<ul class="pt-nav pt-dropdown">'
                            + '<li class="pt-top-menu-item pt-nav pt-dropdown ' + showLinkStr + '" id="' + config.linkId + '" ns-name="link">'
                                + '<div class="pt-top-menu-item-row" ns-name="title">'
                                    + '<a href="javascript:void(0);" class="pt-nav-item">'
                                        + '<i id="' + config.linkIconId + '" class="icon-unlink-o"></i>'
                                    + '</a>'
                                + '</div>'
                                + '<div class="pt-top-nav-block hide" ns-name="content">'
                                    + '<ul>'
                                        + '<li class="pt-top-menu-item" ns-name="mq">'
                                            + '<div class="pt-top-menu-item-row">'
                                                + '<a href="javascript:void(0);" class="pt-nav-item">'
                                                    + '<span>信息推送服务</span>'
                                                    + '<span id="' + config.mqId + '">已开启</span>'
                                                + '</a>'
                                            + '</div>'
                                        + '</li>'
                                        + '<li class="pt-top-menu-item" ns-name="netstar">'
                                            + '<div class="pt-top-menu-item-row">'
                                                + '<a href="javascript:void(0);" class="pt-nav-item">'
                                                    + '<span>网星通服务</span>'
                                                    + '<span id="' + config.netstarId + '">已关闭</span>'
                                                + '</a>'
                                            + '</div>'
                                        + '</li>'
                                        + '<li class="pt-top-menu-item" ns-name="netstardownload">'
                                            + '<div class="pt-top-menu-item-row">'
                                                // + '<a href="' + config.netstarUrl + '" class="pt-nav-item">'
                                                //     + '<span>网星通下载</span>'
                                                // + '</a>'
                                                + '<a href="javascript:void(0);" class="pt-nav-item">'
                                                    + '<span>网星通下载</span>'
                                                + '</a>'
                                            + '</div>'
                                        + '</li>'
                                    + '</ul>'
                                + '</div>'
                            + '</li>'
                            + '<li class="pt-top-menu-item pt-nav pt-dropdown" id="' + config.userId + '" ns-name="user">'
                                + '<div class="pt-top-menu-item-row" ns-name="title">'
                                    + '<a href="javascript:void(0);" class="pt-nav-item" title="' + config.userInfo.userName + '">'
                                        + '<i class="icon-user-o"></i>'
                                        // + '<span>' + config.userInfo.userName + '</span>'
                                    + '</a>'
                                + '</div>'
                                + '<div class="pt-top-nav-block hide" ns-name="content">'
                                    + '<ul>'
                                        + '<li class="pt-top-menu-item" style="position: relative;" ns-name="edit">'
                                            + '<div class="pt-top-menu-item-row">'
                                                + '<a href="javascript:void(0);" class="pt-nav-item">'
                                                    + '<i class="null"></i>'
                                                    + '<span>修改密码</span>'
                                                + '</a>'
                                            + '</div>'
                                        + '</li>'
                                        + '<li class="pt-top-menu-item" style="position: relative;" ns-name="off">'
                                            + '<div class="pt-top-menu-item-row">'
                                                + '<a href="javascript:void(0);" class="pt-nav-item">'
                                                    + '<i class="fa-power-off"></i>'
                                                    + '<span>注销</span>'
                                                + '</a>'
                                            + '</div>'
                                        + '</li>'
                                    + '</ul>'
                                + '</div>'
                            + '</li>'
                            + '<li class="pt-top-menu-item pt-nav pt-dropdown" id="' + config.messageId + '" ns-name="message"></li>'
                            + '<li class="pt-top-menu-item pt-nav pt-dropdown" id="' + config.sounderId + '" ns-name="sounder"></li>'
                            + '<li class="pt-top-menu-item pt-nav pt-dropdown" id="' + config.settingId + '" ns-name="setting">'
                                + '<div class="pt-top-menu-item-row pt-setting-icon" ns-name="title">'
                                    + '<a href="javascript:void(0);" class="pt-nav-item">'
                                        + '<icon class="icon icon-setting"></icon>'
                                    + '</a>'
                                + '</div>'
                                + '<div class="pt-top-nav-block hide pt-setting" ns-name="content">'
                                    + '<div class="pt-form-group fg-radio pt-form-required">'
                                        + '<div class="title">页面字体大小</div>'
                                        + '<div class="pt-radio">'
                                            + '<div class="radio-group">'
                                                + '<div class="pt-radio-inline">'
                                                    + '<input type="radio" checked id="' + config.fontSizeId + '-0" name="' + config.fontSizeId + '" class="" value="0" />'
                                                    + '<label for="' + config.fontSizeId + '-0" class="pt-radio-inline left checked">小</label>'
                                                + '</div>'
                                                + '<div class="pt-radio-inline">'
                                                    + '<input type="radio" id="' + config.fontSizeId + '-1" name="' + config.fontSizeId + '" class="" value="1" />'
                                                    + '<label for="' + config.fontSizeId + '-1" class="pt-radio-inline left">中</label>'
                                                + '</div>'
                                                + '<div class="pt-radio-inline">'
                                                    + '<input type="radio" id="' + config.fontSizeId + '-2" name="' + config.fontSizeId + '" class="" value="2" />'
                                                    + '<label for="' + config.fontSizeId + '-2" class="pt-radio-inline left">大</label>'
                                                + '</div>'
                                            + '</div>'
                                        + '</div>'
                                    + '</div>'
                                    + '<div class="pt-setting-skin">'
                                        + '<div class="title">皮肤</div>'
                                        + '<div class="pt-setting-skin-group">'
                                            + '<div class="pt-setting-skin-group-inline pt-setting-skin-group-inline-a" ns-class="pt-setting-skin-group-inline-a"></div>'
                                            + '<div class="pt-setting-skin-group-inline pt-setting-skin-group-inline-b" ns-class="pt-setting-skin-group-inline-b"></div>'
                                            + '<div class="pt-setting-skin-group-inline pt-setting-skin-group-inline-c" ns-class="pt-setting-skin-group-inline-c"></div>'
                                            + '<div class="pt-setting-skin-group-inline pt-setting-skin-group-inline-d" ns-class="pt-setting-skin-group-inline-d"></div>'
                                        + '</div>'
                                    + '</div>'
                                    + '<div class="pt-btn-group">'
                                        + '<button type="button" class="pt-btn pt-btn-success" ns-name="save">'
                                            + '<span>保存</span>'
                                        + '</button>'
                                        + '<button type="button" class="pt-btn pt-btn-default" ns-name="cancel">'
                                            + '<span>取消</span>'
                                        + '</button>'
                                        + '<button type="button" class="pt-btn pt-btn-default" ns-name="ineditor">'
                                            + '<span>进入编辑器</span>'
                                        + '</button>'
                                    + '</div>'
                                + '</div>'
                            + '</li>'
                        + '</ul>';
            return html;
        },
        mqLink : function(){
            var config = this.getConfig();
            if(config.mqIsLink){
                nsAlert('消息推送服务已连接', 'success');
                console.log('websocket连接状态');
            }else{
                // 连接 消息
                var infos = NetstarUI.message.getRollOutRows();
                NetStarRabbitMQ.connectBySaveConfig(infos, function(_isLink){
                });
            }
        },
        editPassword : function(){
            var config = this.getConfig();
            var userName = config.userInfo.userName;
            var dialog = {
                id: "edit-userpassword",
                title: '修改密码',
                templateName: 'PC',
                height : 250,
                shownHandler: function (data) {
                    var dialogBodyId = data.config.bodyId;
                    var footerIdGroup = data.config.footerIdGroup;
                    var formJson = {
                        id: dialogBodyId,
                        templateName: 'form',
                        componentTemplateName: 'PC',
                        defaultComponentWidth:'100%',
                        isSetMore : false,
                        form : [
                            {
                                id : 'account',
                                label : '用户名',
                                type : 'text',
                                disabled : true,
                                value : userName,
                            },{
                                id : 'originalPwd',
                                label : '现有密码',
                                type : 'password',
                                rules : 'required',
                            },{
                                id : 'pwd',
                                label : '新密码',
                                type : 'password',
                                rules : 'required',
                            },{
                                id : 'pwd2',
                                label : '重复密码',
                                type : 'password',
                                rules : 'required',
                            }
                        ]
                    };
                    var component = NetstarComponent.formComponent.getFormConfig(formJson);
                    NetstarComponent.formComponent.init(component, formJson);
                    var btnsHtml = '<div class="pt-btn-group">'
                                        + '<button class="pt-btn pt-btn-default" ns-type="confirm">确认</button>'
                                        + '<button class="pt-btn pt-btn-default" ns-type="cancel">取消</button>'
                                    + '</div>';
                    var $btnsHtml = $(btnsHtml);
                    var $btns = $btnsHtml.find('button');
                    $btns.off('click');
                    $btns.on('click', function(){
                        var $this = $(this);
                        var nsType = $this.attr('ns-type');
                        switch(nsType){
                            case "confirm":
                                var formdata = NetstarComponent.getValues(dialogBodyId);
                                if(formdata){
                                    if (formdata.pwd2 == formdata.pwd) {
                                        var systemInfo = NetstarMainPage && typeof(NetstarMainPage.systemInfo) == "object" ? NetstarMainPage.systemInfo : {};
                                        formdata.id = systemInfo.user && systemInfo.user.userId ? systemInfo.user.userId : '';
                                        var ajaxConfig = {
                                            url: getRootPath() + "/system/users/changePwd",
                                            data: formdata,
                                            type: "GET",
                                            dataType: "json",
                                            contentType : 'application/x-www-form-urlencoded'
                                        }
                                        NetStarUtils.ajax(ajaxConfig, function(data, _ajaxConfig){
                                            if (data.success && data) {
                                                nsalert('密码修改成功');
                                                NetStarUtils.OAuthCode.clear();
                                                top.location = top.location;
                                                NetstarComponent.dialog['edit-userpassword'].vueConfig.close();
                                            } else {
                                                nsalert(data.msg, 'error');
                                            }
                                        });
                                    } else {
                                        nsalert("新密码不一致");
                                    }
                                }
                                break;
                            case "cancel":
                                NetstarComponent.dialog['edit-userpassword'].vueConfig.close();
                                break;
                        }
                    });
                    $('#' + footerIdGroup).append($btnsHtml);
                },
            }
            NetstarComponent.dialogComponent.init(dialog);
        },
        setEvent : function($html){
            var _this = this;
            var config = this.getConfig();
            var $lis = $html.children();
            function titleEvent($title, $content){
                $title.off('click');
                $title.on('click', function(){
                    $content.toggleClass('hide');
                    $(document).off('click', clickDocumentHide);
                    $(document).on('click', clickDocumentHide);
                });
            }
            function liEvent($li, liName){
                var $title = $li.children('[ns-name="title"]');
                var $content = $li.children('[ns-name="content"]');
                titleEvent($title, $content);
                if(liName == "setting"){
                    var $conBtns = $content.find('button');
                    $conBtns.off('click');
                    $conBtns.on('click', function(){
                        var $this = $(this);
                        var nsName = $this.attr('ns-name');
                        switch(nsName){
                            case 'save':
                                break;
                            case 'cancel':
                                break;
                            case 'ineditor':
                                var currentUrl = false;
                                var labelPagesArr = NetstarUI.labelpageVm.labelPagesArr;
                                for(var i=0; i<labelPagesArr.length; i++){
                                    if(labelPagesArr[i].isCurrent){
                                        currentUrl = labelPagesArr[i].url;
                                        break;
                                    }
                                }
                                if(currentUrl && currentUrl.indexOf('getById') > 1){
                                    var pageId = false;
                                    if(currentUrl.indexOf('?') > -1){
                                        pageId = currentUrl.substring(currentUrl.indexOf('getById') + 'getById'.length + 1, currentUrl.indexOf('?'));
                                    }else{
                                        pageId = currentUrl.substring(currentUrl.indexOf('getById') + 'getById'.length + 1);
                                    }
                                    if(pageId){
                                        var editorUrl = NetstarHomePage.config.staticPageRootPath + '/sites/tp-editor/home/main.html?pageId=' + pageId;
                                        window.open(editorUrl);
                                    }
                                }
                                break;
                        }
                    });
                }else{
                    var $conLis = $content.find('li');
                    $conLis.off('click');
                    $conLis.on('click', function(){
                        var $this = $(this);
                        var nsName = $this.attr('ns-name');
                        switch(nsName){
                            case 'mq':
                                _this.mqLink();
                                break;
                            case 'netstar':
                                break;
                            case 'netstardownload':
                                _this.netstarDownload();
                                break;
                            case 'edit':
                                _this.editPassword();
                                break;
                            case 'off':
                                NetStarUtils.OAuthCode.clear();
                                top.location = NetstarHomePage.loginSource.source;
                                break;
                        }
                    });
                }
            }
            for(var i=0; i<$lis.length; i++){
                var $li = $lis.eq(i);
                var nsName = $li.attr('ns-name');
                switch(nsName){
                    case "message":
                        break;
                    case "link":
                    case "user":
                    case "setting":
                        liEvent($li, nsName);
                        break;
                }
            }
            function clickDocumentHide(ev){
                var $element = $(ev.target);
                var $content = $element.parents('#' + config.id);
                if($element.closest('li').length == 1){
                    //sjj 20200113 修改
                    var $cLi = $element.closest('li');
                    $cLi.children('.pt-top-nav-block').removeClass('hide');
                    $cLi.siblings().children('.pt-top-nav-block').addClass('hide');
                    $('#mainpage-systeminfo-contianer-sounder-soundbar').addClass('hide');
                    if($element.closest('.pt-sounder').length == 1){
                        $('#mainpage-systeminfo-contianer-sounder-soundbar').removeClass('hide');
                    }
                }
                if($content.length === 0){
                    $lis.children('.pt-top-nav-block').addClass('hide');
                    $('#mainpage-systeminfo-contianer-sounder-soundbar').addClass('hide');
                    $(document).off('click', clickDocumentHide);
                }
            }
        },
        // 网星通下载弹框
        netstarDownload : function(_config){
            if(typeof(_config) == "object"){
                var config = _config;
                var __config = this.getConfig();
                NetStarUtils.setDefaultValues(config, __config);
            }else{
                var config = this.getConfig();
            }
            var dialogConfig = {
                id: "netstar-download",
                height: "385px",
                title: '网星通下载',
                templateName: 'PC',
                plusClass: 'pt-netstar-download',
                width : config.netstarWidth,
                height : config.netstarHeight,
                shownHandler: function (data) {
                    var dialogBodyId = data.config.bodyId;
                    var html = ' <div class="netstar-download-content">'
                                + '<div class="logo"><img src="/static/dev/images/wangxingtong/logo.png" alt=""></div>'
                                + '<div class="title">' + config.text + '</div>'
                                + '<div class="pt-btn-group">'
                                    + '<button type="button" class="pt-btn pt-btn-default">'
                                        + '<a href="' + config.netstarUrl + '">'
                                            + '<span>立即下载</span>'
                                        + '</a>'
                                    + '</button>'
                                + '</div>'
                            + '</div>';
                    $('#' + dialogBodyId).html(html)
                },
            }
            NetstarComponent.dialogComponent.init(dialogConfig);
        },
        setConfig : function(){
            var config = this.getConfig();
            config.messageId = 'topMessageBarNav';
            config.linkId = config.id + '-link';
            config.userId = config.id + '-user';
            config.settingId = config.id + '-setting';
            config.linkIconId = 'ns-link-icon';
            config.mqId = 'ns-link-mq-state';
            config.netstarId = 'ns-link-netstar-state';
            config.netstarUrl = getRootPath() + '/files/download/10010';
            config.fontSizeId = config.id + '-fontsize';
            config.isMessage = typeof(config.isMessage) == "boolean" ? config.isMessage : true;
            config.sounderId = config.id + '-sounder';
            config.text = typeof(config.text) == "string" ? config.text : '请补充文字';
            config.netstarHeight = typeof(config.netstarHeight) == "number" ? config.netstarHeight : 370;
            config.netstarWidth = typeof(config.netstarWidth) == "string" ? config.netstarWidth : 500;
        },
        messageMenuInit : function(){
            //消息菜单初始化
            nsEngine.getWaitingList(null, function (rows) {
                var messageConfig = {
                    el: 'topMessageBarNav',
                    title: "",
                    tips: rows.length,
                    panels: [
                        {
                            name: "我的待办",
                            type: "rollout",
                            tips: "",
                            url: "/netStarRights/iwilldo",
                            panelTitleField: "activityName",
                            panelUrlField: "formUrl",
                            panelTextField: "processName",
                            panelTipsField: "workitemCount",
                            rows: rows
                        }
                    ]
                };
                NetstarUI.message.init(messageConfig);
                if(typeof(NetstarHomePage.systemInfo.configs.config.messageHandler) == "function"){
                    NetstarHomePage.systemInfo.configs.config.messageHandler(rows);
                }
            })
        },
        // 设置临时的注销
        setLogOut : function(config){
            var html = '<ul class="pt-nav pt-dropdown">'
                            + '<li class="pt-top-menu-item pt-nav pt-dropdown">'
                                + '<div class="pt-top-menu-item-row">'
                                    + '<a href="javascript:void(0);" class="pt-nav-item">'
                                        + '<i class="fa-power-off"></i>'
                                        + '<span>注销</span>'
                                    + '</a>'
                                + '</div>'
                            + '</li>'
                        +'</ul>'
            var $html = $(html);
            var $li = $html.find('li');
            $li.off('click');
            $li.on('click', function(){
                NetStarUtils.OAuthCode.clear();
                top.location = NetstarHomePage.loginSource.source;
            });
            $('#' + config.id).html($html);
        },
        init : function(config){
            this.configs = {
                source : $.extend(true, {}, config),
                config : config,
            }
            this.setConfig();
            var html = this.getHtml();
            var $html = $(html);
            this.setEvent($html);
            $('#' + config.id).html($html);
            // 设置声音    
            NetstarSounder.init({
                id : config.sounderId, 
                url : '',
            })
            // 初始化消息
            if(config.isMessage){
                NetstarHomePage.systemInfo.messageMenuInit(this); //消息展示初始化
            }
        },
    },
    // 消息连接配置
    setLink : function(config){
        // mq工作流消息联通 默认联通
        config.isLinkWorkflow = typeof(config.isLinkWorkflow)=="boolean" ? config.isLinkWorkflow : true;
        // 网星通服务联通 默认联通
        config.isLinkNetstar = typeof(config.isLinkNetstar)=="boolean" ? config.isLinkNetstar : true;
        var authorization = NetStarUtils.OAuthCode.get();
        if(config.isLinkNetstar){
            var netstarLinkConfig = {
                name : 'NETSTARLINK',
                type : 'mq',
                url : 'wss://127.0.0.1:8080/ws',
                token: authorization,
                vhost : '/',
                callBackFunc : function(){

                }
            }
            // NetstarLocalResources.link(netstarLinkConfig);
        }
        
        /******************NetStarRabbitMQ start********************** */
        if(config.isLinkWorkflow){
            var rabbitMQConfig = {
                ws: NetstarMainPage.systemInfo.context.rabbitmq.wsAddresses,
                toekn: authorization,
                vhost: NetstarMainPage.systemInfo.context.rabbitmq.virtualHost,
                content: {
                    'auto-delete': true,
                    durable: false
                },
                toporgId: $.trim(NetstarMainPage.systemInfo.user.topOrgId),
                userId: $.trim(NetstarMainPage.systemInfo.user.userId),
            };
            NetStarRabbitMQ.saveRabbitMQLinkConfig(rabbitMQConfig);
        }
        /**************NetStarRabbitMQ end************************** */
    },
    //菜单打开页面
    menuHandler:function(){

    },
    /**
     * 登录成功调用获取用户数据的方法，该方法必须发送header：token
     * token 是登录成功后返回的
     */
    getLoginProperty:function(_ajaxConfig, callbackFunc){
        var _this = this;
        var ajaxConfig = 
        {
            url: _ajaxConfig.url, 
            type: "GET",
            dataType: 'json',
            contentType:'application/x-www-form-urlencoded',
        }
        NetStarUtils.ajax(ajaxConfig, function(res){
            if(res.success){
            }else{
                // 退回
                NetStarUtils.OAuthCode.clear();
                NetStarUtils.OAuthCode.reLogin();
            }
            NetstarLogin.loginProperty = res;
            
            //修改webapi地址：如果登录时使用了?nsserver定义了webapi地址 则修改webapi地址 cy 190828 start ---
            if(res.success){
                var resetServerUrl = NetStarUtils.resetServerUrl.get();
                if(resetServerUrl){
                    console.warn('服务器端API地址已修改为：' + resetServerUrl);
                    res.data.context.weburl = resetServerUrl;
                }
            }
            //修改webapi地址 cy 190828 end ---

            if(res.success){
                NetstarMainPage = {
                    config : res.data.user,
                    systemInfo : {
                        user : res.data.user,
                        context : res.data.context,
                        applyParams:{},
                    },
                }
                //201909011 //根据当前登录用户获取应用参数表内容   现在没用了 mh删除（没有这个接口了）lyw删 20191025
                // var systemParamConfig = {
                //     url:res.data.context.weburl+'/system/sysParas/getListOfOrg',//根据当前登录用户获取应用参数表内容
                //     dataSrc:'rows',
                //     type:'GET',
                //     contentType: 'application/x-www-form-urlencoded',
                // };
                // NetStarUtils.ajax(systemParamConfig,function(res){
                //     if(res.success){
                //         if($.isArray(res.rows)){
                //             for(var i=0; i<res.rows.length; i++){
                //                 var jsonData = res.rows[i];
                //                 NetstarMainPage.systemInfo.applyParams[jsonData.name] = jsonData.value;
                //             }
                //         }
                //     }
                // },true);
            }
            if(typeof(callbackFunc) == 'function'){
                callbackFunc(res);
            }
        }, true)
    },
    tabs:function (id, containerParent) {
        var functionHandler = {
            //点击tab页时调用的方法
            recordHandler: function (index) {
                var currentPage = rowNavVue.labelPagesArr[index];
                // typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.inPageHandler(currentPage.currentLi);
                typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.inPageHandler(currentPage.attrs);
            },
            //关闭调用
            closeHandler: function (index) {
                var currentPage = rowNavVue.labelPagesArr[index];
                typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.unsubscribeByUntId(typeof currentPage.config != 'undefined' ? currentPage.config.package : '');
            },
            //刷新调用
            refreshHandler: function (currentPage) {
                typeof NetStarRabbitMQ != 'undefined' && NetStarRabbitMQ.refreshInfoRemind(currentPage.attrs);
            }
        };
        var rowNavVue = new Vue({
            el: "#" + id,
            data: {
                containerParent: containerParent,
                currentTab: 0,
                navFunctionShow: false,
                labelPagesArr: []
            },
            created: function () {
                this.labelPagesArr.push({
                    title: '首页',
                    url: '/home',
                    dom: $(this.containerParent).find('container:not(.hidden)').get(0),
                    config: "",
                    attrs: {}
                });
                var tabHtml = '<div class="pt-nav">\
                                    <ul>\
                                        <li class="pt-nav-item"\
                                        v-for="(item, index) in labelPagesArr" :key="item"\
                                         @click="recordCurrent(index,$event)" @mouseenter.stop.prevent="mouseEnterCurrent($event)"\>\
                                            <a href="javascript:void(0);">\
                                            {{item.title}}\
                                            </a>\
                                            <div v-if="index != 0" @click.stop="removeCurrent(index)" class="pt-btn-clear">\
                                                <i class="icon-close-alt-o"></i>\
                                            </div>\
                                        </li>\
                                    </ul>\
                                </div>\
                                <div class="pt-nav pt-tabbar-control">\
                                    <div class="pt-nav-toggle" @click="toggleNavFunction">\
                                        <i class="icon-arrow-down"></i>\
                                    </div>\
                                    <ul v-show="navFunctionShow" class="pt-dropdown-menu">\
                                        <li class="pt-nav-item" @click="removeAll"><span>关闭全部标签</span></li>\
                                        <li class="pt-nav-item" @click="removeOther"><span>关闭其他标签</span></li>\
                                        <li class="pt-nav-item" @click="removeCurrent(currentTab)"></i><span>关闭当前标签</span></li>\
                                    </ul>\
                                </div>';
                $('#' + id).append(tabHtml);
            },
            methods: {
                //加载页面
                loadPage: function (url, title, isAlwaysNewTab) {
                    typeof isAlwaysNewTab != 'boolean' ? isAlwaysNewTab = true : "";
                    var vm = this;
                    if ($.trim(url).length == 0 || $.trim(url) == '#') return;
                    //如果超过20个，则提示不可再添加
                    if (vm.labelPageLength > 10) {
                        return nsalert('超过页面数上限', 'warning');
                    }
    
                    //如果传参为obj，则调用另一方法
                    if (typeof url == 'object') {
                        vm.loadType = 'object';
                        vm.containerObj = this.getPageByObj(url);
                        url = vm.containerObj.id + ';';
                        for (var key in vm.containerObj.attrs) {
                            if (vm.containerObj.attrs.hasOwnProperty(key)) {
                                var element = vm.containerObj.attrs[key];
                                url += key + '=' + element + ';';
                            }
                        }
                        title = vm.containerObj.title;
                    } else {
                        vm.loadType = 'ajaxUrl';
                    }
                    //是否打开新的tab页
                    if (typeof isAlwaysNewTab == 'boolean' && !isAlwaysNewTab) {
                        vm.isNewTab = false;
                    } else {
                        vm.isNewTab = true;
                    }
                    //根据url来构建contaienrId
                    var separatorArr = ['?', ';'];
                    vm.currentContainerId = url.replace(/\//g, '-');
                    $.each(separatorArr, function (index, item) {
                        if (vm.currentContainerId.indexOf(item) != '-1') {
                            vm.currentContainerId = vm.currentContainerId.substring(0, vm.currentContainerId.indexOf(item));
                        }
                    });
                    //如果已经打开过，且没有关闭过，则打开
                    var urlIndex = this.urlIsOpen(url);
    
                    if (urlIndex != -1) {
                        vm.recordCurrent(urlIndex);
                    } else {
                        //先隐藏当前页面，并添加新的容器
                        var $containerParent = $(vm.containerParent);
                        var $currentContainer = $containerParent.find('container:not(.hidden)');
                        $currentContainer.addClass('hidden');
                        if (typeof $currentContainer.attr('id') == 'undefined') {
                            //如果没有id则添加时间戳
                            var homePageId = 'projectHomePage' + '-' + new Date().valueOf();
                            $currentContainer.attr('id', homePageId);
                            vm.hiddenContainerId = homePageId;
                        } else {
                            vm.hiddenContainerId = $currentContainer.attr('id');
                        }
                        //如果当前有这个容器，说明已经有这个页面了，那么就要进行if里面的操作
                        var findUrl = vm.currentContainerId.replace(/-/g, '/');
                        var index = vm.arrayIsInclude(findUrl);
    
                        if (index != -1) {
                            //如果是用object加的页面。则直接显示那个页面
                            if (vm.loadType == 'object') {
                                vm.recordCurrent(index);
                                return false;
                            }
                            //否则进行以下操作
                            if (vm.isNewTab) {
                                vm.isEditConfig = true;
                                vm.currentContainerId = vm.currentContainerId + '-' + new Date().valueOf();
                                $containerParent.append('<container id="' + vm.currentContainerId + '"></container>');
                                vm.labelPagesArr.push({
                                    title: title,
                                    url: url,
                                });
                            } else {
                                $(vm.labelPagesArr[index].dom).empty();
                                vm.recordCurrent(index);
                                vm.currentContainerId = $(vm.labelPagesArr[index].dom).attr('id');
                            }
                        } else {
                            $containerParent.append('<container id="' + vm.currentContainerId + '"></container>');
                            //将title 和 url 事先添加进去(造成加载很快的假象)
                            vm.labelPagesArr.push({
                                title: title,
                                url: url,
                            });
                        }
                        vm.getJsp(url);
                    }
                },
                //通过url请求页面内容
                getJsp: function (url) {
                    var vm = this;
                    var ajaxConfig = {
                        url: url,
                        type: "GET",
                        data: {},
                        success: function (res) {
                            if (typeof res.msg != 'undefined') {
                                nsalert(res.msg);
                                return false;
                            }
                            var $currentContainer = $(vm.containerParent).find('container#' + vm.currentContainerId);
                            var templateInit = vm.getContainerAndConfigName(res).templateInit;
                            var containerHtml = vm.getContainerAndConfigName(res).containerHtml;
                            var configName = vm.getContainerAndConfigName(res).configName;
                            //渲染到页面上
                            if (vm.isEditConfig && templateInit) {
                                vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = true;
                                var addHtml = configName + ".package = " + configName + ".package + '.' +" + new Date().valueOf() + ";" + templateInit[0];
                                containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
                            } else {
                                vm.labelPagesArr[vm.labelPageLength - 1].isEditConfig = false;
                            }
                            //如果有配置的话，则添加以下内容
                            if ($.trim(configName).length != 0) {
                                var addHtml = templateInit[0] + ';' + 'NetstarUI.labelpageVm.setContaienrConfig("' + url + '",' + configName + ')';
                                containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
                            } else {
                                vm.loadType == 'object' ?
                                    vm.labelPagesArr[vm.labelPageLength - 1].config = $.extend(true, {}, vm.containerObj) :
                                    vm.labelPagesArr[vm.labelPageLength - 1].config = '';
                            }
                            vm.labelPagesArr[vm.labelPageLength - 1].ajaxRes = res;
                            $currentContainer.append(containerHtml);
                            vm.isNewTab ? vm.labelPagesArr[vm.labelPageLength - 1].dom = $currentContainer.get(0) : '';
                            //设置currentTab
                            vm.currentTab = vm.labelPageLength - 1;
                            functionHandler.refreshHandler(vm.labelPagesArr[vm.labelPageLength - 1]);
                            //lxh 缓存机制 19/02/20
                            // NetstarCatchHandler.setCatch(vm.currentContainerId, res);
                        },
                        fail: function (err) {
                            console.log(err);
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            vm.labelPagesArr.pop();
                            $('#' + vm.hiddenContainerId).removeClass('hidden');
                            $('#' + vm.currentContainerId).remove();
                            NetStarUtils.defaultAjaxError(XMLHttpRequest);
                            console.error('请求错误，错误代码：' + XMLHttpRequest.status);
                        },
                    };
                    // $.ajax(ajaxConfig);
                    //lxh 缓存机制 19/02/20
                    /* if (!!NetstarCatchHandler.getCatch(vm.currentContainerId)) {
                        ajaxConfig.success(NetstarCatchHandler.getCatch(vm.currentContainerId));
                    } else {
                    } */
                    if (vm.loadType == 'object') {
                        vm.$nextTick(function () {
                            ajaxConfig.success('<container>' + (vm.containerObj.html ? vm.containerObj.html : "") + '</container>');
                            vm.setContaienrConfig(url, { pageParam: vm.containerObj.attrs });
                            typeof vm.containerObj.shownHandler == 'function' && vm.containerObj.shownHandler({ jqDom: $('#' + id).find('li').eq(vm.labelPageLength - 1) });
                            delete vm.containerObj;
                        });
                    } else if (vm.loadType == 'ajaxUrl') {
                        $.ajax(ajaxConfig);
                    }
                },
                getContainerAndConfigName: function (htmlString) {
                    var containerHtml = '';
    
                    var matchTag = 'container';
                    var lastIndex = htmlString.lastIndexOf('</' + matchTag + '>');
                    var firstIndex = htmlString.indexOf('<' + matchTag + '>');
                    if (firstIndex != -1 && lastIndex != -1) {
                        containerHtml = htmlString.substring(firstIndex + ('<' + matchTag + '>').length, lastIndex);
                    } else {
                        matchTag = 'body';
                        if (firstIndex != -1 && lastIndex != -1) {
                            containerHtml = htmlString.substring(firstIndex + ('<' + matchTag + '>').length, lastIndex);
                        } else {
                            containerHtml = htmlString;
                        }
                    }
                    //获得当前页面配置
                    var templateInit = containerHtml.match(/NetstarTemplate\.init[\s]*\((\S+)\)/);
                    var configName = templateInit != null ? templateInit[1] : "";
    
                    return {
                        containerHtml: containerHtml,
                        configName: configName,
                        templateInit: templateInit
                    };
                },
                //根据obj属性添加页面
                getPageByObj: function (options) {
                    var defaultOptions = {
                        id: new Date().valueOf(),
                        title: '无标题',
                        attrs: {},
                        shownHandler: function (elid) { }
                    };
                    nsVals.setDefaultValues(options, defaultOptions);
                    if ($.trim(options.id).length == 0) {
                        options.id = new Date().valueOf();
                    } else {
                        switch(options.type){
                            case 'workflowTab':
                                options.id = options.id;
                                break;
                            default:
                                options.id = options.id + "/" + new Date().valueOf();
                                break;
                        }
                    }
                    if ($.trim(options.title).length == 0) {
                        options.title = '无标题';
                    }
                    return $.extend(true, {}, options);
                },
                //记录更改 currentTab
                recordCurrent: function (index) {
                    this.currentTab = index;
                    var $currentContainer = $(this.containerParent).find('container:not(.hidden)');
                    $currentContainer.addClass('hidden');
                    $(this.labelPagesArr[index].dom).removeClass('hidden');
                    //调用rabbitMq刷新tab页信息
                    //$('#' + id).find('li').eq(index)
                    functionHandler.recordHandler(index);
                    this.setCurrent(index);
                },
                //移除当前页面
                removeCurrent: function (index) {
                    this.navFunctionShow = false;
                    var _this = this;
                    typeof index != 'undefined' ? '' : index = _this.currentTab;
                    //执行关闭函数
                    var pageConfig = this.labelPagesArr[index].config;
    
                    if (typeof pageConfig != 'undefined' && typeof pageConfig.beforeCloseHandler == 'function') {
                        var getValue = pageConfig.beforeCloseHandler(pageConfig.package);
                        if (JSON.stringify(getValue.pageData).length >= JSON.stringify(getValue.serverData).length) {
                            var frontData = getValue.pageData ? getValue.pageData : {};
                            var backData = getValue.serverData;
                        } else {
                            var frontData = getValue.serverData;
                            var backData = getValue.pageData ? getValue.pageData : {};
                        }
                        //比较两个vo是否一样
                        if (!nsVals.isEqualObject(frontData, backData)) {
                            nsconfirm('当前页面修改后末保存,是否关闭?', function (state) {
                                if (state) {
                                    _this.closeByIndex(index);
                                }
                            }, 'warning');
                        } else {
                            _this.closeByIndex(index);
                        }
                    } else {
                        _this.closeByIndex(index);
                    }
                },
                //设置current属性
                setCurrent: function (index) {
                    //移除isCurrent
                    for (var i = 0; i < this.labelPagesArr.length; i++) {
                        var item = this.labelPagesArr[i];
                        item.isCurrent = false;
                    }
    
                    this.labelPagesArr[index].isCurrent = true;
    
                    $('#' + id).find('.pt-nav li').removeClass('current');
                    $('#' + id).find('.pt-nav li').eq(index).addClass('current');
    
                },
                //根据index来关闭页面
                closeByIndex: function (index) {
                    $('#ptNavToolTips').remove();
                    //如果是object添加页面，则执行关闭页面
                    this.loadType == 'object'
                        ? this.labelPagesArr[index].config.closeHandler && this.labelPagesArr[index].config.closeHandler()
                        : "";
                    //取消定阅
                    functionHandler.closeHandler(index);
                    //移除数据
                    this.deleteContainerArr(index);
                    //进行计算  如果删除的是当前显示的页面，则将最后一个页面设为显示
                    //否则只将currentTab的值减一
                    if (this.currentTab == index) {
                        var currentShowDomIndex = this.labelPageLength - 1;
                        this.currentTab = currentShowDomIndex;
                        $(this.labelPagesArr[currentShowDomIndex].dom).removeClass('hidden');
                    } else if (this.currentTab > index) {
                        this.currentTab--;
                    }
                },
                //刷新
                refreshPage: function (index) {
                    var vm = this;
                    var currentPage = this.labelPagesArr[index];
                    var currentContainer = $(currentPage.dom);
                    currentContainer.empty();
                    var templateInit = vm.getContainerAndConfigName(currentPage.ajaxRes).templateInit;
                    var containerHtml = vm.getContainerAndConfigName(currentPage.ajaxRes).containerHtml;
                    var configName = vm.getContainerAndConfigName(currentPage.ajaxRes).configName;
                    //渲染到页面上
                    if (currentPage.isEditConfig) {
                        var addHtml = configName + ".package = " + configName + ".package + '.' +" + new Date().valueOf() + ";" + templateInit[0];
                        containerHtml = containerHtml.replace(/NetstarTemplate\.init[\s]*\((\S+)\)/, addHtml);
                    }
                    currentContainer.append(containerHtml);
                    functionHandler.refreshHandler(currentPage);
                },
                //根据位置弹出下拉
                mouseEnterCurrent: function (e) {
                    var $currentNav = $(e.target);
                    $('#placeholder-popupbox').append('<div id="ptNavToolTips" class="pt-nav-tooltips"><span>' + $currentNav.text() + '</span></div>');
                    $('#ptNavToolTips').css('position', 'absolute')
                        .css('top', $currentNav.offset().top + 40)
                        .css('left', $currentNav.offset().left)
                        .css('width', $currentNav.width() + 'px')
                        .css('z-index', 9999);
                    $currentNav.on('mouseleave', function () {
                        $('#ptNavToolTips').remove();
                    });
                },
                //移除全部标签
                removeAll: function () {
                    this.navFunctionShow = false;
                    $('#ptNavToolTips').remove();
                    var len = this.labelPageLength;
                    //移除所有
                    for (var i = len - 1; i >= 1; i--) {
                        this.deleteContainerArr(i);
                    }
                    this.currentTab = 0;
                    $(this.labelPagesArr[0].dom).removeClass('hidden');
                },
                //移除其他页面
                removeOther: function () {
                    this.navFunctionShow = false;
                    $('#ptNavToolTips').remove();
                    var len = this.labelPageLength;
                    //移除所有
                    for (var i = len - 1; i >= 1; i--) {
                        if (i == this.currentTab) continue;
                        this.deleteContainerArr(i);
                    }
                    this.currentTab = 1;
                    $(this.labelPagesArr[1].dom).removeClass('hidden');
                },
                //移除数组元素
                deleteContainerArr: function (index) {
                    if (typeof index != 'undefined') {
                        //移除当前容器
                        $(this.labelPagesArr[index].dom).remove();
                        this.labelPagesArr.splice(index, 1);
                    } else {
                        this.labelPagesArr.splice(this.labelPageLength - 1, 1);
                    }
                },
                //向页面数组中添加attrs
                setContainerArrAttrs: function (index, valueObj) {
                    if (typeof this.labelPagesArr[index].attrs == 'undefined') {
                        this.labelPagesArr[index].attrs = valueObj;
                    } else {
                        for (var key in valueObj) {
                            if (valueObj.hasOwnProperty(key)) {
                                var ele = valueObj[key];
                                this.labelPagesArr[index].attrs[key] = ele;
                            }
                        }
                    }
                },
                //添加点击dom关闭nav功能下拉
                toggleNavFunction: function () {
                    var vm = this;
                    this.navFunctionShow = !this.navFunctionShow;
                    //添加一些document点击事件
                    $(document).on('click', function (e) {
                        if ($(e.target).parents('.pt-tabbar-control').length == 0 && $(e.target).attr('class') != 'pt-dropdown-menu' && vm.navFunctionShow) {
                            vm.navFunctionShow = false;
                            $(document).off('click');
                        }
                    });
                },
                //是否在数组中
                arrayIsInclude: function (verItem, array) {
                    var index = -1;
                    // var verItem = verItem.substr(0, verItem.lastIndexOf('/')).replace(/\//g, '-');
                    for (var i = 0; i < this.labelPagesArr.length; i++) {
                        var item = this.labelPagesArr[i].url;
                        if (item.indexOf(verItem) != -1) {
                            index = i;
                        }
                    }
                    return index;
                },
                //是还有这个url，返回下标
                urlIsOpen: function (url) {
                    var subIndex = -1;
                    for (var index = 0; index < this.labelPagesArr.length; index++) {
                        var item = this.labelPagesArr[index];
                        if (url == item.url) {
                            subIndex = index;
                        }
                    }
                    return subIndex;
                },
                setContaienrConfig: function (url, currentConfig) {
                    //activityId  processId workItemId data_auth_code
                    var showField = 'activityId,activityName,processId,workItemId,data_auth_code'.split(',');
                    var $currentLi = $('#' + id).find('li').eq(this.labelPageLength - 1);
                    if (typeof currentConfig != 'undefined') {
                        if (typeof currentConfig.template != 'undefined') $currentLi.attr('ns-template', currentConfig.template);
                        if (typeof currentConfig.pageParam != 'undefined') {
                            //设置属性
                            NetStarUtils.setDomAttrsCaseSensitive($currentLi, currentConfig.pageParam, this.loadType == 'ajaxUrl' ? showField : undefined);
                        }
                        this.setContainerArrAttrs(this.labelPageLength - 1, currentConfig.pageParam);
                        this.loadType == 'ajaxUrl' ? this.labelPagesArr[this.labelPageLength - 1].config = $.extend(true, {}, currentConfig) : '';
                    } else {
                        this.labelPagesArr[this.labelPageLength - 1].config = '';
                    }
                },
                //根据li设置属性
                setDomAttr: function (domObj, valueObj) {
                    this.setContainerArrAttrs(this.labelPageLength - 1, valueObj);
                    NetStarUtils.setDomAttrsCaseSensitive(domObj.jqDom, valueObj);
                },
                //页面内弹窗
                innerDialog: function (dialogConfig) {
                    /**
                     * pageIndex:1,
                     * text:"有新消息，请点击刷新",
                     * btns:[
                     *   {
                     *     text:'刷新',
                     *     handler:function(){}
                     *   },
                     *   {
                     *     text:'刷新',
                     *     handler:function(){}
                     *   }
                     * ]
                     */
                    var vm = this;
                    var config = $.extend(true, {}, dialogConfig);
                    var setPage = this.labelPagesArr[dialogConfig.pageIndex];
                    var $currentCon = $(setPage.dom);
                    var dialogId = 'pageInnerDialog';
                    var pageInnerDialogVm = new Vue({
                        el: '#' + dialogId,
                        data: {
                            dialogId: dialogId,
                            config: config
                        },
                        created: function () {
                            $currentCon.append('<div class="ns-confirm-container" id="' + dialogId + '">\
                                                    <div class="confirm-body">\
                                                        <div class="confirm-content">{{config.text}}</div>\
                                                    </div>\
                                                    <div class="confirm-footer">\
                                                        <button v-for="(item,index) in config.btns" @click="buttonClick(item)" type="button" class="btn btn-success">\
                                                            <i class="fa-check"></i>\
                                                            <span>{{item.text}}</span>\
                                                        </button>\
                                                    </div>\
                                                </div>');
                        },
                        mounted: function () { },
                        methods: {
                            buttonClick: function (btn) {
                                btn.handler();
                                vm.refreshPage(config.pageIndex);
                            }
                        }
                    })
                }
            },
            computed: {
                labelPageLength: function () {
                    return this.labelPagesArr.length;
                }
            },
            watch: {
                labelPagesArr: function () {
                    this.$nextTick(function () {
                        var theLastIndex = this.labelPageLength - 1;
                        var $currentLi = $('#' + id).find('.pt-nav li').eq(theLastIndex);
                        $('#' + id).find('.pt-nav li').removeClass('current');
                        $currentLi.addClass('current');
                        //移除isCurrent
                        for (var index = 0; index < this.labelPagesArr.length; index++) {
                            var item = this.labelPagesArr[index];
                            item.isCurrent = false;
                        }
                        //设置attrs
                        typeof this.labelPagesArr[theLastIndex].attrs == 'undefined' ?
                            this.labelPagesArr[theLastIndex].attrs = {} :
                            '';
                        //设置isCurrent
                        this.labelPagesArr[theLastIndex].isCurrent = true;
                        this.labelPagesArr[theLastIndex].currentLi = $currentLi.get(0);
                        //添加两个方法
                        this.labelPagesArr[theLastIndex].setPlusClass = (function ($currentLi) {
                            return function (classStr) {
                                var currentLiClass = $currentLi.prop('class');
                                var mySelfClassNames = 'pt-nav-item';
    
                                $currentLi.attr('class', '');
                                $currentLi.addClass(mySelfClassNames);
                                $currentLi.addClass(classStr);
                            };
                        })($currentLi);
                        this.labelPagesArr[theLastIndex].getPlusClass = (function ($currentLi) {
                            return function () {
                                var mySelfClassNames = ['pt-nav-item', 'current'];
                                var currentLiClass = $currentLi.prop('class');
    
                                for (var index = 0; index < mySelfClassNames.length; index++) {
                                    var item = mySelfClassNames[index];
                                    currentLiClass = currentLiClass.replace(item, "");
                                }
                                return currentLiClass;
                            };
                        })($currentLi);
                    });
                }
            },
        });
        return rowNavVue;
    },
    //获取字典数据 修改 cy 2019.07.09
    getDictAjax:function(ajaxConfig){
        if (typeof (ajaxConfig) == 'undefined') {
            return false;
        }
        NetStarUtils.ajax(ajaxConfig, function (res) {
            var data = res.rows;
            var dictData = {};
            for (var dataI = 0; dataI < data.length; dataI++) {
                var dictType = data[dataI].dictIsTree === 1 ? 'tree' : 'list';//类型
                dictData[data[dataI].dictName] = {
                    type: dictType,
                    subdata: [],
                    jsondata: {},
                }
                for (var subI = 0; subI < data[dataI].dictValueList.length; subI++) {
                    var subObj = {
                        id: data[dataI].dictValueList[subI].dictKeyValue,
                        value: data[dataI].dictValueList[subI].dictKeyName,
                        parentId: data[dataI].dictValueList[subI].dictValueParentId,
                    }
                    // lyw 20190417 字典添加默认选中
                    if(data[dataI].dictValueList[subI].dictValueIsDefault===1){
                        subObj.selected = true;
                        subObj.isChecked = true;
                    }
                    dictData[data[dataI].dictName].subdata.push(subObj);
                    dictData[data[dataI].dictName].jsondata[data[dataI].dictValueList[subI].dictKeyValue] = data[dataI].dictValueList[subI].dictKeyName;
                }
                if (dictType === 'tree') {
                    var resConfig = {
                        textField: 'value',
                        valueField: 'id',
                        parentIdField: 'parentId',
                        idField: 'id',
                        childIdField: 'children',
                    }
                    dictData[data[dataI].dictName].subdata = NetStarUtils.getTreeDataByRows(dictData[data[dataI].dictName].subdata, resConfig);
                }
            }
            //先放到nsVals里面
            if(typeof(nsVals) != 'object'){
                nsVals = {};
            }
            nsVals.dictData = dictData;
        })
    },
    //获取可插入的字段 return $container 
    getAppendContainer:function () {
        var insertLocation = $('container:not(.hidden)').not('.content');
        if ($('.nswindow .content').length > 0) {
            insertLocation = $('.nswindow .content:last');
        }
        return insertLocation;
    }
}



