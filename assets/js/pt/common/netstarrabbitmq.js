
var NetStarRabbitMQ = (function(){
    var subscribeQueue = {};    // 建立的连接对象
    var pageSubscribe = {};     // 模拟页面订阅
    var infosArr = [];
    var pageInfosArr = [];
    var mindInfosArr = [];
    var subscribeCallBackFuncByTarget = {}
    var stateTypes = {
        "0" : false,
        "1" : false,
        "2" : true,
        "3" : true,
        "4" : false,
        "5" : false,
        "16" : false,
        "32" : false,
        "128": false,
    };
    function setMessageIsLink(){
        var isLink = true;
        if(NetstarLocalResources.link && !NetstarLocalResources.linkSuccess){
            isLink = false;
        }
        if(NetStarRabbitMQ.linkSuccess == false){
            isLink = false;
        }
        if(isLink){
            if(typeof(NetstarMainPage.mainPageVueConfig) == "onject"){
            }else{
                if($('#ns-link-icon').length > 0){
                    $('#ns-link-icon').removeClass('icon-unlink-o');
                    $('#ns-link-icon').removeClass('icon-link-o');
                   $('#ns-link-icon').addClass('icon-link-o');
                }
            }
        }
        if(NetStarRabbitMQ.linkSuccess == true){
            if(typeof(NetstarMainPage.mainPageVueConfig) == "onject"){
                NetstarMainPage.mainPageVueConfig.domParams.link.MQ.isLink = true;
                NetstarMainPage.mainPageVueConfig.domParams.link.MQ.state = '已开启';
                if($('#ns-link-mq-state').length > 0){
                    $('#ns-link-mq-state').text('已开启');
                }
            }else{
                if($('#ns-link-mq-state').length > 0){
                    $('#ns-link-mq-state').text('已开启');
                }
            }
        }else{
            if(typeof(NetstarMainPage.mainPageVueConfig) == "object"){
                NetstarMainPage.mainPageVueConfig.domParams.link.MQ.isLink = false;
                NetstarMainPage.mainPageVueConfig.domParams.link.MQ.state = '已关闭';
                if($('#ns-link-mq-state').length > 0){
                    $('#ns-link-mq-state').text('已关闭');
                }
            }else{
                if($('#ns-link-mq-state').length > 0){
                    $('#ns-link-mq-state').text('已关闭');
                }
            }
        }
        if(NetstarLocalResources.isLink){
            if(NetstarLocalResources.linkSuccess){
                if(typeof(NetstarMainPage.mainPageVueConfig) == "onject"){
                    NetstarMainPage.mainPageVueConfig.domParams.link.netstar.isLink = true;
                    NetstarMainPage.mainPageVueConfig.domParams.link.netstar.state = '已开启';
                    if($('#ns-link-netstar-state').length > 0){
                        $('#ns-link-netstar-state').text('已开启');
                    }
                }else{
                    if($('#ns-link-netstar-state').length > 0){
                        $('#ns-link-netstar-state').text('已开启');
                    }
                }
            }else{
                if(typeof(NetstarMainPage.mainPageVueConfig) == "object"){
                    NetstarMainPage.mainPageVueConfig.domParams.link.netstar.isLink = false;
                    NetstarMainPage.mainPageVueConfig.domParams.link.netstar.state = '已关闭';
                    if($('#ns-link-netstar-state').length > 0){
                        $('#ns-link-netstar-state').text('已关闭');
                    }
                }else{
                    if($('#ns-link-netstar-state').length > 0){
                        $('#ns-link-netstar-state').text('已关闭');
                    }
                }
            }
        }
    }
    function unsubscribeByUntId(unitId){
        if(!pageSubscribe[unitId]){
            return;
        }
        // 刷新数据
        var attrName = '';
        var attrKey = '';
        switch(pageSubscribe[unitId].type){
            case 'vo':
                attrKey = 'workitemId';
                attrName = 'workItemOpenTimestamp';
                break;
            case 'list':
                attrKey = 'activityId';
                attrName = 'activityOpenTimestamp';
                break;
            case 'workflow':
                attrKey = 'instanceIds';
                attrName = 'workflowOpenTimestamp';
                break;
        }
        var workItems = NetStarRabbitMQ.classManageInfo.workItems;
        for(var key in workItems){
            if(workItems[key][attrKey] == pageSubscribe[unitId].key){
                workItems[key][attrName] = new Date().getTime();;
            }
        }
        if(typeof(subscribeQueue[unitId])!='undefined'){
            NetStarRabbitMQ.client.unsubscribe(subscribeQueue[unitId].id);
            delete subscribeQueue[unitId];
        }else{
            if(typeof(pageSubscribe[unitId])!='undefined'){
                delete pageSubscribe[unitId];
            }
        }
    }
    function subscribe(subscribeConfig){
        /**
         * subscribeConfig {}
         * target               string          /exchange/交换机名/路由键   /exchange/wf/wf.workitem.*.1111.# 
         * callbackHandler      function        function(frame){}
         * content              object          {}
         * unitId               string          订阅名
         */
        // 验证参数配置
        var optionArr = 
        [
            ['target',              'string',       true],
            ['callbackHandler',     'function',     true],
            ['content',             'object',       true],
            ['unitId',              'string',       true],
        ]
        var isValid = nsDebuger.validOptions(optionArr, subscribeConfig);
        if(!isValid){
            console.error('订阅配置错误');
            console.error(subscribeConfig);
            return false;
        }
        unsubscribeByUntId(subscribeConfig.unitId);
        var client = NetStarRabbitMQ.client;
        if(typeof(client) == "undefined"){
            console.error('没有建立连接不能进行订阅');
            return;
        }
        for(var key in NetStarRabbitMQ.content){
            subscribeConfig.content[key] = NetStarRabbitMQ.content[key];
        }
        subscribeCallBackFuncByTarget[subscribeConfig.target] = subscribeConfig.callbackHandler;
        subscribeQueue[subscribeConfig.unitId] = client.subscribe(subscribeConfig.target, function(frame){
            console.warn('收到订阅消息:');
            console.warn(frame);
            // var body = frame.body;
            // var bodyObj = JSON.parse(body);
            // if(typeof(bodyObj.excute) != "undefined"){
            //     NetStarUtils.removeLoading();
            //     return ;
            // }
            // subscribeConfig.callbackHandler(frame);
            var headersDestination = frame.headers.destination;
            for(var key in subscribeCallBackFuncByTarget){
                var rex = key.replace(/\#|\*/g, '(.*?)');
                rex = new RegExp(rex);
                if(rex.test(headersDestination)){
                    subscribeCallBackFuncByTarget[key](frame);
                    break;
                }
            }
        }, subscribeConfig.content);
    }
    function send(){
        // client.send('/exchange/交换机名/路由键', {}, "Hello");
        console.log('发送');
    }
    function setDefault(config){
        var defaultConfig = {
            vhost : '/',
        }
        nsVals.setDefaultValues(config, defaultConfig);
    }
    function validata(config){
        var optionArr = 
        [
            ['ws',          'string',       true],
            ['toekn',       'string',       true],
            ['vhost',       'string',       false],
            ['content',     'object',       false],
        ]
        var isValid = nsDebuger.validOptions(optionArr, config)
        return isValid;
    }
    function getTokenByCookie(){
        var Authorization = NetStarUtils.cookie.get('Authorization');
        var queueStr = false;
        if(typeof(Authorization)=="string"){
            var encodeStr = Authorization.split('.')[1];
            if(encodeStr){
                var decodeStr = NetStarUtils.Base64.decode(encodeStr);
                var queueInfo = JSON.parse(decodeStr.match(/\{(.*?)\}/)[0])
                var queueStr = queueInfo.queue;
                if(typeof(queueStr)!="string"){
                      queueStr = false;  
                }
            }
        }
        if(!queueStr){
            nsAlert('cookie获取token失败', 'error');
            console.error('cookie获取token失败');
        }
        return queueStr;
    }
    // mq连接
    function connect(){
        var connectConfig = NetStarRabbitMQ.connectConfig;
        NetStarRabbitMQ.client.connect(
            connectConfig.token, 
            '', 
            connectConfig.on_connect, 
            connectConfig.on_error, 
            connectConfig.vhost
        );
        // NetStarRabbitMQ.client.connect(
        //     'admin197', '197', 
        //     connectConfig.on_connect, 
        //     connectConfig.on_error, 
        //     connectConfig.vhost
        // );
        // NetStarRabbitMQ.client.connect(
        //     'cloud', 'netstar-cloud-web', 
        //     connectConfig.on_connect, 
        //     connectConfig.on_error, 
        //     connectConfig.vhost
        // );
    }
    function init(config){
        /**
         * config {}
         * ws       string      wsUrl地址 ws://10.10.10.207:15672/ws
         * toekn    string      TAKEN 用户令牌
         * vhost    string      虚拟主机
         * successHandler function  成功回调
         */
        setDefault(config);
        var isTrue = validata(config);
        if(!isTrue){
            console.error('配置参数误，没有建立连接');
            console.error(config);
            return false;
        }
        var content = typeof(config.content)=="object"?config.content:{};
        NetStarRabbitMQ.content = content;
        NetStarRabbitMQ.config = config;
        NetStarRabbitMQ.toporgId = typeof(config.toporgId)=="string"?config.toporgId:false;
        NetStarRabbitMQ.userId = typeof(config.userId)=="string"?config.userId:false;
        NetStarRabbitMQ.subscribeQueue = subscribeQueue;
        NetStarRabbitMQ.pageSubscribe = pageSubscribe;    // 模拟页面订阅

        // content['x-queue-name'] = 'ns-systemRabbitMQ-'+NetStarRabbitMQ.toporgId+'-'+NetStarRabbitMQ.userId;
        // 通过cookie获得token即‘x-queue-name’
        content['x-queue-name'] = getTokenByCookie();

        var url = config.ws;
        var token = config.toekn;
        var vhost = config.vhost;
        var ws = new WebSocket(url);
        NetStarRabbitMQ.frequency = 0;
        NetStarRabbitMQ.client = Stomp.over(ws); // 建立连接成功后生成一个client对象：NetStarRabbitMQ.client，该对象用于之后的发送和订阅消息等
        NetStarRabbitMQ.client.debug = null;
        var on_connect = function() {
            console.log('webSocket连接成功');
            NetStarRabbitMQ.frequency = 0;
            NetStarRabbitMQ.linkSuccess = true;

            setMessageIsLink();

            if(typeof(config.successHandler)=="function"){
                config.successHandler();
            }
            if(typeof(config.callbackFunc)=="function"){
                config.callbackFunc(true);
            }
        };
        var on_error =  function(error) {
            NetStarRabbitMQ.frequency ++;
            NetStarRabbitMQ.linkSuccess = false;
            setMessageIsLink();
            // if(NetStarRabbitMQ.frequency > 1){
                if(typeof(config.callbackFunc)=="function"){
                    config.callbackFunc(false);
                }
                // nsAlert('webSocket连接错误','error');
                console.error('webSocket连接错误:');
                console.error(error);
                return;
            // }
            // nsAlert('即将重新连接webSocket','warning','warning',10000);
            // console.warn('即将重新连接webSocket');
            // console.log(NetStarRabbitMQ.frequency);
            // connect();
        };
        NetStarRabbitMQ.connectConfig = {
            token : token, 
            on_connect : on_connect, 
            on_error : on_error, 
            vhost : vhost,
        }
        //vhost
        connect();
        // NetStarRabbitMQ.client.connect(
        //     token, 
        //     '', 
        //     on_connect, 
        //     on_error, 
        //     vhost
        // );
        // NetStarRabbitMQ.client.connect('admin', '123', on_connect, on_error, vhost);
    }
    // 保存连接配置
    function saveRabbitMQLinkConfig(rabbitMQLinkConfig){
        NetStarRabbitMQ.rabbitMQLinkConfig = rabbitMQLinkConfig;
    }
    // 通过saveConfig建立连接
    function connectBySaveConfig(waitingList, callbackFunc){
        var rabbitMQLinkConfig = NetStarRabbitMQ.rabbitMQLinkConfig;
        waitingList = $.isArray(waitingList) ? waitingList : [];
        // 格式化数据 保存数据
        var waitings = {};
        for(var i=0; i<waitingList.length; i++){
            waitingList[i].workitemList = $.isArray(waitingList[i].workitemList) ? waitingList[i].workitemList : [];
            waitings[waitingList[i].activityId] = waitingList[i];
        }
        // 所有数据分类管理器
        NetStarRabbitMQ.classManageInfo = {
            activitys : {},
            workItems : {},
            workItemList : [],
            waitings : waitings,
            waitingList : waitingList,
            processs : {},
            instances : {},
        };
        // 建立连接
        if(typeof(rabbitMQLinkConfig)!="object"){
            console.log('无法建立连接');
            console.log(rabbitMQLinkConfig);
            return;
        }
        rabbitMQLinkConfig.successHandler = function(){
            // 订阅
            var subConfig = {
                name: "NetStarRabbitMQName",
            }
            NetStarRabbitMQ.setSystemSubscribe(subConfig);
            mindSubscribeManage.subscribe();
            pageSubscribeManage.subscribe();
        };
        rabbitMQLinkConfig.callbackFunc = callbackFunc;
        NetStarRabbitMQ.init(rabbitMQLinkConfig);
    }
    /*****************思维导图订阅开始********************/
    var mindSubscribeManage = {
        // 页面订阅
        subscribe: function(){
            var subscribeConfig = {
                target : '/exchange/cache/platform.cache.mindmap.#',
                unitId : 'NetStarRabbitMQMind',
                content : {},
                callbackHandler : function(subscribeInfo){
                    // console.warn('思维导图');
                    mindInfosArr.push(subscribeInfo);
                    var mainInfo = JSON.parse(subscribeInfo.body);
                    var mindId = mainInfo.id;
                    var cachePageDataByMindId = pageProperty.cachePageDataByMindId;
                    if(cachePageDataByMindId){
                        var mindIdobj = cachePageDataByMindId[mindId];
                        if(typeof(mindIdobj) == "object"){
                            for(var key in mindIdobj){
                                mindIdobj[key].isUpdate = true;
                            }
                        }
                    }
                },
            }
            NetStarRabbitMQ.subscribe(subscribeConfig);
        },
    }
    /*****************思维导图订阅结束********************/
    /*****************页面订阅开始********************/
    var pageSubscribeManage = {
        // 页面订阅
        subscribe: function(){
            var subscribeConfig = {
                target : '/exchange/cache/platform.cache.page.#',
                unitId : 'NetStarRabbitMQPage',
                content : {},
                callbackHandler : function(subscribeInfo){
                    console.warn('收到页面订阅消息:');
                    pageInfosArr.push(subscribeInfo);
                    infosArr.push(subscribeInfo);
                    var mainInfo = JSON.parse(subscribeInfo.body);
                    var pageId = mainInfo.pageId;
                    var cachePageDataByPageId = pageProperty.cachePageDataByPageId;
                    if(cachePageDataByPageId && cachePageDataByPageId[pageId]){
                        cachePageDataByPageId[pageId].isUpdate = true;
                    }
                },
            }
            NetStarRabbitMQ.subscribe(subscribeConfig);
        },
    }
    /*****************页面订阅结束********************/

    /*****************系统订阅开始******************/
    // 系统页面订阅
    function setSystemSubscribe(subConfig){
        // subConfig     订阅的相关配置
        /**
         * name         string          订阅名
         * content       object         订阅需要的参数 
         */
        // 验证传入值
        var optionArr = [
            ['name',            'string',           true],
            ['content',         'object',           false],
        ]
        var isValid = nsDebuger.validOptions(optionArr, subConfig);
        if(!isValid){
            nsAlert("订阅失败，请检查订阅配置",'error');
            console.error(subConfig);
            return false;
        }
        var toporgId = NetStarRabbitMQ.toporgId;
        var userId = NetStarRabbitMQ.userId;
        if(!toporgId || !userId){
            nsAlert("订阅失败，请检查页面参数toporgId/userId",'error');
            console.error("订阅失败，请检查页面参数toporgId/userId");
            return false;
        }
        // 订阅地址
        var targetUrl = '/exchange/wf/' + $.trim(toporgId);
        targetUrl += '.wf.*.*.*.*.*.' + $.trim(userId);
        // var targetUrl = '/exchange/wf/1.wf.*.*.*.*.WAITING.1';
        var content = typeof(subConfig.content)=="object"?subConfig.content:{};
        var subscribeConfig = {
            target : targetUrl,
            unitId : subConfig.name,
            content : content,
            callbackHandler : function(subscribeInfo){
                console.warn('收到页面订阅消息:');
                infosArr.push(subscribeInfo);
                var mainInfo = JSON.parse(subscribeInfo.body);
                var subscribeInfo = mainInfo.subscribeInfo;
                var timestamp = Number(mainInfo.timestamp);
                var workitemInfo = mainInfo.workitemInfo;
                recordSystemSubscribeData(workitemInfo, timestamp); // 记录订阅数据
                refreshPage(workitemInfo);
            },
            plusInfo:'系统订阅',
        }
        NetStarRabbitMQ.subscribe(subscribeConfig);
    }
    // 记录系统订阅数据
    function recordSystemSubscribeData(workitemInfo, timestamp){
        if(typeof(workitemInfo)!="object"){
            return false;
        }
        var workItemList = NetStarRabbitMQ.classManageInfo.workItemList;    // 工作项对象
        var workItems = NetStarRabbitMQ.classManageInfo.workItems;    // 工作项对象
        var activitys = {};    // 环节对象
        // 处理待办信息
        var waitings = NetStarRabbitMQ.classManageInfo.waitings;      // 环节对象
        var waitingList = NetStarRabbitMQ.classManageInfo.waitingList;      // 环节对象
        NetStarRabbitMQ.classManageInfo.prevWaitings = $.extend(true, {}, waitings);
        // 是否存在 根据状态确定是否删除
        var isHadHave = false;
        for(var i=0; i<waitingList.length; i++){
            var waiting = waitingList[i];
            var workitemsWaiting = waiting.workitemList;
            for(var j=0; j<workitemsWaiting.length; j++){
                var workitemWait = workitemsWaiting[j];
                if(workitemWait.workitemId == workitemInfo.workitemId){
                    isHadHave = true;
                    var sourceType = workitemWait.workitemState;
                    var newType = workitemInfo.workitemState;
                    if(stateTypes[newType]){ // 新增 目前表示3
                        if(stateTypes[sourceType]){ // 新增 目前表示2
                            // 修改状态 不增加新数据
                            break;
                        }else{
                            // 不会存在这个情况
                        }
                    }else{
                        // 删除
                        workitemsWaiting.splice(j,1);
                        waiting.workitemCount -= 1;
                        break;
                    }
                }
            }
            if(isHadHave){
                break;
            }
        }
        if(!isHadHave){
            // 现在待办中没有 消息中的环节 
            // 刷新
            NetstarUI.message.refreshMessage(function(_waitingList){
                _waitingList = $.isArray(_waitingList) ? _waitingList : [];
                // 格式化数据 保存数据
                var _waitings = {};
                for(var i=0; i<_waitingList.length; i++){
                    _waitingList[i].workitemList = $.isArray(_waitingList[i].workitemList) ? _waitingList[i].workitemList : [];
                    _waitings[_waitingList[i].activityId] = _waitingList[i];
                }
                NetStarRabbitMQ.classManageInfo.waitingList = _waitingList;
                NetStarRabbitMQ.classManageInfo.waitings = _waitings;
            })
        }
        // 保存获得的数据
        var isHadSave = false;
        workitemInfo.timestamp = timestamp;
        for(var workitemI=0; workitemI<workItemList.length; workitemI++){
            var workitem = workItemList[workitemI];
            if(workitemInfo.workitemId == workitem.workitemId){
                workItemList[workitemI] = {};
                workItemList[workitemI] = workitemInfo;
                isHadSave = true;
            }
        }
        if(!isHadSave){
            workItemList.push(workitemInfo);
        }
        workItems[workitemInfo.workitemId] = workitemInfo;
        function getActivityByName(_workItemObj){
            var _activity = {};
            for(var activityId in activitys){
                if(_workItemObj.activityName == activitys[activityId].activityName){
                    _activity = activitys[activityId];
                    break;
                }
            }
            if($.isEmptyObject(_activity)){
                activitys[_workItemObj.activityId] = {
                    processId : _workItemObj.processId,
                    processName : _workItemObj.processName,
                    activityId : _workItemObj.activityId,
                    activityName : _workItemObj.activityName,
                    workItemList : [],
                    workItems : {},
                }
                _activity = activitys[_workItemObj.activityId];
            }
            return _activity;
        }
        // 生成环节对象
        for(var workitemI=0; workitemI<workItemList.length; workitemI++){
            // if(typeof(activitys[workItemList[workitemI].activityId])!="object"){
            //     var workitemConfig = workItemList[workitemI];
            //     activitys[workitemConfig.activityId] = {
            //         processId : workitemConfig.processId,
            //         processName : workitemConfig.processName,
            //         activityId : workitemConfig.activityId,
            //         activityName : workitemConfig.activityName,
            //         workItemList : [],
            //         workItems : {},
            //     }
            // }
            // console.warn(workitemConfig);
            // activitys[workItemList[workitemI].activityId].workItemList.push(workitemConfig);
            // activitys[workItemList[workitemI].activityId].workItems[workitemConfig.workitemId] = workitemConfig;
            var _activity = getActivityByName(workItemList[workitemI]);
            _activity.workItemList.push(workItemList[workitemI]);
            _activity.workItems[workItemList[workitemI].workitemId] = workItemList[workitemI];
        }
        NetStarRabbitMQ.classManageInfo.activitys = activitys;
        var processs = {};
        for(var activityId in activitys){
            if(typeof(processs[activitys[activityId].processId])!="object"){
                processs[activitys[activityId].processId] = {};
            }
            processs[activitys[activityId].processId][activitys[activityId].activityId] = activitys[activityId];
        }
        NetStarRabbitMQ.classManageInfo.processs = processs;
        var instances = {};
        for(var workitemI=0; workitemI<workItemList.length; workitemI++){
            if(typeof(instances[workItemList[workitemI].instanceIds])!="object"){
                instances[workItemList[workitemI].instanceIds] = {};
            }
            instances[workItemList[workitemI].instanceIds][workItemList[workitemI].workitemId] = workItemList[workitemI];
        }
        NetStarRabbitMQ.classManageInfo.instances = instances;
        setInfoRemindByCurrent(workitemInfo); // 通过当前显示设置新消息提醒
    }
    // 通过当前显示刷新订阅数据
    function setInfoRemindByCurrent(workitemInfo){
        var tabsConfig = NetstarUI.labelpageVm.labelPagesArr; // tab页配置
        // 页面类型是workflow，刷新订阅消息
        function refreshSubscribeDataByWorkflow(tabConfig){
            var pageParams = tabConfig.attrs;
            var pageType = getPageType(pageParams);
            // if(pageType == 'workflow'){
                refreshSubscribeData(pageParams);
            // }
        }
        var userId = NetstarMainPage.config.nsUserId;
        for(var i=0; i<tabsConfig.length; i++){
            var tabConfig = tabsConfig[i];
            if(tabConfig.isCurrent && workitemInfo.transactor == userId){
                refreshSubscribeDataByWorkflow(tabConfig);
                break;
            }
        }
        // 刷新没有打开的activity 没有打开过的自动标记时间戳 因为打开时是刷新后的数据不用提示有新消息
        var activitys = NetStarRabbitMQ.classManageInfo.activitys;          // 环节对象
        for(var key in activitys){
            var isHedTab = false;
            for(var j=0; j<tabsConfig.length; j++){
                var tabConfig = tabsConfig[j];
                if( tabConfig.config && 
                    (tabConfig.config.template == 'docListViewer' || tabConfig.config.template == 'businesslevellist3') && 
                    tabConfig.attrs.activityName &&
                    tabConfig.attrs.activityName == activitys[key].activityName
                ){
                    isHedTab = true;
                    break;
                }
            }
            if(!isHedTab){
                var obj = {
                    attrs : {
                        pagename : '',
                        processId : activitys[key].processId,
                        activityId : activitys[key].activityId,
                        activityName : activitys[key].activityName,
                    }
                }
                refreshSubscribeDataByWorkflow(obj);
            }
        }
        setInfoRemind();
    }
    // 获取页面类型 other / activity / workItem / workflow
    function getPageType(pageParams){
        var pageType = 'other'; // workflow工作流页面 / template模版页面 / other 其他页面
        if(pageParams.pagename == "workflow"){
            pageType = 'workflow';
        }else{
            if(typeof(pageParams.workItemId)=="string"){
                pageType = 'workItem';
            }else{
                if(typeof(pageParams.activityId)=="string"){
                    var templateName = pageParams.template;
                    switch(templateName){
                        case 'processDocBase':
                            // 表示新增时打开 是工作项但没有workitemId标识 不打标签
                            break;
                        default:
                            // 环节页面
                            pageType = "activity";
                            break;
                    }
                }
            }
        }
        return pageType;
    }
    // 进入页面时执行
    function inPageHandler(pageParams, currentPage){
        if(NetStarRabbitMQ && typeof(NetStarRabbitMQ.classManageInfo) !== "object" || $.isEmptyObject(typeof(NetStarRabbitMQ.classManageInfo))){
            return ;
        }
        if(typeof(pageParams)!="object"){
            // 传参错误
            console.error('页面传参错误');
            return;
        }
        if(currentPage && typeof(currentPage.config) != "object"){
            return;
        }
        if(typeof(NetStarRabbitMQ.pageSubscribe[currentPage.config.package]) != "object" && currentPage.config.type != "workflowTab"){
            return;
        }
        var pageType = getPageType(pageParams); // workflow工作流页面 / workItem/activity模版页面 / other 其他页面
        switch(pageType){
            case 'activity':
            // case 'workItem':
                var tips = getPageNewInfo(pageParams); // 当前页面获取的新消息
                if(tips.length>0){
                    // nsAlert('您收到了新消息，请点击刷新', 'warning');
                    console.warn('您收到了新消息，请点击刷新');
                    var package = currentPage.config.package;
                    var alertHtml = '<div class="pt-message-alert">'
                                        + '<p class="pt-message-alert-text">您收到了新消息，请点击刷新</p>'
                                        + '<div class="pt-btn-group">'
                                            + '<button class="pt-btn pt-btn-default" onclick=\"NetstarTemplate.refreshByPackageWithoutData\(\''
                                                + package + '\''
                                                + '\)\">'
                                                + '<span>刷新</span>'
                                            + '</button>'
                                            + '<button class="pt-btn pt-btn-default" onclick=\"toastr.clear()\">'
                                                + '<span>取消</span>'
                                            + '</button>'
                                        + '</div>'
                                    + '</div>'
                    nsAlert(alertHtml, 'warning');
                }
                break;
            case 'workItem':
                var tips = getPageNewInfo(pageParams); // 当前页面获取的新消息
                if(tips.length>0){
                    refreshInfoRemind(pageParams);
                }
                break;
            case 'workflow':
                var pageConfig = pageSubscribe[pageParams.rabbitmq];
                if(pageConfig.isNew){
                    nsUI.flowChartViewer.tab.refreshWorkflow(pageConfig.name);
                    pageConfig.isNew = false;
                }
                refreshInfoRemind(pageParams);
                break;
            case 'other':
                // 其他未知页面不处理
                break;
        }
    }
    // 刷新消息提醒
    function refreshInfoRemind(pageParams){
        // 刷新订阅数据
        refreshSubscribeData(pageParams);
        // 设置新消息提醒
        setInfoRemind();
    }
    // 刷新订阅数据
    function refreshSubscribeData(pageParams){
        if(typeof(NetStarRabbitMQ.classManageInfo) != "object"){
            return;
        }
        if(typeof(pageParams)!="object"){
            // 传参错误
            console.error('刷新传参错误');
            return;
        }
        var workItems = NetStarRabbitMQ.classManageInfo.workItems;    // 工作项对象
        var activitys = NetStarRabbitMQ.classManageInfo.activitys;          // 环节对象
        var instances = NetStarRabbitMQ.classManageInfo.instances;          // 工作流对象
        var pageType =  getPageType(pageParams); // workflow工作流 / workItem工作项 / activity环节 / other 其他页面
        switch(pageType){
            // 环节
            case 'activity':
                var activityId = pageParams.activityId;
                var activityName = pageParams.activityName;
                for(var activityIdKey in activitys){
                    var activity = activitys[activityIdKey];
                    // if(activityId == activity.activityId){
                    //     for(var workitemI=0; workitemI<activity.workItemList.length; workitemI++){
                    //         var workItem = activity.workItemList[workitemI];
                    //         workItem.activityOpenTimestamp = new Date().getTime();
                    //     }
                    //     break;
                    // }
                    if(activityName == activity.activityName){
                        for(var workitemI=0; workitemI<activity.workItemList.length; workitemI++){
                            var workItem = activity.workItemList[workitemI];
                            workItem.activityOpenTimestamp = new Date().getTime();
                        }
                        break;
                    }
                }
                break;
            // 工作项
            case 'workItem':
                var workItemId = pageParams.workItemId;
                var workItem = workItems[workItemId];
                if(workItem){
                    workItem.workItemOpenTimestamp = new Date().getTime();
                }
                break;
            // 工作流
            case 'workflow':
                var instanceId = pageParams.instanceIds;
                var instance = instances[instanceId];
                for(var instanceIdKey in instance){
                    var workItem = instance[instanceIdKey];
                    workItem.workflowOpenTimestamp = new Date().getTime();
                }
                break;
            // 其他页面
            case 'other':
                // 其他未知页面不处理
                break;
        }
    } 
    // 通过页面配置获取当前页面新消息数量
    function getPageNewInfo(pageParams){
        var workItems = NetStarRabbitMQ.classManageInfo.workItems;          // 工作项对象
        var activitys = NetStarRabbitMQ.classManageInfo.activitys;          // 环节对象
        var instances = NetStarRabbitMQ.classManageInfo.instances;          // 实例对象
        var waitings = NetStarRabbitMQ.classManageInfo.prevWaitings ? NetStarRabbitMQ.classManageInfo.prevWaitings : NetStarRabbitMQ.classManageInfo.waitings;
        var showType = getPageType(pageParams);         
        var tips = []; // 提示工作项
        switch(showType){
            case 'activity':
                var activity = activitys[pageParams.activityId];
                for(var activityId in activitys){
                    if(activitys[activityId].activityName == pageParams.activityName){
                        activity = activitys[activityId];
                    }
                }
                if(activity){
                    var activityWorkItems = activity.workItemList;
                    for(var i=0; i<activityWorkItems.length; i++){
                        var workitem = activityWorkItems[i];
                        var timestamp = workitem.timestamp;
                        var activityOpenTimestamp = workitem.activityOpenTimestamp;
                        var workItemOpenTimestamp = workitem.workItemOpenTimestamp;
                        if(typeof(activityOpenTimestamp)=="undefined"){
                            tips.push(workitem);
                        }
                    }
                }
                // 验证获得的新消息是否提醒
                var _activity = waitings[pageParams.activityId];
                for(var activityId in waitings){
                    if(waitings[activityId].activityName == pageParams.activityName){
                        _activity = waitings[activityId];
                    }
                }
                var _tips = [];
                if(_activity && tips.length > 0){
                    var _activityWorkItems = _activity.workitemList;
                    for(var i=0; i<tips.length; i++){
                        var _workitem = tips[i];
                        if(stateTypes[_workitem.workitemState.toString()] || _workitem.workitemState == 4 || _workitem.workitemState == 16){
                            _tips.push(_workitem);
                            continue;
                        }
                        var isHave = false;
                        for(var i=0; i<_activityWorkItems.length; i++){
                            var workitem = _activityWorkItems[i];
                            if(_workitem.workitemId == workitem.workitemId){
                                isHave = true;
                                break;
                            }
                        }
                        // if(_workitem.activityName == _activity.activityName){
                        //     isHave = true;
                        // }
                        if(isHave){
                            _tips.push(_workitem);
                        }
                    }
                }else{
                    if(!_activity && tips.length > 0){
                        for(var i=0; i<tips.length; i++){
                            var _workitem = tips[i];
                            if(stateTypes[_workitem.workitemState.toString()]){
                                _tips.push(_workitem);
                                continue;
                            }
                        }
                    }
                }
                tips = _tips;
                break;
            case 'workItem':
                var workItem = workItems[pageParams.workItemId];
                if(workItem){
                    if(typeof(workItem.workItemOpenTimestamp)=="undefined"){
                        tips.push(workItem);
                    }
                }
                break;
            case 'workflow':
                var instance = instances[pageParams.instanceIds];
                if(instance){
                    for(var instanceIdKey in instance){
                        var workItem = instance[instanceIdKey];
                        if(typeof(workItem.workflowOpenTimestamp)=="undefined"){
                            tips.push(workItem);
                        }
                    }
                }
                break;
            case 'other':
                // 不需要添加标签
                break;
        }
        return tips;
    }
    // 通过存储的数据 设置新消息提醒
    function setInfoRemind(){
        if(typeof(NetStarRabbitMQ.classManageInfo) != "object"){
            return;
        }
        var workItems = NetStarRabbitMQ.classManageInfo.workItems;          // 工作项对象
        var activitys = NetStarRabbitMQ.classManageInfo.activitys;          // 环节对象
        var instances = NetStarRabbitMQ.classManageInfo.instances;          // 实例对象
        var tabsConfig = NetstarUI.labelpageVm.labelPagesArr;               // tab显示菜单配置
        for(var tabI=0; tabI<tabsConfig.length; tabI++){
            var tabConfig = tabsConfig[tabI];
            var pageParams = tabConfig.attrs;
            if(typeof(tabConfig.config) != "object"){
                continue;
            }
            if(typeof(NetStarRabbitMQ.pageSubscribe[tabConfig.config.package]) != "object" && tabConfig.config.type != "workflowTab"){
                continue;
            }
            var tips = getPageNewInfo(pageParams); // 提示信息
            var souPlusClass = tabConfig.getPlusClass();
            var plusClass = souPlusClass;
            var signClass = 'pt-nav-item-tip';
            if(tips.length > 0){
                if(plusClass.indexOf(signClass)==-1){
                    plusClass += ' ' + signClass;
                }
            }else{
                if(plusClass.indexOf(signClass)>-1){
                    plusClass = plusClass.replace(signClass, '');
                }
            }
            if(souPlusClass !== plusClass){
                tabConfig.setPlusClass(plusClass);
            }
        }
    }
    /*****************系统订阅结束******************/

    /*************环节/工作项订阅开始******************/
    function refreshPage(subscribeInfo){
        for(var name in pageSubscribe){
            var pageConfig = pageSubscribe[name];
            switch(pageConfig.type){
                case 'vo':
                    if(subscribeInfo.workitemId == pageConfig.key){
                        setPageBySubscribeInfo(subscribeInfo, pageConfig)
                    }
                    break;
                case 'list':
                    // if(subscribeInfo.activityId == pageConfig.key){
                    //     setPageBySubscribeInfo(subscribeInfo, pageConfig)
                    // }
                    if(subscribeInfo.activityName == pageConfig.activityName){
                        setPageBySubscribeInfo(subscribeInfo, pageConfig);
                    }
                    break;
                 case 'workflow':
                    if(subscribeInfo.processId == pageConfig.key){
                        // nsUI.flowChartViewer.tab.refreshWorkflow(pageConfig.containerId);
                        pageConfig.isNew = true;
                        var currentTabConfig = NetstarUI.labelpageVm.labelPagesArr[NetstarUI.labelpageVm.currentTab];
                        if(currentTabConfig.attrs.rabbitmq === pageConfig.name){
                            pageConfig.isNew = false;
                            nsUI.flowChartViewer.tab.refreshWorkflow(pageConfig.name);
                        }
                    }
                    break;
            }
        }
    }
    function setTemplateSubscribe(subConfig){
        // 订阅参数
        /** subConfig：object = {} 订阅消息
         *      name: "", string   订阅名（在页面上是包名，工作流viewer是按钮名）
         *      processId : '', string   订阅工作流
         *      activityId : '', string   订阅环节 
         *      workitemId : '', string   订阅工作项 
         *      templateConfig : {}, object   模版配置 
         */
        // 验证传入值
        var optionArr = [
            ['name',            'string',           true],
            ['processId',       'string',           false],
            ['activityId',      'string',           false],
            ['workitemId',      'string',           false],
            ['activityName',    'string',           false],
            ['workflowType',    'string',           false],
            ['templateConfig',  'object',           true],
        ]
        var isValid = nsDebuger.validOptions(optionArr, subConfig);
        if(isValid){
            if(typeof(subConfig.activityId)=="undefined" && typeof(subConfig.workitemId)=="undefined"){
                // 不是环节不是工作项不订阅
                isValid = false;
                return;

            }else{
                if(typeof(subConfig.workitemId)=="undefined" && subConfig.templateConfig.template=="processDocBase"){
                    // 新增 工作项不订阅
                    isValid = false;
                    return;
                }
            }
        }
        if(!isValid){
            nsAlert("订阅失败，请检查订阅配置",'error');
            console.error(subConfig);
            return false;
        }

        //如果页面上有activityId则该页面是环节页面，展示工作项的集合（list），如果有workitemId则该页面是工作项页面，展示某个工作项的具体内容（vo）
        var pageConfig = {
            templateConfig:     subConfig.templateConfig,   //页面模板配置参数
            name:               subConfig.name,             //订阅的名字 package
            workflowType :      subConfig.workflowType,     // 页面类型  待办/已办（完结）
        };
        if(typeof(subConfig.workitemId)=="string"){
            //vo类型的页面已workItemId为主键
            pageConfig.type = 'vo';
            pageConfig.key = subConfig.workitemId;
        }else{
            //lsit类型的页面已activityId为主键
            pageConfig.type = 'list';
            pageConfig.key = subConfig.activityId;
            pageConfig.activityName = subConfig.activityName;
        }

        pageSubscribe[subConfig.name] = pageConfig;
    }
    // 根据订阅信息设置页面
    function setPageBySubscribeInfo(workitemInfo, pageConfig){

        var templateConfig = pageConfig.templateConfig;
        var workitemId = workitemInfo.workitemId;
        var isDisabled = false;
        if(pageConfig.workflowType === "0"){
            if(workitemInfo.workitemState != 2 && workitemInfo.workitemState != 3){
                isDisabled = true;
            }
        }else{
            if(workitemInfo.workitemState != 4 && workitemInfo.workitemState != 5){
                isDisabled = true;
            }
        }
        NetstarTemplate.setDisableByWorkItemId(templateConfig.package, workitemInfo.workitemId, isDisabled, workitemInfo.workitemState);
        // var state = 'normal-message'; // 普通
        // var stateObj = {
        //     4 : 'transfer-message',
        //     5 : 'file-message',
        //     16 : 'delete-message',
        //     128 : 'close-message',
        // }
        // switch(templateConfig.template){
        //     case 'processDocBase':
        //         if(!stateTypes[workitemInfo.workitemState]){
        //             state = 'state-disabled-message'; // 
        //         }
        //         break;
        //     default:
        //         if(stateTypes[workitemInfo.workitemState]){
        //             if(workitemInfo.hasRollback){
        //                 state = 'again-message'; // 重办
        //             }else{
        //                 if(workitemInfo.hasEmergency){
        //                     state = 'emergency-message'; // 应急
        //                 }else{
        //                     if(workitemInfo.hasSuspend){
        //                         state = 'suspend-message'; // 挂起
        //                     }
        //                 }
        //             }
        //         }else{
        //             state = stateObj[workitemInfo.workitemState] ? stateObj[workitemInfo.workitemState] : state;
        //         }

        //         break;
        // }
        var stateConfig = {
            attrs : {
                hasSuspend : workitemInfo.hasSuspend,
                hasRollback : workitemInfo.hasRollback,
                hasEmergency : workitemInfo.hasEmergency,
                workItemState : workitemInfo.workitemState,
            },
            workItemId : workitemInfo.workitemId,
            workItemState : workitemInfo.workitemState,
            pagePackage : templateConfig.package,
            templateConfig : templateConfig,
            workitemInfo : workitemInfo,
        }
        NetstarTemplate.setState(stateConfig);
    }
    /*****************环节订阅结束******************/

    /****************工作流订阅开始*****************/
    function workflowSubscribe(subConfig){
        // 验证传入值
        var optionArr = [
            ['dataSource',            'object',           true],
            ['activityInfo',          'object',           false],
            ['unitId',                'string',           true],
            ['containerId',           'string',           true],
        ]
        var isValid = nsDebuger.validOptions(optionArr, subConfig);
        if(!isValid){
            nsAlert("订阅失败，请检查订阅配置",'error');
            console.error(subConfig);
            return false;
        }
        var pageConfig = {
            unitId:               subConfig.unitId,             
            name:                 subConfig.containerId, //订阅的名字 
        };
        pageConfig.type = 'workflow';
        pageConfig.key = subConfig.dataSource.processId;
        pageSubscribe[subConfig.containerId] = pageConfig;
    }
    /****************工作流订阅结束*****************/
    return {
        infosArr : infosArr,
        // 公用方法
        init : init,                                // 初始化 建立连接
        // connect : init,                             // 初始化 建立连接
        send : send,                                // 发送
        subscribe : subscribe,                      // 订阅
        unsubscribeByUntId : unsubscribeByUntId,    // 取消订阅
        saveRabbitMQLinkConfig: saveRabbitMQLinkConfig, // 保存连接配置
        connectBySaveConfig: connectBySaveConfig,   // 通过saveConfig建立连接
        setSystemSubscribe: setSystemSubscribe,     // 系统页面订阅
        refreshSubscribeData: refreshSubscribeData, // 刷新
        setInfoRemind : setInfoRemind,       // 设置新消息提醒
        setTemplateSubscribe : setTemplateSubscribe,// 模板订阅
        recordSystemSubscribeData : recordSystemSubscribeData,
        workflowSubscribe : workflowSubscribe,
        inPageHandler : inPageHandler,
        refreshInfoRemind : refreshInfoRemind, // 刷新消息提醒
        setMessageIsLink : setMessageIsLink,
        subscribeCallBackFuncByTarget : subscribeCallBackFuncByTarget,
    }
})(jQuery)
// 操作本地软硬件资源 通过链接设备或软件获取数据 进行处理
NetstarLocalResources = (function($){
    // 链接配置 通过链接名保存
    var configs = {};
    // 配置管理
    var configManager = {
        // 验证是否合法
        valid : function(_config){
            var validArr = [
                ['name',            'string',   true],  // 连接设备或软件名
                ['type',            'string',   true],  // 连接设备/软件类型 用于连接方法和传递参数 例：mq-->connect(token,'',successfunc,errorfunc,vhost)
                ['url',             'string',   true],  // 连接地址
                ['token',           'string',   true],  // 令牌
                ['vhost',           'string',   true],  // 虚拟主机
                ['callBackFunc',    'function', false], // 连接成功/失败毁掉
            ]
            var isValid = nsDebuger.validOptions(validArr, _config);
            return isValid;
        },
        // 设置默认配置
        setDefault : function(){},
        // 设置config
        setConfig : function(){},
        // 获取config
        getConfig : function(){},
        // 保存config 通过名字保存链接配置
        saveConfig : function(_config){
            /**
             * config {}
             * name             string      连接设备或软件名
             * type             string      连接设备/软件类型 用于连接方法和传递参数 例：mq-->connect(token,'',successfunc,errorfunc,vhost)
             * url/ws           string      连接地址
             * token            string      令牌
             * vhost            string      虚拟主机
             * callBackFunc     function    连接成功/失败毁掉
             */
            var isTrue = configManager.valid(_config);
            if(!isTrue){
                return;
            }
            configs[_config.name] = {
                source : $.extend(true, {}, _config),
                config : _config,
            }
            configManager.setDefault(_config);
            configManager.setConfig(_config);
        },
    };
    // 链接管理
    var linkManger = {
        setLink : function(_config){
            switch(_config.type){
                case 'mq':
                    var webSocket = new WebSocket(_config.url);
                    _config.webSocket = webSocket;
                    _config.client = Stomp.over(webSocket);
                    _config.client.debug = null;
                    var successfunc = function(){
                        NetstarLocalResources.linkSuccess = true;
                        NetStarRabbitMQ.setMessageIsLink();
                        if(typeof(_config.callBackFunc) == "function"){
                            _config.callBackFunc(true);
                        }
                    }
                    var errorfunc = function(){
                        NetstarLocalResources.linkSuccess = false;
                        NetStarRabbitMQ.setMessageIsLink();
                        if(typeof(_config.callBackFunc) == "function"){
                            _config.callBackFunc(false);
                        }
                    }
                    connect(_config.token, '', successfunc, errorfunc, _config.vhost)
                    break;
            }
        },
        // 通过配置名链接
        initByLinkName : function(name){
            if(typeof(configs[name]) != "object"){
                console.error('链接配置不存在，请查看配置');
                console.error(name);
                console.error(configs);
                return;
            }
            var _config = configs[name].config;
            linkManger.init(_config);
        },
        // 链接
        init : function(_config, isValid){
            // 默认需要验证
            isValid = typeof(isValid) == "boolean" ? isValid : true;
            if(isValid){
                var isTrue = configManager.valid(_config);
                if(!isTrue){
                    return;
                }
                configs[_config.name] = {
                    source : $.extend(true, {}, _config),
                    config : _config,
                }
            }
            var config = configs[_config.name].config;
            linkManger.setLink(config);
        },
    }
    // 数据管理
    var dataManger = {}
    return {
        link : linkManger.init,
        linkbyName : linkManger.initByLinkName,
        getConfig : configManager.getConfig,
        saveConfig : configManager.saveConfig,
    }
})($)