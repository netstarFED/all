NetstarTemplate.tree = (function($){
    var configsById = {};
    // config管理
    var configManage = {
        // 验证配置
        validConfig : function(config){
            var isPass = true;
            if(typeof(config.id) != "string"){
                nsAlert('生成树面板失败，请检查是否配置容器id', 'error');
                console.error('成树面板失败，请检查是否配置容器id');
                console.error(config);
                isPass = false;
            }
            if(isPass){
                var id = config.id;
                if($('#' + id).length != 1){
                    nsAlert('生成树面板失败，请检查容器是否存在', 'error');
                    console.error('生成树面板失败，请检查容器是否存在');
                    console.error(config);
                    isPass = false;
                }
            }
            if(isPass){
                if($.isArray(config.list)){
                }else{
                    if(typeof(config.ajax) != "object"){
                        nsAlert('配置错误，请检查是否配置' + ajax , 'error');
                        console.error('配置错误，请检查是否配置' + ajax );
                        console.error(config);
                        isPass = false;
                    }
                    if(isPass){
                        if(typeof(config.ajax.url) != "string" && typeof(config.ajax.src) != "string"){
                            nsAlert('配置错误，请检查配置'+ajax+'是否正确', 'error');
                            console.error('配置错误，请检查配置'+ajax+'是否正确');
                            console.error(config);
                            isPass = false;
                        }
                    }
                }
            }
            return isPass;
        },
        // 设置默认配置
        setDefault : function(config){
            var defaultConfig = {
                idField : 'id',
                textField : 'name',
                parentField : 'parent',
                childField : 'children',
                title : '',         // 标题
                plusClass : '',     // 样式
                isTurnTree : false,      // list转tree 默认否
                isSearch : false,        // 是否允许搜索
                // height : '',            // 树高度
                // width : 240,            // 树高度
                isClickRoot : true,     // 是否默认选中根节点 单选
                width : 90,             // 默认90
                goBackRefresh : true,   // 返回时是否刷新
                // goBackRefreshHandler : function(){},// 返回之后执行的方法
            }
            nsVals.setDefaultValues(config, defaultConfig);
        },
        // 设置config配置
        setConfig : function(config){
            configManage.setDefault(config);
        },
        // 获取config
        getConfigById : function(id){
            return configsById[id] && configsById[id].config ? configsById[id].config : false;
        },
    }
    // 树数据管理
    var treeManage = {
        // 获取node列表
        getTreeNodeList : function(config){
            var treeNodes =  config.treeNodes;
            var nodeList = {};
            var level = 0;
            var childField = config.childField;
            var idField = config.idField;
            function resetData(resceiveData, level){
                for(var i = 0; i < resceiveData.length; i ++){
                    // 是否有子级
                    var isHaveChild = $.isArray(resceiveData[i][childField]);
                    nodeList[resceiveData[i][idField]] = resceiveData[i];
                    if(isHaveChild){
                        resetData(resceiveData[i][childField], ++level);
                    }
                }
            }
            resetData(treeNodes, level);
            return nodeList;
        },
        // 格式化树数据
        getFormatData : function(config){
            var treeNodes =  $.extend(true, [], config.treeData);
            // 设置树的子级 名称默认children
            var childField = config.childField;
            var level = 0;
            function resetData(resceiveData, level){
                for(var i = 0; i < resceiveData.length; i ++){
                    // 是否有子级
                    var isHaveChild = $.isArray(resceiveData[i][childField]);
                    resceiveData[i].isParent = isHaveChild;
                    // 如果有子级 设置子级
                    if(isHaveChild){
                        resetData(resceiveData[i][childField], ++level);
                    }
                }
            }
            resetData(treeNodes, level);
            return treeNodes;
        },
        // list转tree
        convertToTree : function(list, idField, parentField, childField, sortField){
            var idMap = {};
            for(var i = 0; i < list.length; i++){
                idMap[list[i][idField]] = list[i];
            }
            var result = [];
            for(var i = 0; i < list.length; i++){
                var row = list[i];	
                if(row[parentField] && idMap[row[parentField]]){
                    var parent = idMap[row[parentField]];
                    if(!$.isArray(parent[childField])){
                        parent[childField] = [];
                    }
                    parent.isParent = true;
                    parent[childField].push(row);
                }else{
                    result.push(row);
                }
            }
            // 排序
            for(var key in idMap){
                if($.isArray(idMap[key][childField])){
                    idMap[key][childField].sort(function(a, b){
                        return a[sortField] - b[sortField];
                    });
                }
            }
            // 设置选中
            function setCheck(node){
                node.checked = true;
                if($.isArray(node[childField])){
                    for(var i=0; i<node[childField].length; i++){
                        setCheck(node[childField][i]);
                    }
                }
                
            }
            for(var key in idMap){
                if(idMap[key].checked){
                    setCheck(idMap[key]);
                }
            }
            return result;
        },
        // 获取树数据
        getTreeData : function(config, callBackFunc){
            if(config.ajax && config.ajax.url){
                treeManage.getTreeDataByAjax(config, callBackFunc);
            }else{
                config.sourceList = $.extend(true, [], config.list);
                var treeData = [];
                if(config.isTurnTree){
                    treeData= treeManage.convertToTree(config.list, config.idField, config.parentField, config.childField, config.sortField);
                }else{
                    treeData = config.list;
                }
                config.treeData = treeData;
                var treeNodes = treeManage.getFormatData(config);
                config.treeNodes = treeNodes;
                config.nodeList = treeManage.getTreeNodeList(config);
                callBackFunc(config);
            }
        },
        // 通过ajax获取树数据
        getTreeDataByAjax : function(config, callBackFunc){
            var ajaxConfig = $.extend(true, {}, config.ajax);
            ajaxConfig.plusData = {
                id : config.id,
                dataSrc : ajaxConfig.dataSrc,
                callBackFunc : callBackFunc,
            };
            NetStarUtils.ajax(ajaxConfig, function(res, _ajaxConfig){
                var list = res;
                var plusData = _ajaxConfig.plusData;
                var id = plusData.id;
                var dataSrc = plusData.dataSrc;
                var _config = configManage.getConfigById(id);
                if(res.success){
                    if($.isArray(res[dataSrc])){
                        list = res[dataSrc];
                    }else{
                        nsAlert('返回值错误');
                        console.error('返回值错误');
                        console.error(res);
                        console.error(_config);
                    }
                }else{
                    nsAlert('返回值错误');
                    console.error('返回值错误');
                    console.error(res);
                    console.error(_config);
                    list = [];
                }
                _config.sourceList = $.extend(true, [], list);
                _config.list = list;
                var treeData = [];
                if(_config.isTurnTree){
                    treeData = treeManage.convertToTree(_config.list, _config.idField, _config.parentField, _config.childField, _config.sortField);
                }else{
                    treeData = _config.list;
                }
                _config.treeData = treeData;
                var treeNodes = treeManage.getFormatData(_config);
                _config.treeNodes = treeNodes;
                _config.nodeList = treeManage.getTreeNodeList(_config);
                if(typeof(plusData.callBackFunc) == "function"){
                    plusData.callBackFunc(_config);
                }
            })
        }
    }
    // 方法管理
    var funcManage = {
        // 取消节点选中
        calcelNodeSelected : function(id){
            var config = configManage.getConfigById(id);
            if(!config){
                nsAlert('取消选中失败，没有发现树配配置');
                console.error('取消选中失败，没有发现树配配置');
                return false;
            }
            var nodes = $.extend(true, [], config.listVue.nodes);
            for(var i=0; i<nodes.length; i++){
                nodes[i].selected = false;
            }
            config.listVue.nodes = nodes;
        },
        // 设置nodesList选中
        setNodeListSelected : function(nodeId, config){
            var nodeList = config.nodeList;
            var idField = config.idField;
            for(var key in nodeList){
                if(nodeList[key][idField] == nodeId){
                    nodeList[key].selected = true;
                }else{
                    nodeList[key].selected = false;
                }
            }
        },
        // 获取下一级节点
        getNextLevelNodes : function(node, config){
            var modes = false;
            var childField = config.childField;
            if(node.isParent){
                modes = node[childField];
            }
            return modes;
        },
        // 获取上一级节点 状态：是否是根节点
        getUpperLevelNodesAndState : function(nodes, config){
            var node = nodes[0];
            var state = 'root';
            var parentId = node[config.parentField];
            var parentNode = config.nodeList[parentId];
            var _parentId = parentNode[config.parentField];
            var _nodes = [parentNode];
            var _parentNode = config.nodeList[_parentId];
            if(_parentNode){
                _nodes = _parentNode[config.childField];
                state = 'child';
            }
            return {
                nodes : _nodes,
                state : state,
            };
        },
        // 获取当前列表的父节点
        getCurrentParentNode : function(nodes, config){
            var node = nodes[0];
            var parentId = node[config.parentField];
            var parentNode = config.nodeList[parentId];
            if(!parentNode){
                parentNode = false;
            }
            return parentNode;
        },
        // 设置选中节点
        setSelectedNode : function(nodeId, id){
            var config = configManage.getConfigById(id);
            if(!config){
                nsAlert('设置值失败，没有发现树配配置');
                console.error('设置值失败，没有发现树配配置');
                return false;
            }
            var nodes = $.extend(true, [], config.listVue.nodes);
            var idField = config.idField;
            for(var i=0; i<nodes.length; i++){
                if(nodes[i][idField] == nodeId){
                    nodes[i].selected = true;
                }else{
                    nodes[i].selected = false;
                }
            }
            funcManage.setNodeListSelected(nodeId, config);
            config.listVue.nodes = nodes;
        },
        // 获取选中节点
        getSelectedNode : function(id){
            var config = configManage.getConfigById(id);
            if(!config){
                nsAlert('获取值失败，没有发现树配配置');
                console.error('获取值失败，没有发现树配配置');
                return false;
            }
            var selectedNode = false;
            var nodeList = config.nodeList;
            for(var key in nodeList){
                if(nodeList[key].selected){
                    selectedNode = nodeList[key];
                    break;
                }
            }
            return selectedNode;
        },
    }
    // vue 管理
    var vueManage = {
        template : '<div class="mobile-tree" :style="styleObj">'
                        // 头部
                        + '<div class="mobile-tree-header">'
                            + '<div class="" :class="{hide:!isTitle}">{{title}}</div>'
                            + '<div class="{hide:isSearch}"></div>'
                        + '</div>'
                        // 内容
                        + '<div class="mobile-tree-body" :class="{\'no-data\':nodes.length==0}">'
                            + '<div :class="{readonly:!isUpperLevel,hide:nodes.length==0}" class="mobile-tree-level-return"  @click="upperLevel">上一级</div>'
                            + '<div class="mobile-level-selected" :class="{hide:!parentNode,selected:parentSelected}"  @click="clickParentNode">{{parentNode[textField]}}</div>'
                            + '<ul :class="{children:parentNode}">'
                                + '<li class="mobile-tree-item" v-for="(node,index) in nodes" :class="{parent:node.isParent,selected:node.selected}" @click="clickNode($event,node,index)">{{node[textField]}}</li>'
                            + '</ul>'
                        + '</div>'
                        // 尾部
                        + '<div class="mobile-tree-footer"></div>'
                    + '</div>',
        // 获取dom
        getHtml : function(){
            var html = vueManage.template;
            return html;
        },
        // 获取数据
        getData : function(config){
            var isTitle = typeof(config.title) == "string" && config.title.length > 0;
            var data = {
                nodes : config.treeNodes,
                isUpperLevel : false,
                textField : config.textField,
                isTitle : isTitle,
                title : config.title,
                isSearch : config.isSearch, // 此功能暂未开发
                parentNode : false,
                parentSelected : false,
                styleObj : {
                    width : config.width + 'px',
                }
            }
            if(config.isClickRoot){
                data.nodes[0].selected = true;
            }
            return data;
        },
        // 初始化
        init : function(config){
            // 获取并插入html
            var html = vueManage.getHtml(config);
            var id = config.id;
            var $container = $('#' + id);
            $container.html(html);
            // 获取data
            var data = vueManage.getData(config);
            // 初始化vue
            config.listVue = new Vue({
                el: '#' + id,
                data: data,
                watch: {
                },
                methods: {
                    upperLevel : function(ev){
                        this.parentSelected = false;
                        var isUpperLevel = this.isUpperLevel;
                        if(isUpperLevel == false){
                            return;
                        }
                        var nodes = this.nodes;
                        var nodesObj = funcManage.getUpperLevelNodesAndState(nodes, config);
                        var parentNodes = nodesObj.nodes;
                        var state = nodesObj.state;
                        if(state == "root"){
                            this.isUpperLevel = false;
                        }else{
                            this.isUpperLevel = true;
                        }
                        this.nodes = parentNodes;
                        this.parentNode = funcManage.getCurrentParentNode(parentNodes, config);
                        if(config.goBackRefresh){
                            var selectedNode = parentNodes[0];
                            funcManage.setSelectedNode(selectedNode[config.idField], config.id);
                            // 点击回调
                            if(typeof(config.clickHandler) == "function"){
                                var obj = {
                                    event : ev,
                                    treeNode : selectedNode,
                                    config : config,
                                }
                                config.clickHandler(obj);
                            }
                        }
                        if(typeof(config.goBackRefreshHandler) == "function"){
                            config.goBackRefreshHandler(config);
                        }
                    },
                    clickNode : function(ev, node, index){
                        // 点击回调
                        if(typeof(config.clickHandler) == "function"){
                            funcManage.setSelectedNode(node[config.idField], config.id);
                            var obj = {
                                event : ev,
                                treeNode : node,
                                config : config,
                            }
                            config.clickHandler(obj);
                        }
                        // 点击默认
                        var nodes = funcManage.getNextLevelNodes(node, config);
                        if(!nodes){
                            this.parentSelected = false;
                            return;
                        }
                        this.parentSelected = true;
                        this.isUpperLevel = true;
                        this.nodes = nodes;
                        this.parentNode = node;
                        funcManage.setNodeListSelected(node[config.idField], config);
                    },
                    clickParentNode : function(ev){
                        funcManage.calcelNodeSelected(config.id);
                        var parentNode = this.parentNode;
                        this.parentSelected = true;
                        funcManage.setNodeListSelected(parentNode[config.idField], config);
                        // 点击回调
                        if(typeof(config.clickHandler) == "function"){
                            var obj = {
                                event : ev,
                                treeNode : parentNode,
                                config : config,
                            }
                            config.clickHandler(obj);
                        }
                    },
                },
                mounted: function(){
                    if(config.isClickRoot){
                        var node = this.nodes[0];
                        if(typeof(config.clickHandler) == "function"){
                            var obj = {
                                treeNode : node,
                                config : config,
                            }
                            config.clickHandler(obj);
                        }
                    }
                }
            });
        },
    }
    function　init(config){
        var isPass = configManage.validConfig(config);
        if(!isPass){
            return;
        }
        configsById[config.id] = {
            source : $.extend(true, {}, config),
            config : config,
        };
        configManage.setConfig(config);
        treeManage.getTreeData(config, function(_config){
            vueManage.init(_config);
        });
    }
    return {
        configsById : configsById,
        init : init,
        getSelectedNode : funcManage.getSelectedNode,
    }
})(jQuery)