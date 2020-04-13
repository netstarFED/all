// var NetstarEditorBase = {}
NetstarEditorBase.btns = (function(){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
                nsAlert('按钮面板配置错误，id必须配置', 'error');
                console.error('按钮面板配置错误，id必须配置:', config);
            }
            if(isPass){
                if($('#' + config.id).length == 0){
                    isPass = false;
                    nsAlert('按钮面板id配置错误', 'error');
                    console.error('按钮面板id配置错误:', config);
                }
            }
            if(!$.isArray(config.btnGroups)){
                isPass = false;
                nsAlert('按钮面板配置错误，btns必须配置', 'error');
                console.error('按钮面板配置错误，btns必须配置:', config);
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置按钮配置的默认配置
        setBtnDefault : function(btnConfig){
            var defaultConfig = {
                defaultState : false,
                text : '',
                icon : '',
            }
            nsVals.setDefaultValues(btnConfig, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            config.$container = $('#' + config.id);
            // 设置按钮配置 并 根据按钮配置设置id对应按钮关系对象
            var btnGroups = config.btnGroups;
            var btnIndexRel = {};
            for(var i=0; i<btnGroups.length; i++){
                var btns = btnGroups[i].btns;
                for(var j=0; j<btns.length; j++){
                    btnIndexRel[btns[j].id] = {
                        groupIndex : i,
                        index : j,
                    }
                    configManage.setBtnDefault(btns[j]);
                }
            }
            config.btnIndexRel = btnIndexRel;
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
    // 面板管理
    var panelManage = {
        // 获取btnGroup的html
        getBtnGroupHtml : function(btnGroup, groupIndex){
            var btnsHtml = '';
            var btns = btnGroup.btns;
            var type = btnGroup.type;
            var currentClass = 'current';
            for(var i=0; i<btns.length; i++){
                var btn = btns[i];
                if(type == 'custom'){
                    var text = btn.text;
                    var $btn = $(text);
                    $btn.attr({
                        'ns-type' : type,
                        'ns-group' : groupIndex,
                        'ns-index' : i,
                    });
                    btnsHtml += $btn.prop('outerHTML');
                    continue;
                }
                // icon
                var isIcon = btn.icon.length > 0;
                var btnClass = isIcon ? 'btn-icon' : '';
                var iconHtml = isIcon ? btn.icon : '';
                // text
                var textHtml = btn.text.length > 0 ? '<span>' + btn.text + '</span>' : '';
                // 状态
                var isActive = btn.defaultState;
                btnClass += isActive ? ' ' + currentClass : '';
                btnsHtml += '<button class="btn ' + btnClass + '" type="button" ns-type="' + type + '" ns-group="' + groupIndex + '" ns-index="' + i + '">'
                                + iconHtml
                                + textHtml
                            + '</button>';
            }
            var html = '<div class="btn-group">'
                            + btnsHtml
                        + '</div>';
            if(type == "switch"){
                var $html = $(html);
                $html.addClass('btn-sketch');
                // 判断 btnsHtml 是否设置默认选中状态 如果设置则不需要处理 否则设置第一个为选中状态
                var $btns = $html.children('button');
                if(!$btns.hasClass(currentClass)){
                    $btns.eq(0).addClass(currentClass);
                }
                html = $html.prop('outerHTML');
            }
            return html;
        },
        // 获取html
        getHtml : function(config){
            var btnGroups = config.btnGroups;
            var btnGroupsHtml = '';
            for(var i=0; i<btnGroups.length; i++){
                var btnGroup = btnGroups[i];
                var type = btnGroup.type; // switch normal custom
                btnGroupsHtml += panelManage.getBtnGroupHtml(btnGroup, i);
            }
            return btnGroupsHtml;
        },
        getBtnGroupConfig : function(nsGroupIndex, config){
            var btnGroups = config.btnGroups;
            var btnGroup = btnGroups[nsGroupIndex];
            return btnGroup;
        },
        getBtnConfig : function(nsGroupIndex, nsIndex, config){
            var btnGroups = config.btnGroups;
            var btnConfig = btnGroups[nsGroupIndex].btns[nsIndex];
            return btnConfig;
        },
        // 执行按钮方法
        runBtnHandler : function($btn, config, isCurrent){
            isCurrent = typeof(isCurrent) == "boolean" ? isCurrent : true;
            // 按钮配置
            var nsGroupIndex = $btn.attr('ns-group');
            var nsIndex = $btn.attr('ns-index');
            var btnGroupConfig = panelManage.getBtnGroupConfig(nsGroupIndex, config);
            var btnConfig = panelManage.getBtnConfig(nsGroupIndex, nsIndex, config);
            // 当前状态
            // 判断是否选中 状态按钮存在选中和取消选中 handler返回选中/不选中状态，其它按钮状态返回false
            var currentClass = 'current';
            // var currentState = $btn.hasClass(currentClass);
            switch(btnGroupConfig.type){
                case 'switch':
                    // 获取当前按钮组的所有按钮 设置只有一个选中
                    var $siblingsBtns = $btn.siblings();
                    $siblingsBtns.removeClass(currentClass);
                    if(!$btn.hasClass(currentClass)){
                        $btn.addClass(currentClass);
                    }
                    isCurrent = false;
                    break;
                case 'normal':
                    // 默认按钮使用状态
                    if(btnConfig.isUseState){
                        // 切换状态
                        if(isCurrent){
                            $btn.addClass(currentClass);
                        }else{
                            $btn.removeClass(currentClass);
                        }
                    }
                    break;
            }
            var obj = {
                config : config,
                btnConfig : btnConfig,
                group : btnGroupConfig,
                index : Number(nsIndex),
                currentState : isCurrent,
                groupIndex : Number(nsGroupIndex),
            }
            if(typeof(btnConfig.handler) == "function"){
                btnConfig.handler($btn, obj);
            }
        },
        // 添加事件
        setEvent : function($btnGroups, config){
            var $btns = $btnGroups.find('button');
            $btns.off('click');
            $btns.on('click', function(ev){
                var $this = $(this);
                var currentClass = 'current';
                var currentState = $this.hasClass(currentClass);
                panelManage.runBtnHandler($this, config, !currentState);
                return false;
            });
        },
        show : function(config){
            var html = this.getHtml(config);
            var $html = $(html);
            this.setEvent($html, config);
            config.$container.html($html);
        }
    }
    // 通用方法管理
    var commonManage = {
        // 通过id获取按钮配置
        getBtnIndex : function(btnId, config){
            var btnIndexRel = config.btnIndexRel;
            var indexObj = btnIndexRel[btnId];
            if(typeof(indexObj) != "object"){
                nsAlert(btnId + '按钮不存在');
                console.error(btnId + '按钮不存在');
                console.error(config);
                return false;
            }
            return indexObj;
        },
        // 设置按钮状态
        setState : function(btnId, configId, isCurrent){
            var config = configManage.getConfig(configId);
            if(!config){
                nsAlert('config的id配置错误，没有找到config', 'error');
                console.error('config的id配置错误，没有找到config:', configId);
                return false
            }
            var indexObj = commonManage.getBtnIndex(btnId, config);
            if(!indexObj){ return false; }
            var groupIndex = indexObj.groupIndex;
            var index = indexObj.index;
            var $btn = config.$container.find('[ns-group="'+ groupIndex +'"][ns-index="'+ index +'"]');
            panelManage.runBtnHandler($btn, config, isCurrent);
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
        // 
        panelManage.show(config);
    }
    return {
        init : init,
        setState : commonManage.setState,
    }
})(jQuery)
// 面包屑导航
NetstarEditorBase.bread = (function(){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
                nsAlert('导航面板配置错误，id必须配置', 'error');
                console.error('导航面板配置错误，id必须配置:', config);
            }
            if(isPass){
                if($('#' + config.id).length == 0){
                    isPass = false;
                    nsAlert('导航面板id配置错误', 'error');
                    console.error('导航面板id配置错误:', config);
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                childField : 'children',
                idField : 'id',
                parentField : 'parentId',
                nameField : 'name',
                currentId : '',
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            config.$container = $('#' + config.id);
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
    // 面板管理
    var panelManage = {
        // 添加事件
        setEvent : function($content, config){
            var $lis = $content.children('li');
            $lis.off('click');
            $lis.on('click', function(ev){
                var $this = $(this);
                var nsId = $this.attr('ns-id');
                // var $list = panelManage.getShowListJQDom(nsId, config);
                // if(!$list){
                //     return false;
                // }
                // $this.children('ul').remove();
                // $this.append($list);
                config.currentId = nsId;
                panelManage.show(config);
                // 执行切换方法
                var node = config.nodes[nsId];
                var obj = {
                    ev : ev,
                    node : node,
                    config : config,
                }
                if(typeof(config.switchHandler) == "function"){
                    config.switchHandler(obj);
                }
            });
            $lis.off('mouseenter');
            $lis.on('mouseenter', function(ev){
                var $this = $(this);
                var nsId = $this.attr('ns-id');
                var $list = panelManage.getShowListJQDom(nsId, config);
                if(!$list){
                    return false;
                }
                $this.children('ul').remove();
                $this.append($list);
            });
            $lis.off('mouseleave');
            $lis.on('mouseleave', function(ev){
                var $this = $(this);
                $this.children('ul').remove();
            });
        },
        // 设置下拉列表事件
        setListEvent : function($list, config){
            var $lis = $list.find('li');
            $lis.off('click');
            $lis.on('click', function(ev){
                var $this = $(this);
                var nsId = $this.attr('ns-id');
                config.currentId = nsId;
                panelManage.show(config);
                // 执行切换方法
                var node = config.nodes[nsId];
                var obj = {
                    ev : ev,
                    node : node,
                    config : config,
                }
                if(typeof(config.switchHandler) == "function"){
                    config.switchHandler(obj);
                }
            });
        },
        // 获取html
        getHtml : function(config){
            var html = '';
            var idField = config.idField;
            var nameField = config.nameField;
            function func(currentId){
                var node = dataManage.getNodeById(currentId, config);
                if(node){
                    func(node.parentId);
                }else{
                    return false;
                }
                var str = '<li class="item" ns-id="' + node[idField] + '">'
                                + '<span>' + node[nameField] + '</span>'
                            + '</li>';
                html += str;
            }
            func(config.currentId);
            html = '<ul>' 
                        + html
                    + '</ul>'
            return html;
        },
        // 获取节点的标题列表li
        getNodeHtml : function(node, config){
            var idField = config.idField;
            var nameField = config.nameField;
            var liHtml = '<li class=""  data-itme="itemSecond" ns-id="' + node[idField] + '">'
                            + '<span>' + node[nameField] + '</span>'
                        + '</li>'
            return liHtml;
        },
        // 获取下拉列表
        getNodesListHtml : function(nodes, config){
            var liHtml = '';
            for(var i=0; i<nodes.length; i++){
                liHtml += panelManage.getNodeHtml(nodes[i], config);
            }
            var html = '<ul class="dropdown">'
                            + liHtml
                        + '</ul>';
            return html;
        },
        // 获取下拉列表dom
        getShowListJQDom : function(nsId, config){
            var childField = config.childField;
            var nodes = config.nodes;
            var node = nodes[nsId];
            if(!node.isParent){ return false; } // 不是父节点时，没有下拉list
            var list = node[childField];
            var html = panelManage.getNodesListHtml(list, config);
            var $html = $(html);
            panelManage.setListEvent($html, config);
            return $html;
        },
        show : function(config){
            var html = panelManage.getHtml(config);
            var $html = $(html);
            config.$content = $html;
            panelManage.setEvent($html, config);
            config.$container.html($html);
        }
    }
    // 数据管理
    var dataManage = {
        // 获取节点 通过id
        getNodeById : function(id, config){
            var nodes = config.nodes;
            var node = nodes[id] ? nodes[id] : false;
            return node;
        },
        // 获取所有节点通过id
        getNodesById : function(config){
            var data = config.data;
            var childField = config.childField;
            var idField = config.idField;
            var nodesObj = {};
            function func(nodes){
                for(var i=0; i<nodes.length; i++){
                    nodesObj[nodes[i][idField]] = nodes[i];
                    var isHadChild = $.isArray(nodes[i][childField]) && nodes[i][childField].length > 0;
                    if(isHadChild){
                        func(nodes[i][childField])
                    }
                }
            }
            func(data);
            return nodesObj;
        },
        // 设置节点
        setNodes : function(config){
            var data = config.data;
            var idField = config.idField;
            var childField = config.childField;
            var parentField = config.parentField;
            function func(nodes, level, parentId){
                for(var i=0; i<nodes.length; i++){
                    nodes[i].level = level;
                    nodes[i][parentField] = parentId;
                    var isHadChild = $.isArray(nodes[i][childField]) && nodes[i][childField].length > 0;
                    nodes[i].isParent = isHadChild;
                    if(isHadChild){
                        var _level = level + 1;
                        func(nodes[i][childField], _level, nodes[i][idField])
                    }
                }
            }
            func(data, 0, -1);
        },
        // 获取节点位置 默认根节点
        getCurrentNodeId : function(config){
            var nodes = config.nodes;
            var data = config.data;
            var idField = config.idField;
            var currentId = config.currentId;
            // 判断当前节点id是否存在
            var isHave = false;
            for(var key in nodes){
                if(key === currentId){
                    isHave = true;
                    break;
                }
            }
            if(isHave){
                return currentId;
            }
            currentId = '';
            for(var key in nodes){
                if(nodes[key].isCurrent){
                    currentId = key;
                    break;
                }
            }
            if(currentId === ''){
                currentId = data[0][idField];
            }
            return currentId;
        },
        formatNodesData : function(config){
            dataManage.setNodes(config);
            var nodes= dataManage.getNodesById(config);
            config.nodes = nodes;
            console.log(nodes);
        },
    }
    // 刷新
    function refresh(currentId, configId, isRunSwitch){
        var config = configManage.getConfig(configId);
        if(!config){
            nsAlert('config的id配置错误，没有找到config', 'error');
            console.error('config的id配置错误，没有找到config:', configId);
            return false;
        }
        // 验证currentId是否存在
        if(!config.nodes[currentId]){
            nsAlert('currentId配置错误，在config中没有找到', 'error');
            console.error('currentId配置错误，在config中没有找到:', currentId);
            return false;
        }
        isRunSwitch = typeof(isRunSwitch) == "boolean" ? isRunSwitch : true; // 是否执行 switchHandler
        config.currentId = currentId;
        panelManage.show(config);
        // 执行切换方法
        if(isRunSwitch){
            var node = config.nodes[currentId];
            var obj = {
                node : node,
                config : config,
            }
            if(typeof(config.switchHandler) == "function"){
                config.switchHandler(obj);
            }
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
        if(!$.isArray(config.data) || config.data.length == 0){
            return false;
        }
        // 设置config
        configManage.setConfig(config);
        // 格式化节点
        dataManage.formatNodesData(config);
        // 获取当前显示
        config.currentId = dataManage.getCurrentNodeId(config);
        panelManage.show(config);
    }
    return {
        init : init,
        refresh : refresh,
        getConfig : configManage.getConfig,
    }
})(jQuery)
// tab 暂时不写
NetstarEditorBase.tab = (function(){
    var configs = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                isPass = false;
                nsAlert('导航面板配置错误，id必须配置', 'error');
                console.error('导航面板配置错误，id必须配置:', config);
            }
            if(isPass){
                if($('#' + config.id).length == 0){
                    isPass = false;
                    nsAlert('导航面板id配置错误', 'error');
                    console.error('导航面板id配置错误:', config);
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
            config.$container = $('#' + config.id);
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
    // 面板管理
    var panelManage = {
        // 添加事件
        setEvent : function($content, config){},
        // 获取html
        getHtml : function(config){},
        show : function(config){
            var html = panelManage.getHtml(config);
            var $html = $(html);
            config.$content = $html;
            panelManage.setEvent($html, config);
            config.$container.html($html);
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
        // init : init,/
        // refresh : refresh,
    }
})(jQuery)

var NetstarHandlebars = (function(){
    /**
     * '<div>'
     *    + '{{#each this}}'
     *         + '<div>{{this.text}}</div>'
     *    + '{{/each}}'
     * + '</div>'
     * 把这种格式的代码格式化
     */
    function getFormatHtml(html, data){
        var template = Handlebars.compile(html);
        var formatHtml = template(data);
        return formatHtml;
    }
    return {
        getFormatHtml : getFormatHtml,
    }
})(jQuery)

var NetstarEditorAjax = {
    index : 1,
    data : [],
    getList : function(config, callBackFunc){
        var ajaxConfig = {
            url : 'https://qaapi.wangxingcloud.com/formdesigner/formControls/getList',
            type : 'POST',
            // contentType : 'application/x-www-form-urlencoded',
            plusData : {
                callBackFunc : callBackFunc,
            },
            data : {},
        }
        if(typeof(config.data) == "object"){
            ajaxConfig.data = config.data;
        }
        if(typeof(config.plusData) == "object"){
            ajaxConfig.plusData = config.plusData;
            ajaxConfig.plusData.callBackFunc = callBackFunc;
        }
        NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            if(res.success){
                if(typeof(_ajaxConfig.plusData.callBackFunc) == "function"){
                    _ajaxConfig.plusData.callBackFunc(res.rows, _ajaxConfig.plusData);
                }
            }
        })
    },
    getById : function(config){
        var ajaxConfig = {
            url : 'https://qaapi.wangxingcloud.com/formdesigner/formControls/getById',
            type : 'POST',
            contentType : 'application/x-www-form-urlencoded',
            plusData : {
                callBackFunc : config.callBackFunc,
            },
            data : config.data,
        }
        if(typeof(config.plusData) == "object"){
            ajaxConfig.plusData = config.plusData;
            ajaxConfig.plusData.callBackFunc = config.callBackFunc;
        }
        NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            if(res.success){
                if(typeof(_ajaxConfig.plusData.callBackFunc) == "function"){
                    _ajaxConfig.plusData.callBackFunc([res.data], _ajaxConfig.plusData);
                }
            }
        })
    },
    getPageData : function(data, callBackFunc){
        var ajaxConfig = {
            url : 'https://qaapi.wangxingcloud.com/formdesigner/formControls/getById',
            type : 'POST',
            contentType : 'application/x-www-form-urlencoded',
            plusData : {
                callBackFunc : callBackFunc,
            },
            data : data,
        }
        NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            if(res.success){
                if(typeof(_ajaxConfig.plusData.callBackFunc) == "function"){
                    _ajaxConfig.plusData.callBackFunc([res.data]);
                }
            }
        })
    },
    savePageData : function(data, plusData, callBackFunc, a){
        // a = a ? a : '';
        // var ajaxConfig = {
        //     url : getRootPath() + '/data/editor/' + a + '.json',
        //     type : 'POST',
        //     // contentType : 'appapplication/json',
        //     plusData : {
        //         callBackFunc : callBackFunc,
        //         plusData : plusData,
        //     },
        //     data : data,
        // }
        if(!$.isArray(data)){
            data = [data];
        }
        var ajaxConfig = {
            url : 'https://qaapi.wangxingcloud.com/formdesigner/formControls/saveByPf',
            type : 'POST',
            contentType : 'application/json',
            plusData : {
                callBackFunc : callBackFunc,
                plusData : plusData,
            },
            data : data,
        }
        NetstarEditorAjax.data.push($.extend(true, [], data));
        // for(var i=0; i<data.length; i++){
        //     data[i].id = data[i].id ? data[i].id : NetstarEditorAjax.index++;
        // }
        // callBackFunc(data, plusData);
        // return;
        NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
            if(res.success){
                if(typeof(_ajaxConfig.plusData.callBackFunc) == "function"){
                    _ajaxConfig.plusData.callBackFunc(res.rows, _ajaxConfig.plusData.plusData);
                }
            }
        })
    },
}

