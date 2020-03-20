/*
 * @Desription: 基本编辑器功能 不包含具体的编辑器功能
 * @Author: netstar.cy
 * @Date: 2019-12-24 16:47:26
 * @LastEditTime : 2019-12-28 14:32:13
 */
var NetstarEditorBase = {};

NetstarEditorBase.utils = {}; //基本工具集

/**
 * 根据表达式获取替换后的string   
 * 举例： 
 *      <span>{user}</span> => <span>admin</span>
 * @param {string}  source       文本
 * @param {string/array} expression   表达式 格式如下：{user},可以是数组
 * @param {string/array} value        用于替换表达式的值
 */
NetstarEditorBase.utils.getStringByExpression = function(source, expression, value){
    var str = '';
    
    function getResult(_source, _value, _regExp){
        var _str = _source.replace(_regExp, _value);
        return _str;
    }
    if($.isArray(expression) == false){
        //表达式不是数组直接替换后返回
        var regExp = new RegExp(expression, 'g');
        str = getResult(source, value, regExp);
    }else{
        if($.isArray(value) == false){
            console.error('getStringByExpression 错误， 表达式是数组，而值不是数组，请核实参数');
            console.error(expression);
            console.error(value);
            return false
        }
        if(expression.length != value.length){
            console.error('getStringByExpression 错误， 表达式数组长度必须与值的素质长度一致');
            console.error(expression);
            console.error(value);
            return false;
        }
        var _source = source;
        for(var i = 0; i<expression.length; i++){
            var regExp = new RegExp(expression[i], 'g');
            _source = getResult(_source, value[i], regExp);
        }
        str = _source;
    }
    
    return str;
}

/**
 *根据模板和数据返回代码 基于Handlebars
 *
 * @param {string} templateHtml     模板代码
 * @param {object} context          数据对象
 */
NetstarEditorBase.utils.getTemplateHtml = function(templateHtml, context){
    var template = Handlebars.compile(templateHtml);
    var html = template(context);
    return html;F
}

NetstarEditorBase.utils.ajax = NetStarUtils.ajax;
NetstarEditorBase.init = (function(){
    //生成退出登录方法
    if(typeof(NetstarHomePage.config)!='object'){
        NetstarHomePage.config = {
            toLoginPage:function(){
                //如果有来源参数 地址栏里的source 则退出使用 http://localhost:2000/tpeditor/home/?form=login&source=http://localhost:2000/tpeditor/
                var loginSource = '';
                var urlPara = NetStarUtils.getUrlPara();
                if(typeof(urlPara) == 'object'){
                    if(typeof(urlPara.source) == 'string'){
                        loginSource = urlPara.source;
                    }
                }
                //如果地址栏里没有，则根据当前地址栏拼接一个 例如 http://localhost:2000/tpeditor/
                if(loginSource == ''){
                    var origin = window.location.origin;
                    var pathname = window.location.pathname;
                    pathname = pathname.substr(0,pathname.indexOf('/home/')+1);  // =>/tpeditor/
                    var url = origin + pathname;
                    window.location.href = url;
                }
                
            }
        }
    }
    return {

    }
})()



//导航栏Nav下拉组件
NetstarEditorBase.navDropdown = {
    html:
        '<a href="javascript:void(0);" nseditor="dropdown-title" >\
            <span>{title}</span>\
            <i class="fa-caret-down"></i>\
        </a>\
        <div class="pt-top-nav-block hide"  nseditor="dropdown-items">\
            <ul>{items}</ul>\
        </div>',
    itemHtml:
        '<li class="pt-top-menu-item" style="position: relative;">\
            <div class="pt-top-menu-item-row">\
                <a href="javascript:void(0);" class="pt-nav-item logout" nseditor="dropdown-item" nseditor-index="{index}">\
                    {text}\
                </a>\
            </div>\
        </li>',
    /**
     * 初始化
     * @param {object} config 配置参数
     * {
     *  el:string       容器  例如：#nav-user
     *  title:string    标题
     *  items:array     下拉列表
     *      [{text:string 文字, handler:function 方法}]
     * }
     */
    config:{},
    init:function(config){
        this.config = config;
        var html = this.getHtml();
        var $container = $(config.el);
        this.$container = $container;
        $container.html(html);

        //title部分
        var $dropdownTitle = this.$container.find('[nseditor="dropdown-title"]');
        this.$dropdownTitle = $dropdownTitle;

        //列表面板
        var $dropdownItems = this.$container.find('[nseditor="dropdown-items"]');
        this.$dropdownItems = $dropdownItems;

        //列表项
        var $dropdownItem = this.$container.find('[nseditor="dropdown-item"]');
        this.$dropdownItem = $dropdownItem;

        //初始化所有事件
        this.initEvent();
    },
    getHtml:function(){
        var _this = this;
        var itemsHtml = this.getItemsHtml(_this.config.items);
        var html = NetstarEditorBase.utils.getStringByExpression(_this.html, ['{title}','{items}'], [_this.config.title, itemsHtml]);
        return html;
    },
    getItemsHtml:function(items){
        //items:array {text:'', handler:function}
        var itemsHtml = '';
        for(var i=0; i<items.length; i++){
            var itemHtml = NetstarEditorBase.utils.getStringByExpression(this.itemHtml, ['{text}','{index}'], [items[i].text, i]);
            itemsHtml += itemHtml;
        }
        return itemsHtml;
    },
    initEvent:function(){
        var _this = this;
        _this.$dropdownTitle.on('click', _this.events.titleClick);
        _this.$dropdownItem.on('click', _this.events.itemClick);
    },
    //关闭列表
    hideItems:function(){
        var _this = this;
        _this.$dropdownItems.addClass('hide');
        $('body').off('click', _this.events.bodyClick);
    },
    //执行列表项方法
    callItem:function(index){
        var _this = this;
        var cb = _this.config.items[index].handler;
        cb && cb();
    },
    events:{
        //title点击切换隐藏
        titleClick:function(ev){
            ev.stopPropagation();
            var _this = NetstarEditorBase.navDropdown;
            _this.$dropdownItems.toggleClass('hide');
            
            if(_this.$dropdownItems.hasClass('hide')){
                //如果是隐藏，则去掉document事件
                $('body').off('click', _this.events.bodyClick);
            }else{
                //如果是显示，则添加对document的监视，点击后关闭
                $('body').off('click', _this.events.bodyClick);
                $('body').on('click', _this.events.bodyClick);
            }
        },
        //body点击关闭下拉
        bodyClick:function(ev){
            var _this = NetstarEditorBase.navDropdown;
            _this.hideItems();
        },
        //item点击,执行对应的方法
        itemClick:function(ev){
            var _this = NetstarEditorBase.navDropdown;
            var index = parseInt($(this).attr('nseditor-index'));
            _this.callItem(index);
        },
    }
}