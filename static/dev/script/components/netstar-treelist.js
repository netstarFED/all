
var NetstarTreeList = {
   configs:{},//存储配置参数
   configManager:{
      getTreeConfig:function(_config){
         var editorConfig = _config.editorConfig;
         var treeListConfig = {
            containerId:_config.container,//容器id
            $container:$('#'+_config.container),//树容器
            treeId:'tree-'+_config.container,//树id
            idField : editorConfig.idField,//主键id
            textField : editorConfig.textField,//显示文本值
            parentField : 'parent',//父节点字段
            childField : 'children',//子节点
            isSearch : true,   //默认开启搜索
            ajax:_config.ajax,//树ajax调用
            async:editorConfig.isAsync,//同步or异步 
            height:$('#'+_config.container).outerHeight(),//树容器高度
            isRadio:true,//开启单选
            isCheck:false,//开启多选
            dataSource:editorConfig.dataSource,//可以直接赋值不通过ajax
            pageParam:{},//来源参
            // 上一次搜索参数
            prevSearch:{
               name:'',
               index:-1,
           },
           level:1,
           defaultPositionId:_config.defaultPositionId,//设置了默认定位节点id
         };
         if(typeof(treeListConfig.ajax.data)!='object'){
            treeListConfig.ajax.data = {};
         }
         if(!$.isEmptyObject(_config.pageParam)){
            if(_config.pageParam.keyword){
               treeListConfig.ajax.data.keyword = _config.pageParam.keyword;
               delete _config.pageParam.keyword;
            }
            treeListConfig.pageParam = _config.pageParam;//来源参
         }
         switch(editorConfig.selectMode){
            case 'checkbox':
            case 'multi':
               treeListConfig.isCheck = true;//支持多选
               break;
         }
         return treeListConfig;
      },//设置默认值
      getTreeHtml:function(_treeConfig){
         var html = '<ul class="ztree" id="' + _treeConfig.treeId + '" style="height:'+_treeConfig.height+'px;"></ul>';
         return html;
      }
   },//配置参数管理
   ztreeManager:{
      setOpenByNodeId:function(nodesList, id, _config){
         var idField = _config.idField;
         var parentField = _config.parentField;
         var searchNode = {};
         for(var i=0; i<nodesList.length; i++){
             if(nodesList[i][idField] == id){
                 searchNode = nodesList[i];
                 break;
             }
         }
         if($.isEmptyObject(searchNode)){
             nsAlert('打开节点不存在');
             console.error('打开节点不存在, 节点id:');
             console.error(id);
         }
         for(var i=0; i<nodesList.length; i++){
             nodesList[i].open = false;
         }
         function setOpen(parentId){
             if(!parentId){
                 return;
             }
             for(var i=0; i<nodesList.length; i++){
                 if(nodesList[i][idField] == parentId){
                     nodesList[i].open = true;
                     setOpen(nodesList[i][parentField]);
                     break;
                 }
             }
         }
         setOpen(searchNode[parentField]);
      },
      treeClickHanlder:function(node){

      },//节点单击事件
      treeCheckHandler:function(node){

      },//节点复选框单击事件
      ajaxCompleteHandler:function(data){

      },//ajax执行完成之后的事件
      ajaxByTree:function(_treeConfig){
         var ajaxConfig = $.extend(true,{},_treeConfig.ajax);
         ajaxConfig.data = NetStarUtils.getFormatParameterJSON(ajaxConfig.data, {});
         $.each(_treeConfig.pageParam,function(key,value){
            ajaxConfig.data[key] = value;
         })
         ajaxConfig.plusData = {
            containerId:_treeConfig.containerId,
            dataSrc:ajaxConfig.dataSrc,
         };
         NetStarUtils.ajax(ajaxConfig, function(res, _ajaxOptions){
             var plusData = _ajaxOptions.plusData;
             var containerId = plusData.containerId;
             var dataSrc = plusData.dataSrc;
             if(res.success){
                 var dataSource = res[dataSrc];
                 if(!$.isArray(dataSource)){dataSource = [];}
                 var treeConfig = NetstarTreeList.configs[containerId].treeConfig;
                 treeConfig.dataSource = dataSource;
                 NetstarTreeList.ztreeManager.ztreeInit(treeConfig);//初始化
             }else{
                nsalert('返回false','error');
             }
         })
      },//ajax执行tree
      getUrl:function(treeId,treeNode){
         var containerId = treeId.substring(5,treeId.length);
         var treeConfig = NetstarTreeList.configs[containerId].treeConfig;
         var parentId = 'parentId';
         var param = parentId+'='+treeNode.id;
         var paramUrl = config.url;
         return paramUrl + "?" + param;
      },//异步请求
      ajaxDataFilter:function(treeId, parentNode, responseData){
         var containerId = treeId.substring(5,treeId.length);
         var treeConfig = NetstarTreeList.configs[containerId].treeConfig;
         var allTreeData = responseData;
         if(typeof(treeConfig.ajax.dataSrc)=='string'){
            allTreeData = allTreeData[treeConfig.ajax.dataSrc];
         }
         return allTreeData;
      },//异步数据过滤
      treeDblClickHandler:function(event, treeId, treeNode){
         var containerId = treeId.substring(5,treeId.length);
         var config = NetstarTreeList.configs[containerId].config;
         if(typeof(config.doubleClickHandler)=='function'){
            config.doubleClickHandler(treeNode);  
         }
      },
      getSetting:function(_treeConfig){
         var _this = this;
         var setting = {
            data: {
                  simpleData: {
                     enable: true,
                     idKey: _treeConfig.idField,
                     pIdKey: _treeConfig.parentField,
                  },
                  key: {
                     children : _treeConfig.childField,
                     name : _treeConfig.textField,
                     url:'urlNullAndEmpty'  //防止url命名冲突 urlNullAndEmpty是不存在的返回值，所以很长
                  },
            },
            view : {
               expandSpeed: ""  
            },
            callback: {
               onClick: _this.treeClickHanlder,
               onCheck: _this.treeCheckHandler,
               onAsyncSuccess:_this.ajaxCompleteHandler,
               onDblClick:_this.treeDblClickHandler,
            }
         };
         if(_treeConfig.isCheck){
            //Y 属性定义 checkbox 被勾选后的情况；N 属性定义 checkbox 取消勾选后的情况；"p" 表示操作会影响父级节点；"s" 表示操作会影响子级节点。
            //开启了多选
            
            setting.check = {
					enable: true,
               chkboxType: { "Y": "s", "N": "s" },//只影响父级节点；取消勾选操作，只影响子级节点
               chkDisabledInherit : true,
               //chkboxType: { "Y": "", "N": "" }
				};
         }
         //false表示同步加载数据
         if(_treeConfig.async){
            setting.async = {
               enable:			true,
               url:			   _this.getUrl,
               dataFilter: 	_this.ajaxDataFilter,
               type:			   _treeConfig.ajax.type,
            }
         }
         return setting;
      },//获取ztree的配置
      getFormatData:function(_treeConfig){
         var zNodes =  $.extend(true, [], _treeConfig.dataSource);
         // 展开层数 默认不展开层
         var levelNumber = typeof(_treeConfig.level)=='number' ? _treeConfig.level : 0;
         if(levelNumber < 1){
            levelNumber = 0;
         }
         // 当前层级
         var level = 0;
         // 设置树的子级 名称默认children
         var childField = _treeConfig.childField;
         // 是否配置选中 配置选中字段时 节点默认的选中删除，不起作用
         var isHadCheck = typeof(_treeConfig.checkId) == 'string' && _treeConfig.checkId.length >0 ? true : false;
         function resetData(resceiveData,level){
             var isExpand = false; // 是否展开
             if(level < levelNumber){
                 isExpand = true;
             }
             for(var i = 0; i < resceiveData.length; i ++){
                 // 是否有子级
                 var isHaveChild = $.isArray(resceiveData[i][childField]);
                 // 是否展开
                 resceiveData[i].open = isExpand;
                 // 是否有子级
                 resceiveData[i].isParent = isHaveChild;
                 if(isHadCheck){
                     delete resceiveData[i].checked;
                 }
                 // 如果有子级 设置子级
                 if(isHaveChild){
                     resetData(resceiveData[i][childField], ++level);
                 }
             }
         }
         resetData(zNodes,level);
         return zNodes;
      },
      refreshZtree:function(_treeConfig,searchNode){
         $.fn.zTree.destroy(_treeConfig.treeId); //销毁
         $.fn.zTree.init(_treeConfig.$tree,_treeConfig.setting,_treeConfig.dataSource);//ztree初始化
         _treeConfig.ztreeObj = $.fn.zTree.getZTreeObj(_treeConfig.treeId);//获取ztree对象

         var idField = _treeConfig.idField;
         var zTree = _treeConfig.ztreeObj;
         var nodes = zTree.getNodes();
         var nodesList = zTree.transformToArray(nodes);
         for(var i=0; i<nodesList.length; i++){
             if(nodesList[i][idField] == searchNode[idField]){
                 searchNode = nodesList[i];
                 break;
             }
         }
         var $node = $('#' + searchNode.tId + '_a');
         $node.trigger('click');
         var position = $node.position();
         _treeConfig.$tree.scrollTop(position.top); // 移动到顶部 一般不会显示在顶部 原因滚动条没有那么长
      },
      ztreeInit:function(_treeConfig){
         $.fn.zTree.destroy(_treeConfig.treeId); //销毁
         _treeConfig.dataSource = this.getFormatData(_treeConfig);
         $.fn.zTree.init(_treeConfig.$tree,_treeConfig.setting,_treeConfig.dataSource);//ztree初始化
         _treeConfig.ztreeObj = $.fn.zTree.getZTreeObj(_treeConfig.treeId);//获取ztree对象


         if(_treeConfig.defaultPositionId){
            var ztreeObj = _treeConfig.ztreeObj;
            var allNodes = ztreeObj.getNodes();//获取所有节点
            var nodesList = ztreeObj.transformToArray(allNodes);//把节点并列输出
            var textField = _treeConfig.textField;//文本值定义的字段
            var idField = _treeConfig.idField;//id值定义的字段
            var searchNode = {};
            for(var i=0; i<nodesList.length; i++){
               var nodeId = nodesList[i][idField];
               if(nodeId === _treeConfig.defaultPositionId){
                  searchNode = nodesList[i];
               }
            }
            if(!$.isEmptyObject(searchNode)){
               //设置打开状态
               NetstarTreeList.ztreeManager.setOpenByNodeId(nodesList,searchNode[idField],_treeConfig);
               _treeConfig.dataSource = allNodes;
               NetstarTreeList.ztreeManager.refreshZtree(_treeConfig,searchNode);//初始化
            }
         }
         //var nodes = _treeConfig.ztreeObj.getNodes();
         //var nodesList = _treeConfig.ztreeObj.transformToArray(nodes);
      },//执行ztree的初始化
      init:function(_treeConfig){
         _treeConfig.$tree = $('#'+_treeConfig.treeId);
         _treeConfig.setting = this.getSetting(_treeConfig);//获取ztree调用配置参数
         if(_treeConfig.ajax){
            this.ajaxByTree(_treeConfig);//通过ajax请求方式初始化
         }else{
            if($.isArray(_treeConfig.dataSource)){
               this.ztreeInit(_treeConfig);
            }
         }
      }
   },//树调用配置参数
   queryManager:{
      getHtml:function(_queryConfig){
         return  '<div class="pt-container">'
                     +'<div class="pt-panel-row">'
                        +'<div class="pt-panel-col" id="'+_queryConfig.id+'">'
                        +'</div>'
                     +'</div>'
                  +'</div>';
      },//获取html
      confirmQuickQueryHandler:function(data){
         var formId = data.formId;
         var formJson = NetstarComponent.getValues(data.formId);//获取查询条件的值
         var treeConfig = NetstarTreeList.configs[data.gridId].treeConfig;//获取树配置参数
         var paramsData = {};
         if(formJson.filtermode == 'quickSearch'){
            //快速查询
            paramsData.keyword = formJson.filterstr;
         }else{
            //获取当前字段
            var queryConfig = NetstarComponent.config[formId].config[formJson.filtermode];
            if(!$.isEmptyObject(queryConfig)){
               if(formJson[formJson.filtermode]){
                  if(queryConfig.type == 'business'){	
                     switch(queryConfig.selectMode){
                        case 'single':
                           paramsData[formJson.filtermode] = formJson[formJson.filtermode][queryConfig.idField];
                           break;
                        case 'checkbox':
                           paramsData[formJson.filtermode] = formJson[formJson.filtermode][0][queryConfig.idField];
                           break;
                     }
                  }else{
                     paramsData[formJson.filtermode] = formJson[formJson.filtermode];
                  }
               }
               if(typeof(formJson[formJson.filtermode])=='number'){
                  paramsData[formJson.filtermode] = formJson[formJson.filtermode];
               }
               if(queryConfig.type == 'dateRangePicker'){
                  var startDate = formJson.filtermode+'Start';
                  var endDate = formJson.filtermode+'End';
                  paramsData[startDate] = formJson[startDate];
                  paramsData[endDate] = formJson[endDate];
               }
            }else{
               paramsData[formJson.filtermode] = formJson.filterstr;
            }
         }
         treeConfig.ajax.data = paramsData;
         NetstarTreeList.ztreeManager.ajaxByTree(treeConfig);
      },//确认查询
      customFilterRefreshBtnHandler:function(event){
         var $this = $(this);
         var queryId = $this.attr('containerid');
         var gridId = queryId.substring(6,queryId.length);
         NetstarTreeList.queryManager.confirmQuickQueryHandler({gridId:gridId,formId:queryId});
      },//点击查询
      queryInit:function(_queryConfig){
         var containerId = _queryConfig.id.substring(6,_queryConfig.id.length);
         var config = NetstarTreeList.configs[containerId].config;
         var formJson = {
            id:_queryConfig.id,
            formStyle:'pt-form-normal',
            plusClass:'pt-custom-query',
            isSetMore:false,
            form:_queryConfig.queryForm
         };
         formJson.completeHandler = function(obj){
            var buttonHtml = '<div class="pt-btn-group">'
                        +'<button type="button" class="pt-btn pt-btn-default pt-btn-icon" nstype="refresh" containerid="'+formJson.id+'"><i class="icon-search"></i></button>'
                     +'</div>';
            var $container = $('#'+formJson.id);
            $container.append(buttonHtml);
            $('button[containerid="'+formJson.id+'"]').off('click',NetstarTreeList.queryManager.customFilterRefreshBtnHandler);
            $('button[containerid="'+formJson.id+'"]').on('click',NetstarTreeList.queryManager.customFilterRefreshBtnHandler);
         }
         formJson.getPageDataFunc = function(){return config.pageParam}
         var component2 = NetstarComponent.formComponent.getFormConfig(formJson);
         for(var component in component2.component){
            var elementConfig = component2.component[component];
            elementConfig.methods.inputEnter = function(event){
               if(elementConfig.isShowDialog&&typeof(elementConfig.returnData)=="object"&&typeof(elementConfig.returnData.documentEnterHandler)=='function'){
                  elementConfig.returnData.documentEnterHandler();
               }else{
                  var elementId = $(event.currentTarget).attr('id');
                  this.blur();
                  var formId = $(this.$el).closest('.pt-form-body').attr('id');
                  elementId = elementId.substring(formId.length+1,elementId.length);
                  formId = formId.substring(5,formId.length);
   
                  var elementComponentConfig = NetstarComponent.config[formId].config[elementId];
                  if(elementComponentConfig.type == 'businessSelect'){
                     var vueConfig = NetstarComponent.config[formId].vueConfig[elementId];
                     NetstarComponent.businessSelect.searchByEnter(elementComponentConfig, vueConfig, function(context, data){
                        var plusData = data.plusData;
                        var _config = context.config ? context.config : NetstarComponent.config[formId].config[plusData.componentId];
                        var _vueConfig = context.vueConfig ? context.vueConfig : NetstarComponent.config[formId].vueConfig[plusData.formID];
                        _vueConfig.loadingClass = '';
                        if(data.success){
                           var dataSrc = _config.search.dataSrc;
                           var value = data[dataSrc];
                           if($.isArray(value)&&value.length==1){
                              _vueConfig.setValue(value); // 赋值
                           }
                           var gridId = formId.substring(6,formId.length);
                           NetstarTreeList.queryManager.confirmQuickQueryHandler({gridId:gridId,formId:formId});
                        }
                     });
                  }else if(elementComponentConfig.type == 'business'){
                     var vueConfig = NetstarComponent.config[formId].vueConfig[elementId];
                     NetstarComponent.business.searchByEnter(elementComponentConfig, vueConfig, function(context, data){
                        var plusData = data.plusData;
                        var _config = context.config ? context.config : NetstarComponent.config[formId].config[plusData.componentId];
                        var _vueConfig = context.vueConfig ? context.vueConfig : NetstarComponent.config[formId].vueConfig[plusData.formID];
                        _vueConfig.loadingClass = '';
                        if(data.success){
                           var dataSrc = _config.search.dataSrc;
                           var value = data[dataSrc];
                           if($.isArray(value)&&value.length==1){
                              _vueConfig.setValue(value); // 赋值
                           }
                           var gridId = formId.substring(6,formId.length);
                           NetstarTreeList.queryManager.confirmQuickQueryHandler({gridId:gridId,formId:formId});
                        }
                     });
                  }else{
                     var gridId = formId.substring(6,formId.length);
                     NetstarTreeList.queryManager.confirmQuickQueryHandler({gridId:gridId,formId:formId});
                  }
               }
            }
         }
         NetstarComponent.formComponent.init(component2,formJson);
      },//执行init
      setPositionInit:function(_queryConfig,treeConfig){
         var inputId = 'input-'+_queryConfig.id;
         var html = '<div class="pt-input-group pt-tree-position">'
                     +'<span class="pt-input-group-addon">定位</span>' 
                     +'<input type="text" class="pt-form-control" id="'+inputId+'" ns-containerid="'+treeConfig.containerId+'">'
                     +'<div class="pt-btn-group">'
                        +'<button class="pt-btn pt-btn-default pt-btn-icon" ns-type="tree-position" ns-containerid="'+treeConfig.containerId+'"><i class="icon-search"></i></button>'
                     +'</div>'
                  +'</div>';
         $('#'+_queryConfig.id).html(html);
         function confirmPositionHandler(data){
            var containerId = data.containerId;
            var treeConfig = NetstarTreeList.configs[containerId].treeConfig;
            var ztreeObj = treeConfig.ztreeObj;
            //var selectNodes = ztreeObj.getSelectedNodes();//获取选中节点
            var allNodes = ztreeObj.getNodes();//获取所有节点
            var searchName = $('#'+inputId).val();//当前搜索节点的值
            var nodesList = ztreeObj.transformToArray(allNodes);//把节点并列输出
            var textField = treeConfig.textField;//文本值定义的字段
            var idField = treeConfig.idField;//id值定义的字段
            var searchNodes = [];
            var searchNode = {};
            if(searchName && treeConfig.prevSearch.name === searchName){
               treeConfig.prevSearch.index++;
            }else{
               treeConfig.prevSearch = {
                  name:searchName,
                  index:0
               }
            }
            for(var i=0; i<nodesList.length; i++){
               var nodeName = nodesList[i][textField].toUpperCase();
               searchName = searchName.toUpperCase();
               if(nodeName.indexOf(searchName) > -1){
                   searchNodes.push(nodesList[i]);
               }
            }
            if(searchNodes.length === 0){
               treeConfig.prevSearch.index = -1;
            }else{
                  searchNode = searchNodes[treeConfig.prevSearch.index];
                  if(searchNodes.length == (treeConfig.prevSearch.index + 1)){
                     treeConfig.prevSearch.index = -1;
                  }
            }
            if(!$.isEmptyObject(searchNode)){
               //设置打开状态
               NetstarTreeList.ztreeManager.setOpenByNodeId(nodesList,searchNode[idField],treeConfig);
               //var nodes = ztreeObj.getNodesByParamFuzzy(idField, searchNode[idField], null);
               //if (nodes.length>0) {
                // ztreeObj.selectNode(nodes[0]);
              // }
               treeConfig.dataSource = allNodes;
               NetstarTreeList.ztreeManager.refreshZtree(treeConfig,searchNode);//初始化
            }else{
               nsAlert('没有查询到结果','warning');
               console.warn('没有查询到结果');
            }
         }
         $('#'+inputId).on('keyup',function(ev){
            var $this = $(this);
            var cid = $this.attr('ns-containerid');
            var data = {containerId:cid};
            if(ev.keyCode == 13){
               confirmPositionHandler(data);
            }
         });
         $('#'+_queryConfig.id+' button[ns-type="tree-position"]').on('click',function(ev){
            var $this = $(this);
            var cid = $this.attr('ns-containerid');
            var data = {containerId:cid};
            confirmPositionHandler(data);
         });
      },
      init:function(treeConfig,_queryConfig){
         var $container = treeConfig.$container;
         $container.prepend(this.getHtml(_queryConfig));//输出容器
         this.setPositionInit(_queryConfig,treeConfig);
         //this.queryInit(_queryConfig);//执行init初始化
      }
   },//快速查询的配置参数
   init:function(_config){
      if($('#'+_config.container).length == 0){
         //没有容器无法输出内容
         return;
      }
      $('#'+_config.container).parent().css('width','420px');
      var treeConfig = this.configManager.getTreeConfig(_config); //设置tree配置参数
      this.configs[_config.container] = {
         config:_config,//入参的配置参数
         original:$.extend(true,{},treeConfig),//存储原始值
         treeConfig:treeConfig,//运行中的树配置参数
      };
      treeConfig.$container.html(this.configManager.getTreeHtml(treeConfig));//输出树容器
      this.queryManager.init(treeConfig,_config.queryConfig);//快速查询配置参数
      this.ztreeManager.init(treeConfig);//调用树初始化
   }
}