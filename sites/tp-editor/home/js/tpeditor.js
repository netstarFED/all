/*
 * @Desription: 模板页编辑器API Ver3.0.1
 * @Author: netstar.cy
 * @Date: 2019-12-15 14:56:47
 * @LastEditTime : 2019-12-28 14:20:56
 */

const NetstarTPEditor = (function () {
    //服务器端接口列表
    const urls = NetstarTPEditorConfig.urls;

    let api = {};
    let server = {};
    let data = {};
    let panels = {};
    

    //初始化服务器端数据
    function initServerData(){
        api = NetstarEditorApi.get(urls);
        //获取组件组件配置 不管要做什么都需要组件配置才能执行
        api.getComponents.get().then(function(res){
            server.components = res;
        })
    }

    
    

    //所有面板的初始化方法
    function initPanels(){
        
        require(["user","title"], function(userPanel, titlePanel){

            //初始化用户及下拉列表
            panels.user = userPanel;
            userPanel.init({
                el:'#tpeditor-panel-user',
                cb:function(res){
                    data.user = res.data.user;
                    data.context = res.data.context;
                }
            });

            //初始化标题区域
            panels.title = titlePanel;
            titlePanel.init({
                el:'#tpeditor-panel-title',
                data:{
                    title: '',
                    subtitle: ''
                }
            });
        });
    }

    function init(cb){
        //初始化接口
        initServerData();
    }
    init();

    function show(){
        //初始化面板
        initPanels();
    }
    
    return {
        VERSION:'3.0.1',
        init:init, 
        show:show,
        
        server:server,  //服务器端数据
        api: api,       //服务器API接口
        data:data,      //显示数据
        panels:panels,  //面板
    }
})()