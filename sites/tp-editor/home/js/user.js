/*
 * @Desription: 用户信息及用户操作面板
 * @Author: netstar.cy
 * @Date: 2019-10-18 16:47:26
 * @LastEditTime : 2019-12-28 14:19:30
 */
define(function(){
    
    let info = {};
    let config = {};
    /** 初始化user菜单配置参数
     * config:{
     *      el:string 用于输出菜单的el 例如'#nav-user'
     *      cb:function 完成后回调，返回的结果是获取用户属性的数值
     * } 
     * 
    */
    function init(config){

        let el = config.el;
        let cb = config.cb;
        
        let _this = this;
        NetstarTPEditor.api.user.get().then(function(res){
            if(res.success){
                _this.set(res.data.user);
                _this.setMenus(el);
                cb && cb(res);
            }
        })
    }

    //通过地址栏获取login地址
    let loginUrl = '';
    let urlPara = NetStarUtils.getUrlPara();
    if(typeof(urlPara) == 'object'){
        if(urlPara.form == 'login'){
            loginUrl = urlPara.source;
        }
    }

    function set(_info){
        info = _info;
    }
    function get(){
        return info;
    }
    
    function toLoginPage(){
        if(loginUrl == ''){
            //进来的时候没获取到 那就从地址栏里试着找
            let url = window.location.href;
            let urlOrigin = window.location.origin;
            let path = url.substr(urlOrigin.length + 1);
            path = path.substr(0, path.indexOf('/')+1);
            loginUrl = urlOrigin +'/'+ path;
        }
        window.location.href = loginUrl;
    }
    function setMenus(el){
        //el:string 例如：'#id'
        NetstarEditorBase.navDropdown.init({
            el:el,
            title: info.userName,
            items:[
                {
                    text:'<span class="font_color">退出登录</span>',
                    handler:function(){
                        console.log('退出登录');
                        NetStarUtils.OAuthCode.clear();
                        toLoginPage();
                    }
                }
            ]
        });
    }
    
    return {
        init:init,
        get:get,
        set:set,
        setMenus:setMenus,
    }
});