var NetstarEditorServer = (function(){
    // pageConfig面板类型比较
    var panelType = {
        page : 0, // 对象
        fieldGroup : 1,
        components : 1, // 数组
        field : 1, // 数组
        state : 1,
        source : 1,
    }
    // 字段
    var fieldManager = {
        saveSourceField : function(eleNullNsSource, callBackFunc){
            var data = [];
            for(var i=0; i<eleNullNsSource.length; i++){
                data.push(eleNullNsSource[i].element);
            }
            NetstarEditorAjax.savePageData(
                data,
                {
                    callBackFunc : callBackFunc,
                }, 
                function(resData, plusData){
                    if(typeof(plusData.callBackFunc) == "function"){
                        plusData.callBackFunc(resData);
                    }
                },
                'source'
            )
        },
        getSaveField : function(fieldObj){
            var sourceData = dataManage.sourceData;
            var sourElements = sourceData.elements;
            var saveFields = [];
            var saveSort = [];
            var eleById = fieldObj.eleById; // 编辑的字段
            var eleNullId = fieldObj.eleNullId; // 新增的字段
            var state = fieldObj.state; // 新增的字段
            // 编辑的字段需要比较 新增字段直接保存
            // 是否是默认状态 不是默认状态编辑字段不单独保存 保存到状态
            var editFields = {};
            for(var fieldId in eleById){
                var sourceField = $.extend(true, {}, sourElements[fieldId]);
                var sourceFieldConfig = sourceField.config;
                // delete sourceFieldConfig.nsSource;
                if(eleById[fieldId].element.config != JSON.stringify(sourceFieldConfig)){
                    editFields[fieldId] = eleById[fieldId].element;
                    eleById[fieldId].isEdit = true;
                    saveSort.push(sourElements[fieldId]);
                }else{
                    eleById[fieldId].isEdit = false;
                }
            }
            if(fieldObj.isDefaultState){
                for(var key in editFields){
                    eleById[key].isEdit = false; // 保存了字段配置 状态不用保存所以isEdit == false
                    saveFields.push(editFields[key]);
                } 
                for(var i=0; i<eleNullId.length; i++){
                    saveFields.push(eleNullId[i].element);
                    saveSort.push(eleNullId[i]);
                }
            }
            fieldObj.saveSort = saveSort;
            return saveFields;
        },
        saveFieldsByCurrentData : function(callBackFunc){
            var currentData = dataManage.currentData;
            var fields = currentData.fields;
            function func(i){
                var saveFields = fieldManager.getSaveField(fields[i]);
                if(saveFields.length == 0){
                    if(typeof(callBackFunc) == "function"){
                        callBackFunc([], i);
                    }
                    // continue;
                    return;
                }
                fieldManager.saveFields(saveFields, (function(stateIndex, _saveFields){
                    return function(resData){
                        // 通过返回数据添加保存数据的id
                        for(var i=0; i<_saveFields.length; i++){
                            _saveFields[i].id = resData[i].id;
                        }
                        if(typeof(callBackFunc) == "function"){
                            callBackFunc(resData, stateIndex);
                        }
                    }
                })(i, saveFields));
            }
            for(var i=0; i<fields.length; i++){
                var eleNullNsSource = fields[i].eleNullNsSource;
                if(eleNullNsSource.length > 0 && fields[i].isDefaultState){
                    fieldManager.saveSourceField(eleNullNsSource, (function(_func, _i){
                            return function(resData){
                                var _currentData = dataManage.currentData;
                                var _fields = currentData.fields;
                                var _eleNullNsSource = _fields[_i].eleNullNsSource;
                                for(var i=0; i<resData.length; i++){
                                    _fields[_i].list[_eleNullNsSource[i].index].children = [resData[i].id];
                                }
                                _func(_i);
                            }
                        })(func, i)
                    );
                }else{
                    func(i);
                }
            }
        },
        saveFields : function(fields, callBackFunc){
            NetstarEditorAjax.savePageData(
                fields,
                {
                    fields : fields,
                    callBackFunc : callBackFunc,
                }, 
                function(resData, plusData){
                    if(typeof(plusData.callBackFunc) == "function"){
                        plusData.callBackFunc(resData);
                    }
                },
                'fields'
            )
        },
    }
    // 状态
    var stateManage = {
        getSaveGroup : function(callBackFunc){
            fieldManager.saveFieldsByCurrentData(function(resData, stateIndex){
                var currentData = dataManage.currentData;
                var states = currentData.states;
                // 是否编辑fieldGroup即是否需要保存
                var isSaveGroup = false;
                // 判断状态是否是新增 fieldGroup
                // var isAddGroup = states[stateIndex].children.length == 0;
                var isAddGroup = true;
                if(states[stateIndex].children && states[stateIndex].children.length > 0){
                    isAddGroup = false;
                }
                var fieldGroup = {
                    type : 'fieldGroup',
                    config : '{}',
                    children : [],
                }
                if(!isAddGroup){
                    fieldGroup = currentData.fieldGroup[states[stateIndex].children[0]];
                }
                // 只保存新增字段的Id 编辑字段的id状态组中已经包含
                var children = fieldGroup.children;
                for(var i=0; i<resData.length; i++){
                    if(typeof(resData[i].id) == "string" && children.indexOf(resData[i].id) == -1){
                        isSaveGroup = true;
                        children.push(resData[i].id);
                    }
                }
                if(!isSaveGroup){
                    fieldGroup = false;
                }
                if(typeof(callBackFunc) == "function"){
                    callBackFunc(fieldGroup, stateIndex);
                }
            });
        },
        saveGroup : function(callBackFunc){
            stateManage.getSaveGroup(function(fieldGroup, stateIndex){
                // 没有变化不进行保存
                if(!fieldGroup){
                    callBackFunc(false, stateIndex);
                    return false;
                }
                NetstarEditorAjax.savePageData(
                    fieldGroup,
                    {
                        callBackFunc : callBackFunc,
                    }, 
                    function(resData, plusData){
                        if(typeof(plusData.callBackFunc) == "function"){
                            plusData.callBackFunc(resData, stateIndex);
                        }
                    },
                    'group'
                )
            });
        },
        // 比较对象获取不同的属性
        getDifParamsByObj : function(source, current){
            var res = {};
            function run(souObj, currObj, save){
                for(var key in currObj){
                    // 特殊字段特殊处理
                    switch(key){
                        case 'subdata':
                            break;
                        default:
                            if(typeof(currObj[key]) == "object"){
                                if(typeof(souObj[key]) == "object"){
                                    save[key] = {};
                                    run(souObj[key], currObj[key], save[key]);
                                    if($.isEmptyObject(save[key])){
                                        delete save[key];
                                    }
                                }else{
                                    save[key] = currObj[key];
                                }
                            }else{
                                if(currObj[key] != souObj[key]){
                                    save[key] = currObj[key];
                                }
                            }
                            break;
                    }
                }
            }
            run(source, current, res);
            return res;
        },
        getSaveState : function(stateIndex){
            var currentData = dataManage.currentData;
            var sourceData = dataManage.sourceData;
            var elements = sourceData.elements;
            var fieldGroup = currentData.fieldGroup;
            var fieldsObj = currentData.fields[stateIndex];
            var stateConfig = currentData.states[stateIndex];
            var fieldList = fieldsObj.list;
            var eleById = fieldsObj.eleById;
            var sort = [];
            // var fieldCons = {};
            var fieldCons = [];
            var fieldConsIds = []; // 用于识别要删除字段
            for(var i=0; i<fieldList.length; i++){
                var field = fieldList[i];
                if(fieldConsIds.indexOf(field.id) > -1){
                    continue;
                }
                if(field.id){
                    fieldConsIds.push(field.id);
                }
                if(eleById[field.id]){
                    var eleObj = eleById[field.id];
                    var sourceElement = elements[field.id].config;
                    var eleObjCon = typeof(eleObj.element.config) == "string" ? JSON.parse(eleObj.element.config) : eleObj.element.config;
                    var saveElement = stateManage.getDifParamsByObj(sourceElement, eleObjCon);
                    var obj = {
                        id : field.id,
                        config : saveElement,
                    }
                    if(eleObj.isEdit){
                        // 修改
                        // 找到修改的属性进行保存
                        // fieldCons[field.id] = eleObj.element;
                        // var eleObjCon = typeof(eleObj.element.config) == "string" ? JSON.parse(eleObj.element.config) : eleObj.element.config;
                        // var saveElement = stateManage.getDifParamsByObj(sourceElement, eleObjCon);
                        // fieldCons[field.id] = {
                        //     objectState : NSSAVEDATAFLAG.EDIT,
                        //     config : saveElement
                        // };
                        // fieldCons.push({
                        //     id : field.id,
                        //     objectState : NSSAVEDATAFLAG.EDIT,
                        //     config : saveElement,
                        // })
                        obj.objectState = NSSAVEDATAFLAG.EDIT;
                    }else{
                        // 未操作
                        // fieldCons[field.id] = {
                        //     objectState : NSSAVEDATAFLAG.NULL,
                        // }
                        // fieldCons.push({
                        //     id : field.id,
                        //     objectState : NSSAVEDATAFLAG.NULL,
                        // })
                        obj.objectState = NSSAVEDATAFLAG.NULL;
                    }
                    if($.isEmptyObject(obj.config)){
                        delete obj.config;
                    }
                    fieldCons.push(obj);
                }else{
                    // 新增
                    // fieldCons[field.id] = {
                    //     objectState : NSSAVEDATAFLAG.ADD,
                    // } 
                    // 默认状态新增只记录NSSAVEDATAFLAG.ADD, 非默认状态新增要记录所有配置  通过是否有id判断是否是默认状态
                    if(field.id){
                        fieldCons.push({
                            id : field.id,
                            objectState : NSSAVEDATAFLAG.ADD,
                        });
                    }else{
                        fieldCons.push({
                            objectState : NSSAVEDATAFLAG.ADD,
                            config : JSON.parse(field.config)
                        });
                    }
                }
                // sort.push(field.id);
            }
            // 不起作用暂时不写  删除
            if(stateConfig.children && stateConfig.children[0] && fieldGroup[stateConfig.children[0]]){
                var groupChildren = fieldGroup[stateConfig.children[0]].children;
                for(var i=0; i<groupChildren.length; i++){
                    if(fieldConsIds.indexOf(groupChildren[i]) == -1){
                        // 删除
                        fieldCons.push({
                            id : groupChildren[i],
                            objectState : NSSAVEDATAFLAG.DELETE,
                        })
                    }
                }
            }
            var _stateConfig = stateConfig.config;
            _stateConfig.fields = fieldCons;
            // _stateConfig.sort = sort;
            stateConfig.config = JSON.stringify(_stateConfig);
            return stateConfig;
        },
        // 判断是否没变 如果有id表示是编辑 与原数据比较是否需要保存 
        getStateIsChange : function(stateConfig){
            if(!stateConfig.id){
                return true;
            }
            var stateConfigCon = JSON.parse(stateConfig.config);
            var fieldCons = stateConfigCon.fields;
            var sort = stateConfigCon.sort;
            var sourceState = dataManage.getElementByEleId(stateConfig.id);
            var sourceStateConfig = sourceState.config;
            var isSame = true;
            // 比较children 即stateGroup
            if(sourceState.children[0] != stateConfig.children[0]){
                isSame = false;
            }
            // 比较config的sort 即字段排序
            if(isSame){
                if(JSON.stringify(sourceStateConfig.sort) != JSON.stringify(sort)){
                    isSame = false;
                }
            }
            // 比较状态是1/0是一样的都是读默认 -1 删除忽略不计
            if(isSame){
                var sourFields = sourceStateConfig.fields;
                // for(var key in sourFields){
                //     var sourObjState = sourFields[key].objectState;
                //     var currObjState = fieldCons[key].objectState;
                //     if(sourObjState == NSSAVEDATAFLAG.ADD || sourObjState === NSSAVEDATAFLAG.NULL){
                //         // 原始是新增/不变
                //         if(currObjState == NSSAVEDATAFLAG.ADD || currObjState === NSSAVEDATAFLAG.NULL){
                //             // 表示不变
                //         }else{
                //             isSame = false;
                //             break; 
                //         }
                //     }else{
                //         // 原始是修改 比较修改数据是否变化
                //         if(currObjState == NSSAVEDATAFLAG.ADD || currObjState === NSSAVEDATAFLAG.NULL){
                //             // 表示读取默认删除修改编辑
                //             isSame = false;
                //             break;
                //         }else{
                //             // 多次修改
                //             if(JSON.stringify(sourFields[key]) !== JSON.stringify(fieldCons[key])){
                //                 isSame = false;
                //                 break;
                //             }
                //         }
                //     }
                // }
                function getSouField(id){
                    var souField = false;
                    for(var i=0; i<sourFields.length; i++){
                        if(sourFields[i].id == id){
                            souField = sourFields[i];
                            break;
                        }
                    }
                    return souField;
                }
                // 通过显示id 即：表单的id; 表格的field获取原始值
                function getSouFieldByShowId(formId, tableId){
                    var souField = false;
                    for(var i=0; i<sourFields.length; i++){
                        if(typeof(sourFields[i].id) != "undefined"){ continue; }
                        var souCon = sourFields[i].config;
                        if(souCon.form){
                            if((typeof(formId) != "undefined" && souCon.form.id) || (typeof(tableId) != "undefined" && souCon.table.field)){
                                souField = sourFields[i];
                                break;
                            }
                        }
                    }
                    return souField;
                }
                for(var i=0; i<fieldCons.length; i++){
                    var currObjState = fieldCons[i].objectState;
                    var fieldId = fieldCons[i].id;
                    if(typeof(fieldId) == "undefined"){
                        var fieldConsObj = fieldCons[i];
                        var fieldConsObjCon = fieldCons[i].config;
                        var souField = getSouFieldByShowId(fieldConsObjCon.form.id, fieldConsObjCon.table.field);
                        if(!souField){
                            isSame = false;
                            break;
                        }
                        if(JSON.stringify(souField) !== JSON.stringify(fieldCons[i])){
                            isSame = false;
                            break;
                        }
                    }else{
                        var souField = getSouField(fieldId);
                        if(!souField){
                            isSame = false;
                            break;
                        }
                        var sourObjState = souField.objectState;
                        if(sourObjState == NSSAVEDATAFLAG.ADD || sourObjState === NSSAVEDATAFLAG.NULL){
                            // 原始是新增/不变
                            if(currObjState == NSSAVEDATAFLAG.ADD || currObjState === NSSAVEDATAFLAG.NULL){
                                // 表示不变
                            }else{
                                isSame = false;
                                break; 
                            }
                        }else{
                            // 原始是修改 比较修改数据是否变化
                            if(currObjState == NSSAVEDATAFLAG.ADD || currObjState === NSSAVEDATAFLAG.NULL){
                                // 表示读取默认删除修改编辑
                                isSame = false;
                                break;
                            }else{
                                // 多次修改
                                if(JSON.stringify(souField.config) !== JSON.stringify(fieldCons[i].config)){
                                    isSame = false;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            // 比较config
            if(isSame){
                var sourConfig = sourceStateConfig.config;
                var currentConfig = stateConfigCon.config;
                if(typeof(sourConfig) == typeof(currentConfig)){
                    if(JSON.stringify(sourConfig) != JSON.stringify(currentConfig)){
                        isSame = false;
                    }
                }else{
                    isSame = false;
                }
            }
            return !isSame;
        },
        saveState : function(callBackFunc){
            stateManage.saveGroup(function(resData, stateIndex){
                var state = stateManage.getSaveState(stateIndex);
                if(resData){
                    state.children = [resData[0].id];
                }
                var stateIsChange = stateManage.getStateIsChange(state);
                if(!stateIsChange){
                    // 状态没变
                    if(typeof(callBackFunc) == "function"){
                        callBackFunc([state], stateIndex);
                    }
                    return false;
                }
                NetstarEditorAjax.savePageData(
                    state,
                    {
                        callBackFunc : callBackFunc,
                    }, 
                    function(resData, plusData){
                        if(typeof(plusData.callBackFunc) == "function"){
                            plusData.callBackFunc(resData, stateIndex);
                        }
                    },
                    'state'
                )
            });

        },
    }
    // page
    var pageManage = {
        getComponent : function(component){
            var sourceData = dataManage.sourceData;
            var elements = sourceData.elements;
            if(component.id){
                // 修改
                var element = $.extend(true, {}, elements[component.id]);
                var sourConfig = $.extend(true, {}, element.config);
                delete sourConfig.fields;
                delete sourConfig.nsState;
                delete sourConfig.nsId;
                var sourConfigStr = JSON.stringify(sourConfig);
                var isSameCon = false;
                if(component.config == sourConfigStr){
                    isSameCon = true;
                }
                var isSave = true;
                if(isSameCon){
                    if(component.children[0] == element.children[0]){
                        isSave = false;
                    }
                }
                if(!isSave){
                    component = false;
                }
            }
            // 新增
            return component;
        },
        saveComponent : function(callBackFunc){
            stateManage.saveState(function(resData, stateIndex){
                var currentData = dataManage.currentData;
                var components = currentData.components;
                var _component = components[stateIndex];
                _component.children = [resData[0].id];
                var component = pageManage.getComponent(_component);
                if(component){
                    NetstarEditorAjax.savePageData(
                        component,
                        {
                            callBackFunc : callBackFunc,
                        }, 
                        function(resData, plusData){
                            if(typeof(plusData.callBackFunc) == "function"){
                                plusData.callBackFunc(resData, stateIndex);
                            }
                        },
                        'component'
                    )
                }else{
                    if(typeof(callBackFunc) == "function"){
                        callBackFunc([_component], stateIndex);
                    }
                }
            });
        },
        getPage : function(page){
            var sourceData = dataManage.sourceData;
            var elements = sourceData.elements;
            if(page.id){
                // 编辑
                var element = $.extend(true, {}, elements[page.id]);
                var sourConfig = $.extend(true, {}, element.config);
                // delete sourConfig.components;
                var components = sourConfig.components;
                var pageComponents = [];
                for(var i=0; i<components.length; i++){
                    var component = components[i];
                    var fields = component.fields;
                    // 按钮/tab不需要状态处理
                    if(typeof(component.type) == "btns" || component.type == "tab" ||  component.type == "tree"){
                        pageComponents.push(component);
                        continue;
                    }
                    // 没有fields的面板component不需要状态处理
                    if(typeof(fields) == "undefined"){
                        pageComponents.push(component);
                        continue;
                    }
                    // 需要状态处理的计为 false
                    pageComponents.push(false);
                }
                sourConfig.components = pageComponents;
                delete sourConfig.nsId
                var sourConfigStr = JSON.stringify(sourConfig);
                var isSameCon = false;
                if(page.config == sourConfigStr){
                    isSameCon = true;
                }
                var isSave = true;
                if(isSameCon){
                    if(JSON.stringify(page.children) == JSON.stringify(element.children)){
                        isSave = false;
                    }
                }
                if(!isSave){
                    page = false;
                }
            }
            // 新增
            return page;
        },
        savePage : function(callBackFunc){
            pageManage.saveComponent(function(resData, stateIndex){
                var currentData = dataManage.currentData;
                var page = currentData.page;
                page.children[stateIndex] = resData[0].id;
                var pageConfig = currentData.pageConfig;
                var isSave = true;
                for(var i=0; i<page.children.length; i++){
                    if(!page.children[i]){
                        isSave = false;
                    }
                }
                if(!isSave){
                    return ;
                }
                if(page.children.length == pageConfig.pageConfigComponentLenth){
                    _page = pageManage.getPage(page);
                    if(!_page){
                        // 没有改变
                        if(NetstarEditorAjax.data.length > 0){
                            nsAlert('保存成功'); 
                        }else{
                            nsAlert("没有编辑数据");
                        }
                        if(typeof(callBackFunc) == "function"){
                            callBackFunc([page]);
                        }
                        return false;
                    }
                    NetstarEditorAjax.savePageData(
                        _page,
                        {
                            callBackFunc : callBackFunc,
                        }, 
                        function(resData, plusData){
                            if(NetstarEditorAjax.data.length > 0){
                                nsAlert('保存成功'); 
                            }else{
                                nsAlert("没有编辑数据");
                            }
                            if(typeof(plusData.callBackFunc) == "function"){
                                plusData.callBackFunc(resData);
                            }
                        },
                        'page'
                    )
                }
            });
        },
    }
    // 数据
    var dataManage = {
        sourceData : {
            isPage : false,
            list : [],
            elements : {},
            elementsByType : {},
        },
        currentData : {},
        sourcePageConfig : {},
        // 通过id获取原始element
        getElementByEleId : function(id){
            var sourceData = dataManage.sourceData;
            var elements = sourceData.elements;
            var element = elements[id] ? elements[id] : false;
            return element;
        },
        // 获取所有元素的list
        getListByElementTree : function(tree){
            var list = [];
            function func(_tree){
                for(var i=0; i<_tree.length; i++){
                    var isHadChild = $.isArray(_tree[i].children) && _tree[i].children.length > 0;
                    list.push(_tree[i]);
                    if(isHadChild){
                        func(_tree[i].children);
                    }
                }
            }
            func(tree);
            for(var i=0; i<list.length; i++){
                var ids = [];
                if($.isArray(list[i].children) && list[i].children.length > 0){
                    for(var j=0; j<list[i].children.length; j++){
                        ids.push(list[i].children[j].id);
                    }
                    list[i].children = ids;
                }else{
                    list[i].children = [];
                }
            }
            return list;
        },
        // 通过id获取所有元素
        getElementById : function(list){
            var elements = {};
            for(var i=0; i<list.length; i++){
                var listObj = list[i];
                elements[listObj.id] = listObj;
                if(typeof(listObj.config) == "string"){
                    listObj.config = JSON.parse(listObj.config);
                }
            }
            return elements;
        },
        // 获取页面元素
        getElementByType : function(list){
            var elements = {};
            for(var i=0; i<list.length; i++){
                var listObj = list[i];
                if(typeof(elements[listObj.type]) == "undefined"){
                    if(panelType[listObj.type] === 0){
                        elements[listObj.type] = listObj;
                        continue;
                    }else{
                        elements[listObj.type] = {};
                    }
                }
                elements[listObj.type][listObj.id] = listObj;
            }
            return elements;
        },
        // 获取当前状态字段
        getStateFields : function(){},
        // 保存页面元素数据
        savePageElement : function(pageTree){
            var list = this.getListByElementTree(pageTree);
            // var list = pageTree;
            var elementsById = this.getElementById(list);
            var elementsByType = this.getElementByType(list);
            var isHavePage = typeof(elementsByType.page) == "object";
            this.sourceData = {
                isPage : isHavePage,
                list : list,
                elements : elementsById,
                elementsByType : elementsByType
            }
        },
        // 保存状态元素数据
        setSourceElementByTree : function(treeData){
            var list = this.getListByElementTree(treeData);
            var elementsById = this.getElementById(list);
            var elementsByType = this.getElementByType(list);
            var sourceData = this.sourceData;
            var sourceList = sourceData.list;
            var sourceElements = sourceData.elements;
            var sourceElementsByType = sourceData.elementsByType;
            for(var i=0; i<list.length; i++){
                var isHave = false;
                for(var j=0; j<sourceList.length; j++){
                    if(sourceList[j].id == list[i].id){
                        isHave = true;
                        break;
                    }
                }
                if(!isHave){
                    sourceList.push(list[i]);
                }
            }
            for(var keyId in elementsById){
                if(typeof(sourceElements[keyId]) == "undefined"){
                    sourceElements[keyId] = elementsById[keyId];
                }
            }
            for(var keyType in elementsByType){
                if(typeof(sourceElementsByType[keyType]) == "undefined"){
                    sourceElementsByType[keyType] = elementsByType[keyType];
                    continue;
                }
                for(var eleId in elementsByType[keyType]){
                    if(typeof(sourceElementsByType[keyType][eleId]) == "undefined"){
                        sourceElementsByType[keyType][eleId] = elementsByType[keyType][eleId];
                    }
                }
            }
            // this.sourceData = {
            //     isPage : isHavePage,
            //     list : list,
            //     elements : elementsById,
            //     elementsByType : elementsByType
            // }
        },
        // 获字段配置通过状态字段配置和原始字段配置
        getFieldConfigByStateField : function(fieldObj, stateFieldObj){
            function run(field, stateField){
                for(var key in stateField){
                    // 特殊字段特殊处理
                    switch(key){
                        case 'subdata':
                            switch(field.type){
                                case 'radio':
                                case 'checkbox':
                                case 'select':
                                    if(field.url || field.suffix){
                                        delete fieldObj.url;
                                        delete fieldObj.suffix;
                                    }
                                    field.subdata = stateField.subdata;
                                    break;
                            }
                            break;
                        case 'url':
                        case 'suffix':
                            switch(field.type){
                                case 'radio':
                                case 'checkbox':
                                case 'select':
                                    if(field.subdata){
                                        delete field.subdata;
                                    }
                                    if(field[key] != stateField[key]){
                                        field[key] = stateField[key];
                                    }
                                    break;
                                default : 
                                    if(field[key] != stateField[key]){
                                        field[key] = stateField[key];
                                    }
                                    break;
                            }
                            break;
                        default:
                            if(typeof(stateField[key]) == "object"){
                                if(typeof(field[key]) == "object"){
                                    run(field[key], stateField[key]);
                                }else{
                                    field[key] = stateField[key];
                                }
                            }else{
                                if(field[key] != stateField[key]){
                                    field[key] = stateField[key];
                                }
                            }
                            break;
                    } 
                }
            }
            run(fieldObj, stateFieldObj);
            // 
            return fieldObj;
        },
        // 通过字段配置/面板类型获取组件
        getFieldConfigByFieldAndComType : function(panelById, fieldConfig, type){
            var _fieldConfig = $.extend(true, {}, fieldConfig.config);
            if(typeof(_fieldConfig) == "undefined"){
                return false;
            }
            // 判断_fieldConfig是否为空对象  从旧的编辑器倒过来时存在空，原因字段未编辑但已用于状态
            var isHaveFieldConfig = true;
            /*** 识别表单表格start ***/
            switch(type){
                case 'vo':
                    _fieldConfig = _fieldConfig.form;
                    break;
                default:
                    _fieldConfig = _fieldConfig.table;
                    if($.isEmptyObject(_fieldConfig)){
                        isHaveFieldConfig = false;
                    }else{
                        var isOnlyEdit = true;
                        for(var key in _fieldConfig){
                            if(key != 'editConfig'){
                                isOnlyEdit = false;
                            }
                        }
                        if(isOnlyEdit){
                            isHaveFieldConfig = false;
                        }
                    }
                    // 判断表格字段知否有editConfig 如果没有根据表单或默认生成editConfig
                    if(typeof(_fieldConfig.editConfig) == "undefined"){
                        if(typeof(_fieldConfig.form) == "object" && !$.isEmptyObject(_fieldConfig.form)){
                            _fieldConfig.editConfig = $.extend(true, {}, _fieldConfig.form);
                            delete _fieldConfig.editConfig.id;
                        }else{
                            var formType = "text";
                            switch(_fieldConfig.variableType){
                                case "number":
                                    formType = 'number';
                                    break;
                                case "date":
                                    formType = 'date';
                                    break;
                            }
                            var defaultFieldConfig = { 
                                type:formType, 
                                // formSource:'table', 
                                // templateName:'PC',
                                variableType: _fieldConfig.variableType,
                            };
                            _fieldConfig.editConfig = defaultFieldConfig;
                        }
                    }
                    break;
            }
            if(typeof(_fieldConfig) == "undefined"){
                return false;
            }
            /*** 识别表单表格end ***/
            // 判断_fieldConfig是否为空对象  从旧的编辑器倒过来时存在空，原因字段未编辑但已用于状态
            if($.isEmptyObject(_fieldConfig)){
                isHaveFieldConfig = false;
            }
            // 是否存在原始字段
            if(fieldConfig.id){
                _fieldConfig.nsId = fieldConfig.id;
                // source中config是原始配置 不会存在children
                var source = panelById[fieldConfig.children[0]];
                _fieldConfig.nsSource = source.config;
                _fieldConfig.nsSource.id = source.id;
                if(!isHaveFieldConfig){
                    _fieldConfig.title = _fieldConfig.nsSource.chineseName;
                    _fieldConfig.field = _fieldConfig.nsSource.englishName;
                }
                
            }
            return _fieldConfig;
        },
        // 获取pageConfig
        getPageConfig : function(){
            // 获取根节点 即：页面配置
            var sourceData = $.extend(true, {}, this.sourceData);
            var panelById = sourceData.elements;
            var _pageConfig = sourceData.elementsByType.page;
            // 页面配置是page面板的config 其中页面配置的components是page面板中的children部分
            var pageConfig = _pageConfig.config;
            // pageConfig.components = [];
            pageConfig.nsId = _pageConfig.id;
            var components = _pageConfig.children;
            var _components = [];
            for(var i=0; i<components.length; i++){
                var component = panelById[components[i]];
                // component中config是面板配置，children是状态配置
                var comPanel = component.config;
                // 通过状态配置获取字段配置
                var fields = [];
                var state = panelById[component.children[0]];
                if(typeof(state) == "undefined"){
                    // 只有修改tab保存方式之前的或走这里
                    _components.push(comPanel);
                    continue;
                }
                // state中config是当前状态 objectState:0不变，读子级配置；1新增，读子级配置；2修改，读当前配置+原始配置；-1删除，不存当前字段
                //        children是默认状态所有字段(stateGroup)
                var stateConfig = state.config;
                var fieldsConfig = stateConfig.fields;
                var fieldsSort = stateConfig.sort;
                var stateGroup;
                if($.isArray(state.children)){
                    stateGroup = panelById[state.children[0]];
                }
                var stateIds = [];
                for(var fieldI=0; fieldI<fieldsConfig.length; fieldI++){
                    var fieldConfigObj = fieldsConfig[fieldI];
                    var fieldId = fieldConfigObj.id;
                    stateIds.push(fieldId);
                    var objectState = fieldConfigObj.objectState;
                    if(objectState === NSSAVEDATAFLAG.DELETE){ continue; } // 删除
                    // 编辑
                    if(objectState === NSSAVEDATAFLAG.EDIT){
                        // var fieldConfig = fieldsConfig[fieldId];  // lyw 可能存在问题
                        var fieldConfig = $.extend(true, {}, panelById[fieldId]);
                        // 通过默认字段配置和状态配置获取字段配置
                        var stateParams = fieldConfigObj.config;
                        fieldConfig.config = dataManage.getFieldConfigByStateField(fieldConfig.config, stateParams)
                    }
                    // 不变 新增
                    if(objectState === NSSAVEDATAFLAG.NULL || objectState === NSSAVEDATAFLAG.ADD){
                        var fieldConfig = $.extend(true, {}, panelById[fieldId]);
                        // 通过判断fieldId，判断之前的状态字段是否在默认状态中存在
                        if(typeof(fieldId) == "undefined"){
                            fieldConfig = fieldConfigObj;
                        }
                    }
                    // fieldConfig中config是字段配置 children是原始值配置
                    var _fieldConfig = dataManage.getFieldConfigByFieldAndComType(panelById, fieldConfig, comPanel.type);
                    if(!_fieldConfig){ continue; }
                    fields.push(_fieldConfig);
                }
                // 通过fieldGroup设置完整的字段
                if(stateGroup){
                    var groupFieldIds = stateGroup.children;
                    for(var chiI=0; chiI<groupFieldIds.length; chiI++){
                        if(stateIds.indexOf(groupFieldIds[chiI]) == -1){
                            var fieldId = groupFieldIds[chiI];
                            var fieldConfig = $.extend(true, {}, panelById[fieldId]);
                            var _fieldConfig = dataManage.getFieldConfigByFieldAndComType(panelById, fieldConfig, comPanel.type);
                            fields.push(_fieldConfig);
                        }
                    }
                }
                comPanel.field = fields;
                // 状态信息
                comPanel.nsState = state;
                comPanel.nsId = component.id;
                comPanel.nsStateId = state.id;
                comPanel.nsStateName = typeof(stateConfig.config) == "object" && typeof(stateConfig.config.chineseName) == "string" ? stateConfig.config.chineseName : '';
                _components.push(comPanel);
            }
            var pageComponents = pageConfig.components;
            var comIndex = 0;
            for(var i=0; i<pageComponents.length; i++){
                if(pageComponents[i] === false){
                    pageComponents[i] = _components[comIndex];
                    comIndex ++;
                }
            }
            console.log(pageConfig)
            dataManage.sourcePageConfig = pageConfig;
            // showModule.init(pageConfig,true);
            return pageConfig;
        },
        setComponentPanelConfig : function(stateTree, comPanel){
            var list = dataManage.getListByElementTree(stateTree);
            var panelById = dataManage.getElementById(list);
            var elementsByType = dataManage.getElementByType(list);
            var state = panelById[stateTree[0].id];
            // state中config是当前状态 objectState:0不变，读子级配置；1新增，读子级配置；2修改，读当前配置+原始配置；-1删除，不存当前字段
            //        children是默认状态所有字段(stateGroup)
            var stateConfig = state.config;
            var fieldsConfig = stateConfig.fields;
            var stateGroup;
            if($.isArray(state.children)){
                stateGroup = panelById[state.children[0]];
            }
            var stateIds = [];
            var fields = [];
            for(var fieldI=0; fieldI<fieldsConfig.length; fieldI++){
                var fieldConfigObj = fieldsConfig[fieldI];
                var fieldId = fieldConfigObj.id;
                stateIds.push(fieldId);
                var objectState = fieldConfigObj.objectState;
                if(objectState === NSSAVEDATAFLAG.DELETE){ continue; } // 删除
                // 编辑
                if(objectState === NSSAVEDATAFLAG.EDIT){
                    // var fieldConfig = fieldsConfig[fieldId];  // lyw 可能存在问题
                    var fieldConfig = $.extend(true, {}, panelById[fieldId]);
                    // 通过默认字段配置和状态配置获取字段配置
                    var stateParams = fieldConfigObj.config;
                    fieldConfig.config = dataManage.getFieldConfigByStateField(fieldConfig.config, stateParams)
                }
                // 不变 新增
                if(objectState === NSSAVEDATAFLAG.NULL || objectState === NSSAVEDATAFLAG.ADD){
                    var fieldConfig = $.extend(true, {}, panelById[fieldId]);
                    // 通过判断fieldId，判断之前的状态字段是否在默认状态中存在
                    if(typeof(fieldId) == "undefined"){
                        fieldConfig = fieldConfigObj;
                    }
                }
                // fieldConfig中config是字段配置 children是原始值配置
                var _fieldConfig = dataManage.getFieldConfigByFieldAndComType(panelById, fieldConfig, comPanel.type);
                if(!_fieldConfig){ continue; }
                fields.push(_fieldConfig);
            }
            // 通过fieldGroup设置完整的字段
            if(stateGroup){
                var groupFieldIds = stateGroup.children;
                for(var chiI=0; chiI<groupFieldIds.length; chiI++){
                    if(stateIds.indexOf(groupFieldIds[chiI]) == -1){
                        var fieldId = groupFieldIds[chiI];
                        var fieldConfig = $.extend(true, {}, panelById[fieldId]);
                        var _fieldConfig = dataManage.getFieldConfigByFieldAndComType(panelById, fieldConfig, comPanel.type);
                        fields.push(_fieldConfig);
                    }
                }
            }
            comPanel.field = fields;
            // 状态信息
            comPanel.nsState = state;
            // 更新sourceData中数据
            var sourceData = dataManage.sourceData;
            for(var key in panelById){
                if(typeof(sourceData.elements[key]) == "undefined"){
                    sourceData.elements[key] = panelById[key];
                }
            }
            for(var key in elementsByType){
                if(typeof(sourceData.elementsByType[key]) == "undefined"){
                    sourceData.elementsByType[key] = {};
                }
                for(var keyId in elementsByType[key]){
                    if(typeof(sourceData.elementsByType[key][keyId]) == "undefined"){
                        sourceData.elementsByType[key][keyId] = elementsByType[key][keyId];
                    }
                }
            }
            for(var i=0; i<list.length; i++){
                var isHad = false;
                for(var j=0; j<sourceData.list.length; j++){
                    if(sourceData.list[j].id == list[i].id){
                        isHad = true;
                    }
                }
                if(!isHad){
                    sourceData.list.push(list[i]);
                }
            }
        },
        // 获取字段元素
        getFieldsElement : function(fields, type, nsStateId){
            var sourceData = $.extend(true, {}, dataManage.sourceData);
            var sourElements = sourceData.elements;
            var list = [];
            var idsObj = {};
            var nullIdObj = [];
            var nullSourceField = [];
            // 改变原始元素通过状态
            if(nsStateId){
                var stateElement = sourElements[nsStateId];
                var stateConfig = stateElement.config;
                var stateFields = stateConfig.fields;
                for(var i=0; i<stateFields.length; i++){
                    var fieldElement = sourElements[stateFields[i].id];
                    if(typeof(fieldElement) == "undefined"){
                        // switch(type){
                        //     case 'vo':
                        //         var fieldElementConfig = stateFields[i].config.form;
                        //         fieldElement.config = fieldElementConfig;
                        //         break;
                        //     default:
                        //         var fieldElementConfig = stateFields[i].config.table;
                        //         fieldElement.config = fieldElementConfig;
                        //         break;
                        // }
                        continue;
                    }
                    var fieldElementConfig = fieldElement.config;
                    var stateConfig = stateFields[i].config ? stateFields[i].config : {};
                    fieldElement.config = dataManage.getFieldConfigByStateField(fieldElementConfig, stateConfig);
                }
            }
            for(var i=0; i<fields.length; i++){
                var field = fields[i];
                var isId = typeof(field.nsId) != "undefined";
                var fieldConfig = {};
                for(var key in field){
                    if(key == "nsSource"){ continue; }
                    if(key == "nsId"){ continue; }
                    fieldConfig[key] = field[key];
                }
                // fieldConfig
                var fieldSave = {
                    type : 'field',
                    // config : JSON.stringify(fieldConfig),
                    children : field.nsSource ? [field.nsSource.id] : [],
                }
                // fieldConfig需要添加补充表单表格
                var _fieldConfig = {
                    form : {},
                    table : {},
                };
                if(field.nsId){
                    fieldSave.id = field.nsId;
                    _fieldConfig = sourElements[field.nsId].config;
                }
                switch(type){
                    case 'vo':
                        _fieldConfig.form = fieldConfig;
                        break;
                    default:
                        _fieldConfig.table = fieldConfig;
                        break;
                }
                fieldSave.config = JSON.stringify(_fieldConfig);

                if(!field.nsSource){
                    var sourceField = {
                        type : 'source',
                        config : JSON.stringify(fieldConfig),
                    }
                    nullSourceField.push({
                        index : i,
                        element : sourceField,
                    });
                }
                list.push(fieldSave);
                if(isId){
                    idsObj[field.nsId] = {
                        index : i,
                        element : fieldSave,
                    };
                }else{
                    nullIdObj.push({
                        index : i,
                        element : fieldSave,
                    });
                }
            }
            var elements = {
                list : list,
                eleById : idsObj,
                eleNullId : nullIdObj,
                eleNullNsSource : nullSourceField
            };
            return elements;
        },
        // 获取所有元素 通过pageConfig
        getElementByPage : function(pageConfig){
            var elements = {
                fields : [],
                states : [],
                page : {},
                components : [],
                fieldGroup : {},
                pageConfig : pageConfig,
            };
            var sourceData = this.sourceData;
            // 按照层级划分类型
            // type == "page"
            var _pageConfig = {};
            for(var key in pageConfig){
                if(key == "components"){ continue; }
                if(key == "nsId"){ continue; }
                _pageConfig[key] = pageConfig[key];
            }
            var components = pageConfig.components;
            var pageComponents = [];
            var pageConfigComponentLenth = 0;
            for(var i=0; i<components.length; i++){
                var component = components[i];
                var fields = component.field;
                // 按钮/tab不需要状态处理
                if(component.type == "btns" || component.type == "tab"){
                    pageComponents.push(component);
                    continue;
                }
                // 没有fields的面板component不需要状态处理
                if(typeof(fields) == "undefined"){
                    pageComponents.push(component);
                    continue;
                }
                // 需要状态处理的计为 false
                pageComponents.push(false);
                pageConfigComponentLenth ++;
                // type == "components"
                var componentConfig = {};
                for(var key in component){
                    if(key == "field"){ continue; }
                    if(key == "nsState"){ continue; }
                    if(key == "nsId"){ continue; }
                    if(key == "isDefaultState"){ continue; }
                    if(key == "nsStateName"){ continue; }
                    if(key == "nsStateId"){ continue; }
                    componentConfig[key] = component[key];
                }
                var componentElement = {
                    type : 'components',
                    config : JSON.stringify(componentConfig),
                }
                if(component.nsId){
                    componentElement.id = component.nsId;
                }
                elements.components.push(componentElement);
                // 状态处理
                var stateSave = {
                    type : 'state',
                    config : {},
                    children : [],
                };
                // 是否是默认状态
                var isDefaultState = typeof(component.isDefaultState) == "boolean" ? component.isDefaultState : false;
                // 是否存在状id
                var isState = typeof(component.nsState) != "undefined";
                // 状态配置 children config使用原始配置
                var nsStateId = false;
                if(isState){
                    nsStateId = component.nsState.id;
                    stateSave.id = component.nsState.id;
                    // 存在状态一定存在stateGroup
                    stateSave.children = component.nsState.children;
                    // var stateGroupId = component.nsState.children[0];
                    var stateGroupId;
                    if($.isArray(component.nsState.children)){
                        stateGroupId = component.nsState.children[0];
                    }
                    if(stateGroupId){
                        elements.fieldGroup[stateGroupId] = $.extend(true, {}, sourceData.elements[stateGroupId]);
                    }

                    // 状态的config
                    var stateConfig = {};
                    var sourceStateConfig = $.extend(true, {}, component.nsState.config);
                    stateConfig.config = sourceStateConfig.config;
                    if(!$.isArray(stateSave.children)){
                        stateSave.children = [];
                    }
                    stateSave.config = stateConfig;
                }
                elements.states.push(stateSave);
                // 字段
                var fieldsElementObj = dataManage.getFieldsElement(fields, component.type, nsStateId);
                fieldsElementObj.type = component.type; // 保存表单表格数据时需要
                fieldsElementObj.index = i;
                fieldsElementObj.isDefaultState = isDefaultState;
                fieldsElementObj.state = isState ? component.nsState : {};
                elements.fields.push(fieldsElementObj);
            }
            _pageConfig.components = pageComponents;
            // 页面名字
            var controlName = _pageConfig.title ? _pageConfig.title + ' ' : '';
            controlName += _pageConfig.package ? _pageConfig.package : '';
            var pageElement = {
                type : 'page',
                children : [],
                config : JSON.stringify(_pageConfig),
                controlName : controlName,
            }
            if(pageConfig.nsId){
                pageElement.id = pageConfig.nsId;
            }
            elements.page = pageElement;
            elements.pageConfig.pageConfigComponentLenth = pageConfigComponentLenth;
            this.currentData = elements;
        },
        // 格式化方法主要用于旧编辑器转化为新编辑器时格式有变化部分
        formatPageConfig : function(pageConfig){
            var components = pageConfig.components;
            for(var i=0; i<components.length; i++){
                var comType = components[i].type;
                if(comType == "btns"){
                    var field = components[i].field;
                    for(var j=0; j<field.length; j++){
                        var _btnConfig = field[j];
                        if(typeof(field[j].functionConfig) == "object"){
                            _btnConfig = $.extend(true, {}, field[j].functionConfig);
                        }
                        if(typeof(field[j].btn) == "object"){
                            _btnConfig = $.extend(true, _btnConfig, field[j].btn);
                        }
                        if(typeof(_btnConfig.ajax) == "undefined"){
                            if(typeof(_btnConfig.suffix) == "string"){
                                _btnConfig.ajax = {
                                    datasourceType : 'api',
                                    url : _btnConfig.suffix,
                                    contentType : _btnConfig.contentType,
                                    dataSrc : _btnConfig.dataSrc,
                                    data : _btnConfig.ajaxData,
                                    type : _btnConfig.type,
                                    isUseGetRootPath : true,
                                }
                            }
                        }
                        delete _btnConfig.isReturn;
                        field[j] = _btnConfig;
                    }
                }
            }
        },
        initPrevFormat : function(pageConfig, callBackFunc){
            var components = pageConfig.components;
            var dialogBtns = [];
            for(var i=0; i<components.length; i++){
                var comType = components[i].type;
                if(comType == "btns"){
                    var field = components[i].field;
                    for(var j=0; j<field.length; j++){
                        var _btnConfig = field[j];
                        var functionConfig = _btnConfig.functionConfig;
                        switch(functionConfig.defaultMode){
                            case 'dialog':
                            case 'valueDialog':
                                if(typeof(functionConfig.functionField) == "string" && functionConfig.functionField.length > 0){
                                    dialogBtns.push({
                                        componentIndex : i,
                                        btnIndex : j,
                                        functionField : functionConfig.functionField
                                    });
                                }
                                break;
                        }
                    }
                }
            }
            if(dialogBtns.length > 0){
                var ajaxIndex = 0;
                for(var i=0; i<dialogBtns.length; i++){
                    var ajaxConfig = {
                        data : {
                            id : functionConfig.functionField,
                        },
                        plusData : {
                            pageConfig : pageConfig,
                            btnConfig : dialogBtns[i],
                            formatCallBackFunc : callBackFunc,
                        },
                        callBackFunc : function(resData, plusData){
                            ajaxIndex ++;
                            var _pageConfig = plusData.pageConfig;
                            var btn = _pageConfig.components[plusData.btnConfig.componentIndex].field[plusData.btnConfig.btnIndex];
                            var comConfig = {
                                type : 'vo',
                            }
                            if($.isArray(resData) && resData.length == 1){
                                NetstarEditorServer.setComponentPanelConfig(resData, comConfig);
                            }else{
                                console.error('获取状态错误');
                                console.error(resData);
                            }
                            btn.functionConfig.functionField = comConfig.field;
                            if(ajaxIndex == dialogBtns.length){
                                if(typeof(plusData.formatCallBackFunc) == "function"){
                                    plusData.formatCallBackFunc(_pageConfig);
                                }
                            }
                        }
                    }
                    NetstarEditorAjax.getById(ajaxConfig);
                }
            }else{
                callBackFunc(pageConfig);
            }
        },
    }
    // 保存数据元素状态验证判断是否修改状态名/是否默认状态
    var pageConfigManage = {
        componentIndex : 0,
        setIsSetDefField : function(pageConfig, callBackFunc){
            var stateIsSetDefType = NetstarEditorServer.stateIsSetDefType;
            var components = pageConfig.components;
            switch(stateIsSetDefType){
                case 0: // 默认状态
                    for(var i=0; i<components.length; i++){
                        var component = components[i];
                        // 按钮/tab不需要状态处理
                        if(component.type == "btns" || component.type == "tab"){
                            continue;
                        }
                        // 没有fields的面板component不需要状态处理
                        if(typeof(component.field) == "undefined"){
                            continue;
                        }
                        components[i].isDefaultState = true;
                    }
                    callBackFunc();
                    break;
                case 1: // 
                    for(var i=0; i<components.length; i++){
                        var component = components[i];
                        // 按钮/tab不需要状态处理
                        if(component.type == "btns" || component.type == "tab"){
                            continue;
                        }
                        // 没有fields的面板component不需要状态处理
                        if(typeof(component.field) == "undefined"){
                            continue;
                        }
                        components[i].isDefaultState = false;
                    }
                    callBackFunc();
                    break;
                case 2: // 
                    for(var i=0; i<components.length; i++){
                        var component = components[i];
                        var isContinue = false;
                        // 按钮/tab不需要状态处理
                        if(component.type == "btns" || component.type == "tab"){
                            isContinue = true;
                        }
                        // 没有fields的面板component不需要状态处理
                        if(typeof(component.field) == "undefined"){
                            isContinue = true;
                        }
                        if(isContinue){
                            pageConfigManage.componentIndex ++;
                        }else{
                            var isDefault = confirm("状态是否为默认状态？");
                            component.isDefaultState = isDefault;
                            pageConfigManage.componentIndex ++;
                        }
                        if(pageConfigManage.componentIndex == components.length){
                            if(typeof(callBackFunc) == "function"){
                                callBackFunc();
                            }
                        }
                    }
                    break;
            }
        },
        // 通过状态设置nsState
        setNsState : function(_pageConfig, callBackFunc){
            var pageConfig = $.extend(true, {}, _pageConfig);
            var components = pageConfig.components;
            for(var i=0; i<components.length; i++){
                var component = components[i];
                var nsState = component.nsState;
                var isSendAjax = true;
                if(typeof(nsState) == "object"){
                    // 进入页面时的状态存在, 比较状态是否改变 如果改变ajax请求 没改变删除nsStateId,并设置nsStateName
                    if(nsState.id == component.nsStateId || typeof(component.nsStateId) == "undefined" || (typeof(component.nsStateId) == "string" || component.nsStateId.length == 0)){
                        isSendAjax = false;
                        pageConfigManage.componentIndex ++;
                        if(component.nsStateName){
                            if(typeof(nsState.config) != "object"){ nsState.config = {}; }
                            nsState.config.name = component.nsStateName;
                        }
                    }
                }else{
                    if(typeof(component.nsStateId) == "undefined" || (typeof(component.nsStateId) == "string" || component.nsStateId.length == 0)){ isSendAjax = false; pageConfigManage.componentIndex ++; }
                }
                if(isSendAjax){
                    NetstarEditorAjax.getPageData({
                        id : component.nsStateId,
                    }, (function(index, _pageConfig, _callBackFunc){
                            return function(resData){
                                var _components = _pageConfig.components;
                                dataManage.setSourceElementByTree(resData);
                                var sourceElements = NetstarEditorServer.dataManage.sourceData.elements;
                                _components[index].nsState = sourceElements[resData[0].id];
                                pageConfigManage.componentIndex ++;
                                if(pageConfigManage.componentIndex == _components.length){
                                    _callBackFunc(_pageConfig);
                                }
                            }
                        })(i, pageConfig, callBackFunc)
                    )
                }else{
                    if(pageConfigManage.componentIndex == components.length){
                        callBackFunc(pageConfig);
                    }
                }
            }
        },
    }
    function getPageConfig(data, callBackFunc){
        NetstarEditorAjax.getPageData(data, function(resData){
            NetstarEditorServer.dataManage.savePageElement(resData);
            var pageConfig = NetstarEditorServer.dataManage.getPageConfig();
            dataManage.formatPageConfig(pageConfig);
            if(typeof(callBackFunc) == "function"){
                callBackFunc(pageConfig);
            }
        })
    }
    function getPageConfigByData(resData, callBackFunc){
        NetstarEditorServer.dataManage.savePageElement(resData);
        var pageConfig = NetstarEditorServer.dataManage.getPageConfig();
        dataManage.formatPageConfig(pageConfig);
        if(typeof(callBackFunc) == "function"){
            callBackFunc(pageConfig);
        }
    }
    function savePageConfig(pageConfig, callBackFunc){
        NetstarEditorAjax.data = [];
        pageConfigManage.componentIndex = 0;
        pageConfigManage.setNsState(pageConfig, function(_pageConfig){
            pageConfigManage.componentIndex = 0;
            pageConfigManage.setIsSetDefField(_pageConfig, function(){
                NetstarEditorServer.dataManage.getElementByPage(_pageConfig);
                NetstarEditorServer.pageManage.savePage(callBackFunc);
            });
        });
    }
    return {
        stateIsSetDefType : 1,
        dataManage : dataManage,
        pageManage : pageManage,
        getPageConfig : getPageConfig,
        savePageConfig : savePageConfig,
        initPrevFormat : dataManage.initPrevFormat,
        getPageConfigByData : getPageConfigByData,
        setComponentPanelConfig : dataManage.setComponentPanelConfig,
    }
})()

// 页面显示pageConfig初始化  
// 字段添加默认配置
// 方法添加运行方法
var NetstarProject = (function(){
    var configs = {};
    // 字段管理
    var fieldManager = {
        setFormField : function(fieldConfig, type){
            var netStarRootPathStr = getRootPath();
            switch(fieldConfig.mindjetType){
                case 'dict':
                    if(typeof(nsVals.dictData[fieldConfig.dictArguments])=='undefined'){
                        console.error('无法找到字典数据:'+fieldConfig.dictArguments)
                    }else{
                        fieldConfig.subdata = nsVals.dictData[fieldConfig.dictArguments].subdata;
                    }
                break;
            }
            switch(type){
                case 'text':
                    if(typeof(fieldConfig.remoteAjax)=="string" && fieldConfig.remoteAjax.indexOf('http:') == -1){
                        fieldConfig.remoteAjax = netStarRootPathStr + fieldConfig.remoteAjax;
                    }
                    break;
                //数据处理
                case 'tree-select':
                case 'treeSelect':
                case 'checkbox':
                case 'radio':
                    // if(fieldConfig.suffix){
                    //     fieldConfig.url = netStarRootPathStr + fieldConfig.suffix;
                    // }
                    var isDict = true;
                    if(typeof(fieldConfig.ajax) == "object"){
                        var datasourceType = fieldConfig.ajax.datasourceType;
                        switch(datasourceType){
                            case 'static':
                                if(typeof(fieldConfig.ajax.staticdata) == "string" && fieldConfig.ajax.staticdata.length > 0){
                                    isDict = false;
                                    fieldConfig.subdata = JSON.parse(fieldConfig.ajax.staticdata);
                                }
                                break;
                            case 'api':
                                isDict = false;
                                var urlStr = netStarRootPathStr + fieldConfig.ajax.url;
                                if(!fieldConfig.ajax.isUseGetRootPath){
                                    urlStr = fieldConfig.ajax.url;
                                }
                                fieldConfig.url = urlStr;
                                fieldConfig.method = typeof(fieldConfig.ajax.type) == 'string'?fieldConfig.ajax.type:'post';
                                fieldConfig.dataSrc = typeof(fieldConfig.ajax.dataSrc) == 'string'?fieldConfig.ajax.dataSrc:'rows';
                                fieldConfig.contentType = typeof(fieldConfig.ajax.contentType) == 'string'?fieldConfig.ajax.contentType:'';
                                if(fieldConfig.ajax.data){
                                    if(typeof(fieldConfig.ajax.data) == "object"){
                                        fieldConfig.data = fieldConfig.ajax.data;
                                    }
                                }
                                break;
                        }
                        delete fieldConfig.ajax;
                    }else{
                        if(fieldConfig.suffix){
                            isDict = false;
                            fieldConfig.url = netStarRootPathStr + fieldConfig.suffix;
                        }
                    }
                    if(isDict){
                        if(typeof(nsVals.dictData[fieldConfig.dictArguments])=='undefined'){
                            console.error('无法找到字典数据:'+fieldConfig.dictArguments)
                        }else{
                            fieldConfig.subdata = nsVals.dictData[fieldConfig.dictArguments].subdata;
                        }
                    }
                    break;
                case 'business':
                case 'businessSelect':
                    if(typeof(fieldConfig.source)=="object"){
                        if(fieldConfig.source.suffix){
                            if(fieldConfig.source.suffix.indexOf(',') > -1 && type == 'business'){
                                var suffixArr = fieldConfig.source.suffix.split(',');
                                var urlStr = '';
                                for(var i=0; i<suffixArr.length; i++){
                                    urlStr += netStarRootPathStr + suffixArr[i] + ',';
                                }
                                urlStr = urlStr.substring(0, urlStr.length-1);
                                fieldConfig.source.url = urlStr;
                            }else{
                                fieldConfig.source.url = netStarRootPathStr + fieldConfig.source.suffix;
                            }
                        }else{
                            // if(fieldConfig.source.url){
                            //     if(fieldConfig.source.url.indexOf(',') > -1 && type == 'business'){
                            //         var suffixArr = fieldConfig.source.url.split(',');
                            //         var urlStr = '';
                            //         for(var i=0; i<suffixArr.length; i++){
                            //             // urlStr += netStarRootPathStr + suffixArr[i] + ',';
                            //             if(fieldConfig.source.isUseGetRootPath){
                            //                 urlStr += netStarRootPathStr + suffixArr[i] + ',';
                            //             }else{
                            //                 urlStr += suffixArr[i] + ',';
                            //             }
                            //         }
                            //         urlStr = urlStr.substring(0, urlStr.length-1);
                            //         fieldConfig.source.url = urlStr;
                            //     }else{
                            //         // fieldConfig.source.url = netStarRootPathStr + fieldConfig.source.url;
                            //         if(fieldConfig.source.isUseGetRootPath){
                            //             fieldConfig.source.url = netStarRootPathStr + fieldConfig.source.url;
                            //         }else{
                            //             fieldConfig.source.url = fieldConfig.source.url;
                            //         }
                            //     }
                            // }
                            var datasourceType = fieldConfig.source.datasourceType;
                            switch(datasourceType){
                                case 'static':
                                    delete fieldConfig.source;
                                    break;
                                case 'api':
                                    if(fieldConfig.source.url.indexOf(',') > -1 && type == 'business'){
                                        var suffixArr = fieldConfig.source.url.split(',');
                                        var urlStr = '';
                                        for(var i=0; i<suffixArr.length; i++){
                                            // urlStr += netStarRootPathStr + suffixArr[i] + ',';
                                            if(fieldConfig.source.isUseGetRootPath){
                                                urlStr += netStarRootPathStr + suffixArr[i] + ',';
                                            }else{
                                                urlStr += suffixArr[i] + ',';
                                            }
                                        }
                                        urlStr = urlStr.substring(0, urlStr.length-1);
                                        fieldConfig.source.url = urlStr;
                                    }else{
                                        // fieldConfig.source.url = netStarRootPathStr + fieldConfig.source.url;
                                        if(fieldConfig.source.isUseGetRootPath){
                                            fieldConfig.source.url = netStarRootPathStr + fieldConfig.source.url;
                                        }else{
                                            fieldConfig.source.url = fieldConfig.source.url;
                                        }
                                    }
                                    break;
                            }
                        }
                    }
                    if(typeof(fieldConfig.search)=="object"){
                        if(fieldConfig.search.suffix){
                            fieldConfig.search.url = netStarRootPathStr + fieldConfig.search.suffix;
                        }else{
                            // if(fieldConfig.search.url){
                            //     // fieldConfig.search.url = netStarRootPathStr + fieldConfig.search.suffix;
                            //     if(fieldConfig.search.isUseGetRootPath){
                            //         fieldConfig.search.url = netStarRootPathStr + fieldConfig.search.url;
                            //     }else{
                            //         fieldConfig.search.url = fieldConfig.search.url;
                            //     }
                            // }
                            var datasourceType = fieldConfig.search.datasourceType;
                            switch(datasourceType){
                                case 'static':
                                    delete fieldConfig.search;
                                    break;
                                case 'api':
                                    if(fieldConfig.search.url){
                                        // fieldConfig.getFormData.url = netStarRootPathStr + fieldConfig.getFormData.suffix;
                                        if(fieldConfig.search.isUseGetRootPath){
                                            fieldConfig.search.url = netStarRootPathStr + fieldConfig.search.url;
                                        }else{
                                            fieldConfig.search.url = fieldConfig.search.url;
                                        }
                                    }else{
                                        delete fieldConfig.search;
                                    }
                                    break;
                            }
                        }
                    }
                    if(typeof(fieldConfig.subdataAjax)=="object"){
                        if(fieldConfig.subdataAjax.suffix){
                            fieldConfig.subdataAjax.url = netStarRootPathStr + fieldConfig.subdataAjax.suffix;
                        }else{
                            if(typeof(fieldConfig.subdataAjax)=="object"){
                                if(fieldConfig.subdataAjax.url){
                                    // fieldConfig.subdataAjax.url = netStarRootPathStr + fieldConfig.subdataAjax.suffix;
                                    if(fieldConfig.subdataAjax.isUseGetRootPath){
                                        fieldConfig.subdataAjax.url = netStarRootPathStr + fieldConfig.subdataAjax.url;
                                    }else{
                                        fieldConfig.subdataAjax.url = fieldConfig.subdataAjax.url;
                                    }
                                }
                            }
                        }
                    }
                    if(typeof(fieldConfig.getRowData)=="object"){
                        if(fieldConfig.getRowData.suffix){
                            fieldConfig.getRowData.url = netStarRootPathStr + fieldConfig.getRowData.suffix;
                        }else{
                            // if(fieldConfig.getRowData.url){
                            //     // fieldConfig.getRowData.url = netStarRootPathStr + fieldConfig.getRowData.suffix;
                            //     if(fieldConfig.getRowData.isUseGetRootPath){
                            //         fieldConfig.getRowData.url = netStarRootPathStr + fieldConfig.getRowData.url;
                            //     }else{
                            //         fieldConfig.getRowData.url = fieldConfig.getRowData.url;
                            //     }
                            // }
                            var datasourceType = fieldConfig.getRowData.datasourceType;
                            switch(datasourceType){
                                case 'static':
                                    delete fieldConfig.getRowData;
                                    break;
                                case 'api':
                                    if(fieldConfig.getRowData.url){
                                        // fieldConfig.getFormData.url = netStarRootPathStr + fieldConfig.getFormData.suffix;
                                        if(fieldConfig.getRowData.isUseGetRootPath){
                                            fieldConfig.getRowData.url = netStarRootPathStr + fieldConfig.getRowData.url;
                                        }else{
                                            fieldConfig.getRowData.url = fieldConfig.getRowData.url;
                                        }
                                    }else{
                                        delete fieldConfig.getRowData;
                                    }
                                    break;
                            }
                        }
                    }
                    if(typeof(fieldConfig.getFormData)=="object"){
                        if(fieldConfig.getFormData.suffix){
                            fieldConfig.getFormData.url = netStarRootPathStr + fieldConfig.getFormData.suffix;
                        }else{
                            // if(fieldConfig.getFormData.url){
                            //     // fieldConfig.getFormData.url = netStarRootPathStr + fieldConfig.getFormData.suffix;
                            //     if(fieldConfig.getFormData.isUseGetRootPath){
                            //         fieldConfig.getFormData.url = netStarRootPathStr + fieldConfig.getFormData.url;
                            //     }else{
                            //         fieldConfig.getFormData.url = fieldConfig.getFormData.url;
                            //     }
                            // }
                            var datasourceType = fieldConfig.getFormData.datasourceType;
                            switch(datasourceType){
                                case 'static':
                                    delete fieldConfig.getFormData;
                                    break;
                                case 'api':
                                    if(fieldConfig.getFormData.url){
                                        // fieldConfig.getFormData.url = netStarRootPathStr + fieldConfig.getFormData.suffix;
                                        if(fieldConfig.getFormData.isUseGetRootPath){
                                            fieldConfig.getFormData.url = netStarRootPathStr + fieldConfig.getFormData.url;
                                        }else{
                                            fieldConfig.getFormData.url = fieldConfig.getFormData.url;
                                        }
                                    }else{
                                        delete fieldConfig.getFormData;
                                    }
                                    break;
                            }
                        }
                    }
                    break;
                case 'photoImage':
                case 'uploadImage':
                // case 'upload':
                    if(fieldConfig.suffix){
                        fieldConfig.url = netStarRootPathStr + fieldConfig.suffix;
                    }else{
                        fieldConfig.url = netStarRootPathStr + '/files/uploadList';
                    }
                    fieldConfig.previewUrl = netStarRootPathStr + '/files/images/';
                    fieldConfig.getFileAjax = {
                        url : netStarRootPathStr + '/files/getListByIds',
                        type : 'GET',
                    }
                    break;
                case 'cubesInput':
                    if(typeof(fieldConfig.getAjax) == "object"){
                        if(fieldConfig.getAjax.suffix){
                            fieldConfig.getAjax.url = netStarRootPathStr + fieldConfig.getAjax.suffix;
                        }
                    }
                    if(typeof(fieldConfig.saveAjax) == "object"){
                        if(fieldConfig.saveAjax.suffix){
                            fieldConfig.saveAjax.url = netStarRootPathStr + fieldConfig.saveAjax.suffix;
                        }
                    }
                    break;
                case 'standardInput':
                    if(typeof(fieldConfig.ajax) == "object"){
                        if(fieldConfig.ajax.suffix){
                            fieldConfig.ajax.url = netStarRootPathStr + fieldConfig.ajax.suffix;
                        }
                    }
                    if(typeof(fieldConfig.subdataAjax) == "object"){
                        if(fieldConfig.subdataAjax.suffix){
                            fieldConfig.subdataAjax.url = netStarRootPathStr + fieldConfig.subdataAjax.suffix;
                        }
                    }
                    break;
                case 'listSelectInput':
                    if(fieldConfig.suffix){
                        fieldConfig.url = netStarRootPathStr + fieldConfig.suffix;
                    }else{
                        fieldConfig.url = projectObj.system.prefix.uploadSrc;
                    }
                    if(typeof(fieldConfig.selectAjax) == "object"){
                        if(fieldConfig.selectAjax.suffix){
                            fieldConfig.selectAjax.url = netStarRootPathStr + fieldConfig.selectAjax.suffix;
                        }
                    }
                    break;
                case 'upload':
                case 'uploadImage':
                    fieldConfig.ajax = {
                        url : netStarRootPathStr + '/files/uploadList',
                    }
                    fieldConfig.editAjax = {
                        url : netStarRootPathStr + '/files/rename',
                    }
                    fieldConfig.downloadAjax = {
                        url : netStarRootPathStr + '/files/download/',
                    }
                    fieldConfig.getFileAjax = {
                        url : netStarRootPathStr + '/files/getListByIds',
                        type : 'GET',
                    }
                    fieldConfig.previewAjax = {
                        url : netStarRootPathStr + '/files/pdf/',
                        type : 'GET',
                    }
                    fieldConfig.previewImagesAjax = {
                        url : netStarRootPathStr + '/files/images/',
                        type : 'GET',
                    }
                    if(typeof(fieldConfig.produceFileAjax) == "object" && typeof(fieldConfig.produceFileAjax.suffix) == "string"){
                        fieldConfig.produceFileAjax.url = netStarRootPathStr + fieldConfig.produceFileAjax.suffix;
                    }
                    break;
                case 'data':
                    fieldConfig.url = projectObj.system.prefix.dict;
                    fieldConfig.method = 'POST';
                    fieldConfig.data = {tableName:fieldConfig.urlDictArguments};
                    break;
                case 'select2':
                case 'select':
                    // if(typeof(fieldConfig.subdata)=='undefined'){
                    //     if(typeof(fieldConfig.suffix) == 'undefined'){
                    //         fieldConfig.subdata = [];
                    //         if(debugerMode){
                    //             console.error(fieldConfig.label+'('+fieldConfig.id+')字段：'+'的subdata和suffix都未定义未定义，默认空数组');
                    //             console.error(fieldConfig);
                    //         }
                    //         break;
                    //     }
                    //     fieldConfig.url = netStarRootPathStr + fieldConfig.suffix;
                    //     fieldConfig.method = typeof(fieldConfig.method) == 'string'?fieldConfig.method:'post';
                    //     fieldConfig.dataSrc = typeof(fieldConfig.dataSrc) == 'string'?fieldConfig.dataSrc:'rows';
                    // }
                    var isDict = true;
                    if(fieldConfig.linkUrlSuffix && fieldConfig.linkUrlSuffix.length > 0){
                        fieldConfig.linkUrl = netStarRootPathStr + fieldConfig.linkUrlSuffix;
                    }
                    if(typeof(fieldConfig.ajax) == "object"){
                        var datasourceType = fieldConfig.ajax.datasourceType;
                        switch(datasourceType){
                            case 'static':
                                if(typeof(fieldConfig.ajax.staticdata) == "string" && fieldConfig.ajax.staticdata.length > 0){
                                    isDict = false;
                                    fieldConfig.subdata = JSON.parse(fieldConfig.ajax.staticdata);
                                }
                                break;
                            case 'api':
                                isDict = false;
                                var urlStr = netStarRootPathStr + fieldConfig.ajax.url;
                                if(!fieldConfig.ajax.isUseGetRootPath){
                                    urlStr = fieldConfig.ajax.url;
                                }
                                fieldConfig.url = urlStr;
                                fieldConfig.method = typeof(fieldConfig.ajax.type) == 'string'?fieldConfig.ajax.type:'post';
                                fieldConfig.dataSrc = typeof(fieldConfig.ajax.dataSrc) == 'string'?fieldConfig.ajax.dataSrc:'rows';
                                fieldConfig.contentType = typeof(fieldConfig.ajax.contentType) == 'string'?fieldConfig.ajax.contentType:'';
                                if(fieldConfig.ajax.data){
                                    if(typeof(fieldConfig.ajax.data) == "object"){
                                        fieldConfig.data = fieldConfig.ajax.data;
                                    }
                                }
                                break;
                        }
                        delete fieldConfig.ajax;
                    }else{
                        if(typeof(fieldConfig.subdata)=='undefined'){
                            if(typeof(fieldConfig.suffix) == 'undefined'){
                                fieldConfig.subdata = [];
                                if(debugerMode){
                                    console.error(fieldConfig.label+'('+fieldConfig.id+')字段：'+'的subdata和suffix都未定义未定义，默认空数组');
                                    console.error(fieldConfig);
                                }
                                break;
                            }
                            isDict = false;
                            fieldConfig.url = netStarRootPathStr + fieldConfig.suffix;
                            fieldConfig.method = typeof(fieldConfig.method) == 'string'?fieldConfig.method:'post';
                            fieldConfig.dataSrc = typeof(fieldConfig.dataSrc) == 'string'?fieldConfig.dataSrc:'rows';
                        }
                    }
                    if(isDict){
                        if(typeof(nsVals.dictData[fieldConfig.dictArguments])=='undefined'){
                            console.error('无法找到字典数据:'+fieldConfig.dictArguments)
                        }else{
                            fieldConfig.subdata = nsVals.dictData[fieldConfig.dictArguments].subdata;
                        }
                    }
                    break;
                case 'uploadSingle':
                    fieldConfig.uploadSrc = projectObj.system.prefix.uploadSrc;
                    fieldConfig.method = 'POST';
                    break;
                case 'expression':
                    var urlType = typeof(fieldConfig.urlType)=='string'?fieldConfig.urlType:'items';
                    fieldConfig.listAjax = {
                        url: getRootPath() + '/items/getItemList',
                        type: 'POST',
                        data: {},
                        dataSrc: 'rows'
                    };
                    switch(urlType){
                        case 'items':
                            fieldConfig.listAjax.url = getRootPath() + '/items/getItemList';
                            fieldConfig.listAjaxFields = [
                                { name: 'itemId', idField: true, search: false },
                                { name: 'itemCode', title: '项目代码', search: true },
                                { name: 'itemName', title: '项目名称', search: true },
                                { name: 'itemPyItem', search: true },
                                { name: 'itemWbItem', search: true }
                            ];
                            break;
                        case 'pfItems':
                            fieldConfig.listAjax.url = getRootPath() + '/pfItems/getPfItemListOfSelect';
                            fieldConfig.listAjaxFields = [
                                { name: 'pfItemId', idField: true, search: false },
                                { name: 'pfItemName', title: '项目名称', search: true },
                                { name: 'pfItemPyItem', search: true },
                                { name: 'pfItemWbItem', search: true }
                            ];
                            break;
                    }
                    fieldConfig.assistBtnWords = ['+', '-', '*', '/', '(', ')', '=', '<>', '>', '<', '>=', '<=', 'and', 'or', '清空'];
                    fieldConfig.dataSource = [];
                    break;
                case 'input-select':
                    if(typeof(fieldConfig.saveAjax)=='object'){
                        if(typeof(fieldConfig.saveAjax.suffix)=='string'){
                            fieldConfig.saveAjax.url = getRootPath() + fieldConfig.saveAjax.suffix;
                        }
                    }
                    if(typeof(fieldConfig.selectConfig)=='object'){
                        if(typeof(fieldConfig.selectConfig.suffix)=='string'){
                            fieldConfig.selectConfig.url = getRootPath() + fieldConfig.selectConfig.suffix;
                        }
                    }
                    break;
            }
        },
        setTableField : function(fieldConfig, type){
            var netStarRootPathStr = getRootPath();
            switch(type){
                case 'upload':
                    fieldConfig.formatHandler.data = typeof(fieldConfig.formatHandler.data) == "object" ? fieldConfig.formatHandler.data : {};
                    fieldConfig.formatHandler.data.uploadSrc = netStarRootPathStr;
                    break;
                case 'href':
                    fieldConfig.formatHandler.data = typeof(fieldConfig.formatHandler.data) == "object" ? fieldConfig.formatHandler.data : {};
                    if(fieldConfig.formatHandler.data.url && fieldConfig.formatHandler.data.url.indexOf('http') == -1){
                        //保存了一个原始配置的url供查看或者使用
                        fieldConfig.formatHandler.data.urlOriginal = fieldConfig.formatHandler.data.url
                        if(fieldConfig.formatHandler.data.isUseStaticPageRootPath){
                            //如果是静态文件地址 则
                            fieldConfig.formatHandler.data.url = NetstarHomePage.config.staticPageRootPath + fieldConfig.formatHandler.data.url;
                        }else{
                            //默认使用系统生成页面，所以前缀是 api
                            fieldConfig.formatHandler.data.url = netStarRootPathStr + fieldConfig.formatHandler.data.url;
                        }
                        
                    }
                    break;
            }
            switch(fieldConfig.mindjetType){
                case 'dict':
                    if(typeof(nsVals.dictData[fieldConfig.dictArguments])=='undefined'){
                        console.error('无法找到字典数据:'+fieldConfig.dictArguments)
                    }else{
                        fieldConfig.formatHandler = {
                            type:'dictionary',
                            data:nsVals.dictData[fieldConfig.dictArguments].jsondata
                        }
                        fieldConfig.columnType = "dictionary";
                    }
                    if(typeof(fieldConfig.editConfig)=="object"){
                        if(typeof(nsVals.dictData[fieldConfig.editConfig.dictArguments])=='undefined'){
                            console.error('无法找到字典数据:'+fieldConfig.editConfig.dictArguments)
                        }else{
                            fieldConfig.editConfig.subdata = nsVals.dictData[fieldConfig.editConfig.dictArguments].subdata;
                        }
                    }
                    break;
            }
            if(typeof(fieldConfig.columnType) == "string" && typeof(fieldConfig.formatHandler) == "object"){
                if(fieldConfig.formatHandler.type === ''){
                    fieldConfig.formatHandler.type = fieldConfig.columnType;
                }
            }
            if(fieldConfig.columnType == "dictionary"){
                if(typeof(fieldConfig.dictArguments) == "string" && fieldConfig.dictArguments.length > 0){
                    if(typeof(nsVals.dictData[fieldConfig.dictArguments])=='undefined'){
                        console.error('无法找到字典数据:'+fieldConfig.dictArguments)
                    }else{
                        fieldConfig.formatHandler = {
                            type:'dictionary',
                            data:nsVals.dictData[fieldConfig.dictArguments].jsondata
                        }
                        fieldConfig.columnType = "dictionary";
                    }
                }else{
                    if(typeof(fieldConfig.formatHandler) == "object"){
                        fieldConfig.formatHandler.type = fieldConfig.columnType;
                    }
                }
            }
            // 判断表格字段知否有editConfig 如果没有设置默认editConfig
            if(typeof(fieldConfig.editConfig) == "undefined"){
                var formType = "text";
                switch(fieldConfig.variableType){
                    case "number":
                        formType = 'number';
                        break;
                    case "date":
                        formType = 'date';
                        break;
                }
                var defaultFieldConfig = { 
                    type:formType, 
                    // formSource:'table', 
                    // templateName:'PC',
                    variableType: fieldConfig.variableType,
                };
                fieldConfig.editConfig = defaultFieldConfig;
            }
            if(typeof(fieldConfig.editConfig)=="object"){
                fieldManager.setFormField(fieldConfig.editConfig, fieldConfig.editConfig.type);
            }
        },
        init : function(fields, type){
            switch(type){
                case 'vo':
                    for(var i=0; i<fields.length; i++){
                        var field = fields[i];
                        var fieldType = field.type;
                        if(typeof(fieldType) != "string"){
                            // 不存在表单配置
                            fieldType = "text";
                            field.type = fieldType;
                            if(typeof(field.nsSource) == "object"){
                                if(typeof(field.label) == "undefined"){
                                    field.label = field.nsSource.chineseName ? field.nsSource.chineseName : '';
                                }
                                if(typeof(field.id) == "undefined"){
                                    field.id = field.nsSource.englishName ? field.nsSource.englishName : '';
                                }
                            }
                        }else{
                            // 存在表单配置 
                        }
                        fieldManager.setFormField(field, fieldType);
                    }
                    break;
                default:
                    // list blockList
                    for(var i=0; i<fields.length; i++){
                        var field = fields[i];
                        var fieldType = field.columnType;
                        fieldManager.setTableField(field, fieldType);
                    }
                    break;
            }
        },
    }
    // 方法管理
    var funcManage = {
        getConfig : function(sourceConfig){
            var netStarRootPathStr = getRootPath();
            var config = $.extend(true, {}, sourceConfig);
            //参数---url
            if(typeof(sourceConfig.suffix)=='string'){
                config.url = netStarRootPathStr + sourceConfig.suffix;
            }
            // 判断是否存在callbackAjax 如果有转化成完整的地址 lyw
            if(typeof(sourceConfig.callbackAjax)=='string'){
                config.callbackAjax = netStarRootPathStr + sourceConfig.callbackAjax;
            }
            if(sourceConfig.getSuffix){
                //弹框之前调用ajax请求链接
                config.getUrl = netStarRootPathStr + sourceConfig.getSuffix;
            }
            if(typeof(sourceConfig.uploadAjax)=="object"){
                config.uploadAjax.url = netStarRootPathStr + sourceConfig.uploadAjax.suffix;
            }
            if(typeof(sourceConfig.importAjax)=="object"){
                config.importAjax.url = netStarRootPathStr + sourceConfig.importAjax.suffix;
            }
            if(typeof(sourceConfig.getPanelDataAjax)=="object"){
                config.getPanelDataAjax.url = netStarRootPathStr + sourceConfig.getPanelDataAjax.suffix;
            }
            if(typeof(sourceConfig.beforeAjax)=="object"){
                config.beforeAjax.url = netStarRootPathStr + sourceConfig.beforeAjax.suffix;
            }
            if(typeof(sourceConfig.getUrl) == "string"){
                if(sourceConfig.getUrl.indexOf('http') == -1){
                    config.getUrl = netStarRootPathStr + sourceConfig.getUrl;
                }
            }
            delete config.suffix;
            // 新编辑器属性转当前
            if(typeof(sourceConfig.ajax) == "object" && sourceConfig.ajax.datasourceType != "static"){
                if(sourceConfig.ajax.isUseGetRootPath){
                    config.url = netStarRootPathStr + sourceConfig.ajax.url;
                }else{
                    config.url = sourceConfig.ajax.url;
                    if(typeof(config.url) == "string" && config.url.indexOf('http') == "-1"){
                        if(typeof(NetstarHomePage) == "object" && typeof(NetstarHomePage.config) == "object" && typeof(NetstarHomePage.config.staticPageRootPath) == "string"){
                            config.url = NetstarHomePage.config.staticPageRootPath + sourceConfig.ajax.url;
                        }
                    }
                }
                config.suffix = sourceConfig.ajax.url;
                config.type = sourceConfig.ajax.type;
                config.contentType = sourceConfig.ajax.contentType;
                config.data = sourceConfig.ajax.data;
                config.ajaxData = sourceConfig.ajax.data;
                config.dataSrc = sourceConfig.ajax.dataSrc;
            }
            
            if(sourceConfig.defaultMode == "editorDialog"){
                var editorType = sourceConfig.editorType ? sourceConfig.editorType : '';
                var editorTypeArr = editorType.split(',');
                var textStr = '';
                for(var t=0; t<editorTypeArr.length; t++){
                    if(editorTypeArr[t] == 'add'){
                        textStr += '新增,';
                    }
                    if(editorTypeArr[t] == 'codyAdd'){
                        textStr += '复制新增,';
                    }
                    if(editorTypeArr[t] == 'edit'){
                        textStr += '编辑,';
                    }
                }
                if(textStr.length > 0){
                    textStr = textStr.substring(0, textStr.length-1);
                }
                config.text = textStr;
            }
            switch(config.defaultMode){
                case 'wxtPrint':
                    config.showBtnType = 'state';
                    break;
                case 'excelImportVer3':
                case 'excelExportVer3':
                    config.showBtnType = 'importAndExport';
                    break;
            }
            return config;
        },
        ajaxCommon : function(ajaxConfig, handlerObj){
            //ajaxConfig 业务里包含的配置对象
            //handlerObj 有两个，{beforeHandler:f(), afterHandler:f(),value:{}}一个是前置，一个是后置
            //判断handlerObj是否合法
            if(debugerMode){
                if(handlerObj){
                    //判断传入参数对象是否合法
                    /*$.each(handlerObj, function(key,value){
                        if(key!='beforeHandler' && key!='afterHandler' && key!='value'&& key!='successFun' && key!='$btnDom'){
                            console.error('回调对象错误:' + key + '，\r\n必须是beforeHandler/afterHandler/value/successFun/$btnDom');
                        }
                    })*/
                    var validArr =
                    [
                        ['beforeHandler', 			'function', 	true], 	//前置回调函数
                        ['afterHandler', 			'function', 	true], 	//成功回调函数
                        ['value', 					'object', 		true], 	//操作值
                        ['successFun', 				'function', 		],	//成功之后的回调函数
                        ['dialogBeforeHandler', 	'object', 			],	//弹框之前的配置参数
                    ]
                    var isValid = nsDebuger.validOptions(validArr, handlerObj);
                    if(isValid === false){return false;}
                    //如果需要入参而没有传入则不合法
                    if(ajaxConfig.data){
                        if(typeof(handlerObj.value)!='object'){
                            console.error('调用ajax:'+ajaxConfig.url+' 时未传入必须的参数');
                        }
                    }
                }
            }
        
            //克隆配置对象
            var runningConfig = $.extend(true,{},ajaxConfig);
        
            if(handlerObj.controllerObj){
                //定义了权限码参数
                if(handlerObj.controllerObj.defaultData){
                    runningConfig.data = $.extend(true,runningConfig.data,handlerObj.controllerObj.defaultData);
                }
                if(handlerObj.controllerObj.isAjaxDialog){
                    runningConfig = handlerObj.controllerObj;
                }
            }
            /*runningConfig.data = handlerObj.value;*/
            runningConfig.successMsg = runningConfig.successMsg ? runningConfig.successMsg : '操作成功';
            //前置回调函数
            if(handlerObj.beforeHandler){
                var innerValue = {};
                if(!$.isEmptyObject(handlerObj.value)){innerValue = handlerObj.value;}
                handlerObj.ajaxConfig = runningConfig;
                handlerObj = handlerObj.beforeHandler(handlerObj);
                if(!$.isEmptyObject(handlerObj.value)){
                    if(!$.isArray(handlerObj.value)){
                        $.each(innerValue,function(key,value){
                            handlerObj.value[key] = value;
                        })
                    }
                }
            }
            var ajaxConfigOptions = handlerObj.ajaxConfigOptions ? handlerObj.ajaxConfigOptions : {};
            ajaxConfigOptions.dialogBeforeConfig = handlerObj.dialogBeforeConfig;
            var listAjax = nsVals.getAjaxConfig(runningConfig,handlerObj.value,ajaxConfigOptions);
            listAjax.plusData = runningConfig;
            //sjj 20190606  是否有矩阵传值参数
            if(runningConfig.matrixVariable){
                //listAjax.url = listAjax.url + runningConfig.matrixVariable;
            }
			// 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 lyw 20190620 end ---
            //处理权限码加到ajaxheader
            if(typeof(listAjax.data)=='object'){
                if(typeof(listAjax.data.data_auth_code) == 'string'){
                    if(typeof(listAjax.header)!='object'){
                        listAjax.header = {};
                    }
                    listAjax.header.data_auth_code = listAjax.data.data_auth_code;
                }
            }
        
            nsVals.ajax(listAjax,function(res,plusData){
                    //dialog成功回调
                    if(handlerObj.$btnDom){
                        //handlerObj.$btnDom.removeAttr('disabled');
                        var $btns = handlerObj.$btnDom.parent().children('button[ajax-disabled="true"]');
                        $btns.removeAttr('ajax-disabled');
                        $btns.removeAttr('disabled');
                    }
                    if(typeof(handlerObj.successFun) == 'function'){
                        var enterHandler = typeof(handlerObj.successFun) == 'function'?handlerObj.successFun:{};
                        //res.success:ajax成功状态
                        //handlerObj.$btnDom:按钮节点
                        handlerObj.successFun(res.success,handlerObj.$btnDom);
                    }
                    if(res.success == false){
                        //这里添加错误信息处理
                        return false;
                    }
                    //弹出服务器端返回的msg提示 cy 20180712
                    if(res.msg){
                        nsalert(res.msg,'success');
                    }else{
                        //sjj 20190521 如果自定义配置中定义了successMsg返回值，则读取定义的返回值提示语
                        if(plusData.plusData.successMsg){
                            nsalert(plusData.plusData.successMsg,'success');
                        }
                    }
                    //sjj 20190521判断是否自定义了操作标识
                    var returnObjectState;
                    switch(plusData.plusData.successOperate){
                        case 'refresh':
                            returnObjectState = NSSAVEDATAFLAG.VIEW;
                            break;
                        case 'delete':
                            returnObjectState = NSSAVEDATAFLAG.DELETE;
                            break;
                        case 'edit':
                            returnObjectState = NSSAVEDATAFLAG.EDIT;
                            break;
                        case 'add':
                            returnObjectState = NSSAVEDATAFLAG.ADD;
                            break;
                    }
                    //sjj 20190524 如果
                    if(typeof(plusData.plusData.objectState)=='number'){
                        returnObjectState = plusData.plusData.objectState;
                    }
                    //后置回调函数 后置回调函数的返回值暂无处理，但是必须回传 以后补充方法
                    if(handlerObj.afterHandler){
                        if(runningConfig.dataSrc){
                            /**lxh 添加plusData */
                            if(typeof(returnObjectState)!='undefined'){
                                data = res[runningConfig.dataSrc] ? res[runningConfig.dataSrc] : {};
                                data.objectState = returnObjectState;
                            }else{
                                data = res[runningConfig.dataSrc] ? res[runningConfig.dataSrc] : {};
                            }
                            handlerObj.afterHandler(data,plusData.plusData);
                        }else{
                            if(typeof(returnObjectState)!='undefined'){
                                res.objectState = returnObjectState;
                            }
                            handlerObj.afterHandler(res);
                        }
                        if(plusData.plusData.isCloseWindow){
                            // lyw 20190910 如果需要在模板里边加关闭方法
                            // nsFrame.popPageClose(); 
                            // NetstarUI.labelpageVm.closeByIndex(NetstarUI.labelpageVm.labelPageLength-1);
                        }
                    }
                },true
            )
        },
        // 获取通用方法
        getCommonFunc : function(ajaxConfig){
            var ajaxFunc = function(handlerObj){
                if(typeof(handlerObj)=='undefined'){
                    handlerObj = {};
                }
                //ajaxCommon(this.config, handlerObj);
                /********sjj20180601 前置处理值*******************/
                /********sjj20180601 前置处理值********************/
                var ajaxHandler = {
                    beforeHandler:			typeof(handlerObj.beforeHandler)=='function' ? handlerObj.beforeHandler : handlerObj.ajaxBeforeHandler,
                    afterHandler:			typeof(handlerObj.afterHandler)=='function' ? handlerObj.afterHandler : handlerObj.ajaxAfterHandler,
                    value:					handlerObj.value ? handlerObj.value : {},
                    successFun:				handlerObj.successFun,
                    dialogBeforeConfig:		typeof(handlerObj.dialogBeforeHandler)=='object' ? handlerObj.dialogBeforeHandler : {},
                    controllerObj:			handlerObj.controllerObj,
                    $btnDom:						handlerObj.$btnDom,
                    ajaxConfigOptions:	typeof(handlerObj.ajaxConfigOptions)=='object' ? handlerObj.ajaxConfigOptions : {}
                }
        
            /***************sjj 20190410 针对按钮文本的转换根据数据值调用对应的ajax start************************************************* */
                function setAjaxConfig(valueData){
                    if(typeof(ajaxConfig.text) == "string"){
                        if(ajaxConfig.text.indexOf('{')>-1){
                            var formatConfig = JSON.parse(ajaxConfig.text);
                            switch(formatConfig.formatHandler.type){
                                    case 'changeBtn':
                                        $.each(formatConfig.formatHandler.data,function(value,keyConfig){
                                            if (value == valueData[formatConfig.field]){
                                                    if(keyConfig.ajax){
                                                        nsVals.extendJSON(ajaxConfig,keyConfig.ajax);
                                                    }
                                            }
                                    });
                                        break;
                            }
                        }
                    }else{
                        console.error('没有配置text');
                        console.error(ajaxConfig);
                    }
                }
                if(!$.isEmptyObject(ajaxHandler.value)){
                    setAjaxConfig(ajaxHandler.value);
                }else{
                    if(ajaxHandler.dialogBeforeConfig.selectData){
                        setAjaxConfig(ajaxHandler.dialogBeforeConfig.selectData);
                    }
                }
                /***************sjj 20190410 针对按钮文本的转换根据数据值调用对应的ajax start************************************************* */
        
                funcManage.ajaxCommon(ajaxConfig,ajaxHandler);
            };
            return ajaxFunc;
        },
        // 通过defaultMode获取方法
        setFuncByDefaultMode : function(controllerObj){
            if(typeof(controllerObj.defaultMode)=='string'){
                var defaultModeName = controllerObj.defaultMode;
                //显示字段
                var functionField = controllerObj.functionField;
                //rowData取值方式
                controllerObj.sourceMode = 'selectedRow';
                if(defaultModeName.indexOf('tablebtn')>-1){
                    controllerObj.sourceMode = 'tablebtn';
                }
                //defaultMode类型
                var dataUserModeKey = [
                    'dialog','valueDialog','confirm','toPage','loadPage','changePage','ajaxDialog','component','print','custom','templatePrint','workflowViewer','workflowViewerById','workflowSubmit','newtab','viewerDialog','successMessage','dataImport','excelImportVer2','multiDialog','ajaxAndSend','business','previewFile','ajaxNewtab','download','addInfoDialog','ajaxAndPdf','excelExport','wxtPrint','downloadByFile','excelImportVer3','excelExportVer3'
                ];
                var defaultModeArray=defaultModeName.split(',');
                for(var mi = 0;mi<defaultModeArray.length;mi++){
                    if(dataUserModeKey.indexOf(defaultModeArray[mi]) >-1){
                        //defaultMode指定类型
                        controllerObj.userMode = defaultModeArray[mi];
                    }
                }
                switch(controllerObj.userMode){
                    case 'dialog':
                        controllerObj.func.dialog = function(callBack,Obj){
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
                            }
                            var configJson = $.extend(true,{},Obj);
                            //configJson.dialogForm = getDialogForm(businessObj.fields,functionField);
                            configJson.controllerObj = functionConfigObj;
                            configJson.event = callBack.event;
                            dialogCommon(callBack,configJson);
                        }
                        break;
                    //修改弹窗
                    case 'valueDialog':
                        controllerObj.func.valueDialog = function(callBack,Obj){	
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
                            }							//id:?
                            var configJson = $.extend(true,{},Obj);
                            //获取表格行数据
                            //configJson.rowObj = controllerObj.getFunctionData(controllerObj,configJson);
                            configJson.controllerObj = functionConfigObj;
                            configJson.event = callBack.event;
                            dialogCommon(callBack,configJson);
                            /*if(configJson.rowData){
                                dialogCommon(callBack,configJson);
                            }*/
                        }
                        break;
                    //ajax弹框
                    case 'ajaxDialog':
                        controllerObj.func.ajaxDialog = function(callBack,Obj){	
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
                            }						
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            ajaxDialogCommon(callBack,configJson);
                        }
                        break;
                    //确认弹窗
                    case 'confirm':
                        controllerObj.func.confirm = function(callBack,Obj){
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
                            }	
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            confirmCommon(callBack,configJson);
                        }
                        break;
                    case 'custom':
                        //sjj20181030 自定义按钮
                        controllerObj.func.custom = function(callBack,Obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(Obj);
                            }	
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            configJson.event = callBack.event;
                            callBack.controllerObj = functionConfigObj;
                            customCommon(callBack,configJson);
                        }
                        break;
                    case 'toPage':
                        //跳转界面sjj20180517 btn tablerowbtn
                        controllerObj.func.toPage = function(callback,Obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            if(typeof(callback.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
                            }
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            toPageCommon(callback,configJson);
                        }
                        break;
                    case 'newtab':
                        //sjj 20190227 添加支持打开新标签页方法
                        controllerObj.func.newtab = function(callback,Obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            if(typeof(callback.getFuncConfigHandler)=='function'){
                                    functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
                                }
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            newTabCommon(callback,configJson);
                        }
                            break;
                    case 'ajaxNewtab':
                        //sjj 20191108 添加支持ajax执行完成之后的跳转界面并进行赋值操作 
                        controllerObj.func.ajaxNewtab = function(callback,Obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = controllerObj;
                            callback.controllerObj = controllerObj;
                            ajaxNewtabCommon(callback,configJson);
                        }
                        break;
                        case 'multiDialog':
                            //sjj 20190815 多url链接拼接成的tab弹出界面
                            controllerObj.func.multiDialog = function(callback,obj){
                                $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                                var functionConfigObj = controllerObj;
                                var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            multiDialogCommon(callback,configJson);
                            }
                            break;
                        case 'viewerDialog':
                            //sjj 20190403 添加仅支持查看页弹框
                            controllerObj.func.viewerDialog = function(callBack,obj){
                                $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                                var functionConfigObj = controllerObj;
                                var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            viewerDialogCommon(callBack,configJson);
                            }
                            break;
                    case 'loadPage':
                        //在当前窗口打开新界面
                        controllerObj.func.loadPage = function(callback,Obj){
                            $('[type="button"]').blur();
                            var functionConfigObj = controllerObj;
                            if(typeof(callback.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callback.getFuncConfigHandler(Obj);
                            }
                            var configJson = $.extend(true,{},Obj);
                            configJson.controllerObj = functionConfigObj;
                            loadPageCommon(callback,configJson);
                        }
                        break;
                    case 'changePage':
                        //跳转界面sjj20180606 btn tablerowbtn
                        controllerObj.func.changePage = function(callback,obj){
                            var functionConfigObj = controllerObj;
                            if(typeof(callback.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callback.getFuncConfigHandler(obj);
                            }
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            changePageCommon(callback,configJson);
                        }
                        break;
                    case 'component':
                        //自定义组件sjj20180802 
                        controllerObj.func.component = function(callBack,obj){
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
                            }
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            changeComponentCommon(callBack,configJson);
                        }
                        break;
                    case 'print':
                        //自定义组件sjj 20180928
                        controllerObj.func.print = function(callBack,obj){
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
                            }
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            printCommon(callBack,configJson);
                        }
                         break;	
                    case 'templatePrint':
                         //模板打印 lxh 20181116
                        controllerObj.func.templatePrint = function(callBack,obj){
                            // 添加打印中loading
                            NetStarUtils.loading('正在处理中');
                            var functionConfigObj = controllerObj;
                            if(typeof(callBack.getFuncConfigHandler)=='function'){
                                functionConfigObj.func.config = callBack.getFuncConfigHandler(obj);
                            }
                            var configJson = $.extend(true,{},obj);
                             configJson.controllerObj = functionConfigObj;
                             callBack.controllerObj = functionConfigObj;
                            templatePrint(callBack,configJson);
                        }
                        break;
                    case 'workflowViewer':
                         //工作流 流程监控
                        controllerObj.func.workflowViewer = function(callBack,obj){
                            var configJson = $.extend(true,{},obj);
                            workflowViewer(callBack,configJson);
                        }
                        break;
                    case 'workflowSubmit':
                         //工作流
                        controllerObj.func.workflowSubmit = function(callBack,obj){
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                             configJson.controllerObj = functionConfigObj;
                            workflowSubmit(callBack,configJson);
                        }
                            break;
                                break;
                    case 'successMessage':
                            //sjj 20190524 按钮类型为successMessage
                            controllerObj.func.successMessage = function(callBack,obj){
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                             configJson.controllerObj = functionConfigObj;
                             successMessage(callBack,configJson);
                        }
                            break;
                    case 'excelImportVer2':
                            // lyw 表格数据导入
                            controllerObj.func.excelImportVer2 = function(callBack,obj){
                                var functionConfigObj = controllerObj;
                                var configJson = $.extend(true,{},obj);
                                configJson.controllerObj = functionConfigObj;
                                excelImportVer2(callBack,configJson);
                            }
                            break;
                    case 'ajaxAndSend':
                            //sjj 20190929生成报告控件可以设置模板名称可以设置业务id，调用两个方法1、根据模板名称获取模板2、根据模板id和业务id打印templateName，deptId，bllCateCode，languageName	  
                            controllerObj.func.ajaxAndSend = function(callBack,obj){
                                $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            ajaxAndSendCommon(callBack,configJson);
                            }
                            break;
                    case 'business':
                        //sjj 20190929生成报告控件可以设置模板名称可以设置业务id，调用两个方法1、根据模板名称获取模板2、根据模板id和业务id打印templateName，deptId，bllCateCode，languageName	  
                        controllerObj.func.business = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            businessInit(callBack, configJson);
                        }
                        break;
                    case 'previewFile':
                        //sjj 20190929生成报告控件可以设置模板名称可以设置业务id，调用两个方法1、根据模板名称获取模板2、根据模板id和业务id打印templateName，deptId，bllCateCode，languageName	  
                        controllerObj.func.previewFile = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            previewFileInit(callBack, configJson);
                        }
                        break;
                    case 'download':
                        //sjj 20191126 文件下载
                        controllerObj.func.download = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            callBack.controllerObj = functionConfigObj;
                            downloadFileInit(callBack, configJson);
                        }
                        break;
                    case 'addInfoDialog':
                        //sjj 20191203 在当前模板弹出添加页面 
                        controllerObj.func.addInfoDialog = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            callBack.controllerObj = functionConfigObj;
                            addInfoDialogInit(callBack, configJson);
                        }
                        break;
                    case 'ajaxAndPdf':
                        //sjj  20191216  发送ajax成功之后执行调用pdf
                        controllerObj.func.ajaxAndPdf = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            callBack.controllerObj = functionConfigObj;
                            ajaxAndPdfInit(callBack, configJson);
                        }
                        break;
                    case 'excelExport':
                        //sjj  20191216  列表数据导出excel
                        controllerObj.func.excelExport = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            callBack.controllerObj = functionConfigObj;
                            excelExportInit(callBack, configJson);
                        }
                        break;
                    case 'wxtPrint':
                        //sjj 20200205网星通打印
                        controllerObj.func.wxtPrint = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            callBack.controllerObj = functionConfigObj;
                            wxtPrintInit(callBack, configJson);
                        }
                        break;
                    case 'excelImportVer3':
                        // excel导入
                        controllerObj.func.excelImportVer3 = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            callBack.controllerObj = functionConfigObj;
                            excelImportVer3(callBack, configJson);
                        }
                        break;
                    case 'excelExportVer3':
                        // excel导出
                        controllerObj.func.excelExportVer3 = function(callBack,obj){
                            $('[type="button"]').blur();//因为按钮自带焦点，所以需要设置取消
                            var functionConfigObj = controllerObj;
                            var configJson = $.extend(true,{},obj);
                            configJson.controllerObj = functionConfigObj;
                            callBack.controllerObj = functionConfigObj;
                            excelExportVer3(callBack, configJson);
                        }
                        break;
                }
             }
            //发送websocket
            function wsConnect(callBack,configJson,dataType){
                //dataType array 或者 object
                //var $btn = $(configJson[0]);
                //$btn.controllerObj = {};
                //var handlerObj = {};
                var handlerObj = callBack.ajaxBeforeHandler(callBack);
                var funcConfig = configJson.controllerObj;
                var fullFormId = handlerObj.config.fullFormId;
                var fullTableId = handlerObj.config.fullTableId;
                var webSocketUrl = funcConfig.webSocketUrl || "";
                //如果没有链接
                if(typeof funcConfig.ws == 'undefined' || funcConfig.ws.readyState !== 1){
                    funcConfig.ws = nschat.websocket.wsConnect(function name() {  },function (res) {
                        //这里接收返回数据
                        /**
                         * res = [{ business:[{},{}],msg:"",..... }]
                         */
                        res = res[0];
                        if(res.excute){
                            NetStarUtils.removeLoading();
                      }
                        if(res.success == 'true'){
                            var callbackAjax = res.callbackAjax;
                            if(typeof callbackAjax != 'undefined' && $.trim(callbackAjax).length > 0){
                                var ajaxConfig = {
                                    url:callbackAjax,
                                    type:funcConfig.type,
                                    data:res,
                                    dataSrc:'data'
                                };
                                var ajax = nsVals.getAjaxConfig(ajaxConfig);
                                nsVals.ajax(ajax,function(res){
                                    if(res.success){
                                        switch(dataType){
                                            case 'array':
                                                //修改table
                                                var dataSource = baseDataTable.originalConfig[fullTableId].dataConfig.dataSource;
                                                var $dataTable = $('#' + fullTableId);
                                                $.each(res[ajaxConfig.dataSrc].business,function(index,item){
                                                    $.each(dataSource,function(idx,itm){
                                                        if(itm.regReportId == item.regReportId){
                                                            dataSource[idx] = item;
                                                            /* var $tr = $dataTable.find('tr').eq(idx);
                                                            $dataTable.row($tr).data(item).draw(false); */
                                                        }
                                                    });
                                                });
                                                baseDataTable.refreshByID(fullTableId);
                                                break;
                                            case 'object':
                                                nsForm.fillValues(res[ajaxConfig.dataSrc],fullFormId);
                                                console.log('修改form');
                                                break;
                                        }
        
                                    }
                                });
                            }
                        }else{
                            return nsalert(res.msg,'error');
                        }
                    },webSocketUrl,function(event){
                        nsalert("连接出错", 'error');
                        NetStarUtils.removeLoading();
                        // NetstarUI.confirm.show({
                        // 	title:'打印出错',
                        // 	content:'<div class="print-alert"><h4><i class=""></i><span>设备连接错误，不能打印</span></h4><p>请点击确认下载安装最新版网星通</p></div>',
                        // 	width:500,
                        // 	state:'error',
                        // 	handler:function (state) {
                        // 		if(state){
                        // 			var a = document.createElement('a');
                        // 			a.href = getRootPath() + '/files/download/10010';
                        // 			a.download = '网星通';
                        // 			a.click();
                        // 		}else{
                        // 			console.log('点击取消');
                        // 		}
                        // 	}
                        // });
                        NetstarHomePage.systemInfo.netstarDownload({
                            text : '“网星通”是物联网终端程序，负责和各种硬件设备互联互通。如使用打印、扫描枪、身份证阅读器、仪器接口、仪器数据采集等功能需要安装托盘程序“网星通”，请点击下载',
                            netstarWidth : 600,
                            netstarHeight : 450,
                        })
                    });
                }
            }
            //模板打印
            function templatePrint(callBack,configJson){
                /**
                 * type 
                 * print  	打印
                 * preview 	预览
                 * printAjax 	打印有回调
                 * previewAjax	打印预览有回调
                 */
            //	var $btn = $(configJson[0]);
                //$btn.controllerObj = {};
                //拿到当前模板的配置
                //var handlerObj = {};
                //handlerObj = callBack.ajaxBeforeHandler(handlerObj);
                var pageConfig = callBack.dialogBeforeHandler(callBack);//拿到当前模板选择的数据
                //var funcConfig = callBack.getFuncConfigHandler(configJson);//拿到当前按钮的配置
                var funcConfig = configJson.controllerObj;
                //var templateId = $btn.attr('templateId');//拿到要打印的模板的id
                var templateId = '';
                if(configJson.controllerObj.ajaxData){
                    templateId = configJson.controllerObj.ajaxData.templateId;
                }
                //如果按钮上有templateId的话往下执行
                if(!pageConfig.value){return nsalert('请选择一行','error');}
                if(typeof templateId != 'undefined'){
                    //公共数据
                    var callbackAjax = funcConfig.callbackAjax ? getRootPath() + funcConfig.callbackAjax : "";
                    var listName = funcConfig.listName || "";
                    //判断打印表格还是表单，表格是数组，表单是对象
                    switch($.type(pageConfig.value)){
                        case 'array':
                                wsConnect(callBack,configJson,'array');
                                //如果有规定需要传的字段字段
                                var sendMsg = [];
                                if(typeof funcConfig.requiredFields != 'undefined'){
                                    var requiredFields = funcConfig.requiredFields.split(',');
                                    $.each(pageConfig.value,function(index,item){
                                        var requiredObj = {};
                                        $.each(requiredFields,function(idx,itm){
                                            requiredObj[itm] = item[itm];
                                            requiredObj.templateId = templateId;
                                        });
                                        sendMsg.push(requiredObj);
                                    });
                                }else{
                                    //没有规定要传的特定字段则发送选中的全部数据
                                    sendMsg = pageConfig.value;
                                }
                                //发送数据
                                if(NetStarRabbitMQ.linkSuccess){
                                    //NetStarUtils.loading('正在打印，请稍候...');
                                }
                                switch (funcConfig.btnType) {
                                    case 'print':
                                    nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
                                        break;
                                    case 'preview':
                                    nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
                                        break;
                                    case 'printAjax':
                                    nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
                                        break;
                                    case 'previewAjax':
                                    nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify(sendMsg) +'}');
                                        break;
                                    default:
                                        break;
                                }
                            break;
                        case 'object':
                                wsConnect(callBack,configJson,'object');
                                //如果有规定需要传的字段字段
                                var sendMsg = {};
                                if(typeof funcConfig.requiredFields != 'undefined'){
                                    var requiredFields = funcConfig.requiredFields.split(',');
                                    for (var key in requiredFields) {
                                        if (requiredFields.hasOwnProperty(key)) {
                                            var element = requiredFields[key];
                                            if($.inArray(key,requiredFields)){
                                                sendMsg[key] = element;
                                            }
                                        }
                                    }
                                }else{
                                    //没有规定要传的特定字段则发送选中的全部数据
                                    sendMsg = pageConfig.value;
                                }
                                //发送数据
                                if(NetStarRabbitMQ.linkSuccess){
                                    //NetStarUtils.loading('正在打印，请稍候...');
                                }
                                switch (funcConfig.btnType) {
                                    case 'print':
                                    nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
                                        break;
                                    case 'preview':
                                    nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
                                        break;
                                    case 'printAjax':
                                    nschat.websocket.send('{"command":"报表打印","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
                                        break;
                                    case 'previewAjax':
                                    nschat.websocket.send('{"command":"报表预览","templateId":"'+ templateId +'","callbackAjax":"'+ callbackAjax +'","listName":"'+ listName +'","business":'+ JSON.stringify([sendMsg]) +'}');
                                        break;
                                    default:
                                        break;
                                }
                            break;
                    }
                }else{
                    return nsalert('该模板没有id，请检查配置','error');
                }
             }
            //获取弹窗显示字段
            function getDialogForm(businessObj,functionField){
                if(debugerMode){
                    var parametersArr = [
                    [businessObj,'object',true],
                    [functionField,'object',true],
                    ]
                    var isVaild = nsDebuger.validParameter(parametersArr);
                    if(isVaild == false){
                        return;
                    }
                    if(typeof(businessObj.fields)!='object'){
                        console.error('无法在指定业务对象中找到字段属性');
                        console.error(businessObj)
                        return;
                    }
                }
                var dialogForm = [];
                for(ffi in functionField){
                    if(typeof(businessObj.fields[ffi]) == 'object'){
                        // lyw 读取字典
                        switch(businessObj.fields[ffi].mindjetType){
                            case 'dict':
                                if(typeof(nsVals.dictData[businessObj.fields[ffi].dictArguments])=='undefined'){
                                    console.error('无法找到字典数据:'+businessObj.fields[ffi].dictArguments)
                                }else{
                                    businessObj.fields[ffi].subdata = nsVals.dictData[businessObj.fields[ffi].dictArguments].subdata;
                                }
                                break;
                        }
                        var dialogFormField = $.extend(true,{},businessObj.fields[ffi]);
                        dialogFormField.mindjetIndex = functionField[ffi].mindjetIndex;
                        dialogForm.push(dialogFormField);
                    }
                }
                dialogForm.sort(function(a,b){
                    return a.mindjetIndex - b.mindjetIndex;
                })
                return dialogForm;
            }
            //确认弹窗
            function confirmCommon(callback,configJson){
                /*
                 * normal  	则只附加参数
                 * object 	则用对象名称包裹，返回标准对象格式
                 * id 		只使用id作为参数
                 * ids 		返回ids格式，用于批量操作
                 */
                var confirmdata;
                var controllerObj = configJson.controllerObj;
                callback.controllerObj = controllerObj;
                //dialog的前置回调
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    //加验证
                    confirmdata = callback.dialogBeforeHandler(callback);
                }
                if(confirmdata.value === false){
                    var infoMsgStr = controllerObj.noSelectInfoMsg ? controllerObj.noSelectInfoMsg:'请选择要处理的数据';
                    nsalert(infoMsgStr,'error');
                    console.error(infoMsgStr);
                    return false;
                }
                //确认弹窗提示信息
                var ajaxObj = {
                    //value:confirmdata.value,
                    dialogBeforeHandler:{
                        btnOptionsConfig:confirmdata.btnOptionsConfig,
                        //selectData:confirmdata.value,
                        containerFormJson:confirmdata.containerFormJson
                    },
                    controllerObj:controllerObj.func.config,
                    value:confirmdata.value,
                }
                if(callback.event){
                    if(callback.event.target.nodeName == 'BODY'){
                        if(callback.data.id){
                            ajaxObj.$btnDom = $('#'+callback.data.id);
                            ajaxObj.$btnDom.attr('disabled',true);
                        }
                    }else{
                        ajaxObj.$btnDom = $(callback.event.currentTarget);
                        ajaxObj.$btnDom.attr('disabled',true);
                    }
                }
                /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                if(typeof(callback.ajaxBeforeHandler)=='function'){
                    ajaxObj.beforeHandler = function(data){
                        return callback.ajaxBeforeHandler(data);
                    };
                }
                if(typeof(callback.ajaxAfterHandler)=='function'){
                    /**lxh 添加plusData */
                    ajaxObj.afterHandler = function(data,plusData){
                        return callback.ajaxAfterHandler(data,plusData);
                    };
                }
                nsconfirm(controllerObj.title,function(isDelete){
                    if(isDelete){
                        controllerObj.func.function(ajaxObj);
                    }else{
                        if(ajaxObj.$btnDom){
                            ajaxObj.$btnDom.removeAttr('disabled');
                        }
                    }
                },'warning')
            }
        
            //sjj20181030 自定义按钮
            function customCommon(callback,configJson){
                /*
                * normal  	则只附加参数
                * object 	则用对象名称包裹，返回标准对象格式
                * id 		只使用id作为参数
                * ids 		返回ids格式，用于批量操作
                */
                var $btnDom;
                if(callback.event){
                    if(callback.event){
                        if(callback.event.target.nodeName == 'BODY'){
                            if(callback.data.id){
                                $btnDom = $('#'+callback.data.id);
                                var $btns = $btnDom.parent().children('button:not([disabled="disabled"])');
                                $btns.attr('ajax-disabled',true);
                                $btns.attr('disabled',true);
                                //$btnDom.attr('disabled',true);
                            }
                        }else{
                            $btnDom = $(callback.event.currentTarget);
                            var $btns = $btnDom.parent().children('button:not([disabled="disabled"])');
                            $btns.attr('ajax-disabled',true);
                            $btns.attr('disabled',true);
                            //$btnDom.attr('disabled',true);
                        }
                    }
                }
                var confirmdata;
                var controllerObj = configJson.controllerObj;
                //dialog的前置回调
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    //加验证
                    confirmdata = callback.dialogBeforeHandler(configJson);
                }
                if(confirmdata){
                    if($.isEmptyObject(confirmdata.value)){
                        if($btnDom){
                            var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
                            $btns.removeAttr('ajax-disabled');
                            $btns.removeAttr('disabled');
                            //$btnDom.removeAttr('disabled');
                        }
                        return;
                    }
                }
                //确认弹窗提示信息
                var ajaxObj = {
                    //value:confirmdata.value,
                    dialogBeforeHandler:{
                        btnOptionsConfig:confirmdata.btnOptionsConfig,
                        //selectData:confirmdata.value,
                        containerFormJson:confirmdata.containerFormJson,
                    },
                    controllerObj:controllerObj.func.config,
                    value:confirmdata.value,
                };
                if($btnDom){
                    ajaxObj.$btnDom = $btnDom;
                }
                // 处理{id:"{id}"} 191020 cy
                var _controllerObj = ajaxObj.controllerObj;
                if(!$.isEmptyObject(_controllerObj.ajaxData)){
                    _controllerObj.data = NetStarUtils.getFormatParameterJSON(_controllerObj.ajaxData, ajaxObj.value);
                }
                if(confirmdata.optionsConfig){
                    ajaxObj.ajaxConfigOptions = {idField:confirmdata.optionsConfig.idField};
                }
                /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                if(typeof(callback.ajaxBeforeHandler)=='function'){
                    ajaxObj.beforeHandler = function(data){
                        return callback.ajaxBeforeHandler(data);
                    };
                }
                if(typeof(callback.ajaxAfterHandler)=='function'){
                    ajaxObj.afterHandler = function(data,plusData){
                        return callback.ajaxAfterHandler(data,plusData);
                    };
                }
                controllerObj.func.function(ajaxObj);
            }
        
            //公用弹框内容调用 旧弹框
            function dialogContentOld(callback,obj){
                // var fieldValue = typeof(obj.value)=='object' ? obj.value : {};
                // var controllerObj = obj.controllerObj;
                var functionField = obj.controllerObj.functionField;
                // var dialogField = [];
                if(typeof(functionField) == "string" && functionField.length > 0){
                    var ajaxConfig = {
                        data : {
                            id : functionField,
                        },
                        plusData : {
                        },
                        callBackFunc : (function(callback, obj){
                            return function(resData, plusData){
                                var comConfig = {
                                    type : 'vo',
                                }
                                var fieldValue = typeof(obj.value)=='object' ? obj.value : {};
                                var controllerObj = obj.controllerObj;
                                var dialogField = [];
                                if($.isArray(resData) && resData.length == 1){
                                    NetstarEditorServer.setComponentPanelConfig(resData, comConfig);
                                }else{
                                    console.error('获取状态错误');
                                    console.error(resData);
                                }
                                var dialogField = comConfig.field;
                                //调整表单form中的下拉框data参数 
                                function getSelectData(fieldArr,fieldValue){
                                    var newFieldArr = fieldArr;
                                    if($.isEmptyObject(fieldValue)){
                                        if(!$.isEmptyObject(obj.currentData)){
                                            fieldValue = obj.currentData;
                                        }
                                    }
                                    for(var fieldI = 0; fieldI<fieldArr.length; fieldI++){
                                        //是否是ajax请求 需要转data参数
                                        if(fieldArr[fieldI].url){
                                            //存在url链接
                                            function getSelectAjaxData(_params){
                                                var data = $.extend(true,{},_params);
                                                if(fieldArr[fieldI].dataFormat == 'ids'){
                                                    if($.isArray(fieldValue)){
                                                        var ids = [];
                                                        for(var dataI=0; dataI<fieldValue.length; dataI++){
                                                            ids.push(fieldValue[dataI][obj.options.idField]);
                                                        }
                                                        ids = ids.join(',');
                                                        data.ids = ids;
                                                    }else{
                                                        data.ids = fieldValue[obj.options.idField];
                                                    }
                                                }else{
                                                    for(var param in data){
                                                        if(typeof(data[param])=='string'&&
                                                            (data[param].indexOf('this.')>-1||data[param].indexOf('page.')>-1||data[param].indexOf('search')>-1)
                                                        ){
                        
                                                        }else{
                                                            data[param] = nsVals.getTextByFieldFlag(data[param],fieldValue);
                                                        }
                                                        if(data[param] === 'undefined'){data[param] = '';}
                                                    }
                                                }
                                                return data;
                                            }
                                            fieldArr[fieldI].data = typeof(fieldArr[fieldI].data)=='object' ? fieldArr[fieldI].data : {};
                                            fieldArr[fieldI].data = getSelectAjaxData(fieldArr[fieldI].data);
                                        }
                                    }
                                    return newFieldArr;
                                }
                                dialogField = getSelectData(dialogField,fieldValue);
                                if(fieldValue && dialogField){
                                    //如果存在form并且存在默认值的情况
                                    for(var formI = 0; formI<dialogField.length;formI++){
                                        if(dialogField[formI].voField){
                                            dialogField[formI].id = dialogField[formI].voField;
                                        }
                                        dialogField[formI].value = fieldValue[dialogField[formI].id];
                                    }
                                }
                                /****sjj 20180531 添加支持事件回调 start***/
                                /*changeHandlerData
                                    *readonly:{id:false,name:false}
                                    *disabled:{id:false,name:true}
                                    *value:{id:'3333',name:"ddd"}
                                    *hidden:{id:true,name:true}
                                */
                        
                                var dialogJson = {
                                    id:'dialogCommon',//typeof(obj.config.dialogId) == 'undefined'?'dialogCommon':obj.config.dialogId,
                                    title: typeof(controllerObj.title) =='string'?controllerObj.title:'表单维护',
                                    size:'m',
                                    form:dialogField,
                                    isEnterHandler:true,//控制是否绑定回车事件
                                    btns:[{
                                        text:typeof(controllerObj.btnText) =='string'?controllerObj.btnText:'确认',
                                        isReturn:true,
                                        handler:function($btnDom,callbackFun){
                                            //$btnDom:按钮节点
                                            //callbackFun:ajax方法回调
                                            var jsonData = nsTemplate.getChargeDataByForm('dialogCommon');
                                            if(jsonData){
                                                var handlerJson = {};
                        
                                                handlerJson.value = jsonData;//formJsonFormat(jsonData,dialogForm);
                                                handlerJson.controllerObj = controllerObj.func.config;
                                                //by cy 20180508
                                                //function和ajax的前后置回调
                                                if(typeof(callback.ajaxBeforeHandler)=='function'){
                                                    handlerJson.beforeHandler = function(data){
                                                        return callback.ajaxBeforeHandler(data);
                                                    };
                                                }
                                                if(typeof(callback.ajaxAfterHandler)=='function'){
                                                    handlerJson.afterHandler = function(data){
                                                        //判断返回值 只有success为true才可以关闭弹框
                                                        if(typeof(data)=='undefined'){
                                                            nsalert('返回值不能为undefined');
                                                        }
                                                        nsdialog.hide();
                                                        return callback.ajaxAfterHandler(data);
                                                        /*if(data.success){
                                                            
                                                        }else{
                                                            //返回失败
                                                            if(data.msg){
                                                                //存在错误返回信息
                                                            }
                                                        }*/
                                                    };
                                                }
                                                if(typeof(callbackFun) == 'function'){
                                                    handlerJson.successFun = callbackFun;
                                                    handlerJson.$btnDom=$btnDom;
                                                }
                        
                                                /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                                                handlerJson.dialogBeforeHandler = {
                                                    btnOptionsConfig:obj.btnOptionsConfig,
                                                    selectData:obj.value,
                                                    containerFormJson:obj.containerFormJson
                                                }
                                                controllerObj.func.function(handlerJson);
                                            }
                                        }
                                    }]
                                }
                                nsdialog.initShow(dialogJson);
                            }
                        })(callback, obj)
                    }
                    NetstarEditorAjax.getById(ajaxConfig);
                }
                return ;
                //如果指定functionField的情况下显示functionField下字段
                if(typeof(functionField)=='object'){
                    dialogField = getDialogForm(businessObj,functionField);
                }else{ 
                    if(typeof(functionField)=='string'&&functionField.indexOf('nsProject.getFieldsByState')==0){
                        // 通过状态获取字段
                        dialogField = eval(functionField);
                    }else{
                        //否则显示全部字段
                        dialogField = getDialogForm(businessObj,fieldValue);
                    }
                }
                //调整表单form中的下拉框data参数 
                function getSelectData(fieldArr,fieldValue){
                    var newFieldArr = fieldArr;
                    if($.isEmptyObject(fieldValue)){
                        if(!$.isEmptyObject(obj.currentData)){
                            fieldValue = obj.currentData;
                        }
                    }
                    for(var fieldI = 0; fieldI<fieldArr.length; fieldI++){
                        //是否是ajax请求 需要转data参数
                        if(fieldArr[fieldI].url){
                            //存在url链接
                            function getSelectAjaxData(_params){
                                var data = $.extend(true,{},_params);
                                if(fieldArr[fieldI].dataFormat == 'ids'){
                                    if($.isArray(fieldValue)){
                                        var ids = [];
                                        for(var dataI=0; dataI<fieldValue.length; dataI++){
                                            ids.push(fieldValue[dataI][obj.options.idField]);
                                        }
                                        ids = ids.join(',');
                                        data.ids = ids;
                                    }else{
                                        data.ids = fieldValue[obj.options.idField];
                                    }
                                }else{
                                    for(var param in data){
                                        if(typeof(data[param])=='string'&&
                                            (data[param].indexOf('this.')>-1||data[param].indexOf('page.')>-1||data[param].indexOf('search')>-1)
                                        ){
        
                                        }else{
                                            data[param] = nsVals.getTextByFieldFlag(data[param],fieldValue);
                                        }
                                        if(data[param] === 'undefined'){data[param] = '';}
                                    }
                                }
                                return data;
                            }
                            fieldArr[fieldI].data = typeof(fieldArr[fieldI].data)=='object' ? fieldArr[fieldI].data : {};
                            fieldArr[fieldI].data = getSelectAjaxData(fieldArr[fieldI].data);
                        }
                    }
                    return newFieldArr;
                }
                dialogField = getSelectData(dialogField,fieldValue);
                if(fieldValue && dialogField){
                    //如果存在form并且存在默认值的情况
                    for(var formI = 0; formI<dialogField.length;formI++){
                        if(dialogField[formI].voField){
                            dialogField[formI].id = dialogField[formI].voField;
                        }
                        dialogField[formI].value = fieldValue[dialogField[formI].id];
                    }
                }
                /****sjj 20180531 添加支持事件回调 start***/
                /*changeHandlerData
                    *readonly:{id:false,name:false}
                    *disabled:{id:false,name:true}
                    *value:{id:'3333',name:"ddd"}
                    *hidden:{id:true,name:true}
                */
        
                var dialogJson = {
                    id:'dialogCommon',//typeof(obj.config.dialogId) == 'undefined'?'dialogCommon':obj.config.dialogId,
                    title: typeof(controllerObj.title) =='string'?controllerObj.title:'表单维护',
                    size:'m',
                    form:dialogField,
                    isEnterHandler:true,//控制是否绑定回车事件
                    btns:[{
                        text:typeof(controllerObj.btnText) =='string'?controllerObj.btnText:'确认',
                        isReturn:true,
                        handler:function($btnDom,callbackFun){
                            //$btnDom:按钮节点
                            //callbackFun:ajax方法回调
                            var jsonData = nsTemplate.getChargeDataByForm('dialogCommon');
                            if(jsonData){
                                var handlerJson = {};
        
                                handlerJson.value = jsonData;//formJsonFormat(jsonData,dialogForm);
                                handlerJson.controllerObj = controllerObj.func.config;
                                //by cy 20180508
                                //function和ajax的前后置回调
                                if(typeof(callback.ajaxBeforeHandler)=='function'){
                                    handlerJson.beforeHandler = function(data){
                                        return callback.ajaxBeforeHandler(data);
                                    };
                                }
                                if(typeof(callback.ajaxAfterHandler)=='function'){
                                    handlerJson.afterHandler = function(data){
                                        //判断返回值 只有success为true才可以关闭弹框
                                        if(typeof(data)=='undefined'){
                                            nsalert('返回值不能为undefined');
                                        }
                                        nsdialog.hide();
                                        return callback.ajaxAfterHandler(data);
                                        /*if(data.success){
                                            
                                        }else{
                                            //返回失败
                                            if(data.msg){
                                                //存在错误返回信息
                                            }
                                        }*/
                                    };
                                }
                                if(typeof(callbackFun) == 'function'){
                                    handlerJson.successFun = callbackFun;
                                    handlerJson.$btnDom=$btnDom;
                                }
        
                                /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                                handlerJson.dialogBeforeHandler = {
                                    btnOptionsConfig:obj.btnOptionsConfig,
                                    selectData:obj.value,
                                    containerFormJson:obj.containerFormJson
                                }
                                controllerObj.func.function(handlerJson);
                            }
                        }
                    }]
                }
                nsdialog.initShow(dialogJson);
            }
            //dialog和valueDialog公用弹窗
            function dialogCommon(callback,obj){
                //obj.value
                /* 	callback:object 回调函数对象 {ajaxBeforeHandler:funtion(){return}}
                 * 		{
                 *			dialogBeforeHandler:funtion(dialogFormJson){return dialogFormJson;}  	//弹出框弹出之前调用的回调参数 传递参数是弹框的配置参数
                 * 			ajaxBeforeHandler:funtion(ajaxConfig){return ajaxConfig;} 				//ajax调用前的回调参数，传递参数是ajax的所有参数
                 * 			ajaxAfterHandler:funtion(res){return res} 								//ajax调用后的回调参数，传递参数是服务器返回结果
                 * 		}
                    obj:object 注：此参数在任何情况下不允许传入 已经在框架初始化时赋值完成
                 */
                //by cy 20180508
                //dialog的前置回调
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    //加验证
                    obj = callback.dialogBeforeHandler(obj);
                }
                var controllerObj=obj.controllerObj;
                if(controllerObj.userMode === 'valueDialog'){
                    //如果当前弹框是valueDialog判断是否有返回值如果返回值为false，则提示必须有需要操作的值
                    if(obj.value === false){
                        var infoMsgStr = controllerObj.noSelectInfoMsg ? controllerObj.noSelectInfoMsg:'请选择要处理的数据';
                        nsalert(infoMsgStr,'error');
                        return false;
                    }
                }
            dialogContent(callback,obj);
            }
            
            //公用弹框内容调用
            function dialogContent(callback,obj){
                var functionField = obj.controllerObj.functionField;
                // var dialogField = [];
                if(typeof(functionField) == "string" && functionField.length > 0){
                    var ajaxConfig = {
                        data : {
                            id : functionField,
                        },
                        plusData : {
                        },
                        callBackFunc : (function(callback, obj){
                            return function(resData, plusData){
                                var comConfig = {
                                    type : 'vo',
                                }
                                var fieldValue = typeof(obj.value)=='object' ? obj.value : {};
                                var controllerObj = obj.controllerObj;
                                if($.isArray(resData) && resData.length == 1){
                                    NetstarEditorServer.setComponentPanelConfig(resData, comConfig);
                                }else{
                                    console.error('获取状态错误');
                                    console.error(resData);
                                }
                                var dialogField = comConfig.field;
                                //调整表单form中的下拉框data参数 
                                function getSelectData(fieldArr,fieldValue){
                                    var newFieldArr = fieldArr;
                                    if($.isEmptyObject(fieldValue)){
                                        if(!$.isEmptyObject(obj.currentData)){
                                            fieldValue = obj.currentData;
                                        }
                                    }
                                    for(var fieldI = 0; fieldI<fieldArr.length; fieldI++){
                                        //是否是ajax请求 需要转data参数
                                        if(fieldArr[fieldI].url){
                                            //存在url链接
                                            function getSelectAjaxData(_params){
                                                var data = $.extend(true,{},_params);
                                                if(fieldArr[fieldI].dataFormat == 'ids'){
                                                    if($.isArray(fieldValue)){
                                                        var ids = [];
                                                        for(var dataI=0; dataI<fieldValue.length; dataI++){
                                                            ids.push(fieldValue[dataI][obj.options.idField]);
                                                        }
                                                        ids = ids.join(',');
                                                        data.ids = ids;
                                                    }else{
                                                        data.ids = fieldValue[obj.options.idField];
                                                    }
                                                }else{
                                                    for(var param in data){
                                                        if(typeof(data[param])=='string'&&
                                                            (data[param].indexOf('this.')>-1||data[param].indexOf('page.')>-1||data[param].indexOf('search')>-1)
                                                        ){
                        
                                                        }else{
                                                            data[param] = nsVals.getTextByFieldFlag(data[param],fieldValue);
                                                        }
                                                        if(data[param] === 'undefined'){data[param] = '';}
                                                    }
                                                }
                                                return data;
                                            }
                                            fieldArr[fieldI].data = typeof(fieldArr[fieldI].data)=='object' ? fieldArr[fieldI].data : {};
                                            fieldArr[fieldI].data = getSelectAjaxData(fieldArr[fieldI].data);
                                        }
                                    }
                                    return newFieldArr;
                                }
                                if(obj.controllerObj.defaultMode == 'valueDialog'){
                                    dialogField = getSelectData(dialogField,fieldValue);
                                    if(fieldValue && dialogField){
                                        //sjj 20191014 start格式化参数
                                        if(obj.controllerObj.parameterFormat){
                                            var parameterFormat = obj.controllerObj.parameterFormat;
                                            fieldValue = NetStarUtils.getFormatParameterJSON(JSON.parse(parameterFormat),fieldValue);
                                        }
                                        //sjj 20191014 end 格式化参数
                                        //如果存在form并且存在默认值的情况
                                        for(var formI = 0; formI<dialogField.length;formI++){
                                            if(dialogField[formI].voField){
                                                dialogField[formI].id = dialogField[formI].voField;
                                            }
                                            dialogField[formI].value = fieldValue[dialogField[formI].id];
                                        }
                                    }
                                }
                                /****sjj 20180531 添加支持事件回调 start***/
                                /*changeHandlerData
                                    *readonly:{id:false,name:false}
                                    *disabled:{id:false,name:true}
                                    *value:{id:'3333',name:"ddd"}
                                    *hidden:{id:true,name:true}
                                */
                                    // 判断是否有旧组件
                                    var isOld = false;
                                    for(var fieldI=0; fieldI<dialogField.length; fieldI++){
                                        if(typeof(NetstarComponent[dialogField[fieldI].type])=="undefined"){
                                            isOld = true;
                                            break;
                                        }
                                    }
                                    if(isOld){
                                        dialogContentOld(callback,obj);
                                        return;
                                    }
                                var dialogJson = {
                                    id:'dialogCommon',//typeof(obj.config.dialogId) == 'undefined'?'dialogCommon':obj.config.dialogId,
                                    title: typeof(controllerObj.title) =='string'?controllerObj.title:'表单维护',
                                    templateName:'PC',
                                    shownHandler:function(data){
                                        var formConfig = {
                                            id: data.config.bodyId,
                                            templateName: 'form',
                                            componentTemplateName: 'PC',
                                            defaultComponentWidth:'50%',
                                            form:dialogField,
                                            isSetMore:typeof(controllerObj.isSetMore) =='boolean'?controllerObj.isSetMore:false,
                                            completeHandler:function(data){
                                                var dataConfig = data.config;
                                                var id = dataConfig.id;
                                                var footerId = id.substring(0,id.length-5)+'-footer-group';
                                                var btnJson = {
                                                    id:footerId,
                                                    pageId:id,
                                                    btns:[
                                                        {
                                                            text:typeof(controllerObj.btnText) =='string'?controllerObj.btnText:'确认',
                                                            handler:function(){
                                                                var jsonData = NetstarComponent.getValues('dialog-dialogCommon-body');
                                                                if(jsonData){
                                                                    var handlerJson = {};
                        
                                                                    handlerJson.value = jsonData;//formJsonFormat(jsonData,dialogForm);
                                                                    handlerJson.controllerObj = controllerObj.func.config;
                                                                    //by cy 20180508
                                                                    //function和ajax的前后置回调
                                                                    if(typeof(callback.ajaxBeforeHandler)=='function'){
                                                                        handlerJson.beforeHandler = function(data){
                                                                            return callback.ajaxBeforeHandler(data);
                                                                        };
                                                                    }
                                                                    if(typeof(callback.ajaxAfterHandler)=='function'){
                                                                        handlerJson.afterHandler = function(data){
                                                                            //判断返回值 只有success为true才可以关闭弹框
                                                                            if(typeof(data)=='undefined'){
                                                                                nsalert('返回值不能为undefined');
                                                                            }
                                                                            NetstarComponent.dialog['dialogCommon'].vueConfig.close();
                                                                            return callback.ajaxAfterHandler(data);
                                                                            /*if(data.success){
                                                                                
                                                                            }else{
                                                                                //返回失败
                                                                                if(data.msg){
                                                                                    //存在错误返回信息
                                                                                }
                                                                            }*/
                                                                        };
                                                                    }
                                                                    /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                                                                    handlerJson.dialogBeforeHandler = {
                                                                        btnOptionsConfig:obj.btnOptionsConfig,
                                                                        selectData:obj.value,
                                                                        containerFormJson:obj.containerFormJson
                                                                    }
                                                                    controllerObj.func.function(handlerJson);
                                                                }
                                                            }
                                                        },{
                                                            text:'关闭',
                                                            handler:function(){
                                                                NetstarComponent.dialog['dialogCommon'].vueConfig.close();
                                                            }
                                                        }
                                                    ]
                                                };
                                                //sjj 20190516 如果配置了getDataByAjax需要调用里面的配置
                                                if(!$.isEmptyObject(controllerObj.getDataByAjax)){
                                                    btnJson.btns.unshift({
                                                        text:controllerObj.getDataByAjax.btnText,
                                                        handler:function(){
                                                            //fieldValue
                                                            var getDataByAjax  = $.extend(true,{},controllerObj.getDataByAjax);
                                                            getDataByAjax.data = fieldValue;
                                                            getDataByAjax.plusData = {dataSrc:controllerObj.getDataByAjax.dataSrc};
                                                            NetStarUtils.ajax(getDataByAjax,function(res,ajaxData){
                                                                if(res.success){
                                                                    NetstarComponent.fillValues(res[ajaxData.plusData.dataSrc],'dialog-dialogCommon-body');
                                                                }
                                                            },true)
                                                        }
                                                    });
                                                }
                                                vueButtonComponent.init(btnJson);
                                            },
                                            // lyw 20191025 返回页面数据
                                            getPageDataFunc : (function(pageValue){
                                                return function(){
                                                    return pageValue;
                                                }
                                            })(fieldValue)
                                        };
                                        NetstarComponent.formComponent.show(formConfig, fieldValue);
                                        
                                        //sjj 20191206 添加tipContent  tipClass :  默认 warn error success info 
                                        if(controllerObj.tipContent){
                                            var tipClassStr = controllerObj.tipClass;
                                            $('#'+data.config.bodyId).prepend('<div class="tip-content"><span class="'+tipClassStr+'">'+controllerObj.tipContent+'</span></div>');
                                        }
                                    }
                                };
                                if(typeof(controllerObj.width) !=='undefined' && controllerObj.width!==""){
                                    dialogJson.width = controllerObj.width;
                                }
                                if(typeof(controllerObj.height) !=='undefined' && controllerObj.height!==""){
                                    dialogJson.height = controllerObj.height;
                                }
                                NetstarComponent.dialogComponent.init(dialogJson);
                            }
                        })(callback, obj)
                    }
                    NetstarEditorAjax.getById(ajaxConfig);
                    return ;
                }
                    var fieldValue = typeof(obj.value)=='object' ? obj.value : {};
                    var controllerObj = obj.controllerObj ? obj.controllerObj : {};
                    var functionField = obj.controllerObj.functionField;
                    var dialogField = [];
                    //如果指定functionField的情况下显示functionField下字段
                    if(typeof(functionField)=='object'){
                        dialogField = getDialogForm(businessObj,functionField);
                    }else{ 
                        if(typeof(functionField)=='string'&&functionField.indexOf('nsProject.getFieldsByState')==0){
                            // 通过状态获取字段
                            dialogField = eval(functionField);
                        }else{
                            //否则显示全部字段
                            dialogField = getDialogForm(businessObj,fieldValue);
                        }
                    }
                    //调整表单form中的下拉框data参数 
                    function getSelectData(fieldArr,fieldValue){
                        var newFieldArr = fieldArr;
                        if($.isEmptyObject(fieldValue)){
                            if(!$.isEmptyObject(obj.currentData)){
                                fieldValue = obj.currentData;
                            }
                        }
                        for(var fieldI = 0; fieldI<fieldArr.length; fieldI++){
                            //是否是ajax请求 需要转data参数
                            if(fieldArr[fieldI].url){
                                //存在url链接
                                function getSelectAjaxData(_params){
                                    var data = $.extend(true,{},_params);
                                    if(fieldArr[fieldI].dataFormat == 'ids'){
                                        if($.isArray(fieldValue)){
                                            var ids = [];
                                            for(var dataI=0; dataI<fieldValue.length; dataI++){
                                                ids.push(fieldValue[dataI][obj.options.idField]);
                                            }
                                            ids = ids.join(',');
                                            data.ids = ids;
                                        }else{
                                            data.ids = fieldValue[obj.options.idField];
                                        }
                                    }else{
                                        for(var param in data){
                                            if(typeof(data[param])=='string'&&
                                                (data[param].indexOf('this.')>-1||data[param].indexOf('page.')>-1||data[param].indexOf('search')>-1)
                                            ){
            
                                            }else{
                                                data[param] = nsVals.getTextByFieldFlag(data[param],fieldValue);
                                            }
                                            if(data[param] === 'undefined'){data[param] = '';}
                                        }
                                    }
                                    return data;
                                }
                                fieldArr[fieldI].data = typeof(fieldArr[fieldI].data)=='object' ? fieldArr[fieldI].data : {};
                                fieldArr[fieldI].data = getSelectAjaxData(fieldArr[fieldI].data);
                            }
                        }
                        return newFieldArr;
                    }
                    if(obj.controllerObj.defaultMode == 'valueDialog'){
                        dialogField = getSelectData(dialogField,fieldValue);
                        if(fieldValue && dialogField){
                            //sjj 20191014 start格式化参数
                            if(obj.controllerObj.parameterFormat){
                                var parameterFormat = obj.controllerObj.parameterFormat;
                                fieldValue = NetStarUtils.getFormatParameterJSON(JSON.parse(parameterFormat),fieldValue);
                            }
                            //sjj 20191014 end 格式化参数
                            //如果存在form并且存在默认值的情况
                            for(var formI = 0; formI<dialogField.length;formI++){
                                if(dialogField[formI].voField){
                                    dialogField[formI].id = dialogField[formI].voField;
                                }
                                dialogField[formI].value = fieldValue[dialogField[formI].id];
                            }
                        }
                    }
                    /****sjj 20180531 添加支持事件回调 start***/
                    /*changeHandlerData
                        *readonly:{id:false,name:false}
                        *disabled:{id:false,name:true}
                        *value:{id:'3333',name:"ddd"}
                        *hidden:{id:true,name:true}
                    */
                        // 判断是否有旧组件
                        var isOld = false;
                        for(var fieldI=0; fieldI<dialogField.length; fieldI++){
                            if(typeof(NetstarComponent[dialogField[fieldI].type])=="undefined"){
                                isOld = true;
                                break;
                            }
                        }
                        if(isOld){
                            dialogContentOld(callback,obj);
                            return;
                        }
                    var dialogJson = {
                        id:'dialogCommon',//typeof(obj.config.dialogId) == 'undefined'?'dialogCommon':obj.config.dialogId,
                        title: typeof(controllerObj.title) =='string'?controllerObj.title:'表单维护',
                        templateName:'PC',
                        shownHandler:function(data){
                            var formConfig = {
                                id: data.config.bodyId,
                                templateName: 'form',
                                componentTemplateName: 'PC',
                                defaultComponentWidth:'50%',
                                form:dialogField,
                                isSetMore:typeof(controllerObj.isSetMore) =='boolean'?controllerObj.isSetMore:false,
                                completeHandler:function(data){
                                    var dataConfig = data.config;
                                    var id = dataConfig.id;
                                    var footerId = id.substring(0,id.length-5)+'-footer-group';
                                    var btnJson = {
                                        id:footerId,
                                        pageId:id,
                                        btns:[
                                            {
                                                text:typeof(controllerObj.btnText) =='string'?controllerObj.btnText:'确认',
                                                handler:function(){
                                                    var jsonData = NetstarComponent.getValues('dialog-dialogCommon-body');
                                                    if(jsonData){
                                                        var handlerJson = {};
            
                                                        handlerJson.value = jsonData;//formJsonFormat(jsonData,dialogForm);
                                                        handlerJson.controllerObj = controllerObj.func.config;
                                                        //by cy 20180508
                                                        //function和ajax的前后置回调
                                                        if(typeof(callback.ajaxBeforeHandler)=='function'){
                                                            handlerJson.beforeHandler = function(data){
                                                                return callback.ajaxBeforeHandler(data);
                                                            };
                                                        }
                                                        if(typeof(callback.ajaxAfterHandler)=='function'){
                                                            handlerJson.afterHandler = function(data){
                                                                //判断返回值 只有success为true才可以关闭弹框
                                                                if(typeof(data)=='undefined'){
                                                                    nsalert('返回值不能为undefined');
                                                                }
                                                                NetstarComponent.dialog['dialogCommon'].vueConfig.close();
                                                                return callback.ajaxAfterHandler(data);
                                                                /*if(data.success){
                                                                    
                                                                }else{
                                                                    //返回失败
                                                                    if(data.msg){
                                                                        //存在错误返回信息
                                                                    }
                                                                }*/
                                                            };
                                                        }
                                                        /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                                                        handlerJson.dialogBeforeHandler = {
                                                            btnOptionsConfig:obj.btnOptionsConfig,
                                                            selectData:obj.value,
                                                            containerFormJson:obj.containerFormJson
                                                        }
                                                        controllerObj.func.function(handlerJson);
                                                    }
                                                }
                                            },{
                                                text:'关闭',
                                                handler:function(){
                                                    NetstarComponent.dialog['dialogCommon'].vueConfig.close();
                                                }
                                            }
                                        ]
                                    };
                                    //sjj 20190516 如果配置了getDataByAjax需要调用里面的配置
                                    if(!$.isEmptyObject(controllerObj.getDataByAjax)){
                                        btnJson.btns.unshift({
                                            text:controllerObj.getDataByAjax.btnText,
                                            handler:function(){
                                                //fieldValue
                                                var getDataByAjax  = $.extend(true,{},controllerObj.getDataByAjax);
                                                getDataByAjax.data = fieldValue;
                                                getDataByAjax.plusData = {dataSrc:controllerObj.getDataByAjax.dataSrc};
                                                NetStarUtils.ajax(getDataByAjax,function(res,ajaxData){
                                                    if(res.success){
                                                        NetstarComponent.fillValues(res[ajaxData.plusData.dataSrc],'dialog-dialogCommon-body');
                                                    }
                                                },true)
                                            }
                                        });
                                    }
                                    vueButtonComponent.init(btnJson);
                                },
                                // lyw 20191025 返回页面数据
                                getPageDataFunc : (function(pageValue){
                                    return function(){
                                        return pageValue;
                                    }
                                })(fieldValue)
                            };
                            NetstarComponent.formComponent.show(formConfig, fieldValue);
                            
                            //sjj 20191206 添加tipContent  tipClass :  默认 warn error success info 
                            if(controllerObj.tipContent){
                                var tipClassStr = controllerObj.tipClass;
                                $('#'+data.config.bodyId).prepend('<div class="tip-content"><span class="'+tipClassStr+'">'+controllerObj.tipContent+'</span></div>');
                            }
                        }
                    };
                    if(typeof(controllerObj.width) !=='undefined' && controllerObj.width!==""){
                        dialogJson.width = controllerObj.width;
                    }
                    if(typeof(controllerObj.height) !=='undefined' && controllerObj.height!==""){
                        dialogJson.height = controllerObj.height;
                    }
                    NetstarComponent.dialogComponent.init(dialogJson);
            
                }
            //ajax弹框
            function ajaxDialogCommon(callback,obj){
                //dialog的前置回调
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    //加验证
                    obj = callback.dialogBeforeHandler(obj);
                }
                var controllerObj = obj.controllerObj;
                var getListAjax = {
                    url:controllerObj.func.config.getUrl,
                    dataSrc:controllerObj.func.config.getDataSrc,
                    type:controllerObj.func.config.getType,
                    dataFormat:controllerObj.func.config.getDataFormat,
                    data:controllerObj.func.config.getData,
                    isAjaxDialog:true,//调用弹框调用ajax
                    contentType:controllerObj.func.config.getContentType,
                }
                getListAjax.data = $.extend(true,getListAjax.data,controllerObj.func.config.defaultData);
                var handlerJson = {
                    controllerObj:getListAjax,
                    value:obj.value,
                    beforeHandler:callback.ajaxBeforeHandler,
                    afterHandler:function(data){
                        obj.value = data;
                        dialogContent(callback,obj);
                    }
                }
                controllerObj.func.function(handlerJson);
            }
            function getPageConfig(backCount){
                var keys = Object.keys(nsFrame.containerPageData);
                if(keys.length > backCount){
                    //根据时间戳倒序排序
                    keys.sort(function(a,b){
                        return nsFrame.containerPageData[b].timeStamp - nsFrame.containerPageData[a].timeStamp;
                    });
                    return nsFrame.containerPageData[keys[backCount]];
                }
                return null;
            }
            function loadPageCommon(callback,obj){
                var url = obj.controllerObj.func.config.url;
                var paramObj = $.extend(true,{},obj.controllerObj.func.config.defaultData);
                var callback = callback.ajaxBeforeHandler(callback);
                var configObj = callback.dialogBeforeHandler(obj);
                var historyPageConfig = getPageConfig(0);
                var callBackUrl = window.location.href;
                if(historyPageConfig){
                    callBackUrl = historyPageConfig.url;
                }
                var jsonData = {
                    data:configObj.value,//接受到的参数
                    url:callBackUrl,//回传的url
                }
                if(typeof(NetstarTempValues)=='undefined'){NetstarTempValues = {};}
                var tempValueName = configObj.config.package + new Date().getTime();
                NetstarTempValues[tempValueName] = jsonData;
                if(url){
                    var url = url+'?templateparam='+encodeURIComponent(tempValueName);
                    if(NetStarUtils.Browser.browserSystem == 'mobile'){
                        nsFrame.loadPageVRouter(url);
                    }else{
                        nsFrame.loadPage(url);
                    }
                }else{
                    console.warn(obj.controllerObj.func);
                    nsalert('不存在url，无法跳转');
                }
            }
            //sjj 20190929 生成报告控件 先发送url链接请求然后根据请求返回参连接websocket
            function ajaxAndSendCommon(callBack,obj){
                var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
                callBack.controllerObj = functionConfig;
                var data = callBack.dialogBeforeHandler(callBack);//获取模板参数
                var templateConfig = data.config;
                //console.log(data.value)
                //var webSocketBody = '{"command":"报表打印","templateId":"a.b.c","listName":"dd","business":{"id":"{id}","reportTemplateId":"{reportTemplateId}"}}';
            
                var callbackAjax = functionConfig.callbackAjax ? getRootPath() + functionConfig.callbackAjax : "";
                if(functionConfig.url){
                    var ajaxConfig = {
                        url:functionConfig.url,
                        type:functionConfig.type,
                        contentType:functionConfig.contentType,
                        dataSrc:functionConfig.dataSrc,
                        plusData:{
                            webSocketBody:functionConfig.webSocketBody,
                            packageName:templateConfig.package,
                            ajaxAfterHandler:callBack.ajaxAfterHandler,
                            valueData:data.value,
                            callbackAjax:callbackAjax
                        },
                        //data:{
                            //templateName:templateConfig.package,
                            //deptId:NetstarMainPage.systemInfo.user.deptId,
                            //bllCateCode:'',
                            //languageName:'',
                        //}
                    };
                    ajaxConfig.data = NetStarUtils.getFormatParameterJSON(functionConfig.data,data.value);
                    NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
                        if(res.success){
                            var webSocketBody = ajaxOptions.plusData.webSocketBody;
                            var ptTemplateConfig = NetstarTemplate.templates.configs[ajaxOptions.plusData.packageName];
                            var ptTemplateValueData = ajaxOptions.plusData.valueData;
                            var resData = res[ajaxOptions.dataSrc];
                            webSocketBody = JSON.parse(webSocketBody);
                            if(webSocketBody.business){
                                webSocketBody.business = JSON.stringify(NetStarUtils.getFormatParameterJSON(webSocketBody.business,resData));
                            }else if(webSocketBody.fileId){
                                //cy 191026 修改 根据lyw截图
                                //webSocketBody.fileId = resData.fileId; 
                            }
                            var formatJson = {};
                            for(var formatI in webSocketBody){
                                switch(formatI){
                                    case 'command':
                                        break;
                                    case 'templateId':
                                        break;
                                    case 'listName':
                                        break;
                                    default:
                                        formatJson[formatI] = webSocketBody[formatI];
                                        break;
                                }
                            }
                            for(var paramsData in formatJson){
                                var valueData = {};
                                //cy 191026 修改 根据lyw截图
                                valueData[paramsData] = formatJson[paramsData];
                                // webSocketBody[paramsData] = NetStarUtils.getFormatParameterJSON(valueData,resData);
                                valueData = NetStarUtils.getFormatParameterJSON(valueData,resData);
                                webSocketBody[paramsData] = valueData[paramsData];
                            }
                            if(ajaxOptions.plusData.callbackAjax){
                                webSocketBody.callbackAjax = ajaxOptions.plusData.callbackAjax;
                            }
                            nschat.websocket.wsConnect(function(){
                                nschat.websocket.send(JSON.stringify(webSocketBody));
                            },function(){},'127.0.0.1:8888/Chat')
                            //链接websocket
                            //nschat.websocket.send(jsonString);
                            //nschat.websocket.send(JSON.stringify(webSocketBody));
                        }else{
                            nsalert('返回值为false','error');
                        }
                    },true)
                }else{
                    var webSocketBody = functionConfig.webSocketBody;
                    webSocketBody = JSON.parse(webSocketBody);
                    if(webSocketBody.business){
                        webSocketBody.business = JSON.stringify(NetStarUtils.getFormatParameterJSON(webSocketBody.business,data.value));
                    }else if(webSocketBody.fileId){
                        webSocketBody.fileId = data.value.fileId;
                    }
                    var formatJson = {};
                    for(var formatI in webSocketBody){
                        switch(formatI){
                            case 'command':
                                break;
                            case 'templateId':
                                break;
                            case 'listName':
                                break;
                            default:
                                formatJson[formatI] = webSocketBody[formatI];
                                break;
                        }
                    }
                    for(var paramsData in formatJson){
                        var valueData = {};
                        valueData[paramsData] = formatJson[paramsData];
                        webSocketBody[paramsData] = NetStarUtils.getFormatParameterJSON(valueData,data.value);
                    }
                    if(callbackAjax){
                        webSocketBody.callbackAjax = callbackAjax;
                    }
                    nschat.websocket.wsConnect(function(){
                        nschat.websocket.send(JSON.stringify(webSocketBody));
                        },function(){},'127.0.0.1:8888/Chat')
                }
            }
            //添加支持打开新标签页的方法
            function newTabCommon(callBack,obj){
                callBack.controllerObj = obj.controllerObj;
                // var url = obj.controllerObj.func.config.suffix;
                var url = obj.controllerObj.func.config.url;
                obj = callBack.dialogBeforeHandler(callBack);
                var value = obj.value;
                if(value == false){
                    return;
                }
                if(typeof(value.parentSourceParam)=='object'){
                    value.parentSourceParam.isEditMode = obj.controllerObj.isEditMode;
                }
                var isContinue = true;
                var isAlwaysNewTab = typeof(obj.controllerObj.func.config.isAlwaysNewTab)=='boolean' ? obj.controllerObj.func.config.isAlwaysNewTab : true;
                var packageName = obj.config.package;
                var packageNameSufficStr = new Date().getTime();

                if(!$.isEmptyObject(value)){
                    if(!$.isArray(value)){value = $.extend(true,{},obj.value)};
                        //sjj 20190926 判断url链接是否自带配置参数editModel
                        if(url.indexOf('?')>-1){
                            var search = url.substring(url.indexOf('?')+1,url.length);
                            var paramsObj = search.split('&');
                            var resultObject = {};
                            for (var i = 0; i < paramsObj.length; i++){
                                idx = paramsObj[i].indexOf('=');
                                if (idx > 0){
                                    resultObject[paramsObj[i].substring(0, idx)] = paramsObj[i].substring(idx + 1);
                                }
                            }
                            if(typeof(value)!='object'){value = {};}
                            $.each(resultObject, function (key, text) {
                                value[key] = text;
                        });
                        url = url.substring(0,url.indexOf('?'));
                        }

                    // var tempValueName = obj.config.package + new Date().getTime();
                        // var btnOptions = typeof(obj.btnOptionsConfig) == "object" && typeof(obj.btnOptionsConfig.options) == "object" ? obj.btnOptionsConfig.options : {};
                        // var idField = btnOptions.idField;
                        var idField;
                        if(typeof(obj.btnOptionsConfig) == "object" && typeof(obj.btnOptionsConfig.options) == "object"){
                            var btnOptions = obj.btnOptionsConfig.options;
                            idField = btnOptions.idField;
                        }else{
                            // 没有按钮配置时获取主表idField
                            if(typeof(obj.config) == "object" && typeof(obj.config.idFieldsNames) == "object"){
                                idField = obj.config.idFieldsNames.root;
                            }
                        }
                        if(idField){
                            packageNameSufficStr = value[idField] ? value[idField] : packageNameSufficStr;
                        }
                        var tempValueName = packageName + packageNameSufficStr;
                        if(isAlwaysNewTab){
                            tempValueName = {
                                packageName: tempValueName,
                                isMulitTab: isAlwaysNewTab,
                            }
                            tempValueName = JSON.stringify(tempValueName);
                        }else{
                            tempValueName = packageName;
                        }
                        NetstarTempValues[tempValueName] = value;
                        if(obj.controllerObj.func.config.parameterFormat){
                            var parameterFormat = JSON.parse(obj.controllerObj.func.config.parameterFormat);
                            var chargeData = nsVals.getVariableJSON(parameterFormat,NetstarTempValues[tempValueName]);
                            switch(obj.controllerObj.func.config.parameterFormatType){
                                case 'cover': // 覆盖
                                    NetstarTempValues[tempValueName] = chargeData;
                                    break;
                                default:
                                    // 添加
                                    nsVals.extendJSON(NetstarTempValues[tempValueName],chargeData);
                                    break;
                            }
                        }
                        //sjj 20190418 是否配置了isCopyObject
                        if(obj.controllerObj.func.config.isCopyObject){
                            for(var value in NetstarTempValues[tempValueName]){
                                if(typeof(NetstarTempValues[tempValueName][value])=='object'){
                                    delete NetstarTempValues[tempValueName][value];
                                }
                            }
                        }
                        url = url+'?templateparam=' + encodeURIComponent(tempValueName);
                }else{
                    if(isAlwaysNewTab){
                        var tempValueName = {
                            packageName: packageName + packageNameSufficStr,
                            isMulitTab: isAlwaysNewTab,
                        }
                        tempValueName = JSON.stringify(tempValueName);
                        NetstarTempValues[tempValueName] = {};
                        url = url+'?templateparam=' + encodeURIComponent(tempValueName);
                    }
                }
                    // 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 lyw 20190620 start ---
                    var defaultPageData = {};
                    var formatValueData = obj.controllerObj.formatValueData; 
                    // 转化对象
                    if(typeof(formatValueData) == "string" && formatValueData.length>0){
                        formatValueData = JSON.parse(formatValueData);
                    }
                    if(typeof(formatValueData) == "object"){
                        var pageOperateData = {};
                        if(typeof(NetstarTemplate.getOperateData) == "function"){
                            pageOperateData = NetstarTemplate.getOperateData(obj.config);
                        }
                        defaultPageData = NetStarUtils.getFormatParameterJSON(formatValueData, pageOperateData);
                    }
                    // 获取页面数据表达式不为空时 按钮添加获取页面数据回调方法 lyw 20190620 end ---
                    var validStr = '';
                    if(obj.controllerObj.validateParams){
                        // var validateParams = JSON.parse(obj.controllerObj.validateParams);
                        var validateParams;
                        if(typeof(obj.controllerObj.validateParams) == "object"){
                            validateParams = obj.controllerObj.validateParams;
                        }else{
                            validateParams = JSON.parse(obj.controllerObj.validateParams);
                        }
                        for(var valid in validateParams){
                            switch(typeof(value[valid])){
                                case 'string':
                                    if(value[valid] == ''){
                                        isContinue = false;
                                    }
                                    break;
                                case 'object':
                                    if($.isEmptyObject(value[valid])){
                                        isContinue = false;
                                    }
                                    break;
                                case 'undefined':
                                    isContinue = false;
                                    break;
                            }
                            if(isContinue == false){
                                validStr += validateParams[valid]+';';
                                break;
                            }
                        }
                    }
                    if(isContinue){
                        var titleStr = obj.controllerObj.title;
                        //添加对标题的判断，标题必填，不然之后会报错 cy 191119
                        if(typeof(titleStr)!='string'){
                            console.error('方法标题(title)未定义',controllerObj);
                            titleStr = '方法标题(title)未定义';
                        }
                        if(!$.isEmptyObject(value)){
                            titleStr = NetStarUtils.getHtmlByRegular(value,titleStr);
                        }
                        NetstarUI.labelpageVm.loadPage(url,titleStr, isAlwaysNewTab, defaultPageData);
                    }else{
                        nsalert(validStr,'warning');
                    }
                }
                function viewerDialogCommon(callBack,obj){
                    var url = obj.controllerObj.func.config.url;
                    var pageObj = callBack.dialogBeforeHandler(obj);
                    pageObj.value = typeof(pageObj.value) == 'object' ? pageObj.value : {};
                    pageObj.value.readonly = true;
                    var tempValueName = pageObj.config.package + new Date().getTime();
                    NetstarTempValues[tempValueName] = pageObj.value;
                    url = url+'?templateparam=' + encodeURIComponent(tempValueName);
                    var ajaxConfig = {
                            //url:url,
                            //type:'GET',
                            plusData:{value:pageObj.value},
                            pageIidenti : url,
                            paramObj : pageObj.value,
                            url : url,
                            callBackFunc:function(isSuccess, data, _pageConfig){
                                    if(isSuccess){
                                    var _config = _pageConfig.config;
                                    var _configStr = JSON.stringify(_config);
                                    var valueJson = {value:_pageConfig.plusData.value};
                                    var pageOperateDataStr = JSON.stringify(valueJson);
                                    var funcStr = 'nsProject.showPageData(pageConfig,' +pageOperateDataStr + ',' +  _configStr + ')';
                                    var starStr = '<container>';
                                    var endStr = '</container>';
                                    var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
                                    var exp = /NetstarTemplate\.init\((.*?)\)/;
                                    var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                                    containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
                                    var $container = nsPublic.getAppendContainer();
                                    $container.append(containerPage);
                                    }
                            }
                    };
                    pageProperty.getAndCachePage(ajaxConfig);
                    /*NetStarUtils.ajaxForText(ajaxConfig,function(data,ajaxOptions){
                            var _config = ajaxOptions.plusData.config;
                            var valueJson = {value:_config.value};
                            var _configStr = JSON.stringify(valueJson);
                            var funcStr = 'nsProject.showPageData(pageConfig,'+_configStr+')';
                            //var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
                            var starStr = '<container>';
                            var endStr = '</container>';
                            var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
                            var exp = /NetstarTemplate\.init\((.*?)\)/;
                            var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                            containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
                            var $container = nsPublic.getAppendContainer();
                            $container.append(containerPage);
                    });*/
                    /*var ajaxConfig = {
                        url:url,
                        type:'GET',
                        dataType:'html',
                        context:{
                            config:pageObj
                        },
                        success:function(data){
                            var _config = this.config;
                            var valueJson = {value:_config.value};
                            var _configStr = JSON.stringify(valueJson);
                            var funcStr = 'nsProject.showPageData(pageConfig,'+_configStr+')';
                            //var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
                            var starStr = '<container>';
                            var endStr = '</container>';
                            var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
                            var exp = /NetstarTemplate\.init\((.*?)\)/;
                            var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                            containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
                            var $container = nsPublic.getAppendContainer();
                            $container.append(containerPage);
                        }
                    };
                    $.ajax(ajaxConfig);*/
                }
                //sjj 20190815 mutliDialog 多个url链接拼接成一个tab页面
                function multiDialogCommon(callback,obj){
                    var pageDataObj = callback.dialogBeforeHandler(obj);
                    pageDataObj.value = typeof(pageDataObj.value) == 'object' ? pageDataObj.value : {};
                    var titleArr = [];
                    if(obj.controllerObj.title){
                        titleArr = obj.controllerObj.title.split(',');
                    }
                    var urlArr = [];
                    if(obj.controllerObj.func.config.url){
                        urlArr = obj.controllerObj.func.config.url.split(',');
                    }
                    var titleStr = obj.controllerObj.tabTitles ? obj.controllerObj.tabTitles : '多tab页面';
                    var controllerObj = obj.controllerObj ? obj.controllerObj : {};
                    if(controllerObj.parameterFormat){
                        var parameterFormat = controllerObj.parameterFormat;
                        pageDataObj.value = NetStarUtils.getFormatParameterJSON(JSON.parse(parameterFormat),pageDataObj.value);
                    }
                    var dialogCommon = {
                        id:'multitab-dialog-url',
                        title: titleStr,
                        templateName: 'PC',
                        height:'auto',
                        width:1170,
                        plusClass:'multiDialog',
                        shownHandler:function(data){
                                var $dialog = $('#'+data.config.dialogId);
                                var $dialogBody = $('#'+data.config.bodyId);
                                var ulId = data.config.bodyId + '-ul';
                                $dialog.addClass('pt-modal-content-lg');
                                $dialogBody.addClass('pt-modal-tab');
                                var tabContentId = data.config.bodyId+'-container';
                                var liHtml = '';
                                var tabContentHtml = '';
                                for(var titleI=0; titleI<titleArr.length; titleI++){
                                        var classStr = titleI === 0 ? 'current' : '';
                                     // var contentClassStr = titleI === 0 ? '' : 'hide';
                                        var id = data.config.bodyId +'-li-'+titleI;
                                        liHtml += '<li class="pt-nav-item '+classStr+'" id="'+id+'">'
                                                                +'<a href="javascript:void(0);" ns-url="'+urlArr[titleI]+'">'+titleArr[titleI]+'</a>'
                                                        +'</li>';
                                        //tabContentHtml += '<div id="'+id+'"></div>';
                                }
                                var headerHtml = 
                                   '<div class="pt-tab-header">\
                                      <div class="pt-nav">\
                                         <ul id="'+ulId+'">'
                                             + liHtml
                                         +'</ul>\
                                      </div>\
                                   </div>';
                                if(titleArr.length == 0){
                                    $dialog.addClass('pt-modal-notab');
                                }
                                $('#'+data.config.headId).append(headerHtml);
        
                                //sjj 20191206 添加tipContent  tipClass :  默认 warn error success info 
                                var tipContentHtml = '';
                                if(controllerObj.tipContent){
                                    var tipClassStr = controllerObj.tipClass;
                                    tipContentHtml.prepend('<div class="tip-content"><span class="'+tipClassStr+'">'+controllerObj.tipContent+'</span></div>');
                                }
        
                                var html = tipContentHtml+'<div class="pt-othertab">'
                                                +'<div class="pt-container">'
                                                        // +'<div class="pt-othertab-header">'
                                                        // 		+'<div class="pt-nav">'
                                                        // 				+'<ul id="'+ulId+'">'
                                                        // 						+liHtml
                                                        // 				+'</ul>'
                                                        // 		+'</div>'
                                                        // +'</div>'
                                                        +'<div class="pt-othertab-body">'
                                                                +'<div class="pt-othertab-content">'
                                                                        +'<div id="'+tabContentId+'"></div>'
                                                                +'</div>'
                                                        +'</div>'
                                                        +'<div class="pt-othertab-footer"></div>'
                                                +'</div>'
                                        +'</div>';
                                $dialogBody.html(html);
                                function getConfigByUrl(url){
                                        var pageObj = {
                                                containerId:tabContentId,
                                                pageParam:pageDataObj.value,
                                        };
                                        var tempValueName = pageDataObj.config.package + new Date().getTime();
                                        NetstarTempValues[tempValueName] = pageDataObj.value;
                                        url = url+'?templateparam=' + encodeURIComponent(tempValueName);
                                        
                                        var ajaxConfig = {
                                                //url:url,
                                                //type:'GET',
                                                plusData:{pageObj:pageObj},
                                                pageIidenti : url,
                                                paramObj : pageDataObj.value,
                                                url : url,
                                                callBackFunc:function(isSuccess, data, _pageConfig){
                                                        if(isSuccess){
                                                            var _config = _pageConfig.plusData.pageObj;
                                                            var _configStr = JSON.stringify(_config);
                                                            var funcStr = 'NetstarTemplate.getConfigByAjaxUrl(pageConfig,'+_configStr+')';
                                                            var starStr = '<container>';
                                                            var endStr = '</container>';
                                                            var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
                                                            var exp = /NetstarTemplate\.init\((.*?)\)/;
                                                            var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                                                            containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
                                                            var $container = nsPublic.getAppendContainer();
                                                            $container.append(containerPage);
                                                        }
                                                }
                                        };
                                        pageProperty.getAndCachePage(ajaxConfig);
                                        /*
                                        var ajaxConfig = {
                                                url:url,
                                                type:'GET',
                                                dataType:'html',
                                                context:{
                                                        config:pageObj
                                                },
                                        };
                                        NetStarUtils.ajaxForText(ajaxConfig,function(data,_this){
                                                var _config = _this.config;
                                                var _configStr = JSON.stringify(_config);
                                                var funcStr = 'NetstarTemplate.getConfigByAjaxUrl(pageConfig,'+_configStr+')';
                                                var starStr = '<container>';
                                                var endStr = '</container>';
                                                var containerPage = data.substring(data.indexOf(starStr)+starStr.length, data.indexOf(endStr));
                                                var exp = /NetstarTemplate\.init\((.*?)\)/;
                                                var funcStrRep = funcStr.replace('pageConfig', containerPage.match(exp)[1]);
                                                containerPage = containerPage.replace(containerPage.match(exp)[0],funcStrRep);
                                                var $container = $('container');
                                                $container.append(containerPage);
                                        });*/
                                }
                                $('#'+ulId+' li > a').on('click',function(ev){
                                        var $this = $(this);
                                        var url = $this.attr('ns-url');
                                        var id = $this.closest('li').attr('id');
                                        $this.closest('li').addClass('current');
                                        $this.closest('li').siblings().removeClass('current');
                                        getConfigByUrl(url);
                                });
                            getConfigByUrl(urlArr[0]);
                        }
                };
                NetstarComponent.dialogComponent.init(dialogCommon);
                }
            //topage弹出界面 sjj20180518
            function toPageCommon(callback,obj){
                var url = obj.controllerObj.func.config.url;
                var paramObj = $.extend(true,{},obj.controllerObj.func.config.defaultData);
                var callback = callback.ajaxBeforeHandler(callback);
                obj = callback.dialogBeforeHandler(obj);
                var configObj = callback.config;
                var value = obj.value;
                if(value){
                    var templateObj = eval(configObj.package);
                    templateObj.pageParams = value;
                    templateObj.descritute = obj.btnOptionsConfig.descritute;
                    paramObj.package = configObj.package;
                }
                /*if(obj.rowData){
                    var rowData = $.extend(true,{},obj.rowData);
                    var templateObj = eval(configObj.package);
                    templateObj.pageParams = rowData;
                    console.log(templateObj)
                    paramObj.template = configObj.package;
                    //paramObj = $.extend(true,paramObj,rowData);
                }*/
                if(!$.isEmptyObject(paramObj)){
                    paramObj = JSON.stringify(paramObj);
                    var urlStr =  encodeURIComponent(encodeURIComponent(paramObj));
                    url = url+'?templateparam='+urlStr;
                }
                //nsFrame.popPage(url);
                var config = {
                    url:url,
                    loadedHandler:function(){
                        return callback.loadPageHandler(obj);
                    },
                    closeHandler:function(){
                        return callback.closePageHandler(obj);
                    }
                }
                if(obj.controllerObj.width){
                    config.width = obj.controllerObj.width;
                }
                if(obj.controllerObj.height){
                    config.height = obj.controllerObj.height;
                }
                if(obj.controllerObj.title){
                    config.title = obj.controllerObj.title;
                }
                nsFrame.popPageConfig(config);
                //跳转链接
            }
            //changePage 跳转界面 sjj20180606
            function changePageCommon(callback,obj){
                var url = obj.controllerObj.func.config.url;
                var paramObj = obj.controllerObj.func.config.defaultData;
                var callback = callback.ajaxBeforeHandler(callback);
                obj = callback.dialogBeforeHandler(obj);
                var configObj = callback.config;
                var value = obj.value;
                if(value){
                    var templateObj = eval(configObj.package);
                    templateObj.pageParams = value;
                    paramObj.package = configObj.package;
                }
                /*if(obj.rowData){
                    var rowData = $.extend(true,{},obj.rowData);
                    var templateObj = eval(configObj.package);
                    templateObj.pageParams = rowData;
                    //paramObj = $.extend(true,paramObj,rowData);
                }*/
                if(!$.isEmptyObject(paramObj)){
                    paramObj = JSON.stringify(paramObj);
                    var urlStr =  encodeURIComponent(encodeURIComponent(paramObj));
                    url = url+'?templateparam='+urlStr;
                }
                window.location.href = url;
            }
            //自定义组件调用
            function changeComponentCommon(callBack,obj){
                var controllerObj = obj.controllerObj;
                var funcObj = eval(controllerObj.componentName);
                function componentCompleteHandler(data){
                    var value = {ids:data.value.join(',')};
                    var completeAjax = controllerObj.func.config;
                    completeAjax.data = $.extend(true,completeAjax.data,controllerObj.func.config.defaultData);
                    var handlerJson = {
                        controllerObj:completeAjax,
                        value:value,
                        beforeHandler:callBack.ajaxBeforeHandler,
                        afterHandler:function(data){
                            callBack.ajaxAfterHandler(data);
                        }
                    }
                    controllerObj.func.function(handlerJson);
                }
                var pageConfig = {
                    callback:callBack,
                    obj:obj
                };
                funcObj.init({},componentCompleteHandler,pageConfig);
            }
            //打印  sjj 20180928
            function printCommon(callBack,obj){
                nschat.websocket.wsConnect(function(){
                    obj = callback.dialogBeforeHandler(obj);
                    var idField = obj.btnOptionsConfig.descritute.idField;
                    var id = obj.value[idField];
                    var jsonData = {
                        id:'1279797681833092073',
                        command:'报表打印'
                    }
                    if(obj.controllerObj.data){
                        if(obj.controllerObj.data.id){
                            var match = /\{([^:]*?)\}/g.exec(obj.controllerObj.data.id);
                            jsonData.id = match[1];
                        }
                    }
                    var businessId = {};
                    businessId[idField] = id;
                    jsonData.businessId = businessId;
                    var jsonString = JSON.stringify(jsonData);
                    nschat.websocket.send(jsonString);
                },function(){},'127.0.0.1:8888/Chat')
                /*nschat.websocket.wsConnect(function(){
                  nschat.websocket.send('{"command":"报表模板编辑","id":12345664}');
                },function(){});*/
            }
            //工作流监控弹框
            function workflowViewer(callBack, obj){
                var rowData = obj.rowData;
                var id = callBack.data.id;
                if(typeof(rowData)=='undefined'){
                    var dialogConfig = callBack.dialogBeforeHandler(callBack);
                    rowData = dialogConfig.value;
                    if(typeof(rowData)=='object'){
                        if($.isArray(rowData.selectedList)){
                            rowData = rowData.selectedList[0];
                        }
                    }
                }
                if(typeof(rowData)!='object'){rowData = {}};
                var workitemId = rowData.workItemId;
                if(typeof(workitemId)!='undefined'){
                    // nsUI.flowChartViewer.dialog.show(workitemId);
                    var flowChartViewerConfig = {
                        id : id + '-' + workitemId,
                        workitemId : workitemId,
                        title : '流程监控',
                        attrs : {},
                    }
                    NetstarUI.flowChartViewer.tab.init(flowChartViewerConfig);
                }else{
                    console.error('没有找到workitemId');
                    console.error(rowData);
                }
                return;
            }
            //工作流按钮配置
            function workflowSubmit(callBack, obj){
                var rowData = obj.rowData;
                // 查看办理意见不识别workitemId识别instanceIds(郑天祥,董超) 所以特殊处理   
                var controllerObj = obj.controllerObj;
                var workflowType = controllerObj.workflowType;
                if(typeof(rowData)=='undefined'){
                    var dialogConfig = callBack.dialogBeforeHandler(callBack);
                    rowData = dialogConfig.value;
                    // if(typeof(rowData)=='object'){
                    // 	if($.isArray(rowData.selectedList)){
                    // 		rowData = rowData.selectedList[0];
                    // 	}
                    // }
                }
                if(typeof(rowData)!='object'){rowData = {}};
                switch(workflowType){
                    case 'findHandleRec':
                        if($.isArray(rowData.selectedList)){
                            rowData = rowData.selectedList[0];
                        }
                        var instanceIds = rowData.instanceIds;
                        if(typeof(instanceIds)!='undefined'){
                            var operationFunc = nsEngine.operation().instanceIds(instanceIds).submitAllBatch(true).build();
                            if(typeof(operationFunc[workflowType])=="function"){
                                operationFunc[workflowType]();
                            }else{
                                console.error(workflowType+'方法不存在');
                                console.error(operationFunc);
                            }
                        }else{
                            console.error('没有找到instanceIds');
                            console.error(rowData);
                        }
                        break;
                    default:
                        var workitemId = rowData.workItemId;
                        if($.isArray(rowData.selectedList)){
                            if(workflowType == "multiSubmit"){
                                workitemId = [];
                                for(var i=0; i<rowData.selectedList.length; i++){
                                    if(rowData.selectedList[i].workItemId){
                                        workitemId.push(rowData.selectedList[i].workItemId);
                                    }
                                }
                                if(workitemId.length == 0){
                                    workitemId = undefined;
                                }
                            }else{
                                rowData = rowData.selectedList[0];
                                workitemId = rowData.workItemId;
                            }
                        }
                        // var workitemId = rowData.workItemId;
                        if(typeof(workitemId)!='undefined'){
                            switch(workflowType){
                                case 'submitAllBatch':
                                    var operationFunc = nsEngine.operation().workitemId(workitemId).submitAllBatch(true).build();
                                    workflowType = 'submit';
                                    break;
                                case 'multiSubmit':
                                    var operationFunc = nsEngine.operation().workitemIds(workitemId).build();
                                    break;
                                default:
                                    var operationFunc = nsEngine.operation().workitemId(workitemId).build();
                                    break;
                            }
                            if(typeof(operationFunc[workflowType])=="function"){
                                operationFunc[workflowType](function(resp){
                                    nsAlert(controllerObj.text+'成功', 'success');
                                    if(callBack){
                                        if(typeof(callBack.ajaxAfterHandler)=='function'){
                                            callBack.ajaxAfterHandler({});
                                        }
                                    }
                                    // console.log(resp);
                                    // var $tr = obj.obj.parents("tr");
                                    // $tr.find('button').attr('disabled',true);
                                },function(resp){
                                    nsAlert(controllerObj.text+'失败', 'error');
                                    console.error(resp);
                                });
                            }else{
                                console.error(workflowType+'方法不存在');
                                console.error(operationFunc);
                            }
                        }else{
                            console.error('没有找到workitemId');
                            console.error(rowData);
                        }
                        break;
                }
                return;
            }
            //sjj 20190524 defaultMode successMessage
            function successMessage(callback,obj){
                    var titleStr = obj.controllerObj.title ? obj.controllerObj.title : '请选择对本单据的处理,按 《《Esc》》键放弃本次处理';
                    var controllerObj = obj.controllerObj;
                    //dialog的前置回调
                    var dialogBeforeConfigData = {};
                    if(typeof(callback.dialogBeforeHandler)=='function'){
                        //加验证
                        dialogBeforeConfigData = callback.dialogBeforeHandler(obj);
                    }
                    //确认弹窗提示信息
                    var ajaxObj = {
                        dialogBeforeHandler:{
                            btnOptionsConfig:dialogBeforeConfigData.btnOptionsConfig,
                        },
                        value:dialogBeforeConfigData.value,
                        controllerObj:controllerObj.func.config,
                        templateConfig:dialogBeforeConfigData.config
                    };
                    if(typeof(ajaxObj.value)!='object'){
                        ajaxObj.value = {};
                    }
                    /***sjj20180604 补充通过弹框事件获取到的界面选中值和当前按钮相关属性*/
                    if(typeof(callback.ajaxBeforeHandler)=='function'){
                        ajaxObj.beforeHandler = function(data){
                            return callback.ajaxBeforeHandler(data);
                        };
                    }
                    if(typeof(callback.ajaxAfterHandler)=='function'){
                        ajaxObj.afterHandler = function(data,ajaxData){
                            NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
                            return callback.ajaxAfterHandler(data,ajaxData);
                        };
                    }
                    //btnsConfig
                    var btnsArray = [];
                    if(!$.isArray(controllerObj.btnsConfig)){
                        btnsArray = [
                            {
                                text:'保存',
                                handler:function(){
                                    //nsconfirm('是否确认保存？',function(isDelete){
                                        //if(isDelete){
                                            //获取界面值
                                            var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
                                            if(ajaxValue){
                                                ajaxObj.value = ajaxValue;
                                                ajaxObj.value.saveParam = NSSAVEDATAFLAG.ADD;
                                                ajaxObj.objectState = NSSAVEDATAFLAG.VIEW;
                                                ajaxObj.controllerObj.clickBtnType = 'isUseSave'; // lyw 20190614
                                                controllerObj.func.function(ajaxObj);
                                            }else{
                                                nsalert('请填写数据','warning');
                                            }
                                    //	}
                                    //},'warning')
                                }
                            },{
                                text:'保存|提交',
                                handler:function(){
                                    //nsconfirm('是否确认保存并提交？',function(isDelete){
                                        //if(isDelete){
                                            var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
                                            if(ajaxValue){
                                                ajaxObj.value = ajaxValue;
                                                ajaxObj.value.saveParam = NSSAVEDATAFLAG.EDIT;
                                                ajaxObj.objectState = NSSAVEDATAFLAG.DELETE;
                                                ajaxObj.controllerObj.clickBtnType = 'isUseSaveSubmit'; // lyw 20190614
                                                controllerObj.func.function(ajaxObj);
                                            }else{
                                                nsalert('请填写数据','warning');
                                            }
                                    //	}
                                    //},'warning')
                                }
                            },{
                                text:'保存草稿',
                                handler:function(){
                                    //isUser true isSaveBtn
                                    dialogBeforeConfigData.config.draftBox.isUse = true;
                                    function func(){
                                        //关闭当前弹出框
                                        NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
                                    }
                                    NetstarTemplate.draft.btnManager.save(dialogBeforeConfigData.config,func);
                                }
                            }
                        ]
                    }else{
                        for(var btnI=0; btnI<controllerObj.btnsConfig.length; btnI++){
                            switch(controllerObj.btnsConfig[btnI]){
                                case 'isUseSave':
                                    btnsArray.push({
                                        text:'保存',
                                        handler:function(_btnConfig){
                                            //nsconfirm('是否确认保存？',function(isDelete){
                                                //if(isDelete){
                                                    var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
                                                    
                                                    if(ajaxValue == false){
        
                                                        //获取数据被表单字段验证拦截了 返回为false
                                                        nsalert('请填写数据','warning');
        
                                                    }else{
        
                                                        //保存之前 根据表达式验证整体页面录入数据是否合法 cy 2019.06.13 start------
                                                        var validData = $.extend(true, {}, ajaxValue);
                                                        var validConfig = ajaxObj.controllerObj.validateParams;  //该值可能是string 方法内部转换
                                                        var isValid = NetStarUtils.getPageValidResult(validData, validConfig);
                                                        //保存之前验证整体页面录入数据是否合法 cy 2019.06.13 end  ------
        
                                                        if(isValid == false){
                                                            //验证失败不执行
                                                        }else{
                                                            $(_btnConfig.event.currentTarget).attr('disabled',true);//按钮禁用
                                                            ajaxObj.value = ajaxValue;
                                                            ajaxObj.value.saveParam = NSSAVEDATAFLAG.ADD;
                                                            ajaxObj.objectState = NSSAVEDATAFLAG.VIEW;
                                                            ajaxObj.controllerObj.clickBtnType = 'isUseSave'; // lyw 20190614
                                                            ajaxObj.$btnDom = $(_btnConfig.event.currentTarget);
                                                            ajaxObj.successFun = function(msg,$btnDom){
                                                                $btnDom.removeAttr('disabled');
                                                            }
                                                            controllerObj.func.function(ajaxObj);
                                                        }
                                                    }
                                                    
                                                    
        
                                            //	}
                                            //},'warning')
                                        }
                                    });
                                    break;
                                case 'isUseSaveSubmit':
                                btnsArray.push({
                                    text:'保存|提交',
                                    handler:function(){
                                        //nsconfirm('是否确认保存并提交？',function(isDelete){
                                            //if(isDelete){
                                                var ajaxValue = NetstarTemplate.templates.processDocBase.getPageData(ajaxObj.templateConfig.package,true);
                                                if(ajaxValue){
                                                    ajaxObj.value = ajaxValue;
                                                    ajaxObj.value.saveParam = NSSAVEDATAFLAG.EDIT;
                                                    ajaxObj.objectState = NSSAVEDATAFLAG.DELETE;
                                                    ajaxObj.controllerObj.clickBtnType = 'isUseSaveSubmit'; // lyw 20190614
                                                    controllerObj.func.function(ajaxObj);
                                                }else{
                                                    nsalert('请填写数据','warning');
                                                }
                                        //	}
                                        //},'warning')
                                    }
                                })
                                    break;
                                case 'isUseDraft':
                                    btnsArray.push({
                                        text:'保存草稿',
                                        handler:function(){
                                            //isUser true isSaveBtn
                                            dialogBeforeConfigData.config.draftBox.isUse = true;
                                            function func(){
                                                //关闭当前弹出框
                                                NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
                                            }
                                            NetstarTemplate.draft.btnManager.save(dialogBeforeConfigData.config,func);
                                        }
                                    });
                                    break;
                            }
                        }
                    }
                    btnsArray.push({
                            text:'废弃退出',
                            handler:function(){
                                    //关闭当前弹出框
                                    NetstarComponent.dialog['btn-dialog-panel'].vueConfig.close();
                                    NetstarUI.labelpageVm.removeCurrent();
                                    //刷新界面
                            }
                    });
                    var dialogCommon = {
                        id:'btn-dialog-panel',
                        title: '保存提示',
                        templateName: 'PC',
                        height:120,
                        plusClass:'pt-confirm',
                        shownHandler:function(data){
                                var html = '<p class=""><i class="icon-info"></i>'+titleStr+'</p>';
                                $('#'+data.config.bodyId).html(html);
                                var btnJson = {
                                        id:data.config.footerIdGroup,
                                        pageId:'btn-'+data.config.footerIdGroup,
                                        btns:btnsArray,
                                };
                                vueButtonComponent.init(btnJson);
                        }
                    }
                    NetstarComponent.dialogComponent.init(dialogCommon);
            }
            // lyw 表格导入
            function excelImportVer2(callback,obj){
                var controllerObj = obj.controllerObj;
                var importConfig = {
                    type : 'dialog',
                    id : callback.data.id + '-import',
                    title : controllerObj.title,
                    templateId : controllerObj.templateId,
                }
                if(typeof(callback.dataImportComplete) == "function"){
                    importConfig.completeHandler = callback.dataImportComplete;
                }
                
                NetstarExcelImport.init(importConfig);
            }
            // lyw 业务组件
            function businessInit(callback,obj){
                var controllerObj = obj.controllerObj;
                var btnConfig = callback.data;
                var sourceBtnConfig = controllerObj.func.config;
                nsProject.businessBtnManage.configs = typeof(nsProject.businessBtnManage.configs) == "object" ? nsProject.businessBtnManage.configs : {};
                nsProject.businessBtnManage.configs[btnConfig.id] = {
                    callback : callback,
                    controller : controllerObj,
                };
                var pageConfig = {
                    pageIidenti : sourceBtnConfig.url,
                    url : sourceBtnConfig.url,
                    plusData:{
                        btnId : btnConfig.id,
                    },
                    contentType:sourceBtnConfig.contentType,
                    callBackFunc : function(isSuccess, data, _pageConfig){
                        if(isSuccess){
                            var plusData = _pageConfig.plusData;
                            var businessBtn = nsProject.businessBtnManage.configs[plusData.btnId];
                            var _configStr = JSON.stringify(plusData);
                            var funcStr = 'nsProject.businessBtnManage.dialog(pageConfig, '+_configStr+')';
                            var containerPage = NetstarComponent.business.getContainerPage(data, funcStr);
                            var $container = nsPublic.getAppendContainer();
                            var $containerPage = $(containerPage);
                            businessBtn.$containerPage = $containerPage;
                            $container.append($containerPage);
                        }
                    },
                }
                pageProperty.getAndCachePage(pageConfig);
            }
            // 通过ids获取文件信息
            function getFileByIds(ids, config, callBackFunc){
                var ajaxConfig = {
                    url : getRootPath() + '/files/getListByIds',
                    data : {
                        ids : ids,
                        hasContent: false,
                    },
                    type : 'GET',
                    //cy 191026 修改 根据lyw截图
                    contentType:'application/x-www-form-urlencoded',
                    plusData : {
                        callBackFunc : callBackFunc,
                        config: config,
                    },
                }
                NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                    if(res.success){
                        var plusData = _ajaxConfig.plusData;
                        var _config = plusData.config;
                        if(typeof(res.rows) != "object"){
                            nsAlert('获取文件返回值错误','error');
                            console.error('获取文件返回值错误');
                            console.error(res);
                            console.error(_config);
                            return false;
                        }
                        if(typeof(plusData.callBackFunc) == "function"){
                            plusData.callBackFunc(res.rows, _config);
                        }
                    }else{
                        // nsalert("获取文件失败");
                        console.error(res.msg, 'error');
                    }
                })
            }
            function previewFileShow(files, config){
                var _files = [];
                for(var i=0; i<files.length; i++){
                    var contentType = files[i].contentType;
                    var suffix = contentType.substring(contentType.lastIndexOf('/')+1);
                    //cy 191026 修改 根据lyw截图
                    if(files[i].suffix){
                        suffix = files[i].suffix;
                    }
        
                    var fileObj = {
                        id : files[i].id,
                        originalName : files[i].originalName,
                        suffix : suffix,
                    };
                    _files.push(fileObj);
                }
                NetstarUI.pdfDialog.dialog({
                    url:        '',
                    zoomFit:    'width',
                    isDownload: true,             //是否有下载
                    urlArr :  	_files,
                    pdfUrlPrefix : getRootPath() + '/files/pdf/',
                    imgUrlPrefix : getRootPath() + '/files/images/',
                });
            }
            // 文件预览
            function previewFileInit(callback,obj){
                var pageData = {};
                // if(typeof(callback.getOperateData) == "function"){
                // 	operateData = callback.getOperateData();
                // }else{
                // 	if(typeof(callback.dialogBeforeHandler) == "function"){
                // 		var befData = callback.dialogBeforeHandler(callback);
                // 		if(befData &&　befData.config){
        
                // 		}
                // 	}
                // }
                if(typeof(callback.dialogBeforeHandler) == "function"){
                    var befData = callback.dialogBeforeHandler(callback);
                    if(befData){
                        pageData = befData.value;
                    }
                }
                var controllerObj = obj.controllerObj;
                var btnConfig = controllerObj.func.config;
                var data = NetStarUtils.getFormatParameterJSON(btnConfig.data, pageData);
                if(btnConfig.url.length == 0){
                    nsAlert('没有配置地址信息', 'error');
                    console.error('没有配置地址信息');
                    return false;
                }
                var ajaxConfig = {
                    url : btnConfig.url,
                    type : btnConfig.type ? btnConfig.type : 'POST',
                    contentType : btnConfig.contentType ? btnConfig.contentType : 'application/x-www-form-urlencoded',
                    data : data,
                    plusData : {
                        config : btnConfig,
                    },
                }
                NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                    var plusData = _ajaxConfig.plusData;
                    var _config = plusData.config;
                    var dataSrc = _config.dataSrc;
                    var data = res[dataSrc] ? res[dataSrc] : {};
        
                    if(!$.isArray(data)){
                        data = [data];
                    }
        
                    var fileFields = _config.fileFields;
                    // 通过fileFields获取data中的文件id
                    var ids = [];
        
                    var fileFieldsArr = fileFields.split(',');
                    for(var listI=0; listI<data.length; listI++){
                        var _data = data[listI];
                        for(var i=0; i<fileFieldsArr.length; i++){
                            if(typeof(_data[fileFieldsArr[i]]) != "undefined" && _data[fileFieldsArr[i]]){
                                ids.push(_data[fileFieldsArr[i]]);
                            }
                        }
                    }
        
                    if(ids.length == 0){
                        nsAlert('没有对应的附件', 'warning');
                        console.warn('没有对应的附件');
                        console.warn(res);
                        return false;
                    }
                    getFileByIds(ids.toString(), _config, function(resData, __config){
                        previewFileShow(resData, __config);
                    });
                });
            }
        
            //文件下载
            function downloadFileInit(callback,obj){
                var controllerObj = obj.controllerObj;
                var ajaxData = controllerObj.ajaxData; //{bllId:'',bllType:'',hasContent:false}
                var ajaxConfigByBll = {
                    url:getRootPath()+'/files/getListByBll',
                    type:'POST',
                    dataSrc:'data',
                    data:ajaxData,
                    contentType:'application/x-www-form-urlencoded',
                };
                NetStarUtils.ajax(ajaxConfigByBll,function(res){
                    if(res.success){
                        var fileListArr = [];
                        if($.isArray(res.rows)){
                            fileListArr = res.rows;
                        }
                        var idsArr = [];
                        for(var idI=0; idI<fileListArr.length; idI++){
                            idsArr.push(fileListArr[idI].id);
                        }
                        var fileListIdsAjaxConfig = {
                            url : getRootPath() + '/files/getListByIds',
                            data : {
                                ids : idsArr.join(','),
                                hasContent : false,
                            },
                            type : 'GET',
                            contentType:'application/x-www-form-urlencoded',
                         };
                         NetStarUtils.ajax(fileListIdsAjaxConfig,function(resData,ajaxOptions){
                            if(resData.success){
                                var filesArray = [];
                                if($.isArray(resData.rows)){
                                    filesArray = resData.rows;
                                }
                                if(filesArray.length == 1){
                                    var downloadFileName = filesArray[0].originalName;
                                    var fileId = filesArray[0].id;
                                    var downloadFileUrl = getRootPath()+'/files/download/'+ fileId;
                                    NetStarUtils.download({
                                        url: downloadFileUrl,
                                        fileName: downloadFileName,
                                    });
                                }
                            }else{
                               var msg = resData.msg ? resData.msg : '返回值为false';
                               nsalert(msg,'error');
                            }
                         },true)
                    }else{
                        var msg = res.msg ? res.msg : '返回值为false';
                        nsalert(msg,'error');
                    }
                },true)
            }
        
            function addInfoDialogInit(callback,obj){
                var packageName = $('#'+callback.data.id).closest('.btn-group').attr('ns-tempalte-package');
                if(packageName){
                    var addInfoDialogConfig = NetstarTemplate.templates.configs[packageName];
                    var currentFunctionConfig = obj.controllerObj.func.config;
                    var presuffix = currentFunctionConfig.suffix;
                    var currentDefaultMode = currentFunctionConfig.defaultMode;
                    if(addInfoDialogConfig.template == 'processDocBase'){
                        NetstarTemplate.templates.processDocBase.utils.getOtherPageConfig(presuffix, currentDefaultMode, {keyField: currentFunctionConfig.keyField,package: addInfoDialogConfig.package.replace(/-/g, '.')}, currentFunctionConfig);
            
                    }
                }
            }
        
        
            function ajaxNewtabCommon(callback,obj){
                var dataJson = {};
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
                }
                var value = dataJson.value;//获取value值
                var controllerObj = obj.controllerObj.func.config;//获取按钮配置项
                if(value == false){
                    if(controllerObj.noSelectInfoMsg){
                        //定义了弹出的提示语
                        nsalert(controllerObj.noSelectInfoMsg,'error');
                        console.error(infoMsgStr);
                    }
                    return false;
                }
                var isUseConfirm = typeof(controllerObj.isUseConfirm)=='boolean' ? controllerObj.isUseConfirm : true;//默认弹出框
                if(callback.event){
                    if(callback.event.target.nodeName == 'BODY'){
                        if(callback.data.id){
                            var $btnDom = $('#'+callback.data.id);
                            $btnDom.attr('disabled',true);
                        }
                    }else{
                        var $btnDom = $(callback.event.currentTarget);
                        $btnDom.attr('disabled',true);
                    }
                }
                function getAjaxHandler(){
                    var ajaxConfig = $.extend(true,{},obj.controllerObj.beforeAjax);
                    ajaxConfig.data = typeof(ajaxConfig.data)=='object' ? ajaxConfig.data : {};
                    if(controllerObj.dataFormat == 'id'){
                        if(dataJson.btnOptionsConfig){
                            if(dataJson.btnOptionsConfig.options){
                                if(dataJson.btnOptionsConfig.options.idField){
                                    var idField = dataJson.btnOptionsConfig.options.idField;
                                    ajaxConfig.data[idField] = value[idField];
                                }
                            }
                        }
                    }else{
                        if($.isEmptyObject(ajaxConfig.data)){
                            ajaxConfig.data = value;
                        }else{
                            ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data,value);
                        }
                    }
                    ajaxConfig.plusData = {
                        btnFunctionConfig:controllerObj,
                        packageName:dataJson.config.package,
                    };
                    NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
                        $('#'+callback.data.id).removeAttr('disabled');
                        if(res.success){
                            var resData = res[ajaxOptions.dataSrc];
                            var btnFunctionConfig = ajaxOptions.plusData.btnFunctionConfig;
                            var titleStr = btnFunctionConfig.title;
                            var url = btnFunctionConfig.url;
                            var tempValueName = ajaxOptions.plusData.packageName + new Date().getTime();
                            NetstarTempValues[tempValueName] = {templateDataByAjax:resData};
                            url = url+'?templateparam=' + encodeURIComponent(tempValueName);
                            NetstarUI.labelpageVm.loadPage(url,titleStr,true);
                        }
                    },true);
                }
                if(isUseConfirm){
                    nsconfirm(controllerObj.beforeTitle,function(isDelete){
                        if(isDelete){
                            getAjaxHandler();
                        }else{
                            if($('#'+callback.data.id).length == 1){
                                $('#'+callback.data.id).removeAttr('disabled');
                            }
                        }
                    },'warning')
                }else{
                    getAjaxHandler();
                }
            }

            function ajaxAndPdfInit(callback,obj){
                var controllerObj = obj.controllerObj;
                var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
                var dataJson = {};
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
                }
                var templateConfig = dataJson.config;
                var value = dataJson.value;//获取value值
                if(functionConfig.url){
                    var ajaxConfig = {
                        url:functionConfig.url,
                        type:functionConfig.type,
                        contentType:functionConfig.contentType,
                        dataSrc:functionConfig.dataSrc,
                        plusData:{
                            packageName:templateConfig.package,
                            ajaxAfterHandler:callback.ajaxAfterHandler,
                            valueData:value,
                            fileField:functionConfig.fileField
                        },
                    };
                    ajaxConfig.data = NetStarUtils.getFormatParameterJSON(functionConfig.data,value);
                    NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
                        if(res.success){
                            var fileField = ajaxOptions.plusData.fileField;
                            var ptTemplateConfig = NetstarTemplate.templates.configs[ajaxOptions.plusData.packageName];
                            var ptTemplateValueData = ajaxOptions.plusData.valueData;
                            var resData = res[ajaxOptions.dataSrc];
                            fileField = JSON.parse(fileField);
                            var innerParams = NetStarUtils.getFormatParameterJSON(fileField,resData);
                            var urlParams = '';
                            for(var innerI in innerParams){
                                urlParams = innerParams[innerI];
                            }
                            //调整为修改了pdf的域名，改为直接调用打印 cy 191219  调用PDF的地址从 qaapi. 改为当前域名
                            if(window.location.protocol == 'http:'){
                                //原有代码是打开window再打印 当本地使用时候会仍然使用当前方式
                                nsalert('当前访问方式不支持PDF直接打印, 需要正式发布后支持','warning');
                                console.warn('当前访问方式不支持PDF直接打印，需要正式发布后支持');
                                var url = NetStarUtils.getStaticUrl()+'/files/pdf/'+urlParams+'?Authorization='+NetStarUtils.OAuthCode.get();
                                window.open(url);
                            }else if(window.location.protocol == 'https:'){
                                var url = NetStarUtils.getStaticUrl() + '/files/pdf/'+urlParams+'?Authorization='+NetStarUtils.OAuthCode.get();
                                if($('#iframe-print').length > 0){
                                    $('#iframe-print').remove();
                                }
                                $('body').append('<iframe id="iframe-print" style="display:none; visibility:hidden;" src="' + url + '"></iframe>')
                                $("#iframe-print")[0].contentWindow.print();
                            }
                        }else{
                            nsalert('返回值为false','error');
                        }
                    },true)
                }
            }
        
            function excelExportInit(callback,obj){
                var controllerObj = obj.controllerObj;
                var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
                var dataJson = {};
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
                }
                var templateConfig = dataJson.config;
                var value = dataJson.value;//获取value值
                var targetField = controllerObj.targetField;
                var currentGridConfig = {};
                var isCountExport = false;
                switch(templateConfig.template){
                    case 'businessDataBase':
                        if(!$.isEmptyObject(templateConfig.mainComponent)){
                            currentGridConfig = templateConfig.mainComponent;
                        }else{
                            currentGridConfig = templateConfig.components[0];
                        }
                        break;
                    case 'docListViewer':
                        currentGridConfig = templateConfig.mainComponent;
                        if(targetField){
                            for(var gridId in templateConfig.componentsConfig.list){
                                var gJson = templateConfig.componentsConfig.list[gridId];
                                if(gJson.keyField == targetField){
                                    currentGridConfig = gJson;
                                    break;
                                }	
                            }
                        }
                        break;
                    case 'businessDataBaseLevel3':
                        break;
                    case 'statisticsList':
                        if(templateConfig.mode == 'countList'){
                            isCountExport = true;
                            currentGridConfig = templateConfig.components[0];
                        }
                        break;
                }
                if(!$.isEmptyObject(currentGridConfig)){
                    var exportXlsJson = {
                        id:currentGridConfig.id
                    };
                    if(functionConfig.ext){
                        exportXlsJson.ext = functionConfig.ext;
                    }
                    if(functionConfig.excelName){
                        exportXlsJson.excelName = functionConfig.excelName;
                    }
                    if(functionConfig.requestSource){
                        exportXlsJson.requestSource = functionConfig.requestSource;
                    }
                    if(isCountExport){
                        NetstarUI.exportXls.initByCount(exportXlsJson);
                    }else{
                        NetstarUI.exportXls.init(exportXlsJson);
                    }
                }
            }
            function wxtPrintInit(callback,obj){
                var storeName = '';
                // 发送打印消息
                function sendWxtPrintInfo(printInfo){
                    printInfo.page = typeof(printInfo.page) == "undefined" ? '' : printInfo.page;
                    printInfo.pageNumber2 = typeof(printInfo.pageNumber2) == "undefined" ? '' : printInfo.pageNumber2;
                    var message = {
                        userId : NetstarMainPage.systemInfo.user.userId,
                        printUserId : printInfo.userId,
                        action : printInfo.action,
                        fileIds : printInfo.fileIds,
                        printerId : printInfo.id,
                        printType : printInfo.type,
                        paperType : "1",
                        page : printInfo.page+','+printInfo.pageNumber2,
                        copies : "10",
                        layout : "1",
                        btnId : printInfo.btnId,
                        storeName : storeName,
                    };
                    var messageStr = JSON.stringify(message);
                    NetStarRabbitMQ.printSend(message.printUserId, messageStr);
                }
                // 获取打印消息
                function getPrintMessage(printInfos, otherInfo){
                    var arr = [];
                    for(var i=0; i<printInfos.length; i++){
                        var pageLength = '1';
                        var layout = '1';
                        if(!isNaN(Number(printInfos[i].pageLength))){
                            pageLength = printInfos[i].pageLength;
                        }
                        if(printInfos[i].layout === "0"){
                            layout = "0";
                        }
                        var page = '';
                        if(typeof(printInfos[i].page) != "undefined"){
                            page = printInfos[i].page + ',';
                        }
                        if(typeof(printInfos[i].pageNumber2) != "undefined"){
                            page += printInfos[i].pageNumber2;
                        }
                        var obj = {
                            fileIds : printInfos[i].fileIds,
                            printerId : printInfos[i].id,
                            printType : printInfos[i].type,
                            // paperType : "1",
                            paperType : printInfos[i].defaultPaperType,
                            page : page,
                            copies : pageLength,
                            layout : layout,
                        }
                        arr.push(obj);
                    }
                    var message = {
                        action : otherInfo.action,
                        trayUserId : printInfos[0].userId,
                        senderUserId : NetstarMainPage.systemInfo.user.userId,
                        printSubtask : arr,
                        btnsConfigName : otherInfo.btnsConfigName,
                        btnIndex : otherInfo.btnIndex,
                        printTaskNo : otherInfo.btnsConfigName + '-' + otherInfo.btnIndex + '-' + otherInfo.btntimeStamp,
                    }
                    console.log(message);
                    return message;
                }
                // 改变按钮状态
                function changeBtnsState($btnDom, isDisable){
                    if(isDisable){
                        var $btns = $btnDom.parent().children('button:not([ajax-disabled="true"])');
                        $btns.attr('ajax-disabled',true);
                        $btns.attr('disabled',true);
                    }else{
                        var $btns = $btnDom.parent().children('button[ajax-disabled="true"]');
                        $btns.removeAttr('ajax-disabled',true);
                        $btns.removeAttr('disabled',true);
                    }
                }
                // 获取发送ajax的data
                function getAjaxData(funcConfig, ajaxConfig, pageConfig){
                    var data = typeof(ajaxConfig.data)=='object' ? ajaxConfig.data : {};
                    var value = pageConfig.value;
                    if(funcConfig.dataFormat == 'id'){
                        if(pageConfig.btnOptionsConfig){
                            if(pageConfig.btnOptionsConfig.options){
                                if(pageConfig.btnOptionsConfig.options.idField){
                                    var idField = pageConfig.btnOptionsConfig.options.idField;
                                    data[idField] = value[idField];
                                }
                            }
                        }
                    }else{
                        if($.isEmptyObject(data)){
                            data = value;
                        }
                    }
                    // 转化对象
                    var pageOperateData = value;
                    if(typeof(NetstarTemplate.getOperateData) == "function"){
                        pageOperateData = NetstarTemplate.getOperateData(pageConfig.config);
                    }
                    data = NetStarUtils.getFormatParameterJSON(data, pageOperateData);
                    return data;
                }
                function getAjaxData2(funcConfig, ajaxConfig, pageConfig){
                    var data = typeof(ajaxConfig.data)=='object' ? ajaxConfig.data : {};
                    var value = pageConfig.value;
                    if(funcConfig.dataFormat == 'id'){
                        if(pageConfig.btnOptionsConfig){
                            if(pageConfig.btnOptionsConfig.options){
                                if(pageConfig.btnOptionsConfig.options.idField){
                                    var idField = pageConfig.btnOptionsConfig.options.idField;
                                    data[idField] = value[idField];
                                }
                            }
                        }
                    }else{
                        if($.isEmptyObject(data)){
                            data = value;
                        }else{
                            data = NetStarUtils.getFormatParameterJSON(data, value);
                        }
                    }
                    // 获取页面操作数据 用于多选 lyw 20200204 start ---
                    var operateData = {};
                    var formatValueData = funcConfig.formatValueData;
                    // 转化对象
                    if(typeof(formatValueData) == "string" && formatValueData.length>0){
                        formatValueData = JSON.parse(formatValueData);
                    }
                    if(typeof(formatValueData) == "object"){
                        var pageOperateData = {};
                        if(typeof(NetstarTemplate.getOperateData) == "function"){
                            pageOperateData = NetstarTemplate.getOperateData(pageConfig.config);
                        }
                        operateData = NetStarUtils.getFormatParameterJSON(formatValueData, pageOperateData);
                    }
                    for(var key in operateData){
                        if(typeof(data[key]) == "undefined"){
                            data[key] = operateData[key];
                        }
                    }
                    // 获取页面操作数据 用于多选 lyw 20200204 end ---
                    return data;
                }
                // 获取fileId数据
                function getFileData(funcConfig, fileField, pageConfig){
                    if(typeof(fileField) == "string"){
                        if(fileField.length > 0){
                        }else{
                            console.error('没有配置文件字段请检查配置');
                            nsAlert('没有配置文件字段请检查配置', 'error');
                            console.error(funcConfig);
                            return false;
                        }
                    }else{
                        console.error('没有配置文件字段请检查配置');
                        nsAlert('没有配置文件字段请检查配置', 'error');
                        console.error(funcConfig);
                        return false;
                    }
                    var descritute = pageConfig.btnOptionsConfig.descritute;
                    var operateKey = 'listChecked';
                    if(typeof(descritute.keyField) == "string"){
                        operateKey = descritute.keyField + 'Checked';
                    }
                    var pageOperateData = {};
                    if(typeof(NetstarTemplate.getOperateData) == "function"){
                        pageOperateData = NetstarTemplate.getOperateData(pageConfig.config);
                    }
                    pageOperateData = typeof(pageOperateData[operateKey]) == "object" ? pageOperateData[operateKey] : [];
                    var fileIds = '';
                    for(var i=0; i<pageOperateData.length; i++){
                        if(typeof(pageOperateData[i][fileField]) == "string" && pageOperateData[i][fileField].length > 0){
                            fileIds += pageOperateData[i][fileField] + ',';
                        }else{
                            console.error('没有找到fileId请检查行数据是否完整');
                            nsAlert('没有找到fileId请检查行数据是否完整', 'error');
                            console.error(pageOperateData, i);
                            fileIds = false;
                            break;
                        }
                    }
                    if(fileIds === ''){
                        console.error('没有找到fileId请检查是否选中行');
                        console.error(pageOperateData);
                        fileIds = false;
                    }
                    if(fileIds){
                        fileIds = fileIds.substring(0, fileIds.length-1);
                    }
                    return fileIds;
                }
                // 通过ajax获取fileId
                function getFileIdByAjax(funcConfig, ajaxConfig, pageConfig, plusData, callBackFunc){
                    var data = getAjaxData(funcConfig, ajaxConfig, pageConfig);
                    ajaxConfig.dataSrc = 'data';
                    ajaxConfig.data = data;
                    ajaxConfig.plusData = {
                        callBackFunc : callBackFunc,
                        fileField : funcConfig.fileField ? funcConfig.fileField : 'fileId',
                    };
                    if(typeof(plusData) == "object"){
                        ajaxConfig.plusData = $.extend(false, ajaxConfig.plusData, plusData);
                    }
                    NetStarUtils.ajax(ajaxConfig,function(res,ajaxOptions){
                        var plusData = ajaxOptions.plusData;
                        if(res.success){
                            var fileField = plusData.fileField;
                            var resData = res[ajaxOptions.dataSrc];
                            var fileIdsArr = [];
                            if(typeof(resData) != "object"){ resData = {}; }
                            if(!$.isArray(resData)){
                                resData = [resData];
                            }
                            for(var i=0; i<resData.length; i++){
                                if(resData[i][fileField]){
                                    fileIdsArr.push(resData[i][fileField]);
                                }
                            }
                            if(fileIdsArr.length == 0){
                                console.error('没有找到fileId,请检查返回数据');
                                nsalert('没有找到fileId,请检查返回数据', 'error');
                                return;
                            }
                            var fileIds = fileIdsArr.toString();
                            if(typeof(plusData.callBackFunc) == "function"){
                                plusData.callBackFunc(fileIds, plusData);
                            }
                        }
                    });
                }
                // 生成弹框
                function showDialog(isPreview, callBackFunc){
                    var dialogConfig = {
                        id:'btn-dialog-wxtprint',
                        title: '打印设置',
                        templateName: 'PC',
                        height:600,
                        width:'80%',
                        // defaultFooterHeight : 20,
                        plusClass:'pt-wxtprint-setting',
                        shownHandler:function(data){
                            if(typeof(callBackFunc) == "function"){
                                callBackFunc(data.config);
                            }
                        }
                    }
                    if(isPreview){
                        dialogConfig.defaultFooterHeight = 20;
                    }
                    NetstarComponent.dialogComponent.init(dialogConfig);
                }
                // 通过按钮发送消息并改变按钮text
                function sendMessageAndChangeBtn($clickBtn, printInfo, callBackFunc){
                    var textStr = $clickBtn.text();
                    var isTime = false;
                    if(textStr.indexOf('取消') == -1){
                        isTime = true;
                        printInfo.action = 'print';
                        $clickBtn.text('取消'+textStr);
                    }else{
                        printInfo.action = 'cancelPrint';
                        var valueTextStr = textStr.substring(2,textStr.length);
                        $clickBtn.text(valueTextStr);
                    }
                    sendWxtPrintInfo(printInfo);
                    // NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
                    if(nsProject.PRINTSETTIMEOUT){
                        clearTimeout(nsProject.PRINTSETTIMEOUT);
                    }
                    if(isTime){
                        nsProject.PRINTSETTIMEOUT = setTimeout(function(){
                            var _textStr = $clickBtn.text();
                            if(_textStr.indexOf('取消') == 0){
                                var _valueTextStr = _textStr.substring(2, _textStr.length);
                                $clickBtn.text(_valueTextStr);
                            }
                        },2000)
                    }
                    if(typeof(callBackFunc) == "function"){
                        callBackFunc();
                    }
                }
                // 获取打印机列表显示
                function getPrintList(callBackFunc){
                    var printAjax = {
                        src : getRootPath()+'/system/cloudPrints/getList',
                        data : {},
                        dataSrc : 'rows',
                        contentType : 'application/json',
                    }
                    NetStarUtils.ajax(printAjax, (function(_callBackFunc){
                        return function(res){
                            if(res.success){
                                var resList = res.rows;
                                var printTypeDict = typeof(nsVals.dictData['CLOUD_PRINT_TYPE']) == "object" && typeof(nsVals.dictData['CLOUD_PRINT_TYPE'].jsondata) == "object" ? nsVals.dictData['CLOUD_PRINT_TYPE'].jsondata : {};
                                var paperTypeDict = typeof(nsVals.dictData['DEFAULT_PAPER_TYPE']) == "object" && typeof(nsVals.dictData['DEFAULT_PAPER_TYPE'].jsondata) == "object" ?  nsVals.dictData['DEFAULT_PAPER_TYPE'].jsondata : {};
                                var list = [];
                                for(var i=0; i<resList.length; i++){
                                    var obj = $.extend(true, {}, resList[i]);
                                    var type = obj.type;
                                    var defaultPaperType = obj.defaultPaperType;
                                    var typeName = printTypeDict[type] ? printTypeDict[type] : '';
                                    var paperName = paperTypeDict[defaultPaperType] ? paperTypeDict[defaultPaperType] : '';
                                    obj.typeName = typeName;
                                    obj.paperName = paperName;
                                    list.push(obj);
                                }
                                if(typeof(_callBackFunc) == "function"){
                                    _callBackFunc(list);
                                }
                            }
                        }
                    })(callBackFunc));
                }
                // 初始化没有预览的设置打印机面板
                function initSetPrint(initConfig){
                    var dialogConfig = initConfig.dialogConfig;
                    // var fileIds = initConfig.fileIds;
                    var storeName = initConfig.storeName;
                    var btnStateObj = initConfig.btnStateObj;
                    var subIndex = btnStateObj.subIndex; // 设值的是第几条数据
                    var clickBtnId = initConfig.btnId;
                    var bodyId = dialogConfig.bodyId;
                    var footerId = dialogConfig.footerIdGroup;
                    var $body = $('#' + bodyId);
                    var storeData = getStore(storeName, subIndex);
                    var blockConfig = {
                        id : bodyId,
                        data : {
                            idField : 'id',
                            // src:getRootPath()+'/system/cloudPrints/getList',
                            // data:{},
                            // dataSrc:'rows',
                            // contentType: 'application/json',
                        },
                        ui : {
                            selectMode : "single",	
                            isHaveEditDeleteBtn : false,
                            listExpression: '<li class="pt-list-table">'
                                                +'<span class="title">打印机名称:{{name}}</span>'
                                                +'<span class="note">打印机类型:{{typeName}}</span>'
                                                +'<span class="page">默认纸张:{{paperName}}</span>'
                                            +'</li>',
                            defaultValueOption : {
                                value : [storeData],
                                idField : 'id',
                            },
                        },
                        columns : [],
                    }
                    getPrintList((function(_blockConfig, _storeData){
                        return function(list){
                            for(var i=0; i<list.length; i++){
                                if(list[i].id == _storeData.id){
                                    list[i].netstarSelectedFlag = true;
                                    break;
                                }
                            }
                            _blockConfig.data.dataSource = list;
                            NetstarBlockList.init(blockConfig);
                        }
                    })(blockConfig, storeData))
                    // NetstarBlockList.init(blockConfig);
                    var btnJson = {
                        id : footerId,
                        pageId:'btn-' + footerId,
                        btns:[
                            {
                                text:'确定',
                                handler:function(){
                                    //发送websocket
                                    var selectData = NetstarBlockList.getSelectedData(bodyId);//获取打印配置的值
                                    if(selectData.length == 0){
                                        console.error('没有选中打印机');
                                        nsalert('没有选中打印机', 'error');
                                        return false;
                                    }
                                    selectData = selectData[0];
                                    var printInfo = {
                                        id : selectData.id,
                                        userId : selectData.userId,
                                        type : selectData.type,
                                        printerId : selectData.id,
                                    }
                                    setStore(printInfo, storeName, subIndex);
                                    NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
                                    // store.set(bodyId, $.extend(true, {}, printInfo));
                                    // printInfo.btnId = clickBtnId;
                                    // printInfo.fileIds = fileIds;
                                    // var $clickBtn = $('#' + clickBtnId);
                                    // sendMessageAndChangeBtn($clickBtn, printInfo, function(){
                                    // 	NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
                                    // })
                                }
                            },{
                                text:'取消',
                                handler:function(){
                                    //关闭当前弹出框
                                    NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
                                }
                            }
                        ],
                    };
                    vueButtonComponent.init(btnJson);
                }
                // 设置打印机配置
                function setStore(storeContent, storeName, subIndex){
                    var storeData = store.get(storeName);
                    if(typeof(storeData) != "object"){
                        storeData = {};
                    }
                    storeData[subIndex] = storeContent;
                    store.set(storeName, storeData);
                }
                // 获取打印机配置
                function getStore(storeName, subIndex){
                    var storeData = store.get(storeName);
                    var res = {};
                    if(typeof(storeData) == "object" && typeof(storeData[subIndex]) == "object"){
                        res = storeData[subIndex];
                    }
                    return res;
                }
                // 获取打印机配置
                function getStoreAll(storeName){
                    var storeData = store.get(storeName);
                    if(typeof(storeData) != "object"){
                        storeData = {}
                    }
                    return storeData;
                }
                // 初始化打印预览设置面板
                function initPrintPreview(initConfig){
                    var dialogConfig = initConfig.dialogConfig;
                    var fileIds = initConfig.fileIds;
                    var storeName = initConfig.storeName;
                    var btnStateObj = initConfig.btnStateObj;
                    var subIndex = btnStateObj.subIndex; // 设值的是第几条数据
                    var clickBtnId = initConfig.btnId;
                    var bodyId = dialogConfig.bodyId;
                    var footerId = dialogConfig.footerIdGroup;
                    var $body = $('#' + bodyId);
                    // 按钮id
                    var btnId = 'btn-' + bodyId;
                    // 表单id
                    var voId = 'vo-' + bodyId;
                    // 预览id
                    var pdfId = 'pdf-' + bodyId;
                    var btnHtml = '<div class="pt-main-row">'
                                    +'<div class="pt-main-col">'
                                        +'<div class="pt-panel">'
                                            +'<div class="pt-container">'
                                                +'<div id="'+btnId+'" class="pt-components-btns"></div>'
                                            +'</div>'
                                        +'</div>'
                                    +'</div>'
                                +'</div>';
                    var voHtml = '<div class="pt-main-col wxtprint-left">'
                                        +'<div class="pt-panel">'
                                            +'<div class="pt-container">'
                                                +'<div id="'+voId+'" class="pt-components-vo"></div>'
                                            +'</div>'
                                        +'</div>'
                                    +'</div>';
                    var pdfHtml = '<div class="pt-main-col wxtprint-right">'
                                        +'<div class="pt-panel">'
                                            +'<div class="pt-container">'
                                                + '<div class="pt-components-pdf-title">预览</div>'
                                                +'<div id="'+pdfId+'" class="pt-components-pdf"></div>'
                                            +'</div>'
                                        +'</div>'
                                    +'</div>';
                    var html = '<div class="pt-main pt-wxtprint-panel">'
                                            // + btnHtml
                                            +'<div class="pt-main-row">'
                                                + voHtml
                                                + pdfHtml
                                            +'</div>'
                                        +'</div>';
                    $body.html(html);
                    // 计算预览文件容器高度
                    var bodyHeight = $body.innerHeight();
                    var $pdf = $('#' + pdfId);
                    var $pdfTitle = $pdf.prev();
                    var pdfTitleHeight = $pdfTitle.outerHeight();
                    var previewHeight = bodyHeight - pdfTitleHeight -20 - 20 - 34;
                    $pdf.height(previewHeight);
                    // 表单
                    var formConfig = {
                        id:voId,
                        templateName: 'form',
                        componentTemplateName: 'PC',
                        //defaultComponentWidth:'100%',
                        isSetMore:false,
                        plusClass:'pt-form-print',
                        form:[
                            {
                                id: 'printerId',
                                label: '目标打印机',
                                type: 'select',
                                textField: 'name',
                                valueField: 'id',
                                rules : 'required',
                                //inputWidth:450,
                                // ajaxConfig:{
                                // 	url:getRootPath()+'//system/cloudPrints/getList',
                                // 	src:getRootPath()+'//system/cloudPrints/getList',
                                // 	data:{},
                                // 	dataSrc:'rows',
                                // },
                                panelConfig:{
                                    height:300,
                                },
                                outputFields : {
                                    id : "{id}",
                                    userId : "{userId}",
                                    type : "{type}",
                                    defaultPaperType : "{defaultPaperType}",
                                },
                                // isObjectValue:true,
                                listExpression: '<li class="pt-list-table">'
                                                    +'<span class="title">打印机名称:{{name}}</span>'
                                                    +'<span class="note">打印机类型:{{typeName}}</span>'
                                                    +'<span class="page">默认纸张:{{paperName}}</span>'
                                                +'</li>',
                            },{
                                id:'page',
                                label:'页码',
                                type:'valuesInput',
                                format:'{this:9}-{pageNumber2:999}',
                            },{
                                id:'pageLength',
                                label:'份数',
                                type:'text',
                                rules : 'positiveInteger',
                            },{
                                id:'layout',
                                label:'打印方向',
                                type:'radio',
                                value : '1',
                                subdata : [
                                    {
                                        text : "横",
                                        value : "0",
                                    },{
                                        text : "竖",
                                        value : "1",
                                    }
                                ],
                            }
                        ],
                    };
                    var storeData = getStore(storeName, subIndex);
                    getPrintList((function(_formConfig, _storeData){
                        return function(list){
                            _formConfig.form[0].subdata = list;
                            NetstarComponent.formComponent.show(_formConfig, _storeData);
                        }
                    })(formConfig, storeData))
                    // NetstarComponent.formComponent.show(formConfig, storeData);
                    // 预览
                    var fileIdsArr = fileIds.split(',');
                    var pdfViewArr = [];
                    var stateUrl = NetStarUtils.getStaticUrl();
                    var token = NetStarUtils.OAuthCode.get();
                    for(var i=0; i<fileIdsArr.length; i++){
                        pdfViewArr.push({
                            url : stateUrl + '/files/pdf/' + fileIdsArr[i] + '?Authorization=' + token,
                            type : 'pdf',
                        })
                    }
                    var pdfViewConfig = {
                        id : pdfId,
                        isPrint : false,
                        url : pdfViewArr,
                    }
                    NetstarUI.multiPdfViewer.init(pdfViewConfig);
                    // 按钮
                    var btnJson = {
                        id : footerId,
                        pageId:'btn-' + footerId,
                        btns:[
                            {
                                text:'确定',
                                handler:function(){
                                    var printInfo = NetstarComponent.getValues(voId);//获取打印配置的值
                                    if(!printInfo){
                                        console.error('请检查表单配置');
                                        return false;
                                    }
                                    setStore(printInfo, storeName, subIndex);
                                    NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
                                }
                            },{
                                text:'取消',
                                handler:function(){
                                    //关闭当前弹出框
                                    NetstarComponent.dialog['btn-dialog-wxtprint'].vueConfig.close();
                                }
                            }
                        ],
                    };
                    vueButtonComponent.init(btnJson);
                }
                // 打印
                function printAndCancel(actionName, printList, controllerObj, dataJson, storeName, btnStateObj, callBackFunc){
                    if(!$.isArray(printList)){
                        printList = [printList];
                    }
                    var btnType = controllerObj.btnType;
                    var subIndex = btnStateObj.subIndex; // 设值的是第几条数据
                    var btnVueConfig = btnStateObj.btnsVue.vueConfigs[btnStateObj.index];
                    switch(btnType){
                        case 'print': // 打印
                        case 'preview': // 预览打印
                            var fileIds = getFileData(controllerObj, controllerObj.fileField, dataJson);
                            if(!fileIds){
                                break;
                            }
                            var storeData = getStoreAll(storeName);
                            // 判断打印的列表是否都存在配置 如果没有配置 报错不进行打印
                            var isAllSet = true;
                            for(var i=0; i<printList.length; i++){
                                if(typeof(storeData[printList[i].nsIndex]) == "undefined"){
                                    isAllSet = false;
                                }
                            }
                            if(!isAllSet){
                                nsAlert('请检查打印机是否全部配置','warning');
                                console.warn('请检查打印机是否全部配置');
                                break;
                            }
                            var printInfos = [];
                            for(var i=0; i<printList.length; i++){
                                var storeObj = storeData[printList[i].nsIndex];
                                storeObj.fileIds = fileIds;
                                printInfos.push(storeObj);
                            }
                            var btnVueConfig = btnStateObj.btnsVue.vueConfigs[btnStateObj.index];
                            var otherInfo = {
                                action : actionName,
                                btntimeStamp : btnVueConfig.timestamp,
                                btnsConfigName : btnStateObj.btnsVue.btnsConfigName,
                                btnIndex : btnStateObj.index,
                            }
                            var message = getPrintMessage(printInfos, otherInfo);
                            var messageStr = JSON.stringify(message);
                            NetStarRabbitMQ.printSend(message.trayUserId, messageStr);
                            if(typeof(callBackFunc) == "function"){
                                callBackFunc();
                            }
                            break;
                        case 'printAjax': // 发送ajax的打印 即 表格行上没有fileId字段
                        case 'previewAjax': // 发送ajax的预览打印 即 表格行上没有fileId字段
                            var storeData = getStoreAll(storeName);
                            // 判断打印的列表是否都存在配置 如果没有配置 报错不进行打印
                            var isAllSet = true;
                            for(var i=0; i<printList.length; i++){
                                if(typeof(storeData[printList[i].nsIndex]) == "undefined"){
                                    isAllSet = false;
                                }
                            }
                            if(!isAllSet){
                                nsAlert('请检查打印机是否全部配置','warning');
                                console.warn('请检查打印机是否全部配置');
                                break;
                            }
                            var printInfos = [];
                            for(var i=0; i<printList.length; i++){
                                var storeObj = storeData[printList[i].nsIndex];
                                storeObj.fileIds = fileIds;
                                printInfos.push(storeObj);
                            }
                            var currentAjaxIndex = 0;
                            
                            for(var i=0; i<printList.length; i++){
                                var ajaxConfig = $.extend(true, {}, printList[i].ajax); 
                                var _plusData = {
                                    ajaxIndex : i,
                                    storeName : storeName,
                                    btnStateObj : btnStateObj,
                                    printList : printList,
                                    printInfos : printInfos,
                                }
                                getFileIdByAjax(printList[i], ajaxConfig, dataJson, _plusData, (function(_printInfos, _actionName, _callBackFunc){
                                    return function(fileIds, plusData){
                                        currentAjaxIndex ++;
                                        _printInfos[plusData.ajaxIndex].fileIds = fileIds;
                                        if(currentAjaxIndex == plusData.printList.length){
                                            var btnVueConfig = plusData.btnStateObj.btnsVue.vueConfigs[plusData.btnStateObj.index];
                                            var otherInfo = {
                                                action : _actionName,
                                                btntimeStamp : btnVueConfig.timestamp,
                                                btnsConfigName : plusData.btnStateObj.btnsVue.btnsConfigName,
                                                btnIndex : plusData.btnStateObj.index,
                                            }
                                            var message = getPrintMessage(_printInfos, otherInfo);
                                            var messageStr = JSON.stringify(message);
                                            NetStarRabbitMQ.printSend(message.trayUserId, messageStr);
                                            if(typeof(_callBackFunc) == "function"){
                                                _callBackFunc();
                                            }
                                        }
                                    }
                                })(printInfos, actionName, callBackFunc))
                            }
                            break;
                    }
                }
                // 设置
                function setPrintInfo(controllerObj, storeName, btnStateObj){
                    var btnType = controllerObj.btnType;
                    var subIndex = btnStateObj.subIndex; // 设值的是第几条数据
                    switch(btnType){
                        case 'print': // 打印 没有预览所以不需要fileId
                        case 'printAjax': // 打印 没有预览所以不需要fileId
                            showDialog(false, function(dialogConfig){
                                var initConfig = {
                                    dialogConfig : dialogConfig,
                                    // fileIds : fileIds,
                                    btnId : btnId,
                                    storeName : storeName,
                                    btnStateObj : btnStateObj,
                                }
                                initSetPrint(initConfig);
                            });
                            break;
                        case 'preview': // 预览打印
                            var fileIds = getFileData(controllerObj, controllerObj.fileField, dataJson);
                            if(!fileIds){
                                break;
                            }
                            showDialog(true, function(dialogConfig){
                                var initConfig = {
                                    dialogConfig : dialogConfig,
                                    fileIds : fileIds,
                                    btnId : btnId,
                                    storeName : storeName,
                                    btnStateObj : btnStateObj,
                                }
                                initPrintPreview(initConfig);
                            });
                            break;
                        case 'previewAjax': // 发送ajax的预览打印 即 表格行上没有fileId字段
                            var btnVueConfig = stateObj.btnsVue.vueConfigs[stateObj.index];
                            var subPrint = $.extend(true, {}, btnVueConfig.dropdownSubdata[stateObj.subIndex]);
                            subPrint.nsIndex = stateObj.subIndex;
                            var ajaxConfig = $.extend(true, {}, subPrint.ajax); 
                            var _plusData = {
                                storeName : storeName,
                                btnStateObj : btnStateObj,
                            };
                            getFileIdByAjax(subPrint, ajaxConfig, dataJson, _plusData, function(fileIds, plusData){
                                showDialog(true, function(dialogConfig){
                                    var initConfig = {
                                        dialogConfig : dialogConfig,
                                        fileIds : fileIds,
                                        btnId : plusData.btnId,
                                        storeName : plusData.storeName,
                                        btnStateObj : plusData.btnStateObj,
                                    }
                                    initPrintPreview(initConfig);
                                });
                            })
                            break;
                    }
                }
                    
                //sjj 20200205 网星通打印
                var controllerObj = obj.controllerObj;
                var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
                var dataJson = {};
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
                }
                var pageConfig = callback.config;
                var package = pageConfig.package;
                var stateObj = callback.stateObj;
                var btnIndex = stateObj.index;
                var storeName = package + '-' + btnIndex;
                var btnId = callback.data.id;
                var eventFuncName = callback.eventFuncName;
                var btnVueConfig = stateObj.btnsVue.vueConfigs[stateObj.index];
                var btnConfig = stateObj.btnsVue.data[stateObj.index];
                switch(eventFuncName){
                        case 'click':
                            btnVueConfig.timestamp = new Date().getTime();
                        case 'clickCancel': // 点击按钮
                            var actionName = 'print';
                            if(eventFuncName == 'clickCancel'){
                                actionName = 'cancelPrint';
                            }
                            var selectList = stateObj.btnsVue.stateGetCheck(stateObj.index);
                            if(selectList.length == 0){
                                selectList = getStore(storeName, 'dropSelected');
                            }
                            if(selectList.length == 0 || $.isEmptyObject(selectList)){
                                nsAlert('没有选择打印模板及配置', 'warning');
                                console.warn('没有选择打印模板及配置');                                                                                                                                                                                                            
                                break;
                            }
                            printAndCancel(actionName, selectList, controllerObj, dataJson, storeName, stateObj, (function(_btnVueConfig, _eventFuncName, _functionConfig){
                                return function(){
                                    if(_eventFuncName == 'click'){
                                        _btnVueConfig.showType = 'loading';
                                        _btnVueConfig.loadingStyle = {
                                            width : '0%',
                                        }
                                        _btnVueConfig.loadingText = '0%';
                                        _btnVueConfig.showText = '取消打印';
                                    }else{
                                        _btnVueConfig.showType = 'default';
                                        _btnVueConfig.showText = functionConfig.text;
                                        _btnVueConfig.dropdownState = 'list';
                                    }
                                    _btnVueConfig.isShowDropdown = false;
                                }
                            })(btnVueConfig, eventFuncName, functionConfig))                                                                                                                                                                                                          
                            break;
                        case 'mouseover': // 移入
                            break;
                        case 'mouseout': // 移出
                            btnVueConfig.showType = 'default';
                            btnVueConfig.showText = functionConfig.text;
                            btnVueConfig.dropdownState = 'list';
                            btnVueConfig.isShowDropdown = false;
                            break;
                        case 'dropPrint': // 下拉打印
                            var subPrint = $.extend(true, {}, btnVueConfig.dropdownSubdata[stateObj.subIndex]);
                            subPrint.nsIndex = stateObj.subIndex;
                            printAndCancel('print', subPrint, controllerObj, dataJson, storeName, stateObj)
                            break;
                        case 'dropSet': // 点击设置
                            setPrintInfo(controllerObj, storeName, stateObj);
                            break;
                        case 'dropClick': // 点击下拉框
                            // setStore(storeContent, storeName, subIndex);
                            var selectList = stateObj.btnsVue.stateGetCheck(stateObj.index);
                            // var selectIndexArr = [];
                            // for(var i=0; i<selectList.length; i++){
                            // 	selectIndexArr.push(selectList[i].nsIndex);
                            // }
                            setStore(selectList, storeName, 'dropSelected');
                            break;
                        case 'dropdownShowBefore':
                            var selectList = getStore(storeName, 'dropSelected');
                            var dropdownSubdata = $.extend(true, [], btnVueConfig.dropdownSubdata);
                            for(var i=0; i<selectList.length; i++){
                                if(dropdownSubdata[selectList[i].nsIndex]){
                                    dropdownSubdata[selectList[i].nsIndex].isCurrent = true;
                                }
                            }
                            btnVueConfig.dropdownSubdata = dropdownSubdata;
                            break;
                }
                // var btnType = controllerObj.btnType;
                // switch(btnType){
                // 	case 'print': // 打印
                // 		var fileIds = getFileData(controllerObj, controllerObj.fileField, dataJson);
                // 		if(!fileIds){
                // 			break;
                // 		}
                // 		var storeId = 'dialog-btn-dialog-wxtprint-body';
                // 		var storeData = store.get(storeId);
                // 		if(storeData){
                // 			var printInfo = storeData;
                // 			printInfo.btnId = btnId;
                // 			printInfo.fileIds = fileIds;
                // 			var $clickBtn = $('#' + btnId);
                // 			sendMessageAndChangeBtn($clickBtn, printInfo);
                // 		}else{
                // 			showDialog(false, function(dialogConfig){
                // 				var initConfig = {
                // 					dialogConfig : dialogConfig,
                // 					fileIds : fileIds,
                // 					btnId : btnId,
                // 				}
                // 				initPrint(initConfig);
                // 			});
                // 		}
                // 		break;
                // 	case 'preview': // 预览打印
                // 		var fileIds = getFileData(controllerObj, controllerObj.fileField, dataJson);
                // 		if(!fileIds){
                // 			break;
                // 		}
                // 		showDialog(true, function(dialogConfig){
                // 			var initConfig = {
                // 				dialogConfig : dialogConfig,
                // 				fileIds : fileIds,
                // 				btnId : btnId,
                // 			}
                // 			initPrintPreview(initConfig);
                // 		});
                // 		break;
                // 	case 'printAjax': // 发送ajax的打印 即 表格行上没有fileId字段
                // 		if($btn){
                // 			changeBtnsState($btn, true);
                // 		}
                // 		var ajaxConfig = $.extend(true,{},functionConfig); 
                // 		getFileIdByAjax(controllerObj, ajaxConfig, dataJson, btnId, $btn, function(fileIds, plusData){
                // 			// showDialog(false, function(dialogConfig){
                // 			// 	var initConfig = {
                // 			// 		dialogConfig : dialogConfig,
                // 			// 		fileIds : fileIds,
                // 			// 		btnId : plusData.btnId,
                // 			// 	}
                // 			// 	initPrint(initConfig);
                // 			// });
                // 			var storeId = 'dialog-btn-dialog-wxtprint-body';
                // 			var storeData = store.get(storeId);
                // 			if(storeData){
                // 				var printInfo = storeData;
                // 				printInfo.btnId = plusData.btnId;
                // 				printInfo.fileIds = fileIds;
                // 				var $clickBtn = $('#' + plusData.btnId);
                // 				sendMessageAndChangeBtn($clickBtn, printInfo);
                // 			}else{
                // 				showDialog(false, function(dialogConfig){
                // 					var initConfig = {
                // 						dialogConfig : dialogConfig,
                // 						fileIds : fileIds,
                // 						btnId : plusData.btnId,
                // 					}
                // 					initPrint(initConfig);
                // 				});
                // 			}
                // 		})
                // 		break;
                // 	case 'previewAjax': // 发送ajax的预览打印 即 表格行上没有fileId字段
                // 		if($btn){
                // 			changeBtnsState($btn, true);
                // 		}
                // 		var ajaxConfig = $.extend(true,{},functionConfig); 
                // 		getFileIdByAjax(controllerObj, ajaxConfig, dataJson, btnId, $btn, function(fileIds, plusData){
                // 			showDialog(true, function(dialogConfig){
                // 				var initConfig = {
                // 					dialogConfig : dialogConfig,
                // 					fileIds : fileIds,
                // 					btnId : plusData.btnId,
                // 				}
                // 				initPrintPreview(initConfig);
                // 			});
                // 		})
                // 		break;
                // }
            }
            // lyw 导入
            function excelImportVer3(callback,obj){
                var controllerObj = obj.controllerObj;
                var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
                var dataJson = {};
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
                }
                var pageConfig = callback.config;
                var package = pageConfig.package;
                var stateObj = callback.stateObj;
                var btnIndex = stateObj.index;
                var storeName = package + '-' + btnIndex;
                var btnId = callback.data.id;
                var eventFuncName = callback.eventFuncName;
                var btnVueConfig = stateObj.btnsVue.vueConfigs[stateObj.index];
                var btnConfig = stateObj.btnsVue.data[stateObj.index];
                switch(eventFuncName){
                    case 'click':
                        btnVueConfig.timestamp = new Date().getTime();
                        // 暂时代码
                        var importInstructionsExpression = functionConfig.importInstructionsExpression;
                        if(!importInstructionsExpression){
                            importInstructionsExpression = '<div class="import-nstructions-list">'
                                                                + '<ul>'
                                                                    + '<li>按仓库导入商品</li>'
                                                                    + '<li>多次导入库存信息</li>'
                                                                    + '<li>商品编号和属性编号必填</li>'
                                                                + '</ul>'
                                                            + '</div>'
                        }
                        var importConfig = {
                            id : 'netstar-import-dialog',
                            expression : importInstructionsExpression,
                            confirmHandler : (function(_btnVueConfig, _eventFuncName, _functionConfig){
                                return function(data){
                                    console.log(data);
                                    _btnVueConfig.showType = 'loading';
                                    _btnVueConfig.loadingStyle = {
                                        width : '0%',
                                    }
                                    _btnVueConfig.loadingText = '0%';
                                    _btnVueConfig.showText = '取消导入';
                                    _btnVueConfig.isShowDropdown = false;
                                }
                            })(btnVueConfig, eventFuncName, functionConfig),
                        };
                        NetstarExcelImportVer3.init(importConfig);
                        break;
                    case 'clickCancel': // 点击按钮
                        // var actionName = 'import';
                        // if(eventFuncName == 'clickCancel'){
                        // 	actionName = 'cancelImport';
                        // }       
                        btnVueConfig.showType = 'default';
                        btnVueConfig.showText = functionConfig.text;
                        btnVueConfig.dropdownState = 'list';
                        btnVueConfig.isShowDropdown = false;                                                                                                                                                                                
                        break;
                    case 'mouseover': // 移入
                        break;
                    case 'mouseout': // 移出
                        btnVueConfig.showType = 'default';
                        btnVueConfig.showText = functionConfig.text;
                        btnVueConfig.dropdownState = 'list';
                        btnVueConfig.isShowDropdown = false;
                        break;
                    case 'details': // 点击设置
                        var importConfig = {
                            type : 'details',
                            title : '导入详情',
                            id : 'netstar-import-details-dialog',
                            infos : {
                                addNum : 10,
                                updateNum : 15,
                                errorNum : 5,
                            }
                        };
                        NetstarExcelImportVer3.init(importConfig);
                        break;
                }
            }
            // lyw 导出
            function excelExportVer3(callback,obj){
                var controllerObj = obj.controllerObj;
                var functionConfig = obj.controllerObj.func.config;//按钮的配置参数
                var dataJson = {};
                if(typeof(callback.dialogBeforeHandler)=='function'){
                    dataJson = callback.dialogBeforeHandler(callback);//获取当前按钮所在界面的配置
                }
                var pageConfig = callback.config;
                var package = pageConfig.package;
                var stateObj = callback.stateObj;
                var btnIndex = stateObj.index;
                var storeName = package + '-' + btnIndex;
                var btnId = callback.data.id;
                var eventFuncName = callback.eventFuncName;
                var btnVueConfig = stateObj.btnsVue.vueConfigs[stateObj.index];
                var btnConfig = stateObj.btnsVue.data[stateObj.index];
                switch(eventFuncName){
                    case 'click':
                        btnVueConfig.timestamp = new Date().getTime();
                        btnVueConfig.showType = 'loading';
                        btnVueConfig.loadingStyle = {
                            width : '0%',
                        }
                        btnVueConfig.loadingText = '0%';
                        btnVueConfig.showText = '取消导入';
                        btnVueConfig.isShowDropdown = false;
                        break;
                    case 'clickCancel': // 点击按钮
                        // var actionName = 'import';
                        // if(eventFuncName == 'clickCancel'){
                        // 	actionName = 'cancelImport';
                        // }       
                        btnVueConfig.showType = 'default';
                        btnVueConfig.showText = functionConfig.text;
                        btnVueConfig.dropdownState = 'list';
                        btnVueConfig.isShowDropdown = false;                                                                                                                                                                                
                        break;
                    case 'mouseover': // 移入
                        break;
                    case 'mouseout': // 移出
                        btnVueConfig.showType = 'default';
                        btnVueConfig.showText = functionConfig.text;
                        btnVueConfig.dropdownState = 'list';
                        btnVueConfig.isShowDropdown = false;
                        break;
                }
            }

        },
        init : function(btns){
            for(var i=0; i<btns.length; i++){
                var _currentBtnConfig = btns[i];
                var currentBtnConfig = _currentBtnConfig;
                if(typeof(_currentBtnConfig.functionConfig) == "object"){
                    currentBtnConfig = $.extend(true, {}, _currentBtnConfig.functionConfig);
                }
                if(typeof(_currentBtnConfig.btn) == "object"){
                    currentBtnConfig = $.extend(true, currentBtnConfig, _currentBtnConfig.btn);
                }
                delete currentBtnConfig.isReturn;
                var btnConfig = $.extend(true, {}, currentBtnConfig);
                btnConfig = funcManage.getConfig(btnConfig);
                var commonFunc = funcManage.getCommonFunc(btnConfig);
                btnConfig.func = {
                    config:$.extend(true, {}, btnConfig),
                    function:commonFunc,
                };
                funcManage.setFuncByDefaultMode(btnConfig);
                var userMode = btnConfig.userMode;
                var func;
                if(typeof(userMode) == "string"){
                    func = btnConfig.func[userMode];
                }else{
                    func = btnConfig.func.function;
                }
                //判断按钮名称如果没有设置就取默认(这里需要添加按钮默认显示)
                var btnName = typeof(btnConfig.text) == 'string' ? btnConfig.text : '按钮默认展现形式';
                var btnFuncConfig = {
                    functionConfig: $.extend(true, {}, btnConfig.func.config),
                    btn:{
                        text: btnName,
                        isReturn: true,
                        handler: func
                    }
                }
                btns[i] = btnFuncConfig;
            }
        },
        init2 : function(btns){
            for(var i=0; i<btns.length; i++){
                var currentBtnConfig = btns[i];
                var sourceBtnConfig = $.extend(true, {}, currentBtnConfig.functionConfig);
                var btnConfig = funcManage.getConfig(sourceBtnConfig);
                var commonFunc = funcManage.getCommonFunc(btnConfig);
                sourceBtnConfig.func = {
                    config:btnConfig,
                    function:commonFunc,
                };
                funcManage.setFuncByDefaultMode(sourceBtnConfig);
                var userMode = sourceBtnConfig.userMode;
                if(typeof(userMode) == "string"){
                    currentBtnConfig.btn.handler = sourceBtnConfig.func[userMode];
                }else{
                    currentBtnConfig.btn.handler = sourceBtnConfig.func.function;
                }
            }
        },
    }
    // config
    var configManage = {
        validate : function(config){
            if(typeof(config) != "object"){ 
                console.error('config配置错误'); 
                nsAlert('config配置错误', 'error'); 
                return false; 
            };
            if(typeof(config.package) != "string"){ 
                console.error('config未配置package'); 
                nsAlert('config未配置package', 'error'); 
                return false; 
            }
            if(!$.isArray(config.components)){
                console.error('config配置components必须是数组,请检查配置是否正确');
                nsAlert('config配置components必须是数组,请检查配置是否正确', 'error');
                return false; 
            }
            var components = config.components;
            for(var i=0; i<components.length; i++){
                if(components[i] === false){
                    console.error('config配置错误，请检查是否权限问题');
                    nsAlert('config配置错误，请检查是否权限问题', 'error');
                    return false;
                }
            }
            return true;
        },
    }
    function clearAllNullStr(config){
        function func(obj) {
            if(typeof(obj) == "object"){
                if($.isArray(obj)){
                    for(var i=0; i<obj.length; i++){
                        for(var key in obj[i]){
                            if(typeof(obj[i][key]) == "object"){
                                func(obj[i][key]);
                            }else{
                                if(obj[i][key] === ''){
                                    delete obj[i][key];
                                }
                            }
                        }
                    }
                }else{
                    for(var key in obj){
                        if(typeof(obj[key]) == "object"){
                            func(obj[key]);
                        }else{
                            if(obj[key] === ''){
                                delete obj[key];
                            }
                        }
                    }
                }
            }
        }
        func(config);
    }
    function init(_config){
        // 验证
        var isPass = configManage.validate(_config);
        if(!isPass){
            return false;
        }
        var config = $.extend(true, {}, _config);
        configs[config.package] = {
            source : $.extend(true, {}, config),
            config : config,
        }
        var components = config.components;
        for(var i=0; i<components.length; i++){
            var comType = components[i].type;
            var fields = components[i].field;
            // 没有fields的面板component不需要状态处理
            if(typeof(fields) == "undefined"){
                continue;
            }
            switch(comType){
                case 'btns':
                    funcManage.init(fields);
                    break;
                default:
                    fieldManager.init(fields, comType);
                    break;
            }
        }
        if(typeof(config.getValueAjax) == "object"){
            if(typeof(config.getValueAjax.data) == "string" &&　config.getValueAjax.data.length > 0){
                config.getValueAjax.data = JSON.parse(config.getValueAjax.data);
            }
            if(typeof(config.getValueAjax.url) != "string" ||　config.getValueAjax.url.length == 0){
                delete config.getValueAjax;
            }else{
                if(config.getValueAjax.isUseGetRootPath){
                    config.getValueAjax.url = getRootPath() + config.getValueAjax.url;
                }
                config.getValueAjax.src = config.getValueAjax.url;
            }
        }
        if(typeof(config.saveData) == "object"){
            if(typeof(config.saveData.data) == "string" &&　config.saveData.data.length > 0){
                config.saveData.data = JSON.parse(config.saveData.data);
            }
            if(typeof(config.saveData.url) != "string" ||　config.saveData.url.length == 0){
                delete config.saveData;
            }else{
                if(config.saveData.isUseGetRootPath){
                    config.saveData.url = getRootPath() + config.saveData.url;
                }
                config.saveData.src = config.saveData.url;
                var ajaxConfig = $.extend(true, {}, config.saveData);
                config.saveData.ajax = ajaxConfig;
            }
        }
        // 删除所有 ''
        clearAllNullStr(config);
        return config;
    }
    function getFormatPageConfig(pageParams){
        function isOnlyCodeFun(obj){
            var isOnlyCode = true;
            for(var key in obj){
                if(key != 'data_auth_code'){
                    isOnlyCode = false;
                }
            }
            return isOnlyCode;
        }
		var pageData = {};
        var pageConfig = pageParams.pageConfig;
		//原始的页面配置参数
		pageData.sourceConfig = $.extend(true, {}, pageConfig);
        //执行过的页面配置参数
        var pageConfig = init(pageConfig)
        pageData.config = pageConfig;
        if(!pageData.config){
            nsAlert('获取页面数据错误','error');
            console.error('获取页面数据错误');
            console.error(pageConfig);
            return false;
        }

		// 根据面板类型添加固定属性 uploadCover添加固定的ajax
		if($.isArray(pageConfig.components) && pageConfig.components.length){
			var components = pageConfig.components;
			for(var componentI=0; componentI<components.length; componentI++){
				if(components[componentI].type == "uploadCover"){
					// var url = voSourceJSON[voName].system.prefix.url;
					// if(typeof(voSourceJSON[voName].system.prefix.url)=='undefined'){
					// 	url = getRootPath();
					// }
					var url = getRootPath();
					//默认上传图片地址
					//url += '/attachment/upload';
					//files/upload  单文件上传
					url += '/files/uploadList';//批量上传
					components[componentI].ajax = {
						src: url,
						type:'POST',
					};
					components[componentI].readSrcAjax = {
						src:getRootPath()+'/files/images',
					};//读取图片路径
				}
			}
		}
        // lyw 20200310 缓存当前config  当前config已经执行完nsProject.init,没有处理页面参和矩阵参
		var cachePageConfig = {};
		for(var key in pageConfig){
			if(typeof(pageConfig[key]) == "object" && key != "components"){
				cachePageConfig[key] = $.extend(true, {}, pageConfig[key]);
			}else{
				cachePageConfig[key] = pageConfig[key];
			}
		}
		var pageIidenti = pageParams.pageIidenti;
		if(typeof(pageProperty.cachePageData[pageIidenti]) == "object"){
            pageProperty.cachePageData[pageIidenti].sourceConfig = pageData.sourceConfig;
			pageProperty.cachePageData[pageIidenti].pageConfig = cachePageConfig;
		}
		// 菜单功能点矩阵参数
		pageData.sourceFunctionPointObj = pageParams.functionPointObj;
		if(pageParams.functionPointObj){
			pageData.functionPointObj = JSON.parse(pageParams.functionPointObj);
			if(!$.isEmptyObject(pageData.functionPointObj)){
				pageData.config.matrixVars = $.extend(true,{},pageData.functionPointObj);
			}
		}

		// 弹出页面时当前页面参数
		pageData.sourceParamObj = pageParams.templateParam;
		if(pageParams.templateParam){
			//sjj 20190327 读取界面来源参
			if(NetstarTempValues[pageParams.templateParam]){
				var tempValueName = pageParams.templateParam;
				pageParams.templateParam = decodeURIComponent(pageParams.templateParam);
				pageData.templateParam = NetstarTempValues[tempValueName];
				delete NetstarTempValues[tempValueName];
			}else{
				pageParams.templateParam = decodeURIComponent(decodeURIComponent(pageParams.templateparam));
				pageData.templateParam = JSON.parse(pageParams.templateParam);
			}
			// 判断getValueAjax是否存在
			var isOnlyCode = isOnlyCodeFun(pageData.templateParam);
			if(isOnlyCode){
				// delete pageData.config.getValueAjax;
			}
			// 当前页面参数赋值给config
			// pageData.config.pageParam = pageData.paramObj;
		}else{
			// delete pageData.config.getValueAjax;
		}

		// 判断 templateParam/functionPointObj 都不为空时合并
		pageData.mergeParameters = {};
		if(!$.isEmptyObject(pageData.templateParam)){
			pageData.mergeParameters = pageData.templateParam;
		}
		if(!$.isEmptyObject(pageData.functionPointObj)){
			var functionPointObj = pageData.functionPointObj
			for(var key in functionPointObj){
				pageData.mergeParameters[key] = functionPointObj[key];
			}
        }
        
		if(!$.isEmptyObject(pageData.mergeParameters)){
			// 当前页面参数赋值给config
            // pageData.config.pageParam = pageData.mergeParameters;
            for(var key in pageData.mergeParameters){
                pageData.config.pageParam[key] = pageData.mergeParameters[key];
            }
		}else{
			// delete pageData.config.getValueAjax;
        }
        if($.isEmptyObject(pageData.config.pageParam)){
			delete pageData.config.getValueAjax;
		}
		// 判断getValueAjax是否存在
		var isOnlyCode = isOnlyCodeFun(pageData.config.pageParam);
		if(isOnlyCode){
			delete pageData.config.getValueAjax;
		}
		
		// 权限码
		var data_auth_code = pageParams.data_auth_code; 
		// 判断页面的权限码不存在时 读取 当前页面参数的权限码
		if(pageParams.data_auth_code == ''){
			if(pageData.templateParam){
				if(typeof(pageData.templateParam.data_auth_code)=='string' && pageData.templateParam.data_auth_code != ''){
					data_auth_code = pageData.templateParam.data_auth_code;
				}
			}
		}
		pageData.config.data_auth_code = data_auth_code; //
		pageData.data_auth_code = data_auth_code; // 有用的权限码
		pageData.source_data_auth_code = pageParams.data_auth_code; // 原始的权限码
		
		//保存值用于查看信息
		// pageProperty.pageSourceObj = pageData;
		var package = pageData.config.package; // 包名
		pageProperty.pageSourceObj[package] = pageData;
        // 处理矩阵参数
        if(typeof(pageData.config.pageParam)!="object"){
            pageData.config.pageParam = {};
        }
        if(pageData.config.data_auth_code != ''){
            pageData.config.pageParam.data_auth_code = pageData.config.data_auth_code;
        }
        delete pageData.config.matrixVars;
        delete pageData.config.data_auth_code;
        // 处理getValueAjaxpage
        if(typeof(pageData.config.getValueAjax)=="object"){
            if(typeof(pageData.config.getValueAjax.suffix)=="string"){
                pageData.config.getValueAjax.url = pageData.config.getValueAjax.suffix;
            }
        }
        pageData.config.pageInitCompleteHandler = function(config){
            var obj = {
                name : config.package,
                processId : config.pageParam.processId,
                activityId : config.pageParam.activityId,
                workitemId : config.pageParam.workItemId,
                activityName : config.pageParam.activityName,
                workflowType : config.pageParam.workflowType,
                templateConfig : config,
            }
            NetStarRabbitMQ.setTemplateSubscribe(obj);
        }
        return pageData.config;
    }
    return {
        configs : configs,
        init : init,
        getFormatPageConfig : getFormatPageConfig,
    }
})()

