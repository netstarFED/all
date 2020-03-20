/*
 * @Desription: 标题区域 
 * @Author: netstar.cy
 * @Date: 2019-10-18 16:47:26
 * @LastEditTime : 2019-12-28 11:37:30
 */
define({
    /**config:
     * {
     *  el:'#tpeditor-topbar-panel',
     *  data:
     *     {
     *      title: '',
     *      subtitle: ''
     *     }
     *  }
     */
    init:function(config){
        this.default = $.extend(true, {}, config);
        this.refresh(config.data);
    },
    /**data:
     *{
     *   title: '',
     *   subtitle: ''
     *}
     */
    refresh:function(data){
        let _config = {};
        if(typeof(data)!='object'){
            _config = this.default;
        }else{
            _config = {
                el:this.default.el,
                data:data,
            }
        }
        let config = $.extend(true, {}, _config);
        this.config = config;
        this.titleHtml.init(config);
    },
    clear:function(){
        this.refresh({
            el:this.default.el,
            data:{
                title: '',
                subtitle: ''
            }
        });
    },
    //标题HTML控制
    titleHtml:{
        /**
         * 初始化和刷新的配置参数:
         * @param {object} config 
         * {
         *      el:string               DOM 例如 #nav-title
         *      data:{
         *          title:string        标题
         *          subtitle:string     辅助标题
         *      }
         * }
         */
        init:function(config){
            this.config = config;
            let html = this.getHtml(config.data);
            $(config.el).html(html);
            
        },
        html:
            '<div class="title">{{title}}</div>\
            <small class="subtitle">{{subtitle}}</small>',
        getHtml:function(_data){
            let html = NetstarEditorBase.utils.getTemplateHtml(this.html, _data);
            return html;
        }
    }
    

});